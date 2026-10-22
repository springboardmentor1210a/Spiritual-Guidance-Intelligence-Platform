FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements-docker.txt ./

RUN python -m pip install --upgrade pip

# Install CPU-only PyTorch
RUN python -m pip install \
    --index-url https://download.pytorch.org/whl/cpu \
    --timeout 120 \
    --retries 3 \
    torch torchvision

# Install the remaining dependencies
RUN python -m pip install \
    --progress-bar on \
    --timeout 120 \
    --retries 3 \
    -r requirements-docker.txt

COPY . .

RUN mkdir -p uploads generated_reports

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]