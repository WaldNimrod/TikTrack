#!/usr/bin/env python3
"""
Test all pages from documentation/PAGES_LIST.md
Runs console error tests on all main and technical pages
"""

import subprocess
import json
import sys
from datetime import datetime
from pathlib import Path

# Main pages from documentation
MAIN_PAGES = [
    'index.html',
    'trades.html',
    'trade_plans.html',
    'alerts.html',
    'tickers.html',
    'ticker-dashboard.html',
    'trading_accounts.html',
    'executions.html',
    'data_import.html',
    'cash_flows.html',
    'notes.html',
    'research.html',
    'ai-analysis.html',
    'watch-list.html',
    'preferences.html',
    'user-profile.html',
]

# Technical pages
TECHNICAL_PAGES = [
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
]

# Auth pages
AUTH_PAGES = [
    'login.html',
    'register.html',
    'forgot-password.html',
    'reset-password.html',
]

ALL_PAGES = MAIN_PAGES + TECHNICAL_PAGES + AUTH_PAGES

def test_page(page_name):
    """Test a single page and return results"""
    try:
        result = subprocess.run(
            ['python3', 'scripts/test_pages_console_errors.py', '--page', page_name],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        # Parse output
        output = result.stdout + result.stderr
        
        # Check for success/error
        status = 'SUCCESS' if 'Status: SUCCESS' in output else 'ERRORS' if 'Status: ERRORS' in output else 'UNKNOWN'
        
        # Count errors and warnings
        errors = 0
        warnings = 0
        
        if 'Errors:' in output:
            try:
                errors_line = [line for line in output.split('\n') if 'Errors:' in line][0]
                errors = int(errors_line.split('Errors:')[1].strip().split()[0])
            except:
                pass
        
        if 'Warnings:' in output:
            try:
                warnings_line = [line for line in output.split('\n') if 'Warnings:' in line][0]
                warnings = int(warnings_line.split('Warnings:')[1].strip().split()[0])
            except:
                pass
        
        return {
            'page': page_name,
            'status': status,
            'errors': errors,
            'warnings': warnings,
            'output': output[:500]  # First 500 chars
        }
    except subprocess.TimeoutExpired:
        return {
            'page': page_name,
            'status': 'TIMEOUT',
            'errors': -1,
            'warnings': -1,
            'output': 'Test timed out after 60 seconds'
        }
    except Exception as e:
        return {
            'page': page_name,
            'status': 'EXCEPTION',
            'errors': -1,
            'warnings': -1,
            'output': str(e)
        }

def main():
    print("=" * 80)
    print("Testing All Pages from Documentation")
    print("=" * 80)
    print(f"Total pages: {len(ALL_PAGES)}")
    print(f"Main pages: {len(MAIN_PAGES)}")
    print(f"Technical pages: {len(TECHNICAL_PAGES)}")
    print(f"Auth pages: {len(AUTH_PAGES)}")
    print("=" * 80)
    print()
    
    results = []
    success_count = 0
    error_count = 0
    total_errors = 0
    total_warnings = 0
    
    for i, page in enumerate(ALL_PAGES, 1):
        print(f"[{i}/{len(ALL_PAGES)}] Testing {page}...", end=' ', flush=True)
        result = test_page(page)
        results.append(result)
        
        if result['status'] == 'SUCCESS':
            print(f"✅ SUCCESS (Errors: {result['errors']}, Warnings: {result['warnings']})")
            success_count += 1
        else:
            print(f"❌ {result['status']} (Errors: {result['errors']}, Warnings: {result['warnings']})")
            error_count += 1
        
        if result['errors'] > 0:
            total_errors += result['errors']
        if result['warnings'] > 0:
            total_warnings += result['warnings']
    
    print()
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total pages tested: {len(ALL_PAGES)}")
    print(f"✅ Successful: {success_count}")
    print(f"❌ With errors: {error_count}")
    print(f"Total errors found: {total_errors}")
    print(f"Total warnings found: {total_warnings}")
    print()
    
    # Group by category
    print("Results by Category:")
    print("-" * 80)
    
    categories = [
        ('Main Pages', MAIN_PAGES),
        ('Technical Pages', TECHNICAL_PAGES),
        ('Auth Pages', AUTH_PAGES)
    ]
    
    for category_name, pages_list in categories:
        category_results = [r for r in results if r['page'] in pages_list]
        category_success = sum(1 for r in category_results if r['status'] == 'SUCCESS')
        category_errors = sum(r['errors'] for r in category_results if r['errors'] > 0)
        print(f"{category_name}: {category_success}/{len(pages_list)} successful, {category_errors} errors")
    
    print()
    
    # Pages with errors
    pages_with_errors = [r for r in results if r['errors'] > 0]
    if pages_with_errors:
        print("Pages with errors:")
        print("-" * 80)
        for result in pages_with_errors:
            print(f"  ❌ {result['page']}: {result['errors']} errors, {result['warnings']} warnings")
        print()
    
    # Save results to JSON
    report_path = Path('documentation/05-REPORTS/ALL_PAGES_TEST_REPORT.json')
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    report_data = {
        'timestamp': datetime.now().isoformat(),
        'total_pages': len(ALL_PAGES),
        'success_count': success_count,
        'error_count': error_count,
        'total_errors': total_errors,
        'total_warnings': total_warnings,
        'results': results
    }
    
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)
    
    print(f"📄 Full report saved to: {report_path}")
    
    # Return exit code
    return 0 if error_count == 0 else 1

if __name__ == '__main__':
    sys.exit(main())

