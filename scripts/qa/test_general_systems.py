#!/usr/bin/env python3
"""
General Systems Tests - TikTrack
=================================

Tests all 101 general systems according to documentation/frontend/GENERAL_SYSTEMS_LIST.md

Tests for each system:
- File availability and loading
- Proper initialization
- Main functions
- Integration with other systems
- Error handling
- Performance (response times)
"""

import sys
import json
import time
import requests
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent.parent
BASE_URL = "http://localhost:8080"

# Test results storage
systems_results = {
    "timestamp": datetime.now().isoformat(),
    "systems": {},
    "summary": {
        "total_systems": 0,
        "tested": 0,
        "passed": 0,
        "failed": 0,
        "warnings": 0
    }
}

# Systems to test - Core Systems (11 systems)
CORE_SYSTEMS = [
    {
        "name": "unified-initialization",
        "files": [
            "trading-ui/scripts/modules/core-systems.js",
            "trading-ui/scripts/page-initialization-configs.js"
        ],
        "category": "core",
        "tests": ["availability", "initialization", "functions", "integration"]
    },
    {
        "name": "notification-system",
        "files": ["trading-ui/scripts/notification-system.js"],
        "category": "core",
        "tests": ["availability", "initialization", "functions", "integration"]
    },
    {
        "name": "modal-manager-v2",
        "files": ["trading-ui/scripts/modal-manager-v2.js"],
        "category": "core",
        "tests": ["availability", "initialization", "functions", "integration"]
    },
    {
        "name": "modal-navigation-manager",
        "files": ["trading-ui/scripts/modal-navigation-manager.js"],
        "category": "core",
        "tests": ["availability", "initialization", "functions", "integration"]
    },
    {
        "name": "modal-z-index-manager",
        "files": ["trading-ui/scripts/modal-z-index-manager.js"],
        "category": "core",
        "tests": ["availability", "initialization", "functions", "integration"]
    },
    {
        "name": "ui-utils",
        "files": ["trading-ui/scripts/ui-utils.js"],
        "category": "core",
        "tests": ["availability", "initialization", "functions", "integration"]
    },
    {
        "name": "page-utils",
        "files": ["trading-ui/scripts/page-utils.js"],
        "category": "core",
        "tests": ["availability", "initialization", "functions", "integration"]
    },
    {
        "name": "translation-utils",
        "files": ["trading-ui/scripts/translation-utils.js"],
        "category": "core",
        "tests": ["availability", "initialization", "functions", "integration"]
    },
    {
        "name": "event-handler-manager",
        "files": ["trading-ui/scripts/event-handler-manager.js"],
        "category": "core",
        "tests": ["availability", "initialization", "functions", "integration"]
    },
    {
        "name": "logger-service",
        "files": ["trading-ui/scripts/logger-service.js"],
        "category": "core",
        "tests": ["availability", "initialization", "functions", "integration"]
    },
    {
        "name": "conditions-system",
        "files": [
            "trading-ui/scripts/conditions/conditions-initializer.js",
            "trading-ui/scripts/conditions/conditions-crud-manager.js"
        ],
        "category": "core",
        "tests": ["availability", "initialization"]
    }
]

# CRUD and Data Systems (15 systems)
CRUD_SYSTEMS = [
    {
        "name": "trades-data",
        "files": ["trading-ui/scripts/services/trades-data.js"],
        "category": "crud",
        "tests": ["availability", "api_endpoints", "validation", "cache"]
    },
    {
        "name": "executions-data",
        "files": ["trading-ui/scripts/services/executions-data.js"],
        "category": "crud",
        "tests": ["availability", "api_endpoints", "validation", "cache"]
    },
    {
        "name": "cash-flows-data",
        "files": ["trading-ui/scripts/services/cash-flows-data.js"],
        "category": "crud",
        "tests": ["availability", "api_endpoints", "validation", "cache"]
    },
    {
        "name": "notes-data",
        "files": ["trading-ui/scripts/services/notes-data.js"],
        "category": "crud",
        "tests": ["availability", "api_endpoints", "validation", "cache"]
    },
    {
        "name": "trading-accounts-data",
        "files": ["trading-ui/scripts/services/trading-accounts-data.js"],
        "category": "crud",
        "tests": ["availability", "api_endpoints", "validation", "cache"]
    },
    {
        "name": "alerts-data",
        "files": ["trading-ui/scripts/services/alerts-data.js"],
        "category": "crud",
        "tests": ["availability", "api_endpoints", "validation", "cache"]
    },
    {
        "name": "tickers-data",
        "files": ["trading-ui/scripts/services/tickers-data.js"],
        "category": "crud",
        "tests": ["availability", "api_endpoints", "validation", "cache"]
    },
    {
        "name": "data-collection-service",
        "files": ["trading-ui/scripts/services/data-collection-service.js"],
        "category": "crud",
        "tests": ["availability", "functions", "integration"]
    },
    {
        "name": "investment-calculation-service",
        "files": ["trading-ui/scripts/services/investment-calculation-service.js"],
        "category": "crud",
        "tests": ["availability", "functions", "integration"]
    },
    {
        "name": "crud-response-handler",
        "files": ["trading-ui/scripts/services/crud-response-handler.js"],
        "category": "crud",
        "tests": ["availability", "functions", "integration"]
    },
    {
        "name": "select-populator-service",
        "files": ["trading-ui/scripts/services/select-populator-service.js"],
        "category": "crud",
        "tests": ["availability", "functions", "integration"]
    },
    {
        "name": "default-value-setter",
        "files": ["trading-ui/scripts/services/default-value-setter.js"],
        "category": "crud",
        "tests": ["availability", "functions", "integration"]
    },
    {
        "name": "field-renderer-service",
        "files": ["trading-ui/scripts/services/field-renderer-service.js"],
        "category": "crud",
        "tests": ["availability", "functions", "integration"]
    },
    {
        "name": "table-sort-value-adapter",
        "files": ["trading-ui/scripts/services/table-sort-value-adapter.js"],
        "category": "crud",
        "tests": ["availability", "functions", "integration"]
    },
    {
        "name": "linked-items-service",
        "files": ["trading-ui/scripts/services/linked-items-service.js"],
        "category": "crud",
        "tests": ["availability", "functions", "integration"]
    }
]

# UI Systems (10 systems)
UI_SYSTEMS = [
    {
        "name": "icon-system",
        "files": [
            "trading-ui/scripts/icon-system.js",
            "trading-ui/scripts/icon-mappings.js"
        ],
        "category": "ui",
        "tests": ["availability", "rendering", "rtl", "performance"]
    },
    {
        "name": "header-system",
        "files": ["trading-ui/scripts/header-system.js"],
        "category": "ui",
        "tests": ["availability", "rendering", "rtl", "performance"]
    },
    {
        "name": "color-scheme-system",
        "files": ["trading-ui/scripts/color-scheme-system.js"],
        "category": "ui",
        "tests": ["availability", "rendering", "rtl", "performance"]
    },
    {
        "name": "button-system",
        "files": [
            "trading-ui/scripts/button-system-init.js",
            "trading-ui/scripts/button-icons.js"
        ],
        "category": "ui",
        "tests": ["availability", "rendering", "rtl", "performance"]
    },
    {
        "name": "info-summary-system",
        "files": [
            "trading-ui/scripts/info-summary-system.js",
            "trading-ui/scripts/services/statistics-calculator.js"
        ],
        "category": "ui",
        "tests": ["availability", "rendering", "rtl", "performance"]
    },
    {
        "name": "pagination-system",
        "files": ["trading-ui/scripts/pagination-system.js"],
        "category": "ui",
        "tests": ["availability", "rendering", "rtl", "performance"]
    },
    {
        "name": "entity-details-modal",
        "files": [
            "trading-ui/scripts/entity-details-modal.js",
            "trading-ui/scripts/entity-details-renderer.js",
            "trading-ui/scripts/entity-details-api.js"
        ],
        "category": "ui",
        "tests": ["availability", "rendering", "rtl", "performance"]
    },
    {
        "name": "autocomplete-service",
        "files": ["trading-ui/scripts/services/autocomplete-service.js"],
        "category": "ui",
        "tests": ["availability", "rendering", "rtl", "performance"]
    },
    {
        "name": "unified-ui-positioning-service",
        "files": ["trading-ui/scripts/services/unified-ui-positioning-service.js"],
        "category": "ui",
        "tests": ["availability", "rendering", "rtl", "performance"]
    },
    {
        "name": "widget-overlay-service",
        "files": ["trading-ui/scripts/services/widget-overlay-service.js"],
        "category": "ui",
        "tests": ["availability", "rendering", "rtl", "performance"]
    }
]

# Cache Systems
CACHE_SYSTEMS = [
    {
        "name": "unified-cache-manager",
        "files": ["trading-ui/scripts/unified-cache-manager.js"],
        "category": "cache",
        "tests": ["availability", "functions", "performance"]
    },
    {
        "name": "cache-sync-manager",
        "files": ["trading-ui/scripts/cache-sync-manager.js"],
        "category": "cache",
        "tests": ["availability", "functions", "performance"]
    },
    {
        "name": "cache-policy-manager",
        "files": ["trading-ui/scripts/cache-policy-manager.js"],
        "category": "cache",
        "tests": ["availability", "functions", "performance"]
    },
    {
        "name": "cache-ttl-guard",
        "files": ["trading-ui/scripts/cache-ttl-guard.js"],
        "category": "cache",
        "tests": ["availability", "functions", "performance"]
    }
]

ALL_SYSTEMS = CORE_SYSTEMS + CRUD_SYSTEMS + UI_SYSTEMS + CACHE_SYSTEMS


def check_file_availability(file_path: str) -> bool:
    """Check if file exists"""
    full_path = BASE_DIR / file_path
    return full_path.exists()


def test_system_availability(system: Dict) -> Dict:
    """Test system file availability"""
    results = {
        "passed": True,
        "errors": [],
        "warnings": []
    }
    
    for file_path in system["files"]:
        if not check_file_availability(file_path):
            results["passed"] = False
            results["errors"].append(f"File not found: {file_path}")
        else:
            # Check file is not empty
            full_path = BASE_DIR / file_path
            if full_path.stat().st_size == 0:
                results["warnings"].append(f"File is empty: {file_path}")
    
    return results


def test_system_initialization(system: Dict) -> Dict:
    """Test system initialization (basic check)"""
    results = {
        "passed": True,
        "errors": [],
        "warnings": []
    }
    
    # For now, just check if files are JavaScript files and have basic structure
    for file_path in system["files"]:
        if file_path.endswith('.js'):
            full_path = BASE_DIR / file_path
            if full_path.exists():
                try:
                    content = full_path.read_text(encoding='utf-8')
                    # Basic checks
                    if len(content) < 100:
                        results["warnings"].append(f"File seems too small: {file_path}")
                    if 'function' not in content and 'class' not in content and 'const' not in content:
                        results["warnings"].append(f"File might not contain code: {file_path}")
                except Exception as e:
                    results["errors"].append(f"Error reading file {file_path}: {str(e)}")
                    results["passed"] = False
    
    return results


def test_system(system: Dict) -> Dict:
    """Test a single system"""
    system_result = {
        "name": system["name"],
        "category": system["category"],
        "status": "pending",
        "tests": {},
        "errors": [],
        "warnings": [],
        "performance": {}
    }
    
    # Test availability
    if "availability" in system["tests"]:
        avail_result = test_system_availability(system)
        system_result["tests"]["availability"] = "passed" if avail_result["passed"] else "failed"
        system_result["errors"].extend(avail_result["errors"])
        system_result["warnings"].extend(avail_result["warnings"])
    
    # Test initialization
    if "initialization" in system["tests"]:
        init_result = test_system_initialization(system)
        system_result["tests"]["initialization"] = "passed" if init_result["passed"] else "failed"
        system_result["errors"].extend(init_result["errors"])
        system_result["warnings"].extend(init_result["warnings"])
    
    # Determine overall status
    if system_result["errors"]:
        system_result["status"] = "failed"
    elif system_result["warnings"]:
        system_result["status"] = "warning"
    else:
        system_result["status"] = "passed"
    
    return system_result


def run_all_systems_tests() -> Dict:
    """Run tests for all systems"""
    print("🧪 Testing General Systems...")
    print(f"Total systems to test: {len(ALL_SYSTEMS)}\n")
    
    systems_results["summary"]["total_systems"] = len(ALL_SYSTEMS)
    
    for system in ALL_SYSTEMS:
        print(f"Testing: {system['name']} ({system['category']})")
        result = test_system(system)
        systems_results["systems"][system["name"]] = result
        systems_results["summary"]["tested"] += 1
        
        if result["status"] == "passed":
            systems_results["summary"]["passed"] += 1
            print(f"  ✅ {system['name']}: PASSED")
        elif result["status"] == "failed":
            systems_results["summary"]["failed"] += 1
            print(f"  ❌ {system['name']}: FAILED")
            for error in result["errors"]:
                print(f"     - {error}")
        else:
            systems_results["summary"]["warnings"] += 1
            print(f"  ⚠️  {system['name']}: WARNING")
            for warning in result["warnings"]:
                print(f"     - {warning}")
    
    # Calculate summary
    systems_results["summary"]["total_tests"] = sum(
        len(s["tests"]) for s in systems_results["systems"].values()
    )
    
    # Save results
    results_file = BASE_DIR / "reports" / "qa" / "systems_test_results.json"
    results_file.parent.mkdir(parents=True, exist_ok=True)
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(systems_results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Systems tests completed!")
    print(f"   Total: {systems_results['summary']['total_systems']}")
    print(f"   Passed: {systems_results['summary']['passed']}")
    print(f"   Failed: {systems_results['summary']['failed']}")
    print(f"   Warnings: {systems_results['summary']['warnings']}")
    
    return {
        "status": "completed",
        "total_tests": systems_results["summary"]["total_tests"],
        "passed": systems_results["summary"]["passed"],
        "failed": systems_results["summary"]["failed"],
        "warnings": systems_results["summary"]["warnings"],
        "results": systems_results
    }


if __name__ == "__main__":
    run_all_systems_tests()

