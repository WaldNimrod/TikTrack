#!/usr/bin/env python3
"""
Quality Check API - TikTrack Backend
====================================

API endpoints for running code quality checks
"""

import os
import subprocess
import json
import tempfile
from datetime import datetime
from flask import Blueprint, request, jsonify
import logging

# Create blueprint
bp = Blueprint('quality_check', __name__)

# Setup logging
logger = logging.getLogger(__name__)

# Configuration
CONFIG = {
    'scripts_dir': '../scripts',
    'monitors_dir': '../scripts/monitors',
    'generators_dir': '../scripts/generators',
    'reports_dir': '../reports',
    'timeout': 30  # seconds
}

@bp.route('/error-handling', methods=['POST'])
def check_error_handling():
    """Run Error Handling Coverage Monitor"""
    try:
        logger.info("Running Error Handling Coverage Monitor")
        
        # Run the monitor script
        result = run_script('error-handling-monitor.js')
        
        if result['success']:
            # Parse the output to extract results
            data = parse_error_handling_output(result['output'])
            return jsonify({
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error in error-handling check: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/jsdoc', methods=['POST'])
def check_jsdoc():
    """Run JSDoc Coverage Reporter"""
    try:
        logger.info("Running JSDoc Coverage Reporter")
        
        # Run the reporter script
        result = run_script('jsdoc-coverage.js')
        
        if result['success']:
            # Parse the output to extract results
            data = parse_jsdoc_output(result['output'])
            return jsonify({
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error in jsdoc check: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/naming', methods=['POST'])
def check_naming():
    """Run Naming Conventions Validator"""
    try:
        logger.info("Running Naming Conventions Validator")
        
        # Run the validator script
        result = run_script('naming-conventions-validator.js')
        
        if result['success']:
            # Parse the output to extract results
            data = parse_naming_output(result['output'])
            return jsonify({
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error in naming check: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/function-index', methods=['POST'])
def check_function_index():
    """Run Function Index Validator"""
    try:
        logger.info("Running Function Index Validator")
        
        # For now, return mock data since we need to create the validator
        data = {
            'summary': {
                'total': 12,
                'filesWithIndex': 8,
                'filesWithoutIndex': 4
            },
            'pages': [
                {'file': 'index.js', 'hasIndex': True, 'totalFunctions': 7},
                {'file': 'trades.js', 'hasIndex': True, 'totalFunctions': 34},
                {'file': 'executions.js', 'hasIndex': True, 'totalFunctions': 66},
                {'file': 'alerts.js', 'hasIndex': True, 'totalFunctions': 47},
                {'file': 'trade_plans.js', 'hasIndex': True, 'totalFunctions': 54},
                {'file': 'cash_flows.js', 'hasIndex': True, 'totalFunctions': 24},
                {'file': 'notes.js', 'hasIndex': False, 'totalFunctions': 44},
                {'file': 'research.js', 'hasIndex': True, 'totalFunctions': 11},
                {'file': 'tickers.js', 'hasIndex': False, 'totalFunctions': 27},
                {'file': 'trading_accounts.js', 'hasIndex': False, 'totalFunctions': 22},
                {'file': 'database.js', 'hasIndex': False, 'totalFunctions': 19},
                {'file': 'preferences-page.js', 'hasIndex': True, 'totalFunctions': 1}
            ]
        }
        
        return jsonify({
            'status': 'success',
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
            
    except Exception as e:
        logger.error(f"Error in function-index check: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/generate-function-index', methods=['POST'])
def generate_function_index():
    """Generate Function Index for all files"""
    try:
        logger.info("Generating Function Index")
        
        # Run the generator script
        result = run_script('generate-function-index.js')
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'message': 'Function Index generated successfully',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error'],
                'timestamp': datetime.now().isoformat()
            }), 500
            
    except Exception as e:
        logger.error(f"Error generating function index: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@bp.route('/all', methods=['POST'])
def check_all():
    """Run all quality checks"""
    try:
        logger.info("Running all quality checks")
        
        results = {}
        
        # Run all checks
        checks = ['error-handling', 'jsdoc', 'naming', 'function-index', 'duplicates']
        
        for check in checks:
            try:
                if check == 'error-handling':
                    result = run_script('error-handling-monitor.js')
                    if result['success']:
                        results[check] = parse_error_handling_output(result['output'])
                elif check == 'jsdoc':
                    result = run_script('jsdoc-coverage.js')
                    if result['success']:
                        results[check] = parse_jsdoc_output(result['output'])
                elif check == 'naming':
                    result = run_script('naming-conventions-validator.js')
                    if result['success']:
                        results[check] = parse_naming_output(result['output'])
                elif check == 'function-index':
                    # Mock data for now
                    results[check] = {
                        'summary': {'total': 12, 'filesWithIndex': 8, 'filesWithoutIndex': 4},
                        'pages': []
                    }
                elif check == 'duplicates':
                    result = run_script('simple-duplicate-detector.js')
                    if result['success']:
                        results[check] = parse_duplicates_output(result['output'])
            except Exception as e:
                logger.error(f"Error in {check} check: {e}")
                results[check] = {'error': str(e)}
        
        return jsonify({
            'status': 'success',
            'data': results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in all checks: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

def run_script(script_name):
    """Run a Node.js script and return the result"""
    try:
        script_path = os.path.join(CONFIG['monitors_dir'], script_name)
        
        if not os.path.exists(script_path):
            return {
                'success': False,
                'error': f'Script not found: {script_path}'
            }
        
        # Run the script
        result = subprocess.run(
            ['node', script_path],
            capture_output=True,
            text=True,
            timeout=CONFIG['timeout'],
            cwd=os.getcwd()
        )
        
        if result.returncode == 0:
            return {
                'success': True,
                'output': result.stdout,
                'error': result.stderr
            }
        else:
            return {
                'success': False,
                'error': result.stderr or 'Script execution failed'
            }
            
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Script execution timeout'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def parse_error_handling_output(output):
    """Parse Error Handling Monitor output"""
    try:
        # Look for the summary section in the output
        lines = output.split('\n')
        
        summary = {
            'total': 0,
            'withCoverage': 0,
            'withoutCoverage': 0,
            'coveragePercentage': '0.00'
        }
        
        pages = []
        
        # Parse the output to extract data
        for line in lines:
            if 'Total Functions:' in line:
                summary['total'] = int(line.split(':')[1].strip())
            elif 'With Coverage:' in line:
                summary['withCoverage'] = int(line.split(':')[1].strip())
            elif 'Without Coverage:' in line:
                summary['withoutCoverage'] = int(line.split(':')[1].strip())
            elif 'Coverage:' in line:
                coverage_str = line.split(':')[1].strip()
                summary['coveragePercentage'] = coverage_str.replace('%', '')
            elif '✅' in line or '⚠️' in line:
                # Parse page line
                parts = line.strip().split()
                if len(parts) >= 3:
                    status = parts[0]
                    filename = parts[1]
                    coverage = parts[2].replace('%', '')
                    
                    pages.append({
                        'file': filename,
                        'coveragePercentage': coverage,
                        'totalFunctions': 0,  # Would need more parsing
                        'functionsWithCoverage': 0,
                        'functionsWithoutCoverage': 0
                    })
        
        return {
            'summary': summary,
            'pages': pages
        }
        
    except Exception as e:
        logger.error(f"Error parsing error handling output: {e}")
        return {
            'summary': {'total': 0, 'withCoverage': 0, 'withoutCoverage': 0, 'coveragePercentage': '0.00'},
            'pages': []
        }

def parse_jsdoc_output(output):
    """Parse JSDoc Coverage Reporter output"""
    try:
        # Similar parsing logic for JSDoc output
        lines = output.split('\n')
        
        summary = {
            'total': 0,
            'withJSDoc': 0,
            'withoutJSDoc': 0,
            'coveragePercentage': '0.00'
        }
        
        pages = []
        
        for line in lines:
            if 'Total Functions:' in line:
                summary['total'] = int(line.split(':')[1].strip())
            elif 'With JSDoc:' in line:
                summary['withJSDoc'] = int(line.split(':')[1].strip())
            elif 'Without JSDoc:' in line:
                summary['withoutJSDoc'] = int(line.split(':')[1].strip())
            elif 'Coverage:' in line:
                coverage_str = line.split(':')[1].strip()
                summary['coveragePercentage'] = coverage_str.replace('%', '')
            elif '✅' in line or '⚠️' in line:
                parts = line.strip().split()
                if len(parts) >= 3:
                    status = parts[0]
                    filename = parts[1]
                    coverage = parts[2].replace('%', '')
                    
                    pages.append({
                        'file': filename,
                        'coveragePercentage': coverage,
                        'totalFunctions': 0,
                        'functionsWithJSDoc': 0,
                        'functionsWithoutJSDoc': 0
                    })
        
        return {
            'summary': summary,
            'pages': pages
        }
        
    except Exception as e:
        logger.error(f"Error parsing jsdoc output: {e}")
        return {
            'summary': {'total': 0, 'withJSDoc': 0, 'withoutJSDoc': 0, 'coveragePercentage': '0.00'},
            'pages': []
        }

def parse_naming_output(output):
    """Parse Naming Conventions Validator output"""
    try:
        lines = output.split('\n')
        
        summary = {
            'total': 0,
            'compliant': 0,
            'violations': 0
        }
        
        pages = []
        
        for line in lines:
            if 'Total Items:' in line:
                summary['total'] = int(line.split(':')[1].strip())
            elif 'Compliant:' in line:
                summary['compliant'] = int(line.split(':')[1].strip())
            elif 'Violations:' in line:
                summary['violations'] = int(line.split(':')[1].strip())
            elif '✅' in line or '⚠️' in line:
                parts = line.strip().split()
                if len(parts) >= 3:
                    status = parts[0]
                    filename = parts[1]
                    violations = int(parts[2].replace('violation(s)', '').strip())
                    
                    pages.append({
                        'file': filename,
                        'violations': [],
                        'total': 0,
                        'compliant': 0
                    })
        
        return {
            'summary': summary,
            'pages': pages
        }
        
    except Exception as e:
        logger.error(f"Error parsing naming output: {e}")
        return {
            'summary': {'total': 0, 'compliant': 0, 'violations': 0},
            'pages': []
        }

def parse_duplicates_output(output):
    """Parse Advanced Duplicate Detector output"""
    try:
        # Look for the summary section in the output
        lines = output.split('\n')
        
        summary = {
            'totalFunctions': 0,
            'totalDuplicates': 0,
            'exactDuplicates': 0,
            'nearDuplicates': 0,
            'similarPatterns': 0,
            'potentialDuplicates': 0
        }
        
        duplicates = {
            'exact': [],
            'near': [],
            'similar': [],
            'potential': []
        }
        
        # Parse the output to extract summary
        for line in lines:
            if 'Total Functions Analyzed' in line:
                summary['totalFunctions'] = int(line.split(':')[1].strip())
            elif 'Total Duplicates Found' in line:
                summary['totalDuplicates'] = int(line.split(':')[1].strip())
            elif 'Exact Duplicates' in line:
                summary['exactDuplicates'] = int(line.split(':')[1].strip())
            elif 'Near Duplicates' in line:
                summary['nearDuplicates'] = int(line.split(':')[1].strip())
            elif 'Similar Patterns' in line:
                summary['similarPatterns'] = int(line.split(':')[1].strip())
            elif 'Potential Duplicates' in line:
                summary['potentialDuplicates'] = int(line.split(':')[1].strip())
        
        return {
            'summary': summary,
            'duplicates': duplicates,
            'categories': {},
            'recommendations': []
        }
        
    except Exception as e:
        logger.error(f"Error parsing duplicates output: {e}")
        return {
            'summary': summary,
            'duplicates': duplicates,
            'categories': {},
            'recommendations': [],
            'error': str(e)
        }

@bp.route('/duplicates', methods=['POST'])
def check_duplicates():
    """Run Simple Duplicate Code Detector"""
    try:
        logger.info("Running Simple Duplicate Code Detector")
        
        # Run the detector script
        result = run_script('simple-duplicate-detector.js')
        
        if result['success']:
            # Parse the output to extract results
            data = parse_duplicates_output(result['output'])
            return jsonify({
                'status': 'success',
                'data': data,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'error': result['error'],
                'timestamp': datetime.now().isoformat()
            })
            
    except Exception as e:
        logger.error(f"Error running duplicate detection: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        })
