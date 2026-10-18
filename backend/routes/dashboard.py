# ============================================================
# routes/dashboard.py
# USER, ADMIN AND SPIRITUAL CONSULTANT DASHBOARDS
# ============================================================

import json
import logging
from datetime import datetime
from collections import defaultdict


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session


from database.database import get_db
from database.models import (
    User,
    PalmReading,
    TarotReading,
    Report,
    Profile,
    UserSession,
)
from routes.rbac import (
    require_user,
    require_admin,
    require_spiritual_consultant,
    require_tarot_reader,
    
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_model_count(db: Session, model, user_id=None) -> int:
    """Return a database count without using sample data."""
    try:
        query = db.query(model)

        if user_id is not None and hasattr(model, "user_id"):
            query = query.filter(model.user_id == user_id)

        return query.count()

    except Exception:
        logger.exception("Could not count records for %s", model.__name__)
        return 0


def get_user_readings(db: Session, model, user_id: int):
    """Get readings belonging to a specific user."""
    query = db.query(model)

    if hasattr(model, "user_id"):
        query = query.filter(model.user_id == user_id)

    return query.all()


def get_timestamp(record):
    """Read a timestamp only when the model provides one."""
    value = getattr(record, "created_at", None)

    if value is None:
        return None

    if isinstance(value, datetime):
        return value.isoformat()

    return str(value)


def load_tarot_cards(tarot_reading):
    """Parse selected tarot cards safely."""
    raw_cards = getattr(tarot_reading, "selected_cards", None)

    if not raw_cards:
        return []

    if isinstance(raw_cards, list):
        return raw_cards

    if isinstance(raw_cards, str):
        try:
            parsed = json.loads(raw_cards)
            return parsed if isinstance(parsed, list) else []
        except (json.JSONDecodeError, TypeError):
            return []

    return []


def record_to_dict(record, record_type):
    """Convert a reading or report into dashboard activity data."""
    result = {
        "type": record_type,
        "id": getattr(record, "id", None),
        "created_at": get_timestamp(record),
    }

    for field in (
        "reading_type",
        "report_type",
        "title",
        "status",
        "user_id",
    ):
        value = getattr(record, field, None)

        if value is not None:
            result[field] = value

    return result


def sort_activity(items):
    """Sort timestamped activities newest first."""
    return sorted(
        items,
        key=lambda item: item.get("created_at") or "",
        reverse=True,
    )
def build_monthly_trend(records):
    """Group records with valid timestamps by month."""

    monthly_counts = defaultdict(int)

    for record in records:
        value = getattr(record, "created_at", None)

        if value is None:
            continue

        if isinstance(value, str):
            try:
                value = datetime.fromisoformat(
                    value.replace("Z", "+00:00")
                )
            except ValueError:
                continue

        if isinstance(value, datetime):
            month = value.strftime("%Y-%m")
            monthly_counts[month] += 1

    return [
        {
            "month": month,
            "count": monthly_counts[month],
        }
        for month in sorted(monthly_counts)
    ]


# ============================================================
# USER DASHBOARD
# GET /dashboard/summary
# ============================================================

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    """Return dashboard information for the logged-in user."""

    user_id = current_user.id

    palm_readings = get_user_readings(
        db, PalmReading, user_id
    )
    tarot_readings = get_user_readings(
        db, TarotReading, user_id
    )
    reports = get_user_readings(
        db, Report, user_id
    )

    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user_id)
        .first()
        if hasattr(Profile, "user_id")
        else None
    )

    activity = []

    for reading in palm_readings:
        activity.append(record_to_dict(reading, "Palmistry"))

    for reading in tarot_readings:
        activity.append(record_to_dict(reading, "Tarot"))

    for report in reports:
        activity.append(record_to_dict(report, "Report"))

    activity = sort_activity(activity)

    latest_palmistry = (
        record_to_dict(palm_readings[-1], "Palmistry")
        if palm_readings else None
    )

    latest_tarot = (
        record_to_dict(tarot_readings[-1], "Tarot")
        if tarot_readings else None
    )

    latest_report = (
        record_to_dict(reports[-1], "Report")
        if reports else None
    )

    return {
        "success": True,
        "message": "Dashboard data loaded successfully.",
        "user": {
            "user_id": user_id,
            "username": getattr(current_user, "username", None),
            "email": getattr(current_user, "email", None),
            "role": getattr(current_user, "role", None),
        },
        "profile": {
            "available": profile is not None,
        },
        "statistics": {
            "total_palm_readings": len(palm_readings),
            "total_tarot_readings": len(tarot_readings),
            "total_readings": (
                len(palm_readings) + len(tarot_readings)
            ),
            "total_reports": len(reports),
        },
        "latest_palmistry": latest_palmistry,
        "latest_tarot": latest_tarot,
        "latest_report": latest_report,
        "recent_activity": activity[:10],
    }


# ============================================================
# ADMINISTRATOR DASHBOARD
# GET /dashboard/admin/summary
# ============================================================

@router.get("/admin/summary")
def get_admin_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Return system-wide database statistics for administrators."""

    users_count = get_model_count(db, User)
    palm_count = get_model_count(db, PalmReading)
    tarot_count = get_model_count(db, TarotReading)
    report_count = get_model_count(db, Report)
    session_count = get_model_count(db, UserSession)

    # Real registration statistics from the users table.
    total_users = db.query(User).count()

    users_without_registration_date = (
       db.query(User)
       .filter(User.created_at.is_(None))
       .count()
)

    users_by_role = {}

    try:
        role_rows = (
            db.query(User.role, func.count(User.id))
            .group_by(User.role)
            .all()
        )

        users_by_role = {
            str(role or "unspecified"): count
            for role, count in role_rows
        }
    except Exception:
        logger.exception("Could not calculate user roles")

    return {
        "success": True,
        "message": "Administrator dashboard data loaded successfully.",
        "administrator": {
            "user_id": current_user.id,
            "username": getattr(current_user, "username", None),
            "role": getattr(current_user, "role", None),
        },
        "statistics": {
            "total_users": users_count,
            "total_palm_readings": palm_count,
            "total_tarot_readings": tarot_count,
            "total_readings": palm_count + tarot_count,
            "total_reports": report_count,
            "total_application_sessions": session_count,
        },
        "users_by_role": users_by_role,
    }


# ============================================================
# SPIRITUAL CONSULTANT DASHBOARD
# GET /dashboard/consultant/summary
# ============================================================

@router.get("/consultant/summary")
def get_consultant_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_spiritual_consultant),
):
    """Return real database analytics for the consultant dashboard."""

    palm_count = get_model_count(db, PalmReading)
    tarot_count = get_model_count(db, TarotReading)
    report_count = get_model_count(db, Report)
    session_count = get_model_count(db, UserSession)
    # Registration statistics
    total_users = db.query(User).count()

    users_without_registration_date = (
    db.query(User)
    .filter(User.created_at.is_(None))
    .count()
)

    # 1. Count distinct users with reading records.
    unique_users = set()

    for model in (PalmReading, TarotReading):
        try:
            if hasattr(model, "user_id"):
                ids = (
                    db.query(model.user_id)
                    .filter(model.user_id.isnot(None))
                    .distinct()
                    .all()
                )
                unique_users.update(row[0] for row in ids)
        except Exception:
            logger.exception(
                "Could not calculate unique users for %s",
                model.__name__,
            )

    # 2. Palmistry versus Tarot distribution.
    reading_distribution = [
        {"reading_type": "Palmistry", "count": palm_count},
        {"reading_type": "Tarot", "count": tarot_count},
    ]

    # 3. Load real reading records for the monthly reading chart.
    all_readings = []

    for model in (PalmReading, TarotReading):
        try:
            all_readings.extend(db.query(model).all())
        except Exception:
            logger.exception(
                "Could not load reading records from %s",
                model.__name__,
            )

    monthly_reading_trend = build_monthly_trend(all_readings)

    # 4. New user registrations, using actual User.created_at dates.
    monthly_user_counts = defaultdict(int)

    try:
        if hasattr(User, "created_at"):
            for user in db.query(User).all():
                created_at = getattr(user, "created_at", None)

                if created_at is None:
                    continue

                if isinstance(created_at, str):
                    try:
                        created_at = datetime.fromisoformat(
                            created_at.replace("Z", "+00:00")
                        )
                    except ValueError:
                        continue

                if hasattr(created_at, "strftime"):
                    month = created_at.strftime("%Y-%m")
                    monthly_user_counts[month] += 1
        else:
            logger.warning(
                "User.created_at is unavailable; "
                "registration trend will be empty."
            )
    except Exception:
        logger.exception("Could not calculate registration trend")

    monthly_user_trend = [
        {"month": month, "count": count}
        for month, count in sorted(monthly_user_counts.items())
    ]

    # 5. Tarot reading categories.
    tarot_type_counts = defaultdict(int)

    try:
        for reading in db.query(TarotReading).all():
            name = (
                getattr(reading, "reading_type", None)
                or "Unspecified"
            )
            tarot_type_counts[name] += 1
    except Exception:
        logger.exception("Could not calculate Tarot reading types")

    tarot_reading_types = [
        {"reading_type": name, "count": count}
        for name, count in sorted(tarot_type_counts.items())
    ]

    # 6. Recent Palmistry, Tarot, and report activity.
    recent_activity = []

    for model, label in (
        (PalmReading, "Palmistry"),
        (TarotReading, "Tarot"),
        (Report, "Report"),
    ):
        try:
            for record in db.query(model).all():
                recent_activity.append(record_to_dict(record, label))
        except Exception:
            logger.exception(
                "Could not load activity for %s",
                model.__name__,
            )

    recent_activity = sort_activity(recent_activity)[:20]

    # 7. Actual feedback statistics and rating distribution.
    feedback_count = 0
    average_feedback = None
    rating_distribution = []

    try:
        from database.models import GuidanceFeedback

        feedback_count = db.query(GuidanceFeedback).count()

        if feedback_count:
            average = (
                db.query(func.avg(GuidanceFeedback.rating))
                .scalar()
            )

            if average is not None:
                average_feedback = round(float(average), 2)

            rating_rows = (
                db.query(
                    GuidanceFeedback.rating,
                    func.count(GuidanceFeedback.rating),
                )
                .filter(GuidanceFeedback.rating.isnot(None))
                .group_by(GuidanceFeedback.rating)
                .order_by(GuidanceFeedback.rating)
                .all()
            )

            rating_distribution = [
                {"rating": rating, "count": count}
                for rating, count in rating_rows
            ]

    except ImportError:
        logger.warning("GuidanceFeedback model is not available.")
    except Exception:
        logger.exception("Could not calculate feedback statistics")

    # 8. Return every dataset needed by the dashboard.
    return {
        "success": True,
        "message": "Consultant dashboard data loaded successfully.",
        "consultant": {
            "user_id": current_user.id,
            "username": getattr(current_user, "username", None),
            "email": getattr(current_user, "email", None),
            "role": getattr(current_user, "role", None),
        },
        "statistics": {
            "total_users": total_users,
            "users_without_registration_date": users_without_registration_date,
            "total_readings": palm_count + tarot_count,
            "total_palm_readings": palm_count,
            "total_tarot_readings": tarot_count,
            "unique_users_with_readings": len(unique_users),
            "completed_readings": palm_count + tarot_count,
            "total_reports": report_count,
            "total_application_sessions": session_count,
            "active_application_sessions": None,
            "average_feedback": average_feedback,
            "feedback_count": feedback_count,
        },
        "reading_distribution": reading_distribution,
        "monthly_user_trend": monthly_user_trend,
        "monthly_reading_trend": monthly_reading_trend,
        "tarot_reading_types": tarot_reading_types,
        "rating_distribution": rating_distribution,
        "recent_activity": recent_activity,
        "data_limitations": [
            "Registration trends require valid User.created_at values.",
            "Reading trends require stored reading timestamps.",
            "Feedback charts require stored feedback ratings.",
            "Active session counts require a known session status field.",
        ],
    }
# ============================================================
# TAROT READER DASHBOARD
# GET /dashboard/tarot-reader/summary
# ============================================================

@router.get("/tarot-reader/summary")
def get_tarot_reader_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tarot_reader),
):
    """Return live tarot reading analytics and reading history."""

    readings = (
        db.query(TarotReading)
        .order_by(TarotReading.id.desc())
        .all()
    )

    reading_types = {}

    for reading in readings:
        reading_type = getattr(
            reading, "reading_type", None
        ) or "Unspecified"

        reading_types[reading_type] = (
            reading_types.get(reading_type, 0) + 1
        )

    history = []

    for reading in readings:
        created_at = getattr(reading, "created_at", None)

        history.append({
            "id": reading.id,
            "user_id": getattr(reading, "user_id", None),
            "reading_type": getattr(
                reading, "reading_type", None
            ) or "Unspecified",
            "created_at": (
                created_at.isoformat()
                if created_at is not None
                else None
            ),
            "date": (
                created_at.strftime("%Y-%m-%d")
                if created_at is not None
                else "Not recorded"
            ),
            "time": (
                created_at.strftime("%I:%M:%S %p")
                if created_at is not None
                else "Not recorded"
            ),
        })

    unique_users = len({
        item["user_id"]
        for item in history
        if item["user_id"] is not None
    })

    return {
        "success": True,
        "message": "Tarot dashboard data loaded successfully.",
        "statistics": {
            "total_tarot_readings": len(readings),
            "unique_users": unique_users,
            "reading_types_count": len(reading_types),
        },
        "reading_types": [
            {
                "reading_type": name,
                "count": count,
            }
            for name, count in reading_types.items()
        ],
        "reading_history": history,
    }