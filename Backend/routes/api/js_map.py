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
@cache_for(ttl=300)  # Cache for 5 minutes
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
