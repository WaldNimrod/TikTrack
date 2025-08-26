#!/usr/bin/env python3
"""
Migration: Add Trade Date Constraint
Date: August 24, 2025
Description: Add constraint to ensure closed_at is not before opened_at in trades table
"""

import sqlite3
import os
import sys
from datetime import datetime

# Add the services directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))
from constraint_service import ConstraintService

def add_trade_date_constraint():
    """Add constraint to ensure closed_at is not before opened_at in trades table"""
    
    # Initialize constraint service
    constraint_service = ConstraintService()
    
    # Define the constraint data
    constraint_data = {
        'table_name': 'trades',
        'column_name': 'closed_at',
        'constraint_type': 'CUSTOM_VALIDATION',
        'constraint_name': 'trade_closed_date_after_opened',
        'constraint_definition': 'closed_at must be after or equal to opened_at',
        'validation_rule': 'closed_at >= opened_at OR closed_at IS NULL'
    }
    
    try:
        # Add the constraint
        success, message = constraint_service.add_constraint(constraint_data)
        
        if success:
            print(f"✅ Successfully added trade date constraint: {message}")
            return True
        else:
            print(f"❌ Failed to add trade date constraint: {message}")
            return False
            
    except Exception as e:
        print(f"❌ Error adding trade date constraint: {e}")
        return False

def validate_trade_dates():
    """Validate existing trades to ensure they comply with the new constraint"""
    
    constraint_service = ConstraintService()
    conn = constraint_service.get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Find trades where closed_at is before opened_at
        cursor.execute("""
            SELECT id, opened_at, closed_at 
            FROM trades 
            WHERE closed_at IS NOT NULL 
            AND opened_at IS NOT NULL 
            AND closed_at < opened_at
        """)
        
        invalid_trades = cursor.fetchall()
        
        if invalid_trades:
            print(f"⚠️  Found {len(invalid_trades)} trades with invalid dates:")
            for trade in invalid_trades:
                print(f"   Trade ID {trade[0]}: opened_at={trade[1]}, closed_at={trade[2]}")
            return False
        else:
            print("✅ All existing trades comply with the date constraint")
            return True
            
    except Exception as e:
        print(f"❌ Error validating trade dates: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("🔄 Adding trade date constraint...")
    
    # Validate existing data first
    print("📋 Validating existing trade dates...")
    if not validate_trade_dates():
        print("❌ Cannot proceed - existing data violates the constraint")
        sys.exit(1)
    
    # Add the constraint
    if add_trade_date_constraint():
        print("✅ Migration completed successfully")
    else:
        print("❌ Migration failed")
        sys.exit(1)
