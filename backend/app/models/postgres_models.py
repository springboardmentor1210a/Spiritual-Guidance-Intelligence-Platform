from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="User")  # User, Tarot Reader, Spiritual Consultant, Admin
    created_at = Column(DateTime, default=datetime.utcnow)

    # --- Email verification (checked once at signup) ---
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_code = Column(String, nullable=True)
    verification_code_expires = Column(DateTime, nullable=True)

    # --- Login OTP (checked on every login, after password) ---
    otp_code = Column(String, nullable=True)
    otp_expires = Column(DateTime, nullable=True)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    readings = relationship("ReadingHistory", back_populates="user", cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=True)
    age_group = Column(String, nullable=True)
    interests = Column(String, nullable=True)
    spiritual_goals = Column(Text, nullable=True)
    reading_preferences = Column(String, nullable=True)
    
    user = relationship("User", back_populates="profile")

class ReadingHistory(Base):
    __tablename__ = "reading_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reading_type = Column(String, nullable=False)  # "tarot" or "palmistry"
    title = Column(String, nullable=False)
    details = Column(JSON, nullable=False)  # Stores cards drawn or palm line detections
    summary = Column(Text, nullable=False)
    score = Column(Float, nullable=True)  # Spiritual guidance alignment score
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="readings")