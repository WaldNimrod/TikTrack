from datetime import date, datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from Backend.database import get_db
from Backend.models.eod_metrics_models import (
    DailyPortfolioMetrics, DailyTickerPositions, DailyCashFlowsAgg
)

class EODMetricsService:
    """שירות חישוב וטיפול במדדי EOD"""

    def __init__(self):
        self.db = next(get_db())

    def calculate_daily_portfolio_metrics(self, user_id: int, account_id: Optional[int],
                                        target_date: date) -> Dict[str, Any]:
        """חישוב מדדי פורטפוליו ליום ספציפי"""

        # איסוף פוזיציות
        positions_data = self._get_positions_for_date(user_id, account_id, target_date)

        # חישוב market value כולל
        market_value_total = sum(pos.get('market_value', 0) for pos in positions_data)

        # איסוף יתרות מזומן
        cash_total = self._get_cash_balance_for_date(user_id, account_id, target_date)

        # חישוב NAV
        nav_total = market_value_total + cash_total

        # חישוב P&L
        unrealized_pl = sum(pos.get('unrealized_pl_amount', 0) for pos in positions_data)
        realized_pl = self._calculate_realized_pl_for_date(user_id, account_id, target_date)

        # חישוב ביצועים (TWR בסיסי)
        twr_daily = self._calculate_twr_daily(user_id, account_id, target_date)

        # ספירת פוזיציות
        positions_count_open = len([p for p in positions_data if abs(p.get('quantity', 0)) > 0.001])
        exposure_long = sum(pos.get('market_value', 0) for pos in positions_data if pos.get('quantity', 0) > 0)
        exposure_short = sum(pos.get('market_value', 0) for pos in positions_data if pos.get('quantity', 0) < 0)

        return {
            'user_id': user_id,
            'account_id': account_id,
            'date_utc': target_date,
            'nav_total': nav_total,
            'market_value_total': market_value_total,
            'cash_total': cash_total,
            'positions_count_open': positions_count_open,
            'positions_count_closed': 0,  # TODO: implement closed positions count
            'exposure_long': exposure_long,
            'exposure_short': exposure_short,
            'unrealized_pl_amount': unrealized_pl,
            'unrealized_pl_percent': (unrealized_pl / (market_value_total - unrealized_pl)) * 100 if (market_value_total - unrealized_pl) > 0 else 0,
            'realized_pl_amount': realized_pl,
            'realized_pl_to_date': realized_pl,  # TODO: implement cumulative P&L
            'twr_daily': twr_daily,
            'twr_mtd': None,  # TODO: implement MTD calculation
            'twr_ytd': None,  # TODO: implement YTD calculation
            'max_drawdown_to_date': None,  # TODO: implement drawdown calculation
            'data_quality_status': 'valid',
            'validation_errors': []
        }

    def validate_metrics(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """ולידציה פנימית של המדדים"""
        errors = []

        if not metrics or typeof(metrics) !== 'object':
            errors.append({
                'type': 'INVALID_DATA',
                'message': 'Invalid metrics data structure',
                'severity': 'high'
            })
            return errors

        # בדיקת עקביות NAV
        nav_calculated = (metrics.get('market_value_total', 0) + metrics.get('cash_total', 0))
        nav_stored = metrics.get('nav_total', 0)

        if abs(nav_stored - nav_calculated) > 0.01:  # tolerance of 1 cent
            errors.append({
                'type': 'NAV_INCONSISTENCY',
                'field': 'nav_consistency',
                'expected': nav_calculated,
                'actual': nav_stored,
                'difference': nav_stored - nav_calculated,
                'severity': 'high'
            })

        # בדיקת ערכים שליליים לא הגיוניים
        if (metrics.get('nav_total', 0) or 0) < -1000:  # Allow small negative for rounding
            errors.append({
                'type': 'NEGATIVE_NAV',
                'field': 'nav_total',
                'value': metrics.get('nav_total', 0),
                'severity': 'high'
            })

        # בדיקת עקביות חשיפות
        exposure_total = (metrics.get('exposure_long', 0) + metrics.get('exposure_short', 0))
        market_value = metrics.get('market_value_total', 0)

        if abs(exposure_total - market_value) > 1.0:  # $1 tolerance
            errors.append({
                'type': 'EXPOSURE_INCONSISTENCY',
                'field': 'exposure_consistency',
                'expected': market_value,
                'actual': exposure_total,
                'difference': exposure_total - market_value,
                'severity': 'medium'
            })

        return errors

    def save_metrics(self, metrics: Dict[str, Any], validation_errors: List[Dict[str, Any]]):
        """שמירה עם סטטוס ולידציה"""
        metrics_to_save = metrics.copy()
        metrics_to_save['validation_errors'] = validation_errors

        if validation_errors:
            metrics_to_save['data_quality_status'] = 'invalid'
        else:
            metrics_to_save['data_quality_status'] = 'valid'

        # שמירה ב-DB
        portfolio_metrics = DailyPortfolioMetrics(**metrics_to_save)
        self.db.add(portfolio_metrics)

        # שמירת פוזיציות אם קיימות
        if metrics.get('positions'):
            for position in metrics['positions']:
                position_data = position.copy()
                position_data.update({
                    'user_id': metrics['user_id'],
                    'account_id': metrics['account_id'],
                    'date_utc': metrics['date_utc']
                })
                ticker_position = DailyTickerPositions(**position_data)
                self.db.add(ticker_position)

        self.db.commit()

    def get_portfolio_metrics(self, user_id: int, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """שליפת מדדי פורטפוליו עם פילטרים"""
        query = self.db.query(DailyPortfolioMetrics).filter(
            DailyPortfolioMetrics.user_id == user_id
        )

        if filters.get('account_id'):
            query = query.filter(DailyPortfolioMetrics.account_id == filters['account_id'])

        if filters.get('date_from'):
            query = query.filter(DailyPortfolioMetrics.date_utc >= filters['date_from'])

        if filters.get('date_to'):
            query = query.filter(DailyPortfolioMetrics.date_utc <= filters['date_to'])

        results = query.order_by(DailyPortfolioMetrics.date_utc).all()
        return [self._model_to_dict(result) for result in results]

    def get_positions(self, user_id: int, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """שליפת פוזיציות עם פילטרים"""
        query = self.db.query(DailyTickerPositions).filter(
            DailyTickerPositions.user_id == user_id
        )

        if filters.get('account_id'):
            query = query.filter(DailyTickerPositions.account_id == filters['account_id'])

        if filters.get('ticker_id'):
            query = query.filter(DailyTickerPositions.ticker_id == filters['ticker_id'])

        if filters.get('date_from'):
            query = query.filter(DailyTickerPositions.date_utc >= filters['date_from'])

        if filters.get('date_to'):
            query = query.filter(DailyTickerPositions.date_utc <= filters['date_to'])

        results = query.order_by(DailyTickerPositions.date_utc, DailyTickerPositions.ticker_id).all()
        return [self._model_to_dict(result) for result in results]

    def get_cash_flows_agg(self, user_id: int, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """שליפת תזרימי מזומן מצטברים עם פילטרים"""
        query = self.db.query(DailyCashFlowsAgg).filter(
            DailyCashFlowsAgg.user_id == user_id
        )

        if filters.get('account_id'):
            query = query.filter(DailyCashFlowsAgg.account_id == filters['account_id'])

        if filters.get('date_from'):
            query = query.filter(DailyCashFlowsAgg.date_utc >= filters['date_from'])

        if filters.get('date_to'):
            query = query.filter(DailyCashFlowsAgg.date_utc <= filters['date_to'])

        results = query.order_by(DailyCashFlowsAgg.date_utc).all()
        return [self._model_to_dict(result) for result in results]

    # Private helper methods
    def _get_positions_for_date(self, user_id: int, account_id: Optional[int], target_date: date) -> List[Dict]:
        """איסוף פוזיציות ליום ספציפי - placeholder for actual implementation"""
        # TODO: Implement actual position fetching from trades/executions
        # This should query the trades and executions tables to calculate positions
        return []

    def _get_cash_balance_for_date(self, user_id: int, account_id: Optional[int], target_date: date) -> float:
        """איסוף יתרות מזומן ליום ספציפי - placeholder"""
        # TODO: Implement actual cash balance calculation from cash_flows
        return 0.0

    def _calculate_realized_pl_for_date(self, user_id: int, account_id: Optional[int], target_date: date) -> float:
        """חישוב P&L מומש ליום - placeholder"""
        # TODO: Implement realized P&L calculation
        return 0.0

    def _calculate_twr_daily(self, user_id: int, account_id: Optional[int], target_date: date) -> Optional[float]:
        """חישוב Time-Weighted Return יומי - placeholder"""
        # TODO: Implement TWR calculation
        # TWR = (End Value / Start Value) - 1, adjusted for cash flows
        return None

    def _model_to_dict(self, model) -> Dict[str, Any]:
        """Convert SQLAlchemy model to dictionary"""
        result = {}
        for column in model.__table__.columns:
            value = getattr(model, column.name)
            # Convert datetime objects to ISO strings
            if hasattr(value, 'isoformat'):
                value = value.isoformat()
            result[column.name] = value
        return result
