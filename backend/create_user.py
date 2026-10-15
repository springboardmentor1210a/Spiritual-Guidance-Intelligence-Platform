from app.core.database import SessionLocal, engine, Base
from app.models.postgres_models import User
from app.core.security import get_password_hash

# Ensure tables exist
Base.metadata.create_all(bind=engine)
db = SessionLocal()

email = "navya@gmail.com"
password = "navya123"

# Check if user already exists
existing_user = db.query(User).filter(User.email == email).first()

if not existing_user:
    new_user = User(
        email=email,
        hashed_password=get_password_hash(password),
        role="User",
        is_verified=True
    )
    db.add(new_user)
    db.commit()
    print(f"✅ Success! User '{email}' created successfully. You can now log in!")
else:
    print(f"ℹ️ User '{email}' already exists in the database.")

db.close()