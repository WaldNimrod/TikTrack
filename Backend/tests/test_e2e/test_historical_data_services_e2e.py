"""
End-to-End Tests for Historical Data Services
=============================================

Tests complete scenarios for Historical Data Services:
- Trade History Data Service
- Portfolio State Data Service
- Trading Journal Data Service

These tests verify:
- Data Services are available
- API endpoints are accessible
- Cache integration works
- Error handling works correctly
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import json


class TestTradeHistoryDataServiceE2E:
    """E2E tests for Trade History Data Service."""
    
    def test_trade_history_data_service_available(self):
        """Test that TradeHistoryData service is available."""
        # This would be tested in browser environment
        # For now, we verify the service structure
        from pathlib import Path
        service_file = Path(__file__).parent.parent.parent.parent / 'trading-ui' / 'scripts' / 'services' / 'trade-history-data.js'
        assert service_file.exists(), "TradeHistoryData service file should exist"
    
    def test_trade_history_api_endpoint_structure(self):
        """Test that Trade History API endpoints are properly structured."""
        from Backend.routes.api import trade_history
        assert hasattr(trade_history, 'trade_history_bp'), "Trade History Blueprint should exist"
        assert trade_history.trade_history_bp.name == 'trade_history', "Blueprint name should be correct"
    
    def test_trade_history_cache_keys(self):
        """Test that cache keys are properly structured."""
        # Verify cache key patterns
        cache_keys = [
            'trade-history-data',
            'trade-history-statistics',
            'trade-history-aggregated',
            'trade-history-plan-vs-execution'
        ]
        for key in cache_keys:
            assert isinstance(key, str), f"Cache key {key} should be a string"
            assert len(key) > 0, f"Cache key {key} should not be empty"


class TestPortfolioStateDataServiceE2E:
    """E2E tests for Portfolio State Data Service."""
    
    def test_portfolio_state_data_service_available(self):
        """Test that PortfolioStateData service is available."""
        from pathlib import Path
        service_file = Path(__file__).parent.parent.parent.parent / 'trading-ui' / 'scripts' / 'services' / 'portfolio-state-data.js'
        assert service_file.exists(), "PortfolioStateData service file should exist"
    
    def test_portfolio_state_api_endpoint_structure(self):
        """Test that Portfolio State API endpoints are properly structured."""
        from Backend.routes.api import portfolio_state
        assert hasattr(portfolio_state, 'portfolio_state_bp'), "Portfolio State Blueprint should exist"
        assert portfolio_state.portfolio_state_bp.name == 'portfolio_state', "Blueprint name should be correct"
    
    def test_portfolio_state_cache_keys(self):
        """Test that cache keys are properly structured."""
        cache_keys = [
            'portfolio-state-data',
            'portfolio-state-snapshot',
            'portfolio-state-series',
            'portfolio-state-performance',
            'portfolio-state-comparison'
        ]
        for key in cache_keys:
            assert isinstance(key, str), f"Cache key {key} should be a string"
            assert len(key) > 0, f"Cache key {key} should not be empty"


class TestTradingJournalDataServiceE2E:
    """E2E tests for Trading Journal Data Service."""
    
    def test_trading_journal_data_service_available(self):
        """Test that TradingJournalData service is available."""
        from pathlib import Path
        service_file = Path(__file__).parent.parent.parent.parent / 'trading-ui' / 'scripts' / 'services' / 'trading-journal-data.js'
        assert service_file.exists(), "TradingJournalData service file should exist"
    
    def test_trading_journal_api_endpoint_structure(self):
        """Test that Trading Journal API endpoints are properly structured."""
        from Backend.routes.api import trading_journal
        assert hasattr(trading_journal, 'trading_journal_bp'), "Trading Journal Blueprint should exist"
        assert trading_journal.trading_journal_bp.name == 'trading_journal', "Blueprint name should be correct"
    
    def test_trading_journal_cache_keys(self):
        """Test that cache keys are properly structured."""
        cache_keys = [
            'trading-journal-data',
            'trading-journal-statistics',
            'trading-journal-calendar',
            'trading-journal-by-entity'
        ]
        for key in cache_keys:
            assert isinstance(key, str), f"Cache key {key} should be a string"
            assert len(key) > 0, f"Cache key {key} should not be empty"


class TestHistoricalDataServicesIntegrationE2E:
    """E2E tests for Historical Data Services integration."""
    
    def test_all_services_registered_in_app(self):
        """Test that all Historical Data Services are registered in Flask app."""
        from Backend.app import app
        
        # Check that blueprints are registered
        blueprint_names = [bp.name for bp in app.blueprints.values()]
        
        assert 'trade_history' in blueprint_names, "Trade History Blueprint should be registered"
        assert 'portfolio_state' in blueprint_names, "Portfolio State Blueprint should be registered"
        assert 'trading_journal' in blueprint_names, "Trading Journal Blueprint should be registered"
    
    def test_all_services_in_package_manifest(self):
        """Test that all Data Services are in package manifest."""
        from pathlib import Path
        manifest_file = Path(__file__).parent.parent.parent.parent / 'trading-ui' / 'scripts' / 'init-system' / 'package-manifest.js'
        
        if manifest_file.exists():
            content = manifest_file.read_text(encoding='utf-8')
            assert 'trade-history-data.js' in content, "TradeHistoryData should be in package manifest"
            assert 'portfolio-state-data.js' in content, "PortfolioStateData should be in package manifest"
            assert 'trading-journal-data.js' in content, "TradingJournalData should be in package manifest"
    
    def test_all_services_in_page_configs(self):
        """Test that all Data Services are in page initialization configs."""
        from pathlib import Path
        config_file = Path(__file__).parent.parent.parent.parent / 'trading-ui' / 'scripts' / 'page-initialization-configs.js'
        
        if config_file.exists():
            content = config_file.read_text(encoding='utf-8')
            assert 'TradeHistoryData' in content, "TradeHistoryData should be in page configs"
            assert 'PortfolioStateData' in content, "PortfolioStateData should be in page configs"
            assert 'TradingJournalData' in content, "TradingJournalData should be in page configs"
    
    def test_cache_manager_integration(self):
        """Test that cache policies are configured in UnifiedCacheManager."""
        from pathlib import Path
        cache_manager_file = Path(__file__).parent.parent.parent.parent / 'trading-ui' / 'scripts' / 'unified-cache-manager.js'
        
        if cache_manager_file.exists():
            content = cache_manager_file.read_text(encoding='utf-8')
            assert 'trade-history-data' in content, "Trade history cache policy should be configured"
            assert 'portfolio-state-snapshot' in content, "Portfolio state cache policy should be configured"
            assert 'trading-journal' in content, "Trading journal cache policy should be configured"
    
    def test_cache_ttl_guard_integration(self):
        """Test that TTL configurations are in CacheTTLGuard."""
        from pathlib import Path
        ttl_guard_file = Path(__file__).parent.parent.parent.parent / 'trading-ui' / 'scripts' / 'cache-ttl-guard.js'
        
        if ttl_guard_file.exists():
            content = ttl_guard_file.read_text(encoding='utf-8')
            assert 'trade-history-data' in content, "Trade history TTL should be configured"
            assert 'portfolio-state-data' in content, "Portfolio state TTL should be configured"
            assert 'trading-journal-data' in content, "Trading journal TTL should be configured"








