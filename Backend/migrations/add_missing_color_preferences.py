#!/usr/bin/env python3
"""
Add Missing Color Preferences
============================

This script adds the missing color preferences to the preference_types table.

Author: TikTrack Development Team
Date: January 2025
"""

import sqlite3
import os
from datetime import datetime

def add_missing_color_preferences():
    """Add missing color preferences to preference_types table"""
    
    # Database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🎨 Adding missing color preferences...")
        
        # Get group IDs
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'value_colors'")
        value_colors_group = cursor.fetchone()
        if not value_colors_group:
            print("❌ value_colors group not found")
            return False
        value_colors_group_id = value_colors_group[0]
        
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'entity_colors'")
        entity_colors_group = cursor.fetchone()
        if not entity_colors_group:
            print("❌ entity_colors group not found")
            return False
        entity_colors_group_id = entity_colors_group[0]
        
        # Missing color preferences
        missing_colors = [
            # Value colors
            {
                'group_id': value_colors_group_id,
                'data_type': 'color',
                'preference_name': 'valuePositiveColor',
                'description': 'Color for positive values',
                'default_value': '#28a745',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': value_colors_group_id,
                'data_type': 'color',
                'preference_name': 'valuePositiveColorLight',
                'description': 'Light color for positive values',
                'default_value': '#34ce57',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': value_colors_group_id,
                'data_type': 'color',
                'preference_name': 'valuePositiveColorDark',
                'description': 'Dark color for positive values',
                'default_value': '#1e7e34',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': value_colors_group_id,
                'data_type': 'color',
                'preference_name': 'valueNegativeColor',
                'description': 'Color for negative values',
                'default_value': '#dc3545',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': value_colors_group_id,
                'data_type': 'color',
                'preference_name': 'valueNegativeColorLight',
                'description': 'Light color for negative values',
                'default_value': '#e74c3c',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': value_colors_group_id,
                'data_type': 'color',
                'preference_name': 'valueNegativeColorDark',
                'description': 'Dark color for negative values',
                'default_value': '#c82333',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': value_colors_group_id,
                'data_type': 'color',
                'preference_name': 'valueNeutralColor',
                'description': 'Color for neutral values',
                'default_value': '#6c757d',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': value_colors_group_id,
                'data_type': 'color',
                'preference_name': 'valueNeutralColorLight',
                'description': 'Light color for neutral values',
                'default_value': '#adb5bd',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': value_colors_group_id,
                'data_type': 'color',
                'preference_name': 'valueNeutralColorDark',
                'description': 'Dark color for neutral values',
                'default_value': '#495057',
                'is_required': 0,
                'is_active': 1
            },
            # Entity colors
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityCashFlowColor',
                'description': 'Color for cash flow entities',
                'default_value': '#20c997',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityCashFlowColorLight',
                'description': 'Light color for cash flow entities',
                'default_value': '#20c997',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityCashFlowColorDark',
                'description': 'Dark color for cash flow entities',
                'default_value': '#138496',
                'is_required': 0,
                'is_active': 1
            }
        ]
        
        # Add missing colors
        added_count = 0
        for color in missing_colors:
            # Check if preference already exists
            cursor.execute("SELECT id FROM preference_types WHERE preference_name = ?", (color['preference_name'],))
            if cursor.fetchone():
                print(f"⚠️  {color['preference_name']} already exists, skipping")
                continue
            
            # Insert new preference
            cursor.execute("""
                INSERT INTO preference_types 
                (group_id, data_type, preference_name, description, default_value, is_required, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                color['group_id'],
                color['data_type'],
                color['preference_name'],
                color['description'],
                color['default_value'],
                color['is_required'],
                color['is_active'],
                datetime.now(),
                datetime.now()
            ))
            added_count += 1
            print(f"✅ Added {color['preference_name']} = {color['default_value']}")
        
        conn.commit()
        print(f"🎨 Added {added_count} missing color preferences")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding missing color preferences: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    add_missing_color_preferences()
