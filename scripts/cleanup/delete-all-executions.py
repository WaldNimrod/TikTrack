#!/usr/bin/env python3
"""
Delete All Executions Script
Deletes all records from executions table and related data (tags, linked_items)
"""

import os
import sys
from pathlib import Path

# Add Backend to path
backend_dir = Path(__file__).parent.parent.parent / "Backend"
sys.path.insert(0, str(backend_dir))

# Set PostgreSQL environment variables if not set (for development)
import os
if not os.getenv('POSTGRES_HOST'):
    os.environ['POSTGRES_HOST'] = 'localhost'
    os.environ['POSTGRES_DB'] = 'TikTrack-db-development'
    os.environ['POSTGRES_USER'] = 'TikTrakDBAdmin'
    os.environ['POSTGRES_PASSWORD'] = 'BigMeZoo1974!?'

from sqlalchemy import text
from config.database import SessionLocal
from models.execution import Execution

def delete_all_executions():
    """Delete all executions from database including tags and linked items"""
    
    try:
        # Use SQLAlchemy session from config
        db_session = SessionLocal()
        
        try:
            # Count existing records using model
            count = db_session.query(Execution).count()
            
            if count == 0:
                print("✅ No executions to delete - table is already empty")
                db_session.close()
                return True
            
            print(f"🧹 Found {count} executions - preparing to delete...")
            
            # First, delete all tags for executions (if tag system exists)
            print("🧹 Deleting tags for executions...")
            try:
                # Try to delete tags using SQL directly
                tags_query = text("""
                    DELETE FROM entity_tags 
                    WHERE entity_type = 'execution'
                """)
                tags_result = db_session.execute(tags_query)
                tags_count = tags_result.rowcount
                print(f"✅ Deleted {tags_count} tags for executions")
            except Exception as e:
                print(f"⚠️ Warning: Error deleting tags (table may not exist): {e}")
                db_session.rollback()
                # Continue with deletion anyway
            
            # Delete linked_items for executions (if table exists)
            print("🧹 Deleting linked_items for executions...")
            try:
                linked_items_query = text("""
                    DELETE FROM linked_items 
                    WHERE entity_type = 'execution' OR entity_type = 7
                """)
                linked_items_result = db_session.execute(linked_items_query)
                linked_items_count = linked_items_result.rowcount
                print(f"✅ Deleted {linked_items_count} linked_items for executions")
            except Exception as e:
                print(f"⚠️ Warning: Error deleting linked_items (table may not exist): {e}")
                db_session.rollback()
                # Continue with deletion anyway
            
            # Delete all executions using model
            print("🧹 Deleting all executions...")
            deleted_count = db_session.query(Execution).delete()
            
            # Commit changes
            db_session.commit()
            
            print(f"✅ Successfully deleted {deleted_count} executions")
            return True
            
        except Exception as e:
            db_session.rollback()
            print(f"❌ Error deleting executions: {e}")
            import traceback
            traceback.print_exc()
            return False
        finally:
            db_session.close()
            
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n" + "="*70)
    print("DELETE ALL EXECUTIONS SCRIPT")
    print("="*70)
    print("\n⚠️  WARNING: This will delete ALL executions from the database!")
    print("   This includes:")
    print("   - All execution records")
    print("   - All tags associated with executions")
    print("   - All linked_items associated with executions")
    print("\nThis action cannot be undone!")
    print("\n" + "="*70)
    
    # Check for --confirm flag
    if len(sys.argv) > 1 and sys.argv[1] == '--confirm':
        print("\n✅ Confirmation flag provided - proceeding with deletion...")
    else:
        try:
            response = input("\nAre you sure you want to continue? (yes/no): ")
            if response.lower() not in ['yes', 'y']:
                print("❌ Operation cancelled")
                sys.exit(0)
        except EOFError:
            print("\n❌ Interactive input not available. Use --confirm flag to proceed.")
            print("   Example: python3 delete-all-executions.py --confirm")
            sys.exit(1)
    
    success = delete_all_executions()
    sys.exit(0 if success else 1)

