"""Pydantic schemas for the auth domain."""

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(default=None, max_length=100)

    @field_validator("password")
    @classmethod
    def password_complexity(cls, v: str) -> str:
        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)
        if not (has_upper and has_lower and has_digit):
            raise ValueError(
                "Password must contain at least one uppercase letter, "
                "one lowercase letter, and one digit."
            )
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    """Mobile clients send the refresh token in the request body."""

    refresh_token: str | None = None


class TokenResponse(BaseModel):
    """Returned in the response body for mobile/Capacitor clients.

    Web clients also receive httpOnly cookies — this body payload is for
    Bearer-header transport.
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserPublicResponse(BaseModel):
    id: str
    email: EmailStr
    display_name: str | None
    avatar_url: str | None
    is_verified: bool

    model_config = {"from_attributes": True}
