"""
Migration: Add notes column to trade_plans table
"""

def upgrade():
    """Add notes column (rich text support) to trade_plans table"""
    return """
    ALTER TABLE trade_plans ADD COLUMN notes TEXT;
    """


def downgrade():
    """Remove notes column from trade_plans table"""
    return """
    ALTER TABLE trade_plans DROP COLUMN notes;
    """

