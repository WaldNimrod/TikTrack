#!/usr/bin/env python3
"""
Phase 3 Completion Verification Script
======================================

Verifies that all Phase 3 requirements have been completed:
- No legacy patterns (jQuery AJAX, XMLHttpRequest, inline onclick)
- No inline styles
- All functions documented (Function Index + JSDoc)
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple

# Configuration
BASE_DIR = Path(__file__).parent.parent
TRADING_UI_DIR = BASE_DIR / 'trading-ui'
SCRIPTS_DIR = TRADING_UI_DIR / 'scripts'
HTML_DIR = TRADING_UI_DIR

# Central and supporting pages
CENTRAL_PAGES = [
    'index', 'trades', 'trade_plans', 'alerts', 'tickers',
    'trading_accounts', 'executions', 'data_import',
    'cash_flows', 'notes', 'research', 'preferences'
]

SUPPORTING_PAGES = [
    'external-data-dashboard', 'chart-management', 'crud-testing-dashboard'
]

ALL_PAGES = CENTRAL_PAGES + SUPPORTING_PAGES

# Patterns to check
LEGACY_PATTERNS = {
    'jquery_ajax': [
        r'\$\.ajax\s*\(',
        r'\.ajax\s*\(',
        r'\$\.get\s*\(',
        r'\$\.post\s*\(',
        r'\$\.getJSON\s*\(',
        r'\$\.load\s*\('
    ],
    'xmlhttprequest': [
        r'new\s+XMLHttpRequest\s*\(',
        r'XMLHttpRequest\s*\('
    ],
    'inline_onclick': [
        r'(?<!data-)onclick\s*='
    ],
    'inline_styles': [
        r'<[^>]*\sstyle\s*=\s*["\'][^"\']*["\'][^>]*>'
    ]
}

def find_pattern_in_file(file_path: Path, patterns: List[str], file_type: str = 'js') -> List[Dict]:
    """Find pattern matches in a file."""
    if not file_path.exists():
        return []
    
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return [{'error': str(e)}]
    
    matches = []
    lines = content.split('\n')
    
    for pattern in patterns:
        regex = re.compile(pattern, re.IGNORECASE | re.MULTILINE)
        for match in regex.finditer(content):
            line_num = content[:match.start()].count('\n') + 1
            line_content = lines[line_num - 1] if line_num <= len(lines) else ''
            
            # Filter out false positives
            if file_type == 'html':
                # Exclude style tags and data attributes
                if 'style=' in match.group(0):
                    if '<style' in line_content or 'data-style' in line_content:
                        continue
                # Exclude data-onclick
                if 'onclick=' in match.group(0) and 'data-onclick' in line_content:
                    continue
            
            matches.append({
                'pattern': pattern,
                'line': line_num,
                'content': line_content.strip()[:100],
                'match': match.group(0)[:50]
            })
    
    return matches

def check_function_index(js_file: Path) -> Dict:
    """Check if file has Function Index."""
    if not js_file.exists():
        return {'exists': False, 'reason': 'File not found'}
    
    content = js_file.read_text(encoding='utf-8')
    
    # Check for Function Index markers
    has_index = (
        'FUNCTION INDEX' in content.upper() or
        'Function Index' in content or
        'FUNCTION INDEX' in content
    )
    
    if not has_index:
        return {'exists': False, 'reason': 'No Function Index found'}
    
    # Check position (should be in first 100 lines)
    lines = content.split('\n')
    index_line = -1
    for i, line in enumerate(lines[:100]):
        if 'FUNCTION INDEX' in line.upper() or 'Function Index' in line:
            index_line = i + 1
            break
    
    return {
        'exists': True,
        'line': index_line if index_line > 0 else None,
        'position_ok': index_line > 0 and index_line <= 100
    }

def check_jsdoc_coverage(js_file: Path) -> Dict:
    """Check JSDoc coverage for functions."""
    if not js_file.exists():
        return {'coverage': 0, 'total': 0, 'documented': 0}
    
    content = js_file.read_text(encoding='utf-8')
    
    # Find all function declarations
    function_pattern = r'^(?:async\s+)?function\s+(\w+)\s*\(|^\s*const\s+(\w+)\s*=\s*(?:async\s+)?\(|^\s*const\s+(\w+)\s*=\s*\{'
    functions = []
    
    for match in re.finditer(function_pattern, content, re.MULTILINE):
        func_name = match.group(1) or match.group(2) or match.group(3)
        if func_name:
            functions.append({
                'name': func_name,
                'position': match.start()
            })
    
    # Check JSDoc for each function
    documented = 0
    for func in functions:
        # Check 20 lines before function for JSDoc
        before_start = max(0, func['position'] - 1000)
        before_content = content[before_start:func['position']]
        
        # Look for JSDoc comment
        jsdoc_pattern = r'/\*\*[\s\S]{0,500}?\*/'
        if re.search(jsdoc_pattern, before_content):
            documented += 1
    
    total = len(functions)
    coverage = (documented / total * 100) if total > 0 else 0
    
    return {
        'coverage': round(coverage, 1),
        'total': total,
        'documented': documented
    }

def verify_page(page_name: str) -> Dict:
    """Verify Phase 3 completion for a single page."""
    js_file = SCRIPTS_DIR / f'{page_name}.js'
    html_file = HTML_DIR / f'{page_name}.html'
    
    result = {
        'page': page_name,
        'js_file_exists': js_file.exists(),
        'html_file_exists': html_file.exists(),
        'legacy_patterns': {},
        'inline_styles': [],
        'function_index': {},
        'jsdoc_coverage': {},
        'status': 'unknown',
        'issues': []
    }
    
    # Check legacy patterns in JS
    if js_file.exists():
        for pattern_type, patterns in LEGACY_PATTERNS.items():
            if pattern_type in ['inline_onclick', 'inline_styles']:
                continue  # Check in HTML
            
            matches = find_pattern_in_file(js_file, patterns, 'js')
            result['legacy_patterns'][pattern_type] = matches
            
            if matches:
                result['issues'].append(f'{pattern_type}: {len(matches)} occurrences')
    
    # Check inline onclick and styles in HTML
    if html_file.exists():
        # Inline onclick
        onclick_matches = find_pattern_in_file(html_file, LEGACY_PATTERNS['inline_onclick'], 'html')
        result['legacy_patterns']['inline_onclick'] = onclick_matches
        if onclick_matches:
            result['issues'].append(f'inline_onclick: {len(onclick_matches)} occurrences')
        
        # Inline styles
        style_matches = find_pattern_in_file(html_file, LEGACY_PATTERNS['inline_styles'], 'html')
        result['legacy_patterns']['inline_styles'] = style_matches
        if style_matches:
            result['issues'].append(f'inline_styles: {len(style_matches)} occurrences')
    
    # Check Function Index
    if js_file.exists():
        result['function_index'] = check_function_index(js_file)
        if not result['function_index'].get('exists'):
            result['issues'].append('Missing Function Index')
        elif not result['function_index'].get('position_ok'):
            result['issues'].append('Function Index not at top of file')
    
    # Check JSDoc coverage
    if js_file.exists():
        result['jsdoc_coverage'] = check_jsdoc_coverage(js_file)
        if result['jsdoc_coverage']['coverage'] < 100:
            result['issues'].append(
                f"JSDoc coverage: {result['jsdoc_coverage']['coverage']}% "
                f"({result['jsdoc_coverage']['documented']}/{result['jsdoc_coverage']['total']})"
            )
    
    # Determine status
    if not result['issues']:
        result['status'] = 'compliant'
    elif len(result['issues']) <= 2:
        result['status'] = 'mostly_compliant'
    else:
        result['status'] = 'needs_work'
    
    return result

def generate_report(results: List[Dict]) -> str:
    """Generate verification report."""
    report = []
    report.append("# Phase 3 Completion Verification Report\n")
    report.append(f"**Generated**: {Path(__file__).stat().st_mtime}\n")
    report.append("---\n")
    
    # Summary
    compliant = sum(1 for r in results if r['status'] == 'compliant')
    mostly = sum(1 for r in results if r['status'] == 'mostly_compliant')
    needs_work = sum(1 for r in results if r['status'] == 'needs_work')
    
    report.append("## Summary\n")
    report.append(f"- **Compliant**: {compliant}/{len(results)} pages\n")
    report.append(f"- **Mostly Compliant**: {mostly}/{len(results)} pages\n")
    report.append(f"- **Needs Work**: {needs_work}/{len(results)} pages\n")
    report.append("---\n")
    
    # Per-page results
    report.append("## Per-Page Results\n")
    report.append("| Page | Status | Issues |\n")
    report.append("|------|--------|--------|\n")
    
    for result in sorted(results, key=lambda x: x['page']):
        status_icon = {
            'compliant': '✅',
            'mostly_compliant': '⚠️',
            'needs_work': '❌'
        }.get(result['status'], '❓')
        
        issues_count = len(result['issues'])
        issues_text = f"{issues_count} issue(s)" if issues_count > 0 else "None"
        
        report.append(f"| {result['page']} | {status_icon} {result['status']} | {issues_text} |\n")
    
    report.append("\n---\n")
    
    # Detailed issues
    report.append("## Detailed Issues\n")
    
    for result in sorted(results, key=lambda x: x['page']):
        if result['issues']:
            report.append(f"### {result['page']}\n")
            for issue in result['issues']:
                report.append(f"- {issue}\n")
            report.append("\n")
    
    return ''.join(report)

def main():
    """Main verification function."""
    print("🔍 Starting Phase 3 completion verification...")
    print(f"📁 Scanning {len(ALL_PAGES)} pages...\n")
    
    results = []
    for page in ALL_PAGES:
        print(f"  Checking {page}...")
        result = verify_page(page)
        results.append(result)
        
        status_icon = {
            'compliant': '✅',
            'mostly_compliant': '⚠️',
            'needs_work': '❌'
        }.get(result['status'], '❓')
        
        print(f"    {status_icon} {result['status']} ({len(result['issues'])} issues)")
    
    # Generate report
    report = generate_report(results)
    
    # Save report
    report_dir = BASE_DIR / 'documentation' / 'reports' / 'user-pages-standardization'
    report_dir.mkdir(parents=True, exist_ok=True)
    report_file = report_dir / 'PHASE3_VERIFICATION_REPORT.md'
    report_file.write_text(report, encoding='utf-8')
    
    print(f"\n✅ Verification complete!")
    print(f"📄 Report saved: {report_file}")
    
    # Summary
    compliant = sum(1 for r in results if r['status'] == 'compliant')
    total_issues = sum(len(r['issues']) for r in results)
    
    print(f"\n📊 Summary:")
    print(f"  - Compliant pages: {compliant}/{len(results)}")
    print(f"  - Total issues: {total_issues}")
    
    if total_issues == 0:
        print("\n🎉 All pages are fully compliant!")
    else:
        print(f"\n⚠️  {total_issues} issues found - see report for details")

if __name__ == '__main__':
    main()

