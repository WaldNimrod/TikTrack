#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from config.database import get_db
from models.account import Account

def test_accounts_service():
    """בדיקת accounts service"""
    try:
        db: Session = next(get_db())
        print("✅ Database connection successful")
        
        # בדיקת accounts
        accounts = db.query(Account).all()
        print(f"✅ Found {len(accounts)} accounts")
        
        if accounts:
            account = accounts[0]
            print(f"✅ First account: ID={account.id}, Name={account.name}, Status={account.status}")
            
            # בדיקת to_dict
            account_dict = account.to_dict()
            print(f"✅ Account dict: {account_dict}")
        
        db.close()
        print("✅ Database connection closed successfully")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_accounts_service()
