"""
Personality Intelligence Module (spec module 6).

Builds a trait profile from whatever signals exist: palm line scores, palm
element, tarot card suits/arcana, plus the user's own profile text.
Pure functions over plain dicts -> easy to test, no DB access here.

Reading dict contract (what the router builds from ReadingHistory rows):
    {"id", "reading_type": "palmistry"|"tarot"|"astrology",
     "details": <dict|list>, "summary": str, "score": float|None,
     "created_at": datetime}
"""
from __future__ import annotations
from collections import Counter
from typing import Dict, List, Optional

from .knowledge import (TRAITS, PALM_LINE_TRAITS, ELEMENT_TRAITS, card_profile,
                        normalize_element, clamp)

NEUTRAL = 50.0


def _latest(readings: List[dict], rtype: str) -> Optional[dict]:
    items = [r for r in readings if r.get("reading_type") == rtype]
    return max(items, key=lambda r: r["created_at"]) if items else None


def palm_trait_vector(palm_details: Any) -> Dict[str, float]:
    """Trait scores (0-100) from one palm reading. Missing traits -> absent."""
    if not isinstance(palm_details, dict):
        return {}
    acc: Dict[str, List[float]] = {}
    metrics = palm_details.get("line_metrics")
    if not isinstance(metrics, dict):
        metrics = {}
    for line, weights in PALM_LINE_TRAITS.items():
        m = metrics.get(line)
        if not m or not isinstance(m, dict) or "score" not in m:
            continue
        for trait, w in weights.items():
            # weight scales how far the line score can pull the trait from neutral
            acc.setdefault(trait, []).append(NEUTRAL + (float(m["score"]) - NEUTRAL) * w)
    element = normalize_element(palm_details.get("element") or palm_details.get("archetype", ""))
    for trait, w in ELEMENT_TRAITS.get(element, {}).items():
        acc.setdefault(trait, []).append(NEUTRAL + 30 * w)
    return {t: sum(v) / len(v) for t, v in acc.items()}


def tarot_trait_vector(readings: List[dict], max_readings: int = 10) -> Dict[str, float]:
    """Aggregate trait pull from the most recent tarot draws (0-100)."""
    tarot = sorted((r for r in readings if r.get("reading_type") == "tarot"),
                   key=lambda r: r["created_at"], reverse=True)[:max_readings]
    totals = {t: 0.0 for t in TRAITS}
    n_cards = 0
    for r in tarot:
        cards = r.get("details") if isinstance(r.get("details"), list) else []
        for c in cards:
            p = card_profile(c.get("name", ""), c.get("orientation", "Upright"))
            for t, w in p["traits"].items():
                totals[t] += w
            n_cards += 1
    if n_cards == 0:
        return {}
    # Expected pull per trait if cards were spread evenly is ~0.35/card; map so
    # that "average" -> 50 and each extra 0.35/card adds ~25 points.
    return {t: clamp(NEUTRAL + (totals[t] / n_cards - 0.35) / 0.35 * 25, 0, 100) for t in TRAITS}


def merge_vectors(palm: Dict[str, float], tarot: Dict[str, float],
                  palm_w: float = 0.6, tarot_w: float = 0.4) -> Dict[str, float]:
    out = {}
    for t in TRAITS:
        parts = []
        if t in palm:
            parts.append((palm[t], palm_w))
        if t in tarot:
            parts.append((tarot[t], tarot_w))
        out[t] = (sum(v * w for v, w in parts) / sum(w for _, w in parts)) if parts else NEUTRAL
    return {t: round(v, 1) for t, v in out.items()}


def cosine_alignment(a: Dict[str, float], b: Dict[str, float]) -> Optional[float]:
    """0..1 agreement between two trait vectors, centred on neutral (50)."""
    keys = [t for t in TRAITS if t in a and t in b]
    if len(keys) < 3:
        return None
    va = [a[k] - NEUTRAL for k in keys]
    vb = [b[k] - NEUTRAL for k in keys]
    na = sum(x * x for x in va) ** 0.5
    nb = sum(x * x for x in vb) ** 0.5
    if na < 1e-6 or nb < 1e-6:
        return 0.5  # one source is flat -> no evidence for or against agreement
    cos = sum(x * y for x, y in zip(va, vb)) / (na * nb)
    return round((cos + 1) / 2, 3)


_STRENGTH_TEXT = {
    "empathy": "You attune easily to other people's feelings, which helps you build trust.",
    "intellect": "You think things through and tend to see patterns before others do.",
    "drive": "You bring initiative and momentum once you commit to a direction.",
    "stability": "You are dependable and grounded; people can lean on your steadiness.",
    "intuition": "You listen to inner cues and often sense what a situation needs.",
    "adaptability": "You adjust well to change and can reinvent your approach when needed.",
}
_GROWTH_TEXT = {
    "empathy": "Make room for emotional openness; share how you feel before it builds up.",
    "intellect": "Slow down for structured reflection (a weekly review or journaling) before big choices.",
    "drive": "Set one small, concrete goal at a time so intention turns into action.",
    "stability": "Build steadier routines (sleep, finances, commitments) to support your ambitions.",
    "intuition": "Practice noticing gut feelings in quiet moments, then test them against facts.",
    "adaptability": "Experiment with small changes to loosen rigid habits.",
}
_BEHAVIOR_TEXT = {
    "empathy": "In groups you probably notice mood shifts early and may absorb others' stress.",
    "intellect": "Under pressure you likely analyse first and act second.",
    "drive": "You may feel restless when progress stalls and prefer visible results.",
    "stability": "You tend to prefer predictability and may resist sudden change.",
    "intuition": "You may make quick judgments about people and later look for reasons.",
    "adaptability": "You probably keep options open and can struggle to finalise a choice.",
}


def build_personality_profile(readings: List[dict], profile: Optional[dict] = None) -> dict:
    palm_r = _latest(readings, "palmistry")
    palm_vec = palm_trait_vector(palm_r["details"]) if palm_r and isinstance(palm_r.get("details"), dict) \
        and palm_r["details"].get("detected", True) else {}
    tarot_vec = tarot_trait_vector(readings)
    traits = merge_vectors(palm_vec, tarot_vec)

    sources = [s for s, v in (("palm", palm_vec), ("tarot", tarot_vec)) if v]
    completeness = round(len(sources) / 2, 2)

    ranked = sorted(traits.items(), key=lambda kv: kv[1], reverse=True)
    strengths, growth = [], []
    if sources:
        for t, v in ranked[:3]:
            if v >= 55:
                strengths.append({"trait": t, "score": v, "text": _STRENGTH_TEXT[t]})
        for t, v in ranked[::-1][:2]:
            if v <= 48:
                growth.append({"trait": t, "score": v, "text": _GROWTH_TEXT[t]})
    dominant = ranked[0][0] if sources else None
    behavior = [_BEHAVIOR_TEXT[dominant]] if dominant else []
    if len(ranked) > 1 and sources and ranked[-1][1] <= 48:
        behavior.append(f"{ranked[-1][0].capitalize()} is your quieter side right now; it may need conscious attention.")

    goals = (profile or {}).get("spiritual_goals") or ""
    dev = [g["text"] for g in growth]
    if goals:
        dev.append(f'Tie your practice to your stated goal: "{goals[:80]}".')

    return {
        "traits": traits,
        "dominant_trait": dominant,
        "palm_element": (palm_r["details"].get("element") if palm_r and isinstance(palm_r.get("details"), dict) else None),
        "strengths": strengths,
        "growth_areas": growth,
        "behavioral_insights": behavior,
        "development_recommendations": dev,
        "alignment": cosine_alignment(palm_vec, tarot_vec),
        "sources_used": sources,
        "data_completeness": completeness,
        "note": None if sources else "Complete a palm scan and a tarot spread to unlock your personality profile.",
    }
