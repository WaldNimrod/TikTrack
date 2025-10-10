#!/usr/bin/env python3
"""
בדיקה מהירה - האם default_trading_account קיימת ב-preference_types
"""
import sqlite3

db_path = 'Backend/db/simpleTrade_new.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=== בדיקת preference_types ===\n")

# בדיקה 1: האם ההעדפה קיימת?
cursor.execute("""
    SELECT id, preference_name, data_type, default_value, group_id, description
    FROM preference_types
    WHERE preference_name LIKE '%account%'
""")

results = cursor.fetchall()
print(f"1. העדפות שקשורות ל-account ({len(results)}):")
for row in results:
    print(f"   - ID: {row[0]}, Name: {row[1]}, Type: {row[2]}, Default: {row[3]}")

# בדיקה 2: כל הקבוצות
cursor.execute("SELECT id, group_name FROM preference_groups")
groups = cursor.fetchall()
print(f"\n2. קבוצות העדפות ({len(groups)}):")
for group in groups:
    print(f"   - ID: {group[0]}, Name: {group[1]}")

# בדיקה 3: האם יש ערך שמור למשתמש 1?
cursor.execute("""
    SELECT up.id, pt.preference_name, up.saved_value, up.profile_id
    FROM user_preferences up
    JOIN preference_types pt ON up.preference_id = pt.id
    WHERE up.user_id = 1 AND pt.preference_name LIKE '%account%'
""")

user_prefs = cursor.fetchall()
print(f"\n3. העדפות חשבון שמורות למשתמש 1 ({len(user_prefs)}):")
for pref in user_prefs:
    print(f"   - {pref[1]}: {pref[2]} (profile: {pref[3]})")

conn.close()
print("\n✅ בדיקה הושלמה")



