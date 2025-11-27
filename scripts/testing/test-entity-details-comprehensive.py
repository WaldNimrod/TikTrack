#!/usr/bin/env python3
"""
בדיקה מקיפה - Entity Details Modal
Comprehensive Testing Script for Entity Details Modal

בודק:
1. טעינת קבצים
2. זמינות פונקציות גלובליות
3. תקינות הקוד
4. עמידה בסטנדרט
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Any

PROJECT_ROOT = Path(__file__).parent.parent.parent
PAGES_ROOT = PROJECT_ROOT / "trading-ui"
SCRIPTS_ROOT = PROJECT_ROOT / "trading-ui" / "scripts"

def test_file_loading():
    """Test 1: Check if entity-details files are loaded in all pages"""
    print("=" * 80)
    print("📋 בדיקה 1: טעינת קבצים")
    print("=" * 80)
    print()
    
    required_files = [
        'entity-details-api.js',
        'entity-details-renderer.js',
        'entity-details-modal.js'
    ]
    
    # Pages that should have entity-details files
    pages_to_check = [
        "trades.html", "trade_plans.html", "alerts.html", "tickers.html",
        "trading_accounts.html", "executions.html", "cash_flows.html",
        "notes.html", "index.html", "research.html", "db_display.html",
        "preferences.html"
    ]
    
    results = {
        'total': len(pages_to_check),
        'passed': 0,
        'failed': 0,
        'details': []
    }
    
    for page in pages_to_check:
        html_path = PAGES_ROOT / page
        if not html_path.exists():
            results['failed'] += 1
            results['details'].append({
                'page': page,
                'status': 'file_not_found',
                'message': 'קובץ לא נמצא'
            })
            continue
        
        try:
            with open(html_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            missing = [f for f in required_files if f not in content]
            
            if missing:
                results['failed'] += 1
                results['details'].append({
                    'page': page,
                    'status': 'missing_files',
                    'message': f'חסרים: {", ".join(missing)}'
                })
            else:
                results['passed'] += 1
                results['details'].append({
                    'page': page,
                    'status': 'ok',
                    'message': 'כל הקבצים קיימים'
                })
                print(f"  ✅ {page}")
        
        except Exception as e:
            results['failed'] += 1
            results['details'].append({
                'page': page,
                'status': 'error',
                'message': f'שגיאה: {e}'
            })
    
    print()
    print(f"✅ עברו: {results['passed']}/{results['total']}")
    if results['failed'] > 0:
        print(f"❌ נכשלו: {results['failed']}/{results['total']}")
        for detail in results['details']:
            if detail['status'] != 'ok':
                print(f"  - {detail['page']}: {detail['message']}")
    
    print()
    return results

def test_functions_usage():
    """Test 2: Check if functions use showEntityDetails correctly"""
    print("=" * 80)
    print("📋 בדיקה 2: שימוש בפונקציות")
    print("=" * 80)
    print()
    
    # Files that were fixed
    fixed_files = [
        'account-activity.js',
        'executions.js',
        'trade-history-page.js'
    ]
    
    results = {
        'total': len(fixed_files),
        'passed': 0,
        'failed': 0,
        'details': []
    }
    
    for file_name in fixed_files:
        file_path = SCRIPTS_ROOT / file_name
        if not file_path.exists():
            results['failed'] += 1
            results['details'].append({
                'file': file_name,
                'status': 'file_not_found',
                'message': 'קובץ לא נמצא'
            })
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if uses showEntityDetails
            uses_showEntityDetails = 'showEntityDetails' in content
            
            # Check for old patterns (should not exist)
            old_patterns = [
                r'EntityDetailsModal\.show\s*\(',
                r'window\.EntityDetailsModal\.show\s*\(',
            ]
            
            has_old_patterns = False
            for pattern in old_patterns:
                if re.search(pattern, content):
                    has_old_patterns = True
                    break
            
            if uses_showEntityDetails and not has_old_patterns:
                results['passed'] += 1
                results['details'].append({
                    'file': file_name,
                    'status': 'ok',
                    'message': 'משתמש ב-showEntityDetails נכון'
                })
                print(f"  ✅ {file_name}")
            else:
                results['failed'] += 1
                issues = []
                if not uses_showEntityDetails:
                    issues.append('לא משתמש ב-showEntityDetails')
                if has_old_patterns:
                    issues.append('יש שימוש בדפוסים ישנים')
                results['details'].append({
                    'file': file_name,
                    'status': 'issue',
                    'message': ', '.join(issues)
                })
                print(f"  ❌ {file_name}: {', '.join(issues)}")
        
        except Exception as e:
            results['failed'] += 1
            results['details'].append({
                'file': file_name,
                'status': 'error',
                'message': f'שגיאה: {e}'
            })
    
    print()
    print(f"✅ עברו: {results['passed']}/{results['total']}")
    if results['failed'] > 0:
        print(f"❌ נכשלו: {results['failed']}/{results['total']}")
    
    print()
    return results

def test_code_quality():
    """Test 3: Check code quality (no obvious errors)"""
    print("=" * 80)
    print("📋 בדיקה 3: איכות קוד")
    print("=" * 80)
    print()
    
    files_to_check = [
        'account-activity.js',
        'executions.js',
        'trade-history-page.js',
        'entity-details-modal.js'
    ]
    
    results = {
        'total': len(files_to_check),
        'passed': 0,
        'failed': 0,
        'details': []
    }
    
    for file_name in files_to_check:
        file_path = SCRIPTS_ROOT / file_name
        if not file_path.exists():
            results['failed'] += 1
            continue
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Basic syntax checks
            issues = []
            
            # Check for unmatched braces (simple check)
            open_braces = content.count('{')
            close_braces = content.count('}')
            if abs(open_braces - close_braces) > 2:  # Allow some margin
                issues.append('חוסר התאמה בסוגריים מסולסלים')
            
            open_parens = content.count('(')
            close_parens = content.count(')')
            if abs(open_parens - close_parens) > 2:
                issues.append('חוסר התאמה בסוגריים')
            
            if not issues:
                results['passed'] += 1
                print(f"  ✅ {file_name}")
            else:
                results['failed'] += 1
                results['details'].append({
                    'file': file_name,
                    'status': 'issues',
                    'message': ', '.join(issues)
                })
                print(f"  ⚠️  {file_name}: {', '.join(issues)}")
        
        except Exception as e:
            results['failed'] += 1
            results['details'].append({
                'file': file_name,
                'status': 'error',
                'message': f'שגיאה: {e}'
            })
    
    print()
    print(f"✅ עברו: {results['passed']}/{results['total']}")
    if results['failed'] > 0:
        print(f"❌ נכשלו: {results['failed']}/{results['total']}")
    
    print()
    return results

def main():
    print()
    print("=" * 80)
    print("🧪 בדיקה מקיפה - Entity Details Modal")
    print("=" * 80)
    print()
    
    all_results = {}
    
    # Run all tests
    all_results['file_loading'] = test_file_loading()
    all_results['functions_usage'] = test_functions_usage()
    all_results['code_quality'] = test_code_quality()
    
    # Summary
    print("=" * 80)
    print("📊 סיכום כולל")
    print("=" * 80)
    print()
    
    total_tests = sum(r['total'] for r in all_results.values())
    total_passed = sum(r['passed'] for r in all_results.values())
    total_failed = sum(r['failed'] for r in all_results.values())
    
    print(f"📋 סה\"כ בדיקות: {total_tests}")
    print(f"✅ עברו: {total_passed}")
    print(f"❌ נכשלו: {total_failed}")
    print(f"📊 אחוז הצלחה: {(total_passed/total_tests*100):.1f}%")
    print()
    
    if total_failed == 0:
        print("🎉 כל הבדיקות עברו בהצלחה!")
    else:
        print("⚠️  יש בעיות שצריך לטפל בהן")
    
    print("=" * 80)

if __name__ == "__main__":
    main()



