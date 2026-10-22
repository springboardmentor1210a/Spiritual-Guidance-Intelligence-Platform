"""
AI Interpretation Engine
Palmistry and Tarot Intelligence Platform

Features:
1. Palm interpretation generation
2. Tarot interpretation generation
3. Context-aware insight generation
4. Personalized guidance creation
5. Reading synthesis
6. Seven insight categories

Rule-based reflective interpretations.
"""

from typing import Any, Optional


INSIGHT_CATEGORIES = [
    "Personality",
    "Relationships",
    "Career",
    "Finance",
    "Health & Wellness",
    "Personal Growth",
    "Life Opportunities",
]


def _clean(value: Any, default: str = "Not available") -> str:
    """Convert optional values into readable text."""
    if value is None:
        return default

    result = str(value).strip()
    return result if result else default


def generate_palm_interpretation(
    palm_features: Optional[dict] = None,
) -> str:
    """Generate a palmistry interpretation."""

    if not palm_features:
        return "No palmistry features were provided."

    fields = [
        ("Palm Shape", "palm_shape"),
        ("Heart Line", "heart_line"),
        ("Head Line", "head_line"),
        ("Life Line", "life_line"),
        ("Fate Line", "fate_line"),
    ]

    lines = ["Palmistry Interpretation", ""]

    for label, key in fields:
        value = _clean(palm_features.get(key))
        lines.append(f"{label}: {value}")

    lines.extend([
        "",
        "Detection Confidence:",
        f"Heart Line: {_clean(palm_features.get('heart_confidence'))}%",
        f"Head Line: {_clean(palm_features.get('head_confidence'))}%",
        f"Life Line: {_clean(palm_features.get('life_confidence'))}%",
        f"Fate Line: {_clean(palm_features.get('fate_confidence'))}%",
        "",
        "Traditional palmistry offers symbolic themes for "
        "self-reflection. These interpretations are not scientifically "
        "validated personality assessments or predictions.",
    ])

    return "\n".join(lines)


def generate_tarot_interpretation(
    tarot_card: Optional[str] = None,
    tarot_meaning: Optional[str] = None,
    tarot_interpretation: Optional[str] = None,
) -> str:
    """Generate a tarot interpretation."""

    if not tarot_card:
        return "No tarot card was provided."

    parts = [
        "Tarot Interpretation",
        "",
        f"Selected Card: {_clean(tarot_card)}",
        f"Traditional Meaning: {_clean(tarot_meaning)}",
        f"Reading Interpretation: {_clean(tarot_interpretation)}",
        "",
        "Use tarot symbolism as a prompt for reflection and "
        "consideration of personal choices, not as a prediction "
        "of future events.",
    ]

    return "\n".join(parts)


def generate_context_aware_insights(
    palm_features: Optional[dict] = None,
    tarot_card: Optional[str] = None,
    tarot_meaning: Optional[str] = None,
    tarot_interpretation: Optional[str] = None,
    user_question: Optional[str] = None,
    user_goals: Optional[str] = None,
    user_context: Optional[dict] = None,
) -> dict:
    """Generate structured insights for all seven categories."""

    has_palm = bool(palm_features)
    has_tarot = bool(tarot_card)
    has_reading = has_palm or has_tarot

    categories = {
        "Personality": (
            "Reflect on your values, habits, possible strengths, "
            "and areas for development."
        ),
        "Relationships": (
            "Consider communication, mutual respect, boundaries, "
            "and understanding other perspectives."
        ),
        "Career": (
            "Review your skills, learning goals, work preferences, "
            "and practical professional development steps."
        ),
        "Finance": (
            "Reflect on budgeting, spending habits, saving goals, "
            "and evidence-based financial decisions."
        ),
        "Health & Wellness": (
            "Consider general wellbeing, rest, stress management, "
            "and healthy routines. This is not medical advice."
        ),
        "Personal Growth": (
            "Identify a skill to develop, a habit to improve, "
            "and a realistic action to practise."
        ),
        "Life Opportunities": (
            "Explore opportunities that align with your interests, "
            "goals, abilities, and available resources."
        ),
    }

    context_parts = []

    if has_palm:
        context_parts.append(
            "Palm features: " + str(palm_features)
        )

    if has_tarot:
        context_parts.append(
            f"Tarot card: {tarot_card}"
        )

    if tarot_meaning:
        context_parts.append(
            f"Tarot meaning: {tarot_meaning}"
        )

    if tarot_interpretation:
        context_parts.append(
            f"Tarot interpretation: {tarot_interpretation}"
        )

    if user_question:
        context_parts.append(
            f"User question: {user_question}"
        )

    if user_goals:
        context_parts.append(
            f"User goals: {user_goals}"
        )

    if user_context:
        context_parts.append(
            f"Additional context: {user_context}"
        )

    context_description = (
        " | ".join(context_parts)
        if context_parts
        else "No reading information supplied."
    )

    results = {}

    for category, prompt in categories.items():
        results[category] = {
            "available": has_reading,
            "insight": (
                f"{category}: {prompt} "
                f"Available context: {context_description}"
                if has_reading
                else (
                    "No reading data is available yet. "
                    "Generate a palmistry or tarot reading first."
                )
            ),
        }

    return {
        "context_used": {
            "palmistry_available": has_palm,
            "tarot_available": has_tarot,
            "user_question_provided": bool(user_question),
            "user_goals_provided": bool(user_goals),
            "profile_context_provided": bool(user_context),
        },
        "categories": results,
    }


def generate_personalized_guidance(
    insights: Optional[dict] = None,
    user_goals: Optional[str] = None,
) -> dict:
    """Generate actionable reflection suggestions."""

    insights = insights or {}
    categories = insights.get("categories", {})
    guidance = []

    for category in INSIGHT_CATEGORIES:
        item = categories.get(category, {})

        if item.get("available"):
            guidance.append({
                "category": category,
                "recommendation": item.get("insight", ""),
                "action": (
                    f"Choose one realistic {category.lower()}-related "
                    "action and review your progress."
                ),
            })

    return {
        "title": "Personalized Guidance",
        "user_goal": user_goals,
        "guidance": guidance,
        "note": (
            "Guidance supports reflection and planning. "
            "It does not replace professional medical or financial advice."
        ),
    }


def generate_reading_synthesis(
    palm_interpretation: Optional[str] = None,
    tarot_interpretation: Optional[str] = None,
) -> dict:
    """Synthesize available readings without inventing agreement."""

    if palm_interpretation and tarot_interpretation:
        source = "palmistry_and_tarot"
        synthesis = (
            "Both readings are available. Compare their themes, "
            "reflect on what is relevant to your goals, and choose "
            "practical next steps based on your circumstances."
        )
    elif palm_interpretation:
        source = "palmistry"
        synthesis = (
            "Only palmistry is available. Tarot information "
            "has not been provided."
        )
    elif tarot_interpretation:
        source = "tarot"
        synthesis = (
            "Only tarot is available. Palmistry information "
            "has not been provided."
        )
    else:
        source = "none"
        synthesis = "No reading information is available."

    return {
        "source": source,
        "palmistry": palm_interpretation,
        "tarot": tarot_interpretation,
        "synthesis": synthesis,
    }


def generate_ai_interpretation_details(
    palm_features: Optional[dict] = None,
    tarot_card: Optional[str] = None,
    tarot_meaning: Optional[str] = None,
    tarot_interpretation: Optional[str] = None,
    user_question: Optional[str] = None,
    user_goals: Optional[str] = None,
    user_context: Optional[dict] = None,
) -> dict:
    """
    Return structured output for the dashboard.

    Use this function when the frontend needs individual
    insight categories and guidance fields.
    """

    palm_result = (
        generate_palm_interpretation(palm_features)
        if palm_features
        else None
    )

    tarot_result = (
        generate_tarot_interpretation(
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning,
            tarot_interpretation=tarot_interpretation,
        )
        if tarot_card
        else None
    )

    insights = generate_context_aware_insights(
        palm_features=palm_features,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning,
        tarot_interpretation=tarot_interpretation,
        user_question=user_question,
        user_goals=user_goals,
        user_context=user_context,
    )

    guidance = generate_personalized_guidance(
        insights=insights,
        user_goals=user_goals,
    )

    synthesis = generate_reading_synthesis(
        palm_interpretation=palm_result,
        tarot_interpretation=tarot_result,
    )

    return {
        "success": bool(palm_result or tarot_result),
        "engine": "AI Interpretation Engine",
        "palm_interpretation": palm_result,
        "tarot_interpretation": tarot_result,
        "context_aware_insights": insights,
        "personalized_guidance": guidance,
        "reading_synthesis": synthesis,
        "insight_categories": INSIGHT_CATEGORIES,
    }


def generate_ai_interpretation(
    palm_features: Optional[dict] = None,
    tarot_card: Optional[str] = None,
    tarot_meaning: Optional[str] = None,
    tarot_interpretation: Optional[str] = None,
) -> str:
    """
    Backward-compatible function for existing backend modules.

    Preserve the string return type expected by
    personalized_guidance.py.
    """

    result = generate_ai_interpretation_details(
        palm_features=palm_features,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning,
        tarot_interpretation=tarot_interpretation,
    )

    sections = []

    if result["palm_interpretation"]:
        sections.append(result["palm_interpretation"])

    if result["tarot_interpretation"]:
        sections.append(result["tarot_interpretation"])

    synthesis = result["reading_synthesis"]["synthesis"]
    sections.extend([
        "Reading Synthesis",
        synthesis,
        "",
        "Insight Categories",
    ])

    for category, item in result[
        "context_aware_insights"
    ]["categories"].items():
        sections.append(f"\n{category}")
        sections.append(item["insight"])

    sections.extend([
        "",
        "Personalized Guidance",
    ])

    for item in result["personalized_guidance"]["guidance"]:
        sections.append(
            f"{item['category']}: {item['action']}"
        )

    return "\n".join(sections)


if __name__ == "__main__":
    import json

    sample_palm = {
        "heart_line": "Detected",
        "head_line": "Detected",
        "life_line": "Detected",
        "fate_line": "Detected",
        "heart_confidence": 81.5,
        "head_confidence": 78.4,
        "life_confidence": 69.5,
        "fate_confidence": 15.8,
        "palm_shape": "Long Palm",
    }

    result = generate_ai_interpretation_details(
        palm_features=sample_palm,
        tarot_card="The Sun",
        tarot_meaning="Positivity and confidence",
        tarot_interpretation=(
            "A prompt to reflect on confidence and growth."
        ),
        user_question="How can I improve my personal development?",
        user_goals="Develop my skills and confidence",
    )

    print(json.dumps(result, indent=2, ensure_ascii=False))