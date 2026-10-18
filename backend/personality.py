"""
Personality Intelligence Module
AI-Powered Palmistry and Tarot-Based Personalized Spiritual Guidance Platform

Supports:
    1. Palmistry-only personality
    2. Tarot-only personality
    3. Combined Palmistry + Tarot personality

Note:
This module provides symbolic/spiritual reflection based on the supplied
palmistry and tarot inputs. It is not a scientific personality assessment.
"""

from typing import Any, Dict, List, Optional


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def _safe_text(value: Any, default: str = "") -> str:
    """
    Convert any value into clean text safely.
    """

    if value is None:
        return default

    if isinstance(value, str):
        return value.strip()

    if isinstance(value, (int, float, bool)):
        return str(value)

    return str(value).strip()


def _is_detected(value: Any) -> bool:
    """
    Robustly determine whether a palm feature is detected/present.

    Handles values such as:
        "detected"
        "Life line detected"
        "present"
        "visible"
        "identified"
        True
        1

    Avoids treating:
        "not detected"
        "not present"
        "absent"
        "none"

    as detected.
    """

    if value is None:
        return False

    if isinstance(value, bool):
        return value

    if isinstance(value, (int, float)):
        return value > 0

    text = _safe_text(value).lower()

    if not text:
        return False

    negative_phrases = [
        "not detected",
        "not present",
        "not visible",
        "not identified",
        "absent",
        "missing",
        "none",
        "no line",
        "no feature",
        "unavailable",
    ]

    for phrase in negative_phrases:
        if phrase in text:
            return False

    positive_tokens = [
        "detected",
        "present",
        "visible",
        "identified",
        "found",
        "clear",
        "strong",
        "defined",
        "prominent",
    ]

    for token in positive_tokens:
        if token in text:
            return True

    return False


def _get_confidence(value: Any) -> Optional[float]:
    """
    Safely convert confidence values to percentages.

    Examples:
        0.75 -> 75.0
        75 -> 75.0
        "75%" -> 75.0
        "0.75" -> 75.0
    """

    if value is None:
        return None

    try:
        if isinstance(value, str):
            text = value.strip().replace("%", "")

            if not text:
                return None

            number = float(text)

        else:
            number = float(value)

        if 0 <= number <= 1:
            number *= 100

        return round(
            max(0.0, min(100.0, number)),
            2
        )

    except (ValueError, TypeError):
        return None


def _unique(items: List[str]) -> List[str]:
    """
    Remove duplicate strings while preserving order.
    """

    result = []

    for item in items:

        item = _safe_text(item)

        if item and item not in result:
            result.append(item)

    return result


def _join_phrases(items: List[str]) -> str:
    """
    Convert a list into readable sentence text.
    """

    items = [
        item
        for item in items
        if item
    ]

    if not items:
        return ""

    if len(items) == 1:
        return items[0]

    if len(items) == 2:
        return f"{items[0]} and {items[1]}"

    return ", ".join(items[:-1]) + f", and {items[-1]}"


# ============================================================
# PALMISTRY PERSONALITY
# ============================================================

def _build_palmistry_personality(
    palm_features: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generate personality information from Palmistry features.

    Challenges are generated as symbolic focus areas even when
    a palm feature is detected.

    These challenges are not scientific predictions.
    """

    palm_features = palm_features or {}

    traits: List[str] = []
    strengths: List[str] = []
    challenges: List[str] = []

    # --------------------------------------------------------
    # Extract line information
    # --------------------------------------------------------

    life_line = palm_features.get("life_line")
    heart_line = palm_features.get("heart_line")
    head_line = palm_features.get("head_line")
    fate_line = palm_features.get("fate_line")

    life_detected = _is_detected(life_line)
    heart_detected = _is_detected(heart_line)
    head_detected = _is_detected(head_line)
    fate_detected = _is_detected(fate_line)

    # --------------------------------------------------------
    # Life Line
    # --------------------------------------------------------

    if life_detected:

        traits.append(
            "Energetic and adaptable"
        )

        strengths.append(
            "The detected Life Line is symbolically associated with "
            "energy, resilience, and adaptability."
        )

        challenges.append(
            "Maintaining a balanced routine and avoiding unnecessary "
            "stress can support consistent personal energy."
        )

    else:

        challenges.append(
            "The Life Line was not clearly identified, so interpretation "
            "of this feature remains limited."
        )

    # --------------------------------------------------------
    # Heart Line
    # --------------------------------------------------------

    if heart_detected:

        traits.append(
            "Emotionally aware"
        )

        strengths.append(
            "The detected Heart Line is symbolically associated with "
            "emotional awareness and interpersonal sensitivity."
        )

        challenges.append(
            "Managing emotions and maintaining clear communication can "
            "help support healthy relationships."
        )

    else:

        challenges.append(
            "The Heart Line was not clearly identified, so emotional "
            "interpretation remains limited."
        )

    # --------------------------------------------------------
    # Head Line
    # --------------------------------------------------------

    if head_detected:

        traits.append(
            "Thoughtful and analytical"
        )

        strengths.append(
            "The detected Head Line is symbolically associated with "
            "thinking, analysis, and decision-making."
        )

        challenges.append(
            "Avoiding overthinking and balancing careful analysis with "
            "practical action can support better decision-making."
        )

    else:

        challenges.append(
            "The Head Line was not clearly identified, so analytical "
            "interpretation remains limited."
        )

    # --------------------------------------------------------
    # Fate Line
    # --------------------------------------------------------

    if fate_detected:

        traits.append(
            "Goal-oriented"
        )

        strengths.append(
            "The detected Fate Line is symbolically associated with "
            "direction, ambition, and focus on personal goals."
        )

        challenges.append(
            "Maintaining focus on long-term goals while remaining "
            "flexible when circumstances change can support career growth."
        )

    else:

        challenges.append(
            "The Fate Line was not clearly identified, so career-direction "
            "interpretation remains limited."
        )

    # --------------------------------------------------------
    # Palm Shape
    # --------------------------------------------------------

    palm_shape = _safe_text(
        palm_features.get("palm_shape"),
        "Balanced"
    )

    palm_shape_lower = palm_shape.lower()

    if "long" in palm_shape_lower:

        traits.append(
            "Reflective and intuitive"
        )

        strengths.append(
            "The palm shape is symbolically associated with reflection, "
            "intuition, and sensitivity."
        )

        challenges.append(
            "Balancing careful reflection with practical action can help "
            "avoid spending too much time analyzing situations."
        )

    elif "wide" in palm_shape_lower:

        traits.append(
            "Practical and action-oriented"
        )

        strengths.append(
            "The palm shape is symbolically associated with practicality, "
            "confidence, and action-oriented thinking."
        )

        challenges.append(
            "Balancing action with thoughtful planning can help maintain "
            "consistent progress toward goals."
        )

    else:

        traits.append(
            "Balanced and adaptable"
        )

        strengths.append(
            "The palm shape is interpreted symbolically as suggesting "
            "balance and adaptability."
        )

        challenges.append(
            "Maintaining balance between reflection and action can support "
            "personal development."
        )

    # --------------------------------------------------------
    # Communication Style
    # --------------------------------------------------------

    if heart_detected and head_detected:

        communication_style = (
            "A balance of emotional awareness and thoughtful communication."
        )

    elif heart_detected:

        communication_style = (
            "Emotionally aware communication with attention to relationships."
        )

    elif head_detected:

        communication_style = (
            "Thoughtful communication with an analytical approach."
        )

    else:

        communication_style = (
            "Communication style cannot be strongly inferred from the "
            "available palm features."
        )

    # --------------------------------------------------------
    # Decision Style
    # --------------------------------------------------------

    if head_detected and fate_detected:

        decision_style = (
            "Thoughtful decision-making combined with attention to goals "
            "and direction."
        )

    elif head_detected:

        decision_style = (
            "Analytical and reflective decision-making."
        )

    elif fate_detected:

        decision_style = (
            "Goal-focused decision-making."
        )

    else:

        decision_style = (
            "Decision style is not strongly inferred from the available "
            "palm features."
        )

    # --------------------------------------------------------
    # Emotional Style
    # --------------------------------------------------------

    if heart_detected:

        emotional_style = (
            "Emotionally aware and relationship-conscious."
        )

    else:

        emotional_style = (
            "Emotional style cannot be strongly inferred from the available "
            "palm features."
        )

    # --------------------------------------------------------
    # Detected Feature Summary
    # --------------------------------------------------------

    detected_features = []

    if life_detected:
        detected_features.append("Life Line")

    if heart_detected:
        detected_features.append("Heart Line")

    if head_detected:
        detected_features.append("Head Line")

    if fate_detected:
        detected_features.append("Fate Line")

    detected_feature_summary = (
        f"Detected palm features: {_join_phrases(detected_features)}."
        if detected_features
        else "No major palm-line features were confidently identified."
    )

    # --------------------------------------------------------
    # Confidence
    # --------------------------------------------------------

    confidence_values = []

    for key in [
        "life_confidence",
        "heart_confidence",
        "head_confidence",
        "fate_confidence",
    ]:

        confidence = _get_confidence(
            palm_features.get(key)
        )

        if confidence is not None:
            confidence_values.append(confidence)

    overall_confidence = (
        round(
            sum(confidence_values) / len(confidence_values),
            2
        )
        if confidence_values
        else None
    )

    # --------------------------------------------------------
    # Return Palmistry Personality
    # --------------------------------------------------------

    return {
        "mode": "palmistry_only",

        "traits": _unique(traits),

        "strengths": _unique(strengths),

        "challenges": _unique(challenges),

        "communication_style": communication_style,

        "decision_style": decision_style,

        "emotional_style": emotional_style,

        "palm_features": palm_features,

        "palm_shape": palm_shape,

        "detected_feature_summary": detected_feature_summary,

        "confidence": overall_confidence,

        "disclaimer": (
            "Palmistry interpretations are symbolic reflections and should "
            "not be treated as scientific personality measurements."
        ),
    }


# ============================================================
# TAROT PERSONALITY
# ============================================================

def _build_tarot_personality(
    tarot_card: Optional[str] = None,
    tarot_meaning: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate personality information from Tarot.
    """

    card = _safe_text(tarot_card)
    meaning = _safe_text(tarot_meaning)

    card_lower = card.lower()

    traits: List[str] = []
    strengths: List[str] = []
    challenges: List[str] = []

    # --------------------------------------------------------
    # Page of Wands
    # --------------------------------------------------------

    if "page of wands" in card_lower:

        traits.extend([
            "Curious",
            "Creative",
            "Open to new experiences",
        ])

        strengths.extend([
            "Curiosity and willingness to explore new possibilities.",
            "Creative energy and enthusiasm for learning.",
        ])

        challenges.extend([
            "May need consistency when starting new activities.",
            "Enthusiasm can sometimes lead to acting before planning.",
        ])

    # --------------------------------------------------------
    # Knight of Pentacles
    # --------------------------------------------------------

    elif "knight of pentacles" in card_lower:

        traits.extend([
            "Patient",
            "Reliable",
            "Practical",
        ])

        strengths.extend([
            "Persistence and commitment to long-term goals.",
            "Practical and steady approach to responsibilities.",
        ])

        challenges.extend([
            "May become overly cautious when making changes.",
            "Progress can sometimes be slower because of careful planning.",
        ])

    # --------------------------------------------------------
    # Three of Pentacles
    # --------------------------------------------------------

    elif "three of pentacles" in card_lower:

        traits.extend([
            "Collaborative",
            "Skilled",
            "Growth-oriented",
        ])

        strengths.extend([
            "Ability to learn through teamwork and collaboration.",
            "Focus on developing skills and improving performance.",
        ])

        challenges.extend([
            "May depend heavily on external feedback.",
            "Needs to balance teamwork with independent decision-making.",
        ])

    # --------------------------------------------------------
    # General Tarot Interpretation
    # --------------------------------------------------------

    else:

        traits.extend([
            "Reflective",
            "Open-minded",
            "Self-aware",
        ])

        strengths.extend([
            "Willingness to reflect on experiences.",
            "Openness to considering different perspectives.",
        ])

        challenges.extend([
            "Interpretations may change depending on personal context.",
            "Symbolic messages should be considered thoughtfully rather "
            "than as fixed outcomes.",
        ])

    # --------------------------------------------------------
    # Communication
    # --------------------------------------------------------

    if any(
        word in card_lower
        for word in [
            "wands",
            "cups",
        ]
    ):

        communication_style = (
            "Expressive and reflective communication with attention to "
            "personal experiences."
        )

    elif any(
        word in card_lower
        for word in [
            "pentacles",
            "swords",
        ]
    ):

        communication_style = (
            "Thoughtful and practical communication focused on clarity "
            "and understanding."
        )

    else:

        communication_style = (
            "Reflective communication shaped by the symbolic meaning "
            "of the selected Tarot card."
        )

    # --------------------------------------------------------
    # Decision Style
    # --------------------------------------------------------

    if "knight of pentacles" in card_lower:

        decision_style = (
            "Patient and practical decision-making with attention to "
            "long-term consistency."
        )

    elif "page of wands" in card_lower:

        decision_style = (
            "Curious and exploratory decision-making, with interest in "
            "new opportunities."
        )

    elif "three of pentacles" in card_lower:

        decision_style = (
            "Collaborative decision-making supported by learning and "
            "practical feedback."
        )

    else:

        decision_style = (
            "Reflective decision-making based on personal context and "
            "the symbolic Tarot message."
        )

    # --------------------------------------------------------
    # Emotional Style
    # --------------------------------------------------------

    if "cups" in card_lower:

        emotional_style = (
            "Emotionally reflective and sensitive to interpersonal experiences."
        )

    elif "wands" in card_lower:

        emotional_style = (
            "Enthusiastic and motivated by inspiration and new experiences."
        )

    elif "pentacles" in card_lower:

        emotional_style = (
            "Steady and grounded emotional approach."
        )

    elif "swords" in card_lower:

        emotional_style = (
            "Reflective emotional processing with attention to thoughts "
            "and clarity."
        )

    else:

        emotional_style = (
            "Reflective emotional style influenced by the symbolic Tarot "
            "interpretation."
        )

    return {
        "mode": "tarot_only",

        "tarot_card": card,

        "tarot_meaning": meaning,

        "traits": _unique(traits),

        "strengths": _unique(strengths),

        "challenges": _unique(challenges),

        "communication_style": communication_style,

        "decision_style": decision_style,

        "emotional_style": emotional_style,

        "confidence": None,

        "disclaimer": (
            "Tarot interpretations are symbolic reflections and should "
            "not be treated as scientific personality measurements."
        ),
    }


# ============================================================
# COMBINED CATEGORY GENERATION
# ============================================================

def _build_combined_categories(
    palm_features: Optional[Dict[str, Any]],
    tarot_card: Optional[str],
    tarot_meaning: Optional[str],
) -> Dict[str, Dict[str, Any]]:
    """
    Build the four personality categories required by Insights.

    The categories synthesize evidence from both Palmistry and Tarot
    instead of simply displaying the two sources separately.
    """

    palm_features = palm_features or {}

    card = _safe_text(tarot_card)
    meaning = _safe_text(tarot_meaning)

    card_lower = card.lower()

    # Palm indicators

    heart = _is_detected(
        palm_features.get("heart_line")
    )

    head = _is_detected(
        palm_features.get("head_line")
    )

    life = _is_detected(
        palm_features.get("life_line")
    )

    fate = _is_detected(
        palm_features.get("fate_line")
    )

    palm_shape = _safe_text(
        palm_features.get("palm_shape"),
        "Balanced"
    ).lower()

    # Tarot themes

    is_wands = "wands" in card_lower
    is_cups = "cups" in card_lower
    is_pentacles = "pentacles" in card_lower
    is_swords = "swords" in card_lower

    # --------------------------------------------------------
    # RELATIONSHIP
    # --------------------------------------------------------

    relationship_basis = []

    if heart:

        relationship_basis.append(
            "emotional awareness from the Heart Line"
        )

    if is_cups:

        relationship_basis.append(
            "emotional reflection represented by the Tarot"
        )

    if is_wands:

        relationship_basis.append(
            "enthusiastic interpersonal energy represented by the Tarot"
        )

    if is_pentacles:

        relationship_basis.append(
            "steady and dependable Tarot energy"
        )

    if relationship_basis:

        relationship_text = (
            "The combined reading suggests an approach to relationships "
            "that balances "
            + _join_phrases(relationship_basis)
            + ". Maintaining clear communication and mutual understanding "
              "can support healthy connections."
        )

    else:

        relationship_text = (
            "The combined reading encourages thoughtful communication, "
            "self-awareness, and respect for different perspectives in "
            "relationships."
        )

    # --------------------------------------------------------
    # CAREER
    # --------------------------------------------------------

    career_basis = []

    if head:

        career_basis.append(
            "analytical thinking from the Head Line"
        )

    if fate:

        career_basis.append(
            "goal orientation associated with the Fate Line"
        )

    if is_pentacles:

        career_basis.append(
            "steady and practical energy represented by the Tarot"
        )

    if is_wands:

        career_basis.append(
            "curiosity and initiative represented by the Tarot"
        )

    if is_swords:

        career_basis.append(
            "clarity and analytical reflection represented by the Tarot"
        )

    if career_basis:

        career_text = (
            "For career development, the combined reading connects "
            + _join_phrases(career_basis)
            + ". This combination can be used as a reflection point for "
              "planning goals, developing skills, and responding "
              "constructively to opportunities."
        )

    else:

        career_text = (
            "The combined reading encourages practical goal-setting, "
            "continuous learning, and thoughtful evaluation of career "
            "opportunities."
        )

    # --------------------------------------------------------
    # FINANCIAL
    # --------------------------------------------------------

    financial_basis = []

    if fate:

        financial_basis.append(
            "focus on direction and long-term goals"
        )

    if is_pentacles:

        financial_basis.append(
            "practical and steady themes from the Tarot"
        )

    if is_wands:

        financial_basis.append(
            "initiative and exploration from the Tarot"
        )

    if head:

        financial_basis.append(
            "careful thinking associated with the Head Line"
        )

    if financial_basis:

        financial_text = (
            "The financial reflection combines "
            + _join_phrases(financial_basis)
            + ". A balanced approach can involve careful planning, "
              "responsible decisions, and evaluating opportunities before "
              "acting."
        )

    else:

        financial_text = (
            "The combined reading encourages responsible planning, "
            "careful decision-making, and avoiding impulsive financial "
            "choices."
        )

    # --------------------------------------------------------
    # PERSONAL GROWTH
    # --------------------------------------------------------

    growth_basis = []

    if life:

        growth_basis.append(
            "adaptability and resilience associated with the Life Line"
        )

    if head:

        growth_basis.append(
            "reflection and analytical thinking associated with the Head Line"
        )

    if is_wands:

        growth_basis.append(
            "curiosity and willingness to explore new experiences"
        )

    if is_pentacles:

        growth_basis.append(
            "patience and consistency"
        )

    if is_cups:

        growth_basis.append(
            "emotional reflection"
        )

    if growth_basis:

        growth_text = (
            "For personal growth, the combined reading brings together "
            + _join_phrases(growth_basis)
            + ". These themes can support reflection, continuous learning, "
              "adaptability, and gradual personal development."
        )

    else:

        growth_text = (
            "The combined reading encourages self-reflection, continuous "
            "learning, adaptability, and gradual personal development."
        )

    return {
        "relationship": {
            "title": "Relationship",
            "summary": relationship_text,
            "source_basis": "Palmistry + Tarot synthesis",
        },

        "career": {
            "title": "Career",
            "summary": career_text,
            "source_basis": "Palmistry + Tarot synthesis",
        },

        "financial": {
            "title": "Financial",
            "summary": financial_text,
            "source_basis": "Palmistry + Tarot synthesis",
        },

        "personal_growth": {
            "title": "Personal Growth",
            "summary": growth_text,
            "source_basis": "Palmistry + Tarot synthesis",
        },
    }


# ============================================================
# COMBINED PERSONALITY
# ============================================================

def _build_combined_personality(
    palm_features: Optional[Dict[str, Any]] = None,
    tarot_card: Optional[str] = None,
    tarot_meaning: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate a combined personality profile using both Palmistry
    and Tarot inputs.

    This is an actual synthesis layer rather than simply returning
    Palmistry and Tarot outputs side by side.
    """

    palm_features = palm_features or {}

    palmistry = _build_palmistry_personality(
        palm_features
    )

    tarot = _build_tarot_personality(
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning,
    )

    # --------------------------------------------------------
    # Combine traits
    # --------------------------------------------------------

    palm_traits = palmistry.get(
        "traits",
        []
    )

    tarot_traits = tarot.get(
        "traits",
        []
    )

    combined_traits = _unique(
        palm_traits + tarot_traits
    )

    # --------------------------------------------------------
    # Combine strengths
    # --------------------------------------------------------

    palm_strengths = palmistry.get(
        "strengths",
        []
    )

    tarot_strengths = tarot.get(
        "strengths",
        []
    )

    combined_strengths = _unique(
        palm_strengths + tarot_strengths
    )

    # --------------------------------------------------------
    # Combine challenges
    # --------------------------------------------------------

    palm_challenges = palmistry.get(
        "challenges",
        []
    )

    tarot_challenges = tarot.get(
        "challenges",
        []
    )

    combined_challenges = _unique(
        palm_challenges + tarot_challenges
    )

    # --------------------------------------------------------
    # Combined communication
    # --------------------------------------------------------

    heart_detected = _is_detected(
        palm_features.get("heart_line")
    )

    head_detected = _is_detected(
        palm_features.get("head_line")
    )

    tarot_card_text = _safe_text(
        tarot_card
    ).lower()

    if heart_detected and head_detected:

        communication_style = (
            "The combined reading suggests communication that balances "
            "emotional awareness with thoughtful reasoning."
        )

    elif heart_detected:

        communication_style = (
            "The combined reading emphasizes emotionally aware and "
            "relationship-conscious communication."
        )

    elif head_detected:

        communication_style = (
            "The combined reading emphasizes thoughtful, analytical, "
            "and clear communication."
        )

    elif "wands" in tarot_card_text:

        communication_style = (
            "The combined reading suggests expressive communication "
            "with curiosity and enthusiasm."
        )

    elif "pentacles" in tarot_card_text:

        communication_style = (
            "The combined reading suggests practical and dependable "
            "communication."
        )

    else:

        communication_style = (
            "The combined reading encourages clear, thoughtful, and "
            "self-aware communication."
        )

    # --------------------------------------------------------
    # Combined decision style
    # --------------------------------------------------------

    fate_detected = _is_detected(
        palm_features.get("fate_line")
    )

    if head_detected and fate_detected:

        decision_style = (
            "The combined reading suggests thoughtful decision-making "
            "with attention to long-term goals."
        )

    elif head_detected:

        decision_style = (
            "The combined reading suggests analytical and reflective "
            "decision-making."
        )

    elif fate_detected:

        decision_style = (
            "The combined reading suggests goal-focused decision-making "
            "with attention to direction."
        )

    elif "knight of pentacles" in tarot_card_text:

        decision_style = (
            "The combined reading suggests patient and practical "
            "decision-making."
        )

    elif "page of wands" in tarot_card_text:

        decision_style = (
            "The combined reading suggests exploratory decision-making "
            "while considering new possibilities."
        )

    else:

        decision_style = (
            "The combined reading encourages thoughtful decisions based "
            "on personal context and reflection."
        )

    # --------------------------------------------------------
    # Combined emotional style
    # --------------------------------------------------------

    if heart_detected and "cups" in tarot_card_text:

        emotional_style = (
            "The combined reading emphasizes emotional awareness, "
            "reflection, and sensitivity to interpersonal experiences."
        )

    elif heart_detected:

        emotional_style = (
            "The combined reading emphasizes emotional awareness and "
            "attention to relationships."
        )

    elif "cups" in tarot_card_text:

        emotional_style = (
            "The combined reading emphasizes emotional reflection "
            "and interpersonal awareness."
        )

    elif "wands" in tarot_card_text:

        emotional_style = (
            "The combined reading suggests an enthusiastic and "
            "motivated emotional approach."
        )

    elif "pentacles" in tarot_card_text:

        emotional_style = (
            "The combined reading suggests a steady and grounded "
            "emotional approach."
        )

    else:

        emotional_style = (
            "The combined reading encourages emotional awareness "
            "and reflective self-understanding."
        )

    # --------------------------------------------------------
    # Four Insights categories
    # --------------------------------------------------------

    categories = _build_combined_categories(
        palm_features=palm_features,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning,
    )

    # --------------------------------------------------------
    # Confidence
    # --------------------------------------------------------

    palm_confidence = palmistry.get(
        "confidence"
    )

    # Tarot does not have an AI confidence value in this module.

    combined_confidence = palm_confidence

    # --------------------------------------------------------
    # Feature summary
    # --------------------------------------------------------

    detected_features = []

    for key, label in [
        ("life_line", "Life Line"),
        ("heart_line", "Heart Line"),
        ("head_line", "Head Line"),
        ("fate_line", "Fate Line"),
    ]:

        if _is_detected(
            palm_features.get(key)
        ):

            detected_features.append(label)

    tarot_name = _safe_text(
        tarot_card
    )

    source_summary_parts = []

    if detected_features:

        source_summary_parts.append(
            "Palmistry: "
            + _join_phrases(detected_features)
        )

    if tarot_name:

        source_summary_parts.append(
            f"Tarot: {tarot_name}"
        )

    source_summary = (
        ". ".join(source_summary_parts) + "."
        if source_summary_parts
        else "Palmistry and Tarot source information is limited."
    )

    # --------------------------------------------------------
    # Return
    # --------------------------------------------------------

    result = {

        "mode": "combined",

        "traits": combined_traits,

        "strengths": combined_strengths,

        "challenges": combined_challenges,

        "communication_style": communication_style,

        "decision_style": decision_style,

        "emotional_style": emotional_style,

        "confidence": combined_confidence,

        "palmistry_confidence": palmistry.get(
            "confidence"
        ),

        "tarot_confidence": None,

        "source_summary": source_summary,

        # Keep individual source data
        # for backend compatibility.

        "palmistry": palmistry,

        "tarot": tarot,

        # Main four categories
        # for Insights page.

        "categories": categories,

        # Also expose them at top level
        # for existing insights.html.

        "relationship": categories[
            "relationship"
        ],

        "career": categories[
            "career"
        ],

        "financial": categories[
            "financial"
        ],

        "personal_growth": categories[
            "personal_growth"
        ],

        "disclaimer": (
            "Combined Palmistry and Tarot personality information is a "
            "symbolic reflection based on the supplied inputs. It should "
            "not be treated as a scientific personality assessment or "
            "as a prediction of future events."
        ),
    }

    return result


# ============================================================
# MAIN PUBLIC FUNCTION
# ============================================================

def generate_personality_base(
    palm_features: Optional[Dict[str, Any]] = None,
    tarot_card: Optional[str] = None,
    tarot_meaning: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Main personality generation function.

    Modes:

        Palmistry only:
            generate_personality(
                palm_features=palm_features
            )

        Tarot only:
            generate_personality(
                tarot_card="The Hermit",
                tarot_meaning="..."
            )

        Combined:
            generate_personality(
                palm_features=palm_features,
                tarot_card="The Hermit",
                tarot_meaning="..."
            )
    """

    # --------------------------------------------------------
    # Determine whether valid Palmistry data exists
    # --------------------------------------------------------

    has_palmistry = False

    if (
        isinstance(palm_features, dict)
        and palm_features
    ):

        meaningful_keys = [
            "life_line",
            "heart_line",
            "head_line",
            "fate_line",
            "palm_shape",
            "other_features",
        ]

        for key in meaningful_keys:

            value = palm_features.get(key)

            if (
                value is not None
                and _safe_text(value)
            ):

                has_palmistry = True
                break

    # --------------------------------------------------------
    # Determine whether valid Tarot data exists
    # --------------------------------------------------------

    has_tarot = bool(
        _safe_text(tarot_card)
    )

    # --------------------------------------------------------
    # Combined
    # --------------------------------------------------------

    if has_palmistry and has_tarot:

        return _build_combined_personality(
            palm_features=palm_features,
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning,
        )

    # --------------------------------------------------------
    # Palmistry only
    # --------------------------------------------------------

    if has_palmistry:

        return _build_palmistry_personality(
            palm_features=palm_features
        )

    # --------------------------------------------------------
    # Tarot only
    # --------------------------------------------------------

    if has_tarot:

        return _build_tarot_personality(
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning,
        )

    # --------------------------------------------------------
    # No data
    # --------------------------------------------------------

    return {

        "mode": "no_data",

        "traits": [],

        "strengths": [],

        "challenges": [],

        "communication_style": "",

        "decision_style": "",

        "emotional_style": "",

        "confidence": None,

        "categories": {},

        "disclaimer": (
            "Personality information requires Palmistry or Tarot input."
        ),
    }
def _safe_list(value):
    """Convert a value into a clean list of text items."""
    if value is None:
        return []

    if isinstance(value, str):
        value = [value]

    if not isinstance(value, (list, tuple, set)):
        return []

    result = []

    for item in value:
        if isinstance(item, str):
            item = item.strip()
            if item and item not in result:
                result.append(item)

    return result


def _safe_dict(value):
    """Return a dictionary or an empty dictionary."""
    return value if isinstance(value, dict) else {}


def _first_available(*values):
    """Return the first non-empty value."""
    for value in values:
        if isinstance(value, str) and value.strip():
            return value.strip()
        if isinstance(value, (int, float)):
            return value
    return None


def _build_personality_sections(base):
    """
    Organize existing personality results into five dashboard sections.
    Works with palmistry, tarot, and combined personality results.
    """
    base = _safe_dict(base)

    traits = _safe_list(base.get("traits"))
    strengths = _safe_list(base.get("strengths"))
    challenges = _safe_list(
        base.get("challenges") or base.get("weaknesses")
    )

    communication = _first_available(
        base.get("communication_style")
    )
    decision = _first_available(base.get("decision_style"))
    emotional = _first_available(base.get("emotional_style"))

    mode = base.get("mode", "unknown")

    # 1. Personality Profiling
    personality_profiling = {
        "title": "Personality Profiling",
        "profile_type": mode,
        "overview": (
            "This profile organizes reflective observations from "
            "your available Palmistry and Tarot reading data."
        ),
        "personality_traits": traits,
        "communication_style": communication,
        "decision_style": decision,
        "emotional_style": emotional,
        "palm_shape": base.get("palm_shape"),
        "confidence": base.get("confidence"),
    }

    # 2. Strength Analysis
    strength_analysis = {
        "title": "Strength Analysis",
        "strengths": strengths,
        "total_strengths": len(strengths),
        "summary": (
            "Review these possible strengths and consider which ones "
            "match your real-life experiences."
            if strengths
            else "Complete a Palmistry or Tarot reading to generate "
                 "reading-based strength observations."
        ),
    }

    # 3. Weakness Analysis
    weakness_analysis = {
        "title": "Weakness Analysis",
        "challenges": challenges,
        "areas_to_improve": challenges,
        "total_challenges": len(challenges),
        "summary": (
            "These are possible challenges for reflection, not proven "
            "weaknesses. Use your own experiences to decide what applies."
            if challenges
            else "No specific challenges were identified from the "
                 "available reading data."
        ),
    }

    # 4. Behavioral Insights
    behavioral_insights = {
        "title": "Behavioral Insights",
        "communication": communication or (
            "Not enough information to describe communication style yet."
        ),
        "decision_making": decision or (
            "Not enough information to describe decision-making style yet."
        ),
        "emotional_patterns": emotional or (
            "Not enough information to describe emotional style yet."
        ),
        "observed_traits": traits,
        "relationship_insights": _safe_dict(
            base.get("categories")
        ).get("relationship", {}),
        "career_insights": _safe_dict(
            base.get("categories")
        ).get("career", {}),
    }

    # 5. Personal Development Recommendations
    recommendations = []

    challenge_text = " ".join(challenges).lower()
    communication_text = (communication or "").lower()
    decision_text = (decision or "").lower()
    emotional_text = (emotional or "").lower()

    # Recommendations are selected from the actual available profile.
    if challenges:
        recommendations.append(
            "Choose one identified challenge and set a small, "
            "measurable improvement goal for this week."
        )

    if communication:
        recommendations.append(
            "Practice clear communication by expressing your thoughts "
            "and listening carefully to other viewpoints."
        )

    if decision:
        recommendations.append(
            "For important decisions, write down your options, "
            "compare their advantages and disadvantages, and review "
            "the likely consequences."
        )

    if emotional:
        recommendations.append(
            "Reflect on your emotions regularly and consider healthy "
            "ways to manage stress, such as journaling or taking breaks."
        )

    if strengths:
        recommendations.append(
            "Use one of your identified strengths in a study, work, "
            "or personal goal this week."
        )

    if not recommendations:
        recommendations.extend([
            "Record your goals and progress in a weekly journal.",
            "Ask trusted people for constructive feedback.",
            "Choose one skill to practise consistently each week.",
        ])

    # Avoid duplicate recommendations.
    recommendations = list(dict.fromkeys(recommendations))

    personal_development_recommendations = {
        "title": "Personal Development Recommendations",
        "recommendations": recommendations,
        "weekly_action_plan": [
            {
                "day": "Day 1",
                "action": "Choose one personal development goal."
            },
            {
                "day": "Days 2-3",
                "action": "Practise one small action related to that goal."
            },
            {
                "day": "Days 4-6",
                "action": "Continue practising and record your progress."
            },
            {
                "day": "Day 7",
                "action": "Review your progress and choose the next step."
            },
        ],
        "note": (
            "These suggestions are general self-development guidance. "
            "Adjust them to your real needs and experiences."
        ),
    }

    # Preserve all original fields for backward compatibility.
    result = dict(base)

    result.update({
        "personality_profiling": personality_profiling,
        "strength_analysis": strength_analysis,
        "weakness_analysis": weakness_analysis,
        "behavioral_insights": behavioral_insights,
        "personal_development_recommendations":
            personal_development_recommendations,
    })

    return result


def generate_personality(
    palm_features=None,
    tarot_card=None,
    tarot_meaning=None
):
    """
    Public entry point for all five personality dashboard sections.
    """
    base = generate_personality_base(
        palm_features=palm_features,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning,
    )

    return _build_personality_sections(base)