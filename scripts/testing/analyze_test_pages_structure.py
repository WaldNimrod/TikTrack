#!/usr/bin/env python3
"""
ניתוח מבנה כל עמודי הבדיקה
Analyze structure of all test pages

בדיקות:
- מבנה HTML (DOCTYPE, head, body)
- טעינת CSS (Bootstrap, master.css, header-styles.css)
- טעינת JavaScript (סדר, תלויות)
- נוכחות מערכות כלליות (Logger, HeaderSystem, וכו')
- נוכחות אלמנטים נדרשים (unified-header, וכו')
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Set
from collections import defaultdict

BASE_DIR = Path(__file__).parent.parent.parent
TRADING_UI_DIR = BASE_DIR / "trading-ui"
SCRIPTS_DIR = BASE_DIR / "trading-ui" / "scripts"
REPORTS_DIR = BASE_DIR / "documentation" / "03-DEVELOPMENT" / "TESTING"

# כל 17 עמודי הבדיקה
TEST_PAGES = [
    "test-header-only.html",
    "test-monitoring.html",
    "test-frontend-wrappers.html",
    "test-bootstrap-popover-comparison.html",
    "test-quill.html",
    "test-nested-modal-rich-text.html",
    "test-overlay-debug.html",
    "test-phase1-recovery.html",
    "test-phase3-1-comprehensive.html",
    "test-unified-widget.html",
    "test-unified-widget-comprehensive.html",
    "test-unified-widget-integration.html",
    "test-recent-items-widget.html",
    "test-ticker-widgets-performance.html",
    "test-user-ticker-integration.html",
    "conditions-test.html",
    # עמוד בתיקיית scripts
    ("scripts/test-user-ticker-frontend.html", SCRIPTS_DIR),
]

# מערכות כלליות לבדיקה
REQUIRED_SYSTEMS = {
    "error-handlers.js": "Error Handlers",
    "logger-service.js": "Logger Service",
    "unified-cache-manager.js": "Unified Cache Manager",
    "header-system.js": "Header System",
    "button-system-init.js": "Button System",
    "preferences-core.js": "Preferences System",
}

# CSS files לבדיקה
REQUIRED_CSS = {
    "bootstrap.min.css": "Bootstrap CSS",
    "master.css": "Master CSS",
    "header-styles.css": "Header Styles",
}

# אלמנטים נדרשים
REQUIRED_ELEMENTS = {
    "unified-header": "Unified Header div",
    "doctype": "DOCTYPE declaration",
    "html": "HTML tag",
    "head": "HEAD tag",
    "body": "BODY tag",
}


def analyze_html_structure(file_path: Path) -> Dict:
    """ניתוח מבנה HTML של עמוד"""
    if not file_path.exists():
        return {"error": f"File not found: {file_path}"}
    
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return {"error": f"Error reading file: {e}"}
    
    analysis = {
        "file_path": str(file_path.relative_to(BASE_DIR)),
        "file_exists": True,
        "file_size": len(content),
        "structure": {},
        "css_files": [],
        "js_files": [],
        "css_files_status": {},
        "systems": {},
        "elements": {},
        "issues": [],
        "warnings": [],
    }
    
    # בדיקת מבנה HTML בסיסי
    analysis["structure"]["has_doctype"] = "<!DOCTYPE" in content.upper()
    analysis["structure"]["has_html_tag"] = "<html" in content.lower()
    analysis["structure"]["has_head_tag"] = "<head" in content.lower()
    analysis["structure"]["has_body_tag"] = "<body" in content.lower()
    analysis["structure"]["has_unified_header"] = 'id="unified-header"' in content or "id='unified-header'" in content
    
    # בדיקת CSS files
    css_pattern = r'<link[^>]*href=["\']([^"\']*\.css[^"\']*)["\']'
    css_matches = re.findall(css_pattern, content, re.IGNORECASE)
    analysis["css_files"] = css_matches
    
    # בדיקת JavaScript files
    js_pattern = r'<script[^>]*src=["\']([^"\']*\.js[^"\']*)["\']'
    js_matches = re.findall(js_pattern, content, re.IGNORECASE)
    analysis["js_files"] = js_matches
    
    # בדיקת מערכות כלליות
    for script_name, system_name in REQUIRED_SYSTEMS.items():
        found = any(script_name in js for js in js_matches)
        analysis["systems"][system_name] = {
            "required": True,
            "found": found,
            "paths": [js for js in js_matches if script_name in js]
        }
    
    # בדיקת CSS files נדרשים
    for css_name, css_desc in REQUIRED_CSS.items():
        found = any(css_name in css for css in css_matches)
        analysis["css_files_status"][css_desc] = {
            "required": True,
            "found": found,
            "paths": [css for css in css_matches if css_name in css]
        }
    
    # בדיקת אלמנטים נדרשים
    for element_id, element_desc in REQUIRED_ELEMENTS.items():
        if element_id == "doctype":
            found = analysis["structure"]["has_doctype"]
        elif element_id == "html":
            found = analysis["structure"]["has_html_tag"]
        elif element_id == "head":
            found = analysis["structure"]["has_head_tag"]
        elif element_id == "body":
            found = analysis["structure"]["has_body_tag"]
        else:
            found = element_id in content
        
        analysis["elements"][element_desc] = {
            "required": True,
            "found": found
        }
    
    # זיהוי בעיות
    if not analysis["structure"]["has_doctype"]:
        analysis["issues"].append("Missing DOCTYPE declaration")
    
    if not analysis["structure"]["has_html_tag"]:
        analysis["issues"].append("Missing HTML tag")
    
    if not analysis["structure"]["has_head_tag"]:
        analysis["issues"].append("Missing HEAD tag")
    
    if not analysis["structure"]["has_body_tag"]:
        analysis["issues"].append("Missing BODY tag")
    
    if not analysis["structure"]["has_unified_header"]:
        analysis["warnings"].append("Missing unified-header div")
    
    # בדיקת CSS נדרש
    if not any("bootstrap" in css.lower() for css in css_matches):
        analysis["issues"].append("Missing Bootstrap CSS")
    
    if not any("master.css" in css for css in css_matches):
        analysis["warnings"].append("Missing master.css")
    
    if not any("header-styles.css" in css for css in css_matches):
        analysis["warnings"].append("Missing header-styles.css")
    
    # בדיקת JavaScript נדרש
    if not any("error-handlers.js" in js for js in js_matches):
        analysis["warnings"].append("Missing error-handlers.js")
    
    if not any("logger-service.js" in js for js in js_matches):
        analysis["warnings"].append("Missing logger-service.js")
    
    if not any("header-system.js" in js for js in js_matches):
        analysis["warnings"].append("Missing header-system.js")
    
    # בדיקת סדר טעינה (Bootstrap CSS לפני master.css)
    bootstrap_idx = next((i for i, css in enumerate(css_matches) if "bootstrap" in css.lower()), -1)
    master_idx = next((i for i, css in enumerate(css_matches) if "master.css" in css), -1)
    
    if bootstrap_idx >= 0 and master_idx >= 0 and master_idx < bootstrap_idx:
        analysis["issues"].append("master.css loaded before Bootstrap CSS (should be after)")
    
    # בדיקת כפילויות בטעינת סקריפטים
    js_counts = defaultdict(int)
    for js in js_matches:
        js_name = os.path.basename(js.split('?')[0])  # Remove query params
        js_counts[js_name] += 1
    
    duplicates = {name: count for name, count in js_counts.items() if count > 1}
    if duplicates:
        analysis["issues"].append(f"Duplicate script loading: {duplicates}")
    
    return analysis


def analyze_all_pages() -> Dict:
    """ניתוח כל עמודי הבדיקה"""
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_pages": len(TEST_PAGES),
        "pages_analyzed": 0,
        "pages_with_issues": 0,
        "pages_with_warnings": 0,
        "pages_ok": 0,
        "pages": {},
        "summary": {
            "structure_issues": defaultdict(int),
            "missing_css": defaultdict(int),
            "missing_js": defaultdict(int),
            "missing_elements": defaultdict(int),
            "duplicate_scripts": [],
        }
    }
    
    for page_info in TEST_PAGES:
        if isinstance(page_info, tuple):
            page_name, base_dir = page_info
            file_path = base_dir / page_name
        else:
            page_name = page_info
            file_path = TRADING_UI_DIR / page_name
        
        print(f"Analyzing: {page_name}...")
        analysis = analyze_html_structure(file_path)
        
        if "error" not in analysis:
            results["pages_analyzed"] += 1
            
            if analysis["issues"]:
                results["pages_with_issues"] += 1
            elif analysis["warnings"]:
                results["pages_with_warnings"] += 1
            else:
                results["pages_ok"] += 1
            
            # עדכון סיכום
            for issue in analysis["issues"]:
                if "Missing" in issue:
                    if "CSS" in issue or "css" in issue:
                        results["summary"]["missing_css"][issue] += 1
                    elif "JS" in issue or "js" in issue or "script" in issue.lower():
                        results["summary"]["missing_js"][issue] += 1
                    else:
                        results["summary"]["missing_elements"][issue] += 1
                else:
                    results["summary"]["structure_issues"][issue] += 1
            
            if "Duplicate script loading" in str(analysis["issues"]):
                results["summary"]["duplicate_scripts"].append(page_name)
        
        results["pages"][page_name] = analysis
    
    return results


def generate_report(results: Dict) -> str:
    """יצירת דוח טקסטואלי"""
    report = []
    report.append("# דוח ניתוח מבנה - כל עמודי הבדיקה\n")
    report.append(f"**תאריך:** {results['timestamp']}\n")
    report.append(f"**סה\"כ עמודים:** {results['total_pages']}\n")
    report.append(f"**עמודים שנבדקו:** {results['pages_analyzed']}\n")
    report.append(f"**עמודים תקינים:** {results['pages_ok']}\n")
    report.append(f"**עמודים עם אזהרות:** {results['pages_with_warnings']}\n")
    report.append(f"**עמודים עם בעיות:** {results['pages_with_issues']}\n\n")
    
    report.append("## סיכום בעיות\n\n")
    
    if results["summary"]["structure_issues"]:
        report.append("### בעיות מבנה:\n")
        for issue, count in results["summary"]["structure_issues"].items():
            report.append(f"- {issue}: {count} עמודים\n")
        report.append("\n")
    
    if results["summary"]["missing_css"]:
        report.append("### CSS חסר:\n")
        for css, count in results["summary"]["missing_css"].items():
            report.append(f"- {css}: {count} עמודים\n")
        report.append("\n")
    
    if results["summary"]["missing_js"]:
        report.append("### JavaScript חסר:\n")
        for js, count in results["summary"]["missing_js"].items():
            report.append(f"- {js}: {count} עמודים\n")
        report.append("\n")
    
    if results["summary"]["duplicate_scripts"]:
        report.append("### כפילויות בטעינת סקריפטים:\n")
        for page in results["summary"]["duplicate_scripts"]:
            report.append(f"- {page}\n")
        report.append("\n")
    
    report.append("## פירוט לפי עמוד\n\n")
    
    for page_name, analysis in results["pages"].items():
        if "error" in analysis:
            report.append(f"### {page_name}\n")
            report.append(f"**שגיאה:** {analysis['error']}\n\n")
            continue
        
        report.append(f"### {page_name}\n")
        report.append(f"**נתיב:** {analysis['file_path']}\n")
        report.append(f"**גודל קובץ:** {analysis['file_size']} bytes\n\n")
        
        if analysis["issues"]:
            report.append("**בעיות:**\n")
            for issue in analysis["issues"]:
                report.append(f"- ❌ {issue}\n")
            report.append("\n")
        
        if analysis["warnings"]:
            report.append("**אזהרות:**\n")
            for warning in analysis["warnings"]:
                report.append(f"- ⚠️ {warning}\n")
            report.append("\n")
        
        if not analysis["issues"] and not analysis["warnings"]:
            report.append("✅ **תקין**\n\n")
        
        # CSS files
        report.append("**קבצי CSS:**\n")
        for css in analysis["css_files"][:10]:  # Limit to first 10
            report.append(f"- {css}\n")
        if len(analysis["css_files"]) > 10:
            report.append(f"- ... ועוד {len(analysis['css_files']) - 10} קבצים\n")
        report.append("\n")
        
        # JavaScript files
        report.append("**קבצי JavaScript:**\n")
        for js in analysis["js_files"][:15]:  # Limit to first 15
            report.append(f"- {js}\n")
        if len(analysis["js_files"]) > 15:
            report.append(f"- ... ועוד {len(analysis['js_files']) - 15} קבצים\n")
        report.append("\n")
        
        # Systems status
        report.append("**מערכות כלליות:**\n")
        for system_name, system_info in analysis["systems"].items():
            status = "✅" if system_info["found"] else "❌"
            report.append(f"- {status} {system_name}\n")
        report.append("\n")
        
        report.append("---\n\n")
    
    return "".join(report)


def main():
    """פונקציה ראשית"""
    print("=" * 60)
    print("ניתוח מבנה כל עמודי הבדיקה")
    print("=" * 60)
    print()
    
    # ניתוח כל העמודים
    results = analyze_all_pages()
    
    # שמירת תוצאות JSON
    json_path = REPORTS_DIR / "test_pages_structure_analysis.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"✅ תוצאות JSON נשמרו ל: {json_path}")
    
    # יצירת דוח טקסטואלי
    report = generate_report(results)
    report_path = REPORTS_DIR / "TEST_PAGES_STRUCTURE_ANALYSIS_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"✅ דוח נשמר ל: {report_path}")
    
    # הדפסת סיכום
    print()
    print("=" * 60)
    print("סיכום ניתוח")
    print("=" * 60)
    print(f"עמודים שנבדקו: {results['pages_analyzed']}/{results['total_pages']}")
    print(f"עמודים תקינים: {results['pages_ok']}")
    print(f"עמודים עם אזהרות: {results['pages_with_warnings']}")
    print(f"עמודים עם בעיות: {results['pages_with_issues']}")
    print()
    
    if results["pages_with_issues"] > 0:
        print("⚠️  יש עמודים עם בעיות שדורשות תיקון!")
    elif results["pages_with_warnings"] > 0:
        print("⚠️  יש עמודים עם אזהרות שמומלץ לתקן")
    else:
        print("✅ כל העמודים תקינים!")


if __name__ == "__main__":
    main()

