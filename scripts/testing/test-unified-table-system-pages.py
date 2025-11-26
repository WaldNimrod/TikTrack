#!/usr/bin/env python3
"""
סקריפט בדיקה מקיף ל-Unified Table System
Comprehensive Testing Script for Unified Table System

בודק את כל העמודים עם טבלאות ומאמת שהם משתמשים במערכת המרכזית.
"""

import os
import re
import requests
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
from pathlib import Path

# Configuration
BASE_URL = "http://127.0.0.1:8080"
TIMEOUT = 10
PROJECT_ROOT = Path(__file__).parent.parent.parent

# Pages with tables (22 pages)
PAGES_WITH_TABLES = [
    # Central pages
    "trading-ui/index.html",
    "trading-ui/trades.html",
    "trading-ui/trade_plans.html",
    "trading-ui/alerts.html",
    "trading-ui/tickers.html",
    "trading-ui/trading_accounts.html",
    "trading-ui/executions.html",
    "trading-ui/cash_flows.html",
    "trading-ui/notes.html",
    "trading-ui/preferences.html",
    
    # Technical pages
    "trading-ui/db_display.html",
    "trading-ui/db_extradata.html",
    "trading-ui/constraints.html",
    "trading-ui/background-tasks.html",
    "trading-ui/css-management.html",
    "trading-ui/designs.html",
    
    # Mockup pages
    "trading-ui/mockups/daily-snapshots/portfolio-state-page.html",
    "trading-ui/mockups/daily-snapshots/trade-history-page.html",
    "trading-ui/mockups/daily-snapshots/history-widget.html",
    "trading-ui/mockups/daily-snapshots/date-comparison-modal.html",
    "trading-ui/mockups/daily-snapshots/comparative-analysis-page.html",
    "trading-ui/mockups/daily-snapshots/strategy-analysis-page.html",
]


class TableSystemTester:
    def __init__(self):
        self.results = {
            "total_pages": len(PAGES_WITH_TABLES),
            "tested_pages": 0,
            "passed_pages": 0,
            "failed_pages": 0,
            "page_results": [],
            "start_time": datetime.now().isoformat(),
            "errors": []
        }
    
    def check_server_health(self) -> bool:
        """Check if server is running"""
        try:
            response = requests.get(f"{BASE_URL}/", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def load_page_html(self, page_path: str) -> Optional[str]:
        """Load HTML file content"""
        full_path = PROJECT_ROOT / page_path
        if not full_path.exists():
            return None
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()
        except:
            return None
    
    def test_page_tables(self, page_path: str) -> Dict[str, Any]:
        """Test a single page"""
        page_result = {
            "page": page_path,
            "status": "unknown",
            "tables_found": 0,
            "tables_with_data_table_type": 0,
            "issues": [],
            "warnings": [],
            "checks": {}
        }
        
        # Load HTML file
        html_content = self.load_page_html(page_path)
        if not html_content:
            page_result["status"] = "error"
            page_result["issues"].append("File not found")
            return page_result
        
        # Find all tables
        table_pattern = r'<table[^>]*>'
        tables = re.findall(table_pattern, html_content, re.IGNORECASE)
        page_result["tables_found"] = len(tables)
        
        # Check for data-table-type attributes
        data_table_type_pattern = r'data-table-type=["\']([^"\']+)["\']'
        data_table_types = re.findall(data_table_type_pattern, html_content, re.IGNORECASE)
        page_result["tables_with_data_table_type"] = len(data_table_types)
        
        # Check 1: All tables have data-table-type
        if page_result["tables_found"] > 0:
            if page_result["tables_with_data_table_type"] == page_result["tables_found"]:
                page_result["checks"]["all_tables_have_data_table_type"] = "✅ PASS"
            else:
                missing = page_result["tables_found"] - page_result["tables_with_data_table_type"]
                page_result["checks"]["all_tables_have_data_table_type"] = f"❌ FAIL ({missing} missing)"
                page_result["issues"].append(f"{missing} tables missing data-table-type attribute")
        else:
            page_result["checks"]["all_tables_have_data_table_type"] = "⚠️ SKIP (no tables)"
        
        # Check 2: unified-table-system.js is loaded
        if 'unified-table-system.js' in html_content or 'unified-table-system' in html_content:
            page_result["checks"]["unified_table_system_loaded"] = "✅ PASS"
        else:
            page_result["checks"]["unified_table_system_loaded"] = "⚠️ WARNING"
            page_result["warnings"].append("unified-table-system.js might not be loaded")
        
        # Check 3: Check for local table functions that should be replaced
        js_file = page_path.replace('.html', '.js')
        js_path = PROJECT_ROOT / js_file
        if js_path.exists():
            try:
                with open(js_path, 'r', encoding='utf-8') as f:
                    js_content = f.read()
                
                # Check for deprecated patterns
                deprecated_patterns = [
                    (r'function\s+updateTableDisplay\s*\(', 'Local updateTableDisplay() function'),
                    (r'function\s+loadTableDataLocal\s*\(', 'Local loadTableDataLocal() function'),
                    (r'\.innerHTML\s*=\s*["\']<tr', 'Direct innerHTML manipulation for table rows'),
                ]
                
                for pattern, description in deprecated_patterns:
                    if re.search(pattern, js_content):
                        page_result["warnings"].append(f"Possible deprecated pattern: {description}")
                        page_result["checks"][f"deprecated_pattern_{description.replace(' ', '_').lower()}"] = "⚠️ WARNING"
            except:
                pass
        
        # Determine overall status
        if page_result["issues"]:
            page_result["status"] = "failed"
        elif page_result["warnings"]:
            page_result["status"] = "warning"
        else:
            page_result["status"] = "passed"
        
        return page_result
    
    def test_page_accessibility(self, page_path: str) -> Dict[str, Any]:
        """Test page accessibility via HTTP"""
        result = {
            "accessible": False,
            "status_code": None,
            "load_time": None,
            "error": None
        }
        
        url = f"{BASE_URL}/{page_path}"
        start_time = time.time()
        
        try:
            response = requests.get(url, timeout=TIMEOUT)
            result["status_code"] = response.status_code
            result["load_time"] = round(time.time() - start_time, 2)
            result["accessible"] = response.status_code == 200
        except requests.exceptions.Timeout:
            result["error"] = "Timeout"
        except requests.exceptions.ConnectionError:
            result["error"] = "Connection error - server might not be running"
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def run_all_tests(self):
        """Run all tests"""
        print("=" * 80)
        print("🧪 Unified Table System - Comprehensive Testing")
        print("=" * 80)
        print(f"⏰ Start time: {self.results['start_time']}")
        print(f"📋 Testing {self.results['total_pages']} pages with tables")
        print("=" * 80)
        print()
        
        # Check server
        print("🔍 Checking server health...")
        if not self.check_server_health():
            print("⚠️  WARNING: Server might not be running. Accessibility tests will be skipped.")
            print("   Running static file analysis only...")
            print()
        else:
            print("✅ Server is accessible")
            print()
        
        # Test each page
        for i, page_path in enumerate(PAGES_WITH_TABLES, 1):
            print(f"[{i}/{self.results['total_pages']}] Testing: {page_path}")
            
            # Test tables
            table_result = self.test_page_tables(page_path)
            
            # Test accessibility (if server is running)
            if self.check_server_health():
                accessibility_result = self.test_page_accessibility(page_path)
                table_result["accessibility"] = accessibility_result
            
            # Update counters
            self.results["tested_pages"] += 1
            if table_result["status"] == "passed":
                self.results["passed_pages"] += 1
            else:
                self.results["failed_pages"] += 1
            
            self.results["page_results"].append(table_result)
            
            # Print summary
            status_icon = "✅" if table_result["status"] == "passed" else "⚠️" if table_result["status"] == "warning" else "❌"
            print(f"    {status_icon} Status: {table_result['status'].upper()}")
            print(f"    📊 Tables: {table_result['tables_found']} found, {table_result['tables_with_data_table_type']} with data-table-type")
            if table_result["issues"]:
                for issue in table_result["issues"]:
                    print(f"    ❌ Issue: {issue}")
            if table_result["warnings"]:
                for warning in table_result["warnings"]:
                    print(f"    ⚠️  Warning: {warning}")
            print()
        
        # Generate report
        self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        self.results["end_time"] = datetime.now().isoformat()
        
        print("=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        print(f"Total pages tested: {self.results['tested_pages']}")
        print(f"✅ Passed: {self.results['passed_pages']}")
        print(f"❌ Failed: {self.results['failed_pages']}")
        print(f"⚠️  Warnings: {self.results['tested_pages'] - self.results['passed_pages'] - self.results['failed_pages']}")
        print()
        
        # Save report
        report_path = PROJECT_ROOT / "documentation" / "05-REPORTS" / "UNIFIED_TABLE_SYSTEM_TESTING_REPORT.md"
        self.save_markdown_report(report_path)
        
        print(f"📄 Detailed report saved to: {report_path}")
        print("=" * 80)
    
    def save_markdown_report(self, report_path: Path):
        """Save test results as Markdown report"""
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# דוח בדיקות - Unified Table System\n")
            f.write("## Testing Report - Unified Table System\n\n")
            f.write(f"**תאריך:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
            f.write("---\n\n")
            
            # Summary
            f.write("## 📊 סיכום כללי\n\n")
            f.write(f"- **סה\"כ עמודים נבדקים:** {self.results['tested_pages']}\n")
            f.write(f"- **עמודים שעברו:** {self.results['passed_pages']}\n")
            f.write(f"- **עמודים שנכשלו:** {self.results['failed_pages']}\n")
            f.write(f"- **אחוז הצלחה:** {round((self.results['passed_pages'] / self.results['tested_pages'] * 100) if self.results['tested_pages'] > 0 else 0, 1)}%\n\n")
            f.write("---\n\n")
            
            # Detailed results
            f.write("## 📋 תוצאות מפורטות\n\n")
            for result in self.results["page_results"]:
                status_icon = "✅" if result["status"] == "passed" else "⚠️" if result["status"] == "warning" else "❌"
                f.write(f"### {status_icon} {result['page']}\n\n")
                f.write(f"**סטטוס:** {result['status'].upper()}\n\n")
                f.write(f"- **טבלאות שנמצאו:** {result['tables_found']}\n")
                f.write(f"- **טבלאות עם data-table-type:** {result['tables_with_data_table_type']}\n\n")
                
                # Checks
                if result["checks"]:
                    f.write("**בדיקות:**\n")
                    for check, status in result["checks"].items():
                        f.write(f"- {check}: {status}\n")
                    f.write("\n")
                
                # Issues
                if result["issues"]:
                    f.write("**בעיות:**\n")
                    for issue in result["issues"]:
                        f.write(f"- ❌ {issue}\n")
                    f.write("\n")
                
                # Warnings
                if result["warnings"]:
                    f.write("**אזהרות:**\n")
                    for warning in result["warnings"]:
                        f.write(f"- ⚠️  {warning}\n")
                    f.write("\n")
                
                f.write("---\n\n")


def main():
    """Main function"""
    tester = TableSystemTester()
    tester.run_all_tests()
    return 0 if tester.results["failed_pages"] == 0 else 1


if __name__ == "__main__":
    exit(main())

