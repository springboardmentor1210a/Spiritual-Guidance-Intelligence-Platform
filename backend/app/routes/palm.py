from pathlib import Path
import tempfile
import json

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.palm_analysis import PalmAnalysis
from app.models.user import User
from app.routes.auth import get_current_user

from app.services.palm.palm_analysis import analyze_palm
from fastapi.responses import FileResponse
from app.services.reports.report_generator import generate_palm_report


router = APIRouter(
    prefix="/palm",
    tags=["Palm Analysis"]
)


@router.post("/analyze")
async def analyze_palm_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a palm image, analyze it,
    and save the analysis for the logged-in user.
    """

    if not file:
        raise HTTPException(
            status_code=400,
            detail="No image uploaded"
        )

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid palm image (JPG, PNG, or WEBP)"
        )

    temp_image_path = None

    try:

        # -----------------------------------
        # READ IMAGE
        # -----------------------------------

        image_bytes = await file.read()

        if len(image_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty"
            )

        # -----------------------------------
        # SAVE TEMPORARY IMAGE
        # -----------------------------------

        suffix = Path(file.filename or ".jpg").suffix

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_file.write(image_bytes)
            temp_image_path = temp_file.name

        # -----------------------------------
        # RUN PALM ANALYSIS
        # -----------------------------------

        result = analyze_palm(temp_image_path)

        # -----------------------------------
        # SAVE ANALYSIS TO DATABASE
        # -----------------------------------

        palm_analysis = PalmAnalysis(
            user_id=current_user.user_id,
            analysis_result=json.dumps(result, default=str)
        )

        db.add(palm_analysis)
        db.commit()
        db.refresh(palm_analysis)

        # -----------------------------------
        # REMOVE TEMPORARY IMAGE
        # -----------------------------------

        Path(temp_image_path).unlink(missing_ok=True)

        return {
            "success": True,
            "analysis_id": palm_analysis.analysis_id,
            "filename": file.filename,
            "analysis": result
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        if temp_image_path:
            Path(temp_image_path).unlink(
                missing_ok=True
            )

        raise HTTPException(
            status_code=500,
            detail=f"Palm analysis failed: {str(e)}"
        )

@router.post("/report")
async def generate_palm_analysis_report(
    file: UploadFile = File(...)
):
    """
    Upload a palm image and generate a PDF palm analysis report.
    """

    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid palm image (JPG, PNG, or WEBP)"
        )

    temp_image_path = None

    try:
        # -----------------------------------
        # READ UPLOADED IMAGE
        # -----------------------------------

        image_bytes = await file.read()

        if len(image_bytes) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty"
            )

        # -----------------------------------
        # SAVE TEMPORARY IMAGE
        # -----------------------------------

        suffix = Path(file.filename or ".jpg").suffix

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_file.write(image_bytes)
            temp_image_path = temp_file.name

        # -----------------------------------
        # RUN PALM ANALYSIS
        # -----------------------------------

        analysis_result = analyze_palm(
            temp_image_path
        )

        # -----------------------------------
        # GENERATE PDF REPORT
        # -----------------------------------

        report_dir = Path("reports")
        report_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        original_name = Path(
            file.filename or "palm"
        ).stem

        report_path = (
            report_dir /
            f"palm_report_{original_name}.pdf"
        )

        generate_palm_report(
            analysis=analysis_result,
            output_path=str(report_path)
        )

        return FileResponse(
            path=str(report_path),
            media_type="application/pdf",
            filename=f"palm_analysis_report_{original_name}.pdf"
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate Palm report: {str(e)}"
        )

    finally:

        if temp_image_path:
            Path(temp_image_path).unlink(
                missing_ok=True
            )
