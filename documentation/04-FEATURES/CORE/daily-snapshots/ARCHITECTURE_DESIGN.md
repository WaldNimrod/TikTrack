# עיצוב ארכיטקטורה - מערכת שמירת מצב יומית
# Architecture Design - Daily Snapshot System

**תאריך יצירה:** 19 ינואר 2025  
**גרסה:** 1.0  
**סטטוס:** ✅ מוכן ליישום  
**מטרה:** עיצוב ארכיטקטורה מפורטת למערכת שמירת מצב יומית

---

## 📋 סקירה כללית

מסמך זה מגדיר את הארכיטקטורה המלאה של מערכת שמירת מצב יומית, כולל:
- מבנה טבלאות
- שירותים
- API endpoints
- אינטגרציה עם מערכות קיימות

---

## 🗄️ מבנה טבלאות

### 1. daily_snapshots (טבלה מרכזית)

#### סכמה
```sql
CREATE TABLE daily_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    snapshot_data TEXT NOT NULL,  -- JSON עם כל הנתונים
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(snapshot_date, entity_type, entity_id)
);

-- אינדקסים לביצועים
CREATE INDEX idx_snapshots_date ON daily_snapshots(snapshot_date);
CREATE INDEX idx_snapshots_entity ON daily_snapshots(entity_type, entity_id);
CREATE INDEX idx_snapshots_date_entity ON daily_snapshots(snapshot_date, entity_type, entity_id);
```

#### הסבר
- **snapshot_date:** תאריך ה-snapshot (DATE - רק תאריך, לא שעה)
- **entity_type:** סוג ישות ('trading_account', 'trade', 'execution', 'cash_flow', 'market_data', 'trade_plan', 'alert', 'statistics')
- **entity_id:** מזהה הישות (NULL עבור 'statistics')
- **snapshot_data:** JSON עם כל הנתונים של הישות
- **created_at:** תאריך/שעה יצירה (לצורך audit)

#### דוגמה לנתונים
```json
{
  "snapshot_date": "2025-01-19",
  "entity_type": "trading_account",
  "entity_id": 1,
  "snapshot_data": {
    "id": 1,
    "name": "Account A",
    "cash_balance": 10000.0,
    "opening_balance": 5000.0,
    "total_value": 15000.0,
    "total_pl": 5000.0,
    "status": "open",
    "currency_id": 1
  }
}
```

---

### 2. daily_statistics (טבלת סטטיסטיקות)

#### סכמה
```sql
CREATE TABLE daily_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL UNIQUE,
    total_open_trades INTEGER DEFAULT 0,
    total_open_pl REAL DEFAULT 0,
    total_portfolio_value REAL DEFAULT 0,
    total_cash_flows_today REAL DEFAULT 0,
    total_active_plans INTEGER DEFAULT 0,
    total_active_alerts INTEGER DEFAULT 0,
    total_accounts_open INTEGER DEFAULT 0,
    total_accounts_value REAL DEFAULT 0,
    total_realized_pl REAL DEFAULT 0,
    total_unrealized_pl REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_statistics_date ON daily_statistics(snapshot_date);
```

#### הסבר
- **snapshot_date:** תאריך ה-snapshot (UNIQUE - רק אחד ליום)
- כל השדות האחרים: סטטיסטיקות מחושבות

---

## 🏗️ ארכיטקטורת קוד

### מבנה קבצים

```
Backend/
├── models/
│   └── daily_snapshot.py              # מודל SQLAlchemy
├── services/
│   ├── daily_snapshot_service.py      # שירות מרכזי ל-snapshots
│   ├── snapshot_data_collector.py     # איסוף נתונים
│   └── snapshot_retrieval_service.py # אחזור נתונים היסטוריים
└── routes/
    └── api/
        └── daily_snapshots.py          # API endpoints
```

---

## 📦 מודלים (Models)

### DailySnapshot Model

```python
# Backend/models/daily_snapshot.py

from sqlalchemy import Column, Integer, String, Date, DateTime, Text, Index, UniqueConstraint
from sqlalchemy.sql import func
from .base import BaseModel
from typing import Dict, Any, Optional
import json
from datetime import date

class DailySnapshot(BaseModel):
    """
    Daily Snapshot model - stores daily snapshots of entities
    """
    __tablename__ = "daily_snapshots"
    
    snapshot_date = Column(Date, nullable=False, index=True)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(Integer, nullable=True)  # NULL for statistics
    snapshot_data = Column(Text, nullable=False)  # JSON string
    
    __table_args__ = (
        UniqueConstraint('snapshot_date', 'entity_type', 'entity_id', 
                        name='uq_snapshot_date_entity'),
        Index('idx_snapshots_date', 'snapshot_date'),
        Index('idx_snapshots_entity', 'entity_type', 'entity_id'),
        Index('idx_snapshots_date_entity', 'snapshot_date', 'entity_type', 'entity_id'),
    )
    
    def get_data(self) -> Dict[str, Any]:
        """Parse JSON snapshot data"""
        return json.loads(self.snapshot_data)
    
    def set_data(self, data: Dict[str, Any]) -> None:
        """Set snapshot data as JSON"""
        self.snapshot_data = json.dumps(data, default=str)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        result = super().to_dict()
        result['snapshot_data'] = self.get_data()
        return result


class DailyStatistics(BaseModel):
    """
    Daily Statistics model - stores calculated daily statistics
    """
    __tablename__ = "daily_statistics"
    
    snapshot_date = Column(Date, nullable=False, unique=True, index=True)
    total_open_trades = Column(Integer, default=0)
    total_open_pl = Column(Integer, default=0)
    total_portfolio_value = Column(Integer, default=0)
    total_cash_flows_today = Column(Integer, default=0)
    total_active_plans = Column(Integer, default=0)
    total_active_alerts = Column(Integer, default=0)
    total_accounts_open = Column(Integer, default=0)
    total_accounts_value = Column(Integer, default=0)
    total_realized_pl = Column(Integer, default=0)
    total_unrealized_pl = Column(Integer, default=0)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return super().to_dict()
```

---

## 🔧 שירותים (Services)

### 1. DailySnapshotService (שירות מרכזי)

```python
# Backend/services/daily_snapshot_service.py

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import date, datetime
from models.daily_snapshot import DailySnapshot, DailyStatistics
from services.snapshot_data_collector import SnapshotDataCollector
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
        
        # Save snapshots
        saved_count = 0
        for entity_type, entities in data.items():
            if entity_type == 'statistics':
                # Save statistics separately
                stats = DailyStatistics(
                    snapshot_date=snapshot_date,
                    **entities
                )
                db.add(stats)
            else:
                # Save entity snapshots
                for entity_id, entity_data in entities.items():
                    snapshot = DailySnapshot(
                        snapshot_date=snapshot_date,
                        entity_type=entity_type,
                        entity_id=entity_id,
                        snapshot_data=json.dumps(entity_data, default=str)
                    )
                    db.add(snapshot)
                    saved_count += 1
        
        db.commit()
        
        return {
            'status': 'success',
            'snapshot_date': snapshot_date.isoformat(),
            'saved_count': saved_count,
            'created_at': datetime.now().isoformat()
        }
    
    @staticmethod
    def get_snapshot_by_date(db: Session, snapshot_date: date, 
                           entity_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Get snapshot for a specific date
        
        Args:
            db: Database session
            snapshot_date: Date to retrieve
            entity_type: Optional entity type filter
            
        Returns:
            Dict with snapshot data
        """
        query = db.query(DailySnapshot).filter(
            DailySnapshot.snapshot_date == snapshot_date
        )
        
        if entity_type:
            query = query.filter(DailySnapshot.entity_type == entity_type)
        
        snapshots = query.all()
        
        result = {
            'snapshot_date': snapshot_date.isoformat(),
            'entities': {}
        }
        
        for snapshot in snapshots:
            if snapshot.entity_type not in result['entities']:
                result['entities'][snapshot.entity_type] = {}
            result['entities'][snapshot.entity_type][snapshot.entity_id] = snapshot.get_data()
        
        # Add statistics
        stats = db.query(DailyStatistics).filter(
            DailyStatistics.snapshot_date == snapshot_date
        ).first()
        
        if stats:
            result['statistics'] = stats.to_dict()
        
        return result
```

---

### 2. SnapshotDataCollector (איסוף נתונים)

```python
# Backend/services/snapshot_data_collector.py

from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import date, datetime
from models.trading_account import TradingAccount
from models.trade import Trade
from models.execution import Execution
from models.cash_flow import CashFlow
from models.trade_plan import TradePlan
from models.alert import Alert
from models.market_data_quote import MarketDataQuote
from services.position_portfolio_service import PositionPortfolioService
import logging

logger = logging.getLogger(__name__)

class SnapshotDataCollector:
    """
    Collects data for daily snapshots
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def collect_all_data(self, snapshot_date: date) -> Dict[str, Any]:
        """
        Collect all data for snapshot
        
        Returns:
            Dict with entity_type -> {entity_id -> data}
        """
        return {
            'trading_accounts': self.collect_trading_accounts(),
            'trades': self.collect_trades(),
            'executions': self.collect_executions(snapshot_date),
            'cash_flows': self.collect_cash_flows(snapshot_date),
            'market_data': self.collect_market_data(),
            'trade_plans': self.collect_trade_plans(),
            'alerts': self.collect_alerts(),
            'statistics': self.calculate_statistics(snapshot_date)
        }
    
    def collect_trading_accounts(self) -> Dict[int, Dict[str, Any]]:
        """Collect trading accounts data"""
        accounts = self.db.query(TradingAccount).all()
        return {
            acc.id: {
                'id': acc.id,
                'name': acc.name,
                'cash_balance': acc.cash_balance,
                'opening_balance': acc.opening_balance,
                'total_value': acc.total_value,
                'total_pl': acc.total_pl,
                'status': acc.status,
                'currency_id': acc.currency_id
            }
            for acc in accounts
        }
    
    def collect_trades(self) -> Dict[int, Dict[str, Any]]:
        """Collect trades data"""
        trades = self.db.query(Trade).filter(
            Trade.status == 'open'
        ).all()
        return {
            trade.id: {
                'id': trade.id,
                'trading_account_id': trade.trading_account_id,
                'ticker_id': trade.ticker_id,
                'status': trade.status,
                'total_pl': trade.total_pl,
                'closed_at': trade.closed_at.isoformat() if trade.closed_at else None,
                'cancelled_at': trade.cancelled_at.isoformat() if trade.cancelled_at else None,
                'side': trade.side,
                'investment_type': trade.investment_type
            }
            for trade in trades
        }
    
    def collect_executions(self, snapshot_date: date) -> Dict[int, Dict[str, Any]]:
        """Collect executions created/updated today"""
        executions = self.db.query(Execution).filter(
            Execution.date >= datetime.combine(snapshot_date, datetime.min.time()),
            Execution.date < datetime.combine(snapshot_date, datetime.max.time())
        ).all()
        return {
            exec.id: {
                'id': exec.id,
                'trade_id': exec.trade_id,
                'trading_account_id': exec.trading_account_id,
                'ticker_id': exec.ticker_id,
                'action': exec.action,
                'date': exec.date.isoformat() if exec.date else None,
                'quantity': exec.quantity,
                'price': exec.price,
                'fee': exec.fee,
                'realized_pl': exec.realized_pl,
                'mtm_pl': exec.mtm_pl
            }
            for exec in executions
        }
    
    def collect_cash_flows(self, snapshot_date: date) -> Dict[int, Dict[str, Any]]:
        """Collect cash flows created today"""
        cash_flows = self.db.query(CashFlow).filter(
            CashFlow.date == snapshot_date
        ).all()
        return {
            cf.id: {
                'id': cf.id,
                'trading_account_id': cf.trading_account_id,
                'type': cf.type,
                'amount': cf.amount,
                'fee_amount': cf.fee_amount,
                'date': cf.date.isoformat() if cf.date else None,
                'currency_id': cf.currency_id,
                'usd_rate': float(cf.usd_rate) if cf.usd_rate else 1.0
            }
            for cf in cash_flows
        }
    
    def collect_market_data(self) -> Dict[int, Dict[str, Any]]:
        """Collect market data for active tickers"""
        # Get active tickers (with open trades)
        active_trades = self.db.query(Trade).filter(
            Trade.status == 'open'
        ).all()
        ticker_ids = set(trade.ticker_id for trade in active_trades)
        
        # Get latest quotes for active tickers
        result = {}
        for ticker_id in ticker_ids:
            quote = self.db.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == ticker_id
            ).order_by(MarketDataQuote.asof_utc.desc()).first()
            
            if quote:
                result[ticker_id] = {
                    'ticker_id': ticker_id,
                    'last_price': quote.price,
                    'change_pct_day': quote.change_pct_day,
                    'change_amount_day': quote.change_amount_day,
                    'volume': quote.volume,
                    'asof_utc': quote.asof_utc.isoformat() if quote.asof_utc else None
                }
        
        return result
    
    def collect_trade_plans(self) -> Dict[int, Dict[str, Any]]:
        """Collect trade plans data"""
        plans = self.db.query(TradePlan).filter(
            TradePlan.status == 'open'
        ).all()
        return {
            plan.id: {
                'id': plan.id,
                'trading_account_id': plan.trading_account_id,
                'ticker_id': plan.ticker_id,
                'status': plan.status,
                'cancelled_at': plan.cancelled_at.isoformat() if plan.cancelled_at else None,
                'cancel_reason': plan.cancel_reason,
                'planned_amount': plan.planned_amount,
                'entry_price': plan.entry_price,
                'side': plan.side
            }
            for plan in plans
        }
    
    def collect_alerts(self) -> Dict[int, Dict[str, Any]]:
        """Collect alerts data"""
        alerts = self.db.query(Alert).filter(
            Alert.status == 'open'
        ).all()
        return {
            alert.id: {
                'id': alert.id,
                'ticker_id': alert.ticker_id,
                'status': alert.status,
                'is_triggered': alert.is_triggered,
                'triggered_at': alert.triggered_at.isoformat() if alert.triggered_at else None,
                'related_type_id': alert.related_type_id,
                'related_id': alert.related_id
            }
            for alert in alerts
        }
    
    def calculate_statistics(self, snapshot_date: date) -> Dict[str, Any]:
        """Calculate daily statistics"""
        # Count open trades
        total_open_trades = self.db.query(Trade).filter(
            Trade.status == 'open'
        ).count()
        
        # Sum open P/L
        total_open_pl = self.db.query(func.sum(Trade.total_pl)).filter(
            Trade.status == 'open'
        ).scalar() or 0
        
        # Sum portfolio value
        total_portfolio_value = self.db.query(func.sum(TradingAccount.total_value)).filter(
            TradingAccount.status == 'open'
        ).scalar() or 0
        
        # Sum cash flows today
        total_cash_flows_today = self.db.query(func.sum(CashFlow.amount)).filter(
            CashFlow.date == snapshot_date
        ).scalar() or 0
        
        # Count active plans
        total_active_plans = self.db.query(TradePlan).filter(
            TradePlan.status == 'open'
        ).count()
        
        # Count active alerts
        total_active_alerts = self.db.query(Alert).filter(
            Alert.status == 'open'
        ).count()
        
        # Count open accounts
        total_accounts_open = self.db.query(TradingAccount).filter(
            TradingAccount.status == 'open'
        ).count()
        
        # Sum accounts value
        total_accounts_value = self.db.query(func.sum(TradingAccount.total_value)).filter(
            TradingAccount.status == 'open'
        ).scalar() or 0
        
        return {
            'total_open_trades': total_open_trades,
            'total_open_pl': float(total_open_pl),
            'total_portfolio_value': float(total_portfolio_value),
            'total_cash_flows_today': float(total_cash_flows_today),
            'total_active_plans': total_active_plans,
            'total_active_alerts': total_active_alerts,
            'total_accounts_open': total_accounts_open,
            'total_accounts_value': float(total_accounts_value),
            'total_realized_pl': 0,  # TODO: Calculate from executions
            'total_unrealized_pl': 0  # TODO: Calculate from positions
        }
```

---

### 3. SnapshotRetrievalService (אחזור נתונים)

```python
# Backend/services/snapshot_retrieval_service.py

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import date, timedelta
from models.daily_snapshot import DailySnapshot, DailyStatistics
import logging

logger = logging.getLogger(__name__)

class SnapshotRetrievalService:
    """
    Service for retrieving historical snapshots
    """
    
    @staticmethod
    def get_history(db: Session, start_date: date, end_date: date,
                   entity_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get snapshot history for a date range
        
        Args:
            db: Database session
            start_date: Start date
            end_date: End date
            entity_type: Optional entity type filter
            
        Returns:
            List of snapshots
        """
        query = db.query(DailySnapshot).filter(
            DailySnapshot.snapshot_date >= start_date,
            DailySnapshot.snapshot_date <= end_date
        )
        
        if entity_type:
            query = query.filter(DailySnapshot.entity_type == entity_type)
        
        snapshots = query.order_by(DailySnapshot.snapshot_date).all()
        
        return [snapshot.to_dict() for snapshot in snapshots]
    
    @staticmethod
    def compare_snapshots(db: Session, date1: date, date2: date,
                         entity_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Compare two snapshots
        
        Args:
            db: Database session
            date1: First date
            date2: Second date
            entity_type: Optional entity type filter
            
        Returns:
            Dict with comparison results
        """
        snapshots1 = db.query(DailySnapshot).filter(
            DailySnapshot.snapshot_date == date1
        )
        snapshots2 = db.query(DailySnapshot).filter(
            DailySnapshot.snapshot_date == date2
        )
        
        if entity_type:
            snapshots1 = snapshots1.filter(DailySnapshot.entity_type == entity_type)
            snapshots2 = snapshots2.filter(DailySnapshot.entity_type == entity_type)
        
        snapshots1 = {s.entity_id: s.get_data() for s in snapshots1.all()}
        snapshots2 = {s.entity_id: s.get_data() for s in snapshots2.all()}
        
        # Find changes
        changes = []
        all_ids = set(snapshots1.keys()) | set(snapshots2.keys())
        
        for entity_id in all_ids:
            data1 = snapshots1.get(entity_id)
            data2 = snapshots2.get(entity_id)
            
            if data1 != data2:
                changes.append({
                    'entity_id': entity_id,
                    'date1': data1,
                    'date2': data2,
                    'changes': _calculate_changes(data1, data2)
                })
        
        return {
            'date1': date1.isoformat(),
            'date2': date2.isoformat(),
            'changes': changes,
            'summary': {
                'total_changes': len(changes),
                'entities_added': len(set(snapshots2.keys()) - set(snapshots1.keys())),
                'entities_removed': len(set(snapshots1.keys()) - set(snapshots2.keys()))
            }
        }
    
    @staticmethod
    def get_statistics_history(db: Session, start_date: date, 
                              end_date: date) -> List[Dict[str, Any]]:
        """
        Get statistics history
        
        Args:
            db: Database session
            start_date: Start date
            end_date: End date
            
        Returns:
            List of statistics
        """
        stats = db.query(DailyStatistics).filter(
            DailyStatistics.snapshot_date >= start_date,
            DailyStatistics.snapshot_date <= end_date
        ).order_by(DailyStatistics.snapshot_date).all()
        
        return [stat.to_dict() for stat in stats]


def _calculate_changes(data1: Optional[Dict], data2: Optional[Dict]) -> Dict[str, Any]:
    """Calculate changes between two data dicts"""
    if data1 is None:
        return {'added': data2}
    if data2 is None:
        return {'removed': data1}
    
    changes = {}
    all_keys = set(data1.keys()) | set(data2.keys())
    
    for key in all_keys:
        val1 = data1.get(key)
        val2 = data2.get(key)
        if val1 != val2:
            changes[key] = {'from': val1, 'to': val2}
    
    return changes
```

---

## 🌐 API Endpoints

### Daily Snapshots Blueprint

```python
# Backend/routes/api/daily_snapshots.py

from flask import Blueprint, jsonify, request
from sqlalchemy.orm import Session
from config.database import get_db
from services.daily_snapshot_service import DailySnapshotService
from services.snapshot_retrieval_service import SnapshotRetrievalService
from datetime import date, datetime
from typing import Optional
import logging

logger = logging.getLogger(__name__)

daily_snapshots_bp = Blueprint('daily_snapshots', __name__)

@daily_snapshots_bp.route('/api/daily-snapshots/<date_str>', methods=['GET'])
def get_snapshot(date_str: str):
    """
    Get snapshot for a specific date
    
    Query params:
        entity_type: Optional entity type filter
    """
    try:
        snapshot_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        entity_type = request.args.get('entity_type')
        
        db: Session = next(get_db())
        result = DailySnapshotService.get_snapshot_by_date(
            db, snapshot_date, entity_type
        )
        
        return jsonify(result), 200
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        logger.error(f"Error getting snapshot: {e}")
        return jsonify({'error': str(e)}), 500

@daily_snapshots_bp.route('/api/daily-snapshots/history', methods=['GET'])
def get_history():
    """
    Get snapshot history for a date range
    
    Query params:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        entity_type: Optional entity type filter
    """
    try:
        start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d').date()
        end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d').date()
        entity_type = request.args.get('entity_type')
        
        db: Session = next(get_db())
        result = SnapshotRetrievalService.get_history(
            db, start_date, end_date, entity_type
        )
        
        return jsonify(result), 200
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        logger.error(f"Error getting history: {e}")
        return jsonify({'error': str(e)}), 500

@daily_snapshots_bp.route('/api/daily-snapshots/compare', methods=['GET'])
def compare_snapshots():
    """
    Compare two snapshots
    
    Query params:
        date1: First date (YYYY-MM-DD)
        date2: Second date (YYYY-MM-DD)
        entity_type: Optional entity type filter
    """
    try:
        date1 = datetime.strptime(request.args.get('date1'), '%Y-%m-%d').date()
        date2 = datetime.strptime(request.args.get('date2'), '%Y-%m-%d').date()
        entity_type = request.args.get('entity_type')
        
        db: Session = next(get_db())
        result = SnapshotRetrievalService.compare_snapshots(
            db, date1, date2, entity_type
        )
        
        return jsonify(result), 200
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        logger.error(f"Error comparing snapshots: {e}")
        return jsonify({'error': str(e)}), 500

@daily_snapshots_bp.route('/api/daily-snapshots/create', methods=['POST'])
def create_snapshot():
    """
    Create snapshot manually (for testing)
    
    Body:
        snapshot_date: Optional date (YYYY-MM-DD), defaults to today
    """
    try:
        data = request.get_json() or {}
        snapshot_date_str = data.get('snapshot_date')
        
        snapshot_date = None
        if snapshot_date_str:
            snapshot_date = datetime.strptime(snapshot_date_str, '%Y-%m-%d').date()
        
        db: Session = next(get_db())
        result = DailySnapshotService.create_daily_snapshot(db, snapshot_date)
        
        return jsonify(result), 201
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        logger.error(f"Error creating snapshot: {e}")
        return jsonify({'error': str(e)}), 500

@daily_snapshots_bp.route('/api/daily-snapshots/statistics', methods=['GET'])
def get_statistics():
    """
    Get statistics history
    
    Query params:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
    """
    try:
        start_date = datetime.strptime(request.args.get('start_date'), '%Y-%m-%d').date()
        end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d').date()
        
        db: Session = next(get_db())
        result = SnapshotRetrievalService.get_statistics_history(
            db, start_date, end_date
        )
        
        return jsonify(result), 200
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    except Exception as e:
        logger.error(f"Error getting statistics: {e}")
        return jsonify({'error': str(e)}), 500
```

---

## 🔗 אינטגרציה עם מערכות קיימות

### 1. BackgroundTaskManager

#### רישום משימה
```python
# Backend/services/daily_snapshot_task.py

from services.background_tasks import BackgroundTaskManager
from services.daily_snapshot_service import DailySnapshotService
from config.database import get_db
from datetime import date
import logging

logger = logging.getLogger(__name__)

def create_daily_snapshot_task():
    """
    Background task to create daily snapshot
    Runs every day at 23:59
    """
    try:
        db = next(get_db())
        result = DailySnapshotService.create_daily_snapshot(db)
        logger.info(f"Daily snapshot created: {result}")
        return result
    except Exception as e:
        logger.error(f"Error creating daily snapshot: {e}")
        raise

def register_daily_snapshot_task(background_task_manager: BackgroundTaskManager):
    """
    Register daily snapshot task with background task manager
    """
    background_task_manager.register_task(
        name='create_daily_snapshot',
        func=create_daily_snapshot_task,
        schedule_interval='1d',  # Daily
        description='Create daily snapshot of system state',
        enabled=True
    )
    logger.info("Daily snapshot task registered")
```

#### רישום ב-app.py
```python
# Backend/app.py

# Register daily snapshot task
try:
    from services.daily_snapshot_task import register_daily_snapshot_task
    register_daily_snapshot_task(background_task_manager)
    logger.info("✅ Daily snapshot task registered successfully")
except Exception as e:
    logger.error(f"❌ Failed to register daily snapshot task: {e}")
```

---

### 2. UnifiedCacheSystem (Frontend)

#### שמירת snapshots ב-IndexedDB
```javascript
// trading-ui/scripts/daily-snapshots.js

async function saveSnapshotToCache(snapshotDate, snapshotData) {
    const cacheKey = `daily-snapshot-${snapshotDate}`;
    await UnifiedCacheManager.set(
        cacheKey,
        snapshotData,
        {
            layer: 'indexeddb',
            ttl: 365 * 24 * 60 * 60 * 1000  // שנה
        }
    );
}

async function getSnapshotFromCache(snapshotDate) {
    const cacheKey = `daily-snapshot-${snapshotDate}`;
    return await UnifiedCacheManager.get(cacheKey);
}
```

---

### 3. Database Connection Pool

#### שימוש ב-Connection Pool קיים
```python
# Backend/services/daily_snapshot_service.py

from config.database import get_db

# שימוש ב-get_db() הקיים
db: Session = next(get_db())
# ... עבודה עם DB
```

---

## ✅ סיכום

מסמך זה מגדיר:
- ✅ מבנה טבלאות מלא
- ✅ מודלים (SQLAlchemy)
- ✅ שירותים (Services)
- ✅ API endpoints
- ✅ אינטגרציה עם מערכות קיימות

**הארכיטקטורה מוכנה ליישום!**

---

**תאריך עדכון אחרון:** 19 ינואר 2025  
**גרסה:** 1.0  
**מחבר:** TikTrack Development Team

