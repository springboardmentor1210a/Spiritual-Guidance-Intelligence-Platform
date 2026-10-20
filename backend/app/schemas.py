from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ProfileUpdate(BaseModel):
    age_group: str | None = Field(default=None, max_length=40)
    interests: str | None = Field(default=None, max_length=2000)
    spiritual_goals: str | None = Field(default=None, max_length=2000)
    reading_preferences: str | None = Field(default=None, max_length=2000)
    bio: str | None = Field(default=None, max_length=2000)


class ProfileResponse(ProfileUpdate):
    user_id: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
