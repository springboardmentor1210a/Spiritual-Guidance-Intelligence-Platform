import json


# ============================================================
# GENERATE OVERALL READING
# ============================================================

def generate_overall_reading(
    palm_reading=None,
    tarot_card=None,
    tarot_reading=None
):
    """
    Combines Palmistry and Tarot information
    into one personalized report.

    Compatible with the current database models:
    - PalmReading
    - TarotReading
    - selected_cards JSON
    """

    parts = []

    # ========================================================
    # PALMISTRY SECTION
    # ========================================================

    if palm_reading:

        palm_text = []

        # Palm detection
        if getattr(palm_reading, "palm_detected", None):
            palm_text.append(
                "Palm Detection: Detected"
            )

        # Detection confidence
        if getattr(
            palm_reading,
            "detection_confidence",
            None
        ) is not None:

            palm_text.append(
                f"Detection Confidence: "
                f"{palm_reading.detection_confidence:.2f}%"
            )

        # Analysis confidence
        if getattr(
            palm_reading,
            "analysis_confidence",
            None
        ) is not None:

            palm_text.append(
                f"Analysis Confidence: "
                f"{palm_reading.analysis_confidence:.2f}%"
            )

        # Life Line
        if palm_reading.life_line:

            palm_text.append(
                f"Life Line: "
                f"{palm_reading.life_line}"
            )

        # Heart Line
        if palm_reading.heart_line:

            palm_text.append(
                f"Heart Line: "
                f"{palm_reading.heart_line}"
            )

        # Head Line
        if palm_reading.head_line:

            palm_text.append(
                f"Head Line: "
                f"{palm_reading.head_line}"
            )

        # Fate Line
        if palm_reading.fate_line:

            palm_text.append(
                f"Fate Line: "
                f"{palm_reading.fate_line}"
            )

        # Other Features
        if palm_reading.other_features:

            palm_text.append(
                f"Other Features: "
                f"{palm_reading.other_features}"
            )

        # AI Interpretation
        if palm_reading.interpretation:

            palm_text.append(
                "Palm Interpretation:\n"
                + str(palm_reading.interpretation)
            )

        # Personalized Guidance
        if palm_reading.personalized_guidance:

            palm_text.append(
                "Palmistry Personalized Guidance:\n"
                + str(
                    palm_reading.personalized_guidance
                )
            )

        if palm_text:

            parts.append(
                "PALMISTRY ANALYSIS\n"
                + "\n".join(palm_text)
            )


    # ========================================================
    # TAROT SECTION
    # ========================================================

    if tarot_reading:

        tarot_text = []

        # Reading type
        if tarot_reading.reading_type:

            tarot_text.append(
                f"Reading Type: "
                f"{tarot_reading.reading_type}"
            )

        # User question
        if tarot_reading.question:

            tarot_text.append(
                f"Question: "
                f"{tarot_reading.question}"
            )

        # ----------------------------------------------------
        # SELECTED TAROT CARDS
        # ----------------------------------------------------

        selected_cards = []

        if tarot_reading.selected_cards:

            try:

                selected_cards = json.loads(
                    tarot_reading.selected_cards
                )

            except (
                json.JSONDecodeError,
                TypeError
            ):

                selected_cards = []


        if isinstance(
            selected_cards,
            list
        ):

            for index, card in enumerate(
                selected_cards,
                start=1
            ):

                if isinstance(
                    card,
                    dict
                ):

                    card_name = (
                        card.get("card_name")
                        or card.get("name")
                        or "Unknown Card"
                    )

                    meaning = (
                        card.get("meaning")
                        or ""
                    )

                    position = (
                        card.get("position")
                        or ""
                    )

                    card_text = (
                        f"Card {index}: "
                        f"{card_name}"
                    )

                    if position:

                        card_text += (
                            f" ({position})"
                        )

                    if meaning:

                        card_text += (
                            f"\nMeaning: {meaning}"
                        )

                    tarot_text.append(
                        card_text
                    )

                else:

                    tarot_text.append(
                        f"Card {index}: "
                        f"{str(card)}"
                    )


        # ----------------------------------------------------
        # OPTIONAL SINGLE TAROT CARD
        # ----------------------------------------------------

        if tarot_card:

            card_name = (
                getattr(
                    tarot_card,
                    "name",
                    None
                )
                or getattr(
                    tarot_card,
                    "card_name",
                    None
                )
                or "Unknown Card"
            )

            tarot_text.append(
                f"Tarot Card: {card_name}"
            )

            meaning = getattr(
                tarot_card,
                "meaning",
                None
            )

            if meaning:

                tarot_text.append(
                    f"Card Meaning: {meaning}"
                )


        # ----------------------------------------------------
        # TAROT INTERPRETATION
        # ----------------------------------------------------

        if tarot_reading.interpretation:

            tarot_text.append(
                "Tarot Interpretation:\n"
                + str(
                    tarot_reading.interpretation
                )
            )


        # ----------------------------------------------------
        # TAROT PERSONALIZED GUIDANCE
        # ----------------------------------------------------

        if tarot_reading.personalized_guidance:

            tarot_text.append(
                "Tarot Personalized Guidance:\n"
                + str(
                    tarot_reading.personalized_guidance
                )
            )


        if tarot_text:

            parts.append(
                "TAROT ANALYSIS\n"
                + "\n".join(tarot_text)
            )


    # ========================================================
    # CHECK DATA
    # ========================================================

    if not parts:

        return (
            "No palmistry or tarot information "
            "is available."
        )


    # ========================================================
    # OVERALL SYNTHESIS
    # ========================================================

    overall = "\n\n".join(parts)


    overall += """

OVERALL GUIDANCE

The palmistry section provides information based on
the detected palm features and generated interpretation.

The tarot section provides symbolic information based
on the selected tarot cards and generated interpretation.

Together, these results provide a reflective and
entertainment-oriented spiritual reading.

Tarot and palmistry readings should not be considered
scientific predictions or guaranteed future outcomes.
"""


    return overall


# ============================================================
# GET REPORT TYPE
# ============================================================

def get_report_type(
    palm_reading=None,
    tarot_card=None,
    tarot_reading=None
):
    """
    Determines the type of report based on
    the available Palmistry and Tarot readings.
    """

    has_palmistry = (
        palm_reading is not None
    )

    has_tarot = (
        tarot_reading is not None
        or tarot_card is not None
    )


    if has_palmistry and has_tarot:

        return "Palmistry and Tarot"


    if has_palmistry:

        return "Palmistry"


    if has_tarot:

        return "Tarot"


    return "General"