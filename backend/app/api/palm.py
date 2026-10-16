import json
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.schemas.palm import PalmAnalysisResponse
from app.dependencies.auth import get_current_user
from app.services.palm_analysis_service import (
    build_palm_summary,
    generate_palm_analysis,
)


router = APIRouter(
    prefix="/api/v1/palm",
    tags=["Palmistry"],
)


BASE_DIR = Path(__file__).resolve().parents[2]

UPLOAD_DIR = BASE_DIR / "storage" / "palms"

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
}

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post(
    "/analyze",
    response_model=PalmAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
)
async def analyze_palm(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG and PNG palm images are supported.",
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded palm image is empty.",
        )

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Palm image must be smaller than 10 MB.",
        )

    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    extension = ALLOWED_TYPES[file.content_type]

    stored_filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    image_path = UPLOAD_DIR / stored_filename

    image_path.write_bytes(file_bytes)

    try:
        analysis = generate_palm_analysis()

        summary = build_palm_summary(
            analysis=analysis,
            image_filename=file.filename or stored_filename,
        )

        from app.models.reading_session import ReadingSession

        reading_session = ReadingSession(
            user_id=current_user.id,
            reading_type="palm",
            summary=summary,
        )

        db.add(reading_session)
        db.commit()
        db.refresh(reading_session)

        # Store the image path separately inside the summary
        # so the existing ReadingSession model does not need
        # another database migration at this stage.
        stored_summary = json.loads(
            reading_session.summary
        )

        stored_summary["image_path"] = str(
            image_path.resolve()
        )

        reading_session.summary = json.dumps(
            stored_summary
        )

        db.commit()
        db.refresh(reading_session)

        return {
            "reading_session_id": reading_session.id,
            "reading_type": "palm",
            "image_filename": (
                file.filename or stored_filename
            ),
            "analysis": analysis,
        }

    except Exception:
        if image_path.exists():
            image_path.unlink()

        raise