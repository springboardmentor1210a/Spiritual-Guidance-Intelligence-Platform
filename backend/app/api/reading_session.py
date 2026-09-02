from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.reading_session import (
    ReadingSessionCreate,
    ReadingSessionResponse,
)

from app.services.reading_session_service import (
    get_reading_sessions,
    get_reading_session_by_id,
    create_reading_session,
    delete_reading_session,
)


router = APIRouter(
    prefix="/api/v1/reading-sessions",
    tags=["Reading Sessions"],
)


@router.get(
    "",
    response_model=list[ReadingSessionResponse],
)
def read_my_reading_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return get_reading_sessions(
        db=db,
        user_id=current_user.id,
    )


@router.post(
    "",
    response_model=ReadingSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_my_reading_session(
    session_data: ReadingSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return create_reading_session(
        db=db,
        user_id=current_user.id,
        reading_type=session_data.reading_type,
        summary=session_data.summary,
    )


@router.get(
    "/{session_id}",
    response_model=ReadingSessionResponse,
)
def read_my_reading_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    reading_session = get_reading_session_by_id(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
    )

    if reading_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reading session not found.",
        )

    return reading_session


@router.delete(
    "/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_my_reading_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    reading_session = get_reading_session_by_id(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
    )

    if reading_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reading session not found.",
        )

    delete_reading_session(
        db=db,
        reading_session=reading_session,
    )