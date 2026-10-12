from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserProfileUpdate,
    Token
)
from app.core.security import hash_password, verify_password, create_access_token
 
from app.database.connection import get_db
from app.models.user import User
from app.models.role import Role
from app.core.dependencies import get_current_user, require_role


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    # Check whether username already exists
    existing_username = (
        db.query(User)
        .filter(User.username == user_data.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # Check whether email already exists
    existing_email = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Check whether the selected role exists
    role = (
        db.query(Role)
        .filter(Role.role_id == user_data.role_id)
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=400,
            detail="Invalid role_id"
        )

    # Hash password before storing it
    hashed_password = hash_password(user_data.password)

    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        gender=user_data.gender,
        password=hashed_password,
        role_id=user_data.role_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
    "user_id": new_user.user_id,
    "username": new_user.username,
    "email": new_user.email,
    "gender": new_user.gender,
    "role_id": new_user.role_id,
    "role_name": role.role_name,
    "created_at": new_user.created_at
    }



@router.post("/login", response_model=Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.username == form_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.user_id),
            "role_id": user.role_id
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "gender": current_user.gender,
        "age_group": current_user.age_group,
        "interests": current_user.interests,
        "spiritual_goals": current_user.spiritual_goals,
        "reading_preferences": current_user.reading_preferences,
        "role_name": current_user.role.role_name,
        "created_at": current_user.created_at
    }

@router.get("/user-area")
def user_area(
    current_user: User = Depends(require_role(1))
):
    return {
        "message": "Welcome to the User area",
        "username": current_user.username,
        "role_id": current_user.role_id
    }


@router.get("/tarot-reader-area")
def tarot_reader_area(
    current_user: User = Depends(require_role(2))
):
    return {
        "message": "Welcome to the Tarot Reader area",
        "username": current_user.username,
        "role_id": current_user.role_id
    }


@router.get("/spiritual-consultant-area")
def spiritual_consultant_area(
    current_user: User = Depends(require_role(3))
):
    return {
        "message": "Welcome to the Spiritual Consultant area",
        "username": current_user.username,
        "role_id": current_user.role_id
    }


@router.get("/admin-area")
def admin_area(
    current_user: User = Depends(require_role(4))
):
    return {
        "message": "Welcome to the Administrator area",
        "username": current_user.username,
        "role_id": current_user.role_id
    }

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check username if user wants to change it
    if profile_data.username:
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

        current_user.username = profile_data.username

    # Check email if user wants to change it
    if profile_data.email:
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

        current_user.email = profile_data.email

    if profile_data.gender is not None:
        current_user.gender = profile_data.gender

    if profile_data.age_group is not None:
        current_user.age_group = profile_data.age_group

    if profile_data.interests is not None:
        current_user.interests = profile_data.interests

    if profile_data.spiritual_goals is not None:
        current_user.spiritual_goals = profile_data.spiritual_goals

    if profile_data.reading_preferences is not None:
        current_user.reading_preferences = profile_data.reading_preferences

    

    db.commit()
    db.refresh(current_user)

    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "gender": current_user.gender,
        "age_group": current_user.age_group,
        "interests": current_user.interests,
        "spiritual_goals": current_user.spiritual_goals,
        "reading_preferences": current_user.reading_preferences,
        "role_name": current_user.role.role_name,
        "created_at": current_user.created_at
    }