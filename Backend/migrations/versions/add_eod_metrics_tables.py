# Manual migration for EOD metrics tables
# Run with: python3 Backend/alembic upgrade head

revision = 'add_eod_metrics_tables'
down_revision = None

from alembic import op
import sqlalchemy as sa

def upgrade():
    # Create daily_portfolio_metrics table
    op.create_table('daily_portfolio_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=True),
        sa.Column('date_utc', sa.Date(), nullable=False),
        sa.Column('nav_total', sa.Numeric(20, 8), nullable=True),
        sa.Column('nav_base_currency', sa.Numeric(20, 8), nullable=True),
        sa.Column('cash_total', sa.Numeric(20, 8), nullable=True),
        sa.Column('positions_count_open', sa.Integer(), nullable=True),
        sa.Column('positions_count_closed', sa.Integer(), nullable=True),
        sa.Column('exposure_long', sa.Numeric(20, 8), nullable=True),
        sa.Column('exposure_short', sa.Numeric(20, 8), nullable=True),
        sa.Column('unrealized_pl_amount', sa.Numeric(20, 8), nullable=True),
        sa.Column('unrealized_pl_percent', sa.Numeric(10, 4), nullable=True),
        sa.Column('realized_pl_amount', sa.Numeric(20, 8), nullable=True),
        sa.Column('realized_pl_to_date', sa.Numeric(20, 8), nullable=True),
        sa.Column('pnl_daily_change_amount', sa.Numeric(20, 8), nullable=True),
        sa.Column('pnl_daily_change_percent', sa.Numeric(10, 4), nullable=True),
        sa.Column('twr_daily', sa.Numeric(10, 6), nullable=True),
        sa.Column('twr_mtd', sa.Numeric(10, 6), nullable=True),
        sa.Column('twr_ytd', sa.Numeric(10, 6), nullable=True),
        sa.Column('max_drawdown_to_date', sa.Numeric(10, 4), nullable=True),
        sa.Column('data_quality_status', sa.String(20), nullable=True, default='valid'),
        sa.Column('validation_errors', sa.JSON(), nullable=True),
        sa.Column('computed_at', sa.TIMESTAMP(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create daily_ticker_positions table
    op.create_table('daily_ticker_positions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=True),
        sa.Column('ticker_id', sa.Integer(), nullable=False),
        sa.Column('date_utc', sa.Date(), nullable=False),
        sa.Column('quantity', sa.Numeric(20, 8), nullable=True),
        sa.Column('avg_cost', sa.Numeric(20, 8), nullable=True),
        sa.Column('market_value', sa.Numeric(20, 8), nullable=True),
        sa.Column('unrealized_pl_amount', sa.Numeric(20, 8), nullable=True),
        sa.Column('unrealized_pl_percent', sa.Numeric(10, 4), nullable=True),
        sa.Column('realized_pl_today', sa.Numeric(20, 8), nullable=True),
        sa.Column('close_price', sa.Numeric(20, 8), nullable=True),
        sa.Column('price_source', sa.String(50), nullable=True),
        sa.Column('currency', sa.String(3), nullable=True),
        sa.Column('computed_at', sa.TIMESTAMP(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create daily_cash_flows_agg table
    op.create_table('daily_cash_flows_agg',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=True),
        sa.Column('date_utc', sa.Date(), nullable=False),
        sa.Column('inflow', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('outflow', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('dividends', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('fees', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('taxes', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('fx_adjustments', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('net_flow', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('computed_at', sa.TIMESTAMP(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create eod_job_runs table
    op.create_table('eod_job_runs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.String(100), nullable=True),
        sa.Column('status', sa.String(20), nullable=True, default='running'),
        sa.Column('scope', sa.JSON(), nullable=True),
        sa.Column('errors', sa.JSON(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('completed_at', sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('job_id')
    )

    # Create indexes for performance
    op.create_index('idx_daily_portfolio_user_date', 'daily_portfolio_metrics', ['user_id', 'date_utc'])
    op.create_index('idx_daily_portfolio_account_date', 'daily_portfolio_metrics', ['account_id', 'date_utc'])
    op.create_index('idx_daily_positions_user_date', 'daily_ticker_positions', ['user_id', 'date_utc'])
    op.create_index('idx_daily_positions_ticker_date', 'daily_ticker_positions', ['ticker_id', 'date_utc'])
    op.create_index('idx_daily_cash_user_date', 'daily_cash_flows_agg', ['user_id', 'date_utc'])
    op.create_index('idx_eod_jobs_status', 'eod_job_runs', ['status'])
    op.create_index('idx_eod_jobs_created', 'eod_job_runs', ['created_at'])

def downgrade():
    op.drop_index('idx_eod_jobs_created', table_name='eod_job_runs')
    op.drop_index('idx_eod_jobs_status', table_name='eod_job_runs')
    op.drop_index('idx_daily_cash_user_date', table_name='daily_cash_flows_agg')
    op.drop_index('idx_daily_positions_ticker_date', table_name='daily_ticker_positions')
    op.drop_index('idx_daily_positions_user_date', table_name='daily_ticker_positions')
    op.drop_index('idx_daily_portfolio_account_date', table_name='daily_portfolio_metrics')
    op.drop_index('idx_daily_portfolio_user_date', table_name='daily_portfolio_metrics')

    op.drop_table('eod_job_runs')
    op.drop_table('daily_cash_flows_agg')
    op.drop_table('daily_ticker_positions')
    op.drop_table('daily_portfolio_metrics')
