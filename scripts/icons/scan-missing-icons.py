#!/usr/bin/env python3
"""
Scan for missing or incomplete icon implementations
Finds Bootstrap Icons, FontAwesome, Emojis, and other icon-related issues
"""

import os
import re
from pathlib import Path
from collections import defaultdict

PROJECT_ROOT = Path(__file__).parent.parent.parent
TRADING_UI_DIR = PROJECT_ROOT / 'trading-ui'
DOCS_DIR = PROJECT_ROOT / 'documentation'

# Patterns to search for
PATTERNS = {
    'bootstrap_icons': [
        r'<i\s+class="[^"]*\bbi\s+bi-[^"]*">',
        r'class="[^"]*\bbi\s+bi-',
        r'bi\s+bi-',
    ],
    'fontawesome': [
        r'<i\s+class="[^"]*\bfa[srb]\s+fa-[^"]*">',
        r'class="[^"]*\bfa[srb]\s+fa-',
        r'fa[srb]\s+fa-',
    ],
    'emoji_icons': [
        r'📋|📊|🔧|⚙️|✅|❌|⚠️|📝|🎨|🔄|💾|🔍|📚|🚀|🏗️|🎯|📦|🔗|⭐|🌟|💡|🔥|✨|👁️|🗑️|✏️|➕|🔗',
    ],
    'old_icon_paths': [
        r'/trading-ui/images/icons/[^/]+\.svg',  # Old paths without tabler/entities/
        r'images/icons/[^/]+\.svg',
    ],
    'icon_cdn': [
        r'cdn\.jsdelivr\.net/npm/bootstrap-icons',
        r'cdnjs\.cloudflare\.com.*font-awesome',
    ],
    'text_content_icons': [
        r'textContent\s*=\s*[\'"][📋📊🔧⚙️✅❌⚠️📝🎨🔄💾🔍📚🚀🏗️🎯📦🔗⭐🌟💡🔥✨👁️🗑️✏️➕🔗]',
        r'innerHTML\s*=\s*[\'"][📋📊🔧⚙️✅❌⚠️📝🎨🔄💾🔍📚🚀🏗️🎯📦🔗⭐🌟💡🔥✨👁️🗑️✏️➕🔗]',
    ],
    'missing_icon_system': [
        r'iconPath\s*=|icon_url\s*=|iconUrl\s*=.*\.svg',  # Hardcoded icon paths
    ],
}

# Categories of files
CATEGORIES = {
    'main_pages': [
        'index.html', 'trades.html', 'trade_plans.html', 'alerts.html',
        'tickers.html', 'trading_accounts.html', 'executions.html',
        'cash_flows.html', 'notes.html', 'research.html', 'preferences.html',
        'data_import.html', 'db_display.html', 'notifications_center.html',
    ],
    'mockups': list((TRADING_UI_DIR / 'mockups').rglob('*.html')),
    'scripts': list((TRADING_UI_DIR / 'scripts').rglob('*.js')),
    'system_pages': [
        'system_management.html', 'server_monitor.html', 'background_tasks.html',
        'cache_management.html', 'css_management.html', 'constraints.html',
        'tag_management.html', 'code_quality_dashboard.html',
    ],
}

def scan_file(file_path, category):
    """Scan a single file for icon issues"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return {'error': str(e)}

    issues = defaultdict(list)
    line_num = 0

    for line in content.split('\n'):
        line_num += 1
        line_lower = line.lower()

        # Check each pattern
        for pattern_type, patterns in PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    issues[pattern_type].append({
                        'line': line_num,
                        'content': line.strip()[:100]
                    })

    # Check if file uses IconSystem
    uses_icon_system = (
        'IconSystem' in content or
        'icon-system.js' in content or
        'icon-mappings.js' in content
    )

    # Check if file is in backup directory
    is_backup = 'backup' in str(file_path) or file_path.name.endswith('.backup')

    return {
        'issues': dict(issues),
        'uses_icon_system': uses_icon_system,
        'is_backup': is_backup,
        'line_count': len(content.split('\n'))
    }

def scan_category(category_name, file_list):
    """Scan a category of files"""
    results = {
        'files': [],
        'total_issues': defaultdict(int),
        'files_with_issues': 0,
        'files_using_icon_system': 0,
    }

    for file_path in file_list:
        if isinstance(file_path, str):
            file_path = TRADING_UI_DIR / file_path
        
        if not file_path.exists():
            continue

        if file_path.suffix not in ['.html', '.js']:
            continue

        scan_result = scan_file(file_path, category_name)
        
        if 'error' in scan_result:
            continue

        if scan_result['is_backup']:
            continue

        rel_path = file_path.relative_to(PROJECT_ROOT)
        has_issues = any(scan_result['issues'].values())

        if has_issues:
            results['files_with_issues'] += 1
            results['files'].append({
                'path': str(rel_path),
                'issues': scan_result['issues'],
                'uses_icon_system': scan_result['uses_icon_system'],
            })

            for issue_type, issue_list in scan_result['issues'].items():
                results['total_issues'][issue_type] += len(issue_list)

        if scan_result['uses_icon_system']:
            results['files_using_icon_system'] += 1

    return results

def generate_report():
    """Generate comprehensive report"""
    report = {
        'summary': defaultdict(int),
        'categories': {},
        'recommendations': []
    }

    # Scan main pages
    main_page_files = [TRADING_UI_DIR / f for f in CATEGORIES['main_pages']]
    report['categories']['main_pages'] = scan_category('main_pages', main_page_files)

    # Scan mockups
    mockup_files = list((TRADING_UI_DIR / 'mockups').rglob('*.html'))
    report['categories']['mockups'] = scan_category('mockups', mockup_files)

    # Scan scripts (sampling - too many files)
    script_files = list((TRADING_UI_DIR / 'scripts').rglob('*.js'))
    # Filter out backups and vendor files
    script_files = [
        f for f in script_files 
        if 'backup' not in str(f) and 
           'vendor' not in str(f).lower() and
           not f.name.endswith('.backup') and
           not f.name.startswith('.')
    ][:200]  # Limit to first 200 to avoid timeout
    report['categories']['scripts'] = scan_category('scripts', script_files)

    # Scan system pages
    system_page_files = [TRADING_UI_DIR / f for f in CATEGORIES['system_pages']]
    report['categories']['system_pages'] = scan_category('system_pages', system_page_files)

    # Calculate summary
    for category_data in report['categories'].values():
        for issue_type, count in category_data['total_issues'].items():
            report['summary'][issue_type] += count
        report['summary']['total_files_with_issues'] += category_data['files_with_issues']
        report['summary']['total_files_using_icon_system'] += category_data['files_using_icon_system']

    return report

def print_report(report):
    """Print formatted report"""
    print("=" * 80)
    print("דוח סריקת איקונים - TikTrack")
    print("Icon Scanning Report")
    print("=" * 80)
    print()

    # Summary
    print("📊 סיכום כללי / Summary:")
    print("-" * 80)
    print(f"  קבצים עם בעיות: {report['summary']['total_files_with_issues']}")
    print(f"  קבצים המשתמשים ב-IconSystem: {report['summary']['total_files_using_icon_system']}")
    print()

    # Issue types summary
    print("🔍 סוגי בעיות שנמצאו / Issue Types Found:")
    print("-" * 80)
    for issue_type, count in sorted(report['summary'].items()):
        if issue_type not in ['total_files_with_issues', 'total_files_using_icon_system']:
            print(f"  {issue_type}: {count}")
    print()

    # Detailed by category
    for category_name, category_data in report['categories'].items():
        if not category_data['files']:
            continue

        print("=" * 80)
        print(f"📁 קטגוריה: {category_name}")
        print(f"   קבצים עם בעיות: {category_data['files_with_issues']}")
        print("=" * 80)
        print()

        for file_info in category_data['files'][:20]:  # Limit to first 20 per category
            print(f"  📄 {file_info['path']}")
            if file_info['uses_icon_system']:
                print("      ✅ משתמש ב-IconSystem")
            else:
                print("      ⚠️  לא משתמש ב-IconSystem")

            for issue_type, issues in file_info['issues'].items():
                print(f"      - {issue_type}: {len(issues)} occurrences")
                # Show first 3 examples
                for issue in issues[:3]:
                    print(f"        Line {issue['line']}: {issue['content'][:60]}...")
            print()

        if len(category_data['files']) > 20:
            print(f"  ... ועוד {len(category_data['files']) - 20} קבצים")
        print()

    # Recommendations
    print("=" * 80)
    print("💡 המלצות / Recommendations:")
    print("=" * 80)
    print()

    if report['summary'].get('bootstrap_icons', 0) > 0:
        print("  1. החלף Bootstrap Icons ב-Tabler Icons באמצעות IconSystem")
        print("     - השתמש ב-replace-remaining-icons.py script")
    
    if report['summary'].get('fontawesome', 0) > 0:
        print("  2. החלף FontAwesome ב-Tabler Icons")
        print("     - עדכן את notification-category-detector.js ואחרים")
    
    if report['summary'].get('emoji_icons', 0) > 0:
        print("  3. החלף Emojis באיקוני Tabler")
        print("     - בדוק unified-log-display.js ואחרים")
    
    if report['summary'].get('icon_cdn', 0) > 0:
        print("  4. הסר CDN links ל-Bootstrap Icons/FontAwesome")
        print("     - השתמש ב-remove-icon-cdns.py script")
    
    if report['summary'].get('old_icon_paths', 0) > 0:
        print("  5. עדכן נתיבי איקונים ישנים")
        print("     - ודא שכל הנתיבים משתמשים ב-entities/ או tabler/")
    
    print()

def main():
    """Main function"""
    print("🔍 מתחיל סריקה...")
    print()
    
    report = generate_report()
    print_report(report)

    # Save detailed report to file
    report_file = PROJECT_ROOT / 'reports' / 'icon-scan-report.md'
    report_file.parent.mkdir(exist_ok=True)
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("# דוח סריקת איקונים - TikTrack\n\n")
        f.write(f"**תאריך:** {Path(__file__).stat().st_mtime}\n\n")
        f.write("## סיכום\n\n")
        for key, value in report['summary'].items():
            f.write(f"- {key}: {value}\n")
        f.write("\n\n## פרטים\n\n")
        # Add detailed file list...
    
    print(f"📝 דוח מפורט נשמר ל: {report_file}")

if __name__ == '__main__':
    main()

