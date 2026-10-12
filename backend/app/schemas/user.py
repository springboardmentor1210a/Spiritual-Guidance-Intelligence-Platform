from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from app.core.roles import UserRole
from typing import Optional


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    gender: str
    age_group: Optional[str] = None
    interests: Optional[str] = None
    spiritual_goals: Optional[str] = None
    reading_preferences: Optional[str] = None
    password: str
    role_id: int

class UserProfileUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    gender: str | None = None
    age_group: str | None = None
    interests: str | None = None
    spiritual_goals: str | None = None
    reading_preferences: str | None = None
    
class UserResponse(BaseModel):
    user_id: int
    username: str
    email: EmailStr
    gender: Optional[str] = None
    age_group: Optional[str] = None
    interests: Optional[str] = None
    spiritual_goals: Optional[str] = None
    reading_preferences: Optional[str] = None
    role_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str