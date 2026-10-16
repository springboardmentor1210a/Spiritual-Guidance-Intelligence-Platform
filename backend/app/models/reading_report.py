from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ReadingReport(Base):
    __tablename__ = "reading_reports"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    reading_session_id: Mapped[int | None] = mapped_column(
        ForeignKey("reading_sessions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    report_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="reading_reports",
    )

    reading_session = relationship(
        "ReadingSession",
        back_populates="report",
    )