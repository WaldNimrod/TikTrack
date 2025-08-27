"""
Migration to update alert condition field with new constraint format
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

def upgrade():
    # Create a backup of the current alerts table
    op.execute("CREATE TABLE alerts_backup AS SELECT * FROM alerts")
    
    # Update existing conditions to new format
    # Map old conditions to new format
    condition_mapping = {
        'below': 'price | lessThen | 0',
        'above': 'price | moreThen | 0', 
        'equals': 'price | equals | 0'
    }
    
    # Update each condition based on mapping
    for old_condition, new_condition in condition_mapping.items():
        op.execute(f"""
            UPDATE alerts 
            SET condition = '{new_condition}' 
            WHERE condition = '{old_condition}'
        """)
    
    # For custom type alerts, set a default condition
    op.execute("""
        UPDATE alerts 
        SET condition = 'price | moreThen | 0' 
        WHERE type = 'custom' AND condition NOT LIKE '%|%'
    """)
    
    # Add constraint to ensure condition follows the new format
    # Note: SQLite doesn't support CHECK constraints in the same way as other databases
    # We'll enforce this at the application level
    
def downgrade():
    # Restore from backup if needed
    op.execute("DROP TABLE IF EXISTS alerts")
    op.execute("ALTER TABLE alerts_backup RENAME TO alerts")
