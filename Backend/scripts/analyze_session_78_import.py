#!/usr/bin/env python3
"""
Analyze Session 78 Import
=========================
Detailed analysis of what was selected vs what was created.
"""

import sys
import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

# Add Backend to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.settings import DATABASE_URL
from models.cash_flow import CashFlow
from models.currency import Currency
from models.import_session import ImportSession

def _build_engine_kwargs():
    kwargs = {
        "poolclass": QueuePool,
        "pool_size": 10,
        "max_overflow": 20,
        "pool_timeout": 60,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
        "echo": False,
    }
    # PostgreSQL only - no SQLite support
    return kwargs

def analyze_session_78():
    """Analyze session 78 in detail"""
    
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        session = db.query(ImportSession).filter(ImportSession.id == 78).first()
        if not session:
            print("❌ Session 78 not found")
            return
        
        print("=" * 80)
        print(f"📋 SESSION 78 - DETAILED ANALYSIS")
        print("=" * 80)
        
        # Get preview data
        preview_data = session.get_summary_data('preview_data')
        if not preview_data:
            print("❌ No preview data found")
            return
        
        records_to_import = preview_data.get('records_to_import', [])
        summary = preview_data.get('summary', {})
        
        print(f"\n📊 PREVIEW SUMMARY:")
        print(f"   Total records to import: {len(records_to_import)}")
        print(f"   Summary: {json.dumps(summary, indent=2, default=str)}")
        
        # Analyze by cashflow_type
        print("\n" + "=" * 80)
        print("📝 RECORDS TO IMPORT BY TYPE:")
        print("=" * 80)
        
        by_type = {}
        for rec in records_to_import:
            cf_type = rec.get('cashflow_type') or rec.get('type') or 'unknown'
            if cf_type not in by_type:
                by_type[cf_type] = []
            by_type[cf_type].append(rec)
        
        for cf_type, records in sorted(by_type.items()):
            print(f"\n{cf_type}: {len(records)} records")
            # Show first 3 examples
            for i, rec in enumerate(records[:3], 1):
                print(f"  Example {i}:")
                print(f"    Amount: {rec.get('amount')}")
                print(f"    Currency: {rec.get('currency')}")
                print(f"    Storage Type: {rec.get('storage_type')}")
                print(f"    External ID: {rec.get('external_id')}")
                if rec.get('metadata'):
                    print(f"    Metadata keys: {list(rec.get('metadata', {}).keys())}")
        
        # Check what was actually created
        print("\n" + "=" * 80)
        print("💾 ACTUALLY CREATED RECORDS:")
        print("=" * 80)
        
        all_imported = db.query(CashFlow).filter(
            CashFlow.source == 'file_import'
        ).order_by(CashFlow.id.desc()).limit(200).all()
        
        print(f"Total created: {len(all_imported)}")
        
        # Group by type
        created_by_type = {}
        for cf in all_imported:
            cf_type = cf.type or 'unknown'
            if cf_type not in created_by_type:
                created_by_type[cf_type] = []
            created_by_type[cf_type].append(cf)
        
        for cf_type, records in sorted(created_by_type.items()):
            print(f"\n{cf_type}: {len(records)} records")
            for cf in records[:3]:
                currency = db.query(Currency).filter(Currency.id == cf.currency_id).first()
                currency_symbol = currency.symbol if currency else f"ID:{cf.currency_id}"
                print(f"  • ID: {cf.id}, Amount: {cf.amount} {currency_symbol}")
                print(f"    External ID: {cf.external_id}")
                print(f"    Date: {cf.date}")
        
        # Compare
        print("\n" + "=" * 80)
        print("🔍 COMPARISON:")
        print("=" * 80)
        print("Expected to import:")
        for cf_type, records in sorted(by_type.items()):
            print(f"  {cf_type}: {len(records)}")
        print("\nActually created:")
        for cf_type, records in sorted(created_by_type.items()):
            print(f"  {cf_type}: {len(records)}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    analyze_session_78()

