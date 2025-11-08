#!/usr/bin/env python3
"""
Import Sessions Cleanup Task
Cleans up old import sessions (older than 90 days)

This script is production-ready and uses config.settings for database path.
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add Backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Import config settings for production database path
from config.settings import DB_PATH

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models.import_session import ImportSession

def cleanup_old_import_sessions():
    """Clean up import sessions older than 90 days"""
    
    # Use production database path from config
    db_path = DB_PATH
    
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
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("TikTrack Import Sessions Cleanup")
    print("=" * 60)
    print(f"Database: {DB_PATH}")
    print(f"Cutoff date: {datetime.now() - timedelta(days=90)}")
    print()
    
    success = cleanup_old_import_sessions()
    
    if success:
        print()
        print("=" * 60)
        print("✅ Cleanup completed successfully")
        print("=" * 60)
    else:
        print()
        print("=" * 60)
        print("❌ Cleanup failed")
        print("=" * 60)
        sys.exit(1)

