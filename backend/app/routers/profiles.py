from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, UserProfile

router = APIRouter(prefix="/api/profiles", tags=["Profiles"])

# Role-specific professional details are stored in the existing UserProfile.bio
# Text column as JSON for non-user roles. This avoids requiring a database reset
# or a schema migration. Regular user profile fields continue to use their
# existing columns and retain their existing behaviour.

PROFESSIONAL_FIELDS = {
    "admin": (
        "department",
        "administrative_responsibilities",
        "reporting_preferences",
    ),
    "tarot_reader": (
        "experience_years",
        "specialties",
        "supported_spreads",
        "professional_biography",
        "reading_approach",
        "languages",
        "session_duration",
        "availability",
        "consultation_preferences",
    ),
    "consultant": (
        "experience_years",
        "specialties",
        "professional_biography",
        "reading_approach",
        "languages",
        "session_duration",
        "availability",
        "consultation_preferences",
    ),
}

MAX_TEXT = 4000


class ProfilePayload(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
    age_group: str | None = Field(default=None, max_length=50)
    interests: str | None = Field(default=None, max_length=2000)
    spiritual_goals: str | None = Field(default=None, max_length=2000)
    reading_preferences: str | None = Field(default=None, max_length=2000)
    bio: str | None = Field(default=None, max_length=MAX_TEXT)

    department: str | None = Field(default=None, max_length=500)
    administrative_responsibilities: str | None = Field(default=None, max_length=MAX_TEXT)
    reporting_preferences: str | None = Field(default=None, max_length=MAX_TEXT)

    experience_years: int | str | None = None
    specialties: str | None = Field(default=None, max_length=MAX_TEXT)
    supported_spreads: str | None = Field(default=None, max_length=MAX_TEXT)
    professional_biography: str | None = Field(default=None, max_length=MAX_TEXT)
    reading_approach: str | None = Field(default=None, max_length=MAX_TEXT)
    languages: str | None = Field(default=None, max_length=500)
    session_duration: str | None = Field(default=None, max_length=200)
    availability: str | None = Field(default=None, max_length=1000)
    consultation_preferences: str | None = Field(default=None, max_length=MAX_TEXT)


def _role_key(role: str | None) -> str:
    value = str(role or "user").lower().replace("-", "_").replace(" ", "_")
    if "admin" in value:
        return "admin"
    if "tarot" in value:
        return "tarot_reader"
    if "consultant" in value:
        return "consultant"
    return "user"


def _clean(value: Any) -> Any:
    if isinstance(value, str):
        return value.strip() or None
    return value


def _decode_professional_data(profile: UserProfile | None) -> dict[str, Any]:
    if not profile or not profile.bio:
        return {}
    try:
        value = json.loads(profile.bio)
        return value if isinstance(value, dict) else {}
    except (json.JSONDecodeError, TypeError):
        # If a professional account previously used a plain-text bio, retain it.
        return {"professional_biography": profile.bio}


def _profile_payload(user: User, profile: UserProfile | None) -> dict[str, Any]:
    role = _role_key(user.role)
    professional_data: dict[str, Any] = {}
    bio_value = getattr(profile, "bio", None)

    if role in PROFESSIONAL_FIELDS:
        professional_data = _decode_professional_data(profile)
        # Migrate older profile values into the relevant fields when possible.
        if not professional_data and profile:
            if role == "admin":
                professional_data = {
                    "administrative_responsibilities": profile.spiritual_goals or "",
                    "department": profile.interests or "",
                    "reporting_preferences": profile.reading_preferences or "",
                }
            elif role == "tarot_reader":
                professional_data = {
                    "professional_biography": profile.bio or "",
                    "specialties": profile.interests or "",
                    "reading_approach": profile.spiritual_goals or "",
                    "consultation_preferences": profile.reading_preferences or "",
                }
            else:
                professional_data = {
                    "professional_biography": profile.bio or "",
                    "specialties": profile.interests or "",
                    "reading_approach": profile.spiritual_goals or "",
                    "consultation_preferences": profile.reading_preferences or "",
                }
        bio_value = None

    return {
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active,
        },
        "profile": {
            "age_group": getattr(profile, "age_group", None),
            "interests": getattr(profile, "interests", None) if role == "user" else None,
            "spiritual_goals": getattr(profile, "spiritual_goals", None) if role == "user" else None,
            "reading_preferences": getattr(profile, "reading_preferences", None) if role == "user" else None,
            "bio": bio_value if role == "user" else None,
        },
        "professional_data": professional_data,
    }


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )
    return _profile_payload(current_user, profile)


@router.put("/me")
def update_my_profile(
    payload: ProfilePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = _role_key(current_user.role)

    if payload.full_name is not None:
        cleaned_name = payload.full_name.strip()
        if cleaned_name:
            current_user.full_name = cleaned_name

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == current_user.id)
        .first()
    )
    if profile is None:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    data = payload.model_dump(exclude_unset=True)

    if role == "user":
        for field in (
            "age_group",
            "interests",
            "spiritual_goals",
            "reading_preferences",
            "bio",
        ):
            if field in data:
                setattr(profile, field, _clean(data[field]))
    else:
        allowed_fields = PROFESSIONAL_FIELDS.get(role, ())
        existing = _decode_professional_data(profile)

        # Preserve legacy text bio as a biography if it has not yet been
        # migrated to the structured professional-data JSON object.
        if not existing and profile.bio:
            if role in ("tarot_reader", "consultant"):
                existing["professional_biography"] = profile.bio

        for field in allowed_fields:
            if field in data:
                value = _clean(data[field])
                if field == "experience_years" and value not in (None, ""):
                    try:
                        value = max(0, min(80, int(value)))
                    except (TypeError, ValueError):
                        value = None
                existing[field] = value

        # Keep professional fields out of the regular user's preference columns.
        # Use the existing Text column so existing databases need no migration.
        profile.bio = json.dumps(existing, ensure_ascii=False)
        profile.age_group = None
        profile.interests = None
        profile.spiritual_goals = None
        profile.reading_preferences = None

    db.commit()
    db.refresh(current_user)
    db.refresh(profile)
    return _profile_payload(current_user, profile)
