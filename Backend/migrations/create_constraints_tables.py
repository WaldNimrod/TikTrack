#!/usr/bin/env python3
"""
Migration: Create Dynamic Constraints Management Tables
Date: August 23, 2025
Description: Create tables for managing database constraints dynamically
"""

import sqlite3
import os
import sys
from datetime import datetime

def get_db_connection():
    """Get database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "db", "simpleTrade_new.db")
    return sqlite3.connect(db_path)

def create_constraints_table():
    """Create the main constraints table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS constraints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name VARCHAR(50) NOT NULL,
                column_name VARCHAR(50) NOT NULL,
                constraint_type VARCHAR(20) NOT NULL,
                constraint_name VARCHAR(100) NOT NULL,
                constraint_definition TEXT NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create indexes for better performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_constraints_table_column ON constraints (table_name, column_name)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_constraints_type ON constraints (constraint_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_constraints_active ON constraints (is_active)")
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def create_enum_values_table():
    """Create the enum values table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS enum_values (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                value VARCHAR(50) NOT NULL,
                display_name VARCHAR(100),
                is_active BOOLEAN DEFAULT 1,
                sort_order INTEGER DEFAULT 0,
                FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
            )
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_enum_constraint_id ON enum_values (constraint_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_enum_active ON enum_values (is_active)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_enum_sort ON enum_values (sort_order)")
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def create_constraint_validations_table():
    """Create the constraint validations table"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS constraint_validations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                constraint_id INTEGER NOT NULL,
                validation_type VARCHAR(20) NOT NULL,
                validation_rule TEXT NOT NULL,
                error_message TEXT,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (constraint_id) REFERENCES constraints(id) ON DELETE CASCADE
            )
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_validation_constraint_id ON constraint_validations (constraint_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_validation_type ON constraint_validations (validation_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_validation_active ON constraint_validations (is_active)")
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()

def verify_tables():
    """Verify all tables were created correctly"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        # Check constraints table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='constraints'")
        if cursor.fetchone():
            cursor.execute("PRAGMA table_info(constraints)")
            columns = cursor.fetchall()
        else:
            return False
        
        # Check enum_values table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='enum_values'")
        if cursor.fetchone():
            cursor.execute("PRAGMA table_info(enum_values)")
            columns = cursor.fetchall()
        else:
            return False
        
        # Check constraint_validations table
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='constraint_validations'")
        if cursor.fetchone():
            cursor.execute("PRAGMA table_info(constraint_validations)")
            columns = cursor.fetchall()
        else:
            return False
        
        return True
        
    except Exception as e:
        return False
    finally:
        conn.close()

def main():
    """Main migration function"""
    
    # Step 1: Create constraints table
    if not create_constraints_table():
        return
    
    # Step 2: Create enum_values table
    if not create_enum_values_table():
        return
    
    # Step 3: Create constraint_validations table
    if not create_constraint_validations_table():
        return
    
    # Step 4: Verify all tables
    if not verify_tables():
        return
    

if __name__ == "__main__":
    main()
