@echo off
echo =====================================================================
echo  AI Palmistry & Tarot Intelligence Platform - Docker Deployment
echo =====================================================================
echo.

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Error: Docker CLI is not found or not in PATH.
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo [*] Checking Docker daemon status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [!] Warning: Docker Desktop daemon is not currently active.
    echo.
    echo Possible causes:
    echo  1. Docker Desktop is not opened yet. Please launch Docker Desktop.
    echo  2. On Windows, Docker Desktop requires WSL 2 (Windows Subsystem for Linux).
    echo     If WSL 2 is not yet installed on this PC:
    echo     - Open PowerShell as Administrator
    echo     - Run:  wsl --install
    echo     - Restart your computer, then re-open Docker Desktop.
    echo.
    echo Attempting to run docker compose up anyway...
    echo.
)

echo [*] Building and launching container with docker compose...
docker compose up --build -d

if %errorlevel% equ 0 (
    echo.
    echo =====================================================================
    echo  [OK] Platform successfully deployed in Docker!
    echo =====================================================================
    echo  [URL] Web Application:   http://localhost:8000
    echo  [API] API Documentation: http://localhost:8000/docs
    echo.
    echo  To view live logs:  docker compose logs -f
    echo  To stop container:  docker compose down
    echo =====================================================================
    echo.
    start http://localhost:8000
) else (
    echo.
    echo [!] Docker compose was unable to complete.
    echo Please ensure Docker Desktop has finished booting up with WSL 2 enabled.
)

echo.
pause
