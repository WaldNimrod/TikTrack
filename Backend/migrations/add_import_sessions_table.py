"""
Migration: Add import_sessions table

This migration creates the import_sessions table for tracking user data import sessions.
The table stores information about file imports, analysis results, and execution statistics.

Author: TikTrack Development Team
Version: 1.0
Created: 2025-01-16
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers
revision = 'add_import_sessions_table'
down_revision = None  # Update this with the latest revision
branch_labels = None
depends_on = None

def upgrade():
    """Create import_sessions table"""
    
    # Create import_sessions table
    op.create_table('import_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('trading_account_id', sa.Integer(), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('total_records', sa.Integer(), nullable=False, default=0),
        sa.Column('imported_records', sa.Integer(), nullable=False, default=0),
        sa.Column('skipped_records', sa.Integer(), nullable=False, default=0),
        sa.Column('status', sa.String(length=20), nullable=False, default='analyzing'),
        sa.Column('summary_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['trading_account_id'], ['trading_accounts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Add indexes for better performance
    op.create_index('ix_import_sessions_trading_account_id', 'import_sessions', ['trading_account_id'])
    op.create_index('ix_import_sessions_status', 'import_sessions', ['status'])
    op.create_index('ix_import_sessions_provider', 'import_sessions', ['provider'])
    op.create_index('ix_import_sessions_created_at', 'import_sessions', ['created_at'])

def downgrade():
    """Drop import_sessions table"""
    
    # Drop indexes first
    op.drop_index('ix_import_sessions_created_at', table_name='import_sessions')
    op.drop_index('ix_import_sessions_provider', table_name='import_sessions')
    op.drop_index('ix_import_sessions_status', table_name='import_sessions')
    op.drop_index('ix_import_sessions_trading_account_id', table_name='import_sessions')
    
    # Drop table
    op.drop_table('import_sessions')
