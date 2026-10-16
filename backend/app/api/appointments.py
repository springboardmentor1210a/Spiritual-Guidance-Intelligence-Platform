from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.dependencies.auth import (
    get_current_user,
    require_roles,
)
from app.models.role import Role
from app.models.user import User
from app.models.appointment import (
    Appointment,
    AppointmentAvailability,
)
from app.models.user_notification import UserNotification
from app.schemas.appointment import (
    AvailabilityCreate,
    AvailabilityResponse,
    ProfessionalResponse,
    AppointmentCreate,
    AppointmentResponse,
    NotificationResponse,
)


router = APIRouter(
    prefix="/api/v1/appointments",
    tags=["Appointments"],
)

notifications_router = APIRouter(
    prefix="/api/v1/notifications",
    tags=["Notifications"],
)

PROFESSIONAL_ROLES = (
    "tarot_reader",
    "spiritual_consultant",
)


def notify_user(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    appointment_id: int | None = None,
):
    db.add(
        UserNotification(
            user_id=user_id,
            appointment_id=appointment_id,
            title=title,
            message=message,
            notification_type="appointment",
        )
    )


def get_professional_or_404(
    db: Session,
    professional_id: int,
):
    professional = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(
            User.id == professional_id,
            User.is_active.is_(True),
        )
        .first()
    )

    if (
        professional is None
        or professional.role is None
        or professional.role.name not in PROFESSIONAL_ROLES
    ):
        raise HTTPException(
            status_code=404,
            detail="Professional not found.",
        )

    return professional


@router.get(
    "/professionals",
    response_model=list[ProfessionalResponse],
)
def list_professionals(
    professional_role: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if (
        professional_role is not None
        and professional_role not in PROFESSIONAL_ROLES
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid professional role.",
        )

    roles = (
        [professional_role]
        if professional_role
        else list(PROFESSIONAL_ROLES)
    )

    users = (
        db.query(User)
        .join(Role, User.role_id == Role.id)
        .filter(
            User.is_active.is_(True),
            Role.name.in_(roles),
        )
        .order_by(User.id.asc())
        .all()
    )

    return [
        ProfessionalResponse(
            id=user.id,
            email=user.email,
            role=user.role.name,
        )
        for user in users
    ]


@router.post(
    "/availability",
    response_model=AvailabilityResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_availability(
    data: AvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*PROFESSIONAL_ROLES)
    ),
):
    now = datetime.now(timezone.utc)

    if data.start_at <= now:
        raise HTTPException(
            status_code=400,
            detail="Availability must be in the future.",
        )

    overlapping = (
        db.query(AppointmentAvailability)
        .filter(
            AppointmentAvailability.professional_id
            == current_user.id,
            AppointmentAvailability.status.in_(
                ["available", "booked"]
            ),
            AppointmentAvailability.start_at < data.end_at,
            AppointmentAvailability.end_at > data.start_at,
        )
        .first()
    )

    if overlapping:
        raise HTTPException(
            status_code=409,
            detail="This time overlaps an existing slot.",
        )

    slot = AppointmentAvailability(
        professional_id=current_user.id,
        start_at=data.start_at,
        end_at=data.end_at,
        status="available",
    )

    db.add(slot)
    db.commit()
    db.refresh(slot)

    return slot


@router.get(
    "/availability",
    response_model=list[AvailabilityResponse],
)
def list_availability(
    professional_id: int | None = None,
    professional_role: str | None = None,
    from_at: datetime | None = None,
    to_at: datetime | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if (
        professional_role is not None
        and professional_role not in PROFESSIONAL_ROLES
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid professional role.",
        )

    query = (
        db.query(AppointmentAvailability)
        .join(
            User,
            AppointmentAvailability.professional_id == User.id,
        )
        .join(Role, User.role_id == Role.id)
        .filter(
            User.is_active.is_(True),
            Role.name.in_(PROFESSIONAL_ROLES),
            AppointmentAvailability.status == "available",
            AppointmentAvailability.start_at
            > datetime.now(timezone.utc),
        )
    )

    if professional_id is not None:
        query = query.filter(
            AppointmentAvailability.professional_id
            == professional_id
        )

    if professional_role is not None:
        query = query.filter(
            Role.name == professional_role
        )

    if from_at is not None:
        query = query.filter(
            AppointmentAvailability.start_at >= from_at
        )

    if to_at is not None:
        query = query.filter(
            AppointmentAvailability.end_at <= to_at
        )

    return query.order_by(
        AppointmentAvailability.start_at.asc()
    ).all()


@router.delete(
    "/availability/{slot_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_availability(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*PROFESSIONAL_ROLES)
    ),
):
    slot = (
        db.query(AppointmentAvailability)
        .filter(
            AppointmentAvailability.id == slot_id,
            AppointmentAvailability.professional_id
            == current_user.id,
        )
        .with_for_update()
        .first()
    )

    if slot is None:
        raise HTTPException(
            status_code=404,
            detail="Availability slot not found.",
        )

    if slot.status != "available":
        raise HTTPException(
            status_code=409,
            detail="Only unbooked slots can be removed.",
        )

    db.delete(slot)
    db.commit()


@router.post(
    "/book",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def book_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    slot = (
        db.query(AppointmentAvailability)
        .filter(
            AppointmentAvailability.id == data.availability_id
        )
        .with_for_update()
        .first()
    )

    if slot is None:
        raise HTTPException(
            status_code=404,
            detail="Availability slot not found.",
        )

    if slot.status != "available":
        raise HTTPException(
            status_code=409,
            detail="This slot is already booked.",
        )

    if slot.start_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="This slot is no longer bookable.",
        )

    if slot.professional_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot book your own availability.",
        )

    professional = get_professional_or_404(
        db,
        slot.professional_id,
    )

    appointment = Appointment(
        availability_id=slot.id,
        customer_id=current_user.id,
        professional_id=professional.id,
        session_type=data.session_type,
        notes=data.notes,
        status="confirmed",
    )

    slot.status = "booked"

    db.add(appointment)
    db.flush()

    notify_user(
        db,
        current_user.id,
        "Appointment confirmed",
        "Your appointment has been booked. Meeting details will "
        "appear here when Google Meet is configured.",
        appointment.id,
    )

    notify_user(
        db,
        professional.id,
        "New appointment",
        f"A user has booked your {data.session_type} session.",
        appointment.id,
    )

    db.commit()

    appointment = (
        db.query(Appointment)
        .options(joinedload(Appointment.availability))
        .filter(Appointment.id == appointment.id)
        .first()
    )

    return appointment


@router.get(
    "/mine",
    response_model=list[AppointmentResponse],
)
def my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Appointment)
        .options(joinedload(Appointment.availability))
        .filter(Appointment.customer_id == current_user.id)
        .order_by(Appointment.created_at.desc())
        .all()
    )


@router.get(
    "/professional/mine",
    response_model=list[AppointmentResponse],
)
def my_professional_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(*PROFESSIONAL_ROLES)
    ),
):
    return (
        db.query(Appointment)
        .options(joinedload(Appointment.availability))
        .filter(
            Appointment.professional_id == current_user.id
        )
        .order_by(Appointment.created_at.desc())
        .all()
    )


@router.post(
    "/{appointment_id}/cancel",
    response_model=AppointmentResponse,
)
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appointment = (
        db.query(Appointment)
        .filter(Appointment.id == appointment_id)
        .with_for_update()
        .first()
    )

    if appointment is None:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found.",
        )

    if current_user.id not in (
        appointment.customer_id,
        appointment.professional_id,
    ):
        raise HTTPException(
            status_code=403,
            detail="You cannot cancel this appointment.",
        )

    if appointment.status != "confirmed":
        raise HTTPException(
            status_code=409,
            detail="This appointment is not cancellable.",
        )

    slot = (
        db.query(AppointmentAvailability)
        .filter(
            AppointmentAvailability.id
            == appointment.availability_id
        )
        .with_for_update()
        .first()
    )

    appointment.status = "cancelled"

    if (
        slot is not None
        and slot.start_at > datetime.now(timezone.utc)
    ):
        slot.status = "available"
    elif slot is not None:
        slot.status = "cancelled"

    other_user_id = (
        appointment.professional_id
        if current_user.id == appointment.customer_id
        else appointment.customer_id
    )

    notify_user(
        db,
        other_user_id,
        "Appointment cancelled",
        f"Appointment #{appointment.id} has been cancelled.",
        appointment.id,
    )

    notify_user(
        db,
        current_user.id,
        "Cancellation recorded",
        f"Appointment #{appointment.id} has been cancelled.",
        appointment.id,
    )

    db.commit()

    return (
        db.query(Appointment)
        .options(joinedload(Appointment.availability))
        .filter(Appointment.id == appointment_id)
        .first()
    )


@notifications_router.get(
    "",
    response_model=list[NotificationResponse],
)
def list_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(UserNotification)
        .filter(UserNotification.user_id == current_user.id)
        .order_by(UserNotification.created_at.desc())
        .limit(100)
        .all()
    )


@notifications_router.post(
    "/{notification_id}/read",
    response_model=NotificationResponse,
)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(UserNotification)
        .filter(
            UserNotification.id == notification_id,
            UserNotification.user_id == current_user.id,
        )
        .first()
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    if notification.read_at is None:
        notification.read_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(notification)

    return notification