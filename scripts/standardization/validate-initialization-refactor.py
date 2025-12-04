#!/usr/bin/env python3
"""
בדיקת תקינות refactor של initialization - וידוא שכל העמודים עובדים נכון
"""

import os
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
MANIFEST_PATH = TRADING_UI / 'scripts' / 'init-system' / 'package-manifest.js'
CONFIG_PATH = TRADING_UI / 'scripts' / 'page-initialization-configs.js'
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

def validate_refactor():
    """בדיקת תקינות refactor"""
    
    html_files = list(TRADING_UI.glob('*.html'))
    html_files = [f for f in html_files if not any(x in str(f) for x in ['test', 'archive', 'backup', 'smart'])]
    
    results = {
        'total_files': len(html_files),
        'files': {},
        'issues': {
            'core_systems_manual': [],
            'unified_app_initializer': [],
            'missing_package_manifest': [],
            'missing_page_configs': [],
            'missing_unified_init': [],
            'dom_content_loaded': []
        }
    }
    
    # קריאת package-manifest
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest_content = f.read()
    
    # קריאת page-configs
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        config_content = f.read()
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            page_name = html_file.stem
            file_results = {
                'path': str(html_file.relative_to(PROJECT_ROOT)),
                'has_core_systems_manual': 'core-systems.js' in content,
                'has_unified_app_initializer': 'unified-app-initializer.js' in content,
                'has_package_manifest': 'package-manifest.js' in content,
                'has_page_configs': 'page-initialization-configs.js' in content,
                'has_dom_content_loaded': bool(re.search(r'DOMContentLoaded', content, re.IGNORECASE)),
                'has_unified_init_in_config': f"'{page_name}':" in config_content and 'init-system' in config_content[config_content.find(f"'{page_name}':"):config_content.find(f"'{page_name}':") + 2000] if f"'{page_name}':" in config_content else False
            }
            
            # בדיקת בעיות
            if file_results['has_core_systems_manual']:
                results['issues']['core_systems_manual'].append(page_name)
            if file_results['has_unified_app_initializer']:
                results['issues']['unified_app_initializer'].append(page_name)
            if not file_results['has_package_manifest']:
                results['issues']['missing_package_manifest'].append(page_name)
            if not file_results['has_page_configs']:
                results['issues']['missing_page_configs'].append(page_name)
            if file_results['has_dom_content_loaded']:
                results['issues']['dom_content_loaded'].append(page_name)
            
            results['files'][page_name] = file_results
            
        except Exception as e:
            print(f"❌ שגיאה בקריאת {html_file}: {e}")
    
    return results

def generate_report(results):
    """יצירת דוח"""
    
    report = []
    report.append("# דוח בדיקת תקינות Refactor - Initialization")
    report.append("## Initialization Refactor Validation Report\n")
    report.append(f"**תאריך יצירה:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report.append("---\n")
    
    report.append("## 📊 סיכום כללי\n\n")
    report.append(f"- **סה\"כ קבצי HTML:** {results['total_files']}\n")
    report.append(f"- **עמודים עם core-systems.js ידני:** {len(results['issues']['core_systems_manual'])}\n")
    report.append(f"- **עמודים עם unified-app-initializer.js:** {len(results['issues']['unified_app_initializer'])}\n")
    report.append(f"- **עמודים ללא package-manifest.js:** {len(results['issues']['missing_package_manifest'])}\n")
    report.append(f"- **עמודים ללא page-initialization-configs.js:** {len(results['issues']['missing_page_configs'])}\n")
    report.append(f"- **עמודים עם DOMContentLoaded:** {len(results['issues']['dom_content_loaded'])}\n")
    report.append("\n---\n")
    
    # בעיות
    report.append("## ⚠️ בעיות שנמצאו\n\n")
    
    if results['issues']['core_systems_manual']:
        report.append("### עמודים עם core-systems.js ידני (צריך להסיר):\n")
        for page in sorted(results['issues']['core_systems_manual']):
            report.append(f"- `{page}.html`\n")
        report.append("\n")
    
    if results['issues']['unified_app_initializer']:
        report.append("### עמודים עם unified-app-initializer.js (צריך להסיר):\n")
        for page in sorted(results['issues']['unified_app_initializer']):
            report.append(f"- `{page}.html`\n")
        report.append("\n")
    
    if results['issues']['missing_package_manifest']:
        report.append("### עמודים ללא package-manifest.js:\n")
        for page in sorted(results['issues']['missing_package_manifest']):
            report.append(f"- `{page}.html`\n")
        report.append("\n")
    
    if results['issues']['missing_page_configs']:
        report.append("### עמודים ללא page-initialization-configs.js:\n")
        for page in sorted(results['issues']['missing_page_configs']):
            report.append(f"- `{page}.html`\n")
        report.append("\n")
    
    if results['issues']['dom_content_loaded']:
        report.append("### עמודים עם DOMContentLoaded (צריך לבדוק):\n")
        for page in sorted(results['issues']['dom_content_loaded'])[:20]:  # רק 20 ראשונים
            report.append(f"- `{page}.html`\n")
        if len(results['issues']['dom_content_loaded']) > 20:
            report.append(f"- ... ועוד {len(results['issues']['dom_content_loaded']) - 20} עמודים\n")
        report.append("\n")
    
    # הצלחות
    report.append("---\n")
    report.append("## ✅ הצלחות\n\n")
    
    success_count = results['total_files'] - (
        len(results['issues']['core_systems_manual']) +
        len(results['issues']['unified_app_initializer']) +
        len(results['issues']['missing_package_manifest']) +
        len(results['issues']['missing_page_configs'])
    )
    
    report.append(f"- **עמודים תקינים:** {success_count} מתוך {results['total_files']}\n")
    report.append(f"- **אחוז הצלחה:** {(success_count / results['total_files'] * 100):.1f}%\n")
    report.append("\n")
    
    # שמירת דוח
    report_content = '\n'.join(report)
    report_path = DOCS_DIR / 'INIT_REFACTOR_VALIDATION.md'
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(f"✅ דוח נוצר: {report_path}")
    print(f"\n📊 סיכום:")
    print(f"  - סה\"כ קבצים: {results['total_files']}")
    print(f"  - עמודים תקינים: {success_count}")
    print(f"  - בעיות: {len(results['issues']['core_systems_manual']) + len(results['issues']['unified_app_initializer'])}")

if __name__ == '__main__':
    results = validate_refactor()
    generate_report(results)

