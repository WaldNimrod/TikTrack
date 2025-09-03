"""
Migration: Add external_id column to executions table
"""

def upgrade():
    """
    Add external_id column to executions table
    """
    return """
    ALTER TABLE executions ADD COLUMN external_id VARCHAR(100);
    """

def downgrade():
    """
    Remove external_id column from executions table
    """
    return """
    ALTER TABLE executions DROP COLUMN external_id;
    """
