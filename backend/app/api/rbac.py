from fastapi import APIRouter, Depends

from app.dependencies.auth import (
    get_current_user,
    require_roles,
)
from app.models.user import User


router = APIRouter(
    prefix="/api/v1",
    tags=["RBAC"],
)


@router.get("/user-area")
def user_area(
    current_user: User = Depends(get_current_user),
):
    return {
        "message": "Authenticated user access granted.",
        "user_id": current_user.id,
        "role": current_user.role.name,
    }


@router.get("/reader-area")
def reader_area(
    current_user: User = Depends(
        require_roles("tarot_reader")
    ),
):
    return {
        "message": "Tarot Reader access granted.",
        "user_id": current_user.id,
        "role": current_user.role.name,
    }


@router.get("/consultant-area")
def consultant_area(
    current_user: User = Depends(
        require_roles("spiritual_consultant")
    ),
):
    return {
        "message": "Spiritual Consultant access granted.",
        "user_id": current_user.id,
        "role": current_user.role.name,
    }


@router.get("/admin-area")
def admin_area(
    current_user: User = Depends(
        require_roles("administrator")
    ),
):
    return {
        "message": "Administrator access granted.",
        "user_id": current_user.id,
        "role": current_user.role.name,
    }