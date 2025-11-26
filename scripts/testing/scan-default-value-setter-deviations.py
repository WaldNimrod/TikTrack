#!/usr/bin/env python3
"""
סריקת סטיות - Default Value Setter
Scan for deviations from Default Value Setter standards

בודק:
1. הגדרות תאריך מקומיות (new Date(), toISOString())
2. טעינות העדפות מקומיות (preferences[...])
3. הגדרות ערכים לוגיים מקומיות (element.value = '...')
4. פונקציות מקומיות להגדרת ברירות מחדל
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple

PROJECT_ROOT = Path(__file__).parent.parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "trading-ui" / "scripts"
HTML_DIR = PROJECT_ROOT / "trading-ui"

def find_html_files():
    """Find all HTML files to scan"""
    html_files = []
    for html_file in HTML_DIR.rglob("*.html"):
        # Skip node_modules and other irrelevant directories
        if "node_modules" in str(html_file) or ".git" in str(html_file):
            continue
        html_files.append(html_file)
    return sorted(html_files)

def find_js_files():
    """Find all JavaScript files to scan"""
    js_files = []
    # Skip test files and backups
    skip_dirs = ["node_modules", ".git", "tests", "backup", "__pycache__"]
    skip_patterns = [r"\.test\.js$", r"\.backup", r"\.old\.", r"\.new\.js$"]
    
    for js_file in SCRIPTS_DIR.rglob("*.js"):
        # Skip if in excluded directory
        if any(skip_dir in str(js_file) for skip_dir in skip_dirs):
            continue
        # Skip if matches skip patterns
        if any(re.search(pattern, str(js_file)) for pattern in skip_patterns):
            continue
        js_files.append(js_file)
    return sorted(js_files)

def scan_date_settings(content: str, file_path: Path) -> List[Dict]:
    """Scan for local date setting patterns"""
    deviations = []
    lines = content.split('\n')
    
    patterns = [
        # Direct date setting: element.value = date string
        (r'\.value\s*=\s*(?:new\s+Date\(\)|today|now)', 'direct_date_assignment'),
        # new Date() usage in value assignment context
        (r'\.value\s*=\s*(?:.*?new\s+Date\(\)|.*?toISOString\(\)|.*?getFullYear\(\))', 'date_calculation'),
        # Date formatting: toISOString, getFullYear, etc.
        (r'(?:toISOString\(\)|getFullYear\(\)|getMonth\(\)|getDate\(\)|getHours\(\)|getMinutes\(\))', 'date_formatting'),
        # ISO string slicing
        (r'\.slice\(0,\s*(?:10|16)\)', 'date_slicing'),
    ]
    
    # Context-aware: only if not already using DefaultValueSetter
    exclude_contexts = [
        'DefaultValueSetter',
        'setCurrentDate',
        'setCurrentDateTime',
        'setAllDefaults',
        'setFormDefaults',
        'assignDefaultDateValue'  # ModalManagerV2 uses DefaultValueSetter
    ]
    
    for line_num, line in enumerate(lines, 1):
        # Skip if already using DefaultValueSetter
        if any(exclude in line for exclude in exclude_contexts):
            continue
        
        for pattern, deviation_type in patterns:
            matches = re.finditer(pattern, line, re.IGNORECASE)
            for match in matches:
                # Check context - make sure it's actually setting a date value
                context_start = max(0, match.start() - 100)
                context_end = min(len(line), match.end() + 100)
                context = line[context_start:context_end]
                
                # More specific check: should be related to date input setting
                if any(keyword in context.lower() for keyword in ['date', 'time', 'value', 'input']):
                    deviations.append({
                        'type': deviation_type,
                        'line': line_num,
                        'code': line.strip(),
                        'match': match.group(),
                        'severity': 'HIGH',
                        'description': f'הגדרת תאריך מקומית במקום DefaultValueSetter'
                    })
    
    return deviations

def scan_preference_loading(content: str, file_path: Path) -> List[Dict]:
    """Scan for local preference loading patterns"""
    deviations = []
    lines = content.split('\n')
    
    patterns = [
        # Direct preference access: preferences['default_*']
        (r"preferences\[['\"](?:default_|preference_)", 'direct_preference_access'),
        # API calls for preferences
        (r"/api/preferences", 'preference_api_call'),
        # PreferencesSystem direct access for defaults
        (r"(?:PreferencesSystem|PreferencesData)\.(?:get|load).*?default", 'preference_system_direct'),
    ]
    
    exclude_contexts = [
        'DefaultValueSetter',
        'setPreferenceValue',
        'setAllDefaults',
        'setFormDefaults'
    ]
    
    for line_num, line in enumerate(lines, 1):
        if any(exclude in line for exclude in exclude_contexts):
            continue
        
        for pattern, deviation_type in patterns:
            if re.search(pattern, line, re.IGNORECASE):
                deviations.append({
                    'type': deviation_type,
                    'line': line_num,
                    'code': line.strip(),
                    'match': re.search(pattern, line, re.IGNORECASE).group(),
                    'severity': 'HIGH',
                    'description': f'טעינת העדפות מקומית במקום DefaultValueSetter.setPreferenceValue'
                })
    
    return deviations

def scan_logical_defaults(content: str, file_path: Path) -> List[Dict]:
    """Scan for local logical default setting patterns"""
    deviations = []
    lines = content.split('\n')
    
    # Common logical defaults
    logical_values = [
        r"'open'", r'"open"',
        r"'closed'", r'"closed"',
        r"'manual'", r'"manual"',
        r"'auto'", r'"auto"',
        r"'active'", r'"active"',
        r"'inactive'", r'"inactive"',
        r"true", r"false",
        r"'true'", r'"true"',
        r"'false'", r'"false"'
    ]
    
    exclude_contexts = [
        'DefaultValueSetter',
        'setLogicalDefault',
        'setAllDefaults',
        'setFormDefaults'
    ]
    
    for line_num, line in enumerate(lines, 1):
        if any(exclude in line for exclude in exclude_contexts):
            continue
        
        # Look for element.value = 'logical_value' or element.checked = true/false
        if re.search(r'\.(?:value|checked)\s*=\s*(?:' + '|'.join(logical_values) + r')', line, re.IGNORECASE):
            # But exclude comparisons (==, ===, !==)
            if re.search(r'[=!]==', line):
                continue
            
            context = line.strip()
            if len(context) > 200:
                context = context[:200] + '...'
            
            deviations.append({
                'type': 'logical_default_assignment',
                'line': line_num,
                'code': context,
                'match': re.search(r'\.(?:value|checked)\s*=\s*(?:' + '|'.join(logical_values) + r')', line, re.IGNORECASE).group(),
                'severity': 'MEDIUM',
                'description': f'הגדרת ערך לוגי מקומית במקום DefaultValueSetter.setLogicalDefault'
            })
    
    return deviations

def scan_local_functions(content: str, file_path: Path) -> List[Dict]:
    """Scan for local functions that set default values"""
    deviations = []
    lines = content.split('\n')
    
    # Function name patterns
    function_patterns = [
        r'function\s+(?:set|init|reset|clear).*?(?:Default|Date|Preference|Value)',
        r'const\s+(?:set|init|reset|clear).*?(?:Default|Date|Preference|Value)\s*=',
        r'async\s+function\s+(?:set|init|reset|clear).*?(?:Default|Date|Preference|Value)',
    ]
    
    exclude_contexts = [
        'DefaultValueSetter',
        'ModalManagerV2.assignDefaultDateValue'  # This uses DefaultValueSetter
    ]
    
    for line_num, line in enumerate(lines, 1):
        if any(exclude in line for exclude in exclude_contexts):
            continue
        
        for pattern in function_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                # Check if function body contains date/preference setting logic
                # Read ahead to check function body
                start_line = line_num
                brace_count = 0
                function_body = ""
                found_open_brace = False
                
                for i in range(start_line - 1, min(start_line + 50, len(lines))):
                    current_line = lines[i]
                    function_body += current_line + "\n"
                    
                    if '{' in current_line:
                        found_open_brace = True
                        brace_count += current_line.count('{')
                    if '}' in current_line:
                        brace_count -= current_line.count('}')
                        if found_open_brace and brace_count == 0:
                            break
                
                # Check if function body contains date/preference logic
                if re.search(r'(?:new\s+Date|toISOString|preferences\[|\.value\s*=\s*(?:["\']open|["\']closed))', function_body, re.IGNORECASE):
                    deviations.append({
                        'type': 'local_default_function',
                        'line': line_num,
                        'code': line.strip(),
                        'match': re.search(pattern, line, re.IGNORECASE).group(),
                        'severity': 'HIGH',
                        'description': f'פונקציה מקומית להגדרת ברירות מחדל'
                    })
                break
    
    return deviations

def scan_file(file_path: Path) -> Dict:
    """Scan a single file for deviations"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {
            'file': str(file_path),
            'error': str(e),
            'deviations': []
        }
    
    all_deviations = []
    all_deviations.extend(scan_date_settings(content, file_path))
    all_deviations.extend(scan_preference_loading(content, file_path))
    all_deviations.extend(scan_logical_defaults(content, file_path))
    all_deviations.extend(scan_local_functions(content, file_path))
    
    return {
        'file': str(file_path),
        'deviations': all_deviations
    }

def check_file_loading(html_file: Path) -> Dict:
    """Check if default-value-setter.js is loaded in HTML file"""
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        has_default_value_setter = 'default-value-setter.js' in content or 'services' in content.lower()
        
        # Check if loaded via package-manifest (services package)
        has_services_package = 'services' in content.lower()
        
        return {
            'file': str(html_file),
            'has_default_value_setter': has_default_value_setter or has_services_package,
            'loaded_via_package': has_services_package,
            'loaded_directly': 'default-value-setter.js' in content
        }
    except Exception as e:
        return {
            'file': str(html_file),
            'error': str(e)
        }

def main():
    print("=" * 80)
    print("🔍 סריקת סטיות - Default Value Setter")
    print("=" * 80)
    print()
    
    # Scan JavaScript files
    print("📋 סריקת קבצי JavaScript...")
    js_files = find_js_files()
    print(f"   נמצאו {len(js_files)} קבצים")
    print()
    
    all_results = []
    total_deviations = 0
    
    for js_file in js_files:
        relative_path = js_file.relative_to(PROJECT_ROOT)
        print(f"Scanning: {relative_path}...")
        result = scan_file(js_file)
        if result['deviations']:
            all_results.append(result)
            total_deviations += len(result['deviations'])
            print(f"  ⚠️  נמצאו {len(result['deviations'])} סטיות")
        elif 'error' in result:
            print(f"  ❌ שגיאה: {result['error']}")
        else:
            print(f"  ✅ אין סטיות")
    
    print()
    print("=" * 80)
    print("📊 SCAN SUMMARY")
    print("=" * 80)
    print(f"Total JS files scanned: {len(js_files)}")
    print(f"Files with deviations: {len(all_results)}")
    print(f"Total deviations: {total_deviations}")
    print()
    
    # Group by type
    by_type = {}
    for result in all_results:
        for dev in result['deviations']:
            dev_type = dev['type']
            if dev_type not in by_type:
                by_type[dev_type] = []
            by_type[dev_type].append({
                'file': result['file'],
                'line': dev['line'],
                'code': dev['code'],
                'severity': dev['severity']
            })
    
    print("Deviations by type:")
    for dev_type, items in sorted(by_type.items()):
        print(f"  - {dev_type}: {len(items)}")
    print()
    
    # Generate report
    report_path = PROJECT_ROOT / "documentation" / "05-REPORTS" / "DEFAULT_VALUE_SETTER_DEVIATIONS_REPORT.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# דוח סטיות - Default Value Setter\n")
        f.write("## Default Value Setter Deviations Report\n\n")
        f.write(f"**תאריך:** {Path(__file__).stat().st_mtime}\n\n")
        f.write(f"**סה\"כ קבצים נסרקים:** {len(js_files)}\n")
        f.write(f"**קבצים עם סטיות:** {len(all_results)}\n")
        f.write(f"**סה\"כ סטיות:** {total_deviations}\n\n")
        f.write("---\n\n")
        
        for result in all_results:
            if not result['deviations']:
                continue
            
            relative_path = Path(result['file']).relative_to(PROJECT_ROOT)
            f.write(f"## {relative_path}\n\n")
            f.write(f"**סה\"כ סטיות:** {len(result['deviations'])}\n\n")
            
            for dev in result['deviations']:
                f.write(f"### {dev['type']} - {dev['severity']}\n\n")
                f.write(f"- **שורה:** {dev['line']}\n")
                f.write(f"- **תיאור:** {dev['description']}\n")
                f.write(f"- **קוד:**\n```javascript\n{dev['code']}\n```\n\n")
    
    print(f"📄 Detailed report saved to: {report_path}")
    print("=" * 80)

if __name__ == "__main__":
    main()

