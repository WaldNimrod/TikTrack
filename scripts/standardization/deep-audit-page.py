#!/usr/bin/env python3
"""
Script to perform deep audit of a single page
Checks all 20 categories of standardization
"""

import re
import os
import json
import sys
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent.parent
TRADING_UI_DIR = BASE_DIR / 'trading-ui'
SCRIPTS_DIR = TRADING_UI_DIR / 'scripts'

# Categories to check
CATEGORIES = [
    'unified_init',
    'section_toggle',
    'notifications',
    'modals',
    'tables',
    'field_renderer',
    'crud_handler',
    'select_populator',
    'data_collection',
    'icons',
    'colors',
    'info_summary',
    'pagination',
    'entity_details',
    'conditions',
    'page_state',
    'logger',
    'cache',
    'dom_manipulation',
    'html_structure',
]

# Patterns for each category
CATEGORY_PATTERNS = {
    'unified_init': [
        r'package-manifest\.js',
        r'page-initialization-configs\.js',
        r'unified-app-initializer\.js',
    ],
    'section_toggle': [
        r'data-section',
        r'toggleSection',
        r'restoreAllSectionStates',
    ],
    'notifications': [
        r'alert\(',
        r'confirm\(',
        r'NotificationSystem',
        r'showSuccessNotification',
        r'showErrorNotification',
    ],
    'modals': [
        r'bootstrap\.Modal',
        r'ModalManagerV2',
        r'openModal',
    ],
    'tables': [
        r'data-table-type',
        r'UnifiedTableSystem',
    ],
    'field_renderer': [
        r'FieldRendererService',
        r'function\s+(renderStatus|renderAmount|renderDate)',
    ],
    'crud_handler': [
        r'CRUDResponseHandler',
        r'handleCRUDResponse',
    ],
    'select_populator': [
        r'SelectPopulatorService',
        r'populateSelect',
    ],
    'data_collection': [
        r'DataCollectionService',
        r'collectFormData',
        r'querySelector.*\.value',
    ],
    'icons': [
        r'IconSystem',
        r'icon-placeholder',
        r'<img.*icon',
    ],
    'colors': [
        r'ColorSchemeSystem',
        r'getEntityColor',
    ],
    'info_summary': [
        r'InfoSummarySystem',
        r'data-info-summary',
    ],
    'pagination': [
        r'PaginationSystem',
        r'data-pagination',
    ],
    'entity_details': [
        r'showEntityDetails',
        r'EntityDetailsModal',
    ],
    'conditions': [
        r'ConditionsSystem',
        r'conditions-initializer',
    ],
    'page_state': [
        r'PageStateManager',
        r'localStorage\.(getItem|setItem)',
    ],
    'logger': [
        r'console\.(log|error|warn)',
        r'window\.Logger',
        r'logger-service\.js',
    ],
    'cache': [
        r'UnifiedCacheManager',
        r'CacheTTLGuard',
    ],
    'dom_manipulation': [
        r'\.innerHTML\s*=',
        r'createElement',
    ],
    'html_structure': [
        r'data-onclick',
        r'data-button-type',
        r'unified-header',
        r'style\s*=',
        r'<style',
    ],
}

def check_category(file_path, category):
    """Check a specific category in a file"""
    if not file_path.exists():
        return {'status': 'file_not_found', 'issues': []}
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
    except Exception as e:
        return {'status': 'error', 'error': str(e), 'issues': []}
    
    issues = []
    patterns = CATEGORY_PATTERNS.get(category, [])
    
    for pattern in patterns:
        matches = list(re.finditer(pattern, content, re.IGNORECASE))
        for match in matches:
            line_num = content[:match.start()].count('\n') + 1
            line_content = lines[line_num - 1].strip()[:100]
            issues.append({
                'line': line_num,
                'content': line_content,
                'pattern': pattern,
                'match': match.group()[:50]
            })
    
    # Determine status
    if category in ['notifications', 'modals', 'page_state', 'logger', 'dom_manipulation']:
        # These should NOT have certain patterns
        negative_patterns = {
            'notifications': [r'alert\(', r'confirm\('],
            'modals': [r'bootstrap\.Modal'],
            'page_state': [r'localStorage\.(getItem|setItem)'],
            'logger': [r'console\.(log|error|warn)'],
            'dom_manipulation': [r'\.innerHTML\s*='],
        }
        if category in negative_patterns:
            has_negative = any(re.search(p, content) for p in negative_patterns[category])
            if has_negative:
                status = 'issues_found'
            else:
                status = 'ok'
        else:
            status = 'ok' if not issues else 'issues_found'
    else:
        # These should HAVE certain patterns
        positive_patterns = {
            'unified_init': [r'unified-app-initializer\.js'],
            'section_toggle': [r'toggleSection'],
            'tables': [r'data-table-type'],
            'field_renderer': [r'FieldRendererService'],
            'crud_handler': [r'CRUDResponseHandler'],
            'select_populator': [r'SelectPopulatorService'],
            'data_collection': [r'DataCollectionService'],
            'icons': [r'IconSystem'],
            'colors': [r'ColorSchemeSystem'],
            'info_summary': [r'InfoSummarySystem'],
            'pagination': [r'PaginationSystem'],
            'entity_details': [r'showEntityDetails'],
            'conditions': [r'ConditionsSystem'],
            'cache': [r'UnifiedCacheManager'],
        }
        if category in positive_patterns:
            has_positive = any(re.search(p, content) for p in positive_patterns[category])
            if has_positive:
                status = 'ok'
            else:
                status = 'missing'
        else:
            status = 'ok' if not issues else 'issues_found'
    
    return {
        'status': status,
        'issues': issues,
        'issue_count': len(issues)
    }

def audit_page(page_name):
    """Perform deep audit of a single page"""
    print(f"🔍 Auditing page: {page_name}")
    print("=" * 80)
    print()
    
    # Find JS and HTML files
    js_file = SCRIPTS_DIR / f"{page_name.replace('.html', '')}.js"
    html_file = TRADING_UI_DIR / (page_name if page_name.endswith('.html') else f"{page_name}.html")
    
    results = {
        'page': page_name,
        'js_file': str(js_file) if js_file.exists() else None,
        'html_file': str(html_file) if html_file.exists() else None,
        'categories': {}
    }
    
    # Check each category
    for category in CATEGORIES:
        print(f"📋 Checking {category}...")
        
        # Check JS file
        js_result = check_category(js_file, category) if js_file.exists() else None
        
        # Check HTML file
        html_result = check_category(html_file, category) if html_file.exists() else None
        
        # Combine results
        combined_issues = []
        if js_result and js_result.get('issues'):
            combined_issues.extend([{**issue, 'file': 'js'} for issue in js_result['issues']])
        if html_result and html_result.get('issues'):
            combined_issues.extend([{**issue, 'file': 'html'} for issue in html_result['issues']])
        
        # Determine overall status
        if js_result and html_result:
            if js_result['status'] == 'ok' and html_result['status'] == 'ok':
                overall_status = 'ok'
            elif js_result['status'] == 'issues_found' or html_result['status'] == 'issues_found':
                overall_status = 'issues_found'
            elif js_result['status'] == 'missing' or html_result['status'] == 'missing':
                overall_status = 'missing'
            else:
                overall_status = 'unknown'
        elif js_result:
            overall_status = js_result['status']
        elif html_result:
            overall_status = html_result['status']
        else:
            overall_status = 'file_not_found'
        
        results['categories'][category] = {
            'status': overall_status,
            'issues': combined_issues,
            'issue_count': len(combined_issues),
            'js_result': js_result,
            'html_result': html_result
        }
        
        status_icon = '✅' if overall_status == 'ok' else '⚠️' if overall_status == 'issues_found' else '❌'
        print(f"   {status_icon} Status: {overall_status} ({len(combined_issues)} issues)")
        print()
    
    # Save results
    output_file = BASE_DIR / 'documentation' / '05-REPORTS' / f'STANDARDIZATION_AUDIT_{page_name.replace(".html", "").replace("-", "_").upper()}.json'
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Results saved to: {output_file}")
    print()
    
    # Print summary
    print("=" * 80)
    print("📊 AUDIT SUMMARY")
    print("=" * 80)
    
    ok_count = sum(1 for cat in results['categories'].values() if cat['status'] == 'ok')
    issues_count = sum(1 for cat in results['categories'].values() if cat['status'] == 'issues_found')
    missing_count = sum(1 for cat in results['categories'].values() if cat['status'] == 'missing')
    
    print(f"✅ OK: {ok_count}/{len(CATEGORIES)}")
    print(f"⚠️ Issues found: {issues_count}/{len(CATEGORIES)}")
    print(f"❌ Missing: {missing_count}/{len(CATEGORIES)}")
    print()
    
    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python deep-audit-page.py <page_name>")
        print("Example: python deep-audit-page.py index.html")
        sys.exit(1)
    
    page_name = sys.argv[1]
    audit_page(page_name)




