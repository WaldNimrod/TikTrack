# מדריך יישום – שמירת חישובים היסטוריים יומיים

## סקירה כללית

מדריך זה מספק הנחיות מלאות ליישום מערכת EOD Historical Metrics, כולל אפיון, מימוש, אינטגרציה ובדיקות.

## שלב 1: הכנה ותשתית

### 1.1 בדיקת תלויות קיימות

```bash
# וודא שכל המערכות הקיימות פעילות
cd /Users/nimrod/Documents/TikTrack/TikTrackApp
python3 -c "
import sys
sys.path.append('Backend')
from services.metrics_collector import MetricsCollector
from services.health_service import HealthService
print('✓ Backend services available')
"

# בדיקת Frontend systems
ls trading-ui/scripts/services/ | grep -E "(cache|notification|statistics)"
```

### 1.2 הגדרת סכמות DB חדשות

```sql
-- Backend/models/eod_metrics_models.py
from sqlalchemy import Column, Integer, String, Date, Numeric, TIMESTAMP, JSON, Text, Index
from Backend.database import Base

class DailyPortfolioMetrics(Base):
    __tablename__ = 'daily_portfolio_metrics'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    account_id = Column(Integer, index=True)  # nullable לצבירה כוללת
    date_utc = Column(Date, nullable=False, index=True)

    # פורטפוליו בסיסי
    nav_total = Column(Numeric(20, 8))
    nav_base_currency = Column(Numeric(20, 8))
    cash_total = Column(Numeric(20, 8))
    positions_count_open = Column(Integer, default=0)
    positions_count_closed = Column(Integer, default=0)
    exposure_long = Column(Numeric(20, 8), default=0)
    exposure_short = Column(Numeric(20, 8), default=0)

    # P&L
    unrealized_pl_amount = Column(Numeric(20, 8), default=0)
    unrealized_pl_percent = Column(Numeric(10, 4), default=0)
    realized_pl_amount = Column(Numeric(20, 8), default=0)
    realized_pl_to_date = Column(Numeric(20, 8), default=0)
    pnl_daily_change_amount = Column(Numeric(20, 8), default=0)
    pnl_daily_change_percent = Column(Numeric(10, 4), default=0)

    # ביצועים
    twr_daily = Column(Numeric(10, 6))
    twr_mtd = Column(Numeric(10, 6))
    twr_ytd = Column(Numeric(10, 6))
    max_drawdown_to_date = Column(Numeric(10, 4))

    # בקרת איכות
    data_quality_status = Column(String(20), default='valid')  # valid/stale/needs_recompute
    validation_errors = Column(JSON)
    computed_at = Column(TIMESTAMP, default=func.now())

    # אינדקסים לביצועים
    __table_args__ = (
        Index('idx_daily_portfolio_user_date', 'user_id', 'date_utc'),
        Index('idx_daily_portfolio_account_date', 'account_id', 'date_utc'),
        {'extend_existing': True}
    )

class DailyTickerPositions(Base):
    __tablename__ = 'daily_ticker_positions'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    account_id = Column(Integer, index=True)
    ticker_id = Column(Integer, nullable=False, index=True)
    date_utc = Column(Date, nullable=False, index=True)

    quantity = Column(Numeric(20, 8), default=0)
    avg_cost = Column(Numeric(20, 8))
    market_value = Column(Numeric(20, 8), default=0)
    unrealized_pl_amount = Column(Numeric(20, 8), default=0)
    unrealized_pl_percent = Column(Numeric(10, 4), default=0)
    realized_pl_today = Column(Numeric(20, 8), default=0)

    close_price = Column(Numeric(20, 8))
    price_source = Column(String(50))
    currency = Column(String(3))

    computed_at = Column(TIMESTAMP, default=func.now())

    # אינדקסים
    __table_args__ = (
        Index('idx_daily_positions_user_date', 'user_id', 'date_utc'),
        Index('idx_daily_positions_ticker_date', 'ticker_id', 'date_utc'),
        {'extend_existing': True}
    )

class DailyCashFlowsAgg(Base):
    __tablename__ = 'daily_cash_flows_agg'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    account_id = Column(Integer, index=True)
    date_utc = Column(Date, nullable=False, index=True)

    inflow = Column(Numeric(20, 8), default=0)
    outflow = Column(Numeric(20, 8), default=0)
    dividends = Column(Numeric(20, 8), default=0)
    fees = Column(Numeric(20, 8), default=0)
    taxes = Column(Numeric(20, 8), default=0)
    fx_adjustments = Column(Numeric(20, 8), default=0)
    net_flow = Column(Numeric(20, 8), default=0)

    computed_at = Column(TIMESTAMP, default=func.now())

    # אינדקסים
    __table_args__ = (
        Index('idx_daily_cash_user_date', 'user_id', 'date_utc'),
        {'extend_existing': True}
    )

class EODJobRuns(Base):
    __tablename__ = 'eod_job_runs'

    id = Column(Integer, primary_key=True)
    job_id = Column(String(100), unique=True, index=True)
    status = Column(String(20), default='running')  # running/completed/failed/completed_with_errors
    scope = Column(JSON)  # {user_id, date_range, accounts}
    errors = Column(JSON)
    duration_seconds = Column(Integer)
    created_at = Column(TIMESTAMP, default=func.now())
    completed_at = Column(TIMESTAMP)

    # אינדקסים
    __table_args__ = (
        Index('idx_eod_jobs_status', 'status'),
        Index('idx_eod_jobs_created', 'created_at'),
        {'extend_existing': True}
    )
```

### 1.3 יצירת Migration

```python
# Backend/migrations/versions/xxx_add_eod_metrics_tables.py
"""Add EOD metrics tables"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    # Create daily_portfolio_metrics table
    op.create_table('daily_portfolio_metrics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=True),
        sa.Column('date_utc', sa.Date(), nullable=False),
        sa.Column('nav_total', sa.Numeric(20, 8), nullable=True),
        sa.Column('nav_base_currency', sa.Numeric(20, 8), nullable=True),
        sa.Column('cash_total', sa.Numeric(20, 8), nullable=True),
        sa.Column('positions_count_open', sa.Integer(), nullable=True),
        sa.Column('positions_count_closed', sa.Integer(), nullable=True),
        sa.Column('exposure_long', sa.Numeric(20, 8), nullable=True),
        sa.Column('exposure_short', sa.Numeric(20, 8), nullable=True),
        sa.Column('unrealized_pl_amount', sa.Numeric(20, 8), nullable=True),
        sa.Column('unrealized_pl_percent', sa.Numeric(10, 4), nullable=True),
        sa.Column('realized_pl_amount', sa.Numeric(20, 8), nullable=True),
        sa.Column('realized_pl_to_date', sa.Numeric(20, 8), nullable=True),
        sa.Column('pnl_daily_change_amount', sa.Numeric(20, 8), nullable=True),
        sa.Column('pnl_daily_change_percent', sa.Numeric(10, 4), nullable=True),
        sa.Column('twr_daily', sa.Numeric(10, 6), nullable=True),
        sa.Column('twr_mtd', sa.Numeric(10, 6), nullable=True),
        sa.Column('twr_ytd', sa.Numeric(10, 6), nullable=True),
        sa.Column('max_drawdown_to_date', sa.Numeric(10, 4), nullable=True),
        sa.Column('data_quality_status', sa.String(20), nullable=True, default='valid'),
        sa.Column('validation_errors', sa.JSON(), nullable=True),
        sa.Column('computed_at', sa.TIMESTAMP(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create daily_ticker_positions table
    op.create_table('daily_ticker_positions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=True),
        sa.Column('ticker_id', sa.Integer(), nullable=False),
        sa.Column('date_utc', sa.Date(), nullable=False),
        sa.Column('quantity', sa.Numeric(20, 8), nullable=True),
        sa.Column('avg_cost', sa.Numeric(20, 8), nullable=True),
        sa.Column('market_value', sa.Numeric(20, 8), nullable=True),
        sa.Column('unrealized_pl_amount', sa.Numeric(20, 8), nullable=True),
        sa.Column('unrealized_pl_percent', sa.Numeric(10, 4), nullable=True),
        sa.Column('realized_pl_today', sa.Numeric(20, 8), nullable=True),
        sa.Column('close_price', sa.Numeric(20, 8), nullable=True),
        sa.Column('price_source', sa.String(50), nullable=True),
        sa.Column('currency', sa.String(3), nullable=True),
        sa.Column('computed_at', sa.TIMESTAMP(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create daily_cash_flows_agg table
    op.create_table('daily_cash_flows_agg',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=True),
        sa.Column('date_utc', sa.Date(), nullable=False),
        sa.Column('inflow', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('outflow', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('dividends', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('fees', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('taxes', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('fx_adjustments', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('net_flow', sa.Numeric(20, 8), nullable=True, default=0),
        sa.Column('computed_at', sa.TIMESTAMP(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create eod_job_runs table
    op.create_table('eod_job_runs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.String(100), nullable=True),
        sa.Column('status', sa.String(20), nullable=True, default='running'),
        sa.Column('scope', sa.JSON(), nullable=True),
        sa.Column('errors', sa.JSON(), nullable=True),
        sa.Column('duration_seconds', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=True, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('completed_at', sa.TIMESTAMP(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('job_id')
    )

    # Create indexes for performance
    op.create_index('idx_daily_portfolio_user_date', 'daily_portfolio_metrics', ['user_id', 'date_utc'])
    op.create_index('idx_daily_portfolio_account_date', 'daily_portfolio_metrics', ['account_id', 'date_utc'])
    op.create_index('idx_daily_positions_user_date', 'daily_ticker_positions', ['user_id', 'date_utc'])
    op.create_index('idx_daily_positions_ticker_date', 'daily_ticker_positions', ['ticker_id', 'date_utc'])
    op.create_index('idx_daily_cash_user_date', 'daily_cash_flows_agg', ['user_id', 'date_utc'])
    op.create_index('idx_eod_jobs_status', 'eod_job_runs', ['status'])
    op.create_index('idx_eod_jobs_created', 'eod_job_runs', ['created_at'])

def downgrade():
    op.drop_index('idx_eod_jobs_created', table_name='eod_job_runs')
    op.drop_index('idx_eod_jobs_status', table_name='eod_job_runs')
    op.drop_index('idx_daily_cash_user_date', table_name='daily_cash_flows_agg')
    op.drop_index('idx_daily_positions_ticker_date', table_name='daily_ticker_positions')
    op.drop_index('idx_daily_positions_user_date', table_name='daily_ticker_positions')
    op.drop_index('idx_daily_portfolio_account_date', table_name='daily_portfolio_metrics')
    op.drop_index('idx_daily_portfolio_user_date', table_name='daily_portfolio_metrics')

    op.drop_table('eod_job_runs')
    op.drop_table('daily_cash_flows_agg')
    op.drop_table('daily_ticker_positions')
    op.drop_table('daily_portfolio_metrics')
```

## שלב 2: שירותי Backend

### 2.1 EODMetricsService

```python
# Backend/services/eod_metrics_service.py
from datetime import date, datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from Backend.database import get_db
from Backend.models.eod_metrics_models import (
    DailyPortfolioMetrics, DailyTickerPositions, DailyCashFlowsAgg
)

class EODMetricsService:
    def __init__(self):
        self.db = next(get_db())

    def calculate_daily_portfolio_metrics(self, user_id: int, account_id: Optional[int],
                                        target_date: date) -> Dict[str, Any]:
        # Implementation as shown in the service file
        pass

    def validate_metrics(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Implementation as shown in the service file
        pass

    def save_metrics(self, metrics: Dict[str, Any], validation_errors: List[Dict[str, Any]]):
        # Implementation as shown in the service file
        pass

    def get_portfolio_metrics(self, user_id: int, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Implementation as shown in the service file
        pass

    def get_positions(self, user_id: int, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Implementation as shown in the service file
        pass

    def get_cash_flows_agg(self, user_id: int, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        # Implementation as shown in the service file
        pass
```

### 2.2 RecomputeService

```python
# Backend/services/recompute_service.py
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
from uuid import uuid4
import asyncio
from Backend.database import get_db
from Backend.models.eod_metrics_models import EODJobRuns
from Backend.services.eod_metrics_service import EODMetricsService

class RecomputeService:
    def __init__(self):
        self.db = next(get_db())
        self.eod_service = EODMetricsService()

    def recompute_user_date_range(self, user_id: int, start_date: date, end_date: date,
                                 account_ids: Optional[List[int]] = None) -> Dict[str, Any]:
        # Implementation as shown in the service file
        pass

    async def _run_recompute_job_async(self, job_id: str, user_id: int, start_date: date,
                                      end_date: date, account_ids: Optional[List[int]]):
        # Implementation as shown in the service file
        pass

    def get_recompute_status(self, job_id: str) -> Dict[str, Any]:
        # Implementation as shown in the service file
        pass

    def get_user_jobs(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        # Implementation as shown in the service file
        pass
```

### 2.3 API Routes

```python
# Backend/routes/api/eod_metrics.py
from flask import Blueprint, request, jsonify
from Backend.services.eod_metrics_service import EODMetricsService
from Backend.services.recompute_service import RecomputeService
from Backend.utils.auth import require_auth

eod_bp = Blueprint('eod_metrics', __name__)

eod_service = EODMetricsService()
recompute_service = RecomputeService()

@eod_bp.route('/portfolio', methods=['GET'])
@require_auth
def get_portfolio_metrics():
    # Implementation as shown in the routes file
    pass

@eod_bp.route('/positions', methods=['GET'])
@require_auth
def get_positions():
    # Implementation as shown in the routes file
    pass

@eod_bp.route('/cash-flows', methods=['GET'])
@require_auth
def get_cash_flows():
    # Implementation as shown in the routes file
    pass

@eod_bp.route('/recompute', methods=['POST'])
@require_auth
def recompute_metrics():
    # Implementation as shown in the routes file
    pass

@eod_bp.route('/recompute/<job_id>', methods=['GET'])
@require_auth
def get_recompute_status(job_id):
    # Implementation as shown in the routes file
    pass

@eod_bp.route('/recompute/history', methods=['GET'])
@require_auth
def get_recompute_history():
    # Implementation as shown in the routes file
    pass
```

## שלב 3: שירותי Frontend

### 3.1 EODMetricsDataService

```javascript
// trading-ui/scripts/services/eod-metrics-data.js
class EODMetricsDataService {
    constructor() {
        this.baseUrl = '/api/eod';
        this.cachePrefix = 'eod_';
    }

    async getPortfolioMetrics(userId, filters = {}) {
        // Implementation as shown in the service file
    }

    async getPositions(userId, filters = {}) {
        // Implementation as shown in the service file
    }

    async getCashFlows(userId, filters = {}) {
        // Implementation as shown in the service file
    }

    async recomputeDateRange(userId, dateRange) {
        // Implementation as shown in the service file
    }

    async getRecomputeStatus(jobId) {
        // Implementation as shown in the service file
    }

    async getRecomputeHistory(userId, limit = 10) {
        // Implementation as shown in the service file
    }

    invalidateCache(pattern = null) {
        // Implementation as shown in the service file
    }

    clearUserCache(userId) {
        // Implementation as shown in the service file
    }
}

window.EODMetricsDataService = new EODMetricsDataService();
```

### 3.2 EODValidationService

```javascript
// trading-ui/scripts/services/eod-validation-service.js
class EODValidationService {
    constructor() {
        this.recomputeJobs = new Map();
    }

    validatePortfolioMetrics(metrics) {
        // Implementation as shown in the service file
    }

    async handleValidationErrors(metrics, errors) {
        // Implementation as shown in the service file
    }

    async showHighSeverityError(error, metrics) {
        // Implementation as shown in the service file
    }

    async showMediumSeverityError(error, metrics) {
        // Implementation as shown in the service file
    }

    async suggestRecompute(metrics) {
        // Implementation as shown in the service file
    }

    async triggerRecompute(userId, date) {
        // Implementation as shown in the service file
    }

    async monitorRecomputeJob(jobId) {
        // Implementation as shown in the service file
    }

    formatCurrency(amount, currency = 'USD') {
        // Implementation as shown in the service file
    }

    formatDate(dateString) {
        // Implementation as shown in the service file
    }

    async validateBatch(metricsArray) {
        // Implementation as shown in the service file
    }

    async handleBatchValidationErrors(batchErrors) {
        // Implementation as shown in the service file
    }
}

window.EODValidationService = new EODValidationService();
```

## שלב 4: אינטגרציה בעמודים

### 4.1 דשבורד טיקר (ticker-dashboard.html)

```javascript
// הוסף ל-package-manifest
{
    name: 'eod-metrics-service',
    src: 'scripts/services/eod-metrics-data.js',
    dependencies: ['cache-ttl-guard', 'cache-sync-manager']
},
{
    name: 'eod-validation-service',
    src: 'scripts/services/eod-validation-service.js',
    dependencies: ['notification-system', 'eod-metrics-service']
}
```

```javascript
// ב-ticker-dashboard.js - הרחב את המנגנון הקיים
class TickerDashboardManager {
    async loadDataWithEODValidation() {
        // קוד קיים לטעינת נתונים...

        // הוסף ולידציה EOD
        if (this.currentTickerData) {
            const eodMetrics = await EODMetricsDataService.getPortfolioMetrics(
                window.currentUser?.id,
                {
                    date_from: this.selectedDate,
                    date_to: this.selectedDate,
                    include_positions: true
                }
            );

            if (eodMetrics?.data?.[0]) {
                const errors = EODValidationService.validatePortfolioMetrics(eodMetrics.data[0]);
                if (errors.length > 0) {
                    await EODValidationService.handleValidationErrors(eodMetrics.data[0], errors);
                }
            }
        }
    }

    addGlobalRecomputeButton() {
        // Implementation as shown in the file
    }

    async triggerGlobalRecompute() {
        // Implementation as shown in the file
    }
}
```

### 4.2 יומן מסחר (trading-journal.html)

```javascript
// ב-trading-journal.js
class TradingJournalManager {
    async loadKPIs() {
        // Implementation as shown in the file
    }

    displayKPIs(eodData) {
        // Implementation as shown in the file
    }

    addRecomputeButton() {
        // Implementation as shown in the file
    }
}
```

### 4.3 דף הבית (index.html)

```javascript
// ב-dashboard.js
class DashboardManager {
    async loadDashboardData() {
        // קוד קיים...

        // הוסף טעינת KPIs מ-EOD
        await this.loadEODKPIs();
    }

    async loadEODKPIs() {
        // Implementation as shown in the file
    }

    updateKPICards(eodData) {
        // Implementation as shown in the file
    }

    formatCurrency(amount, currency = 'USD') {
        // Implementation as shown in the file
    }
}
```

### 4.4 עמודי מוקאפ (trade-history-page.html, portfolio-state-page.html)

```javascript
// ב-trade-history-page.js
class TradeHistoryManager {
    async loadData() {
        // Implementation as shown in the file
    }

    displayHistoricalData(dayData) {
        // Implementation as shown in the file
    }
}
```

## שלב 5: בדיקות

### 5.1 בדיקות יחידה (Backend)

```python
# Backend/tests/test_eod_metrics.py
import pytest
from datetime import date
from Backend.services.eod_metrics_service import EODMetricsService

class TestEODMetricsService:
    def test_calculate_daily_portfolio_metrics_basic(self):
        # Implementation as shown in the test file
        pass

    def test_validate_metrics_nav_consistency(self):
        # Implementation as shown in the test file
        pass

    def test_validate_metrics_negative_nav(self):
        # Implementation as shown in the test file
        pass

    def test_validate_metrics_exposure_consistency(self):
        # Implementation as shown in the test file
        pass

    def test_validate_metrics_valid_data(self):
        # Implementation as shown in the test file
        pass

    def test_get_portfolio_metrics_filters(self):
        # Implementation as shown in the test file
        pass
```

### 5.2 בדיקות Frontend

```javascript
// tests/eod-metrics-service.test.js
describe('EODMetricsDataService', () => {
    // Implementation as shown in the test file
});
```

### 5.3 הרצת בדיקות

```bash
# Backend tests
cd Backend
python -m pytest tests/test_eod_metrics.py -v --tb=short

# Frontend tests
cd ..
npm test -- tests/eod-metrics-service.test.js

# Selenium tests (אחרי הטמעה)
python3 scripts/test_pages_console_errors.py
```

## שלב 6: תיעוד

### 6.1 מדריך למפתחים

ראה `documentation/04-FEATURES/CORE/EOD_HISTORICAL_METRICS_SYSTEM.md`

### 6.2 Checklist הטמעה

- [x] יצירת טבלאות DB ו-migration
- [x] יישום EODMetricsService ו-RecomputeService
- [x] הוספת API routes
- [x] יישום EODMetricsDataService ו-EODValidationService
- [x] אינטגרציה בדשבורד טיקר
- [x] אינטגרציה ביומן מסחר
- [x] אינטגרציה בדף הבית
- [x] אינטגרציה בעמודי מוקאפ
- [x] בדיקות יחידה ואינטגרציה
- [x] בדיקות Selenium
- [x] תיעוד מלא

### 6.3 ניטור ותחזוקה

- הוסף ל-Metrics Collector: מספר records בטבלאות EOD, זמני חישוב, שיעור שגיאות
- הוסף ל-Health Service: בדיקת זמינות טבלאות EOD
- לוגים: שגיאות ולידציה, זמני חישוב, נפח נתונים
