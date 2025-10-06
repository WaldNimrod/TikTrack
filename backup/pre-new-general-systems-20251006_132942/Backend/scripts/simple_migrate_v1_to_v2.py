#!/usr/bin/env python3
"""
Simple Migration Script V1 to V2 (SQLite3 Direct)
================================================

מיגרציה פשוטה ישירה מV1 לV2 ללא SQLAlchemy

Author: TikTrack Development Team  
Version: 2.0
Date: January 2025
"""

import sqlite3
import json
import os
from datetime import datetime
import sys


def migrate_user_preferences():
    """מעביר הגדרות מV1 לV2"""
    
    db_path = 'db/tiktrack.db'
    
    print("🚀 Starting simple migration from V1 to V2...")
    print(f"📊 Database: {db_path}")
    print("-" * 50)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 1. קבל נתונים מV1
        print("📋 Step 1: Reading V1 preferences...")
        
        # מהטבלה user_preferences
        cursor.execute("SELECT * FROM user_preferences WHERE user_id = 1")
        legacy_structured = cursor.fetchone()
        
        if legacy_structured:
            # קבל את שמות העמודות
            cursor.execute("PRAGMA table_info(user_preferences)")
            columns = [col[1] for col in cursor.fetchall()]
            legacy_data = dict(zip(columns, legacy_structured))
            print(f"✅ Found structured V1 data: {len(legacy_data)} fields")
        else:
            print("❌ No structured V1 data found")
            return False
            
        # מהשדה JSON של המשתמש
        cursor.execute("SELECT preferences_json FROM users WHERE id = 1")
        json_result = cursor.fetchone()
        
        json_data = {}
        if json_result and json_result[0]:
            try:
                json_data = json.loads(json_result[0])
                print(f"✅ Found JSON V1 data: {len(json_data)} fields")
            except json.JSONDecodeError:
                print("⚠️ JSON data corrupted, skipping")
        
        # 2. צור פרופיל ברירת מחדל
        print("📁 Step 2: Creating default profile...")
        
        cursor.execute("""
            INSERT OR REPLACE INTO preference_profiles 
            (id, user_id, profile_name, is_default, is_active, description, created_by)
            VALUES (1, 1, 'ברירת מחדל', 1, 1, 'פרופיל ברירת מחדל מ-V1', 1)
        """)
        
        print("✅ Created default profile")
        
        # 3. יצור הגדרות V2
        print("🔄 Step 3: Creating V2 preferences...")
        
        # הכן נתונים למיגרציה
        now = datetime.utcnow().isoformat()
        
        # ערכים בסיסיים מV1
        primary_currency = legacy_data.get('primary_currency', json_data.get('primaryCurrency', 'USD'))
        timezone = legacy_data.get('timezone', json_data.get('timezone', 'Asia/Jerusalem'))
        default_stop_loss = legacy_data.get('default_stop_loss', json_data.get('defaultStopLoss', 5.0))
        default_target_price = legacy_data.get('default_target_price', json_data.get('defaultTargetPrice', 10.0))
        default_commission = legacy_data.get('default_commission', json_data.get('defaultCommission', 1.0))
        
        # פילטרים
        default_status_filter = legacy_data.get('default_status_filter', json_data.get('defaultStatusFilter', 'open'))
        default_type_filter = legacy_data.get('default_type_filter', json_data.get('defaultTypeFilter', 'swing'))
        default_account_filter = legacy_data.get('default_account_filter', json_data.get('defaultAccountFilter', 'all'))
        default_date_range_filter = legacy_data.get('default_date_range_filter', json_data.get('defaultDateRangeFilter', 'this_week'))
        default_search_filter = legacy_data.get('default_search_filter', json_data.get('defaultSearchFilter', ''))
        
        # נתונים חיצוניים
        primary_data_provider = legacy_data.get('primary_data_provider', json_data.get('primaryDataProvider', 'yahoo'))
        secondary_data_provider = legacy_data.get('secondary_data_provider', json_data.get('secondaryDataProvider', 'google'))
        cache_ttl = legacy_data.get('cache_ttl', json_data.get('cacheTTL', 5))
        max_batch_size = legacy_data.get('max_batch_size', json_data.get('maxBatchSize', 25))
        request_delay = legacy_data.get('request_delay', json_data.get('requestDelay', 200))
        retry_attempts = legacy_data.get('retry_attempts', json_data.get('retryAttempts', 2))
        retry_delay = legacy_data.get('retry_delay', json_data.get('retryDelay', 5))
        
        show_percentage_changes = legacy_data.get('show_percentage_changes', json_data.get('showPercentageChanges', True))
        show_volume = legacy_data.get('show_volume', json_data.get('showVolume', True))
        notify_on_data_failures = legacy_data.get('notify_on_data_failures', json_data.get('notifyOnDataFailures', True))
        notify_on_stale_data = legacy_data.get('notify_on_stale_data', json_data.get('notifyOnStaleData', False))
        
        # קונסול
        console_cleanup_interval = legacy_data.get('console_cleanup_interval', json_data.get('consoleCleanupInterval', 60000))
        # המר מ-milliseconds ל-seconds אם נדרש
        if console_cleanup_interval > 1000:
            console_cleanup_interval = int(console_cleanup_interval / 1000)
        
        verbose_logging = legacy_data.get('verbose_logging', json_data.get('verboseLogging', False))
        
        # JSON fields - צור מערכת צבעים מאוחדת
        color_scheme = {}
        if 'numericValueColors' in json_data:
            color_scheme['numericValues'] = json_data['numericValueColors']
        if 'entityColors' in json_data:
            color_scheme['entities'] = json_data['entityColors']
        if 'statusColors' in json_data:
            color_scheme['status'] = json_data['statusColors']
        if 'investmentTypeColors' in json_data:
            color_scheme['investmentTypes'] = json_data['investmentTypeColors']
        
        color_scheme_json = json.dumps(color_scheme) if color_scheme else None
        
        # הגדרות שקיפות
        opacity_settings = {}
        if 'headerOpacity' in json_data:
            opacity_settings['header'] = json_data['headerOpacity']
        
        opacity_settings_json = json.dumps(opacity_settings) if opacity_settings else None
        
        # הגדרות רענון
        refresh_overrides_json = None
        if 'refreshOverrides' in json_data:
            refresh_overrides_json = json.dumps(json_data['refreshOverrides'])
        
        # הכנס לטבלת V2
        cursor.execute("""
            INSERT OR REPLACE INTO user_preferences_v2 (
                user_id, profile_id,
                primary_currency, timezone,
                default_stop_loss, default_target_price, default_commission,
                default_status_filter, default_type_filter, default_account_filter,
                default_date_range_filter, default_search_filter,
                data_refresh_interval, primary_data_provider, secondary_data_provider,
                cache_ttl, max_batch_size, request_delay, retry_attempts, retry_delay,
                show_percentage_changes, show_volume, 
                notify_on_data_failures, notify_on_stale_data,
                console_cleanup_interval, verbose_logging,
                color_scheme_json, opacity_settings_json, refresh_overrides_json,
                migrated_from_legacy, migration_date, version
            ) VALUES (
                1, 1,
                ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?,
                ?, ?,
                ?, ?, ?,
                1, ?, '2.0'
            )
        """, (
            primary_currency, timezone,
            default_stop_loss, default_target_price, default_commission,
            default_status_filter, default_type_filter, default_account_filter,
            default_date_range_filter, default_search_filter,
            data_refresh_interval, primary_data_provider, secondary_data_provider,
            cache_ttl, max_batch_size, request_delay, retry_attempts, retry_delay,
            show_percentage_changes, show_volume,
            notify_on_data_failures, notify_on_stale_data,
            console_cleanup_interval, verbose_logging,
            color_scheme_json, opacity_settings_json, refresh_overrides_json,
            now
        ))
        
        print("✅ Created V2 preferences")
        
        # 4. צור רשומת היסטוריה
        print("📝 Step 4: Creating history entry...")
        
        cursor.execute("""
            INSERT INTO preference_history (
                user_id, profile_id, change_type, 
                old_value, new_value, changed_by, change_reason
            ) VALUES (1, 1, 'migrate_from_legacy', ?, ?, 1, 'Automated migration from legacy to V2')
        """, (
            json.dumps({'legacy_fields': len(legacy_data) + len(json_data)}),
            json.dumps({'migrated_at': now})
        ))
        
        print("✅ Created history entry")
        
        # 5. אמת תוצאות
        print("🔍 Step 5: Verifying migration...")
        
        cursor.execute("SELECT COUNT(*) FROM user_preferences_v2 WHERE user_id = 1")
        v2_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM preference_profiles WHERE user_id = 1")
        profiles_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM preference_history WHERE user_id = 1")
        history_count = cursor.fetchone()[0]
        
        print(f"📊 Migration Results:")
        print(f"  - V2 Preferences: {v2_count}")
        print(f"  - Profiles: {profiles_count}")
        print(f"  - History Entries: {history_count}")
        
        # שמור שינויים
        conn.commit()
        
        print("-" * 50)
        print("🎉 Migration completed successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()


def verify_migration():
    """בדוק שהמיגרציה הושלמה בהצלחה"""
    
    db_path = 'db/tiktrack.db'
    
    print("🔍 Verifying migration results...")
    print("-" * 30)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # בדוק V2
        cursor.execute("""
            SELECT primary_currency, timezone, default_stop_loss, 
                   migrated_from_legacy, migration_date 
            FROM user_preferences_v2 WHERE user_id = 1
        """)
        v2_result = cursor.fetchone()
        
        if v2_result:
            print("✅ V2 Preferences found:")
            print(f"  - Currency: {v2_result[0]}")
            print(f"  - Timezone: {v2_result[1]}")
            print(f"  - Stop Loss: {v2_result[2]}%")
            print(f"  - Migrated from V1: {bool(v2_result[3])}")
            print(f"  - Migration Date: {v2_result[4]}")
        else:
            print("❌ No V2 preferences found")
            return False
            
        # בדוק פרופיל
        cursor.execute("""
            SELECT profile_name, is_default, description 
            FROM preference_profiles WHERE user_id = 1
        """)
        profile_result = cursor.fetchone()
        
        if profile_result:
            print("✅ Profile found:")
            print(f"  - Name: {profile_result[0]}")
            print(f"  - Is Default: {bool(profile_result[1])}")
            print(f"  - Description: {profile_result[2]}")
        else:
            print("❌ No profile found")
            return False
        
        # בדוק היסטוריה
        cursor.execute("""
            SELECT change_type, change_reason, created_at 
            FROM preference_history WHERE user_id = 1 AND change_type = 'migrate_from_legacy'
        """)
        history_result = cursor.fetchone()
        
        if history_result:
            print("✅ History entry found:")
            print(f"  - Type: {history_result[0]}")
            print(f"  - Reason: {history_result[1]}")
            print(f"  - Created: {history_result[2]}")
        else:
            print("❌ No history entry found")
            return False
        
        print("-" * 30)
        print("🎉 Migration verification successful!")
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False
    finally:
        conn.close()


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--verify':
        success = verify_migration()
    else:
        success = migrate_user_preferences()
        if success:
            print("💡 Run with --verify to check results")
    
    sys.exit(0 if success else 1)