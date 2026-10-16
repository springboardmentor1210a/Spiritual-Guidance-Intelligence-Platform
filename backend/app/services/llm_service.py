import json
from typing import Any

from ollama import chat


MODEL_NAME = "qwen3:8b"


SYSTEM_PROMPT = """
You are the AI interpretation engine for a Palmistry & Tarot Intelligence Platform.

Your job is to transform structured palmistry or tarot reading data into
personalized, reflective guidance.

Important rules:

1. Treat palmistry and tarot as symbolic/reflective systems.
2. Do not claim that they scientifically predict the future.
3. Do not diagnose diseases or medical conditions.
4. Do not make guaranteed predictions.
5. Use the supplied reading data and user context.
6. Do not invent palm features or tarot cards that were not supplied.
7. Return ONLY valid JSON.
8. Keep each interpretation clear, useful and reasonably concise.

Return exactly these fields:

{
  "overview": "...",
  "personality": "...",
  "relationships": "...",
  "career": "...",
  "finance": "...",
  "health_wellness": "...",
  "personal_growth": "...",
  "life_opportunities": "..."
}
"""


def generate_llm_interpretation(
    reading_type: str,
    context: str,
    reading_data: dict[str, Any],
    user_context: dict[str, Any],
) -> dict[str, str]:

    prompt = f"""
Reading type:
{reading_type}

Reading context:
{context}

Structured reading data:
{json.dumps(reading_data, indent=2, default=str)}

User context:
{json.dumps(user_context, indent=2, default=str)}

Generate a personalized reflective interpretation using ONLY the
information supplied above.

Return only the required JSON object.
"""

    response = chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        format="json",
        options={
            "temperature": 0.4,
        },
    )

    content = response["message"]["content"]

    result = json.loads(content)

    required_fields = [
        "overview",
        "personality",
        "relationships",
        "career",
        "finance",
        "health_wellness",
        "personal_growth",
        "life_opportunities",
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(
                f"LLM response is missing required field: {field}"
            )

        if not isinstance(result[field], str):
            result[field] = str(result[field])

    return result