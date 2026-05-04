"""Chat router - conversations + messaging.

Endpoints:
GET    /conversations             — list conversations for current user
POST   /conversations             — create/find DM conversation
GET    /conversations/{conv_id}   — get conversation + messages (paginated)
POST   /conversations/{conv_id}/messages — send message
"""

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import and_, desc, func, or_, select

from app.database import DBSession
from app.dependencies import CurrentUserDep
from app.models.chat import Conversation, Message
from app.models.user import User
from app.schemas.chat import (
    ConversationCreateRequest,
    ConversationDetailResponse,
    ConversationResponse,
    MessageCreateRequest,
    MessageResponse,
)

router = APIRouter(prefix="/conversations", tags=["chat"])


@router.get("", response_model=list[ConversationResponse])
def list_conversations(
    current_user: CurrentUserDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: DBSession = None,
) -> list[ConversationResponse]:
    # Find conversations where current user is participant
    query = (
        select(Conversation)
        .order_by(desc(Conversation.updated_at))
        .offset(skip)
        .limit(limit)
    )
    conversations = db.scalars(query).all()

    result = []
    for conv in conversations:
        if current_user.id not in conv.participant_ids:
            continue

        msg_count = db.scalar(
            select(func.count(Message.id)).where(Message.conversation_id == conv.id)
        ) or 0

        response = ConversationResponse.model_validate(conv)
        response.message_count = msg_count
        result.append(response)

    return result


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    body: ConversationCreateRequest,
    current_user: CurrentUserDep,
    db: DBSession,
) -> ConversationResponse:
    if body.participant_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create conversation with self.",
        )

    # Check if other user exists
    other_user = db.scalar(select(User).where(User.id == body.participant_id))
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Find or create conversation
    participant_ids = sorted([current_user.id, body.participant_id])

    existing = db.scalar(
        select(Conversation).where(Conversation.participant_ids.contains(participant_ids))
    )
    if existing:
        response = ConversationResponse.model_validate(existing)
        response.message_count = 0
        return response

    conversation = Conversation(participant_ids=participant_ids)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    response = ConversationResponse.model_validate(conversation)
    response.message_count = 0
    return response


@router.get("/{conv_id}", response_model=ConversationDetailResponse)
def get_conversation(
    conv_id: str,
    current_user: CurrentUserDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: DBSession = None,
) -> ConversationDetailResponse:
    conversation = db.scalar(select(Conversation).where(Conversation.id == conv_id))
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    if current_user.id not in conversation.participant_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not participant in conversation.",
        )

    # Get messages (newest first, then reverse for display)
    msg_query = (
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(desc(Message.created_at))
        .offset(skip)
        .limit(limit)
    )
    messages = list(reversed(db.scalars(msg_query).all()))

    msg_responses = []
    for msg in messages:
        sender = db.scalar(select(User).where(User.id == msg.sender_id))
        msg_resp = MessageResponse.model_validate(msg)
        msg_resp.sender_name = sender.display_name or sender.email if sender else None
        msg_responses.append(msg_resp)

    response = ConversationDetailResponse.model_validate(conversation)
    response.messages = msg_responses
    return response


@router.post("/{conv_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    conv_id: str,
    body: MessageCreateRequest,
    current_user: CurrentUserDep,
    db: DBSession,
) -> MessageResponse:
    conversation = db.scalar(select(Conversation).where(Conversation.id == conv_id))
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    if current_user.id not in conversation.participant_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not participant in conversation.",
        )

    message = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        text=body.text,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    # Update conversation updated_at
    conversation.updated_at = message.created_at
    db.commit()

    sender = db.scalar(select(User).where(User.id == message.sender_id))
    response = MessageResponse.model_validate(message)
    response.sender_name = sender.display_name or sender.email if sender else None
    return response
