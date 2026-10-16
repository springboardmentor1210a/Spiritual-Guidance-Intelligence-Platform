import random
from typing import Any

from sqlalchemy.orm import Session

from app.data.milestone3_demos import AI_INTERPRETATION_DEMOS
from app.models.ai_interpretation import AIInterpretation
from app.models.reading_session import ReadingSession


# ============================================================
# READING SESSION
# ============================================================


def _get_session(
    db: Session,
    user_id: int,
    reading_session_id: int,
):
    row = (
        db.query(ReadingSession)
        .filter(
            ReadingSession.id == reading_session_id,
            ReadingSession.user_id == user_id,
        )
        .first()
    )

    if row is None:
        raise ValueError("Reading session not found.")

    return row


# ============================================================
# EXISTING INTERPRETATION
# ============================================================


def _get_existing(
    db: Session,
    user_id: int,
    reading_session_id: int,
):
    return (
        db.query(AIInterpretation)
        .filter(
            AIInterpretation.user_id == user_id,
            AIInterpretation.reading_session_id == reading_session_id,
        )
        .order_by(AIInterpretation.created_at.desc())
        .first()
    )


# ============================================================
# PROFILE RESOLUTION
# ============================================================


def _profile_from_row(
    row: AIInterpretation,
) -> dict[str, Any]:
    profile_id = (row.source_data or {}).get(
        "demo_profile_id"
    )

    return next(
        (
            profile
            for profile in AI_INTERPRETATION_DEMOS
            if profile["id"] == profile_id
        ),
        AI_INTERPRETATION_DEMOS[0],
    )


# ============================================================
# ENRICH INTERPRETATION
# ============================================================
#
# IMPORTANT:
#
# We are NOT adding database columns.
#
# These additional fields are attached to the SQLAlchemy
# object at runtime so that Pydantic can expose them through
# the API response.
#
# The same values are also stored inside source_data JSON.
# ============================================================


def _enrich_interpretation(
    row: AIInterpretation,
    profile: dict[str, Any],
) -> AIInterpretation:

    row.key_themes = profile.get(
        "key_themes",
        [],
    )

    row.dominant_patterns = profile.get(
        "dominant_patterns",
        [],
    )

    row.areas_to_reflect = profile.get(
        "areas_to_reflect",
        [],
    )

    row.synthesis = profile.get(
        "synthesis",
        "",
    )

    return row


# ============================================================
# CREATE AI INTERPRETATION
# ============================================================


def generate_ai_interpretation(
    db: Session,
    user_id: int,
    reading_session_id: int,
):
    # --------------------------------------------------------
    # 1. Verify reading belongs to current user
    # --------------------------------------------------------

    _get_session(
        db=db,
        user_id=user_id,
        reading_session_id=reading_session_id,
    )

    # --------------------------------------------------------
    # 2. Reuse existing interpretation
    #
    # This is important because we want ONE consistent
    # intelligence profile for the entire Milestone 3 flow.
    # --------------------------------------------------------

    existing = _get_existing(
        db=db,
        user_id=user_id,
        reading_session_id=reading_session_id,
    )

    if existing:

        profile = _profile_from_row(existing)

        return _enrich_interpretation(
            existing,
            profile,
        )

    # --------------------------------------------------------
    # 3. Select one demo intelligence profile
    #
    # The selected profile is cached against this reading
    # session, so Personality, Recommendations, Life Trends
    # and Dashboard all use the same profile.
    # --------------------------------------------------------

    profile = random.choice(
        AI_INTERPRETATION_DEMOS
    )

    # --------------------------------------------------------
    # 4. Store the core interpretation
    # --------------------------------------------------------

    row = AIInterpretation(
        user_id=user_id,
        reading_session_id=reading_session_id,

        interpretation_type="demo_profile",

        context="general",

        overview=profile["overview"],

        personality=profile["personality"],

        relationships=profile["relationships"],

        career=profile["career"],

        finance=profile["finance"],

        health_wellness=profile["health_wellness"],

        personal_growth=profile["personal_growth"],

        life_opportunities=profile[
            "life_opportunities"
        ],

        # ----------------------------------------------------
        # Existing JSON field
        #
        # We can safely store the extended intelligence here
        # because source_data is already a JSON column.
        # ----------------------------------------------------

        source_data={
            "engine": "milestone3_demo_profile",

            "demo_profile_id": profile["id"],

            "demo_profile_name": profile["name"],

            "selection": "random_profile",

            # Extended AI interpretation
            "key_themes": profile.get(
                "key_themes",
                [],
            ),

            "dominant_patterns": profile.get(
                "dominant_patterns",
                [],
            ),

            "areas_to_reflect": profile.get(
                "areas_to_reflect",
                [],
            ),

            "synthesis": profile.get(
                "synthesis",
                "",
            ),
        },
    )

    # --------------------------------------------------------
    # 5. Save
    # --------------------------------------------------------

    db.add(row)

    db.commit()

    db.refresh(row)

    # --------------------------------------------------------
    # 6. Attach extended fields to returned object
    # --------------------------------------------------------

    return _enrich_interpretation(
        row,
        profile,
    )


# ============================================================
# GET COMPLETE PROFILE FOR READING
# ============================================================


def get_profile_for_reading(
    db: Session,
    user_id: int,
    reading_session_id: int,
):
    existing = _get_existing(
        db=db,
        user_id=user_id,
        reading_session_id=reading_session_id,
    )

    if existing is None:

        existing = generate_ai_interpretation(
            db=db,
            user_id=user_id,
            reading_session_id=reading_session_id,
        )

    return _profile_from_row(existing)