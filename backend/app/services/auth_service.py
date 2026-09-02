from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.role import Role
from app.models.user import User


def get_user_by_email(
    db: Session,
    email: str
) -> User | None:

    return db.scalar(
        select(User).where(User.email == email)
    )


def register_user(
    db: Session,
    email: str,
    password: str
) -> User:

    existing_user = get_user_by_email(
        db,
        email
    )

    if existing_user:
        raise ValueError(
            "A user with this email already exists."
        )

    user_role = db.scalar(
        select(Role).where(
            Role.name == "user"
        )
    )

    if user_role is None:
        raise ValueError(
            "Default user role does not exist."
        )

    user = User(
        email=email,
        password_hash=hash_password(password),
        role_id=user_role.id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str
) -> User | None:

    user = get_user_by_email(
        db,
        email
    )

    if user is None:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    return user