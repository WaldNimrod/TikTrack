import unittest
from unittest.mock import patch

from flask import Flask

from routes.api.cache_management import cache_management_bp


class TestCacheManagementRoutes(unittest.TestCase):
    """Simple smoke test to ensure cache clear endpoint responds with envelope."""

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["TESTING"] = True
        self.app.register_blueprint(cache_management_bp)
        self.client = self.app.test_client()

    @patch("routes.api.cache_management.CacheManager.clear_cache")
    def test_clear_cache_returns_success(self, mock_clear_cache):
        mock_clear_cache.return_value = {
            "cacheCleared": True,
            "levels": ["memory", "local_storage"]
        }

        response = self.client.post("/api/cache/clear/", json={"level": "light"})
        self.assertEqual(response.status_code, 200)
        payload = response.get_json()
        self.assertEqual(payload["status"], "success")
        self.assertIn("timestamp", payload)
        self.assertIn("utc", payload["timestamp"])


if __name__ == "__main__":
    unittest.main()

