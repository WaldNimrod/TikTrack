#!/usr/bin/env python3
"""
סקריפט מתקדם לניתוח פונקציות לא בשימוש
TikTrack - Advanced Function Usage Analyzer
"""

import os
import re
import json
import ast
from datetime import datetime
from collections import defaultdict, Counter
from pathlib import Path

class AdvancedFunctionAnalyzer:
    def __init__(self, project_root="."):
        self.project_root = Path(project_root)
        self.trading_ui_path = self.project_root / "trading-ui"
        
        # מיפוי פונקציות גלובליות
        self.global_function_mappings = {
            'window': {},
            'document': {},
            'console': {},
            'localStorage': {},
            'sessionStorage': {},
            'JSON': {},
            'Math': {},
            'Array': {},
            'Object': {},
            'String': {},
            'Number': {},
            'Date': {}
        }
        
        # פונקציות ידועות בשימוש
        self.known_used_functions = set()
        
        # פונקציות שדורשות בדיקה מיוחדת
        self.special_functions = {
            'init', 'initialize', 'setup', 'start', 'load', 'render',
            'update', 'refresh', 'reload', 'save', 'delete', 'create',
            'show', 'hide', 'toggle', 'open', 'close', 'submit',
            'validate', 'check', 'test', 'debug', 'log'
        }

    def extract_global_assignments(self, file_path):
        """חילוץ הגדרות גלובליות מקובץ"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return {}

        global_assignments = {}
        
        # חיפוש הגדרות window
        window_patterns = [
            r'window\.(\w+)\s*=\s*(\w+)',
            r'window\[["\'](\w+)["\']\]\s*=\s*(\w+)',
        ]
        
        for pattern in window_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                global_name = match.group(1)
                function_name = match.group(2)
                global_assignments[function_name] = global_name
        
        return global_assignments

    def find_indirect_calls(self, file_path, function_name):
        """חיפוש קריאות עקיפות לפונקציה"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return []

        indirect_calls = []
        
        # חיפוש קריאות דרך מערכות שונות
        patterns = [
            # קריאות דרך מערכת האירועים
            rf'addEventListener\s*\(\s*["\'](\w+)["\']\s*,\s*{re.escape(function_name)}',
            rf'addEventListener\s*\(\s*["\'](\w+)["\']\s*,\s*\([^)]*\)\s*=>\s*{re.escape(function_name)}',
            
            # קריאות דרך setTimeout/setInterval
            rf'setTimeout\s*\(\s*{re.escape(function_name)}',
            rf'setInterval\s*\(\s*{re.escape(function_name)}',
            
            # קריאות דרך מערכת המודלים
            rf'new\s+bootstrap\.Modal.*{re.escape(function_name)}',
            rf'bootstrap\.Modal\.getInstance.*{re.escape(function_name)}',
            
            # קריאות דרך מערכת הפילטרים
            rf'filter.*{re.escape(function_name)}',
            rf'sort.*{re.escape(function_name)}',
            
            # קריאות דרך מערכת הניווט
            rf'onclick.*{re.escape(function_name)}',
            rf'onchange.*{re.escape(function_name)}',
            rf'onsubmit.*{re.escape(function_name)}',
            
            # קריאות דרך מערכת ה-AJAX
            rf'fetch.*then.*{re.escape(function_name)}',
            rf'XMLHttpRequest.*{re.escape(function_name)}',
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                indirect_calls.append({
                    'type': 'indirect',
                    'pattern': pattern,
                    'line': content[:match.start()].count('\n') + 1,
                    'context': match.group(0)[:100]
                })
        
        return indirect_calls

    def analyze_function_complexity(self, file_path, function_name):
        """ניתוח מורכבות הפונקציה"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return {'complexity': 'unknown', 'lines': 0, 'calls_other_functions': 0}

        # חיפוש הפונקציה בקובץ
        function_pattern = rf'function\s+{re.escape(function_name)}\s*\([^)]*\)\s*\{{'
        match = re.search(function_pattern, content)
        
        if not match:
            return {'complexity': 'unknown', 'lines': 0, 'calls_other_functions': 0}
        
        # חישוב מספר השורות
        start_pos = match.end()
        brace_count = 1
        pos = start_pos
        
        while pos < len(content) and brace_count > 0:
            if content[pos] == '{':
                brace_count += 1
            elif content[pos] == '}':
                brace_count -= 1
            pos += 1
        
        function_content = content[start_pos:pos-1]
        lines = function_content.count('\n') + 1
        
        # חיפוש קריאות לפונקציות אחרות
        other_function_calls = len(re.findall(r'\b\w+\s*\(', function_content))
        
        # קביעת מורכבות
        if lines < 10:
            complexity = 'simple'
        elif lines < 50:
            complexity = 'medium'
        else:
            complexity = 'complex'
        
        return {
            'complexity': complexity,
            'lines': lines,
            'calls_other_functions': other_function_calls
        }

    def check_function_importance(self, function_name, file_path):
        """בדיקת חשיבות הפונקציה"""
        importance_score = 0
        reasons = []
        
        # בדיקה לפי שם הפונקציה
        if any(keyword in function_name.lower() for keyword in ['init', 'setup', 'start', 'load']):
            importance_score += 3
            reasons.append('פונקציית אתחול')
        
        if any(keyword in function_name.lower() for keyword in ['save', 'update', 'delete', 'create']):
            importance_score += 2
            reasons.append('פונקציית CRUD')
        
        if any(keyword in function_name.lower() for keyword in ['validate', 'check', 'test']):
            importance_score += 1
            reasons.append('פונקציית ולידציה')
        
        # בדיקה לפי מיקום בקובץ
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # אם הפונקציה מוגדרת כגלובלית
            if f'window.{function_name}' in content:
                importance_score += 2
                reasons.append('מוגדרת כגלובלית')
            
            # אם הפונקציה מופיעה בהערות
            if function_name in content and '//' in content:
                importance_score += 1
                reasons.append('מוזכרת בהערות')
                
        except Exception:
            pass
        
        return {
            'score': importance_score,
            'reasons': reasons,
            'recommendation': 'keep' if importance_score >= 3 else 'review'
        }

    def generate_detailed_report(self, analysis_results):
        """יצירת דוח מפורט עם המלצות"""
        report = {
            'title': 'דוח מפורט - פונקציות לא בשימוש',
            'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'summary': analysis_results['summary'],
            'files_analysis': {},
            'recommendations': {
                'high_priority': [],
                'medium_priority': [],
                'low_priority': [],
                'keep_functions': []
            }
        }
        
        for item in analysis_results['unused_functions']:
            file_path = item['file']
            function_name = item['function']['name']
            
            # ניתוח מורכבות
            complexity = self.analyze_function_complexity(file_path, function_name)
            
            # בדיקת חשיבות
            importance = self.check_function_importance(function_name, file_path)
            
            # חיפוש קריאות עקיפות
            indirect_calls = self.find_indirect_calls(file_path, function_name)
            
            function_analysis = {
                'name': function_name,
                'line': item['function']['line'],
                'complexity': complexity,
                'importance': importance,
                'indirect_calls': indirect_calls,
                'file_path': file_path
            }
            
            # הוספה לקטגוריה המתאימה
            if importance['score'] >= 3:
                report['recommendations']['keep_functions'].append(function_analysis)
            elif complexity['lines'] > 20:
                report['recommendations']['high_priority'].append(function_analysis)
            elif complexity['lines'] > 10:
                report['recommendations']['medium_priority'].append(function_analysis)
            else:
                report['recommendations']['low_priority'].append(function_analysis)
        
        return report

    def print_detailed_summary(self, report):
        """הדפסת סיכום מפורט"""
        print("\n" + "="*80)
        print("📊 דוח מפורט - ניתוח פונקציות לא בשימוש")
        print("="*80)
        print(f"📅 תאריך: {report['date']}")
        print(f"📁 קבצים: {report['summary']['total_files']}")
        print(f"🔧 פונקציות סה\"כ: {report['summary']['total_functions']}")
        print(f"❌ לא בשימוש: {report['summary']['unused_functions']}")
        
        print(f"\n🎯 המלצות לפי עדיפות:")
        
        if report['recommendations']['high_priority']:
            print(f"\n🔴 עדיפות גבוהה ({len(report['recommendations']['high_priority'])} פונקציות):")
            for func in report['recommendations']['high_priority'][:5]:
                print(f"  📄 {Path(func['file_path']).name}: {func['name']} ({func['complexity']['lines']} שורות)")
        
        if report['recommendations']['medium_priority']:
            print(f"\n🟡 עדיפות בינונית ({len(report['recommendations']['medium_priority'])} פונקציות):")
            for func in report['recommendations']['medium_priority'][:5]:
                print(f"  📄 {Path(func['file_path']).name}: {func['name']} ({func['complexity']['lines']} שורות)")
        
        if report['recommendations']['low_priority']:
            print(f"\n🟢 עדיפות נמוכה ({len(report['recommendations']['low_priority'])} פונקציות):")
            for func in report['recommendations']['low_priority'][:5]:
                print(f"  📄 {Path(func['file_path']).name}: {func['name']} ({func['complexity']['lines']} שורות)")
        
        if report['recommendations']['keep_functions']:
            print(f"\n💡 פונקציות לשמירה ({len(report['recommendations']['keep_functions'])} פונקציות):")
            for func in report['recommendations']['keep_functions']:
                print(f"  📄 {Path(func['file_path']).name}: {func['name']} - {', '.join(func['importance']['reasons'])}")

def main():
    """פונקציה ראשית"""
    from analyze_unused_functions import FunctionAnalyzer
    
    # ניתוח בסיסי
    analyzer = FunctionAnalyzer()
    analysis_results = analyzer.analyze_all_files()
    
    # ניתוח מתקדם
    advanced_analyzer = AdvancedFunctionAnalyzer()
    detailed_report = advanced_analyzer.generate_detailed_report(analysis_results)
    
    # שמירת הדוח
    with open("detailed_unused_functions_analysis.json", 'w', encoding='utf-8') as f:
        json.dump(detailed_report, f, ensure_ascii=False, indent=2)
    
    # הדפסת סיכום
    advanced_analyzer.print_detailed_summary(detailed_report)
    
    return detailed_report

if __name__ == "__main__":
    main()
