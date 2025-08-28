"""
Migration: Add external_id column to executions table
"""

from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os

def upgrade():
    """Add external_id column to executions table"""
    # Get database path
    db_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'simpleTrade_new.db')
    engine = create_engine(f'sqlite:///{db_path}')
    
    with engine.connect() as conn:
        # Add external_id column
        conn.execute(text("""
            ALTER TABLE executions 
            ADD COLUMN external_id VARCHAR(100)
        """))
        
        # Add notes column if it doesn't exist
        try:
            conn.execute(text("""
                ALTER TABLE executions 
                ADD COLUMN notes VARCHAR(500)
            """))
        except Exception as e:
            print(f"Notes column might already exist: {e}")
        
        conn.commit()
        print("✅ Added external_id and notes columns to executions table")

def downgrade():
    """Remove external_id column from executions table"""
    # Note: SQLite doesn't support DROP COLUMN directly
    # This would require recreating the table
    print("⚠️ SQLite doesn't support DROP COLUMN. Manual intervention required.")

if __name__ == "__main__":
    upgrade()
