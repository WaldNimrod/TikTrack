#!/usr/bin/env python3
"""
Test Email Logs API - TikTrack
בדיקת API ללוגי מיילים

This script tests the email logs API endpoints.

Author: TikTrack Development Team
Version: 1.0.0
Last Updated: January 28, 2025
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8080"

def test_get_email_logs():
    """Test GET /api/email-logs"""
    print("=" * 70)
    print("🧪 בדיקת GET /api/email-logs")
    print("=" * 70)
    print()
    
    try:
        response = requests.get(f"{BASE_URL}/api/email-logs")
        response.raise_for_status()
        data = response.json()
        
        if data.get('success'):
            logs = data.get('data', {}).get('logs', [])
            pagination = data.get('data', {}).get('pagination', {})
            
            print(f"✅ הצלחה! נמצאו {len(logs)} לוגים")
            print(f"   סה\"כ: {pagination.get('total', 0)}")
            print(f"   מוצגים: {pagination.get('count', 0)}")
            print()
            
            if logs:
                print("📋 דוגמה ללוג ראשון:")
                first_log = logs[0]
                print(f"   ID: {first_log.get('id')}")
                print(f"   Recipient: {first_log.get('recipient')}")
                print(f"   Subject: {first_log.get('subject')}")
                print(f"   Status: {first_log.get('status')}")
                print(f"   Type: {first_log.get('email_type')}")
                print(f"   Created: {first_log.get('created_at')}")
            
            return True
        else:
            print(f"❌ שגיאה: {data.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        return False


def test_get_email_logs_filtered():
    """Test GET /api/email-logs with filters"""
    print("=" * 70)
    print("🧪 בדיקת GET /api/email-logs עם פילטרים")
    print("=" * 70)
    print()
    
    filters = [
        {'status': 'success'},
        {'email_type': 'test'},
        {'days': 1},
        {'limit': 5},
    ]
    
    for filter_params in filters:
        try:
            response = requests.get(f"{BASE_URL}/api/email-logs", params=filter_params)
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                logs = data.get('data', {}).get('logs', [])
                filters_applied = data.get('data', {}).get('filters', {})
                print(f"✅ פילטר {filter_params}: {len(logs)} לוגים")
            else:
                print(f"❌ פילטר {filter_params}: שגיאה")
        except Exception as e:
            print(f"❌ פילטר {filter_params}: {e}")
    
    print()
    return True


def test_get_email_log_statistics():
    """Test GET /api/email-logs/statistics"""
    print("=" * 70)
    print("🧪 בדיקת GET /api/email-logs/statistics")
    print("=" * 70)
    print()
    
    try:
        response = requests.get(f"{BASE_URL}/api/email-logs/statistics", params={'days': 7})
        response.raise_for_status()
        data = response.json()
        
        if data.get('success'):
            stats = data.get('data', {})
            
            print("✅ סטטיסטיקות:")
            print(f"   סה\"כ: {stats.get('total', 0)}")
            print(f"   הצליחו: {stats.get('by_status', {}).get('success', 0)}")
            print(f"   נכשלו: {stats.get('by_status', {}).get('failed', 0)}")
            print()
            
            print("📊 לפי סוג:")
            by_type = stats.get('by_type', {})
            for email_type, count in by_type.items():
                print(f"   - {email_type}: {count}")
            
            print()
            print("📊 5 הנמענים המובילים:")
            top_recipients = stats.get('top_recipients', [])
            for recipient_info in top_recipients[:5]:
                print(f"   - {recipient_info.get('recipient')}: {recipient_info.get('count')}")
            
            return True
        else:
            print(f"❌ שגיאה: {data.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"❌ שגיאה: {e}")
        return False


def main():
    """Run all tests"""
    print()
    print("=" * 70)
    print("📧 בדיקת API ללוגי מיילים")
    print("=" * 70)
    print()
    
    tests = [
        ("קבלת לוגים", test_get_email_logs),
        ("פילטרים", test_get_email_logs_filtered),
        ("סטטיסטיקות", test_get_email_log_statistics),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
            print()
        except Exception as e:
            print(f"❌ שגיאה בבדיקה '{test_name}': {e}")
            results.append((test_name, False))
            print()
    
    # Summary
    print("=" * 70)
    print("📊 סיכום בדיקות")
    print("=" * 70)
    print()
    
    for test_name, result in results:
        status = "✅ עבר" if result else "❌ נכשל"
        print(f"{status} - {test_name}")
    
    print()
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"📊 תוצאות: {passed}/{total} בדיקות עברו")
    print("=" * 70)
    
    return all(result for _, result in results)


if __name__ == '__main__':
    import sys
    success = main()
    sys.exit(0 if success else 1)

