from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProfileBase(BaseModel):
    name: str | None = None
    age_group: str | None = None
    profile_image: str | None = None


class ProfileCreate(ProfileBase):
    pass


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
class SpiritualGoalBase(BaseModel):
    goal: str
    description: str | None = None


class SpiritualGoalCreate(SpiritualGoalBase):
    pass


class SpiritualGoalUpdate(SpiritualGoalBase):
    pass


class SpiritualGoalResponse(SpiritualGoalBase):
    id: int
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
class ReadingPreferenceBase(BaseModel):
    preferred_reading_type: str | None = None
    preferred_spread: str | None = None
    language: str = "English"
    frequency: str | None = None


class ReadingPreferenceCreate(ReadingPreferenceBase):
    pass


class ReadingPreferenceUpdate(ReadingPreferenceBase):
    pass


class ReadingPreferenceResponse(ReadingPreferenceBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
class SpiritualInterestResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)
class UserSpiritualInterestCreate(BaseModel):
    interest_id: int
class UserSpiritualInterestResponse(BaseModel):
    user_id: int
    interest_id: int
    interest: SpiritualInterestResponse

    model_config = ConfigDict(from_attributes=True)
class ReadingSessionResponse(BaseModel):
    id: int
    user_id: int
    reading_type: str
    summary: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)