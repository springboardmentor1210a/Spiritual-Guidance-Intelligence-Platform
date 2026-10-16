from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AIInterpretationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    reading_session_id: int

    interpretation_type: str
    context: str

    overview: str

    personality: str
    relationships: str
    career: str
    finance: str
    health_wellness: str
    personal_growth: str
    life_opportunities: str

    key_themes: list[str] = []
    dominant_patterns: list[dict] = []
    areas_to_reflect: list[str] = []
    synthesis: str = ""

    source_data: dict | None = None

    created_at: datetime