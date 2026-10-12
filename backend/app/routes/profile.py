from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.core.security import verify_password, hash_password
from app.schemas.user import (
    UserResponse,
    UserProfileUpdate,
    PasswordChange
)


router = APIRouter(
    prefix="/profile",
    tags=["User Profile"]
)


@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "role_name": current_user.role.role_name,
        "created_at": current_user.created_at
    }


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Check if another user already has this username
    existing_username = (
        db.query(User)
        .filter(
            User.username == profile_data.username,
            User.user_id != current_user.user_id
        )
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Check if another user already has this email
    existing_email = (
        db.query(User)
        .filter(
            User.email == profile_data.email,
            User.user_id != current_user.user_id
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Update profile
    current_user.username = profile_data.username
    current_user.email = profile_data.email

    db.commit()
    db.refresh(current_user)

    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "role_name": current_user.role.role_name,
        "created_at": current_user.created_at
    }

@router.put("/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify current password
    if not verify_password(
        password_data.current_password,
        current_user.password
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    # Prevent using the same password
    if password_data.current_password == password_data.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password must be different from current password"
        )

    # Hash the new password
    current_user.password = hash_password(
        password_data.new_password
    )

    # Save changes
    db.commit()

    return {
        "message": "Password changed successfully"
    }