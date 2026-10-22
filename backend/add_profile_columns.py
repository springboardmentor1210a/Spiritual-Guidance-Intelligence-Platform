import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "palmistry.db"

new_columns = {
    "age_group": "TEXT",
    "profile_image": "TEXT",
    "spiritual_interests": "TEXT",
    "spiritual_goals": "TEXT",
    "reading_preferences": "TEXT",
}

with sqlite3.connect(DB_PATH) as connection:
    existing = {
        row[1]
        for row in connection.execute(
            "PRAGMA table_info(profiles)"
        ).fetchall()
    }

    if not existing:
        raise RuntimeError(
            "The profiles table does not exist. "
            "Check your database path."
        )

    for column_name, column_type in new_columns.items():
        if column_name not in existing:
            connection.execute(
                f"ALTER TABLE profiles ADD COLUMN "
                f"{column_name} {column_type}"
            )
            print(f"Added column: {column_name}")
        else:
            print(f"Already exists: {column_name}")

print("Profile database migration completed.")