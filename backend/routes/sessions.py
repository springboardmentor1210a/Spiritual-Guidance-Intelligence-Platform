from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import UserSession, User
from auth import get_current_user


router = APIRouter(
    prefix="/sessions",
    tags=["Session Tracking"]
)


@router.get("/my-sessions")
def get_my_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = (
        db.query(UserSession)
        .filter(UserSession.user_id == current_user.id)
        .order_by(UserSession.started_at.desc())
        .limit(50)
        .all()
    )

    now = datetime.utcnow()
    results = []

    for session in sessions:
        end_time = session.ended_at or now
        duration_seconds = max(
            0,
            int((end_time - session.started_at).total_seconds())
        )

        results.append({
            "session_id": session.id,
            "user_id": session.user_id,
            "username": current_user.username,
            "started_at": session.started_at.isoformat(),
            "ended_at": (
                session.ended_at.isoformat()
                if session.ended_at else None
            ),
            "last_activity": (
                session.last_activity.isoformat()
                if session.last_activity else None
            ),
            "is_active": session.is_active,
            "duration_seconds": duration_seconds
        })

    return {
        "total_sessions": len(results),
        "active_sessions": sum(
            1 for item in results if item["is_active"]
        ),
        "sessions": results
    }