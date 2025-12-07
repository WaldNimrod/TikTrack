#!/usr/bin/env python3
"""
Generate Final Report - TikTrack
=================================

Creates a comprehensive final report in Markdown and HTML formats
with all errors, warnings, recommendations, and statistics.
"""

import sys
import json
from pathlib import Path
from typing import Dict, List
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent.parent
REPORTS_DIR = BASE_DIR / "reports" / "qa"


def load_all_results() -> Dict:
    """Load all test results"""
    results = {}
    
    # Load main test results
    main_file = REPORTS_DIR / "test_results.json"
    if main_file.exists():
        with open(main_file, 'r', encoding='utf-8') as f:
            results["main"] = json.load(f)
    
    # Load matrix
    matrix_file = REPORTS_DIR / "results_matrix.json"
    if matrix_file.exists():
        with open(matrix_file, 'r', encoding='utf-8') as f:
            results["matrix"] = json.load(f)
    
    return results


def collect_errors_and_warnings(results: Dict) -> Dict:
    """Collect all errors and warnings"""
    errors = []
    warnings = []
    
    # From systems
    if "matrix" in results and "systems" in results["matrix"]:
        for name, data in results["matrix"]["systems"].items():
            if data["status"] == "failed":
                errors.append({
                    "type": "system",
                    "name": name,
                    "category": data.get("category", "unknown"),
                    "errors": data.get("errors", 0),
                    "warnings": data.get("warnings", 0)
                })
            elif data["status"] == "warning":
                warnings.append({
                    "type": "system",
                    "name": name,
                    "category": data.get("category", "unknown"),
                    "warnings": data.get("warnings", 0)
                })
    
    # From pages
    if "matrix" in results and "pages" in results["matrix"]:
        for url, data in results["matrix"]["pages"].items():
            if data["status"] == "failed":
                errors.append({
                    "type": "page",
                    "name": url,
                    "priority": data.get("priority", "unknown"),
                    "category": data.get("category", "unknown"),
                    "errors": data.get("errors", 0),
                    "warnings": data.get("warnings", 0)
                })
            elif data["status"] == "warning":
                warnings.append({
                    "type": "page",
                    "name": url,
                    "priority": data.get("priority", "unknown"),
                    "category": data.get("category", "unknown"),
                    "warnings": data.get("warnings", 0)
                })
    
    return {
        "errors": errors,
        "warnings": warnings
    }


def generate_markdown_report(results: Dict) -> str:
    """Generate Markdown report"""
    report = []
    
    report.append("# TikTrack QA Test Report")
    report.append(f"\n**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report.append("---\n")
    
    # Summary
    if "matrix" in results and "summary" in results["matrix"]:
        summary = results["matrix"]["summary"]
        report.append("## 📊 Executive Summary\n")
        report.append(f"- **Total Items Tested:** {summary.get('total_items', 0)}")
        report.append(f"- **✅ Passed:** {summary.get('passed', 0)}")
        report.append(f"- **❌ Failed:** {summary.get('failed', 0)}")
        report.append(f"- **⚠️  Warnings:** {summary.get('warnings', 0)}")
        report.append(f"- **📈 Coverage:** {summary.get('coverage', '0%')}\n")
    
    # Critical Errors
    issues = collect_errors_and_warnings(results)
    
    if issues["errors"]:
        report.append("## ❌ Critical Errors\n")
        for error in issues["errors"][:20]:  # Top 20
            report.append(f"### {error['type'].upper()}: {error['name']}")
            report.append(f"- **Category:** {error.get('category', 'unknown')}")
            if 'priority' in error:
                report.append(f"- **Priority:** {error.get('priority', 'unknown')}")
            report.append(f"- **Errors:** {error.get('errors', 0)}")
            report.append(f"- **Warnings:** {error.get('warnings', 0)}\n")
    
    # Warnings
    if issues["warnings"]:
        report.append("## ⚠️  Warnings\n")
        for warning in issues["warnings"][:20]:  # Top 20
            report.append(f"### {warning['type'].upper()}: {warning['name']}")
            report.append(f"- **Category:** {warning.get('category', 'unknown')}")
            if 'priority' in warning:
                report.append(f"- **Priority:** {warning.get('priority', 'unknown')}")
            report.append(f"- **Warnings:** {warning.get('warnings', 0)}\n")
    
    # Recommendations
    report.append("## 💡 Recommendations\n")
    report.append("1. **Fix Critical Errors First:** Address all failed tests before release")
    report.append("2. **Review Warnings:** Investigate warnings that might indicate potential issues")
    report.append("3. **Improve Coverage:** Aim for 100% test coverage")
    report.append("4. **Performance:** Review performance metrics and optimize bottlenecks\n")
    
    # Test Stages
    if "main" in results and "stages" in results["main"]:
        report.append("## 🧪 Test Stages Status\n")
        for stage_name, stage_data in results["main"]["stages"].items():
            status_icon = "✅" if stage_data["status"] == "completed" else "❌" if stage_data["status"] == "failed" else "⏳"
            report.append(f"- {status_icon} **{stage_name.upper()}:** {stage_data['status']}")
            if stage_data.get("errors"):
                for error in stage_data["errors"][:3]:
                    report.append(f"  - {error}")
        report.append("")
    
    return "\n".join(report)


def generate_html_report(markdown_content: str) -> str:
    """Generate HTML report from Markdown"""
    # Simple HTML wrapper (for full Markdown to HTML, use a library like markdown)
    html = f"""<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TikTrack QA Test Report</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        h1 {{
            color: #26baac;
            border-bottom: 3px solid #fc5a06;
            padding-bottom: 10px;
        }}
        h2 {{
            color: #333;
            margin-top: 30px;
        }}
        h3 {{
            color: #555;
        }}
        code {{
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
        }}
        pre {{
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }}
        ul, ol {{
            margin: 10px 0;
        }}
        .summary {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
    </style>
</head>
<body>
    <div class="summary">
        <pre>{markdown_content}</pre>
    </div>
</body>
</html>"""
    return html


def generate_report(test_results_data: Dict) -> Dict:
    """Generate final report"""
    print("📄 Generating Final Report...\n")
    
    all_results = load_all_results()
    
    # Generate Markdown
    markdown_content = generate_markdown_report(all_results)
    md_file = REPORTS_DIR / "final_report.md"
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    print(f"✅ Markdown report saved to: {md_file}")
    
    # Generate HTML
    html_content = generate_html_report(markdown_content)
    html_file = REPORTS_DIR / "final_report.html"
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    print(f"✅ HTML report saved to: {html_file}")
    
    return {
        "markdown_file": str(md_file),
        "html_file": str(html_file)
    }


if __name__ == "__main__":
    generate_report({})

