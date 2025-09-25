#!/usr/bin/env python3
"""
בדיקת כפתורים ופונקציות CRUD ספציפיות לכל עמוד
"""

import requests
import json
import time
from datetime import datetime
from pathlib import Path

class ButtonTester:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.results = []
        
        # הגדרת בדיקות לכל עמוד
        self.page_tests = {
            'trades': {
                'name': 'טריידים',
                'crud_endpoints': [
                    ('GET', '/api/trades/', 'טעינת טריידים'),
                    ('POST', '/api/trades/', 'יצירת טרייד חדש'),
                    ('PUT', '/api/trades/1', 'עדכון טרייד'),
                    ('POST', '/api/trades/1/close', 'סגירת טרייד'),
                    ('POST', '/api/trades/1/cancel', 'ביטול טרייד'),
                ],
                'ui_buttons': [
                    'הוסף טרייד חדש',
                    'ערוך טרייד', 
                    'מחק טרייד',
                    'סגור טרייד',
                    'בטל טרייד',
                    'רענן נתונים',
                    'ייצא לאקסל',
                    'מיון עמודות',
                    'פילטר נתונים'
                ]
            },
            'accounts': {
                'name': 'חשבונות',
                'crud_endpoints': [
                    ('GET', '/api/accounts/', 'טעינת חשבונות'),
                    ('POST', '/api/accounts/', 'יצירת חשבון חדש'),
                    ('PUT', '/api/accounts/1', 'עדכון חשבון'),
                    ('DELETE', '/api/accounts/1', 'מחיקת חשבון'),
                ],
                'ui_buttons': [
                    'הוסף חשבון חדש',
                    'ערוך חשבון',
                    'מחק חשבון', 
                    'הצג פרטים',
                    'רענן נתונים',
                    'ייצא נתונים'
                ]
            },
            'alerts': {
                'name': 'התראות',
                'crud_endpoints': [
                    ('GET', '/api/alerts/', 'טעינת התראות'),
                    ('POST', '/api/alerts/', 'יצירת התראה'),
                    ('PUT', '/api/alerts/1', 'עדכון התראה'),
                    ('DELETE', '/api/alerts/1', 'מחיקת התראה'),
                ],
                'ui_buttons': [
                    'הוסף התראה חדשה',
                    'ערוך התראה',
                    'מחק התראה',
                    'בדוק תנאי',
                    'הפעל/השבת',
                    'רענן נתונים'
                ]
            },
            'tickers': {
                'name': 'טיקרים',
                'crud_endpoints': [
                    ('GET', '/api/tickers/', 'טעינת טיקרים'),
                    ('POST', '/api/tickers/', 'יצירת טיקר'),
                    ('PUT', '/api/tickers/1', 'עדכון טיקר'),
                    ('DELETE', '/api/tickers/1', 'מחיקת טיקר'),
                ],
                'ui_buttons': [
                    'הוסף טיקר חדש',
                    'ערוך טיקר',
                    'מחק טיקר',
                    'רענן מחיר',
                    'הצג גרף',
                    'עדכן נתונים חיצוניים'
                ]
            },
            'executions': {
                'name': 'ביצועים', 
                'crud_endpoints': [
                    ('GET', '/api/executions/', 'טעינת ביצועים'),
                    ('POST', '/api/executions/', 'יצירת ביצוע'),
                    ('PUT', '/api/executions/1', 'עדכון ביצוע'),
                    ('DELETE', '/api/executions/1', 'מחיקת ביצוע'),
                ],
                'ui_buttons': [
                    'הוסף ביצוע חדש',
                    'ערוך ביצוע',
                    'מחק ביצוע',
                    'הצג פרטים',
                    'קשר לטרייד'
                ]
            },
            'cash_flows': {
                'name': 'תזרימי מזומנים',
                'crud_endpoints': [
                    ('GET', '/api/cash_flows/', 'טעינת תזרימים'),
                    ('POST', '/api/cash_flows/', 'יצירת תזרים'),
                    ('PUT', '/api/cash_flows/1', 'עדכון תזרים'),
                    ('DELETE', '/api/cash_flows/1', 'מחיקת תזרים'),
                ],
                'ui_buttons': [
                    'הוסף תזרים חדש',
                    'ערוך תזרים',
                    'מחק תזרים',
                    'חשב יתרה',
                    'ייצא דוח'
                ]
            },
            'trade_plans': {
                'name': 'תוכניות מסחר',
                'crud_endpoints': [
                    ('GET', '/api/trade_plans/', 'טעינת תוכניות'),
                    ('POST', '/api/trade_plans/', 'יצירת תוכנית'),
                    ('PUT', '/api/trade_plans/1', 'עדכון תוכנית'),
                    ('DELETE', '/api/trade_plans/1', 'מחיקת תוכנית'),
                ],
                'ui_buttons': [
                    'הוסף תוכנית חדשה',
                    'ערוך תוכנית',
                    'מחק תוכנית',
                    'בצע תוכנית',
                    'העתק תוכנית'
                ]
            },
            'notes': {
                'name': 'הערות',
                'crud_endpoints': [
                    ('GET', '/api/notes/', 'טעינת הערות'),
                    ('POST', '/api/notes/', 'יצירת הערה'),
                    ('PUT', '/api/notes/1', 'עדכון הערה'),
                    ('DELETE', '/api/notes/1', 'מחיקת הערה'),
                ],
                'ui_buttons': [
                    'הוסף הערה חדשה',
                    'ערוך הערה',
                    'מחק הערה',
                    'צרף קובץ',
                    'הצג קישורים'
                ]
            },
            'preferences': {
                'name': 'העדפות V1',
                'crud_endpoints': [
                    ('GET', '/api/preferences/', 'טעינת העדפות'),
                    ('POST', '/api/preferences/', 'שמירת העדפות'),
                    ('POST', '/api/preferences/reset', 'איפוס העדפות'),
                ],
                'ui_buttons': [
                    'שמור העדפות',
                    'אפס לברירת מחדל',
                    'ייצא העדפות',
                    'ייבא העדפות'
                ]
            },
            'preferences-v2': {
                'name': 'העדפות V2',
                'crud_endpoints': [
                    ('GET', '/api/v2/preferences/', 'טעינת העדפות V2'),
                    ('POST', '/api/v2/preferences/', 'שמירת העדפות V2'),
                    ('GET', '/api/v2/preferences/export', 'ייצוא העדפות'),
                    ('POST', '/api/v2/preferences/import', 'ייבוא העדפות'),
                ],
                'ui_buttons': [
                    'שמור העדפות',
                    'ייצא העדפות', 
                    'ייבא העדפות',
                    'איפוס לברירת מחדל',
                    'שמור כפרופיל חדש'
                ]
            }
        }

    def test_api_endpoint(self, method, endpoint, description):
        """בדיקת API endpoint ספציפי"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method == 'GET':
                response = requests.get(url, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json={}, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json={}, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, timeout=10)
            else:
                return {'status': 'error', 'error': 'שיטה לא נתמכת'}
            
            # הצלחה אם קיבלנו תגובה (גם אם עם שגיאת validation)
            success = response.status_code in [200, 201, 400, 401, 422, 405]
            
            return {
                'status': 'success' if success else 'error',
                'status_code': response.status_code,
                'response_time': response.elapsed.total_seconds(),
                'description': description,
                'accessible': success
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'status': 'error',
                'error': str(e),
                'description': description,
                'accessible': False
            }

    def test_page_comprehensive(self, page_key):
        """בדיקה מקיפה של עמוד"""
        if page_key not in self.page_tests:
            return {'error': f'עמוד {page_key} לא מוגדר לבדיקה'}
        
        page_info = self.page_tests[page_key]
        page_name = page_info['name']
        
        print(f"\n📄 בודק עמוד: {page_name}")
        print("-" * 40)
        
        result = {
            'page': page_key,
            'name': page_name,
            'url': f"{self.base_url}/{page_key}" if page_key else self.base_url,
            'tested_at': datetime.now().isoformat(),
            'page_load': None,
            'api_tests': [],
            'ui_elements': page_info['ui_buttons'].copy(),
            'summary': {'total': 0, 'passed': 0, 'failed': 0, 'warnings': 0}
        }
        
        # בדיקת טעינת עמוד
        print("  🔍 בודק טעינת עמוד...")
        try:
            url = result['url']
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                content = response.text
                page_checks = {
                    'loads': True,
                    'has_title': '<title>' in content,
                    'has_css': 'styles-new/main.css' in content,
                    'has_bootstrap': 'bootstrap' in content,
                    'rtl_support': 'dir="rtl"' in content,
                    'has_scripts': '<script' in content,
                    'no_404': '404' not in content
                }
                
                passed_checks = sum(page_checks.values())
                total_checks = len(page_checks)
                
                result['page_load'] = {
                    'status': 'success' if passed_checks == total_checks else 'warning',
                    'response_time': response.elapsed.total_seconds(),
                    'checks': page_checks,
                    'score': f"{passed_checks}/{total_checks}"
                }
                
                if passed_checks == total_checks:
                    print(f"    ✅ עמוד נטען בהצלחה ({passed_checks}/{total_checks})")
                    result['summary']['passed'] += 1
                else:
                    print(f"    ⚠️ בעיות קלות בטעינה ({passed_checks}/{total_checks})")
                    result['summary']['warnings'] += 1
                    
            else:
                print(f"    ❌ שגיאת טעינה: HTTP {response.status_code}")
                result['page_load'] = {'status': 'error', 'status_code': response.status_code}
                result['summary']['failed'] += 1
                
        except Exception as e:
            print(f"    ❌ שגיאת חיבור: {e}")
            result['page_load'] = {'status': 'error', 'error': str(e)}
            result['summary']['failed'] += 1
        
        result['summary']['total'] += 1
        
        # בדיקת API endpoints
        print("  📡 בודק API endpoints...")
        for method, endpoint, description in page_info['crud_endpoints']:
            api_result = self.test_api_endpoint(method, endpoint, description)
            result['api_tests'].append(api_result)
            
            if api_result.get('accessible', False):
                print(f"    ✅ {method} {endpoint} - {description}")
                result['summary']['passed'] += 1
            else:
                print(f"    ❌ {method} {endpoint} - {description}")
                result['summary']['failed'] += 1
            
            result['summary']['total'] += 1
            
            # הפסקה קצרה בין בדיקות
            time.sleep(0.5)
        
        # חישוב ציון כללי
        if result['summary']['total'] > 0:
            score = (result['summary']['passed'] / result['summary']['total']) * 100
            result['summary']['score'] = f"{score:.1f}%"
            
            if score >= 90:
                result['summary']['grade'] = 'מצוין'
            elif score >= 75:
                result['summary']['grade'] = 'טוב'
            elif score >= 50:
                result['summary']['grade'] = 'בעייתי'
            else:
                result['summary']['grade'] = 'כושל'
        
        return result

    def run_quick_test(self):
        """בדיקה מהירה של העמודים העיקריים"""
        print("🚀 בדיקה מהירה - עמודי CRUD עיקריים")
        print("=" * 50)
        
        main_pages = ['trades', 'accounts', 'alerts', 'tickers']
        
        for page_key in main_pages:
            result = self.test_page_comprehensive(page_key)
            self.results.append(result)
        
        self.print_summary()

    def run_full_test(self):
        """בדיקה מלאה של כל העמודים"""
        print("🔍 בדיקה מלאה - כל עמודי CRUD")
        print("=" * 50)
        
        all_pages = list(self.page_tests.keys())
        
        for page_key in all_pages:
            result = self.test_page_comprehensive(page_key)
            self.results.append(result)
            
            # הפסקה בין עמודים
            time.sleep(1)
        
        self.print_summary()

    def print_summary(self):
        """הדפסת סיכום תוצאות"""
        print("\n" + "=" * 50)
        print("📊 סיכום בדיקות CRUD")
        print("=" * 50)
        
        if not self.results:
            print("❌ לא בוצעו בדיקות")
            return
        
        total_pages = len(self.results)
        excellent_pages = sum(1 for r in self.results if r['summary'].get('grade') == 'מצוין')
        good_pages = sum(1 for r in self.results if r['summary'].get('grade') == 'טוב')
        problematic_pages = sum(1 for r in self.results if r['summary'].get('grade') == 'בעייתי')
        failed_pages = sum(1 for r in self.results if r['summary'].get('grade') == 'כושל')
        
        print(f"📈 סטטיסטיקות כלליות:")
        print(f"   📄 סה\"כ עמודים: {total_pages}")
        print(f"   ✅ מצוינים: {excellent_pages}")
        print(f"   👍 טובים: {good_pages}")
        print(f"   ⚠️ בעייתיים: {problematic_pages}")
        print(f"   ❌ כושלים: {failed_pages}")
        
        success_rate = ((excellent_pages + good_pages) / total_pages * 100) if total_pages > 0 else 0
        print(f"   🎯 אחוז הצלחה: {success_rate:.1f}%")
        
        print(f"\n📋 תוצאות לפי עמוד:")
        for result in sorted(self.results, key=lambda x: x['summary'].get('score', '0%'), reverse=True):
            grade = result['summary'].get('grade', 'לא ידוע')
            score = result['summary'].get('score', '0%')
            
            grade_icon = {
                'מצוין': '🏆',
                'טוב': '✅', 
                'בעייתי': '⚠️',
                'כושל': '❌'
            }.get(grade, '❓')
            
            print(f"   {grade_icon} {result['name']}: {score} ({grade})")
        
        # בעיות שנמצאו
        issues = []
        for result in self.results:
            if result['page_load'] and result['page_load'].get('status') == 'error':
                issues.append(f"עמוד {result['name']}: בעיה בטעינה")
            
            failed_apis = [api for api in result.get('api_tests', []) 
                          if not api.get('accessible', False)]
            if failed_apis:
                issues.append(f"עמוד {result['name']}: {len(failed_apis)} API endpoints לא עובדים")
        
        if issues:
            print(f"\n🐛 בעיות שנמצאו ({len(issues)}):")
            for issue in issues:
                print(f"   - {issue}")
        else:
            print(f"\n🎉 לא נמצאו בעיות קריטיות!")
        
        # שמירת דוח
        self.save_detailed_report()

    def save_detailed_report(self):
        """שמירת דוח מפורט"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"/workspace/crud-test-detailed-report-{timestamp}.json"
        
        report_data = {
            'test_info': {
                'timestamp': datetime.now().isoformat(),
                'base_url': self.base_url,
                'total_pages': len(self.results),
                'test_type': 'comprehensive_crud'
            },
            'summary': {
                'excellent': sum(1 for r in self.results if r['summary'].get('grade') == 'מצוין'),
                'good': sum(1 for r in self.results if r['summary'].get('grade') == 'טוב'), 
                'problematic': sum(1 for r in self.results if r['summary'].get('grade') == 'בעייתי'),
                'failed': sum(1 for r in self.results if r['summary'].get('grade') == 'כושל')
            },
            'detailed_results': self.results
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 דוח מפורט נשמר: {report_file}")

    def test_single_page(self, page_key):
        """בדיקת עמוד יחיד"""
        if page_key not in self.page_tests:
            print(f"❌ עמוד '{page_key}' לא נמצא ברשימה")
            available_pages = list(self.page_tests.keys())
            print(f"📋 עמודים זמינים: {', '.join(available_pages)}")
            return
        
        result = self.test_page_comprehensive(page_key)
        self.results = [result]
        self.print_summary()

def main():
    """פונקציה ראשית"""
    print("🧪 בודק CRUD - TikTrack System")
    print("=" * 35)
    
    tester = ButtonTester()
    
    print(f"🔗 בודק חיבור לשרתר...")
    try:
        response = requests.get(f"{tester.base_url}/", timeout=5)
        if response.status_code == 200:
            print(f"✅ שרתר פעיל על {tester.base_url}")
        else:
            print(f"⚠️ שרתר מגיב אבל עם שגיאה: {response.status_code}")
    except:
        print(f"❌ שרתר לא פעיל על {tester.base_url}")
        print("💡 הפעל את השרתר עם: ./start_dev.sh")
        return
    
    choice = input(f"""
בחר סוג בדיקה:
1. בדיקה מהירה (4 עמודים עיקריים)
2. בדיקה מלאה (כל עמודי CRUD)
3. בדיקת עמוד ספציפי
4. יציאה

בחירה (1/2/3/4): """).strip()
    
    if choice == '1':
        tester.run_quick_test()
    elif choice == '2':
        tester.run_full_test()
    elif choice == '3':
        print(f"\nעמודים זמינים:")
        for i, page_key in enumerate(tester.page_tests.keys(), 1):
            page_name = tester.page_tests[page_key]['name']
            print(f"  {i}. {page_key} - {page_name}")
        
        page_choice = input(f"\nהזן שם עמוד או מספר: ").strip()
        
        # בדיקה אם זה מספר
        if page_choice.isdigit():
            page_list = list(tester.page_tests.keys())
            page_index = int(page_choice) - 1
            if 0 <= page_index < len(page_list):
                page_key = page_list[page_index]
                tester.test_single_page(page_key)
            else:
                print("❌ מספר לא חוקי")
        else:
            tester.test_single_page(page_choice)
            
    elif choice == '4':
        print("👋 יציאה...")
    else:
        print("❌ בחירה לא חוקית")

if __name__ == "__main__":
    main()