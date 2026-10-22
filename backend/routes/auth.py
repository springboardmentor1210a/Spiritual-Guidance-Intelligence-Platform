from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.database import get_db
from database.models import User,UserSession

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_role
)

from routes.rbac import (
    ALLOWED_ROLES,
    normalize_role,
    require_admin
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# REQUEST MODELS
# ============================================================

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class RoleUpdateRequest(BaseModel):
    role: str


class AdminCreateUserRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str = "user"


# ============================================================
# USER REGISTRATION
# ============================================================

@router.post("/register")
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Public user registration.

    For security, every account created through public
    registration gets the 'user' role.
    """

    username = user_data.username.strip()
    email = user_data.email.strip().lower()
    password = user_data.password

    # --------------------------------------------------------
    # Basic validation
    # --------------------------------------------------------

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username cannot be empty"
        )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email cannot be empty"
        )

    if not password:
        raise HTTPException(
            status_code=400,
            detail="Password cannot be empty"
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters"
        )

    # --------------------------------------------------------
    # Check duplicate username
    # --------------------------------------------------------

    existing_username = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # --------------------------------------------------------
    # Check duplicate email
    # --------------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # --------------------------------------------------------
    # Create user
    # --------------------------------------------------------
    # Public registration ALWAYS creates a normal user.
    # Administrator/Tarot Reader/Spiritual Consultant roles
    # can be assigned only by an administrator.
    # --------------------------------------------------------

    new_user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role="user",
        created_at = datetime.now(timezone.utc)

    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "user_id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login using email and password.

    The JWT token contains:
    - user ID
    - role
    """

    email = form_data.username.strip().lower()
    password = form_data.password

    # --------------------------------------------------------
    # Find user
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # --------------------------------------------------------
    # Verify password
    # --------------------------------------------------------

    if not verify_password(
        password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # --------------------------------------------------------
    # Normalize role
    # --------------------------------------------------------

    user_role = normalize_role(user.role)

    # --------------------------------------------------------
    # Create JWT access token
    # --------------------------------------------------------

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user_role
        }
    )

    
       # Create a session record after successful login
    now = datetime.utcnow()

    new_session = UserSession(
        user_id=user.id,
        started_at=now,
        last_activity=now,
        is_active=True
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user_role,
        "session_id": new_session.id
    }

# ============================================================
# CURRENT USER INFORMATION
# ============================================================

@router.get("/me")
def get_my_account(
    current_user: User = Depends(get_current_user)
):
    """
    Returns the currently logged-in user's account details.
    """

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": normalize_role(current_user.role)
    }


# ============================================================
# USER-ONLY TEST/ACCESS ENDPOINT
# ============================================================

@router.get("/user-only")
def user_only(
    current_user: User = Depends(
        require_role("user")
    )
):
    """
    Endpoint available only to normal users.
    """

    return {
        "message": "You have user access",
        "username": current_user.username,
        "role": normalize_role(current_user.role)
    }


# ============================================================
# ADMIN: UPDATE USER ROLE
# ============================================================

@router.patch("/admin/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_data: RoleUpdateRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Administrator-only endpoint for changing a user's role.

    Allowed roles:
    - user
    - tarot_reader
    - spiritual_consultant
    - administrator
    """

    requested_role = normalize_role(role_data.role)

    # --------------------------------------------------------
    # Validate role
    # --------------------------------------------------------

    if requested_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid role",
                "allowed_roles": sorted(ALLOWED_ROLES)
            }
        )

    # --------------------------------------------------------
    # Find target user
    # --------------------------------------------------------

    target_user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if target_user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # --------------------------------------------------------
    # Prevent administrator from accidentally removing
    # their own administrator role
    # --------------------------------------------------------

    if (
        target_user.id == current_admin.id
        and requested_role != "administrator"
    ):
        raise HTTPException(
            status_code=400,
            detail="An administrator cannot remove their own administrator role"
        )

    # --------------------------------------------------------
    # Update role
    # --------------------------------------------------------

    old_role = normalize_role(target_user.role)

    target_user.role = requested_role

    db.commit()
    db.refresh(target_user)

    return {
        "message": "User role updated successfully",
        "user_id": target_user.id,
        "username": target_user.username,
        "old_role": old_role,
        "new_role": target_user.role
    }


# ============================================================
# ADMIN: CREATE USER WITH ROLE
# ============================================================

@router.post("/admin/create-user")
def admin_create_user(
    user_data: AdminCreateUserRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Administrator-only endpoint.

    An administrator can create:
    - user
    - tarot_reader
    - spiritual_consultant
    - administrator
    """

    username = user_data.username.strip()
    email = user_data.email.strip().lower()
    password = user_data.password
    requested_role = normalize_role(user_data.role)

    # --------------------------------------------------------
    # Basic validation
    # --------------------------------------------------------

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username cannot be empty"
        )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email cannot be empty"
        )

    if not password:
        raise HTTPException(
            status_code=400,
            detail="Password cannot be empty"
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters"
        )

    # --------------------------------------------------------
    # Validate role
    # --------------------------------------------------------

    if requested_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid role",
                "allowed_roles": sorted(ALLOWED_ROLES)
            }
        )

    # --------------------------------------------------------
    # Check username
    # --------------------------------------------------------

    existing_username = (
        db.query(User)
        .filter(User.username == username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    # --------------------------------------------------------
    # Check email
    # --------------------------------------------------------

    existing_email = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # --------------------------------------------------------
    # Create user
    # --------------------------------------------------------

    new_user = User(
        username=username,
        email=email,
        password_hash=hash_password(password),
        role=requested_role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully by administrator",
        "created_by_admin": current_admin.username,
        "user_id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
        "role": new_user.role
    }


# ============================================================
# ADMIN: LIST USERS
# ============================================================

@router.get("/admin/users")
def get_admin_users(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.id.asc()).all()

    user_list = []

    for user in users:
        role_value = getattr(user.role, "value", user.role)

        is_active = getattr(user, "is_active", None)

        if is_active is True:
            status = "Active"
        elif is_active is False:
            status = "Inactive"
        else:
            status = "Not tracked"

        user_list.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": str(role_value or "user").lower(),
            "status": status
        })

    return {
        "success": True,
        "message": "Users retrieved successfully",
        "total_users": len(user_list),
        "users": user_list
    }