#!/usr/bin/env python3
"""
Simple V2 System Test (SQLite3 Direct)
=====================================

בדיקה פשוטה של מערכת V2 ללא SQLAlchemy

Author: TikTrack Development Team
Date: January 2025
"""

import sqlite3
import json
from datetime import datetime


def test_v2_api_endpoints():
    """בדוק שה-API endpoints של V2 נגישים"""
    
    print("🔍 Testing V2 API endpoints availability...")
    
    try:
        import requests
        
        # נסה לגשת ל-API (אם השרת רץ)
        base_url = "http://localhost:5000"
        
        endpoints_to_test = [
            '/api/v2/preferences/',
            '/api/v2/preferences/profiles',
            '/api/v2/preferences/compatibility/v1'
        ]
        
        for endpoint in endpoints_to_test:
            try:
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
                status = "✅" if response.status_code < 500 else "⚠️"
                print(f"  {status} {endpoint}: HTTP {response.status_code}")
            except requests.exceptions.ConnectionError:
                print(f"  🔸 {endpoint}: Server not running (expected)")
            except Exception as e:
                print(f"  ❌ {endpoint}: {e}")
        
    except ImportError:
        print("  📝 requests not installed - skipping API tests")


def test_v2_data_integrity():
    """בדוק שלמות הנתונים במערכת V2"""
    
    print("\n🔍 Testing V2 data integrity...")
    
    db_path = 'db/tiktrack.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # בדוק שהטבלאות קיימות
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name IN ('preference_profiles', 'user_preferences_v2', 'preference_history')
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        expected_tables = ['preference_profiles', 'user_preferences_v2', 'preference_history']
        missing_tables = set(expected_tables) - set(tables)
        
        if missing_tables:
            print(f"❌ Missing tables: {missing_tables}")
            return False
        else:
            print("✅ All V2 tables exist")
        
        # בדוק יושרת הנתונים
        cursor.execute("""
            SELECT pp.profile_name, up2.primary_currency, up2.migrated_from_v1
            FROM preference_profiles pp
            JOIN user_preferences_v2 up2 ON pp.id = up2.profile_id
            WHERE pp.user_id = 1
        """)
        
        v2_data = cursor.fetchone()
        if v2_data:
            print(f"✅ Profile: {v2_data[0]}")
            print(f"✅ Currency: {v2_data[1]}")
            print(f"✅ Migrated: {bool(v2_data[2])}")
        else:
            print("❌ No V2 data found")
            return False
        
        # בדוק JSON fields
        cursor.execute("""
            SELECT color_scheme_json, opacity_settings_json, refresh_overrides_json
            FROM user_preferences_v2 WHERE user_id = 1
        """)
        
        json_data = cursor.fetchone()
        if json_data:
            json_fields = ['color_scheme', 'opacity_settings', 'refresh_overrides']
            for i, field_name in enumerate(json_fields):
                if json_data[i]:
                    try:
                        parsed = json.loads(json_data[i])
                        print(f"✅ {field_name}: {len(parsed)} keys")
                    except json.JSONDecodeError:
                        print(f"❌ {field_name}: Invalid JSON")
                else:
                    print(f"🔸 {field_name}: Empty")
        
        return True
        
    except Exception as e:
        print(f"❌ Data integrity test failed: {e}")
        return False
    finally:
        conn.close()


def test_migration_completeness():
    """בדוק שהמיגרציה הושלמה"""
    
    print("\n🔍 Testing migration completeness...")
    
    db_path = 'db/tiktrack.db'
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # השווה V1 ו-V2
        cursor.execute("SELECT primary_currency, default_stop_loss, default_status_filter FROM user_preferences WHERE user_id = 1")
        v1_data = cursor.fetchone()
        
        cursor.execute("SELECT primary_currency, default_stop_loss, default_status_filter FROM user_preferences_v2 WHERE user_id = 1")
        v2_data = cursor.fetchone()
        
        if not v1_data:
            print("⚠️ No V1 data to compare")
            return True
        
        if not v2_data:
            print("❌ No V2 data found")
            return False
        
        # השווה ערכים מפתח
        comparisons = [
            ('Currency', v1_data[0], v2_data[0]),
            ('Stop Loss', v1_data[1], v2_data[1]),
            ('Status Filter', v1_data[2], v2_data[2])
        ]
        
        all_match = True
        for name, v1_val, v2_val in comparisons:
            if str(v1_val) == str(v2_val):
                print(f"✅ {name}: {v1_val} ➜ {v2_val}")
            else:
                print(f"❌ {name}: {v1_val} ≠ {v2_val}")
                all_match = False
        
        return all_match
        
    except Exception as e:
        print(f"❌ Migration test failed: {e}")
        return False
    finally:
        conn.close()


def create_test_report():
    """צור דוח בדיקה מקיף"""
    
    print("=" * 60)
    print("📋 PREFERENCES V2 SYSTEM TEST REPORT")
    print("=" * 60)
    print(f"🕐 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("API Endpoints", test_v2_api_endpoints),
        ("Data Integrity", test_v2_data_integrity), 
        ("Migration Completeness", test_migration_completeness)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"🧪 Running: {test_name}")
        try:
            result = test_func()
            results.append((test_name, result, None))
        except Exception as e:
            results.append((test_name, False, str(e)))
            print(f"❌ {test_name} failed: {e}")
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result, error in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if error:
            print(f"     Error: {error}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED - V2 SYSTEM READY!")
    else:
        print("⚠️ SOME TESTS FAILED - CHECK ERRORS ABOVE")
    
    return passed == total


if __name__ == '__main__':
    success = create_test_report()
    exit(0 if success else 1)