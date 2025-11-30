#!/usr/bin/env python3
"""
סקריפט סריקה - Entity Details Modal Standardization
Scan Script for Entity Details Modal Deviations

סורק את כל העמודים במערכת ומזהה סטיות מהסטנדרט של Entity Details Modal System.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent.parent
PAGES_ROOT = PROJECT_ROOT / "trading-ui"

# Pages to scan (all 36 pages from UI_STANDARDIZATION_WORK_DOCUMENT.md)
PAGES = [
    # Central pages (11)
    "index.html",
    "trades.html",
    "trade_plans.html",
    "alerts.html",
    "tickers.html",
    "trading_accounts.html",
    "executions.html",
    "cash_flows.html",
    "notes.html",
    "research.html",
    "preferences.html",
    
    # Technical pages (12)
    "db_display.html",
    "db_extradata.html",
    "constraints.html",
    "background-tasks.html",
    "server-monitor.html",
    "system-management.html",
    "cache-test.html",
    "notifications-center.html",
    "css-management.html",
    "dynamic-colors-display.html",
    "designs.html",
    "tradingview-test-page.html",
    
    # Secondary pages (2)
    "external-data-dashboard.html",
    "chart-management.html",
    
    # Mockup pages (11)
    "mockups/daily-snapshots/portfolio-state-page.html",
    "mockups/daily-snapshots/trade-history-page.html",
    "mockups/daily-snapshots/price-history-page.html",
    "mockups/daily-snapshots/comparative-analysis-page.html",
    "mockups/daily-snapshots/trading-journal-page.html",
    "mockups/daily-snapshots/strategy-analysis-page.html",
    "mockups/daily-snapshots/economic-calendar-page.html",
    "mockups/daily-snapshots/history-widget.html",
    "mockups/daily-snapshots/emotional-tracking-widget.html",
    "mockups/daily-snapshots/date-comparison-modal.html",
    "mockups/daily-snapshots/tradingview-test-page.html",
]


class EntityDetailsModalScanner:
    def __init__(self):
        self.results = {
            "total_pages": len(PAGES),
            "scanned_pages": 0,
            "pages_with_deviations": 0,
            "total_deviations": 0,
            "deviations_by_type": {
                "local_entity_details_functions": 0,
                "direct_api_calls": 0,
                "local_modal_creation": 0,
                "wrong_case_EntityDetailsModal": 0,
                "missing_files": 0,
                "inconsistent_usage": 0
            },
            "page_results": [],
            "start_time": datetime.now().isoformat()
        }
    
    def scan_page(self, page_path: str) -> Dict[str, Any]:
        """Scan a single page for entity details modal deviations"""
        result = {
            "page": page_path,
            "html_file": None,
            "js_file": None,
            "deviations": [],
            "duplications": [],
            "issues": []
        }
        
        # Find HTML file
        html_path = PAGES_ROOT / page_path
        if not html_path.exists():
            result["issues"].append("HTML file not found")
            return result
        
        result["html_file"] = str(html_path)
        
        # Find corresponding JS file
        html_name = Path(page_path).stem
        js_file_name = f"{html_name}.js"
        js_path = PAGES_ROOT / "scripts" / js_file_name
        
        if js_path.exists():
            result["js_file"] = str(js_path)
        
        # Read HTML content
        try:
            with open(html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
        except Exception as e:
            result["issues"].append(f"Error reading HTML: {e}")
            return result
        
        # Read JS content if exists
        js_content = ""
        if js_path.exists():
            try:
                with open(js_path, 'r', encoding='utf-8') as f:
                    js_content = f.read()
            except Exception as e:
                result["issues"].append(f"Error reading JS: {e}")
        
        # Scan for deviations
        
        # 1. Check if required files are loaded
        self.check_missing_files(html_content, result)
        
        # 2. Scan for local entity details functions
        self.scan_local_functions(js_content, result)
        
        # 3. Scan for direct API calls
        self.scan_direct_api_calls(js_content, result)
        
        # 4. Scan for local modal creation
        self.scan_local_modal_creation(js_content, html_content, result)
        
        # 5. Scan for wrong case (EntityDetailsModal vs entityDetailsModal)
        self.scan_wrong_case(js_content, result)
        
        # 6. Scan for inconsistent usage
        self.scan_inconsistent_usage(js_content, result)
        
        return result
    
    def check_missing_files(self, html_content: str, result: Dict[str, Any]):
        """Check if required entity-details files are loaded"""
        required_files = [
            "entity-details-modal.js",
            "entity-details-renderer.js",
            "entity-details-api.js"
        ]
        
        for file_name in required_files:
            if file_name not in html_content:
                result["deviations"].append({
                    "type": "missing_files",
                    "severity": "high",
                    "line": None,
                    "description": f"Missing required file: {file_name}",
                    "suggestion": f"Add script tag for {file_name} before page script"
                })
                self.results["deviations_by_type"]["missing_files"] += 1
                self.results["total_deviations"] += 1
    
    def scan_local_functions(self, js_content: str, result: Dict[str, Any]):
        """Scan for local functions that show entity details"""
        # Patterns for local entity details functions
        patterns = [
            (r'function\s+show(\w+Details?)\(', 'showXDetails'),
            (r'function\s+view(\w+Details?)\(', 'viewXDetails'),
            (r'function\s+open(\w+Details?)\(', 'openXDetails'),
            (r'const\s+show(\w+Details?)\s*=', 'const showXDetails'),
            (r'const\s+view(\w+Details?)\s*=', 'const viewXDetails'),
            (r'const\s+open(\w+Details?)\s*=', 'const openXDetails'),
        ]
        
        # Specific known functions that should use showEntityDetails
        known_functions = [
            'showTradingAccountDetails',
            'viewTickerDetails',
            'openTradeDetailsModal',
            'openMovementDetails',
            'showAccountDetails',
            'viewTradeDetails',
            'viewExecutionDetails',
            'showAlertDetails',
            'viewNoteDetails',
            'openEntityDetails'
        ]
        
        # Functions that are NOT entity details functions (false positives)
        # These open ADD modals, not view details modals
        false_positives = [
            'openNoteDetails'  # Opens ADD modal, not view details
        ]
        
        lines = js_content.split('\n')
        
        # Check for known functions
        for func_name in known_functions:
            for i, line in enumerate(lines, 1):
                # Check for function definition (but skip if it's just calling showEntityDetails)
                if re.search(rf'\b{func_name}\s*[=:]', line):
                    # Check if the function actually uses showEntityDetails internally
                    # We'll do a simple check - if it contains showEntityDetails, it's a wrapper (less critical)
                    func_match = re.search(rf'{func_name}\s*[=:]\s*function|{func_name}\s*[=:]\s*\(', line)
                    if func_match:
                        # Find the function body
                        func_body = self.get_function_body(js_content, func_match.start())
                        if 'showEntityDetails' not in func_body:
                            result["deviations"].append({
                                "type": "local_entity_details_functions",
                                "severity": "high",
                                "line": i,
                                "description": f"Local function '{func_name}' should use showEntityDetails()",
                                "code": line.strip()[:100],
                                "suggestion": f"Replace with direct call to showEntityDetails() or update to use showEntityDetails() internally"
                            })
                            self.results["deviations_by_type"]["local_entity_details_functions"] += 1
                            self.results["total_deviations"] += 1
        
        # Check for pattern-based functions
        for pattern, pattern_name in patterns:
            matches = re.finditer(pattern, js_content, re.MULTILINE)
            for match in matches:
                func_name = match.group(0)
                # Extract just the function name (without "function " prefix)
                func_name_clean = re.sub(r'^(function|const)\s+', '', func_name).split('(')[0].strip()
                
                # Skip false positives
                if func_name_clean in false_positives:
                    continue
                
                # Get line number
                line_num = js_content[:match.start()].count('\n') + 1
                
                # Get function body to check if it uses showEntityDetails or opens ADD modal
                func_body = self.get_function_body(js_content, match.start())
                
                # Skip if it opens ADD modal (not view details)
                if re.search(r"showModal\([^,]+,\s*['\"]add['\"]", func_body):
                    continue
                
                if func_name_clean not in known_functions and 'showEntityDetails' not in func_body:
                    result["deviations"].append({
                        "type": "local_entity_details_functions",
                        "severity": "medium",
                        "line": line_num,
                        "description": f"Found pattern '{pattern_name}': {func_name}",
                        "code": match.group(0),
                        "suggestion": "Review if this should use showEntityDetails()"
                    })
                    self.results["deviations_by_type"]["local_entity_details_functions"] += 1
                    self.results["total_deviations"] += 1
    
    def get_function_body(self, content: str, start_pos: int) -> str:
        """Extract function body (simplified - just get next 500 chars)"""
        end_pos = min(start_pos + 500, len(content))
        return content[start_pos:end_pos]
    
    def scan_direct_api_calls(self, js_content: str, result: Dict[str, Any]):
        """Scan for direct API calls to /api/entity-details"""
        pattern = r'/api/entity-details[^\s\'"]*'
        matches = re.finditer(pattern, js_content)
        
        lines = js_content.split('\n')
        
        for match in matches:
            line_num = js_content[:match.start()].count('\n') + 1
            line = lines[line_num - 1] if line_num <= len(lines) else ""
            
            # Skip if it's in entity-details-api.js itself
            if 'entity-details-api.js' in result.get('js_file', ''):
                continue
            
            result["deviations"].append({
                "type": "direct_api_calls",
                "severity": "high",
                "line": line_num,
                "description": "Direct API call to /api/entity-details instead of using showEntityDetails()",
                "code": line.strip()[:150],
                "suggestion": "Use showEntityDetails() instead of direct API call"
            })
            self.results["deviations_by_type"]["direct_api_calls"] += 1
            self.results["total_deviations"] += 1
    
    def scan_local_modal_creation(self, js_content: str, html_content: str, result: Dict[str, Any]):
        """Scan for local modal creation for entity details"""
        # Patterns for modal creation
        patterns = [
            r'new.*Modal.*entity|new.*Modal.*Entity',
            r'Bootstrap\.Modal.*entity|Bootstrap\.Modal.*Entity',
            r'createModal.*entity|createModal.*Entity',
        ]
        
        lines = js_content.split('\n')
        
        for pattern in patterns:
            matches = re.finditer(pattern, js_content, re.IGNORECASE)
            for match in matches:
                line_num = js_content[:match.start()].count('\n') + 1
                line = lines[line_num - 1] if line_num <= len(lines) else ""
                
                # Skip if it's in entity-details-modal.js itself
                if 'entity-details-modal.js' in result.get('js_file', ''):
                    continue
                
                result["deviations"].append({
                    "type": "local_modal_creation",
                    "severity": "high",
                    "line": line_num,
                    "description": "Local modal creation for entity details",
                    "code": line.strip()[:150],
                    "suggestion": "Use showEntityDetails() instead of creating local modal"
                })
                self.results["deviations_by_type"]["local_modal_creation"] += 1
                self.results["total_deviations"] += 1
    
    def scan_wrong_case(self, js_content: str, result: Dict[str, Any]):
        """Scan for EntityDetailsModal (wrong case) instead of entityDetailsModal"""
        pattern = r'\bEntityDetailsModal\b'
        matches = re.finditer(pattern, js_content)
        
        lines = js_content.split('\n')
        
        for match in matches:
            line_num = js_content[:match.start()].count('\n') + 1
            line = lines[line_num - 1] if line_num <= len(lines) else ""
            
            # Skip if it's a class definition
            if 'class EntityDetailsModal' in line or 'EntityDetailsModal' in line and 'class' in line:
                continue
            
            result["deviations"].append({
                "type": "wrong_case_EntityDetailsModal",
                "severity": "medium",
                "line": line_num,
                "description": "Using EntityDetailsModal (wrong case) instead of entityDetailsModal or showEntityDetails()",
                "code": line.strip()[:150],
                "suggestion": "Use showEntityDetails() or window.entityDetailsModal (lowercase 'e')"
            })
            self.results["deviations_by_type"]["wrong_case_EntityDetailsModal"] += 1
            self.results["total_deviations"] += 1
    
    def scan_inconsistent_usage(self, js_content: str, result: Dict[str, Any]):
        """Scan for inconsistent usage (window.entityDetailsModal.show vs showEntityDetails)"""
        # Prefer showEntityDetails() over window.entityDetailsModal.show()
        pattern = r'window\.entityDetailsModal\.show\s*\('
        matches = re.finditer(pattern, js_content)
        
        lines = js_content.split('\n')
        
        for match in matches:
            line_num = js_content[:match.start()].count('\n') + 1
            line = lines[line_num - 1] if line_num <= len(lines) else ""
            
            # Skip if it's in entity-details-modal.js itself (internal usage)
            if 'entity-details-modal.js' in result.get('js_file', ''):
                continue
            
            result["deviations"].append({
                "type": "inconsistent_usage",
                "severity": "low",
                "line": line_num,
                "description": "Using window.entityDetailsModal.show() instead of showEntityDetails()",
                "code": line.strip()[:150],
                "suggestion": "Use showEntityDetails() for consistency"
            })
            self.results["deviations_by_type"]["inconsistent_usage"] += 1
            self.results["total_deviations"] += 1
    
    def scan_all_pages(self):
        """Scan all pages"""
        print("=" * 80)
        print("Entity Details Modal Deviations Scanner")
        print("=" * 80)
        print(f"Scanning {len(PAGES)} pages...")
        print()
        
        for page_path in PAGES:
            print(f"Scanning: {page_path}...")
            result = self.scan_page(page_path)
            
            if result["deviations"]:
                self.results["pages_with_deviations"] += 1
            
            self.results["page_results"].append(result)
            self.results["scanned_pages"] += 1
        
        self.results["end_time"] = datetime.now().isoformat()
    
    def generate_report(self) -> str:
        """Generate markdown report"""
        report = f"""# דוח סטיות - Entity Details Modal Standardization
## Entity Details Modal Deviations Report

**תאריך יצירה:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
**סה"כ עמודים נסרקים:** {self.results["scanned_pages"]}/{self.results["total_pages"]}
**עמודים עם סטיות:** {self.results["pages_with_deviations"]}
**סה"כ סטיות:** {self.results["total_deviations"]}

---

## סיכום לפי סוג סטייה

"""
        
        for deviation_type, count in self.results["deviations_by_type"].items():
            if count > 0:
                report += f"- **{deviation_type}:** {count}\n"
        
        report += "\n---\n\n## פירוט לפי עמוד\n\n"
        
        for page_result in self.results["page_results"]:
            if not page_result["deviations"]:
                continue
            
            report += f"### {page_result['page']}\n\n"
            report += f"**קובץ HTML:** `{page_result.get('html_file', 'N/A')}`\n\n"
            
            if page_result.get('js_file'):
                report += f"**קובץ JS:** `{page_result.get('js_file', 'N/A')}`\n\n"
            
            report += "#### סטיות שנמצאו:\n\n"
            
            for i, deviation in enumerate(page_result["deviations"], 1):
                report += f"{i}. **שורה {deviation.get('line', 'N/A')}:** {deviation['description']}\n"
                report += f"   - חומרה: {deviation.get('severity', 'N/A')}\n"
                if deviation.get('code'):
                    report += f"   ```javascript\n   {deviation['code']}\n   ```\n"
                if deviation.get('suggestion'):
                    report += f"   - הצעה: {deviation['suggestion']}\n"
                report += "\n"
            
            report += "---\n\n"
        
        if self.results["pages_with_deviations"] == 0:
            report += "✅ לא נמצאו סטיות!\n"
        
        return report


def main():
    scanner = EntityDetailsModalScanner()
    scanner.scan_all_pages()
    
    # Generate report
    report = scanner.generate_report()
    
    # Save report
    report_path = PROJECT_ROOT / "documentation" / "05-REPORTS" / "ENTITY_DETAILS_MODAL_DEVIATIONS_REPORT.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("=" * 80)
    print("📊 SCAN SUMMARY")
    print("=" * 80)
    print(f"Total pages scanned: {scanner.results['scanned_pages']}")
    print(f"Pages with deviations: {scanner.results['pages_with_deviations']}")
    print(f"Total deviations: {scanner.results['total_deviations']}")
    print()
    print("Deviations by type:")
    for deviation_type, count in scanner.results["deviations_by_type"].items():
        if count > 0:
            print(f"  - {deviation_type}: {count}")
    print()
    print(f"📄 Detailed report saved to: {report_path}")
    print("=" * 80)


if __name__ == "__main__":
    main()

