"""
CSS Management API Routes
נתיבי API לניהול מערכת CSS
"""

from flask import Blueprint, jsonify, request, g
import subprocess
import os
import sys
from pathlib import Path

# Import base classes
from .base_entity import BaseEntityAPI
from .base_entity_decorators import api_endpoint, handle_database_session, validate_request
from .base_entity_utils import BaseEntityUtils

css_management_bp = Blueprint('css_management', __name__, url_prefix='/api/css')

# Initialize base API (css_management is complex, so we'll use it selectively)

@css_management_bp.route('/switch-to-old', methods=['POST'])
@api_endpoint(cache_ttl=0, rate_limit=60)
@handle_database_session()
def switch_to_old_css():
    """מעבר למערכת CSS ישנה using base API patterns"""
    try:
        # הפעלת הסקריפט Python
        # השרת רץ מתיקיית Backend, אז צריך לחזור לתיקיית הבסיס
        base_dir = Path(__file__).parent.parent.parent.parent
        css_toggle_script = base_dir / 'css-toggle.py'
        
        result = subprocess.run([
            sys.executable, str(css_toggle_script), 'old'
        ], capture_output=True, text=True, cwd=str(base_dir))
        
        if result.returncode == 0:
            return jsonify({
                'status': 'success',
                'message': 'עבר למערכת CSS ישנה בהצלחה',
                'data': {'output': result.stdout},
                'version': '1.0'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'error': {'message': 'שגיאה במעבר למערכת CSS ישנה', 'details': result.stderr},
                'version': '1.0'
            }), 500
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': {'message': 'שגיאה פנימית במעבר למערכת CSS ישנה', 'details': str(e)},
            'version': '1.0'
        }), 500

@css_management_bp.route('/switch-to-new', methods=['POST'])
def switch_to_new_css():
    """מעבר למערכת CSS חדשה"""
    try:
        # הפעלת הסקריפט Python
        # השרת רץ מתיקיית Backend, אז צריך לחזור לתיקיית הבסיס
        base_dir = Path(__file__).parent.parent.parent.parent
        css_toggle_script = base_dir / 'css-toggle.py'
        
        result = subprocess.run([
            sys.executable, str(css_toggle_script), 'new'
        ], capture_output=True, text=True, cwd=str(base_dir))
        
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
        # השרת רץ מתיקיית Backend, אז צריך לחזור לתיקיית הבסיס
        base_dir = Path(__file__).parent.parent.parent.parent
        trading_ui_path = base_dir / 'trading-ui'
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
        
        if 'dist/main.css' in content:
            # בדיקה אם dist/main.css הוא המערכת החדשה או הישנה
            # נבדוק את גודל הקובץ
            dist_css_path = trading_ui_path / 'dist' / 'main.css'
            if dist_css_path.exists():
                file_size = dist_css_path.stat().st_size
                if file_size < 100000:  # קטן מ-100KB = מערכת חדשה
                    system = 'new'
                    system_name = 'חדשה (ITCSS)'
                else:  # גדול מ-100KB = מערכת ישנה
                    system = 'old'
                    system_name = 'ישנה'
            else:
                system = 'unknown'
                system_name = 'לא ידועה'
        elif 'styles-new/main.css' in content:
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

@css_management_bp.route('/content', methods=['GET'])
def get_css_content():
    """קבלת תוכן קובץ CSS"""
    try:
        file_name = request.args.get('file')
        if not file_name:
            return jsonify({
                'success': False,
                'message': 'שם קובץ לא סופק'
            }), 400
        
        # השרת רץ מתיקיית Backend, אז צריך לחזור לתיקיית הבסיס
        base_dir = Path(__file__).parent.parent.parent.parent
        css_file_path = base_dir / 'trading-ui' / file_name
        
        if not css_file_path.exists():
            return jsonify({
                'success': False,
                'message': f'קובץ {file_name} לא נמצא'
            }), 404
        
        with open(css_file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return jsonify({
            'success': True,
            'content': content,
            'file': file_name
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'שגיאה בקריאת קובץ CSS',
            'error': str(e)
        }), 500

@css_management_bp.route('/files', methods=['GET'])
def get_css_files():
    """קבלת רשימת קבצי CSS - מתעלם מקבצי גיבוי"""
    try:
        # השרת רץ מתיקיית Backend, אז צריך לחזור לתיקיית הבסיס
        base_dir = Path(__file__).parent.parent.parent.parent
        trading_ui_dir = base_dir / 'trading-ui'
        
        if not trading_ui_dir.exists():
            return jsonify({
                'success': False,
                'message': 'תיקיית trading-ui לא נמצאה'
            }), 404
        
        css_files = []
        
        # רשימת מילות מפתח להתעלמות מקבצי גיבוי
        backup_keywords = [
            'backup', 'old', 'legacy', 'temp', 'tmp', 'test', 'demo', 
            'example', 'sample', 'copy', 'duplicate', 'archive'
        ]
        
        def should_ignore_file(file_path):
            """בדיקה אם צריך להתעלם מהקובץ"""
            file_name = file_path.name.lower()
            file_str = str(file_path).lower()
            
            # התעלמות מקבצי FontAwesome
            if 'fontawesome' in file_str or 'fontawesome' in file_name:
                return True
            
            # בדיקת מילות מפתח
            for keyword in backup_keywords:
                if keyword in file_name or keyword in file_str:
                    return True
            
            # התעלמות מתיקיות גיבוי
            for part in file_path.parts:
                if any(keyword in part.lower() for keyword in backup_keywords):
                    return True
            
            return False
        
        # סריקת styles-new (ITCSS)
        styles_new_dir = trading_ui_dir / 'styles-new'
        if styles_new_dir.exists():
            for css_file in styles_new_dir.rglob('*.css'):
                if not should_ignore_file(css_file):
                    relative_path = css_file.relative_to(styles_new_dir)
                    css_files.append(f'styles-new/{relative_path}')
        
        # סריקת FontAwesome
        fontawesome_dir = trading_ui_dir / 'images' / 'fontawesome' / 'css'
        if fontawesome_dir.exists():
            for css_file in fontawesome_dir.glob('*.css'):
                if not should_ignore_file(css_file):
                    css_files.append(f'images/fontawesome/css/{css_file.name}')
        
        # סריקת External Data
        external_dir = trading_ui_dir / 'external_data_integration_client' / 'styles'
        if external_dir.exists():
            for css_file in external_dir.glob('*.css'):
                if not should_ignore_file(css_file):
                    css_files.append(f'external_data_integration_client/styles/{css_file.name}')
        
        css_files.sort()
        
        return jsonify({
            'success': True,
            'files': css_files,
            'count': len(css_files),
            'note': 'קבצי גיבוי הוסרו מהרשימה'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'שגיאה בקבלת רשימת קבצי CSS',
            'error': str(e)
        }), 500
