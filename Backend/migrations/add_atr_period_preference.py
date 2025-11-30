#!/usr/bin/env python3
"""
Add ATR Period Preference
==========================

This migration adds the atr_period preference to the trading_settings group.
The preference allows users to configure the ATR calculation period (3-90 days, default 14).

Author: TikTrack Development Team
Date: January 2025
"""

import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from typing import Optional
from sqlalchemy import create_engine, text
from config.settings import DATABASE_URL


def preference_exists(engine, preference_name: str) -> bool:
    """Check whether a preference type already exists."""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id 
            FROM preference_types 
            WHERE preference_name = :preference_name
        """), {"preference_name": preference_name})
        return result.fetchone() is not None


def get_group_id(engine, group_name: str) -> Optional[int]:
    """Get group_id for a preference group."""
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT id 
            FROM preference_groups 
            WHERE group_name = :group_name
        """), {"group_name": group_name})
        row = result.fetchone()
        return row[0] if row else None


def add_atr_period_preference():
    """Add ATR period preference to trading_settings group."""
    
    print(f"➡️  Using database: PostgreSQL")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Check if preference already exists
            if preference_exists(engine, 'atr_period'):
                print("✅ Preference 'atr_period' already exists - skipping.")
                trans.commit()
                return
            
            # Get trading_settings group_id
            group_id = get_group_id(engine, 'trading_settings')
            if not group_id:
                print("❌ Error: 'trading_settings' group not found. Please run consolidate_preference_groups.py first.")
                trans.rollback()
                return
            
            print(f"📊 Found trading_settings group (ID: {group_id})")
            
            # Fix sequence if needed (PostgreSQL)
            print("🔧 Checking and fixing sequence if needed...")
            conn.execute(text("""
                SELECT setval('preference_types_id_seq', 
                    COALESCE((SELECT MAX(id) FROM preference_types), 1), 
                    true)
            """))
            
            # Add preference
            print("➕ Adding 'atr_period' preference...")
            conn.execute(text("""
                INSERT INTO preference_types (
                    group_id, 
                    data_type, 
                    preference_name, 
                    description, 
                    default_value, 
                    constraints, 
                    is_required, 
                    is_active
                ) VALUES (
                    :group_id,
                    'number',
                    'atr_period',
                    'משך זמן חישוב ATR בימים',
                    '14',
                    '{"min": 3, "max": 90}',
                    FALSE,
                    TRUE
                )
            """), {"group_id": group_id})
            
            print("✅ Preference 'atr_period' added successfully.")
            
            trans.commit()
            print("🎉 Migration completed successfully.")
            
        except Exception as error:
            trans.rollback()
            print(f"❌ Database error: {error}")
            raise


if __name__ == "__main__":
    add_atr_period_preference()

