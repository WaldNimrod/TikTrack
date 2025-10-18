#!/usr/bin/env python3
"""
סקריפט בדיקה מקיף למערכת הכפתורים
Comprehensive testing script for button system
"""

import os
import re
import requests
from datetime import datetime

class ButtonSystemTester:
    def __init__(self):
        self.base_url = "http://localhost:8080/trading-ui"
        self.test_results = {
            'functional': [],
            'accessibility': [],
            'performance': [],
            'browser_compatibility': [],
            'errors': []
        }
        self.start_time = datetime.now()
    
    def run_all_tests(self):
        """הרצת כל הבדיקות"""
        print("🚀 מתחיל בדיקות מקיפות למערכת הכפתורים...")
        print(f"⏰ זמן התחלה: {self.start_time.strftime('%H:%M:%S')}")
        print("=" * 60)
        
        # בדיקות פונקציונליות
        self.test_functional()
        
        # בדיקות נגישות
        self.test_accessibility()
        
        # בדיקות ביצועים
        self.test_performance()
        
        # בדיקות תאימות דפדפנים
        self.test_browser_compatibility()
        
        # סיכום
        self.print_summary()
    
    def test_functional(self):
        """בדיקות פונקציונליות"""
        print("\n📋 בדיקות פונקציונליות")
        print("-" * 30)
        
        # רשימת עמודים לבדיקה
        pages = [
            'trades.html',
            'alerts.html', 
            'executions.html',
            'trading_accounts.html',
            'notes.html',
            'tickers.html',
            'cash_flows.html',
            'trade_plans.html',
            'constraints.html',
            'preferences.html',
            'designs.html',
            'db_display.html',
            'research.html',
            'db_extradata.html',
            'index.html'
        ]
        
        total_buttons = 0
        pages_with_buttons = 0
        
        for page in pages:
            try:
                url = f"{self.base_url}/{page}"
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    content = response.text
                    
                    # בדיקת כפתורים עם data attributes
                    data_buttons = len(re.findall(r'data-button-type', content))
                    
                    # בדיקת טעינת JavaScript
                    has_button_icons = 'button-icons.js' in content
                    has_button_system_init = 'button-system-init.js' in content
                    
                    # בדיקת כפתורים שבורים
                    broken_buttons = len(re.findall(r'\$\{createButton', content))
                    
                    if data_buttons > 0:
                        pages_with_buttons += 1
                        total_buttons += data_buttons
                        
                        result = {
                            'page': page,
                            'data_buttons': data_buttons,
                            'has_button_icons': has_button_icons,
                            'has_button_system_init': has_button_system_init,
                            'broken_buttons': broken_buttons,
                            'status': 'PASS' if broken_buttons == 0 else 'FAIL'
                        }
                        
                        self.test_results['functional'].append(result)
                        
                        status_icon = "✅" if result['status'] == 'PASS' else "❌"
                        print(f"{status_icon} {page}: {data_buttons} כפתורים, {broken_buttons} שבורים")
                    else:
                        print(f"⚠️  {page}: אין כפתורים עם data attributes")
                else:
                    print(f"❌ {page}: שגיאה {response.status_code}")
                    self.test_results['errors'].append(f"{page}: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {page}: שגיאה - {str(e)}")
                self.test_results['errors'].append(f"{page}: {str(e)}")
        
        print(f"\n📊 סיכום פונקציונלי:")
        print(f"   - עמודים עם כפתורים: {pages_with_buttons}")
        print(f"   - סה\"כ כפתורים: {total_buttons}")
        print(f"   - עמודים שעברו: {len([r for r in self.test_results['functional'] if r['status'] == 'PASS'])}")
        print(f"   - עמודים נכשלו: {len([r for r in self.test_results['functional'] if r['status'] == 'FAIL'])}")
    
    def test_accessibility(self):
        """בדיקות נגישות"""
        print("\n♿ בדיקות נגישות")
        print("-" * 30)
        
        # בדיקת עמוד אחד כדוגמה
        try:
            url = f"{self.base_url}/trades.html"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                content = response.text
                
                # בדיקת aria-labels
                aria_labels = len(re.findall(r'aria-label', content))
                
                # בדיקת title attributes
                title_attributes = len(re.findall(r'title=', content))
                
                # בדיקת alt attributes
                alt_attributes = len(re.findall(r'alt=', content))
                
                # בדיקת role attributes
                role_attributes = len(re.findall(r'role=', content))
                
                result = {
                    'aria_labels': aria_labels,
                    'title_attributes': title_attributes,
                    'alt_attributes': alt_attributes,
                    'role_attributes': role_attributes,
                    'status': 'PASS' if aria_labels > 0 and title_attributes > 0 else 'WARN'
                }
                
                self.test_results['accessibility'].append(result)
                
                print(f"✅ aria-labels: {aria_labels}")
                print(f"✅ title attributes: {title_attributes}")
                print(f"✅ alt attributes: {alt_attributes}")
                print(f"✅ role attributes: {role_attributes}")
                
            else:
                print(f"❌ שגיאה בטעינת העמוד: {response.status_code}")
                
        except Exception as e:
            print(f"❌ שגיאה בבדיקת נגישות: {str(e)}")
    
    def test_performance(self):
        """בדיקות ביצועים"""
        print("\n⚡ בדיקות ביצועים")
        print("-" * 30)
        
        # בדיקת זמני טעינה
        pages_to_test = ['trades.html', 'designs.html', 'alerts.html']
        
        for page in pages_to_test:
            try:
                url = f"{self.base_url}/{page}"
                start_time = datetime.now()
                
                response = requests.get(url, timeout=10)
                
                if response.status_code == 200:
                    end_time = datetime.now()
                    load_time = (end_time - start_time).total_seconds()
                    
                    # בדיקת גודל התגובה
                    content_size = len(response.content)
                    
                    result = {
                        'page': page,
                        'load_time': load_time,
                        'content_size': content_size,
                        'status': 'PASS' if load_time < 2.0 else 'SLOW'
                    }
                    
                    self.test_results['performance'].append(result)
                    
                    status_icon = "✅" if result['status'] == 'PASS' else "⚠️"
                    print(f"{status_icon} {page}: {load_time:.2f}s, {content_size:,} bytes")
                    
                else:
                    print(f"❌ {page}: שגיאה {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {page}: שגיאה - {str(e)}")
    
    def test_browser_compatibility(self):
        """בדיקות תאימות דפדפנים"""
        print("\n🌐 בדיקות תאימות דפדפנים")
        print("-" * 30)
        
        # בדיקת תכונות JavaScript
        try:
            url = f"{self.base_url}/trades.html"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                content = response.text
                
                # בדיקת תכונות מתקדמות
                has_mutation_observer = 'MutationObserver' in content or 'mutationobserver' in content
                has_es6_features = 'class ' in content or 'const ' in content
                has_modern_js = 'addEventListener' in content
                
                result = {
                    'mutation_observer': has_mutation_observer,
                    'es6_features': has_es6_features,
                    'modern_js': has_modern_js,
                    'status': 'PASS' if has_modern_js else 'FAIL'
                }
                
                self.test_results['browser_compatibility'].append(result)
                
                print(f"✅ MutationObserver: {'כן' if has_mutation_observer else 'לא'}")
                print(f"✅ ES6 Features: {'כן' if has_es6_features else 'לא'}")
                print(f"✅ Modern JS: {'כן' if has_modern_js else 'לא'}")
                
            else:
                print(f"❌ שגיאה בטעינת העמוד: {response.status_code}")
                
        except Exception as e:
            print(f"❌ שגיאה בבדיקת תאימות: {str(e)}")
    
    def print_summary(self):
        """הדפסת סיכום הבדיקות"""
        end_time = datetime.now()
        total_time = (end_time - self.start_time).total_seconds()
        
        print("\n" + "=" * 60)
        print("📊 סיכום בדיקות מערכת הכפתורים")
        print("=" * 60)
        
        # סטטיסטיקות כלליות
        total_tests = 0
        passed_tests = 0
        
        for category, results in self.test_results.items():
            if category != 'errors':
                total_tests += len(results)
                passed_tests += len([r for r in results if r.get('status') == 'PASS'])
        
        print(f"⏰ זמן כולל: {total_time:.2f} שניות")
        print(f"🧪 סה\"כ בדיקות: {total_tests}")
        print(f"✅ עברו: {passed_tests}")
        print(f"❌ נכשלו: {total_tests - passed_tests}")
        print(f"📈 אחוז הצלחה: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%")
        
        # שגיאות
        if self.test_results['errors']:
            print(f"\n❌ שגיאות ({len(self.test_results['errors'])}):")
            for error in self.test_results['errors']:
                print(f"   - {error}")
        
        # המלצות
        print(f"\n💡 המלצות:")
        if passed_tests == total_tests:
            print("   🎉 כל הבדיקות עברו בהצלחה!")
            print("   ✅ המערכת מוכנה לשימוש")
        else:
            print("   ⚠️  יש לתקן את הבעיות שנמצאו")
            print("   🔧 בדוק את הלוגים לפרטים נוספים")
        
        print("\n" + "=" * 60)

def main():
    """פונקציה ראשית"""
    tester = ButtonSystemTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
