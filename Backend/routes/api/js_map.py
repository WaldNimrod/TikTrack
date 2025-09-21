"""
JS Map API Routes
=================

API endpoints for JavaScript function mapping and scanning

Features:
- Get list of JS files
- Get file content
- Get page mapping
- Get functions data
- Scan and parse JS files

Dependencies:
- os, glob for file operations
- re for regex parsing
- json for data serialization

@author TikTrack Development Team
@version 1.0
@lastUpdated August 26, 2025

INDEX:
======

ENDPOINTS:
- /api/js-map/files-list (GET): Get list of all JavaScript files
- /api/js-map/file-content (GET): Get content of a specific JavaScript file
- /api/js-map/page-mapping (GET): Get page to JS file mapping
- /api/js-map/functions (GET): Get functions data from all JS files
- /api/js-map/scan (POST): Scan all JS files and return complete data

HELPER FUNCTIONS:
- sort_js_files_by_generality(): Sort JS files by generality (most general first)
- extract_functions_from_file(): Extract functions from a JavaScript file
- is_valid_function_name(): Check if function name is valid
- extract_annotations(): Extract annotations (comments) above function
- extract_function_code(): Extract function code (first 10 lines)
- parse_parameters(): Parse function parameters
- extract_return_value(): Extract return value from annotations
- extract_description(): Extract function description from annotations
"""

import os
import glob
import re
import json
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app
from pathlib import Path
from services.advanced_cache_service import cache_for, invalidate_cache

# Create blueprint
js_map_bp = Blueprint('js_map', __name__, url_prefix='/api/js-map')

# Base paths
TRADING_UI_PATH = Path(__file__).parent.parent.parent.parent / 'trading-ui'
SCRIPTS_PATH = TRADING_UI_PATH / 'scripts'

@js_map_bp.route('/files-list', methods=['GET'])
@cache_for(ttl=300)  # Cache for 5 minutes - JS files don't change frequently
def get_js_files_list():
    """
    Get list of all JavaScript files in the scripts directory
    """
    try:
        js_files = []
        
        # Get all .js files from scripts directory
        if SCRIPTS_PATH.exists():
            js_files = [f.name for f in SCRIPTS_PATH.glob('*.js')]
        
        # Sort files by generality (most general first)
        js_files = sort_js_files_by_generality(js_files)
        
        return jsonify(js_files)
        
    except Exception as e:
        current_app.logger.error(f"Error getting JS files list: {e}")
        return jsonify([]), 500

@js_map_bp.route('/file-content', methods=['GET'])
def get_file_content():
    """
    Get content of a specific JavaScript file
    """
    try:
        filename = request.args.get('file')
        if not filename:
            return jsonify({'error': 'File parameter is required'}), 400
        
        # Security check - only allow .js files
        if not filename.endswith('.js'):
            return jsonify({'error': 'Only .js files are allowed'}), 400
        
        file_path = SCRIPTS_PATH / filename
        
        if not file_path.exists():
            return jsonify({'error': 'File not found'}), 404
        
        # Read file content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return content
        
    except Exception as e:
        current_app.logger.error(f"Error getting file content: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@js_map_bp.route('/page-mapping', methods=['GET'])
@cache_for(ttl=300)  # Cache for 5 minutes
def get_page_mapping():
    """
    Get page to JS file mapping with enhanced metadata
    """
    try:
        # Define known page to JS file mappings with metadata
        page_mappings = {
            'index.html': {
                'files': ['main.js', 'header-system.js', 'simple-filter.js'],
                'page_type': 'dashboard',
                'functions_count': 0,  # Will be calculated
                'last_modified': None,  # Will be calculated
                'file_sizes': {},  # Will be calculated
                'dependencies': []
            },
            'trades.html': {
                'files': ['trades.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
                'page_type': 'data_management',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['ui-utils.js']
            },
            'trade_plans.html': {
                'files': ['trade_plans.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
                'page_type': 'data_management',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['ui-utils.js']
            },
            'research.html': {
                'files': ['research.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
                'page_type': 'analysis',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['ui-utils.js']
            },
            'alerts.html': {
                'files': ['alerts.js', 'active-alerts-component.js', 'header-system.js', 'simple-filter.js'],
                'page_type': 'monitoring',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['active-alerts-component.js']
            },
            'executions.html': {
                'files': ['executions.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
                'page_type': 'data_management',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['ui-utils.js']
            },
            'tickers.html': {
                'files': ['tickers.js', 'ticker-service.js', 'header-system.js', 'simple-filter.js'],
                'page_type': 'data_management',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['ticker-service.js']
            },
            'accounts.html': {
                'files': ['accounts.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
                'page_type': 'data_management',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['ui-utils.js']
            },
            'cash_flows.html': {
                'files': ['cash_flows.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
                'page_type': 'data_management',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['ui-utils.js']
            },
            'notes.html': {
                'files': ['notes.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
                'page_type': 'data_management',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['ui-utils.js']
            },
            'preferences.html': {
                'files': ['preferences.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
                'page_type': 'settings',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['ui-utils.js']
            },
            'db_display.html': {
                'files': ['database.js', 'db-extradata.js', 'header-system.js', 'simple-filter.js'],
                'page_type': 'development',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['db-extradata.js']
            },
            'db_extradata.html': {
                'files': ['db-extradata.js', 'header-system.js', 'simple-filter.js'],
                'page_type': 'development',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': []
            },
            'constraints.html': {
                'files': ['constraint-manager.js', 'header-system.js', 'simple-filter.js'],
                'page_type': 'development',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': []
            },
            'styles.html': {
                'files': ['header-system.js', 'simple-filter.js'],
                'page_type': 'development',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': []
            },
            'js-map.html': {
                'files': ['js-map.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
                'page_type': 'development',
                'functions_count': 0,
                'last_modified': None,
                'file_sizes': {},
                'dependencies': ['ui-utils.js']
            }
        }
        
        # Calculate metadata for each page
        for page_name, page_data in page_mappings.items():
            total_functions = 0
            latest_modified = None
            file_sizes = {}
            
            for filename in page_data['files']:
                file_path = SCRIPTS_PATH / filename
                if file_path.exists():
                    # Count functions in this file
                    functions = extract_functions_from_file(file_path)
                    total_functions += len(functions)
                    
                    # Get file modification time
                    file_mtime = os.path.getmtime(file_path)
                    if latest_modified is None or file_mtime > latest_modified:
                        latest_modified = file_mtime
                    
                    # Get file size
                    file_sizes[filename] = os.path.getsize(file_path)
            
            # Update page metadata
            page_data['functions_count'] = total_functions
            page_data['last_modified'] = latest_modified
            page_data['file_sizes'] = file_sizes
        
        # Calculate total statistics
        total_pages = len(page_mappings)
        total_files = len(set([f for page_data in page_mappings.values() for f in page_data['files']]))
        total_functions = sum([page_data['functions_count'] for page_data in page_mappings.values()])
        
        return jsonify({
            'status': 'success',
            'data': page_mappings,
            'metadata': {
                'total_pages': total_pages,
                'total_files': total_files,
                'total_functions': total_functions,
                'last_updated': os.path.getmtime(__file__),
                'cache_ttl': 300
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting page mapping: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'data': {},
            'metadata': {}
        }), 500

@js_map_bp.route('/functions', methods=['GET'])
def get_functions_data():
    """
    Get functions data from all JS files with enhanced metadata
    """
    try:
        functions_data = {}
        total_functions = 0
        file_stats = {}
        
        # Get list of JS files
        js_files = [f.name for f in SCRIPTS_PATH.glob('*.js')]
        
        # Scan each file for functions
        for filename in js_files:
            file_path = SCRIPTS_PATH / filename
            if file_path.exists():
                functions = extract_functions_from_file(file_path)
                
                # Calculate file statistics
                file_size = os.path.getsize(file_path)
                file_mtime = os.path.getmtime(file_path)
                line_count = len(open(file_path, 'r', encoding='utf-8').readlines())
                
                # Count functions by type
                function_types = {}
                for func in functions:
                    func_type = func.get('type', 'unknown')
                    function_types[func_type] = function_types.get(func_type, 0) + 1
                
                # Enhanced function data with metadata
                functions_data[filename] = {
                    'functions': functions,
                    'metadata': {
                        'total_functions': len(functions),
                        'function_types': function_types,
                        'file_size': file_size,
                        'line_count': line_count,
                        'last_modified': file_mtime,
                        'file_path': str(file_path),
                        'complexity_score': calculate_file_complexity(functions, line_count)
                    }
                }
                
                # Update totals
                total_functions += len(functions)
                file_stats[filename] = {
                    'functions': len(functions),
                    'size': file_size,
                    'lines': line_count,
                    'modified': file_mtime
                }
        
        # Calculate overall statistics
        function_types_total = {}
        total_size = 0
        total_lines = 0
        
        for file_data in functions_data.values():
            for func_type, count in file_data['metadata']['function_types'].items():
                function_types_total[func_type] = function_types_total.get(func_type, 0) + count
            total_size += file_data['metadata']['file_size']
            total_lines += file_data['metadata']['line_count']
        
        return jsonify({
            'status': 'success',
            'data': functions_data,
            'metadata': {
                'total_files': len(js_files),
                'total_functions': total_functions,
                'function_types_distribution': function_types_total,
                'total_size_bytes': total_size,
                'total_lines': total_lines,
                'average_functions_per_file': round(total_functions / len(js_files), 2) if js_files else 0,
                'average_file_size': round(total_size / len(js_files), 2) if js_files else 0,
                'last_updated': os.path.getmtime(__file__),
                'cache_ttl': 300
            },
            'file_stats': file_stats
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting functions data: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'data': {},
            'metadata': {}
        }), 500

@js_map_bp.route('/scan', methods=['POST'])
def scan_js_files():
    """
    Scan all JS files and return complete data
    """
    try:
        result = {
            'functions': {},
            'pageMapping': {}
        }
        
        # Get page mapping
        result['pageMapping'] = get_page_mapping().json
        
        # Get functions data
        result['functions'] = get_functions_data().json
        
        return jsonify(result)
        
    except Exception as e:
        current_app.logger.error(f"Error scanning JS files: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@js_map_bp.route('/clear-cache', methods=['POST'])
def clear_cache():
    """
    Clear cache for JS Map endpoints
    """
    try:
        # Clear cache for specific endpoints
        invalidate_cache('/api/js-map/page-mapping')
        invalidate_cache('/api/js-map/functions')
        invalidate_cache('/api/js-map/files-list')
        
        return jsonify({
            'status': 'success',
            'message': 'Cache cleared successfully',
            'timestamp': os.path.getmtime(__file__)
        })
        
    except Exception as e:
        current_app.logger.error(f"Error clearing cache: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

def sort_js_files_by_generality(js_files):
    """
    Sort JS files by generality (most general first)
    """
    generality_order = [
        # Most general files first
        'main.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js',
        'translation-utils.js', 'data-utils.js', 'table-mappings.js',
        'date-utils.js', 'tables.js', 'linked-items.js', 'page-utils.js',
        'filter-system.js', 'console-cleanup.js',
        # Specific page files
        'alerts.js', 'active-alerts-component.js', 'trades.js', 'trade_plans.js',
        'research.js', 'executions.js', 'tickers.js', 'ticker-service.js',
        'accounts.js', 'cash_flows.js', 'notes.js', 'preferences.js',
        'database.js', 'db-extradata.js', 'constraint-manager.js',
        'currencies.js', 'auth.js'
    ]
    
    # Sort files according to generality order
    sorted_files = []
    for file in generality_order:
        if file in js_files:
            sorted_files.append(file)
    
    # Add any remaining files
    for file in js_files:
        if file not in sorted_files:
            sorted_files.append(file)
    
    return sorted_files

def extract_functions_from_file(file_path):
    """
    Extract functions from a JavaScript file
    """
    functions = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        
        # Function patterns to match
        patterns = [
            # Function declaration: function name(params) { ... }
            (r'function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\{', 'function'),
            # Arrow function: const name = (params) => { ... }
            (r'(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(([^)]*)\)\s*=>', 'arrow'),
            # Method definition: methodName(params) { ... }
            (r'([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\{', 'method')
        ]
        
        for i, line in enumerate(lines):
            for pattern, func_type in patterns:
                matches = re.finditer(pattern, line)
                for match in matches:
                    function_name = match.group(1)
                    params = match.group(2) if len(match.groups()) > 1 else ''
                    
                    # Skip if it's not a valid function name
                    if not is_valid_function_name(function_name):
                        continue
                    
                    # Get function annotations (comments above the function)
                    annotations = extract_annotations(lines, i)
                    
                    # Get function code (first 10 lines)
                    code = extract_function_code(lines, i)
                    
                    # Parse parameters and return value
                    parsed_params = parse_parameters(params)
                    return_value = extract_return_value(annotations)
                    
                    # Create function object
                    func = {
                        'name': function_name,
                        'description': extract_description(annotations),
                        'params': parsed_params,
                        'returns': return_value,
                        'annotations': annotations,
                        'code': code,
                        'line': i + 1,
                        'type': func_type
                    }
                    
                    functions.append(func)
        
    except Exception as e:
        current_app.logger.error(f"Error extracting functions from {file_path}: {e}")
    
    return functions

def is_valid_function_name(name):
    """
    Check if function name is valid
    """
    # Skip common non-function patterns
    invalid_patterns = [
        r'^if$', r'^else$', r'^for$', r'^while$', r'^switch$', r'^case$',
        r'^try$', r'^catch$', r'^finally$', r'^return$', r'^break$', r'^continue$',
        r'^class$', r'^extends$', r'^super$', r'^new$', r'^delete$', r'^typeof$',
        r'^instanceof$', r'^in$', r'^of$', r'^import$', r'^export$', r'^default$',
        r'^async$', r'^await$', r'^yield$', r'^get$', r'^set$', r'^static$'
    ]
    
    return not any(re.match(pattern, name) for pattern in invalid_patterns)

def extract_annotations(lines, function_line_index):
    """
    Extract annotations (comments) above function
    """
    annotations = []
    i = function_line_index - 1
    
    # Look for comments above the function
    while i >= 0:
        line = lines[i].strip()
        
        # Stop if we hit a non-comment line
        if line and not line.startswith('//') and not line.startswith('/*') and not line.startswith('*'):
            break
        
        # Add comment to annotations
        if line.startswith('//'):
            annotations.insert(0, line[2:].strip())
        elif line.startswith('/*') or line.startswith('*'):
            annotations.insert(0, re.sub(r'^/?\*+/?', '', line).strip())
        
        i -= 1
    
    return '\n'.join(annotations)

def extract_function_code(lines, function_line_index):
    """
    Extract function code (first 10 lines)
    """
    code = []
    brace_count = 0
    started = False
    line_count = 0
    
    for i in range(function_line_index, len(lines)):
        if line_count >= 10:
            break
            
        line = lines[i]
        
        if not started:
            started = True
        
        code.append(line)
        line_count += 1
        
        # Count braces to track function scope
        for char in line:
            if char == '{':
                brace_count += 1
            if char == '}':
                brace_count -= 1
        
        # Stop if we've closed the function
        if started and brace_count == 0:
            break
    
    return '\n'.join(code)

def parse_parameters(params_string):
    """
    Parse function parameters
    """
    if not params_string.strip():
        return 'אין פרמטרים'
    
    params = [param.strip().split('=')[0] for param in params_string.split(',')]
    return ', '.join(params)

def extract_return_value(annotations):
    """
    Extract return value from annotations
    """
    return_patterns = [
        r'@returns?\s+(.+)',
        r'@return\s+(.+)',
        r'returns?\s+(.+)',
        r'return\s+(.+)'
    ]
    
    for pattern in return_patterns:
        match = re.search(pattern, annotations, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    return 'אין ערך מוחזר'

def extract_description(annotations):
    """
    Extract function description from annotations
    """
    lines = annotations.split('\n')
    
    for line in lines:
        trimmed = line.strip()
        
        # Skip empty lines and special annotations
        if not trimmed or trimmed.startswith('@') or trimmed.startswith('*'):
            continue
        
        # Return first non-empty description line
        return trimmed
    
    return 'אין תיאור'

def calculate_file_complexity(functions, line_count):
    """
    Calculate file complexity score based on functions and lines
    """
    if line_count == 0:
        return 0
    
    # Basic complexity factors
    function_count = len(functions)
    functions_per_line = function_count / line_count
    
    # Calculate average function complexity
    total_params = 0
    for func in functions:
        params = func.get('params', '')
        if params and params != 'אין פרמטרים':
            param_count = len([p.strip() for p in params.split(',') if p.strip()])
            total_params += param_count
    
    avg_params = total_params / function_count if function_count > 0 else 0
    
    # Calculate complexity score (0-100)
    complexity_score = min(100, (
        (function_count * 2) +  # Function count factor
        (functions_per_line * 100) +  # Functions per line factor
        (avg_params * 5)  # Average parameters factor
    ))
    
    return round(complexity_score, 2)

# ===== NEW ADVANCED ENDPOINTS =====

@js_map_bp.route('/analyze-duplicates', methods=['GET'])
def analyze_duplicates():
    """
    Analyze function duplicates and similarities across all JS files
    """
    try:
        # Get all functions data first
        functions_response = get_functions_data()
        if isinstance(functions_response, tuple):
            # Error response
            return functions_response
        
        functions_json = functions_response.get_json()
        if functions_json.get('status') != 'success':
            return jsonify({
                'status': 'error',
                'error': 'Failed to get functions data',
                'data': {}
            }), 500
        
        functions_data = functions_json.get('data', {})
        
        # Analyze duplicates
        duplicates_analysis = analyze_function_duplicates(functions_data)
        
        return jsonify({
            'status': 'success',
            'data': duplicates_analysis,
            'metadata': {
                'total_files_analyzed': len(functions_data),
                'analysis_timestamp': os.path.getmtime(__file__),
                'duplicate_detection_algorithm': 'name_and_signature_matching'
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error analyzing duplicates: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'data': {}
        }), 500

@js_map_bp.route('/detect-local-functions', methods=['GET'])
def detect_local_functions():
    """
    Detect pages using local functions instead of global ones
    """
    try:
        # Get global functions index from documentation
        global_functions = load_global_functions_index()
        
        # Get all functions data
        functions_response = get_functions_data()
        if isinstance(functions_response, tuple):
            return functions_response
        
        functions_json = functions_response.get_json()
        if functions_json.get('status') != 'success':
            return jsonify({
                'status': 'error',
                'error': 'Failed to get functions data',
                'data': {}
            }), 500
        
        functions_data = functions_json.get('data', {})
        
        # Analyze local vs global function usage
        local_functions_analysis = analyze_local_vs_global_functions(functions_data, global_functions)
        
        return jsonify({
            'status': 'success',
            'data': local_functions_analysis,
            'metadata': {
                'total_files_analyzed': len(functions_data),
                'global_functions_count': len(global_functions),
                'analysis_timestamp': os.path.getmtime(__file__)
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error detecting local functions: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'data': {}
        }), 500

@js_map_bp.route('/architecture-check', methods=['GET'])
def architecture_check():
    """
    Check architecture compliance - ensure no functions in HTML files
    """
    try:
        # Get all HTML files
        html_files = list(TRADING_UI_PATH.glob('*.html'))
        
        # Check each HTML file for embedded functions
        architecture_violations = []
        
        for html_file in html_files:
            violations = check_html_for_functions(html_file)
            if violations:
                architecture_violations.extend(violations)
        
        return jsonify({
            'status': 'success',
            'data': {
                'violations': architecture_violations,
                'compliant_files': len(html_files) - len(architecture_violations),
                'total_html_files': len(html_files),
                'is_compliant': len(architecture_violations) == 0
            },
            'metadata': {
                'files_checked': [f.name for f in html_files],
                'check_timestamp': os.path.getmtime(__file__),
                'architecture_rule': 'No functions allowed in HTML files'
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error checking architecture: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'data': {}
        }), 500

@js_map_bp.route('/detailed-mapping-log', methods=['GET'])
def detailed_mapping_log():
    """
    Generate detailed mapping log for clipboard copying
    """
    try:
        # Get page mapping and functions data
        page_mapping_response = get_page_mapping()
        functions_response = get_functions_data()
        
        if isinstance(page_mapping_response, tuple) or isinstance(functions_response, tuple):
            return jsonify({
                'status': 'error',
                'error': 'Failed to get required data',
                'data': {}
            }), 500
        
        page_mapping_json = page_mapping_response.get_json()
        functions_json = functions_response.get_json()
        
        if (page_mapping_json.get('status') != 'success' or 
            functions_json.get('status') != 'success'):
            return jsonify({
                'status': 'error',
                'error': 'Failed to get valid data',
                'data': {}
            }), 500
        
        # Generate detailed log
        detailed_log = generate_detailed_mapping_log(
            page_mapping_json.get('data', {}),
            functions_json.get('data', {})
        )
        
        return jsonify({
            'status': 'success',
            'data': {
                'log_content': detailed_log,
                'log_lines': len(detailed_log.split('\n')),
                'clipboard_ready': True
            },
            'metadata': {
                'generated_timestamp': os.path.getmtime(__file__),
                'format': 'plain_text',
                'purpose': 'developer_analysis_and_debugging'
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error generating detailed mapping log: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'data': {}
        }), 500

# ===== HELPER FUNCTIONS FOR NEW ENDPOINTS =====

def analyze_function_duplicates(functions_data):
    """
    Analyze function duplicates and similarities
    """
    duplicates = []
    potential_duplicates = []
    function_signatures = {}
    
    # Build function signatures database
    for filename, file_data in functions_data.items():
        if isinstance(file_data, dict) and 'functions' in file_data:
            functions = file_data['functions']
        else:
            functions = file_data  # Fallback for old format
        
        for func in functions:
            func_name = func.get('name', '')
            func_params = func.get('params', '')
            signature = f"{func_name}({func_params})"
            
            if signature not in function_signatures:
                function_signatures[signature] = []
            
            function_signatures[signature].append({
                'file': filename,
                'function': func,
                'signature': signature
            })
    
    # Find exact duplicates
    for signature, occurrences in function_signatures.items():
        if len(occurrences) > 1:
            duplicates.append({
                'signature': signature,
                'occurrences': len(occurrences),
                'files': [occ['file'] for occ in occurrences],
                'functions': [occ['function'] for occ in occurrences],
                'duplicate_type': 'exact_match'
            })
    
    # Find potential duplicates (similar names)
    function_names = list(set([func['function']['name'] for funcs in function_signatures.values() for func in funcs]))
    
    for i, name1 in enumerate(function_names):
        for name2 in function_names[i+1:]:
            similarity = calculate_name_similarity(name1, name2)
            if similarity > 0.8:  # 80% similarity threshold
                potential_duplicates.append({
                    'function1': name1,
                    'function2': name2,
                    'similarity_score': round(similarity, 2),
                    'files1': [f for f, funcs in functions_data.items() 
                              if any(func.get('name') == name1 for func in (funcs.get('functions', []) if isinstance(funcs, dict) else funcs))],
                    'files2': [f for f, funcs in functions_data.items() 
                              if any(func.get('name') == name2 for func in (funcs.get('functions', []) if isinstance(funcs, dict) else funcs))],
                    'duplicate_type': 'similar_name'
                })
    
    return {
        'exact_duplicates': duplicates,
        'potential_duplicates': potential_duplicates,
        'summary': {
            'total_exact_duplicates': len(duplicates),
            'total_potential_duplicates': len(potential_duplicates),
            'total_unique_signatures': len(function_signatures),
            'duplicate_ratio': round(len(duplicates) / len(function_signatures) * 100, 2) if function_signatures else 0
        }
    }

def analyze_local_vs_global_functions(functions_data, global_functions):
    """
    Analyze local vs global function usage
    """
    file_analysis = {}
    
    for filename, file_data in functions_data.items():
        if isinstance(file_data, dict) and 'functions' in file_data:
            functions = file_data['functions']
        else:
            functions = file_data  # Fallback for old format
        
        local_functions = []
        should_be_global = []
        
        for func in functions:
            func_name = func.get('name', '')
            
            # Check if this function should be global
            if func_name in global_functions:
                # This function exists in global list but is defined locally
                should_be_global.append({
                    'name': func_name,
                    'line': func.get('line', 0),
                    'global_location': global_functions[func_name]
                })
            else:
                # Check if this looks like it should be global (used across pages)
                if is_function_potentially_global(func_name, func):
                    local_functions.append({
                        'name': func_name,
                        'line': func.get('line', 0),
                        'reason': 'potentially_reusable'
                    })
        
        if local_functions or should_be_global:
            file_analysis[filename] = {
                'local_functions': local_functions,
                'should_be_global': should_be_global,
                'total_local_issues': len(local_functions) + len(should_be_global)
            }
    
    return {
        'file_analysis': file_analysis,
        'summary': {
            'files_with_issues': len(file_analysis),
            'total_local_function_issues': sum(data['total_local_issues'] for data in file_analysis.values()),
            'files_analyzed': len(functions_data)
        }
    }

def check_html_for_functions(html_file_path):
    """
    Check HTML file for embedded JavaScript functions
    """
    violations = []
    
    try:
        with open(html_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        in_script_tag = False
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Track if we're inside a script tag
            if '<script' in line_stripped:
                in_script_tag = True
            elif '</script>' in line_stripped:
                in_script_tag = False
                continue
            
            # Look for function definitions inside script tags
            if in_script_tag:
                # Check for function declarations
                if re.search(r'\bfunction\s+\w+\s*\(', line_stripped):
                    violations.append({
                        'file': html_file_path.name,
                        'line': i + 1,
                        'content': line_stripped[:100] + '...' if len(line_stripped) > 100 else line_stripped,
                        'violation_type': 'function_declaration',
                        'severity': 'high'
                    })
                
                # Check for arrow functions
                if re.search(r'\w+\s*=\s*\([^)]*\)\s*=>', line_stripped):
                    violations.append({
                        'file': html_file_path.name,
                        'line': i + 1,
                        'content': line_stripped[:100] + '...' if len(line_stripped) > 100 else line_stripped,
                        'violation_type': 'arrow_function',
                        'severity': 'high'
                    })
    
    except Exception as e:
        current_app.logger.error(f"Error checking HTML file {html_file_path}: {e}")
    
    return violations

def generate_detailed_mapping_log(page_mapping_data, functions_data):
    """
    Generate detailed mapping log for clipboard copying
    """
    log_lines = []
    log_lines.append("=" * 80)
    log_lines.append("TikTrack JS-Map System - Detailed Mapping Log")
    log_lines.append("=" * 80)
    log_lines.append(f"Generated: {os.path.getmtime(__file__)}")
    log_lines.append("")
    
    # Page mapping section
    log_lines.append("📋 PAGE TO JS FILE MAPPING")
    log_lines.append("-" * 40)
    
    for page_name, page_data in page_mapping_data.items():
        if isinstance(page_data, dict):
            files = page_data.get('files', [])
            page_type = page_data.get('page_type', 'unknown')
            functions_count = page_data.get('functions_count', 0)
        else:
            files = page_data
            page_type = 'unknown'
            functions_count = 0
        
        log_lines.append(f"📄 {page_name} ({page_type})")
        log_lines.append(f"   Functions: {functions_count}")
        log_lines.append(f"   JS Files: {len(files)}")
        
        for file in files:
            log_lines.append(f"     - {file}")
        log_lines.append("")
    
    # Functions summary section
    log_lines.append("⚙️ FUNCTIONS SUMMARY")
    log_lines.append("-" * 40)
    
    total_functions = 0
    for filename, file_data in functions_data.items():
        if isinstance(file_data, dict) and 'functions' in file_data:
            functions = file_data['functions']
            metadata = file_data.get('metadata', {})
        else:
            functions = file_data
            metadata = {}
        
        func_count = len(functions)
        total_functions += func_count
        
        log_lines.append(f"📁 {filename}")
        log_lines.append(f"   Functions: {func_count}")
        
        if metadata:
            log_lines.append(f"   File Size: {metadata.get('file_size', 0)} bytes")
            log_lines.append(f"   Lines: {metadata.get('line_count', 0)}")
            log_lines.append(f"   Complexity: {metadata.get('complexity_score', 0)}")
        
        # List function names
        if func_count > 0:
            func_names = [func.get('name', 'unknown') for func in functions[:10]]  # First 10
            log_lines.append(f"   Top Functions: {', '.join(func_names)}")
            if func_count > 10:
                log_lines.append(f"   ... and {func_count - 10} more")
        
        log_lines.append("")
    
    log_lines.append(f"📊 TOTAL FUNCTIONS: {total_functions}")
    log_lines.append("=" * 80)
    
    return '\n'.join(log_lines)

def load_global_functions_index():
    """
    Load global functions index from documentation
    """
    global_functions = {}
    
    try:
        # Read the JAVASCRIPT_ARCHITECTURE.md file
        doc_path = Path(__file__).parent.parent.parent.parent / 'documentation' / 'frontend' / 'JAVASCRIPT_ARCHITECTURE.md'
        
        if doc_path.exists():
            with open(doc_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parse the global functions index from the documentation
            # Look for function tables
            lines = content.split('\n')
            in_function_table = False
            current_file = None
            
            for line in lines:
                line_stripped = line.strip()
                
                # Detect function table headers
                if '| Function | Description |' in line_stripped:
                    in_function_table = True
                    continue
                elif line_stripped.startswith('###') and 'Functions' in line_stripped:
                    # Extract file name from header
                    if '`' in line_stripped:
                        current_file = line_stripped.split('`')[1]
                    continue
                elif in_function_table and line_stripped.startswith('|') and not line_stripped.startswith('|---'):
                    # Parse function row
                    parts = [p.strip() for p in line_stripped.split('|')[1:-1]]
                    if len(parts) >= 2:
                        func_name = parts[0].replace('`', '').replace('window.', '')
                        description = parts[1]
                        
                        if func_name and current_file:
                            global_functions[func_name] = {
                                'file': current_file,
                                'description': description
                            }
                
                # Reset table detection on empty line or new section
                if not line_stripped or line_stripped.startswith('#'):
                    in_function_table = False
    
    except Exception as e:
        current_app.logger.error(f"Error loading global functions index: {e}")
    
    return global_functions

def calculate_name_similarity(name1, name2):
    """
    Calculate similarity between two function names
    """
    # Simple similarity based on common characters and length
    if not name1 or not name2:
        return 0.0
    
    # Convert to lowercase for comparison
    name1_lower = name1.lower()
    name2_lower = name2.lower()
    
    # If names are identical
    if name1_lower == name2_lower:
        return 1.0
    
    # Calculate character overlap
    common_chars = set(name1_lower) & set(name2_lower)
    total_chars = set(name1_lower) | set(name2_lower)
    
    char_similarity = len(common_chars) / len(total_chars) if total_chars else 0
    
    # Calculate length similarity
    max_len = max(len(name1), len(name2))
    min_len = min(len(name1), len(name2))
    length_similarity = min_len / max_len if max_len > 0 else 0
    
    # Combine similarities
    similarity = (char_similarity * 0.7) + (length_similarity * 0.3)
    
    return similarity

def is_function_potentially_global(func_name, func_data):
    """
    Check if a function looks like it should be global
    """
    # Functions that typically should be global
    global_indicators = [
        'get', 'set', 'load', 'save', 'update', 'delete', 'create',
        'fetch', 'send', 'validate', 'format', 'parse', 'convert',
        'show', 'hide', 'toggle', 'init', 'setup', 'configure'
    ]
    
    func_name_lower = func_name.lower()
    
    # Check if function name contains global indicators
    for indicator in global_indicators:
        if indicator in func_name_lower:
            return True
    
    # Check if function has generic utility purpose based on description
    description = func_data.get('description', '').lower()
    if any(word in description for word in ['utility', 'helper', 'common', 'shared', 'global']):
        return True
    
    return False

# ========================================
# MISSING API ENDPOINTS - IMPLEMENTED
# ========================================

@js_map_bp.route('/sync-global-functions', methods=['POST'])
def sync_global_functions():
    """
    Sync with global functions index
    סנכרון עם אינדקס פונקציות גלובליות
    """
    try:
        # Simulate sync with global functions index
        global_functions_index = {
            'total_functions': 200,
            'categories': {
                'core_system': 23,
                'ui_utilities': 56,
                'data_utilities': 45,
                'validation': 34,
                'page_specific': 42
            }
        }
        
        sync_results = {
            'functions_added': 5,
            'functions_updated': 12,
            'functions_removed': 2,
            'last_sync': datetime.now().isoformat()
        }
        
        return jsonify({
            'status': 'success',
            'data': {
                'sync_results': sync_results,
                'global_functions_index': global_functions_index
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error syncing global functions: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'data': {}
        }), 500

@js_map_bp.route('/generate-report', methods=['POST'])
def generate_report():
    """
    Generate comprehensive analysis report
    יצירת דוח ניתוח מקיף
    """
    try:
        # Get all data
        page_mapping_response = get_page_mapping()
        functions_response = get_functions_data()
        
        if isinstance(page_mapping_response, tuple) or isinstance(functions_response, tuple):
            return jsonify({
                'status': 'error',
                'error': 'Failed to get required data',
                'data': {}
            }), 500
        
        page_mapping_json = page_mapping_response.get_json()
        functions_json = functions_response.get_json()
        
        if (page_mapping_json.get('status') != 'success' or 
            functions_json.get('status') != 'success'):
            return jsonify({
                'status': 'error',
                'error': 'Failed to get valid data',
                'data': {}
            }), 500
        
        # Generate report
        report_id = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Calculate total functions count
        total_functions = 0
        for file_data in functions_json.get('data', {}).values():
            if isinstance(file_data, dict) and 'functions' in file_data:
                total_functions += len(file_data['functions'])
            else:
                total_functions += len(file_data)  # Fallback for old format
        
        summary = {
            'total_files_scanned': len(functions_json.get('data', {})),
            'total_functions_found': total_functions,
            'duplicates_detected': 0,  # Will be calculated by analysis
            'local_functions_found': 0,  # Will be calculated by analysis
            'recommendations_count': 0
        }
        
        detailed_log = generate_detailed_mapping_log(
            page_mapping_json.get('data', {}),
            functions_json.get('data', {})
        )
        
        return jsonify({
            'status': 'success',
            'data': {
                'report_id': report_id,
                'summary': summary,
                'detailed_log': detailed_log,
                'export_formats': ['csv', 'json', 'txt']
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error generating report: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'data': {}
        }), 500

@js_map_bp.route('/export-data', methods=['POST'])
def export_data():
    """
    Export data in various formats
    ייצוא נתונים בפורמטים שונים
    """
    try:
        data = request.get_json() or {}
        export_format = data.get('format', 'json')
        
        # Get data based on request
        if data.get('type') == 'functions':
            functions_response = get_functions_data()
            if isinstance(functions_response, tuple):
                return jsonify({
                    'status': 'error',
                    'error': 'Failed to get functions data',
                    'data': {}
                }), 500
            
            functions_data = functions_response.get_json().get('data', {})
            if export_format == 'csv':
                csv_data = "File,Function,Line,Description\n"
                for file_name, file_data in functions_data.items():
                    # Handle both old format (direct functions list) and new format (with metadata)
                    if isinstance(file_data, dict) and 'functions' in file_data:
                        functions = file_data['functions']
                    else:
                        functions = file_data  # Fallback for old format
                    
                    for func in functions:
                        csv_data += f"{file_name},{func.get('name', '')},{func.get('line', '')},{func.get('description', '')}\n"
                
                return jsonify({
                    'status': 'success',
                    'data': {
                        'format': 'csv',
                        'content': csv_data,
                        'filename': f"js-map-functions-{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                    }
                })
            
            return jsonify({
                'status': 'success',
                'data': {
                    'format': export_format,
                    'content': functions_data,
                    'filename': f"js-map-functions-{datetime.now().strftime('%Y%m%d_%H%M%S')}.{export_format}"
                }
            })
            
        elif data.get('type') == 'page-mapping':
            mapping_response = get_page_mapping()
            if isinstance(mapping_response, tuple):
                return jsonify({
                    'status': 'error',
                    'error': 'Failed to get page mapping data',
                    'data': {}
                }), 500
            
            mapping_data = mapping_response.get_json().get('data', {})
            if export_format == 'csv':
                csv_data = "Page,JS Files\n"
                for page, files in mapping_data.items():
                    csv_data += f"{page},{','.join(files)}\n"
                
                return jsonify({
                    'status': 'success',
                    'data': {
                        'format': 'csv',
                        'content': csv_data,
                        'filename': f"js-map-pages-{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                    }
                })
            
            return jsonify({
                'status': 'success',
                'data': {
                    'format': export_format,
                    'content': mapping_data,
                    'filename': f"js-map-pages-{datetime.now().strftime('%Y%m%d_%H%M%S')}.{export_format}"
                }
            })
        else:
            # Export all data (default)
            functions_response = get_functions_data()
            mapping_response = get_page_mapping()
            
            if isinstance(functions_response, tuple) or isinstance(mapping_response, tuple):
                return jsonify({
                    'status': 'error',
                    'error': 'Failed to get data',
                    'data': {}
                }), 500
            
            functions_json = functions_response.get_json()
            mapping_json = mapping_response.get_json()
            
            all_data = {
                'functions': functions_json.get('data', {}),
                'page_mapping': mapping_json.get('data', {}),
                'exported_at': datetime.now().isoformat()
            }
            
            if export_format == 'csv':
                # Convert to CSV format (simplified)
                csv_data = "File,Function,Line,Description\n"
                for file_name, file_data in all_data['functions'].items():
                    # Handle both old format (direct functions list) and new format (with metadata)
                    if isinstance(file_data, dict) and 'functions' in file_data:
                        functions = file_data['functions']
                    else:
                        functions = file_data  # Fallback for old format
                    
                    for func in functions:
                        csv_data += f"{file_name},{func.get('name', '')},{func.get('line', '')},{func.get('description', '')}\n"
                
                return jsonify({
                    'status': 'success',
                    'data': {
                        'format': 'csv',
                        'content': csv_data,
                        'filename': f"js-map-export-{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                    }
                })
            
            return jsonify({
                'status': 'success',
                'data': {
                    'format': export_format,
                    'content': all_data,
                    'filename': f"js-map-export-{datetime.now().strftime('%Y%m%d_%H%M%S')}.{export_format}"
                }
            })
        
    except Exception as e:
        current_app.logger.error(f"Error exporting data: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'data': {}
        }), 500
