#!/usr/bin/env python3
"""
Comprehensive Test Report for User-Ticker Integration
=====================================================

Runs all tests and generates a comprehensive report.

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
import subprocess
import json
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def run_test_script(script_name):
    """Run a test script and return results"""
    print(f"\n{'='*60}")
    print(f"Running: {script_name}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            [sys.executable, script_name],
            capture_output=True,
            text=True,
            env=os.environ.copy()
        )
        return {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        }
    except Exception as e:
        return {
            'success': False,
            'stdout': '',
            'stderr': str(e),
            'returncode': -1
        }

def main():
    """Run all tests and generate report"""
    
    print("\n" + "="*60)
    print("COMPREHENSIVE USER-TICKER INTEGRATION TEST REPORT")
    print("="*60)
    print(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Set environment variables
    os.environ['POSTGRES_HOST'] = 'localhost'
    os.environ['POSTGRES_DB'] = 'TikTrack-db-development'
    os.environ['POSTGRES_USER'] = 'TikTrakDBAdmin'
    os.environ['POSTGRES_PASSWORD'] = 'BigMeZoo1974!?'
    
    script_dir = os.path.dirname(__file__)
    
    tests = [
        {
            'name': 'Integration Tests',
            'script': os.path.join(script_dir, 'test_user_ticker_integration.py'),
            'description': 'Tests model fields, status calculation, data integrity'
        },
        {
            'name': 'Performance Tests',
            'script': os.path.join(script_dir, 'test_user_ticker_performance.py'),
            'description': 'Tests query performance and identifies bottlenecks'
        }
    ]
    
    results = {}
    
    for test in tests:
        if os.path.exists(test['script']):
            result = run_test_script(test['script'])
            results[test['name']] = {
                'success': result['success'],
                'description': test['description'],
                'stdout': result['stdout'],
                'stderr': result['stderr']
            }
        else:
            results[test['name']] = {
                'success': False,
                'description': test['description'],
                'error': f"Script not found: {test['script']}"
            }
    
    # Generate summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for r in results.values() if r.get('success', False))
    total = len(results)
    
    for name, result in results.items():
        status = "✅ PASSED" if result.get('success', False) else "❌ FAILED"
        print(f"{status}: {name}")
        if not result.get('success', False) and 'error' in result:
            print(f"   Error: {result['error']}")
    
    print(f"\nTotal: {passed}/{total} test suites passed")
    
    # Save report to file
    report_file = os.path.join(script_dir, 'user_ticker_test_report.json')
    with open(report_file, 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'passed': passed,
                'total': total
            },
            'results': results
        }, f, indent=2)
    
    print(f"\n📄 Detailed report saved to: {report_file}")
    
    if passed == total:
        print("\n✅ All tests passed! 🎉")
        return 0
    else:
        print(f"\n❌ {total - passed} test suite(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())


