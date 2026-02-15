# Team 10 — P3-003 Blueprint Scope + Drift (מטריצה ותיעוד)

**id:** TEAM_10_P3_003_BLUEPRINT_SCOPE_AND_DRIFT_MATRIX  
**from:** Team 10 (The Gateway)  
**date:** 2026-02-15  
**re:** רשימת המשימות המרכזית — סגירת P3-003  
**מקור:** TEAM_10_TO_TEAM_90_ROADMAP_V2_1_RESPONSE_AND_STAGE1_PLAN.md

---

## 1. מטריצת Blueprint ↔ Roadmap v2.1

**מקורות:** `documentation/01-ARCHITECTURE/TT2_OFFICIAL_PAGE_TRACKER.md`, `ui/public/routes.json`, `_COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md`.

### IN SCOPE (Roadmap v2.1 — Batches 3–4, מאושרים ליישור נוכחי)

| עמוד / Route | מזהה | סטטוס Page Tracker | הערה |
|--------------|------|---------------------|------|
| D15.* (Login, Register, Reset, Index, Profile) | D15.L/R/P/I/V | 5. APPROVED / 4. FIDELITY | Auth + דאשבורד + פרופיל |
| D16 trading_accounts | D16 | 4. FIDELITY — Batch 2 CLOSED | חשבונות מסחר |
| D18 brokers_fees | D18 | 4. FIDELITY — Batch 2 CLOSED | עמלות ברוקרים |
| D21 cash_flows | D21 | 4. FIDELITY — Batch 2 CLOSED | תזרימי מזומנים |
| D22 tickers | D22 | 3. IN PROGRESS | ניהול טיקרים — Batch 3 TICKERS_MGR |
| D23 data_dashboard | D23 | 1. DRAFT | דשבורד נתונים — Batch 3 |
| user_tickers | data.user_tickers | — | Batch 3 USER_TICKERS |
| alerts, notes | data.alerts, data.notes | — | Batch 3 ALERTS & NOTES |
| executions | data.executions | — | Batch 4 EXECUTIONS & IMPORT |
| preferences | settings.preferences | — | Batch 3 D15_SETTINGS |

### OUT OF SCOPE ל־Roadmap v2.1 (Batches 3–4) — טיפול Drift

עמודים שקיימים ב־routes / Blueprint אך **לא** כלולים ב־Batches 3–4 של Roadmap v2.1 — מסומנים **OUT OF SCOPE** ליישור נוכחי (לא חלק מסגירת P3-003/Batch 3–4).

| עמוד / אזור | סטטוס | הערה |
|-------------|--------|------|
| research.* (strategy_analysis, trades_history, portfolio_state) | **OUT OF SCOPE** | Batch 5–6 (תובנות/ניתוח) — יטופלו בשלב מאוחר |
| planning.* (trade_plans) | **OUT OF SCOPE** | Batch 5 — יטופל בשלב מאוחר |
| tracking.* (watch_lists, ticker_dashboard, trading_journal) | **OUT OF SCOPE** | לא מפורש ב־Batches 3–4 — ממתין להחלטת Roadmap |
| management.system_management, design_system | **OUT OF SCOPE** | ניהול מערכת/עיצוב — לא חלק מ־Batch 3–4 |
| settings.data_import, tag_management | **OUT OF SCOPE** | לא מפורשים ב־Roadmap v2.1 Batches 3–4 — ממתין להחלטה |

**החלטה:** עמודים אלה **לא** נדרשים לסגירת P3-003 או ל־Kickoff Batch 3–4. אם ייכללו בעתיד — החלטה רשמית (אדריכל / G-Lead) ותיעוד ב-SSOT.

---

## 2. Evidence

- **Routes/Menu:** מעודכנים (P3-001, P3-002 — CLOSED). `routes.json` תואם Page Tracker.
- **מטריצת Blueprint + Drift:** מתועדת במסמך זה — IN SCOPE / OUT OF SCOPE ברור.

---

## 3. סגירה

**P3-003** — מסומן **CLOSED** ברשימה המרכזית עם תיעוד זה.  
קריטריוני קבלה: Evidence (routes/menu), מטריצת Blueprint + טיפול Drift מתועד — **מתקיים**.

---

**log_entry | TEAM_10 | P3_003_BLUEPRINT_SCOPE_DRIFT_CLOSED | 2026-02-15**
