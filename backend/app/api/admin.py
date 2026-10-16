from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user

from app.models.user import User
from app.models.role import Role
from app.models.reading_session import ReadingSession
from app.models.reading_report import ReadingReport


router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Administrator"],
)


def require_admin(
    current_user: User = Depends(get_current_user),
):
    if current_user.role.name != "administrator":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required.",
        )

    return current_user


# =========================================================
# ADMIN OVERVIEW
# =========================================================

@router.get("/overview")
def get_admin_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    total_users = (
        db.query(func.count(User.id))
        .scalar()
        or 0
    )

    active_users = (
        db.query(func.count(User.id))
        .filter(User.is_active.is_(True))
        .scalar()
        or 0
    )

    inactive_users = (
        db.query(func.count(User.id))
        .filter(User.is_active.is_(False))
        .scalar()
        or 0
    )

    total_readers = (
        db.query(func.count(User.id))
        .join(Role)
        .filter(Role.name == "tarot_reader")
        .scalar()
        or 0
    )

    total_consultants = (
        db.query(func.count(User.id))
        .join(Role)
        .filter(Role.name == "spiritual_consultant")
        .scalar()
        or 0
    )

    total_administrators = (
        db.query(func.count(User.id))
        .join(Role)
        .filter(Role.name == "administrator")
        .scalar()
        or 0
    )

    total_readings = (
        db.query(func.count(ReadingSession.id))
        .scalar()
        or 0
    )

    total_tarot_readings = (
        db.query(func.count(ReadingSession.id))
        .filter(
            ReadingSession.reading_type.ilike("%tarot%")
        )
        .scalar()
        or 0
    )

    total_palm_analyses = (
        db.query(func.count(ReadingSession.id))
        .filter(
            ReadingSession.reading_type.ilike("%palm%")
        )
        .scalar()
        or 0
    )

    total_reports = (
        db.query(func.count(ReadingReport.id))
        .scalar()
        or 0
    )

    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "inactive": inactive_users,
        },
        "roles": {
            "tarot_readers": total_readers,
            "spiritual_consultants": total_consultants,
            "administrators": total_administrators,
        },
        "readings": {
            "total": total_readings,
            "tarot": total_tarot_readings,
            "palmistry": total_palm_analyses,
        },
        "reports": {
            "total": total_reports,
        },
    }


# =========================================================
# USERS
# =========================================================

@router.get("/users")
def get_admin_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    users = (
        db.query(User)
        .join(Role)
        .order_by(User.created_at.desc())
        .all()
    )

    return {
        "users": [
            {
                "id": user.id,
                "email": user.email,
                "role": user.role.name,
                "is_active": user.is_active,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
            }
            for user in users
        ]
    }


# =========================================================
# READINGS
# =========================================================

@router.get("/readings")
def get_admin_readings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    readings = (
        db.query(ReadingSession, User.email)
        .join(User, ReadingSession.user_id == User.id)
        .order_by(ReadingSession.created_at.desc())
        .all()
    )

    return {
        "readings": [
            {
                "id": reading.id,
                "user_id": reading.user_id,
                "user_email": email,
                "reading_type": reading.reading_type,
                "summary": reading.summary,
                "created_at": reading.created_at,
                "has_report": reading.report is not None,
            }
            for reading, email in readings
        ]
    }


# =========================================================
# REPORTS
# =========================================================

@router.get("/reports")
def get_admin_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    reports = (
        db.query(ReadingReport, User.email)
        .join(User, ReadingReport.user_id == User.id)
        .order_by(ReadingReport.created_at.desc())
        .all()
    )

    return {
        "reports": [
            {
                "id": report.id,
                "user_id": report.user_id,
                "user_email": email,
                "reading_session_id": report.reading_session_id,
                "report_type": report.report_type,
                "title": report.title,
                "created_at": report.created_at,
            }
            for report, email in reports
        ]
    }


# =========================================================
# SYSTEM INFORMATION
# =========================================================

@router.get("/system")
def get_admin_system(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return {
        "platform": {
            "name": "Palmistry & Tarot Intelligence Platform",
            "version": "1.0.0",
        },
        "services": {
            "authentication": "Connected",
            "database": "Connected",
            "tarot_engine": "Available",
            "palmistry": "Available",
            "reports": "Available",
        },
        "database": {
            "users": db.query(func.count(User.id)).scalar() or 0,
            "reading_sessions": (
                db.query(func.count(ReadingSession.id)).scalar()
                or 0
            ),
            "reports": (
                db.query(func.count(ReadingReport.id)).scalar()
                or 0
            ),
        },
    }