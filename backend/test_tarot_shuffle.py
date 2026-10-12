from app.services.tarot.shuffle import shuffle_deck, draw_cards


# Test 1: Shuffle the complete deck
shuffled_deck = shuffle_deck()

print("Total cards after shuffle:", len(shuffled_deck))

print("\nFirst 5 shuffled cards:")
for card in shuffled_deck[:5]:
    print("-", card["name"])


# Test 2: Draw 3 cards
drawn_cards = draw_cards(3)

print("\n3 Drawn Cards:")

for card in drawn_cards:
    print("-", card["name"])


# Test 3: Make sure the cards are unique
card_names = [card["name"] for card in drawn_cards]

print("\nUnique cards:", len(set(card_names)) == len(card_names))