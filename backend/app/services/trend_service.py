"""
Life Trend Analysis Engine (spec module 7).

Looks at a user's reading history over time and reports:
  * score trajectory (slope + direction)
  * engagement rhythm
  * recurring cards / themes
  * opportunities & challenges to *reflect on* (never predictions of fact)
  * growth-potential index (0-100)

Pure functions, no DB access.
"""
from __future__ import annotations
from collections import Counter
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from .knowledge import CATEGORIES, card_profile, clamp

MIN_READINGS_FOR_TREND = 3


def _slope(ys: List[float]) -> float:
    """Least-squares slope per step (0 for <2 points)."""
    n = len(ys)
    if n < 2:
        return 0.0
    xs = list(range(n))
    mx, my = sum(xs) / n, sum(ys) / n
    den = sum((x - mx) ** 2 for x in xs)
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den if den else 0.0


def _tarot_cards(readings: List[dict]) -> List[dict]:
    out = []
    for r in readings:
        if r.get("reading_type") == "tarot" and isinstance(r.get("details"), list):
            for c in r["details"]:
                out.append({**c, "_at": r["created_at"]})
    return out


def theme_distribution(cards: List[dict]) -> Dict[str, float]:
    dist = {c: 0.0 for c in CATEGORIES}
    for c in cards:
        for cat, w in card_profile(c.get("name", ""), c.get("orientation", "Upright"))["categories"].items():
            dist[cat] += w
    total = sum(dist.values())
    return {k: round(v / total, 3) for k, v in dist.items()} if total else dist


def analyze_trends(readings: List[dict], profile: Optional[dict] = None,
                   now: Optional[datetime] = None) -> dict:
    now = now or datetime.utcnow()
    ordered = sorted(readings, key=lambda r: r["created_at"])
    n = len(ordered)

    # ---- score trajectory
    scores = [float(r["score"]) for r in ordered if r.get("score") is not None]
    slope = _slope(scores[-10:])
    if len(scores) < MIN_READINGS_FOR_TREND:
        direction = "insufficient_data"
    elif slope > 0.8:
        direction = "rising"
    elif slope < -0.8:
        direction = "declining"
    else:
        direction = "steady"

    # ---- engagement
    last_30 = [r for r in ordered if r["created_at"] >= now - timedelta(days=30)]
    prev_30 = [r for r in ordered if now - timedelta(days=60) <= r["created_at"] < now - timedelta(days=30)]
    active_days = len({r["created_at"].date() for r in last_30})
    types_used = sorted({r["reading_type"] for r in ordered})
    engagement = {
        "total_readings": n,
        "last_30_days": len(last_30),
        "previous_30_days": len(prev_30),
        "active_days_last_30": active_days,
        "reading_types_used": types_used,
        "last_reading_at": ordered[-1]["created_at"].isoformat() if ordered else None,
    }

    # ---- tarot themes: recent vs earlier
    cards = _tarot_cards(ordered)
    recent_cards = [c for c in cards if c["_at"] >= now - timedelta(days=30)]
    earlier_cards = [c for c in cards if c["_at"] < now - timedelta(days=30)]
    recent_dist, earlier_dist = theme_distribution(recent_cards), theme_distribution(earlier_cards)
    shifts = []
    if recent_cards and earlier_cards:
        for cat in CATEGORIES:
            d = recent_dist[cat] - earlier_dist[cat]
            if abs(d) >= 0.08:
                shifts.append({"category": cat, "change": round(d, 3), "direction": "growing" if d > 0 else "fading"})
        shifts.sort(key=lambda s: -abs(s["change"]))

    counts = Counter(c.get("name") for c in cards if c.get("name"))
    recurring = [{"card": k, "times": v} for k, v in counts.most_common(5) if v >= 2]

    # ---- opportunities and challenges (reflective, from card tone)
    opportunities, challenges = [], []
    seen_o, seen_c = set(), set()
    for c in reversed(cards[-12:]):  # newest first
        p = card_profile(c.get("name", ""), c.get("orientation", "Upright"))
        top_cat = max(p["categories"], key=p["categories"].get) if p["categories"] else None
        if not top_cat:
            continue
        label = top_cat.replace("_", " ")
        if p["tone"] == "positive" and top_cat not in seen_o:
            seen_o.add(top_cat)
            opportunities.append({"area": top_cat, "signal": f'{c["name"]} ({c.get("orientation","Upright")})',
                                  "reflection": f"A supportive theme around {label}; consider what small step could build on it."})
        elif p["tone"] == "challenging" and top_cat not in seen_c:
            seen_c.add(top_cat)
            challenges.append({"area": top_cat, "signal": f'{c["name"]} ({c.get("orientation","Upright")})',
                               "reflection": f"A theme around {label} that may deserve care or a second look."})
    # palm: strong fate line -> career/opportunity note
    palm = [r for r in ordered if r["reading_type"] == "palmistry" and isinstance(r.get("details"), dict)]
    if palm:
        fate = ((palm[-1]["details"].get("line_metrics") or {}).get("fate_line") or {}).get("score")
        if fate and fate >= 85 and "career" not in seen_o:
            opportunities.append({"area": "career", "signal": "Strong fate line in latest palm scan",
                                  "reflection": "Symbolically linked to a self-directed path; a good moment to define a clear goal."})

    # ---- growth potential (0-100)
    trend_component = clamp(0.5 + slope / 10) if len(scores) >= MIN_READINGS_FOR_TREND else 0.5
    consistency = clamp(active_days / 8)           # 8+ active days in a month = full marks
    breadth = clamp(len(types_used) / 3)
    goal_link = 1.0 if (profile or {}).get("spiritual_goals") else 0.4
    growth = round(100 * (0.35 * trend_component + 0.30 * consistency + 0.20 * breadth + 0.15 * goal_link), 1)

    return {
        "direction": direction,
        "score_slope_per_reading": round(slope, 2),
        "score_series": [{"at": r["created_at"].isoformat(), "type": r["reading_type"], "score": r["score"]}
                         for r in ordered[-20:] if r.get("score") is not None],
        "engagement": engagement,
        "theme_shifts": shifts[:4],
        "recurring_cards": recurring,
        "opportunities": opportunities[:4],
        "challenges": challenges[:4],
        "growth_potential": growth,
        "enough_data": n >= MIN_READINGS_FOR_TREND,
        "note": None if n >= MIN_READINGS_FOR_TREND else
                f"Trends become meaningful after {MIN_READINGS_FOR_TREND}+ readings (you have {n}).",
    }
