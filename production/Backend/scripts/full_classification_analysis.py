#!/usr/bin/env python3
"""
Full Cash Flow Classification Analysis
======================================

Complete analysis showing:
1. Example row from file
2. Line number
3. How system classifies it (step by step)
4. Record created (if exists)
"""

import csv
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.settings import DATABASE_URL, USING_SQLITE
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
    if USING_SQLITE:
        kwargs["connect_args"] = {"check_same_thread": False}
    return kwargs

def analyze_classification_logic():
    """
    Analyze the complete classification logic step by step.
    """
    print("📊 TikTrack - Complete Cash Flow Classification Analysis")
    print("=" * 120)
    
    # Connect to database
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Read file
        file_path = "_Tmp/activity - 2024.csv"
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Key examples to analyze
        examples = [
            {
                'name': 'Change in Dividend Accruals - NVDA (Line 773)',
                'line': 773,
                'expected_section': 'Change in Dividend Accruals',
                'expected_cashflow_type': 'dividend_accrual',
                'expected_storage_type': 'other_positive'
            },
            {
                'name': 'Trades Forex - EUR.ILS (Line 671)',
                'line': 671,
                'expected_section': 'Trades',
                'expected_cashflow_type': 'forex_conversion',
                'expected_storage_type': 'currency_exchange_from'
            }
        ]
        
        print("\n" + "=" * 120)
        print("📋 DETAILED CLASSIFICATION ANALYSIS")
        print("=" * 120)
        
        for example in examples:
            line_num = example['line']
            if line_num > len(lines):
                continue
            
            line = lines[line_num - 1]
            reader = csv.reader([line])
            row = next(reader)
            
            print(f"\n\n{'='*120}")
            print(f"📌 {example['name']}")
            print(f"{'='*120}")
            
            print(f"\n1️⃣ Full Data Row (Line {line_num}):")
            print(f"   {line[:250]}")
            
            print(f"\n2️⃣ Parsed CSV Row:")
            for i, val in enumerate(row[:15]):  # First 15 columns
                print(f"   [{i}]: {val}")
            
            print(f"\n3️⃣ Classification Logic:")
            print(f"   Step 1: Section Detection")
            section_name = row[0] if row else 'Unknown'
            print(f"      → Section Name: '{section_name}'")
            
            # Simulate IBKR connector logic
            if section_name == 'Change in Dividend Accruals':
                print(f"      → Section Key: 'dividend_accrual' (from CASHFLOW_SECTION_NAMES)")
                print(f"      → _resolve_cashflow_type() called")
                print(f"      → Returns: 'dividend_accrual'")
                print(f"      → _resolve_cashflow_storage_type() called")
                amount = float(row[12]) if len(row) > 12 and row[12] else 0.0
                is_positive = amount >= 0
                storage_type = 'other_positive' if is_positive else 'other_negative'
                print(f"      → Amount: {amount}, is_positive: {is_positive}")
                print(f"      → Storage Type: '{storage_type}'")
                print(f"      → Mapping Note: 'Dividend accrual'")
                
            elif section_name == 'Trades' and len(row) >= 4:
                asset_category = row[2] if len(row) > 2 else ''
                data_discriminator = row[1] if len(row) > 1 else ''
                print(f"      → Asset Category: '{asset_category}'")
                print(f"      → DataDiscriminator: '{data_discriminator}'")
                
                if asset_category == 'Forex' and data_discriminator == 'Order':
                    print(f"      → ✅ Matches Forex condition: Asset Category == 'Forex' AND DataDiscriminator == 'Order'")
                    print(f"      → Added to _pending_forex_rows")
                    print(f"      → _build_forex_cashflows() will process this")
                    print(f"      → Creates TWO records:")
                    print(f"         - FROM: cashflow_type='forex_conversion', amount=-abs(Quantity), currency=base")
                    print(f"         - TO: cashflow_type='forex_conversion', amount=abs(Quantity*T.Price), currency=quote")
                    print(f"      → _resolve_cashflow_storage_type() called for each")
                    print(f"      → FROM: storage_type='currency_exchange_from' (negative amount)")
                    print(f"      → TO: storage_type='currency_exchange_to' (positive amount)")
                else:
                    print(f"      → ❌ Does NOT match Forex condition")
                    print(f"      → Processed as regular trade (not cashflow)")
            
            print(f"\n4️⃣ Expected Result:")
            print(f"   Cash Flow Type: {example['expected_cashflow_type']}")
            print(f"   Storage Type: {example['expected_storage_type']}")
            
            # Find matching record
            print(f"\n5️⃣ Actual Record in Database:")
            matching = find_record_for_example(example, row, db)
            if matching:
                currency = db.query(Currency).filter(Currency.id == matching.currency_id).first()
                currency_symbol = currency.symbol if currency else f"ID:{matching.currency_id}"
                print(f"   ✅ FOUND")
                print(f"   ID: {matching.id}")
                print(f"   Type: {matching.type}")
                print(f"   Amount: {matching.amount} {currency_symbol}")
                print(f"   Fee: {matching.fee_amount}")
                print(f"   Date: {matching.date}")
                print(f"   External ID: {matching.external_id}")
                print(f"   Source: {matching.source}")
                
                # Check if matches expected
                if example['expected_storage_type'] == 'other_positive':
                    if matching.type != 'other_positive':
                        print(f"   ⚠️  MISMATCH: Expected 'other_positive', got '{matching.type}'")
                    else:
                        print(f"   ✅ Classification CORRECT")
                elif example['expected_storage_type'] == 'currency_exchange_from':
                    if matching.type not in ('currency_exchange_from', 'currency_exchange_to'):
                        print(f"   ⚠️  MISMATCH: Expected 'currency_exchange_from/to', got '{matching.type}'")
                    else:
                        print(f"   ✅ Classification CORRECT")
            else:
                print(f"   ❌ NOT FOUND")
        
        # Summary of classification rules
        print(f"\n\n{'='*120}")
        print("📋 CLASSIFICATION RULES SUMMARY")
        print(f"{'='*120}")
        print("""
1. Change in Dividend Accruals:
   - Section: 'Change in Dividend Accruals'
   - Section Key: 'dividend_accrual' (from CASHFLOW_SECTION_NAMES)
   - _resolve_cashflow_type(): Returns 'dividend_accrual'
   - _resolve_cashflow_storage_type(): 
     * If amount >= 0 → 'other_positive'
     * If amount < 0 → 'other_negative'
   - Should NEVER be classified as 'forex_conversion'

2. Trades Section - Forex:
   - Section: 'Trades'
   - Condition: Asset Category == 'Forex' AND DataDiscriminator == 'Order'
   - Processed by: _parse_trades_section() → stored in _pending_forex_rows
   - Later processed by: _build_forex_cashflows()
   - Creates: TWO records with cashflow_type='forex_conversion'
   - _resolve_cashflow_storage_type():
     * FROM: 'currency_exchange_from' (negative amount)
     * TO: 'currency_exchange_to' (positive amount)

3. Other Sections:
   - 'Dividends' → 'dividend'
   - 'Interest' → 'interest'
   - 'Withholding Tax' → 'tax'
   - 'Borrow Fee Details' → 'borrow_fee' → 'fee'
   - 'Stock Yield Enhancement Program Securities Lent Interest Details' → 'syep_interest'
   - 'Transfers' → 'transfer' → 'transfer_in'/'transfer_out'
   - 'Deposits & Withdrawals' → 'deposit'/'withdrawal'
""")
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

def find_record_for_example(example: dict, row: list, db) -> CashFlow:
    """Find matching record for example."""
    if example['name'] == 'Change in Dividend Accruals - NVDA (Line 773)':
        # Look for NVDA dividend accrual record
        for record in db.query(CashFlow).filter(CashFlow.source == 'file_import').all():
            if 'NVDA' in (record.description or '') and record.type in ('other_positive', 'other_negative'):
                if str(record.date) == '2024-12-04':
                    return record
    elif example['name'] == 'Trades Forex - EUR.ILS (Line 671)':
        # Look for forex record from 2024-10-18
        for record in db.query(CashFlow).filter(CashFlow.source == 'file_import').all():
            if record.type in ('currency_exchange_from', 'currency_exchange_to'):
                if str(record.date) == '2024-10-18':
                    return record
    return None

if __name__ == "__main__":
    try:
        analyze_classification_logic()
        print("\n🎉 Analysis completed successfully!")
    except Exception as e:
        print(f"\n❌ Script failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

