#!/usr/bin/env python3
"""
Script to scan remaining pages for common patterns
Scans all incomplete pages and identifies common patterns for horizontal fixes
"""

import re
import os
import json
from collections import defaultdict
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent.parent
TRADING_UI_DIR = BASE_DIR / 'trading-ui'
SCRIPTS_DIR = TRADING_UI_DIR / 'scripts'

# List of incomplete pages JS files
INCOMPLETE_PAGES_JS = [
    'index.js',
    'tickers.js',
    'trading_accounts.js',
    'cash_flows.js',
    'research.js',
    'preferences.js',
    'user-profile.js',
    'db_display.js',
    'db_extradata.js',
    'constraints.js',
    'background-tasks.js',
    'server-monitor.js',
    'system-management.js',
    'notifications-center.js',
    'css-management.js',
    'dynamic-colors-display.js',
    'tradingview-test-page.js',
    'external-data-dashboard.js',
    'chart-management.js',
    'portfolio-state-page.js',
    'trade-history-page.js',
    'comparative-analysis-page.js',
    'trading-journal-page.js',
    'strategy-analysis-page.js',
    'economic-calendar-page.js',
    'history-widget.js',
    'date-comparison-modal.js',
]

# List of incomplete pages HTML files
INCOMPLETE_PAGES_HTML = [
    'index.html',
    'tickers.html',
    'trading_accounts.html',
    'cash_flows.html',
    'research.html',
    'preferences.html',
    'user-profile.html',
    'db_display.html',
    'db_extradata.html',
    'constraints.html',
    'background-tasks.html',
    'server-monitor.html',
    'system-management.html',
    'notifications-center.html',
    'css-management.html',
    'dynamic-colors-display.html',
    'designs.html',
    'tradingview-test-page.html',
    'external-data-dashboard.html',
    'chart-management.html',
    'portfolio-state-page.html',
    'trade-history-page.html',
    'comparative-analysis-page.html',
    'trading-journal-page.html',
    'strategy-analysis-page.html',
    'economic-calendar-page.html',
    'history-widget.html',
    'emotional-tracking-widget.html',
    'date-comparison-modal.html',
]

# Patterns to scan
JS_PATTERNS = {
    'innerHTML': r'\.innerHTML\s*=',
    'console': r'console\.(log|error|warn|info|debug)',
    'alert_confirm': r'(alert|confirm)\(',
    'localStorage': r'localStorage\.(getItem|setItem|removeItem)',
    'bootstrap_modal': r'(bootstrap\.Modal|new bootstrap\.Modal)',
    'querySelector_value': r'(querySelector|getElementById).*\.value',
    'field_renderer_local': r'function\s+(renderStatus|renderAmount|renderDate|renderType|renderSide|getEntityColor)',
    'fallback_logic': r'try\s*\{[^}]*FieldRendererService[^}]*\}\s*catch',
}

HTML_PATTERNS = {
    'inline_styles': r'style\s*=',
    'style_tags': r'<style',
}

def scan_file(file_path, patterns):
    """Scan a file for patterns"""
    if not file_path.exists():
        return {}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return {}
    
    results = {}
    for pattern_name, pattern in patterns.items():
        matches = list(re.finditer(pattern, content, re.MULTILINE))
        if matches:
            match_list = []
            for match in matches:
                line_num = content[:match.start()].count('\n') + 1
                line_content = lines[line_num - 1].strip()[:100]
                match_list.append({
                    'line': line_num,
                    'content': line_content,
                    'match': match.group()[:50]
                })
            results[pattern_name] = match_list
    
    return results

def main():
    """Main scanning function"""
    print("🔍 Scanning remaining pages for common patterns...")
    print(f"📁 Base directory: {BASE_DIR}")
    print(f"📁 Scripts directory: {SCRIPTS_DIR}")
    print()
    
    # Scan JS files
    js_results = {}
    for js_file in INCOMPLETE_PAGES_JS:
        file_path = SCRIPTS_DIR / js_file
        if file_path.exists():
            results = scan_file(file_path, JS_PATTERNS)
            if results:
                js_results[js_file] = results
    
    # Scan HTML files
    html_results = {}
    for html_file in INCOMPLETE_PAGES_HTML:
        file_path = TRADING_UI_DIR / html_file
        if file_path.exists():
            results = scan_file(file_path, HTML_PATTERNS)
            if results:
                html_results[html_file] = results
    
    # Aggregate results
    pattern_summary = defaultdict(lambda: {'count': 0, 'files': []})
    
    for file, patterns in js_results.items():
        for pattern_name, matches in patterns.items():
            pattern_summary[pattern_name]['count'] += len(matches)
            pattern_summary[pattern_name]['files'].append({
                'file': file,
                'count': len(matches)
            })
    
    for file, patterns in html_results.items():
        for pattern_name, matches in patterns.items():
            pattern_summary[pattern_name]['count'] += len(matches)
            pattern_summary[pattern_name]['files'].append({
                'file': file,
                'count': len(matches)
            })
    
    # Print summary
    print("=" * 80)
    print("📊 PATTERN SUMMARY")
    print("=" * 80)
    print()
    
    for pattern_name, data in sorted(pattern_summary.items(), key=lambda x: x[1]['count'], reverse=True):
        print(f"🔴 {pattern_name.upper()}")
        print(f"   Total occurrences: {data['count']}")
        print(f"   Files affected: {len(data['files'])}")
        print(f"   Top 5 files:")
        for file_data in sorted(data['files'], key=lambda x: x['count'], reverse=True)[:5]:
            print(f"      - {file_data['file']}: {file_data['count']} occurrences")
        print()
    
    # Save detailed results
    output_file = BASE_DIR / 'documentation' / '05-REPORTS' / 'STANDARDIZATION_PATTERNS_SCAN_RESULTS.json'
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    output_data = {
        'js_results': js_results,
        'html_results': html_results,
        'pattern_summary': dict(pattern_summary),
        'scan_date': str(Path(__file__).stat().st_mtime)
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Detailed results saved to: {output_file}")
    print()
    print("=" * 80)
    print("✅ Scan completed!")
    print("=" * 80)

if __name__ == '__main__':
    main()



