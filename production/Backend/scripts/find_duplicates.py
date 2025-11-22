#!/usr/bin/env python3
"""
Linked Items Code Duplicates Finder
====================================

מזהה כפילויות קוד במערכת המקושרים

@version 1.0.0
@created 2025-01-12
"""

import os
import re
from pathlib import Path
from collections import defaultdict
from difflib import SequenceMatcher

BASE_DIR = Path(__file__).parent.parent.parent
SCRIPTS_DIR = BASE_DIR / "trading-ui" / "scripts"

FILES_TO_ANALYZE = [
    "entity-details-renderer.js",
    "entity-details-api.js",
    "linked-items.js",
    "services/linked-items-service.js"
]

def similarity(a: str, b: str) -> float:
    """Calculate similarity between two strings"""
    return SequenceMatcher(None, a, b).ratio()

def extract_function_body(file_path: Path, func_name: str) -> str:
    """Extract function body from file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find function definition
        pattern = rf'(?:static\s+)?{re.escape(func_name)}\s*\([^)]*\)\s*\{{'
        match = re.search(pattern, content)
        
        if not match:
            return ""
        
        start = match.end()
        brace_count = 1
        i = start
        
        while i < len(content) and brace_count > 0:
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
            i += 1
        
        return content[start:i-1].strip()
    
    except Exception as e:
        print(f"Error extracting function {func_name} from {file_path}: {e}")
        return ""

def find_duplicate_functions():
    """Find duplicate functions across files"""
    print("=" * 80)
    print("Linked Items Code Duplicates Finder")
    print("=" * 80)
    print()
    
    functions_by_name = defaultdict(list)
    
    # Collect all functions
    for file_name in FILES_TO_ANALYZE:
        file_path = SCRIPTS_DIR / file_name if not file_name.startswith("services/") else SCRIPTS_DIR / "services" / file_name.replace("services/", "")
        
        if not file_path.exists():
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for i, line in enumerate(lines, 1):
                # Match function definitions
                patterns = [
                    r'^\s*(static\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{',
                    r'^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*function\s*\(',
                    r'^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s+)?function\s*\(',
                    r'^\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\([^)]*\)\s*=>',
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, line)
                    if match:
                        func_name = match.group(2) if len(match.groups()) >= 2 else match.group(1)
                        if func_name and not func_name.startswith('_') or func_name in ['_getFilterConfig', '_renderLinkedItemRow']:
                            functions_by_name[func_name].append({
                                'name': func_name,
                                'file': str(file_path.relative_to(BASE_DIR)),
                                'line': i
                            })
                        break
        
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
    
    # Find duplicates
    duplicates = []
    for func_name, occurrences in functions_by_name.items():
        if len(occurrences) > 1:
            duplicates.append({
                'name': func_name,
                'occurrences': occurrences
            })
    
    print(f"Found {len(duplicates)} functions with duplicate names:")
    print()
    
    for dup in duplicates:
        print(f"  {dup['name']}() - appears in {len(dup['occurrences'])} files:")
        for occ in dup['occurrences']:
            print(f"    - {occ['file']}:{occ['line']}")
    print()
    
    # Known duplicates to check
    known_duplicates = {
        'formatLinkedItemName': {
            'service': 'services/linked-items-service.js',
            'duplicates': ['entity-details-renderer.js']
        },
        'getLinkedItemIcon': {
            'service': 'services/linked-items-service.js',
            'duplicates': ['linked-items.js', 'entity-details-renderer.js']
        },
        'getLinkedItemColor': {
            'service': 'services/linked-items-service.js',
            'duplicates': ['entity-details-renderer.js']
        },
        'generateLinkedItemActions': {
            'service': 'services/linked-items-service.js',
            'duplicates': ['entity-details-renderer.js']
        },
        'sortLinkedItems': {
            'service': 'services/linked-items-service.js',
            'duplicates': ['entity-details-renderer.js']
        },
        'renderEmptyLinkedItems': {
            'service': 'services/linked-items-service.js',
            'duplicates': ['entity-details-renderer.js', 'linked-items.js']
        }
    }
    
    print("=" * 80)
    print("KNOWN DUPLICATES TO REMOVE")
    print("=" * 80)
    print()
    
    for func_name, info in known_duplicates.items():
        print(f"✅ {func_name}()")
        print(f"   Keep: {info['service']}")
        print(f"   Remove from: {', '.join(info['duplicates'])}")
        print()
    
    return duplicates, known_duplicates

if __name__ == "__main__":
    try:
        duplicates, known_duplicates = find_duplicate_functions()
        print("=" * 80)
        print("✅ Duplicate analysis complete!")
        print("=" * 80)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        exit(1)


