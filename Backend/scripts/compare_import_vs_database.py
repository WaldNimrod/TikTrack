#!/usr/bin/env python3
"""
Compare Import vs Database - Compare preview data with actual database records

This script compares preview_data records_to_import with actual database records
to verify import accuracy.

Usage:
    python3 Backend/scripts/compare_import_vs_database.py <session_id>

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

def compare_import_vs_database(session_id: int):
    """Compare preview data with database records"""
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        session = db.query(ImportSession).filter(ImportSession.id == session_id).first()
        if not session:
            print(f"❌ Session {session_id} not found")
            return
        
        print(f"\n📋 COMPARING SESSION {session_id} PREVIEW vs DATABASE")
        print("=" * 80)
        
        # Get preview_data
        preview_data = session.get_summary_data('preview_data')
        if not preview_data:
            print("❌ No preview_data found")
            return
        
        records_to_import = preview_data.get('records_to_import', [])
        selected_types = preview_data.get('selected_types', [])
        
        print(f"\n📊 PREVIEW DATA:")
        print(f"  Selected Types: {selected_types}")
        print(f"  Records to Import: {len(records_to_import)}")
        
        # Count types in preview
        preview_types = {}
        for rec in records_to_import:
            cf_type = rec.get('cashflow_type') or rec.get('type') or 'unknown'
            preview_types[cf_type] = preview_types.get(cf_type, 0) + 1
        
        print(f"\n📝 Types in Preview:")
        for t, count in sorted(preview_types.items()):
            print(f"  {t}: {count}")
        
        # Get database records (recent, after session creation)
        imported_cashflows = db.query(CashFlow).filter(
            CashFlow.source == 'file_import'
        ).order_by(CashFlow.id.desc()).limit(200).all()
        
        db_types = {}
        for cf in imported_cashflows:
            cf_type = cf.type or 'unknown'
            db_types[cf_type] = db_types.get(cf_type, 0) + 1
        
        print(f"\n💾 Types in Database (recent):")
        for t, count in sorted(db_types.items()):
            print(f"  {t}: {count}")
        
        # Compare
        print(f"\n🔍 COMPARISON:")
        if selected_types:
            selected_lower = [t.lower() for t in selected_types]
            preview_selected = {k: v for k, v in preview_types.items() if k.lower() in selected_lower}
            db_selected = {k: v for k, v in db_types.items() if k.lower() in selected_lower}
            
            print(f"  Preview (selected types only): {preview_selected}")
            print(f"  Database (selected types only): {db_selected}")
            
            if preview_selected == db_selected:
                print(f"  ✅ MATCH: Preview and database match for selected types")
            else:
                print(f"  ❌ MISMATCH: Preview and database differ")
                print(f"    Preview: {preview_selected}")
                print(f"    Database: {db_selected}")
        else:
            print(f"  ⚠️  No selected_types - comparing all types")
            if preview_types == db_types:
                print(f"  ✅ MATCH: Preview and database match")
            else:
                print(f"  ❌ MISMATCH: Preview and database differ")
        
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 compare_import_vs_database.py <session_id>")
        sys.exit(1)
    
    try:
        session_id = int(sys.argv[1])
        compare_import_vs_database(session_id)
    except ValueError:
        print("❌ Invalid session_id. Must be an integer.")
        sys.exit(1)

