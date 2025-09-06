#!/usr/bin/env python3
"""
כלי בדיקת CRUD משופר - מוצא כפתורים אמיתיים
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path

class ImprovedCRUDChecker:
    def __init__(self):
        self.results = {}
        self.trading_ui_path = Path("/workspace/trading-ui")
        
        # עמודים עיקריים לבדיקה
        self.main_pages = {
            'index.html': {
                'name': 'דף הבית',
                'crud_level': 'view'
            },
            'trades.html': {
                'name': 'טריידים',
                'crud_level': 'full'
            },
            'accounts.html': {
                'name': 'חשבונות', 
                'crud_level': 'full'
            },
            'alerts.html': {
                'name': 'התראות',
                'crud_level': 'full'
            },
            'tickers.html': {
                'name': 'טיקרים',
                'crud_level': 'full'
            },
            'executions.html': {
                'name': 'ביצועים',
                'crud_level': 'full'
            },
            'cash_flows.html': {
                'name': 'תזרימי מזומנים',
                'crud_level': 'full'
            },
            'trade_plans.html': {
                'name': 'תוכניות מסחר',
                'crud_level': 'full'
            },
            'notes.html': {
                'name': 'הערות',
                'crud_level': 'full'
            },
            'preferences.html': {
                'name': 'העדפות V1',
                'crud_level': 'settings'
            },
            'preferences-v2.html': {
                'name': 'העדפות V2',
                'crud_level': 'settings'
            },
            'css-management.html': {
                'name': 'מנהל CSS',
                'crud_level': 'admin'
            }
        }

    def analyze_page_improved(self, filename):
        """ניתוח משופר של עמוד"""
        file_path = self.trading_ui_path / filename
        
        if not file_path.exists():
            return {'status': 'error', 'error': 'קובץ לא קיים'}
        
        print(f"🔍 מנתח עמוד משופר: {filename}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # בדיקות בסיסיות
            basic_checks = {
                'has_doctype': '<!DOCTYPE html>' in content,
                'has_html_tag': '<html' in content,
                'has_head': '<head>' in content,
                'has_body': '<body' in content,
                'has_title': '<title>' in content,
                'rtl_support': 'dir="rtl"' in content,
                'hebrew_lang': 'lang="he"' in content,
                'css_new_system': 'styles-new/main.css' in content,
                'bootstrap_included': 'bootstrap' in content,
                'scripts_included': '<script' in content,
                'no_broken_html': content.count('<') == content.count('>'),
                'proper_structure': '</head>' in content and '</body>' in content
            }
            
            # חיפוש כפתורים אמיתיים (לא רק IDs ספציפיים)
            real_buttons = self.find_real_buttons(content)
            
            # חיפוש טבלאות אמיתיות
            real_tables = self.find_real_tables(content)
            
            # חיפוש מודלים
            real_modals = self.find_real_modals(content)
            
            # חיפוש פונקציות CRUD
            crud_functions = self.find_crud_functions(content)
            
            # חישוב ציון משופר
            basic_passed = sum(basic_checks.values())
            basic_total = len(basic_checks)
            basic_score = (basic_passed / basic_total) * 100 if basic_total > 0 else 0
            
            # ציון פונקציונליות משופר
            crud_score = len(crud_functions) * 5  # כל פונקציית CRUD = 5 נקודות
            buttons_score = len(real_buttons) * 2  # כל כפתור = 2 נקודות
            modals_score = len(real_modals) * 10   # כל מודל = 10 נקודות
            tables_score = len(real_tables) * 15   # כל טבלה = 15 נקודות
            
            functionality_score = min(crud_score + buttons_score + modals_score + tables_score, 100)
            
            # ציון כללי משוקלל
            final_score = (basic_score * 0.6) + (functionality_score * 0.4)
            
            # קביעת דירוג
            if final_score >= 90:
                grade = 'מצוין'
                status = 'excellent'
            elif final_score >= 80:
                grade = 'טוב מאוד' 
                status = 'very_good'
            elif final_score >= 70:
                grade = 'טוב'
                status = 'good'
            elif final_score >= 60:
                grade = 'בינוני'
                status = 'warning'
            else:
                grade = 'דרוש תיקון'
                status = 'error'
            
            print(f"   📊 בדיקות בסיסיות: {basic_passed}/{basic_total} ({basic_score:.1f}%)")
            print(f"   🔘 כפתורים: {len(real_buttons)}")
            print(f"   📝 מודלים: {len(real_modals)}")  
            print(f"   📋 טבלאות: {len(real_tables)}")
            print(f"   🔧 פונקציות CRUD: {len(crud_functions)}")
            print(f"   🎯 ציון סופי: {final_score:.1f}% ({grade})")
            
            # זיהוי בעיות אמיתיות
            issues = []
            
            failed_basic = [name for name, passed in basic_checks.items() if not passed]
            if failed_basic:
                issues.extend([f"בדיקה בסיסית: {name}" for name in failed_basic])
            
            if self.main_pages[filename]['crud_level'] == 'full':
                if len(real_buttons) < 3:
                    issues.append("מעט כפתורים - ייתכן בעיה בזיהוי")
                if len(real_tables) == 0:
                    issues.append("לא נמצאו טבלאות")
                if len(crud_functions) == 0:
                    issues.append("לא נמצאו פונקציות CRUD")
            
            if issues:
                print(f"   ⚠️ בעיות זוהו: {len(issues)}")
                for issue in issues[:3]:
                    print(f"      - {issue}")
                if len(issues) > 3:
                    print(f"      - ועוד {len(issues)-3} בעיות...")
            
            return {
                'status': status,
                'grade': grade,
                'score': final_score,
                'basic_checks': basic_checks,
                'basic_score': basic_score,
                'functionality_score': functionality_score,
                'real_buttons': real_buttons[:10],  # רק 10 הראשונים
                'real_modals': real_modals,
                'real_tables': real_tables,
                'crud_functions': crud_functions,
                'issues': issues,
                'file_size': len(content)
            }
            
        except Exception as e:
            print(f"   ❌ שגיאה: {e}")
            return {'status': 'error', 'error': str(e)}

    def find_real_buttons(self, content):
        """מציאת כפתורים אמיתיים"""
        buttons = []
        
        # כפתורי HTML רגילים
        button_pattern = r'<button[^>]*>([^<]+)</button>'
        html_buttons = re.finditer(button_pattern, content, re.IGNORECASE | re.DOTALL)
        
        for match in html_buttons:
            button_text = match.group(1).strip()
            if button_text and len(button_text) < 50:  # לא כפתורים עם תוכן HTML מורכב
                buttons.append({
                    'type': 'html_button',
                    'text': button_text,
                    'source': 'HTML'
                })
        
        # כפתורי input
        input_button_pattern = r'<input[^>]*type=["\']button[^>]*value=["\']([^"\']+)["\']'
        input_buttons = re.finditer(input_button_pattern, content, re.IGNORECASE)
        
        for match in input_buttons:
            button_text = match.group(1).strip()
            buttons.append({
                'type': 'input_button',
                'text': button_text,
                'source': 'INPUT'
            })
        
        # כפתורי submit
        submit_pattern = r'<input[^>]*type=["\']submit[^>]*value=["\']([^"\']+)["\']'
        submit_buttons = re.finditer(submit_pattern, content, re.IGNORECASE)
        
        for match in submit_buttons:
            button_text = match.group(1).strip()
            buttons.append({
                'type': 'submit_button',
                'text': button_text,
                'source': 'SUBMIT'
            })
        
        return buttons

    def find_real_tables(self, content):
        """מציאת טבלאות אמיתיות"""
        tables = []
        
        # חיפוש כל הטבלאות עם או בלי ID
        table_pattern = r'<table[^>]*>'
        table_matches = re.finditer(table_pattern, content, re.IGNORECASE)
        
        for match in table_matches:
            table_tag = match.group(0)
            
            # חיפוש ID
            id_match = re.search(r'id=["\']([^"\']+)["\']', table_tag)
            table_id = id_match.group(1) if id_match else 'ללא ID'
            
            # חיפוש class
            class_match = re.search(r'class=["\']([^"\']+)["\']', table_tag)
            table_class = class_match.group(1) if class_match else 'ללא class'
            
            tables.append({
                'id': table_id,
                'class': table_class,
                'tag': table_tag
            })
        
        return tables

    def find_real_modals(self, content):
        """מציאת מודלים אמיתיים"""
        modals = []
        
        modal_pattern = r'<div[^>]*class=[^>]*modal[^>]*>'
        modal_matches = re.finditer(modal_pattern, content, re.IGNORECASE)
        
        for match in modal_matches:
            modal_tag = match.group(0)
            
            # חיפוש ID
            id_match = re.search(r'id=["\']([^"\']+)["\']', modal_tag)
            modal_id = id_match.group(1) if id_match else 'ללא ID'
            
            modals.append(modal_id)
        
        return modals

    def find_crud_functions(self, content):
        """מציאת פונקציות CRUD אמיתיות"""
        crud_functions = []
        
        # חיפוש פונקציות JavaScript
        function_pattern = r'function\s+(\w+)\s*\([^)]*\)|(\w+)\s*=\s*function|\w*onclick=["\'][^"\']*(\w+)\([^"\']*["\']'
        
        crud_keywords = ['add', 'edit', 'update', 'delete', 'save', 'create', 'remove', 
                        'הוסף', 'ערוך', 'מחק', 'שמור', 'יצור', 'צור']
        
        # חיפוש onclick handlers
        onclick_pattern = r'onclick=["\']([^"\']+)["\']'
        onclick_matches = re.findall(onclick_pattern, content)
        
        for onclick in onclick_matches:
            for keyword in crud_keywords:
                if keyword.lower() in onclick.lower():
                    crud_functions.append({
                        'type': 'onclick',
                        'function': onclick.split('(')[0],
                        'full_call': onclick
                    })
                    break
        
        # חיפוש פונקציות ישירות
        js_function_pattern = r'function\s+(\w*(?:add|edit|delete|save|create|update|remove)\w*)\s*\('
        js_functions = re.findall(js_function_pattern, content, re.IGNORECASE)
        
        for func in js_functions:
            crud_functions.append({
                'type': 'js_function',
                'function': func,
                'full_call': f'{func}()'
            })
        
        return crud_functions

    def run_improved_analysis(self):
        """הרצת ניתוח משופר"""
        print("🔧 בודק CRUD משופר - כפתורים אמיתיים")
        print("=" * 45)
        
        for filename, page_info in self.main_pages.items():
            analysis = self.analyze_page_improved(filename)
            
            self.results[filename] = {
                'info': page_info,
                'analysis': analysis,
                'tested_at': datetime.now().isoformat()
            }
        
        self.generate_improved_summary()

    def generate_improved_summary(self):
        """יצירת סיכום משופר"""
        print("\n" + "=" * 50)
        print("📊 סיכום בדיקות CRUD משופר")  
        print("=" * 50)
        
        if not self.results:
            print("❌ לא נמצאו תוצאות")
            return
        
        # ספירת תוצאות
        excellent = sum(1 for r in self.results.values() if r['analysis'].get('status') == 'excellent')
        very_good = sum(1 for r in self.results.values() if r['analysis'].get('status') == 'very_good')
        good = sum(1 for r in self.results.values() if r['analysis'].get('status') == 'good')
        warning = sum(1 for r in self.results.values() if r['analysis'].get('status') == 'warning')
        error = sum(1 for r in self.results.values() if r['analysis'].get('status') == 'error')
        
        total = len(self.results)
        avg_score = sum(r['analysis'].get('score', 0) for r in self.results.values()) / total
        success_rate = ((excellent + very_good + good) / total * 100) if total > 0 else 0
        
        print(f"📈 תוצאות כלליות:")
        print(f"   📄 עמודים נבדקו: {total}")
        print(f"   🏆 מצוינים: {excellent}")
        print(f"   🌟 טוב מאוד: {very_good}")
        print(f"   ✅ טובים: {good}")
        print(f"   ⚠️ אזהרות: {warning}")
        print(f"   ❌ שגיאות: {error}")
        print(f"   📊 ממוצע: {avg_score:.1f}%")
        print(f"   🎯 אחוז הצלחה: {success_rate:.1f}%")
        
        # תוצאות מפורטות
        print(f"\n📋 תוצאות לפי עמוד:")
        
        sorted_results = sorted(
            self.results.items(),
            key=lambda x: x[1]['analysis'].get('score', 0),
            reverse=True
        )
        
        for filename, data in sorted_results:
            page_info = data['info']
            analysis = data['analysis']
            
            status = analysis.get('status', 'unknown')
            score = analysis.get('score', 0)
            grade = analysis.get('grade', 'לא ידוע')
            
            status_icon = {
                'excellent': '🏆',
                'very_good': '🌟',
                'good': '✅',
                'warning': '⚠️',
                'error': '❌'
            }.get(status, '❓')
            
            buttons_count = len(analysis.get('real_buttons', []))
            modals_count = len(analysis.get('real_modals', []))
            tables_count = len(analysis.get('real_tables', []))
            crud_count = len(analysis.get('crud_functions', []))
            
            print(f"   {status_icon} {page_info['name']}: {score:.1f}% ({grade})")
            print(f"      🔘 כפתורים: {buttons_count}, 📝 מודלים: {modals_count}, 📋 טבלאות: {tables_count}, 🔧 CRUD: {crud_count}")
            
            issues = analysis.get('issues', [])
            if issues:
                for issue in issues[:2]:
                    print(f"      💥 {issue}")
                if len(issues) > 2:
                    print(f"      💥 ועוד {len(issues)-2} בעיות...")
        
        # זיהוי עמודים שדורשים תיקון
        problematic_pages = [
            (filename, data) for filename, data in self.results.items()
            if data['analysis'].get('score', 0) < 70
        ]
        
        if problematic_pages:
            print(f"\n🔧 עמודים שדורשים תיקון ({len(problematic_pages)}):")
            for filename, data in problematic_pages:
                page_name = data['info']['name']
                score = data['analysis'].get('score', 0)
                main_issues = data['analysis'].get('issues', [])[:2]
                
                print(f"   ❌ {page_name} ({score:.1f}%):")
                for issue in main_issues:
                    print(f"      - {issue}")
        
        # שמירת דוח
        self.save_improved_report()
        
        # המלצות לתיקון
        self.generate_fix_recommendations()

    def generate_fix_recommendations(self):
        """יצירת המלצות תיקון ספציפיות"""
        print(f"\n🛠️ המלצות תיקון ספציפיות:")
        
        for filename, data in self.results.items():
            analysis = data['analysis']
            if analysis.get('score', 100) < 70:
                page_name = data['info']['name']
                issues = analysis.get('issues', [])
                
                print(f"\n📄 {page_name}:")
                
                if 'בדיקה בסיסית: has_body' in issues:
                    print(f"   🔧 תיקון דרוש: הקובץ חסר תוכן body - צריך שחזור מגיבוי")
                    
                if analysis.get('real_tables', []) == []:
                    print(f"   🔧 תיקון דרוש: הוסף טבלה עם id=\"{filename.replace('.html', '')}Table\"")
                
                if len(analysis.get('real_buttons', [])) < 3:
                    print(f"   🔧 תיקון דרוש: הוסף כפתורי CRUD בסיסיים")
                    
                if len(analysis.get('crud_functions', [])) == 0:
                    print(f"   🔧 תיקון דרוש: הוסף JavaScript functions לטיפול ב-CRUD")

    def save_improved_report(self):
        """שמירת דוח משופר"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"/workspace/improved-crud-analysis-{timestamp}.json"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 דוח משופר נשמר: {report_file}")

def main():
    """פונקציה ראשית"""
    print("🔧 בודק CRUD משופר - TikTrack")
    print("=" * 30)
    
    checker = ImprovedCRUDChecker()
    checker.run_improved_analysis()
    
    print(f"\n🎯 בדיקה משופרת הושלמה!")

if __name__ == "__main__":
    main()