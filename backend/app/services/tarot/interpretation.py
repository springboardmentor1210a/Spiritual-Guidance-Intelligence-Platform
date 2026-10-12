from app.services.tarot.deck import get_card_by_name


def interpret_card(
    card_name: str,
    orientation: str = "upright"
):
    """
    Interpret a single Tarot card.

    Application orientation:
        upright
        reversed

    Dataset orientation:
        light
        shadow

    Mapping:
        upright  -> light
        reversed -> shadow
    """

    card = get_card_by_name(card_name)

    if card is None:
        raise ValueError(
            f"Tarot card not found: {card_name}"
        )

    if orientation not in ["upright", "reversed"]:
        raise ValueError(
            "Orientation must be either "
            "'upright' or 'reversed'."
        )

    meanings = card.get("meanings", {})

    dataset_orientation = (
        "light"
        if orientation == "upright"
        else "shadow"
    )

    meaning = meanings.get(
        dataset_orientation,
        []
    )

    return {
        "name": card.get("name"),
        "number": card.get("number"),
        "arcana": card.get("arcana"),
        "suit": card.get("suit"),
        "image": card.get("image"),
        "keywords": card.get(
            "keywords",
            []
        ),
        "orientation": orientation,
        "meaning": meaning,
        "fortune_telling": card.get(
            "fortune_telling",
            []
        )
    }


def interpret_spread_card(
    card: dict,
    position: str,
    orientation: str = "upright"
):
    """
    Interpret a Tarot card according to
    its position within a spread.
    """

    card_name = card.get("name")

    if not card_name:
        raise ValueError(
            "Card name is missing."
        )

    interpretation = interpret_card(
        card_name=card_name,
        orientation=orientation
    )

    interpretation["position"] = position

    interpretation["image"] = (
        card.get("image")
        or card.get("img")
        or ""
    )

    return interpretation