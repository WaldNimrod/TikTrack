#!/usr/bin/env python3
"""
User Data Association Check Script
סקריפט לבדיקת שיוך נתונים למשתמשים

This script checks:
1. Count of records per user in each table
2. Records without user_id (NULL)
3. Records with invalid user_id (not exists in users table)
4. Records that need fixing

⚠️ CRITICAL: Review the report before making any changes to the database!
"""

import sys
import os
import json
from datetime import datetime
from typing import Dict, List, Any, Optional

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from Backend.config.database import SessionLocal
from Backend.models.user import User
from Backend.models.trading_account import TradingAccount
from Backend.models.trade import Trade
from Backend.models.trade_plan import TradePlan
from Backend.models.execution import Execution
from Backend.models.cash_flow import CashFlow
from Backend.models.alert import Alert
from Backend.models.note import Note
from Backend.models.user_ticker import UserTicker
from Backend.models.preferences import PreferenceProfile, UserPreference
from Backend.models.ai_analysis import AIAnalysisRequest
from Backend.models.email_log import EmailLog
from Backend.models.password_reset_token import PasswordResetToken
from Backend.models.import_session import ImportSession
from Backend.models.tag import Tag
from Backend.models.tag_category import TagCategory
from sqlalchemy import func, and_


# Tables to check with their models and user_id column names
TABLES_TO_CHECK = [
    ('trading_accounts', TradingAccount, 'user_id'),
    ('trades', Trade, 'user_id'),
    ('trade_plans', TradePlan, 'user_id'),
    ('executions', Execution, 'user_id'),
    ('cash_flows', CashFlow, 'user_id'),
    ('alerts', Alert, 'user_id'),
    ('notes', Note, 'user_id'),
    ('user_tickers', UserTicker, 'user_id'),
    ('preference_profiles', PreferenceProfile, 'user_id'),
    ('user_preferences', UserPreference, 'user_id'),
    ('ai_analysis_requests', AIAnalysisRequest, 'user_id'),
    ('email_logs', EmailLog, 'user_id'),  # nullable=True
    ('import_sessions', ImportSession, 'user_id'),
    ('tags', Tag, 'user_id'),
    ('tag_categories', TagCategory, 'user_id'),
]


def get_all_users(db) -> List[Dict[str, Any]]:
    """Get all users from database"""
    users = db.query(User).all()
    return [{'id': u.id, 'username': u.username, 'email': u.email} for u in users]


def check_table(db, table_name: str, model, user_id_column: str) -> Dict[str, Any]:
    """
    Check a single table for user data association issues
    
    Returns:
        {
            'table_name': str,
            'total_records': int,
            'records_by_user': Dict[int, int],
            'records_without_user_id': List[int],  # IDs of records with NULL user_id
            'records_with_invalid_user_id': List[Dict],  # Records with user_id not in users table
            'needs_fixing': bool
        }
    """
    result = {
        'table_name': table_name,
        'total_records': 0,
        'records_by_user': {},
        'records_without_user_id': [],
        'records_with_invalid_user_id': [],
        'needs_fixing': False
    }
    
    try:
        # Get all user IDs
        user_ids = {u.id for u in db.query(User.id).all()}
        
        # Count total records
        total = db.query(func.count(model.id)).scalar()
        result['total_records'] = total or 0
        
        if total == 0:
            return result
        
        # Count records by user
        user_id_col = getattr(model, user_id_column)
        
        # Check if user_id column is nullable
        is_nullable = user_id_col.nullable if hasattr(user_id_col, 'nullable') else False
        
        # Count by user_id
        counts = db.query(
            user_id_col,
            func.count(model.id).label('count')
        ).group_by(user_id_col).all()
        
        for user_id, count in counts:
            if user_id is None:
                # Records without user_id
                if not is_nullable:
                    # This is a problem - user_id should not be NULL
                    null_records = db.query(model.id).filter(user_id_col.is_(None)).all()
                    result['records_without_user_id'] = [r[0] for r in null_records]
                    result['needs_fixing'] = True
            else:
                result['records_by_user'][user_id] = count
                
                # Check if user_id exists in users table
                if user_id not in user_ids:
                    # Invalid user_id
                    invalid_records = db.query(model.id).filter(user_id_col == user_id).limit(10).all()
                    result['records_with_invalid_user_id'].append({
                        'user_id': user_id,
                        'record_ids': [r[0] for r in invalid_records],
                        'total_count': db.query(func.count(model.id)).filter(user_id_col == user_id).scalar()
                    })
                    result['needs_fixing'] = True
        
        # If table allows NULL user_id (like email_logs), check for NULLs
        if is_nullable:
            null_count = db.query(func.count(model.id)).filter(user_id_col.is_(None)).scalar()
            if null_count > 0:
                null_records = db.query(model.id).filter(user_id_col.is_(None)).limit(10).all()
                result['records_without_user_id'] = [r[0] for r in null_records]
                # Note: For nullable columns, NULL might be acceptable (e.g., system emails)
                # So we don't mark needs_fixing=True for nullable columns
        
    except Exception as e:
        result['error'] = str(e)
        result['needs_fixing'] = True
    
    return result


def generate_report(db) -> Dict[str, Any]:
    """Generate comprehensive report"""
    report = {
        'generated_at': datetime.now().isoformat(),
        'users': get_all_users(db),
        'tables': [],
        'summary': {
            'total_tables_checked': 0,
            'tables_with_issues': 0,
            'total_records': 0,
            'records_needing_fix': 0
        }
    }
    
    for table_name, model, user_id_column in TABLES_TO_CHECK:
        print(f"Checking table: {table_name}...")
        table_result = check_table(db, table_name, model, user_id_column)
        report['tables'].append(table_result)
        
        # Update summary
        report['summary']['total_tables_checked'] += 1
        if table_result.get('needs_fixing'):
            report['summary']['tables_with_issues'] += 1
        
        report['summary']['total_records'] += table_result['total_records']
        
        # Count records needing fix
        if table_result.get('records_without_user_id'):
            report['summary']['records_needing_fix'] += len(table_result['records_without_user_id'])
        if table_result.get('records_with_invalid_user_id'):
            for invalid in table_result['records_with_invalid_user_id']:
                report['summary']['records_needing_fix'] += invalid.get('total_count', 0)
    
    return report


def print_report(report: Dict[str, Any]):
    """Print human-readable report"""
    print("\n" + "="*80)
    print("USER DATA ASSOCIATION CHECK REPORT")
    print("="*80)
    print(f"Generated at: {report['generated_at']}")
    print(f"\nTotal Users: {len(report['users'])}")
    for user in report['users']:
        print(f"  - User ID {user['id']}: {user['username']} ({user.get('email', 'N/A')})")
    
    print(f"\n{'='*80}")
    print("TABLE ANALYSIS")
    print("="*80)
    
    for table in report['tables']:
        print(f"\n📊 Table: {table['table_name']}")
        print(f"   Total Records: {table['total_records']}")
        
        if table.get('error'):
            print(f"   ❌ ERROR: {table['error']}")
            continue
        
        # Records by user
        if table['records_by_user']:
            print(f"   Records by User:")
            for user_id, count in sorted(table['records_by_user'].items()):
                user_info = next((u for u in report['users'] if u['id'] == user_id), None)
                username = user_info['username'] if user_info else f"Unknown (ID: {user_id})"
                print(f"     - User {user_id} ({username}): {count} records")
        
        # Issues
        issues = []
        if table.get('records_without_user_id'):
            issues.append(f"❌ {len(table['records_without_user_id'])} records without user_id (NULL)")
            if len(table['records_without_user_id']) <= 10:
                print(f"      Record IDs: {table['records_without_user_id']}")
        
        if table.get('records_with_invalid_user_id'):
            for invalid in table['records_with_invalid_user_id']:
                issues.append(f"❌ {invalid['total_count']} records with invalid user_id={invalid['user_id']} (user doesn't exist)")
                if invalid['record_ids']:
                    print(f"      Sample Record IDs: {invalid['record_ids']}")
        
        if issues:
            print(f"   ⚠️  ISSUES FOUND:")
            for issue in issues:
                print(f"      {issue}")
        else:
            print(f"   ✅ No issues found")
    
    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print("="*80)
    summary = report['summary']
    print(f"Total Tables Checked: {summary['total_tables_checked']}")
    print(f"Tables with Issues: {summary['tables_with_issues']}")
    print(f"Total Records: {summary['total_records']}")
    print(f"Records Needing Fix: {summary['records_needing_fix']}")
    
    if summary['tables_with_issues'] > 0:
        print(f"\n⚠️  WARNING: {summary['tables_with_issues']} table(s) have issues that need fixing!")
        print("   Review the detailed report above before making any changes.")
    else:
        print(f"\n✅ All tables are properly associated with users!")


def main():
    """Main function"""
    db = SessionLocal()
    try:
        print("Starting user data association check...")
        report = generate_report(db)
        
        # Print report
        print_report(report)
        
        # Save to JSON file
        output_file = 'scripts/security/user_data_association_report.json'
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n✅ Report saved to: {output_file}")
        print("\n⚠️  IMPORTANT: Review the report before making any database changes!")
        
        return 0 if report['summary']['tables_with_issues'] == 0 else 1
        
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1
    finally:
        db.close()


if __name__ == '__main__':
    exit(main())

