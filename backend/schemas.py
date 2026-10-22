from pydantic import BaseModel, EmailStr, field_validator


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role:str = "user"

    @field_validator("password")
    @classmethod
    def validate_password(cls, value):
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 bytes or less")

        if len(value) < 6:
            raise ValueError("Password must be at least 6 characters")

        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True


class ProfileCreate(BaseModel):
    full_name: str | None = None
    age: int | None = None
    age_group: str | None = None
    gender: str | None = None
    date_of_birth: str | None = None
    occupation: str | None = None
    profile_image: str | None = None

    interests: str | None = None
    spiritual_interests: str | None = None
    goals: str | None = None
    spiritual_goals: str | None = None

    reading_preferences: str | None = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int

    full_name: str | None = None
    age: int | None = None
    age_group: str | None = None
    gender: str | None = None
    date_of_birth: str | None = None
    occupation: str | None = None
    profile_image: str | None = None

    interests: str | None = None
    spiritual_interests: str | None = None
    goals: str | None = None
    spiritual_goals: str | None = None

    reading_preferences: str | None = None

    class Config:
        from_attributes = True