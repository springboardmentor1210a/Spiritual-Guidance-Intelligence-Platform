"""
Single Gemini helper. Lazy-initialised so a missing GEMINI_API_KEY never
crashes app startup; callers get `None` and fall back to templates.
Requires:  google-genai   and   GEMINI_API_KEY in .env / config Settings.
"""
from __future__ import annotations
import asyncio
from typing import Optional, Callable, Awaitable

_client = None


def _get_client():
    global _client
    if _client is None:
        from google import genai
        from app.core.config import settings
        key = getattr(settings, "GEMINI_API_KEY", "")
        if not key:
            return None
        _client = genai.Client(api_key=key)
    return _client


def get_llm() -> Optional[Callable[[str], Awaitable[str]]]:
    """Return an async callable(prompt)->str, or None if no key is configured."""
    try:
        client = _get_client()
    except Exception:
        return None
    if client is None:
        return None

    async def call_gemini(prompt: str) -> str:
        # SDK call is blocking -> run in a thread so the event loop stays free.
        def _run():
            resp = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
            if not resp.text:
                raise ValueError("empty response from Gemini")
            return resp.text
        return await asyncio.wait_for(asyncio.to_thread(_run), timeout=20)
    return call_gemini
