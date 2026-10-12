from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json
import random
from app.models.palm_analysis import PalmAnalysis
from app.database.connection import get_db
from app.models.notification import Notification
from app.models.user import User
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# Get notifications for the logged-in user
@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "notifications": [
            {
                "notification_id": notification.notification_id,
                "notification_type": notification.notification_type,
                "title": notification.title,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at
            }
            for notification in notifications
        ]
    }


# Get unread notification count
@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.user_id,
            Notification.is_read == False
        )
        .count()
    )

    return {
        "success": True,
        "unread_count": count
    }


# Mark one notification as read
@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.notification_id == notification_id,
            Notification.user_id == current_user.user_id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True
    db.commit()

    return {
        "success": True,
        "message": "Notification marked as read"
    }


# Mark all notifications as read
@router.put("/mark-all-read")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.user_id,
            Notification.is_read == False
        )
        .update(
            {"is_read": True},
            synchronize_session=False
        )
    )

    db.commit()

    return {
        "success": True,
        "message": "All notifications marked as read"
    }


@router.post("/daily-guidance")
def create_daily_guidance(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    palm_analysis = (
        db.query(PalmAnalysis)
        .filter(PalmAnalysis.user_id == current_user.user_id)
        .order_by(PalmAnalysis.created_at.desc())
        .first()
    )

    # Default guidance options
    guidance_options = [
        "Take some time today to focus on one important goal and maintain consistency in your actions.",
        "Give yourself a few quiet minutes today to reflect on what you want to improve and take one small step forward.",
        "Stay focused on your priorities today. Progress comes from completing small actions consistently.",
        "Use today as an opportunity to learn something new and move one step closer to your personal goals."
    ]

    palm_shape = ""
    finger_structure = ""

    # Read latest palm analysis
    if palm_analysis and palm_analysis.analysis_result:
        try:
            analysis_data = json.loads(
                palm_analysis.analysis_result
            )

            palm_shape = (
                analysis_data
                .get("palm_shape", {})
                .get("palm_shape", "")
            )

            finger_structure = (
                analysis_data
                .get("finger_analysis", {})
                .get("finger_structure", "")
            )

        except (json.JSONDecodeError, TypeError, AttributeError):
            pass

    # Personalized guidance based on palm analysis
    if palm_shape == "Long Palm" and finger_structure == "Short Fingers":

        guidance_options = [
            "Your reading suggests an imaginative and action-oriented pattern. Today, turn one creative idea into a practical step.",
            "Your reading suggests creativity combined with a direct approach. Choose one idea today and take action instead of overthinking it.",
            "Your pattern highlights imagination and quick action. Use that energy today to complete one meaningful task.",
            "Your reading suggests strong curiosity and an action-oriented nature. Explore one new idea and put it into practice today."
        ]

    elif palm_shape == "Long Palm":

        guidance_options = [
            "Your reading highlights imagination and curiosity. Take some quiet time today to explore one idea that can support your personal growth.",
            "Your reading suggests a thoughtful and imaginative nature. Give yourself time today to learn, reflect, or create something meaningful.",
            "Your pattern highlights curiosity and creativity. Today, explore something that interests you and see where it leads.",
            "Use your imaginative energy today to think about a new possibility and take one small step toward it."
        ]

    elif finger_structure == "Short Fingers":

        guidance_options = [
            "Your reading suggests a direct and action-oriented pattern. Choose one important goal today and take a clear step toward completing it.",
            "Your reading highlights a practical and action-focused nature. Avoid unnecessary delays and make progress on one important task today.",
            "Your pattern suggests that you work well through action. Pick a priority and start working on it today.",
            "Use your action-oriented nature positively today by completing something you've been putting off."
        ]

    # Get previous daily guidance messages for this user
    previous_notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.user_id,
            Notification.notification_type == "daily_guidance"
        )
        .order_by(Notification.created_at.desc())
        .limit(10)
        .all()
    )

    previous_messages = {
        notification.message
        for notification in previous_notifications
    }

    # Prefer guidance the user has not recently received
    available_options = [
        message
        for message in guidance_options
        if message not in previous_messages
    ]

    # If all options were recently used, start the cycle again
    if not available_options:
        available_options = guidance_options

    guidance_message = random.choice(available_options)

    # Create notification
    notification = Notification(
        user_id=current_user.user_id,
        notification_type="daily_guidance",
        title="🌞 Daily Guidance",
        message=guidance_message,
        is_read=False
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return {
        "success": True,
        "message": "Personalized daily guidance created",
        "notification": {
            "notification_id": notification.notification_id,
            "notification_type": notification.notification_type,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "created_at": notification.created_at
        }
    }

class AnnouncementRequest(BaseModel):
    title:str
    message:str

@router.post("/announcement")
def create_announcement(
    request: AnnouncementRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Only Administrator can send platform announcements
    if not current_user.role or current_user.role.role_name != "Administrator":
        raise HTTPException(
            status_code=403,
            detail="Only administrators can send platform announcements."
        )

    # Get all non-admin users
    users = (
        db.query(User)
        .filter(User.role_id != 4)
        .all()
    )

    for user in users:
        notification = Notification(
            user_id=user.user_id,
            notification_type="announcement",
            title=f"📢 {request.title}",
            message=request.message,
            is_read=False
        )

        db.add(notification)

    db.commit()

    return {
        "success": True,
        "message": "Platform announcement sent to all users",
        "recipient_count": len(users)
    }