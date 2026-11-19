@echo off
echo ========================================================
echo Starting Real Estate Predictor R Plumber API Backend...
echo ========================================================
where Rscript >nul 2>&1
if %errorlevel% neq 0 (
  for /d %%D in ("%ProgramFiles%\R\R-*") do if exist "%%D\bin\Rscript.exe" set "PATH=%%D\bin;%PATH%"
  for /d %%D in ("%ProgramFiles(x86)%\R\R-*") do if exist "%%D\bin\Rscript.exe" set "PATH=%%D\bin;%PATH%"
  for /d %%D in ("%LOCALAPPDATA%\Programs\R\R-*") do if exist "%%D\bin\Rscript.exe" set "PATH=%%D\bin;%PATH%"
)
Rscript R\run_api.R
if %errorlevel% neq 0 (
  pause
)

