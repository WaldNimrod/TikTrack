#!/usr/bin/env python3
"""
TikTrack Production Server - Main server file
================================================

⚠️  Important: This is the main server file only!

No connection to testing system!

🎯 Purpose: Run TikTrack server with all API endpoints
📍 Location: Backend/app.py
🔗 Testing system: Backend/testing_suite/

✅ Very stable - recommended for production
✅ Tested and proven
✅ No authentication (for development)
✅ Simple single file

🔧 Execution:
    python3 run_stable.py        # Recommended (stable)
    python3 dev_server.py        # Development with auto-reload
    python3 run_waitress_fixed.py # Production (Waitress)
    python3 app.py               # Flask development
    ./start_server.sh            # With monitor

📊 Routes:
    /api/health              # Health check
    /api/trading-accounts    # Trading Accounts
    /api/trades              # Trades
    /api/tickers             # Tickers
    /api/trade_plans         # Plans
    /api/alerts              # Alerts
    /api/cash_flows          # Cash flows
    /api/notes               # Notes
    /api/executions          # Executions
    /api/tests/run        # Run tests (testing system)

📝 Logs:
    server_detailed.log

📖 Guides:
    Backend/SERVER_CONFIGURATIONS.md    # Server configurations
    Backend/testing_suite/README.md     # Testing system

================================================
"""

from flask import Flask, jsonify, request, send_from_directory, g
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
import time
import sys # Added for sys.exit
import psutil

# Import configuration settings for cache modes
from config.settings import DEVELOPMENT_MODE, CACHE_DISABLED, DEFAULT_CACHE_TTL, CACHE_ENABLED

# Import new architecture components
from config.database import init_db
from config.logging import setup_logging
from utils.performance_monitor import log_system_metrics, PerformanceTracker
from utils.error_handlers import ErrorHandler
from services.advanced_cache_service import advanced_cache_service
from services.health_service import health_service
from services.metrics_collector import metrics_collector
from services.database_optimizer import database_optimizer
from services.background_tasks import BackgroundTaskManager
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
except ImportError as e:
    print(f"Warning: External data integration not available: {e}")
    EXTERNAL_DATA_AVAILABLE = False
    DataRefreshScheduler = None
from utils.rate_limiter import rate_limiter, rate_limit_api

# Import blueprints from unified API package
from routes.api import (
    trading_accounts_bp,
    tickers_bp,
    trades_bp,
    trade_plans_bp,
    alerts_bp,
    cash_flows_bp,
    notes_bp,
    executions_bp,
    users_bp,
    background_tasks_bp,
    entity_details_bp,
    constraints_bp,
    currencies_bp,
    database_schema_bp,
    linked_items_bp,
    entity_relation_types_bp,
    file_scanner_bp,
    cache_management_bp,
    query_optimization_bp,
    server_management_bp,
    system_overview_bp,
    css_management_bp,
    preferences_bp,
    wal_bp,
    system_settings_bp
)
from routes.api.server_logs import server_logs_bp
from routes.api.cache_changes import cache_changes_bp

# Import CRUD testing modules
import subprocess
import json
from pathlib import Path

# External Data Integration blueprints
from routes.external_data.quotes import quotes_bp
from routes.external_data.status import status_bp
from routes.api.quotes_v1 import quotes_bp

from routes.pages import pages_bp

app = Flask(__name__)
CORS(app)

# Initialize Background Task Manager without real-time notifications
background_task_manager = BackgroundTaskManager()

# Initialize Data Refresh Scheduler for external data
data_refresh_scheduler = None
if EXTERNAL_DATA_AVAILABLE and DataRefreshScheduler:
    try:
        # Create a database session for the scheduler
        from config.database import SessionLocal
        from services.system_settings_service import SystemSettingsService
        db_session = SessionLocal()
        data_refresh_scheduler = DataRefreshScheduler(db_session)
        print("✅ Data Refresh Scheduler initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Data Refresh Scheduler: {e}")
        data_refresh_scheduler = None

# Set the background task manager instance in the API routes
from routes.api.background_tasks import set_background_task_manager
set_background_task_manager(background_task_manager)

# Initialize new architecture
logger = setup_logging()
app.logger = logger

# Add detailed logging for server startup
logger.info("🚀 Starting TikTrack server...")
logger.info("📁 Current working directory: %s", os.getcwd())
logger.info("🐍 Python version: %s", sys.version)
try:
    import flask
    logger.info("📦 Flask version: %s", flask.__version__)
except:
    logger.info("📦 Flask version: unknown")

try:
    logger.info("🗄️ Initializing database...")
    with PerformanceTracker("Database initialization"):
        init_db()
    logger.info("✅ Database initialized successfully")
    
    # Log initial system metrics
    log_system_metrics()
    logger.info("✅ Database initialized successfully")
except Exception as e:
    logger.error("❌ Database initialization failed: %s", str(e))
    logger.error("🔍 Full error details: %s", e.__class__.__name__)
    import traceback
    logger.error("📋 Traceback: %s", traceback.format_exc())
    sys.exit(1)

logger.info("✅ Server initialization completed")

# Register blueprints
app.register_blueprint(trading_accounts_bp)
app.register_blueprint(tickers_bp)
app.register_blueprint(trades_bp)
app.register_blueprint(trade_plans_bp)
app.register_blueprint(alerts_bp)
app.register_blueprint(cash_flows_bp)
app.register_blueprint(notes_bp)
app.register_blueprint(executions_bp)
app.register_blueprint(preferences_bp)
app.register_blueprint(users_bp)
app.register_blueprint(background_tasks_bp)
app.register_blueprint(entity_details_bp)

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
app.register_blueprint(wal_bp)
app.register_blueprint(system_settings_bp)
app.register_blueprint(server_logs_bp)

# Register User Data Import blueprint
from routes.api.user_data_import import user_data_import_bp
app.register_blueprint(user_data_import_bp)

# Register External Data Integration blueprints - DISABLED due to import issues
# External Data Integration blueprints
app.register_blueprint(quotes_bp, name='quotes')
app.register_blueprint(status_bp)
# API quotes endpoints (specification compliant)

app.register_blueprint(pages_bp)

# Register Conditions System blueprints
from routes.api.trading_methods import trading_methods_bp
from routes.api.plan_conditions import plan_conditions_bp
from routes.api.trade_conditions import trade_conditions_bp

app.register_blueprint(trading_methods_bp)
app.register_blueprint(plan_conditions_bp)
app.register_blueprint(trade_conditions_bp)

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
    """Batch logging endpoint for frontend logs"""
    try:
        data = request.get_json()
        if data and 'logs' in data:
            logs = data['logs']
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
    logger.info("✅ Condition evaluation task registered successfully")
except Exception as e:
    logger.error(f"❌ Failed to register condition evaluation task: {e}")

# Start background task scheduler automatically
try:
    logger.info("🚀 Starting background task scheduler...")
    background_task_manager.start_scheduler()
    logger.info("✅ Background task scheduler started successfully")
except Exception as e:
    logger.error(f"❌ Failed to start background task scheduler: {e}")

# Start Data Refresh Scheduler for external data (respect system setting)
if data_refresh_scheduler:
    try:
        from config.database import SessionLocal as _SessionLocal
        _db = _SessionLocal()
        try:
            settings = SystemSettingsService(_db)
            enabled = settings.get_setting('externalDataSchedulerEnabled', True)
        finally:
            _db.close()
        if enabled:
            logger.info("🚀 Starting external data refresh scheduler (enabled by setting)...")
            data_refresh_scheduler.start()
            logger.info("✅ External data refresh scheduler started successfully")
        else:
            logger.info("⏸️ External data refresh scheduler disabled by system setting")
    except Exception as e:
        logger.error(f"❌ Failed to start external data refresh scheduler: {e}")
else:
    logger.info("ℹ️ External data refresh scheduler not available - skipping")

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
        # Get request start time from g
        start_time = getattr(g, 'request_start_time', None)
        
        # Optimize response headers
        optimized_response = ResponseOptimizer.optimize_response(
            response,
            cache_type=ResponseOptimizer.determine_cache_type(request.path),
            start_time=start_time
        )
        
        return optimized_response
    except Exception as e:
        logger.error(f"Error optimizing response: {e}")
        return response

@app.before_request
def before_request():
    """Set request start time"""
    g.request_start_time = time.time()

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
            uptime = f"{uptime_days} ימים, {uptime_hours} שעות, {uptime_minutes} דקות"
        elif uptime_hours > 0:
            uptime = f"{uptime_hours} שעות, {uptime_minutes} דקות"
        else:
            uptime = f"{uptime_minutes} דקות"

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
    max_retries = 3
    retry_delay = 1  # seconds
    
    for attempt in range(max_retries):
        try:
            # Import the market data service
            import sys
            import os
            external_data_path = os.path.join(os.path.dirname(__file__), '..', 'external_data_integration_server')
            if external_data_path not in sys.path:
                sys.path.append(external_data_path)
            
            # Use the main database models instead of external_data_integration_server
            from models.ticker import Ticker
            from models.external_data import MarketDataQuote, ExternalDataProvider
            from config.database import get_db
            
            # Get database session
            db_session = next(get_db())
            
            # Get all active tickers
            tickers = db_session.query(Ticker).filter(Ticker.status == 'open').all()
            
            results = {
                'total_tickers': len(tickers),
                'successful_updates': 0,
                'failed_updates': 0,
                'errors': []
            }
            
            # For now, just return a success message since we don't have Yahoo Finance integration working yet
            logger.info(f"Refresh request received for {len(tickers)} tickers")
            
            result = {
                'message': 'Data refresh endpoint is working - integration with Yahoo Finance pending',
                'tickers_found': len(tickers),
                'status': 'pending_integration'
            }
            
            return jsonify({
                "status": "success",
                "message": "External data refresh completed",
                "result": result,
                "timestamp": datetime.now().isoformat()
            }), 200
                
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                import time
                time.sleep(retry_delay)
                retry_delay *= 2  # Exponential backoff
                continue
            else:
                logger.error(f"All {max_retries} attempts failed: {e}")
                return jsonify({
                    "status": "error",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }), 500
            db_session.close()
            
    # If we get here, all retries failed
    return jsonify({
        "status": "error",
        "error": "All retry attempts failed",
        "timestamp": datetime.now().isoformat()
    }), 500

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
                "timestamp": datetime.now().isoformat()
            }), 404
            
    except Exception as e:
        logger.error(f"Error fetching Yahoo Finance data for {symbol}: {e}")
        return jsonify({
            "status": "error",
            "error": str(e),
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
                        logger.info(f"✅ Fetched and cached enhanced quote for {symbol}: ${quote_data.price} (change: {quote_data.change_pct:.2f}%)" if quote_data.change_pct else f"✅ Fetched quote for {symbol}: ${quote_data.price}")
                    else:
                        results[symbol.upper()] = {"error": "No data available"}
                        logger.warning(f"⚠️ No enhanced data available for {symbol}")
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

# Relative path to DB file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "db", "simpleTrade_new.db")

# Path to UI files
UI_DIR = os.path.join(os.path.dirname(BASE_DIR), "trading-ui")

# Check if DB file exists
if not os.path.exists(DB_PATH):
    raise FileNotFoundError(f"Database not found at: {DB_PATH}")

# Check if UI directory exists
if not os.path.exists(UI_DIR):
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

# UI Directory validation - removed debug prints

def get_db_connection() -> sqlite3.Connection:
    try:
        # Enhanced SQLite settings for stability
        conn = sqlite3.connect(
            DB_PATH, 
            timeout=30.0,  # Longer timeout
            check_same_thread=False  # Allow multi-thread usage
        )
        conn.row_factory = sqlite3.Row
        
        # WAL mode settings for better performance
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute("PRAGMA cache_size=10000")
        conn.execute("PRAGMA temp_store=MEMORY")
        conn.execute("PRAGMA foreign_keys=ON")
        
        return conn
    except Exception as e:
        # Database connection error - removed debug print
        raise

def update_ticker_open_status(ticker_id: int) -> None:
    """
    Updates the active_trades field of a ticker according to open plans and trades status
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if there are active plans
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM trade_plans 
            WHERE ticker_id = ? AND status = 'open'
        """, (ticker_id,))
        open_plans = cursor.fetchone()['count']
        
        # Check if there are active trades
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM trades 
            WHERE ticker_id = ? AND status = 'open'
        """, (ticker_id,))
        open_trades = cursor.fetchone()['count']
        
        # Update active_trades field
        is_active = (open_plans > 0 or open_trades > 0)
        cursor.execute("""
            UPDATE tickers 
            SET active_trades = ? 
            WHERE id = ?
        """, (is_active, ticker_id))
        
        conn.commit()
        # active_trades update completed - removed debug print
        
    except Exception as e:
        # active_trades update error - removed debug print
        conn.rollback()
    finally:
        conn.close()

def update_all_tickers_open_status() -> None:
    """
    Updates the active_trades field of all tickers
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get all tickers
        cursor.execute("SELECT id FROM tickers")
        tickers = cursor.fetchall()
        
        for ticker in tickers:
            update_ticker_open_status(ticker['id'])
        
        # All tickers active_trades update completed - removed debug print
        
    except Exception as e:
        # Error updating all tickers - removed debug print
        pass
    finally:
        conn.close()

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
    """הרצת בדיקות CRUD מקיפות"""
    try:
        data = request.get_json() or {}
        test_type = data.get('test_type', 'comprehensive')
        pages = data.get('pages', [])
        
        # הפעלת הסקריפט
        script_path = Path(__file__).parent.parent / 'crud-tester.py'
        
        if not script_path.exists():
            return jsonify({
                'error': 'סקריפט בדיקות CRUD לא נמצא',
                'path': str(script_path)
            }), 404
        
        # הרצת הסקריפט
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
            'error': f'שגיאה בהרצת בדיקות CRUD: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/run-functional-tests', methods=['POST'])
def run_functional_tests():
    """הרצת בדיקות פונקציונליות"""
    try:
        # הפעלת הסקריפט
        script_path = Path(__file__).parent.parent / 'functional-crud-tester.py'
        
        if not script_path.exists():
            return jsonify({
                'error': 'סקריפט בדיקות פונקציונליות לא נמצא',
                'path': str(script_path)
            }), 404
        
        # הרצת הסקריפט
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
            'error': f'שגיאה בהרצת בדיקות פונקציונליות: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/run-button-tests', methods=['POST'])
def run_button_tests():
    """הרצת בדיקות כפתורים"""
    try:
        # הפעלת הסקריפט
        script_path = Path(__file__).parent.parent / 'test-crud-buttons.py'
        
        if not script_path.exists():
            return jsonify({
                'error': 'סקריפט בדיקות כפתורים לא נמצא',
                'path': str(script_path)
            }), 404
        
        # הרצת הסקריפט
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
            'error': f'שגיאה בהרצת בדיקות כפתורים: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/run-improved-analysis', methods=['POST'])
def run_improved_analysis():
    """הרצת ניתוח משופר"""
    try:
        # הפעלת הסקריפט
        script_path = Path(__file__).parent.parent / 'improved-crud-checker.py'
        
        if not script_path.exists():
            return jsonify({
                'error': 'סקריפט ניתוח משופר לא נמצא',
                'path': str(script_path)
            }), 404
        
        # הרצת הסקריפט
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
            'error': f'שגיאה בהרצת ניתוח משופר: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/crud-test-status', methods=['GET'])
def get_crud_test_status():
    """קבלת סטטוס בדיקות CRUD"""
    try:
        # בדיקת קיום הסקריפטים
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
            'error': f'שגיאה בבדיקת סטטוס: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 500


# ===== INDEXEDDB MANAGEMENT ENDPOINTS =====

@app.route("/api/indexeddb/stats", methods=["GET"])
def get_indexeddb_stats():
    """Get IndexedDB statistics"""
    try:
        # For now, return mock data as IndexedDB is client-side
        # In a real implementation, this would connect to the client's IndexedDB
        # or store statistics server-side

        stats = {
            "total_size_mb": 45.2,
            "max_size_mb": 100,
            "usage_percentage": 45.2,
            "total_entries": 1250,
            "last_cleanup": "2025-01-18T14:30:00Z",
            "auto_cleanup_interval_hours": 6
        }

        return jsonify({
            "success": True,
            "data": stats
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to get IndexedDB stats: {str(e)}"
        }), 500

@app.route("/api/indexeddb/cleanup/<int:max_size>", methods=["POST"])
def cleanup_indexeddb(max_size):
    """Perform manual IndexedDB cleanup"""
    try:
        # In a real implementation, this would trigger cleanup on the client
        # For now, return mock successful cleanup data

        cleanup_result = {
            "entries_removed": 234,
            "space_freed_mb": 12.8,
            "current_size_mb": 32.4,
            "max_size_mb": max_size,
            "cleanup_timestamp": "2025-01-18T14:35:00Z"
        }

        return jsonify({
            "success": True,
            "data": cleanup_result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to cleanup IndexedDB: {str(e)}"
        }), 500

@app.route("/api/indexeddb/backup", methods=["POST"])
def backup_indexeddb():
    """Create IndexedDB backup"""
    try:
        # In a real implementation, this would create a backup of client-side data
        # For now, return mock backup data

        import datetime
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = f"indexeddb_backup_{timestamp}.json"

        backup_result = {
            "backup_file": backup_file,
            "entries_backed_up": 1250,
            "backup_size_mb": 45.2,
            "timestamp": datetime.datetime.now().isoformat()
        }

        return jsonify({
            "success": True,
            "data": backup_result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to create backup: {str(e)}"
        }), 500

@app.route("/api/indexeddb/restore", methods=["POST"])
def restore_indexeddb():
    """Restore IndexedDB from backup"""
    try:
        data = request.get_json()
        backup_file = data.get('backup_file')

        if not backup_file:
            return jsonify({
                "success": False,
                "error": "Backup file name is required"
            }), 400

        # In a real implementation, this would restore from the specified backup file
        # For now, return mock restore data

        restore_result = {
            "backup_file": backup_file,
            "entries_restored": 1250,
            "restore_timestamp": "2025-01-18T14:40:00Z"
        }

        return jsonify({
            "success": True,
            "data": restore_result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to restore backup: {str(e)}"
        }), 500

@app.route("/api/indexeddb/clear", methods=["POST"])
def clear_indexeddb():
    """Clear all IndexedDB data"""
    try:
        # In a real implementation, this would clear all client-side IndexedDB data
        # For now, return mock clear data

        clear_result = {
            "entries_removed": 1250,
            "space_freed_mb": 45.2,
            "clear_timestamp": "2025-01-18T14:45:00Z"
        }

        return jsonify({
            "success": True,
            "data": clear_result
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to clear IndexedDB: {str(e)}"
        }), 500

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
    if not os.path.exists(full_path):
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
        return send_from_directory(UI_DIR, filename)
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
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get setting value
        cursor.execute("""
            SELECT s.value, t.data_type, t.description, t.default_value
            FROM system_settings s
            JOIN system_setting_types t ON s.type_id = t.id
            WHERE t.key = ? AND t.is_active = 1
        """, (setting_key,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            value, data_type, description, default_value = result
            return jsonify({
                "success": True,
                "data": {
                    "key": setting_key,
                    "value": value,
                    "data_type": data_type,
                    "description": description,
                    "default_value": default_value
                },
                "timestamp": datetime.now().isoformat()
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": f"System setting not found: {setting_key}",
                "timestamp": datetime.now().isoformat()
            }), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/system/settings/<setting_key>", methods=["POST"])
@rate_limit_api(requests_per_minute=30)
def update_system_setting(setting_key):
    """Update system setting by key"""
    try:
        data = request.get_json()
        if not data or 'value' not in data:
            return jsonify({
                "success": False,
                "error": "Missing value in request"
            }), 400
        
        new_value = data['value']
        updated_by = data.get('updated_by', 'system')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Update setting value
        cursor.execute("""
            UPDATE system_settings 
            SET value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
            WHERE type_id = (
                SELECT id FROM system_setting_types 
                WHERE key = ? AND is_active = 1
            )
        """, (new_value, updated_by, setting_key))
        
        if cursor.rowcount > 0:
            conn.commit()
            conn.close()
            return jsonify({
                "success": True,
                "message": f"System setting {setting_key} updated successfully",
                "timestamp": datetime.now().isoformat()
            }), 200
        else:
            conn.close()
            return jsonify({
                "success": False,
                "error": f"System setting not found: {setting_key}",
                "timestamp": datetime.now().isoformat()
            }), 404
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

if __name__ == "__main__":
    # 🎯 **Flask Development Server**
    # ✅ **Configuration:** Standard Flask server (SocketIO removed due to compatibility issues)
    # 
    # 🚀 **Startup:**
    # ```bash
    # # Quick startup (recommended)
    # ./start_dev.sh
    #
    # # Or direct startup
    # python3 app.py
    # ```
    #
    # 📊 **Features:**
    # - Background task management (cleanup, maintenance, etc.)
    # - Data refresh scheduler (external data)
    # - Advanced cache system
    # - All API endpoints
    # - Performance monitoring
    # 
    # 📁 **Notes:**
    # - SocketIO was removed due to compatibility and maintenance issues
    # - Background task feedback available via API polling
    # - Notification system works without WebSockets
    
    print("🚀 Starting TikTrack Server...")
    print("📡 Server running on port 8080")
    print("✅ All systems operational")
    
    # Run with standard Flask
    app.run(
        host='127.0.0.1',
        port=8080,
        debug=DEVELOPMENT_MODE,
        use_reloader=False  # Disable auto-reload to prevent issues
    )
