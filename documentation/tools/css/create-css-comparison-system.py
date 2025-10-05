#!/usr/bin/env python3
"""
יצירת מערכת השוואה חזותית לעיצוב CSS
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

def create_backup_system():
    """יצירת מערכת גיבוי מלאה"""
    print("🔄 יוצר מערכת גיבוי מלאה...")
    
    # יצירת timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path(f"/workspace/css-comparison-backup-{timestamp}")
    backup_dir.mkdir(exist_ok=True)
    
    # גיבוי קבצי CSS ישנים
    old_styles_backup = backup_dir / "old-styles"
    old_styles_backup.mkdir(exist_ok=True)
    shutil.copytree("/workspace/trading-ui/styles", old_styles_backup / "styles")
    
    # גיבוי קבצי CSS חדשים
    new_styles_backup = backup_dir / "new-styles"
    new_styles_backup.mkdir(exist_ok=True)
    shutil.copytree("/workspace/trading-ui/styles-new", new_styles_backup / "styles-new")
    
    # גיבוי קבצי HTML (עם הקישורים החדשים)
    html_backup = backup_dir / "html-files"
    html_backup.mkdir(exist_ok=True)
    
    trading_ui = Path("/workspace/trading-ui")
    for html_file in trading_ui.glob("*.html"):
        if not html_file.name.startswith('test-'):
            shutil.copy2(html_file, html_backup / html_file.name)
    
    print(f"✅ גיבוי נוצר ב: {backup_dir}")
    return backup_dir

def create_comparison_toggle_system():
    """יצירת מערכת מעבר בין CSS ישן לחדש"""
    print("🔄 יוצר מערכת מעבר בין CSS...")
    
    # סקריפט Python למעבר בין המערכות
    toggle_script = """#!/usr/bin/env python3
'''
סקריפט מעבר בין CSS ישן לחדש
'''

import os
import re
from pathlib import Path
import sys

def switch_to_old_css():
    '''מעבר למערכת CSS ישנה'''
    print("🔄 עובר למערכת CSS ישנה...")
    
    trading_ui = Path("/workspace/trading-ui")
    html_files = [f for f in trading_ui.glob("*.html") if not f.name.startswith('test-')]
    
    old_css_links = '''    <!-- ===== CSS Architecture - OLD SYSTEM ===== -->
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Apple Theme -->
    <link rel="stylesheet" href="styles/apple-theme.css">
    
    <!-- Bootstrap Framework -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Main Styles -->
    <link rel="stylesheet" href="styles/styles.css">
    <link rel="stylesheet" href="styles/header-system.css">
    <link rel="stylesheet" href="styles/typography.css">
    <link rel="stylesheet" href="styles/table.css">
    <link rel="stylesheet" href="styles/notification-system.css">'''
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # החלפת הקישורים החדשים בישנים
        pattern = r'(<!-- ===== CSS Architecture[^<]*?)(<link rel="stylesheet" href="styles-new/main\.css">)'
        
        if 'styles-new/main.css' in content:
            # החלפה לקישורים ישנים
            content = re.sub(
                r'<!-- ===== CSS Architecture - ITCSS Based =====.*?<link rel="stylesheet" href="styles-new/main\.css">',
                old_css_links,
                content,
                flags=re.DOTALL
            )
            
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ {html_file.name} עודכן למערכת ישנה")
    
    print("🎉 מעבר למערכת ישנה הושלם!")

def switch_to_new_css():
    '''מעבר למערכת CSS חדשה'''
    print("🔄 עובר למערכת CSS חדשה...")
    
    trading_ui = Path("/workspace/trading-ui")
    html_files = [f for f in trading_ui.glob("*.html") if not f.name.startswith('test-')]
    
    new_css_links = '''    <!-- ===== CSS Architecture - ITCSS Based ===== -->
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Bootstrap Framework -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- TikTrack CSS - New ITCSS Architecture -->
    <link rel="stylesheet" href="styles-new/main.css">'''
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'styles-new/main.css' not in content:
            # החלפה לקישורים חדשים
            content = re.sub(
                r'<!-- ===== CSS Architecture[^<]*?(?:<link[^>]*href="styles/[^"]*\.css"[^>]*>\s*)*',
                new_css_links,
                content,
                flags=re.DOTALL
            )
            
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ {html_file.name} עודכן למערכת חדשה")
    
    print("🎉 מעבר למערכת חדשה הושלם!")

def main():
    if len(sys.argv) < 2:
        print("שימוש: python3 css-toggle.py [old|new]")
        print("  old  - מעבר למערכת CSS ישנה")
        print("  new  - מעבר למערכת CSS חדשה") 
        return
    
    mode = sys.argv[1].lower()
    
    if mode == 'old':
        switch_to_old_css()
    elif mode == 'new':
        switch_to_new_css()
    else:
        print("❌ מצב לא חוקי. השתמש ב: old או new")

if __name__ == "__main__":
    main()
"""
    
    with open("/workspace/css-toggle.py", 'w', encoding='utf-8') as f:
        f.write(toggle_script)
    
    print("✅ נוצר סקריפט css-toggle.py")

def main():
    """הרצת כל הפונקציות"""
    print("🎯 יוצר מערכת השוואה חזותית")
    print("=" * 50)
    
    backup_dir = create_backup_system()
    create_comparison_toggle_system()
    
    print(f"\n📁 גיבוי נוצר ב: {backup_dir}")
    print("\n🔄 סקריפט מעבר נוצר: css-toggle.py")
    print("\n📋 שימוש:")
    print("  python3 css-toggle.py old   # מעבר למערכת ישנה")  
    print("  python3 css-toggle.py new   # מעבר למערכת חדשה")
    print("\n🎉 מערכת השוואה מוכנה!")

if __name__ == "__main__":
    main()