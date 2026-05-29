#!/usr/bin/env bash
# ==============================================================================
# First-time VPS bootstrap for AI Tools Hub (Ubuntu/Debian).
# Installs Docker, Nginx, Certbot; clones the repo; prepares .env.production.
# Run once as root:   bash bootstrap.sh <git-repo-url> [domain]
# Then edit .env.production and run:   cd /opt/ai-tools-hub && bash deploy.sh
# ==============================================================================
set -euo pipefail

REPO_URL="${1:?Usage: bootstrap.sh <git-repo-url> [domain]}"
DOMAIN="${2:-aitoolshub.example.com}"
APP_DIR="/opt/ai-tools-hub"

info() { echo -e "\033[0;36m[bootstrap]\033[0m $*"; }

[ "$(id -u)" -eq 0 ] || { echo "Run as root"; exit 1; }

info "Updating apt + base packages…"
apt-get update -y
apt-get install -y ca-certificates curl git ufw nginx

# ── Docker (official convenience script) ──────────────────────────────────────
if ! command -v docker >/dev/null; then
  info "Installing Docker…"
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

# ── Certbot (snap) ────────────────────────────────────────────────────────────
if ! command -v certbot >/dev/null; then
  info "Installing Certbot…"
  apt-get install -y snapd
  snap install core && snap refresh core
  snap install --classic certbot
  ln -sf /snap/bin/certbot /usr/bin/certbot
fi

# ── Firewall ──────────────────────────────────────────────────────────────────
info "Configuring firewall…"
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
ufw --force enable || true

# ── Clone / update repo ───────────────────────────────────────────────────────
if [ -d "$APP_DIR/.git" ]; then
  info "Repo exists — pulling…"
  git -C "$APP_DIR" pull --ff-only
else
  info "Cloning repo…"
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

# ── Env file ──────────────────────────────────────────────────────────────────
if [ ! -f .env.production ]; then
  cp .env.production.example .env.production
  info "Created .env.production — EDIT IT (fill CHANGE_ME) before deploying."
fi

# ── Nginx reverse proxy ───────────────────────────────────────────────────────
info "Installing Nginx site for $DOMAIN…"
sed "s/aitoolshub.example.com/$DOMAIN/g" infra/nginx/ai-tools-hub.conf \
  > /etc/nginx/sites-available/ai-tools-hub.conf
ln -sf /etc/nginx/sites-available/ai-tools-hub.conf /etc/nginx/sites-enabled/ai-tools-hub.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

cat <<NEXT

──────────────────────────────────────────────────────────────
 Bootstrap done. Next steps:
   1. nano $APP_DIR/.env.production       # fill in CHANGE_ME values
   2. certbot --nginx -d $DOMAIN          # issue HTTPS cert
   3. cd $APP_DIR && bash deploy.sh       # build + deploy
──────────────────────────────────────────────────────────────
NEXT
