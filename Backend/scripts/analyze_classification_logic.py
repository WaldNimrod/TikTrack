#!/usr/bin/env python3
"""
Analyze Classification Logic for Cash Flows
===========================================

This script analyzes the classification logic to understand:
1. How records are classified as dividend_accrual vs forex_conversion
2. The conditions and logic flow for classification
"""

import os
import sys

# Add Backend to path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def analyze_classification_logic():
    """
    Analyze the classification logic by examining the code.
    """
    print("🔍 TikTrack - Cash Flow Classification Logic Analysis")
    print("=" * 70)
    
    print("\n📋 Classification Flow:")
    print("-" * 70)
    print("""
1. IBKR Connector Parsing:
   └─> _parse_trades_section() - Parses 'Trades' section
       └─> Identifies Forex rows: Asset Category == 'Forex' AND DataDiscriminator == 'Order'
           └─> Stores in _pending_forex_rows
       └─> Other rows continue to normal processing
   
   └─> _parse_cashflow_sections() - Parses cashflow sections
       └─> Matches section name to CASHFLOW_SECTION_NAMES:
           - 'Change in Dividend Accruals' → section_key = 'dividend_accrual'
           - 'Dividends' → section_key = 'dividend'
           - 'Interest' → section_key = 'interest'
           - etc.
       └─> _build_cashflow_record() creates record with:
           - section: section_name (e.g., 'Change in Dividend Accruals')
           - cashflow_type: from _resolve_cashflow_type()
   
   └─> _build_forex_cashflows() - Processes _pending_forex_rows
       └─> Creates TWO records (from/to) with:
           - cashflow_type: 'forex_conversion'
           - section: 'Trades'
           - currency: from currency pair (base/quote)
   
2. _resolve_cashflow_type() Logic:
   └─> Gets section_key from CASHFLOW_SECTION_NAMES
   └─> Returns:
       - If section_key == 'dividend_accrual' → returns 'dividend_accrual'
       - If section_key == 'dividend' → returns 'dividend'
       - If section_key == 'cash_report' → analyzes Activity Code/Description
       - Otherwise → returns section_key or 'cash_adjustment'
   
3. Normalization:
   └─> normalize_record() - Normalizes IBKR record
       └─> Preserves cashflow_type from connector
   
4. Storage Type Resolution (_resolve_cashflow_storage_type):
   └─> Gets raw_type = record.get('cashflow_type')
   └─> Maps to storage_type:
       - 'forex_conversion' → 'currency_exchange_from' or 'currency_exchange_to'
       - 'dividend_accrual' → 'other_positive' or 'other_negative'
       - 'dividend' → 'dividend'
       - etc.
   
5. Pairing (for forex_conversion):
   └─> _build_preview_payload() pairs records with:
       - storage_type == 'currency_exchange_from' or 'currency_exchange_to'
       - Matching date, currencies, exchange_rate
       └─> Assigns shared external_id: 'exchange_<uuid>'
""")
    
    print("\n⚠️  Potential Issues:")
    print("-" * 70)
    print("""
1. Dividend Accrual Records:
   - Section: 'Change in Dividend Accruals' → section_key = 'dividend_accrual'
   - _resolve_cashflow_type() should return 'dividend_accrual'
   - _resolve_cashflow_storage_type() should map to 'other_positive'/'other_negative'
   - Should NOT be classified as 'forex_conversion'
   
   ⚠️  If dividend_accrual records are being classified as forex_conversion:
      - Check if they're being processed by _build_forex_cashflows()
      - Check if section name is being misidentified
      - Check if cashflow_type is being overwritten
   
2. Negative Fee Amounts:
   - During import, commission from IBKR might be negative
   - Code normalizes to 0.0 and logs warning
   - Warning appears in server logs, not in UI notifications
   
   ⚠️  To see warnings:
      - Check Backend/logs/ directory
      - Look for "⚠️ [IMPORT] Negative fee amount detected"
""")
    
    print("\n🔍 Key Code Locations:")
    print("-" * 70)
    print("""
1. IBKR Connector:
   - _parse_trades_section(): Lines ~300-311
     * Identifies Forex rows: Asset Category == 'Forex' AND DataDiscriminator == 'Order'
   
   - _parse_cashflow_sections(): Lines ~313-350
     * Parses sections like 'Change in Dividend Accruals'
     * Calls _build_cashflow_record() for each row
   
   - _build_cashflow_record(): Lines ~738-797
     * Creates record with section and cashflow_type
     * Calls _resolve_cashflow_type()
   
   - _resolve_cashflow_type(): Lines ~995-1036
     * Maps section_key to cashflow_type
     * For 'dividend_accrual' section → returns 'dividend_accrual'
   
   - _build_forex_cashflows(): Lines ~1127-1233
     * Processes Forex rows from _pending_forex_rows
     * Creates records with cashflow_type = 'forex_conversion'
   
2. Import Orchestrator:
   - _resolve_cashflow_storage_type(): Lines ~1181-1249
     * Maps cashflow_type to storage_type
     * 'forex_conversion' → 'currency_exchange_from'/'currency_exchange_to'
     * 'dividend_accrual' → 'other_positive'/'other_negative'
   
   - _build_preview_payload(): Lines ~1304-1481
     * Pairs forex records by date, currencies, exchange_rate
     * Assigns shared external_id
""")
    
    print("\n✅ Expected Behavior:")
    print("-" * 70)
    print("""
1. Dividend Accrual Records:
   - Section: 'Change in Dividend Accruals'
   - cashflow_type: 'dividend_accrual'
   - storage_type: 'other_positive' or 'other_negative'
   - external_id: Should contain 'dividend_accrual'
   - Should NOT be paired as forex exchange
   
2. Forex Conversion Records:
   - Section: 'Trades' (with Asset Category = 'Forex')
   - cashflow_type: 'forex_conversion'
   - storage_type: 'currency_exchange_from' or 'currency_exchange_to'
   - external_id: 'exchange_<uuid>' (shared between from/to)
   - Should be paired by date, currencies, exchange_rate
""")
    
    print("\n💡 Recommendations:")
    print("-" * 70)
    print("""
1. To debug classification issues:
   - Check the raw section name in the IBKR file
   - Verify _resolve_cashflow_type() returns correct type
   - Verify _resolve_cashflow_storage_type() maps correctly
   - Check if records are being processed by wrong function
   
2. To see negative fee warnings:
   - Check server logs: Backend/logs/
   - Look for import session logs
   - Search for "Negative fee amount detected"
   
3. To verify pairing:
   - Check if dividend_accrual records have 'exchange_' in external_id
   - Check if forex records have correct pairing
   - Verify currencies match between from/to records
""")

if __name__ == "__main__":
    try:
        analyze_classification_logic()
        print("\n🎉 Analysis completed successfully!")
    except Exception as e:
        print(f"\n❌ Script failed: {e}", file=sys.stderr)
        sys.exit(1)

