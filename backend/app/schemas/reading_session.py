from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReadingSessionCreate(BaseModel):
    reading_type: str
    summary: str | None = None


class ReadingSessionResponse(BaseModel):
    id: int
    user_id: int
    reading_type: str
    summary: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)