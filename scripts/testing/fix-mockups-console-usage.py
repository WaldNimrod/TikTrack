#!/usr/bin/env python3
"""
תיקון שימוש ב-console.* - החלפה ב-Logger Service
Fix Console Usage - Replace with Logger Service
"""

import os
import re
from pathlib import Path

MOCKUPS_DIR = Path("trading-ui/mockups/daily-snapshots")

MOCKUP_PAGES = [
    "portfolio-state-page.html",
    "trade-history-page.html",
    "price-history-page.html",
    "comparative-analysis-page.html",
    "trading-journal-page.html",
    "strategy-analysis-page.html",
    "economic-calendar-page.html",
    "history-widget.html",
    "emotional-tracking-widget.html",
    "date-comparison-modal.html",
    "tradingview-test-page.html"
]

def fix_console_usage(content):
    """החלפת console.error/console.warn/console.log ב-Logger Service"""
    changes_made = False
    
    # console.error - בדרך כלל בתוך try-catch או error handlers
    # נחליף ל: window.Logger?.error() או Logger.error() אם Logger זמין
    patterns = [
        # console.error('message', error)
        (r'console\.error\s*\(\s*([^,)]+)\s*,\s*([^)]+)\s*\)', 
         r'window.Logger?.error(\1, \2)'),
        # console.error('message')
        (r'console\.error\s*\(\s*([^)]+)\s*\)', 
         r'window.Logger?.error(\1)'),
        # console.warn('message')
        (r'console\.warn\s*\(\s*([^)]+)\s*\)', 
         r'window.Logger?.warn(\1)'),
        # console.log('message')
        (r'console\.log\s*\(\s*([^)]+)\s*\)', 
         r'window.Logger?.debug(\1)'),
        # console.info('message')
        (r'console\.info\s*\(\s*([^)]+)\s*\)', 
         r'window.Logger?.info(\1)'),
    ]
    
    for pattern, replacement in patterns:
        new_content = re.sub(pattern, replacement, content)
        if new_content != content:
            changes_made = True
            content = new_content
    
    return content, changes_made

def fix_page(page_name):
    """תיקון עמוד בודד"""
    page_path = MOCKUPS_DIR / page_name
    
    # בדוק גם בסקריפטים JavaScript של העמוד
    script_files = []
    
    # חפש קבצי JS קשורים
    page_base = page_name.replace('.html', '')
    scripts_dir = Path("trading-ui/scripts")
    
    # קבצי JS אפשריים
    possible_scripts = [
        f"{page_base}.js",
        f"mockups/{page_base}.js",
        f"mockups/daily-snapshots/{page_base}.js",
    ]
    
    for script_name in possible_scripts:
        script_path = scripts_dir / script_name
        if script_path.exists():
            script_files.append(script_path)
    
    # תיקון HTML file
    if page_path.exists():
        with open(page_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # בדוק אם יש inline scripts עם console
        inline_scripts = re.findall(r'<script[^>]*>.*?</script>', html_content, re.DOTALL)
        for inline_script in inline_scripts:
            fixed_script, changed = fix_console_usage(inline_script)
            if changed:
                html_content = html_content.replace(inline_script, fixed_script)
        
        # שמור רק אם יש שינויים
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
    
    # תיקון קבצי JS
    fixed_js_files = []
    for script_path in script_files:
        with open(script_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
        
        fixed_content, changed = fix_console_usage(js_content)
        if changed:
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            fixed_js_files.append(script_path.name)
    
    return fixed_js_files

def main():
    print("🔧 תיקון שימוש ב-console.* - החלפה ב-Logger Service...\n")
    
    total_fixed = 0
    for page_name in MOCKUP_PAGES:
        fixed_files = fix_page(page_name)
        if fixed_files:
            print(f"✅ {page_name} - תוקן בקובץ/ים: {', '.join(fixed_files)}")
            total_fixed += len(fixed_files)
        else:
            print(f"⏭️  {page_name} - אין שינויים")
    
    print(f"\n✅ סה\"כ תוקן: {total_fixed} קבצי JS")

if __name__ == "__main__":
    main()

