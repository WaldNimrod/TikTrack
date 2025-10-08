#!/usr/bin/env python3
"""
ניתוח מפורט של כפתורים ופונקציות JavaScript בכל עמוד
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path

class DetailedButtonAnalyzer:
    def __init__(self):
        self.trading_ui_path = Path("/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui")
        self.results = {}

    def analyze_buttons_in_file(self, filename):
        """ניתוח מפורט של כפתורים בקובץ"""
        file_path = self.trading_ui_path / filename
        
        if not file_path.exists():
            return {'error': 'קובץ לא קיים'}
        
        print(f"🔍 מנתח כפתורים: {filename}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # חיפוש כפתורים מפורט
            button_analysis = {
                'html_buttons': [],
                'onclick_functions': [],
                'form_submits': [],
                'modal_buttons': [],
                'table_actions': [],
                'crud_operations': []
            }
            
            # חיפוש כפתורי HTML
            button_pattern = r'<button[^>]*>([^<]+)</button>'
            html_buttons = re.finditer(button_pattern, content, re.IGNORECASE | re.DOTALL)
            
            for match in html_buttons:
                button_text = match.group(1).strip()
                button_html = match.group(0)
                
                # חיפוש onclick
                onclick_match = re.search(r'onclick=["\']([^"\']+)["\']', button_html)
                onclick = onclick_match.group(1) if onclick_match else None
                
                # חיפוש ID
                id_match = re.search(r'id=["\']([^"\']+)["\']', button_html)
                button_id = id_match.group(1) if id_match else None
                
                # חיפוש classes
                class_match = re.search(r'class=["\']([^"\']+)["\']', button_html)
                button_classes = class_match.group(1) if class_match else None
                
                button_info = {
                    'text': button_text,
                    'id': button_id,
                    'classes': button_classes,
                    'onclick': onclick,
                    'type': self.classify_button(button_text, onclick, button_classes)
                }
                
                button_analysis['html_buttons'].append(button_info)
                
                # סיווג לפי סוג
                if onclick:
                    button_analysis['onclick_functions'].append(onclick)
                
                if 'modal' in (button_classes or '').lower():
                    button_analysis['modal_buttons'].append(button_info)
                
                if any(word in button_text.lower() for word in ['הוסף', 'ערוך', 'מחק', 'שמור']):
                    button_analysis['crud_operations'].append(button_info)

            # חיפוש פונקציות JavaScript
            js_functions = re.findall(r'function\s+(\w+)\s*\([^)]*\)', content)
            button_analysis['js_functions'] = list(set(js_functions))
            
            # חיפוש API calls
            api_calls = re.findall(r'fetch\([^)]*["\']([^"\']*api[^"\']*)["\']', content)
            button_analysis['api_calls'] = list(set(api_calls))
            
            # חיפוש מודלים
            modal_ids = re.findall(r'id=["\']([^"\']*modal[^"\']*)["\']', content, re.IGNORECASE)
            button_analysis['modals'] = list(set(modal_ids))
            
            # חיפוש טבלאות
            table_ids = re.findall(r'id=["\']([^"\']*table[^"\']*)["\']', content, re.IGNORECASE)
            button_analysis['tables'] = list(set(table_ids))
            
            # ניתוח פונקציונליות CRUD
            crud_indicators = {
                'create': len([b for b in button_analysis['html_buttons'] if 'הוסף' in b['text']]),
                'read': len(button_analysis['tables']) + len([b for b in button_analysis['html_buttons'] if 'רענן' in b['text']]),
                'update': len([b for b in button_analysis['html_buttons'] if 'ערוך' in b['text'] or 'שמור' in b['text']]),
                'delete': len([b for b in button_analysis['html_buttons'] if 'מחק' in b['text']]),
            }
            
            button_analysis['crud_score'] = sum(crud_indicators.values())
            button_analysis['crud_breakdown'] = crud_indicators
            
            # חישוב ציון כללי
            total_buttons = len(button_analysis['html_buttons'])
            crud_operations = len(button_analysis['crud_operations'])
            has_modals = len(button_analysis['modals']) > 0
            has_tables = len(button_analysis['tables']) > 0
            has_js_functions = len(button_analysis['js_functions']) > 0
            
            functionality_score = (
                (crud_operations * 10) +  # כל פעולת CRUD שווה 10 נקודות
                (has_modals * 20) +       # מודלים = 20 נקודות
                (has_tables * 15) +       # טבלאות = 15 נקודות  
                (has_js_functions * 5)    # פונקציות JS = 5 נקודות
            )
            
            max_score = 100
            final_score = min(functionality_score, max_score)
            
            print(f"   📊 נמצאו {total_buttons} כפתורים")
            print(f"   🔧 פעולות CRUD: {crud_operations}")
            print(f"   📝 מודלים: {len(button_analysis['modals'])}")
            print(f"   📋 טבלאות: {len(button_analysis['tables'])}")
            print(f"   ⚙️ פונקציות JS: {len(button_analysis['js_functions'])}")
            print(f"   🎯 ציון פונקציונליות: {final_score}/100")
            
            button_analysis['functionality_score'] = final_score
            
            return button_analysis
            
        except Exception as e:
            print(f"   ❌ שגיאה: {e}")
            return {'error': str(e)}

    def classify_button(self, text, onclick, classes):
        """סיווג כפתור לפי תכונותיו"""
        text_lower = text.lower()
        onclick_lower = (onclick or '').lower()
        classes_lower = (classes or '').lower()
        
        if 'הוסף' in text or 'add' in onclick_lower:
            return 'create'
        elif 'ערוך' in text or 'edit' in onclick_lower:
            return 'update'
        elif 'מחק' in text or 'delete' in onclick_lower:
            return 'delete'
        elif 'שמור' in text or 'save' in onclick_lower:
            return 'save'
        elif 'רענן' in text or 'refresh' in onclick_lower:
            return 'refresh'
        elif 'ייצא' in text or 'export' in onclick_lower:
            return 'export'
        elif 'פילטר' in text or 'filter' in onclick_lower:
            return 'filter'
        elif 'מיון' in text or 'sort' in onclick_lower:
            return 'sort'
        elif 'סגור' in text or 'close' in onclick_lower:
            return 'close'
        elif 'בטל' in text or 'cancel' in onclick_lower:
            return 'cancel'
        else:
            return 'other'

    def analyze_crud_pages(self):
        """ניתוח כל עמודי CRUD"""
        print("🔧 מנתח כפתורים בעמודי CRUD")
        print("=" * 35)
        
        crud_pages = [
            'trades.html',
            'accounts.html', 
            'alerts.html',
            'tickers.html',
            'executions.html',
            'cash_flows.html',
            'trade_plans.html',
            'notes.html'
        ]
        
        for filename in crud_pages:
            analysis = self.analyze_buttons_in_file(filename)
            
            if 'error' not in analysis:
                self.results[filename] = {
                    'analysis': analysis,
                    'tested_at': datetime.now().isoformat()
                }
        
        self.generate_button_report()

    def generate_button_report(self):
        """יצירת דוח כפתורים מפורט"""
        print("\n" + "=" * 50)
        print("📊 דוח ניתוח כפתורים מפורט")
        print("=" * 50)
        
        if not self.results:
            print("❌ לא נמצאו תוצאות")
            return
        
        # סיכום לפי עמוד
        print(f"📋 סיכום לפי עמוד:")
        
        for filename, data in sorted(self.results.items()):
            analysis = data['analysis']
            page_name = filename.replace('.html', '').replace('_', ' ').title()
            
            total_buttons = len(analysis.get('html_buttons', []))
            crud_ops = len(analysis.get('crud_operations', []))
            modals = len(analysis.get('modals', []))
            tables = len(analysis.get('tables', []))
            func_score = analysis.get('functionality_score', 0)
            
            print(f"\n   📄 {page_name}:")
            print(f"      🔘 כפתורים: {total_buttons}")
            print(f"      🔧 פעולות CRUD: {crud_ops}")
            print(f"      📝 מודלים: {modals}")
            print(f"      📋 טבלאות: {tables}")
            print(f"      🎯 ציון: {func_score}/100")
            
            # פירוט פעולות CRUD
            crud_breakdown = analysis.get('crud_breakdown', {})
            if crud_breakdown:
                crud_summary = f"C:{crud_breakdown.get('create', 0)} R:{crud_breakdown.get('read', 0)} U:{crud_breakdown.get('update', 0)} D:{crud_breakdown.get('delete', 0)}"
                print(f"      📊 CRUD: {crud_summary}")
            
            # דוגמאות כפתורים
            sample_buttons = analysis.get('html_buttons', [])[:3]
            if sample_buttons:
                print(f"      🎛️ דוגמאות:")
                for btn in sample_buttons:
                    btn_type = btn.get('type', 'other')
                    print(f"         - {btn['text'][:20]}... ({btn_type})")
        
        # סטטיסטיקות כלליות
        print(f"\n📊 סטטיסטיקות כלליות:")
        
        total_buttons_all = sum(len(data['analysis'].get('html_buttons', [])) for data in self.results.values())
        total_crud_ops = sum(len(data['analysis'].get('crud_operations', [])) for data in self.results.values())
        total_modals = sum(len(data['analysis'].get('modals', [])) for data in self.results.values())
        total_tables = sum(len(data['analysis'].get('tables', [])) for data in self.results.values())
        
        avg_functionality = sum(data['analysis'].get('functionality_score', 0) for data in self.results.values()) / len(self.results)
        
        print(f"   🔘 סך כל כפתורים: {total_buttons_all}")
        print(f"   🔧 סך פעולות CRUD: {total_crud_ops}")
        print(f"   📝 סך מודלים: {total_modals}")
        print(f"   📋 סך טבלאות: {total_tables}")
        print(f"   🎯 ממוצע פונקציונליות: {avg_functionality:.1f}/100")
        
        # המלצות
        print(f"\n💡 המלצות:")
        
        excellent_pages = sum(1 for data in self.results.values() if data['analysis'].get('functionality_score', 0) >= 80)
        good_pages = sum(1 for data in self.results.values() if 60 <= data['analysis'].get('functionality_score', 0) < 80)
        poor_pages = sum(1 for data in self.results.values() if data['analysis'].get('functionality_score', 0) < 60)
        
        if excellent_pages == len(self.results):
            print(f"   🎉 כל העמודים עשירים בפונקציונליות!")
        elif good_pages >= len(self.results) * 0.8:
            print(f"   👍 רוב העמודים תקינים, {poor_pages} דורשים שיפור")
        else:
            print(f"   ⚠️ {poor_pages} עמודים דורשים שיפור משמעותי")
        
        if total_crud_ops >= 20:
            print(f"   ✅ מערכת עשירה בפעולות CRUD")
        else:
            print(f"   🔧 ניתן להרחיב פעולות CRUD")
        
        # יצירת מדריך בדיקות מפורט
        self.create_detailed_testing_guide()
        
        # שמירת דוח
        self.save_button_analysis_report()

    def create_detailed_testing_guide(self):
        """יצירת מדריך בדיקות מפורט לכל כפתור"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        guide_file = f"/workspace/detailed-button-testing-guide-{timestamp}.md"
        
        content = f"""# מדריך בדיקת כפתורים מפורט - TikTrack
**נוצר**: {datetime.now().strftime('%d/%m/%Y %H:%M')}

## 🎯 מטרה
בדיקה מפורטת של כל כפתור בכל עמוד CRUD במערכת.

## 📋 הוראות
1. הפעל שרתר: `./start_dev.sh`
2. פתח Developer Tools (F12) → Console
3. עבור עמוד אחר עמוד ובדוק כל כפתור
4. תעד בעיות ותוצאות

---

"""
        
        for filename, data in self.results.items():
            analysis = data['analysis']
            page_name = filename.replace('.html', '').replace('_', ' ').title()
            page_url = f"http://localhost:8080/{filename.replace('.html', '')}" if filename != 'index.html' else "http://localhost:8080/"
            
            html_buttons = analysis.get('html_buttons', [])
            modals = analysis.get('modals', [])
            tables = analysis.get('tables', [])
            
            content += f"""
## 📄 {page_name}
**🔗 כתובת**: {page_url}
**📊 סיכום**: {len(html_buttons)} כפתורים, {len(modals)} מודלים, {len(tables)} טבלאות

### 🔍 בדיקות בסיסיות:
- [ ] עמוד נטען ללא שגיאות
- [ ] אין שגיאות JavaScript בקונסול
- [ ] כל הטקסט בעברית ו-RTL נכון

### 🎛️ כפתורים לבדיקה ({len(html_buttons)} כפתורים):
"""
            
            # מיון כפתורים לפי סוג
            crud_buttons = [b for b in html_buttons if b['type'] in ['create', 'update', 'delete', 'save']]
            other_buttons = [b for b in html_buttons if b['type'] not in ['create', 'update', 'delete', 'save']]
            
            if crud_buttons:
                content += f"\n#### 🔧 כפתורי CRUD:\n"
                for i, button in enumerate(crud_buttons, 1):
                    onclick_info = f" (onclick: {button['onclick'][:30]}...)" if button['onclick'] else ""
                    content += f"- [ ] **{button['text']}** ({button['type']}){onclick_info}\n"
                    content += f"  - [ ] כפתור נראה ולחיץ\n"
                    content += f"  - [ ] פעולה מתבצעת נכון\n"
                    content += f"  - [ ] אין שגיאות בקונסול\n\n"
            
            if other_buttons:
                content += f"\n#### 🎛️ כפתורים נוספים:\n"
                for button in other_buttons[:5]:  # רק 5 הראשונים
                    content += f"- [ ] **{button['text']}** ({button['type']})\n"
            
            if len(other_buttons) > 5:
                content += f"- [ ] ועוד {len(other_buttons) - 5} כפתורים נוספים...\n"
            
            # מודלים לבדיקה
            if modals:
                content += f"\n#### 📝 מודלים לבדיקה:\n"
                for modal in modals:
                    content += f"- [ ] **{modal}** - נפתח ונסגר נכון\n"
            
            # טבלאות לבדיקה
            if tables:
                content += f"\n#### 📋 טבלאות לבדיקה:\n"
                for table in tables:
                    content += f"- [ ] **{table}** - נטענת עם נתונים\n"
                    content += f"  - [ ] מיון עמודות עובד\n"
                    content += f"  - [ ] פעולות בעמודת הפעולות עובדות\n"
            
            content += f"""
### 🐛 בעיות שנמצאו:
```
(תעד כאן בעיות ספציפיות שמצאת בעמוד זה)


```

### 📊 ציון עמוד: _____ / 100

---
"""
        
        with open(guide_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"📋 מדריך מפורט נוצר: {guide_file}")

    def save_button_analysis_report(self):
        """שמירת דוח ניתוח כפתורים"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"/workspace/button-analysis-report-{timestamp}.json"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"💾 דוח ניתוח כפתורים נשמר: {report_file}")

def main():
    """פונקציה ראשית"""
    print("🎛️ מנתח כפתורים מפורט - TikTrack")
    print("=" * 35)
    
    analyzer = DetailedButtonAnalyzer()
    analyzer.analyze_crud_pages()
    
    print(f"\n🎯 ניתוח כפתורים הושלם!")

if __name__ == "__main__":
    main()