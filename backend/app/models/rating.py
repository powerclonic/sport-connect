from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Rating(Base):
    __tablename__ = "ratings"

    rater_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    ratee_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    event_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    score: Mapped[float] = mapped_column(nullable=False)  # 0.0 to 5.0
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        Index("ix_ratings_rater_id", "rater_id"),
        Index("ix_ratings_ratee_id", "ratee_id"),
        Index("ix_ratings_event_id", "event_id"),
        Index("ix_ratings_rater_ratee_event", "rater_id", "ratee_id", "event_id", unique=True),
    )

    def __repr__(self) -> str:
        return f"<Rating rater_id={self.rater_id!r} ratee_id={self.ratee_id!r}>"
