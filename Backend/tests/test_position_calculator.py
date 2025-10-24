"""
Unit Tests for Position Calculator Service
בדיקות יחידה למערכת חישוב פוזיציות

תאריך: 24/10/2025
גרסה: 1.0.0
"""

import pytest
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from services.position_calculator_service import PositionCalculatorService
from datetime import datetime

class TestPositionCalculatorService:
    """Test cases for PositionCalculatorService"""
    
    def setup_method(self):
        """Setup for each test method"""
        self.service = PositionCalculatorService()
        self.mock_db = Mock(spec=Session)
    
    def test_calculate_position_no_executions(self):
        """Test position calculation when no executions exist"""
        # Mock empty result
        mock_result = Mock()
        mock_result.fetchall.return_value = []
        
        self.mock_db.execute.return_value = mock_result
        
        # Test
        result = self.service.calculate_position(self.mock_db, 1)
        
        # Assertions
        assert result is None
        self.mock_db.execute.assert_called_once()
    
    def test_calculate_position_long_position(self):
        """Test position calculation for long position"""
        # Mock executions data
        mock_execution1 = Mock()
        mock_execution1.action = 'buy'
        mock_execution1.quantity = 100
        mock_execution1.price = 50.0
        mock_execution1.fee = 2.0
        mock_execution1.date = datetime(2025, 10, 20)
        mock_execution1.created_at = datetime(2025, 10, 20)
        
        mock_execution2 = Mock()
        mock_execution2.action = 'buy'
        mock_execution2.quantity = 50
        mock_execution2.price = 52.0
        mock_execution2.fee = 1.5
        mock_execution2.date = datetime(2025, 10, 21)
        mock_execution2.created_at = datetime(2025, 10, 21)
        
        mock_result = Mock()
        mock_result.fetchall.return_value = [mock_execution1, mock_execution2]
        
        self.mock_db.execute.return_value = mock_result
        
        # Test
        result = self.service.calculate_position(self.mock_db, 1)
        
        # Assertions
        assert result is not None
        assert result['quantity'] == 150.0  # 100 + 50
        assert result['side'] == 'long'
        assert result['total_bought'] == 150.0
        assert result['total_sold'] == 0.0
        assert result['total_fees'] == 3.5  # 2.0 + 1.5
        # Average price: (100*50 + 2 + 50*52 + 1.5) / 150 = 7603.5 / 150 = 50.69
        assert abs(result['average_price'] - 50.69) < 0.01
    
    def test_calculate_position_short_position(self):
        """Test position calculation for short position"""
        # Mock executions data
        mock_execution1 = Mock()
        mock_execution1.action = 'sell'
        mock_execution1.quantity = 100
        mock_execution1.price = 50.0
        mock_execution1.fee = 2.0
        mock_execution1.date = datetime(2025, 10, 20)
        mock_execution1.created_at = datetime(2025, 10, 20)
        
        mock_execution2 = Mock()
        mock_execution2.action = 'sell'
        mock_execution2.quantity = 50
        mock_execution2.price = 52.0
        mock_execution2.fee = 1.5
        mock_execution2.date = datetime(2025, 10, 21)
        mock_execution2.created_at = datetime(2025, 10, 21)
        
        mock_result = Mock()
        mock_result.fetchall.return_value = [mock_execution1, mock_execution2]
        
        self.mock_db.execute.return_value = mock_result
        
        # Test
        result = self.service.calculate_position(self.mock_db, 1)
        
        # Assertions
        assert result is not None
        assert result['quantity'] == -150.0  # -(100 + 50)
        assert result['side'] == 'short'
        assert result['total_bought'] == 0.0
        assert result['total_sold'] == 150.0
        assert result['total_fees'] == 3.5
        assert result['average_price'] == 0.0  # No bought shares
    
    def test_calculate_position_partial_execution(self):
        """Test position calculation with partial execution (buy and sell)"""
        # Mock executions data
        mock_execution1 = Mock()
        mock_execution1.action = 'buy'
        mock_execution1.quantity = 200
        mock_execution1.price = 50.0
        mock_execution1.fee = 2.0
        mock_execution1.date = datetime(2025, 10, 20)
        mock_execution1.created_at = datetime(2025, 10, 20)
        
        mock_execution2 = Mock()
        mock_execution2.action = 'sell'
        mock_execution2.quantity = 100
        mock_execution2.price = 55.0
        mock_execution2.fee = 1.5
        mock_execution2.date = datetime(2025, 10, 21)
        mock_execution2.created_at = datetime(2025, 10, 21)
        
        mock_result = Mock()
        mock_result.fetchall.return_value = [mock_execution1, mock_execution2]
        
        self.mock_db.execute.return_value = mock_result
        
        # Test
        result = self.service.calculate_position(self.mock_db, 1)
        
        # Assertions
        assert result is not None
        assert result['quantity'] == 100.0  # 200 - 100
        assert result['side'] == 'long'
        assert result['total_bought'] == 200.0
        assert result['total_sold'] == 100.0
        assert result['total_fees'] == 3.5
        # Average price: (200*50 + 2) / 200 = 10002 / 200 = 50.01
        assert abs(result['average_price'] - 50.01) < 0.01
    
    def test_calculate_position_closed_position(self):
        """Test position calculation for closed position (equal buy and sell)"""
        # Mock executions data
        mock_execution1 = Mock()
        mock_execution1.action = 'buy'
        mock_execution1.quantity = 100
        mock_execution1.price = 50.0
        mock_execution1.fee = 2.0
        mock_execution1.date = datetime(2025, 10, 20)
        mock_execution1.created_at = datetime(2025, 10, 20)
        
        mock_execution2 = Mock()
        mock_execution2.action = 'sell'
        mock_execution2.quantity = 100
        mock_execution2.price = 55.0
        mock_execution2.fee = 1.5
        mock_execution2.date = datetime(2025, 10, 21)
        mock_execution2.created_at = datetime(2025, 10, 21)
        
        mock_result = Mock()
        mock_result.fetchall.return_value = [mock_execution1, mock_execution2]
        
        self.mock_db.execute.return_value = mock_result
        
        # Test
        result = self.service.calculate_position(self.mock_db, 1)
        
        # Assertions
        assert result is not None
        assert result['quantity'] == 0.0  # 100 - 100
        assert result['side'] == 'closed'
        assert result['total_bought'] == 100.0
        assert result['total_sold'] == 100.0
        assert result['total_fees'] == 3.5
        # Average price: (100*50 + 2) / 100 = 5002 / 100 = 50.02
        assert abs(result['average_price'] - 50.02) < 0.01
    
    def test_calculate_positions_batch(self):
        """Test batch position calculation"""
        # Mock executions data for multiple trades
        mock_execution1 = Mock()
        mock_execution1.trade_id = 1
        mock_execution1.action = 'buy'
        mock_execution1.quantity = 100
        mock_execution1.price = 50.0
        mock_execution1.fee = 2.0
        mock_execution1.date = datetime(2025, 10, 20)
        mock_execution1.created_at = datetime(2025, 10, 20)
        
        mock_execution2 = Mock()
        mock_execution2.trade_id = 2
        mock_execution2.action = 'sell'
        mock_execution2.quantity = 50
        mock_execution2.price = 55.0
        mock_execution2.fee = 1.5
        mock_execution2.date = datetime(2025, 10, 21)
        mock_execution2.created_at = datetime(2025, 10, 21)
        
        mock_result = Mock()
        mock_result.fetchall.return_value = [mock_execution1, mock_execution2]
        
        self.mock_db.execute.return_value = mock_result
        
        # Test
        result = self.service.calculate_positions_batch(self.mock_db, [1, 2, 3])
        
        # Assertions
        assert len(result) == 3
        assert result[1] is not None
        assert result[1]['quantity'] == 100.0
        assert result[1]['side'] == 'long'
        assert result[2] is not None
        assert result[2]['quantity'] == -50.0
        assert result[2]['side'] == 'short'
        assert result[3] is None  # No executions for trade 3
    
    def test_calculate_positions_batch_empty(self):
        """Test batch position calculation with empty trade list"""
        result = self.service.calculate_positions_batch(self.mock_db, [])
        assert result == {}
    
    def test_get_position_summary(self):
        """Test position summary generation"""
        # Mock position calculation
        with patch.object(self.service, 'calculate_position') as mock_calc:
            mock_position = {
                'quantity': 100.0,
                'average_price': 50.0,
                'side': 'long',
                'last_updated': '2025-10-20T10:00:00'
            }
            mock_calc.return_value = mock_position
            
            result = self.service.get_position_summary(self.mock_db, 1)
            
            assert result is not None
            assert result['quantity'] == 100.0
            assert result['average_price'] == 50.0
            assert result['side'] == 'long'
            assert result['last_updated'] == '2025-10-20T10:00:00'
    
    def test_get_position_summary_no_position(self):
        """Test position summary when no position exists"""
        with patch.object(self.service, 'calculate_position') as mock_calc:
            mock_calc.return_value = None
            
            result = self.service.get_position_summary(self.mock_db, 1)
            
            assert result is None
    
    def test_calculate_position_with_fees(self):
        """Test position calculation with fees included in cost"""
        # Mock executions data with fees
        mock_execution1 = Mock()
        mock_execution1.action = 'buy'
        mock_execution1.quantity = 100
        mock_execution1.price = 50.0
        mock_execution1.fee = 5.0  # Higher fee
        mock_execution1.date = datetime(2025, 10, 20)
        mock_execution1.created_at = datetime(2025, 10, 20)
        
        mock_result = Mock()
        mock_result.fetchall.return_value = [mock_execution1]
        
        self.mock_db.execute.return_value = mock_result
        
        # Test
        result = self.service.calculate_position(self.mock_db, 1)
        
        # Assertions
        assert result is not None
        assert result['quantity'] == 100.0
        assert result['total_fees'] == 5.0
        # Total cost: (100*50 + 5) = 5005
        assert result['total_cost'] == 5005.0
        # Average price: 5005 / 100 = 50.05
        assert abs(result['average_price'] - 50.05) < 0.01
    
    def test_calculate_position_error_handling(self):
        """Test error handling in position calculation"""
        # Mock database error
        self.mock_db.execute.side_effect = Exception("Database error")
        
        # Test
        result = self.service.calculate_position(self.mock_db, 1)
        
        # Assertions
        assert result is None
    
    def test_calculate_positions_batch_error_handling(self):
        """Test error handling in batch position calculation"""
        # Mock database error
        self.mock_db.execute.side_effect = Exception("Database error")
        
        # Test
        result = self.service.calculate_positions_batch(self.mock_db, [1, 2])
        
        # Assertions
        assert result == {1: None, 2: None}
