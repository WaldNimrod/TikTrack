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

