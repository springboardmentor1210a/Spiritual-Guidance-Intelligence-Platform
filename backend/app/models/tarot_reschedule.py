from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.connection import Base


class TarotReschedule(Base):
    __tablename__ = "tarot_reschedules"

    reschedule_id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    session_id = Column(
        String(100),
        ForeignKey("tarot_sessions.session_id"),
        nullable=False,
        index=True
    )

    proposed_by = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    proposed_date = Column(Date, nullable=False)
    proposed_time = Column(Time, nullable=False)

    status = Column(String(20), nullable=False, default="Pending")

    created_at = Column(DateTime(timezone=True), server_default=func.now())