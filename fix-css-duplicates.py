#!/usr/bin/env python3
'''
סקריפט לתיקון כפילות CSS
'''

import os
import re
from pathlib import Path

def fix_css_duplicates():
    '''תיקון כפילות CSS בכל הקבצים'''
    print("🔧 מתקן כפילות CSS...")
    
    trading_ui = Path("trading-ui")
    html_files = [f for f in trading_ui.glob("*.html") if not f.name.startswith('test-')]
    
    for html_file in html_files:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # בדיקה אם יש כפילות
        if content.count('<!-- ===== CSS Architecture') > 1:
            print(f"🔧 מתקן כפילות ב-{html_file.name}")
            
            # מוצא את התחלה של ה-CSS
            start_pattern = r'<!-- ===== CSS Architecture'
            start_match = re.search(start_pattern, content)
            
            if start_match:
                start_pos = start_match.start()
                
                # מוצא את סוף ה-CSS (לפני </head>)
                head_end = content.find('</head>')
                if head_end > start_pos:
                    # מחליף את כל החלק הזה ב-CSS נקי
                    new_css = '''    <!-- ===== CSS Architecture - ITCSS Based ===== -->
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
    <script src="scripts/error-handlers.js"></script>
</head>'''
                    
                    # מחליף את כל החלק
                    new_content = content[:start_pos] + new_css + content[head_end:]
                    
                    with open(html_file, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    print(f"✅ {html_file.name} תוקן")
    
    print("🎉 תיקון כפילות הושלם!")

if __name__ == "__main__":
    fix_css_duplicates()
