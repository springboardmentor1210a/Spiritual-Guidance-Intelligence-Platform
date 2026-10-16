from sqlalchemy.orm import Session

from app.models.reading_session import ReadingSession


def get_reading_sessions(
    db: Session,
    user_id: int,
) -> list[ReadingSession]:

    return (
        db.query(ReadingSession)
        .filter(
            ReadingSession.user_id == user_id
        )
        .order_by(
            ReadingSession.created_at.desc()
        )
        .all()
    )


def get_reading_session_by_id(
    db: Session,
    session_id: int,
    user_id: int,
) -> ReadingSession | None:

    return (
        db.query(ReadingSession)
        .filter(
            ReadingSession.id == session_id,
            ReadingSession.user_id == user_id,
        )
        .first()
    )


def create_reading_session(
    db: Session,
    user_id: int,
    reading_type: str,
    summary: str | None,
    source_image_path: str | None = None,
) -> ReadingSession:

    reading_session = ReadingSession(
        user_id=user_id,
        reading_type=reading_type,
        summary=summary,
        source_image_path=source_image_path,
    )

    db.add(reading_session)
    db.commit()
    db.refresh(reading_session)

    return reading_session


def delete_reading_session(
    db: Session,
    reading_session: ReadingSession,
) -> None:

    db.delete(reading_session)
    db.commit()