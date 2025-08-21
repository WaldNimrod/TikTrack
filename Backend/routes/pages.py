from flask import Blueprint, send_from_directory, request
from config.settings import UI_DIR
import os
from typing import Any

pages_bp = Blueprint('pages', __name__)

@pages_bp.route('/')
def home() -> Any:
    """Home page"""
    return send_from_directory(UI_DIR, "index.html")

@pages_bp.route('/database')
def database() -> Any:
    """Database page"""
    return send_from_directory(UI_DIR, "database.html")

@pages_bp.route('/tracking')
def tracking() -> Any:
    """Tracking page"""
    return send_from_directory(UI_DIR, "tracking.html")

@pages_bp.route('/planning')
def planning() -> Any:
    """Planning page"""
    return send_from_directory(UI_DIR, "planning.html")

@pages_bp.route('/accounts')
def accounts() -> Any:
    """Accounts page"""
    return send_from_directory(UI_DIR, "accounts.html")

@pages_bp.route('/alerts')
def alerts() -> Any:
    """Alerts page"""
    return send_from_directory(UI_DIR, "alerts.html")

@pages_bp.route('/notes')
def notes() -> Any:
    """Notes page"""
    return send_from_directory(UI_DIR, "notes.html")

@pages_bp.route('/tickers')
def tickers() -> Any:
    """Tickers page"""
    return send_from_directory(UI_DIR, "tickers.html")

@pages_bp.route('/executions')
def executions() -> Any:
    """Executions page"""
    return send_from_directory(UI_DIR, "executions.html")

@pages_bp.route('/research')
def research() -> Any:
    """Research page"""
    return send_from_directory(UI_DIR, "research.html")

@pages_bp.route('/preferences')
def preferences() -> Any:
    """Preferences page"""
    return send_from_directory(UI_DIR, "preferences.html")

@pages_bp.route('/<path:filename>')
def static_files(filename: str) -> Any:
    """Static files"""
    # If file doesn't contain extension, try adding .html
    if '.' not in filename:
        html_file = f"{filename}.html"
        html_path = UI_DIR / html_file
        if html_path.exists():
            return send_from_directory(UI_DIR, html_file)
    
    # Otherwise, return the file as is
    return send_from_directory(UI_DIR, filename)

@pages_bp.route('/styles/<path:filename>')
def styles_files(filename: str) -> Any:
    """CSS files"""
    return send_from_directory(UI_DIR / "styles", filename)

@pages_bp.route('/scripts/<path:filename>')
def scripts_files(filename: str) -> Any:
    """JavaScript files"""
    return send_from_directory(UI_DIR / "scripts", filename)

@pages_bp.route('/images/<path:filename>')
def images_files(filename: str) -> Any:
    """Image files"""
    return send_from_directory(UI_DIR / "images", filename)
