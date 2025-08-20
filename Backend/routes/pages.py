from flask import Blueprint, send_from_directory, request
from config.settings import UI_DIR
import os
from typing import Any

pages_bp = Blueprint('pages', __name__)

@pages_bp.route('/')
def home() -> Any:
    """דף הבית"""
    return send_from_directory(UI_DIR, "index.html")

@pages_bp.route('/database')
def database() -> Any:
    """דף בסיס הנתונים"""
    return send_from_directory(UI_DIR, "database.html")

@pages_bp.route('/tracking')
def tracking() -> Any:
    """דף מעקב"""
    return send_from_directory(UI_DIR, "tracking.html")

@pages_bp.route('/planning')
def planning() -> Any:
    """דף תכנון"""
    return send_from_directory(UI_DIR, "planning.html")

@pages_bp.route('/accounts')
def accounts() -> Any:
    """דף חשבונות"""
    return send_from_directory(UI_DIR, "accounts.html")

@pages_bp.route('/alerts')
def alerts() -> Any:
    """דף התראות"""
    return send_from_directory(UI_DIR, "alerts.html")

@pages_bp.route('/notes')
def notes() -> Any:
    """דף הערות"""
    return send_from_directory(UI_DIR, "notes.html")

@pages_bp.route('/tickers')
def tickers() -> Any:
    """דף טיקרים"""
    return send_from_directory(UI_DIR, "tickers-test.html")

@pages_bp.route('/research')
def research() -> Any:
    """דף מחקר"""
    return send_from_directory(UI_DIR, "research.html")

@pages_bp.route('/preferences')
def preferences() -> Any:
    """דף העדפות"""
    return send_from_directory(UI_DIR, "preferences.html")

@pages_bp.route('/<path:filename>')
def static_files(filename: str) -> Any:
    """קבצים סטטיים"""
    # אם הקובץ לא מכיל סיומת, ננסה להוסיף .html
    if '.' not in filename:
        html_file = f"{filename}.html"
        html_path = UI_DIR / html_file
        if html_path.exists():
            return send_from_directory(UI_DIR, html_file)
    
    # אחרת, נחזיר את הקובץ כמו שהוא
    return send_from_directory(UI_DIR, filename)

@pages_bp.route('/styles/<path:filename>')
def styles_files(filename: str) -> Any:
    """קבצי CSS"""
    return send_from_directory(UI_DIR / "styles", filename)

@pages_bp.route('/scripts/<path:filename>')
def scripts_files(filename: str) -> Any:
    """קבצי JavaScript"""
    return send_from_directory(UI_DIR / "scripts", filename)

@pages_bp.route('/images/<path:filename>')
def images_files(filename: str) -> Any:
    """קבצי תמונות"""
    return send_from_directory(UI_DIR / "images", filename)
