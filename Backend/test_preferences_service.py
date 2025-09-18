#!/usr/bin/env python3
"""
Test Preferences Service V3
===========================

בדיקת השירות החדש למערכת העדפות V3

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.preferences_service import preferences_service

def test_preferences_service():
    """בדיקת השירות החדש"""
    
    print("🚀 מתחיל בדיקת Preferences Service...")
    
    try:
        # בדיקה 1: קבלת העדפה בודדת
        print("\n📋 בדיקה 1: קבלת העדפה בודדת")
        timezone = preferences_service.get_preference(1, 'timezone')
        print(f"✅ timezone: {timezone}")
        
        stop_loss = preferences_service.get_preference(1, 'defaultStopLoss')
        print(f"✅ defaultStopLoss: {stop_loss}")
        
        primary_color = preferences_service.get_preference(1, 'primaryColor')
        print(f"✅ primaryColor: {primary_color}")
        
        # בדיקה 2: קבלת קבוצת העדפות
        print("\n📋 בדיקה 2: קבלת קבוצת העדפות")
        general_prefs = preferences_service.get_group_preferences(1, 'general')
        print(f"✅ general preferences: {len(general_prefs)} items")
        for key, value in general_prefs.items():
            print(f"  - {key}: {value}")
        
        colors_prefs = preferences_service.get_group_preferences(1, 'colors')
        print(f"✅ colors preferences: {len(colors_prefs)} items")
        for key, value in list(colors_prefs.items())[:3]:  # רק 3 ראשונות
            print(f"  - {key}: {value}")
        
        # בדיקה 3: קבלת העדפות מרובות
        print("\n📋 בדיקה 3: קבלת העדפות מרובות")
        multiple_prefs = preferences_service.get_preferences_by_names(1, [
            'timezone', 'defaultStopLoss', 'primaryColor', 'theme'
        ])
        print(f"✅ multiple preferences: {len(multiple_prefs)} items")
        for key, value in multiple_prefs.items():
            print(f"  - {key}: {value}")
        
        # בדיקה 4: קבלת כל ההעדפות
        print("\n📋 בדיקה 4: קבלת כל ההעדפות")
        all_prefs = preferences_service.get_all_user_preferences(1)
        print(f"✅ all preferences: {len(all_prefs)} items")
        
        # פילוח לפי קבוצות
        groups = {}
        for pref_name in all_prefs.keys():
            pref_info = preferences_service.get_preference_info(pref_name)
            group_name = pref_info['group']
            if group_name not in groups:
                groups[group_name] = 0
            groups[group_name] += 1
        
        print("📊 פילוח לפי קבוצות:")
        for group_name, count in groups.items():
            print(f"  - {group_name}: {count} העדפות")
        
        # בדיקה 5: מידע על העדפה
        print("\n📋 בדיקה 5: מידע על העדפה")
        timezone_info = preferences_service.get_preference_info('timezone')
        print(f"✅ timezone info: {timezone_info}")
        
        # בדיקה 6: פרופילים של משתמש
        print("\n📋 בדיקה 6: פרופילים של משתמש")
        profiles = preferences_service.get_user_profiles(1)
        print(f"✅ user profiles: {len(profiles)} profiles")
        for profile in profiles:
            print(f"  - {profile['name']}: active={profile['active']}, default={profile['default']}")
        
        # בדיקה 7: שמירת העדפה
        print("\n📋 בדיקה 7: שמירת העדפה")
        success = preferences_service.save_preference(1, 'timezone', 'Asia/Jerusalem')
        print(f"✅ save preference: {success}")
        
        # בדיקה 8: בדיקת מטמון
        print("\n📋 בדיקה 8: בדיקת מטמון")
        timezone_cached = preferences_service.get_preference(1, 'timezone')
        print(f"✅ timezone from cache: {timezone_cached}")
        
        print("\n🎉 כל הבדיקות הושלמו בהצלחה!")
        return True
        
    except Exception as e:
        print(f"\n❌ שגיאה בבדיקה: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_preferences_service()
    if success:
        print("\n✅ השירות עובד בהצלחה!")
    else:
        print("\n❌ השירות לא עובד")
        sys.exit(1)
