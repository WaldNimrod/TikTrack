#!/usr/bin/env python3
"""
Migration script to add constraint ensuring trade plan ticker matches trade ticker

This script adds a CUSTOM_VALIDATION constraint to the trades table that ensures
when a trade_plan_id is provided, the ticker_id of the trade plan matches the
ticker_id of the trade.

File: Backend/migrations/add_trade_plan_ticker_constraint.py
Version: 1.0
Last Updated: August 24, 2025
"""

import sqlite3
import sys
import os

# Add the Backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services.constraint_service import ConstraintService

def add_trade_plan_ticker_constraint():
    """
    Add constraint to ensure trade plan ticker matches trade ticker
    """
    print("🔄 Adding trade plan ticker constraint...")
    
    try:
        # Initialize constraint service
        constraint_service = ConstraintService()
        
        # Define the constraint
        constraint_name = "trade_plan_ticker_match"
        constraint_definition = """
        trade_plan_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM trade_plans tp 
            WHERE tp.id = trade_plan_id 
            AND tp.ticker_id = ticker_id
        )
        """
        
        # Add the constraint
        constraint_data = {
            'table_name': "trades",
            'column_name': "trade_plan_id",
            'constraint_type': "CUSTOM_VALIDATION",
            'constraint_name': constraint_name,
            'constraint_definition': constraint_definition
        }
        
        success, message = constraint_service.add_constraint(constraint_data)
        
        if success:
            print("✅ Trade plan ticker constraint added successfully")
            return True
        else:
            print("❌ Failed to add trade plan ticker constraint")
            return False
            
    except Exception as e:
        print(f"❌ Error adding trade plan ticker constraint: {e}")
        return False

def verify_constraint():
    """
    Verify that the constraint was added correctly
    """
    print("🔍 Verifying constraint...")
    
    try:
        db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if constraint exists
        cursor.execute("""
            SELECT constraint_name, constraint_definition 
            FROM constraints 
            WHERE table_name = 'trades' 
            AND constraint_name = 'trade_plan_ticker_match'
        """)
        
        result = cursor.fetchone()
        
        if result:
            print(f"✅ Constraint found: {result[0]}")
            print(f"   Definition: {result[1]}")
            conn.close()
            return True
        else:
            print("❌ Constraint not found")
            conn.close()
            return False
            
    except Exception as e:
        print(f"❌ Error verifying constraint: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting trade plan ticker constraint migration...")
    
    # Add the constraint
    if add_trade_plan_ticker_constraint():
        # Verify the constraint
        if verify_constraint():
            print("🎉 Migration completed successfully!")
        else:
            print("⚠️ Migration completed but verification failed")
    else:
        print("❌ Migration failed")
        sys.exit(1)
