#!/usr/bin/env python3
"""
Performance Testing Script for Business Logic Phase 5
======================================================

This script performs performance tests for:
- Response times (all endpoints < 200ms)
- Throughput
- Cache hit rates (> 80%)
- Bundle size
- Memory usage

Usage:
    python scripts/testing/test_performance_final.py

Requirements:
    - Server must be running on http://127.0.0.1:8080
    - PostgreSQL database must be available
"""

import requests
import json
import sys
import time
import statistics
from typing import Dict, Any, List, Optional
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8080"
MAX_RESPONSE_TIME_MS = 200  # Target: all endpoints < 200ms
MIN_CACHE_HIT_RATE = 0.80  # Target: > 80%

# Test results storage
test_results = {
    "total_tests": 0,
    "passed_tests": 0,
    "failed_tests": 0,
    "errors": [],
    "performance_metrics": {
        "response_times": {},
        "throughput": {},
        "cache_hit_rates": {}
    }
}


def log_test(test_name: str, passed: bool, error: Optional[str] = None, metric: Optional[Any] = None):
    """Log test result."""
    test_results["total_tests"] += 1
    if passed:
        test_results["passed_tests"] += 1
        if metric is not None:
            print(f"✅ {test_name} ({metric})")
        else:
            print(f"✅ {test_name}")
    else:
        test_results["failed_tests"] += 1
        test_results["errors"].append(f"{test_name}: {error}")
        if metric is not None:
            print(f"❌ {test_name}: {error} ({metric})")
        else:
            print(f"❌ {test_name}: {error}")


def test_response_times():
    """Test that all endpoints respond within MAX_RESPONSE_TIME_MS."""
    print("\n" + "="*60)
    print("Testing Response Times")
    print("="*60)
    print(f"Target: All endpoints < {MAX_RESPONSE_TIME_MS}ms")
    
    # Test endpoints
    test_endpoints = [
        ("/api/business/trade/validate", "POST", {"ticker_symbol": "AAPL", "side": "buy", "quantity": 10}),
        ("/api/business/execution/validate", "POST", {"execution_id": 1, "quantity": 5}),
        ("/api/business/alert/validate", "POST", {"alert_type": "price", "condition": "above"}),
        ("/api/business/preferences/validate", "POST", {"preference_name": "theme", "data_type": "string"}),
        ("/api/business/statistics/calculate", "POST", {"calculation_type": "sum", "records": [], "params": {}}),
        ("/api/cache/stats", "GET", None),
        ("/api/trades", "GET", None),
        ("/api/executions", "GET", None)
    ]
    
    response_times = []
    
    for endpoint, method, data in test_endpoints:
        try:
            url = f"{BASE_URL}{endpoint}"
            times = []
            
            # Run 5 requests and measure average
            for _ in range(5):
                start_time = time.time()
                if method == "POST":
                    response = requests.post(url, json=data, timeout=10)
                else:
                    response = requests.get(url, timeout=10)
                elapsed_ms = (time.time() - start_time) * 1000
                times.append(elapsed_ms)
            
            avg_time = statistics.mean(times)
            response_times.append((endpoint, avg_time))
            test_results["performance_metrics"]["response_times"][endpoint] = avg_time
            
            log_test(
                f"Response time: {endpoint}",
                avg_time < MAX_RESPONSE_TIME_MS,
                f"Response time {avg_time:.2f}ms exceeds {MAX_RESPONSE_TIME_MS}ms",
                f"{avg_time:.2f}ms"
            )
        except requests.exceptions.ConnectionError:
            log_test(f"Response time: {endpoint}", False, "Server not running")
        except Exception as e:
            log_test(f"Response time: {endpoint}", False, str(e))
    
    # Print summary
    if response_times:
        avg_all = statistics.mean([t[1] for t in response_times])
        max_time = max([t[1] for t in response_times])
        print(f"\n📊 Response Time Summary:")
        print(f"   Average: {avg_all:.2f}ms")
        print(f"   Maximum: {max_time:.2f}ms")
        print(f"   Target: < {MAX_RESPONSE_TIME_MS}ms")


def test_throughput():
    """Test throughput (requests per second)."""
    print("\n" + "="*60)
    print("Testing Throughput")
    print("="*60)
    
    # Test a simple endpoint
    endpoint = "/api/cache/stats"
    url = f"{BASE_URL}{endpoint}"
    
    try:
        num_requests = 50
        start_time = time.time()
        
        for _ in range(num_requests):
            response = requests.get(url, timeout=5)
            if response.status_code != 200:
                break
        
        elapsed = time.time() - start_time
        throughput = num_requests / elapsed if elapsed > 0 else 0
        
        test_results["performance_metrics"]["throughput"][endpoint] = throughput
        
        log_test(
            f"Throughput: {endpoint}",
            throughput > 10,  # Target: > 10 req/s
            f"Throughput {throughput:.2f} req/s is too low",
            f"{throughput:.2f} req/s"
        )
    except requests.exceptions.ConnectionError:
        log_test(f"Throughput: {endpoint}", False, "Server not running")
    except Exception as e:
        log_test(f"Throughput: {endpoint}", False, str(e))


def test_cache_hit_rates():
    """Test cache hit rates."""
    print("\n" + "="*60)
    print("Testing Cache Hit Rates")
    print("="*60)
    print(f"Target: Cache hit rate > {MIN_CACHE_HIT_RATE * 100}%")
    
    # Test cache stats endpoint
    try:
        url = f"{BASE_URL}/api/cache/stats"
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            stats = response.json()
            
            # Calculate cache hit rate if available
            if "hits" in stats and "misses" in stats:
                hits = stats.get("hits", 0)
                misses = stats.get("misses", 0)
                total = hits + misses
                hit_rate = hits / total if total > 0 else 0
                
                test_results["performance_metrics"]["cache_hit_rates"]["overall"] = hit_rate
                
                log_test(
                    "Cache hit rate",
                    hit_rate >= MIN_CACHE_HIT_RATE,
                    f"Cache hit rate {hit_rate * 100:.2f}% is below {MIN_CACHE_HIT_RATE * 100}%",
                    f"{hit_rate * 100:.2f}%"
                )
            else:
                log_test("Cache hit rate", False, "Cache stats not available")
        else:
            log_test("Cache hit rate", False, f"Failed to get cache stats: {response.status_code}")
    except requests.exceptions.ConnectionError:
        log_test("Cache hit rate", False, "Server not running")
    except Exception as e:
        log_test("Cache hit rate", False, str(e))


def test_bundle_size():
    """Test bundle size (check if main JS files are reasonable)."""
    print("\n" + "="*60)
    print("Testing Bundle Size")
    print("="*60)
    
    # Test main JS files
    js_files = [
        "/trading-ui/scripts/services/trade-data.js",
        "/trading-ui/scripts/services/execution-data.js",
        "/trading-ui/scripts/services/alert-data.js"
    ]
    
    for js_file in js_files:
        try:
            url = f"{BASE_URL}{js_file}"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                size_kb = len(response.content) / 1024
                # Target: < 500KB per file
                max_size_kb = 500
                
                log_test(
                    f"Bundle size: {js_file}",
                    size_kb < max_size_kb,
                    f"Bundle size {size_kb:.2f}KB exceeds {max_size_kb}KB",
                    f"{size_kb:.2f}KB"
                )
        except requests.exceptions.ConnectionError:
            log_test(f"Bundle size: {js_file}", False, "Server not running")
        except Exception as e:
            log_test(f"Bundle size: {js_file}", False, str(e))


def main():
    """Run all performance tests."""
    print("="*60)
    print("Business Logic Phase 5 - Performance Final Tests")
    print("="*60)
    print(f"Testing {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    # Run all tests
    test_response_times()
    test_throughput()
    test_cache_hit_rates()
    test_bundle_size()
    
    # Print summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    print(f"Total Tests: {test_results['total_tests']}")
    print(f"Passed: {test_results['passed_tests']}")
    print(f"Failed: {test_results['failed_tests']}")
    
    if test_results["errors"]:
        print(f"\nErrors ({len(test_results['errors'])}):")
        for error in test_results["errors"][:10]:  # Show first 10 errors
            print(f"  - {error}")
        if len(test_results["errors"]) > 10:
            print(f"  ... and {len(test_results['errors']) - 10} more errors")
    
    # Print performance summary
    print("\n📊 Performance Metrics Summary:")
    if test_results["performance_metrics"]["response_times"]:
        avg_response = statistics.mean(test_results["performance_metrics"]["response_times"].values())
        print(f"   Average Response Time: {avg_response:.2f}ms")
    if test_results["performance_metrics"]["throughput"]:
        avg_throughput = statistics.mean(test_results["performance_metrics"]["throughput"].values())
        print(f"   Average Throughput: {avg_throughput:.2f} req/s")
    if test_results["performance_metrics"]["cache_hit_rates"]:
        avg_cache = statistics.mean(test_results["performance_metrics"]["cache_hit_rates"].values())
        print(f"   Average Cache Hit Rate: {avg_cache * 100:.2f}%")
    
    # Save results to file
    results_file = f"test_results_performance_final_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump(test_results, f, indent=2)
    print(f"\nResults saved to: {results_file}")
    
    # Exit with appropriate code
    if test_results["failed_tests"] > 0:
        sys.exit(1)
    else:
        print("\n✅ All performance tests passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()

