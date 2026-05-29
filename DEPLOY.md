# Deployment

Fully automated, idempotent deploy. Three scripts:

| Script | Where | Purpose |
|--------|-------|---------|
| `infra/bootstrap.sh` | VPS, once | Install Docker/Nginx/Certbot, clone repo, scaffold env + nginx |
| `deploy.sh` | VPS, every update | Pull → build → migrate → seed-if-empty → restart → health-check |
| `update.sh` | VPS | Smart updater — redeploys ONLY when origin has new commits |
| `infra/install-autodeploy.sh` | VPS, once | Install systemd timer → auto-deploy every push |
| `deploy.ps1` | Windows dev | Validate → push → SSH-run `deploy.sh` on the VPS |

## Fully automatic deploy (set-and-forget)

Make every `git push` go live on its own — no manual step:

```bash
# on the VPS, once (after the stack is already deployed)
cd /opt/aitools
bash infra/install-autodeploy.sh 5        # check + redeploy every 5 minutes
```

A systemd timer runs `update.sh`, which fetches `origin/main`, and **only when there
are new commits** runs the full `deploy.sh`. Idempotent, logged, single-flight.

```bash
systemctl status aitools-deploy.timer       # is it active?
journalctl -u aitools-deploy.service -f     # live run output
tail -f /var/log/aitools-deploy.log         # deploy history
systemctl disable --now aitools-deploy.timer  # turn auto-deploy off
```

Run it once by hand any time: `bash update.sh` (or `bash update.sh --force`).

## First-time VPS setup

```bash
# on the VPS, as root
curl -fsSL <raw-url>/infra/bootstrap.sh | bash -s -- <git-repo-url> aitoolshub.yourdomain.com
nano /opt/ai-tools-hub/.env.production          # fill all CHANGE_ME values
certbot --nginx -d aitoolshub.yourdomain.com    # HTTPS
cd /opt/ai-tools-hub && bash deploy.sh
```

## Every update (two options)

**A — from the VPS:**
```bash
cd /opt/ai-tools-hub && bash deploy.sh
```

**B — from Windows (one command):**
```powershell
$env:DEPLOY_HOST = "1.2.3.4"
./deploy.ps1 -Message "feat: compare page"      # validates, commits, pushes, deploys
```

## `deploy.sh` flags

| Flag | Effect |
|------|--------|
| `--no-pull` | Don't `git pull` (deploy current checkout) |
| `--no-build` | Restart without rebuilding (config-only changes) |
| `--seed` | Force re-seed (idempotent upserts) |
| `--branch X` | Deploy a branch other than `main` |

## What it guarantees

- Refuses to run if `.env.production` is missing or still has `CHANGE_ME`.
- One deploy at a time (file lock).
- Waits for Postgres health before touching the schema.
- Ensures the `pgvector` extension, then `prisma db push` (no migrations dir).
- Seeds catalog only when the DB is empty (or `--seed`).
- Aborts before restarting apps if the schema sync fails.
- Prints a rollback command (`git reset --hard <prev> && bash deploy.sh --no-pull`).

## Ports (prod)

web `3020` (public via Nginx) · api `4020` · ai `8020` · pg `5442` · redis `6383` · meili `7720`.
All bound to `127.0.0.1` except web; Nginx terminates TLS and proxies `/` → web, `/api/` → api.

## Notes

- `NEXT_PUBLIC_*` are baked into the web client bundle at **build** time — they come
  from `.env.production` via compose `build.args`, so changing the domain requires a rebuild.
- `ANTHROPIC_API_KEY` enables real Haiku enrichment/embeddings; without it the AI
  service falls back to heuristics (deploy still succeeds).
