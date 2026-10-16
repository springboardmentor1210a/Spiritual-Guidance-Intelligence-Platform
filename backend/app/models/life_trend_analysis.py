from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class LifeTrendAnalysis(Base):
    __tablename__ = "life_trend_analysis"

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

    current_phase: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    trends: Mapped[dict] = mapped_column(
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