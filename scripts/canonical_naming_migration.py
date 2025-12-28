#!/usr/bin/env python3
"""
Canonical Naming Migration Script
=================================

This script implements the canonical naming requirements from the execution plan:

1. Replace defaultAccountFilter with default_trading_account everywhere
2. Align default_currency with primaryCurrency

Usage:
    python3 scripts/canonical_naming_migration.py
"""

import sys
import os
from pathlib import Path
import json

# Add Backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / 'Backend'))

def migrate_database_naming():
    """Migrate database: remove defaultAccountFilter, keep default_trading_account"""
    log("🗄️ Migrating database naming...")

    try:
        from config.database import SessionLocal
        from sqlalchemy import text

        session = SessionLocal()

        # Check if defaultAccountFilter exists
        result = session.execute(text("SELECT id FROM preference_types WHERE preference_name = 'defaultAccountFilter'"))
        exists = result.fetchone()

        if exists:
            log("⚠️ Found defaultAccountFilter in database - removing it")

            # Migrate any user preferences from old name to new name
            migrate_result = session.execute(text("""
                UPDATE user_preferences
                SET preference_id = (
                    SELECT id FROM preference_types WHERE preference_name = 'default_trading_account'
                )
                WHERE preference_id = (
                    SELECT id FROM preference_types WHERE preference_name = 'defaultAccountFilter'
                )
            """))

            log(f"✅ Migrated {migrate_result.rowcount} user preferences from defaultAccountFilter to default_trading_account")

            # Remove the old preference type
            session.execute(text("DELETE FROM preference_types WHERE preference_name = 'defaultAccountFilter'"))
            log("✅ Removed defaultAccountFilter from preference_types")

        # Ensure default_trading_account exists
        result = session.execute(text("SELECT id FROM preference_types WHERE preference_name = 'default_trading_account'"))
        if not result.fetchone():
            log("❌ default_trading_account not found in database!")
            return False

        session.commit()
        session.close()

        log("✅ Database migration completed successfully")
        return True

    except Exception as e:
        log(f"❌ Database migration failed: {e}")
        return False

def migrate_currency_alignment():
    """Align default_currency with primaryCurrency"""
    log("💱 Migrating currency alignment...")

    # Decision: Remove default_currency and use primaryCurrency everywhere
    # This is the cleaner approach since primaryCurrency is already established

    try:
        from config.database import SessionLocal
        from sqlalchemy import text

        session = SessionLocal()

        # Check if default_currency exists
        result = session.execute(text("SELECT id FROM preference_types WHERE preference_name = 'default_currency'"))
        exists = result.fetchone()

        if exists:
            log("⚠️ Found default_currency in database - removing it")

            # Migrate any user preferences from default_currency to primaryCurrency
            migrate_result = session.execute(text("""
                UPDATE user_preferences
                SET preference_id = (
                    SELECT id FROM preference_types WHERE preference_name = 'primaryCurrency'
                )
                WHERE preference_id = (
                    SELECT id FROM preference_types WHERE preference_name = 'default_currency'
                )
            """))

            log(f"✅ Migrated {migrate_result.rowcount} user preferences from default_currency to primaryCurrency")

            # Remove the old preference type
            session.execute(text("DELETE FROM preference_types WHERE preference_name = 'default_currency'"))
            log("✅ Removed default_currency from preference_types")

        # Ensure primaryCurrency exists
        result = session.execute(text("SELECT id FROM preference_types WHERE preference_name = 'primaryCurrency'"))
        if not result.fetchone():
            log("❌ primaryCurrency not found in database!")
            return False

        session.commit()
        session.close()

        log("✅ Currency alignment completed successfully")
        return True

    except Exception as e:
        log(f"❌ Currency alignment failed: {e}")
        return False

def update_configuration_files():
    """Update configuration files to remove old preference names"""
    log("📝 Updating configuration files...")

    # Update preferences_defaults.json
    defaults_file = Path(__file__).parent.parent / 'Backend' / 'config' / 'preferences_defaults.json'

    try:
        with open(defaults_file, 'r', encoding='utf-8') as f:
            defaults = json.load(f)

        # Remove old names from defaults
        if 'general' in defaults:
            defaults['general'].pop('default_currency', None)

        # Save updated defaults
        with open(defaults_file, 'w', encoding='utf-8') as f:
            json.dump(defaults, f, indent=2, ensure_ascii=False)

        log("✅ Updated preferences_defaults.json")

    except Exception as e:
        log(f"❌ Failed to update configuration files: {e}")
        return False

    return True

def log(message, level="INFO"):
    """Log with timestamp"""
    import datetime
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def main():
    """Main migration function"""
    log("="*80)
    log("🔄 CANONICAL NAMING MIGRATION")
    log("="*80)
    log("Following Execution Plan from PREFERENCES_GAPS_TABLES.md")
    log("")

    # Step 1: Migrate account filter naming
    log("📋 STEP 1: Account Filter Canonical Naming")
    log("- Replace defaultAccountFilter with default_trading_account everywhere")
    if not migrate_database_naming():
        log("❌ Account filter migration failed!")
        return False

    print()

    # Step 2: Align currency naming
    log("📋 STEP 2: Currency Alignment")
    log("- Align default_currency with primaryCurrency (remove default_currency)")
    if not migrate_currency_alignment():
        log("❌ Currency alignment failed!")
        return False

    print()

    # Step 3: Update configuration
    log("📋 STEP 3: Configuration Updates")
    log("- Remove old preference names from configuration files")
    if not update_configuration_files():
        log("❌ Configuration update failed!")
        return False

    print()

    log("🎉 CANONICAL NAMING MIGRATION COMPLETED SUCCESSFULLY!")
    log("")
    log("Summary of Changes:")
    log("• ✅ Removed defaultAccountFilter from database")
    log("• ✅ Migrated user preferences to default_trading_account")
    log("• ✅ Removed default_currency from database")
    log("• ✅ Migrated user preferences to primaryCurrency")
    log("• ✅ Updated configuration files")
    log("")
    log("Next Steps:")
    log("• Update frontend code to remove fallback references")
    log("• Test that all functionality still works")
    log("• Update documentation")

    return True

if __name__ == "__main__":
    success = main()
    if not success:
        log("💥 MIGRATION FAILED!")
        sys.exit(1)
    else:
        log("✅ MIGRATION COMPLETED SUCCESSFULLY!")
