from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func

from app.database.connection import Base


class TarotReading(Base):
    __tablename__ = "tarot_readings"

    reading_id = Column(
        String(100),
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=True
    )

    spread_type = Column(
        String(50),
        nullable=False
    )

    spread_name = Column(
        String(100),
        nullable=False
    )

    card_count = Column(
        Integer,
        nullable=False
    )

    cards = Column(
        Text,
        nullable=True
    )

    overall_reading = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )