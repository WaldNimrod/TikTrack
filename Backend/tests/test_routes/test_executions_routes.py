import datetime
import unittest
from unittest.mock import MagicMock, patch

from flask import Flask

from routes.api.executions import executions_bp


class TestExecutionsRoutes(unittest.TestCase):
    """Ensure executions endpoints serialize dates via DateEnvelope."""

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["TESTING"] = True
        self.app.register_blueprint(executions_bp)
        self.client = self.app.test_client()

        pref_patcher = patch("routes.api.executions.preferences_service")
        self.mock_preferences = pref_patcher.start()
        self.mock_preferences.get_preference.return_value = "UTC"
        self.addCleanup(pref_patcher.stop)

    @patch("routes.api.executions.ExecutionService.get_all")
    @patch("routes.api.executions.get_db")
    def test_get_executions_returns_enveloped_dates(self, mock_get_db, mock_get_all):
        mock_session = MagicMock()
        mock_get_db.return_value.__enter__.return_value = mock_session
        mock_get_db.return_value.__exit__.return_value = False

        mock_execution = MagicMock()
        mock_execution.to_dict.return_value = {
            "id": 42,
            "date": datetime.datetime(2025, 1, 10, 15, 0, tzinfo=datetime.timezone.utc),
        }
        mock_get_all.return_value = [mock_execution]

        response = self.client.get("/api/executions/")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("data", payload)
        first_execution = payload["data"][0]
        self.assertIn("date", first_execution)
        self.assertIn("utc", first_execution["date"])
        self.assertIn("timestamp", payload)
        self.assertIn("utc", payload["timestamp"])

    @patch("routes.api.executions.ExecutionTradeMatchingService.get_execution_trade_creation_clusters")
    @patch("routes.api.executions.get_db")
    def test_trade_creation_clusters_return_enveloped_dates(self, mock_get_db, mock_get_clusters):
        mock_session = MagicMock()
        mock_get_db.return_value.__enter__.return_value = mock_session
        mock_get_db.return_value.__exit__.return_value = False

        start_dt = datetime.datetime(2025, 1, 5, 10, 0, tzinfo=datetime.timezone.utc)
        end_dt = datetime.datetime(2025, 1, 7, 16, 30, tzinfo=datetime.timezone.utc)

        mock_get_clusters.return_value = [
            {
                "cluster_id": "1-none-long",
                "ticker": {"id": 1, "symbol": "TSLA", "name": "Tesla"},
                "trading_account": {"id": None, "name": None},
                "executions": [],
                "execution_ids": [11, 12],
                "side": "long",
                "stats": {
                    "total_quantity": 20,
                    "total_value": 500.0,
                    "total_fee": 4.5,
                    "execution_count": 2,
                    "average_price": 25.0,
                    "distinct_sources": ["manual"],
                    "date_range": {"start": start_dt, "end": end_dt},
                },
                "suggested_trade": {
                    "entry_date": start_dt,
                    "last_execution_date": end_dt,
                    "quantity": 20,
                },
            }
        ]

        response = self.client.get("/api/executions/pending-assignment/trade-creation-clusters")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("data", payload)

        cluster = payload["data"][0]
        date_range = cluster["stats"]["date_range"]
        self.assertIn("utc", date_range["start"])
        self.assertIn("utc", date_range["end"])
        suggested_trade = cluster["suggested_trade"]
        self.assertIn("utc", suggested_trade["entry_date"])
        self.assertIn("utc", suggested_trade["last_execution_date"])


if __name__ == "__main__":
    unittest.main()

