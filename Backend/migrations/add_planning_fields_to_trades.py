"""
Migration: Add planning snapshot fields to trades table

This migration adds planning-related fields directly on the trades table so that
each trade can hold its own planned quantity/amount/entry price snapshot, even
when no trade_plan is linked. When a trade is linked to a trade_plan, the
application layer will treat the trade_plan as the primary source of truth and
copy a snapshot of its planning data into these fields at trade creation time.

Backfill strategy:
- For trades that already have a trade_plan_id, we copy planned_amount and
  entry_price from the linked trade_plans row.
- planned_quantity is left NULL for existing trades; the application layer can
  derive it on the fly from planned_amount/entry_price where needed.
"""


def upgrade():
    """Add planning snapshot columns to trades table and backfill from trade_plans when possible"""
    return """
    -- Add planning snapshot columns to trades (nullable for backward compatibility)
    ALTER TABLE trades ADD COLUMN planned_quantity FLOAT NULL;
    ALTER TABLE trades ADD COLUMN planned_amount FLOAT NULL;
    ALTER TABLE trades ADD COLUMN entry_price FLOAT NULL;

    -- Backfill planned_amount and entry_price from linked trade_plans where available
    UPDATE trades
    SET planned_amount = (
        SELECT tp.planned_amount
        FROM trade_plans tp
        WHERE tp.id = trades.trade_plan_id
    )
    WHERE trade_plan_id IS NOT NULL
      AND planned_amount IS NULL;

    UPDATE trades
    SET entry_price = (
        SELECT tp.entry_price
        FROM trade_plans tp
        WHERE tp.id = trades.trade_plan_id
    )
    WHERE trade_plan_id IS NOT NULL
      AND entry_price IS NULL;
    """


def downgrade():
    """SQLite does not support DROP COLUMN safely; no-op downgrade."""
    return """
    -- Downgrade not supported for planning snapshot fields on trades.
    -- To remove these columns, a manual table recreation would be required.
    """


