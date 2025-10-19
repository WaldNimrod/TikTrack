#!/usr/bin/env python3
"""
Fix User Table Migration - Align with New Preferences System
Date: January 5, 2025
Description: Fix user table to work with new preferences system
"""

import sqlite3
import os
import sys
from datetime import datetime

# Add the parent directory to the path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_db_path():
    """Get database path"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, "..", "db", "simpleTrade_new.db")

def backup_database():
    """Create backup of database"""
    db_path = get_db_path()
    backup_path = f"{db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    print(f"📋 Creating backup: {backup_path}")
    
    # Copy database file
    import shutil
    shutil.copy2(db_path, backup_path)
    print(f"✅ Backup created: {backup_path}")
    return backup_path

def fix_user_table():
    """Fix user table to work with new preferences system"""
    db_path = get_db_path()
    print(f"🔧 Fixing user table in: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check current user table structure
        cursor.execute("PRAGMA table_info(users)")
        current_columns = cursor.fetchall()
        print(f"📊 Current user table columns: {[col[1] for col in current_columns]}")
        
        # Check if users table exists and has data
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"👥 Current users count: {user_count}")
        
        if user_count > 0:
            # Get current user data
            cursor.execute("SELECT * FROM users LIMIT 1")
            current_user = cursor.fetchone()
            print(f"👤 Current user data: {current_user}")
        
        # Drop and recreate users table with proper structure
        print("🗑️ Dropping existing users table...")
        cursor.execute("DROP TABLE IF EXISTS users")
        
        # Create new users table with proper structure
        print("🏗️ Creating new users table...")
        cursor.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE,
                full_name VARCHAR(100),
                is_active BOOLEAN DEFAULT 1,
                is_default BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insert default user
        print("👤 Inserting default user...")
        cursor.execute("""
            INSERT INTO users (id, username, email, full_name, is_active, is_default)
            VALUES (1, 'nimrod', 'nimrod@tiktrack.com', 'Nimrod Developer', 1, 1)
        """)
        
        # Verify the user was created
        cursor.execute("SELECT * FROM users WHERE id = 1")
        default_user = cursor.fetchone()
        print(f"✅ Default user created: {default_user}")
        
        # Check preference_profiles table and update user_id references
        print("🔗 Checking preference_profiles table...")
        cursor.execute("SELECT COUNT(*) FROM preference_profiles")
        profile_count = cursor.fetchone()[0]
        print(f"📋 Preference profiles count: {profile_count}")
        
        if profile_count > 0:
            # Update any existing profiles to use user_id = 1
            cursor.execute("UPDATE preference_profiles SET user_id = 1 WHERE user_id IS NULL OR user_id = 'nimrod'")
            updated_profiles = cursor.rowcount
            print(f"🔄 Updated {updated_profiles} preference profiles to use user_id = 1")
        
        # Check user_preferences_v3 table
        print("🔗 Checking user_preferences_v3 table...")
        cursor.execute("SELECT COUNT(*) FROM user_preferences_v3")
        pref_count = cursor.fetchone()[0]
        print(f"⚙️ User preferences count: {pref_count}")
        
        if pref_count > 0:
            # Update any existing preferences to use user_id = 1
            cursor.execute("UPDATE user_preferences_v3 SET user_id = 1 WHERE user_id IS NULL OR user_id = 'nimrod'")
            updated_prefs = cursor.rowcount
            print(f"🔄 Updated {updated_prefs} user preferences to use user_id = 1")
        
        # Commit changes
        conn.commit()
        print("✅ User table migration completed successfully!")
        
        # Final verification
        cursor.execute("SELECT * FROM users")
        final_users = cursor.fetchall()
        print(f"🎯 Final users: {final_users}")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def main():
    """Main migration function"""
    print("🚀 Starting User Table Migration...")
    print("=" * 50)
    
    try:
        # Create backup
        backup_path = backup_database()
        
        # Fix user table
        fix_user_table()
        
        print("=" * 50)
        print("✅ User table migration completed successfully!")
        print(f"📋 Backup available at: {backup_path}")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
