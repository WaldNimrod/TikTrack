#!/usr/bin/env python3
"""
Preferences Groups Consolidation Migration
========================================

איחוד קבוצות העדפות מ-16 קבוצות ל-7 קבוצות מסודרות לפי הדוח
יצירת 7 קבוצות חדשות ואיחוד כל ההעדפות לתוכן

Author: TikTrack Development Team
Date: January 30, 2025
"""

import sqlite3
import os
import sys
from datetime import datetime

# הוסף את הנתיב למודולים
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def consolidate_preference_groups():
    """איחוד קבוצות העדפות"""
    
    # נתיב לבסיס הנתונים
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'tiktrack.db')
    
    if not os.path.exists(db_path):
        print(f"❌ בסיס הנתונים לא נמצא: {db_path}")
        return False
    
    try:
        # חיבור לבסיס הנתונים
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🚀 מתחיל איחוד קבוצות העדפות...")
        print(f"📁 Database: {db_path}")
        print("=" * 60)
        
        # ============================================================
        # שלב 1: בדיקת מצב נוכחי
        # ============================================================
        print("\n📊 שלב 1: בדיקת מצב נוכחי...")
        
        cursor.execute('''
            SELECT pg.id, pg.group_name, COUNT(pt.id) as pref_count
            FROM preference_groups pg
            LEFT JOIN preference_types pt ON pg.id = pt.group_id
            GROUP BY pg.id, pg.group_name
            ORDER BY pref_count DESC
        ''')
        
        current_groups = cursor.fetchall()
        print(f"\nקבוצות נוכחיות: {len(current_groups)}")
        for group_id, group_name, count in current_groups:
            print(f"  - {group_name}: {count} העדפות")
        
        # ============================================================
        # שלב 2: יצירת קבוצות חדשות מסודרות
        # ============================================================
        print("\n📋 שלב 2: יצירת קבוצות חדשות...")
        
        # 7 קבוצות חדשות לפי הדוח
        new_groups = [
            ('basic_settings', 'הגדרות בסיסיות - מטבעות, זמן, שפה, חשבון ברירת מחדל'),
            ('trading_settings', 'הגדרות מסחר - Stop Loss, Target, Commission, סיכונים'),
            ('filter_settings', 'פילטרים ברירת מחדל - סטטוס, סוג, תאריכים, חיפוש'),
            ('colors_unified', 'צבעים - כל הצבעים במקום אחד (55 העדפות)'),
            ('notification_settings', 'התראות ולוגים (23 העדפות)'),
            ('chart_settings_unified', 'הגדרות גרפים - גרפים + צבעים + ייצוא (16 העדפות)'),
            ('ui_settings', 'הגדרות ממשק - ערכת נושא, טבלאות (11 העדפות)')
        ]
        
        group_id_map = {}
        for group_name, description in new_groups:
            # בדיקה אם הקבוצה כבר קיימת
            cursor.execute('SELECT id FROM preference_groups WHERE group_name = ?', (group_name,))
            existing = cursor.fetchone()
            
            if existing:
                group_id = existing[0]
                print(f"  ✓ {group_name} כבר קיימת (ID: {group_id})")
            else:
                # יצירת קבוצה חדשה
                cursor.execute('''
                    INSERT INTO preference_groups (group_name, description)
                    VALUES (?, ?)
                ''', (group_name, description))
                group_id = cursor.lastrowid
                print(f"  ✨ יצירה: {group_name} (ID: {group_id})")
            
            group_id_map[group_name] = group_id
        
        conn.commit()
        
        # ============================================================
        # שלב 3: העברת העדפות לקבוצות חדשות
        # ============================================================
        print("\n🔄 שלב 3: העברת העדפות לקבוצות חדשות...")
        
        # מיפוי קבוצות ישנות → חדשות לפי הדוח
        migration_map = {
            # 1. basic_settings (6 העדפות): general + basic_settings + default_trading_account + pagination_size_default
            'general': {
                'timezone': 'basic_settings',
                'notificationMode': 'basic_settings'  # אם זה עדיין קיים
            },
            'basic_settings': {
                'primaryCurrency': 'basic_settings',
                'secondaryCurrency': 'basic_settings',
                'language': 'basic_settings',
                'default_trading_account': 'basic_settings'  # העברה מ-filter_settings
            },
            'filter_settings': {
                'defaultStatusFilter': 'filter_settings',
                'defaultTypeFilter': 'filter_settings',
                'defaultDateRangeFilter': 'filter_settings',
                'defaultSearchFilter': 'filter_settings',
                'default_trading_account': 'basic_settings'  # העברה ל-basic_settings
            },
            'ui_settings': {
                'pagination_size_default': 'basic_settings',  # העברה ל-basic_settings
                # כל שאר ההעדפות נשארות ב-ui_settings (לא צריך לציין אותן במפורש)
            },
            
            # 2. trading_settings (6 העדפות): trading_settings - נשאר במקום
            # לא צריך מיפוי - כל ההעדפות נשארות ב-trading_settings
            
            # 3. filter_settings (4 העדפות): רק הגדרות פילטרים (ללא צבעים, ללא default_trading_account)
            # כבר מעודכן למעלה - default_trading_account עובר ל-basic_settings
            
            # 4. colors_unified (55 העדפות): כל הצבעים - colors + ui_colors + entity_colors + value_colors + filters (צבעי פילטרים)
            'colors': 'colors_unified',  # כל צבעי הסטטוס
            'ui_colors': 'colors_unified',  # כל צבעי UI
            'entity_colors': 'colors_unified',  # כל צבעי ישויות
            'value_colors': 'colors_unified',  # כל צבעי ערכים
            'filters': 'colors_unified',  # כל צבעי פילטרים (entityAlertColor, entityNoteColor וכו')
            
            # 5. notification_settings (23 העדפות): notifications + notification_settings
            'notifications': 'notification_settings',
            'notification_settings': 'notification_settings',
            
            # 6. chart_settings_unified (16 העדפות): chart_colors + chart_settings + chart_export
            'chart_colors': 'chart_settings_unified',
            'chart_settings': 'chart_settings_unified',
            'chart_export': 'chart_settings_unified',
            
            # 7. ui_settings (11 העדפות): ui_settings (ללא pagination_size_default)
            # כבר מעודכן למעלה - pagination_size_default עובר ל-basic_settings
        }
        
        # קבלת כל ההעדפות
        cursor.execute('''
            SELECT pt.id, pt.preference_name, pg.group_name
            FROM preference_types pt
            JOIN preference_groups pg ON pt.group_id = pg.id
            WHERE pt.is_active = 1
        ''')
        
        all_preferences = cursor.fetchall()
        print(f"\nסה\"כ העדפות לעדכון: {len(all_preferences)}")
        
        updated_count = 0
        skipped_count = 0
        
        for pref_id, pref_name, old_group_name in all_preferences:
            # מציאת קבוצה חדשה
            new_group_name = None
            
            if old_group_name in migration_map:
                mapping = migration_map[old_group_name]
                
                if isinstance(mapping, dict):
                    # מיפוי ספציפי per preference
                    new_group_name = mapping.get(pref_name)
                    # אם לא נמצא מיפוי ספציפי, נשאיר במקום (אלא אם כן יש מיפוי כללי)
                    if not new_group_name:
                        # בדיקה אם יש מיפוי כללי לקבוצה (כמו 'ui_settings' → נשאר ב-ui_settings)
                        # אבל אם יש מיפוי ספציפי שלא כולל את ההעדפה, נשאיר במקום
                        pass
                elif isinstance(mapping, str):
                    # כל הקבוצה מעבר לקבוצה אחת
                    new_group_name = mapping
            
            # אם לא מצאנו מיפוי, נשאיר במקום
            if not new_group_name:
                # אם הקבוצה היא אחת מהקבוצות החדשות, נשאיר במקום (לא צריך לעדכן)
                if old_group_name in [g[0] for g in new_groups]:
                    skipped_count += 1
                    continue
                # אם יש dict mapping אבל ההעדפה לא נמצאת בו, נשאיר במקום
                if old_group_name in migration_map and isinstance(migration_map[old_group_name], dict):
                    skipped_count += 1
                    continue
                # אחרת, נשאיר במקום (לא צריך לעדכן)
                skipped_count += 1
                continue
            
            # עדכון group_id
            new_group_id = group_id_map.get(new_group_name)
            if new_group_id:
                cursor.execute('''
                    UPDATE preference_types
                    SET group_id = ?
                    WHERE id = ?
                ''', (new_group_id, pref_id))
                updated_count += 1
                print(f"  ✓ {pref_name}: {old_group_name} → {new_group_name}")
            else:
                print(f"  ⚠️  לא נמצאה קבוצה חדשה: {new_group_name}")
        
        conn.commit()
        print(f"\n✅ עודכנו {updated_count} העדפות")
        print(f"⏭️  דולגו {skipped_count} העדפות (אין מיפוי)")
        
        # ============================================================
        # שלב 4: מחיקת קבוצות ריקות
        # ============================================================
        print("\n🗑️  שלב 4: מחיקת קבוצות ריקות...")
        
        cursor.execute('''
            SELECT pg.id, pg.group_name, COUNT(pt.id) as pref_count
            FROM preference_groups pg
            LEFT JOIN preference_types pt ON pg.id = pt.group_id
            GROUP BY pg.id, pg.group_name
            HAVING pref_count = 0
        ''')
        
        empty_groups = cursor.fetchall()
        
        for group_id, group_name, count in empty_groups:
            if group_name not in [g[0] for g in new_groups]:
                cursor.execute('DELETE FROM preference_groups WHERE id = ?', (group_id,))
                print(f"  🗑️  נמחקה: {group_name} (ID: {group_id})")
        
        conn.commit()
        
        # ============================================================
        # שלב 5: דוח סופי
        # ============================================================
        print("\n📊 שלב 5: דוח סופי...")
        print("=" * 60)
        
        cursor.execute('''
            SELECT pg.group_name, COUNT(pt.id) as pref_count
            FROM preference_groups pg
            LEFT JOIN preference_types pt ON pg.id = pt.group_id
            GROUP BY pg.group_name
            ORDER BY pref_count DESC
        ''')
        
        final_groups = cursor.fetchall()
        print(f"\nקבוצות סופיות: {len(final_groups)}")
        total_prefs = 0
        for group_name, count in final_groups:
            print(f"  - {group_name}: {count} העדפות")
            total_prefs += count
        
        print(f"\n✅ סה\"כ העדפות: {total_prefs}")
        print("=" * 60)
        
        # בדיקת תקינות
        print("\n🔍 בדיקת תקינות...")
        
        # בדיקה 1: אין העדפות כפולות
        cursor.execute('''
            SELECT preference_name, COUNT(*) as count
            FROM preference_types
            WHERE is_active = 1
            GROUP BY preference_name
            HAVING count > 1
        ''')
        duplicates = cursor.fetchall()
        
        if duplicates:
            print(f"⚠️  נמצאו העדפות כפולות:")
            for pref_name, count in duplicates:
                print(f"  - {pref_name}: {count} פעמים")
        else:
            print("✓ אין העדפות כפולות")
        
        # בדיקה 2: כל העדפות בקבוצה תקינה
        cursor.execute('''
            SELECT COUNT(*) 
            FROM preference_types pt
            LEFT JOIN preference_groups pg ON pt.group_id = pg.id
            WHERE pt.is_active = 1 AND pg.id IS NULL
        ''')
        orphaned = cursor.fetchone()[0]
        
        if orphaned > 0:
            print(f"⚠️  נמצאו {orphaned} העדפות ללא קבוצה")
        else:
            print("✓ כל ההעדפות בקבוצה תקינה")
        
        conn.close()
        print("\n🎉 המיגרציה הושלמה בהצלחה!")
        return True
        
    except Exception as e:
        print(f"\n❌ שגיאה במיגרציה: {e}")
        import traceback
        traceback.print_exc()
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False


if __name__ == "__main__":
    print("🚀 מתחיל איחוד קבוצות העדפות...")
    success = consolidate_preference_groups()
    
    if success:
        print("\n✅ המיגרציה הושלמה בהצלחה!")
        sys.exit(0)
    else:
        print("\n❌ המיגרציה נכשלה!")
        sys.exit(1)

