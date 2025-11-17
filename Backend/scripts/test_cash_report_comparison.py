#!/usr/bin/env python3
"""
Test script to analyze sample file and display comparison table.
Simple version that only uses IBKRConnector without full system dependencies.
"""
import sys
import os
import csv
import io
from typing import Dict, List, Any, Optional

# Add Backend to path
backend_dir = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, backend_dir)

# Change to project root
project_root = os.path.join(backend_dir, '..')
os.chdir(project_root)

# Import only what we need
from connectors.user_data_import.ibkr_connector import IBKRConnector

def main():
    # Read the sample file
    file_path = '_Tmp/activity - 2024.csv'
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        file_content = f.read()

    print('📁 Parsing file...')
    print(f'File size: {len(file_content)} characters')
    print()

    # Initialize connector
    connector = IBKRConnector()

    # Parse sections
    print('🔍 Parsing sections...')
    sections = connector.parse_sections(file_content)
    cashflows = sections.get('cashflows', [])
    cash_report_summary = sections.get('cash_report_summary', {})

    print()
    print('📊 Cash Report Summary (from file):')
    if cash_report_summary:
        for cf_type, total in sorted(cash_report_summary.items()):
            print(f'  {cf_type}: {total:,.2f}')
    else:
        print('  (no summary found)')
    print()
    print(f'Total cashflow records parsed: {len(cashflows)}')
    print()

    # Calculate import totals by type
    import_totals = {}
    type_counts = {}
    for record in cashflows:
        cashflow_type = (record.get('cashflow_type') or '').lower()
        if not cashflow_type:
            continue
        amount = float(record.get('amount', 0))
        import_totals[cashflow_type] = import_totals.get(cashflow_type, 0.0) + abs(amount)
        type_counts[cashflow_type] = type_counts.get(cashflow_type, 0) + 1

    print('📦 Import Totals (from parsed records):')
    if import_totals:
        for cf_type, total in sorted(import_totals.items()):
            count = type_counts.get(cf_type, 0)
            print(f'  {cf_type}: {total:,.2f} ({count} records)')
    else:
        print('  (no records)')
    print()

    # Compare
    print('=' * 90)
    print('📊 COMPARISON TABLE - Import Totals vs Cash Report Summary')
    print('=' * 90)
    print()

    all_types = set(import_totals.keys()) | set(cash_report_summary.keys())

    if not all_types:
        print('⚠️ No data to compare')
        return

    # Header
    header_type = 'סוג תזרים'
    header_import = 'סכום ייבוא'
    header_report = 'סכום דוח'
    header_diff = 'הפרש'
    header_status = 'סטטוס'
    
    print(f'{header_type:<35} {header_import:>18} {header_report:>18} {header_diff:>18} {header_status:>12}')
    print('-' * 90)

    matches = 0
    mismatches = 0
    
    for cashflow_type in sorted(all_types):
        import_total = import_totals.get(cashflow_type, 0.0)
        report_total = cash_report_summary.get(cashflow_type, 0.0)
        difference = abs(import_total - report_total)
        match = difference < 0.01
        status = '✅ תואם' if match else '⚠️ לא תואם'
        
        if match:
            matches += 1
        else:
            mismatches += 1
        
        print(f'{cashflow_type:<35} {import_total:>18,.2f} {report_total:>18,.2f} {difference:>18,.2f} {status:>12}')

    print('-' * 90)
    print()
    print(f'Total types compared: {len(all_types)}')
    print(f'✅ Matches: {matches}')
    print(f'⚠️ Mismatches: {mismatches}')
    
    # Show details for mismatches
    if mismatches > 0:
        print()
        print('⚠️ MISMATCHES DETECTED:')
        print('-' * 90)
        for cashflow_type in sorted(all_types):
            import_total = import_totals.get(cashflow_type, 0.0)
            report_total = cash_report_summary.get(cashflow_type, 0.0)
            difference = abs(import_total - report_total)
            if difference >= 0.01:
                percentage_diff = (difference / report_total * 100) if report_total != 0 else 0
                print(f"  {cashflow_type}:")
                print(f"    Import: {import_total:,.2f}")
                print(f"    Report: {report_total:,.2f}")
                print(f"    Difference: {difference:,.2f} ({percentage_diff:.2f}%)")
                print()
    else:
        print()
        print('✅ All totals match!')

if __name__ == '__main__':
    main()
