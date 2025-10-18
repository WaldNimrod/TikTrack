#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
סקריפט סריקה מקיף לזיהוי כל השימושים במערכת הכפתורים הישנה
Button System Usage Scanner

מטרה: זיהוי כל השימושים בפונקציות הישנות והכנת דוח מפורט להמרה
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass, asdict

@dataclass
class ButtonUsage:
    """מבנה נתונים לשימוש בכפתור"""
    file: str
    line: int
    function: str
    params: List[str]
    context: str
    conversion: Dict[str, str]

@dataclass
class ScanResult:
    """תוצאות הסריקה"""
    summary: Dict[str, Any]
    details: List[ButtonUsage]

class ButtonUsageScanner:
    """סורק שימושים במערכת הכפתורים הישנה"""
    
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.trading_ui_path = self.base_path / "trading-ui"
        
        # פונקציות לזיהוי
        self.target_functions = [
            'createButton',
            'createEditButton', 
            'createDeleteButton',
            'createLinkButton',
            'createCancelButton',
            'createDeleteButtonByType',
            'createToggleButton',
            'createCloseButton',
            'createSortButton'
        ]
        
        # קבצים לסריקה
        self.scan_paths = [
            self.trading_ui_path / "scripts",
            self.trading_ui_path,  # HTML files
        ]
        
        # קבצים להתעלמות
        self.ignore_patterns = [
            r'.*\.min\.js$',
            r'.*\.gz$',
            r'.*\.backup$',
            r'button-icons\.js$',  # הקובץ עצמו
            r'button-system-init\.js$',
            r'button-system-demo\.js$',
            r'button-helpers\.js$',  # אם קיים
        ]
    
    def should_ignore_file(self, file_path: Path) -> bool:
        """בדיקה אם יש להתעלם מהקובץ"""
        for pattern in self.ignore_patterns:
            if re.match(pattern, file_path.name):
                return True
        return False
    
    def extract_function_params(self, function_call: str, function_name: str) -> List[str]:
        """חילוץ פרמטרים מקריאה לפונקציה"""
        try:
            # הסרת ${ ו-} מהתחלה וסוף
            clean_call = function_call.strip()
            if clean_call.startswith('${') and clean_call.endswith('}'):
                clean_call = clean_call[2:-1]
            
            # הסרת שם הפונקציה
            if not clean_call.startswith(f"{function_name}("):
                return []
            
            params_str = clean_call[len(f"{function_name}("):]
            
            # מציאת סוגריים סגורים
            paren_count = 0
            end_pos = 0
            
            for i, char in enumerate(params_str):
                if char == '(':
                    paren_count += 1
                elif char == ')':
                    if paren_count == 0:
                        end_pos = i
                        break
                    paren_count -= 1
            
            if end_pos == 0:
                return []
            
            params_str = params_str[:end_pos]
            
            # אם אין פרמטרים
            if not params_str.strip():
                return []
            
            # חלוקה לפרמטרים (פשוטה - לא מטפלת בפרמטרים מורכבים)
            params = []
            current_param = ""
            paren_count = 0
            quote_char = None
            
            for char in params_str:
                if quote_char:
                    if char == quote_char:
                        quote_char = None
                    current_param += char
                elif char in ['"', "'", '`']:
                    quote_char = char
                    current_param += char
                elif char == '(':
                    paren_count += 1
                    current_param += char
                elif char == ')':
                    paren_count -= 1
                    current_param += char
                elif char == ',' and paren_count == 0:
                    params.append(current_param.strip())
                    current_param = ""
                else:
                    current_param += char
            
            if current_param.strip():
                params.append(current_param.strip())
            
            return params
            
        except Exception as e:
            print(f"שגיאה בחילוץ פרמטרים: {e}")
            return []
    
    def generate_conversion_suggestion(self, function_name: str, params: List[str]) -> Dict[str, str]:
        """יצירת הצעת המרה למערכת החדשה"""
        conversion = {
            "type": "",
            "onclick": "",
            "classes": "",
            "attributes": "",
            "text": ""
        }
        
        if function_name == "createButton":
            if len(params) >= 2:
                conversion["type"] = params[0].strip('"\'`')
                conversion["onclick"] = params[1].strip('"\'`')
                if len(params) >= 3:
                    conversion["classes"] = params[2].strip('"\'`')
                if len(params) >= 4:
                    conversion["attributes"] = params[3].strip('"\'`')
        
        elif function_name == "createEditButton":
            conversion["type"] = "EDIT"
            if params:
                conversion["onclick"] = params[0].strip('"\'`')
            if len(params) >= 2:
                conversion["classes"] = params[1].strip('"\'`')
        
        elif function_name == "createDeleteButton":
            conversion["type"] = "DELETE"
            if params:
                conversion["onclick"] = params[0].strip('"\'`')
            if len(params) >= 2:
                conversion["classes"] = params[1].strip('"\'`')
        
        elif function_name == "createLinkButton":
            conversion["type"] = "LINK"
            if params:
                conversion["onclick"] = params[0].strip('"\'`')
            if len(params) >= 2:
                conversion["classes"] = params[1].strip('"\'`')
        
        elif function_name == "createCancelButton":
            # לוגיקה מורכבת - נדרש טיפול מיוחד
            conversion["type"] = "CANCEL"  # או REACTIVATE לפי סטטוס
            conversion["onclick"] = "dynamic_cancel_logic"  # יוחלף ידנית
            conversion["classes"] = "btn-danger btn-sm"
            conversion["attributes"] = "data-item-type data-item-id"
        
        elif function_name == "createDeleteButtonByType":
            # לוגיקה מורכבת - נדרש טיפול מיוחד
            conversion["type"] = "DELETE"
            conversion["onclick"] = "dynamic_delete_logic"  # יוחלף ידנית
            conversion["classes"] = "btn-danger btn-sm"
            conversion["attributes"] = "data-item-type data-item-id"
        
        elif function_name == "createToggleButton":
            conversion["type"] = "TOGGLE"
            if params:
                conversion["onclick"] = params[0].strip('"\'`')
            if len(params) >= 2:
                conversion["text"] = params[1].strip('"\'`')
            if len(params) >= 3:
                conversion["classes"] = params[2].strip('"\'`')
        
        elif function_name == "createCloseButton":
            conversion["type"] = "CLOSE"
            conversion["attributes"] = "data-bs-dismiss='modal'"
            if params:
                conversion["classes"] = params[0].strip('"\'`')
        
        elif function_name == "createSortButton":
            conversion["type"] = "SORT"
            if params:
                conversion["onclick"] = params[0].strip('"\'`')
            if len(params) >= 2:
                conversion["classes"] = params[1].strip('"\'`')
            if len(params) >= 4:
                conversion["text"] = params[3].strip('"\'`')
        
        return conversion
    
    def scan_file(self, file_path: Path) -> List[ButtonUsage]:
        """סריקת קובץ בודד"""
        usages = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for line_num, line in enumerate(lines, 1):
                for function_name in self.target_functions:
                    # חיפוש פונקציה בשורה
                    pattern = rf'\$\{{{function_name}\s*\([^)]*\)\}}'
                    matches = re.finditer(pattern, line)
                    
                    for match in matches:
                        function_call = match.group(0)
                        
                        # חילוץ פרמטרים
                        params = self.extract_function_params(function_call, function_name)
                        
                        # יצירת הצעת המרה
                        conversion = self.generate_conversion_suggestion(function_name, params)
                        
                        # יצירת context (3 שורות לפני ואחרי)
                        start_line = max(0, line_num - 4)
                        end_line = min(len(lines), line_num + 3)
                        context_lines = lines[start_line:end_line]
                        context = ''.join(context_lines)
                        
                        usage = ButtonUsage(
                            file=str(file_path.relative_to(self.base_path)),
                            line=line_num,
                            function=function_name,
                            params=params,
                            context=context,
                            conversion=conversion
                        )
                        
                        usages.append(usage)
        
        except Exception as e:
            print(f"שגיאה בסריקת קובץ {file_path}: {e}")
        
        return usages
    
    def scan_directory(self, directory: Path) -> List[ButtonUsage]:
        """סריקת תיקייה"""
        all_usages = []
        
        if not directory.exists():
            return all_usages
        
        for file_path in directory.rglob("*"):
            if file_path.is_file() and not self.should_ignore_file(file_path):
                if file_path.suffix in ['.js', '.html']:
                    usages = self.scan_file(file_path)
                    all_usages.extend(usages)
        
        return all_usages
    
    def scan_all(self) -> ScanResult:
        """סריקה מלאה של כל הקבצים"""
        print("🔍 מתחיל סריקה מקיפה של שימושים במערכת הכפתורים הישנה...")
        
        all_usages = []
        
        for scan_path in self.scan_paths:
            if scan_path.exists():
                print(f"📁 סורק: {scan_path}")
                usages = self.scan_directory(scan_path)
                all_usages.extend(usages)
                print(f"   נמצאו {len(usages)} שימושים")
        
        # יצירת סיכום
        summary = {
            "total_old_buttons": len(all_usages),
            "files_affected": len(set(usage.file for usage in all_usages)),
            "by_type": {}
        }
        
        # ספירה לפי סוג פונקציה
        for usage in all_usages:
            func_name = usage.function
            if func_name not in summary["by_type"]:
                summary["by_type"][func_name] = 0
            summary["by_type"][func_name] += 1
        
        # ספירה לפי קובץ
        files_summary = {}
        for usage in all_usages:
            if usage.file not in files_summary:
                files_summary[usage.file] = 0
            files_summary[usage.file] += 1
        
        summary["by_file"] = files_summary
        
        return ScanResult(summary=summary, details=all_usages)
    
    def save_report(self, result: ScanResult, output_file: str = "button_usage_scan_report.json"):
        """שמירת דוח ל-JSON"""
        output_path = self.base_path / output_file
        
        # המרה ל-dict
        report_data = {
            "summary": result.summary,
            "details": [asdict(usage) for usage in result.details]
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"📄 דוח נשמר ב: {output_path}")
        return output_path
    
    def print_summary(self, result: ScanResult):
        """הדפסת סיכום"""
        print("\n" + "="*60)
        print("📊 סיכום סריקת שימושים במערכת הכפתורים הישנה")
        print("="*60)
        
        print(f"🔢 סה\"כ כפתורים ישנים: {result.summary['total_old_buttons']}")
        print(f"📁 קבצים מושפעים: {result.summary['files_affected']}")
        
        print("\n📋 פירוט לפי סוג פונקציה:")
        for func_name, count in result.summary['by_type'].items():
            print(f"   {func_name}: {count}")
        
        print("\n📁 פירוט לפי קובץ:")
        for file_name, count in result.summary['by_file'].items():
            print(f"   {file_name}: {count}")
        
        print("\n⚠️  קבצים עם הכי הרבה שימושים:")
        sorted_files = sorted(result.summary['by_file'].items(), key=lambda x: x[1], reverse=True)
        for file_name, count in sorted_files[:5]:
            print(f"   {file_name}: {count} שימושים")
        
        print("\n" + "="*60)

def main():
    """פונקציה ראשית"""
    scanner = ButtonUsageScanner()
    
    # ביצוע סריקה
    result = scanner.scan_all()
    
    # הדפסת סיכום
    scanner.print_summary(result)
    
    # שמירת דוח
    report_path = scanner.save_report(result)
    
    print(f"\n✅ סריקה הושלמה בהצלחה!")
    print(f"📄 דוח מפורט נשמר ב: {report_path}")
    print(f"🔧 מוכן להמרה ידנית שיטתית")

if __name__ == "__main__":
    main()
