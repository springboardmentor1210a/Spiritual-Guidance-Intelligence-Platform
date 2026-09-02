from pydantic import BaseModel, ConfigDict


class ReadingPreferenceCreate(BaseModel):
    preferred_reading_type: str | None = None
    preferred_spread: str | None = None
    language: str = "English"
    frequency: str | None = None


class ReadingPreferenceUpdate(BaseModel):
    preferred_reading_type: str | None = None
    preferred_spread: str | None = None
    language: str | None = None
    frequency: str | None = None


class ReadingPreferenceResponse(BaseModel):
    id: int
    user_id: int
    preferred_reading_type: str | None
    preferred_spread: str | None
    language: str
    frequency: str | None

    model_config = ConfigDict(from_attributes=True)