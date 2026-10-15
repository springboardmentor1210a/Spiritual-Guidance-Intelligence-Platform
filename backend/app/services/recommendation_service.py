"""
Recommendation Engine (spec module 9).

Rule-based and explainable: every recommendation carries its rationale and the
evidence that triggered it. Ranking = need (weak trait / challenging theme)
+ boost when it matches the user's own stated goals.
"""
from __future__ import annotations
from typing import Dict, List, Optional

from .knowledge import categories_from_text, clamp

AREAS = ["personal_growth", "relationship", "career", "goal_alignment", "spiritual_development"]

_TRAIT_STEPS = {
    "empathy": ["Once a week, tell one person how you actually feel.", "Ask one open question in each important conversation."],
    "intellect": ["Keep a 10-minute weekly review: what worked, what didn't.", "Write pros/cons before any decision that matters."],
    "drive": ["Pick ONE goal for this week and define the first 20-minute step.", "Track completion daily, not perfection."],
    "stability": ["Fix one anchor routine (wake time or wind-down).", "Review commitments monthly and drop one that drains you."],
    "intuition": ["Journal a gut feeling each day, then note what happened.", "Spend 5 quiet minutes without input before deciding."],
    "adaptability": ["Change one small routine this week on purpose.", "When plans shift, list two alternatives before reacting."],
}
_DISCLAIMER = {
    "finance": "Reflective guidance only, not financial advice. Consult a qualified professional for money decisions.",
    "health_wellness": "Reflective guidance only, not medical advice. See a healthcare professional for health concerns.",
}


def _rec(area, title, rationale, steps, priority, evidence, goal_match=False, cat=None):
    r = {"area": area, "title": title, "rationale": rationale, "steps": steps,
         "priority": int(round(clamp(priority / 100) * 100)), "evidence": evidence,
         "matches_your_goals": goal_match}
    if cat in _DISCLAIMER:
        r["disclaimer"] = _DISCLAIMER[cat]
    return r


def build_recommendations(personality: dict, trends: dict, categories: Dict[str, dict],
                          profile: Optional[dict] = None, max_items: int = 8) -> dict:
    profile = profile or {}
    goal_cats = categories_from_text(" ".join(str(profile.get(k) or "") for k in ("spiritual_goals", "interests")))
    traits = personality.get("traits", {})
    has_data = bool(personality.get("sources_used"))
    recs: List[dict] = []

    if not has_data:
        recs.append(_rec("spiritual_development", "Start with one palm scan and one tarot spread",
                         "Personalised guidance needs at least one palm scan and one tarot draw.",
                         ["Upload a clear photo of your open palm in good light.", "Draw a three-card spread with a question in mind."],
                         90, ["No readings yet"]))
        return {"recommendations": recs, "by_area": {a: [r for r in recs if r["area"] == a] for a in AREAS}}

    # personal growth: weakest traits
    for g in personality.get("growth_areas", []):
        t = g["trait"]
        need = 100 - g["score"]
        recs.append(_rec("personal_growth", f"Strengthen your {t}", g["text"], _TRAIT_STEPS[t],
                         40 + need * 0.6, [f"{t} score {g['score']}"], goal_match="personal_growth" in goal_cats))

    # relationships
    emp = traits.get("empathy", 50)
    rel_cat = categories.get("relationships", {})
    if emp >= 60:
        recs.append(_rec("relationship", "Protect your emotional energy",
                         "High empathy is a gift but can lead to absorbing others' stress.",
                         ["Name one boundary you need this week and say it kindly.", "Schedule short recovery time after emotionally heavy conversations."],
                         55 + (emp - 60), [f"empathy {emp}"], "relationships" in goal_cats, "relationships"))
    elif emp <= 48:
        recs.append(_rec("relationship", "Open the channel",
                         "A reserved heart line/cups signal suggests feelings may stay unspoken.",
                         _TRAIT_STEPS["empathy"], 60 + (50 - emp), [f"empathy {emp}"], "relationships" in goal_cats, "relationships"))
    if rel_cat.get("score") is not None and rel_cat["score"] < 45:
        recs.append(_rec("relationship", "Give your closest relationship a check-in",
                         "Your recent readings show a challenging tone around relationships.",
                         ["Set aside 30 undistracted minutes with someone important.", "Ask what they need, then share what you need."],
                         70, [f"relationships score {rel_cat['score']}"], "relationships" in goal_cats, "relationships"))

    # career
    drive, intel = traits.get("drive", 50), traits.get("intellect", 50)
    career_cat = categories.get("career", {})
    if drive >= 58 and intel >= 55:
        recs.append(_rec("career", "Aim your momentum at a defined target",
                         "Strong drive plus analytical strength suits a concrete, measurable goal.",
                         ["Write one 90-day career objective with a measurable result.", "Find one mentor or peer to review it monthly."],
                         60, [f"drive {drive}", f"intellect {intel}"], "career" in goal_cats, "career"))
    elif drive < 48:
        recs.append(_rec("career", "Build momentum with small wins",
                         "Lower drive readings suggest starting small will work better than big leaps.",
                         _TRAIT_STEPS["drive"], 58 + (50 - drive), [f"drive {drive}"], "career" in goal_cats, "career"))
    if career_cat.get("score") is not None and career_cat["score"] >= 70:
        recs.append(_rec("career", "Act on a supportive career theme",
                         "Palm and tarot signals around work are currently supportive.",
                         ["List two opportunities you have postponed.", "Take one concrete step on one of them this week."],
                         62, [f"career score {career_cat['score']}"], "career" in goal_cats, "career"))

    # goal alignment: stated goal whose category score is weak or unexplored
    for cat, w in sorted(goal_cats.items(), key=lambda kv: -kv[1])[:3]:
        c = categories.get(cat, {})
        score = c.get("score")
        label = cat.replace("_", " ")
        if score is None:
            recs.append(_rec("goal_alignment", f"Explore your '{label}' goal in a reading",
                             "You named this as a goal but no reading has touched it yet.",
                             [f"Draw a spread with a question about {label}.", "Note one action you could take this month."],
                             55 + 20 * w, [f"goal: {label}"], True, cat))
        elif score < 55:
            recs.append(_rec("goal_alignment", f"Give '{label}' extra attention",
                             f"Your readings show a mixed-to-challenging tone in {label}, which you said matters to you.",
                             [f"Pick one small habit that supports {label}.", "Re-check with a new reading in two weeks."],
                             65 + 20 * w, [f"{label} score {score}"], True, cat))

    # spiritual development
    eng = trends.get("engagement", {})
    intu = traits.get("intuition", 50)
    if eng.get("last_30_days", 0) < 3:
        recs.append(_rec("spiritual_development", "Build a gentle reading rhythm",
                         "Regular, short sessions give the trend engine more to reflect on.",
                         ["Choose a weekly day for a single-card draw.", "Write one sentence about how it landed."],
                         50, [f"{eng.get('last_30_days', 0)} readings in 30 days"]))
    if intu >= 60:
        recs.append(_rec("spiritual_development", "Deepen your intuitive practice",
                         "Intuition is one of your stronger signals.",
                         _TRAIT_STEPS["intuition"], 52, [f"intuition {intu}"]))
    for ch in trends.get("challenges", [])[:1]:
        recs.append(_rec("spiritual_development", "Reflect on a recurring challenge theme",
                         ch["reflection"], ["Journal for 10 minutes on this theme.", "Ask what support or change it may be pointing to."],
                         57, [ch["signal"]], ch["area"] in goal_cats, ch["area"]))

    for r in recs:
        if r["matches_your_goals"]:
            r["priority"] = min(100, r["priority"] + 10)
    recs.sort(key=lambda r: -r["priority"])
    recs = recs[:max_items]
    return {"recommendations": recs, "by_area": {a: [r for r in recs if r["area"] == a] for a in AREAS}}
