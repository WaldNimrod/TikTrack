import unittest
from datetime import datetime

from services.date_normalization_service import DateNormalizationService


class TestTradePayloadNormalization(unittest.TestCase):
    """Validate normalization of trade payloads for create/update operations."""

    def setUp(self):
        self.normalizer = DateNormalizationService("UTC")

    def test_normalize_trade_payload_from_user_timezone(self):
        payload = {
            "ticker_id": 1,
            "trading_account_id": 2,
            "created_at": {
                "utc": "2025-01-10T19:30:00Z",
                "epochMs": 1736537400000,
                "local": "2025-01-10T21:30:00+02:00",
                "timezone": "Asia/Jerusalem",
                "display": "10/01/2025 21:30"
            }
        }

        normalized = self.normalizer.normalize_input_payload(payload)
        self.assertIn("created_at", normalized)
        self.assertIsInstance(normalized["created_at"], datetime)
        self.assertEqual(normalized["created_at"], datetime(2025, 1, 10, 19, 30))

    def test_normalize_trade_output_adds_envelope(self):
        trade_dict = {
            "id": 5,
            "created_at": datetime(2025, 1, 10, 19, 30)
        }

        normalized = self.normalizer.normalize_output(trade_dict)
        self.assertIn("created_at", normalized)
        self.assertIn("utc", normalized["created_at"])
        self.assertEqual(normalized["created_at"]["utc"], "2025-01-10T19:30:00Z")


if __name__ == "__main__":
    unittest.main()

