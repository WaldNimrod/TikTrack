import unittest
from unittest.mock import MagicMock, patch

from flask import Flask

from routes.api.preferences import preferences_bp


class TestPreferencesRoutes(unittest.TestCase):
    """Validate that preferences endpoints emit enveloped timestamps."""

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["TESTING"] = True
        self.app.register_blueprint(preferences_bp)
        self.client = self.app.test_client()

        pref_patcher = patch("routes.api.preferences.BaseEntityUtils.get_request_normalizer")
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
        self.normalizer.normalize_output.side_effect = lambda payload: payload
        self.mock_get_normalizer.return_value = self.normalizer

    @patch("routes.api.preferences.PreferencesService.get_group_preferences")
    def test_user_group_preferences_returns_timestamp(self, mock_get_group_preferences):
        mock_get_group_preferences.return_value = {"theme": "dark"}

        response = self.client.get("/api/preferences/user/group?group=ui")
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertTrue(payload["success"])
        self.assertIn("timestamp", payload)
        self.assertIn("utc", payload["timestamp"])


if __name__ == "__main__":
    unittest.main()

