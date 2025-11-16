#!/usr/bin/env python3
"""
Migration: Add Trade Date Constraint
Date: August 24, 2025
Description: Add constraint to ensure closed_at is not before opened_at in trades table
"""

import os
import sys
from datetime import datetime

# Add the services directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))
from sqlalchemy import text

from constraint_service import ConstraintService
from config.database import SessionLocal

def add_trade_date_constraint():
    """Add constraint to ensure closed_at is not before opened_at in trades table"""
    
    # Initialize constraint service
    constraint_service = ConstraintService()
    
    # Define the constraint data
    constraint_data = {
        'table_name': 'trades',
        'column_name': 'closed_at',
        'constraint_type': 'CUSTOM_VALIDATION',
        'constraint_name': 'trade_closed_date_after_opened',
        'constraint_definition': 'closed_at must be after or equal to opened_at',
        'validation_rule': 'closed_at >= opened_at OR closed_at IS NULL'
    }
    
    try:
        # Add the constraint
        success, message = constraint_service.add_constraint(constraint_data)
        
        if success:
            return True
        else:
            return False
            
    except Exception as e:
        return False

def validate_trade_dates():
    """Validate existing trades to ensure they comply with the new constraint"""
    
    session = SessionLocal()
    try:
        invalid_trades = session.execute(text("""
            SELECT id, opened_at, closed_at 
            FROM trades 
            WHERE closed_at IS NOT NULL 
            AND opened_at IS NOT NULL 
            AND closed_at < opened_at
        """)).fetchall()
        
        if invalid_trades:
            return False
        else:
            return True
            
    except Exception as e:
        return False
    finally:
        session.close()

if __name__ == "__main__":
    
    # Validate existing data first
    if not validate_trade_dates():
        sys.exit(1)
    
    # Add the constraint
    if add_trade_date_constraint():
    else:
        sys.exit(1)
