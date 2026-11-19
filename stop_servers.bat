@echo off
echo ========================================================
echo Stopping all running R and Frontend servers...
echo ========================================================

:: Free port 8000 (R Plumber)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Stopping process on port 8000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

:: Free port 3000 (React / Vite)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Stopping process on port 3000 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo Done. All servers stopped.
timeout /t 2 >nul

