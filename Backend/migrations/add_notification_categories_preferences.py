#!/usr/bin/env python3
"""
Migration: Add Notification Categories Preferences
=================================================

This migration adds 10 new preferences for notification and console log categories:
- 5 preferences for notification categories (development, system, business, performance, ui)
- 5 preferences for console log categories (development, system, business, performance, ui)

All preferences default to 'true' (enabled).

Author: TikTrack Development Team
Date: 2025-01-20
Version: 1.0.0
"""

import sqlite3
import os
import sys
from datetime import datetime

# Add the parent directory to the path to import from Backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_migration():
    """Run the migration to add notification categories preferences"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db', 'simpleTrade_new.db')
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at: {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Starting migration: Add Notification Categories Preferences")
        
        # Check if preference_types table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='preference_types'")
        if not cursor.fetchone():
            print("❌ preference_types table not found. Please run create_preferences_tables.py first.")
            return False
        
        # Check if preference_groups table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='preference_groups'")
        if not cursor.fetchone():
            print("❌ preference_groups table not found. Please run create_preferences_tables.py first.")
            return False
        
        # Get the notification_settings group ID
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'notification_settings'")
        group_result = cursor.fetchone()
        if not group_result:
            print("❌ notification_settings group not found")
            return False
        group_id = group_result[0]
        
        # Define the new preferences
        new_preferences = [
            # Notification categories
            {
                'preference_name': 'notifications_development_enabled',
                'data_type': 'boolean',
                'default_value': 'true',
                'description': 'Enable development notifications',
                'group_id': group_id
            },
            {
                'preference_name': 'notifications_system_enabled',
                'data_type': 'boolean',
                'default_value': 'true',
                'description': 'Enable system notifications',
                'group_id': group_id
            },
            {
                'preference_name': 'notifications_business_enabled',
                'data_type': 'boolean',
                'default_value': 'true',
                'description': 'Enable business notifications',
                'group_id': group_id
            },
            {
                'preference_name': 'notifications_performance_enabled',
                'data_type': 'boolean',
                'default_value': 'true',
                'description': 'Enable performance notifications',
                'group_id': group_id
            },
            {
                'preference_name': 'notifications_ui_enabled',
                'data_type': 'boolean',
                'default_value': 'true',
                'description': 'Enable UI notifications',
                'group_id': group_id
            },
            # Console log categories
            {
                'preference_name': 'console_logs_development_enabled',
                'data_type': 'boolean',
                'default_value': 'true',
                'description': 'Enable development console logs',
                'group_id': group_id
            },
            {
                'preference_name': 'console_logs_system_enabled',
                'data_type': 'boolean',
                'default_value': 'true',
                'description': 'Enable system console logs',
                'group_id': group_id
            },
            {
                'preference_name': 'console_logs_business_enabled',
                'data_type': 'boolean',
                'default_value': 'true',
                'description': 'Enable business console logs',
                'group_id': group_id
            },
            {
                'preference_name': 'console_logs_performance_enabled',
                'data_type': 'boolean',
                'default_value': 'true',
                'description': 'Enable performance console logs',
                'group_id': group_id
            },
            {
                'preference_name': 'console_logs_ui_enabled',
                'data_type': 'boolean',
                'default_value': 'true',
                'description': 'Enable UI console logs',
                'group_id': group_id
            }
        ]
        
        # Insert new preferences
        inserted_count = 0
        for pref in new_preferences:
            # Check if preference already exists
            cursor.execute("SELECT id FROM preference_types WHERE preference_name = ?", (pref['preference_name'],))
            if cursor.fetchone():
                print(f"⚠️  Preference {pref['preference_name']} already exists, skipping...")
                continue
            
            # Insert new preference
            cursor.execute("""
                INSERT INTO preference_types (
                    group_id,
                    data_type,
                    preference_name,
                    description,
                    default_value,
                    is_required,
                    is_active,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                pref['group_id'],
                pref['data_type'],
                pref['preference_name'],
                pref['description'],
                pref['default_value'],
                False,  # is_required
                True,   # is_active
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
            inserted_count += 1
            print(f"✅ Added preference: {pref['preference_name']}")
        
        # Commit changes
        conn.commit()
        
        print(f"🎉 Migration completed successfully!")
        print(f"📊 Added {inserted_count} new preferences")
        print(f"📋 Total notification categories: 5")
        print(f"📋 Total console log categories: 5")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
