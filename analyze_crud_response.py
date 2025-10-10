#!/usr/bin/env python3
"""
CRUD Response Patterns Analyzer
================================
מזהה את כל מקומות הטיפול בתגובות CRUD ומה כבר משולב
"""

import re
import os

# רשימת קבצים
files = [
    'trading-ui/scripts/trading_accounts.js',
    'trading-ui/scripts/trades.js',
    'trading-ui/scripts/cash_flows.js',
    'trading-ui/scripts/trade_plans.js',
    'trading-ui/scripts/executions.js',
    'trading-ui/scripts/tickers.js',
    'trading-ui/scripts/alerts.js',
    'trading-ui/scripts/notes.js'
]

print('🔍 מנתח דפוסי CRUD Response...\n')
print('━' * 70)
print('📊 ניתוח לפי עמודים:')
print('━' * 70)
print()

total_places = 0
total_integrated = 0
results = []

for filepath in files:
    if not os.path.exists(filepath):
        continue
    
    filename = os.path.basename(filepath).replace('.js', '')
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    # מציאת כל מקומות response.ok
    response_checks = []
    for i, line in enumerate(lines):
        if re.search(r'if\s*\(\s*!response\.ok\s*\)', line):
            # זיהוי שם פונקציה
            func_name = 'unknown'
            for j in range(max(0, i - 40), i):
                func_match = re.search(r'(?:async\s+)?function\s+(\w+)', lines[j])
                if func_match:
                    func_name = func_match.group(1)
                    break
                class_func = re.search(r'async\s+(\w+)\s*\(', lines[j])
                if class_func:
                    func_name = class_func.group(1)
                    break
            
            # זיהוי סוג פעולה
            method = 'unknown'
            for j in range(max(0, i - 15), i):
                method_match = re.search(r"method:\s*['\"]?(POST|PUT|DELETE)['\"]?", lines[j])
                if method_match:
                    method = method_match.group(1)
                    break
            
            # בדיקה אם כבר משולב
            context = '\n'.join(lines[max(0, i-5):min(len(lines), i+10)])
            integrated = 'CRUDResponseHandler' in context
            
            response_checks.append({
                'line': i + 1,
                'function': func_name,
                'method': method,
                'integrated': integrated
            })
    
    if response_checks:
        integrated_count = sum(1 for r in response_checks if r['integrated'])
        pending_count = len(response_checks) - integrated_count
        percentage = round((integrated_count / len(response_checks)) * 100) if response_checks else 0
        
        status = '✅' if pending_count == 0 else '🔄' if integrated_count > 0 else '⏳'
        
        print(f'{status} {filename}:')
        print(f'   סה"כ: {len(response_checks)} | משולבים: {integrated_count} | ממתינים: {pending_count} ({percentage}%)')
        
        if pending_count > 0:
            print('   פונקציות ממתינות:')
            for check in response_checks:
                if not check['integrated']:
                    print(f"      - שורה {check['line']}: {check['function']}() - {check['method']}")
        
        print()
        
        total_places += len(response_checks)
        total_integrated += integrated_count
        
        results.append({
            'file': filename,
            'total': len(response_checks),
            'integrated': integrated_count,
            'pending': pending_count,
            'checks': response_checks
        })

print('━' * 70)
print('🎯 סיכום כללי:')
print(f'   סה"כ מקומות: {total_places}')
print(f'   משולבים: {total_integrated} ({round((total_integrated/total_places)*100) if total_places else 0}%)')
print(f'   ממתינים: {total_places - total_integrated}')
print('━' * 70)
print()

# המלצות
pending_files = [r for r in results if r['pending'] > 0]
if pending_files:
    print('💡 עמודים לשילוב:')
    for r in sorted(pending_files, key=lambda x: x['pending'], reverse=True):
        print(f'   {r["pending"]} מקומות - {r["file"]}.js')
else:
    print('🎉 כל העמודים משולבים!')

print('\n✅ ניתוח הושלם!')

