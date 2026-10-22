from database.database import SessionLocal
from database.models import User

db = SessionLocal()

try:
    users = db.query(User).all()

    print("TOTAL USERS:", len(users))

    for user in users:
        print("--------------------")
        print("ID:", user.id)
        print("USERNAME:", user.username)
        print("EMAIL:", user.email)
        print("ROLE:", user.role)
        print("PASSWORD HASH:", user.password_hash)

except Exception as e:
    print("ERROR:", e)

finally:
    db.close()