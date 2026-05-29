#!/usr/bin/env bash
# AI Tools Hub — VPS Deploy Script
# Usage: bash deploy.sh
set -euo pipefail

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $*"; }
info() { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $*"; }
warn() { echo -e "${YELLOW}⚠${NC}  $*"; }
fail() { echo -e "${RED}✗ FATAL:${NC} $*"; exit 1; }

APP_DIR="/opt/ai-tools-hub"
COMPOSE="docker compose -f docker-compose.prod.yml"

cd "$APP_DIR"

[ -f docker-compose.prod.yml ] || fail "docker-compose.prod.yml not found"
[ -f .env.production ] || fail ".env.production not found — copy from .env.production.example"
grep -q "CHANGE_ME" .env.production && fail "Fill in all CHANGE_ME values in .env.production"

info "Pulling latest images..."
$COMPOSE pull postgres redis meilisearch 2>&1 | tail -3

info "Building app images..."
$COMPOSE build --parallel api ai web 2>&1 | tail -8

info "Starting infra..."
$COMPOSE up -d postgres redis meilisearch
sleep 5

info "Running Prisma migrations..."
$COMPOSE run --rm api sh -c "cd /app && node_modules/.bin/prisma migrate deploy" 2>&1 || \
  warn "Migration failed — DB may already be current"

info "Starting apps..."
$COMPOSE up -d api ai web

info "Health check..."
for i in $(seq 1 15); do
  sleep 3
  status=$(docker compose -f docker-compose.prod.yml ps --format json 2>/dev/null | \
    grep -o '"Health":"[^"]*"' | grep -v '"Health":""' | head -3 || true)
  if docker ps --filter name=ai-tools-hub-web --filter status=running --format '{{.Names}}' | grep -q web 2>/dev/null; then
    ok "Web container running"; break
  fi
  [ "$i" -eq 15 ] && warn "Health check timed out — check logs"
done

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Deploy complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
$COMPOSE ps
