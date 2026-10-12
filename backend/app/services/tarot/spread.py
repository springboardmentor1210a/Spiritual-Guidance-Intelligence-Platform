from app.services.tarot.shuffle import draw_cards, create_hidden_deck


# Number of cards required for each spread
SPREADS = {
    "single_card": {
        "name": "Single Card",
        "card_count": 1,
        "positions": ["Guidance"]
    },
    "three_card": {
        "name": "Three Card",
        "card_count": 3,
        "positions": ["Past", "Present", "Future"]
    },
    "relationship": {
        "name": "Relationship",
        "card_count": 3,
        "positions": ["You", "Other Person", "Relationship"]
    },
    "career": {
        "name": "Career",
        "card_count": 3,
        "positions": ["Current Situation", "Challenge", "Career Direction"]
    },
    "celtic_cross": {
        "name": "Celtic Cross",
        "card_count": 10,
        "positions": [
            "Present Situation",
            "Challenge",
            "Past",
            "Future",
            "Above",
            "Below",
            "Advice",
            "External Influences",
            "Hopes and Fears",
            "Outcome"
        ]
    },
    "life_path": {
        "name": "Life Path",
        "card_count": 3,
        "positions": ["Life Direction", "Growth", "Future Potential"]
    }
}


def get_available_spreads():
    """
    Return the list of available Tarot spreads.
    """
    return SPREADS


def generate_spread(spread_type: str):
    """
    Generate a Tarot spread by randomly drawing
    the required number of cards.
    """

    if spread_type not in SPREADS:
        raise ValueError(
            f"Unknown spread type: {spread_type}. "
            f"Available spreads: {list(SPREADS.keys())}"
        )

    spread = SPREADS[spread_type]

    cards = draw_cards(spread["card_count"])

    result = []

    for position, card in zip(spread["positions"], cards):
        result.append({
            "position": position,
            "card": card
        })

    return {
        "spread_type": spread_type,
        "spread_name": spread["name"],
        "card_count": spread["card_count"],
        "cards": result
    }

def create_selection_deck(spread_type: str):
    """
    Create a shuffled hidden deck for user card selection.

    The frontend receives only card positions.
    Actual Tarot card information remains on the backend.
    """

    if spread_type not in SPREADS:
        raise ValueError(
            f"Unknown spread type: {spread_type}. "
            f"Available spreads: {list(SPREADS.keys())}"
        )

    spread = SPREADS[spread_type]

    hidden_deck = create_hidden_deck()

    return {
        "spread_type": spread_type,
        "spread_name": spread["name"],
        "card_count": spread["card_count"],
        "positions": spread["positions"],
        "available_cards": hidden_deck["cards"],
        "backend_cards": hidden_deck["backend_cards"]
    }