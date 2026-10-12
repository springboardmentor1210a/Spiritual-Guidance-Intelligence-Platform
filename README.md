# AI Palmistry and Tarot Intelligence Platform

An AI-powered web application that combines palm image analysis, tarot readings, and AI-generated interpretations to provide users with personalized spiritual insights.

## Features

- **Palm Analysis:** Analyzes uploaded palm images using computer vision and machine learning.
- **Tarot Reading:** Provides tarot card readings using a digital tarot deck.
- **AI Interpretation:** Generates interpretations based on palm analysis and tarot reading results.
- **Personality Intelligence:** Presents personality-related insights.
- **Reports:** Generates downloadable reports for supported analyses.
- **Web Interface:** Provides a user interface for interacting with the platform.

## Technology Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, FastAPI
- **Machine Learning:** MediaPipe, Ultralytics YOLO, PyTorch
- **Database:** PostgreSQL
- **Deployment:** Docker and Docker Compose

## Project Structure

```text
Spiritual-Guidance-Intelligence-Platform/
├── backend/
│   ├── app/
│   ├── datasets/
│   ├── models/
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Run with Docker

Make sure Docker Desktop is installed and running.

From the project root, run:

```bash
docker compose up --build
```

Once the services start, open:

- **Frontend:** http://localhost:5173
- **Backend API documentation:** http://localhost:8001/docs

To stop the application, run:

```bash
docker compose down
```

## Notes

- Keep API keys and environment variables private.
- Generated reports and the palm-line training dataset are excluded from Git tracking.
- Required model files and Tarot card assets should be present for the corresponding features to work.

## Disclaimer

Palmistry and tarot interpretations are intended for entertainment and personal reflection. They should not be treated as scientific predictions or professional advice.