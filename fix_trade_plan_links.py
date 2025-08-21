#!/usr/bin/env python3
"""
Script to fix links between trades and plans
Fixes existing data and defines rules for the system

Rules:
1. Every trade must be linked to a plan
2. Open trade must be linked to a plan in open or closed status
3. Closed or cancelled trade can be assigned to a plan in any status
4. Trade creation date cannot be earlier than plan creation date
"""

import sqlite3
import sys
import os
from datetime import datetime
from typing import List, Dict, Optional

# Add project path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Backend'))

def connect_to_db():
    """Connect to database"""
    db_path = os.path.join(os.path.dirname(__file__), 'Backend', 'db', 'simpleTrade_new.db')
    return sqlite3.connect(db_path)

def get_trades_without_plans(cursor) -> List[Dict]:
    """Get trades without plan link"""
    cursor.execute("""
        SELECT id, status, type, created_at, ticker_id, account_id
        FROM trades 
        WHERE trade_plan_id IS NULL
        ORDER BY created_at
    """)
    return [dict(zip(['id', 'status', 'type', 'created_at', 'ticker_id', 'account_id'], row)) 
            for row in cursor.fetchall()]

def get_available_plans(cursor) -> List[Dict]:
    """Get available plans"""
    cursor.execute("""
        SELECT id, status, investment_type, created_at, ticker_id, account_id
        FROM trade_plans 
        ORDER BY created_at
    """)
    return [dict(zip(['id', 'status', 'investment_type', 'created_at', 'ticker_id', 'account_id'], row)) 
            for row in cursor.fetchall()]

def find_best_plan_for_trade(trade: Dict, plans: List[Dict]) -> Optional[int]:
    """
    Find the best plan for a trade
    
    Rules:
    1. Plan with same ticker_id
    2. Plan with same account_id (if possible)
    3. Plan created before the trade
    4. If trade is open - plan must be open or closed
    5. If trade is closed/cancelled - any plan
    6. If no plan for same ticker - search for similar plan
    7. Plan side must match trade side
    """
    trade_created = datetime.fromisoformat(trade['created_at'].replace('Z', '+00:00'))
    
    # Filter plans by ticker_id
    matching_plans = [p for p in plans if p['ticker_id'] == trade['ticker_id']]
    
    if not matching_plans:
        # If no plan for same ticker, search for similar plan
        print(f"  ⚠️  No plans for ticker_id {trade['ticker_id']}, searching for similar plan...")
        
        # Search for plan with same account_id
        account_matching = [p for p in plans if p['account_id'] == trade['account_id']]
        if account_matching:
            matching_plans = account_matching
            print(f"  📋 Found {len(matching_plans)} plans with same account_id")
        else:
            # If no matching account_id either, use first available plan
            matching_plans = plans
            print(f"  📋 Using all available plans ({len(matching_plans)})")
    
    # Filter by creation date
    valid_plans = []
    for plan in matching_plans:
        try:
            plan_created = datetime.fromisoformat(plan['created_at'].replace('Z', '+00:00'))
            if plan_created <= trade_created:
                valid_plans.append(plan)
        except ValueError:
            print(f"  ⚠️  Invalid date in plan {plan['id']}: {plan['created_at']}")
    
    if not valid_plans:
        print(f"  ⚠️  No plans created before the trade")
        return None
    
    # Filter by status (if trade is open)
    if trade['status'] == 'open':
        status_valid_plans = [p for p in valid_plans if p['status'] in ['open', 'closed']]
        if status_valid_plans:
            valid_plans = status_valid_plans
    
    # Filter by side - must be identical
    side_matching = [p for p in valid_plans if p.get('side', 'Long') == trade.get('side', 'Long')]
    if side_matching:
        valid_plans = side_matching
        print(f"  📋 Found {len(valid_plans)} plans with same side ({trade.get('side', 'Long')})")
    else:
        print(f"  ⚠️  No plans with same side ({trade.get('side', 'Long')})")
        return None
    
    # Prefer plan with same account_id
    account_matching = [p for p in valid_plans if p['account_id'] == trade['account_id']]
    if account_matching:
        valid_plans = account_matching
    
    # Choose the oldest plan
    if valid_plans:
        best_plan = min(valid_plans, key=lambda p: p['created_at'])
        return best_plan['id']
    
    return None

def update_trade_plan_link(cursor, trade_id: int, plan_id: int):
    """Update trade plan link"""
    # Get plan details
    cursor.execute("""
        SELECT investment_type, side 
        FROM trade_plans 
        WHERE id = ?
    """, (plan_id,))
    plan_data = cursor.fetchone()
    
    if plan_data:
        investment_type, side = plan_data
        
        # Update trade with plan details
        cursor.execute("""
            UPDATE trades 
            SET trade_plan_id = ?, type = ?, side = ?
            WHERE id = ?
        """, (plan_id, investment_type, side, trade_id))
        
        print(f"    📝 Updated: type={investment_type}, side={side}")
    else:
        # If plan not found, only update the link
        cursor.execute("""
            UPDATE trades 
            SET trade_plan_id = ? 
            WHERE id = ?
        """, (plan_id, trade_id))

def validate_trade_plan_links(cursor):
    """Validate link integrity"""
    print("\n=== Link Integrity Check ===")
    
    # Check trades without links
    cursor.execute("SELECT COUNT(*) FROM trades WHERE trade_plan_id IS NULL")
    unlinked_count = cursor.fetchone()[0]
    print(f"Trades without links: {unlinked_count}")
    
    # Check open trades with closed/cancelled plans
    cursor.execute("""
        SELECT t.id, t.status, tp.status as plan_status
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        WHERE t.status = 'open' AND tp.status NOT IN ('open', 'closed')
    """)
    invalid_open_trades = cursor.fetchall()
    print(f"Open trades with invalid plans: {len(invalid_open_trades)}")
    
    # Check creation dates
    cursor.execute("""
        SELECT t.id, t.created_at, tp.created_at as plan_created
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        WHERE t.created_at < tp.created_at
    """)
    invalid_dates = cursor.fetchall()
    print(f"Trades created before plan: {len(invalid_dates)}")
    
    # Check side - must be identical
    cursor.execute("""
        SELECT t.id, t.side, tp.side as plan_side
        FROM trades t
        JOIN trade_plans tp ON t.trade_plan_id = tp.id
        WHERE t.side != tp.side
    """)
    invalid_sides = cursor.fetchall()
    print(f"Trades with different side than plan: {len(invalid_sides)}")
    
    return unlinked_count == 0 and len(invalid_open_trades) == 0 and len(invalid_dates) == 0 and len(invalid_sides) == 0

def main():
    """Main function"""
    print("🔧 Fixing links between trades and plans")
    print("=" * 50)
    
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
        
        # Get data
        trades_without_plans = get_trades_without_plans(cursor)
        available_plans = get_available_plans(cursor)
        
        print(f"Found {len(trades_without_plans)} trades without links")
        print(f"Found {len(available_plans)} available plans")
        
        if not trades_without_plans:
            print("✅ All trades are already linked to plans")
            return
        
        # Fix links
        print("\n=== Fixing Links ===")
        fixed_count = 0
        
        for trade in trades_without_plans:
            print(f"\nTrade {trade['id']} ({trade['status']} - {trade['type']}):")
            
            best_plan_id = find_best_plan_for_trade(trade, available_plans)
            
            if best_plan_id:
                update_trade_plan_link(cursor, trade['id'], best_plan_id)
                print(f"  ✅ Linked to plan {best_plan_id}")
                fixed_count += 1
            else:
                print(f"  ❌ No suitable plan found")
        
        # Save changes
        conn.commit()
        print(f"\n✅ Fixed {fixed_count} links")
        
        # Validate integrity
        is_valid = validate_trade_plan_links(cursor)
        
        if is_valid:
            print("\n🎉 All links are valid!")
        else:
            print("\n⚠️  There are still issues with links")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
