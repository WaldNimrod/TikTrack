import datetime
import unittest
from unittest.mock import MagicMock, patch

from flask import Flask

from routes.api.trade_plans import trade_plans_bp


class TestTradePlansRoutes(unittest.TestCase):
    """Verify trade plan responses include DateEnvelope timestamps."""

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["TESTING"] = True
        self.app.register_blueprint(trade_plans_bp)
        self.client = self.app.test_client()

        pref_patcher = patch("routes.api.trade_plans.preferences_service")
        self.mock_preferences = pref_patcher.start()
        self.mock_preferences.get_preference.return_value = "UTC"
        self.addCleanup(pref_patcher.stop)

    @patch("routes.api.trade_plans.TradePlanService.get_all")
    @patch("routes.api.trade_plans.get_db")
    def test_trade_plans_list_has_enveloped_dates(self, mock_get_db, mock_get_all):
        mock_session = MagicMock()
        mock_get_db.return_value.__enter__.return_value = mock_session
        mock_get_db.return_value.__exit__.return_value = False

        mock_plan = MagicMock()
        mock_plan.to_dict.return_value = {
            "id": 7,
            "created_at": datetime.datetime(2025, 1, 5, 9, 0, tzinfo=datetime.timezone.utc),
        }
        mock_get_all.return_value = [mock_plan]

        response = self.client.get("/api/trade-plans/")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("data", payload)
        first_plan = payload["data"][0]
        self.assertIn("created_at", first_plan)
        self.assertIn("utc", first_plan["created_at"])
        self.assertIn("timestamp", payload)


if __name__ == "__main__":
    unittest.main()

