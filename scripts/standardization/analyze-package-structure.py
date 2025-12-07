#!/usr/bin/env python3
"""
ניתוח מקיף של חלוקת Packages
"""

import re
import json
from collections import defaultdict

def analyze_package_structure():
    """ניתוח מקיף של חלוקת packages"""
    
    manifest_path = 'trading-ui/scripts/init-system/package-manifest.js'
    
    with open(manifest_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # חילוץ כל ה-packages
    packages = {}
    
    # חילוץ package blocks
    package_pattern = r"['\"]([a-z-]+)['\"]:\s*\{([^}]+(?:{[^}]*}[^}]*)*)\}"
    matches = re.finditer(package_pattern, content, re.DOTALL)
    
    for match in matches:
        package_id = match.group(1)
        package_content = match.group(2)
        
        # חילוץ מידע בסיסי
        id_match = re.search(r"id:\s*['\"]([^'\"]+)['\"]", package_content)
        name_match = re.search(r"name:\s*['\"]([^'\"]+)['\"]", package_content)
        desc_match = re.search(r"description:\s*['\"]([^'\"]+)['\"]", package_content)
        load_order_match = re.search(r"loadOrder:\s*(\d+(?:\.\d+)?)", package_content)
        critical_match = re.search(r"critical:\s*(true|false)", package_content)
        dependencies_match = re.search(r"dependencies:\s*\[(.*?)\]", package_content, re.DOTALL)
        
        # חילוץ scripts
        scripts_pattern = r"scripts:\s*\[(.*?)\]"
        scripts_match = re.search(scripts_pattern, package_content, re.DOTALL)
        
        scripts = []
        if scripts_match:
            scripts_content = scripts_match.group(1)
            file_matches = re.findall(r"file:\s*['\"]([^'\"]+)['\"]", scripts_content)
            scripts = file_matches
        
        # חילוץ dependencies
        dependencies = []
        if dependencies_match:
            deps_content = dependencies_match.group(1)
            deps = re.findall(r"['\"]([^'\"]+)['\"]", deps_content)
            dependencies = deps
        
        packages[package_id] = {
            'id': id_match.group(1) if id_match else package_id,
            'name': name_match.group(1) if name_match else package_id,
            'description': desc_match.group(1) if desc_match else '',
            'load_order': float(load_order_match.group(1)) if load_order_match else None,
            'critical': critical_match.group(1) == 'true' if critical_match else False,
            'dependencies': dependencies,
            'scripts': scripts,
            'script_count': len(scripts)
        }
    
    # ניתוח
    analysis = {
        'packages': packages,
        'issues': [],
        'recommendations': []
    }
    
    # 1. בדיקת אחריות נכונה
    print("🔍 בודק אחריות נכונה...")
    
    # UnifiedAppInitializer צריך להיות ב-init-system, לא ב-modules
    if 'modules' in packages and 'core-systems.js' in packages['modules']['scripts']:
        analysis['issues'].append({
            'type': 'responsibility',
            'severity': 'high',
            'package': 'modules',
            'issue': 'UnifiedAppInitializer נמצא ב-modules במקום ב-init-system',
            'recommendation': 'להעביר core-systems.js ל-init-system package'
        })
    
    # 2. בדיקת תלויות
    print("🔍 בודק תלויות...")
    
    for package_id, package_info in packages.items():
        for dep in package_info['dependencies']:
            if dep not in packages:
                analysis['issues'].append({
                    'type': 'dependency',
                    'severity': 'high',
                    'package': package_id,
                    'issue': f'תלות ב-package לא קיים: {dep}',
                    'recommendation': f'להוסיף את {dep} או להסיר את התלות'
                })
    
    # 3. בדיקת סדר טעינה
    print("🔍 בודק סדר טעינה...")
    
    load_orders = {}
    for package_id, package_info in packages.items():
        if package_info['load_order']:
            load_orders[package_id] = package_info['load_order']
    
    # בדיקת circular dependencies
    def check_circular_deps(package_id, visited=None, path=None):
        if visited is None:
            visited = set()
        if path is None:
            path = []
        
        if package_id in path:
            return True  # Circular dependency found
        
        if package_id in visited:
            return False
        
        if package_id not in packages:
            return False  # Package לא קיים
        
        visited.add(package_id)
        path.append(package_id)
        
        for dep in packages[package_id]['dependencies']:
            if dep in packages and check_circular_deps(dep, visited, path.copy()):
                return True
        
        return False
    
    for package_id in packages:
        if check_circular_deps(package_id):
            analysis['issues'].append({
                'type': 'circular_dependency',
                'severity': 'high',
                'package': package_id,
                'issue': f'תלות מעגלית ב-{package_id}',
                'recommendation': 'לתקן את התלויות'
            })
    
    # 4. בדיקת ביצועים
    print("🔍 בודק ביצועים...")
    
    # packages עם הרבה scripts
    large_packages = {pid: info for pid, info in packages.items() if info['script_count'] > 15}
    if large_packages:
        for pid, info in large_packages.items():
            analysis['issues'].append({
                'type': 'performance',
                'severity': 'medium',
                'package': pid,
                'issue': f'Package גדול מדי: {info["script_count"]} scripts',
                'recommendation': 'לשקול פיצול ל-packages קטנים יותר'
            })
    
    # יצירת דוח
    report = []
    report.append("# ניתוח מקיף: חלוקת Packages")
    report.append("## Comprehensive Package Structure Analysis\n")
    report.append("**תאריך יצירה:** 2025-12-03\n")
    report.append("---\n")
    
    # סיכום כללי
    report.append("## 📊 סיכום כללי\n\n")
    report.append(f"- **סה\"כ packages:** {len(packages)}\n")
    report.append(f"- **סה\"כ scripts:** {sum(info['script_count'] for info in packages.values())}\n")
    report.append(f"- **בעיות שנמצאו:** {len(analysis['issues'])}\n")
    report.append("\n---\n")
    
    # רשימת packages לפי loadOrder
    report.append("## 📦 Packages לפי סדר טעינה\n\n")
    
    sorted_packages = sorted(packages.items(), key=lambda x: x[1]['load_order'] if x[1]['load_order'] else 999)
    
    for package_id, package_info in sorted_packages:
        report.append(f"### {package_id} (loadOrder: {package_info['load_order']})\n")
        report.append(f"- **שם:** {package_info['name']}\n")
        report.append(f"- **תיאור:** {package_info['description']}\n")
        report.append(f"- **מספר scripts:** {package_info['script_count']}\n")
        report.append(f"- **קריטי:** {'✅ כן' if package_info['critical'] else '❌ לא'}\n")
        
        if package_info['dependencies']:
            report.append(f"- **תלויות:** {', '.join(package_info['dependencies'])}\n")
        
        # דוגמאות scripts
        if package_info['scripts']:
            report.append(f"- **דוגמאות scripts:** {', '.join(package_info['scripts'][:3])}\n")
            if len(package_info['scripts']) > 3:
                report.append(f"  - ... ועוד {len(package_info['scripts']) - 3} scripts\n")
        
        report.append("\n")
    
    # בעיות
    if analysis['issues']:
        report.append("---\n")
        report.append("## ⚠️ בעיות שנמצאו\n\n")
        
        by_type = defaultdict(list)
        for issue in analysis['issues']:
            by_type[issue['type']].append(issue)
        
        for issue_type, issues_list in by_type.items():
            report.append(f"### {issue_type}\n\n")
            for issue in issues_list:
                severity_icon = '🔴' if issue['severity'] == 'high' else '🟡' if issue['severity'] == 'medium' else '🟢'
                report.append(f"{severity_icon} **{issue['package']}**: {issue['issue']}\n")
                report.append(f"   - **המלצה:** {issue['recommendation']}\n\n")
    
    # המלצות
    report.append("---\n")
    report.append("## 💡 המלצות לשיפור\n\n")
    
    report.append("### 1. אחריות נכונה\n\n")
    report.append("- **UnifiedAppInitializer** צריך להיות ב-`init-system`, לא ב-`modules`\n")
    report.append("- `modules` צריך לכלול רק מודלים (modals, navigation, etc.)\n")
    report.append("- `init-system` צריך לכלול את כל מערכות האתחול\n\n")
    
    report.append("### 2. תלויות\n\n")
    report.append("- לוודא שכל התלויות קיימות\n")
    report.append("- לבדוק שאין תלויות מעגליות\n")
    report.append("- לוודא שהתלויות הגיוניות (base לפני services, services לפני ui-advanced)\n\n")
    
    report.append("### 3. סדר טעינה\n\n")
    report.append("- base (1) → services (2) → modules (2.5) → ui-advanced (3) → crud (4)\n")
    report.append("- init-system צריך להיות אחרון (22)\n")
    report.append("- לוודא שהסדר הגיוני לפי התלויות\n\n")
    
    report.append("### 4. ביצועים\n\n")
    report.append("- packages גדולים (>15 scripts) לשקול פיצול\n")
    report.append("- לוודא שאין כפילויות\n")
    report.append("- לוודא שכל script נמצא ב-package הנכון\n\n")
    
    # שמירת דוח
    report_content = '\n'.join(report)
    with open('documentation/05-REPORTS/PACKAGE_STRUCTURE_ANALYSIS.md', 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    # שמירת JSON
    with open('documentation/05-REPORTS/PACKAGE_STRUCTURE_DATA.json', 'w', encoding='utf-8') as f:
        json.dump({
            'packages': packages,
            'issues': analysis['issues'],
            'summary': {
                'total_packages': len(packages),
                'total_scripts': sum(info['script_count'] for info in packages.values()),
                'total_issues': len(analysis['issues'])
            }
        }, f, indent=2, ensure_ascii=False)
    
    print("\n✅ דוח נוצר: documentation/05-REPORTS/PACKAGE_STRUCTURE_ANALYSIS.md")
    print("✅ JSON נוצר: documentation/05-REPORTS/PACKAGE_STRUCTURE_DATA.json")
    print(f"\n📊 סיכום:")
    print(f"  - Packages: {len(packages)}")
    print(f"  - Scripts: {sum(info['script_count'] for info in packages.values())}")
    print(f"  - בעיות: {len(analysis['issues'])}")
    
    if analysis['issues']:
        print("\n⚠️ בעיות:")
        for issue in analysis['issues'][:5]:
            print(f"  - {issue['package']}: {issue['issue']}")

if __name__ == '__main__':
    analyze_package_structure()

