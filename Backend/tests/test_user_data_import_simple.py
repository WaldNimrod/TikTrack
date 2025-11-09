import unittest

from connectors.user_data_import.demo_connector import DemoConnector
from connectors.user_data_import.ibkr_connector import IBKRConnector


class TestUserDataImportConnectors(unittest.TestCase):
    """Lightweight tests that confirm connectors emit DateEnvelope fields."""

    def setUp(self):
        self.demo = DemoConnector()
        self.ibkr = IBKRConnector()

    def test_demo_connector_normalize(self):
        record = {
            "Ticker": "AAPL",
            "Action": "buy",
            "Date": "2025-01-15T10:30:00",
            "Quantity": "100",
            "Price": "150.25",
            "Fee": "1.50"
        }
        normalized = self.demo.normalize_record(record)
        self.assertIn("date", normalized)
        self.assertIn("utc", normalized["date"])

    def test_ibkr_connector_normalize(self):
        record = {
            'Symbol': 'TSLA',
            'Asset Category': 'Stocks',
            'Currency': 'USD',
            'Date/Time': '2025-01-15, 11:45:00',
            'Quantity': '-50',
            'T. Price': '200.75',
            'C. Price': '200.75',
            'Proceeds': '-10037.50',
            'Comm/Fee': '2.00',
            'Basis': '-10039.50',
            'Realized P/L': '0',
            'MTM P/L': '0',
            'Code': 'O'
        }
        normalized = self.ibkr.normalize_record(record)
        self.assertIn("date", normalized)
        self.assertIn("utc", normalized["date"])
        self.assertEqual(normalized["action"], "sell")
        self.assertEqual(normalized["quantity"], 50.0)


if __name__ == "__main__":
    unittest.main()

