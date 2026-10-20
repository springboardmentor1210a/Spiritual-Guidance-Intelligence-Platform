from collections import Counter
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Reading, User, UserProfile
from app.services.intelligence_engine import (
    build_full_intelligence,
    build_next_actions,
    build_personalized_interpretation,
    get_top_themes,
)


router = APIRouter(
    prefix="/api/intelligence",
    tags=["Milestone 3 - Intelligence"],
)


# ============================================================
# Helpers
# ============================================================

def get_user_profile(
    db: Session,
    user_id: int,
):
    return (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .first()
    )


def get_user_readings(
    db: Session,
    user_id: int,
    limit: int | None = None,
):
    query = (
        db.query(Reading)
        .filter(Reading.user_id == user_id)
        .order_by(Reading.created_at.desc())
    )

    if limit:
        query = query.limit(limit)

    return query.all()


def clean_text(value):
    if value is None:
        return ""

    return str(value).strip()


def make_reflection(
    profile: UserProfile | None,
    reading: Reading | None,
):
    """
    Lightweight contextual reflection used for the latest reading.

    This is deliberately transparent and is not presented as a
    scientifically validated prediction.
    """

    profile_text = " ".join(
        [
            clean_text(getattr(profile, "interests", "")),
            clean_text(getattr(profile, "spiritual_goals", "")),
            clean_text(getattr(profile, "reading_preferences", "")),
            clean_text(getattr(profile, "bio", "")),
        ]
    ).lower()

    reading_text = " ".join(
        [
            clean_text(getattr(reading, "title", "")),
            clean_text(getattr(reading, "input_summary", "")),
            clean_text(getattr(reading, "result_text", "")),
        ]
    ).lower()

    combined = f"{profile_text} {reading_text}"

    if any(
        word in combined
        for word in [
            "career",
            "job",
            "work",
            "business",
            "profession",
            "money",
        ]
    ):
        return (
            "Your recent reading activity connects naturally with career "
            "and practical progress. Use the reflection as a prompt to "
            "identify one concrete goal and one action you can take next."
        )

    if any(
        word in combined
        for word in [
            "love",
            "relationship",
            "partner",
            "family",
            "friend",
            "connection",
        ]
    ):
        return (
            "Your recent activity places attention on relationships and "
            "connections. Consider what communication, boundaries or "
            "supportive relationships are most important to you right now."
        )

    if any(
        word in combined
        for word in [
            "study",
            "education",
            "learning",
            "exam",
            "college",
            "skill",
        ]
    ):
        return (
            "Your recent activity connects with learning and development. "
            "Consider choosing one skill or subject and giving it focused "
            "attention this week."
        )

    if any(
        word in combined
        for word in [
            "confidence",
            "strength",
            "growth",
            "courage",
            "motivation",
        ]
    ):
        return (
            "Your recent reflections highlight personal growth and "
            "self-confidence. Notice the strengths you are already using "
            "and turn one of them into a practical next step."
        )

    return (
        "Your recent reading provides a starting point for reflection. "
        "Look for themes that repeat across your experiences and use "
        "them to guide thoughtful decisions rather than treating the "
        "reading as a fixed prediction."
    )


# ============================================================
# Dashboard
# ============================================================

@router.get("/dashboard")
def intelligence_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_user_profile(db, current_user.id)
    readings = get_user_readings(db, current_user.id)

    palm_count = sum(
        1
        for reading in readings
        if str(reading.reading_type).lower() == "palm"
    )

    tarot_count = sum(
        1
        for reading in readings
        if str(reading.reading_type).lower() == "tarot"
    )

    intelligence = build_full_intelligence(
        profile=profile,
        readings=readings,
    )

    return {
        "name": current_user.full_name,
        "total_readings": len(readings),
        "palm_readings": palm_count,
        "tarot_readings": tarot_count,
        "profile_completed": profile is not None,
        "personality_insights": build_personality_insights(
            profile,
            readings,
        ),
        "recommendations": build_recommendations(
            profile,
            readings,
        ),
        "monthly_trends": build_monthly_trends(
            readings,
        ),
        "personalized_interpretation": intelligence[
            "interpretation"
        ],
        "next_actions": intelligence[
            "next_actions"
        ],
        "activity_signal": intelligence[
            "activity_signal"
        ],
        "engine_status": "rule_based_intelligence",
        "engine_note": (
            "Milestone 3 uses an explainable personalized intelligence "
            "layer. It does not claim scientific prediction or diagnosis."
        ),
    }


# ============================================================
# Personality Intelligence
# ============================================================

def build_personality_insights(
    profile: UserProfile | None,
    readings: list[Reading],
):
    interests = clean_text(
        getattr(profile, "interests", None)
    )

    goals = clean_text(
        getattr(profile, "spiritual_goals", None)
    )

    preferences = clean_text(
        getattr(profile, "reading_preferences", None)
    )

    insights = []

    if interests:
        insights.append(
            {
                "title": "Interest awareness",
                "text": (
                    f"Your profile lists these interests: {interests}. "
                    "These can help you choose meaningful learning "
                    "and personal development activities."
                ),
            }
        )

    if goals:
        insights.append(
            {
                "title": "Goal orientation",
                "text": (
                    f"Your stated goals include: {goals}. "
                    "Keeping these goals visible can help connect "
                    "your reflections with practical actions."
                ),
            }
        )

    if preferences:
        insights.append(
            {
                "title": "Reading preference",
                "text": (
                    f"You prefer: {preferences}. "
                    "Your future readings can be interpreted in the "
                    "context of these preferences."
                ),
            }
        )

    if readings:
        reading_types = Counter(
            str(reading.reading_type).lower()
            for reading in readings
        )

        most_common = reading_types.most_common(1)

        if most_common:
            reading_type, count = most_common[0]

            insights.append(
                {
                    "title": "Reflection pattern",
                    "text": (
                        f"You have explored {reading_type} readings "
                        f"{count} time"
                        f"{'s' if count != 1 else ''}. "
                        "This activity can be used to identify recurring "
                        "areas of reflection."
                    ),
                }
            )

    if not insights:
        insights.append(
            {
                "title": "Getting started",
                "text": (
                    "Complete your profile and explore a few readings "
                    "to begin building your personalized intelligence view."
                ),
            }
        )

    insights.append(
        {
            "title": "Reflective perspective",
            "text": (
                "These observations are generated from your saved "
                "profile and reading activity. They are not a clinical "
                "or scientifically validated personality assessment."
            ),
        }
    )

    return insights


# ============================================================
# Recommendations
# ============================================================

def build_recommendations(
    profile: UserProfile | None,
    readings: list[Reading],
):
    recommendations = []

    interests = clean_text(
        getattr(profile, "interests", None)
    )

    goals = clean_text(
        getattr(profile, "spiritual_goals", None)
    )

    if interests:
        recommendations.append(
            (
                "Explore one activity connected to your interests: "
                f"{interests}. Set aside a small amount of time this week "
                "for focused exploration."
            )
        )

    if goals:
        recommendations.append(
            (
                "Review your stated goals and choose one small action "
                f"that supports them: {goals}."
            )
        )

    if len(readings) >= 3:
        recommendations.append(
            (
                "Review your previous readings together and note any "
                "themes that appear more than once."
            )
        )

    if any(
        str(reading.reading_type).lower() == "tarot"
        for reading in readings
    ):
        recommendations.append(
            (
                "Use your tarot reflections as prompts for journaling "
                "and decision-making rather than fixed predictions."
            )
        )

    if any(
        str(reading.reading_type).lower() == "palm"
        for reading in readings
    ):
        recommendations.append(
            (
                "Compare your palm-reading reflections over time and "
                "focus on personal growth themes that remain meaningful."
            )
        )

    if not recommendations:
        recommendations.append(
            (
                "Complete your profile and save a reading to start "
                "building personalized recommendations."
            )
        )

    return recommendations


# ============================================================
# Monthly Trends
# ============================================================

def build_monthly_trends(
    readings: list[Reading],
):
    now = datetime.now(timezone.utc)

    months = []

    for offset in range(5, -1, -1):
        month_index = now.month - offset
        year = now.year

        while month_index <= 0:
            month_index += 12
            year -= 1

        months.append(
            {
                "year": year,
                "month": month_index,
                "label": datetime(
                    year,
                    month_index,
                    1,
                ).strftime("%b"),
                "total": 0,
                "palm": 0,
                "tarot": 0,
            }
        )

    for reading in readings:
        created_at = reading.created_at

        if created_at is None:
            continue

        reading_year = created_at.year
        reading_month = created_at.month

        for item in months:
            if (
                item["year"] == reading_year
                and item["month"] == reading_month
            ):
                item["total"] += 1

                if str(reading.reading_type).lower() == "palm":
                    item["palm"] += 1

                if str(reading.reading_type).lower() == "tarot":
                    item["tarot"] += 1

                break

    return months


# ============================================================
# Personality endpoint
# ============================================================

@router.get("/personality")
def personality(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_user_profile(
        db,
        current_user.id,
    )

    readings = get_user_readings(
        db,
        current_user.id,
    )

    return {
        "user": current_user.full_name,
        "insights": build_personality_insights(
            profile,
            readings,
        ),
        "themes": get_top_themes(
            profile,
            readings,
        ),
    }


# ============================================================
# Latest interpretation
# ============================================================

@router.get("/interpretation/latest")
def latest_interpretation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_user_profile(
        db,
        current_user.id,
    )

    latest = (
        db.query(Reading)
        .filter(
            Reading.user_id == current_user.id
        )
        .order_by(
            Reading.created_at.desc()
        )
        .first()
    )

    if not latest:
        raise HTTPException(
            status_code=404,
            detail="No saved readings found yet.",
        )

    all_readings = get_user_readings(
        db,
        current_user.id,
    )

    personalized = build_personalized_interpretation(
        profile=profile,
        readings=all_readings,
    )

    return {
        "reading_id": latest.id,
        "reading_type": latest.reading_type,
        "title": latest.title,
        "created_at": latest.created_at,
        "original_result": latest.result_text,
        "contextual_reflection": make_reflection(
            profile,
            latest,
        ),
        "personalized_interpretation": personalized,
        "engine": "explainable_rule_based_intelligence",
    }


# ============================================================
# Recommendations endpoint
# ============================================================

@router.get("/recommendations")
def recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_user_profile(
        db,
        current_user.id,
    )

    readings = get_user_readings(
        db,
        current_user.id,
    )

    return {
        "recommendations": build_recommendations(
            profile,
            readings,
        ),
        "next_actions": build_next_actions(
            profile,
            readings,
        ),
    }


# ============================================================
# Life trends
# ============================================================

@router.get("/life-trends")
def life_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_user_profile(
        db,
        current_user.id,
    )

    readings = get_user_readings(
        db,
        current_user.id,
    )

    monthly = build_monthly_trends(
        readings
    )

    themes = get_top_themes(
        profile,
        readings,
        limit=5,
    )

    return {
        "monthly_activity": monthly,
        "recurring_themes": themes,
        "total_readings": len(readings),
    }