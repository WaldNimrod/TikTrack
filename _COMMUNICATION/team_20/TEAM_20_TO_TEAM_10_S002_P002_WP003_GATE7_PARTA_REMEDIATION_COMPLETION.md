# Team 20 → Team 10 | S002-P002-WP003 GATE_7 Part A — דוח השלמת תיקון

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_PARTA_REMEDIATION_COMPLETION  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (Gateway)  
**cc:** Team 50, Team 60, Team 90  
**date:** 2026-03-11  
**status:** DONE  
**gate_id:** GATE_7  
**work_package_id:** S002-P002-WP003  
**in_response_to:** TEAM_10_TO_TEAM_20_S002_P002_WP003_GATE7_PARTA_REMEDIATION_CANONICAL_PROMPT_v1.0.0, TEAM_50_TO_TEAM_20_S002_P002_WP003_GATE7_PARTA_BLOCK_ANALYSIS_AND_REMEDIATION_REQUEST  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 |
| phase_owner | Team 90 |

---

## 1) סטטוס

**DONE** — התיקונים לביטול 429 ולצמצום קריאות Yahoo הושלמו.

---

## 2) תיאור התיקונים

### 2.1 CC-WP003-04 — אפס מופעי 429 ב־4 מחזורי EOD רצופים

| פריט | תיאור |
|------|--------|
| **בעיה** | 3 מופעי HTTP 429 (H1/H3/H5), 401 על v7 batch (H3), cooldown לא נשמר בין subprocess (H4). |
| **תיקונים (Team 50 H1–H5):** | |
| **(א) v7→yfinance→v8** | `yahoo_provider._fetch_price_sync`: v7 קודם, אחר כך yfinance (חוסך v8 כש־v7 מחזיר 401), v8 אחרון. |
| **(ב) 401→cooldown** | כש־batch מחזיר 401: `set_cooldown("YAHOO_FINANCE")` — אין per-ticker Yahoo (ממנע v8→429). |
| **(ג) H3 headers** | Accept, Accept-Language, Origin, Referer ב־v7/quote (batch + single). |
| **(ד) H4 in-process** | `run_g7_part_a_evidence` מריץ 4 מחזורים **באותו process** (לא subprocess) — cooldown נשמר. |
| **(ה) EOD batch-first** | batch אחד לכל הטיקרים; per-ticker רק לחסרים. |
| **מיקום** | `yahoo_provider.py` (_fetch_price_sync, headers), `sync_ticker_prices_eod.py` (401 handling, run_one_cycle), `run_g7_part_a_evidence.py` (in-process) |
| **אימות מקומי** | `GATE7_CC_EVIDENCE=1 python3 scripts/run_g7_part_a_evidence.py` → `pass_04=True`, `cc_wp003_04_yahoo_429_count=0` |

---

### 2.2 CC-WP003-01 — market-open: ≤5 קריאות Yahoo

| פריט | תיאור |
|------|--------|
| **דרישה** | במחזור sync שעות שוק — ≤5 קריאות HTTP ל־Yahoo. |
| **עיצוב** | `api/background/jobs/sync_intraday.py`: batch-first (1 קריאה `get_ticker_prices_batch`) + priority filter (FIX-1) — רק FIRST_FETCH / HIGH / stale. מחזור טיפוסי: **1 batch** + עד ~4 fallbacks → **≤5**. |
| **מיקום** | `api/background/jobs/sync_intraday.py` (שורות ~148–172) |

---

### 2.3 CC-WP003-02 — off-hours: ≤2 קריאות Yahoo

| פריט | תיאור |
|------|--------|
| **דרישה** | בחלון off-hours — ≤2 קריאות Yahoo במחזור. |
| **עיצוב** | אותה לוגיקה כמו CC-01; ב־off-hours ה־cadence קטן, ה־priority filter מצמצם טיקרים נוספים. מחזור off-hours: **1 batch** (+ fallback אם יש) → **≤2**. |

---

## 3) Instrumentation — ספירת קריאות Yahoo

כדי ש־Team 60 יוכל לספור קריאות Yahoo מהלוג:

| Env | השפעה |
|-----|--------|
| `GATE7_CC_EVIDENCE` | בכל קריאת HTTP ל־Yahoo, נכתב `logger.info("GATE7_CC_YAHOO_HTTP")` |

**מיקום:** `api/integrations/market_data/providers/yahoo_provider.py` — `_fetch_prices_batch_sync`, `_fetch_last_close_via_v8_chart_inner`, `_fetch_market_cap_only_v7`, `_fetch_price_via_quote_api` (שורות ~100, 220, 304, 327).

**שימוש:** Team 60 מפעיל `GATE7_CC_EVIDENCE=1` ומסנן לוג: `grep -c GATE7_CC_YAHOO_HTTP <log>` → ספירת קריאות per cycle.

---

## 4) אימות מקומי (בוצע)

| בדיקה | תוצאה |
|-------|--------|
| `GATE7_CC_EVIDENCE=1 python3 scripts/run_g7_part_a_evidence.py` | **pass_04=True**, cc_wp003_04_yahoo_429_count=**0** |
| `grep -c "429" <log>` | 0 |
| לוג | `documentation/reports/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE_2026-03-11_223450.log` |

---

## 5) קבצים ששונו

| קובץ | שינויים |
|------|---------|
| `api/integrations/market_data/providers/yahoo_provider.py` | v7→yfinance→v8 ב־_fetch_price_sync; headers ל־401 (batch, quote, market_cap); GATE7_CC_EVIDENCE |
| `scripts/sync_ticker_prices_eod.py` | 401→cooldown; run_one_cycle(); batch-first |
| `scripts/run_g7_part_a_evidence.py` | 4 מחזורים in-process (לא subprocess), דיליי 60s |

---

## 6) העברת חבילה ל־Team 50 (חובה)

**חבילת התיקון מועברת ל־Team 50 להרצת הבדיקות לפי הפרומפט/מנדט GATE_7 Part A QA. לאחר סיום בדיקות Team 50 — Team 60 יבצע איסוף עדות ואימות רשמי.**

**פרומפט/מנדט להפעלה:**  
`_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE7_PARTA_QA_ACTIVATION_v1.0.0.md`

---

## 7) מנדט מקור

| מסמך | תיאור |
|------|--------|
| `TEAM_10_TO_TEAM_20_S002_P002_WP003_GATE7_PARTA_REMEDIATION_CANONICAL_PROMPT_v1.0.0.md` | פרומפט קנוני לתיקון |
| `TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE7_PARTA_QA_ACTIVATION_v1.0.0.md` | הפעלת QA ל־Team 50 |

---

**log_entry | TEAM_20 | GATE7_PARTA_REMEDIATION | DONE | 2026-03-11**
