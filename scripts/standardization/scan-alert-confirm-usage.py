#!/usr/bin/env python3
"""
Scan Alert/Confirm Usage - Comprehensive Script
סריקת שימוש ב-alert/confirm - סקריפט מקיף

מטרה: זיהוי כל השימושים ב-alert() ו-confirm() בקבצי JS
"""

import os
import re
from pathlib import Path
from datetime import datetime
import json

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
SCRIPTS_DIR = TRADING_UI / 'scripts'
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

# Patterns to find
ALERT_PATTERN = re.compile(r'\balert\s*\(', re.IGNORECASE)
CONFIRM_PATTERN = re.compile(r'\bconfirm\s*\(', re.IGNORECASE)

# Patterns to exclude (variable names, comments, strings)
EXCLUDE_PATTERNS = [
    re.compile(r'//.*alert\s*\('),  # Comments
    re.compile(r'/\*.*alert\s*\(.*\*/', re.DOTALL),  # Block comments
    re.compile(r'["\'].*alert\s*\(["\']'),  # Strings
    re.compile(r'`.*alert\s*\(.*`', re.DOTALL),  # Template strings
    re.compile(r'const\s+\w*alert\w*\s*='),  # Variable declarations
    re.compile(r'let\s+\w*alert\w*\s*='),
    re.compile(r'var\s+\w*alert\w*\s*='),
    re.compile(r'function\s+\w*alert\w*\s*\('),  # Function names
    re.compile(r'\.\w*alert\w*\s*='),  # Object properties
]

def is_excluded(line, line_num, file_path):
    """Check if line should be excluded"""
    for pattern in EXCLUDE_PATTERNS:
        if pattern.search(line):
            return True
    return False

def find_alert_confirm_usage(file_path):
    """Find all alert/confirm usage in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        return {'error': str(e), 'alerts': [], 'confirms': []}
    
    alerts = []
    confirms = []
    
    for line_num, line in enumerate(lines, 1):
        # Check for alert
        if ALERT_PATTERN.search(line) and not is_excluded(line, line_num, file_path):
            # Extract context (3 lines before and after)
            start = max(0, line_num - 4)
            end = min(len(lines), line_num + 3)
            context = '\n'.join(lines[start:end])
            
            alerts.append({
                'line': line_num,
                'content': line.strip(),
                'context': context
            })
        
        # Check for confirm
        if CONFIRM_PATTERN.search(line) and not is_excluded(line, line_num, file_path):
            start = max(0, line_num - 4)
            end = min(len(lines), line_num + 3)
            context = '\n'.join(lines[start:end])
            
            confirms.append({
                'line': line_num,
                'content': line.strip(),
                'context': context
            })
    
    return {
        'alerts': alerts,
        'confirms': confirms,
        'total': len(alerts) + len(confirms)
    }

def scan_all_files():
    """Scan all JS files in trading-ui/scripts"""
    results = {}
    total_alerts = 0
    total_confirms = 0
    
    # Exclude patterns
    exclude_dirs = {'test', 'old', 'archive', 'backup', 'vendor', 'node_modules'}
    exclude_files = {'.backup', '.bak', '.old'}
    
    for js_file in SCRIPTS_DIR.rglob('*.js'):
        # Skip excluded directories
        if any(excluded in str(js_file) for excluded in exclude_dirs):
            continue
        
        # Skip excluded files
        if any(excluded in js_file.name for excluded in exclude_files):
            continue
        
        relative_path = js_file.relative_to(SCRIPTS_DIR)
        usage = find_alert_confirm_usage(js_file)
        
        if usage.get('total', 0) > 0:
            results[str(relative_path)] = usage
            total_alerts += len(usage.get('alerts', []))
            total_confirms += len(usage.get('confirms', []))
    
    return results, total_alerts, total_confirms

def generate_report(results, total_alerts, total_confirms):
    """Generate markdown report"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    report = f"""# דוח סריקת Alert/Confirm Usage
## Alert/Confirm Usage Scan Report

**תאריך יצירה:** {timestamp}  
**מטרה:** זיהוי כל השימושים ב-`alert()` ו-`confirm()` בקבצי JS

---

## 📊 סיכום כללי

- **סה\"כ קבצים עם alert/confirm:** {len(results)}
- **סה\"כ מופעי alert():** {total_alerts}
- **סה\"כ מופעי confirm():** {total_confirms}
- **סה\"כ מופעים:** {total_alerts + total_confirms}

---

## 📁 קבצים עם שימושים

"""
    
    # Sort by total usage (descending)
    sorted_files = sorted(results.items(), key=lambda x: x[1].get('total', 0), reverse=True)
    
    for file_path, usage in sorted_files:
        alerts = usage.get('alerts', [])
        confirms = usage.get('confirms', [])
        total = usage.get('total', 0)
        
        report += f"### {file_path}\n\n"
        report += f"**סה\"כ מופעים:** {total} (alert: {len(alerts)}, confirm: {len(confirms)})\n\n"
        
        if alerts:
            report += "#### Alert() Usage:\n\n"
            for alert in alerts:
                report += f"- **שורה {alert['line']}:**\n"
                report += f"  ```javascript\n"
                report += f"  {alert['content']}\n"
                report += f"  ```\n"
                report += f"  **הקשר:**\n"
                report += f"  ```javascript\n"
                report += f"  {alert['context']}\n"
                report += f"  ```\n\n"
        
        if confirms:
            report += "#### Confirm() Usage:\n\n"
            for confirm in confirms:
                report += f"- **שורה {confirm['line']}:**\n"
                report += f"  ```javascript\n"
                report += f"  {confirm['content']}\n"
                report += f"  ```\n"
                report += f"  **הקשר:**\n"
                report += f"  ```javascript\n"
                report += f"  {confirm['context']}\n"
                report += f"  ```\n\n"
        
        report += "---\n\n"
    
    return report

def main():
    """Main function"""
    print("🔍 Scanning for alert/confirm usage...")
    
    results, total_alerts, total_confirms = scan_all_files()
    
    print(f"✅ Found {len(results)} files with alert/confirm usage")
    print(f"   - Total alerts: {total_alerts}")
    print(f"   - Total confirms: {total_confirms}")
    
    # Generate report
    report = generate_report(results, total_alerts, total_confirms)
    
    # Save report
    report_file = DOCS_DIR / 'ALERT_CONFIRM_SCAN_REPORT.md'
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"📄 Report saved to: {report_file}")
    
    # Save JSON for programmatic access
    json_file = DOCS_DIR / 'ALERT_CONFIRM_SCAN_RESULTS.json'
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_files': len(results),
            'total_alerts': total_alerts,
            'total_confirms': total_confirms,
            'results': results
        }, f, indent=2, ensure_ascii=False)
    
    print(f"📊 JSON results saved to: {json_file}")

if __name__ == '__main__':
    main()

