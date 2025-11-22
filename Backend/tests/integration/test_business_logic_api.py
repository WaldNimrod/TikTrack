"""
Integration Tests for Business Logic API
========================================

Tests the API endpoints for business logic services.
"""

import pytest
from flask import Flask
from Backend.app import app


@pytest.fixture
def client():
    """Create a test client."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


class TestTradeBusinessLogicAPI:
    """Test suite for Trade Business Logic API endpoints."""
    
    def test_calculate_stop_price_long(self, client):
        """Test stop price calculation for long position."""
        response = client.post('/api/business/trade/calculate-stop-price', 
                             json={'current_price': 100.0, 'stop_percentage': 10.0, 'side': 'Long'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert 'stop_price' in data['data']
        assert data['data']['stop_price'] == 90.0
    
    def test_calculate_stop_price_short(self, client):
        """Test stop price calculation for short position."""
        response = client.post('/api/business/trade/calculate-stop-price',
                             json={'current_price': 100.0, 'stop_percentage': 10.0, 'side': 'Short'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert data['data']['stop_price'] == 110.0
    
    def test_calculate_stop_price_invalid(self, client):
        """Test stop price calculation with invalid input."""
        response = client.post('/api/business/trade/calculate-stop-price',
                             json={'current_price': 0, 'stop_percentage': 10.0, 'side': 'Long'})
        assert response.status_code == 400
        data = response.get_json()
        assert data['status'] == 'error'
    
    def test_calculate_target_price_long(self, client):
        """Test target price calculation for long position."""
        response = client.post('/api/business/trade/calculate-target-price',
                             json={'current_price': 100.0, 'target_percentage': 20.0, 'side': 'Long'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert data['data']['target_price'] == 120.0
    
    def test_calculate_investment(self, client):
        """Test investment calculation."""
        response = client.post('/api/business/trade/calculate-investment',
                             json={'price': 100.0, 'quantity': 10.0})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert data['data']['amount'] == 1000.0


class TestExecutionBusinessLogicAPI:
    """Test suite for Execution Business Logic API endpoints."""
    
    def test_calculate_execution_values_buy(self, client):
        """Test execution values calculation for buy."""
        response = client.post('/api/business/execution/calculate-values',
                             json={'quantity': 10.0, 'price': 100.0, 'commission': 1.0, 'action': 'buy'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert data['data']['total'] == -1001.0  # Negative for buy
    
    def test_calculate_execution_values_sell(self, client):
        """Test execution values calculation for sell."""
        response = client.post('/api/business/execution/calculate-values',
                             json={'quantity': 10.0, 'price': 100.0, 'commission': 1.0, 'action': 'sell'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert data['data']['total'] == 999.0  # Positive for sell


class TestAlertBusinessLogicAPI:
    """Test suite for Alert Business Logic API endpoints."""
    
    def test_validate_alert(self, client):
        """Test alert validation."""
        response = client.post('/api/business/alert/validate',
                             json={'condition_attribute': 'price', 'condition_number': 100.0})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
    
    def test_validate_condition_value(self, client):
        """Test condition value validation."""
        response = client.post('/api/business/alert/validate-condition-value',
                             json={'condition_attribute': 'price', 'condition_number': 100.0})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'


class TestStatisticsBusinessLogicAPI:
    """Test suite for Statistics Business Logic API endpoints."""
    
    def test_calculate_statistics(self, client):
        """Test statistics calculation."""
        response = client.post('/api/business/statistics/calculate',
                             json={'calculation_type': 'kpi', 'data': [{'amount': 100}, {'amount': 200}], 'params': {'sum_fields': ['amount']}})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'


class TestCashFlowBusinessLogicAPI:
    """Test suite for Cash Flow Business Logic API endpoints."""
    
    def test_calculate_account_balance(self, client):
        """Test account balance calculation."""
        response = client.post('/api/business/cash-flow/calculate-balance',
                             json={'initial_balance': 1000.0, 'cash_flows': [{'type': 'income', 'amount': 500.0}]})
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'success'
        assert data['data']['balance'] == 1500.0

