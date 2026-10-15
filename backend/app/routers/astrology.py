from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.astrology_service import VedicAstrologyEngine
from app.models.postgres_models import User
from app.core.security import get_current_user

router = APIRouter(prefix="/astrology", tags=["Astrology"])
engine = VedicAstrologyEngine()

class BirthDataRequest(BaseModel):
    birth_date: str
    birth_time: str
    latitude: float
    longitude: float

@router.post("/kundali")
async def get_kundali_reading(payload: BirthDataRequest, current_user: User = Depends(get_current_user)):
    chart = engine.calculate_kundali(
        payload.birth_date,
        payload.birth_time,
        payload.latitude,
        payload.longitude
    )
    return {"status": "success", "chart": chart}