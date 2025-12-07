#!/usr/bin/env python3
"""
סריקת קוד מקומי - זיהוי כל מערכות האיתחול
"""

import os
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
SCRIPTS_DIR = TRADING_UI / 'scripts'
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

def scan_js_files():
    """סריקת כל קבצי JS"""
    
    js_files = list(SCRIPTS_DIR.rglob('*.js'))
    js_files = [f for f in js_files if not any(x in str(f) for x in ['test', 'archive', 'backup', 'node_modules', '.backup'])]
    
    results = {
        'total_files': len(js_files),
        'files': {},
        'summary': {
            'initialize_application': 0,
            'initialize_unified_app': 0,
            'dom_content_loaded': 0,
            'window_onload': 0,
            'unified_app_initializer': 0,
            'application_initializer': 0
        },
        'patterns': defaultdict(list)
    }
    
    for js_file in js_files:
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            file_path = str(js_file.relative_to(PROJECT_ROOT))
            file_results = {
                'path': file_path,
                'initialize_application': len(re.findall(r'initializeApplication', content)),
                'initialize_unified_app': len(re.findall(r'initializeUnifiedApp', content)),
                'dom_content_loaded': len(re.findall(r'DOMContentLoaded', content, re.IGNORECASE)),
                'window_onload': len(re.findall(r'window\.onload|window\.addEventListener\s*\(\s*[\'"]load', content)),
                'unified_app_initializer': len(re.findall(r'unifiedAppInitializer|UnifiedAppInitializer', content)),
                'application_initializer': len(re.findall(r'ApplicationInitializer|applicationInitializer', content)),
                'has_init_function': bool(re.search(r'function\s+initialize\w*|const\s+initialize\w*\s*=', content)),
                'lines': len(content.split('\n'))
            }
            
            # עדכון סיכום
            if file_results['initialize_application'] > 0:
                results['summary']['initialize_application'] += 1
                results['patterns']['initialize_application'].append(file_path)
            if file_results['initialize_unified_app'] > 0:
                results['summary']['initialize_unified_app'] += 1
                results['patterns']['initialize_unified_app'].append(file_path)
            if file_results['dom_content_loaded'] > 0:
                results['summary']['dom_content_loaded'] += 1
                results['patterns']['dom_content_loaded'].append(file_path)
            if file_results['window_onload'] > 0:
                results['summary']['window_onload'] += 1
                results['patterns']['window_onload'].append(file_path)
            if file_results['unified_app_initializer'] > 0:
                results['summary']['unified_app_initializer'] += 1
            if file_results['application_initializer'] > 0:
                results['summary']['application_initializer'] += 1
            
            # רק קבצים עם בעיות
            if any([
                file_results['initialize_application'] > 0,
                file_results['dom_content_loaded'] > 0,
                file_results['window_onload'] > 0,
                file_results['application_initializer'] > 0
            ]):
                results['files'][file_path] = file_results
            
        except Exception as e:
            print(f"❌ שגיאה בקריאת {js_file}: {e}")
    
    return results

def generate_report(results):
    """יצירת דוח"""
    
    report = []
    report.append("# דוח מערכות איתחול - מצב נוכחי")
    report.append("## Initialization Systems Inventory\n")
    report.append(f"**תאריך יצירה:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report.append("---\n")
    
    report.append("## 📊 סיכום כללי\n\n")
    report.append(f"- **סה\"כ קבצי JS:** {results['total_files']}\n")
    report.append(f"- **קבצים עם initializeApplication:** {results['summary']['initialize_application']}\n")
    report.append(f"- **קבצים עם initializeUnifiedApp:** {results['summary']['initialize_unified_app']}\n")
    report.append(f"- **קבצים עם DOMContentLoaded:** {results['summary']['dom_content_loaded']}\n")
    report.append(f"- **קבצים עם window.onload:** {results['summary']['window_onload']}\n")
    report.append(f"- **קבצים עם UnifiedAppInitializer:** {results['summary']['unified_app_initializer']}\n")
    report.append(f"- **קבצים עם ApplicationInitializer:** {results['summary']['application_initializer']}\n")
    report.append("\n---\n")
    
    # דפוסים
    report.append("## 🔍 דפוסים מזוהים\n\n")
    
    for pattern, files in results['patterns'].items():
        if files:
            report.append(f"### {pattern}\n\n")
            report.append(f"**מספר קבצים:** {len(files)}\n\n")
            report.append("**קבצים:**\n")
            for file_path in sorted(files)[:20]:  # רק 20 ראשונים
                report.append(f"- `{file_path}`\n")
            if len(files) > 20:
                report.append(f"- ... ועוד {len(files) - 20} קבצים\n")
            report.append("\n")
    
    # קבצים עם בעיות
    report.append("---\n")
    report.append("## ⚠️ קבצים עם בעיות (צריך לבדוק)\n\n")
    
    problem_files = []
    for file_path, file_data in results['files'].items():
        issues = []
        if file_data['initialize_application'] > 0:
            issues.append(f"initializeApplication ({file_data['initialize_application']} מופעים)")
        if file_data['dom_content_loaded'] > 0:
            issues.append(f"DOMContentLoaded ({file_data['dom_content_loaded']} מופעים)")
        if file_data['window_onload'] > 0:
            issues.append(f"window.onload ({file_data['window_onload']} מופעים)")
        if file_data['application_initializer'] > 0:
            issues.append(f"ApplicationInitializer ({file_data['application_initializer']} מופעים)")
        
        if issues:
            problem_files.append({
                'path': file_path,
                'issues': issues,
                'lines': file_data['lines']
            })
    
    if problem_files:
        for file_info in sorted(problem_files, key=lambda x: x['path']):
            report.append(f"### `{file_info['path']}`\n\n")
            report.append(f"- **שורות:** {file_info['lines']}\n")
            report.append(f"- **בעיות:** {', '.join(file_info['issues'])}\n")
            report.append("\n")
    else:
        report.append("✅ לא נמצאו קבצים עם בעיות\n\n")
    
    # המלצות
    report.append("---\n")
    report.append("## 💡 המלצות\n\n")
    report.append("### 1. המרת initializeApplication\n")
    report.append("- כל `initializeApplication` צריך להיות מומר ל-`initializeUnifiedApp`\n")
    report.append("- או להשתמש ב-`UnifiedAppInitializer.initialize()` ישירות\n\n")
    
    report.append("### 2. הסרת DOMContentLoaded מקומיים\n")
    report.append("- כל `DOMContentLoaded` listeners מקומיים צריכים להיות מוסרים\n")
    report.append("- רק `core-systems.js` צריך להכיל `DOMContentLoaded` listener\n\n")
    
    report.append("### 3. הסרת window.onload\n")
    report.append("- כל `window.onload` handlers צריכים להיות מוסרים\n")
    report.append("- להשתמש ב-`UnifiedAppInitializer` במקום\n\n")
    
    report.append("### 4. ארכוב ApplicationInitializer\n")
    report.append("- `ApplicationInitializer` הוא מערכת ישנה\n")
    report.append("- צריך להיות מועבר לארכיון\n\n")
    
    # שמירת דוח
    report_content = '\n'.join(report)
    report_path = DOCS_DIR / 'INIT_SYSTEMS_INVENTORY.md'
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(f"✅ דוח נוצר: {report_path}")
    print(f"\n📊 סיכום:")
    print(f"  - סה\"כ קבצים: {results['total_files']}")
    print(f"  - קבצים עם בעיות: {len(results['files'])}")
    print(f"  - initializeApplication: {results['summary']['initialize_application']}")
    print(f"  - DOMContentLoaded: {results['summary']['dom_content_loaded']}")

if __name__ == '__main__':
    results = scan_js_files()
    generate_report(results)

