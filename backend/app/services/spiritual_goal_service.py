from sqlalchemy.orm import Session

from app.models.spiritual_goal import SpiritualGoal


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


def get_spiritual_goal_by_id(
    db: Session,
    goal_id: int,
    user_id: int,
) -> SpiritualGoal | None:

    return (
        db.query(SpiritualGoal)
        .filter(
            SpiritualGoal.id == goal_id,
            SpiritualGoal.user_id == user_id,
        )
        .first()
    )


def create_spiritual_goal(
    db: Session,
    user_id: int,
    goal: str,
    description: str | None,
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


def update_spiritual_goal(
    db: Session,
    spiritual_goal: SpiritualGoal,
    goal: str | None = None,
    description: str | None = None,
) -> SpiritualGoal:

    if goal is not None:
        spiritual_goal.goal = goal

    if description is not None:
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