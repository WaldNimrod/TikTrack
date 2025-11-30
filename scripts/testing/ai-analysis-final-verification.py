#!/usr/bin/env python3
"""
בדיקה סופית מקיפה - עמוד AI Analysis
Final Comprehensive Verification - AI Analysis Page
"""

import os
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

PAGES_DIR = Path("trading-ui")
REPORTS_DIR = Path("documentation/05-REPORTS")

# מודולים שצריך לבדוק
AI_ANALYSIS_MODULES = [
    "scripts/ai-analysis-manager.js",
    "scripts/ai-template-selector.js",
    "scripts/ai-result-renderer.js",
    "scripts/ai-export-service.js",
    "scripts/ai-notes-integration.js",
    "scripts/services/ai-analysis-data.js"
]

def check_file_exists(file_path: Path) -> bool:
    """בדיקת קיום קובץ"""
    return file_path.exists()

def check_function_index(content: str) -> Tuple[bool, List[str]]:
    """בדיקת Function Index"""
    issues = []
    has_index = "FUNCTION INDEX" in content or "Function Index" in content or "function index" in content
    if not has_index:
        issues.append("Missing Function Index")
    
    # בדיקת פורמט נכון
    if has_index:
        if "Total Functions:" not in content and "Total Functions" not in content:
            issues.append("Function Index missing total functions count")
    
    return has_index, issues

def check_jsdoc_coverage(content: str) -> Tuple[float, List[str]]:
    """בדיקת כיסוי JSDoc"""
    issues = []
    
    # חיפוש פונקציות
    function_pattern = r'(?:async\s+)?\w+\s*\([^)]*\)\s*{'
    functions = re.findall(function_pattern, content)
    
    # חיפוש JSDoc comments לפני פונקציות
    jsdoc_pattern = r'/\*\*[\s\S]*?\*/\s*(?:async\s+)?\w+\s*\('
    documented = re.findall(jsdoc_pattern, content)
    
    total_functions = len(functions)
    documented_functions = len(documented)
    
    coverage = (documented_functions / total_functions * 100) if total_functions > 0 else 0
    
    if coverage < 50:
        issues.append(f"Low JSDoc coverage: {coverage:.1f}%")
    
    return coverage, issues

def check_central_systems_usage(html_content: str, js_content: str) -> Dict[str, bool]:
    """בדיקת שימוש במערכות מרכזיות"""
    systems = {
        "DataCollectionService": False,
        "CRUDResponseHandler": False,
        "IconSystem": False,
        "ModalManagerV2": False,
        "createAndShowModal": False,
        "Logger": False
    }
    
    # בדיקה ב-HTML
    if "DataCollectionService" in html_content or "DataCollectionService" in js_content:
        systems["DataCollectionService"] = True
    
    if "CRUDResponseHandler" in html_content or "CRUDResponseHandler" in js_content:
        systems["CRUDResponseHandler"] = True
    
    if "IconSystem" in html_content or "IconSystem" in js_content:
        systems["IconSystem"] = True
    
    if "ModalManagerV2" in html_content or "ModalManagerV2" in js_content:
        systems["ModalManagerV2"] = True
    
    if "createAndShowModal" in html_content or "createAndShowModal" in js_content:
        systems["createAndShowModal"] = True
    
    if "window.Logger" in html_content or "window.Logger" in js_content:
        systems["Logger"] = True
    
    return systems

def check_inline_styles(html_content: str) -> Tuple[List[str], int]:
    """בדיקת inline styles"""
    issues = []
    # חיפוש style="..." אבל לא data-style="..."
    style_pattern = r'(?<!data-)style\s*=\s*["\'][^"\']+["\']'
    matches = re.findall(style_pattern, html_content, re.IGNORECASE)
    
    # פילטור של inline styles מותרים (דינמיים)
    filtered_matches = []
    for match in matches:
        # דילוג על inline styles דינמיים מותרים
        if not any(skip in match.lower() for skip in ['position', 'left', 'top', 'width', 'height', 'display:none']):
            filtered_matches.append(match)
    
    if filtered_matches:
        issues.extend([f"Inline style found: {m[:50]}..." for m in filtered_matches[:5]])
    
    return issues, len(filtered_matches)

def check_css_file(content: str) -> Tuple[bool, str]:
    """בדיקת קובץ CSS ספציפי"""
    has_css = "07-pages/_ai-analysis.css" in content
    css_path = "styles-new/07-pages/_ai-analysis.css"
    return has_css, css_path

def check_bootstrap_css(content: str) -> bool:
    """בדיקת Bootstrap CSS"""
    return 'bootstrap.min.css' in content.lower() or 'bootstrap.css' in content.lower()

def check_icon_system(content: str) -> Dict[str, bool]:
    """בדיקת IconSystem"""
    return {
        'mappings': 'icon-mappings.js' in content,
        'system': 'icon-system.js' in content,
        'helper': 'icon-replacement-helper.js' in content,
        'complete': all(['icon-mappings.js' in content, 'icon-system.js' in content, 'icon-replacement-helper.js' in content])
    }

def check_module_standardization(module_path: Path) -> Dict:
    """בדיקת סטנדרטיזציה של מודול"""
    if not module_path.exists():
        return {
            "exists": False,
            "function_index": False,
            "jsdoc_coverage": 0,
            "issues": ["File not found"]
        }
    
    content = module_path.read_text(encoding='utf-8')
    
    has_index, index_issues = check_function_index(content)
    coverage, coverage_issues = check_jsdoc_coverage(content)
    
    return {
        "exists": True,
        "function_index": has_index,
        "jsdoc_coverage": coverage,
        "function_index_issues": index_issues,
        "jsdoc_issues": coverage_issues,
        "line_count": len(content.splitlines())
    }

def main():
    """הרצת בדיקה מקיפה"""
    print("="*80)
    print("🔍 בדיקה סופית מקיפה - עמוד AI Analysis")
    print("="*80)
    print()
    
    page_path = PAGES_DIR / "ai-analysis.html"
    report = {
        "page": "ai-analysis.html",
        "timestamp": datetime.now().isoformat(),
        "checks": {}
    }
    
    # 1. בדיקת קיום העמוד
    print("📄 1. בדיקת קיום העמוד...")
    if not check_file_exists(page_path):
        print("❌ עמוד לא נמצא!")
        return
    print("✅ עמוד נמצא")
    report["checks"]["page_exists"] = True
    
    # 2. קריאת תוכן העמוד
    html_content = page_path.read_text(encoding='utf-8')
    report["checks"]["page_size"] = len(html_content)
    
    # 3. בדיקת Bootstrap CSS
    print("\n🎨 2. בדיקת Bootstrap CSS...")
    has_bootstrap = check_bootstrap_css(html_content)
    print(f"{'✅' if has_bootstrap else '❌'} Bootstrap CSS: {has_bootstrap}")
    report["checks"]["bootstrap_css"] = has_bootstrap
    
    # 4. בדיקת IconSystem
    print("\n🖼️  3. בדיקת IconSystem...")
    icon_system = check_icon_system(html_content)
    print(f"{'✅' if icon_system['complete'] else '❌'} IconSystem complete: {icon_system['complete']}")
    if not icon_system['complete']:
        missing = [k for k, v in icon_system.items() if k != 'complete' and not v]
        print(f"   Missing: {', '.join(missing)}")
    report["checks"]["icon_system"] = icon_system
    
    # 5. בדיקת קובץ CSS ספציפי
    print("\n📝 4. בדיקת קובץ CSS ספציפי...")
    has_css, css_path = check_css_file(html_content)
    print(f"{'✅' if has_css else '❌'} CSS file: {css_path}")
    if has_css:
        css_file_path = PAGES_DIR / css_path
        if css_file_path.exists():
            print(f"   ✅ קובץ CSS קיים: {css_path}")
            report["checks"]["css_file"] = {"exists": True, "path": css_path}
        else:
            print(f"   ❌ קובץ CSS לא נמצא: {css_path}")
            report["checks"]["css_file"] = {"exists": False, "path": css_path}
    else:
        report["checks"]["css_file"] = {"exists": False, "path": None}
    
    # 6. בדיקת inline styles
    print("\n🎨 5. בדיקת inline styles...")
    inline_issues, inline_count = check_inline_styles(html_content)
    print(f"{'✅' if inline_count == 0 else '⚠️ '} Inline styles: {inline_count} found")
    if inline_issues:
        for issue in inline_issues[:3]:
            print(f"   - {issue}")
    report["checks"]["inline_styles"] = {"count": inline_count, "issues": inline_issues}
    
    # 7. בדיקת מודולים
    print("\n📦 6. בדיקת מודולים...")
    modules_report = {}
    for module in AI_ANALYSIS_MODULES:
        module_path = PAGES_DIR / module
        module_name = Path(module).stem
        print(f"\n   📄 {module_name}...")
        module_result = check_module_standardization(module_path)
        modules_report[module_name] = module_result
        
        if module_result["exists"]:
            print(f"      ✅ קובץ קיים ({module_result['line_count']} שורות)")
            print(f"      {'✅' if module_result['function_index'] else '❌'} Function Index")
            print(f"      📊 JSDoc coverage: {module_result['jsdoc_coverage']:.1f}%")
            if module_result.get("function_index_issues"):
                for issue in module_result["function_index_issues"]:
                    print(f"         ⚠️  {issue}")
        else:
            print(f"      ❌ קובץ לא נמצא")
    
    report["checks"]["modules"] = modules_report
    
    # 8. בדיקת שימוש במערכות מרכזיות
    print("\n🔧 7. בדיקת שימוש במערכות מרכזיות...")
    
    # אסוף תוכן מכל המודולים
    all_js_content = html_content
    for module in AI_ANALYSIS_MODULES:
        module_path = PAGES_DIR / module
        if module_path.exists():
            all_js_content += "\n" + module_path.read_text(encoding='utf-8')
    
    systems_usage = check_central_systems_usage(html_content, all_js_content)
    for system, used in systems_usage.items():
        print(f"   {'✅' if used else '❌'} {system}: {used}")
    
    report["checks"]["central_systems"] = systems_usage
    
    # 9. סיכום
    print("\n" + "="*80)
    print("📊 סיכום בדיקה")
    print("="*80)
    
    all_passed = (
        report["checks"]["bootstrap_css"] and
        report["checks"]["icon_system"]["complete"] and
        report["checks"]["css_file"].get("exists", False) and
        inline_count == 0 and
        all(m["function_index"] for m in modules_report.values() if m["exists"]) and
        all(systems_usage.values())
    )
    
    print(f"\n{'✅' if all_passed else '⚠️ '} סטטוס כללי: {'PASSED' if all_passed else 'NEEDS ATTENTION'}")
    print(f"\nפרטים:")
    print(f"  - Bootstrap CSS: {'✅' if report['checks']['bootstrap_css'] else '❌'}")
    print(f"  - IconSystem: {'✅' if report['checks']['icon_system']['complete'] else '❌'}")
    print(f"  - CSS File: {'✅' if report['checks']['css_file'].get('exists') else '❌'}")
    print(f"  - Inline Styles: {'✅' if inline_count == 0 else f'⚠️  {inline_count}'}")
    print(f"  - Function Index (כל המודולים): {'✅' if all(m['function_index'] for m in modules_report.values() if m['exists']) else '❌'}")
    print(f"  - Central Systems: {'✅' if all(systems_usage.values()) else '❌'}")
    
    # 10. שמירת דוח
    report_file = REPORTS_DIR / f"AI_ANALYSIS_FINAL_VERIFICATION_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    import json
    report_file.parent.mkdir(parents=True, exist_ok=True)
    report_file.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"\n💾 דוח נשמר: {report_file}")
    
    print("\n" + "="*80)
    return report

if __name__ == "__main__":
    main()

