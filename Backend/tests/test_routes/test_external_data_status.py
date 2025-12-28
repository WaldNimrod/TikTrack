import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest
from flask import Flask
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
from Backend.models.currency import Currency
from Backend.routes.external_data.status import status_bp


@pytest.fixture
def client():
    app = Flask(__name__)
    app.config.update(TESTING=True)
    app.register_blueprint(status_bp)

    with app.test_client() as test_client:
        yield test_client


@pytest.fixture
def provider_record():
    session = SessionLocal()
    try:
        # Check if we have any existing provider
        existing_provider = session.query(ExternalDataProvider).first()
        if existing_provider:
            provider_id = existing_provider.id
            provider_name = existing_provider.name
            session.close()
            yield {"id": provider_id, "name": provider_name}
            return

        # If no providers exist, fail with message to run seed
        session.close()
        pytest.fail("No external data providers found. Please run seed data first.")

    except Exception:
        session.close()
        raise


def _assert_timestamp_payload(payload):
    assert isinstance(payload, dict)
    for key in ("utc", "local", "epochMs", "timezone", "display"):
        assert key in payload
        assert payload[key] is not None


def _ensure_currency_and_ticker(session):
    currency_id = session.execute(text("SELECT id FROM currencies LIMIT 1")).scalar()
    if not currency_id:
        currency = Currency(symbol=f"CUR{uuid.uuid4().hex[:3]}", name="Test Currency", usd_rate=1)
        session.add(currency)
        session.flush()
        currency_id = currency.id

    ticker = Ticker(
        symbol=f"TST{uuid.uuid4().hex[:5]}",
        name="Test Ticker",
        type="stock",
        currency_id=currency_id,
        status="open"
    )
    session.add(ticker)
    session.flush()
    return ticker


def _seed_external_data(session, provider_id, ticker):
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
            VALUES (:ticker_id, 123.45, 0.6, 0.5, 1000, :provider, :asof_utc, :fetched_at, 'test', 'USD', 0, 1, :created_at, :updated_at)
            """
        ),
        {
            'ticker_id': ticker.id,
            'provider': 'test_provider',
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
    ticker = _ensure_currency_and_ticker(session)
    provider_id = provider_record["id"]
    _seed_external_data(session, provider_id, ticker)

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

    cleanup_session = SessionLocal()
    try:
        cleanup_session.query(Ticker).filter(Ticker.id == ticker.id).delete()
        cleanup_session.commit()
    finally:
        cleanup_session.close()


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
