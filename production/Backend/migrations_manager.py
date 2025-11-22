#!/usr/bin/env python3
"""
Database Migrations Manager
Database migrations manager

✅ Database change management
✅ Change history
✅ Rollback to previous changes
✅ Integrity checking
"""

import os
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any

class MigrationManager:
    def __init__(self, db_path: str = "db/simpleTrade_new.db"):
        self.db_path = db_path
        self.migrations_table = "schema_migrations"
        self.migrations_dir = "migrations"
        
        # Create migrations directory if it doesn't exist
        if not os.path.exists(self.migrations_dir):
            os.makedirs(self.migrations_dir)
            
        # Create migrations table if it doesn't exist
        self._create_migrations_table()
        
    def _create_migrations_table(self):
        """Create migrations table"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(f"""
            CREATE TABLE IF NOT EXISTS {self.migrations_table} (
                id INTEGER PRIMARY KEY,
                version VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(200) NOT NULL,
                sql_up TEXT NOT NULL,
                sql_down TEXT,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(20) DEFAULT 'applied'
            )
        """)
        
        conn.commit()
        conn.close()
        
    def create_migration(self, name: str, sql_up: str, sql_down: str = None) -> str:
        """Create new migration"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        version = f"migration_{timestamp}"
        
        migration_data = {
            "version": version,
            "name": name,
            "sql_up": sql_up,
            "sql_down": sql_down,
            "created_at": datetime.now().isoformat()
        }
        
        # Save migration to file
        filename = f"{self.migrations_dir}/{version}_{name}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(migration_data, f, indent=2, ensure_ascii=False)
            
        return version
        
    def apply_migration(self, version: str) -> bool:
        """Apply migration"""
        try:
            # Read migration from file
            migration_file = None
            for filename in os.listdir(self.migrations_dir):
                if filename.startswith(version) and filename.endswith('.json'):
                    migration_file = os.path.join(self.migrations_dir, filename)
                    break
                    
            if not migration_file:
                return False
                
            with open(migration_file, 'r', encoding='utf-8') as f:
                migration = json.load(f)
                
            # Check if already applied
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(f"SELECT COUNT(*) FROM {self.migrations_table} WHERE version = ?", (version,))
            if cursor.fetchone()[0] > 0:
                conn.close()
                return True
                
            # Apply SQL - execute statements one by one
            sql_statements = migration['sql_up'].split(';')
            
            for statement in sql_statements:
                statement = statement.strip()
                if statement:  # Only if there's content
                    try:
                        cursor.execute(statement)
                    except Exception as e:
                        conn.rollback()
                        conn.close()
                        return False
            
            # Record in migrations table
            cursor.execute(f"""
                INSERT INTO {self.migrations_table} (version, name, sql_up, sql_down)
                VALUES (?, ?, ?, ?)
            """, (version, migration['name'], migration['sql_up'], migration.get('sql_down')))
            
            conn.commit()
            conn.close()
            
            return True
            
        except Exception as e:
            return False
            
    def rollback_migration(self, version: str) -> bool:
        """Rollback migration"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if applied
            cursor.execute(f"SELECT sql_down FROM {self.migrations_table} WHERE version = ?", (version,))
            result = cursor.fetchone()
            
            if not result:
                conn.close()
                return False
                
            sql_down = result[0]
            if not sql_down:
                conn.close()
                return False
                
            # Execute rollback
            cursor.execute(sql_down)
            
            # Delete from table
            cursor.execute(f"DELETE FROM {self.migrations_table} WHERE version = ?", (version,))
            
            conn.commit()
            conn.close()
            
            return True
            
        except Exception as e:
            return False
            
    def get_applied_migrations(self) -> List[Dict[str, Any]]:
        """Get list of applied migrations"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(f"SELECT version, name, applied_at FROM {self.migrations_table} ORDER BY applied_at")
        migrations = []
        
        for row in cursor.fetchall():
            migrations.append({
                "version": row[0],
                "name": row[1],
                "applied_at": row[2]
            })
            
        conn.close()
        return migrations
        
    def get_pending_migrations(self) -> List[str]:
        """Get list of pending migrations"""
        applied = {m["version"] for m in self.get_applied_migrations()}
        pending = []
        
        for filename in os.listdir(self.migrations_dir):
            if filename.endswith('.json'):
                version = filename.split('_')[0] + '_' + filename.split('_')[1]
                if version not in applied:
                    pending.append(version)
                    
        return sorted(pending)
        
    def migrate_all(self) -> bool:
        """Apply all pending migrations"""
        pending = self.get_pending_migrations()
        
        if not pending:
            return True
            
        
        for version in pending:
            if not self.apply_migration(version):
                return False
                
        return True
        
    def status(self):
        """Display migrations status"""
        applied = self.get_applied_migrations()
        pending = self.get_pending_migrations()
        
        
        if applied:
            for migration in applied:
                print(f"Applied: {migration}")
                
        if pending:
            for version in pending:
                print(f"Pending: {version}")

# Create migration for current issue
def create_notes_migration():
    """Create migration to fix notes table"""
    manager = MigrationManager()
    
    sql_up = """
    -- Create note_relation_types table
    CREATE TABLE IF NOT EXISTS note_relation_types (
        id INTEGER PRIMARY KEY,
        note_relation_type VARCHAR(20) NOT NULL UNIQUE
    );
    
    -- Add relation types
    INSERT OR IGNORE INTO note_relation_types (id, note_relation_type) VALUES 
        (1, 'account'),
        (2, 'trade'),
        (3, 'trade_plan');
    
    -- Create new table with correct structure
    CREATE TABLE notes_new (
        id INTEGER NOT NULL PRIMARY KEY,
        content VARCHAR(1000) NOT NULL,
        attachment VARCHAR(500),
        created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
        related_type_id INTEGER REFERENCES note_relation_types(id),
        related_id INTEGER
    );
    
    -- Copy data from old table
    INSERT INTO notes_new (id, content, attachment, created_at, related_type_id, related_id)
    SELECT 
        id,
        content,
        attachment,
        created_at,
        CASE 
            WHEN trading_account_id IS NOT NULL THEN 1
            WHEN trade_id IS NOT NULL THEN 2
            WHEN trade_plan_id IS NOT NULL THEN 3
        END as related_type_id,
        COALESCE(trading_account_id, trade_id, trade_plan_id) as related_id
    FROM notes;
    
    -- Delete old table
    DROP TABLE notes;
    
    -- Rename new table
    ALTER TABLE notes_new RENAME TO notes;
    """
    
    sql_down = """
    -- Create table with old structure
    CREATE TABLE notes_old (
        id INTEGER NOT NULL PRIMARY KEY,
        content VARCHAR(1000) NOT NULL,
        attachment VARCHAR(500),
        created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
        trading_account_id INTEGER,
        trade_id INTEGER,
        trade_plan_id INTEGER
    );
    
    -- Copy data back
    INSERT INTO notes_old (id, content, attachment, created_at, trading_account_id, trade_id, trade_plan_id)
    SELECT 
        id,
        content,
        attachment,
        created_at,
        CASE WHEN related_type_id = 1 THEN related_id ELSE NULL END as trading_account_id,
        CASE WHEN related_type_id = 2 THEN related_id ELSE NULL END as trade_id,
        CASE WHEN related_type_id = 3 THEN related_id ELSE NULL END as trade_plan_id
    FROM notes;
    
    -- Delete new table
    DROP TABLE notes;
    
    -- Rename old table
    ALTER TABLE notes_old RENAME TO notes;
    
    -- Delete note_relation_types table
    DROP TABLE note_relation_types;
    """
    
    version = manager.create_migration(
        "fix_notes_table_structure",
        sql_up,
        sql_down
    )
    
    return version

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("""
Usage:
  python migrations_manager.py status          # Show status
  python migrations_manager.py migrate         # Apply all migrations
  python migrations_manager.py create_notes    # Create migration to fix notes
  python migrations_manager.py apply <version> # Apply specific migration
  python migrations_manager.py rollback <version> # Rollback migration
        """)
        sys.exit(1)
        
    command = sys.argv[1]
    manager = MigrationManager()
    
    if command == "status":
        manager.status()
    elif command == "migrate":
        manager.migrate_all()
    elif command == "create_notes":
        create_notes_migration()
    elif command == "apply" and len(sys.argv) > 2:
        manager.apply_migration(sys.argv[2])
    elif command == "rollback" and len(sys.argv) > 2:
        manager.rollback_migration(sys.argv[2])
    else:
        sys.exit(1)
