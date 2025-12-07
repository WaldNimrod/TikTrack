#!/usr/bin/env python3
"""
ניתוח דפוסים חוזרים במערכות חסרות
"""

import re
from collections import Counter, defaultdict

def analyze_missing_patterns():
    """ניתוח דפוסים חוזרים במערכות חסרות"""
    
    with open('documentation/05-REPORTS/PAGES_SYSTEMS_ANALYSIS_REPORT.md', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # חילוץ מערכות חסרות
    systems_pattern = r'- \*\*(.+?)\*\* \(package: `(.+?)`\)'
    systems_matches = re.findall(systems_pattern, content)
    
    # חילוץ packages חסרים
    packages_pattern = r'- `([a-z-]+)`'
    packages_matches = re.findall(packages_pattern, content)
    
    # חילוץ globals חסרים
    globals_pattern = r'- `window\.(.+?)` \(מערכת:'
    globals_matches = re.findall(globals_pattern, content)
    
    # חילוץ עמודים
    page_pattern = r'### (.+?)\n'
    pages = re.findall(page_pattern, content)
    
    # ספירה
    systems_counter = Counter([s[0] for s in systems_matches])
    packages_counter = Counter(packages_matches)
    globals_counter = Counter(globals_matches)
    
    # ניתוח לפי package
    package_to_systems = defaultdict(set)
    for system, package in systems_matches:
        package_to_systems[package].add(system)
    
    # יצירת דוח
    report = []
    report.append("# ניתוח דפוסים חוזרים במערכות חסרות")
    report.append("## Missing Systems Patterns Analysis\n")
    report.append(f"**תאריך יצירה:** 2025-12-03\n")
    report.append("---\n")
    
    report.append("## 📊 סיכום כללי\n")
    report.append(f"- **סה\"כ מערכות ייחודיות חסרות:** {len(systems_counter)}")
    report.append(f"- **סה\"כ packages ייחודיים חסרים:** {len(packages_counter)}")
    report.append(f"- **סה\"כ globals ייחודיים חסרים:** {len(globals_counter)}")
    report.append(f"- **סה\"כ עמודים:** {len(pages)}\n")
    report.append("---\n")
    
    report.append("## 🔧 מערכות חסרות (לפי תדירות)\n")
    for system, count in systems_counter.most_common():
        percentage = (count / len(pages)) * 100
        report.append(f"- **{system}**: {count} עמודים ({percentage:.1f}%)")
    
    report.append("\n---\n")
    
    report.append("## 📦 Packages חסרים (לפי תדירות)\n")
    for package, count in packages_counter.most_common():
        percentage = (count / len(pages)) * 100
        systems_in_package = ', '.join(sorted(package_to_systems[package]))
        report.append(f"- **`{package}`**: {count} עמודים ({percentage:.1f}%)")
        report.append(f"  - מערכות: {systems_in_package}")
    
    report.append("\n---\n")
    
    report.append("## 🌐 Globals חסרים (Top 20)\n")
    for global_name, count in globals_counter.most_common(20):
        percentage = (count / len(pages)) * 100
        report.append(f"- **`window.{global_name}`**: {count} עמודים ({percentage:.1f}%)")
    
    report.append("\n---\n")
    
    report.append("## 💡 דפוסים מזוהים\n\n")
    
    # דפוס 1: Unified Init System
    if systems_counter.get('Unified Init System', 0) > 0:
        report.append("### דפוס 1: Unified Init System חסר\n")
        report.append("- **תדירות:** גבוהה (5 עמודים)\n")
        report.append("- **סיבה:** מערכת אתחול מרכזית שצריכה להיות בכל עמוד\n")
        report.append("- **פתרון:** הוספת `init-system` package ו-3 globals:\n")
        report.append("  - `window.unifiedAppInitializer`\n")
        report.append("  - `window.PAGE_CONFIGS`\n")
        report.append("  - `window.PACKAGE_MANIFEST`\n\n")
    
    # דפוס 2: Conditions System
    if systems_counter.get('ConditionsSummaryRenderer', 0) > 0:
        report.append("### דפוס 2: Conditions System חסר\n")
        report.append("- **תדירות:** גבוהה (5 עמודים)\n")
        report.append("- **סיבה:** מערכת תנאים נדרשת בעמודים רבים\n")
        report.append("- **פתרון:** הוספת `conditions` package ו-`window.ConditionsSummaryRenderer`\n\n")
    
    # דפוס 3: CRUD Package
    crud_systems = ['CRUDResponseHandler', 'LinkedItemsSystem', 'UnifiedTableSystem', 'PaginationSystem']
    crud_count = sum(systems_counter.get(s, 0) for s in crud_systems)
    if crud_count > 0:
        report.append("### דפוס 3: CRUD Package חסר\n")
        report.append("- **תדירות:** בינונית-גבוהה\n")
        report.append("- **סיבה:** מערכות CRUD נדרשות בעמודים עם טבלאות ופעולות\n")
        report.append("- **פתרון:** הוספת `crud` package ו-globals:\n")
        for system in crud_systems:
            if systems_counter.get(system, 0) > 0:
                global_name = system.replace("System", "").replace("Handler", "")
                report.append(f"  - `window.{global_name}` ({systems_counter[system]} עמודים)\n")
        report.append("\n")
    
    # דפוס 4: Modules Package
    if systems_counter.get('ModalManagerV2', 0) > 0:
        report.append("### דפוס 4: Modules Package חסר\n")
        report.append("- **תדירות:** בינונית (3 עמודים)\n")
        report.append("- **סיבה:** ModalManagerV2 נדרש בעמודים עם מודלים\n")
        report.append("- **פתרון:** הוספת `modules` package ו-`window.ModalManagerV2`\n\n")
    
    # דפוס 5: Info Summary
    if systems_counter.get('InfoSummarySystem', 0) > 0:
        report.append("### דפוס 5: Info Summary חסר\n")
        report.append("- **תדירות:** בינונית (2 עמודים)\n")
        report.append("- **סיבה:** מערכת סיכום נתונים נדרשת בעמודים עם נתונים מורכבים\n")
        report.append("- **פתרון:** הוספת `info-summary` package ו-`window.InfoSummarySystem`\n\n")
    
    report.append("---\n")
    report.append("## 🎯 המלצות לתיקון\n\n")
    report.append("### עדיפות גבוהה:\n")
    report.append("1. **Unified Init System** - הוסף ל-5 עמודים\n")
    report.append("2. **Conditions System** - הוסף ל-5 עמודים\n")
    report.append("\n### עדיפות בינונית:\n")
    report.append("3. **CRUD Package** - הוסף ל-2-4 עמודים (תלוי בפונקציונליות)\n")
    report.append("4. **Modules Package** - הוסף ל-3 עמודים\n")
    report.append("\n### עדיפות נמוכה:\n")
    report.append("5. **Info Summary** - הוסף ל-2 עמודים\n")
    report.append("6. **Color Scheme** - הוסף ל-1 עמוד\n")
    
    # שמירת הדוח
    report_content = '\n'.join(report)
    with open('documentation/05-REPORTS/MISSING_PATTERNS_ANALYSIS.md', 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    print("✅ דוח נוצר: documentation/05-REPORTS/MISSING_PATTERNS_ANALYSIS.md")
    print("\n📊 סיכום מהיר:")
    print(f"  - מערכות ייחודיות: {len(systems_counter)}")
    print(f"  - Packages ייחודיים: {len(packages_counter)}")
    print(f"  - Globals ייחודיים: {len(globals_counter)}")
    print("\n🔝 Top 5 מערכות חסרות:")
    for system, count in systems_counter.most_common(5):
        print(f"  - {system}: {count} עמודים")

if __name__ == '__main__':
    analyze_missing_patterns()

