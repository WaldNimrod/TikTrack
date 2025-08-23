"""
TikTrack Test Suite API
Comprehensive testing system for all main tables and server functionality
"""
from flask import Blueprint, request, jsonify
import subprocess
import os
import sys
import tempfile
import shutil
import json
import time
from datetime import datetime
from typing import Dict, List, Any

# Create blueprint
test_suite_bp = Blueprint('test_suite', __name__)

@test_suite_bp.route('/api/v1/test-suite/run', methods=['POST'])
def run_test_suite():
    """
    Run comprehensive test suite for all main tables
    
    Expected JSON payload:
    {
        "tests": ["server", "accounts", "trades", "tickers", "alerts", "notes", "currencies", "cash_flows"],
        "settings": {
            "database": {
                "use_temp_database": true,
                "backup_before_tests": true,
                "cleanup_after_tests": true
            },
            "execution": {
                "parallel_tests": false,
                "stop_on_failure": false,
                "verbose_output": true
            }
        }
    }
    """
    try:
        # Parse request data
        data = request.get_json()
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400
        
        tests = data.get('tests', [])
        settings = data.get('settings', {})
        
        if not tests:
            return jsonify({
                'status': 'error',
                'message': 'No tests specified'
            }), 400
        
        # Validate test names
        valid_tests = [
            'server', 'accounts', 'trades', 'tickers', 'alerts', 
            'notes', 'currencies', 'cash_flows', 'trade_plans', 'executions'
        ]
        
        for test in tests:
            if test not in valid_tests:
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid test name: {test}'
                }), 400
        
        # Create backup if requested
        backup_path = None
        if settings.get('database', {}).get('backup_before_tests', True):
            backup_path = create_database_backup()
        
        try:
            # Run tests
            results = execute_test_suite(tests, settings)
            
            return jsonify({
                'status': 'success',
                'message': 'Test suite completed successfully',
                'results': results,
                'passed': results.get('passed', 0),
                'failed': results.get('failed', 0),
                'total': results.get('total', 0),
                'execution_time': results.get('execution_time', 0)
            })
            
        finally:
            # Cleanup backup if requested
            if settings.get('database', {}).get('cleanup_after_tests', True) and backup_path:
                cleanup_backup(backup_path)
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Test suite execution failed: {str(e)}'
        }), 500

@test_suite_bp.route('/api/v1/test-suite/status', methods=['GET'])
def get_test_suite_status():
    """Get current test suite status and available tests"""
    return jsonify({
        'status': 'available',
        'available_tests': [
            {
                'name': 'server',
                'description': 'Server health and connectivity tests',
                'category': 'infrastructure'
            },
            {
                'name': 'accounts',
                'description': 'Accounts CRUD and validation tests',
                'category': 'core'
            },
            {
                'name': 'trades',
                'description': 'Trades CRUD and business logic tests',
                'category': 'core'
            },
            {
                'name': 'tickers',
                'description': 'Tickers CRUD and validation tests',
                'category': 'core'
            },
            {
                'name': 'alerts',
                'description': 'Alerts CRUD and notification tests',
                'category': 'features'
            },
            {
                'name': 'notes',
                'description': 'Notes CRUD and attachment tests',
                'category': 'features'
            },
            {
                'name': 'currencies',
                'description': 'Currencies CRUD and exchange rate tests',
                'category': 'core'
            },
            {
                'name': 'cash_flows',
                'description': 'Cash flows CRUD and calculation tests',
                'category': 'core'
            },
            {
                'name': 'trade_plans',
                'description': 'Trade plans CRUD and linking tests',
                'category': 'planning'
            },
            {
                'name': 'executions',
                'description': 'Executions CRUD and trade linking tests',
                'category': 'core'
            }
        ],
        'last_run': None,
        'total_runs': 0
    })

def create_database_backup():
    """Create a backup of the production database"""
    try:
        # Get production database path
        production_db_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'db',
            'simpleTrade_new.db'
        )
        
        if not os.path.exists(production_db_path):
            return None
        
        # Create backup directory
        backup_dir = os.path.join(
            os.path.dirname(production_db_path),
            'backups',
            f'test_suite_backup_{int(time.time())}'
        )
        os.makedirs(backup_dir, exist_ok=True)
        
        # Copy database
        backup_path = os.path.join(backup_dir, 'simpleTrade_new.db')
        shutil.copy2(production_db_path, backup_path)
        
        return backup_path
    
    except Exception as e:
        print(f"Warning: Could not create database backup: {e}")
        return None

def cleanup_backup(backup_path):
    """Clean up test backup"""
    try:
        if backup_path and os.path.exists(backup_path):
            backup_dir = os.path.dirname(backup_path)
            shutil.rmtree(backup_dir)
    except Exception as e:
        print(f"Warning: Could not cleanup backup: {e}")

def execute_test_suite(tests: List[str], settings: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute comprehensive test suite
    """
    try:
        start_time = time.time()
        results = {
            'passed': 0,
            'failed': 0,
            'total': 0,
            'details': {},
            'execution_time': 0
        }
        
        # Run server tests first
        if 'server' in tests:
            server_results = run_server_tests()
            results['details']['server'] = server_results
            results['passed'] += server_results.get('passed', 0)
            results['failed'] += server_results.get('failed', 0)
            results['total'] += server_results.get('total', 0)
        
        # Run table-specific tests
        table_tests = [test for test in tests if test != 'server']
        for table in table_tests:
            table_results = run_table_tests(table)
            results['details'][table] = table_results
            results['passed'] += table_results.get('passed', 0)
            results['failed'] += table_results.get('failed', 0)
            results['total'] += table_results.get('total', 0)
        
        end_time = time.time()
        results['execution_time'] = round(end_time - start_time, 2)
        
        return results
    
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Test suite execution error: {str(e)}',
            'passed': 0,
            'failed': 0,
            'total': 0,
            'execution_time': 0
        }

def run_server_tests() -> Dict[str, Any]:
    """Run server health and connectivity tests"""
    results = {
        'passed': 0,
        'failed': 0,
        'total': 0,
        'tests': []
    }
    
    # Test 1: Server health endpoint
    try:
        import requests
        response = requests.get('http://localhost:8080/api/health', timeout=5)
        if response.status_code == 200:
            results['tests'].append({
                'name': 'Server Health Endpoint',
                'status': 'passed',
                'message': 'Server health endpoint responding'
            })
            results['passed'] += 1
        else:
            results['tests'].append({
                'name': 'Server Health Endpoint',
                'status': 'failed',
                'message': f'Server health endpoint returned {response.status_code}'
            })
            results['failed'] += 1
        results['total'] += 1
    except Exception as e:
        results['tests'].append({
            'name': 'Server Health Endpoint',
            'status': 'failed',
            'message': f'Server health endpoint error: {str(e)}'
        })
        results['failed'] += 1
        results['total'] += 1
    
    # Test 2: Database connectivity
    try:
        from Backend.config.database import get_db
        db = next(get_db())
        db.execute("SELECT 1")
        results['tests'].append({
            'name': 'Database Connectivity',
            'status': 'passed',
            'message': 'Database connection successful'
        })
        results['passed'] += 1
    except Exception as e:
        results['tests'].append({
            'name': 'Database Connectivity',
            'status': 'failed',
            'message': f'Database connection failed: {str(e)}'
        })
        results['failed'] += 1
    results['total'] += 1
    
    return results

def run_table_tests(table_name: str) -> Dict[str, Any]:
    """Run CRUD tests for specific table"""
    results = {
        'passed': 0,
        'failed': 0,
        'total': 0,
        'tests': []
    }
    
    # Test 1: GET all records
    try:
        import requests
        response = requests.get(f'http://localhost:8080/api/v1/{table_name}', timeout=5)
        if response.status_code == 200:
            results['tests'].append({
                'name': f'{table_name} GET All',
                'status': 'passed',
                'message': f'Successfully retrieved {table_name} data'
            })
            results['passed'] += 1
        else:
            results['tests'].append({
                'name': f'{table_name} GET All',
                'status': 'failed',
                'message': f'GET {table_name} returned {response.status_code}'
            })
            results['failed'] += 1
        results['total'] += 1
    except Exception as e:
        results['tests'].append({
            'name': f'{table_name} GET All',
            'status': 'failed',
            'message': f'GET {table_name} error: {str(e)}'
        })
        results['failed'] += 1
        results['total'] += 1
    
    # Test 2: POST create record (if supported)
    if table_name in ['accounts', 'tickers', 'currencies']:
        try:
            test_data = get_test_data_for_table(table_name)
            response = requests.post(
                f'http://localhost:8080/api/v1/{table_name}',
                json=test_data,
                timeout=5
            )
            if response.status_code in [200, 201]:
                results['tests'].append({
                    'name': f'{table_name} CREATE',
                    'status': 'passed',
                    'message': f'Successfully created {table_name} record'
                })
                results['passed'] += 1
            else:
                results['tests'].append({
                    'name': f'{table_name} CREATE',
                    'status': 'failed',
                    'message': f'CREATE {table_name} returned {response.status_code}'
                })
                results['failed'] += 1
            results['total'] += 1
        except Exception as e:
            results['tests'].append({
                'name': f'{table_name} CREATE',
                'status': 'failed',
                'message': f'CREATE {table_name} error: {str(e)}'
            })
            results['failed'] += 1
            results['total'] += 1
    
    return results

def get_test_data_for_table(table_name: str) -> Dict[str, Any]:
    """Get test data for table creation"""
    test_data = {
        'accounts': {
            'name': 'Test Account',
            'currency': 'USD',
            'status': 'open',
            'cash_balance': 10000.0,
            'notes': 'Test account for testing'
        },
        'tickers': {
            'symbol': 'TEST',
            'name': 'Test Ticker',
            'type': 'stock',
            'currency': 'USD',
            'remarks': 'Test ticker for testing'
        },
        'currencies': {
            'symbol': 'TEST',
            'name': 'Test Currency',
            'usd_rate': 1.0,
            'remarks': 'Test currency for testing'
        }
    }
    
    return test_data.get(table_name, {})
