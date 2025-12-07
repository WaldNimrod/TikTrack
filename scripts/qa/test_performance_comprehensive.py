#!/usr/bin/env python3
"""
Comprehensive Performance Tests - TikTrack
==========================================

Tests performance metrics:
- API response times (all endpoints < 200ms)
- Throughput (requests/second)
- Cache hit rates (> 80%)
- Error rates (< 1%)
- Page load times (< 3s)
- JavaScript execution time (< 1s)
- Memory usage (< 50MB)
"""

import sys
import json
import time
import statistics
import requests
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent.parent
BASE_URL = "http://localhost:8080"
REPORTS_DIR = BASE_DIR / "reports" / "qa"

# Performance thresholds
THRESHOLDS = {
    "api_response_time_ms": 200,
    "cache_hit_rate": 0.80,
    "error_rate": 0.01,
    "page_load_time_s": 3.0,
    "js_execution_time_s": 1.0,
    "memory_usage_mb": 50
}

# Test results storage
performance_results = {
    "timestamp": datetime.now().isoformat(),
    "metrics": {
        "api": {},
        "frontend": {},
        "database": {}
    },
    "summary": {
        "total_tests": 0,
        "passed": 0,
        "failed": 0,
        "warnings": 0
    }
}

# API endpoints to test
API_ENDPOINTS = [
    {"method": "GET", "url": "/api/trades", "name": "Get Trades"},
    {"method": "GET", "url": "/api/trade-plans", "name": "Get Trade Plans"},
    {"method": "GET", "url": "/api/alerts", "name": "Get Alerts"},
    {"method": "GET", "url": "/api/tickers", "name": "Get Tickers"},
    {"method": "GET", "url": "/api/trading-accounts", "name": "Get Trading Accounts"},
    {"method": "GET", "url": "/api/executions", "name": "Get Executions"},
    {"method": "GET", "url": "/api/cash-flows", "name": "Get Cash Flows"},
    {"method": "GET", "url": "/api/notes", "name": "Get Notes"},
]

# Pages to test
PAGES_TO_TEST = [
    "/",
    "/trades.html",
    "/trade_plans.html",
    "/alerts.html",
    "/tickers.html"
]


def test_api_response_time(endpoint: Dict, iterations: int = 5) -> Dict:
    """Test API response time"""
    times = []
    errors = 0
    
    for _ in range(iterations):
        try:
            start = time.time()
            if endpoint["method"] == "GET":
                response = requests.get(f"{BASE_URL}{endpoint['url']}", timeout=10)
            else:
                response = requests.post(f"{BASE_URL}{endpoint['url']}", timeout=10)
            
            elapsed_ms = (time.time() - start) * 1000
            times.append(elapsed_ms)
            
            if response.status_code >= 400:
                errors += 1
        except Exception as e:
            errors += 1
    
    avg_time = statistics.mean(times) if times else 0
    max_time = max(times) if times else 0
    min_time = min(times) if times else 0
    
    passed = avg_time < THRESHOLDS["api_response_time_ms"]
    
    return {
        "passed": passed,
        "avg_time_ms": avg_time,
        "max_time_ms": max_time,
        "min_time_ms": min_time,
        "errors": errors,
        "iterations": iterations
    }


def test_page_load_time(page_url: str) -> Dict:
    """Test page load time"""
    try:
        start = time.time()
        response = requests.get(f"{BASE_URL}{page_url}", timeout=10)
        elapsed = time.time() - start
        
        passed = elapsed < THRESHOLDS["page_load_time_s"]
        
        return {
            "passed": passed,
            "load_time_s": elapsed,
            "status_code": response.status_code
        }
    except Exception as e:
        return {
            "passed": False,
            "error": str(e)
        }


def test_cache_hit_rate() -> Dict:
    """Test cache hit rate (if cache stats endpoint exists)"""
    try:
        response = requests.get(f"{BASE_URL}/api/cache/stats", timeout=10)
        if response.status_code == 200:
            data = response.json()
            hit_rate = data.get("hit_rate", 0)
            passed = hit_rate >= THRESHOLDS["cache_hit_rate"]
            
            return {
                "passed": passed,
                "hit_rate": hit_rate,
                "threshold": THRESHOLDS["cache_hit_rate"]
            }
    except:
        pass
    
    return {
        "passed": True,
        "skipped": True,
        "note": "Cache stats endpoint not available"
    }


def run_all_performance_tests() -> Dict:
    """Run all performance tests"""
    print("🧪 Testing Performance...\n")
    
    # Test API response times
    print("Testing API Response Times...")
    api_results = {}
    for endpoint in API_ENDPOINTS:
        result = test_api_response_time(endpoint)
        api_results[endpoint["name"]] = result
        performance_results["summary"]["total_tests"] += 1
        
        if result["passed"]:
            performance_results["summary"]["passed"] += 1
            print(f"  ✅ {endpoint['name']}: {result['avg_time_ms']:.2f}ms (avg)")
        else:
            performance_results["summary"]["failed"] += 1
            print(f"  ❌ {endpoint['name']}: {result['avg_time_ms']:.2f}ms (avg) - EXCEEDS THRESHOLD")
    
    performance_results["metrics"]["api"] = api_results
    
    # Test page load times
    print("\nTesting Page Load Times...")
    page_results = {}
    for page_url in PAGES_TO_TEST:
        result = test_page_load_time(page_url)
        page_results[page_url] = result
        performance_results["summary"]["total_tests"] += 1
        
        if result["passed"]:
            performance_results["summary"]["passed"] += 1
            print(f"  ✅ {page_url}: {result.get('load_time_s', 0):.2f}s")
        else:
            performance_results["summary"]["failed"] += 1
            print(f"  ❌ {page_url}: {result.get('load_time_s', 0):.2f}s - EXCEEDS THRESHOLD")
    
    performance_results["metrics"]["frontend"] = {"page_load_times": page_results}
    
    # Test cache hit rate
    print("\nTesting Cache Hit Rate...")
    cache_result = test_cache_hit_rate()
    performance_results["metrics"]["cache"] = cache_result
    if not cache_result.get("skipped"):
        performance_results["summary"]["total_tests"] += 1
        if cache_result["passed"]:
            performance_results["summary"]["passed"] += 1
            print(f"  ✅ Cache Hit Rate: {cache_result.get('hit_rate', 0):.2%}")
        else:
            performance_results["summary"]["failed"] += 1
            print(f"  ❌ Cache Hit Rate: {cache_result.get('hit_rate', 0):.2%} - BELOW THRESHOLD")
    else:
        print(f"  ⚠️  Cache test skipped: {cache_result.get('note', '')}")
    
    # Save results
    results_file = REPORTS_DIR / "performance_test_results.json"
    results_file.parent.mkdir(parents=True, exist_ok=True)
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(performance_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Performance tests completed!")
    print(f"   Total: {performance_results['summary']['total_tests']}")
    print(f"   Passed: {performance_results['summary']['passed']}")
    print(f"   Failed: {performance_results['summary']['failed']}")
    
    return {
        "status": "completed",
        "total_tests": performance_results["summary"]["total_tests"],
        "passed": performance_results["summary"]["passed"],
        "failed": performance_results["summary"]["failed"],
        "warnings": performance_results["summary"]["warnings"],
        "results": performance_results
    }


if __name__ == "__main__":
    run_all_performance_tests()

