#!/usr/bin/env python3
"""
QA Test Runner - Automated CRUD Dashboard Testing
=================================================

Runs comprehensive QA tests on all CRUD-enabled pages in the system.
"""

import requests
import json
import time
from typing import Dict, List

class QATestRunner:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.token = None
        self.results = {
            'total_pages': 0,
            'pages_tested': 0,
            'pages_passed': 0,
            'pages_failed': 0,
            'total_tests': 0,
            'tests_passed': 0,
            'tests_failed': 0,
            'details': {}
        }

    def login(self) -> bool:
        """Login and get token"""
        try:
            response = requests.post(f"{self.base_url}/api/auth/login", json={
                'username': 'admin',
                'password': 'admin123'
            })
            if response.status_code == 200:
                data = response.json()
                self.token = data['data']['access_token']
                print("✅ Logged in successfully")
                return True
            else:
                print(f"❌ Login failed: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Login error: {e}")
            return False

    def get_headers(self):
        """Get headers with auth token"""
        return {'Authorization': f'Bearer {self.token}'}

    def test_crud_operations(self, entity_type: str, test_data: Dict) -> Dict:
        """Test full CRUD operations for an entity"""
        results = {
            'entity': entity_type,
            'create': False,
            'read': False,
            'update': False,
            'delete': False,
            'entity_id': None,
            'errors': []
        }

        headers = self.get_headers()

        try:
            # CREATE
            create_response = requests.post(f"{self.base_url}/api/{entity_type}/", json=test_data, headers=headers)
            if create_response.status_code in [200, 201]:
                create_data = create_response.json()
                if create_data.get('status') == 'success' and create_data.get('data', {}).get('id'):
                    results['create'] = True
                    results['entity_id'] = create_data['data']['id']
                    print(f"  ✅ CREATE: {entity_type} ID {results['entity_id']}")
                else:
                    results['errors'].append(f"CREATE: Invalid response structure - {json.dumps(create_data, indent=2)[:200]}")
            else:
                results['errors'].append(f"CREATE: HTTP {create_response.status_code} - {create_response.text[:200]}")

            if not results['entity_id']:
                return results

            # READ
            read_response = requests.get(f"{self.base_url}/api/{entity_type}/{results['entity_id']}", headers=headers)
            if read_response.status_code == 200:
                read_data = read_response.json()
                if read_data.get('status') == 'success':
                    results['read'] = True
                    print(f"  ✅ READ: {entity_type} ID {results['entity_id']}")
                else:
                    results['errors'].append(f"READ: Invalid response - {json.dumps(read_data, indent=2)[:200]}")
            else:
                results['errors'].append(f"READ: HTTP {read_response.status_code} - {read_response.text[:200]}")

            # UPDATE
            update_data = test_data.copy()
            if entity_type == 'trades':
                update_data['notes'] = 'Updated by QA Test'
            elif entity_type == 'trade_plans':
                update_data['notes'] = 'Updated by QA Test'
            elif entity_type == 'alerts':
                update_data['condition_number'] = 200
            elif entity_type == 'tickers':
                update_data['name'] = update_data['name'] + ' (Updated)'
            elif entity_type == 'trading_accounts':
                update_data['name'] = update_data['name'] + ' (Updated)'
            elif entity_type == 'executions':
                update_data['price'] = 200
            elif entity_type == 'cash_flows':
                update_data['amount'] = 2000
            elif entity_type == 'notes':
                update_data['content'] = 'Updated by QA Test'
            elif entity_type == 'watch_lists':
                update_data['name'] = update_data['name'] + ' (Updated)'
            elif entity_type == 'user_profile':
                update_data['first_name'] = 'QA'
            elif entity_type == 'user_management':
                update_data['username'] = update_data['username'] + '_qa'
            elif entity_type == 'trading_journal':
                update_data['notes'] = 'Updated by QA Test'
            elif entity_type == 'tag_management':
                update_data['name'] = update_data['name'] + ' (Updated)'
            elif entity_type == 'data_import':
                update_data['name'] = update_data['name'] + ' (Updated)'
            elif entity_type == 'preferences':
                update_data['theme'] = 'dark'

            update_response = requests.put(f"{self.base_url}/api/{entity_type}/{results['entity_id']}", json=update_data, headers=headers)
            if update_response.status_code == 200:
                update_resp_data = update_response.json()
                if update_resp_data.get('status') == 'success':
                    results['update'] = True
                    print(f"  ✅ UPDATE: {entity_type} ID {results['entity_id']}")
                else:
                    results['errors'].append(f"UPDATE: Invalid response - {json.dumps(update_resp_data, indent=2)[:200]}")
            else:
                results['errors'].append(f"UPDATE: HTTP {update_response.status_code} - {update_response.text[:200]}")

            # DELETE
            delete_response = requests.delete(f"{self.base_url}/api/{entity_type}/{results['entity_id']}", headers=headers)
            if delete_response.status_code == 200:
                delete_data = delete_response.json()
                if delete_data.get('status') == 'success':
                    results['delete'] = True
                    print(f"  ✅ DELETE: {entity_type} ID {results['entity_id']}")
                else:
                    results['errors'].append(f"DELETE: Invalid response - {json.dumps(delete_data, indent=2)[:200]}")
            else:
                results['errors'].append(f"DELETE: HTTP {delete_response.status_code} - {delete_response.text[:200]}")

        except Exception as e:
            results['errors'].append(f"Exception: {str(e)}")

        return results

    def run_full_qa_suite(self):
        """Run QA tests on all CRUD-enabled entities"""

        print("🚀 Starting Full QA Test Suite")
        print("=" * 50)

        if not self.login():
            print("❌ Cannot proceed without authentication")
            return

        # CRUD-enabled entities with test data
        crud_entities = {
            'trades': {
                'ticker_id': 1,
                'trading_account_id': 1,
                'side': 'Long',
                'investment_type': 'swing',
                'planned_quantity': 100,
                'entry_price': 100.0,
                'notes': 'QA Test Trade'
            },
            'trade_plans': {
                'ticker_id': 1,
                'trading_account_id': 1,
                'side': 'Long',
                'investment_type': 'swing',
                'status': 'open',
                'planned_amount': 10000,
                'entry_price': 100.0,
                'notes': 'QA Test Trade Plan'
            },
            'alerts': {
                'related_type_id': 4,
                'related_id': 1,
                'condition_attribute': 'price',
                'condition_operator': 'above',
                'condition_number': 100,
                'status': 'new'
            },
            'tickers': {
                'symbol': f'QA{int(time.time())}',
                'name': 'QA Test Ticker',
                'exchange': 'NASDAQ'
            },
            'trading_accounts': {
                'name': f'QA Account {int(time.time())}',
                'account_type': 'stock'
            },
            'executions': {
                'trade_id': 1,  # This might fail if no trades exist
                'quantity': 100,
                'price': 100.0
            },
            'cash_flows': {
                'amount': 1000,
                'cash_flow_type': 'deposit'
            },
            'notes': {
                'title': f'QA Note {int(time.time())}',
                'content': 'QA Test Content'
            },
            'watch_lists': {
                'name': f'QA Watch List {int(time.time())}',
                'color_hex': '#ff0000'
            },
            'user_profile': {
                'first_name': 'QA',
                'last_name': 'Test'
            },
            'user_management': {
                'username': f'qatest{int(time.time())}',
                'email': f'qa{int(time.time())}@test.com',
                'first_name': 'QA',
                'last_name': 'User'
            },
            'trading_journal': {
                'notes': 'QA Test Journal Entry'
            },
            'tag_management': {
                'name': f'QA Tag {int(time.time())}',
                'color_hex': '#00ff00'
            },
            'data_import': {
                'name': f'QA Import {int(time.time())}',
                'import_type': 'csv'
            },
            'preferences': {
                'theme': 'light',
                'language': 'he'
            }
        }

        self.results['total_pages'] = len(crud_entities)

        for entity_type, test_data in crud_entities.items():
            print(f"\n🔍 Testing {entity_type}...")
            self.results['pages_tested'] += 1

            entity_result = self.test_crud_operations(entity_type, test_data)

            # Count tests
            operations = ['create', 'read', 'update', 'delete']
            passed_ops = sum(1 for op in operations if entity_result[op])
            failed_ops = len(operations) - passed_ops

            self.results['total_tests'] += 4
            self.results['tests_passed'] += passed_ops
            self.results['tests_failed'] += failed_ops

            if all(entity_result[op] for op in operations):
                self.results['pages_passed'] += 1
                print(f"✅ {entity_type}: ALL CRUD operations passed")
            else:
                self.results['pages_failed'] += 1
                print(f"❌ {entity_type}: {passed_ops}/4 operations passed")
                if entity_result['errors']:
                    for error in entity_result['errors']:
                        print(f"   🔴 {error}")

            self.results['details'][entity_type] = entity_result

        self.print_summary()

    def print_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 QA TEST SUITE RESULTS")
        print("=" * 60)

        print(f"📄 Pages Tested: {self.results['pages_tested']}/{self.results['total_pages']}")
        print(f"✅ Pages Passed: {self.results['pages_passed']}")
        print(f"❌ Pages Failed: {self.results['pages_failed']}")

        print(f"\n🧪 Tests Executed: {self.results['total_tests']}")
        print(f"✅ Tests Passed: {self.results['tests_passed']}")
        print(f"❌ Tests Failed: {self.results['tests_failed']}")

        pass_rate = (self.results['tests_passed'] / self.results['total_tests'] * 100) if self.results['total_tests'] > 0 else 0
        print(".1f")

        if self.results['pages_failed'] > 0:
            print(f"\n❌ FAILED ENTITIES:")
            for entity, result in self.results['details'].items():
                if not all(result[op] for op in ['create', 'read', 'update', 'delete']):
                    failed_ops = [op for op in ['create', 'read', 'update', 'delete'] if not result[op]]
                    print(f"  • {entity}: Failed {failed_ops}")

        print(f"\n🎯 NEXT STEPS:")
        if pass_rate >= 95:
            print("  ✅ Excellent! System is production-ready")
        elif pass_rate >= 80:
            print("  ⚠️ Good, but fix remaining issues before production")
        else:
            print("  ❌ Critical issues need immediate attention")

if __name__ == '__main__':
    runner = QATestRunner()
    runner.run_full_qa_suite()
