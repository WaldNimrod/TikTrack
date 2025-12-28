#!/usr/bin/env python3
"""
הרצת בדיקות Selenium על כל עמודי הבדיקה
Run Selenium tests on all test pages

בודק:
- שגיאות JavaScript
- טעינת CSS/JS
- אתחול מערכות
- זמן טעינה
"""

import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent.parent
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
    "scripts/test-user-ticker-frontend.html",
]

REPORTS_DIR = BASE_DIR / "documentation" / "03-DEVELOPMENT" / "TESTING"


def test_page(page_name):
    """Test a single page"""
    print(f"\n📄 Testing: {page_name}...")
    
    try:
        # Run Selenium test
        result = subprocess.run(
            [sys.executable, str(BASE_DIR / "scripts" / "test_pages_console_errors.py"),
             "--page", page_name],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            # Check output for errors
            output = result.stdout + result.stderr
            has_errors = "❌" in output or "error" in output.lower()
            return {
                "page": page_name,
                "success": not has_errors,
                "output": output[-500:] if len(output) > 500 else output
            }
        else:
            return {
                "page": page_name,
                "success": False,
                "error": result.stderr[-500:] if result.stderr else "Unknown error"
            }
    except subprocess.TimeoutExpired:
        return {
            "page": page_name,
            "success": False,
            "error": "Timeout"
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
    print("בדיקות Selenium - כל עמודי הבדיקה")
    print("=" * 60)
    
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_pages": len(TEST_PAGES),
        "pages_tested": 0,
        "pages_passed": 0,
        "pages_failed": 0,
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
        results["pages"][page_name] = result
    
    # Save results
    json_path = REPORTS_DIR / "test_pages_selenium_validation.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n✅ תוצאות נשמרו ל: {json_path}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("סיכום בדיקות Selenium")
    print("=" * 60)
    print(f"עמודים שנבדקו: {results['pages_tested']}/{results['total_pages']}")
    print(f"עמודים עברו: {results['pages_passed']}")
    print(f"עמודים נכשלו: {results['pages_failed']}")
    
    # List failed pages
    if results["pages_failed"] > 0:
        print("\nעמודים שנכשלו:")
        for page_name, result in results["pages"].items():
            if not result["success"]:
                print(f"  ❌ {page_name}")
                if "error" in result:
                    print(f"     שגיאה: {result['error']}")
    
    return 0 if results["pages_failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

