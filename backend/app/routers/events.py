"""Events router - full CRUD for events + participant management.

Endpoints:
GET    /events                    — list events (filter by sport, city, date)
POST   /events                    — create event
GET    /events/{event_id}         — get event details
PUT    /events/{event_id}         — update event (organizer only)
DELETE /events/{event_id}         — delete event (organizer only)
POST   /events/{event_id}/join    — join event
DELETE /events/{event_id}/leave   — leave event
"""

from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.database import DBSession
from app.dependencies import CurrentUserDep
from app.models.event import Event
from app.models.event_participant import EventParticipant
from app.schemas.events import (
    EventCreateRequest,
    EventDetailResponse,
    EventResponse,
    EventUpdateRequest,
)

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventResponse])
def list_events(
    sport: str | None = Query(default=None),
    city: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: DBSession = None,
) -> list[EventResponse]:
    query = select(Event).where(Event.status == "active")

    if sport:
        query = query.where(Event.sport == sport)
    if city:
        query = query.where(Event.city == city)

    query = query.order_by(Event.date_start).offset(skip).limit(limit)
    events = db.scalars(query).all()

    # Count participants per event
    result = []
    for event in events:
        count = db.scalar(
            select(func.count(EventParticipant.id)).where(
                EventParticipant.event_id == event.id
            )
        )
        response = EventResponse.model_validate(event)
        response.participant_count = count or 0
        result.append(response)

    return result


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    body: EventCreateRequest,
    current_user: CurrentUserDep,
    db: DBSession,
) -> EventResponse:
    if body.date_end <= body.date_start:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date.",
        )

    event = Event(
        title=body.title,
        description=body.description,
        sport=body.sport,
        location=body.location,
        city=body.city,
        date_start=body.date_start,
        date_end=body.date_end,
        organizer_id=current_user.id,
        max_participants=body.max_participants,
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    response = EventResponse.model_validate(event)
    response.participant_count = 0
    return response


@router.get("/{event_id}", response_model=EventDetailResponse)
def get_event(
    event_id: str,
    db: DBSession,
) -> EventDetailResponse:
    event = db.scalar(select(Event).where(Event.id == event_id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found.",
        )

    count = db.scalar(
        select(func.count(EventParticipant.id)).where(
            EventParticipant.event_id == event.id
        )
    )
    response = EventDetailResponse.model_validate(event)
    response.participant_count = count or 0
    return response


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: str,
    body: EventUpdateRequest,
    current_user: CurrentUserDep,
    db: DBSession,
) -> EventResponse:
    event = db.scalar(select(Event).where(Event.id == event_id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found.",
        )

    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organizer can update event.",
        )

    if body.title is not None:
        event.title = body.title
    if body.description is not None:
        event.description = body.description
    if body.sport is not None:
        event.sport = body.sport
    if body.location is not None:
        event.location = body.location
    if body.city is not None:
        event.city = body.city
    if body.date_start is not None and body.date_end is not None:
        if body.date_end <= body.date_start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be after start date.",
            )
        event.date_start = body.date_start
        event.date_end = body.date_end
    if body.max_participants is not None:
        event.max_participants = body.max_participants
    if body.status is not None:
        event.status = body.status

    db.commit()
    db.refresh(event)

    count = db.scalar(
        select(func.count(EventParticipant.id)).where(
            EventParticipant.event_id == event.id
        )
    )
    response = EventResponse.model_validate(event)
    response.participant_count = count or 0
    return response


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: str,
    current_user: CurrentUserDep,
    db: DBSession,
) -> None:
    event = db.scalar(select(Event).where(Event.id == event_id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found.",
        )

    if event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organizer can delete event.",
        )

    db.delete(event)
    db.commit()


@router.post("/{event_id}/join", response_model=EventResponse)
def join_event(
    event_id: str,
    current_user: CurrentUserDep,
    db: DBSession,
) -> EventResponse:
    event = db.scalar(select(Event).where(Event.id == event_id))
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found.",
        )

    if event.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot join inactive event.",
        )

    # Check if already joined
    existing = db.scalar(
        select(EventParticipant).where(
            and_(
                EventParticipant.user_id == current_user.id,
                EventParticipant.event_id == event.id,
            )
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already joined event.",
        )

    # Check max participants
    if event.max_participants:
        count = db.scalar(
            select(func.count(EventParticipant.id)).where(
                EventParticipant.event_id == event.id
            )
        )
        if count and count >= event.max_participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is full.",
            )

    participant = EventParticipant(
        user_id=current_user.id,
        event_id=event.id,
        status="joined",
    )
    db.add(participant)
    db.commit()

    count = db.scalar(
        select(func.count(EventParticipant.id)).where(
            EventParticipant.event_id == event.id
        )
    )
    response = EventResponse.model_validate(event)
    response.participant_count = count or 0
    return response


@router.delete("/{event_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
def leave_event(
    event_id: str,
    current_user: CurrentUserDep,
    db: DBSession,
) -> None:
    participant = db.scalar(
        select(EventParticipant).where(
            and_(
                EventParticipant.user_id == current_user.id,
                EventParticipant.event_id == event_id,
            )
        )
    )
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not participant in event.",
        )

    db.delete(participant)
    db.commit()
