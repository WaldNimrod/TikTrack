"""
User Data Import Normalization Tests
====================================

Focused tests that cover the key parts of the import pipeline after the
timezone overhaul: connectors produce DateEnvelope structures and the
normalization service keeps payloads consistent.
"""

import unittest
from datetime import datetime, timezone

from connectors.user_data_import.demo_connector import DemoConnector
from services.user_data_import.normalization_service import NormalizationService


class TestImportNormalizationPipeline(unittest.TestCase):
    def setUp(self):
        self.connector = DemoConnector()
        self.normalization_service = NormalizationService()

    def test_demo_record_has_date_envelope(self):
        record = {
            "Ticker": "AAPL",
            "Action": "buy",
            "Date": "2025-01-15T10:30:00",
            "Quantity": "100",
            "Price": "150.25",
            "Fee": "1.50"
        }
        normalized = self.connector.normalize_record(record)
        self.assertIn("date", normalized)
        self.assertIn("utc", normalized["date"])

    def test_normalization_service_preserves_envelope(self):
        raw_records = [{
            "Ticker": "AAPL",
            "Action": "buy",
            "Date": "2025-01-15T10:30:00",
            "Quantity": "100",
            "Price": "150.25",
            "Fee": "1.50"
        }]
        result = self.normalization_service.normalize_records(raw_records, self.connector)
        normalized_records = result["normalized_records"]
        self.assertEqual(len(normalized_records), 1)
        self.assertIn("date", normalized_records[0])
        self.assertIn("utc", normalized_records[0]["date"])


if __name__ == '__main__':
    unittest.main()

