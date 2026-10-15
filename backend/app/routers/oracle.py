from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.core.security import get_current_user
from app.models.postgres_models import User
from app.services.oracle_service import oracle_engine

router = APIRouter(prefix="/oracle", tags=["Oracle Chat"])

class OracleChatRequest(BaseModel):
    query: str
    archetype: Optional[str] = "Universal Seeker"
    gesture: Optional[str] = "Open Palm"
    tarot_cards: Optional[List[Dict[str, Any]]] = []

class OracleChatResponse(BaseModel):
    reply: str
    archetype_aligned: str

@router.post("/chat", response_model=OracleChatResponse)
async def chat_with_oracle(
    payload: OracleChatRequest,
    current_user: User = Depends(get_current_user)
):
    profile = current_user.profile
    user_name = getattr(profile, "name", None) or current_user.email.split("@")[0]
    interests = getattr(profile, "interests", "") or ""
    spiritual_goals = getattr(profile, "spiritual_goals", "") or ""
    reply = oracle_engine.generate_oracle_guidance(
        query=payload.query,
        user_name=user_name,
        archetype=payload.archetype,
        gesture=payload.gesture,
        tarot_cards=payload.tarot_cards,
        interests=interests,
        spiritual_goals=spiritual_goals
    )
    return {
        "reply": reply,
        "archetype_aligned": payload.archetype
    }