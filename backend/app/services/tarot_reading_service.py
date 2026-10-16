import json

from sqlalchemy.orm import Session

from app.models.reading_session import ReadingSession


def save_tarot_reading(
    db: Session,
    user_id: int,
    reading: dict,
) -> ReadingSession:
    """
    Save a completed Tarot reading as a ReadingSession.
    """

    if not reading:
        raise ValueError("Tarot reading is empty.")

    spread = reading.get("spread")
    cards = reading.get("cards")

    if not spread:
        raise ValueError("Tarot reading does not contain a spread.")

    if not isinstance(cards, list) or not cards:
        raise ValueError("Tarot reading does not contain any cards.")

    summary = json.dumps(
        reading,
        ensure_ascii=False,
        indent=2,
    )

    reading_type = f"Tarot {spread.replace('_', ' ').title()}"

    reading_session = ReadingSession(
        user_id=user_id,
        reading_type=reading_type,
        summary=summary,
    )

    db.add(reading_session)
    db.commit()
    db.refresh(reading_session)

    return reading_session