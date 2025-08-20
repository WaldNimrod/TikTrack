#!/usr/bin/env python3
"""
Database Migrations Manager
מנהל migrations לבסיס הנתונים

✅ ניהול שינויים בבסיס הנתונים
✅ היסטוריה של שינויים
✅ rollback לשינויים קודמים
✅ בדיקת תקינות
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
        
        # יצירת תיקיית migrations אם לא קיימת
        if not os.path.exists(self.migrations_dir):
            os.makedirs(self.migrations_dir)
            
        # יצירת טבלת migrations אם לא קיימת
        self._create_migrations_table()
        
    def _create_migrations_table(self):
        """יצירת טבלת migrations"""
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
        """יצירת migration חדש"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        version = f"migration_{timestamp}"
        
        migration_data = {
            "version": version,
            "name": name,
            "sql_up": sql_up,
            "sql_down": sql_down,
            "created_at": datetime.now().isoformat()
        }
        
        # שמירת migration לקובץ
        filename = f"{self.migrations_dir}/{version}_{name}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(migration_data, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Migration נוצר: {filename}")
        return version
        
    def apply_migration(self, version: str) -> bool:
        """החלת migration"""
        try:
            # קריאת migration מהקובץ
            migration_file = None
            for filename in os.listdir(self.migrations_dir):
                if filename.startswith(version) and filename.endswith('.json'):
                    migration_file = os.path.join(self.migrations_dir, filename)
                    break
                    
            if not migration_file:
                print(f"❌ Migration לא נמצא: {version}")
                return False
                
            with open(migration_file, 'r', encoding='utf-8') as f:
                migration = json.load(f)
                
            # בדיקה אם כבר הוחל
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(f"SELECT COUNT(*) FROM {self.migrations_table} WHERE version = ?", (version,))
            if cursor.fetchone()[0] > 0:
                print(f"⚠️  Migration כבר הוחל: {version}")
                conn.close()
                return True
                
            # החלת ה-SQL - ביצוע statements אחד אחד
            print(f"🔄 מחיל migration: {migration['name']}")
            sql_statements = migration['sql_up'].split(';')
            
            for statement in sql_statements:
                statement = statement.strip()
                if statement:  # רק אם יש תוכן
                    try:
                        cursor.execute(statement)
                        print(f"  ✅ ביצוע: {statement[:50]}...")
                    except Exception as e:
                        print(f"  ❌ שגיאה בביצוע: {statement[:50]}... - {str(e)}")
                        conn.rollback()
                        conn.close()
                        return False
            
            # רישום ב-migrations table
            cursor.execute(f"""
                INSERT INTO {self.migrations_table} (version, name, sql_up, sql_down)
                VALUES (?, ?, ?, ?)
            """, (version, migration['name'], migration['sql_up'], migration.get('sql_down')))
            
            conn.commit()
            conn.close()
            
            print(f"✅ Migration הוחל בהצלחה: {migration['name']}")
            return True
            
        except Exception as e:
            print(f"❌ שגיאה בהחלת migration: {str(e)}")
            return False
            
    def rollback_migration(self, version: str) -> bool:
        """ביטול migration"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # בדיקה אם הוחל
            cursor.execute(f"SELECT sql_down FROM {self.migrations_table} WHERE version = ?", (version,))
            result = cursor.fetchone()
            
            if not result:
                print(f"❌ Migration לא נמצא: {version}")
                conn.close()
                return False
                
            sql_down = result[0]
            if not sql_down:
                print(f"⚠️  אין rollback SQL ל-migration: {version}")
                conn.close()
                return False
                
            # ביצוע rollback
            print(f"🔄 מבטל migration: {version}")
            cursor.execute(sql_down)
            
            # מחיקה מהטבלה
            cursor.execute(f"DELETE FROM {self.migrations_table} WHERE version = ?", (version,))
            
            conn.commit()
            conn.close()
            
            print(f"✅ Migration בוטל בהצלחה: {version}")
            return True
            
        except Exception as e:
            print(f"❌ שגיאה בביטול migration: {str(e)}")
            return False
            
    def get_applied_migrations(self) -> List[Dict[str, Any]]:
        """קבלת רשימת migrations שהוחלו"""
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
        """קבלת רשימת migrations שממתינים"""
        applied = {m["version"] for m in self.get_applied_migrations()}
        pending = []
        
        for filename in os.listdir(self.migrations_dir):
            if filename.endswith('.json'):
                version = filename.split('_')[0] + '_' + filename.split('_')[1]
                if version not in applied:
                    pending.append(version)
                    
        return sorted(pending)
        
    def migrate_all(self) -> bool:
        """החלת כל ה-migrations הממתינים"""
        pending = self.get_pending_migrations()
        
        if not pending:
            print("✅ אין migrations ממתינים")
            return True
            
        print(f"🔄 מחיל {len(pending)} migrations...")
        
        for version in pending:
            if not self.apply_migration(version):
                print(f"❌ נכשל בהחלת migration: {version}")
                return False
                
        print("✅ כל ה-migrations הוחלו בהצלחה")
        return True
        
    def status(self):
        """הצגת סטטוס migrations"""
        applied = self.get_applied_migrations()
        pending = self.get_pending_migrations()
        
        print("📊 סטטוס Migrations:")
        print(f"✅ הוחלו: {len(applied)}")
        print(f"⏳ ממתינים: {len(pending)}")
        
        if applied:
            print("\n📋 Migrations שהוחלו:")
            for migration in applied:
                print(f"  • {migration['version']} - {migration['name']} ({migration['applied_at']})")
                
        if pending:
            print("\n⏳ Migrations ממתינים:")
            for version in pending:
                print(f"  • {version}")

# יצירת migration לבעיה הנוכחית
def create_notes_migration():
    """יצירת migration לתיקון טבלת notes"""
    manager = MigrationManager()
    
    sql_up = """
    -- יצירת טבלת note_relation_types
    CREATE TABLE IF NOT EXISTS note_relation_types (
        id INTEGER PRIMARY KEY,
        note_relation_type VARCHAR(20) NOT NULL UNIQUE
    );
    
    -- הוספת סוגי הקשרים
    INSERT OR IGNORE INTO note_relation_types (id, note_relation_type) VALUES 
        (1, 'account'),
        (2, 'trade'),
        (3, 'trade_plan');
    
    -- יצירת טבלה חדשה עם המבנה הנכון
    CREATE TABLE notes_new (
        id INTEGER NOT NULL PRIMARY KEY,
        content VARCHAR(1000) NOT NULL,
        attachment VARCHAR(500),
        created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
        related_type_id INTEGER REFERENCES note_relation_types(id),
        related_id INTEGER
    );
    
    -- העתקת נתונים מהטבלה הישנה
    INSERT INTO notes_new (id, content, attachment, created_at, related_type_id, related_id)
    SELECT 
        id,
        content,
        attachment,
        created_at,
        CASE 
            WHEN account_id IS NOT NULL THEN 1
            WHEN trade_id IS NOT NULL THEN 2
            WHEN trade_plan_id IS NOT NULL THEN 3
        END as related_type_id,
        COALESCE(account_id, trade_id, trade_plan_id) as related_id
    FROM notes;
    
    -- מחיקת הטבלה הישנה
    DROP TABLE notes;
    
    -- שינוי שם הטבלה החדשה
    ALTER TABLE notes_new RENAME TO notes;
    """
    
    sql_down = """
    -- יצירת טבלה עם המבנה הישן
    CREATE TABLE notes_old (
        id INTEGER NOT NULL PRIMARY KEY,
        content VARCHAR(1000) NOT NULL,
        attachment VARCHAR(500),
        created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
        account_id INTEGER,
        trade_id INTEGER,
        trade_plan_id INTEGER
    );
    
    -- העתקת נתונים בחזרה
    INSERT INTO notes_old (id, content, attachment, created_at, account_id, trade_id, trade_plan_id)
    SELECT 
        id,
        content,
        attachment,
        created_at,
        CASE WHEN related_type_id = 1 THEN related_id ELSE NULL END as account_id,
        CASE WHEN related_type_id = 2 THEN related_id ELSE NULL END as trade_id,
        CASE WHEN related_type_id = 3 THEN related_id ELSE NULL END as trade_plan_id
    FROM notes;
    
    -- מחיקת הטבלה החדשה
    DROP TABLE notes;
    
    -- שינוי שם הטבלה הישנה
    ALTER TABLE notes_old RENAME TO notes;
    
    -- מחיקת טבלת note_relation_types
    DROP TABLE note_relation_types;
    """
    
    version = manager.create_migration(
        "fix_notes_table_structure",
        sql_up,
        sql_down
    )
    
    print(f"✅ Migration נוצר: {version}")
    return version

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("""
שימוש:
  python migrations_manager.py status          # הצגת סטטוס
  python migrations_manager.py migrate         # החלת כל migrations
  python migrations_manager.py create_notes    # יצירת migration לתיקון notes
  python migrations_manager.py apply <version> # החלת migration ספציפי
  python migrations_manager.py rollback <version> # ביטול migration
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
        print("❌ פקודה לא מוכרת")
        sys.exit(1)
