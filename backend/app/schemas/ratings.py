"""Pydantic schemas for ratings."""

from datetime import datetime

from pydantic import BaseModel, Field


class RatingCreateRequest(BaseModel):
    ratee_id: str
    event_id: str
    score: float = Field(ge=0.0, le=5.0)
    comment: str | None = Field(default=None, max_length=500)


class RatingResponse(BaseModel):
    id: str
    rater_id: str
    ratee_id: str
    event_id: str
    score: float
    comment: str | None
    created_at: datetime
    author: str | None = None
    target_name: str | None = None

    model_config = {"from_attributes": True}


class UserStatsResponse(BaseModel):
    games_played: int = 0
    average_rating: float = 0.0
    reliability: float = 0.0
