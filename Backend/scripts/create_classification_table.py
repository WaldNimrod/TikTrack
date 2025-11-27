#!/usr/bin/env python3
"""
Create Comprehensive Cash Flow Classification Table
====================================================

Creates a detailed table showing for each cash flow type:
1. Example full data row from file
2. Line number in file
3. Cash flow type returned by system
4. Record created from this row (if exists)
"""

import csv
import sys
import os
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
    # PostgreSQL only - no SQLite support
    return kwargs

def create_classification_table(file_path: str):
    """
    Create comprehensive classification table.
    """
    print("📊 TikTrack - Cash Flow Classification Table")
    print("=" * 120)
    print(f"\n📄 File: {file_path}\n")
    
    # Connect to database
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get all cash flows (including manual ones for reference)
        all_cash_flows = db.query(CashFlow).order_by(CashFlow.id).all()
        
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Define cashflow sections to analyze
        cashflow_sections = {
            'Change in Dividend Accruals': {
                'expected_type': 'dividend_accrual',
                'expected_storage': 'other_positive/other_negative',
                'examples': []
            },
            'Dividends': {
                'expected_type': 'dividend',
                'expected_storage': 'dividend',
                'examples': []
            },
            'Interest': {
                'expected_type': 'interest',
                'expected_storage': 'interest',
                'examples': []
            },
            'Withholding Tax': {
                'expected_type': 'tax',
                'expected_storage': 'tax',
                'examples': []
            },
            'Borrow Fee Details': {
                'expected_type': 'borrow_fee',
                'expected_storage': 'fee',
                'examples': []
            },
            'Stock Yield Enhancement Program Securities Lent Interest Details': {
                'expected_type': 'syep_interest',
                'expected_storage': 'syep_interest',
                'examples': []
            },
            'Transfers': {
                'expected_type': 'transfer',
                'expected_storage': 'transfer_in/transfer_out',
                'examples': []
            },
            'Deposits & Withdrawals': {
                'expected_type': 'deposit/withdrawal',
                'expected_storage': 'deposit/withdrawal',
                'examples': []
            },
            'Trades-Forex': {
                'expected_type': 'forex_conversion',
                'expected_storage': 'currency_exchange_from/currency_exchange_to',
                'examples': []
            }
        }
        
        # Parse file and collect examples
        current_section = None
        for line_num, line in enumerate(lines, 1):
            stripped = line.strip()
            if not stripped:
                continue
            
            try:
                reader = csv.reader([stripped])
                row = next(reader)
            except:
                continue
            
            if not row or len(row) < 2:
                continue
            
            # Check for section headers
            if row[1] == 'Header':
                section_name = row[0]
                if section_name in cashflow_sections:
                    current_section = section_name
                elif section_name == 'Trades':
                    current_section = 'Trades-Forex'  # We'll filter for Forex later
                else:
                    current_section = None
                continue
            
            # Check for data rows
            if row[1] == 'Data' and current_section:
                # Skip totals
                if any(x in str(row).lower() for x in ['total', 'subtotal', 'starting', 'ending']):
                    continue
                
                # For Trades section, only include Forex
                if current_section == 'Trades-Forex':
                    if len(row) >= 3 and row[2] == 'Order' and len(row) >= 4 and row[3] == 'Forex':
                        if len(cashflow_sections['Trades-Forex']['examples']) < 2:
                            cashflow_sections['Trades-Forex']['examples'].append({
                                'line': line_num,
                                'row': row,
                                'full_line': stripped[:250]
                            })
                elif current_section in cashflow_sections:
                    if len(cashflow_sections[current_section]['examples']) < 2:
                        cashflow_sections[current_section]['examples'].append({
                            'line': line_num,
                            'row': row,
                            'full_line': stripped[:250]
                        })
        
        # Print table
        print("\n" + "=" * 120)
        print("📊 CLASSIFICATION TABLE")
        print("=" * 120)
        
        for section_name, section_info in sorted(cashflow_sections.items()):
            if not section_info['examples']:
                continue
            
            print(f"\n\n{'='*120}")
            print(f"📁 Section: {section_name}")
            print(f"   Expected Type: {section_info['expected_type']}")
            print(f"   Expected Storage: {section_info['expected_storage']}")
            print(f"{'='*120}")
            
            for idx, example in enumerate(section_info['examples'], 1):
                print(f"\n--- Example #{idx} ---")
                print(f"1️⃣ Line Number: {example['line']}")
                print(f"\n2️⃣ Full Data Row:")
                print(f"   {example['full_line']}")
                print(f"\n3️⃣ Expected Cash Flow Type: {section_info['expected_type']}")
                print(f"   Expected Storage Type: {section_info['expected_storage']}")
                
                # Try to find matching record
                matching = find_matching_record_in_db(
                    example['row'], 
                    section_name, 
                    section_info['expected_type'],
                    all_cash_flows,
                    db
                )
                
                if matching:
                    currency = db.query(Currency).filter(Currency.id == matching.currency_id).first()
                    currency_symbol = currency.symbol if currency else f"ID:{matching.currency_id}"
                    print(f"\n4️⃣ Created Record:")
                    print(f"   ✅ FOUND")
                    print(f"   ID: {matching.id}")
                    print(f"   Type: {matching.type}")
                    print(f"   Amount: {matching.amount} {currency_symbol}")
                    print(f"   Fee Amount: {matching.fee_amount}")
                    print(f"   Date: {matching.date}")
                    print(f"   External ID: {matching.external_id}")
                    print(f"   Source: {matching.source}")
                    print(f"   Description: {(matching.description or 'N/A')[:100]}")
                    
                    # Check if classification matches
                    if section_info['expected_type'] == 'dividend_accrual':
                        if matching.type not in ('other_positive', 'other_negative'):
                            print(f"   ⚠️  WARNING: Expected other_positive/other_negative, got {matching.type}")
                    elif section_info['expected_type'] == 'forex_conversion':
                        if matching.type not in ('currency_exchange_from', 'currency_exchange_to'):
                            print(f"   ⚠️  WARNING: Expected currency_exchange_from/to, got {matching.type}")
                else:
                    print(f"\n4️⃣ Created Record: ❌ NOT FOUND")
                    print(f"   (Record may not have been imported or was deleted)")
        
        # Summary
        print(f"\n\n{'='*120}")
        print("📊 SUMMARY")
        print(f"{'='*120}")
        total_examples = sum(len(s['examples']) for s in cashflow_sections.values())
        print(f"Total sections analyzed: {len([s for s in cashflow_sections.values() if s['examples']])}")
        print(f"Total examples: {total_examples}")
        print(f"Total cash flows in DB: {len(all_cash_flows)}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

def find_matching_record_in_db(row: list, section_name: str, expected_type: str, 
                                all_records: list, db) -> CashFlow:
    """Find matching record in database."""
    if not row or len(row) < 3:
        return None
    
    # For dividend accrual
    if section_name == 'Change in Dividend Accruals' and len(row) >= 14:
        try:
            date = row[5] if len(row) > 5 else ''
            currency = row[3] if len(row) > 3 else ''
            net_amount = row[12] if len(row) > 12 else ''
            
            # Try to match by date, currency, and amount
            for record in all_records:
                if str(record.date) == date:
                    curr = db.query(Currency).filter(Currency.id == record.currency_id).first()
                    if curr and curr.symbol == currency:
                        # Check amount (with tolerance)
                        try:
                            expected_amount = float(net_amount)
                            if abs(abs(record.amount) - abs(expected_amount)) < 0.01:
                                if record.type in ('other_positive', 'other_negative'):
                                    return record
                        except:
                            pass
        except Exception as e:
            pass
    
    # For forex
    if section_name == 'Trades-Forex' and len(row) >= 10:
        try:
            date_str = row[6] if len(row) > 6 else ''  # Date/Time
            if date_str:
                # Extract date part
                date_part = date_str.split(',')[0].strip() if ',' in date_str else date_str.strip()
                
                # Find forex records by date
                for record in all_records:
                    if str(record.date) == date_part:
                        if record.type in ('currency_exchange_from', 'currency_exchange_to'):
                            return record
        except:
            pass
    
    # For other types, try to match by date and amount
    try:
        date = None
        amount = None
        currency = None
        
        if section_name == 'Dividends' and len(row) >= 4:
            date = row[3] if len(row) > 3 else ''
            currency = row[2] if len(row) > 2 else ''
            amount = row[4] if len(row) > 4 else ''
        elif section_name == 'Interest' and len(row) >= 5:
            date = row[3] if len(row) > 3 else ''
            currency = row[2] if len(row) > 2 else ''
            amount = row[4] if len(row) > 4 else ''
        elif section_name == 'Withholding Tax' and len(row) >= 4:
            date = row[3] if len(row) > 3 else ''
            currency = row[2] if len(row) > 2 else ''
            amount = row[4] if len(row) > 4 else ''
        
        if date and amount:
            try:
                amount_val = float(amount)
                for record in all_records:
                    if str(record.date) == date:
                        curr = db.query(Currency).filter(Currency.id == record.currency_id).first()
                        if curr and curr.symbol == currency:
                            if abs(abs(record.amount) - abs(amount_val)) < 0.01:
                                return record
            except:
                pass
    except:
        pass
    
    return None

if __name__ == "__main__":
    file_path = "_Tmp/activity - 2024.csv"
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    
    try:
        create_classification_table(file_path)
        print("\n🎉 Analysis completed successfully!")
    except Exception as e:
        print(f"\n❌ Script failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

