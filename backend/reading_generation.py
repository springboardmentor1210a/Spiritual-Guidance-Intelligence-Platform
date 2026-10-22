from tarot_interpretation import generate_tarot_interpretation


# =========================================================
# TAROT READING
# =========================================================

def generate_reading(card_name, meaning, question=None):
    """
    Generate a complete Tarot reading.
    """

    if not card_name:
        return "Please select a Tarot card."

    if not meaning:
        return "Tarot card meaning is not available."

    interpretation = generate_tarot_interpretation(
        card_name,
        meaning
    )

    if question:
        question_section = (
            f"Your Question:\n"
            f"{question}\n\n"
        )
    else:
        question_section = ""

    reading = (
        f"Tarot Reading\n\n"
        f"{question_section}"
        f"Card: {card_name}\n\n"
        f"Meaning: {meaning}\n\n"
        f"Guidance: {interpretation}\n\n"
        f"Reading Summary:\n"
        f"This card provides guidance related to "
        f"your current situation. Reflect on the "
        f"card's meaning and consider how its message "
        f"may relate to your life."
    )

    return reading


# =========================================================
# PALMISTRY PERSONALIZED GUIDANCE
# =========================================================

def generate_palmistry_guidance(
    palm_features,
    interpretation
):
    """
    Generate personalized guidance from Palmistry analysis.

    Palmistry is treated as a traditional/entertainment
    interpretation and not as a scientific prediction.
    """

    if not palm_features:
        return "Palmistry features are not available."

    if not interpretation:
        return "Palmistry interpretation is not available."

    heart_line = palm_features.get(
        "heart_line",
        "Not available"
    )

    head_line = palm_features.get(
        "head_line",
        "Not available"
    )

    life_line = palm_features.get(
        "life_line",
        "Not available"
    )

    fate_line = palm_features.get(
        "fate_line",
        "Not available"
    )

    palm_shape = palm_features.get(
        "palm_shape",
        "Not available"
    )

    guidance = (
        "Palmistry Personalized Guidance\n\n"

        f"Palm Shape:\n"
        f"{palm_shape}\n\n"

        f"Life Line:\n"
        f"{life_line}\n\n"

        f"Heart Line:\n"
        f"{heart_line}\n\n"

        f"Head Line:\n"
        f"{head_line}\n\n"

        f"Fate Line:\n"
        f"{fate_line}\n\n"

        f"Palmistry Interpretation:\n"
        f"{interpretation}\n\n"

        "Personalized Guidance:\n"

        "Emotional Awareness:\n"
        "Reflect on your emotional patterns and "
        "relationships. Try to maintain healthy "
        "communication and emotional balance.\n\n"

        "Thinking and Learning:\n"
        "Use your strengths in thinking and learning "
        "to improve your skills and personal growth.\n\n"

        "Personal Development:\n"
        "Set realistic goals and work consistently "
        "towards them. Use your experiences as "
        "opportunities for learning.\n\n"

        "Career and Direction:\n"
        "Consider your interests, skills and goals "
        "when making career-related decisions. "
        "The Fate Line interpretation can be used "
        "as a traditional reflection theme rather "
        "than a prediction.\n\n"

        "Overall Guidance:\n"
        "Use the palmistry reading as a tool for "
        "self-reflection and personal development. "
        "It should not be considered a scientific "
        "prediction or a substitute for professional "
        "advice."
    )

    return guidance