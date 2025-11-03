#!/usr/bin/env python3
"""
Delete All Cash Flows Script
Deletes all records from cash_flows table for clean testing
"""

import os
import sys
from pathlib import Path

# Add Backend to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def delete_all_cash_flows():
    """Delete all cash flows from database"""
    
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
        
        # Count existing records
        count_query = text("SELECT COUNT(*) FROM cash_flows")
        count_result = db_session.execute(count_query)
        count = count_result.scalar()
        
        if count == 0:
            print("✅ No cash flows to delete - table is already empty")
            db_session.close()
            return True
        
        print(f"🧹 Found {count} cash flows - preparing to delete...")
        
        # Delete all records
        delete_query = text("DELETE FROM cash_flows")
        result = db_session.execute(delete_query)
        deleted_count = result.rowcount
        
        # Commit changes
        db_session.commit()
        db_session.close()
        
        print(f"✅ Successfully deleted {deleted_count} cash flows")
        return True
        
    except Exception as e:
        print(f"❌ Error deleting cash flows: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = delete_all_cash_flows()
    sys.exit(0 if success else 1)














