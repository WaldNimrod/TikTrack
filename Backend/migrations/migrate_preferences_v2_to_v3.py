#!/usr/bin/env python3
"""
Preferences System V3 - Data Migration
======================================

מיגרציה מנתונים קיימים V2 למערכת V3 החדשה

Author: TikTrack Development Team
Date: January 2025
"""

import sqlite3
import os
import sys
import json
from datetime import datetime

# הוסף את הנתיב למודולים
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def migrate_preferences_v2_to_v3():
    """מיגרציה מנתונים קיימים V2 למערכת V3 החדשה"""
    
    # נתיב לבסיס הנתונים
    db_path = 'db/simpleTrade_new.db'
    
    if not os.path.exists(db_path):
        print(f"❌ בסיס הנתונים לא נמצא: {db_path}")
        return False
    
    try:
        # חיבור לבסיס הנתונים
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🚀 מתחיל מיגרציה מנתונים קיימים V2 למערכת V3...")
        
        # 1. בדיקת נתונים קיימים
        cursor.execute("SELECT COUNT(*) FROM user_preferences")
        existing_count = cursor.fetchone()[0]
        print(f"📊 נמצאו {existing_count} רשומות קיימות")
        
        if existing_count == 0:
            print("ℹ️ אין נתונים קיימים למיגרציה")
            return True
        
        # 2. קבלת נתונים קיימים
        cursor.execute("SELECT * FROM user_preferences LIMIT 1")
        existing_data = cursor.fetchone()
        
        if not existing_data:
            print("ℹ️ אין נתונים למיגרציה")
            return True
        
        # 3. מיפוי שדות קיימים לסוגי העדפות חדשים
        field_mapping = {
            # קבוצת general
            'primary_currency': ('general', 'string', 'primaryCurrency', 'מטבע ראשי', '{"options": ["USD", "ILS", "EUR"]}'),
            'secondary_currency': ('general', 'string', 'secondaryCurrency', 'מטבע משני', '{"options": ["USD", "ILS", "EUR"]}'),
            'timezone': ('general', 'string', 'timezone', 'אזור זמן של המשתמש', '{"options": ["Asia/Jerusalem", "America/New_York"]}'),
            'default_stop_loss': ('general', 'number', 'defaultStopLoss', 'אחוז stop loss ברירת מחדל', '{"min": 0, "max": 100}'),
            'default_target_price': ('general', 'number', 'defaultTargetPrice', 'אחוז target price ברירת מחדל', '{"min": 0, "max": 1000}'),
            'default_commission': ('general', 'number', 'defaultCommission', 'עמלה ברירת מחדל', '{"min": 0, "max": 100}'),
            
            # קבוצת filters
            'default_status_filter': ('filters', 'string', 'defaultStatusFilter', 'פילטר סטטוס ברירת מחדל', '{"options": ["open", "closed", "cancelled", "all"]}'),
            'default_type_filter': ('filters', 'string', 'defaultTypeFilter', 'פילטר סוג ברירת מחדל', '{"options": ["swing", "investment", "passive", "all"]}'),
            'default_account_filter': ('filters', 'string', 'defaultAccountFilter', 'פילטר חשבון ברירת מחדל', '{"options": ["all"]}'),
            'default_date_range_filter': ('filters', 'string', 'defaultDateRangeFilter', 'פילטר טווח תאריכים ברירת מחדל', '{"options": ["today", "this_week", "this_month", "all"]}'),
            
            # קבוצת ui
            'theme': ('ui', 'string', 'theme', 'ערכת נושא', '{"options": ["light", "dark", "auto"]}'),
            'compact_mode': ('ui', 'boolean', 'compactMode', 'מצב קומפקטי', '{}'),
            'show_animations': ('ui', 'boolean', 'showAnimations', 'הצג אנימציות', '{}'),
            'sidebar_position': ('ui', 'string', 'sidebarPosition', 'מיקום סרגל צד', '{"options": ["left", "right"]}'),
            'table_page_size': ('ui', 'number', 'tablePageSize', 'גודל עמוד בטבלה', '{"min": 10, "max": 100}'),
            
            # קבוצת external_data
            'primary_data_provider': ('external_data', 'string', 'primaryDataProvider', 'ספק נתונים ראשי', '{"options": ["yahoo", "google", "alpha_vantage"]}'),
            'data_refresh_interval': ('external_data', 'number', 'dataRefreshInterval', 'מרווח רענון נתונים (דקות)', '{"min": 1, "max": 1440}'),
            'cache_ttl': ('external_data', 'number', 'cacheTTL', 'זמן חיים של מטמון (דקות)', '{"min": 1, "max": 1440}'),
            
            # קבוצת notifications
            'enable_notifications': ('notifications', 'boolean', 'enableNotifications', 'הפעל התראות', '{}'),
            'notification_sound': ('notifications', 'boolean', 'notificationSound', 'צליל התראות', '{}'),
            'notification_popup': ('notifications', 'boolean', 'notificationPopup', 'חלון קופץ התראות', '{}'),
            'notify_on_trade_executed': ('notifications', 'boolean', 'notifyOnTradeExecuted', 'התראה על ביצוע עסקה', '{}'),
            'notify_on_stop_loss': ('notifications', 'boolean', 'notifyOnStopLoss', 'התראה על stop loss', '{}'),
            
            # קבוצת colors
            'primary_color': ('colors', 'color', 'primaryColor', 'צבע ראשי של הממשק', '{"format": "hex"}'),
            'secondary_color': ('colors', 'color', 'secondaryColor', 'צבע משני של הממשק', '{"format": "hex"}'),
            'success_color': ('colors', 'color', 'successColor', 'צבע הצלחה', '{"format": "hex"}'),
            'warning_color': ('colors', 'color', 'warningColor', 'צבע אזהרה', '{"format": "hex"}'),
            'danger_color': ('colors', 'color', 'dangerColor', 'צבע סכנה', '{"format": "hex"}'),
            'entity_ticker_color': ('colors', 'color', 'entityTickerColor', 'צבע טיקר', '{"format": "hex"}'),
            'entity_trade_color': ('colors', 'color', 'entityTradeColor', 'צבע עסקה', '{"format": "hex"}'),
            'entity_account_color': ('colors', 'color', 'entityAccountColor', 'צבע חשבון', '{"format": "hex"}'),
        }
        
        # 4. קבלת שמות עמודות מהטבלה הקיימת
        cursor.execute("PRAGMA table_info(user_preferences)")
        columns_info = cursor.fetchall()
        column_names = [col[1] for col in columns_info]
        
        print(f"📋 נמצאו {len(column_names)} עמודות בטבלה הקיימת")
        
        # 5. יצירת פרופיל נימרוד
        print("👤 יוצר פרופיל נימרוד...")
        cursor.execute('''
            INSERT OR IGNORE INTO preference_profiles 
            (user_id, profile_name, is_active, is_default, description, created_by)
            VALUES (1, 'נימרוד', TRUE, TRUE, 'פרופיל נימרוד עם נתונים אמיתיים', 1)
        ''')
        
        # קבלת ID של פרופיל נימרוד
        cursor.execute("SELECT id FROM preference_profiles WHERE profile_name = 'נימרוד'")
        nimrod_profile_id = cursor.fetchone()[0]
        print(f"✅ פרופיל נימרוד נוצר עם ID: {nimrod_profile_id}")
        
        # 6. מיגרציה של נתונים
        print("🔄 מתחיל מיגרציה של נתונים...")
        
        migrated_count = 0
        skipped_count = 0
        
        for field_name, (group_name, data_type, preference_name, description, constraints) in field_mapping.items():
            if field_name in column_names:
                # קבלת ערך מהטבלה הקיימת
                cursor.execute(f"SELECT {field_name} FROM user_preferences LIMIT 1")
                result = cursor.fetchone()
                
                if result and result[0] is not None:
                    value = str(result[0])
                    
                    # קבלת group_id
                    cursor.execute("SELECT id FROM preference_groups WHERE group_name = ?", (group_name,))
                    group_result = cursor.fetchone()
                    
                    if group_result:
                        group_id = group_result[0]
                        
                        # בדיקה אם סוג העדפה כבר קיים
                        cursor.execute('''
                            SELECT id FROM preference_types 
                            WHERE group_id = ? AND preference_name = ?
                        ''', (group_id, preference_name))
                        
                        preference_type_result = cursor.fetchone()
                        
                        if preference_type_result:
                            preference_id = preference_type_result[0]
                            
                            # הוספת העדפה לפרופיל נימרוד
                            cursor.execute('''
                                INSERT OR REPLACE INTO user_preferences_v3 
                                (user_id, profile_id, preference_id, saved_value)
                                VALUES (1, ?, ?, ?)
                            ''', (nimrod_profile_id, preference_id, value))
                            
                            migrated_count += 1
                            print(f"  ✅ {preference_name}: {value}")
                        else:
                            print(f"  ⚠️ סוג העדפה לא נמצא: {preference_name}")
                            skipped_count += 1
                    else:
                        print(f"  ⚠️ קבוצה לא נמצאה: {group_name}")
                        skipped_count += 1
                else:
                    print(f"  ⚠️ ערך ריק עבור: {field_name}")
                    skipped_count += 1
            else:
                print(f"  ⚠️ שדה לא נמצא בטבלה: {field_name}")
                skipped_count += 1
        
        # 7. שמירת שינויים
        conn.commit()
        
        print(f"\n✅ מיגרציה הושלמה!")
        print(f"📊 {migrated_count} העדפות הועברו בהצלחה")
        print(f"⚠️ {skipped_count} העדפות דולגו")
        
        # 8. בדיקת תוצאות
        print("\n🔍 בדיקת תוצאות המיגרציה:")
        
        cursor.execute("SELECT COUNT(*) FROM user_preferences_v3")
        v3_count = cursor.fetchone()[0]
        print(f"  - user_preferences_v3: {v3_count} רשומות")
        
        cursor.execute("SELECT COUNT(*) FROM preference_profiles WHERE profile_name = 'נימרוד'")
        nimrod_count = cursor.fetchone()[0]
        print(f"  - פרופיל נימרוד: {nimrod_count} פרופילים")
        
        # הצגת דוגמאות
        print("\n📋 דוגמאות העדפות שהועברו:")
        cursor.execute('''
            SELECT pt.preference_name, upv3.saved_value, pg.group_name
            FROM user_preferences_v3 upv3
            JOIN preference_types pt ON upv3.preference_id = pt.id
            JOIN preference_groups pg ON pt.group_id = pg.id
            LIMIT 10
        ''')
        
        examples = cursor.fetchall()
        for pref_name, value, group_name in examples:
            print(f"  - {group_name}.{pref_name}: {value}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ שגיאה במיגרציה: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    print("🚀 מתחיל מיגרציה מנתונים קיימים V2 למערכת V3...")
    success = migrate_preferences_v2_to_v3()
    
    if success:
        print("\n🎉 מיגרציה הושלמה בהצלחה!")
        print("👤 פרופיל נימרוד נוצר עם נתונים אמיתיים")
        print("📊 נתונים קיימים הועברו למערכת V3")
    else:
        print("\n❌ שגיאה במיגרציה")
        sys.exit(1)
