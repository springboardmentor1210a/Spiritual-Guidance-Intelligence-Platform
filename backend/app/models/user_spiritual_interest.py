from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserSpiritualInterest(Base):
    __tablename__ = "user_spiritual_interests"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True
    )

    interest_id: Mapped[int] = mapped_column(
        ForeignKey(
            "spiritual_interests.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )

    user = relationship(
        "User",
        back_populates="spiritual_interests"
    )

    interest = relationship(
        "SpiritualInterest",
        back_populates="users"
    )