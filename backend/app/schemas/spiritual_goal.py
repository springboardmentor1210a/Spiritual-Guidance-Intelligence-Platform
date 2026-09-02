from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SpiritualGoalCreate(BaseModel):
    goal: str
    description: str | None = None


class SpiritualGoalUpdate(BaseModel):
    goal: str | None = None
    description: str | None = None


class SpiritualGoalResponse(BaseModel):
    id: int
    user_id: int
    goal: str
    description: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)