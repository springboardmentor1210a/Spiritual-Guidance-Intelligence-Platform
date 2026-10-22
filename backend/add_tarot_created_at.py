from sqlalchemy import inspect, text
from database.database import engine

tables = [
    "palm_readings",
    "tarot_readings",
]

for table_name in tables:
    inspector = inspect(engine)

    existing_tables = inspector.get_table_names()

    if table_name not in existing_tables:
        print(f"Table '{table_name}' does not exist. Skipping.")
        continue

    columns = [
        column["name"]
        for column in inspector.get_columns(table_name)
    ]

    if "created_at" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    f"ALTER TABLE {table_name} "
                    "ADD COLUMN created_at DATETIME"
                )
            )

        print(f"{table_name}: created_at column added.")
    else:
        print(f"{table_name}: created_at column already exists.")

print("Timestamp migration completed.")