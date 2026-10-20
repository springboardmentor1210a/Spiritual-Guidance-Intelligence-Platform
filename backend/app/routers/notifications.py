from __future__ import annotations

import hashlib
import logging
import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Base, Reading, User, UserProfile
from app.services.email_service import send_notification_email

logger = logging.getLogger(__name__)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    notification_type = Column(String(40), nullable=False, index=True)
    title = Column(String(180), nullable=False)
    message = Column(Text, nullable=False)
    action_path = Column(String(255), nullable=True)
    source_key = Column(String(220), nullable=False, unique=True, index=True)
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    scheduled_for = Column(DateTime(timezone=True), nullable=True)


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    daily_guidance = Column(Boolean, nullable=False, default=True)
    reading_reminders = Column(Boolean, nullable=False, default=True)
    insight_updates = Column(Boolean, nullable=False, default=True)
    spiritual_growth_alerts = Column(Boolean, nullable=False, default=True)
    platform_announcements = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))


router = APIRouter(prefix="/api/notifications", tags=["Notifications & Engagement"])


class PreferencesUpdate(BaseModel):
    daily_guidance: bool = True
    reading_reminders: bool = True
    insight_updates: bool = True
    spiritual_growth_alerts: bool = True
    platform_announcements: bool = True


class AnnouncementRequest(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    message: str = Field(min_length=3, max_length=2000)
    action_path: Optional[str] = Field(default=None, max_length=255)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def role_name(user: User) -> str:
    return str(user.role or "user").strip().lower()


def get_preferences(db: Session, user_id: int) -> NotificationPreference:
    item = (
        db.query(NotificationPreference)
        .filter(NotificationPreference.user_id == user_id)
        .first()
    )

    if item:
        return item

    item = NotificationPreference(user_id=user_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def make_source_key(user_id: int, notification_type: str, period: str, extra: str = "") -> str:
    raw = f"{user_id}:{notification_type}:{period}:{extra}"
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:20]
    return f"{user_id}:{notification_type}:{period}:{digest}"


def create_if_missing(
    db: Session,
    user_id: int,
    notification_type: str,
    title: str,
    message: str,
    source_key: str,
    action_path: Optional[str] = None,
    scheduled_for: Optional[datetime] = None,
) -> Optional[Notification]:
    # The browser polls unread-count and the notification list independently.
    # Those requests can arrive at the same time, so a normal
    # "SELECT then INSERT" check is not race-safe. PostgreSQL's unique
    # constraint is the final authority: insert with ON CONFLICT DO NOTHING.
    stmt = (
        pg_insert(Notification)
        .values(
            user_id=user_id,
            notification_type=notification_type,
            title=title,
            message=message,
            source_key=source_key,
            action_path=action_path,
            scheduled_for=scheduled_for,
            is_read=False,
        )
        .on_conflict_do_nothing(index_elements=[Notification.source_key])
        .returning(Notification.id)
    )

    inserted_id = db.execute(stmt).scalar_one_or_none()

    if inserted_id is None:
        return None

    return db.query(Notification).filter(Notification.id == inserted_id).first()


def reading_count(db: Session, user_id: int) -> int:
    return db.query(Reading).filter(Reading.user_id == user_id).count()


def last_reading(db: Session, user_id: int) -> Optional[Reading]:
    return (
        db.query(Reading)
        .filter(Reading.user_id == user_id)
        .order_by(Reading.created_at.desc())
        .first()
    )


def reading_created_date(reading: Optional[Reading]):
    if not reading or not reading.created_at:
        return None
    value = reading.created_at
    if value.tzinfo is not None:
        value = value.astimezone(timezone.utc).replace(tzinfo=None)
    return value.date()


def visible_notification_types(user: User) -> list[str]:
    role = role_name(user)
    if role == "admin":
        # Admins receive operational activity alerts, not copies of broadcasts they send.
        return ["insight_update", "consultation_update"]
    if role == "tarot_reader":
        # Session requests are stored as consultation_update notifications.
        # Include this type or the API hides requests from Tarot Readers.
        return ["insight_update", "consultation_update", "platform_announcement"]
    if role == "consultant":
        return ["consultation_update", "platform_announcement"]
    return [
        "daily_guidance",
        "reading_reminder",
        "insight_update",
        "spiritual_growth",
        "platform_announcement",
        "consultation_update",
    ]


def serialize_notification(item: Notification) -> dict:
    return {
        "id": item.id,
        "type": item.notification_type,
        "title": item.title,
        "message": item.message,
        "action_path": item.action_path,
        "is_read": item.is_read,
        "created_at": item.created_at,
        "scheduled_for": item.scheduled_for,
    }


def send_created_emails(created: list[Notification], user: User) -> None:
    for item in created:
        try:
            result = send_notification_email(
                recipient=user.email,
                title=item.title,
                message=item.message,
                action_path=item.action_path,
            )
            if not result.get("ok"):
                logger.warning(
                    "Notification email was not sent for notification %s: %s",
                    item.id,
                    result.get("message"),
                )
        except Exception:
            logger.exception("Notification email delivery failed for notification %s", item.id)


DAILY_GUIDANCE_PROMPTS = [
    ("Begin with clarity", "Choose one question about {focus} and write down what you know, what you feel, and what still needs evidence."),
    ("Make room for patience", "Give {focus} a little breathing room today. Take one measured step instead of demanding an immediate answer."),
    ("Notice what is working", "Look for one thing that is already helping with {focus}. Build on that small sign of progress before changing direction."),
    ("Choose a grounded next step", "Turn {focus} into one practical action you can complete today. Keep it small, clear, and within your control."),
    ("Listen before deciding", "When thinking about {focus}, pause before reacting. Make space for your feelings, then check them against the facts."),
    ("Protect your energy", "For {focus}, decide what deserves your attention today and what can wait. A thoughtful boundary is also progress."),
    ("Ask a better question", "Explore {focus} with a question that opens possibilities rather than assumes an outcome. Let curiosity guide the next step."),
    ("Keep your progress gentle", "You do not need to solve all of {focus} today. One steady choice is enough to keep moving."),
    ("Look for the pattern", "Reflect on what has repeated around {focus}. Notice the pattern without judging yourself, then choose one response you can change."),
    ("Let evidence guide you", "Use today's reflection on {focus} to identify what is known and what needs checking before a bigger decision."),
    ("Make space for balance", "Give {focus} attention without letting it take over everything else. Choose a step that also protects your wider wellbeing."),
    ("Practice honest communication", "If {focus} involves another person, name what you need clearly and respectfully instead of relying on assumptions."),
    ("Celebrate a small shift", "Notice one small way your approach to {focus} has changed. Progress can be quiet before it becomes obvious."),
    ("Return to your intention", "Reconnect with why {focus} matters to you. Let that intention shape one realistic choice today."),
    ("Stay open to a new angle", "Consider one alternative perspective on {focus}. You do not have to accept it immediately; simply give it room to be considered."),
    ("Separate urgency from importance", "Before acting on {focus}, ask whether it truly needs attention now or whether a calmer, better-informed choice would help more."),
    ("Build consistency", "Choose a repeatable habit that supports {focus}. Small actions done consistently are more useful than a perfect plan you cannot sustain."),
    ("Give yourself a clear boundary", "For {focus}, decide what is yours to influence and what is outside your control. Put your effort where it can make a difference."),
    ("Reflect, then act", "Spend a few minutes reflecting on {focus}, then turn the reflection into one specific action instead of leaving it as a thought."),
    ("Make uncertainty manageable", "You may not have every answer about {focus} yet. Identify the next useful piece of information you can gather today."),
    ("Choose progress over perfection", "Take one imperfect but constructive step toward {focus}. You can learn from the result and adjust as you go."),
    ("Notice your response", "Today, pay attention to how you respond when {focus} feels difficult. A pause gives you more choice in what happens next."),
    ("Keep your values in view", "Check whether your next step on {focus} fits the values that matter to you. Let those values be a compass, not a prediction."),
    ("Make the next step lighter", "Simplify {focus} by breaking it into one manageable task. You only need to work on the next step, not the whole journey."),
    ("Give reflection a purpose", "Use your thoughts about {focus} to identify one lesson and one action. Let reflection support your choices rather than replace them."),
    ("Recognize what has changed", "Compare your current view of {focus} with how you saw it earlier. Keep what still helps and update what no longer fits."),
    ("Make room for rest", "A thoughtful pause can support your approach to {focus}. Rest, gather your thoughts, and return when you can see the next step more clearly."),
    ("Start with what you can control", "Choose one part of {focus} that is within your influence today. Put your effort there and release the need to control every outcome."),
    ("Turn insight into practice", "Choose one insight about {focus} and test it through a real action today. Observe the result instead of expecting certainty."),
    ("End the day with awareness", "Before the day ends, note one choice you made around {focus} and what it taught you. Carry the lesson forward without judging the whole day."),
]


def guidance_focus(profile, latest):
    """Return a short readable focus without exposing profile JSON."""
    for value in (
        getattr(profile, "spiritual_goals", None) if profile else None,
        getattr(profile, "interests", None) if profile else None,
        getattr(latest, "title", None) if latest else None,
        getattr(latest, "reading_type", None) if latest else None,
    ):
        if value:
            cleaned = str(value).strip()
            if cleaned.startswith(("[", "{")):
                continue
            cleaned = re.sub(r"\\s+", " ", cleaned).strip(" ,.;")
            if cleaned:
                return cleaned[:90]
    return "your current intention"


def generate_user_notifications(db: Session, user: User, prefs: NotificationPreference) -> list[Notification]:
    now = utc_now()
    today = now.date().isoformat()
    total_readings = reading_count(db, user.id)
    latest = last_reading(db, user.id)
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    created: list[Notification] = []

    if prefs.daily_guidance:
        # User-specific date rotation creates a different prompt on successive days.
        # The date-based source key still prevents duplicate notifications on repeated API calls.
        focus = guidance_focus(profile, latest)
        rotation_index = (now.date().toordinal() + int(user.id) * 7) % len(DAILY_GUIDANCE_PROMPTS)
        guidance_title, guidance_message = DAILY_GUIDANCE_PROMPTS[rotation_index]
        item = create_if_missing(
            db, user.id, "daily_guidance", guidance_title,
            guidance_message.format(focus=focus),
            make_source_key(user.id, "daily_guidance", today), "/guidance",
        )
        if item:
            created.append(item)

    if prefs.reading_reminders:
        last_date = reading_created_date(latest)
        needs_reminder = last_date is None or (now.date() - last_date).days >= 7
        if needs_reminder:
            reminder_messages = [
                "Your reading history is ready whenever you want to reflect again. Choose a question that matters to you today.",
                "A fresh Palm or Tarot session can help you organise your thoughts. Return when you have a meaningful question to explore.",
                "Revisit your readings and note what still feels relevant. Keep any next step grounded in your real-life circumstances.",
                "If a new question has come up, save a reading and compare its themes with your earlier reflections.",
                "Reconnect with your reading practice when it feels useful. There is no need to rush or force a session.",
            ]
            reminder_index = (now.date().toordinal() + int(user.id) * 3) % len(reminder_messages)
            item = create_if_missing(
                db, user.id, "reading_reminder", "A gentle reading reminder",
                reminder_messages[reminder_index],
                make_source_key(user.id, "reading_reminder", today), "/tarot-reading",
            )
            if item:
                created.append(item)

    if prefs.insight_updates and total_readings > 0:
        week = now.isocalendar()
        week_key = f"{week.year}-W{week.week}"
        latest_type = str(getattr(latest, "reading_type", "reading") or "reading").replace("_", " ").title()
        item = create_if_missing(
            db, user.id, "insight_update", "Your reflection history has an update",
            f"You have {total_readings} saved reading{'s' if total_readings != 1 else ''}. Your latest saved session is a {latest_type.lower()} reading. Visit Insights to review recurring themes and recent activity.",
            make_source_key(user.id, "insight_update", week_key, str(total_readings)), "/insights",
        )
        if item:
            created.append(item)

    if prefs.spiritual_growth_alerts:
        goals = getattr(profile, "spiritual_goals", None) if profile else None
        interests = getattr(profile, "interests", None) if profile else None
        if goals or interests or total_readings >= 3:
            month_key = f"{now.year}-{now.month:02d}"
            growth_messages = [
                "Review one theme that has repeated in your readings this month. Choose a practical action that reflects what you have learned.",
                "Look back at recent reflections and notice one response you want to practise more intentionally over the coming weeks.",
                "Choose one recurring theme to explore with curiosity. Track what changes in everyday choices rather than treating a reading as a fixed prediction.",
            ]
            growth_index = (now.month + int(user.id)) % len(growth_messages)
            item = create_if_missing(
                db, user.id, "spiritual_growth", "Spiritual growth check-in",
                growth_messages[growth_index],
                make_source_key(user.id, "spiritual_growth", month_key), "/intelligence",
            )
            if item:
                created.append(item)

    return created

def generate_tarot_reader_notifications(db: Session, user: User, prefs: NotificationPreference) -> list[Notification]:
    if not prefs.insight_updates:
        return []

    latest = (
        db.query(Reading)
        .filter(Reading.reading_type == "tarot")
        .order_by(Reading.id.desc())
        .first()
    )

    if not latest:
        return []

    source = make_source_key(user.id, "tarot_reader_activity", "reading", str(latest.id))
    item = create_if_missing(
        db,
        user.id,
        "insight_update",
        "New tarot activity to review",
        f"A new tarot reading has been saved on the platform. Review the latest tarot activity in your reader workspace.",
        source,
        "/tarot-reader",
    )
    return [item] if item else []


def generate_consultant_notifications(db: Session, user: User, prefs: NotificationPreference) -> list[Notification]:
    """Session-request notifications are created transactionally by consultations.py.

    Do not synthesize accepted/in-progress alerts for the expert here: status
    updates belong to the requesting user. This avoids leaking user-facing
    status messages into the consultant notification panel.
    """
    return []


def generate_admin_notifications(db: Session, user: User, prefs: NotificationPreference) -> list[Notification]:
    # Private operational alerts are insight updates, never public announcements.
    latest_user = (
        db.query(User)
        .filter(User.role != "admin")
        .order_by(User.id.desc())
        .first()
    )
    latest_reading = db.query(Reading).order_by(Reading.id.desc()).first()
    created: list[Notification] = []

    if latest_user:
        source = make_source_key(user.id, "admin_user_activity", "latest-user", str(latest_user.id))
        item = create_if_missing(
            db, user.id, "insight_update", "Platform user activity",
            f"The latest registered non-admin account is {latest_user.full_name or 'a new user'}. Review the admin workspace for current platform activity.",
            source, "/admin",
        )
        if item:
            created.append(item)

    if latest_reading:
        source = make_source_key(user.id, "admin_reading_activity", "latest-reading", str(latest_reading.id))
        item = create_if_missing(
            db, user.id, "insight_update", "New reading activity",
            f"A new {latest_reading.reading_type or 'reading'} has been saved. Review platform activity from the admin workspace.",
            source, "/admin",
        )
        if item:
            created.append(item)

    return created

def generate_engagement_notifications(db: Session, user: User) -> list[Notification]:
    prefs = get_preferences(db, user.id)
    role = role_name(user)

    if role == "admin":
        created = generate_admin_notifications(db, user, prefs)
    elif role == "tarot_reader":
        created = generate_tarot_reader_notifications(db, user, prefs)
    elif role == "consultant":
        created = generate_consultant_notifications(db, user, prefs)
    else:
        created = generate_user_notifications(db, user, prefs)

    if created:
        db.commit()
        for item in created:
            db.refresh(item)
        send_created_emails(created, user)

    return created


@router.get("")
def list_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    generate_engagement_notifications(db, current_user)

    query = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.notification_type.in_(visible_notification_types(current_user)),
        )
    )
    # Older versions incorrectly generated these status alerts for experts.
    # Acceptance/progress/completion notifications are for the requesting user only.
    if role_name(current_user) in {"tarot_reader", "consultant"}:
        query = query.filter(
            ~Notification.title.in_([
                "Consultation accepted",
                "Consultation needs attention",
            ])
        )
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))

    items = query.order_by(Notification.created_at.desc()).limit(limit).all()
    unread = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.notification_type.in_(visible_notification_types(current_user)),
            Notification.is_read.is_(False),
            *([] if role_name(current_user) not in {"tarot_reader", "consultant"} else [~Notification.title.in_(["Consultation accepted", "Consultation needs attention"])]),
        )
        .count()
    )

    return {
        "items": [serialize_notification(item) for item in items],
        "total": len(items),
        "unread_count": unread,
    }


@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    generate_engagement_notifications(db, current_user)
    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.notification_type.in_(visible_notification_types(current_user)),
            Notification.is_read.is_(False),
            *([] if role_name(current_user) not in {"tarot_reader", "consultant"} else [~Notification.title.in_(["Consultation accepted", "Consultation needs attention"])]),
        )
        .count()
    )
    return {"unread_count": count}


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Notification not found.")

    item.is_read = True
    db.commit()
    db.refresh(item)
    return serialize_notification(item)


@router.post("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.notification_type.in_(visible_notification_types(current_user)),
            Notification.is_read.is_(False),
            *([] if role_name(current_user) not in {"tarot_reader", "consultant"} else [~Notification.title.in_(["Consultation accepted", "Consultation needs attention"])]),
        )
        .update({Notification.is_read: True}, synchronize_session=False)
    )
    db.commit()
    return {"message": "All notifications marked as read.", "unread_count": 0}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Notification not found.")

    db.delete(item)
    db.commit()
    return {"message": "Notification deleted."}


@router.get("/preferences")
def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = get_preferences(db, current_user.id)
    return {
        "daily_guidance": item.daily_guidance,
        "reading_reminders": item.reading_reminders,
        "insight_updates": item.insight_updates,
        "spiritual_growth_alerts": item.spiritual_growth_alerts,
        "platform_announcements": item.platform_announcements,
    }


@router.put("/preferences")
def update_notification_preferences(
    payload: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = get_preferences(db, current_user.id)
    item.daily_guidance = payload.daily_guidance
    item.reading_reminders = payload.reading_reminders
    item.insight_updates = payload.insight_updates
    item.spiritual_growth_alerts = payload.spiritual_growth_alerts
    item.platform_announcements = payload.platform_announcements
    item.updated_at = utc_now()
    db.commit()
    db.refresh(item)
    return {
        "message": "Notification preferences updated.",
        "preferences": {
            "daily_guidance": item.daily_guidance,
            "reading_reminders": item.reading_reminders,
            "insight_updates": item.insight_updates,
            "spiritual_growth_alerts": item.spiritual_growth_alerts,
            "platform_announcements": item.platform_announcements,
        },
    }


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active or role_name(current_user) != "admin":
        raise HTTPException(status_code=403, detail="Administrator access is required.")
    return current_user


@router.post("/admin/announcement")
def create_platform_announcement(
    payload: AnnouncementRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.query(User).filter(User.is_active.is_(True)).all()
    # Do not send the broadcast back to the administrator who initiated it.
    users = [user for user in users if role_name(user) != "admin"]
    announcement_stamp = utc_now().strftime("%Y%m%d%H%M%S%f")
    recipients = 0
    created_announcements = []

    for user in users:
        prefs = get_preferences(db, user.id)
        if not prefs.platform_announcements:
            continue

        source_key = make_source_key(
            user.id,
            "platform_announcement",
            announcement_stamp,
            payload.title,
        )

        item = create_if_missing(
            db,
            user.id,
            "platform_announcement",
            payload.title,
            payload.message,
            source_key,
            payload.action_path,
        )
        if item:
            created_announcements.append((user, item))
            recipients += 1

    db.commit()

    for user, item in created_announcements:
        db.refresh(item)
        send_created_emails([item], user)

    return {"message": "Platform announcement delivered.", "recipients": recipients}
