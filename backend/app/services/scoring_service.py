from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional


from .knowledge import categories_from_text, clamp, TRAITS
from .trend_service import theme_distribution
from .personality_service import palm_trait_vector


# -------------------------------------------------------------------
# WEIGHTS
# -------------------------------------------------------------------

WEIGHTS = {
    "palm_confidence": 0.30,
    "tarot_relevance": 0.25,
    "personality_alignment": 0.20,
    "user_context": 0.15,
    "reading_consistency": 0.10,
}

NEUTRAL = 0.5


LABELS = {
    "palm_confidence": "Palm Confidence",
    "tarot_relevance": "Tarot Relevance",
    "personality_alignment": "Personality Match",
    "user_context": "User Context",
    "reading_consistency": "Reading Consistency",
}


_MISSING_HINT = {
    "palm_confidence": "Add a palm reading for stronger palm confidence.",
    "tarot_relevance": "Add tarot readings to improve tarot relevance.",
    "personality_alignment": "More reading data is needed for stronger personality alignment.",
    "user_context": "Complete your profile with interests and spiritual goals.",
    "reading_consistency": "Complete more readings over time for a stronger consistency signal.",
}


# -------------------------------------------------------------------
# RESONANCE TIER
# -------------------------------------------------------------------

def resonance_tier(score: float) -> str:
    """
    Convert the overall insight score into a simple guidance tier.
    """

    if score >= 80:
        return "High Resonance"
    elif score >= 65:
        return "Steady Resonance"
    elif score >= 45:
        return "Developing Insight"
    else:
        return "Early Insight"


# -------------------------------------------------------------------
# PALM READINGS
# -------------------------------------------------------------------

def _palm_readings(readings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Return only palmistry readings.
    """

    return [
        reading
        for reading in readings
        if str(reading.get("reading_type", "")).lower()
        in {"palmistry", "palm"}
    ]


# -------------------------------------------------------------------
# PALM CONFIDENCE
# -------------------------------------------------------------------

def palm_confidence(readings: List[Dict[str, Any]]) -> float:
    """
    Estimate palm-analysis confidence from stored palm reading scores.

    Reading scores are expected to be approximately 0-100.
    """

    palms = _palm_readings(readings)

    if not palms:
        return NEUTRAL

    scores = []

    for reading in palms:
        score = reading.get("score")

        if score is None:
            details = reading.get("details") or {}

            if isinstance(details, dict):
                score = (
                    details.get("line_density_score")
                    or details.get("confidence")
                    or details.get("score")
                )

        try:
            if score is not None:
                score = float(score)

                # Support both 0-1 and 0-100 formats.
                if score > 1:
                    score = score / 100.0

                scores.append(clamp(score))

        except (TypeError, ValueError):
            continue

    if not scores:
        return NEUTRAL

    # More recent readings are slightly more relevant.
    return clamp(sum(scores) / len(scores))


# -------------------------------------------------------------------
# PROFILE CATEGORIES
# -------------------------------------------------------------------

def profile_categories(profile: Optional[Dict[str, Any]]) -> List[str]:
    """
    Extract relevant guidance categories from the user's profile.
    """

    if not profile:
        return []

    text_parts = []

    for key in (
        "interests",
        "spiritual_goals",
        "reading_preferences",
        "name",
    ):
        value = profile.get(key)

        if value:
            text_parts.append(str(value))

    text = " ".join(text_parts)

    if not text.strip():
        return []

    return categories_from_text(text)


# -------------------------------------------------------------------
# TAROT RELEVANCE
# -------------------------------------------------------------------

def _relevance_from_cards(
    cards: List[Dict[str, Any]],
    target_categories: List[str],
) -> float:
    """
    Estimate tarot relevance against user profile categories.
    """

    if not cards:
        return NEUTRAL

    if not target_categories:
        return NEUTRAL

    target_set = set(target_categories)

    matches = 0
    total = 0

    for card in cards:
        if not isinstance(card, dict):
            continue

        text_parts = [
            str(card.get("name", "")),
            str(card.get("meaning", "")),
            str(card.get("keywords", "")),
            str(card.get("description", "")),
        ]

        text = " ".join(text_parts).strip()

        if not text:
            continue

        card_categories = set(categories_from_text(text))

        total += 1

        if card_categories.intersection(target_set):
            matches += 1

    if total == 0:
        return NEUTRAL

    return clamp(matches / total)


# -------------------------------------------------------------------
# SPREAD RELEVANCE
# -------------------------------------------------------------------

def spread_relevance_score(
    readings: List[Dict[str, Any]],
    target_categories: List[str],
) -> float:
    """
    Calculate relevance across tarot readings.
    """

    tarot_readings = [
        reading
        for reading in readings
        if str(reading.get("reading_type", "")).lower() == "tarot"
    ]

    if not tarot_readings:
        return NEUTRAL

    scores = []

    for reading in tarot_readings:
        details = reading.get("details")

        cards = []

        if isinstance(details, list):
            cards = details

        elif isinstance(details, dict):
            possible_cards = details.get("cards")

            if isinstance(possible_cards, list):
                cards = possible_cards

        if cards:
            scores.append(
                _relevance_from_cards(
                    cards,
                    target_categories,
                )
            )

    if not scores:
        return NEUTRAL

    return clamp(sum(scores) / len(scores))


def tarot_relevance(
    readings: List[Dict[str, Any]],
    profile: Optional[Dict[str, Any]],
) -> float:
    """
    Calculate how relevant tarot readings are to the user's context.
    """

    categories = profile_categories(profile)

    return spread_relevance_score(
        readings,
        categories,
    )


# -------------------------------------------------------------------
# USER CONTEXT RELEVANCE
# -------------------------------------------------------------------

def context_relevance(
    readings: List[Dict[str, Any]],
    profile: Optional[Dict[str, Any]],
) -> float:
    """
    Measure how much usable user-context information is available.

    This is intentionally based on profile completeness rather than
    making assumptions about the user's personal life.
    """

    if not profile:
        return 0.0

    fields = [
        "interests",
        "spiritual_goals",
        "reading_preferences",
    ]

    provided = 0

    for field in fields:
        value = profile.get(field)

        if value is not None and str(value).strip():
            provided += 1

    if not fields:
        return NEUTRAL

    completeness = provided / len(fields)

    # If there is at least some reading history, give a small additional
    # signal because the system has behavioral context.
    if readings:
        completeness = min(
            1.0,
            completeness + 0.10
        )

    return clamp(completeness)


# -------------------------------------------------------------------
# READING CONSISTENCY
# -------------------------------------------------------------------

def reading_consistency(
    readings: List[Dict[str, Any]],
    now: Optional[datetime] = None,
) -> float:
    """
    Estimate consistency using the number and recency of readings.

    The score considers:
      - number of readings
      - activity in the last 30 days
      - activity in the last 90 days
      - spacing of readings
    """

    if not readings:
        return 0.0

    now = now or datetime.utcnow()

    dates = []

    for reading in readings:
        created_at = reading.get("created_at")

        if not created_at:
            continue

        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(
                    created_at.replace("Z", "+00:00")
                )
            except ValueError:
                continue

        if isinstance(created_at, datetime):
            # Avoid timezone comparison problems.
            if created_at.tzinfo is not None:
                created_at = created_at.replace(tzinfo=None)

            dates.append(created_at)

    if not dates:
        # Reading history exists but no usable dates.
        return clamp(min(len(readings) / 10.0, 1.0))

    dates.sort(reverse=True)

    last_30 = sum(
        1
        for date in dates
        if now - date <= timedelta(days=30)
    )

    last_90 = sum(
        1
        for date in dates
        if now - date <= timedelta(days=90)
    )

    # Number-of-reading signal.
    volume_score = clamp(len(dates) / 10.0)

    # Recent activity signal.
    recent_score = clamp(last_30 / 5.0)

    # Longer-term activity signal.
    long_term_score = clamp(last_90 / 8.0)

    # Spacing signal.
    spacing_score = NEUTRAL

    if len(dates) >= 2:
        intervals = []

        for i in range(len(dates) - 1):
            delta = abs(
                (dates[i] - dates[i + 1]).total_seconds()
            ) / 86400.0

            intervals.append(delta)

        if intervals:
            average_interval = sum(intervals) / len(intervals)

            # A reasonable spread of readings over time receives a
            # stronger consistency signal.
            if 1 <= average_interval <= 30:
                spacing_score = 1.0
            elif average_interval <= 60:
                spacing_score = 0.8
            elif average_interval <= 120:
                spacing_score = 0.6
            else:
                spacing_score = 0.4

    score = (
        volume_score * 0.35
        + recent_score * 0.30
        + long_term_score * 0.20
        + spacing_score * 0.15
    )

    return clamp(score)


# -------------------------------------------------------------------
# PERSONALITY ALIGNMENT
# -------------------------------------------------------------------

def personality_alignment(
    personality: Optional[Dict[str, Any]],
    readings: List[Dict[str, Any]],
) -> float:
    """
    Estimate how strong the generated personality profile is.

    Uses the personality trait vector when available.
    """

    if not personality:
        return NEUTRAL

    # Extract traits from the personality profile
    traits = personality.get("traits") if isinstance(personality, dict) else None
    if isinstance(traits, dict) and traits:
        vector = traits
    else:
        palms = _palm_readings(readings)
        if palms and isinstance(palms[0].get("details"), dict):
            vector = palm_trait_vector(palms[0]["details"])
        else:
            vector = {}

    if not vector:
        return NEUTRAL

    values = []

    for trait in TRAITS:
        value = vector.get(trait)

        if value is None:
            continue

        try:
            value = float(value)

            # Support either 0-1 or 0-100 formats.
            if value > 1:
                value = value / 100.0

            values.append(clamp(value))

        except (TypeError, ValueError):
            continue

    if not values:
        return NEUTRAL

    # The personality engine is considered stronger when the traits
    # contain meaningful variation instead of being completely empty.
    return clamp(sum(values) / len(values))


# -------------------------------------------------------------------
# COMPUTE SCORE INPUTS
# -------------------------------------------------------------------

def compute_score_inputs(
    readings: List[Dict[str, Any]],
    profile: Optional[Dict[str, Any]],
    personality: Optional[Dict[str, Any]],
    now: Optional[datetime] = None,
) -> Dict[str, Any]:
    """
    Build all five components required by the weighted insight score.

    Returns:
        {
            "values": {
                "palm_confidence": ...,
                "tarot_relevance": ...,
                "personality_alignment": ...,
                "user_context": ...,
                "reading_consistency": ...
            },
            "missing": [...]
        }
    """

    readings = readings or []
    profile = profile or {}
    personality = personality or {}

    now = now or datetime.utcnow()

    values = {
        "palm_confidence": palm_confidence(readings),

        "tarot_relevance": tarot_relevance(
            readings,
            profile,
        ),

        "personality_alignment": personality_alignment(
            personality,
            readings,
        ),

        "user_context": context_relevance(
            readings,
            profile,
        ),

        "reading_consistency": reading_consistency(
            readings,
            now,
        ),
    }

    missing = []

    if not _palm_readings(readings):
        missing.append("palm_confidence")

    tarot_exists = any(
        str(reading.get("reading_type", "")).lower() == "tarot"
        for reading in readings
    )

    if not tarot_exists:
        missing.append("tarot_relevance")

    if not personality:
        missing.append("personality_alignment")

    if not profile_categories(profile):
        missing.append("user_context")

    if not readings:
        missing.append("reading_consistency")

    return {
        "values": values,
        "missing": missing,
    }


# -------------------------------------------------------------------
# WEIGHTED INSIGHT SCORE
# -------------------------------------------------------------------

def weighted_insight_score(
    inputs: Dict[str, Any],
    growth_potential: float = 50.0,
) -> Dict[str, Any]:
    """
    Calculate the final weighted Spiritual Guidance / Insight Score.

    Component weights:
        Palm Confidence       = 30%
        Tarot Relevance       = 25%
        Personality Alignment = 20%
        User Context          = 15%
        Reading Consistency   = 10%

    The internal component scores are 0-1.
    The returned overall score is 0-100.
    """

    if not isinstance(inputs, dict):
        inputs = {}

    values = inputs.get("values", {}) or {}
    missing = inputs.get("missing", []) or []

    weighted_total = 0.0

    breakdown = []
    components = {}
    sub_scores = {}

    for key, weight in WEIGHTS.items():
        raw_value = values.get(key, NEUTRAL)

        try:
            raw_value = float(raw_value)
        except (TypeError, ValueError):
            raw_value = NEUTRAL

        normalized = clamp(raw_value)

        percentage = normalized * 100.0
        contribution = percentage * weight

        weighted_total += contribution

        components[key] = {
            "label": LABELS.get(key, key),
            "score": round(percentage, 2),
            "weight": weight,
            "weighted_contribution": round(contribution, 2),
        }

        sub_scores[key] = round(percentage, 2)

        breakdown.append({
            "component": LABELS.get(key, key),
            "score": round(percentage, 2),
            "weight": weight,
            "contribution": round(contribution, 2),
        })

    overall_score = clamp(weighted_total, 0.0, 100.0)

    # Growth potential is retained as an optional input for compatibility.
    try:
        growth_potential = float(growth_potential)
    except (TypeError, ValueError):
        growth_potential = 50.0

    growth_potential = max(
        0.0,
        min(100.0, growth_potential)
    )

    tier = resonance_tier(overall_score)

    # ---------------------------------------------------------------
    # ADVICE
    # ---------------------------------------------------------------

    if tier == "High Resonance":
        advice = (
            "Your current readings show strong overall resonance. "
            "Continue using the insights for reflection and "
            "self-development."
        )

    elif tier == "Steady Resonance":
        advice = (
            "Your readings show a steady level of resonance. "
            "Consistent reflection and additional readings can "
            "strengthen the guidance signal."
        )

    elif tier == "Developing Insight":
        advice = (
            "Your insight profile is developing. More consistent "
            "readings and a richer profile can improve personalization."
        )

    else:
        advice = (
            "Your insight profile is still in an early stage. "
            "Complete your profile and add more readings to build "
            "a stronger guidance signal."
        )

    # Add the first useful missing-data hint.
    if missing:
        hint = _MISSING_HINT.get(missing[0])

        if hint:
            advice += f" {hint}"

    # ---------------------------------------------------------------
    # DATA QUALITY
    # ---------------------------------------------------------------

    available_components = len(WEIGHTS) - len(
        set(missing).intersection(WEIGHTS.keys())
    )

    data_quality = round(
        (available_components / len(WEIGHTS)) * 100.0,
        2,
    )

    return {
        # Legacy / compatibility keys
        "overall_score": round(overall_score, 2),
        "resonance_tier": tier,
        "advice": advice,
        "breakdown": breakdown,

        # New scoring-engine keys
        "overall_insight_score": round(overall_score, 2),

        "components": components,

        "sub_scores": sub_scores,

        "missing_inputs": missing,

        "data_quality": data_quality,

        "growth_potential": round(growth_potential, 2),

        "disclaimer": (
            "This score is intended for self-reflection and "
            "personalized guidance. It is not a scientific, "
            "medical, financial, or psychological assessment."
        ),
    }