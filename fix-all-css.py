#!/usr/bin/env python3
'''
סקריפט לתיקון כל הקבצים
'''

import os
import re
from pathlib import Path

def fix_all_css():
    '''תיקון כל הקבצים'''
    print("🔧 מתקן את כל הקבצים...")
    
    trading_ui = Path("trading-ui")
    html_files = [f for f in trading_ui.glob("*.html") if not f.name.startswith('test-')]
    
    clean_css = '''    <!-- ===== CSS Architecture - ITCSS Based ===== -->
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Bootstrap Framework -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- TikTrack CSS - New ITCSS Architecture -->
    <link rel="stylesheet" href="styles-new/main.css">
    
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Error Handlers -->
    <script src="scripts/error-handlers.js"></script>'''
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # מוצא את התחלה של ה-head
        head_start = content.find('<head>')
        head_end = content.find('</head>')
        
        if head_start != -1 and head_end != -1:
            # מחליף את כל החלק הזה ב-CSS נקי
            new_content = content[:head_start] + clean_css + content[head_end:]
            
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ {html_file.name} תוקן")
    
    print("🎉 תיקון כל הקבצים הושלם!")

if __name__ == "__main__":
    fix_all_css()
