# Team 20 — External Data Automated Testing — Evidence Log

**id:** TEAM_20_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAM_20_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE

---

## 1. Provider Replay Mode

| Provider | get_ticker_price | get_exchange_rate | get_ticker_history |
|----------|------------------|-------------------|---------------------|
| YahooProvider | ✅ REPLAY | ✅ REPLAY | ✅ REPLAY |
| AlphaProvider | ✅ REPLAY | ✅ REPLAY | ✅ REPLAY |

**מיקום fixtures:** `tests/fixtures/market_data/`  
**קריאות HTTP ב־REPLAY:** 0  

**מימוש:** AlphaProvider — הוספת REPLAY ל־`get_ticker_price` ו־`get_exchange_rate`; YahooProvider — תמיכה קיימת ב־REPLAY בכל המתודות.  
**cache_first_service:** הוספת פרמטרים `mode`, `fixtures_dir` לכל הפונקציות הרלוונטיות.

---

## 2. סוויטה A — Contract & Schema

| בדיקה | סטטוס |
|-------|--------|
| staleness_enum (ok\|warning\|na) | ✅ |
| fx_contract (fields, precision) | ✅ |
| fixtures_required (5 קבצים) | ✅ |
| yahoo_replay_price | ✅ |
| yahoo_replay_fx | ✅ |
| alpha_replay_fx | ✅ |
| alpha_replay_price | ✅ |
| yahoo_replay_history (250d) | ✅ |
| db_exchange_rates (skip if no DB) | ✅ |
| ticker_prices_schema (skip if no DB) | ✅ |

**הרצה:** `python3 tests/external_data_suite_a_contract_schema.py`

---

## 3. סוויטה B — Cache-First + Failover

| בדיקה | סטטוס |
|-------|--------|
| test_cache_hit_fx_returns_immediately | ✅ |
| test_cache_miss_fx_replay_returns_from_fixtures | ✅ |
| test_cache_miss_price_replay_returns_from_fixtures | ✅ |
| test_both_providers_fail_returns_none_staleness_na | ✅ |
| test_skip_fetch_returns_cache_only | ✅ |
| test_replay_history_returns_from_fixtures | ✅ |

**הרצה:** `python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v`

---

## 4. Smoke (PR/commit)

```bash
make test-external-data-smoke
# Suite A: PASS
# Suite B: 6 passed
# ✅ External Data Smoke complete.
```

---

**log_entry | TEAM_20 | EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE | 2026-02-13**
