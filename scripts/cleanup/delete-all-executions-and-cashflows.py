#!/usr/bin/env python3
"""
Delete All Executions and Cash Flows Script
Deletes all records from executions and cash_flows tables for clean testing
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
from config.settings import DATABASE_URL

def delete_all_executions_and_cashflows():
    """Delete all executions and cash flows from database"""
    
    try:
        # Create engine and session
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        db_session = Session()
        
        # Count existing executions
        count_executions_query = text("SELECT COUNT(*) FROM executions")
        count_executions_result = db_session.execute(count_executions_query)
        executions_count = count_executions_result.scalar()
        
        # Count existing cash flows
        count_cashflows_query = text("SELECT COUNT(*) FROM cash_flows")
        count_cashflows_result = db_session.execute(count_cashflows_query)
        cashflows_count = count_cashflows_result.scalar()
        
        if executions_count == 0 and cashflows_count == 0:
            print("✅ No executions or cash flows to delete - tables are already empty")
            db_session.close()
            return True
        
        print(f"🧹 Found {executions_count} executions and {cashflows_count} cash flows - preparing to delete...")
        
        # Delete all executions
        if executions_count > 0:
            delete_executions_query = text("DELETE FROM executions")
            result = db_session.execute(delete_executions_query)
            deleted_executions = result.rowcount
            print(f"✅ Successfully deleted {deleted_executions} executions")
        
        # Delete all cash flows
        if cashflows_count > 0:
            delete_cashflows_query = text("DELETE FROM cash_flows")
            result = db_session.execute(delete_cashflows_query)
            deleted_cashflows = result.rowcount
            print(f"✅ Successfully deleted {deleted_cashflows} cash flows")
        
        # Commit changes
        db_session.commit()
        db_session.close()
        
        print(f"✅ Successfully deleted all executions and cash flows")
        return True
        
    except Exception as e:
        print(f"❌ Error deleting executions and cash flows: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("======================================================================")
    print("Delete All Executions and Cash Flows Script")
    print("======================================================================")
    print("\n🔄 Starting deletion of all executions and cash flows...")
    print(f"📊 Database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    success = delete_all_executions_and_cashflows()
    print("\n======================================================================")
    print(f"✅ Script completed successfully" if success else "❌ Script failed")
    sys.exit(0 if success else 1)

