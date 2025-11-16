#!/usr/bin/env python3
"""
CacheSyncManager Testing Analysis Script
========================================

סריקה מקיפה של שימוש ב-CacheSyncManager בכל שירותי הנתונים והעמודים המרכזיים.
בודק:
1. שימוש ב-CacheSyncManager.invalidateByAction() בכל פעולות CRUD
2. Fallback mechanism ל-UnifiedCacheManager
3. Error handling
4. Invalidation patterns ב-cache-sync-manager.js
5. Dependencies mapping

תאריך: ינואר 2025
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from collections import defaultdict

# הגדרת נתיבים
BASE_DIR = Path(__file__).parent.parent
SERVICES_DIR = BASE_DIR / "trading-ui" / "scripts" / "services"
CACHE_SYNC_MANAGER = BASE_DIR / "trading-ui" / "scripts" / "cache-sync-manager.js"
REPORTS_DIR = BASE_DIR / "documentation" / "reports" / "user-pages-standardization"

# רשימת עמודים מרכזיים (ללא כלי פיתוח)
CENTRAL_PAGES = [
    "index",
    "trades",
    "trade_plans",
    "alerts",
    "tickers",
    "trading_accounts",
    "executions",
    "data_import",
    "cash_flows",
    "notes",
    "research",
    "preferences"
]

# מיפוי עמודים לשירותי נתונים
PAGE_TO_SERVICE = {
    "trades": "trades-data.js",
    "trade_plans": "trade-plans-data.js",
    "alerts": None,  # אין שירות נתונים נפרד
    "tickers": None,  # אין שירות נתונים נפרד
    "trading_accounts": "trading-accounts-data.js",
    "executions": "executions-data.js",
    "data_import": "data-import-data.js",
    "cash_flows": "cash-flows-data.js",
    "notes": "notes-data.js",
    "research": None,
    "preferences": "preferences-data.js",
    "index": None  # Dashboard - אין שירות נתונים נפרד
}

class CacheSyncAnalysis:
    def __init__(self):
        self.findings = defaultdict(list)
        self.service_analysis = {}
        self.cache_sync_patterns = {}
        self.dependencies = {}
        self.issues = []
        self.recommendations = []
        
    def analyze_cache_sync_manager(self):
        """ניתוח cache-sync-manager.js"""
        if not CACHE_SYNC_MANAGER.exists():
            self.issues.append("❌ cache-sync-manager.js לא נמצא")
            return
            
        content = CACHE_SYNC_MANAGER.read_text(encoding='utf-8')
        
        # חילוץ invalidation patterns
        patterns_match = re.search(
            r'invalidationPatterns\s*=\s*\{([^}]+)\}',
            content,
            re.DOTALL
        )
        if patterns_match:
            patterns_text = patterns_match.group(1)
            # חילוץ כל ה-patterns
            pattern_matches = re.findall(
                r"'([^']+)':\s*\[([^\]]+)\]",
                patterns_text
            )
            for pattern, deps in pattern_matches:
                deps_list = [d.strip().strip("'\"") for d in deps.split(',')]
                self.cache_sync_patterns[pattern] = deps_list
        
        # חילוץ dependencies
        deps_match = re.search(
            r'dependencies\s*=\s*\{([^}]+)\}',
            content,
            re.DOTALL
        )
        if deps_match:
            deps_text = deps_match.group(1)
            deps_matches = re.findall(
                r"'([^']+)':\s*\[([^\]]+)\]",
                deps_text
            )
            for key, deps in deps_matches:
                deps_list = [d.strip().strip("'\"") for d in deps.split(',')]
                self.dependencies[key] = deps_list
    
    def analyze_service_file(self, service_file: Path, page_name: str):
        """ניתוח קובץ שירות נתונים"""
        if not service_file.exists():
            return None
            
        content = service_file.read_text(encoding='utf-8')
        analysis = {
            "file": str(service_file.relative_to(BASE_DIR)),
            "page": page_name,
            "crud_functions": [],
            "cache_sync_usage": [],
            "fallback_usage": [],
            "error_handling": [],
            "issues": [],
            "recommendations": []
        }
        
        # חילוץ פונקציות CRUD
        crud_patterns = [
            (r'async\s+function\s+(save|create|update|delete|close|cancel|execute|copy)(\w+)', 'CRUD'),
            (r'async\s+function\s+(\w+)(Trade|TradePlan|Alert|Ticker|Account|Execution|CashFlow|Note)', 'CRUD'),
        ]
        
        for pattern, func_type in crud_patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                func_name = match.group(0).split('function')[1].strip().split('(')[0].strip()
                analysis["crud_functions"].append(func_name)
        
        # בדיקת שימוש ב-CacheSyncManager.invalidateByAction
        cache_sync_matches = re.finditer(
            r'CacheSyncManager\.invalidateByAction\([\'"]([^\'"]+)[\'"]\)',
            content
        )
        for match in cache_sync_matches:
            action = match.group(1)
            line_num = content[:match.start()].count('\n') + 1
            analysis["cache_sync_usage"].append({
                "action": action,
                "line": line_num,
                "context": self._get_context(content, match.start(), match.end())
            })
        
        # בדיקת fallback ל-UnifiedCacheManager
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
                analysis["fallback_usage"].append({
                    "pattern": pattern,
                    "line": line_num,
                    "context": self._get_context(content, match.start(), match.end())
                })
        
        # בדיקת error handling
        error_handling_patterns = [
            (r'try\s*\{', 'try'),
            (r'catch\s*\([^)]+\)\s*\{', 'catch'),
        ]
        
        for pattern, handler_type in error_handling_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                line_num = content[:match.start()].count('\n') + 1
                analysis["error_handling"].append({
                    "type": handler_type,
                    "line": line_num
                })
        
        # זיהוי בעיות
        if len(analysis["crud_functions"]) > 0 and len(analysis["cache_sync_usage"]) == 0:
            analysis["issues"].append("❌ אין שימוש ב-CacheSyncManager.invalidateByAction בפונקציות CRUD")
        
        if len(analysis["fallback_usage"]) > 0:
            # בדיקה אם fallback נמצא בתוך try-catch של CacheSyncManager
            for fallback in analysis["fallback_usage"]:
                # בדיקה פשוטה - אם יש CacheSyncManager לפני זה
                fallback_line = fallback["line"]
                before_text = '\n'.join(content.split('\n')[:fallback_line-1])
                if 'CacheSyncManager' not in before_text[-500:]:  # 500 תווים אחרונים
                    analysis["issues"].append(f"⚠️ Fallback ל-UnifiedCacheManager בשורה {fallback_line} ללא try-catch של CacheSyncManager")
        
        # המלצות
        if len(analysis["issues"]) > 0:
            analysis["recommendations"].append("להוסיף שימוש ב-CacheSyncManager.invalidateByAction בכל פונקציות CRUD")
            analysis["recommendations"].append("להוסיף error handling עם fallback ל-UnifiedCacheManager")
        
        return analysis
    
    def _get_context(self, content: str, start: int, end: int, context_lines: int = 3) -> str:
        """קבלת הקשר מסביב למציאה"""
        lines = content.split('\n')
        start_line = content[:start].count('\n')
        end_line = content[:end].count('\n')
        
        context_start = max(0, start_line - context_lines)
        context_end = min(len(lines), end_line + context_lines + 1)
        
        context = '\n'.join(lines[context_start:context_end])
        return context
    
    def analyze_crud_response_handler(self):
        """ניתוח CRUDResponseHandler"""
        handler_file = BASE_DIR / "trading-ui" / "scripts" / "services" / "crud-response-handler.js"
        if not handler_file.exists():
            self.issues.append("❌ crud-response-handler.js לא נמצא")
            return
        
        content = handler_file.read_text(encoding='utf-8')
        
        # בדיקת שימוש ב-CacheSyncManager ב-refreshEntityTables
        if 'CacheSyncManager.invalidateByAction' in content:
            # חילוץ entity mapping
            entity_map_match = re.search(
                r'actionMap\s*=\s*\{([^}]+)\}',
                content,
                re.DOTALL
            )
            if entity_map_match:
                entity_map_text = entity_map_match.group(1)
                entity_mappings = {}
                for match in re.finditer(r"'([^']+)':\s*'([^']+)'", entity_map_text):
                    entity_mappings[match.group(1)] = match.group(2)
                
                self.findings['crud_response_handler'] = {
                    "uses_cache_sync": True,
                    "entity_mappings": entity_mappings,
                    "has_fallback": '_invalidateCacheDirectly' in content
                }
        else:
            self.issues.append("⚠️ CRUDResponseHandler לא משתמש ב-CacheSyncManager")
    
    def analyze_all_services(self):
        """ניתוח כל שירותי הנתונים"""
        for page_name, service_file in PAGE_TO_SERVICE.items():
            if service_file is None:
                continue
                
            service_path = SERVICES_DIR / service_file
            analysis = self.analyze_service_file(service_path, page_name)
            if analysis:
                self.service_analysis[page_name] = analysis
    
    def generate_report(self) -> str:
        """יצירת דוח מפורט"""
        report = []
        report.append("# דוח בדיקות CacheSyncManager Testing")
        report.append("")
        report.append("**תאריך**: ינואר 2025")
        report.append("**מטרה**: בדיקה מקיפה של שימוש ב-CacheSyncManager בכל שירותי הנתונים והעמודים המרכזיים")
        report.append("")
        report.append("---")
        report.append("")
        
        # סיכום כללי
        report.append("## סיכום כללי")
        report.append("")
        report.append(f"- **עמודים נסרקו**: {len(self.service_analysis)}")
        report.append(f"- **שירותי נתונים נסרקו**: {len([s for s in self.service_analysis.values() if s])}")
        report.append(f"- **Invalidation patterns**: {len(self.cache_sync_patterns)}")
        report.append(f"- **Dependencies**: {len(self.dependencies)}")
        report.append(f"- **בעיות נמצאו**: {len(self.issues)}")
        report.append("")
        
        # CacheSyncManager Analysis
        report.append("## ניתוח CacheSyncManager")
        report.append("")
        report.append(f"### Invalidation Patterns ({len(self.cache_sync_patterns)})")
        report.append("")
        for pattern, deps in sorted(self.cache_sync_patterns.items()):
            report.append(f"- **{pattern}**: {', '.join(deps)}")
        report.append("")
        
        report.append(f"### Dependencies ({len(self.dependencies)})")
        report.append("")
        for key, deps in sorted(self.dependencies.items()):
            report.append(f"- **{key}**: {', '.join(deps)}")
        report.append("")
        
        # ניתוח שירותי נתונים
        report.append("## ניתוח שירותי נתונים")
        report.append("")
        
        for page_name, analysis in sorted(self.service_analysis.items()):
            report.append(f"### {page_name.upper()}")
            report.append("")
            report.append(f"**קובץ**: `{analysis['file']}`")
            report.append("")
            report.append(f"**פונקציות CRUD**: {len(analysis['crud_functions'])}")
            for func in analysis['crud_functions']:
                report.append(f"  - `{func}`")
            report.append("")
            
            report.append(f"**שימוש ב-CacheSyncManager**: {len(analysis['cache_sync_usage'])}")
            for usage in analysis['cache_sync_usage']:
                report.append(f"  - שורה {usage['line']}: `{usage['action']}`")
            report.append("")
            
            if analysis['fallback_usage']:
                report.append(f"**Fallback ל-UnifiedCacheManager**: {len(analysis['fallback_usage'])}")
                for fallback in analysis['fallback_usage']:
                    report.append(f"  - שורה {fallback['line']}: {fallback['pattern']}")
                report.append("")
            
            if analysis['issues']:
                report.append("**בעיות**:")
                for issue in analysis['issues']:
                    report.append(f"  - {issue}")
                report.append("")
            
            if analysis['recommendations']:
                report.append("**המלצות**:")
                for rec in analysis['recommendations']:
                    report.append(f"  - {rec}")
                report.append("")
            
            report.append("---")
            report.append("")
        
        # CRUDResponseHandler Analysis
        report.append("## ניתוח CRUDResponseHandler")
        report.append("")
        if 'crud_response_handler' in self.findings:
            handler_info = self.findings['crud_response_handler']
            report.append(f"- **משתמש ב-CacheSyncManager**: {'✅ כן' if handler_info['uses_cache_sync'] else '❌ לא'}")
            report.append(f"- **יש Fallback**: {'✅ כן' if handler_info['has_fallback'] else '❌ לא'}")
            report.append(f"- **Entity Mappings**: {len(handler_info['entity_mappings'])}")
            report.append("")
            report.append("**מיפוי ישויות לפעולות**:")
            for entity, action in sorted(handler_info['entity_mappings'].items()):
                report.append(f"  - `{entity}` → `{action}`")
        else:
            report.append("⚠️ לא נסרק")
        report.append("")
        
        # בעיות כלליות
        if self.issues:
            report.append("## בעיות כלליות")
            report.append("")
            for issue in self.issues:
                report.append(f"- {issue}")
            report.append("")
        
        # המלצות כלליות
        report.append("## המלצות כלליות")
        report.append("")
        report.append("1. **וידוא error handling**: כל קריאה ל-CacheSyncManager.invalidateByAction צריכה להיות בתוך try-catch עם fallback")
        report.append("2. **לוגים**: הוספת logging לפעולות cache invalidation")
        report.append("3. **בדיקות**: יצירת unit tests ו-integration tests לכל פעולות CRUD")
        report.append("4. **תיעוד**: עדכון תיעוד עם דוגמאות שימוש")
        report.append("")
        
        return '\n'.join(report)

def main():
    print("🔍 מתחיל סריקת CacheSyncManager Testing...")
    
    analyzer = CacheSyncAnalysis()
    
    # ניתוח CacheSyncManager
    print("📋 מנתח cache-sync-manager.js...")
    analyzer.analyze_cache_sync_manager()
    
    # ניתוח שירותי נתונים
    print("📋 מנתח שירותי נתונים...")
    analyzer.analyze_all_services()
    
    # ניתוח CRUDResponseHandler
    print("📋 מנתח CRUDResponseHandler...")
    analyzer.analyze_crud_response_handler()
    
    # יצירת דוח
    print("📝 יוצר דוח...")
    report = analyzer.generate_report()
    
    # שמירת דוח
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report_file = REPORTS_DIR / "CACHE_SYNC_TESTING_REPORT.md"
    report_file.write_text(report, encoding='utf-8')
    
    print(f"✅ דוח נשמר ב: {report_file}")
    print(f"📊 נמצאו {len(analyzer.issues)} בעיות")
    print(f"📊 נסרקו {len(analyzer.service_analysis)} שירותי נתונים")

if __name__ == "__main__":
    main()

