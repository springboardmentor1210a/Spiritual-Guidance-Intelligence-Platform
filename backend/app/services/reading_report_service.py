from sqlalchemy.orm import Session

from app.models.reading_report import ReadingReport
from app.models.reading_session import ReadingSession


def generate_reading_report(
    db: Session,
    user_id: int,
    reading_session_id: int,
) -> ReadingReport:

    reading_session = (
        db.query(ReadingSession)
        .filter(
            ReadingSession.id == reading_session_id,
            ReadingSession.user_id == user_id,
        )
        .first()
    )

    if reading_session is None:
        raise ValueError("Reading session not found.")

    if not reading_session.summary:
        raise ValueError("Reading session does not contain a reading summary.")

    report = ReadingReport(
        user_id=user_id,
        reading_session_id=reading_session.id,
        report_type=reading_session.reading_type,
        title=f"{reading_session.reading_type.title()} Reading Report",
        content=reading_session.summary,
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report