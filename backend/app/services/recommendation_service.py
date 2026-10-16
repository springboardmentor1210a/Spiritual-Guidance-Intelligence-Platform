from sqlalchemy.orm import Session

from app.models.recommendation import Recommendation
from app.services.ai_interpretation_service import get_profile_for_reading


def generate_recommendations(
    db: Session,
    user_id: int,
    reading_session_id: int,
):
    row = (
        db.query(Recommendation)
        .filter_by(
            user_id=user_id,
            reading_session_id=reading_session_id,
        )
        .first()
    )

    if row:
        return row

    profile = get_profile_for_reading(
        db,
        user_id,
        reading_session_id,
    )

    row = Recommendation(
        user_id=user_id,
        reading_session_id=reading_session_id,
        recommendations=profile["recommendations"],
    )

    db.add(row)
    db.commit()
    db.refresh(row)

    return row