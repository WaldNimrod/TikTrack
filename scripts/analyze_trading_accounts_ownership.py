#!/usr/bin/env python3
"""
Analyze Trading Accounts Ownership
Analyze which trading account belongs to which user based on activity data
"""

import sys
import os
from pathlib import Path

# Add Backend to path
backend_dir = Path(__file__).parent.parent / "Backend"
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text

def analyze_account_ownership():
    """Analyze trading accounts and determine ownership based on activity"""
    
    # Set environment variables for database connection
    os.environ.setdefault('POSTGRES_HOST', 'localhost')
    os.environ.setdefault('POSTGRES_DB', 'TikTrack-db-development')
    os.environ.setdefault('POSTGRES_USER', 'TikTrakDBAdmin')
    os.environ.setdefault('POSTGRES_PASSWORD', 'BigMeZoo1974!?')
    
    # Build database URL
    postgres_host = os.getenv('POSTGRES_HOST', 'localhost')
    postgres_port = os.getenv('POSTGRES_PORT', '5432')
    postgres_db = os.getenv('POSTGRES_DB', 'TikTrack-db-development')
    postgres_user = os.getenv('POSTGRES_USER', 'TikTrakDBAdmin')
    postgres_password = os.getenv('POSTGRES_PASSWORD', 'BigMeZoo1974!?')
    
    db_url = f"postgresql+psycopg2://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}"
    engine = create_engine(db_url)
    
    print("=" * 80)
    print("📊 Trading Accounts Ownership Analysis")
    print("=" * 80)
    print()
    
    with engine.connect() as conn:
        # Get all trading accounts
        result = conn.execute(text("""
            SELECT 
                ta.id,
                ta.name,
                ta.user_id as current_user_id,
                u.username as current_username
            FROM trading_accounts ta
            LEFT JOIN users u ON ta.user_id = u.id
            ORDER BY ta.id
        """))
        accounts = result.fetchall()
        
        print(f"Found {len(accounts)} trading accounts\n")
        
        # Analyze each account
        account_analysis = []
        for account in accounts:
            account_id, account_name, current_user_id, current_username = account
            
            # Get activity breakdown
            result = conn.execute(text("""
                SELECT 
                    COUNT(DISTINCT e.id) as execution_count,
                    COUNT(DISTINCT t.id) as trade_count,
                    COUNT(DISTINCT cf.id) as cashflow_count,
                    COUNT(DISTINCT e.user_id) as execution_users,
                    COUNT(DISTINCT t.user_id) as trade_users,
                    COUNT(DISTINCT cf.user_id) as cashflow_users,
                    STRING_AGG(DISTINCT e.user_id::text, ', ') as execution_user_ids,
                    STRING_AGG(DISTINCT t.user_id::text, ', ') as trade_user_ids,
                    STRING_AGG(DISTINCT cf.user_id::text, ', ') as cashflow_user_ids
                FROM trading_accounts ta
                LEFT JOIN executions e ON ta.id = e.trading_account_id
                LEFT JOIN trades t ON ta.id = t.trading_account_id
                LEFT JOIN cash_flows cf ON ta.id = cf.trading_account_id
                WHERE ta.id = :account_id
                GROUP BY ta.id
            """), {"account_id": account_id})
            
            activity = result.fetchone()
            
            if activity:
                exec_count = activity[0] or 0
                trade_count = activity[1] or 0
                cashflow_count = activity[2] or 0
                exec_users = activity[3] or 0
                trade_users = activity[4] or 0
                cashflow_users = activity[5] or 0
                exec_user_ids = activity[6] or ''
                trade_user_ids = activity[7] or ''
                cashflow_user_ids = activity[8] or ''
                
                total_activity = exec_count + trade_count + cashflow_count
                
                account_analysis.append({
                    'id': account_id,
                    'name': account_name,
                    'current_user_id': current_user_id,
                    'current_username': current_username,
                    'executions': exec_count,
                    'trades': trade_count,
                    'cashflows': cashflow_count,
                    'total_activity': total_activity,
                    'execution_user_ids': exec_user_ids,
                    'trade_user_ids': trade_user_ids,
                    'cashflow_user_ids': cashflow_user_ids
                })
        
        # Print detailed analysis
        print("Detailed Account Analysis:")
        print("-" * 80)
        for acc in account_analysis:
            print(f"\nAccount ID {acc['id']}: {acc['name']}")
            print(f"  Current Owner: {acc['current_username']} (user_id: {acc['current_user_id']})")
            print(f"  Activity: {acc['total_activity']} total")
            print(f"    - Executions: {acc['executions']} (users: {acc['execution_user_ids'] or 'none'})")
            print(f"    - Trades: {acc['trades']} (users: {acc['trade_user_ids'] or 'none'})")
            print(f"    - Cash Flows: {acc['cashflows']} (users: {acc['cashflow_user_ids'] or 'none'})")
        
        # Get user activity summary
        print("\n" + "=" * 80)
        print("User Activity Summary:")
        print("-" * 80)
        
        result = conn.execute(text("""
            SELECT 
                u.id,
                u.username,
                COUNT(DISTINCT e.trading_account_id) as accounts_with_executions,
                COUNT(DISTINCT t.trading_account_id) as accounts_with_trades,
                COUNT(DISTINCT cf.trading_account_id) as accounts_with_cashflows,
                COUNT(e.id) as total_executions,
                COUNT(t.id) as total_trades,
                COUNT(cf.id) as total_cashflows
            FROM users u
            LEFT JOIN executions e ON u.id = e.user_id
            LEFT JOIN trades t ON u.id = t.user_id
            LEFT JOIN cash_flows cf ON u.id = cf.user_id
            WHERE u.username IN ('nimrod', 'admin', 'user')
            GROUP BY u.id, u.username
            ORDER BY u.id
        """))
        
        users = result.fetchall()
        for user in users:
            user_id, username, exec_accounts, trade_accounts, cashflow_accounts, exec_total, trade_total, cashflow_total = user
            print(f"\n{username} (user_id: {user_id}):")
            print(f"  Accounts with executions: {exec_accounts or 0}")
            print(f"  Accounts with trades: {trade_accounts or 0}")
            print(f"  Accounts with cashflows: {cashflow_accounts or 0}")
            print(f"  Total activity: {exec_total or 0} executions, {trade_total or 0} trades, {cashflow_total or 0} cashflows")
        
        # Suggest ownership based on activity
        print("\n" + "=" * 80)
        print("Suggested Ownership Based on Activity:")
        print("-" * 80)
        print("\n⚠️  All activity belongs to user_id=1 (nimrod)")
        print("    No activity found for admin (user_id=10) or user (user_id=11)")
        print("\n    Expected distribution:")
        print("    - nimrod: 0 accounts")
        print("    - admin: 2 accounts")
        print("    - user: 3 accounts")
        print("\n    Current distribution:")
        print("    - nimrod: 5 accounts (all)")
        print("    - admin: 0 accounts")
        print("    - user: 0 accounts")
        
        # Sort accounts by activity for suggested distribution
        sorted_accounts = sorted(account_analysis, key=lambda x: x['total_activity'], reverse=True)
        
        print("\n    Suggested reallocation (by activity level):")
        if len(sorted_accounts) >= 5:
            print(f"    Admin (2 accounts):")
            print(f"      - {sorted_accounts[0]['name']} (id: {sorted_accounts[0]['id']}, activity: {sorted_accounts[0]['total_activity']})")
            print(f"      - {sorted_accounts[1]['name']} (id: {sorted_accounts[1]['id']}, activity: {sorted_accounts[1]['total_activity']})")
            print(f"    User (3 accounts):")
            print(f"      - {sorted_accounts[2]['name']} (id: {sorted_accounts[2]['id']}, activity: {sorted_accounts[2]['total_activity']})")
            print(f"      - {sorted_accounts[3]['name']} (id: {sorted_accounts[3]['id']}, activity: {sorted_accounts[3]['total_activity']})")
            print(f"      - {sorted_accounts[4]['name']} (id: {sorted_accounts[4]['id']}, activity: {sorted_accounts[4]['total_activity']})")
        
        print("\n" + "=" * 80)

if __name__ == "__main__":
    try:
        analyze_account_ownership()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

