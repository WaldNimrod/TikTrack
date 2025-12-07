#!/usr/bin/env python3
"""
Generate Results Matrix - TikTrack
===================================

Creates a comprehensive results matrix in JSON and CSV formats
showing the status of all tests for all pages and systems.
"""

import sys
import json
import csv
from pathlib import Path
from typing import Dict, List
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent.parent
REPORTS_DIR = BASE_DIR / "reports" / "qa"


def load_test_results() -> Dict:
    """Load all test results"""
    results = {
        "systems": {},
        "pages": {},
        "crud": {},
        "e2e": {},
        "performance": {}
    }
    
    # Load systems results
    systems_file = REPORTS_DIR / "systems_test_results.json"
    if systems_file.exists():
        with open(systems_file, 'r', encoding='utf-8') as f:
            systems_data = json.load(f)
            results["systems"] = systems_data.get("systems", {})
    
    # Load pages results
    pages_file = REPORTS_DIR / "pages_test_results.json"
    if pages_file.exists():
        with open(pages_file, 'r', encoding='utf-8') as f:
            pages_data = json.load(f)
            results["pages"] = pages_data.get("pages", {})
    
    # Load CRUD results
    crud_file = REPORTS_DIR / "crud_test_results.json"
    if crud_file.exists():
        with open(crud_file, 'r', encoding='utf-8') as f:
            crud_data = json.load(f)
            results["crud"] = crud_data.get("entities", {})
    
    # Load E2E results
    e2e_file = REPORTS_DIR / "e2e_test_results.json"
    if e2e_file.exists():
        with open(e2e_file, 'r', encoding='utf-8') as f:
            e2e_data = json.load(f)
            results["e2e"] = e2e_data.get("workflows", {})
    
    # Load performance results
    perf_file = REPORTS_DIR / "performance_test_results.json"
    if perf_file.exists():
        with open(perf_file, 'r', encoding='utf-8') as f:
            perf_data = json.load(f)
            results["performance"] = perf_data.get("metrics", {})
    
    return results


def generate_matrix(test_results_data: Dict) -> Dict:
    """Generate results matrix"""
    print("📊 Generating Results Matrix...\n")
    
    all_results = load_test_results()
    
    matrix = {
        "timestamp": datetime.now().isoformat(),
        "systems": {},
        "pages": {},
        "summary": {
            "total_items": 0,
            "passed": 0,
            "failed": 0,
            "warnings": 0,
            "coverage": "0%"
        }
    }
    
    # Process systems
    for system_name, system_data in all_results.get("systems", {}).items():
        matrix["systems"][system_name] = {
            "status": system_data.get("status", "pending"),
            "category": system_data.get("category", "unknown"),
            "tests": system_data.get("tests", {}),
            "errors": len(system_data.get("errors", [])),
            "warnings": len(system_data.get("warnings", []))
        }
        
        matrix["summary"]["total_items"] += 1
        if system_data.get("status") == "passed":
            matrix["summary"]["passed"] += 1
        elif system_data.get("status") == "failed":
            matrix["summary"]["failed"] += 1
        else:
            matrix["summary"]["warnings"] += 1
    
    # Process pages
    for page_url, page_data in all_results.get("pages", {}).items():
        matrix["pages"][page_url] = {
            "status": page_data.get("status", "pending"),
            "priority": page_data.get("priority", "unknown"),
            "category": page_data.get("category", "unknown"),
            "tests": page_data.get("tests", {}),
            "errors": len(page_data.get("errors", [])),
            "warnings": len(page_data.get("warnings", []))
        }
        
        matrix["summary"]["total_items"] += 1
        if page_data.get("status") == "passed":
            matrix["summary"]["passed"] += 1
        elif page_data.get("status") == "failed":
            matrix["summary"]["failed"] += 1
        else:
            matrix["summary"]["warnings"] += 1
    
    # Calculate coverage
    if matrix["summary"]["total_items"] > 0:
        coverage = (matrix["summary"]["passed"] / matrix["summary"]["total_items"]) * 100
        matrix["summary"]["coverage"] = f"{coverage:.1f}%"
    
    # Save JSON
    json_file = REPORTS_DIR / "results_matrix.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(matrix, f, indent=2, ensure_ascii=False)
    print(f"✅ JSON matrix saved to: {json_file}")
    
    # Save CSV
    csv_file = REPORTS_DIR / "results_matrix.csv"
    with open(csv_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(["Type", "Name", "Status", "Category", "Priority", "Errors", "Warnings"])
        
        # Systems
        for name, data in matrix["systems"].items():
            writer.writerow([
                "System",
                name,
                data["status"],
                data["category"],
                "",
                data["errors"],
                data["warnings"]
            ])
        
        # Pages
        for url, data in matrix["pages"].items():
            writer.writerow([
                "Page",
                url,
                data["status"],
                data["category"],
                data["priority"],
                data["errors"],
                data["warnings"]
            ])
    
    print(f"✅ CSV matrix saved to: {csv_file}")
    
    # Print summary
    print(f"\n📊 Matrix Summary:")
    print(f"   Total Items: {matrix['summary']['total_items']}")
    print(f"   ✅ Passed: {matrix['summary']['passed']}")
    print(f"   ❌ Failed: {matrix['summary']['failed']}")
    print(f"   ⚠️  Warnings: {matrix['summary']['warnings']}")
    print(f"   📈 Coverage: {matrix['summary']['coverage']}")
    
    return matrix


if __name__ == "__main__":
    generate_matrix({})

