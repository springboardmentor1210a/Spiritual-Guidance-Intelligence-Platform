from collections import Counter
from datetime import datetime, timezone
import re


# ============================================================
# Milestone 3 - Personalized Intelligence Engine
# ============================================================
#
# This module creates explainable personalized reflections from:
#   1. User profile
#   2. Saved palm readings
#   3. Saved tarot readings
#   4. Recurring themes
#
# It intentionally does NOT claim to be a trained medical,
# psychological, predictive, or scientific AI model.
#
# The architecture is prepared so a real ML/LLM provider can
# replace or augment these functions later.
# ============================================================


THEME_KEYWORDS = {
    "career": [
        "career",
        "job",
        "work",
        "business",
        "profession",
        "success",
        "leadership",
        "money",
        "finance",
        "achievement",
    ],
    "relationships": [
        "love",
        "relationship",
        "partner",
        "family",
        "friend",
        "friendship",
        "connection",
        "romance",
        "heart",
    ],
    "confidence": [
        "confidence",
        "courage",
        "strength",
        "self-belief",
        "growth",
        "independence",
        "potential",
        "motivation",
    ],
    "education": [
        "study",
        "education",
        "learning",
        "exam",
        "knowledge",
        "college",
        "school",
        "research",
        "skill",
    ],
    "wellbeing": [
        "peace",
        "balance",
        "calm",
        "meditation",
        "mindfulness",
        "wellbeing",
        "wellness",
        "healing",
        "rest",
    ],
    "change": [
        "change",
        "transition",
        "new",
        "journey",
        "future",
        "opportunity",
        "transformation",
        "move",
        "decision",
    ],
}


THEME_DESCRIPTIONS = {
    "career": (
        "Your recent activity shows a recurring focus on career, achievement, "
        "work or practical progress."
    ),
    "relationships": (
        "Your recent reflections place noticeable attention on relationships, "
        "connections and emotional understanding."
    ),
    "confidence": (
        "Confidence, personal growth and recognising your own strengths appear "
        "as recurring themes."
    ),
    "education": (
        "Learning, knowledge and skill development appear repeatedly in your "
        "recent interests or readings."
    ),
    "wellbeing": (
        "Balance, calmness and personal wellbeing are recurring areas of "
        "reflection."
    ),
    "change": (
        "Change, transition and future possibilities appear frequently across "
        "your recent reflections."
    ),
}


THEME_ACTIONS = {
    "career": (
        "Choose one practical career goal and break it into a small action "
        "you can complete this week."
    ),
    "relationships": (
        "Make time for one honest, positive conversation with someone important "
        "to you."
    ),
    "confidence": (
        "Write down three things you handled well recently and use them as "
        "evidence of your progress."
    ),
    "education": (
        "Set aside a focused learning session and work on one skill rather "
        "than trying to improve everything at once."
    ),
    "wellbeing": (
        "Create a short daily pause for rest, reflection or mindfulness before "
        "moving to the next task."
    ),
    "change": (
        "Identify one change you can influence directly and take one small "
        "step toward it."
    ),
}


def clean_text(value):
    if value is None:
        return ""

    return str(value).strip()


def normalise_text(value):
    value = clean_text(value).lower()
    value = re.sub(r"\s+", " ", value)
    return value


def get_profile_text(profile):
    if not profile:
        return ""

    values = [
        getattr(profile, "interests", None),
        getattr(profile, "spiritual_goals", None),
        getattr(profile, "reading_preferences", None),
        getattr(profile, "bio", None),
        getattr(profile, "age_group", None),
    ]

    return " ".join(
        clean_text(value)
        for value in values
        if clean_text(value)
    )


def get_reading_text(reading):
    if not reading:
        return ""

    values = [
        getattr(reading, "title", None),
        getattr(reading, "input_summary", None),
        getattr(reading, "result_text", None),
    ]

    return " ".join(
        clean_text(value)
        for value in values
        if clean_text(value)
    )


def score_themes(profile=None, readings=None):
    """
    Score recurring themes using profile information and saved readings.

    This is intentionally explainable:
    each theme receives one point for every matching keyword.
    """

    readings = readings or []

    combined_text = normalise_text(get_profile_text(profile))

    for reading in readings:
        combined_text += " "
        combined_text += normalise_text(get_reading_text(reading))

    scores = Counter()

    for theme, keywords in THEME_KEYWORDS.items():
        for keyword in keywords:
            if keyword in combined_text:
                scores[theme] += 1

    return scores


def get_top_themes(profile=None, readings=None, limit=3):
    scores = score_themes(profile, readings)

    if not scores:
        return [
            {
                "theme": "self_reflection",
                "score": 1,
                "description": (
                    "Your activity currently provides a broad space for "
                    "self-reflection and personal exploration."
                ),
            }
        ]

    result = []

    for theme, score in scores.most_common(limit):
        result.append(
            {
                "theme": theme,
                "score": score,
                "description": THEME_DESCRIPTIONS.get(
                    theme,
                    "This theme appears repeatedly in your recent activity."
                ),
            }
        )

    return result


def get_reading_summary(readings):
    readings = readings or []

    total = len(readings)

    palm_count = sum(
        1
        for reading in readings
        if normalise_text(getattr(reading, "reading_type", "")) == "palm"
    )

    tarot_count = sum(
        1
        for reading in readings
        if normalise_text(getattr(reading, "reading_type", "")) == "tarot"
    )

    return {
        "total": total,
        "palm": palm_count,
        "tarot": tarot_count,
    }


def build_personalized_interpretation(profile=None, readings=None):
    """
    Create a personalized reflection from the user's profile and
    saved reading activity.
    """

    readings = readings or []

    summary = get_reading_summary(readings)
    themes = get_top_themes(profile, readings, limit=3)

    profile_text = normalise_text(get_profile_text(profile))

    if summary["total"] == 0:
        opening = (
            "Your intelligence profile is ready to learn from your future "
            "reading activity. As you explore palm and tarot readings, "
            "recurring themes will become more visible here."
        )
    else:
        opening = (
            f"You currently have {summary['total']} saved reading"
            f"{'s' if summary['total'] != 1 else ''}, including "
            f"{summary['palm']} palm reading"
            f"{'s' if summary['palm'] != 1 else ''} and "
            f"{summary['tarot']} tarot reading"
            f"{'s' if summary['tarot'] != 1 else ''}."
        )

    theme_lines = []

    for item in themes:
        theme_lines.append(
            f"{item['description']}"
        )

    if profile_text:
        profile_line = (
            "Your profile information is also being used to keep these "
            "reflections relevant to the interests and goals you have shared."
        )
    else:
        profile_line = (
            "Completing more of your profile can make these reflections "
            "more personally relevant."
        )

    interpretation = " ".join(
        [
            opening,
            *theme_lines,
            profile_line,
            (
                "These observations are reflective patterns from your saved "
                "activity, not predictions or psychological diagnoses."
            ),
        ]
    )

    return {
        "title": "Personalized intelligence reflection",
        "interpretation": interpretation,
        "themes": themes,
        "reading_summary": summary,
        "engine": "explainable_rule_based_intelligence",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def build_next_actions(profile=None, readings=None):
    """
    Generate practical next actions from the strongest recurring themes.
    """

    readings = readings or []
    themes = get_top_themes(profile, readings, limit=3)

    actions = []

    for index, item in enumerate(themes, start=1):
        theme = item["theme"]

        if theme in THEME_ACTIONS:
            action_text = THEME_ACTIONS[theme]
        else:
            action_text = (
                "Spend a few minutes reviewing what you want to understand "
                "or improve next."
            )

        actions.append(
            {
                "id": index,
                "theme": theme,
                "action": action_text,
            }
        )

    return actions


def build_activity_signal(readings):
    """
    Determine a simple engagement signal from saved readings.
    """

    readings = readings or []

    if not readings:
        return {
            "level": "starting",
            "label": "Beginning your reflection journey",
            "description": (
                "Your intelligence profile will become richer as you save "
                "more readings."
            ),
        }

    if len(readings) <= 2:
        return {
            "level": "exploring",
            "label": "Exploring",
            "description": (
                "You have started building a personal reflection history."
            ),
        }

    if len(readings) <= 7:
        return {
            "level": "engaged",
            "label": "Engaged",
            "description": (
                "You have enough reading activity to begin identifying "
                "recurring themes."
            ),
        }

    return {
        "level": "consistent",
        "label": "Consistent",
        "description": (
            "Your saved activity provides a stronger foundation for "
            "personalized reflection patterns."
        ),
    }


def build_full_intelligence(profile=None, readings=None):
    """
    Combined response used by the Milestone 3 dashboard.
    """

    readings = readings or []

    interpretation = build_personalized_interpretation(
        profile=profile,
        readings=readings,
    )

    return {
        "interpretation": interpretation,
        "next_actions": build_next_actions(
            profile=profile,
            readings=readings,
        ),
        "activity_signal": build_activity_signal(readings),
    }