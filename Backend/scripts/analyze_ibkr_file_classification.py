#!/usr/bin/env python3
"""
Analyze IBKR File Classification
=================================

This script analyzes the IBKR file to understand how records are classified,
specifically focusing on:
1. Change in Dividend Accruals records
2. Forex conversion records
3. How the connector classifies them
"""

import csv
import sys
from pathlib import Path

def analyze_ibkr_file(file_path: str):
    """
    Analyze the IBKR file to understand record classification.
    """
    print("🔍 TikTrack - IBKR File Classification Analysis")
    print("=" * 70)
    print(f"\n📄 Analyzing file: {file_path}\n")
    
    file_path_obj = Path(file_path)
    if not file_path_obj.exists():
        print(f"❌ File not found: {file_path}")
        return
    
    # Read file
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"📊 Total lines in file: {len(lines)}\n")
    
    # Analyze sections
    current_section = None
    section_lines = {}
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if not stripped:
            continue
        
        # Check for section headers
        if stripped.startswith('Change in Dividend Accruals'):
            current_section = 'Change in Dividend Accruals'
            if current_section not in section_lines:
                section_lines[current_section] = []
            section_lines[current_section].append((i, stripped))
        elif stripped.startswith('Trades,Data,Order,Forex'):
            current_section = 'Trades-Forex'
            if current_section not in section_lines:
                section_lines[current_section] = []
            section_lines[current_section].append((i, stripped))
        elif stripped.startswith('Trades,Header'):
            current_section = 'Trades-Header'
        elif stripped.startswith('Dividends'):
            if current_section != 'Dividends':
                current_section = 'Dividends'
                if current_section not in section_lines:
                    section_lines[current_section] = []
                section_lines[current_section].append((i, stripped))
    
    # Print analysis
    print("📋 Section Analysis:")
    print("-" * 70)
    for section, records in section_lines.items():
        print(f"\n{section}: {len(records)} record(s)")
        if section == 'Change in Dividend Accruals':
            print("\n   Sample records:")
            for line_num, line in records[:5]:
                parts = line.split(',')
                if len(parts) >= 10:
                    print(f"   Line {line_num}:")
                    print(f"      Asset Category: {parts[2] if len(parts) > 2 else 'N/A'}")
                    print(f"      Currency: {parts[3] if len(parts) > 3 else 'N/A'}")
                    print(f"      Symbol: {parts[4] if len(parts) > 4 else 'N/A'}")
                    print(f"      Date: {parts[5] if len(parts) > 5 else 'N/A'}")
                    print(f"      Net Amount: {parts[12] if len(parts) > 12 else 'N/A'}")
                    print(f"      Code: {parts[13] if len(parts) > 13 else 'N/A'}")
        elif section == 'Trades-Forex':
            print("\n   Sample records:")
            for line_num, line in records[:5]:
                parts = line.split(',')
                if len(parts) >= 8:
                    print(f"   Line {line_num}:")
                    print(f"      Asset Category: {parts[2] if len(parts) > 2 else 'N/A'}")
                    print(f"      Currency: {parts[3] if len(parts) > 3 else 'N/A'}")
                    print(f"      Symbol: {parts[4] if len(parts) > 4 else 'N/A'}")
                    print(f"      Date: {parts[5] if len(parts) > 5 else 'N/A'}")
                    print(f"      Quantity: {parts[6] if len(parts) > 6 else 'N/A'}")
                    print(f"      T. Price: {parts[7] if len(parts) > 7 else 'N/A'}")
                    print(f"      Proceeds: {parts[8] if len(parts) > 8 else 'N/A'}")
                    print(f"      Comm/Fee: {parts[9] if len(parts) > 9 else 'N/A'}")
    
    # Check for specific problematic records
    print("\n\n🔍 Checking for problematic classifications:")
    print("-" * 70)
    
    # Check dividend accrual records
    dividend_accrual_count = 0
    for i, line in enumerate(lines, 1):
        if line.startswith('Change in Dividend Accruals,Data,Stocks'):
            dividend_accrual_count += 1
            parts = line.split(',')
            if len(parts) >= 13:
                symbol = parts[4] if len(parts) > 4 else ''
                date = parts[5] if len(parts) > 5 else ''
                net_amount = parts[12] if len(parts) > 12 else ''
                code = parts[13].strip() if len(parts) > 13 else ''
                print(f"\n   Dividend Accrual Record #{dividend_accrual_count}:")
                print(f"      Line: {i}")
                print(f"      Symbol: {symbol}")
                print(f"      Date: {date}")
                print(f"      Net Amount: {net_amount}")
                print(f"      Code: {code}")
                print(f"      Expected classification: dividend_accrual")
                print(f"      Expected storage_type: other_positive/other_negative")
    
    # Check forex records
    forex_count = 0
    for i, line in enumerate(lines, 1):
        if line.startswith('Trades,Data,Order,Forex'):
            forex_count += 1
            parts = line.split(',')
            if len(parts) >= 10:
                currency = parts[3] if len(parts) > 3 else ''
                symbol = parts[4] if len(parts) > 4 else ''
                date = parts[5] if len(parts) > 5 else ''
                quantity = parts[6] if len(parts) > 6 else ''
                trade_price = parts[7] if len(parts) > 7 else ''
                proceeds = parts[8] if len(parts) > 8 else ''
                comm_fee = parts[9] if len(parts) > 9 else ''
                if forex_count <= 3:  # Show first 3
                    print(f"\n   Forex Record #{forex_count}:")
                    print(f"      Line: {i}")
                    print(f"      Currency: {currency}")
                    print(f"      Symbol: {symbol}")
                    print(f"      Date: {date}")
                    print(f"      Quantity: {quantity}")
                    print(f"      T. Price: {trade_price}")
                    print(f"      Proceeds: {proceeds}")
                    print(f"      Comm/Fee: {comm_fee}")
                    print(f"      Expected classification: forex_conversion")
                    print(f"      Expected storage_type: currency_exchange_from/currency_exchange_to")
    
    print(f"\n\n📊 Summary:")
    print("-" * 70)
    print(f"   Total Dividend Accrual records: {dividend_accrual_count}")
    print(f"   Total Forex records: {forex_count}")
    print(f"\n   ⚠️  Key Points:")
    print(f"   1. 'Change in Dividend Accruals' section → should be classified as 'dividend_accrual'")
    print(f"   2. 'Trades,Data,Order,Forex' rows → should be classified as 'forex_conversion'")
    print(f"   3. These should NEVER be confused with each other!")

if __name__ == "__main__":
    file_path = "_Tmp/activity - 2024.csv"
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    
    try:
        analyze_ibkr_file(file_path)
        print("\n🎉 Analysis completed successfully!")
    except Exception as e:
        print(f"\n❌ Script failed: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

