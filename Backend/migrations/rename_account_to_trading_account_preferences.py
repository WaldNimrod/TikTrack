#!/usr/bin/env python3
"""
Rename Account to Trading Account Preferences
=============================================

This migration renames all account-related preference names from entityAccountColor*
to entityTradingAccountColor* to ensure consistency across the system.

Changes:
- entityAccountColor → entityTradingAccountColor
- entityAccountColorLight → entityTradingAccountColorLight
- entityAccountColorDark → entityTradingAccountColorDark

Author: TikTrack Development Team
Date: November 2025
"""

import sqlite3
import os
from datetime import datetime

def rename_account_to_trading_account_preferences():
    """Rename account color preferences to trading_account"""
    
    # Database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔄 Renaming account color preferences to trading_account...")
        
        # Mapping of old names to new names
        renames = [
            ('entityAccountColor', 'entityTradingAccountColor'),
            ('entityAccountColorLight', 'entityTradingAccountColorLight'),
            ('entityAccountColorDark', 'entityTradingAccountColorDark')
        ]
        
        renamed_count = 0
        
        for old_name, new_name in renames:
            # Check if old preference exists
            cursor.execute("SELECT id FROM preference_types WHERE preference_name = ?", (old_name,))
            old_pref = cursor.fetchone()
            
            if not old_pref:
                print(f"⚠️  {old_name} not found, skipping")
                continue
            
            # Check if new preference already exists
            cursor.execute("SELECT id FROM preference_types WHERE preference_name = ?", (new_name,))
            if cursor.fetchone():
                print(f"⚠️  {new_name} already exists, deleting old {old_name}...")
                # Delete old preference if new one exists
                cursor.execute("DELETE FROM preference_types WHERE preference_name = ?", (old_name,))
                # Also delete from user_preferences if exists
                cursor.execute("DELETE FROM user_preferences_v3 WHERE preference_name = ?", (old_name,))
                renamed_count += 1
                continue
            
            # Update preference_types table
            cursor.execute("""
                UPDATE preference_types 
                SET preference_name = ?, updated_at = ?
                WHERE preference_name = ?
            """, (new_name, datetime.now(), old_name))
            
            # Update user_preferences_v3 table (if exists)
            cursor.execute("""
                UPDATE user_preferences_v3 
                SET preference_name = ?, updated_at = ?
                WHERE preference_name = ?
            """, (new_name, datetime.now(), old_name))
            
            # Update descriptions to reflect "trading account" instead of "account"
            cursor.execute("""
                UPDATE preference_types 
                SET description = REPLACE(description, 'account entities', 'trading account entities')
                WHERE preference_name = ?
            """, (new_name,))
            cursor.execute("""
                UPDATE preference_types 
                SET description = REPLACE(description, 'account', 'trading account')
                WHERE preference_name = ? AND description LIKE '%account%'
            """, (new_name,))
            
            renamed_count += 1
            print(f"✅ Renamed {old_name} → {new_name}")
        
        conn.commit()
        print(f"🎨 Renamed {renamed_count} preference(s)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error renaming preferences: {e}")
        import traceback
        traceback.print_exc()
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    rename_account_to_trading_account_preferences()



