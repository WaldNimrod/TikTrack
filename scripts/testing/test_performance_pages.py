#!/usr/bin/env python3
"""
Comprehensive Page Performance Testing Script
============================================

This script performs comprehensive performance testing for all pages:
- Page load time
- Network requests count and size
- Resource loading times
- Console errors
- Rate limiting issues
- Memory usage (if available)

Usage:
    python3 scripts/testing/test_performance_pages.py
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from collections import defaultdict

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("❌ Error: selenium or webdriver-manager not installed.")
    print("   Install with: pip install selenium webdriver-manager")
    exit(1)

BASE_URL = "http://localhost:8080"

# Priority pages for testing
PRIORITY_PAGES = [
    {"name": "דף הבית", "url": "/", "category": "main", "priority": "high"},
    {"name": "טריידים", "url": "/trades.html", "category": "main", "priority": "high"},
    {"name": "תכניות מסחר", "url": "/trade_plans.html", "category": "main", "priority": "high"},
    {"name": "התראות", "url": "/alerts.html", "category": "main", "priority": "high"},
    {"name": "טיקרים", "url": "/tickers.html", "category": "main", "priority": "high"},
    {"name": "חשבונות מסחר", "url": "/trading_accounts.html", "category": "main", "priority": "high"},
    {"name": "ביצועים", "url": "/executions.html", "category": "main", "priority": "high"},
    {"name": "תזרימי מזומן", "url": "/cash_flows.html", "category": "main", "priority": "high"},
    {"name": "העדפות", "url": "/preferences.html", "category": "main", "priority": "high"},
]

# Performance thresholds
PERFORMANCE_THRESHOLDS = {
    'page_load_time': 3000,  # 3 seconds
    'total_load_time': 5000,  # 5 seconds
    'network_requests': 100,  # Max 100 requests
    'total_size_mb': 5.0,  # Max 5MB total
    'largest_resource_mb': 1.0,  # Max 1MB per resource
    'script_count': 50,  # Max 50 scripts
}


def setup_driver():
    """Setup Chrome WebDriver with performance logging"""
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
    
    # Enable performance and browser logging
    chrome_options.set_capability('goog:loggingPrefs', {
        'browser': 'ALL',
        'performance': 'ALL'
    })
    
    # Enable performance logging
    chrome_options.set_capability('goog:chromeOptions', {
        'perfLoggingPrefs': {
            'enableNetwork': True,
            'enablePage': True
        }
    })
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        print(f"❌ Error setting up Chrome driver: {e}")
        print("💡 Make sure Chrome browser is installed")
        return None


def analyze_performance_metrics(driver) -> Dict:
    """Analyze performance metrics from browser"""
    metrics = {
        'navigation_timing': {},
        'resource_timing': [],
        'network_requests': [],
        'console_errors': [],
        'console_warnings': [],
        'rate_limit_errors': [],
        'large_resources': [],
        'slow_resources': []
    }
    
    try:
        # Get navigation timing
        nav_timing = driver.execute_script("""
            if (window.performance && window.performance.timing) {
                const timing = window.performance.timing;
                return {
                    navigationStart: timing.navigationStart,
                    domLoading: timing.domLoading,
                    domInteractive: timing.domInteractive,
                    domContentLoaded: timing.domContentLoadedEventStart,
                    loadEventStart: timing.loadEventStart,
                    loadEventEnd: timing.loadEventEnd,
                    fetchStart: timing.fetchStart,
                    responseStart: timing.responseStart,
                    responseEnd: timing.responseEnd
                };
            }
            return null;
        """)
        
        if nav_timing:
            metrics['navigation_timing'] = {
                'dom_loading': nav_timing.get('domLoading', 0) - nav_timing.get('navigationStart', 0),
                'dom_interactive': nav_timing.get('domInteractive', 0) - nav_timing.get('navigationStart', 0),
                'dom_content_loaded': nav_timing.get('domContentLoaded', 0) - nav_timing.get('navigationStart', 0),
                'load_complete': nav_timing.get('loadEventEnd', 0) - nav_timing.get('navigationStart', 0),
                'fetch_to_response': nav_timing.get('responseEnd', 0) - nav_timing.get('fetchStart', 0),
            }
        
        # Get resource timing
        resource_timing = driver.execute_script("""
            if (window.performance && window.performance.getEntriesByType) {
                const resources = window.performance.getEntriesByType('resource');
                return resources.map(r => ({
                    name: r.name,
                    type: r.initiatorType,
                    duration: r.duration,
                    size: r.transferSize || 0,
                    startTime: r.startTime,
                    responseEnd: r.responseEnd
                }));
            }
            return [];
        """)
        
        metrics['resource_timing'] = resource_timing
        
        # Analyze resources
        total_size = 0
        for resource in resource_timing:
            size = resource.get('size', 0)
            duration = resource.get('duration', 0)
            name = resource.get('name', '')
            
            total_size += size
            
            # Track large resources (>500KB)
            if size > 500 * 1024:
                metrics['large_resources'].append({
                    'name': name.split('/')[-1],
                    'url': name,
                    'size_mb': size / (1024 * 1024),
                    'type': resource.get('type', 'unknown')
                })
            
            # Track slow resources (>1 second)
            if duration > 1000:
                metrics['slow_resources'].append({
                    'name': name.split('/')[-1],
                    'url': name,
                    'duration_ms': duration,
                    'type': resource.get('type', 'unknown')
                })
        
        metrics['total_size_mb'] = total_size / (1024 * 1024)
        metrics['total_requests'] = len(resource_timing)
        
        # Get network requests from performance logs
        try:
            perf_logs = driver.get_log('performance')
            for log in perf_logs:
                message = json.loads(log.get('message', '{}'))
                method = message.get('message', {}).get('method', '')
                params = message.get('message', {}).get('params', {})
                
                if method == 'Network.responseReceived':
                    response = params.get('response', {})
                    url = response.get('url', '')
                    status = response.get('status', 0)
                    mime_type = response.get('mimeType', '')
                    
                    # Track rate limit errors
                    if status == 429:
                        metrics['rate_limit_errors'].append({
                            'url': url,
                            'status': status,
                            'type': mime_type
                        })
                    
                    metrics['network_requests'].append({
                        'url': url,
                        'status': status,
                        'type': mime_type
                    })
        except Exception as e:
            print(f"  ⚠️  Could not parse performance logs: {e}")
        
        # Get console errors
        logs = driver.get_log('browser')
        for log in logs:
            level = log.get('level', '').upper()
            message = log.get('message', '')
            
            # Filter out non-critical messages
            if 'favicon' in message.lower() or 'chrome-extension' in message.lower():
                continue
            
            # Track rate limit errors
            if '429' in message or 'Too Many Requests' in message:
                metrics['rate_limit_errors'].append({
                    'message': message,
                    'level': level
                })
            
            if level == 'SEVERE' or 'error' in message.lower():
                # Filter out expected auth errors
                if '401 (UNAUTHORIZED)' in message and '/api/auth/me' in message:
                    continue
                metrics['console_errors'].append({
                    'level': level,
                    'message': message
                })
            elif level == 'WARNING' or 'warning' in message.lower():
                metrics['console_warnings'].append({
                    'level': level,
                    'message': message
                })
        
        # Get script count
        script_count = driver.execute_script("""
            return document.querySelectorAll('script[src]').length;
        """)
        metrics['script_count'] = script_count
        
        # Get memory usage if available
        memory_info = driver.execute_script("""
            if (window.performance && window.performance.memory) {
                return {
                    used: window.performance.memory.usedJSHeapSize,
                    total: window.performance.memory.totalJSHeapSize,
                    limit: window.performance.memory.jsHeapSizeLimit
                };
            }
            return null;
        """)
        
        if memory_info:
            metrics['memory_usage'] = {
                'used_mb': memory_info['used'] / (1024 * 1024),
                'total_mb': memory_info['total'] / (1024 * 1024),
                'limit_mb': memory_info['limit'] / (1024 * 1024)
            }
        
    except Exception as e:
        print(f"  ⚠️  Error analyzing performance: {e}")
    
    return metrics


def test_page_performance(driver, page_info) -> Dict:
    """Test performance for a single page"""
    url = BASE_URL + page_info["url"]
    result = {
        "page": page_info["name"],
        "url": page_info["url"],
        "category": page_info["category"],
        "priority": page_info["priority"],
        "success": False,
        "load_time": None,
        "performance_metrics": {},
        "issues": [],
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Clear previous logs
        driver.get_log('browser')
        driver.get_log('performance')
        
        # Navigate to page
        start_time = time.time()
        driver.get(url)
        
        # Wait for page to load
        try:
            WebDriverWait(driver, 15).until(
                lambda d: d.execute_script('return document.readyState') == 'complete'
            )
        except TimeoutException:
            result["issues"].append("Page load timeout (>15s)")
        
        # Wait additional time for JavaScript to execute
        time.sleep(3)
        
        result["load_time"] = time.time() - start_time
        
        # Analyze performance
        metrics = analyze_performance_metrics(driver)
        result["performance_metrics"] = metrics
        
        # Check thresholds and identify issues
        issues = []
        
        # Check load time
        if result["load_time"] > PERFORMANCE_THRESHOLDS['page_load_time'] / 1000:
            issues.append({
                'type': 'slow_load',
                'severity': 'high',
                'message': f"Page load time {result['load_time']:.2f}s exceeds threshold {PERFORMANCE_THRESHOLDS['page_load_time']/1000:.1f}s"
            })
        
        # Check total requests
        if metrics.get('total_requests', 0) > PERFORMANCE_THRESHOLDS['network_requests']:
            issues.append({
                'type': 'too_many_requests',
                'severity': 'medium',
                'message': f"Too many network requests: {metrics.get('total_requests', 0)} (threshold: {PERFORMANCE_THRESHOLDS['network_requests']})"
            })
        
        # Check total size
        if metrics.get('total_size_mb', 0) > PERFORMANCE_THRESHOLDS['total_size_mb']:
            issues.append({
                'type': 'large_total_size',
                'severity': 'medium',
                'message': f"Total resource size {metrics.get('total_size_mb', 0):.2f}MB exceeds threshold {PERFORMANCE_THRESHOLDS['total_size_mb']}MB"
            })
        
        # Check script count
        if metrics.get('script_count', 0) > PERFORMANCE_THRESHOLDS['script_count']:
            issues.append({
                'type': 'too_many_scripts',
                'severity': 'medium',
                'message': f"Too many scripts: {metrics.get('script_count', 0)} (threshold: {PERFORMANCE_THRESHOLDS['script_count']})"
            })
        
        # Check rate limit errors
        if metrics.get('rate_limit_errors'):
            issues.append({
                'type': 'rate_limiting',
                'severity': 'high',
                'message': f"Rate limiting detected: {len(metrics.get('rate_limit_errors', []))} resources blocked (429 errors)"
            })
        
        # Check console errors
        if metrics.get('console_errors'):
            critical_errors = [e for e in metrics.get('console_errors', []) 
                            if any(keyword in e.get('message', '').lower() 
                                  for keyword in ['maximum call stack', 'uncaught', 'syntaxerror', 'referenceerror'])]
            if critical_errors:
                issues.append({
                    'type': 'critical_errors',
                    'severity': 'high',
                    'message': f"Critical JavaScript errors: {len(critical_errors)}"
                })
        
        # Check large resources
        if metrics.get('large_resources'):
            issues.append({
                'type': 'large_resources',
                'severity': 'low',
                'message': f"Large resources detected: {len(metrics.get('large_resources', []))} resources >500KB"
            })
        
        # Check slow resources
        if metrics.get('slow_resources'):
            issues.append({
                'type': 'slow_resources',
                'severity': 'medium',
                'message': f"Slow resources detected: {len(metrics.get('slow_resources', []))} resources >1s"
            })
        
        result["issues"] = issues
        result["success"] = len([i for i in issues if i['severity'] == 'high']) == 0
        
    except WebDriverException as e:
        result["issues"].append({
            'type': 'webdriver_error',
            'severity': 'high',
            'message': f"WebDriver error: {str(e)}"
        })
    except Exception as e:
        result["issues"].append({
            'type': 'exception',
            'severity': 'high',
            'message': f"Exception: {str(e)}"
        })
    
    return result


def main():
    """Main test function"""
    print("=" * 80)
    print("🔍 בדיקת ביצועים מקיפה - כל העמודים")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print(f"Total pages to test: {len(PRIORITY_PAGES)}")
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    print()
    
    driver = setup_driver()
    if not driver:
        print("❌ Failed to setup WebDriver. Exiting.")
        return
    
    results = []
    
    try:
        for i, page in enumerate(PRIORITY_PAGES, 1):
            print(f"[{i}/{len(PRIORITY_PAGES)}] Testing: {page['name']} ({page['url']})")
            
            result = test_page_performance(driver, page)
            results.append(result)
            
            # Print summary
            status_icon = "✅" if result["success"] else "❌"
            high_severity_issues = [i for i in result["issues"] if i['severity'] == 'high']
            
            print(f"  {status_icon} Status: {'OK' if result['success'] else 'ISSUES FOUND'}")
            print(f"  ⏱️  Load time: {result['load_time']:.2f}s")
            
            metrics = result.get('performance_metrics', {})
            print(f"  📊 Requests: {metrics.get('total_requests', 0)}")
            print(f"  📦 Total size: {metrics.get('total_size_mb', 0):.2f}MB")
            print(f"  📜 Scripts: {metrics.get('script_count', 0)}")
            
            if metrics.get('rate_limit_errors'):
                print(f"  ⚠️  Rate limit errors: {len(metrics.get('rate_limit_errors', []))}")
            
            if metrics.get('console_errors'):
                print(f"  ❌ Console errors: {len(metrics.get('console_errors', []))}")
            
            if high_severity_issues:
                print(f"  🔴 High severity issues: {len(high_severity_issues)}")
                for issue in high_severity_issues[:3]:
                    print(f"     • {issue['message']}")
            
            if metrics.get('large_resources'):
                print(f"  📦 Large resources: {len(metrics.get('large_resources', []))}")
                for resource in metrics.get('large_resources', [])[:3]:
                    print(f"     • {resource['name']}: {resource['size_mb']:.2f}MB")
            
            print()
            
            # Small delay between pages
            time.sleep(2)
    
    finally:
        driver.quit()
    
    # Summary
    print("=" * 80)
    print("📊 סיכום תוצאות")
    print("=" * 80)
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    # Calculate averages
    avg_load_time = sum(r["load_time"] for r in results if r["load_time"]) / len(results) if results else 0
    avg_requests = sum(r["performance_metrics"].get('total_requests', 0) for r in results) / len(results) if results else 0
    avg_size = sum(r["performance_metrics"].get('total_size_mb', 0) for r in results) / len(results) if results else 0
    
    print(f"✅ עמודים ללא בעיות: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
    print(f"❌ עמודים עם בעיות: {len(failed)}/{len(results)} ({len(failed)/len(results)*100:.1f}%)")
    print()
    print(f"⏱️  זמן טעינה ממוצע: {avg_load_time:.2f}s")
    print(f"📊 בקשות רשת ממוצעות: {avg_requests:.0f}")
    print(f"📦 גודל ממוצע: {avg_size:.2f}MB")
    print()
    
    # Issue summary
    all_issues = []
    for r in results:
        all_issues.extend(r["issues"])
    
    issue_counts = defaultdict(int)
    for issue in all_issues:
        issue_counts[issue['type']] += 1
    
    if issue_counts:
        print("🔴 סיכום בעיות:")
        for issue_type, count in sorted(issue_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  • {issue_type}: {count}")
        print()
    
    # Rate limiting summary
    total_rate_limits = sum(len(r["performance_metrics"].get('rate_limit_errors', [])) for r in results)
    if total_rate_limits > 0:
        print(f"⚠️  Total rate limit errors: {total_rate_limits}")
        print()
    
    # Large resources summary
    all_large_resources = []
    for r in results:
        all_large_resources.extend(r["performance_metrics"].get('large_resources', []))
    
    if all_large_resources:
        print("📦 קבצים גדולים ביותר:")
        sorted_resources = sorted(all_large_resources, key=lambda x: x['size_mb'], reverse=True)
        for resource in sorted_resources[:10]:
            print(f"  • {resource['name']}: {resource['size_mb']:.2f}MB ({resource['type']})")
        print()
    
    # Save results
    output_file = Path(__file__).parent.parent / "performance_test_report.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "base_url": BASE_URL,
            "total_pages": len(results),
            "successful": len(successful),
            "failed": len(failed),
            "averages": {
                "load_time": avg_load_time,
                "requests": avg_requests,
                "size_mb": avg_size
            },
            "issue_summary": dict(issue_counts),
            "total_rate_limits": total_rate_limits,
            "results": results
        }, f, ensure_ascii=False, indent=2)
    
    print(f"💾 תוצאות נשמרו ל: {output_file}")
    print()
    print("=" * 80)
    print(f"✅ בדיקה הושלמה: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)


if __name__ == "__main__":
    main()

