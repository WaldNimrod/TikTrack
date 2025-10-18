#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
סקריפט סריקה מקיף לכל סוגי הכפתורים
Comprehensive Button Scanner for All Button Types

מטרה: זיהוי ומיון כל הכפתורים באתר - רגילים ו-data-attributes
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass, asdict

@dataclass
class ButtonInfo:
    """מבנה נתונים למידע על כפתור"""
    file: str
    line: int
    type: str  # 'regular', 'data-attribute', 'old-function'
    content: str
    onclick: str
    classes: str
    attributes: str
    text: str
    context: str
    conversion_suggestion: Dict[str, str]

@dataclass
class ScanResult:
    """תוצאות הסריקה"""
    summary: Dict[str, Any]
    buttons: List[ButtonInfo]
    files_summary: Dict[str, Dict[str, int]]

class ComprehensiveButtonScanner:
    """סורק מקיף לכל סוגי הכפתורים"""
    
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.trading_ui_path = self.base_path / "trading-ui"
        
        # פונקציות ישנות לזיהוי
        self.old_functions = [
            'createButton', 'createEditButton', 'createDeleteButton',
            'createLinkButton', 'createCancelButton', 'createDeleteButtonByType',
            'createToggleButton', 'createCloseButton', 'createSortButton'
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
            r'button-icons\.js$',
            r'button-system-init\.js$',
            r'button-system-demo\.js$',
            r'button-helpers\.js$',
        ]
    
    def should_ignore_file(self, file_path: Path) -> bool:
        """בדיקה אם יש להתעלם מהקובץ"""
        for pattern in self.ignore_patterns:
            if re.match(pattern, file_path.name):
                return True
        return False
    
    def extract_button_info(self, button_html: str, file_path: str, line_num: int) -> ButtonInfo:
        """חילוץ מידע מכפתור HTML"""
        # חילוץ onclick
        onclick_match = re.search(r'onclick=["\']([^"\']*)["\']', button_html)
        onclick = onclick_match.group(1) if onclick_match else ""
        
        # חילוץ classes
        class_match = re.search(r'class=["\']([^"\']*)["\']', button_html)
        classes = class_match.group(1) if class_match else ""
        
        # חילוץ attributes אחרים
        attributes = []
        for attr in ['id', 'type', 'data-bs-dismiss', 'title', 'aria-label']:
            attr_match = re.search(f'{attr}=["\']([^"\']*)["\']', button_html)
            if attr_match:
                attributes.append(f'{attr}="{attr_match.group(1)}"')
        
        # חילוץ טקסט
        text_match = re.search(r'>([^<]+)<', button_html)
        text = text_match.group(1).strip() if text_match else ""
        
        # זיהוי סוג כפתור
        if 'data-button-type' in button_html:
            button_type = 'data-attribute'
            # חילוץ data-button-type
            type_match = re.search(r'data-button-type=["\']([^"\']*)["\']', button_html)
            button_data_type = type_match.group(1) if type_match else ""
        else:
            button_type = 'regular'
            button_data_type = self.guess_button_type(button_html, onclick, text, classes)
        
        # יצירת הצעת המרה
        conversion = self.generate_conversion_suggestion(button_type, button_data_type, onclick, classes, attributes, text)
        
        return ButtonInfo(
            file=file_path,
            line=line_num,
            type=button_type,
            content=button_html.strip(),
            onclick=onclick,
            classes=classes,
            attributes=' '.join(attributes),
            text=text,
            context="",  # ימולא מאוחר יותר
            conversion_suggestion=conversion
        )
    
    def guess_button_type(self, button_html: str, onclick: str, text: str, classes: str) -> str:
        """ניחוש סוג כפתור לפי התוכן"""
        # בדיקה לפי טקסט
        text_lower = text.lower()
        if any(word in text_lower for word in ['ערוך', 'edit', '✏️']):
            return 'EDIT'
        elif any(word in text_lower for word in ['מחק', 'delete', '🗑️']):
            return 'DELETE'
        elif any(word in text_lower for word in ['הוסף', 'add', '➕']):
            return 'ADD'
        elif any(word in text_lower for word in ['שמור', 'save', '💾']):
            return 'SAVE'
        elif any(word in text_lower for word in ['ביטול', 'cancel', '❌']):
            return 'CANCEL'
        elif any(word in text_lower for word in ['סגור', 'close', '✖️']):
            return 'CLOSE'
        elif any(word in text_lower for word in ['רענן', 'refresh', '🔄']):
            return 'REFRESH'
        elif any(word in text_lower for word in ['מיון', 'sort', '↕️']):
            return 'SORT'
        elif any(word in text_lower for word in ['הצג', 'הסתר', 'toggle', '▼']):
            return 'TOGGLE'
        
        # בדיקה לפי onclick
        onclick_lower = onclick.lower()
        if any(word in onclick_lower for word in ['edit', 'ערוך']):
            return 'EDIT'
        elif any(word in onclick_lower for word in ['delete', 'מחק']):
            return 'DELETE'
        elif any(word in onclick_lower for word in ['add', 'הוסף']):
            return 'ADD'
        elif any(word in onclick_lower for word in ['save', 'שמור']):
            return 'SAVE'
        elif any(word in onclick_lower for word in ['cancel', 'ביטול']):
            return 'CANCEL'
        elif any(word in onclick_lower for word in ['close', 'סגור']):
            return 'CLOSE'
        elif any(word in onclick_lower for word in ['refresh', 'רענן']):
            return 'REFRESH'
        elif any(word in onclick_lower for word in ['sort', 'מיון']):
            return 'SORT'
        elif any(word in onclick_lower for word in ['toggle', 'הצג', 'הסתר']):
            return 'TOGGLE'
        
        # בדיקה לפי classes
        if 'btn-danger' in classes:
            return 'DELETE'
        elif 'btn-success' in classes:
            return 'ADD'
        elif 'btn-primary' in classes:
            return 'SAVE'
        elif 'btn-secondary' in classes:
            return 'CANCEL'
        elif 'btn-info' in classes:
            return 'LINK'
        
        return 'UNKNOWN'
    
    def generate_conversion_suggestion(self, button_type: str, data_type: str, onclick: str, classes: str, attributes: List[str], text: str) -> Dict[str, str]:
        """יצירת הצעת המרה למערכת החדשה"""
        if button_type == 'data-attribute':
            return {
                "action": "already_converted",
                "note": "כפתור כבר במערכת החדשה"
            }
        
        # המרה לכפתור רגיל
        new_attributes = []
        if onclick:
            new_attributes.append(f'data-onclick="{onclick}"')
        if classes:
            new_attributes.append(f'data-classes="{classes}"')
        if text:
            new_attributes.append(f'data-text="{text}"')
        
        # שמירת attributes חשובים
        important_attrs = ['id', 'type', 'data-bs-dismiss', 'title', 'aria-label']
        for attr in attributes:
            if any(important in attr for important in important_attrs):
                new_attributes.append(attr)
        
        return {
            "action": "convert_to_data_attribute",
            "suggested_type": data_type,
            "new_html": f'<button data-button-type="{data_type}" {" ".join(new_attributes)}></button>',
            "note": f"המרה מוצעת לסוג {data_type}"
        }
    
    def scan_file(self, file_path: Path) -> List[ButtonInfo]:
        """סריקת קובץ בודד"""
        buttons = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for line_num, line in enumerate(lines, 1):
                # חיפוש כפתורים רגילים
                button_matches = re.finditer(r'<button[^>]*>', line)
                for match in button_matches:
                    button_html = match.group(0)
                    if 'data-button-type' not in button_html:  # רק כפתורים רגילים
                        button_info = self.extract_button_info(
                            button_html, 
                            str(file_path.relative_to(self.base_path)), 
                            line_num
                        )
                        buttons.append(button_info)
                
                # חיפוש כפתורים עם data-attributes
                data_button_matches = re.finditer(r'<button[^>]*data-button-type[^>]*>', line)
                for match in data_button_matches:
                    button_html = match.group(0)
                    button_info = self.extract_button_info(
                        button_html, 
                        str(file_path.relative_to(self.base_path)), 
                        line_num
                    )
                    buttons.append(button_info)
                
                # חיפוש פונקציות ישנות
                for func_name in self.old_functions:
                    pattern = rf'\$\{{{func_name}\s*\([^)]*\)\}}'
                    matches = re.finditer(pattern, line)
                    for match in matches:
                        button_info = ButtonInfo(
                            file=str(file_path.relative_to(self.base_path)),
                            line=line_num,
                            type='old-function',
                            content=match.group(0),
                            onclick="",
                            classes="",
                            attributes="",
                            text="",
                            context="",
                            conversion_suggestion={
                                "action": "convert_old_function",
                                "function": func_name,
                                "note": f"פונקציה ישנה: {func_name}"
                            }
                        )
                        buttons.append(button_info)
        
        except Exception as e:
            print(f"שגיאה בסריקת קובץ {file_path}: {e}")
        
        return buttons
    
    def scan_directory(self, directory: Path) -> List[ButtonInfo]:
        """סריקת תיקייה"""
        all_buttons = []
        
        if not directory.exists():
            return all_buttons
        
        for file_path in directory.rglob("*"):
            if file_path.is_file() and not self.should_ignore_file(file_path):
                if file_path.suffix in ['.js', '.html']:
                    buttons = self.scan_file(file_path)
                    all_buttons.extend(buttons)
        
        return all_buttons
    
    def scan_all(self) -> ScanResult:
        """סריקה מלאה של כל הקבצים"""
        print("🔍 מתחיל סריקה מקיפה של כל הכפתורים...")
        
        all_buttons = []
        
        for scan_path in self.scan_paths:
            if scan_path.exists():
                print(f"📁 סורק: {scan_path}")
                buttons = self.scan_directory(scan_path)
                all_buttons.extend(buttons)
                print(f"   נמצאו {len(buttons)} כפתורים")
        
        # יצירת סיכום
        summary = {
            "total_buttons": len(all_buttons),
            "by_type": {
                "regular": len([b for b in all_buttons if b.type == 'regular']),
                "data_attribute": len([b for b in all_buttons if b.type == 'data-attribute']),
                "old_function": len([b for b in all_buttons if b.type == 'old-function'])
            },
            "files_affected": len(set(b.file for b in all_buttons))
        }
        
        # סיכום לפי קבצים
        files_summary = {}
        for button in all_buttons:
            if button.file not in files_summary:
                files_summary[button.file] = {
                    "regular": 0,
                    "data-attribute": 0,
                    "old-function": 0,
                    "total": 0
                }
            # המרת שם הסוג למפתח הנכון
            type_key = button.type.replace('_', '-')
            if type_key in files_summary[button.file]:
                files_summary[button.file][type_key] += 1
            files_summary[button.file]["total"] += 1
        
        return ScanResult(summary=summary, buttons=all_buttons, files_summary=files_summary)
    
    def save_report(self, result: ScanResult, output_file: str = "comprehensive_button_scan_report.json"):
        """שמירת דוח ל-JSON"""
        output_path = self.base_path / output_file
        
        # המרה ל-dict
        report_data = {
            "summary": result.summary,
            "files_summary": result.files_summary,
            "buttons": [asdict(button) for button in result.buttons]
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"📄 דוח נשמר ב: {output_path}")
        return output_path
    
    def print_summary(self, result: ScanResult):
        """הדפסת סיכום"""
        print("\n" + "="*60)
        print("📊 סיכום סריקת כפתורים מקיפה")
        print("="*60)
        
        print(f"🔢 סה\"כ כפתורים: {result.summary['total_buttons']}")
        print(f"📁 קבצים מושפעים: {result.summary['files_affected']}")
        
        print("\n📋 פירוט לפי סוג:")
        for button_type, count in result.summary['by_type'].items():
            type_name = {
                'regular': 'כפתורים רגילים',
                'data_attribute': 'כפתורים עם data-attributes',
                'old_function': 'פונקציות ישנות'
            }.get(button_type, button_type)
            print(f"   {type_name}: {count}")
        
        print("\n📁 פירוט לפי קובץ (עמודים עם הכי הרבה כפתורים רגילים):")
        sorted_files = sorted(
            result.files_summary.items(), 
            key=lambda x: x[1]['regular'], 
            reverse=True
        )
        for file_name, counts in sorted_files[:10]:
            if counts['regular'] > 0:
                print(f"   {file_name}: {counts['regular']} רגילים, {counts['data-attribute']} data-attributes, {counts['old-function']} ישנים")
        
        print("\n" + "="*60)
    
    def generate_conversion_script(self, result: ScanResult, output_file: str = "convert_buttons.py"):
        """יצירת סקריפט המרה אוטומטי"""
        output_path = self.base_path / output_file
        
        script_content = '''#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
סקריפט המרה אוטומטי לכפתורים
Auto Button Conversion Script

נוצר אוטומטית על ידי scan_all_buttons.py
"""

import re
import os
from pathlib import Path

def convert_file(file_path: str, conversions: list):
    """המרת קובץ בודד"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        for conversion in conversions:
            old_pattern = re.escape(conversion['old'])
            new_replacement = conversion['new']
            content = re.sub(old_pattern, new_replacement, content)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ עודכן: {file_path}")
            return True
        else:
            print(f"⏭️  ללא שינויים: {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ שגיאה ב-{file_path}: {e}")
        return False

def main():
    """פונקציה ראשית"""
    print("🔄 מתחיל המרה אוטומטית של כפתורים...")
    
    conversions = [
'''
        
        # הוספת המרות ספציפיות
        for button in result.buttons:
            if button.type == 'regular' and button.conversion_suggestion.get('action') == 'convert_to_data_attribute':
                old_html = re.escape(button.content)
                new_html = button.conversion_suggestion['new_html']
                script_content += f'        {{\n'
                script_content += f'            "file": "{button.file}",\n'
                script_content += f'            "old": r"{old_html}",\n'
                script_content += f'            "new": "{new_html}"\n'
                script_content += f'        }},\n'
        
        script_content += '''    ]
    
    # ביצוע המרות
    converted_files = set()
    for conversion in conversions:
        file_path = conversion['file']
        if file_path not in converted_files:
            if convert_file(file_path, [conversion]):
                converted_files.add(file_path)
    
    print(f"\\n✅ הושלם! {len(converted_files)} קבצים עודכנו")

if __name__ == "__main__":
    main()
'''
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        print(f"📝 סקריפט המרה נוצר ב: {output_path}")
        return output_path

def main():
    """פונקציה ראשית"""
    scanner = ComprehensiveButtonScanner()
    
    # ביצוע סריקה
    result = scanner.scan_all()
    
    # הדפסת סיכום
    scanner.print_summary(result)
    
    # שמירת דוח
    report_path = scanner.save_report(result)
    
    # יצירת סקריפט המרה
    script_path = scanner.generate_conversion_script(result)
    
    print(f"\n✅ סריקה הושלמה בהצלחה!")
    print(f"📄 דוח מפורט נשמר ב: {report_path}")
    print(f"📝 סקריפט המרה נוצר ב: {script_path}")
    print(f"🔧 מוכן להמרה אוטומטית")

if __name__ == "__main__":
    main()
