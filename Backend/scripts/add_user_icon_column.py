#!/usr/bin/env python3
"""
Add icon column to users table
Date: December 28, 2025
Description: Add icon column to users table to fix login issue
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the path to import modules
sys.path.append(str(Path(__file__).parent.parent))

def main():
    """Add icon column to users table"""
    try:
        from config.database import engine
        from sqlalchemy import text

        print("🔧 Adding icon column to users table...")

        with engine.connect() as conn:
            # Check if icon column exists
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = 'icon'
            """))

            if not result.fetchone():
                print("➕ Adding icon column...")
                conn.execute(text("ALTER TABLE users ADD COLUMN icon VARCHAR(100)"))
                conn.commit()
                print("✅ Icon column added successfully!")
            else:
                print("✅ Icon column already exists")

            # Verify the column exists
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'users' AND column_name = 'icon'
            """))
            column_info = result.fetchone()
            if column_info:
                print(f"📊 Column info: {column_info}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
