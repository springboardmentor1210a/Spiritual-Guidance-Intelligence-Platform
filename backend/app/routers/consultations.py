from __future__ import annotations
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from typing import Optional
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
import uuid
import time
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    MetaData,
    String,
    Table,
    Text,
    select,
    and_,
)
from sqlalchemy.orm import Session
from app.database import engine, get_db
from app.dependencies import get_current_user
from app.models import User, Reading
from app.routers.notifications import Notification, NotificationPreference
from app.services.email_service import send_notification_email
from pathlib import Path
from dotenv import load_dotenv
BACKEND_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(BACKEND_ENV_FILE, override=False)
router = APIRouter(
    prefix="/api/consultations",
    tags=["Consultation Requests"],
)
CONSULTATION_METADATA = MetaData()
consultation_table = Table(
    "consultations",
    CONSULTATION_METADATA,
    Column("id", Integer, primary_key=True),
    Column("user_id", Integer, nullable=False, index=True),
    Column("expert_id", Integer, nullable=True, index=True),
    Column("consultant_id", Integer, nullable=True, index=True),
    Column("expert_role", String(30), nullable=True),
    Column("topic", String(180), nullable=False),
    Column("message", Text, nullable=False),
    Column("reading_id", Integer, nullable=True),
    Column("reading_type", String(20), nullable=True),
    Column("preferred_time", String(120), nullable=True),
    Column("status", String(30), nullable=False, default="pending"),
    Column("response_message", Text, nullable=True),
    Column("meet_link", Text, nullable=True),
    Column("google_event_id", String(255), nullable=True),
    Column("created_at", DateTime, nullable=False),
    Column("updated_at", DateTime, nullable=False),
)
# Create the table before applying compatibility changes. Existing tables and data
# are preserved; checkfirst avoids recreating a table that already exists.
CONSULTATION_METADATA.create_all(
    bind=engine,
    tables=[consultation_table],
    checkfirst=True,
)

# Preserve the earlier Spiritual Consultant workflow while adding fields used by
# both Tarot Readers and Spiritual Consultants.
with engine.begin() as connection:
    connection.exec_driver_sql("ALTER TABLE consultations ADD COLUMN IF NOT EXISTS expert_id INTEGER")
    connection.exec_driver_sql("ALTER TABLE consultations ADD COLUMN IF NOT EXISTS expert_role VARCHAR(30)")
    connection.exec_driver_sql("ALTER TABLE consultations ADD COLUMN IF NOT EXISTS reading_id INTEGER")
    connection.exec_driver_sql("ALTER TABLE consultations ADD COLUMN IF NOT EXISTS reading_type VARCHAR(20)")
    connection.exec_driver_sql("ALTER TABLE consultations ADD COLUMN IF NOT EXISTS response_message TEXT")
    connection.exec_driver_sql("ALTER TABLE consultations ADD COLUMN IF NOT EXISTS meet_link TEXT")
    connection.exec_driver_sql("ALTER TABLE consultations ADD COLUMN IF NOT EXISTS google_event_id VARCHAR(255)")
    connection.exec_driver_sql("ALTER TABLE consultations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP")
    connection.exec_driver_sql("UPDATE consultations SET expert_id = consultant_id WHERE expert_id IS NULL AND consultant_id IS NOT NULL")
    connection.exec_driver_sql("UPDATE consultations SET expert_role = 'consultant' WHERE expert_role IS NULL AND consultant_id IS NOT NULL")
    connection.exec_driver_sql("UPDATE consultations SET updated_at = created_at WHERE updated_at IS NULL AND created_at IS NOT NULL")
class ConsultationCreate(BaseModel):
    expert_id: int
    topic: str = Field(min_length=2, max_length=180)
    message: str = Field(min_length=5, max_length=4000)
    reading_id: Optional[int] = None
    preferred_time: Optional[str] = Field(default=None, max_length=120)
class ConsultationDecision(BaseModel):
    status: str = Field(min_length=1, max_length=30)
    response_message: Optional[str] = Field(default=None, max_length=3000)
def now_utc_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)
def role_name(user: User) -> str:
    return str(user.role or "user").strip().lower()
def serialize(row, user=None, expert=None) -> dict:
    data = dict(row)
    return {
        "id": data["id"],
        "user_id": data["user_id"],
        "user_name": getattr(user, "full_name", None) or "User",
        "user_email": getattr(user, "email", None) or "",
        "expert_id": data["expert_id"],
        "expert_name": getattr(expert, "full_name", None) or "Guide",
        "expert_email": getattr(expert, "email", None) or "",
        "expert_role": data["expert_role"],
        "topic": data["topic"],
        "message": data["message"],
        "reading_id": data["reading_id"],
        "reading_type": data["reading_type"],
        "preferred_time": data["preferred_time"],
        "status": data["status"],
        "response_message": data["response_message"],
        "meet_link": data.get("meet_link"),
        "created_at": data["created_at"],
        "updated_at": data["updated_at"],
    }
def get_row(db: Session, consultation_id: int):
    return db.execute(
        select(consultation_table).where(
            consultation_table.c.id == consultation_id
        )
    ).mappings().first()
def create_event_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    action_path: str,
    source: str,
) -> None:
    # Reuse the existing Notification table and its unique source_key.
    # A consultation event is transactional, so it is created directly when
    # the request/decision happens rather than waiting for notification polling.
    from sqlalchemy.dialects.postgresql import insert as pg_insert
    stmt = (
        pg_insert(Notification)
        .values(
            user_id=user_id,
            notification_type="consultation_update",
            title=title,
            message=message,
            action_path=action_path,
            source_key=source,
            is_read=False,
            created_at=datetime.now(timezone.utc),
            scheduled_for=None,
        )
        .on_conflict_do_nothing(
            index_elements=[Notification.source_key]
        )
    )
    db.execute(stmt)
def send_event_email(user: User, title: str, message: str, action_path: str) -> None:
    try:
        result = send_notification_email(
            recipient=user.email,
            title=title,
            message=message,
            action_path=action_path,
        )
        if not result.get("ok"):
            # Email failure must never make the consultation request fail.
            print(
                f"Consultation notification email was not sent to "
                f"{user.email}: {result.get('message')}"
            )
    except Exception as exc:
        print(
            f"Consultation notification email failed for {user.email}: {exc}"
        )
@router.get("/experts")
def list_experts(
    expert_role: Optional[str] = Query(
        default=None,
        pattern="^(tarot_reader|consultant)$",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = role_name(current_user)
    if role != "user":
        raise HTTPException(
            status_code=403,
            detail="Only normal users can create consultation requests.",
        )
    query = (
        db.query(User)
        .filter(
            User.is_active.is_(True),
            User.role.in_(["tarot_reader", "consultant"]),
        )
        .order_by(User.role.asc(), User.full_name.asc(), User.id.asc())
    )
    if expert_role:
        query = query.filter(User.role == expert_role)
    experts = query.all()
    # Consultant profile data is optional. Tarot Readers use their account
    # name/role until a dedicated reader profile exists.
    profile_map = {}
    try:
        from sqlalchemy import text
        rows = db.execute(
            text(
                """
                SELECT consultant_id, specialization, experience_years,
                       bio, approach, availability
                FROM consultant_profiles
                """
            )
        ).mappings().all()
        profile_map = {
            int(row["consultant_id"]): dict(row)
            for row in rows
        }
    except Exception:
        db.rollback()
    return {
        "items": [
            {
                "id": expert.id,
                "name": expert.full_name or "Spiritual Guide",
                "email": expert.email,
                "role": role_name(expert),
                "role_label": (
                    "Tarot Reader"
                    if role_name(expert) == "tarot_reader"
                    else "Spiritual Consultant"
                ),
                "specialization": (
                    profile_map.get(expert.id, {}).get("specialization")
                    if role_name(expert) == "consultant"
                    else "Tarot reading"
                ),
                "experience_years": (
                    profile_map.get(expert.id, {}).get("experience_years")
                    if role_name(expert) == "consultant"
                    else None
                ),
                "bio": (
                    profile_map.get(expert.id, {}).get("bio")
                    if role_name(expert) == "consultant"
                    else None
                ),
                "availability": (
                    profile_map.get(expert.id, {}).get("availability")
                    if role_name(expert) == "consultant"
                    else "Available for requests"
                ),
            }
            for expert in experts
        ]
    }
@router.post("")
def create_consultation(
    payload: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if role_name(current_user) != "user":
        raise HTTPException(
            status_code=403,
            detail="Only normal users can create consultation requests.",
        )
    expert = (
        db.query(User)
        .filter(
            User.id == payload.expert_id,
            User.is_active.is_(True),
            User.role.in_(["tarot_reader", "consultant"]),
        )
        .first()
    )
    if not expert:
        raise HTTPException(
            status_code=404,
            detail="That Tarot Reader or Spiritual Consultant is not available.",
        )
    reading_type = None
    if payload.reading_id is not None:
        reading = (
            db.query(Reading)
            .filter(
                Reading.id == payload.reading_id,
                Reading.user_id == current_user.id,
            )
            .first()
        )
        if not reading:
            raise HTTPException(
                status_code=404,
                detail="The selected reading was not found in your account.",
            )
        reading_type = reading.reading_type
    now = now_utc_naive()
    result = db.execute(
        consultation_table.insert().values(
            user_id=current_user.id,
            expert_id=expert.id,
            consultant_id=(expert.id if role_name(expert) == "consultant" else None),
            expert_role=role_name(expert),
            topic=payload.topic.strip(),
            message=payload.message.strip(),
            reading_id=payload.reading_id,
            reading_type=reading_type,
            preferred_time=(
                payload.preferred_time.strip()
                if payload.preferred_time
                else None
            ),
            status="pending",
            response_message=None,
            created_at=now,
            updated_at=now,
        )
    )
    consultation_id = result.inserted_primary_key[0]
    expert_title = (
        "New Tarot Reader request"
        if role_name(expert) == "tarot_reader"
        else "New Spiritual Consultant request"
    )
    reading_context = (
        f" It is linked to a {reading_type} reading."
        if reading_type
        else ""
    )
    expert_message = (
        f"{current_user.full_name or 'A user'} sent you a consultation request "
        f"about “{payload.topic.strip()}”.{reading_context} "
        "Open Consultations to review and accept or reject it."
    )
    create_event_notification(
        db,
        expert.id,
        expert_title,
        expert_message,
        "/consultations",
        f"consultation:{consultation_id}:pending:expert:{expert.id}",
    )
    db.commit()
    # Email is best-effort. In-app notification remains the guaranteed workflow.
    send_event_email(
        expert,
        expert_title,
        expert_message,
        "/consultations",
    )
    row = get_row(db, consultation_id)
    return {
        "ok": True,
        "message": (
            f"Your request was sent to "
            f"{'the Tarot Reader' if role_name(expert) == 'tarot_reader' else 'the Spiritual Consultant'}."
        ),
        "item": serialize(row, current_user, expert),
    }
@router.get("/me")
def my_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if role_name(current_user) != "user":
        raise HTTPException(
            status_code=403,
            detail="This endpoint is for user consultation requests.",
        )
    rows = db.execute(
        select(consultation_table)
        .where(consultation_table.c.user_id == current_user.id)
        .order_by(consultation_table.c.created_at.desc())
    ).mappings().all()
    expert_ids = {int(row["expert_id"]) for row in rows}
    experts = (
        db.query(User)
        .filter(User.id.in_(expert_ids))
        .all()
        if expert_ids
        else []
    )
    expert_map = {expert.id: expert for expert in experts}
    return {
        "items": [
            serialize(
                row,
                current_user,
                expert_map.get(row["expert_id"]),
            )
            for row in rows
        ]
    }
@router.get("/incoming")
def incoming_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if role_name(current_user) not in {"tarot_reader", "consultant"}:
        raise HTTPException(
            status_code=403,
            detail="Only Tarot Readers and Spiritual Consultants can review incoming requests.",
        )
    rows = db.execute(
        select(consultation_table)
        .where(
            and_(
                consultation_table.c.expert_id == current_user.id,
                consultation_table.c.status.in_(
                    ["pending", "accepted", "rejected", "in_progress", "completed"]
                ),
            )
        )
        .order_by(consultation_table.c.created_at.desc())
    ).mappings().all()
    user_ids = {int(row["user_id"]) for row in rows}
    users = (
        db.query(User)
        .filter(User.id.in_(user_ids))
        .all()
        if user_ids
        else []
    )
    user_map = {user.id: user for user in users}
    return {
        "items": [
            serialize(
                row,
                user_map.get(row["user_id"]),
                current_user,
            )
            for row in rows
        ]
    }
def _google_api_json(url: str, access_token: str, payload: dict | None = None, method: str = "GET") -> dict:
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = urllib.request.Request(
        url, data=body, method=method,
        headers={"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(detail)
            google_error = parsed.get("error", {})
            reason = google_error.get("message") or detail
            errors = google_error.get("errors") or []
            if errors:
                first = errors[0]
                reason = (
                    f"{reason} (reason: {first.get('reason', 'unknown')}; "
                    f"domain: {first.get('domain', 'unknown')}; "
                    f"location: {first.get('location', 'unknown')})"
                )
            # Keep Google's structured error available for debugging; this body
            # contains the API error, not the OAuth access token.
            if detail and detail not in reason:
                reason = f"{reason}; response: {detail[:500]}"
        except (ValueError, AttributeError):
            reason = detail or "Google returned an empty error response."
        raise HTTPException(
            status_code=502,
            detail=f"Google Calendar event request failed (HTTP {exc.code}): {str(reason)[:900]}",
        ) from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise HTTPException(status_code=502, detail="Google Calendar could not be reached. No meeting was accepted; please try again.") from exc
def create_real_google_meet(row, requester: User, reader: User) -> tuple[str, str]:
    """Create a real Google Calendar event with a Google Meet conference using OAuth refresh credentials."""
    client_id = os.getenv("GOOGLE_CALENDAR_CLIENT_ID", "").strip()
    client_secret = os.getenv("GOOGLE_CALENDAR_CLIENT_SECRET", "").strip()
    refresh_token = os.getenv("GOOGLE_CALENDAR_REFRESH_TOKEN", "").strip()
    calendar_id = os.getenv("GOOGLE_CALENDAR_ID", "primary").strip() or "primary"
    timezone_name = os.getenv("GOOGLE_CALENDAR_TIMEZONE", "Asia/Kolkata").strip() or "Asia/Kolkata"
    if not all((client_id, client_secret, refresh_token)):
        raise HTTPException(
            status_code=503,
            detail="Google Meet is not configured yet. Set GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET and GOOGLE_CALENDAR_REFRESH_TOKEN in the backend .env before accepting a request.",
        )
    preferred = str(row["preferred_time"] or "").strip()
    if not preferred:
        raise HTTPException(status_code=422, detail="This request has no preferred date/time. Ask the user to submit a date and time before accepting it.")
    try:
        start = datetime.fromisoformat(preferred.replace("Z", "+00:00"))
        calendar_timezone = ZoneInfo(timezone_name)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="The requested date/time is not in a supported format. Ask the user to resubmit it.") from exc
    except ZoneInfoNotFoundError as exc:
        raise HTTPException(status_code=503, detail=f"GOOGLE_CALENDAR_TIMEZONE is invalid: {timezone_name!r}. Use a valid IANA timezone such as Asia/Kolkata.") from exc
    # Always send RFC3339 dateTimes with an explicit UTC offset. This avoids
    # Calendar rejecting ambiguous/local timestamps when parsing an event.
    if start.tzinfo is None:
        start = start.replace(tzinfo=calendar_timezone)
    start = start.replace(second=0, microsecond=0)
    end = start + timedelta(minutes=45)
    if start <= datetime.now(timezone.utc):
        raise HTTPException(status_code=422, detail="The requested session time is in the past. Decline with an explanation and ask the user to choose another time.")
    start_obj = {"dateTime": start.isoformat(timespec="seconds"), "timeZone": timezone_name}
    end_obj = {"dateTime": end.isoformat(timespec="seconds"), "timeZone": timezone_name}
    # A Google Meet conference can be created without Calendar attendees.
    # Include only valid emails; a missing profile email must not block acceptance.
    requester_email = str(getattr(requester, "email", "") or "").strip()
    reader_email = str(getattr(reader, "email", "") or "").strip()
    email_pattern = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    attendees = []
    if requester_email and email_pattern.match(requester_email):
        attendees.append({"email": requester_email})
    if reader_email and email_pattern.match(reader_email):
        attendees.append({"email": reader_email})
    token_body = urllib.parse.urlencode({
        "client_id": client_id, "client_secret": client_secret,
        "refresh_token": refresh_token, "grant_type": "refresh_token",
    }).encode("utf-8")
    token_request = urllib.request.Request(
        "https://oauth2.googleapis.com/token", data=token_body, method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        with urllib.request.urlopen(token_request, timeout=20) as response:
            token_data = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(status_code=503, detail=f"Google Calendar authorization failed. Check the refresh token and Calendar scope: {detail[:500]}") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise HTTPException(status_code=502, detail="Could not reach Google authorization to create a Meet link.") from exc
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=503, detail="Google did not return an access token. Re-authorize the Calendar integration.")
    event = {
        "summary": f"Tarot consultation: {row['topic']}",
        "description": f"Tarot consultation arranged through the Palmistry & Tarot Intelligence Platform.\n\nUser: {getattr(requester, 'full_name', None) or 'User'}\nReader: {getattr(reader, 'full_name', None) or 'Tarot Reader'}\nRequest ID: {row['id']}",
        "start": start_obj, "end": end_obj,
        "conferenceData": {"createRequest": {"requestId": str(uuid.uuid4()), "conferenceSolutionKey": {"type": "hangoutsMeet"}}},
        "guestsCanModify": False,
    }
    if attendees:
        event["attendees"] = attendees
    encoded_calendar = urllib.parse.quote(calendar_id, safe="")
    created = _google_api_json(
        f"https://www.googleapis.com/calendar/v3/calendars/{encoded_calendar}/events?conferenceDataVersion=1&sendUpdates=all",
        access_token, event, "POST",
    )
    event_id = str(created.get("id") or "")
    meet_link = created.get("hangoutLink")
    if not meet_link:
        for entry in created.get("conferenceData", {}).get("entryPoints", []):
            if entry.get("entryPointType") == "video" and entry.get("uri"):
                meet_link = entry["uri"]
                break
    # Google can finish conference provisioning shortly after event insertion.
    if not meet_link and event_id:
        event_url = f"https://www.googleapis.com/calendar/v3/calendars/{encoded_calendar}/events/{urllib.parse.quote(event_id, safe='')}"
        for _ in range(3):
            time.sleep(1)
            refreshed = _google_api_json(event_url, access_token)
            meet_link = refreshed.get("hangoutLink")
            if not meet_link:
                for entry in refreshed.get("conferenceData", {}).get("entryPoints", []):
                    if entry.get("entryPointType") == "video" and entry.get("uri"):
                        meet_link = entry["uri"]
                        break
            if meet_link:
                break
    if not meet_link:
        raise HTTPException(status_code=502, detail="Google Calendar created the event but did not return a Meet link. Check that Google Meet is enabled for this Calendar account, then try again.")
    return meet_link, event_id
@router.post("/{consultation_id}/decision")
def decide_consultation(
    consultation_id: int,
    payload: ConsultationDecision,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if role_name(current_user) not in {"tarot_reader", "consultant"}:
        raise HTTPException(
            status_code=403,
            detail="Only Tarot Readers and Spiritual Consultants can verify requests.",
        )
    status_value = payload.status.strip().lower()
    if status_value not in {"accepted", "rejected", "in_progress", "completed"}:
        raise HTTPException(
            status_code=422,
            detail="Status must be accepted, rejected, in_progress or completed.",
        )
    row = get_row(db, consultation_id)
    if not row:
        raise HTTPException(
            status_code=404,
            detail="Consultation request not found.",
        )
    if int(row["expert_id"]) != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="This consultation request is not assigned to you.",
        )
    allowed_transitions = {
        "pending": {"accepted", "rejected"},
        "accepted": {"in_progress"},
        "in_progress": {"completed"},
        "rejected": set(),
        "completed": set(),
    }
    if status_value not in allowed_transitions.get(str(row["status"]), set()):
        raise HTTPException(
            status_code=409,
            detail=f"Cannot change a {row['status']} request to {status_value}.",
        )
    response_text = payload.response_message.strip() if payload.response_message else ""
    if status_value == "rejected" and len(response_text) < 8:
        raise HTTPException(status_code=422, detail="Please explain why you cannot accept this requested date/time so the user understands the reason.")
    requester = (
        db.query(User)
        .filter(User.id == int(row["user_id"]))
        .first()
    )
    if not requester:
        db.rollback()
        raise HTTPException(
            status_code=404,
            detail="The requesting user no longer exists.",
        )
    meet_link = row.get("meet_link")
    google_event_id = row.get("google_event_id")
    if status_value == "accepted":
        if not meet_link:
            meet_link, google_event_id = create_real_google_meet(row, requester, current_user)
        title = "Your consultation request was accepted"
        message = (
            f"{current_user.full_name or 'Your guide'} accepted your consultation "
            f"request about “{row['topic']}”. Your Google Meet link: {meet_link}"
        )
    elif status_value == "rejected":
        title = "Your consultation request was declined"
        message = (
            f"{current_user.full_name or 'Your guide'} could not accept your "
            f"consultation request about “{row['topic']}”. Reason: {response_text}"
        )
    elif status_value == "in_progress":
        title = "Your consultation is in progress"
        message = (
            f"{current_user.full_name or 'Your guide'} marked your consultation "
            f"request as in progress."
        )
    else:
        title = "Your consultation is completed"
        message = (
            f"{current_user.full_name or 'Your guide'} marked your consultation "
            f"request as completed."
        )
    db.execute(
        consultation_table.update()
        .where(consultation_table.c.id == consultation_id)
        .values(
            status=status_value,
            response_message=response_text or None,
            meet_link=meet_link,
            google_event_id=google_event_id,
            updated_at=now_utc_naive(),
        )
    )
    if payload.response_message and status_value != "rejected":
        message += f" Message: {payload.response_message.strip()}"
    create_event_notification(
        db,
        requester.id,
        title,
        message,
        "/consultations",
        f"consultation:{consultation_id}:{status_value}:user:{requester.id}",
    )
    db.commit()
    send_event_email(
        requester,
        title,
        message,
        "/consultations",
    )
    updated = get_row(db, consultation_id)
    return {
        "ok": True,
        "message": title,
        "item": serialize(
            updated,
            requester,
            current_user,
        ),
    }
