#!/usr/bin/env python3
"""
תיקון מבנה בסיסי של כל עמודי הבדיקה
Fix basic structure of all test pages

תיקונים:
- הוספת Bootstrap CSS אם חסר
- הוספת master.css אם חסר
- הוספת header-styles.css אם חסר
- הוספת error-handlers.js אם חסר (בתחילת הסקריפטים)
- תיקון סדר טעינת סקריפטים
- הסרת כפילויות בטעינת סקריפטים
- הוספת unified-header אם חסר
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent.parent
TRADING_UI_DIR = BASE_DIR / "trading-ui"
SCRIPTS_DIR = BASE_DIR / "trading-ui" / "scripts"
REPORTS_DIR = BASE_DIR / "documentation" / "03-DEVELOPMENT" / "TESTING"

# כל 17 עמודי הבדיקה
TEST_PAGES = [
    "test_header_only.html",
    "test_monitoring.html",
    "test_frontend_wrappers.html",
    "test_bootstrap_popover_comparison.html",
    "test_quill.html",
    "test_nested_modal_rich_text.html",
    "test_overlay_debug.html",
    "test_phase1_recovery.html",
    "test_phase3_1_comprehensive.html",
    "test_unified_widget.html",
    "test_unified_widget_comprehensive.html",
    "test_unified_widget_integration.html",
    "test_recent_items_widget.html",
    "test_ticker_widgets_performance.html",
    "test_user_ticker_integration.html",
    "conditions_test.html",
    # עמוד בתיקיית scripts (נתיב יחסי מ-trading-ui)
    ("test-user-ticker-frontend.html", SCRIPTS_DIR),
]

# קבצים נדרשים
REQUIRED_CSS = {
    "bootstrap": {
        "pattern": r'bootstrap.*\.css',
        "template": '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css?v=0da3519a_20251102_104906" rel="stylesheet">',
        "position": "first"  # לפני כל CSS אחר
    },
    "master": {
        "pattern": r'master\.css',
        "template": '<link rel="stylesheet" href="styles-new/master.css?v=0da3519a_20251102_104906">',
        "position": "after_bootstrap"  # אחרי Bootstrap
    },
    "header_styles": {
        "pattern": r'header-styles\.css',
        "template": '<link rel="stylesheet" href="styles-new/header-styles.css?v=0da3519a_20251102_104906">',
        "position": "after_master"  # אחרי master.css
    }
}

REQUIRED_JS = {
    "error_handlers": {
        "pattern": r'error-handlers\.js',
        "template": '<script src="scripts/error-handlers.js?v=1.0.0"></script>',
        "position": "first"  # לפני כל JS אחר
    }
}

# אלמנטים נדרשים
REQUIRED_ELEMENTS = {
    "unified_header": {
        "pattern": r'id=["\']unified-header["\']',
        "template": '<div id="unified-header"></div>',
        "position": "after_body"  # אחרי <body>
    }
}


def find_css_insertion_point(content: str) -> Tuple[int, str]:
    """מציאת נקודת הכנסה ל-CSS"""
    # מחפש את תגית </head> או את התגית הראשונה אחרי <head>
    head_match = re.search(r'<head[^>]*>', content, re.IGNORECASE)
    if not head_match:
        return -1, ""
    
    head_end = head_match.end()
    
    # מחפש את תגית </head>
    head_close_match = re.search(r'</head>', content, re.IGNORECASE)
    if not head_close_match:
        return head_end, "\n    "
    
    # מחזיר את המיקום לפני </head>
    return head_close_match.start(), "\n    "


def find_js_insertion_point(content: str, position: str = "first") -> Tuple[int, str]:
    """מציאת נקודת הכנסה ל-JavaScript"""
    if position == "first":
        # מחפש את התגית הראשונה של <script>
        first_script_match = re.search(r'<script[^>]*src', content, re.IGNORECASE)
        if first_script_match:
            return first_script_match.start(), "\n    "
        
        # אם אין script tags, מחפש את </body>
        body_close_match = re.search(r'</body>', content, re.IGNORECASE)
        if body_close_match:
            return body_close_match.start(), "\n    "
    
    # מחזיר את המיקום לפני </body>
    body_close_match = re.search(r'</body>', content, re.IGNORECASE)
    if body_close_match:
        return body_close_match.start(), "\n    "
    
    return -1, ""


def find_element_insertion_point(content: str, element: str) -> Tuple[int, str]:
    """מציאת נקודת הכנסה לאלמנט"""
    if element == "unified_header":
        # מחפש את <body> ומכניס אחריו
        body_match = re.search(r'<body[^>]*>', content, re.IGNORECASE)
        if body_match:
            return body_match.end(), "\n    "
    
    return -1, ""


def has_css_file(content: str, pattern: str) -> bool:
    """בדיקה אם קובץ CSS קיים"""
    css_pattern = rf'<link[^>]*href=["\'][^"\']*{pattern}[^"\']*["\']'
    return bool(re.search(css_pattern, content, re.IGNORECASE))


def has_js_file(content: str, pattern: str) -> bool:
    """בדיקה אם קובץ JavaScript קיים"""
    js_pattern = rf'<script[^>]*src=["\'][^"\']*{pattern}[^"\']*["\']'
    return bool(re.search(js_pattern, content, re.IGNORECASE))


def has_element(content: str, pattern: str) -> bool:
    """בדיקה אם אלמנט קיים"""
    return bool(re.search(pattern, content, re.IGNORECASE))


def remove_duplicate_scripts(content: str) -> Tuple[str, List[str]]:
    """הסרת כפילויות בטעינת סקריפטים"""
    removed = []
    
    # מוצא את כל תגיות ה-script
    script_pattern = r'<script[^>]*src=["\']([^"\']*\.js[^"\']*)["\'][^>]*>'
    scripts = re.findall(script_pattern, content, re.IGNORECASE)
    
    # מונה את כל הסקריפטים
    script_counts = defaultdict(list)
    for i, script_url in enumerate(scripts):
        script_name = os.path.basename(script_url.split('?')[0])  # Remove query params
        script_counts[script_name].append(i)
    
    # מוצא כפילויות
    duplicates = {name: indices for name, indices in script_counts.items() if len(indices) > 1}
    
    if not duplicates:
        return content, removed
    
    # מוצא את כל תגיות ה-script עם מיקומים
    script_matches = list(re.finditer(r'<script[^>]*src=["\'][^"\']*\.js[^"\']*["\'][^>]*>', content, re.IGNORECASE))
    
    # מסיר כפילויות (שומר רק את הראשון)
    indices_to_remove = []
    for script_name, indices in duplicates.items():
        # שומר את הראשון, מסיר את השאר
        for idx in indices[1:]:
            indices_to_remove.append(idx)
    
    # מסיר את הכפילויות (מסוף להתחלה כדי לא לשנות אינדקסים)
    for idx in sorted(indices_to_remove, reverse=True):
        if idx < len(script_matches):
            match = script_matches[idx]
            removed.append(script_matches[idx].group(0))
            content = content[:match.start()] + content[match.end():]
    
    return content, removed


def fix_page_structure(file_path: Path) -> Dict:
    """תיקון מבנה של עמוד אחד"""
    if not file_path.exists():
        return {"error": f"File not found: {file_path}"}
    
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return {"error": f"Error reading file: {e}"}
    
    fixes_applied = []
    original_content = content
    
    # 1. תיקון CSS files
    for css_name, css_info in REQUIRED_CSS.items():
        if not has_css_file(content, css_info["pattern"]):
            insert_pos, indent = find_css_insertion_point(content)
            if insert_pos >= 0:
                if css_info["position"] == "first":
                    # מכניס בתחילת head
                    head_match = re.search(r'<head[^>]*>', content, re.IGNORECASE)
                    if head_match:
                        insert_pos = head_match.end()
                        content = content[:insert_pos] + "\n    " + css_info["template"] + content[insert_pos:]
                        fixes_applied.append(f"Added {css_name} CSS")
                elif css_info["position"] == "after_bootstrap":
                    # מכניס אחרי Bootstrap
                    bootstrap_match = re.search(r'bootstrap.*\.css', content, re.IGNORECASE)
                    if bootstrap_match:
                        # מוצא את סוף התגית
                        link_match = re.search(r'<link[^>]*bootstrap.*\.css[^>]*>', content, re.IGNORECASE)
                        if link_match:
                            insert_pos = link_match.end()
                            content = content[:insert_pos] + "\n    " + css_info["template"] + content[insert_pos:]
                            fixes_applied.append(f"Added {css_name} CSS after Bootstrap")
                    else:
                        # אם אין Bootstrap, מכניס בתחילת head
                        head_match = re.search(r'<head[^>]*>', content, re.IGNORECASE)
                        if head_match:
                            insert_pos = head_match.end()
                            content = content[:insert_pos] + "\n    " + css_info["template"] + content[insert_pos:]
                            fixes_applied.append(f"Added {css_name} CSS (Bootstrap not found)")
                elif css_info["position"] == "after_master":
                    # מכניס אחרי master.css
                    master_match = re.search(r'<link[^>]*master\.css[^>]*>', content, re.IGNORECASE)
                    if master_match:
                        insert_pos = master_match.end()
                        content = content[:insert_pos] + "\n    " + css_info["template"] + content[insert_pos:]
                        fixes_applied.append(f"Added {css_name} CSS after master.css")
                    else:
                        # אם אין master.css, מכניס לפני </head>
                        head_close_match = re.search(r'</head>', content, re.IGNORECASE)
                        if head_close_match:
                            insert_pos = head_close_match.start()
                            content = content[:insert_pos] + "    " + css_info["template"] + "\n" + content[insert_pos:]
                            fixes_applied.append(f"Added {css_name} CSS (master.css not found)")
    
    # 2. תיקון JavaScript files
    for js_name, js_info in REQUIRED_JS.items():
        if not has_js_file(content, js_info["pattern"]):
            if js_info["position"] == "first":
                # מכניס לפני כל script אחר
                first_script_match = re.search(r'<script[^>]*src', content, re.IGNORECASE)
                if first_script_match:
                    insert_pos = first_script_match.start()
                    content = content[:insert_pos] + "    " + js_info["template"] + "\n" + content[insert_pos:]
                    fixes_applied.append(f"Added {js_name} JS before other scripts")
                else:
                    # אם אין script tags, מכניס לפני </body>
                    body_close_match = re.search(r'</body>', content, re.IGNORECASE)
                    if body_close_match:
                        insert_pos = body_close_match.start()
                        content = content[:insert_pos] + "    " + js_info["template"] + "\n" + content[insert_pos:]
                        fixes_applied.append(f"Added {js_name} JS before </body>")
    
    # 3. תיקון אלמנטים
    for element_name, element_info in REQUIRED_ELEMENTS.items():
        if not has_element(content, element_info["pattern"]):
            if element_info["position"] == "after_body":
                body_match = re.search(r'<body[^>]*>', content, re.IGNORECASE)
                if body_match:
                    insert_pos = body_match.end()
                    content = content[:insert_pos] + "\n    " + element_info["template"] + content[insert_pos:]
                    fixes_applied.append(f"Added {element_name} element")
    
    # 4. הסרת כפילויות בטעינת סקריפטים
    content, removed_scripts = remove_duplicate_scripts(content)
    if removed_scripts:
        fixes_applied.append(f"Removed {len(removed_scripts)} duplicate script(s)")
    
    # שמירת הקובץ אם היו שינויים
    if content != original_content:
        try:
            file_path.write_text(content, encoding='utf-8')
            return {
                "success": True,
                "fixes_applied": fixes_applied,
                "removed_scripts": removed_scripts
            }
        except Exception as e:
            return {"error": f"Error writing file: {e}"}
    else:
        return {
            "success": True,
            "fixes_applied": [],
            "message": "No fixes needed"
        }


def fix_all_pages() -> Dict:
    """תיקון כל עמודי הבדיקה"""
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_pages": len(TEST_PAGES),
        "pages_fixed": 0,
        "pages_with_errors": 0,
        "pages_no_fixes": 0,
        "pages": {}
    }
    
    for page_info in TEST_PAGES:
        if isinstance(page_info, tuple):
            page_name, base_dir = page_info
            file_path = base_dir / page_name
        else:
            page_name = page_info
            file_path = TRADING_UI_DIR / page_name
        
        print(f"Fixing: {page_name}...")
        result = fix_page_structure(file_path)
        
        if "error" in result:
            results["pages_with_errors"] += 1
        elif result.get("fixes_applied"):
            results["pages_fixed"] += 1
        else:
            results["pages_no_fixes"] += 1
        
        results["pages"][page_name] = result
    
    return results


def main():
    """פונקציה ראשית"""
    print("=" * 60)
    print("תיקון מבנה בסיסי - כל עמודי הבדיקה")
    print("=" * 60)
    print()
    
    # תיקון כל העמודים
    results = fix_all_pages()
    
    # שמירת תוצאות JSON
    json_path = REPORTS_DIR / "test_pages_structure_fixes.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"✅ תוצאות JSON נשמרו ל: {json_path}")
    
    # הדפסת סיכום
    print()
    print("=" * 60)
    print("סיכום תיקונים")
    print("=" * 60)
    print(f"עמודים שתוקנו: {results['pages_fixed']}")
    print(f"עמודים ללא שינויים: {results['pages_no_fixes']}")
    print(f"עמודים עם שגיאות: {results['pages_with_errors']}")
    print()
    
    # הדפסת פירוט תיקונים
    for page_name, result in results["pages"].items():
        if result.get("fixes_applied"):
            print(f"\n{page_name}:")
            for fix in result["fixes_applied"]:
                print(f"  ✅ {fix}")
            if result.get("removed_scripts"):
                print(f"  🗑️  Removed {len(result['removed_scripts'])} duplicate script(s)")


if __name__ == "__main__":
    main()

