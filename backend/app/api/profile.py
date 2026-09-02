from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.profile import (
    ProfileCreate,
    ProfileResponse,
    ProfileUpdate,
)
from app.services.profile_service import (
    create_profile,
    get_profile,
    update_profile,
)


router = APIRouter(
    prefix="/api/v1/profile",
    tags=["Profile"],
)

@router.get(
    "",
    response_model=ProfileResponse,
)
def read_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_profile(
        db=db,
        user_id=current_user.id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    return profile
@router.post(
    "",
    response_model=ProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_profile(
    profile_data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing_profile = get_profile(
        db=db,
        user_id=current_user.id,
    )

    if existing_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists.",
        )

    profile = create_profile(
        db=db,
        user_id=current_user.id,
        name=profile_data.name,
        age_group=profile_data.age_group,
        profile_image=profile_data.profile_image,
    )

    return profile
@router.put(
    "",
    response_model=ProfileResponse,
)
def update_user_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_profile(
        db=db,
        user_id=current_user.id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found.",
        )

    profile = update_profile(
        db=db,
        profile=profile,
        name=profile_data.name,
        age_group=profile_data.age_group,
        profile_image=profile_data.profile_image,
    )

    return profile