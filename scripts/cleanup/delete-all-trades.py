#!/usr/bin/env python3
"""
Delete All Trades Script
Deletes all records from trades table for clean testing
"""

import os
import sys
from pathlib import Path

# Add Backend to path
project_root = Path(__file__).parent.parent.parent
backend_dir = project_root / "production" / "Backend"
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def delete_all_trades():
    """Delete all trades from database"""
    
    # Use environment variables for PostgreSQL connection
    postgres_host = os.getenv('POSTGRES_HOST', 'localhost')
    postgres_db = os.getenv('POSTGRES_DB', 'TikTrack-db-development')
    postgres_user = os.getenv('POSTGRES_USER', 'TikTrakDBAdmin')
    postgres_password = os.getenv('POSTGRES_PASSWORD', 'BigMeZoo1974!?')

    db_url = f'postgresql+psycopg2://{postgres_user}:{postgres_password}@{postgres_host}:5432/{postgres_db}'
    
    try:
        # Create engine and session
        engine = create_engine(db_url)
        Session = sessionmaker(bind=engine)
        db_session = Session()
        
        # Count existing trades
        count_trades_query = text("SELECT COUNT(*) FROM trades")
        count_trades_result = db_session.execute(count_trades_query)
        count_trades = count_trades_result.scalar()
        
        if count_trades == 0:
            print("✅ No trades to delete - table is already empty")
            db_session.close()
            return True
        
        print(f"🧹 Found {count_trades} trades - preparing to delete...")
        
        # Show trades before deletion (optional - for verification)
        select_trades_query = text("SELECT id, status, investment_type, side FROM trades ORDER BY id")
        trades_result = db_session.execute(select_trades_query)
        trades = trades_result.fetchall()
        
        if trades:
            print("\n📋 Trades to be deleted:")
            for trade in trades:
                print(f"   - Trade ID: {trade[0]}, Status: {trade[1]}, Type: {trade[2]}, Side: {trade[3]}")
        
        # Delete all trades
        delete_trades_query = text("DELETE FROM trades")
        result_trades = db_session.execute(delete_trades_query)
        deleted_trades_count = result_trades.rowcount
        
        # Commit changes
        db_session.commit()
        db_session.close()
        
        print(f"\n✅ Successfully deleted {deleted_trades_count} trades")
        return True
        
    except Exception as e:
        print(f"❌ Error deleting trades: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("======================================================================")
    print("Delete All Trades Script")
    print("======================================================================")
    
    # Use environment variables for DATABASE_URL in print statement
    postgres_host = os.getenv('POSTGRES_HOST', 'localhost')
    postgres_db = os.getenv('POSTGRES_DB', 'TikTrack-db-development')
    print(f"📊 Database: {postgres_host}:5432/{postgres_db}")
    
    print("\n🔄 Starting deletion of all trades...")
    success = delete_all_trades()
    print("\n======================================================================")
    print(f"✅ Script completed successfully" if success else "❌ Script failed")
    sys.exit(0 if success else 1)

