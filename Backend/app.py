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
    /api/accounts            # Accounts
    /api/trades              # Trades
    /api/tickers             # Tickers
    /api/trade_plans         # Plans
    /api/alerts              # Alerts
    /api/cash_flows          # Cash flows
    /api/notes               # Notes
    /api/executions          # Executions
    /api/v1/tests/run        # Run tests (testing system)

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

# Import new architecture components
from config.database import init_db
from config.logging import setup_logging
from utils.performance_monitor import log_system_metrics, PerformanceTracker
from utils.error_handlers import ErrorHandler
from services.cache_service import cache_service
from services.health_service import health_service
from services.metrics_collector import metrics_collector
from services.database_optimizer import database_optimizer
# from services.background_tasks import background_task_manager
from utils.response_optimizer import ResponseOptimizer
from utils.rate_limiter import rate_limiter, rate_limit_api

# Import blueprints
from routes.api.accounts import accounts_bp
from routes.api.tickers import tickers_bp
from routes.api.trades import trades_bp
from routes.api.trade_plans import trade_plans_bp
from routes.api.alerts import alerts_bp
from routes.api.cash_flows import cash_flows_bp
from routes.api.notes import notes_bp
from routes.api.executions import executions_bp
from routes.api.preferences import preferences_bp
from routes.api.users import users_bp


from routes.api.constraints import constraints_bp
from routes.api.currencies import currencies_bp
from routes.api.linked_items import linked_items_bp
from routes.api.note_relation_types import note_relation_types_bp
from routes.api.js_map import js_map_bp
from routes.api.cache_management import cache_management_bp
from routes.api.query_optimization import query_optimization_bp

from routes.pages import pages_bp

app = Flask(__name__)
CORS(app)

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
app.register_blueprint(accounts_bp)
app.register_blueprint(tickers_bp)
app.register_blueprint(trades_bp)
app.register_blueprint(trade_plans_bp)
app.register_blueprint(alerts_bp)
app.register_blueprint(cash_flows_bp)
app.register_blueprint(notes_bp)
app.register_blueprint(executions_bp)
app.register_blueprint(preferences_bp)
app.register_blueprint(users_bp)


app.register_blueprint(constraints_bp)
app.register_blueprint(currencies_bp)
app.register_blueprint(linked_items_bp)
app.register_blueprint(note_relation_types_bp)
app.register_blueprint(js_map_bp)
app.register_blueprint(cache_management_bp)
app.register_blueprint(query_optimization_bp)
app.register_blueprint(pages_bp)

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

@app.route("/api/cache/stats", methods=["GET"])
@rate_limit_api(requests_per_minute=60)
def cache_stats() -> Any:
    """Get cache statistics"""
    try:
        stats = cache_service.get_stats()
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
    """Clear all cache"""
    try:
        cache_service.clear()
        return jsonify({
            "status": "success",
            "message": "Cache cleared successfully",
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

# Relative path to DB file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "db", "simpleTrade_new.db")

# Path to UI files
UI_DIR = "/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui"

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



# API for trades - now defined in blueprint /api/v1/trades



# Research API routes are now handled by blueprints



# Statistics API routes are now handled by blueprints


# Database API routes are now handled by blueprints
















# Ticker API routes are now handled by blueprints




        

        


# Cash flows API routes are now handled by blueprints



# Notes API routes are now handled by blueprints



# Executions API routes are now handled by blueprints



# Users API routes are now handled by blueprints



# Accounts API routes are now handled by blueprints

# User roles API routes are now handled by blueprints



if __name__ == "__main__":
    # 🎯 **New Configuration - Flask Simple Development Server**
    # 
    # 🚀 **Startup:**
    # ```bash
    # # Quick startup (recommended)
    # ./start_dev.sh
    #
    # # Or direct startup
    # python3 run_flask_simple.py
    # ```
    #
    # 📁 **Old Configuration Archive:**
    # - **Location:** `backups/20250820_flask_simple_configuration/`
    # - **Date:** August 20, 2025
    # - **Status:** Archive - not in use
    #
    # ✅ **New Configuration:** Simple and stable Flask development server
    
    
    app.run(
        host='127.0.0.1',
        port=8080,
        debug=True,
        use_reloader=False  # Disable auto-reload to prevent issues
    )
