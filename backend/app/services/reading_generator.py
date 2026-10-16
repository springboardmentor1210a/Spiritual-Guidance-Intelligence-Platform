"""
Combined Palmistry + Tarot Reading Generator

Responsibilities:
- Combine palm analysis and interpretation
- Combine Tarot reading results
- Generate a structured reading
- Provide an overall summary
- Keep palm and Tarot results separate
- Prepare data for FastAPI and frontend
"""

from typing import Any


class ReadingGenerator:

    # ---------------------------------------------------------
    # Generate palm section
    # ---------------------------------------------------------

    def generate_palm_section(
        self,
        palm_features: dict[str, Any],
        palm_interpretations: dict[str, Any] | list[dict[str, Any]],
    ) -> dict[str, Any]:

        return {
            "features": palm_features,
            "interpretations": palm_interpretations,
        }

    # ---------------------------------------------------------
    # Generate tarot section
    # ---------------------------------------------------------

    def generate_tarot_section(
        self,
        tarot_reading: dict[str, Any],
    ) -> dict[str, Any]:

        return {
            "spread": tarot_reading.get("spread"),
            "context": tarot_reading.get("context"),
            "card_count": tarot_reading.get("card_count"),
            "cards": tarot_reading.get("cards", []),
        }

    # ---------------------------------------------------------
    # Generate palm summary
    # ---------------------------------------------------------

    def generate_palm_summary(
        self,
        palm_interpretations: dict[str, Any] | list[dict[str, Any]],
    ) -> str:

        if isinstance(palm_interpretations, dict):
            interpretations = palm_interpretations.values()
        else:
            interpretations = palm_interpretations

        statements = []

        for item in interpretations:

            if not isinstance(item, dict):
                continue

            interpretation = item.get("interpretation")

            if isinstance(interpretation, list):
                statements.extend(interpretation)

            elif isinstance(interpretation, str):
                statements.append(interpretation)

        if not statements:
            return "Palm analysis has been completed."

        return " ".join(statements[:6])

    # ---------------------------------------------------------
    # Generate Tarot summary
    # ---------------------------------------------------------

    def generate_tarot_summary(
        self,
        tarot_reading: dict[str, Any],
    ) -> str:

        cards = tarot_reading.get("cards", [])

        statements = []

        for item in cards:

            card = item.get("card", {})

            if not card:
                continue

            position = item.get("position", "Reading")

            name = card.get("name", "Unknown card")
            orientation = card.get(
                "orientation",
                "upright"
            )

            meaning = card.get(
                "meaning",
                ""
            )

            if meaning:

                statements.append(
                    f"{position}: {name} "
                    f"({orientation}) — {meaning}"
                )

        if not statements:
            return "Tarot reading has been completed."

        return " ".join(statements)

    # ---------------------------------------------------------
    # Generate overall summary
    # ---------------------------------------------------------

    def generate_overall_summary(
        self,
        palm_summary: str,
        tarot_summary: str,
    ) -> str:

        return (
            "Your palm analysis identifies measurable "
            "features from the detected palm lines, while "
            "the Tarot reading provides symbolic "
            "interpretation based on the selected cards "
            "and their orientations. "
            f"Palm insight: {palm_summary} "
            f"Tarot insight: {tarot_summary}"
        )

    # ---------------------------------------------------------
    # Generate complete reading
    # ---------------------------------------------------------

    def generate_reading(
        self,
        palm_features: dict[str, Any],
        palm_interpretations: dict[str, Any] | list[dict[str, Any]],
        tarot_reading: dict[str, Any],
        user_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:

        user_context = user_context or {}

        palm_section = self.generate_palm_section(
            palm_features=palm_features,
            palm_interpretations=palm_interpretations,
        )

        tarot_section = self.generate_tarot_section(
            tarot_reading=tarot_reading,
        )

        palm_summary = self.generate_palm_summary(
            palm_interpretations=palm_interpretations,
        )

        tarot_summary = self.generate_tarot_summary(
            tarot_reading=tarot_reading,
        )

        overall_summary = self.generate_overall_summary(
            palm_summary=palm_summary,
            tarot_summary=tarot_summary,
        )

        return {
            "user_context": user_context,

            "palm_analysis": palm_section,

            "tarot_reading": tarot_section,

            "summary": {
                "palm": palm_summary,
                "tarot": tarot_summary,
                "overall": overall_summary,
            },

            "status": "completed",
        }


# ---------------------------------------------------------
# Singleton
# ---------------------------------------------------------

reading_generator = ReadingGenerator()