#!/usr/bin/env python3
"""
Add notification preferences to the system
הוספת העדפות התראות למערכת
"""

import sqlite3
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def add_notification_preferences():
    """Add notification preferences to the database"""
    
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'tiktrack.db')
    
    # New notification preferences to add
    notification_preferences = [
        {
            'name': 'enableRealtimeNotifications',
            'description': 'התראות בזמן אמת',
            'default_value': 'true',
            'data_type': 'boolean'
        },
        {
            'name': 'enableBackgroundTaskNotifications',
            'description': 'התראות על משימות ברקע',
            'default_value': 'true',
            'data_type': 'boolean'
        },
        {
            'name': 'enableDataUpdateNotifications',
            'description': 'התראות על עדכוני נתונים',
            'default_value': 'true',
            'data_type': 'boolean'
        },
        {
            'name': 'enableExternalDataNotifications',
            'description': 'התראות על נתונים חיצוניים',
            'default_value': 'true',
            'data_type': 'boolean'
        },
        {
            'name': 'enableSystemEventNotifications',
            'description': 'התראות על אירועי מערכת',
            'default_value': 'true',
            'data_type': 'boolean'
        },
        {
            'name': 'notificationDuration',
            'description': 'משך זמן הצגת התראה (שניות)',
            'default_value': '5',
            'data_type': 'integer'
        },
        {
            'name': 'notificationMaxHistory',
            'description': 'מספר מקסימלי של התראות בהיסטוריה',
            'default_value': '1000',
            'data_type': 'integer'
        }
    ]
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get the notification_settings group ID
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'notification_settings'")
        group_result = cursor.fetchone()
        
        if not group_result:
            print("❌ notification_settings group not found!")
            return False
            
        group_id = group_result[0]
        print(f"✅ Found notification_settings group with ID: {group_id}")
        
        # Check which preferences already exist
        cursor.execute("SELECT preference_name FROM preference_types WHERE group_id = ?", (group_id,))
        existing_preferences = [row[0] for row in cursor.fetchall()]
        print(f"📋 Existing preferences: {existing_preferences}")
        
        # Add new preferences
        added_count = 0
        for pref in notification_preferences:
            if pref['name'] not in existing_preferences:
                cursor.execute("""
                    INSERT INTO preference_types 
                    (group_id, data_type, preference_name, description, default_value, is_required, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    group_id,
                    pref['data_type'],
                    pref['name'],
                    pref['description'],
                    pref['default_value'],
                    False,  # is_required
                    True    # is_active
                ))
                added_count += 1
                print(f"✅ Added preference: {pref['name']}")
            else:
                print(f"⏭️  Preference already exists: {pref['name']}")
        
        conn.commit()
        print(f"\n🎉 Successfully added {added_count} new notification preferences!")
        
        # Show all notification preferences
        cursor.execute("""
            SELECT preference_name, default_value, description 
            FROM preference_types 
            WHERE group_id = ? 
            ORDER BY preference_name
        """, (group_id,))
        
        all_preferences = cursor.fetchall()
        print(f"\n📋 All notification preferences ({len(all_preferences)} total):")
        for pref in all_preferences:
            print(f"  - {pref[0]}: {pref[1]} ({pref[2]})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding notification preferences: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🚀 Adding notification preferences to the system...")
    success = add_notification_preferences()
    if success:
        print("\n✅ Notification preferences added successfully!")
        sys.exit(0)
    else:
        print("\n❌ Failed to add notification preferences!")
        sys.exit(1)
