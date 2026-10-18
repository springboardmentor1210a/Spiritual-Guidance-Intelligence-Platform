from database.database import SessionLocal
from database.models import TarotCard


tarot_cards = [

    # =========================
    # MAJOR ARCANA - 22 CARDS
    # =========================

    {
        "card_name": "The Fool",
        "card_number": 0,
        "meaning": "New beginnings, freedom, adventure, and taking a leap of faith."
    },
    {
        "card_name": "The Magician",
        "card_number": 1,
        "meaning": "Skill, confidence, creativity, and the ability to turn ideas into reality."
    },
    {
        "card_name": "The High Priestess",
        "card_number": 2,
        "meaning": "Intuition, mystery, inner wisdom, and trusting your instincts."
    },
    {
        "card_name": "The Empress",
        "card_number": 3,
        "meaning": "Growth, creativity, abundance, care, and nurturing energy."
    },
    {
        "card_name": "The Emperor",
        "card_number": 4,
        "meaning": "Authority, stability, leadership, discipline, and structure."
    },
    {
        "card_name": "The Hierophant",
        "card_number": 5,
        "meaning": "Tradition, learning, guidance, values, and spiritual wisdom."
    },
    {
        "card_name": "The Lovers",
        "card_number": 6,
        "meaning": "Love, relationships, harmony, choices, and meaningful connections."
    },
    {
        "card_name": "The Chariot",
        "card_number": 7,
        "meaning": "Determination, control, ambition, progress, and victory."
    },
    {
        "card_name": "Strength",
        "card_number": 8,
        "meaning": "Courage, patience, inner strength, confidence, and compassion."
    },
    {
        "card_name": "The Hermit",
        "card_number": 9,
        "meaning": "Reflection, solitude, self-discovery, and seeking inner wisdom."
    },
    {
        "card_name": "Wheel of Fortune",
        "card_number": 10,
        "meaning": "Change, cycles, opportunity, destiny, and unexpected developments."
    },
    {
        "card_name": "Justice",
        "card_number": 11,
        "meaning": "Fairness, truth, responsibility, balance, and making wise decisions."
    },
    {
        "card_name": "The Hanged Man",
        "card_number": 12,
        "meaning": "Pause, patience, surrender, and seeing a situation from a new perspective."
    },
    {
        "card_name": "Death",
        "card_number": 13,
        "meaning": "Transformation, endings, renewal, and the beginning of a new phase."
    },
    {
        "card_name": "Temperance",
        "card_number": 14,
        "meaning": "Balance, harmony, patience, moderation, and healing."
    },
    {
        "card_name": "The Devil",
        "card_number": 15,
        "meaning": "Temptation, attachment, unhealthy patterns, and the need for awareness."
    },
    {
        "card_name": "The Tower",
        "card_number": 16,
        "meaning": "Sudden change, disruption, revelation, and breaking old structures."
    },
    {
        "card_name": "The Star",
        "card_number": 17,
        "meaning": "Hope, inspiration, healing, optimism, and renewed confidence."
    },
    {
        "card_name": "The Moon",
        "card_number": 18,
        "meaning": "Uncertainty, intuition, hidden information, dreams, and emotions."
    },
    {
        "card_name": "The Sun",
        "card_number": 19,
        "meaning": "Happiness, success, positivity, confidence, and achievement."
    },
    {
        "card_name": "Judgement",
        "card_number": 20,
        "meaning": "Reflection, awakening, important decisions, renewal, and self-evaluation."
    },
    {
        "card_name": "The World",
        "card_number": 21,
        "meaning": "Completion, achievement, success, fulfillment, and reaching a goal."
    },


    # =========================
    # WANDS - 14 CARDS
    # =========================

    {
        "card_name": "Ace of Wands",
        "card_number": 22,
        "meaning": "New inspiration, motivation, creativity, and exciting opportunities."
    },
    {
        "card_name": "Two of Wands",
        "card_number": 23,
        "meaning": "Planning, future decisions, ambition, and exploring possibilities."
    },
    {
        "card_name": "Three of Wands",
        "card_number": 24,
        "meaning": "Expansion, progress, preparation, and looking toward future opportunities."
    },
    {
        "card_name": "Four of Wands",
        "card_number": 25,
        "meaning": "Celebration, stability, achievement, happiness, and strong foundations."
    },
    {
        "card_name": "Five of Wands",
        "card_number": 26,
        "meaning": "Competition, disagreement, challenges, and learning through conflict."
    },
    {
        "card_name": "Six of Wands",
        "card_number": 27,
        "meaning": "Victory, recognition, success, confidence, and achievement."
    },
    {
        "card_name": "Seven of Wands",
        "card_number": 28,
        "meaning": "Defending your position, courage, persistence, and standing your ground."
    },
    {
        "card_name": "Eight of Wands",
        "card_number": 29,
        "meaning": "Fast progress, communication, movement, and rapid developments."
    },
    {
        "card_name": "Nine of Wands",
        "card_number": 30,
        "meaning": "Resilience, persistence, caution, and continuing despite difficulties."
    },
    {
        "card_name": "Ten of Wands",
        "card_number": 31,
        "meaning": "Responsibility, workload, pressure, and carrying too many burdens."
    },
    {
        "card_name": "Page of Wands",
        "card_number": 32,
        "meaning": "Curiosity, enthusiasm, creativity, exploration, and new ideas."
    },
    {
        "card_name": "Knight of Wands",
        "card_number": 33,
        "meaning": "Energy, adventure, confidence, passion, and taking bold action."
    },
    {
        "card_name": "Queen of Wands",
        "card_number": 34,
        "meaning": "Confidence, independence, creativity, warmth, and leadership."
    },
    {
        "card_name": "King of Wands",
        "card_number": 35,
        "meaning": "Leadership, vision, ambition, confidence, and taking initiative."
    },


    # =========================
    # CUPS - 14 CARDS
    # =========================

    {
        "card_name": "Ace of Cups",
        "card_number": 36,
        "meaning": "New emotions, love, compassion, happiness, and emotional beginnings."
    },
    {
        "card_name": "Two of Cups",
        "card_number": 37,
        "meaning": "Partnership, mutual attraction, harmony, friendship, and emotional connection."
    },
    {
        "card_name": "Three of Cups",
        "card_number": 38,
        "meaning": "Friendship, celebration, teamwork, happiness, and social connection."
    },
    {
        "card_name": "Four of Cups",
        "card_number": 39,
        "meaning": "Contemplation, boredom, emotional withdrawal, and reconsidering opportunities."
    },
    {
        "card_name": "Five of Cups",
        "card_number": 40,
        "meaning": "Disappointment, loss, regret, and focusing on what has gone wrong."
    },
    {
        "card_name": "Six of Cups",
        "card_number": 41,
        "meaning": "Memories, childhood, kindness, nostalgia, and reconnecting with the past."
    },
    {
        "card_name": "Seven of Cups",
        "card_number": 42,
        "meaning": "Choices, imagination, possibilities, dreams, and confusion."
    },
    {
        "card_name": "Eight of Cups",
        "card_number": 43,
        "meaning": "Moving on, leaving something behind, personal growth, and searching for meaning."
    },
    {
        "card_name": "Nine of Cups",
        "card_number": 44,
        "meaning": "Satisfaction, wishes, happiness, confidence, and emotional fulfillment."
    },
    {
        "card_name": "Ten of Cups",
        "card_number": 45,
        "meaning": "Family happiness, emotional harmony, love, peace, and fulfillment."
    },
    {
        "card_name": "Page of Cups",
        "card_number": 46,
        "meaning": "Emotional curiosity, creativity, kindness, intuition, and new feelings."
    },
    {
        "card_name": "Knight of Cups",
        "card_number": 47,
        "meaning": "Romance, emotional expression, imagination, and following the heart."
    },
    {
        "card_name": "Queen of Cups",
        "card_number": 48,
        "meaning": "Compassion, intuition, emotional maturity, empathy, and understanding."
    },
    {
        "card_name": "King of Cups",
        "card_number": 49,
        "meaning": "Emotional balance, wisdom, compassion, maturity, and calm leadership."
    },


    # =========================
    # SWORDS - 14 CARDS
    # =========================

    {
        "card_name": "Ace of Swords",
        "card_number": 50,
        "meaning": "Clarity, truth, new ideas, communication, and decisive action."
    },
    {
        "card_name": "Two of Swords",
        "card_number": 51,
        "meaning": "Indecision, difficult choices, balance, and needing more information."
    },
    {
        "card_name": "Three of Swords",
        "card_number": 52,
        "meaning": "Heartbreak, sadness, disappointment, and emotional pain."
    },
    {
        "card_name": "Four of Swords",
        "card_number": 53,
        "meaning": "Rest, recovery, reflection, peace, and taking a necessary break."
    },
    {
        "card_name": "Five of Swords",
        "card_number": 54,
        "meaning": "Conflict, tension, competition, and learning from disagreements."
    },
    {
        "card_name": "Six of Swords",
        "card_number": 55,
        "meaning": "Moving forward, transition, healing, and leaving difficulties behind."
    },
    {
        "card_name": "Seven of Swords",
        "card_number": 56,
        "meaning": "Strategy, independence, secrecy, caution, and thinking carefully."
    },
    {
        "card_name": "Eight of Swords",
        "card_number": 57,
        "meaning": "Feeling restricted, self-doubt, fear, and the need to change perspective."
    },
    {
        "card_name": "Nine of Swords",
        "card_number": 58,
        "meaning": "Worry, stress, anxiety, overthinking, and emotional pressure."
    },
    {
        "card_name": "Ten of Swords",
        "card_number": 59,
        "meaning": "Ending, release, difficult transition, and the possibility of a new beginning."
    },
    {
        "card_name": "Page of Swords",
        "card_number": 60,
        "meaning": "Curiosity, communication, observation, learning, and new information."
    },
    {
        "card_name": "Knight of Swords",
        "card_number": 61,
        "meaning": "Determination, quick action, ambition, confidence, and strong communication."
    },
    {
        "card_name": "Queen of Swords",
        "card_number": 62,
        "meaning": "Clarity, independence, honesty, intelligence, and good judgement."
    },
    {
        "card_name": "King of Swords",
        "card_number": 63,
        "meaning": "Logic, authority, wisdom, fairness, and rational decision-making."
    },


    # =========================
    # PENTACLES - 14 CARDS
    # =========================

    {
        "card_name": "Ace of Pentacles",
        "card_number": 64,
        "meaning": "New financial opportunity, stability, career growth, and practical beginnings."
    },
    {
        "card_name": "Two of Pentacles",
        "card_number": 65,
        "meaning": "Balance, flexibility, multitasking, and managing responsibilities."
    },
    {
        "card_name": "Three of Pentacles",
        "card_number": 66,
        "meaning": "Teamwork, skill, collaboration, learning, and professional growth."
    },
    {
        "card_name": "Four of Pentacles",
        "card_number": 67,
        "meaning": "Security, saving, stability, control, and attachment to material things."
    },
    {
        "card_name": "Five of Pentacles",
        "card_number": 68,
        "meaning": "Financial difficulty, insecurity, hardship, and seeking support."
    },
    {
        "card_name": "Six of Pentacles",
        "card_number": 69,
        "meaning": "Generosity, support, sharing, balance, and receiving help."
    },
    {
        "card_name": "Seven of Pentacles",
        "card_number": 70,
        "meaning": "Patience, investment, progress, evaluation, and waiting for results."
    },
    {
        "card_name": "Eight of Pentacles",
        "card_number": 71,
        "meaning": "Hard work, learning, practice,dedication,and improving skills."
    },
    {"card_name": "Nine of Pentacles",
        "card_number": 72,
        "meaning": "Independence, achievement, financial stability, confidence, and comfort."
    },
    {
        "card_name": "Ten of Pentacles",
        "card_number": 73,
        "meaning": "Long-term success, family stability, wealth, security, and legacy."
    },
    {
        "card_name": "Page of Pentacles",
        "card_number": 74,
        "meaning": "Learning, opportunity, ambition, practical goals, and new career possibilities."
    },
    {
        "card_name": "Knight of Pentacles",
        "card_number": 75,
        "meaning": "Responsibility, patience, reliability, steady progress, and hard work."
    },
    {
        "card_name": "Queen of Pentacles",
        "card_number": 76,
        "meaning": "Practicality, stability, care, comfort, and responsible management."
    },
    {
        "card_name": "King of Pentacles",
        "card_number": 77,
        "meaning": "Financial success, stability, leadership, responsibility, and achievement."
    },


    # =========================
    # DATASET EXTRA CLASS
    # =========================

    {
        "card_name": "card_back",
        "card_number": 78,
        "meaning": "Tarot card back image. No specific tarot interpretation."
    }
]


# =========================
# DATABASE SEEDING
# =========================

db = SessionLocal()

try:
    existing_names = {
        card.card_name
        for card in db.query(TarotCard).all()
    }

    added = 0

    for card_data in tarot_cards:

        if card_data["card_name"] not in existing_names:

            card = TarotCard(
                card_name=card_data["card_name"],
                card_number=card_data["card_number"],
                meaning=card_data["meaning"]
            )

            db.add(card)
            added += 1

    db.commit()

    total = db.query(TarotCard).count()

    print(f"Added {added} missing Tarot cards.")
    print(f"Total Tarot cards: {total}")

finally:
    db.close()