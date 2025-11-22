#!/usr/bin/env python3
"""
Validate Import Session - Check import session data integrity

This script validates a specific import session and checks:
- selected_types persistence in preview_data
- Filtering accuracy
- Record classification correctness

Usage:
    python3 Backend/scripts/validate_import_session.py <session_id>

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-01-16
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.import_session import ImportSession
from models.cash_flow import CashFlow
from config.database import DATABASE_URL

def validate_session(session_id: int):
    """Validate import session"""
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        session = db.query(ImportSession).filter(ImportSession.id == session_id).first()
        if not session:
            print(f"❌ Session {session_id} not found")
            return
        
        print(f"\n📋 SESSION {session_id} VALIDATION")
        print("=" * 80)
        
        # Get preview_data
        preview_data = session.get_summary_data('preview_data')
        if not preview_data:
            print("❌ No preview_data found")
            return
        
        # Check selected_types
        selected_types = preview_data.get('selected_types', [])
        print(f"\n✅ Selected Types: {selected_types}")
        
        # Check records_to_import
        records_to_import = preview_data.get('records_to_import', [])
        print(f"📊 Records to Import: {len(records_to_import)}")
        
        # Count types in preview
        preview_types = {}
        for rec in records_to_import:
            cf_type = rec.get('cashflow_type') or rec.get('type') or 'unknown'
            preview_types[cf_type] = preview_types.get(cf_type, 0) + 1
        
        print(f"\n📝 Types in Preview:")
        for t, count in sorted(preview_types.items()):
            print(f"  {t}: {count}")
        
        # Check database records
        imported_cashflows = db.query(CashFlow).filter(
            CashFlow.source == 'file_import'
        ).order_by(CashFlow.id.desc()).limit(100).all()
        
        db_types = {}
        for cf in imported_cashflows:
            cf_type = cf.type or 'unknown'
            db_types[cf_type] = db_types.get(cf_type, 0) + 1
        
        print(f"\n💾 Types in Database (recent):")
        for t, count in sorted(db_types.items()):
            print(f"  {t}: {count}")
        
        # Validate filtering
        if selected_types:
            selected_lower = [t.lower() for t in selected_types]
            unexpected = [t for t in db_types.keys() if t.lower() not in selected_lower]
            if unexpected:
                print(f"\n❌ UNEXPECTED TYPES IN DATABASE: {unexpected}")
            else:
                print(f"\n✅ All database types match selected_types")
        
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 validate_import_session.py <session_id>")
        sys.exit(1)
    
    try:
        session_id = int(sys.argv[1])
        validate_session(session_id)
    except ValueError:
        print("❌ Invalid session_id. Must be an integer.")
        sys.exit(1)

