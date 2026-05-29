#!/usr/bin/env bash
# ==============================================================================
# Install auto-deploy: a systemd timer that runs update.sh every few minutes,
# so every push to GitHub goes live automatically. Run once as root on the VPS.
#
#   bash infra/install-autodeploy.sh [interval_minutes]   # default 5
#
# Manage afterwards:
#   systemctl status aitools-deploy.timer
#   journalctl -u aitools-deploy.service -f
#   tail -f /var/log/aitools-deploy.log
#   systemctl disable --now aitools-deploy.timer          # stop auto-deploy
# ==============================================================================
set -euo pipefail

INTERVAL="${1:-5}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG="/var/log/aitools-deploy.log"

[ "$(id -u)" -eq 0 ] || { echo "Run as root"; exit 1; }
[ -f "$APP_DIR/update.sh" ] || { echo "update.sh not found in $APP_DIR"; exit 1; }

echo "Installing auto-deploy: every ${INTERVAL} min, dir $APP_DIR"

cat > /etc/systemd/system/aitools-deploy.service <<UNIT
[Unit]
Description=AI Tools Hub auto-deploy (pull + redeploy on change)
After=docker.service network-online.target
Wants=docker.service

[Service]
Type=oneshot
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/env bash $APP_DIR/update.sh
StandardOutput=append:$LOG
StandardError=append:$LOG
UNIT

cat > /etc/systemd/system/aitools-deploy.timer <<UNIT
[Unit]
Description=Run AI Tools Hub auto-deploy every ${INTERVAL} min

[Timer]
OnBootSec=2min
OnUnitActiveSec=${INTERVAL}min
Unit=aitools-deploy.service

[Install]
WantedBy=timers.target
UNIT

touch "$LOG"
systemctl daemon-reload
systemctl enable --now aitools-deploy.timer

echo "Done. Auto-deploy active."
systemctl status aitools-deploy.timer --no-pager | head -6 || true
echo "Logs: tail -f $LOG"
