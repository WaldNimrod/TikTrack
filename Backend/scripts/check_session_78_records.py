#!/usr/bin/env python3
"""
Check Session 78 Records
========================
Analyzes session 78 and all created cash flow records to identify issues.
"""

import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

# Add Backend to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.settings import DATABASE_URL, USING_SQLITE
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
    if USING_SQLITE:
        kwargs["connect_args"] = {"check_same_thread": False}
    return kwargs

def check_session_78():
    """Check session 78 and all created records"""
    
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Get session 78
        session = db.query(ImportSession).filter(ImportSession.id == 78).first()
        if not session:
            print("❌ Session 78 not found")
            return
        
        print("=" * 80)
        print(f"📋 SESSION 78 DETAILS")
        print("=" * 80)
        print(f"ID: {session.id}")
        print(f"File Name: {session.file_name}")
        print(f"Trading Account ID: {session.trading_account_id}")
        print(f"Status: {session.status}")
        print(f"Created At: {session.created_at}")
        print()
        
        # Get preview data
        preview_data = session.get_summary_data('preview_data')
        if preview_data:
            records_to_import = preview_data.get('records_to_import', [])
            records_to_skip = preview_data.get('records_to_skip', [])
            summary = preview_data.get('summary', {})
            
            print("📊 PREVIEW DATA SUMMARY")
            print("-" * 80)
            print(f"Records to Import: {len(records_to_import)}")
            print(f"Records to Skip: {len(records_to_skip)}")
            print(f"Summary: {summary}")
            print()
            
            # Show first 10 records to import
            print("📝 FIRST 10 RECORDS TO IMPORT:")
            print("-" * 80)
            for i, rec in enumerate(records_to_import[:10], 1):
                print(f"\n{i}. Record:")
                if isinstance(rec, dict):
                    if 'record' in rec:
                        r = rec['record']
                        print(f"   Cashflow Type: {r.get('cashflow_type')}")
                        print(f"   Storage Type: {r.get('storage_type')}")
                        print(f"   Amount: {r.get('amount')}")
                        print(f"   Currency: {r.get('currency')}")
                        print(f"   Date: {r.get('effective_date')}")
                        print(f"   External ID: {r.get('external_id')}")
                        print(f"   Metadata: {r.get('metadata')}")
                    else:
                        print(f"   Type: {rec.get('cashflow_type') or rec.get('type')}")
                        print(f"   Amount: {rec.get('amount')}")
                        print(f"   Currency: {rec.get('currency')}")
                        print(f"   External ID: {rec.get('external_id')}")
                else:
                    print(f"   Raw: {rec}")
            print()
        
        # Get all cash flows created from this session
        # Find by source='file_import' and created after session creation
        all_imported = db.query(CashFlow).filter(
            CashFlow.source == 'file_import'
        ).order_by(CashFlow.id.desc()).limit(100).all()
        
        print("=" * 80)
        print(f"💾 CREATED CASH FLOW RECORDS (Last 100)")
        print("=" * 80)
        print(f"Total imported records found: {len(all_imported)}")
        print()
        
        # Group by type
        by_type = {}
        for cf in all_imported:
            cf_type = cf.type or 'unknown'
            if cf_type not in by_type:
                by_type[cf_type] = []
            by_type[cf_type].append(cf)
        
        print("📊 RECORDS BY TYPE:")
        print("-" * 80)
        for cf_type, records in sorted(by_type.items()):
            print(f"\n{cf_type}: {len(records)} records")
            for cf in records[:5]:  # Show first 5 of each type
                currency = db.query(Currency).filter(Currency.id == cf.currency_id).first()
                currency_symbol = currency.symbol if currency else f"ID:{cf.currency_id}"
                print(f"  • ID: {cf.id}, Amount: {cf.amount} {currency_symbol}, Date: {cf.date}")
                print(f"    External ID: {cf.external_id}")
                print(f"    Description: {cf.description or 'N/A'}")
                if cf.type in ('currency_exchange_from', 'currency_exchange_to'):
                    print(f"    Fee: {cf.fee_amount}")
        
        # Check for forex pairs
        print("\n" + "=" * 80)
        print("🔄 FOREX EXCHANGE PAIRS")
        print("=" * 80)
        forex_records = db.query(CashFlow).filter(
            CashFlow.type.in_(('currency_exchange_from', 'currency_exchange_to')),
            CashFlow.source == 'file_import'
        ).order_by(CashFlow.id.desc()).limit(50).all()
        
        if forex_records:
            # Group by external_id
            forex_groups = {}
            for cf in forex_records:
                ext_id = cf.external_id or 'no_external_id'
                if ext_id not in forex_groups:
                    forex_groups[ext_id] = []
                forex_groups[ext_id].append(cf)
            
            print(f"Found {len(forex_groups)} exchange groups:")
            for ext_id, records in list(forex_groups.items())[:10]:
                print(f"\n  Exchange ID: {ext_id}")
                for cf in records:
                    currency = db.query(Currency).filter(Currency.id == cf.currency_id).first()
                    currency_symbol = currency.symbol if currency else f"ID:{cf.currency_id}"
                    print(f"    • {cf.type}: {cf.amount} {currency_symbol}, Fee: {cf.fee_amount}, Date: {cf.date}")
        else:
            print("No forex exchange records found")
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    check_session_78()

