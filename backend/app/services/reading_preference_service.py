from sqlalchemy.orm import Session

from app.models.reading_preference import ReadingPreference


def get_reading_preference(
    db: Session,
    user_id: int,
) -> ReadingPreference | None:

    return (
        db.query(ReadingPreference)
        .filter(
            ReadingPreference.user_id == user_id
        )
        .first()
    )


def create_reading_preference(
    db: Session,
    user_id: int,
    preferred_reading_type: str | None,
    preferred_spread: str | None,
    language: str,
    frequency: str | None,
) -> ReadingPreference:

    preference = ReadingPreference(
        user_id=user_id,
        preferred_reading_type=preferred_reading_type,
        preferred_spread=preferred_spread,
        language=language,
        frequency=frequency,
    )

    db.add(preference)
    db.commit()
    db.refresh(preference)

    return preference


def update_reading_preference(
    db: Session,
    preference: ReadingPreference,
    preferred_reading_type: str | None = None,
    preferred_spread: str | None = None,
    language: str | None = None,
    frequency: str | None = None,
) -> ReadingPreference:

    if preferred_reading_type is not None:
        preference.preferred_reading_type = preferred_reading_type

    if preferred_spread is not None:
        preference.preferred_spread = preferred_spread

    if language is not None:
        preference.language = language

    if frequency is not None:
        preference.frequency = frequency

    db.commit()
    db.refresh(preference)

    return preference