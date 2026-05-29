<#
.SYNOPSIS
  One-command release from Windows: validate -> commit/push -> remote deploy.

.DESCRIPTION
  Runs local typecheck/lint/build, pushes the branch, then SSHes to the VPS and
  runs deploy.sh there (which pulls, builds images, migrates, seeds, restarts).

.PARAMETER VpsHost   SSH host/IP of the VPS (or set $env:DEPLOY_HOST).
.PARAMETER VpsUser   SSH user (default: root, or $env:DEPLOY_USER).
.PARAMETER AppDir    Repo dir on the VPS (default: /opt/ai-tools-hub).
.PARAMETER Branch    Git branch to deploy (default: main).
.PARAMETER Message   Commit message; if set, stages+commits before pushing.
.PARAMETER SkipChecks  Skip local typecheck/lint/build.
.PARAMETER Seed        Pass --seed to remote deploy (force re-seed).

.EXAMPLE
  ./deploy.ps1 -VpsHost 1.2.3.4 -Message "feat: new compare page"
.EXAMPLE
  $env:DEPLOY_HOST="1.2.3.4"; ./deploy.ps1        # uses env, no commit
#>
[CmdletBinding()]
param(
  [string]$VpsHost = $env:DEPLOY_HOST,
  [string]$VpsUser = $(if ($env:DEPLOY_USER) { $env:DEPLOY_USER } else { "root" }),
  [string]$AppDir  = "/opt/ai-tools-hub",
  [string]$Branch  = "main",
  [string]$Message,
  [switch]$SkipChecks,
  [switch]$Seed
)

$ErrorActionPreference = "Stop"
function Info($m) { Write-Host "[deploy] $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "OK  $m"      -ForegroundColor Green }
function Die($m)  { Write-Host "FATAL: $m"   -ForegroundColor Red; exit 1 }

Set-Location $PSScriptRoot

# 1. Local validation
if (-not $SkipChecks) {
  Info "Local checks: typecheck -> lint -> build"
  pnpm typecheck; if ($LASTEXITCODE) { Die "typecheck failed" }
  pnpm lint;      if ($LASTEXITCODE) { Die "lint failed" }
  pnpm build;     if ($LASTEXITCODE) { Die "build failed" }
  Ok "Local checks passed"
} else {
  Info "Skipping local checks"
}

# 2. Commit (optional) + push
if ($Message) {
  Info "Committing: $Message"
  git add -A
  git commit -m $Message
}
Info "Pushing $Branch"
git push origin $Branch
if ($LASTEXITCODE) { Die "git push failed" }
Ok "Pushed"

# 3. Remote deploy over SSH
if (-not $VpsHost) {
  Info "No VpsHost set — code pushed. Run on the VPS:  bash deploy.sh"
  Ok "Done (push-only)"
  return
}

$seedFlag = if ($Seed) { "--seed" } else { "" }
$remote = "cd $AppDir && bash deploy.sh --branch $Branch $seedFlag"
Info "Remote deploy: $VpsUser@$VpsHost -> $remote"
ssh "$VpsUser@$VpsHost" $remote
if ($LASTEXITCODE) { Die "remote deploy failed" }
Ok "Deployed to $VpsHost"
