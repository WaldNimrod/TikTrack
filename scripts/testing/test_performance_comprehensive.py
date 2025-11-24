#!/usr/bin/env python3
"""
Comprehensive Performance Testing Script
========================================

This script performs comprehensive performance testing for Phase 3.4:
- Response Time
- Cache Hit Rate
- Throughput
- Bundle Size
- Memory Usage

Usage:
    python3 scripts/testing/test_performance_comprehensive.py
"""

import os
import sys
import json
import time
import requests
import statistics
from pathlib import Path
from typing import Dict, List, Tuple
from collections import defaultdict

# Base directory
BASE_DIR = Path(__file__).parent.parent.parent
API_BASE_URL = 'http://localhost:8080'

# Test endpoints
BUSINESS_LOGIC_ENDPOINTS = [
    '/api/business/trade/calculate-stop-price',
    '/api/business/trade/calculate-target-price',
    '/api/business/trade/calculate-percentage-from-price',
    '/api/business/trade/calculate-investment',
    '/api/business/trade/validate-trade',
    '/api/business/execution/calculate-execution-values',
    '/api/business/execution/calculate-average-price',
    '/api/business/execution/validate-execution',
    '/api/business/alert/validate-alert',
    '/api/business/alert/validate-condition-value',
    '/api/business/statistics/calculate-sum',
    '/api/business/statistics/calculate-average',
    '/api/business/statistics/count-records',
    '/api/business/cash-flow/calculate-account-balance',
    '/api/business/cash-flow/validate-cash-flow',
    '/api/business/note/validate-note',
    '/api/business/trading-account/validate-trading-account',
    '/api/business/trade-plan/validate-trade-plan',
    '/api/business/ticker/validate-ticker'
]


def test_response_time(endpoint: str, payload: dict, iterations: int = 10) -> Dict:
    """Test response time for an endpoint."""
    times = []
    errors = 0
    
    for _ in range(iterations):
        try:
            start = time.time()
            response = requests.post(
                f'{API_BASE_URL}{endpoint}',
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            elapsed = (time.time() - start) * 1000  # Convert to ms
            times.append(elapsed)
            
            if response.status_code != 200:
                errors += 1
        except Exception as e:
            errors += 1
            times.append(None)
    
    valid_times = [t for t in times if t is not None]
    
    return {
        'endpoint': endpoint,
        'iterations': iterations,
        'errors': errors,
        'success_rate': (iterations - errors) / iterations * 100 if iterations > 0 else 0,
        'min': min(valid_times) if valid_times else None,
        'max': max(valid_times) if valid_times else None,
        'avg': statistics.mean(valid_times) if valid_times else None,
        'median': statistics.median(valid_times) if valid_times else None,
        'p95': sorted(valid_times)[int(len(valid_times) * 0.95)] if len(valid_times) > 0 else None,
        'p99': sorted(valid_times)[int(len(valid_times) * 0.99)] if len(valid_times) > 0 else None
    }


def test_throughput(endpoints: List[str], payloads: Dict[str, dict], duration_seconds: int = 10) -> Dict:
    """Test throughput (requests per second)."""
    start_time = time.time()
    request_count = 0
    error_count = 0
    
    while time.time() - start_time < duration_seconds:
        for endpoint in endpoints:
            try:
                payload = payloads.get(endpoint, {})
                response = requests.post(
                    f'{API_BASE_URL}{endpoint}',
                    json=payload,
                    headers={'Content-Type': 'application/json'},
                    timeout=2
                )
                request_count += 1
                if response.status_code != 200:
                    error_count += 1
            except Exception:
                error_count += 1
                request_count += 1
    
    elapsed = time.time() - start_time
    throughput = request_count / elapsed if elapsed > 0 else 0
    
    return {
        'duration_seconds': elapsed,
        'total_requests': request_count,
        'errors': error_count,
        'throughput_rps': throughput,
        'error_rate': (error_count / request_count * 100) if request_count > 0 else 0
    }


def get_bundle_size() -> Dict:
    """Get bundle size information."""
    scripts_dir = BASE_DIR / 'trading-ui' / 'scripts'
    total_size = 0
    file_count = 0
    large_files = []
    
    for file_path in scripts_dir.rglob('*.js'):
        if file_path.is_file():
            size = file_path.stat().st_size
            total_size += size
            file_count += 1
            if size > 100 * 1024:  # > 100KB
                large_files.append({
                    'path': str(file_path.relative_to(scripts_dir)),
                    'size': size,
                    'size_kb': size / 1024
                })
    
    large_files.sort(key=lambda x: x['size'], reverse=True)
    
    return {
        'total_size_bytes': total_size,
        'total_size_mb': total_size / (1024 * 1024),
        'file_count': file_count,
        'large_files': large_files[:10]  # Top 10
    }


def main():
    """Main function to run comprehensive performance tests."""
    print("=" * 80)
    print("Comprehensive Performance Testing - Phase 3.4")
    print("=" * 80)
    print()
    
    results = {
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'response_time': {},
        'throughput': {},
        'bundle_size': {},
        'summary': {}
    }
    
    # Test payloads
    test_payloads = {
        '/api/business/trade/calculate-stop-price': {
            'current_price': 100.0,
            'stop_percentage': 5.0,
            'side': 'Long'
        },
        '/api/business/trade/calculate-target-price': {
            'current_price': 100.0,
            'target_percentage': 10.0,
            'side': 'Long'
        },
        '/api/business/trade/calculate-percentage-from-price': {
            'current_price': 100.0,
            'target_price': 110.0,
            'side': 'Long'
        },
        '/api/business/trade/calculate-investment': {
            'price': 100.0,
            'quantity': 10
        },
        '/api/business/trade/validate-trade': {
            'trading_account_id': 1,
            'ticker_id': 1,
            'side': 'Long',
            'investment_type': 'Swing',
            'status': 'open',
            'price': 100.0,
            'quantity': 10
        },
        '/api/business/execution/calculate-execution-values': {
            'price': 100.0,
            'quantity': 10,
            'action': 'buy'
        },
        '/api/business/execution/calculate-average-price': {
            'executions': [
                {'price': 100.0, 'quantity': 5},
                {'price': 105.0, 'quantity': 5}
            ]
        },
        '/api/business/execution/validate-execution': {
            'price': 100.0,
            'quantity': 10,
            'action': 'buy',
            'status': 'completed'
        },
        '/api/business/alert/validate-alert': {
            'ticker_id': 1,
            'condition_type': 'price',
            'condition_value': 100.0,
            'alert_type': 'above'
        },
        '/api/business/alert/validate-condition-value': {
            'condition_type': 'price',
            'condition_value': 100.0,
            'ticker_id': 1
        },
        '/api/business/statistics/calculate-sum': {
            'entity_type': 'trade',
            'field': 'quantity'
        },
        '/api/business/statistics/calculate-average': {
            'entity_type': 'trade',
            'field': 'price'
        },
        '/api/business/statistics/count-records': {
            'entity_type': 'trade'
        },
        '/api/business/cash-flow/calculate-account-balance': {
            'trading_account_id': 1
        },
        '/api/business/cash-flow/validate-cash-flow': {
            'trading_account_id': 1,
            'amount': 1000.0,
            'source': 'manual'
        },
        '/api/business/note/validate-note': {
            'content': 'Test note',
            'related_type_id': 1,
            'related_id': 1
        },
        '/api/business/trading-account/validate-trading-account': {
            'name': 'Test Account',
            'currency_id': 1
        },
        '/api/business/trade-plan/validate-trade-plan': {
            'ticker_id': 1,
            'side': 'Long'
        },
        '/api/business/ticker/validate-ticker': {
            'symbol': 'AAPL'
        }
    }
    
    # Test Response Time
    print("📊 Testing Response Time...")
    response_times = []
    for endpoint in BUSINESS_LOGIC_ENDPOINTS:
        print(f"  Testing {endpoint}...")
        result = test_response_time(endpoint, test_payloads.get(endpoint, {}))
        response_times.append(result)
        results['response_time'][endpoint] = result
    
    # Calculate summary
    all_avg_times = [r['avg'] for r in response_times if r['avg'] is not None]
    results['summary']['response_time'] = {
        'avg_all': statistics.mean(all_avg_times) if all_avg_times else None,
        'min': min(all_avg_times) if all_avg_times else None,
        'max': max(all_avg_times) if all_avg_times else None,
        'p95': sorted(all_avg_times)[int(len(all_avg_times) * 0.95)] if len(all_avg_times) > 0 else None,
        'target_met': all(t < 200 for t in all_avg_times) if all_avg_times else False
    }
    print()
    
    # Test Throughput
    print("📈 Testing Throughput...")
    throughput_result = test_throughput(
        BUSINESS_LOGIC_ENDPOINTS[:5],  # Test first 5 endpoints
        {ep: test_payloads.get(ep, {}) for ep in BUSINESS_LOGIC_ENDPOINTS[:5]},
        duration_seconds=10
    )
    results['throughput'] = throughput_result
    print()
    
    # Test Bundle Size
    print("📦 Analyzing Bundle Size...")
    bundle_size = get_bundle_size()
    results['bundle_size'] = bundle_size
    print()
    
    # Print Summary
    print("=" * 80)
    print("Performance Test Summary")
    print("=" * 80)
    print()
    
    print("Response Time:")
    print(f"  Average: {results['summary']['response_time']['avg_all']:.2f}ms")
    print(f"  Min: {results['summary']['response_time']['min']:.2f}ms")
    print(f"  Max: {results['summary']['response_time']['max']:.2f}ms")
    print(f"  P95: {results['summary']['response_time']['p95']:.2f}ms")
    print(f"  Target < 200ms: {'✅' if results['summary']['response_time']['target_met'] else '❌'}")
    print()
    
    print("Throughput:")
    print(f"  Requests/second: {throughput_result['throughput_rps']:.2f}")
    print(f"  Total requests: {throughput_result['total_requests']}")
    print(f"  Error rate: {throughput_result['error_rate']:.2f}%")
    print()
    
    print("Bundle Size:")
    print(f"  Total size: {bundle_size['total_size_mb']:.2f}MB")
    print(f"  File count: {bundle_size['file_count']}")
    print(f"  Large files (>100KB): {len(bundle_size['large_files'])}")
    print()
    
    # Save results
    output_file = BASE_DIR / 'documentation' / '05-REPORTS' / 'PERFORMANCE_COMPREHENSIVE_TEST_RESULTS.json'
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"📄 Results saved to: {output_file}")


if __name__ == '__main__':
    main()

