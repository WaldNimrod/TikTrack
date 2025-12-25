#!/usr/bin/env python3
"""
הרצת בדיקות Selenium על כל 17 עמודי הבדיקה
Run Selenium tests on all 17 test pages
"""

import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent.parent
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
    "scripts/test-user-ticker-frontend.html",
]

REPORTS_DIR = BASE_DIR / "documentation" / "03-DEVELOPMENT" / "TESTING"


def test_page(page_name):
    """Test a single page using Selenium"""
    print(f"\n📄 Testing: {page_name}...")
    
    try:
        result = subprocess.run(
            [sys.executable, str(BASE_DIR / "scripts" / "test_pages_console_errors.py"),
             "--page", page_name],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            timeout=120
        )
        
        output = result.stdout + result.stderr
        
        # Parse results
        # Check if page passed (no errors, return code 0)
        has_errors = "❌ עמודים עם שגיאות:" in output and "0/1" not in output.split("❌ עמודים עם שגיאות:")[1].split("\n")[0]
        no_errors = "✅ עמודים ללא שגיאות:" in output
        has_warnings = "⚠️" in output or "Warnings:" in output
        passed = result.returncode == 0 and (no_errors or not has_errors)
        
        return {
            "page": page_name,
            "success": passed,
            "has_warnings": has_warnings,
            "output": output[-1000:] if len(output) > 1000 else output,
            "return_code": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "page": page_name,
            "success": False,
            "error": "Timeout after 120 seconds"
        }
    except Exception as e:
        return {
            "page": page_name,
            "success": False,
            "error": str(e)
        }


def main():
    """Main function"""
    print("=" * 60)
    print("בדיקות Selenium - כל 17 עמודי הבדיקה")
    print("=" * 60)
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_pages": len(TEST_PAGES),
        "pages_tested": 0,
        "pages_passed": 0,
        "pages_failed": 0,
        "pages_with_warnings": 0,
        "pages": {}
    }
    
    # Test each page
    for page_name in TEST_PAGES:
        result = test_page(page_name)
        results["pages_tested"] += 1
        if result["success"]:
            results["pages_passed"] += 1
        else:
            results["pages_failed"] += 1
        if result.get("has_warnings"):
            results["pages_with_warnings"] += 1
        results["pages"][page_name] = result
    
    # Save results
    json_path = REPORTS_DIR / "test_pages_selenium_results.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n✅ תוצאות נשמרו ל: {json_path}")
    
    # Generate report
    report = []
    report.append("# דוח בדיקות Selenium - כל 17 עמודי הבדיקה\n")
    report.append(f"**תאריך:** {results['timestamp']}\n")
    report.append(f"**סה\"כ עמודים:** {results['total_pages']}\n")
    report.append(f"**עמודים שנבדקו:** {results['pages_tested']}\n")
    report.append(f"**עמודים עברו:** {results['pages_passed']}\n")
    report.append(f"**עמודים נכשלו:** {results['pages_failed']}\n")
    report.append(f"**עמודים עם אזהרות:** {results['pages_with_warnings']}\n\n")
    
    report.append("## פירוט לפי עמוד\n\n")
    
    for page_name, result in results["pages"].items():
        report.append(f"### {page_name}\n")
        if result["success"]:
            report.append("✅ **עבר**\n\n")
        else:
            report.append("❌ **נכשל**\n\n")
            if "error" in result:
                report.append(f"**שגיאה:** {result['error']}\n\n")
        if result.get("has_warnings"):
            report.append("⚠️ **יש אזהרות**\n\n")
        report.append("---\n\n")
    
    report_path = REPORTS_DIR / "TEST_PAGES_SELENIUM_REPORT.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("".join(report))
    print(f"✅ דוח נשמר ל: {report_path}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("סיכום בדיקות Selenium")
    print("=" * 60)
    print(f"עמודים שנבדקו: {results['pages_tested']}/{results['total_pages']}")
    print(f"עמודים עברו: {results['pages_passed']}")
    print(f"עמודים נכשלו: {results['pages_failed']}")
    print(f"עמודים עם אזהרות: {results['pages_with_warnings']}")
    
    if results["pages_failed"] > 0:
        print("\nעמודים שנכשלו:")
        for page_name, result in results["pages"].items():
            if not result["success"]:
                print(f"  ❌ {page_name}")
    
    return 0 if results["pages_failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

