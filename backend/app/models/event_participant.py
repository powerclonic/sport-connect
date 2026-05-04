from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class EventParticipant(Base):
    __tablename__ = "event_participants"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    event_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), default="joined", nullable=False
    )  # joined, pending, cancelled
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    event: Mapped["Event"] = relationship(  # noqa: F821
        "Event",
        back_populates="participants",
        foreign_keys=[event_id],
    )

    __table_args__ = (
        Index("ix_event_participants_user_event", "user_id", "event_id", unique=True),
        Index("ix_event_participants_event_id", "event_id"),
    )

    def __repr__(self) -> str:
        return f"<EventParticipant user_id={self.user_id!r} event_id={self.event_id!r}>"
