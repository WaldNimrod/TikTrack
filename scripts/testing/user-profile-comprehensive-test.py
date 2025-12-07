#!/usr/bin/env python3
"""
בדיקות חוזקות מקיפות לעמוד פרופיל משתמש
Comprehensive Strength Tests for User Profile Page
"""

import os
import re
from pathlib import Path
from datetime import datetime

PAGES_DIR = Path("trading-ui")
REPORTS_DIR = Path("documentation/05-REPORTS")
PAGE_NAME = "user-profile.html"
PAGE_PATH = PAGES_DIR / PAGE_NAME

def check_file_exists():
    """בדיקת קיום הקובץ"""
    return PAGE_PATH.exists()

def check_bootstrap_css(content):
    """בדיקת Bootstrap CSS"""
    has_bootstrap = 'bootstrap.min.css' in content.lower() or 'bootstrap.css' in content.lower()
    return {
        'passed': has_bootstrap,
        'details': 'Bootstrap CSS found' if has_bootstrap else 'Bootstrap CSS missing'
    }

def check_icon_system(content):
    """בדיקת IconSystem - כל 3 הקבצים"""
    has_mappings = 'icon-mappings.js' in content
    has_system = 'icon-system.js' in content
    has_helper = 'icon-replacement-helper.js' in content
    
    missing = []
    if not has_mappings:
        missing.append('icon-mappings.js')
    if not has_system:
        missing.append('icon-system.js')
    if not has_helper:
        missing.append('icon-replacement-helper.js')
    
    return {
        'passed': has_mappings and has_system and has_helper,
        'complete': has_mappings and has_system and has_helper,
        'missing': missing,
        'details': f"Missing: {', '.join(missing)}" if missing else "All IconSystem files present"
    }

def check_critical_scripts(content):
    """בדיקת סקריפטים קריטיים"""
    critical_scripts = {
        'unified-cache-manager.js': 'Unified Cache Manager',
        'error-handlers.js': 'Error Handlers',
        'api-config.js': 'API Config',
        'logger-service.js': 'Logger Service',
        'header-system.js': 'Header System',
        'auth.js': 'Authentication System',
        'user-profile.js': 'User Profile Script',
        'user-profile-ai-analysis.js': 'User Profile AI Analysis Script'
    }
    
    missing = []
    found = []
    
    for script, name in critical_scripts.items():
        if script in content:
            found.append(name)
        else:
            missing.append(name)
    
    return {
        'passed': len(missing) == 0,
        'found': found,
        'missing': missing,
        'details': f"Missing: {', '.join(missing)}" if missing else "All critical scripts present"
    }

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
    
    return {
        'passed': len(filtered_matches) == 0,
        'count': len(filtered_matches),
        'matches': filtered_matches[:10],  # רק 10 הראשונים
        'details': f"Found {len(filtered_matches)} inline styles" if filtered_matches else "No inline styles found"
    }

def check_style_tags(content):
    """בדיקת <style> tags"""
    style_tag_pattern = r'<style[^>]*>.*?</style>'
    matches = re.findall(style_tag_pattern, content, re.DOTALL)
    
    # דילוג על dynamic styles
    static_matches = []
    for match in matches:
        if 'dynamic' not in match.lower() and 'generated' not in match.lower():
            static_matches.append(match)
    
    return {
        'passed': len(static_matches) == 0,
        'total': len(matches),
        'static': len(static_matches),
        'details': f"Found {len(static_matches)} static style tags" if static_matches else "No static style tags found"
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
    
    # בדיקת שימוש ב-window.Logger במקום console
    logger_usage = {
        'Logger.info': len(re.findall(r'window\.Logger\?\.\s*info\s*\(', content)),
        'Logger.warn': len(re.findall(r'window\.Logger\?\.\s*warn\s*\(', content)),
        'Logger.error': len(re.findall(r'window\.Logger\?\.\s*error\s*\(', content)),
        'Logger.debug': len(re.findall(r'window\.Logger\?\.\s*debug\s*\(', content))
    }
    
    return {
        'passed': total == 0,
        'console_calls': console_patterns,
        'logger_calls': logger_usage,
        'total_console': total,
        'total_logger': sum(logger_usage.values()),
        'details': f"Found {total} console.* calls, {sum(logger_usage.values())} Logger calls"
    }

def check_load_order(content):
    """בדיקת סדר טעינה"""
    issues = []
    
    # בדיקת logger-service לפני header-system
    logger_match = re.search(r'<script[^>]*logger-service\.js[^>]*>', content)
    header_match = re.search(r'<script[^>]*header-system\.js[^>]*>', content)
    
    if logger_match and header_match:
        if logger_match.start() > header_match.start():
            issues.append('logger-service.js should load before header-system.js')
    
    # בדיקת auth.js לפני user-profile.js
    auth_match = re.search(r'<script[^>]*auth\.js[^>]*>', content)
    profile_match = re.search(r'<script[^>]*user-profile\.js[^>]*>', content)
    
    if auth_match and profile_match:
        if auth_match.start() > profile_match.start():
            issues.append('auth.js should load before user-profile.js')
    
    return {
        'passed': len(issues) == 0,
        'issues': issues,
        'details': '; '.join(issues) if issues else 'Load order is correct'
    }

def check_itcss_structure(content):
    """בדיקת מבנה ITCSS"""
    # בדיקת master.css או טעינה ישירה של שכבות ITCSS
    has_master = 'master.css' in content or 'styles-new/master.css' in content
    
    # בדיקת שכבות ITCSS
    has_settings = '01-settings' in content
    has_tools = '02-tools' in content
    has_generic = '03-generic' in content
    has_elements = '04-elements' in content
    has_objects = '05-objects' in content
    has_components = '06-components' in content
    has_pages = '07-pages' in content or '09-utilities' in content  # יש גם 09-utilities
    has_themes = '08-themes' in content
    
    # בדיקת טעינת CSS בסדר נכון
    bootstrap_match = re.search(r'<link[^>]*bootstrap[^>]*>', content, re.IGNORECASE)
    itcss_match = re.search(r'<link[^>]*styles-new/(01-settings|02-tools|master)[^>]*>', content, re.IGNORECASE)
    
    bootstrap_before_itcss = False
    if bootstrap_match and itcss_match:
        bootstrap_before_itcss = bootstrap_match.start() < itcss_match.start()
    
    issues = []
    
    # ITCSS תקין אם יש master.css או אם יש שכבות ישירות
    itcss_valid = has_master or (has_settings and has_tools and has_generic and has_elements and has_objects and has_components)
    
    if not itcss_valid:
        issues.append('ITCSS structure not found (neither master.css nor ITCSS layers)')
    if not bootstrap_before_itcss and itcss_match:
        issues.append('Bootstrap CSS should load before ITCSS')
    
    return {
        'passed': len(issues) == 0,
        'has_master': has_master,
        'has_itcss_layers': itcss_valid,
        'bootstrap_order': bootstrap_before_itcss if itcss_match else None,
        'issues': issues,
        'details': '; '.join(issues) if issues else f'ITCSS structure is correct ({"master.css" if has_master else "direct layers"})'
    }

def check_button_system(content):
    """בדיקת שימוש ב-ButtonSystem"""
    has_button_system = 'button-system-init.js' in content
    has_data_button_type = 'data-button-type' in content
    
    buttons_with_data_text = len(re.findall(r'data-button-type=["\'][^"\']+["\'][^>]*data-text=["\']', content))
    buttons_without_data_text = len(re.findall(r'data-button-type=["\'][^"\']+["\']', content)) - buttons_with_data_text
    
    return {
        'passed': has_button_system and has_data_button_type,
        'has_button_system': has_button_system,
        'has_data_button_type': has_data_button_type,
        'buttons_with_text': buttons_with_data_text,
        'buttons_without_text': buttons_without_data_text,
        'details': f'ButtonSystem: {has_button_system}, Buttons with data-text: {buttons_with_data_text}, Without: {buttons_without_data_text}'
    }

def check_form_structure(content):
    """בדיקת מבנה הטופס"""
    has_form = 'id="aiAnalysisSettingsForm"' in content
    has_save_button = 'id="saveAiAnalysisBtn"' in content
    has_validate_buttons = 'id="validateGeminiBtn"' in content and 'id="validatePerplexityBtn"' in content
    
    return {
        'passed': has_form and has_save_button and has_validate_buttons,
        'has_form': has_form,
        'has_save_button': has_save_button,
        'has_validate_buttons': has_validate_buttons,
        'details': f'Form: {has_form}, Save button: {has_save_button}, Validate buttons: {has_validate_buttons}'
    }

def check_data_collection_service(content):
    """בדיקת שימוש ב-DataCollectionService"""
    has_service = 'data-collection-service.js' in content
    uses_service = 'DataCollectionService' in content or 'data-collection-service' in content
    
    return {
        'passed': has_service and uses_service,
        'has_service': has_service,
        'uses_service': uses_service,
        'details': f'DataCollectionService script: {has_service}, Used: {uses_service}'
    }

def check_crud_response_handler(content):
    """בדיקת שימוש ב-CRUDResponseHandler"""
    has_handler = 'crud-response-handler.js' in content
    # בדיקה גם ב-JavaScript files
    uses_handler_in_html = 'CRUDResponseHandler' in content
    
    # בדיקה בקבצי JavaScript הרלוונטיים
    profile_script_path = PAGES_DIR / 'scripts' / 'user-profile.js'
    uses_handler_in_js = False
    if profile_script_path.exists():
        with open(profile_script_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
            uses_handler_in_js = 'CRUDResponseHandler' in js_content
    
    uses_handler = uses_handler_in_html or uses_handler_in_js
    
    return {
        'passed': has_handler and uses_handler,
        'has_handler': has_handler,
        'uses_handler': uses_handler,
        'uses_in_html': uses_handler_in_html,
        'uses_in_js': uses_handler_in_js,
        'details': f'CRUDResponseHandler script: {has_handler}, Used: {uses_handler} (HTML: {uses_handler_in_html}, JS: {uses_handler_in_js})'
    }

def run_comprehensive_test():
    """הרצת כל הבדיקות"""
    print(f"\n{'='*80}")
    print(f"🔍 בדיקות חוזקות מקיפות - עמוד פרופיל משתמש")
    print(f"{'='*80}\n")
    
    if not check_file_exists():
        print(f"❌ קובץ לא נמצא: {PAGE_PATH}")
        return None
    
    print(f"✅ קובץ נמצא: {PAGE_PATH}\n")
    
    with open(PAGE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    results = {
        'page': PAGE_NAME,
        'timestamp': datetime.now().isoformat(),
        'checks': {}
    }
    
    # ריצת כל הבדיקות
    print("📋 שלב 1: בדיקת Bootstrap CSS...")
    results['checks']['bootstrap_css'] = check_bootstrap_css(content)
    print(f"   {'✅' if results['checks']['bootstrap_css']['passed'] else '❌'} {results['checks']['bootstrap_css']['details']}")
    
    print("\n📋 שלב 2: בדיקת IconSystem...")
    results['checks']['icon_system'] = check_icon_system(content)
    print(f"   {'✅' if results['checks']['icon_system']['passed'] else '❌'} {results['checks']['icon_system']['details']}")
    
    print("\n📋 שלב 3: בדיקת סקריפטים קריטיים...")
    results['checks']['critical_scripts'] = check_critical_scripts(content)
    print(f"   {'✅' if results['checks']['critical_scripts']['passed'] else '❌'} {results['checks']['critical_scripts']['details']}")
    
    print("\n📋 שלב 4: בדיקת inline styles...")
    results['checks']['inline_styles'] = check_inline_styles(content)
    print(f"   {'✅' if results['checks']['inline_styles']['passed'] else '❌'} {results['checks']['inline_styles']['details']}")
    
    print("\n📋 שלב 5: בדיקת style tags...")
    results['checks']['style_tags'] = check_style_tags(content)
    print(f"   {'✅' if results['checks']['style_tags']['passed'] else '❌'} {results['checks']['style_tags']['details']}")
    
    print("\n📋 שלב 6: בדיקת console usage...")
    results['checks']['console_usage'] = check_console_usage(content)
    print(f"   {'✅' if results['checks']['console_usage']['passed'] else '❌'} {results['checks']['console_usage']['details']}")
    
    print("\n📋 שלב 7: בדיקת סדר טעינה...")
    results['checks']['load_order'] = check_load_order(content)
    print(f"   {'✅' if results['checks']['load_order']['passed'] else '❌'} {results['checks']['load_order']['details']}")
    
    print("\n📋 שלב 8: בדיקת מבנה ITCSS...")
    results['checks']['itcss'] = check_itcss_structure(content)
    print(f"   {'✅' if results['checks']['itcss']['passed'] else '❌'} {results['checks']['itcss']['details']}")
    
    print("\n📋 שלב 9: בדיקת ButtonSystem...")
    results['checks']['button_system'] = check_button_system(content)
    print(f"   {'✅' if results['checks']['button_system']['passed'] else '❌'} {results['checks']['button_system']['details']}")
    
    print("\n📋 שלב 10: בדיקת מבנה הטופס...")
    results['checks']['form_structure'] = check_form_structure(content)
    print(f"   {'✅' if results['checks']['form_structure']['passed'] else '❌'} {results['checks']['form_structure']['details']}")
    
    print("\n📋 שלב 11: בדיקת DataCollectionService...")
    results['checks']['data_collection'] = check_data_collection_service(content)
    print(f"   {'✅' if results['checks']['data_collection']['passed'] else '❌'} {results['checks']['data_collection']['details']}")
    
    print("\n📋 שלב 12: בדיקת CRUDResponseHandler...")
    results['checks']['crud_handler'] = check_crud_response_handler(content)
    print(f"   {'✅' if results['checks']['crud_handler']['passed'] else '❌'} {results['checks']['crud_handler']['details']}")
    
    # חישוב סיכום
    passed_checks = sum(1 for check in results['checks'].values() if check.get('passed', False))
    total_checks = len(results['checks'])
    
    results['summary'] = {
        'total_checks': total_checks,
        'passed_checks': passed_checks,
        'failed_checks': total_checks - passed_checks,
        'pass_rate': (passed_checks / total_checks * 100) if total_checks > 0 else 0
    }
    
    print(f"\n{'='*80}")
    print(f"📊 סיכום:")
    print(f"   ✅ בדיקות עברו: {passed_checks}/{total_checks}")
    print(f"   ❌ בדיקות נכשלו: {total_checks - passed_checks}/{total_checks}")
    print(f"   📈 אחוז הצלחה: {results['summary']['pass_rate']:.1f}%")
    print(f"{'='*80}\n")
    
    # יצירת דוח
    generate_report(results)
    
    return results

def generate_report(results):
    """יצירת דוח מפורט"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = REPORTS_DIR / f"USER_PROFILE_COMPREHENSIVE_TEST_{timestamp}.md"
    
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(f"# דוח בדיקות מקיפות - עמוד פרופיל משתמש\n\n")
        f.write(f"**תאריך:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"**עמוד:** {results['page']}\n\n")
        f.write(f"---\n\n")
        f.write(f"## סיכום\n\n")
        f.write(f"- ✅ בדיקות עברו: **{results['summary']['passed_checks']}/{results['summary']['total_checks']}**\n")
        f.write(f"- ❌ בדיקות נכשלו: **{results['summary']['failed_checks']}/{results['summary']['total_checks']}**\n")
        f.write(f"- 📈 אחוז הצלחה: **{results['summary']['pass_rate']:.1f}%**\n\n")
        f.write(f"---\n\n")
        f.write(f"## פירוט בדיקות\n\n")
        
        for check_name, check_result in results['checks'].items():
            status = "✅ עבר" if check_result.get('passed', False) else "❌ נכשל"
            f.write(f"### {check_name.replace('_', ' ').title()}\n\n")
            f.write(f"**סטטוס:** {status}\n\n")
            f.write(f"**פרטים:** {check_result.get('details', 'No details')}\n\n")
            
            # הוספת פרטים נוספים אם קיימים
            if 'missing' in check_result and check_result['missing']:
                f.write(f"**חסר:** {', '.join(check_result['missing'])}\n\n")
            if 'issues' in check_result and check_result['issues']:
                f.write(f"**בעיות:**\n")
                for issue in check_result['issues']:
                    f.write(f"- {issue}\n")
                f.write("\n")
            if 'count' in check_result:
                f.write(f"**כמות:** {check_result['count']}\n\n")
            
            f.write(f"---\n\n")
    
    print(f"📄 דוח נשמר: {report_path}")

if __name__ == '__main__':
    run_comprehensive_test()

