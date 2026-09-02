from sqlalchemy import select

from app.core.database import SessionLocal
from app.models.role import Role


ROLES = [
    "user",
    "tarot_reader",
    "spiritual_consultant",
    "administrator",
]


def seed_roles():
    db = SessionLocal()

    try:
        for role_name in ROLES:
            existing_role = db.scalar(
                select(Role).where(Role.name == role_name)
            )

            if existing_role is None:
                db.add(Role(name=role_name))

        db.commit()

        print("Roles seeded successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_roles()