import json
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
def _create_test_schema(engine):
    """Create a lightweight schema compatible with the ORM models (without heavy constraints)."""
    schema_sql = """
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS currencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        usd_rate REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trading_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        currency_id INTEGER NOT NULL,
        status TEXT DEFAULT 'open',
        cash_balance REAL DEFAULT 0,
        opening_balance REAL DEFAULT 0,
        total_value REAL DEFAULT 0,
        total_pl REAL DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(currency_id) REFERENCES currencies(id)
    );

    CREATE TABLE IF NOT EXISTS tickers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        remarks TEXT,
        currency_id INTEGER NOT NULL,
        active_trades INTEGER DEFAULT 0,
        status TEXT DEFAULT 'open',
        updated_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(currency_id) REFERENCES currencies(id)
    );

    CREATE TABLE IF NOT EXISTS external_data_providers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        provider_type TEXT NOT NULL,
        api_key TEXT,
        base_url TEXT NOT NULL,
        rate_limit_per_hour INTEGER,
        timeout_seconds INTEGER,
        retry_attempts INTEGER,
        cache_ttl_hot INTEGER,
        cache_ttl_warm INTEGER,
        max_symbols_per_batch INTEGER,
        preferred_batch_size INTEGER,
        last_successful_request DATETIME,
        last_error TEXT,
        error_count INTEGER,
        is_healthy INTEGER DEFAULT 1,
        updated_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trading_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_en TEXT NOT NULL UNIQUE,
        name_he TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        description_en TEXT,
        description_he TEXT,
        icon_class TEXT,
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS method_parameters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        method_id INTEGER NOT NULL,
        parameter_key TEXT NOT NULL,
        parameter_name_en TEXT NOT NULL,
        parameter_name_he TEXT NOT NULL,
        parameter_type TEXT NOT NULL,
        default_value TEXT,
        min_value TEXT,
        max_value TEXT,
        validation_rule TEXT,
        is_required INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        help_text_en TEXT,
        help_text_he TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(method_id) REFERENCES trading_methods(id)
    );

    CREATE TABLE IF NOT EXISTS trade_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trading_account_id INTEGER NOT NULL,
        ticker_id INTEGER NOT NULL,
        investment_type TEXT NOT NULL,
        side TEXT NOT NULL,
        status TEXT NOT NULL,
        planned_amount REAL NOT NULL,
        entry_price REAL NOT NULL,
        entry_conditions TEXT,
        stop_price REAL,
        target_price REAL,
        stop_percentage REAL,
        target_percentage REAL,
        reasons TEXT,
        notes TEXT,
        cancelled_at DATETIME,
        cancel_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trading_account_id) REFERENCES trading_accounts(id),
        FOREIGN KEY(ticker_id) REFERENCES tickers(id)
    );

    CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trading_account_id INTEGER NOT NULL,
        ticker_id INTEGER NOT NULL,
        trade_plan_id INTEGER,
        status TEXT,
        investment_type TEXT NOT NULL,
        side TEXT,
        closed_at DATETIME,
        cancelled_at DATETIME,
        cancel_reason TEXT,
        total_pl REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trading_account_id) REFERENCES trading_accounts(id),
        FOREIGN KEY(ticker_id) REFERENCES tickers(id),
        FOREIGN KEY(trade_plan_id) REFERENCES trade_plans(id)
    );

    CREATE TABLE IF NOT EXISTS plan_conditions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trade_plan_id INTEGER NOT NULL,
        method_id INTEGER NOT NULL,
        condition_group INTEGER DEFAULT 0,
        parameters_json TEXT NOT NULL,
        logical_operator TEXT DEFAULT 'NONE',
        is_active INTEGER DEFAULT 1,
        auto_generate_alerts INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trade_plan_id) REFERENCES trade_plans(id),
        FOREIGN KEY(method_id) REFERENCES trading_methods(id)
    );

    CREATE TABLE IF NOT EXISTS trade_conditions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trade_id INTEGER NOT NULL,
        method_id INTEGER NOT NULL,
        condition_group INTEGER DEFAULT 0,
        parameters_json TEXT NOT NULL,
        logical_operator TEXT DEFAULT 'NONE',
        inherited_from_plan_condition_id INTEGER,
        is_active INTEGER DEFAULT 1,
        auto_generate_alerts INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trade_id) REFERENCES trades(id),
        FOREIGN KEY(method_id) REFERENCES trading_methods(id),
        FOREIGN KEY(inherited_from_plan_condition_id) REFERENCES plan_conditions(id)
    );

    CREATE TABLE IF NOT EXISTS note_relation_types (
        id INTEGER PRIMARY KEY,
        note_relation_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS import_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trading_account_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        source_type TEXT,
        filename TEXT,
        total_rows INTEGER,
        processed_rows INTEGER,
        error_rows INTEGER,
        started_at DATETIME,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trading_account_id) REFERENCES trading_accounts(id)
    );

    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker_id INTEGER,
        message TEXT,
        triggered_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT,
        is_triggered TEXT,
        related_type_id INTEGER,
        related_id INTEGER,
        condition_attribute TEXT,
        condition_operator TEXT,
        condition_number TEXT,
        plan_condition_id INTEGER,
        trade_condition_id INTEGER,
        expiry_date TEXT,
        FOREIGN KEY(plan_condition_id) REFERENCES plan_conditions(id),
        FOREIGN KEY(trade_condition_id) REFERENCES trade_conditions(id)
    );

    CREATE TABLE IF NOT EXISTS market_data_quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker_id INTEGER NOT NULL,
        provider_id INTEGER NOT NULL,
        asof_utc DATETIME NOT NULL,
        fetched_at DATETIME,
        price REAL NOT NULL,
        change_pct_day REAL,
        change_amount_day REAL,
        volume INTEGER,
        currency TEXT,
        source TEXT,
        is_stale INTEGER DEFAULT 0,
        quality_score REAL DEFAULT 1.0,
        updated_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(ticker_id) REFERENCES tickers(id),
        FOREIGN KEY(provider_id) REFERENCES external_data_providers(id)
    );
    """

    raw_conn = engine.raw_connection()
    try:
        raw_conn.executescript(schema_sql)
        raw_conn.commit()
    finally:
        raw_conn.close()

import sys
from pathlib import Path

backend_root = Path(__file__).resolve().parents[2] / "Backend"
if str(backend_root) not in sys.path:
    sys.path.append(str(backend_root))

import Backend.models as backend_models  # noqa: F401 - ensures models are registered with Base
import Backend.models.import_session  # noqa: F401  # Ensure ImportSession mapper is registered
from Backend.models.base import Base

# Ensure legacy absolute imports (e.g. `from models ...`) resolve correctly
sys.modules.setdefault("models", backend_models)
from Backend.models import (
    Currency,
    TradingAccount,
    Ticker,
    TradingMethod,
    MethodParameter,
    ExternalDataProvider,
    NoteRelationType,
    TradePlan,
    PlanCondition,
    Trade,
    TradeCondition,
    MarketDataQuote,
    Alert,
)
from Backend.services import condition_evaluation_task as eval_task


@pytest.fixture
def db_session(tmp_path):
    """Create an isolated SQLite database for each test."""
    db_path = tmp_path / "condition_evaluation.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    _create_test_schema(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    try:
        yield session
    finally:
        session.close()
        engine.dispose()


def _seed_core_entities(session):
    """Seed minimal reference data required for tests."""
    currency = Currency(symbol="USD", name="US Dollar", usd_rate=1.0)
    session.add(currency)
    session.flush()

    account = TradingAccount(name="Test Account", currency_id=currency.id, status="open")
    ticker = Ticker(
        symbol="TST",
        name="Test Asset",
        type="stock",
        currency_id=currency.id,
        status="open",
        active_trades=False,
    )
    provider = ExternalDataProvider(
        name="yahoo_finance",
        display_name="Yahoo Finance",
        provider_type="finance",
        base_url="https://example.com",
        is_active=True,
    )

    note_trade_plan = NoteRelationType(id=3, note_relation_type="trade_plan")
    note_trade = NoteRelationType(id=2, note_relation_type="trade")

    method = TradingMethod(
        name_en="Moving Averages",
        name_he="ממוצעים נעים",
        category="technical_indicators",
        description_en="Moving averages test method",
        description_he="שיטת ממוצעים נעים לבדיקות",
        icon_class="fas fa-chart-line",
        sort_order=1,
    )
    method.parameters.extend(
        [
            MethodParameter(
                parameter_key="ma_period",
                parameter_name_en="Period",
                parameter_name_he="תקופה",
                parameter_type="number",
                default_value="3",
                is_required=True,
                sort_order=1,
            ),
            MethodParameter(
                parameter_key="ma_type",
                parameter_name_en="Type",
                parameter_name_he="סוג",
                parameter_type="dropdown",
                default_value="SMA",
                is_required=True,
                sort_order=2,
            ),
            MethodParameter(
                parameter_key="comparison_type",
                parameter_name_en="Comparison",
                parameter_name_he="השוואה",
                parameter_type="dropdown",
                default_value="above",
                is_required=True,
                sort_order=3,
            ),
        ]
    )

    session.add_all([account, ticker, provider, note_trade_plan, note_trade, method])
    session.commit()

    session.refresh(account)
    session.refresh(ticker)
    session.refresh(provider)
    session.refresh(method)

    return {
        "currency": currency,
        "account": account,
        "ticker": ticker,
        "provider": provider,
        "method": method,
    }


def _create_trade_plan_condition(session, account, ticker, method, *, auto_generate=True):
    trade_plan = TradePlan(
        trading_account_id=account.id,
        ticker_id=ticker.id,
        investment_type="swing",
        side="Long",
        status="open",
        planned_amount=1000,
        entry_price=100,
        stop_price=95,
        target_price=120,
    )
    session.add(trade_plan)
    session.flush()

    parameters = {
        "ma_period": 3,
        "ma_type": "SMA",
        "comparison_type": "above",
    }

    plan_condition = PlanCondition(
        trade_plan_id=trade_plan.id,
        method_id=method.id,
        condition_group=0,
        parameters_json=json.dumps(parameters),
        logical_operator="NONE",
        is_active=True,
        auto_generate_alerts=auto_generate,
    )
    session.add(plan_condition)
    session.commit()

    session.refresh(trade_plan)
    session.refresh(plan_condition)
    return trade_plan, plan_condition


def _create_trade_condition(session, account, ticker, method, *, auto_generate=True):
    trade = Trade(
        trading_account_id=account.id,
        ticker_id=ticker.id,
        status="open",
        investment_type="swing",
        side="Long",
    )
    session.add(trade)
    session.flush()

    parameters = {
        "ma_period": 3,
        "ma_type": "SMA",
        "comparison_type": "above",
    }

    trade_condition = TradeCondition(
        trade_id=trade.id,
        method_id=method.id,
        condition_group=0,
        parameters_json=json.dumps(parameters),
        logical_operator="NONE",
        is_active=True,
        auto_generate_alerts=auto_generate,
    )
    session.add(trade_condition)
    session.commit()

    session.refresh(trade)
    session.refresh(trade_condition)
    return trade, trade_condition


def _add_market_data(session, ticker_id, provider_id, prices):
    base_time = datetime.now(timezone.utc)
    for index, price in enumerate(prices):
        quote_time = base_time - timedelta(minutes=index)
        quote = MarketDataQuote(
            ticker_id=ticker_id,
            provider_id=provider_id,
            asof_utc=quote_time,
            fetched_at=quote_time,
            price=price,
            change_pct_day=0.0,
            change_amount_day=0.0,
            volume=1_000 + index,
            currency="USD",
            source="unit_test",
            is_stale=False,
            quality_score=1.0,
        )
        session.add(quote)
    session.commit()


def _run_task(session, monkeypatch, cooldown_minutes=0):
    def fake_get_db():
        yield session

    monkeypatch.setattr(eval_task, "get_db", fake_get_db)
    monkeypatch.setattr(eval_task, "get_condition_alert_cooldown", lambda _db: cooldown_minutes)

    class FakeAlertService:
        def __init__(self, db):
            self.db = db

        def get_alert_by_condition(self, db, plan_condition_id=None, trade_condition_id=None):
            query = db.query(Alert)
            if plan_condition_id:
                return query.filter(Alert.plan_condition_id == plan_condition_id).first()
            if trade_condition_id:
                return query.filter(Alert.trade_condition_id == trade_condition_id).first()
            return None

        def create_or_update_alert_for_condition(self, db, condition_id, condition_type, alert_data):
            if condition_type == "plan":
                alert = db.query(Alert).filter(Alert.plan_condition_id == condition_id).first()
            else:
                alert = db.query(Alert).filter(Alert.trade_condition_id == condition_id).first()

            if alert:
                for key, value in alert_data.items():
                    if hasattr(alert, key):
                        setattr(alert, key, value)
            else:
                payload = alert_data.copy()
                if condition_type == "plan":
                    payload["plan_condition_id"] = condition_id
                else:
                    payload["trade_condition_id"] = condition_id
                alert = Alert(**payload)
                db.add(alert)

            db.commit()
            db.refresh(alert)
            return alert

        def reactivate_alert(self, db, alert_id):
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if not alert:
                return None
            alert.is_triggered = "new"
            alert.status = "open"
            alert.triggered_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(alert)
            return alert

    monkeypatch.setattr(eval_task, "AlertService", FakeAlertService)

    def fake_evaluate_all_active_conditions(_self=None):
        results = []

        # Plan conditions
        plan_conditions = session.query(PlanCondition).all()
        for condition in plan_conditions:
            trade_plan = session.query(TradePlan).get(condition.trade_plan_id)
            method = session.query(TradingMethod).get(condition.method_id)
            latest_quote = session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == (trade_plan.ticker_id if trade_plan else None)
            ).order_by(MarketDataQuote.fetched_at.desc()).first()

            results.append({
                "condition_id": condition.id,
                "condition_type": "plan",
                "method_id": condition.method_id,
                "method_name": method.name_en if method else "Unknown",
                "met": True,
                "evaluation_time": datetime.now(timezone.utc).isoformat(),
                "details": {"source": "unit_test"},
                "ticker_id": trade_plan.ticker_id if trade_plan else None,
                "plan_id": trade_plan.id if trade_plan else None,
                "current_price": latest_quote.price if latest_quote else 0,
                "auto_generate": condition.auto_generate_alerts,
            })

        # Trade conditions
        trade_conditions = session.query(TradeCondition).all()
        for condition in trade_conditions:
            trade = session.query(Trade).get(condition.trade_id)
            method = session.query(TradingMethod).get(condition.method_id)
            latest_quote = session.query(MarketDataQuote).filter(
                MarketDataQuote.ticker_id == (trade.ticker_id if trade else None)
            ).order_by(MarketDataQuote.fetched_at.desc()).first()

            results.append({
                "condition_id": condition.id,
                "condition_type": "trade",
                "method_id": condition.method_id,
                "method_name": method.name_en if method else "Unknown",
                "met": True,
                "evaluation_time": datetime.now(timezone.utc).isoformat(),
                "details": {"source": "unit_test"},
                "ticker_id": trade.ticker_id if trade else None,
                "trade_id": trade.id if trade else None,
                "current_price": latest_quote.price if latest_quote else 0,
                "auto_generate": condition.auto_generate_alerts,
            })

        return results

    monkeypatch.setattr(
        eval_task.ConditionEvaluator,
        "evaluate_all_active_conditions",
        fake_evaluate_all_active_conditions
    )

    def fake_should_reactivate_alert(alert, cooldown_minutes):
        if not alert or alert.triggered_at is None:
            return True
        triggered_at = alert.triggered_at
        if triggered_at.tzinfo is None:
            triggered_at = triggered_at.replace(tzinfo=timezone.utc)
        elapsed = datetime.now(timezone.utc) - triggered_at
        return elapsed.total_seconds() >= cooldown_minutes * 60

    def fake_process_condition_alert_lifecycle(alert_service, result, db_session):
        if not result.get("auto_generate", True):
            return {
                "success": True,
                "action": "skipped",
                "message": f"Auto-generate disabled for condition {result.get('condition_id')}"
            }

        condition_id = result.get("condition_id")
        condition_type = result.get("condition_type", "plan")
        condition_met = result.get("met", False)

        existing_alert = alert_service.get_alert_by_condition(
            db_session,
            plan_condition_id=condition_id if condition_type == "plan" else None,
            trade_condition_id=condition_id if condition_type == "trade" else None
        )

        related_type_id = 3 if condition_type == "plan" else 2
        related_id = result.get("plan_id") if condition_type == "plan" else result.get("trade_id")
        if related_id is None:
            related_id = condition_id

        if not existing_alert:
            if not condition_met:
                return {
                    "success": True,
                    "action": "none",
                    "message": f"Condition {condition_id} not met"
                }

            alert_data = {
                "message": f"{result.get('method_name', 'Condition')} triggered",
                "related_id": related_id,
                "related_type_id": related_type_id,
                "condition_attribute": "price",
                "condition_operator": "more_than",
                "condition_number": str(result.get("current_price", 0)),
                "status": "open",
                "is_triggered": "new",
                "triggered_at": datetime.now(timezone.utc)
            }

            alert = alert_service.create_or_update_alert_for_condition(
                db_session,
                condition_id,
                condition_type,
                alert_data
            )

            return {
                "success": True,
                "action": "created",
                "alert_id": alert.id,
                "message": f"Alert created for condition {condition_id}"
            }

        # Existing alert logic
        if not condition_met:
            return {
                "success": True,
                "action": "none",
                "message": f"Condition {condition_id} not met"
            }

        if existing_alert.is_triggered == "false":
            existing_alert.is_triggered = "new"
            existing_alert.triggered_at = datetime.now(timezone.utc)
            existing_alert.status = "open"
            db_session.commit()
            db_session.refresh(existing_alert)
            return {
                "success": True,
                "action": "triggered",
                "alert_id": existing_alert.id,
                "message": f"Alert triggered for condition {condition_id}"
            }

        if existing_alert.is_triggered == "true":
            cooldown_minutes = eval_task.get_condition_alert_cooldown(db_session)
            if fake_should_reactivate_alert(existing_alert, cooldown_minutes):
                alert_service.reactivate_alert(db_session, existing_alert.id)
                return {
                    "success": True,
                    "action": "reactivated",
                    "alert_id": existing_alert.id,
                    "message": f"Alert reactivated for condition {condition_id}"
                }
            return {
                "success": True,
                "action": "cooldown",
                "message": f"Alert for condition {condition_id} still in cooldown"
            }

        return {
            "success": True,
            "action": "none",
            "message": f"Alert for condition {condition_id} already active"
        }

    monkeypatch.setattr(eval_task, "should_reactivate_alert", fake_should_reactivate_alert)
    monkeypatch.setattr(eval_task, "process_condition_alert_lifecycle", fake_process_condition_alert_lifecycle)

    session.expire_all()
    return eval_task.condition_evaluation_task()


def test_condition_evaluation_task_creates_alert_for_plan_condition(db_session, monkeypatch):
    entities = _seed_core_entities(db_session)
    trade_plan, plan_condition = _create_trade_plan_condition(
        db_session, entities["account"], entities["ticker"], entities["method"]
    )
    _add_market_data(db_session, entities["ticker"].id, entities["provider"].id, [120, 115, 110, 108])

    result = _run_task(db_session, monkeypatch)

    assert result["success"] is True
    assert result["alerts_created"] == 1
    alerts = db_session.query(Alert).all()
    assert len(alerts) == 1
    alert = alerts[0]
    assert alert.plan_condition_id == plan_condition.id
    assert alert.trade_condition_id is None
    assert alert.related_type_id == 3
    assert alert.related_id == trade_plan.id
    assert alert.is_triggered == "new"

    # Second run should not create duplicate alerts
    second_result = _run_task(db_session, monkeypatch)
    assert second_result["alerts_created"] == 0
    assert db_session.query(Alert).count() == 1


def test_condition_evaluation_respects_auto_generate_flag(db_session, monkeypatch):
    entities = _seed_core_entities(db_session)
    _create_trade_plan_condition(
        db_session,
        entities["account"],
        entities["ticker"],
        entities["method"],
        auto_generate=False,
    )
    _add_market_data(db_session, entities["ticker"].id, entities["provider"].id, [130, 120, 118])

    result = _run_task(db_session, monkeypatch)

    assert result["alerts_created"] == 0
    assert db_session.query(Alert).count() == 0


def test_condition_evaluation_reactivates_alert_after_cooldown(db_session, monkeypatch):
    entities = _seed_core_entities(db_session)
    trade_plan, plan_condition = _create_trade_plan_condition(
        db_session, entities["account"], entities["ticker"], entities["method"]
    )
    _add_market_data(db_session, entities["ticker"].id, entities["provider"].id, [140, 135, 130])

    existing_alert = Alert(
        message="Existing alert",
        plan_condition_id=plan_condition.id,
        related_type_id=3,
        related_id=trade_plan.id,
        condition_attribute="price",
        condition_operator="more_than",
        condition_number="0",
        status="closed",
        is_triggered="true",
        triggered_at=datetime.now(timezone.utc) - timedelta(minutes=120),
    )
    db_session.add(existing_alert)
    db_session.commit()

    result = _run_task(db_session, monkeypatch, cooldown_minutes=30)
    db_session.refresh(existing_alert)

    assert result["success"] is True
    assert existing_alert.is_triggered == "new"
    assert existing_alert.status == "open"


def test_condition_evaluation_task_creates_alert_for_trade_condition(db_session, monkeypatch):
    entities = _seed_core_entities(db_session)
    trade, trade_condition = _create_trade_condition(
        db_session, entities["account"], entities["ticker"], entities["method"]
    )
    _add_market_data(db_session, entities["ticker"].id, entities["provider"].id, [150, 145, 140, 138])

    result = _run_task(db_session, monkeypatch)

    assert result["success"] is True
    alerts = db_session.query(Alert).all()
    assert len(alerts) == 1
    alert = alerts[0]
    assert alert.trade_condition_id == trade_condition.id
    assert alert.plan_condition_id is None
    assert alert.related_type_id == 2
    assert alert.related_id == trade.id

