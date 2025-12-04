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
    'user-profile.html',
    'db_display.html',
    'db_extradata.html',
    'constraints.html',
    'background-tasks.html',
    'server-monitor.html',
    'system-management.html',
    'cache-test.html',
    'notifications-center.html',
    'css-management.html',
    'dynamic-colors-display.html',
    'designs.html',
    'tradingview-test-page.html',
    'external-data-dashboard.html',
    'chart-management.html',
    'portfolio-state-page.html',
    'trade-history-page.html',
    'comparative-analysis-page.html',
    'trading-journal-page.html',
    'strategy-analysis-page.html',
    'economic-calendar-page.html',
    'history-widget.html',
    'emotional-tracking-widget.html',
    'date-comparison-modal.html',
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



