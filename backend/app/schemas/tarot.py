from pydantic import BaseModel, Field
from typing import Literal


# =========================================================
# Allowed spread names
# =========================================================

SpreadName = Literal[
    "single_card",
    "three_card",
    "relationship",
    "career",
    "celtic_cross",
    "life_path",
]


# =========================================================
# Allowed contexts
# =========================================================

ContextName = Literal[
    "general",
    "love",
    "career",
    "mood",
    "spiritual",
]


# =========================================================
# Original reading request
# =========================================================

class TarotReadingRequest(BaseModel):

    spread: SpreadName = Field(
        default="three_card"
    )

    context: ContextName = Field(
        default="general"
    )

    seed: int | None = Field(
        default=None,
        description="Optional seed for reproducible testing."
    )


# =========================================================
# Interactive session request
# =========================================================

class TarotSessionRequest(BaseModel):

    spread: SpreadName = Field(
        default="three_card"
    )

    context: ContextName = Field(
        default="general"
    )

    seed: int | None = Field(
        default=None,
        description="Optional seed for reproducible testing."
    )


# =========================================================
# Interactive session position
# =========================================================

class TarotSessionPosition(BaseModel):

    index: int

    position: str

    revealed: bool = False


# =========================================================
# Interactive session response
# =========================================================

class TarotSessionResponse(BaseModel):

    session_id: str

    spread: str

    context: str

    card_count: int

    positions: list[TarotSessionPosition]


# =========================================================
# Tarot card response
# =========================================================

class TarotCardResponse(BaseModel):

    card_id: int

    name: str

    arcana: str

    suit: str | None

    orientation: str

    keywords: list[str]

    meaning: str

    context: str

    context_meaning: str | None

    element: str | None

    planet: str | None

    zodiac: str | None

    number_numerology: int | None

    yes_no: str | None


# =========================================================
# Revealed card response
# =========================================================

class TarotRevealResponse(BaseModel):

    index: int

    position: str

    card: TarotCardResponse


# =========================================================
# Reading card response
# =========================================================

class TarotReadingCardResponse(BaseModel):

    position: str

    card: TarotCardResponse


# =========================================================
# Complete reading response
# =========================================================

class TarotReadingResponse(BaseModel):

    spread: str

    context: str

    card_count: int

    cards: list[TarotReadingCardResponse]

    reading_session_id: int | None = None

class TarotSaveReadingResponse(TarotReadingResponse):
    reading_session_id: int

class TarotSelectionSessionRequest(BaseModel):

    spread: SpreadName = Field(
        default="three_card"
    )

    context: ContextName = Field(
        default="general"
    )


class TarotAvailableCard(BaseModel):

    card_id: int
    name: str
    arcana: str
    suit: str | None


class TarotSelectionSessionResponse(BaseModel):

    session_id: str
    spread: str
    context: str
    card_count: int
    available_cards: list[TarotAvailableCard]


class TarotSelectCardRequest(BaseModel):

    card_id: int


class TarotSelectCardResponse(BaseModel):

    selected_count: int
    required_count: int
    card: TarotAvailableCard
