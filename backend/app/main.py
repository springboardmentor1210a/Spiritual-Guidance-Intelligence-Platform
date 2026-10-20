from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load backend/.env before importing routers.
BACKEND_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=BACKEND_ENV_FILE, override=False)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app.models import Base
from app.routers import (
    admin,
    auth,
    intelligence,
    readings,
    tarot_reader,
    consultant,
    profiles,
    notifications,
    consultations,
    guidance,
    platform_feedback,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create missing tables without deleting existing data.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Palmistry & Tarot Intelligence Platform",
    version="2.1.0",
    lifespan=lifespan,
)

# Allow the Docker frontend and local development frontends.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Palmistry & Tarot Intelligence Platform API is running.",
        "version": app.version,
    }


@app.get("/health")
def health():
    return {"status": "ok"}


# Register all existing routers.
app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(readings.router)
app.include_router(intelligence.router)
app.include_router(admin.router)
app.include_router(tarot_reader.router)
app.include_router(consultant.router)
app.include_router(notifications.router)
app.include_router(consultations.router)
app.include_router(guidance.router)
app.include_router(platform_feedback.router)
