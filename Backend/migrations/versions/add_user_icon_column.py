# Add user icon column to users table
# Run with: python3 Backend/alembic upgrade head

revision = 'add_user_icon_column'
down_revision = 'add_eod_metrics_tables'

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS icon VARCHAR(255)")


def downgrade():
    op.drop_column('users', 'icon')
