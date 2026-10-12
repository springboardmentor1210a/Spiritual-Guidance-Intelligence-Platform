from fastapi import FastAPI

from app.database.connection import Base, engine
from app.models.user import User
from app.models.role import Role
from app.models.tarot_reading import TarotReading
from app.models.tarot_session import TarotSession
from app.models.tarot_chat_message import TarotChatMessage
from app.models.tarot_reschedule import TarotReschedule
from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.palm import router as palm_router
from app.routes.tarot import router as tarot_router
from app.routes.consultant import router as consultant_router
from app.routes.admin import router as admin_router
from app.routes.notifications import router as notifications_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.routes import ai

Base.metadata.create_all(bind=engine)
BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(
    title="AI Palmistry & Tarot Intelligence Platform",
    version="1.0.0"
)
# Allow React/Vite frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(palm_router)
app.include_router(tarot_router)
app.include_router(ai.router)
app.include_router(consultant_router)
app.include_router(admin_router)
app.include_router(notifications_router)

@app.get("/")
def root():
    return {
        "message": "AI Palmistry & Tarot Intelligence Platform Backend is running"
    }
# Tarot card image directory
TAROT_IMAGE_DIR = (
    BASE_DIR
    / "datasets"
    / "tarot"
    / "Tarot Deck"
    / "cards"
)
print("Tarot image path:",TAROT_IMAGE_DIR)
print("Exists:",TAROT_IMAGE_DIR.exists())

# Serve Tarot card images to the frontend
app.mount(
    "/tarot/images",
    StaticFiles(directory=str(TAROT_IMAGE_DIR)),
    name="tarot-images"
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }