import unittest
from datetime import datetime, timezone

from services.date_normalization_service import DateNormalizationService


class TestComprehensiveDateEnvelope(unittest.TestCase):
    """End-to-end style checks for DateEnvelope structures."""

    def setUp(self):
        self.normalizer = DateNormalizationService("Europe/London")

    def test_full_payload_normalization(self):
        payload = {
            "imported_at": datetime(2025, 1, 20, 8, 45, tzinfo=timezone.utc),
            "executions": [
                {
                    "executed_at": datetime(2025, 1, 19, 14, 30, tzinfo=timezone.utc),
                    "symbol": "AAPL"
                },
                {
                    "executed_at": datetime(2025, 1, 19, 15, 30, tzinfo=timezone.utc),
                    "symbol": "TSLA"
                }
            ]
        }

        normalized = self.normalizer.normalize_output(payload)
        self.assertIn("imported_at", normalized)
        self.assertIn("utc", normalized["imported_at"])
        self.assertEqual(normalized["imported_at"]["timezone"], "Europe/London")
        self.assertEqual(len(normalized["executions"]), 2)
        for execution in normalized["executions"]:
            self.assertIn("utc", execution["executed_at"])


if __name__ == "__main__":
    unittest.main()

