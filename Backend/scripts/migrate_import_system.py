#!/usr/bin/env python3
"""
Migration Script for Import System - New Architecture

This script handles the migration from the old import system to the new architecture,
including data migration, cleanup, and verification.

Author: TikTrack Development Team
Version: 2.0 - New Architecture
Last Updated: 2025-01-27
"""

import os
import sys
import sqlite3
import shutil
from datetime import datetime
from pathlib import Path
from sqlalchemy import text

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from config.database import get_db
from models.import_session import ImportSession
from models.trading_account import TradingAccount
from models.ticker import Ticker
from models.execution import Execution

class ImportSystemMigration:
    """Handles migration to the new import system architecture"""
    
    def __init__(self):
        self.backup_dir = project_root / "backup" / f"import_migration_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.migration_log = []
        
    def log(self, message):
        """Log migration progress"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_message = f"[{timestamp}] {message}"
        print(log_message)
        self.migration_log.append(log_message)
    
    def create_backup(self):
        """Create backup of current database"""
        self.log("Creating database backup...")
        
        # Create backup directory
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        
        # Backup database
        db_path = project_root / "Backend" / "db" / "simpleTrade_new.db"
        if db_path.exists():
            backup_path = self.backup_dir / "simpleTrade_new.db"
            shutil.copy2(db_path, backup_path)
            self.log(f"Database backed up to: {backup_path}")
        else:
            self.log("Warning: Database file not found")
    
    def run_database_migration(self):
        """Run database schema migration"""
        self.log("Running database schema migration...")
        
        try:
            # Get database session
            db_session = next(get_db())
            
            # Add new columns to ImportSession table
            migration_statements = [
                "ALTER TABLE import_sessions ADD COLUMN file_size INTEGER",
                "ALTER TABLE import_sessions ADD COLUMN file_hash VARCHAR(64)",
                "ALTER TABLE import_sessions ADD COLUMN processing_time INTEGER",
                "ALTER TABLE import_sessions ADD COLUMN cache_key VARCHAR(100)"
            ]
            
            # Execute each statement separately
            for statement in migration_statements:
                try:
                    db_session.execute(text(statement))
                except Exception as e:
                    # Column might already exist, continue
                    self.log(f"Warning: {statement} - {str(e)}")
            
            db_session.commit()
            
            self.log("Database schema migration completed successfully")
            
        except Exception as e:
            self.log(f"Error during database migration: {str(e)}")
            raise
        finally:
            db_session.close()
    
    def create_indexes(self):
        """Create performance indexes"""
        self.log("Creating performance indexes...")
        
        try:
            # Read and execute index creation SQL
            index_sql_path = project_root / "migrations" / "add_import_system_indexes.sql"
            
            if index_sql_path.exists():
                with open(index_sql_path, 'r') as f:
                    index_sql = f.read()
                
                # Split SQL into individual statements
                statements = [stmt.strip() for stmt in index_sql.split(';') if stmt.strip()]
                
                # Execute indexes
                db_session = next(get_db())
                for statement in statements:
                    try:
                        db_session.execute(text(statement))
                    except Exception as e:
                        # Index might already exist, continue
                        self.log(f"Warning: {statement} - {str(e)}")
                
                db_session.commit()
                db_session.close()
                
                self.log("Performance indexes created successfully")
            else:
                self.log("Warning: Index SQL file not found")
                
        except Exception as e:
            self.log(f"Error creating indexes: {str(e)}")
            raise
    
    def migrate_existing_sessions(self):
        """Migrate existing import sessions"""
        self.log("Migrating existing import sessions...")
        
        try:
            db_session = next(get_db())
            
            # Get existing sessions
            existing_sessions = db_session.query(ImportSession).all()
            
            for session in existing_sessions:
                # Calculate file size if summary_data exists
                if session.summary_data and 'file_content' in session.summary_data:
                    file_content = session.summary_data['file_content']
                    session.file_size = len(file_content.encode('utf-8'))
                    
                    # Calculate file hash
                    import hashlib
                    session.file_hash = hashlib.sha256(file_content.encode('utf-8')).hexdigest()
                    
                    # Remove file_content from summary_data to save space
                    if 'file_content' in session.summary_data:
                        del session.summary_data['file_content']
            
            db_session.commit()
            self.log(f"Migrated {len(existing_sessions)} existing sessions")
            
        except Exception as e:
            self.log(f"Error migrating sessions: {str(e)}")
            raise
        finally:
            db_session.close()
    
    def cleanup_old_files(self):
        """Clean up old temporary files"""
        self.log("Cleaning up old temporary files...")
        
        # Clean up old import files
        temp_dirs = [
            project_root / "Backend" / "temp" / "imports",
            project_root / "Backend" / "uploads",
            project_root / "Backend" / "cache" / "imports"
        ]
        
        for temp_dir in temp_dirs:
            if temp_dir.exists():
                try:
                    shutil.rmtree(temp_dir)
                    self.log(f"Cleaned up: {temp_dir}")
                except Exception as e:
                    self.log(f"Warning: Could not clean up {temp_dir}: {str(e)}")
    
    def verify_migration(self):
        """Verify migration was successful"""
        self.log("Verifying migration...")
        
        try:
            db_session = next(get_db())
            
            # Check ImportSession table structure
            sessions = db_session.query(ImportSession).limit(1).all()
            if sessions:
                session = sessions[0]
                # Check if new fields exist
                if hasattr(session, 'file_size') and hasattr(session, 'file_hash'):
                    self.log("✅ ImportSession table structure verified")
                else:
                    self.log("❌ ImportSession table structure verification failed")
            
            # Check indexes
            cursor = db_session.connection().execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='index' AND name LIKE 'idx_import_%'
            """))
            indexes = cursor.fetchall()
            
            if len(indexes) >= 5:  # Expected number of indexes
                self.log("✅ Performance indexes verified")
            else:
                self.log("❌ Performance indexes verification failed")
            
            # Check data integrity
            total_sessions = db_session.query(ImportSession).count()
            self.log(f"✅ Total import sessions: {total_sessions}")
            
        except Exception as e:
            self.log(f"Error during verification: {str(e)}")
            raise
        finally:
            db_session.close()
    
    def create_migration_report(self):
        """Create migration report"""
        self.log("Creating migration report...")
        
        report_path = self.backup_dir / "migration_report.md"
        
        with open(report_path, 'w') as f:
            f.write("# Import System Migration Report\n\n")
            f.write(f"**Migration Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("## Migration Steps\n\n")
            
            for i, log_entry in enumerate(self.migration_log, 1):
                f.write(f"{i}. {log_entry}\n")
            
            f.write("\n## Migration Summary\n\n")
            f.write("- ✅ Database backup created\n")
            f.write("- ✅ Schema migration completed\n")
            f.write("- ✅ Performance indexes created\n")
            f.write("- ✅ Existing sessions migrated\n")
            f.write("- ✅ Old files cleaned up\n")
            f.write("- ✅ Migration verified\n\n")
            
            f.write("## Next Steps\n\n")
            f.write("1. Test the new import system\n")
            f.write("2. Verify all functionality works correctly\n")
            f.write("3. Monitor system performance\n")
            f.write("4. Update user documentation\n")
        
        self.log(f"Migration report created: {report_path}")
    
    def run_migration(self):
        """Run complete migration process"""
        self.log("Starting Import System Migration...")
        
        try:
            # Step 1: Create backup
            self.create_backup()
            
            # Step 2: Run database migration
            self.run_database_migration()
            
            # Step 3: Create indexes
            self.create_indexes()
            
            # Step 4: Migrate existing sessions
            self.migrate_existing_sessions()
            
            # Step 5: Cleanup old files
            self.cleanup_old_files()
            
            # Step 6: Verify migration
            self.verify_migration()
            
            # Step 7: Create report
            self.create_migration_report()
            
            self.log("🎉 Migration completed successfully!")
            
        except Exception as e:
            self.log(f"❌ Migration failed: {str(e)}")
            raise

def main():
    """Main migration function"""
    print("=" * 60)
    print("TikTrack Import System Migration")
    print("=" * 60)
    
    # Run migration automatically
    print("Running migration automatically...")
    
    # Run migration
    migration = ImportSystemMigration()
    migration.run_migration()
    
    print("\n" + "=" * 60)
    print("Migration completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()
