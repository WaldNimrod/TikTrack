# Team 10: מסמך מרכזי — משימות פתוחות ותוכנית עבודה

**מאת:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**סטטוס:** SSOT לרשימת המשימות הפתוחות — חלוקה לפי צוותים וסדר ביצוע

**מקורות:** TEAM_10_BATCH_1_2_FINAL_REPORT_AND_CLOSURE_PLAN.md, TT2_PHASE_2_CLOSURE_WORK_PLAN.md, **BATCH_2_5 (ADR-017, ADR-018)** — TEAM_10_BATCH_2_5_ARCHITECT_MANDATE_AND_DISTRIBUTION.md.

**פרוטוקול שולחן נקי (Clean Table):** TEAM_10_CLEAN_TABLE_PROTOCOL.md — Checklist סגירה A/B/C; הכרזת "Clean Table" רק כאשר כל פריטי A, B, C מסומנים ✅.

**Governance v2.102 — כלל סגירה (מחייב מתאריך 2026-02-13):** סגירת משימה תקפה **רק** עם **Seal Message (SOP-013)**. דוח/דוח השלמה לבדו **לא** מתקבל. ראה: documentation/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md.

---

## 1. סטטוסים שנסגרו לאחרונה (לעדכון תיעוד)

| נושא | דוח/אישור | סטטוס |
|------|------------|--------|
| **Flow Type SSOT (flowTypeValues)** | TEAM_50_TO_TEAM_10_FLOW_TYPE_SSOT_QA_REPORT.md — כל הבדיקות עברו | ✅ QA מאומת |
| **CURRENCY_CONVERSION flow_type** | TEAM_50_TO_TEAM_10_CURRENCY_CONVERSION_QA_REPORT.md | ✅ סגור |
| **סטנדרט סטטוסים D16 (Backend)** | TEAM_50_TO_TEAM_20_STATUS_STANDARD_QA_REPORT.md | ✅ סגור |
| **פונקציה מרכזית סטטוסים (Team 30)** | TEAM_30_TO_TEAM_10_CENTRAL_STATUS_FUNCTION_COMPLETE.md; דוח QA: TEAM_50_TO_TEAM_10_CENTRAL_STATUS_FUNCTION_QA_REPORT.md | ✅ יישום + QA |
| **Team 60 — 1.2.2 (פורטים 8080/8082, CORS, Precision 20,6)** | TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md; TEAM_60_TO_TEAM_10_TASK_1_2_2_PORT_PRECISION_REPORT.md | ✅ VERIFIED |
| **Team 60 — 1.2.3 (Seeders, make db-test-clean)** | TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md; TEAM_60_TO_TEAM_10_PHASE_1_IMPLEMENTATION_START.md | ✅ COMPLETE |
| **1.3.1 Option D (Team 40+30+50)** | TEAM_50_TO_TEAM_10_OPTION_D_RESPONSIVE_QA_REPORT.md — כל הקריטריונים PASS/SKIP | ✅ **סגור** — יישום (40) + תשתית (30) + QA (50) הושלמו. TEAM_10_TO_TEAM_50_OPTION_D_QA_ACK.md |
| **דבקר ראשון 30/40/50** | דוחות השלמה התקבלו; Team 40 — סגור; Team 30 — 1.3.2, 1.3.3, UI, Nav/Auth סגור; Team 50 — 1.5, D16, Option D, **Auth Guard QA** סגור | TEAM_10_CHECKPOINT_1_REPORTS_ACK_AND_CLOSURE_DEMAND.md; TEAM_10_TO_TEAM_50_AUTH_GUARD_QA_ACK.md |
| **Auth Guard QA (Team 50)** | TEAM_50_TO_TEAM_10_AUTH_GUARD_QA_REPORT.md — Type A/C, redirect ל-Home, גישה מאומתת, Auth Guard נטען — כל הקריטריונים PASS | ✅ **סגור** — TEAM_10_TO_TEAM_50_AUTH_GUARD_QA_ACK.md |

---

## 2. משימות פתוחות — חלוקה לפי צוות וסדר ביצוע

### 2.1 Team 10 (השער) — סיווג Clean Table: ✅

| סדר | מזהה | משימה | תוצר מצופה | סטטוס | מקור |
|-----|------|--------|-------------|--------|------|
| 1 | Batch 1+2 | פרסום **"Batch 1+2 Closure Report"** רשמי וסגירת הסבב | מסמך closure רשמי | ✅ **PASS** | TEAM_10_BATCH_1_2_CLOSURE_REPORT.md |
| 2 | 1.1.1 | עדכון Page Tracker: D21 Infra → **VERIFIED** (סופי) | TT2_OFFICIAL_PAGE_TRACKER.md מעודכן | ✅ **PASS** | TT2_OFFICIAL_PAGE_TRACKER.md — 2026-02-12 Task 2.1 A2 |
| 3 | 1.1.2 | אכיפת SLA 30/40 — רישום חריגות או "אין חריגות" | תיעוד + קישור SSOT | ✅ **PASS** | TEAM_40_TO_TEAM_10_CHECKPOINT_1_COMPLETION_REPORT — אין חריגות; TEAM_10_TO_TEAM_40_CHECKPOINT_1_ACK.md |
| 4 | 1.1.3 | וידוא ש־`make db-test-clean` פועל ב-100% | אימות ריצה + תיעוד | ✅ **PASS** | TEAM_10_1_1_3_DB_TEST_CLEAN_VERIFICATION.md |
| 5 | 1.4 | פלט שלב 1 — רשימת חוסרים/פערים; וידוא אין החלטות תלויות | מסמך פלט + חתימה | ✅ **PASS** | TEAM_10_PHASE_1_OUTPUT_1_4.md |
| 6 | 4.1.1–4.1.4 | הכנה ל־G-Lead: תיעוד, מסירת חומר, Sign-off, גיבוי GitHub | Handoff + תיעוד | ✅ **PASS** | TEAM_10_G_LEAD_HANDOFF_PHASE_2.md |
| 7 | Batch 2.5 | הפצת מנדט אדריכל (ADR-017, ADR-018); וידוא אינדקסים — הפניה בלעדית ל־00_MASTER_INDEX; שער D18/D21; סיכום לבדיקה | מנדט מופץ; אינדקסים מעודכנים; שער מתועד; סיכום להגשה | ✅ **PASS** | TEAM_10_BATCH_2_5_ARCHITECT_MANDATE_AND_DISTRIBUTION.md; TEAM_10_TO_TEAM_90_BATCH_2_5_SPY_MANDATE.md; TEAM_10_BATCH_2_5_COMPLETION_SUMMARY_FOR_REVIEW.md; TEAM_10_D18_D21_APPROVAL_GATE.md |

**הערה:** מסירת קונטקסט ל־Team 50 (1.4א) — חובה לפני הרצת QA כשנפתח scope חדש.

---

### 2.2 Team 20 (Backend & DB)

**External Data (2026-02-13):** P3-008, P3-009, P3-013, P3-014, P3-015 — **CLOSED** (Seal SOP-013 התקבל: TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE).

| סדר | מזהה | משימה | תוצר מצופה | מקור |
|-----|------|--------|-------------|------|
| 1 | 1.2.1 | מימוש Endpoints ל־Summary ו־Conversions (Option A) | API פעילים; תיעוד ב־SSOT | ✅ **הושלם** — 4 endpoints אומתו; OpenAPI + SSOT_1_2_1 (TEAM_10_BACKEND_TASKS_EXECUTION_VERIFICATION) |
| 2 | 1.2.2 | נעילת פורטים 8080/8082 והקשחת Precision ל־20,6 | CORS/Config + NUMERIC(20,6) מאומת | ✅ **הושלם** — מאומת ע"י Team 60 (TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md); סגור רשמית per Team 90 |
| 3 | 1.2.3 | בניית Python Seeders עם `is_test_data = true`; `make db-test-clean` מחזיר DB סטרילי | סקריפטים + Makefile | ✅ **הושלם** — seed_test_data.py, db_test_clean.py, seed_base_test_user.py, reduce_admin_base_to_minimal.py, db_remove_superfluous_users.py; Makefile: db-test-clean, db-test-fill, db-backup, db-base-seed, db-admin-minimal, db-test-report, db-remove-superfluous-users |
| 4 | PDSC | PDSC Boundary Contract — JSON Error Schema, Response Contract, Error Codes | מסמך חוזה משותף | ✅ **הושלם** — לפי השלד; אומת (TEAM_10_BACKEND_TASKS_EXECUTION_VERIFICATION) |
| 5 | Auth | חוזה Auth אחיד + עדכון SSOT/OpenAPI | תיעוד + OpenAPI | ✅ **הושלם** — identity.py + SSOT_AUTH_CONTRACT + OpenAPI (אומת) |
| 6 | **P3-013** | External Data M6 (Addendum) — Market Cap | ✅ **CLOSED** (Seal 2026-02-13) | TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE |
| 7 | **P3-014** | External Data M7 — Indicators ATR/MA/CCI | ✅ **CLOSED** (Seal 2026-02-13) | TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE |
| 8 | **P3-015** | External Data M8 — 250d Historical Daily | ✅ **CLOSED** (Seal 2026-02-13) | TEAM_20_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE |

**תלות:** השלמת 1.2.1–1.2.3 פותחת את 1.1.3 ל־Team 10 ואת אינטגרציה מלאה ל־30/40.

---

### 2.3 Team 60 (DevOps & Platform)

**סטטוס:** 1.2.2, 1.2.3 ✅ הושלמו. **External Data (מתאריך 2026-02-13):** P3-011, P3-016, P3-017 — OPEN.

| מזהה | משימה | סטטוס | דוח / מקור |
|------|--------|--------|-------------|
| 1.2.2 | נעילת פורטים 8080/8082, Config, Precision 20,6 | ✅ VERIFIED | TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md, TEAM_60_TO_TEAM_10_TASK_1_2_2_PORT_PRECISION_REPORT.md |
| 1.2.3 | Seeders, `make db-test-clean` | ✅ COMPLETE | TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md, TEAM_60_TO_TEAM_10_PHASE_1_IMPLEMENTATION_START.md |
| **P3-011** | FX EOD Sync (Alpha→Yahoo) | ✅ **CLOSED** (Seal 2026-02-13) | TEAM_60_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE |
| **P3-016** | Intraday Table + Migration (`ticker_prices_intraday`) | ✅ **CLOSED** (Seal 2026-02-13) | TEAM_60_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE |
| **P3-017** | Cleanup Jobs (retention 30d/250d, archive) + Evidence | ✅ **CLOSED** (Seal 2026-02-13) | TEAM_60_TO_TEAM_10_EXTERNAL_DATA_SEAL_MESSAGE |

**תלויות שפתחו:** משימה 1.1.3 (Team 10) — מוכן לביצוע; אינטגרציה מלאה Team 30/40 — מוכנה.

---

### 2.4 Team 30 (Frontend Execution)

**Pre-Batch 3 (SOP-013 Seal 2026-01-31):** P3-001 (Routes SSOT), P3-002 (Menu Alignment), P3-012 (Clock Staleness UI) — **CLOSED** per TEAM_30_TO_TEAM_10_PRE_BATCH_3_SEAL_MESSAGE. P3-004 (חלק 30) — נחתם; משימה כוללת OPEN.

| סדר | מזהה | משימה | תוצר מצופה | מקור |
|-----|------|--------|-------------|------|
| 1 | 1.3.1 | Retrofit רספונסיביות (Option D): **כל הממשק בכל העמודים** רספונסיבי; טבלאות D16/D18/D21 — Sticky + Fluid (clamp) | CSS + layout מעודכן; בדיקות | TT2_PHASE_2_CLOSURE_WORK_PLAN 1.3 |
| | | | ✅ **הושלם** — יישום (40) + תשתית (30) + QA (50) PASS. דוח: TEAM_50_TO_TEAM_10_OPTION_D_RESPONSIVE_QA_REPORT.md; אישור: TEAM_10_TO_TEAM_50_OPTION_D_QA_ACK.md. | TEAM_10_TO_TEAMS_30_40_RESPONSIVE_RETROFIT_ACK.md |
| 2 | 1.3.2 | ניקוי מוחלט של `console.log` ומעבר ל־`audit.maskedLog` | אין console.log חשוף | ✅ **הושלם** — TEAM_30_TO_TEAM_10_CHECKPOINT_1_COMPLETION_REPORT §2.1 |
| 3 | 1.3.3 | הקשחת טרנספורמרים: מניעת NaN ו־Undefined בטבלאות | transformers.js + null-safety | ✅ **הושלם** — TEAM_30_TO_TEAM_10_CHECKPOINT_1_COMPLETION_REPORT §2.2 |
| 4 | Nav/Auth | תיקון Navigation & Auth (Phase 1–4) | קוד מעודכן או מסמך סגירה | ✅ **סגור** — מסמך סגירה תוקן ואושר. TEAM_30_TO_TEAM_10_NAV_AUTH_CLOSURE_DOC.md (§6 תיקונים); TEAM_10_TO_TEAM_30_NAV_AUTH_CLOSURE_APPROVED.md |
| 5 | UI (אופציונלי) | שינוי שמות קבצים d16; ארגון מודולים; portfolioSummary.js | שמות ותיקיות מעודכנים | ✅ **הושלם** — TEAM_30_TO_TEAM_10_CHECKPOINT_1_COMPLETION_REPORT §2.4 |

**תלות:** אינטגרציה מלאה עם API — 1.2.2 הושלם (Team 60); ממתין להשלמת 1.2.1 (Team 20). עבודה על 1.3.1–1.3.3 מותרת במקביל.

---

### 2.5 Team 40 (UI Assets & Design)

| סדר | מזהה | משימה | תוצר מצופה | מקור |
|-----|------|--------|-------------|------|
| 1 | 1.3.1 | תיאום עם Team 30 — עיצוב/מפרט רספונסיביות, CSS, layout (תחת SLA 30/40) | עיצוב Presentational לפי SSOT | TT2_PHASE_2_CLOSURE_WORK_PLAN 1.3; TT2_SLA_TEAMS_30_40 |
| | | | ✅ **הושלם** — יישום + QA PASS (TEAM_50_TO_TEAM_10_OPTION_D_RESPONSIVE_QA_REPORT.md). | TEAM_10_TO_TEAM_50_OPTION_D_QA_ACK.md |
| 2 | SLA | אכיפת SLA: צוות 40 מגיש רכיבי UI (Presentational), צוות 30 מזריק לוגיקה (Containers) | טיפול בחריגות | ✅ **סגור** — TEAM_40_TO_TEAM_10_CHECKPOINT_1_COMPLETION_REPORT; TEAM_10_TO_TEAM_40_CHECKPOINT_1_ACK.md |

---

### 2.6 Team 50 (QA & Fidelity)

| סדר | מזהה | משימה | תוצר מצופה | מקור |
|-----|------|--------|-------------|------|
| 1 | Context | קבלת קונטקסט מ־Team 10 לפני כל סבב QA חדש — מה פותח, מה לבדוק, SSOT | עדכון מפורט מ־Team 10 | TT2_QUALITY_ASSURANCE_GATE_PROTOCOL 1ב |
| 2 | 1.3.1 Option D | בדיקות רספונסיביות — Sticky, Fluid, D16/D18/D21 (6 קריטריונים) | דוח PASS/FAIL ל־Team 10 | ✅ **הושלם** — TEAM_50_TO_TEAM_10_OPTION_D_RESPONSIVE_QA_REPORT.md; TEAM_10_TO_TEAM_50_OPTION_D_QA_ACK.md |
| 3 | 1.5 | שער א' — הרצת סוויטת בדיקות (0 SEVERE); דוח ל־Team 10 | GATE_A_PASSED / דוח | ✅ **סגור** — מאומת בסבב קודם (TEAM_50_TO_TEAM_10_CHECKPOINT_1_COMPLETION_REPORT) |
| 4 | QA Tasks | Auth Guard — בדיקה לאחר תיקון (Team 30); D16 Backend API Testing | דוחות QA | D16 → ✅ **סגור**. Auth Guard QA → ✅ **סגור** — TEAM_50_TO_TEAM_10_AUTH_GUARD_QA_REPORT.md (כל הקריטריונים PASS); TEAM_10_TO_TEAM_50_AUTH_GUARD_QA_ACK.md. |

---

### 2.7 Team 90 (סבב מאמת) — סיווג Clean Table: ✅

| סדר | מזהה | משימה | תוצר מצופה | סטטוס | מקור |
|-----|------|--------|-------------|--------|------|
| 1 | 3.1.1 | ריצת Gate B (או סבב מאמת) לאחר תיקוני שלב 1–2 | דוח Gate B מאושר; GATE_B_PASSED | ✅ **PASS** | documentation/05-REPORTS/GATE_B_STATUS.md; _COMMUNICATION/team_90/TEAM_90_GATE_B_REVERIFY_GREEN.md |
| 2 | 3.1.2 | תיעוד ארטיפקטים והחלטת GREEN | ארטיפקטים ב־05-REPORTS/artifacts; GATE_B_STATUS | ✅ **PASS** | שם — GATE_B_STATUS.md GREEN; ארטיפקטים ב־phase2-e2e-artifacts |

---

### 2.8 G-Lead (נמרוד — Visionary) — סיווג Clean Table: ✅

| סדר | מזהה | משימה | תוצר מצופה | סטטוס | מקור |
|-----|------|--------|-------------|--------|------|
| 1 | 4.1.2–4.1.3 | בדיקה ידנית-ויזואלית בדפדפן; Sign-off או רשימת תיקונים | מסמך חתום / log_entry | ✅ **PASS** | TEAM_10_G_LEAD_VISUAL_SIGNOFF_LOG.md |

---

### 2.9 בץ 2.5 — מנדט אדריכל (ADR-017, ADR-018) — משימות חוסמות

| צוות | משימה | תוצר מצופה | סטטוס |
|------|--------|-------------|--------|
| **20** | גרסאות API → 1.0.0; רפקטור עמלות (trading_account_fees) + Data Migration Plan; חסימת API/ייבוא ל"אחר" | 1.0.0; תוכנית מיגרציה; לוגיקה | ✅ **PASS** — TEAM_20_BATCH_2_5_CLOSURE_REPORT.md; TEAM_60_TO_TEAM_90_MIGRATION_EXECUTION_EVIDENCE.md; model maps to `trading_account_fees`. |
| **30** | גרסאות UI → 1.0.0; Redirect ל-Home (/) לא מחוברים; User Icon Success/Warning; טופס ברוקר "אחר" + הודעה | 1.0.0; קוד; UI | ✅ **PASS** — TEAM_30_TO_TEAM_10_BATCH_2_5_CLOSURE_REPORT.md; TEAM_30_BATCH_2_5_EVIDENCE_LOG.md |
| **50** | אימות Redirect ואייקון | דוח QA | ✅ **PASS** — TEAM_50_TO_TEAM_10_BATCH_2_5_ADR017_QA_REPORT.md |
| **60** | גרסאות DB → 1.0.0; תשתית רפקטור עמלות | 1.0.0; תשתית | ✅ **PASS** — TEAM_60_TO_TEAM_10_BATCH_2_5_CLOSURE_REPORT.md; TEAM_60_BATCH_2_5_EVIDENCE_LOG.md; TEAM_60_TO_TEAM_90_MIGRATION_EXECUTION_EVIDENCE.md |
| **90** | פסילת 2.x ו-D15_SYSTEM_INDEX; אימות חסימת ייבוא/API ל"אחר"; אימות Redirect ואייקון | דוח Spy | ✅ **PASS** — TEAM_90_TO_ARCHITECT_BATCH_2_5_SPY_FINAL_REPORT.md |
| **10** | וידוא רפקטור לפני אישור D18/D21; הפניה בלעדית ל־00_MASTER_INDEX | אינדקסים; חסימה | ✅ **הושלם** — סיכום: TEAM_10_BATCH_2_5_COMPLETION_SUMMARY_FOR_REVIEW.md; שער: TEAM_10_D18_D21_APPROVAL_GATE.md |

**מקור:** `_COMMUNICATION/90_Architects_comunication/BATCH_2_5_COMPLETIONS_MANDATE.md` (ADR-017), `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md` (ADR-018); פירוט: TEAM_10_BATCH_2_5_ARCHITECT_MANDATE_AND_DISTRIBUTION.md.

---

### 2.10 Smart History Fill (Level-2) — מימוש לפי SSOT נעול

**מקור אמת (נעול):** _COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md  
**החלטות:** Gap-First; Reload רק ב-Admin; 250 ימי מסחר מינימום; Gap = יום חסר בתוך 250; Retry: מיידי + Batch לילה; History: Yahoo → Alpha; Provider: date_from/date_to; API: endpoint יחיד `mode=gap_fill`|`force_reload`.

| מזהה | בעלים | משימה | תוצר מצופה | תלות / חסימה | סטטוס |
|------|--------|--------|-------------|----------------|--------|
| SHF-1 | **Team 20** | Smart History Engine — Gap analysis, Decision (GAP_FILL\|NO_OP\|force_reload), Post-run verification + Retry (מיידי + batch לילה) | Service/Engine; לוגיקה ברמת מערכת (לא בתוך קונקטורים) | — | ⬜ OPEN |
| SHF-2 | **Team 20** | הרחבת Provider Interface — `get_ticker_history(symbol, trading_days, date_from?, date_to?)` | Yahoo + Alpha תומכים בטווח תאריכים (או fallback לטווח מלא) | — | ⬜ OPEN |
| SHF-3 | **Team 20** | API — `POST /api/v1/tickers/{ticker_id}/history-backfill?mode=gap_fill\|force_reload` (ברירת מחדל: gap_fill); force_reload — אימות Admin בלבד | Router + אימות הרשאה ל־force_reload | SHF-1 | ⬜ OPEN |
| SHF-4 | **Team 20** | סנכרון סקריפט `sync_ticker_prices_history_backfill.py` עם המנוע (קריאה ל־Engine במקום לוגיקה מפוזרת) | סקריפט מעודכן; Make target אם רלוונטי | SHF-1 | ⬜ OPEN |
| SHF-5 | **Team 30** | Admin UI — דיאלוג "הנתונים מלאים — לטעון מחדש?" + טריגר ל־force_reload באישור מפורש | עמוד ניהול טיקרים (D22); כפתור/פעולה עם אישור | SHF-3 (API פעיל) | ⬜ OPEN |
| SHF-6 | **Team 30** | הצגת סטטוס השלמה/טעינה חוזרת (לאחר backfill) | UI feedback — שורות שהושלמו, כישלון, retry | SHF-1, SHF-3 | ⬜ OPEN |
| SHF-7 | **Team 60** | ללא משימה חדשה (Schema קיים) | — | — | ✅ N/A |

**חסימות ידועות:** אין. תלות: SHF-3, SHF-5, SHF-6 תלויים ב־SHF-1.

---

## 3. סדר ביצוע מומלץ (תזמור)

1. **Team 60** — ✅ 1.2.2, 1.2.3 הושלמו (דוח: TEAM_60_TO_TEAM_10_OPEN_TASKS_STATUS_REPORT.md).
2. **Team 20** — 1.2.1 (Endpoints Summary/Conversions); 1.2.2/1.2.3 — תשתית הושלמה עם Team 60.
3. **Team 10** — 1.1.1, 1.1.2 במקביל; **אחרי** 1.2.3: 1.1.3, 1.4 (1.1.3 כעת מוכן — `make db-test-clean` פועל).
4. **Team 30 + Team 40** — 1.3.1, 1.3.2, 1.3.3 (מותר להתחיל במקביל; אינטגרציה מלאה — אחרי 1.2.1).
4. **Team 10** — פרסום Batch 1+2 Closure Report; הכנה ל־G-Lead (4.1.1–4.1.4).
5. **Team 50** — סבבי QA לפי קונטקסט מ־Team 10.
6. **Team 90** — שלב 3 (Gate B); **G-Lead** — שלב 4 (אישור ויזואלי).

---

## 4. הודעות חלוקה לצוותים (2026-02-12)

| צוות | מסמך הפניה |
|------|-------------|
| Team 20 | TEAM_10_TO_TEAM_20_OPEN_TASKS_ASSIGNMENT.md |
| Team 30 | TEAM_10_TO_TEAM_30_OPEN_TASKS_ASSIGNMENT.md |
| Team 40 | TEAM_10_TO_TEAM_40_OPEN_TASKS_ASSIGNMENT.md |
| Team 50 | TEAM_10_TO_TEAM_50_OPEN_TASKS_ASSIGNMENT.md |
| Team 60 | TEAM_10_TO_TEAM_60_OPEN_TASKS_ASSIGNMENT.md |

**בץ 2.5 (2026-02-13):** מנדט אדריכל — גרסה 1.0.0 רשמית; ADR-017, ADR-018. הופץ: TEAM_10_BATCH_2_5_ARCHITECT_MANDATE_AND_DISTRIBUTION.md; TEAM_10_TO_TEAM_90_BATCH_2_5_SPY_MANDATE.md. **Team 10 — בוצע במלואו:** סיכום לבדיקה: TEAM_10_BATCH_2_5_COMPLETION_SUMMARY_FOR_REVIEW.md; שער D18/D21: TEAM_10_D18_D21_APPROVAL_GATE.md.

**דבקר ראשון (2026-02-12):** הוצאו בקשת השלמה; דוחות התקבלו; הוצאו דרישות סגירה סופית:
- **אישור דוחות + דרישה:** TEAM_10_CHECKPOINT_1_REPORTS_ACK_AND_CLOSURE_DEMAND.md
- **Team 30:** TEAM_10_TO_TEAM_30_FINAL_CLOSURE_DEMAND.md — Nav/Auth: השלם או הגש מסמך סגירה (אין להשאיר פתוח)
- **Team 40:** TEAM_10_TO_TEAM_40_CHECKPOINT_1_ACK.md — כל המשימות סגורות
- **Team 50:** TEAM_10_TO_TEAM_50_FINAL_CLOSURE_DEMAND.md — Auth Guard: הרץ מיד עם 30; D16 סגור

---

## 5. הפניות

| מסמך | נתיב |
|------|------|
| **פרוטוקול Clean Table (שולחן נקי)** | _COMMUNICATION/team_10/TEAM_10_CLEAN_TABLE_PROTOCOL.md |
| תוכנית סגירת Batch 1+2 | 05-REPORTS/artifacts/TEAM_10_BATCH_1_2_FINAL_REPORT_AND_CLOSURE_PLAN.md |
| תוכנית סגירת Phase 2 | documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md |
| דוח Flow Type SSOT QA | _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_FLOW_TYPE_SSOT_QA_REPORT.md |
| SLA 30/40 | documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md |
| פרוטוקול שערי QA | documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md |
| **מנדט בץ 2.5 (ADR-017/018)** | _COMMUNICATION/90_Architects_comunication/BATCH_2_5_COMPLETIONS_MANDATE.md; _COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md |
| **הפצה בץ 2.5** | _COMMUNICATION/team_10/TEAM_10_BATCH_2_5_ARCHITECT_MANDATE_AND_DISTRIBUTION.md; TEAM_10_TO_TEAM_90_BATCH_2_5_SPY_MANDATE.md |
| **סיכום בץ 2.5 לבדיקה** | _COMMUNICATION/team_10/TEAM_10_BATCH_2_5_COMPLETION_SUMMARY_FOR_REVIEW.md |
| **שער אישור D18/D21** | _COMMUNICATION/team_10/TEAM_10_D18_D21_APPROVAL_GATE.md |
| **Smart History Fill (נעול)** | _COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md; MARKET_DATA_PIPE_SPEC §5; OPEN_TASKS §2.10 |

---

**log_entry | TEAM_10 | OPEN_TASKS_MASTER | BATCH_2_5_TEAM_10_COMPLETE | 2026-02-13**  
**log_entry | TEAM_10 | OPEN_TASKS_MASTER | SMART_HISTORY_FILL_LEVEL2_ADDED | 2026-02-14** — §2.10 משימות מימוש (SHF-1–SHF-7), owners, תלויות. מקור: TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC (נעול).
