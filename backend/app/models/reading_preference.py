from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column,relationship

from app.core.database import Base


class ReadingPreference(Base):
    __tablename__ = "reading_preferences"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    preferred_reading_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    preferred_spread: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    language: Mapped[str] = mapped_column(
        String(20),
        default="English",
        nullable=False
    )

    frequency: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )
    user = relationship(
        "User",
        back_populates="reading_preferences"
    )