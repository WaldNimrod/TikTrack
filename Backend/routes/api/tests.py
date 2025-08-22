"""
Test execution API endpoints for TikTrack
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

# Create blueprint
tests_bp = Blueprint('tests', __name__)

@tests_bp.route('/api/v1/tests/run', methods=['POST'])
def run_tests():
    """
    Run selected tests with safety measures
    
    Expected JSON payload:
    {
        "tests": ["unit_tests.test_models.test_ticker_creation", ...],
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
        
        # Validate test names for safety
        valid_test_prefixes = [
            'unit_tests.',
            'integration_tests.',
            'e2e_tests.',
            'performance_tests.',
            'load_tests.',
            'security_tests.',
            'crud_tests.'
        ]
        
        for test in tests:
            if not any(test.startswith(prefix) for prefix in valid_test_prefixes):
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid test name: {test}'
                }), 400
        
        # Create backup if requested
        backup_path = None
        if settings.get('database', {}).get('backup_before_tests', True):
            backup_path = create_database_backup()
        
        try:
            # Run tests with safety measures
            results = execute_tests_safely(tests, settings)
            
            return jsonify({
                'status': 'success',
                'message': 'Tests completed successfully',
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
            'message': f'Test execution failed: {str(e)}'
        }), 500

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
            f'test_backup_{int(time.time())}'
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

def execute_tests_safely(tests, settings):
    """
    Execute tests with comprehensive safety measures
    """
    try:
        # Set up test environment
        test_env = setup_test_environment(settings)
        
        # Build pytest command
        cmd = build_pytest_command(tests, settings)
        
        # Execute tests
        start_time = time.time()
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=test_env['test_dir'],
            env=test_env['env'],
            timeout=300  # 5 minute timeout
        )
        end_time = time.time()
        
        # Parse results
        results = parse_test_results(result, end_time - start_time)
        
        return results
    
    except subprocess.TimeoutExpired:
        return {
            'status': 'timeout',
            'message': 'Tests timed out after 5 minutes',
            'passed': 0,
            'failed': 0,
            'total': 0,
            'execution_time': 300
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Test execution error: {str(e)}',
            'passed': 0,
            'failed': 0,
            'total': 0,
            'execution_time': 0
        }

def setup_test_environment(settings):
    """Set up safe test environment"""
    # Create temporary test directory
    test_dir = tempfile.mkdtemp(prefix='tiktrack_tests_')
    
    # Get the testing suite directory
    testing_suite_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'testing_suite'
    )
    
    # Set up environment variables
    env = os.environ.copy()
    
    # Force test database usage
    if settings.get('database', {}).get('use_temp_database', True):
        # Create temporary test database
        temp_db_path = os.path.join(test_dir, 'test_database.db')
        env['TEST_DATABASE_PATH'] = temp_db_path
        env['TESTING'] = 'true'
    
    # Set test-specific environment variables
    env['PYTHONPATH'] = f"{testing_suite_dir}:{env.get('PYTHONPATH', '')}"
    env['TEST_SAFE_MODE'] = 'true'
    
    return {
        'test_dir': testing_suite_dir,
        'env': env,
        'temp_dir': test_dir
    }

def build_pytest_command(tests, settings):
    """Build pytest command with safety options"""
    cmd = [
        sys.executable, '-m', 'pytest'
    ]
    
    # Add test paths
    for test in tests:
        # Convert test names to file paths
        test_path = convert_test_name_to_path(test)
        if test_path:
            cmd.append(test_path)
    
    # Add safety options
    cmd.extend([
        '--tb=short',  # Short traceback
        '--strict-markers',  # Strict marker validation
        '--disable-warnings',  # Disable warnings
        '--no-header',  # No header
        '--no-summary',  # No summary
    ])
    
    # Add execution settings
    if settings.get('execution', {}).get('stop_on_failure', False):
        cmd.append('-x')  # Stop on first failure
    
    if settings.get('execution', {}).get('verbose_output', True):
        cmd.append('-v')  # Verbose output
    
    if settings.get('execution', {}).get('parallel_tests', False):
        cmd.extend(['-n', 'auto'])  # Parallel execution
    
    # Add safety markers
    cmd.extend([
        '-m', 'not slow',  # Skip slow tests by default
        '--maxfail=10',  # Stop after 10 failures
    ])
    
    return cmd

def convert_test_name_to_path(test_name):
    """Convert test name to file path"""
    try:
        # Parse test name (e.g., "unit_tests.test_models.test_ticker_creation")
        parts = test_name.split('.')
        if len(parts) >= 3:
            category = parts[0]  # unit_tests
            file_name = parts[1]  # test_models
            test_function = parts[2]  # test_ticker_creation
            
            # Convert to file path
            file_path = f"{category}/{file_name}.py::{test_function}"
            return file_path
        
        return None
    except Exception:
        return None

def parse_test_results(result, execution_time):
    """Parse pytest results"""
    try:
        # Parse stdout for test results
        output = result.stdout
        
        # Count passed/failed tests
        passed = 0
        failed = 0
        
        # Look for pytest result patterns
        lines = output.split('\n')
        for line in lines:
            if 'passed' in line and 'failed' in line:
                # Extract numbers from line like "5 passed, 2 failed"
                import re
                numbers = re.findall(r'(\d+)', line)
                if len(numbers) >= 2:
                    passed = int(numbers[0])
                    failed = int(numbers[1])
                break
        
        total = passed + failed
        
        # Determine status
        if result.returncode == 0:
            status = 'success'
        elif result.returncode == 1:
            status = 'partial_success' if passed > 0 else 'failed'
        else:
            status = 'error'
        
        return {
            'status': status,
            'passed': passed,
            'failed': failed,
            'total': total,
            'execution_time': execution_time,
            'return_code': result.returncode,
            'stdout': output,
            'stderr': result.stderr
        }
    
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Failed to parse results: {str(e)}',
            'passed': 0,
            'failed': 0,
            'total': 0,
            'execution_time': execution_time,
            'return_code': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr
        }

@tests_bp.route('/api/v1/tests/status', methods=['GET'])
def get_test_status():
    """Get current test execution status"""
    return jsonify({
        'status': 'ready',
        'message': 'Test system is ready',
        'timestamp': datetime.now().isoformat()
    })

@tests_bp.route('/api/v1/tests/list', methods=['GET'])
def list_available_tests():
    """List all available tests"""
    try:
        # Get testing suite directory
        testing_suite_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            'testing_suite'
        )
        
        tests = []
        
        # Scan for test files
        for root, dirs, files in os.walk(testing_suite_dir):
            for file in files:
                if file.startswith('test_') and file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, testing_suite_dir)
                    
                    # Convert to test category
                    category = os.path.dirname(relative_path).replace('/', '_')
                    if category == '.':
                        category = 'root'
                    
                    tests.append({
                        'category': category,
                        'file': file,
                        'path': relative_path,
                        'full_path': file_path
                    })
        
        return jsonify({
            'status': 'success',
            'tests': tests,
            'count': len(tests)
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Failed to list tests: {str(e)}'
        }), 500

@tests_bp.route('/api/v1/tests/crud', methods=['POST'])
def run_crud_tests():
    """
    Run CRUD tests for selected entities
    
    Expected JSON payload:
    {
        "entities": ["accounts", "tickers", "trades", "trade_plans", "notes", "alerts", "executions", "cash_flows"],
        "operations": ["create", "read", "update", "delete", "close", "cancel"],
        "settings": {
            "parallel": false,
            "stop_on_failure": false,
            "verbose": true,
            "cleanup": true
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
        
        entities = data.get('entities', [])
        operations = data.get('operations', [])
        settings = data.get('settings', {})
        
        if not entities:
            return jsonify({
                'status': 'error',
                'message': 'No entities specified'
            }), 400
        
        # Validate entities
        valid_entities = [
            'accounts', 'tickers', 'trades', 'trade_plans', 
            'notes', 'alerts', 'executions', 'cash_flows'
        ]
        
        for entity in entities:
            if entity not in valid_entities:
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid entity: {entity}'
                }), 400
        
        # Validate operations
        valid_operations = ['create', 'read', 'update', 'delete', 'close', 'cancel']
        
        for operation in operations:
            if operation not in valid_operations:
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid operation: {operation}'
                }), 400
        
        # Run CRUD tests
        results = execute_crud_tests(entities, operations, settings)
        
        return jsonify({
            'status': 'success',
            'message': 'CRUD tests completed',
            'results': results,
            'passed': results.get('passed', 0),
            'failed': results.get('failed', 0),
            'total': results.get('total', 0),
            'execution_time': results.get('execution_time', 0)
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'CRUD test execution failed: {str(e)}'
        }), 500

def execute_crud_tests(entities, operations, settings):
    """Execute CRUD tests for specified entities and operations"""
    try:
        import requests
        import time
        
        base_url = 'http://localhost:8080/api/v1'
        results = []
        start_time = time.time()
        
        for entity in entities:
            for operation in operations:
                # Skip invalid combinations
                if operation in ['close', 'cancel'] and entity not in ['trades', 'trade_plans']:
                    continue
                
                test_result = {
                    'entity': entity,
                    'operation': operation,
                    'status': 'running',
                    'message': '',
                    'start_time': time.time(),
                    'end_time': None
                }
                
                try:
                    # Execute CRUD operation
                    operation_result = perform_crud_operation(base_url, entity, operation, settings)
                    
                    test_result['status'] = 'passed' if operation_result['success'] else 'failed'
                    test_result['message'] = operation_result['message']
                    test_result['end_time'] = time.time()
                    
                except Exception as e:
                    test_result['status'] = 'failed'
                    test_result['message'] = str(e)
                    test_result['end_time'] = time.time()
                
                results.append(test_result)
                
                # Stop on failure if requested
                if settings.get('stop_on_failure', False) and test_result['status'] == 'failed':
                    break
            
            # Stop on failure if requested
            if settings.get('stop_on_failure', False) and any(r['status'] == 'failed' for r in results):
                break
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Calculate statistics
        passed = len([r for r in results if r['status'] == 'passed'])
        failed = len([r for r in results if r['status'] == 'failed'])
        total = len(results)
        
        return {
            'status': 'success' if failed == 0 else 'partial_success' if passed > 0 else 'failed',
            'passed': passed,
            'failed': failed,
            'total': total,
            'execution_time': execution_time,
            'results': results
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e),
            'passed': 0,
            'failed': 0,
            'total': 0,
            'execution_time': 0,
            'results': []
        }

def perform_crud_operation(base_url, entity, operation, settings):
    """Perform a single CRUD operation"""
    try:
        import requests
        
        # Get test data
        test_data = get_crud_test_data(entity, operation)
        
        # Build request
        if operation == 'create':
            url = f"{base_url}/{entity}/"
            method = 'POST'
            data = test_data
        elif operation == 'read':
            url = f"{base_url}/{entity}/"
            method = 'GET'
            data = None
        elif operation == 'update':
            url = f"{base_url}/{entity}/1"
            method = 'PUT'
            data = test_data
        elif operation == 'delete':
            url = f"{base_url}/{entity}/1"
            method = 'DELETE'
            data = None
        elif operation == 'close':
            url = f"{base_url}/{entity}/1/close"
            method = 'POST'
            data = {}
        elif operation == 'cancel':
            url = f"{base_url}/{entity}/1/cancel"
            method = 'POST'
            data = {'cancel_reason': 'Test cancellation'}
        else:
            raise ValueError(f"Unknown operation: {operation}")
        
        # Make request
        response = requests.request(
            method=method,
            url=url,
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        # Parse response
        if response.status_code < 400:
            return {
                'success': True,
                'message': f'{operation.upper()} {entity} successful',
                'status_code': response.status_code
            }
        else:
            try:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', f'HTTP {response.status_code}')
            except:
                error_message = f'HTTP {response.status_code}'
            
            return {
                'success': False,
                'message': error_message,
                'status_code': response.status_code
            }
            
    except Exception as e:
        return {
            'success': False,
            'message': str(e),
            'status_code': None
        }

def get_crud_test_data(entity, operation):
    """Get test data for CRUD operations"""
    test_data = {
        'accounts': {
            'create': {'name': 'Test Account', 'currency': 'USD', 'cash_balance': 10000.0},
            'update': {'name': 'Updated Test Account'}
        },
        'tickers': {
            'create': {'symbol': 'TEST', 'name': 'Test Ticker', 'type': 'stock', 'currency': 'USD'},
            'update': {'name': 'Updated Test Ticker'}
        },
        'trades': {
            'create': {'ticker_id': 1, 'account_id': 1, 'type': 'swing', 'side': 'Long'},
            'update': {'notes': 'Updated test trade'}
        },
        'trade_plans': {
            'create': {'ticker_id': 1, 'type': 'swing', 'side': 'Long', 'reasons': 'Test plan'},
            'update': {'reasons': 'Updated test plan'}
        },
        'notes': {
            'create': {'content': 'Test note', 'related_type': 'account', 'related_id': 1},
            'update': {'content': 'Updated test note'}
        },
        'alerts': {
            'create': {'type': 'price_alert', 'condition': 'Price > $100', 'message': 'Test alert', 'related_type': 'ticker', 'related_id': 1},
            'update': {'message': 'Updated test alert'}
        },
        'executions': {
            'create': {'trade_id': 1, 'action': 'buy', 'quantity': 100, 'price': 50.0},
            'update': {'quantity': 150}
        },
        'cash_flows': {
            'create': {'account_id': 1, 'type': 'deposit', 'amount': 1000.0, 'currency_id': 1},
            'update': {'amount': 1500.0}
        }
    }
    
    return test_data.get(entity, {}).get(operation, {})

# Register blueprint
def init_app(app):
    app.register_blueprint(tests_bp)
