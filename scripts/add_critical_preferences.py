#!/usr/bin/env python3
"""
Add Critical Missing Preferences to Database
===========================================

This script adds the critical preferences that are referenced in code
but missing from both database and fallback defaults.

Critical preferences to add:
- default_trading_account
- primaryCurrency
- entityTradingAccountColor
- market_cap_warning_threshold
- statusOpenColor
"""

import sys
import os
from pathlib import Path

# Add Backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'Backend'))

from config.database import SessionLocal
from sqlalchemy import text

def add_critical_preferences():
    """Add critical missing preferences to database"""

    session = SessionLocal()

    try:
        print("🚨 Adding Critical Missing Preferences")
        print("=" * 50)

        # Define critical preferences to add (canonical names only)
        critical_preferences = [
            {
                'name': 'default_trading_account',
                'data_type': 'integer',
                'default_value': '1',
                'group_id': 9,  # basic_settings
                'description': 'Default trading account for forms and filters'
            },
            {
                'name': 'primaryCurrency',
                'data_type': 'string',
                'default_value': 'USD',
                'group_id': 9,  # basic_settings
                'description': 'Default currency for new trades and calculations'
            },
            {
                'name': 'entityTradingAccountColor',
                'data_type': 'string',
                'default_value': '#28a745',
                'group_id': 21,  # colors_unified
                'description': 'Color for trading account entities'
            },
            {
                'name': 'market_cap_warning_threshold',
                'data_type': 'number',
                'default_value': '1000000000',
                'group_id': 10,  # trading_settings
                'description': 'Market cap threshold for warnings (in dollars)'
            },
            {
                'name': 'statusOpenColor',
                'data_type': 'string',
                'default_value': '#28a745',
                'group_id': 21,  # colors_unified
                'description': 'Color for open status indicators'
            }
        ]

        added_count = 0

        for pref in critical_preferences:
            # Check if preference already exists
            existing = session.execute(text("""
                SELECT id FROM preference_types
                WHERE preference_name = :name
            """), {'name': pref['name']}).fetchone()

            if existing:
                print(f"⚠️  Preference '{pref['name']}' already exists, skipping")
                continue

            # Add the preference
            session.execute(text("""
                INSERT INTO preference_types (
                    group_id, data_type, preference_name, description,
                    default_value, is_required, is_active
                ) VALUES (
                    :group_id, :data_type, :preference_name, :description,
                    :default_value, false, true
                )
            """), {
                'group_id': pref['group_id'],
                'data_type': pref['data_type'],
                'preference_name': pref['name'],
                'description': pref['description'],
                'default_value': pref['default_value']
            })

            print(f"✅ Added critical preference: {pref['name']} (default: {pref['default_value']})")
            added_count += 1

        session.commit()
        print(f"\n🎯 Successfully added {added_count} critical preferences")

        # Verify they were added
        print("\n🔍 Verification:")
        for pref in critical_preferences:
            result = session.execute(text("""
                SELECT pt.preference_name, pt.default_value, pg.group_name
                FROM preference_types pt
                JOIN preference_groups pg ON pt.group_id = pg.id
                WHERE pt.preference_name = :name
            """), {'name': pref['name']}).fetchone()

            if result:
                print(f"   ✅ {result.preference_name}: {result.default_value} (group: {result.group_name})")
            else:
                print(f"   ❌ {pref['name']}: NOT FOUND")

    except Exception as e:
        print(f"❌ Error adding critical preferences: {e}")
        session.rollback()
        return False
    finally:
        session.close()

    return True

if __name__ == "__main__":
    success = add_critical_preferences()
    if success:
        print("\n🎉 Critical preferences addition completed successfully!")
    else:
        print("\n💥 Failed to add critical preferences!")
        sys.exit(1)
