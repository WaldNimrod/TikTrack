#!/usr/bin/env python3
"""
Audit Current Preferences Database State
========================================

This script audits the current state of preferences in the database
and compares it with the gaps report to identify missing preferences.

Usage:
    python3 scripts/audit_current_preferences_db.py

Output:
    - Current preferences in database
    - Missing preferences comparison with gaps report
    - Recommendations for fixes
"""

import sys
import os
import json
from pathlib import Path

# Add Backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'Backend'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from config.database import SessionLocal

def get_database_connection():
    """Get database connection"""
    try:
        return SessionLocal()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return None

def get_current_preferences_from_db():
    """Get all current preferences from database"""
    session = get_database_connection()
    if not session:
        return None

    try:
        # Get all preference types
        result = session.execute(text("""
            SELECT pt.id, pt.preference_name, pt.data_type, pt.default_value,
                   pt.is_required, pt.is_active, pg.group_name
            FROM preference_types pt
            LEFT JOIN preference_groups pg ON pt.group_id = pg.id
            ORDER BY pt.preference_name
        """))

        preferences = {}
        for row in result:
            preferences[row.preference_name] = {
                'id': row.id,
                'preference_name': row.preference_name,
                'data_type': row.data_type,
                'default_value': row.default_value,
                'is_required': row.is_required,
                'is_active': row.is_active,
                'group_name': row.group_name
            }

        return preferences

    except Exception as e:
        print(f"❌ Failed to get preferences from database: {e}")
        return None
    finally:
        session.close()

def load_gaps_report():
    """Load the gaps report"""
    gaps_file = Path(__file__).parent.parent / 'documentation' / '05-REPORTS' / 'PREFERENCES_GAPS_TABLES.md'

    if not gaps_file.exists():
        print(f"❌ Gaps report not found: {gaps_file}")
        return None

    try:
        with open(gaps_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse the markdown to extract preference lists
        missing_in_db_referenced = []
        missing_in_db_ui = []
        missing_in_db_fallback = []
        missing_critical = []

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
                            missing_in_db_referenced.append(pref)

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
                            missing_in_db_ui.append(pref)

        # Extract "Missing In DB But Present In Fallback Defaults"
        if "## Missing In DB But Present In Fallback Defaults" in content:
            section = content.split("## Missing In DB But Present In Fallback Defaults")[1].split("##")[0]
            lines = section.strip().split('\n')
            for line in lines:
                if '|' in line and 'Preference' not in line:
                    parts = line.split('|')
                    if len(parts) >= 2:
                        pref = parts[1].strip()
                        if pref and pref not in ['---', '']:
                            missing_in_db_fallback.append(pref)

        # Extract "Missing In DB and Fallback (Critical)"
        if "## Missing In DB and Fallback (Critical)" in content:
            section = content.split("## Missing In DB and Fallback (Critical)")[1].split("##")[0]
            lines = section.strip().split('\n')
            for line in lines:
                if '|' in line and 'Preference' not in line:
                    parts = line.split('|')
                    if len(parts) >= 2:
                        pref = parts[1].strip()
                        if pref and pref not in ['---', '']:
                            missing_critical.append(pref)

        return {
            'missing_in_db_referenced': missing_in_db_referenced,
            'missing_in_db_ui': missing_in_db_ui,
            'missing_in_db_fallback': missing_in_db_fallback,
            'missing_critical': missing_critical
        }

    except Exception as e:
        print(f"❌ Failed to load gaps report: {e}")
        return None

def load_fallback_defaults():
    """Load fallback defaults from both JSON file and COLOR_DEFAULTS"""
    # Load JSON defaults
    defaults_file = Path(__file__).parent.parent / 'Backend' / 'config' / 'preferences_defaults.json'

    if not defaults_file.exists():
        print(f"❌ Defaults file not found: {defaults_file}")
        return None

    try:
        with open(defaults_file, 'r', encoding='utf-8') as f:
            json_defaults = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load defaults file: {e}")
        return None

    # Load COLOR_DEFAULTS from models
    try:
        import sys
        sys.path.insert(0, str(Path(__file__).parent.parent / 'Backend'))
        from models.preferences import COLOR_DEFAULTS

        # Merge JSON defaults with COLOR_DEFAULTS
        all_defaults = {**json_defaults, **COLOR_DEFAULTS}
        return all_defaults

    except Exception as e:
        print(f"⚠️  Failed to load COLOR_DEFAULTS: {e}")
        return json_defaults

def flatten_defaults(defaults, prefix=''):
    """Flatten nested defaults structure"""
    flattened = {}

    def _flatten(obj, current_prefix):
        if isinstance(obj, dict):
            for key, value in obj.items():
                new_prefix = f"{current_prefix}.{key}" if current_prefix else key
                if isinstance(value, (dict, list)):
                    _flatten(value, new_prefix)
                else:
                    flattened[key] = value  # Store with simple key, not dotted path
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                new_prefix = f"{current_prefix}[{i}]"
                _flatten(item, new_prefix)
        else:
            flattened[current_prefix] = obj

    _flatten(defaults, prefix)
    return flattened

def audit_preferences():
    """Main audit function"""
    print("🔍 Auditing Current Preferences Database State")
    print("=" * 60)

    # Get current database state
    print("\n📊 Getting current preferences from database...")
    current_db_prefs = get_current_preferences_from_db()
    if current_db_prefs is None:
        print("❌ Failed to get database preferences")
        return

    print(f"✅ Found {len(current_db_prefs)} preferences in database")

    # Load gaps report
    print("\n📋 Loading gaps report...")
    gaps_data = load_gaps_report()
    if gaps_data is None:
        print("❌ Failed to load gaps report")
        return

    # Load fallback defaults
    print("\n📋 Loading fallback defaults...")
    defaults_data = load_fallback_defaults()
    if defaults_data is None:
        print("❌ Failed to load fallback defaults")
        return

    flattened_defaults = flatten_defaults(defaults_data)
    print(f"✅ Found {len(flattened_defaults)} preferences in fallback defaults")

    # Analysis
    print("\n🔍 Analyzing gaps...")

    # Check missing in DB - referenced in code
    missing_referenced = []
    for pref in gaps_data['missing_in_db_referenced']:
        if pref not in current_db_prefs:
            missing_referenced.append(pref)

    # Check missing in DB - present in UI
    missing_ui = []
    for pref in gaps_data['missing_in_db_ui']:
        if pref not in current_db_prefs:
            missing_ui.append(pref)

    # Check missing in DB - present in fallback
    missing_fallback = []
    for pref in gaps_data['missing_in_db_fallback']:
        if pref not in current_db_prefs:
            missing_fallback.append(pref)

    # Check critical missing
    missing_critical = []
    for pref in gaps_data['missing_critical']:
        if pref not in current_db_prefs:
            missing_critical.append(pref)

    # Check which preferences from UI are in defaults but not in DB
    ui_prefs_in_defaults = []
    ui_prefs_not_in_defaults = []
    for pref in gaps_data['missing_in_db_ui']:
        if pref in flattened_defaults:
            ui_prefs_in_defaults.append(pref)
        else:
            ui_prefs_not_in_defaults.append(pref)

    # Results
    print("\n📊 RESULTS:")
    print("=" * 60)

    print(f"\n📈 Current Database State:")
    print(f"   • Total preferences in DB: {len(current_db_prefs)}")

    print(f"\n🚨 Missing Preferences Analysis:")
    print(f"   • Referenced in code but missing in DB: {len(missing_referenced)}")
    print(f"   • Present in UI but missing in DB: {len(missing_ui)}")
    print(f"   • Have fallback but missing in DB: {len(missing_fallback)}")
    print(f"   • Critical (no fallback): {len(missing_critical)}")

    if missing_referenced:
        print(f"\n⚠️  Referenced in code but missing in DB ({len(missing_referenced)}):")
        for pref in missing_referenced:
            print(f"   • {pref}")

    if missing_ui:
        print(f"\n⚠️  Present in UI but missing in DB ({len(missing_ui)}):")
        for pref in missing_ui:
            in_defaults = " (has fallback)" if pref in flattened_defaults else " (no fallback)"
            print(f"   • {pref}{in_defaults}")

    if missing_fallback:
        print(f"\n⚠️  Have fallback but missing in DB ({len(missing_fallback)}):")
        for pref in missing_fallback:
            print(f"   • {pref}")

    if missing_critical:
        print(f"\n🚨 Critical - Missing in DB and no fallback ({len(missing_critical)}):")
        for pref in missing_critical:
            print(f"   • {pref}")

    # Recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    print("=" * 60)

    total_missing = len(missing_referenced) + len(missing_ui) + len(missing_fallback) + len(missing_critical)

    if total_missing == 0:
        print("✅ All preferences from gaps report are already in database!")
        return

    print(f"📋 Need to add {total_missing} preferences to database:")

    if missing_critical:
        print(f"\n🚨 CRITICAL PRIORITY ({len(missing_critical)} preferences):")
        print("   These are referenced in code but have no fallback defaults.")
        print("   Must be added to both database AND fallback defaults.")
        for pref in missing_critical:
            print(f"   • {pref}")

    if missing_referenced:
        print(f"\n⚠️  HIGH PRIORITY ({len(missing_referenced)} preferences):")
        print("   These are referenced in code. Check if they have fallbacks.")
        for pref in missing_referenced:
            has_fallback = pref in flattened_defaults
            status = "has fallback" if has_fallback else "NEEDS fallback"
            print(f"   • {pref} ({status})")

    if missing_ui:
        print(f"\n📋 MEDIUM PRIORITY ({len(missing_ui)} preferences):")
        print("   These appear in the UI. Most should have fallbacks.")
        in_defaults_count = sum(1 for pref in missing_ui if pref in flattened_defaults)
        print(f"   {in_defaults_count}/{len(missing_ui)} already have fallback defaults")
        for pref in missing_ui:
            has_fallback = pref in flattened_defaults
            status = "has fallback" if has_fallback else "NEEDS fallback"
            print(f"   • {pref} ({status})")

    if missing_fallback:
        print(f"\n📋 LOW PRIORITY ({len(missing_fallback)} preferences):")
        print("   These have fallback defaults but are missing from DB.")
        for pref in missing_fallback:
            print(f"   • {pref}")

    print(f"\n🎯 NEXT STEPS:")
    print("1. Add critical preferences to both DB and fallback defaults")
    print("2. Add high priority preferences to database")
    print("3. Add medium priority preferences to database")
    print("4. Add low priority preferences to database")
    print("5. Run Selenium tests to verify all preferences work")
    print("6. Update gaps report with new status")

if __name__ == "__main__":
    audit_preferences()
