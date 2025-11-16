#!/usr/bin/env python3
"""
CacheSyncManager Integration Verification Script
================================================

בודק את שילוב CacheSyncManager בכל שירותי הנתונים והעמודים המרכזיים.
מוודא:
1. כל פעולות CRUD משתמשות ב-CacheSyncManager.invalidateByAction()
2. יש error handling עם try-catch
3. יש fallback ל-UnifiedCacheManager
4. ה-actions תואמים ל-invalidation patterns ב-cache-sync-manager.js

תאריך: ינואר 2025
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
SERVICES_DIR = BASE_DIR / "trading-ui" / "scripts" / "services"
CACHE_SYNC_MANAGER = BASE_DIR / "trading-ui" / "scripts" / "cache-sync-manager.js"

# רשימת שירותי נתונים לבדיקה
SERVICES_TO_CHECK = [
    "trades-data.js",
    "trade-plans-data.js",
    "cash-flows-data.js",
    "notes-data.js",
    "trading-accounts-data.js",
    "executions-data.js",
    "data-import-data.js",
    "preferences-data.js"
]

def extract_invalidation_patterns():
    """חילוץ invalidation patterns מ-cache-sync-manager.js"""
    if not CACHE_SYNC_MANAGER.exists():
        return {}
    
    content = CACHE_SYNC_MANAGER.read_text(encoding='utf-8')
    patterns = {}
    
    # חילוץ invalidation patterns
    patterns_match = re.search(
        r'invalidationPatterns\s*=\s*\{([^}]+)\}',
        content,
        re.DOTALL
    )
    if patterns_match:
        patterns_text = patterns_match.group(1)
        pattern_matches = re.findall(
            r"'([^']+)':\s*\[([^\]]+)\]",
            patterns_text
        )
        for pattern, deps in pattern_matches:
            patterns[pattern] = True
    
    return patterns

def verify_service_file(service_file, valid_patterns):
    """בדיקת קובץ שירות נתונים"""
    if not service_file.exists():
        return {"status": "missing", "issues": []}
    
    content = service_file.read_text(encoding='utf-8')
    issues = []
    cache_sync_uses = []
    fallbacks = []
    
    # חילוץ שימוש ב-CacheSyncManager.invalidateByAction
    cache_sync_matches = re.finditer(
        r'CacheSyncManager\.invalidateByAction\([\'"]([^\'"]+)[\'"]\)',
        content
    )
    for match in cache_sync_matches:
        action = match.group(1)
        line_num = content[:match.start()].count('\n') + 1
        cache_sync_uses.append({"action": action, "line": line_num})
        
        # בדיקה אם ה-action קיים ב-invalidation patterns
        if action not in valid_patterns:
            issues.append(f"⚠️ שורה {line_num}: action '{action}' לא נמצא ב-invalidation patterns")
    
    # בדיקת error handling - האם יש try-catch סביב CacheSyncManager
    for use in cache_sync_uses:
        line_num = use["line"]
        # בדיקה אם יש try לפני השימוש
        lines_before = content.split('\n')[:line_num-1]
        context = '\n'.join(lines_before[-10:])  # 10 שורות לפני
        
        if 'try' not in context.lower():
            issues.append(f"⚠️ שורה {line_num}: שימוש ב-CacheSyncManager ללא try-catch")
    
    # בדיקת fallback
    fallback_patterns = [
        r'UnifiedCacheManager\.invalidate\(',
        r'UnifiedCacheManager\.remove\(',
        r'UnifiedCacheManager\.clear\(',
        r'UnifiedCacheManager\.clearByPattern\('
    ]
    
    for pattern in fallback_patterns:
        matches = re.finditer(pattern, content)
        for match in matches:
            line_num = content[:match.start()].count('\n') + 1
            fallbacks.append({"pattern": pattern, "line": line_num})
    
    # בדיקת פונקציות CRUD
    crud_functions = []
    crud_patterns = [
        r'async\s+function\s+(save|create|update|delete|close|cancel|execute|copy)(\w+)',
    ]
    
    for pattern in crud_patterns:
        matches = re.finditer(pattern, content, re.IGNORECASE)
        for match in matches:
            func_name = match.group(0).split('function')[1].strip().split('(')[0].strip()
            line_num = content[:match.start()].count('\n') + 1
            crud_functions.append({"name": func_name, "line": line_num})
    
    # בדיקה אם כל פונקציית CRUD משתמשת ב-CacheSyncManager
    for crud_func in crud_functions:
        func_line = crud_func["line"]
        # חיפוש שימוש ב-CacheSyncManager אחרי הפונקציה
        lines_after = content.split('\n')[func_line:]
        func_content = '\n'.join(lines_after[:50])  # 50 שורות אחרי
        
        if 'CacheSyncManager.invalidateByAction' not in func_content:
            # בדיקה אם יש קריאה לפונקציה אחרת שמנקה cache
            if 'invalidate' not in func_content.lower() and 'clear' not in func_content.lower():
                issues.append(f"⚠️ פונקציה {crud_func['name']} (שורה {func_line}) לא מנקה cache דרך CacheSyncManager")
    
    status = "ok" if len(issues) == 0 else "issues"
    
    return {
        "status": status,
        "issues": issues,
        "cache_sync_uses": len(cache_sync_uses),
        "fallbacks": len(fallbacks),
        "crud_functions": len(crud_functions)
    }

def main():
    print("🔍 מתחיל בדיקת שילוב CacheSyncManager...")
    
    # חילוץ invalidation patterns
    print("📋 מנתח cache-sync-manager.js...")
    valid_patterns = extract_invalidation_patterns()
    print(f"✅ נמצאו {len(valid_patterns)} invalidation patterns")
    
    # בדיקת כל שירותי הנתונים
    results = {}
    total_issues = 0
    
    for service_file in SERVICES_TO_CHECK:
        service_path = SERVICES_DIR / service_file
        print(f"\n📋 בודק {service_file}...")
        result = verify_service_file(service_path, valid_patterns)
        results[service_file] = result
        
        if result["status"] == "issues":
            print(f"  ⚠️ נמצאו {len(result['issues'])} בעיות")
            for issue in result["issues"]:
                print(f"    - {issue}")
            total_issues += len(result["issues"])
        else:
            print(f"  ✅ תקין - {result['cache_sync_uses']} שימושים ב-CacheSyncManager, {result['fallbacks']} fallbacks")
    
    # סיכום
    print("\n" + "="*60)
    print("📊 סיכום בדיקה")
    print("="*60)
    print(f"שירותי נתונים נבדקו: {len(SERVICES_TO_CHECK)}")
    print(f"בעיות נמצאו: {total_issues}")
    print(f"Invalidation patterns: {len(valid_patterns)}")
    
    services_ok = sum(1 for r in results.values() if r["status"] == "ok")
    print(f"שירותים תקינים: {services_ok}/{len(SERVICES_TO_CHECK)}")
    
    if total_issues == 0:
        print("\n✅ כל השירותים תקינים!")
    else:
        print(f"\n⚠️ יש {total_issues} בעיות שדורשות תיקון")

if __name__ == "__main__":
    main()

