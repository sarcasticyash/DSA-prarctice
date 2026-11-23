@echo off
echo ========================================
echo   Daily Push to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Kya solve kiya aaj? (Commit message likho):
set /p msg="Message: "

git add .
git commit -m "%msg%"
git push

echo.
echo ========================================
echo   Push ho gaya! 
echo   https://github.com/sarcasticyash/DSA-prarctice
echo ========================================
pause
