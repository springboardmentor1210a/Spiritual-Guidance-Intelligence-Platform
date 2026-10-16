from sqlalchemy.orm import Session

from app.models.personalized_dashboard import PersonalizedDashboard

from app.services.ai_interpretation_service import (
    get_profile_for_reading,
)

from app.services.personality_service import (
    generate_personality_intelligence,
)

from app.services.recommendation_service import (
    generate_recommendations,
)

from app.services.life_trend_service import (
    generate_life_trends,
)


def generate_personalized_dashboard(
    db: Session,
    user_id: int,
    reading_session_id: int,
):
    row = (
        db.query(PersonalizedDashboard)
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

    personality = generate_personality_intelligence(
        db,
        user_id,
        reading_session_id,
    )

    recommendations = generate_recommendations(
        db,
        user_id,
        reading_session_id,
    )

    trends = generate_life_trends(
        db,
        user_id,
        reading_session_id,
    )

    dashboard_data = {
        "profile_name": profile["name"],
        "overview": profile["overview"],
        "personality": {
            "type": personality.profile_type,
            "dimensions": personality.dimensions,
        },
        "top_recommendations": (
            recommendations.recommendations[:3]
        ),
        "current_phase": trends.current_phase,
        "life_trends": trends.trends,
        "trend_summary": trends.summary,

        # Real AI interpretation engine
        "engine": "ai_interpretation",
    }

    row = PersonalizedDashboard(
        user_id=user_id,
        reading_session_id=reading_session_id,
        dashboard_data=dashboard_data,
    )

    db.add(row)
    db.commit()
    db.refresh(row)

    return row