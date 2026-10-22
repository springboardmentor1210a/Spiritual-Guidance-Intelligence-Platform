from fastapi import Depends, HTTPException, status

from auth import get_current_user


# =========================================================
# AVAILABLE ROLES
# =========================================================

USER_ROLE = "user"
TAROT_READER_ROLE = "tarot_reader"
SPIRITUAL_CONSULTANT_ROLE = "spiritual_consultant"
ADMINISTRATOR_ROLE = "administrator"


ALLOWED_ROLES = {
    USER_ROLE,
    TAROT_READER_ROLE,
    SPIRITUAL_CONSULTANT_ROLE,
    ADMINISTRATOR_ROLE,
}


# =========================================================
# ROLE NORMALIZATION
# =========================================================

def normalize_role(role):
    """
    Converts different role formats into the standard
    role names used by the application.
    """

    if not role:
        return None

    role = str(role).strip().lower()

    role_aliases = {
        "user": USER_ROLE,

        "tarot reader": TAROT_READER_ROLE,
        "tarot_reader": TAROT_READER_ROLE,
        "tarot-reader": TAROT_READER_ROLE,

        "spiritual consultant": SPIRITUAL_CONSULTANT_ROLE,
        "spiritual_consultant": SPIRITUAL_CONSULTANT_ROLE,
        "spiritual-consultant": SPIRITUAL_CONSULTANT_ROLE,

        "admin": ADMINISTRATOR_ROLE,
        "administrator": ADMINISTRATOR_ROLE,
    }

    return role_aliases.get(role, role)


# =========================================================
# GENERAL ROLE CHECK
# =========================================================

def require_roles(*allowed_roles):
    """
    Creates a FastAPI dependency that allows only
    specified roles to access an endpoint.
    """

    normalized_allowed_roles = {
        normalize_role(role)
        for role in allowed_roles
    }

    def role_checker(
        current_user=Depends(get_current_user)
    ):
        user_role = normalize_role(
            getattr(current_user, "role", None)
        )

        if user_role not in ALLOWED_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid user role."
            )

        if user_role not in normalized_allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission to access "
                    "this feature."
                )
            )

        return current_user

    return role_checker


# =========================================================
# ACCESS DEPENDENCIES
# =========================================================

require_user = require_roles(
    USER_ROLE,
    TAROT_READER_ROLE,
    SPIRITUAL_CONSULTANT_ROLE,
    ADMINISTRATOR_ROLE
)


require_tarot_reader = require_roles(
    TAROT_READER_ROLE,
    ADMINISTRATOR_ROLE
)


require_spiritual_consultant = require_roles(
    SPIRITUAL_CONSULTANT_ROLE,
    ADMINISTRATOR_ROLE
)


require_admin = require_roles(
    ADMINISTRATOR_ROLE
)


require_tarot_management = require_roles(
    TAROT_READER_ROLE,
    ADMINISTRATOR_ROLE
)


require_consultation_access = require_roles(
    SPIRITUAL_CONSULTANT_ROLE,
    ADMINISTRATOR_ROLE
)


require_report_access = require_roles(
    USER_ROLE,
    TAROT_READER_ROLE,
    SPIRITUAL_CONSULTANT_ROLE,
    ADMINISTRATOR_ROLE
)