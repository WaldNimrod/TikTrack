import unittest
from unittest.mock import MagicMock, patch

from services.date_normalization_service import DateNormalizationService


class TestPreferencesTimezoneIntegration(unittest.TestCase):
    """Ensure timezone resolution consults the preferences service."""

    def test_resolve_timezone_uses_preferences(self):
        mock_request = MagicMock()
        mock_request.args.get.return_value = None
        mock_request.is_json = False

        mock_preferences = MagicMock()
        mock_preferences.get_preference.return_value = "Asia/Jerusalem"

        timezone = DateNormalizationService.resolve_timezone(
            mock_request,
            preferences_service=mock_preferences,
            fallback_user_id=99
        )

        self.assertEqual(timezone, "Asia/Jerusalem")
        mock_preferences.get_preference.assert_called_once_with(99, "timezone")

    def test_resolve_timezone_falls_back_to_utc(self):
        mock_request = MagicMock()
        mock_request.args.get.return_value = None
        mock_request.is_json = False

        mock_preferences = MagicMock()
        mock_preferences.get_preference.side_effect = Exception("DB unavailable")

        timezone = DateNormalizationService.resolve_timezone(
            mock_request,
            preferences_service=mock_preferences
        )
        self.assertEqual(timezone, "UTC")


if __name__ == "__main__":
    unittest.main()

