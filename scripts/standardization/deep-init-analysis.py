#!/usr/bin/env python3
"""
ניתוח מעמיק של ארכיטקטורת אתחול
"""

import os
import re
from collections import defaultdict

def analyze_init_architecture():
    """ניתוח ארכיטקטורת אתחול של העמודים"""
    
    base_path = 'trading-ui'
    scripts_path = os.path.join(base_path, 'scripts')
    
    # עמודים שחסר להם Unified Init System
    pages_missing_init = ['index', 'preferences', 'trading_accounts', 'cash_flows', 'tickers']
    
    results = {
        'init_patterns': defaultdict(list),
        'conditions_usage': defaultdict(list),
        'package_structure': {}
    }
    
    # 1. בדיקת ארכיטקטורת אתחול
    print("🔍 בודק ארכיטקטורת אתחול...")
    
    for page in pages_missing_init:
        script_file = os.path.join(scripts_path, f'{page}.js')
        if not os.path.exists(script_file):
            script_file = os.path.join(scripts_path, f'{page}-page.js')
        
        if os.path.exists(script_file):
            with open(script_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # חיפוש דפוסי אתחול
            patterns = {
                'DOMContentLoaded': len(re.findall(r'DOMContentLoaded', content, re.IGNORECASE)),
                'addEventListener.*load': len(re.findall(r'addEventListener\s*\(\s*[\'"]load', content, re.IGNORECASE)),
                'window.onload': len(re.findall(r'window\.onload', content, re.IGNORECASE)),
                'document.ready': len(re.findall(r'document\.ready', content, re.IGNORECASE)),
                'initializeApplication': len(re.findall(r'initializeApplication', content)),
                'unifiedAppInitializer': len(re.findall(r'unifiedAppInitializer', content)),
                'PAGE_CONFIGS': len(re.findall(r'PAGE_CONFIGS', content)),
                'PACKAGE_MANIFEST': len(re.findall(r'PACKAGE_MANIFEST', content)),
            }
            
            results['init_patterns'][page] = patterns
    
    # 2. בדיקת שימוש ב-ConditionsSummaryRenderer
    print("🔍 בודק שימוש ב-ConditionsSummaryRenderer...")
    
    conditions_files = [
        'trades.js', 'trade_plans.js', 'ticker-dashboard.js', 
        'conditions-test.js', 'preferences-page.js', 'index.js'
    ]
    
    for file in conditions_files:
        file_path = os.path.join(scripts_path, file)
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'ConditionsSummaryRenderer' in content or 'renderConditions' in content:
                # חיפוש שימושים
                usages = len(re.findall(r'ConditionsSummaryRenderer|renderConditions', content))
                results['conditions_usage'][file] = {
                    'usages': usages,
                    'has_renderer': 'ConditionsSummaryRenderer' in content,
                    'has_render_function': 'renderConditions' in content
                }
    
    # 3. בדיקת חלוקת packages
    print("🔍 בודק חלוקת packages...")
    
    manifest_path = os.path.join(scripts_path, 'init-system', 'package-manifest.js')
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # חילוץ packages
        package_pattern = r"['\"]([a-z-]+)['\"]:\s*\{"
        packages = re.findall(package_pattern, content)
        
        # חילוץ scripts לכל package
        for package in packages:
            pattern = rf"['\"]{package}['\"]:\s*\{{[^}}]*scripts:\s*\[(.*?)\]"
            match = re.search(pattern, content, re.DOTALL)
            if match:
                scripts_content = match.group(1)
                scripts = re.findall(r"file:\s*['\"]([^'\"]+)['\"]", scripts_content)
                results['package_structure'][package] = {
                    'script_count': len(scripts),
                    'scripts': scripts[:5]  # רק 5 ראשונים לדוגמה
                }
    
    # יצירת דוח
    report = []
    report.append("# ניתוח מעמיק: ארכיטקטורת אתחול ומערכות")
    report.append("## Deep Analysis: Init Architecture & Systems\n")
    report.append("**תאריך יצירה:** 2025-12-03\n")
    report.append("---\n")
    
    # חלק 1: ארכיטקטורת אתחול
    report.append("## 1️⃣ ארכיטקטורת אתחול - עמודים שחסר להם Unified Init System\n")
    
    for page, patterns in results['init_patterns'].items():
        report.append(f"### {page}\n")
        report.append("**דפוסי אתחול מזוהים:**\n")
        
        if patterns['unifiedAppInitializer'] > 0:
            report.append(f"- ✅ משתמש ב-`unifiedAppInitializer` ({patterns['unifiedAppInitializer']} מופעים)\n")
        else:
            report.append("- ❌ **לא משתמש ב-`unifiedAppInitializer`**\n")
        
        if patterns['PAGE_CONFIGS'] > 0:
            report.append(f"- ✅ משתמש ב-`PAGE_CONFIGS` ({patterns['PAGE_CONFIGS']} מופעים)\n")
        else:
            report.append("- ❌ **לא משתמש ב-`PAGE_CONFIGS`**\n")
        
        if patterns['DOMContentLoaded'] > 0:
            report.append(f"- ⚠️ יש `DOMContentLoaded` listeners מקומיים ({patterns['DOMContentLoaded']} מופעים)\n")
        
        if patterns['initializeApplication'] > 0:
            report.append(f"- ✅ משתמש ב-`initializeApplication` ({patterns['initializeApplication']} מופעים)\n")
        
        report.append("\n**מסקנה:**\n")
        if patterns['unifiedAppInitializer'] == 0 and patterns['PAGE_CONFIGS'] == 0:
            report.append("- 🔴 **ארכיטקטורה מקומית/ישנה** - לא משתמש ב-Unified Init System\n")
            report.append("- 💡 **המלצה:** צריך לבדוק אם יש קוד מקביל או ארכיטקטורה אחרת\n")
        elif patterns['unifiedAppInitializer'] > 0 or patterns['PAGE_CONFIGS'] > 0:
            report.append("- 🟡 **שימוש חלקי** - משתמש בחלק מהמערכת\n")
        else:
            report.append("- 🟢 **משתמש ב-Unified Init System**\n")
        
        report.append("\n")
    
    # חלק 2: שימוש ב-Conditions
    report.append("---\n")
    report.append("## 2️⃣ שימוש ב-ConditionsSummaryRenderer\n")
    
    report.append("**קבצים שמשתמשים ב-ConditionsSummaryRenderer:**\n\n")
    
    pages_using_conditions = []
    for file, usage_info in results['conditions_usage'].items():
        page_name = file.replace('.js', '').replace('-page', '').replace('-', '_')
        pages_using_conditions.append(page_name)
        report.append(f"- **{file}**: {usage_info['usages']} מופעים\n")
        if usage_info['has_renderer']:
            report.append(f"  - משתמש ב-`window.ConditionsSummaryRenderer`\n")
        if usage_info['has_render_function']:
            report.append(f"  - יש פונקציה `renderConditions` מקומית\n")
    
    report.append("\n**עמודים שצריכים Conditions System:**\n")
    for page in sorted(set(pages_using_conditions)):
        report.append(f"- `{page}`\n")
    
    # חלק 3: חלוקת packages
    report.append("\n---\n")
    report.append("## 3️⃣ חלוקת Packages\n")
    
    report.append("**סיכום packages:**\n\n")
    for package, info in sorted(results['package_structure'].items()):
        report.append(f"- **`{package}`**: {info['script_count']} scripts\n")
        if info['scripts']:
            report.append(f"  - דוגמאות: {', '.join(info['scripts'][:3])}\n")
    
    # המלצות
    report.append("\n---\n")
    report.append("## 💡 המלצות\n\n")
    
    report.append("### 1. Unified Init System\n")
    report.append("**בעיה:** 5 עמודים לא משתמשים ב-Unified Init System\n\n")
    report.append("**פעולות נדרשות:**\n")
    report.append("1. לבדוק כל עמוד - האם יש קוד מקביל/מקומי\n")
    report.append("2. לבדוק האם העמודים עובדים עם ארכיטקטורה אחרת\n")
    report.append("3. להחליט: האם להמיר ל-Unified Init או לשמור על הארכיטקטורה הקיימת\n")
    report.append("4. רק אחרי בדיקה מעמיקה - להוסיף `init-system` package\n\n")
    
    report.append("### 2. Conditions System\n")
    report.append("**מצב:** רק עמודים ספציפיים משתמשים ב-ConditionsSummaryRenderer\n\n")
    report.append("**עמודים שצריכים Conditions:**\n")
    for page in sorted(set(pages_using_conditions)):
        report.append(f"- `{page}`\n")
    report.append("\n**פעולות נדרשות:**\n")
    report.append("1. להוסיף `conditions` package רק לעמודים שמשתמשים בו\n")
    report.append("2. לא להוסיף לכל העמודים - רק למי שצריך\n\n")
    
    report.append("### 3. חלוקת Packages\n")
    report.append("**פעולות נדרשות:**\n")
    report.append("1. לבדוק שהחלוקה נכונה - כל script במקום הנכון\n")
    report.append("2. לוודא שאין כפילויות\n")
    report.append("3. לוודא שהתלויות נכונות\n")
    
    # שמירת הדוח
    report_content = '\n'.join(report)
    with open('documentation/05-REPORTS/DEEP_INIT_ANALYSIS.md', 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print("\n✅ דוח נוצר: documentation/05-REPORTS/DEEP_INIT_ANALYSIS.md")
    print("\n📊 סיכום:")
    print(f"  - עמודים שנבדקו: {len(results['init_patterns'])}")
    print(f"  - קבצים שמשתמשים ב-Conditions: {len(results['conditions_usage'])}")
    print(f"  - Packages שנמצאו: {len(results['package_structure'])}")

if __name__ == '__main__':
    analyze_init_architecture()

