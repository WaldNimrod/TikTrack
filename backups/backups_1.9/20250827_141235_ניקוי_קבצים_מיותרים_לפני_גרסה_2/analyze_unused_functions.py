#!/usr/bin/env python3
"""
סקריפט לניתוח פונקציות לא בשימוש בקבצי JavaScript
TikTrack - Function Usage Analyzer
"""

import os
import re
import json
import glob
from datetime import datetime
from collections import defaultdict, Counter
from pathlib import Path

class FunctionAnalyzer:
    def __init__(self, project_root="."):
        self.project_root = Path(project_root)
        self.trading_ui_path = self.project_root / "trading-ui"
        self.backup_dirs = ["backups", "Backend/backups", "legacy_html_files_20250823"]
        
        # קבצים להתעלמות
        self.ignore_patterns = [
            "*.backup", "*.bak", "*.old", "*.tmp",
            "node_modules/*", ".git/*", "__pycache__/*",
            "*.min.js", "*.bundle.js"
        ]
        
        # פונקציות גלובליות ידועות
        self.global_functions = {
            'console.log', 'console.error', 'console.warn',
            'alert', 'confirm', 'prompt',
            'fetch', 'XMLHttpRequest',
            'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
            'addEventListener', 'removeEventListener',
            'localStorage.getItem', 'localStorage.setItem',
            'sessionStorage.getItem', 'sessionStorage.setItem',
            'JSON.parse', 'JSON.stringify',
            'Math.random', 'Math.floor', 'Math.ceil',
            'Date', 'new Date',
            'Array.isArray', 'Array.from',
            'Object.keys', 'Object.values', 'Object.entries',
            'String.prototype.includes', 'String.prototype.startsWith',
            'Number.isInteger', 'Number.isNaN',
            'parseInt', 'parseFloat', 'isNaN', 'isFinite'
        }

    def should_ignore_file(self, file_path):
        """בדיקה אם יש להתעלם מהקובץ"""
        file_str = str(file_path)
        
        # התעלמות מספריות גיבוי
        for backup_dir in self.backup_dirs:
            if backup_dir in file_str:
                return True
        
        # התעלמות מקבצים ישנים
        if any(pattern in file_str for pattern in ["2025", "legacy", "old_"]):
            return True
            
        # התעלמות מקבצים זמניים
        for pattern in self.ignore_patterns:
            if glob.fnmatch.fnmatch(file_str, pattern):
                return True
                
        return False

    def find_js_files(self):
        """מציאת כל קבצי JavaScript בפרויקט"""
        js_files = []
        
        # חיפוש בספריית trading-ui
        if self.trading_ui_path.exists():
            js_files.extend(self.trading_ui_path.rglob("*.js"))
            js_files.extend(self.trading_ui_path.rglob("*.html"))
        
        # סינון קבצים להתעלמות
        js_files = [f for f in js_files if not self.should_ignore_file(f)]
        
        return sorted(js_files)

    def extract_functions_from_file(self, file_path):
        """חילוץ פונקציות מקובץ JavaScript"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ שגיאה בקריאת קובץ {file_path}: {e}")
            return []

        functions = []
        
        # חיפוש פונקציות רגילות
        function_patterns = [
            r'function\s+(\w+)\s*\(',  # function name()
            r'const\s+(\w+)\s*=\s*function\s*\(',  # const name = function()
            r'let\s+(\w+)\s*=\s*function\s*\(',  # let name = function()
            r'var\s+(\w+)\s*=\s*function\s*\(',  # var name = function()
            r'(\w+)\s*:\s*function\s*\(',  # name: function()
            r'(\w+)\s*:\s*async\s*function\s*\(',  # name: async function()
            r'async\s+function\s+(\w+)\s*\(',  # async function name()
            r'const\s+(\w+)\s*=\s*async\s*function\s*\(',  # const name = async function()
            r'(\w+)\s*=\s*\([^)]*\)\s*=>',  # name = () =>
            r'const\s+(\w+)\s*=\s*\([^)]*\)\s*=>',  # const name = () =>
            r'let\s+(\w+)\s*=\s*\([^)]*\)\s*=>',  # let name = () =>
        ]
        
        for pattern in function_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                func_name = match.group(1)
                if func_name and not func_name.startswith('_'):
                    functions.append({
                        'name': func_name,
                        'line': content[:match.start()].count('\n') + 1,
                        'pattern': pattern
                    })
        
        return functions

    def find_function_calls(self, file_path, function_name):
        """חיפוש קריאות לפונקציה בקובץ"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            return 0

        # חיפוש קריאות ישירות
        call_patterns = [
            rf'\b{re.escape(function_name)}\s*\(',  # function_name()
            rf'onclick\s*=\s*["\']{re.escape(function_name)}\s*\(',  # onclick="function_name()"
            rf'onclick\s*=\s*{re.escape(function_name)}\s*\(',  # onclick=function_name()
            rf'window\.{re.escape(function_name)}\s*=',  # window.function_name =
            rf'window\[["\']{re.escape(function_name)}["\']\]\s*=',  # window["function_name"] =
        ]
        
        total_calls = 0
        for pattern in call_patterns:
            matches = re.findall(pattern, content)
            total_calls += len(matches)
        
        return total_calls

    def analyze_file(self, file_path):
        """ניתוח קובץ בודד"""
        print(f"🔍 מנתח קובץ: {file_path}")
        
        functions = self.extract_functions_from_file(file_path)
        file_analysis = {
            'file_path': str(file_path),
            'total_functions': len(functions),
            'functions': []
        }
        
        for func in functions:
            # חיפוש קריאות בכל הקבצים
            total_calls = 0
            call_locations = []
            
            for js_file in self.find_js_files():
                calls = self.find_function_calls(js_file, func['name'])
                if calls > 0:
                    total_calls += calls
                    call_locations.append({
                        'file': str(js_file),
                        'calls': calls
                    })
            
            file_analysis['functions'].append({
                'name': func['name'],
                'line': func['line'],
                'total_calls': total_calls,
                'call_locations': call_locations,
                'status': 'unused' if total_calls == 0 else 'used'
            })
        
        return file_analysis

    def analyze_all_files(self):
        """ניתוח כל הקבצים"""
        print("🚀 מתחיל ניתוח פונקציות לא בשימוש...")
        
        js_files = self.find_js_files()
        print(f"📁 נמצאו {len(js_files)} קבצים לניתוח")
        
        all_analyses = []
        unused_functions = []
        used_functions = []
        
        for js_file in js_files:
            analysis = self.analyze_file(js_file)
            all_analyses.append(analysis)
            
            for func in analysis['functions']:
                if func['status'] == 'unused':
                    unused_functions.append({
                        'file': analysis['file_path'],
                        'function': func
                    })
                else:
                    used_functions.append({
                        'file': analysis['file_path'],
                        'function': func
                    })
        
        return {
            'summary': {
                'total_files': len(js_files),
                'total_functions': len(unused_functions) + len(used_functions),
                'unused_functions': len(unused_functions),
                'used_functions': len(used_functions),
                'analysis_date': datetime.now().isoformat()
            },
            'unused_functions': unused_functions,
            'used_functions': used_functions,
            'file_analyses': all_analyses
        }

    def generate_report(self, analysis_results):
        """יצירת דוח מפורט"""
        report = {
            'title': 'דוח פונקציות לא בשימוש - TikTrack',
            'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'summary': analysis_results['summary'],
            'unused_functions_by_file': defaultdict(list),
            'recommendations': []
        }
        
        # ארגון פונקציות לא בשימוש לפי קובץ
        for item in analysis_results['unused_functions']:
            file_name = Path(item['file']).name
            report['unused_functions_by_file'][file_name].append({
                'function_name': item['function']['name'],
                'line': item['function']['line'],
                'file_path': item['file']
            })
        
        # יצירת המלצות
        for file_name, functions in report['unused_functions_by_file'].items():
            if len(functions) > 0:
                report['recommendations'].append({
                    'file': file_name,
                    'unused_count': len(functions),
                    'functions': [f['function_name'] for f in functions],
                    'priority': 'high' if len(functions) > 5 else 'medium'
                })
        
        return report

    def save_report(self, report, output_file="unused_functions_analysis.json"):
        """שמירת הדוח לקובץ"""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"✅ דוח נשמר לקובץ: {output_file}")

    def print_summary(self, report):
        """הדפסת סיכום הדוח"""
        print("\n" + "="*60)
        print("📊 סיכום ניתוח פונקציות לא בשימוש")
        print("="*60)
        print(f"📅 תאריך הניתוח: {report['date']}")
        print(f"📁 קבצים שנבדקו: {report['summary']['total_files']}")
        print(f"🔧 פונקציות סה\"כ: {report['summary']['total_functions']}")
        print(f"❌ פונקציות לא בשימוש: {report['summary']['unused_functions']}")
        print(f"✅ פונקציות בשימוש: {report['summary']['used_functions']}")
        
        if report['unused_functions_by_file']:
            print(f"\n📋 פונקציות לא בשימוש לפי קובץ:")
            for file_name, functions in report['unused_functions_by_file'].items():
                print(f"  📄 {file_name}: {len(functions)} פונקציות")
                for func in functions[:3]:  # רק 3 הראשונות
                    print(f"    - {func['function_name']} (שורה {func['line']})")
                if len(functions) > 3:
                    print(f"    ... ועוד {len(functions) - 3} פונקציות")

def main():
    """פונקציה ראשית"""
    analyzer = FunctionAnalyzer()
    
    # ניתוח כל הקבצים
    analysis_results = analyzer.analyze_all_files()
    
    # יצירת דוח
    report = analyzer.generate_report(analysis_results)
    
    # שמירת הדוח
    analyzer.save_report(report)
    
    # הדפסת סיכום
    analyzer.print_summary(report)
    
    return report

if __name__ == "__main__":
    main()
