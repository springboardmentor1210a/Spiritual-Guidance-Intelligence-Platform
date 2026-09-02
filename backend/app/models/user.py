from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id"),
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    role = relationship(
        "Role",
        back_populates="users"
    )

    profile = relationship(
        "Profile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    spiritual_goals = relationship(
        "SpiritualGoal",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    reading_preferences = relationship(
        "ReadingPreference",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    spiritual_interests = relationship(
        "UserSpiritualInterest",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    reading_sessions = relationship(
        "ReadingSession",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    