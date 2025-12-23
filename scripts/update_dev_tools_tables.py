#!/usr/bin/env python3
"""
Script to update dev_tools.html tables with new columns:
1. Hebrew name column (after filename)
2. CRUD column (before actions)

Uses data from crud_testing_dashboard.js for Hebrew names and CRUD status
"""

import re
import json

# Hebrew names mapping (from crud_testing_dashboard.js)
HEBREW_NAMES = {
    'index': 'דשבורד ראשי',
    'trades': 'טריידים',
    'trade_plans': 'תכניות מסחר',
    'alerts': 'התראות',
    'tickers': 'טיקרים',
    'ticker_dashboard': 'דשבורד טיקר',
    'trading_accounts': 'חשבונות מסחר',
    'executions': 'ביצועי עסקאות',
    'cash_flows': 'תזרימי מזומן',
    'notes': 'הערות',
    'research': 'מחקר',
    'ai_analysis': 'ניתוח AI',
    'watch_lists': 'רשימות צפייה',
    'user_profile': 'פרופיל משתמש',
    'portfolio_state': 'מצב תיק',
    'trade_history': 'היסטוריית טריידים',
    'trading_journal': 'יומן מסחר',
    'tag_management': 'תגיות',
    'data_import': 'ייבוא נתונים',
    'preferences': 'העדפות',
    'db_display': 'תצוגת בסיס נתונים',
    'db_extradata': 'נתונים נוספים',
    'constraints': 'אילוצי מערכת',
    'background-tasks': 'משימות רקע',
    'background_tasks': 'משימות רקע',
    'server-monitor': 'ניטור שרת',
    'server_monitor': 'ניטור שרת',
    'system-management': 'ניהול מערכת',
    'system_management': 'ניהול מערכת',
    'notifications-center': 'מרכז התראות',
    'notifications_center': 'מרכז התראות',
    'css-management': 'ניהול CSS',
    'css_management': 'ניהול CSS',
    'dynamic-colors-display': 'תצוגת צבעים',
    'dynamic_colors_display': 'תצוגת צבעים',
    'designs': 'גלרית עיצובים',
    'cache-management': 'ניהול מטמון',
    'cache_management': 'ניהול מטמון',
    'code-quality-dashboard': 'דשבורד איכות קוד',
    'code_quality_dashboard': 'דשבורד איכות קוד',
    'external-data-dashboard': 'נתונים חיצוניים',
    'external_data_dashboard': 'נתונים חיצוניים',
    'chart-management': 'ניהול גרפים',
    'chart_management': 'ניהול גרפים',
    'crud-testing-dashboard': 'בדיקות CRUD',
    'crud_testing_dashboard': 'בדיקות CRUD',
    'tradingview-test-page': 'בדיקת TradingView',
    'tradingview-widgets-showcase': 'תצוגת ווידג\'טים',
    'init-system-management': 'ניהול מערכת אתחול',
    'conditions-test': 'בדיקת תנאים',
    'linter-realtime-monitor': 'מעקב Linter',
    'login': 'כניסה',
    'register': 'הרשמה',
    'reset-password': 'איפוס סיסמה',
    'forgot-password': 'שכחתי סיסמה',
}

# CRUD status mapping (from crud_testing_dashboard.js)
CRUD_STATUS = {
    'index': False,
    'trades': True,
    'trade_plans': True,
    'alerts': True,
    'tickers': True,
    'ticker_dashboard': False,
    'trading_accounts': True,
    'executions': True,
    'cash_flows': True,
    'notes': True,
    'research': False,
    'ai_analysis': False,
    'watch_lists': True,
    'user_profile': True,
    'portfolio_state': False,
    'trade_history': False,
    'trading_journal': True,
    'tag_management': True,
    'data_import': True,
    'preferences': True,
    'db_display': False,
    'db_extradata': False,
    'constraints': False,
    'background-tasks': False,
    'background_tasks': False,
    'server-monitor': False,
    'server_monitor': False,
    'system-management': False,
    'system_management': False,
    'notifications-center': False,
    'notifications_center': False,
    'css-management': False,
    'css_management': False,
    'dynamic-colors-display': False,
    'dynamic_colors_display': False,
    'designs': False,
    'cache-management': False,
    'cache_management': False,
    'code-quality-dashboard': False,
    'code_quality_dashboard': False,
    'external-data-dashboard': False,
    'external_data_dashboard': False,
    'chart-management': False,
    'chart_management': False,
    'crud-testing-dashboard': False,
    'crud_testing_dashboard': False,
    'tradingview-test-page': False,
    'tradingview-widgets-showcase': False,
    'init-system-management': False,
    'conditions-test': False,
    'linter-realtime-monitor': False,
    'login': False,
    'register': False,
    'reset-password': False,
    'forgot-password': False,
}

def get_page_key_from_filename(filename):
    """Extract page key from filename"""
    # Remove .html extension
    key = filename.replace('.html', '').replace('<strong>', '').replace('</strong>', '').strip()
    # Handle both formats: index.html and index
    if key.endswith('.html'):
        key = key[:-5]
    return key

def get_hebrew_name(filename):
    """Get Hebrew name for a page"""
    key = get_page_key_from_filename(filename)
    return HEBREW_NAMES.get(key, filename.replace('.html', '').replace('<strong>', '').replace('</strong>', '').strip())

def get_crud_status(filename):
    """Get CRUD status for a page"""
    key = get_page_key_from_filename(filename)
    return CRUD_STATUS.get(key, False)

def update_table_row(row_html):
    """Update a single table row to include new columns"""
    # Extract filename from first <td>
    filename_match = re.search(r'<td><strong>([^<]+)</strong></td>', row_html)
    if not filename_match:
        # Try without <strong>
        filename_match = re.search(r'<td>([^<]+)</td>', row_html)
    
    if not filename_match:
        return row_html  # Can't parse, return as-is
    
    filename = filename_match.group(1)
    hebrew_name = get_hebrew_name(filename)
    has_crud = get_crud_status(filename)
    
    # Current structure: filename, description, category, subcategory, auth_status, actions
    # New structure: filename, hebrew_name, description, category, subcategory, auth_status, has_crud, actions
    
    # Find all <td> elements
    td_pattern = r'<td[^>]*>.*?</td>'
    tds = re.findall(td_pattern, row_html, re.DOTALL)
    
    if len(tds) < 5:
        return row_html  # Not enough columns, skip
    
    # Extract existing columns
    filename_td = tds[0]
    description_td = tds[1]  # This is actually Hebrew name currently
    category_td = tds[2]
    subcategory_td = tds[3]
    auth_status_td = tds[4]
    actions_td = tds[5] if len(tds) > 5 else ''
    
    # Create new Hebrew name column
    hebrew_name_td = f'<td>{hebrew_name}</td>'
    
    # Create CRUD column
    crud_badge = '<span class="badge bg-success">✅ כן</span>' if has_crud else '<span class="badge bg-secondary">❌ לא</span>'
    crud_td = f'<td>{crud_badge}</td>'
    
    # Reconstruct row: filename, hebrew_name, description, category, subcategory, auth_status, has_crud, actions
    new_row = f'{filename_td}{hebrew_name_td}{description_td}{category_td}{subcategory_td}{auth_status_td}{crud_td}{actions_td}'
    
    return f'<tr>{new_row}</tr>'

def update_table_header(header_html):
    """Update table header to include new columns"""
    # Current headers structure
    # Need to add: "שם עברית" after "שם קובץ", "CRUD" before "פעולות"
    
    # Find the header row
    header_match = re.search(r'<thead[^>]*>(.*?)</thead>', header_html, re.DOTALL)
    if not header_match:
        return header_html
    
    header_content = header_match.group(1)
    
    # Find all <th> elements
    th_pattern = r'<th[^>]*>.*?</th>'
    ths = re.findall(th_pattern, header_content, re.DOTALL)
    
    if len(ths) < 5:
        return header_html  # Not enough columns
    
    # Extract existing headers
    filename_th = ths[0]
    description_th = ths[1]
    category_th = ths[2]
    subcategory_th = ths[3]
    auth_status_th = ths[4]
    actions_th = ths[5] if len(ths) > 5 else '<th scope="col" class="col-actions actions-cell"><button class="btn btn-link sortable-header">פעולות</button></th>'
    
    # Create new Hebrew name header
    hebrew_name_th = '<th scope="col" class="col-description"><button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="שם עברית" data-classes="btn-link sortable-header" data-column="hebrew_name"></button></th>'
    
    # Create CRUD header
    crud_th = '<th scope="col" class="col-type"><button data-button-type="SORT" data-variant="full" data-icon="↕️" data-text="CRUD" data-classes="btn-link sortable-header" data-column="has_crud"></button></th>'
    
    # Reconstruct header: filename, hebrew_name, description, category, subcategory, auth_status, has_crud, actions
    new_header_row = f'<tr>{filename_th}{hebrew_name_th}{description_th}{category_th}{subcategory_th}{auth_status_th}{crud_th}{actions_th}</tr>'
    
    return header_html.replace(header_match.group(1), new_header_row)

def main():
    html_file = 'trading-ui/dev_tools.html'
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update all table headers
    table_pattern = r'(<table[^>]*data-table-type="dev-tools-[^"]+"[^>]*>.*?</table>)'
    tables = re.findall(table_pattern, content, re.DOTALL)
    
    for table_html in tables:
        # Update header
        updated_table = update_table_header(table_html)
        
        # Update all rows in tbody
        tbody_match = re.search(r'(<tbody>)(.*?)(</tbody>)', updated_table, re.DOTALL)
        if tbody_match:
            tbody_start = tbody_match.group(1)
            tbody_content = tbody_match.group(2)
            tbody_end = tbody_match.group(3)
            
            # Find all rows
            row_pattern = r'<tr>.*?</tr>'
            rows = re.findall(row_pattern, tbody_content, re.DOTALL)
            
            updated_rows = []
            for row in rows:
                updated_row = update_table_row(row)
                updated_rows.append(updated_row)
            
            updated_tbody = tbody_start + '\n'.join(updated_rows) + '\n' + tbody_end
            updated_table = updated_table.replace(tbody_match.group(0), updated_tbody)
        
        # Replace original table with updated table
        content = content.replace(table_html, updated_table)
    
    # Write back
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {len(tables)} tables in {html_file}")

if __name__ == '__main__':
    main()

