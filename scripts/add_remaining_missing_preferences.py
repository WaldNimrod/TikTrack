#!/usr/bin/env python3
"""
Add ALL Remaining Missing Preferences
=====================================

This script adds ALL remaining preferences that are missing from the database
based on the gaps report, prioritizing by importance.
"""

import sys
import os
from pathlib import Path
import json

# Add Backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'Backend'))

from config.database import SessionLocal
from sqlalchemy import text

def get_all_missing_preferences():
    """Get all preferences that are missing from database based on gaps report"""

    # Load gaps report
    gaps_file = Path(__file__).parent.parent / 'documentation' / '05-REPORTS' / 'PREFERENCES_GAPS_TABLES.md'

    missing_referenced = []
    missing_ui = []

    try:
        with open(gaps_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract "Missing In DB - Referenced In Code"
        if "## Missing In DB - Referenced In Code" in content:
            section = content.split("## Missing In DB - Referenced In Code")[1].split("##")[0]
            lines = section.strip().split('\n')
            for line in lines:
                if '|' in line and 'Preference' not in line:
                    parts = line.split('|')
                    if len(parts) >= 2:
                        pref = parts[1].strip()
                        if pref and pref not in ['---', '']:
                            missing_referenced.append(pref)

        # Extract "Missing In DB - Present In Preferences UI"
        if "## Missing In DB - Present In Preferences UI" in content:
            section = content.split("## Missing In DB - Present In Preferences UI")[1].split("##")[0]
            lines = section.strip().split('\n')
            for line in lines:
                if '|' in line and 'Preference Field ID' not in line:
                    parts = line.split('|')
                    if len(parts) >= 2:
                        pref = parts[1].strip()
                        if pref and pref not in ['---', '']:
                            missing_ui.append(pref)

    except Exception as e:
        print(f"❌ Failed to load gaps report: {e}")
        return [], []

    return missing_referenced, missing_ui

def get_existing_preferences():
    """Get all existing preferences from database"""
    session = SessionLocal()

    try:
        result = session.execute(text("""
            SELECT preference_name FROM preference_types
        """))

        existing = {row.preference_name for row in result}
        return existing

    except Exception as e:
        print(f"❌ Failed to get existing preferences: {e}")
        return set()
    finally:
        session.close()

def define_all_missing_preferences(missing_referenced, missing_ui, existing_prefs):
    """Define ALL missing preferences with appropriate defaults"""

    all_missing = set(missing_referenced + missing_ui)
    actually_missing = all_missing - existing_prefs

    print(f"Total missing from gaps report: {len(all_missing)}")
    print(f"Already exist in database: {len(all_missing - actually_missing)}")
    print(f"Actually still missing: {len(actually_missing)}")

    preferences_to_add = []

    # Group mappings
    groups = {
        'basic_settings': 9,
        'filter_settings': 11,
        'trading_settings': 10,
        'notification_settings': 15,
        'colors_unified': 21,
        'ui_settings': 16,
        'chart_settings_unified': 22
    }

    for pref_name in actually_missing:
        # Determine appropriate defaults based on preference name
        if 'color' in pref_name.lower() or pref_name.endswith('Color'):
            # Color preferences
            group_id = groups['colors_unified']
            data_type = 'string'

            # Determine default color value
            if 'primary' in pref_name.lower():
                default_value = '#26baac'
            elif 'secondary' in pref_name.lower():
                default_value = '#fc5a06'
            elif 'success' in pref_name.lower():
                default_value = '#28a745'
            elif 'warning' in pref_name.lower():
                default_value = '#ffc107'
            elif 'danger' in pref_name.lower():
                default_value = '#dc3545'
            elif 'info' in pref_name.lower():
                default_value = '#17a2b8'
            elif 'link' in pref_name.lower():
                default_value = '#007bff'
            elif 'background' in pref_name.lower():
                default_value = '#ffffff'
            elif 'text' in pref_name.lower():
                default_value = '#333333'
            elif 'border' in pref_name.lower():
                default_value = '#dee2e6'
            elif 'highlight' in pref_name.lower():
                default_value = '#fff3cd'
            elif 'shadow' in pref_name.lower():
                default_value = '#000000'
            elif 'entity' in pref_name.lower():
                # Entity colors - use a default based on entity type
                if 'trade' in pref_name.lower():
                    if 'dark' in pref_name.lower():
                        default_value = '#1a8f83'
                    elif 'light' in pref_name.lower():
                        default_value = '#6ed8ca'
                    else:
                        default_value = '#26baac'
                elif 'account' in pref_name.lower():
                    if 'dark' in pref_name.lower():
                        default_value = '#1e7e34'
                    elif 'light' in pref_name.lower():
                        default_value = '#34ce57'
                    else:
                        default_value = '#28a745'
                elif 'alert' in pref_name.lower():
                    if 'dark' in pref_name.lower():
                        default_value = '#f57c00'
                    elif 'light' in pref_name.lower():
                        default_value = '#ffb74d'
                    else:
                        default_value = '#ff9800'
                elif 'note' in pref_name.lower():
                    if 'dark' in pref_name.lower():
                        default_value = '#455a64'
                    elif 'light' in pref_name.lower():
                        default_value = '#90a4ae'
                    else:
                        default_value = '#607d8b'
                elif 'preferences' in pref_name.lower():
                    if 'dark' in pref_name.lower():
                        default_value = '#455a64'
                    elif 'light' in pref_name.lower():
                        default_value = '#90a4ae'
                    else:
                        default_value = '#607d8b'
                elif 'research' in pref_name.lower():
                    if 'dark' in pref_name.lower():
                        default_value = '#7b1fa2'
                    elif 'light' in pref_name.lower():
                        default_value = '#ba68c8'
                    else:
                        default_value = '#9c27b0'
                elif 'ticker' in pref_name.lower():
                    if 'dark' in pref_name.lower():
                        default_value = '#138496'
                    elif 'light' in pref_name.lower():
                        default_value = '#20c997'
                    else:
                        default_value = '#17a2b8'
                elif 'plan' in pref_name.lower():
                    if 'dark' in pref_name.lower():
                        default_value = '#7b1fa2'
                    elif 'light' in pref_name.lower():
                        default_value = '#ba68c8'
                    else:
                        default_value = '#9c27b0'
                elif 'execution' in pref_name.lower():
                    if 'dark' in pref_name.lower():
                        default_value = '#5a2d91'
                    elif 'light' in pref_name.lower():
                        default_value = '#8e44ad'
                    else:
                        default_value = '#6f42c1'
                elif 'cash' in pref_name.lower():
                    if 'dark' in pref_name.lower():
                        default_value = '#138496'
                    elif 'light' in pref_name.lower():
                        default_value = '#20c997'
                    else:
                        default_value = '#20c997'
                else:
                    default_value = '#607d8b'  # Default entity color
            elif 'status' in pref_name.lower():
                if 'open' in pref_name.lower():
                    default_value = '#28a745'
                elif 'closed' in pref_name.lower():
                    default_value = '#6c757d'
                elif 'cancelled' in pref_name.lower():
                    default_value = '#dc3545'
                else:
                    default_value = '#6c757d'
            else:
                default_value = '#607d8b'  # Default color

        elif pref_name in ['defaultCommission']:
            group_id = groups['trading_settings']
            data_type = 'number'
            default_value = '1.0'

        elif pref_name in ['notification_mode']:
            group_id = groups['notification_settings']
            data_type = 'string'
            default_value = 'work'

        elif 'filter' in pref_name.lower():
            # Filter preferences
            group_id = groups['filter_settings']
            data_type = 'string'

            if 'status' in pref_name.lower():
                default_value = 'open'
            elif 'type' in pref_name.lower():
                default_value = 'swing'
            elif 'date' in pref_name.lower():
                default_value = 'this_week'
            elif 'search' in pref_name.lower():
                default_value = ''
            else:
                default_value = 'all'

        elif 'notification' in pref_name.lower() or 'notify' in pref_name.lower() or pref_name.startswith('mode'):
            # Notification preferences
            group_id = groups['notification_settings']

            if 'duration' in pref_name.lower() or 'max' in pref_name.lower():
                data_type = 'number'
                default_value = '5' if 'duration' in pref_name.lower() else '50'
            else:
                data_type = 'boolean'
                # Most notifications should be enabled by default
                default_value = 'true'

        elif pref_name in ['theme', 'tablePageSize', 'showAnimations', 'compactMode'] or 'console_logs' in pref_name:
            # UI preferences
            group_id = groups['ui_settings']

            if pref_name == 'theme':
                data_type = 'string'
                default_value = 'light'
            elif 'page' in pref_name.lower():
                data_type = 'number'
                default_value = '25'
            else:
                data_type = 'boolean'
                # Animations and compact mode off by default, logs mostly off
                if 'animation' in pref_name.lower():
                    default_value = 'true'
                elif 'compact' in pref_name.lower():
                    default_value = 'false'
                else:
                    # Console logs - most off by default
                    default_value = 'false'

        elif 'profile' in pref_name.lower():
            # Profile management preferences
            group_id = groups['basic_settings']
            data_type = 'string'
            default_value = ''

        else:
            # Default fallback
            group_id = groups['basic_settings']
            data_type = 'string'
            default_value = ''

        preferences_to_add.append({
            'name': pref_name,
            'data_type': data_type,
            'default_value': default_value,
            'group_id': group_id,
            'description': f'Auto-generated preference: {pref_name}'
        })

    return preferences_to_add

def add_preferences_batch(preferences):
    """Add preferences to database in batch"""
    session = SessionLocal()

    try:
        added_count = 0

        for pref in preferences:
            # Check if preference already exists (double-check)
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

            print(f"✅ Added: {pref['name']} ({pref['data_type']}) = {pref['default_value']}")
            added_count += 1

        session.commit()
        print(f"\n🎯 Successfully added {added_count} preferences to database")

    except Exception as e:
        print(f"❌ Error adding preferences: {e}")
        session.rollback()
        return False
    finally:
        session.close()

    return True

def main():
    """Main execution"""
    print("🚀 Adding ALL Remaining Missing Preferences")
    print("=" * 60)

    # Get missing preferences from gaps report
    print("\n📋 Loading gaps report...")
    missing_referenced, missing_ui = get_all_missing_preferences()

    if not missing_referenced and not missing_ui:
        print("❌ Failed to load gaps report")
        return False

    print(f"Found {len(missing_referenced)} referenced in code")
    print(f"Found {len(missing_ui)} present in UI")

    # Get existing preferences
    print("\n📊 Checking existing preferences...")
    existing_prefs = get_existing_preferences()
    print(f"Found {len(existing_prefs)} existing preferences in database")

    # Define all preferences to add
    print("\n📝 Defining all missing preferences...")
    prefs_to_add = define_all_missing_preferences(missing_referenced, missing_ui, existing_prefs)

    print(f"Will add {len(prefs_to_add)} preferences")

    if not prefs_to_add:
        print("✅ All preferences already exist in database!")
        return True

    # Show summary by priority
    high_priority = [p for p in prefs_to_add if p['name'] in missing_referenced]
    medium_priority = [p for p in prefs_to_add if p['name'] in missing_ui and p['name'] not in missing_referenced]
    low_priority = []  # We'll handle these separately if needed

    print(f"High priority (referenced in code): {len(high_priority)}")
    print(f"Medium priority (UI): {len(medium_priority)}")
    print(f"Low priority: {len(low_priority)}")

    # Add all preferences
    print("\n🗄️  Adding preferences to database...")
    if not add_preferences_batch(prefs_to_add):
        return False

    print("\n🎉 Successfully added all remaining missing preferences!")
    print("Note: Fallback defaults should be added to COLOR_DEFAULTS in models/preferences.py for color preferences")
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n💥 Failed to add remaining preferences!")
        sys.exit(1)
