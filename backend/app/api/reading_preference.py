from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.reading_preferences import (
    ReadingPreferenceCreate,
    ReadingPreferenceUpdate,
    ReadingPreferenceResponse,
)

from app.services.reading_preference_service import (
    get_reading_preference,
    create_reading_preference,
    update_reading_preference,
)


router = APIRouter(
    prefix="/api/v1/reading-preferences",
    tags=["Reading Preferences"],
)


@router.get(
    "",
    response_model=ReadingPreferenceResponse,
)
def read_reading_preference(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    preference = get_reading_preference(
        db=db,
        user_id=current_user.id,
    )

    if preference is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reading preferences not found.",
        )

    return preference


@router.post(
    "",
    response_model=ReadingPreferenceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_reading_preference(
    preference_data: ReadingPreferenceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    existing_preference = get_reading_preference(
        db=db,
        user_id=current_user.id,
    )

    if existing_preference is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Reading preferences already exist.",
        )

    preference = create_reading_preference(
        db=db,
        user_id=current_user.id,
        preferred_reading_type=preference_data.preferred_reading_type,
        preferred_spread=preference_data.preferred_spread,
        language=preference_data.language,
        frequency=preference_data.frequency,
    )

    return preference


@router.put(
    "",
    response_model=ReadingPreferenceResponse,
)
def update_user_reading_preference(
    preference_data: ReadingPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    preference = get_reading_preference(
        db=db,
        user_id=current_user.id,
    )

    if preference is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reading preferences not found.",
        )

    preference = update_reading_preference(
        db=db,
        preference=preference,
        preferred_reading_type=preference_data.preferred_reading_type,
        preferred_spread=preference_data.preferred_spread,
        language=preference_data.language,
        frequency=preference_data.frequency,
    )

    return preference