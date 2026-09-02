from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.rbac import router as rbac_router
from app.api.profile import router as profile_router
from app.api.reading_preference import router as reading_preference_router
from app.api.spiritual_goal import router as spiritual_goal_router
from app.api.spiritual_interest import router as spiritual_interest_router
from app.api.reading_session import router as reading_session_router



app = FastAPI(
    title="Palmistry & Tarot Intelligence Platform",
    version="1.0.0",
    description="AI-powered Palmistry and Tarot Intelligence Platform",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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