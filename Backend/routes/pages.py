from flask import Blueprint, send_from_directory, request, make_response, send_file
from config.settings import UI_DIR
PROJECT_ROOT = UI_DIR.parent
import os
import mimetypes
from typing import Any

# Create Blueprint
pages_bp = Blueprint('pages', __name__)


@pages_bp.route('/')
def home() -> Any:
    """Home page"""
    return send_from_directory(UI_DIR, "index.html")

@pages_bp.route('/trade_plans')
def trade_plans() -> Any:
    """Trade plans page"""
    return send_from_directory(UI_DIR, "trade_plans.html")

@pages_bp.route('/trades')
def trades() -> Any:
    """Trades tracking page"""
    return send_from_directory(UI_DIR, "trades.html")

@pages_bp.route('/watch_lists')
def watch_list() -> Any:
    """Watch list management page"""
    return send_from_directory(UI_DIR, "watch_lists.html")



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

@pages_bp.route('/strategy_analysis')
def strategy_analysis() -> Any:
    """Strategy Analysis page"""
    return send_from_directory(UI_DIR, "strategy_analysis.html")



@pages_bp.route('/cash_flows')
def cash_flows() -> Any:
    """Cash flows page"""
    return send_from_directory(UI_DIR, "cash_flows.html")

@pages_bp.route('/data_import')
def data_import() -> Any:
    """Data import page"""
    return send_from_directory(UI_DIR, "data_import.html")



@pages_bp.route('/db_extradata')
def db_extradata() -> Any:
    """Extra data tables page"""
    return send_from_directory(UI_DIR, "db_extradata.html")

@pages_bp.route('/preferences')
def preferences() -> Any:
    """Preferences page"""
    return send_from_directory(UI_DIR, "preferences.html")

@pages_bp.route('/user_profile')
def user_profile() -> Any:
    """User profile management page"""
    return send_from_directory(UI_DIR, "user_profile.html")

@pages_bp.route('/ai_analysis')
def ai_analysis() -> Any:
    """AI Analysis page"""
    return send_from_directory(UI_DIR, "ai_analysis.html")

@pages_bp.route('/tag_management')
def tag_management() -> Any:
    """Tag management page"""
    return send_from_directory(UI_DIR, "tag_management.html")

@pages_bp.route('/external_data_dashboard')
def external_data_dashboard() -> Any:
    """External Data Dashboard page"""
    return send_from_directory(UI_DIR, "external_data_dashboard.html")

@pages_bp.route('/system_management')
def system_management() -> Any:
    """System management page"""
    return send_from_directory(UI_DIR, "system_management.html")

@pages_bp.route('/trade_history')
def trade_history() -> Any:
    """Trade history page"""
    return send_from_directory(UI_DIR, "trade_history.html")

@pages_bp.route('/portfolio_state')
def portfolio_state() -> Any:
    """Portfolio state page"""
    return send_from_directory(UI_DIR, "portfolio_state.html")

@pages_bp.route('/trading_journal')
def trading_journal() -> Any:
    """Trading journal page"""
    return send_from_directory(UI_DIR, "trading_journal.html")



# Old external data test routes removed - now using /system-test-center

@pages_bp.route('/styles/<path:filename>')
def styles_files(filename: str) -> Any:
    """CSS files"""
    response = send_from_directory(UI_DIR / "styles", filename)

    # Set correct MIME types
    if filename.endswith('.css'):
        response.headers['Content-Type'] = 'text/css; charset=utf-8'
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    elif filename.endswith('.js'):
        response.headers['Content-Type'] = 'application/javascript; charset=utf-8'

    return response

@pages_bp.route('/styles-new/<path:filename>')
def styles_new_files(filename: str) -> Any:
    """New CSS architecture files"""
    import os
    # Use UI_DIR from config instead of hardcoded path
    styles_dir = UI_DIR / "styles-new"
    response = send_from_directory(str(styles_dir), filename)

    # Set correct MIME types
    if filename.endswith('.css'):
        response.headers['Content-Type'] = 'text/css; charset=utf-8'
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    elif filename.endswith('.js'):
        response.headers['Content-Type'] = 'application/javascript; charset=utf-8'

    return response

@pages_bp.route('/scripts/<path:filename>')
def scripts_files(filename: str) -> Any:
    """JavaScript files"""
    response = send_from_directory(UI_DIR / "scripts", filename)

    # Set correct MIME types
    if filename.endswith('.js'):
        response.headers['Content-Type'] = 'application/javascript'
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
    elif filename.endswith('.css'):
        response.headers['Content-Type'] = 'text/css'

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

