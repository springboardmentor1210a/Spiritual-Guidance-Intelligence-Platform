from app.services.tarot.deck import (
    get_all_cards,
    get_card_names,
    get_card_by_name
)


cards = get_all_cards()

print("Total cards:", len(cards))

print("\nFirst 5 cards:")
for name in get_card_names()[:5]:
    print("-", name)


fool = get_card_by_name("The Fool")

print("\nThe Fool:")
print("Name:", fool["name"])
print("Number:", fool["number"])
print("Arcana:", fool["arcana"])
print("Keywords:", fool["keywords"])
print("Light meanings:", fool["meanings"]["light"][:2])