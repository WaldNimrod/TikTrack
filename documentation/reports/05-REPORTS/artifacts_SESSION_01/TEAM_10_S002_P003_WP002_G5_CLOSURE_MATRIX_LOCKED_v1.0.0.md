# TEAM_10 | S002-P003-WP002 GATE_5 — מטריצת סגירה נעולה (R-002) (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P003_WP002_G5_CLOSURE_MATRIX_LOCKED_v1.0.0  
**owner:** Team 10 (Execution Orchestrator)  
**date:** 2026-03-06  
**status:** LOCKED — ארטיפקט יחיד לסגירה 26 BF + 19 gaps (per R-002)  
**gate_id:** GATE_5 (BLOCKED)  
**work_package_id:** S002-P003-WP002  
**authority:** TEAM_90_TO_TEAM_10_S002_P003_WP002_GATE5_BLOCK_REMEDIATION_INSTRUCTIONS_v1.0.0.md (R-002)  

---

## 1) הצהרה

מסמך זה הוא **מטריצת הסגירה הנעולה האחת** ל־26 BF + 19 gaps כנדרש ב־R-002.  
כל שורה עומדת בפורמט: **id | owner | status=CLOSED | evidence_path | verification_report | verifier | closed_date**.  
**מקור נתונים:** שורות 26 BF ו־19 gaps הועתקו מ־`TEAM_50_S002_P003_WP002_G5_BLOCK_CLOSURE_MATRIX_v1.0.0.md`; עמודות **verifier** ו־**closed_date** נוספו (ברירת מחדל: verifier = Team 50, closed_date = 2026-03-06 אלא אם צוין אחרת).

---

## 2) מטריצה — חבילה מקורית (26 BF)

כל שורה: **id | owner | status | evidence_path | verification_report | verifier | closed_date**

| id | owner | status | evidence_path | verification_report | verifier | closed_date |
|----|-------|--------|---------------|----------------------|----------|-------------|
| BF-G7-001 | Team 30 | CLOSED | ui/public/images/icons/favicon.ico; ui/index.html link rel=icon | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md; TEAM_50_G7_26BF_E2E_RESULTS.json; Team 60 not owned | Team 50 | 2026-03-06 |
| BF-G7-002 | Team 30 | CLOSED | ui/src/views/management/tickers/*.html entity-ticker/tickers | TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md; BATCH6 E2E | Team 50 | 2026-03-06 |
| BF-G7-003 | Team 30 | CLOSED | ui/src/views/management/tickers/tickersForm.js #tickerFormValidationSummary | TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md; g7-26bf-deep-e2e.test.js | Team 50 | 2026-03-06 |
| BF-G7-004 | Team 30 | CLOSED | ui D22 filter buttons; E2E 3 buttons | TEAM_50_G7_26BF_E2E_RESULTS.json | Team 50 | 2026-03-06 |
| BF-G7-005 | Team 30 | CLOSED | ui tooltips; TEAM_30 Batch 3 T50-5 | TEAM_30_S002_P003_WP002_GATE3_BATCH3_COMPLETION_v1.0.0.md; GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| BF-G7-006 | Team 30 | CLOSED | ui/src/components/shared/PhoenixModal.js cancelButtonText ביטול | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-007 | Team 30 | CLOSED | ui modal data-entity=tickers | TEAM_50_G7_26BF_E2E_RESULTS.json | Team 50 | 2026-03-06 |
| BF-G7-008 | Team 20 | CLOSED | api validation; ui tickersForm.js #tickerFormValidationSummary #tickerSymbolError | TEAM_50_S002_P003_WP002_GATE3_BATCH3_VERIFICATION_v1.0.0.md; GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| BF-G7-009 | Team 20 | CLOSED | api uix_tickers_symbol_exchange_active; D33 201/409 | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-010 | Team 20 | CLOSED | api delete_ticker cascade | TEAM_50_S002_P003_WP002_G7R_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-011 | Team 20 | CLOSED | api update_ticker status; D22 PUT/GET | TEAM_50_G7_26BF_E2E_RESULTS.json | Team 50 | 2026-03-06 |
| BF-G7-012 | Team 30/20 | CLOSED | ui alertsTableInit.js formatAlertLinkedEntity getEntityDetailUrl | TEAM_50_S002_P003_WP002_GATE3_BATCH3_VERIFICATION_v1.0.0.md; GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| BF-G7-013 | Team 20/30 | CLOSED | api validate_condition_canonical; E2E condition; D34 POST 422 | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-014 | Team 20/30 | CLOSED | api notes VALID_PARENT_TYPES excludes general; E2E no general | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-015 | Team 30/20 | CLOSED | ui ProseMirror; api sanitize_rich_text | TEAM_50_G7_26BF_E2E_RESULTS.json | Team 50 | 2026-03-06 |
| BF-G7-016 | Team 30 | CLOSED | ui #alertsSummaryStats; TEAM_30 Batch 3 | TEAM_50_S002_P003_WP002_GATE4_CONSOLIDATED_REPORT_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-017 | Team 20/30 | CLOSED | api 422 target_id missing; ui #alertFormValidationSummary; Deep E2E | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-018 | Team 20/30 | CLOSED | api AlertUpdate/NoteUpdate target_type target_id; UI edit flow | TEAM_50_S002_P003_WP002_G7R_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-019 | Team 30 | CLOSED | ui phoenix-components.css #notesPageNumbers flex-wrap nowrap | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-020 | Team 30 | CLOSED | ui notesForm.js #noteAttachmentError inline | TEAM_50_G7_26BF_E2E_RESULTS.json | Team 50 | 2026-03-06 |
| BF-G7-021 | Team 30 | CLOSED | ui .notes-attachment-error | TEAM_50_G7_26BF_E2E_RESULTS.json | Team 50 | 2026-03-06 |
| BF-G7-022 | Team 30 | CLOSED | ui notesForm renderAttachmentsList | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-023 | Team 30 | CLOSED | ui notesTableInit getAttachmentDisplay; E2E attachment indicator | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-024 | Team 30 | CLOSED | ui notesTableInit.js buildAttachmentsHtml bindNoteAttachmentHandlers | TEAM_50_S002_P003_WP002_GATE3_BATCH3_VERIFICATION_v1.0.0.md; GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| BF-G7-025 | Team 20/30 | CLOSED | ui notesForm.js MAX_FILE_BYTES 2621440; hint 2.5MB | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |
| BF-G7-026 | Team 30/20 | CLOSED | ui refreshNotesTable/refreshAlertsTable; Deep E2E | TEAM_50_S002_P003_WP002_G7R_BATCH6_GATE4_CONSOLIDATED_RERUN_v1.0.0.md | Team 50 | 2026-03-06 |

---

## 3) מטריצה — רשימת פערים (19)

כל שורה: **id | owner | status | evidence_path | verification_report | verifier | closed_date**

| id | owner | status | evidence_path | verification_report | verifier | closed_date |
|----|-------|--------|---------------|----------------------|----------|-------------|
| gap-1 | Team 20+50 | CLOSED | ui tickersForm.js #tickerFormValidationSummary #tickerSymbolError; API 422 | TEAM_50_GATE3_BATCH3_VERIFICATION; GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| gap-2 | Team 30/20+50 | CLOSED | ui alertsTableInit.js formatAlertLinkedEntity | TEAM_50_GATE3_BATCH3_VERIFICATION; TEAM_30_BATCH3_COMPLETION | Team 50 | 2026-03-06 |
| gap-3 | Team 30+50 | CLOSED | ui notesTableInit.js buildAttachmentsHtml handleViewNote bindNoteAttachmentHandlers | TEAM_50_GATE3_BATCH3_VERIFICATION | Team 50 | 2026-03-06 |
| gap-4 | Team 30+50 | CLOSED | ui alertsTableInit notesTableInit linked_entity_display getEntityDetailUrl | TEAM_30_BATCH3_COMPLETION; GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| gap-5 | Team 30+50 | CLOSED | ui notesTableInit getAttachmentDisplay buildAttachmentsHtml | BATCH6_GATE4_RERUN; GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| gap-6 | Team 30+50 | CLOSED | ui refreshNotesTable refreshAlertsTable; Deep E2E | BATCH6_GATE4_RERUN | Team 50 | 2026-03-06 |
| gap-7 | Team 30 | CLOSED | ui .info-summary__row--notes-toggle; notes.html | TEAM_30_BATCH3_COMPLETION | Team 50 | 2026-03-06 |
| gap-8 | Team 30 | CLOSED | ui title/aria-label filters and actions | TEAM_30_BATCH3_COMPLETION | Team 50 | 2026-03-06 |
| gap-9 | Team 30+50 | CLOSED | ui notesForm.js !parentId block "יש לבחור ישות מקושרת" | GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| gap-10 | Team 30 | CLOSED | ui alertsForm.js form-row form-row--two-col | TEAM_30_BATCH3_COMPLETION | Team 50 | 2026-03-06 |
| gap-11 | Team 30 | CLOSED | ui PhoenixModal.js phoenix-btn--secondary phoenix-btn--primary | TEAM_30_BATCH3_COMPLETION | Team 50 | 2026-03-06 |
| gap-12 | Team 30/20+50 | CLOSED | ui notesForm.js create block when !parentId; API 422 | GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| gap-13 | Team 20/30+50 | CLOSED | api/UI price_source price_as_of_utc | GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| gap-14 (Auth) | Team 50 | CLOSED | — | CLOSED with canonical rationale; GATE4_CONSOLIDATED_REPORT §3 gap-14. **R-004:** נדרש PASS או החלטה חתומה — עדכון בהגשה. | Team 50 | 2026-03-06 |
| gap-15 | Team 20/30+50 | CLOSED | 26-BF remediation; D22 user_tickers; G7-FD/4 | GATE4_CONSOLIDATED_REPORT; BATCH6_RERUN | Team 50 | 2026-03-06 |
| gap-16 | Team 20+50 | CLOSED | D22 /me/tickers remediation | BATCH6_GATE4_RERUN | Team 50 | 2026-03-06 |
| gap-17 | Team 30 | CLOSED | ui Stream A add button modal | GATE4_CONSOLIDATED_REPORT | Team 50 | 2026-03-06 |
| gap-18 | Team 30 | CLOSED | ui userTickerTableInit.js "הוסף הערה לטיקר" openNotesForm | TEAM_30_BATCH3_COMPLETION | Team 50 | 2026-03-06 |
| gap-19 | Team 30 | CLOSED | ui notesForm.js form-readonly-value linked entity | TEAM_30_BATCH3_COMPLETION | Team 50 | 2026-03-06 |

---

## 4) מקור ונוֹעַל

- **מקור שורות:** TEAM_50_S002_P003_WP002_G5_BLOCK_CLOSURE_MATRIX_v1.0.0.md  
- **נעילה:** ארטיפקט זה הוא המקור המאושר היחיד למטריצת 26+19 בהגשת GATE_5 Re-validation (R-002).  
- **עדכונים:** עדכון שורות (למשל לאחר E2E 008/012/024 או חריג חתום) — במסמך זה או בגרסה v1.1.0.

---

**log_entry | TEAM_10 | G5_CLOSURE_MATRIX_LOCKED | R-002 | S002_P003_WP002 | 2026-03-06**
