from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.ai_interpretation import (
    AIInterpretationResponse,
)
from app.services.ai_interpretation_service import (
    generate_ai_interpretation,
)


router = APIRouter(
    prefix="/api/v1/ai-interpretations",
    tags=["AI Interpretation"],
)


@router.post(
    "/reading-session/{reading_session_id}",
    response_model=AIInterpretationResponse,
    status_code=status.HTTP_201_CREATED,
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

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.get(
    "/reading-session/{reading_session_id}",
    response_model=AIInterpretationResponse,
)
def get_ai_interpretation(
    reading_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.ai_interpretation import (
        AIInterpretation,
    )

    interpretation = (
        db.query(AIInterpretation)
        .filter(
            AIInterpretation.reading_session_id
            == reading_session_id,
            AIInterpretation.user_id
            == current_user.id,
        )
        .order_by(
            AIInterpretation.created_at.desc()
        )
        .first()
    )

    if interpretation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI interpretation not found.",
        )

    return interpretation


@router.get(
    "",
    response_model=list[AIInterpretationResponse],
)
def get_my_ai_interpretations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.ai_interpretation import (
        AIInterpretation,
    )

    interpretations = (
        db.query(AIInterpretation)
        .filter(
            AIInterpretation.user_id
            == current_user.id
        )
        .order_by(
            AIInterpretation.created_at.desc()
        )
        .all()
    )

    return interpretations