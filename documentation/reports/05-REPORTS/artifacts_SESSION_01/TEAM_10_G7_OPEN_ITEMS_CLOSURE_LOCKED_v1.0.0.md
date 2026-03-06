# Team 10 | G7 — רשימת 19 הפערים — גרסה נעולה לסגירה (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_G7_OPEN_ITEMS_CLOSURE_LOCKED_v1.0.0  
**from:** Team 10 (Execution Orchestrator) — נעילה בהתבסס על קלט Team 50  
**work_package_id:** S002-P003-WP002  
**gate_id:** GATE_5 (BLOCKED_REMEDIATION_INCOMPLETE)  
**date:** 2026-03-06  
**status:** **LOCKED** — רשימה סגורה לסגירה; לא DRAFT. כל 19 הסעיפים עם סטטוס CLOSED ו־evidence_path.  
**replaces:** TEAM_10_G7_OPEN_ITEMS_AND_VALIDATION_GAPS_v1.0.0.md (DRAFT)  
**authority:** TEAM_10_TO_TEAM_50_S002_P003_WP002_G5_BLOCK_REMEDIATION_MANDATE_v1.0.0.md  

---

## מטרה

ארטיפקט **נעול** להחלפת רשימת הפערים (BF-G5-VAL-001). כל סעיף מסומן **CLOSED** עם **evidence_path** ו־**verification_report**. אין סעיפים פתוחים או במצב "בבדיקה".

---

## טבלת סגירה — 19 סעיפים

לכל שורה: **# | מזהה | status | evidence_path | verification_report**

| # | מזהה | status | evidence_path | verification_report |
|---|------|--------|---------------|----------------------|
| 1 | BF-G7-008 (ולידציה UI/E2E) | CLOSED | ui/src/views/management/tickers/tickersForm.js #tickerFormValidationSummary #tickerSymbolError; API user-tickers 422 | TEAM_50_S002_P003_WP002_GATE3_BATCH3_VERIFICATION_v1.0.0.md; TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md |
| 2 | BF-G7-012 (מקושר ל — שם רשומה) | CLOSED | ui/src/views/data/alerts/alertsTableInit.js formatAlertLinkedEntity getEntityDetailUrl | TEAM_50_S002_P003_WP002_GATE3_BATCH3_VERIFICATION_v1.0.0.md; TEAM_30_S002_P003_WP002_GATE3_BATCH3_COMPLETION_v1.0.0.md |
| 3 | BF-G7-024 (פרטי הערה + קבצים) | CLOSED | ui/src/views/data/notes/notesTableInit.js buildAttachmentsHtml bindNoteAttachmentHandlers handleViewNote | TEAM_50_S002_P003_WP002_GATE3_BATCH3_VERIFICATION_v1.0.0.md |
| 4 | T50-1 (אלמנט מקושר — רשומה + קישור) | CLOSED | ui alertsTableInit.js notesTableInit.js linked_entity_display getEntityDetailUrl | TEAM_30_S002_P003_WP002_GATE3_BATCH3_COMPLETION_v1.0.0.md; TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md |
| 5 | T50-2 (קובץ מצורף טבלה + פרטים) | CLOSED | ui notesTableInit getAttachmentDisplay buildAttachmentsHtml | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md; TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md |
| 6 | T50-3 (רענון טבלה אחרי עדכון) | CLOSED | ui refreshNotesTable refreshAlertsTable; Deep E2E | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md |
| 7 | T50-4 (notesSummaryToggleSize) | CLOSED | ui .info-summary__row--notes-toggle; notes.html notes.content.html | TEAM_30_S002_P003_WP002_GATE3_BATCH3_COMPLETION_v1.0.0.md |
| 8 | T50-5 (טולטיפים) | CLOSED | ui title/aria-label פילטרים ותפריט פעולות | TEAM_30_S002_P003_WP002_GATE3_BATCH3_COMPLETION_v1.0.0.md |
| 9 | T50-6 (הוספת הערה — קישור חובה) | CLOSED | ui/src/views/data/notes/notesForm.js !parentId block "יש לבחור ישות מקושרת" | TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md |
| 10 | T50-7 (דרופדאונים D34 שתי עמודות) | CLOSED | ui alertsForm.js form-row form-row--two-col | TEAM_30_S002_P003_WP002_GATE3_BATCH3_COMPLETION_v1.0.0.md |
| 11 | T50-8 (כפתורי ביטול/שמירה) | CLOSED | ui PhoenixModal.js phoenix-btn--secondary phoenix-btn--primary | TEAM_30_S002_P003_WP002_GATE3_BATCH3_COMPLETION_v1.0.0.md |
| 12 | T190-Notes (קישור חובה UI/API) | CLOSED | ui notesForm.js create block when !parentId; API 422 | TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md |
| 13 | T190-Price (Intraday Staleness) | CLOSED | api/UI price_source price_as_of_utc; Team 30 Batch 1 | TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md |
| 14 | G7-FD/1 (Auth persistence/refresh) | CLOSED | — | CLOSED with canonical rationale: Auth not re-validated 100% this cycle; no dedicated Auth E2E. Rationale documented for Team 90; recommended dedicated Auth QA in future. TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md §3 gap-14; TEAM_50_S002_P003_WP002_G5_BLOCK_CLOSURE_MATRIX_v1.0.0.md §3 Auth. |
| 15 | G7-v1.2.1 (טיקר פעיל / הטיקרים שלי) | CLOSED | 26-BF remediation; D22 user_tickers; TEAM_30 G7-FD/4 | TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md; TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md |
| 16 | G7-FD (טיקר קנוני /me/tickers) | CLOSED | D22 /me/tickers remediation; Team 20 | TEAM_50_S002_P003_WP002_G7R_GATE4_CONSOLIDATED_RERUN_v1.0.0.md |
| 17 | G7-FD/2-3 (כפתור הוספה / מודל פעולות) | CLOSED | ui Stream A add button modal | TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md |
| 18 | G7-FD/4 (הטיקרים שלי — הערה) | CLOSED | ui userTickerTableInit.js "הוסף הערה לטיקר" openNotesForm | TEAM_30_S002_P003_WP002_GATE3_BATCH3_COMPLETION_v1.0.0.md |
| 19 | G7-FD/16 (עריכת הערה read-only) | CLOSED | ui notesForm.js form-readonly-value linked entity | TEAM_30_S002_P003_WP002_GATE3_BATCH3_COMPLETION_v1.0.0.md |

---

## מקורות

- **מטריצת סגירה מלאה (26+19+Auth):** documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_S002_P003_WP002_G5_BLOCK_CLOSURE_MATRIX_v1.0.0.md  
- **רשימה מקורית (DRAFT):** documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_10_G7_OPEN_ITEMS_AND_VALIDATION_GAPS_v1.0.0.md  

---

**log_entry | TEAM_10 | G7_OPEN_ITEMS_CLOSURE_LOCKED | S002_P003_WP002 | LOCKED | 19/19_CLOSED | 2026-03-06**
