from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, text, inspect
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Reading, User, UserProfile


router = APIRouter(prefix="/api/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if str(current_user.role or "").lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access is required.",
        )

    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This administrator account is inactive.",
        )

    return current_user


class RoleUpdate(BaseModel):
    role: str = Field(min_length=1, max_length=30)


class StatusUpdate(BaseModel):
    is_active: bool


def user_payload(user: User, profile: UserProfile | None = None) -> dict:
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "profile_completed": bool(
            profile
            and any(
                [
                    profile.age_group,
                    profile.interests,
                    profile.spiritual_goals,
                    profile.reading_preferences,
                    profile.bio,
                ]
            )
        ),
    }


def reading_payload(item: Reading, user: User | None = None) -> dict:
    return {
        "id": item.id,
        "user_id": item.user_id,
        "user_name": user.full_name if user else None,
        "user_email": user.email if user else None,
        "reading_type": item.reading_type,
        "title": item.title,
        "input_summary": item.input_summary,
        "result_preview": (item.result_text or "")[:420],
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "detection_status": item.detection_status,
        "has_palm_image": bool(item.image_path),
    }


def write_audit_log(db: Session, actor: User, action: str, target_type: str, target_id: str | int | None = None, details: str | None = None) -> None:
    """Persist a small audit trail for privileged administrator actions."""
    db.execute(text("""CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER,
        actor_name VARCHAR(180),
        action VARCHAR(120) NOT NULL,
        target_type VARCHAR(80) NOT NULL,
        target_id VARCHAR(80),
        details TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )"""))
    db.execute(text("""INSERT INTO admin_audit_logs
        (actor_id, actor_name, action, target_type, target_id, details)
        VALUES (:actor_id, :actor_name, :action, :target_type, :target_id, :details)"""), {
        "actor_id": actor.id,
        "actor_name": actor.full_name,
        "action": action,
        "target_type": target_type,
        "target_id": str(target_id) if target_id is not None else None,
        "details": details,
    })


@router.get("/dashboard")
def admin_dashboard(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = (
        db.query(func.count(User.id)).filter(User.is_active.is_(True)).scalar() or 0
    )
    user_role_users = (
        db.query(func.count(User.id)).filter(User.role == "user").scalar() or 0
    )
    tarot_reader_users = (
        db.query(func.count(User.id)).filter(User.role == "tarot_reader").scalar() or 0
    )
    consultant_users = (
        db.query(func.count(User.id)).filter(User.role == "consultant").scalar() or 0
    )
    admin_users = (
        db.query(func.count(User.id)).filter(User.role == "admin").scalar() or 0
    )
    total_readings = db.query(func.count(Reading.id)).scalar() or 0
    palm_readings = (
        db.query(func.count(Reading.id))
        .filter(Reading.reading_type == "palm")
        .scalar()
        or 0
    )
    tarot_readings = (
        db.query(func.count(Reading.id))
        .filter(Reading.reading_type == "tarot")
        .scalar()
        or 0
    )

    profiles_completed = (
        db.query(func.count(UserProfile.id))
        .filter(
            (UserProfile.age_group.isnot(None))
            | (UserProfile.interests.isnot(None))
            | (UserProfile.spiritual_goals.isnot(None))
            | (UserProfile.reading_preferences.isnot(None))
            | (UserProfile.bio.isnot(None))
        )
        .scalar()
        or 0
    )

    users = db.query(User).order_by(User.created_at.desc()).limit(8).all()
    profiles = {
        profile.user_id: profile
        for profile in db.query(UserProfile)
        .filter(UserProfile.user_id.in_([user.id for user in users]))
        .all()
    } if users else {}

    recent_readings_db = (
        db.query(Reading)
        .order_by(Reading.created_at.desc())
        .limit(10)
        .all()
    )
    reading_users = {
        user.id: user
        for user in db.query(User)
        .filter(User.id.in_([item.user_id for item in recent_readings_db]))
        .all()
    } if recent_readings_db else {}

    # Show the current calendar month plus the five preceding
    # calendar months. Do not use a fixed day count such as 155 days,
    # because that can accidentally start in April when the current
    # month is October.
    now = datetime.now(timezone.utc)
    current_month = now.replace(
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    def shift_month(month_start: datetime, months: int) -> datetime:
        total_months = month_start.year * 12 + (month_start.month - 1) + months
        year = total_months // 12
        month = (total_months % 12) + 1
        return month_start.replace(year=year, month=month)

    monthly = []

    # Six calendar months including the current month:
    # May, Jun, Jul, Aug, Sep, Oct (when current month is October).
    first_month = shift_month(current_month, -5)

    for offset in range(6):
        month_start = shift_month(first_month, offset)
        month_end = shift_month(month_start, 1)

        reading_count = (
            db.query(func.count(Reading.id))
            .filter(
                Reading.created_at >= month_start,
                Reading.created_at < month_end,
            )
            .scalar()
            or 0
        )

        new_users = (
            db.query(func.count(User.id))
            .filter(
                User.created_at >= month_start,
                User.created_at < month_end,
            )
            .scalar()
            or 0
        )

        monthly.append(
            {
                "key": month_start.strftime("%Y-%m"),
                "label": month_start.strftime("%b"),
                "readings": reading_count,
                "new_users": new_users,
            }
        )

    return {
        "metrics": {
            "total_users": total_users,
            "active_users": active_users,
            "admin_users": admin_users,
            "user_users": user_role_users,
            "tarot_reader_users": tarot_reader_users,
            "consultant_users": consultant_users,
            "total_readings": total_readings,
            "palm_readings": palm_readings,
            "tarot_readings": tarot_readings,
            "profiles_completed": profiles_completed,
        },
        "reading_mix": {
            "palm": palm_readings,
            "tarot": tarot_readings,
        },
        "monthly_activity": monthly,
        "recent_users": [
            user_payload(user, profiles.get(user.id)) for user in users
        ],
        "recent_readings": [
            reading_payload(item, reading_users.get(item.user_id))
            for item in recent_readings_db
        ],
    }


@router.get("/users")
def admin_users(
    search: str = Query(default="", max_length=120),
    role: str = Query(default="", max_length=30),
    active: str = Query(default="", max_length=10),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    query = db.query(User)

    if search.strip():
        pattern = f"%{search.strip()}%"
        query = query.filter(
            (User.full_name.ilike(pattern)) | (User.email.ilike(pattern))
        )

    if role.strip():
        query = query.filter(User.role == role.strip().lower())

    if active.lower() == "true":
        query = query.filter(User.is_active.is_(True))
    elif active.lower() == "false":
        query = query.filter(User.is_active.is_(False))

    users = query.order_by(User.created_at.desc()).limit(limit).all()

    profiles = {
        profile.user_id: profile
        for profile in db.query(UserProfile)
        .filter(UserProfile.user_id.in_([user.id for user in users]))
        .all()
    } if users else {}

    reading_counts = dict(
        db.query(Reading.user_id, func.count(Reading.id))
        .filter(Reading.user_id.in_([user.id for user in users]))
        .group_by(Reading.user_id)
        .all()
    ) if users else {}

    result = []
    for user in users:
        payload = user_payload(user, profiles.get(user.id))
        payload["reading_count"] = int(reading_counts.get(user.id, 0))
        result.append(payload)

    return {"items": result, "total": len(result)}


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: RoleUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    role = payload.role.strip().lower()

    allowed_roles = {"user", "tarot_reader", "consultant", "admin"}
    if role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Role must be User, Tarot Reader, Spiritual Consultant, or Administrator.",
        )

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found.")

    if target.id == current_user.id and role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own administrator role.",
        )

    previous_role = target.role
    target.role = role
    write_audit_log(db, current_user, "role_updated", "user", target.id, f"{previous_role} -> {role}")
    db.commit()
    db.refresh(target)

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == target.id)
        .first()
    )

    return user_payload(target, profile)


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    payload: StatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found.")

    if target.id == current_user.id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own administrator account.",
        )

    target.is_active = payload.is_active
    write_audit_log(db, current_user, "account_status_updated", "user", target.id, f"is_active={payload.is_active}")
    db.commit()
    db.refresh(target)

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == target.id)
        .first()
    )

    return user_payload(target, profile)


@router.get("/readings")
def admin_readings(
    reading_type: str = Query(default="", max_length=30),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user

    query = db.query(Reading)

    if reading_type.strip().lower() in {"palm", "tarot"}:
        query = query.filter(Reading.reading_type == reading_type.strip().lower())

    items = query.order_by(Reading.created_at.desc()).limit(limit).all()

    users = {
        user.id: user
        for user in db.query(User)
        .filter(User.id.in_([item.user_id for item in items]))
        .all()
    } if items else {}

    return {
        "items": [
            reading_payload(item, users.get(item.user_id))
            for item in items
        ],
        "total": len(items),
    }


@router.get("/system")
def admin_system(
    current_user: User = Depends(require_admin),
):
    return {
        "status": "operational",
        "administrator": {
            "id": current_user.id,
            "name": current_user.full_name,
            "email": current_user.email,
        },
        "backend": "FastAPI",
        "database": "PostgreSQL",
        "authentication": "JWT",
        "access_control": "Role-based",
        "reading_engine": "Palm + Tarot",
    }


@router.get("/consultations")
def admin_consultations(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Read-only overview of session requests for platform administration."""
    del current_user
    if not inspect(db.get_bind()).has_table("consultations"):
        return {"items": [], "total": 0}
    rows = db.execute(text("""
        SELECT c.id, c.user_id, c.expert_id, c.expert_role, c.topic, c.message,
               c.preferred_time, c.status, c.created_at, c.updated_at,
               u.full_name AS user_name, u.email AS user_email,
               g.full_name AS expert_name
        FROM consultations c
        LEFT JOIN users u ON u.id = c.user_id
        LEFT JOIN users g ON g.id = COALESCE(c.expert_id, c.consultant_id)
        ORDER BY c.created_at DESC LIMIT 300
    """)).mappings().all()
    items = []
    for row in rows:
        item = dict(row)
        for key in ("created_at", "updated_at"):
            if item.get(key): item[key] = item[key].isoformat()
        item["message"] = (item.get("message") or "")[:260]
        items.append(item)
    return {"items": items, "total": len(items)}


@router.get("/feedback")
def admin_feedback(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Expose consultant feedback summaries for complaint/quality triage."""
    del current_user
    if not inspect(db.get_bind()).has_table("consultant_feedback"):
        return {"items": [], "total": 0}
    rows = db.execute(text("""
        SELECT f.id, f.reading_id, f.user_id, f.helpful, f.rating, f.comment,
               f.created_at, u.full_name AS user_name, u.email AS user_email,
               r.reading_type, r.title
        FROM consultant_feedback f
        LEFT JOIN users u ON u.id = f.user_id
        LEFT JOIN readings r ON r.id = f.reading_id
        ORDER BY f.created_at DESC LIMIT 300
    """)).mappings().all()
    items = []
    for row in rows:
        item = dict(row)
        if item.get("created_at"): item["created_at"] = item["created_at"].isoformat()
        items.append(item)
    return {"items": items, "total": len(items)}


@router.get("/audit-logs")
def admin_audit_logs(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    del current_user
    db.execute(text("""CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id SERIAL PRIMARY KEY, actor_id INTEGER, actor_name VARCHAR(180),
        action VARCHAR(120) NOT NULL, target_type VARCHAR(80) NOT NULL,
        target_id VARCHAR(80), details TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )"""))
    rows = db.execute(text("SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 300")).mappings().all()
    items = []
    for row in rows:
        item = dict(row)
        if item.get("created_at"): item["created_at"] = item["created_at"].isoformat()
        items.append(item)
    return {"items": items, "total": len(items)}


@router.post("/audit-logs")
def admin_record_audit_event(
    payload: dict,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    action = str(payload.get("action", "")).strip()[:120]
    details = str(payload.get("details", "")).strip()[:2000]
    if not action:
        raise HTTPException(status_code=422, detail="An action is required.")
    write_audit_log(db, current_user, action, "platform", None, details)
    db.commit()
    return {"status": "recorded"}
