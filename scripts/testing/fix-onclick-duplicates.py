#!/usr/bin/env python3
"""
סקריפט תיקון - הסרת onclick כאשר יש data-onclick
Remove onclick attributes when data-onclick exists
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
PAGES_ROOT = PROJECT_ROOT / "trading-ui"

PAGES = [
    "index.html",
    "trades.html",
    "trade_plans.html",
    "alerts.html",
    "tickers.html",
    "trading_accounts.html",
    "executions.html",
    "cash_flows.html",
    "notes.html",
    "research.html",
    "preferences.html",
    "db_display.html",
    "db_extradata.html",
    "constraints.html",
    "background_tasks.html",
    "server_monitor.html",
    "system_management.html",
    "cache-test.html",
    "notifications_center.html",
    "css_management.html",
    "dynamic_colors_display.html",
    "designs.html",
    "tradingview_test_page.html",
    "external_data_dashboard.html",
    "chart_management.html",
    "mockups/daily-snapshots/portfolio_state_page.html",
    "mockups/daily-snapshots/trade_history_page.html",
    "mockups/daily-snapshots/price_history_page.html",
    "mockups/daily-snapshots/comparative_analysis_page.html",
    "mockups/daily-snapshots/trading_journal_page.html",
    "mockups/daily-snapshots/strategy_analysis_page.html",
    "mockups/daily-snapshots/economic_calendar_page.html",
    "mockups/daily-snapshots/history_widget.html",
    "mockups/daily-snapshots/emotional_tracking_widget.html",
    "mockups/daily-snapshots/date_comparison_modal.html",
    "mockups/daily-snapshots/tradingview_test_page.html",
]


def remove_onclick_when_data_onclick_exists(content):
    """Remove onclick attribute when data-onclick exists in the same tag"""
    fixes_count = 0
    
    def process_tag(match):
        tag_content = match.group(0)
        has_data_onclick = 'data-onclick' in tag_content.lower()
        onclick_pattern = r'(?<!data-)onclick\s*=\s*["\'][^"\']*["\']'
        onclick_match = re.search(onclick_pattern, tag_content, re.IGNORECASE)
        
        if has_data_onclick and onclick_match:
            # Remove onclick attribute (including surrounding whitespace)
            start = onclick_match.start()
            end = onclick_match.end()
            
            # Try to remove surrounding whitespace
            if start > 0 and tag_content[start-1] == ' ':
                start -= 1
            
            new_tag = tag_content[:start] + tag_content[end:]
            nonlocal fixes_count
            fixes_count += 1
            return new_tag
        
        return tag_content
    
    # Find all tags with onclick or data-onclick
    tag_pattern = r'<(?:button|a|div|span|input)[^>]*(?:onclick|data-onclick)[^>]*>'
    new_content = re.sub(tag_pattern, process_tag, content, flags=re.IGNORECASE | re.DOTALL)
    
    return new_content, fixes_count


def main():
    total_fixes = 0
    files_modified = 0
    
    print("=" * 80)
    print("🔧 Removing onclick when data-onclick exists")
    print("=" * 80)
    print()
    
    for page in PAGES:
        file_path = PAGES_ROOT / page
        if not file_path.exists():
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content, fixes = remove_onclick_when_data_onclick_exists(content)
            
            if fixes > 0:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"✅ {page}: Removed {fixes} onclick attributes")
                total_fixes += fixes
                files_modified += 1
        except Exception as e:
            print(f"❌ Error processing {page}: {e}")
    
    print()
    print("=" * 80)
    print(f"📊 Summary: {total_fixes} fixes in {files_modified} files")
    print("=" * 80)


if __name__ == "__main__":
    main()



