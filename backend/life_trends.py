"""
Life Trends Analysis
AI-Powered Palmistry and Tarot Intelligence Platform

This module provides:
1. Life Path Analysis
2. Opportunity Identification
3. Challenge Forecasting
4. Trend Monitoring
5. Growth Potential Assessment

Supported modes:
- Palmistry only
- Tarot only
- Combined Palmistry + Tarot
- No data available

Note:
The output provides general reflection and planning guidance.
It does not predict or guarantee future events.
"""

from datetime import datetime


# ============================================================
# CONFIGURATION
# ============================================================

TREND_LEVELS = [
    "Low",
    "Moderate",
    "Current",
    "High",
    "Very High",
]

MIN_SCORE = 0
MAX_SCORE = 100


# ============================================================
# BASIC HELPER FUNCTIONS
# ============================================================

def _clamp_score(score):
    """Keep a score between 0 and 100."""
    try:
        score = float(score)
    except (TypeError, ValueError):
        score = 50

    return max(MIN_SCORE, min(MAX_SCORE, round(score)))


def _get_level(score):
    """Convert a numeric score into a readable level."""
    score = _clamp_score(score)

    if score < 20:
        return "Low"
    elif score < 40:
        return "Moderate"
    elif score < 60:
        return "Current"
    elif score < 80:
        return "High"
    return "Very High"


def _create_default_scores():
    """Return default scores for the three trend categories."""
    return {
        "career": 50,
        "relationship": 50,
        "personal_growth": 50,
    }


def _create_graph_points(scores):
    """
    Create graph points for the frontend.

    These are illustrative trend points based on the available
    reading information. They are not historical measurements.
    """
    career = _clamp_score(scores.get("career", 50))
    relationship = _clamp_score(scores.get("relationship", 50))
    growth = _clamp_score(scores.get("personal_growth", 50))

    return {
        "labels": [
            "Starting Point",
            "Reflection",
            "Current Assessment",
        ],
        "career": [
            _clamp_score(career - 10),
            _clamp_score(career - 5),
            career,
        ],
        "relationship": [
            _clamp_score(relationship - 8),
            _clamp_score(relationship - 3),
            relationship,
        ],
        "personal_growth": [
            _clamp_score(growth - 10),
            _clamp_score(growth - 4),
            growth,
        ],
    }


def _normalise_text(value):
    """Convert common input values to text safely."""
    if value is None:
        return ""

    if isinstance(value, str):
        return value

    if isinstance(value, dict):
        return " ".join(
            str(item)
            for item in value.values()
            if item is not None
        )

    if isinstance(value, (list, tuple, set)):
        return " ".join(str(item) for item in value)

    return str(value)


def _get_traits(personality):
    """Extract readable personality traits from common data formats."""
    if personality is None:
        return []

    if isinstance(personality, dict):
        possible_keys = [
            "traits",
            "personality_traits",
            "strengths",
            "dominant_traits",
            "personality",
            "summary",
        ]

        traits = []

        for key in possible_keys:
            value = personality.get(key)

            if isinstance(value, list):
                traits.extend(str(item) for item in value)
            elif isinstance(value, str) and value.strip():
                traits.append(value.strip())

        if not traits:
            for key, value in personality.items():
                if value is not None and isinstance(
                    value, (str, int, float)
                ):
                    traits.append(f"{key}: {value}")

        return list(dict.fromkeys(traits))[:10]

    if isinstance(personality, (list, tuple, set)):
        return [str(item) for item in personality][:10]

    if isinstance(personality, str) and personality.strip():
        return [personality.strip()]

    return []


def _contains_any(text, keywords):
    """Check whether text contains any keyword."""
    text = text.lower()
    return any(keyword in text for keyword in keywords)


def _build_visualization_note():
    """Explain how the trend graph should be interpreted."""
    return (
        "The chart displays illustrative scores generated from the "
        "available reading information. It does not represent verified "
        "historical data or guarantee future outcomes."
    )


def _build_trend_text(category, score, mode):
    """Create a readable trend summary."""
    level = _get_level(score)

    descriptions = {
        "career": (
            f"Your career reflection score is {score}/100 ({level}). "
            "Consider your skills, learning goals, and career interests "
            "when planning your next steps."
        ),
        "relationship": (
            f"Your relationship reflection score is {score}/100 "
            f"({level}). Focus on communication, mutual respect, and "
            "healthy boundaries in your relationships."
        ),
        "personal_growth": (
            f"Your personal growth reflection score is {score}/100 "
            f"({level}). Consider building consistent habits, confidence, "
            "self-awareness, and problem-solving skills."
        ),
    }

    text = descriptions.get(
        category,
        "Reflect on your current goals and priorities."
    )

    if mode == "none":
        return (
            "No reading data is available yet. Complete a Palmistry "
            "or Tarot reading to receive a personalised reflection."
        )

    return text


# ============================================================
# SCORE GENERATION
# ============================================================

def _calculate_scores(personality=None, palm_features=None,
                      tarot_card=None, tarot_meaning=None):
    """
    Generate illustrative reflection scores.

    Scores are based on text signals in the available input.
    They are not scientifically validated measurements or predictions.
    """
    scores = _create_default_scores()

    personality_text = _normalise_text(personality)
    palm_text = _normalise_text(palm_features)
    tarot_text = (
        _normalise_text(tarot_card)
        + " "
        + _normalise_text(tarot_meaning)
    )

    all_text = (
        personality_text + " " + palm_text + " " + tarot_text
    ).lower()

    # Career-related signals
    career_positive = [
        "career", "success", "ambition", "leadership",
        "opportunity", "confidence", "achievement",
        "discipline", "creativity", "determination",
    ]

    career_challenges = [
        "uncertainty", "delay", "confusion", "fear",
        "stress", "obstacle", "difficulty",
    ]

    career_score = 50
    career_score += sum(
        5 for word in career_positive if word in all_text
    )
    career_score -= sum(
        4 for word in career_challenges if word in all_text
    )
    scores["career"] = _clamp_score(career_score)

    # Relationship-related signals
    relationship_positive = [
        "love", "relationship", "harmony", "trust",
        "communication", "compassion", "friendship",
        "connection", "support", "understanding",
    ]

    relationship_challenges = [
        "conflict", "distance", "misunderstanding",
        "loneliness", "fear", "tension",
    ]

    relationship_score = 50
    relationship_score += sum(
        5 for word in relationship_positive if word in all_text
    )
    relationship_score -= sum(
        4 for word in relationship_challenges if word in all_text
    )
    scores["relationship"] = _clamp_score(relationship_score)

    # Personal-growth signals
    growth_positive = [
        "growth", "learning", "resilience", "wisdom",
        "adaptability", "self-awareness", "strength",
        "development", "patience", "motivation",
        "transformation", "balance",
    ]

    growth_challenges = [
        "self-doubt", "procrastination", "overthinking",
        "fear", "stress", "uncertainty",
    ]

    growth_score = 50
    growth_score += sum(
        5 for word in growth_positive if word in all_text
    )
    growth_score -= sum(
        4 for word in growth_challenges if word in all_text
    )
    scores["personal_growth"] = _clamp_score(growth_score)

    # If no useful text was supplied, use neutral default scores.
    has_input = bool(
        personality_text.strip()
        or palm_text.strip()
        or tarot_text.strip()
    )

    if not has_input:
        return _create_default_scores()

    return scores


# ============================================================
# PALMISTRY-ONLY LIFE TRENDS
# ============================================================

def _generate_palmistry_life_trends(
    personality=None,
    palm_features=None,
):
    """Generate trend information from Palmistry-related input."""
    scores = _calculate_scores(
        personality=personality,
        palm_features=palm_features,
    )

    return {
        "mode": "palmistry",
        "generated_at": datetime.now().isoformat(timespec="seconds"),

        "career_trend": _build_trend_text(
            "career", scores["career"], "palmistry"
        ),
        "relationship_trend": _build_trend_text(
            "relationship", scores["relationship"], "palmistry"
        ),
        "personal_growth_trend": _build_trend_text(
            "personal_growth",
            scores["personal_growth"],
            "palmistry",
        ),
        "general_trend": (
            "This Palmistry-based reflection summarises themes from "
            "the available input. Use it for personal reflection and "
            "goal planning rather than as a prediction."
        ),

        "trend_levels": {
            "career": _get_level(scores["career"]),
            "relationship": _get_level(scores["relationship"]),
            "personal_growth": _get_level(
                scores["personal_growth"]
            ),
        },

        "career_current_score": scores["career"],
        "relationship_current_score": scores["relationship"],
        "personal_growth_current_score": scores["personal_growth"],

        "career_scores": [
            point for point in _create_graph_points(scores)["career"]
        ],
        "relationship_scores": [
            point for point in _create_graph_points(scores)["relationship"]
        ],
        "personal_growth_scores": [
            point for point in _create_graph_points(scores)[
                "personal_growth"
            ]
        ],

        "graph_data": _create_graph_points(scores),
        "visualization_note": _build_visualization_note(),
    }


# ============================================================
# TAROT-ONLY LIFE TRENDS
# ============================================================

def _generate_tarot_life_trends(
    personality=None,
    tarot_card=None,
    tarot_meaning=None,
):
    """Generate trend information from Tarot-related input."""
    scores = _calculate_scores(
        personality=personality,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning,
    )

    return {
        "mode": "tarot",
        "generated_at": datetime.now().isoformat(timespec="seconds"),

        "career_trend": _build_trend_text(
            "career", scores["career"], "tarot"
        ),
        "relationship_trend": _build_trend_text(
            "relationship", scores["relationship"], "tarot"
        ),
        "personal_growth_trend": _build_trend_text(
            "personal_growth",
            scores["personal_growth"],
            "tarot",
        ),
        "general_trend": (
            "This Tarot-based reflection uses the supplied card "
            "information and interpretation as prompts for thinking "
            "about goals, choices, and personal development."
        ),

        "trend_levels": {
            "career": _get_level(scores["career"]),
            "relationship": _get_level(scores["relationship"]),
            "personal_growth": _get_level(
                scores["personal_growth"]
            ),
        },

        "career_current_score": scores["career"],
        "relationship_current_score": scores["relationship"],
        "personal_growth_current_score": scores["personal_growth"],

        "career_scores": _create_graph_points(scores)["career"],
        "relationship_scores": _create_graph_points(scores)[
            "relationship"
        ],
        "personal_growth_scores": _create_graph_points(scores)[
            "personal_growth"
        ],

        "graph_data": _create_graph_points(scores),
        "visualization_note": _build_visualization_note(),
    }


# ============================================================
# COMBINED PALMISTRY + TAROT LIFE TRENDS
# ============================================================

def _generate_combined_life_trends(
    personality=None,
    palm_features=None,
    tarot_card=None,
    tarot_meaning=None,
):
    """Generate trend information from Palmistry and Tarot inputs."""
    scores = _calculate_scores(
        personality=personality,
        palm_features=palm_features,
        tarot_card=tarot_card,
        tarot_meaning=tarot_meaning,
    )

    return {
        "mode": "combined",
        "generated_at": datetime.now().isoformat(timespec="seconds"),

        "career_trend": _build_trend_text(
            "career", scores["career"], "combined"
        ),
        "relationship_trend": _build_trend_text(
            "relationship", scores["relationship"], "combined"
        ),
        "personal_growth_trend": _build_trend_text(
            "personal_growth",
            scores["personal_growth"],
            "combined",
        ),
        "general_trend": (
            "This combined reflection brings together the supplied "
            "Palmistry features, Tarot information, and personality "
            "details. Use it to consider goals and practical next steps."
        ),

        "trend_levels": {
            "career": _get_level(scores["career"]),
            "relationship": _get_level(scores["relationship"]),
            "personal_growth": _get_level(
                scores["personal_growth"]
            ),
        },

        "career_current_score": scores["career"],
        "relationship_current_score": scores["relationship"],
        "personal_growth_current_score": scores["personal_growth"],

        "career_scores": _create_graph_points(scores)["career"],
        "relationship_scores": _create_graph_points(scores)[
            "relationship"
        ],
        "personal_growth_scores": _create_graph_points(scores)[
            "personal_growth"
        ],

        "graph_data": _create_graph_points(scores),
        "visualization_note": _build_visualization_note(),
    }


# ============================================================
# FIVE REQUIRED LIFE TREND ANALYSIS SECTIONS
# ============================================================

def _build_life_trend_sections(result, personality=None):
    """Add the five required analysis sections to a trend result."""
    mode = result.get("mode", "none")

    career = result.get("career_trend", "")
    relationship = result.get("relationship_trend", "")
    growth = result.get("personal_growth_trend", "")

    career_score = result.get("career_current_score")
    relationship_score = result.get("relationship_current_score")
    growth_score = result.get("personal_growth_current_score")

    has_data = mode in ("palmistry", "tarot", "combined")

    traits = _get_traits(personality)

    # --------------------------------------------------------
    # 1. LIFE PATH ANALYSIS
    # --------------------------------------------------------

    if has_data:
        life_path_overview = (
            "Review your current priorities, personal values, "
            "skills, and relationships. Use the reading as a "
            "reflection tool when choosing practical next steps."
        )
    else:
        life_path_overview = (
            "Life path analysis is waiting for reading data. "
            "Complete a Palmistry or Tarot reading first."
        )

    result["life_path_analysis"] = {
        "title": "Life Path Analysis",
        "mode": mode,
        "overview": life_path_overview,
        "career_direction": career,
        "relationship_direction": relationship,
        "personal_growth_direction": growth,
        "personality_traits": traits,
        "recommendations": [
            "Identify your short-term and long-term goals.",
            "Review your skills and areas for improvement.",
            "Choose small, achievable actions for the coming weeks.",
            "Review your progress regularly and adjust your goals.",
        ] if has_data else [],
        "note": (
            "This is reflective guidance, not a guaranteed description "
            "of your future."
        ),
    }

    # --------------------------------------------------------
    # 2. OPPORTUNITY IDENTIFICATION
    # --------------------------------------------------------

    opportunities = []

    if has_data:
        opportunities = [
            {
                "area": "Career and Learning",
                "description": (
                    "Explore courses, practical projects, internships, "
                    "and skills that match your interests."
                ),
                "related_trend": career,
                "score": career_score,
            },
            {
                "area": "Relationships",
                "description": (
                    "Build communication, mutual understanding, "
                    "respect, and supportive connections."
                ),
                "related_trend": relationship,
                "score": relationship_score,
            },
            {
                "area": "Personal Development",
                "description": (
                    "Strengthen self-awareness, confidence, consistency, "
                    "and problem-solving through regular practice."
                ),
                "related_trend": growth,
                "score": growth_score,
            },
        ]

    result["opportunity_identification"] = {
        "title": "Opportunity Identification",
        "opportunities": opportunities,
        "total_opportunities": len(opportunities),
        "note": (
            "These are practical areas to explore, not predictions "
            "that an opportunity will definitely occur."
        ),
    }

    # --------------------------------------------------------
    # 3. CHALLENGE FORECASTING
    # --------------------------------------------------------

    challenges = []

    if has_data:
        challenges = [
            {
                "area": "Career and Learning",
                "possible_challenge": (
                    "Unclear goals, skill gaps, or difficulty maintaining "
                    "a consistent learning routine."
                ),
                "preparation": (
                    "Set weekly goals, practise regularly, and ask "
                    "for feedback when you need help."
                ),
            },
            {
                "area": "Relationships",
                "possible_challenge": (
                    "Miscommunication, unmet expectations, or difficulty "
                    "maintaining healthy boundaries."
                ),
                "preparation": (
                    "Listen carefully, communicate clearly, and respect "
                    "your own boundaries and those of others."
                ),
            },
            {
                "area": "Personal Development",
                "possible_challenge": (
                    "Self-doubt, overthinking, or difficulty maintaining "
                    "new habits."
                ),
                "preparation": (
                    "Break goals into smaller tasks and track your "
                    "progress without expecting instant results."
                ),
            },
        ]

    result["challenge_forecasting"] = {
        "title": "Challenge Forecasting",
        "challenges": challenges,
        "total_challenges": len(challenges),
        "note": (
            "These are common areas to prepare for. They are not "
            "predictions of events or evidence that a problem will occur."
        ),
    }

    # --------------------------------------------------------
    # 4. TREND MONITORING
    # --------------------------------------------------------

    graph_data = result.get("graph_data", {})

    result["trend_monitoring"] = {
        "title": "Trend Monitoring",
        "current_scores": {
            "career": career_score,
            "relationship": relationship_score,
            "personal_growth": growth_score,
        },
        "trend_levels": result.get("trend_levels", {}),
        "graph_data": graph_data,
        "career_scores": result.get("career_scores", []),
        "relationship_scores": result.get(
            "relationship_scores", []
        ),
        "personal_growth_scores": result.get(
            "personal_growth_scores", []
        ),
        "historical_comparison_available": False,
        "last_updated": result.get("generated_at"),
        "message": (
            "The displayed points are illustrative scores for the "
            "current assessment. A genuine historical comparison requires "
            "saving dated readings and comparing results from different "
            "dates."
        ),
        "visualization_note": result.get(
            "visualization_note",
            _build_visualization_note(),
        ),
    }

    # --------------------------------------------------------
    # 5. GROWTH POTENTIAL ASSESSMENT
    # --------------------------------------------------------

    growth_areas = []

    if has_data:
        growth_areas = [
            {
                "area": "Career Skills",
                "suggestion": (
                    "Practise relevant technical and communication "
                    "skills and build projects to demonstrate progress."
                ),
            },
            {
                "area": "Emotional Awareness",
                "suggestion": (
                    "Reflect on your reactions, listen to other "
                    "perspectives, and practise calm communication."
                ),
            },
            {
                "area": "Personal Habits",
                "suggestion": (
                    "Create a manageable routine for learning, rest, "
                    "reflection, and goal review."
                ),
            },
            {
                "area": "Confidence and Adaptability",
                "suggestion": (
                    "Try manageable new challenges and learn from "
                    "feedback and mistakes."
                ),
            },
        ]

    result["growth_potential_assessment"] = {
        "title": "Growth Potential Assessment",
        "personal_growth_score": growth_score,
        "growth_level": (
            _get_level(growth_score)
            if growth_score is not None
            else None
        ),
        "personality_traits": traits,
        "growth_areas": growth_areas,
        "total_growth_areas": len(growth_areas),
        "recommendations": [
            "Choose one skill to improve this week.",
            "Set a clear and realistic goal.",
            "Record your progress and challenges.",
            "Review your plan and celebrate small improvements.",
        ] if has_data else [],
        "note": (
            "The score is an illustrative reflection score, not a "
            "scientifically validated measurement of your potential."
        ),
    }

    return result


# ============================================================
# MAIN PUBLIC FUNCTION
# ============================================================

def generate_life_trends(
    personality=None,
    palm_features=None,
    tarot_card=None,
    tarot_meaning=None,
):
    """
    Generate life trends from Palmistry, Tarot, or both.

    Parameters
    ----------
    personality:
        Optional personality information. Can be text, a list, or a dict.

    palm_features:
        Optional Palmistry features. Can be text, a list, or a dict.

    tarot_card:
        Optional Tarot card name or card information.

    tarot_meaning:
        Optional Tarot card interpretation or meaning.

    Returns
    -------
    dict:
        Trend summaries, scores, graph data, and the five analysis
        sections required by the application.
    """

    palm_available = palm_features is not None and bool(
        _normalise_text(palm_features).strip()
    )

    tarot_available = (
        tarot_card is not None
        and bool(_normalise_text(tarot_card).strip())
    ) or (
        tarot_meaning is not None
        and bool(_normalise_text(tarot_meaning).strip())
    )

    # PALMISTRY ONLY
    if palm_available and not tarot_available:
        result = _generate_palmistry_life_trends(
            personality=personality,
            palm_features=palm_features,
        )
        return _build_life_trend_sections(result, personality)

    # TAROT ONLY
    if tarot_available and not palm_available:
        result = _generate_tarot_life_trends(
            personality=personality,
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning,
        )
        return _build_life_trend_sections(result, personality)

    # COMBINED PALMISTRY + TAROT
    if palm_available and tarot_available:
        result = _generate_combined_life_trends(
            personality=personality,
            palm_features=palm_features,
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning,
        )
        return _build_life_trend_sections(result, personality)

    # NO READING DATA
    result = {
        "mode": "none",
        "generated_at": datetime.now().isoformat(timespec="seconds"),

        "career_trend": _build_trend_text("career", 50, "none"),
        "relationship_trend": _build_trend_text(
            "relationship", 50, "none"
        ),
        "personal_growth_trend": _build_trend_text(
            "personal_growth", 50, "none"
        ),
        "general_trend": (
            "No Palmistry or Tarot reading information was supplied."
        ),

        "trend_levels": {
            "career": None,
            "relationship": None,
            "personal_growth": None,
        },

        "career_current_score": None,
        "relationship_current_score": None,
        "personal_growth_current_score": None,

        "career_scores": [],
        "relationship_scores": [],
        "personal_growth_scores": [],

        "graph_data": {
            "labels": [],
            "career": [],
            "relationship": [],
            "personal_growth": [],
        },

        "visualization_note": (
            "No reading data is available. Complete a reading before "
            "interpreting the trend sections."
        ),
    }

    return _build_life_trend_sections(result, personality)


# ============================================================
# DIRECT TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 65)
    print("LIFE TRENDS MODULE - TEST")
    print("=" * 65)

    # Test 1: Palmistry
    palm_result = generate_life_trends(
        personality={
            "traits": [
                "determination",
                "adaptability",
                "creativity",
            ]
        },
        palm_features={
            "life_line": "clear",
            "head_line": "long",
            "heart_line": "curved",
            "fate_line": "present",
        },
    )

    print("\n1. PALMISTRY MODE")
    print("Mode:", palm_result["mode"])
    print("Career:", palm_result["career_trend"])
    print(
        "Life Path:",
        palm_result["life_path_analysis"]["overview"],
    )
    print(
        "Opportunities:",
        palm_result["opportunity_identification"][
            "total_opportunities"
        ],
    )
    print(
        "Challenges:",
        palm_result["challenge_forecasting"]["total_challenges"],
    )
    print(
        "Trend Monitoring:",
        palm_result["trend_monitoring"]["current_scores"],
    )
    print(
        "Growth Areas:",
        palm_result["growth_potential_assessment"][
            "total_growth_areas"
        ],
    )

    # Test 2: Tarot
    tarot_result = generate_life_trends(
        personality={
            "traits": ["patience", "self-awareness"]
        },
        tarot_card="The Star",
        tarot_meaning=(
            "hope, inspiration, renewal, confidence, and personal growth"
        ),
    )

    print("\n2. TAROT MODE")
    print("Mode:", tarot_result["mode"])
    print(
        "Career Score:",
        tarot_result["career_current_score"],
    )
    print(
        "Relationship Score:",
        tarot_result["relationship_current_score"],
    )
    print(
        "Growth Score:",
        tarot_result["personal_growth_current_score"],
    )

    # Test 3: Combined Palmistry + Tarot
    combined_result = generate_life_trends(
        personality={
            "traits": ["determination", "adaptability"]
        },
        palm_features={
            "life_line": "clear",
            "head_line": "long",
        },
        tarot_card="The Magician",
        tarot_meaning=(
            "initiative, creativity, skills, and taking action"
        ),
    )

    print("\n3. COMBINED MODE")
    print("Mode:", combined_result["mode"])
    print(
        "Life Path Section:",
        "life_path_analysis" in combined_result,
    )
    print(
        "Opportunity Section:",
        "opportunity_identification" in combined_result,
    )
    print(
        "Challenge Section:",
        "challenge_forecasting" in combined_result,
    )
    print(
        "Monitoring Section:",
        "trend_monitoring" in combined_result,
    )
    print(
        "Growth Section:",
        "growth_potential_assessment" in combined_result,
    )

    # Test 4: No data
    empty_result = generate_life_trends()

    print("\n4. NO-DATA MODE")
    print("Mode:", empty_result["mode"])
    print(
        "Life Path Section:",
        "life_path_analysis" in empty_result,
    )
    print(
        "Opportunity Section:",
        "opportunity_identification" in empty_result,
    )

    print("\n" + "=" * 65)
    print("TEST COMPLETED")
    print("=" * 65)