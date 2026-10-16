import json

from sqlalchemy.orm import Session

from app.models.reading_session import ReadingSession


def create_or_get_combined_context(
    db: Session,
    user_id: int,
    palm_reading_session_id: int,
    tarot_reading_session_id: int,
):
    palm_session = (
        db.query(ReadingSession)
        .filter(
            ReadingSession.id == palm_reading_session_id,
            ReadingSession.user_id == user_id,
        )
        .first()
    )

    if palm_session is None:
        raise ValueError(
            "Palm reading session not found."
        )

    if palm_session.reading_type != "palm":
        raise ValueError(
            "The supplied Palm session is not a Palm reading."
        )

    tarot_session = (
        db.query(ReadingSession)
        .filter(
            ReadingSession.id == tarot_reading_session_id,
            ReadingSession.user_id == user_id,
        )
        .first()
    )

    if tarot_session is None:
        raise ValueError(
            "Tarot reading session not found."
        )

    if not tarot_session.reading_type.lower().startswith(
        "tarot"
    ):
        raise ValueError(
            "The supplied Tarot session is not a Tarot reading."
        )

    combined_type = "combined"

    existing_sessions = (
        db.query(ReadingSession)
        .filter(
            ReadingSession.user_id == user_id,
            ReadingSession.reading_type == combined_type,
        )
        .order_by(ReadingSession.id.desc())
        .all()
    )

    for session in existing_sessions:
        if not session.summary:
            continue

        try:
            stored = json.loads(session.summary)
        except (TypeError, json.JSONDecodeError):
            continue

        if (
            stored.get("analysis_type")
            == "milestone3_combined_context"
            and stored.get("palm_reading_session_id")
            == palm_reading_session_id
            and stored.get("tarot_reading_session_id")
            == tarot_reading_session_id
        ):
            return session

    summary = json.dumps(
        {
            "analysis_type": "milestone3_combined_context",
            "palm_reading_session_id": palm_reading_session_id,
            "tarot_reading_session_id": tarot_reading_session_id,
        },
        ensure_ascii=False,
    )

    combined_session = ReadingSession(
        user_id=user_id,
        reading_type=combined_type,
        summary=summary,
    )

    db.add(combined_session)
    db.commit()
    db.refresh(combined_session)

    return combined_session