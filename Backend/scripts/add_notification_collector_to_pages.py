#!/usr/bin/env python3
"""
Add Global Notification Collector to all main pages
הוספת אוסף התראות גלובלי לכל העמודים העיקריים
"""

import os
import re
import sys

def add_notification_collector_to_page(file_path):
    """Add notification collector script to a page"""
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if already added
        if 'global-notification-collector.js' in content:
            print(f"⏭️  Already added to: {file_path}")
            return True
        
        # Look for notification-system.js
        notification_script_pattern = r'<script src="scripts/notification-system\.js"[^>]*></script>'
        match = re.search(notification_script_pattern, content)
        
        if match:
            # Add the collector script after notification-system.js
            insertion_point = match.end()
            new_script = '\n  <script src="scripts/global-notification-collector.js"></script>'
            
            # Insert the script
            new_content = content[:insertion_point] + new_script + content[insertion_point:]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ Added to: {file_path}")
            return True
        else:
            print(f"⚠️  No notification-system.js found in: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Main function"""
    
    # Main pages from the menu
    main_pages = [
        'trading-ui/index.html',
        'trading-ui/trade_plans.html',
        'trading-ui/trades.html',
        'trading-ui/research.html',
        'trading-ui/alerts.html',
        'trading-ui/notes.html',
        'trading-ui/accounts.html',
        'trading-ui/tickers.html',
        'trading-ui/executions.html',
        'trading-ui/cash_flows.html',
        'trading-ui/preferences.html',
        'trading-ui/db_display.html',
        'trading-ui/db_extradata.html',
        'trading-ui/system-management.html',
        'trading-ui/external-data-dashboard.html',
        'trading-ui/notifications-center.html',
        'trading-ui/background-tasks.html',
        'trading-ui/server-monitor.html',
        'trading-ui/code-quality-dashboard.html',
        'trading-ui/css-management.html',
        'trading-ui/crud-testing-dashboard.html',
        'trading-ui/cache-management.html',
        'trading-ui/constraints.html',
        'trading-ui/style_demonstration.html',
        'trading-ui/dynamic-colors-display.html',
        'trading-ui/test-header-only.html',
        'trading-ui/designs.html'
    ]
    
    print("🚀 Adding Global Notification Collector to main pages...")
    
    success_count = 0
    total_count = 0
    
    for page in main_pages:
        if os.path.exists(page):
            total_count += 1
            if add_notification_collector_to_page(page):
                success_count += 1
        else:
            print(f"⚠️  Page not found: {page}")
    
    print(f"\n🎉 Completed! Added to {success_count}/{total_count} pages")
    
    if success_count == total_count:
        print("✅ All pages updated successfully!")
        return True
    else:
        print(f"⚠️  {total_count - success_count} pages were not updated")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
