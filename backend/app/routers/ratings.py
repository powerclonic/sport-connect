"""Ratings router - create + fetch ratings for users.

Endpoints:
GET    /ratings/received         — get ratings received by current user
GET    /ratings/given            — get ratings given by current user
POST   /ratings                  — create rating (only after event ends)
GET    /users/{user_id}/stats    — get user stats (games, avg rating, reliability)
"""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import and_, desc, func, select

from app.database import DBSession
from app.dependencies import CurrentUserDep
from app.models.event import Event
from app.models.event_participant import EventParticipant
from app.models.rating import Rating
from app.models.user import User
from app.schemas.ratings import (
    RatingCreateRequest,
    RatingResponse,
    UserStatsResponse,
)

router = APIRouter(prefix="/ratings", tags=["ratings"])


@router.get("/received", response_model=list[RatingResponse])
def get_ratings_received(
    current_user: CurrentUserDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: DBSession = None,
) -> list[RatingResponse]:
    query = (
        select(Rating)
        .where(Rating.ratee_id == current_user.id)
        .order_by(desc(Rating.created_at))
        .offset(skip)
        .limit(limit)
    )
    ratings = db.scalars(query).all()

    result = []
    for rating in ratings:
        rater = db.scalar(select(User).where(User.id == rating.rater_id))
        response = RatingResponse.model_validate(rating)
        response.author = rater.display_name or rater.email if rater else None
        result.append(response)

    return result


@router.get("/given", response_model=list[RatingResponse])
def get_ratings_given(
    current_user: CurrentUserDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: DBSession = None,
) -> list[RatingResponse]:
    query = (
        select(Rating)
        .where(Rating.rater_id == current_user.id)
        .order_by(desc(Rating.created_at))
        .offset(skip)
        .limit(limit)
    )
    ratings = db.scalars(query).all()

    result = []
    for rating in ratings:
        ratee = db.scalar(select(User).where(User.id == rating.ratee_id))
        response = RatingResponse.model_validate(rating)
        response.target_name = ratee.display_name or ratee.email if ratee else None
        result.append(response)

    return result


@router.post("", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
def create_rating(
    body: RatingCreateRequest,
    current_user: CurrentUserDep,
    db: DBSession,
) -> RatingResponse:
    # Verify event exists + ended
    event = db.scalar(select(Event).where(Event.id == body.event_id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found.",
        )

    now = datetime.now(timezone.utc)
    if event.date_end > now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event has not ended yet.",
        )

    # Verify rater was participant
    rater_participant = db.scalar(
        select(EventParticipant).where(
            and_(
                EventParticipant.user_id == current_user.id,
                EventParticipant.event_id == body.event_id,
                EventParticipant.status == "joined",
            )
        )
    )
    if not rater_participant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must be a participant in the event to rate.",
        )

    # Verify ratee was participant
    ratee_participant = db.scalar(
        select(EventParticipant).where(
            and_(
                EventParticipant.user_id == body.ratee_id,
                EventParticipant.event_id == body.event_id,
                EventParticipant.status == "joined",
            )
        )
    )
    if not ratee_participant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ratee must be a participant in the event.",
        )

    # Check duplicate rating
    existing = db.scalar(
        select(Rating).where(
            and_(
                Rating.rater_id == current_user.id,
                Rating.ratee_id == body.ratee_id,
                Rating.event_id == body.event_id,
            )
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already rated this user for this event.",
        )

    rating = Rating(
        rater_id=current_user.id,
        ratee_id=body.ratee_id,
        event_id=body.event_id,
        score=body.score,
        comment=body.comment,
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    ratee = db.scalar(select(User).where(User.id == rating.ratee_id))
    response = RatingResponse.model_validate(rating)
    response.target_name = ratee.display_name or ratee.email if ratee else None
    return response


@router.get("/users/{user_id}/stats", response_model=UserStatsResponse)
def get_user_stats(
    user_id: str,
    db: DBSession,
) -> UserStatsResponse:
    # Games played = count of joined events
    games_played = db.scalar(
        select(func.count(EventParticipant.id)).where(
            and_(
                EventParticipant.user_id == user_id,
                EventParticipant.status == "joined",
            )
        )
    ) or 0

    # Average rating = avg of ratings received
    avg_rating_query = db.scalar(
        select(func.avg(Rating.score)).where(Rating.ratee_id == user_id)
    )
    avg_rating = float(avg_rating_query) if avg_rating_query else 0.0

    # Reliability = % of joined events user completed (not cancelled)
    # For now: same as avg rating (can improve with event completion tracking)
    reliability = avg_rating

    return UserStatsResponse(
        games_played=games_played,
        average_rating=avg_rating,
        reliability=reliability,
    )
