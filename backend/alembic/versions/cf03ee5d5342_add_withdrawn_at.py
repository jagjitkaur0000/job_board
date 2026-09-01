"""
add withdrawn_at

Revision ID: cf03ee5d5342
Revises: fa31f29f1a65
Create Date: 2026-08-27 11:31:29.973019
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "cf03ee5d5342"
down_revision: Union[str, Sequence[str], None] = "fa31f29f1a65"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "email_verification_otps",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "otp_hash",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "is_used",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.add_column(
        "applications",
        sa.Column(
            "withdrawn_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.alter_column(
        "applications",
        "status",
        existing_type=sa.VARCHAR(length=50),
        nullable=False,
    )

    op.alter_column(
        "applications",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "location",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "employment_type",
            sa.String(length=50),
            nullable=False,
            server_default="full_time",
        ),
    )

    op.alter_column(
        "jobs",
        "employment_type",
        server_default=None,
    )

    op.add_column(
        "jobs",
        sa.Column(
            "work_mode",
            sa.String(length=50),
            nullable=False,
            server_default="onsite",
        ),
    )

    op.alter_column(
        "jobs",
        "work_mode",
        server_default=None,
    )

    op.add_column(
        "jobs",
        sa.Column(
            "experience_required",
            sa.String(length=100),
            nullable=True,
        ),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "salary_min",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "salary_max",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "salary_currency",
            sa.String(length=10),
            nullable=True,
        ),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "contact_email",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "contact_phone",
            sa.String(length=50),
            nullable=True,
        ),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "benefits",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "preferred_gender",
            sa.String(length=20),
            nullable=True,
        ),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "is_urgent",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.alter_column(
        "jobs",
        "is_urgent",
        server_default=None,
    )

    op.add_column(
        "jobs",
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.add_column(
        "jobs",
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
    )

    op.alter_column(
        "jobs",
        "is_active",
        server_default=None,
    )

    op.add_column(
        "jobs",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    op.alter_column(
        "jobs",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=False,
        existing_server_default=sa.text("now()"),
    )

    op.create_index(
        op.f("ix_jobs_company_id"),
        "jobs",
        ["company_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_jobs_created_at"),
        "jobs",
        ["created_at"],
        unique=False,
    )

    op.create_index(
        op.f("ix_jobs_employment_type"),
        "jobs",
        ["employment_type"],
        unique=False,
    )

    op.create_index(
        op.f("ix_jobs_experience_required"),
        "jobs",
        ["experience_required"],
        unique=False,
    )

    op.create_index(
        op.f("ix_jobs_expires_at"),
        "jobs",
        ["expires_at"],
        unique=False,
    )

    op.create_index(
        op.f("ix_jobs_is_active"),
        "jobs",
        ["is_active"],
        unique=False,
    )

    op.create_index(
        op.f("ix_jobs_is_urgent"),
        "jobs",
        ["is_urgent"],
        unique=False,
    )

    op.create_index(
        op.f("ix_jobs_location"),
        "jobs",
        ["location"],
        unique=False,
    )

    op.create_index(
        op.f("ix_jobs_title"),
        "jobs",
        ["title"],
        unique=False,
    )

    op.create_index(
        op.f("ix_jobs_work_mode"),
        "jobs",
        ["work_mode"],
        unique=False,
    )

    op.create_index(
        op.f("ix_roles_id"),
        "roles",
        ["id"],
        unique=False,
    )

    op.add_column(
        "users",
        sa.Column(
            "full_name",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "phone",
            sa.String(length=50),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "preferred_locations",
            sa.JSON(),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "resume_url",
            sa.String(length=500),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "profile_photo_url",
            sa.String(length=500),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "email_verified",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.alter_column(
        "users",
        "email_verified",
        server_default=None,
    )

    op.drop_constraint(
        op.f("users_email_key"),
        "users",
        type_="unique",
    )

    op.create_index(
        op.f("ix_users_email"),
        "users",
        ["email"],
        unique=True,
    )

    op.create_index(
        op.f("ix_users_id"),
        "users",
        ["id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_users_id"),
        table_name="users",
    )

    op.drop_index(
        op.f("ix_users_email"),
        table_name="users",
    )

    op.create_unique_constraint(
        op.f("users_email_key"),
        "users",
        ["email"],
    )

    op.drop_column(
        "users",
        "email_verified",
    )

    op.drop_column(
        "users",
        "profile_photo_url",
    )

    op.drop_column(
        "users",
        "resume_url",
    )

    op.drop_column(
        "users",
        "preferred_locations",
    )

    op.drop_column(
        "users",
        "phone",
    )

    op.drop_column(
        "users",
        "full_name",
    )

    op.drop_index(
        op.f("ix_roles_id"),
        table_name="roles",
    )

    op.drop_index(
        op.f("ix_jobs_work_mode"),
        table_name="jobs",
    )

    op.drop_index(
        op.f("ix_jobs_title"),
        table_name="jobs",
    )

    op.drop_index(
        op.f("ix_jobs_location"),
        table_name="jobs",
    )

    op.drop_index(
        op.f("ix_jobs_is_urgent"),
        table_name="jobs",
    )

    op.drop_index(
        op.f("ix_jobs_is_active"),
        table_name="jobs",
    )

    op.drop_index(
        op.f("ix_jobs_expires_at"),
        table_name="jobs",
    )

    op.drop_index(
        op.f("ix_jobs_experience_required"),
        table_name="jobs",
    )

    op.drop_index(
        op.f("ix_jobs_employment_type"),
        table_name="jobs",
    )

    op.drop_index(
        op.f("ix_jobs_created_at"),
        table_name="jobs",
    )

    op.drop_index(
        op.f("ix_jobs_company_id"),
        table_name="jobs",
    )

    op.alter_column(
        "jobs",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )

    op.drop_column(
        "jobs",
        "updated_at",
    )

    op.drop_column(
        "jobs",
        "is_active",
    )

    op.drop_column(
        "jobs",
        "expires_at",
    )

    op.drop_column(
        "jobs",
        "is_urgent",
    )

    op.drop_column(
        "jobs",
        "preferred_gender",
    )

    op.drop_column(
        "jobs",
        "benefits",
    )

    op.drop_column(
        "jobs",
        "contact_phone",
    )

    op.drop_column(
        "jobs",
        "contact_email",
    )

    op.drop_column(
        "jobs",
        "salary_currency",
    )

    op.drop_column(
        "jobs",
        "salary_max",
    )

    op.drop_column(
        "jobs",
        "salary_min",
    )

    op.drop_column(
        "jobs",
        "experience_required",
    )

    op.drop_column(
        "jobs",
        "work_mode",
    )

    op.drop_column(
        "jobs",
        "employment_type",
    )

    op.drop_column(
        "jobs",
        "location",
    )

    op.alter_column(
        "applications",
        "created_at",
        existing_type=postgresql.TIMESTAMP(timezone=True),
        nullable=True,
        existing_server_default=sa.text("now()"),
    )

    op.alter_column(
        "applications",
        "status",
        existing_type=sa.VARCHAR(length=50),
        nullable=True,
    )

    op.drop_column(
        "applications",
        "withdrawn_at",
    )

    op.drop_table(
        "email_verification_otps",
    )