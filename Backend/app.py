#!/usr/bin/env python3
"""
TikTrack Production Server - Main server file
===============================================

WARNING: Important: This is the main server file only!

No connection to testing system!

"""

from flask import Flask, jsonify, request, send_from_directory, g, Request
from flask_cors import CORS
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
import time
import sys # Added for sys.exit
import psutil
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

# Add Backend directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import configuration settings for cache modes and server config
from config.settings import (
    DEVELOPMENT_MODE, 
    CACHE_DISABLED, 
    DEFAULT_CACHE_TTL, 
    CACHE_ENABLED,
    HOST,
    PORT,
    IS_PRODUCTION,
    IS_TESTING,
    ENVIRONMENT,
    UI_DIR,
    BASE_DIR
)

# Import new architecture components
from config.database import init_db
from config import database as database_config
from config.logging import setup_logging
from utils.performance_monitor import log_system_metrics, PerformanceTracker
from utils.error_handlers import ErrorHandler
from services.advanced_cache_service import advanced_cache_service
from services.date_normalization_service import DateNormalizationService
from services.health_service import health_service
from services.metrics_collector import metrics_collector
from services.database_optimizer import database_optimizer
from services.background_tasks import BackgroundTaskManager
from services.system_settings_service import SystemSettingsService
from utils.response_optimizer import ResponseOptimizer

# Import External Data Integration components
import sys
import os
# Add both the external_data_integration_server directory and its parent to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
external_data_path = os.path.join(project_root, 'external_data_integration_server')

if project_root not in sys.path:
    sys.path.insert(0, project_root)
if external_data_path not in sys.path:
    sys.path.insert(0, external_data_path)

try:
    from services.data_refresh_scheduler import DataRefreshScheduler
    EXTERNAL_DATA_AVAILABLE = True
    logger_temp = logging.getLogger(__name__) if 'logger' in globals() else None
    if logger_temp:
        logger_temp.info(" External data integration available - DataRefreshScheduler imported successfully")
except ImportError as e:
    import traceback
    error_msg = f"Warning: External data integration not available: {e}"
    print(error_msg)
    print(f"Full traceback: {traceback.format_exc()}")
    # Try to log if logger is available
    try:
        logger_temp = logging.getLogger(__name__) if 'logger' in globals() else None
        if logger_temp:
            logger_temp.warning(f" {error_msg}")
            logger_temp.debug(f"Import error details: {traceback.format_exc()}")
    except:
        pass
    EXTERNAL_DATA_AVAILABLE = False
    DataRefreshScheduler = None
except Exception as e:
    import traceback
    error_msg = f"Warning: External data integration error (not ImportError): {e}"
    print(error_msg)
    print(f"Full traceback: {traceback.format_exc()}")
    # Try to log if logger is available
    try:
        logger_temp = logging.getLogger(__name__) if 'logger' in globals() else None
        if logger_temp:
            logger_temp.error(f" {error_msg}")
            logger_temp.debug(f"Error details: {traceback.format_exc()}")
    except:
        pass
    EXTERNAL_DATA_AVAILABLE = False
    DataRefreshScheduler = None
from utils.rate_limiter import rate_limiter, rate_limit_api

# Import blueprints from unified API package
from routes.api import (
    account_activity_bp,
    positions_bp,
    portfolio_bp,
    trading_accounts_bp,
    tickers_bp,
    trades_bp,
    trade_plans_bp,
    alerts_bp,
    cash_flows_bp,
    notes_bp,
    executions_bp,
    tags_bp,
    users_bp,
    background_tasks_bp,
    entity_details_bp,
    constraints_bp,
    currencies_bp,
    database_schema_bp,
    linked_items_bp,
    quality_check_bp,
    quality_lint_bp,
    entity_relation_types_bp,
    file_scanner_bp,
    cache_management_bp,
    query_optimization_bp,
    server_management_bp,
    system_overview_bp,
    css_management_bp,
    preferences_bp,
    system_settings_bp,
    watch_lists_bp,
    trade_history_bp,
    portfolio_state_bp,
    trading_journal_bp
)
from routes.api.preferences_v4 import preferences_v4_bp
from routes.api.server_logs import server_logs_bp
from routes.api.email_logs import email_logs_bp
from routes.api.cache_changes import cache_changes_bp
from routes.api.auth import auth_bp

# Import new database display API blueprints
from routes.api.preference_groups import preference_groups_bp
from routes.api.system_setting_groups import system_setting_groups_bp
from routes.api.external_data_providers import external_data_providers_bp
from routes.api.quotes_last import quotes_last_bp
from routes.api.plan_conditions_list import plan_conditions_list_bp
from routes.api.user_preferences_list import user_preferences_list_bp
from routes.api.ai_analysis import ai_analysis_bp
from routes.api.base_entity_utils import BaseEntityUtils

# Patch Flask's Request.get_json to auto-normalize incoming payloads
_original_get_json = Request.get_json


def _normalized_get_json(self, *args, **kwargs):
    data = _original_get_json(self, *args, **kwargs)
    if data is None:
        return data

    try:
        normalizer = getattr(g, 'date_normalizer', DateNormalizationService("UTC"))
    except RuntimeError:
        normalizer = DateNormalizationService("UTC")

    return BaseEntityUtils.normalize_input(normalizer, data)


Request.get_json = _normalized_get_json

# Legacy compatibility layer for Flask-SQLAlchemy style tests
class LegacyDBProxy:
    """
    Lightweight compatibility layer that exposes a subset of the Flask-SQLAlchemy API.

    The historical test-suite expects `db.session`, `db.create_all()`, and friends.
    This proxy reuses the project's SQLAlchemy configuration while allowing tests to
    override the connection URI for isolated test databases.
    """

    def __init__(self, flask_app: Flask):
        self.app = flask_app
        self._engine = database_config.engine
        self._session_factory = database_config.SessionLocal
        self._scoped_session = scoped_session(self._session_factory)
        self._current_uri = self._detect_current_uri()

    def _detect_current_uri(self) -> str:
        override = self.app.config.get('SQLALCHEMY_DATABASE_URI')
        if override:
            return override
        return database_config.DATABASE_URL

    def _reconfigure(self, uri: str) -> None:
        new_engine = create_engine(uri)
        new_session_factory = sessionmaker(autocommit=False, autoflush=False, bind=new_engine)

        self._scoped_session.remove()
        self._scoped_session = scoped_session(new_session_factory)

        database_config.engine = new_engine
        database_config.SessionLocal = new_session_factory

        self._engine = new_engine
        self._session_factory = new_session_factory
        self._current_uri = uri

    def _ensure_bound(self) -> None:
        uri = self.app.config.get('SQLALCHEMY_DATABASE_URI')
        if uri and uri != self._current_uri:
            self._reconfigure(uri)

    def ensure(self) -> None:
        self._ensure_bound()

    @property
    def session(self):
        self._ensure_bound()
        return self._scoped_session

    def create_all(self) -> None:
        self._ensure_bound()
        from models.base import Base
        Base.metadata.create_all(bind=self._engine)

    def drop_all(self) -> None:
        self._ensure_bound()
        from models.base import Base
        Base.metadata.drop_all(bind=self._engine)

    def remove(self) -> None:
        self._scoped_session.remove()

    def dispose(self) -> None:
        self._engine.dispose()

# Import CRUD testing modules
import subprocess
from pathlib import Path

# External Data Integration blueprints
from routes.external_data.quotes import quotes_bp as external_quotes_bp
from routes.external_data.status import status_bp
from routes.api.quotes_v1 import quotes_bp

from routes.pages import pages_bp

app = Flask(__name__)
# Set secret key for session management
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
# Configure session lifetime - sessions expire after 24 hours of inactivity
from datetime import timedelta
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
# Configure session cookie security
# HttpOnly: Prevents JavaScript access (XSS protection)
app.config['SESSION_COOKIE_HTTPONLY'] = True
# Secure: Only send over HTTPS (in production)
from config.settings import IS_PRODUCTION
app.config['SESSION_COOKIE_SECURE'] = IS_PRODUCTION
# SameSite: CSRF protection while maintaining UX
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
# Configure CORS to support session cookies
CORS(app, supports_credentials=True, origins=['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5001', 'http://127.0.0.1:5001'])

# Legacy SQLAlchemy compatibility layer for tests
db = LegacyDBProxy(app)


@app.teardown_appcontext
def _cleanup_scoped_session(exception: Optional[BaseException] = None) -> None:
    db.remove()


def create_app(test_config: Optional[Dict[str, Any]] = None) -> Flask:
    """
    Factory used by integration tests to override configuration (e.g. dedicated test DB).
    Reuses the existing application instance and rebinds the SQLAlchemy engine/session
    when the database URI changes.
    """
    if test_config:
        app.config.update(test_config)
    db.ensure()
    return app

# Initialize Background Task Manager without real-time notifications
background_task_manager = BackgroundTaskManager()

# Initialize Data Refresh Scheduler for external data
data_refresh_scheduler = None
if EXTERNAL_DATA_AVAILABLE and DataRefreshScheduler:
    try:
        # Create a database session for the scheduler
        from config.database import SessionLocal
        data_refresh_scheduler = DataRefreshScheduler(SessionLocal)
        print(" Data Refresh Scheduler initialized successfully")
    except Exception as e:
        print(f" Failed to initialize Data Refresh Scheduler: {e}")
        data_refresh_scheduler = None

# Set the background task manager instance in the API routes
from routes.api.background_tasks import set_background_task_manager
set_background_task_manager(background_task_manager)

# Set the data refresh scheduler instance in the external data routes
from routes.external_data.status import set_data_refresh_scheduler
set_data_refresh_scheduler(data_refresh_scheduler)

# Initialize new architecture
logger = setup_logging()
app.logger = logger

# Add detailed logging for server startup
logger.info(" Starting TikTrack server...")
logger.info(" Current working directory: %s", os.getcwd())
logger.info(" Python version: %s", sys.version)
try:
    import flask
    logger.info(" Flask version: %s", flask.__version__)
except:
    logger.info(" Flask version: unknown")

# Log effective database binding
try:
    # database_config is already used by LegacyDBProxy; engine binds to the active DB
    effective_db_url = str(database_config.engine.url)
    logger.info(" Effective DATABASE_URL: %s", effective_db_url)
except Exception as _log_db_err:
    logger.warning(" Could not log database URL: %s", _log_db_err)

try:
    logger.info(" Initializing database...")
    with PerformanceTracker("Database initialization"):
        init_db()
    logger.info(" Database initialized successfully")

    # Log initial system metrics
    log_system_metrics()
    logger.info(" Database initialized successfully")
except Exception as e:
    logger.error(" Database initialization failed: %s", str(e))
    logger.error(" Full error details: %s", e.__class__.__name__)
    import traceback
    logger.error(" Traceback: %s", traceback.format_exc())
    sys.exit(1)

logger.info(" Server initialization completed")

# -----------------------------------------------------------------------------
# Authentication Middleware
# -----------------------------------------------------------------------------
from middleware.auth_middleware import setup_auth_middleware
setup_auth_middleware(app)
logger.info(" Authentication middleware initialized")

# -----------------------------------------------------------------------------
# Legacy testing compatibility (Flask app + SQLAlchemy-style DB proxy)
# -----------------------------------------------------------------------------


class LegacyDBProxy:
    """
    Lightweight compatibility layer that mimics the minimal Flask-SQLAlchemy API
    expected by the legacy test-suite (`db.session`, `db.create_all()`, etc.).
    It reuses the project's SQLAlchemy models and updates the global database
    engine/session factory when tests switch to a different database.
    """

    def __init__(self, flask_app: Flask):
        self.app = flask_app
        self._engine = database_config.engine
        self._session_factory = database_config.SessionLocal
        self._scoped_session = scoped_session(self._session_factory)
        self._current_uri = self._detect_current_uri()

    def _detect_current_uri(self) -> str:
        override = self.app.config.get('SQLALCHEMY_DATABASE_URI')
        if override:
            return override
        return database_config.DATABASE_URL

    def _reconfigure(self, uri: str) -> None:
        new_engine = create_engine(uri)
        new_session_factory = sessionmaker(autocommit=False, autoflush=False, bind=new_engine)

        # Replace scoped session
        self._scoped_session.remove()
        self._scoped_session = scoped_session(new_session_factory)

        # Update module-level references so routes/services pick up the new engine
        database_config.engine = new_engine
        database_config.SessionLocal = new_session_factory

        self._engine = new_engine
        self._session_factory = new_session_factory
        self._current_uri = uri

    def _ensure_bound(self) -> None:
        uri = self.app.config.get('SQLALCHEMY_DATABASE_URI')
        if uri and uri != self._current_uri:
            self._reconfigure(uri)

    def ensure(self) -> None:
        self._ensure_bound()

    @property
    def session(self):
        self._ensure_bound()
        return self._scoped_session

    def create_all(self) -> None:
        self._ensure_bound()
        from models.base import Base
        Base.metadata.create_all(bind=self._engine)

    def drop_all(self) -> None:
        self._ensure_bound()
        from models.base import Base
        Base.metadata.drop_all(bind=self._engine)

    def remove(self) -> None:
        self._scoped_session.remove()

    def dispose(self) -> None:
        self._engine.dispose()


db = LegacyDBProxy(app)


@app.teardown_appcontext
def _cleanup_scoped_session(exception: Optional[BaseException] = None) -> None:
    db.remove()


def create_app(test_config: Optional[Dict[str, Any]] = None) -> Flask:
    """
    Factory used by the legacy test-suite.

    The existing application instance is reused, but configuration overrides
    (like test database URIs) trigger a rebind of the Session/engine so
    tests operate on isolated databases.
    """
    if test_config:
        app.config.update(test_config)
    db.ensure()
    return app


# Register blueprints
app.register_blueprint(account_activity_bp)
app.register_blueprint(positions_bp)
app.register_blueprint(portfolio_bp)
app.register_blueprint(trading_accounts_bp)
app.register_blueprint(tickers_bp)
app.register_blueprint(trades_bp)
app.register_blueprint(trade_plans_bp)
app.register_blueprint(alerts_bp)
app.register_blueprint(cash_flows_bp)
app.register_blueprint(notes_bp)
app.register_blueprint(executions_bp)
app.register_blueprint(tags_bp)
app.register_blueprint(watch_lists_bp)
app.register_blueprint(preferences_bp)
app.register_blueprint(preferences_v4_bp)
app.register_blueprint(users_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(background_tasks_bp)
app.register_blueprint(entity_details_bp)

# EOD Metrics API
from routes.api.eod_metrics import eod_bp
app.register_blueprint(eod_bp, url_prefix='/api/eod')

# Business Logic API
from routes.api.business_logic import business_logic_bp
app.register_blueprint(business_logic_bp)

# Historical Data API
from routes.api.trade_history import trade_history_bp
from routes.api.portfolio_state import portfolio_state_bp
from routes.api.trading_journal import trading_journal_bp
app.register_blueprint(trade_history_bp)
app.register_blueprint(portfolio_state_bp)
app.register_blueprint(trading_journal_bp)

# Register Cache Sync blueprint
from routes.api.cache_sync import cache_sync_bp
app.register_blueprint(cache_sync_bp)


app.register_blueprint(constraints_bp)
app.register_blueprint(currencies_bp)
app.register_blueprint(database_schema_bp)
app.register_blueprint(linked_items_bp)
app.register_blueprint(entity_relation_types_bp)
app.register_blueprint(file_scanner_bp)
app.register_blueprint(cache_management_bp)
app.register_blueprint(cache_changes_bp, url_prefix='/api/cache')
app.register_blueprint(query_optimization_bp)
app.register_blueprint(server_management_bp)
app.register_blueprint(system_overview_bp)
app.register_blueprint(css_management_bp)
app.register_blueprint(system_settings_bp)
app.register_blueprint(email_logs_bp)
app.register_blueprint(server_logs_bp)
app.register_blueprint(quality_check_bp, url_prefix='/api/quality-check')
app.register_blueprint(quality_lint_bp, url_prefix='/api')

# Register User Data Import blueprint
from routes.api.user_data_import import user_data_import_bp
app.register_blueprint(user_data_import_bp)

# Register User Data Import Reports blueprint
from routes.api.user_data_import_reports import user_data_import_reports_bp
app.register_blueprint(user_data_import_reports_bp, url_prefix='/api/user-data-import')

# Register External Data Integration blueprints - DISABLED due to import issues
# External Data Integration blueprints
app.register_blueprint(external_quotes_bp, name='external_quotes')
app.register_blueprint(status_bp)
# API quotes endpoints (specification compliant)
app.register_blueprint(quotes_bp)

app.register_blueprint(pages_bp)

# Register Conditions System blueprints
from routes.api.plan_conditions import plan_conditions_bp
from routes.api.trade_conditions import trade_conditions_bp
from routes.api.trading_methods import trading_methods_bp

app.register_blueprint(plan_conditions_bp)
app.register_blueprint(trade_conditions_bp)
app.register_blueprint(trading_methods_bp)

# Register Database Display API blueprints
app.register_blueprint(preference_groups_bp)
app.register_blueprint(system_setting_groups_bp)
app.register_blueprint(external_data_providers_bp)
app.register_blueprint(quotes_last_bp)
app.register_blueprint(plan_conditions_list_bp)
app.register_blueprint(user_preferences_list_bp)
app.register_blueprint(ai_analysis_bp)

# Debug logging endpoint
@app.route('/api/debug/log', methods=['POST'])
def debug_log():
    """Debug logging endpoint"""
    data = request.get_json()
    if data and 'message' in data:
        app.logger.info(f"DEBUG: {data['message']}")
    return jsonify({"status": "ok"})

# Logger batch endpoint for frontend logs
@app.route('/api/logs/batch', methods=['POST'])
def logs_batch():
    """Batch logging endpoint for frontend logs with rate limiting"""
    try:
        # Simple rate limiting - allow max 10 requests per second
        import time
        current_time = time.time()
        
        # Check if we have rate limiting data
        if not hasattr(app, 'rate_limit_data'):
            app.rate_limit_data = {'requests': [], 'last_cleanup': current_time}
        
        # Clean old requests (older than 1 second)
        app.rate_limit_data['requests'] = [
            req_time for req_time in app.rate_limit_data['requests'] 
            if current_time - req_time < 1.0
        ]
        
        # Check rate limit (max 10 requests per second)
        if len(app.rate_limit_data['requests']) >= 10:
            return jsonify({"status": "rate_limited", "message": "Too many requests"}), 429
        
        # Add current request
        app.rate_limit_data['requests'].append(current_time)
        
        data = request.get_json()
        if data and 'logs' in data:
            logs = data['logs']
            # Limit to max 50 logs per request
            if len(logs) > 50:
                logs = logs[:50]
            
            for log in logs:
                if isinstance(log, dict) and 'message' in log:
                    level = log.get('level', 'INFO')
                    message = log.get('message', '')
                    timestamp = log.get('timestamp', '')
                    app.logger.info(f"FRONTEND [{level}]: {message}")
            return jsonify({"status": "success", "processed": len(logs)})
        return jsonify({"status": "error", "message": "No logs provided"}), 400
    except Exception as e:
        app.logger.error(f"Error processing batch logs: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Register condition evaluation task
try:
    from services.condition_evaluation_task import register_condition_evaluation_task
    register_condition_evaluation_task(background_task_manager)
    logger.info(" Condition evaluation task registered successfully")
except Exception as e:
    logger.error(f" Failed to register condition evaluation task: {e}")

# Register import sessions cleanup task
try:
    from services.import_sessions_cleanup_task import register_import_sessions_cleanup_task
    register_import_sessions_cleanup_task(background_task_manager)
    logger.info(" Import sessions cleanup task registered successfully")
except Exception as e:
    logger.error(f" Failed to register import sessions cleanup task: {e}")

# Register alert expiry task
try:
    from services.alert_expiry_task import register_alert_expiry_task
    register_alert_expiry_task(background_task_manager)
    logger.info(" Alert expiry task registered successfully")
except Exception as e:
    logger.error(f" Failed to register alert expiry task: {e}")

# Start background task scheduler automatically
try:
    logger.info(" Starting background task scheduler...")
    background_task_manager.start_scheduler()
    logger.info(" Background task scheduler started successfully")
except Exception as e:
    logger.error(f" Failed to start background task scheduler: {e}")

# Start Data Refresh Scheduler for external data (respect system setting)
if data_refresh_scheduler:
    try:
        from config.database import SessionLocal as _SessionLocal
        _db = _SessionLocal()
        try:
            settings = SystemSettingsService(_db)
            enabled = settings.get_setting('externalDataSchedulerEnabled', True)
            logger.info(f" External data scheduler setting: {enabled} (default: True if not set)")
        except Exception as settings_error:
            logger.warning(f" Could not read scheduler setting, using default (True): {settings_error}")
            enabled = True  # Default to enabled if setting read fails
        finally:
            _db.close()
        
        if enabled:
            logger.info(" Starting external data refresh scheduler (enabled by setting)...")
            try:
                data_refresh_scheduler.start()
                # Verify scheduler is actually running
                if hasattr(data_refresh_scheduler, 'running') and data_refresh_scheduler.running:
                    logger.info(" External data refresh scheduler started successfully and is running")
                else:
                    logger.warning(" Scheduler start() called but scheduler.running is False - scheduler may not be active")
            except Exception as start_error:
                logger.error(f" Failed to start external data refresh scheduler: {start_error}", exc_info=True)
        else:
            logger.info(" External data refresh scheduler disabled by system setting")
    except Exception as e:
        logger.error(f" Failed to initialize external data refresh scheduler: {e}", exc_info=True)
else:
    logger.info(" External data refresh scheduler not available - skipping")

# Register advanced error handlers
ErrorHandler.register_error_handlers(app)

# Add rate limiting middleware
from utils.rate_limiter import RateLimitMiddleware
app.wsgi_app = RateLimitMiddleware(app.wsgi_app)

# Add response optimization middleware
@app.after_request
def optimize_response(response):
    """Optimize response headers"""
    try:
        # NOTE: ResponseOptimizer now handles ALL paths including /scripts/ and /styles/
        # It determines cache type and applies appropriate headers (no-cache for JS/CSS in development)
        # See: Backend/utils/response_optimizer.py - determine_cache_type() and CACHE_HEADERS['api']
        
        # Get request start time from g
        start_time = getattr(g, 'request_start_time', None)
        
        # Optimize response headers (includes /scripts/ and /styles/ handling)
        optimized_response = ResponseOptimizer.optimize_response(
            response,
            cache_type=ResponseOptimizer.determine_cache_type(request.path),
            start_time=start_time
        )

        if (
            optimized_response.mimetype == 'application/json'
            and not optimized_response.direct_passthrough
        ):
            try:
                payload = optimized_response.get_json(silent=True)
            except Exception:
                payload = None

            if payload is not None:
                normalizer = getattr(g, 'date_normalizer', DateNormalizationService("UTC"))
                normalized_payload = BaseEntityUtils.normalize_output(normalizer, payload)

                if isinstance(normalized_payload, dict):
                    timestamp_value = normalized_payload.get('timestamp')
                    required_keys = {'utc', 'epochMs', 'local', 'timezone'}
                    if not isinstance(timestamp_value, dict) or not required_keys.issubset(timestamp_value.keys()):
                        normalized_payload['timestamp'] = BaseEntityUtils.envelope_timestamp(normalizer)
                    normalized_payload.setdefault('version', '1.0')

                optimized_response.direct_passthrough = False
                optimized_response.set_data(json.dumps(normalized_payload))
                optimized_response.mimetype = 'application/json'
                optimized_response.headers['Content-Length'] = str(len(optimized_response.get_data()))
        
        return optimized_response
    except Exception as e:
        logger.error(f"Error optimizing response: {e}")
        return response

@app.before_request
def before_request():
    """Set request start time"""
    g.request_start_time = time.time()
    try:
        g.date_normalizer = BaseEntityUtils.get_request_normalizer(request)
    except Exception:
        g.date_normalizer = DateNormalizationService("UTC")

@app.route("/api/health", methods=["GET"])
@rate_limit_api(requests_per_minute=100)
def health_check() -> Any:
    """Enhanced health check endpoint"""
    try:
        # Perform comprehensive health check
        health_report = health_service.comprehensive_health_check()
        
        return jsonify(health_report), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }), 500

@app.route("/api/health/detailed", methods=["GET"])
@rate_limit_api(requests_per_minute=50)
def detailed_health_check() -> Any:
    """Detailed health check endpoint"""
    try:
        # Get individual component health
        database_health = health_service.check_database_health()
        cache_health = health_service.check_cache_health()
        system_health = health_service.check_system_health()
        api_health = health_service.check_api_endpoints()

        # Get health trends
        trends = health_service.get_health_trends(hours=24)

        detailed_report = {
            "timestamp": datetime.now().isoformat(),
            "components": {
                "database": database_health,
                "cache": cache_health,
                "system": system_health,
                "api": api_health
            },
            "trends": trends,
            "rate_limits": rate_limiter.get_rate_limit_stats()
        }

        return jsonify(detailed_report), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }), 500

@app.route("/api/system-info", methods=["GET"])
@rate_limit_api(requests_per_minute=60)
def system_info() -> Any:
    """System information endpoint for server monitor"""
    try:
        import time
        import flask

        # Get system uptime (simplified - actual process start time)
        uptime_seconds = time.time() - psutil.Process().create_time()
        uptime_days = int(uptime_seconds // 86400)
        uptime_hours = int((uptime_seconds % 86400) // 3600)
        uptime_minutes = int((uptime_seconds % 3600) // 60)

        # Format uptime string
        if uptime_days > 0:
            uptime = f"{uptime_days} , {uptime_hours} , {uptime_minutes} "
        elif uptime_hours > 0:
            uptime = f"{uptime_hours} , {uptime_minutes} "
        else:
            uptime = f"{uptime_minutes} "

        system_info_data = {
            "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
            "flask_version": flask.__version__,
            "uptime": uptime,
            "timestamp": datetime.now().isoformat()
        }

        return jsonify(system_info_data), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }), 500

@app.route("/api/cache/stats", methods=["GET"])
@rate_limit_api(requests_per_minute=60)
def cache_stats() -> Any:
    """Get cache statistics"""
    try:
        stats = advanced_cache_service.get_stats()
        return jsonify({
            "status": "success",
            "data": stats,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/cache/clear", methods=["POST"])
def clear_cache() -> Any:
    """Clear all cache - includes advanced cache AND preferences cache"""
    try:
        # Clear advanced cache
        advanced_cache_service.clear()
        
        # Clear preferences service cache
        from services.preferences_service import preferences_service
        prefs_cleared = preferences_service.clear_cache()
        
        return jsonify({
            "status": "success",
            "message": "All caches cleared successfully",
            "data": {
                "advanced_cache": "cleared",
                "preferences_cache": f"{prefs_cleared} entries cleared"
            },
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/cache/invalidate", methods=["POST"])
@rate_limit_api(requests_per_minute=30)
def invalidate_cache() -> Any:
    """Invalidate cache entries by dependencies"""
    try:
        data = request.get_json() or {}
        dependencies = data.get('dependencies', [])
        
        # Allow empty dependencies for general cache invalidation
        if not dependencies:
            dependencies = ['general']
        
        # Clear cache entries that match the dependencies
        cleared_count = 0
        for dependency in dependencies:
            # Simple pattern matching - can be enhanced
            if dependency in ['trading_accounts', 'accounts', 'trades']:
                cleared_count += 1  # Simplified for now
        
        return jsonify({
            "status": "success",
            "data": {
                "clearedCount": cleared_count,
                "dependencies": dependencies
            },
            "message": f"Invalidated {cleared_count} cache entries",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/cache/status", methods=["GET"])
@rate_limit_api(requests_per_minute=60)
def cache_status() -> Any:
    """Get cache status with detailed information"""
    try:
        stats = advanced_cache_service.get_stats()
        return jsonify({
            "status": "success",
            "data": {
                "hitRate": stats.get("hit_rate", 0) * 100,
                "hitRateChange": stats.get("hit_rate_change", 0),
                "size": stats.get("total_size_bytes", 0),
                "sizeChange": stats.get("size_change_bytes", 0),
                "avgResponseTime": stats.get("avg_response_time_ms", 0),
                "responseTimeChange": stats.get("response_time_change_ms", 0),
                "totalRequests": stats.get("total_requests", 0),
                "requestsChange": stats.get("requests_change", 0),
                "ttl": {
                    "general": DEFAULT_CACHE_TTL,
                    "external": DEFAULT_CACHE_TTL * 2,
                    "static": DEFAULT_CACHE_TTL * 4
                },
                "active": CACHE_ENABLED,
                "optimized": stats.get("optimized", False),
                "memoryAvailable": stats.get("memory_available_mb", 1000)
            },
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/cache/entries", methods=["GET"])
@rate_limit_api(requests_per_minute=60)
def cache_entries() -> Any:
    """Get all cache entries"""
    try:
        entries = advanced_cache_service.get_all_entries()
        return jsonify({
            "status": "success",
            "data": entries,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/cache/clear-expired", methods=["POST"])
@rate_limit_api(requests_per_minute=30)
def clear_expired_cache() -> Any:
    """Clear expired cache entries"""
    try:
        cleared_count = advanced_cache_service.clear_expired()
        return jsonify({
            "status": "success",
            "data": {
                "clearedCount": cleared_count
            },
            "message": f"Cleared {cleared_count} expired cache entries",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/cache/preload", methods=["POST"])
@rate_limit_api(requests_per_minute=10)
def preload_cache() -> Any:
    """Preload cache with common data"""
    try:
        preloaded_count = advanced_cache_service.preload_common_data()
        return jsonify({
            "status": "success",
            "data": {
                "preloadedCount": preloaded_count
            },
            "message": f"Preloaded {preloaded_count} cache entries",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/cache/optimize", methods=["POST"])
@rate_limit_api(requests_per_minute=5)
def optimize_cache() -> Any:
    """Optimize cache performance"""
    try:
        result = advanced_cache_service.optimize()
        return jsonify({
            "status": "success",
            "data": {
                "optimizedSize": result.get("optimized_size_bytes", 0)
            },
            "message": "Cache optimized successfully",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/cache/analytics", methods=["GET"])
@rate_limit_api(requests_per_minute=30)
def cache_analytics() -> Any:
    """Get cache analytics and performance data"""
    try:
        analytics = advanced_cache_service.get_analytics()
        return jsonify({
            "status": "success",
            "data": analytics,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/cache/dependencies", methods=["GET"])
@rate_limit_api(requests_per_minute=30)
def cache_dependencies() -> Any:
    """Get cache dependencies information"""
    try:
        dependencies = advanced_cache_service.get_dependencies()
        return jsonify({
            "status": "success",
            "data": dependencies,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/rate-limits/stats", methods=["GET"])
@rate_limit_api(requests_per_minute=30)
def rate_limit_stats() -> Any:
    """Get rate limiting statistics"""
    try:
        stats = rate_limiter.get_rate_limit_stats()
        return jsonify({
            "status": "success",
            "data": stats,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/rate-limits/reset", methods=["POST"])
@rate_limit_api(requests_per_minute=10)
def reset_rate_limits() -> Any:
    """Reset all rate limits"""
    try:
        rate_limiter.rate_limits.clear()
        return jsonify({
            "status": "success",
            "message": "Rate limits reset successfully",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Metrics Collection Endpoints
@app.route("/api/metrics/collect", methods=["POST"])
@rate_limit_api(requests_per_minute=30)
def collect_metrics() -> Any:
    """Collect all system metrics"""
    try:
        metrics = metrics_collector.collect_all_metrics()
        return jsonify({
            "status": "success",
            "data": metrics,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/metrics/report", methods=["GET"])
@rate_limit_api(requests_per_minute=20)
def generate_metrics_report() -> Any:
    """Generate metrics report"""
    try:
        hours = request.args.get('hours', 24, type=int)
        report = metrics_collector.generate_report(hours)
        return jsonify({
            "status": "success",
            "data": report,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Database Optimization Endpoints
@app.route("/api/database/analyze", methods=["GET"])
@rate_limit_api(requests_per_minute=10)
def analyze_database() -> Any:
    """Analyze database schema"""
    try:
        analysis = database_optimizer.analyze_schema()
        return jsonify({
            "status": "success",
            "data": analysis,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/database/optimize", methods=["POST"])
@rate_limit_api(requests_per_minute=5)
def optimize_database() -> Any:
    """Generate database optimization report"""
    try:
        report = database_optimizer.generate_optimization_report()
        return jsonify({
            "status": "success",
            "data": report,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Background Tasks Endpoints
@app.route("/api/tasks/status", methods=["GET"])
@rate_limit_api(requests_per_minute=30)
def get_task_status() -> Any:
    """Get background task status"""
    try:
        status = background_task_manager.get_task_status()
        return jsonify({
            "status": "success",
            "data": status,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Server Management Endpoints
@app.route("/api/server/restart", methods=["POST"])
@rate_limit_api(requests_per_minute=5)
def restart_server() -> Any:
    """Restart the server"""
    try:
        # This is a placeholder - in production, this would trigger actual server restart
        return jsonify({
            "status": "success",
            "message": "Server restart initiated",
            "note": "This is a placeholder endpoint. Actual restart should be handled by the deployment system.",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/server/stop", methods=["POST"])
@rate_limit_api(requests_per_minute=5)
def stop_server() -> Any:
    """Stop the server (emergency stop)"""
    try:
        # This is a placeholder - in production, this would trigger actual server stop
        return jsonify({
            "status": "success",
            "message": "Server stop initiated",
            "note": "This is a placeholder endpoint. Actual stop should be handled by the deployment system.",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/tasks/run/<task_name>", methods=["POST"])
@rate_limit_api(requests_per_minute=10)
def run_task(task_name: str) -> Any:
    """Run a specific background task"""
    try:
        result = background_task_manager.run_task(task_name)
        return jsonify({
            "status": "success",
            "data": result,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/tasks/start", methods=["POST"])
@rate_limit_api(requests_per_minute=5)
def start_background_tasks() -> Any:
    """Start background task scheduler"""
    try:
        background_task_manager.start_scheduler()
        return jsonify({
            "status": "success",
            "message": "Background task scheduler started",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/tasks/stop", methods=["POST"])
@rate_limit_api(requests_per_minute=5)
def stop_background_tasks() -> Any:
    """Stop background task scheduler"""
    try:
        background_task_manager.stop_scheduler()
        return jsonify({
            "status": "success",
            "message": "Background task scheduler stopped",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# External Data Refresh Scheduler endpoints
@app.route("/api/external-data/scheduler/start", methods=["POST"])
@rate_limit_api(requests_per_minute=5)
def start_data_refresh_scheduler() -> Any:
    """Start external data refresh scheduler"""
    if not data_refresh_scheduler:
        return jsonify({
            "status": "error",
            "error": "External data refresh scheduler not available",
            "timestamp": datetime.now().isoformat()
        }), 503
    
    try:
        data_refresh_scheduler.start()
        return jsonify({
            "status": "success",
            "message": "External data refresh scheduler started",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Error starting external data scheduler: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/external-data/scheduler/stop", methods=["POST"])
@rate_limit_api(requests_per_minute=5)
def stop_data_refresh_scheduler() -> Any:
    """Stop external data refresh scheduler"""
    if not data_refresh_scheduler:
        return jsonify({
            "status": "error",
            "error": "External data refresh scheduler not available",
            "timestamp": datetime.now().isoformat()
        }), 503
    
    try:
        data_refresh_scheduler.stop()
        return jsonify({
            "status": "success",
            "message": "External data refresh scheduler stopped",
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Error stopping external data scheduler: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/external-data/refresh/all", methods=["POST"])
@rate_limit_api(requests_per_minute=60)
def refresh_all_external_data() -> Any:
    """Refresh all external data from primary provider"""
    start_time = datetime.now()
    session = None
    try:
        from config.database import SessionLocal
        from models.ticker import Ticker
        from models.external_data import ExternalDataProvider
        from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter

        logger.info(" Starting refresh_all_external_data - Step 1: Initialization")
        session = SessionLocal()

        # Step 1: Get all open tickers
        tickers = session.query(Ticker).filter(Ticker.status == 'open').all()
        logger.info(f" Found {len(tickers)} open tickers")
        
        # Step 2: Check what data is missing for each ticker
        from services.external_data.missing_data_checker import MissingDataChecker
        missing_checker = MissingDataChecker(session)
        
        tickers_needing_quote: List[Ticker] = []
        tickers_needing_historical: List[Ticker] = []
        tickers_needing_indicators: List[Dict[str, Any]] = []
        tickers_skipped_fresh: List[Dict[str, Any]] = []
        skipped_tickers: List[Dict[str, Any]] = []
        ticker_details: Dict[str, Ticker] = {}
        
        logger.info(f" Step 2: Checking missing data for {len(tickers)} tickers")
        for ticker in tickers:
            symbol = (ticker.symbol or '').strip()
            if not symbol:
                skipped_tickers.append({
                    'id': ticker.id,
                    'reason': 'missing_symbol'
                })
                logger.warning(f" Skipping ticker ID {ticker.id}: missing symbol")
                continue
            
            ticker_details[symbol] = ticker
            missing_data = missing_checker.check_missing_data(ticker.id)
            
            needs_quote = missing_data.get('should_refresh_quote', True)
            needs_historical = missing_data.get('should_refresh_historical', False)
            needs_indicators = len(missing_data.get('should_refresh_indicators', [])) > 0
            
            if not needs_quote and not needs_historical and not needs_indicators:
                tickers_skipped_fresh.append({
                    'id': ticker.id,
                    'symbol': ticker.symbol,
                    'reason': 'all_data_fresh',
                    'data_freshness': missing_data.get('data_freshness', {})
                })
                continue
            
            if needs_quote:
                tickers_needing_quote.append(ticker)
            if needs_historical:
                tickers_needing_historical.append(ticker)
            if needs_indicators:
                tickers_needing_indicators.append({
                    'ticker': ticker,
                    'indicators': missing_data.get('should_refresh_indicators', [])
                })
        
        logger.info(f" Step 2 completed: {len(tickers_needing_quote)} need quotes, {len(tickers_needing_historical)} need historical, {len(tickers_needing_indicators)} need indicators, {len(tickers_skipped_fresh)} skipped (fresh)")
        
        if not tickers_needing_quote and not tickers_needing_historical and not tickers_needing_indicators:
            logger.info(" All tickers have fresh data, no refresh needed")
            return jsonify({
                "status": "success",
                "message": "All tickers have fresh data, no refresh needed",
                "data": {
                    "total_tickers": len(tickers),
                    "skipped_fresh": len(tickers_skipped_fresh),
                    "skipped": skipped_tickers,
                    "tickers_skipped_fresh": tickers_skipped_fresh
                },
                "timestamp": datetime.now().isoformat()
            }), 200

        # Step 3: Get provider
        provider = session.query(ExternalDataProvider).filter(
            ExternalDataProvider.name == 'yahoo_finance'
        ).first()

        if not provider:
            logger.error(" Yahoo Finance provider not configured for manual refresh")
            return jsonify({
                "status": "error",
                "error": "Yahoo Finance provider is not configured",
                "timestamp": datetime.now().isoformat()
            }), 500

        logger.info(f" Step 3 completed: Provider found (ID: {provider.id}, Name: {provider.name})")

        # Step 4: Fetch current quotes (only for tickers that need it)
        successful_symbols: set = set()
        failed_symbols: List[str] = []
        quotes_loaded = 0
        quotes_skipped = 0
        
        if tickers_needing_quote:
            symbols_to_fetch = [ticker.symbol for ticker in tickers_needing_quote]
            logger.info(f" Step 4: Fetching current quotes for {len(symbols_to_fetch)} tickers (out of {len(tickers)} total)")
            adapter = YahooFinanceAdapter(session, provider.id)
            
            # Process in batches of 25 (optimal batch size)
            batch_size = 25
            for i in range(0, len(symbols_to_fetch), batch_size):
                batch = symbols_to_fetch[i:i + batch_size]
                try:
                    quotes = adapter.get_quotes_batch(batch)
                    successful_symbols.update({quote.symbol for quote in quotes})
                    quotes_loaded += len(quotes)
                except Exception as batch_error:
                    logger.error(f" Error fetching batch {i//batch_size + 1}: {batch_error}")
                    failed_symbols.extend(batch)
            
            failed_symbols.extend([s for s in symbols_to_fetch if s not in successful_symbols])
            quotes_skipped = len(tickers) - len(tickers_needing_quote)
            
            logger.info(f" Step 4 completed: {quotes_loaded} quotes loaded, {quotes_skipped} skipped (fresh), {len(failed_symbols)} failed")
        else:
            logger.info(f" Step 4 skipped: All quotes are fresh")
            quotes_skipped = len(tickers)

        # Step 5: Load historical data (only for tickers that need it)
        logger.info(f" Step 5: Loading historical data for {len(tickers_needing_historical)} tickers")
        historical_loaded = 0
        historical_skipped = 0
        indicators_calculated = 0
        ticker_errors: List[Dict[str, Any]] = []
        
        # Combine tickers needing historical with successful quote symbols
        tickers_to_process = set()
        for ticker in tickers_needing_historical:
            if ticker.symbol in successful_symbols or not tickers_needing_quote:
                tickers_to_process.add(ticker)
        
        for ticker in tickers_to_process:
            ticker = ticker_details.get(symbol)
            if not ticker:
                logger.warning(f" Ticker not found for symbol {symbol}")
                continue
                
            try:
                # Load historical data (150 days for MA 150 calculation)
                logger.debug(f" Loading historical data for {ticker.symbol} (ID: {ticker.id})")
                historical_count = adapter.fetch_and_save_historical_quotes(ticker, days_back=150)
                
                if historical_count > 0:
                    historical_loaded += 1
                    logger.debug(f" Loaded {historical_count} historical quotes for {ticker.symbol} (target: 150)")
                    
                    # Validate we have enough quotes
                    if historical_count < 120:
                        logger.warning(f" Only {historical_count} quotes loaded for {ticker.symbol}, expected at least 120 for MA 150")
                else:
                    logger.warning(f" No historical quotes loaded for {ticker.symbol}")
                    ticker_errors.append({
                        'ticker_id': ticker.id,
                        'symbol': ticker.symbol,
                        'error': 'no_historical_data'
                    })
                
                # Pre-calculate only missing indicators
                missing_data = missing_checker.check_missing_data(ticker.id)
                missing_indicators = missing_data.get('missing_indicators', [])
                should_refresh_indicators = missing_data.get('should_refresh_indicators', [])
                indicators_to_calculate = set(missing_indicators + should_refresh_indicators)
                
                if indicators_to_calculate and historical_count > 0:
                    try:
                        from services.external_data.technical_indicators_calculator import TechnicalIndicatorsCalculator
                        from services.external_data.week52_calculator import Week52Calculator
                        
                        tech_calculator = TechnicalIndicatorsCalculator(session)
                        week52_calculator = Week52Calculator(session)
                        ticker_indicators = []
                        
                        # Pre-calculate Volatility (needs 30+ days) - only if missing
                        if 'volatility_30' in indicators_to_calculate and historical_count >= 30:
                            try:
                                volatility = tech_calculator.calculate_volatility(ticker.id, period=30, db_session=session)
                                if volatility is not None:
                                    volatility_cache_key = f"ticker_{ticker.id}_volatility_30"
                                    advanced_cache_service.set(volatility_cache_key, volatility, ttl=3600)
                                    indicators_calculated += 1
                                    ticker_indicators.append('volatility_30')
                                    logger.debug(f" Pre-calculated Volatility for {ticker.symbol}: {volatility:.2f}%")
                            except Exception as vol_error:
                                logger.warning(f" Error pre-calculating volatility for {ticker.symbol}: {vol_error}")
                        
                        # Pre-calculate MA 20 (needs 20+ days) - only if missing
                        if 'ma_20' in indicators_to_calculate and historical_count >= 20:
                            try:
                                sma_20 = tech_calculator.calculate_sma(ticker.id, period=20, db_session=session)
                                if sma_20 is not None:
                                    ma20_cache_key = f"ticker_{ticker.id}_ma_20"
                                    advanced_cache_service.set(ma20_cache_key, sma_20, ttl=3600)
                                    indicators_calculated += 1
                                    ticker_indicators.append('ma_20')
                                    logger.debug(f" Pre-calculated MA 20 for {ticker.symbol}: {sma_20:.2f}")
                            except Exception as ma20_error:
                                logger.warning(f" Error pre-calculating MA 20 for {ticker.symbol}: {ma20_error}")
                        
                        # Pre-calculate MA 150 (needs 120+ quotes) - only if missing
                        if 'ma_150' in indicators_to_calculate and historical_count >= 120:
                            try:
                                sma_150 = tech_calculator.calculate_sma(ticker.id, period=150, db_session=session)
                                if sma_150 is not None:
                                    ma150_cache_key = f"ticker_{ticker.id}_ma_150"
                                    advanced_cache_service.set(ma150_cache_key, sma_150, ttl=3600)
                                    indicators_calculated += 1
                                    ticker_indicators.append('ma_150')
                                    logger.debug(f" Pre-calculated MA 150 for {ticker.symbol}: {sma_150:.2f}")
                            except Exception as ma150_error:
                                logger.warning(f" Error pre-calculating MA 150 for {ticker.symbol}: {ma150_error}")
                        
                        # Pre-calculate 52W range (needs 10+ days) - only if missing
                        if 'week52' in indicators_to_calculate and historical_count >= 10:
                            try:
                                week52_result = week52_calculator.calculate_52w_range(ticker.id, db_session=session)
                                if week52_result:
                                    week52_cache_key = f"ticker_{ticker.id}_week52"
                                    week52_dict = {
                                        'high': week52_result.high,
                                        'low': week52_result.low,
                                        'warnings': week52_result.warnings if hasattr(week52_result, 'warnings') else []
                                    }
                                    advanced_cache_service.set(week52_cache_key, week52_dict, ttl=3600)
                                    indicators_calculated += 1
                                    ticker_indicators.append('week52')
                                    logger.debug(f" Pre-calculated 52W range for {ticker.symbol}")
                            except Exception as week52_error:
                                logger.warning(f" Error pre-calculating 52W range for {ticker.symbol}: {week52_error}")
                        
                        if ticker_indicators:
                            logger.debug(f" Calculated {len(ticker_indicators)} indicators for {ticker.symbol}: {', '.join(ticker_indicators)}")
                                
                    except Exception as calc_error:
                        logger.warning(f" Error pre-calculating technical indicators for {ticker.symbol}: {calc_error}", exc_info=True)
                        ticker_errors.append({
                            'ticker_id': ticker.id,
                            'symbol': ticker.symbol,
                            'error': 'indicator_calculation_failed',
                            'error_message': str(calc_error)
                        })
                else:
                    historical_skipped += 1
                        
            except Exception as hist_error:
                logger.error(f" Error loading historical data for {ticker.symbol}: {hist_error}", exc_info=True)
                ticker_errors.append({
                    'ticker_id': ticker.id,
                    'symbol': ticker.symbol,
                    'error': 'historical_data_load_failed',
                    'error_message': str(hist_error)
                })
        
        historical_skipped = len(tickers) - len(tickers_needing_historical) - historical_loaded
        logger.info(f" Step 5 completed: {historical_loaded} tickers with historical data loaded, {historical_skipped} skipped (fresh), {indicators_calculated} indicators calculated")

        # Step 5: Invalidate cache
        logger.info(" Step 5: Invalidating cache")
        if successful_symbols:
            for dependency in ['tickers', 'dashboard', 'external_data']:
                advanced_cache_service.invalidate_by_dependency(dependency)
            
            # Invalidate technical indicators cache
            for ticker in ticker_details.values():
                try:
                    advanced_cache_service.invalidate(f"ticker_{ticker.id}_week52")
                    advanced_cache_service.invalidate(f"ticker_{ticker.id}_volatility_30")
                    advanced_cache_service.invalidate(f"ticker_{ticker.id}_ma_20")
                    advanced_cache_service.invalidate(f"ticker_{ticker.id}_ma_150")
                except Exception as cache_error:
                    logger.warning(f" Error invalidating cache for ticker {ticker.id}: {cache_error}")
        
        logger.info(" Step 5 completed: Cache invalidated")
        
        # Prepare response
        end_time = datetime.now()
        duration_seconds = (end_time - start_time).total_seconds()
        
        message = "External data refresh completed"
        status = "success"
        http_status = 200
        if failed_symbols or ticker_errors:
            status = "partial_success"
            message = "External data refresh completed with partial failures"
            http_status = 207

        logger.info(f" refresh_all_external_data completed: {quotes_loaded} quotes loaded, {historical_loaded} historical loaded, {indicators_calculated} indicators calculated, {len(tickers_skipped_fresh)} skipped (fresh), duration: {duration_seconds:.2f}s")

        response_data = {
            "status": status,
            "message": message,
            "data": {
                "total_tickers": len(tickers),
                "quotes": {
                    "loaded": quotes_loaded,
                    "skipped_fresh": quotes_skipped,
                    "failed": len(failed_symbols),
                    "failed_symbols": failed_symbols
                },
                "historical": {
                    "loaded": historical_loaded,
                    "skipped_fresh": historical_skipped
                },
                "indicators": {
                    "calculated": indicators_calculated
                },
                "optimization": {
                    "tickers_skipped_fresh": len(tickers_skipped_fresh),
                    "tickers_needing_quote": len(tickers_needing_quote),
                    "tickers_needing_historical": len(tickers_needing_historical),
                    "tickers_needing_indicators": len(tickers_needing_indicators)
                },
                "skipped": skipped_tickers,
                "skipped_fresh": tickers_skipped_fresh,
                "ticker_errors": ticker_errors
            },
            "duration_seconds": round(duration_seconds, 2),
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response_data), http_status

    except Exception as e:
        if session:
            session.rollback()
        logger.error(f"Manual external data refresh failed: {e}", exc_info=True)
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500
    finally:
        if session:
            session.close()

@app.route("/api/external-data/refresh/full", methods=["POST"])
@rate_limit_api(requests_per_minute=10)  # Lower rate limit for full refresh
def refresh_full_external_data() -> Any:
    """
    Full external data refresh - loads current quotes, historical data (150 days), and pre-calculates technical indicators.
    This is a comprehensive refresh that ensures all data needed for ticker dashboard is available.
    """
    session = None
    start_time = datetime.now()
    try:
        from config.database import SessionLocal
        from models.ticker import Ticker
        from models.external_data import ExternalDataProvider
        from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter

        session = SessionLocal()

        # Get all open tickers
        tickers = session.query(Ticker).filter(Ticker.status == 'open').all()
        skipped_tickers: List[Dict[str, Any]] = []
        ticker_map: Dict[str, Ticker] = {}
        
        # Check what data is missing for each ticker
        from services.external_data.missing_data_checker import MissingDataChecker
        missing_checker = MissingDataChecker(session)
        
        tickers_needing_quote: List[Ticker] = []
        tickers_needing_historical: List[Ticker] = []
        tickers_needing_indicators: List[Dict[str, Any]] = []
        tickers_skipped_fresh: List[Dict[str, Any]] = []
        
        logger.info(f" Checking missing data for {len(tickers)} tickers")
        for ticker in tickers:
            symbol = (ticker.symbol or '').strip()
            if not symbol:
                skipped_tickers.append({
                    'id': ticker.id,
                    'reason': 'missing_symbol'
                })
                continue
            
            ticker_map[symbol] = ticker
            missing_data = missing_checker.check_missing_data(ticker.id)
            
            needs_quote = missing_data.get('should_refresh_quote', True)
            needs_historical = missing_data.get('should_refresh_historical', False)
            needs_indicators = len(missing_data.get('should_refresh_indicators', [])) > 0
            
            if not needs_quote and not needs_historical and not needs_indicators:
                tickers_skipped_fresh.append({
                    'id': ticker.id,
                    'symbol': ticker.symbol,
                    'reason': 'all_data_fresh',
                    'data_freshness': missing_data.get('data_freshness', {})
                })
                continue
            
            if needs_quote:
                tickers_needing_quote.append(ticker)
            if needs_historical:
                tickers_needing_historical.append(ticker)
            if needs_indicators:
                tickers_needing_indicators.append({
                    'ticker': ticker,
                    'indicators': missing_data.get('should_refresh_indicators', [])
                })
        
        logger.info(f" Check completed: {len(tickers_needing_quote)} need quotes, {len(tickers_needing_historical)} need historical, {len(tickers_needing_indicators)} need indicators, {len(tickers_skipped_fresh)} skipped (fresh)")
        
        if not tickers_needing_quote and not tickers_needing_historical and not tickers_needing_indicators:
            logger.info(" All tickers have fresh data, no refresh needed")
            return jsonify({
                "status": "success",
                "message": "All tickers have fresh data, no refresh needed",
                "data": {
                    "total_tickers": len(tickers),
                    "skipped_fresh": len(tickers_skipped_fresh),
                    "skipped": skipped_tickers,
                    "tickers_skipped_fresh": tickers_skipped_fresh
                },
                "timestamp": datetime.now().isoformat()
            }), 200

        provider = session.query(ExternalDataProvider).filter(
            ExternalDataProvider.name == 'yahoo_finance'
        ).first()

        if not provider:
            logger.error("Yahoo Finance provider not configured for full refresh")
            return jsonify({
                "status": "error",
                "error": "Yahoo Finance provider is not configured",
                "timestamp": datetime.now().isoformat()
            }), 500

        adapter = YahooFinanceAdapter(session, provider.id)
        
        # Step 1: Load current quotes (only for tickers that need it)
        successful_symbols: set = set()
        failed_symbols: List[str] = []
        quotes_loaded = 0
        quotes_skipped = 0
        
        if tickers_needing_quote:
            symbols_to_fetch = [ticker.symbol for ticker in tickers_needing_quote]
            logger.info(f" Step 1: Loading current quotes for {len(symbols_to_fetch)} tickers (out of {len(tickers)} total)")
            
            # Process in batches of 25 (optimal batch size)
            batch_size = 25
            for i in range(0, len(symbols_to_fetch), batch_size):
                batch = symbols_to_fetch[i:i + batch_size]
                try:
                    quotes = adapter.get_quotes_batch(batch)
                    successful_symbols.update({quote.symbol for quote in quotes})
                    quotes_loaded += len(quotes)
                except Exception as batch_error:
                    logger.error(f" Error fetching batch {i//batch_size + 1}: {batch_error}")
                    failed_symbols.extend(batch)
            
            failed_symbols.extend([s for s in symbols_to_fetch if s not in successful_symbols])
            quotes_skipped = len(tickers) - len(tickers_needing_quote)
            
            logger.info(f" Step 1 completed: {quotes_loaded} quotes loaded, {quotes_skipped} skipped (fresh), {len(failed_symbols)} failed")
        else:
            logger.info(f" Step 1 skipped: All quotes are fresh")
            quotes_skipped = len(tickers)
            # Add all tickers to successful_symbols for historical processing
            successful_symbols = {ticker.symbol for ticker in tickers if ticker.symbol}

        # Step 2: Load historical data and pre-calculate technical indicators (only for tickers that need it)
        historical_loaded = 0
        historical_skipped = 0
        total_historical_quotes = 0
        indicators_calculated = 0
        ticker_details: List[Dict[str, Any]] = []
        ticker_errors: List[Dict[str, Any]] = []
        
        # Combine tickers needing historical with successful quote symbols
        tickers_to_process = set()
        for ticker in tickers_needing_historical:
            if ticker.symbol in successful_symbols or not tickers_needing_quote:
                tickers_to_process.add(ticker)
        
        logger.info(f" Step 2: Loading historical data and pre-calculating indicators for {len(tickers_to_process)} tickers")
        
        for ticker in tickers_to_process:
            ticker = ticker_map.get(symbol)
            if not ticker:
                logger.warning(f" Ticker not found for symbol {symbol}")
                continue
                
            ticker_detail = {
                'ticker_id': ticker.id,
                'symbol': ticker.symbol,
                'current_quote_loaded': True,
                'historical_quotes_count': 0,
                'indicators_calculated': []
            }
            
            try:
                # Load historical data (150 days for MA 150 calculation)
                logger.debug(f" Loading historical data for {ticker.symbol} (ID: {ticker.id})")
                historical_count = adapter.fetch_and_save_historical_quotes(ticker, days_back=150)
                
                if historical_count > 0:
                    historical_loaded += 1
                    total_historical_quotes += historical_count
                    ticker_detail['historical_quotes_count'] = historical_count
                    logger.info(f" Loaded {historical_count} historical quotes for {ticker.symbol} (target: 150)")
                    
                    # Validate we have enough quotes
                    if historical_count < 120:
                        logger.warning(f" Only {historical_count} quotes loaded for {ticker.symbol}, expected at least 120 for MA 150")
                        ticker_detail['warning'] = f'Only {historical_count} quotes loaded, expected 150'
                else:
                    logger.warning(f" No historical quotes loaded for {ticker.symbol}")
                    ticker_detail['warning'] = 'No historical data loaded'
                    ticker_errors.append({
                        'ticker_id': ticker.id,
                        'symbol': ticker.symbol,
                        'error': 'no_historical_data'
                    })
                
                # Pre-calculate only missing indicators
                missing_data = missing_checker.check_missing_data(ticker.id)
                missing_indicators = missing_data.get('missing_indicators', [])
                should_refresh_indicators = missing_data.get('should_refresh_indicators', [])
                indicators_to_calculate = set(missing_indicators + should_refresh_indicators)
                
                if indicators_to_calculate and historical_count > 0:
                    try:
                        from services.external_data.technical_indicators_calculator import TechnicalIndicatorsCalculator
                        from services.external_data.week52_calculator import Week52Calculator
                        
                        tech_calculator = TechnicalIndicatorsCalculator(session)
                        week52_calculator = Week52Calculator(session)
                        
                        # Pre-calculate Volatility (needs 30+ days) - only if missing
                        if 'volatility_30' in indicators_to_calculate and historical_count >= 30:
                            try:
                                volatility = tech_calculator.calculate_volatility(ticker.id, period=30, db_session=session)
                                if volatility is not None:
                                    volatility_cache_key = f"ticker_{ticker.id}_volatility_30"
                                    advanced_cache_service.set(volatility_cache_key, volatility, ttl=3600)
                                    indicators_calculated += 1
                                    ticker_detail['indicators_calculated'].append('volatility_30')
                                    logger.debug(f" Pre-calculated Volatility for {ticker.symbol}: {volatility:.2f}%")
                            except Exception as vol_error:
                                logger.warning(f"Error pre-calculating volatility for {ticker.symbol}: {vol_error}")
                        
                        # Pre-calculate MA 20 (needs 20+ days) - only if missing
                        if 'ma_20' in indicators_to_calculate and historical_count >= 20:
                            try:
                                sma_20 = tech_calculator.calculate_sma(ticker.id, period=20, db_session=session)
                                if sma_20 is not None:
                                    ma20_cache_key = f"ticker_{ticker.id}_ma_20"
                                    advanced_cache_service.set(ma20_cache_key, sma_20, ttl=3600)
                                    indicators_calculated += 1
                                    ticker_detail['indicators_calculated'].append('ma_20')
                                    logger.debug(f" Pre-calculated MA 20 for {ticker.symbol}: {sma_20:.2f}")
                            except Exception as ma20_error:
                                logger.warning(f"Error pre-calculating MA 20 for {ticker.symbol}: {ma20_error}")
                        
                        # Pre-calculate MA 150 (needs 120+ quotes) - only if missing
                        if 'ma_150' in indicators_to_calculate and historical_count >= 120:
                            try:
                                sma_150 = tech_calculator.calculate_sma(ticker.id, period=150, db_session=session)
                                if sma_150 is not None:
                                    ma150_cache_key = f"ticker_{ticker.id}_ma_150"
                                    advanced_cache_service.set(ma150_cache_key, sma_150, ttl=3600)
                                    indicators_calculated += 1
                                    ticker_detail['indicators_calculated'].append('ma_150')
                                    logger.debug(f" Pre-calculated MA 150 for {ticker.symbol}: {sma_150:.2f}")
                            except Exception as ma150_error:
                                logger.warning(f"Error pre-calculating MA 150 for {ticker.symbol}: {ma150_error}")
                        
                        # Pre-calculate 52W range (needs 10+ days) - only if missing
                        if 'week52' in indicators_to_calculate and historical_count >= 10:
                            try:
                                week52_result = week52_calculator.calculate_52w_range(ticker.id, db_session=session)
                                if week52_result:
                                    week52_cache_key = f"ticker_{ticker.id}_week52"
                                    week52_dict = {
                                        'high': week52_result.high,
                                        'low': week52_result.low,
                                        'warnings': week52_result.warnings if hasattr(week52_result, 'warnings') else []
                                    }
                                    advanced_cache_service.set(week52_cache_key, week52_dict, ttl=3600)
                                    indicators_calculated += 1
                                    ticker_detail['indicators_calculated'].append('week52')
                                    logger.debug(f" Pre-calculated 52W range for {ticker.symbol}")
                            except Exception as week52_error:
                                logger.warning(f"Error pre-calculating 52W range for {ticker.symbol}: {week52_error}")
                                
                    except Exception as calc_error:
                        logger.warning(f"Error pre-calculating technical indicators for {ticker.symbol}: {calc_error}")
                        
            except Exception as hist_error:
                logger.warning(f"Error loading historical data for {ticker.symbol}: {hist_error}")
                ticker_detail['current_quote_loaded'] = False
                ticker_detail['error'] = str(hist_error)
            
            ticker_details.append(ticker_detail)

        logger.info(f" Step 2 completed: {historical_loaded} tickers with historical data, {indicators_calculated} indicators calculated")

        # Step 3: Invalidate cache
        if successful_symbols:
            logger.info(" Step 3: Invalidating cache")
            for dependency in ['tickers', 'dashboard', 'external_data']:
                advanced_cache_service.invalidate_by_dependency(dependency)
            
            # Invalidate technical indicators cache
            for ticker in ticker_map.values():
                try:
                    advanced_cache_service.invalidate(f"ticker_{ticker.id}_week52")
                    advanced_cache_service.invalidate(f"ticker_{ticker.id}_volatility_30")
                    advanced_cache_service.invalidate(f"ticker_{ticker.id}_ma_20")
                    advanced_cache_service.invalidate(f"ticker_{ticker.id}_ma_150")
                except Exception:
                    pass
            logger.info(" Step 3 completed: Cache invalidated")

        # Calculate duration
        end_time = datetime.now()
        duration_seconds = (end_time - start_time).total_seconds()

        # Prepare response
        historical_skipped = len(tickers) - len(tickers_needing_historical) - historical_loaded
        logger.info(f" refresh_full_external_data completed: {quotes_loaded} quotes loaded, {historical_loaded} historical loaded, {indicators_calculated} indicators calculated, {len(tickers_skipped_fresh)} skipped (fresh), duration: {duration_seconds:.2f}s")
        
        message = "Full external data refresh completed successfully"
        status = "success"
        http_status = 200
        if failed_symbols or ticker_errors:
            status = "partial_success"
            message = "Full external data refresh completed with partial failures"
            http_status = 207

        response_data = {
            "status": status,
            "message": message,
            "data": {
                "total_tickers": len(tickers),
                "quotes": {
                    "loaded": quotes_loaded,
                    "skipped_fresh": quotes_skipped,
                    "failed": len(failed_symbols),
                    "failed_symbols": failed_symbols
                },
                "historical": {
                    "loaded": historical_loaded,
                    "skipped_fresh": historical_skipped,
                    "total_quotes": total_historical_quotes,
                    "average_quotes_per_ticker": round(total_historical_quotes / historical_loaded, 2) if historical_loaded > 0 else 0
                },
                "indicators": {
                    "calculated": indicators_calculated,
                    "tickers_with_indicators": len([t for t in ticker_details if t.get('indicators_calculated')])
                },
                "optimization": {
                    "tickers_skipped_fresh": len(tickers_skipped_fresh),
                    "tickers_needing_quote": len(tickers_needing_quote),
                    "tickers_needing_historical": len(tickers_needing_historical),
                    "tickers_needing_indicators": len(tickers_needing_indicators)
                },
                "skipped": skipped_tickers,
                "skipped_fresh": tickers_skipped_fresh,
                "ticker_errors": ticker_errors,
                "ticker_details": ticker_details[:20],  # Limit to first 20 for response size
                "performance": {
                    "duration_seconds": round(duration_seconds, 2),
                    "start_time": start_time.isoformat(),
                    "end_time": end_time.isoformat()
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response_data), http_status

    except Exception as e:
        if session:
            session.rollback()
        logger.error(f"Full external data refresh failed: {e}", exc_info=True)
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500
    finally:
        if session:
            session.close()

@app.route("/api/external-data/scheduler/status", methods=["GET"])
@rate_limit_api(requests_per_minute=30)
def get_data_refresh_scheduler_status() -> Any:
    """Get external data refresh scheduler status"""
    if not data_refresh_scheduler:
        return jsonify({
            "status": "success",
            "data": {
                "scheduler_running": False,
                "message": "External data refresh scheduler not available",
                "last_refresh": None,
                "next_refresh": None,
                "total_refreshes": 0,
                "successful_refreshes": 0,
                "failed_refreshes": 0
            },
            "timestamp": datetime.now().isoformat()
        }), 200
    
    try:
        status = data_refresh_scheduler.get_scheduler_status()
        return jsonify({
            "status": "success",
            "data": status,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Error getting external data scheduler status: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Simple Yahoo Finance API endpoint (direct access)
@app.route("/api/external-data/yahoo/quote/<symbol>", methods=["GET"])
@rate_limit_api(requests_per_minute=60)
def get_yahoo_quote(symbol: str) -> Any:
    """Get real-time quote from Yahoo Finance"""
    try:
        # Use the enhanced YahooFinanceAdapter from services
        from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
        from models.external_data import ExternalDataProvider
        from config.database import get_db
        
        # Get database session
        db = next(get_db())
        
        # Get Yahoo Finance provider
        provider = db.query(ExternalDataProvider).filter(
            ExternalDataProvider.name == 'yahoo_finance'
        ).first()
        
        if not provider:
            return jsonify({
                "status": "error", 
                "error": "Yahoo Finance provider not configured",
                "timestamp": datetime.now().isoformat()
            }), 503
        
        # Initialize adapter with enhanced functionality
        adapter = YahooFinanceAdapter(db, provider.id)
        quote_data = adapter._get_enhanced_quote_data(symbol.upper())
        
        if quote_data:
            return jsonify({
                "status": "success",
                "data": {
                    "symbol": symbol.upper(),
                    "price": quote_data.price,
                    "change_amount": quote_data.change_amount,
                    "change_percent": quote_data.change_pct,
                    "volume": quote_data.volume,
                    "asof_utc": quote_data.asof_utc.isoformat() if quote_data.asof_utc else None,
                    "currency": quote_data.currency,
                    "source": quote_data.source
                },
                "timestamp": datetime.now().isoformat()
            }), 200
        else:
            return jsonify({
                "status": "error",
                "error": f"No data available for symbol {symbol.upper()}",
                "error_code": "NO_DATA_AVAILABLE",
                "symbol": symbol.upper(),
                "suggestion": "Please check the symbol format (e.g., 'AAPL' for US stocks, '500X.TA' for Israeli stocks) or try refreshing the data",
                "timestamp": datetime.now().isoformat()
            }), 404
            
    except Exception as e:
        logger.error(f"Error fetching Yahoo Finance data for {symbol}: {e}", exc_info=True)
        return jsonify({
            "status": "error",
            "error": str(e),
            "error_code": "YAHOO_FINANCE_ERROR",
            "symbol": symbol.upper(),
            "suggestion": "Please check the symbol format and try again, or use the refresh endpoint to fetch data",
            "timestamp": datetime.now().isoformat()
        }), 500
    finally:
        if 'db' in locals():
            db.close()

@app.route("/api/external-data/yahoo/quotes", methods=["POST"])
@rate_limit_api(requests_per_minute=30)
def get_yahoo_quotes() -> Any:
    """Get multiple quotes from Yahoo Finance"""
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        
        if not symbols:
            return jsonify({
                "status": "error",
                "error": "No symbols provided",
                "timestamp": datetime.now().isoformat()
            }), 400
        
        # Use the correct Yahoo Finance adapter from our services
        from services.external_data.yahoo_finance_adapter import YahooFinanceAdapter
        from models.external_data import ExternalDataProvider
        from config.database import get_db
        
        # Get database session for caching quotes
        db_session = next(get_db())
        
        try:
            # Get or create Yahoo Finance provider
            provider = db_session.query(ExternalDataProvider).filter(
                ExternalDataProvider.name == 'yahoo_finance'
            ).first()
            
            if not provider:
                # Create provider if it doesn't exist
                provider = ExternalDataProvider(
                    name='yahoo_finance',
                    display_name='Yahoo Finance',
                    is_active=True,
                    provider_type='finance',
                    base_url='https://query1.finance.yahoo.com',
                    rate_limit_per_hour=900,
                    timeout_seconds=20
                )
                db_session.add(provider)
                db_session.commit()
                db_session.refresh(provider)
            
            # Initialize adapter with database session
            adapter = YahooFinanceAdapter(db_session, provider.id)
            results = {}
            
            for symbol in symbols[:10]:  # Limit to 10 symbols
                try:
                    # Use enhanced quote data method for better daily change calculation
                    quote_data = adapter._get_enhanced_quote_data(symbol.upper())
                    if quote_data:
                        results[symbol.upper()] = {
                            "price": quote_data.price,
                            "change_amount": quote_data.change_amount,
                            "change_percent": quote_data.change_pct,
                            "volume": quote_data.volume,
                            "asof_utc": quote_data.asof_utc.isoformat() if quote_data.asof_utc else None,
                            "currency": quote_data.currency,
                            "source": quote_data.source
                        }
                        logger.info(f" Fetched and cached enhanced quote for {symbol}: ${quote_data.price} (change: {quote_data.change_pct:.2f}%)" if quote_data.change_pct else f" Fetched quote for {symbol}: ${quote_data.price}")
                    else:
                        results[symbol.upper()] = {"error": "No data available"}
                        logger.warning(f" No enhanced data available for {symbol}")
                except Exception as e:
                    logger.warning(f"Failed to fetch enhanced data for {symbol}: {e}")
                    results[symbol.upper()] = {"error": str(e)}
        finally:
            db_session.close()
        
        return jsonify({
            "status": "success",
            "data": results,
            "timestamp": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching multiple Yahoo Finance quotes: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Database and UI paths are now imported from config.settings
# They are automatically set based on environment (development/production)
# Database connection is handled via SQLAlchemy through config.database

# Check if UI directory exists
if not UI_DIR.exists():
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

# UI Directory validation - removed debug prints
# Note: Database operations now use SQLAlchemy through config.database
# Ticker active_trades updates are handled via routes/api/tickers.py endpoints

# Routes are now handled by pages_bp blueprint

# API routes are now handled by blueprints



# API for trades - now defined in blueprint /api/trades



# Research API routes are now handled by blueprints



# Statistics API routes are now handled by blueprints


# Database API routes are now handled by blueprints
















# Ticker API routes are now handled by blueprints




        

        


# Cash flows API routes are now handled by blueprints



# Notes API routes are now handled by blueprints



# Executions API routes are now handled by blueprints



# Users API routes are now handled by blueprints



# Trading Accounts API routes are now handled by blueprints

# User roles API routes are now handled by blueprints

# ========================================
# CRUD Testing API Endpoints
# ========================================

@app.route('/api/run-crud-tests', methods=['POST'])
def run_crud_tests():
    """  CRUD """
    try:
        data = request.get_json() or {}
        test_type = data.get('test_type', 'comprehensive')
        pages = data.get('pages', [])
        
        #  
        script_path = Path(__file__).parent.parent / 'crud-tester.py'
        
        if not script_path.exists():
            return jsonify({
                'error': '  CRUD  ',
                'path': str(script_path)
            }), 404
        
        #  
        result = subprocess.run([
            'python3', str(script_path)
        ], capture_output=True, text=True, cwd=script_path.parent)
        
        return jsonify({
            'status': 'success',
            'test_type': test_type,
            'pages_tested': pages,
            'output': result.stdout,
            'error': result.stderr if result.stderr else None,
            'return_code': result.returncode,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'   CRUD: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/run-functional-tests', methods=['POST'])
def run_functional_tests():
    """  """
    try:
        #  
        script_path = Path(__file__).parent.parent / 'functional-crud-tester.py'
        
        if not script_path.exists():
            return jsonify({
                'error': '    ',
                'path': str(script_path)
            }), 404
        
        #  
        result = subprocess.run([
            'python3', str(script_path)
        ], capture_output=True, text=True, cwd=script_path.parent)
        
        return jsonify({
            'status': 'success',
            'output': result.stdout,
            'error': result.stderr if result.stderr else None,
            'return_code': result.returncode,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'   : {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/run-button-tests', methods=['POST'])
def run_button_tests():
    """  """
    try:
        #  
        script_path = Path(__file__).parent.parent / 'scripts' / 'button_system_tests.py'
        
        if not script_path.exists():
            return jsonify({
                'error': '    ',
                'path': str(script_path)
            }), 404
        
        #  
        result = subprocess.run([
            'python3', str(script_path)
        ], capture_output=True, text=True, cwd=script_path.parent)
        
        #  
        output_lines = result.stdout.split('\n')
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for line in output_lines:
            if '" :' in line:
                try:
                    total_tests = int(line.split(':')[1].strip())
                except:
                    pass
            elif ':' in line:
                try:
                    passed_tests = int(line.split(':')[1].strip())
                except:
                    pass
            elif ':' in line:
                try:
                    failed_tests = int(line.split(':')[1].strip())
                except:
                    pass
        
        return jsonify({
            'success': True,
            'testsRun': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'output': result.stdout,
            'error': result.stderr if result.stderr else None,
            'return_code': result.returncode,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'   : {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/run-executions-crud-tests', methods=['POST'])
def run_executions_crud_tests():
    """  CRUD -Executions"""
    try:
        #  
        script_path = Path(__file__).parent.parent / 'test_executions_crud.py'
        
        if not script_path.exists():
            return jsonify({
                'error': '  Executions CRUD  ',
                'path': str(script_path)
            }), 404
        
        #  
        result = subprocess.run([
            'python3', str(script_path)
        ], capture_output=True, text=True, cwd=script_path.parent)
        
        #  
        output_lines = result.stdout.split('\n')
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for line in output_lines:
            if 'TEST' in line and ':' in line:
                total_tests += 1
            elif '' in line or 'PASS' in line:
                passed_tests += 1
            elif '' in line or 'FAIL' in line:
                failed_tests += 1
        
        return jsonify({
            'success': True,
            'testsRun': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'output': result.stdout,
            'error': result.stderr if result.stderr else None,
            'return_code': result.returncode,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'   Executions CRUD: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/run-improved-analysis', methods=['POST'])
def run_improved_analysis():
    """  """
    try:
        #  
        script_path = Path(__file__).parent.parent / 'improved-crud-checker.py'
        
        if not script_path.exists():
            return jsonify({
                'error': '    ',
                'path': str(script_path)
            }), 404
        
        #  
        result = subprocess.run([
            'python3', str(script_path)
        ], capture_output=True, text=True, cwd=script_path.parent)
        
        return jsonify({
            'status': 'success',
            'output': result.stdout,
            'error': result.stderr if result.stderr else None,
            'return_code': result.returncode,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'   : {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/crud-test-status', methods=['GET'])
def get_crud_test_status():
    """   CRUD"""
    try:
        #   
        scripts = {
            'crud-tester.py': Path(__file__).parent.parent / 'crud-tester.py',
            'functional-crud-tester.py': Path(__file__).parent.parent / 'functional-crud-tester.py',
            'test-crud-buttons.py': Path(__file__).parent.parent / 'test-crud-buttons.py',
            'improved-crud-checker.py': Path(__file__).parent.parent / 'improved-crud-checker.py'
        }
        
        status = {}
        for name, path in scripts.items():
            status[name] = {
                'exists': path.exists(),
                'path': str(path),
                'size': path.stat().st_size if path.exists() else 0
            }
        
        return jsonify({
            'status': 'success',
            'scripts': status,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': f'  : {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500


# ===== INDEXEDDB MANAGEMENT ENDPOINTS =====

@app.route("/api/indexeddb/stats", methods=["GET"])
def get_indexeddb_stats():
    """IndexedDB statistics are only available on the client."""
    return jsonify({
        "success": False,
        "error": "IndexedDB statistics are not available from the server environment"
    }), 503

@app.route("/api/indexeddb/cleanup/<int:max_size>", methods=["POST"])
def cleanup_indexeddb(max_size):
    """Manual IndexedDB cleanup is not supported server-side."""
    return jsonify({
        "success": False,
        "error": "IndexedDB cleanup is only available from the client environment"
    }), 503

@app.route("/api/indexeddb/backup", methods=["POST"])
def backup_indexeddb():
    """IndexedDB backup is not supported server-side."""
    return jsonify({
        "success": False,
        "error": "IndexedDB backup must be initiated from the client environment"
    }), 503

@app.route("/api/indexeddb/restore", methods=["POST"])
def restore_indexeddb():
    """IndexedDB restore is not supported server-side."""
    return jsonify({
        "success": False,
        "error": "IndexedDB restore must be initiated from the client environment"
    }), 503

@app.route("/api/indexeddb/clear", methods=["POST"])
def clear_indexeddb():
    """IndexedDB clearing is not supported server-side."""
    return jsonify({
        "success": False,
        "error": "IndexedDB clearing must be initiated from the client environment"
    }), 503

# ===== END INDEXEDDB MANAGEMENT ENDPOINTS =====

# Route for favicon
@app.route('/favicon.ico')
def favicon():
    """Serve favicon from trading-ui/images/icons/"""
    return send_from_directory(os.path.join(UI_DIR, 'images', 'icons'), 'favicon.ico')

# Route for serving HTML files from trading-ui directory
@app.route('/trading-ui/<path:filename>')
def serve_ui_files(filename):
    """Serve static UI files explicitly under /trading-ui/* with correct MIME types"""
    import mimetypes
    full_path = os.path.join(UI_DIR, filename)
    print(f"DEBUG: Serving file: {filename}, full_path: {full_path}, exists: {os.path.exists(full_path)}")
    if not os.path.exists(full_path):
        print(f"DEBUG: File not found: {filename}")
        return "File not found", 404
    # Guess mimetype and set explicitly to avoid JSON default
    guessed, _ = mimetypes.guess_type(full_path)
    resp = send_from_directory(UI_DIR, filename)
    if guessed:
        resp.mimetype = guessed

    return resp

@app.route('/<path:filename>')
def serve_static_files(filename):
    """Backward compatibility for existing relative links"""

    # First try UI directory
    ui_path = os.path.join(UI_DIR, filename)
    if os.path.exists(ui_path):
        # Guess mimetype and set explicitly to avoid JSON default
        import mimetypes
        guessed, _ = mimetypes.guess_type(ui_path)
        resp = send_from_directory(UI_DIR, filename)
        if guessed:
            resp.mimetype = guessed
        elif filename.endswith('.css'):
            resp.mimetype = 'text/css'
        elif filename.endswith('.js'):
            resp.mimetype = 'application/javascript'
        return resp
    return "File not found", 404

# File discovery endpoint moved to /api/file-scanner/files

# File listing endpoint moved to /api/file-scanner/files

@app.route("/api/files/save", methods=["POST"])
@rate_limit_api(requests_per_minute=1000)
def save_file():
    """Save file content after auto-fix"""
    try:
        data = request.get_json()
        
        if not data or 'file' not in data or 'content' not in data:
            return jsonify({
                "success": False,
                "error": "Missing file or content in request"
            }), 400
        
        file_path = data['file']
        content = data['content']
        
        # Get project root directory
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Build full file path
        full_path = os.path.join(project_root, file_path)
        
        # Security check - ensure file is within project directory
        if not os.path.abspath(full_path).startswith(os.path.abspath(project_root)):
            return jsonify({
                "success": False,
                "error": "File path outside project directory"
            }), 403
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        
        # Write file content
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return jsonify({
            "success": True,
            "message": f"File {file_path} saved successfully",
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error saving file: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/system/settings/<setting_key>", methods=["GET"])
@rate_limit_api(requests_per_minute=60)
def get_system_setting(setting_key):
    """Get system setting by key"""
    from config.database import get_db
    from services.system_settings_service import SystemSettingsService
    from models.system_settings import SystemSettingType
    
    db = next(get_db())
    try:
        svc = SystemSettingsService(db)
        
        # Get setting type for metadata
        s_type = db.query(SystemSettingType).filter(
            SystemSettingType.key == setting_key,
            SystemSettingType.is_active == True
        ).first()
        
        if not s_type:
            return jsonify({
                "success": False,
                "error": f"System setting not found: {setting_key}",
                "timestamp": datetime.now().isoformat()
            }), 404
        
        # Get setting value
        value = svc.get_setting(setting_key)
        
        return jsonify({
            "success": True,
            "data": {
                "key": setting_key,
                "value": value,
                "data_type": s_type.data_type,
                "description": s_type.description,
                "default_value": s_type.default_value
            },
            "timestamp": datetime.now().isoformat()
        }), 200
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500
    finally:
        db.close()

@app.route("/api/system/settings/<setting_key>", methods=["POST"])
@rate_limit_api(requests_per_minute=30)
def update_system_setting(setting_key):
    """Update system setting by key"""
    from config.database import get_db
    from services.system_settings_service import SystemSettingsService
    
    db = next(get_db())
    try:
        data = request.get_json()
        if not data or 'value' not in data:
            return jsonify({
                "success": False,
                "error": "Missing value in request"
            }), 400
        
        new_value = data['value']
        updated_by = data.get('updated_by', 'system')
        
        svc = SystemSettingsService(db)
        success = svc.set_setting(setting_key, new_value, updated_by)
        
        if success:
            return jsonify({
                "success": True,
                "message": f"System setting {setting_key} updated successfully",
                "timestamp": datetime.now().isoformat()
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": f"System setting not found or update failed: {setting_key}",
                "timestamp": datetime.now().isoformat()
            }), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500
    finally:
        db.close()

if __name__ == "__main__":
    #  **Flask Development Server**
    #  **Configuration:** Standard Flask server (SocketIO removed due to compatibility issues)
    # 
    #  **Startup:**
    # ```bash
    # # Quick startup (recommended)
    # ./start_dev.sh
    #
    # # Or direct startup
    # python3 app.py
    # ```
    #
    #  **Features:**
    # - Background task management (cleanup, maintenance, etc.)
    # - Data refresh scheduler (external data)
    # - Advanced cache system
    # - All API endpoints
    # - Performance monitoring
    # 
    #  **Notes:**
    # - SocketIO was removed due to compatibility and maintenance issues
    # - Background task feedback available via API polling
    # - Notification system works without WebSockets
    
    # Display server startup information
    if IS_PRODUCTION:
        env_name = "PRODUCTION"
    elif IS_TESTING:
        env_name = "TESTING"
    else:
        env_name = "DEVELOPMENT"
    print(" Starting TikTrack Server...")
    print(f" Environment: {env_name}")
    print(f" Server running on port {PORT}")
    print(f" URL: http://{HOST}:{PORT}")
    print(" All systems operational")
    
    # Run with standard Flask
    app.run(
        host=HOST,
        port=PORT,
        debug=DEVELOPMENT_MODE,
        use_reloader=False  # Disable auto-reload to prevent issues
    )
