"""Pydantic schemas for events."""

from datetime import datetime

from pydantic import BaseModel, Field


class EventParticipantResponse(BaseModel):
    user_id: str
    status: str
    joined_at: datetime

    model_config = {"from_attributes": True}


class EventCreateRequest(BaseModel):
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    sport: str = Field(max_length=50)
    location: str | None = Field(default=None, max_length=255)
    city: str = Field(max_length=100)
    date_start: datetime
    date_end: datetime
    max_participants: int | None = Field(default=None, ge=1)


class EventUpdateRequest(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    sport: str | None = Field(default=None, max_length=50)
    location: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    date_start: datetime | None = None
    date_end: datetime | None = None
    max_participants: int | None = Field(default=None, ge=1)
    status: str | None = Field(default=None, max_length=20)


class EventResponse(BaseModel):
    id: str
    title: str
    description: str | None
    sport: str
    location: str | None
    city: str
    date_start: datetime
    date_end: datetime
    organizer_id: str
    max_participants: int | None
    status: str
    participant_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EventDetailResponse(EventResponse):
    participants: list[EventParticipantResponse] = []
