from flask import Blueprint, send_from_directory, request, make_response, send_file
from config.settings import UI_DIR
import os
import mimetypes
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
    """Trading Accounts page"""
    return send_from_directory(UI_DIR, "trading_accounts.html")

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

@pages_bp.route('/data_import')
def data_import() -> Any:
    """Data import page"""
    return send_from_directory(UI_DIR, "data_import.html")



@pages_bp.route('/designs')
def designs() -> Any:
    """Designs page"""
    return send_from_directory(UI_DIR, "designs.html")

@pages_bp.route('/db_extradata')
def db_extradata() -> Any:
    """Extra data tables page"""
    return send_from_directory(UI_DIR, "db_extradata.html")

@pages_bp.route('/currencies')
def currencies() -> Any:
    """Currencies page"""
    return send_from_directory(UI_DIR, "currencies.html")

@pages_bp.route('/preferences')
def preferences() -> Any:
    """Preferences page"""
    return send_from_directory(UI_DIR, "preferences.html")

@pages_bp.route('/ai-analysis')
def ai_analysis() -> Any:
    """AI Analysis page"""
    return send_from_directory(UI_DIR, "ai-analysis.html")

@pages_bp.route('/trading-ui/ai-analysis.html')
def ai_analysis_old() -> Any:
    """AI Analysis page - redirect from old URL"""
    from flask import redirect
    return redirect('/ai-analysis', code=301)

@pages_bp.route('/tag-management')
def tag_management() -> Any:
    """Tag management page"""
    return send_from_directory(UI_DIR, "tag-management.html")

@pages_bp.route('/preferences-new')
def preferences_new() -> Any:
    """New preferences page"""
    return send_from_directory(UI_DIR, "preferences-new.html")

@pages_bp.route('/external-data-dashboard')
def external_data_dashboard() -> Any:
    """External Data Dashboard page"""
    return send_from_directory(UI_DIR, "external-data-dashboard.html")

@pages_bp.route('/constraints')
def constraints() -> Any:
    """Constraints management page"""
    return send_from_directory(UI_DIR, "constraints.html")

@pages_bp.route('/test-header-only')
def test_header_only() -> Any:
    """Test header only page"""
    return send_from_directory(UI_DIR, "test-header-only.html")

@pages_bp.route('/linter-realtime-monitor')
def linter_realtime_monitor() -> Any:
    """Linter realtime monitor page"""
    return send_from_directory(UI_DIR, "linter-realtime-monitor.html")

@pages_bp.route('/chart-management')
def chart_management() -> Any:
    """Chart management page"""
    return send_from_directory(UI_DIR, "chart-management.html")



# Old external data test routes removed - now using /system-test-center

@pages_bp.route('/styles/<path:filename>')
def styles_files(filename: str) -> Any:
    """CSS files"""
    response = send_from_directory(UI_DIR / "styles", filename)
    
    # Add cache control headers for CSS files
    if filename.endswith('.css'):
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    
    return response

@pages_bp.route('/styles-new/<path:filename>')
def styles_new_files(filename: str) -> Any:
    """New CSS architecture files"""
    response = send_from_directory(UI_DIR / "styles-new", filename)
    
    # Add cache control headers for CSS files
    if filename.endswith('.css'):
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    
    return response

@pages_bp.route('/scripts/<path:filename>')
def scripts_files(filename: str) -> Any:
    """JavaScript files"""
    response = send_from_directory(UI_DIR / "scripts", filename)
    
    # Add cache control headers for JavaScript files
    if filename.endswith('.js'):
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    
    return response

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

# Catch-all route must be LAST to avoid interfering with specific routes
@pages_bp.route('/<path:filename>')
def static_files(filename: str) -> Any:
    """Static files"""
    # Block access to deprecated routes
    if filename in ['linter-dashboard-demo', 'create_linter_dashboard']:
        from flask import abort
        abort(404)
    
    # Block access to deprecated external data test page
    if 'external_data_integration_client/pages/test_external_data' in filename:
        from flask import abort
        abort(404)
    
    # If file doesn't contain extension, try adding .html
    if '.' not in filename:
        html_file = f"{filename}.html"
        html_path = UI_DIR / html_file
        if html_path.exists():
            return send_from_directory(UI_DIR, html_file)
    
    # Otherwise, return the file as is with correct MIME type
    full_path = UI_DIR / filename
    if not full_path.exists():
        from flask import abort
        abort(404)
    
    # Guess and set MIME type explicitly to avoid JSON default
    guessed_mime, _ = mimetypes.guess_type(str(full_path))
    response = send_from_directory(UI_DIR, filename)
    if guessed_mime:
        response.mimetype = guessed_mime
    return response

# NOTE: Cache headers are now handled by ResponseOptimizer in app.py
# This removes duplication and ensures consistent cache control headers
# ResponseOptimizer handles /scripts/ and /styles/ paths with no-cache headers
# See: Backend/utils/response_optimizer.py - determine_cache_type() and CACHE_HEADERS['api']


