import sys
from app.database import SessionLocal
from app.models import User


def main():
    if len(sys.argv) != 2:
        print("Usage: python -m app.create_admin email@example.com")
        raise SystemExit(1)

    email = sys.argv[1].lower()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print("Account not found. Register through the app first.")
            raise SystemExit(1)
        user.role = "admin"
        db.commit()
        print(f"{email} is now an administrator.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
