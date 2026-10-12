from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.connection import Base


class TarotChatMessage(Base):
    __tablename__ = "tarot_chat_messages"

    message_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(
        String(100),
        ForeignKey("tarot_sessions.session_id"),
        nullable=False,
        index=True
    )
    sender_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())