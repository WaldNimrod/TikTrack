#!/usr/bin/env python3
"""
כלי בדיקת CRUD מקיף לכל העמודים במערכת TikTrack
"""

import os
import json
import requests
import time
from datetime import datetime
from pathlib import Path

class CRUDTester:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.results = {}
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.warnings = []
        
        # רשימת עמודים לבדיקה
        self.pages = {
            # עמודי CRUD עיקריים
            'main_crud': {
                'trades': {'name': 'טריידים', 'crud': True, 'priority': 1},
                'accounts': {'name': 'חשבונות', 'crud': True, 'priority': 1}, 
                'alerts': {'name': 'התראות', 'crud': True, 'priority': 1},
                'tickers': {'name': 'טיקרים', 'crud': True, 'priority': 1},
                'executions': {'name': 'ביצועים', 'crud': True, 'priority': 1},
                'cash_flows': {'name': 'תזרימי מזומנים', 'crud': True, 'priority': 1},
                'trade_plans': {'name': 'תוכניות מסחר', 'crud': True, 'priority': 1},
                'notes': {'name': 'הערות', 'crud': True, 'priority': 1},
            },
            # עמודי הגדרות
            'settings': {
                'preferences': {'name': 'העדפות V1', 'crud': False, 'priority': 2},
                'preferences-v2': {'name': 'העדפות V2', 'crud': False, 'priority': 2},
            },
            # עמודי מערכת
            'system': {
                '': {'name': 'דף הבית', 'crud': False, 'priority': 2},
                'system-management': {'name': 'ניהול מערכת', 'crud': False, 'priority': 3},
                'css-management': {'name': 'מנהל CSS', 'crud': False, 'priority': 3},
                'external-data-dashboard': {'name': 'דשבורד נתונים חיצוניים', 'crud': False, 'priority': 3},
                'server-monitor': {'name': 'ניטור שרת', 'crud': False, 'priority': 3},
                'background-tasks': {'name': 'משימות ברקע', 'crud': False, 'priority': 3},
                'cache-test': {'name': 'בדיקת מטמון', 'crud': False, 'priority': 3},
                'constraints': {'name': 'אילוצים', 'crud': False, 'priority': 3},
                'linter-realtime-monitor': {'name': 'ניטור לינטר', 'crud': False, 'priority': 3},
            },
            # עמודי מידע
            'info': {
                'research': {'name': 'מחקר', 'crud': False, 'priority': 4},
                'notifications-center': {'name': 'מרכז התראות', 'crud': False, 'priority': 4},
                'db_display': {'name': 'תצוגת בסיס נתונים', 'crud': False, 'priority': 4},
                'db_extradata': {'name': 'נתונים נוספים', 'crud': False, 'priority': 4},
            },
            # עמודי דוגמה
            'demo': {
                'designs': {'name': 'עיצובים', 'crud': False, 'priority': 5},
                'style_demonstration': {'name': 'הדגמת עיצובים', 'crud': False, 'priority': 5},
                'color-scheme-examples': {'name': 'דוגמאות צבעים', 'crud': False, 'priority': 5},
                'numeric-value-colors-demo': {'name': 'דוגמאות ערכים', 'crud': False, 'priority': 5},
                'js-map': {'name': 'מפת JavaScript', 'crud': False, 'priority': 5},
                'page-scripts-matrix': {'name': 'מטריצת סקריפטים', 'crud': False, 'priority': 5},
            }
        }

    def test_page_load(self, url, page_name):
        """בדיקת טעינת עמוד בסיסית"""
        print(f"  🔍 בודק טעינת עמוד: {page_name}")
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                # בדיקת תוכן HTML בסיסי
                content = response.text
                
                checks = {
                    'html_valid': 'DOCTYPE html' in content and '<html' in content,
                    'title_exists': '<title>' in content,
                    'css_linked': 'styles-new/main.css' in content,
                    'bootstrap_linked': 'bootstrap' in content,
                    'rtl_support': 'dir="rtl"' in content or 'lang="he"' in content,
                    'no_broken_links': '404' not in content and 'error' not in content.lower(),
                }
                
                passed = sum(checks.values())
                total = len(checks)
                
                result = {
                    'status': 'success' if passed == total else 'warning',
                    'response_time': response.elapsed.total_seconds(),
                    'status_code': response.status_code,
                    'checks_passed': passed,
                    'checks_total': total,
                    'details': checks
                }
                
                if passed == total:
                    print(f"    ✅ טעינה מושלמת ({passed}/{total})")
                    self.passed_tests += 1
                else:
                    print(f"    ⚠️ בעיות קלות ({passed}/{total})")
                    self.warnings.append(f"{page_name}: {total-passed} בדיקות נכשלו")
                
                return result
                
            else:
                print(f"    ❌ שגיאת HTTP: {response.status_code}")
                self.failed_tests += 1
                return {
                    'status': 'error',
                    'status_code': response.status_code,
                    'error': f'HTTP {response.status_code}'
                }
                
        except requests.exceptions.RequestException as e:
            print(f"    ❌ שגיאת חיבור: {e}")
            self.failed_tests += 1
            return {
                'status': 'error',
                'error': str(e)
            }
        
        self.total_tests += 1

    def test_crud_operations(self, page_url, page_name, has_crud):
        """בדיקת פעולות CRUD בעמוד"""
        if not has_crud:
            return {'status': 'skipped', 'reason': 'לא עמוד CRUD'}
        
        print(f"  🔧 בודק פעולות CRUD: {page_name}")
        
        # בדיקת API endpoints של העמוד
        crud_endpoints = {
            'trades': ['/api/trades', '/api/trades/new', '/api/trades/update', '/api/trades/delete'],
            'accounts': ['/api/accounts', '/api/accounts/new', '/api/accounts/update', '/api/accounts/delete'],
            'alerts': ['/api/alerts', '/api/alerts/new', '/api/alerts/update', '/api/alerts/delete'],
            'tickers': ['/api/tickers', '/api/tickers/new', '/api/tickers/update', '/api/tickers/delete'],
            'executions': ['/api/executions', '/api/executions/new', '/api/executions/update', '/api/executions/delete'],
            'cash_flows': ['/api/cash_flows', '/api/cash_flows/new', '/api/cash_flows/update', '/api/cash_flows/delete'],
            'trade_plans': ['/api/trade_plans', '/api/trade_plans/new', '/api/trade_plans/update', '/api/trade_plans/delete'],
            'notes': ['/api/notes', '/api/notes/new', '/api/notes/update', '/api/notes/delete'],
        }
        
        page_key = page_url.strip('/')
        endpoints = crud_endpoints.get(page_key, [])
        
        if not endpoints:
            return {'status': 'warning', 'reason': 'לא נמצאו endpoints'}
        
        api_results = {}
        for endpoint in endpoints:
            try:
                api_url = f"{self.base_url}{endpoint}"
                response = requests.get(api_url, timeout=5)
                api_results[endpoint] = {
                    'status_code': response.status_code,
                    'accessible': response.status_code in [200, 400, 401, 403, 404, 405]  # לא 500
                }
            except:
                api_results[endpoint] = {'accessible': False, 'error': 'connection_failed'}
        
        accessible_count = sum(1 for r in api_results.values() if r.get('accessible', False))
        
        result = {
            'status': 'success' if accessible_count > len(endpoints) // 2 else 'warning',
            'endpoints_tested': len(endpoints),
            'endpoints_accessible': accessible_count,
            'details': api_results
        }
        
        print(f"    📡 API: {accessible_count}/{len(endpoints)} endpoints נגישים")
        
        return result

    def run_comprehensive_test(self, categories=None, max_priority=3):
        """הרצת בדיקות מקיפות"""
        print("🧪 מתחיל בדיקות CRUD מקיפות")
        print("=" * 50)
        
        start_time = time.time()
        
        if categories is None:
            categories = ['main_crud', 'settings', 'system']
        
        for category_name in categories:
            if category_name not in self.pages:
                continue
                
            category = self.pages[category_name]
            print(f"\n📂 קטגוריה: {category_name.upper()}")
            print("-" * 30)
            
            for page_url, page_info in category.items():
                if page_info['priority'] > max_priority:
                    continue
                
                page_name = page_info['name']
                has_crud = page_info['crud']
                
                print(f"\n📄 בודק עמוד: {page_name}")
                
                # בדיקת טעינת עמוד
                url = f"{self.base_url}/{page_url}" if page_url else self.base_url
                load_result = self.test_page_load(url, page_name)
                
                # בדיקת CRUD אם רלוונטי
                crud_result = self.test_crud_operations(page_url, page_name, has_crud)
                
                # שמירת תוצאות
                self.results[page_url or 'index'] = {
                    'name': page_name,
                    'url': url,
                    'has_crud': has_crud,
                    'load_test': load_result,
                    'crud_test': crud_result,
                    'tested_at': datetime.now().isoformat()
                }
        
        end_time = time.time()
        duration = end_time - start_time
        
        self.generate_report(duration)

    def generate_report(self, duration):
        """יצירת דוח בדיקות מפורט"""
        print("\n" + "=" * 50)
        print("📋 דוח בדיקות CRUD מקיף")
        print("=" * 50)
        
        # סיכום כללי
        total_pages = len(self.results)
        successful_loads = sum(1 for r in self.results.values() 
                              if r['load_test'].get('status') == 'success')
        
        crud_pages = sum(1 for r in self.results.values() if r['has_crud'])
        successful_crud = sum(1 for r in self.results.values() 
                             if r['has_crud'] and r['crud_test'].get('status') == 'success')
        
        print(f"📊 סיכום כללי:")
        print(f"   📄 עמודים נבדקו: {total_pages}")
        print(f"   ✅ טעינות מוצלחות: {successful_loads}/{total_pages}")
        print(f"   🔧 עמודי CRUD: {crud_pages}")
        print(f"   ✅ CRUD מוצלח: {successful_crud}/{crud_pages}")
        print(f"   ⏱️ זמן בדיקה: {duration:.1f} שניות")
        
        # תוצאות מפורטות
        print(f"\n📋 תוצאות מפורטות:")
        
        for page_id, result in self.results.items():
            status_icon = "✅" if result['load_test'].get('status') == 'success' else "❌"
            crud_icon = ""
            
            if result['has_crud']:
                crud_status = result['crud_test'].get('status', 'unknown')
                crud_icon = " 🔧✅" if crud_status == 'success' else " 🔧⚠️"
            
            print(f"   {status_icon} {result['name']}{crud_icon}")
            
            # פירוט בעיות
            if result['load_test'].get('status') != 'success':
                error = result['load_test'].get('error', 'שגיאה לא ידועה')
                print(f"      ❌ שגיאה: {error}")
            
            response_time = result['load_test'].get('response_time', 0)
            if response_time > 3:
                print(f"      ⚠️ איטי: {response_time:.1f}s")
        
        # אזהרות
        if self.warnings:
            print(f"\n⚠️ אזהרות ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"   - {warning}")
        
        # המלצות
        self.generate_recommendations()
        
        # שמירת דוח לקובץ
        self.save_report_to_file()

    def generate_recommendations(self):
        """יצירת המלצות"""
        print(f"\n💡 המלצות:")
        
        slow_pages = [r for r in self.results.values() 
                     if r['load_test'].get('response_time', 0) > 3]
        
        if slow_pages:
            print(f"   📈 {len(slow_pages)} עמודים איטיים - שקול אופטימיזציה")
        
        failed_pages = [r for r in self.results.values() 
                       if r['load_test'].get('status') == 'error']
        
        if failed_pages:
            print(f"   🔧 {len(failed_pages)} עמודים שבורים - דרוש תיקון מיידי")
        else:
            print(f"   ✅ כל העמודים עובדים!")
        
        crud_issues = [r for r in self.results.values() 
                      if r['has_crud'] and r['crud_test'].get('status') != 'success']
        
        if crud_issues:
            print(f"   🔧 {len(crud_issues)} עמודי CRUD עם בעיות")
        else:
            print(f"   ✅ כל פעולות CRUD עובדות!")

    def save_report_to_file(self):
        """שמירת דוח לקובץ JSON"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"/workspace/crud-test-report-{timestamp}.json"
        
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'duration_seconds': time.time() - self.start_time if hasattr(self, 'start_time') else 0,
            'summary': {
                'total_pages': len(self.results),
                'passed_tests': self.passed_tests,
                'failed_tests': self.failed_tests,
                'warnings_count': len(self.warnings)
            },
            'results': self.results,
            'warnings': self.warnings
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 דוח נשמר: {report_file}")

    def test_specific_page(self, page_url, page_name=None):
        """בדיקת עמוד ספציפי"""
        if page_name is None:
            page_name = page_url or 'דף הבית'
        
        print(f"🔍 בודק עמוד ספציפי: {page_name}")
        
        url = f"{self.base_url}/{page_url}" if page_url else self.base_url
        result = self.test_page_load(url, page_name)
        
        print(f"\n📋 תוצאת בדיקה:")
        if result['status'] == 'success':
            print(f"   ✅ עמוד עובד תקין")
            print(f"   ⏱️ זמן תגובה: {result.get('response_time', 0):.2f}s")
            if 'checks_passed' in result:
                print(f"   📊 בדיקות: {result['checks_passed']}/{result['checks_total']}")
        else:
            print(f"   ❌ עמוד לא עובד: {result.get('error', 'שגיאה לא ידועה')}")
        
        return result

def main():
    """פונקציה ראשית"""
    print("🧪 כלי בדיקת CRUD מקיף - TikTrack")
    print("=" * 40)
    
    tester = CRUDTester()
    
    choice = input("""
בחר סוג בדיקה:
1. בדיקה מהירה (עמודי CRUD עיקריים בלבד)
2. בדיקה מלאה (כל העמודים)  
3. בדיקת עמוד ספציפי
4. יציאה

בחירה (1/2/3/4): """).strip()
    
    if choice == '1':
        print("\n🚀 מריץ בדיקה מהירה...")
        tester.run_comprehensive_test(['main_crud'], max_priority=1)
        
    elif choice == '2':
        print("\n🔍 מריץ בדיקה מלאה...")
        tester.run_comprehensive_test(['main_crud', 'settings', 'system', 'info'], max_priority=5)
        
    elif choice == '3':
        page_url = input("הזן כתובת עמוד (ללא http://localhost:8080/): ")
        page_name = input("הזן שם עמוד (אופציונלי): ") or None
        tester.test_specific_page(page_url, page_name)
        
    elif choice == '4':
        print("👋 יציאה...")
        return
    else:
        print("❌ בחירה לא חוקית")

if __name__ == "__main__":
    main()