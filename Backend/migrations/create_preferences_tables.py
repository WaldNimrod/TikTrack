#!/usr/bin/env python3
"""
Preferences System - Database Migration
=====================================

יצירת טבלאות חדשות למערכת העדפות

Author: TikTrack Development Team
Date: January 2025
"""

import sqlite3
import os
import sys
from datetime import datetime

# הוסף את הנתיב למודולים
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_preferences_tables():
    """יצירת טבלאות חדשות למערכת העדפות"""
    
    # נתיב לבסיס הנתונים
    db_path = 'db/simpleTrade_new.db'
    
    if not os.path.exists(db_path):
        print(f"❌ בסיס הנתונים לא נמצא: {db_path}")
        return False
    
    try:
        # חיבור לבסיס הנתונים
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🚀 מתחיל יצירת טבלאות מערכת העדפות...")
        
        # 1. יצירת טבלת preference_groups
        print("📋 יוצר טבלת preference_groups...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS preference_groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 2. יצירת טבלת preference_types
        print("📋 יוצר טבלת preference_types...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS preference_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id INTEGER NOT NULL,
                data_type VARCHAR(20) NOT NULL,
                preference_name VARCHAR(100) NOT NULL,
                description TEXT,
                constraints TEXT,  -- JSON עם הגבלות ואימותים
                default_value TEXT,
                is_required BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES preference_groups(id),
                UNIQUE(group_id, preference_name)
            )
        ''')
        
        # 3. עדכון טבלת preference_profiles (אם קיימת)
        print("📋 בודק טבלת preference_profiles...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS preference_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                profile_name VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                is_default BOOLEAN DEFAULT FALSE,
                description TEXT,
                created_by INTEGER,
                last_used_at DATETIME,
                usage_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, profile_name)
            )
        ''')
        
        # 4. יצירת טבלת user_preferences_v3 החדשה (שונה מהקיימת)
        print("📋 יוצר טבלת user_preferences_v3 החדשה...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_preferences_v3 (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                profile_id INTEGER NOT NULL,
                preference_id INTEGER NOT NULL,
                saved_value TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (profile_id) REFERENCES preference_profiles(id),
                FOREIGN KEY (preference_id) REFERENCES preference_types(id),
                UNIQUE(user_id, profile_id, preference_id)
            )
        ''')
        
        # 5. יצירת אינדקסים קריטיים
        print("🔍 יוצר אינדקסים קריטיים...")
        
        # אינדקס לביצועים מקסימליים
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_user_preferences_v3_lookup 
            ON user_preferences_v3(user_id, profile_id, preference_id)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_preference_types_active 
            ON preference_types(is_active, group_id)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_preference_profiles_user_active 
            ON preference_profiles(user_id, is_active)
        ''')
        
        # אינדקס מורכב לשאילתות מהירות (ללא INCLUDE - SQLite לא תומך)
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_user_preferences_v3_complex 
            ON user_preferences_v3(user_id, profile_id, preference_id, saved_value)
        ''')
        
        # 6. מילוי נתונים בסיסיים
        print("📊 ממלא נתונים בסיסיים...")
        
        # קבוצות העדפות
        groups_data = [
            ('general', 'הגדרות כלליות'),
            ('colors', 'צבעי ממשק'),
            ('filters', 'פילטרים ברירת מחדל'),
            ('ui', 'הגדרות ממשק משתמש'),
            ('external_data', 'נתונים חיצוניים'),
            ('notifications', 'התראות')
        ]
        
        for group_name, description in groups_data:
            cursor.execute('''
                INSERT OR IGNORE INTO preference_groups (group_name, description)
                VALUES (?, ?)
            ''', (group_name, description))
        
        # סוגי העדפות בסיסיים
        preferences_data = [
            # קבוצת general
            (1, 'string', 'timezone', 'אזור זמן של המשתמש', '{"options": ["Asia/Jerusalem", "America/New_York"]}', 'Asia/Jerusalem', True),
            (1, 'number', 'defaultStopLoss', 'אחוז stop loss ברירת מחדל', '{"min": 0, "max": 100}', '5.0', True),
            (1, 'number', 'defaultTargetPrice', 'אחוז target price ברירת מחדל', '{"min": 0, "max": 1000}', '10.0', True),
            (1, 'number', 'defaultCommission', 'עמלה ברירת מחדל', '{"min": 0, "max": 100}', '1.0', True),
            (1, 'string', 'primaryCurrency', 'מטבע ראשי', '{"options": ["USD", "ILS", "EUR"]}', 'USD', True),
            (1, 'string', 'secondaryCurrency', 'מטבע משני', '{"options": ["USD", "ILS", "EUR"]}', 'ILS', True),
            
            # קבוצת colors
            (2, 'color', 'primaryColor', 'צבע ראשי של הממשק', '{"format": "hex"}', '#007bff', False),
            (2, 'color', 'secondaryColor', 'צבע משני של הממשק', '{"format": "hex"}', '#6c757d', False),
            (2, 'color', 'successColor', 'צבע הצלחה', '{"format": "hex"}', '#28a745', False),
            (2, 'color', 'warningColor', 'צבע אזהרה', '{"format": "hex"}', '#ffc107', False),
            (2, 'color', 'dangerColor', 'צבע סכנה', '{"format": "hex"}', '#dc3545', False),
            (2, 'color', 'entityTickerColor', 'צבע טיקר', '{"format": "hex"}', '#dc3545', False),
            (2, 'color', 'entityTradeColor', 'צבע עסקה', '{"format": "hex"}', '#007bff', False),
            (2, 'color', 'entityAccountColor', 'צבע חשבון מסחר', '{"format": "hex"}', '#28a745', False),
            
            # קבוצת filters
            (3, 'string', 'defaultStatusFilter', 'פילטר סטטוס ברירת מחדל', '{"options": ["open", "closed", "cancelled", "all"]}', 'open', False),
            (3, 'string', 'defaultTypeFilter', 'פילטר סוג ברירת מחדל', '{"options": ["swing", "investment", "passive", "all"]}', 'swing', False),
            (3, 'string', 'defaultAccountFilter', 'פילטר חשבון מסחר ברירת מחדל', '{"options": ["all"]}', 'all', False),
            (3, 'string', 'defaultDateRangeFilter', 'פילטר טווח תאריכים ברירת מחדל', '{"options": ["today", "this_week", "this_month", "all"]}', 'this_week', False),
            
            # קבוצת ui
            (4, 'string', 'theme', 'ערכת נושא', '{"options": ["light", "dark", "auto"]}', 'light', False),
            (4, 'boolean', 'compactMode', 'מצב קומפקטי', '{}', 'false', False),
            (4, 'boolean', 'showAnimations', 'הצג אנימציות', '{}', 'true', False),
            (4, 'string', 'sidebarPosition', 'מיקום סרגל צד', '{"options": ["left", "right"]}', 'right', False),
            (4, 'number', 'tablePageSize', 'גודל עמוד בטבלה', '{"min": 10, "max": 100}', '25', False),
            
            # קבוצת external_data
            (5, 'string', 'primaryDataProvider', 'ספק נתונים ראשי', '{"options": ["yahoo", "google", "alpha_vantage"]}', 'yahoo', False),
            (5, 'number', 'cacheTTL', 'זמן חיים של מטמון (דקות)', '{"min": 1, "max": 1440}', '5', False),
            
            # קבוצת notifications
            (6, 'boolean', 'enableNotifications', 'הפעל התראות', '{}', 'true', False),
            (6, 'boolean', 'notificationSound', 'צליל התראות', '{}', 'true', False),
            (6, 'boolean', 'notificationPopup', 'חלון קופץ התראות', '{}', 'true', False),
            (6, 'boolean', 'notifyOnTradeExecuted', 'התראה על ביצוע עסקה', '{}', 'true', False),
            (6, 'boolean', 'notifyOnStopLoss', 'התראה על stop loss', '{}', 'true', False),
        ]
        
        for group_id, data_type, preference_name, description, constraints, default_value, is_required in preferences_data:
            cursor.execute('''
                INSERT OR IGNORE INTO preference_types 
                (group_id, data_type, preference_name, description, constraints, default_value, is_required)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (group_id, data_type, preference_name, description, constraints, default_value, is_required))
        
        # שמירת שינויים
        conn.commit()
        
        print("✅ טבלאות מערכת העדפות נוצרו בהצלחה!")
        print("📊 נתונים בסיסיים הוכנסו")
        print("🔍 אינדקסים נוצרו")
        
        # בדיקת הטבלאות שנוצרו
        print("\n🔍 בדיקת הטבלאות שנוצרו:")
        
        tables = ['preference_groups', 'preference_types', 'preference_profiles', 'user_preferences_v3']
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  - {table}: {count} רשומות")
        
        # בדיקת אינדקסים
        print("\n🔍 בדיקת אינדקסים:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%'")
        indexes = cursor.fetchall()
        for index in indexes:
            print(f"  - {index[0]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ שגיאה ביצירת הטבלאות: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    print("🚀 מתחיל יצירת טבלאות מערכת העדפות...")
    success = create_preferences_tables()
    
    if success:
        print("\n🎉 מערכת העדפות הוכנה בהצלחה!")
        print("📋 הטבלאות הבאות נוצרו:")
        print("  - preference_groups")
        print("  - preference_types") 
        print("  - preference_profiles")
        print("  - user_preferences_v3")
        print("\n🔍 האינדקסים הבאים נוצרו:")
        print("  - idx_user_preferences_v3_lookup")
        print("  - idx_preference_types_active")
        print("  - idx_preference_profiles_user_active")
        print("  - idx_user_preferences_v3_complex")
    else:
        print("\n❌ שגיאה ביצירת מערכת העדפות")
        sys.exit(1)
