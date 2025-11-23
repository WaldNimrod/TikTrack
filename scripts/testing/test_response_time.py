#!/usr/bin/env python3
"""
Response Time Measurement Script
=================================

This script measures the response time for all Business Logic API endpoints
to identify slow endpoints and ensure all endpoints are < 200ms.

Usage:
    python3 scripts/testing/test_response_time.py
"""

import requests
import time
import json
from typing import Dict, List, Tuple
from statistics import mean, median, stdev

# Base URL for API
BASE_URL = "http://127.0.0.1:8080"

# Test endpoints with sample data
ENDPOINTS = [
    {
        'name': 'Calculate Stop Price',
        'url': f'{BASE_URL}/api/business/trade/calculate-stop-price',
        'method': 'POST',
        'data': {
            'current_price': 100.0,
            'stop_percentage': 5.0,
            'side': 'Long'
        }
    },
    {
        'name': 'Calculate Target Price',
        'url': f'{BASE_URL}/api/business/trade/calculate-target-price',
        'method': 'POST',
        'data': {
            'current_price': 100.0,
            'target_percentage': 10.0,
            'side': 'Long'
        }
    },
    {
        'name': 'Calculate Percentage From Price',
        'url': f'{BASE_URL}/api/business/trade/calculate-percentage-from-price',
        'method': 'POST',
        'data': {
            'current_price': 100.0,
            'target_price': 110.0,
            'side': 'Long'
        }
    },
    {
        'name': 'Calculate Investment',
        'url': f'{BASE_URL}/api/business/trade/calculate-investment',
        'method': 'POST',
        'data': {
            'price': 100.0,
            'quantity': 10.0
        }
    },
    {
        'name': 'Validate Trade',
        'url': f'{BASE_URL}/api/business/trade/validate',
        'method': 'POST',
        'data': {
            'trading_account_id': 1,
            'ticker_id': 1,
            'side': 'buy',
            'investment_type': 'Swing',
            'status': 'open',
            'price': 100.0,
            'quantity': 10.0
        }
    },
    {
        'name': 'Calculate Execution Values',
        'url': f'{BASE_URL}/api/business/execution/calculate-values',
        'method': 'POST',
        'data': {
            'price': 100.0,
            'quantity': 10.0,
            'action': 'buy'
        }
    },
    {
        'name': 'Calculate Average Price',
        'url': f'{BASE_URL}/api/business/execution/calculate-average-price',
        'method': 'POST',
        'data': {
            'executions': [
                {'price': 100.0, 'quantity': 5.0},
                {'price': 110.0, 'quantity': 5.0}
            ]
        }
    },
    {
        'name': 'Validate Execution',
        'url': f'{BASE_URL}/api/business/execution/validate',
        'method': 'POST',
        'data': {
            'trade_id': 1,
            'price': 100.0,
            'quantity': 10.0,
            'status': 'completed'
        }
    },
    {
        'name': 'Validate Alert',
        'url': f'{BASE_URL}/api/business/alert/validate',
        'method': 'POST',
        'data': {
            'ticker_id': 1,
            'condition_attribute': 'price',
            'condition_operator': 'greater_than',
            'condition_number': 100.0
        }
    },
    {
        'name': 'Calculate Statistics',
        'url': f'{BASE_URL}/api/business/statistics/calculate',
        'method': 'POST',
        'data': {
            'entity_type': 'trade',
            'calculation_type': 'sum',
            'field': 'quantity',
            'filters': {}
        }
    },
    {
        'name': 'Calculate Sum',
        'url': f'{BASE_URL}/api/business/statistics/calculate-sum',
        'method': 'POST',
        'data': {
            'entity_type': 'trade',
            'field': 'quantity',
            'filters': {}
        }
    },
    {
        'name': 'Calculate Average',
        'url': f'{BASE_URL}/api/business/statistics/calculate-average',
        'method': 'POST',
        'data': {
            'entity_type': 'trade',
            'field': 'quantity',
            'filters': {}
        }
    },
    {
        'name': 'Count Records',
        'url': f'{BASE_URL}/api/business/statistics/count-records',
        'method': 'POST',
        'data': {
            'entity_type': 'trade',
            'filters': {}
        }
    },
    {
        'name': 'Calculate Account Balance',
        'url': f'{BASE_URL}/api/business/cash-flow/calculate-balance',
        'method': 'POST',
        'data': {
            'account_id': 1,
            'as_of_date': '2025-01-27'
        }
    },
    {
        'name': 'Validate Cash Flow',
        'url': f'{BASE_URL}/api/business/cash-flow/validate',
        'method': 'POST',
        'data': {
            'trading_account_id': 1,
            'amount': 1000.0,
            'type': 'deposit',
            'source': 'manual'
        }
    },
    {
        'name': 'Validate Note',
        'url': f'{BASE_URL}/api/business/note/validate',
        'method': 'POST',
        'data': {
            'content': 'Test note',
            'related_type_id': 1,
            'related_id': 1
        }
    },
    {
        'name': 'Validate Trading Account',
        'url': f'{BASE_URL}/api/business/trading-account/validate',
        'method': 'POST',
        'data': {
            'name': 'Test Account',
            'currency_id': 1
        }
    },
    {
        'name': 'Validate Trade Plan',
        'url': f'{BASE_URL}/api/business/trade-plan/validate',
        'method': 'POST',
        'data': {
            'ticker_id': 1,
            'side': 'buy',
            'investment_type': 'Swing'
        }
    },
    {
        'name': 'Validate Ticker',
        'url': f'{BASE_URL}/api/business/ticker/validate',
        'method': 'POST',
        'data': {
            'symbol': 'AAPL',
            'name': 'Apple Inc.'
        }
    }
]


def measure_response_time(endpoint: Dict, iterations: int = 5) -> Dict:
    """Measure response time for an endpoint."""
    times = []
    errors = []
    
    for i in range(iterations):
        try:
            start_time = time.time()
            response = requests.post(
                endpoint['url'],
                json=endpoint['data'],
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            elapsed_time = (time.time() - start_time) * 1000  # Convert to ms
            
            times.append(elapsed_time)
            
            if response.status_code != 200:
                errors.append(f"HTTP {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            errors.append(str(e))
            times.append(None)
    
    # Filter out None values
    valid_times = [t for t in times if t is not None]
    
    if not valid_times:
        return {
            'name': endpoint['name'],
            'status': 'error',
            'errors': errors,
            'avg_time': None,
            'min_time': None,
            'max_time': None,
            'median_time': None,
            'stdev_time': None
        }
    
    return {
        'name': endpoint['name'],
        'status': 'success' if not errors else 'partial',
        'errors': errors,
        'avg_time': mean(valid_times),
        'min_time': min(valid_times),
        'max_time': max(valid_times),
        'median_time': median(valid_times),
        'stdev_time': stdev(valid_times) if len(valid_times) > 1 else 0,
        'iterations': len(valid_times),
        'total_iterations': iterations
    }


def main():
    """Main function to run response time tests."""
    print("=" * 80)
    print("Response Time Measurement - Business Logic API")
    print("=" * 80)
    print()
    
    results = []
    slow_endpoints = []
    
    for endpoint in ENDPOINTS:
        print(f"Testing: {endpoint['name']}...", end=' ', flush=True)
        result = measure_response_time(endpoint)
        results.append(result)
        
        if result['status'] == 'error':
            print(f"❌ ERROR")
            if result.get('errors'):
                print(f"   Errors: {', '.join(result['errors'][:3])}")
        elif result['avg_time'] and result['avg_time'] > 200:
            print(f"⚠️  SLOW ({result['avg_time']:.2f}ms)")
            slow_endpoints.append(result)
        else:
            print(f"✅ OK ({result['avg_time']:.2f}ms)")
    
    print()
    print("=" * 80)
    print("Summary")
    print("=" * 80)
    print()
    
    # Calculate overall statistics
    all_times = [r['avg_time'] for r in results if r['avg_time'] is not None]
    
    if all_times:
        print(f"Total Endpoints Tested: {len(results)}")
        print(f"Successful: {len([r for r in results if r['status'] == 'success'])}")
        print(f"With Errors: {len([r for r in results if r['status'] in ['error', 'partial']])}")
        print()
        print(f"Overall Statistics:")
        print(f"  Average Response Time: {mean(all_times):.2f}ms")
        print(f"  Median Response Time: {median(all_times):.2f}ms")
        print(f"  Min Response Time: {min(all_times):.2f}ms")
        print(f"  Max Response Time: {max(all_times):.2f}ms")
        print()
        
        # Check if all endpoints meet the < 200ms requirement
        slow_count = len([t for t in all_times if t > 200])
        if slow_count == 0:
            print("✅ All endpoints meet the < 200ms requirement!")
        else:
            print(f"⚠️  {slow_count} endpoint(s) exceed 200ms:")
            for result in slow_endpoints:
                print(f"   - {result['name']}: {result['avg_time']:.2f}ms")
    
    print()
    print("=" * 80)
    print("Detailed Results")
    print("=" * 80)
    print()
    
    # Sort by response time (slowest first)
    sorted_results = sorted(results, key=lambda x: x['avg_time'] if x['avg_time'] else float('inf'), reverse=True)
    
    for result in sorted_results:
        if result['avg_time']:
            status_icon = "⚠️ " if result['avg_time'] > 200 else "✅"
            print(f"{status_icon} {result['name']}:")
            print(f"   Avg: {result['avg_time']:.2f}ms | "
                  f"Min: {result['min_time']:.2f}ms | "
                  f"Max: {result['max_time']:.2f}ms | "
                  f"Median: {result['median_time']:.2f}ms")
            if result.get('errors'):
                print(f"   Errors: {', '.join(result['errors'][:2])}")
        else:
            print(f"❌ {result['name']}: ERROR")
            if result.get('errors'):
                print(f"   Errors: {', '.join(result['errors'][:2])}")
        print()
    
    # Save results to JSON file
    output_file = 'documentation/05-REPORTS/BUSINESS_LOGIC_RESPONSE_TIME_RESULTS.json'
    with open(output_file, 'w') as f:
        json.dump({
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'summary': {
                'total_endpoints': len(results),
                'successful': len([r for r in results if r['status'] == 'success']),
                'with_errors': len([r for r in results if r['status'] in ['error', 'partial']]),
                'avg_response_time': mean(all_times) if all_times else None,
                'median_response_time': median(all_times) if all_times else None,
                'slow_endpoints_count': len(slow_endpoints)
            },
            'results': results
        }, f, indent=2)
    
    print(f"Results saved to: {output_file}")


if __name__ == '__main__':
    main()

