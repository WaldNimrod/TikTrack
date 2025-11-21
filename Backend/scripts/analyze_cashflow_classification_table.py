#!/usr/bin/env python3
"""
Cash Flow Classification Table Analysis
========================================

Creates a comprehensive table showing:
1. Example full data row from file
2. Line number in file
3. Cash flow type returned by system
4. Record created from this row in last session
"""

import csv
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
# ImportSession model - check if exists
try:
    from models.import_session import ImportSession
except ImportError:
    ImportSession = None

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

def analyze_cashflow_classification_table(file_path: str):
    """
    Create comprehensive classification table.
    """
    print("📊 TikTrack - Cash Flow Classification Table")
    print("=" * 100)
    print(f"\n📄 Analyzing file: {file_path}\n")
    
    # Connect to database
    engine = create_engine(DATABASE_URL, **_build_engine_kwargs())
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get last import session
        session_id = None
        if ImportSession:
            try:
                last_session = db.query(ImportSession).order_by(ImportSession.id.desc()).first()
                session_id = last_session.id if last_session else None
            except:
                pass
        
        print(f"📋 Last import session ID: {session_id}\n")
        
        # Read file and analyze
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Track sections and examples
        sections_found = {}
        current_section = None
        current_headers = None
        
        for line_num, line in enumerate(lines, 1):
            stripped = line.strip()
            if not stripped:
                continue
            
            # Parse CSV
            try:
                reader = csv.reader([stripped])
                row = next(reader)
            except:
                continue
            
            if not row:
                continue
            
            # Check for section headers
            if len(row) >= 2 and row[1] == 'Header':
                section_name = row[0]
                current_section = section_name
                # Store headers
                if section_name not in sections_found:
                    sections_found[section_name] = {
                        'header_line': line_num,
                        'headers': row[2:] if len(row) > 2 else [],
                        'examples': []
                    }
                current_headers = row[2:] if len(row) > 2 else []
                continue
            
            # Check for data rows
            if len(row) >= 2 and row[1] == 'Data' and current_section:
                # Skip totals and subtotals
                if any(x in str(row).lower() for x in ['total', 'subtotal', 'starting', 'ending']):
                    continue
                
                # Store example
                if current_section not in sections_found:
                    sections_found[current_section] = {
                        'header_line': None,
                        'headers': [],
                        'examples': []
                    }
                
                if len(sections_found[current_section]['examples']) < 2:  # Store up to 2 examples
                    sections_found[current_section]['examples'].append({
                        'line_num': line_num,
                        'row': row,
                        'full_line': stripped[:200]  # First 200 chars
                    })
        
        # Now check what records were created
        if session_id:
            imported_records = db.query(CashFlow).filter(
                CashFlow.source == 'file_import'
            ).order_by(CashFlow.id.desc()).limit(50).all()
        else:
            imported_records = []
        
        # Map external_id patterns to records
        external_id_to_record = {}
        for record in imported_records:
            ext_id = record.external_id or ''
            # Extract pattern (e.g., "2024-12-04T00_00_00Z_dividend_accrual_USD_0_14")
            external_id_to_record[ext_id] = record
        
        # Print table
        print("\n" + "=" * 100)
        print("📊 CLASSIFICATION TABLE")
        print("=" * 100)
        
        # Filter to only cashflow-related sections
        cashflow_sections = [
            'Change in Dividend Accruals',
            'Dividends',
            'Interest',
            'Interest Accruals',
            'Withholding Tax',
            'Borrow Fee Details',
            'Stock Yield Enhancement Program Securities Lent Interest Details',
            'Transfers',
            'Cash Report',
            'Deposits & Withdrawals',
            'Trades'  # For forex conversions
        ]
        
        # Process each section
        for section_name, section_data in sorted(sections_found.items()):
            if not section_data['examples']:
                continue
            
            # Skip non-cashflow sections
            if section_name not in cashflow_sections and not any(
                cf in section_name for cf in ['Dividend', 'Interest', 'Tax', 'Fee', 'Transfer', 'Deposit', 'Withdrawal', 'Cash']
            ):
                continue
            
            print(f"\n\n{'='*100}")
            print(f"📁 Section: {section_name}")
            print(f"{'='*100}")
            
            for idx, example in enumerate(section_data['examples'], 1):
                print(f"\n--- Example #{idx} ---")
                print(f"1️⃣ Line Number: {example['line_num']}")
                print(f"\n2️⃣ Full Data Row (first 200 chars):")
                print(f"   {example['full_line']}")
                
                # Try to determine expected classification
                row = example['row']
                expected_type = determine_expected_type(section_name, row)
                print(f"\n3️⃣ Expected Cash Flow Type: {expected_type}")
                
                # Try to find matching record
                matching_record = find_matching_record(row, section_name, external_id_to_record, db)
                if matching_record:
                    currency = db.query(Currency).filter(Currency.id == matching_record.currency_id).first()
                    currency_symbol = currency.symbol if currency else f"ID:{matching_record.currency_id}"
                    print(f"\n4️⃣ Created Record:")
                    print(f"   ID: {matching_record.id}")
                    print(f"   Type: {matching_record.type}")
                    print(f"   Amount: {matching_record.amount} {currency_symbol}")
                    print(f"   Fee Amount: {matching_record.fee_amount}")
                    print(f"   Date: {matching_record.date}")
                    print(f"   External ID: {matching_record.external_id}")
                    print(f"   Description: {matching_record.description or 'N/A'}")
                else:
                    print(f"\n4️⃣ Created Record: ❌ NOT FOUND (may not have been imported)")
        
        # Summary
        print(f"\n\n{'='*100}")
        print("📊 SUMMARY")
        print(f"{'='*100}")
        print(f"Total sections found: {len(sections_found)}")
        print(f"Total examples: {sum(len(s['examples']) for s in sections_found.values())}")
        print(f"Total imported records checked: {len(imported_records)}")
        
    except Exception as e:
        print(f"\n❌ Error during analysis: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

def determine_expected_type(section_name: str, row: list) -> str:
    """Determine expected cash flow type based on section and row data."""
    # Map section names to expected types
    section_mapping = {
        'Change in Dividend Accruals': 'dividend_accrual',
        'Dividends': 'dividend',
        'Interest': 'interest',
        'Interest Accruals': 'interest_accrual',
        'Withholding Tax': 'tax',
        'Borrow Fee Details': 'borrow_fee',
        'Stock Yield Enhancement Program Securities Lent Interest Details': 'syep_interest',
        'Transfers': 'transfer',
        'Cash Report': 'cash_adjustment',  # Will be refined by activity code
    }
    
    base_type = section_mapping.get(section_name, 'cash_adjustment')
    
    # Special handling for Deposits & Withdrawals
    if section_name == 'Deposits & Withdrawals' and len(row) > 2:
        try:
            amount = float(row[2] or 0)
            return 'deposit' if amount > 0 else 'withdrawal'
        except (ValueError, TypeError):
            return 'deposit'  # Default
    
    # Special handling for Cash Report
    if section_name == 'Cash Report' and len(row) > 2:
        activity = str(row[2] or '').lower()
        if 'dividend' in activity:
            return 'dividend'
        elif 'interest' in activity:
            return 'interest'
        elif 'tax' in activity or 'withholding' in activity:
            return 'tax'
        elif 'fee' in activity or 'commission' in activity:
            return 'fee'
        elif 'deposit' in activity:
            return 'deposit'
        elif 'withdrawal' in activity or 'transfer' in activity:
            return 'withdrawal'
    
    return base_type

def find_matching_record(row: list, section_name: str, external_id_map: dict, db) -> CashFlow:
    """Try to find matching record in database."""
    # Try to extract key identifiers from row
    if len(row) < 3:
        return None
    
    # For dividend accrual
    if section_name == 'Change in Dividend Accruals' and len(row) >= 14:
        try:
            date = row[5] if len(row) > 5 else ''
            currency = row[3] if len(row) > 3 else ''
            net_amount = row[12] if len(row) > 12 else ''
            symbol = row[4] if len(row) > 4 else ''
            
            # Build expected external_id pattern
            # Format: YYYY-MM-DDT00_00_00Z_dividend_accrual_CURRENCY_AMOUNT
            date_part = date.replace('-', '-') if date else ''
            amount_part = net_amount.replace('.', '_').replace('-', '') if net_amount else ''
            pattern = f"{date_part}T00_00_00Z_dividend_accrual_{currency}_{amount_part}"
            
            # Try exact match
            for ext_id, record in external_id_map.items():
                if pattern in ext_id or ext_id.endswith(f"dividend_accrual_{currency}_{amount_part}"):
                    return record
        except:
            pass
    
    # For forex (from Trades section)
    if section_name == 'Trades' and len(row) >= 10:
        try:
            # Forex records are handled differently - check by date and amount
            date_str = row[6] if len(row) > 6 else ''  # Date/Time field
            proceeds = row[9] if len(row) > 9 else ''  # Proceeds field
            
            # Try to find by date
            if date_str:
                date_part = date_str.split(',')[0].strip() if ',' in date_str else date_str.strip()
                for record in db.query(CashFlow).filter(CashFlow.source == 'file_import').all():
                    if str(record.date) == date_part:
                        if record.type in ('currency_exchange_from', 'currency_exchange_to'):
                            return record
        except:
            pass
    
    return None

if __name__ == "__main__":
    file_path = "_Tmp/activity - 2024.csv"
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    
    try:
        analyze_cashflow_classification_table(file_path)
        print("\n🎉 Analysis completed successfully!")
    except Exception as e:
        print(f"\n❌ Script failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

