"""
Tarot Reading Engine

Responsibilities:
- Load the 78-card tarot dataset
- Manage the deck
- Shuffle the deck
- Create interactive reading sessions
- Draw cards
- Support required spreads
- Support upright/reversed orientation
- Interpret cards using cards.json
- Generate complete tarot readings
"""

import json
import random
import uuid
from pathlib import Path
from typing import Any



# =========================================================
# Dataset
# =========================================================

CARDS_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "cards.json"
)


# =========================================================
# Spread definitions
# =========================================================

SPREADS = {
    "single_card": [
        "Guidance"
    ],

    "three_card": [
        "Past",
        "Present",
        "Future"
    ],

    "relationship": [
        "You",
        "The Other Person",
        "Relationship Energy"
    ],

    "career": [
        "Current Career",
        "Challenge",
        "Career Guidance"
    ],

    "celtic_cross": [
        "Present Situation",
        "Challenge",
        "Foundation",
        "Past",
        "Possible Future",
        "Near Future",
        "Your Approach",
        "External Influences",
        "Hopes and Fears",
        "Outcome"
    ],

    "life_path": [
        "Current Path",
        "Past Influence",
        "Life Lesson",
        "Challenge",
        "Opportunity",
        "Guidance",
        "Potential Direction"
    ],
}


# =========================================================
# Tarot Engine
# =========================================================

class TarotEngine:

    def __init__(self):
        self.cards = self._load_cards()

        # -------------------------------------------------
        # Interactive reading sessions
        #
        # This stores the shuffled deck and selected
        # orientations for each active reading.
        #
        # For the current prototype this is kept in memory.
        # A production version can later move this to
        # PostgreSQL/Redis.
        # -------------------------------------------------

        self.sessions: dict[str, dict[str, Any]] = {}

    # -----------------------------------------------------
    # Load cards
    # -----------------------------------------------------

    def _load_cards(self) -> list[dict[str, Any]]:

        if not CARDS_PATH.exists():
            raise FileNotFoundError(
                f"Tarot dataset not found: {CARDS_PATH}"
            )

        with open(
            CARDS_PATH,
            "r",
            encoding="utf-8"
        ) as file:

            cards = json.load(file)

        if not isinstance(cards, list):
            raise ValueError(
                "cards.json must contain a list of cards."
            )

        if len(cards) != 78:
            raise ValueError(
                f"Expected 78 tarot cards, "
                f"found {len(cards)}."
            )

        return cards

    # -----------------------------------------------------
    # Get card by ID
    # -----------------------------------------------------

    def get_card(
        self,
        card_id: int
    ) -> dict[str, Any]:

        for card in self.cards:

            if card["id"] == card_id:
                return card

        raise ValueError(
            f"Card with id {card_id} not found."
        )

    # -----------------------------------------------------
    # Find card by name
    # -----------------------------------------------------

    def find_card(
        self,
        name: str
    ) -> dict[str, Any] | None:

        name = name.strip().lower()

        for card in self.cards:

            if card["name"].lower() == name:
                return card

        return None

    # -----------------------------------------------------
    # Create shuffled deck
    # -----------------------------------------------------

    def create_deck(
        self,
        rng: random.Random | None = None
    ) -> list[dict[str, Any]]:

        deck = self.cards.copy()

        if rng is None:
            rng = random.Random()

        rng.shuffle(deck)

        return deck

    # -----------------------------------------------------
    # Determine orientation
    # -----------------------------------------------------

    def determine_orientation(
        self,
        rng: random.Random | None = None
    ) -> str:

        if rng is None:
            rng = random.Random()

        return rng.choice(
            [
                "upright",
                "reversed"
            ]
        )

    # -----------------------------------------------------
    # Interpret card
    # -----------------------------------------------------

    def interpret_card(
        self,
        card: dict[str, Any],
        orientation: str = "upright",
        context: str = "general"
    ) -> dict[str, Any]:

        orientation = orientation.lower().strip()
        context = context.lower().strip()

        # -------------------------------------------------
        # Validate orientation
        # -------------------------------------------------

        if orientation not in {
            "upright",
            "reversed"
        }:
            raise ValueError(
                "Orientation must be "
                "'upright' or 'reversed'."
            )

        # -------------------------------------------------
        # General interpretation
        # -------------------------------------------------

        if orientation == "upright":

            keywords = card.get(
                "keywords_upright",
                []
            )

            meaning = card.get(
                "meaning_upright",
                ""
            )

        else:

            keywords = card.get(
                "keywords_reversed",
                []
            )

            meaning = card.get(
                "meaning_reversed",
                ""
            )

        # -------------------------------------------------
        # Context-specific interpretation
        # -------------------------------------------------

        context_meaning = None

        if context in {
            "love",
            "career",
            "mood",
            "spiritual"
        }:

            if orientation == "upright":

                context_meaning = card.get(
                    context
                )

            else:

                context_meaning = card.get(
                    f"{context}_reversed"
                )

        # -------------------------------------------------
        # Yes / No
        # -------------------------------------------------

        if orientation == "upright":

            yes_no = card.get(
                "yes_no"
            )

        else:

            yes_no = card.get(
                "yes_no_reversed"
            )

        # -------------------------------------------------
        # Return structured interpretation
        # -------------------------------------------------

        return {

            "card_id": card["id"],

            "name": card["name"],

            "arcana": card["arcana"],

            "suit": card.get("suit"),

            "orientation": orientation,

            "keywords": keywords,

            "meaning": meaning,

            "context": context,

            "context_meaning": context_meaning,

            "element": card.get("element"),

            "planet": card.get("planet"),

            "zodiac": card.get("zodiac"),

            "number_numerology": card.get(
                "number_numerology"
            ),

            "yes_no": yes_no,
        }

    # =====================================================
    # INTERACTIVE READING SESSION
    # =====================================================

    # -----------------------------------------------------
    # Start interactive session
    # -----------------------------------------------------

    def start_session(
        self,
        spread_name: str,
        context: str = "general",
        seed: int | None = None
    ) -> dict[str, Any]:

        spread_name = spread_name.lower().strip()
        context = context.lower().strip()

        # -------------------------------------------------
        # Validate spread
        # -------------------------------------------------

        if spread_name not in SPREADS:

            raise ValueError(
                f"Unknown spread '{spread_name}'. "
                f"Available spreads: "
                f"{', '.join(SPREADS.keys())}"
            )

        # -------------------------------------------------
        # Validate context
        # -------------------------------------------------

        if context not in {
            "general",
            "love",
            "career",
            "mood",
            "spiritual"
        }:

            raise ValueError(
                f"Unknown context '{context}'."
            )

        positions = SPREADS[spread_name]

        # -------------------------------------------------
        # Create local random generator
        #
        # A seed is optional and only useful for testing.
        # Normal user readings remain random.
        # -------------------------------------------------

        rng = random.Random(seed)

        # -------------------------------------------------
        # Shuffle ONE deck
        # -------------------------------------------------

        deck = self.create_deck(rng)

        # -------------------------------------------------
        # Create orientation for every required card.
        #
        # The orientation is decided when the session
        # begins, not when the user clicks.
        # -------------------------------------------------

        selected_cards = []

        for index, position in enumerate(positions):

            card = deck[index]

            orientation = self.determine_orientation(
                rng
            )

            selected_cards.append(
                {
                    "index": index,
                    "position": position,
                    "card_id": card["id"],
                    "orientation": orientation,
                    "revealed": False,
                }
            )

        # -------------------------------------------------
        # Generate unique session ID
        # -------------------------------------------------

        session_id = str(uuid.uuid4())

        # -------------------------------------------------
        # Store session
        # -------------------------------------------------

        self.sessions[session_id] = {
            "session_id": session_id,
            "spread": spread_name,
            "context": context,
            "cards": selected_cards,
        }

        # -------------------------------------------------
        # Return ONLY hidden card positions.
        #
        # We intentionally do not return:
        # - card IDs
        # - card names
        # - orientation
        # - interpretation
        #
        # The frontend only knows that a card exists
        # at each position.
        # -------------------------------------------------

        return {
            "session_id": session_id,
            "spread": spread_name,
            "context": context,
            "card_count": len(selected_cards),
            "positions": [
                {
                    "index": item["index"],
                    "position": item["position"],
                    "revealed": False,
                }
                for item in selected_cards
            ],
        }

    # -----------------------------------------------------
    # Reveal one card
    # -----------------------------------------------------

    def reveal_card(
        self,
        session_id: str,
        index: int
    ) -> dict[str, Any]:

        # -------------------------------------------------
        # Find session
        # -------------------------------------------------

        session = self.sessions.get(session_id)

        if session is None:

            raise ValueError(
                "Tarot reading session not found "
                "or has expired."
            )

        # -------------------------------------------------
        # Validate index
        # -------------------------------------------------

        cards = session["cards"]

        if index < 0 or index >= len(cards):

            raise ValueError(
                f"Invalid card position: {index}"
            )

        selected = cards[index]

        # -------------------------------------------------
        # Prevent revealing the same position twice
        # -------------------------------------------------

        if selected["revealed"]:

            raise ValueError(
                "This card has already been revealed."
            )

        # -------------------------------------------------
        # Get actual dataset card
        # -------------------------------------------------

        card = self.get_card(
            selected["card_id"]
        )

        # -------------------------------------------------
        # Generate interpretation
        # -------------------------------------------------

        interpretation = self.interpret_card(
            card=card,
            orientation=selected["orientation"],
            context=session["context"]
        )

        # -------------------------------------------------
        # Mark as revealed
        # -------------------------------------------------

        selected["revealed"] = True

        # -------------------------------------------------
        # Return revealed card
        # -------------------------------------------------

        return {
            "index": index,
            "position": selected["position"],
            "card": interpretation,
        }

    # -----------------------------------------------------
    # Check whether session is complete
    # -----------------------------------------------------

    def is_session_complete(
        self,
        session_id: str
    ) -> bool:

        session = self.sessions.get(session_id)

        if session is None:

            raise ValueError(
                "Tarot reading session not found "
                "or has expired."
            )

        return all(
            card["revealed"]
            for card in session["cards"]
        )

    # -----------------------------------------------------
    # Get completed session
    # -----------------------------------------------------

    def get_session_reading(
        self,
        session_id: str
    ) -> dict[str, Any]:

        session = self.sessions.get(session_id)

        if session is None:

            raise ValueError(
                "Tarot reading session not found "
                "or has expired."
            )

        # -------------------------------------------------
        # Make sure every card was revealed
        # -------------------------------------------------

        if not all(
            card["revealed"]
            for card in session["cards"]
        ):

            raise ValueError(
                "Reading is not complete. "
                "Reveal all cards first."
            )

        reading = []

        for selected in session["cards"]:

            card = self.get_card(
                selected["card_id"]
            )

            interpretation = self.interpret_card(
                card=card,
                orientation=selected["orientation"],
                context=session["context"]
            )

            reading.append(
                {
                    "position": selected["position"],
                    "card": interpretation,
                }
            )

        return {
            "spread": session["spread"],
            "context": session["context"],
            "card_count": len(reading),
            "cards": reading,
        }

    # =====================================================
    # SELECTION SESSION API
    # =====================================================

    def create_selection_session(
        self,
        spread_name: str,
        context: str = "general"
    ) -> dict[str, Any]:

        spread_name = spread_name.lower().strip()
        context = context.lower().strip()

        if spread_name not in SPREADS:
            raise ValueError(
                f"Unknown spread '{spread_name}'."
            )

        if context not in {
            "general",
            "love",
            "career",
            "mood",
            "spiritual"
        }:
            raise ValueError(
                f"Unknown context '{context}'."
            )

        session_id = str(uuid.uuid4())

        # Store only the session information.
        # No cards are selected yet.
        self.sessions[session_id] = {
            "session_id": session_id,
            "spread": spread_name,
            "context": context,
            "selected_card_ids": [],
        }

        # Return ALL 78 cards as selectable cards.
        available_cards = []

        for card in self.cards:
            available_cards.append({
                "card_id": card["id"],
                "name": card["name"],
                "arcana": card["arcana"],
                "suit": card.get("suit"),
            })

        return {
            "session_id": session_id,
            "spread": spread_name,
            "context": context,
            "card_count": len(SPREADS[spread_name]),
            "available_cards": available_cards,
        }

    def select_card(
        self,
        session_id: str,
        card_id: int
    ) -> dict[str, Any]:

        session = self.sessions.get(session_id)

        if session is None:
            raise ValueError(
                "Tarot session not found."
            )

        card = self.get_card(card_id)

        selected = session["selected_card_ids"]

        # Prevent selecting the same card twice.
        if card_id in selected:
            raise ValueError(
                "This card has already been selected."
            )

        required_count = len(
            SPREADS[session["spread"]]
        )

        if len(selected) >= required_count:
            raise ValueError(
                f"You can select only {required_count} cards "
                f"for this spread."
            )

        selected.append(card_id)

        session.pop("generated_reading", None)

        return {
            "selected_count": len(selected),
            "required_count": required_count,
            "card": {
                "card_id": card["id"],
                "name": card["name"],
                "arcana": card["arcana"],
                "suit": card.get("suit"),
            },
        }

    def remove_selected_card(
        self,
        session_id: str,
        card_id: int
    ) -> dict[str, Any]:

        session = self.sessions.get(session_id)

        if session is None:
            raise ValueError(
                "Tarot session not found."
            )

        selected = session["selected_card_ids"]

        if card_id not in selected:
            raise ValueError(
                "This card is not selected."
            )

        selected.remove(card_id)

        session.pop("generated_reading", None)

        return {
            "selected_count": len(selected),
            "required_count": len(
                SPREADS[session["spread"]]
            ),
        }

    def generate_selected_reading(
        self,
        session_id: str
    ) -> dict[str, Any]:

        session = self.sessions.get(session_id)

        if session is None:
            raise ValueError(
                "Tarot session not found."
            )
        if "generated_reading" in session:
            return session["generated_reading"]

        selected_ids = session["selected_card_ids"]

        positions = SPREADS[session["spread"]]

        if len(selected_ids) != len(positions):
            raise ValueError(
                f"Select exactly {len(positions)} cards "
                f"before generating the reading."
            )

        # A separate RNG is used only for orientation.
        # The user's card choice itself is never changed.
        rng = random.Random()

        reading = []

        for position, card_id in zip(
            positions,
            selected_ids
        ):

            card = self.get_card(card_id)

            orientation = self.determine_orientation(
                rng
            )

            interpretation = self.interpret_card(
                card=card,
                orientation=orientation,
                context=session["context"]
            )

            reading.append({
                "position": position,
                "card": interpretation,
            })

        return {
            "spread": session["spread"],
            "context": session["context"],
            "card_count": len(reading),
            "cards": reading,
        }
        session["generated_reading"] = result

        return result

    # =====================================================
    # ORIGINAL DRAWING API
    # =====================================================
 
    # -----------------------------------------------------
    # Draw cards
    #
    # Kept for compatibility with the original engine.
    # -----------------------------------------------------

    def draw_cards(
        self,
        spread_name: str,
        context: str = "general",
        seed: int | None = None
    ) -> list[dict[str, Any]]:

        spread_name = spread_name.lower().strip()

        if spread_name not in SPREADS:

            raise ValueError(
                f"Unknown spread '{spread_name}'. "
                f"Available spreads: "
                f"{', '.join(SPREADS.keys())}"
            )

        positions = SPREADS[spread_name]

        rng = random.Random(seed)

        deck = self.create_deck(rng)

        reading = []

        for position, card in zip(
            positions,
            deck
        ):

            orientation = self.determine_orientation(
                rng
            )

            interpretation = self.interpret_card(
                card=card,
                orientation=orientation,
                context=context
            )

            reading.append(
                {
                    "position": position,
                    "card": interpretation
                }
            )

        return reading

    # -----------------------------------------------------
    # Generate complete reading
    #
    # Kept for compatibility with existing code/tests.
    # -----------------------------------------------------

    def generate_reading(
        self,
        spread_name: str,
        context: str = "general",
        seed: int | None = None
    ) -> dict[str, Any]:

        spread_name = spread_name.lower().strip()

        reading = self.draw_cards(
            spread_name=spread_name,
            context=context,
            seed=seed
        )

        return {
            "spread": spread_name,
            "context": context,
            "card_count": len(reading),
            "cards": reading
        }


# =========================================================
# Singleton engine
# =========================================================

tarot_engine = TarotEngine()