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


if __name__ == "__main__":
    unittest.main()

