@echo off
echo ========================================================
echo Real Estate Price Predictor - One-Click Environment Setup
echo ========================================================
echo.

:: Detect Rscript
where Rscript >nul 2>&1
if %errorlevel% neq 0 (
  for /d %%D in ("%ProgramFiles%\R\R-*") do if exist "%%D\bin\Rscript.exe" set "PATH=%%D\bin;%PATH%"
  for /d %%D in ("%ProgramFiles(x86)%\R\R-*") do if exist "%%D\bin\Rscript.exe" set "PATH=%%D\bin;%PATH%"
  for /d %%D in ("%LOCALAPPDATA%\Programs\R\R-*") do if exist "%%D\bin\Rscript.exe" set "PATH=%%D\bin;%PATH%"
)

where Rscript >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] R is not detected on your system.
  echo Please install R from https://cran.r-project.org/bin/windows/base/
  echo and ensure Rscript is in your PATH.
  pause
  exit /b 1
)

echo [1/2] Installing required R packages (dplyr, caret, randomForest, plumber, etc.)...
Rscript setup.R
if %errorlevel% neq 0 (
  echo [WARNING] There was an issue installing some R packages.
)

echo.
echo [2/2] Installing Frontend Node dependencies...
where npm >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js / npm is not detected on your system.
  echo Please install Node.js from https://nodejs.org/
  pause
  exit /b 1
)

cd frontend
call npm install
cd ..

echo.
echo ========================================================
echo Setup Complete!
echo You can now start both servers with:
echo    restart_servers.bat
echo ========================================================
pause
