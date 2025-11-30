#!/usr/bin/env python3
"""
TikTrack Database Cloning Script for Cleanup Process
=====================================================

Creates a clone of the current PostgreSQL database for the cleanup process.
All cleanup and demo data generation will be performed on the cloned database,
leaving the original database untouched.

This script:
1. Creates a new PostgreSQL database with a unique name
2. Copies all data from the source database to the cloned database
3. Sets up environment variables for working with the cloned database

Usage:
    python3 Backend/scripts/clone_database_for_cleanup.py [--target-name TARGET_NAME] [--source-name SOURCE_NAME]

Options:
    --target-name: Name of the target database (default: TikTrack-db-cleanup-test)
    --source-name: Name of the source database (default: from POSTGRES_DB env var or TikTrack-db-development)

Examples:
    # Clone current database to default test name
    python3 Backend/scripts/clone_database_for_cleanup.py

    # Clone specific database to specific target
    python3 Backend/scripts/clone_database_for_cleanup.py --source-name TikTrack-db-development --target-name TikTrack-db-demo

Author: TikTrack Development Team
Version: 1.0.0
Date: January 2025

Documentation:
    See documentation/05-REPORTS/USER_DATA_CLEANUP_PROCESS.md
"""

import sys
import os
import subprocess
import argparse
from datetime import datetime
from pathlib import Path

# Add Backend to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.settings import (
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB
)

# ============================================================================
# Exception Classes
# ============================================================================

class DatabaseCloneError(Exception):
    """שגיאה בתהליך השיכפול"""
    
    def __init__(self, message: str, details: str = None):
        self.message = message
        self.details = details
        
        msg = f"❌ שגיאה בתהליך שיכפול בסיס הנתונים: {message}"
        if details:
            msg += f"\n📍 פרטים: {details}"
        msg += f"\n💡 פתרון: ודא שהפרמטרים נכונים ושיש גישה ל-PostgreSQL"
        
        super().__init__(msg)


# ============================================================================
# Database Cloning Functions
# ============================================================================

def check_postgres_connection() -> bool:
    """בודק חיבור ל-PostgreSQL"""
    try:
        result = subprocess.run(
            [
                'docker', 'exec', 'tiktrack-postgres-dev',
                'psql', '-U', POSTGRES_USER,
                '-d', 'postgres',  # Connect to default database
                '-c', 'SELECT 1'
            ],
            capture_output=True,
            text=True,
            env={**os.environ, 'PGPASSWORD': POSTGRES_PASSWORD}
        )
        return result.returncode == 0
    except Exception as e:
        raise DatabaseCloneError(
            "לא ניתן להתחבר ל-PostgreSQL",
            f"דוקר container: {str(e)}"
        )


def database_exists(db_name: str) -> bool:
    """בודק אם database קיים"""
    try:
        result = subprocess.run(
            [
                'docker', 'exec', 'tiktrack-postgres-dev',
                'psql', '-U', POSTGRES_USER,
                '-d', 'postgres',
                '-tAc', f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'"
            ],
            capture_output=True,
            text=True,
            env={**os.environ, 'PGPASSWORD': POSTGRES_PASSWORD}
        )
        return result.returncode == 0 and result.stdout.strip() == '1'
    except Exception as e:
        raise DatabaseCloneError(
            f"לא ניתן לבדוק אם database '{db_name}' קיים",
            str(e)
        )


def create_database(db_name: str) -> None:
    """יוצר database חדש"""
    print(f"   📦 יוצר database חדש: {db_name}...")
    
    try:
        result = subprocess.run(
            [
                'docker', 'exec', 'tiktrack-postgres-dev',
                'psql', '-U', POSTGRES_USER,
                '-d', 'postgres',
                '-c', f'CREATE DATABASE "{db_name}" WITH OWNER = {POSTGRES_USER} ENCODING = \'UTF8\';'
            ],
            capture_output=True,
            text=True,
            env={**os.environ, 'PGPASSWORD': POSTGRES_PASSWORD}
        )
        
        if result.returncode != 0:
            if 'already exists' in result.stderr.lower():
                raise DatabaseCloneError(
                    f"Database '{db_name}' כבר קיים",
                    "אם אתה רוצה להחליף אותו, מחק אותו ידנית תחילה"
                )
            raise DatabaseCloneError(
                f"לא ניתן ליצור database '{db_name}'",
                result.stderr
            )
        
        print(f"   ✅ Database נוצר בהצלחה")
        
    except DatabaseCloneError:
        raise
    except Exception as e:
        raise DatabaseCloneError(
            f"שגיאה ביצירת database '{db_name}'",
            str(e)
        )


def clone_database_data(source_db: str, target_db: str) -> None:
    """מעתיק את כל הנתונים מה-source ל-target"""
    print(f"   📋 מעתיק נתונים מ-{source_db} ל-{target_db}...")
    
    try:
        # Use pg_dump and psql to clone the database
        dump_process = subprocess.Popen(
            [
                'docker', 'exec', 'tiktrack-postgres-dev',
                'pg_dump', '-U', POSTGRES_USER,
                '-d', source_db,
                '--no-owner',
                '--no-acl'
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={**os.environ, 'PGPASSWORD': POSTGRES_PASSWORD}
        )
        
        restore_process = subprocess.Popen(
            [
                'docker', 'exec', '-i', 'tiktrack-postgres-dev',
                'psql', '-U', POSTGRES_USER,
                '-d', target_db
            ],
            stdin=dump_process.stdout,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={**os.environ, 'PGPASSWORD': POSTGRES_PASSWORD}
        )
        
        dump_process.stdout.close()
        
        stdout, stderr = restore_process.communicate()
        
        if restore_process.returncode != 0:
            raise DatabaseCloneError(
                f"שגיאה בהעתקת נתונים מ-{source_db} ל-{target_db}",
                stderr.decode('utf-8') if stderr else stdout.decode('utf-8')
            )
        
        print(f"   ✅ הנתונים הועתקו בהצלחה")
        
    except DatabaseCloneError:
        raise
    except Exception as e:
        raise DatabaseCloneError(
            f"שגיאה בתהליך העתקת הנתונים",
            str(e)
        )


def get_table_count(db_name: str) -> int:
    """מחזיר את מספר הטבלאות ב-database"""
    try:
        result = subprocess.run(
            [
                'docker', 'exec', 'tiktrack-postgres-dev',
                'psql', '-U', POSTGRES_USER,
                '-d', db_name,
                '-tAc', "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
            ],
            capture_output=True,
            text=True,
            env={**os.environ, 'PGPASSWORD': POSTGRES_PASSWORD}
        )
        
        if result.returncode != 0:
            return 0
        
        return int(result.stdout.strip())
    except Exception:
        return 0


def clone_database(source_db: str, target_db: str, force: bool = False) -> None:
    """מבצע את תהליך השיכפול המלא"""
    print(f"\n🔄 מתחיל תהליך שיכפול בסיס נתונים")
    print("=" * 70)
    print(f"   מקור: {source_db}")
    print(f"   יעד: {target_db}")
    print()
    
    # Check connection
    print("🔍 בודק חיבור ל-PostgreSQL...")
    if not check_postgres_connection():
        raise DatabaseCloneError("לא ניתן להתחבר ל-PostgreSQL")
    print("   ✅ חיבור תקין")
    print()
    
    # Check if source exists
    print(f"🔍 בודק אם database המקור '{source_db}' קיים...")
    if not database_exists(source_db):
        raise DatabaseCloneError(
            f"Database המקור '{source_db}' לא קיים",
            f"ודא שהשם נכון ושהמסד הנתונים קיים"
        )
    print(f"   ✅ Database המקור קיים")
    
    source_tables = get_table_count(source_db)
    print(f"   📊 נמצאו {source_tables} טבלאות ב-{source_db}")
    print()
    
    # Check if target exists
    if database_exists(target_db):
        if force:
            print(f"⚠️  Database '{target_db}' כבר קיים - יימחק והוחלף")
            # Drop existing database
            subprocess.run(
                [
                    'docker', 'exec', 'tiktrack-postgres-dev',
                    'psql', '-U', POSTGRES_USER,
                    '-d', 'postgres',
                    '-c', f'DROP DATABASE IF EXISTS "{target_db}";'
                ],
                capture_output=True,
                env={**os.environ, 'PGPASSWORD': POSTGRES_PASSWORD}
            )
            print(f"   ✅ Database הקיים נמחק")
        else:
            raise DatabaseCloneError(
                f"Database '{target_db}' כבר קיים",
                "השתמש ב--force כדי להחליף אותו, או בחר שם אחר"
            )
    else:
        print(f"   ✅ Database '{target_db}' לא קיים - ייווצר חדש")
    print()
    
    # Create target database
    print("🏗️  יוצר database חדש...")
    create_database(target_db)
    print()
    
    # Clone data
    print("📋 מעתיק נתונים...")
    clone_database_data(source_db, target_db)
    print()
    
    # Verify
    print("✅ בודק את התוצאה...")
    target_tables = get_table_count(target_db)
    
    if target_tables == source_tables:
        print(f"   ✅ השיכפול הצליח - {target_tables} טבלאות ב-{target_db}")
    else:
        raise DatabaseCloneError(
            f"מספר הטבלאות לא תואם",
            f"מקור: {source_tables}, יעד: {target_tables}"
        )
    print()
    
    # Print instructions
    print("=" * 70)
    print("✅ שיכפול בסיס הנתונים הושלם בהצלחה!")
    print()
    print("📝 הוראות המשך:")
    print(f"   1. הגדר את משתנה הסביבה: export POSTGRES_DB={target_db}")
    print(f"   2. הרץ את סקריפט הניקוי: python3 Backend/scripts/cleanup_user_data.py")
    print(f"   3. הרץ את סקריפט יצירת הדוגמה: python3 Backend/scripts/generate_demo_data.py")
    print()
    print(f"   או השתמש בסקריפט הראשי:")
    print(f"   POSTGRES_DB={target_db} python3 Backend/scripts/run_cleanup_and_demo_data.py")
    print()


# ============================================================================
# Main Entry Point
# ============================================================================

def main():
    """Entry point"""
    parser = argparse.ArgumentParser(
        description='Clone PostgreSQL database for cleanup process',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--target-name',
        type=str,
        default='TikTrack-db-cleanup-test',
        help='Name of the target database (default: TikTrack-db-cleanup-test)'
    )
    parser.add_argument(
        '--source-name',
        type=str,
        default=POSTGRES_DB,
        help=f'Name of the source database (default: {POSTGRES_DB})'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force overwrite if target database exists'
    )
    
    args = parser.parse_args()
    
    # Validate arguments
    if not args.source_name:
        print("❌ שגיאה: לא צוין database מקור")
        print("   השתמש ב--source-name או הגדר POSTGRES_DB")
        sys.exit(1)
    
    if not args.target_name:
        print("❌ שגיאה: לא צוין database יעד")
        sys.exit(1)
    
    try:
        clone_database(
            source_db=args.source_name,
            target_db=args.target_name,
            force=args.force
        )
    except DatabaseCloneError as e:
        print()
        print(str(e))
        sys.exit(1)
    except KeyboardInterrupt:
        print()
        print("❌ בוטל על ידי המשתמש")
        sys.exit(1)
    except Exception as e:
        print()
        print(f"❌ שגיאה לא צפויה: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()

