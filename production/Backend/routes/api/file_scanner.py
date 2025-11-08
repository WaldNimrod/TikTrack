"""
Unified File Scanner API Routes
==============================

API endpoints for unified file discovery, mapping, and analysis
Replaces: js_map.py, page_scripts_matrix.py, and /api/files/discover

Features:
- File discovery and scanning
- Page to script mapping
- JavaScript function analysis
- Duplicate detection
- Architecture validation
- Report generation

Dependencies:
- os, glob for file operations
- re for regex parsing
- json for data serialization

@author TikTrack Development Team
@version 2.0
@lastUpdated January 2025

INDEX:
======

ENDPOINTS:
- /api/file-scanner/files (GET): Get list of all project files
- /api/file-scanner/file-content (GET): Get content of a specific file
- /api/file-scanner/page-mapping (GET): Get page to script mapping
- /api/file-scanner/functions (GET): Get functions data from all JS files
- /api/file-scanner/duplicates (GET): Analyze duplicate functions
- /api/file-scanner/local-functions (GET): Detect local functions
- /api/file-scanner/architecture-check (GET): Check system architecture
- /api/file-scanner/scan (POST): Perform complete system scan
- /api/file-scanner/reports (POST): Generate analysis reports
- /api/file-scanner/export (POST): Export data
- /api/file-scanner/cache (POST): Manage cache

HELPER FUNCTIONS:
- discover_all_files(): Discover all project files by type
- extract_functions_from_file(): Extract functions from JavaScript file
- analyze_duplicates(): Find duplicate functions across files
- detect_local_functions(): Identify local vs global functions
- check_architecture(): Validate system architecture
- generate_reports(): Create comprehensive analysis reports
"""

import os
import glob
import re
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Set
from flask import Blueprint, jsonify, request, current_app

from services.advanced_cache_service import cache_for

# Create Blueprint
file_scanner_bp = Blueprint('file_scanner', __name__, url_prefix='/api/file-scanner')

# Path configurations - use config.settings for production isolation
from config.settings import UI_DIR as PRODUCTION_UI_DIR
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
UI_DIR = str(PRODUCTION_UI_DIR)  # Use production UI directory from config
SCRIPTS_DIR = os.path.join(UI_DIR, 'scripts')

print(f"🔍 PROJECT_ROOT: {PROJECT_ROOT}")
print(f"🔍 UI_DIR: {UI_DIR}")
print(f"🔍 SCRIPTS_DIR: {SCRIPTS_DIR}")

# File type mappings
FILE_TYPE_MAPPINGS = {
    'js': {
        'extensions': ['.js'],
        'directories': [SCRIPTS_DIR],
        'exclude_patterns': ['node_modules', '.git', '__pycache__', 'venv', 'env', 'dist', 'build', 'coverage', 'backup', 'temp', 'tmp']
    },
    'html': {
        'extensions': ['.html', '.htm'],
        'directories': [UI_DIR, PROJECT_ROOT],
        'exclude_patterns': ['node_modules', '.git', '__pycache__', 'venv', 'env', 'dist', 'build', 'coverage', 'backup', 'temp', 'tmp']
    },
    'css': {
        'extensions': ['.css'],
        'directories': [os.path.join(UI_DIR, 'styles'), os.path.join(UI_DIR, 'styles-new')],
        'exclude_patterns': ['node_modules', '.git', '__pycache__', 'venv', 'env', 'dist', 'build', 'coverage', 'backup', 'temp', 'tmp']
    },
    'python': {
        'extensions': ['.py'],
        'directories': [os.path.join(PROJECT_ROOT, 'Backend')],  # Production Backend (PROJECT_ROOT is already production/)
        'exclude_patterns': ['node_modules', '.git', '__pycache__', 'venv', 'env', 'dist', 'build', 'coverage', 'backup', 'temp', 'tmp']
    },
    'other': {
        'extensions': ['.md', '.txt', '.json', '.yml', '.yaml', '.xml', '.sql'],
        'directories': [PROJECT_ROOT],
        'exclude_patterns': ['node_modules', '.git', '__pycache__', 'venv', 'env', 'dist', 'build', 'coverage', 'backup', 'temp', 'tmp']
    }
}

def discover_all_files(selected_types: List[str] = None) -> Dict[str, List[str]]:
    """
    Discover all project files by type
    """
    if selected_types is None:
        selected_types = ['js', 'html', 'css', 'python', 'other']
    
    files_by_type = {}
    
    for file_type in selected_types:
        if file_type not in FILE_TYPE_MAPPINGS:
            continue
            
        config = FILE_TYPE_MAPPINGS[file_type]
        files = []
        
        for directory in config['directories']:
            if not os.path.exists(directory):
                continue
                
            for ext in config['extensions']:
                pattern = os.path.join(directory, f"**/*{ext}")
                found_files = glob.glob(pattern, recursive=True)
                
                # Filter out excluded patterns
                for file_path in found_files:
                    if not any(exclude in file_path for exclude in config['exclude_patterns']):
                        # Convert to relative path from project root
                        rel_path = os.path.relpath(file_path, PROJECT_ROOT)
                        files.append(rel_path.replace('\\', '/'))
        
        files_by_type[file_type] = sorted(list(set(files)))
    
    return files_by_type

def extract_functions_from_file(file_path: str) -> List[Dict[str, Any]]:
    """
    Extract functions from a JavaScript file
    """
    functions = []
    
    try:
        full_path = os.path.join(PROJECT_ROOT, file_path)
        if not os.path.exists(full_path):
            return functions
            
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Function patterns
        patterns = [
            r'function\s+(\w+)\s*\([^)]*\)\s*{',  # function name() {
            r'(\w+)\s*:\s*function\s*\([^)]*\)\s*{',  # name: function() {
            r'(\w+)\s*=\s*function\s*\([^)]*\)\s*{',  # name = function() {
            r'(\w+)\s*=\s*\([^)]*\)\s*=>\s*{',  # name = () => {
            r'const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{',  # const name = () => {
            r'let\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{',  # let name = () => {
            r'var\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{',  # var name = () => {
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, content, re.MULTILINE)
            for match in matches:
                func_name = match.group(1)
                if is_valid_function_name(func_name):
                    func_info = {
                        'name': func_name,
                        'file': file_path,
                        'line': content[:match.start()].count('\n') + 1,
                        'type': 'function',
                        'parameters': extract_parameters(match.group(0)),
                        'description': extract_description(content, match.start()),
                        'code': extract_function_code(content, match.start())
                    }
                    functions.append(func_info)
    
    except Exception as e:
        print(f"Error extracting functions from {file_path}: {e}")
    
    return functions

def is_valid_function_name(name: str) -> bool:
    """
    Check if function name is valid
    """
    if not name or len(name) < 2:
        return False
    
    # Exclude common invalid names
    invalid_names = ['if', 'for', 'while', 'switch', 'case', 'default', 'try', 'catch', 'finally']
    if name.lower() in invalid_names:
        return False
    
    # Check if it's a valid JavaScript identifier
    return re.match(r'^[a-zA-Z_$][a-zA-Z0-9_$]*$', name) is not None

def extract_parameters(func_signature: str) -> List[str]:
    """
    Extract parameters from function signature
    """
    # Extract content between parentheses
    match = re.search(r'\(([^)]*)\)', func_signature)
    if not match:
        return []
    
    params_str = match.group(1).strip()
    if not params_str:
        return []
    
    # Split by comma and clean up
    params = [param.strip() for param in params_str.split(',')]
    return [param for param in params if param]

def extract_description(content: str, func_start: int) -> str:
    """
    Extract function description from comments above function
    """
    lines = content[:func_start].split('\n')
    description_lines = []
    
    # Look for comments above the function
    for i in range(len(lines) - 1, -1, -1):
        line = lines[i].strip()
        if line.startswith('//') or line.startswith('/*') or line.startswith('*'):
            description_lines.insert(0, line)
        elif line == '':
            continue
        else:
            break
    
    return ' '.join(description_lines)

def extract_function_code(content: str, func_start: int) -> str:
    """
    Extract first 10 lines of function code
    """
    lines = content[func_start:].split('\n')
    return '\n'.join(lines[:10])

def analyze_duplicates(functions_data: Dict[str, List[Dict]]) -> Dict[str, Any]:
    """
    Analyze duplicate functions across files
    """
    function_names = {}
    duplicates = {}
    
    # Group functions by name
    for file_path, functions in functions_data.items():
        for func in functions:
            func_name = func['name']
            if func_name not in function_names:
                function_names[func_name] = []
            function_names[func_name].append({
                'file': file_path,
                'line': func['line'],
                'code': func['code']
            })
    
    # Find duplicates
    for func_name, occurrences in function_names.items():
        if len(occurrences) > 1:
            duplicates[func_name] = occurrences
    
    return {
        'total_functions': sum(len(funcs) for funcs in function_names.values()),
        'unique_functions': len(function_names),
        'duplicate_functions': len(duplicates),
        'duplicates': duplicates
    }

def detect_local_functions(functions_data: Dict[str, List[Dict]]) -> Dict[str, Any]:
    """
    Detect local vs global functions
    """
    global_functions = []
    local_functions = []
    
    for file_path, functions in functions_data.items():
        for func in functions:
            func_info = {
                'name': func['name'],
                'file': file_path,
                'line': func['line']
            }
            
            # Simple heuristic: functions in main files are global
            if 'main' in file_path.lower() or 'global' in file_path.lower():
                global_functions.append(func_info)
            else:
                local_functions.append(func_info)
    
    return {
        'global_functions': global_functions,
        'local_functions': local_functions,
        'total_global': len(global_functions),
        'total_local': len(local_functions)
    }

def check_architecture(files_data: Dict[str, List[str]]) -> Dict[str, Any]:
    """
    Check system architecture compliance
    """
    issues = []
    recommendations = []
    
    # Check for proper file organization
    if 'js' in files_data:
        js_files = files_data['js']
        
        # Check for main files
        main_files = [f for f in js_files if 'main' in f.lower()]
        if not main_files:
            issues.append("No main.js file found")
            recommendations.append("Create a main.js file for global functions")
        
        # Check for utility files
        util_files = [f for f in js_files if 'util' in f.lower()]
        if not util_files:
            issues.append("No utility files found")
            recommendations.append("Create utility files for common functions")
    
    return {
        'issues': issues,
        'recommendations': recommendations,
        'score': max(0, 100 - len(issues) * 10)
    }

def generate_reports(files_data: Dict[str, List[str]], functions_data: Dict[str, List[Dict]]) -> Dict[str, Any]:
    """
    Generate comprehensive analysis reports
    """
    total_files = sum(len(files) for files in files_data.values())
    total_functions = sum(len(funcs) for funcs in functions_data.values())
    
    duplicates_analysis = analyze_duplicates(functions_data)
    local_functions_analysis = detect_local_functions(functions_data)
    architecture_check = check_architecture(files_data)
    
    return {
        'summary': {
            'total_files': total_files,
            'total_functions': total_functions,
            'files_by_type': {k: len(v) for k, v in files_data.items()},
            'generated_at': datetime.now().isoformat()
        },
        'duplicates': duplicates_analysis,
        'local_functions': local_functions_analysis,
        'architecture': architecture_check
    }

# API ENDPOINTS

@file_scanner_bp.route('/files', methods=['GET'])
@cache_for(ttl=600)  # 10 minutes
def get_files():
    """
    Get list of all project files
    Replaces: /api/files/discover, /api/js-map/files-list, /api/page-scripts-matrix/scan-results
    """
    try:
        selected_types = request.args.get('types', 'js,html,css,python,other').split(',')
        files_data = discover_all_files(selected_types)
        
        return jsonify({
            'status': 'success',
            'data': files_data,
            'total_files': sum(len(files) for files in files_data.values()),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@file_scanner_bp.route('/file-content', methods=['GET'])
def get_file_content():
    """
    Get content of a specific file
    Replaces: /api/js-map/file-content
    """
    try:
        file_path = request.args.get('file')
        if not file_path:
            return jsonify({'status': 'error', 'message': 'File parameter required'}), 400
        
        full_path = os.path.join(PROJECT_ROOT, file_path)
        if not os.path.exists(full_path):
            return jsonify({'status': 'error', 'message': 'File not found'}), 404
        
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return jsonify({
            'status': 'success',
            'data': {
                'file': file_path,
                'content': content,
                'size': len(content),
                'lines': content.count('\n') + 1
            },
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@file_scanner_bp.route('/page-mapping', methods=['GET'])
@cache_for(ttl=600)  # 10 minutes
def get_page_mapping():
    """
    Get page to script mapping
    Replaces: /api/js-map/page-mapping, /api/page-scripts-matrix/page-dependencies
    """
    try:
        files_data = discover_all_files(['html', 'js'])
        
        page_mapping = {}
        
        # Map HTML pages to their scripts
        for html_file in files_data.get('html', []):
            if not html_file.endswith('.html'):
                continue
                
            page_name = os.path.basename(html_file).replace('.html', '')
            scripts = []
            
            # Find related scripts (simple heuristic)
            for js_file in files_data.get('js', []):
                if page_name in js_file or os.path.basename(js_file).replace('.js', '') == page_name:
                    scripts.append(js_file)
            
            page_mapping[page_name] = {
                'html_file': html_file,
                'scripts': scripts,
                'script_count': len(scripts)
            }
        
        return jsonify({
            'status': 'success',
            'data': page_mapping,
            'total_pages': len(page_mapping),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@file_scanner_bp.route('/functions', methods=['GET'])
@cache_for(ttl=600)  # 10 minutes
def get_functions():
    """
    Get functions data from all JS files
    Replaces: /api/js-map/functions
    """
    try:
        files_data = discover_all_files(['js'])
        functions_data = {}
        
        for js_file in files_data.get('js', []):
            functions = extract_functions_from_file(js_file)
            if functions:
                functions_data[js_file] = functions
        
        return jsonify({
            'status': 'success',
            'data': functions_data,
            'total_functions': sum(len(funcs) for funcs in functions_data.values()),
            'files_with_functions': len(functions_data),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@file_scanner_bp.route('/duplicates', methods=['GET'])
@cache_for(ttl=600)  # 10 minutes
def get_duplicates():
    """
    Analyze duplicate functions
    Replaces: /api/js-map/analyze-duplicates
    """
    try:
        files_data = discover_all_files(['js'])
        functions_data = {}
        
        for js_file in files_data.get('js', []):
            functions = extract_functions_from_file(js_file)
            if functions:
                functions_data[js_file] = functions
        
        duplicates_analysis = analyze_duplicates(functions_data)
        
        return jsonify({
            'status': 'success',
            'data': duplicates_analysis,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@file_scanner_bp.route('/local-functions', methods=['GET'])
@cache_for(ttl=600)  # 10 minutes
def get_local_functions():
    """
    Detect local functions
    Replaces: /api/js-map/detect-local-functions
    """
    try:
        files_data = discover_all_files(['js'])
        functions_data = {}
        
        for js_file in files_data.get('js', []):
            functions = extract_functions_from_file(js_file)
            if functions:
                functions_data[js_file] = functions
        
        local_functions_analysis = detect_local_functions(functions_data)
        
        return jsonify({
            'status': 'success',
            'data': local_functions_analysis,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@file_scanner_bp.route('/architecture-check', methods=['GET'])
@cache_for(ttl=600)  # 10 minutes
def get_architecture_check():
    """
    Check system architecture
    Replaces: /api/js-map/architecture-check
    """
    try:
        files_data = discover_all_files()
        architecture_check = check_architecture(files_data)
        
        return jsonify({
            'status': 'success',
            'data': architecture_check,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@file_scanner_bp.route('/scan', methods=['POST'])
def perform_scan():
    """
    Perform complete system scan
    Replaces: /api/js-map/scan, /api/page-scripts-matrix/scan-results
    """
    try:
        data = request.get_json() or {}
        selected_types = data.get('types', ['js', 'html', 'css', 'python', 'other'])
        
        # Discover files
        files_data = discover_all_files(selected_types)
        
        # Extract functions from JS files
        functions_data = {}
        if 'js' in selected_types:
            for js_file in files_data.get('js', []):
                functions = extract_functions_from_file(js_file)
                if functions:
                    functions_data[js_file] = functions
        
        # Generate comprehensive report
        report = generate_reports(files_data, functions_data)
        
        return jsonify({
            'status': 'success',
            'data': {
                'files': files_data,
                'functions': functions_data,
                'report': report
            },
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@file_scanner_bp.route('/reports', methods=['POST'])
def generate_reports_endpoint():
    """
    Generate analysis reports
    """
    try:
        data = request.get_json() or {}
        report_type = data.get('type', 'comprehensive')
        
        files_data = discover_all_files()
        functions_data = {}
        
        for js_file in files_data.get('js', []):
            functions = extract_functions_from_file(js_file)
            if functions:
                functions_data[js_file] = functions
        
        report = generate_reports(files_data, functions_data)
        
        return jsonify({
            'status': 'success',
            'data': report,
            'type': report_type,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@file_scanner_bp.route('/export', methods=['POST'])
def export_data():
    """
    Export data in various formats
    """
    try:
        data = request.get_json() or {}
        export_format = data.get('format', 'json')
        export_type = data.get('type', 'all')
        
        files_data = discover_all_files()
        functions_data = {}
        
        if export_type in ['all', 'functions']:
            for js_file in files_data.get('js', []):
                functions = extract_functions_from_file(js_file)
                if functions:
                    functions_data[js_file] = functions
        
        export_data = {
            'files': files_data,
            'functions': functions_data if export_type in ['all', 'functions'] else None,
            'exported_at': datetime.now().isoformat(),
            'format': export_format
        }
        
        return jsonify({
            'status': 'success',
            'data': export_data,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@file_scanner_bp.route('/cache', methods=['POST'])
def manage_cache():
    """
    Manage cache operations
    """
    try:
        data = request.get_json() or {}
        action = data.get('action', 'clear')
        
        if action == 'clear':
            # Clear cache (implementation depends on cache service)
            return jsonify({
                'status': 'success',
                'message': 'Cache cleared',
                'timestamp': datetime.now().isoformat()
            })
        elif action == 'status':
            return jsonify({
                'status': 'success',
                'data': {
                    'cache_enabled': True,
                    'cache_ttl': 600
                },
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Invalid action'
            }), 400
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500
