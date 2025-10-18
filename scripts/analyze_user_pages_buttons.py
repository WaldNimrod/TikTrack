#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ניתוח מפורט של כפתורים בעמודי משתמש
Detailed Analysis of Buttons in User Pages

סבב א: ניטור מפורט לפי סוגי כפתורים
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass, asdict

@dataclass
class ButtonAnalysis:
    """ניתוח כפתור בודד"""
    file: str
    line: int
    button_type: str  # 'regular', 'data-attribute'
    content: str
    onclick: str
    classes: str
    text: str
    context: str
    suggested_type: str
    conversion_ready: bool

@dataclass
class PageAnalysis:
    """ניתוח עמוד"""
    page_name: str
    file_path: str
    total_buttons: int
    regular_buttons: int
    data_attribute_buttons: int
    button_types: Dict[str, int]
    buttons: List[ButtonAnalysis]
    conversion_priority: int

class UserPagesButtonAnalyzer:
    """מנתח כפתורים בעמודי משתמש"""
    
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.trading_ui_path = self.base_path / "trading-ui"
        
        # עמודי משתמש עיקריים (13 עמודים)
        self.user_pages = [
            "cash_flows.html",
            "trades.html", 
            "alerts.html",
            "tickers.html",
            "trade_plans.html",
            "trading_accounts.html",
            "executions.html",
            "notes.html",
            "constraints.html",
            "currencies.html",
            "preferences.html",
            "db_display.html",
            "db_extradata.html"
        ]
        
        # קבצי JavaScript תואמים
        self.user_scripts = [
            "cash_flows.js",
            "trades.js",
            "alerts.js", 
            "tickers.js",
            "trade_plans.js",
            "trading_accounts.js",
            "executions.js",
            "notes.js",
            "constraint-manager.js",
            "currencies.js",
            "preferences-admin.js",
            "db_display.js",
            "db_extradata.js"
        ]
    
    def analyze_button(self, button_html: str, file_path: str, line_num: int, context: str) -> ButtonAnalysis:
        """ניתוח כפתור בודד"""
        # חילוץ onclick
        onclick_match = re.search(r'onclick=["\']([^"\']*)["\']', button_html)
        onclick = onclick_match.group(1) if onclick_match else ""
        
        # חילוץ classes
        class_match = re.search(r'class=["\']([^"\']*)["\']', button_html)
        classes = class_match.group(1) if class_match else ""
        
        # חילוץ טקסט
        text_match = re.search(r'>([^<]+)<', button_html)
        text = text_match.group(1).strip() if text_match else ""
        
        # זיהוי סוג כפתור
        if 'data-button-type' in button_html:
            button_type = 'data-attribute'
            type_match = re.search(r'data-button-type=["\']([^"\']*)["\']', button_html)
            suggested_type = type_match.group(1) if type_match else "UNKNOWN"
            conversion_ready = True
        else:
            button_type = 'regular'
            suggested_type = self.guess_button_type(button_html, onclick, text, classes)
            conversion_ready = False
        
        return ButtonAnalysis(
            file=file_path,
            line=line_num,
            button_type=button_type,
            content=button_html.strip(),
            onclick=onclick,
            classes=classes,
            text=text,
            context=context,
            suggested_type=suggested_type,
            conversion_ready=conversion_ready
        )
    
    def guess_button_type(self, button_html: str, onclick: str, text: str, classes: str) -> str:
        """ניחוש סוג כפתור"""
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
        elif any(word in text_lower for word in ['קישור', 'link', '🔗']):
            return 'LINK'
        elif any(word in text_lower for word in ['ייצא', 'export', '📤']):
            return 'EXPORT'
        elif any(word in text_lower for word in ['ייבא', 'import', '📥']):
            return 'IMPORT'
        elif any(word in text_lower for word in ['חיפוש', 'search', '🔍']):
            return 'SEARCH'
        elif any(word in text_lower for word in ['סינון', 'filter']):
            return 'FILTER'
        elif any(word in text_lower for word in ['הצג', 'view', '👁️']):
            return 'VIEW'
        
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
        elif 'btn-warning' in classes:
            return 'WARNING'
        
        return 'UNKNOWN'
    
    def analyze_file(self, file_path: Path) -> List[ButtonAnalysis]:
        """ניתוח קובץ בודד"""
        buttons = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            for line_num, line in enumerate(lines, 1):
                # חיפוש כפתורים
                button_matches = re.finditer(r'<button[^>]*>', line)
                for match in button_matches:
                    button_html = match.group(0)
                    
                    # יצירת context (3 שורות לפני ואחרי)
                    context_start = max(0, line_num - 4)
                    context_end = min(len(lines), line_num + 3)
                    context_lines = lines[context_start:context_end]
                    context = ''.join(context_lines).strip()
                    
                    button_analysis = self.analyze_button(
                        button_html,
                        str(file_path.relative_to(self.base_path)),
                        line_num,
                        context
                    )
                    buttons.append(button_analysis)
        
        except Exception as e:
            print(f"שגיאה בניתוח קובץ {file_path}: {e}")
        
        return buttons
    
    def analyze_page(self, page_name: str) -> PageAnalysis:
        """ניתוח עמוד מלא (HTML + JS)"""
        print(f"🔍 מנתח עמוד: {page_name}")
        
        all_buttons = []
        
        # ניתוח קובץ HTML
        html_path = self.trading_ui_path / page_name
        if html_path.exists():
            html_buttons = self.analyze_file(html_path)
            all_buttons.extend(html_buttons)
            print(f"   HTML: {len(html_buttons)} כפתורים")
        
        # ניתוח קובץ JavaScript תואם
        js_name = page_name.replace('.html', '.js')
        js_path = self.trading_ui_path / "scripts" / js_name
        if js_path.exists():
            js_buttons = self.analyze_file(js_path)
            all_buttons.extend(js_buttons)
            print(f"   JS: {len(js_buttons)} כפתורים")
        
        # סטטיסטיקות
        regular_buttons = len([b for b in all_buttons if b.button_type == 'regular'])
        data_attribute_buttons = len([b for b in all_buttons if b.button_type == 'data-attribute'])
        
        # סיכום לפי סוגי כפתורים
        button_types = {}
        for button in all_buttons:
            button_type = button.suggested_type
            button_types[button_type] = button_types.get(button_type, 0) + 1
        
        # עדיפות המרה (יותר כפתורים רגילים = עדיפות גבוהה יותר)
        conversion_priority = regular_buttons
        
        return PageAnalysis(
            page_name=page_name,
            file_path=str(html_path.relative_to(self.base_path)),
            total_buttons=len(all_buttons),
            regular_buttons=regular_buttons,
            data_attribute_buttons=data_attribute_buttons,
            button_types=button_types,
            buttons=all_buttons,
            conversion_priority=conversion_priority
        )
    
    def analyze_all_user_pages(self) -> List[PageAnalysis]:
        """ניתוח כל עמודי המשתמש"""
        print("🔍 מתחיל ניתוח עמודי משתמש...")
        
        page_analyses = []
        
        for page_name in self.user_pages:
            page_analysis = self.analyze_page(page_name)
            page_analyses.append(page_analysis)
        
        # מיון לפי עדיפות המרה
        page_analyses.sort(key=lambda x: x.conversion_priority, reverse=True)
        
        return page_analyses
    
    def generate_detailed_report(self, page_analyses: List[PageAnalysis]) -> str:
        """יצירת דוח מפורט"""
        report = []
        report.append("# דוח ניתוח כפתורים - עמודי משתמש")
        report.append("=" * 60)
        report.append("")
        
        # סיכום כללי
        total_buttons = sum(pa.total_buttons for pa in page_analyses)
        total_regular = sum(pa.regular_buttons for pa in page_analyses)
        total_data_attr = sum(pa.data_attribute_buttons for pa in page_analyses)
        
        report.append("## סיכום כללי")
        report.append(f"- סה\"כ כפתורים: {total_buttons}")
        report.append(f"- כפתורים רגילים: {total_regular}")
        report.append(f"- כפתורים עם data-attributes: {total_data_attr}")
        report.append(f"- עמודים: {len(page_analyses)}")
        report.append("")
        
        # סיכום לפי סוגי כפתורים
        all_button_types = {}
        for pa in page_analyses:
            for button_type, count in pa.button_types.items():
                all_button_types[button_type] = all_button_types.get(button_type, 0) + count
        
        report.append("## סיכום לפי סוגי כפתורים")
        for button_type, count in sorted(all_button_types.items(), key=lambda x: x[1], reverse=True):
            report.append(f"- {button_type}: {count}")
        report.append("")
        
        # פירוט לפי עמודים
        report.append("## פירוט לפי עמודים (ממוין לפי עדיפות המרה)")
        report.append("")
        
        for i, pa in enumerate(page_analyses, 1):
            report.append(f"### {i}. {pa.page_name}")
            report.append(f"- **עדיפות המרה:** {pa.conversion_priority} (כפתורים רגילים)")
            report.append(f"- **סה\"כ כפתורים:** {pa.total_buttons}")
            report.append(f"- **כפתורים רגילים:** {pa.regular_buttons}")
            report.append(f"- **כפתורים עם data-attributes:** {pa.data_attribute_buttons}")
            report.append("")
            
            if pa.button_types:
                report.append("**סוגי כפתורים:**")
                for button_type, count in sorted(pa.button_types.items(), key=lambda x: x[1], reverse=True):
                    report.append(f"  - {button_type}: {count}")
                report.append("")
            
            # כפתורים רגילים שצריכים המרה
            regular_buttons = [b for b in pa.buttons if b.button_type == 'regular']
            if regular_buttons:
                report.append("**כפתורים רגילים שצריכים המרה:**")
                for button in regular_buttons[:5]:  # רק 5 הראשונים
                    report.append(f"  - שורה {button.line}: {button.suggested_type} - {button.text}")
                if len(regular_buttons) > 5:
                    report.append(f"  - ... ועוד {len(regular_buttons) - 5} כפתורים")
                report.append("")
            
            report.append("---")
            report.append("")
        
        return "\n".join(report)
    
    def save_json_report(self, page_analyses: List[PageAnalysis], filename: str = "user_pages_button_analysis.json"):
        """שמירת דוח JSON מפורט"""
        output_path = self.base_path / filename
        
        # המרה ל-dict
        report_data = {
            "summary": {
                "total_pages": len(page_analyses),
                "total_buttons": sum(pa.total_buttons for pa in page_analyses),
                "total_regular": sum(pa.regular_buttons for pa in page_analyses),
                "total_data_attribute": sum(pa.data_attribute_buttons for pa in page_analyses)
            },
            "pages": []
        }
        
        for pa in page_analyses:
            page_data = {
                "page_name": pa.page_name,
                "file_path": pa.file_path,
                "total_buttons": pa.total_buttons,
                "regular_buttons": pa.regular_buttons,
                "data_attribute_buttons": pa.data_attribute_buttons,
                "button_types": pa.button_types,
                "conversion_priority": pa.conversion_priority,
                "buttons": [asdict(button) for button in pa.buttons]
            }
            report_data["pages"].append(page_data)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"📄 דוח JSON נשמר ב: {output_path}")
        return output_path

def main():
    """פונקציה ראשית"""
    analyzer = UserPagesButtonAnalyzer()
    
    # ניתוח כל עמודי המשתמש
    page_analyses = analyzer.analyze_all_user_pages()
    
    # יצירת דוח מפורט
    detailed_report = analyzer.generate_detailed_report(page_analyses)
    
    # שמירת דוח טקסט
    with open("user_pages_button_analysis_report.md", 'w', encoding='utf-8') as f:
        f.write(detailed_report)
    
    # שמירת דוח JSON
    json_path = analyzer.save_json_report(page_analyses)
    
    print("\n" + "="*60)
    print("✅ ניתוח עמודי משתמש הושלם!")
    print("📄 דוח מפורט: user_pages_button_analysis_report.md")
    print("📄 דוח JSON: user_pages_button_analysis.json")
    print("="*60)
    
    # הדפסת סיכום מהיר
    print("\n📊 סיכום מהיר:")
    total_regular = sum(pa.regular_buttons for pa in page_analyses)
    total_data_attr = sum(pa.data_attribute_buttons for pa in page_analyses)
    print(f"🔢 סה\"כ כפתורים רגילים: {total_regular}")
    print(f"🔢 סה\"כ כפתורים עם data-attributes: {total_data_attr}")
    
    print("\n📋 עמודים עם הכי הרבה כפתורים רגילים:")
    for i, pa in enumerate(page_analyses[:5], 1):
        print(f"{i}. {pa.page_name}: {pa.regular_buttons} כפתורים רגילים")

if __name__ == "__main__":
    main()
