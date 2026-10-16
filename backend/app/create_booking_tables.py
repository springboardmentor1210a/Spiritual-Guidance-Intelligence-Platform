# Import the models package first so SQLAlchemy registers
# all existing models and the new booking models.

import app.models

from app.core.database import Base, engine

from app.models.appointment import (
    Appointment,
    AppointmentAvailability,
)

from app.models.user_notification import UserNotification


if __name__ == "__main__":
    Base.metadata.create_all(
        bind=engine,
        tables=[
            AppointmentAvailability.__table__,
            Appointment.__table__,
            UserNotification.__table__,
        ],
    )

    print("Booking and notification tables are ready.")