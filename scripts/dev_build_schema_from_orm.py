#!/usr/bin/env python3
"""dev_build_schema_from_orm.py — Cursor Cloud dev bootstrap helper (NOT canonical).

Builds a *functional* TikTrack dev database schema directly from the SQLAlchemy
ORM models via ``Base.metadata.create_all``.

IMPORTANT — this is a pragmatic Cursor-Cloud-dev convenience, not the canonical
provisioning path. In local/staging/production the schema is applied by an
operator running ``scripts/migrations/*.sql`` with ``psql`` (see
``scripts/migrations/README.md``). The app itself never calls ``create_all``,
and the ORM ``server_default``/``postgresql_where`` values are inert metadata
that only affect this ``create_all`` path (the hand-written migration SQL is
correct). This script is used only because the Cloud VM needs a from-scratch DB
and there is no single clean full DDL / migration runner in the repo.

Prerequisites:
  1. PostgreSQL running and an empty ``tiktrack`` database created.
  2. ``scripts/dev_bootstrap_schema.sql`` applied first (extensions, schemas,
     ENUM types, and the model-less ``external_data_providers`` table).
  3. ``DATABASE_URL`` set in ``api/.env`` (postgresql://...).

Run from the repo root with the backend venv active:
  source api/venv/bin/activate
  PYTHONPATH="$PWD/api:$PWD" python3 scripts/dev_build_schema_from_orm.py

Notes:
  * Two known ORM-rendering issues are worked around at runtime only (no model
    files are modified): raw-SQL server_default strings are wrapped in text(),
    and standalone (partial) indexes are skipped. PRIMARY KEY and UNIQUE
    constraints are preserved.
"""
import importlib
import os
import sys
from pathlib import Path

from sqlalchemy import create_engine, text, Table
from sqlalchemy.sql.schema import DefaultClause

# All model modules that declare a __tablename__ (not auto-imported by
# api.models.__init__).
MODEL_MODULES = [
    "alerts", "brokers_fees", "cash_flows", "exchange_rates", "feature_flags",
    "identity", "market_reference", "notes", "notification", "ticker_prices",
    "ticker_prices_intraday", "tickers", "tokens", "trade_plans", "trades",
    "trading_accounts", "user_tickers",
]


def read_database_url() -> str:
    env_file = Path(__file__).resolve().parent.parent / "api" / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if line.startswith("DATABASE_URL=") and not line.startswith("#"):
                url = line.split("=", 1)[1].strip().strip('"').strip("'")
                return url.replace("postgresql+asyncpg://", "postgresql://")
    url = os.environ.get("DATABASE_URL")
    if url:
        return url.replace("postgresql+asyncpg://", "postgresql://")
    sys.exit("DATABASE_URL not found in api/.env or environment")


def main() -> None:
    for mod in MODEL_MODULES:
        importlib.import_module(f"api.models.{mod}")

    from api.models.base import Base

    engine = create_engine(read_database_url())

    # Reflect the pre-created model-less table so its FK targets resolve.
    Table("external_data_providers", Base.metadata,
          autoload_with=engine, schema="market_data")

    # Some models pass raw SQL expressions (e.g. "'{}'::JSONB") as plain-string
    # server_defaults; wrap them in text() so create_all emits raw SQL instead
    # of quote-escaping them.
    for tbl in Base.metadata.tables.values():
        for col in tbl.columns:
            arg = getattr(col.server_default, "arg", None)
            if isinstance(arg, str) and ("::" in arg or arg.strip().startswith("'")):
                col.server_default = DefaultClause(text(arg))

    # A few models declare partial indexes with string postgresql_where that
    # render invalid SQL. Indexes are non-essential for a dev DB; PK + UNIQUE
    # constraints live in table.constraints and are preserved.
    for tbl in Base.metadata.tables.values():
        tbl.indexes.clear()

    Base.metadata.create_all(engine, checkfirst=True)

    with engine.connect() as conn:
        for schema in ("user_data", "market_data", "admin_data"):
            rows = conn.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema=:s ORDER BY table_name"
            ), {"s": schema}).fetchall()
            print(f"[{schema}] {len(rows)} tables:", [r[0] for r in rows])


if __name__ == "__main__":
    main()
