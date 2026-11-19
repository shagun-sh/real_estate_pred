@echo off
echo ========================================================
echo Running Full R Preprocessing and ML Training Pipeline...
echo ========================================================
where Rscript >nul 2>&1
if %errorlevel% neq 0 (
  for /d %%D in ("%ProgramFiles%\R\R-*") do if exist "%%D\bin\Rscript.exe" set "PATH=%%D\bin;%PATH%"
  for /d %%D in ("%ProgramFiles(x86)%\R\R-*") do if exist "%%D\bin\Rscript.exe" set "PATH=%%D\bin;%PATH%"
  for /d %%D in ("%LOCALAPPDATA%\Programs\R\R-*") do if exist "%%D\bin\Rscript.exe" set "PATH=%%D\bin;%PATH%"
)
Rscript R\run_pipeline.R
pause

