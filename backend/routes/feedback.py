# ============================================================
# routes/feedback.py
# REAL GUIDANCE FEEDBACK API
# ============================================================

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import (
    User,
    PalmReading,
    TarotReading,
    GuidanceFeedback,
)
from auth import get_current_user
from routes.rbac import require_spiritual_consultant


router = APIRouter(
    prefix="/feedback",
    tags=["Guidance Feedback"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class FeedbackCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)
    palm_reading_id: int | None = Field(default=None, gt=0)
    tarot_reading_id: int | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def validate_reading_reference(self):
        if (
            self.palm_reading_id is None
            and self.tarot_reading_id is None
        ):
            raise ValueError(
                "Provide a palmistry reading ID, a tarot reading ID, "
                "or both for combined guidance."
            )
        return self


# ============================================================
# SUBMIT FEEDBACK
# POST /feedback/
# ============================================================

@router.post("/")
def submit_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # A user may rate only their own readings.

    if payload.palm_reading_id is not None:
        palm = (
            db.query(PalmReading)
            .filter(
                PalmReading.id == payload.palm_reading_id,
                PalmReading.user_id == current_user.id,
            )
            .first()
        )

        if not palm:
            raise HTTPException(
                status_code=404,
                detail="Palmistry reading not found for this user.",
            )

    if payload.tarot_reading_id is not None:
        tarot = (
            db.query(TarotReading)
            .filter(
                TarotReading.id == payload.tarot_reading_id,
                TarotReading.user_id == current_user.id,
            )
            .first()
        )

        if not tarot:
            raise HTTPException(
                status_code=404,
                detail="Tarot reading not found for this user.",
            )

    # Prevent duplicate feedback for the same reading
    # or the same combination of readings by the same user.

    duplicate_query = db.query(GuidanceFeedback).filter(
        GuidanceFeedback.user_id == current_user.id
    )

    if payload.palm_reading_id is None:
        duplicate_query = duplicate_query.filter(
            GuidanceFeedback.palm_reading_id.is_(None)
        )
    else:
        duplicate_query = duplicate_query.filter(
            GuidanceFeedback.palm_reading_id
            == payload.palm_reading_id
        )

    if payload.tarot_reading_id is None:
        duplicate_query = duplicate_query.filter(
            GuidanceFeedback.tarot_reading_id.is_(None)
        )
    else:
        duplicate_query = duplicate_query.filter(
            GuidanceFeedback.tarot_reading_id
            == payload.tarot_reading_id
        )

    if duplicate_query.first():
        raise HTTPException(
            status_code=409,
            detail="Feedback has already been submitted for this reading.",
        )

    feedback = GuidanceFeedback(
        user_id=current_user.id,
        palm_reading_id=payload.palm_reading_id,
        tarot_reading_id=payload.tarot_reading_id,
        rating=payload.rating,
        comment=payload.comment.strip() if payload.comment else None,
        created_at=datetime.utcnow(),
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return {
        "success": True,
        "message": "Feedback submitted successfully.",
        "feedback": {
            "id": feedback.id,
            "rating": feedback.rating,
            "comment": feedback.comment,
            "palm_reading_id": feedback.palm_reading_id,
            "tarot_reading_id": feedback.tarot_reading_id,
            "created_at": feedback.created_at.isoformat(),
        },
    }


# ============================================================
# CONSULTANT FEEDBACK SUMMARY
# GET /feedback/summary
# ============================================================

@router.get("/summary")
def get_feedback_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_spiritual_consultant),
):
    total_feedback = db.query(GuidanceFeedback).count()

    average_rating = (
        db.query(func.avg(GuidanceFeedback.rating)).scalar()
    )

    rating_rows = (
        db.query(
            GuidanceFeedback.rating,
            func.count(GuidanceFeedback.id),
        )
        .group_by(GuidanceFeedback.rating)
        .all()
    )

    rating_counts = {
        rating: count for rating, count in rating_rows
    }

    distribution = [
        {
            "rating": stars,
            "count": rating_counts.get(stars, 0),
        }
        for stars in range(1, 6)
    ]

    recent_rows = (
        db.query(GuidanceFeedback, User.username)
        .join(User, User.id == GuidanceFeedback.user_id)
        .order_by(GuidanceFeedback.created_at.desc())
        .limit(10)
        .all()
    )

    recent_feedback = []

    for item, username in recent_rows:
        if item.palm_reading_id and item.tarot_reading_id:
            reading_type = "Combined Guidance"
        elif item.palm_reading_id:
            reading_type = "Palmistry"
        else:
            reading_type = "Tarot"

        recent_feedback.append({
            "feedback_id": item.id,
            "username": username,
            "reading_type": reading_type,
            "rating": item.rating,
            "comment": item.comment,
            "created_at": (
                item.created_at.isoformat()
                if item.created_at else None
            ),
        })

    return {
        "success": True,
        "total_feedback": total_feedback,
        "average_rating": (
            round(float(average_rating), 2)
            if average_rating is not None else None
        ),
        "rating_distribution": distribution,
        "recent_feedback": recent_feedback,
    }