#!/usr/bin/env python3
"""
TikTrack Database Recreation Script with Base Data
===================================================

🎯 Purpose: Create a fresh database with complete structure and base reference data
📍 Location: Backend/scripts/recreate_database_with_base_data.py
🔧 Usage: python3 Backend/scripts/recreate_database_with_base_data.py [--db-path PATH]

✅ Creates all tables with proper structure (100% identical to current)
✅ Adds all constraints, relationships, triggers, and indexes
✅ Inserts base reference data (currencies, users, trading methods, etc.)
✅ Leaves trading data tables empty (trades, executions, cash_flows, etc.)

⚠️  WARNING: This will DELETE the existing database and create a new one!
"""

import sqlite3
import os
import sys
import shutil
import argparse
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from migrations.seed_conditions_master_data import METHODS_DEFINITION  # noqa: E402

# Default database path
DEFAULT_DB_PATH = "Backend/db/tiktrack.db"


class DatabaseRecreator:
    """Recreates database with structure and base data only"""
    
    def __init__(self, source_db_path: str, target_db_path: str = None):
        """
        Initialize database recreator
        
        Args:
            source_db_path: Path to source database to copy structure and base data from
            target_db_path: Path to target database (defaults to source_db_path)
        """
        self.source_db_path = source_db_path
        self.target_db_path = target_db_path or source_db_path
        self.backup_path = f"{self.target_db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
    def backup_existing_database(self):
        """Create backup of existing database if it exists"""
        if os.path.exists(self.target_db_path):
            print(f"📦 Creating backup: {self.backup_path}")
            shutil.copy2(self.target_db_path, self.backup_path)
            print("✅ Backup created successfully")
        else:
            print("ℹ️  No existing database found, proceeding with fresh creation")
    
    def get_source_connection(self):
        """Get connection to source database"""
        if not os.path.exists(self.source_db_path):
            raise FileNotFoundError(f"Source database not found: {self.source_db_path}")
        return sqlite3.connect(self.source_db_path)
    
    def get_target_connection(self):
        """Get connection to target database"""
        # Remove existing target database
        if os.path.exists(self.target_db_path):
            os.remove(self.target_db_path)
            print(f"🗑️  Removed existing database: {self.target_db_path}")
        
        return sqlite3.connect(self.target_db_path)
    
    def copy_schema(self, source_conn, target_conn):
        """Copy complete database schema from source to target"""
        print("📋 Copying database schema...")
        
        source_cursor = source_conn.cursor()
        target_cursor = target_conn.cursor()
        
        # Enable foreign keys
        target_cursor.execute("PRAGMA foreign_keys = ON")
        
        # Get all CREATE TABLE statements
        source_cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL")
        table_schemas = source_cursor.fetchall()
        
        # Filter out system tables, backup tables, and tables we don't want
        excluded_tables = [
            'sqlite_sequence', 
            'sqlite_stat1', 
            'tickers_backup', 
            'tickers_new',
            'tag_categories',  # Empty - don't create
            'user_preferences_v3',  # Not in use - don't create
        ]
        
        for (schema,) in table_schemas:
            if schema:
                # Check if this is an excluded table
                table_name = None
                for excluded in excluded_tables:
                    if f"CREATE TABLE {excluded}" in schema or f"CREATE TABLE IF NOT EXISTS {excluded}" in schema:
                        table_name = excluded
                        break
                
                if table_name in excluded_tables:
                    print(f"⏭️  Skipping excluded table: {table_name}")
                    continue
                
                try:
                    target_cursor.execute(schema)
                    print(f"✅ Created table from schema")
                except sqlite3.OperationalError as e:
                    if "already exists" not in str(e):
                        print(f"⚠️  Warning creating table: {e}")
        
        # Copy all triggers
        source_cursor.execute("SELECT sql FROM sqlite_master WHERE type='trigger' AND sql IS NOT NULL")
        trigger_schemas = source_cursor.fetchall()
        
        for (schema,) in trigger_schemas:
            if schema:
                try:
                    target_cursor.execute(schema)
                    print(f"✅ Created trigger")
                except sqlite3.OperationalError as e:
                    if "already exists" not in str(e):
                        print(f"⚠️  Warning creating trigger: {e}")
        
        # Copy all indexes (excluding auto-created ones)
        source_cursor.execute("""
            SELECT sql FROM sqlite_master 
            WHERE type='index' 
            AND sql IS NOT NULL 
            AND name NOT LIKE 'sqlite_autoindex_%'
        """)
        index_schemas = source_cursor.fetchall()
        
        for (schema,) in index_schemas:
            if schema:
                try:
                    target_cursor.execute(schema)
                    print(f"✅ Created index")
                except sqlite3.OperationalError as e:
                    if "already exists" not in str(e):
                        print(f"⚠️  Warning creating index: {e}")
        
        target_conn.commit()
        print("✅ Schema copied successfully")
    
    def copy_base_data(self, source_conn, target_conn):
        """Copy base reference data from source to target"""
        print("📝 Copying base reference data...")
        
        source_cursor = source_conn.cursor()
        target_cursor = target_conn.cursor()
        
        # Store target_db_path for use in special table copying
        self._target_db_path_for_copy = self.target_db_path
        
        # Enable foreign keys
        target_cursor.execute("PRAGMA foreign_keys = ON")
        
        # Phase 1: Independent base tables (no foreign key dependencies)
        PHASE1_TABLES = [
            'currencies',
            'note_relation_types',
            'external_data_providers',
            'trading_methods',
            'preference_groups',
            'system_setting_groups',
            'constraints',
        ]
        
        # Phase 2: Tables that depend on Phase 1
        PHASE2_TABLES = [
            'method_parameters',  # depends on trading_methods
            'preference_types',  # depends on preference_groups
            'system_setting_types',  # depends on system_setting_groups
            'enum_values',  # depends on constraints
            'constraint_validations',  # depends on constraints
        ]
        
        # Phase 3: Users (needed before preference_profiles)
        # This will be handled by _copy_special_tables for users
        
        # Phase 4: Tables that depend on users
        PHASE4_TABLES = [
            'preference_profiles',  # depends on users
        ]
        
        # Phase 5: Tables that depend on preference_profiles
        # This will be handled by _copy_special_tables for user_preferences
        
        # Tables to leave empty (trading data and main records)
        EMPTY_TABLES = [
            'trades',
            'trade_plans',
            'executions',
            'cash_flows',
            'alerts',
            'notes',
            'plan_conditions',
            'trade_conditions',
            'condition_alerts_mapping',
            'market_data_quotes',
            'data_refresh_logs',
            'intraday_data_slots',
            'import_sessions',
            'trading_accounts',
            'tags',
            'tag_links',
            'quotes_last',
            'preferences_legacy',
            'system_settings',
            'lost_and_found',
        ]
        
        # Tables to skip (not needed)
        SKIP_TABLES = [
            'tag_categories',  # Empty - don't create
            'user_preferences_v3',  # Not in use - don't create
        ]
        
        # Enable foreign keys for Phase 1
        target_cursor.execute("PRAGMA foreign_keys = ON")
        
        # Copy Phase 1 tables (independent)
        for table in PHASE1_TABLES:
            try:
                # Check if table exists in source
                source_cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                if not source_cursor.fetchone():
                    print(f"⏭️  Skipping {table} - table does not exist in source")
                    continue
                
                # Get all data from source
                source_cursor.execute(f"SELECT * FROM {table}")
                rows = source_cursor.fetchall()
                
                if not rows:
                    # For structure tables, still create empty table
                    if table in ['system_setting_types', 'constraint_validations']:
                        print(f"ℹ️  {table} is empty in source - table structure created (empty)")
                    else:
                        print(f"ℹ️  {table} is empty in source - skipping")
                    continue
                
                # Get column names
                source_cursor.execute(f"PRAGMA table_info({table})")
                columns = [col[1] for col in source_cursor.fetchall()]
                
                # Insert data into target
                placeholders = ','.join(['?' for _ in columns])
                column_names = ','.join(columns)
                
                target_cursor.executemany(
                    f"INSERT INTO {table} ({column_names}) VALUES ({placeholders})",
                    rows
                )
                
                print(f"✅ Copied {len(rows)} rows from {table}")
                
            except sqlite3.OperationalError as e:
                print(f"⚠️  Warning copying {table}: {e}")
            except Exception as e:
                print(f"❌ Error copying {table}: {e}")
        
        # Copy Phase 2 tables (depend on Phase 1)
        for table in PHASE2_TABLES:
            try:
                # Check if table exists in source
                source_cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                if not source_cursor.fetchone():
                    print(f"⏭️  Skipping {table} - table does not exist in source")
                    continue
                
                # Special handling for enum_values - only copy values for existing constraints
                if table == 'enum_values':
                    # Get all constraint IDs that exist in target
                    target_cursor.execute("SELECT id FROM constraints")
                    constraint_ids = [row[0] for row in target_cursor.fetchall()]
                    if constraint_ids:
                        constraint_ids_str = ','.join(map(str, constraint_ids))
                        source_cursor.execute(
                            f"SELECT * FROM enum_values WHERE constraint_id IN ({constraint_ids_str})"
                        )
                        rows = source_cursor.fetchall()
                    else:
                        rows = []
                else:
                    # Get all data from source
                    source_cursor.execute(f"SELECT * FROM {table}")
                    rows = source_cursor.fetchall()
                
                if not rows:
                    # For structure tables, still create empty table
                    if table in ['system_setting_types', 'constraint_validations']:
                        print(f"ℹ️  {table} is empty in source - table structure created (empty)")
                    else:
                        print(f"ℹ️  {table} is empty in source (after filtering) - skipping")
                    continue
                
                # Get column names
                source_cursor.execute(f"PRAGMA table_info({table})")
                columns = [col[1] for col in source_cursor.fetchall()]
                
                # Insert data into target
                placeholders = ','.join(['?' for _ in columns])
                column_names = ','.join(columns)
                
                target_cursor.executemany(
                    f"INSERT INTO {table} ({column_names}) VALUES ({placeholders})",
                    rows
                )
                
                print(f"✅ Copied {len(rows)} rows from {table}")
                
            except sqlite3.OperationalError as e:
                print(f"⚠️  Warning copying {table}: {e}")
            except Exception as e:
                print(f"❌ Error copying {table}: {e}")
        
        # Copy users first (needed for preference_profiles)
        self._copy_users(source_cursor, target_cursor)
        
        # Copy Phase 4 tables (depend on users)
        for table in PHASE4_TABLES:
            try:
                # Check if table exists in source
                source_cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
                if not source_cursor.fetchone():
                    print(f"⏭️  Skipping {table} - table does not exist in source")
                    continue
                
                # Special handling for preference_profiles - only copy profiles for user_id=1
                if table == 'preference_profiles':
                    source_cursor.execute("SELECT * FROM preference_profiles WHERE user_id = 1")
                    rows = source_cursor.fetchall()
                else:
                    # Get all data from source
                    source_cursor.execute(f"SELECT * FROM {table}")
                    rows = source_cursor.fetchall()
                
                if not rows:
                    print(f"ℹ️  {table} is empty in source (after filtering) - skipping")
                    continue
                
                # Get column names
                source_cursor.execute(f"PRAGMA table_info({table})")
                columns = [col[1] for col in source_cursor.fetchall()]
                
                # Insert data into target
                placeholders = ','.join(['?' for _ in columns])
                column_names = ','.join(columns)
                
                target_cursor.executemany(
                    f"INSERT INTO {table} ({column_names}) VALUES ({placeholders})",
                    rows
                )
                
                print(f"✅ Copied {len(rows)} rows from {table}")
                
            except sqlite3.OperationalError as e:
                print(f"⚠️  Warning copying {table}: {e}")
            except Exception as e:
                print(f"❌ Error copying {table}: {e}")
        
        # Handle remaining special tables (user_preferences, tickers)
        # Note: user_preferences has a complex foreign key that may cause issues
        # We'll handle it with a separate connection to bypass foreign key checks
        self._copy_remaining_special_tables(source_conn, target_conn, source_cursor, target_cursor)
        
        # Verify empty tables are empty
        for table in EMPTY_TABLES:
            try:
                target_cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = target_cursor.fetchone()[0]
                if count > 0:
                    print(f"⚠️  Warning: {table} has {count} rows (should be empty)")
                else:
                    print(f"✅ {table} is empty (as expected)")
            except sqlite3.OperationalError:
                # Table might not exist yet, that's okay
                pass
        
        target_conn.commit()
        print("✅ Base data copied successfully")
    
    def _copy_users(self, source_cursor, target_cursor):
        """Copy users - only nimrod (id=1)"""
        print("🔧 Copying users (nimrod only)...")
        try:
            source_cursor.execute("SELECT * FROM users WHERE id = 1")
            user_row = source_cursor.fetchone()
            if user_row:
                source_cursor.execute("PRAGMA table_info(users)")
                columns = [col[1] for col in source_cursor.fetchall()]
                placeholders = ','.join(['?' for _ in columns])
                column_names = ','.join(columns)
                target_cursor.execute(
                    f"INSERT INTO users ({column_names}) VALUES ({placeholders})",
                    user_row
                )
                print("✅ Copied 1 user (nimrod) from users")
            else:
                print("⚠️  Warning: nimrod user (id=1) not found in source")
        except Exception as e:
            print(f"❌ Error copying users: {e}")
    
    def _copy_remaining_special_tables(self, source_conn, target_conn, source_cursor, target_cursor):
        """Copy remaining special tables with custom filtering logic"""
        print("🔧 Copying remaining special tables with custom logic...")
        
        # 1. User preferences - only for user_id=1 and existing profiles
        # Use a separate connection to bypass foreign key checks for this complex relationship
        try:
            # First, get all profile IDs that exist in preference_profiles
            target_cursor.execute("SELECT id, user_id, profile_name FROM preference_profiles")
            profiles = {row[0]: (row[1], row[2]) for row in target_cursor.fetchall()}
            
            if profiles:
                profile_ids_str = ','.join(map(str, profiles.keys()))
                source_cursor.execute(
                    f"SELECT * FROM user_preferences WHERE user_id = 1 AND profile_id IN ({profile_ids_str})"
                )
                rows = source_cursor.fetchall()
                
                if rows:
                    source_cursor.execute("PRAGMA table_info(user_preferences)")
                    columns = [col[1] for col in source_cursor.fetchall()]
                    placeholders = ','.join(['?' for _ in columns])
                    column_names = ','.join(columns)
                    
                    # Temporarily disable foreign keys for this insert
                    # (needed because the foreign key is complex: (user_id, profile_id) -> (user_id, profile_name))
                    # We need to commit current transaction first, then disable FKs
                    target_conn.commit()
                    target_cursor.execute("PRAGMA foreign_keys = OFF")
                    
                    target_cursor.executemany(
                        f"INSERT INTO user_preferences ({column_names}) VALUES ({placeholders})",
                        rows
                    )
                    
                    target_conn.commit()
                    target_cursor.execute("PRAGMA foreign_keys = ON")
                    
                    print(f"✅ Copied {len(rows)} user preferences for user_id=1")
                else:
                    print("ℹ️  No user preferences found for user_id=1 with existing profiles")
            else:
                print("ℹ️  No preference profiles found - skipping user_preferences")
        except Exception as e:
            print(f"❌ Error copying user_preferences: {e}")
            import traceback
            traceback.print_exc()
        
        # 2. Tickers - only SPY (id=9)
        try:
            source_cursor.execute("SELECT * FROM tickers WHERE id = 9")
            ticker_row = source_cursor.fetchone()
            if ticker_row:
                source_cursor.execute("PRAGMA table_info(tickers)")
                columns = [col[1] for col in source_cursor.fetchall()]
                placeholders = ','.join(['?' for _ in columns])
                column_names = ','.join(columns)
                target_cursor.execute(
                    f"INSERT INTO tickers ({column_names}) VALUES ({placeholders})",
                    ticker_row
                )
                print("✅ Copied 1 ticker (SPY) from tickers")
            else:
                print("⚠️  Warning: SPY ticker (id=9) not found in source")
        except Exception as e:
            print(f"❌ Error copying tickers: {e}")
    
    def seed_conditions_master_data(self, target_conn):
        """Seed trading methods and parameters if not already present"""
        print("🌱 Seeding trading methods master data...")
        
        cursor = target_conn.cursor()
        
        try:
            # Check if trading_methods table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='trading_methods'")
            if not cursor.fetchone():
                print("ℹ️  Skipping conditions seed – trading_methods table not found")
                return
            
            # Check if methods already exist
            cursor.execute("SELECT COUNT(*) FROM trading_methods")
            existing_methods = cursor.fetchone()[0]
            if existing_methods > 0:
                print(f"ℹ️  Trading methods already exist ({existing_methods} methods) – skipping seed")
                return
            
            timestamp = datetime.utcnow().isoformat()
            
            for method in METHODS_DEFINITION:
                cursor.execute(
                    """
                    INSERT INTO trading_methods (
                        name_en, name_he, category,
                        description_en, description_he,
                        icon_class, is_active, sort_order,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
                    """,
                    (
                        method["name_en"],
                        method["name_he"],
                        method["category"],
                        method["description_en"],
                        method["description_he"],
                        method["icon_class"],
                        method["sort_order"],
                        timestamp,
                        timestamp,
                    ),
                )
                
                method_id = cursor.lastrowid
                
                for param in method["parameters"]:
                    cursor.execute(
                        """
                        INSERT INTO method_parameters (
                            method_id,
                            parameter_key,
                            parameter_name_en,
                            parameter_name_he,
                            parameter_type,
                            default_value,
                            min_value,
                            max_value,
                            validation_rule,
                            is_required,
                            sort_order,
                            help_text_en,
                            help_text_he,
                            created_at,
                            updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                        (
                            method_id,
                            param["parameter_key"],
                            param["parameter_name_en"],
                            param["parameter_name_he"],
                            param["parameter_type"],
                            param.get("default_value"),
                            param.get("min_value"),
                            param.get("max_value"),
                            param.get("validation_rule"),
                            1 if param.get("is_required", True) else 0,
                            param.get("sort_order", 0),
                            param.get("help_text_en"),
                            param.get("help_text_he"),
                            timestamp,
                            timestamp,
                        ),
                    )
            
            target_conn.commit()
            print("✅ Trading methods master data seeded successfully")
            
        except Exception as error:
            print(f"❌ Failed to seed trading methods: {error}")
            target_conn.rollback()
            raise
    
    def verify_database(self, conn):
        """Verify the recreated database meets requirements"""
        print("\n🔍 Verifying database...")
        cursor = conn.cursor()
        issues = []
        
        # Check nimrod user exists and is only user
        cursor.execute("SELECT COUNT(*) FROM users WHERE id = 1 AND username = 'nimrod'")
        if cursor.fetchone()[0] != 1:
            issues.append("❌ nimrod user (id=1) not found or incorrect")
        else:
            print("✅ nimrod user verified")
        
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        if user_count != 1:
            issues.append(f"⚠️  Expected 1 user, found {user_count}")
        else:
            print("✅ Only 1 user in database")
        
        # Check SPY ticker exists and is only ticker
        cursor.execute("SELECT COUNT(*) FROM tickers WHERE id = 9 AND symbol = 'SPY'")
        if cursor.fetchone()[0] != 1:
            issues.append("❌ SPY ticker (id=9) not found")
        else:
            print("✅ SPY ticker verified")
        
        cursor.execute("SELECT COUNT(*) FROM tickers")
        ticker_count = cursor.fetchone()[0]
        if ticker_count != 1:
            issues.append(f"⚠️  Expected 1 ticker, found {ticker_count}")
        else:
            print("✅ Only 1 ticker in database")
        
        # Check preference profiles
        cursor.execute("SELECT COUNT(*) FROM preference_profiles")
        profile_count = cursor.fetchone()[0]
        print(f"✅ Preference profiles: {profile_count}")
        
        # Check user preferences for nimrod
        cursor.execute("SELECT COUNT(*) FROM user_preferences WHERE user_id = 1")
        prefs_count = cursor.fetchone()[0]
        print(f"✅ User preferences for nimrod: {prefs_count}")
        
        # Check excluded tables don't exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tag_categories'")
        if cursor.fetchone():
            issues.append("❌ tag_categories should not exist")
        else:
            print("✅ tag_categories correctly excluded")
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_preferences_v3'")
        if cursor.fetchone():
            issues.append("❌ user_preferences_v3 should not exist")
        else:
            print("✅ user_preferences_v3 correctly excluded")
        
        # Check empty tables are empty
        empty_tables = ['trades', 'trade_plans', 'executions', 'cash_flows', 'trading_accounts']
        for table in empty_tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                if count > 0:
                    issues.append(f"⚠️  {table} has {count} rows (should be empty)")
                else:
                    print(f"✅ {table} is empty")
            except sqlite3.OperationalError:
                pass
        
        if issues:
            print("\n⚠️  Verification issues found:")
            for issue in issues:
                print(f"   {issue}")
            return False
        else:
            print("\n✅ All verifications passed!")
            return True
    
    def recreate(self):
        """Main method to recreate database"""
        print("🚀 Starting database recreation...")
        print("=" * 60)
        
        # Backup existing database
        self.backup_existing_database()
        
        # Get connections
        source_conn = self.get_source_connection()
        target_conn = self.get_target_connection()
        
        try:
            # Copy schema
            self.copy_schema(source_conn, target_conn)
            
            # Copy base data
            self.copy_base_data(source_conn, target_conn)
            
            # Seed conditions master data (if needed)
            self.seed_conditions_master_data(target_conn)
            
            # Verify final state
            target_cursor = target_conn.cursor()
            target_cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
            table_count = target_cursor.fetchone()[0]
            
            # Run verification
            verification_passed = self.verify_database(target_conn)
            
            print("=" * 60)
            if verification_passed:
                print("✅ Database recreation completed successfully!")
            else:
                print("⚠️  Database recreation completed with warnings")
            print(f"📁 Target database: {self.target_db_path}")
            print(f"📊 Tables created: {table_count}")
            if os.path.exists(self.backup_path):
                print(f"💾 Backup saved: {self.backup_path}")
            
        except Exception as e:
            print(f"❌ Error during recreation: {e}")
            target_conn.rollback()
            raise
        finally:
            source_conn.close()
            target_conn.close()


def print_table_classification():
    """Print classification of tables"""
    print("\n" + "=" * 60)
    print("📋 TABLE CLASSIFICATION")
    print("=" * 60)
    
    BASE_DATA_TABLES = [
        'currencies',
        'note_relation_types',
        'external_data_providers',
        'trading_methods',
        'method_parameters',
        'preference_groups',
        'preference_types',
        'preference_profiles',
        'system_setting_groups',
        'system_setting_types',
        'constraints',
        'enum_values',
        'constraint_validations',
    ]
    
    SPECIAL_TABLES = [
        'users',  # Only nimrod (id=1)
        'user_preferences',  # Only for user_id=1 and active profiles
        'tickers',  # Only SPY (id=9)
    ]
    
    EMPTY_TABLES = [
        'trades',
        'trade_plans',
        'executions',
        'cash_flows',
        'alerts',
        'notes',
        'plan_conditions',
        'trade_conditions',
        'condition_alerts_mapping',
        'market_data_quotes',
        'data_refresh_logs',
        'intraday_data_slots',
        'import_sessions',
        'trading_accounts',
        'tags',
        'tag_links',
        'quotes_last',
        'preferences_legacy',
        'system_settings',
        'lost_and_found',
    ]
    
    SKIP_TABLES = [
        'tag_categories',  # Empty - don't create
        'user_preferences_v3',  # Not in use - don't create
    ]
    
    print("\n✅ TABLES WITH BASE DATA (will be populated):")
    print("-" * 60)
    for i, table in enumerate(BASE_DATA_TABLES, 1):
        print(f"  {i:2d}. {table}")
    
    print(f"\n🔧 SPECIAL TABLES (custom filtering logic):")
    print("-" * 60)
    for i, table in enumerate(SPECIAL_TABLES, 1):
        desc = {
            'users': 'Only nimrod (id=1)',
            'user_preferences': 'Only for user_id=1 and existing profiles',
            'tickers': 'Only SPY (id=9)'
        }
        print(f"  {i:2d}. {table} - {desc.get(table, '')}")
    
    print(f"\n📊 Total base tables: {len(BASE_DATA_TABLES)}")
    print(f"📊 Total special tables: {len(SPECIAL_TABLES)}")
    
    print("\n📭 TABLES TO REMAIN EMPTY (trading data and main records):")
    print("-" * 60)
    for i, table in enumerate(EMPTY_TABLES, 1):
        print(f"  {i:2d}. {table}")
    
    print(f"\n📊 Total empty tables: {len(EMPTY_TABLES)}")
    
    print("\n⏭️  TABLES TO SKIP (not needed):")
    print("-" * 60)
    for i, table in enumerate(SKIP_TABLES, 1):
        desc = {
            'tag_categories': 'Empty - don\'t create',
            'user_preferences_v3': 'Not in use - don\'t create'
        }
        print(f"  {i:2d}. {table} - {desc.get(table, '')}")
    
    print(f"\n📊 Total skipped tables: {len(SKIP_TABLES)}")
    print("\n" + "=" * 60)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Recreate TikTrack database with base data only',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Recreate default database (Backend/db/tiktrack.db)
  python3 Backend/scripts/recreate_database_with_base_data.py
  
  # Recreate specific database
  python3 Backend/scripts/recreate_database_with_base_data.py --db-path Backend/db/my_database.db
  
  # Show table classification only
  python3 Backend/scripts/recreate_database_with_base_data.py --list-only
        """
    )
    parser.add_argument(
        '--db-path',
        type=str,
        default=DEFAULT_DB_PATH,
        help=f'Path to database file (default: {DEFAULT_DB_PATH})'
    )
    parser.add_argument(
        '--source-db',
        type=str,
        default=None,
        help='Path to source database (default: same as --db-path)'
    )
    parser.add_argument(
        '--list-only',
        action='store_true',
        help='Only show table classification and exit'
    )
    
    args = parser.parse_args()
    
    if args.list_only:
        print_table_classification()
        return
    
    # Normalize paths
    db_path = os.path.normpath(args.db_path)
    source_db = os.path.normpath(args.source_db) if args.source_db else db_path
    
    print("🚀 TikTrack Database Recreation Script")
    print("=" * 60)
    print(f"📁 Source database: {source_db}")
    print(f"📁 Target database: {db_path}")
    print("=" * 60)
    
    # Show classification
    print_table_classification()
    
    # Confirm
    response = input("\n⚠️  This will DELETE the target database and recreate it. Continue? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("❌ Operation cancelled")
        return
    
    # Recreate
    recreator = DatabaseRecreator(source_db_path=source_db, target_db_path=db_path)
    recreator.recreate()
    
    print("\n🎉 Script completed successfully!")


if __name__ == "__main__":
    main()

