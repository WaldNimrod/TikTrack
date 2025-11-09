import datetime
import unittest
from unittest.mock import MagicMock, patch

from flask import Flask

from routes.api.trades import trades_bp


class TestTradesRoutesDateEnvelope(unittest.TestCase):
    """Smoke tests ensuring the trades blueprint emits DateEnvelope payloads."""

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["TESTING"] = True
        self.app.register_blueprint(trades_bp)
        self.client = self.app.test_client()

        patcher = patch("routes.api.trades.preferences_service")
        self.mock_preferences = patcher.start()
        self.addCleanup(patcher.stop)
        self.mock_preferences.get_preference.return_value = "UTC"

    @patch("routes.api.trades.TradeService.get_all")
    @patch("routes.api.trades.get_db")
    def test_get_trades_returns_date_envelope(self, mock_get_db, mock_get_all):
        mock_session = MagicMock()
        mock_get_db.return_value.__enter__.return_value = mock_session
        mock_get_db.return_value.__exit__.return_value = False

        mock_trade = MagicMock()
        mock_trade.to_dict.return_value = {
            "id": 1,
            "created_at": datetime.datetime(2025, 1, 1, 12, 0, tzinfo=datetime.timezone.utc),
        }
        mock_get_all.return_value = [mock_trade]

        response = self.client.get("/api/trades/")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("data", payload)
        first_trade = payload["data"][0]
        self.assertIn("created_at", first_trade)
        self.assertIn("utc", first_trade["created_at"])
        self.assertIn("timestamp", payload)
        self.assertIn("utc", payload["timestamp"])


if __name__ == "__main__":
    unittest.main()

