
import os
from pathlib import Path

import requests
from dotenv import load_dotenv

# Load the .env file located directly inside backend/
env_file = Path(__file__).resolve().parent / ".env"

print("=" * 55)
print(" GOOGLE CALENDAR OAUTH DIAGNOSTIC")
print("=" * 55)
print("ENV file path:", env_file)
print("ENV file exists:", env_file.is_file())

if not env_file.is_file():
    raise SystemExit(
        "\nERROR: .env was not found inside the backend folder."
    )

# Load values from the exact .env file
load_dotenv(env_file, override=True)

client_id = os.getenv("GOOGLE_CALENDAR_CLIENT_ID", "").strip()
client_secret = os.getenv("GOOGLE_CALENDAR_CLIENT_SECRET", "").strip()
refresh_token = os.getenv("GOOGLE_CALENDAR_REFRESH_TOKEN", "").strip()

print("Client ID present:", bool(client_id))
print("Client Secret present:", bool(client_secret))
print("Refresh Token present:", bool(refresh_token))
print(
    "Client ID format valid:",
    client_id.endswith(".apps.googleusercontent.com"),
)
print("Refresh token length:", len(refresh_token))

if not client_id or not client_secret or not refresh_token:
    raise SystemExit(
        "\nERROR: A Google credential is missing from backend/.env."
    )

print("\nTesting refresh token with Google...")

try:
    response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
        timeout=20,
    )

    print("HTTP status:", response.status_code)

    try:
        result = response.json()
    except ValueError:
        raise SystemExit(
            "ERROR: Google returned an unreadable response."
        )

    if response.ok and result.get("access_token"):
        print("\nRESULT: SUCCESS")
        print("Google accepted the credentials in backend/.env.")
        print("Access token received: yes (value hidden)")
        print(
            "\nNext: if your app still returns 503, "
            "we will check consultations.py."
        )
    else:
        print("\nRESULT: FAILED")
        print("Google error:", result.get("error", "unknown"))
        print(
            "Description:",
            result.get("error_description", "not provided"),
        )
        print(
            "\nNo credentials or token values have been printed."
        )

except requests.RequestException as exc:
    print("\nNETWORK ERROR:", type(exc).__name__)
    print("Check your internet connection and try again.")
