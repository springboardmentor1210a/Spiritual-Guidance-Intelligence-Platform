from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database.connection import Base


class TarotSession(Base):
    __tablename__ = "tarot_sessions"

    session_id = Column(
        String(100),
        primary_key=True,
        index=True
    )

    # Tarot Reader conducting the session
    reader_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    # User receiving the reading
    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    # Tarot spread selected for the session
    spread_type = Column(
        String(50),
        nullable=False
    )

    # Date selected for the session
    scheduled_date = Column(
        Date,
        nullable=True
    )

    # Time selected for the session
    scheduled_time = Column(
        Time,
        nullable=True
    )

    # Session status
    # Examples:
    # Invited, Pending, Accepted, Rejected, Scheduled, Completed, Cancelled
    status = Column(
        String(30),
        nullable=False,
        default="Pending"
    )

    # Who created the session
    # "reader" = created by Tarot Reader
    # "user" = requested by User
    created_by = Column(
        String(20),
        nullable=False,
        default="reader"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )