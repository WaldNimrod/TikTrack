#!/usr/bin/env python3
"""
Reassign Trading Accounts Ownership Based on Activity
Updates trading accounts user_id and migrates all related data
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Add Backend to path
backend_dir = Path(__file__).parent.parent / "Backend"
sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text

def reassign_accounts():
    """Reassign trading accounts based on expected distribution"""
    
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
    print("🔄 Reassign Trading Accounts Ownership")
    print("=" * 80)
    print()
    
    # Expected distribution:
    # - nimrod (user_id=1): 0 accounts
    # - admin (user_id=10): 2 accounts (IBKR-Int, חשבון מסחר ראשי)
    # - user (user_id=11): 3 accounts (חשבון מסחר ILS, חשבון פנסיוני, חשבון בדיקות)
    
    reassignments = [
        {'account_id': 2, 'account_name': 'IBKR-Int', 'new_user_id': 10, 'new_username': 'admin'},
        {'account_id': 3, 'account_name': 'חשבון מסחר ראשי', 'new_user_id': 10, 'new_username': 'admin'},
        {'account_id': 5, 'account_name': 'חשבון מסחר ILS', 'new_user_id': 11, 'new_username': 'user'},
        {'account_id': 4, 'account_name': 'חשבון פנסיוני', 'new_user_id': 11, 'new_username': 'user'},
        {'account_id': 1, 'account_name': 'חשבון בדיקות', 'new_user_id': 11, 'new_username': 'user'},
    ]
    
    with engine.begin() as conn:  # Use transaction
        print("Current state:")
        print("-" * 80)
        result = conn.execute(text("""
            SELECT ta.id, ta.name, ta.user_id, u.username
            FROM trading_accounts ta
            LEFT JOIN users u ON ta.user_id = u.id
            ORDER BY ta.id
        """))
        for row in result:
            print(f"  Account {row[0]}: {row[1]} -> {row[3]} (user_id: {row[2]})")
        
        print("\n" + "=" * 80)
        print("Reassignment Plan:")
        print("-" * 80)
        for reassign in reassignments:
            print(f"  Account {reassign['account_id']} ({reassign['account_name']}) -> {reassign['new_username']} (user_id: {reassign['new_user_id']})")
        
        print("\n" + "=" * 80)
        print("Starting reassignment...")
        print("-" * 80)
        
        # Tables that reference trading_account_id
        tables_to_update = [
            'executions',
            'trades',
            'cash_flows'
        ]
        
        for reassign in reassignments:
            account_id = reassign['account_id']
            account_name = reassign['account_name']
            new_user_id = reassign['new_user_id']
            
            print(f"\n🔧 Reassigning account {account_id} ({account_name}) to user_id {new_user_id}...")
            
            # 1. Update trading_accounts table
            result = conn.execute(text("""
                UPDATE trading_accounts
                SET user_id = :new_user_id
                WHERE id = :account_id
            """), {"new_user_id": new_user_id, "account_id": account_id})
            print(f"  ✅ Updated trading_accounts table: {result.rowcount} row(s)")
            
            # 2. Update related tables
            for table in tables_to_update:
                result = conn.execute(text(f"""
                    UPDATE {table}
                    SET user_id = :new_user_id
                    WHERE trading_account_id = :account_id
                """), {"new_user_id": new_user_id, "account_id": account_id})
                if result.rowcount > 0:
                    print(f"  ✅ Updated {table} table: {result.rowcount} row(s)")
        
        print("\n" + "=" * 80)
        print("Final state:")
        print("-" * 80)
        result = conn.execute(text("""
            SELECT ta.id, ta.name, ta.user_id, u.username,
                   (SELECT COUNT(*) FROM executions WHERE trading_account_id = ta.id) as exec_count,
                   (SELECT COUNT(*) FROM trades WHERE trading_account_id = ta.id) as trade_count,
                   (SELECT COUNT(*) FROM cash_flows WHERE trading_account_id = ta.id) as cashflow_count
            FROM trading_accounts ta
            LEFT JOIN users u ON ta.user_id = u.id
            ORDER BY ta.user_id, ta.id
        """))
        for row in result:
            print(f"  Account {row[0]}: {row[1]} -> {row[3]} (user_id: {row[2]})")
            print(f"    Activity: {row[4]} executions, {row[5]} trades, {row[6]} cashflows")
        
        # Summary by user
        print("\n" + "=" * 80)
        print("Summary by user:")
        print("-" * 80)
        result = conn.execute(text("""
            SELECT u.id, u.username, COUNT(ta.id) as account_count
            FROM users u
            LEFT JOIN trading_accounts ta ON u.id = ta.user_id
            WHERE u.username IN ('nimrod', 'admin', 'user')
            GROUP BY u.id, u.username
            ORDER BY u.id
        """))
        for row in result:
            print(f"  {row[1]} (user_id: {row[0]}): {row[2]} accounts")
        
        print("\n" + "=" * 80)
        print("✅ Reassignment completed successfully!")
        print("=" * 80)

if __name__ == "__main__":
    try:
        print("\n⚠️  WARNING: This script will reassign trading accounts and migrate all related data!")
        print("   Press Ctrl+C to cancel, or wait 5 seconds to continue...")
        import time
        time.sleep(5)
        
        reassign_accounts()
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

