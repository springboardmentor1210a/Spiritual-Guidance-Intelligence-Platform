from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AIInterpretation(Base):
    __tablename__ = "ai_interpretations"

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

    interpretation_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    context: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="general",
    )

    overview: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    personality: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    relationships: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    career: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    finance: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    health_wellness: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    personal_growth: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    life_opportunities: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    source_data: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )