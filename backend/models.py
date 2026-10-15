from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Enum,
    Text,
    ForeignKey,
    Numeric,
    UniqueConstraint,
)
from sqlalchemy.sql import func
import enum
from database import Base


class UserRole(str, enum.Enum):
    USER = "User"
    TAROT_READER = "Tarot Reader"
    PALM_ANALYST = "Palm Analyst"
    SPIRITUAL_CONSULTANT = "Spiritual Consultant"
    ADMINISTRATOR = "Administrator"


class ConsultantProfileStatus(str, enum.Enum):
    """
    Publication lifecycle for a Spiritual Consultant profile.

    PENDING: submitted but not yet approved for the public directory.
    APPROVED: approved by the platform, but not necessarily published.
    PUBLISHED: approved and visible in the User Guidance directory.
    REJECTED: not approved for publication.
    """
    PENDING = "pending"
    APPROVED = "approved"
    PUBLISHED = "published"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(
        Enum(UserRole),
        default=UserRole.USER,
        nullable=False,
    )
    account_status = Column(String(20), nullable=False, default="active", index=True)
    approval_note = Column(Text, nullable=True)
    approved_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)

    # ---------------------------------------------------------------
    # Profile identity
    # ---------------------------------------------------------------
    first_name = Column(String(80), nullable=True)
    last_name = Column(String(80), nullable=True)
    nickname = Column(String(80), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(40), nullable=True)

    # Optional seeker context used to personalize future readings.
    spiritual_interests = Column(Text, nullable=True)
    spiritual_goals = Column(Text, nullable=True)
    reading_preferences = Column(Text, nullable=True)

    # Profile image is stored as a compressed data URI.
    # The frontend should resize/compress images before sending them.
    profile_image = Column(Text, nullable=True)

    # ---------------------------------------------------------------
    # Account metadata
    # ---------------------------------------------------------------
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )


class ConsultantProfile(Base):
    """
    Professional directory profile for a Spiritual Consultant.

    Account credentials and general identity remain in User. This separate
    record contains professional information used by the Guidance directory.
    Only profiles with status='published' should be returned publicly.
    """
    __tablename__ = "consultant_profiles"

    id = Column(Integer, primary_key=True, index=True)

    # One professional profile per registered consultant account.
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )

    professional_name = Column(String(120), nullable=True)
    biography = Column(Text, nullable=True)
    specialties = Column(Text, nullable=True)
    years_experience = Column(Integer, nullable=False, default=0)
    languages = Column(Text, nullable=True)

    # Rates are stored as decimal currency values, not floating-point values.
    session_rate = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(3), nullable=False, default="INR")

    # Comma-separated values for the initial version:
    # examples: "chat,video,phone" and "weekday_evenings,weekends".
    session_modes = Column(Text, nullable=True)
    working_hours = Column(Text, nullable=True)

    # Availability is operational and distinct from directory approval.
    # Expected values: online, busy, offline.
    availability_status = Column(
        String(20),
        nullable=False,
        default="offline",
    )

    # New profiles are not public until explicitly approved and published.
    status = Column(
        String(20),
        nullable=False,
        default=ConsultantProfileStatus.PENDING.value,
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# =====================================================================
# Shared platform records used by multiple account roles
# =====================================================================


class ReadingRecord(Base):
    """Persistent index for palm, tarot, and other completed readings."""
    __tablename__ = "reading_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reading_type = Column(String(40), nullable=False, index=True)
    title = Column(String(180), nullable=True)
    status = Column(String(30), nullable=False, default="completed", index=True)
    summary = Column(Text, nullable=True)
    result_payload = Column(Text, nullable=True)
    source_reference = Column(String(160), nullable=True, index=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class Consultation(Base):
    """A booked or requested session between a seeker and a consultant."""
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    seeker_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    consultant_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    subject = Column(String(180), nullable=True)
    consultation_mode = Column(String(30), nullable=False, default="chat")
    status = Column(String(30), nullable=False, default="requested", index=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True, index=True)
    duration_minutes = Column(Integer, nullable=False, default=30)
    currency = Column(String(3), nullable=False, default="INR")
    agreed_rate = Column(Numeric(10, 2), nullable=True)
    seeker_notes = Column(Text, nullable=True)
    consultant_notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class PlatformNotification(Base):
    """In-app notification for a user, role, or the entire platform."""
    __tablename__ = "platform_notifications"

    id = Column(Integer, primary_key=True, index=True)
    recipient_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    target_role = Column(String(60), nullable=True, index=True)
    title = Column(String(180), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(40), nullable=False, default="platform")
    action_url = Column(String(500), nullable=True)
    is_read = Column(String(5), nullable=False, default="false", index=True)
    created_by_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
    read_at = Column(DateTime(timezone=True), nullable=True)


class NotificationRead(Base):
    """Per-account read state for global and role-targeted announcements."""
    __tablename__ = "notification_reads"

    id = Column(Integer, primary_key=True, index=True)
    notification_id = Column(
        Integer,
        ForeignKey("platform_notifications.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    read_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        # One account can mark a shared announcement read only once.
        UniqueConstraint("notification_id", "user_id", name="uq_notification_read_account"),
    )


class PlatformAuditLog(Base):
    """Administrative/security event trail for important platform actions."""
    __tablename__ = "platform_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action = Column(String(100), nullable=False, index=True)
    target_type = Column(String(80), nullable=True, index=True)
    target_id = Column(String(100), nullable=True, index=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
