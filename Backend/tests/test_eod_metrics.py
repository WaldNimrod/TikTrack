import pytest
from datetime import date
from Backend.services.eod_metrics_service import EODMetricsService

class TestEODMetricsService:
    """בדיקות יחידה לשירות EOD Metrics"""

    def test_calculate_daily_portfolio_metrics_basic(self):
        """בדיקת חישוב בסיסי של מדדי פורטפוליו"""
        service = EODMetricsService()

        user_id = 1
        account_id = None  # All accounts
        target_date = date(2024, 1, 15)

        # Note: This will return placeholder data until actual implementation
        metrics = service.calculate_daily_portfolio_metrics(user_id, account_id, target_date)

        # Check required fields exist
        required_fields = [
            'user_id', 'account_id', 'date_utc', 'nav_total',
            'data_quality_status', 'validation_errors'
        ]

        for field in required_fields:
            assert field in metrics, f"Missing required field: {field}"

        assert metrics['user_id'] == user_id
        assert metrics['account_id'] == account_id
        assert metrics['date_utc'] == target_date
        assert metrics['data_quality_status'] == 'valid'
        assert isinstance(metrics['validation_errors'], list)

    def test_validate_metrics_nav_consistency(self):
        """בדיקת ולידציה של עקביות NAV"""
        service = EODMetricsService()

        # Test data with NAV inconsistency
        metrics = {
            'nav_total': 10000.50,
            'market_value_total': 8000.25,
            'cash_total': 1500.00,  # Should be 2000.25 for consistency
            'exposure_long': 8000.25,
            'exposure_short': 0
        }

        errors = service.validate_metrics(metrics)

        assert len(errors) == 1
        assert errors[0]['type'] == 'NAV_INCONSISTENCY'
        assert errors[0]['severity'] == 'high'
        assert 'difference' in errors[0]
        assert abs(errors[0]['difference'] - 500.25) < 0.01

    def test_validate_metrics_negative_nav(self):
        """בדיקת ולידציה של NAV שלילי"""
        service = EODMetricsService()

        metrics = {
            'nav_total': -1000.00,
            'market_value_total': 0,
            'cash_total': 0
        }

        errors = service.validate_metrics(metrics)

        assert len(errors) == 1
        assert errors[0]['type'] == 'NEGATIVE_NAV'
        assert errors[0]['severity'] == 'high'

    def test_validate_metrics_exposure_consistency(self):
        """בדיקת ולידציה של עקביות חשיפות"""
        service = EODMetricsService()

        metrics = {
            'nav_total': 10000,
            'market_value_total': 8000,
            'cash_total': 2000,
            'exposure_long': 5000,  # Only long exposure, missing short
            'exposure_short': 0
        }

        errors = service.validate_metrics(metrics)

        # Should detect exposure inconsistency
        exposure_errors = [e for e in errors if e['type'] == 'EXPOSURE_INCONSISTENCY']
        assert len(exposure_errors) == 1
        assert exposure_errors[0]['severity'] == 'medium'

    def test_validate_metrics_valid_data(self):
        """בדיקת ולידציה של נתונים תקינים"""
        service = EODMetricsService()

        metrics = {
            'nav_total': 10000.00,
            'market_value_total': 8000.00,
            'cash_total': 2000.00,
            'exposure_long': 6000.00,
            'exposure_short': 2000.00  # Total exposure = 8000, matches market_value
        }

        errors = service.validate_metrics(metrics)

        assert len(errors) == 0

    def test_get_portfolio_metrics_filters(self):
        """בדיקת סינון מדדי פורטפוליו"""
        service = EODMetricsService()

        user_id = 1
        filters = {
            'account_id': 123,
            'date_from': '2024-01-01',
            'date_to': '2024-01-31'
        }

        # This will return empty list until actual data exists
        metrics = service.get_portfolio_metrics(user_id, filters)

        assert isinstance(metrics, list)
        # All returned metrics should match filters (when data exists)
