#!/usr/bin/env python3
"""
Add chartSecondaryColor Preference
===================================

This script adds chartSecondaryColor preference to the preference_types table.

Author: TikTrack Development Team
Date: November 2025
"""

import sqlite3
import os
from datetime import datetime

def add_chart_secondary_color_preference():
    """Add chartSecondaryColor preference to preference_types table"""
    
    # Database path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "..", "db", "simpleTrade_new.db")
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found: {db_path}")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("📊 Adding chartSecondaryColor preference...")
        
        # Get chart_colors group
        cursor.execute("SELECT id FROM preference_groups WHERE group_name = 'chart_colors'")
        chart_colors_group = cursor.fetchone()
        
        if not chart_colors_group:
            print("❌ chart_colors group not found. Please run add_chart_preferences.py first.")
            return False
        
        chart_colors_group_id = chart_colors_group[0]
        
        # Check if preference already exists
        cursor.execute("SELECT id FROM preference_types WHERE preference_name = 'chartSecondaryColor'")
        if cursor.fetchone():
            print("⚠️  chartSecondaryColor already exists, skipping")
            return True
        
        # Insert new preference
        cursor.execute("""
            INSERT INTO preference_types 
            (group_id, data_type, preference_name, description, default_value, is_required, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            chart_colors_group_id,
            'color',
            'chartSecondaryColor',
            'Secondary color for charts (Orange-Red from logo)',
            '#fc5a06',
            0,
            1,
            datetime.now(),
            datetime.now()
        ))
        
        conn.commit()
        print("✅ Added chartSecondaryColor preference with default value #fc5a06")
        
        return True
        
    except Exception as e:
        print(f"❌ Error adding chartSecondaryColor preference: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Starting chartSecondaryColor Migration...")
    print("=" * 50)
    
    success = add_chart_secondary_color_preference()
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("\n📝 Next steps:")
        print("1. Update trading-ui/scripts/preferences-colors.js")
        print("2. Add input field to trading-ui/preferences.html")
        print("3. Test the preference via API")
    else:
        print("\n❌ Migration failed!")
        exit(1)

