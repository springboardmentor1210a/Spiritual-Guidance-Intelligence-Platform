# 🔮 Mystic Insights — Palmistry & Tarot Intelligence Platform

An end-to-end full-stack spiritual intelligence portal combining **Computer Vision**, **Tarot Archetype Engines**, and a **Multi-Factor Guidance Scoring Algorithm** with a celestial React UI.

---

## 🌟 Core Features

- **Identity & Session Management:** Stateless JWT authentication, bcrypt password hashing, and OAuth2 Bearer token flows.
- **User Profiling & Personalization:** Relational user profiles capturing archetypes, focus areas, and spiritual goals.
- **Interactive Tarot Engine:** Multi-spread generator (1-Card Daily, 3-Card Timeline, Relationship, Career) with interactive 3D card flip animations and archetype interpretations.
- **Computer Vision Palmistry:** Image processing pipeline using OpenCV to extract palm structural features, line density, and hand archetypes.
- **Multi-Factor Guidance Scoring:** Algorithmic synthesis engine calculating alignment across 5 weighted dimensions:
  - Palm Confidence (30%)
  - Tarot Relevance (25%)
  - Personality Alignment (20%)
  - User Context (15%)
  - Reading Consistency (10%)
- **Reading History & Persistence:** Chronological reading logs stored in SQLite / PostgreSQL with instant retrieval.
- **Automated PDF Export:** Streaming PDF report generation powered by ReportLab for downloadable synthesis summaries.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Styling:** Custom Celestial Glassmorphic CSS with canvas starfields & nebula glows
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python 3.9+)
- **Security:** Python-Jose (JWT), Passlib (Bcrypt)
- **ORM / Database:** SQLAlchemy, SQLite / PostgreSQL (async-ready)
- **Computer Vision:** OpenCV (`opencv-python-headless`), NumPy
- **Document Generation:** ReportLab
- **Server:** Uvicorn (ASGI)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.9+ installed
- Node.js 18+ and npm installed

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload --port 8000