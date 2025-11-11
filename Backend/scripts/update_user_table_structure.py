#!/usr/bin/env python3
"""
Update User Table Structure - Add first_name and last_name columns
Date: January 5, 2025
Description: Update user table to have first_name and last_name columns
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
    return os.path.join(current_dir, "..", "db", "tiktrack.db")

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

def update_user_table():
    """Update user table structure"""
    db_path = get_db_path()
    print(f"🔧 Updating user table structure in: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check current user table structure
        cursor.execute("PRAGMA table_info(users)")
        current_columns = cursor.fetchall()
        print(f"📊 Current user table columns: {[col[1] for col in current_columns]}")
        
        # Check if first_name and last_name columns exist
        column_names = [col[1] for col in current_columns]
        
        if 'first_name' not in column_names:
            print("➕ Adding first_name column...")
            cursor.execute("ALTER TABLE users ADD COLUMN first_name VARCHAR(50)")
        
        if 'last_name' not in column_names:
            print("➕ Adding last_name column...")
            cursor.execute("ALTER TABLE users ADD COLUMN last_name VARCHAR(50)")
        
        # Update existing user with proper names
        print("👤 Updating default user with proper names...")
        cursor.execute("""
            UPDATE users 
            SET first_name = 'Nimrod', last_name = 'Developer'
            WHERE id = 1
        """)
        
        # Verify the update
        cursor.execute("SELECT * FROM users WHERE id = 1")
        updated_user = cursor.fetchone()
        print(f"✅ Updated user: {updated_user}")
        
        # Commit changes
        conn.commit()
        print("✅ User table structure updated successfully!")
        
        # Final verification
        cursor.execute("PRAGMA table_info(users)")
        final_columns = cursor.fetchall()
        print(f"🎯 Final user table columns: {[col[1] for col in final_columns]}")
        
    except Exception as e:
        print(f"❌ Error during update: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

def main():
    """Main update function"""
    print("🚀 Starting User Table Structure Update...")
    print("=" * 50)
    
    try:
        # Create backup
        backup_path = backup_database()
        
        # Update user table
        update_user_table()
        
        print("=" * 50)
        print("✅ User table structure update completed successfully!")
        print(f"📋 Backup available at: {backup_path}")
        
    except Exception as e:
        print(f"❌ Update failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
