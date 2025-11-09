"""
DateEnvelope Integration Smoke Tests
====================================

These lightweight tests validate the new DateEnvelope contract that the
import system relies on. They ensure that the DateNormalizationService
keeps datetimes consistent across UTC storage and user-facing timezones.
"""

import unittest
from datetime import datetime, timezone

from services.date_normalization_service import DateNormalizationService


class TestDateEnvelopeIntegration(unittest.TestCase):
    """Verify that the DateEnvelope helpers behave as expected."""

    def test_normalize_output_adds_envelope(self):
        normalizer = DateNormalizationService("Asia/Jerusalem")
        payload = {
            "executed_at": datetime(2025, 1, 15, 14, 30, tzinfo=timezone.utc),
            "symbol": "AAPL"
        }

        normalized = normalizer.normalize_output(payload)
        self.assertIn("executed_at", normalized)
        executed_at = normalized["executed_at"]
        self.assertEqual(executed_at["timezone"], "Asia/Jerusalem")
        self.assertEqual(executed_at["utc"], "2025-01-15T14:30:00Z")
        self.assertIn("local", executed_at)

    def test_normalize_input_parses_envelope(self):
        normalizer = DateNormalizationService("America/New_York")
        envelope = {
            "utc": "2025-01-15T19:30:00Z",
            "epochMs": 1736969400000,
            "local": "2025-01-15T14:30:00-05:00",
            "timezone": "America/New_York",
            "display": "15/01/2025 14:30"
        }

        parsed = normalizer.normalize_input_payload({"executed_at": envelope})
        self.assertIn("executed_at", parsed)
        self.assertIsInstance(parsed["executed_at"], datetime)
        self.assertEqual(parsed["executed_at"], datetime(2025, 1, 15, 19, 30))


if __name__ == '__main__':
    unittest.main()

