"""Pydantic schemas for chat."""

from datetime import datetime

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    id: str
    sender_id: str
    text: str
    created_at: datetime
    sender_name: str | None = None

    model_config = {"from_attributes": True}


class ConversationCreateRequest(BaseModel):
    participant_id: str = Field(description="Other participant ID (for DM)")


class ConversationResponse(BaseModel):
    id: str
    participant_ids: list[str]
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True}


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse] = []


class MessageCreateRequest(BaseModel):
    text: str = Field(max_length=1000)
