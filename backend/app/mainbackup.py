from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models  # noqa: F401
from app.routers import admin, auth, consultant, intelligence, profiles, readings, tarot_reader

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Palmistry & Tarot Intelligence Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Palmistry & Tarot Intelligence Platform API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth.router)
app.include_router(profiles.router)
app.include_router(readings.router)
app.include_router(intelligence.router)
app.include_router(admin.router)
app.include_router(tarot_reader.router)
app.include_router(consultant.router)
