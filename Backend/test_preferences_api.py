#!/usr/bin/env python3
"""
Test Preferences API
====================

בדיקת API endpoints למערכת העדפות

Author: TikTrack Development Team
Date: January 2025
"""

import requests
import json
import time

def test_preferences_api():
    """בדיקת API endpoints"""
    
    base_url = "http://localhost:8080/api/v1/preferences"
    
    print("🚀 מתחיל בדיקת Preferences API...")
    
    try:
        # בדיקה 1: Health Check
        print("\n📋 בדיקה 1: Health Check")
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check: {data['data']['status']}")
        else:
            print(f"❌ Health Check failed: {response.status_code}")
        
        # בדיקה 2: קבלת העדפה בודדת
        print("\n📋 בדיקה 2: קבלת העדפה בודדת")
        response = requests.get(f"{base_url}/user/single?preference_name=timezone")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Single preference: {data['data']['preference_name']} = {data['data']['value']}")
        else:
            print(f"❌ Single preference failed: {response.status_code}")
        
        # בדיקה 3: קבלת קבוצת העדפות
        print("\n📋 בדיקה 3: קבלת קבוצת העדפות")
        response = requests.get(f"{base_url}/user/group?group_name=general")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Group preferences: {data['data']['group_name']} - {data['data']['count']} items")
            for key, value in list(data['data']['preferences'].items())[:3]:
                print(f"  - {key}: {value}")
        else:
            print(f"❌ Group preferences failed: {response.status_code}")
        
        # בדיקה 4: קבלת העדפות מרובות
        print("\n📋 בדיקה 4: קבלת העדפות מרובות")
        payload = {
            "preference_names": ["timezone", "defaultStopLoss", "primaryColor", "theme"]
        }
        response = requests.post(f"{base_url}/user/multiple", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Multiple preferences: {data['data']['count']} items")
            for key, value in data['data']['preferences'].items():
                print(f"  - {key}: {value}")
        else:
            print(f"❌ Multiple preferences failed: {response.status_code}")
        
        # בדיקה 5: קבלת כל ההעדפות
        print("\n📋 בדיקה 5: קבלת כל ההעדפות")
        response = requests.get(f"{base_url}/user")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ All preferences: {data['data']['count']} items")
        else:
            print(f"❌ All preferences failed: {response.status_code}")
        
        # בדיקה 6: שמירת העדפה בודדת
        print("\n📋 בדיקה 6: שמירת העדפה בודדת")
        payload = {
            "preference_name": "timezone",
            "value": "Asia/Jerusalem"
        }
        response = requests.post(f"{base_url}/user/single", json=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Save single preference: {data['data']['preference_name']} = {data['data']['value']}")
        else:
            print(f"❌ Save single preference failed: {response.status_code}")
        
        # בדיקה 7: קבלת פרופילים
        print("\n📋 בדיקה 7: קבלת פרופילים")
        response = requests.get(f"{base_url}/profiles")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User profiles: {data['data']['count']} profiles")
            for profile in data['data']['profiles']:
                print(f"  - {profile['name']}: active={profile['active']}, default={profile['default']}")
        else:
            print(f"❌ User profiles failed: {response.status_code}")
        
        # בדיקה 8: מידע על העדפה
        print("\n📋 בדיקה 8: מידע על העדפה")
        response = requests.get(f"{base_url}/info/timezone")
        if response.status_code == 200:
            data = response.json()
            info = data['data']['info']
            print(f"✅ Preference info: {info['name']} ({info['type']}) - {info['description']}")
        else:
            print(f"❌ Preference info failed: {response.status_code}")
        
        print("\n🎉 כל הבדיקות הושלמו!")
        return True
        
    except requests.exceptions.ConnectionError:
        print("\n❌ לא ניתן להתחבר לשרת")
        print("💡 ודא שהשרת פועל על http://localhost:8080")
        return False
    except Exception as e:
        print(f"\n❌ שגיאה בבדיקה: {e}")
        return False

if __name__ == "__main__":
    print("🔍 בודק אם השרת פועל...")
    try:
        response = requests.get("http://localhost:8080/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ השרת פועל!")
            success = test_preferences_api()
            if success:
                print("\n✅ API עובד בהצלחה!")
            else:
                print("\n❌ API לא עובד")
        else:
            print(f"❌ השרת לא מגיב: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ השרת לא פועל")
        print("💡 הפעל את השרת עם: python3 dev_server.py")
    except Exception as e:
        print(f"❌ שגיאה: {e}")
