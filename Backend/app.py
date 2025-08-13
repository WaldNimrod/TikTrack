from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# הגדרת טיפול בשגיאות
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "הדף לא נמצא"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "שגיאה פנימית בשרת"}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"error": f"שגיאה: {str(e)}"}), 500

@app.route("/api/health", methods=["GET"])
def health_check():
    """בדיקת בריאות השרת"""
    try:
        # בדיקה חיבור לבסיס הנתונים
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

# נתיב יחסי לקובץ DB
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "simpleTrade.db")

# נתיב לקבצי ה-UI
UI_DIR = "/Users/nimrod/Documents/TikTrack/TikTrackApp/trading-ui"

# בדיקה אם קובץ DB קיים
if not os.path.exists(DB_PATH):
    raise FileNotFoundError(f"Database not found at: {DB_PATH}")

# בדיקה אם תיקיית UI קיימת
if not os.path.exists(UI_DIR):
    raise FileNotFoundError(f"UI directory not found at: {UI_DIR}")

print(f"UI Directory: {UI_DIR}")
print(f"Files in UI directory: {os.listdir(UI_DIR)}")

def get_db_connection():
    try:
        # הגדרות SQLite משופרות ליציבות
        conn = sqlite3.connect(
            DB_PATH, 
            timeout=30.0,  # timeout ארוך יותר
            check_same_thread=False  # מאפשר שימוש מרובה threads
        )
        conn.row_factory = sqlite3.Row
        
        # הגדרות WAL mode לביצועים טובים יותר
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA synchronous=NORMAL")
        conn.execute("PRAGMA cache_size=10000")
        conn.execute("PRAGMA temp_store=MEMORY")
        conn.execute("PRAGMA foreign_keys=ON")
        
        return conn
    except Exception as e:
        print(f"שגיאה בחיבור לבסיס הנתונים: {e}")
        raise

def update_ticker_active_status(ticker_id):
    """
    מעדכן את שדה active_trades של טיקר בהתאם למצב התכנונים והטריידים
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקה אם יש תכנונים פעילים
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM trade_plans 
            WHERE ticker_id = ? AND (canceled_at IS NULL OR canceled_at = '')
        """, (ticker_id,))
        active_plans = cursor.fetchone()['count']
        
        # בדיקה אם יש טריידים פעילים
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM trades 
            WHERE ticker_id = ? AND status IN ('open', 'pending', 'פתוח', 'ממתין')
        """, (ticker_id,))
        active_trades = cursor.fetchone()['count']
        
        # עדכון שדה active_trades
        is_active = (active_plans > 0 or active_trades > 0)
        cursor.execute("""
            UPDATE tickers 
            SET active_trades = ? 
            WHERE id = ?
        """, (is_active, ticker_id))
        
        conn.commit()
        print(f"DEBUG: עדכון active_trades לטיקר {ticker_id}: {is_active} (תכנונים: {active_plans}, טריידים: {active_trades})")
        
    except Exception as e:
        print(f"ERROR: שגיאה בעדכון active_trades לטיקר {ticker_id}: {str(e)}")
        conn.rollback()
    finally:
        conn.close()

def update_all_tickers_active_status():
    """
    מעדכן את שדה active_trades של כל הטיקרים
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # קבלת כל הטיקרים
        cursor.execute("SELECT id FROM tickers")
        tickers = cursor.fetchall()
        
        for ticker in tickers:
            update_ticker_active_status(ticker['id'])
        
        print(f"DEBUG: עדכון active_trades הושלם עבור {len(tickers)} טיקרים")
        
    except Exception as e:
        print(f"ERROR: שגיאה בעדכון כל הטיקרים: {str(e)}")
    finally:
        conn.close()

@app.route("/")
def home():
    return send_from_directory(UI_DIR, "index.html")

@app.route("/index.html")
def index_page():
    return send_from_directory(UI_DIR, "index.html")

# Routes לקבצי ה-UI
@app.route("/planning")
def planning_page():
    return send_from_directory(UI_DIR, "planning.html")

@app.route("/tracking")
def tracking_page():
    return send_from_directory(UI_DIR, "tracking.html")

@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory(UI_DIR, filename)

@app.route("/styles/<path:filename>")
def styles_files(filename):
    return send_from_directory(os.path.join(UI_DIR, "styles"), filename)

@app.route("/scripts/<path:filename>")
def scripts_files(filename):
    return send_from_directory(os.path.join(UI_DIR, "scripts"), filename)

@app.route("/images/<path:filename>")
def images_files(filename):
    return send_from_directory(os.path.join(UI_DIR, "images"), filename)

@app.route("/menu.html")
def menu_file():
    return send_from_directory(UI_DIR, "menu.html")

@app.route("/test-menu")
def test_menu():
    return send_from_directory(UI_DIR, "test-menu.html")

@app.route("/grid-test")
def grid_test():
    return send_from_directory(UI_DIR, "grid-test.html")

@app.route("/grid-test.html")
def grid_test_html():
    return send_from_directory(UI_DIR, "grid-test.html")

@app.route("/grid-table-test")
def grid_table_test():
    return send_from_directory(UI_DIR, "grid-table-test.html")

@app.route("/grid-table-test.html")
def grid_table_test_html():
    return send_from_directory(UI_DIR, "grid-table-test.html")

@app.route("/research")
def research():
    return send_from_directory(UI_DIR, "research.html")

@app.route("/accounts")
def accounts():
    return send_from_directory(UI_DIR, "accounts.html")

@app.route("/alerts")
def alerts():
    return send_from_directory(UI_DIR, "alerts.html")

@app.route("/preferences")
def preferences():
    return send_from_directory(UI_DIR, "preferences.html")

@app.route("/database")
def database_page():
    return send_from_directory(UI_DIR, "database.html")

@app.route("/database.html")
def database_html_page():
    return send_from_directory(UI_DIR, "database.html")

# API עבור תכנוני טריידים
@app.route("/api/tradeplans")
def get_trade_plans():
    conn = get_db_connection()
    cursor = conn.cursor()
    
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
    ORDER BY tp.created_at DESC
    """
    
    cursor.execute(query)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/tradeplans", methods=["POST"])
def create_trade_plan():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקת שדות חובה
        if not data.get('account_id') or not data.get('ticker_id'):
            return jsonify({"status": "error", "message": "חשבון וטיקר הם שדות חובה"}), 400
        
        # יצירת תכנון הטרייד
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
        
        # עדכון שדה active_trades של הטיקר
        update_ticker_active_status(data['ticker_id'])
        
        conn.commit()
        
        # החזרת תכנון הטרייד החדש
        cursor.execute("SELECT * FROM trade_plans WHERE id = ?", (plan_id,))
        new_plan = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "plan": new_plan}), 201
        
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/trade_plans/<int:plan_id>", methods=["GET"])
def get_trade_plan(plan_id):
    """קבלת תכנון טרייד בודד לפי מזהה"""
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
            return jsonify({"status": "error", "message": "תכנון לא נמצא"}), 404
        
        trade_plan = dict(row)
        conn.close()
        return jsonify(trade_plan)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/tradeplans/<int:plan_id>", methods=["PUT"])
def update_trade_plan(plan_id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקה אם תכנון הטרייד קיים
        cursor.execute("SELECT * FROM trade_plans WHERE id = ?", (plan_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "תכנון טרייד לא נמצא"}), 404
        
        # עדכון תכנון הטרייד
        update_fields = []
        params = []
        
        if 'account_id' in data:
            update_fields.append("account_id = ?")
            params.append(data['account_id'])
        
        if 'ticker_id' in data:
            update_fields.append("ticker_id = ?")
            params.append(data['ticker_id'])
        
        if 'investment_type' in data:
            update_fields.append("investment_type = ?")
            params.append(data['investment_type'])
        
        if 'planned_amount' in data:
            update_fields.append("planned_amount = ?")
            params.append(data['planned_amount'])
        
        if 'entry_conditions' in data:
            update_fields.append("entry_conditions = ?")
            params.append(data['entry_conditions'])
        
        if 'stop_price' in data:
            update_fields.append("stop_price = ?")
            params.append(data['stop_price'])
        
        if 'target_price' in data:
            update_fields.append("target_price = ?")
            params.append(data['target_price'])
        
        if 'reasons' in data:
            update_fields.append("reasons = ?")
            params.append(data['reasons'])
        
        if update_fields:
            params.append(plan_id)
            query = f"UPDATE trade_plans SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            
            # עדכון שדה active_trades של הטיקר
            cursor.execute("SELECT ticker_id FROM trade_plans WHERE id = ?", (plan_id,))
            ticker_id = cursor.fetchone()['ticker_id']
            update_ticker_active_status(ticker_id)
            
            conn.commit()
        
        # החזרת תכנון הטרייד המעודכן
        cursor.execute("SELECT * FROM trade_plans WHERE id = ?", (plan_id,))
        updated_plan = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "plan": updated_plan})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/tradeplans/<int:plan_id>", methods=["DELETE"])
def delete_trade_plan(plan_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקה אם תכנון הטרייד קיים
        cursor.execute("SELECT ticker_id FROM trade_plans WHERE id = ?", (plan_id,))
        plan = cursor.fetchone()
        if not plan:
            return jsonify({"status": "error", "message": "תכנון טרייד לא נמצא"}), 404
        
        ticker_id = plan['ticker_id']
        
        # מחיקת תכנון הטרייד
        cursor.execute("DELETE FROM trade_plans WHERE id = ?", (plan_id,))
        
        # עדכון שדה active_trades של הטיקר
        update_ticker_active_status(ticker_id)
        
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": "תכנון טרייד נמחק בהצלחה"})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API עבור טריידים
@app.route("/api/trades")
def get_trades():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT 
        t.id,
        t.status,
        t.type,
        t.opened_at as created_at,
        t.closed_at,
        t.cancelled_at,
        t.total_pl,
        t.notes,
        t.trade_plan_id,
        tick.symbol as ticker,
        tick.symbol as ticker_symbol,
        a.name as account_name
    FROM trades t
    JOIN tickers tick ON t.ticker_id = tick.id
    JOIN accounts a ON t.account_id = a.id
    ORDER BY t.opened_at DESC
    """
    
    cursor.execute(query)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/trades", methods=["POST"])
def create_trade():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקת שדות חובה
        if not data.get('account_id') or not data.get('ticker_id'):
            return jsonify({"status": "error", "message": "חשבון וטיקר הם שדות חובה"}), 400
        
        # יצירת הטרייד
        cursor.execute("""
            INSERT INTO trades 
            (account_id, ticker_id, trade_plan_id, status, type, opened_at, notes, cancelled_at, cancel_reason)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['account_id'],
            data['ticker_id'],
            data.get('trade_plan_id'),
            data.get('status', 'open'),
            data.get('type', 'buy'),
            datetime.now().isoformat(),
            data.get('notes', ''),
            data.get('cancelled_at'),
            data.get('cancel_reason')
        ))
        
        trade_id = cursor.lastrowid
        
        # עדכון שדה active_trades של הטיקר
        update_ticker_active_status(data['ticker_id'])
        
        conn.commit()
        
        # החזרת הטרייד החדש
        cursor.execute("SELECT * FROM trades WHERE id = ?", (trade_id,))
        new_trade = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "trade": new_trade}), 201
        
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API לעריכת טרייד
@app.route("/api/trades/<int:trade_id>", methods=["PUT"])
def update_trade(trade_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקה אם הטרייד קיים
        cursor.execute("SELECT * FROM trades WHERE id = ?", (trade_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "טרייד לא נמצא"}), 404
        
        # עדכון הטרייד
        update_fields = []
        params = []
        
        if 'account_id' in data:
            update_fields.append("account_id = ?")
            params.append(data['account_id'])
        
        if 'ticker_id' in data:
            update_fields.append("ticker_id = ?")
            params.append(data['ticker_id'])
        
        if 'type' in data:
            update_fields.append("type = ?")
            params.append(data['type'])
        
        if 'status' in data:
            update_fields.append("status = ?")
            params.append(data['status'])
        
        if 'notes' in data:
            update_fields.append("notes = ?")
            params.append(data['notes'])
        
        if 'cancelled_at' in data:
            update_fields.append("cancelled_at = ?")
            params.append(data['cancelled_at'])
        
        if 'cancel_reason' in data:
            update_fields.append("cancel_reason = ?")
            params.append(data['cancel_reason'])
        
        if update_fields:
            params.append(trade_id)
            query = f"UPDATE trades SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            
            # עדכון שדה active_trades של הטיקר
            cursor.execute("SELECT ticker_id FROM trades WHERE id = ?", (trade_id,))
            ticker_id = cursor.fetchone()['ticker_id']
            update_ticker_active_status(ticker_id)
            
            conn.commit()
        
        # החזרת הטרייד המעודכן
        cursor.execute("SELECT * FROM trades WHERE id = ?", (trade_id,))
        updated_trade = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "trade": updated_trade})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API למחיקת טרייד
@app.route("/api/trades/<int:trade_id>", methods=["DELETE"])
def delete_trade(trade_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקה אם הטרייד קיים
        cursor.execute("SELECT ticker_id FROM trades WHERE id = ?", (trade_id,))
        trade = cursor.fetchone()
        if not trade:
            return jsonify({"status": "error", "message": "טרייד לא נמצא"}), 404
        
        ticker_id = trade['ticker_id']
        
        # מחיקת הטרייד
        cursor.execute("DELETE FROM trades WHERE id = ?", (trade_id,))
        
        # עדכון שדה active_trades של הטיקר
        update_ticker_active_status(ticker_id)
        
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": "טרייד נמחק בהצלחה"})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API עבור תחקיר - טריידים סגורים
@app.route("/api/research/closed-trades")
def get_closed_trades():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT 
        t.id,
        t.status,
        t.type,
        t.opened_at,
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
    WHERE t.status = 'סגור' OR t.closed_at IS NOT NULL
    ORDER BY t.closed_at DESC
    """
    
    cursor.execute(query)
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(rows)

# API עבור סטטיסטיקות תחקיר
@app.route("/api/research/stats")
def get_research_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # סטטיסטיקות לטריידים סגורים
        cursor.execute("""
            SELECT 
                COUNT(*) as total_trades,
                SUM(total_pl) as total_profit,
                AVG(total_pl) as avg_profit,
                COUNT(CASE WHEN total_pl > 0 THEN 1 END) as successful_trades,
                COUNT(CASE WHEN total_pl < 0 THEN 1 END) as losing_trades
            FROM trades 
            WHERE status = 'סגור' OR closed_at IS NOT NULL
        """)
        
        stats = cursor.fetchone()
        
        # חישוב אחוז הצלחה
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



# API עבור סטטיסטיקות
@app.route("/api/stats")
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # סטטיסטיקות כללית
        cursor.execute("SELECT COUNT(*) as total_plans FROM trade_plans WHERE canceled_at IS NULL")
        active_plans = cursor.fetchone()['total_plans']
        
        cursor.execute("SELECT COUNT(*) as total_trades FROM trades WHERE status = 'פתוח'")
        open_trades = cursor.fetchone()['total_trades']
        
        cursor.execute("SELECT SUM(total_pl) as total_pl FROM trades WHERE status = 'סגור'")
        total_pl_result = cursor.fetchone()
        total_pl = total_pl_result['total_pl'] or 0
        
        cursor.execute("SELECT COUNT(*) as total_alerts FROM alerts WHERE status = 'פעיל'")
        active_alerts = cursor.fetchone()['total_alerts']
        
        stats = {
            "active_plans": active_plans,
            "open_trades": open_trades,
            "total_pl": total_pl,
            "active_alerts": active_alerts
        }
        
        conn.close()
        return jsonify(stats)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400


# API חדש לטבלאות בסיס הנתונים - בדיקה
@app.route("/api/test_tickers")
def test_tickers():
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
def get_table_data_v2(table_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # רשימת הטבלאות המותרות
        allowed_tables = [
            'accounts', 'tickers', 'trade_plans', 'trades', 'executions',
            'open_execution_requests', 'cash_flows', 'alerts', 
            'performance_snapshots', 'notes'
        ]
        
        if table_name not in allowed_tables:
            return jsonify({"error": "טבלה לא מורשית"}), 400
        
        # שאילתות מיוחדות לטבלאות עם קשרים
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
                t.symbol as ticker_symbol
            FROM executions e
            LEFT JOIN trades tr ON e.trade_id = tr.id
            LEFT JOIN tickers t ON tr.ticker_id = t.id
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
            # שאילתה רגילה לטבלאות אחרות
            query = f"SELECT * FROM {table_name}"
        
        cursor.execute(query)
        rows = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return jsonify(rows)
        
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

# API עבור חשבונות
@app.route("/api/accounts")
def get_accounts():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = """
    SELECT 
        a.id,
        a.name,
        a.status,
        a.currency,
        a.notes,
        COALESCE(SUM(t.total_pl), 0) as total_profit_loss,
        COALESCE(SUM(tp.planned_amount), 0) as total_deposits,
        COALESCE(SUM(CASE WHEN t.status = 'פתוח' THEN tp.planned_amount ELSE 0 END), 0) as open_positions_cost,
        COALESCE(SUM(CASE WHEN t.status = 'פתוח' THEN t.total_pl + tp.planned_amount ELSE 0 END), 0) as holdings_value
    FROM accounts a
    LEFT JOIN trades t ON a.id = t.account_id
    LEFT JOIN trade_plans tp ON t.trade_plan_id = tp.id
    GROUP BY a.id, a.name, a.status, a.currency, a.notes
    ORDER BY a.id
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    
    # עיבוד הנתונים לפורמט הרצוי
    accounts = []
    for row in rows:
        account = dict(row)
        
        # חישוב שווי נקי
        net_value = account['total_deposits'] + account['total_profit_loss']
        
        # חישוב אחוז רווח
        profit_percentage = 0
        if account['total_deposits'] > 0:
            profit_percentage = round((account['total_profit_loss'] / account['total_deposits']) * 100, 1)
        
        # יתרת מזומן אמיתית מהטבלה
        cash_balance = account.get('cash_balance', 0)
        
        accounts.append({
            'id': account['id'],
            'name': account['name'],
            'net_value': net_value,
            'profit_loss': account['total_profit_loss'],
            'profit_percentage': profit_percentage,
            'mtm': account['total_profit_loss'],  # Mark to Market
            'cash_balance': cash_balance,
            'net_deposits': account['total_deposits'],
            'positions_cost': account['open_positions_cost'],
            'holdings_value': account['holdings_value'],
            'status': account['status'],
            'currency': account['currency'],
            'notes': account['notes']
        })
    
    conn.close()
    return jsonify(accounts)

# API עבור סטטיסטיקות חשבונות
@app.route("/api/accounts/stats")
def get_accounts_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # סטטיסטיקות חשבונות
        cursor.execute("""
            SELECT 
                COUNT(*) as total_accounts,
                COUNT(CASE WHEN a.status = 'פעיל' THEN 1 END) as active_accounts,
                SUM(COALESCE(t.total_pl, 0)) as total_profit_loss,
                SUM(COALESCE(tp.planned_amount, 0)) as total_deposits
            FROM accounts a
            LEFT JOIN trades t ON a.id = t.account_id
            LEFT JOIN trade_plans tp ON t.trade_plan_id = tp.id
        """)
        
        stats = cursor.fetchone()
        
        # חישוב אחוז רווח
        total_deposits = stats['total_deposits'] or 0
        total_profit_loss = stats['total_profit_loss'] or 0
        profit_percentage = 0
        if total_deposits > 0:
            profit_percentage = round((total_profit_loss / total_deposits) * 100, 1)
        
        accounts_stats = {
            "total_accounts": stats['total_accounts'] or 0,
            "active_accounts": stats['active_accounts'] or 0,
            "total_value": total_deposits + total_profit_loss,
            "total_profit_loss": total_profit_loss,
            "profit_percentage": profit_percentage
        }
        
        conn.close()
        return jsonify(accounts_stats)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API להוספת חשבון חדש
@app.route("/api/accounts", methods=["POST"])
def create_account():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקת נתונים נדרשים
        required_fields = ['name', 'currency']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"status": "error", "message": f"שדה {field} הוא חובה"}), 400
        
        # הכנסת חשבון חדש
        cursor.execute("""
            INSERT INTO accounts (name, status, currency, cash_balance, total_value, total_pl, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data['name'],
            data.get('status', 'פתוח'),
            data['currency'],
            data.get('cash_balance', 0),
            data.get('total_value', 0),
            data.get('total_pl', 0),
            data.get('notes', '')
        ))
        
        account_id = cursor.lastrowid
        conn.commit()
        
        # החזרת החשבון החדש
        cursor.execute("SELECT * FROM accounts WHERE id = ?", (account_id,))
        new_account = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "account": new_account}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API לעריכת חשבון
@app.route("/api/accounts/<int:account_id>", methods=["PUT"])
def update_account(account_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקה אם החשבון קיים
        cursor.execute("SELECT * FROM accounts WHERE id = ?", (account_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "חשבון לא נמצא"}), 404
        
        # עדכון החשבון
        update_fields = []
        params = []
        
        if 'name' in data:
            update_fields.append("name = ?")
            params.append(data['name'])
        
        if 'status' in data:
            update_fields.append("status = ?")
            params.append(data['status'])
        
        if 'currency' in data:
            update_fields.append("currency = ?")
            params.append(data['currency'])
        
        if 'notes' in data:
            update_fields.append("notes = ?")
            params.append(data['notes'])
        
        if 'cash_balance' in data:
            update_fields.append("cash_balance = ?")
            params.append(data['cash_balance'])
        
        if 'total_value' in data:
            update_fields.append("total_value = ?")
            params.append(data['total_value'])
        
        if 'total_pl' in data:
            update_fields.append("total_pl = ?")
            params.append(data['total_pl'])
        
        if update_fields:
            params.append(account_id)
            
            query = f"UPDATE accounts SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        # החזרת החשבון המעודכן
        cursor.execute("SELECT * FROM accounts WHERE id = ?", (account_id,))
        updated_account = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "account": updated_account})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API לביטול חשבון (עדכון סטטוס ל"מבוטל")
@app.route("/api/accounts/<int:account_id>", methods=["DELETE"])
def cancel_account(account_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקה אם החשבון קיים
        cursor.execute("SELECT * FROM accounts WHERE id = ?", (account_id,))
        account = cursor.fetchone()
        if not account:
            return jsonify({"status": "error", "message": "חשבון לא נמצא"}), 404
        
        # בדיקה אם יש טריידים פתוחים
        cursor.execute("""
            SELECT t.id, t.opened_at, tk.symbol as ticker_symbol
            FROM trades t
            JOIN tickers tk ON t.ticker_id = tk.id
            WHERE t.account_id = ? AND t.status IN ('open', 'pending', 'פתוח', 'ממתין')
        """, (account_id,))
        open_trades = cursor.fetchall()
        
        print(f"DEBUG: בדיקת טריידים לחשבון {account_id}, נמצאו: {len(open_trades)} טריידים פתוחים")
        
        if open_trades:
            # החזרת פרטי הטריידים הפתוחים
            trades_info = []
            for trade in open_trades:
                trades_info.append({
                    'id': trade['id'],
                    'ticker': trade['ticker_symbol'],
                    'opened_at': trade['opened_at']
                })
            
            response_data = {
                "status": "error", 
                "message": f"לא ניתן לבטל חשבון '{account['name']}' - יש טריידים פתוחים",
                "error_type": "open_trades",
                "trades": trades_info
            }
            print(f"DEBUG: מחזיר response: {response_data}")
            return jsonify(response_data), 400
        
        # עדכון סטטוס החשבון ל"מבוטל"
        cursor.execute("UPDATE accounts SET status = 'מבוטל' WHERE id = ?", (account_id,))
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": f"חשבון '{account['name']}' בוטל בהצלחה"})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API להתראות
@app.route("/api/alerts")
def get_alerts():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            SELECT 
                a.id,
                a.alert_type as type,
                a.condition as description,
                a.status,
                a.created_at,
                a.triggered_at,
                t.symbol as ticker,
                acc.name as account_name
            FROM alerts a
            LEFT JOIN tickers t ON a.ticker_id = t.id
            LEFT JOIN accounts acc ON a.account_id = acc.id
            ORDER BY a.created_at DESC
        """)
        
        rows = cursor.fetchall()
        alerts = []
        
        for row in rows:
            alert = dict(row)
            # יצירת כותרת מהטיקר והסוג
            ticker_symbol = alert.get('ticker', 'UNKNOWN')
            alert['title'] = f"{ticker_symbol} - {alert['type']}"
            # הוספת עדיפות ברירת מחדל
            alert['priority'] = 'בינונית'
            # הוספת שדה updated_at
            alert['updated_at'] = alert['created_at']
            
            alerts.append(alert)
        
        conn.close()
        return jsonify(alerts)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API להוספת התראה
@app.route("/api/alerts", methods=["POST"])
def create_alert():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקת נתונים נדרשים
        if not data.get('condition'):
            return jsonify({"status": "error", "message": "תנאי הוא שדה חובה"}), 400
        
        # הכנסת התראה חדשה
        cursor.execute("""
            INSERT INTO alerts (account_id, ticker_id, alert_type, condition, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            data.get('account_id'),
            data.get('ticker_id'),
            data.get('alert_type', 'price'),
            data['condition'],
            data.get('status', 'active'),
            datetime.now().isoformat()
        ))
        
        alert_id = cursor.lastrowid
        conn.commit()
        
        # החזרת ההתראה החדשה
        cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
        new_alert = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "alert": new_alert}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API לעריכת התראה
@app.route("/api/alerts/<int:alert_id>", methods=["PUT"])
def update_alert(alert_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקה אם ההתראה קיימת
        cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "התראה לא נמצאה"}), 404
        
        # עדכון ההתראה
        update_fields = []
        params = []
        
        if 'account_id' in data:
            update_fields.append("account_id = ?")
            params.append(data['account_id'])
        
        if 'ticker_id' in data:
            update_fields.append("ticker_id = ?")
            params.append(data['ticker_id'])
        
        if 'alert_type' in data:
            update_fields.append("alert_type = ?")
            params.append(data['alert_type'])
        
        if 'condition' in data:
            update_fields.append("condition = ?")
            params.append(data['condition'])
        
        if 'status' in data:
            update_fields.append("status = ?")
            params.append(data['status'])
        
        if update_fields:
            params.append(alert_id)
            query = f"UPDATE alerts SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        # החזרת ההתראה המעודכנת
        cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
        updated_alert = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "alert": updated_alert})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API למחיקת התראה
@app.route("/api/alerts/<int:alert_id>", methods=["DELETE"])
def delete_alert(alert_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקה אם ההתראה קיימת
        cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "התראה לא נמצאה"}), 404
        
        # מחיקת ההתראה
        cursor.execute("DELETE FROM alerts WHERE id = ?", (alert_id,))
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": "התראה נמחקה בהצלחה"})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API לטיקרים
@app.route("/api/tickers/<int:ticker_id>", methods=["GET"])
def get_ticker(ticker_id):
    """קבלת טיקר בודד לפי מזהה"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT * FROM tickers WHERE id = ?", (ticker_id,))
        ticker = cursor.fetchone()
        
        if not ticker:
            conn.close()
            return jsonify({"status": "error", "message": "טיקר לא נמצא"}), 404
        
        ticker_dict = dict(ticker)
        conn.close()
        return jsonify(ticker_dict)
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/tickers/<int:ticker_id>/info", methods=["GET"])
def get_ticker_info(ticker_id):
    """קבלת מידע על טיקר לפי מזהה - סימבול ומטבע"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, symbol, currency FROM tickers WHERE id = ?", (ticker_id,))
        ticker = cursor.fetchone()
        
        if not ticker:
            conn.close()
            return jsonify({"status": "error", "message": "טיקר לא נמצא"}), 404
        
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
def get_ticker_by_symbol(symbol):
    """קבלת מידע על טיקר לפי סימבול - סימבול ומטבע"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, symbol, currency FROM tickers WHERE symbol = ?", (symbol,))
        ticker = cursor.fetchone()
        
        if not ticker:
            conn.close()
            return jsonify({"status": "error", "message": "טיקר לא נמצא"}), 404
        
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
def get_tickers():
    """קבלת כל הטיקרים"""
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
def create_ticker():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקת שדות חובה
        if not data.get('symbol'):
            return jsonify({"status": "error", "message": "סימבול הוא שדה חובה"}), 400
        
        if not data.get('type'):
            return jsonify({"status": "error", "message": "סוג הוא שדה חובה"}), 400
        
        # בדיקת תקינות הסימבול - רק אותיות גדולות באנגלית, נקודות ומספרים
        import re
        symbol_pattern = re.compile(r'^[A-Z0-9.]+$')
        if not symbol_pattern.match(data['symbol']):
            return jsonify({"status": "error", "message": "סימבול יכול להכיל רק אותיות גדולות באנגלית, מספרים ונקודות"}), 400
        
        # בדיקה אם הסימבול כבר קיים
        cursor.execute("SELECT * FROM tickers WHERE symbol = ?", (data['symbol'],))
        if cursor.fetchone():
            return jsonify({"status": "error", "message": f"הטיקר '{data['symbol']}' כבר קיים במערכת"}), 400
        
        # הוספת הטיקר
        cursor.execute(
            "INSERT INTO tickers (symbol, type, currency, remarks) VALUES (?, ?, ?, ?)",
            (data['symbol'], data.get('type'), data.get('currency', 'USD'), data.get('remarks'))
        )
        conn.commit()
        
        # החזרת הטיקר החדש
        new_ticker_id = cursor.lastrowid
        cursor.execute("SELECT * FROM tickers WHERE id = ?", (new_ticker_id,))
        new_ticker = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "ticker": new_ticker}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/tickers/<int:ticker_id>", methods=["PUT"])
def update_ticker(ticker_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקה אם הטיקר קיים
        cursor.execute("SELECT * FROM tickers WHERE id = ?", (ticker_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "טיקר לא נמצא"}), 404
        
        # בדיקה אם הסימבול החדש כבר קיים בטיקר אחר
        if 'symbol' in data:
            cursor.execute("SELECT * FROM tickers WHERE symbol = ? AND id != ?", (data['symbol'], ticker_id))
            if cursor.fetchone():
                return jsonify({"status": "error", "message": f"הטיקר '{data['symbol']}' כבר קיים במערכת"}), 400
        
        # עדכון הטיקר
        update_fields = []
        params = []
        
        if 'symbol' in data:
            update_fields.append("symbol = ?")
            params.append(data['symbol'])
        
        if 'type' in data:
            update_fields.append("type = ?")
            params.append(data['type'])
        
        if 'currency' in data:
            update_fields.append("currency = ?")
            params.append(data['currency'])
        
        if 'remarks' in data:
            update_fields.append("remarks = ?")
            params.append(data['remarks'])
        
        if update_fields:
            params.append(ticker_id)
            query = f"UPDATE tickers SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        # החזרת הטיקר המעודכן
        cursor.execute("SELECT * FROM tickers WHERE id = ?", (ticker_id,))
        updated_ticker = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "ticker": updated_ticker})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/tickers/<int:ticker_id>", methods=["DELETE"])
def delete_ticker(ticker_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקה אם הטיקר קיים
        cursor.execute("SELECT * FROM tickers WHERE id = ?", (ticker_id,))
        ticker = cursor.fetchone()
        if not ticker:
            return jsonify({"status": "error", "message": "טיקר לא נמצא"}), 404
        
        # בדיקה אם יש תכנוני טריידים פעילים המקושרים לטיקר זה
        cursor.execute("""
            SELECT id, created_at, investment_type, planned_amount 
            FROM trade_plans 
            WHERE ticker_id = ? AND (canceled_at IS NULL OR canceled_at = '')
        """, (ticker_id,))
        linked_plans = cursor.fetchall()
        
        print(f"DEBUG: בדיקת תכנונים פעילים לטיקר {ticker_id}, נמצאו: {len(linked_plans)} תכנונים")
        
        # בדיקה אם יש טריידים פעילים המקושרים לטיקר זה
        cursor.execute("""
            SELECT id, status, opened_at, total_pl 
            FROM trades 
            WHERE ticker_id = ? AND status IN ('open', 'pending', 'פתוח', 'ממתין')
        """, (ticker_id,))
        linked_trades = cursor.fetchall()
        
        print(f"DEBUG: בדיקת טריידים פעילים לטיקר {ticker_id}, נמצאו: {len(linked_trades)} טריידים")
        
        # אם יש תכנונים פעילים או טריידים פעילים - מחזיר שגיאה
        if linked_plans or linked_trades:
            plans_info = []
            trades_info = []
            
            if linked_plans:
                for plan in linked_plans:
                    plans_info.append({
                        'id': plan['id'],
                        'created_at': plan['created_at'],
                        'investment_type': plan['investment_type'],
                        'planned_amount': plan['planned_amount']
                    })
            
            if linked_trades:
                for trade in linked_trades:
                    trades_info.append({
                        'id': trade['id'],
                        'status': trade['status'],
                        'opened_at': trade['opened_at'],
                        'total_pl': trade['total_pl']
                    })
            
            # בניית הודעת שגיאה מתאימה
            error_message = f"לא ניתן למחוק טיקר '{ticker['symbol']}' - יש "
            if linked_plans and linked_trades:
                error_message += f"תכנוני טריידים פעילים ({len(linked_plans)}) וטריידים פעילים ({len(linked_trades)}) המקושרים אליו"
                error_type = "linked_plans_and_trades"
            elif linked_plans:
                error_message += f"תכנוני טריידים פעילים ({len(linked_plans)}) המקושרים אליו"
                error_type = "linked_plans"
            else:
                error_message += f"טריידים פעילים ({len(linked_trades)}) המקושרים אליו"
                error_type = "linked_trades"
            
            error_message += " (רק תכנונים וטריידים בסטטוס פתוח מונעים מחיקה)"
            
            print(f"DEBUG: מחזיר שגיאה - יש {len(plans_info)} תכנונים ו-{len(trades_info)} טריידים פעילים")
            
            response_data = {
                "status": "error", 
                "message": error_message,
                "error_type": error_type
            }
            
            if plans_info:
                response_data["linked_plans"] = plans_info
            if trades_info:
                response_data["linked_trades"] = trades_info
                
            return jsonify(response_data), 400
        

        
        # בדיקה אם יש התראות פעילות המקושרות לטיקר זה
        cursor.execute("""
            SELECT id, alert_type, condition, status, created_at 
            FROM alerts 
            WHERE ticker_id = ? AND status IN ('active', 'פעיל')
        """, (ticker_id,))
        linked_alerts = cursor.fetchall()
        
        print(f"DEBUG: בדיקת התראות פעילות לטיקר {ticker_id}, נמצאו: {len(linked_alerts)} התראות")
        
        if linked_alerts:
            # יש התראות פעילות מקושרות - מחזיר שגיאה עם פרטי ההתראות
            alerts_info = []
            for alert in linked_alerts:
                alerts_info.append({
                    'id': alert['id'],
                    'alert_type': alert['alert_type'],
                    'condition': alert['condition'],
                    'status': alert['status'],
                    'created_at': alert['created_at']
                })
            
            print(f"DEBUG: מחזיר שגיאה - יש {len(alerts_info)} התראות פעילות מקושרות")
            return jsonify({
                "status": "error", 
                "message": f"לא ניתן למחוק טיקר '{ticker['symbol']}' - יש התראות פעילות המקושרות אליו (רק התראות בסטטוס פעיל מונעות מחיקה)",
                "error_type": "linked_alerts",
                "linked_alerts": alerts_info
            }), 400
        
        # אין קשרים - ניתן למחוק
        print(f"DEBUG: אין קשרים - מוחק טיקר {ticker_id}")
        cursor.execute("DELETE FROM tickers WHERE id = ?", (ticker_id,))
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": f"טיקר '{ticker['symbol']}' נמחק בהצלחה"})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API לעדכון שדה active_trades של כל הטיקרים
@app.route("/api/tickers/update-active-status", methods=["POST"])
def update_all_tickers_active():
    try:
        update_all_tickers_active_status()
        return jsonify({"status": "success", "message": "עדכון שדה active_trades הושלם בהצלחה"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# API לטרנזקציות
@app.route("/api/executions", methods=["POST"])
def create_execution():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקת שדות חובה
        if not data.get('trade_id') or not data.get('action') or not data.get('quantity') or not data.get('price'):
            return jsonify({"status": "error", "message": "מזהה טרייד, פעולה, כמות ומחיר הם שדות חובה"}), 400
        
        # הוספת הטרנזקציה
        cursor.execute(
            "INSERT INTO executions (trade_id, action, date, quantity, price, fee, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (data['trade_id'], data['action'], data.get('date'), data['quantity'], data['price'], data.get('fee'), data.get('source'))
        )
        conn.commit()
        
        # החזרת הטרנזקציה החדשה
        new_execution_id = cursor.lastrowid
        cursor.execute("SELECT * FROM executions WHERE id = ?", (new_execution_id,))
        new_execution = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "execution": new_execution}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/executions/<int:execution_id>", methods=["PUT"])
def update_execution(execution_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקה אם הטרנזקציה קיימת
        cursor.execute("SELECT * FROM executions WHERE id = ?", (execution_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "טרנזקציה לא נמצאה"}), 404
        
        # עדכון הטרנזקציה
        update_fields = []
        params = []
        
        if 'trade_id' in data:
            update_fields.append("trade_id = ?")
            params.append(data['trade_id'])
        
        if 'action' in data:
            update_fields.append("action = ?")
            params.append(data['action'])
        
        if 'date' in data:
            update_fields.append("date = ?")
            params.append(data['date'])
        
        if 'quantity' in data:
            update_fields.append("quantity = ?")
            params.append(data['quantity'])
        
        if 'price' in data:
            update_fields.append("price = ?")
            params.append(data['price'])
        
        if 'fee' in data:
            update_fields.append("fee = ?")
            params.append(data['fee'])
        
        if 'source' in data:
            update_fields.append("source = ?")
            params.append(data['source'])
        
        if update_fields:
            params.append(execution_id)
            query = f"UPDATE executions SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        # החזרת הטרנזקציה המעודכנת
        cursor.execute("SELECT * FROM executions WHERE id = ?", (execution_id,))
        updated_execution = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "execution": updated_execution})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/executions/<int:execution_id>", methods=["DELETE"])
def delete_execution(execution_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקה אם הטרנזקציה קיימת
        cursor.execute("SELECT * FROM executions WHERE id = ?", (execution_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "טרנזקציה לא נמצאה"}), 404
        
        # מחיקת הטרנזקציה
        cursor.execute("DELETE FROM executions WHERE id = ?", (execution_id,))
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": "טרנזקציה נמחקה בהצלחה"})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API לתזרים מזומנים
@app.route("/api/cash_flows", methods=["POST"])
def create_cash_flow():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקת שדות חובה
        if not data.get('account_id') or not data.get('amount') or not data.get('flow_type'):
            return jsonify({"status": "error", "message": "מזהה חשבון, סכום וסוג תזרים הם שדות חובה"}), 400
        
        # הוספת תזרים המזומנים
        cursor.execute(
            "INSERT INTO cash_flows (account_id, date, flow_type, amount, currency, description) VALUES (?, ?, ?, ?, ?, ?)",
            (data['account_id'], data.get('date'), data['flow_type'], data['amount'], data.get('currency'), data.get('description'))
        )
        conn.commit()
        
        # החזרת תזרים המזומנים החדש
        new_cash_flow_id = cursor.lastrowid
        cursor.execute("SELECT * FROM cash_flows WHERE id = ?", (new_cash_flow_id,))
        new_cash_flow = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "cash_flow": new_cash_flow}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/cash_flows/<int:cash_flow_id>", methods=["PUT"])
def update_cash_flow(cash_flow_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקה אם תזרים המזומנים קיים
        cursor.execute("SELECT * FROM cash_flows WHERE id = ?", (cash_flow_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "תזרים מזומנים לא נמצא"}), 404
        
        # עדכון תזרים המזומנים
        update_fields = []
        params = []
        
        if 'account_id' in data:
            update_fields.append("account_id = ?")
            params.append(data['account_id'])
        
        if 'date' in data:
            update_fields.append("date = ?")
            params.append(data['date'])
        
        if 'flow_type' in data:
            update_fields.append("flow_type = ?")
            params.append(data['flow_type'])
        
        if 'amount' in data:
            update_fields.append("amount = ?")
            params.append(data['amount'])
        
        if 'currency' in data:
            update_fields.append("currency = ?")
            params.append(data['currency'])
        
        if 'description' in data:
            update_fields.append("description = ?")
            params.append(data['description'])
        
        if update_fields:
            params.append(cash_flow_id)
            query = f"UPDATE cash_flows SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        # החזרת תזרים המזומנים המעודכן
        cursor.execute("SELECT * FROM cash_flows WHERE id = ?", (cash_flow_id,))
        updated_cash_flow = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "cash_flow": updated_cash_flow})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/cash_flows/<int:cash_flow_id>", methods=["DELETE"])
def delete_cash_flow(cash_flow_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקה אם תזרים המזומנים קיים
        cursor.execute("SELECT * FROM cash_flows WHERE id = ?", (cash_flow_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "תזרים מזומנים לא נמצא"}), 404
        
        # מחיקת תזרים המזומנים
        cursor.execute("DELETE FROM cash_flows WHERE id = ?", (cash_flow_id,))
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": "תזרים מזומנים נמחק בהצלחה"})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

# API להערות
@app.route("/api/notes", methods=["POST"])
def create_note():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקת שדות חובה
        if not data.get('content'):
            return jsonify({"status": "error", "message": "תוכן הוא שדה חובה"}), 400
        
        # הוספת ההערה
        cursor.execute(
            "INSERT INTO notes (account_id, trade_id, trade_plan_id, content, attachment) VALUES (?, ?, ?, ?, ?)",
            (data.get('account_id'), data.get('trade_id'), data.get('trade_plan_id'), data['content'], data.get('attachment'))
        )
        conn.commit()
        
        # החזרת ההערה החדשה
        new_note_id = cursor.lastrowid
        cursor.execute("SELECT * FROM notes WHERE id = ?", (new_note_id,))
        new_note = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "note": new_note}), 201
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        data = request.get_json()
        
        # בדיקה אם ההערה קיימת
        cursor.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "הערה לא נמצאה"}), 404
        
        # עדכון ההערה
        update_fields = []
        params = []
        
        if 'account_id' in data:
            update_fields.append("account_id = ?")
            params.append(data['account_id'])
        
        if 'trade_id' in data:
            update_fields.append("trade_id = ?")
            params.append(data['trade_id'])
        
        if 'trade_plan_id' in data:
            update_fields.append("trade_plan_id = ?")
            params.append(data['trade_plan_id'])
        
        if 'content' in data:
            update_fields.append("content = ?")
            params.append(data['content'])
        
        if 'attachment' in data:
            update_fields.append("attachment = ?")
            params.append(data['attachment'])
        
        if update_fields:
            params.append(note_id)
            query = f"UPDATE notes SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        # החזרת ההערה המעודכנת
        cursor.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
        updated_note = dict(cursor.fetchone())
        
        conn.close()
        return jsonify({"status": "success", "note": updated_note})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # בדיקה אם ההערה קיימת
        cursor.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
        if not cursor.fetchone():
            return jsonify({"status": "error", "message": "הערה לא נמצאה"}), 404
        
        # מחיקת ההערה
        cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        conn.commit()
        
        conn.close()
        return jsonify({"status": "success", "message": "הערה נמחקה בהצלחה"})
        
    except Exception as e:
        conn.close()
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == "__main__":
    # הגדרות יציבות לשרת
    app.run(
        debug=False,  # כיבוי debug mode למניעת רילוד אוטומטי
        host='127.0.0.1',  # הגדרת host ספציפי
        port=5002,
        threaded=True,  # תמיכה ב-multiple threads
        use_reloader=False  # כיבוי reloader למניעת רילוד אוטומטי
    )
