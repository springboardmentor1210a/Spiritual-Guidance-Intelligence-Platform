def generate_tarot_interpretation(card_name, meaning):
    """
    Generate a simple Tarot interpretation
    using the selected card and stored meaning.
    """

    if not card_name:
        return "Tarot card name is required."

    if not meaning:
        return "Meaning for this tarot card is not available."

    interpretation = (
        f"Your selected tarot card is {card_name}. "
        f"The card represents the following guidance: {meaning}"
    )

    return interpretation