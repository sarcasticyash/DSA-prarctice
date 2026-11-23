@echo off
echo ========================================
echo   Striver A2Z DSA - GitHub Setup
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Git initialize kar raha hai...
git init

echo.
echo [2/5] Git user config check kar raha hai...
git config user.name >nul 2>&1 || git config user.name "sarcasticyash"
git config user.email >nul 2>&1 || git config user.email "singh@example.com"

echo.
echo [3/5] GitHub remote add kar raha hai...
git remote remove origin 2>nul
git remote add origin https://github.com/sarcasticyash/DSA-prarctice.git

echo.
echo [4/5] GitHub se existing files pull kar raha hai (conflict avoid karne ke liye)...
git fetch origin
git branch -M main
git pull origin main --allow-unrelated-histories --no-edit

echo.
echo [5/5] Saare local files add karke push kar raha hai...
git add .
git commit -m "Setup: Striver A2Z DSA complete folder structure + Pattern Questions"
git push -u origin main

echo.
echo ========================================
echo   Setup Complete! GitHub pe check karo
echo   https://github.com/sarcasticyash/DSA-prarctice
echo ========================================
pause
