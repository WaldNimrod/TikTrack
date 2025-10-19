#!/usr/bin/env python3
import json
import time
import urllib.request
import urllib.error

BASE = 'http://localhost:8080'
HEADERS_JSON = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
}

# Entities to test (API endpoints with CRUD). Keep payloads minimal but valid
ENTITIES = [
    {
        'name': 'trades',
        'url': '/api/trades/',
        'create_payload': {
            'trading_account_id': 1,
            'ticker_id': 1,
            'status': 'open',
            'investment_type': 'swing',
            'side': 'Long',
            'notes': 'CRUD Test Record - Safe to delete'
        },
        'update_patch': {'notes': 'UPDATED by API test'}
    },
    {
        'name': 'tickers',
        'url': '/api/tickers/',
        'create_payload': {
            'symbol': f'TST{int(time.time()) % 100000}',
            'name': 'CRUD Test Ticker',
            'type': 'stock',
            'currency_id': 1,
            'remarks': 'CRUD Test Record'
        },
        'update_patch': {'remarks': 'UPDATED by API test'}
    },
    {
        'name': 'trading_accounts',
        'url': '/api/trading-accounts/',
        'create_payload': {
            'name': f'Test Account {int(time.time())}',
            'currency_id': 1,
            'status': 'open',
            'cash_balance': 10000.00,
            'notes': 'CRUD Test Record'
        },
        'update_patch': {'notes': 'UPDATED by API test'}
    },
    {
        'name': 'notes',
        'url': '/api/notes/',
        'create_payload': {
            'content': 'CRUD Test Note - Safe to delete',
            'related_type_id': 1,
            'related_id': 1
        },
        'update_patch': {'content': 'UPDATED by API test'}
    },
    {
        'name': 'alerts',
        'url': '/api/alerts/',
        'create_payload': {
            'message': 'CRUD Test Alert - Safe to delete',
            'status': 'open',
            'is_triggered': 'false',
            'related_type_id': 4,  # ticker relation
            'related_id': 1,
            'condition_attribute': 'price',
            'condition_operator': 'more_than',
            'condition_number': '160.00'
        },
        'update_patch': {'message': 'UPDATED by API test'}
    },
    {
        'name': 'executions',
        'url': '/api/executions/',
        'create_payload': {
            'trade_id': 1,
            'action': 'buy',
            'date': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'quantity': 10,
            'price': 150.50,
            'fee': 1.50,
            'source': 'manual',
            'notes': 'CRUD Test Execution - Safe to delete'
        },
        'update_patch': {'notes': 'UPDATED by API test'}
    },
    {
        'name': 'cash_flows',
        'url': '/api/cash_flows/',
        'create_payload': {
            'trading_account_id': 1,
            'type': 'deposit',
            'amount': 100.00,
            'date': time.strftime('%Y-%m-%d'),
            'description': 'CRUD Test Cash Flow - Safe to delete',
            'currency_id': 1,
            'usd_rate': 1.000000,
            'source': 'manual'
        },
        'update_patch': {'description': 'UPDATED by API test'}
    },
    {
        'name': 'trade_plans',
        'url': '/api/trade_plans/',
        'create_payload': {
            'trading_account_id': 1,
            'ticker_id': 1,
            'investment_type': 'swing',
            'side': 'Long',
            'status': 'open',
            'planned_amount': 1000,
            'entry_conditions': 'CRUD Test Entry Conditions',
            'target_price': 155.00,
            'reasons': 'CRUD Test Trade Plan - Safe to delete'
        },
        'update_patch': {'reasons': 'UPDATED by API test'}
    },
]

REPORT = {
    'summary': {
        'tested': 0,
        'passed': 0,
        'failed': 0,
        'start': time.strftime('%Y-%m-%d %H:%M:%S'),
    },
    'entities': []
}


def http_json(method: str, url: str, data=None):
    req = urllib.request.Request(url, method=method)
    for k, v in HEADERS_JSON.items():
        req.add_header(k, v)
    if data is not None:
        payload = json.dumps(data).encode('utf-8')
        req.data = payload
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode('utf-8')
            try:
                return resp.status, json.loads(body)
            except json.JSONDecodeError:
                return resp.status, {'raw': body}
    except urllib.error.HTTPError as e:
        try:
            body = e.read().decode('utf-8')
        except Exception:
            body = ''
        return e.code, {'error': body}
    except urllib.error.URLError as e:
        return 0, {'error': str(e)}


def run_tests():
    for ent in ENTITIES:
        name = ent['name']
        url = BASE + ent['url']
        result = {
            'name': name,
            'url': ent['url'],
            'get': None,
            'create': None,
            'read': None,
            'update': None,
            'delete': None,
            'passed': False,
            'issues': []
        }
        REPORT['summary']['tested'] += 1

        # GET list
        status, body = http_json('GET', url)
        result['get'] = {'status': status}
        if status != 200:
            result['issues'].append(f'GET list failed: HTTP {status}')

        created_id = None

        # CREATE
        status, body = http_json('POST', url, ent['create_payload'])
        result['create'] = {'status': status}
        if status in (200, 201):
            created_id = body.get('id') or body.get('data', {}).get('id')
            if not created_id:
                result['issues'].append('CREATE ok but missing id')
        else:
            result['issues'].append(f'CREATE failed: HTTP {status} {body.get("error", "")}')

        # READ
        if created_id:
            status, body = http_json('GET', url + str(created_id))
            result['read'] = {'status': status}
            if status != 200:
                result['issues'].append(f'READ failed: HTTP {status}')

        # UPDATE
        if created_id:
            patch = dict(ent['create_payload'])
            patch.update(ent['update_patch'])
            status, body = http_json('PUT', url + str(created_id), patch)
            result['update'] = {'status': status}
            if status not in (200, 204):
                result['issues'].append(f'UPDATE failed: HTTP {status}')

        # DELETE (cleanup)
        if created_id:
            status, body = http_json('DELETE', url + str(created_id))
            result['delete'] = {'status': status}
            if status not in (200, 204):
                result['issues'].append(f'DELETE failed: HTTP {status}')

        # Final pass/fail
        ok = (
            result['get'] and result['get']['status'] == 200 and
            result['create'] and result['create']['status'] in (200, 201)
        )
        result['passed'] = ok and len(result['issues']) == 0
        if result['passed']:
            REPORT['summary']['passed'] += 1
        else:
            REPORT['summary']['failed'] += 1

        REPORT['entities'].append(result)

    REPORT['summary']['end'] = time.strftime('%Y-%m-%d %H:%M:%S')


if __name__ == '__main__':
    run_tests()
    out_path = './_Tmp/api_crud_test_report.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(REPORT, f, ensure_ascii=False, indent=2)
    print(json.dumps(REPORT, ensure_ascii=False, indent=2))
