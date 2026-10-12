import os

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "dev-secret-key-change-this-in-production"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60