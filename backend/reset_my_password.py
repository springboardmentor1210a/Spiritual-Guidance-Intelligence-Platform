from getpass import getpass

from database.database import SessionLocal
from database.models import User
from auth import hash_password

db = SessionLocal()

try:
    email = input("Enter your registered email: ").strip().lower()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None:
        print("No account found with that email.")
    else:
        new_password = getpass("Enter your new password: ")
        confirm_password = getpass("Confirm your new password: ")

        if len(new_password) < 6:
            print("Password must contain at least 6 characters.")
        elif new_password != confirm_password:
            print("Passwords do not match.")
        else:
            user.password_hash = hash_password(new_password)
            db.commit()
            print("Password reset successful!")

finally:
    db.close()