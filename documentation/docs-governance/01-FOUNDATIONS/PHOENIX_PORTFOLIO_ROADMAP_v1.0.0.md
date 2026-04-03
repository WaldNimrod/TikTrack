# PHOENIX_PORTFOLIO_ROADMAP_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PHOENIX_PORTFOLIO_ROADMAP  
**version:** 1.0.0  
**owner:** Team 100 / Team 00 (architectural); maintained by Team 170 per consolidation  
**date:** 2026-03-21 (program closure mirror S003-P012 — Team 170)  
**directive:** TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0  
**מפת דרכים אחת:** אין כפילות. מסמך נרטיב/חבילות ישן הועבר לארכיון: `archive/2026-02-23_roadmap_and_batch_superseded/`.

---

## Boundary

This document is the **single canonical roadmap** for Portfolio (Stage-level only). **Operational state** (which stage is active, current gate) is **only** in WSM `CURRENT_OPERATIONAL_STATE`. No duplicate runtime state here.

---

## Schema (Stage-level only)

| Field | Description |
|-------|-------------|
| stage_id | S{NNN} (e.g. S001) |
| stage_name | Short label |
| planned_scope | Text scope |
| status | ACTIVE \| PLANNED \| COMPLETED \| HOLD |

---

## Stages (catalog)

סדר השורות = סדר התצוגה (היררכיה ראשית). שמות קנוניים: שלב 1, שלב 2, … חבילות העבודה הקיימות שתיהן תחת שלב 1 (S001).



| stage_id | stage_name | planned_scope | status |
| --- | --- | --- | --- |
| S001 | שלב 1 — Foundations Sealed | חיתום יסודות; Stage 1 | COMPLETED |
| S002 | שלב 2 — השלב הפעיל | מה שפתוח משלב 1 + הכנה לשלב 3 + MCP-QA Hybrid Transition packaging under S002-P002 | ACTIVE |
| S003 | שלב 3 — Essential Data | שכבת נתונים יסודית | PLANNED |
| S004 | שלב 4 — Financial Execution | המעגל הפיננסי | PLANNED |
| S005 | שלב 5 — Trades/Plans | ישויות מורכבות | PLANNED |
| S006 | שלב 6 — Advanced Analytics | תובנות וניתוח | PLANNED |



**Note:** S001 = שלב 1 (סגור). S002 = שלב 2 — השלב הפעיל מעכשיו. חלוקת עמודים/מודולים: STAGES_PAGES_AND_MODULES_REFERENCE.md.

---

## Stage details (pages, server modules, client components)

חובה: בכל תיאור שלב — רשימת העמודים המדויקת, מודולי השרת והקומפוננטות (לקוח) הכלולים/נדרשים לשלב.

| stage_id | pages | server_modules | client_components |
| --- | --- | --- | --- |
| S001 | D15.L, D15.R, D15.P, D15.I, D15.V, D16, D18, D21, D34, D35 | Atoms (Core), Molecules (Repositories), Organisms (Identity, Financial) | tt-container, tt-section, tt-section-row, phoenix-base, phoenix-components, phoenix-header |
| S002 | D22, D23 | Atoms (Core), Molecules (Repositories), Organisms (Identity, Financial, Tickers_Mgr) | tt-container, tt-section, tt-section-row, phoenix-base, phoenix-components, phoenix-header |
| S003 | D33, D39, D40, D41, D26 | Atoms (Core), Molecules (Repositories), Organisms (Identity, Financial, Tickers_Mgr, Preferences, SystemMgmt, UserMgmt, WatchLists) | tt-container, tt-section, tt-section-row, phoenix-base, phoenix-components, phoenix-header |
| S004 | D36, D37, S004-P007 (Indicators Infrastructure) | Atoms (Core), Molecules (Repositories), Organisms (Identity, Financial, Executions, CashFlowParser, IndicatorsInfra) | tt-container, tt-section, tt-section-row, phoenix-base, phoenix-components, phoenix-header |
| S005 | D24, D25, D27, D28, D29, D31, D38, D26-Phase2 | Atoms (Core), Molecules (Repositories), Organisms (Identity, Financial, TradePlans, Trades, TradeHistory, TagRegistry, WatchListsEnhancement) | tt-container, tt-section, tt-section-row, phoenix-base, phoenix-components, phoenix-header |
| S006 | D30, D32 | Atoms (Core), Molecules (Repositories), Organisms (Analytics, Strategy, PortfolioState) | tt-container, tt-section, tt-section-row, phoenix-base, phoenix-components, phoenix-header |

---

## נרטיב וסקופ (לפי שלבים)

**טקסונומיה:** רק שלבים (Stages) — אין שימוש במונח "באץ'". **דשבורדים** (כולל דף הבית): כרגע עמוד placeholder בלבד; מימוש תוכן בשלבים מאוחרים.

### Prerequisites (תלויות תשתית)

חובה לנעול לפני פיתוח UI רלוונטי: FOREX_MARKET_SPEC, MARKET_DATA_PIPE, CASH_FLOW_PARSER.

### שלב 3 — שכבת נתונים יסודית (Essential Data)

S003 pages: D33 (user_tickers), D39 (preferences), D40 (system_management), D41 (user_management), D26 (watch_lists).
Note: D38 (tag_management) was in S003 but relocated to S005 per Amendment A1 (2026-03-02).

### שלב 4 — המעגל הפיננסי (Financial Execution)

EXECUTIONS & IMPORT CENTER (Cash Flows + Executions, IBKR + IBI via BaseConnector), plus S004-P007 Indicators Infrastructure.

### שלב 5 — ישויות מורכבות (Trades/Plans)

תוכניות טריידים, טריידים, דשבורד טיקר (D27 — תלוי בנתוני היסטוריה: eod_prices, history_250d), יומן מסחר והיסטוריית טרייד (D31), וניהול תגיות (D38).
בנוסף: D26-Phase2 (watch_lists enhancement) נפתח לאחר D29 GATE_8 PASS ומוסיף Position, P/L, P/L%, ATR(14) ו-flag_color filtering משופר.

### שלב 6 — תובנות וניתוח (Advanced Analytics)

ניתוח אסטרטגיות, מצב תיק; מימוש דשבורדים רמה 1.
D32 (portfolio_state) מחייב אפיון ארכיטקטוני ייעודי ומאושר Nimrod לפני פתיחת S006 GATE_0, כולל: daily_portfolio_snapshots job, סכימת snapshots, backfill, retention policy, וכללי chart granularity לפי טווח זמן.

### Agents_OS Evolution Lock (ADR-031)

- רצף קנוני נעול לפיתוח Agents_OS v2:
  - S002-P005: Writing Semantics Hardening (Stage A) + UI Optimization [WP001 TASK_CLOSED 2026-03-15] + Pipeline Governance PASS_WITH_ACTION [WP002 PLANNED — trigger: WP001 GATE_8].
  - S003-P007: Command Bridge Lite (Stage B, next AGENTS_OS package in Stage 3).
  - S004-P008: Mediated Reconciliation Engine (Stage C, independent Stage 4 package after existing AGENTS_OS Stage 4 programs).
- שיוך ותזמון מפורטים נשמרים ב-`PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`.
- חסימת desync ל-GATE_6 חלה על שני הדומיינים (AGENTS_OS + TIKTRACK), בכפוף לנעילת שרשרת חתימה קנונית.
- מקורות החלטה מלאים:
  - `_COMMUNICATION/_Architects_Decisions/Gimini 00 cloud/פסיקה אדריכלית_ סמנטיקת כתיבה ותוכנית אבולוציה Agents_OS v2.md`
  - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_00_ADR031_DECISION_LOCK_AND_SIGNER_CHAIN_PROPOSAL_v1.0.0.md`
  - `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_TEAM_170_ADR031_THREE_STAGE_ACTIVATION_PROMPT_v1.0.0.md`

### Program closure mirror — S003-P012 (Agents_OS)

| program_id | status | closed_date | closure_authority | closure_note |
|------------|--------|-------------|---------------------|--------------|
| S003-P012 | DOCUMENTATION_CLOSED | 2026-03-21 | Team 100 | WP001–WP005 all **GATE_5 FULL PASS**. Pipeline readiness certificate: **205 tests**. Registry + WSM sync: Team 170 per `TEAM_170_S003_P012_GOVERNANCE_CLOSURE_AND_ARCHIVE_MANDATE_v1.0.0.md`. |

### Tag Assignment Rollout (S004 onward)

Inline tag assignment נבנה יחד עם כל עמוד ישות החל מ-S004, ולא כרטרופיט מאוחר.
ישויות חובה לתמיכת tags: user_ticker, alert, trade, trade_plan, execution, cash_flow.
D38 (tag registry management) ב-S005 הוא ממשק ניהול רישום התגיות; ההשמה inline בישויות היא מסלול נפרד ומדורג לפי שלבים.

---

## Level-2 Task Lists (קישורים חובה)

| Level-2 list | Path | Final status |
|---|---|---|
| Registry (all Level-2 lists) | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md` | ACTIVE |
| Master Task List | `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` | ACTIVE |
| Completion Carryover List | `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md` | ACTIVE |

## Known Bugs Register (קישור חובה)

| Register | Path | Status |
|---|---|---|
| Known Bugs Register | `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` | ACTIVE |

---

## חלוקת עמודים לשלבים (סדר תצוגה)

מקור רשימת עמודים: **TT2_PAGES_SSOT_MASTER_LIST**. כל העמודים מופיעים בסדר הנכון לפי שלב.

| סדר | מזהה | Route | תיאור | stage_id |
|-----|------|--------|--------|----------|
| 1 | D15.L | login | כניסה | S001 |
| 2 | D15.R | register | הרשמה | S001 |
| 3 | D15.P | reset_password | שחזור סיסמה | S001 |
| 4 | D15.I | home | דשבורד בית (placeholder) | S001 |
| 5 | D15.V | profile | פרופיל משתמש | S001 |
| 6 | D16 | trading_accounts | חשבונות מסחר | S001 |
| 7 | D18 | brokers_fees | עמלות ברוקרים | S001 |
| 8 | D21 | cash_flows | תזרימי מזומנים | S001 |
| 9 | D34 | alerts | התראות | S001 |
| 10 | D35 | notes | הערות | S001 |
| 11 | D22 | tickers | ניהול טיקרים | S002 |
| 12 | D23 | data_dashboard | דשבורד נתונים (תבנית/placeholder) | S002 |
| 13 | D33 | user_tickers | הטיקרים שלי | S003 |
| 14 | D39 | preferences | העדפות | S003 |
| 15 | D36 | executions | ביצועים | S004 |
| 16 | D37 | data_import | ייבוא נתונים (dual mode: cash_flows + executions; IBKR + IBI; BaseConnector; archive + audit log) | S004 |
| 17 | D24 | trade_plans | תוכניות טריידים | S005 |
| 18 | D25 | ai_analysis | אנליזת AI (Prerequisite: S004-P007 Indicators Infrastructure GATE_8 PASS) | S005 |
| 19 | D26 | watch_lists | רשימות צפייה | S003 |
| 20 | D27 | ticker_dashboard | דשבורד טיקר | S005 |
| 21 | D28 | trading_journal | יומן מסחר (Prerequisite: S004-P007 Indicators Infrastructure GATE_8 PASS) | S005 |
| 22 | D29 | trades | ניהול טריידים | S005 |
| 23 | D30 | strategy_analysis | ניתוח אסטרטגיות | S006 |
| 24 | D31 | trades_history | היסטוריית טרייד (Prerequisite: S004-P007 Indicators Infrastructure GATE_8 PASS) | S005 |
| 25 | D32 | portfolio_state | מצב תיק היסטורי | S006 |
| 26 | D38 | tag_management | ניהול תגיות | S005 |
| 26.1 | D26-Phase2 | watch_lists (enhancement) | שדרוג רשימות צפייה: Position, P/L, P/L%, ATR(14), flag_color filter. Prerequisite: S004-P007 Indicators Infrastructure GATE_8 PASS | S005 |
| 27 | D40 | system_management | system_management — Admin Control Panel (admin-only, 7 sections: System Overview, Market Data Settings, Background Tasks, Alert System Monitor, Notifications Monitor, Audit Log, Feature Flags/Code Flags) | S003 |
| 28 | D41 | user_management | user_management — Admin User Control (admin-only) | S003 |

---

## Future Stages (deferred infrastructure)

| ID | Stage | Name | Type | Priority | Scope | Status |
|---|---|---|---|---|---|---|
| S008-NOTIFICATION-TOAST-SYSTEM | S008 (post-S006) | General Notification & Toast System | Cross-cutting infrastructure | NON-URGENT | Replace all browser alert/confirm with unified in-app NotificationService; add toast levels SUCCESS/WARNING/ERROR/INFO; add in-app alert notification panel; complete universal modal/toast migration using legacy notification system as reference. | DEFERRED |
| S003-P017-LEAN-KIT | S003 | Lean Kit + methodology portability | Methodology (Agents_OS) | — | **Program `S003-P017` COMPLETE 2026-04-03:** WP001 GATE_5 (Team 191, `agents-os` init); WP002 GATE_5 (Team 170, lean-kit content). Repo: `github.com/WaldNimrod/agents-os`. Follow-on programs registered in `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` (`S003-P018`/`S003-P019`, `S004-P009`–`S004-P011` Lean Kit track — slots `S004-P009`+ chosen to preserve existing TikTrack `S004-P005`–`P007` rows). Authority: `ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md` §3; `ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md`. | COMPLETE |
| S003-P018 | S003 | AOS Snapshot Version Management | Methodology (Agents_OS) | COMPLETE | **GATE_5 PASS_WITH_FINDINGS 2026-04-03.** `agents_os_v3/SNAPSHOT_VERSION` v0.1.0+ecf247c; `sync_aos_snapshot.sh`; SYNC_PROCEDURE.md (both repos); Makefile target. AC-01..AC-10 PASS. S003-P019 unblocked. | COMPLETE |
| S003-P019 + S004-P009–P011 | S003 / S004 | Multi-project adoption + Lean Kit generator + L0→L2 upgrade + CLI | Methodology (Agents_OS) | PLANNED | S003-P019 requires S003-P018 GATE_5 PASS ✓. S004-P009–P011 require S003-P019. Registry detail: `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`. | PLANNED |
| S005-P006 | S005 | Domain Clean Separation — TikTrack Consumes AOS as Installed Tool (Phase E) | Methodology (Agents_OS) | PLANNED | Removes `agents_os_v3/` from TikTrack; AOS as installable L3 CLI. Pre-conditions: ALL of S003-P018/P019 + S004-P009/P010/P011 GATE_5 PASS. Locked: `ARCHITECT_DIRECTIVE_DOMAIN_SEPARATION_BRIDGE_MODEL_v1.0.0.md` Phase E. LOD100: `TEAM_00_LOD100_S005_P006_DOMAIN_CLEAN_SEPARATION_v1.0.0.md`. | PLANNED |

**דשבורדים רמה 1** (בית, תכנון, מעקב, מחקר, נתונים, ניהול): מימוש תוכן — **שלב 6 ומאוחר יותר**.

---

**log_entry | TEAM_170 | PHOENIX_PORTFOLIO_ROADMAP | v1.0.0_CREATED | 2026-02-23**
**log_entry | TEAM_170 | PHOENIX_PORTFOLIO_ROADMAP | SINGLE_ROADMAP_NARRATIVE_AND_PAGES | 2026-02-23**
**log_entry | TEAM_170 | ROADMAP_AMENDED | 5_AMENDMENTS_PER_DIRECTIVE_v1.0.0 | 2026-03-02**
**log_entry | TEAM_170 | PHOENIX_PORTFOLIO_ROADMAP | ROADMAP_AMENDED_v2_3_AMENDMENTS_PER_ARCHITECT_DIRECTIVE_ROADMAP_AMENDMENT_v2.0.0 | 2026-03-03**
**log_entry | TEAM_170 | ROADMAP_AMENDMENTS_COMPLETE_v1+v2 | 2026-03-03**
**log_entry | TEAM_170 | ROADMAP_ID_UPDATE | INDICATORS_PROGRAM_ID_CANONICALIZED_TO_S004-P007 | per_TEAM_00_RATIFICATION | 2026-03-03**
**log_entry | TEAM_190 | PHOENIX_PORTFOLIO_ROADMAP | S002_SCOPE_NOTE_UPDATED_FOR_MCP_QA_TRANSITION_PACKAGING | 2026-03-06**
**log_entry | TEAM_170 | PHOENIX_PORTFOLIO_ROADMAP | ADR031_S002_P005_ANNOTATION_WP001_WP002_PER_TEAM_100_MANDATE | 2026-03-15**
**log_entry | TEAM_170 | PHOENIX_PORTFOLIO_ROADMAP | S003_P017_LEAN_KIT_FUTURE_ROW | 2026-04-02**
**log_entry | TEAM_170 | PHOENIX_PORTFOLIO_ROADMAP | S003_P017_COMPLETE_AND_FOLLOWON_PROGRAMS_ROW | TEAM_100_MANDATE_REGISTRY_ROADMAP_UPDATE | 2026-04-03**
**log_entry | TEAM_00 | PHOENIX_PORTFOLIO_ROADMAP | S005_P006_DOMAIN_CLEAN_SEPARATION_ROW_ADDED | PHASE_E_LOCKED | 2026-04-03**
