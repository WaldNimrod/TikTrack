#!/usr/bin/env python3
"""
Add Chart Preferences
====================

This script adds chart-related preferences to the preference_types table.

Author: TikTrack Development Team
Date: January 2025
"""

import sqlite3
import os
from datetime import datetime

def add_chart_preferences():
    """Add chart preferences to preference_types table"""
    
    # Database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("📊 Adding chart preferences...")
        
        # Get or create chart_colors group
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'chart_colors'")
        chart_colors_group = cursor.fetchone()
        if not chart_colors_group:
            # Create chart_colors group
            cursor.execute("""
                INSERT INTO preference_groups (group_name, description, created_at, updated_at)
                VALUES ('chart_colors', 'Chart-specific colors', ?, ?)
            """, (datetime.now(), datetime.now()))
            chart_colors_group_id = cursor.lastrowid
            print("✅ Created chart_colors group")
        else:
            chart_colors_group_id = chart_colors_group[0]
        
        # Get or create chart_settings group
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'chart_settings'")
        chart_settings_group = cursor.fetchone()
        if not chart_settings_group:
            # Create chart_settings group
            cursor.execute("""
                INSERT INTO preference_groups (group_name, description, created_at, updated_at)
                VALUES ('chart_settings', 'Chart behavior settings', ?, ?)
            """, (datetime.now(), datetime.now()))
            chart_settings_group_id = cursor.lastrowid
            print("✅ Created chart_settings group")
        else:
            chart_settings_group_id = chart_settings_group[0]
        
        # Get or create chart_export group
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'chart_export'")
        chart_export_group = cursor.fetchone()
        if not chart_export_group:
            # Create chart_export group
            cursor.execute("""
                INSERT INTO preference_groups (group_name, description, created_at, updated_at)
                VALUES ('chart_export', 'Chart export settings', ?, ?)
            """, (datetime.now(), datetime.now()))
            chart_export_group_id = cursor.lastrowid
            print("✅ Created chart_export group")
        else:
            chart_export_group_id = chart_export_group[0]
        
        # Chart preferences to add
        chart_preferences = [
            # Chart Colors
            {
                'group_id': chart_colors_group_id,
                'data_type': 'color',
                'preference_name': 'chartPrimaryColor',
                'description': 'Primary color for charts (distinct from general primary)',
                'default_value': '#1e40af',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_colors_group_id,
                'data_type': 'color',
                'preference_name': 'chartBackgroundColor',
                'description': 'Background color for charts',
                'default_value': '#ffffff',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_colors_group_id,
                'data_type': 'color',
                'preference_name': 'chartTextColor',
                'description': 'Text color for charts',
                'default_value': '#212529',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_colors_group_id,
                'data_type': 'color',
                'preference_name': 'chartGridColor',
                'description': 'Grid color for charts',
                'default_value': '#e9ecef',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_colors_group_id,
                'data_type': 'color',
                'preference_name': 'chartBorderColor',
                'description': 'Border color for charts',
                'default_value': '#dee2e6',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_colors_group_id,
                'data_type': 'color',
                'preference_name': 'chartPointColor',
                'description': 'Point color for charts',
                'default_value': '#007bff',
                'is_required': 0,
                'is_active': 1
            },
            
            # Chart Settings
            {
                'group_id': chart_settings_group_id,
                'data_type': 'boolean',
                'preference_name': 'chartAutoRefresh',
                'description': 'Enable automatic chart refresh',
                'default_value': 'true',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_settings_group_id,
                'data_type': 'integer',
                'preference_name': 'chartRefreshInterval',
                'description': 'Chart refresh interval in seconds',
                'default_value': '60',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_settings_group_id,
                'data_type': 'string',
                'preference_name': 'chartQuality',
                'description': 'Chart rendering quality',
                'default_value': 'medium',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_settings_group_id,
                'data_type': 'boolean',
                'preference_name': 'chartAnimations',
                'description': 'Enable chart animations',
                'default_value': 'true',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_settings_group_id,
                'data_type': 'boolean',
                'preference_name': 'chartInteractive',
                'description': 'Enable interactive chart features',
                'default_value': 'true',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_settings_group_id,
                'data_type': 'boolean',
                'preference_name': 'chartShowTooltips',
                'description': 'Show chart tooltips',
                'default_value': 'true',
                'is_required': 0,
                'is_active': 1
            },
            
            # Chart Export Settings
            {
                'group_id': chart_export_group_id,
                'data_type': 'string',
                'preference_name': 'chartExportFormat',
                'description': 'Default chart export format',
                'default_value': 'png',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_export_group_id,
                'data_type': 'string',
                'preference_name': 'chartExportQuality',
                'description': 'Default chart export quality',
                'default_value': 'medium',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_export_group_id,
                'data_type': 'string',
                'preference_name': 'chartExportResolution',
                'description': 'Default chart export resolution',
                'default_value': '1x',
                'is_required': 0,
                'is_active': 1
            },
            {
                'group_id': chart_export_group_id,
                'data_type': 'boolean',
                'preference_name': 'chartExportBackground',
                'description': 'Include background in chart export',
                'default_value': 'true',
                'is_required': 0,
                'is_active': 1
            }
        ]
        
        # Add chart preferences
        added_count = 0
        for preference in chart_preferences:
            # Check if preference already exists
            cursor.execute("SELECT id FROM preference_types WHERE preference_name = ?", (preference['preference_name'],))
            if cursor.fetchone():
                print(f"⚠️  {preference['preference_name']} already exists, skipping")
                continue
            
            # Insert new preference
            cursor.execute("""
                INSERT INTO preference_types 
                (group_id, data_type, preference_name, description, default_value, is_required, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                preference['group_id'],
                preference['data_type'],
                preference['preference_name'],
                preference['description'],
                preference['default_value'],
                preference['is_required'],
                preference['is_active'],
                datetime.now(),
                datetime.now()
            ))
            added_count += 1
            print(f"✅ Added {preference['preference_name']} = {preference['default_value']}")
        
        conn.commit()
        print(f"📊 Added {added_count} chart preferences")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding chart preferences: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    add_chart_preferences()
