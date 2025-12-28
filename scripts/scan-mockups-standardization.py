#!/usr/bin/env python3
"""
Script to scan all mockup pages and create a detailed standardization report
Scans for deviations, duplications, errors, and missing implementations of general systems
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

# Base directory
BASE_DIR = Path(__file__).parent.parent
MOCKUPS_DIR = BASE_DIR / "trading-ui" / "mockups" / "daily-snapshots"

# List of mockup pages
MOCKUP_PAGES = [
    "trading_journal_page.html",
    "trade_history_page.html",
    "portfolio_state_page.html",
    "price_history_page.html",
    "comparative_analysis_page.html",
    "strategy_analysis_page.html",
    "economic_calendar_page.html",
    "date_comparison_modal.html",
    "history_widget.html",
    "emotional_tracking_widget.html",
    "tradingview_test_page.html",
    "heatmap_visual_example.html"
]

# Systems to check
SYSTEMS = {
    "header": {
        "name": "Header System",
        "checks": [
            ("unified-header", r'<div\s+id=["\']unified-header["\']', "Missing unified-header element"),
            ("header-system-script", r'header-system\.js', "Missing header-system.js script"),
        ]
    },
    "icons": {
        "name": "Icon System",
        "checks": [
            ("direct-img-tabler", r'<img\s+src=["\'][^"\']*images/icons/tabler/[^"\']*["\']', "Direct <img> tag for Tabler icons (should use IconSystem)"),
            ("icon-system-script", r'icon-system\.js', "Missing icon-system.js script"),
        ]
    },
    "buttons": {
        "name": "Button System",
        "checks": [
            ("onclick-attribute", r'\bonclick\s*=', "Using onclick instead of data-onclick"),
            ("button-type-attribute", r'data-button-type\s*=', "Has data-button-type (good)"),
            ("button-variant-attribute", r'data-variant\s*=', "Has data-variant (good)"),
        ]
    },
    "sections": {
        "name": "Section Toggle System",
        "checks": [
            ("data-section-attribute", r'data-section\s*=', "Has data-section attribute (good)"),
            ("toggle-section-function", r'toggleSection\s*\(', "Using toggleSection function (good)"),
            ("style-display-manipulation", r'\.style\.display\s*=', "Direct style.display manipulation (should use toggleSection)"),
        ]
    },
    "notifications": {
        "name": "Notification System",
        "checks": [
            ("notification-container", r'id=["\']notification-container["\']', "Missing notification-container"),
            ("toast-container", r'id=["\']toast-container["\']', "Missing toast-container"),
            ("notification-system-script", r'notification-system\.js', "Missing notification-system.js script"),
        ]
    },
    "html-structure": {
        "name": "HTML Structure",
        "checks": [
            ("background-wrapper", r'class=["\']background-wrapper["\']', "Missing background-wrapper"),
            ("page-body", r'class=["\']page-body["\']', "Missing page-body"),
            ("main-content", r'class=["\']main-content["\']', "Missing main-content"),
        ]
    },
    "initialization": {
        "name": "Initialization System",
        "checks": [
            ("core-systems-script", r'core-systems\.js', "Missing core-systems.js script"),
            ("page-initialization-configs", r'page-initialization-configs\.js', "Missing page-initialization-configs.js script"),
        ]
    }
}

def scan_page(page_path):
    """Scan a single page and return issues found"""
    issues = defaultdict(list)
    
    if not page_path.exists():
        return {"error": f"File not found: {page_path}"}
    
    try:
        content = page_path.read_text(encoding='utf-8')
        lines = content.split('\n')
        
        # Check each system
        for system_id, system_info in SYSTEMS.items():
            for check_id, pattern, description in system_info["checks"]:
                matches = list(re.finditer(pattern, content, re.IGNORECASE))
                
                if check_id in ["direct-img-tabler", "onclick-attribute", "style-display-manipulation"]:
                    # These are problems - report them
                    for match in matches:
                        line_num = content[:match.start()].count('\n') + 1
                        line_content = lines[line_num - 1].strip()[:100]
                        issues[system_id].append({
                            "type": "error",
                            "severity": "high" if check_id == "onclick-attribute" else "medium",
                            "check": check_id,
                            "description": description,
                            "line": line_num,
                            "snippet": line_content
                        })
                elif check_id in ["unified-header", "notification-container", "toast-container", 
                                 "background-wrapper", "page-body", "main-content",
                                 "header-system-script", "icon-system-script", "notification-system-script",
                                 "core-systems-script", "page-initialization-configs"]:
                    # These are required - report if missing
                    if not matches:
                        issues[system_id].append({
                            "type": "missing",
                            "severity": "critical" if check_id in ["unified-header", "core-systems-script"] else "high",
                            "check": check_id,
                            "description": description,
                            "line": None,
                            "snippet": None
                        })
                elif check_id in ["button-type-attribute", "button-variant-attribute", 
                                 "data-section-attribute", "toggle-section-function"]:
                    # These are good - just count them
                    pass
        
        # Count script tags
        script_tags = re.findall(r'<script\s+[^>]*src=["\']([^"\']+)["\']', content)
        duplicate_scripts = {}
        script_counts = defaultdict(int)
        for script in script_tags:
            script_counts[script] += 1
            if script_counts[script] > 1:
                duplicate_scripts[script] = script_counts[script]
        
        if duplicate_scripts:
            issues["scripts"].append({
                "type": "duplication",
                "severity": "high",
                "check": "duplicate-scripts",
                "description": f"Duplicate script tags found: {dict(duplicate_scripts)}",
                "line": None,
                "snippet": None
            })
        
        return {
            "success": True,
            "issues": dict(issues),
            "script_count": len(script_tags),
            "duplicate_scripts": duplicate_scripts
        }
        
    except Exception as e:
        return {"error": str(e)}

def generate_report():
    """Generate comprehensive standardization report"""
    report = {
        "timestamp": datetime.now().isoformat(),
        "total_pages": len(MOCKUP_PAGES),
        "pages_scanned": 0,
        "pages_with_issues": 0,
        "total_issues": 0,
        "issues_by_severity": {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0
        },
        "issues_by_system": defaultdict(int),
        "pages": {}
    }
    
    for page_name in MOCKUP_PAGES:
        page_path = MOCKUPS_DIR / page_name
        result = scan_page(page_path)
        
        if "error" in result:
            report["pages"][page_name] = {"error": result["error"]}
            continue
        
        report["pages_scanned"] += 1
        
        if result.get("success"):
            page_issues = result.get("issues", {})
            total_page_issues = sum(len(issues) for issues in page_issues.values())
            
            if total_page_issues > 0:
                report["pages_with_issues"] += 1
                report["total_issues"] += total_page_issues
                
                # Count by severity
                for system_issues in page_issues.values():
                    for issue in system_issues:
                        severity = issue.get("severity", "low")
                        report["issues_by_severity"][severity] += 1
                        system_name = SYSTEMS.get(issue.get("system", "unknown"), {}).get("name", "unknown")
                        report["issues_by_system"][system_name] += 1
            
            report["pages"][page_name] = {
                "total_issues": total_page_issues,
                "issues": page_issues,
                "script_count": result.get("script_count", 0),
                "duplicate_scripts": result.get("duplicate_scripts", {})
            }
    
    return report

def format_report_markdown(report):
    """Format report as markdown"""
    md = f"""# דוח סטנדרטיזציה - עמודי מוקאפ
# Mockups Standardization Report

**תאריך:** {report['timestamp']}  
**סה"כ עמודים:** {report['total_pages']}  
**עמודים נסרקו:** {report['pages_scanned']}  
**עמודים עם בעיות:** {report['pages_with_issues']}  
**סה"כ בעיות:** {report['total_issues']}

---

## סיכום כללי

### חלוקה לפי חומרה:
- **קריטי:** {report['issues_by_severity']['critical']}
- **גבוה:** {report['issues_by_severity']['high']}
- **בינוני:** {report['issues_by_severity']['medium']}
- **נמוך:** {report['issues_by_severity']['low']}

### חלוקה לפי מערכת:
"""
    
    for system, count in sorted(report['issues_by_system'].items(), key=lambda x: x[1], reverse=True):
        md += f"- **{system}:** {count}\n"
    
    md += "\n---\n\n## דוח פרטני לכל עמוד\n\n"
    
    for page_name, page_data in sorted(report['pages'].items()):
        if "error" in page_data:
            md += f"### {page_name}\n\n"
            md += f"❌ **שגיאה:** {page_data['error']}\n\n"
            continue
        
        total_issues = page_data.get('total_issues', 0)
        status = "✅" if total_issues == 0 else "⚠️" if total_issues < 5 else "❌"
        
        md += f"### {page_name}\n\n"
        md += f"{status} **סה\"כ בעיות:** {total_issues}\n"
        md += f"**מספר סקריפטים:** {page_data.get('script_count', 0)}\n"
        
        if page_data.get('duplicate_scripts'):
            md += f"**⚠️ כפילויות:** {page_data['duplicate_scripts']}\n"
        
        md += "\n"
        
        if total_issues > 0:
            for system_id, issues in page_data.get('issues', {}).items():
                if issues:
                    system_name = SYSTEMS.get(system_id, {}).get("name", system_id)
                    md += f"#### {system_name}\n\n"
                    
                    for issue in issues:
                        severity_icon = {
                            "critical": "🔴",
                            "high": "🟠",
                            "medium": "🟡",
                            "low": "🟢"
                        }.get(issue.get('severity', 'low'), "⚪")
                        
                        md += f"- {severity_icon} **{issue.get('type', 'unknown').upper()}:** {issue.get('description', 'No description')}\n"
                        if issue.get('line'):
                            md += f"  - שורה: {issue['line']}\n"
                        if issue.get('snippet'):
                            md += f"  - קוד: `{issue['snippet']}`\n"
                    md += "\n"
        
        md += "---\n\n"
    
    return md

if __name__ == "__main__":
    print("🔍 Scanning mockup pages...")
    report = generate_report()
    
    # Save JSON report
    json_path = BASE_DIR / "documentation" / "frontend" / "MOCKUPS_STANDARDIZATION_REPORT.json"
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f"✅ JSON report saved: {json_path}")
    
    # Save Markdown report
    md_path = BASE_DIR / "documentation" / "frontend" / "MOCKUPS_STANDARDIZATION_REPORT.md"
    md_content = format_report_markdown(report)
    md_path.write_text(md_content, encoding='utf-8')
    print(f"✅ Markdown report saved: {md_path}")
    
    print(f"\n📊 Summary:")
    print(f"   Pages scanned: {report['pages_scanned']}")
    print(f"   Pages with issues: {report['pages_with_issues']}")
    print(f"   Total issues: {report['total_issues']}")
    print(f"   Critical: {report['issues_by_severity']['critical']}")
    print(f"   High: {report['issues_by_severity']['high']}")


