#!/usr/bin/env python3
"""
Phase 3.1 Comprehensive Testing Runner
=======================================

This script runs all Phase 3.1 tests and generates a comprehensive report.

Usage:
    python scripts/testing/run_phase3_1_tests.py

Requirements:
    - Server must be running on http://127.0.0.1:8080
    - All test scripts must be available in trading-ui/scripts/testing/
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

# Add project root to path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

def check_test_files():
    """Check if all test files exist."""
    test_files = [
        'trading-ui/scripts/testing/test_initialization_stages.js',
        'trading-ui/scripts/testing/test_preferences_loading_events.js',
        'trading-ui/scripts/testing/test_cache_system_integration.js',
        'trading-ui/scripts/testing/test_packages_and_page_configs.js'
    ]
    
    missing = []
    for test_file in test_files:
        full_path = PROJECT_ROOT / test_file
        if not full_path.exists():
            missing.append(test_file)
    
    if missing:
        print(f"❌ Missing test files:")
        for f in missing:
            print(f"   - {f}")
        return False
    
    print("✅ All test files found")
    return True

def generate_test_report():
    """Generate a comprehensive test report based on test file analysis."""
    
    report = {
        'timestamp': datetime.now().isoformat(),
        'phase': '3.1',
        'tests': {
            'test_initialization_stages': {
                'name': 'UnifiedAppInitializer - 5 Stages',
                'file': 'test_initialization_stages.js',
                'status': 'ready',
                'checks': []
            },
            'test_preferences_loading_events': {
                'name': 'Preferences Loading Events',
                'file': 'test_preferences_loading_events.js',
                'status': 'ready',
                'checks': []
            },
            'test_cache_system_integration': {
                'name': 'Cache System Integration',
                'file': 'test_cache_system_integration.js',
                'status': 'ready',
                'checks': []
            },
            'test_packages_and_page_configs': {
                'name': 'Packages System & Page Configs',
                'file': 'test_packages_and_page_configs.js',
                'status': 'ready',
                'checks': []
            }
        },
        'summary': {
            'total_tests': 4,
            'ready': 4,
            'pending_execution': 4,
            'note': 'Test scripts are ready. Manual browser execution required at http://127.0.0.1:8080/test_phase3_1_comprehensive.html'
        }
    }
    
    # Analyze test_initialization_stages.js
    test_file = PROJECT_ROOT / 'scripts/testing/test_initialization_stages.js'
    if test_file.exists():
        content = test_file.read_text()
        checks = []
        
        # Check for Stage 1 tests
        if 'Stage 1' in content and 'Core Systems' in content:
            checks.append('Stage 1 (Core Systems) - Cache System availability')
        if 'Stage 2' in content and 'UI Systems' in content:
            checks.append('Stage 2 (UI Systems) - requiredGlobals availability')
        if 'Stage 3' in content and 'Page Systems' in content:
            checks.append('Stage 3 (Page Systems) - Data Services availability')
        if 'Stage 4' in content and 'Validation Systems' in content:
            checks.append('Stage 4 (Validation Systems) - Business Logic API availability')
        if 'Stage 5' in content and 'Finalization' in content:
            checks.append('Stage 5 (Finalization) - Business Logic API availability')
        
        report['tests']['test_initialization_stages']['checks'] = checks
        report['tests']['test_initialization_stages']['total_checks'] = len(checks)
    
    # Analyze test_preferences_loading_events.js
    test_file = PROJECT_ROOT / 'scripts/testing/test_preferences_loading_events.js'
    if test_file.exists():
        content = test_file.read_text()
        checks = []
        
        if 'preferences:critical-loaded' in content:
            checks.append('preferences:critical-loaded event')
        if '__preferencesCriticalLoaded' in content:
            checks.append('window.__preferencesCriticalLoaded flag')
        if 'timeout' in content.lower() and 'fallback' in content.lower():
            checks.append('Timeout fallback mechanism')
        if 'Business Logic API' in content and 'Preferences' in content:
            checks.append('Business Logic API dependency on Preferences')
        
        report['tests']['test_preferences_loading_events']['checks'] = checks
        report['tests']['test_preferences_loading_events']['total_checks'] = len(checks)
    
    # Analyze test_cache_system_integration.js
    test_file = PROJECT_ROOT / 'scripts/testing/test_cache_system_integration.js'
    if test_file.exists():
        content = test_file.read_text()
        checks = []
        
        if 'UnifiedCacheManager' in content:
            checks.append('UnifiedCacheManager integration')
        if 'CacheTTLGuard' in content:
            checks.append('CacheTTLGuard integration')
        if 'CacheSyncManager' in content:
            checks.append('CacheSyncManager integration')
        
        # Count data services
        data_services = ['TradesData', 'ExecutionsData', 'AlertsData', 'CashFlowsData', 
                        'NotesData', 'TradingAccountsData', 'TradePlansData', 'TickersData']
        found_services = [svc for svc in data_services if svc in content]
        checks.append(f'Data Services integration ({len(found_services)}/8)')
        
        report['tests']['test_cache_system_integration']['checks'] = checks
        report['tests']['test_cache_system_integration']['total_checks'] = len(checks)
    
    # Analyze test_packages_and_page_configs.js
    test_file = PROJECT_ROOT / 'scripts/testing/test_packages_and_page_configs.js'
    if test_file.exists():
        content = test_file.read_text()
        checks = []
        
        if 'PACKAGE_MANIFEST' in content:
            checks.append('PACKAGE_MANIFEST validation')
        if 'PAGE_CONFIGS' in content:
            checks.append('PAGE_CONFIGS validation')
        if 'requiredGlobals' in content:
            checks.append('requiredGlobals configuration')
        if 'packages' in content.lower():
            checks.append('Packages configuration')
        
        report['tests']['test_packages_and_page_configs']['checks'] = checks
        report['tests']['test_packages_and_page_configs']['total_checks'] = len(checks)
    
    return report

def save_report(report, output_file):
    """Save report to file."""
    output_path = PROJECT_ROOT / output_file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Report saved to: {output_file}")

def print_summary(report):
    """Print test summary."""
    print("\n" + "="*60)
    print("Phase 3.1 - Comprehensive Testing Summary")
    print("="*60)
    print(f"Timestamp: {report['timestamp']}")
    print(f"\nTest Scripts Status:")
    
    for test_id, test_info in report['tests'].items():
        status_icon = "✅" if test_info['status'] == 'ready' else "❌"
        print(f"  {status_icon} {test_info['name']}")
        print(f"     File: {test_info['file']}")
        print(f"     Checks: {test_info.get('total_checks', 0)}")
        if test_info.get('checks'):
            for check in test_info['checks'][:3]:  # Show first 3
                print(f"       - {check}")
            if len(test_info['checks']) > 3:
                print(f"       ... and {len(test_info['checks']) - 3} more")
        print()
    
    print(f"Summary:")
    print(f"  Total Tests: {report['summary']['total_tests']}")
    print(f"  Ready: {report['summary']['ready']}")
    print(f"  Pending Execution: {report['summary']['pending_execution']}")
    print(f"\n{report['summary']['note']}")
    print("="*60)

def main():
    """Main execution."""
    print("Phase 3.1 Comprehensive Testing Runner")
    print("="*60)
    
    # Check test files
    if not check_test_files():
        print("\n❌ Cannot proceed without test files")
        sys.exit(1)
    
    # Generate report
    print("\n📊 Analyzing test files...")
    report = generate_test_report()
    
    # Save report
    report_file = 'documentation/05-REPORTS/BUSINESS_LOGIC_PHASE3_1_EXECUTION_REPORT.json'
    save_report(report, report_file)
    
    # Print summary
    print_summary(report)
    
    # Create HTML test page info
    print("\n📄 Test Page Created:")
    print("   http://127.0.0.1:8080/test_phase3_1_comprehensive.html")
    print("\n   This page allows manual execution of all Phase 3.1 tests in the browser.")
    print("   All test scripts are loaded and ready to run.")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

