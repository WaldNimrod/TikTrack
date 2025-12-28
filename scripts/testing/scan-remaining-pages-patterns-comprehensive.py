#!/usr/bin/env python3
"""
סריקת דפוסים מקיפה - עמודים טכניים ומשניים שנותרו
Comprehensive Patterns Scan - Remaining Technical and Secondary Pages
"""

import os
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

PAGES_DIR = Path("trading-ui")
REPORTS_DIR = Path("documentation/05-REPORTS")

# רשימת העמודים שנותרו
REMAINING_PAGES = [
    # עמודים טכניים
    "db_display.html",
    "db_extradata.html",
    "constraints.html",
    "background_tasks.html",
    "server_monitor.html",
    "system_management.html",
    "init_system_management.html",
    "notifications_center.html",
    "css_management.html",
    "dynamic_colors_display.html",
    "designs.html",
    "tradingview_widgets_showcase.html",
    # עמודים משניים
    "external_data_dashboard.html",
    "chart_management.html"
]

def check_bootstrap_css(content):
    """בדיקת Bootstrap CSS"""
    return 'bootstrap.min.css' in content.lower() or 'bootstrap.css' in content.lower()

def check_icon_system(content):
    """בדיקת IconSystem - כל 3 הקבצים"""
    has_mappings = 'icon-mappings.js' in content
    has_system = 'icon-system.js' in content
    has_helper = 'icon-replacement-helper.js' in content
    return {
        'icon-mappings.js': has_mappings,
        'icon-system.js': has_system,
        'icon-replacement-helper.js': has_helper,
        'complete': has_mappings and has_system and has_helper
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
    # בדוק style="..." attributes (אבל דילוג על dynamic styles)
    inline_style_pattern = r'style=["\']([^"\']+)["\']'
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
        'dynamic': len(dynamic_matches),
        'static': len(static_matches),
        'static_matches': static_matches
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

def check_script_versioning(content):
    """בדיקת versioning בסקריפטים"""
    script_pattern = r'<script[^>]*src=["\']([^"\']+)["\'][^>]*>'
    scripts = re.findall(script_pattern, content)
    
    scripts_without_version = []
    scripts_with_version = []
    
    for script in scripts:
        # דילוג על CDN
        if 'cdn.jsdelivr.net' in script or 'cdnjs.cloudflare.com' in script:
            continue
        
        # דילוג על חיצוניים
        if script.startswith('http'):
            continue
        
        if '?v=' in script or '&v=' in script:
            scripts_with_version.append(script)
        else:
            scripts_without_version.append(script)
    
    return {
        'total': len(scripts),
        'with_version': len(scripts_with_version),
        'without_version': len(scripts_without_version),
        'without_version_list': scripts_without_version[:10]  # רק 10 ראשונים
    }

def check_load_order(content):
    """בדיקת סדר טעינה - logger-service לפני header-system"""
    logger_match = re.search(r'logger-service\.js', content)
    header_match = re.search(r'header-system\.js', content)
    
    if not logger_match or not header_match:
        return None
    
    return {
        'logger_position': logger_match.start(),
        'header_position': header_match.start(),
        'correct_order': logger_match.start() < header_match.start()
    }

def check_defer_usage(content):
    """בדיקת defer ב-logger-service"""
    logger_pattern = r'<script[^>]*logger-service\.js[^>]*>'
    matches = re.findall(logger_pattern, content)
    
    has_defer = any('defer' in match for match in matches)
    return {
        'has_defer': has_defer,
        'matches': matches
    }

def check_duplicate_scripts(content):
    """בדיקת scripts כפולים"""
    script_pattern = r'<script[^>]*src=["\']([^"\']+)["\'][^>]*>'
    scripts = re.findall(script_pattern, content)
    
    # נרמול - רק שם הקובץ
    script_counts = defaultdict(list)
    for script in scripts:
        script_name = os.path.basename(script.split('?')[0])  # בלי query string
        script_counts[script_name].append(script)
    
    duplicates = {name: paths for name, paths in script_counts.items() if len(paths) > 1}
    
    return {
        'total_unique': len(script_counts),
        'duplicates_count': len(duplicates),
        'duplicates': duplicates
    }

def scan_page(page_name):
    """סריקה של עמוד אחד"""
    page_path = PAGES_DIR / page_name
    
    if not page_path.exists():
        return {
            'page': page_name,
            'exists': False,
            'error': 'File not found'
        }
    
    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    results = {
        'page': page_name,
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
    results['checks']['script_versioning'] = check_script_versioning(content)
    results['checks']['load_order'] = check_load_order(content)
    results['checks']['defer_usage'] = check_defer_usage(content)
    results['checks']['duplicate_scripts'] = check_duplicate_scripts(content)
    
    return results

def generate_report(all_results):
    """יצירת דוח מפורט"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = REPORTS_DIR / f"REMAINING_PAGES_PATTERNS_SCAN_{timestamp}.md"
    
    # איסוף דפוסים
    patterns = defaultdict(list)
    
    for result in all_results:
        if not result.get('exists'):
            continue
        
        checks = result['checks']
        
        # Bootstrap CSS
        if not checks.get('bootstrap_css'):
            patterns['missing_bootstrap'].append(result['page'])
        
        # IconSystem
        icon_system = checks.get('icon_system', {})
        if not icon_system.get('complete'):
            missing = []
            if not icon_system.get('icon-mappings.js'):
                missing.append('icon-mappings.js')
            if not icon_system.get('icon-system.js'):
                missing.append('icon-system.js')
            if not icon_system.get('icon-replacement-helper.js'):
                missing.append('icon-replacement-helper.js')
            patterns['incomplete_icon_system'].append({
                'page': result['page'],
                'missing': missing
            })
        
        # Unified Cache Manager
        if not checks.get('unified_cache_manager'):
            patterns['missing_cache_manager'].append(result['page'])
        
        # Error Handlers
        if not checks.get('error_handlers'):
            patterns['missing_error_handlers'].append(result['page'])
        
        # API Config
        if not checks.get('api_config'):
            patterns['missing_api_config'].append(result['page'])
        
        # Logger Service
        if not checks.get('logger_service'):
            patterns['missing_logger_service'].append(result['page'])
        
        # Inline Styles
        inline_styles = checks.get('inline_styles', [])
        if inline_styles:
            patterns['inline_styles'].append({
                'page': result['page'],
                'count': len(inline_styles)
            })
        
        # Style Tags
        style_tags = checks.get('style_tags', {})
        if style_tags.get('static', 0) > 0:
            patterns['style_tags'].append({
                'page': result['page'],
                'count': style_tags['static']
            })
        
        # Console Usage
        console_usage = checks.get('console_usage', {})
        if console_usage.get('total', 0) > 0:
            patterns['console_usage'].append({
                'page': result['page'],
                'count': console_usage['total'],
                'details': console_usage
            })
        
        # Script Versioning
        versioning = checks.get('script_versioning', {})
        if versioning.get('without_version', 0) > 0:
            patterns['missing_versioning'].append({
                'page': result['page'],
                'count': versioning['without_version']
            })
        
        # Load Order
        load_order = checks.get('load_order')
        if load_order and not load_order.get('correct_order'):
            patterns['load_order_issues'].append(result['page'])
        
        # Defer Usage
        defer_usage = checks.get('defer_usage', {})
        if defer_usage.get('has_defer'):
            patterns['logger_with_defer'].append(result['page'])
        
        # Duplicate Scripts
        duplicates = checks.get('duplicate_scripts', {})
        if duplicates.get('duplicates_count', 0) > 0:
            patterns['duplicate_scripts'].append({
                'page': result['page'],
                'count': duplicates['duplicates_count'],
                'details': duplicates['duplicates']
            })
    
    # יצירת דוח
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# דוח סריקת דפוסים מקיפה - עמודים טכניים ומשניים\n\n")
        f.write(f"**תאריך:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
        f.write("## סיכום כללי\n\n")
        f.write(f"- **סה\"כ עמודים נסרקו:** {len(all_results)}\n")
        f.write(f"- **עמודים שנמצאו:** {sum(1 for r in all_results if r.get('exists'))}\n")
        f.write(f"- **עמודים שלא נמצאו:** {sum(1 for r in all_results if not r.get('exists'))}\n\n")
        f.write("---\n\n")
        
        # דפוסים
        f.write("## 🔍 דפוסים שזוהו\n\n")
        
        # Bootstrap CSS
        if patterns.get('missing_bootstrap'):
            f.write(f"### ❌ Bootstrap CSS חסר ({len(patterns['missing_bootstrap'])} עמודים)\n\n")
            for page in patterns['missing_bootstrap']:
                f.write(f"- {page}\n")
            f.write("\n")
        
        # IconSystem
        if patterns.get('incomplete_icon_system'):
            f.write(f"### ⚠️ IconSystem לא מלא ({len(patterns['incomplete_icon_system'])} עמודים)\n\n")
            for item in patterns['incomplete_icon_system']:
                f.write(f"- **{item['page']}** - חסר: {', '.join(item['missing'])}\n")
            f.write("\n")
        
        # Unified Cache Manager
        if patterns.get('missing_cache_manager'):
            f.write(f"### ⚠️ Unified Cache Manager חסר ({len(patterns['missing_cache_manager'])} עמודים)\n\n")
            for page in patterns['missing_cache_manager']:
                f.write(f"- {page}\n")
            f.write("\n")
        
        # Error Handlers
        if patterns.get('missing_error_handlers'):
            f.write(f"### ⚠️ Error Handlers חסר ({len(patterns['missing_error_handlers'])} עמודים)\n\n")
            for page in patterns['missing_error_handlers']:
                f.write(f"- {page}\n")
            f.write("\n")
        
        # API Config
        if patterns.get('missing_api_config'):
            f.write(f"### ⚠️ API Config חסר ({len(patterns['missing_api_config'])} עמודים)\n\n")
            for page in patterns['missing_api_config']:
                f.write(f"- {page}\n")
            f.write("\n")
        
        # Logger Service
        if patterns.get('missing_logger_service'):
            f.write(f"### ⚠️ Logger Service חסר ({len(patterns['missing_logger_service'])} עמודים)\n\n")
            for page in patterns['missing_logger_service']:
                f.write(f"- {page}\n")
            f.write("\n")
        
        # Inline Styles
        if patterns.get('inline_styles'):
            f.write(f"### ❌ Inline Styles ({len(patterns['inline_styles'])} עמודים)\n\n")
            for item in patterns['inline_styles']:
                f.write(f"- **{item['page']}** - {item['count']} inline styles\n")
            f.write("\n")
        
        # Style Tags
        if patterns.get('style_tags'):
            f.write(f"### ❌ Style Tags ({len(patterns['style_tags'])} עמודים)\n\n")
            for item in patterns['style_tags']:
                f.write(f"- **{item['page']}** - {item['count']} style tags\n")
            f.write("\n")
        
        # Console Usage
        if patterns.get('console_usage'):
            f.write(f"### ❌ Console Usage ({len(patterns['console_usage'])} עמודים)\n\n")
            for item in patterns['console_usage']:
                f.write(f"- **{item['page']}** - {item['count']} קריאות console\n")
                details = item['details']
                if details.get('error'):
                    f.write(f"  - console.error: {details['error']}\n")
                if details.get('warn'):
                    f.write(f"  - console.warn: {details['warn']}\n")
                if details.get('log'):
                    f.write(f"  - console.log: {details['log']}\n")
            f.write("\n")
        
        # Script Versioning
        if patterns.get('missing_versioning'):
            total_scripts = sum(item['count'] for item in patterns['missing_versioning'])
            f.write(f"### ⚠️ Script Versioning ({len(patterns['missing_versioning'])} עמודים, {total_scripts} scripts)\n\n")
            for item in patterns['missing_versioning']:
                f.write(f"- **{item['page']}** - {item['count']} scripts ללא versioning\n")
            f.write("\n")
        
        # Load Order
        if patterns.get('load_order_issues'):
            f.write(f"### ⚠️ בעיות סדר טעינה ({len(patterns['load_order_issues'])} עמודים)\n\n")
            for page in patterns['load_order_issues']:
                f.write(f"- {page} - logger-service צריך להיות לפני header-system\n")
            f.write("\n")
        
        # Defer Usage
        if patterns.get('logger_with_defer'):
            f.write(f"### ⚠️ Logger Service עם defer ({len(patterns['logger_with_defer'])} עמודים)\n\n")
            for page in patterns['logger_with_defer']:
                f.write(f"- {page}\n")
            f.write("\n")
        
        # Duplicate Scripts
        if patterns.get('duplicate_scripts'):
            f.write(f"### ❌ Scripts כפולים ({len(patterns['duplicate_scripts'])} עמודים)\n\n")
            for item in patterns['duplicate_scripts']:
                f.write(f"- **{item['page']}** - {item['count']} scripts כפולים\n")
                for script_name, paths in list(item['details'].items())[:3]:  # רק 3 ראשונים
                    f.write(f"  - {script_name}: {len(paths)} מופעים\n")
            f.write("\n")
        
        # דוח פרטני לכל עמוד
        f.write("---\n\n")
        f.write("## דוח פרטני לכל עמוד\n\n")
        
        for result in all_results:
            if not result.get('exists'):
                f.write(f"### {result['page']}\n\n")
                f.write(f"❌ קובץ לא נמצא\n\n")
                continue
            
            f.write(f"### {result['page']}\n\n")
            checks = result['checks']
            
            # Bootstrap CSS
            f.write(f"- **Bootstrap CSS:** {'✅' if checks.get('bootstrap_css') else '❌'}\n")
            
            # IconSystem
            icon_system = checks.get('icon_system', {})
            if icon_system.get('complete'):
                f.write(f"- **IconSystem:** ✅ מלא\n")
            else:
                missing = []
                if not icon_system.get('icon-mappings.js'):
                    missing.append('icon-mappings.js')
                if not icon_system.get('icon-system.js'):
                    missing.append('icon-system.js')
                if not icon_system.get('icon-replacement-helper.js'):
                    missing.append('icon-replacement-helper.js')
                f.write(f"- **IconSystem:** ⚠️ חסר: {', '.join(missing)}\n")
            
            # Unified Cache Manager
            f.write(f"- **Unified Cache Manager:** {'✅' if checks.get('unified_cache_manager') else '⚠️ חסר'}\n")
            
            # Error Handlers
            f.write(f"- **Error Handlers:** {'✅' if checks.get('error_handlers') else '⚠️ חסר'}\n")
            
            # API Config
            f.write(f"- **API Config:** {'✅' if checks.get('api_config') else '⚠️ חסר'}\n")
            
            # Logger Service
            f.write(f"- **Logger Service:** {'✅' if checks.get('logger_service') else '⚠️ חסר'}\n")
            
            # Inline Styles
            inline_count = len(checks.get('inline_styles', []))
            f.write(f"- **Inline Styles:** {'✅' if inline_count == 0 else f'❌ {inline_count}'}\n")
            
            # Style Tags
            style_tags = checks.get('style_tags', {})
            static_count = style_tags.get('static', 0)
            f.write(f"- **Style Tags:** {'✅' if static_count == 0 else f'❌ {static_count} static'}\n")
            
            # Console Usage
            console_total = checks.get('console_usage', {}).get('total', 0)
            f.write(f"- **Console Usage:** {'✅' if console_total == 0 else f'❌ {console_total} קריאות'}\n")
            
            # Script Versioning
            versioning = checks.get('script_versioning', {})
            without_version = versioning.get('without_version', 0)
            f.write(f"- **Script Versioning:** {'✅' if without_version == 0 else f'⚠️ {without_version} ללא version'}\n")
            
            # Load Order
            load_order = checks.get('load_order')
            if load_order:
                f.write(f"- **Load Order:** {'✅' if load_order.get('correct_order') else '⚠️ לא תקין'}\n")
            
            # Defer Usage
            defer_usage = checks.get('defer_usage', {})
            if defer_usage.get('has_defer'):
                f.write(f"- **Logger Defer:** ⚠️ יש defer (צריך להסיר)\n")
            
            # Duplicate Scripts
            duplicates_count = checks.get('duplicate_scripts', {}).get('duplicates_count', 0)
            f.write(f"- **Duplicate Scripts:** {'✅' if duplicates_count == 0 else f'❌ {duplicates_count}'}\n")
            
            f.write("\n")
    
    print(f"✅ דוח נוצר: {report_path}")
    return report_path

def main():
    print("🔍 סריקת דפוסים מקיפה - עמודים טכניים ומשניים שנותרו...\n")
    
    all_results = []
    
    for page_name in REMAINING_PAGES:
        print(f"📄 סריקת {page_name}...")
        result = scan_page(page_name)
        all_results.append(result)
    
    # יצירת דוח
    report_path = generate_report(all_results)
    
    print(f"\n✅ סיום סריקה - {len(all_results)} עמודים נסרקו")
    print(f"📊 דוח: {report_path}")

if __name__ == "__main__":
    main()

