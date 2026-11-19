@echo off
echo ========================================================
echo Starting Real Estate Predictor React Dashboard...
echo ========================================================
cd frontend
npm run dev
if %errorlevel% neq 0 (
  pause
)

