#!/usr/bin/env python3
"""
סריקת אימות סופית מקיפה - כל העמודים
Comprehensive Final Verification Scan - All Pages
"""

import os
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

PAGES_DIR = Path("trading-ui")
REPORTS_DIR = Path("documentation/05-REPORTS")

# רשימת כל 36 העמודים לפי המסמך
ALL_PAGES = {
    # עמודים מרכזיים (11)
    "central": [
        "index.html",
        "trades.html",
        "trade_plans.html",
        "alerts.html",
        "tickers.html",
        "trading_accounts.html",
        "executions.html",
        "cash_flows.html",
        "notes.html",
        "research.html",
        "preferences.html"
    ],
    # עמודים טכניים (12)
    "technical": [
        "db_display.html",
        "db_extradata.html",
        "constraints.html",
        "background-tasks.html",
        "server-monitor.html",
        "system-management.html",
        "init-system-management.html",
        "notifications-center.html",
        "css-management.html",
        "dynamic-colors-display.html",
        "designs.html",
        "tradingview-widgets-showcase.html"
    ],
    # עמודים משניים (2)
    "secondary": [
        "external-data-dashboard.html",
        "chart-management.html"
    ],
    # עמודי מוקאפ (11)
    "mockup": [
        "portfolio-state-page.html",
        "trade-history-page.html",
        "price-history-page.html",
        "comparative-analysis-page.html",
        "trading-journal-page.html",
        "strategy-analysis-page.html",
        "economic-calendar-page.html",
        "history-widget.html",
        "emotional-tracking-widget.html",
        "date-comparison-modal.html",
        "tradingview-test-page.html"
    ]
}

def check_bootstrap_css(content):
    """בדיקת Bootstrap CSS"""
    return 'bootstrap.min.css' in content.lower() or 'bootstrap.css' in content.lower()

def check_icon_system(content):
    """בדיקת IconSystem - כל 3 הקבצים"""
    has_mappings = 'icon-mappings.js' in content
    has_system = 'icon-system.js' in content
    has_helper = 'icon-replacement-helper.js' in content
    return {
        'complete': has_mappings and has_system and has_helper,
        'missing': []
    }

def check_unified_cache_manager(content):
    """בדיקת Unified Cache Manager"""
    return 'unified-cache-manager.js' in content

def check_error_handlers(content):
    """בדיקת Error Handlers"""
    return 'error-handlers.js' in content

def check_api_config(content):
    """בדיקת API Config"""
    return 'api-config.js' in content

def check_logger_service(content):
    """בדיקת Logger Service"""
    return 'logger-service.js' in content

def check_inline_styles(content):
    """בדיקת inline styles"""
    # חיפוש רק style= ולא data-style=
    inline_style_pattern = r'(?<!data-)style=["\']([^"\']+)["\']'
    matches = re.findall(inline_style_pattern, content)
    
    # דילוג על dynamic styles
    dynamic_indicators = ['var(', 'calc(', '{{', '${']
    filtered_matches = []
    for match in matches:
        is_dynamic = any(indicator in match for indicator in dynamic_indicators)
        if not is_dynamic and match.strip():
            filtered_matches.append(match.strip())
    
    return filtered_matches

def check_style_tags(content):
    """בדיקת <style> tags"""
    style_tag_pattern = r'<style[^>]*>.*?</style>'
    matches = re.findall(style_tag_pattern, content, re.DOTALL)
    
    # דילוג על dynamic styles
    dynamic_matches = []
    static_matches = []
    for match in matches:
        if 'dynamic' in match.lower() or 'generated' in match.lower():
            dynamic_matches.append(match)
        else:
            static_matches.append(match)
    
    return {
        'total': len(matches),
        'static': len(static_matches)
    }

def check_console_usage(content):
    """בדיקת שימוש ב-console.*"""
    console_patterns = {
        'error': len(re.findall(r'console\.error\s*\(', content)),
        'warn': len(re.findall(r'console\.warn\s*\(', content)),
        'log': len(re.findall(r'console\.log\s*\(', content)),
        'info': len(re.findall(r'console\.info\s*\(', content)),
        'debug': len(re.findall(r'console\.debug\s*\(', content))
    }
    
    total = sum(console_patterns.values())
    return {
        **console_patterns,
        'total': total
    }

def check_load_order(content):
    """בדיקת סדר טעינה - logger-service לפני header-system"""
    # חיפוש רק בתגי script, לא בהערות
    logger_match = re.search(r'<script[^>]*logger-service\.js[^>]*>', content)
    header_match = re.search(r'<script[^>]*header-system\.js[^>]*>', content)
    
    if not logger_match or not header_match:
        return None
    
    return {
        'correct_order': logger_match.start() < header_match.start()
    }

def scan_page(page_name, category):
    """סריקה של עמוד אחד"""
    # עמודי מוקאפ נמצאים בתיקיית mockups/daily-snapshots
    if category == "mockup":
        page_path = PAGES_DIR / "mockups" / "daily-snapshots" / page_name
    else:
        page_path = PAGES_DIR / page_name
    
    if not page_path.exists():
        return {
            'page': page_name,
            'category': category,
            'exists': False,
            'error': 'File not found'
        }
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    results = {
        'page': page_name,
        'category': category,
        'exists': True,
        'timestamp': datetime.now().isoformat(),
        'checks': {}
    }
    
    # ריצת כל הבדיקות
    results['checks']['bootstrap_css'] = check_bootstrap_css(content)
    results['checks']['icon_system'] = check_icon_system(content)
    results['checks']['unified_cache_manager'] = check_unified_cache_manager(content)
    results['checks']['error_handlers'] = check_error_handlers(content)
    results['checks']['api_config'] = check_api_config(content)
    results['checks']['logger_service'] = check_logger_service(content)
    results['checks']['inline_styles'] = check_inline_styles(content)
    results['checks']['style_tags'] = check_style_tags(content)
    results['checks']['console_usage'] = check_console_usage(content)
    results['checks']['load_order'] = check_load_order(content)
    
    return results

def generate_final_report(all_results):
    """יצירת דוח סופי מקיף"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = REPORTS_DIR / f"FINAL_COMPREHENSIVE_VERIFICATION_REPORT_{timestamp}.md"
    
    # חישוב סטטיסטיקות
    stats = {
        'total': 0,
        'exists': 0,
        'perfect': 0,
        'issues': 0,
        'by_category': defaultdict(lambda: {'total': 0, 'perfect': 0, 'issues': 0})
    }
    
    pages_by_status = {
        'perfect': [],
        'minor_issues': [],
        'major_issues': [],
        'missing': []
    }
    
    for result in all_results:
        stats['total'] += 1
        category = result.get('category', 'unknown')
        stats['by_category'][category]['total'] += 1
        
        if not result.get('exists'):
            pages_by_status['missing'].append(result)
            continue
        
        stats['exists'] += 1
        checks = result['checks']
        
        # בדיקת מצב העמוד
        issues = []
        
        if not checks.get('bootstrap_css'):
            issues.append('Bootstrap CSS חסר')
        if not checks.get('icon_system', {}).get('complete'):
            issues.append('IconSystem לא מלא')
        if not checks.get('unified_cache_manager'):
            issues.append('Unified Cache Manager חסר')
        if not checks.get('error_handlers'):
            issues.append('Error Handlers חסר')
        if not checks.get('logger_service'):
            issues.append('Logger Service חסר')
        if len(checks.get('inline_styles', [])) > 0:
            issues.append(f"{len(checks['inline_styles'])} inline styles")
        if checks.get('style_tags', {}).get('static', 0) > 0:
            issues.append(f"{checks['style_tags']['static']} style tags")
        if checks.get('console_usage', {}).get('total', 0) > 0:
            issues.append(f"{checks['console_usage']['total']} console calls")
        load_order = checks.get('load_order')
        if load_order and not load_order.get('correct_order'):
            issues.append('בעיית סדר טעינה')
        
        if len(issues) == 0:
            stats['perfect'] += 1
            stats['by_category'][category]['perfect'] += 1
            pages_by_status['perfect'].append(result)
        elif len(issues) <= 2:
            stats['issues'] += 1
            stats['by_category'][category]['issues'] += 1
            pages_by_status['minor_issues'].append({**result, 'issues': issues})
        else:
            stats['issues'] += 1
            stats['by_category'][category]['issues'] += 1
            pages_by_status['major_issues'].append({**result, 'issues': issues})
    
    # יצירת דוח
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# דוח אימות סופי מקיף - כל העמודים\n\n")
        f.write(f"**תאריך:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
        f.write("## 📊 סיכום כללי\n\n")
        f.write(f"- **סה\"כ עמודים:** {stats['total']}\n")
        f.write(f"- **עמודים שנמצאו:** {stats['exists']}\n")
        f.write(f"- **עמודים מושלמים:** {stats['perfect']} ({stats['perfect']*100//stats['exists'] if stats['exists'] > 0 else 0}%)\n")
        f.write(f"- **עמודים עם בעיות:** {stats['issues']} ({stats['issues']*100//stats['exists'] if stats['exists'] > 0 else 0}%)\n")
        f.write(f"- **עמודים חסרים:** {len(pages_by_status['missing'])}\n\n")
        
        # סיכום לפי קטגוריה
        f.write("## 📋 סיכום לפי קטגוריה\n\n")
        for category, cat_stats in stats['by_category'].items():
            if cat_stats['total'] > 0:
                perfect_pct = cat_stats['perfect'] * 100 // cat_stats['total'] if cat_stats['total'] > 0 else 0
                f.write(f"### {category}\n")
                f.write(f"- סה\"כ: {cat_stats['total']}\n")
                f.write(f"- מושלמים: {cat_stats['perfect']} ({perfect_pct}%)\n")
                f.write(f"- בעיות: {cat_stats['issues']}\n\n")
        
        # עמודים מושלמים
        if pages_by_status['perfect']:
            f.write("## ✅ עמודים מושלמים\n\n")
            for result in sorted(pages_by_status['perfect'], key=lambda x: (x.get('category', ''), x.get('page', ''))):
                f.write(f"- **{result['page']}** ({result.get('category', 'unknown')})\n")
            f.write("\n")
        
        # עמודים עם בעיות קלות
        if pages_by_status['minor_issues']:
            f.write("## ⚠️ עמודים עם בעיות קלות\n\n")
            for result in sorted(pages_by_status['minor_issues'], key=lambda x: (x.get('category', ''), x.get('page', ''))):
                f.write(f"- **{result['page']}** ({result.get('category', 'unknown')})\n")
                for issue in result.get('issues', []):
                    f.write(f"  - {issue}\n")
            f.write("\n")
        
        # עמודים עם בעיות רציניות
        if pages_by_status['major_issues']:
            f.write("## ❌ עמודים עם בעיות רציניות\n\n")
            for result in sorted(pages_by_status['major_issues'], key=lambda x: (x.get('category', ''), x.get('page', ''))):
                f.write(f"- **{result['page']}** ({result.get('category', 'unknown')})\n")
                for issue in result.get('issues', []):
                    f.write(f"  - {issue}\n")
            f.write("\n")
        
        # עמודים חסרים
        if pages_by_status['missing']:
            f.write("## ❌ עמודים חסרים\n\n")
            for result in sorted(pages_by_status['missing'], key=lambda x: (x.get('category', ''), x.get('page', ''))):
                f.write(f"- **{result['page']}** ({result.get('category', 'unknown')}) - {result.get('error', 'לא נמצא')}\n")
            f.write("\n")
        
        # דוח מפורט לכל עמוד
        f.write("---\n\n")
        f.write("## דוח מפורט לכל עמוד\n\n")
        
        for category, pages in ALL_PAGES.items():
            f.write(f"### קטגוריה: {category}\n\n")
            for page_name in pages:
                result = next((r for r in all_results if r['page'] == page_name), None)
                if not result:
                    continue
                
                f.write(f"#### {page_name}\n\n")
                if not result.get('exists'):
                    f.write(f"- ❌ קובץ לא נמצא\n\n")
                    continue
                
                checks = result['checks']
                
                # סטטוס כל בדיקה
                f.write(f"- **Bootstrap CSS:** {'✅' if checks.get('bootstrap_css') else '❌'}\n")
                
                icon_system = checks.get('icon_system', {})
                f.write(f"- **IconSystem:** {'✅' if icon_system.get('complete') else '⚠️'}\n")
                
                f.write(f"- **Unified Cache Manager:** {'✅' if checks.get('unified_cache_manager') else '⚠️'}\n")
                f.write(f"- **Error Handlers:** {'✅' if checks.get('error_handlers') else '⚠️'}\n")
                f.write(f"- **Logger Service:** {'✅' if checks.get('logger_service') else '⚠️'}\n")
                
                inline_count = len(checks.get('inline_styles', []))
                f.write(f"- **Inline Styles:** {'✅' if inline_count == 0 else f'❌ {inline_count}'}\n")
                
                style_tags = checks.get('style_tags', {})
                static_count = style_tags.get('static', 0)
                f.write(f"- **Style Tags:** {'✅' if static_count == 0 else f'❌ {static_count}'}\n")
                
                console_total = checks.get('console_usage', {}).get('total', 0)
                f.write(f"- **Console Usage:** {'✅' if console_total == 0 else f'❌ {console_total}'}\n")
                
                load_order = checks.get('load_order')
                if load_order:
                    f.write(f"- **Load Order:** {'✅' if load_order.get('correct_order') else '⚠️'}\n")
                
                f.write("\n")
    
    print(f"✅ דוח נוצר: {report_path}")
    return report_path

def main():
    print("🔍 סריקת אימות סופית מקיפה - כל העמודים...\n")
    
    all_results = []
    
    for category, pages in ALL_PAGES.items():
        print(f"📂 קטגוריה: {category} ({len(pages)} עמודים)")
        for page_name in pages:
            print(f"  📄 סריקת {page_name}...")
            result = scan_page(page_name, category)
            all_results.append(result)
    
    # יצירת דוח
    report_path = generate_final_report(all_results)
    
    print(f"\n✅ סיום סריקה - {len(all_results)} עמודים נסרקו")
    print(f"📊 דוח: {report_path}")

if __name__ == "__main__":
    main()

