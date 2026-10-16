from fastapi import APIRouter, Depends,HTTPException, status

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.services.tarot_reading_service import save_tarot_reading


from app.services.tarot_engine import tarot_engine



from app.schemas.tarot import (
    TarotReadingRequest,
    TarotReadingResponse,
    TarotSessionRequest,
    TarotSessionResponse,
    TarotRevealResponse,
)
from app.schemas.tarot import (
    TarotSelectionSessionRequest,
    TarotSelectionSessionResponse,
    TarotSelectCardRequest,
    TarotSelectCardResponse,
    TarotSaveReadingResponse,
)

router = APIRouter(
    prefix="/api/v1/tarot",
    tags=["Tarot"],
)


# =========================================================
# SPREADS
# =========================================================

@router.get("/spreads")
def get_spreads():
    """
    Return all supported Tarot spreads.
    """

    return {
        "spreads": {
            name: {
                "card_count": len(positions),
                "positions": positions,
            }
            for name, positions
            in tarot_engine_spreads().items()
        }
    }


def tarot_engine_spreads():
    """
    Access the spread definitions from the Tarot engine.
    """

    from app.services.tarot_engine import SPREADS

    return SPREADS


# =========================================================
# CARD COUNT
# =========================================================

@router.get("/cards/count")
def get_card_count():
    """
    Return the number of cards loaded from cards.json.
    """

    return {
        "card_count": len(tarot_engine.cards)
    }


# =========================================================
# GET SINGLE DATASET CARD
# =========================================================

@router.get("/cards/{card_id}")
def get_card(card_id: int):
    """
    Return a single Tarot card from the 78-card dataset.
    """

    try:

        card = tarot_engine.get_card(
            card_id
        )

        return {
            "card": card
        }

    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(exc)
        )


# =========================================================
# START INTERACTIVE TAROT SESSION
# =========================================================

@router.post(
    "/session",
    response_model=TarotSessionResponse
)
def start_tarot_session(
    request: TarotSessionRequest
):
    """
    Start an interactive Tarot reading.

    The backend creates and shuffles one deck and
    prepares the required cards.

    IMPORTANT:
    Card identities and interpretations are NOT
    returned at this stage.

    The frontend receives only face-down positions.
    """

    try:

        session = tarot_engine.start_session(
            spread_name=request.spread,
            context=request.context,
            seed=request.seed,
        )

        return session

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )


# =========================================================
# REVEAL CARD
# =========================================================

@router.post(
    "/session/{session_id}/reveal/{index}",
    response_model=TarotRevealResponse
)
def reveal_tarot_card(
    session_id: str,
    index: int
):
    """
    Reveal one selected card from an active Tarot session.
    """

    try:

        revealed = tarot_engine.reveal_card(
            session_id=session_id,
            index=index,
        )

        return revealed

    except ValueError as exc:

        message = str(exc)

        if "not found" in message.lower():

            status_code = 404

        else:

            status_code = 400

        raise HTTPException(
            status_code=status_code,
            detail=message
        )


# =========================================================
# COMPLETE READING
# =========================================================

@router.get(
    "/session/{session_id}/reading",
    response_model=TarotReadingResponse
)
def get_completed_reading(
    session_id: str
):
    """
    Return the complete interpretation after
    every card has been revealed.
    """

    try:

        reading = tarot_engine.get_session_reading(
            session_id
        )

        return reading

    except ValueError as exc:

        message = str(exc)

        if "not found" in message.lower():

            status_code = 404

        else:

            status_code = 400

        raise HTTPException(
            status_code=status_code,
            detail=message
        )


# =========================================================
# ORIGINAL READING ENDPOINT
# =========================================================

@router.post(
    "/reading",
    response_model=TarotReadingResponse
)
def generate_tarot_reading(
    request: TarotReadingRequest
):
    """
    Generate a complete Tarot reading immediately.

    This endpoint is kept for compatibility/testing.

    The interactive frontend will use /session instead.
    """

    try:

        reading = tarot_engine.generate_reading(
            spread_name=request.spread,
            context=request.context,
            seed=request.seed,
        )

        return reading

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )
@router.post(
    "/selection-session",
    response_model=TarotSelectionSessionResponse
)
def create_selection_session(
    request: TarotSelectionSessionRequest
):

    try:

        session = tarot_engine.create_selection_session(
            spread_name=request.spread,
            context=request.context,
        )

        return session

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )
@router.post(
    "/selection-session/{session_id}/select",
    response_model=TarotSelectCardResponse
)
def select_tarot_card(
    session_id: str,
    request: TarotSelectCardRequest
):

    try:

        result = tarot_engine.select_card(
            session_id=session_id,
            card_id=request.card_id,
        )

        return result

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )
@router.delete(
    "/selection-session/{session_id}/select/{card_id}"
)
def remove_tarot_card(
    session_id: str,
    card_id: int
):

    try:

        result = tarot_engine.remove_selected_card(
            session_id=session_id,
            card_id=card_id,
        )

        return result

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )
@router.get(
    "/selection-session/{session_id}/reading",
    response_model=TarotReadingResponse
)
def generate_selected_tarot_reading(
    session_id: str
):

    try:

        reading = tarot_engine.generate_selected_reading(
            session_id
        )

        return reading

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )
@router.post(
    "/selection-session/{session_id}/save",
    response_model=TarotSaveReadingResponse,
    status_code=status.HTTP_201_CREATED,
)
def save_selected_tarot_reading(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # Generate the completed Tarot interpretation
        reading = tarot_engine.generate_selected_reading(session_id)

        # Save it into PostgreSQL
        reading_session = save_tarot_reading(
            db=db,
            user_id=current_user.id,
            reading=reading,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )
    return {
        **reading,
        "reading_session_id": reading_session.id,
    }

  

    