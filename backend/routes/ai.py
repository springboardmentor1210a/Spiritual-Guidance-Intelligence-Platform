import json
import traceback

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import PalmReading, TarotReading
from auth import get_current_user
from personality import generate_personality


from ai_interpretation import (
    generate_ai_interpretation,
    generate_ai_interpretation_details,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Interpretation"]
)


@router.get("/interpret")
def generate_interpretation(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        # Get the logged-in user's latest palm reading.
        palm_reading = (
            db.query(PalmReading)
            .filter(PalmReading.user_id == current_user.id)
            .order_by(PalmReading.id.desc())
            .first()
        )

        # Get the logged-in user's latest tarot reading.
        tarot_reading = (
            db.query(TarotReading)
            .filter(TarotReading.user_id == current_user.id)
            .order_by(TarotReading.id.desc())
            .first()
        )

        if palm_reading is None and tarot_reading is None:
            return {
                "success": True,
                "message": "No readings available yet.",
                "source": "none",
                "interpretation": None,
                "details": None,
            }

        # Prepare palmistry features using existing model fields.
        palm_features = {}

        if palm_reading is not None:
            palm_features = {
                "heart_line": palm_reading.heart_line,
                "head_line": palm_reading.head_line,
                "life_line": palm_reading.life_line,
                "fate_line": palm_reading.fate_line,
            }

            # Read palm shape from other_features when available.
            other_features = getattr(
                palm_reading, "other_features", None
            )

            if isinstance(other_features, str):
                try:
                    other_features = json.loads(other_features)
                except (json.JSONDecodeError, TypeError):
                    other_features = {}

            if isinstance(other_features, dict):
                palm_shape = other_features.get("palm_shape")

                if palm_shape:
                    palm_features["palm_shape"] = palm_shape

        # Prepare tarot information.
        tarot_card = None
        tarot_meaning = None
        tarot_interpretation = None

        if tarot_reading is not None:
            tarot_interpretation = (
                tarot_reading.interpretation or ""
            )

            selected_cards = tarot_reading.selected_cards

            if isinstance(selected_cards, str):
                try:
                    selected_cards = json.loads(selected_cards)
                except (json.JSONDecodeError, TypeError):
                    selected_cards = [selected_cards]

            if isinstance(selected_cards, list):
                card_names = []

                for selected in selected_cards:
                    if isinstance(selected, dict):
                        card_name = (
                            selected.get("name")
                            or selected.get("card_name")
                        )

                        if card_name:
                            card_names.append(str(card_name))

                    elif isinstance(selected, str):
                        card_names.append(selected)

                if card_names:
                    tarot_card = ", ".join(card_names)

        # Generate the interpretation.
        interpretation = generate_ai_interpretation(
            palm_features=palm_features,
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning,
            tarot_interpretation=tarot_interpretation,
        )

        details = generate_ai_interpretation_details(
            palm_features=palm_features,
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning,
            tarot_interpretation=tarot_interpretation,
        )
        personality = generate_personality(
            palm_features=palm_features,
            tarot_card=tarot_card,
            tarot_meaning=tarot_meaning,
        )

        if palm_reading is not None and tarot_reading is not None:
            source = "palmistry_and_tarot"
        elif palm_reading is not None:
            source = "palmistry"
        else:
            source = "tarot"

        return {
            "success": True,
            "source": source,
            "interpretation": interpretation,
            "details": details,
            "personality":personality,
        }

    except Exception as exc:
        print("\n===== AI INTERPRETATION ERROR =====")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=(
                f"AI interpretation failed: "
                f"{type(exc).__name__}: {exc}"
            ),
        )