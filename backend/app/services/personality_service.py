from sqlalchemy.orm import Session

from app.models.personality_intelligence import PersonalityIntelligence
from app.services.ai_interpretation_service import get_profile_for_reading


def generate_personality_intelligence(
    db: Session,
    user_id: int,
    reading_session_id: int,
):
    row = (
        db.query(PersonalityIntelligence)
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
    )["personality_profile"]

    row = PersonalityIntelligence(
        user_id=user_id,
        reading_session_id=reading_session_id,
        profile_type=profile["type"],
        dimensions=profile["dimensions"],
        strengths=profile["strengths"],
        development_areas=profile["development_areas"],
        summary=profile["summary"],
    )

    db.add(row)
    db.commit()
    db.refresh(row)

    return row