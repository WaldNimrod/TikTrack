#!/usr/bin/env python3
"""
Add chartSecondaryColor Preference
===================================

This script adds chartSecondaryColor preference to the preference_types table.
Uses PostgreSQL via SQLAlchemy.

Author: TikTrack Development Team
Date: November 2025
"""

import os
import sys
from datetime import datetime
from pathlib import Path
from sqlalchemy import create_engine, text

def run_migration(database_url: str):
    """Add chartSecondaryColor preference to preference_types table
    
    Args:
        database_url: PostgreSQL database URL
    
    Returns:
        True if successful, False otherwise
    """
    try:
        engine = create_engine(database_url)
        
        with engine.begin() as conn:
            print("📊 Adding chartSecondaryColor preference...")
            
            # Get chart_colors group
            result = conn.execute(text("""
                SELECT id FROM preference_groups WHERE group_name = 'chart_colors'
            """))
            chart_colors_group = result.fetchone()
            
            if not chart_colors_group:
                print("❌ chart_colors group not found. Please run add_chart_preferences.py first.")
                return False
            
            chart_colors_group_id = chart_colors_group[0]
            
            # Check if preference already exists
            result = conn.execute(text("""
                SELECT id FROM preference_types WHERE preference_name = 'chartSecondaryColor'
            """))
            if result.fetchone():
                print("⚠️  chartSecondaryColor already exists, skipping")
                return True
            
            # Insert new preference
            conn.execute(text("""
                INSERT INTO preference_types 
                (group_id, data_type, preference_name, description, default_value, is_required, is_active, created_at, updated_at)
                VALUES (:group_id, :data_type, :preference_name, :description, :default_value, :is_required, :is_active, :created_at, :updated_at)
            """), {
                'group_id': chart_colors_group_id,
                'data_type': 'color',
                'preference_name': 'chartSecondaryColor',
                'description': 'Secondary color for charts (Orange-Red from logo)',
                'default_value': '#fc5a06',
                'is_required': 0,
                'is_active': 1,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            })
            
            print("✅ Added chartSecondaryColor preference with default value #fc5a06")
            return True
        
    except Exception as e:
        print(f"❌ Error adding chartSecondaryColor preference: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Starting chartSecondaryColor Migration...")
    print("=" * 50)
    
    # Get database URL from config
    current_dir = Path(__file__).parent
    backend_dir = current_dir.parent
    sys.path.insert(0, str(backend_dir))
    
    try:
        from config.settings import DATABASE_URL
        success = run_migration(DATABASE_URL)
    except ImportError:
        print("❌ Could not import DATABASE_URL from config.settings")
        print("💡 Please provide database URL as argument or set in config")
        success = False
    
    if success:
        print("\n✅ Migration completed successfully!")
        print("\n📝 Next steps:")
        print("1. Update trading-ui/scripts/preferences-colors.js")
        print("2. Add input field to trading-ui/preferences.html")
        print("3. Test the preference via API")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)

