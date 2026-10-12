from collections import Counter
from datetime import datetime, timedelta
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.tarot_reading import TarotReading


router = APIRouter(
    prefix="/consultant",
    tags=["Spiritual Consultant"]
)


def check_consultant(current_user: User):

    if current_user.role.role_name != "Spiritual Consultant":
        raise HTTPException(
            status_code=403,
            detail="Only Spiritual Consultants can access this dashboard."
        )


@router.get("/user-trends")
def get_user_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    check_consultant(current_user)

    try:

        readings = (
            db.query(TarotReading)
            .filter(TarotReading.user_id.isnot(None))
            .order_by(TarotReading.created_at.desc())
            .all()
        )

        # =====================================================
        # 1. READING PATTERNS
        # =====================================================

        spread_counter = Counter()

        for reading in readings:

            name = (
                reading.spread_name
                or reading.spread_type
                or "Unknown"
            )

            spread_counter[name] += 1

        reading_patterns = [
            {
                "name": name,
                "count": count
            }
            for name, count
            in spread_counter.most_common()
        ]

        # =====================================================
        # 2. RECURRING THEMES
        # =====================================================

        theme_keywords = {
            "Career": [
                "career",
                "job",
                "work",
                "profession"
            ],
            "Relationships": [
                "relationship",
                "love",
                "partner",
                "marriage"
            ],
            "Personal Growth": [
                "growth",
                "development",
                "self",
                "confidence"
            ],
            "Finance": [
                "finance",
                "money",
                "wealth",
                "financial"
            ],
            "Life Direction": [
                "future",
                "path",
                "direction",
                "opportunity"
            ]
        }

        theme_counter = Counter()

        for reading in readings:

            text = (
                f"{reading.spread_name or ''} "
                f"{reading.spread_type or ''} "
                f"{reading.overall_reading or ''}"
            ).lower()

            for theme, keywords in theme_keywords.items():

                if any(
                    keyword in text
                    for keyword in keywords
                ):
                    theme_counter[theme] += 1

        recurring_themes = [
            {
                "theme": theme,
                "count": count
            }
            for theme, count
            in theme_counter.most_common()
        ]

        # =====================================================
        # 3. GROWTH TRENDS
        # =====================================================

        now = datetime.now()

        current_period_start = (
            now - timedelta(days=30)
        )

        previous_period_start = (
            now - timedelta(days=60)
        )

        current_period_count = 0
        previous_period_count = 0

        for reading in readings:

            if not reading.created_at:
                continue

            reading_date = reading.created_at.replace(
                tzinfo=None
            )

            if reading_date >= current_period_start:

                current_period_count += 1

            elif reading_date >= previous_period_start:

                previous_period_count += 1

        if previous_period_count == 0:

            growth_percentage = (
                100
                if current_period_count > 0
                else 0
            )

        else:

            growth_percentage = round(
                (
                    (
                        current_period_count
                        - previous_period_count
                    )
                    / previous_period_count
                )
                * 100,
                2
            )

        growth_trends = {
            "current_30_days": current_period_count,
            "previous_30_days": previous_period_count,
            "growth_percentage": growth_percentage
        }

        # =====================================================
        # 4. USER ACTIVITY
        # =====================================================

        user_reading_counter = Counter()

        for reading in readings:

            if reading.user_id:

                user_reading_counter[
                    reading.user_id
                ] += 1

        total_users = len(
            user_reading_counter
        )

        repeat_users = sum(
            1
            for count in user_reading_counter.values()
            if count > 1
        )

        total_readings = len(readings)

        average_readings_per_user = (
            round(
                total_readings / total_users,
                2
            )
            if total_users > 0
            else 0
        )

        user_activity = {
            "total_users": total_users,
            "repeat_users": repeat_users,
            "total_readings": total_readings,
            "average_readings_per_user": (
                average_readings_per_user
            )
        }

        # =====================================================
        # FINAL RESPONSE
        # =====================================================

        return {
            "success": True,

            "reading_patterns": reading_patterns,

            "recurring_themes": recurring_themes,

            "growth_trends": growth_trends,

            "user_activity": user_activity
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate user trends: {str(e)}"
        )

@router.get("/guidance-effectiveness")
def get_guidance_effectiveness(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_consultant(current_user)

    try:
        readings = (
            db.query(TarotReading)
            .filter(TarotReading.user_id.isnot(None))
            .order_by(TarotReading.created_at.desc())
            .all()
        )

        total_readings = len(readings)

        if total_readings == 0:
            return {
                "success": True,
                "guidance_relevance": {
                    "score": 0,
                    "readings_with_guidance": 0,
                    "total_readings": 0
                },
                "recommendation_usage": {
                    "readings_with_recommendation_signals": 0,
                    "total_readings": 0
                },
                "personal_growth_insights": {
                    "readings_with_growth_signals": 0,
                    "total_readings": 0
                },
                "overall_insight_score": {
                    "score": 0,
                    "label": "No Data"
                }
            }

        guidance_keywords = [
            "guidance",
            "advice",
            "direction",
            "suggest",
            "recommend",
            "reflection",
            "consider",
            "focus",
            "support"
        ]

        recommendation_keywords = [
            "recommend",
            "should",
            "consider",
            "focus on",
            "practice",
            "develop",
            "build",
            "work on",
            "take action"
        ]

        growth_keywords = [
            "growth",
            "personal growth",
            "development",
            "self-development",
            "learning",
            "confidence",
            "reflection",
            "healing",
            "transformation",
            "self-awareness"
        ]

        guidance_count = 0
        recommendation_count = 0
        growth_count = 0

        for reading in readings:

            text_parts = [
                reading.spread_name or "",
                reading.spread_type or "",
                reading.overall_reading or ""
            ]

            # Tarot cards are stored as text/JSON.
            if reading.cards:
                try:
                    cards = json.loads(reading.cards)

                    if isinstance(cards, list):
                        for card in cards:

                            if isinstance(card, dict):
                                text_parts.extend([
                                    str(card.get("name", "")),
                                    str(card.get("interpretation", "")),
                                    " ".join(
                                        str(x)
                                        for x in card.get("keywords", [])
                                    ),
                                    " ".join(
                                        str(x)
                                        for x in card.get("meaning", [])
                                    )
                                ])

                except (json.JSONDecodeError, TypeError):
                    text_parts.append(str(reading.cards))

            text = " ".join(text_parts).lower()

            # -----------------------------------------
            # GUIDANCE RELEVANCE
            # -----------------------------------------

            if any(
                keyword in text
                for keyword in guidance_keywords
            ):
                guidance_count += 1

            # -----------------------------------------
            # RECOMMENDATION SIGNALS
            # -----------------------------------------

            if any(
                keyword in text
                for keyword in recommendation_keywords
            ):
                recommendation_count += 1

            # -----------------------------------------
            # PERSONAL GROWTH SIGNALS
            # -----------------------------------------

            if any(
                keyword in text
                for keyword in growth_keywords
            ):
                growth_count += 1

        # -----------------------------------------
        # 1. GUIDANCE RELEVANCE
        # -----------------------------------------

        guidance_score = round(
            (guidance_count / total_readings) * 100,
            2
        )

        # -----------------------------------------
        # 2. RECOMMENDATION USAGE SIGNAL
        # -----------------------------------------

        recommendation_percentage = round(
            (recommendation_count / total_readings) * 100,
            2
        )

        # -----------------------------------------
        # 3. PERSONAL GROWTH INSIGHTS
        # -----------------------------------------

        growth_percentage = round(
            (growth_count / total_readings) * 100,
            2
        )

        # -----------------------------------------
        # 4. OVERALL INSIGHT SCORE
        # -----------------------------------------
        #
        # Prototype score based only on the data
        # currently stored in TarotReading.
        #
        # This is NOT yet the full mentor weighted
        # scoring engine because palm confidence,
        # personality alignment and user-context
        # scores are not stored historically.
        # -----------------------------------------

        overall_score = round(
            (
                guidance_score * 0.40
                + recommendation_percentage * 0.30
                + growth_percentage * 0.30
            ),
            2
        )

        if overall_score >= 80:
            score_label = "Strong"
        elif overall_score >= 60:
            score_label = "Good"
        elif overall_score >= 40:
            score_label = "Moderate"
        else:
            score_label = "Developing"

        return {
            "success": True,

            "guidance_relevance": {
                "score": guidance_score,
                "readings_with_guidance": guidance_count,
                "total_readings": total_readings
            },

            "recommendation_usage": {
                "readings_with_recommendation_signals": recommendation_count,
                "percentage": recommendation_percentage,
                "total_readings": total_readings
            },

            "personal_growth_insights": {
                "readings_with_growth_signals": growth_count,
                "percentage": growth_percentage,
                "total_readings": total_readings
            },

            "overall_insight_score": {
                "score": overall_score,
                "label": score_label
            }
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate guidance effectiveness: {str(e)}"
        )

@router.get("/consultation-insights")
def get_consultation_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_consultant(current_user)

    try:
        readings = (
            db.query(TarotReading)
            .filter(TarotReading.user_id.isnot(None))
            .order_by(TarotReading.created_at.desc())
            .all()
        )

        total_readings = len(readings)

        # --------------------------------------------------
        # 1. CONSULTATION SUMMARY
        # --------------------------------------------------

        user_ids = {
            reading.user_id
            for reading in readings
            if reading.user_id is not None
        }

        spread_counter = Counter()

        for reading in readings:
            spread_name = (
                reading.spread_name
                or reading.spread_type
                or "Unknown"
            )

            spread_counter[spread_name] += 1

        most_common_reading = (
            spread_counter.most_common(1)[0][0]
            if spread_counter
            else "No data"
        )

        consultation_summary = {
            "total_consultations": total_readings,
            "users_served": len(user_ids),
            "most_common_reading": most_common_reading
        }

        # --------------------------------------------------
        # 2. COMMON TOPICS
        # --------------------------------------------------

        topic_keywords = {
            "Career": [
                "career",
                "job",
                "work",
                "profession"
            ],
            "Relationships": [
                "relationship",
                "love",
                "partner",
                "marriage"
            ],
            "Personal Growth": [
                "growth",
                "development",
                "self",
                "confidence"
            ],
            "Finance": [
                "finance",
                "money",
                "wealth",
                "financial"
            ],
            "Life Direction": [
                "future",
                "path",
                "direction",
                "opportunity"
            ]
        }

        topic_counter = Counter()

        for reading in readings:

            text = (
                f"{reading.spread_name or ''} "
                f"{reading.spread_type or ''} "
                f"{reading.overall_reading or ''}"
            ).lower()

            for topic, keywords in topic_keywords.items():

                if any(
                    keyword in text
                    for keyword in keywords
                ):
                    topic_counter[topic] += 1

        common_topics = [
            {
                "topic": topic,
                "count": count
            }
            for topic, count
            in topic_counter.most_common()
        ]

        # --------------------------------------------------
        # 3. RECENT CONSULTATIONS
        # --------------------------------------------------

        recent_consultations = []

        for reading in readings[:5]:

            reading_text = (
                reading.overall_reading
                or "No reading summary available."
            )

            # Keep the preview short for the dashboard.
            if len(reading_text) > 180:
                reading_text = (
                    reading_text[:180].rstrip()
                    + "..."
                )

            recent_consultations.append({
                "reading_id": reading.reading_id,
                "user_id": reading.user_id,
                "spread_name": (
                    reading.spread_name
                    or reading.spread_type
                    or "Unknown"
                ),
                "created_at": (
                    reading.created_at.isoformat()
                    if reading.created_at
                    else None
                ),
                "summary": reading_text
            })

        # --------------------------------------------------
        # 4. KEY INSIGHTS
        # --------------------------------------------------

        key_insights = []

        if total_readings > 0:

            key_insights.append({
                "title": "Consultation Volume",
                "description": (
                    f"{total_readings} consultations "
                    f"have been recorded for "
                    f"{len(user_ids)} users."
                )
            })

        if most_common_reading != "No data":

            most_common_count = (
                spread_counter[most_common_reading]
            )

            key_insights.append({
                "title": "Popular Reading",
                "description": (
                    f"{most_common_reading} is the "
                    f"most frequently used reading type "
                    f"with {most_common_count} consultations."
                )
            })

        if common_topics:

            top_topic = common_topics[0]

            key_insights.append({
                "title": "Common Topic",
                "description": (
                    f"{top_topic['topic']} appears most often "
                    f"among the detected consultation topics."
                )
            })

        if len(user_ids) > 0:

            average = round(
                total_readings / len(user_ids),
                2
            )

            key_insights.append({
                "title": "User Engagement",
                "description": (
                    f"Users have an average of "
                    f"{average} consultations each."
                )
            })

        return {
            "success": True,

            "consultation_summary": consultation_summary,

            "common_topics": common_topics,

            "recent_consultations": recent_consultations,

            "key_insights": key_insights
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate consultation insights: "
                f"{str(e)}"
            )
        )

