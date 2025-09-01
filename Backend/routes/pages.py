from flask import Blueprint, send_from_directory, request
from config.settings import UI_DIR
import os
from typing import Any

# Create Blueprint
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

@pages_bp.route('/page-scripts-matrix')
def page_scripts_matrix() -> Any:
    """Page scripts matrix page"""
    return send_from_directory(UI_DIR, "page-scripts-matrix.html")





@pages_bp.route('/test-header-only')
def test_header_only() -> Any:
    """Test header only page"""
    return send_from_directory(UI_DIR, "test-header-only.html")

@pages_bp.route('/external-data-test')
def external_data_test() -> Any:
    """External data integration test page"""
    return send_from_directory(UI_DIR / "external_data_integration_client/pages", "test_external_data.html")

@pages_bp.route('/models-test')
def models_test() -> Any:
    """Models test page"""
    return send_from_directory(UI_DIR / "external_data_integration_client/pages", "test_models.html")

@pages_bp.route('/system-stats-test')
def system_stats_test() -> Any:
    """System statistics test page"""
    return send_from_directory(UI_DIR / "external_data_integration_client/pages", "test_system_stats.html")

@pages_bp.route('/api-test')
def api_test() -> Any:
    """API test page"""
    return send_from_directory(UI_DIR / "external_data_integration_client/pages", "test_api.html")

@pages_bp.route('/performance-test')
def performance_test() -> Any:
    """Performance test page"""
    return send_from_directory(UI_DIR / "external_data_integration_client/pages", "test_performance.html")

@pages_bp.route('/integration-test')
def integration_test() -> Any:
    """Integration test page"""
    return send_from_directory(UI_DIR / "external_data_integration_client/pages", "test_integration.html")

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

@pages_bp.route('/external_data_integration_client/styles/<path:filename>')
def external_data_styles_files(filename: str) -> Any:
    """External data integration CSS files"""
    return send_from_directory(UI_DIR / "external_data_integration_client/styles", filename)

@pages_bp.route('/external_data_integration_client/scripts/<path:filename>')
def external_data_scripts_files(filename: str) -> Any:
    """External data integration JavaScript files"""
    return send_from_directory(UI_DIR / "external_data_integration_client/scripts", filename)
