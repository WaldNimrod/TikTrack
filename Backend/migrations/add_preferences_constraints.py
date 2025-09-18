#!/usr/bin/env python3
"""
Add Constraints for Preferences Tables
=====================================

This script adds constraints to the new preferences tables to ensure data integrity
and provide validation rules for the preferences system.

Author: TikTrack Development Team
Date: January 2025
"""

import sqlite3
import os
from datetime import datetime

def add_preferences_constraints():
    """Add constraints to preferences tables"""
    
    # Database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🔧 Adding constraints to preferences tables...")
        
        # Constraints for preference_groups table
        preference_groups_constraints = [
            {
                'table_name': 'preference_groups',
                'column_name': 'group_name',
                'constraint_type': 'NOT_NULL',
                'constraint_name': 'group_name_required',
                'constraint_definition': 'group_name IS NOT NULL',
                'is_active': 1
            },
            {
                'table_name': 'preference_groups',
                'column_name': 'group_name',
                'constraint_type': 'UNIQUE',
                'constraint_name': 'group_name_unique',
                'constraint_definition': 'UNIQUE(group_name)',
                'is_active': 1
            },
            {
                'table_name': 'preference_groups',
                'column_name': 'group_name',
                'constraint_type': 'CHECK',
                'constraint_name': 'group_name_length',
                'constraint_definition': 'LENGTH(group_name) >= 2 AND LENGTH(group_name) <= 100',
                'is_active': 1
            }
        ]
        
        # Constraints for preference_types table
        preference_types_constraints = [
            {
                'table_name': 'preference_types',
                'column_name': 'group_id',
                'constraint_type': 'NOT_NULL',
                'constraint_name': 'group_id_required',
                'constraint_definition': 'group_id IS NOT NULL',
                'is_active': 1
            },
            {
                'table_name': 'preference_types',
                'column_name': 'data_type',
                'constraint_type': 'NOT_NULL',
                'constraint_name': 'data_type_required',
                'constraint_definition': 'data_type IS NOT NULL',
                'is_active': 1
            },
            {
                'table_name': 'preference_types',
                'column_name': 'data_type',
                'constraint_type': 'ENUM',
                'constraint_name': 'data_type_enum',
                'constraint_definition': 'data_type IN ("string", "integer", "float", "boolean", "json", "color", "date", "time")',
                'is_active': 1
            },
            {
                'table_name': 'preference_types',
                'column_name': 'preference_name',
                'constraint_type': 'NOT_NULL',
                'constraint_name': 'preference_name_required',
                'constraint_definition': 'preference_name IS NOT NULL',
                'is_active': 1
            },
            {
                'table_name': 'preference_types',
                'column_name': 'preference_name',
                'constraint_type': 'UNIQUE',
                'constraint_name': 'preference_name_unique',
                'constraint_definition': 'UNIQUE(preference_name)',
                'is_active': 1
            },
            {
                'table_name': 'preference_types',
                'column_name': 'preference_name',
                'constraint_type': 'CHECK',
                'constraint_name': 'preference_name_format',
                'constraint_definition': 'preference_name REGEXP "^[a-zA-Z][a-zA-Z0-9_]*$"',
                'is_active': 1
            },
            {
                'table_name': 'preference_types',
                'column_name': 'is_required',
                'constraint_type': 'CHECK',
                'constraint_name': 'is_required_boolean',
                'constraint_definition': 'is_required IN (0, 1)',
                'is_active': 1
            },
            {
                'table_name': 'preference_types',
                'column_name': 'is_active',
                'constraint_type': 'CHECK',
                'constraint_name': 'is_active_boolean',
                'constraint_definition': 'is_active IN (0, 1)',
                'is_active': 1
            }
        ]
        
        # Constraints for user_preferences table
        user_preferences_constraints = [
            {
                'table_name': 'user_preferences',
                'column_name': 'user_id',
                'constraint_type': 'NOT_NULL',
                'constraint_name': 'user_id_required',
                'constraint_definition': 'user_id IS NOT NULL',
                'is_active': 1
            },
            {
                'table_name': 'user_preferences',
                'column_name': 'profile_id',
                'constraint_type': 'NOT_NULL',
                'constraint_name': 'profile_id_required',
                'constraint_definition': 'profile_id IS NOT NULL',
                'is_active': 1
            },
            {
                'table_name': 'user_preferences',
                'column_name': 'preference_id',
                'constraint_type': 'NOT_NULL',
                'constraint_name': 'preference_id_required',
                'constraint_definition': 'preference_id IS NOT NULL',
                'is_active': 1
            },
            {
                'table_name': 'user_preferences',
                'column_name': 'saved_value',
                'constraint_type': 'NOT_NULL',
                'constraint_name': 'saved_value_required',
                'constraint_definition': 'saved_value IS NOT NULL',
                'is_active': 1
            },
            {
                'table_name': 'user_preferences',
                'column_name': 'user_id',
                'constraint_type': 'CHECK',
                'constraint_name': 'user_id_positive',
                'constraint_definition': 'user_id > 0',
                'is_active': 1
            },
            {
                'table_name': 'user_preferences',
                'column_name': 'profile_id',
                'constraint_type': 'CHECK',
                'constraint_name': 'profile_id_positive',
                'constraint_definition': 'profile_id > 0',
                'is_active': 1
            },
            {
                'table_name': 'user_preferences',
                'column_name': 'preference_id',
                'constraint_type': 'CHECK',
                'constraint_name': 'preference_id_positive',
                'constraint_definition': 'preference_id > 0',
                'is_active': 1
            }
        ]
        
        # Insert constraints
        all_constraints = preference_groups_constraints + preference_types_constraints + user_preferences_constraints
        
        for constraint in all_constraints:
            cursor.execute("""
                INSERT INTO constraints (
                    table_name, column_name, constraint_type, constraint_name,
                    constraint_definition, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                constraint['table_name'],
                constraint['column_name'],
                constraint['constraint_type'],
                constraint['constraint_name'],
                constraint['constraint_definition'],
                constraint['is_active'],
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
        
        # Add enum values for data_type
        cursor.execute("SELECT id FROM constraints WHERE constraint_name = 'data_type_enum'")
        enum_constraint_id = cursor.fetchone()[0]
        
        enum_values = [
            ('string', 'String value'),
            ('integer', 'Integer number'),
            ('float', 'Floating point number'),
            ('boolean', 'True/False value'),
            ('json', 'JSON object'),
            ('color', 'Color value (hex)'),
            ('date', 'Date value'),
            ('time', 'Time value')
        ]
        
        for i, (value, description) in enumerate(enum_values):
            cursor.execute("""
                INSERT INTO enum_values (
                    constraint_id, value, display_name, is_active, sort_order
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                enum_constraint_id,
                value,
                description,
                1,
                i
            ))
        
        conn.commit()
        print(f"✅ Added {len(all_constraints)} constraints to preferences tables")
        print(f"✅ Added {len(enum_values)} enum values for data_type")
        
    except Exception as e:
        print(f"❌ Error adding constraints: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    add_preferences_constraints()
