import datetime
import unittest
from unittest.mock import MagicMock, patch

from flask import Flask

from routes.api.trading_accounts import trading_accounts_bp


class TestTradingAccountsRoutes(unittest.TestCase):
    """Ensure trading account endpoints wrap timestamps with DateEnvelope."""

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["TESTING"] = True
        self.app.register_blueprint(trading_accounts_bp)
        self.client = self.app.test_client()

        pref_patcher = patch("routes.api.trading_accounts.BaseEntityUtils.get_request_normalizer")
        self.mock_get_normalizer = pref_patcher.start()
        self.addCleanup(pref_patcher.stop)

        self.normalizer = MagicMock()
        self.normalizer.now_envelope.return_value = {
            "utc": "2025-01-01T00:00:00Z",
            "epochMs": 1735689600000,
            "local": "2025-01-01T00:00:00+00:00",
            "timezone": "UTC",
            "display": "01/01/2025 00:00"
        }
        self.normalizer.normalize_output.side_effect = lambda payload: [{
            "created_at": {
                "utc": "2025-01-01T00:00:00Z",
                "epochMs": 1735689600000,
                "local": "2025-01-01T00:00:00+00:00",
                "timezone": "UTC",
                "display": "01/01/2025 00:00"
            },
            "id": 3
        }]
        self.mock_get_normalizer.return_value = self.normalizer

    @patch("routes.api.trading_accounts.TradingAccountService.get_all")
    @patch("routes.api.trading_accounts.get_db")
    def test_trading_accounts_list_returns_envelopes(self, mock_get_db, mock_get_all):
        mock_session = MagicMock()
        mock_get_db.return_value.__enter__.return_value = mock_session
        mock_get_db.return_value.__exit__.return_value = False

        mock_account = MagicMock()
        mock_account.to_dict.return_value = {
            "id": 3,
            "created_at": datetime.datetime(2025, 1, 1, 0, 0, tzinfo=datetime.timezone.utc)
        }
        mock_get_all.return_value = [mock_account]

        response = self.client.get("/api/trading-accounts/")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("data", payload)
        self.assertIn("timestamp", payload)
        self.assertIn("utc", payload["timestamp"])


if __name__ == "__main__":
    unittest.main()

