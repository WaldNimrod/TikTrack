#!/usr/bin/env python3
"""
Fix PostgreSQL sequences to sync with current max(id) values

This script updates all sequences to be in sync with the current maximum ID
in each table, preventing duplicate key violations when creating new records.

Usage:
    python3 Backend/scripts/fix_sequences.py
"""

import sys
import os
from pathlib import Path

# Add Backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import text
from config.database import get_db
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def fix_sequences(verbose: bool = True) -> bool:
    """
    Fix all PostgreSQL sequences to sync with current max(id) values
    
    Args:
        verbose: Show detailed progress
    
    Returns:
        True if successful, False otherwise
    """
    if verbose:
        logger.info("=" * 70)
        logger.info("🔄 תיקון sequences - סנכרון עם max(id) בטבלאות")
        logger.info("=" * 70)
    
    db = None
    try:
        db = next(get_db())
        
        # Get all tables with id columns and their sequences
        # PostgreSQL convention: sequence name is usually {table_name}_id_seq
        tables_query = text("""
            SELECT 
                table_name,
                column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
                AND column_name = 'id'
                AND table_name NOT LIKE 'pg_%'
                AND table_name NOT LIKE 'sql_%'
            ORDER BY table_name
        """)
        
        result = db.execute(tables_query)
        tables = [(row[0], row[1]) for row in result]
        
        if not tables:
            if verbose:
                logger.warning("⚠️  לא נמצאו טבלאות עם עמודת id")
            return True
        
        fixed_count = 0
        skipped_count = 0
        
        for table_name, column_name in tables:
            try:
                # Get max ID from table
                max_id_query = text(f'SELECT COALESCE(MAX("{column_name}"), 0) FROM "{table_name}"')
                max_id_result = db.execute(max_id_query)
                max_id = max_id_result.scalar() or 0
                
                if max_id == 0:
                    # Table is empty, reset sequence to 1
                    next_val = 1
                    if verbose:
                        logger.info(f"   📋 {table_name}: טבלה ריקה, מאפס ל-1")
                else:
                    # Set sequence to max_id + 1
                    next_val = max_id + 1
                    if verbose:
                        logger.info(f"   📋 {table_name}: max(id)={max_id}, מעדכן sequence ל-{next_val}")
                
                # Try to fix the sequence
                sequence_name = f"{table_name}_id_seq"
                try:
                    # Use setval to update sequence
                    fix_query = text(f"SELECT setval('{sequence_name}', {next_val}, false)")
                    db.execute(fix_query)
                    fixed_count += 1
                    if verbose:
                        logger.info(f"   ✅ {table_name}: sequence תוקן ל-{next_val}")
                except Exception as seq_error:
                    # Sequence might not exist or have different name
                    if verbose:
                        logger.warning(f"   ⚠️  {table_name}: לא ניתן לתקן sequence ({sequence_name}): {seq_error}")
                    skipped_count += 1
                    continue
                
            except Exception as e:
                if verbose:
                    logger.error(f"   ❌ {table_name}: שגיאה - {e}")
                skipped_count += 1
                continue
        
        db.commit()
        
        if verbose:
            logger.info("")
            logger.info(f"✅ תוקנו {fixed_count} sequences")
            if skipped_count > 0:
                logger.info(f"⚠️  דולגו {skipped_count} sequences")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ שגיאה בתיקון sequences: {e}")
        import traceback
        traceback.print_exc()
        if db:
            db.rollback()
        return False
    finally:
        if db:
            db.close()


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Fix PostgreSQL sequences')
    parser.add_argument('--quiet', '-q', action='store_true', help='Quiet mode (less output)')
    args = parser.parse_args()
    
    verbose = not args.quiet
    
    success = fix_sequences(verbose=verbose)
    
    if success:
        logger.info("\n✅ תיקון sequences הושלם בהצלחה")
        return 0
    else:
        logger.error("\n❌ תיקון sequences נכשל")
        return 1


if __name__ == '__main__':
    sys.exit(main())

