# ============================================================
# routes/personalized_guidance.py
# Personalized Guidance - Palmistry + Tarot
# ============================================================

import json
import logging
import re
import traceback

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import User,Profile, PalmReading, TarotReading
from routes.rbac import require_user

from ai_interpretation import generate_ai_interpretation
from personality import generate_personality
from recommendations import generate_recommendations
from life_trends import generate_life_trends


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/personalized-guidance",
    tags=["Personalized Guidance"]
)


# ============================================================
# BASIC HELPERS
# ============================================================

def safe_text(value, default=""):
    if value is None:
        return default
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def contains_any(text, keywords):
    text = safe_text(text).lower()
    return any(word.lower() in text for word in keywords)


def format_for_text(value):
    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    if isinstance(value, list):
        return "\n".join(
            text for text in
            (format_for_text(item) for item in value)
            if text
        )

    if isinstance(value, dict):
        parts = []
        for key, item in value.items():
            formatted = format_for_text(item)
            if formatted:
                parts.append(
                    f"{str(key).replace('_', ' ').title()}: {formatted}"
                )
        return "\n".join(parts)

    return str(value)


def get_recommendation_category(recommendations, *keys):
    if not isinstance(recommendations, dict):
        return ""

    for key in keys:
        value = recommendations.get(key)
        formatted = format_for_text(value)
        if formatted:
            return formatted

    return ""
# ============================================================
# SPIRITUAL GUIDANCE SCORING ENGINE
# ============================================================

SCORING_WEIGHTS = {
    "palm_analysis_confidence": 0.30,
    "tarot_interpretation_relevance": 0.25,
    "personality_alignment": 0.20,
    "user_context_relevance": 0.15,
    "reading_consistency": 0.10,
}


def score_to_number(value, default=0.0):
    """Return a numeric score between 0 and 100."""
    try:
        number = float(value)
        if not (number >= 0):
            return default
        return min(number, 100.0)
    except (TypeError, ValueError):
        return default


def scoring_text(value):
    """Convert nested API data into searchable text."""
    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    if isinstance(value, dict):
        return " ".join(
            scoring_text(item) for item in value.values()
        )

    if isinstance(value, (list, tuple)):
        return " ".join(
            scoring_text(item) for item in value
        )

    return str(value)


def scoring_words(value):
    """Extract meaningful words for a simple relevance estimate."""
    stop_words = {
        "the", "and", "for", "with", "that", "this", "from",
        "your", "you", "are", "was", "were", "have", "has",
        "will", "can", "not", "but", "into", "about", "their",
        "they", "them", "its", "our", "how", "what", "when",
        "where", "who", "why", "should", "could", "would",
        "reading", "available", "guidance", "palmistry", "tarot"
    }

    return {
        word.lower()
        for word in re.findall(r"[a-zA-Z]{3,}", value)
        if word.lower() not in stop_words
    }


def calculate_text_relevance(reference, generated):
    """
    Estimate word overlap as a percentage.
    This is a baseline heuristic, not semantic AI understanding.
    """
    reference_words = scoring_words(scoring_text(reference))
    generated_words = scoring_words(scoring_text(generated))

    if not reference_words or not generated_words:
        return None

    overlap = len(reference_words & generated_words)

    return round(
        100.0 * overlap / len(reference_words),
        2
    )


def calculate_spiritual_guidance_scores(
    response,
    user_context=""
):
    """
    Score the actual personalized-guidance API response.

    A missing component is reported as unavailable instead of
    being silently treated as a perfect score.
    """

    palm = response.get("palmistry") or {}
    tarot = response.get("tarot") or {}

    palm_analysis = palm.get("analysis") or {}

    # --------------------------------------------------------
    # 1. PALM ANALYSIS CONFIDENCE
    # --------------------------------------------------------

    palm_confidence = palm_analysis.get("detection_confidence")

    if palm_confidence is None:
        palm_confidence = palm_analysis.get("analysis_confidence")

    palm_confidence = (
        score_to_number(palm_confidence)
        if palm_confidence is not None
        else None
    )

    # --------------------------------------------------------
    # Collect actual reading and guidance text
    # --------------------------------------------------------

    tarot_text = scoring_text(tarot)

    palm_text = scoring_text(palm)

    guidance_text = scoring_text({
        "personalized_guidance": response.get(
            "personalized_guidance"
        ),
        "recommendations": response.get("recommendations"),
        "life_trends": response.get("life_trends"),
        "combined_analysis": response.get("combined_analysis"),
        "reading_synthesis": response.get("reading_synthesis"),
        "combined_personality": response.get(
            "combined_personality"
        ),
    })

    personality_text = scoring_text({
        "combined_personality": response.get(
            "combined_personality"
        ),
        "personality": palm.get("personality"),
        "tarot_personality": tarot.get("personality"),
    })

    # --------------------------------------------------------
    # 2. TAROT INTERPRETATION RELEVANCE
    # --------------------------------------------------------

    tarot_relevance = calculate_text_relevance(
        tarot_text,
        guidance_text
    )

    # --------------------------------------------------------
    # 3. PERSONALITY ALIGNMENT
    # --------------------------------------------------------

    personality_alignment = calculate_text_relevance(
        personality_text,
        guidance_text
    )

    # --------------------------------------------------------
    # 4. USER CONTEXT RELEVANCE
    # --------------------------------------------------------

    context_text = scoring_text(user_context)

    user_context_relevance = (
        calculate_text_relevance(context_text, guidance_text)
        if context_text
        else None
    )

    # --------------------------------------------------------
    # 5. READING CONSISTENCY
    # --------------------------------------------------------

    reading_consistency = (
        calculate_text_relevance(palm_text, tarot_text)
        if palm and tarot
        else None
    )

    # --------------------------------------------------------
    # Additional summary scores
    # --------------------------------------------------------

    available_confidences = [
        score for score in [
            palm_confidence,
            100.0 if tarot_text.strip() else None
        ]
        if score is not None
    ]

    reading_confidence = (
        round(
            sum(available_confidences)
            / len(available_confidences),
            2
        )
        if available_confidences
        else None
    )

    relevance_components = [
        (tarot_relevance, 0.65),
        (user_context_relevance, 0.35),
    ]

    available_relevance = [
        (score, weight)
        for score, weight in relevance_components
        if score is not None
    ]

    guidance_relevance = None

    if available_relevance:
        weight_total = sum(
            weight for _, weight in available_relevance
        )

        guidance_relevance = round(
            sum(
                score * weight
                for score, weight in available_relevance
            ) / weight_total,
            2
        )

    # --------------------------------------------------------
    # SELF-DEVELOPMENT SCORE
    # Measures the presence of actionable suggestions.
    # It does not measure actual user improvement.
    # --------------------------------------------------------

    development_terms = [
        "recommend", "practice", "improve", "develop",
        "goal", "habit", "learn", "reflect", "action",
        "growth", "communication", "confidence"
    ]

    development_text = guidance_text.lower()

    matched_terms = sum(
        1 for term in development_terms
        if term in development_text
    )

    self_development = round(
        min(100.0, matched_terms / 6.0 * 100.0),
        2
    )

    # --------------------------------------------------------
    # WEIGHTED OVERALL INSIGHT SCORE
    # --------------------------------------------------------

    weighted_inputs = {
        "palm_analysis_confidence": palm_confidence,
        "tarot_interpretation_relevance": tarot_relevance,
        "personality_alignment": personality_alignment,
        "user_context_relevance": user_context_relevance,
        "reading_consistency": reading_consistency,
    }

    weighted_components = {}
    weighted_total = 0.0
    available_weight = 0.0

    for component, weight in SCORING_WEIGHTS.items():
        score = weighted_inputs[component]

        if score is None:
            weighted_components[component] = {
                "score": None,
                "weight_percent": int(weight * 100),
                "weighted_contribution": None,
                "status": "unavailable"
            }
            continue

        contribution = round(score * weight, 2)

        weighted_total += contribution
        available_weight += weight

        weighted_components[component] = {
            "score": round(score, 2),
            "weight_percent": int(weight * 100),
            "weighted_contribution": contribution,
            "status": "available"
        }

    # Normalize only over available components.
    # This avoids penalizing missing context as if it scored zero.
    overall_score = None

    if available_weight > 0:
        overall_score = round(
            weighted_total / available_weight,
            2
        )

    return {
        "personality_alignment_score": personality_alignment,
        "reading_confidence_score": reading_confidence,
        "guidance_relevance_score": guidance_relevance,
        "self_development_score": self_development,
        "overall_insight_score": overall_score,
        "overall_score_status": (
            "complete"
            if available_weight == 1.0
            else "partial"
        ),
        "available_weight_percent": round(
            available_weight * 100, 2
        ),
        "weighted_components": weighted_components,
        "scoring_method": "weighted_model_with_text_overlap",
        "interpretation_note": (
            "These scores estimate reading confidence and textual "
            "relevance. They are not scientifically validated measures "
            "of personality or predictions of future events."
        )
    }


# ============================================================
# PALMISTRY HELPERS
# ============================================================

def extract_palm_shape_from_interpretation(interpretation):
    if not interpretation:
        return "Not available"

    match = re.search(
        r"analyzed palm has a\s+"
        r"(Long Palm|Wide Palm|Balanced Palm)",
        interpretation,
        re.IGNORECASE
    )

    return match.group(1) if match else "Not available"


def extract_line_confidences(interpretation):
    result = {
        "heart_line": None,
        "head_line": None,
        "life_line": None,
        "fate_line": None
    }

    if not interpretation:
        return result

    line_names = {
        "heart_line": "Heart",
        "head_line": "Head",
        "life_line": "Life",
        "fate_line": "Fate"
    }

    for key, line_name in line_names.items():
        pattern = (
            rf"{line_name}\s+Line\s+was\s+Detected"
            rf".*?confidence\s+of\s+"
            rf"([0-9]+(?:\.[0-9]+)?)%"
        )

        match = re.search(
            pattern,
            interpretation,
            re.IGNORECASE
        )

        if match:
            try:
                result[key] = float(match.group(1))
            except (TypeError, ValueError):
                result[key] = None

    return result


def get_latest_palm_data(db: Session, user_id: int):
    reading = (
        db.query(PalmReading)
        .filter(PalmReading.user_id == user_id)
        .order_by(PalmReading.id.desc())
        .first()
    )

    if not reading:
        return None

    interpretation = (
        reading.interpretation
        or "No Palmistry interpretation available."
    )

    confidences = extract_line_confidences(interpretation)

    features = {
        "palm_shape": extract_palm_shape_from_interpretation(
            interpretation
        ),
        "heart_line": reading.heart_line or "Not available",
        "head_line": reading.head_line or "Not available",
        "life_line": reading.life_line or "Not available",
        "fate_line": reading.fate_line or "Not available",
        "other_features": (getattr(reading,"other_features",None) or "Not available"),
        "heart_confidence": confidences["heart_line"],
        "head_confidence": confidences["head_line"],
        "life_confidence": confidences["life_line"],
        "fate_confidence": confidences["fate_line"],
        "detection_confidence": (
            reading.detection_confidence
            if reading.detection_confidence is not None
            else 0
        ),
        "analysis_confidence": (
            reading.analysis_confidence
            if reading.analysis_confidence is not None
            else 0
        )
    }

    return {
        "reading": reading,
        "features": features,
        "interpretation": interpretation,
        "personalized_guidance": (
            reading.personalized_guidance or ""
        )
    }


# ============================================================
# TAROT HELPERS
# ============================================================

def parse_selected_tarot_cards(selected_cards):
    if not selected_cards:
        return []

    if isinstance(selected_cards, list):
        return selected_cards

    if isinstance(selected_cards, str):
        try:
            parsed = json.loads(selected_cards)
            return parsed if isinstance(parsed, list) else []
        except (json.JSONDecodeError, TypeError):
            return []

    return []


def get_latest_tarot_data(db: Session, user_id: int):
    reading = (
        db.query(TarotReading)
        .filter(TarotReading.user_id == user_id)
        .order_by(TarotReading.id.desc())
        .first()
    )

    if not reading:
        return None

    return {
        "reading": reading,
        "reading_type": getattr(reading, "reading_type", None) or "single",
        "selected_cards": parse_selected_tarot_cards(
            getattr(reading, "selected_cards", None)
        ),
        "interpretation": reading.interpretation or "",
        "personalized_guidance": (
            reading.personalized_guidance or ""
        )
    }


def prepare_tarot_ai_data(tarot_data):
    if not tarot_data:
        return {"tarot_card": None, "tarot_meaning": None}

    card_names = []
    card_meanings = []

    for card in tarot_data.get("selected_cards", []):
        if not isinstance(card, dict):
            continue

        name = card.get("card_name")
        meaning = card.get("card_meaning") or card.get("meaning")
        position = card.get("position")

        if name:
            card_names.append(
                f"{position}: {name}" if position else str(name)
            )

        if meaning:
            card_meanings.append(
                f"{position}: {meaning}" if position else str(meaning)
            )

    return {
        "tarot_card": " | ".join(card_names) or None,
        "tarot_meaning": " | ".join(card_meanings) or None
    }


def format_tarot_cards(tarot_data):
    if not tarot_data:
        return []

    result = []

    for card in tarot_data.get("selected_cards", []):
        if not isinstance(card, dict):
            continue

        result.append({
            "card_name": card.get("card_name", "Unknown Card"),
            "meaning": (
                card.get("card_meaning")
                or card.get("meaning")
                or "No card meaning available."
            ),
            "position": card.get("position", "")
        })

    return result


# ============================================================
# THEME EXTRACTION
# ============================================================

def extract_palm_themes(palm_features):
    if not palm_features:
        return []

    themes = []

    checks = [
        (
            "heart_line",
            "emotional and relationship awareness"
        ),
        (
            "head_line",
            "thoughtful thinking and decision-making"
        ),
        (
            "life_line",
            "energy, resilience and personal development"
        ),
        (
            "fate_line",
            "direction, goals and life planning"
        )
    ]

    unavailable = [
        "not available", "not detected", "none", "no "
    ]

    for field, theme in checks:
        value = safe_text(palm_features.get(field))
        if value and not contains_any(value, unavailable):
            themes.append(theme)

    shape = safe_text(palm_features.get("palm_shape"))
    if shape and not contains_any(shape, ["not available", "unknown"]):
        themes.append(f"the {shape.lower()} palm shape")

    return list(dict.fromkeys(themes))


def extract_tarot_themes(tarot_data):
    themes = []

    for card in format_tarot_cards(tarot_data):
        text = (
            safe_text(card.get("card_name"))
            + " "
            + safe_text(card.get("meaning"))
        ).lower()

        keyword_groups = [
            (
                ["relationship", "love", "connection", "emotion",
                 "heart", "cups"],
                "emotional connection and relationships"
            ),
            (
                ["career", "work", "achievement", "success",
                 "ambition", "leadership"],
                "career, achievement and practical goals"
            ),
            (
                ["money", "financial", "wealth", "resources",
                 "security", "pentacles"],
                "financial awareness and practical stability"
            ),
            (
                ["growth", "learning", "wisdom", "healing",
                 "development", "spiritual"],
                "personal growth and self-awareness"
            ),
            (
                ["action", "energy", "initiative", "passion",
                 "creativity", "wands"],
                "initiative, creativity and action"
            ),
            (
                ["thinking", "decision", "logic", "truth",
                 "clarity", "swords"],
                "clarity, reasoning and decisions"
            )
        ]

        for keywords, theme in keyword_groups:
            if contains_any(text, keywords):
                themes.append(theme)

    return list(dict.fromkeys(themes))


def build_cross_reading_themes(palm_features, tarot_data):
    palm_themes = extract_palm_themes(palm_features)
    tarot_themes = extract_tarot_themes(tarot_data)

    cross = []

    palm_text = " ".join(palm_themes).lower()
    tarot_text = " ".join(tarot_themes).lower()

    if (
        any(word in palm_text for word in ["relationship", "emotional"])
        and any(word in tarot_text for word in ["relationship", "emotional"])
    ):
        cross.append(
            "Both readings emphasize emotional awareness "
            "and relationship connections."
        )

    if (
        any(word in palm_text for word in ["goals", "direction", "decision"])
        and any(word in tarot_text for word in ["career", "achievement", "action"])
    ):
        cross.append(
            "Both readings connect with goal-setting, "
            "decision-making and forward action."
        )

    if "financial awareness and practical stability" in tarot_themes:
        cross.append(
            "The Tarot themes highlight practical awareness "
            "and careful consideration of resources."
        )

    if (
        any(word in palm_text for word in ["development", "thinking", "resilience"])
        and any(word in tarot_text for word in ["personal growth", "clarity"])
    ):
        cross.append(
            "Both readings support self-awareness, learning "
            "and personal development."
        )

    if not cross:
        if palm_themes:
            cross.append(
                "Palmistry contributes line-based and feature-based reflection themes."
            )
        if tarot_themes:
            cross.append(
                "Tarot contributes symbolic themes from the selected cards."
            )

    return list(dict.fromkeys(cross))


# ============================================================
# SYNTHESIS AND COMBINED ANALYSIS
# ============================================================

def build_reading_synthesis(palm_data, tarot_data):
    palm_features = palm_data.get("features", {}) if palm_data else {}

    palm_themes = extract_palm_themes(palm_features)
    tarot_themes = extract_tarot_themes(tarot_data)
    cross_themes = build_cross_reading_themes(
        palm_features, tarot_data
    )

    if palm_data and tarot_data:
        palm_text = ", ".join(palm_themes[:3]) or "Palmistry themes"
        tarot_text = ", ".join(tarot_themes[:3]) or "Tarot themes"
        cross_text = " ".join(cross_themes) or (
            "The readings provide complementary reflection themes."
        )

        summary = (
            "The Reading Synthesis combines detected Palmistry "
            "features with symbolic themes from selected Tarot cards. "
            f"Palmistry contributes {palm_text}, while Tarot contributes "
            f"{tarot_text}. {cross_text} These themes support self-reflection."
        )
        basis = "Palmistry features + Tarot card themes"

    elif palm_data:
        summary = (
            "The Reading Synthesis is based on the latest Palmistry "
            "features and detected line themes for self-reflection."
        )
        basis = "Palmistry"

    elif tarot_data:
        summary = (
            "The Reading Synthesis is based on selected Tarot cards, "
            "their positions and symbolic themes for self-reflection."
        )
        basis = "Tarot"

    else:
        summary = "No reading synthesis is available."
        basis = "No data"

    return {
        "summary": summary,
        "cross_reading_themes": cross_themes,
        "palmistry_themes": palm_themes,
        "tarot_themes": tarot_themes,
        "basis": basis
    }


def build_combined_analysis(palm_data, tarot_data, reading_synthesis):
    palm_features = palm_data.get("features", {}) if palm_data else {}

    palm_summary = []

    shape = safe_text(palm_features.get("palm_shape"))
    if shape:
        palm_summary.append(f"Palm shape: {shape}")

    for label, field, confidence_field in [
        ("Life Line", "life_line", "life_confidence"),
        ("Heart Line", "heart_line", "heart_confidence"),
        ("Head Line", "head_line", "head_confidence"),
        ("Fate Line", "fate_line", "fate_confidence")
    ]:
        value = safe_text(palm_features.get(field))

        if value and not contains_any(
            value, ["not available", "not detected", "none"]
        ):
            confidence = palm_features.get(confidence_field)
            if confidence is not None:
                palm_summary.append(
                    f"{label} detected ({confidence:.1f}% confidence)"
                )
            else:
                palm_summary.append(f"{label} detected")

    tarot_summary = []

    for card in format_tarot_cards(tarot_data):
        name = safe_text(card.get("card_name"), "Unknown Card")
        position = safe_text(card.get("position"))
        tarot_summary.append(f"{position}: {name}" if position else name)

    return {
        "summary": reading_synthesis.get("summary", ""),
        "palmistry_basis": palm_summary or [
            "No Palmistry feature data available."
        ],
        "tarot_basis": tarot_summary or [
            "No Tarot card data available."
        ],
        "cross_reading_themes": (
            reading_synthesis.get("cross_reading_themes", [])
            or ["No overlapping themes identified."]
        ),
        "interpretation_note": (
            "This analysis connects Palmistry features and Tarot "
            "symbolism for reflection. It is not a scientifically "
            "validated prediction."
        )
    }


def ensure_combined_recommendation(recommendations, key, value):
    if not isinstance(recommendations, dict):
        recommendations = {}

    if not recommendations.get(key):
        recommendations[key] = value

    return recommendations


def build_combined_guidance(
    palm_data,
    tarot_data,
    combined_personality,
    combined_recommendations,
    combined_life_trends,
    combined_analysis
):
    both = bool(palm_data and tarot_data)

    if both:
        overall = (
            "The combined reading brings together Palmistry feature "
            "themes and Tarot symbolism to support self-awareness, "
            "relationship reflection, career planning and personal growth."
        )
        final = (
            "Reflect on the combined themes alongside practical information "
            "and your real-life circumstances before making important decisions."
        )
    elif palm_data:
        overall = (
            "This guidance uses the latest Palmistry reading as a reflection "
            "tool for self-awareness and personal development."
        )
        final = (
            "Use Palmistry themes as reflection points, not as fixed predictions."
        )
    elif tarot_data:
        overall = (
            "This guidance uses the latest Tarot reading as a reflection "
            "tool for self-awareness and personal development."
        )
        final = (
            "Use Tarot themes as reflection points, not as fixed predictions."
        )
    else:
        overall = "No reading data is available."
        final = "No guidance is available."

    personality_parts = []

    categories = [
        ("relationship", "Relationship"),
        ("career", "Career"),
        ("financial", "Financial"),
        ("personal_growth", "Personal Growth")
    ]

    for key, label in categories:
        value = combined_personality.get(key) if isinstance(
            combined_personality, dict
        ) else None

        if not value and isinstance(combined_personality, dict):
            nested = combined_personality.get("categories", {})
            if isinstance(nested, dict):
                value = nested.get(key)

        formatted = format_for_text(value)
        if formatted:
            personality_parts.append(f"{label}: {formatted}")

    personality_guidance = "\n\n".join(personality_parts) or (
        "Combined personality information is not available yet."
    )

    career = get_recommendation_category(
        combined_recommendations, "career", "careers"
    ) or "Focus on skills, practical opportunities and goals that match your interests."

    relationship = get_recommendation_category(
        combined_recommendations, "relationship", "relationships"
    ) or "Focus on communication, respect and mutual understanding."

    financial = get_recommendation_category(
        combined_recommendations, "financial", "finance", "finances"
    ) or "Consider resources, budgeting and practical financial planning."

    growth = get_recommendation_category(
        combined_recommendations,
        "personal_growth", "personal_development", "growth"
    ) or "Focus on continuous learning, self-awareness and personal development."

    general = get_recommendation_category(
        combined_recommendations, "general", "overall"
    ) or "Use the reading for reflection and consider real-life circumstances."

    trend_parts = []
    if isinstance(combined_life_trends, dict):
        for key in [
            "career_trend",
            "relationship_trend",
            "personal_growth_trend",
            "general_trend"
        ]:
            formatted = format_for_text(combined_life_trends.get(key))
            if formatted:
                trend_parts.append(formatted)

    life_trend_guidance = "\n\n".join(trend_parts) or (
        "No descriptive life trend information is available."
    )

    return {
        "overall_guidance": overall,
        "combined_analysis": combined_analysis,
        "personality_guidance": personality_guidance,
        "career_guidance": career,
        "relationship_guidance": relationship,
        "financial_guidance": financial,
        "personal_growth_guidance": growth,
        "general_guidance": general,
        "life_trend_guidance": life_trend_guidance,
        "final_guidance": final
    }


# ============================================================
# PALMISTRY ENDPOINT
# ============================================================

@router.post("/palmistry")
def generate_palmistry_guidance(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    try:
        palm_data = get_latest_palm_data(db, current_user.id)

        if not palm_data:
            raise HTTPException(
                status_code=404,
                detail="No Palmistry reading found. Please generate a Palmistry reading first."
            )

        features = palm_data["features"]

        personality = generate_personality(
            palm_features=features,
            tarot_card=None,
            tarot_meaning=None
        )

        recommendations = generate_recommendations(
    user_context={},
    palm_data=features,
    tarot_data=None,
    guidance_data={
        "personality": personality,
        "interpretation": palm_data.get("interpretation", ""),
        "personalized_guidance": palm_data.get(
            "personalized_guidance", ""
        )
    }
)

        life_trends = generate_life_trends(
            personality=personality,
            palm_features=features,
            tarot_card=None,
            tarot_meaning=None
        )

        guidance = palm_data["personalized_guidance"] or (
            "Focus on self-awareness, consistent growth, healthy "
            "relationships and thoughtful decision-making. Treat this "
            "reading as reflection rather than a fixed prediction."
        )

        analysis = {
            "palm_shape": features.get("palm_shape", "Not available"),
            "heart_line": features.get("heart_line", "Not available"),
            "head_line": features.get("head_line", "Not available"),
            "life_line": features.get("life_line", "Not available"),
            "fate_line": features.get("fate_line", "Not available"),
            "other_features": features.get("other_features", "Not available"),
            "line_confidences": {
                "heart_line": features.get("heart_confidence"),
                "head_line": features.get("head_confidence"),
                "life_line": features.get("life_confidence"),
                "fate_line": features.get("fate_confidence")
            },
            "detection_confidence": features.get("detection_confidence", 0),
            "analysis_confidence": features.get("analysis_confidence", 0)
        }

        return {
            "status": "success",
            "message": "Palmistry personalized guidance generated successfully.",
            "source": "palmistry",
            "reading_type": "palmistry",
            "palmistry": {
                "analysis": analysis,
                "interpretation": palm_data["interpretation"],
                "personality": personality,
                "recommendations": recommendations,
                "life_trends": life_trends,
                "guidance": guidance
            },
            "personality": personality,
            "recommendations": recommendations,
            "life_trends": life_trends,
            "personalized_guidance": guidance
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Palmistry guidance failed for user_id=%s",
            current_user.id
        )
        raise HTTPException(
            status_code=500,
            detail=f"Palmistry guidance failed: {type(exc).__name__}: {exc}"
        ) from exc


# ============================================================
# TAROT ENDPOINT
# ============================================================

@router.post("/tarot")
def generate_tarot_guidance(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    try:
        tarot_data = get_latest_tarot_data(db, current_user.id)

        if not tarot_data:
            raise HTTPException(
                status_code=404,
                detail="No Tarot reading found. Please generate a Tarot reading first."
            )

        tarot_ai_data = prepare_tarot_ai_data(tarot_data)
        tarot_card = tarot_ai_data["tarot_card"]
        tarot_meaning = tarot_ai_data["tarot_meaning"]

        interpretation = tarot_data["interpretation"]

        if not interpretation:
            interpretation = generate_ai_interpretation(
                palm_features=None,
                tarot_card=tarot_card,
                tarot_meaning=tarot_meaning,
                tarot_interpretation=None
            )

        personality = generate_personality(
            palm_features=None,
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning
        )

        recommendations = generate_recommendations(
    user_context={},
    palm_data=None,
    tarot_data={
        "selected_cards": tarot_data.get("selected_cards", []),
        "interpretation": interpretation,
        "reading_type": tarot_data.get("reading_type", "single")
    },
    guidance_data={
        "personality": personality,
        "tarot_card": tarot_card,
        "tarot_meaning": tarot_meaning
    }
)

        life_trends = generate_life_trends(
            personality=personality,
            palm_features=None,
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning
        )

        guidance = tarot_data["personalized_guidance"] or (
            "Use the Tarot reading as a reflection tool. Consider its "
            "themes alongside practical information and personal judgment."
        )

        return {
            "status": "success",
            "message": "Tarot personalized guidance generated successfully.",
            "source": "tarot_only",
            "reading_type": tarot_data.get("reading_type", "single"),
            "tarot": {
                "reading": {
                    "reading_type": tarot_data.get("reading_type", "single"),
                    "selected_cards": format_tarot_cards(tarot_data)
                },
                "interpretation": interpretation,
                "personality": personality,
                "recommendations": recommendations,
                "life_trends": life_trends,
                "guidance": guidance
            },
            "tarot_interpretation": interpretation,
            "tarot_insights": {
                "personality": personality,
                "recommendations": recommendations,
                "life_trends": life_trends,
                "personalized_guidance": guidance
            }
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Tarot guidance failed for user_id=%s",
            current_user.id
        )
        raise HTTPException(
            status_code=500,
            detail=f"Tarot guidance failed: {type(exc).__name__}: {exc}"
        ) from exc
def build_user_scoring_context(current_user, palm_data, tarot_data):
    """Collect available context for scoring."""
    context_parts = []

    fields = [
        "goals",
        "interests",
        "occupation",
        "career_goal",
        "personal_goals",
        "preferences",
        "bio",
    ]

    for field in fields:
        value = getattr(current_user, field, None)

        if value is not None:
            formatted = format_for_text(value)
            if formatted:
                context_parts.append(formatted)

    if tarot_data:
        tarot_reading = tarot_data.get("reading")
        question = getattr(tarot_reading, "question", None)

        if question:
            context_parts.append(str(question).strip())

    return " ".join(context_parts)


# ============================================================
# COMBINED PERSONALIZED GUIDANCE
# ============================================================

def _generate_guidance_data(db: Session, current_user: User):
    """Generate guidance using the latest available user readings."""

    palm_data = get_latest_palm_data(db, current_user.id)
    tarot_data = get_latest_tarot_data(db, current_user.id)

    if not palm_data and not tarot_data:
        raise HTTPException(
            status_code=404,
            detail=(
                "No Palmistry or Tarot reading found. "
                "Please generate a Palmistry or Tarot reading first."
            )
        )

    palm_features = palm_data["features"] if palm_data else None

    tarot_ai_data = prepare_tarot_ai_data(tarot_data)
    tarot_card = tarot_ai_data["tarot_card"]
    tarot_meaning = tarot_ai_data["tarot_meaning"]

    tarot_interpretation = ""
    if tarot_data:
        tarot_interpretation = tarot_data.get("interpretation", "")

        if not tarot_interpretation:
            tarot_interpretation = generate_ai_interpretation(
                palm_features=None,
                tarot_card=tarot_card,
                tarot_meaning=tarot_meaning,
                tarot_interpretation=None
            )

    if palm_data and tarot_data:
        source = "palmistry_and_tarot"
    elif palm_data:
        source = "palmistry_only"
    else:
        source = "tarot_only"

    combined_personality = generate_personality(
        palm_features=palm_features,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning
    )
    profile = (
    db.query(Profile)
    .filter(Profile.user_id == current_user.id)
    .first()
)

    combined_recommendations = generate_recommendations(
    user_context={
    "goals": getattr(profile, "goals", None),
    "interests": getattr(profile, "interests", None),
    "occupation": getattr(profile, "occupation", None),
    "career_goal": getattr(profile, "spiritual_goals", None),
    "preferences": getattr(profile, "reading_preferences", None),
    "bio": getattr(profile, "spiritual_interests", None),
},
    palm_data=palm_features,
    tarot_data=tarot_data,
    guidance_data={
        "personality": combined_personality,
        "tarot_card": tarot_card,
        "tarot_meaning": tarot_meaning,
        "personalized_guidance": ""
    }
)

    if not isinstance(combined_recommendations, dict):
        combined_recommendations = {}

    # Ensure recommendation categories are available for
    # Palmistry, Tarot, or combined readings.
    if palm_data or tarot_data:
        palm_themes = extract_palm_themes(palm_features)
        tarot_themes = extract_tarot_themes(tarot_data)

        # Build context from the readings that are available.
        if palm_data and tarot_data:
            reading_basis = (
                "Based on the available Palmistry and Tarot themes. "
                f"Palmistry: {', '.join(palm_themes) or 'general reflection'}. "
                f"Tarot: {', '.join(tarot_themes) or 'general reflection'}."
            )
        elif palm_data:
            reading_basis = (
                "Based on the available Palmistry reading. "
                f"Themes: {', '.join(palm_themes) or 'general reflection'}."
            )
        else:
            reading_basis = (
                "Based on the available Tarot reading. "
                f"Themes: {', '.join(tarot_themes) or 'general reflection'}."
            )

        # Provide a useful default only when a category is missing.
        recommendation_defaults = {
            "relationship": (
                f"{reading_basis} Reflect on communication, empathy, "
                "mutual respect, boundaries and healthy relationships."
            ),
            "career": (
                f"{reading_basis} Identify skills to improve, set clear "
                "career goals and explore realistic opportunities."
            ),
            "financial": (
                f"{reading_basis} Review your budget, manage resources "
                "carefully and make practical financial plans."
            ),
            "personal_growth": (
                f"{reading_basis} Practise self-awareness, build helpful "
                "habits, continue learning and review your progress."
            ),
            "general": (
                f"{reading_basis} Use the reading for reflection, "
                "consider real-life evidence and make your own decisions."
            ),
        }

        for category, default_text in recommendation_defaults.items():
            combined_recommendations = ensure_combined_recommendation(
                combined_recommendations,
                category,
                default_text
            )

    combined_life_trends = generate_life_trends(
        personality=combined_personality,
        palm_features=palm_features,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning
    )

    reading_synthesis = build_reading_synthesis(
        palm_data, tarot_data
    )

    combined_analysis = build_combined_analysis(
        palm_data, tarot_data, reading_synthesis
    )

    combined_guidance = build_combined_guidance(
        palm_data=palm_data,
        tarot_data=tarot_data,
        combined_personality=combined_personality,
        combined_recommendations=combined_recommendations,
        combined_life_trends=combined_life_trends,
        combined_analysis=combined_analysis
    )

    # Backward-compatible Palmistry response.
    palmistry_response = None

    if palm_data:
        palmistry_personality = generate_personality(
            palm_features=palm_features,
            tarot_card=None,
            tarot_meaning=None
        )

        palmistry_guidance = palm_data.get("personalized_guidance") or (
            "Use the Palmistry reading as a self-reflection tool."
        )

        palmistry_response = {
            "analysis": {
                "palm_shape": palm_features.get("palm_shape", "Not available"),
                "heart_line": palm_features.get("heart_line", "Not available"),
                "head_line": palm_features.get("head_line", "Not available"),
                "life_line": palm_features.get("life_line", "Not available"),
                "fate_line": palm_features.get("fate_line", "Not available"),
                "other_features": palm_features.get("other_features", "Not available"),
                "line_confidences": {
                    "heart_line": palm_features.get("heart_confidence"),
                    "head_line": palm_features.get("head_confidence"),
                    "life_line": palm_features.get("life_confidence"),
                    "fate_line": palm_features.get("fate_confidence")
                },
                "detection_confidence": palm_features.get(
                    "detection_confidence", 0
                ),
                "analysis_confidence": palm_features.get(
                    "analysis_confidence", 0
                )
            },
            "interpretation": palm_data["interpretation"],
            "personality": palmistry_personality,
            "guidance": palmistry_guidance
        }

    # Backward-compatible Tarot response.
    tarot_response = None

    if tarot_data:
        tarot_personality = generate_personality(
            palm_features=None,
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning
        )

        tarot_guidance = tarot_data.get("personalized_guidance") or (
            "Use the Tarot reading as a structured reflection tool."
        )

        tarot_response = {
            "reading": {
                "reading_type": tarot_data.get("reading_type", "single"),
                "selected_cards": format_tarot_cards(tarot_data)
            },
            "interpretation": tarot_interpretation,
            "personality": tarot_personality,
            "guidance": tarot_guidance
        }

    combined_response = {
        "reading_synthesis": reading_synthesis,
        "combined_analysis": combined_analysis,
        "personality": combined_personality,
        "personalized_guidance": combined_guidance,
        "recommendations": combined_recommendations,
        "life_trends": combined_life_trends
    }

    response = {
        "status": "success",
        "message": (
            "Personalized guidance generated successfully using "
            "the latest available Palmistry and Tarot readings."
        ),
        "source": source,
        "palmistry": palmistry_response,
        "tarot": tarot_response,
        "combined": combined_response,
        "reading_synthesis": reading_synthesis,
        "combined_analysis": combined_analysis,
        "combined_personality": combined_personality,
        "personalized_guidance": combined_guidance,
        "recommendations": combined_recommendations,
        "life_trends": combined_life_trends
    }

    user_context = build_user_scoring_context(
        current_user=current_user,
        palm_data=palm_data,
        tarot_data=tarot_data
    )

    response["spiritual_guidance_scoring"] = (
        calculate_spiritual_guidance_scores(
            response,
            user_context=user_context
        )
    )

    return response


@router.post("/generate")
def generate_personalized_guidance(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    try:
        return _generate_guidance_data(
            db=db,
            current_user=current_user
        )

    except HTTPException:
        # Preserve intentional 404 responses instead of turning them into 500.
        raise

    except Exception as exc:
        logger.error(
            "Personalized guidance failed for user_id=%s",
            current_user.id,
            exc_info=True
        )

        # The detailed traceback is in the backend terminal.
        # Keep the response message useful for debugging.
        raise HTTPException(
            status_code=500,
            detail=(
                "Personalized guidance failed: "
                f"{type(exc).__name__}: {exc}"
            )
        ) from exc


# ============================================================
# DEBUG ENDPOINT
# ============================================================

@router.get("/debug-test")
def debug_test():
    return {"status": "debug route working"}