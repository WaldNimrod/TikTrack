#!/usr/bin/env python3
"""
סריקת HTML - זיהוי מצב נוכחי של איתחול
"""

import os
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

def scan_html_files():
    """סריקת כל קבצי HTML"""
    
    html_files = list(TRADING_UI.glob('*.html'))
    html_files = [f for f in html_files if not any(x in str(f) for x in ['test', 'archive', 'backup', 'smart'])]
    
    results = {
        'total_files': len(html_files),
        'files': {},
        'summary': {
            'core_systems_manual': 0,
            'unified_app_initializer': 0,
            'dom_content_loaded': 0,
            'initialize_application': 0,
            'initialize_unified_app': 0,
            'package_manifest': 0,
            'page_configs': 0,
            'unified_initializer': 0
        }
    }
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            page_name = html_file.stem
            file_results = {
                'path': str(html_file.relative_to(PROJECT_ROOT)),
                'has_core_systems_manual': 'core-systems.js' in content,
                'has_unified_app_initializer': 'unified-app-initializer.js' in content,
                'has_dom_content_loaded': 'DOMContentLoaded' in content,
                'has_initialize_application': 'initializeApplication' in content,
                'has_initialize_unified_app': 'initializeUnifiedApp' in content,
                'has_package_manifest': 'package-manifest.js' in content,
                'has_page_configs': 'page-initialization-configs.js' in content,
                'has_unified_initializer': 'unified-app-initializer.js' in content or 'core-systems.js' in content,
                'script_tags': len(re.findall(r'<script[^>]*>', content, re.IGNORECASE)),
                'inline_scripts': len(re.findall(r'<script[^>]*>.*?</script>', content, re.DOTALL | re.IGNORECASE))
            }
            
            # עדכון סיכום
            if file_results['has_core_systems_manual']:
                results['summary']['core_systems_manual'] += 1
            if file_results['has_unified_app_initializer']:
                results['summary']['unified_app_initializer'] += 1
            if file_results['has_dom_content_loaded']:
                results['summary']['dom_content_loaded'] += 1
            if file_results['has_initialize_application']:
                results['summary']['initialize_application'] += 1
            if file_results['has_initialize_unified_app']:
                results['summary']['initialize_unified_app'] += 1
            if file_results['has_package_manifest']:
                results['summary']['package_manifest'] += 1
            if file_results['has_page_configs']:
                results['summary']['page_configs'] += 1
            if file_results['has_unified_initializer']:
                results['summary']['unified_initializer'] += 1
            
            results['files'][page_name] = file_results
            
        except Exception as e:
            print(f"❌ שגיאה בקריאת {html_file}: {e}")
    
    return results

def generate_report(results):
    """יצירת דוח"""
    
    report = []
    report.append("# דוח סריקת HTML - מצב נוכחי לפני Refactor")
    report.append("## HTML Scan Before Initialization Refactor\n")
    report.append(f"**תאריך יצירה:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report.append("---\n")
    
    report.append("## 📊 סיכום כללי\n\n")
    report.append(f"- **סה\"כ קבצי HTML:** {results['total_files']}\n")
    report.append(f"- **עמודים עם core-systems.js ידני:** {results['summary']['core_systems_manual']}\n")
    report.append(f"- **עמודים עם unified-app-initializer.js:** {results['summary']['unified_app_initializer']}\n")
    report.append(f"- **עמודים עם DOMContentLoaded:** {results['summary']['dom_content_loaded']}\n")
    report.append(f"- **עמודים עם initializeApplication:** {results['summary']['initialize_application']}\n")
    report.append(f"- **עמודים עם initializeUnifiedApp:** {results['summary']['initialize_unified_app']}\n")
    report.append(f"- **עמודים עם package-manifest.js:** {results['summary']['package_manifest']}\n")
    report.append(f"- **עמודים עם page-initialization-configs.js:** {results['summary']['page_configs']}\n")
    report.append("\n---\n")
    
    # עמודים עם בעיות
    report.append("## ⚠️ עמודים עם בעיות\n\n")
    
    issues = {
        'has_unified_app_initializer': [],
        'has_core_systems_manual': [],
        'has_dom_content_loaded': [],
        'missing_package_manifest': [],
        'missing_page_configs': []
    }
    
    for page_name, file_data in results['files'].items():
        if file_data['has_unified_app_initializer']:
            issues['has_unified_app_initializer'].append(page_name)
        if file_data['has_core_systems_manual']:
            issues['has_core_systems_manual'].append(page_name)
        if file_data['has_dom_content_loaded']:
            issues['has_dom_content_loaded'].append(page_name)
        if not file_data['has_package_manifest']:
            issues['missing_package_manifest'].append(page_name)
        if not file_data['has_page_configs']:
            issues['missing_page_configs'].append(page_name)
    
    if issues['has_unified_app_initializer']:
        report.append("### עמודים עם unified-app-initializer.js (צריך להסיר):\n")
        for page in sorted(issues['has_unified_app_initializer']):
            report.append(f"- `{page}.html`\n")
        report.append("\n")
    
    if issues['has_core_systems_manual']:
        report.append("### עמודים עם core-systems.js ידני (צריך לבדוק):\n")
        for page in sorted(issues['has_core_systems_manual']):
            report.append(f"- `{page}.html`\n")
        report.append("\n")
    
    if issues['has_dom_content_loaded']:
        report.append("### עמודים עם DOMContentLoaded (צריך לבדוק):\n")
        for page in sorted(issues['has_dom_content_loaded']):
            report.append(f"- `{page}.html`\n")
        report.append("\n")
    
    if issues['missing_package_manifest']:
        report.append("### עמודים ללא package-manifest.js:\n")
        for page in sorted(issues['missing_package_manifest']):
            report.append(f"- `{page}.html`\n")
        report.append("\n")
    
    if issues['missing_page_configs']:
        report.append("### עמודים ללא page-initialization-configs.js:\n")
        for page in sorted(issues['missing_page_configs']):
            report.append(f"- `{page}.html`\n")
        report.append("\n")
    
    # רשימה מפורטת
    report.append("---\n")
    report.append("## 📋 רשימה מפורטת לכל עמוד\n\n")
    
    for page_name in sorted(results['files'].keys()):
        file_data = results['files'][page_name]
        report.append(f"### {page_name}\n\n")
        report.append(f"- **נתיב:** `{file_data['path']}`\n")
        report.append(f"- **מספר script tags:** {file_data['script_tags']}\n")
        report.append(f"- **מספר inline scripts:** {file_data['inline_scripts']}\n")
        report.append(f"- **core-systems.js ידני:** {'✅ כן' if file_data['has_core_systems_manual'] else '❌ לא'}\n")
        report.append(f"- **unified-app-initializer.js:** {'✅ כן' if file_data['has_unified_app_initializer'] else '❌ לא'}\n")
        report.append(f"- **DOMContentLoaded:** {'✅ כן' if file_data['has_dom_content_loaded'] else '❌ לא'}\n")
        report.append(f"- **initializeApplication:** {'✅ כן' if file_data['has_initialize_application'] else '❌ לא'}\n")
        report.append(f"- **initializeUnifiedApp:** {'✅ כן' if file_data['has_initialize_unified_app'] else '❌ לא'}\n")
        report.append(f"- **package-manifest.js:** {'✅ כן' if file_data['has_package_manifest'] else '❌ לא'}\n")
        report.append(f"- **page-initialization-configs.js:** {'✅ כן' if file_data['has_page_configs'] else '❌ לא'}\n")
        report.append("\n")
    
    # שמירת דוח
    report_content = '\n'.join(report)
    report_path = DOCS_DIR / 'HTML_SCAN_BEFORE_REFACTOR.md'
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(f"✅ דוח נוצר: {report_path}")
    print(f"\n📊 סיכום:")
    print(f"  - סה\"כ קבצים: {results['total_files']}")
    print(f"  - עם core-systems.js ידני: {results['summary']['core_systems_manual']}")
    print(f"  - עם unified-app-initializer.js: {results['summary']['unified_app_initializer']}")
    print(f"  - עם DOMContentLoaded: {results['summary']['dom_content_loaded']}")

if __name__ == '__main__':
    results = scan_html_files()
    generate_report(results)

