#!/usr/bin/env python3
"""
Script to audit all incomplete pages
Runs deep-audit-page.py on all incomplete pages
"""

import subprocess
import sys
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent.parent
SCRIPTS_DIR = BASE_DIR / 'scripts' / 'standardization'

# List of incomplete pages
INCOMPLETE_PAGES = [
    'index.html',
    'tickers.html',
    'trading_accounts.html',
    'cash_flows.html',
    'research.html',
    'preferences.html',
    'user_profile.html',
    'db_display.html',
    'db_extradata.html',
    'constraints.html',
    'background_tasks.html',
    'server_monitor.html',
    'system_management.html',
    'cache-test.html',
    'notifications_center.html',
    'css_management.html',
    'dynamic_colors_display.html',
    'designs.html',
    'tradingview_test_page.html',
    'external_data_dashboard.html',
    'chart_management.html',
    'portfolio_state_page.html',
    'trade_history_page.html',
    'comparative_analysis_page.html',
    'trading_journal_page.html',
    'strategy_analysis_page.html',
    'economic_calendar_page.html',
    'history_widget.html',
    'emotional_tracking_widget.html',
    'date_comparison_modal.html',
]

def main():
    """Main function"""
    print("🔍 Auditing all incomplete pages...")
    print(f"📁 Base directory: {BASE_DIR}")
    print(f"📁 Scripts directory: {SCRIPTS_DIR}")
    print()
    
    audited = 0
    failed = 0
    
    for page_name in INCOMPLETE_PAGES:
        print(f"📄 Auditing {page_name}...")
        
        try:
            result = subprocess.run(
                [sys.executable, str(SCRIPTS_DIR / 'deep-audit-page.py'), page_name],
                capture_output=True,
                text=True,
                cwd=BASE_DIR
            )
            
            if result.returncode == 0:
                print(f"  ✅ Success")
                audited += 1
            else:
                print(f"  ❌ Failed: {result.stderr[:200]}")
                failed += 1
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
            failed += 1
        
        print()
    
    print("=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print(f"✅ Audited successfully: {audited}/{len(INCOMPLETE_PAGES)}")
    print(f"❌ Failed: {failed}/{len(INCOMPLETE_PAGES)}")
    print("=" * 80)

if __name__ == '__main__':
    main()




