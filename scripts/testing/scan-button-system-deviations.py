#!/usr/bin/env python3
"""
סקריפט סריקה - Button System Standardization
Scan Script for Button System Deviations

סורק את כל העמודים במערכת ומזהה סטיות מהסטנדרט של Button System.
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


class ButtonSystemScanner:
    def __init__(self):
        self.results = {
            "total_pages": len(PAGES),
            "scanned_pages": 0,
            "pages_with_deviations": 0,
            "total_deviations": 0,
            "deviations_by_type": {
                "onclick_direct": 0,
                "missing_data_button_type": 0,
                "local_button_functions": 0,
                "html_button_creation": 0,
                "missing_data_onclick": 0
            },
            "page_results": [],
            "start_time": datetime.now().isoformat()
        }
    
    def scan_page(self, page_path: str) -> Dict[str, Any]:
        """Scan a single page for button system deviations"""
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
        
        # Find JS file
        js_path = html_path.parent / (html_path.stem + ".js")
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
        if result["js_file"]:
            try:
                with open(js_path, 'r', encoding='utf-8') as f:
                    js_content = f.read()
            except Exception as e:
                result["issues"].append(f"Error reading JS: {e}")
        
        # Scan for deviations
        self.scan_html_deviations(html_content, result, html_path)
        if js_content:
            self.scan_js_deviations(js_content, result, js_path)
        
        return result
    
    def scan_html_deviations(self, content: str, result: Dict, file_path: Path):
        """Scan HTML file for button system deviations"""
        lines = content.split('\n')
        
        # Pattern 1: onclick attribute (should be data-onclick)
        # Only flag if data-onclick doesn't exist in the same tag
        onclick_pattern = r'(?<!data-)onclick\s*=\s*["\']([^"\']*)["\']'
        for i, line in enumerate(lines, 1):
            matches = re.finditer(onclick_pattern, line, re.IGNORECASE)
            for match in matches:
                # Skip if it's inside a comment
                if '<!--' in line[:match.start()] or '-->' in line:
                    continue
                
                # Check if data-onclick exists in the same tag
                # Find the tag boundaries
                tag_start = line.rfind('<', 0, match.start())
                tag_end = line.find('>', match.end())
                if tag_start >= 0 and tag_end > tag_start:
                    tag_content = line[tag_start:tag_end]
                    # Skip if data-onclick already exists in this tag
                    if 'data-onclick' in tag_content.lower():
                        continue
                
                result["deviations"].append({
                    "type": "onclick_direct",
                    "file": str(file_path.name),
                    "line": i,
                    "content": line.strip(),
                    "description": f"שימוש ב-onclick ישיר במקום data-onclick: {match.group(0)}"
                })
                self.results["deviations_by_type"]["onclick_direct"] += 1
        
        # Pattern 2: buttons without data-button-type
        button_pattern = r'<button[^>]*>'
        for i, line in enumerate(lines, 1):
            matches = re.finditer(button_pattern, line, re.IGNORECASE)
            for match in matches:
                button_tag = match.group(0)
                # Skip if it's inside a comment
                if '<!--' in line[:match.start()] or '-->' in line:
                    continue
                # Check if has data-button-type
                if 'data-button-type' not in button_tag.lower():
                    # Skip if it's a button with data-bs-dismiss (modal close) - these are OK
                    if 'data-bs-dismiss' in button_tag.lower():
                        continue
                    # Skip if it's a button with type="submit" or type="button" without onclick - might be form button
                    if 'type="submit' in button_tag.lower():
                        continue
                    result["deviations"].append({
                        "type": "missing_data_button_type",
                        "file": str(file_path.name),
                        "line": i,
                        "content": line.strip(),
                        "description": f"כפתור ללא data-button-type: {button_tag[:50]}..."
                    })
                    self.results["deviations_by_type"]["missing_data_button_type"] += 1
        
        # Pattern 3: buttons with onclick but without data-onclick
        onclick_button_pattern = r'<button[^>]*onclick[^>]*>'
        for i, line in enumerate(lines, 1):
            matches = re.finditer(onclick_button_pattern, line, re.IGNORECASE)
            for match in matches:
                button_tag = match.group(0)
                # Skip if it's inside a comment
                if '<!--' in line[:match.start()] or '-->' in line:
                    continue
                if 'data-onclick' not in button_tag.lower():
                    result["deviations"].append({
                        "type": "missing_data_onclick",
                        "file": str(file_path.name),
                        "line": i,
                        "content": line.strip(),
                        "description": f"כפתור עם onclick ללא data-onclick: {button_tag[:50]}..."
                    })
                    self.results["deviations_by_type"]["missing_data_onclick"] += 1
    
    def scan_js_deviations(self, content: str, result: Dict, file_path: Path):
        """Scan JS file for button system deviations"""
        lines = content.split('\n')
        
        # Pattern 1: Local button creation functions
        button_function_patterns = [
            (r'function\s+createButton\s*\(', 'createButton'),
            (r'function\s+createEditButton\s*\(', 'createEditButton'),
            (r'function\s+createDeleteButton\s*\(', 'createDeleteButton'),
            (r'function\s+createSaveButton\s*\(', 'createSaveButton'),
            (r'function\s+createAddButton\s*\(', 'createAddButton'),
            (r'function\s+createCloseButton\s*\(', 'createCloseButton'),
            (r'\.innerHTML\s*[+\=].*<button', 'innerHTML button creation'),
            (r'\.insertAdjacentHTML.*<button', 'insertAdjacentHTML button creation'),
            (r'document\.createElement\s*\(\s*["\']button["\']', 'createElement button'),
        ]
        
        for pattern, func_name in button_function_patterns:
            for i, line in enumerate(lines, 1):
                if re.search(pattern, line, re.IGNORECASE):
                    # Skip comments
                    if line.strip().startswith('//') or '/*' in line:
                        continue
                    result["duplications"].append({
                        "type": "local_button_function",
                        "function": func_name,
                        "file": str(file_path.name),
                        "line": i,
                        "content": line.strip(),
                        "description": f"פונקציה מקומית ליצירת כפתורים: {func_name}"
                    })
                    self.results["deviations_by_type"]["local_button_functions"] += 1
        
        # Pattern 2: onclick assignment
        onclick_assignment_patterns = [
            (r'\.onclick\s*=', '.onclick assignment'),
            (r'addEventListener\s*\(\s*["\']click["\']', 'addEventListener click'),
        ]
        
        for pattern, desc in onclick_assignment_patterns:
            for i, line in enumerate(lines, 1):
                if re.search(pattern, line, re.IGNORECASE):
                    # Skip if it's for event delegation or Event Handler Manager
                    if 'event-handler-manager' in line.lower() or 'data-onclick' in line.lower():
                        continue
                    # Skip comments
                    if line.strip().startswith('//') or '/*' in line:
                        continue
                    result["deviations"].append({
                        "type": "onclick_direct",
                        "file": str(file_path.name),
                        "line": i,
                        "content": line.strip(),
                        "description": f"שימוש ב-{desc} במקום data-onclick"
                    })
                    self.results["deviations_by_type"]["onclick_direct"] += 1
        
        # Pattern 3: HTML string button creation
        html_button_pattern = r'["\'].*<button[^>]*>.*["\']'
        for i, line in enumerate(lines, 1):
            matches = re.finditer(html_button_pattern, line)
            for match in matches:
                button_html = match.group(0)
                # Skip if it's a template string with data-button-type
                if 'data-button-type' in button_html.lower():
                    continue
                # Skip comments
                if line.strip().startswith('//') or '/*' in line:
                    continue
                result["deviations"].append({
                    "type": "html_button_creation",
                    "file": str(file_path.name),
                    "line": i,
                    "content": line.strip(),
                    "description": f"יצירת כפתור באמצעות HTML string ללא data-button-type"
                })
                self.results["deviations_by_type"]["html_button_creation"] += 1
    
    def scan_all_pages(self):
        """Scan all pages"""
        print("=" * 80)
        print("🔍 Button System - Scanning for Deviations")
        print("=" * 80)
        print(f"📋 Scanning {self.results['total_pages']} pages...")
        print()
        
        for page in PAGES:
            print(f"Scanning: {page}...")
            result = self.scan_page(page)
            self.results["scanned_pages"] += 1
            
            if result["deviations"] or result["duplications"]:
                self.results["pages_with_deviations"] += 1
                self.results["total_deviations"] += len(result["deviations"]) + len(result["duplications"])
            
            self.results["page_results"].append(result)
            print(f"  Found: {len(result['deviations'])} deviations, {len(result['duplications'])} duplications")
        
        self.generate_report()
    
    def generate_report(self):
        """Generate deviation report"""
        self.results["end_time"] = datetime.now().isoformat()
        
        report_path = PROJECT_ROOT / "documentation" / "05-REPORTS" / "BUTTON_SYSTEM_DEVIATIONS_REPORT.md"
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# דוח סטיות - Button System Standardization\n")
            f.write("## Button System Deviations Report\n\n")
            f.write(f"**תאריך יצירה:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
            f.write("---\n\n")
            
            # Summary
            f.write("## 📊 סיכום כללי\n\n")
            f.write(f"- **סה\"כ עמודים נסרקים:** {self.results['scanned_pages']}/{self.results['total_pages']}\n")
            f.write(f"- **עמודים עם סטיות:** {self.results['pages_with_deviations']}\n")
            f.write(f"- **סה\"כ סטיות:** {self.results['total_deviations']}\n\n")
            
            f.write("**סטיות לפי סוג:**\n")
            for dev_type, count in self.results["deviations_by_type"].items():
                f.write(f"- {dev_type}: {count}\n")
            f.write("\n---\n\n")
            
            # Detailed results
            f.write("## 📋 תוצאות מפורטות\n\n")
            for result in self.results["page_results"]:
                if not result["deviations"] and not result["duplications"]:
                    continue
                
                f.write(f"### {result['page']}\n\n")
                f.write(f"**קובץ HTML:** `{result['html_file']}`\n")
                if result["js_file"]:
                    f.write(f"**קובץ JS:** `{result['js_file']}`\n")
                f.write("\n")
                
                # Deviations
                if result["deviations"]:
                    f.write("#### סטיות שנמצאו:\n\n")
                    for i, dev in enumerate(result["deviations"], 1):
                        f.write(f"{i}. **שורה {dev['line']}:** {dev['description']}\n")
                        f.write(f"   ```html\n   {dev['content'][:200]}...\n   ```\n\n")
                
                # Duplications
                if result["duplications"]:
                    f.write("#### כפילויות שנמצאו:\n\n")
                    for i, dup in enumerate(result["duplications"], 1):
                        f.write(f"{i}. **שורה {dup['line']}:** {dup['description']}\n")
                        f.write(f"   ```javascript\n   {dup['content'][:200]}...\n   ```\n\n")
                
                f.write("---\n\n")
        
        print()
        print("=" * 80)
        print("📊 SCAN SUMMARY")
        print("=" * 80)
        print(f"Total pages scanned: {self.results['scanned_pages']}")
        print(f"Pages with deviations: {self.results['pages_with_deviations']}")
        print(f"Total deviations: {self.results['total_deviations']}")
        print()
        print("Deviations by type:")
        for dev_type, count in self.results["deviations_by_type"].items():
            print(f"  - {dev_type}: {count}")
        print()
        print(f"📄 Detailed report saved to: {report_path}")
        print("=" * 80)


def main():
    """Main function"""
    scanner = ButtonSystemScanner()
    scanner.scan_all_pages()
    return 0


if __name__ == "__main__":
    exit(main())

