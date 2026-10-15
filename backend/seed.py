import json
from pymongo import MongoClient

# Connect to your local MongoDB server
client = MongoClient("mongodb://localhost:27017/")
db = client["lunara_db"]
collection = db["tarot_cards"]

# Clear existing data to prevent duplicates during testing
collection.delete_many({})

# Load the JSON dataset
with open("data/tarot-images.json", "r", encoding="utf-8") as file:
    data = json.load(file)
    # The dataset usually contains a 'cards' array at the root
    cards = data.get("cards", [])

if cards:
    collection.insert_many(cards)
    print(f"Successfully inserted {len(cards)} cards into MongoDB.")
else:
    print("No cards found in the JSON file.")