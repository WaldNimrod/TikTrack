#!/usr/bin/env python3
"""
Delete Imported Cash Flows Script
==================================

מחיקת כל רשומות תזרימי המזומנים שמקורן בייבוא (source='file_import')

Usage:
    python3 Backend/scripts/delete_imported_cash_flows.py

⚠️  WARNING: This will permanently delete all cash flows with source='file_import'!
"""

import sys
import os
from pathlib import Path

# Add Backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.database import get_db
from models.cash_flow import CashFlow
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def delete_imported_cash_flows():
    """Delete all cash flows with source='file_import'"""
    
    db = next(get_db())
    
    try:
        # Count cash flows to be deleted
        count = db.query(CashFlow).filter(CashFlow.source == 'file_import').count()
        
        if count == 0:
            print("✅ No imported cash flows found. Nothing to delete.")
            return
        
        print(f"🔍 Found {count} cash flow(s) with source='file_import'")
        print("⚠️  About to delete these records...")
        
        # Get details for logging
        cash_flows = db.query(CashFlow).filter(CashFlow.source == 'file_import').all()
        
        print("\n📋 Cash flows to be deleted:")
        for cf in cash_flows:
            print(f"  • ID: {cf.id}, Type: {cf.type}, Amount: {cf.amount}, Date: {cf.date}, External ID: {cf.external_id}")
        
        # Delete all imported cash flows
        deleted_count = db.query(CashFlow).filter(CashFlow.source == 'file_import').delete()
        
        # Commit the deletion
        db.commit()
        
        print(f"\n✅ Successfully deleted {deleted_count} cash flow(s) with source='file_import'")
        print("💡 You can now test the import process again")
        
    except Exception as e:
        logger.error(f"❌ Error deleting imported cash flows: {e}", exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 TikTrack - Delete Imported Cash Flows Script")
    print("=" * 60)
    print("⚠️  WARNING: This will delete all cash flows with source='file_import'")
    print("=" * 60)
    
    try:
        delete_imported_cash_flows()
        print("\n🎉 Script completed successfully!")
    except Exception as e:
        print(f"\n❌ Script failed: {e}")
        sys.exit(1)

