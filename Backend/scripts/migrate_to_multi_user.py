#!/usr/bin/env python3
"""
Migration Script: Multi-User System Implementation
===================================================

This script migrates the database to support multi-user functionality:
1. Creates backup of database
2. Adds user_id columns to all user-specific entities
3. Creates default user if not exists
4. Migrates all existing data to default user
5. Creates user_tickers junction table
6. Migrates all tickers to default user's ticker list

Author: TikTrack Development Team
Date: December 2025
Version: 1.0
"""

import os
import sys
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
import logging

# Add Backend directory to path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import text, inspect
from sqlalchemy.orm import Session
from config.database import SessionLocal, engine
from models.user import User
from models.user_ticker import UserTicker
from models.ticker import Ticker

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MultiUserMigration:
    """Handles migration to multi-user system"""
    
    def __init__(self):
        self.backup_dir = backend_path.parent / "backup" / f"multi_user_migration_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.migration_log = []
        self.default_user_id: Optional[int] = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log migration progress"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_message = f"[{timestamp}] {message}"
        print(log_message)
        self.migration_log.append(log_message)
        if level == "ERROR":
            logger.error(message)
        elif level == "WARNING":
            logger.warning(message)
        else:
            logger.info(message)
    
    def create_backup(self):
        """Create backup of PostgreSQL database"""
        self.log("Creating database backup...")
        
        try:
            # Create backup directory
            self.backup_dir.mkdir(parents=True, exist_ok=True)
            
            # Get database connection info from environment or settings
            from config.settings import DATABASE_URL
            import re
            
            # Parse DATABASE_URL to get connection details
            # Format: postgresql://user:password@host:port/dbname
            match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', DATABASE_URL)
            if not match:
                self.log("Could not parse DATABASE_URL, skipping backup", "WARNING")
                return
            
            user, password, host, port, dbname = match.groups()
            
            # Create backup filename
            backup_file = self.backup_dir / f"{dbname}_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
            
            # Set PGPASSWORD environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = password
            
            # Run pg_dump
            cmd = [
                'pg_dump',
                '-h', host,
                '-p', port,
                '-U', user,
                '-d', dbname,
                '-F', 'c',  # Custom format (compressed)
                '-f', str(backup_file)
            ]
            
            self.log(f"Running pg_dump: {' '.join(cmd[:6])} ...")
            result = subprocess.run(cmd, env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log(f"✅ Database backup created: {backup_file}")
            else:
                self.log(f"⚠️ Backup failed: {result.stderr}", "WARNING")
                self.log("Continuing without backup...", "WARNING")
                
        except Exception as e:
            self.log(f"⚠️ Error creating backup: {e}", "WARNING")
            self.log("Continuing without backup...", "WARNING")
    
    def column_exists(self, db: Session, table_name: str, column_name: str) -> bool:
        """Check if a column exists in a table"""
        try:
            inspector = inspect(engine)
            columns = [col['name'] for col in inspector.get_columns(table_name)]
            return column_name in columns
        except Exception as e:
            self.log(f"Error checking column {table_name}.{column_name}: {e}", "WARNING")
            return False
    
    def table_exists(self, db: Session, table_name: str) -> bool:
        """Check if a table exists"""
        try:
            inspector = inspect(engine)
            return table_name in inspector.get_table_names()
        except Exception as e:
            self.log(f"Error checking table {table_name}: {e}", "WARNING")
            return False
    
    def add_user_id_columns(self, db: Session):
        """Add user_id columns to all user-specific entities"""
        self.log("Adding user_id columns to entities...")
        
        # List of tables that need user_id
        tables_to_migrate = [
            'trading_accounts',
            'trades',
            'trade_plans',
            'executions',
            'cash_flows',
            'alerts',
            'notes',
            'import_sessions'
        ]
        
        for table_name in tables_to_migrate:
            if not self.table_exists(db, table_name):
                self.log(f"⚠️ Table {table_name} does not exist, skipping", "WARNING")
                continue
            
            if self.column_exists(db, table_name, 'user_id'):
                self.log(f"✅ Column {table_name}.user_id already exists")
                continue
            
            try:
                # Add user_id column (nullable first, we'll set values later)
                db.execute(text(f"""
                    ALTER TABLE {table_name}
                    ADD COLUMN user_id INTEGER
                """))
                
                # Add foreign key constraint
                db.execute(text(f"""
                    ALTER TABLE {table_name}
                    ADD CONSTRAINT fk_{table_name}_user_id
                    FOREIGN KEY (user_id) REFERENCES users(id)
                """))
                
                # Add index for performance
                db.execute(text(f"""
                    CREATE INDEX IF NOT EXISTS idx_{table_name}_user_id
                    ON {table_name}(user_id)
                """))
                
                db.commit()
                self.log(f"✅ Added user_id column to {table_name}")
                
            except Exception as e:
                db.rollback()
                self.log(f"❌ Error adding user_id to {table_name}: {e}", "ERROR")
                raise
    
    def create_default_user(self, db: Session) -> int:
        """Create default user if not exists, return user_id"""
        self.log("Creating/checking default user...")
        
        try:
            # Check if default user exists
            result = db.execute(text("SELECT id FROM users WHERE is_default = true LIMIT 1"))
            row = result.fetchone()
            
            if row:
                user_id = row[0]
                self.log(f"✅ Default user already exists (ID: {user_id})")
                return user_id
            
            # Create default user
            default_username = "default_user"
            default_password = "default_password_change_me"  # Should be changed after migration
            
            # Check if username already exists
            result = db.execute(text("SELECT id FROM users WHERE username = :username"), {"username": default_username})
            existing = result.fetchone()
            
            if existing:
                # Update existing user to be default
                user_id = existing[0]
                db.execute(text("UPDATE users SET is_default = true WHERE id = :id"), {"id": user_id})
                db.commit()
                self.log(f"✅ Updated existing user to default (ID: {user_id})")
                return user_id
            
            # Create new default user
            from models.user import User
            from datetime import datetime
            
            # Hash password
            import bcrypt
            password_hash = bcrypt.hashpw(default_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Insert default user
            result = db.execute(text("""
                INSERT INTO users (username, password_hash, is_active, is_default, created_at, updated_at)
                VALUES (:username, :password_hash, true, true, :created_at, :updated_at)
                RETURNING id
            """), {
                "username": default_username,
                "password_hash": password_hash,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            
            user_id = result.fetchone()[0]
            db.commit()
            
            self.log(f"✅ Created default user (ID: {user_id}, username: {default_username})")
            self.log(f"⚠️ IMPORTANT: Change default user password after migration!", "WARNING")
            
            return user_id
            
        except Exception as e:
            db.rollback()
            self.log(f"❌ Error creating default user: {e}", "ERROR")
            raise
    
    def migrate_data_to_default_user(self, db: Session, default_user_id: int):
        """Migrate all existing data to default user"""
        self.log(f"Migrating existing data to default user (ID: {default_user_id})...")
        
        tables_to_migrate = [
            'trading_accounts',
            'trades',
            'trade_plans',
            'executions',
            'cash_flows',
            'alerts',
            'notes',
            'import_sessions'
        ]
        
        for table_name in tables_to_migrate:
            if not self.table_exists(db, table_name):
                continue
            
            if not self.column_exists(db, table_name, 'user_id'):
                continue
            
            try:
                # Count rows without user_id
                result = db.execute(text(f"SELECT COUNT(*) FROM {table_name} WHERE user_id IS NULL"))
                count = result.fetchone()[0]
                
                if count == 0:
                    self.log(f"✅ {table_name}: No rows to migrate")
                    continue
                
                # Update all NULL user_id to default_user_id
                db.execute(text(f"""
                    UPDATE {table_name}
                    SET user_id = :user_id
                    WHERE user_id IS NULL
                """), {"user_id": default_user_id})
                
                db.commit()
                self.log(f"✅ {table_name}: Migrated {count} rows to default user")
                
            except Exception as e:
                db.rollback()
                self.log(f"❌ Error migrating {table_name}: {e}", "ERROR")
                raise
    
    def make_user_id_not_null(self, db: Session):
        """Make user_id NOT NULL after data migration"""
        self.log("Making user_id columns NOT NULL...")
        
        tables_to_update = [
            'trading_accounts',
            'trades',
            'trade_plans',
            'executions',
            'cash_flows',
            'alerts',
            'notes',
            'import_sessions'
        ]
        
        for table_name in tables_to_update:
            if not self.table_exists(db, table_name):
                continue
            
            if not self.column_exists(db, table_name, 'user_id'):
                continue
            
            try:
                # Check if there are any NULL values
                result = db.execute(text(f"SELECT COUNT(*) FROM {table_name} WHERE user_id IS NULL"))
                null_count = result.fetchone()[0]
                
                if null_count > 0:
                    self.log(f"⚠️ {table_name}: {null_count} rows still have NULL user_id", "WARNING")
                    continue
                
                # Make column NOT NULL
                db.execute(text(f"""
                    ALTER TABLE {table_name}
                    ALTER COLUMN user_id SET NOT NULL
                """))
                
                db.commit()
                self.log(f"✅ {table_name}.user_id is now NOT NULL")
                
            except Exception as e:
                db.rollback()
                self.log(f"❌ Error making {table_name}.user_id NOT NULL: {e}", "ERROR")
                # Don't raise - this is not critical if migration already worked
    
    def create_user_tickers_table(self, db: Session):
        """Create user_tickers junction table"""
        self.log("Creating user_tickers table...")
        
        if self.table_exists(db, 'user_tickers'):
            self.log("✅ user_tickers table already exists")
            return
        
        try:
            # Create table using SQLAlchemy model
            from models.user_ticker import UserTicker
            UserTicker.__table__.create(bind=engine, checkfirst=True)
            
            db.commit()
            self.log("✅ Created user_tickers table")
            
        except Exception as e:
            db.rollback()
            self.log(f"❌ Error creating user_tickers table: {e}", "ERROR")
            raise
    
    def migrate_tickers_to_default_user(self, db: Session, default_user_id: int):
        """Migrate all existing tickers to default user's ticker list"""
        self.log(f"Migrating tickers to default user (ID: {default_user_id})...")
        
        if not self.table_exists(db, 'user_tickers'):
            self.log("⚠️ user_tickers table does not exist", "WARNING")
            return
        
        if not self.table_exists(db, 'tickers'):
            self.log("⚠️ tickers table does not exist", "WARNING")
            return
        
        try:
            # Get all ticker IDs
            result = db.execute(text("SELECT id FROM tickers"))
            ticker_ids = [row[0] for row in result.fetchall()]
            
            if not ticker_ids:
                self.log("✅ No tickers to migrate")
                return
            
            # Insert into user_tickers (ignore duplicates)
            inserted_count = 0
            for ticker_id in ticker_ids:
                try:
                    # Check if already exists
                    check_result = db.execute(text("""
                        SELECT COUNT(*) FROM user_tickers 
                        WHERE user_id = :user_id AND ticker_id = :ticker_id
                    """), {
                        "user_id": default_user_id,
                        "ticker_id": ticker_id
                    })
                    if check_result.fetchone()[0] > 0:
                        continue
                    
                    db.execute(text("""
                        INSERT INTO user_tickers (user_id, ticker_id, created_at)
                        VALUES (:user_id, :ticker_id, :created_at)
                    """), {
                        "user_id": default_user_id,
                        "ticker_id": ticker_id,
                        "created_at": datetime.utcnow()
                    })
                    inserted_count += 1
                except Exception as e:
                    # Skip if already exists
                    pass
            
            db.commit()
            self.log(f"✅ Migrated {inserted_count} tickers to default user's list")
            
        except Exception as e:
            db.rollback()
            self.log(f"❌ Error migrating tickers: {e}", "ERROR")
            raise
    
    def verify_migration(self, db: Session, default_user_id: int):
        """Verify migration was successful"""
        self.log("Verifying migration...")
        
        issues = []
        
        # Check all tables have user_id
        tables_to_check = [
            'trading_accounts',
            'trades',
            'trade_plans',
            'executions',
            'cash_flows',
            'alerts',
            'notes',
            'import_sessions'
        ]
        
        for table_name in tables_to_check:
            if not self.table_exists(db, table_name):
                continue
            
            if not self.column_exists(db, table_name, 'user_id'):
                issues.append(f"{table_name} missing user_id column")
                continue
            
            # Check for NULL values
            result = db.execute(text(f"SELECT COUNT(*) FROM {table_name} WHERE user_id IS NULL"))
            null_count = result.fetchone()[0]
            if null_count > 0:
                issues.append(f"{table_name} has {null_count} rows with NULL user_id")
            
            # Check all rows belong to default user or other users
            result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            total_count = result.fetchone()[0]
            result = db.execute(text(f"SELECT COUNT(*) FROM {table_name} WHERE user_id = :user_id"), {"user_id": default_user_id})
            default_count = result.fetchone()[0]
            
            if total_count > 0 and default_count == 0:
                issues.append(f"{table_name} has {total_count} rows but none belong to default user")
        
        # Check user_tickers table
        if self.table_exists(db, 'user_tickers'):
            result = db.execute(text("SELECT COUNT(*) FROM user_tickers WHERE user_id = :user_id"), {"user_id": default_user_id})
            ticker_count = result.fetchone()[0]
            self.log(f"✅ Default user has {ticker_count} tickers in their list")
        else:
            issues.append("user_tickers table does not exist")
        
        if issues:
            self.log("⚠️ Migration verification found issues:", "WARNING")
            for issue in issues:
                self.log(f"  - {issue}", "WARNING")
        else:
            self.log("✅ Migration verification passed!")
    
    def run(self):
        """Run the complete migration"""
        self.log("=" * 60)
        self.log("Starting Multi-User System Migration")
        self.log("=" * 60)
        
        db: Session = SessionLocal()
        
        try:
            # Step 1: Create backup
            self.create_backup()
            
            # Step 2: Add user_id columns
            self.add_user_id_columns(db)
            
            # Step 3: Create default user
            self.default_user_id = self.create_default_user(db)
            
            # Step 4: Migrate existing data to default user
            self.migrate_data_to_default_user(db, self.default_user_id)
            
            # Step 5: Make user_id NOT NULL
            self.make_user_id_not_null(db)
            
            # Step 6: Create user_tickers table
            self.create_user_tickers_table(db)
            
            # Step 7: Migrate tickers to default user
            self.migrate_tickers_to_default_user(db, self.default_user_id)
            
            # Step 8: Verify migration
            self.verify_migration(db, self.default_user_id)
            
            self.log("=" * 60)
            self.log("✅ Migration completed successfully!")
            self.log("=" * 60)
            self.log(f"⚠️ IMPORTANT: Change default user password!", "WARNING")
            self.log(f"   Default username: default_user", "WARNING")
            self.log(f"   Default password: default_password_change_me", "WARNING")
            
        except Exception as e:
            self.log(f"❌ Migration failed: {e}", "ERROR")
            import traceback
            self.log(traceback.format_exc(), "ERROR")
            raise
        finally:
            db.close()


def main():
    """Main entry point"""
    migration = MultiUserMigration()
    migration.run()


if __name__ == "__main__":
    main()

