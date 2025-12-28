#!/usr/bin/env python3
"""
Add All Missing Preferences to Database
========================================

This script adds all missing preferences identified in the gaps report.
It categorizes them by priority and adds appropriate defaults.

Priority order:
1. Critical (referenced in code, no fallback) - Already added
2. High (referenced in code, may have fallback)
3. Medium (appear in UI)
4. Low (have fallback but missing in DB)
"""

import sys
import os
from pathlib import Path
import json

# Add Backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'Backend'))

from config.database import SessionLocal
from sqlalchemy import text

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

        return {
            'referenced_in_code': missing_in_db_referenced,
            'present_in_ui': missing_in_db_ui
        }

    except Exception as e:
        print(f"❌ Failed to load gaps report: {e}")
        return None

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

def define_preferences_to_add():
    """Define all preferences to add with their properties"""

    preferences_to_add = [
        # HIGH PRIORITY - Referenced in code
        {
            'name': 'defaultCommission',
            'data_type': 'number',
            'default_value': '1.0',
            'group_id': 10,  # trading_settings
            'description': 'Default commission for trades'
        },
        {
            'name': 'notification_mode',
            'data_type': 'string',
            'default_value': 'work',
            'group_id': 15,  # notification_settings
            'description': 'Default notification mode (debug/development/work/silent)'
        },

        # MEDIUM PRIORITY - Present in UI (colors)
        {
            'name': 'primaryColor',
            'data_type': 'string',
            'default_value': '#26baac',
            'group_id': 21,  # colors_unified
            'description': 'Primary theme color'
        },
        {
            'name': 'secondaryColor',
            'data_type': 'string',
            'default_value': '#fc5a06',
            'group_id': 21,  # colors_unified
            'description': 'Secondary theme color'
        },
        {
            'name': 'successColor',
            'data_type': 'string',
            'default_value': '#28a745',
            'group_id': 21,  # colors_unified
            'description': 'Success status color'
        },
        {
            'name': 'warningColor',
            'data_type': 'string',
            'default_value': '#ffc107',
            'group_id': 21,  # colors_unified
            'description': 'Warning status color'
        },
        {
            'name': 'dangerColor',
            'data_type': 'string',
            'default_value': '#dc3545',
            'group_id': 21,  # colors_unified
            'description': 'Danger/error color'
        },
        {
            'name': 'infoColor',
            'data_type': 'string',
            'default_value': '#17a2b8',
            'group_id': 21,  # colors_unified
            'description': 'Information color'
        },
        {
            'name': 'linkColor',
            'data_type': 'string',
            'default_value': '#007bff',
            'group_id': 21,  # colors_unified
            'description': 'Link color'
        },
        {
            'name': 'backgroundColor',
            'data_type': 'string',
            'default_value': '#ffffff',
            'group_id': 21,  # colors_unified
            'description': 'Background color'
        },
        {
            'name': 'textColor',
            'data_type': 'string',
            'default_value': '#333333',
            'group_id': 21,  # colors_unified
            'description': 'Text color'
        },
        {
            'name': 'borderColor',
            'data_type': 'string',
            'default_value': '#dee2e6',
            'group_id': 21,  # colors_unified
            'description': 'Border color'
        },
        {
            'name': 'highlightColor',
            'data_type': 'string',
            'default_value': '#fff3cd',
            'group_id': 21,  # colors_unified
            'description': 'Highlight color'
        },
        {
            'name': 'shadowColor',
            'data_type': 'string',
            'default_value': '#000000',
            'group_id': 21,  # colors_unified
            'description': 'Shadow color'
        },

        # Status colors
        {
            'name': 'statusCancelledColor',
            'data_type': 'string',
            'default_value': '#dc3545',
            'group_id': 21,  # colors_unified
            'description': 'Cancelled status color'
        },
        {
            'name': 'statusClosedColor',
            'data_type': 'string',
            'default_value': '#6c757d',
            'group_id': 21,  # colors_unified
            'description': 'Closed status color'
        },

        # Entity colors (additional ones not already in COLOR_DEFAULTS)
        {
            'name': 'entityAlertColor',
            'data_type': 'string',
            'default_value': '#ff9800',
            'group_id': 21,  # colors_unified
            'description': 'Alert entity color'
        },
        {
            'name': 'entityAlertColorDark',
            'data_type': 'string',
            'default_value': '#f57c00',
            'group_id': 21,  # colors_unified
            'description': 'Alert entity dark color'
        },
        {
            'name': 'entityAlertColorLight',
            'data_type': 'string',
            'default_value': '#ffb74d',
            'group_id': 21,  # colors_unified
            'description': 'Alert entity light color'
        },
        {
            'name': 'entityNoteColor',
            'data_type': 'string',
            'default_value': '#607d8b',
            'group_id': 21,  # colors_unified
            'description': 'Note entity color'
        },
        {
            'name': 'entityNoteColorDark',
            'data_type': 'string',
            'default_value': '#455a64',
            'group_id': 21,  # colors_unified
            'description': 'Note entity dark color'
        },
        {
            'name': 'entityNoteColorLight',
            'data_type': 'string',
            'default_value': '#90a4ae',
            'group_id': 21,  # colors_unified
            'description': 'Note entity light color'
        },
        {
            'name': 'entityPreferencesColor',
            'data_type': 'string',
            'default_value': '#607d8b',
            'group_id': 21,  # colors_unified
            'description': 'Preferences entity color'
        },
        {
            'name': 'entityPreferencesColorDark',
            'data_type': 'string',
            'default_value': '#455a64',
            'group_id': 21,  # colors_unified
            'description': 'Preferences entity dark color'
        },
        {
            'name': 'entityPreferencesColorLight',
            'data_type': 'string',
            'default_value': '#90a4ae',
            'group_id': 21,  # colors_unified
            'description': 'Preferences entity light color'
        },
        {
            'name': 'entityResearchColor',
            'data_type': 'string',
            'default_value': '#9c27b0',
            'group_id': 21,  # colors_unified
            'description': 'Research entity color'
        },
        {
            'name': 'entityResearchColorDark',
            'data_type': 'string',
            'default_value': '#7b1fa2',
            'group_id': 21,  # colors_unified
            'description': 'Research entity dark color'
        },
        {
            'name': 'entityResearchColorLight',
            'data_type': 'string',
            'default_value': '#ba68c8',
            'group_id': 21,  # colors_unified
            'description': 'Research entity light color'
        },
        {
            'name': 'entityTickerColor',
            'data_type': 'string',
            'default_value': '#17a2b8',
            'group_id': 21,  # colors_unified
            'description': 'Ticker entity color'
        },
        {
            'name': 'entityTickerColorDark',
            'data_type': 'string',
            'default_value': '#138496',
            'group_id': 21,  # colors_unified
            'description': 'Ticker entity dark color'
        },
        {
            'name': 'entityTickerColorLight',
            'data_type': 'string',
            'default_value': '#20c997',
            'group_id': 21,  # colors_unified
            'description': 'Ticker entity light color'
        },
        {
            'name': 'entityTradeColor',
            'data_type': 'string',
            'default_value': '#26baac',
            'group_id': 21,  # colors_unified
            'description': 'Trade entity color'
        },
        {
            'name': 'entityTradeColorDark',
            'data_type': 'string',
            'default_value': '#1a8f83',
            'group_id': 21,  # colors_unified
            'description': 'Trade entity dark color'
        },
        {
            'name': 'entityTradeColorLight',
            'data_type': 'string',
            'default_value': '#6ed8ca',
            'group_id': 21,  # colors_unified
            'description': 'Trade entity light color'
        },
        {
            'name': 'entityTradePlanColor',
            'data_type': 'string',
            'default_value': '#9c27b0',
            'group_id': 21,  # colors_unified
            'description': 'Trade plan entity color'
        },
        {
            'name': 'entityTradePlanColorDark',
            'data_type': 'string',
            'default_value': '#7b1fa2',
            'group_id': 21,  # colors_unified
            'description': 'Trade plan entity dark color'
        },
        {
            'name': 'entityTradePlanColorLight',
            'data_type': 'string',
            'default_value': '#ba68c8',
            'group_id': 21,  # colors_unified
            'description': 'Trade plan entity light color'
        },
        {
            'name': 'entityTradingAccountColorDark',
            'data_type': 'string',
            'default_value': '#1e7e34',
            'group_id': 21,  # colors_unified
            'description': 'Trading account entity dark color'
        },
        {
            'name': 'entityTradingAccountColorLight',
            'data_type': 'string',
            'default_value': '#34ce57',
            'group_id': 21,  # colors_unified
            'description': 'Trading account entity light color'
        },
        {
            'name': 'entityExecutionColor',
            'data_type': 'string',
            'default_value': '#6f42c1',
            'group_id': 21,  # colors_unified
            'description': 'Execution entity color'
        },
        {
            'name': 'entityExecutionColorDark',
            'data_type': 'string',
            'default_value': '#5a2d91',
            'group_id': 21,  # colors_unified
            'description': 'Execution entity dark color'
        },
        {
            'name': 'entityExecutionColorLight',
            'data_type': 'string',
            'default_value': '#8e44ad',
            'group_id': 21,  # colors_unified
            'description': 'Execution entity light color'
        },
        {
            'name': 'entityCashFlowColor',
            'data_type': 'string',
            'default_value': '#20c997',
            'group_id': 21,  # colors_unified
            'description': 'Cash flow entity color'
        },
        {
            'name': 'entityCashFlowColorDark',
            'data_type': 'string',
            'default_value': '#138496',
            'group_id': 21,  # colors_unified
            'description': 'Cash flow entity dark color'
        },
        {
            'name': 'entityCashFlowColorLight',
            'data_type': 'string',
            'default_value': '#20c997',
            'group_id': 21,  # colors_unified
            'description': 'Cash flow entity light color'
        },

        # MEDIUM PRIORITY - Present in UI (filters)
        {
            'name': 'defaultStatusFilter',
            'data_type': 'string',
            'default_value': 'open',
            'group_id': 11,  # filter_settings
            'description': 'Default status filter for lists'
        },
        {
            'name': 'defaultTypeFilter',
            'data_type': 'string',
            'default_value': 'swing',
            'group_id': 11,  # filter_settings
            'description': 'Default type filter for lists'
        },
        {
            'name': 'defaultDateRangeFilter',
            'data_type': 'string',
            'default_value': 'this_week',
            'group_id': 11,  # filter_settings
            'description': 'Default date range filter'
        },
        {
            'name': 'defaultSearchFilter',
            'data_type': 'string',
            'default_value': '',
            'group_id': 11,  # filter_settings
            'description': 'Default search filter text'
        },

        # MEDIUM PRIORITY - Present in UI (notifications)
        {
            'name': 'enableNotifications',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 15,  # notification_settings
            'description': 'Enable notification system'
        },
        {
            'name': 'notificationSound',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 15,  # notification_settings
            'description': 'Play sound for notifications'
        },
        {
            'name': 'notificationPopup',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 15,  # notification_settings
            'description': 'Show popup notifications'
        },
        {
            'name': 'notificationDuration',
            'data_type': 'number',
            'default_value': '5',
            'group_id': 15,  # notification_settings
            'description': 'Notification display duration in seconds'
        },
        {
            'name': 'notificationMaxHistory',
            'data_type': 'number',
            'default_value': '50',
            'group_id': 15,  # notification_settings
            'description': 'Maximum notifications in history'
        },
        {
            'name': 'enableRealtimeNotifications',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 15,  # notification_settings
            'description': 'Enable realtime notifications'
        },
        {
            'name': 'enableBackgroundTaskNotifications',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 15,  # notification_settings
            'description': 'Enable background task notifications'
        },
        {
            'name': 'enableExternalDataNotifications',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 15,  # notification_settings
            'description': 'Enable external data notifications'
        },
        {
            'name': 'notifications_general_enabled',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 15,  # notification_settings
            'description': 'Enable general notifications'
        },
        {
            'name': 'notifyOnTradeExecuted',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 15,  # notification_settings
            'description': 'Notify when trade is executed'
        },
        {
            'name': 'notifyOnStopLoss',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 15,  # notification_settings
            'description': 'Notify when stop loss is triggered'
        },

        # MEDIUM PRIORITY - Present in UI (UI settings)
        {
            'name': 'theme',
            'data_type': 'string',
            'default_value': 'light',
            'group_id': 16,  # ui_settings
            'description': 'UI theme (light/dark/auto)'
        },
        {
            'name': 'tablePageSize',
            'data_type': 'number',
            'default_value': '25',
            'group_id': 16,  # ui_settings
            'description': 'Default table page size'
        },
        {
            'name': 'showAnimations',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 16,  # ui_settings
            'description': 'Show UI animations'
        },
        {
            'name': 'compactMode',
            'data_type': 'boolean',
            'default_value': 'false',
            'group_id': 16,  # ui_settings
            'description': 'Use compact UI mode'
        },

        # MEDIUM PRIORITY - Present in UI (logging)
        {
            'name': 'console_logs_development_enabled',
            'data_type': 'boolean',
            'default_value': 'false',
            'group_id': 16,  # ui_settings
            'description': 'Enable development console logs'
        },
        {
            'name': 'console_logs_ui_enabled',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 16,  # ui_settings
            'description': 'Enable UI console logs'
        },
        {
            'name': 'console_logs_cache_enabled',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 16,  # ui_settings
            'description': 'Enable cache console logs'
        },
        {
            'name': 'console_logs_initialization_enabled',
            'data_type': 'boolean',
            'default_value': 'false',
            'group_id': 16,  # ui_settings
            'description': 'Enable initialization console logs'
        },
        {
            'name': 'console_logs_notifications_enabled',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 16,  # ui_settings
            'description': 'Enable notifications console logs'
        },
        {
            'name': 'console_logs_ui_components_enabled',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 16,  # ui_settings
            'description': 'Enable UI components console logs'
        },

        # MEDIUM PRIORITY - Present in UI (notification modes)
        {
            'name': 'modeDebug',
            'data_type': 'boolean',
            'default_value': 'false',
            'group_id': 15,  # notification_settings
            'description': 'Debug notification mode'
        },
        {
            'name': 'modeDevelopment',
            'data_type': 'boolean',
            'default_value': 'false',
            'group_id': 15,  # notification_settings
            'description': 'Development notification mode'
        },
        {
            'name': 'modeWork',
            'data_type': 'boolean',
            'default_value': 'true',
            'group_id': 15,  # notification_settings
            'description': 'Work notification mode'
        },
        {
            'name': 'modeSilent',
            'data_type': 'boolean',
            'default_value': 'false',
            'group_id': 15,  # notification_settings
            'description': 'Silent notification mode'
        },

        # MEDIUM PRIORITY - Present in UI (profile management)
        {
            'name': 'profileSelect',
            'data_type': 'string',
            'default_value': '',
            'group_id': 9,  # basic_settings
            'description': 'Selected profile for switching'
        },
        {
            'name': 'newProfileName',
            'data_type': 'string',
            'default_value': '',
            'group_id': 9,  # basic_settings
            'description': 'Name for new profile creation'
        },
        {
            'name': 'deleteProfileSelect',
            'data_type': 'string',
            'default_value': '',
            'group_id': 9,  # basic_settings
            'description': 'Selected profile for deletion'
        },
    ]

    return preferences_to_add

def add_preferences_to_database(preferences):
    """Add preferences to database"""
    session = SessionLocal()

    try:
        added_count = 0

        for pref in preferences:
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

            print(f"✅ Added preference: {pref['name']} (default: {pref['default_value']})")
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

def add_fallbacks_to_json_defaults(preferences):
    """Add fallbacks to JSON defaults file"""
    defaults_file = Path(__file__).parent.parent / 'Backend' / 'config' / 'preferences_defaults.json'

    try:
        with open(defaults_file, 'r', encoding='utf-8') as f:
            defaults = json.load(f)

        # Add missing fallbacks
        added_fallbacks = 0

        # Group preferences by category for organization
        color_prefs = {}
        ui_prefs = {}
        notification_prefs = {}
        filter_prefs = {}

        for pref in preferences:
            if 'color' in pref['name'].lower() or pref['name'].endswith('Color'):
                color_prefs[pref['name']] = pref['default_value']
            elif pref['name'].startswith('console_logs_') or pref['name'] in ['theme', 'tablePageSize', 'showAnimations', 'compactMode']:
                ui_prefs[pref['name']] = pref['default_value']
            elif 'notification' in pref['name'] or 'notify' in pref['name'] or pref['name'].startswith('mode'):
                notification_prefs[pref['name']] = pref['default_value']
            elif 'filter' in pref['name'] or 'profile' in pref['name']:
                filter_prefs[pref['name']] = pref['default_value']

        # Add to appropriate sections
        if color_prefs:
            if 'colorScheme' not in defaults:
                defaults['colorScheme'] = {}
            defaults['colorScheme'].update(color_prefs)
            added_fallbacks += len(color_prefs)

        if ui_prefs:
            if 'ui' not in defaults:
                defaults['ui'] = {}
            defaults['ui'].update(ui_prefs)
            added_fallbacks += len(ui_prefs)

        if notification_prefs:
            if 'notifications' not in defaults:
                defaults['notifications'] = {}
            if 'categories' not in defaults['notifications']:
                defaults['notifications']['categories'] = {}
            defaults['notifications']['categories'].update(notification_prefs)
            added_fallbacks += len(notification_prefs)

        if filter_prefs:
            if 'defaultFilters' not in defaults:
                defaults['defaultFilters'] = {}
            defaults['defaultFilters'].update(filter_prefs)
            added_fallbacks += len(filter_prefs)

        # Save updated defaults
        with open(defaults_file, 'w', encoding='utf-8') as f:
            json.dump(defaults, f, indent=2, ensure_ascii=False)

        print(f"✅ Added {added_fallbacks} fallback defaults to JSON file")

    except Exception as e:
        print(f"❌ Error adding fallbacks to JSON: {e}")
        return False

    return True

def main():
    """Main execution"""
    print("🚀 Adding All Missing Preferences")
    print("=" * 50)

    # Load gaps report
    print("\n📋 Loading gaps report...")
    gaps_data = load_gaps_report()
    if not gaps_data:
        return False

    print(f"Found {len(gaps_data['referenced_in_code'])} referenced in code")
    print(f"Found {len(gaps_data['present_in_ui'])} present in UI")

    # Get existing preferences
    print("\n📊 Checking existing preferences...")
    existing_prefs = get_existing_preferences()
    print(f"Found {len(existing_prefs)} existing preferences in database")

    # Define preferences to add
    print("\n📝 Defining preferences to add...")
    all_prefs_to_add = define_preferences_to_add()

    # Filter out already existing ones
    prefs_to_add = [p for p in all_prefs_to_add if p['name'] not in existing_prefs]

    print(f"Will add {len(prefs_to_add)} new preferences")

    if not prefs_to_add:
        print("✅ All preferences already exist in database!")
        return True

    # Add to database
    print("\n🗄️  Adding preferences to database...")
    if not add_preferences_to_database(prefs_to_add):
        return False

    # Add fallbacks
    print("\n📄 Adding fallback defaults...")
    if not add_fallbacks_to_json_defaults(prefs_to_add):
        return False

    print("\n🎉 Successfully added all missing preferences!")
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n💥 Failed to add missing preferences!")
        sys.exit(1)
