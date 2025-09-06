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
def get_page_mapping():
    """
    Get page to JS file mapping
    """
    try:
        # Define known page to JS file mappings
        page_mappings = {
            'index.html': ['main.js', 'header-system.js', 'simple-filter.js'],
            'trades.html': ['trades.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'trade_plans.html': ['trade_plans.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'research.html': ['research.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'alerts.html': ['alerts.js', 'active-alerts-component.js', 'header-system.js', 'simple-filter.js'],
            'executions.html': ['executions.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'tickers.html': ['tickers.js', 'ticker-service.js', 'header-system.js', 'simple-filter.js'],
            'accounts.html': ['accounts.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'cash_flows.html': ['cash_flows.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'notes.html': ['notes.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'preferences.html': ['preferences.js', 'header-system.js', 'simple-filter.js', 'ui-utils.js'],
            'db_display.html': ['database.js', 'db-extradata.js', 'header-system.js', 'simple-filter.js'],
            'db_extradata.html': ['db-extradata.js', 'header-system.js', 'simple-filter.js'],
            'constraints.html': ['constraint-manager.js', 'header-system.js', 'simple-filter.js'],
        
            'styles.html': ['header-system.js', 'simple-filter.js']
        }
        
        return jsonify(page_mappings)
        
    except Exception as e:
        current_app.logger.error(f"Error getting page mapping: {e}")
        return jsonify({}), 500

@js_map_bp.route('/functions', methods=['GET'])
def get_functions_data():
    """
    Get functions data from all JS files
    """
    try:
        functions_data = {}
        
        # Get list of JS files
        js_files = [f.name for f in SCRIPTS_PATH.glob('*.js')]
        
        # Scan each file for functions
        for filename in js_files:
            file_path = SCRIPTS_PATH / filename
            if file_path.exists():
                functions = extract_functions_from_file(file_path)
                functions_data[filename] = functions
        
        return jsonify(functions_data)
        
    except Exception as e:
        current_app.logger.error(f"Error getting functions data: {e}")
        return jsonify({}), 500

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
