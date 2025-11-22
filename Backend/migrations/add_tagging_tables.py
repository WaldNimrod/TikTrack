"""
Migration: Add Tagging Tables
Date: 2025-11-12
Version: 1.0.0

Creates tag_categories, tags and tag_links tables to support the unified tagging
system across all TikTrack entities.
"""

from alembic import op
import sqlalchemy as sa

# Revision identifiers.
revision = "add_tagging_tables"
down_revision = None  # Update when aligning with ordered revision chain
branch_labels = None
depends_on = None


def upgrade():
    """Create tagging tables and supporting indexes."""

    # tag_categories table
    op.create_table(
        "tag_categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("color_hex", sa.String(length=7), nullable=True),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_tag_categories_user_id", "tag_categories", ["user_id"])
    op.create_unique_constraint(
        "uq_tag_categories_user_name", "tag_categories", ["user_id", "name"]
    )

    # tags table
    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("tag_categories.id"), nullable=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("usage_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_used_at", sa.DateTime(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
    )
    op.create_index("ix_tags_user_id", "tags", ["user_id"])
    op.create_index("ix_tags_category_id", "tags", ["category_id"])
    op.create_unique_constraint("uq_tags_user_name", "tags", ["user_id", "name"])
    op.create_unique_constraint("uq_tags_user_slug", "tags", ["user_id", "slug"])

    # tag_links table
    op.create_table(
        "tag_links",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "tag_id",
            sa.Integer(),
            sa.ForeignKey("tags.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("entity_type", sa.String(length=40), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column("created_by", sa.Integer(), nullable=True),
    )
    op.create_unique_constraint(
        "uq_tag_links_tag_entity", "tag_links", ["tag_id", "entity_type", "entity_id"]
    )
    op.create_index("ix_tag_links_tag_id", "tag_links", ["tag_id"])
    op.create_index("ix_tag_links_entity", "tag_links", ["entity_type", "entity_id"])


def downgrade():
    """Drop tagging tables."""

    op.drop_index("ix_tag_links_entity", table_name="tag_links")
    op.drop_index("ix_tag_links_tag_id", table_name="tag_links")
    op.drop_constraint("uq_tag_links_tag_entity", "tag_links", type_="unique")
    op.drop_table("tag_links")

    op.drop_constraint("uq_tags_user_slug", "tags", type_="unique")
    op.drop_constraint("uq_tags_user_name", "tags", type_="unique")
    op.drop_index("ix_tags_category_id", table_name="tags")
    op.drop_index("ix_tags_user_id", table_name="tags")
    op.drop_table("tags")

    op.drop_constraint("uq_tag_categories_user_name", "tag_categories", type_="unique")
    op.drop_index("ix_tag_categories_user_id", table_name="tag_categories")
    op.drop_table("tag_categories")





