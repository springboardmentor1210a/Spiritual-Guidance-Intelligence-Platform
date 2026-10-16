from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.services.ai_interpretation_service import (
    generate_ai_interpretation,
)

from app.services.personality_service import (
    generate_personality_intelligence,
)

from app.services.recommendation_service import (
    generate_recommendations,
)

from app.services.life_trend_service import (
    generate_life_trends,
)

from app.services.dashboard_service import (
    generate_personalized_dashboard,
)

from app.services.milestone3_context_service import (
    create_or_get_combined_context,
)


router = APIRouter(
    prefix="/api/v1/milestone3",
    tags=["Milestone 3"],
)


# ============================================================
# COMBINED PALM + TAROT CONTEXT
# ============================================================


class Milestone3ContextRequest(BaseModel):
    palm_reading_session_id: int
    tarot_reading_session_id: int


@router.post("/context")
def create_milestone3_context(
    payload: Milestone3ContextRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        session = create_or_get_combined_context(
            db=db,
            user_id=current_user.id,
            palm_reading_session_id=payload.palm_reading_session_id,
            tarot_reading_session_id=payload.tarot_reading_session_id,
        )

        return {
            "reading_session_id": session.id,
            "reading_type": session.reading_type,
            "context_type": "palm_and_tarot",
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# AI INTERPRETATION
# ============================================================


@router.post(
    "/ai-interpretation/{reading_session_id}"
)
def create_ai_interpretation(
    reading_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        interpretation = generate_ai_interpretation(
            db=db,
            user_id=current_user.id,
            reading_session_id=reading_session_id,
        )

        return interpretation

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get(
    "/ai-interpretation/{reading_session_id}"
)
def get_ai_interpretation(
    reading_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        interpretation = generate_ai_interpretation(
            db=db,
            user_id=current_user.id,
            reading_session_id=reading_session_id,
        )

        return interpretation

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# PERSONALITY INTELLIGENCE
# ============================================================


@router.get(
    "/personality/{reading_session_id}"
)
def get_personality_intelligence(
    reading_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        personality = generate_personality_intelligence(
            db=db,
            user_id=current_user.id,
            reading_session_id=reading_session_id,
        )

        return personality

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# RECOMMENDATIONS
# ============================================================


@router.get(
    "/recommendations/{reading_session_id}"
)
def get_recommendations(
    reading_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        recommendations = generate_recommendations(
            db=db,
            user_id=current_user.id,
            reading_session_id=reading_session_id,
        )

        return recommendations

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# LIFE TRENDS
# ============================================================


@router.get(
    "/life-trends/{reading_session_id}"
)
def get_life_trends(
    reading_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        life_trends = generate_life_trends(
            db=db,
            user_id=current_user.id,
            reading_session_id=reading_session_id,
        )

        return life_trends

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# PERSONALIZED DASHBOARD
# ============================================================


@router.get(
    "/dashboard/{reading_session_id}"
)
def get_personalized_dashboard(
    reading_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        dashboard = generate_personalized_dashboard(
            db=db,
            user_id=current_user.id,
            reading_session_id=reading_session_id,
        )

        return dashboard

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )