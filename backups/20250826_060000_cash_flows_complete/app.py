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

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
import sys # Added for sys.exit

# Import new architecture components
from config.database import init_db
from config.logging import setup_logging

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
from routes.api.tests import tests_bp
from routes.api.test_suite import test_suite_bp
from routes.api.constraints import constraints_bp
from routes.api.currencies import currencies_bp
from routes.api.linked_items import linked_items_bp
from routes.api.note_relation_types import note_relation_types_bp

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
    init_db()
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
app.register_blueprint(tests_bp)
app.register_blueprint(test_suite_bp)
app.register_blueprint(constraints_bp)
app.register_blueprint(currencies_bp)
app.register_blueprint(linked_items_bp)
app.register_blueprint(note_relation_types_bp)

app.register_blueprint(pages_bp)

# Error handling setup
@app.errorhandler(404)
def not_found(error) -> Any:
    return jsonify({"error": "Page not found"}), 404

@app.errorhandler(500)
def internal_error(error) -> Any:
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(Exception)
def handle_exception(e: Exception) -> Any:
    return jsonify({"error": f"Error: {str(e)}"}), 500

@app.route("/api/health", methods=["GET"])
def health_check() -> Any:
    """Server health check"""
    try:
        # Check database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()
        conn.close()
        
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "database": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
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

print(f"UI Directory: {UI_DIR}")
print(f"Files in UI directory: {os.listdir(UI_DIR)}")

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
        print(f"Database connection error: {e}")
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
        print(f"DEBUG: active_trades update for ticker {ticker_id}: {is_active} (plans: {open_plans}, trades: {open_trades})")
        
    except Exception as e:
        print(f"ERROR: active_trades update error for ticker {ticker_id}: {str(e)}")
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
        
        print(f"DEBUG: active_trades update completed for {len(tickers)} tickers")
        
    except Exception as e:
        print(f"ERROR: error updating all tickers: {str(e)}")
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
    
    print("🚀 Starting Flask development server...")
    print("📍 Server running on http://127.0.0.1:8080")
    print("⚡ Debug mode enabled")
    print("📝 Detailed logs enabled")
    print("-" * 50)
    
    app.run(
        host='127.0.0.1',
        port=8080,
        debug=True,
        use_reloader=False  # Disable auto-reload to prevent issues
    )
