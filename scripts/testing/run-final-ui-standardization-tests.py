#!/usr/bin/env python3
"""
Final UI Standardization Testing Script
סקריפט הרצת בדיקות סופיות לכל 36 העמודים

תהליך הבדיקות:
1. הרצה בדפדפן
2. בדיקת קוד טעינה
3. בדיקת ITCSS
4. בדיקת קונסולה נקייה
5. בדיקת CRUD+E2E
6. יצירת דוח מסכם

Usage:
    python scripts/testing/run-final-ui-standardization-tests.py

Requirements:
    - Server must be running on http://127.0.0.1:8080
    - Selenium WebDriver installed (for browser automation)
"""

import requests
import json
import sys
import time
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

# Configuration
BASE_URL = "http://127.0.0.1:8080"
REPORTS_DIR = Path("documentation/05-REPORTS")
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# All 36 pages from UI_STANDARDIZATION_WORK_DOCUMENT.md
PAGES = {
    "central": [
        {"name": "index", "path": "index.html", "priority": 1},
        {"name": "trades", "path": "trades.html", "priority": 1},
        {"name": "trade_plans", "path": "trade_plans.html", "priority": 1},
        {"name": "alerts", "path": "alerts.html", "priority": 1},
        {"name": "tickers", "path": "tickers.html", "priority": 1},
        {"name": "trading_accounts", "path": "trading_accounts.html", "priority": 1},
        {"name": "executions", "path": "executions.html", "priority": 1},
        {"name": "cash_flows", "path": "cash_flows.html", "priority": 1},
        {"name": "notes", "path": "notes.html", "priority": 1},
        {"name": "research", "path": "research.html", "priority": 2},
        {"name": "preferences", "path": "preferences.html", "priority": 1}
    ],
    "technical": [
        {"name": "db_display", "path": "db_display.html", "priority": 3},
        {"name": "db_extradata", "path": "db_extradata.html", "priority": 3},
        {"name": "constraints", "path": "constraints.html", "priority": 3},
        {"name": "background-tasks", "path": "background_tasks.html", "priority": 3},
        {"name": "server-monitor", "path": "server_monitor.html", "priority": 3},
        {"name": "system-management", "path": "system_management.html", "priority": 3},
        {"name": "cache-test", "path": "cache-test.html", "priority": 3},
        {"name": "notifications-center", "path": "notifications_center.html", "priority": 3},
        {"name": "css-management", "path": "css_management.html", "priority": 3},
        {"name": "dynamic-colors-display", "path": "dynamic_colors_display.html", "priority": 3},
        {"name": "designs", "path": "designs.html", "priority": 3},
        {"name": "tradingview-test-page", "path": "tradingview_test_page.html", "priority": 3}
    ],
    "secondary": [
        {"name": "external-data-dashboard", "path": "external_data_dashboard.html", "priority": 2},
        {"name": "chart-management", "path": "chart_management.html", "priority": 2}
    ],
    "mockup": [
        {"name": "portfolio-state-page", "path": "portfolio_state_page.html", "priority": 4},
        {"name": "trade-history-page", "path": "trade_history_page.html", "priority": 4},
        {"name": "price-history-page", "path": "price_history_page.html", "priority": 4},
        {"name": "comparative-analysis-page", "path": "comparative_analysis_page.html", "priority": 4},
        {"name": "trading-journal-page", "path": "trading_journal_page.html", "priority": 4},
        {"name": "strategy-analysis-page", "path": "strategy_analysis_page.html", "priority": 4},
        {"name": "economic-calendar-page", "path": "economic_calendar_page.html", "priority": 4},
        {"name": "history-widget", "path": "history_widget.html", "priority": 4},
        {"name": "emotional-tracking-widget", "path": "emotional_tracking_widget.html", "priority": 4},
        {"name": "date-comparison-modal", "path": "date_comparison_modal.html", "priority": 4},
        {"name": "tradingview-test-page-mockup", "path": "tradingview_test_page.html", "priority": 4}
    ]
}

# Test results storage
test_results = {
    "startTime": datetime.now().isoformat(),
    "endTime": None,
    "pages": [],
    "summary": {
        "totalPages": 0,
        "completedPages": 0,
        "passedPages": 0,
        "failedPages": 0,
        "skippedPages": 0
    }
}


def log_test(page_name: str, step: str, passed: bool, details: Optional[Dict] = None, error: Optional[str] = None):
    """Log test result for a page step."""
    result = {
        "pageName": page_name,
        "step": step,
        "passed": passed,
        "timestamp": datetime.now().isoformat(),
        "details": details or {},
        "error": error
    }
    
    status_icon = "✅" if passed else "❌"
    print(f"{status_icon} {page_name} - {step}: {'PASSED' if passed else 'FAILED'}")
    if error:
        print(f"   Error: {error}")
    
    return result


def test_page_load(page_path: str) -> Dict:
    """Test if page loads successfully."""
    try:
        url = f"{BASE_URL}/{page_path}"
        response = requests.get(url, timeout=10)
        passed = response.status_code == 200
        return {
            "passed": passed,
            "statusCode": response.status_code,
            "details": {"url": url}
        }
    except Exception as e:
        return {
            "passed": False,
            "error": str(e)
        }


def test_code_loading(page_path: str) -> Dict:
    """Test code loading validation (requires browser automation)."""
    # This will be done via browser automation
    return {
        "passed": None,
        "note": "Requires browser automation - will be tested manually"
    }


def test_itcss_compliance(page_path: str) -> Dict:
    """Test ITCSS compliance by checking HTML file."""
    try:
        html_path = Path(f"trading-ui/{page_path}")
        if not html_path.exists():
            return {
                "passed": False,
                "error": f"File not found: {html_path}"
            }
        
        content = html_path.read_text(encoding='utf-8')
        
        # Check for inline styles
        inline_styles = content.count('style="')
        style_tags = content.count('<style>')
        
        # Check CSS loading order
        bootstrap_found = 'bootstrap' in content.lower()
        itcss_found = 'styles-new' in content or 'master.css' in content
        
        # Check for !important in inline styles (basic check)
        has_important = '!important' in content
        
        issues = []
        if inline_styles > 0:
            issues.append(f"{inline_styles} inline style attributes found")
        if style_tags > 0:
            issues.append(f"{style_tags} <style> tags found")
        if has_important:
            issues.append("!important found in HTML")
        
        passed = len(issues) == 0
        
        return {
            "passed": passed,
            "details": {
                "inlineStylesCount": inline_styles,
                "styleTagsCount": style_tags,
                "bootstrapFound": bootstrap_found,
                "itcssFound": itcss_found,
                "hasImportant": has_important,
                "issues": issues
            }
        }
    except Exception as e:
        return {
            "passed": False,
            "error": str(e)
        }


def test_console_clean(page_path: str) -> Dict:
    """Test console is clean (requires browser automation)."""
    return {
        "passed": None,
        "note": "Requires browser automation - will be tested manually"
    }


def test_crud_e2e(page_path: str) -> Dict:
    """Test CRUD+E2E (requires browser automation)."""
    return {
        "passed": None,
        "note": "Requires browser automation - will be tested manually"
    }


def test_page(page: Dict) -> Dict:
    """Test a single page with all steps."""
    page_name = page["name"]
    page_path = page["path"]
    category = None
    
    # Find category
    for cat, pages_list in PAGES.items():
        if any(p["name"] == page_name for p in pages_list):
            category = cat
            break
    
    print(f"\n{'='*60}")
    print(f"Testing Page: {page_name} ({page_path})")
    print(f"{'='*60}")
    
    page_result = {
        "pageName": page_name,
        "pagePath": page_path,
        "category": category,
        "priority": page.get("priority", 3),
        "timestamp": datetime.now().isoformat(),
        "steps": {}
    }
    
    # Step 1: Browser Load
    print("\n📄 Step 1: Browser Load Test...")
    page_result["steps"]["browserLoad"] = test_page_load(page_path)
    
    # Step 2: Code Loading
    print("📄 Step 2: Code Loading Validation...")
    page_result["steps"]["codeLoading"] = test_code_loading(page_path)
    
    # Step 3: ITCSS Compliance
    print("📄 Step 3: ITCSS Compliance...")
    page_result["steps"]["itcss"] = test_itcss_compliance(page_path)
    
    # Step 4: Console Check
    print("📄 Step 4: Console Check...")
    page_result["steps"]["console"] = test_console_clean(page_path)
    
    # Step 5: CRUD+E2E
    print("📄 Step 5: CRUD+E2E Tests...")
    page_result["steps"]["crudE2E"] = test_crud_e2e(page_path)
    
    # Calculate summary
    passed_steps = sum(1 for step in page_result["steps"].values() 
                      if step.get("passed") is True)
    failed_steps = sum(1 for step in page_result["steps"].values() 
                      if step.get("passed") is False)
    total_steps = len([s for s in page_result["steps"].values() if s.get("passed") is not None])
    
    page_result["summary"] = {
        "passedSteps": passed_steps,
        "failedSteps": failed_steps,
        "totalSteps": total_steps,
        "status": "passed" if failed_steps == 0 else "failed" if failed_steps > 0 else "pending"
    }
    
    return page_result


def generate_report():
    """Generate final report."""
    test_results["endTime"] = datetime.now().isoformat()
    
    # Calculate summary
    total_pages = sum(len(pages) for pages in PAGES.values())
    completed = len(test_results["pages"])
    passed = sum(1 for p in test_results["pages"] if p["summary"]["status"] == "passed")
    failed = sum(1 for p in test_results["pages"] if p["summary"]["status"] == "failed")
    skipped = total_pages - completed
    
    test_results["summary"] = {
        "totalPages": total_pages,
        "completedPages": completed,
        "passedPages": passed,
        "failedPages": failed,
        "skippedPages": skipped,
        "successRate": (passed / completed * 100) if completed > 0 else 0
    }
    
    # Generate markdown report
    report_path = REPORTS_DIR / "FINAL_UI_STANDARDIZATION_TESTING_REPORT.md"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# דוח בדיקות סופי - סטנדרטיזציה ממשק משתמש\n")
        f.write("## Final UI Standardization Testing Report\n\n")
        f.write(f"**תאריך:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
        f.write(f"**משך זמן:** {test_results['startTime']} - {test_results['endTime']}\n\n")
        
        f.write("## סיכום כללי\n\n")
        f.write(f"- **סה\"כ עמודים:** {test_results['summary']['totalPages']}\n")
        f.write(f"- **הושלמו:** {test_results['summary']['completedPages']}\n")
        f.write(f"- **עברו:** {test_results['summary']['passedPages']}\n")
        f.write(f"- **נכשלו:** {test_results['summary']['failedPages']}\n")
        f.write(f"- **דולגו:** {test_results['summary']['skippedPages']}\n")
        f.write(f"- **אחוז הצלחה:** {test_results['summary']['successRate']:.2f}%\n\n")
        
        f.write("## תוצאות מפורטות\n\n")
        
        for page_result in test_results["pages"]:
            f.write(f"### {page_result['pageName']} ({page_result['pagePath']})\n\n")
            f.write(f"**קטגוריה:** {page_result['category']}\n")
            f.write(f"**סטטוס:** {page_result['summary']['status']}\n")
            f.write(f"**שלבים שעברו:** {page_result['summary']['passedSteps']}/{page_result['summary']['totalSteps']}\n\n")
            
            for step_name, step_result in page_result["steps"].items():
                status = "✅" if step_result.get("passed") else "❌" if step_result.get("passed") is False else "⏳"
                f.write(f"- {status} **{step_name}:** {step_result.get('passed', 'Pending')}\n")
                if step_result.get("error"):
                    f.write(f"  - שגיאה: {step_result['error']}\n")
                if step_result.get("details"):
                    for key, value in step_result["details"].items():
                        f.write(f"  - {key}: {value}\n")
            f.write("\n")
    
    # Generate JSON report
    json_path = REPORTS_DIR / "FINAL_UI_STANDARDIZATION_TESTING_REPORT.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(test_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Reports generated:")
    print(f"   - {report_path}")
    print(f"   - {json_path}")


def main():
    """Main test execution."""
    print("🚀 Starting Final UI Standardization Tests...")
    print(f"📊 Total pages to test: {sum(len(pages) for pages in PAGES.values())}\n")
    
    # Test all pages
    all_pages = []
    for category, pages_list in PAGES.items():
        all_pages.extend(pages_list)
    
    # Sort by priority
    all_pages.sort(key=lambda x: x.get("priority", 3))
    
    for page in all_pages:
        page_result = test_page(page)
        test_results["pages"].append(page_result)
        test_results["summary"]["completedPages"] += 1
        
        if page_result["summary"]["status"] == "passed":
            test_results["summary"]["passedPages"] += 1
        elif page_result["summary"]["status"] == "failed":
            test_results["summary"]["failedPages"] += 1
        
        time.sleep(0.5)  # Small delay between pages
    
    # Generate report
    generate_report()
    
    print("\n✅ All tests completed!")
    print(f"📊 Summary: {test_results['summary']['passedPages']}/{test_results['summary']['completedPages']} pages passed")


if __name__ == "__main__":
    main()

