#!/usr/bin/env python3
"""
יצירת דוח מקיף לכל עמודי הבדיקה
Generate comprehensive report for all test pages

אוסף תוצאות מכל הבדיקות ויוצר דוח מקיף
"""

import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List

BASE_DIR = Path(__file__).parent.parent.parent
REPORTS_DIR = BASE_DIR / "documentation" / "03-DEVELOPMENT" / "TESTING"

# כל 17 עמודי הבדיקה
ALL_TEST_PAGES = [
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
    "scripts/test-user-ticker-frontend.html",
]


def load_json_file(file_path: Path) -> Dict:
    """Load JSON file"""
    try:
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception:
        pass
    return {}


def generate_comprehensive_report():
    """Generate comprehensive report"""
    
    # Load all test results
    structure_analysis = load_json_file(REPORTS_DIR / "test_pages_structure_analysis.json")
    structure_fixes = load_json_file(REPORTS_DIR / "test_pages_structure_fixes.json")
    structure_validation = load_json_file(REPORTS_DIR / "test_pages_structure_validation.json")
    functionality_results = load_json_file(REPORTS_DIR / "test_pages_functionality_results.json")
    processes_results = load_json_file(REPORTS_DIR / "test_pages_processes_results.json")
    data_loading_results = load_json_file(REPORTS_DIR / "test_pages_data_loading_results.json")
    performance_results = load_json_file(REPORTS_DIR / "test_pages_performance_results.json")
    
    # Create comprehensive report
    report = []
    report.append("# דוח מקיף - כל 17 עמודי הבדיקה\n")
    report.append(f"**תאריך:** {datetime.now().isoformat()}\n")
    report.append(f"**סה\"כ עמודי בדיקה:** {len(ALL_TEST_PAGES)}\n\n")
    
    report.append("## סיכום כללי\n\n")
    
    # Summary statistics
    total_pages = len(ALL_TEST_PAGES)
    pages_with_structure_issues = 0
    pages_fixed = 0
    pages_valid = 0
    pages_passed_functionality = 0
    
    if structure_analysis:
        pages_with_structure_issues = structure_analysis.get("pages_with_issues", 0)
    
    if structure_fixes:
        pages_fixed = structure_fixes.get("pages_fixed", 0)
    
    if structure_validation:
        pages_valid = structure_validation.get("pages_valid", 0)
    
    if functionality_results:
        pages_passed_functionality = functionality_results.get("pages_passed", 0)
    
    report.append(f"- **עמודים עם בעיות מבנה:** {pages_with_structure_issues}\n")
    report.append(f"- **עמודים שתוקנו:** {pages_fixed}\n")
    report.append(f"- **עמודים תקינים:** {pages_valid}/{total_pages}\n")
    report.append(f"- **עמודים עברו בדיקות פונקציונליות:** {pages_passed_functionality}/{total_pages}\n\n")
    
    report.append("## מטריצת סטטוס\n\n")
    report.append("| עמוד | מבנה | תיקונים | תקינות | פונקציונליות | ביצועים | סטטוס כללי |\n")
    report.append("|------|------|---------|--------|--------------|---------|------------|\n")
    
    for page_name in ALL_TEST_PAGES:
        # Get status from each test
        structure_status = "✅" if page_name in structure_analysis.get("pages", {}) and \
            not structure_analysis["pages"][page_name].get("issues") else "⚠️"
        
        fixed_status = "✅" if page_name in structure_fixes.get("pages", {}) and \
            structure_fixes["pages"][page_name].get("fixes_applied") else "⬜"
        
        valid_status = "✅" if page_name in structure_validation.get("pages", {}) and \
            structure_validation["pages"][page_name].get("all_valid") else "❌"
        
        func_status = "✅" if page_name in functionality_results.get("pages", {}) and \
            functionality_results["pages"][page_name].get("success") else "❌"
        
        perf_status = "✅" if page_name in performance_results.get("pages", {}) else "⬜"
        
        # Overall status
        if valid_status == "✅" and func_status == "✅":
            overall = "✅ תקין"
        elif valid_status == "✅":
            overall = "⚠️ חלקי"
        else:
            overall = "❌ בעיות"
        
        report.append(f"| {page_name} | {structure_status} | {fixed_status} | {valid_status} | {func_status} | {perf_status} | {overall} |\n")
    
    report.append("\n## פירוט לפי עמוד\n\n")
    
    for page_name in ALL_TEST_PAGES:
        report.append(f"### {page_name}\n\n")
        
        # Structure analysis
        if page_name in structure_analysis.get("pages", {}):
            page_data = structure_analysis["pages"][page_name]
            if page_data.get("issues"):
                report.append("**בעיות מבנה:**\n")
                for issue in page_data["issues"]:
                    report.append(f"- ❌ {issue}\n")
                report.append("\n")
            if page_data.get("warnings"):
                report.append("**אזהרות:**\n")
                for warning in page_data["warnings"]:
                    report.append(f"- ⚠️ {warning}\n")
                report.append("\n")
        
        # Fixes applied
        if page_name in structure_fixes.get("pages", {}):
            page_fixes = structure_fixes["pages"][page_name]
            if page_fixes.get("fixes_applied"):
                report.append("**תיקונים שבוצעו:**\n")
                for fix in page_fixes["fixes_applied"]:
                    report.append(f"- ✅ {fix}\n")
                report.append("\n")
        
        # Validation
        if page_name in structure_validation.get("pages", {}):
            page_validation = structure_validation["pages"][page_name]
            if not page_validation.get("all_valid"):
                report.append("**בעיות תקינות:**\n")
                if not page_validation.get("html_syntax", {}).get("valid"):
                    for issue in page_validation.get("html_syntax", {}).get("issues", []):
                        report.append(f"- ❌ HTML: {issue}\n")
                if not page_validation.get("css_paths", {}).get("valid"):
                    for issue in page_validation.get("css_paths", {}).get("issues", []):
                        report.append(f"- ❌ CSS: {issue}\n")
                if not page_validation.get("js_paths", {}).get("valid"):
                    for issue in page_validation.get("js_paths", {}).get("issues", []):
                        report.append(f"- ❌ JS: {issue}\n")
                report.append("\n")
        
        # Functionality
        if page_name in functionality_results.get("pages", {}):
            page_func = functionality_results["pages"][page_name]
            if page_func.get("success"):
                report.append("✅ **פונקציונליות תקינה**\n\n")
            else:
                report.append("❌ **בעיות פונקציונליות:**\n")
                for error in page_func.get("errors", []):
                    report.append(f"- ❌ {error}\n")
                report.append("\n")
        
        report.append("---\n\n")
    
    report.append("## המלצות\n\n")
    report.append("1. **תיקון בעיות מבנה:** יש לתקן את כל הבעיות שנמצאו בבדיקות מבנה\n")
    report.append("2. **בדיקות פונקציונליות:** יש להריץ בדיקות פונקציונליות על כל העמודים\n")
    report.append("3. **בדיקות ביצועים:** יש להריץ בדיקות ביצועים על כל העמודים\n")
    report.append("4. **תיעוד:** יש לעדכן את התיעוד עם כל התוצאות\n\n")
    
    return "".join(report)


def main():
    """Main function"""
    print("=" * 60)
    print("יצירת דוח מקיף - כל עמודי הבדיקה")
    print("=" * 60)
    print()
    
    report = generate_comprehensive_report()
    
    # Save report
    report_path = REPORTS_DIR / "TEST_PAGES_COMPREHENSIVE_REPORT.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    print(f"✅ דוח מקיף נשמר ל: {report_path}")
    
    # Create status matrix
    matrix_path = REPORTS_DIR / "TEST_PAGES_STATUS_MATRIX.md"
    with open(matrix_path, 'w', encoding='utf-8') as f:
        f.write(report.split("## מטריצת סטטוס")[1].split("## פירוט")[0])
    print(f"✅ מטריצת סטטוס נשמרה ל: {matrix_path}")


if __name__ == "__main__":
    main()

