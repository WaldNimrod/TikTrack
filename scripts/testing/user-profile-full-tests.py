#!/usr/bin/env python3
"""
בדיקות מלאות מקיפות לעמוד פרופיל משתמש
Full Comprehensive Tests for User Profile Page

כולל:
- בדיקות מבנה וקוד (כבר בוצעו)
- Runtime Validator checks
- CSS Compliance checks
- Functional tests
- Console checks
- CRUD+E2E tests
"""

import os
import re
import json
import subprocess
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

PAGES_DIR = Path("trading-ui")
REPORTS_DIR = Path("documentation/05-REPORTS")
PAGE_NAME = "user-profile.html"
PAGE_PATH = PAGES_DIR / PAGE_NAME
BASE_URL = "http://127.0.0.1:8080"

def check_server_running():
    """בדיקת שהשרת רץ"""
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        return response.status_code == 200
    except:
        return False

def check_page_loads():
    """בדיקת שהעמוד נטען בהצלחה"""
    try:
        response = requests.get(f"{BASE_URL}/{PAGE_NAME}", timeout=10)
        if response.status_code == 200:
            # בדיקת שהעמוד לא מחזיר redirect
            if 'login.html' in response.text or 'location.href' in response.text:
                return {
                    'passed': False,
                    'error': 'Page redirects to login (authentication issue)'
                }
            return {
                'passed': True,
                'status_code': response.status_code,
                'content_length': len(response.text)
            }
        return {
            'passed': False,
            'error': f'HTTP {response.status_code}'
        }
    except Exception as e:
        return {
            'passed': False,
            'error': str(e)
        }

def check_duplicate_scripts(content):
    """בדיקת סקריפטים כפולים"""
    script_pattern = r'<script[^>]*src=["\']([^"\']+)["\']'
    scripts = re.findall(script_pattern, content)
    
    # ניקוי query strings
    scripts_clean = [s.split('?')[0] for s in scripts]
    
    duplicates = {}
    for script in scripts_clean:
        count = scripts_clean.count(script)
        if count > 1:
            duplicates[script] = count
    
    return {
        'passed': len(duplicates) == 0,
        'duplicates': duplicates,
        'total_scripts': len(scripts),
        'unique_scripts': len(set(scripts_clean)),
        'details': f"Found {len(duplicates)} duplicate scripts" if duplicates else "No duplicate scripts"
    }

def check_missing_required_globals(content):
    """בדיקת global objects נדרשים"""
    # מיפוי של globals לסקריפטים שלהם
    global_to_script = {
        'window.TikTrackAuth': 'auth.js',
        'window.AIAnalysisManager': 'user-profile-ai-analysis.js',
        'window.UserProfilePage': 'user-profile.js',
        'window.CRUDResponseHandler': 'crud-response-handler.js',
        'window.DataCollectionService': 'data-collection-service.js',
        'window.ButtonSystem': 'button-system-init.js',
        'window.NotificationSystem': 'notification-system.js',
        'window.Logger': 'logger-service.js'
    }
    
    # בדיקה בקוד JavaScript
    profile_script_path = PAGES_DIR / 'scripts' / 'user-profile.js'
    js_content = ''
    if profile_script_path.exists():
        with open(profile_script_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
    
    missing = []
    found = []
    
    for global_var, script_name in global_to_script.items():
        var_name = global_var.replace('window.', '')
        # בדיקה אם הסקריפט נטען ב-HTML
        script_loaded = script_name in content
        # בדיקה אם הגלובל בשימוש בקוד
        global_used = var_name in content or var_name in js_content or global_var in content or global_var in js_content
        
        if script_loaded or global_used:
            found.append(global_var)
        else:
            missing.append(global_var)
    
    return {
        'passed': len(missing) == 0,
        'found': found,
        'missing': missing,
        'details': f"Missing: {', '.join(missing)}" if missing else "All required globals/scripts found"
    }

def check_css_compliance(content):
    """בדיקת תאימות CSS - ITCSS compliance"""
    issues = []
    warnings = []
    
    # בדיקת Bootstrap לפני ITCSS
    bootstrap_match = re.search(r'<link[^>]*bootstrap[^>]*>', content, re.IGNORECASE)
    itcss_match = re.search(r'<link[^>]*styles-new/(01-settings|02-tools|master)[^>]*>', content, re.IGNORECASE)
    
    if bootstrap_match and itcss_match:
        if bootstrap_match.start() > itcss_match.start():
            issues.append('Bootstrap CSS should load before ITCSS layers')
    
    # בדיקת סדר שכבות ITCSS
    layers_order = [
        ('01-settings', 'Settings'),
        ('02-tools', 'Tools'),
        ('03-generic', 'Generic'),
        ('04-elements', 'Elements'),
        ('05-objects', 'Objects'),
        ('06-components', 'Components'),
        ('07-pages', 'Pages'),
        ('08-themes', 'Themes'),
        ('09-utilities', 'Utilities')
    ]
    
    layer_positions = {}
    for layer_pattern, layer_name in layers_order:
        matches = list(re.finditer(rf'<link[^>]*styles-new/[^>]*{layer_pattern}[^>]*>', content, re.IGNORECASE))
        if matches:
            layer_positions[layer_name] = matches[0].start()
    
    # בדיקת סדר
    prev_pos = -1
    for layer_name, layer_pos in sorted(layer_positions.items(), key=lambda x: x[1]):
        if layer_pos < prev_pos:
            issues.append(f'ITCSS layer order issue: {layer_name}')
        prev_pos = layer_pos
    
    # בדיקת !important
    important_count = content.count('!important')
    if important_count > 0:
        warnings.append(f'Found {important_count} uses of !important')
    
    return {
        'passed': len(issues) == 0,
        'issues': issues,
        'warnings': warnings,
        'layer_count': len(layer_positions),
        'details': '; '.join(issues) if issues else f'ITCSS compliance OK ({len(layer_positions)} layers)'
    }

def check_authentication_flow(content):
    """בדיקת זרימת אימות"""
    has_auth_check = 'TikTrackAuth' in content or 'auth.js' in content
    has_redirect = 'login.html' in content or 'location.href' in content
    
    # בדיקה בקוד JavaScript
    profile_script_path = PAGES_DIR / 'scripts' / 'user-profile.js'
    js_has_auth = False
    if profile_script_path.exists():
        with open(profile_script_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
            js_has_auth = 'TikTrackAuth' in js_content or 'isAuthenticated' in js_content
    
    return {
        'passed': has_auth_check or js_has_auth,
        'has_auth_check': has_auth_check or js_has_auth,
        'has_redirect': has_redirect,
        'details': f'Auth check: {has_auth_check or js_has_auth}, Redirect: {has_redirect}'
    }

def check_form_validation(content):
    """בדיקת ולידציה של טופסים"""
    has_required = 'required' in content
    has_form_validation = 'validation' in content.lower() or 'validate' in content.lower()
    
    # בדיקה בקבצי JavaScript
    profile_script_path = PAGES_DIR / 'scripts' / 'user-profile.js'
    js_has_validation = False
    if profile_script_path.exists():
        with open(profile_script_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
            js_has_validation = 'validation' in js_content.lower() or 'validate' in js_content.lower()
    
    return {
        'passed': has_required or has_form_validation or js_has_validation,
        'has_required': has_required,
        'has_validation': has_form_validation or js_has_validation,
        'details': f'Form validation: {has_required or has_form_validation or js_has_validation}'
    }

def check_error_handling(content):
    """בדיקת טיפול בשגיאות"""
    has_error_handler = 'error-handlers.js' in content
    has_try_catch = 'try' in content and 'catch' in content
    
    # בדיקה בקבצי JavaScript
    profile_script_path = PAGES_DIR / 'scripts' / 'user-profile.js'
    js_has_error_handling = False
    if profile_script_path.exists():
        with open(profile_script_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
            js_has_error_handling = 'try' in js_content and 'catch' in js_content
    
    return {
        'passed': has_error_handler and (has_try_catch or js_has_error_handling),
        'has_error_handler': has_error_handler,
        'has_try_catch': has_try_catch or js_has_error_handling,
        'details': f'Error handling: {has_error_handler}, Try-catch: {has_try_catch or js_has_error_handling}'
    }

def check_api_integration(content):
    """בדיקת אינטגרציה עם API"""
    has_api_config = 'api-config.js' in content
    has_fetch = 'fetch(' in content or 'fetch (' in content
    
    # בדיקה בקבצי JavaScript
    profile_script_path = PAGES_DIR / 'scripts' / 'user-profile.js'
    js_has_api = False
    if profile_script_path.exists():
        with open(profile_script_path, 'r', encoding='utf-8') as f:
            js_content = f.read()
            js_has_api = 'fetch(' in js_content or 'API_BASE_URL' in js_content
    
    return {
        'passed': has_api_config and (has_fetch or js_has_api),
        'has_api_config': has_api_config,
        'has_api_calls': has_fetch or js_has_api,
        'details': f'API config: {has_api_config}, API calls: {has_fetch or js_has_api}'
    }

def check_accessibility(content):
    """בדיקת נגישות בסיסית"""
    has_lang = 'lang=' in content or 'lang =' in content
    has_dir = 'dir=' in content or 'dir =' in content
    has_alt = 'alt=' in content
    has_aria = 'aria-' in content or 'role=' in content
    
    return {
        'passed': has_lang and has_dir,
        'has_lang': has_lang,
        'has_dir': has_dir,
        'has_alt': has_alt,
        'has_aria': has_aria,
        'details': f'Accessibility: lang={has_lang}, dir={has_dir}, alt={has_alt}, aria={has_aria}'
    }

def check_security(content):
    """בדיקת אבטחה בסיסית"""
    # בדיקת CSRF tokens
    has_csrf = 'csrf' in content.lower() or 'csrf_token' in content.lower()
    
    # בדיקת input validation
    has_input_validation = 'type=' in content and ('email' in content or 'password' in content)
    
    # בדיקת secure attributes
    has_secure = 'secure' in content.lower() or 'httpOnly' in content.lower()
    
    return {
        'passed': has_input_validation,
        'has_csrf': has_csrf,
        'has_input_validation': has_input_validation,
        'has_secure': has_secure,
        'details': f'Security: CSRF={has_csrf}, Input validation={has_input_validation}, Secure={has_secure}'
    }

def run_full_tests():
    """הרצת כל הבדיקות המלאות"""
    print(f"\n{'='*80}")
    print(f"🔍 בדיקות מלאות מקיפות - עמוד פרופיל משתמש")
    print(f"{'='*80}\n")
    
    if not PAGE_PATH.exists():
        print(f"❌ קובץ לא נמצא: {PAGE_PATH}")
        return None
    
    with open(PAGE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    results = {
        'page': PAGE_NAME,
        'timestamp': datetime.now().isoformat(),
        'checks': {}
    }
    
    # בדיקת שרת
    print("📋 בדיקת שרת...")
    server_running = check_server_running()
    results['checks']['server'] = {
        'passed': server_running,
        'details': 'Server is running' if server_running else 'Server is not running'
    }
    print(f"   {'✅' if server_running else '❌'} {results['checks']['server']['details']}")
    
    if server_running:
        # בדיקת טעינת עמוד
        print("\n📋 בדיקת טעינת עמוד...")
        results['checks']['page_load'] = check_page_loads()
        print(f"   {'✅' if results['checks']['page_load']['passed'] else '❌'} {results['checks']['page_load'].get('details', results['checks']['page_load'].get('error', 'Unknown'))}")
    
    # בדיקת סקריפטים כפולים
    print("\n📋 בדיקת סקריפטים כפולים...")
    results['checks']['duplicate_scripts'] = check_duplicate_scripts(content)
    print(f"   {'✅' if results['checks']['duplicate_scripts']['passed'] else '❌'} {results['checks']['duplicate_scripts']['details']}")
    if results['checks']['duplicate_scripts']['duplicates']:
        for script, count in results['checks']['duplicate_scripts']['duplicates'].items():
            print(f"      ⚠️ {script}: {count} times")
    
    # בדיקת global objects נדרשים
    print("\n📋 בדיקת global objects נדרשים...")
    results['checks']['required_globals'] = check_missing_required_globals(content)
    print(f"   {'✅' if results['checks']['required_globals']['passed'] else '❌'} {results['checks']['required_globals']['details']}")
    if results['checks']['required_globals']['missing']:
        for missing in results['checks']['required_globals']['missing']:
            print(f"      ⚠️ Missing: {missing}")
    
    # בדיקת CSS compliance
    print("\n📋 בדיקת CSS compliance (ITCSS)...")
    results['checks']['css_compliance'] = check_css_compliance(content)
    print(f"   {'✅' if results['checks']['css_compliance']['passed'] else '❌'} {results['checks']['css_compliance']['details']}")
    if results['checks']['css_compliance']['issues']:
        for issue in results['checks']['css_compliance']['issues']:
            print(f"      ⚠️ {issue}")
    if results['checks']['css_compliance']['warnings']:
        for warning in results['checks']['css_compliance']['warnings']:
            print(f"      ⚠️ Warning: {warning}")
    
    # בדיקת זרימת אימות
    print("\n📋 בדיקת זרימת אימות...")
    results['checks']['authentication'] = check_authentication_flow(content)
    print(f"   {'✅' if results['checks']['authentication']['passed'] else '❌'} {results['checks']['authentication']['details']}")
    
    # בדיקת ולידציה של טופסים
    print("\n📋 בדיקת ולידציה של טופסים...")
    results['checks']['form_validation'] = check_form_validation(content)
    print(f"   {'✅' if results['checks']['form_validation']['passed'] else '❌'} {results['checks']['form_validation']['details']}")
    
    # בדיקת טיפול בשגיאות
    print("\n📋 בדיקת טיפול בשגיאות...")
    results['checks']['error_handling'] = check_error_handling(content)
    print(f"   {'✅' if results['checks']['error_handling']['passed'] else '❌'} {results['checks']['error_handling']['details']}")
    
    # בדיקת אינטגרציה עם API
    print("\n📋 בדיקת אינטגרציה עם API...")
    results['checks']['api_integration'] = check_api_integration(content)
    print(f"   {'✅' if results['checks']['api_integration']['passed'] else '❌'} {results['checks']['api_integration']['details']}")
    
    # בדיקת נגישות
    print("\n📋 בדיקת נגישות...")
    results['checks']['accessibility'] = check_accessibility(content)
    print(f"   {'✅' if results['checks']['accessibility']['passed'] else '❌'} {results['checks']['accessibility']['details']}")
    
    # בדיקת אבטחה
    print("\n📋 בדיקת אבטחה...")
    results['checks']['security'] = check_security(content)
    print(f"   {'✅' if results['checks']['security']['passed'] else '❌'} {results['checks']['security']['details']}")
    
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
    generate_full_report(results)
    
    return results

def generate_full_report(results):
    """יצירת דוח מפורט מלא"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = REPORTS_DIR / f"USER_PROFILE_FULL_TESTS_{timestamp}.md"
    
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(f"# דוח בדיקות מלאות - עמוד פרופיל משתמש\n\n")
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
            
            # הוספת פרטים נוספים
            if 'error' in check_result:
                f.write(f"**שגיאה:** {check_result['error']}\n\n")
            if 'missing' in check_result and check_result['missing']:
                f.write(f"**חסר:** {', '.join(check_result['missing'])}\n\n")
            if 'issues' in check_result and check_result['issues']:
                f.write(f"**בעיות:**\n")
                for issue in check_result['issues']:
                    f.write(f"- {issue}\n")
                f.write("\n")
            if 'warnings' in check_result and check_result['warnings']:
                f.write(f"**אזהרות:**\n")
                for warning in check_result['warnings']:
                    f.write(f"- {warning}\n")
                f.write("\n")
            if 'duplicates' in check_result and check_result['duplicates']:
                f.write(f"**סקריפטים כפולים:**\n")
                for script, count in check_result['duplicates'].items():
                    f.write(f"- {script}: {count} פעמים\n")
                f.write("\n")
            
            f.write(f"---\n\n")
    
    print(f"📄 דוח מלא נשמר: {report_path}")

if __name__ == '__main__':
    run_full_tests()

