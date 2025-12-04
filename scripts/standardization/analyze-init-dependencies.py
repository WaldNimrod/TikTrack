#!/usr/bin/env python3
"""
ניתוח תלויות init-system - זיהוי תלויות אמיתיות vs מיותרות
"""

import re
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI = PROJECT_ROOT / 'trading-ui'
SCRIPTS_DIR = TRADING_UI / 'scripts'
MANIFEST_PATH = SCRIPTS_DIR / 'init-system' / 'package-manifest.js'
DOCS_DIR = PROJECT_ROOT / 'documentation' / '05-REPORTS'

def analyze_init_dependencies():
    """ניתוח תלויות init-system"""
    
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # חילוץ init-system package
    init_system_pattern = r"'init-system':\s*\{([^}]+(?:{[^}]*}[^}]*)*)\}"
    match = re.search(init_system_pattern, content, re.DOTALL)
    
    if not match:
        print("❌ לא נמצא init-system package")
        return None
    
    init_content = match.group(1)
    
    # חילוץ dependencies
    deps_pattern = r"dependencies:\s*\[(.*?)\]"
    deps_match = re.search(deps_pattern, init_content, re.DOTALL)
    
    if not deps_match:
        print("❌ לא נמצאו dependencies")
        return None
    
    deps_content = deps_match.group(1)
    dependencies = re.findall(r"['\"]([^'\"]+)['\"]", deps_content)
    
    # חילוץ scripts
    scripts_pattern = r"scripts:\s*\[(.*?)\]"
    scripts_match = re.search(scripts_pattern, init_content, re.DOTALL)
    
    scripts = []
    if scripts_match:
        scripts_content = scripts_match.group(1)
        file_matches = re.findall(r"file:\s*['\"]([^'\"]+)['\"]", scripts_content)
        scripts = file_matches
    
    # ניתוח כל dependency
    analysis = {
        'total_dependencies': len(dependencies),
        'dependencies': {},
        'scripts': scripts,
        'recommendations': []
    }
    
    # קריאת package-manifest לניתוח כל package
    all_packages = {}
    package_pattern = r"['\"]([a-z-]+)['\"]:\s*\{([^}]+(?:{[^}]*}[^}]*)*)\}"
    for pkg_match in re.finditer(package_pattern, content, re.DOTALL):
        pkg_id = pkg_match.group(1)
        pkg_content = pkg_match.group(2)
        
        # חילוץ scripts
        pkg_scripts_match = re.search(scripts_pattern, pkg_content, re.DOTALL)
        pkg_scripts = []
        if pkg_scripts_match:
            pkg_scripts_content = pkg_scripts_match.group(1)
            pkg_file_matches = re.findall(r"file:\s*['\"]([^'\"]+)['\"]", pkg_scripts_content)
            pkg_scripts = pkg_file_matches
        
        all_packages[pkg_id] = {
            'scripts': pkg_scripts,
            'script_count': len(pkg_scripts)
        }
    
    # ניתוח כל dependency
    for dep in dependencies:
        dep_info = {
            'package_id': dep,
            'scripts': all_packages.get(dep, {}).get('scripts', []),
            'script_count': all_packages.get(dep, {}).get('script_count', 0),
            'required': False,
            'reason': ''
        }
        
        # בדיקה אם באמת נדרש
        # init-system צריך:
        # 1. base - ל-Logger, API_BASE_URL, וכו'
        # 2. services - ל-DataCollectionService, וכו' (אולי לא)
        # 3. monitoring functions - צריך לבדוק מה באמת נדרש
        
        if dep == 'base':
            dep_info['required'] = True
            dep_info['reason'] = 'נדרש ל-Logger, API_BASE_URL, וכל מערכות הבסיס'
        elif dep in ['package-manifest', 'page-initialization-configs']:
            dep_info['required'] = True
            dep_info['reason'] = 'חלק מ-init-system עצמו'
        else:
            # בדיקה אם יש שימוש ב-scripts של ה-package
            dep_scripts = all_packages.get(dep, {}).get('scripts', [])
            if dep_scripts:
                # בדיקה אם init-system scripts משתמשים ב-globals מה-package
                dep_info['required'] = False  # צריך לבדוק ידנית
                dep_info['reason'] = 'צריך לבדוק אם באמת נדרש'
        
        analysis['dependencies'][dep] = dep_info
    
    # המלצות
    required_deps = [d for d, info in analysis['dependencies'].items() if info['required']]
    optional_deps = [d for d, info in analysis['dependencies'].items() if not info['required']]
    
    analysis['recommendations'] = [
        f"תלויות נדרשות: {', '.join(required_deps)}",
        f"תלויות לבדיקה: {', '.join(optional_deps)}",
        f"סה\"כ תלויות: {len(dependencies)}",
        f"מומלץ להפחית ל-{len(required_deps) + 3} תלויות (רק מה שבאמת נדרש)"
    ]
    
    return analysis

def generate_report(analysis):
    """יצירת דוח"""
    
    if not analysis:
        return
    
    report = []
    report.append("# ניתוח תלויות init-system")
    report.append("## Init System Dependencies Analysis\n")
    report.append(f"**תאריך יצירה:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    report.append("---\n")
    
    report.append("## 📊 סיכום כללי\n\n")
    report.append(f"- **סה\"כ תלויות:** {analysis['total_dependencies']}\n")
    report.append(f"- **Scripts ב-init-system:** {len(analysis['scripts'])}\n")
    report.append("\n---\n")
    
    # Scripts ב-init-system
    report.append("## 📦 Scripts ב-init-system\n\n")
    for script in analysis['scripts']:
        report.append(f"- `{script}`\n")
    report.append("\n---\n")
    
    # ניתוח תלויות
    report.append("## 🔍 ניתוח תלויות\n\n")
    
    required = []
    optional = []
    
    for dep_id, dep_info in sorted(analysis['dependencies'].items()):
        if dep_info['required']:
            required.append(dep_id)
            report.append(f"### ✅ {dep_id} (נדרש)\n\n")
        else:
            optional.append(dep_id)
            report.append(f"### ❓ {dep_id} (לבדיקה)\n\n")
        
        report.append(f"- **מספר scripts:** {dep_info['script_count']}\n")
        report.append(f"- **סיבה:** {dep_info['reason']}\n")
        if dep_info['scripts']:
            report.append(f"- **דוגמאות scripts:** {', '.join(dep_info['scripts'][:3])}\n")
        report.append("\n")
    
    # המלצות
    report.append("---\n")
    report.append("## 💡 המלצות\n\n")
    
    report.append("### תלויות נדרשות (מומלץ לשמור):\n")
    for dep in required:
        report.append(f"- `{dep}`\n")
    report.append("\n")
    
    report.append("### תלויות לבדיקה (אולי מיותרות):\n")
    for dep in optional:
        report.append(f"- `{dep}` - צריך לבדוק אם באמת נדרש\n")
    report.append("\n")
    
    report.append("### המלצה כללית:\n")
    report.append(f"- **נוכחי:** {analysis['total_dependencies']} תלויות\n")
    report.append(f"- **מומלץ:** {len(required) + 3} תלויות (רק base + מה שבאמת נדרש לניטור)\n")
    report.append(f"- **חיסכון:** {analysis['total_dependencies'] - (len(required) + 3)} תלויות\n")
    report.append("\n")
    
    report.append("### מה באמת נדרש ל-init-system:\n")
    report.append("1. **base** - ל-Logger, API_BASE_URL, וכל מערכות הבסיס ✅\n")
    report.append("2. **מה שנדרש לניטור** - צריך לבדוק מה `monitoring-functions.js` באמת צריך\n")
    report.append("3. **מה שנדרש ל-UnifiedAppInitializer** - צריך לבדוק מה `core-systems.js` באמת צריך\n")
    report.append("\n")
    
    # שמירת דוח
    report_content = '\n'.join(report)
    report_path = DOCS_DIR / 'INIT_DEPENDENCIES_ANALYSIS.md'
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print(f"✅ דוח נוצר: {report_path}")
    print(f"\n📊 סיכום:")
    print(f"  - סה\"כ תלויות: {analysis['total_dependencies']}")
    print(f"  - נדרשות: {len(required)}")
    print(f"  - לבדיקה: {len(optional)}")

if __name__ == '__main__':
    analysis = analyze_init_dependencies()
    if analysis:
        generate_report(analysis)

