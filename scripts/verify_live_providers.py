#!/usr/bin/env python3
"""
Live Provider Execution — Team 20
TEAM_10_TO_TEAM_20_EXTERNAL_DATA_LIVE_PROVIDER_EXECUTION_MANDATE
- Yahoo + Alpha LIVE — טיקרים מ־market_data.tickers בלבד
- Confirms UA Rotation (Yahoo), RateLimitQueue (Alpha 12.5s)
"""

import asyncio
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

_project = Path(__file__).parent.parent
env_file = _project / "api" / ".env"
DATABASE_URL = None
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                val = v.strip().strip("'\"").strip()
                os.environ.setdefault(k.strip(), val)
                if k.strip() == "DATABASE_URL":
                    DATABASE_URL = val
if not DATABASE_URL:
    DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and "postgresql+asyncpg" in str(DATABASE_URL):
    DATABASE_URL = str(DATABASE_URL).replace("postgresql+asyncpg://", "postgresql://")

sys.path.insert(0, str(_project))

OUTPUT_LINES = []


def log(msg: str):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{ts}] {msg}"
    print(line)
    OUTPUT_LINES.append(line)


def load_tickers_from_db():
    """טיקרים מ־market_data.tickers — מקור יחיד."""
    if not DATABASE_URL or "postgresql" not in str(DATABASE_URL):
        return []
    import psycopg2
    from psycopg2.extras import RealDictCursor
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT id, symbol FROM market_data.tickers
            WHERE (deleted_at IS NULL) AND is_active = true
            ORDER BY symbol LIMIT 5
        """)
        return [r["symbol"] for r in cur.fetchall()]
    finally:
        conn.close()


async def run():
    from api.integrations.market_data.providers.yahoo_provider import YahooProvider, _YAHOO_USER_AGENTS, _next_user_agent
    from api.integrations.market_data.providers.alpha_provider import AlphaProvider, ALPHA_RATE_LIMIT_SECONDS

    log("=== Live Provider Execution — Team 20 ===")
    log("")

    tickers = load_tickers_from_db()
    if not tickers:
        log("⚠️ No tickers in market_data.tickers. Run: python3 scripts/seed_market_data_tickers.py")
        log("")
        return OUTPUT_LINES

    log(f"Tickers from DB: {', '.join(tickers)}")
    log("")

    # UA Rotation
    log("1. UA Rotation (Yahoo guardrail)")
    log(f"   UA pool size: {len(_YAHOO_USER_AGENTS)}")
    ua0 = _next_user_agent()
    ua1 = _next_user_agent()
    log(f"   UA[0] prefix: {ua0[:50]}...")
    log(f"   UA[1] prefix: {ua1[:50]}...")
    log("")

    # RateLimitQueue
    log("2. RateLimitQueue (Alpha guardrail)")
    log(f"   ALPHA_RATE_LIMIT_SECONDS: {ALPHA_RATE_LIMIT_SECONDS}")
    log("")

    # Yahoo LIVE
    log("3. Yahoo LIVE — ticker prices")
    yahoo = YahooProvider(mode="LIVE")
    for symbol in tickers:
        try:
            pr = await yahoo.get_ticker_price(symbol)
            if pr and pr.price:
                log(f"   {symbol}: price={pr.price}, provider={pr.provider}, as_of={pr.as_of}")
            else:
                log(f"   {symbol}: no data")
        except Exception as e:
            log(f"   {symbol}: ERROR — {type(e).__name__}: {e}")
    log("")

    # Alpha LIVE (with rate limit — 12.5s between calls)
    log("4. Alpha Vantage LIVE — ticker prices (RateLimitQueue 12.5s)")
    alpha = AlphaProvider(mode="LIVE")
    for symbol in tickers:
        try:
            pr = await alpha.get_ticker_price(symbol)
            if pr and pr.price:
                log(f"   {symbol}: price={pr.price}, market_cap={pr.market_cap}, provider={pr.provider}, as_of={pr.as_of}")
            else:
                log(f"   {symbol}: no data")
        except Exception as e:
            log(f"   {symbol}: ERROR — {type(e).__name__}: {e}")
    log("")

    log("=== Execution complete ===")
    return OUTPUT_LINES


def main():
    lines = asyncio.run(run())
    evidence_path = _project / "_COMMUNICATION" / "team_20" / "TEAM_20_EXTERNAL_DATA_LIVE_PROVIDER_EVIDENCE.md"
    evidence_path.parent.mkdir(parents=True, exist_ok=True)
    with open(evidence_path, "w", encoding="utf-8") as f:
        f.write("# Team 20 — External Data Live Provider Evidence\n\n")
        f.write("**id:** TEAM_20_EXTERNAL_DATA_LIVE_PROVIDER_EVIDENCE  \n")
        f.write("**date:** " + datetime.now(timezone.utc).strftime("%Y-%m-%d") + "  \n")
        f.write("**מקור:** TEAM_10_TO_TEAM_20_EXTERNAL_DATA_LIVE_PROVIDER_EXECUTION_MANDATE\n\n---\n\n")
        f.write("## Command output\n\n```\n")
        f.write("\n".join(lines))
        f.write("\n```\n\n---\n\n**log_entry | TEAM_20 | EXTERNAL_DATA_LIVE_PROVIDER_EVIDENCE | " +
                datetime.now(timezone.utc).strftime("%Y-%m-%d") + "**\n")
    print(f"\n✅ Evidence written to {evidence_path}")
    sys.exit(0)


if __name__ == "__main__":
    main()
