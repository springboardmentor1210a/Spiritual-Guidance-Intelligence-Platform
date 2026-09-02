from sqlalchemy.orm import Session

from app.models.spiritual_interest import SpiritualInterest
from app.models.user_spiritual_interest import UserSpiritualInterest


def get_all_spiritual_interests(
    db: Session,
) -> list[SpiritualInterest]:

    return (
        db.query(SpiritualInterest)
        .order_by(SpiritualInterest.name)
        .all()
    )


def get_spiritual_interest_by_id(
    db: Session,
    interest_id: int,
) -> SpiritualInterest | None:

    return db.get(
        SpiritualInterest,
        interest_id
    )


def get_spiritual_interest_by_name(
    db: Session,
    name: str,
) -> SpiritualInterest | None:

    return (
        db.query(SpiritualInterest)
        .filter(SpiritualInterest.name == name)
        .first()
    )


def create_spiritual_interest(
    db: Session,
    name: str,
) -> SpiritualInterest:

    interest = SpiritualInterest(
        name=name
    )

    db.add(interest)
    db.commit()
    db.refresh(interest)

    return interest


def get_user_spiritual_interests(
    db: Session,
    user_id: int,
) -> list[SpiritualInterest]:

    associations = (
        db.query(UserSpiritualInterest)
        .filter(
            UserSpiritualInterest.user_id == user_id
        )
        .all()
    )

    return [
        association.interest
        for association in associations
    ]


def add_spiritual_interest_to_user(
    db: Session,
    user_id: int,
    interest_id: int,
) -> UserSpiritualInterest:

    association = UserSpiritualInterest(
        user_id=user_id,
        interest_id=interest_id,
    )

    db.add(association)
    db.commit()
    db.refresh(association)

    return association


def remove_spiritual_interest_from_user(
    db: Session,
    user_id: int,
    interest_id: int,
) -> bool:

    association = (
        db.query(UserSpiritualInterest)
        .filter(
            UserSpiritualInterest.user_id == user_id,
            UserSpiritualInterest.interest_id == interest_id,
        )
        .first()
    )

    if association is None:
        return False

    db.delete(association)
    db.commit()

    return True