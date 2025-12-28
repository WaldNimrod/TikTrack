"""
Migration: Add entry_price column to trade_plans table
"""

def upgrade():
    """Add entry_price column to trade_plans table"""
    return """
    -- Add entry_price column (NOT NULL, will be populated from existing data)
    ALTER TABLE trade_plans ADD COLUMN entry_price FLOAT;
    
    -- Update existing records: calculate entry_price from available data
    -- Strategy: Use midpoint between stop_price and target_price if both exist
    -- Otherwise, estimate from stop_price or use a default
    UPDATE trade_plans 
    SET entry_price = (
        CASE 
            -- If we have both stop_price and target_price, use midpoint
            WHEN stop_price > 0 AND target_price > 0 THEN
                (stop_price + target_price) / 2.0
            -- If we only have stop_price, estimate entry_price as stop_price * 1.1 (assuming ~10% stop loss)
            WHEN stop_price > 0 THEN stop_price * 1.1
            -- If we only have target_price, estimate entry_price as target_price * 0.9 (assuming ~10% target)
            WHEN target_price > 0 THEN target_price * 0.9
            -- Default fallback: use planned_amount / 100 as rough estimate (assuming ~100 shares)
            WHEN planned_amount > 0 THEN planned_amount / 100.0
            -- Last resort: set to 1.0 (will need to be updated manually)
            ELSE 1.0
        END
    )
    WHERE entry_price IS NULL;
    
    -- After populating data, make column NOT NULL
    -- Note: column type changes may require table recreation
    -- For now, we'll keep it nullable and enforce NOT NULL at application level
    -- In production, consider recreating table with NOT NULL constraint
    """
    
def downgrade():
    """Remove entry_price column from trade_plans table"""
    return """
    ALTER TABLE trade_plans DROP COLUMN entry_price;
    """
