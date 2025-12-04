#!/usr/bin/env python3
"""
בדיקת חלוקת packages - וידוא שהכל במקום הנכון
"""

import re
import json
from collections import defaultdict

def check_package_structure():
    """בדיקת חלוקת packages"""
    
    manifest_path = 'trading-ui/scripts/init-system/package-manifest.js'
    
    with open(manifest_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # חילוץ כל ה-packages
    package_pattern = r"['\"]([a-z-]+)['\"]:\s*\{[^}]*id:\s*['\"]([^'\"]+)['\"]"
    packages = {}
    
    # חילוץ ידני יותר מדויק
    package_blocks = re.findall(r"['\"]([a-z-]+)['\"]:\s*\{([^}]+(?:{[^}]*}[^}]*)*)\}", content, re.DOTALL)
    
    issues = []
    package_info = {}
    
    # חילוץ מידע על כל package
    for package_id in ['base', 'services', 'ui-advanced', 'crud', 'preferences', 'conditions', 'init-system', 'modules', 'info-summary']:
        pattern = rf"['\"]{package_id}['\"]:\s*\{{([^}}]+(?:{{[^}}]*}}[^}}]*)*)}}"
        match = re.search(pattern, content, re.DOTALL)
        if match:
            package_content = match.group(1)
            
            # חילוץ scripts
            scripts_pattern = r"scripts:\s*\[(.*?)\]"
            scripts_match = re.search(scripts_pattern, package_content, re.DOTALL)
            
            scripts = []
            if scripts_match:
                scripts_content = scripts_match.group(1)
                file_matches = re.findall(r"file:\s*['\"]([^'\"]+)['\"]", scripts_content)
                scripts = file_matches
            
            # חילוץ loadOrder
            load_order_match = re.search(r"loadOrder:\s*(\d+(?:\.\d+)?)", package_content)
            load_order = float(load_order_match.group(1)) if load_order_match else None
            
            package_info[package_id] = {
                'scripts': scripts,
                'script_count': len(scripts),
                'load_order': load_order
            }
        else:
            issues.append(f"Package '{package_id}' לא נמצא")
    
    # בדיקת כפילויות
    all_scripts = []
    duplicates = defaultdict(list)
    
    for package_id, info in package_info.items():
        for script in info['scripts']:
            if script in all_scripts:
                duplicates[script].append(package_id)
            all_scripts.append(script)
            duplicates[script].append(package_id)
    
    # יצירת דוח
    report = []
    report.append("# בדיקת חלוקת Packages")
    report.append("## Package Structure Validation\n")
    report.append("**תאריך יצירה:** 2025-12-03\n")
    report.append("---\n")
    
    report.append("## 📦 סיכום Packages\n\n")
    for package_id in sorted(package_info.keys()):
        info = package_info[package_id]
        report.append(f"### `{package_id}`\n")
        report.append(f"- **מספר scripts:** {info['script_count']}\n")
        if info['load_order']:
            report.append(f"- **Load Order:** {info['load_order']}\n")
        report.append("\n")
    
    # כפילויות
    if duplicates:
        report.append("---\n")
        report.append("## ⚠️ Scripts שמופיעים בכמה packages\n\n")
        for script, packages_list in duplicates.items():
            if len(set(packages_list)) > 1:
                report.append(f"- **`{script}`**: מופיע ב-{len(set(packages_list))} packages\n")
                report.append(f"  - Packages: {', '.join(set(packages_list))}\n")
    
    # בדיקת init-system package
    report.append("\n---\n")
    report.append("## 🔍 בדיקת init-system Package\n\n")
    
    if 'init-system' in package_info:
        init_scripts = package_info['init-system']['scripts']
        report.append(f"**Scripts ב-init-system:** {len(init_scripts)}\n\n")
        report.append("**רשימת scripts:**\n")
        for script in init_scripts:
            report.append(f"- `{script}`\n")
        
        # בדיקה אם unified-app-initializer נמצא
        if any('unified-app-initializer' in s for s in init_scripts):
            report.append("\n✅ `unified-app-initializer.js` נמצא ב-init-system\n")
        else:
            report.append("\n❌ `unified-app-initializer.js` **לא נמצא** ב-init-system\n")
            issues.append("unified-app-initializer.js לא נמצא ב-init-system package")
        
        # בדיקה אם package-manifest נמצא
        if any('package-manifest' in s for s in init_scripts):
            report.append("✅ `package-manifest.js` נמצא ב-init-system\n")
        else:
            report.append("❌ `package-manifest.js` **לא נמצא** ב-init-system\n")
            issues.append("package-manifest.js לא נמצא ב-init-system package")
        
        # בדיקה אם page-initialization-configs נמצא
        if any('page-initialization-configs' in s for s in init_scripts):
            report.append("✅ `page-initialization-configs.js` נמצא ב-init-system\n")
        else:
            report.append("❌ `page-initialization-configs.js` **לא נמצא** ב-init-system\n")
            issues.append("page-initialization-configs.js לא נמצא ב-init-system package")
    
    # בעיות
    if issues:
        report.append("\n---\n")
        report.append("## ❌ בעיות שנמצאו\n\n")
        for issue in issues:
            report.append(f"- {issue}\n")
    
    # המלצות
    report.append("\n---\n")
    report.append("## 💡 המלצות\n\n")
    report.append("### 1. וידוא חלוקה נכונה\n")
    report.append("- לבדוק שכל script נמצא ב-package הנכון\n")
    report.append("- לוודא שאין כפילויות\n")
    report.append("- לוודא שהתלויות נכונות (dependencies)\n\n")
    
    report.append("### 2. init-system Package\n")
    report.append("- צריך לכלול:\n")
    report.append("  - `unified-app-initializer.js`\n")
    report.append("  - `package-manifest.js`\n")
    report.append("  - `page-initialization-configs.js`\n")
    report.append("  - קבצים נוספים של מערכת האתחול\n\n")
    
    # שמירת הדוח
    report_content = '\n'.join(report)
    with open('documentation/05-REPORTS/PACKAGE_STRUCTURE_CHECK.md', 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print("✅ דוח נוצר: documentation/05-REPORTS/PACKAGE_STRUCTURE_CHECK.md")
    print(f"\n📊 סיכום:")
    print(f"  - Packages שנבדקו: {len(package_info)}")
    print(f"  - בעיות שנמצאו: {len(issues)}")
    
    if issues:
        print("\n⚠️ בעיות:")
        for issue in issues:
            print(f"  - {issue}")

if __name__ == '__main__':
    check_package_structure()

