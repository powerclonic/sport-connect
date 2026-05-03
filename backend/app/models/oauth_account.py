from enum import Enum

from sqlalchemy import ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class OAuthProvider(str, Enum):
    GOOGLE = "google"
    FACEBOOK = "facebook"


class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    provider_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    # Access token encrypted at rest (see security.py encrypt/decrypt helpers)
    access_token_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    refresh_token_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="oauth_accounts")  # noqa: F821

    __table_args__ = (
        # One OAuth account per provider per user
        Index(
            "uq_oauth_provider_user",
            "provider",
            "provider_user_id",
            unique=True,
        ),
    )

    def __repr__(self) -> str:
        return f"<OAuthAccount provider={self.provider!r} user_id={self.user_id!r}>"
