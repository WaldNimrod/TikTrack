#!/usr/bin/env python3
"""
כלי בדיקת CRUD ידני עם curl - ללא תלות במודולים חיצוניים
"""

import os
import subprocess
import json
import time
from datetime import datetime
from pathlib import Path

class ManualCRUDTester:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.results = []
        
        # רשימת עמודים לבדיקה עם הכפתורים החשובים
        self.pages_to_test = {
            'index': {
                'name': 'דף הבית',
                'url': '/',
                'main_buttons': [
                    'קישורי ניווט בכותרת',
                    'כפתורי פעולות מהירות', 
                    'לינקים לעמודים אחרים',
                    'רענון נתונים'
                ],
                'crud_level': 'view_only',
                'priority': 'high'
            },
            'trades': {
                'name': 'טריידים',
                'url': '/trades',
                'main_buttons': [
                    'הוסף טרייד חדש',
                    'ערוך טרייד',
                    'מחק טרייד', 
                    'סגור טרייד',
                    'בטל טרייד',
                    'רענן נתונים',
                    'ייצא לאקסל',
                    'מיון עמודות',
                    'פילטר לפי סטטוס',
                    'פילטר לפי טיקר'
                ],
                'crud_level': 'full',
                'priority': 'critical'
            },
            'accounts': {
                'name': 'חשבונות',
                'url': '/accounts',
                'main_buttons': [
                    'הוסף חשבון מסחר חדש',
                    'ערוך חשבון מסחר',
                    'מחק חשבון מסחר',
                    'הצג פרטים',
                    'רענן נתונים',
                    'ייצא נתונים',
                    'מיון עמודות'
                ],
                'crud_level': 'full',
                'priority': 'critical'
            },
            'alerts': {
                'name': 'התראות', 
                'url': '/alerts',
                'main_buttons': [
                    'הוסף התראה חדשה',
                    'ערוך התראה',
                    'מחק התראה',
                    'בדוק תנאי',
                    'הפעל/השבת התראה',
                    'רענן נתונים',
                    'פילטר לפי סטטוס',
                    'פילטר לפי טיקר'
                ],
                'crud_level': 'full',
                'priority': 'critical'
            },
            'tickers': {
                'name': 'טיקרים',
                'url': '/tickers',
                'main_buttons': [
                    'הוסף טיקר חדש',
                    'ערוך טיקר',
                    'מחק טיקר',
                    'רענן מחיר',
                    'עדכן נתונים חיצוניים',
                    'הצג גרף מחירים',
                    'מיון עמודות',
                    'פילטר לפי סוג'
                ],
                'crud_level': 'full',
                'priority': 'critical'
            },
            'executions': {
                'name': 'ביצועים',
                'url': '/executions',
                'main_buttons': [
                    'הוסף ביצוע חדש',
                    'ערוך ביצוע',
                    'מחק ביצוע',
                    'קשר לטרייד',
                    'הצג פרטים',
                    'רענן נתונים'
                ],
                'crud_level': 'full',
                'priority': 'high'
            },
            'cash_flows': {
                'name': 'תזרימי מזומנים',
                'url': '/cash_flows',
                'main_buttons': [
                    'הוסף תזרים חדש',
                    'ערוך תזרים',
                    'מחק תזרים',
                    'חשב יתרה',
                    'ייצא דוח',
                    'רענן נתונים'
                ],
                'crud_level': 'full', 
                'priority': 'high'
            },
            'trade_plans': {
                'name': 'תוכניות מסחר',
                'url': '/trade_plans',
                'main_buttons': [
                    'הוסף תוכנית חדשה',
                    'ערוך תוכנית',
                    'מחק תוכנית',
                    'בצע תוכנית',
                    'העתק תוכנית',
                    'רענן נתונים'
                ],
                'crud_level': 'full',
                'priority': 'high'
            },
            'notes': {
                'name': 'הערות',
                'url': '/notes',
                'main_buttons': [
                    'הוסף הערה חדשה',
                    'ערוך הערה',
                    'מחק הערה',
                    'צרף קובץ',
                    'הורד קובץ',
                    'הצג קישורים',
                    'רענן נתונים'
                ],
                'crud_level': 'full',
                'priority': 'high'
            },
            'preferences': {
                'name': 'העדפות V1',
                'url': '/preferences',
                'main_buttons': [
                    'שמור העדפות',
                    'אפס לברירת מחדל',
                    'ייצא העדפות', 
                    'ייבא העדפות',
                    'בדיקת תקינות'
                ],
                'crud_level': 'settings',
                'priority': 'high'
            },
            'preferences-v2': {
                'name': 'העדפות V2',
                'url': '/preferences-v2',
                'main_buttons': [
                    'שמור העדפות',
                    'ייצא העדפות',
                    'ייבא העדפות',
                    'איפוס לברירת מחדל',
                    'שמור כפרופיל חדש',
                    'מיגרציה מ-V1'
                ],
                'crud_level': 'settings',
                'priority': 'high'
            },
            'system-management': {
                'name': 'ניהול מערכת',
                'url': '/system-management',
                'main_buttons': [
                    'בדיקת בריאות',
                    'ניקוי מטמון',
                    'גיבוי בסיס נתונים',
                    'העתק לוג מפורט',
                    'רענון מערכת'
                ],
                'crud_level': 'admin',
                'priority': 'medium'
            },
            'css-management': {
                'name': 'מנהל CSS',
                'url': '/css-management',
                'main_buttons': [
                    'עבור למערכת ישנה',
                    'עבור למערכת חדשה', 
                    'ניתוח CSS',
                    'בדיקת RTL',
                    'בדיקת ביצועים',
                    'פתח מדריכים',
                    'הורד כלים'
                ],
                'crud_level': 'admin',
                'priority': 'medium'
            }
        }

    def test_page_accessibility(self, page_key):
        """בדיקת נגישות עמוד עם curl"""
        if page_key not in self.pages_to_test:
            return {'error': f'עמוד {page_key} לא מוגדר'}
        
        page_info = self.pages_to_test[page_key]
        url = f"{self.base_url}{page_info['url']}"
        
        print(f"🔍 בודק נגישות: {page_info['name']}")
        print(f"   🔗 כתובת: {url}")
        
        try:
            # בדיקת HTTP status עם curl
            cmd = ['curl', '-s', '-I', '--max-time', '10', url]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                headers = result.stdout
                
                # חיפוש status code
                if 'HTTP/1.1 200 OK' in headers or 'HTTP/1.0 200 OK' in headers:
                    print(f"   ✅ עמוד נגיש (HTTP 200)")
                    return {
                        'status': 'success',
                        'http_status': 200,
                        'accessible': True
                    }
                elif 'HTTP/1.1 404' in headers or 'HTTP/1.0 404' in headers:
                    print(f"   ❌ עמוד לא נמצא (HTTP 404)")
                    return {
                        'status': 'error',
                        'http_status': 404,
                        'accessible': False
                    }
                elif 'HTTP/1.1 500' in headers or 'HTTP/1.0 500' in headers:
                    print(f"   ❌ שגיאת שרת (HTTP 500)")
                    return {
                        'status': 'error',
                        'http_status': 500,
                        'accessible': False
                    }
                else:
                    print(f"   ⚠️ סטטוס לא ברור: {headers.split()[1] if headers.split() else 'unknown'}")
                    return {
                        'status': 'warning',
                        'http_status': 'unknown',
                        'accessible': False,
                        'headers': headers
                    }
            else:
                print(f"   ❌ שגיאת חיבור (curl failed)")
                return {
                    'status': 'error',
                    'error': 'connection_failed',
                    'accessible': False
                }
                
        except subprocess.TimeoutExpired:
            print(f"   ❌ timeout - עמוד לא מגיב")
            return {
                'status': 'error',
                'error': 'timeout',
                'accessible': False
            }
        except Exception as e:
            print(f"   ❌ שגיאה: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'accessible': False
            }

    def run_manual_inspection(self, page_key):
        """בדיקה ידנית מונחית לעמוד"""
        if page_key not in self.pages_to_test:
            print(f"❌ עמוד '{page_key}' לא נמצא")
            return
        
        page_info = self.pages_to_test[page_key]
        url = f"{self.base_url}{page_info['url']}"
        
        print(f"\n📄 בדיקה ידנית: {page_info['name']}")
        print("=" * 40)
        print(f"🔗 פתח בדפדפן: {url}")
        
        # בדיקת נגישות בסיסית
        access_result = self.test_page_accessibility(page_key)
        
        if not access_result.get('accessible', False):
            print(f"❌ עמוד לא נגיש - לא ניתן לבצע בדיקות")
            return access_result
        
        print(f"\n📋 רשימת בדיקות לביצוע ידני:")
        print(f"   (פתח את העמוד בדפדפן ובצע כל בדיקה)")
        
        print(f"\n🔧 בדיקות כפתורים:")
        for i, button in enumerate(page_info['main_buttons'], 1):
            print(f"   {i}. {button}")
            print(f"      - האם הכפתור מופיע? ☐")
            print(f"      - האם הכפתור לחיץ? ☐")
            print(f"      - האם הפעולה מתבצעת? ☐")
            print()
        
        print(f"📱 בדיקות ממשק:")
        ui_checks = [
            "עמוד נטען ללא שגיאות",
            "עיצוב CSS נראה תקין",
            "לא שגיאות JavaScript בקונסול (F12)",
            "RTL ועברית מוצגים נכון",
            "טבלאות מוצגות נכון",
            "מודלים נפתחים נכון",
            "ניווט עובד",
            "הודעות הצלחה/שגיאה מופיעות"
        ]
        
        for i, check in enumerate(ui_checks, 1):
            print(f"   {i}. {check} ☐")
        
        if page_info['crud_level'] == 'full':
            print(f"\n🔧 בדיקות CRUD (בצע רק אם מרגיש בטוח):")
            crud_checks = [
                "יצירה: הוסף רשומה חדשה (אפשר למחוק אחר כך)",
                "קריאה: הטבלה מציגה נתונים נכון",
                "עדכון: ערוך רשומה קיימת",
                "מחיקה: מחק רשומה בדיקה (לא חשובה)"
            ]
            
            for i, check in enumerate(crud_checks, 1):
                print(f"   {i}. {check} ☐")
        
        # המתנה לסיום בדיקה ידנית
        input(f"\n⏸️ לחץ Enter אחרי סיום בדיקת {page_info['name']}...")
        
        # איסוף תוצאות
        return self.collect_manual_results(page_key)

    def collect_manual_results(self, page_key):
        """איסוף תוצאות בדיקה ידנית"""
        page_info = self.pages_to_test[page_key]
        
        print(f"\n📊 תוצאות בדיקת {page_info['name']}:")
        
        # שאלות מהירות לציון
        questions = [
            "האם העמוד נטען ללא שגיאות? (y/n)",
            "האם כל הכפתורים עובדים? (y/n)", 
            "האם עיצוב CSS תקין? (y/n)",
            "האם RTL ועברית נכונים? (y/n)"
        ]
        
        if page_info['crud_level'] == 'full':
            questions.extend([
                "האם פעולות CRUD עובדות? (y/n)",
                "האם מודלים נפתחים נכון? (y/n)"
            ])
        
        scores = []
        for question in questions:
            answer = input(f"   {question} ").strip().lower()
            scores.append(answer in ['y', 'yes', 'כן', '1'])
        
        # חישוב ציון
        passed = sum(scores)
        total = len(scores)
        score_percent = (passed / total) * 100 if total > 0 else 0
        
        # הערות נוספות
        notes = input(f"   הערות נוספות (אופציונלי): ").strip()
        
        result = {
            'page': page_key,
            'name': page_info['name'],
            'url': page_info['url'],
            'tested_at': datetime.now().isoformat(),
            'manual_score': {
                'passed': passed,
                'total': total,
                'percentage': score_percent,
                'grade': self.get_grade(score_percent)
            },
            'notes': notes,
            'priority': page_info['priority']
        }
        
        print(f"   📊 ציון: {passed}/{total} ({score_percent:.1f}%) - {result['manual_score']['grade']}")
        
        return result

    def get_grade(self, score_percent):
        """המרת אחוז לציון"""
        if score_percent >= 95:
            return 'מצוין'
        elif score_percent >= 85:
            return 'טוב מאוד'
        elif score_percent >= 75:
            return 'טוב'
        elif score_percent >= 65:
            return 'בינוני'
        else:
            return 'דרוש שיפור'

    def check_server_connectivity(self):
        """בדיקת חיבור לשרתר"""
        print("🔍 בודק חיבור לשרתר...")
        
        try:
            cmd = ['curl', '-s', '-I', '--max-time', '5', f"{self.base_url}/"]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and ('200 OK' in result.stdout):
                print(f"✅ שרתר פעיל ונגיש על {self.base_url}")
                return True
            else:
                print(f"❌ שרתר לא מגיב נכון")
                return False
                
        except Exception as e:
            print(f"❌ שגיאת חיבור: {e}")
            return False

    def run_quick_manual_test(self):
        """בדיקה ידנית מהירה של עמודים קריטיים"""
        print("🚀 בדיקה ידנית מהירה - עמודים קריטיים")
        print("=" * 50)
        
        if not self.check_server_connectivity():
            print("💡 הפעל את השרתר עם: ./start_dev.sh")
            return
        
        # עמודים קריטיים
        critical_pages = ['index', 'trades', 'accounts', 'alerts']
        
        for page_key in critical_pages:
            result = self.run_manual_inspection(page_key)
            if result:
                self.results.append(result)
        
        self.print_manual_summary()

    def run_full_manual_test(self):
        """בדיקה ידנית מלאה"""
        print("🔍 בדיקה ידנית מלאה - כל עמודי CRUD")
        print("=" * 50)
        
        if not self.check_server_connectivity():
            print("💡 הפעל את השרתר עם: ./start_dev.sh")
            return
        
        # כל העמודים לפי עדיפות
        ordered_pages = sorted(
            self.pages_to_test.keys(),
            key=lambda x: {'critical': 1, 'high': 2, 'medium': 3}.get(
                self.pages_to_test[x]['priority'], 4
            )
        )
        
        for page_key in ordered_pages:
            result = self.run_manual_inspection(page_key)
            if result:
                self.results.append(result)
        
        self.print_manual_summary()

    def print_manual_summary(self):
        """הדפסת סיכום בדיקות ידניות"""
        print("\n" + "=" * 50)
        print("📊 סיכום בדיקות CRUD ידניות")
        print("=" * 50)
        
        if not self.results:
            print("❌ לא בוצעו בדיקות")
            return
        
        # סטטיסטיקות
        total_pages = len(self.results)
        excellent = sum(1 for r in self.results if r['manual_score']['grade'] == 'מצוין')
        good = sum(1 for r in self.results if r['manual_score']['grade'] in ['טוב מאוד', 'טוב'])
        poor = total_pages - excellent - good
        
        avg_score = sum(r['manual_score']['percentage'] for r in self.results) / total_pages
        
        print(f"📈 סטטיסטיקות:")
        print(f"   📄 סה\"כ עמודים נבדקו: {total_pages}")
        print(f"   🏆 מצוינים: {excellent}")
        print(f"   👍 טובים: {good}")
        print(f"   ⚠️ בעייתיים: {poor}")
        print(f"   📊 ממוצע כללי: {avg_score:.1f}%")
        
        print(f"\n📋 תוצאות מפורטות:")
        for result in sorted(self.results, key=lambda x: x['manual_score']['percentage'], reverse=True):
            grade = result['manual_score']['grade']
            score = result['manual_score']['percentage']
            
            grade_icon = {
                'מצוין': '🏆',
                'טוב מאוד': '🌟',
                'טוב': '✅',
                'בינוני': '⚠️',
                'דרוש שיפור': '❌'
            }.get(grade, '❓')
            
            print(f"   {grade_icon} {result['name']}: {score:.1f}% ({grade})")
            
            if result['notes']:
                print(f"      💬 הערות: {result['notes']}")
        
        # שמירת דוח
        self.save_manual_report()
        
        # המלצות
        print(f"\n💡 המלצות:")
        if avg_score >= 90:
            print(f"   🎉 המערכת עובדת מצוין! כל העמודים תקינים.")
        elif avg_score >= 75:
            print(f"   👍 המערכת עובדת טוב. יש מקום לשיפורים קלים.")
        else:
            print(f"   ⚠️ יש בעיות שדורשות תשומת לב.")
        
        if poor > 0:
            problematic = [r for r in self.results if r['manual_score']['percentage'] < 75]
            print(f"   🔧 עמודים שדורשים תיקון:")
            for p in problematic:
                print(f"      - {p['name']}: {p['manual_score']['percentage']:.1f}%")

    def save_manual_report(self):
        """שמירת דוח בדיקות ידניות"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"/workspace/manual-crud-test-report-{timestamp}.json"
        
        report_data = {
            'test_info': {
                'type': 'manual_crud_testing',
                'timestamp': datetime.now().isoformat(),
                'base_url': self.base_url,
                'total_pages_tested': len(self.results)
            },
            'summary': {
                'total_pages': len(self.results),
                'average_score': sum(r['manual_score']['percentage'] for r in self.results) / len(self.results) if self.results else 0,
                'excellent_count': sum(1 for r in self.results if r['manual_score']['grade'] == 'מצוין'),
                'good_count': sum(1 for r in self.results if r['manual_score']['grade'] in ['טוב מאוד', 'טוב']),
                'poor_count': sum(1 for r in self.results if r['manual_score']['percentage'] < 75)
            },
            'detailed_results': self.results
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 דוח מפורט נשמר: {report_file}")

    def generate_testing_checklist(self):
        """יצירת רשימת בדיקות להדפסה"""
        print("📋 יוצר רשימת בדיקות מפורטת...")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        checklist_file = f"/workspace/crud-testing-checklist-{timestamp}.md"
        
        content = f"""# רשימת בדיקות CRUD - TikTrack
**תאריך יצירה**: {datetime.now().strftime('%d/%m/%Y %H:%M')}
**כתובת בסיס**: {self.base_url}

## 📋 הוראות כלליות
1. פתח כל עמוד בדפדפן
2. בדוק שהעמוד נטען ללא שגיאות
3. בדוק כל כפתור ברשימה
4. סמן ✅ או ❌ ליד כל פריט
5. תעד בעיות בסוף כל עמוד

---

"""
        
        for page_key, page_info in self.pages_to_test.items():
            content += f"""
## 📄 {page_info['name']}
**🔗 כתובת**: {self.base_url}{page_info['url']}
**⭐ עדיפות**: {page_info['priority']}
**🔧 רמת CRUD**: {page_info['crud_level']}

### בדיקות בסיסיות:
- [ ] עמוד נטען ללא שגיאות
- [ ] עיצוב CSS נראה תקין
- [ ] לא שגיאות JavaScript (בדוק F12 → Console)
- [ ] RTL ועברית נכונים
- [ ] טבלה/תוכן מוצג נכון

### כפתורים לבדיקה:
"""
            
            for button in page_info['main_buttons']:
                content += f"- [ ] **{button}** - עובד כהלכה\n"
            
            if page_info['crud_level'] == 'full':
                content += f"""
### בדיקות CRUD (זהירות!):
- [ ] **Create** - יצירת רשומה חדשה עובדת
- [ ] **Read** - קריאת נתונים עובדת
- [ ] **Update** - עדכון רשומה עובד
- [ ] **Delete** - מחיקת רשומה עובדת (בדוק רק על נתוני בדיקה!)
"""
            
            content += f"""
### בעיות שנמצאו:
```
(רשום כאן בעיות ספציפיות שמצאת)



```

---
"""
        
        content += f"""
## 📊 סיכום כללי
**תאריך בדיקה**: ___________
**בודק**: ___________

### תוצאות:
- עמודים עובדים מצוין: _____ / {len(self.pages_to_test)}
- עמודים עובדים עם בעיות קלות: _____ / {len(self.pages_to_test)}
- עמודים עם בעיות משמעותיות: _____ / {len(self.pages_to_test)}

### בעיות כלליות:
```
(רשום כאן בעיות שחוזרות על עצמן או בעיות כלליות)



```

### המלצות לתיקון:
```
(רשום כאן המלצות לשיפור או תיקון)



```
"""
        
        with open(checklist_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ רשימת בדיקות נוצרה: {checklist_file}")
        print(f"📋 הדפס או פתח בעורך טקסט לביצוע בדיקות")
        
        return checklist_file

def main():
    """פונקציה ראשית"""
    print("📋 בודק CRUD ידני - TikTrack")
    print("=" * 30)
    
    tester = ManualCRUDTester()
    
    choice = input(f"""
בחר אופן בדיקה:
1. בדיקה ידנית מהירה (4 עמודים קריטיים)
2. בדיקה ידנית מלאה (כל העמודים)
3. בדיקת עמוד ספציפי
4. יצירת רשימת בדיקות להדפסה
5. יציאה

בחירה (1/2/3/4/5): """).strip()
    
    if choice == '1':
        tester.run_quick_manual_test()
        
    elif choice == '2':
        confirm = input("⚠️ בדיקה מלאה תיקח זמן רב. להמשיך? (y/n): ").strip().lower()
        if confirm in ['y', 'yes', 'כן']:
            tester.run_full_manual_test()
        else:
            print("🚫 בדיקה בוטלה")
            
    elif choice == '3':
        print(f"\nעמודים זמינים:")
        for i, (page_key, page_info) in enumerate(tester.pages_to_test.items(), 1):
            print(f"  {i}. {page_key} - {page_info['name']} ({page_info['priority']})")
        
        page_input = input(f"\nהזן שם עמוד או מספר: ").strip()
        
        if page_input.isdigit():
            page_list = list(tester.pages_to_test.keys())
            page_index = int(page_input) - 1
            if 0 <= page_index < len(page_list):
                page_key = page_list[page_index]
                result = tester.run_manual_inspection(page_key)
                if result:
                    tester.results.append(result)
                    tester.print_manual_summary()
            else:
                print("❌ מספר לא חוקי")
        else:
            result = tester.run_manual_inspection(page_input)
            if result:
                tester.results.append(result)
                tester.print_manual_summary()
        
    elif choice == '4':
        tester.generate_testing_checklist()
        
    elif choice == '5':
        print("👋 יציאה...")
    else:
        print("❌ בחירה לא חוקית")

if __name__ == "__main__":
    main()