import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_root_dir = os.path.dirname(_backend_dir)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Palmistry & Tarot Intelligence Platform"
    VERSION: str = "2.0.0"

    # Security settings
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    JWT_SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Google OAuth2
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
    FRONTEND_URL: str = "http://localhost:5173"

    # --- Email (Gmail SMTP) ---
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_EMAIL: str = ""
    SMTP_APP_PASSWORD: str = ""

    # Set to True to enforce 2-step OTP verification on every login.
    # Set to False (recommended for smooth local dev) for direct password login.
    REQUIRE_LOGIN_OTP: bool = False

    # Database settings
    DATABASE_URL: str = "sqlite:///./mystic_insights.db"
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "palmistry_tarot_db"

    # ✨ OpenAI API Key (Reads from .env file automatically) ✨
    OPENAI_API_KEY: Optional[str] = None

    # ✨ CRITICAL FIX: Look for .env in backend, frontend, root, or cwd ✨
    model_config = SettingsConfigDict(
        env_file=(
            os.path.join(_backend_dir, ".env"),
            os.path.join(_root_dir, "frontend", ".env"),
            os.path.join(_root_dir, ".env"),
            ".env"
        ),
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Create the settings instance
settings = Settings()