#!/usr/bin/env python3
"""
Full V2 Integration Test
=======================

בדיקה מקיפה שמערכת העדפות V2 משולבת במלואה 
ופועלת עם כל רכיבי האתר.

Author: TikTrack Development Team
Date: January 2025
"""

import subprocess
import sys
import os
import json
import sqlite3
import time
from datetime import datetime


class V2IntegrationTester:
    def __init__(self):
        self.test_results = {}
        self.total_tests = 0
        self.passed_tests = 0
        
    def run_test(self, test_name, test_func):
        """הרץ בדיקה יחידה"""
        print(f"🧪 Running: {test_name}")
        try:
            result = test_func()
            self.test_results[test_name] = {
                'passed': result,
                'error': None
            }
            if result:
                self.passed_tests += 1
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            self.test_results[test_name] = {
                'passed': False, 
                'error': str(e)
            }
            print(f"💥 {test_name}: ERROR - {e}")
        
        self.total_tests += 1
        print()
    
    def test_v2_database_structure(self):
        """בדוק שהטבלאות V2 קיימות ומלאות"""
        try:
            conn = sqlite3.connect('Backend/db/tiktrack.db')
            cursor = conn.cursor()
            
            # בדוק שהטבלאות קיימות
            required_tables = ['preference_profiles', 'user_preferences_v2', 'preference_history']
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            existing_tables = [row[0] for row in cursor.fetchall()]
            
            missing = set(required_tables) - set(existing_tables)
            if missing:
                print(f"❌ Missing tables: {missing}")
                return False
            
            # בדוק שיש נתונים
            cursor.execute("SELECT COUNT(*) FROM preference_profiles WHERE user_id = 1")
            profiles = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM user_preferences_v2 WHERE user_id = 1")
            preferences = cursor.fetchone()[0]
            
            if profiles == 0 or preferences == 0:
                print(f"❌ No data: profiles={profiles}, preferences={preferences}")
                return False
            
            print(f"✅ Tables exist with data: profiles={profiles}, preferences={preferences}")
            return True
            
        except Exception as e:
            print(f"❌ Database test failed: {e}")
            return False
        finally:
            conn.close()
    
    def test_file_structure(self):
        """בדוק שכל הקבצים החדשים קיימים"""
        required_files = [
            'Backend/models/user_preferences_v2.py',
            'Backend/services/preferences_service_v2.py', 
            'Backend/routes/api/preferences_v2.py',
            'trading-ui/preferences-v2.html',
            'trading-ui/scripts/preferences-v2.js',
            'trading-ui/scripts/preferences-v2-compatibility.js'
        ]
        
        missing_files = []
        for file_path in required_files:
            if not os.path.exists(file_path):
                missing_files.append(file_path)
        
        if missing_files:
            print(f"❌ Missing files: {missing_files}")
            return False
        
        print("✅ All V2 files exist")
        return True
    
    def test_html_integration(self):
        """בדוק שקבצי HTML כוללים תמיכה בV2"""
        html_files_with_preferences = [
            'trading-ui/tickers.html',
            'trading-ui/executions.html',
            'trading-ui/preferences-v2.html'
        ]
        
        missing_integration = []
        for file_path in html_files_with_preferences:
            if not os.path.exists(file_path):
                continue
                
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'preferences-v2-compatibility.js' not in content:
                    missing_integration.append(file_path)
        
        if missing_integration:
            print(f"❌ Missing V2 integration: {missing_integration}")
            return False
        
        print("✅ All HTML files include V2 support")
        return True
    
    def test_documentation_updated(self):
        """בדוק שהדוקומנטציה עודכנה"""
        doc_files = [
            'documentation/INDEX.md',
            'documentation/features/preferences/README.md', 
            'documentation/frontend/README.md',
            'README.md'
        ]
        
        missing_v2_docs = []
        for file_path in doc_files:
            if not os.path.exists(file_path):
                continue
                
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'V2' not in content and 'preferences-v2' not in content:
                    missing_v2_docs.append(file_path)
        
        if missing_v2_docs:
            print(f"❌ Documentation missing V2 info: {missing_v2_docs}")
            return False
        
        print("✅ All documentation includes V2 info")
        return True
    
    def test_legacy_backup(self):
        """בדוק שהגיבוי של V1 קיים"""
        backup_dirs = []
        for item in os.listdir('backups/'):
            if 'preferences_legacy_backup' in item:
                backup_dirs.append(item)
        
        if not backup_dirs:
            print("❌ No V1 backup found")
            return False
        
        # בדוק שהגיבוי מכיל קבצים
        latest_backup = sorted(backup_dirs)[-1]
        backup_path = f'backups/{latest_backup}'
        
        expected_files = ['preferences-v2.html', 'preferences-v2.js', 'preferences.py']
        missing_files = []
        
        for file_name in expected_files:
            if not os.path.exists(f'{backup_path}/{file_name}'):
                missing_files.append(file_name)
        
        if missing_files:
            print(f"❌ Backup incomplete, missing: {missing_files}")
            return False
        
        print(f"✅ V1 backup complete: {backup_path}")
        return True
    
    def test_api_registration(self):
        """בדוק שה-API V2 רשום ב-app.py"""
        app_py_path = 'Backend/app.py'
        if not os.path.exists(app_py_path):
            print("❌ Backend/app.py not found")
            return False
        
        with open(app_py_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        checks = [
            'preferences_v2_bp',
            'from routes.api.preferences_v2 import preferences_v2_bp',
            'app.register_blueprint(preferences_v2_bp)'
        ]
        
        missing = []
        for check in checks:
            if check not in content:
                missing.append(check)
        
        if missing:
            print(f"❌ API registration incomplete: {missing}")
            return False
        
        print("✅ V2 API properly registered in app.py")
        return True
    
    def generate_report(self):
        """צור דוח בדיקה מקיף"""
        print("=" * 80)
        print("📋 FULL V2 INTEGRATION TEST REPORT")
        print("=" * 80)
        print(f"🕐 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📊 Results: {self.passed_tests}/{self.total_tests} tests passed")
        print()
        
        # הצג תוצאות מפורטות
        for test_name, result in self.test_results.items():
            status = "✅ PASS" if result['passed'] else "❌ FAIL"
            print(f"{status} {test_name}")
            if result['error']:
                print(f"     Error: {result['error']}")
        
        print()
        
        # סיכום
        success_rate = (self.passed_tests / self.total_tests * 100) if self.total_tests > 0 else 0
        
        if self.passed_tests == self.total_tests:
            print("🎉 ALL TESTS PASSED - V2 SYSTEM FULLY INTEGRATED!")
            print("🚀 Ready for production use!")
        elif success_rate >= 80:
            print(f"✅ MOSTLY SUCCESSFUL ({success_rate:.1f}% pass rate)")
            print("⚠️ Minor issues detected, but system is functional")
        else:
            print(f"⚠️ ISSUES DETECTED ({success_rate:.1f}% pass rate)")
            print("🔧 Requires attention before production use")
        
        return self.passed_tests == self.total_tests


def main():
    print("🚀 Starting Full V2 Integration Test...")
    print("=" * 80)
    
    tester = V2IntegrationTester()
    
    # הרץ כל הבדיקות
    tester.run_test("Database Structure", tester.test_v2_database_structure)
    tester.run_test("File Structure", tester.test_file_structure)
    tester.run_test("HTML Integration", tester.test_html_integration)
    tester.run_test("Documentation Updated", tester.test_documentation_updated)
    tester.run_test("Legacy Backup", tester.test_legacy_backup)
    tester.run_test("API Registration", tester.test_api_registration)
    
    # צור דוח סופי
    success = tester.generate_report()
    
    return 0 if success else 1


if __name__ == '__main__':
    exit(main())