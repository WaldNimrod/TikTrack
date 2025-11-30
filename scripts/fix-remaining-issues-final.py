#!/usr/bin/env python3
"""
תיקון בעיות שנותרו - קונסולה נקייה 100%
Fix Remaining Issues - 100% Clean Console
"""

import re
from pathlib import Path

def fix_quill_console_calls(content):
    """תיקון console calls ב-Quill.js onload/onerror"""
    # החלפת console.log ו-console.error ב-onload/onerror
    pattern = r'onload="console\.log\([^)]+\);'
    replacement = r'onload="window.Logger?.debug?.(window.Logger?.debug?.bind(window.Logger)?);'
    
    # תיקון על-ידי הסרת console calls מ-onload/onerror
    content = re.sub(
        r'onload="console\.log\([^)]+\);\s*',
        'onload="window.Logger?.debug?.("✅ Quill.js loaded from CDN"); ',
        content
    )
    
    content = re.sub(
        r'onerror="console\.error\([^)]+\);',
        'onerror="window.Logger?.error?.("❌ Failed to load Quill.js from CDN");',
        content
    )
    
    return content

def add_bootstrap_css(content):
    """הוספת Bootstrap CSS לפני master.css"""
    # בדיקה אם Bootstrap כבר קיים
    if 'bootstrap.min.css' in content or 'bootstrap.css' in content:
        return content, False
    
    # חיפוש master.css
    master_match = re.search(r'<link[^>]*master\.css[^>]*>', content)
    if not master_match:
        return content, False
    
    master_pos = master_match.start()
    
    # הוספת Bootstrap לפני master.css
    bootstrap_tag = '''    <!-- Bootstrap CSS - Must load first -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css?v=0da3519a_20251102_104906" rel="stylesheet">
    
'''
    
    # הוספה
    content = content[:master_pos] + bootstrap_tag + content[master_pos:]
    
    return content, True

def fix_page(page_path):
    """תיקון עמוד אחד"""
    path = Path(page_path)
    if not path.exists():
        print(f"❌ קובץ לא נמצא: {page_path}")
        return False
    
    content = path.read_text(encoding='utf-8')
    original_content = content
    
    # תיקון console calls ב-Quill
    content = fix_quill_console_calls(content)
    
    # הוספת Bootstrap CSS אם חסר
    content, added_bootstrap = add_bootstrap_css(content)
    
    if content != original_content:
        path.write_text(content, encoding='utf-8')
        changes = []
        if added_bootstrap:
            changes.append("Bootstrap CSS")
        if 'window.Logger?.debug' in content and 'console.log' not in content[max(0, content.find('Quill')-50):content.find('Quill')+200]:
            changes.append("Console calls")
        print(f"✅ תוקן: {page_path} ({', '.join(changes)})")
        return True
    
    return False

def main():
    print("🔧 תיקון בעיות שנותרו - קונסולה נקייה 100%\n")
    
    pages = [
        "trading-ui/notes.html",
        "trading-ui/trading_accounts.html",
    ]
    
    fixed = 0
    for page in pages:
        if fix_page(page):
            fixed += 1
    
    print(f"\n✅ הושלם: {fixed}/{len(pages)} עמודים תוקנו")

if __name__ == "__main__":
    main()

