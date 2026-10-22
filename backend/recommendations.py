# recommendations.py

from typing import Any


def _to_text(value: Any) -> str:
    """Convert an optional value into safe, readable text."""
    if value is None:
        return ""
    if isinstance(value, (list, tuple, set)):
        return ", ".join(str(item) for item in value if item is not None)
    if isinstance(value, dict):
        return " ".join(
            f"{key}: {item}"
            for key, item in value.items()
            if item is not None
        )
    return str(value).strip()


def _first_text(*values: Any) -> str:
    """Return the first non-empty value."""
    for value in values:
        text = _to_text(value)
        if text:
            return text
    return ""


def generate_recommendations(
    user_context: dict | None = None,
    palm_data: dict | None = None,
    tarot_data: dict | None = None,
    guidance_data: dict | None = None,
) -> dict:
    """
    Generate five categories of reflective recommendations.

    These are general self-reflection suggestions, not predictions
    or scientifically validated personality assessments.
    """
    context = user_context or {}
    palm = palm_data or {}
    tarot = tarot_data or {}
    guidance = guidance_data or {}

    interests = _first_text(
        context.get("interests"),
        context.get("spiritual_interests"),
        context.get("preferences"),
    )
    goals = _first_text(
        context.get("goals"),
        context.get("personal_goals"),
        context.get("spiritual_goals"),
        context.get("career_goal"),
    )
    occupation = _first_text(
        context.get("occupation"),
        context.get("career"),
    )
    palm_interpretation = _first_text(
        palm.get("interpretation"),
        palm.get("personalized_guidance"),
        palm.get("summary"),
    )
    tarot_interpretation = _first_text(
        tarot.get("personalized_guidance"),
        tarot.get("interpretation"),
        tarot.get("summary"),
    )
    existing_guidance = _first_text(
        guidance.get("personalized_guidance"),
        guidance.get("interpretation"),
        guidance.get("summary"),
    )

    personal_growth = [
        "Choose one skill you want to improve and practise it for "
        "15–20 minutes each day.",
        "Write down one achievement and one lesson learned at the end "
        "of each day.",
        "Review your progress weekly and adjust your routine when needed.",
    ]

    relationship_guidance = [
        "Practise active listening and allow others to explain their "
        "feelings without interruption.",
        "Communicate your needs respectfully and establish healthy boundaries.",
        "When a disagreement occurs, focus on understanding the problem "
        "rather than assigning blame.",
    ]

    career_suggestions = [
        "Identify the skills required for your preferred career and "
        "create a practical learning plan.",
        "Build a small project that demonstrates your abilities and "
        "document what you learned.",
        "Request constructive feedback and use it to improve your work.",
    ]

    goal_alignment = [
        "Write down your main goal in a clear, measurable form.",
        "Break the goal into weekly tasks and select the most important "
        "task to complete first.",
        "Review your progress every week and update your plan when your "
        "priorities change.",
    ]

    spiritual_development = [
        "Spend five minutes a day in quiet reflection, meditation, "
        "prayer, or another practice meaningful to you.",
        "Record recurring thoughts, questions, and personal values in "
        "a journal.",
        "Use palmistry and tarot interpretations as optional prompts for "
        "self-reflection, not as guaranteed predictions or substitutes "
        "for professional advice.",
    ]

    # Add user-specific context to the response without assuming
    # that palmistry or tarot can reliably predict real-world outcomes.
    if interests:
        personal_growth.insert(
            0,
            f"Choose a personal-development activity connected to "
            f"your interests: {interests}.",
        )

    if goals:
        goal_alignment.insert(
            0,
            f"Compare your weekly activities with your stated goal: {goals}.",
        )

    if occupation:
        career_suggestions.insert(
            0,
            f"Review how your current responsibilities or experience "
            f"relate to your career direction: {occupation}.",
        )

    reading_notes = []
    if palm_interpretation:
        reading_notes.append({
            "source": "palmistry",
            "summary": palm_interpretation,
        })

    if tarot_interpretation:
        reading_notes.append({
            "source": "tarot",
            "summary": tarot_interpretation,
        })

    if existing_guidance:
        reading_notes.append({
            "source": "personalized_guidance",
            "summary": existing_guidance,
        })

    return {
        "personal_growth_recommendations": personal_growth,
        "relationship_guidance": relationship_guidance,
        "career_suggestions": career_suggestions,
        "goal_alignment_recommendations": goal_alignment,
        "spiritual_development_insights": spiritual_development,
        "personalization_context": {
            "interests": interests or None,
            "goals": goals or None,
            "occupation": occupation or None,
        },
        "reading_notes": reading_notes,
        "disclaimer": (
            "Recommendations are for reflection and general personal "
            "development. Palmistry and tarot interpretations are not "
            "scientifically validated predictions."
        ),
    }