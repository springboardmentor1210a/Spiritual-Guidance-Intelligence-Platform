import random
from app.services.tarot.deck import get_all_cards


def shuffle_deck():
    """
    Load the complete Tarot deck and return a randomized copy.
    """

    cards = get_all_cards()

    # Create a copy so the original dataset is never modified
    shuffled_cards = cards.copy()

    # Randomly shuffle the copied deck
    random.shuffle(shuffled_cards)

    return shuffled_cards


def draw_cards(number_of_cards: int = 1):
    """
    Shuffle the Tarot deck and draw the requested number of cards.
    """

    if number_of_cards < 1:
        raise ValueError("Number of cards must be at least 1.")

    cards = shuffle_deck()

    if number_of_cards > len(cards):
        raise ValueError(
            f"Cannot draw {number_of_cards} cards. "
            f"The deck contains only {len(cards)} cards."
        )

    return cards[:number_of_cards]


def create_hidden_deck():
    """
    Create a shuffled Tarot deck for user selection.

    The actual card information stays on the backend.
    The frontend should only receive the number of
    available face-down cards.
    """

    cards = shuffle_deck()

    hidden_deck = []

    for index, card in enumerate(cards):
        hidden_deck.append({
            "card_index": index,
            "selected": False
        })

    return {
        "cards": hidden_deck,
        "backend_cards": cards
    }