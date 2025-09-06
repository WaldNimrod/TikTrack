"""
CSS Management API Routes
נתיבי API לניהול מערכת CSS
"""

from flask import Blueprint, jsonify, request
import subprocess
import os
import sys
from pathlib import Path

css_management_bp = Blueprint('css_management', __name__, url_prefix='/api/css')

@css_management_bp.route('/switch-to-old', methods=['POST'])
def switch_to_old_css():
    """מעבר למערכת CSS ישנה"""
    try:
        # הפעלת הסקריפט Python
        result = subprocess.run([
            sys.executable, 'css-toggle.py', 'old'
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            return jsonify({
                'success': True,
                'message': 'עבר למערכת CSS ישנה בהצלחה',
                'output': result.stdout
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'שגיאה במעבר למערכת CSS ישנה',
                'error': result.stderr
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'שגיאה פנימית במעבר למערכת CSS ישנה',
            'error': str(e)
        }), 500

@css_management_bp.route('/switch-to-new', methods=['POST'])
def switch_to_new_css():
    """מעבר למערכת CSS חדשה"""
    try:
        # הפעלת הסקריפט Python
        result = subprocess.run([
            sys.executable, 'css-toggle.py', 'new'
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            return jsonify({
                'success': True,
                'message': 'עבר למערכת CSS חדשה בהצלחה',
                'output': result.stdout
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'שגיאה במעבר למערכת CSS חדשה',
                'error': result.stderr
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'שגיאה פנימית במעבר למערכת CSS חדשה',
            'error': str(e)
        }), 500

@css_management_bp.route('/status', methods=['GET'])
def get_css_status():
    """קבלת סטטוס מערכת CSS נוכחית"""
    try:
        # בדיקת איזה מערכת פעילה
        trading_ui_path = Path('trading-ui')
        html_files = list(trading_ui_path.glob('*.html'))
        
        if not html_files:
            return jsonify({
                'success': False,
                'message': 'לא נמצאו קבצי HTML'
            }), 404
        
        # בדיקת הקובץ הראשון
        first_html = html_files[0]
        with open(first_html, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'styles-new/main.css' in content:
            system = 'new'
            system_name = 'חדשה (ITCSS)'
        elif 'styles/' in content:
            system = 'old'
            system_name = 'ישנה'
        else:
            system = 'unknown'
            system_name = 'לא ידועה'
        
        return jsonify({
            'success': True,
            'system': system,
            'system_name': system_name,
            'message': f'מערכת CSS פעילה: {system_name}'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'שגיאה בקבלת סטטוס מערכת CSS',
            'error': str(e)
        }), 500
