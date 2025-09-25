#!/usr/bin/env python3
'''
כלי מתקדם לבדיקת כפילויות HTML
'''

import os
import re
from pathlib import Path
from collections import defaultdict, Counter

def analyze_html_duplicates():
    """ניתוח כפילויות HTML מתקדם"""
    print("🔍 מנתח כפילויות HTML...")
    
    # קבצי HTML לבדיקה
    html_files = [
        "trading-ui/test-header-only.html",
        "trading-ui/index.html",
        "trading-ui/css-management.html"
    ]
    
    results = {
        'duplicate_scripts': defaultdict(list),
        'duplicate_stylesheets': defaultdict(list),
        'duplicate_ids': defaultdict(list),
        'duplicate_classes': defaultdict(list),
        'file_stats': {}
    }
    
    for html_file in html_files:
        if not os.path.exists(html_file):
            print(f"⚠️  קובץ לא נמצא: {html_file}")
            continue
            
        print(f"📄 מנתח {html_file}...")
        
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # סטטיסטיקות קובץ
        results['file_stats'][html_file] = {
            'size': len(content),
            'lines': content.count('\n'),
            'scripts': content.count('<script'),
            'stylesheets': content.count('<link'),
            'ids': len(re.findall(r'id="([^"]+)"', content)),
            'classes': len(re.findall(r'class="([^"]+)"', content))
        }
        
        # חיפוש כפילויות scripts
        scripts = re.findall(r'<script[^>]*src="([^"]+)"', content)
        script_counts = Counter(scripts)
        
        for script, count in script_counts.items():
            if count > 1:
                results['duplicate_scripts'][script].append({
                    'file': html_file,
                    'count': count
                })
        
        # חיפוש כפילויות stylesheets
        stylesheets = re.findall(r'<link[^>]*href="([^"]+)"[^>]*rel="stylesheet"', content)
        stylesheet_counts = Counter(stylesheets)
        
        for stylesheet, count in stylesheet_counts.items():
            if count > 1:
                results['duplicate_stylesheets'][stylesheet].append({
                    'file': html_file,
                    'count': count
                })
        
        # חיפוש כפילויות IDs
        ids = re.findall(r'id="([^"]+)"', content)
        id_counts = Counter(ids)
        
        for id_name, count in id_counts.items():
            if count > 1:
                results['duplicate_ids'][id_name].append({
                    'file': html_file,
                    'count': count
                })
        
        # חיפוש כפילויות classes
        classes = re.findall(r'class="([^"]+)"', content)
        class_counts = Counter(classes)
        
        for class_name, count in class_counts.items():
            if count > 3:  # רק classes עם הרבה מופעים
                results['duplicate_classes'][class_name].append({
                    'file': html_file,
                    'count': count
                })
    
    return results

def print_html_duplicate_report(results):
    """הדפסת דוח כפילויות HTML"""
    print("\n" + "="*60)
    print("📊 דוח כפילויות HTML")
    print("="*60)
    
    # סטטיסטיקות קבצים
    print("\n📁 סטטיסטיקות קבצים:")
    for file, stats in results['file_stats'].items():
        print(f"  {file}:")
        print(f"    📏 גודל: {stats['size']:,} תווים")
        print(f"    📄 שורות: {stats['lines']:,}")
        print(f"    📜 scripts: {stats['scripts']:,}")
        print(f"    🎨 stylesheets: {stats['stylesheets']:,}")
        print(f"    🆔 IDs: {stats['ids']:,}")
        print(f"    🏷️  classes: {stats['classes']:,}")
    
    # כפילויות scripts
    if results['duplicate_scripts']:
        print(f"\n📜 כפילויות scripts ({len(results['duplicate_scripts'])}):")
        for script, files in list(results['duplicate_scripts'].items())[:10]:
            print(f"  {script}:")
            for file_info in files:
                print(f"    📄 {file_info['file']}: {file_info['count']} מופעים")
    
    # כפילויות stylesheets
    if results['duplicate_stylesheets']:
        print(f"\n🎨 כפילויות stylesheets ({len(results['duplicate_stylesheets'])}):")
        for stylesheet, files in list(results['duplicate_stylesheets'].items())[:10]:
            print(f"  {stylesheet}:")
            for file_info in files:
                print(f"    📄 {file_info['file']}: {file_info['count']} מופעים")
    
    # כפילויות IDs
    if results['duplicate_ids']:
        print(f"\n🆔 כפילויות IDs ({len(results['duplicate_ids'])}):")
        for id_name, files in list(results['duplicate_ids'].items())[:10]:
            print(f"  {id_name}:")
            for file_info in files:
                print(f"    📄 {file_info['file']}: {file_info['count']} מופעים")
    
    # כפילויות classes
    if results['duplicate_classes']:
        print(f"\n🏷️  כפילויות classes ({len(results['duplicate_classes'])}):")
        for class_name, files in list(results['duplicate_classes'].items())[:10]:
            print(f"  {class_name}:")
            for file_info in files:
                print(f"    📄 {file_info['file']}: {file_info['count']} מופעים")

def check_specific_html_duplicates():
    """בדיקה ספציפית של כפילויות HTML חשובות"""
    print("\n🎯 בדיקה ספציפית של כפילויות HTML...")
    
    # בדיקת כפילויות ב-test-header-only.html
    test_html = "trading-ui/test-header-only.html"
    if os.path.exists(test_html):
        with open(test_html, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # בדיקת כפילויות חשובות
        dom_content_loaded_count = content.count('DOMContentLoaded')
        log_count = content.count('log(')
        console_log_count = content.count('console.log')
        header_system_count = content.count('HeaderSystem')
        script_count = content.count('<script')
        link_count = content.count('<link')
        
        print(f"📊 test-header-only.html:")
        print(f"  DOMContentLoaded: {dom_content_loaded_count} מופעים")
        print(f"  log(): {log_count} מופעים")
        print(f"  console.log: {console_log_count} מופעים")
        print(f"  HeaderSystem: {header_system_count} מופעים")
        print(f"  <script>: {script_count} מופעים")
        print(f"  <link>: {link_count} מופעים")

def main():
    """פונקציה ראשית"""
    print("🔍 כלי ניתוח כפילויות HTML מתקדם")
    print("="*50)
    
    # ניתוח כפילויות
    results = analyze_html_duplicates()
    
    # הדפסת דוח
    print_html_duplicate_report(results)
    
    # בדיקה ספציפית
    check_specific_html_duplicates()
    
    print("\n🎉 ניתוח כפילויות HTML הושלם!")

if __name__ == "__main__":
    main()
