#!/usr/bin/env python3
"""
בדיקה מקיפה של כל העמודים במערכת TikTrack
בודק את כל העמודים עם כפתורים ופונקציונליות CRUD
"""

import os
import re
from datetime import datetime
from pathlib import Path

class ComprehensiveCRUDChecker:
    def __init__(self):
        self.trading_ui_path = Path("/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui")
        self.results = {}
        
        # כל העמודים במערכת
        self.all_pages = {
            # עמודי CRUD עיקריים
            'trades.html': {'type': 'CRUD', 'priority': 'high'},
            'accounts.html': {'type': 'CRUD', 'priority': 'high'},
            'alerts.html': {'type': 'CRUD', 'priority': 'high'},
            'tickers.html': {'type': 'CRUD', 'priority': 'high'},
            'executions.html': {'type': 'CRUD', 'priority': 'high'},
            'cash_flows.html': {'type': 'CRUD', 'priority': 'high'},
            'trade_plans.html': {'type': 'CRUD', 'priority': 'high'},
            'notes.html': {'type': 'CRUD', 'priority': 'high'},
            
            # עמודי הגדרות
            'preferences-v2.html': {'type': 'Settings', 'priority': 'high'},
            'research.html': {'type': 'Settings', 'priority': 'medium'},
            
            # עמודי מערכת
            'db_display.html': {'type': 'System', 'priority': 'high'},
            'server-monitor.html': {'type': 'System', 'priority': 'medium'},
            'css-management.html': {'type': 'System', 'priority': 'medium'},
            'system-management.html': {'type': 'System', 'priority': 'medium'},
            'external-data-dashboard.html': {'type': 'System', 'priority': 'medium'},
            
            # עמודי פיתוח
            'background-tasks.html': {'type': 'Development', 'priority': 'low'},
            'cache-test.html': {'type': 'Development', 'priority': 'low'},
            'color-scheme-examples.html': {'type': 'Development', 'priority': 'low'},
            'constraints.html': {'type': 'Development', 'priority': 'low'},
            'designs.html': {'type': 'Development', 'priority': 'low'},
            'js-map.html': {'type': 'Development', 'priority': 'low'},
            'linter-realtime-monitor.html': {'type': 'Development', 'priority': 'low'},
            'notifications-center.html': {'type': 'Development', 'priority': 'low'},
            'numeric-value-colors-demo.html': {'type': 'Development', 'priority': 'low'},
            'page-scripts-matrix.html': {'type': 'Development', 'priority': 'low'},
            'style_demonstration.html': {'type': 'Development', 'priority': 'low'},
            'test-header-only.html': {'type': 'Development', 'priority': 'low'},
            
            # עמודים מיוחדים
            'index.html': {'type': 'Main', 'priority': 'high'},
            'crud-testing-dashboard.html': {'type': 'Testing', 'priority': 'low'},
        }

    def check_page_functionality(self, filename):
        """בדיקת פונקציונליות עמוד"""
        file_path = self.trading_ui_path / filename
        
        if not file_path.exists():
            return {'error': 'קובץ לא קיים'}
        
        print(f"🔍 בודק עמוד: {filename}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # בדיקת כפתורים
            button_count = len(re.findall(r'<button[^>]*>', content, re.IGNORECASE))
            onclick_count = len(re.findall(r'onclick=["\'][^"\']*["\']', content, re.IGNORECASE))
            
            # בדיקת מודלים
            modal_count = len(re.findall(r'<div[^>]*class=[^>]*modal', content, re.IGNORECASE))
            
            # בדיקת טבלאות
            table_count = len(re.findall(r'<table[^>]*>', content, re.IGNORECASE))
            
            # בדיקת טפסים
            form_count = len(re.findall(r'<form[^>]*>', content, re.IGNORECASE))
            
            # בדיקת פונקציות JavaScript
            js_functions = re.findall(r'function\s+(\w+)\s*\(', content)
            
            # בדיקת קישורים
            link_count = len(re.findall(r'<a[^>]*href', content, re.IGNORECASE))
            
            # חישוב ציון
            functionality_score = 0
            
            # כפתורים (30%)
            if button_count > 0:
                functionality_score += min(30, button_count * 2)
            
            # מודלים (25%)
            if modal_count > 0:
                functionality_score += min(25, modal_count * 5)
            
            # טבלאות (20%)
            if table_count > 0:
                functionality_score += min(20, table_count * 10)
            
            # טפסים (15%)
            if form_count > 0:
                functionality_score += min(15, form_count * 7)
            
            # פונקציות JavaScript (10%)
            if js_functions:
                functionality_score += min(10, len(js_functions))
            
            functionality_score = min(functionality_score, 100)
            
            # דירוג
            if functionality_score >= 90:
                grade = 'מצוין'
            elif functionality_score >= 80:
                grade = 'טוב מאוד'
            elif functionality_score >= 70:
                grade = 'טוב'
            elif functionality_score >= 60:
                grade = 'בינוני'
            else:
                grade = 'דורש שיפור'
            
            print(f"   📊 כפתורים: {button_count}")
            print(f"   🔧 פונקציות onclick: {onclick_count}")
            print(f"   📝 מודלים: {modal_count}")
            print(f"   📋 טבלאות: {table_count}")
            print(f"   📄 טפסים: {form_count}")
            print(f"   ⚙️ פונקציות JS: {len(js_functions)}")
            print(f"   🔗 קישורים: {link_count}")
            print(f"   🎯 ציון: {functionality_score}% - {grade}")
            
            return {
                'button_count': button_count,
                'onclick_count': onclick_count,
                'modal_count': modal_count,
                'table_count': table_count,
                'form_count': form_count,
                'js_functions': js_functions,
                'link_count': link_count,
                'functionality_score': functionality_score,
                'grade': grade
            }
            
        except Exception as e:
            print(f"   ❌ שגיאה בבדיקת עמוד: {e}")
            return {'error': str(e)}

    def run_comprehensive_check(self):
        """הרצת בדיקה מקיפה"""
        print("🎯 בדיקה מקיפה של כל העמודים - TikTrack")
        print("=" * 50)
        
        total_pages = len(self.all_pages)
        checked_pages = 0
        
        for filename, page_info in self.all_pages.items():
            result = self.check_page_functionality(filename)
            page_name = filename.replace('.html', '').replace('_', ' ').title()
            
            self.results[filename] = {
                'name': page_name,
                'type': page_info['type'],
                'priority': page_info['priority'],
                'result': result,
                'tested_at': datetime.now().isoformat()
            }
            
            checked_pages += 1
            print(f"   ✅ {checked_pages}/{total_pages} עמודים נבדקו")
            print()
        
        self.generate_comprehensive_summary()

    def generate_comprehensive_summary(self):
        """יצירת סיכום מקיף"""
        print("=" * 60)
        print("📊 סיכום בדיקה מקיפה - כל העמודים")
        print("=" * 60)
        
        if not self.results:
            print("❌ לא נמצאו תוצאות")
            return
        
        # ספירת תוצאות לפי סוג
        crud_pages = [r for r in self.results.values() if r['type'] == 'CRUD']
        settings_pages = [r for r in self.results.values() if r['type'] == 'Settings']
        system_pages = [r for r in self.results.values() if r['type'] == 'System']
        development_pages = [r for r in self.results.values() if r['type'] == 'Development']
        main_pages = [r for r in self.results.values() if r['type'] == 'Main']
        testing_pages = [r for r in self.results.values() if r['type'] == 'Testing']
        
        # ספירת ציונים
        excellent = sum(1 for r in self.results.values() 
                       if r['result'].get('functionality_score', 0) >= 90)
        very_good = sum(1 for r in self.results.values() 
                       if 80 <= r['result'].get('functionality_score', 0) < 90)
        good = sum(1 for r in self.results.values() 
                  if 70 <= r['result'].get('functionality_score', 0) < 80)
        poor = sum(1 for r in self.results.values() 
                  if r['result'].get('functionality_score', 0) < 70)
        
        # חישוב ממוצעים
        valid_results = [r for r in self.results.values() if 'error' not in r['result']]
        if valid_results:
            avg_score = sum(r['result'].get('functionality_score', 0) for r in valid_results) / len(valid_results)
        else:
            avg_score = 0
        
        # סטטיסטיקות כלליות
        total_buttons = sum(r['result'].get('button_count', 0) for r in valid_results)
        total_modals = sum(r['result'].get('modal_count', 0) for r in valid_results)
        total_tables = sum(r['result'].get('table_count', 0) for r in valid_results)
        total_forms = sum(r['result'].get('form_count', 0) for r in valid_results)
        total_js_functions = sum(len(r['result'].get('js_functions', [])) for r in valid_results)
        
        print(f"📈 תוצאות כלליות:")
        print(f"   📄 סך כל עמודים: {len(self.results)}")
        print(f"   🏆 מצוינים: {excellent}")
        print(f"   🌟 טוב מאוד: {very_good}")
        print(f"   ✅ טובים: {good}")
        print(f"   ⚠️ דורשים שיפור: {poor}")
        print(f"   📊 ממוצע כללי: {avg_score:.1f}%")
        print()
        
        print(f"📊 סטטיסטיקות כלליות:")
        print(f"   🔘 סך כל כפתורים: {total_buttons}")
        print(f"   📝 סך כל מודלים: {total_modals}")
        print(f"   📋 סך כל טבלאות: {total_tables}")
        print(f"   📄 סך כל טפסים: {total_forms}")
        print(f"   ⚙️ סך כל פונקציות JS: {total_js_functions}")
        print()
        
        # פירוט לפי סוג עמוד
        print(f"📋 פירוט לפי סוג עמוד:")
        print(f"   🏢 עמודי CRUD: {len(crud_pages)} עמודים")
        print(f"   ⚙️ עמודי הגדרות: {len(settings_pages)} עמודים")
        print(f"   🖥️ עמודי מערכת: {len(system_pages)} עמודים")
        print(f"   🛠️ עמודי פיתוח: {len(development_pages)} עמודים")
        print(f"   🏠 עמודים ראשיים: {len(main_pages)} עמודים")
        print(f"   🧪 עמודי בדיקה: {len(testing_pages)} עמודים")
        print()
        
        # תוצאות מפורטות לפי סוג
        self.print_detailed_results("🏢 עמודי CRUD", crud_pages)
        self.print_detailed_results("⚙️ עמודי הגדרות", settings_pages)
        self.print_detailed_results("🖥️ עמודי מערכת", system_pages)
        self.print_detailed_results("🛠️ עמודי פיתוח", development_pages)
        self.print_detailed_results("🏠 עמודים ראשיים", main_pages)
        self.print_detailed_results("🧪 עמודי בדיקה", testing_pages)
        
        # המלצות
        self.generate_recommendations()

    def print_detailed_results(self, title, pages):
        """הדפסת תוצאות מפורטות לפי סוג"""
        if not pages:
            return
            
        print(f"{title}:")
        
        for page in pages:
            result = page['result']
            if 'error' in result:
                print(f"   ❌ {page['name']}: שגיאה ({result['error']})")
                continue
            
            score = result.get('functionality_score', 0)
            grade = result.get('grade', 'לא ידוע')
            buttons = result.get('button_count', 0)
            modals = result.get('modal_count', 0)
            tables = result.get('table_count', 0)
            
            grade_icon = '🏆' if score >= 90 else '🌟' if score >= 80 else '✅' if score >= 70 else '⚠️'
            
            print(f"   {grade_icon} {page['name']}: {score}% - {grade}")
            print(f"      🔘 כפתורים: {buttons}, 📝 מודלים: {modals}, 📋 טבלאות: {tables}")
        
        print()

    def generate_recommendations(self):
        """יצירת המלצות"""
        print("🛠️ המלצות:")
        
        # עמודים דורשי שיפור
        poor_pages = [(p['name'], p['result'].get('functionality_score', 0)) 
                     for p in self.results.values() 
                     if p['result'].get('functionality_score', 0) < 70 and 'error' not in p['result']]
        
        if poor_pages:
            print(f"   ⚠️ עמודים דורשי שיפור:")
            for name, score in poor_pages:
                print(f"      - {name}: {score}%")
        else:
            print(f"   🎉 כל העמודים במצב טוב!")
        
        # עמודים ללא כפתורים
        no_buttons = [(p['name'], p['result'].get('button_count', 0)) 
                     for p in self.results.values() 
                     if p['result'].get('button_count', 0) == 0 and 'error' not in p['result']]
        
        if no_buttons:
            print(f"   📝 עמודים ללא כפתורים:")
            for name, buttons in no_buttons:
                print(f"      - {name}: {buttons} כפתורים")
        
        print(f"   ✅ בדיקה מקיפה הושלמה בהצלחה!")

def main():
    """בדיקה מקיפה של כל העמודים"""
    print("🎯 בדיקה מקיפה של כל העמודים - TikTrack")
    print("=" * 50)
    
    checker = ComprehensiveCRUDChecker()
    checker.run_comprehensive_check()

if __name__ == "__main__":
    main()
