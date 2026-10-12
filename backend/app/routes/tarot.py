import json
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from fastapi import Depends
from datetime import date, time,datetime
from pydantic import BaseModel
from sqlalchemy import func
from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.tarot_reading import TarotReading
from app.models.user import User
from app.models.tarot_session import TarotSession
from app.models.tarot_chat_message import TarotChatMessage
from app.models.tarot_reschedule import TarotReschedule
from app.models.notification import Notification
from uuid import uuid4
from fastapi.responses import FileResponse
from app.services.reports.report_generator import generate_tarot_report
from app.services.tarot.reading import generate_reading
from app.services.tarot.session import (
    create_tarot_session,
    select_tarot_cards,
    get_tarot_session,
)


router = APIRouter(
    prefix="/tarot",
    tags=["Tarot Reading"]
)


class TarotReadingRequest(BaseModel):
    spread_type: str
    orientation: str = "upright"


class TarotSessionRequest(BaseModel):
    spread_type: str

class CreateTarotUserSessionRequest(BaseModel):
    user_id: int
    spread_type: str ="single_card"
    scheduled_date: date
    scheduled_time: time

class CreateTarotSessionRequest(BaseModel):
    reader_id: int
    spread_type: str = "single_card"
    scheduled_date: date
    scheduled_time: time 


class TarotSelectionRequest(BaseModel):
    reading_id: str
    selected_indices: list[int]
    reader_session_id: str | None = None

class TarotChatMessageRequest(BaseModel):
    session_id: str
    message: str


class TarotRescheduleRequest(BaseModel):
    scheduled_date: date
    scheduled_time: time


# =====================================================
# NORMAL RANDOM TAROT READING
# =====================================================

@router.post("/reading")
def create_tarot_reading(
    request: TarotReadingRequest
):

    try:

        reading = generate_reading(
            spread_type=request.spread_type,
            orientation=request.orientation
        )

        return {
            "success": True,
            "reading": reading
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Tarot reading failed: {str(e)}"
        )

# =====================================================
# GET USERS FOR TAROT READING SESSION
# =====================================================

@router.get("/users")
def get_tarot_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        users = (
            db.query(User)
            .filter(User.role_id == 1)
            .order_by(User.username.asc())
            .all()
        )

        return {
            "success": True,
            "users": [
                {
                    "user_id": user.user_id,
                    "username": user.username,
                    "email": user.email,
                }
                for user in users
            ]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get Tarot users: {str(e)}"
        )

@router.get("/readers")
def get_tarot_readers(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        if current_user.role_id != 1:
            raise HTTPException(
                status_code=403,
                detail="Only Users can view Tarot Readers."
            )

        readers = (
            db.query(User)
            .filter(User.role_id == 2)
            .order_by(User.username.asc())
            .all()
        )

        return {
            "success": True,
            "readers": [
                {
                    "user_id": reader.user_id,
                    "username": reader.username,
                    "email": reader.email
                }
                for reader in readers
            ]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load Tarot Readers: {str(e)}"
        )
# =====================================================
# CREATE BLIND CARD SELECTION SESSION
# =====================================================

@router.post("/session")
def create_session(
    request: TarotSessionRequest
):

    try:

        session = create_tarot_session(
            spread_type=request.spread_type
        )

        return {
            "success": True,
            "session": session
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Tarot session creation failed: "
                f"{str(e)}"
            )
        )

# =====================================================
# CREATE TAROT READER SESSION FOR A USER
# =====================================================

@router.post("/sessions/create")
def create_tarot_user_session(
    request: CreateTarotUserSessionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    raise HTTPException(
        status_code=403,
        detail="Tarot Readers cannot create sessions. Users must request sessions."
    )

@router.post("/sessions/request")
def request_tarot_session(
    request: CreateTarotSessionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        if current_user.role_id != 1:
            raise HTTPException(
                status_code=403,
                detail="Only Users can request Tarot sessions."
            )

        selected_reader = (
            db.query(User)
            .filter(
                User.user_id == request.reader_id,
                User.role_id == 2
            )
            .first()
        )

        if not selected_reader:
            raise HTTPException(
                status_code=404,
                detail="Selected Tarot Reader was not found."
            )

        session_id = str(uuid4())

        session = TarotSession(
            session_id=session_id,
            reader_id=selected_reader.user_id,
            user_id=current_user.user_id,
            spread_type=request.spread_type,
            scheduled_date=request.scheduled_date,
            scheduled_time=request.scheduled_time,
            status="Pending",
            created_by="user"
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return {
            "success": True,
            "message": "Tarot session request created successfully.",
            "session": {
                "session_id": session.session_id,
                "reader_id": session.reader_id,
                "reader_name": selected_reader.username,
                "user_id": session.user_id,
                "spread_type": session.spread_type,
                "scheduled_date": str(session.scheduled_date),
                "scheduled_time": str(session.scheduled_time),
                "status": session.status,
                "created_by": session.created_by,
                "created_at": session.created_at
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Tarot session request failed: {str(e)}"
        ) 

@router.post("/sessions/{session_id}/chat")
def send_tarot_chat_message(
    session_id: str,
    request: TarotChatMessageRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    message_text = request.message.strip()

    if not message_text:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty."
        )

    session = (
        db.query(TarotSession)
        .filter(TarotSession.session_id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if current_user.user_id not in (session.user_id, session.reader_id):
        raise HTTPException(
            status_code=403,
            detail="You are not part of this session."
        )

    if session.status not in ("Scheduled", "Accepted"):
        raise HTTPException(
            status_code=400,
            detail="Chat is available only for accepted sessions."
        )

    chat_message = TarotChatMessage(
        session_id=session_id,
        sender_id=current_user.user_id,
        message=message_text
    )

    db.add(chat_message)
    db.commit()
    db.refresh(chat_message)

    return {
        "success": True,
        "message": {
            "message_id": chat_message.message_id,
            "session_id": chat_message.session_id,
            "sender_id": chat_message.sender_id,
            "message": chat_message.message,
            "created_at": chat_message.created_at
        }
    }

@router.get("/sessions/{session_id}/chat")
def get_tarot_chat_history(
    session_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    session = (
        db.query(TarotSession)
        .filter(TarotSession.session_id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if current_user.user_id not in (session.user_id, session.reader_id):
        raise HTTPException(
            status_code=403,
            detail="You are not part of this session."
        )

    messages = (
        db.query(TarotChatMessage, User.username)
        .outerjoin(User,User.user_id == TarotChatMessage.sender_id)
        .filter(TarotChatMessage.session_id == session_id)
        .order_by(TarotChatMessage.created_at.asc())
        .all()
    )

    return {
        "success": True,
        "messages": [
            {
                "message_id": msg.message_id,
                "session_id": msg.session_id,
                "sender_name": sender_username or f"User {msg.sender_id}",
                "sender_id": msg.sender_id,
                "message": msg.message,
                "created_at": msg.created_at
            }
            for msg, sender_username in messages
        ]
    }

@router.put("/sessions/{session_id}/reschedule")
def reschedule_tarot_session(
    session_id: str,
    request: TarotRescheduleRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    session = (
        db.query(TarotSession)
        .filter(TarotSession.session_id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if current_user.user_id not in (session.user_id, session.reader_id):
        raise HTTPException(
            status_code=403,
            detail="You are not part of this session."
        )

    if session.status != "Scheduled":
        raise HTTPException(
            status_code=400,
            detail="Only scheduled sessions can be rescheduled."
        )

    pending_proposal = (
        db.query(TarotReschedule)
        .filter(
            TarotReschedule.session_id == session_id,
            TarotReschedule.status == "Pending"
        )
        .first()
    )

    if pending_proposal:
        raise HTTPException(
            status_code=400,
            detail="A rescheduling proposal is already pending."
        )

    if (
        request.scheduled_date == session.scheduled_date
        and request.scheduled_time == session.scheduled_time
    ):
        raise HTTPException(
            status_code=400,
            detail="Choose a different date or time."
        )

    proposal = TarotReschedule(
        session_id=session_id,
        proposed_by=current_user.user_id,
        proposed_date=request.scheduled_date,
        proposed_time=request.scheduled_time,
        status="Pending"
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return {
        "success": True,
        "message": "Rescheduling proposal sent for approval.",
        "proposal": {
            "reschedule_id": proposal.reschedule_id,
            "session_id": proposal.session_id,
            "proposed_by": proposal.proposed_by,
            "proposed_date": str(proposal.proposed_date),
            "proposed_time": str(proposal.proposed_time),
            "status": proposal.status
        }
    }

@router.put("/reschedules/{reschedule_id}/decision")
def decide_tarot_reschedule(
    reschedule_id: int,
    decision: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    proposal = (
        db.query(TarotReschedule)
        .filter(TarotReschedule.reschedule_id == reschedule_id)
        .first()
    )

    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    session = (
        db.query(TarotSession)
        .filter(TarotSession.session_id == proposal.session_id)
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if current_user.user_id not in (session.user_id, session.reader_id):
        raise HTTPException(
            status_code=403,
            detail="You are not part of this session."
        )

    if current_user.user_id == proposal.proposed_by:
        raise HTTPException(
            status_code=403,
            detail="Only the other participant can decide this proposal."
        )

    if proposal.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail="This proposal has already been decided."
        )

    if decision not in ("Accepted", "Rejected"):
        raise HTTPException(
            status_code=400,
            detail="Decision must be Accepted or Rejected."
        )

    proposal.status = decision

    if decision == "Accepted":
        session.scheduled_date = proposal.proposed_date
        session.scheduled_time = proposal.proposed_time

    db.commit()
    db.refresh(proposal)
    db.refresh(session)

    return {
        "success": True,
        "message": f"Rescheduling proposal {decision.lower()}.",
        "proposal_status": proposal.status,
        "session": {
            "session_id": session.session_id,
            "scheduled_date": str(session.scheduled_date),
            "scheduled_time": str(session.scheduled_time),
            "status": session.status
        }
    }

@router.get("/sessions/{session_id}/reschedules")
def get_tarot_reschedule_proposals(
    session_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    session = (
        db.query(TarotSession)
        .filter(TarotSession.session_id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if current_user.user_id not in (session.user_id, session.reader_id):
        raise HTTPException(
            status_code=403,
            detail="You are not part of this session."
        )

    proposals = (
        db.query(TarotReschedule, User.username)
        .outerjoin(User,User.user_id == TarotReschedule.proposed_by)
        .filter(TarotReschedule.session_id == session_id)
        .order_by(TarotReschedule.created_at.desc())
        .all()
    )

    return {
        "success": True,
        "proposals": [
            {
                "reschedule_id": proposal.reschedule_id,
                "session_id": proposal.session_id,
                "proposed_by": proposer_username or "Unknown User",
                "proposed_date": str(proposal.proposed_date),
                "proposed_time": str(proposal.proposed_time),
                "status": proposal.status,
                "created_at": proposal.created_at
            }
            for proposal, proposer_username in proposals
        ]
    }

@router.get("/sessions/requests")
def get_tarot_session_requests(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        if current_user.role_id != 2:
            raise HTTPException(
                status_code=403,
                detail="Only Tarot Readers can view session requests."
            )

        requests = (
            db.query(TarotSession, User)
            .join(User, TarotSession.user_id == User.user_id)
            .filter(
                TarotSession.reader_id == current_user.user_id,
                TarotSession.created_by == "user",
                TarotSession.status == "Pending"
            )
            .order_by(TarotSession.created_at.desc())
            .all()
        )

        return {
            "success": True,
            "requests": [
                {
                    "session_id": session.session_id,
                    "user_id": session.user_id,
                    "username": user.username,
                    "spread_type": session.spread_type,
                    "scheduled_date": str(session.scheduled_date),
                    "scheduled_time": str(session.scheduled_time),
                    "status": session.status,
                    "created_by": session.created_by,
                    "created_at": session.created_at
                }
                for session, user in requests
            ]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load Tarot session requests: {str(e)}"
        )


@router.get("/sessions/reader-sessions")
def get_reader_tarot_sessions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        if current_user.role_id != 2:
            raise HTTPException(
                status_code=403,
                detail="Only Tarot Readers can view their sessions."
            )

        sessions = (
            db.query(TarotSession, User)
            .join(User, TarotSession.user_id == User.user_id)
            .filter(
                TarotSession.reader_id == current_user.user_id,
                TarotSession.created_by == "user",
                TarotSession.status.in_(["Accepted", "Scheduled"])
            )
            .order_by(TarotSession.created_at.desc())
            .all()
        )

        return {
            "success": True,
            "sessions": [
                {
                    "session_id": session.session_id,
                    "user_id": session.user_id,
                    "username": user.username,
                    "spread_type": session.spread_type,
                    "scheduled_date": str(session.scheduled_date),
                    "scheduled_time": str(session.scheduled_time),
                    "status": session.status,
                    "created_by": session.created_by,
                    "created_at": session.created_at
                }
                for session, user in sessions
            ]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load Tarot Reader sessions: {str(e)}"
        )

@router.get("/sessions/my-requests")
def get_my_tarot_sessions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        if current_user.role_id != 1:
            raise HTTPException(
                status_code=403,
                detail="Only Users can view their Tarot sessions."
            )

        sessions = (
            db.query(TarotSession, User)
            .join(User, TarotSession.reader_id == User.user_id)
            .filter(
                TarotSession.user_id == current_user.user_id
            )
            .order_by(TarotSession.created_at.desc())
            .all()
        )

        return {
            "success": True,
            "sessions": [
                {
                    "session_id": session.session_id,
                    "reader_id": session.reader_id,
                    "reader_name": reader.username,
                    "spread_type": session.spread_type,
                    "scheduled_date": str(session.scheduled_date),
                    "scheduled_time": str(session.scheduled_time),
                    "status": session.status,
                    "created_by": session.created_by,
                    "created_at": session.created_at
                }
                for session, reader in sessions
            ]
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load your Tarot sessions: {str(e)}"
        )

@router.put("/sessions/{session_id}/status")
def update_tarot_session_status(
    session_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        if current_user.role_id != 2:
            raise HTTPException(
                status_code=403,
                detail="Only Tarot Readers can update session requests."
            )

        session = (
            db.query(TarotSession)
            .filter(
                TarotSession.session_id == session_id,
                TarotSession.reader_id == current_user.user_id
            )
            .first()
        )

        if not session:
            raise HTTPException(
                status_code=404,
                detail="Tarot session request not found."
            )

        if session.status != "Pending":
            raise HTTPException(
                status_code=400,
                detail="Only pending session requests can be updated."
            )

        if status not in ["Accepted", "Rejected"]:
            raise HTTPException(
                status_code=400,
                detail="Status must be Accepted or Rejected."
            )

        session.status = (
            "Scheduled" if status == "Accepted" else "Rejected"
        )

        db.commit()
        db.refresh(session)

        if status == "Accepted":

            formatted_time = (
                session.scheduled_time.strftime("%I:%M %p").lstrip("0")
                if session.scheduled_time
                else "the scheduled time"
            )

            reminder_notification = Notification(
                user_id=session.user_id,
                notification_type="reading_reminder",
                title="🔔 Tarot Reading Reminder",
                message=(
                    f"Your Tarot session with {current_user.username} "
                    f"is scheduled for {session.scheduled_date} "
                    f"at {formatted_time}. "
                    f"Please be ready for your reading."
                ),
                is_read=False
            )

            db.add(reminder_notification)
            db.commit()

        return {
            "success": True,
            "message": f"Tarot session request {status.lower()} successfully.",
            "session": {
                "session_id": session.session_id,
                "user_id": session.user_id,
                "reader_id": session.reader_id,
                "spread_type": session.spread_type,
                "scheduled_date": str(session.scheduled_date),
                "scheduled_time": str(session.scheduled_time),
                "status": session.status,
                "created_by": session.created_by
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Unable to update Tarot session request: {str(e)}"
        )

@router.put("/sessions/{session_id}/invitation-status")
def update_tarot_session_invitation_status(
    session_id: str,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only Users can respond to Tarot Reader invitations
    if current_user.role_id != 1:
        raise HTTPException(
            status_code=403,
            detail="Only Users can respond to Tarot session invitations."
        )

    # Find the session
    session = (
        db.query(TarotSession)
        .filter(
            TarotSession.session_id == session_id,
            TarotSession.user_id == current_user.user_id,
            TarotSession.created_by == "reader",
        )
        .first()
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Tarot session invitation not found."
        )

    # Only Invited sessions can be responded to
    if session.status != "Invited":
        raise HTTPException(
            status_code=400,
            detail="Only pending invitations can be responded to."
        )

    # Accept or reject only
    if status not in ["Accepted", "Rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be Accepted or Rejected."
        )

    if status == "Accepted":
        session.status = "Scheduled"
    else:
        session.status = "Rejected"

    db.commit()
    db.refresh(session)
    if status == "Accepted":

        reminder_notification = Notification(
            user_id=session.reader_id,
            notification_type="reading_reminder",
            title="🔔 Tarot Reading Reminder",
            message=(
                f"{current_user.username} has accepted the Tarot session "
                f"scheduled for {session.scheduled_date} "
                f"at {session.scheduled_time.strftime('%I:%M %p').lstrip('0') if session.scheduled_time else 'the scheduled time'}."
            ),
            is_read=False
        )

        db.add(reminder_notification)
        db.commit()

    reader = (
        db.query(User)
        .filter(User.user_id == session.reader_id)
        .first()
    )

    return {
        "success": True,
        "message": f"Tarot session invitation {status.lower()} successfully.",
        "session": {
            "session_id": session.session_id,
            "reader_id": session.reader_id,
            "reader_name": reader.username if reader else "Unknown Reader",
            "user_id": session.user_id,
            "spread_type": session.spread_type,
            "scheduled_date": (
                session.scheduled_date.isoformat()
                if session.scheduled_date
                else None
            ),
            "scheduled_time": (
                session.scheduled_time.isoformat()
                if session.scheduled_time
                else None
            ),
            "status": session.status,
            "created_by": session.created_by,
        },
    }

# =====================================================
# SELECT AND REVEAL CARDS
# =====================================================

@router.post("/select")
def select_cards(
    request: TarotSelectionRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    try:

        session = select_tarot_cards(
            reading_id=request.reading_id,
            selected_indices=request.selected_indices
        )

        reading_user_id = current_user.user_id

        if request.reader_session_id:
            reader_session = (
                db.query(TarotSession)
                .filter(
                    TarotSession.session_id == request.reader_session_id,
                    TarotSession.reader_id == current_user.user_id
                )
                .first()
            )

            if not reader_session:
                raise HTTPException(
                    status_code=404,
                    detail="Tarot Reader session was not found."
                )

            reading_user_id = reader_session.user_id
        
        reading_record = TarotReading(
            reading_id=request.reading_id,
            user_id=reading_user_id,
            spread_type=session["spread_type"],
            spread_name=session["spread_name"],
            card_count=len(session["revealed_cards"]),
            cards=json.dumps(session["revealed_cards"]),
            overall_reading=session.get("overall_reading","")
        )
        db.add(reading_record)
        db.commit()

        return {
            "success": True,
            "message": "Cards selected successfully.",
            "reading_id": request.reading_id,
            "selected_count": len(
                session["selected_indices"]
            ),
            "cards": session.get(
                "revealed_cards",
                []
            ),
             "overall_reading": session.get(
                "overall_reading",
                ""
            )
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=(
                "Card selection failed: "
                f"{str(e)}"
            )
        )

@router.get("/analytics/total-readings")
def get_total_readings(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        total_readings = db.query(TarotReading).count()

        return {
            "success": True,
            "total_readings": total_readings
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get total readings: {str(e)}"
        )

@router.get("/analytics/scheduled-sessions")
def get_scheduled_sessions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        scheduled_sessions = (
            db.query(TarotSession)
            .filter(
                TarotSession.reader_id == current_user.user_id,
                TarotSession.status == "Scheduled"
            )
            .count()
        )

        return {
            "success": True,
            "scheduled_sessions": scheduled_sessions
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get scheduled sessions: {str(e)}"
        )

@router.get("/analytics/session-status-summary")
def get_session_status_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        sessions = (
            db.query(TarotSession.status)
            .filter(
                TarotSession.reader_id == current_user.user_id
            )
            .all()
        )
        print("SESSION STATUSES:", [session[0] for session in sessions])

        total_sessions = len(sessions)

        scheduled_sessions = 0
        pending_sessions = 0
        invited_sessions = 0
        rejected_sessions = 0

        for session in sessions:
            status = session[0]

            if status == "Scheduled":
                scheduled_sessions += 1

            elif status == "Pending":
                pending_sessions += 1

            elif status == "Invited":
                invited_sessions += 1

            elif status == "Rejected":
                rejected_sessions += 1

        return {
            "success": True,
            "total_sessions": total_sessions,
            "scheduled_sessions": scheduled_sessions,
            "pending_sessions": pending_sessions,
            "invited_sessions": invited_sessions,
            "rejected_sessions": rejected_sessions
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get session status summary: {str(e)}"
        )

@router.get("/analytics/users-served")
def get_users_served(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        users_served = (
            db.query(TarotReading.user_id)
            .filter(TarotReading.user_id.isnot(None))
            .distinct()
            .count()
        )

        return {
            "success": True,
            "users_served": users_served
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get users served: {str(e)}"
        )

@router.get("/analytics/cards-used")
def get_cards_used(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        cards_used = (
            db.query(TarotReading.card_count)
            .filter(TarotReading.card_count.isnot(None))
            .all()
        )

        total_cards = sum(
            card[0] for card in cards_used
        )

        return {
            "success": True,
            "cards_used": total_cards
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get cards used: {str(e)}"
        )

@router.get("/analytics/reading-activity")
def get_reading_activity(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        readings = (
            db.query(TarotReading.created_at)
            .filter(TarotReading.created_at.isnot(None))
            .all()
        )

        activity = {}

        for reading in readings:
            date = reading[0].date().isoformat()

            if date not in activity:
                activity[date] = 0

            activity[date] += 1

        return {
            "success": True,
            "reading_activity": activity
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get reading activity: {str(e)}"
        )
@router.get("/analytics/spread-usage")
def get_spread_usage(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        spread_counts = (
            db.query(
                TarotReading.spread_type,
                func.count(TarotReading.reading_id)
            )
            .filter(TarotReading.spread_type.isnot(None))
            .group_by(TarotReading.spread_type)
            .all()
        )

        spread_usage = []

        for spread_type, count in spread_counts:
            spread_usage.append({
                "spread_type": spread_type,
                "count": count
            })

        return {
            "success": True,
            "spread_usage": spread_usage
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get spread usage: {str(e)}"
        )

@router.get("/analytics/active-users")
def get_active_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        active_users = (
            db.query(TarotReading.user_id)
            .filter(TarotReading.user_id.isnot(None))
            .distinct()
            .count()
        )

        return {
            "success": True,
            "active_users": active_users
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get active users: {str(e)}"
        )

@router.get("/analytics/repeat-users")
def get_repeat_users(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        repeat_users = (
            db.query(TarotReading.user_id)
            .filter(TarotReading.user_id.isnot(None))
            .group_by(TarotReading.user_id)
            .having(func.count(TarotReading.reading_id) > 1)
            .count()
        )

        return {
            "success": True,
            "repeat_users": repeat_users
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get repeat users: {str(e)}"
        )

@router.get("/analytics/average-readings-per-user")
def get_average_readings_per_user(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        total_readings = db.query(TarotReading).count()

        active_users = (
            db.query(TarotReading.user_id)
            .filter(TarotReading.user_id.isnot(None))
            .distinct()
            .count()
        )

        average_readings = (
            total_readings / active_users
            if active_users > 0
            else 0
        )

        return {
            "success": True,
            "average_readings_per_user": round(average_readings, 2)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to calculate average readings per user: {str(e)}"
        )

@router.get("/analytics/total-sessions")
def get_total_sessions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        total_sessions = db.query(TarotReading).count()

        return {
            "success": True,
            "total_sessions": total_sessions
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get total sessions: {str(e)}"
        )

@router.get("/analytics/session-status")
def get_session_status(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        latest_session = (
            db.query(TarotReading)
            .order_by(TarotReading.created_at.desc())
            .first()
        )

        if latest_session:
            status = "Completed"
        else:
            status = "No Sessions"

        return {
            "success": True,
            "status": status
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get session status: {str(e)}"
        )

@router.get("/analytics/recent-sessions")
def get_recent_sessions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        recent_sessions = (
            db.query(TarotReading)
            .order_by(TarotReading.created_at.desc())
            .limit(5)
            .all()
        )

        sessions = []

        for session in recent_sessions:
            sessions.append({
                "reading_id": session.reading_id,
                "spread_name": session.spread_name,
                "spread_type": session.spread_type,
                "card_count": session.card_count,
                "created_at": session.created_at
            })

        return {
            "success": True,
            "recent_sessions": sessions
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get recent sessions: {str(e)}"
        )

@router.get("/reports")
def get_tarot_reports(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        reports = (
            db.query(TarotReading)
            .filter(TarotReading.user_id.isnot(None))
            .order_by(TarotReading.created_at.desc())
            .all()
        )

        return {
            "success": True,
            "reports": [
                {
                    "reading_id": report.reading_id,
                    "spread_name": report.spread_name,
                    "spread_type": report.spread_type,
                    "card_count": report.card_count,
                    "created_at": report.created_at.isoformat()
                    if report.created_at
                    else None
                }
                for report in reports
            ]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to get Tarot reports: {str(e)}"
        )

@router.get("/report/{reading_id}")
def generate_tarot_reading_report(
    reading_id: str,
    db: Session = Depends(get_db)
):
    try:
        # First, check the database
        report = (
            db.query(TarotReading)
            .filter(TarotReading.reading_id == reading_id)
            .first()
        )

        if report and report.cards:
            cards = json.loads(report.cards)

            reading = {
                "spread_type": report.spread_type,
                "spread_name": report.spread_name,
                "card_count": report.card_count,
                "cards": cards,
                "overall_reading": report.overall_reading or "",
            }

        else:
            # Fall back to the active Tarot session
            session = get_tarot_session(reading_id)

            if not session.get("revealed_cards"):
                raise ValueError(
                    "No completed Tarot reading found."
                )

            reading = {
                "spread_type": session.get("spread_type", ""),
                "spread_name": session.get("spread_name", ""),
                "card_count": session.get("card_count", 0),
                "cards": session.get("revealed_cards", []),
                "overall_reading": session.get(
                    "overall_reading", ""
                ),
            }

        output_path = (
            f"reports/tarot_{reading_id}.pdf"
        )

        generate_tarot_report(
            reading=reading,
            output_path=output_path,
        )

        return FileResponse(
            path=output_path,
            media_type="application/pdf",
            filename=f"tarot_reading_{reading_id}.pdf",
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate Tarot report: {str(e)}"
        )