"""
Safe Schema Migration Utility

This utility provides safe methods for database schema changes with automatic
backup creation, data preservation, and rollback capabilities.

Author: TikTrack Development Team
Version: 1.0
Last Updated: 2025-10-29
"""

import sqlite3
import shutil
import os
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class SafeSchemaMigration:
    """
    Safe database schema migration utility.
    
    Provides methods for safely modifying database schema with:
    - Automatic backup creation
    - Data preservation during changes
    - Rollback capabilities
    - Validation checks
    """
    
    def __init__(self, db_path: str):
        """
        Initialize the migration utility.
        
        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        self.backup_path = None
        self.original_schema = {}
        self.migration_log = []
        
    def create_backup(self, backup_suffix: str = None) -> str:
        """
        Create a backup of the database.
        
        Args:
            backup_suffix: Optional suffix for backup filename
            
        Returns:
            str: Path to the backup file
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if backup_suffix:
            backup_name = f"{os.path.basename(self.db_path)}_backup_{backup_suffix}_{timestamp}.db"
        else:
            backup_name = f"{os.path.basename(self.db_path)}_backup_{timestamp}.db"
        
        backup_dir = os.path.dirname(self.db_path)
        self.backup_path = os.path.join(backup_dir, backup_name)
        
        try:
            shutil.copy2(self.db_path, self.backup_path)
            logger.info(f"✅ Created backup: {self.backup_path}")
            self.migration_log.append(f"Backup created: {self.backup_path}")
            return self.backup_path
        except Exception as e:
            logger.error(f"❌ Failed to create backup: {str(e)}")
            raise Exception(f"Backup creation failed: {str(e)}")
    
    def get_table_schema(self, table_name: str) -> Dict[str, Any]:
        """
        Get current table schema.
        
        Args:
            table_name: Name of the table
            
        Returns:
            Dict[str, Any]: Table schema information
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Get table info
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            # Get constraints
            cursor.execute(f"SELECT * FROM constraints WHERE table_name = '{table_name}'")
            constraints = cursor.fetchall()
            
            schema = {
                'columns': columns,
                'constraints': constraints,
                'exists': len(columns) > 0
            }
            
            return schema
        except Exception as e:
            logger.error(f"❌ Failed to get schema for {table_name}: {str(e)}")
            return {'exists': False, 'error': str(e)}
        finally:
            conn.close()
    
    def modify_column_nullable(self, table_name: str, column_name: str, 
                              nullable: bool = True) -> bool:
        """
        Modify column nullable status safely.
        
        Args:
            table_name: Name of the table
            column_name: Name of the column
            nullable: Whether column should be nullable
            
        Returns:
            bool: Success status
        """
        try:
            # Create backup first
            self.create_backup(f"nullable_{table_name}_{column_name}")
            
            # Get current schema
            current_schema = self.get_table_schema(table_name)
            if not current_schema['exists']:
                raise Exception(f"Table {table_name} does not exist")
            
            # Check if column exists
            column_exists = any(col[1] == column_name for col in current_schema['columns'])
            if not column_exists:
                raise Exception(f"Column {column_name} does not exist in {table_name}")
            
            # Get all data from table
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get all data
            cursor.execute(f"SELECT * FROM {table_name}")
            data = cursor.fetchall()
            
            # Get column names
            column_names = [col[1] for col in current_schema['columns']]
            
            # Create new table with modified column
            new_table_name = f"{table_name}_new"
            
            # Build CREATE TABLE statement
            create_sql = f"CREATE TABLE {new_table_name} ("
            column_definitions = []
            
            for col in current_schema['columns']:
                col_name = col[1]
                col_type = col[2]
                not_null = "NOT NULL" if col[3] else ""
                default_val = f"DEFAULT {col[4]}" if col[4] else ""
                pk = "PRIMARY KEY" if col[5] else ""
                
                if col_name == column_name:
                    not_null = "" if nullable else "NOT NULL"
                
                col_def = f"{col_name} {col_type} {not_null} {default_val} {pk}".strip()
                column_definitions.append(col_def)
            
            create_sql += ", ".join(column_definitions) + ")"
            
            # Create new table
            cursor.execute(create_sql)
            
            # Copy data if table has data
            if data:
                placeholders = ", ".join(["?" for _ in column_names])
                cursor.execute(f"INSERT INTO {new_table_name} SELECT * FROM {table_name}")
            
            # Drop old table
            cursor.execute(f"DROP TABLE {table_name}")
            
            # Rename new table
            cursor.execute(f"ALTER TABLE {new_table_name} RENAME TO {table_name}")
            
            # Recreate indexes
            cursor.execute(f"CREATE INDEX ix_{table_name}_id ON {table_name} (id)")
            
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Successfully modified {table_name}.{column_name} nullable status")
            self.migration_log.append(f"Modified {table_name}.{column_name} nullable to {nullable}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to modify column nullable: {str(e)}")
            self.migration_log.append(f"ERROR: Failed to modify column nullable: {str(e)}")
            return False
    
    def add_column_safe(self, table_name: str, column_name: str, 
                       column_type: str, nullable: bool = True, 
                       default_value: Any = None) -> bool:
        """
        Add column safely with data preservation.
        
        Args:
            table_name: Name of the table
            column_name: Name of the new column
            column_type: SQLite type for the column
            nullable: Whether column should be nullable
            default_value: Default value for existing rows
            
        Returns:
            bool: Success status
        """
        try:
            # Create backup first
            self.create_backup(f"add_column_{table_name}_{column_name}")
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if column already exists
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            column_exists = any(col[1] == column_name for col in columns)
            
            if column_exists:
                logger.warning(f"Column {column_name} already exists in {table_name}")
                return True
            
            # Build ALTER TABLE statement
            not_null = "" if nullable else "NOT NULL"
            default_clause = f"DEFAULT {default_value}" if default_value is not None else ""
            
            alter_sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type} {not_null} {default_clause}".strip()
            
            # Execute ALTER TABLE
            cursor.execute(alter_sql)
            
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Successfully added column {column_name} to {table_name}")
            self.migration_log.append(f"Added column {column_name} to {table_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to add column: {str(e)}")
            self.migration_log.append(f"ERROR: Failed to add column: {str(e)}")
            return False
    
    def migrate_data(self, source_table: str, target_table: str, 
                    column_mapping: Dict[str, str] = None) -> bool:
        """
        Migrate data from source table to target table.
        
        Args:
            source_table: Source table name
            target_table: Target table name
            column_mapping: Mapping of source columns to target columns
            
        Returns:
            bool: Success status
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get source data
            cursor.execute(f"SELECT * FROM {source_table}")
            data = cursor.fetchall()
            
            if not data:
                logger.info(f"No data to migrate from {source_table}")
                return True
            
            # Get column names
            cursor.execute(f"PRAGMA table_info({source_table})")
            source_columns = [col[1] for col in cursor.fetchall()]
            
            cursor.execute(f"PRAGMA table_info({target_table})")
            target_columns = [col[1] for col in cursor.fetchall()]
            
            # Use column mapping or direct mapping
            if column_mapping:
                select_columns = [column_mapping.get(col, col) for col in source_columns]
            else:
                select_columns = source_columns
            
            # Insert data
            placeholders = ", ".join(["?" for _ in select_columns])
            insert_sql = f"INSERT INTO {target_table} ({', '.join(select_columns)}) VALUES ({placeholders})"
            
            cursor.executemany(insert_sql, data)
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Successfully migrated {len(data)} rows from {source_table} to {target_table}")
            self.migration_log.append(f"Migrated {len(data)} rows from {source_table} to {target_table}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to migrate data: {str(e)}")
            self.migration_log.append(f"ERROR: Failed to migrate data: {str(e)}")
            return False
    
    def rollback(self) -> bool:
        """
        Rollback to the backup.
        
        Returns:
            bool: Success status
        """
        if not self.backup_path or not os.path.exists(self.backup_path):
            logger.error("❌ No backup found for rollback")
            return False
        
        try:
            # Create current state backup before rollback
            current_backup = f"{self.db_path}_before_rollback_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
            shutil.copy2(self.db_path, current_backup)
            
            # Restore from backup
            shutil.copy2(self.backup_path, self.db_path)
            
            logger.info(f"✅ Successfully rolled back to {self.backup_path}")
            self.migration_log.append(f"Rolled back to {self.backup_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to rollback: {str(e)}")
            self.migration_log.append(f"ERROR: Failed to rollback: {str(e)}")
            return False
    
    def get_migration_log(self) -> List[str]:
        """
        Get migration log.
        
        Returns:
            List[str]: Migration log entries
        """
        return self.migration_log
    
    def validate_table_integrity(self, table_name: str) -> Dict[str, Any]:
        """
        Validate table integrity after migration.
        
        Args:
            table_name: Name of the table to validate
            
        Returns:
            Dict[str, Any]: Validation results
        """
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if table exists
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
            table_exists = cursor.fetchone() is not None
            
            if not table_exists:
                return {'valid': False, 'error': 'Table does not exist'}
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            row_count = cursor.fetchone()[0]
            
            # Check for NULL values in NOT NULL columns
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            null_violations = []
            for col in columns:
                col_name = col[1]
                is_not_null = col[3]
                
                if is_not_null:
                    cursor.execute(f"SELECT COUNT(*) FROM {table_name} WHERE {col_name} IS NULL")
                    null_count = cursor.fetchone()[0]
                    if null_count > 0:
                        null_violations.append(f"{col_name}: {null_count} NULL values")
            
            conn.close()
            
            return {
                'valid': len(null_violations) == 0,
                'row_count': row_count,
                'null_violations': null_violations,
                'table_exists': table_exists
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to validate table integrity: {str(e)}")
            return {'valid': False, 'error': str(e)}
