# Palmistry & Tarot Intelligence Platform

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

## How It Works

### 1. User Authentication

Users register or log in to access the platform. Authentication and role-based permissions control access to supported features.

### 2. Palm and Tarot Readings

Users upload palm images for analysis or explore tarot cards and reading options. The frontend communicates with the backend to process requests and retrieve available interpretations.

### 3. Personalized Insights and Guidance

Reading information is used by the platform's supported intelligence and guidance workflows to present insights, trends, and recommendations.

### 4. Expert Consultations

Users can access consultation workflows to request guidance from Tarot Readers or Spiritual Consultants. Dedicated dashboards support expert-side activities.

### 5. Data Management

The FastAPI backend handles application logic and API requests, while PostgreSQL stores supported application data. SQLAlchemy manages database interactions.

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
           Users / Admin / Experts
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

## Project Links
- **Project Report:** [Report.pdf](Report.pdf)
- **Project Presentation:** [Palm&Tarot.pptx](Palm%26Tarot.pptx)


---

**Palmistry & Tarot Intelligence Platform**  
*Bringing traditional readings and modern technology together.*