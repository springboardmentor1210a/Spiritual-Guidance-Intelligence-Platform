# AI Palmistry & Tarot Intelligence Platform

A professional, editable full-stack demonstration platform combining palm analysis, interactive tarot reading, AI-inspired personality insights, personalized recommendations, life trends, reading history, PDF reports, and role-based workspaces.

## Included product areas

- Role selection and authentication
- User registration and login
- User workspace: palm reading, tarot reading, AI insights, recommendations, life trends, reports, history and profile
- Tarot Reader workspace: tarot sessions, client readings, reading analytics and report management
- Spiritual Consultant workspace: user trends, AI insights, personalized guidance and consultation support
- Administrator workspace: users, roles, reading data and system information
- Palm visualization for Heart, Life, Head, Fate and Sun lines
- Randomized tarot deck with shuffle and card selection
- PDF report generation
- Responsive purple/lavender UI inspired by the supplied design reference

## Technology

Frontend: React, Vite, Lucide React, CSS
Backend: Python, FastAPI, Uvicorn, ReportLab

## Run locally

### 1. Backend

```powershell
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (new terminal)

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| User | demo@example.com | password |
| Tarot Reader | reader@example.com | password |
| Spiritual Consultant | consultant@example.com | password |
| Administrator | admin@example.com | password |

You can also create a new account from the registration screen. Registered users are stored locally in `backend/data/users.json` and that file is ignored by Git.

## GitHub upload

Create an empty GitHub repository, then from this project folder run:

```powershell
git init
git add .
git commit -m "Initial professional project"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Do not commit `backend/.venv`, `frontend/node_modules`, or `backend/data/users.json`.

## Notes for demonstration

The palm overlay is a visual analysis demonstration and the AI guidance is intended for reflection, not medical, financial, or other professional advice.
