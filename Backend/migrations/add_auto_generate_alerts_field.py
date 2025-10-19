#!/usr/bin/env python3
"""
Migration: Add auto_generate_alerts field to condition tables
Date: October 19, 2025
Description: Add auto_generate_alerts field to plan_conditions and trade_conditions tables
"""

import sqlite3
import os
import sys
from datetime import datetime

# Add the parent directory to the path to import from Backend
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
sys.path.append(backend_dir)

def run_migration():
    """Run the migration to add auto_generate_alerts field"""
    
    # Database path
    db_path = os.path.join(backend_dir, "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found at {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Starting migration: Add auto_generate_alerts field...")
        
        # Check if field already exists in plan_conditions
        cursor.execute("PRAGMA table_info(plan_conditions)")
        plan_columns = [column[1] for column in cursor.fetchall()]
        
        if 'auto_generate_alerts' not in plan_columns:
            print("📝 Adding auto_generate_alerts field to plan_conditions table...")
            cursor.execute("""
                ALTER TABLE plan_conditions 
                ADD COLUMN auto_generate_alerts BOOLEAN DEFAULT 1 NOT NULL
            """)
            print("✅ auto_generate_alerts field added to plan_conditions")
        else:
            print("ℹ️ auto_generate_alerts field already exists in plan_conditions")
        
        # Check if field already exists in trade_conditions
        cursor.execute("PRAGMA table_info(trade_conditions)")
        trade_columns = [column[1] for column in cursor.fetchall()]
        
        if 'auto_generate_alerts' not in trade_columns:
            print("📝 Adding auto_generate_alerts field to trade_conditions table...")
            cursor.execute("""
                ALTER TABLE trade_conditions 
                ADD COLUMN auto_generate_alerts BOOLEAN DEFAULT 1 NOT NULL
            """)
            print("✅ auto_generate_alerts field added to trade_conditions")
        else:
            print("ℹ️ auto_generate_alerts field already exists in trade_conditions")
        
        # Add constraints for the new field
        print("📝 Adding constraints for auto_generate_alerts field...")
        
        # Check if constraints table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='constraints'
        """)
        
        if cursor.fetchone():
            # Add constraints for plan_conditions.auto_generate_alerts
            cursor.execute("""
                INSERT OR IGNORE INTO constraints 
                (table_name, column_name, constraint_type, constraint_name, constraint_definition, is_active)
                VALUES 
                ('plan_conditions', 'auto_generate_alerts', 'boolean', 'auto_generate_alerts_default', 'DEFAULT 1 NOT NULL', 1),
                ('trade_conditions', 'auto_generate_alerts', 'boolean', 'auto_generate_alerts_default', 'DEFAULT 1 NOT NULL', 1)
            """)
            print("✅ Constraints added for auto_generate_alerts field")
        else:
            print("ℹ️ Constraints table not found, skipping constraint addition")
        
        # Commit changes
        conn.commit()
        print("✅ Migration completed successfully!")
        
        # Verify the changes
        print("\n🔍 Verifying migration...")
        
        # Check plan_conditions
        cursor.execute("PRAGMA table_info(plan_conditions)")
        plan_columns = cursor.fetchall()
        plan_auto_alerts = any(col[1] == 'auto_generate_alerts' for col in plan_columns)
        print(f"📋 plan_conditions.auto_generate_alerts: {'✅' if plan_auto_alerts else '❌'}")
        
        # Check trade_conditions
        cursor.execute("PRAGMA table_info(trade_conditions)")
        trade_columns = cursor.fetchall()
        trade_auto_alerts = any(col[1] == 'auto_generate_alerts' for col in trade_columns)
        print(f"📋 trade_conditions.auto_generate_alerts: {'✅' if trade_auto_alerts else '❌'}")
        
        # Count existing records
        cursor.execute("SELECT COUNT(*) FROM plan_conditions")
        plan_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM trade_conditions")
        trade_count = cursor.fetchone()[0]
        
        print(f"📊 Existing plan_conditions: {plan_count}")
        print(f"📊 Existing trade_conditions: {trade_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        return False
        
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🚀 TikTrack Migration: Add auto_generate_alerts field")
    print("=" * 60)
    
    success = run_migration()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("The auto_generate_alerts field has been added to both condition tables.")
        print("All existing conditions will have auto_generate_alerts set to True by default.")
    else:
        print("\n💥 Migration failed!")
        print("Please check the error messages above and try again.")
        sys.exit(1)
