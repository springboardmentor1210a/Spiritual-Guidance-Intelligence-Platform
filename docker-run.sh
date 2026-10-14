#!/usr/bin/env bash
# =====================================================================
# AI Palmistry & Tarot Intelligence Platform - Docker Deployment (Linux/macOS)
# =====================================================================

set -e

echo "====================================================================="
echo " AI Palmistry & Tarot Intelligence Platform - Docker Deployment"
echo "====================================================================="
echo ""

if ! command -v docker &> /dev/null; then
    echo "[!] Error: Docker is not installed or not in PATH."
    exit 1
fi

echo "[*] Building and starting container in background..."
docker compose up --build -d

echo ""
echo "[OK] Platform successfully deployed in Docker!"
echo "[URL] Web Application: http://localhost:8000"
echo "[API] API Documentation: http://localhost:8000/docs"
echo ""
echo "To view live logs:  docker compose logs -f"
echo "To stop container:  docker compose down"
