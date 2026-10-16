from app.services.tarot_engine import (
    TarotEngine,
    SPREADS
)


engine = TarotEngine()


print("\n========== TAROT ENGINE TEST ==========\n")

print(
    "Cards loaded:",
    len(engine.cards)
)

print(
    "Available spreads:"
)

for spread, positions in SPREADS.items():

    print(
        f"  {spread}: "
        f"{len(positions)} cards"
    )


print("\n========== THREE CARD READING ==========\n")


reading = engine.generate_reading(
    spread_name="three_card",
    context="career",
    seed=42
)


for item in reading["cards"]:

    card = item["card"]

    print(
        f"Position: {item['position']}"
    )

    print(
        f"Card: {card['name']}"
    )

    print(
        f"Orientation: {card['orientation']}"
    )

    print(
        f"Keywords: {', '.join(card['keywords'])}"
    )

    print(
        f"Meaning: {card['meaning']}"
    )

    print(
        f"Career meaning: "
        f"{card['context_meaning']}"
    )

    print("----------------------------------------")