#!/usr/bin/env python3
"""
Add Missing Entity Colors
=========================

This script adds the missing entity color preferences to the preference_types table.

Author: TikTrack Development Team
Date: January 2025
"""

import sqlite3
import os
from datetime import datetime

def add_missing_entity_colors():
    """Add missing entity color preferences to preference_types table"""
    
    # Database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🎨 Adding missing entity color preferences...")
        
        # Get group IDs
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'entity_colors'")
        entity_colors_group = cursor.fetchone()
        if not entity_colors_group:
            print("❌ entity_colors group not found")
            return False
        entity_colors_group_id = entity_colors_group[0]
        
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'ui_colors'")
        ui_colors_group = cursor.fetchone()
        if not ui_colors_group:
            print("❌ ui_colors group not found")
            return False
        ui_colors_group_id = ui_colors_group[0]
        
        # Missing color preferences
        missing_colors = [
            # Entity colors
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityExecutionColor',
                'description': 'Color for execution entities',
                'default_value': '#6f42c1',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityExecutionColorLight',
                'description': 'Light color for execution entities',
                'default_value': '#8e44ad',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityExecutionColorDark',
                'description': 'Dark color for execution entities',
                'default_value': '#5a2d91',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityTradeColorLight',
                'description': 'Light color for trade entities',
                'default_value': '#0056b3',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityTradeColorDark',
                'description': 'Dark color for trade entities',
                'default_value': '#004085',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityAccountColorLight',
                'description': 'Light color for account entities',
                'default_value': '#34ce57',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityAccountColorDark',
                'description': 'Dark color for account entities',
                'default_value': '#1e7e34',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityTickerColorLight',
                'description': 'Light color for ticker entities',
                'default_value': '#20c997',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': entity_colors_group_id,
                'data_type': 'color',
                'preference_name': 'entityTickerColorDark',
                'description': 'Dark color for ticker entities',
                'default_value': '#138496',
                'is_required': 0,
                'is_active': 1
            },
            # UI colors
            {
                'group_id': ui_colors_group_id,
                'data_type': 'color',
                'preference_name': 'infoColor',
                'description': 'Color for info messages',
                'default_value': '#17a2b8',
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
        print(f"🎨 Added {added_count} missing entity color preferences")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding missing entity color preferences: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    add_missing_entity_colors()
