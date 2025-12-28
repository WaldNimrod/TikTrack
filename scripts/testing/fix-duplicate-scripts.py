#!/usr/bin/env python3
"""
תיקון scripts כפולים בעמודי מוקאפ
Fix Duplicate Scripts in Mockup Pages
"""

import re
from pathlib import Path

MOCKUPS_DIR = Path("trading-ui/mockups/daily-snapshots")

PAGES_TO_FIX = [
    "strategy_analysis_page.html",
    "economic_calendar_page.html",
    "history_widget.html",
    "emotional_tracking_widget.html",
    "date_comparison_modal.html",
    "tradingview_test_page.html"
]

def fix_duplicates(page_path):
    """הסרת scripts כפולים - error-handlers, api-config, logger-service"""
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # מצא את כל המופעים
    scripts_to_check = [
        r'<script[^>]*error-handlers\.js[^>]*></script>',
        r'<script[^>]*api-config\.js[^>]*></script>',
        r'<script[^>]*logger-service\.js[^>]*></script>'
    ]
    
    for pattern in scripts_to_check:
        matches = list(re.finditer(pattern, content))
        if len(matches) > 1:
            # השאר רק את הראשון, הסר את השאר
            for match in matches[1:]:  # דלג על הראשון
                content = content[:match.start()] + content[match.end():]
                # עדכן את המיקומים
                offset = match.end() - match.start()
                # אין צורך לעדכן - הסרנו כבר
    
    return content != original_content, content

def main():
    print("🔧 תיקון scripts כפולים...\n")
    
    fixed_count = 0
    for page_name in PAGES_TO_FIX:
        page_path = MOCKUPS_DIR / page_name
        if not page_path.exists():
            print(f"⚠️ Page not found: {page_name}")
            continue
        
        changed, new_content = fix_duplicates(page_path)
        if changed:
            with open(page_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Fixed: {page_name}")
            fixed_count += 1
        else:
            print(f"⏭️  No changes: {page_name}")
    
    print(f"\n✅ סה\"כ תוקן: {fixed_count} עמודים")

if __name__ == "__main__":
    main()

