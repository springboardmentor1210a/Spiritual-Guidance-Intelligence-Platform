
from __future__ import annotations

import logging
import os
import re
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Reading, User

try:
    from groq import Groq
except ImportError:
    Groq = None


logger = logging.getLogger(__name__)

router = APIRouter(tags=["Ask Your Guide"])

DEFAULT_MODEL = "qwen/qwen3.8-27b"


def env_value(name: str, default: str = "") -> str:
    env_path = Path(__file__).resolve().parents[2] / ".env"

    if env_path.is_file():
        try:
            for line in env_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()

                if not line or line.startswith("#") or "=" not in line:
                    continue

                key, value = line.split("=", 1)

                if key.strip() == name:
                    value = value.strip().strip('"').strip("'")
                    if value:
                        return value
        except OSError:
            logger.exception("Could not read backend environment file")

    return os.getenv(name, default).strip().strip('"').strip("'")


def create_groq_client() -> Groq:
    api_key = env_value("GROQ_API_KEY")

    if not api_key or api_key.upper().startswith("YOUR_"):
        raise HTTPException(
            status_code=503,
            detail="Groq is not configured. Set a valid GROQ_API_KEY in backend/.env.",
        )

    if Groq is None:
        raise HTTPException(
            status_code=503,
            detail="Groq is not installed. Run pip install groq in your backend environment.",
        )

    return Groq(api_key=api_key)


class ChatMessage(BaseModel):
    role: str
    content: str = Field(min_length=1, max_length=4000)


class AskGuideRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    conversation: list[ChatMessage] = Field(default_factory=list, max_length=12)


def load_reading_context(db: Session, user: User) -> str:
    readings = (
        db.query(Reading)
        .filter(Reading.user_id == user.id)
        .order_by(Reading.created_at.desc())
        .limit(8)
        .all()
    )

    if not readings:
        return (
            "No saved Palm or Tarot readings are available yet. "
            "Answer with general, practical reflection. Do not invent readings."
        )

    sections = []

    for index, reading in enumerate(readings, start=1):
        sections.append(
            "\n".join(
                [
                    f"Reading {index}",
                    f"Type: {reading.reading_type or 'Unknown'}",
                    f"Title: {reading.title or 'Untitled'}",
                    f"Created: {reading.created_at or 'Unknown'}",
                    f"Question/input: {(reading.input_summary or '')[:1200]}",
                    f"Interpretation: {(reading.result_text or '')[:3000]}",
                ]
            )
        )

    return "\n\n".join(sections)


def safe_provider_message(exc: Exception) -> str:
    # Never return API keys or full provider traces to the browser.
    message = re.sub(r"gsk_[A-Za-z0-9_-]+", "[redacted]", str(exc))
    lower = message.lower()

    if "401" in lower or "authentication" in lower or "invalid api key" in lower:
        return "Groq rejected the API key. Check the replacement GROQ_API_KEY in backend/.env."

    if "429" in lower or "rate limit" in lower or "quota" in lower:
        return "Groq's rate limit was reached. Please wait briefly and try again."

    if "model" in lower and (
        "not found" in lower
        or "does not exist" in lower
        or "not available" in lower
    ):
        return (
            "The configured Groq model is unavailable. "
            "Check GROQ_MODEL against the model used by your working Tarot endpoint."
        )

    if "400" in lower or "unsupported" in lower or "invalid parameter" in lower:
        return (
            "Groq rejected the request settings. Check the model name and supported "
            "request parameters in the backend terminal."
        )

    return "The AI provider could not complete the request. Check the backend terminal for details."


@router.post("/api/guidance/ask")
def ask_your_guide(
    payload: AskGuideRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = payload.question.strip()

    if not question:
        raise HTTPException(
            status_code=422,
            detail="Please enter a question for your guide.",
        )

    reading_context = load_reading_context(db, current_user)

    system_prompt = """
You are Ask Your Guide, a warm and thoughtful reflection assistant in a
Palmistry and Tarot platform.

Help the user reflect on career, relationships, life decisions, personal
development, and their saved Palm or Tarot readings.

Rules:
- Answer the user's latest question directly.
- Give useful, specific suggestions instead of repeating generic advice.
- Use the saved reading context only when relevant.
- Do not invent facts about the user or their readings.
- Explain ideas in clear, accessible language.
- When useful, finish with two or three realistic actions the user can try.
- Treat Palmistry and Tarot as reflective traditions, not scientifically
  proven ways to predict future events.
- Never guarantee future dates, marriage, money, health outcomes, or success.
- Do not present yourself as a substitute for qualified professional advice.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "system",
            "content": "Relevant saved readings for this user:\n\n" + reading_context,
        },
    ]

    for item in payload.conversation[-10:]:
        if item.role not in {"user", "assistant"}:
            continue

        content = item.content.strip()
        if not content:
            continue

        messages.append(
            {
                "role": item.role,
                "content": content[:4000],
            }
        )

    # The frontend includes the current question in conversation.
    # Append it only if it is not already the final user message.
    if (
        not messages
        or messages[-1]["role"] != "user"
        or messages[-1]["content"] != question
    ):
        messages.append({"role": "user", "content": question})

    model = env_value("GROQ_MODEL", DEFAULT_MODEL)

    try:
        client = create_groq_client()

        # Match the request parameters used by the existing Tarot AI endpoint.
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.65,
            max_completion_tokens=1200,
            reasoning_effort="none",
        )

        answer = (response.choices[0].message.content or "").strip()

        if not answer:
            logger.error("Ask Your Guide returned an empty response for user %s", current_user.id)
            raise HTTPException(
                status_code=502,
                detail="The guide returned an empty reply. Please try again.",
            )

        return {
            "answer": answer,
            "provider": "Groq",
        }

    except HTTPException:
        raise

    except Exception as exc:
        # The full traceback is logged on the backend, not sent to the browser.
        logger.exception(
            "Ask Your Guide failed for user %s using model %s",
            current_user.id,
            model,
        )

        raise HTTPException(
            status_code=502,
            detail=safe_provider_message(exc),
        ) from exc
