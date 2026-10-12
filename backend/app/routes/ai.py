from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import traceback
import inspect
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.notification import Notification
import app.services.ai.interpretation as interpretation_module

from app.services.ai.interpretation import (
    generate_ai_interpretation
)
from app.services.reports.report_generator import (
    generate_personality_report,
    generate_spiritual_guidance_report,
    generate_insight_trend_report,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Interpretation"]
)


class AIInterpretationRequest(BaseModel):
    palm_analysis: dict | None = None
    tarot_reading: dict | None = None

class AIReportRequest(BaseModel):
    ai_interpretation: dict


@router.post("/interpret")
def interpret_results(
    request: AIInterpretationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:

        result = generate_ai_interpretation(
            palm_analysis=request.palm_analysis,
            tarot_reading=request.tarot_reading,
            tarot_intention=(
                request.tarot_reading.get("intention")
                if request.tarot_reading else None
            ),
            tarot_question=(
                request.tarot_reading.get("question")
                if request.tarot_reading else None
            )
        )

        if result.get("success"):
            notification = Notification(
                user_id=current_user.user_id,
                notification_type="insight_update",
                title="🧠 New AI Insight Available",
                message=(
                    "Your personalized AI interpretation has been "
                    "generated successfully. Open your results to "
                    "view your latest insights."
                ),
                is_read=False
            )

            db.add(notification)
            db.commit()

            if result.get("personal_growth"):
                spiritual_notification = Notification(
                    user_id=current_user.user_id,
                    notification_type="spiritual_growth",
                    title="🌱 Spiritual Growth Alert",
                    message=(
                        "Your latest reading contains personal growth "
                        "guidance. Open your results to explore your "
                        "spiritual growth insights."
                    ),
                    is_read=False
                )

                db.add(spiritual_notification)
                db.commit()

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"AI interpretation failed: {str(e)}"
        )

@router.post("/personality-report")
def generate_personality_ai_report(
    request: AIReportRequest,
    current_user=Depends(get_current_user)
):
    try:
        ai_data = request.ai_interpretation

        personality_data = ai_data.get(
            "personality_intelligence",
            {}
        )

        if not personality_data:
            raise HTTPException(
                status_code=400,
                detail="Personality intelligence data is not available."
            )

        output_path = (
            f"reports/personality_{current_user.user_id}.pdf"
        )

        generate_personality_report(
            personality_data=personality_data,
            output_path=output_path
        )

        from fastapi.responses import FileResponse

        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="personality_intelligence_report.pdf"
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate Personality report: {str(e)}"
        )


@router.post("/spiritual-guidance-report")
def generate_spiritual_guidance_ai_report(
    request: AIReportRequest,
    current_user=Depends(get_current_user)
):
    try:
        ai_data = request.ai_interpretation

        spiritual_data = ai_data.get(
            "spiritual_guidance_score",
            {}
        )

        if not spiritual_data:
            raise HTTPException(
                status_code=400,
                detail="Spiritual guidance score is not available."
            )

        output_path = (
            f"reports/spiritual_guidance_{current_user.user_id}.pdf"
        )

        generate_spiritual_guidance_report(
            spiritual_data=spiritual_data,
            output_path=output_path
        )

        from fastapi.responses import FileResponse

        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="spiritual_guidance_report.pdf"
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate Spiritual Guidance report: "
                f"{str(e)}"
            )
        )


@router.post("/insight-trend-report")
def generate_insight_trend_ai_report(
    request: AIReportRequest,
    current_user=Depends(get_current_user)
):
    try:
        ai_data = request.ai_interpretation

        trend_data = ai_data.get(
            "life_trend_analysis",
            {}
        )

        if not trend_data:
            raise HTTPException(
                status_code=400,
                detail="Life trend analysis is not available."
            )

        output_path = (
            f"reports/insight_trend_{current_user.user_id}.pdf"
        )

        generate_insight_trend_report(
            trend_data=trend_data,
            output_path=output_path
        )

        from fastapi.responses import FileResponse

        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename="insight_trend_report.pdf"
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate Insight Trend report: "
                f"{str(e)}"
            )
        )