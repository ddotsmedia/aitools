@echo off
REM ============================================================================
REM  AI Tools Hub - one-click deploy from Windows.
REM  Commits + pushes to GitHub, then triggers the VPS to pull & redeploy.
REM
REM  Usage:
REM     deploy.bat                       (prompts for a commit message)
REM     deploy.bat "feat: compare page"  (uses given message)
REM
REM  Edit the CONFIG below once (or set env vars DEPLOY_HOST / DEPLOY_USER).
REM  If DEPLOY_HOST is left blank, the script only pushes; the VPS auto-deploy
REM  timer (infra/install-autodeploy.sh) then applies it within a few minutes.
REM ============================================================================
setlocal enabledelayedexpansion

REM ---- CONFIG -----------------------------------------------------------------
REM Put your VPS IP in the quotes below, e.g.  set "DEPLOY_HOST=203.0.113.10"
if not defined DEPLOY_HOST set "DEPLOY_HOST="
if not defined DEPLOY_USER set "DEPLOY_USER=root"
set "APP_DIR=/opt/aitools"
set "BRANCH=main"
REM -----------------------------------------------------------------------------

cd /d "%~dp0"

REM ---- commit message ----------------------------------------------------------
set "MSG=%~1"
if "%MSG%"=="" (
  set /p "MSG=Commit message: "
)
if "%MSG%"=="" set "MSG=chore: update"

echo.
echo === [1/3] Commit ===
git add -A
git commit -m "%MSG%"
if errorlevel 1 echo    (nothing to commit - continuing)

echo.
echo === [2/3] Push %BRANCH% ===
git push origin %BRANCH%
if errorlevel 1 (
  echo PUSH FAILED. Fix the error above and retry.
  pause
  exit /b 1
)
echo    Pushed.

echo.
echo === [3/3] Deploy ===
if "%DEPLOY_HOST%"=="" (
  echo    No DEPLOY_HOST set - skipping remote trigger.
  echo    The VPS auto-deploy timer will apply this push automatically,
  echo    or run on the VPS:  cd %APP_DIR% ^&^& bash update.sh --force
) else (
  echo    Triggering deploy on %DEPLOY_USER%@%DEPLOY_HOST% ...
  ssh %DEPLOY_USER%@%DEPLOY_HOST% "cd %APP_DIR% && bash update.sh --force"
  if errorlevel 1 (
    echo REMOTE DEPLOY FAILED. Check SSH access / VPS logs.
    pause
    exit /b 1
  )
  echo    Deployed.
)

echo.
echo === DONE ===
pause
endlocal
