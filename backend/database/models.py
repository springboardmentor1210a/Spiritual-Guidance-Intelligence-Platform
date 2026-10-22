from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    ForeignKey,
    DateTime,
    Boolean
)

from sqlalchemy.orm import relationship

from database import Base


# =========================================================
# USER MODEL
# =========================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String,
        nullable=False
    )

    role = Column(
        String,
        default="user",
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=True,
        default=lambda:
    datetime.now(datetime.utc)
    )

    # -----------------------------------------------------
    # Relationships
    # -----------------------------------------------------

    profile = relationship(
        "Profile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    palm_readings = relationship(
        "PalmReading",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    tarot_readings = relationship(
        "TarotReading",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# =========================================================
# PROFILE MODEL
# =========================================================

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    # Basic user information
    full_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    age_group = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    occupation = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)

    # Spiritual interests and goals
    interests = Column(Text, nullable=True)
    spiritual_interests = Column(Text, nullable=True)
    goals = Column(Text, nullable=True)
    spiritual_goals = Column(Text, nullable=True)

    # Reading preferences
    reading_preferences = Column(Text, nullable=True)

    # Relationship
    user = relationship(
        "User",
        back_populates="profile"
    )
    # -----------------------------------------------------
    # Relationship
    # -----------------------------------------------------

    user = relationship(
        "User",
        back_populates="profile"
    )


# =========================================================
# PALM READING MODEL
# =========================================================

class PalmReading(Base):

    __tablename__ = "palm_readings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )
    created_at =Column(
        DateTime,
        default=datetime.utcnow,
        nullable=True
    )

    # -----------------------------------------------------
    # Uploaded Palm Image
    # -----------------------------------------------------

    image_filename = Column(
        String,
        nullable=False
    )

    image_path = Column(
        String,
        nullable=False
    )

    # -----------------------------------------------------
    # Palm Detection
    # -----------------------------------------------------

    palm_detected = Column(
        Integer,
        default=0
    )

    detection_confidence = Column(
        Float,
        default=0.0
    )

    # -----------------------------------------------------
    # Palm Analysis
    # -----------------------------------------------------

    analysis_confidence = Column(
        Float,
        default=0.0
    )

    # -----------------------------------------------------
    # Palm Features
    # -----------------------------------------------------

    life_line = Column(
        Text,
        nullable=True
    )

    heart_line = Column(
        Text,
        nullable=True
    )

    head_line = Column(
        Text,
        nullable=True
    )

    fate_line = Column(
        Text,
        nullable=True
    )

    palm_shape = Column(
        String,
        nullable=True
    )

    # -----------------------------------------------------
    # Palmistry Interpretation
    # -----------------------------------------------------

    interpretation = Column(
        Text,
        nullable=True
    )

    # -----------------------------------------------------
    # Palmistry Personalized Guidance
    # -----------------------------------------------------

    personalized_guidance = Column(
        Text,
        nullable=True
    )

    # -----------------------------------------------------
    # Relationship
    # -----------------------------------------------------

    user = relationship(
        "User",
        back_populates="palm_readings"
    )


# =========================================================
# TAROT CARD MODEL
# =========================================================

class TarotCard(Base):

    __tablename__ = "tarot_cards"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    card_number = Column(
        Integer,
        nullable=True
    )

    image_path = Column(
        String,
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )

    meaning = Column(
        Text,
        nullable=True
    )


# =========================================================
# TAROT READING MODEL
# =========================================================

class TarotReading(Base):

    __tablename__ = "tarot_readings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=True
    )

    # -----------------------------------------------------
    # Tarot Reading Type
    # -----------------------------------------------------

    reading_type = Column(
        String,
        nullable=False,
        default="single"
    )

    # -----------------------------------------------------
    # Complete Selected Tarot Cards
    #
    # Stores all selected cards as JSON text.
    #
    # Example:
    #
    # [
    #   {
    #       "card_name": "The Fool",
    #       "card_meaning": "...",
    #       "position": "Current Situation"
    #   }
    # ]
    # -----------------------------------------------------

    selected_cards = Column(
        Text,
        nullable=True
    )

    # -----------------------------------------------------
    # Optional Question
    # -----------------------------------------------------

    question = Column(
        Text,
        nullable=True
    )

    # -----------------------------------------------------
    # Tarot Interpretation
    # -----------------------------------------------------

    interpretation = Column(
        Text,
        nullable=True
    )

    # -----------------------------------------------------
    # Tarot Personalized Guidance
    # -----------------------------------------------------

    personalized_guidance = Column(
        Text,
        nullable=True
    )

    # -----------------------------------------------------
    # Relationship
    # -----------------------------------------------------

    user = relationship(
        "User",
        back_populates="tarot_readings"
    )


# =========================================================
# REPORT MODEL
# =========================================================

class Report(Base):

    __tablename__ = "reports"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    palm_reading_id = Column(
        Integer,
        ForeignKey("palm_readings.id"),
        nullable=True
    )

    tarot_reading_id = Column(
        Integer,
        ForeignKey("tarot_readings.id"),
        nullable=True
    )

    title = Column(
        String,
        nullable=True
    )

    content = Column(
        Text,
        nullable=True
    )

    report_type = Column(
        String,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=True
    )

    # -----------------------------------------------------
    # Relationships
    # -----------------------------------------------------

    user = relationship(
        "User"
    )

    palm_reading = relationship(
        "PalmReading"
    )

    tarot_reading = relationship(
        "TarotReading"
    )
    # =========================================================
    # USER SESSION MODEL
    # =========================================================

class UserSession(Base):

    __tablename__ = "user_sessions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    started_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    ended_at = Column(
        DateTime,
        nullable=True
    )

    last_activity = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    user = relationship("User")
    # ============================================================
# GUIDANCE FEEDBACK
# ============================================================

class GuidanceFeedback(Base):
    __tablename__ = "guidance_feedback"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    palm_reading_id = Column(
        Integer,
        ForeignKey("palm_readings.id"),
        nullable=True,
    )

    tarot_reading_id = Column(
        Integer,
        ForeignKey("tarot_readings.id"),
        nullable=True,
    )

    rating = Column(Integer, nullable=False)

    comment = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship("User")
    palm_reading = relationship("PalmReading")
    tarot_reading = relationship("TarotReading")