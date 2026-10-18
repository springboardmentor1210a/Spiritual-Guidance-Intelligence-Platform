# 🔮 Palmistry & Tarot Intelligence Platform

An AI-powered, full-stack web application that combines **palmistry analysis, interactive tarot readings, personalized insights, and expert consultations** in one platform.

Built using modern web technologies, computer vision, machine learning, and cloud services, the platform provides an interactive experience for users, tarot readers, spiritual consultants, and administrators.

## ✨ Features

### 🖐️ Palmistry Analysis
- Upload palm images for computer-vision-assisted analysis.
- Integrate MediaPipe Hands for hand landmark detection.
- Use YOLOv8 for palm-line detection.
- Analyze major palm-line categories, including heart, head, life, and fate lines.
- View analysis results and access saved reading history.

### 🃏 Interactive Tarot Readings
- Digital deck featuring 78 tarot cards.
- Multiple tarot spread types.
- Interactive card selection and interpretations.
- Persistent reading history for future reference.

### 📊 Insights & Reports
- Personalized insights and recommendations.
- Interactive charts and reading analytics.
- Export reports using PDF and spreadsheet utilities.
- Access previous palmistry and tarot readings.

### 👥 Expert Consultations
- Browse tarot readers and spiritual consultants.
- View expert profiles and specialties.
- Submit consultation and guidance requests.
- Manage session requests and schedules.
- Support client–expert communication.

### 💬 Real-Time Communication
- Live chat between authorized users and experts.
- Real-time notifications and unread badges.
- Administrator announcements.

### 🔐 Authentication & User Management
- Firebase Authentication.
- Role-based dashboards and protected routes.
- Four application roles: User, Tarot Reader, Spiritual Consultant, and Administrator.
- Cloud-based storage of user profiles, reading histories, consultations, and notifications.
- Private client session notes.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Routing | React Router DOM |
| Icons | Lucide React |
| Charts | Chart.js, react-chartjs-2 |
| Backend | Node.js, Express.js |
| Authentication | Firebase Authentication |
| Database | Google Cloud Firestore |
| Computer Vision | MediaPipe Hands |
| Machine Learning | Python, YOLOv8 |
| ML API | FastAPI, Uvicorn |
| Reporting | jsPDF, html2canvas, xlsx |
| Web Server | Nginx |
| Containerization | Docker, Docker Compose |

## 🏗️ Architecture

The platform follows a modular, multi-service architecture that separates the user interface, backend application logic, and machine-learning processing.

```text
                 ┌─────────────────────┐
                 │      Frontend       │
                 │   React + Vite      │
                 │       Nginx         │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │      Backend        │
                 │   Node.js + Express │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │     ML Service      │
                 │ Python + FastAPI    │
                 │ MediaPipe + YOLOv8  │
                 └─────────────────────┘

                 Cloud Infrastructure
                 Firebase Authentication
                 Google Cloud Firestore
```

### How It Works

1. Users interact with the React frontend.
2. The Express backend handles application API requests.
3. Palm-analysis requests are forwarded to the Python ML service.
4. The ML service processes palm images using the configured computer-vision pipeline.
5. Firebase Authentication and Firestore support user authentication and persistent application data.
6. Reading histories, consultations, notifications, and insights are presented through the relevant dashboards.

## 🌐 API Overview

The backend provides REST API endpoints for application operations.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/system/status` | System status |
| `GET` | `/api/auth/me` | Authenticated user information |
| `POST` | `/api/palm/analyze` | Palm-image analysis |
| `GET` | `/api/readings` | Retrieve readings |
| `POST` | `/api/readings` | Create a reading |
| `GET` | `/api/sessions` | Retrieve session information |
| `GET` | `/api/consultations` | Retrieve consultations |
| `POST` | `/api/consultations` | Create a consultation |
| `POST` | `/api/guidance-requests` | Submit a guidance request |

*Refer to the implementation for the exact request formats, authentication requirements, and supported operations.*

## 🗄️ Database

The application uses **Google Cloud Firestore**, a cloud-based NoSQL database, for persistent storage and real-time synchronization.

Key collections and document paths include:

- `users` — User profiles and roles.
- `users/{userId}/tarot_readings` — Tarot reading history.
- `users/{userId}/palm_readings` — Palm analysis history.
- `users/{userId}/session_notes` — Private client notes.
- `users/{userId}/notifications` — User notifications.
- `consultations` — Consultation requests and session information.
- `chats` — Chat conversations and messages.
- `system_announcements` — Administrator announcements.

Firestore Security Rules and backend authorization checks are essential for protecting user information and restricting access to authorized participants.

## 🐳 Docker Support

Docker Compose orchestrates the application's three core services:

- **Frontend:** React application served through Nginx.
- **Backend:** Node.js and Express API.
- **ML Service:** Python-based palm-analysis service using FastAPI.

Firebase Authentication and Firestore remain managed cloud services.

### Run Locally

**Prerequisites:** Docker Desktop and Docker Compose.

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Configure the required environment variables using the project's environment configuration, then start the services:

```bash
docker compose up --build -d
```

Check the running services:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop the services:

```bash
docker compose down
```

The default local frontend URL is `http://localhost` when port 80 is mapped as described in the Docker configuration.

## 🔒 Security

- Firebase Authentication for user identity.
- Role-based access controls for application features.
- Firestore Security Rules for data protection.
- Private session notes and user-specific reading histories.
- Environment variables for configuration and sensitive credentials.


## ⚠️ Disclaimer

Palmistry and tarot interpretations are intended for entertainment and personal reflection. They are not scientifically validated methods for predicting the future or establishing personality traits. The platform should not replace professional medical, legal, financial, or mental-health advice.

## 👩‍💻 Project Information

**Project:** Palmistry & Tarot Intelligence Platform  
**Program:** Infosys Springboard  
**Mentor:** Ms.Shanmukha Priya
**Domain:** Full-Stack Development, Artificial Intelligence & Computer Vision

This project demonstrates the integration of full-stack web development, computer vision, machine-learning services, cloud database management, authentication, real-time features, and containerized application architecture.
