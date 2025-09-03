"""
Migration to update ticker name column length from 100 to 25 characters
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    """Update ticker name column to 25 characters"""
    
    # Create new table with updated column length
    op.create_table(
        'tickers_new',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('symbol', sa.String(10), unique=True, nullable=False),
        sa.Column('name', sa.String(25), nullable=False),  # Changed from 100 to 25
        sa.Column('type', sa.String(20), nullable=False),
        sa.Column('currency_id', sa.Integer(), sa.ForeignKey('currencies.id'), nullable=False),
        sa.Column('remarks', sa.Text()),
        sa.Column('active_trades', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now())
    )
    
    # Copy data from old table to new table, truncating names longer than 25 chars
    op.execute("""
        INSERT INTO tickers_new (id, symbol, name, type, currency_id, remarks, active_trades, created_at, updated_at)
        SELECT id, symbol, 
               CASE 
                   WHEN LENGTH(name) > 25 THEN SUBSTR(name, 1, 25)
                   ELSE name 
               END as name,
               type, currency_id, remarks, active_trades, created_at, updated_at
        FROM tickers
    """)
    
    # Drop old table and rename new table
    op.drop_table('tickers')
    op.rename_table('tickers_new', 'tickers')

def downgrade():
    """Revert back to 100 characters"""
    
    # Create old table structure
    op.create_table(
        'tickers_old',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('symbol', sa.String(10), unique=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),  # Back to 100
        sa.Column('type', sa.String(20), nullable=False),
        sa.Column('currency_id', sa.Integer(), sa.ForeignKey('currencies.id'), nullable=False),
        sa.Column('remarks', sa.Text()),
        sa.Column('active_trades', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), default=sa.func.now(), onupdate=sa.func.now())
    )
    
    # Copy data back
    op.execute("""
        INSERT INTO tickers_old (id, symbol, name, type, currency_id, remarks, active_trades, created_at, updated_at)
        SELECT id, symbol, name, type, currency_id, remarks, active_trades, created_at, updated_at
        FROM tickers
    """)
    
    # Drop new table and rename old table
    op.drop_table('tickers')
    op.rename_table('tickers_old', 'tickers')
