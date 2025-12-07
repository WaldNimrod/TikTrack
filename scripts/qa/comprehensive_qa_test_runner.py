#!/usr/bin/env python3
"""
Comprehensive QA Test Runner - TikTrack
=======================================

Main script to run all QA tests in the correct order:
1. General Systems Tests (first priority)
2. Pages Tests (by priority)
3. CRUD Tests
4. E2E Tests
5. Performance Tests

Usage:
    python3 scripts/qa/comprehensive_qa_test_runner.py [--stage STAGE] [--skip SKIP]

Options:
    --stage: Run specific stage only (systems, pages, crud, e2e, performance)
    --skip: Skip specific stages (comma-separated)
    --parallel: Run tests in parallel where possible
"""

import sys
import json
import time
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

BASE_DIR = Path(__file__).parent.parent.parent
REPORTS_DIR = BASE_DIR / "reports" / "qa"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Test results storage
test_results = {
    "start_time": None,
    "end_time": None,
    "duration": 0,
    "stages": {
        "systems": {"status": "pending", "results": None, "errors": []},
        "pages": {"status": "pending", "results": None, "errors": []},
        "crud": {"status": "pending", "results": None, "errors": []},
        "e2e": {"status": "pending", "results": None, "errors": []},
        "performance": {"status": "pending", "results": None, "errors": []}
    },
    "summary": {
        "total_tests": 0,
        "passed": 0,
        "failed": 0,
        "warnings": 0,
        "coverage": "0%"
    }
}


def print_header(text: str):
    """Print formatted header"""
    print("\n" + "="*80)
    print(f"  {text}")
    print("="*80 + "\n")


def print_stage_header(stage: str):
    """Print stage header"""
    print(f"\n{'='*80}")
    print(f"  Stage: {stage.upper()}")
    print(f"{'='*80}\n")


def run_systems_tests() -> Dict:
    """Run general systems tests"""
    print_stage_header("Systems Tests")
    try:
        # Import from same directory
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "test_general_systems",
            Path(__file__).parent / "test_general_systems.py"
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        results = module.run_all_systems_tests()
        test_results["stages"]["systems"]["status"] = "completed"
        test_results["stages"]["systems"]["results"] = results
        return results
    except Exception as e:
        error_msg = f"Systems tests failed: {str(e)}"
        print(f"❌ {error_msg}")
        test_results["stages"]["systems"]["status"] = "failed"
        test_results["stages"]["systems"]["errors"].append(error_msg)
        return {"status": "failed", "error": error_msg}


def run_pages_tests() -> Dict:
    """Run pages tests"""
    print_stage_header("Pages Tests")
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "test_pages_comprehensive",
            Path(__file__).parent / "test_pages_comprehensive.py"
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        results = module.run_all_pages_tests()
        test_results["stages"]["pages"]["status"] = "completed"
        test_results["stages"]["pages"]["results"] = results
        return results
    except Exception as e:
        error_msg = f"Pages tests failed: {str(e)}"
        print(f"❌ {error_msg}")
        test_results["stages"]["pages"]["status"] = "failed"
        test_results["stages"]["pages"]["errors"].append(error_msg)
        return {"status": "failed", "error": error_msg}


def run_crud_tests() -> Dict:
    """Run CRUD tests"""
    print_stage_header("CRUD Tests")
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "test_crud_comprehensive",
            Path(__file__).parent / "test_crud_comprehensive.py"
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        results = module.run_all_crud_tests()
        test_results["stages"]["crud"]["status"] = "completed"
        test_results["stages"]["crud"]["results"] = results
        return results
    except Exception as e:
        error_msg = f"CRUD tests failed: {str(e)}"
        print(f"❌ {error_msg}")
        test_results["stages"]["crud"]["status"] = "failed"
        test_results["stages"]["crud"]["errors"].append(error_msg)
        return {"status": "failed", "error": error_msg}


def run_e2e_tests() -> Dict:
    """Run E2E tests"""
    print_stage_header("E2E Tests")
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "test_e2e_workflows",
            Path(__file__).parent / "test_e2e_workflows.py"
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        results = module.run_all_e2e_tests()
        test_results["stages"]["e2e"]["status"] = "completed"
        test_results["stages"]["e2e"]["results"] = results
        return results
    except Exception as e:
        error_msg = f"E2E tests failed: {str(e)}"
        print(f"❌ {error_msg}")
        test_results["stages"]["e2e"]["status"] = "failed"
        test_results["stages"]["e2e"]["errors"].append(error_msg)
        return {"status": "failed", "error": error_msg}


def run_performance_tests() -> Dict:
    """Run performance tests"""
    print_stage_header("Performance Tests")
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "test_performance_comprehensive",
            Path(__file__).parent / "test_performance_comprehensive.py"
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        results = module.run_all_performance_tests()
        test_results["stages"]["performance"]["status"] = "completed"
        test_results["stages"]["performance"]["results"] = results
        return results
    except Exception as e:
        error_msg = f"Performance tests failed: {str(e)}"
        print(f"❌ {error_msg}")
        test_results["stages"]["performance"]["status"] = "failed"
        test_results["stages"]["performance"]["errors"].append(error_msg)
        return {"status": "failed", "error": error_msg}


def calculate_summary():
    """Calculate summary statistics"""
    total = 0
    passed = 0
    failed = 0
    warnings = 0
    
    for stage_name, stage_data in test_results["stages"].items():
        if stage_data["results"]:
            stage_total = stage_data["results"].get("total_tests", 0)
            stage_passed = stage_data["results"].get("passed", 0)
            stage_failed = stage_data["results"].get("failed", 0)
            stage_warnings = stage_data["results"].get("warnings", 0)
            
            total += stage_total
            passed += stage_passed
            failed += stage_failed
            warnings += stage_warnings
    
    test_results["summary"]["total_tests"] = total
    test_results["summary"]["passed"] = passed
    test_results["summary"]["failed"] = failed
    test_results["summary"]["warnings"] = warnings
    
    if total > 0:
        coverage = (passed / total) * 100
        test_results["summary"]["coverage"] = f"{coverage:.1f}%"
    else:
        test_results["summary"]["coverage"] = "0%"


def save_results():
    """Save test results to JSON"""
    results_file = REPORTS_DIR / "test_results.json"
    with open(results_file, 'w', encoding='utf-8') as f:
        json.dump(test_results, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Test results saved to: {results_file}")


def print_summary():
    """Print final summary"""
    print_header("QA Test Summary")
    
    summary = test_results["summary"]
    print(f"Total Tests: {summary['total_tests']}")
    print(f"✅ Passed: {summary['passed']}")
    print(f"❌ Failed: {summary['failed']}")
    print(f"⚠️  Warnings: {summary['warnings']}")
    print(f"📊 Coverage: {summary['coverage']}")
    
    print("\n" + "-"*80)
    print("Stage Status:")
    print("-"*80)
    
    for stage_name, stage_data in test_results["stages"].items():
        status_icon = "✅" if stage_data["status"] == "completed" else "❌" if stage_data["status"] == "failed" else "⏳"
        print(f"{status_icon} {stage_name.upper()}: {stage_data['status']}")
        if stage_data["errors"]:
            for error in stage_data["errors"]:
                print(f"   - {error}")
    
    duration = test_results["duration"]
    hours = int(duration // 3600)
    minutes = int((duration % 3600) // 60)
    seconds = int(duration % 60)
    print(f"\n⏱️  Total Duration: {hours:02d}:{minutes:02d}:{seconds:02d}")


def main():
    """Main test runner"""
    parser = argparse.ArgumentParser(description='Comprehensive QA Test Runner')
    parser.add_argument('--stage', choices=['systems', 'pages', 'crud', 'e2e', 'performance'],
                       help='Run specific stage only')
    parser.add_argument('--skip', help='Skip specific stages (comma-separated)')
    parser.add_argument('--parallel', action='store_true', help='Run tests in parallel')
    
    args = parser.parse_args()
    
    skip_stages = []
    if args.skip:
        skip_stages = [s.strip() for s in args.skip.split(',')]
    
    print_header("TikTrack Comprehensive QA Test Runner")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results["start_time"] = datetime.now().isoformat()
    start_timestamp = time.time()
    
    # Run tests in order
    stages_to_run = []
    
    if args.stage:
        # Run only specified stage
        stages_to_run = [args.stage]
    else:
        # Run all stages in order
        stages_to_run = ['systems', 'pages', 'crud', 'e2e', 'performance']
        # Remove skipped stages
        stages_to_run = [s for s in stages_to_run if s not in skip_stages]
    
    # Execute stages
    for stage in stages_to_run:
        if stage == 'systems':
            run_systems_tests()
        elif stage == 'pages':
            run_pages_tests()
        elif stage == 'crud':
            run_crud_tests()
        elif stage == 'e2e':
            run_e2e_tests()
        elif stage == 'performance':
            run_performance_tests()
    
    # Calculate summary
    calculate_summary()
    
    # Save results
    test_results["end_time"] = datetime.now().isoformat()
    end_timestamp = time.time()
    test_results["duration"] = end_timestamp - start_timestamp
    save_results()
    
    # Generate reports
    print("\n📊 Generating reports...")
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "generate_results_matrix",
            Path(__file__).parent / "generate_results_matrix.py"
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        module.generate_matrix(test_results)
    except Exception as e:
        print(f"⚠️  Warning: Could not generate results matrix: {e}")
    
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "generate_final_report",
            Path(__file__).parent / "generate_final_report.py"
        )
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        module.generate_report(test_results)
    except Exception as e:
        print(f"⚠️  Warning: Could not generate final report: {e}")
    
    # Print summary
    print_summary()
    
    # Exit with error code if any tests failed
    if test_results["summary"]["failed"] > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()

