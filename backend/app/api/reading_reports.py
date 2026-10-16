from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.reading_report import (
    ReadingReportCreate,
    ReadingReportResponse,
)
from app.services.reading_report_service import generate_reading_report
from app.models.reading_report import ReadingReport
from fastapi.responses import Response

from app.services.pdf_report_service import generate_report_pdf

router = APIRouter(
    prefix="/api/v1/reading-reports",
    tags=["Reading Reports"],
)


@router.post(
    "",
    response_model=ReadingReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reading_report(
    request: ReadingReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        report = generate_reading_report(
            db=db,
            user_id=current_user.id,
            reading_session_id=request.reading_session_id,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )

    return report
@router.get(
    "",
    response_model=list[ReadingReportResponse],
)
def get_my_reading_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports = (
        db.query(ReadingReport)
        .filter(ReadingReport.user_id == current_user.id)
        .order_by(ReadingReport.created_at.desc())
        .all()
    )

    return reports
@router.get(
    "/{report_id}",
    response_model=ReadingReportResponse,
)
def get_my_reading_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = (
        db.query(ReadingReport)
        .filter(
            ReadingReport.id == report_id,
            ReadingReport.user_id == current_user.id,
        )
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reading report not found.",
        )

    return report
@router.get(
    "/{report_id}/pdf",
)
def download_reading_report_pdf(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = (
        db.query(ReadingReport)
        .filter(
            ReadingReport.id == report_id,
            ReadingReport.user_id == current_user.id,
        )
        .first()
    )

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reading report not found.",
        )

    pdf_bytes = generate_report_pdf(report)

    filename = (
        f"reading_report_{report.id}.pdf"
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )