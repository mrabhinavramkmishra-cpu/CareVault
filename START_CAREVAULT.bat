@echo off
setlocal
cd /d "%~dp0backend"
if not exist node_modules (
  echo Installing backend packages...
  call npm install
)
if not exist .env (
  copy .env.example .env >nul
  echo Created backend\.env from .env.example
  echo Please verify the environment values, then run this file again.
  pause
  exit /b
)
start "CareVault Backend" cmd /k "cd /d %~dp0backend && npm start"
start "CareVault Frontend" cmd /k "cd /d %~dp0frontend && python -m http.server 5500"
echo CareVault servers are starting.
echo Open http://localhost:5500
pause
