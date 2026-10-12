from datetime import datetime
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    PageBreak,
)


def generate_tarot_report(reading: dict, output_path: str) -> str:
    """
    Generate a PDF report for a completed Tarot reading.

    Parameters:
        reading: Tarot reading dictionary
        output_path: Where the PDF should be saved

    Returns:
        Path to the generated PDF
    """

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(output_file),
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TarotTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "TarotHeading",
        parent=styles["Heading2"],
        spaceBefore=15,
        spaceAfter=10,
    )

    normal_style = ParagraphStyle(
        "TarotNormal",
        parent=styles["BodyText"],
        leading=16,
        spaceAfter=8,
    )

    story = []

    # -----------------------------
    # TITLE
    # -----------------------------

    story.append(
        Paragraph(
            "AI PALMISTRY & TAROT<br/>INTELLIGENCE PLATFORM",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "TAROT READING REPORT",
            heading_style,
        )
    )

    # -----------------------------
    # READING INFORMATION
    # -----------------------------

    spread_name = reading.get("spread_name", "Tarot Reading")
    card_count = reading.get("card_count", 0)

    story.append(
        Paragraph(
            f"<b>Reading Type:</b> {spread_name}",
            normal_style,
        )
    )

    story.append(
        Paragraph(
            f"<b>Number of Cards:</b> {card_count}",
            normal_style,
        )
    )

    story.append(
        Paragraph(
            f"<b>Date:</b> {datetime.now().strftime('%d %B %Y, %I:%M %p')}",
            normal_style,
        )
    )

    story.append(Spacer(1, 15))

    # -----------------------------
    # CARDS
    # -----------------------------

    cards = reading.get("cards", [])

    for index, card in enumerate(cards, start=1):

        position = card.get("position", f"Card {index}")
        name = card.get("name", "Unknown Card")
        orientation = card.get("orientation", "upright")
        arcana = card.get("arcana", "")
        suit = card.get("suit", "")

        story.append(
            Paragraph(
                f"Card {index}: {position}",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                f"<b>Card:</b> {name}",
                normal_style,
            )
        )

        story.append(
            Paragraph(
                f"<b>Orientation:</b> {orientation.title()}",
                normal_style,
            )
        )

        if arcana:
            story.append(
                Paragraph(
                    f"<b>Arcana:</b> {arcana}",
                    normal_style,
                )
            )

        if suit:
            story.append(
                Paragraph(
                    f"<b>Suit:</b> {suit}",
                    normal_style,
                )
            )

        # Keywords
        keywords = card.get("keywords", [])

        if isinstance(keywords, list):
            keywords_text = ", ".join(str(k) for k in keywords)

            if keywords_text:
                story.append(
                    Paragraph(
                        f"<b>Keywords:</b> {keywords_text}",
                        normal_style,
                    )
                )

        # Meaning
        meaning = card.get("meaning", "")

        if isinstance(meaning, list):
            meaning = " ".join(str(item) for item in meaning)

        if meaning:
            story.append(
                Paragraph(
                    f"<b>Meaning:</b><br/>{meaning}",
                    normal_style,
                )
            )

        story.append(Spacer(1, 10))

    # -----------------------------
    # OVERALL READING
    # -----------------------------

    overall_reading = reading.get("overall_reading", "")

    if overall_reading:
        story.append(PageBreak())

        story.append(
            Paragraph(
                "✨ OVERALL READING",
                heading_style,
            )
        )

        # Convert new lines into HTML breaks
        overall_reading = str(overall_reading).replace(
            "\n",
            "<br/>"
        )

        story.append(
            Paragraph(
                overall_reading,
                normal_style,
            )
        )

    # -----------------------------
    # DISCLAIMER
    # -----------------------------

    story.append(Spacer(1, 25))

    story.append(
        Paragraph(
            "<b>Disclaimer:</b> This Tarot reading is intended "
            "for reflection, entertainment, and personal insight. "
            "It should not be treated as professional medical, "
            "financial, legal, or psychological advice.",
            normal_style,
        )
    )

    # -----------------------------
    # BUILD PDF
    # -----------------------------

    doc.build(story)

    return str(output_file)

def generate_palm_report(analysis: dict, output_path: str) -> str:
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(output_file),
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "PalmTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "PalmHeading",
        parent=styles["Heading2"],
        spaceBefore=15,
        spaceAfter=10,
    )

    normal_style = ParagraphStyle(
        "PalmNormal",
        parent=styles["BodyText"],
        leading=16,
        spaceAfter=8,
    )

    story = []

    # -----------------------------------
    # TITLE
    # -----------------------------------

    story.append(
        Paragraph(
            "AI PALMISTRY & TAROT<br/>INTELLIGENCE PLATFORM",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "PALM ANALYSIS REPORT",
            heading_style,
        )
    )

    story.append(
        Paragraph(
            f"<b>Date:</b> "
            f"{datetime.now().strftime('%d %B %Y, %I:%M %p')}",
            normal_style,
        )
    )

    story.append(Spacer(1, 15))

    # -----------------------------------
    # BASIC IMAGE FEATURES
    # -----------------------------------

    image_features = analysis.get("image_features", {})

    if image_features:
        story.append(
            Paragraph(
                "Image Analysis",
                heading_style,
            )
        )

        for key, value in image_features.items():
            formatted_key = str(key).replace("_", " ").title()

            story.append(
                Paragraph(
                    f"<b>{formatted_key}:</b> {value}",
                    normal_style,
                )
            )

    # -----------------------------------
    # HAND LANDMARKS
    # -----------------------------------

    hand_landmarks = analysis.get("hand_landmarks", {})

    story.append(
        Paragraph(
            "Hand Landmark Detection",
            heading_style,
        )
    )

    detected = hand_landmarks.get("detected", False)
    count = hand_landmarks.get("count", 0)

    story.append(
        Paragraph(
            f"<b>Hand Detected:</b> "
            f"{'Yes' if detected else 'No'}",
            normal_style,
        )
    )

    story.append(
        Paragraph(
            f"<b>Landmarks Detected:</b> {count}",
            normal_style,
        )
    )

    # -----------------------------------
    # PALM SHAPE
    # -----------------------------------

    palm_shape = analysis.get("palm_shape", {})

    if palm_shape:
        story.append(
            Paragraph(
                "Palm Shape",
                heading_style,
            )
        )

        for key, value in palm_shape.items():
            formatted_key = str(key).replace("_", " ").title()

            story.append(
                Paragraph(
                    f"<b>{formatted_key}:</b> {value}",
                    normal_style,
                )
            )

    # -----------------------------------
    # FINGER ANALYSIS
    # -----------------------------------

    finger_analysis = analysis.get("finger_analysis", {})

    if finger_analysis:
        story.append(
            Paragraph(
                "Finger Structure",
                heading_style,
            )
        )

        for key, value in finger_analysis.items():
            formatted_key = str(key).replace("_", " ").title()

            story.append(
                Paragraph(
                    f"<b>{formatted_key}:</b> {value}",
                    normal_style,
                )
            )

    # -----------------------------------
    # PALM LINE DETECTION
    # -----------------------------------

    palm_lines = analysis.get("palm_lines", {})

    if palm_lines:
        story.append(
            Paragraph(
                "Palm Line Detection",
                heading_style,
            )
        )

        lines = palm_lines.get("lines", [])

        for line in lines:
            line_name = line.get("line", "Unknown")
            confidence = line.get("confidence", 0)

            story.append(
                Paragraph(
                    f"<b>{str(line_name).title()} Line</b>",
                    normal_style,
                )
            )

            story.append(
                Paragraph(
                    f"Detection Confidence: {confidence}",
                    normal_style,
                )
            )

    # -----------------------------------
    # INTERPRETATIONS
    # -----------------------------------

    interpretations = analysis.get(
        "interpretations",
        {}
    )

    if interpretations:
        story.append(PageBreak())

        story.append(
            Paragraph(
                "✨ PALMISTRY INTERPRETATIONS",
                heading_style,
            )
        )

        for key, data in interpretations.items():

            if not isinstance(data, dict):
                continue

            title = data.get(
                "title",
                str(key).replace("_", " ").title()
            )

            interpretation_type = data.get(
                "type",
                ""
            )

            interpretation = data.get(
                "interpretation",
                ""
            )

            story.append(
                Paragraph(
                    f"<b>{title}</b>",
                    heading_style,
                )
            )

            if interpretation_type:
                story.append(
                    Paragraph(
                        f"<b>Type:</b> "
                        f"{interpretation_type}",
                        normal_style,
                    )
                )

            if "confidence" in data:
                story.append(
                    Paragraph(
                        f"<b>Detection Confidence:</b> "
                        f"{data['confidence']}",
                        normal_style,
                    )
                )

            if interpretation:
                story.append(
                    Paragraph(
                        f"<b>Traditional Interpretation:</b><br/>"
                        f"{interpretation}",
                        normal_style,
                    )
                )

    # -----------------------------------
    # DISCLAIMER
    # -----------------------------------

    story.append(Spacer(1, 25))

    story.append(
        Paragraph(
            "<b>Disclaimer:</b> "
            "This palmistry reading is intended for reflection, "
            "entertainment, and personal insight. It should not "
            "be treated as scientific prediction or professional "
            "medical, financial, legal, or psychological advice.",
            normal_style,
        )
    )

    # -----------------------------------
    # BUILD PDF
    # -----------------------------------

    doc.build(story)

    return str(output_file)

# ============================================================
# PERSONALITY REPORT
# ============================================================

def generate_personality_report(
    personality_data: dict,
    output_path: str
) -> str:
    """
    Generate a PDF report for AI Personality Intelligence.
    """

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(output_file),
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "PersonalityTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "PersonalityHeading",
        parent=styles["Heading2"],
        spaceBefore=15,
        spaceAfter=10,
    )

    normal_style = ParagraphStyle(
        "PersonalityNormal",
        parent=styles["BodyText"],
        leading=16,
        spaceAfter=8,
    )

    story = []

    story.append(
        Paragraph(
            "AI PALMISTRY & TAROT<br/>INTELLIGENCE PLATFORM",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "PERSONALITY INTELLIGENCE REPORT",
            heading_style,
        )
    )

    story.append(
        Paragraph(
            f"<b>Date:</b> "
            f"{datetime.now().strftime('%d %B %Y, %I:%M %p')}",
            normal_style,
        )
    )

    # Personality Profile
    profile = personality_data.get("profile")

    if profile:
        story.append(
            Paragraph(
                "🧠 Personality Profile",
                heading_style,
            )
        )

        if isinstance(profile, dict):
            for key, value in profile.items():
                story.append(
                    Paragraph(
                        f"<b>{str(key).replace('_', ' ').title()}:</b> "
                        f"{value}",
                        normal_style,
                    )
                )
        else:
            story.append(
                Paragraph(
                    str(profile),
                    normal_style,
                )
            )

    # Strengths
    strengths = personality_data.get("strengths", [])

    if strengths:
        story.append(
            Paragraph(
                "💪 Strengths",
                heading_style,
            )
        )

        for item in strengths:
            story.append(
                Paragraph(
                    f"• {item}",
                    normal_style,
                )
            )

    # Areas for development
    development = personality_data.get(
        "areas_for_development",
        []
    )

    if development:
        story.append(
            Paragraph(
                "🌱 Areas for Development",
                heading_style,
            )
        )

        for item in development:
            story.append(
                Paragraph(
                    f"• {item}",
                    normal_style,
                )
            )

    # Behavioral insights
    behavioral = personality_data.get(
        "behavioral_insights",
        []
    )

    if behavioral:
        story.append(
            Paragraph(
                "🔍 Behavioral Insights",
                heading_style,
            )
        )

        for item in behavioral:
            story.append(
                Paragraph(
                    f"• {item}",
                    normal_style,
                )
            )

    # Personal development
    personal_development = personality_data.get(
        "personal_development",
        []
    )

    if personal_development:
        story.append(
            Paragraph(
                "🚀 Personal Development",
                heading_style,
            )
        )

        for item in personal_development:
            story.append(
                Paragraph(
                    f"• {item}",
                    normal_style,
                )
            )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<b>Disclaimer:</b> This report provides "
            "AI-generated personality insights for "
            "reflection and personal development. It is "
            "not a psychological or medical diagnosis.",
            normal_style,
        )
    )

    doc.build(story)

    return str(output_file)


# ============================================================
# SPIRITUAL GUIDANCE REPORT
# ============================================================

def generate_spiritual_guidance_report(
    spiritual_data: dict,
    output_path: str
) -> str:
    """
    Generate a PDF report for Spiritual Guidance Scoring.
    """

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(output_file),
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "SpiritualTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "SpiritualHeading",
        parent=styles["Heading2"],
        spaceBefore=15,
        spaceAfter=10,
    )

    normal_style = ParagraphStyle(
        "SpiritualNormal",
        parent=styles["BodyText"],
        leading=16,
        spaceAfter=8,
    )

    story = []

    story.append(
        Paragraph(
            "AI PALMISTRY & TAROT<br/>INTELLIGENCE PLATFORM",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "SPIRITUAL GUIDANCE REPORT",
            heading_style,
        )
    )

    story.append(
        Paragraph(
            f"<b>Date:</b> "
            f"{datetime.now().strftime('%d %B %Y, %I:%M %p')}",
            normal_style,
        )
    )

    # Overall score
    score = spiritual_data.get(
        "score",
        spiritual_data.get(
            "overall_score",
            spiritual_data.get("spiritual_guidance_score")
        )
    )

    if score is not None:
        story.append(
            Paragraph(
                f"<b>Overall Spiritual Guidance Score:</b> "
                f"{score}/100",
                normal_style,
            )
        )

    # Score components
    story.append(
        Paragraph(
            "📊 Guidance Score Components",
            heading_style,
        )
    )

    components = [
        (
            "Palm Analysis Confidence",
            spiritual_data.get(
                "palm_analysis_confidence"
            )
        ),
        (
            "Tarot Interpretation Relevance",
            spiritual_data.get(
                "tarot_interpretation_relevance"
            )
        ),
        (
            "Personality Alignment",
            spiritual_data.get(
                "personality_alignment"
            )
        ),
        (
            "User Context Relevance",
            spiritual_data.get(
                "user_context_relevance"
            )
        ),
        (
            "Reading Consistency",
            spiritual_data.get(
                "reading_consistency"
            )
        ),
    ]

    for name, value in components:
        if value is not None:
            story.append(
                Paragraph(
                    f"<b>{name}:</b> {value}",
                    normal_style,
                )
            )

    # Any additional guidance fields
    for key, value in spiritual_data.items():
        if key in {
            "score",
            "overall_score",
            "spiritual_guidance_score",
            "palm_analysis_confidence",
            "tarot_interpretation_relevance",
            "personality_alignment",
            "user_context_relevance",
            "reading_consistency",
        }:
            continue

        if isinstance(value, (str, int, float)):
            story.append(
                Paragraph(
                    f"<b>{str(key).replace('_', ' ').title()}:</b> "
                    f"{value}",
                    normal_style,
                )
            )

        elif isinstance(value, list):
            story.append(
                Paragraph(
                    str(key).replace("_", " ").title(),
                    heading_style,
                )
            )

            for item in value:
                story.append(
                    Paragraph(
                        f"• {item}",
                        normal_style,
                    )
                )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<b>Disclaimer:</b> Spiritual guidance is "
            "provided for reflection and personal growth. "
            "It should not be treated as professional "
            "medical, financial, psychological, or "
            "religious advice.",
            normal_style,
        )
    )

    doc.build(story)

    return str(output_file)


# ============================================================
# INSIGHT TREND / LIFE TREND REPORT
# ============================================================

def generate_insight_trend_report(
    trend_data: dict,
    output_path: str
) -> str:
    """
    Generate a PDF report for Life Trend Analysis
    and Insight Trends.
    """

    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(output_file),
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TrendTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        spaceAfter=20,
    )

    heading_style = ParagraphStyle(
        "TrendHeading",
        parent=styles["Heading2"],
        spaceBefore=15,
        spaceAfter=10,
    )

    normal_style = ParagraphStyle(
        "TrendNormal",
        parent=styles["BodyText"],
        leading=16,
        spaceAfter=8,
    )

    story = []

    story.append(
        Paragraph(
            "AI PALMISTRY & TAROT<br/>INTELLIGENCE PLATFORM",
            title_style,
        )
    )

    story.append(
        Paragraph(
            "INSIGHT TREND & LIFE ANALYSIS REPORT",
            heading_style,
        )
    )

    story.append(
        Paragraph(
            f"<b>Date:</b> "
            f"{datetime.now().strftime('%d %B %Y, %I:%M %p')}",
            normal_style,
        )
    )

    # Main trend information
    for key, value in trend_data.items():

        if value is None:
            continue

        title = str(key).replace("_", " ").title()

        if isinstance(value, list):

            story.append(
                Paragraph(
                    title,
                    heading_style,
                )
            )

            for item in value:

                if isinstance(item, dict):

                    text_parts = []

                    for sub_key, sub_value in item.items():
                        text_parts.append(
                            f"<b>"
                            f"{str(sub_key).replace('_', ' ').title()}"
                            f":</b> {sub_value}"
                        )

                    story.append(
                        Paragraph(
                            " | ".join(text_parts),
                            normal_style,
                        )
                    )

                else:
                    story.append(
                        Paragraph(
                            f"• {item}",
                            normal_style,
                        )
                    )

        elif isinstance(value, dict):

            story.append(
                Paragraph(
                    title,
                    heading_style,
                )
            )

            for sub_key, sub_value in value.items():

                story.append(
                    Paragraph(
                        f"<b>"
                        f"{str(sub_key).replace('_', ' ').title()}"
                        f":</b> {sub_value}",
                        normal_style,
                    )
                )

        else:

            story.append(
                Paragraph(
                    f"<b>{title}:</b> {value}",
                    normal_style,
                )
            )

    story.append(Spacer(1, 15))

    story.append(
        Paragraph(
            "<b>Disclaimer:</b> Life trend analysis and "
            "insight trends are AI-generated interpretations "
            "for reflection and personal guidance. They do "
            "not predict guaranteed future events.",
            normal_style,
        )
    )

    doc.build(story)

    return str(output_file)