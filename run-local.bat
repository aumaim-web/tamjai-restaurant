@echo off
rem run-local.bat - double-click to open the website on this computer at http://localhost:5000
rem (uses the real Firebase database; edit code, then refresh the browser to see changes)
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install the LTS version from https://nodejs.org and run this file again.
  pause
  exit /b 1
)
start "" http://localhost:5000
node tools\serve.js 5000
pause
