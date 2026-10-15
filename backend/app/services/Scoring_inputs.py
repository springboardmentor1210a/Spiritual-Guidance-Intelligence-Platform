"""
Spiritual Guidance Scoring Engine (spec module 8) - REAL inputs.

The old /guidance/score endpoint passed hardcoded numbers (0.89, 0.86, ...)
into the weighted formula, so every user saw nearly the same score. This
module derives each of the five inputs from the user's actual data and keeps
the spec's weights:

    Insight Score = 30% palm confidence + 25% tarot relevance
                  + 20% personality alignment + 15% user context
                  + 10% reading consistency

Honest limits: "confidence" here means measurement quality and internal
agreement between sources - it is NOT a claim that a reading is true.
Missing data falls back to a neutral 0.5 and is reported in `missing`.
"""
from __future__ import annotations
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from .knowledge import categories_from_text, clamp, TRAITS
from .trend_service import theme_distribution
from .personality_service import palm_trait_vector

WEIGHTS = {
    "palm_confidence": 0.30,
    "tarot_relevance": 0.25,
    "personality_alignment": 0.20,
    "user_context": 0.15,
    "reading_consistency": 0.10,
}
NEUTRAL = 0.5

# Labels/shape expected by the existing React Overview tab (overall_score,
# resonance_tier, advice, breakdown[{factor, weight, contribution, score}]).
LABELS = {
    "palm_confidence": "Palm Confidence",
    "tarot_relevance": "Tarot Relevance",
    "personality_alignment": "Personality Match",
    "user_context": "User Context",
    "reading_consistency": "Reading Consistency",
}
_MISSING_HINT = {
    "palm_confidence": "a palm scan",
    "tarot_relevance": "a tarot spread",
    "personality_alignment": "both a palm scan and a tarot spread",
    "reading_consistency": "a few more readings",
}


def resonance_tier(score: float) -> str:
    return ("High Alignment" if score >= 80 else "Steady Alignment" if score >= 65
            else "Developing Alignment" if score >= 45 else "Early Insight")


def _palm_readings(readings):
    return sorted((r for r in readings if r.get("reading_type") == "palmistry"
                   and isinstance(r.get("details"), dict) and r["details"].get("detected")),
                  key=lambda r: r["created_at"])


def palm_confidence(readings: List[dict]) -> Optional[float]:
    palm = _palm_readings(readings)
    if not palm:
        return None
    d = palm[-1]["details"]
    det = float(d.get("confidence", 0.8))
    density = (float(d.get("line_density_score", 75)) - 55) / 44   # scores are clamped 55..99
    return round(clamp(0.7 * det + 0.3 * clamp(density)), 3)


def profile_categories(profile: Optional[dict]) -> Dict[str, float]:
    p = profile or {}
    text = " ".join(str(p.get(k) or "") for k in ("interests", "spiritual_goals", "reading_preferences"))
    return categories_from_text(text)


def tarot_relevance(readings: List[dict], profile: Optional[dict]) -> Optional[float]:
    tarot = sorted((r for r in readings if r.get("reading_type") == "tarot" and isinstance(r.get("details"), list)),
                   key=lambda r: r["created_at"], reverse=True)[:5]
    if not tarot:
        return None
    interests = profile_categories(profile)
    if not interests:
        return NEUTRAL
    cards = [c for r in tarot for c in r["details"]]
    return _relevance_from_cards(cards, interests)


def _relevance_from_cards(cards: List[dict], interests: Dict[str, float]) -> float:
    dist = theme_distribution(cards)
    # Share of the drawn cards' theme mass that lands on the user's interest
    # areas, compared with what pure chance would give (n_interest / 7 areas).
    # Chance-level overlap -> 0.5; everything on-topic -> 1.0; nothing -> low.
    mass = sum(dist.get(cat, 0.0) for cat in interests)
    chance = len(interests) / len(dist)
    if chance >= 1:
        return NEUTRAL
    return round(clamp(0.5 + 0.5 * (mass - chance) / (1 - chance), 0.1, 1.0), 3)


def spread_relevance_score(cards: List[dict], profile: Optional[dict]) -> float:
    """0-100 relevance of ONE spread to the user's stated interests.
    Replaces the hardcoded `score=88.5` saved by /tarot/draw."""
    interests = profile_categories(profile)
    if not interests or not cards:
        return 50.0
    return round(100 * _relevance_from_cards(cards, interests), 1)


def context_relevance(readings: List[dict], profile: Optional[dict], now: datetime) -> float:
    p = profile or {}
    fields = ["name", "age_group", "interests", "spiritual_goals", "reading_preferences"]
    completeness = sum(1 for f in fields if p.get(f)) / len(fields)
    if readings:
        newest = max(r["created_at"] for r in readings)
        age = now - newest
        recency = 1.0 if age <= timedelta(days=30) else 0.5 if age <= timedelta(days=90) else 0.1
    else:
        recency = 0.0
    breadth = len({r["reading_type"] for r in readings}) / 3
    return round(clamp(0.4 * completeness + 0.3 * recency + 0.3 * breadth), 3)


def reading_consistency(readings: List[dict]) -> Optional[float]:
    """Repeat palm scans of one hand should agree; else use score stability."""
    palm = _palm_readings(readings)
    if len(palm) >= 2:
        a, b = palm_trait_vector(palm[-1]["details"]), palm_trait_vector(palm[-2]["details"])
        keys = [t for t in TRAITS if t in a and t in b]
        if keys:
            mad = sum(abs(a[k] - b[k]) for k in keys) / len(keys)   # 0..100
            return round(clamp(1 - mad / 40), 3)
    scores = [float(r["score"]) for r in readings if r.get("score") is not None]
    if len(scores) >= 3:
        mean = sum(scores) / len(scores)
        std = (sum((s - mean) ** 2 for s in scores) / len(scores)) ** 0.5
        return round(clamp(1 - std / 40), 3)
    return None


def compute_score_inputs(readings: List[dict], profile: Optional[dict],
                         personality: dict, now: Optional[datetime] = None) -> dict:
    now = now or datetime.utcnow()
    raw = {
        "palm_confidence": palm_confidence(readings),
        "tarot_relevance": tarot_relevance(readings, profile),
        "personality_alignment": personality.get("alignment"),
        "user_context": context_relevance(readings, profile, now),
        "reading_consistency": reading_consistency(readings),
    }
    missing = [k for k, v in raw.items() if v is None]
    values = {k: (NEUTRAL if v is None else float(v)) for k, v in raw.items()}
    return {"values": values, "missing": missing}


def weighted_insight_score(inputs: dict, growth_potential: float = 50.0) -> dict:
    values, missing = inputs["values"], inputs["missing"]
    overall = round(100 * sum(WEIGHTS[k] * values[k] for k in WEIGHTS), 1)
    n_missing = len(missing)
    quality = "high" if n_missing == 0 else "medium" if n_missing <= 2 else "low"
    ranked = sorted(WEIGHTS, key=lambda k: values[k])
    strongest, weakest = LABELS[ranked[-1]], LABELS[ranked[0]]
    if missing:
        hints = sorted({_MISSING_HINT[k] for k in missing if k in _MISSING_HINT})
        advice = "Add " + " and ".join(hints) + " to make this score more personal; some inputs are still estimated."
    else:
        advice = f"Your strongest signal is {strongest}. {weakest} has the most room to grow."
    breakdown = [{"factor": LABELS[k], "weight": f"{int(WEIGHTS[k] * 100)}%",
                  "contribution": f"{round(100 * WEIGHTS[k] * values[k], 1)}%",
                  "score": round(100 * values[k], 1), "estimated": k in missing} for k in WEIGHTS]
    return {
        # legacy keys used by the current Dashboard.jsx Overview tab
        "overall_score": overall,
        "resonance_tier": resonance_tier(overall),
        "advice": advice,
        "breakdown": breakdown,
        # new keys
        "overall_insight_score": overall,
        "components": {k: {"value": round(values[k], 3), "weight": WEIGHTS[k],
                           "contribution": round(100 * WEIGHTS[k] * values[k], 1),
                           "estimated": k in missing} for k in WEIGHTS},
        "sub_scores": {
            "personality_alignment": round(100 * values["personality_alignment"], 1),
            "reading_confidence": round(100 * values["palm_confidence"], 1),
            "guidance_relevance": round(100 * (values["tarot_relevance"] + values["user_context"]) / 2, 1),
            "self_development": round(float(growth_potential), 1),
        },
        "missing_inputs": missing,
        "data_quality": quality,
        "disclaimer": "Scores describe measurement quality and consistency of your readings, not the accuracy of any prediction.",
    }