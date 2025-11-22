#!/usr/bin/env python3
"""
Reset Account Linking Status for Import Session
Resets linking_confirmed and linking_status to force account linking check again
"""

import os
import sys
from pathlib import Path
import json

# Add Backend to path
project_root = Path(__file__).parent.parent.parent
backend_dir = project_root / "production" / "Backend"
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.settings import DATABASE_URL
import os

def reset_account_linking_for_session(session_id: int):
    """Reset account linking status for a specific session"""
    
    try:
        # Get PostgreSQL connection details
        postgres_host = os.getenv('POSTGRES_HOST', 'localhost')
        postgres_db = os.getenv('POSTGRES_DB', 'TikTrack-db-development')
        postgres_user = os.getenv('POSTGRES_USER', 'TikTrakDBAdmin')
        postgres_password = os.getenv('POSTGRES_PASSWORD', 'BigMeZoo1974!?')
        
        # Use PostgreSQL if env vars are set
        if postgres_host and postgres_db:
            db_url = f'postgresql+psycopg2://{postgres_user}:{postgres_password}@{postgres_host}:5432/{postgres_db}'
        else:
            db_url = DATABASE_URL
        
        # Create engine and session
        engine = create_engine(db_url)
        Session = sessionmaker(bind=engine)
        db_session = Session()
        
        # Get current session data (PostgreSQL syntax)
        result = db_session.execute(text("""
            SELECT id, summary_data::text 
            FROM import_sessions 
            WHERE id = :session_id
        """), {'session_id': session_id})
        
        row = result.fetchone()
        if not row:
            print(f"❌ Session {session_id} not found")
            db_session.close()
            return False
        
        current_summary = json.loads(row[1]) if row[1] else {}
        
        print(f"📋 Current linking status:")
        print(f"   linking_confirmed: {current_summary.get('linking_confirmed')}")
        print(f"   linking_status: {current_summary.get('linking_status')}")
        print(f"   file_account_number: {current_summary.get('file_account_number')}")
        
        # Reset linking status
        current_summary['linking_confirmed'] = False
        current_summary['linking_status'] = 'unlinked'
        # Keep file_account_number - we still need it
        
        # Update session (PostgreSQL syntax)
        summary_json = json.dumps(current_summary)
        db_session.execute(text("""
            UPDATE import_sessions 
            SET summary_data = CAST(:summary_data AS jsonb),
                status = 'analyzing'
            WHERE id = :session_id
        """), {
            'session_id': session_id,
            'summary_data': summary_json
        })
        
        # Commit changes
        db_session.commit()
        db_session.close()
        
        print(f"✅ Successfully reset account linking status for session {session_id}")
        print(f"   New linking_confirmed: False")
        print(f"   New linking_status: 'unlinked'")
        return True
        
    except Exception as e:
        print(f"❌ Error resetting account linking: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Reset account linking status for import session')
    parser.add_argument('session_id', type=int, help='Import session ID')
    args = parser.parse_args()
    
    print("======================================================================")
    print("Reset Account Linking Status for Import Session")
    print("======================================================================")
    print(f"\n🔄 Resetting account linking status for session {args.session_id}...")
    
    success = reset_account_linking_for_session(args.session_id)
    
    print("\n======================================================================")
    print(f"✅ Script completed successfully" if success else "❌ Script failed")
    sys.exit(0 if success else 1)

