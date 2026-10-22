from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware

from database.database import Base, engine
from database import models

from routes.auth import router as auth_router
from routes.tarot import router as tarot_router
from routes.profile import router as profile_router
from routes.palmistry import router as palmistry_router
from routes.reports import router as reports_router
from routes.ai import router as ai_router
from routes.personalized_guidance import router as personalized_guidance_router
from routes.dashboard import router as dashboard_router
from routes.sessions import router as sessions_router
from routes.feedback import router as feedback_router
from routes import personalized_guidance



Base.metadata.create_all(
    bind=engine
)
# Add palm_shape to existing databases if it is missing.
from sqlalchemy import inspect, text

inspector = inspect(engine)

if "palm_readings" in inspector.get_table_names():
    columns = {
        column["name"]
        for column in inspector.get_columns("palm_readings")
    }

    if "palm_shape" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE palm_readings "
                    "ADD COLUMN palm_shape VARCHAR"
                )
            )


app = FastAPI(
    title="Palmistry Tarot API",
    description="Palmistry and Tarot Reading System"
)


app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://127.0.0.1:8080",
        "http://localhost:8080",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "https://spiritual-guidance-frontend-jani.onrender.com",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)


app.include_router(
    auth_router
)

app.include_router(
    tarot_router
)

app.include_router(
    palmistry_router
)

app.include_router(
    profile_router
)

app.include_router(
    reports_router
)
app.include_router(
    ai_router 
)
app.include_router(
    personalized_guidance_router
)
app.include_router(
    dashboard_router
)
app.include_router(
    sessions_router
)
app.include_router(
    feedback_router
)


@app.get("/")
def home():

    return {
        "message":
            "Backend is working"
    }