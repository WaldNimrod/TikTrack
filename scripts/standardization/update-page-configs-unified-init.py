#!/usr/bin/env python3
"""
עדכון page-initialization-configs.js - הוספת UnifiedAppInitializer ל-requiredGlobals
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent.parent
CONFIG_FILE = PROJECT_ROOT / 'trading-ui' / 'scripts' / 'page-initialization-configs.js'

def update_page_configs():
    """עדכון כל העמודים שצריכים init-system"""
    
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # מציאת כל העמודים עם 'init-system' ב-packages
    # דפוס: packages: [..., 'init-system', ...]
    pattern = r"packages:\s*\[(.*?)\],\s*requiredGlobals:\s*\[(.*?)\]"
    
    def replace_required_globals(match):
        packages = match.group(1)
        required_globals = match.group(2)
        
        # בדיקה אם init-system ב-packages
        if "'init-system'" in packages or '"init-system"' in packages:
            # בדיקה אם UnifiedAppInitializer כבר קיים
            if 'UnifiedAppInitializer' not in required_globals and 'unifiedAppInitializer' not in required_globals:
                # הוספה בתחילת requiredGlobals
                if required_globals.strip():
                    new_globals = "        'window.UnifiedAppInitializer', // Unified Init System\n        'window.PAGE_CONFIGS', // Unified Init System\n        'window.PACKAGE_MANIFEST', // Unified Init System\n" + required_globals
                else:
                    new_globals = "        'window.UnifiedAppInitializer', // Unified Init System\n        'window.PAGE_CONFIGS', // Unified Init System\n        'window.PACKAGE_MANIFEST', // Unified Init System"
                return f"packages: [{packages}],\n      requiredGlobals: [\n{new_globals}"
            # אם יש unifiedAppInitializer (lowercase), להמיר ל-UnifiedAppInitializer
            elif 'unifiedAppInitializer' in required_globals and 'UnifiedAppInitializer' not in required_globals:
                new_globals = required_globals.replace('unifiedAppInitializer', 'UnifiedAppInitializer')
                # הוספת PAGE_CONFIGS ו-PACKAGE_MANIFEST אם חסרים
                if 'PAGE_CONFIGS' not in new_globals:
                    new_globals = "        'window.PAGE_CONFIGS', // Unified Init System\n" + new_globals
                if 'PACKAGE_MANIFEST' not in new_globals:
                    new_globals = "        'window.PACKAGE_MANIFEST', // Unified Init System\n" + new_globals
                return f"packages: [{packages}],\n      requiredGlobals: [\n{new_globals}"
        
        return match.group(0)
    
    # עדכון עם regex multiline
    updated_content = re.sub(
        pattern,
        replace_required_globals,
        content,
        flags=re.DOTALL
    )
    
    # שמירה
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print(f"✅ עדכון page-initialization-configs.js הושלם")

if __name__ == '__main__':
    update_page_configs()

