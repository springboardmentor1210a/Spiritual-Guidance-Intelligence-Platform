import json
import os
import re
import tempfile
from datetime import datetime
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import Report, PalmReading, TarotReading
from routes.rbac import require_report_access

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Preformatted,
)


router = APIRouter(prefix="/reports", tags=["Reports"])


# ---------------------------------------------------------
# REQUEST MODEL
# ---------------------------------------------------------

class ReportCreateRequest(BaseModel):
    palm_reading_id: Optional[int] = None
    tarot_reading_id: Optional[int] = None
    report_type: Optional[str] = "combined"
    title: Optional[str] = None


# ---------------------------------------------------------
# ROLE AND ACCESS HELPERS
# ---------------------------------------------------------

def normalize_user_role(user):
    role = str(getattr(user, "role", "") or "")
    role = role.strip().lower().replace("-", "_").replace(" ", "_")

    if role == "admin":
        return "administrator"

    return role


def can_access_all_reports(user):
    return normalize_user_role(user) in {
        "spiritual_consultant",
        "administrator",
    }


def get_accessible_report(db, report_id, current_user):
    query = db.query(Report).filter(Report.id == report_id)

    if not can_access_all_reports(current_user):
        query = query.filter(Report.user_id == current_user.id)

    return query.first()


# ---------------------------------------------------------
# GENERAL HELPERS
# ---------------------------------------------------------

def object_to_dict(obj):
    """Convert available model fields into a JSON-safe dictionary."""

    if obj is None:
        return {}

    result = {}

    for column in obj.__table__.columns:
        value = getattr(obj, column.name, None)

        if isinstance(value, datetime):
            value = value.isoformat()

        result[column.name] = value

    return result


def safe_json_loads(value):
    """Parse JSON text without crashing if the text is invalid."""

    if not value:
        return None

    if isinstance(value, (dict, list)):
        return value

    try:
        return json.loads(value)
    except (TypeError, ValueError):
        return value


def create_report_content(
    palm_reading=None,
    tarot_reading=None,
):
    """Build report content from the selected readings."""

    content = {
        "generated_at": datetime.utcnow().isoformat(),
        "palmistry": None,
        "tarot": None,
    }

    if palm_reading is not None:
        content["palmistry"] = object_to_dict(palm_reading)

    if tarot_reading is not None:
        content["tarot"] = object_to_dict(tarot_reading)

    return content


def report_content_as_text(report):
    """Convert stored report content into readable text."""

    parsed = safe_json_loads(report.content)

    if isinstance(parsed, dict):
        return json.dumps(
            parsed,
            indent=2,
            ensure_ascii=False,
            default=str,
        )

    if parsed is not None:
        return str(parsed)

    return "No report content is available."


def validate_reading_ownership(
    db,
    reading_id,
    model,
    current_user,
    reading_name,
):
    """Ensure a reading belongs to the logged-in user."""

    if reading_id is None:
        return None

    reading = (
        db.query(model)
        .filter(
            model.id == reading_id,
            model.user_id == current_user.id,
        )
        .first()
    )

    if reading is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{reading_name} was not found for your account.",
        )

    return reading


# ---------------------------------------------------------
# GENERATE REPORT
# POST /reports/generate
# ---------------------------------------------------------

@router.post("/generate")
def generate_report(
    request: ReportCreateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_report_access),
):
    palm_reading = validate_reading_ownership(
        db,
        request.palm_reading_id,
        PalmReading,
        current_user,
        "Palm reading",
    )

    tarot_reading = validate_reading_ownership(
        db,
        request.tarot_reading_id,
        TarotReading,
        current_user,
        "Tarot reading",
    )

    if palm_reading is None and tarot_reading is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide a palm reading ID, a tarot reading ID, or both.",
        )

    report_type = (
        request.report_type or "combined"
    ).strip().lower()

    if palm_reading is not None and tarot_reading is not None:
        report_type = "combined"
    elif palm_reading is not None:
        report_type = "palmistry"
    elif tarot_reading is not None:
        report_type = "tarot"

    content = create_report_content(
        palm_reading=palm_reading,
        tarot_reading=tarot_reading,
    )

    report = Report(
        user_id=current_user.id,
        palm_reading_id=(
            palm_reading.id if palm_reading else None
        ),
        tarot_reading_id=(
            tarot_reading.id if tarot_reading else None
        ),
        title=(
            request.title
            or f"{report_type.title()} Reading Report"
        ),
        report_type=report_type,
        content=json.dumps(content, ensure_ascii=False, default=str),
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "success": True,
        "message": "Report generated successfully.",
        "report": {
            "report_id": report.id,
            "user_id": report.user_id,
            "title": report.title,
            "report_type": report.report_type,
            "palm_reading_id": report.palm_reading_id,
            "tarot_reading_id": report.tarot_reading_id,
            "created_at": report.created_at,
        },
    }


# ---------------------------------------------------------
# LIST REPORTS
# GET /reports
# ---------------------------------------------------------

@router.get("")
def get_all_reports(
    db: Session = Depends(get_db),
    current_user=Depends(require_report_access),
):
    reports_query = db.query(Report)

    if not can_access_all_reports(current_user):
        reports_query = reports_query.filter(
            Report.user_id == current_user.id
        )

    reports = (
        reports_query
        .order_by(Report.id.desc())
        .all()
    )

    result = []

    for report in reports:
        created_at = None

        if report.created_at is not None:
            created_at = report.created_at.isoformat()

        result.append({
            "report_id": report.id,
            "user_id": report.user_id,
            "report_type": report.report_type,
            "title": report.title,
            "palm_reading_id": report.palm_reading_id,
            "tarot_reading_id": report.tarot_reading_id,
            "created_at": created_at,
            "content_available": bool(report.content),
        })

    return {
        "success": True,
        "total_reports": len(result),
        "reports": result,
    }


# ---------------------------------------------------------
# VIEW A SINGLE REPORT
# GET /reports/{report_id}
# ---------------------------------------------------------

@router.get("/{report_id}")
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_report_access),
):
    report = get_accessible_report(
        db,
        report_id,
        current_user,
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or you do not have permission to access it.",
        )

    palm_reading = None
    tarot_reading = None

    if report.palm_reading_id is not None:
        palm_reading = (
            db.query(PalmReading)
            .filter(
                PalmReading.id == report.palm_reading_id,
                PalmReading.user_id == report.user_id,
            )
            .first()
        )

    if report.tarot_reading_id is not None:
        tarot_reading = (
            db.query(TarotReading)
            .filter(
                TarotReading.id == report.tarot_reading_id,
                TarotReading.user_id == report.user_id,
            )
            .first()
        )

    return {
        "success": True,
        "report": {
            "report_id": report.id,
            "user_id": report.user_id,
            "title": report.title,
            "report_type": report.report_type,
            "palm_reading_id": report.palm_reading_id,
            "tarot_reading_id": report.tarot_reading_id,
            "created_at": report.created_at,
            "content": safe_json_loads(report.content),
        },
        "palmistry_reading": (
            object_to_dict(palm_reading)
            if palm_reading else None
        ),
        "tarot_reading": (
            object_to_dict(tarot_reading)
            if tarot_reading else None
        ),
    }


# ---------------------------------------------------------
# DOWNLOAD REPORT AS PDF
# GET /reports/download/{report_id}
# Keep this route before the dynamic /{report_id} route.
# ---------------------------------------------------------

@router.get("/download/{report_id}")
def download_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_report_access),
):
    report = get_accessible_report(
        db,
        report_id,
        current_user,
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or you do not have permission to download it.",
        )

    palm_reading = None
    tarot_reading = None

    if report.palm_reading_id is not None:
        palm_reading = (
            db.query(PalmReading)
            .filter(
                PalmReading.id == report.palm_reading_id,
                PalmReading.user_id == report.user_id,
            )
            .first()
        )

    if report.tarot_reading_id is not None:
        tarot_reading = (
            db.query(TarotReading)
            .filter(
                TarotReading.id == report.tarot_reading_id,
                TarotReading.user_id == report.user_id,
            )
            .first()
        )

    try:
        temporary_file = tempfile.NamedTemporaryFile(
            suffix=".pdf",
            prefix="reading_report_",
            delete=False,
        )
        pdf_path = temporary_file.name
        temporary_file.close()

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "ReportTitle",
            parent=styles["Title"],
            alignment=TA_CENTER,
            textColor=colors.HexColor("#44318D"),
            spaceAfter=18,
        )

        section_style = ParagraphStyle(
            "ReportSection",
            parent=styles["Heading2"],
            textColor=colors.HexColor("#44318D"),
            spaceBefore=12,
            spaceAfter=8,
        )

        body_style = styles["BodyText"]

        document = SimpleDocTemplate(
            pdf_path,
            pagesize=A4,
            rightMargin=0.65 * inch,
            leftMargin=0.65 * inch,
            topMargin=0.65 * inch,
            bottomMargin=0.65 * inch,
        )

        story = [
            Paragraph("Palmistry and Tarot Reading Report", title_style),
            Paragraph(
                f"<b>Report ID:</b> {report.id}",
                body_style,
            ),
            Paragraph(
                f"<b>Title:</b> {report.title or 'Reading Report'}",
                body_style,
            ),
            Paragraph(
                f"<b>Report Type:</b> {report.report_type or 'N/A'}",
                body_style,
            ),
            Paragraph(
                f"<b>Created At:</b> {report.created_at or 'N/A'}",
                body_style,
            ),
            Spacer(1, 14),
        ]

        if palm_reading is not None:
            story.append(
                Paragraph("Palmistry Reading", section_style)
            )
            story.append(
                Preformatted(
                    json.dumps(
                        object_to_dict(palm_reading),
                        indent=2,
                        ensure_ascii=False,
                        default=str,
                    ),
                    body_style,
                )
            )
            story.append(Spacer(1, 12))

        if tarot_reading is not None:
            story.append(
                Paragraph("Tarot Reading", section_style)
            )
            story.append(
                Preformatted(
                    json.dumps(
                        object_to_dict(tarot_reading),
                        indent=2,
                        ensure_ascii=False,
                        default=str,
                    ),
                    body_style,
                )
            )
            story.append(Spacer(1, 12))

        story.append(
            Paragraph("Stored Report Content", section_style)
        )

        report_text = report_content_as_text(report)

        story.append(
            Preformatted(
                report_text,
                body_style,
            )
        )

        document.build(story)

        safe_title = re.sub(
            r"[^A-Za-z0-9_-]+",
            "_",
            report.title or "reading_report",
        ).strip("_")

        return FileResponse(
            path=pdf_path,
            media_type="application/pdf",
            filename=f"{safe_title}_{report.id}.pdf",
            background=None,
        )

    except Exception as exc:
        if "pdf_path" in locals() and os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except OSError:
                pass

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not generate the PDF report: {str(exc)}",
        )


# ---------------------------------------------------------
# DELETE REPORT
# DELETE /reports/{report_id}
# ---------------------------------------------------------

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_report_access),
):
    report = get_accessible_report(
        db,
        report_id,
        current_user,
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or you do not have permission to delete it.",
        )

    db.delete(report)
    db.commit()

    return {
        "success": True,
        "message": "Report deleted successfully.",
        "report_id": report_id,
    }