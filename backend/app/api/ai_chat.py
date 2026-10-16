from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.reading_session import ReadingSession
from app.models.user import User
from app.services.ollama_chat_service import ask_ollama


router = APIRouter(
    prefix="/api/v1/ai-chat",
    tags=["AI Chat"],
)


class ChatMessage(BaseModel):
    role: str
    content: str


class AIChatRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=2000,
    )

    reading_session_id: int | None = None

    conversation: list[ChatMessage] = Field(
        default_factory=list,
    )


class AIChatResponse(BaseModel):
    reply: str


def build_reading_context(
    db: Session,
    user_id: int,
    reading_session_id: int,
) -> str | None:

    reading_session = (
        db.query(ReadingSession)
        .filter(
            ReadingSession.id == reading_session_id,
            ReadingSession.user_id == user_id,
        )
        .first()
    )

    if reading_session is None:
        raise HTTPException(
            status_code=404,
            detail="Reading session not found.",
        )

    context_parts = [
        f"Reading type: {reading_session.reading_type}",
    ]

    if reading_session.summary:
        context_parts.append(
            f"Reading summary:\n{reading_session.summary}"
        )

    return "\n\n".join(context_parts)


@router.post(
    "",
    response_model=AIChatResponse,
)
async def chat_with_arcana(
    request: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = None

    if request.reading_session_id is not None:
        context = build_reading_context(
            db=db,
            user_id=current_user.id,
            reading_session_id=request.reading_session_id,
        )

    conversation = [
        {
            "role": item.role,
            "content": item.content,
        }
        for item in request.conversation
        if item.role in {"user", "assistant"}
    ]

    try:
        answer = await ask_ollama(
            message=request.message,
            context=context,
            conversation=conversation,
        )

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error),
        )

    return {
        "reply": answer,
    }