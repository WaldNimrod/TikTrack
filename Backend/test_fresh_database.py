#!/usr/bin/env python3
"""
Test Script for Fresh Database Creation
======================================

This script tests the create_fresh_database.py script on a temporary database
"""

import sqlite3
import os
import shutil
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_table_structure(db_path, table_name):
    """Get table structure"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(f'PRAGMA table_info({table_name})')
    columns = cursor.fetchall()
    conn.close()
    return columns

def get_table_data_count(db_path, table_name):
    """Get row count for table"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(f'SELECT COUNT(*) FROM {table_name}')
    count = cursor.fetchone()[0]
    conn.close()
    return count

def compare_databases(original_db, new_db):
    """Compare two databases"""
    logger.info("🔍 Comparing databases...")
    
    # Get tables from both databases
    conn_orig = sqlite3.connect(original_db)
    cursor_orig = conn_orig.cursor()
    cursor_orig.execute("SELECT name FROM sqlite_master WHERE type='table'")
    orig_tables = [row[0] for row in cursor_orig.fetchall()]
    conn_orig.close()
    
    conn_new = sqlite3.connect(new_db)
    cursor_new = conn_new.cursor()
    cursor_new.execute("SELECT name FROM sqlite_master WHERE type='table'")
    new_tables = [row[0] for row in cursor_new.fetchall()]
    conn_new.close()
    
    # Compare tables
    logger.info(f"📊 Original DB tables: {len(orig_tables)}")
    logger.info(f"📊 New DB tables: {len(new_tables)}")
    
    # Check main tables (excluding backup tables)
    main_tables = ['currencies', 'accounts', 'tickers', 'trades', 'executions', 
                   'trade_plans', 'cash_flows', 'alerts', 'notes', 'users',
                   'constraints', 'enum_values', 'constraint_validations', 'note_relation_types']
    
    logger.info("\n📋 Main tables comparison:")
    for table in main_tables:
        if table in orig_tables and table in new_tables:
            orig_count = get_table_data_count(original_db, table)
            new_count = get_table_data_count(new_db, table)
            logger.info(f"  {table}: {orig_count} -> {new_count} rows")
        elif table in new_tables:
            new_count = get_table_data_count(new_db, table)
            logger.info(f"  {table}: NEW -> {new_count} rows")
        else:
            logger.info(f"  {table}: MISSING in new DB")
    
    # Check structure of key tables
    logger.info("\n🏗️ Structure comparison for key tables:")
    key_tables = ['trades', 'executions', 'accounts', 'tickers']
    
    for table in key_tables:
        if table in orig_tables and table in new_tables:
            orig_structure = get_table_structure(original_db, table)
            new_structure = get_table_structure(new_db, table)
            
            logger.info(f"\n  {table.upper()}:")
            logger.info(f"    Original columns: {len(orig_structure)}")
            logger.info(f"    New columns: {len(new_structure)}")
            
            # Compare column names
            orig_cols = [col[1] for col in orig_structure]
            new_cols = [col[1] for col in new_structure]
            
            missing_in_new = set(orig_cols) - set(new_cols)
            added_in_new = set(new_cols) - set(orig_cols)
            
            if missing_in_new:
                logger.info(f"    Missing in new: {missing_in_new}")
            if added_in_new:
                logger.info(f"    Added in new: {added_in_new}")

def test_fresh_database_creation():
    """Test the fresh database creation script"""
    logger.info("🧪 Starting fresh database creation test...")
    
    # Test database paths
    test_db_path = "db/simpleTrade_test_temp.db"
    fresh_db_path = "db/simpleTrade_fresh_test.db"
    
    # Backup the test database
    backup_path = f"{test_db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy2(test_db_path, backup_path)
    logger.info(f"📦 Created backup: {backup_path}")
    
    try:
        # Import and run the fresh database creation
        from create_fresh_database import DatabaseRecreator
        
        # Create recreator with test database path
        recreator = DatabaseRecreator(fresh_db_path)
        
        # Create fresh database
        recreator.create_fresh_database()
        
        logger.info("✅ Fresh database created successfully!")
        
        # Compare the databases
        compare_databases(test_db_path, fresh_db_path)
        
        # Clean up
        if os.path.exists(fresh_db_path):
            os.remove(fresh_db_path)
            logger.info("🧹 Cleaned up test database")
        
        logger.info("🎉 Test completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        raise

if __name__ == "__main__":
    test_fresh_database_creation()
