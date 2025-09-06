#!/usr/bin/env python3
"""
בדיקת CRUD לקבצי HTML סטטיים - ללא צורך בשרתר
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path

class StaticCRUDChecker:
    def __init__(self):
        self.results = {}
        self.trading_ui_path = Path("/workspace/trading-ui")
        
        # עמודים עיקריים לבדיקה
        self.main_pages = {
            'index.html': {
                'name': 'דף הבית',
                'expected_elements': [
                    'hero-banner', 'overview-section', 'charts-section', 
                    'actions-section', 'quick-link'
                ],
                'expected_buttons': [
                    'btn-outline-primary', 'action-btn', 'quick-refresh'
                ],
                'crud_level': 'view'
            },
            'trades.html': {
                'name': 'טריידים',
                'expected_elements': [
                    'addTradeBtn', 'tradesTable', 'editTradeBtn', 'deleteTradeBtn'
                ],
                'expected_buttons': [
                    'הוסף טרייד חדש', 'ערוך', 'מחק', 'סגור', 'בטל'
                ],
                'crud_level': 'full'
            },
            'accounts.html': {
                'name': 'חשבונות',
                'expected_elements': [
                    'addAccountBtn', 'accountsTable', 'editAccountBtn', 'deleteAccountBtn'
                ],
                'expected_buttons': [
                    'הוסף חשבון חדש', 'ערוך', 'מחק'
                ],
                'crud_level': 'full'
            },
            'alerts.html': {
                'name': 'התראות',
                'expected_elements': [
                    'addAlertBtn', 'alertsTable', 'editAlertBtn', 'deleteAlertBtn'
                ],
                'expected_buttons': [
                    'הוסף התראה חדשה', 'ערוך', 'מחק', 'בדוק תנאי'
                ],
                'crud_level': 'full'
            },
            'tickers.html': {
                'name': 'טיקרים',
                'expected_elements': [
                    'addTickerBtn', 'tickersTable', 'editTickerBtn', 'deleteTickerBtn'
                ],
                'expected_buttons': [
                    'הוסף טיקר חדש', 'ערוך', 'מחק', 'רענן מחיר'
                ],
                'crud_level': 'full'
            },
            'executions.html': {
                'name': 'ביצועים',
                'expected_elements': [
                    'addExecutionBtn', 'executionsTable', 'editExecutionBtn'
                ],
                'expected_buttons': [
                    'הוסף ביצוע חדש', 'ערוך', 'מחק'
                ],
                'crud_level': 'full'
            },
            'cash_flows.html': {
                'name': 'תזרימי מזומנים',
                'expected_elements': [
                    'addCashFlowBtn', 'cashFlowsTable'
                ],
                'expected_buttons': [
                    'הוסף תזרים חדש', 'ערוך', 'מחק'
                ],
                'crud_level': 'full'
            },
            'trade_plans.html': {
                'name': 'תוכניות מסחר', 
                'expected_elements': [
                    'addTradePlanBtn', 'tradePlansTable'
                ],
                'expected_buttons': [
                    'הוסף תוכנית חדשה', 'ערוך', 'מחק', 'בצע'
                ],
                'crud_level': 'full'
            },
            'notes.html': {
                'name': 'הערות',
                'expected_elements': [
                    'addNoteBtn', 'notesTable'
                ],
                'expected_buttons': [
                    'הוסף הערה חדשה', 'ערוך', 'מחק', 'צרף קובץ'
                ],
                'crud_level': 'full'
            },
            'preferences-v2.html': {
                'name': 'העדפות V1',
                'expected_elements': [
                    'savePreferencesBtn', 'resetBtn'
                ],
                'expected_buttons': [
                    'שמור העדפות', 'אפס לברירת מחדל'
                ],
                'crud_level': 'settings'
            },
            'preferences-v2.html': {
                'name': 'העדפות V2',
                'expected_elements': [
                    'saveBtn', 'exportBtn', 'importBtn'
                ],
                'expected_buttons': [
                    'שמור', 'ייצא', 'ייבא', 'איפוס'
                ],
                'crud_level': 'settings'
            },
            'css-management.html': {
                'name': 'מנהל CSS',
                'expected_elements': [
                    'switchOldBtn', 'switchNewBtn', 'runAnalysisBtn'
                ],
                'expected_buttons': [
                    'עבור למערכת ישנה', 'עבור למערכת חדשה', 'ניתוח CSS'
                ],
                'crud_level': 'admin'
            }
        }

    def analyze_html_file(self, filename):
        """ניתוח קובץ HTML לזיהוי כפתורים ואלמנטים"""
        file_path = self.trading_ui_path / filename
        
        if not file_path.exists():
            return {
                'status': 'error',
                'error': 'קובץ לא קיים',
                'file_exists': False
            }
        
        print(f"🔍 מנתח קובץ: {filename}")
        
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
                'scripts_included': '<script' in content
            }
            
            # חיפוש כפתורים
            button_patterns = [
                r'<button[^>]*>([^<]+)</button>',
                r'<input[^>]*type=["\']submit["\'][^>]*>',
                r'<input[^>]*type=["\']button["\'][^>]*>',
                r'class=["\'][^"\']*btn[^"\']*["\']',
                r'onclick=["\']([^"\']+)["\']'
            ]
            
            found_buttons = []
            for pattern in button_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                found_buttons.extend(matches)
            
            # חיפוש IDs ו-classes של כפתורים
            id_patterns = [
                r'id=["\']([^"\']*btn[^"\']*)["\']',
                r'id=["\']([^"\']*add[^"\']*)["\']',
                r'id=["\']([^"\']*edit[^"\']*)["\']',
                r'id=["\']([^"\']*delete[^"\']*)["\']',
                r'id=["\']([^"\']*save[^"\']*)["\']'
            ]
            
            found_ids = []
            for pattern in id_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                found_ids.extend(matches)
            
            # חיפוש JavaScript functions
            js_function_pattern = r'function\s+(\w+)\s*\('
            js_functions = re.findall(js_function_pattern, content)
            
            # חיפוש onclick handlers
            onclick_pattern = r'onclick=["\']([^"\']+)["\']'
            onclick_handlers = re.findall(onclick_pattern, content)
            
            # בדיקת אלמנטים צפויים
            page_info = self.main_pages.get(filename, {})
            expected_elements = page_info.get('expected_elements', [])
            expected_buttons = page_info.get('expected_buttons', [])
            
            found_expected_elements = []
            missing_expected_elements = []
            
            for element in expected_elements:
                if element in content:
                    found_expected_elements.append(element)
                else:
                    missing_expected_elements.append(element)
            
            # חישוב ציון
            basic_passed = sum(basic_checks.values())
            basic_total = len(basic_checks)
            
            expected_found = len(found_expected_elements)
            expected_total = len(expected_elements)
            
            if basic_total > 0:
                basic_score = (basic_passed / basic_total) * 100
            else:
                basic_score = 0
            
            if expected_total > 0:
                elements_score = (expected_found / expected_total) * 100
            else:
                elements_score = 100  # אם אין ציפיות ספציפיות
            
            # ציון משוקלל
            final_score = (basic_score * 0.7) + (elements_score * 0.3)
            
            print(f"   📊 בדיקות בסיסיות: {basic_passed}/{basic_total} ({basic_score:.1f}%)")
            print(f"   🎯 אלמנטים צפויים: {expected_found}/{expected_total} ({elements_score:.1f}%)")
            print(f"   🔍 כפתורים נמצאו: {len(set(found_buttons))} ")
            print(f"   📱 פונקציות JS: {len(set(js_functions))}")
            print(f"   📊 ציון כללי: {final_score:.1f}%")
            
            # קביעת grade
            if final_score >= 90:
                grade = 'מצוין'
                status = 'excellent'
            elif final_score >= 80:
                grade = 'טוב מאוד'
                status = 'good'
            elif final_score >= 70:
                grade = 'טוב'
                status = 'good'
            elif final_score >= 60:
                grade = 'בינוני'
                status = 'warning'
            else:
                grade = 'דרוש שיפור'
                status = 'error'
            
            print(f"   🏆 דירוג: {grade}")
            
            # רשימת בעיות
            issues = []
            failed_basic = [name for name, passed in basic_checks.items() if not passed]
            if failed_basic:
                issues.extend([f"בדיקה בסיסית נכשלה: {name}" for name in failed_basic])
            
            if missing_expected_elements:
                issues.extend([f"אלמנט חסר: {element}" for element in missing_expected_elements])
            
            if issues:
                print(f"   ⚠️ בעיות: {', '.join(issues[:3])}" + ("..." if len(issues) > 3 else ""))
            
            return {
                'status': status,
                'grade': grade,
                'score': final_score,
                'basic_checks': basic_checks,
                'basic_score': basic_score,
                'elements_score': elements_score,
                'found_buttons': list(set(found_buttons))[:10],  # רק הראשונים
                'found_ids': list(set(found_ids))[:10],
                'js_functions': list(set(js_functions))[:10],
                'onclick_handlers': list(set(onclick_handlers))[:5],
                'issues': issues,
                'file_size': len(content),
                'file_exists': True
            }
            
        except Exception as e:
            print(f"   ❌ שגיאה בניתוח: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'file_exists': True
            }

    def run_static_analysis(self):
        """הרצת ניתוח סטטי לכל הקבצים"""
        print("📁 בודק קבצי HTML סטטיים")
        print("=" * 35)
        
        # מיון עמודים לפי חשיבות
        priority_order = [
            'index.html', 'trades.html', 'accounts.html', 'alerts.html',
            'tickers.html', 'executions.html', 'cash_flows.html', 'trade_plans.html',
            'notes.html', 'preferences-v2.html', 'preferences-v2.html', 'css-management.html'
        ]
        
        for filename in priority_order:
            if filename in self.main_pages:
                result = self.analyze_html_file(filename)
                self.results[filename] = {
                    'info': self.main_pages[filename],
                    'analysis': result,
                    'tested_at': datetime.now().isoformat()
                }
        
        self.generate_static_summary()

    def generate_static_summary(self):
        """יצירת סיכום ניתוח סטטי"""
        print("\n" + "=" * 50)
        print("📊 סיכום ניתוח HTML סטטי")
        print("=" * 50)
        
        if not self.results:
            print("❌ לא נמצאו קבצים לבדיקה")
            return
        
        # ספירת תוצאות
        excellent = sum(1 for r in self.results.values() 
                       if r['analysis'].get('status') == 'excellent')
        good = sum(1 for r in self.results.values() 
                  if r['analysis'].get('status') == 'good')
        warning = sum(1 for r in self.results.values() 
                     if r['analysis'].get('status') == 'warning')
        error = sum(1 for r in self.results.values() 
                   if r['analysis'].get('status') == 'error')
        
        total = len(self.results)
        avg_score = sum(r['analysis'].get('score', 0) for r in self.results.values()) / total if total > 0 else 0
        
        print(f"📈 תוצאות כלליות:")
        print(f"   📄 קבצים נבדקו: {total}")
        print(f"   🏆 מצוינים: {excellent}")
        print(f"   ✅ טובים: {good}")
        print(f"   ⚠️ אזהרות: {warning}")
        print(f"   ❌ שגיאות: {error}")
        print(f"   📊 ממוצע: {avg_score:.1f}%")
        
        print(f"\n📋 תוצאות לפי קובץ:")
        
        # מיון לפי ציון
        sorted_results = sorted(
            self.results.items(),
            key=lambda x: x[1]['analysis'].get('score', 0),
            reverse=True
        )
        
        for filename, file_data in sorted_results:
            file_info = file_data['info']
            analysis = file_data['analysis']
            
            status = analysis.get('status', 'unknown')
            score = analysis.get('score', 0)
            grade = analysis.get('grade', 'לא ידוע')
            
            status_icon = {
                'excellent': '🏆',
                'good': '✅',
                'warning': '⚠️',
                'error': '❌'
            }.get(status, '❓')
            
            print(f"   {status_icon} {file_info['name']}: {score:.1f}% ({grade})")
            
            # הצגת בעיות
            issues = analysis.get('issues', [])
            if issues and len(issues) <= 3:
                for issue in issues:
                    print(f"      💥 {issue}")
            elif len(issues) > 3:
                print(f"      💥 {issues[0]}")
                print(f"      💥 +{len(issues)-1} בעיות נוספות")
        
        # בדיקות CSS החדשות
        self.check_new_css_integration()
        
        # יצירת הוראות בדיקה ידנית
        self.create_manual_testing_guide()
        
        # שמירת דוח
        self.save_static_report()

    def check_new_css_integration(self):
        """בדיקת השתלבות מערכת CSS החדשה"""
        print(f"\n🎨 בדיקת השתלבות מערכת CSS חדשה:")
        
        new_css_pages = 0
        old_css_pages = 0
        mixed_pages = 0
        
        for filename, file_data in self.results.items():
            analysis = file_data['analysis']
            basic_checks = analysis.get('basic_checks', {})
            
            if basic_checks.get('css_new_system', False):
                new_css_pages += 1
                print(f"   ✅ {file_data['info']['name']}: מערכת חדשה")
            else:
                file_path = self.trading_ui_path / filename
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if 'styles/' in content and 'styles-new/' in content:
                        mixed_pages += 1
                        print(f"   🔶 {file_data['info']['name']}: מעורב (ישן+חדש)")
                    elif 'styles/' in content:
                        old_css_pages += 1
                        print(f"   ❌ {file_data['info']['name']}: מערכת ישנה")
                    else:
                        print(f"   ❓ {file_data['info']['name']}: לא ברור")
                except:
                    print(f"   ❌ {file_data['info']['name']}: לא הצלחתי לקרוא")
        
        print(f"\n📊 סיכום CSS:")
        print(f"   ✅ מערכת חדשה: {new_css_pages}")
        print(f"   ❌ מערכת ישנה: {old_css_pages}")
        print(f"   🔶 מעורב: {mixed_pages}")
        
        if new_css_pages == len(self.results):
            print(f"   🎉 כל העמודים במערכת חדשה!")
        elif old_css_pages > 0:
            print(f"   ⚠️ יש עמודים שלא עודכנו למערכת חדשה")

    def create_manual_testing_guide(self):
        """יצירת מדריך בדיקות ידניות"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        guide_file = f"/workspace/manual-testing-guide-{timestamp}.md"
        
        content = f"""# מדריך בדיקות CRUD ידניות
**נוצר**: {datetime.now().strftime('%d/%m/%Y %H:%M')}
**שרת**: http://localhost:8080

## 🎯 הוראות כלליות
1. הפעל את השרת: `cd /workspace && ./start_dev.sh`
2. פתח דפדפן ולך לכתובת כל עמוד
3. פתח Developer Tools (F12) ולך לכרטיסייה Console
4. בצע כל בדיקה ברשימה
5. סמן ✅ או ❌ ליד כל פריט

---

"""
        
        for filename, file_data in self.results.items():
            file_info = file_data['info']
            analysis = file_data['analysis']
            
            # כתובת העמוד
            page_url = f"http://localhost:8080/{filename.replace('.html', '')}" if filename != 'index.html' else "http://localhost:8080/"
            
            content += f"""
## 📄 {file_info['name']}
**🔗 כתובת**: {page_url}
**🔧 רמת CRUD**: {file_info['crud_level']}

### ✅ בדיקות בסיסיות:
- [ ] העמוד נטען ללא שגיאות
- [ ] אין שגיאות JavaScript בקונסול
- [ ] עיצוב CSS נראה תקין (מערכת חדשה)
- [ ] RTL ועברית מוצגים נכון
- [ ] כל הטקסט קריא ובעברית

### 🔧 בדיקות כפתורים:
"""
            
            expected_buttons = file_info.get('expected_buttons', [])
            for button in expected_buttons:
                content += f"- [ ] **{button}** - כפתור קיים ועובד\n"
            
            if file_info['crud_level'] == 'full':
                content += f"""
### 📝 בדיקות CRUD מפורטות:
- [ ] **Create (יצירה)**:
  - [ ] כפתור הוספה פותח מודל
  - [ ] טופס מוצג נכון
  - [ ] אפשר למלא שדות
  - [ ] שמירה עובדת (נתוני בדיקה בלבד!)
  - [ ] רשומה חדשה מופיעה בטבלה
  
- [ ] **Read (קריאה)**:
  - [ ] טבלה נטענת עם נתונים
  - [ ] מיון עמודות עובד
  - [ ] פילטרים עובדים
  - [ ] רענון נתונים עובד
  
- [ ] **Update (עדכון)**:
  - [ ] כפתור עריכה פותח מודל עם נתונים
  - [ ] אפשר לשנות שדות
  - [ ] שמירת שינויים עובדת
  - [ ] שינויים מופיעים בטבלה
  
- [ ] **Delete (מחיקה)** - זהירות! רק על נתוני בדיקה:
  - [ ] כפתור מחיקה מציג אישור
  - [ ] מחיקה מתבצעת אחרי אישור
  - [ ] רשומה נעלמת מהטבלה
"""
            
            content += f"""
### 🐛 בעיות שנמצאו:
```
(רשום כאן בעיות ספציפיות)


```

### 📊 ציון סופי: _____ / 100

---
"""
        
        with open(guide_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"\n📋 מדריך בדיקות ידניות נוצר: {guide_file}")

    def save_static_report(self):
        """שמירת דוח ניתוח סטטי"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"/workspace/static-html-analysis-{timestamp}.json"
        
        # חישוב סטטיסטיקות כלליות
        total_files = len(self.results)
        avg_score = sum(r['analysis'].get('score', 0) for r in self.results.values()) / total_files if total_files > 0 else 0
        
        excellent_count = sum(1 for r in self.results.values() if r['analysis'].get('status') == 'excellent')
        good_count = sum(1 for r in self.results.values() if r['analysis'].get('status') == 'good')
        warning_count = sum(1 for r in self.results.values() if r['analysis'].get('status') == 'warning')
        error_count = sum(1 for r in self.results.values() if r['analysis'].get('status') == 'error')
        
        report_data = {
            'test_info': {
                'type': 'static_html_analysis',
                'timestamp': datetime.now().isoformat(),
                'total_files': total_files
            },
            'summary': {
                'average_score': avg_score,
                'excellent_count': excellent_count,
                'good_count': good_count,
                'warning_count': warning_count,
                'error_count': error_count,
                'success_rate': ((excellent_count + good_count) / total_files * 100) if total_files > 0 else 0
            },
            'detailed_results': self.results
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 דוח ניתוח נשמר: {report_file}")
        
        # סיכום המלצות
        print(f"\n💡 המלצות:")
        if avg_score >= 90:
            print(f"   🎉 כל הקבצים במצב מצוין!")
            print(f"   ✅ מערכת CSS החדשה משתלבת מושלם")
            print(f"   🚀 מוכן לבדיקות פונקציונליות עם שרתר")
        elif avg_score >= 75:
            print(f"   👍 רוב הקבצים תקינים")
            print(f"   🔧 כמה תיקונים קלים נדרשים")
        else:
            print(f"   ⚠️ יש בעיות משמעותיות בכמה קבצים")
            
        if error_count > 0:
            print(f"   🚨 {error_count} קבצים עם שגיאות - דרוש תיקון מיידי")
        
        # הוראות המשך
        print(f"\n📋 שלבים הבאים:")
        print(f"   1. הפעל שרתר: ./start_dev.sh")
        print(f"   2. בצע בדיקות ידניות עם המדריך שנוצר")
        print(f"   3. בדוק פונקציונליות CRUD בעמודים הקריטיים")
        print(f"   4. תקן בעיות שנמצאו")

def main():
    """הרצת בדיקה סטטית"""
    print("📁 בדיקת HTML סטטית - TikTrack")
    print("=" * 30)
    
    checker = StaticCRUDChecker()
    checker.run_static_analysis()
    
    print(f"\n🎯 בדיקה סטטית הושלמה!")
    print(f"💡 לבדיקה פונקציונלית, הפעל שרתר והשתמש במדריך שנוצר.")

if __name__ == "__main__":
    main()