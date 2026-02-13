# דוח Team 50 → Team 30: בדיקות טופסי CRUD (D18, D21)

**אל:** Team 30 (Frontend Execution)  
**מאת:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-01-31  
**מקור:** `TEAM_30_TO_TEAM_50_CRUD_FORMS_QA_REQUEST.md`  
**סטטוס:** ✅ **Phase 1 אוטומטי הושלם** | ⚠️ **ממצא אחד לד follow-up**

---

## 1. Executive Summary

בוצעו בדיקות QA לפי בקשת Team 30: איתחול שרתים (`scripts/init-servers-for-qa.sh`), הרצת סוויטת E2E (Phase 2) כולל בדיקות כפתורי CRUD ומודל טופס.

**תוצאות:**
- **כפתור "הוסף ברוקר" (D18):** ✅ פותח מודל טופס עם טופס (`#phoenix-modal`, `#brokerFeeForm`) — **PASS**
- **כפתור "הוסף תזרים" (D21):** ✅ פותח מודל טופס עם טופס (`#cashFlowForm`) — **PASS**
- **מילוי טופס D18 + שמירה (אוטומטי):** ❌ **FAIL** — לאחר מילוי שדות ולחיצה על "שמור" מופיע alert: `"אנא מלא את כל השדות הנדרשים"` (תגובת 422 מה-API). יש לבדוק מיפוי שדות או ולידציה ב-API.
- **יתר הבדיקות:** D16, D18, D21 טעינת עמוד, CRUD API detection, Security, Routes — **PASS**

**ראיות ריצה:**  
`documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/`  
(console_logs.json, test_summary.json)

---

## 2. רשימת בדיקות — Quick Checklist (מבחינת אוטומציה וריצה)

### D18 (Brokers Fees)
| בדיקה | סטטוס | הערה |
|--------|--------|------|
| כפתור "הוסף ברוקר" פותח מודל טופס | ✅ | אומת ב-E2E (testCRUDButtonsD18) |
| כפתור "ערוך" פותח מודל טופס עם נתונים | ⏸️ | לא הורצה אוטומטית (ידני) |
| ולידציה (שדות חובה) | ⏸️ | ידני |
| שמירה (POST) | ❌ | E2E מילוי+שמירה קיבל 422 → alert "אנא מלא את כל השדות הנדרשים" |
| הטבלה מתעדכנת לאחר שמירה | ⏸️ | תלוי בשמירה |
| אין alert שגיאה כשהטופס תקין | ❌ | כרגע מופיע alert (422) |

### D21 (Cash Flows)
| בדיקה | סטטוס | הערה |
|--------|--------|------|
| כפתור "הוסף תזרים" פותח מודל טופס | ✅ | אומת ב-E2E (testCRUDButtonsD21) |
| כפתור "ערוך" פותח מודל עם נתונים | ⏸️ | ידני |
| שמירה / טבלה מתעדכנת | ⏸️ | לא נבדק אוטומטית |

### פונקציונליות מודל
| בדיקה | סטטוס | הערה |
|--------|--------|------|
| כפתור X / ביטול / click-outside / ESC | ⏸️ | ידני (לא אוטומציה) |
| Focus על השדה הראשון | ⏸️ | ידני |

---

## 3. פירוט ממצא — שמירת טופס D18 (422)

**תרחיש:** התחברות → brokers_fees → "הוסף ברוקר" → מילוי: שם ברוקר, ערך עמלה (`0.0035 $ / Share`), מינימום `1`, סוג עמלה (ברירת מחדל TIERED) → "שמור".

**תוצאה:** מופיע alert: `"אנא מלא את כל השדות הנדרשים"`.  
**מקור בהודעות:** `brokersFeesTableInit.js` — ה-catch על שגיאת API (קוד 422 / VALIDATION_FIELD_REQUIRED) מציג את ההודעה הזו.

**השערה:** ה-API מחזיר 422 (Validation Error). ייתכן:
- מיפוי שדות (camelCase ↔ snake_case) לא מלא או שגוי בנתוני הטופס
- שדה חובה חסר או בפורמט לא מקובל ב-API
- בעיית timing (הטופס נשלח לפני עדכון מלא של הערכים)

**המלצה:** לבדוק ב-Network tab את גוף ה-POST ל-`/api/v1/brokers_fees` ואת תגובת 422 (פירוט השדות שנכשלו). אם ה-API מחזיר פרטי ולידציה — להציג אותם בממשק במקום הודעה גנרית.

---

## 4. סיכום הרצת E2E

```
Total Tests: 36
✅ Passed: 24
❌ Failed: 1 (CRUD_D18_FormSave)
Pass Rate: 66.67%
```

**בדיקות CRUD Forms רלוונטיות:**
- CRUD_Buttons_D18 — PASS (מודל נפתח)
- CRUD_Buttons_D21 — PASS (מודל נפתח)
- CRUD_D18_FormSave — FAIL (שמירה → 422 → alert)

---

## 5. המלצות

1. **טיפול ב-422:** לאתר את סיבת 422 ב-POST brokers_fees (גוף הבקשה מול סכמת ה-API) ולוודא ששמירה מהטופס עובדת בידני ובאוטומציה.
2. **הודעות שגיאה:** אם ה-API מחזיר פרטי ולידציה (שדות ספציפיים) — להציג אותם בממשק.
3. **סבב מלא (Phase 2):** לאחר תיקון שמירת D18 (ו-D21 אם רלוונטי) — להריץ סבב בדיקות מלא ידני לפי הרשימה ב-`TEAM_30_TO_TEAM_50_CRUD_FORMS_QA_REQUEST.md` (עריכה, מחיקה, צפייה, ולידציה, מודל X/ביטול/ESC).

---

## 6. קבצים וארטיפקטים

- **בקשת בדיקות:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_50_CRUD_FORMS_QA_REQUEST.md`
- **ארטיפקטים E2E:** `documentation/05-REPORTS/artifacts_SESSION_01/phase2-e2e-artifacts/`
- **סקריפט איתחול:** `scripts/init-servers-for-qa.sh`
- **בדיקות:** `tests/phase2-e2e-selenium.test.js` (כולל testCRUDButtonsD18, testCRUDButtonsD21, testCRUDD18FormSave)

---

**Team 50 (QA & Fidelity)**  
**log_entry | TO_TEAM_30 | CRUD_FORMS_QA_REPORT | SENT | 2026-01-31**
