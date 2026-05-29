#!/usr/bin/env bash
# ==============================================================================
# Smart auto-updater. Redeploys ONLY when origin has new commits.
# Safe to run on a timer (see infra/install-autodeploy.sh) or by hand.
#
#   bash update.sh            # check + deploy if changed
#   bash update.sh --force    # deploy even if no new commits
# ==============================================================================
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"
BRANCH="${BRANCH:-main}"
FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*"; }

[ -d .git ] || { log "Not a git repo: $HERE"; exit 1; }

log "Checking $BRANCH for updates…"
git fetch --quiet origin "$BRANCH"
LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse "origin/$BRANCH")"

if [ "$LOCAL" = "$REMOTE" ] && [ "$FORCE" -eq 0 ]; then
  log "Already up to date ($(git rev-parse --short HEAD)). Nothing to do."
  exit 0
fi

log "New version: ${LOCAL:0:7} → ${REMOTE:0:7}. Deploying…"
# deploy.sh handles pull + build + migrate + seed-if-empty + restart + health.
bash "$HERE/deploy.sh" --branch "$BRANCH"
log "Update complete → $(git rev-parse --short HEAD)"
