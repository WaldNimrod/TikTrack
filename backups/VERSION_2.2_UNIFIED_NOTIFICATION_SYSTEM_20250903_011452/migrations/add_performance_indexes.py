"""
Migration: Add Performance Indexes
Add database indexes for improved query performance
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import engine, SessionLocal

def upgrade():
    """Add performance indexes"""
    
    db = SessionLocal()
    try:
        # Indexes for tickers table
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_tickers_symbol 
            ON tickers(symbol);
        """))
    
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_tickers_status 
            ON tickers(status);
        """))
        
        # Indexes for trades table
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_trades_status 
            ON trades(status);
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_trades_ticker_id 
            ON trades(ticker_id);
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_trades_created_at 
            ON trades(created_at);
        """))
        
        # Indexes for accounts table
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_accounts_status 
            ON accounts(status);
        """))
        
        # Note: quotes table doesn't exist in current database schema
        
        # Indexes for executions table
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_executions_trade_id 
            ON executions(trade_id);
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_executions_created_at 
            ON executions(created_at);
        """))
        
        # Indexes for alerts table
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_alerts_status 
            ON alerts(status);
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_alerts_ticker_id 
            ON alerts(ticker_id);
        """))
        
        db.commit()
    finally:
        db.close()

def downgrade():
    """Remove performance indexes"""
    
    db = SessionLocal()
    try:
        # Remove tickers indexes
        db.execute(text("DROP INDEX IF EXISTS idx_tickers_symbol;"))
        db.execute(text("DROP INDEX IF EXISTS idx_tickers_status;"))
        
        # Remove trades indexes
        db.execute(text("DROP INDEX IF EXISTS idx_trades_status;"))
        db.execute(text("DROP INDEX IF EXISTS idx_trades_ticker_id;"))
        db.execute(text("DROP INDEX IF EXISTS idx_trades_created_at;"))
        
        # Remove accounts indexes
        db.execute(text("DROP INDEX IF EXISTS idx_accounts_status;"))
        
        # Note: quotes table doesn't exist in current database schema
        
        # Remove executions indexes
        db.execute(text("DROP INDEX IF EXISTS idx_executions_trade_id;"))
        db.execute(text("DROP INDEX IF EXISTS idx_executions_created_at;"))
        
        # Remove alerts indexes
        db.execute(text("DROP INDEX IF EXISTS idx_alerts_status;"))
        db.execute(text("DROP INDEX IF EXISTS idx_alerts_ticker_id;"))
        
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    print("Adding performance indexes...")
    upgrade()
    print("Performance indexes added successfully!")
