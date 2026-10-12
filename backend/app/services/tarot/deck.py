import json
import os
from pathlib import Path

API_BASE_URL = os.getenv(
    "API_BASE_URL",
    "http://127.0.0.1:8000"
)


# Path to the Tarot JSON dataset
DATASET_PATH = (
    Path(__file__).resolve().parents[3]
    / "datasets"
    / "tarot"
    / "Tarot Deck"
    / "tarot-images.json"
)


def load_tarot_deck():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Tarot dataset not found at: {DATASET_PATH}"
        )

    with open(DATASET_PATH, "r", encoding="utf-8") as file:
        data = json.load(file)

    cards = data.get("cards", [])

    if not cards:
        raise ValueError("No Tarot cards found in the dataset.")

    for card in cards:
        image_name = card.get("img")

        if image_name:
            card["image"] = (
                f"{API_BASE_URL}/tarot/images/{image_name}"
            )

    return cards


def get_all_cards():
    """
    Return the complete Tarot deck.
    """
    return load_tarot_deck()


def get_card_by_name(card_name: str):
    """
    Find a Tarot card by its name.
    """

    cards = load_tarot_deck()

    for card in cards:
        if card.get("name", "").lower() == card_name.lower():
            return card

    return None


def get_card_names():
    """
    Return only the names of all Tarot cards.
    """

    cards = load_tarot_deck()

    return [card.get("name") for card in cards]