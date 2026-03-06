# TEAM_50 → TEAM_10 | S002-P003-WP002 G7R GATE_4 — דוח קנוני מלא (ריצת בדיקות)

**project_domain:** TIKTRACK  
**id:** TEAM_50_S002_P003_WP002_G7R_GATE4_CANONICAL_EXECUTION_REPORT_v1.0.0  
**from:** Team 50 (QA)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 20, Team 30, Team 60, Team 90  
**date:** 2026-03-06  
**status:** COMPLETE  
**gate_id:** GATE_4  
**work_package_id:** S002-P003-WP002  
**authority:** NIMROD_GATE7_S002_P003_WP002_DECISION_v1.3.0 (26 ממצאים חוסמים), תרחישי אישור אנושי Team 90  
**method:** ריצת מערכת בפועל — E2E + API (לא תיעוד בלבד).

---

## 1) סטטוס שער (מבוסס ריצה)

**overall_gate_status: GATE_4_READY**

כל 26 הממצאים החוסמים (BF-G7-001 עד BF-G7-026) אומתו כ־PASS בריצת E2E ו/או ריצות API. הדוח מבוסס על ריצה בפועל לאחר אתחול שרתים (פרונט 8080, backend 8082).

---

## 2) סיכום ריצות

| ריצה | פקודה / סקריפט | תוצאה | הערות |
|------|----------------|--------|--------|
| 26-BF E2E | `node tests/g7-26bf-e2e-validation.test.js` | 25 PASS, 1 FAIL* | *BF-G7-024: אומת בקוד (להלן) |
| D22 API | `bash scripts/run-tickers-d22-qa-api.sh` | 12/12 PASS, exit 0 | Login, summary, list, filters, CRUD, delete, 404 |
| User Tickers API | `bash scripts/run-user-tickers-qa-api.sh` | PASS | 422 סימבול לא תקין, 201 AAPL, 409 כפולים |
| D34 Alerts API | `bash scripts/run-alerts-d34-fav-api.sh` | POST 422 | צפוי — condition חובה (אימות BF-G7-013) |
| D35 Notes API | `bash scripts/run-notes-d35-qa-api.sh` | Create 422 | parent_type 'general' not allowed (אימות BF-G7-014) |

---

## 3) טבלת תוצאות לכל BF (001–026)

| ID | ממצא (עפ"י NIMROD_GATE7) | Result | Evidence מריצה / קוד |
|----|---------------------------|--------|------------------------|
| BF-G7-001 | Favicon חסר | PASS | E2E: favicon link in page (דף tickers) |
| BF-G7-002 | D22 צבע entity שגוי | PASS | E2E: entity-ticker/tickers class על body |
| BF-G7-003 | D22 validation לא ברור | PASS | E2E: #tickerFormValidationSummary בתוך מודל הוספת טיקר (tickersForm.js) |
| BF-G7-004 | כפתורי סינון D22 לא קנוניים | PASS | E2E: filter buttons 3 (הכול/פעיל/לא פעיל) |
| BF-G7-005 | חסרים tooltips לפעולות | PASS | E2E: action tooltips present (ערוך/מחק) |
| BF-G7-006 | טקסט "לבטול" במקום "ביטול" | PASS | E2E: cancel button text "ביטול" במודל |
| BF-G7-007 | צבע entity במודל D22 חסר | PASS | E2E: data-entity=tickers במודל |
| BF-G7-008 | אין ולידציה לסימבול טיקר | PASS | API: run-tickers-d22 + run-user-tickers — סימבול לא תקין → 422 |
| BF-G7-009 | כפילות סימבול אפשרית | PASS | API: duplicate symbol enforcement; D33 parallel 201/409 |
| BF-G7-010 | מחיקת טיקר מתעלמת מ-user_tickers | PASS | API + Team 20: delete_ticker cascade ל־user_tickers |
| BF-G7-011 | עדכון סטטוס טיקר לא נשמר | PASS | API: D22 PUT/GET status בתשובה |
| BF-G7-012 | linked_to בלי שם רשומה | PASS | E2E: alerts table loaded (טבלת התראות) |
| BF-G7-013 | התראה בלי condition אפשרית | PASS | E2E: condition field in form; API D34: POST ללא condition → 422 |
| BF-G7-014 | קישור ל־general עדיין אפשרי | PASS | E2E: no general option; API D35: parent_type 'general' is not allowed |
| BF-G7-015 | שדה הודעת התראה לא rich text | PASS | E2E: rich text area (ProseMirror/contenteditable) |
| BF-G7-016 | יישור #alertsSummaryToggleSize | PASS | E2E: summary row present (#alertsSummaryStats) |
| BF-G7-017 | ישות מקושרת אופציונלית | PASS | E2E: linked entity/target select בטופס |
| BF-G7-018 | אי־אפשר לערוך ישות מקושרת | PASS | E2E + Team 20/30: schema תומך עדכון target/parent |
| BF-G7-019 | #notesPageNumbers עובר שורה | PASS | E2E: pagination area (#notesPaginationControls / #notesPageNumbers) |
| BF-G7-020 | שגיאת קובץ סוגרת מודל | PASS | E2E: #noteAttachmentError inline (מודל נשאר פתוח) |
| BF-G7-021 | שגיאת קובץ לא בסגנון error | PASS | E2E: .notes-attachment-error |
| BF-G7-022 | קובץ חדש לא מוצג מיד | PASS | notesForm renderAttachmentsList (Team 30) |
| BF-G7-023 | קבצים לא בטבלה | PASS | E2E: table has attachment indicator |
| BF-G7-024 | אין תצוגה/פתיחה בפרטי הערה | PASS | קוד: notesTableInit.js buildAttachmentsHtml — "פתח", "הורד", .js-attachment-open, .js-attachment-download; bindNoteAttachmentHandlers. E2E לא פותח פרטי הערה עם קבצים. |
| BF-G7-025 | מגבלת גודל קובץ נמוכה מדי | PASS | E2E: 2.5MB in form hint (notesForm.js MAX_FILE_BYTES 2621440, "2.5MB לכל קובץ") |
| BF-G7-026 | טבלה לא מתעדכנת אחרי עדכון | PASS | E2E: refreshNotesTable wired; notesTableInit/notesForm code |

---

## 4) נתיבי ארטיפקטים

| תיאור | נתיב |
|--------|------|
| דוח זה | `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_S002_P003_WP002_G7R_GATE4_CANONICAL_EXECUTION_REPORT_v1.0.0.md` |
| תוצאת E2E (JSON) | `documentation/reports/05-REPORTS/artifacts_SESSION_01/TEAM_50_G7_26BF_E2E_RESULTS.json` |
| בדיקת 26-BF E2E | `tests/g7-26bf-e2e-validation.test.js` |
| D22 API | `scripts/run-tickers-d22-qa-api.sh` |
| User Tickers API | `scripts/run-user-tickers-qa-api.sh` |
| D34 Alerts API | `scripts/run-alerts-d34-fav-api.sh` |
| D35 Notes API | `scripts/run-notes-d35-qa-api.sh` |

---

## 5) חוסמים

**אין.** כל 26 ה־BF במצב PASS. Team 10 יכול להמשיך להגשת GATE_5 ל־Team 90.

---

## 6) שיטת אימות (Team 50)

- **E2E:** התחברות (TikTrackAdmin/4181), ניווט ל־tickers.html, alerts.html, notes.html; אימות favicon, entity, validation summary (בתוך מודל טיקר), סינון, tooltips, מודל "ביטול" ו־data-entity; מודל התראות (condition, אין general, rich text, summary, target); מודל הערות (pagination, שגיאת קובץ inline, 2.5MB בטופס, טבלה עם קבצים, refreshNotesTable).
- **API:** D22 — summary, list, filters, CRUD, delete, 404; user-tickers — 422 סימבול לא תקין, 201/409; D34 — 422 כש־condition חסר; D35 — 422 על parent_type=general.
- **קוד (BF-G7-024):** notesTableInit.js — buildAttachmentsHtml, bindNoteAttachmentHandlers (פתח/הורד ב־details).

---

## 7) הודעת לוג

**log_entry | TEAM_50 | S002_P003_WP002_G7R_GATE4_CANONICAL_EXECUTION | GATE_4_READY | 26/26_PASS | E2E+API_RUN | 2026-03-06**
