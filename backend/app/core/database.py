from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging

logger = logging.getLogger(__name__)

# Use database URL from settings or default to mystic_insights.db
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mystic_insights.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_db_schema(eng=engine):
    """
    Auto-migrate SQLite database to ensure the users table has all required columns.
    Prevents OperationalError: no such column: users.is_verified
    """
    try:
        inspector = inspect(eng)
        tables = inspector.get_table_names()
        if "users" in tables:
            columns = [col["name"] for col in inspector.get_columns("users")]
            with eng.begin() as conn:
                if "is_verified" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 1"))
                    conn.execute(text("UPDATE users SET is_verified = 1 WHERE is_verified IS NULL"))
                    logger.info("Added column is_verified to users table")
                if "verification_code" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN verification_code VARCHAR"))
                    logger.info("Added column verification_code to users table")
                if "verification_code_expires" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN verification_code_expires DATETIME"))
                    logger.info("Added column verification_code_expires to users table")
                if "otp_code" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN otp_code VARCHAR"))
                    logger.info("Added column otp_code to users table")
                if "otp_expires" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN otp_expires DATETIME"))
                    logger.info("Added column otp_expires to users table")
    except Exception as e:
        logger.warning(f"ensure_db_schema encountered an issue: {e}")


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()