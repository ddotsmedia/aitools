#!/usr/bin/env bash
# ==============================================================================
# AI Tools Hub — fully automated deploy. Safe to re-run for every update.
#
# Run on the VPS, from the repo dir (default /opt/ai-tools-hub):
#     bash deploy.sh
#
# What it does (idempotent):
#   1. git pull (latest code)                  -> skip with --no-pull
#   2. validate .env.production (no CHANGE_ME)
#   3. build app images (BuildKit cache)
#   4. start infra, wait until healthy
#   5. ensure pgvector extension
#   6. sync schema (prisma db push)            -> no migrations dir in this repo
#   7. seed taxonomy+tools IF database empty    -> force with --seed
#   8. start apps, wait until healthy
#   9. prune dangling images
#  10. health-check every service, summarise
#
# Flags:  --no-pull   skip git pull
#         --seed      force re-seed (idempotent upserts)
#         --no-build  restart without rebuilding (config-only changes)
#         --branch X  git branch to deploy (default: main)
# ==============================================================================
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
# Default to the directory this script lives in — works wherever the repo is cloned.
APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BRANCH="main"
DO_PULL=1; DO_BUILD=1; FORCE_SEED=0
LOCK="/tmp/ai-tools-hub-deploy.lock"

while [ $# -gt 0 ]; do
  case "$1" in
    --no-pull)  DO_PULL=0 ;;
    --no-build) DO_BUILD=0 ;;
    --seed)     FORCE_SEED=1 ;;
    --branch)   BRANCH="$2"; shift ;;
    *) echo "Unknown flag: $1"; exit 2 ;;
  esac
  shift
done

# ── Pretty output ─────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $*"; }
info() { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC}  $*"; }
fail() { echo -e "${RED}✗ FATAL:${NC} $*"; exit 1; }

export DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1

# ── Preconditions ─────────────────────────────────────────────────────────────
command -v docker >/dev/null || fail "docker not installed"
docker compose version >/dev/null 2>&1 || fail "docker compose v2 required"

cd "$APP_DIR" 2>/dev/null || fail "APP_DIR not found: $APP_DIR"
[ -f "$COMPOSE_FILE" ] || fail "$COMPOSE_FILE not found in $APP_DIR"
[ -f "$ENV_FILE" ] || fail "$ENV_FILE not found — copy from .env.production.example and fill it in"
grep -q "CHANGE_ME" "$ENV_FILE" && fail "Fill in all CHANGE_ME values in $ENV_FILE"

# Single deploy at a time
exec 9>"$LOCK"
flock -n 9 || fail "Another deploy is already running (lock: $LOCK)"

COMPOSE="docker compose -f $COMPOSE_FILE --env-file $ENV_FILE"
# shellcheck disable=SC1090
set -a; . "./$ENV_FILE"; set +a

PREV_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

# ── 1. Pull latest code ───────────────────────────────────────────────────────
if [ "$DO_PULL" -eq 1 ] && [ -d .git ]; then
  info "Pulling latest code ($BRANCH)…"
  git fetch --quiet origin "$BRANCH"
  git checkout --quiet "$BRANCH"
  git reset --hard --quiet "origin/$BRANCH"
  NEW_SHA="$(git rev-parse --short HEAD)"
  ok "Code at $NEW_SHA (was $PREV_SHA)"
else
  warn "Skipping git pull"
fi

# ── 2. Build images ───────────────────────────────────────────────────────────
if [ "$DO_BUILD" -eq 1 ]; then
  info "Building app images (api, ai, web)…"
  $COMPOSE build api ai web
  ok "Images built"
else
  warn "Skipping build"
fi

# ── 3. Infra up + wait healthy ────────────────────────────────────────────────
info "Starting infra (postgres, redis, meilisearch)…"
$COMPOSE up -d postgres redis meilisearch

wait_healthy() {
  local svc="$1" tries="${2:-30}" i
  for i in $(seq 1 "$tries"); do
    local cid; cid="$($COMPOSE ps -q "$svc" 2>/dev/null)"
    [ -n "$cid" ] || { sleep 2; continue; }
    local h; h="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$cid" 2>/dev/null || echo none)"
    case "$h" in
      healthy) return 0 ;;
      none)    docker inspect -f '{{.State.Running}}' "$cid" | grep -q true && return 0 ;;
    esac
    sleep 2
  done
  return 1
}

wait_healthy postgres 40 && ok "postgres healthy" || fail "postgres did not become healthy"
wait_healthy redis 20 && ok "redis healthy" || warn "redis health unknown"
wait_healthy meilisearch 20 && ok "meilisearch up" || warn "meilisearch health unknown"

# ── 4. pgvector extension ─────────────────────────────────────────────────────
info "Ensuring pgvector extension…"
$COMPOSE exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "CREATE EXTENSION IF NOT EXISTS vector;" >/dev/null && ok "vector extension ready"

# ── 5. Schema sync (db push — repo has no migrations dir) ──────────────────────
info "Syncing database schema…"
if $COMPOSE run --rm --no-deps api \
     pnpm --filter @hub/api exec prisma db push --skip-generate --accept-data-loss; then
  ok "Schema in sync"
else
  fail "Schema sync failed — aborting before app restart"
fi

# ── 6. Seed if empty (or forced) ──────────────────────────────────────────────
TOOL_COUNT="$($COMPOSE exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -tAc 'SELECT count(*) FROM "Tool";' 2>/dev/null | tr -d '[:space:]' || echo 0)"
if [ "$FORCE_SEED" -eq 1 ] || [ "${TOOL_COUNT:-0}" = "0" ]; then
  info "Seeding catalog (current tools: ${TOOL_COUNT:-0})…"
  $COMPOSE run --rm --no-deps api pnpm --filter @hub/api db:seed && ok "Seed complete" \
    || warn "Seed failed — continuing"
else
  ok "Catalog present ($TOOL_COUNT tools) — skipping seed"
fi

# ── 7. Apps up + wait healthy ─────────────────────────────────────────────────
# Some hosts (shared/virtualised runc) deny `docker stop`, so `compose up`
# can't recreate changed containers. Force-replace: kill host PID, rm, recreate.
hard_replace() {
  for svc in "$@"; do
    local cid; cid="$($COMPOSE ps -q "$svc" 2>/dev/null)"
    [ -n "$cid" ] || continue
    docker update --restart=no "$cid" >/dev/null 2>&1 || true
    if ! docker stop -t 10 "$cid" >/dev/null 2>&1; then
      local pid; pid="$(docker inspect -f '{{.State.Pid}}' "$cid" 2>/dev/null || echo 0)"
      [ -n "$pid" ] && [ "$pid" != "0" ] && kill -9 "$pid" 2>/dev/null || true
      sleep 2
    fi
    docker rm -f "$cid" >/dev/null 2>&1 || true
  done
  # remove any renamed leftovers compose created during a failed recreate
  docker ps -a --format '{{.Names}}' \
    | grep -E "_(aitools|ai-tools-hub)-(web|api|ai)-[0-9]+$" \
    | xargs -r docker rm -f >/dev/null 2>&1 || true
}

# Replace api/ai FIRST and wait until healthy, so the (still-running) old web keeps
# serving until the new api is ready — minimises the SSR error window during deploys.
info "Replacing api + ai…"
hard_replace api ai
$COMPOSE up -d api ai
wait_healthy api 30 && ok "api healthy" || warn "api health unknown — check logs"

info "Replacing web…"
hard_replace web
$COMPOSE up -d web
wait_healthy web 20 && ok "web running" || warn "web not confirmed — check logs"

# ── 8. Prune dangling images ──────────────────────────────────────────────────
info "Pruning dangling images…"
docker image prune -f >/dev/null 2>&1 || true

# ── 9. Health summary ─────────────────────────────────────────────────────────
echo ""
info "Endpoint checks:"
check() { # name url
  if $COMPOSE exec -T "$1" sh -c "wget -qO- $2 >/dev/null 2>&1 || curl -fsS $2 >/dev/null 2>&1"; then
    ok "$1 → $2"
  else
    warn "$1 → $2 unreachable"
  fi
}
check api  "http://localhost:4020/tools?take=1"
check ai   "http://localhost:8020/health"
check web  "http://localhost:3020/"

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Deploy complete — $(git rev-parse --short HEAD 2>/dev/null || echo n/a)${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
$COMPOSE ps
echo ""
echo "Rollback if needed:  git reset --hard $PREV_SHA && bash deploy.sh --no-pull"
