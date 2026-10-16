from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PersonalityIntelligence(Base):
    __tablename__ = "personality_intelligence"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    reading_session_id: Mapped[int] = mapped_column(
        ForeignKey("reading_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    profile_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    dimensions: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    strengths: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
    )

    development_areas: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
    )

    summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )