# Team 60: Evidence — EOD Sync (exchange_rates)

**id:** `TEAM_60_EOD_SYNC_EVIDENCE_LOG`  
**מקור:** Spy conditional approval; MARKET_DATA_PIPE_SPEC §5  
**date:** 2026-02-13

---

## 1. הרצה — PASS

```
🔄 EOD sync — exchange_rates
✅ Upserted 5 rates to market_data.exchange_rates
```

**סקריפט:** `scripts/sync_exchange_rates_eod.py`  
**Make target:** `make sync-eod`  
**Exit code:** 0

---

## 2. אימות last_sync_time

```sql
SELECT from_currency, to_currency, conversion_rate, last_sync_time 
FROM market_data.exchange_rates ORDER BY from_currency, to_currency;
```

| from_currency | to_currency | conversion_rate | last_sync_time |
|---------------|-------------|-----------------|----------------|
| EUR | ILS | 3.63550000 | 2026-02-13 (UTC) |
| EUR | USD | 1.18740000 | 2026-02-13 (UTC) |
| ILS | USD | 0.32661000 | 2026-02-13 (UTC) |
| USD | EUR | 0.84218000 | 2026-02-13 (UTC) |
| USD | ILS | 3.06170000 | 2026-02-13 (UTC) |

**Scope מטבעות:** USD, EUR, ILS (ראשוני — מכוון).

---

## 3. דיוק — NUMERIC(20,8)

- הסקריפט משתמש ב־`Decimal.quantize` (8 מקומות) — תואם SSOT.
- אין שימוש ב־float לשמירה.

---

**log_entry | TEAM_60 | EOD_SYNC_EVIDENCE | PASS | 2026-02-13**
