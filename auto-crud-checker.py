#!/usr/bin/env python3
"""
בדיקות CRUD אוטומטיות ללא קלט משתמש
"""

import os
import subprocess
import json
import time
from datetime import datetime
from pathlib import Path

class AutoCRUDChecker:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.results = {}
        
        # עמודים לבדיקה
        self.critical_pages = {
            'index': {'name': 'דף הבית', 'url': '/'},
            'trades': {'name': 'טריידים', 'url': '/trades'},
            'accounts': {'name': 'חשבונות', 'url': '/accounts'}, 
            'alerts': {'name': 'התראות', 'url': '/alerts'},
            'tickers': {'name': 'טיקרים', 'url': '/tickers'},
            'preferences': {'name': 'העדפות V1', 'url': '/preferences'},
            'preferences-v2': {'name': 'העדפות V2', 'url': '/preferences-v2'},
            'css-management': {'name': 'מנהל CSS', 'url': '/css-management'},
        }

    def check_server_status(self):
        """בדיקת סטטוס שרתר"""
        print("🔍 בודק סטטוס שרתר...")
        
        try:
            cmd = ['curl', '-s', '-I', '--max-time', '5', f"{self.base_url}/"]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                if '200 OK' in result.stdout:
                    print(f"✅ שרתר פעיל על {self.base_url}")
                    return True
                elif '404' in result.stdout:
                    print(f"❌ שרת פעיל אבל עמוד בסיס לא נמצא")
                    return False
                else:
                    print(f"⚠️ שרת מגיב אבל לא 200 OK")
                    print(f"   תגובה: {result.stdout.split()[1:3] if result.stdout.split() else 'unknown'}")
                    return False
            else:
                print(f"❌ שרת לא מגיב")
                return False
                
        except Exception as e:
            print(f"❌ שגיאה בבדיקת שרתר: {e}")
            return False

    def test_page_basic(self, page_key, page_info):
        """בדיקה בסיסית של עמוד"""
        page_name = page_info['name']
        url = f"{self.base_url}{page_info['url']}"
        
        print(f"\n📄 בודק: {page_name}")
        print(f"   🔗 {url}")
        
        try:
            # בדיקת HTTP status
            cmd = ['curl', '-s', '-I', '--max-time', '10', url]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                if '200 OK' in result.stdout:
                    print(f"   ✅ HTTP 200 - עמוד נגיש")
                    
                    # בדיקת תוכן בסיסי
                    content_cmd = ['curl', '-s', '--max-time', '10', url]
                    content_result = subprocess.run(content_cmd, capture_output=True, text=True, timeout=15)
                    
                    if content_result.returncode == 0:
                        content = content_result.stdout
                        
                        # בדיקות תוכן
                        checks = {
                            'has_doctype': 'DOCTYPE html' in content,
                            'has_title': '<title>' in content,
                            'has_css_new': 'styles-new/main.css' in content,
                            'has_bootstrap': 'bootstrap' in content,
                            'rtl_enabled': 'dir="rtl"' in content,
                            'hebrew_lang': 'lang="he"' in content,
                            'no_404_content': '404' not in content and 'Not Found' not in content,
                            'has_body': '<body' in content and '</body>' in content
                        }
                        
                        passed = sum(checks.values())
                        total = len(checks)
                        score = (passed / total) * 100
                        
                        print(f"   📊 בדיקות תוכן: {passed}/{total} ({score:.1f}%)")
                        
                        if passed == total:
                            print(f"   🎉 מצוין - כל הבדיקות עברו")
                            status = 'excellent'
                        elif passed >= total * 0.8:
                            print(f"   👍 טוב - רוב הבדיקות עברו")
                            status = 'good'
                        else:
                            print(f"   ⚠️ בעייתי - {total-passed} בדיקות נכשלו")
                            status = 'problematic'
                        
                        # רשימת בדיקות שנכשלו
                        failed_checks = [name for name, passed in checks.items() if not passed]
                        if failed_checks:
                            print(f"   ❌ בדיקות שנכשלו: {', '.join(failed_checks)}")
                        
                        return {
                            'status': status,
                            'http_status': 200,
                            'content_checks': checks,
                            'score': score,
                            'passed_checks': passed,
                            'total_checks': total,
                            'failed_checks': failed_checks,
                            'content_size': len(content)
                        }
                    else:
                        print(f"   ❌ לא הצלחתי לקרוא תוכן")
                        return {'status': 'error', 'error': 'content_read_failed'}
                        
                elif '404' in result.stdout:
                    print(f"   ❌ HTTP 404 - עמוד לא נמצא")
                    return {'status': 'error', 'http_status': 404, 'error': 'page_not_found'}
                    
                elif '500' in result.stdout:
                    print(f"   ❌ HTTP 500 - שגיאת שרת")
                    return {'status': 'error', 'http_status': 500, 'error': 'server_error'}
                    
                else:
                    print(f"   ⚠️ HTTP status לא ברור: {result.stdout[:100]}...")
                    return {'status': 'warning', 'error': 'unknown_http_status', 'raw_response': result.stdout[:200]}
                    
            else:
                print(f"   ❌ curl נכשל (return code: {result.returncode})")
                return {'status': 'error', 'error': 'curl_failed', 'return_code': result.returncode}
                
        except subprocess.TimeoutExpired:
            print(f"   ❌ Timeout - עמוד לא מגיב")
            return {'status': 'error', 'error': 'timeout'}
            
        except Exception as e:
            print(f"   ❌ שגיאה: {e}")
            return {'status': 'error', 'error': str(e)}

    def run_auto_check(self):
        """הרצת בדיקה אוטומטית"""
        print("🔍 בודק CRUD אוטומטית - עמודים קריטיים")
        print("=" * 50)
        
        if not self.check_server_status():
            print("\n💡 לפני הבדיקה, הפעל את השרתר:")
            print("   cd /workspace && ./start_dev.sh")
            return
        
        print(f"\n🚀 בודק {len(self.critical_pages)} עמודים עיקריים...")
        
        for page_key, page_info in self.critical_pages.items():
            result = self.test_page_basic(page_key, page_info)
            self.results[page_key] = {
                'info': page_info,
                'test_result': result,
                'tested_at': datetime.now().isoformat()
            }
            
            # הפסקה קצרה בין בדיקות
            time.sleep(1)
        
        self.generate_summary()

    def generate_summary(self):
        """יצירת סיכום תוצאות"""
        print("\n" + "=" * 50)
        print("📊 סיכום בדיקות CRUD אוטומטיות")
        print("=" * 50)
        
        if not self.results:
            print("❌ לא בוצעו בדיקות")
            return
        
        # ספירת תוצאות
        excellent = sum(1 for r in self.results.values() 
                       if r['test_result'].get('status') == 'excellent')
        good = sum(1 for r in self.results.values() 
                  if r['test_result'].get('status') == 'good')
        problematic = sum(1 for r in self.results.values() 
                         if r['test_result'].get('status') == 'problematic')
        errors = sum(1 for r in self.results.values() 
                    if r['test_result'].get('status') == 'error')
        
        total = len(self.results)
        success_rate = ((excellent + good) / total * 100) if total > 0 else 0
        
        print(f"📈 תוצאות כלליות:")
        print(f"   📄 סה\"כ עמודים: {total}")
        print(f"   🏆 מצוינים: {excellent}")
        print(f"   ✅ טובים: {good}")
        print(f"   ⚠️ בעייתיים: {problematic}")
        print(f"   ❌ שגיאות: {errors}")
        print(f"   🎯 אחוז הצלחה: {success_rate:.1f}%")
        
        print(f"\n📋 תוצאות לפי עמוד:")
        
        # מיון לפי ציון
        sorted_results = sorted(
            self.results.items(),
            key=lambda x: x[1]['test_result'].get('score', 0),
            reverse=True
        )
        
        for page_key, page_data in sorted_results:
            page_name = page_data['info']['name']
            test_result = page_data['test_result']
            status = test_result.get('status', 'unknown')
            score = test_result.get('score', 0)
            
            status_icon = {
                'excellent': '🏆',
                'good': '✅',
                'problematic': '⚠️',
                'error': '❌',
                'warning': '🔶'
            }.get(status, '❓')
            
            if status in ['excellent', 'good']:
                print(f"   {status_icon} {page_name}: {score:.1f}%")
            else:
                error_msg = test_result.get('error', 'שגיאה לא ידועה')
                print(f"   {status_icon} {page_name}: {error_msg}")
            
            # פירוט בעיות
            failed_checks = test_result.get('failed_checks', [])
            if failed_checks:
                print(f"      💥 בעיות: {', '.join(failed_checks)}")
        
        # המלצות
        print(f"\n💡 המלצות:")
        if success_rate >= 95:
            print(f"   🎉 המערכת עובדת מצוין! כל העמודים נגישים ופועלים.")
        elif success_rate >= 80:
            print(f"   👍 המערכת עובדת טוב. יש כמה בעיות קלות לתיקון.")
        elif success_rate >= 60:
            print(f"   ⚠️ יש בעיות בכמה עמודים - דרוש תיקון.")
        else:
            print(f"   🚨 בעיות רציניות במערכת - דרוש תיקון מיידי!")
        
        # עמודים שדורשים תשומת לב
        problematic_pages = [
            (page_key, page_data) for page_key, page_data in self.results.items()
            if page_data['test_result'].get('status') in ['error', 'problematic']
        ]
        
        if problematic_pages:
            print(f"\n🔧 עמודים שדורשים תיקון:")
            for page_key, page_data in problematic_pages:
                page_name = page_data['info']['name']
                error = page_data['test_result'].get('error', 'בעיה לא ידועה')
                print(f"   - {page_name}: {error}")
        
        # שמירת דוח
        self.save_report()
        
        # הצגת הוראות בדיקות ידניות
        self.show_manual_testing_guide()

    def save_report(self):
        """שמירת דוח JSON"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"/workspace/auto-crud-check-{timestamp}.json"
        
        report_data = {
            'test_info': {
                'timestamp': datetime.now().isoformat(),
                'base_url': self.base_url,
                'test_type': 'auto_accessibility_check'
            },
            'results': self.results
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 דוח נשמר: {report_file}")

    def show_manual_testing_guide(self):
        """הצגת מדריך לבדיקות ידניות"""
        print(f"\n📋 מדריך לבדיקות ידניות נוספות:")
        print("=" * 40)
        
        accessible_pages = [
            page_key for page_key, page_data in self.results.items()
            if page_data['test_result'].get('status') in ['excellent', 'good']
        ]
        
        if accessible_pages:
            print(f"✅ עמודים נגישים לבדיקה ידנית:")
            for page_key in accessible_pages:
                page_info = self.results[page_key]['info']
                print(f"   - {page_info['name']}: {self.base_url}{page_info['url']}")
        
        print(f"\n🔧 לבדיקת כפתורים ספציפיים:")
        print(f"   1. פתח עמוד בדפדפן")
        print(f"   2. פתח Developer Tools (F12)")
        print(f"   3. לך ל-Console ובדוק שאין שגיאות JavaScript")
        print(f"   4. בדוק כל כפתור בעמוד:")
        print(f"      - לחץ על כל כפתור")
        print(f"      - בדוק שהוא מגיב")
        print(f"      - בדוק שהפעולה מתבצעת")
        print(f"      - בדוק שאין שגיאות בקונסול")
        
        print(f"\n🎯 כפתורים חשובים לבדיקה בכל עמוד CRUD:")
        crud_buttons = [
            "הוסף חדש (Create)",
            "ערוך (Update)", 
            "מחק (Delete)",
            "רענן נתונים (Read)",
            "מיון עמודות",
            "פילטרים",
            "ייצא נתונים"
        ]
        
        for i, button in enumerate(crud_buttons, 1):
            print(f"   {i}. {button}")

def main():
    """פונקציה ראשית"""
    print("🤖 בודק CRUD אוטומטי - TikTrack")
    print("=" * 35)
    
    checker = AutoCRUDChecker()
    checker.run_auto_check()

if __name__ == "__main__":
    main()