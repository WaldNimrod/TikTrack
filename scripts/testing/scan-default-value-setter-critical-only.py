#!/usr/bin/env python3
"""
סריקת סטיות קריטיות - Default Value Setter
Scan for CRITICAL deviations only - focus on showAddModal functions

בודק רק סטיות קריטיות:
1. הגדרות תאריך בפונקציות showAddModal
2. טעינות העדפות בפונקציות showAddModal
3. הגדרות ערכים לוגיים בפונקציות showAddModal
4. פונקציות מקומיות להגדרת ברירות מחדל
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple

PROJECT_ROOT = Path(__file__).parent.parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "trading-ui" / "scripts"

def find_js_files():
    """Find all JavaScript files to scan"""
    js_files = []
    skip_dirs = ["node_modules", ".git", "tests", "backup", "__pycache__"]
    skip_patterns = [r"\.test\.js$", r"\.backup", r"\.old\.", r"\.new\.js$"]
    
    for js_file in SCRIPTS_DIR.rglob("*.js"):
        if any(skip_dir in str(js_file) for skip_dir in skip_dirs):
            continue
        if any(re.search(pattern, str(js_file)) for pattern in skip_patterns):
            continue
        js_files.append(js_file)
    return sorted(js_files)

def find_show_add_modal_function(content: str, file_path: Path) -> List[Tuple[int, int]]:
    """Find showAddModal functions and return their line ranges"""
    lines = content.split('\n')
    function_ranges = []
    
    # Patterns for function definitions
    patterns = [
        r'function\s+(?:show|open)(?:Add|Edit).*?Modal',
        r'async\s+function\s+(?:show|open)(?:Add|Edit).*?Modal',
        r'(?:show|open)(?:Add|Edit).*?Modal\s*=\s*(?:async\s+)?function',
        r'const\s+(?:show|open)(?:Add|Edit).*?Modal\s*=\s*(?:async\s+)?\(?',
    ]
    
    in_function = False
    function_start = 0
    brace_count = 0
    current_function_name = None
    
    for line_num, line in enumerate(lines, 1):
        # Check if this line starts a showAddModal function
        is_function_start = False
        for pattern in patterns:
            if re.search(pattern, line, re.IGNORECASE):
                is_function_start = True
                current_function_name = re.search(pattern, line, re.IGNORECASE).group()
                break
        
        if is_function_start:
            if in_function:
                # Close previous function
                function_ranges.append((function_start, line_num - 1))
            in_function = True
            function_start = line_num
            brace_count = 0
            # Count opening braces on this line
            brace_count = line.count('{') - line.count('}')
            continue
        
        if in_function:
            brace_count += line.count('{') - line.count('}')
            if brace_count <= 0 and '{' not in line and '}' in line:
                # Function ended
                function_ranges.append((function_start, line_num))
                in_function = False
                function_start = 0
                brace_count = 0
    
    # If function wasn't closed, include until end of file
    if in_function:
        function_ranges.append((function_start, len(lines)))
    
    return function_ranges

def scan_function_for_deviations(content: str, start_line: int, end_line: int, function_name: str) -> List[Dict]:
    """Scan a specific function for default value setting deviations"""
    lines = content.split('\n')
    function_lines = lines[start_line - 1:end_line]
    deviations = []
    
    exclude_contexts = [
        'DefaultValueSetter',
        'setCurrentDate',
        'setCurrentDateTime',
        'setPreferenceValue',
        'setLogicalDefault',
        'setAllDefaults',
        'setFormDefaults',
        'assignDefaultDateValue'  # ModalManagerV2 uses DefaultValueSetter
    ]
    
    for relative_line, line in enumerate(function_lines, start=start_line):
        # Skip if already using DefaultValueSetter
        if any(exclude in line for exclude in exclude_contexts):
            continue
        
        # 1. Check for local date setting in context of form field assignment
        # Look for: element.value = date calculation OR element = getElementById and then .value = date
        if re.search(r'getElementById\([^)]+\)[^;]*\.value\s*=\s*(?:new\s+Date|toISOString|getFullYear|getMonth|getDate)', line, re.IGNORECASE):
            deviations.append({
                'type': 'date_setting_in_modal',
                'line': relative_line,
                'code': line.strip(),
                'function': function_name,
                'severity': 'HIGH',
                'description': 'הגדרת תאריך מקומית בפונקציה שפותחת מודל'
            })
        
        # 2. Check for preference loading in context of form field
        if re.search(r'(?:preferences\[|PreferencesSystem|PreferencesData).*?default', line, re.IGNORECASE):
            if '.value' in line or 'getElementById' in line:
                deviations.append({
                    'type': 'preference_loading_in_modal',
                    'line': relative_line,
                    'code': line.strip(),
                    'function': function_name,
                    'severity': 'HIGH',
                    'description': 'טעינת העדפות מקומית בפונקציה שפותחת מודל'
                })
        
        # 3. Check for logical default setting
        if re.search(r'\.(?:value|checked)\s*=\s*(?:["\'](?:open|closed|manual|auto|active|inactive)|true|false)', line, re.IGNORECASE):
            if not re.search(r'[=!]==', line):  # Not a comparison
                if 'getElementById' in line or any(field in line.lower() for field in ['status', 'source', 'type']):
                    deviations.append({
                        'type': 'logical_default_in_modal',
                        'line': relative_line,
                        'code': line.strip(),
                        'function': function_name,
                        'severity': 'HIGH',
                        'description': 'הגדרת ערך לוגי מקומי בפונקציה שפותחת מודל'
                    })
        
        # 4. Check for date formatting that sets a value (not just logging)
        if re.search(r'toISOString\(\)\.(?:slice|split)', line, re.IGNORECASE):
            if '.value' in line or 'getElementById' in line:
                deviations.append({
                    'type': 'date_formatting_in_modal',
                    'line': relative_line,
                    'code': line.strip(),
                    'function': function_name,
                    'severity': 'HIGH',
                    'description': 'פורמט תאריך מקומי בפונקציה שפותחת מודל'
                })
    
    return deviations

def scan_file(file_path: Path) -> Dict:
    """Scan a single file for critical deviations in showAddModal functions"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {
            'file': str(file_path),
            'error': str(e),
            'deviations': []
        }
    
    # Find all showAddModal functions
    function_ranges = find_show_add_modal_function(content, file_path)
    
    if not function_ranges:
        return {
            'file': str(file_path),
            'deviations': []
        }
    
    all_deviations = []
    lines = content.split('\n')
    
    for start_line, end_line in function_ranges:
        # Get function name
        function_line = lines[start_line - 1]
        function_name_match = re.search(r'(?:function|const|async\s+function)\s+(\w+)', function_line)
        function_name = function_name_match.group(1) if function_name_match else f"function_at_line_{start_line}"
        
        # Scan function for deviations
        deviations = scan_function_for_deviations(content, start_line, end_line, function_name)
        all_deviations.extend(deviations)
    
    return {
        'file': str(file_path),
        'deviations': all_deviations,
        'functions_found': len(function_ranges)
    }

def main():
    print("=" * 80)
    print("🔍 סריקת סטיות קריטיות - Default Value Setter (showAddModal בלבד)")
    print("=" * 80)
    print()
    
    js_files = find_js_files()
    print(f"📋 סריקת {len(js_files)} קבצי JavaScript...")
    print()
    
    all_results = []
    total_deviations = 0
    
    for js_file in js_files:
        relative_path = js_file.relative_to(PROJECT_ROOT)
        result = scan_file(js_file)
        
        if result.get('functions_found', 0) > 0:
            print(f"Scanning: {relative_path}... ({result.get('functions_found', 0)} functions)")
            if result['deviations']:
                all_results.append(result)
                total_deviations += len(result['deviations'])
                print(f"  ⚠️  נמצאו {len(result['deviations'])} סטיות קריטיות")
            elif 'error' not in result:
                print(f"  ✅ אין סטיות")
    
    print()
    print("=" * 80)
    print("📊 SCAN SUMMARY - CRITICAL DEVIATIONS ONLY")
    print("=" * 80)
    print(f"Total JS files scanned: {len(js_files)}")
    print(f"Files with showAddModal functions: {len([r for r in all_results if r.get('functions_found', 0) > 0])}")
    print(f"Files with deviations: {len(all_results)}")
    print(f"Total CRITICAL deviations: {total_deviations}")
    print()
    
    # Group by type
    by_type = {}
    for result in all_results:
        for dev in result['deviations']:
            dev_type = dev['type']
            if dev_type not in by_type:
                by_type[dev_type] = []
            by_type[dev_type].append(dev)
    
    print("Deviations by type:")
    for dev_type, items in sorted(by_type.items()):
        print(f"  - {dev_type}: {len(items)}")
    print()
    
    # Generate report
    report_path = PROJECT_ROOT / "documentation" / "05-REPORTS" / "DEFAULT_VALUE_SETTER_CRITICAL_DEVIATIONS_REPORT.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# דוח סטיות קריטיות - Default Value Setter\n")
        f.write("## Default Value Setter Critical Deviations Report\n\n")
        f.write("**הערה:** דוח זה כולל רק סטיות קריטיות בפונקציות showAddModal\n\n")
        f.write(f"**סה\"כ קבצים נסרקים:** {len(js_files)}\n")
        f.write(f"**קבצים עם סטיות קריטיות:** {len(all_results)}\n")
        f.write(f"**סה\"כ סטיות קריטיות:** {total_deviations}\n\n")
        f.write("---\n\n")
        
        for result in all_results:
            if not result['deviations']:
                continue
            
            relative_path = Path(result['file']).relative_to(PROJECT_ROOT)
            f.write(f"## {relative_path}\n\n")
            f.write(f"**סה\"כ סטיות קריטיות:** {len(result['deviations'])}\n")
            f.write(f"**פונקציות שנסרקו:** {result.get('functions_found', 0)}\n\n")
            
            # Group by function
            by_function = {}
            for dev in result['deviations']:
                func_name = dev.get('function', 'unknown')
                if func_name not in by_function:
                    by_function[func_name] = []
                by_function[func_name].append(dev)
            
            for func_name, devs in sorted(by_function.items()):
                f.write(f"### פונקציה: {func_name}\n\n")
                for dev in devs:
                    f.write(f"#### {dev['type']} - {dev['severity']}\n\n")
                    f.write(f"- **שורה:** {dev['line']}\n")
                    f.write(f"- **תיאור:** {dev['description']}\n")
                    f.write(f"- **קוד:**\n```javascript\n{dev['code']}\n```\n\n")
    
    print(f"📄 Detailed report saved to: {report_path}")
    print("=" * 80)

if __name__ == "__main__":
    main()

