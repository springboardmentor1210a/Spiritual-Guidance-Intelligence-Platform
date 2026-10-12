from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.connection import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    username = Column(
        String(50),
        unique=True,
        nullable=False
    )

    email = Column(
        String(100),
        unique=True,
        nullable=False
    )

    gender = Column(
        String(20),
        nullable=True
    )

    age_group = Column(
        String(30),
        nullable=True
    )

    interests = Column(
        Text,
        nullable=True
    )

    spiritual_goals = Column(
        Text,
        nullable=True
    )

    reading_preferences = Column(
        Text,
        nullable=True
    )

    password = Column(
        String(255),
        nullable=False
    )

    role_id = Column(
        Integer,
        ForeignKey("roles.role_id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        default=func.now(),
        server_default=func.now()
    )

    role = relationship(
        "Role",
        back_populates="users"
    )