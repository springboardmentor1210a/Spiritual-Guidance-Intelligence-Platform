from app.services.tarot.spread import generate_spread
from app.services.tarot.interpretation import (
    interpret_spread_card
)


def _meaning_to_text(meaning):
    """
    Convert dataset meaning into readable text.
    """

    if isinstance(meaning, list):
        return " ".join(
            str(item)
            for item in meaning
        )

    if isinstance(meaning, str):
        return meaning

    return ""


def generate_overall_reading(
    spread_name: str,
    interpreted_cards: list
):
    """
    Generate a combined Tarot reading
    from all interpreted cards.

    This is a rule-based/template-based
    interpretation layer for the MVP.
    """

    if not interpreted_cards:
        return (
            "No cards were available for "
            "interpretation."
        )

    sections = []

    for card in interpreted_cards:

        position = card.get(
            "position",
            "Reading"
        )

        name = card.get(
            "name",
            "Unknown Card"
        )

        orientation = card.get(
            "orientation",
            "upright"
        )

        meaning = _meaning_to_text(
            card.get("meaning", [])
        )

        if not meaning:
            meaning = (
                "This card provides a theme "
                "for reflection in this position."
            )

        # Convert technical orientation
        # into readable text.
        orientation_text = (
            "upright"
            if orientation == "upright"
            else "reversed"
        )

        sections.append(
            f"{position}: {name} appears "
            f"{orientation_text}. {meaning}"
        )

    overall = (
        f"This {spread_name} reading brings "
        f"together {len(interpreted_cards)} "
        f"card{'s' if len(interpreted_cards) != 1 else ''}. "
        f"The cards should be considered together "
        f"as themes for reflection and personal insight."
        f"\n\n"
        + "\n\n".join(sections)
    )

    return overall


def generate_reading(
    spread_type: str,
    orientation: str = "upright"
):
    """
    Generate a complete Tarot reading.

    Steps:
    1. Generate the requested spread.
    2. Draw the required cards.
    3. Assign cards to spread positions.
    4. Interpret each card.
    5. Generate an overall reading.
    """

    # Validate orientation before processing.
    if orientation not in [
        "upright",
        "reversed"
    ]:
        raise ValueError(
            "Orientation must be either "
            "'upright' or 'reversed'."
        )

    spread = generate_spread(
        spread_type
    )

    interpreted_cards = []

    for item in spread["cards"]:

        interpretation = interpret_spread_card(
            card=item["card"],
            position=item["position"],
            orientation=orientation
        )

        interpreted_cards.append(
            interpretation
        )

    overall_reading = generate_overall_reading(
        spread_name=spread["spread_name"],
        interpreted_cards=interpreted_cards
    )

    return {
        "spread_type": spread["spread_type"],
        "spread_name": spread["spread_name"],
        "card_count": spread["card_count"],
        "orientation": orientation,
        "cards": interpreted_cards,
        "overall_reading": overall_reading
    }