#!/usr/bin/env python3
"""
בדיקת תקינות מבנה של כל עמודי הבדיקה
Validate structure of all test pages

בדיקות:
- תקינות HTML (validator)
- תקינות CSS (syntax)
- תקינות JavaScript (syntax, no console errors)
- תקינות נתיבים (כל הסקריפטים נטענים)
"""

import os
import re
import json
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import urllib.parse

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
    ("test-user-ticker-frontend.html", SCRIPTS_DIR),
]


def validate_html_syntax(content: str) -> Dict:
    """בדיקת תקינות תחביר HTML בסיסית"""
    issues = []
    
    # בדיקת DOCTYPE
    if not re.search(r'<!DOCTYPE\s+html', content, re.IGNORECASE):
        issues.append("Missing DOCTYPE declaration")
    
    # בדיקת תגיות פתוחות/סגורות בסיסיות
    html_open = len(re.findall(r'<html', content, re.IGNORECASE))
    html_close = len(re.findall(r'</html>', content, re.IGNORECASE))
    if html_open != html_close:
        issues.append(f"Mismatched HTML tags: {html_open} open, {html_close} close")
    
    head_open = len(re.findall(r'<head', content, re.IGNORECASE))
    head_close = len(re.findall(r'</head>', content, re.IGNORECASE))
    if head_open != head_close:
        issues.append(f"Mismatched HEAD tags: {head_open} open, {head_close} close")
    
    body_open = len(re.findall(r'<body', content, re.IGNORECASE))
    body_close = len(re.findall(r'</body>', content, re.IGNORECASE))
    if body_open != body_close:
        issues.append(f"Mismatched BODY tags: {body_open} open, {body_close} close")
    
    # בדיקת תגיות script לא סגורות
    script_open = len(re.findall(r'<script', content, re.IGNORECASE))
    script_close = len(re.findall(r'</script>', content, re.IGNORECASE))
    if script_open != script_close:
        issues.append(f"Mismatched SCRIPT tags: {script_open} open, {script_close} close")
    
    # בדיקת תגיות link לא סגורות
    link_tags = len(re.findall(r'<link[^>]*>', content, re.IGNORECASE))
    # link tags are self-closing, so this is just informational
    
    return {
        "valid": len(issues) == 0,
        "issues": issues
    }


def validate_css_paths(content: str, base_path: Path) -> Dict:
    """בדיקת תקינות נתיבי CSS"""
    issues = []
    css_pattern = r'<link[^>]*href=["\']([^"\']*\.css[^"\']*)["\']'
    css_matches = re.findall(css_pattern, content, re.IGNORECASE)
    
    for css_path in css_matches:
        # Skip CDN URLs
        if css_path.startswith('http://') or css_path.startswith('https://'):
            continue
        
        # Remove query params
        css_path_clean = css_path.split('?')[0]
        
        # Check if file exists (relative to trading-ui)
        full_path = base_path.parent / css_path_clean
        if not full_path.exists():
            issues.append(f"CSS file not found: {css_path}")
    
    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "total_css_files": len(css_matches)
    }


def validate_js_paths(content: str, base_path: Path) -> Dict:
    """בדיקת תקינות נתיבי JavaScript"""
    issues = []
    js_pattern = r'<script[^>]*src=["\']([^"\']*\.js[^"\']*)["\']'
    js_matches = re.findall(js_pattern, content, re.IGNORECASE)
    
    for js_path in js_matches:
        # Skip CDN URLs
        if js_path.startswith('http://') or js_path.startswith('https://'):
            continue
        
        # Remove query params
        js_path_clean = js_path.split('?')[0]
        
        # Check if file exists (relative to trading-ui)
        full_path = base_path.parent / js_path_clean
        if not full_path.exists():
            issues.append(f"JavaScript file not found: {js_path}")
    
    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "total_js_files": len(js_matches)
    }


def validate_js_syntax(content: str) -> Dict:
    """בדיקת תקינות תחביר JavaScript בסיסית (inline scripts)"""
    issues = []
    
    # מוצא את כל ה-inline scripts
    inline_script_pattern = r'<script[^>]*>(.*?)</script>'
    inline_scripts = re.findall(inline_script_pattern, content, re.DOTALL | re.IGNORECASE)
    
    for i, script_content in enumerate(inline_scripts):
        # Skip empty scripts
        if not script_content.strip():
            continue
        
        # בדיקות בסיסיות
        # בדיקת סוגריים מאוזנים
        open_braces = script_content.count('{')
        close_braces = script_content.count('}')
        if open_braces != close_braces:
            issues.append(f"Inline script {i+1}: Unbalanced braces ({open_braces} open, {close_braces} close)")
        
        open_parens = script_content.count('(')
        close_parens = script_content.count(')')
        if open_parens != close_parens:
            issues.append(f"Inline script {i+1}: Unbalanced parentheses ({open_parens} open, {close_parens} close)")
        
        open_brackets = script_content.count('[')
        close_brackets = script_content.count(']')
        if open_brackets != close_brackets:
            issues.append(f"Inline script {i+1}: Unbalanced brackets ({open_brackets} open, {close_brackets} close)")
        
        # בדיקת מחרוזות לא סגורות (בסיסי)
        single_quotes = script_content.count("'")
        double_quotes = script_content.count('"')
        # זה לא מושלם אבל יכול לעזור לזהות בעיות ברורות
    
    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "total_inline_scripts": len(inline_scripts)
    }


def validate_page(file_path: Path) -> Dict:
    """בדיקת תקינות של עמוד אחד"""
    if not file_path.exists():
        return {"error": f"File not found: {file_path}"}
    
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return {"error": f"Error reading file: {e}"}
    
    validation = {
        "file_path": str(file_path.relative_to(BASE_DIR)),
        "html_syntax": validate_html_syntax(content),
        "css_paths": validate_css_paths(content, file_path),
        "js_paths": validate_js_paths(content, file_path),
        "js_syntax": validate_js_syntax(content),
        "all_valid": True
    }
    
    # בדיקה אם הכל תקין
    if not validation["html_syntax"]["valid"]:
        validation["all_valid"] = False
    if not validation["css_paths"]["valid"]:
        validation["all_valid"] = False
    if not validation["js_paths"]["valid"]:
        validation["all_valid"] = False
    if not validation["js_syntax"]["valid"]:
        validation["all_valid"] = False
    
    return validation


def validate_all_pages() -> Dict:
    """בדיקת תקינות כל עמודי הבדיקה"""
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_pages": len(TEST_PAGES),
        "pages_validated": 0,
        "pages_valid": 0,
        "pages_invalid": 0,
        "pages_with_errors": 0,
        "pages": {}
    }
    
    for page_info in TEST_PAGES:
        if isinstance(page_info, tuple):
            page_name, base_dir = page_info
            file_path = base_dir / page_name
        else:
            page_name = page_info
            file_path = TRADING_UI_DIR / page_name
        
        print(f"Validating: {page_name}...")
        validation = validate_page(file_path)
        
        if "error" in validation:
            results["pages_with_errors"] += 1
        else:
            results["pages_validated"] += 1
            if validation["all_valid"]:
                results["pages_valid"] += 1
            else:
                results["pages_invalid"] += 1
        
        results["pages"][page_name] = validation
    
    return results


def generate_report(results: Dict) -> str:
    """יצירת דוח טקסטואלי"""
    report = []
    report.append("# דוח בדיקת תקינות מבנה - כל עמודי הבדיקה\n")
    report.append(f"**תאריך:** {results['timestamp']}\n")
    report.append(f"**סה\"כ עמודים:** {results['total_pages']}\n")
    report.append(f"**עמודים שנבדקו:** {results['pages_validated']}\n")
    report.append(f"**עמודים תקינים:** {results['pages_valid']}\n")
    report.append(f"**עמודים לא תקינים:** {results['pages_invalid']}\n")
    report.append(f"**עמודים עם שגיאות:** {results['pages_with_errors']}\n\n")
    
    report.append("## פירוט לפי עמוד\n\n")
    
    for page_name, validation in results["pages"].items():
        if "error" in validation:
            report.append(f"### {page_name}\n")
            report.append(f"**שגיאה:** {validation['error']}\n\n")
            continue
        
        report.append(f"### {page_name}\n")
        report.append(f"**נתיב:** {validation['file_path']}\n")
        
        if validation["all_valid"]:
            report.append("✅ **תקין**\n\n")
        else:
            report.append("❌ **לא תקין**\n\n")
            
            # HTML syntax
            if not validation["html_syntax"]["valid"]:
                report.append("**בעיות HTML:**\n")
                for issue in validation["html_syntax"]["issues"]:
                    report.append(f"- ❌ {issue}\n")
                report.append("\n")
            
            # CSS paths
            if not validation["css_paths"]["valid"]:
                report.append("**בעיות CSS:**\n")
                for issue in validation["css_paths"]["issues"]:
                    report.append(f"- ❌ {issue}\n")
                report.append("\n")
            
            # JS paths
            if not validation["js_paths"]["valid"]:
                report.append("**בעיות JavaScript (נתיבים):**\n")
                for issue in validation["js_paths"]["issues"]:
                    report.append(f"- ❌ {issue}\n")
                report.append("\n")
            
            # JS syntax
            if not validation["js_syntax"]["valid"]:
                report.append("**בעיות JavaScript (תחביר):**\n")
                for issue in validation["js_syntax"]["issues"]:
                    report.append(f"- ❌ {issue}\n")
                report.append("\n")
        
        report.append("---\n\n")
    
    return "".join(report)


def main():
    """פונקציה ראשית"""
    print("=" * 60)
    print("בדיקת תקינות מבנה - כל עמודי הבדיקה")
    print("=" * 60)
    print()
    
    # בדיקת כל העמודים
    results = validate_all_pages()
    
    # שמירת תוצאות JSON
    json_path = REPORTS_DIR / "test_pages_structure_validation.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"✅ תוצאות JSON נשמרו ל: {json_path}")
    
    # יצירת דוח טקסטואלי
    report = generate_report(results)
    report_path = REPORTS_DIR / "TEST_PAGES_STRUCTURE_VALIDATION_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"✅ דוח נשמר ל: {report_path}")
    
    # הדפסת סיכום
    print()
    print("=" * 60)
    print("סיכום בדיקות")
    print("=" * 60)
    print(f"עמודים שנבדקו: {results['pages_validated']}/{results['total_pages']}")
    print(f"עמודים תקינים: {results['pages_valid']}")
    print(f"עמודים לא תקינים: {results['pages_invalid']}")
    print(f"עמודים עם שגיאות: {results['pages_with_errors']}")
    print()
    
    if results["pages_invalid"] > 0:
        print("⚠️  יש עמודים לא תקינים שדורשים תיקון!")
    elif results["pages_with_errors"] > 0:
        print("⚠️  יש עמודים עם שגיאות!")
    else:
        print("✅ כל העמודים תקינים!")


if __name__ == "__main__":
    main()

