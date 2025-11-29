#!/usr/bin/env python3
"""
הסרת כל console.* calls שנותרו - כולל fallback
Remove all remaining console.* calls - including fallback
"""

import re
from pathlib import Path

PAGES = [
    "trading-ui/cash_flows.html",
    "trading-ui/trades.html",
    "trading-ui/tickers.html",
    "trading-ui/trade_plans.html",
    "trading-ui/alerts.html",
    "trading-ui/notes.html",
    "trading-ui/trading_accounts.html",
    "trading-ui/executions.html",
]

def fix_console_calls(content):
    """תיקון כל console.* calls ב-showModalSafe"""
    
    # החלפת fallback console calls ב-Logger בלבד (ללא fallback)
    replacements = [
        # Fallback console.log
        (
            r'const log = \(window\.Logger && window\.Logger\.debug\) \? window\.Logger\.debug\.bind\(window\.Logger\) : console\.log;',
            'const log = window.Logger?.debug?.bind(window.Logger) || (() => {});'
        ),
        (
            r'const warn = \(window\.Logger && window\.Logger\.warn\) \? window\.Logger\.warn\.bind\(window\.Logger\) : console\.warn;',
            'const warn = window.Logger?.warn?.bind(window.Logger) || (() => {});'
        ),
        (
            r'const error = \(window\.Logger && window\.Logger\.error\) \? window\.Logger\.error\.bind\(window\.Logger\) : console\.error;',
            'const error = window.Logger?.error?.bind(window.Logger) || (() => {});'
        ),
        # Error stack fallback
        (
            r'if \(window\.Logger && window\.Logger\.error\) \{\s*window\.Logger\.error\(\'   Error stack:\', err\.stack\);\s*\} else \{\s*console\.error\(\'   Error stack:\', err\.stack\);\s*\}',
            'window.Logger?.error?.("   Error stack:", err.stack);'
        ),
        # Initialization log fallback
        (
            r'if \(window\.Logger && window\.Logger\.debug\) \{\s*window\.Logger\.debug\(\'✅ \[showModalSafe\] Helper function created in <head> - available immediately\'\);\s*\} else \{\s*console\.log\(\'✅ \[showModalSafe\] Helper function created in <head> - available immediately\'\);\s*\}',
            'window.Logger?.debug?.("✅ [showModalSafe] Helper function created in <head> - available immediately");'
        ),
    ]
    
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)
    
    return content

def fix_page(page_path):
    """תיקון עמוד אחד"""
    path = Path(page_path)
    if not path.exists():
        print(f"❌ קובץ לא נמצא: {page_path}")
        return False
    
    content = path.read_text(encoding='utf-8')
    original_content = content
    
    # תיקון console calls
    content = fix_console_calls(content)
    
    if content != original_content:
        path.write_text(content, encoding='utf-8')
        print(f"✅ תוקן: {page_path}")
        return True
    else:
        print(f"ℹ️  לא נמצאו console calls ב-{page_path}")
        return False

def main():
    print("🧹 הסרת כל console.* calls - כולל fallback\n")
    
    fixed = 0
    for page in PAGES:
        if fix_page(page):
            fixed += 1
    
    print(f"\n✅ הושלם: {fixed}/{len(PAGES)} עמודים תוקנו")

if __name__ == "__main__":
    main()

