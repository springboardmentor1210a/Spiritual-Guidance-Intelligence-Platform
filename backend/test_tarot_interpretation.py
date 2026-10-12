from app.services.tarot.interpretation import (
    interpret_card,
    interpret_spread_card
)


# Test 1: Interpret a card
print("Testing The Fool:")

fool = interpret_card("The Fool")

print("Name:", fool["name"])
print("Number:", fool["number"])
print("Arcana:", fool["arcana"])
print("Keywords:", fool["keywords"])
print("Orientation:", fool["orientation"])

print("\nMeaning:")
for meaning in fool["meaning"]:
    print("-", meaning)


# Test 2: Shadow interpretation
print("\nTesting Shadow Meaning:")

fool_shadow = interpret_card(
    "The Fool",
    "shadow"
)

print("Orientation:", fool_shadow["orientation"])

for meaning in fool_shadow["meaning"]:
    print("-", meaning)


# Test 3: Card inside a spread
print("\nTesting Card + Spread Position:")

result = interpret_spread_card(
    fool,
    "Present",
    "light"
)

print("Card:", result["name"])
print("Position:", result["position"])
print("Meaning:")

for meaning in result["meaning"]:
    print("-", meaning)