from app.services.tarot.reading import generate_reading


print("================================")
print("      TAROT READING TEST")
print("================================")


reading = generate_reading("three_card")


print("\nSpread:", reading["spread_name"])
print("Card Count:", reading["card_count"])
print("Orientation:", reading["orientation"])


print("\nReading:")

for card in reading["cards"]:

    print("\n----------------------------")

    print("Position:", card["position"])
    print("Card:", card["name"])
    print("Arcana:", card["arcana"])
    print("Keywords:", card["keywords"])

    print("\nMeaning:")

    for meaning in card["meaning"]:
        print("-", meaning)