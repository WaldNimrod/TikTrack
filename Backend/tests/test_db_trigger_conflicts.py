import json
import importlib.util
import pathlib
import sqlite3

import pytest


BASE_DIR = pathlib.Path(__file__).resolve().parents[1]
SCRIPT_PATH = BASE_DIR / "scripts" / "create_clean_database.py"
BRIDGE_MIGRATION_PATH = (
    BASE_DIR / "migrations" / "migration_20251013_120000_entity_relation_types_bridge.json"
)

_spec = importlib.util.spec_from_file_location(
    "create_clean_database", str(SCRIPT_PATH)
)
db_builder = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(db_builder)


@pytest.fixture()
def db_conn():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")

    cursor = conn.cursor()
    db_builder.create_tables(cursor)
    db_builder.create_triggers(cursor)
    db_builder.insert_essential_data(cursor)
    db_builder.create_indexes(cursor)
    conn.commit()

    bridge_sql = json.loads(BRIDGE_MIGRATION_PATH.read_text())["sql_up"]
    conn.executescript(bridge_sql)
    conn.commit()

    try:
        yield conn
    finally:
        conn.close()


def insert_account(conn, *, name="Primary Account"):
    cursor = conn.execute(
        "INSERT INTO accounts (name, currency_id, status) VALUES (?, ?, ?)",
        (name, 1, "open"),
    )
    conn.commit()
    return cursor.lastrowid


def insert_ticker(conn, *, ticker_id=1, status="closed", active_trades=0):
    conn.execute(
        """
        INSERT INTO tickers (id, symbol, name, status, active_trades)
        VALUES (?, ?, ?, ?, ?)
        """,
        (ticker_id, f"T{ticker_id:03d}", f"Ticker {ticker_id}", status, active_trades),
    )
    conn.commit()


def insert_trade_plan(
    conn,
    *,
    account_id,
    ticker_id,
    status="open",
    planned_amount=1000.0,
):
    conn.execute(
        """
        INSERT INTO trade_plans (trading_account_id, ticker_id, status, planned_amount)
        VALUES (?, ?, ?, ?)
        """,
        (account_id, ticker_id, status, planned_amount),
    )
    conn.commit()


def insert_trade(
    conn,
    *,
    account_id,
    ticker_id,
    status="open",
    investment_type="swing",
):
    cursor = conn.execute(
        """
        INSERT INTO trades (trading_account_id, ticker_id, status, investment_type)
        VALUES (?, ?, ?, ?)
        """,
        (account_id, ticker_id, status, investment_type),
    )
    conn.commit()
    return cursor.lastrowid


def get_ticker_state(conn, ticker_id):
    return conn.execute(
        "SELECT status, active_trades FROM tickers WHERE id = ?", (ticker_id,)
    ).fetchone()


def test_trade_plan_insert_updates_ticker_status(db_conn):
    account_id = insert_account(db_conn)
    insert_ticker(db_conn, ticker_id=1, status="closed", active_trades=0)

    insert_trade_plan(db_conn, account_id=account_id, ticker_id=1, status="open")

    ticker = get_ticker_state(db_conn, 1)
    assert ticker["status"] == "open"
    assert ticker["active_trades"] == 0


def test_trade_insert_closed_keeps_ticker_closed(db_conn):
    account_id = insert_account(db_conn)
    insert_ticker(db_conn, ticker_id=2, status="closed", active_trades=0)

    insert_trade(
        db_conn,
        account_id=account_id,
        ticker_id=2,
        status="closed",
        investment_type="swing",
    )

    ticker = get_ticker_state(db_conn, 2)
    assert ticker["status"] == "closed"
    assert ticker["active_trades"] == 0


def test_trade_and_plan_status_transitions_stay_consistent(db_conn):
    account_id = insert_account(db_conn)
    insert_ticker(db_conn, ticker_id=3, status="closed", active_trades=0)

    insert_trade_plan(db_conn, account_id=account_id, ticker_id=3, status="open")
    trade_id = insert_trade(
        db_conn,
        account_id=account_id,
        ticker_id=3,
        status="open",
    )

    ticker = get_ticker_state(db_conn, 3)
    assert ticker["status"] == "open"
    assert ticker["active_trades"] == 1

    db_conn.execute("UPDATE trades SET status = 'closed' WHERE id = ?", (trade_id,))
    db_conn.commit()

    ticker = get_ticker_state(db_conn, 3)
    assert ticker["status"] == "open"
    assert ticker["active_trades"] == 0

    db_conn.execute(
        "UPDATE trade_plans SET status = 'closed' WHERE ticker_id = ?", (3,)
    )
    db_conn.commit()

    ticker = get_ticker_state(db_conn, 3)
    assert ticker["status"] == "closed"
    assert ticker["active_trades"] == 0


def test_cancelled_ticker_is_not_modified_by_triggers(db_conn):
    account_id = insert_account(db_conn)
    insert_ticker(db_conn, ticker_id=4, status="cancelled", active_trades=0)

    insert_trade_plan(db_conn, account_id=account_id, ticker_id=4, status="open")
    insert_trade(
        db_conn,
        account_id=account_id,
        ticker_id=4,
        status="open",
    )

    ticker = get_ticker_state(db_conn, 4)
    assert ticker["status"] == "cancelled"
    assert ticker["active_trades"] == 0


def test_base_currency_cannot_be_modified(db_conn):
    with pytest.raises(sqlite3.IntegrityError) as excinfo:
        db_conn.execute(
            "UPDATE currencies SET name = 'Test' WHERE id = 1"
        )
    assert "Cannot update base currency record" in str(excinfo.value)


def test_last_account_is_protected_from_deletion(db_conn):
    account_id = insert_account(db_conn)

    with pytest.raises(sqlite3.IntegrityError) as excinfo:
        db_conn.execute("DELETE FROM accounts WHERE id = ?", (account_id,))
    assert "Cannot delete the last account" in str(excinfo.value)


def test_account_deletion_allowed_when_multiple_exist(db_conn):
    first_account = insert_account(db_conn, name="Primary Account")
    second_account = insert_account(db_conn, name="Secondary Account")

    db_conn.execute("DELETE FROM accounts WHERE id = ?", (second_account,))
    db_conn.commit()

    row = db_conn.execute(
        "SELECT COUNT(*) AS cnt FROM accounts WHERE id IN (?, ?)",
        (first_account, second_account),
    ).fetchone()
    assert row["cnt"] == 1


def test_entity_relation_bridge_redirects_writes(db_conn):
    db_conn.execute(
        "INSERT INTO entity_relation_types (relation_type) VALUES ('analysis')"
    )
    db_conn.commit()

    relation = db_conn.execute(
        "SELECT relation_type FROM entity_relation_types WHERE relation_type = 'analysis'"
    ).fetchone()
    assert relation is not None

    db_conn.execute(
        "UPDATE entity_relation_types SET relation_type = 'analysis_updated' "
        "WHERE relation_type = 'analysis'"
    )
    db_conn.commit()

    updated = db_conn.execute(
        "SELECT note_relation_type FROM note_relation_types "
        "WHERE note_relation_type = 'analysis_updated'"
    ).fetchone()
    assert updated is not None

    db_conn.execute(
        "DELETE FROM entity_relation_types WHERE relation_type = 'analysis_updated'"
    )
    db_conn.commit()

    base_row = db_conn.execute(
        "SELECT 1 FROM note_relation_types WHERE note_relation_type = 'analysis_updated'"
    ).fetchone()
    assert base_row is None



