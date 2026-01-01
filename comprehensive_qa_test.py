#!/usr/bin/env python3
"""
Comprehensive QA Test Suite - Team D Validation Report
======================================================

Runs all CRUD operations for all entities with corrected test data.
Validates endpoints and payloads as per CRUD_TESTING_INTEGRATION_MASTER_PLAN.md
"""

import requests
import json
import time
from typing import Dict, List, Tuple
from datetime import datetime

class ComprehensiveQATester:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.token = None
        self.results = {
            'run_timestamp': datetime.now().isoformat(),
            'environment': 'local/8080',
            'total_pages': 0,
            'pages_tested': 0,
            'pages_passed': 0,
            'pages_failed': 0,
            'total_tests': 0,
            'tests_passed': 0,
            'tests_failed': 0,
            'tests_skipped': 0,
            'details': {},
            'failures': [],
            'skips': []
        }

        # Corrected test data based on validation rules
        self.test_data = {
            'trades': {
                'ticker_id': 1,
                'trading_account_id': 1,
                'side': 'Long',
                'investment_type': 'swing',
                'planned_quantity': 100,
                'entry_price': 100.0,
                'notes': f'QA Test Trade {int(time.time())}'
            },
            'trade_plans': {
                'ticker_id': 1,
                'trading_account_id': 1,
                'side': 'Long',
                'investment_type': 'swing',
                'status': 'open',
                'planned_amount': 10000,
                'entry_price': 100.0,
                'notes': f'QA Test Trade Plan {int(time.time())}'
            },
            'alerts': {
                'related_type_id': 1,  # Trade type
                'related_id': None,  # Will be set after creating a trade
                'condition_attribute': 'price',
                'condition_operator': 'gt',  # Valid operator
                'condition_number': 100,
                'status': 'new'
            },
            'tickers': {
                'symbol': f'QA{int(time.time()) % 1000000:06d}',  # Ensure <= 10 chars
                'name': f'QA Test Ticker {int(time.time())}',
                'exchange': 'NASDAQ'
            },
            'trading_accounts': {
                'name': f'QA Account {int(time.time())}',
                'account_type': 'stock'
            },
            'executions': {
                'trade_id': None,  # Will be set after creating a trade
                'quantity': 50,
                'price': 105.0
            },
            'cash_flows': {
                'amount': 1000.0,
                'cash_flow_type': 'deposit',
                'notes': f'QA Test Cash Flow {int(time.time())}'
            },
            'notes': {
                'title': f'QA Note {int(time.time())}',
                'content': f'QA Test Content {int(time.time())}',
                'related_type_id': 1,  # Trade
                'related_id': None  # Will be set after creating a trade
            },
            'watch_lists': {
                'name': f'QA Watch List {int(time.time())}',
                'color_hex': '#ff0000'
            },
            'user_profile': {
                'first_name': f'QA{int(time.time())}',
                'last_name': 'Test'
            },
            'user_management': {
                'username': f'qatest{int(time.time())}',
                'email': f'qa{int(time.time())}@test.com',
                'first_name': f'QA{int(time.time())}',
                'last_name': 'User'
            },
            'trading_journal': {
                'notes': f'QA Test Journal Entry {int(time.time())}'
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

    def login(self) -> bool:
        """Login and get token"""
        try:
            response = requests.post(f"{self.base_url}/api/auth/login", json={
                'username': 'admin',
                'password': 'admin123'
            }, timeout=30)
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

    def test_entity_crud(self, entity_type: str, test_data: Dict) -> Dict:
        """Test full CRUD operations for an entity"""
        results = {
            'entity': entity_type,
            'create': {'success': False, 'entity_id': None, 'error': None},
            'read': {'success': False, 'error': None},
            'update': {'success': False, 'error': None},
            'delete': {'success': False, 'error': None}
        }

        headers = self.get_headers()

        try:
            # CREATE
            print(f"  📝 Testing CREATE {entity_type}...")
            create_response = requests.post(
                f"{self.base_url}/api/{entity_type}/",
                json=test_data,
                headers=headers,
                timeout=30
            )

            if create_response.status_code in [200, 201]:
                create_data = create_response.json()
                if create_data.get('status') == 'success' and create_data.get('data', {}).get('id'):
                    results['create']['success'] = True
                    results['create']['entity_id'] = create_data['data']['id']
                    print(f"    ✅ CREATE: {entity_type} ID {results['create']['entity_id']}")
                else:
                    results['create']['error'] = f"Invalid response structure: {json.dumps(create_data, indent=2)[:500]}"
                    self.results['failures'].append({
                        'entity': entity_type,
                        'operation': 'CREATE',
                        'endpoint': f"/api/{entity_type}/",
                        'payload': test_data,
                        'response': create_data,
                        'error': results['create']['error']
                    })
            else:
                results['create']['error'] = f"HTTP {create_response.status_code}: {create_response.text[:500]}"
                self.results['failures'].append({
                    'entity': entity_type,
                    'operation': 'CREATE',
                    'endpoint': f"/api/{entity_type}/",
                    'payload': test_data,
                    'status_code': create_response.status_code,
                    'response': create_response.text[:500],
                    'error': results['create']['error']
                })

            entity_id = results['create']['entity_id']
            if not entity_id:
                return results

            # READ
            print(f"  📖 Testing READ {entity_type} ID {entity_id}...")
            read_response = requests.get(
                f"{self.base_url}/api/{entity_type}/{entity_id}",
                headers=headers,
                timeout=30
            )

            if read_response.status_code == 200:
                read_data = read_response.json()
                if read_data.get('status') == 'success':
                    results['read']['success'] = True
                    print(f"    ✅ READ: {entity_type} ID {entity_id}")
                else:
                    results['read']['error'] = f"Invalid response: {json.dumps(read_data, indent=2)[:500]}"
                    self.results['failures'].append({
                        'entity': entity_type,
                        'operation': 'READ',
                        'endpoint': f"/api/{entity_type}/{entity_id}",
                        'response': read_data,
                        'error': results['read']['error']
                    })
            else:
                results['read']['error'] = f"HTTP {read_response.status_code}: {read_response.text[:500]}"
                self.results['failures'].append({
                    'entity': entity_type,
                    'operation': 'READ',
                    'endpoint': f"/api/{entity_type}/{entity_id}",
                    'status_code': read_response.status_code,
                    'response': read_response.text[:500],
                    'error': results['read']['error']
                })

            # UPDATE
            print(f"  ✏️ Testing UPDATE {entity_type} ID {entity_id}...")
            update_data = test_data.copy()
            if entity_type == 'trades':
                update_data['notes'] = f'Updated by QA {int(time.time())}'
            elif entity_type == 'trade_plans':
                update_data['notes'] = f'Updated by QA {int(time.time())}'
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
                update_data['content'] = f'Updated by QA {int(time.time())}'
            elif entity_type == 'watch_lists':
                update_data['name'] = update_data['name'] + ' (Updated)'
            elif entity_type == 'user_profile':
                update_data['first_name'] = f'Updated{int(time.time())}'
            elif entity_type == 'user_management':
                update_data['username'] = update_data['username'] + '_qa'
            elif entity_type == 'trading_journal':
                update_data['notes'] = f'Updated by QA {int(time.time())}'
            elif entity_type == 'tag_management':
                update_data['name'] = update_data['name'] + ' (Updated)'
            elif entity_type == 'data_import':
                update_data['name'] = update_data['name'] + ' (Updated)'
            elif entity_type == 'preferences':
                update_data['theme'] = 'dark'

            update_response = requests.put(
                f"{self.base_url}/api/{entity_type}/{entity_id}",
                json=update_data,
                headers=headers,
                timeout=30
            )

            if update_response.status_code == 200:
                update_resp_data = update_response.json()
                if update_resp_data.get('status') == 'success':
                    results['update']['success'] = True
                    print(f"    ✅ UPDATE: {entity_type} ID {entity_id}")
                else:
                    results['update']['error'] = f"Invalid response: {json.dumps(update_resp_data, indent=2)[:500]}"
                    self.results['failures'].append({
                        'entity': entity_type,
                        'operation': 'UPDATE',
                        'endpoint': f"/api/{entity_type}/{entity_id}",
                        'payload': update_data,
                        'response': update_resp_data,
                        'error': results['update']['error']
                    })
            else:
                results['update']['error'] = f"HTTP {update_response.status_code}: {update_response.text[:500]}"
                self.results['failures'].append({
                    'entity': entity_type,
                    'operation': 'UPDATE',
                    'endpoint': f"/api/{entity_type}/{entity_id}",
                    'payload': update_data,
                    'status_code': update_response.status_code,
                    'response': update_response.text[:500],
                    'error': results['update']['error']
                })

            # DELETE
            print(f"  🗑️ Testing DELETE {entity_type} ID {entity_id}...")
            delete_response = requests.delete(
                f"{self.base_url}/api/{entity_type}/{entity_id}",
                headers=headers,
                timeout=30
            )

            if delete_response.status_code == 200:
                delete_data = delete_response.json()
                if delete_data.get('status') == 'success':
                    results['delete']['success'] = True
                    print(f"    ✅ DELETE: {entity_type} ID {entity_id}")
                else:
                    results['delete']['error'] = f"Invalid response: {json.dumps(delete_data, indent=2)[:500]}"
                    self.results['failures'].append({
                        'entity': entity_type,
                        'operation': 'DELETE',
                        'endpoint': f"/api/{entity_type}/{entity_id}",
                        'response': delete_data,
                        'error': results['delete']['error']
                    })
            else:
                results['delete']['error'] = f"HTTP {delete_response.status_code}: {delete_response.text[:500]}"
                self.results['failures'].append({
                    'entity': entity_type,
                    'operation': 'DELETE',
                    'endpoint': f"/api/{entity_type}/{entity_id}",
                    'status_code': delete_response.status_code,
                    'response': delete_response.text[:500],
                    'error': results['delete']['error']
                })

        except Exception as e:
            error_msg = f"Exception during {entity_type} testing: {str(e)}"
            print(f"    ❌ Exception: {error_msg}")
            self.results['failures'].append({
                'entity': entity_type,
                'operation': 'EXCEPTION',
                'error': error_msg
            })

        return results

    def prepare_dependent_data(self):
        """Create entities needed for dependent tests"""
        print("🔗 Preparing dependent test data...")

        headers = self.get_headers()

        # Create a trade for executions and notes that require related_id
        try:
            trade_response = requests.post(
                f"{self.base_url}/api/trades/",
                json=self.test_data['trades'],
                headers=headers,
                timeout=30
            )

            if trade_response.status_code in [200, 201]:
                trade_data = trade_response.json()
                if trade_data.get('status') == 'success':
                    trade_id = trade_data['data']['id']
                    self.test_data['executions']['trade_id'] = trade_id
                    self.test_data['notes']['related_id'] = trade_id
                    print(f"    ✅ Created trade ID {trade_id} for dependent tests")
                else:
                    print(f"    ⚠️ Could not create trade for dependent tests: {trade_data}")
                    self.results['skips'].append({
                        'entity': 'executions',
                        'reason': 'Cannot create dependent trade'
                    })
                    self.results['skips'].append({
                        'entity': 'notes',
                        'reason': 'Cannot create dependent trade'
                    })
            else:
                print(f"    ⚠️ Trade creation failed: HTTP {trade_response.status_code}")
                self.results['skips'].append({
                    'entity': 'executions',
                    'reason': 'Cannot create dependent trade'
                })
                self.results['skips'].append({
                    'entity': 'notes',
                    'reason': 'Cannot create dependent trade'
                })
        except Exception as e:
            print(f"    ⚠️ Exception preparing dependent data: {e}")
            self.results['skips'].append({
                'entity': 'executions',
                'reason': 'Cannot create dependent trade'
            })
            self.results['skips'].append({
                'entity': 'notes',
                'reason': 'Cannot create dependent trade'
            })

    def run_comprehensive_qa(self):
        """Run QA tests on all CRUD-enabled entities"""

        print("🚀 Starting Comprehensive QA Test Suite")
        print("=" * 60)
        print(f"Timestamp: {self.results['run_timestamp']}")
        print(f"Environment: {self.results['environment']}")
        print("=" * 60)

        if not self.login():
            print("❌ Cannot proceed without authentication")
            return

        # Prepare dependent data
        self.prepare_dependent_data()

        # CRUD-enabled entities
        crud_entities = [
            'trades', 'trade_plans', 'alerts', 'tickers', 'trading_accounts',
            'executions', 'cash_flows', 'notes', 'watch_lists', 'user_profile',
            'user_management', 'trading_journal', 'tag_management', 'data_import', 'preferences'
        ]

        self.results['total_pages'] = len(crud_entities)

        for entity_type in crud_entities:
            print(f"\n🔍 Testing {entity_type}...")
            self.results['pages_tested'] += 1

            test_data = self.test_data.get(entity_type, {})
            entity_result = self.test_entity_crud(entity_type, test_data)

            # Count tests
            operations = ['create', 'read', 'update', 'delete']
            passed_ops = sum(1 for op in operations if entity_result[op]['success'])
            failed_ops = len(operations) - passed_ops

            self.results['total_tests'] += 4
            self.results['tests_passed'] += passed_ops
            self.results['tests_failed'] += failed_ops

            if all(entity_result[op]['success'] for op in operations):
                self.results['pages_passed'] += 1
                print(f"✅ {entity_type}: ALL CRUD operations passed")
            else:
                self.results['pages_failed'] += 1
                print(f"❌ {entity_type}: {passed_ops}/4 operations passed")
                if any(not entity_result[op]['success'] for op in operations):
                    failed_operations = [op for op in operations if not entity_result[op]['success']]
                    print(f"   Failed operations: {failed_operations}")

            self.results['details'][entity_type] = entity_result

        self.print_comprehensive_report()

    def print_comprehensive_report(self):
        """Print comprehensive QA report"""

        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE QA TEST SUITE RESULTS")
        print("=" * 80)

        print(f"🕒 Run Timestamp: {self.results['run_timestamp']}")
        print(f"🌐 Environment: {self.results['environment']}")
        print()

        print(f"📄 Pages Tested: {self.results['pages_tested']}/{self.results['total_pages']}")
        print(f"✅ Pages Passed: {self.results['pages_passed']}")
        print(f"❌ Pages Failed: {self.results['pages_failed']}")
        print(f"⏭️  Pages Skipped: {len(self.results['skips'])}")

        print(f"\n🧪 Tests Executed: {self.results['total_tests']}")
        print(f"✅ Tests Passed: {self.results['tests_passed']}")
        print(f"❌ Tests Failed: {self.results['tests_failed']}")
        print(f"⏭️  Tests Skipped: {len(self.results['skips']) * 4}")  # Assuming 4 tests per skipped page

        pass_rate = (self.results['tests_passed'] / self.results['total_tests'] * 100) if self.results['total_tests'] > 0 else 0
        print(".1f")

        # Print passing entities
        if self.results['pages_passed'] > 0:
            print(f"\n✅ PASSING ENTITIES ({self.results['pages_passed']}):")
            for entity, result in self.results['details'].items():
                if all(result[op]['success'] for op in ['create', 'read', 'update', 'delete']):
                    print(f"  • {entity}")

        # Print failing entities with details
        if self.results['pages_failed'] > 0:
            print(f"\n❌ FAILING ENTITIES ({self.results['pages_failed']}):")
            for entity, result in self.results['details'].items():
                if not all(result[op]['success'] for op in ['create', 'read', 'update', 'delete']):
                    failed_ops = [op for op in ['create', 'read', 'update', 'delete'] if not result[op]['success']]
                    print(f"  • {entity}: Failed {failed_ops}")

        # Print skips
        if self.results['skips']:
            print(f"\n⏭️  SKIPPED ENTITIES ({len(self.results['skips'])}):")
            for skip in self.results['skips']:
                print(f"  • {skip['entity']}: {skip['reason']}")

        # Print detailed failures
        if self.results['failures']:
            print(f"\n🔴 DETAILED FAILURE REPORT:")
            for failure in self.results['failures']:
                print(f"\n  {failure['entity']} - {failure['operation']}:")
                if 'endpoint' in failure:
                    print(f"    Endpoint: {failure['endpoint']}")
                if 'payload' in failure:
                    print(f"    Payload: {json.dumps(failure['payload'], indent=6)[:200]}...")
                if 'status_code' in failure:
                    print(f"    Status: {failure['status_code']}")
                if 'response' in failure:
                    print(f"    Response: {failure['response'][:200]}...")
                if 'error' in failure:
                    print(f"    Error: {failure['error']}")

        print(f"\n🎯 RECOMMENDATIONS:")
        if pass_rate >= 90:
            print("  ✅ Excellent! System is near production-ready")
        elif pass_rate >= 70:
            print("  ⚠️ Good progress, but critical issues remain")
        elif pass_rate >= 50:
            print("  ❌ Significant issues need immediate attention")
        else:
            print("  🚨 Critical failures require urgent fixes")

if __name__ == '__main__':
    tester = ComprehensiveQATester()
    tester.run_comprehensive_qa()
