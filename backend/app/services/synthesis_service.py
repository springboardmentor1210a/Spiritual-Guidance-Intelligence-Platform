import json
import os
from collections import Counter
from typing import List

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.postgres_models import ReadingHistory, User
from app.models.synthesis_schemas import (
    Synthesis, Personality, Challenge, Recommendation, Category
)

SYSTEM_PROMPT = (
    "You are a reflective guidance assistant for a palmistry and tarot app. "
    "Readings are for self-reflection and entertainment, not prediction or medical/financial advice. "
    "Return ONLY valid JSON matching the given schema. Do not include markdown formatting like ```json."
)


def _latest(db: Session, user_id: int, reading_type: str):
    return (
        db.query(ReadingHistory)
        .filter(ReadingHistory.user_id == user_id,
                ReadingHistory.reading_type == reading_type)
        .order_by(desc(ReadingHistory.created_at))
        .first()
    )


def build_context(db: Session, user: User) -> dict:
    palm = _latest(db, user.id, "palmistry")
    tarot = _latest(db, user.id, "tarot")
    astro = _latest(db, user.id, "astrology")
    profile = user.profile

    # Pattern across the last 10 tarot readings
    recent = (
        db.query(ReadingHistory)
        .filter(ReadingHistory.user_id == user.id, ReadingHistory.reading_type == "tarot")
        .order_by(desc(ReadingHistory.created_at))
        .limit(10)
        .all()
    )
    counter, total, reversed_total = Counter(), 0, 0
    for r in recent:
        if isinstance(r.details, list):
            for c in r.details:
                counter[c.get("name")] += 1
                total += 1
                if c.get("orientation") == "Reversed":
                    reversed_total += 1

    palm_d = palm.details if palm and isinstance(palm.details, dict) else {}
    astro_d = astro.details if astro and isinstance(astro.details, dict) else {}
    cards = tarot.details if tarot and isinstance(tarot.details, list) else []

    return {
        "palm": {
            "archetype": palm_d.get("archetype"),
            "gesture": palm_d.get("gesture"),
            "summary": palm.summary if palm else None,
        },
        "tarot_cards": [
            {"position": c.get("position"), "card": c.get("name"),
             "orientation": c.get("orientation")} for c in cards
        ],
        "astrology": {"sun_sign": astro_d.get("sun_sign"),
                      "nakshatra": astro_d.get("nakshatra")},
        "profile": {
            "age_group": profile.age_group if profile else None,
            "interests": profile.interests if profile else None,
            "goals": profile.spiritual_goals if profile else None,
        },
        "history": {
            "tarot_readings_analysed": len(recent),
            "repeated_cards": [n for n, c in counter.items() if c >= 2],
            "reversed_ratio": round(reversed_total / total, 2) if total else 0,
        },
    }


def build_prompt(ctx: dict) -> str:
    return f"""Create a guidance synthesis for this user.

DATA:
{json.dumps(ctx, indent=2, default=str)}

SCHEMA:
{json.dumps(Synthesis.model_json_schema())}

RULES:
- 3-5 strengths and 2-4 weaknesses, phrased kindly and tied to the palm/tarot data.
- 2-3 challenges phrased as "themes to watch", never as certain events. Use history.repeated_cards and history.reversed_ratio when present.
- 3-5 recommendations. If profile.goals is set, set linked_goal to that goal for the ones that support it. Otherwise leave linked_goal null.
- Keep finance and health suggestions to general wellbeing habits.
- summary: 2-3 warm sentences.
- timeframe must be exactly one of: "next_30_days", "next_3_months", "next_6_months".
- category must be exactly one of: "personality", "relationships", "career", "finance", "health_wellness", "personal_growth", "opportunities".
"""


def call_llm(prompt: str) -> str:
    from openai import OpenAI
    key = getattr(settings, "OPENAI_API_KEY", None) or os.getenv("OPENAI_API_KEY")
    
    # Fallback if no key is provided (prevents demo crashes)
    if not key:
        raise ValueError("OPENAI_API_KEY not found")
        
    client = OpenAI(api_key=key)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": SYSTEM_PROMPT},
                  {"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.7,
    )
    return resp.choices[0].message.content


def fallback_synthesis(ctx: dict) -> Synthesis:
    """Used when no API key is set or the LLM fails, so the demo never breaks."""
    goal = ctx["profile"].get("goals")
    archetype = ctx["palm"].get("archetype") or "your palm archetype"
    repeated = ctx["history"]["repeated_cards"]
    
    return Synthesis(
        summary=f"Your recent readings point toward reflection and steady growth, shaped by {archetype}. Use them as prompts for self-reflection.",
        personality=Personality(
            strengths=["Intuitive", "Empathetic", "Reflective"],
            weaknesses=["May overthink decisions", "Can be hard on yourself"],
            behavioral_insights=["You tend to process feelings before acting."],
            development_tips=["Journal after each reading to spot patterns."]
        ),
        challenges=[Challenge(
            theme=("Recurring theme: " + repeated[0]) if repeated else "Balancing intuition and action",
            timeframe="next_30_days",  # Matches your Literal exactly
            description="A theme to watch, not a prediction.",
            how_to_navigate="Notice when it appears and note how you respond."
        )],
        recommendations=[Recommendation(
            category="personal_growth",  # Matches your Literal exactly
            title="Weekly reflection ritual",
            action="Spend 10 minutes each week reviewing your readings and journal notes.",
            linked_goal=goal
        )]
    )


def generate_synthesis(ctx: dict, retries: int = 2) -> Synthesis:
    prompt = build_prompt(ctx)
    for attempt in range(retries + 1):
        try:
            raw_response = call_llm(prompt)
            # Clean up markdown formatting if the LLM adds it
            if raw_response.startswith("```json"):
                raw_response = raw_response.strip("```json").strip("```")
            elif raw_response.startswith("```"):
                raw_response = raw_response.strip("```").strip()
                
            return Synthesis.model_validate_json(raw_response)
        except Exception as e:
            print(f"[synthesis] attempt {attempt + 1} failed: {e}")
            
    # If all retries fail, gracefully return the safe fallback
    return fallback_synthesis(ctx)