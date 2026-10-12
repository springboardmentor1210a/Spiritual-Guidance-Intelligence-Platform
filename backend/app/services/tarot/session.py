import uuid
import random

from app.services.tarot.spread import create_selection_deck
from app.services.tarot.interpretation import interpret_spread_card
from app.services.tarot.reading import generate_overall_reading


# Temporary storage for active Tarot readings
tarot_sessions = {}


def create_tarot_session(spread_type: str):
    """
    Create a new Tarot reading session.

    The frontend receives only hidden card positions.
    The actual Tarot card information remains on the backend.
    """

    selection_deck = create_selection_deck(spread_type)

    reading_id = str(uuid.uuid4())

    tarot_sessions[reading_id] = {
        "spread_type": selection_deck["spread_type"],
        "spread_name": selection_deck["spread_name"],
        "card_count": selection_deck["card_count"],
        "positions": selection_deck["positions"],
        "backend_cards": selection_deck["backend_cards"],
        "selected_indices": []
    }

    return {
        "reading_id": reading_id,
        "spread_type": selection_deck["spread_type"],
        "spread_name": selection_deck["spread_name"],
        "card_count": selection_deck["card_count"],
        "positions": selection_deck["positions"],
        "available_cards": selection_deck["available_cards"]
    }


def get_tarot_session(reading_id: str):
    """
    Retrieve an existing Tarot session.
    """

    session = tarot_sessions.get(reading_id)

    if session is None:
        raise ValueError(
            "Tarot reading session not found."
        )

    return session


def select_tarot_cards(
    reading_id: str,
    selected_indices: list[int]
):
    """
    Validate, reveal and interpret the Tarot cards
    selected by the user.
    """

    session = get_tarot_session(reading_id)

    required_cards = session["card_count"]

    # -------------------------------------------------
    # Validate number of cards
    # -------------------------------------------------

    if len(selected_indices) != required_cards:
        raise ValueError(
            f"This spread requires exactly "
            f"{required_cards} cards."
        )

    # -------------------------------------------------
    # Prevent duplicate selections
    # -------------------------------------------------

    if len(set(selected_indices)) != len(selected_indices):
        raise ValueError(
            "The same card cannot be selected more than once."
        )

    # -------------------------------------------------
    # Validate card positions
    # -------------------------------------------------

    total_cards = len(session["backend_cards"])

    for index in selected_indices:

        if index < 0 or index >= total_cards:
            raise ValueError(
                f"Invalid card position: {index}"
            )

    # -------------------------------------------------
    # Save selected positions
    # -------------------------------------------------

    session["selected_indices"] = selected_indices

    # -------------------------------------------------
    # Reveal and interpret selected cards
    # -------------------------------------------------

    revealed_cards = []

    for position_index, card_index in enumerate(
        selected_indices
    ):

        card = session["backend_cards"][card_index]

        # Randomly determine orientation
        orientation = random.choice(
            ["upright", "reversed"]
        )

        # Get the spread position
        position = session["positions"][position_index]

        # -------------------------------------------------
        # Interpret the selected card
        # -------------------------------------------------

        interpretation = interpret_spread_card(
            card=card,
            position=position,
            orientation=orientation
        )

        # Add the original selected index
        interpretation["card_index"] = card_index

        # Make sure image is included
        interpretation["image"] = (
            card.get("image")
            or card.get("img")
            or card.get("image_url")
            or ""
        )

        revealed_cards.append(
            interpretation
        )

    # -------------------------------------------------
    # Generate overall reading
    # -------------------------------------------------

    overall_reading = generate_overall_reading(
        spread_name=session["spread_name"],
        interpreted_cards=revealed_cards
    )

    # -------------------------------------------------
    # Save results in session
    # -------------------------------------------------

    session["revealed_cards"] = revealed_cards

    session["overall_reading"] = overall_reading

    return session