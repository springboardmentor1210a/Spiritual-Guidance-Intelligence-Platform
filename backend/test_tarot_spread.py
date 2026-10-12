
from app.services.tarot.spread import (
    get_available_spreads,
    generate_spread
)


print("Available Tarot Spreads:")
for key, spread in get_available_spreads().items():
    print(
        f"- {key}: "
        f"{spread['name']} "
        f"({spread['card_count']} cards)"
    )


print("\nTesting Three Card Spread:")

result = generate_spread("three_card")

print("Spread:", result["spread_name"])
print("Card Count:", result["card_count"])

for item in result["cards"]:
    print(
        f"- {item['position']}: "
        f"{item['card']['name']}"
    )


print("\nTesting Celtic Cross:")

celtic = generate_spread("celtic_cross")

print("Spread:", celtic["spread_name"])
print("Card Count:", celtic["card_count"])

for item in celtic["cards"]:
    print(
        f"- {item['position']}: "
        f"{item['card']['name']}"
    )