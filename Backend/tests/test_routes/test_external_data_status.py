import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest
from flask import Flask, g
from sqlalchemy import text

CURRENT_DIR = os.path.dirname(__file__)
BACKEND_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", ".."))
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from Backend.config.database import SessionLocal
from Backend.models.external_data import (
    ExternalDataProvider,
    MarketDataQuote,
    DataRefreshLog,
    IntradayDataSlot,
)
from Backend.models.ticker import Ticker
from Backend.routes.external_data.status import status_bp


@pytest.fixture
def client():
    app = Flask(__name__)
    app.config.update(TESTING=True)
    app.register_blueprint(status_bp)

    @app.before_request
    def _set_test_user():
        g.user_id = 1

    with app.test_client() as test_client:
        yield test_client


@pytest.fixture
def provider_record():
    session = SessionLocal()
    try:
        existing_provider = (
            session.query(ExternalDataProvider)
            .filter(ExternalDataProvider.name == "yahoo_finance")
            .first()
        )
        if not existing_provider:
            session.close()
            pytest.skip("No yahoo_finance provider found. Seed providers in code before running this test.")
        provider_id = existing_provider.id
        provider_name = existing_provider.name
        session.close()
        yield {"id": provider_id, "name": provider_name}

    except Exception:
        session.close()
        raise


def _assert_timestamp_payload(payload):
    assert isinstance(payload, dict)
    for key in ("utc", "local", "epochMs", "timezone", "display"):
        assert key in payload
        assert payload[key] is not None


def _get_existing_ticker(session):
    ticker = session.query(Ticker).filter(Ticker.symbol.isnot(None)).first()
    if not ticker:
        pytest.skip("No ticker found. Seed a ticker (symbol required) before running this test.")
    return ticker


def _seed_external_data(session, provider_id, provider_name, ticker):
    quote = MarketDataQuote(
        ticker_id=ticker.id,
        provider_id=provider_id,
        asof_utc=datetime.now(timezone.utc),
        fetched_at=datetime.now(timezone.utc),
        price=123.45,
        change_pct_day=0.5,
        change_amount_day=0.6,
        volume=1000,
        currency="USD",
        source="test"
    )
    session.add(quote)

    intraday = IntradayDataSlot(
        ticker_id=ticker.id,
        provider_id=provider_id,
        slot_start_utc=datetime.now(timezone.utc),
        open_price=120.0,
        high_price=130.0,
        low_price=115.0,
        close_price=125.0,
        volume=500,
        slot_duration_minutes=15
    )
    session.add(intraday)

    refresh_log = DataRefreshLog(
        provider_id=provider_id,
        operation_type='batch_fetch',
        category='test',
        time_period='in_hours',
        ticker_count=1,
        successful_count=1,
        failed_count=0,
        message='Test log',
        symbols_requested=1,
        symbols_successful=1,
        symbols_failed=0,
        start_time=datetime.now(timezone.utc),
        end_time=datetime.now(timezone.utc),
        total_duration_ms=100,
        status='success'
    )
    session.add(refresh_log)

    session.execute(
        text(
            """
            INSERT INTO quotes_last
            (ticker_id, price, change_amount, change_percent, volume, provider, asof_utc, fetched_at, source, currency, is_stale, quality_score, created_at, updated_at)
            VALUES (:ticker_id, 123.45, 0.6, 0.5, 1000, :provider, :asof_utc, :fetched_at, 'test', 'USD', FALSE, 1, :created_at, :updated_at)
            """
        ),
        {
            'ticker_id': ticker.id,
            'provider': provider_name,
            'asof_utc': datetime.now(timezone.utc).isoformat(),
            'fetched_at': datetime.now(timezone.utc).isoformat(),
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat(),
        }
    )
    session.commit()


def test_status_endpoint_returns_structured_timestamps(client, provider_record):
    response = client.get("/api/external-data/status/")
    assert response.status_code == 200

    data = response.get_json()
    _assert_timestamp_payload(data["timestamp"])

    cache = data["cache"]
    assert "ttl_minutes" in cache
    assert "hot" in cache["ttl_minutes"]

    provider_entry = next(
        (provider for provider in data["providers"]["details"] if provider["name"] == provider_record["name"]),
        None
    )
    assert provider_entry is not None

    if provider_entry.get("last_successful_request"):
        _assert_timestamp_payload(provider_entry["last_successful_request"])
    if provider_entry.get("metrics_timestamp"):
        _assert_timestamp_payload(provider_entry["metrics_timestamp"])


def test_providers_endpoint_returns_structured_timestamps(client, provider_record):
    response = client.get("/api/external-data/status/providers")
    assert response.status_code == 200

    data = response.get_json()
    _assert_timestamp_payload(data["timestamp"])

    provider_entry = next(
        (provider for provider in data["providers"] if provider["name"] == provider_record["name"]),
        None
    )
    assert provider_entry is not None

    if provider_entry.get("last_successful_request"):
        _assert_timestamp_payload(provider_entry["last_successful_request"])
    if provider_entry.get("created_at"):
        _assert_timestamp_payload(provider_entry["created_at"])
    if provider_entry.get("updated_at"):
        _assert_timestamp_payload(provider_entry["updated_at"])


def test_clear_cache_endpoint_removes_external_data(client, provider_record):
    session = SessionLocal()
    ticker = _get_existing_ticker(session)
    provider_id = provider_record["id"]
    _seed_external_data(session, provider_id, provider_record["name"], ticker)

    response = client.post("/api/external-data/status/cache/clear")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert payload["cleared"]["market_data_quotes"] >= 1

    verification_session = SessionLocal()
    try:
        assert verification_session.query(MarketDataQuote).count() == 0
        assert verification_session.query(IntradayDataSlot).count() == 0
        assert verification_session.query(DataRefreshLog).count() == 0
        quotes_last_count = verification_session.execute(text("SELECT COUNT(*) FROM quotes_last")).scalar()
        assert quotes_last_count == 0
    finally:
        verification_session.close()


def test_clear_logs_endpoint_truncates_log_files_and_db(client, provider_record):
    logs_dir = Path('logs')
    logs_dir.mkdir(exist_ok=True)
    existing_log_contents = {}
    for log_file in logs_dir.glob('*.log*'):
        if log_file.is_file():
            existing_log_contents[log_file] = log_file.read_bytes()

    app_log = logs_dir / 'app.log'
    app_log.write_text('Test log entry\n', encoding='utf-8')

    session = SessionLocal()
    provider_id = provider_record["id"]
    log_entry = DataRefreshLog(
        provider_id=provider_id,
        operation_type='batch_fetch',
        symbols_requested=1,
        symbols_successful=1,
        symbols_failed=0,
        start_time=datetime.now(timezone.utc),
        end_time=datetime.now(timezone.utc),
        status='success'
    )
    session.add(log_entry)
    session.commit()
    session.close()

    response = client.post("/api/external-data/status/logs/clear")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert 'app.log' in payload["cleared"]["log_files"]

    assert app_log.read_text(encoding='utf-8') == ''
    verification_session = SessionLocal()
    try:
        assert verification_session.query(DataRefreshLog).count() == 0
    finally:
        verification_session.close()

    for log_file, content in existing_log_contents.items():
        log_file.write_bytes(content)
    if app_log not in existing_log_contents and app_log.exists():
        app_log.unlink()
