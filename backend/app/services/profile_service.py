from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.models.reading_preference import ReadingPreference
from app.models.reading_session import ReadingSession
from app.models.spiritual_goal import SpiritualGoal
from app.models.spiritual_interest import SpiritualInterest
from app.models.user_spiritual_interest import UserSpiritualInterest


# ============================================================
# PROFILE
# ============================================================

def get_profile(
    db: Session,
    user_id: int,
) -> Profile | None:

    return (
        db.query(Profile)
        .filter(Profile.user_id == user_id)
        .first()
    )


def create_profile(
    db: Session,
    user_id: int,
    name: str | None = None,
    age_group: str | None = None,
    profile_image: str | None = None,
) -> Profile:

    profile = Profile(
        user_id=user_id,
        name=name,
        age_group=age_group,
        profile_image=profile_image,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def update_profile(
    db: Session,
    profile: Profile,
    name: str | None = None,
    age_group: str | None = None,
    profile_image: str | None = None,
) -> Profile:

    profile.name = name
    profile.age_group = age_group
    profile.profile_image = profile_image

    db.commit()
    db.refresh(profile)

    return profile


# ============================================================
# READING PREFERENCES
# ============================================================

def get_reading_preferences(
    db: Session,
    user_id: int,
) -> ReadingPreference | None:

    return (
        db.query(ReadingPreference)
        .filter(
            ReadingPreference.user_id == user_id
        )
        .first()
    )


def create_reading_preferences(
    db: Session,
    user_id: int,
    preferred_reading_type: str | None = None,
    preferred_spread: str | None = None,
    language: str = "English",
    frequency: str | None = None,
) -> ReadingPreference:

    preferences = ReadingPreference(
        user_id=user_id,
        preferred_reading_type=preferred_reading_type,
        preferred_spread=preferred_spread,
        language=language,
        frequency=frequency,
    )

    db.add(preferences)
    db.commit()
    db.refresh(preferences)

    return preferences


def update_reading_preferences(
    db: Session,
    preferences: ReadingPreference,
    preferred_reading_type: str | None = None,
    preferred_spread: str | None = None,
    language: str = "English",
    frequency: str | None = None,
) -> ReadingPreference:

    preferences.preferred_reading_type = preferred_reading_type
    preferences.preferred_spread = preferred_spread
    preferences.language = language
    preferences.frequency = frequency

    db.commit()
    db.refresh(preferences)

    return preferences


# ============================================================
# SPIRITUAL GOALS
# ============================================================

def get_spiritual_goals(
    db: Session,
    user_id: int,
) -> list[SpiritualGoal]:

    return (
        db.query(SpiritualGoal)
        .filter(SpiritualGoal.user_id == user_id)
        .order_by(SpiritualGoal.created_at.desc())
        .all()
    )


def create_spiritual_goal(
    db: Session,
    user_id: int,
    goal: str,
    description: str | None = None,
) -> SpiritualGoal:

    spiritual_goal = SpiritualGoal(
        user_id=user_id,
        goal=goal,
        description=description,
    )

    db.add(spiritual_goal)
    db.commit()
    db.refresh(spiritual_goal)

    return spiritual_goal


def get_spiritual_goal(
    db: Session,
    user_id: int,
    goal_id: int,
) -> SpiritualGoal | None:

    return (
        db.query(SpiritualGoal)
        .filter(
            SpiritualGoal.id == goal_id,
            SpiritualGoal.user_id == user_id,
        )
        .first()
    )


def update_spiritual_goal(
    db: Session,
    spiritual_goal: SpiritualGoal,
    goal: str,
    description: str | None = None,
) -> SpiritualGoal:

    spiritual_goal.goal = goal
    spiritual_goal.description = description

    db.commit()
    db.refresh(spiritual_goal)

    return spiritual_goal


def delete_spiritual_goal(
    db: Session,
    spiritual_goal: SpiritualGoal,
) -> None:

    db.delete(spiritual_goal)
    db.commit()


# ============================================================
# SPIRITUAL INTERESTS
# ============================================================

def get_all_spiritual_interests(
    db: Session,
) -> list[SpiritualInterest]:

    return (
        db.query(SpiritualInterest)
        .order_by(SpiritualInterest.name)
        .all()
    )


def get_user_spiritual_interests(
    db: Session,
    user_id: int,
) -> list[UserSpiritualInterest]:

    return (
        db.query(UserSpiritualInterest)
        .filter(
            UserSpiritualInterest.user_id == user_id
        )
        .all()
    )


def add_spiritual_interest(
    db: Session,
    user_id: int,
    interest_id: int,
) -> UserSpiritualInterest:

    existing = (
        db.query(UserSpiritualInterest)
        .filter(
            UserSpiritualInterest.user_id == user_id,
            UserSpiritualInterest.interest_id == interest_id,
        )
        .first()
    )

    if existing:
        return existing

    interest = (
        db.query(SpiritualInterest)
        .filter(SpiritualInterest.id == interest_id)
        .first()
    )

    if interest is None:
        raise ValueError("Spiritual interest not found.")

    user_interest = UserSpiritualInterest(
        user_id=user_id,
        interest_id=interest_id,
    )

    db.add(user_interest)
    db.commit()
    db.refresh(user_interest)

    return user_interest


def remove_spiritual_interest(
    db: Session,
    user_id: int,
    interest_id: int,
) -> bool:

    user_interest = (
        db.query(UserSpiritualInterest)
        .filter(
            UserSpiritualInterest.user_id == user_id,
            UserSpiritualInterest.interest_id == interest_id,
        )
        .first()
    )

    if user_interest is None:
        return False

    db.delete(user_interest)
    db.commit()

    return True


# ============================================================
# READING HISTORY
# ============================================================

def get_reading_sessions(
    db: Session,
    user_id: int,
) -> list[ReadingSession]:

    return (
        db.query(ReadingSession)
        .filter(ReadingSession.user_id == user_id)
        .order_by(ReadingSession.created_at.desc())
        .all()
    )