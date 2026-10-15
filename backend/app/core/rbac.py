from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user
# ✨ FIXED: Removed 'backend.' prefix ✨
from app.models.postgres_models import User

# Define all valid roles in your application
VALID_ROLES = {"User", "Seeker", "Tarot Reader", "Spiritual Consultant", "Admin", "Administrator"}

def require_roles(*allowed_roles: str):
    """
    Dependency factory for role-gated routes.
    """
    # Normalize aliases: Admin == Administrator, User == Seeker
    expanded_allowed = set(allowed_roles)
    if "Admin" in expanded_allowed or "Administrator" in expanded_allowed:
        expanded_allowed.update({"Admin", "Administrator"})
    if "User" in expanded_allowed or "Seeker" in expanded_allowed:
        expanded_allowed.update({"User", "Seeker"})

    def _guard(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role or "User"
        # Admin / Administrator has access to reader and consultant routes too if requested
        if user_role in {"Admin", "Administrator"}:
            return current_user

        if user_role not in expanded_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of the following roles: {', '.join(allowed_roles)}",
            )
        return current_user
        
    return _guard