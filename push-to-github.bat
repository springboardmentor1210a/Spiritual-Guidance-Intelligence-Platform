@echo off
echo =====================================================================
echo  Publishing Updates to GitHub Repository
echo  https://github.com/ponnarameshkumar099/AI-palmistry-tarot-platform
echo =====================================================================
echo.

set PATH=%PATH%;C:\Users\ponna\AppData\Local\github-copilot-git-2.53.0-3\cmd

echo [*] Staging all files...
git add -A

echo [*] Committing latest changes...
git commit -m "Update Dockerfile, docker-compose.yml, deployment scripts, and UI enhancements"

echo [*] Pushing to GitHub (origin main)...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo =====================================================================
    echo  [OK] Successfully pushed to GitHub!
    echo  View repository: https://github.com/ponnarameshkumar099/AI-palmistry-tarot-platform
    echo =====================================================================
) else (
    echo.
    echo [!] Push requires authentication. Please sign in via the browser or enter your GitHub Personal Access Token.
)

echo.
pause
