from datetime import datetime
import os
import shutil
import tempfile

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import User, PalmReading
from routes.rbac import require_user

from palm_analysis import extract_palm_features
from ai_interpretation import generate_ai_interpretation
from reading_generation import generate_palmistry_guidance
from personality import generate_personality
from recommendations import generate_recommendations
from life_trends import generate_life_trends


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/palmistry",
    tags=["Palmistry"],
)


# ============================================================
# HELPER: SERIALIZE PALMISTRY READING
# ============================================================

def serialize_palmistry_reading(reading):
    """
    Convert a PalmReading database object into a dictionary
    suitable for returning through the API.

    The current PalmReading model does not contain an
    other_features database column, so this field defaults
    to an empty dictionary.
    """

    return {
        "id": reading.id,
        "reading_id": reading.id,
        "palm_reading_id": reading.id,

        "created_at": (
            reading.created_at.isoformat()
            if reading.created_at
            else None
        ),

        "image_filename": reading.image_filename,
        "image_path": reading.image_path,

        "palm_detected": reading.palm_detected,
        "detection_confidence": reading.detection_confidence,
        "analysis_confidence": reading.analysis_confidence,

        "life_line": reading.life_line,
        "heart_line": reading.heart_line,
        "head_line": reading.head_line,
        "fate_line": reading.fate_line,

        "palm_shape": getattr(
            reading,
            "palm_shape",
            None,
        ),

        "other_features": {},

        "interpretation": reading.interpretation,
        "personalized_guidance": reading.personalized_guidance,
    }


# ============================================================
# CREATE PALMISTRY READING
# ============================================================

@router.post("/reading")
def create_palmistry_reading(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    # Validate uploaded filename.
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please upload a palm image.",
        )

    # Validate image extension.
    allowed_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    }

    file_extension = os.path.splitext(
        file.filename
    )[1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid image format. "
                "Please upload JPG, JPEG, PNG or WEBP."
            ),
        )

    temp_file_path = None

    try:
        # ----------------------------------------------------
        # STEP 1: SAVE IMAGE TEMPORARILY
        # ----------------------------------------------------

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=file_extension,
        ) as temp_file:

            temp_file_path = temp_file.name

            shutil.copyfileobj(
                file.file,
                temp_file,
            )

        # ----------------------------------------------------
        # STEP 2: EXTRACT PALM FEATURES
        # ----------------------------------------------------

        palm_features = extract_palm_features(
            temp_file_path
        )

        if not isinstance(palm_features, dict):
            raise ValueError(
                "Palm analysis did not return valid feature data."
            )

        # ----------------------------------------------------
        # STEP 3: GENERATE INTERPRETATION
        # ----------------------------------------------------

        interpretation = generate_ai_interpretation(
            palm_features=palm_features
        )

        # ----------------------------------------------------
        # STEP 4: GENERATE PERSONALIZED GUIDANCE
        # ----------------------------------------------------

        personalized_guidance = generate_palmistry_guidance(
            palm_features=palm_features,
            interpretation=interpretation,
        )

        # ----------------------------------------------------
        # STEP 5: GENERATE PERSONALITY INSIGHTS
        # ----------------------------------------------------

        personality = generate_personality(
            palm_features=palm_features,
            tarot_card=None,
            tarot_meaning=None,
        )

        # ----------------------------------------------------
        # STEP 6: GENERATE RECOMMENDATIONS
        # ----------------------------------------------------

        recommendations = generate_recommendations(
            user_context={},
            palm_data=palm_features,
            tarot_data=None,
            guidance_data={
                "personality": personality,
                "interpretation": interpretation,
                "personalized_guidance": personalized_guidance,
            },
        )

        # ----------------------------------------------------
        # STEP 7: GENERATE LIFE TRENDS
        # ----------------------------------------------------

        life_trends = generate_life_trends(
            personality=personality,
            tarot_card=None,
            tarot_meaning=None,
        )

        # ----------------------------------------------------
        # STEP 8: SAVE READING TO DATABASE
        # ----------------------------------------------------

        reading = PalmReading(
            user_id=current_user.id,

            # Explicitly set the timestamp for new readings.
            created_at=datetime.utcnow(),

            image_filename=file.filename,

            # Preserves the existing image_path behavior.
            # The temporary image is deleted after analysis.
            image_path=file.filename,

            palm_detected=palm_features.get(
                "palm_detected",
                False,
            ),

            detection_confidence=palm_features.get(
                "detection_confidence",
                0,
            ),

            analysis_confidence=palm_features.get(
                "analysis_confidence",
                0,
            ),

            life_line=palm_features.get("life_line"),
            heart_line=palm_features.get("heart_line"),
            head_line=palm_features.get("head_line"),
            fate_line=palm_features.get("fate_line"),

            # Save the detected palm shape to the existing column.
            palm_shape=palm_features.get("palm_shape"),

            interpretation=interpretation,
            personalized_guidance=personalized_guidance,
        )

        db.add(reading)
        db.commit()
        db.refresh(reading)

        # ----------------------------------------------------
        # STEP 9: RETURN READING AND INSIGHTS
        # ----------------------------------------------------

        return {
            "status": "success",
            "source": "palmistry_only",
            "message": "Palmistry reading generated successfully.",
            "palm_reading_id": reading.id,

            "palmistry": {
                "detection": {
                    "palm_detected": palm_features.get(
                        "palm_detected",
                        False,
                    ),
                    "detection_confidence": palm_features.get(
                        "detection_confidence",
                        0,
                    ),
                    "analysis_confidence": palm_features.get(
                        "analysis_confidence",
                        0,
                    ),
                },

                "features": {
                    "life_line": palm_features.get("life_line"),
                    "life_confidence": palm_features.get(
                        "life_confidence",
                        0,
                    ),

                    "heart_line": palm_features.get("heart_line"),
                    "heart_confidence": palm_features.get(
                        "heart_confidence",
                        0,
                    ),

                    "head_line": palm_features.get("head_line"),
                    "head_confidence": palm_features.get(
                        "head_confidence",
                        0,
                    ),

                    "fate_line": palm_features.get("fate_line"),
                    "fate_confidence": palm_features.get(
                        "fate_confidence",
                        0,
                    ),

                    "palm_shape": palm_features.get("palm_shape"),

                    "other_features": palm_features.get(
                        "other_features",
                        {},
                    ),
                },

                "interpretation": interpretation,
                "personalized_guidance": personalized_guidance,
            },

            "palmistry_insights": {
                "personality": personality,
                "recommendations": recommendations,
                "life_trends": life_trends,
            },
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Palmistry analysis failed: {str(e)}",
        )

    finally:
        # Remove the temporary image file.
        if (
            temp_file_path
            and os.path.exists(temp_file_path)
        ):
            try:
                os.remove(temp_file_path)
            except OSError:
                pass

        try:
            file.file.close()
        except Exception:
            pass


# ============================================================
# PALMISTRY HISTORY
# ============================================================

@router.get("/history")
def get_palmistry_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    try:
        readings = (
            db.query(PalmReading)
            .filter(
                PalmReading.user_id == current_user.id
            )
            .order_by(
                PalmReading.id.desc()
            )
            .all()
        )

        history = [
            serialize_palmistry_reading(reading)
            for reading in readings
        ]

        return {
            "status": "success",
            "count": len(history),
            "readings": history,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load palmistry history: "
                + str(e)
            ),
        )


# ============================================================
# LATEST PALMISTRY READING
# ============================================================

@router.get("/latest")
def get_latest_palmistry_reading(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user),
):
    try:
        reading = (
            db.query(PalmReading)
            .filter(
                PalmReading.user_id == current_user.id
            )
            .order_by(
                PalmReading.id.desc()
            )
            .first()
        )

        if reading is None:
            return {
                "status": "success",
                "count": 0,
                "reading": None,
                "message": "No palmistry readings found.",
            }

        return {
            "status": "success",
            "count": 1,
            "reading": serialize_palmistry_reading(reading),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to load latest palmistry reading: "
                + str(e)
            ),
        )