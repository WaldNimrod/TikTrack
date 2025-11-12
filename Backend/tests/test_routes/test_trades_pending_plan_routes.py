#!/usr/bin/env python3
"""
Trades Pending Plan Routes Tests - TikTrack
===========================================

API route tests for trade-plan recommendation endpoints.
"""

import os
import sys
import unittest
from unittest.mock import MagicMock, patch

from flask import Flask

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from routes.api.trades import trades_bp  # noqa: E402


class DummyNormalizer:
    """Simple normalizer stub used in route tests."""

    def normalize_output(self, payload):
        return payload

    def normalize_input_payload(self, payload):
        return payload

    def now_envelope(self):
        return {"utc": "2025-01-01T00:00:00Z"}


class TestTradesPendingPlanRoutes(unittest.TestCase):
    """Test suite for trade-plan matching routes."""

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.register_blueprint(trades_bp)
        self.mock_session = MagicMock()

    def _patch_db(self):
        patcher = patch('routes.api.trades.get_db')
        mocked_get_db = patcher.start()
        self.addCleanup(patcher.stop)
        mocked_get_db.return_value = iter([self.mock_session])
        return mocked_get_db

    def _patch_normalizer(self):
        patcher = patch('routes.api.trades._get_date_normalizer', return_value=DummyNormalizer())
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_pending_plan_assignments_endpoint(self):
        """GET /api/trades/pending-plan/assignments returns payload."""
        self._patch_db()
        self._patch_normalizer()

        sample_response = [{
            "trade_id": 1,
            "best_score": 80,
            "suggestions": [{"trade_plan_id": 10, "score": 80}],
        }]

        with patch(
            'routes.api.trades.TradePlanMatchingService.get_assignment_suggestions',
            return_value=sample_response,
        ) as mock_service:
            with self.app.test_client() as client:
                response = client.get('/api/trades/pending-plan/assignments')

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload['data'], sample_response)
        mock_service.assert_called_once()

    def test_pending_plan_creations_endpoint(self):
        """GET /api/trades/pending-plan/creations returns payload."""
        self._patch_db()
        self._patch_normalizer()

        assignment_preview = [{"trade_id": 2, "best_score": 70}]
        creation_payload = [{
            "trade_id": 2,
            "score": 30,
            "prefill": {"ticker_id": 10},
            "has_assignment_suggestion": True,
        }]

        with patch(
            'routes.api.trades.TradePlanMatchingService.get_assignment_suggestions',
            return_value=assignment_preview,
        ) as mock_assign, patch(
            'routes.api.trades.TradePlanMatchingService.get_creation_suggestions',
            return_value=creation_payload,
        ) as mock_create:
            with self.app.test_client() as client:
                response = client.get('/api/trades/pending-plan/creations')

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload['data'], creation_payload)
        mock_assign.assert_called_once()
        mock_create.assert_called_once()

    def test_link_plan_endpoint(self):
        """POST /api/trades/<id>/link-plan delegates to service."""
        self._patch_db()
        self._patch_normalizer()
        updated_trade = {"id": 5, "trade_plan_id": 42}

        with patch(
            'routes.api.trades.TradePlanMatchingService.link_trade_to_plan',
            return_value=updated_trade,
        ) as mock_link:
            with self.app.test_client() as client:
                response = client.post(
                    '/api/trades/5/link-plan',
                    json={"trade_plan_id": 42},
                )

        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload['data'], updated_trade)
        mock_link.assert_called_once()
        args, _ = mock_link.call_args
        self.assertEqual(args[1], 5)
        self.assertEqual(args[2], 42)


if __name__ == '__main__':
    unittest.main()

