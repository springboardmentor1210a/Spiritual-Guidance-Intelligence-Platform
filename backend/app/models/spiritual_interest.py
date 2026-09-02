from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column,relationship

from app.core.database import Base


class SpiritualInterest(Base):
    __tablename__ = "spiritual_interests"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )
    users = relationship(
        "UserSpiritualInterest",
        back_populates="interest",
        cascade="all, delete-orphan"
    )