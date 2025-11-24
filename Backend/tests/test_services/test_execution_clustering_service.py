#!/usr/bin/env python3
"""
Execution Clustering Service Tests - TikTrack
=============================================

Unit tests covering execution clustering logic for trade creation.
"""

import os
import sys
import unittest
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from services.execution_clustering_service import (
    ExecutionClusteringService,
    ClusterBuilder,
    ClusterStatsCalculator,
    map_execution_action_to_trade_side
)
from models.execution import Execution


def _build_execution(
    execution_id: int,
    ticker_id: int,
    trading_account_id: int = None,
    *,
    action: str = 'buy',
    quantity: float = 100.0,
    price: float = 50.0,
    fee: float = 1.0,
    date: datetime = None,
    trade_id: int = None,
    source: str = 'manual',
    notes: str = None
):
    """Build a mock execution object"""
    execution = SimpleNamespace(
        id=execution_id,
        ticker_id=ticker_id,
        trading_account_id=trading_account_id,
        action=action,
        quantity=quantity,
        price=price,
        fee=fee,
        date=date or datetime.utcnow(),
        trade_id=trade_id,
        source=source,
        notes=notes,
        ticker=SimpleNamespace(
            id=ticker_id,
            symbol='TCKR',
            name='Test Ticker',
            type='stock'
        ) if ticker_id else None,
        trading_account=SimpleNamespace(
            id=trading_account_id,
            name='Test Account',
            currency_id=1
        ) if trading_account_id else None
    )
    
    # Add to_dict method
    def to_dict():
        return {
            'id': execution_id,
            'ticker_id': ticker_id,
            'trading_account_id': trading_account_id,
            'action': action,
            'quantity': quantity,
            'price': price,
            'fee': fee,
            'date': execution.date,
            'trade_id': trade_id,
            'source': source,
            'notes': notes
        }
    execution.to_dict = to_dict
    return execution


class TestMapExecutionActionToTradeSide(unittest.TestCase):
    """Tests for map_execution_action_to_trade_side function"""
    
    def test_buy_maps_to_long(self):
        self.assertEqual(map_execution_action_to_trade_side('buy'), 'long')
        self.assertEqual(map_execution_action_to_trade_side('BUY'), 'long')
    
    def test_sell_maps_to_long(self):
        self.assertEqual(map_execution_action_to_trade_side('sell'), 'long')
        self.assertEqual(map_execution_action_to_trade_side('SELL'), 'long')
    
    def test_short_maps_to_short(self):
        self.assertEqual(map_execution_action_to_trade_side('short'), 'short')
        self.assertEqual(map_execution_action_to_trade_side('SHORT'), 'short')
    
    def test_cover_maps_to_short(self):
        self.assertEqual(map_execution_action_to_trade_side('cover'), 'short')
        self.assertEqual(map_execution_action_to_trade_side('COVER'), 'short')
    
    def test_none_maps_to_long(self):
        self.assertEqual(map_execution_action_to_trade_side(None), 'long')
    
    def test_empty_string_maps_to_long(self):
        self.assertEqual(map_execution_action_to_trade_side(''), 'long')


class TestClusterStatsCalculator(unittest.TestCase):
    """Tests for ClusterStatsCalculator"""
    
    def test_calculate_stats_basic(self):
        executions = [
            {'quantity': 100.0, 'price': 50.0, 'value': 5000.0, 'fee': 1.0, 'date': datetime(2024, 1, 1)},
            {'quantity': 50.0, 'price': 55.0, 'value': 2750.0, 'fee': 0.5, 'date': datetime(2024, 1, 2)}
        ]
        
        stats = ClusterStatsCalculator.calculate_stats(executions)
        
        self.assertEqual(stats['total_quantity'], 150.0)
        self.assertEqual(stats['total_value'], 7750.0)
        self.assertEqual(stats['total_fee'], 1.5)
        self.assertEqual(stats['execution_count'], 2)
        self.assertAlmostEqual(stats['average_price'], 51.6667, places=4)
    
    def test_calculate_stats_empty(self):
        stats = ClusterStatsCalculator.calculate_stats([])
        
        self.assertEqual(stats['total_quantity'], 0.0)
        self.assertEqual(stats['total_value'], 0.0)
        self.assertEqual(stats['total_fee'], 0.0)
        self.assertEqual(stats['execution_count'], 0)
        self.assertIsNone(stats['average_price'])
    
    def test_calculate_meta(self):
        executions = [
            {'source': 'ibkr', 'notes': 'Note 1'},
            {'source': 'manual', 'notes': 'Note 2'},
            {'source': 'ibkr', 'notes': None}
        ]
        
        meta = ClusterStatsCalculator.calculate_meta(executions)
        
        self.assertEqual(meta['source_counts']['ibkr'], 2)
        self.assertEqual(meta['source_counts']['manual'], 1)
        self.assertEqual(len(meta['notes']), 2)
        self.assertTrue(meta['flags']['multiple_executions'])
        self.assertTrue(meta['flags']['has_multiple_sources'])


class TestClusterBuilder(unittest.TestCase):
    """Tests for ClusterBuilder"""
    
    def setUp(self):
        self.db_mock = MagicMock()
        self.builder = ClusterBuilder(self.db_mock)
    
    def test_add_execution_creates_cluster(self):
        execution = _build_execution(1, ticker_id=1, trading_account_id=1, action='buy')
        
        self.builder.add_execution(execution)
        
        self.assertEqual(len(self.builder.clusters), 1)
        cluster_key = (1, 1, 'long')
        self.assertIn(cluster_key, self.builder.clusters)
    
    def test_add_execution_groups_by_ticker_account_side(self):
        exec1 = _build_execution(1, ticker_id=1, trading_account_id=1, action='buy')
        exec2 = _build_execution(2, ticker_id=1, trading_account_id=1, action='sell')
        exec3 = _build_execution(3, ticker_id=2, trading_account_id=1, action='buy')
        
        self.builder.add_execution(exec1)
        self.builder.add_execution(exec2)
        self.builder.add_execution(exec3)
        
        # exec1 and exec2 should be in same cluster (same ticker, account, side)
        # exec3 should be in different cluster (different ticker)
        self.assertEqual(len(self.builder.clusters), 2)
    
    def test_add_execution_separates_long_and_short(self):
        exec1 = _build_execution(1, ticker_id=1, trading_account_id=1, action='buy')
        exec2 = _build_execution(2, ticker_id=1, trading_account_id=1, action='short')
        
        self.builder.add_execution(exec1)
        self.builder.add_execution(exec2)
        
        # Should create separate clusters for long and short
        self.assertEqual(len(self.builder.clusters), 2)
    
    def test_build_clusters_returns_sorted_list(self):
        exec1 = _build_execution(1, ticker_id=1, trading_account_id=1, action='buy', date=datetime(2024, 1, 1))
        exec2 = _build_execution(2, ticker_id=2, trading_account_id=1, action='buy', date=datetime(2024, 1, 2))
        
        self.builder.add_execution(exec1)
        self.builder.add_execution(exec2)
        
        clusters = self.builder.build_clusters()
        
        self.assertEqual(len(clusters), 2)
        # Should be sorted by date (descending), so exec2's cluster should be first
        self.assertEqual(clusters[0]['ticker']['id'], 2)


class TestExecutionClusteringService(unittest.TestCase):
    """Tests for ExecutionClusteringService"""
    
    @patch('services.execution_clustering_service.ExecutionClusteringService.get_pending_executions')
    def test_get_execution_trade_creation_clusters(self, mock_get_pending):
        # Setup mock executions
        exec1 = _build_execution(1, ticker_id=1, trading_account_id=1, action='buy')
        exec2 = _build_execution(2, ticker_id=1, trading_account_id=1, action='sell')
        mock_get_pending.return_value = [exec1, exec2]
        
        db_mock = MagicMock()
        clusters = ExecutionClusteringService.get_execution_trade_creation_clusters(db_mock)
        
        self.assertEqual(len(clusters), 1)
        cluster = clusters[0]
        self.assertEqual(cluster['side'], 'long')
        self.assertEqual(len(cluster['executions']), 2)
        self.assertIn('buy', cluster['actions'])
        self.assertIn('sell', cluster['actions'])
    
    @patch('services.execution_clustering_service.ExecutionClusteringService.get_pending_executions')
    def test_get_execution_trade_creation_clusters_with_max_items(self, mock_get_pending):
        executions = [
            _build_execution(i, ticker_id=i, trading_account_id=1, action='buy')
            for i in range(10)
        ]
        mock_get_pending.return_value = executions
        
        db_mock = MagicMock()
        clusters = ExecutionClusteringService.get_execution_trade_creation_clusters(
            db_mock, max_items=5
        )
        
        self.assertLessEqual(len(clusters), 5)
    
    @patch('services.execution_clustering_service.ExecutionClusteringService.get_pending_executions')
    def test_get_execution_trade_creation_clusters_filters_no_ticker(self, mock_get_pending):
        exec1 = _build_execution(1, ticker_id=1, trading_account_id=1, action='buy')
        exec2 = _build_execution(2, ticker_id=None, trading_account_id=1, action='buy')
        mock_get_pending.return_value = [exec1, exec2]
        
        db_mock = MagicMock()
        clusters = ExecutionClusteringService.get_execution_trade_creation_clusters(db_mock)
        
        # Only exec1 should be included (exec2 has no ticker_id)
        self.assertEqual(len(clusters), 1)
        self.assertEqual(clusters[0]['executions'][0]['id'], 1)


if __name__ == '__main__':
    unittest.main()

