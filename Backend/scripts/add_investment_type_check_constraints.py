#!/usr/bin/env python3
"""
Add CHECK constraints for investment_type and status fields
===========================================================
This script adds CHECK constraints at the database level to enforce
valid investment_type and status values in trade_plans and trades tables.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import ProgrammingError

# Configuration
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_DB = os.getenv('POSTGRES_DB', 'TikTrack-db-development')
POSTGRES_USER = os.getenv('POSTGRES_USER', 'TikTrakDBAdmin')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'BigMeZoo1974!?')

# Allow override via command line argument
import sys
if len(sys.argv) > 1 and sys.argv[1] == '--production':
    POSTGRES_DB = 'TikTrack-db-production'
    print("🔧 Running in PRODUCTION mode")

DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}/{POSTGRES_DB}"

def add_check_constraints():
    """Add CHECK constraints for investment_type and status"""
    engine = create_engine(DATABASE_URL)
    
    constraints = [
        # Trade Plans
        {
            'table': 'trade_plans',
            'column': 'investment_type',
            'name': 'check_trade_plans_investment_type',
            'clause': "investment_type IN ('swing', 'investment', 'passive')"
        },
        {
            'table': 'trade_plans',
            'column': 'status',
            'name': 'check_trade_plans_status',
            'clause': "status IN ('open', 'closed', 'cancelled')"
        },
        # Trades
        {
            'table': 'trades',
            'column': 'investment_type',
            'name': 'check_trades_investment_type',
            'clause': "investment_type IN ('swing', 'investment', 'passive')"
        },
        {
            'table': 'trades',
            'column': 'status',
            'name': 'check_trades_status',
            'clause': "status IN ('open', 'closed', 'cancelled')"
        }
    ]
    
    with engine.connect() as conn:
        trans = conn.begin()
        
        try:
            for constraint in constraints:
                # Drop existing constraint if exists
                try:
                    conn.execute(text(f"""
                        ALTER TABLE {constraint['table']}
                        DROP CONSTRAINT IF EXISTS {constraint['name']}
                    """))
                    print(f"✅ Dropped existing constraint {constraint['name']} (if existed)")
                except Exception as e:
                    print(f"⚠️  Could not drop constraint {constraint['name']}: {e}")
                
                # Add new constraint
                try:
                    conn.execute(text(f"""
                        ALTER TABLE {constraint['table']}
                        ADD CONSTRAINT {constraint['name']}
                        CHECK ({constraint['clause']})
                    """))
                    print(f"✅ Added CHECK constraint {constraint['name']} on {constraint['table']}.{constraint['column']}")
                except ProgrammingError as e:
                    if 'already exists' in str(e).lower():
                        print(f"⚠️  Constraint {constraint['name']} already exists")
                    else:
                        raise
            
            trans.commit()
            print("\n✅ All CHECK constraints added successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Error: {e}")
            raise

def fix_invalid_data():
    """Fix invalid investment_type values in production database"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        trans = conn.begin()
        
        try:
            # Check and fix trade_plans
            invalid_plans = conn.execute(text("""
                SELECT id, investment_type
                FROM trade_plans
                WHERE investment_type NOT IN ('swing', 'investment', 'passive')
            """)).fetchall()
            
            if invalid_plans:
                print(f"\n🔧 מתקן {len(invalid_plans)} תוכניות טרייד...")
                result = conn.execute(text("""
                    UPDATE trade_plans
                    SET investment_type = 'swing'
                    WHERE investment_type NOT IN ('swing', 'investment', 'passive')
                """))
                print(f"   ✅ עודכנו {result.rowcount} תוכניות טרייד")
            
            # Check and fix trades
            invalid_trades = conn.execute(text("""
                SELECT id, investment_type
                FROM trades
                WHERE investment_type NOT IN ('swing', 'investment', 'passive')
            """)).fetchall()
            
            if invalid_trades:
                print(f"\n🔧 מתקן {len(invalid_trades)} טריידים...")
                result = conn.execute(text("""
                    UPDATE trades
                    SET investment_type = 'swing'
                    WHERE investment_type NOT IN ('swing', 'investment', 'passive')
                """))
                print(f"   ✅ עודכנו {result.rowcount} טריידים")
            
            if invalid_plans or invalid_trades:
                trans.commit()
                print("\n✅ תיקון נתונים הושלם בהצלחה!")
            else:
                trans.rollback()
                print("\n✅ אין נתונים שצריכים תיקון")
                
        except Exception as e:
            trans.rollback()
            print(f"\n❌ שגיאה בתיקון נתונים: {e}")
            raise

if __name__ == "__main__":
    import sys
    
    is_production = len(sys.argv) > 1 and sys.argv[1] == '--production'
    db_name = 'PRODUCTION' if is_production else 'DEVELOPMENT'
    
    print("="*80)
    print(f"Adding CHECK constraints for investment_type and status - {db_name}")
    print("="*80)
    print()
    
    # Fix invalid data first (if production)
    if is_production:
        print("🔧 Step 1: Fixing invalid data...")
        fix_invalid_data()
        print()
    
    # Add constraints
    print("🔧 Step 2: Adding CHECK constraints...")
    add_check_constraints()
    
    print("\n" + "="*80)
    print("✅ Process completed!")
    print("="*80)

