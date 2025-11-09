#!/usr/bin/env python3
"""
Import Sessions Cleanup Task
Cleans up old import sessions (older than 90 days)
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add Backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models.import_session import ImportSession

def cleanup_old_import_sessions():
    """Clean up import sessions older than 90 days"""
    
    # Database path
    db_path = backend_dir / "db" / "simpleTrade_new.db"
    
    if not db_path.exists():
        print(f"❌ Database not found at: {db_path}")
        return False
    
    try:
        # Create engine and session
        engine = create_engine(f'sqlite:///{db_path}')
        Session = sessionmaker(bind=engine)
        db_session = Session()
        
        # Calculate cutoff date (90 days ago)
        cutoff_date = datetime.now() - timedelta(days=90)
        
        # Count records to be deleted
        count_query = text("""
            SELECT COUNT(*) FROM import_sessions 
            WHERE created_at < :cutoff_date
        """)
        
        count_result = db_session.execute(count_query, {'cutoff_date': cutoff_date})
        count = count_result.scalar()
        
        if count == 0:
            print("✅ No old import sessions to clean up")
            return True
        
        print(f"🧹 Found {count} import sessions older than 90 days")
        
        # Delete old records
        delete_query = text("""
            DELETE FROM import_sessions 
            WHERE created_at < :cutoff_date
        """)
        
        result = db_session.execute(delete_query, {'cutoff_date': cutoff_date})
        deleted_count = result.rowcount
        
        # Commit changes
        db_session.commit()
        db_session.close()
        
        print(f"✅ Cleaned up {deleted_count} old import sessions")
        return True
        
    except Exception as e:
        print(f"❌ Error cleaning up import sessions: {e}")
        return False

if __name__ == "__main__":
    cleanup_old_import_sessions()


