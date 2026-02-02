#!/usr/bin/env python3
"""
Scanner for Trading Accounts Page Tables
Scans the live legacy server at port 8090 to extract all table structures
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

BASE_URL = 'http://127.0.0.1:8090'
LOGIN_URL = f'{BASE_URL}/login'
TRADING_ACCOUNTS_URL = f'{BASE_URL}/trading_accounts'

def scan_trading_accounts_tables():
    print('🔍 Starting Trading Accounts Tables Scanner...\n')
    
    session = requests.Session()
    
    try:
        # Step 1: Login
        print('📝 Step 1: Logging in...')
        login_data = {
            'username': 'admin',
            'password': 'admin123'
        }
        login_response = session.post(LOGIN_URL, data=login_data)
        
        if login_response.status_code != 200:
            raise Exception(f'Login failed: {login_response.status_code}')
        
        print('✅ Login successful\n')
        
        # Step 2: Fetch Trading Accounts Page
        print('📄 Step 2: Fetching Trading Accounts page...')
        page_response = session.get(TRADING_ACCOUNTS_URL)
        
        if page_response.status_code != 200:
            raise Exception(f'Failed to fetch page: {page_response.status_code}')
        
        html_content = page_response.text
        print('✅ Page fetched\n')
        
        # Step 3: Parse HTML
        print('🔎 Step 3: Parsing HTML...')
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find all tables
        tables = soup.find_all('table')
        print(f'📊 Found {len(tables)} table(s) in HTML\n')
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'url': TRADING_ACCOUNTS_URL,
            'tablesFound': len(tables),
            'tables': [],
            'containers': []
        }
        
        # Extract table structures
        for table_index, table in enumerate(tables):
            print(f'\n📋 Table {table_index + 1}:')
            
            table_info = {
                'index': table_index + 1,
                'id': table.get('id'),
                'className': ' '.join(table.get('class', [])),
                'dataTableType': table.get('data-table-type'),
                'columns': [],
                'sampleRows': []
            }
            
            # Find container
            container = table.find_parent(['div', 'section'], class_=lambda x: x and ('content-section' in x or 'section' in x.lower()))
            if container:
                container_title = container.find(['h2', 'h3', 'div'], class_=lambda x: x and ('title' in str(x).lower() or 'header' in str(x).lower()))
                if container_title:
                    table_info['container'] = {
                        'id': container.get('id'),
                        'className': ' '.join(container.get('class', [])),
                        'title': container_title.get_text(strip=True)
                    }
            
            # Extract headers
            thead = table.find('thead')
            if thead:
                headers = thead.find_all('th')
                for col_index, th in enumerate(headers):
                    header_text = th.get_text(strip=True)
                    is_sortable = 'sortable' in ' '.join(th.get('class', [])).lower() or th.get('data-sort') is not None
                    sort_key = th.get('data-sort-key') or th.get('data-sort')
                    sort_type = th.get('data-sort-type')
                    
                    # Extract column classes
                    col_classes = [cls for cls in th.get('class', []) if cls.startswith('col-')]
                    
                    table_info['columns'].append({
                        'index': col_index,
                        'header': header_text,
                        'sortable': is_sortable,
                        'sortKey': sort_key,
                        'sortType': sort_type,
                        'columnClasses': col_classes
                    })
            
            # Extract sample rows (first 5 rows)
            tbody = table.find('tbody')
            if tbody:
                rows = tbody.find_all('tr', limit=5)
                for row_index, row in enumerate(rows):
                    cells = row.find_all('td')
                    row_data = {
                        'rowIndex': row_index,
                        'cells': []
                    }
                    
                    for cell_index, cell in enumerate(cells):
                        cell_text = cell.get_text(strip=True)
                        cell_classes = cell.get('class', [])
                        col_classes = [cls for cls in cell_classes if cls.startswith('col-')]
                        
                        row_data['cells'].append({
                            'index': cell_index,
                            'text': cell_text,
                            'classes': cell_classes,
                            'columnClasses': col_classes
                        })
                    
                    table_info['sampleRows'].append(row_data)
            
            report['tables'].append(table_info)
            
            print(f'  ID: {table_info["id"] or "N/A"}')
            print(f'  Container: {table_info.get("container", {}).get("title", "N/A")}')
            print(f'  Columns: {len(table_info["columns"])}')
            for col in table_info['columns']:
                sortable_str = ' [SORTABLE]' if col['sortable'] else ''
                col_classes_str = f' ({", ".join(col["columnClasses"])})' if col['columnClasses'] else ''
                print(f'    {col["index"]}: "{col["header"]}"{sortable_str}{col_classes_str}')
            print(f'  Sample Rows: {len(table_info["sampleRows"])}')
        
        # Find containers/sections
        containers = soup.find_all(['div', 'section'], class_=lambda x: x and ('content-section' in str(x) or 'section' in str(x).lower()))
        for container_index, container in enumerate(containers):
            title_elem = container.find(['h2', 'h3', 'div'], class_=lambda x: x and ('title' in str(x).lower() or 'header' in str(x).lower()))
            title = title_elem.get_text(strip=True) if title_elem else None
            tables_in_container = container.find_all('table')
            
            if title or len(tables_in_container) > 0:
                report['containers'].append({
                    'index': container_index + 1,
                    'id': container.get('id'),
                    'className': ' '.join(container.get('class', [])),
                    'title': title,
                    'tableCount': len(tables_in_container)
                })
        
        print(f'\n\n📦 Found {len(report["containers"])} containers/sections')
        for container in report['containers']:
            print(f'  {container["index"]}: {container["title"] or container["id"] or "Untitled"} ({container["tableCount"]} tables)')
        
        # Save report
        output_file = 'trading-accounts-tables-scan.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print(f'\n✅ Results saved to: {output_file}')
        print('\n📊 FULL REPORT:')
        print('=' * 80)
        print(json.dumps(report, ensure_ascii=False, indent=2))
        print('=' * 80)
        
        return report
        
    except Exception as error:
        print(f'❌ Error: {error}')
        import traceback
        traceback.print_exc()
        return None

if __name__ == '__main__':
    scan_trading_accounts_tables()
