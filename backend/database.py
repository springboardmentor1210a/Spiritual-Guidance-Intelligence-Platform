from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# --- PostgreSQL Setup (Primary Database for Users & Roles) ---
POSTGRES_URL = os.environ.get("POSTGRES_URL", "postgresql+asyncpg://postgres:yourpassword@localhost:5432/lunara")

engine = create_async_engine(
    POSTGRES_URL, 
    echo=True,
    pool_pre_ping=True,  # Tests if the connection is alive before using it
    pool_recycle=1800    # Automatically recycles connections every 30 minutes
)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# --- MongoDB Setup (Secondary Database for Reading Sessions & Insights) ---
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
# Add this below your MONGO_URL in database.py
print("\n--- DATABASE DESTINATION CHECK ---")
print("Routing to:", "Atlas Cloud" if "mongodb+srv" in MONGO_URL else "Localhost\n")
mongo_client = AsyncIOMotorClient(MONGO_URL)
mongo_db = mongo_client.lunara_db

# Dependency to inject PostgreSQL sessions into FastAPI endpoints
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session