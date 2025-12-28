#!/usr/bin/env python3
"""
סריקת דפוסים מקיפה בעמודי מוקאפ
Comprehensive Pattern Detection Script for Mockup Pages
"""

import os
import re
from pathlib import Path
from collections import defaultdict

MOCKUP_PAGES = [
    "portfolio_state_page.html",
    "trade_history_page.html",
    "price_history_page.html",
    "comparative_analysis_page.html",
    "trading_journal_page.html",
    "strategy_analysis_page.html",
    "economic_calendar_page.html",
    "history_widget.html",
    "emotional_tracking_widget.html",
    "date_comparison_modal.html",
    "tradingview_test_page.html"
]

MOCKUPS_DIR = Path("trading-ui/mockups/daily-snapshots")

def check_comprehensive_patterns():
    """סריקת דפוסים מקיפה"""
    patterns = {
        "missing_critical_scripts": defaultdict(list),
        "load_order_issues": defaultdict(list),
        "console_usage": defaultdict(list),
        "missing_systems": defaultdict(list),
        "defer_missing": defaultdict(list),
        "script_versioning": defaultdict(list),
    }
    
    critical_scripts = {
        "logger-service.js": "Logger Service",
        "notification-system.js": "Notification System",
        "header-system.js": "Header System",
        "error-handlers.js": "Error Handlers",
        "api-config.js": "API Config",
    }
    
    important_systems = {
        "preferences-core-new.js": "Preferences System",
        "color-scheme-system": "Color Scheme System",
        "field-renderer-service.js": "Field Renderer Service",
        "crud-response-handler.js": "CRUD Response Handler",
        "modal-manager": "Modal Manager",
    }
    
    for page_name in MOCKUP_PAGES:
        page_path = MOCKUPS_DIR / page_name
        if not page_path.exists():
            continue
            
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # בדיקת scripts קריטיים
        for script, name in critical_scripts.items():
            if script not in content:
                patterns["missing_critical_scripts"][name].append(page_name)
        
        # בדיקת מערכות חשובות
        for system, name in important_systems.items():
            if system not in content:
                patterns["missing_systems"][name].append(page_name)
        
        # בדיקת console.log, console.error, console.warn
        console_patterns = {
            "console.log": re.findall(r'console\.log\s*\(', content),
            "console.error": re.findall(r'console\.error\s*\(', content),
            "console.warn": re.findall(r'console\.warn\s*\(', content),
            "console.info": re.findall(r'console\.info\s*\(', content),
        }
        
        for console_type, matches in console_patterns.items():
            if matches:
                patterns["console_usage"][page_name].append({
                    "type": console_type,
                    "count": len(matches)
                })
        
        # בדיקת סדר טעינה - Logger Service צריך להיות לפני מערכות אחרות
        logger_pos = content.find("logger-service.js")
        if logger_pos != -1:
            # בדוק אם יש scripts אחרי logger-service שצריכים להיות לפני
            scripts_before_logger = [
                "notification-system.js",
                "header-system.js",
                "preferences-core"
            ]
            for script in scripts_before_logger:
                script_pos = content.find(script)
                if script_pos != -1 and script_pos < logger_pos:
                    patterns["load_order_issues"][page_name].append(
                        f"{script} should be after logger-service.js"
                    )
        
        # בדיקת defer attributes - scripts קריטיים לא צריכים defer
        critical_with_defer = []
        critical_no_defer = ["logger-service.js", "error-handlers.js", "api-config.js"]
        for script in critical_no_defer:
            if script in content:
                # בדוק אם יש defer
                pattern = rf'<script[^>]*{re.escape(script)}[^>]*defer[^>]*>'
                if re.search(pattern, content):
                    critical_with_defer.append(script)
        
        if critical_with_defer:
            patterns["defer_missing"][page_name] = critical_with_defer
        
        # בדיקת versioning - scripts צריכים להיות עם ?v=
        script_tags = re.findall(r'<script[^>]*src=["\']([^"\']+)["\'][^>]*>', content)
        scripts_without_version = []
        for script_src in script_tags:
            # דלג על CDN scripts
            if 'cdn.jsdelivr.net' in script_src or 'cdnjs.cloudflare.com' in script_src:
                continue
            # דלג על scripts עם version
            if '?v=' in script_src or '&v=' in script_src:
                continue
            # דלג על scripts חיצוניים
            if script_src.startswith('http'):
                continue
            scripts_without_version.append(script_src)
        
        if scripts_without_version:
            patterns["script_versioning"][page_name] = scripts_without_version[:5]  # רק 5 ראשונים
    
    return patterns

def generate_comprehensive_report(patterns):
    """יצירת דוח מקיף"""
    report = []
    report.append("# דוח דפוסים מקיף - עמודי מוקאפ\n")
    report.append("**תאריך:** " + str(Path(__file__).stat().st_mtime) + "\n\n")
    
    # Missing Critical Scripts
    if patterns["missing_critical_scripts"]:
        report.append("## ❌ Scripts קריטיים חסרים\n\n")
        for script_name, pages in patterns["missing_critical_scripts"].items():
            report.append(f"### {script_name}\n")
            report.append(f"**חסר ב-{len(pages)} עמודים:**\n")
            for page in pages:
                report.append(f"- {page}\n")
            report.append("\n")
    else:
        report.append("## ✅ Scripts קריטיים - כולם תקינים\n\n")
    
    # Missing Important Systems
    if patterns["missing_systems"]:
        report.append("## ⚠️ מערכות חשובות חסרות\n\n")
        for system_name, pages in patterns["missing_systems"].items():
            report.append(f"### {system_name}\n")
            report.append(f"**חסר ב-{len(pages)} עמודים:**\n")
            for page in pages:
                report.append(f"- {page}\n")
            report.append("\n")
    else:
        report.append("## ✅ מערכות חשובות - כולם תקינים\n\n")
    
    # Console Usage
    if patterns["console_usage"]:
        report.append("## ⚠️ שימוש ב-console.* במקום Logger Service\n\n")
        total_console_calls = 0
        for page, usages in patterns["console_usage"].items():
            page_total = sum(u["count"] for u in usages)
            total_console_calls += page_total
            report.append(f"### {page}\n")
            for usage in usages:
                report.append(f"- {usage['type']}: {usage['count']} פעמים\n")
            report.append(f"**סה\"כ: {page_total} קריאות console**\n\n")
        report.append(f"**סה\"כ כללי: {total_console_calls} קריאות console**\n\n")
    else:
        report.append("## ✅ Console Usage - כולם תקינים (אין שימוש ב-console.*)\n\n")
    
    # Load Order Issues
    if patterns["load_order_issues"]:
        report.append("## ⚠️ בעיות סדר טעינה\n\n")
        for page, issues in patterns["load_order_issues"].items():
            report.append(f"### {page}\n")
            for issue in issues:
                report.append(f"- {issue}\n")
            report.append("\n")
    else:
        report.append("## ✅ סדר טעינה - כולם תקינים\n\n")
    
    # Defer Issues
    if patterns["defer_missing"]:
        report.append("## ⚠️ Scripts קריטיים עם defer (לא מומלץ)\n\n")
        for page, scripts in patterns["defer_missing"].items():
            report.append(f"### {page}\n")
            for script in scripts:
                report.append(f"- {script} - יש defer אבל לא מומלץ\n")
            report.append("\n")
    else:
        report.append("## ✅ Defer Usage - כולם תקינים\n\n")
    
    # Script Versioning
    if patterns["script_versioning"]:
        report.append("## ⚠️ Scripts ללא versioning (?v=)\n\n")
        total_without_version = 0
        for page, scripts in patterns["script_versioning"].items():
            total_without_version += len(scripts)
            report.append(f"### {page}\n")
            for script in scripts[:5]:  # רק 5 ראשונים
                script_name = script.split('/')[-1]
                report.append(f"- {script_name}\n")
            if len(scripts) > 5:
                report.append(f"- ... ועוד {len(scripts) - 5}\n")
            report.append("\n")
        report.append(f"**סה\"כ: {total_without_version} scripts ללא versioning**\n\n")
    else:
        report.append("## ✅ Script Versioning - כולם תקינים\n\n")
    
    return "".join(report)

if __name__ == "__main__":
    print("🔍 סריקת דפוסים מקיפה בעמודי מוקאפ...")
    patterns = check_comprehensive_patterns()
    report = generate_comprehensive_report(patterns)
    
    # שמירת דוח
    report_path = Path("documentation/05-REPORTS/MOCKUPS_COMPREHENSIVE_PATTERNS_SCAN.md")
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(report, encoding='utf-8')
    
    print(f"✅ דוח נוצר: {report_path}")
    print("\n" + "="*60)
    print(report)

