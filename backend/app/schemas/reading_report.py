from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReadingReportCreate(BaseModel):
    reading_session_id: int


class ReadingReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    reading_session_id: int | None
    report_type: str
    title: str
    content: str
    created_at: datetime