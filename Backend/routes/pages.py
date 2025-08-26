from flask import Blueprint, send_from_directory, request
from config.settings import UI_DIR
import os
from typing import Any

pages_bp = Blueprint('pages', __name__)

@pages_bp.route('/')
def home() -> Any:
    """Home page"""
    return send_from_directory(UI_DIR, "index.html")

@pages_bp.route('/db_display')
def db_display() -> Any:
    """Database display page"""
    return send_from_directory(UI_DIR, "db_display.html")

@pages_bp.route('/trade_plans')
def trade_plans() -> Any:
    """Trade plans page"""
    return send_from_directory(UI_DIR, "trade_plans.html")

@pages_bp.route('/trades')
def trades() -> Any:
    """Trades tracking page"""
    return send_from_directory(UI_DIR, "trades.html")

@pages_bp.route('/tracking')
def tracking() -> Any:
    """Tracking page - redirect to trades"""
    return send_from_directory(UI_DIR, "trades.html")

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

@pages_bp.route('/research_new')
def research_new() -> Any:
    """Research new page"""
    return send_from_directory(UI_DIR, "research_new.html")

@pages_bp.route('/cash_flows')
def cash_flows() -> Any:
    """Cash flows page"""
    return send_from_directory(UI_DIR, "cash_flows.html")



@pages_bp.route('/designs')
def designs() -> Any:
    """Designs page"""
    return send_from_directory(UI_DIR, "designs.html")

@pages_bp.route('/db_extradata')
def db_extradata() -> Any:
    """Extra data tables page"""
    return send_from_directory(UI_DIR, "db_extradata.html")

@pages_bp.route('/preferences')
def preferences() -> Any:
    """Preferences page"""
    return send_from_directory(UI_DIR, "preferences.html")

@pages_bp.route('/constraints')
def constraints() -> Any:
    """Constraints management page"""
    return send_from_directory(UI_DIR, "constraints.html")

@pages_bp.route('/js-map')
def js_map() -> Any:
    """JS Map page"""
    return send_from_directory(UI_DIR, "js-map.html")

@pages_bp.route('/test_crud')
def test_crud() -> Any:
    """CRUD test page"""
    return send_from_directory(UI_DIR, "test_crud.html")

@pages_bp.route('/test_api')
def test_api() -> Any:
    """API test page"""
    return send_from_directory(UI_DIR, "test_api.html")

@pages_bp.route('/test_security')
def test_security() -> Any:
    """Security test page"""
    return send_from_directory(UI_DIR, "test_security.html")

@pages_bp.route('/tests')
def tests() -> Any:
    """Tests page"""
    return send_from_directory(UI_DIR, "tests.html")



@pages_bp.route('/test-header-only')
def test_header_only() -> Any:
    """Test header only page"""
    return send_from_directory(UI_DIR, "test-header-only.html")

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
