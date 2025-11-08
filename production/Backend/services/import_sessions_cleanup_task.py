#!/usr/bin/env python3
"""
Import Sessions Cleanup Background Task
Registers cleanup task with the background task manager
"""

import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add Backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from services.background_tasks import BackgroundTaskManager

def register_import_sessions_cleanup_task(task_manager: BackgroundTaskManager):
    """Register import sessions cleanup task"""
    
    def cleanup_task():
        """Clean up old import sessions (older than 90 days)"""
        try:
            from sqlalchemy import create_engine, text
            from sqlalchemy.orm import sessionmaker
            
            # Database path
            db_path = backend_dir / "db" / "simpleTrade_new.db"
            
            if not db_path.exists():
                print(f"❌ Database not found at: {db_path}")
                return False
            
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
    
    # Register the task to run daily at 2:00 AM
    task_manager.register_task(
        name="import_sessions_cleanup",
        func=cleanup_task,
        schedule_interval="1d",  # Daily
        description="Clean up import sessions older than 90 days"
    )
    
    print("✅ Import sessions cleanup task registered")

if __name__ == "__main__":
    # For testing
    task_manager = BackgroundTaskManager()
    register_import_sessions_cleanup_task(task_manager)
