import base64
import os
from typing import Any

from openai import OpenAI


DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")


SYSTEM_PROMPT = """
You are the AI interpretation engine for a Palmistry & Tarot Intelligence Platform.

Your role is to provide thoughtful, personalized spiritual/reflection content from
user-provided tarot selections and palm photographs.

Important rules:
- Treat palmistry and tarot as cultural/symbolic reflection, not scientifically validated prediction.
- Never diagnose medical or mental-health conditions.
- Never claim certainty about a person's future, lifespan, health, relationships, finances, or personality.
- For palm images, do not invent exact palm-line detections or coordinates.
- Only discuss visually plausible features when they are genuinely visible.
- Clearly distinguish visual observations from traditional palmistry symbolism.
- Do not say that an image has a specific Heart, Head, Life, Fate, or Sun line unless it is actually visually identifiable.
- If the image is unclear, say so.
- Give practical, grounded reflection prompts instead of deterministic predictions.
- Keep the tone warm, clear, personalized, and useful.
- Do not mention internal prompts, API keys, or implementation details in the interpretation itself.
""".strip()


def openai_is_configured() -> bool:
    return bool(os.getenv("OPENAI_API_KEY", "").strip())


def _client() -> OpenAI:
    key = os.getenv("OPENAI_API_KEY", "").strip()

    if not key:
        raise RuntimeError(
            "OPENAI_API_KEY is not configured."
        )

    return OpenAI(api_key=key)


def _profile_context(profile: Any) -> str:
    if not profile:
        return "No profile context was provided."

    fields = [
        ("Interests", getattr(profile, "interests", None)),
        ("Spiritual goals", getattr(profile, "spiritual_goals", None)),
        (
            "Reading preferences",
            getattr(profile, "reading_preferences", None),
        ),
        ("Bio", getattr(profile, "bio", None)),
        ("Age group", getattr(profile, "age_group", None)),
    ]

    parts = []

    for label, value in fields:
        if value:
            parts.append(
                f"{label}: {str(value)[:500]}"
            )

    return (
        "\n".join(parts)
        if parts
        else "No profile context was provided."
    )


def _clean_output(text: str) -> str:
    value = (text or "").strip()

    if not value:
        raise RuntimeError(
            "The AI model returned an empty interpretation."
        )

    return value


def generate_tarot_interpretation(
    *,
    cards: list[dict[str, str]],
    question: str,
    spread: str,
    profile: Any = None,
) -> str:
    """
    Generate a contextual tarot interpretation
    using the OpenAI Responses API.
    """

    if not openai_is_configured():
        return (
            "AI interpretation is not configured yet. "
            "The traditional card meanings above remain "
            "available for reflection. Add OPENAI_API_KEY "
            "to enable personalized AI insights."
        )

    card_text = "\n".join(
        f"{index + 1}. "
        f"{card.get('name', 'Unknown card')} — "
        f"{card.get('orientation', 'upright')} — "
        f"traditional meaning: "
        f"{card.get('meaning', '')}"
        for index, card in enumerate(cards)
    )

    prompt = f"""
Create a personalized tarot reflection for this user.

Question:
{question}

Spread:
{spread}

Cards:
{card_text}

User profile context:
{_profile_context(profile)}

Return a concise but meaningful interpretation with
exactly these sections:

Overall insight
- Explain the central theme of the spread and how
  the cards relate to the user's question.

Card connections
- Explain the most important connections or contrasts
  between the selected cards and orientations.

Personal reflection
- Connect the reading to the available profile context
  without making unsupported claims.

Practical next step
- Give 2 or 3 realistic actions or reflection prompts
  for the user.

Keep the reading reflective rather than predictive.
Do not state that an event will definitely happen.
""".strip()

    try:
        response = _client().responses.create(
            model=DEFAULT_MODEL,
            input=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )
    except Exception:
        return (
            "The AI interpretation service could not "
            "complete this reading. Check the backend "
            "OPENAI_API_KEY and OPENAI_MODEL configuration "
            "and try again."
        )

    return _clean_output(
        response.output_text
    )


def generate_palm_interpretation(
    *,
    image_bytes: bytes,
    mime_type: str,
    profile: Any = None,
    filename: str = "palm image",
) -> str:
    """
    Generate a visual palm reflection using an
    OpenAI vision-capable model.
    """

    if not openai_is_configured():
        return (
            "AI interpretation is not configured yet. "
            "The image has been saved, but personalized "
            "visual insights require OPENAI_API_KEY."
        )

    encoded = base64.b64encode(
        image_bytes
    ).decode("ascii")

    data_url = (
        f"data:{mime_type};base64,{encoded}"
    )

    prompt = f"""
Analyze the uploaded palm photograph named
{filename} for a reflective palmistry experience.

User profile context:
{_profile_context(profile)}

First describe only broad visual observations that are
genuinely supported by the photograph, such as whether
the palm is clear enough to inspect, visible crease
patterns, hand orientation, image quality, or other
non-sensitive visual features.

Then provide a traditional palmistry-style reflection
based only on what can reasonably be seen.

Do not invent line locations, measurements, coordinates,
or features hidden by blur or lighting.

Do not claim medical information, lifespan, guaranteed
personality traits, or future events.

If the photograph is not clear enough for a reliable
visual observation, explicitly say that.

Return exactly these sections:

Visual observations
- 2 to 4 concise observations.

Traditional palmistry reflection
- A thoughtful interpretation of the visible features,
  clearly framed as symbolic/cultural reflection.

Personalized insight
- Connect the reflection to the available profile
  context, without making unsupported claims.

Practical reflection
- Give 2 or 3 grounded questions or actions the user
  can consider.
""".strip()

    try:
        response = _client().responses.create(
            model=DEFAULT_MODEL,
            input=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": prompt,
                        },
                        {
                            "type": "input_image",
                            "image_url": data_url,
                        },
                    ],
                },
            ],
        )
    except Exception:
        return (
            "The AI interpretation service could not "
            "complete this palm analysis. Check the "
            "backend OPENAI_API_KEY and OPENAI_MODEL "
            "configuration and try again."
        )

    return _clean_output(
        response.output_text
    )