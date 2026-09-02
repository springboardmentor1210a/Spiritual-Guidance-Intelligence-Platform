from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User

from app.schemas.spiritual_goal import (
    SpiritualGoalCreate,
    SpiritualGoalUpdate,
    SpiritualGoalResponse,
)

from app.services.spiritual_goal_service import (
    get_spiritual_goals,
    get_spiritual_goal_by_id,
    create_spiritual_goal,
    update_spiritual_goal,
    delete_spiritual_goal,
)


router = APIRouter(
    prefix="/api/v1/spiritual-goals",
    tags=["Spiritual Goals"],
)


@router.get(
    "",
    response_model=list[SpiritualGoalResponse],
)
def read_spiritual_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return get_spiritual_goals(
        db=db,
        user_id=current_user.id,
    )


@router.post(
    "",
    response_model=SpiritualGoalResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_spiritual_goal(
    goal_data: SpiritualGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return create_spiritual_goal(
        db=db,
        user_id=current_user.id,
        goal=goal_data.goal,
        description=goal_data.description,
    )


@router.put(
    "/{goal_id}",
    response_model=SpiritualGoalResponse,
)
def update_user_spiritual_goal(
    goal_id: int,
    goal_data: SpiritualGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    spiritual_goal = get_spiritual_goal_by_id(
        db=db,
        goal_id=goal_id,
        user_id=current_user.id,
    )

    if spiritual_goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spiritual goal not found.",
        )

    return update_spiritual_goal(
        db=db,
        spiritual_goal=spiritual_goal,
        goal=goal_data.goal,
        description=goal_data.description,
    )


@router.delete(
    "/{goal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user_spiritual_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    spiritual_goal = get_spiritual_goal_by_id(
        db=db,
        goal_id=goal_id,
        user_id=current_user.id,
    )

    if spiritual_goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spiritual goal not found.",
        )

    delete_spiritual_goal(
        db=db,
        spiritual_goal=spiritual_goal,
    )