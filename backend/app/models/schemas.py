from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==========================================
# 1. AUTHENTICATION & USER SCHEMAS
# ==========================================
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    # role is never accepted from the client -- always forced to "User" server-side.

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class RoleUpdate(BaseModel):
    role: str  # "User" | "Tarot Reader" | "Spiritual Consultant" | "Admin"

# --- Email verification (signup) ---
class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

# --- Login OTP ---
class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str

# --- Shared resend for either a verification code or a login OTP ---
class ResendCodeRequest(BaseModel):
    email: EmailStr
    purpose: str = "verify"  # "verify" | "otp"

# --- Request one-time login code ---
class RequestLoginCodeRequest(BaseModel):
    email: EmailStr

# --- Google OAuth sign-in ---
class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    demo: Optional[bool] = False
    email: Optional[str] = None
    name: Optional[str] = None


# ==========================================
# 2. USER PROFILE SCHEMAS
# ==========================================
class UserProfileCreate(BaseModel):
    name: Optional[str] = None
    age_group: Optional[str] = None
    interests: Optional[str] = None
    spiritual_goals: Optional[str] = None
    reading_preferences: Optional[str] = None
    role: Optional[str] = None

class UserProfileResponse(UserProfileCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# ==========================================
# 3. TAROT ENGINE SCHEMAS
# ==========================================
class TarotCardSchema(BaseModel):
    position: str
    name: str
    orientation: str
    meaning: str
    image: Optional[str] = ""

class TarotDrawResponse(BaseModel):
    status: str = "success"
    spread_type: str
    cards: List[TarotCardSchema]


# ==========================================
# 4. PALMISTRY ENGINE SCHEMAS
# ==========================================
class PalmAnalysisResponse(BaseModel):
    status: str = "success"
    filename: str
    analysis: str


# ==========================================
# 5. READING HISTORY SCHEMAS
# ==========================================
class ReadingHistoryItem(BaseModel):
    id: int
    reading_type: str
    title: str
    details: Any
    summary: str
    score: Optional[float] = None
    date: str

class ReadingHistoryResponse(BaseModel):
    total: int
    readings: List[ReadingHistoryItem]