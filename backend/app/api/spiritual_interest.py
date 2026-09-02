from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user,require_roles
from app.models.user import User

from app.schemas.spiritual_interest import (
    SpiritualInterestCreate,
    SpiritualInterestResponse,
    UserSpiritualInterestCreate,
)

from app.services.spiritual_interest_service import (
    get_all_spiritual_interests,
    get_spiritual_interest_by_id,
    get_spiritual_interest_by_name,
    create_spiritual_interest,
    get_user_spiritual_interests,
    add_spiritual_interest_to_user,
    remove_spiritual_interest_from_user,
)


router = APIRouter(
    prefix="/api/v1/spiritual-interests",
    tags=["Spiritual Interests"],
)


# -----------------------------------
# MASTER SPIRITUAL INTERESTS
# -----------------------------------

@router.get(
    "",
    response_model=list[SpiritualInterestResponse],
)
def read_all_spiritual_interests(
    db: Session = Depends(get_db),
):
    return get_all_spiritual_interests(db)


@router.post(
    "",
    response_model=SpiritualInterestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_master_spiritual_interest(
    interest_data: SpiritualInterestCreate,
    current_user: User = Depends(
        require_roles("administrator")
    ),
    db: Session = Depends(get_db),
):

    existing_interest = get_spiritual_interest_by_name(
        db=db,
        name=interest_data.name,
    )

    if existing_interest is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Spiritual interest already exists.",
        )

    return create_spiritual_interest(
        db=db,
        name=interest_data.name,
    )


# -----------------------------------
# CURRENT USER'S INTERESTS
# -----------------------------------

@router.get(
    "/me",
    response_model=list[SpiritualInterestResponse],
)
def read_my_spiritual_interests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return get_user_spiritual_interests(
        db=db,
        user_id=current_user.id,
    )


@router.post(
    "/me",
    status_code=status.HTTP_201_CREATED,
)
def add_interest_to_my_profile(
    interest_data: UserSpiritualInterestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    interest = get_spiritual_interest_by_id(
        db=db,
        interest_id=interest_data.interest_id,
    )

    if interest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spiritual interest not found.",
        )

    existing_interests = get_user_spiritual_interests(
        db=db,
        user_id=current_user.id,
    )

    if any(
        existing_interest.id == interest.id
        for existing_interest in existing_interests
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Interest is already assigned to this user.",
        )

    add_spiritual_interest_to_user(
        db=db,
        user_id=current_user.id,
        interest_id=interest.id,
    )

    return {
        "message": "Spiritual interest added successfully."
    }


@router.delete(
    "/me/{interest_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_interest_from_my_profile(
    interest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    removed = remove_spiritual_interest_from_user(
        db=db,
        user_id=current_user.id,
        interest_id=interest_id,
    )

    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interest is not assigned to this user.",
        )