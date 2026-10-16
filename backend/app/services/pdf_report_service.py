import io
import json
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    PageBreak,
)

from app.models.reading_report import ReadingReport


def _add_wrapped_text(story, text, style):
    """
    Add multiline text safely to a ReportLab document.
    """
    for line in str(text).splitlines():
        if line.strip():
            story.append(
                Paragraph(
                    line.replace("&", "&amp;"),
                    style,
                )
            )
            story.append(Spacer(1, 3 * mm))


def generate_report_pdf(report: ReadingReport) -> bytes:
    output = io.BytesIO()

    document = SimpleDocTemplate(
        output,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = getSampleStyleSheet()

    title_style = styles["Title"]
    heading_style = styles["Heading2"]
    body_style = styles["BodyText"]

    story = []

    story.append(
        Paragraph(
            report.title,
            title_style,
        )
    )

    story.append(
        Spacer(1, 8 * mm)
    )

    story.append(
        Paragraph(
            f"Report Type: {report.report_type}",
            body_style,
        )
    )

    story.append(
        Paragraph(
            f"Created: {report.created_at.strftime('%d %B %Y, %I:%M %p')}",
            body_style,
        )
    )

    story.append(
        Spacer(1, 8 * mm)
    )

    try:
        data = json.loads(report.content)
    except (
        json.JSONDecodeError,
        TypeError,
    ):
        data = None

    # =====================================================
    # PALMISTRY REPORT
    # =====================================================

    if (
        report.report_type.lower() == "palm"
        and isinstance(data, dict)
    ):

        story.append(
            Paragraph(
                "Palmistry Analysis",
                heading_style,
            )
        )

        story.append(
            Spacer(1, 4 * mm)
        )

        # -------------------------------------------------
        # ACTUAL UPLOADED PALM IMAGE
        # -------------------------------------------------

        image_path = data.get(
            "image_path"
        )

        if image_path:

            path = Path(image_path)

            if path.exists():

                palm_image = Image(
                    str(path)
                )

                palm_image._restrictSize(
                    160 * mm,
                    100 * mm,
                )

                story.append(
                    palm_image
                )

                story.append(
                    Spacer(1, 8 * mm)
                )

        analysis = data.get(
            "analysis",
            {},
        )

        # -------------------------------------------------
        # Palm shape
        # -------------------------------------------------

        palm_shape = analysis.get(
            "palmShape",
            {},
        )

        story.append(
            Paragraph(
                "Palm Shape",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                f"<b>{palm_shape.get('value', '')}</b>",
                body_style,
            )
        )

        story.append(
            Paragraph(
                f"Score: {palm_shape.get('score', '')}%",
                body_style,
            )
        )

        story.append(
            Paragraph(
                str(
                    palm_shape.get(
                        "note",
                        "",
                    )
                ),
                body_style,
            )
        )

        story.append(
            Spacer(1, 5 * mm)
        )

        # -------------------------------------------------
        # Finger structure
        # -------------------------------------------------

        fingers = analysis.get(
            "fingers",
            {},
        )

        story.append(
            Paragraph(
                "Finger Structure",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                f"<b>{fingers.get('value', '')}</b>",
                body_style,
            )
        )

        story.append(
            Paragraph(
                f"Score: {fingers.get('score', '')}%",
                body_style,
            )
        )

        story.append(
            Paragraph(
                str(
                    fingers.get(
                        "note",
                        "",
                    )
                ),
                body_style,
            )
        )

        story.append(
            Spacer(1, 7 * mm)
        )

        # -------------------------------------------------
        # Palm lines
        # -------------------------------------------------

        story.append(
            Paragraph(
                "Palm Lines",
                heading_style,
            )
        )

        for line in analysis.get(
            "lines",
            [],
        ):

            story.append(
                Paragraph(
                    f"<b>{line.get('name', '')}</b>",
                    body_style,
                )
            )

            story.append(
                Paragraph(
                    f"Status: {line.get('status', '')}",
                    body_style,
                )
            )

            story.append(
                Paragraph(
                    f"Score: {line.get('score', '')}%",
                    body_style,
                )
            )

            story.append(
                Paragraph(
                    str(
                        line.get(
                            "note",
                            "",
                        )
                    ),
                    body_style,
                )
            )

            story.append(
                Spacer(1, 4 * mm)
            )

    # =====================================================
    # TAROT REPORT
    # =====================================================

    elif (
        report.report_type.lower().startswith("tarot")
        and isinstance(data, dict)
    ):

        story.append(
            Paragraph(
                "Tarot Reading",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                f"Spread: {data.get('spread', '').replace('_', ' ').title()}",
                body_style,
            )
        )

        story.append(
            Paragraph(
                f"Context: {data.get('context', '').title()}",
                body_style,
            )
        )

        story.append(
            Spacer(1, 6 * mm)
        )

        for item in data.get(
            "cards",
            [],
        ):

            position = item.get(
                "position",
                "Position",
            )

            card = item.get(
                "card",
                {},
            )

            story.append(
                Paragraph(
                    position,
                    heading_style,
                )
            )

            story.append(
                Paragraph(
                    f"<b>{card.get('name', 'Unknown Card')}</b>",
                    body_style,
                )
            )

            orientation = card.get(
                "orientation"
            )

            if orientation:

                story.append(
                    Paragraph(
                        f"Orientation: {orientation.title()}",
                        body_style,
                    )
                )

            meaning = card.get(
                "meaning"
            )

            if meaning:

                story.append(
                    Paragraph(
                        str(meaning),
                        body_style,
                    )
                )

            context_meaning = card.get(
                "context_meaning"
            )

            if context_meaning:

                story.append(
                    Paragraph(
                        str(context_meaning),
                        body_style,
                    )
                )

            story.append(
                Spacer(1, 5 * mm)
            )

    # =====================================================
    # FALLBACK
    # =====================================================

    else:

        story.append(
            Paragraph(
                "Analysis",
                heading_style,
            )
        )

        story.append(
            Paragraph(
                report.content,
                body_style,
            )
        )

    # =====================================================
    # DISCLAIMER
    # =====================================================

    story.append(
        Spacer(1, 10 * mm)
    )

    story.append(
        Paragraph(
            "This report is provided for spiritual and entertainment purposes and should not be treated as medical, financial, legal, or professional advice.",
            body_style,
        )
    )

    document.build(story)

    return output.getvalue()