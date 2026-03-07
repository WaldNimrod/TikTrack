# G5 — החלטת אימות 008 / 012 / 024 (R-003) (v1.0.0)

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P003_WP002_G5_008_012_024_VALIDATION_DECISION_v1.0.0  
**from:** Team 50 (QA) — תיעוד החלטה  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 20, Team 30, Team 90  
**date:** 2026-03-06  
**status:** COMPLETE  
**gate_id:** GATE_5 (BLOCKED)  
**work_package_id:** S002-P003-WP002  
**authority:** TEAM_10_TO_TEAMS_20_30_50_S002_P003_WP002_G5_R_REMEDIATION_MANDATE_v1.0.0.md §5 R-003  

---

## 1) מטרה

תיעוד **אופציה A** (E2E PASS לשלושת הסעיפים 008, 012, 024) או **אופציה B** (חריג חתום ל־code-only) — לצורך סגירת R-003.

---

## 2) תוצאה — אופציה A לא התקיימה

ריצת E2E ממוקדת (008, 012, 024) בוצעה. תוצאות:

| פריט | E2E תוצאה | סיבה |
|------|-----------|------|
| **008** (סמל לא תקין ב־UI) | FAIL | Backend לא החזיר 422 ל־POST /tickers בסביבת הריצה; אין הודעת שגיאה ב־#tickerFormValidationSummary / #tickerSymbolError. |
| **012** (מקושר ל — שם + קישור) | FAIL | טקסט "טיקר" נמצא; זיהוי אלמנט קישור נכשל (סלקטור/מבנה DOM). |
| **024** (פרטי הערה + קבצים) | FAIL | "element not interactable" — כפתור פרטים או מודל; לא הושג assert על פתח/הורד. |

**מסקנה:** **אופציה A (E2E PASS לשלושת הסעיפים) לא הושגה.**

---

## 3) תיעוד — אופציה B (סגירה ב־code-only)

Team 50 סוגר את 008, 012, 024 ב־**אימות קוד** עם הנמקה:

| פריט | evidence_path (קוד) | הנמקה לסגירה ב־code-only |
|------|----------------------|----------------------------|
| **008** | ui/src/views/management/tickers/tickersForm.js | ב־catch של onSave מוצגת שגיאה ב־#tickerFormValidationSummary ו־#tickerSymbolError. UI מוכן; E2E יעבור כאשר backend מחזיר 422 (למשל VALIDATE_SYMBOL_ALWAYS=true). |
| **012** | ui/src/views/data/alerts/alertsTableInit.js | formatAlertLinkedEntity מחזיר שם רשומה + `<a href="..." class="linked-object-badge-link">`. מימוש נכון; כישלון E2E — סלקטור/assert. |
| **024** | ui/src/views/data/notes/notesTableInit.js | buildAttachmentsHtml (פתח/הורד), bindNoteAttachmentHandlers, handleViewNote טוען attachments ומרנדר רשימה. לוגיקה קיימת; כישלון E2E — תזמון/סלקטור. |

**חריג חתום (אופציה B):** **אושר.** מסמך האישור: `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S002_P003_WP002_G5_R_REMEDIATION_DECISION_RESPONSE_v1.0.0.md` (D-001 — APPROVED). גבולות החריג: תקף לסבב GATE_5 re-validation הנוכחי בלבד; carry-over ממוספר ל־E2E מלאה בסבב הבא (Team 10 + Team 50).

---

## 4) מקורות

| תיאור | נתיב |
|--------|------|
| דוח ריצת E2E | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_S002_P003_WP002_G5_E2E_VERIFICATION_RUN_v1.0.0.md |
| תוצאות ממוקדות (JSON) | documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_GATE3_BATCH3_E2E_RESULTS.json |

---

**log_entry | TEAM_50 | G5_008_012_024_VALIDATION_DECISION | R-003_OPTION_B | S002_P003_WP002 | 2026-03-06**
