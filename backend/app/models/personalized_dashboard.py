from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PersonalizedDashboard(Base):
    __tablename__ = "personalized_dashboards"

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

    dashboard_data: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )