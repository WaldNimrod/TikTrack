#!/usr/bin/env python3
"""
Full Database Backup Script
Team 60 (DevOps & Platform)
Created: 2026-02-07
"""

import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime

# Add parent directory to path to import config
sys.path.insert(0, str(Path(__file__).parent.parent))

# Try multiple methods to get DATABASE_URL
DATABASE_URL = None

# Method 1: Try reading from api/.env file directly
env_file = Path(__file__).parent.parent / "api" / ".env"
if env_file.exists():
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                DATABASE_URL = line.split("=", 1)[1].strip()
                # Remove quotes if present
                if DATABASE_URL.startswith('"') and DATABASE_URL.endswith('"'):
                    DATABASE_URL = DATABASE_URL[1:-1]
                elif DATABASE_URL.startswith("'") and DATABASE_URL.endswith("'"):
                    DATABASE_URL = DATABASE_URL[1:-1]
                break

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found.")
    print("   Please set it in:")
    print("   1. api/.env file (DATABASE_URL=...)")
    print("   2. Environment variable (export DATABASE_URL=...)")
    sys.exit(1)

# Parse DATABASE_URL
# Format: postgresql://username:password@host:port/database
# or: postgresql+asyncpg://username:password@host:port/database
if "postgresql+asyncpg://" in DATABASE_URL:
    db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
elif "postgresql://" not in DATABASE_URL:
    print(f"❌ ERROR: Invalid DATABASE_URL format: {DATABASE_URL}")
    sys.exit(1)
else:
    db_url = DATABASE_URL

# Extract connection details
# postgresql://user:pass@host:port/dbname
parts = db_url.replace("postgresql://", "").split("@")
if len(parts) != 2:
    print(f"❌ ERROR: Invalid DATABASE_URL format: {db_url}")
    sys.exit(1)

user_pass = parts[0].split(":")
if len(user_pass) != 2:
    print(f"❌ ERROR: Invalid DATABASE_URL format: {db_url}")
    sys.exit(1)

username = user_pass[0]
password = user_pass[1]

host_db = parts[1].split("/")
if len(host_db) != 2:
    print(f"❌ ERROR: Invalid DATABASE_URL format: {db_url}")
    sys.exit(1)

host_port = host_db[0].split(":")
host = host_port[0]
port = host_port[1] if len(host_port) > 1 else "5432"
database = host_db[1]

# Create backup directory
backup_dir = Path(__file__).parent / "backups"
backup_dir.mkdir(exist_ok=True)

# Generate backup filename with timestamp
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_filename = f"TikTrack-phoenix-db_backup_{timestamp}.sql"
backup_path = backup_dir / backup_filename

print("=" * 60)
print("Full Database Backup")
print("Team 60 (DevOps & Platform)")
print("=" * 60)
print(f"\n📊 Database: {database}")
print(f"🖥️  Host: {host}:{port}")
print(f"👤 User: {username}")
print(f"💾 Backup file: {backup_path}")
print()

# Try pg_dump first
pg_dump_path = None
for possible_path in ["/usr/local/bin/pg_dump", "/opt/homebrew/bin/pg_dump", "pg_dump"]:
    try:
        result = subprocess.run(
            ["which", possible_path],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            pg_dump_path = possible_path
            break
    except:
        pass

if pg_dump_path:
    print(f"✅ Found pg_dump at: {pg_dump_path}")
    print(f"📄 Creating backup...")
    
    # Set PGPASSWORD environment variable
    env = os.environ.copy()
    env["PGPASSWORD"] = password
    
    try:
        # Run pg_dump
        result = subprocess.run(
            [
                pg_dump_path,
                "-h", host,
                "-p", port,
                "-U", username,
                "-d", database,
                "--no-owner",
                "--no-acl",
                "--clean",
                "--if-exists",
                "-f", str(backup_path)
            ],
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            # Verify backup: file exists, non-zero size, contains expected content
            ok = backup_path.exists() and backup_path.stat().st_size > 0
            if ok:
                with open(backup_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read(8192)
                ok = "CREATE" in content or "COPY" in content
            if not ok:
                print(f"❌ Backup verification failed (file empty or invalid).")
                sys.exit(1)
            print(f"✅ Backup created successfully!")
            print(f"✅ Backup verified (file exists, non-empty, valid content).")
            print(f"📁 Location: {backup_path}")
            print(f"📊 Size: {backup_path.stat().st_size / 1024 / 1024:.2f} MB")
            sys.exit(0)
        else:
            print(f"❌ pg_dump failed:")
            print(result.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"❌ Error running pg_dump: {e}")
        sys.exit(1)
else:
    print("⚠️  pg_dump not found. Trying Python-based backup...")
    
    # Fallback to Python-based backup using psycopg2
    try:
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
        
        print(f"📄 Connecting to database...")
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=username,
            password=password,
            database=database
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        print(f"✅ Connected. Creating backup...")
        
        # Get all table names
        cur = conn.cursor()
        cur.execute("""
            SELECT schemaname, tablename 
            FROM pg_tables 
            WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
            ORDER BY schemaname, tablename;
        """)
        tables = cur.fetchall()
        
        print(f"📊 Found {len(tables)} tables")
        
        # Create backup file
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(f"-- TikTrack Phoenix Database Backup\n")
            f.write(f"-- Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"-- Database: {database}\n")
            f.write(f"-- Host: {host}:{port}\n")
            f.write(f"-- User: {username}\n")
            f.write(f"\n")
            f.write(f"-- ============================================\n")
            f.write(f"-- SCHEMA DEFINITIONS\n")
            f.write(f"-- ============================================\n\n")
            
            # Backup schema definitions using pg_get_tabledef
            for schema, table in tables:
                f.write(f"\n-- Table: {schema}.{table}\n")
                try:
                    # Try to get table definition using pg_dump-like approach
                    cur.execute(f"""
                        SELECT 
                            'CREATE TABLE IF NOT EXISTS ' || quote_ident('{schema}') || '.' || quote_ident('{table}') || ' (' ||
                            string_agg(
                                quote_ident(column_name) || ' ' || 
                                CASE 
                                    WHEN data_type = 'USER-DEFINED' THEN udt_name
                                    ELSE data_type
                                END ||
                                CASE 
                                    WHEN character_maximum_length IS NOT NULL 
                                    THEN '(' || character_maximum_length || ')'
                                    WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL
                                    THEN '(' || numeric_precision || ',' || numeric_scale || ')'
                                    WHEN numeric_precision IS NOT NULL
                                    THEN '(' || numeric_precision || ')'
                                    ELSE ''
                                END ||
                                CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                                CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                                ', ' ORDER BY ordinal_position
                            ) || ');'
                        FROM information_schema.columns
                        WHERE table_schema = '{schema}' AND table_name = '{table}';
                    """)
                    create_table = cur.fetchone()
                    if create_table:
                        f.write(create_table[0] + "\n\n")
                except Exception as e:
                    f.write(f"-- Error getting table definition: {e}\n\n")
            
            f.write(f"\n-- ============================================\n")
            f.write(f"-- DATA\n")
            f.write(f"-- ============================================\n\n")
            
            # Backup data
            for schema, table in tables:
                f.write(f"\n-- Data for {schema}.{table}\n")
                try:
                    cur.execute(f"SELECT COUNT(*) FROM {schema}.{table}")
                    count = cur.fetchone()[0]
                    f.write(f"-- Rows: {count}\n")
                    
                    if count > 0:
                        cur.execute(f"SELECT * FROM {schema}.{table}")
                        columns = [desc[0] for desc in cur.description]
                        f.write(f"COPY {schema}.{table} ({', '.join(columns)}) FROM stdin;\n")
                        
                        for row in cur:
                            values = []
                            for val in row:
                                if val is None:
                                    values.append('\\N')
                                elif isinstance(val, str):
                                    values.append(val.replace('\\', '\\\\').replace('\t', '\\t').replace('\n', '\\n'))
                                else:
                                    values.append(str(val))
                            f.write('\t'.join(values) + '\n')
                        
                        f.write('\\.\n\n')
                except Exception as e:
                    f.write(f"-- Error backing up data: {e}\n")
                    f.write(f"-- Skipping table {schema}.{table}\n\n")
        
        cur.close()
        conn.close()
        
        # Verify backup: file exists, non-zero size, contains expected content
        ok = backup_path.exists() and backup_path.stat().st_size > 0
        if ok:
            with open(backup_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read(8192)
            ok = "CREATE" in content or "COPY" in content
        if not ok:
            print(f"❌ Backup verification failed (file empty or invalid).")
            sys.exit(1)
        print(f"✅ Backup created successfully!")
        print(f"✅ Backup verified (file exists, non-empty, valid content).")
        print(f"📁 Location: {backup_path}")
        print(f"📊 Size: {backup_path.stat().st_size / 1024 / 1024:.2f} MB")
        sys.exit(0)
        
    except ImportError:
        print("❌ ERROR: psycopg2 not installed.")
        print("   Install with: pip install psycopg2-binary")
        sys.exit(1)
    except Exception as e:
        print(f"❌ ERROR: Backup failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
