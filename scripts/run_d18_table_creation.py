#!/usr/bin/env python3
"""
D18 Brokers Fees Table Creation Script Runner
Team 60 (DevOps & Platform)
Created: 2026-02-06
"""

import os
import sys
import psycopg2
from pathlib import Path

# Add parent directory to path to import config
sys.path.insert(0, str(Path(__file__).parent.parent))

# Try multiple methods to get DATABASE_URL
DATABASE_URL = None

# Method 1: Try importing from api.core.config
try:
    from api.core.config import settings
    DATABASE_URL = settings.database_url
except (ImportError, AttributeError):
    pass

# Method 2: Try environment variable
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")

# Method 3: Try reading from api/.env file directly
if not DATABASE_URL:
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

def run_sql_file(conn, sql_file_path):
    """Execute SQL file."""
    print(f"📄 Executing: {sql_file_path}")
    
    with open(sql_file_path, 'r') as f:
        sql_content = f.read()
    
    try:
        with conn.cursor() as cur:
            cur.execute(sql_content)
            conn.commit()
        print(f"✅ Successfully executed: {sql_file_path}")
        return True
    except Exception as e:
        print(f"❌ Error executing {sql_file_path}: {e}")
        conn.rollback()
        return False

def main():
    """Main entry point."""
    print("=" * 60)
    print("D18 Brokers Fees Table Creation")
    print("Team 60 (DevOps & Platform)")
    print("=" * 60)
    
    # Get script directory
    script_dir = Path(__file__).parent
    
    # SQL files to execute in order
    sql_files = [
        script_dir / "create_d18_brokers_fees_table.sql",
        script_dir / "grant_d18_brokers_fees_permissions.sql"
    ]
    
    # Connect to database
    print(f"\n🔌 Connecting to database...")
    try:
        # Convert asyncpg URL to psycopg2 format if needed
        db_url = DATABASE_URL
        if "postgresql+asyncpg://" in db_url:
            db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
        elif "postgresql://" not in db_url:
            print(f"❌ ERROR: Invalid DATABASE_URL format: {db_url}")
            sys.exit(1)
        
        conn = psycopg2.connect(db_url)
        print("✅ Connected to database")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        sys.exit(1)
    
    # Execute SQL files
    success = True
    for sql_file in sql_files:
        if not sql_file.exists():
            print(f"❌ SQL file not found: {sql_file}")
            success = False
            continue
        
        if not run_sql_file(conn, sql_file):
            success = False
    
    # Close connection
    conn.close()
    print("\n🔌 Disconnected from database")
    
    # Exit with appropriate code
    if success:
        print("\n✅ All SQL scripts executed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Some SQL scripts failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
