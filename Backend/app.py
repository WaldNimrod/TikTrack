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
from routes.api.currencies import currencies_bp
from routes.pages import pages_bp

app = Flask(__name__)
CORS(app)

# Initialize new architecture
logger = setup_logging()
app.logger = logger
init_db()

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
app.register_blueprint(currencies_bp)
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

@app.route("/")
def home() -> Any:
    return send_from_directory(UI_DIR, "index.html")

@app.route("/index.html")
def index_page() -> Any:
    return send_from_directory(UI_DIR, "index.html")

# Routes for UI files
@app.route("/planning")
def planning_page() -> Any:
    return send_from_directory(UI_DIR, "planning.html")

@app.route("/tracking")
def tracking_page() -> Any:
    return send_from_directory(UI_DIR, "tracking.html")

@app.route("/static/<path:filename>")
def static_files(filename: str) -> Any:
    return send_from_directory(UI_DIR, filename)

@app.route("/styles/<path:filename>")
def styles_files(filename: str) -> Any:
    response = send_from_directory(os.path.join(UI_DIR, "styles"), filename)
    if filename.endswith('.css'):
        response.headers['Content-Type'] = 'text/css; charset=utf-8'
    return response

@app.route("/scripts/<path:filename>")
def scripts_files(filename: str) -> Any:
    response = send_from_directory(os.path.join(UI_DIR, "scripts"), filename)
    if filename.endswith('.js'):
        response.headers['Content-Type'] = 'application/javascript; charset=utf-8'
    return response

@app.route("/images/<path:filename>")
def images_files(filename: str) -> Any:
    return send_from_directory(os.path.join(UI_DIR, "images"), filename)

@app.route("/menu.html")
def menu_file() -> Any:
    return send_from_directory(UI_DIR, "menu.html")

@app.route("/test-menu")
def test_menu() -> Any:
    return send_from_directory(UI_DIR, "test-menu.html")



@app.route("/research")
def research() -> Any:
    return send_from_directory(UI_DIR, "research.html")

@app.route("/accounts")
def accounts() -> Any:
    return send_from_directory(UI_DIR, "accounts.html")

@app.route("/alerts")
def alerts() -> Any:
    return send_from_directory(UI_DIR, "alerts.html")

@app.route("/preferences")
def preferences() -> Any:
    return send_from_directory(UI_DIR, "preferences.html")

@app.route("/database")
def database_page() -> Any:
    return send_from_directory(UI_DIR, "database.html")

@app.route("/database.html")
def database_html_page() -> Any:
    return send_from_directory(UI_DIR, "database.html")

@app.route("/designs")
def designs_page() -> Any:
    return send_from_directory(UI_DIR, "designs.html")

@app.route("/designs.html")
def designs_html_page() -> Any:
    return send_from_directory(UI_DIR, "designs.html")

@app.route("/notes")
def notes_page() -> Any:
    """
    Notes page - route without .html
    """
    return send_from_directory(UI_DIR, "notes.html")

@app.route("/notes.html")
def notes_html_page() -> Any:
    """
    Notes page - route with .html (backup)
    """
    return send_from_directory(UI_DIR, "notes.html")

@app.route("/cash_flows")
def cash_flows_page() -> Any:
    """
    Cash flows page - route without .html
    """
    return send_from_directory(UI_DIR, "cash_flows.html")

@app.route("/cash_flows.html")
def cash_flows_html_page() -> Any:
    """
    Cash flows page - route with .html (backup)
    """
    return send_from_directory(UI_DIR, "cash_flows.html")

@app.route("/currencies")
def currencies_page() -> Any:
    """
    Currencies page - route without .html
    """
    return send_from_directory(UI_DIR, "currencies.html")

@app.route("/currencies.html")
def currencies_html_page() -> Any:
    """
    Currencies page - route with .html (backup)
    """
    return send_from_directory(UI_DIR, "currencies.html")

@app.route("/notification-demo")
def notification_demo_page() -> Any:
    """
    Notification demo page - route without .html
    Shows the difference between alert and notification
    """
    return send_from_directory(UI_DIR, "notification-demo.html")

@app.route("/notification-demo.html")
def notification_demo_html_page() -> Any:
    """
    Notification demo page - route with .html (backup)
    """
    return send_from_directory(UI_DIR, "notification-demo.html")

# API for trade plans
@app.route("/api/tradeplans")
def get_trade_plans() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT 
        tp.id,
        tp.account_id,
        tp.ticker_id,
        tp.investment_type,
        tp.side,
        tp.status,
        tp.planned_amount,
        tp.entry_conditions,
        tp.stop_price,
        tp.target_price,
        tp.reasons,
        tp.created_at,
        tp.canceled_at,
        tp.cancel_reason,
        t.symbol as ticker_symbol,
        t.name as ticker_name,
        a.name as account_name
    FROM trade_plans tp
    JOIN tickers t ON tp.ticker_id = t.id
    JOIN accounts a ON tp.account_id = a.id
    ORDER BY tp.created_at DESC
    """
    
    cursor.execute(query)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/tradeplans", methods=["POST"])
def create_trade_plan() -> Any:
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check required fields
        if not data.get('account_id') or not data.get('ticker_id'):
            return jsonify({"status": "error", "message": "Account and ticker are required fields"}), 400
        
        # Create trade plan
        cursor.execute("""
            INSERT INTO trade_plans 
            (account_id, ticker_id, investment_type, planned_amount, entry_conditions, stop_price, target_price, reasons)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['account_id'],
            data['ticker_id'],
            data.get('investment_type', 'long'),
            data.get('planned_amount', 0),
            data.get('entry_conditions', ''),
            data.get('stop_price'),
            data.get('target_price'),
            data.get('reasons', '')
        ))
        
        plan_id = cursor.lastrowid
        
        # Update ticker's active_trades field
        update_ticker_active_status(data['ticker_id'])
        
        conn.commit()
        
        # Return new trade plan
        cursor.execute("SELECT * FROM trade_plans WHERE id = ?", (plan_id,))
        new_plan = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "plan": new_plan}), 201
        
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/trade_plans/<int:plan_id>", methods=["GET"])
def get_trade_plan(plan_id: int) -> Any:
    """Get individual trade plan by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
        SELECT 
            tp.id,
            tp.investment_type,
            tp.planned_amount,
            tp.entry_conditions,
            tp.stop_price,
            tp.target_price,
            tp.reasons,
            tp.created_at,
            tp.canceled_at,
            tp.cancel_reason,
            t.symbol as ticker,
            t.symbol as ticker_name,
            a.name as account_name
        FROM trade_plans tp
        JOIN tickers t ON tp.ticker_id = t.id
        JOIN accounts a ON tp.account_id = a.id
        WHERE tp.id = ?
        """
        
        cursor.execute(query, (plan_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return jsonify({"status": "error", "message": "Plan not found"}), 404
        
        trade_plan = dict(row)
        conn.close()
        return jsonify(trade_plan)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500



# API for trades - now defined in blueprint /api/v1/trades



# API for research - closed trades
@app.route("/api/research/closed-trades")
def get_closed_trades() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT 
        t.id,
        t.status,
        t.type,
        t.created_at,
        t.closed_at,
        t.total_pl,
        t.notes,
        tick.symbol as ticker,
        tick.symbol as ticker_name,
        a.name as account_name,
        tp.planned_amount,
        tp.investment_type
    FROM trades t
    JOIN tickers tick ON t.ticker_id = tick.id
    JOIN accounts a ON t.account_id = a.id
    LEFT JOIN trade_plans tp ON t.trade_plan_id = tp.id
            WHERE t.status = 'closed' OR t.closed_at IS NOT NULL
    ORDER BY t.closed_at DESC
    """
    
    cursor.execute(query)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(rows)

# API for research statistics
@app.route("/api/research/stats")
def get_research_stats() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Statistics for closed trades
        cursor.execute("""
            SELECT 
                COUNT(*) as total_trades,
                SUM(total_pl) as total_profit,
                AVG(total_pl) as avg_profit,
                COUNT(CASE WHEN total_pl > 0 THEN 1 END) as successful_trades,
                COUNT(CASE WHEN total_pl < 0 THEN 1 END) as losing_trades
            FROM trades 
            WHERE status = 'closed' OR closed_at IS NOT NULL
        """)
        
        stats = cursor.fetchone()
        
        # Calculate success rate
        total_trades = stats['total_trades'] or 0
        successful_trades = stats['successful_trades'] or 0
        success_rate = round((successful_trades / total_trades) * 100) if total_trades > 0 else 0
        
        research_stats = {
            "total_trades": total_trades,
            "total_profit": stats['total_profit'] or 0,
            "avg_profit": round(stats['avg_profit'] or 0),
            "success_rate": success_rate,
            "successful_trades": successful_trades,
            "losing_trades": stats['losing_trades'] or 0
        }
        
        conn.close()
        return jsonify(research_stats)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400



# API for statistics
@app.route("/api/stats")
def get_stats() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # General statistics
        cursor.execute("SELECT COUNT(*) as total_plans FROM trade_plans WHERE status = 'open'")
        open_plans = cursor.fetchone()['total_plans']
        
        cursor.execute("SELECT COUNT(*) as total_trades FROM trades WHERE status = 'open'")
        open_trades = cursor.fetchone()['total_trades']
        
        cursor.execute("SELECT SUM(total_pl) as total_pl FROM trades WHERE status = 'closed'")
        total_pl_result = cursor.fetchone()
        total_pl = total_pl_result['total_pl'] or 0
        
        cursor.execute("SELECT COUNT(*) as total_alerts FROM alerts WHERE status = 'open'")
        open_alerts = cursor.fetchone()['total_alerts']
        
        stats = {
            "open_plans": open_plans,
            "open_trades": open_trades,
            "total_pl": total_pl,
            "open_alerts": open_alerts
        }
        
        conn.close()
        return jsonify(stats)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400


# New API for database tables - testing
@app.route("/api/test_tickers")
def test_tickers() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
        SELECT 
            id,
            symbol,
            type,
            remarks,
            currency,
            active_trades
        FROM tickers
        ORDER BY symbol
        """
        
        cursor.execute(query)
        rows = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return jsonify(rows)
        
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route("/api/database_v2/<table_name>")
def get_table_data_v2(table_name: str) -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # List of allowed tables
        allowed_tables = [
            'accounts', 'tickers', 'trade_plans', 'trades', 'executions',
            'open_execution_requests', 'cash_flows', 'alerts', 
            'performance_snapshots', 'notes'
        ]
        
        if table_name not in allowed_tables:
            return jsonify({"error": "Table not allowed"}), 400
        
        # Special queries for tables with relationships
        if table_name == 'tickers':
            query = """
            SELECT 
                id,
                symbol,
                type,
                remarks,
                currency,
                active_trades
            FROM tickers
            ORDER BY symbol
            """
        elif table_name == 'trade_plans':
            query = """
            SELECT 
                tp.*,
                t.symbol as ticker_symbol,
                a.name as account_name
            FROM trade_plans tp
            LEFT JOIN tickers t ON tp.ticker_id = t.id
            LEFT JOIN accounts a ON tp.account_id = a.id
            ORDER BY tp.created_at DESC
            """
        elif table_name == 'trades':
            query = """
            SELECT 
                tr.*,
                t.symbol as ticker_symbol,
                a.name as account_name
            FROM trades tr
            LEFT JOIN tickers t ON tr.ticker_id = t.id
            LEFT JOIN accounts a ON tr.account_id = a.id
            ORDER BY tr.created_at DESC
            """
        elif table_name == 'executions':
            query = """
            SELECT 
                e.*,
                tr.status as trade_status,
                tr.type as trade_type,
                t.symbol as ticker_symbol,
                a.name as account_name
            FROM executions e
            LEFT JOIN trades tr ON e.trade_id = tr.id
            LEFT JOIN tickers t ON tr.ticker_id = t.id
            LEFT JOIN accounts a ON tr.account_id = a.id
            ORDER BY e.date DESC
            """

        elif table_name == 'alerts':
            query = """
            SELECT 
                al.*,
                t.symbol as ticker_symbol,
                a.name as account_name
            FROM alerts al
            LEFT JOIN tickers t ON al.ticker_id = t.id
            LEFT JOIN accounts a ON al.account_id = a.id
            ORDER BY al.created_at DESC
            """
        elif table_name == 'open_execution_requests':
            query = """
            SELECT 
                oer.*,
                tr.status as trade_status,
                tr.created_at as trade_created_at
            FROM open_execution_requests oer
            LEFT JOIN trades tr ON oer.trade_id = tr.id
            ORDER BY oer.created_at DESC
            """
        elif table_name == 'cash_flows':
            query = """
            SELECT 
                cf.*,
                a.name as account_name
            FROM cash_flows cf
            LEFT JOIN accounts a ON cf.account_id = a.id
            ORDER BY cf.date DESC
            """
        elif table_name == 'performance_snapshots':
            query = """
            SELECT 
                ps.*,
                a.name as account_name
            FROM performance_snapshots ps
            LEFT JOIN accounts a ON ps.account_id = a.id
            ORDER BY ps.date DESC
            """
        elif table_name == 'notes':
            query = """
            SELECT 
                n.*,
                a.name as account_name,
                t.symbol as ticker_symbol
            FROM notes n
            LEFT JOIN accounts a ON n.account_id = a.id
            LEFT JOIN trades tr ON n.trade_id = tr.id
            LEFT JOIN tickers t ON tr.ticker_id = t.id
            ORDER BY n.created_at DESC
            """
        else:
            # Regular query for other tables
            query = f"SELECT * FROM {table_name}"
        
        cursor.execute(query)
        rows = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return jsonify(rows)
        
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500
















        cursor.execute("""
            SELECT id, status, created_at, ticker_id 
            FROM trades 
            WHERE account_id = ? AND status = 'open'
        """, (account_id,))
        linked_trades = cursor.fetchall()
        
        if linked_trades:
            trades_info = []
            for trade in linked_trades:
                trades_info.append({
                    'id': trade['id'],
                    'status': trade['status'],
                    'created_at': trade['created_at']
                })
            
            return jsonify({
                "status": "error", 
                "message": f"Cannot delete account '{account_name}' - there are active trades",
                "error_type": "linked_trades",
                "trades": trades_info
            }), 400
        
        # Delete account
        cursor.execute("DELETE FROM accounts WHERE id = ?", (account_id,))
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": f"Account '{account_name}' deleted successfully"})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500


# API for tickers
@app.route("/api/tickers/<int:ticker_id>", methods=["GET"])
def get_ticker(ticker_id: int) -> Any:
    """Get single ticker by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM tickers WHERE id = ?", (ticker_id,))
        ticker = cursor.fetchone()
        
        if not ticker:
            conn.close()
            return jsonify({"status": "error", "message": "Ticker not found"}), 404
        
        ticker_dict = dict(ticker)
        conn.close()
        return jsonify(ticker_dict)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/tickers/<int:ticker_id>/info", methods=["GET"])
def get_ticker_info(ticker_id: int) -> Any:
    """Get ticker information by ID - symbol and currency"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, symbol, currency FROM tickers WHERE id = ?", (ticker_id,))
        ticker = cursor.fetchone()
        
        if not ticker:
            conn.close()
            return jsonify({"status": "error", "message": "Ticker not found"}), 404
        
        ticker_info = {
            "id": ticker['id'],
            "symbol": ticker['symbol'],
            "currency": ticker['currency']
        }
        conn.close()
        return jsonify(ticker_info)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/tickers/symbol/<symbol>", methods=["GET"])
def get_ticker_by_symbol(symbol: str) -> Any:
    """Get ticker information by symbol - symbol and currency"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, symbol, currency FROM tickers WHERE symbol = ?", (symbol,))
        ticker = cursor.fetchone()
        
        if not ticker:
            conn.close()
            return jsonify({"status": "error", "message": "Ticker not found"}), 404
        
        ticker_info = {
            "id": ticker['id'],
            "symbol": ticker['symbol'],
            "currency": ticker['currency']
        }
        conn.close()
        return jsonify(ticker_info)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/tickers", methods=["GET"])
def get_tickers() -> Any:
    """Get all tickers"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM tickers ORDER BY symbol")
        tickers = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(tickers)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/tickers", methods=["POST"])
def create_ticker() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # Check required fields
        if not data.get('symbol'):
            return jsonify({"status": "error", "message": "Symbol is a required field"}), 400
        
        if not data.get('type'):
            return jsonify({"status": "error", "message": "Type is a required field"}), 400
        
        # Validate symbol - only uppercase English letters, dots and numbers
        import re
        symbol_pattern = re.compile(r'^[A-Z0-9.]+$')
        if not symbol_pattern.match(data['symbol']):
            return jsonify({"status": "error", "message": "Symbol can only contain uppercase English letters, numbers and dots"}), 400
        
        # Check if symbol already exists
        cursor.execute("SELECT * FROM tickers WHERE symbol = ?", (data['symbol'],))
        if cursor.fetchone():
            return jsonify({"status": "error", "message": f"Ticker '{data['symbol']}' already exists in the system"}), 400
        
        # Add ticker
        cursor.execute(
            "INSERT INTO tickers (symbol, type, currency, remarks) VALUES (?, ?, ?, ?)",
            (data['symbol'], data.get('type'), data.get('currency', 'USD'), data.get('remarks'))
        )
        conn.commit()
        
        # Return the new ticker
        new_ticker_id = cursor.lastrowid
        cursor.execute("SELECT * FROM tickers WHERE id = ?", (new_ticker_id,))
        new_ticker = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "ticker": new_ticker}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400




        

        
        # Check if there are active alerts linked to this ticker
        cursor.execute("""
            SELECT id, type, condition, status, is_triggered, created_at
            FROM alerts 
            WHERE related_type_id = 4 AND related_id = ? AND status = 'open'
        """, (ticker_id,))
        linked_alerts = cursor.fetchall()
        
        print(f"DEBUG: Checking active alerts for ticker {ticker_id}, found: {len(linked_alerts)} alerts")
        
        if linked_alerts:
            # There are active linked alerts - return an error with details
            alerts_info = []
            for alert in linked_alerts:
                alerts_info.append({
                    'id': alert['id'],
                    'type': alert['type'],
                    'condition': alert['condition'],
                    'status': alert['status'],
                    'is_triggered': alert['is_triggered'],
                    'created_at': alert['created_at']
                })
            
            print(f"DEBUG: Returning error - there are {len(alerts_info)} active linked alerts")
            return jsonify({
                "status": "error", 
                "message": f"Cannot delete ticker '{ticker['symbol']}' - there are active alerts linked to it (only open alerts prevent deletion)",
                "error_type": "linked_alerts",
                "linked_alerts": alerts_info
            }), 400
        
        # No links - can delete
        print(f"DEBUG: No links - deleting ticker {ticker_id}")
        cursor.execute("DELETE FROM tickers WHERE id = ?", (ticker_id,))
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": f"Ticker '{ticker['symbol']}' deleted successfully"})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API for updating active_trades field of all tickers
@app.route("/api/tickers/update-active-status", methods=["POST"])
def update_all_tickers_active() -> Any:
    try:
        update_all_tickers_active_status()
        return jsonify({"status": "success", "message": "active_trades field update completed successfully"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# API for transactions


# API for cash flows
@app.route("/api/cash_flows", methods=["GET"])
def get_cash_flows() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
        SELECT 
            cf.id,
            cf.account_id,
            cf.type,
            cf.amount,
            cf.date,
            cf.description,
            cf.created_at,
            a.name as account_name
        FROM cash_flows cf
        JOIN accounts a ON cf.account_id = a.id
        ORDER BY cf.date DESC, cf.created_at DESC
        """
        
        cursor.execute(query)
        cash_flows = []
        for row in cursor.fetchall():
            cash_flows.append(dict(row))
        
        conn.close()
        return jsonify(cash_flows)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/cash_flows", methods=["POST"])
def create_cash_flow() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # Check required fields
        if not data.get('account_id') or not data.get('amount') or not data.get('flow_type'):
            return jsonify({"status": "error", "message": "Account ID, amount and flow type are required fields"}), 400
        
        # Add cash flow
        cursor.execute(
            "INSERT INTO cash_flows (account_id, date, flow_type, amount, currency, description) VALUES (?, ?, ?, ?, ?, ?)",
            (data['account_id'], data.get('date'), data['flow_type'], data['amount'], data.get('currency'), data.get('description'))
        )
        conn.commit()
        
        # Return the new cash flow
        new_cash_flow_id = cursor.lastrowid
        cursor.execute("SELECT * FROM cash_flows WHERE id = ?", (new_cash_flow_id,))
        new_cash_flow = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "cash_flow": new_cash_flow}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400



# API for notes
@app.route("/api/notes", methods=["GET"])
def get_notes() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
        SELECT 
            n.id,
            n.content,
            n.attachment,
            n.related_type_id,
            n.related_id,
            n.created_at,
            CASE 
                WHEN n.related_type_id = 1 THEN 'Account'
                WHEN n.related_type_id = 2 THEN 'Trade'
                WHEN n.related_type_id = 3 THEN 'Trade Plan'
                WHEN n.related_type_id = 4 THEN 'Ticker'
                ELSE 'Unknown'
            END as related_type_name
        FROM notes n
        ORDER BY n.created_at DESC
        """
        
        cursor.execute(query)
        notes = []
        for row in cursor.fetchall():
            notes.append(dict(row))
        
        conn.close()
        return jsonify(notes)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/notes", methods=["POST"])
def create_note() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # Check required fields
        if not data.get('content'):
            return jsonify({"status": "error", "message": "Content is a required field"}), 400
        
        # Add the note
        cursor.execute(
            "INSERT INTO notes (related_type_id, related_id, content, attachment) VALUES (?, ?, ?, ?)",
            (data.get('related_type_id'), data.get('related_id'), data['content'], data.get('attachment'))
        )
        conn.commit()
        
        # Return the new note
        new_note_id = cursor.lastrowid
        cursor.execute("SELECT * FROM notes WHERE id = ?", (new_note_id,))
        new_note = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "note": new_note}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400



# ===== API ENDPOINTS FOR EXECUTIONS =====

@app.route("/api/executions", methods=["GET"])
def get_executions() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
        SELECT 
            e.id,
            e.trade_id,
            e.action,
            e.date,
            e.quantity,
            e.price,
            e.fee,
            e.source,
            e.created_at,
            t.status as trade_status,
            tick.symbol as ticker_symbol,
            a.name as account_name
        FROM executions e
        JOIN trades t ON e.trade_id = t.id
        JOIN tickers tick ON t.ticker_id = tick.id
        JOIN accounts a ON t.account_id = a.id
        ORDER BY e.date DESC, e.created_at DESC
        """
        
        cursor.execute(query)
        executions = []
        for row in cursor.fetchall():
            executions.append(dict(row))
        
        conn.close()
        return jsonify(executions)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/executions", methods=["POST"])
def create_execution() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # Check required fields
        required_fields = ['trade_id', 'action', 'date', 'quantity', 'price']
        for field in required_fields:
            if field not in data:
                return jsonify({"status": "error", "message": f"Field {field} is required"}), 400
        
        # Add the new execution
        query = """
        INSERT INTO executions (trade_id, action, date, quantity, price, fee, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        
        cursor.execute(query, (
            data['trade_id'],
            data['action'],
            data['date'],
            data['quantity'],
            data['price'],
            data.get('fee', 0),
            data.get('source', 'manual')
        ))
        
        conn.commit()
        
        # Return the new execution
        new_execution_id = cursor.lastrowid
        cursor.execute("SELECT * FROM executions WHERE id = ?", (new_execution_id,))
        new_execution = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "execution": new_execution}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400



# ===== API ENDPOINTS FOR USERS =====

@app.route("/api/users", methods=["GET"])
def get_users() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, username, email, last_login, created_at FROM users ORDER BY created_at DESC")
        users = []
        for row in cursor.fetchall():
            users.append(dict(row))
        
        conn.close()
        return jsonify({"data": users})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id: int) -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, username, email, last_login, created_at FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"status": "error", "message": "User not found"}), 404
        
        conn.close()
        return jsonify({"status": "success", "data": dict(user)})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500



# ===== API ENDPOINTS FOR ACCOUNTS =====

@app.route("/api/accounts", methods=["POST"])
def create_account() -> Any:
    """Create new account"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # Check required fields
        if not data.get('name') or not data.get('currency'):
            return jsonify({"status": "error", "message": "Account name and currency are required fields"}), 400
        
        # Create account
        cursor.execute("""
            INSERT INTO accounts (name, currency, status, cash_balance, total_value, total_pl, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data['name'],
            data['currency'],
            data.get('status', 'open'),
            data.get('cash_balance', 0),
            data.get('total_value', 0),
            data.get('total_pl', 0),
            data.get('notes', '')
        ))
        
        account_id = cursor.lastrowid
        conn.commit()
        
        # Return the new account
        cursor.execute("SELECT * FROM accounts WHERE id = ?", (account_id,))
        new_account = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "data": new_account, "message": "Account created successfully"}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/accounts/<int:account_id>", methods=["PUT"])
def update_account(account_id: int) -> Any:
    """Update account"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # Check if account exists
        cursor.execute("SELECT * FROM accounts WHERE id = ?", (account_id,))
        account = cursor.fetchone()
        
        if not account:
            conn.close()
            return jsonify({"status": "error", "message": "Account not found"}), 404
        
        # Update account
        cursor.execute("""
            UPDATE accounts 
            SET name = ?, currency = ?, status = ?, cash_balance = ?, 
                total_value = ?, total_pl = ?, notes = ?
            WHERE id = ?
        """, (
            data.get('name', account['name']),
            data.get('currency', account['currency']),
            data.get('status', account['status']),
            data.get('cash_balance', account['cash_balance']),
            data.get('total_value', account['total_value']),
            data.get('total_pl', account['total_pl']),
            data.get('notes', account['notes']),
            account_id
        ))
        
        conn.commit()
        
        # Return the updated account
        cursor.execute("SELECT * FROM accounts WHERE id = ?", (account_id,))
        updated_account = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "data": updated_account, "message": "Account updated successfully"}), 200
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/accounts/<int:account_id>", methods=["DELETE"])
def delete_account(account_id: int) -> Any:
    """Delete account"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if account exists
        cursor.execute("SELECT name FROM accounts WHERE id = ?", (account_id,))
        account = cursor.fetchone()
        
        if not account:
            conn.close()
            return jsonify({"status": "error", "message": "Account not found"}), 404
        
        account_name = account['name']
        
        # Check if there are active trades in the account
        cursor.execute("""
            SELECT id, status, created_at, ticker_id 
            FROM trades 
            WHERE account_id = ? AND status = 'open'
        """, (account_id,))
        linked_trades = cursor.fetchall()
        
        if linked_trades:
            trades_info = []
            for trade in linked_trades:
                trades_info.append({
                    'id': trade['id'],
                    'status': trade['status'],
                    'created_at': trade['created_at']
                })
            
            return jsonify({
                "status": "error", 
                "message": f"Cannot delete account '{account_name}' - there are active trades",
                "error_type": "open_trades",
                "trades": trades_info
            }), 400
        
        # Delete account
        cursor.execute("DELETE FROM accounts WHERE id = ?", (account_id,))
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": f"Account '{account_name}' deleted successfully"}), 200
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

# ===== API ENDPOINTS FOR USER ROLES =====

@app.route("/api/user_roles", methods=["GET"])
def get_user_roles() -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT ur.id, ur.user_id, u.username as user_username, ur.role_id, 
                   ur.assigned_at, ur.id as created_at
            FROM user_roles ur
            JOIN users u ON ur.user_id = u.id
            ORDER BY ur.assigned_at DESC
        """)
        user_roles = []
        for row in cursor.fetchall():
            user_roles.append(dict(row))
        
        conn.close()
        return jsonify({"status": "success", "data": user_roles})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/user_roles/<int:user_role_id>", methods=["GET"])
def get_user_role(user_role_id: int) -> Any:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT ur.id, ur.user_id, u.username as user_username, ur.role_id, 
                   ur.assigned_at, ur.id as created_at
            FROM user_roles ur
            JOIN users u ON ur.user_id = u.id
            WHERE ur.id = ?
        """, (user_role_id,))
        user_role = cursor.fetchone()
        
        if not user_role:
            return jsonify({"status": "error", "message": "User role not found"}), 404
        
        conn.close()
        return jsonify({"status": "success", "data": dict(user_role)})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500



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
    # ✅ **הקונפיגורציה החדשה:** Flask development server פשוט ויציב
    
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
