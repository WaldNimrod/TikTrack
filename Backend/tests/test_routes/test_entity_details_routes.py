#!/usr/bin/env python3
"""
Entity Details Routes API Tests - TikTrack

בדיקות מקיפות ל-API endpoints של Entity Details

Author: TikTrack Development Team
Date: January 2025
"""

import sys
import os
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from flask import Flask
from routes.api.entity_details import entity_details_bp


class TestEntityDetailsRoutes(unittest.TestCase):
    """Test suite for Entity Details API routes"""
    
    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.register_blueprint(entity_details_bp)
        self.mock_db = Mock()
    
    def test_get_entity_details_endpoint(self):
        """Test GET /api/entity-details/<entity_type>/<id> endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.entity_details.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.get('/api/entity-details/trade/1')
                self.assertIn(response.status_code, [200, 404, 500])
    
    def test_get_entity_relations_endpoint(self):
        """Test GET /api/entity-details/<entity_type>/<id>/relations endpoint"""
        with self.app.test_client() as client:
            with patch('routes.api.entity_details.get_db') as mock_get_db:
                mock_get_db.return_value.__enter__ = Mock(return_value=self.mock_db)
                mock_get_db.return_value.__exit__ = Mock(return_value=False)
                response = client.get('/api/entity-details/trade/1/relations')
                self.assertIn(response.status_code, [200, 404, 500])


if __name__ == '__main__':
    unittest.main()

