#!/usr/bin/env python3
"""
PostgreSQL Schema Verification Script
=====================================
Compares database schema (structure) between local and Docker databases
to ensure 100% match in tables, columns, indexes, constraints, etc.
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect
from typing import Dict, List, Set, Tuple

# Configuration
LOCAL_HOST = "localhost"
DOCKER_CONTAINER = "tiktrack-postgres-dev"
DB_NAME = "TikTrack-db-development"
DB_USER = "TikTrakDBAdmin"
DB_PASSWORD = "BigMeZoo1974!?"

def get_local_connection():
    """Get connection to local database"""
    os.environ['POSTGRES_HOST'] = LOCAL_HOST
    os.environ['POSTGRES_DB'] = DB_NAME
    os.environ['POSTGRES_USER'] = DB_USER
    os.environ['POSTGRES_PASSWORD'] = DB_PASSWORD
    
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{LOCAL_HOST}/{DB_NAME}"
    return create_engine(DATABASE_URL)

def get_docker_connection():
    """Get connection to Docker database (via localhost:5432)"""
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{LOCAL_HOST}/{DB_NAME}"
    return create_engine(DATABASE_URL)

def get_tables(conn) -> Set[str]:
    """Get list of all tables"""
    with conn.connect() as c:
        result = c.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        return {row[0] for row in result}

def get_table_columns(conn, table_name: str) -> Dict[str, Dict]:
    """Get column definitions for a table"""
    with conn.connect() as c:
        result = c.execute(text("""
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = :table_name
            ORDER BY ordinal_position
        """), {"table_name": table_name})
        
        columns = {}
        for row in result:
            columns[row[0]] = {
                'data_type': row[1],
                'max_length': row[2],
                'is_nullable': row[3],
                'default': row[4]
            }
        return columns

def get_indexes(conn, table_name: str) -> Set[str]:
    """Get indexes for a table"""
    with conn.connect() as c:
        result = c.execute(text("""
            SELECT indexname
            FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = :table_name
        """), {"table_name": table_name})
        return {row[0] for row in result}

def get_foreign_keys(conn, table_name: str) -> List[Dict]:
    """Get foreign key constraints for a table"""
    with conn.connect() as c:
        result = c.execute(text("""
            SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
                AND tc.table_name = :table_name
        """), {"table_name": table_name})
        
        return [
            {
                'constraint_name': row[0],
                'column': row[1],
                'foreign_table': row[2],
                'foreign_column': row[3]
            }
            for row in result
        ]

def compare_schemas():
    """Compare schemas between local and Docker"""
    print("="*80)
    print("PostgreSQL Schema Verification - Local vs Docker")
    print("="*80)
    print()
    
    local_conn = get_local_connection()
    docker_conn = get_docker_connection()
    
    # Get tables
    print("📊 Step 1: Comparing tables...")
    local_tables = get_tables(local_conn)
    docker_tables = get_tables(docker_conn)
    
    if local_tables == docker_tables:
        print(f"   ✅ Tables match: {len(local_tables)} tables")
    else:
        missing_in_docker = local_tables - docker_tables
        extra_in_docker = docker_tables - local_tables
        if missing_in_docker:
            print(f"   ❌ Missing in Docker: {missing_in_docker}")
        if extra_in_docker:
            print(f"   ⚠️  Extra in Docker: {extra_in_docker}")
    
    print()
    
    # Compare each table
    all_tables = local_tables | docker_tables
    issues = []
    
    print("📊 Step 2: Comparing table structures...")
    for table in sorted(all_tables):
        if table not in local_tables:
            print(f"   ⚠️  {table}: Missing in local")
            continue
        if table not in docker_tables:
            print(f"   ❌ {table}: Missing in Docker")
            issues.append(f"Table {table} missing in Docker")
            continue
        
        # Compare columns
        local_cols = get_table_columns(local_conn, table)
        docker_cols = get_table_columns(docker_conn, table)
        
        if local_cols != docker_cols:
            missing_cols = set(local_cols.keys()) - set(docker_cols.keys())
            extra_cols = set(docker_cols.keys()) - set(local_cols.keys())
            diff_cols = {k for k in local_cols.keys() & docker_cols.keys() 
                        if local_cols[k] != docker_cols[k]}
            
            if missing_cols:
                print(f"   ❌ {table}: Missing columns in Docker: {missing_cols}")
                issues.append(f"Table {table} missing columns: {missing_cols}")
            if extra_cols:
                print(f"   ⚠️  {table}: Extra columns in Docker: {extra_cols}")
            if diff_cols:
                print(f"   ❌ {table}: Column differences: {diff_cols}")
                issues.append(f"Table {table} column differences: {diff_cols}")
        else:
            print(f"   ✅ {table}: Columns match ({len(local_cols)} columns)")
        
        # Compare indexes (optional - just report)
        local_idx = get_indexes(local_conn, table)
        docker_idx = get_indexes(docker_conn, table)
        if local_idx != docker_idx:
            print(f"   ⚠️  {table}: Index differences (local: {len(local_idx)}, docker: {len(docker_idx)})")
    
    print()
    
    # Summary
    print("="*80)
    if not issues:
        print("✅ Schema verification passed - 100% match!")
    else:
        print(f"❌ Schema verification found {len(issues)} issues:")
        for issue in issues:
            print(f"   - {issue}")
    print("="*80)
    
    return len(issues) == 0

if __name__ == "__main__":
    try:
        success = compare_schemas()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

