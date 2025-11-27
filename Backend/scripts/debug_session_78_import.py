#!/usr/bin/env python3
"""
Debug Session 78 Import
=======================
Check what selected_types were sent and what was actually imported.
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

def debug_session_78():
    """Debug session 78 import"""
    
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        session = db.query(ImportSession).filter(ImportSession.id == 78).first()
        if not session:
            print("❌ Session 78 not found")
            return
        
        print("=" * 80)
        print(f"🔍 SESSION 78 DEBUG")
        print("=" * 80)
        
        # Check all summary data
        all_summary = session.get_summary_data()
        print("\n📋 ALL SUMMARY DATA KEYS:")
        if all_summary:
            for key in all_summary.keys():
                print(f"  • {key}")
                if key == 'preview_data':
                    preview = all_summary[key]
                    if isinstance(preview, dict):
                        records = preview.get('records_to_import', [])
                        print(f"    Records to import: {len(records)}")
                        # Check types
                        types = {}
                        for rec in records:
                            cf_type = rec.get('cashflow_type') or rec.get('type') or 'unknown'
                            types[cf_type] = types.get(cf_type, 0) + 1
                        print(f"    Types in preview: {types}")
        
        # Check what was actually created
        print("\n💾 ACTUALLY CREATED:")
        all_imported = db.query(CashFlow).filter(
            CashFlow.source == 'file_import'
        ).order_by(CashFlow.id.desc()).limit(200).all()
        
        created_types = {}
        for cf in all_imported:
            cf_type = cf.type or 'unknown'
            created_types[cf_type] = created_types.get(cf_type, 0) + 1
        
        print(f"Total created: {len(all_imported)}")
        print(f"Types created: {created_types}")
        
        # Check forex exchanges specifically
        print("\n🔄 FOREX EXCHANGES:")
        forex_records = db.query(CashFlow).filter(
            CashFlow.type.in_(('currency_exchange_from', 'currency_exchange_to')),
            CashFlow.source == 'file_import'
        ).order_by(CashFlow.id.desc()).all()
        
        print(f"Total forex records: {len(forex_records)}")
        # Group by external_id
        forex_groups = {}
        for cf in forex_records:
            ext_id = cf.external_id or 'no_external_id'
            if ext_id not in forex_groups:
                forex_groups[ext_id] = []
            forex_groups[ext_id].append(cf)
        
        print(f"Exchange groups: {len(forex_groups)}")
        for ext_id, records in forex_groups.items():
            print(f"\n  {ext_id}:")
            for cf in records:
                currency = db.query(Currency).filter(Currency.id == cf.currency_id).first()
                currency_symbol = currency.symbol if currency else f"ID:{cf.currency_id}"
                print(f"    • {cf.type}: {cf.amount} {currency_symbol}, Fee: {cf.fee_amount}, Date: {cf.date}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    debug_session_78()

