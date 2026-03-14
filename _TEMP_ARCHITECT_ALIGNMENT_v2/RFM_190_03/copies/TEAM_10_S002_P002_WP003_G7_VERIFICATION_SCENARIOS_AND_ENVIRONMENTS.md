# Team 10 | S002-P002-WP003 — תרחישי אימות וסביבות הרצה

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P002_WP003_G7_VERIFICATION_SCENARIOS_AND_ENVIRONMENTS  
**from:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-11  
**status:** REFERENCE  
**sources:** Team 90 Human Scenarios v1.1.0, Team 50/60 Consolidated Verdict, Runtime Protocol  

---

## 1) תרחישים הדורשים בדיקה — סקירה

| # | תרחיש | סוג | סביבה | תיאור קצר |
|---|--------|-----|--------|-------------|
| **AUTO-WP003-01** | UI: Tickers — 5 שדות מחיר | אוטומציה/UI | דפדפן | current_price, last_close, price_source, price_as_of_utc, currency |
| **AUTO-WP003-02** | UI: Tickers vs My Tickers | אוטומציה/UI | דפדפן | עקביות source/as-of/current-vs-last |
| **AUTO-WP003-03** | Runtime: Yahoo market-open ≤ 5 | Runtime | Backend + Scheduler | ספירת קריאות HTTP ל-Yahoo במהלך market-open |
| **AUTO-WP003-04** | Runtime: Yahoo off-hours ≤ 2 | Runtime | Backend + Scheduler | ספירת קריאות HTTP ל-Yahoo ב-off-hours |
| **AUTO-WP003-05** | DB: market_cap ANAU.MI, BTC-USD, TEVA.TA | DB/Script | DB + EOD | אימות ב-DB — `verify_g7_prehuman_automation.py` |
| **AUTO-WP003-06** | Runtime: אפס 429 ב-4 מחזורים | Runtime | Backend + Scheduler | grep לוגים — 0 מופעי 429 |
| **AUTO-WP003-07** | UI: 4 תנאים (CC-WP003) | UI | דפדפן | status+value+timestamp (D22 qualify) |
| **AUTO-WP003-08** | Regression FIX-1..4 | API/UI | Backend + דפדפן | smoke — 0 SEVERE |
| **S7-WP003-01** | Price transparency columns | Human | דפדפן | Tickers — QQQ, SPY, TEVA.TA — 5 שדות |
| **S7-WP003-02** | Current vs last close | Human | דפדפן | Details TEVA.TA — שני ערכים ברורים |
| **S7-WP003-03** | Market cap readiness | Human | דפדפן | Details ANAU.MI, BTC-USD, TEVA.TA — market_cap לא ריק |
| **S7-WP003-04** | Runtime panel (CC-WP003-01..04) | Human | דפדפן | פאנל 4 תנאים — status, value, timestamp |
| **S7-WP003-05** | Off-hours/staleness | Human | דפדפן | אינדיקטור freshness + שעון עדכון |
| **S7-WP003-06** | Cross-view consistency (P1) | Human | דפדפן | Tickers vs My Tickers — אין סתירה |

---

## 2) סביבה לכל תרחיש — מפורט

### 2.1) סביבת דפדפן (UI / Human)

| דרישה | ערך |
|-------|-----|
| **סביבה** | dev / staging — האפליקציה רצה (Frontend + Backend) |
| **גישה** | משתמש Admin מחובר |
| **דפים** | Tickers management, My Tickers, (אופציונלי) Runtime confirmation panel |
| **הפעלה** | `make run` / `scripts/start-frontend.sh` + Backend |
| **טיקרים** | ANAU.MI, BTC-USD, TEVA.TA, QQQ, SPY זמינים |

**תרחישים:** AUTO-WP003-01, 02, 07, 08 | S7-WP003-01 עד 06.

---

### 2.2) סביבת DB + EOD (AUTO-WP003-05)

| דרישה | ערך |
|-------|-----|
| **סביבה** | DB (PostgreSQL) — `api/.env` עם DATABASE_URL |
| **פריסיס** | הרצת `make sync-ticker-prices` (Yahoo זמין — לא ב-cooldown) |
| **הרצה** | `python3 scripts/verify_g7_prehuman_automation.py` |
| **תוצאה מצופה** | `AUTO-WP003-05: PASS — market_cap non-null for 3/3` |

---

### 2.3) סביבת Runtime (AUTO-WP003-03, 04, 06)

| דרישה | ערך |
|-------|-----|
| **סביבה** | Backend + Scheduler (APScheduler) — intraday + EOD jobs |
| **AUTO-WP003-03** | להריץ intraday ב-**market-open** — לספור HTTP ל-Yahoo (≤ 5) |
| **AUTO-WP003-04** | להריץ intraday ב-**off-hours** — לספור HTTP ל-Yahoo (≤ 2) |
| **AUTO-WP003-06** | 4 מחזורי sync (~1 שעה) — grep לוגים ל-`429` — צפוי 0 |
| **איסוף evidence** | לוגי backend/scheduler; או log line זמני `YAHOO_HTTP_CALL` |

---

## 3) סדר הרצה מומלץ

1. **DB + EOD:** `make sync-ticker-prices` → `verify_g7_prehuman_automation.py` (AUTO-WP003-05).
2. **UI:** פתיחת Tickers, My Tickers בדפדפן — בדיקת 5 שדות, details, staleness (AUTO-WP003-01, 02, 07, 08 + S7-WP003-*).
3. **Runtime:** (אופציונלי — design PASS) — market-open/off-hours + 4 cycles ל-AUTO-WP003-03, 04, 06.

---

## 4) מסמכי מקור

| מסמך | נתיב |
|------|------|
| Human Scenarios | `_COMMUNICATION/team_90/TEAM_90_TO_NIMROD_S002_P002_WP003_GATE7_HUMAN_APPROVAL_SCENARIOS_v1.1.0.md` |
| Coverage Matrix | `_COMMUNICATION/team_90/TEAM_90_TO_NIMROD_S002_P002_WP003_GATE7_HUMAN_APPROVAL_COVERAGE_MATRIX_v1.1.0.md` |
| Consolidated Verdict | `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_90_S002_P002_WP003_G7_PREHUMAN_AUTOMATION_CONSOLIDATED_VERDICT_v1.0.0.md` |
| Runtime Protocol | `_COMMUNICATION/team_90/TEAM_90_S002_P002_WP003_GATE7_RUNTIME_CONFIRMATION_PROTOCOL_v1.2.0.md` |
| Verify Script | `scripts/verify_g7_prehuman_automation.py` |

---

**log_entry | TEAM_10 | G7_VERIFICATION_SCENARIOS_ENVIRONMENTS | REFERENCE | 2026-03-11**
