#!/usr/bin/env python3
"""
Analyze Cash Flow Classification Logic
======================================

This script analyzes how cash flow records are classified during import,
specifically checking:
1. Records with negative fee amounts
2. Records incorrectly classified as forex_conversion when they should be dividend_accrual
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

# Add Backend to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.settings import DATABASE_URL
from models.cash_flow import CashFlow
from models.currency import Currency

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
    # PostgreSQL only
    return kwargs

def analyze_cashflow_classification():
    """
    Analyze cash flow records to understand classification issues.
    """
    print("🔍 TikTrack - Cash Flow Classification Analysis")
    print("=" * 60)
    
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Check for records with negative fee amounts
        print("\n1️⃣ Checking for records with negative fee amounts:")
        print("-" * 60)
        negative_fee_records = db.query(CashFlow).filter(CashFlow.fee_amount < 0).all()
        
        if negative_fee_records:
            print(f"   Found {len(negative_fee_records)} record(s) with negative fee_amount:")
            for cf in negative_fee_records:
                currency = db.query(Currency).filter(Currency.id == cf.currency_id).first()
                currency_symbol = currency.symbol if currency else f"ID:{cf.currency_id}"
                print(f"\n   📋 Record ID: {cf.id}")
                print(f"      Type: {cf.type}")
                print(f"      Amount: {cf.amount} {currency_symbol}")
                print(f"      Fee Amount: {cf.fee_amount} (NEGATIVE!)")
                print(f"      Date: {cf.date}")
                print(f"      External ID: {cf.external_id}")
                print(f"      Source: {cf.source}")
                print(f"      Description: {cf.description or 'N/A'}")
        else:
            print("   ✅ No records with negative fee amounts found")
        
        # 2. Check dividend_accrual records that might be misclassified
        print("\n\n2️⃣ Checking dividend_accrual records:")
        print("-" * 60)
        dividend_accrual_records = db.query(CashFlow).filter(
            CashFlow.external_id.like('%dividend_accrual%')
        ).all()
        
        if dividend_accrual_records:
            print(f"   Found {len(dividend_accrual_records)} record(s) with dividend_accrual in external_id:")
            for cf in dividend_accrual_records:
                currency = db.query(Currency).filter(Currency.id == cf.currency_id).first()
                currency_symbol = currency.symbol if currency else f"ID:{cf.currency_id}"
                print(f"\n   📋 Record ID: {cf.id}")
                print(f"      Type: {cf.type}")
                print(f"      Amount: {cf.amount} {currency_symbol}")
                print(f"      Fee Amount: {cf.fee_amount}")
                print(f"      Date: {cf.date}")
                print(f"      External ID: {cf.external_id}")
                print(f"      Source: {cf.source}")
                print(f"      Description: {cf.description or 'N/A'}")
                
                # Check if this might be misclassified as forex
                if cf.type in ('currency_exchange_from', 'currency_exchange_to'):
                    print(f"      ⚠️  WARNING: This dividend_accrual record is classified as {cf.type}!")
        else:
            print("   ✅ No dividend_accrual records found")
        
        # 3. Check forex_conversion records
        print("\n\n3️⃣ Checking forex_conversion records:")
        print("-" * 60)
        forex_records = db.query(CashFlow).filter(
            CashFlow.type.in_(('currency_exchange_from', 'currency_exchange_to'))
        ).all()
        
        if forex_records:
            print(f"   Found {len(forex_records)} forex conversion record(s):")
            for cf in forex_records:
                currency = db.query(Currency).filter(Currency.id == cf.currency_id).first()
                currency_symbol = currency.symbol if currency else f"ID:{cf.currency_id}"
                print(f"\n   📋 Record ID: {cf.id}")
                print(f"      Type: {cf.type}")
                print(f"      Amount: {cf.amount} {currency_symbol}")
                print(f"      Fee Amount: {cf.fee_amount}")
                print(f"      Date: {cf.date}")
                print(f"      External ID: {cf.external_id}")
                print(f"      Source: {cf.source}")
                print(f"      Description: {cf.description or 'N/A'}")
                
                # Check if this might be misclassified (should be dividend_accrual)
                if 'dividend_accrual' in (cf.external_id or '').lower():
                    print(f"      ⚠️  WARNING: This forex record has 'dividend_accrual' in external_id!")
        else:
            print("   ✅ No forex conversion records found")
        
        # 4. Summary
        print("\n\n📊 Summary:")
        print("-" * 60)
        total_records = db.query(CashFlow).count()
        imported_records = db.query(CashFlow).filter(CashFlow.source == 'file_import').count()
        print(f"   Total cash flow records: {total_records}")
        print(f"   Imported records: {imported_records}")
        print(f"   Records with negative fee: {len(negative_fee_records)}")
        print(f"   Dividend accrual records: {len(dividend_accrual_records)}")
        print(f"   Forex conversion records: {len(forex_records)}")
        
    except Exception as e:
        print(f"\n❌ Error during analysis: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    try:
        analyze_cashflow_classification()
        print("\n🎉 Analysis completed successfully!")
    except Exception as e:
        print(f"\n❌ Script failed: {e}", file=sys.stderr)
        sys.exit(1)
