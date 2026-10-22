from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Profile
from schemas import ProfileCreate, ProfileResponse
from routes.rbac import require_user


router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


PROFILE_FIELDS = [
    "full_name",
    "age",
    "age_group",
    "gender",
    "date_of_birth",
    "occupation",
    "profile_image",
    "interests",
    "spiritual_interests",
    "goals",
    "spiritual_goals",
    "reading_preferences",
]


@router.post("/", response_model=ProfileResponse)
def create_profile(
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_user)
):
    existing_profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    data = profile_data.model_dump(exclude_unset=True)

    new_profile = Profile(
        user_id=current_user.id,
        **data
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


@router.get("/", response_model=ProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user=Depends(require_user)
):
    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return profile


@router.put("/", response_model=ProfileResponse)
def update_profile(
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_user)
):
    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    # Update only fields sent by the frontend.
    data = profile_data.model_dump(exclude_unset=True)

    for field, value in data.items():
        if field in PROFILE_FIELDS:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile