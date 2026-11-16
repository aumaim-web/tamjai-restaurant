@echo off
rem deploy.bat - double-click to publish the website + Firestore rules to https://tamjaifood230.web.app
rem (the real work and the Thai messages are in tools\deploy.js)
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install the LTS version from https://nodejs.org and run this file again.
  pause
  exit /b 1
)
node tools\deploy.js %*
pause
