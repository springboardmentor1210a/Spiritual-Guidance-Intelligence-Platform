# Palmistry And Tarot Intelligence Platform

An AI-powered web platform that brings palm reading, tarot reading, personalized insights, spiritual guidance, and expert consultations together in one place.

## Project Overview

The **Palmistry & Tarot Intelligence Platform** is a full-stack web application designed to provide users with an interactive spiritual reading and guidance experience. It combines palm image analysis, tarot card interpretations, personalized recommendations, reading history, notifications, and expert consultation features.

The platform supports multiple user roles with separate dashboards and role-based access control. Docker Compose is used to run the frontend, backend, and PostgreSQL database.


## User Roles

### 1. User Dashboard
- Register and log in to the platform.
- Capture or upload palm images for readings.
- Explore tarot cards, spreads, and interpretations.
- View life trends, insights, guidance, and recommendations.
- Access previous readings through reading history.
- Receive in-app notifications.
- Request consultations with available experts.

### 2. Tarot Reader Dashboard
- Access a dedicated Tarot Reader workspace.
- Manage incoming tarot-related session requests.
- Manage session availability.
- Review and respond to consultation requests.
- Support scheduled sessions and meeting links where configured.

### 3. Spiritual Consultant Dashboard
- Access a dedicated Spiritual Consultant dashboard.
- Review available client information and trends.
- Provide spiritual guidance and recommendations.
- Manage consultation requests and session availability.
- Review guidance effectiveness and client feedback where implemented.

### 4. Admin Dashboard
- Access the administration console.
- Manage and monitor platform users and activity.
- Oversee platform operations and available analytics.
- Manage announcements and notifications where enabled.

## Main Features

- **Palm Reading:** Upload or capture a palm image and receive a palm-reading interpretation.
- **Tarot Reading:** Explore tarot cards, choose spreads, and view card interpretations.
- **Life Trends:** Present patterns and trends derived from available platform data.
- **Personalized Insights:** Display observations based on available readings and user activity.
- **Guidance:** Provide suggestions for personal reflection and growth.
- **Recommendations:** Present relevant recommendations based on available reading information.
- **Reading History:** Access previously saved readings.
- **Expert Consultations:** Request sessions with Tarot Readers and Spiritual Consultants.
- **Session Availability:** Support expert availability management and scheduled session requests.
- **Notifications:** Provide in-app reminders, updates, and announcements.
- **Authentication and Authorization:** Protect supported endpoints and separate access by user role.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, JavaScript, React Router |
| UI Icons | Lucide React |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT-based authentication and role-based access control |
| API | REST APIs |
| Containerization | Docker |
| Service Orchestration | Docker Compose |

## Architecture

```text
             User / Admin / Experts
                      |
                      v
             React Frontend
                Port 80
                      |
                 HTTP / REST
                      |
                      v
              FastAPI Backend
                Port 8000
                      |
                      v
                SQLAlchemy
                      |
                      v
               PostgreSQL
                 Database

        Docker Compose runs the services
```

The React frontend communicates with the FastAPI backend through REST API endpoints. The backend handles application logic, authentication, and database operations. PostgreSQL stores persistent application data.

## Project Structure

The main project structure is organized as follows. Exact subfolders may vary depending on the current implementation.

```text
PalmistryTarot/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── profiles.py
│   │       ├── readings.py
│   │       ├── intelligence.py
│   │       ├── admin.py
│   │       ├── tarot_reader.py
│   │       ├── consultant.py
│   │       ├── consultations.py
│   │       └── notifications.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```


## Installation and Setup with Docker

### Step 1: Get the project

Clone the repository after publishing it to GitHub:

```bash
git clone https://github.com/springboardmentor1210a/Spiritual-Guidance-Intelligence-Platform.git

cd Spiritual-Guidance-Intelligence-Platform
```

Alternatively, download the ZIP file from GitHub, extract it, and open a terminal in the extracted project folder.

### Step 2: Configure environment variables

Review the backend, frontend, and Docker Compose configuration files.

Create the required environment files using the variable names expected by the project. Configure database credentials, authentication secrets, and any external API keys required by the enabled features.

**Security:** Never commit real `.env` files, passwords, JWT signing secrets, API keys, or private credentials to GitHub. Provide an `.env.example` file containing placeholders instead.

### Step 3: Build and start the application

Run the following command from the folder containing `docker-compose.yml`:

```bash
docker compose up -d --build
```

This builds the images and starts the configured services.

### Step 4: Check running containers

```bash
docker compose ps
```

### Step 5: View backend logs

```bash
docker compose logs --tail=100 backend
```

To follow logs continuously:

```bash
docker compose logs -f backend
```

### Step 6: Open the application

- Frontend: [http://localhost](http://localhost)
- API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

If a service fails to start, inspect its logs and verify that the required environment variables and port mappings are configured correctly.

## Authentication and Security

The platform uses JWT-based authentication to support secure access to protected resources.

The general authentication flow is:

1. A user submits their login credentials.
2. The backend validates the credentials.
3. A JWT is issued after successful authentication.
4. The frontend uses the token when calling protected API endpoints.
5. The backend validates the token and applies the appropriate authorization rules.

Role-based access control separates the capabilities of Users, Tarot Readers, Spiritual Consultants, and Admins.

Security configuration should follow the backend implementation, including appropriate token expiration, password hashing, and protection of sensitive environment variables.

## Database and Persistence

PostgreSQL is used to store application data, such as user information, readings, consultation requests, and other supported platform records.

Docker Compose uses persistent volumes when configured in the project. These allow database data to survive ordinary container recreation.

To stop the services:

```bash
docker compose down
```

To start them again:

```bash
docker compose up -d
```

## Quick Access

When the application is running locally, open the following links:

| Resource | URL |
|---|---|
| Frontend Application | [http://localhost](http://localhost) |
| Backend API | [http://localhost:8000](http://localhost:8000) |
| Interactive API Documentation | [http://localhost:8000/docs](http://localhost:8000/docs) |
| Alternative API Documentation | [http://localhost:8000/redoc](http://localhost:8000/redoc) |

**Note:** These are local development URLs. They work on the computer running the application and are not public deployment links.



## API Testing

Open the interactive Swagger UI:

[http://localhost:8000/docs](http://localhost:8000/docs)

Use it to explore and test the API endpoints exposed by the running backend. Available routes depend on the current application configuration.

