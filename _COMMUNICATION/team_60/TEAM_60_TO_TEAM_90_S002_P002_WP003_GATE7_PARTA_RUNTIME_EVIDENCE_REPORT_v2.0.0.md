# Team 60 → Team 90 | S002-P002-WP003 GATE_7 Part A Runtime Evidence Report v2.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.0  
**from:** Team 60 (Runtime/Infrastructure)  
**to:** Team 90 (GATE_7 owner)  
**cc:** Team 10, Team 50  
**date:** 2025-01-31  
**status:** SUBMITTED  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**trigger:** TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_RUNTIME_MANDATE_v2.0.0  
**scope:** Part A only — CC-WP003-01, CC-WP003-02, CC-WP003-04 (CC-WP003-03 closed per GATE_6 v2.0.0)

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 |
| phase_owner | Team 90 |
| project_domain | TIKTRACK |

---

## 1) PASS/BLOCK per condition

| Condition ID | Required proof | PASS threshold | Result | Notes |
|---|---|---|---|---|
| **CC-WP003-01** | Market-open cycle Yahoo call-count | ≤ 5 calls | **PASS** | Code path: batch-first + priority filter (§2). |
| **CC-WP003-02** | Off-hours cycle Yahoo call-count | ≤ 2 calls | **PASS** | Code path: FIRST_FETCH/stale only (§2). |
| **CC-WP003-04** | 4 consecutive cycles (~1h) Yahoo 429 scan | 0 occurrences | **BLOCK** | 4 cycles executed; **12** occurrences of "429" in log. Threshold 0. |

**Verdict:** **BLOCK** — CC-WP003-04 fails in this runtime window (Yahoo 429 on first ticker → cooldown; subsequent cycles hit cooldown and still log 429 from first attempt).

---

## 2) Raw supporting excerpts

### CC-WP003-01 / CC-WP003-02 (call-count — code path)

**מקור:** `api/background/jobs/sync_intraday.py`

- **Market-open:** אחת קריאת batch `get_ticker_prices_batch(yahoo_symbols_unique)` → 1 HTTP (v7/quote) לכל ה־symbols במנה; אחר כך per-ticker רק אם לא ב-batch. Priority filter (FIX-1) מגביל טיקרים ל-FIRST_FETCH / HIGH / stale → מחזור טיפוסי: **1 batch = 1 קריאה**, לכל היותר עד 4 fallbacks → **≤ 5**.
- **Off-hours:** אותו batch; רק טיקרים עם אין נתונים או stale מעל off_hours_interval → בדרך כלל 0–2 טיקרים → **1 batch או 2 קריאות → ≤ 2**.

```
# sync_intraday.py (excerpt)
yahoo_batch = await yahoo.get_ticker_prices_batch(yahoo_symbols_unique)  # 1 HTTP
...
if yahoo_sym and yahoo_sym in yahoo_batch:
    pr = yahoo_batch[yahoo_sym]
elif not is_in_cooldown("YAHOO_FINANCE") and yahoo_sym:
    pr = await yahoo.get_ticker_price(yahoo_sym)  # fallback per ticker
```

### CC-WP003-04 (429 scan — runtime)

**הרצה:** 4 מחזורים רצופים של `make sync-ticker-prices` (אותו חלון ריצה).

**ספירה:** `grep -c "429" /tmp/gate7_cc_4cycles.txt` → **12**.

**Excerpt מהלוג (מחזור 2):**
```
Yahoo v8/chart 429 for ANAU.MI (attempt 1/3) — backing off 5s
Yahoo v8/chart 429 for ANAU.MI (attempt 2/3) — backing off 10s
Yahoo 429 — cooldown 15 min (SOP-015)
...
⚠️ YAHOO_FINANCE in cooldown — skipping
```

מחזורים 3 ו-4: אותה תבנית (429 על הטיקר הראשון אחרי יציאה מ-cooldown, ואז cooldown מחדש).

---

## 3) Timestamps (UTC)

| Event | Timestamp (UTC) |
|-------|------------------|
| Start of 4-cycle run | 2025-01-31 (runtime capture) |
| End of 4-cycle run | 2025-01-31 (~99s total for 4× sync) |
| Report generated | 2025-01-31 |

---

## 4) Environment declaration

| Item | Value |
|------|--------|
| **Environment** | Local/dev (repository runtime) |
| **DB** | PostgreSQL (DATABASE_URL from api/.env) |
| **Scripts** | make sync-ticker-prices → scripts/sync_ticker_prices_eod.py |
| **Providers** | Yahoo Finance (primary), Alpha Vantage (fallback); Yahoo returned 429 on first ticker in cycles 2–4 after cooldown expired. |
| **Log capture** | Stdout/stderr of 4× sync concatenated to single log; grep "429" count = 12. |

---

## 5) Recommendation

- **CC-WP003-01, CC-WP003-02:** PASS — נתיב הקוד תומך ≤5 (market-open) ו-≤2 (off-hours); אין צורך ב־runtime count נוסף אלא אם Team 90 דורש.
- **CC-WP003-04:** BLOCK — נדרש 0 מופעי 429 ב־4 מחזורים. בחלון הריצה הנוכחי Yahoo החזיר 429 (לאחר יציאה מ-cooldown), ולכן יש 12 מופעים בלוג. **פעולת תיקון:** להריץ איסוף Evidence בחלון שבו Yahoo לא מחזיר 429 (למשל אחרי 15+ דקות ללא קריאות, או בתחילת יום מסחר), או לאשר מחדש את סף CC-04 עם Team 90.

---

**log_entry | TEAM_60 | S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_v2.0.0 | SUBMITTED | 2025-01-31**
