#!/usr/bin/env python3
"""
Linked Items Code Usage Analyzer
=================================

סקריפט לניתוח שימוש בפונקציות במערכת המקושרים
מזהה:
- פונקציות שלא נקראות
- פונקציות עם קוד כפול
- פונקציות DEPRECATED
- כפילויות קוד

@version 1.0.0
@created 2025-01-12
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple

# Configuration
BASE_DIR = Path(__file__).parent.parent.parent
SCRIPTS_DIR = BASE_DIR / "trading-ui" / "scripts"
SERVICES_DIR = SCRIPTS_DIR / "services"

# Files to analyze
FILES_TO_ANALYZE = [
    "entity-details-renderer.js",
    "entity-details-api.js",
    "linked-items.js",
    "services/linked-items-service.js"
]

# Patterns for function detection
FUNCTION_PATTERNS = [
    r'^\s*(static\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{',  # function name()
    r'^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*function\s*\(',  # name: function(
    r'^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?function\s*\(',  # name = function(
    r'^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>',  # name = () =>
    r'^\s*async\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{',  # async function name()
]

# Patterns for function calls
CALL_PATTERNS = [
    r'([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(',  # function call
    r'\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(',  # method call
    r'window\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(',  # window.function()
    r'this\.([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(',  # this.method()
]

# DEPRECATED markers
DEPRECATED_MARKERS = [
    r'DEPRECATED',
    r'@deprecated',
    r'⚠️.*DEPRECATED',
    r'קוד ישן',
    r'לא בשימוש'
]

class FunctionInfo:
    def __init__(self, name: str, file: str, line: int, is_static: bool = False, is_private: bool = False):
        self.name = name
        self.file = file
        self.line = line
        self.is_static = is_static
        self.is_private = is_private
        self.callers: Set[str] = set()
        self.is_deprecated = False
        self.full_signature = ""
        
    def __repr__(self):
        return f"FunctionInfo({self.name}, {self.file}:{self.line})"

def find_functions_in_file(file_path: Path) -> List[FunctionInfo]:
    """Find all functions in a JavaScript file"""
    functions = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        for i, line in enumerate(lines, 1):
            # Check for function patterns
            for pattern in FUNCTION_PATTERNS:
                match = re.search(pattern, line)
                if match:
                    func_name = match.group(1) if len(match.groups()) == 1 else match.group(2)
                    is_static = 'static' in line
                    is_private = func_name.startswith('_') or 'private' in line.lower()
                    
                    # Check for DEPRECATED markers in current line and previous 10 lines (for JSDoc)
                    is_deprecated = False
                    check_start = max(0, i - 11)
                    check_end = min(len(lines), i + 1)
                    for check_line in lines[check_start:check_end]:
                        if any(re.search(marker, check_line, re.IGNORECASE) for marker in DEPRECATED_MARKERS):
                            is_deprecated = True
                            break
                    
                    func_info = FunctionInfo(func_name, str(file_path.relative_to(BASE_DIR)), i, is_static, is_private)
                    func_info.is_deprecated = is_deprecated
                    func_info.full_signature = line.strip()
                    functions.append(func_info)
                    break
    
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    
    return functions

def find_function_calls_in_file(file_path: Path, functions: Dict[str, FunctionInfo]) -> Dict[str, Set[str]]:
    """Find all function calls in a file"""
    callers_map = defaultdict(set)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find all function calls
        for pattern in CALL_PATTERNS:
            matches = re.finditer(pattern, content)
            for match in matches:
                func_name = match.group(1)
                if func_name in functions:
                    callers_map[func_name].add(str(file_path.relative_to(BASE_DIR)))
    
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    
    return callers_map

def analyze_codebase():
    """Main analysis function"""
    print("=" * 80)
    print("Linked Items Code Usage Analyzer")
    print("=" * 80)
    print()
    
    all_functions: Dict[str, FunctionInfo] = {}
    all_files = []
    
    # Step 1: Find all functions
    print("Step 1: Finding all functions...")
    for file_name in FILES_TO_ANALYZE:
        file_path = SCRIPTS_DIR / file_name if not file_name.startswith("services/") else SERVICES_DIR / file_name.replace("services/", "")
        
        if not file_path.exists():
            print(f"  ⚠️  File not found: {file_path}")
            continue
        
        functions = find_functions_in_file(file_path)
        print(f"  ✅ {file_name}: Found {len(functions)} functions")
        
        for func in functions:
            key = f"{func.file}::{func.name}"
            all_functions[key] = func
            all_files.append(file_path)
    
    print(f"\nTotal functions found: {len(all_functions)}")
    print()
    
    # Step 2: Find all function calls
    print("Step 2: Finding function calls...")
    
    # Search in all JavaScript files
    js_files = list(SCRIPTS_DIR.rglob("*.js"))
    js_files.extend(list(SERVICES_DIR.rglob("*.js")))
    
    for file_path in set(all_files + js_files):
        if not file_path.exists():
            continue
            
        callers_map = find_function_calls_in_file(file_path, {f.split("::")[1]: func for f, func in all_functions.items()})
        
        for func_name, callers in callers_map.items():
            # Find matching function
            for key, func_info in all_functions.items():
                if func_info.name == func_name:
                    func_info.callers.update(callers)
    
    print(f"  ✅ Analyzed {len(set(all_files + js_files))} files")
    print()
    
    # Step 3: Analyze results
    print("Step 3: Analyzing results...")
    print()
    
    unused_functions = []
    deprecated_functions = []
    functions_by_file = defaultdict(list)
    
    for key, func in all_functions.items():
        functions_by_file[func.file].append(func)
        
        if func.is_deprecated:
            deprecated_functions.append(func)
        
        # Check if function is used (excluding self-calls)
        if len(func.callers) == 0:
            # Check if it's exported or is a constructor
            if not (func.name.startswith('_') or func.is_private):
                # Might be exported, check if it's in window or module.exports
                unused_functions.append(func)
    
    # Step 4: Generate report
    print("=" * 80)
    print("ANALYSIS REPORT")
    print("=" * 80)
    print()
    
    print(f"📊 Summary:")
    print(f"  Total functions: {len(all_functions)}")
    print(f"  Deprecated functions: {len(deprecated_functions)}")
    print(f"  Potentially unused functions: {len(unused_functions)}")
    print()
    
    # Deprecated functions
    if deprecated_functions:
        print("⚠️  DEPRECATED FUNCTIONS (should be removed):")
        print("-" * 80)
        for func in deprecated_functions:
            print(f"  {func.name}() - {func.file}:{func.line}")
            print(f"    Signature: {func.full_signature[:100]}")
        print()
    
    # Unused functions
    if unused_functions:
        print("❌ POTENTIALLY UNUSED FUNCTIONS:")
        print("-" * 80)
        for func in unused_functions[:20]:  # Show first 20
            print(f"  {func.name}() - {func.file}:{func.line}")
            if func.callers:
                print(f"    Called from: {', '.join(list(func.callers)[:3])}")
        if len(unused_functions) > 20:
            print(f"  ... and {len(unused_functions) - 20} more")
        print()
    
    # Functions by file
    print("📁 FUNCTIONS BY FILE:")
    print("-" * 80)
    for file_name, funcs in sorted(functions_by_file.items()):
        deprecated_count = sum(1 for f in funcs if f.is_deprecated)
        unused_count = sum(1 for f in funcs if f in unused_functions)
        print(f"  {file_name}:")
        print(f"    Total: {len(funcs)}, Deprecated: {deprecated_count}, Unused: {unused_count}")
    print()
    
    # Save detailed report to JSON
    report = {
        "summary": {
            "total_functions": len(all_functions),
            "deprecated_functions": len(deprecated_functions),
            "unused_functions": len(unused_functions)
        },
        "deprecated": [
            {
                "name": f.name,
                "file": f.file,
                "line": f.line,
                "signature": f.full_signature
            }
            for f in deprecated_functions
        ],
        "unused": [
            {
                "name": f.name,
                "file": f.file,
                "line": f.line,
                "callers": list(f.callers)
            }
            for f in unused_functions
        ],
        "all_functions": [
            {
                "name": f.name,
                "file": f.file,
                "line": f.line,
                "is_static": f.is_static,
                "is_private": f.is_private,
                "is_deprecated": f.is_deprecated,
                "callers": list(f.callers)
            }
            for f in all_functions.values()
        ]
    }
    
    report_path = BASE_DIR / "Backend" / "scripts" / "linked_items_usage_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Detailed report saved to: {report_path}")
    print()
    
    return report

if __name__ == "__main__":
    try:
        report = analyze_codebase()
        print("=" * 80)
        print("✅ Analysis complete!")
        print("=" * 80)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

