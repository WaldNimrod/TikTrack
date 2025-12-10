from datetime import date, datetime
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from config.database import get_db
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

        if not metrics or not isinstance(metrics, dict):
            errors.append({
                'type': 'INVALID_DATA',
                'message': 'Invalid metrics data structure',
                'severity': 'high'
            })
            return errors

        # בדיקת ערכים שליליים לא הגיוניים קודם
        nav_total = metrics.get('nav_total', 0)
        if nav_total < 0:  # Any negative NAV is problematic
            errors.append({
                'type': 'NEGATIVE_NAV',
                'field': 'nav_total',
                'value': nav_total,
                'severity': 'high'
            })
            return errors  # Return early if NAV is negative

        # בדיקת עקביות NAV
        nav_calculated = (metrics.get('market_value_total', 0) + metrics.get('cash_total', 0))
        nav_stored = nav_total

        if abs(nav_stored - nav_calculated) > 0.01:  # tolerance of 1 cent
            errors.append({
                'type': 'NAV_INCONSISTENCY',
                'field': 'nav_consistency',
                'expected': nav_calculated,
                'actual': nav_stored,
                'difference': nav_stored - nav_calculated,
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

    # System & Monitoring Methods

    def get_job_status(self, user_id: int, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """קבלת סטטוס משימות EOD"""
        # Placeholder - implement based on actual job system
        return {
            'active_jobs': 0,
            'pending_jobs': 0,
            'completed_jobs': 0,
            'failed_jobs': 0,
            'last_run': None
        }

    def get_job_history(self, user_id: int, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """קבלת היסטוריית משימות EOD"""
        # Placeholder - implement based on actual job system
        return []

    def get_performance_stats(self, user_id: int, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """קבלת סטטיסטיקות ביצועים של EOD"""
        # Calculate basic performance metrics
        period = filters.get('period', '24h') if filters else '24h'

        # Count records in the last period
        from datetime import datetime, timedelta
        end_date = datetime.now().date()
        if period == '24h':
            start_date = end_date - timedelta(days=1)
        elif period == '7d':
            start_date = end_date - timedelta(days=7)
        elif period == '30d':
            start_date = end_date - timedelta(days=30)
        else:
            start_date = end_date - timedelta(days=1)

        # Count portfolio metrics records
        portfolio_count = self.db.query(DailyPortfolioMetrics).filter(
            DailyPortfolioMetrics.user_id == user_id,
            DailyPortfolioMetrics.date_utc >= start_date,
            DailyPortfolioMetrics.date_utc <= end_date
        ).count()

        return {
            'period': period,
            'portfolio_records_count': portfolio_count,
            'cache_hit_rate': 0.85,  # Placeholder
            'average_calculation_time': 2.5,  # seconds, placeholder
            'last_updated': datetime.now().isoformat()
        }

    # Data Access Methods

    def get_table_data(self, user_id: int, table_name: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """קבלת נתוני טבלה ישירות"""
        limit = filters.get('limit', 100) if filters else 100
        offset = filters.get('offset', 0) if filters else 0
        date_from = filters.get('date_from') if filters else None
        date_to = filters.get('date_to') if filters else None

        # Map table names to models
        table_models = {
            'daily_portfolio_metrics': DailyPortfolioMetrics,
            'daily_ticker_positions': DailyTickerPositions,
            'daily_cash_flows_agg': DailyCashFlowsAgg
        }

        if table_name not in table_models:
            raise ValueError(f"Unknown table: {table_name}")

        model = table_models[table_name]
        query = self.db.query(model).filter(model.user_id == user_id)

        # Apply date filters if provided
        if date_from:
            query = query.filter(model.date_utc >= date_from)
        if date_to:
            query = query.filter(model.date_utc <= date_to)

        # Apply pagination
        query = query.offset(offset).limit(limit)

        records = query.all()
        return [self._model_to_dict(record) for record in records]

    def get_validation_alerts(self, user_id: int, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """קבלת התראות מבוססות EOD"""
        # Get portfolio metrics with validation issues
        query = self.db.query(DailyPortfolioMetrics).filter(
            DailyPortfolioMetrics.user_id == user_id,
            DailyPortfolioMetrics.data_quality_status.in_(['stale', 'needs_recompute'])
        )

        severity = filters.get('severity') if filters else None
        if severity:
            # Map severity to data quality status
            status_map = {
                'high': ['needs_recompute'],
                'medium': ['stale'],
                'low': ['valid']  # Include valid records for completeness
            }
            if severity in status_map:
                query = query.filter(DailyPortfolioMetrics.data_quality_status.in_(status_map[severity]))

        date_from = filters.get('date_from') if filters else None
        if date_from:
            query = query.filter(DailyPortfolioMetrics.date_utc >= date_from)

        records = query.limit(50).all()  # Limit to prevent too many alerts

        alerts = []
        for record in records:
            alert = {
                'id': f"portfolio_{record.id}",
                'type': 'portfolio_validation',
                'severity': 'high' if record.data_quality_status == 'needs_recompute' else 'medium',
                'message': f"Portfolio data for {record.date_utc} needs attention",
                'date': record.date_utc.isoformat(),
                'details': {
                    'status': record.data_quality_status,
                    'validation_errors': record.validation_errors
                }
            }
            alerts.append(alert)

        return alerts

    def get_comparison_data(self, user_id: int, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """קבלת נתונים להשוואות היסטוריות"""
        date_ranges = filters.get('date_ranges', []) if filters else []
        metrics = filters.get('metrics', ['nav_total', 'unrealized_pl_amount']) if filters else ['nav_total', 'unrealized_pl_amount']

        result = {}

        for range_spec in date_ranges:
            range_name = range_spec.get('name', 'unnamed')
            start_date = range_spec.get('start_date')
            end_date = range_spec.get('end_date')

            if not start_date or not end_date:
                continue

            # Get data for this range
            query = self.db.query(DailyPortfolioMetrics).filter(
                DailyPortfolioMetrics.user_id == user_id,
                DailyPortfolioMetrics.date_utc >= start_date,
                DailyPortfolioMetrics.date_utc <= end_date
            ).order_by(DailyPortfolioMetrics.date_utc)

            records = query.all()
            range_data = {}

            for metric in metrics:
                if hasattr(DailyPortfolioMetrics, metric):
                    values = [getattr(record, metric) for record in records if getattr(record, metric) is not None]
                    if values:
                        range_data[metric] = {
                            'values': values,
                            'min': min(values),
                            'max': max(values),
                            'avg': sum(values) / len(values),
                            'count': len(values)
                        }

            result[range_name] = {
                'date_range': {'start': start_date, 'end': end_date},
                'metrics': range_data,
                'record_count': len(records)
            }

        return result
