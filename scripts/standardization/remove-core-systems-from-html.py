#!/usr/bin/env python3
"""
הסרת טעינות ידניות של core-systems.js מכל קבצי HTML
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'

def remove_core_systems_from_html():
    """הסרת core-systems.js מכל קבצי HTML"""
    
    html_files = list(TRADING_UI.glob('*.html'))
    html_files = [f for f in html_files if not any(x in str(f) for x in ['test', 'archive', 'backup', 'smart'])]
    
    updated_files = []
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            # הסרת core-systems.js
            # דפוס: <script src="scripts/modules/core-systems.js?v=..."></script>
            pattern = r'<script\s+src=["\']scripts/modules/core-systems\.js[^"\']*["\'][^>]*>.*?</script>'
            content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)
            
            # הסרת גם שורות פשוטות יותר
            pattern2 = r'<script\s+src=["\']scripts/modules/core-systems\.js[^"\']*["\'][^>]*>\s*</script>'
            content = re.sub(pattern2, '', content, flags=re.IGNORECASE)
            
            # הסרת גם ללא תג סגירה
            pattern3 = r'<script\s+src=["\']scripts/modules/core-systems\.js[^"\']*["\'][^>]*>'
            content = re.sub(pattern3, '', content, flags=re.IGNORECASE)
            
            if content != original_content:
                with open(html_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                updated_files.append(html_file.name)
                print(f"✅ עודכן: {html_file.name}")
        
        except Exception as e:
            print(f"❌ שגיאה ב-{html_file.name}: {e}")
    
    print(f"\n✅ סה\"כ עודכנו {len(updated_files)} קבצים")
    return updated_files

if __name__ == '__main__':
    remove_core_systems_from_html()

