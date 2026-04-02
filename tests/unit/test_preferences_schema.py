"""D39 preferences merge (S003-P003-WP001)."""

from api.schemas.preferences import merge_preferences_from_user


def test_merge_preferences_defaults_and_settings():
    r = merge_preferences_from_user(
        language="en",
        timezone="UTC",
        settings_blob={"rows_per_page": 50},
        api_key_count=3,
    )
    assert r.rows_per_page == 50
    assert r.api_key_count == 3
    assert r.timezone == "UTC"
    assert r.primary_currency == "USD"


def test_merge_preferences_all_defaults():
    r = merge_preferences_from_user(
        language="he",
        timezone="Asia/Jerusalem",
        settings_blob={},
        api_key_count=0,
    )
    assert r.language == "he"
    assert r.rows_per_page == 25
    assert r.price_alert_threshold_pct == 5.0
