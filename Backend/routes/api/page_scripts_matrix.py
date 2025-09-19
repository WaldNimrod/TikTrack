"""
Page Scripts Matrix API Routes
מערכת API לסריקת קבצים ומיפוי עמודים לסקריפטים

@description API endpoints למערכת Page Scripts Matrix
@version 1.0.0
@since 2025-09-19
"""

import os
import glob
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request

from services.advanced_cache_service import cache_for

# יצירת Blueprint
page_scripts_matrix_bp = Blueprint('page_scripts_matrix', __name__, url_prefix='/api/page-scripts-matrix')

# הגדרות נתיבים
UI_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'trading-ui')
SCRIPTS_DIR = os.path.join(UI_DIR, 'scripts')

print(f"🔍 UI_DIR: {UI_DIR}")
print(f"🔍 SCRIPTS_DIR: {SCRIPTS_DIR}")
print(f"🔍 UI_DIR exists: {os.path.exists(UI_DIR)}")
print(f"🔍 SCRIPTS_DIR exists: {os.path.exists(SCRIPTS_DIR)}")

@page_scripts_matrix_bp.route('/scan-results', methods=['GET'])
@cache_for(ttl=600)  # 10 דקות
def get_scan_results():
    """
    קבלת תוצאות סריקת מערכת הקבצים
    מחזיר מיפוי מלא של עמודים לסקריפטים
    """
    try:
        print('🔍 Starting filesystem scan for Page Scripts Matrix...')
        
        # סריקת עמודים
        pages = scan_html_pages()
        
        # סריקת סקריפטים
        scripts = scan_js_scripts()
        
        # יצירת מטריצה
        matrix = create_scripts_matrix(pages, scripts)
        
        # חישוב מטא-דאטה
        metadata = calculate_metadata(pages, scripts, matrix)
        
        return jsonify({
            'status': 'success',
            'data': {
                'pages': pages,
                'scripts': scripts,
                'matrix': matrix,
                'metadata': metadata
            }
        })
        
    except Exception as e:
        print(f'❌ Error in get_scan_results: {e}')
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@page_scripts_matrix_bp.route('/trigger-scan', methods=['POST'])
def trigger_scan():
    """
    הפעלת סריקה חדשה של מערכת הקבצים
    """
    try:
        print('🚀 Triggering new filesystem scan...')
        
        # ביצוע סריקה
        result = get_scan_results()
        
        if result[1] == 200:  # הצלחה
            return jsonify({
                'status': 'success',
                'message': 'Filesystem scan completed successfully',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Scan failed',
                'error': result[0].get_json()['error']
            }), 500
            
    except Exception as e:
        print(f'❌ Error in trigger_scan: {e}')
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@page_scripts_matrix_bp.route('/page-dependencies/<page_name>', methods=['GET'])
def get_page_dependencies(page_name: str):
    """
    קבלת תלויות ספציפיות של עמוד
    """
    try:
        page_path = os.path.join(UI_DIR, page_name)
        
        if not os.path.exists(page_path):
            return jsonify({
                'status': 'error',
                'error': f'Page {page_name} not found'
            }), 404
        
        # ניתוח תלויות העמוד
        dependencies = analyze_page_dependencies(page_path)
        
        return jsonify({
            'status': 'success',
            'data': {
                'page': page_name,
                'dependencies': dependencies
            }
        })
        
    except Exception as e:
        print(f'❌ Error in get_page_dependencies: {e}')
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

@page_scripts_matrix_bp.route('/script-usage/<script_name>', methods=['GET'])
def get_script_usage(script_name: str):
    """
    קבלת שימוש בסקריפט ספציפי
    """
    try:
        script_path = os.path.join(SCRIPTS_DIR, script_name)
        
        if not os.path.exists(script_path):
            return jsonify({
                'status': 'error',
                'error': f'Script {script_name} not found'
            }), 404
        
        # ניתוח שימוש בסקריפט
        usage = analyze_script_usage(script_name)
        
        return jsonify({
            'status': 'success',
            'data': {
                'script': script_name,
                'usage': usage
            }
        })
        
    except Exception as e:
        print(f'❌ Error in get_script_usage: {e}')
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

def scan_html_pages() -> List[Dict[str, Any]]:
    """
    סריקת כל עמודי HTML
    """
    pages = []
    
    # חיפוש קבצי HTML
    html_files = glob.glob(os.path.join(UI_DIR, '*.html'))
    
    for html_file in html_files:
        page_name = os.path.basename(html_file)
        
        # ניתוח העמוד
        page_info = analyze_html_page(html_file)
        
        pages.append({
            'name': page_name,
            'path': html_file,
            'scripts': page_info['scripts'],
            'css_files': page_info['css_files'],
            'last_modified': datetime.fromtimestamp(os.path.getmtime(html_file)).isoformat(),
            'size': os.path.getsize(html_file)
        })
    
    return pages

def scan_js_scripts() -> List[Dict[str, Any]]:
    """
    סריקת כל קבצי JavaScript
    """
    scripts = []
    
    # חיפוש קבצי JS
    js_files = glob.glob(os.path.join(SCRIPTS_DIR, '*.js'))
    
    for js_file in js_files:
        script_name = os.path.basename(js_file)
        
        # ניתוח הסקריפט
        script_info = analyze_js_script(js_file)
        
        scripts.append({
            'name': script_name,
            'path': js_file,
            'functions': script_info['functions'],
            'dependencies': script_info['dependencies'],
            'last_modified': datetime.fromtimestamp(os.path.getmtime(js_file)).isoformat(),
            'size': os.path.getsize(js_file),
            'line_count': script_info['line_count']
        })
    
    return scripts

def analyze_html_page(html_file: str) -> Dict[str, Any]:
    """
    ניתוח עמוד HTML
    """
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        scripts = []
        css_files = []
        
        # חיפוש סקריפטים
        import re
        script_pattern = r'<script[^>]*src=["\']([^"\']+)["\'][^>]*>'
        script_matches = re.findall(script_pattern, content)
        
        for script in script_matches:
            if script.startswith('scripts/'):
                scripts.append(script.replace('scripts/', ''))
        
        # חיפוש קבצי CSS
        css_pattern = r'<link[^>]*href=["\']([^"\']+\.css[^"\']*)["\'][^>]*>'
        css_matches = re.findall(css_pattern, content)
        
        for css in css_matches:
            if css.startswith('styles-new/'):
                css_files.append(css)
        
        return {
            'scripts': scripts,
            'css_files': css_files
        }
        
    except Exception as e:
        print(f'❌ Error analyzing HTML page {html_file}: {e}')
        return {
            'scripts': [],
            'css_files': []
        }

def analyze_js_script(js_file: str) -> Dict[str, Any]:
    """
    ניתוח קובץ JavaScript
    """
    try:
        with open(js_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        functions = []
        dependencies = []
        
        # חיפוש פונקציות
        import re
        function_pattern = r'function\s+(\w+)\s*\('
        function_matches = re.findall(function_pattern, content)
        functions.extend(function_matches)
        
        # חיפוש arrow functions
        arrow_pattern = r'const\s+(\w+)\s*=\s*\('
        arrow_matches = re.findall(arrow_pattern, content)
        functions.extend(arrow_matches)
        
        # חיפוש תלויות
        import_pattern = r'import\s+.*?from\s+["\']([^"\']+)["\']'
        import_matches = re.findall(import_pattern, content)
        dependencies.extend(import_matches)
        
        # חיפוש require
        require_pattern = r'require\s*\(\s*["\']([^"\']+)["\']'
        require_matches = re.findall(require_pattern, content)
        dependencies.extend(require_matches)
        
        return {
            'functions': functions,
            'dependencies': dependencies,
            'line_count': len(content.split('\n'))
        }
        
    except Exception as e:
        print(f'❌ Error analyzing JS script {js_file}: {e}')
        return {
            'functions': [],
            'dependencies': [],
            'line_count': 0
        }

def create_scripts_matrix(pages: List[Dict], scripts: List[Dict]) -> Dict[str, Any]:
    """
    יצירת מטריצת סקריפטים
    """
    matrix = {}
    
    # יצירת מטריצה
    for page in pages:
        page_name = page['name']
        matrix[page_name] = {}
        
        for script in scripts:
            script_name = script['name']
            matrix[page_name][script_name] = script_name in page['scripts']
    
    return matrix

def calculate_metadata(pages: List[Dict], scripts: List[Dict], matrix: Dict) -> Dict[str, Any]:
    """
    חישוב מטא-דאטה
    """
    total_pages = len(pages)
    total_scripts = len(scripts)
    
    # חישוב סקריפטים בשימוש
    used_scripts = set()
    for page in pages:
        used_scripts.update(page['scripts'])
    
    unused_scripts = set(script['name'] for script in scripts) - used_scripts
    
    # חישוב עמודים ללא סקריפטים
    pages_without_scripts = [page['name'] for page in pages if not page['scripts']]
    
    return {
        'total_pages': total_pages,
        'total_scripts': total_scripts,
        'used_scripts': len(used_scripts),
        'unused_scripts': len(unused_scripts),
        'pages_without_scripts': len(pages_without_scripts),
        'last_scanned': datetime.now().isoformat(),
        'unused_scripts_list': list(unused_scripts),
        'pages_without_scripts_list': pages_without_scripts
    }

def analyze_page_dependencies(page_path: str) -> Dict[str, Any]:
    """
    ניתוח תלויות עמוד ספציפי
    """
    try:
        with open(page_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # ניתוח תלויות
        dependencies = {
            'scripts': [],
            'css_files': [],
            'external_resources': [],
            'inline_scripts': 0,
            'inline_styles': 0
        }
        
        # חיפוש סקריפטים
        import re
        script_pattern = r'<script[^>]*src=["\']([^"\']+)["\'][^>]*>'
        script_matches = re.findall(script_pattern, content)
        
        for script in script_matches:
            if script.startswith('scripts/'):
                dependencies['scripts'].append(script.replace('scripts/', ''))
            else:
                dependencies['external_resources'].append(script)
        
        # חיפוש קבצי CSS
        css_pattern = r'<link[^>]*href=["\']([^"\']+\.css[^"\']*)["\'][^>]*>'
        css_matches = re.findall(css_pattern, content)
        
        for css in css_matches:
            if css.startswith('styles-new/'):
                dependencies['css_files'].append(css)
            else:
                dependencies['external_resources'].append(css)
        
        # חיפוש סקריפטים מובנים
        inline_script_pattern = r'<script[^>]*>(?!.*src)'
        dependencies['inline_scripts'] = len(re.findall(inline_script_pattern, content, re.DOTALL))
        
        # חיפוש סגנונות מובנים
        inline_style_pattern = r'<style[^>]*>'
        dependencies['inline_styles'] = len(re.findall(inline_style_pattern, content, re.DOTALL))
        
        return dependencies
        
    except Exception as e:
        print(f'❌ Error analyzing page dependencies {page_path}: {e}')
        return {}

def analyze_script_usage(script_name: str) -> Dict[str, Any]:
    """
    ניתוח שימוש בסקריפט ספציפי
    """
    try:
        # סריקת כל העמודים
        pages = scan_html_pages()
        
        usage = {
            'pages_using_script': [],
            'total_usage_count': 0,
            'script_functions': [],
            'potential_issues': []
        }
        
        # חיפוש שימוש בסקריפט
        for page in pages:
            if script_name in page['scripts']:
                usage['pages_using_script'].append(page['name'])
                usage['total_usage_count'] += 1
        
        # ניתוח פונקציות בסקריפט
        script_path = os.path.join(SCRIPTS_DIR, script_name)
        if os.path.exists(script_path):
            script_info = analyze_js_script(script_path)
            usage['script_functions'] = script_info['functions']
        
        # זיהוי בעיות פוטנציאליות
        if usage['total_usage_count'] == 0:
            usage['potential_issues'].append('Script not used by any page')
        elif usage['total_usage_count'] > 10:
            usage['potential_issues'].append('Script used by many pages - consider optimization')
        
        return usage
        
    except Exception as e:
        print(f'❌ Error analyzing script usage {script_name}: {e}')
        return {}
