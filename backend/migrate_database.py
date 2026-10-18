import sqlite3
import os


# =========================================================
# DATABASE PATH
# =========================================================

DATABASE_PATH = "palmistry.db"


# =========================================================
# CHECK DATABASE
# =========================================================

if not os.path.exists(DATABASE_PATH):
    print("❌ palmistry.db not found.")
    print("Please run this file from your backend folder.")
    raise SystemExit


# =========================================================
# CONNECT TO DATABASE
# =========================================================

connection = sqlite3.connect(DATABASE_PATH)
cursor = connection.cursor()


# =========================================================
# GET EXISTING COLUMNS
# =========================================================

cursor.execute("PRAGMA table_info(tarot_readings)")
columns = [row[1] for row in cursor.fetchall()]

print("Existing TarotReading columns:")
print(columns)


# =========================================================
# ADD reading_type
# =========================================================

if "reading_type" not in columns:

    cursor.execute("""
        ALTER TABLE tarot_readings
        ADD COLUMN reading_type TEXT DEFAULT 'single'
    """)

    print("✅ Added: reading_type")

else:

    print("ℹ️ reading_type already exists.")


# =========================================================
# ADD selected_cards
# =========================================================

if "selected_cards" not in columns:

    cursor.execute("""
        ALTER TABLE tarot_readings
        ADD COLUMN selected_cards TEXT
    """)

    print("✅ Added: selected_cards")

else:

    print("ℹ️ selected_cards already exists.")


# =========================================================
# SAVE CHANGES
# =========================================================

connection.commit()


# =========================================================
# VERIFY DATABASE
# =========================================================

cursor.execute("PRAGMA table_info(tarot_readings)")
updated_columns = cursor.fetchall()

print("\nUpdated tarot_readings table:")

for column in updated_columns:
    print(
        f"ID: {column[0]} | "
        f"Name: {column[1]} | "
        f"Type: {column[2]}"
    )


# =========================================================
# CLOSE DATABASE
# =========================================================

connection.close()

print("\n✅ Database migration completed successfully.")