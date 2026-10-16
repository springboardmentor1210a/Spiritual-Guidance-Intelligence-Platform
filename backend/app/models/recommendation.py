from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

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

    recommendations: Mapped[list] = mapped_column(
        JSON,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )