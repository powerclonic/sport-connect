"""add sports_preferences and profile_complete to users

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-03 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("sports_preferences", sa.Text(), nullable=False,),
    )
    op.execute(
        """UPDATE users SET sports_preferences = '[]' WHERE sports_preferences IS NULL"""
    )
    
    op.add_column(
        "users",
        sa.Column("profile_complete", sa.Boolean(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("users", "profile_complete")
    op.drop_column("users", "sports_preferences")
