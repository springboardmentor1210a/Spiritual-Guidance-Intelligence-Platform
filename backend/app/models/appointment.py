from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AppointmentAvailability(Base):
    __tablename__ = "appointment_availability"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    professional_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    start_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="available",
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    professional = relationship(
        "User",
        foreign_keys=[professional_id],
    )

    __table_args__ = (
        Index(
            "ix_appointment_availability_times",
            "start_at",
            "end_at",
        ),
    )


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    availability_id: Mapped[int] = mapped_column(
        ForeignKey("appointment_availability.id"),
        nullable=False,
        index=True,
    )

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    professional_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    session_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="confirmed",
        nullable=False,
        index=True,
    )

    meeting_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True,
    )

    google_event_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    availability = relationship(
        "AppointmentAvailability",
        foreign_keys=[availability_id],
    )

    customer = relationship(
        "User",
        foreign_keys=[customer_id],
    )

    professional = relationship(
        "User",
        foreign_keys=[professional_id],
    )