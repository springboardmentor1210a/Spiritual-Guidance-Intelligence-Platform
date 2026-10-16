from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.rbac import router as rbac_router
from app.api.profile import router as profile_router
from app.api.reading_preference import router as reading_preference_router
from app.api.spiritual_goal import router as spiritual_goal_router
from app.api.spiritual_interest import router as spiritual_interest_router
from app.api.reading_session import router as reading_session_router
from app.api.tarot import router as tarot_router
from app.api.reading_reports import router as reading_reports_router
from app.api.palm import router as palm_router
from app.api.ai_interpretation import router as ai_interpretation_router
from app.api.milestone3 import router as milestone3_router
from app.api.ai_chat import router as ai_chat_router
from app.api.admin import router as admin_router
from app.api.appointments import (
    router as appointments_router,
    notifications_router,
)
from pathlib import Path
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Palmistry & Tarot Intelligence Platform",
    version="1.0.0",
    description="AI-powered Palmistry and Tarot Intelligence Platform",
)
BASE_DIR = Path(__file__).resolve().parents[1]
UPLOADS_DIR = BASE_DIR / "storage" / "palms"

UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOADS_DIR)),
    name="uploads",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(rbac_router)
app.include_router(profile_router)
app.include_router(reading_preference_router)
app.include_router(spiritual_goal_router)
app.include_router(spiritual_interest_router)
app.include_router(reading_session_router)
app.include_router(tarot_router)
app.include_router(reading_reports_router)
app.include_router(palm_router)
app.include_router(ai_interpretation_router)
app.include_router(milestone3_router)
app.include_router(ai_chat_router)
app.include_router(admin_router)
app.include_router(appointments_router)
app.include_router(notifications_router)



@app.get("/")
def root():
    return {
        "message": "Palmistry & Tarot Intelligence Platform API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
    }