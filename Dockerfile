# ==============================================================================
# Dockerfile: AI Palmistry & Tarot Intelligence Platform
# Production-grade Python 3.11 container with automated healthcheck & persistence
# ==============================================================================

FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

# Set working directory
WORKDIR /app

# Install system libraries needed for compilation, images, and health checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy platform source code
COPY . .

# Ensure data and upload directories exist
RUN mkdir -p /app/data/uploads /app/data/exports /app/data/ml_models

# Expose platform port
EXPOSE 8000

# Health check to ensure FastAPI is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/docs || exit 1

# Start FastAPI server
CMD ["python", "run.py"]
