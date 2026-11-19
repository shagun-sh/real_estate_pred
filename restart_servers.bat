@echo off
echo ========================================================
echo Restarting R Plumber API and React Frontend...
echo ========================================================

:: 1. Stop existing servers
call stop_servers.bat

echo Starting R Plumber API in new window...
start "R Plumber API (Port 8000)" cmd /k "run_api.bat"

echo Starting React Frontend in new window...
start "React Dashboard (Port 3000)" cmd /k "run_frontend.bat"

echo.
echo Both servers have been restarted!
echo Frontend: http://localhost:3000
echo R API:    http://127.0.0.1:8000
echo ========================================================
timeout /t 3 >nul

