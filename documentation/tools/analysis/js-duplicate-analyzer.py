#!/usr/bin/env python3
'''
כלי מתקדם לבדיקת כפילויות JavaScript
'''

import os
import re
from pathlib import Path
from collections import defaultdict, Counter

def analyze_js_duplicates():
    """ניתוח כפילויות JavaScript מתקדם"""
    print("🔍 מנתח כפילויות JavaScript...")
    
    # סריקה מקיפה של כל קבצי JavaScript
    js_files = []
    
    # קבצי scripts עיקריים
    scripts_dir = "trading-ui/scripts/"
    if os.path.exists(scripts_dir):
        for file in os.listdir(scripts_dir):
            if file.endswith('.js'):
                js_files.append(os.path.join(scripts_dir, file))
    
    # קבצי modules
    modules_dir = "trading-ui/scripts/modules/"
    if os.path.exists(modules_dir):
        for file in os.listdir(modules_dir):
            if file.endswith('.js'):
                js_files.append(os.path.join(modules_dir, file))
    
    # קבצי services
    services_dir = "trading-ui/scripts/services/"
    if os.path.exists(services_dir):
        for file in os.listdir(services_dir):
            if file.endswith('.js'):
                js_files.append(os.path.join(services_dir, file))
    
    # קבצי modal-configs
    configs_dir = "trading-ui/scripts/modal-configs/"
    if os.path.exists(configs_dir):
        for file in os.listdir(configs_dir):
            if file.endswith('.js'):
                js_files.append(os.path.join(configs_dir, file))
    
    print(f"📁 נמצאו {len(js_files)} קבצי JavaScript לסריקה")
    
    results = {
        'duplicate_functions': defaultdict(list),
        'duplicate_variables': defaultdict(list),
        'duplicate_event_listeners': defaultdict(list),
        'duplicate_console_logs': defaultdict(list),
        'file_stats': {}
    }
    
    for js_file in js_files:
        if not os.path.exists(js_file):
            print(f"⚠️  קובץ לא נמצא: {js_file}")
            continue
            
        print(f"📄 מנתח {js_file}...")
        
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # סטטיסטיקות קובץ
        results['file_stats'][js_file] = {
            'size': len(content),
            'lines': content.count('\n'),
            'functions': len(re.findall(r'function\s+\w+', content)),
            'variables': len(re.findall(r'let\s+\w+|const\s+\w+|var\s+\w+', content)),
            'console_logs': content.count('console.log'),
            'dom_content_loaded': content.count('DOMContentLoaded')
        }
        
        # חיפוש כפילויות functions - שיפור regex
        # מנקה JSDoc comments ו-Function Index לפני ניתוח
        content_clean = re.sub(r'/\*\*[\s\S]*?\*/', '', content)
        content_clean = re.sub(r'//.*$', '', content_clean, flags=re.MULTILINE)
        # מנקה Function Index
        content_clean = re.sub(r'/\*[\s\S]*?FUNCTION INDEX[\s\S]*?\*/', '', content_clean)
        content_clean = re.sub(r'/\*[\s\S]*?Function Index:[\s\S]*?\*/', '', content_clean)
        
        # מוצא function declarations רגילות (לא async)
        functions = re.findall(r'(?<!async\s)function\s+(\w+)', content_clean)
        # מוצא arrow functions
        arrow_functions = re.findall(r'(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>', content_clean)
        # מוצא async functions
        async_functions = re.findall(r'async\s+function\s+(\w+)', content_clean)
        # מוצא class methods (רק methods אמיתיים, לא statements או function calls)
        class_methods = re.findall(r'(\w+)\s*\([^)]*\)\s*\{', content_clean)
        # מסנן keywords, statements ו-function calls
        keywords = {'if', 'for', 'while', 'switch', 'catch', 'try', 'else', 'return', 'throw', 'break', 'continue'}
        # מסנן function calls (לא methods)
        function_calls = re.findall(r'(\w+)\s*\([^)]*\)\s*;', content_clean)
        class_methods = [method for method in class_methods if method not in keywords and method not in function_calls]
        
        all_functions = functions + arrow_functions + async_functions + class_methods
        function_counts = Counter(all_functions)
        
        for func, count in function_counts.items():
            if count > 1:
                results['duplicate_functions'][func].append({
                    'file': js_file,
                    'count': count
                })
        
        # חיפוש כפילויות variables - שיפור regex
        # מוצא let/const/var declarations
        variables = re.findall(r'(let|const|var)\s+(\w+)', content)
        # מוצא destructuring assignments
        destructuring = re.findall(r'(?:let|const|var)\s+\{([^}]+)\}', content)
        # מוצא function parameters
        function_params = re.findall(r'function\s+\w+\s*\(([^)]*)\)', content)
        # מוצא arrow function parameters
        arrow_params = re.findall(r'(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>', content)
        
        all_variables = [var[1] for var in variables]
        # מוסיף destructuring variables
        for dest in destructuring:
            dest_vars = re.findall(r'(\w+)', dest)
            all_variables.extend(dest_vars)
        # מוסיף function parameters
        for params in function_params + arrow_params:
            param_vars = re.findall(r'(\w+)', params)
            all_variables.extend(param_vars)
        
        variable_counts = Counter(all_variables)
        
        for var, count in variable_counts.items():
            if count > 1:
                results['duplicate_variables'][var].append({
                    'file': js_file,
                    'count': count
                })
        
        # חיפוש כפילויות event listeners - שיפור regex
        # מוצא addEventListener calls
        event_listeners = re.findall(r'addEventListener\s*\(\s*[\'"]([^\'"]+)[\'"]', content)
        # מוצא jQuery event handlers
        jquery_events = re.findall(r'\.on\s*\(\s*[\'"]([^\'"]+)[\'"]', content)
        # מוצא inline event handlers
        inline_events = re.findall(r'on(\w+)\s*=', content)
        # מוצא DOMContentLoaded events
        dom_events = re.findall(r'DOMContentLoaded', content)
        
        all_events = event_listeners + jquery_events + inline_events + dom_events
        event_counts = Counter(all_events)
        
        for event, count in event_counts.items():
            if count > 1:
                results['duplicate_event_listeners'][event].append({
                    'file': js_file,
                    'count': count
                })
        
        # חיפוש כפילויות console.log
        console_logs = re.findall(r'console\.log\s*\([^)]*\)', content)
        if len(console_logs) > 10:  # יותר מדי console.log
            results['duplicate_console_logs']['console.log'].append({
                'file': js_file,
                'count': len(console_logs)
            })
    
    return results

def print_js_duplicate_report(results):
    """הדפסת דוח כפילויות JavaScript"""
    print("\n" + "="*60)
    print("📊 דוח כפילויות JavaScript")
    print("="*60)
    
    # סטטיסטיקות קבצים
    print("\n📁 סטטיסטיקות קבצים:")
    for file, stats in results['file_stats'].items():
        print(f"  {file}:")
        print(f"    📏 גודל: {stats['size']:,} תווים")
        print(f"    📄 שורות: {stats['lines']:,}")
        print(f"    🔧 functions: {stats['functions']:,}")
        print(f"    📦 variables: {stats['variables']:,}")
        print(f"    📝 console.log: {stats['console_logs']:,}")
        print(f"    🎯 DOMContentLoaded: {stats['dom_content_loaded']:,}")
    
    # כפילויות functions
    if results['duplicate_functions']:
        print(f"\n🔧 כפילויות functions ({len(results['duplicate_functions'])}):")
        for func, files in list(results['duplicate_functions'].items())[:10]:
            print(f"  {func}():")
            for file_info in files:
                print(f"    📄 {file_info['file']}: {file_info['count']} מופעים")
    
    # כפילויות variables
    if results['duplicate_variables']:
        print(f"\n📦 כפילויות variables ({len(results['duplicate_variables'])}):")
        for var, files in list(results['duplicate_variables'].items())[:10]:
            print(f"  {var}:")
            for file_info in files:
                print(f"    📄 {file_info['file']}: {file_info['count']} מופעים")
    
    # כפילויות event listeners
    if results['duplicate_event_listeners']:
        print(f"\n🎯 כפילויות event listeners ({len(results['duplicate_event_listeners'])}):")
        for event, files in list(results['duplicate_event_listeners'].items())[:10]:
            print(f"  {event}:")
            for file_info in files:
                print(f"    📄 {file_info['file']}: {file_info['count']} מופעים")
    
    # כפילויות console.log
    if results['duplicate_console_logs']:
        print(f"\n📝 כפילויות console.log:")
        for log_type, files in results['duplicate_console_logs'].items():
            print(f"  {log_type}:")
            for file_info in files:
                print(f"    📄 {file_info['file']}: {file_info['count']} מופעים")

def check_specific_js_duplicates():
    """בדיקה ספציפית של כפילויות JavaScript חשובות"""
    print("\n🎯 בדיקה ספציפית של כפילויות JavaScript...")
    
    # בדיקת כפילויות ב-header-system.js
    header_js = "trading-ui/scripts/header-system.js"
    if os.path.exists(header_js):
        with open(header_js, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # בדיקת כפילויות חשובות
        dom_content_loaded_count = content.count('DOMContentLoaded')
        header_system_count = content.count('HeaderSystem')
        window_header_system_count = content.count('window.headerSystem')
        init_count = content.count('.init()')
        
        print(f"📊 DOMContentLoaded: {dom_content_loaded_count} מופעים")
        print(f"📊 HeaderSystem: {header_system_count} מופעים")
        print(f"📊 window.headerSystem: {window_header_system_count} מופעים")
        print(f"📊 .init(): {init_count} מופעים")
    
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
        
        print(f"\n📊 test-header-only.html:")
        print(f"  DOMContentLoaded: {dom_content_loaded_count} מופעים")
        print(f"  log(): {log_count} מופעים")
        print(f"  console.log: {console_log_count} מופעים")
        print(f"  HeaderSystem: {header_system_count} מופעים")

def main():
    """פונקציה ראשית"""
    print("🔍 כלי ניתוח כפילויות JavaScript מתקדם")
    print("="*50)
    
    # ניתוח כפילויות
    results = analyze_js_duplicates()
    
    # הדפסת דוח
    print_js_duplicate_report(results)
    
    # בדיקה ספציפית
    check_specific_js_duplicates()
    
    print("\n🎉 ניתוח כפילויות JavaScript הושלם!")

if __name__ == "__main__":
    main()
