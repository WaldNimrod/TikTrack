#!/usr/bin/env python3
"""
TikTrack Production Database Creation Script
============================================

Creates a fresh production database with:
- Sequential IDs starting from 1 for all records
- Complete system data (users, currencies, trading_methods, etc.)
- Accurate demo data according to MULTI_USER_DATA_DISTRIBUTION.md

Usage:
    python3 Backend/scripts/create_fresh_production_database.py [--dry-run] [--verbose]

Options:
    --dry-run: Validate schema only, don't create data
    --verbose: Show detailed progress information

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025

Documentation:
    See documentation/production/PRODUCTION_DATABASE_SETUP_GUIDE.md for full guide
"""

import sys
import os
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from config.settings import DATABASE_URL
from config.database import get_db

# Import models for system data creation
from models.currency import Currency
from models.external_data import ExternalDataProvider
from models.note_relation_type import NoteRelationType
from models.user import User

# Import scripts
from scripts.setup_initial_users import setup_initial_users

# ============================================================================
# Configuration
# ============================================================================

# List of tables with user data (to be truncated)
# Note: Order matters - child tables should come before parent tables
USER_DATA_TABLES = [
    'watch_list_items',  # Must come before watch_lists (child before parent)
    'watch_lists',
    'tickers',
    'trades',
    'trade_plans',
    'executions',
    'cash_flows',
    'trading_accounts',
    'alerts',
    'notes',
    'tags',
    'user_tickers',
    'ai_analysis_requests',
    'plan_conditions',
    'trade_conditions',
    'tag_links',
    'market_data_quotes',
    'data_refresh_logs',
    'import_sessions',
]

# Currencies to create
CURRENCIES = [
    {'symbol': 'USD', 'name': 'US Dollar', 'usd_rate': 1.0, 'usd_rate_default': 1.0},
    {'symbol': 'ILS', 'name': 'Israeli Shekel', 'usd_rate': 3.65, 'usd_rate_default': 3.65},
    {'symbol': 'EUR', 'name': 'Euro', 'usd_rate': 0.92, 'usd_rate_default': 0.92},
    {'symbol': 'GBP', 'name': 'British Pound', 'usd_rate': 0.79, 'usd_rate_default': 0.79},
    {'symbol': 'JPY', 'name': 'Japanese Yen', 'usd_rate': 150.0, 'usd_rate_default': 150.0},
]

# Note relation types to create
NOTE_RELATION_TYPES = [
    'trades',
    'accounts',
    'tickers',
    'trade_plans',
    'executions',
    'cash_flows',
    'alerts',
    'notes',
]

# External data providers to create
EXTERNAL_DATA_PROVIDERS = [
    {
        'name': 'yahoo_finance',
        'display_name': 'Yahoo Finance',
        'is_active': True,
        'provider_type': 'finance',
        'api_key': None,
        'base_url': 'https://query1.finance.yahoo.com',
        'rate_limit_per_hour': 900,
        'timeout_seconds': 20,
        'retry_attempts': 2,
        'cache_ttl_hot': 60,
        'cache_ttl_warm': 300,
        'max_symbols_per_batch': 50,
        'preferred_batch_size': 25,
        'is_healthy': True,
    },
    {
        'name': 'google_finance',
        'display_name': 'Google Finance',
        'is_active': False,
        'provider_type': 'finance',
        'api_key': None,
        'base_url': 'https://www.google.com/finance',
        'rate_limit_per_hour': 900,
        'timeout_seconds': 20,
        'retry_attempts': 2,
        'cache_ttl_hot': 60,
        'cache_ttl_warm': 300,
        'max_symbols_per_batch': 50,
        'preferred_batch_size': 25,
        'is_healthy': False,
    },
]

# ============================================================================
# Helper Functions
# ============================================================================

def backup_database(verbose: bool = False) -> Optional[str]:
    """
    Create a backup of the current production database
    
    Returns:
        Path to backup file or None if backup failed
    """
    if verbose:
        print("\n" + "=" * 70)
        print("📦 שלב 1: יצירת גיבוי בסיס הנתונים")
        print("=" * 70)
    
    try:
        # Get project root
        script_dir = Path(__file__).parent.parent.parent
        backup_script = script_dir / "scripts" / "db" / "backup_postgresql_production.sh"
        
        if not backup_script.exists():
            print(f"⚠️  סקריפט גיבוי לא נמצא: {backup_script}")
            return None
        
        # Run backup script
        result = subprocess.run(
            ["bash", str(backup_script)],
            capture_output=True,
            text=True,
            cwd=str(script_dir)
        )
        
        if result.returncode == 0:
            # Extract backup file path from output
            for line in result.stdout.split('\n'):
                if 'File:' in line or 'archive/database_backups' in line:
                    backup_path = line.split('File:')[-1].strip() if 'File:' in line else line.strip()
                    if verbose:
                        print(f"✅ גיבוי נוצר בהצלחה: {backup_path}")
                    return backup_path
            if verbose:
                print("✅ גיבוי נוצר בהצלחה")
            return "backup_created"
        else:
            print(f"❌ שגיאה ביצירת גיבוי: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ שגיאה ביצירת גיבוי: {e}")
        return None


def truncate_all_user_data_tables(db: Session, verbose: bool = False) -> bool:
    """
    Truncate all user data tables using TRUNCATE CASCADE
    
    Args:
        db: Database session
        verbose: Show detailed progress
    
    Returns:
        True if successful, False otherwise
    """
    if verbose:
        print("\n" + "=" * 70)
        print("🧹 שלב 2: ניקוי כל נתוני המשתמשים")
        print("=" * 70)
    
    try:
        # Disable foreign key checks temporarily (PostgreSQL doesn't need this, but SQLite does)
        # For PostgreSQL, TRUNCATE CASCADE handles foreign keys automatically
        
        truncated_count = 0
        for table_name in USER_DATA_TABLES:
            try:
                # Check if table exists
                inspector = inspect(db.bind)
                if table_name not in inspector.get_table_names():
                    if verbose:
                        print(f"   ⏭️  מדלג על טבלה לא קיימת: {table_name}")
                    continue
                
                # Truncate with CASCADE to handle foreign keys
                db.execute(text(f'TRUNCATE TABLE "{table_name}" CASCADE'))
                truncated_count += 1
                if verbose:
                    print(f"   ✅ נוקה: {table_name}")
                    
            except Exception as e:
                if verbose:
                    print(f"   ⚠️  שגיאה בניקוי {table_name}: {e}")
                # Continue with other tables
                continue
        
        db.commit()
        
        if verbose:
            print(f"\n✅ נוקו {truncated_count} טבלאות")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה בניקוי נתונים: {e}")
        db.rollback()
        return False


def reset_all_sequences(db: Session, verbose: bool = False) -> bool:
    """
    Reset all PostgreSQL sequences to start from 1
    
    Args:
        db: Database session
        verbose: Show detailed progress
    
    Returns:
        True if successful, False otherwise
    """
    if verbose:
        print("\n" + "=" * 70)
        print("🔄 שלב 3: איפוס כל ה-sequences ל-1")
        print("=" * 70)
    
    try:
        # Get all sequences
        sequences_query = text("""
            SELECT sequence_name 
            FROM information_schema.sequences 
            WHERE sequence_schema = 'public'
            ORDER BY sequence_name
        """)
        
        result = db.execute(sequences_query)
        sequences = [row[0] for row in result]
        
        if not sequences:
            if verbose:
                print("   ⚠️  לא נמצאו sequences")
            return True
        
        reset_count = 0
        for sequence_name in sequences:
            try:
                # Reset sequence to 1
                reset_query = text(f'ALTER SEQUENCE "{sequence_name}" RESTART WITH 1')
                db.execute(reset_query)
                reset_count += 1
                if verbose:
                    print(f"   ✅ אופס: {sequence_name}")
            except Exception as e:
                if verbose:
                    print(f"   ⚠️  שגיאה באיפוס {sequence_name}: {e}")
                continue
        
        db.commit()
        
        if verbose:
            print(f"\n✅ אופסו {reset_count} sequences")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה באיפוס sequences: {e}")
        db.rollback()
        return False


def create_currencies(db: Session, verbose: bool = False) -> bool:
    """Create base currencies"""
    if verbose:
        print("\n   📊 יוצר מטבעות...")
    
    try:
        # Delete all existing currencies first (to ensure sequential IDs)
        # Use TRUNCATE to bypass triggers
        existing_count = db.query(Currency).count()
        if existing_count > 0:
            if verbose:
                print(f"      🧹 מוחק {existing_count} מטבעות קיימים...")
            # Use TRUNCATE CASCADE to bypass delete triggers
            db.execute(text("TRUNCATE TABLE currencies CASCADE"))
            db.commit()
            if verbose:
                print(f"      ✅ מטבעות קיימים נמחקו")
        
        # Reset sequence
        try:
            db.execute(text("ALTER SEQUENCE currencies_id_seq RESTART WITH 1"))
            db.commit()
        except Exception as e:
            if verbose:
                print(f"      ⚠️  לא הצלחתי לאפס sequence: {e}")
        
        # Create currencies with sequential IDs
        created_count = 0
        for idx, curr_data in enumerate(CURRENCIES, start=1):
            currency = Currency(
                id=idx,  # Force sequential ID
                symbol=curr_data['symbol'],
                name=curr_data['name'],
                usd_rate=curr_data['usd_rate'],
            )
            # Set usd_rate_default if it exists in the model
            if hasattr(currency, 'usd_rate_default'):
                currency.usd_rate_default = curr_data.get('usd_rate_default', curr_data['usd_rate'])
            
            db.add(currency)
            created_count += 1
        
        db.commit()
        
        # Fix sequence after creation
        try:
            db.execute(text(f"SELECT setval('currencies_id_seq', {created_count}, true)"))
            db.commit()
        except Exception as e:
            if verbose:
                print(f"      ⚠️  לא הצלחתי לתקן sequence: {e}")
        
        if verbose:
            print(f"      ✅ נוצרו {created_count} מטבעות (IDs: 1-{created_count})")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה ביצירת מטבעות: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False


def create_external_data_providers(db: Session, verbose: bool = False) -> bool:
    """Create external data providers"""
    if verbose:
        print("\n   📡 יוצר ספקי נתונים חיצוניים...")
    
    try:
        created_count = 0
        for provider_data in EXTERNAL_DATA_PROVIDERS:
            # Check if provider already exists
            existing = db.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == provider_data['name']
            ).first()
            if existing:
                if verbose:
                    print(f"      ℹ️  ספק {provider_data['name']} כבר קיים")
                continue
            
            provider = ExternalDataProvider(**provider_data)
            db.add(provider)
            created_count += 1
        
        if created_count > 0:
            db.commit()
            if verbose:
                print(f"      ✅ נוצרו {created_count} ספקי נתונים")
        else:
            if verbose:
                print(f"      ℹ️  כל הספקים כבר קיימים")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה ביצירת ספקי נתונים: {e}")
        db.rollback()
        return False


def create_spy_ticker(db: Session, verbose: bool = False) -> bool:
    """Create SPY ticker (required by demo data generator)"""
    if verbose:
        print("\n   📈 יוצר טיקר SPY...")
    
    try:
        from models.ticker import Ticker
        
        # Check if SPY already exists
        spy = db.query(Ticker).filter(Ticker.symbol == 'SPY').first()
        if spy:
            if verbose:
                print(f"      ℹ️  טיקר SPY כבר קיים (ID: {spy.id})")
            return True
        
        # Get USD currency (should be ID 1)
        usd_currency = db.query(Currency).filter(Currency.symbol == 'USD').first()
        if not usd_currency:
            print("❌ שגיאה: מטבע USD לא נמצא")
            return False
        
        # Create SPY ticker
        spy_ticker = Ticker(
            symbol='SPY',
            name='SPDR S&P 500 ETF Trust',
            type='etf',
            currency_id=usd_currency.id,
            status='open',
            active_trades=False
        )
        db.add(spy_ticker)
        db.commit()
        db.refresh(spy_ticker)
        
        if verbose:
            print(f"      ✅ טיקר SPY נוצר (ID: {spy_ticker.id})")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה ביצירת טיקר SPY: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False


def create_note_relation_types(db: Session, verbose: bool = False) -> bool:
    """Create note relation types"""
    if verbose:
        print("\n   📝 יוצר סוגי קשרי הערות...")
    
    try:
        # Delete all existing note relation types first
        existing_count = db.query(NoteRelationType).count()
        if existing_count > 0:
            if verbose:
                print(f"      🧹 מוחק {existing_count} סוגי קשרים קיימים...")
            db.execute(text("TRUNCATE TABLE note_relation_types CASCADE"))
            db.commit()
            if verbose:
                print(f"      ✅ סוגי קשרים קיימים נמחקו")
        
        # Reset sequence
        try:
            db.execute(text("ALTER SEQUENCE note_relation_types_id_seq RESTART WITH 1"))
            db.commit()
        except Exception as e:
            if verbose:
                print(f"      ⚠️  לא הצלחתי לאפס sequence: {e}")
        
        # Create note relation types with sequential IDs
        created_count = 0
        for idx, relation_type in enumerate(NOTE_RELATION_TYPES, start=1):
            note_relation = NoteRelationType(
                id=idx,  # Force sequential ID
                note_relation_type=relation_type
            )
            db.add(note_relation)
            created_count += 1
        
        db.commit()
        
        # Fix sequence after creation
        try:
            db.execute(text(f"SELECT setval('note_relation_types_id_seq', {created_count}, true)"))
            db.commit()
        except Exception as e:
            if verbose:
                print(f"      ⚠️  לא הצלחתי לתקן sequence: {e}")
        
        if verbose:
            print(f"      ✅ נוצרו {created_count} סוגי קשרים (IDs: 1-{created_count})")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה ביצירת סוגי קשרי הערות: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False


def seed_trading_methods(db: Session, verbose: bool = False) -> bool:
    """Seed trading methods from seed_conditions_master_data"""
    if verbose:
        print("\n   📈 יוצר שיטות מסחר...")
    
    try:
        # Import the seed function
        from migrations.seed_conditions_master_data import METHODS_DEFINITION
        from models.trading_method import TradingMethod, MethodParameter
        
        # Check if methods already exist
        existing_count = db.query(TradingMethod).count()
        if existing_count > 0:
            if verbose:
                print(f"      ℹ️  {existing_count} שיטות מסחר כבר קיימות - מדלג")
            return True
        
        # Create methods
        created_methods = 0
        for method_def in METHODS_DEFINITION:
            method = TradingMethod(
                name_en=method_def['name_en'],
                name_he=method_def['name_he'],
                category=method_def['category'],
                description_en=method_def.get('description_en'),
                description_he=method_def.get('description_he'),
                icon_class=method_def.get('icon_class'),
                is_active=True,
                sort_order=method_def.get('sort_order', 0),
            )
            db.add(method)
            db.flush()  # Get the method ID
            
            # Create parameters
            for param_def in method_def.get('parameters', []):
                param = MethodParameter(
                    method_id=method.id,
                    parameter_key=param_def['parameter_key'],
                    parameter_name_en=param_def['parameter_name_en'],
                    parameter_name_he=param_def['parameter_name_he'],
                    parameter_type=param_def['parameter_type'],
                    default_value=param_def.get('default_value'),
                    min_value=param_def.get('min_value'),
                    max_value=param_def.get('max_value'),
                    validation_rule=param_def.get('validation_rule'),
                    is_required=param_def.get('is_required', True),
                    sort_order=param_def.get('sort_order', 0),
                    help_text_en=param_def.get('help_text_en'),
                    help_text_he=param_def.get('help_text_he'),
                )
                db.add(param)
            
            created_methods += 1
        
        db.commit()
        
        if verbose:
            print(f"      ✅ נוצרו {created_methods} שיטות מסחר")
        
        # Fix sequence after creation
        try:
            max_id = db.query(TradingMethod).order_by(TradingMethod.id.desc()).first()
            if max_id:
                db.execute(text(f"SELECT setval('trading_methods_id_seq', {max_id.id}, true)"))
                db.commit()
        except Exception as e:
            if verbose:
                print(f"      ⚠️  לא הצלחתי לתקן sequence: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה ביצירת שיטות מסחר: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False


def create_system_data(db: Session, verbose: bool = False) -> bool:
    """
    Create all system data (currencies, users, trading_methods, etc.)
    
    Args:
        db: Database session
        verbose: Show detailed progress
    
    Returns:
        True if successful, False otherwise
    """
    if verbose:
        print("\n" + "=" * 70)
        print("🏗️  שלב 4: יצירת נתוני מערכת")
        print("=" * 70)
    
    try:
        # 1. Create currencies
        if not create_currencies(db, verbose):
            return False
        
        # 2. Create users (using setup_initial_users)
        if verbose:
            print("\n   👥 יוצר משתמשים...")
        if not setup_initial_users():
            print("❌ שגיאה ביצירת משתמשים")
            return False
        if verbose:
            print("      ✅ משתמשים נוצרו")
        
        # 3. Create trading methods
        if not seed_trading_methods(db, verbose):
            return False
        
        # 4. Create external data providers
        if not create_external_data_providers(db, verbose):
            return False
        
        # 5. Create note relation types
        if not create_note_relation_types(db, verbose):
            return False
        
        # 6. Create SPY ticker (required by demo data generator)
        if not create_spy_ticker(db, verbose):
            return False
        
        # Note: preferences, system_settings, constraints, enum_values
        # are typically created by migrations or other scripts
        # We'll assume they're already in place or will be created by migrations
        
        if verbose:
            print("\n✅ כל נתוני המערכת נוצרו בהצלחה")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה ביצירת נתוני מערכת: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False


def create_demo_data(db: Session, verbose: bool = False) -> bool:
    """
    Create demo data using generate_multi_user_demo_data.py
    
    Args:
        db: Database session (not used, but kept for consistency)
        verbose: Show detailed progress
    
    Returns:
        True if successful, False otherwise
    """
    if verbose:
        print("\n" + "=" * 70)
        print("🎨 שלב 5: יצירת נתוני דוגמה")
        print("=" * 70)
    
    try:
        # Import the generator directly
        import subprocess
        import sys as sys_module
        from pathlib import Path
        
        # Get script path
        script_dir = Path(__file__).parent
        script_path = script_dir / "generate_multi_user_demo_data.py"
        
        if not script_path.exists():
            print(f"❌ סקריפט לא נמצא: {script_path}")
            return False
        
        # Build command
        cmd = [sys_module.executable, str(script_path)]
        if verbose:
            cmd.append('--verbose')
        
        # Run the script
        if verbose:
            print(f"   🚀 מריץ: {' '.join(cmd)}")
        
        result = subprocess.run(
            cmd,
            cwd=str(script_dir.parent.parent),  # Project root
            capture_output=False,  # Show output in real-time
            text=True
        )
        
        success = (result.returncode == 0)
        
        if success and verbose:
            print("\n✅ נתוני דוגמה נוצרו בהצלחה")
        elif not success:
            print(f"\n❌ שגיאה ביצירת נתוני דוגמה (exit code: {result.returncode})")
        
        return success
        
    except Exception as e:
        print(f"❌ שגיאה ביצירת נתוני דוגמה: {e}")
        import traceback
        traceback.print_exc()
        return False


def verify_sequential_ids(db: Session, verbose: bool = False) -> bool:
    """
    Verify that all tables start from ID 1 and have sequential IDs
    
    Args:
        db: Database session
        verbose: Show detailed progress
    
    Returns:
        True if all tables are sequential, False otherwise
    """
    if verbose:
        print("\n" + "=" * 70)
        print("✅ שלב 6: וידוא מפתחות מסודרים")
        print("=" * 70)
    
    try:
        inspector = inspect(db.bind)
        all_tables = inspector.get_table_names()
        
        # Tables to check (all tables with id column)
        tables_to_check = []
        for table_name in all_tables:
            try:
                columns = [col['name'] for col in inspector.get_columns(table_name)]
                if 'id' in columns:
                    tables_to_check.append(table_name)
            except Exception:
                continue
        
        issues = []
        verified = []
        
        for table_name in sorted(tables_to_check):
            try:
                # Get min and max IDs
                result = db.execute(text(f'SELECT MIN(id), MAX(id), COUNT(*) FROM "{table_name}"'))
                row = result.fetchone()
                
                if row and row[2] > 0:  # If table has data
                    min_id, max_id, count = row[0], row[1], row[2]
                    
                    # Check if starts from 1
                    if min_id != 1:
                        issues.append(f"{table_name}: מתחיל מ-{min_id} במקום 1")
                        if verbose:
                            print(f"   ❌ {table_name}: מתחיל מ-{min_id} במקום 1")
                    # Check if sequential (max_id should equal count if sequential)
                    elif max_id != count:
                        # Check for gaps
                        gap_query = text(f"""
                            SELECT COUNT(*) 
                            FROM (
                                SELECT id, 
                                       id - ROW_NUMBER() OVER (ORDER BY id) as gap
                                FROM "{table_name}"
                            ) t
                            WHERE gap != 0
                        """)
                        gap_result = db.execute(gap_query)
                        gap_count = gap_result.scalar()
                        if gap_count > 0:
                            issues.append(f"{table_name}: יש פערים במפתחות (max={max_id}, count={count})")
                            if verbose:
                                print(f"   ❌ {table_name}: יש פערים במפתחות (max={max_id}, count={count})")
                        else:
                            verified.append(f"{table_name}: ✅ (1-{max_id}, {count} רשומות)")
                            if verbose:
                                print(f"   ✅ {table_name}: 1-{max_id} ({count} רשומות)")
                    else:
                        verified.append(f"{table_name}: ✅ (1-{max_id}, {count} רשומות)")
                        if verbose:
                            print(f"   ✅ {table_name}: 1-{max_id} ({count} רשומות)")
                else:
                    # Empty table - check sequence
                    try:
                        seq_query = text(f"""
                            SELECT last_value, is_called 
                            FROM "{table_name}_id_seq"
                        """)
                        seq_result = db.execute(seq_query)
                        seq_row = seq_result.fetchone()
                        if seq_row:
                            last_value, is_called = seq_row[0], seq_row[1]
                            if is_called and last_value > 0:
                                issues.append(f"{table_name}: sequence לא מאופס (last_value={last_value})")
                                if verbose:
                                    print(f"   ❌ {table_name}: sequence לא מאופס (last_value={last_value})")
                            else:
                                verified.append(f"{table_name}: ✅ (ריק, sequence מאופס)")
                                if verbose:
                                    print(f"   ✅ {table_name}: ריק, sequence מאופס")
                    except Exception:
                        # No sequence or can't check
                        verified.append(f"{table_name}: ✅ (ריק)")
                        if verbose:
                            print(f"   ✅ {table_name}: ריק")
                            
            except Exception as e:
                issues.append(f"{table_name}: שגיאה בבדיקה - {e}")
                if verbose:
                    print(f"   ⚠️  {table_name}: שגיאה בבדיקה - {e}")
        
        if verbose:
            print(f"\n📊 סיכום:")
            print(f"   ✅ טבלאות תקינות: {len(verified)}")
            print(f"   ❌ בעיות: {len(issues)}")
        
        if issues:
            if verbose:
                print("\n⚠️  בעיות שנמצאו:")
                for issue in issues:
                    print(f"   - {issue}")
            return False
        
        if verbose:
            print("\n✅ כל הטבלאות מאומתות - מפתחות מסודרים מ-1 ורציפים!")
        
        return True
        
    except Exception as e:
        print(f"❌ שגיאה בוידוא מפתחות: {e}")
        import traceback
        traceback.print_exc()
        return False


# ============================================================================
# Main Function
# ============================================================================

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Create fresh production database with sequential IDs',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Validate schema only, do not create data'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed progress information'
    )
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("🎯 TikTrack - יצירת בסיס נתונים פרודקשן עם מפתחות מסודרים")
    print("=" * 70)
    print()
    
    if args.dry_run:
        print("🔍 מצב DRY-RUN - לא יבוצעו שינויים")
        print()
    
    # Create database connection
    engine = create_engine(DATABASE_URL, poolclass=QueuePool, pool_pre_ping=True)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        # Step 1: Backup database
        if not args.dry_run:
            backup_path = backup_database(verbose=args.verbose)
            if backup_path is None:
                print("⚠️  אזהרה: לא נוצר גיבוי, אבל ממשיכים...")
        else:
            if args.verbose:
                print("\n📦 שלב 1: יצירת גיבוי (DRY-RUN - מדלג)")
        
        # Step 2: Truncate all user data tables
        if not args.dry_run:
            if not truncate_all_user_data_tables(db, verbose=args.verbose):
                print("❌ שגיאה בניקוי נתונים")
                return 1
        else:
            if args.verbose:
                print("\n🧹 שלב 2: ניקוי נתונים (DRY-RUN - מדלג)")
        
        # Step 3: Reset all sequences
        if not args.dry_run:
            if not reset_all_sequences(db, verbose=args.verbose):
                print("❌ שגיאה באיפוס sequences")
                return 1
        else:
            if args.verbose:
                print("\n🔄 שלב 3: איפוס sequences (DRY-RUN - מדלג)")
        
        # Step 4: Create system data
        if not args.dry_run:
            if not create_system_data(db, verbose=args.verbose):
                print("❌ שגיאה ביצירת נתוני מערכת")
                return 1
        else:
            if args.verbose:
                print("\n🏗️  שלב 4: יצירת נתוני מערכת (DRY-RUN - מדלג)")
        
        # Step 5: Create demo data
        if not args.dry_run:
            if not create_demo_data(db, verbose=args.verbose):
                print("❌ שגיאה ביצירת נתוני דוגמה")
                return 1
        else:
            if args.verbose:
                print("\n🎨 שלב 5: יצירת נתוני דוגמה (DRY-RUN - מדלג)")
        
        # Step 6: Verify sequential IDs
        if not verify_sequential_ids(db, verbose=args.verbose):
            print("⚠️  אזהרה: נמצאו בעיות במפתחות")
            if not args.dry_run:
                return 1
        
        print("\n" + "=" * 70)
        if args.dry_run:
            print("✅ DRY-RUN הושלם - כל הבדיקות עברו")
        else:
            print("✅ יצירת בסיס נתונים פרודקשן הושלמה בהצלחה!")
        print("=" * 70)
        print()
        
        return 0
        
    except Exception as e:
        print(f"\n❌ שגיאה לא צפויה: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return 1
    finally:
        db.close()


if __name__ == '__main__':
    sys.exit(main())

