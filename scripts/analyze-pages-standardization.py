#!/usr/bin/env python3
"""
Page Standardization Analysis Script
====================================
סורק את כל עמודי המשתמש ומזהה חריגות מהסטנדרטים הכלליים
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Set, Optional
from dataclasses import dataclass, asdict
from collections import defaultdict

# Base paths
PROJECT_ROOT = Path(__file__).parent.parent
TRADING_UI = PROJECT_ROOT / "trading-ui"
SCRIPTS_DIR = TRADING_UI / "scripts"
SERVICES_DIR = SCRIPTS_DIR / "services"
DOCS_DIR = PROJECT_ROOT / "documentation"
REPORTS_DIR = DOCS_DIR / "reports" / "user-pages-standardization"

# Pages to analyze (from PAGES_LIST.md)
MAIN_PAGES = [
    "index", "trades", "trade_plans", "alerts", "tickers", 
    "trading_accounts", "executions", "data_import", "cash_flows", 
    "notes", "research", "preferences"
]

SUPPORTING_PAGES = [
    "db_display", "db_extradata", "constraints", "background-tasks",
    "server-monitor", "system-management", "cache-test", 
    "code-quality-dashboard", "notifications-center", "css-management",
    "dynamic-colors-display", "designs", "tag-management"
]

ALL_PAGES = MAIN_PAGES + SUPPORTING_PAGES

@dataclass
class PageAnalysis:
    """Analysis results for a single page"""
    page_name: str
    page_type: str  # 'main' or 'supporting'
    html_file: Optional[str] = None
    js_file: Optional[str] = None
    
    # Data Service
    has_data_service: bool = False
    data_service_file: Optional[str] = None
    uses_data_service: bool = False
    
    # Cache System
    uses_unified_cache: bool = False
    uses_cache_ttl_guard: bool = False
    uses_cache_sync: bool = False
    direct_cache_removal: bool = False
    
    # CRUD System
    uses_crud_handler: bool = False
    uses_handle_api_response: bool = False
    direct_fetch_calls: int = 0
    
    # Modal System
    uses_modal_manager_v2: bool = False
    legacy_modal_code: bool = False
    
    # Field Renderer
    uses_field_renderer: bool = False
    manual_rendering: bool = False
    
    # Page State
    uses_page_state_manager: bool = False
    custom_state_management: bool = False
    
    # Logging
    console_log_count: int = 0
    logger_usage: bool = False
    
    # Code Quality
    inline_styles: bool = False
    legacy_code_patterns: List[str] = None
    
    # Issues
    issues: List[str] = None
    recommendations: List[str] = None
    
    def __post_init__(self):
        if self.legacy_code_patterns is None:
            self.legacy_code_patterns = []
        if self.issues is None:
            self.issues = []
        if self.recommendations is None:
            self.recommendations = []

def find_page_files(page_name: str) -> tuple:
    """Find HTML and JS files for a page"""
    html_file = TRADING_UI / f"{page_name}.html"
    js_file = SCRIPTS_DIR / f"{page_name}.js"
    
    # Handle special cases
    if page_name == "index":
        js_file = SCRIPTS_DIR / "index.js"
    elif page_name == "cache-test":
        html_file = TRADING_UI / "cache-management.html"
    elif page_name == "tag-management":
        html_file = TRADING_UI / "tag-management.html"
    
    html_path = str(html_file) if html_file.exists() else None
    js_path = str(js_file) if js_file.exists() else None
    
    return html_path, js_path

def check_data_service(page_name: str) -> tuple:
    """Check if page has a data service"""
    service_file = SERVICES_DIR / f"{page_name}-data.js"
    
    # Handle special cases
    if page_name == "index":
        service_file = SERVICES_DIR / "dashboard-data.js"
    elif page_name == "trade_plans":
        service_file = SERVICES_DIR / "trade-plans-data.js"
    elif page_name == "trading_accounts":
        service_file = SERVICES_DIR / "trading-accounts-data.js"
    elif page_name == "cash_flows":
        service_file = SERVICES_DIR / "cash-flows-data.js"
    
    has_service = service_file.exists()
    return has_service, str(service_file) if has_service else None

def analyze_js_file(js_path: str, page_name: str) -> Dict:
    """Analyze JavaScript file for standardization patterns"""
    if not js_path or not os.path.exists(js_path):
        return {}
    
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    results = {
        'uses_unified_cache': bool(re.search(r'UnifiedCacheManager', content)),
        'uses_cache_ttl_guard': bool(re.search(r'CacheTTLGuard', content)),
        'uses_cache_sync': bool(re.search(r'CacheSyncManager', content)),
        'uses_crud_handler': bool(re.search(r'CRUDResponseHandler', content)),
        'uses_handle_api_response': bool(re.search(r'handleApiResponseWithRefresh', content)),
        'uses_modal_manager_v2': bool(re.search(r'ModalManagerV2', content)),
        'uses_field_renderer': bool(re.search(r'FieldRendererService', content)),
        'uses_page_state_manager': bool(re.search(r'PageStateManager|restorePageState', content)),
        'logger_usage': bool(re.search(r'window\.Logger\.|Logger\.', content)),
        'direct_fetch_calls': len(re.findall(r'fetch\s*\(|\.get\s*\(|\.post\s*\(', content)),
        'console_log_count': len(re.findall(r'console\.(log|warn|error|info)', content)),
        'direct_cache_removal': bool(re.search(r'UnifiedCacheManager\.(remove|clear)', content)),
        'legacy_modal_code': bool(re.search(r'\$\(.*\)\.modal\(|bootstrap\.Modal', content)),
        'manual_rendering': bool(re.search(r'innerHTML\s*=|\.html\s*\(', content)),
        'custom_state_management': bool(re.search(r'localStorage\.(getItem|setItem).*state|sessionStorage', content)),
    }
    
    # Check for data service usage
    data_service_patterns = [
        rf'{page_name}-data',
        rf'{page_name.replace("_", "-")}-data',
        'DashboardData',
        'TradesData',
        'TradePlansData',
    ]
    results['uses_data_service'] = any(
        re.search(pattern, content, re.IGNORECASE) 
        for pattern in data_service_patterns
    )
    
    # Legacy patterns
    legacy_patterns = []
    if re.search(r'\.ajax\s*\(', content):
        legacy_patterns.append('jQuery AJAX')
    if re.search(r'XMLHttpRequest', content):
        legacy_patterns.append('XMLHttpRequest')
    if re.search(r'onclick\s*=', content):
        legacy_patterns.append('Inline onclick')
    
    results['legacy_code_patterns'] = legacy_patterns
    
    return results

def analyze_html_file(html_path: str) -> Dict:
    """Analyze HTML file for standardization patterns"""
    if not html_path or not os.path.exists(html_path):
        return {}
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    return {
        'inline_styles': bool(re.search(r'style\s*=', content)),
        'legacy_modal_code': bool(re.search(r'data-toggle\s*=\s*["\']modal["\']', content)),
        'uses_modal_manager_v2': bool(re.search(r'data-onclick.*showModal|ModalManagerV2', content)),
    }

def analyze_page(page_name: str, page_type: str) -> PageAnalysis:
    """Analyze a single page"""
    html_path, js_path = find_page_files(page_name)
    has_service, service_file = check_data_service(page_name)
    
    analysis = PageAnalysis(
        page_name=page_name,
        page_type=page_type,
        html_file=html_path,
        js_file=js_path,
        has_data_service=has_service,
        data_service_file=service_file
    )
    
    # Analyze JS file
    if js_path:
        js_results = analyze_js_file(js_path, page_name)
        analysis.uses_unified_cache = js_results.get('uses_unified_cache', False)
        analysis.uses_cache_ttl_guard = js_results.get('uses_cache_ttl_guard', False)
        analysis.uses_cache_sync = js_results.get('uses_cache_sync', False)
        analysis.uses_crud_handler = js_results.get('uses_crud_handler', False)
        analysis.uses_handle_api_response = js_results.get('uses_handle_api_response', False)
        analysis.uses_modal_manager_v2 = js_results.get('uses_modal_manager_v2', False)
        analysis.uses_field_renderer = js_results.get('uses_field_renderer', False)
        analysis.uses_page_state_manager = js_results.get('uses_page_state_manager', False)
        analysis.logger_usage = js_results.get('logger_usage', False)
        analysis.direct_fetch_calls = js_results.get('direct_fetch_calls', 0)
        analysis.console_log_count = js_results.get('console_log_count', 0)
        analysis.direct_cache_removal = js_results.get('direct_cache_removal', False)
        analysis.legacy_modal_code = js_results.get('legacy_modal_code', False)
        analysis.manual_rendering = js_results.get('manual_rendering', False)
        analysis.custom_state_management = js_results.get('custom_state_management', False)
        analysis.uses_data_service = js_results.get('uses_data_service', False)
        analysis.legacy_code_patterns = js_results.get('legacy_code_patterns', [])
    
    # Analyze HTML file
    if html_path:
        html_results = analyze_html_file(html_path)
        analysis.inline_styles = html_results.get('inline_styles', False)
        if html_results.get('legacy_modal_code', False):
            analysis.legacy_modal_code = True
    
    # Generate issues and recommendations
    generate_issues_and_recommendations(analysis)
    
    return analysis

def generate_issues_and_recommendations(analysis: PageAnalysis):
    """Generate issues and recommendations based on analysis"""
    issues = []
    recommendations = []
    
    # Data Service issues
    if analysis.has_data_service and not analysis.uses_data_service:
        issues.append("שירות נתונים קיים אך לא בשימוש - העמוד משתמש ב-fetch ישיר")
        recommendations.append("להחליף קריאות fetch ישירות לשימוש ב-{}-data.js".format(
            analysis.page_name.replace("_", "-")
        ))
    elif not analysis.has_data_service and analysis.direct_fetch_calls > 0:
        issues.append("אין שירות נתונים ייעודי - העמוד משתמש ב-fetch ישיר")
        recommendations.append("ליצור שירות נתונים ייעודי {}-data.js לפי דוגמת trades-data.js".format(
            analysis.page_name.replace("_", "-")
        ))
    
    # Cache issues
    if not analysis.uses_unified_cache and analysis.direct_fetch_calls > 0:
        issues.append("אין שימוש ב-UnifiedCacheManager")
        recommendations.append("להשתמש ב-UnifiedCacheManager דרך שירות הנתונים")
    
    if analysis.direct_cache_removal:
        issues.append("ניקוי מטמון ישיר במקום CacheSyncManager")
        recommendations.append("להחליף UnifiedCacheManager.remove/clear לשימוש ב-CacheSyncManager")
    
    # CRUD issues
    if not analysis.uses_crud_handler and analysis.direct_fetch_calls > 0:
        issues.append("אין שימוש ב-CRUDResponseHandler")
        recommendations.append("לעטוף פעולות CRUD ב-CRUDResponseHandler.handleApiResponse")
    
    if not analysis.uses_handle_api_response:
        issues.append("אין שימוש ב-handleApiResponseWithRefresh")
        recommendations.append("להשתמש ב-handleApiResponseWithRefresh לאחר פעולות CRUD")
    
    # Modal issues
    if not analysis.uses_modal_manager_v2:
        issues.append("אין שימוש ב-ModalManagerV2")
        recommendations.append("להחליף מודלים ישנים ל-ModalManagerV2")
    
    if analysis.legacy_modal_code:
        issues.append("קוד מודלים ישן (jQuery/Bootstrap)")
        recommendations.append("להסיר קוד מודלים ישן ולהשתמש ב-ModalManagerV2 בלבד")
    
    # Field Renderer issues
    if not analysis.uses_field_renderer and analysis.manual_rendering:
        issues.append("רינדור ידני במקום FieldRendererService")
        recommendations.append("להשתמש ב-FieldRendererService.renderStatus/renderAmount/renderDate")
    
    # Page State issues
    if not analysis.uses_page_state_manager and analysis.custom_state_management:
        issues.append("ניהול מצב מותאם במקום PageStateManager")
        recommendations.append("להשתמש ב-PageStateManager.saveState/restoreState")
    
    # Logging issues
    if analysis.console_log_count > 0:
        issues.append("שימוש ב-console.log במקום Logger ({})".format(analysis.console_log_count))
        recommendations.append("להחליף console.log/warn/error ל-window.Logger.info/warn/error")
    
    # Code Quality issues
    if analysis.inline_styles:
        issues.append("סטיילים inline ב-HTML")
        recommendations.append("להעביר כל הסטיילים לקובץ CSS חיצוני")
    
    if analysis.legacy_code_patterns:
        issues.append("דפוסי קוד ישנים: {}".format(", ".join(analysis.legacy_code_patterns)))
        recommendations.append("לעדכן לדפוסים מודרניים (fetch, data-onclick, וכו')")
    
    analysis.issues = issues
    analysis.recommendations = recommendations

def generate_per_page_report(analysis: PageAnalysis) -> str:
    """Generate detailed report for a single page"""
    report = f"""# דוח סטנדרטיזציה - {analysis.page_name}

## סקירה כללית
- **סוג עמוד**: {'עמוד מרכזי' if analysis.page_type == 'main' else 'עמוד תומך'}
- **קובץ HTML**: `{analysis.html_file or 'לא נמצא'}`
- **קובץ JavaScript**: `{analysis.js_file or 'לא נמצא'}`

## שימוש במערכות כלליות

### שירות נתונים
- **שירות נתונים קיים**: {'✅ כן' if analysis.has_data_service else '❌ לא'}
- **שירות נתונים בשימוש**: {'✅ כן' if analysis.uses_data_service else '❌ לא'}
- **קובץ שירות**: `{analysis.data_service_file or 'אין'}`

### מערכת מטמון
- **UnifiedCacheManager**: {'✅ כן' if analysis.uses_unified_cache else '❌ לא'}
- **CacheTTLGuard**: {'✅ כן' if analysis.uses_cache_ttl_guard else '❌ לא'}
- **CacheSyncManager**: {'✅ כן' if analysis.uses_cache_sync else '❌ לא'}
- **ניקוי מטמון ישיר**: {'⚠️ כן' if analysis.direct_cache_removal else '✅ לא'}

### מערכת CRUD
- **CRUDResponseHandler**: {'✅ כן' if analysis.uses_crud_handler else '❌ לא'}
- **handleApiResponseWithRefresh**: {'✅ כן' if analysis.uses_handle_api_response else '❌ לא'}
- **קריאות fetch ישירות**: {analysis.direct_fetch_calls}

### מערכת מודלים
- **ModalManagerV2**: {'✅ כן' if analysis.uses_modal_manager_v2 else '❌ לא'}
- **קוד מודלים ישן**: {'⚠️ כן' if analysis.legacy_modal_code else '✅ לא'}

### מערכת רינדור
- **FieldRendererService**: {'✅ כן' if analysis.uses_field_renderer else '❌ לא'}
- **רינדור ידני**: {'⚠️ כן' if analysis.manual_rendering else '✅ לא'}

### ניהול מצב עמוד
- **PageStateManager**: {'✅ כן' if analysis.uses_page_state_manager else '❌ לא'}
- **ניהול מצב מותאם**: {'⚠️ כן' if analysis.custom_state_management else '✅ לא'}

### מערכת לוגים
- **Logger Service**: {'✅ כן' if analysis.logger_usage else '❌ לא'}
- **console.log/warn/error**: {analysis.console_log_count}

## חובות טכניים מרכזיים

"""
    
    if analysis.issues:
        for issue in analysis.issues:
            report += f"- ⚠️ {issue}\n"
    else:
        report += "- ✅ אין חובות טכניים משמעותיים\n"
    
    report += "\n## משימות מומלצות\n\n"
    
    if analysis.recommendations:
        for i, rec in enumerate(analysis.recommendations, 1):
            report += f"{i}. {rec}\n"
    else:
        report += "- ✅ העמוד מיושר לסטנדרטים הכלליים\n"
    
    report += f"""
## סטטיסטיקות

- **קריאות fetch ישירות**: {analysis.direct_fetch_calls}
- **שימוש ב-console.log**: {analysis.console_log_count}
- **דפוסי קוד ישנים**: {len(analysis.legacy_code_patterns)}

---
*דוח נוצר אוטומטית על ידי סקריפט ניתוח סטנדרטיזציה*
"""
    
    return report

def generate_summary_table(analyses: List[PageAnalysis]) -> str:
    """Generate summary table for all pages"""
    table = """# דוח סטנדרטיזציה מרכזי - עמודי משתמש

## טבלת סטטוס

| עמוד | סוג | Data Service | Cache | CRUD | Modals | Field Renderer | Page State | Logger | דוח מפורט |
|------|-----|-------------|-------|------|--------|----------------|------------|--------|-----------|
"""
    
    for analysis in analyses:
        page_name = analysis.page_name
        page_type = "מרכזי" if analysis.page_type == "main" else "תומך"
        
        # Status indicators
        data_service = "✅" if analysis.uses_data_service else ("⚠️" if analysis.has_data_service else "❌")
        cache = "✅" if analysis.uses_unified_cache and analysis.uses_cache_sync else "⚠️" if analysis.uses_unified_cache else "❌"
        crud = "✅" if analysis.uses_crud_handler and analysis.uses_handle_api_response else "⚠️" if analysis.uses_crud_handler else "❌"
        modals = "✅" if analysis.uses_modal_manager_v2 and not analysis.legacy_modal_code else "⚠️" if analysis.uses_modal_manager_v2 else "❌"
        field_renderer = "✅" if analysis.uses_field_renderer else "❌"
        page_state = "✅" if analysis.uses_page_state_manager else "❌"
        logger = "✅" if analysis.logger_usage and analysis.console_log_count == 0 else "⚠️" if analysis.logger_usage else "❌"
        
        report_file = f"{page_name}.report.md"
        
        table += f"| {page_name} | {page_type} | {data_service} | {cache} | {crud} | {modals} | {field_renderer} | {page_state} | {logger} | [{report_file}]({report_file}) |\n"
    
    return table

def main():
    """Main analysis function"""
    print("🔍 Starting page standardization analysis...")
    
    # Create reports directory
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Analyze all pages
    analyses = []
    
    print("\n📊 Analyzing main pages...")
    for page_name in MAIN_PAGES:
        print(f"  - {page_name}")
        analysis = analyze_page(page_name, "main")
        analyses.append(analysis)
    
    print("\n📊 Analyzing supporting pages...")
    for page_name in SUPPORTING_PAGES:
        print(f"  - {page_name}")
        analysis = analyze_page(page_name, "supporting")
        analyses.append(analysis)
    
    # Generate per-page reports
    print("\n📝 Generating per-page reports...")
    for analysis in analyses:
        report = generate_per_page_report(analysis)
        report_file = REPORTS_DIR / f"{analysis.page_name}.report.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"  ✅ {analysis.page_name}.report.md")
    
    # Generate summary report
    print("\n📋 Generating summary report...")
    summary = generate_summary_table(analyses)
    summary_file = REPORTS_DIR / "USER_PAGES_STANDARDIZATION_SUMMARY.md"
    
    # Read existing summary and update table
    if summary_file.exists():
        with open(summary_file, 'r', encoding='utf-8') as f:
            existing = f.read()
        
        # Replace table section
        if "## טבלת סטטוס" in existing:
            parts = existing.split("## טבלת סטטוס")
            new_content = parts[0] + summary.split("## טבלת סטטוס")[1]
        else:
            new_content = existing + "\n\n" + summary
    else:
        new_content = summary
    
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  ✅ USER_PAGES_STANDARDIZATION_SUMMARY.md")
    
    # Print statistics
    print("\n📊 Analysis Statistics:")
    print(f"  - Total pages analyzed: {len(analyses)}")
    print(f"  - Pages with data services: {sum(1 for a in analyses if a.has_data_service)}")
    print(f"  - Pages using UnifiedCacheManager: {sum(1 for a in analyses if a.uses_unified_cache)}")
    print(f"  - Pages using CRUDResponseHandler: {sum(1 for a in analyses if a.uses_crud_handler)}")
    print(f"  - Pages using ModalManagerV2: {sum(1 for a in analyses if a.uses_modal_manager_v2)}")
    print(f"  - Total console.log calls: {sum(a.console_log_count for a in analyses)}")
    print(f"  - Total direct fetch calls: {sum(a.direct_fetch_calls for a in analyses)}")
    
    print("\n✅ Analysis complete!")

if __name__ == "__main__":
    main()

