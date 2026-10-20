from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Base, User
from app.routers.notifications import Notification

router = APIRouter(prefix="/api/platform-feedback", tags=["Platform Feedback & Complaints"])

class PlatformFeedback(Base):
    __tablename__ = "platform_feedback"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_type = Column(String(20), nullable=False, default="feedback", index=True)
    category = Column(String(60), nullable=False, default="general")
    rating = Column(Integer, nullable=True)
    subject = Column(String(180), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), nullable=False, default="open", index=True)
    admin_response = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class FeedbackCreate(BaseModel):
    submission_type: str = Field(default="feedback", pattern="^(feedback|complaint)$")
    category: str = Field(default="general", min_length=2, max_length=60)
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    subject: str = Field(min_length=3, max_length=180)
    message: str = Field(min_length=5, max_length=5000)

class FeedbackUpdate(BaseModel):
    status: str = Field(pattern="^(open|in_review|resolved|closed)$")
    admin_response: Optional[str] = Field(default=None, max_length=5000)

def now_utc():
    return datetime.now(timezone.utc)

def is_admin(user):
    return bool(getattr(user, "is_active", True)) and str(getattr(user, "role", "")).lower() == "admin"

def require_admin(current_user: User = Depends(get_current_user)):
    if not is_admin(current_user):
        raise HTTPException(status_code=403, detail="Administrator access is required.")
    return current_user

def serialize(item, user=None):
    return {
        "id": item.id, "user_id": item.user_id,
        "user_name": ((getattr(user, "full_name", None) or getattr(user, "username", None) or getattr(user, "email", None)) if user else None),
        "user_email": getattr(user, "email", None) if user else None,
        "submission_type": item.submission_type, "category": item.category,
        "rating": item.rating, "subject": item.subject, "message": item.message,
        "status": item.status, "admin_response": item.admin_response,
        "reviewed_by": item.reviewed_by, "reviewed_at": item.reviewed_at,
        "created_at": item.created_at, "updated_at": item.updated_at,
    }

def notify(db, user_id, title, message, path, source_key):
    db.add(Notification(
        user_id=user_id, notification_type="platform_feedback", title=title,
        message=message, action_path=path, source_key=source_key,
    ))

@router.post("")
def create_feedback(payload: FeedbackCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.submission_type == "feedback" and payload.rating is None:
        raise HTTPException(status_code=422, detail="Please provide a rating for feedback.")
    item = PlatformFeedback(
        user_id=current_user.id, submission_type=payload.submission_type,
        category=payload.category.strip(), rating=payload.rating,
        subject=payload.subject.strip(), message=payload.message.strip(), status="open",
    )
    db.add(item)
    db.flush()
    try:
        admins = db.query(User).filter(User.role == "admin", User.is_active.is_(True)).all()
        for admin_user in admins:
            notify(db, admin_user.id, "New feedback or complaint",
                   f"{payload.submission_type.title()} submitted: {item.subject}",
                   "/admin/feedback", f"platform-feedback:new:{item.id}:admin:{admin_user.id}")
        db.commit()
    except Exception:
        db.rollback()
        raise
    db.refresh(item)
    return {"message": "Your submission was received.", "item": serialize(item)}

@router.get("/me")
def my_feedback(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(PlatformFeedback).filter(
        PlatformFeedback.user_id == current_user.id
    ).order_by(PlatformFeedback.created_at.desc()).all()
    return {"items": [serialize(item) for item in items], "total": len(items)}

@router.get("/admin")
def admin_feedback(
    submission_type: Optional[str] = Query(None, pattern="^(feedback|complaint)$"),
    status: Optional[str] = Query(None, pattern="^(open|in_review|resolved|closed)$"),
    limit: int = Query(100, ge=1, le=300),
    current_user: User = Depends(require_admin), db: Session = Depends(get_db),
):
    query = db.query(PlatformFeedback)
    if submission_type:
        query = query.filter(PlatformFeedback.submission_type == submission_type)
    if status:
        query = query.filter(PlatformFeedback.status == status)
    items = query.order_by(PlatformFeedback.created_at.desc()).limit(limit).all()
    user_ids = {x.user_id for x in items}
    users = {x.id: x for x in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}
    return {"items": [serialize(x, users.get(x.user_id)) for x in items], "total": len(items)}

@router.patch("/admin/{feedback_id}")
def update_feedback(
    feedback_id: int, payload: FeedbackUpdate,
    current_user: User = Depends(require_admin), db: Session = Depends(get_db),
):
    item = db.query(PlatformFeedback).filter(PlatformFeedback.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback or complaint not found.")
    item.status = payload.status
    item.admin_response = payload.admin_response.strip() if payload.admin_response and payload.admin_response.strip() else None
    item.reviewed_by = current_user.id
    item.reviewed_at = now_utc()
    item.updated_at = now_utc()
    notify(db, item.user_id, "Your feedback or complaint was updated",
           f"Status: {item.status.replace('_', ' ').title()}. " + (item.admin_response or "Your submission has been reviewed."),
           "/feedback", f"platform-feedback:update:{item.id}:{item.updated_at.isoformat()}")
    db.commit()
    db.refresh(item)
    owner = db.query(User).filter(User.id == item.user_id).first()
    return {"message": "Feedback or complaint updated.", "item": serialize(item, owner)}
