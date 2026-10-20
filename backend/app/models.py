from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


# ============================================================
# USER
# ============================================================

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    full_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(30),
        default="user",
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
    )

    # --------------------------------------------------------
    # Existing relationships
    # --------------------------------------------------------

    profile: Mapped["UserProfile"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    readings: Mapped[list["Reading"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    # --------------------------------------------------------
    # Spiritual Consultant relationships
    # --------------------------------------------------------

    consultant_profile: Mapped["ConsultantProfile | None"] = relationship(
        back_populates="consultant",
        uselist=False,
        foreign_keys="ConsultantProfile.consultant_id",
        cascade="all, delete-orphan",
    )

    consultation_requests: Mapped[list["Consultation"]] = relationship(
        back_populates="user",
        foreign_keys="Consultation.user_id",
        cascade="all, delete-orphan",
    )

    assigned_consultations: Mapped[list["Consultation"]] = relationship(
        back_populates="consultant",
        foreign_keys="Consultation.consultant_id",
    )


# ============================================================
# USER PROFILE
# ============================================================

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
    )

    age_group: Mapped[str | None] = mapped_column(
        String(40),
        nullable=True,
    )

    interests: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    spiritual_goals: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    reading_preferences: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    user: Mapped[User] = relationship(
        back_populates="profile",
    )


# ============================================================
# READING
# ============================================================

class Reading(Base):
    __tablename__ = "readings"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    reading_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(160),
        nullable=False,
    )

    input_summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    result_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    image_path: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    detected_lines_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    palm_insights_json: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    detection_status: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    user: Mapped[User] = relationship(
        back_populates="readings",
    )


# ============================================================
# CONSULTANT PROFILE
# ============================================================

class ConsultantProfile(Base):
    __tablename__ = "consultant_profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    consultant_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    specialization: Mapped[str | None] = mapped_column(
        String(160),
        nullable=True,
    )

    experience_years: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    bio: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    approach: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    availability: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    consultant: Mapped[User] = relationship(
        back_populates="consultant_profile",
        foreign_keys=[consultant_id],
    )


# ============================================================
# CONSULTATION
# ============================================================

class Consultation(Base):
    __tablename__ = "consultations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # User who requested the consultation
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Consultant assigned to the request
    consultant_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    topic: Mapped[str] = mapped_column(
        String(160),
        nullable=False,
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    preferred_time: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="pending",
        nullable=False,
        index=True,
    )

    consultant_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    guidance: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    recommendations: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    # --------------------------------------------------------
    # Relationships
    # --------------------------------------------------------

    user: Mapped[User] = relationship(
        back_populates="consultation_requests",
        foreign_keys=[user_id],
    )

    consultant: Mapped[User | None] = relationship(
        back_populates="assigned_consultations",
        foreign_keys=[consultant_id],
    )