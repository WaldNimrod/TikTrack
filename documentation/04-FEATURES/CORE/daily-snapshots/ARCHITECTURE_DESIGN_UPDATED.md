# עיצוב ארכיטקטורה מעודכן - מערכת שמירת מצב יומית
# Updated Architecture Design - Daily Snapshot System

**תאריך יצירה:** 19 ינואר 2025  
**גרסה:** 2.0 (User-Centered Design)  
**סטטוס:** ✅ מעודכן לפי ממשקים  
**מטרה:** עיצוב ארכיטקטורה מפורטת לפי דרישות הממשקים

---

## 📋 סקירה כללית

מסמך זה מגדיר את הארכיטקטורה המלאה של מערכת שמירת מצב יומית, **מעודכן לפי דרישות הממשקים והמוקאפים**:
- מבנה טבלאות (8 טבלאות נפרדות)
- שירותים
- API endpoints (15+ endpoints)
- אינטגרציה עם מערכות קיימות

**שינוי עיקרי:** במקום טבלה אחת עם JSON, יש 8 טבלאות נפרדות עם שדות מוגדרים.

---

## 🗄️ מבנה טבלאות (מעודכן)

### 1. daily_snapshots (טבלה מרכזית למעקב)

#### סכמה
```sql
CREATE TABLE daily_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT,  -- JSON עם מטא-דאטה נוספת
    UNIQUE(snapshot_date)
);

CREATE INDEX idx_snapshots_date ON daily_snapshots(snapshot_date);
```

#### הסבר
- **snapshot_date:** תאריך ה-snapshot (UNIQUE - רק אחד ליום)
- **metadata:** מטא-דאטה נוספת (JSON, אופציונלי)
- **created_at:** תאריך/שעה יצירה

---

### 2. daily_account_states (מצב חשבונות יומי)

#### סכמה
```sql
CREATE TABLE daily_account_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    trading_account_id INTEGER NOT NULL,
    cash_balance DECIMAL(15, 2) NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
    realized_pl DECIMAL(15, 2) DEFAULT 0,
    unrealized_pl DECIMAL(15, 2) DEFAULT 0,
    total_pl DECIMAL(15, 2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, trading_account_id),
    FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id)
);

CREATE INDEX idx_account_states_date ON daily_account_states(snapshot_date);
CREATE INDEX idx_account_states_account ON daily_account_states(trading_account_id);
CREATE INDEX idx_account_states_date_account ON daily_account_states(snapshot_date, trading_account_id);
```

#### הסבר
- שמירת מצב כל חשבון מסחר בכל יום
- כולל יתרות, שווי, ו-P/L

---

### 3. daily_position_states (מצב פוזיציות יומי) - **קריטי!**

#### סכמה
```sql
CREATE TABLE daily_position_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    trading_account_id INTEGER NOT NULL,
    ticker_id INTEGER NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL,
    direction VARCHAR(10) NOT NULL,  -- 'long' or 'short'
    average_price DECIMAL(15, 4) NOT NULL,
    market_price DECIMAL(15, 4) NOT NULL,
    market_value DECIMAL(15, 2) NOT NULL,
    realized_pl DECIMAL(15, 2) DEFAULT 0,
    unrealized_pl DECIMAL(15, 2) DEFAULT 0,
    total_pl DECIMAL(15, 2) DEFAULT 0,
    pl_percentage DECIMAL(10, 4) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, trading_account_id, ticker_id),
    FOREIGN KEY (trading_account_id) REFERENCES trading_accounts(id),
    FOREIGN KEY (ticker_id) REFERENCES tickers(id)
);

CREATE INDEX idx_position_states_date ON daily_position_states(snapshot_date);
CREATE INDEX idx_position_states_account ON daily_position_states(trading_account_id);
CREATE INDEX idx_position_states_ticker ON daily_position_states(ticker_id);
CREATE INDEX idx_position_states_date_account_ticker ON daily_position_states(snapshot_date, trading_account_id, ticker_id);
```

#### הסבר
- **קריטי!** שמירת מצב כל פוזיציה בכל יום
- מאפשר תצוגת מצב תיק היסטורי מדויק

---

### 4. daily_trade_states (מצב טריידים יומי)

#### סכמה
```sql
CREATE TABLE daily_trade_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    trade_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,  -- 'open', 'closed', 'cancelled'
    realized_pl DECIMAL(15, 2) DEFAULT 0,
    unrealized_pl DECIMAL(15, 2) DEFAULT 0,
    total_pl DECIMAL(15, 2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, trade_id),
    FOREIGN KEY (trade_id) REFERENCES trades(id)
);

CREATE INDEX idx_trade_states_date ON daily_trade_states(snapshot_date);
CREATE INDEX idx_trade_states_trade ON daily_trade_states(trade_id);
CREATE INDEX idx_trade_states_date_trade ON daily_trade_states(snapshot_date, trade_id);
```

#### הסבר
- שמירת מצב כל טרייד בכל יום
- מאפשר היסטוריית טרייד

---

### 5. daily_execution_states (מצב ביצועים יומי)

#### סכמה
```sql
CREATE TABLE daily_execution_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    execution_id INTEGER NOT NULL,
    trade_id INTEGER NOT NULL,
    action VARCHAR(10) NOT NULL,  -- 'buy', 'sell', 'short', 'cover'
    quantity DECIMAL(15, 4) NOT NULL,
    price DECIMAL(15, 4) NOT NULL,
    fee DECIMAL(15, 2) DEFAULT 0,
    realized_pl DECIMAL(15, 2) DEFAULT 0,
    mtm_pl DECIMAL(15, 2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, execution_id),
    FOREIGN KEY (execution_id) REFERENCES executions(id),
    FOREIGN KEY (trade_id) REFERENCES trades(id)
);

CREATE INDEX idx_execution_states_date ON daily_execution_states(snapshot_date);
CREATE INDEX idx_execution_states_execution ON daily_execution_states(execution_id);
CREATE INDEX idx_execution_states_trade ON daily_execution_states(trade_id);
CREATE INDEX idx_execution_states_date_execution ON daily_execution_states(snapshot_date, execution_id);
```

#### הסבר
- שמירת מצב כל ביצוע בכל יום
- מאפשר היסטוריית טרייד מפורטת

---

### 6. daily_market_prices (מחירי שוק יומיים)

#### סכמה
```sql
CREATE TABLE daily_market_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    ticker_id INTEGER NOT NULL,
    price DECIMAL(15, 4) NOT NULL,
    change_percentage DECIMAL(10, 4) DEFAULT 0,
    change_amount DECIMAL(15, 4) DEFAULT 0,
    volume DECIMAL(20, 2) NULL,
    high DECIMAL(15, 4) NULL,
    low DECIMAL(15, 4) NULL,
    open DECIMAL(15, 4) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, ticker_id),
    FOREIGN KEY (ticker_id) REFERENCES tickers(id)
);

CREATE INDEX idx_market_prices_date ON daily_market_prices(snapshot_date);
CREATE INDEX idx_market_prices_ticker ON daily_market_prices(ticker_id);
CREATE INDEX idx_market_prices_date_ticker ON daily_market_prices(snapshot_date, ticker_id);
```

#### הסבר
- שמירת מחירי שוק יומיים
- מאפשר היסטוריית מחירים

---

### 7. daily_trade_plan_states (מצב תוכניות יומי)

#### סכמה
```sql
CREATE TABLE daily_trade_plan_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    trade_plan_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    first_execution_at DATETIME NULL,
    time_to_entry_days INTEGER NULL,
    UNIQUE(snapshot_date, trade_plan_id),
    FOREIGN KEY (trade_plan_id) REFERENCES trade_plans(id)
);

CREATE INDEX idx_plan_states_date ON daily_trade_plan_states(snapshot_date);
CREATE INDEX idx_plan_states_plan ON daily_trade_plan_states(trade_plan_id);
CREATE INDEX idx_plan_states_date_plan ON daily_trade_plan_states(snapshot_date, trade_plan_id);
```

#### הסבר
- שמירת מצב תוכניות בכל יום
- מאפשר ניתוח השוואתי (משך זמן מתכנון לכניסה)

---

### 8. daily_trading_method_states (מצב שיטות מסחר יומי)

#### סכמה
```sql
CREATE TABLE daily_trading_method_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    trade_id INTEGER NOT NULL,
    trade_plan_id INTEGER NULL,
    trading_method VARCHAR(100) NULL,
    investment_type VARCHAR(50) NULL,
    has_plan BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, trade_id),
    FOREIGN KEY (trade_id) REFERENCES trades(id),
    FOREIGN KEY (trade_plan_id) REFERENCES trade_plans(id)
);

CREATE INDEX idx_method_states_date ON daily_trading_method_states(snapshot_date);
CREATE INDEX idx_method_states_trade ON daily_trading_method_states(trade_id);
CREATE INDEX idx_method_states_method ON daily_trading_method_states(trading_method);
CREATE INDEX idx_method_states_investment ON daily_trading_method_states(investment_type);
CREATE INDEX idx_method_states_date_trade ON daily_trading_method_states(snapshot_date, trade_id);
```

#### הסבר
- שמירת מצב שיטות מסחר בכל יום
- מאפשר ניתוח השוואתי (חיתוכים לפי קטגוריות)

---

## 🏗️ ארכיטקטורת קוד (מעודכן)

### מבנה קבצים

```
Backend/
├── models/
│   ├── daily_snapshot.py              # מודלים SQLAlchemy (8 טבלאות)
│   └── ...
├── services/
│   ├── daily_snapshot_service.py      # שירות מרכזי ל-snapshots
│   ├── snapshot_data_collector.py     # איסוף נתונים
│   ├── snapshot_retrieval_service.py  # אחזור נתונים היסטוריים
│   └── ...
└── routes/
    └── api/
        ├── daily_snapshots.py          # API endpoints בסיסיים
        ├── trade_history.py            # API endpoints להיסטוריית טרייד
        ├── portfolio_history.py       # API endpoints למצב תיק היסטורי
        ├── price_history.py            # API endpoints להיסטוריית מחירים
        ├── analysis.py                 # API endpoints לניתוח השוואתי
        └── dashboard.py                # API endpoints לדשבורד
```

---

## 📦 מודלים (Models) - מעודכן

### DailySnapshot Model

```python
# Backend/models/daily_snapshot.py

from sqlalchemy import Column, Integer, String, Date, DateTime, Text, DECIMAL, Boolean, ForeignKey, Index, UniqueConstraint
from sqlalchemy.sql import func
from .base import BaseModel
from typing import Dict, Any, Optional
import json
from datetime import date

class DailySnapshot(BaseModel):
    """
    Daily Snapshot model - tracks snapshot creation
    """
    __tablename__ = "daily_snapshots"
    
    snapshot_date = Column(Date, nullable=False, unique=True, index=True)
    metadata = Column(Text, nullable=True)  # JSON string
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result = super().to_dict()
        if self.metadata:
            result['metadata'] = json.loads(self.metadata)
        return result


class DailyAccountState(BaseModel):
    """
    Daily Account State model - stores account state per day
    """
    __tablename__ = "daily_account_states"
    
    snapshot_date = Column(Date, nullable=False, index=True)
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False, index=True)
    cash_balance = Column(DECIMAL(15, 2), nullable=False)
    total_value = Column(DECIMAL(15, 2), nullable=False)
    realized_pl = Column(DECIMAL(15, 2), default=0)
    unrealized_pl = Column(DECIMAL(15, 2), default=0)
    total_pl = Column(DECIMAL(15, 2), default=0)
    
    __table_args__ = (
        UniqueConstraint('snapshot_date', 'trading_account_id', name='uq_account_state_date_account'),
        Index('idx_account_states_date', 'snapshot_date'),
        Index('idx_account_states_account', 'trading_account_id'),
        Index('idx_account_states_date_account', 'snapshot_date', 'trading_account_id'),
    )


class DailyPositionState(BaseModel):
    """
    Daily Position State model - stores position state per day (CRITICAL!)
    """
    __tablename__ = "daily_position_states"
    
    snapshot_date = Column(Date, nullable=False, index=True)
    trading_account_id = Column(Integer, ForeignKey('trading_accounts.id'), nullable=False, index=True)
    ticker_id = Column(Integer, ForeignKey('tickers.id'), nullable=False, index=True)
    quantity = Column(DECIMAL(15, 4), nullable=False)
    direction = Column(String(10), nullable=False)  # 'long' or 'short'
    average_price = Column(DECIMAL(15, 4), nullable=False)
    market_price = Column(DECIMAL(15, 4), nullable=False)
    market_value = Column(DECIMAL(15, 2), nullable=False)
    realized_pl = Column(DECIMAL(15, 2), default=0)
    unrealized_pl = Column(DECIMAL(15, 2), default=0)
    total_pl = Column(DECIMAL(15, 2), default=0)
    pl_percentage = Column(DECIMAL(10, 4), default=0)
    
    __table_args__ = (
        UniqueConstraint('snapshot_date', 'trading_account_id', 'ticker_id', name='uq_position_state_date_account_ticker'),
        Index('idx_position_states_date', 'snapshot_date'),
        Index('idx_position_states_account', 'trading_account_id'),
        Index('idx_position_states_ticker', 'ticker_id'),
        Index('idx_position_states_date_account_ticker', 'snapshot_date', 'trading_account_id', 'ticker_id'),
    )


# ... (מודלים נוספים עבור הטבלאות האחרות)
```

---

## 🔧 שירותים (Services) - מעודכן

### 1. DailySnapshotService (שירות מרכזי)

```python
# Backend/services/daily_snapshot_service.py

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import date, datetime
from models.daily_snapshot import (
    DailySnapshot, DailyAccountState, DailyPositionState,
    DailyTradeState, DailyExecutionState, DailyMarketPrice,
    DailyTradePlanState, DailyTradingMethodState
)
from services.snapshot_data_collector import SnapshotDataCollector
from services.position_portfolio_service import PositionPortfolioService
import logging

logger = logging.getLogger(__name__)

class DailySnapshotService:
    """
    Central service for managing daily snapshots
    """
    
    @staticmethod
    def create_daily_snapshot(db: Session, snapshot_date: Optional[date] = None) -> Dict[str, Any]:
        """
        Create daily snapshot for a specific date
        
        Args:
            db: Database session
            snapshot_date: Date for snapshot (default: today)
            
        Returns:
            Dict with snapshot creation results
        """
        if snapshot_date is None:
            snapshot_date = date.today()
        
        # Check if snapshot already exists
        existing = db.query(DailySnapshot).filter(
            DailySnapshot.snapshot_date == snapshot_date
        ).first()
        
        if existing:
            return {
                'status': 'exists',
                'message': f'Snapshot for {snapshot_date} already exists',
                'snapshot_date': snapshot_date.isoformat()
            }
        
        # Collect data
        collector = SnapshotDataCollector(db)
        data = collector.collect_all_data(snapshot_date)
        
        # Save snapshot record
        snapshot = DailySnapshot(
            snapshot_date=snapshot_date,
            metadata=json.dumps({'created_by': 'system'})
        )
        db.add(snapshot)
        
        # Save account states
        for account_id, account_data in data['accounts'].items():
            account_state = DailyAccountState(
                snapshot_date=snapshot_date,
                trading_account_id=account_id,
                **account_data
            )
            db.add(account_state)
        
        # Save position states (CRITICAL!)
        for position_key, position_data in data['positions'].items():
            position_state = DailyPositionState(
                snapshot_date=snapshot_date,
                **position_data
            )
            db.add(position_state)
        
        # Save trade states
        for trade_id, trade_data in data['trades'].items():
            trade_state = DailyTradeState(
                snapshot_date=snapshot_date,
                trade_id=trade_id,
                **trade_data
            )
            db.add(trade_state)
        
        # Save execution states
        for execution_id, execution_data in data['executions'].items():
            execution_state = DailyExecutionState(
                snapshot_date=snapshot_date,
                execution_id=execution_id,
                **execution_data
            )
            db.add(execution_state)
        
        # Save market prices
        for ticker_id, price_data in data['market_prices'].items():
            market_price = DailyMarketPrice(
                snapshot_date=snapshot_date,
                ticker_id=ticker_id,
                **price_data
            )
            db.add(market_price)
        
        # Save trade plan states
        for plan_id, plan_data in data['trade_plans'].items():
            plan_state = DailyTradePlanState(
                snapshot_date=snapshot_date,
                trade_plan_id=plan_id,
                **plan_data
            )
            db.add(plan_state)
        
        # Save trading method states
        for trade_id, method_data in data['trading_methods'].items():
            method_state = DailyTradingMethodState(
                snapshot_date=snapshot_date,
                trade_id=trade_id,
                **method_data
            )
            db.add(method_state)
        
        db.commit()
        
        return {
            'status': 'success',
            'snapshot_date': snapshot_date.isoformat(),
            'created_at': datetime.now().isoformat()
        }
```

---

## 🌐 API Endpoints (מעודכן לפי ממשקים)

### 1. Trade History Endpoints

```python
# Backend/routes/api/trade_history.py

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.trade_history_service import TradeHistoryService
from datetime import date, datetime
import logging

logger = logging.getLogger(__name__)

trade_history_bp = Blueprint('trade_history', __name__)

@trade_history_bp.route('/api/trades/<int:trade_id>/history', methods=['GET'])
def get_trade_history(trade_id: int):
    """Get complete trade history"""
    db: Session = next(get_db())
    result = TradeHistoryService.get_trade_history(db, trade_id)
    return jsonify(result), 200

@trade_history_bp.route('/api/trades/<int:trade_id>/timeline', methods=['GET'])
def get_trade_timeline(trade_id: int):
    """Get trade timeline"""
    db: Session = next(get_db())
    result = TradeHistoryService.get_trade_timeline(db, trade_id)
    return jsonify(result), 200

@trade_history_bp.route('/api/trades/<int:trade_id>/pl-history', methods=['GET'])
def get_trade_pl_history(trade_id: int):
    """Get trade P/L history"""
    db: Session = next(get_db())
    result = TradeHistoryService.get_trade_pl_history(db, trade_id)
    return jsonify(result), 200
```

### 2. Portfolio History Endpoints

```python
# Backend/routes/api/portfolio_history.py

@portfolio_history_bp.route('/api/portfolio/state/<date_str>', methods=['GET'])
def get_portfolio_state(date_str: str):
    """Get portfolio state for a specific date"""
    snapshot_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    db: Session = next(get_db())
    result = PortfolioHistoryService.get_portfolio_state(db, snapshot_date)
    return jsonify(result), 200

@portfolio_history_bp.route('/api/portfolio/positions/<date_str>', methods=['GET'])
def get_portfolio_positions(date_str: str):
    """Get portfolio positions for a specific date"""
    snapshot_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    db: Session = next(get_db())
    result = PortfolioHistoryService.get_portfolio_positions(db, snapshot_date)
    return jsonify(result), 200

@portfolio_history_bp.route('/api/portfolio/comparison', methods=['GET'])
def compare_portfolio():
    """Compare portfolio between two dates"""
    date1 = datetime.strptime(request.args.get('date1'), '%Y-%m-%d').date()
    date2 = datetime.strptime(request.args.get('date2'), '%Y-%m-%d').date()
    db: Session = next(get_db())
    result = PortfolioHistoryService.compare_portfolio(db, date1, date2)
    return jsonify(result), 200
```

### 3. Price History Endpoints

```python
# Backend/routes/api/price_history.py

@price_history_bp.route('/api/tickers/<int:ticker_id>/price-history', methods=['GET'])
def get_ticker_price_history(ticker_id: int):
    """Get price history for a ticker"""
    start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d').date()
    end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d').date()
    db: Session = next(get_db())
    result = PriceHistoryService.get_ticker_price_history(db, ticker_id, start_date, end_date)
    return jsonify(result), 200

@price_history_bp.route('/api/tickers/price-comparison', methods=['GET'])
def compare_ticker_prices():
    """Compare prices between multiple tickers"""
    ticker_ids = [int(x) for x in request.args.get('ticker_ids').split(',')]
    start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d').date()
    end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d').date()
    db: Session = next(get_db())
    result = PriceHistoryService.compare_ticker_prices(db, ticker_ids, start_date, end_date)
    return jsonify(result), 200
```

### 4. Analysis Endpoints

```python
# Backend/routes/api/analysis.py

@analysis_bp.route('/api/analysis/compare', methods=['GET'])
def compare_analysis():
    """General comparison analysis"""
    # ... implementation

@analysis_bp.route('/api/analysis/by-investment-type', methods=['GET'])
def analyze_by_investment_type():
    """Analysis by investment type"""
    # ... implementation

# ... (endpoints נוספים)
```

### 5. Dashboard Endpoints

```python
# Backend/routes/api/dashboard.py

@dashboard_bp.route('/api/dashboard/history-widget', methods=['GET'])
def get_history_widget():
    """Get history widget data"""
    db: Session = next(get_db())
    result = DashboardService.get_history_widget(db)
    return jsonify(result), 200
```

---

## ✅ סיכום

### שינויים עיקריים מהגרסה הקודמת:

1. ✅ **8 טבלאות נפרדות** במקום טבלה אחת עם JSON
2. ✅ **שדות מוגדרים** במקום JSON גנרי
3. ✅ **15+ API endpoints** לפי ממשקים
4. ✅ **שירותים מותאמים** לכל סוג נתונים

### יתרונות:

- ✅ **ביצועים טובים יותר** - שאילתות ישירות על שדות
- ✅ **טיפוסים ברורים** - שדות מוגדרים
- ✅ **קל יותר לשאילתות** - אין צורך לפרסר JSON
- ✅ **תמיכה טובה יותר בממשקים** - נתונים מותאמים בדיוק

**הארכיטקטורה המעודכנת מוכנה ליישום!**

---

**תאריך עדכון אחרון:** 19 ינואר 2025  
**גרסה:** 2.0 (User-Centered Design)  
**מחבר:** TikTrack Development Team

