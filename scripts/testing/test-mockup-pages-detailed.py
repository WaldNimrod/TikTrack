#!/usr/bin/env python3
"""
בדיקות מפורטות פר עמוד מוקאפ - כל 5 השלבים
Detailed Mockup Pages Testing - All 5 Stages
"""

import os
import sys
import re
from pathlib import Path
from datetime import datetime

# Mockup pages to test
MOCKUP_PAGES = [
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

MOCKUPS_DIR = Path("trading-ui/mockups/daily-snapshots")
REPORTS_DIR = Path("documentation/05-REPORTS")

def check_stage1_browser_load(page_path):
    """שלב 1: בדיקת טעינה בדפדפן - בדיקת קובץ HTML"""
    results = {
        'status': 'pending',
        'errors': [],
        'warnings': [],
        'messages': []
    }
    
    try:
        if not page_path.exists():
            results['status'] = 'error'
            results['errors'].append(f"קובץ לא קיים: {page_path}")
            return results
        
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # בדוק שיש HTML בסיסי
        if '<html' not in content:
            results['status'] = 'error'
            results['errors'].append("אין תגית <html>")
        elif '<head' not in content:
            results['status'] = 'error'
            results['errors'].append("אין תגית <head>")
        elif '<body' not in content:
            results['status'] = 'error'
            results['errors'].append("אין תגית <body>")
        else:
            results['status'] = 'success'
            results['messages'].append("קובץ HTML תקין")
        
        # בדוק Bootstrap CSS
        if 'bootstrap.min.css' not in content.lower():
            results['warnings'].append("Bootstrap CSS לא נמצא")
        
        # בדוק master.css
        if 'master.css' not in content:
            results['warnings'].append("master.css לא נמצא")
        
    except Exception as e:
        results['status'] = 'error'
        results['errors'].append(f"שגיאה בקריאת הקובץ: {str(e)}")
    
    return results

def check_stage2_loading_code(page_path):
    """שלב 2: בדיקת קוד טעינה - בדיקת scripts ו-runtime validator"""
    results = {
        'status': 'pending',
        'errors': [],
        'warnings': [],
        'messages': []
    }
    
    try:
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # מצא כל scripts
        script_pattern = r'<script[^>]*src=["\']([^"\']+)["\'][^>]*>'
        scripts = re.findall(script_pattern, content)
        
        # בדוק scripts קריטיים
        critical_scripts = [
            'error-handlers.js',
            'api-config.js',
            'logger-service.js'
        ]
        
        found_critical = []
        for script_path in scripts:
            script_name = os.path.basename(script_path)
            for critical in critical_scripts:
                if critical in script_name:
                    found_critical.append(critical)
                    break
        
        if len(found_critical) < len(critical_scripts):
            missing = set(critical_scripts) - set(found_critical)
            results['warnings'].append(f"Scripts קריטיים חסרים: {', '.join(missing)}")
        
        # בדוק duplicate scripts
        script_counts = {}
        for script_path in scripts:
            script_name = os.path.basename(script_path)
            if script_name in script_counts:
                script_counts[script_name] += 1
            else:
                script_counts[script_name] = 1
        
        duplicates = {name: count for name, count in script_counts.items() if count > 1}
        if duplicates:
            results['errors'].append(f"Scripts כפולים: {', '.join(duplicates.keys())}")
        
        # בדוק versioning
        scripts_without_version = []
        for script_path in scripts:
            if '?' not in script_path and '&' not in script_path:
                if not script_path.startswith('http') and not script_path.startswith('//'):
                    scripts_without_version.append(os.path.basename(script_path))
        
        if scripts_without_version:
            results['warnings'].append(f"{len(scripts_without_version)} scripts ללא versioning")
        
        if not results['errors']:
            results['status'] = 'success' if not results['warnings'] else 'warning'
            results['messages'].append(f"נמצאו {len(scripts)} scripts")
        
    except Exception as e:
        results['status'] = 'error'
        results['errors'].append(f"שגיאה בבדיקת scripts: {str(e)}")
    
    return results

def check_stage3_itcss(page_path):
    """שלב 3: בדיקת ITCSS compliance"""
    results = {
        'status': 'pending',
        'errors': [],
        'warnings': [],
        'messages': []
    }
    
    try:
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # בדוק inline styles
        inline_style_pattern = r'style=["\'][^"\']*["\']'
        inline_styles = re.findall(inline_style_pattern, content)
        
        if inline_styles:
            results['errors'].append(f"נמצאו {len(inline_styles)} inline styles (אסור לפי ITCSS)")
        
        # בדוק <style> tags
        style_tag_pattern = r'<style[^>]*>.*?</style>'
        style_tags = re.findall(style_tag_pattern, content, re.DOTALL)
        
        if style_tags:
            # בדוק אם זה dynamic styles (מותר)
            dynamic_styles = [tag for tag in style_tags if 'dynamic' in tag.lower() or 'generated' in tag.lower()]
            if len(style_tags) > len(dynamic_styles):
                results['errors'].append(f"נמצאו {len(style_tags) - len(dynamic_styles)} style tags (אסור לפי ITCSS)")
        
        # בדוק Bootstrap לפני master.css
        bootstrap_match = re.search(r'bootstrap.*\.css', content, re.IGNORECASE)
        master_css_match = re.search(r'master\.css', content)
        
        if bootstrap_match and master_css_match:
            if bootstrap_match.start() > master_css_match.start():
                results['warnings'].append("Bootstrap CSS צריך להיות לפני master.css")
        
        if not results['errors']:
            results['status'] = 'success' if not results['warnings'] else 'warning'
            results['messages'].append("תאימות ITCSS תקינה")
        
    except Exception as e:
        results['status'] = 'error'
        results['errors'].append(f"שגיאה בבדיקת ITCSS: {str(e)}")
    
    return results

def check_stage4_console(page_path):
    """שלב 4: בדיקת קונסולה נקייה - בדיקת console.* calls"""
    results = {
        'status': 'pending',
        'errors': [],
        'warnings': [],
        'messages': []
    }
    
    try:
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # מצא console.* calls
        console_pattern = r'console\.(log|error|warn|info|debug)\s*\('
        console_calls = re.findall(console_pattern, content)
        
        if console_calls:
            console_counts = {}
            for call in console_calls:
                if call in console_counts:
                    console_counts[call] += 1
                else:
                    console_counts[call] = 1
            
            results['warnings'].append(f"נמצאו קריאות console.*: {dict(console_counts)}")
            results['messages'].append("יש להחליף ב-Logger Service")
        else:
            results['status'] = 'success'
            results['messages'].append("אין קריאות console.* (נקי)")
        
    except Exception as e:
        results['status'] = 'error'
        results['errors'].append(f"שגיאה בבדיקת console: {str(e)}")
    
    return results

def check_stage5_crud_e2e(page_path):
    """שלב 5: בדיקת CRUD+E2E - לא רלוונטי לעמודי מוקאפ"""
    results = {
        'status': 'skipped',
        'messages': ['עמודי מוקאפ הם עמודי צפייה - אין פעולות CRUD']
    }
    return results

def test_page(page_name):
    """בדיקה מפורטת של עמוד אחד - כל 5 השלבים"""
    page_path = MOCKUPS_DIR / page_name
    
    print(f"\n{'='*60}")
    print(f"🔍 בדיקת עמוד: {page_name}")
    print(f"{'='*60}\n")
    
    results = {
        'pageName': page_name,
        'timestamp': datetime.now().isoformat(),
        'stages': {}
    }
    
    # שלב 1: בדיקת טעינה בדפדפן
    print("📋 שלב 1: בדיקת טעינה בדפדפן...")
    stage1 = check_stage1_browser_load(page_path)
    results['stages']['stage1_browser_load'] = stage1
    print(f"   סטטוס: {stage1['status']}")
    if stage1['errors']:
        print(f"   שגיאות: {len(stage1['errors'])}")
    if stage1['warnings']:
        print(f"   אזהרות: {len(stage1['warnings'])}")
    
    # שלב 2: בדיקת קוד טעינה
    print("\n📋 שלב 2: בדיקת קוד טעינה...")
    stage2 = check_stage2_loading_code(page_path)
    results['stages']['stage2_loading_code'] = stage2
    print(f"   סטטוס: {stage2['status']}")
    if stage2['errors']:
        print(f"   שגיאות: {len(stage2['errors'])}")
    if stage2['warnings']:
        print(f"   אזהרות: {len(stage2['warnings'])}")
    
    # שלב 3: בדיקת ITCSS
    print("\n📋 שלב 3: בדיקת ITCSS compliance...")
    stage3 = check_stage3_itcss(page_path)
    results['stages']['stage3_itcss'] = stage3
    print(f"   סטטוס: {stage3['status']}")
    if stage3['errors']:
        print(f"   שגיאות: {len(stage3['errors'])}")
    if stage3['warnings']:
        print(f"   אזהרות: {len(stage3['warnings'])}")
    
    # שלב 4: בדיקת קונסולה
    print("\n📋 שלב 4: בדיקת קונסולה נקייה...")
    stage4 = check_stage4_console(page_path)
    results['stages']['stage4_console'] = stage4
    print(f"   סטטוס: {stage4['status']}")
    if stage4['warnings']:
        print(f"   אזהרות: {len(stage4['warnings'])}")
    
    # שלב 5: בדיקת CRUD+E2E
    print("\n📋 שלב 5: בדיקת CRUD+E2E...")
    stage5 = check_stage5_crud_e2e(page_path)
    results['stages']['stage5_crud_e2e'] = stage5
    print(f"   סטטוס: {stage5['status']}")
    
    # סטטוס כללי
    all_stages = [stage1, stage2, stage3, stage4]
    has_errors = any(s['status'] == 'error' for s in all_stages)
    has_warnings = any(s['status'] == 'warning' for s in all_stages)
    
    if has_errors:
        results['overallStatus'] = 'error'
    elif has_warnings:
        results['overallStatus'] = 'warning'
    else:
        results['overallStatus'] = 'success'
    
    print(f"\n✅ סטטוס כללי: {results['overallStatus']}")
    
    return results

def generate_report(all_results):
    """יצירת דוח מסכם"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = REPORTS_DIR / f"MOCKUPS_DETAILED_TEST_REPORT_{timestamp}.md"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# דוח בדיקות מפורטות - עמודי מוקאפ\n\n")
        f.write(f"**תאריך:** {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n\n")
        f.write("## סיכום כללי\n\n")
        
        total = len(all_results)
        success = sum(1 for r in all_results if r['overallStatus'] == 'success')
        warning = sum(1 for r in all_results if r['overallStatus'] == 'warning')
        error = sum(1 for r in all_results if r['overallStatus'] == 'error')
        
        f.write(f"- **סה\"כ עמודים:** {total}\n")
        f.write(f"- **✅ הצלחה מלאה:** {success}\n")
        f.write(f"- **⚠️ אזהרות:** {warning}\n")
        f.write(f"- **❌ שגיאות:** {error}\n\n")
        
        f.write("---\n\n")
        
        for result in all_results:
            f.write(f"## {result['pageName']}\n\n")
            f.write(f"**סטטוס כללי:** {result['overallStatus']}\n\n")
            
            for stage_name, stage_result in result['stages'].items():
                stage_num = stage_name.split('_')[0].replace('stage', '')
                f.write(f"### שלב {stage_num}: {stage_name.replace('_', ' ').title()}\n\n")
                f.write(f"**סטטוס:** {stage_result['status']}\n\n")
                
                if stage_result.get('errors'):
                    f.write("**שגיאות:**\n")
                    for error in stage_result['errors']:
                        f.write(f"- ❌ {error}\n")
                    f.write("\n")
                
                if stage_result.get('warnings'):
                    f.write("**אזהרות:**\n")
                    for warning in stage_result['warnings']:
                        f.write(f"- ⚠️ {warning}\n")
                    f.write("\n")
                
                if stage_result.get('messages'):
                    for msg in stage_result['messages']:
                        f.write(f"- {msg}\n")
                    f.write("\n")
            
            f.write("---\n\n")
    
    print(f"\n✅ דוח נוצר: {report_path}")
    return report_path

def main():
    print("🚀 התחלת בדיקות מפורטות של עמודי מוקאפ\n")
    
    all_results = []
    
    for page_name in MOCKUP_PAGES:
        try:
            result = test_page(page_name)
            all_results.append(result)
        except Exception as e:
            print(f"❌ שגיאה בבדיקת {page_name}: {str(e)}")
            all_results.append({
                'pageName': page_name,
                'overallStatus': 'error',
                'error': str(e)
            })
    
    # יצירת דוח
    report_path = generate_report(all_results)
    
    print(f"\n✅ סיום בדיקות - {len(all_results)} עמודים נבדקו")
    print(f"📊 דוח: {report_path}")

if __name__ == "__main__":
    main()

