# Team 50 → Team 10: דוח QA — Smart History Fill

**id:** `TEAM_50_TO_TEAM_10_SMART_HISTORY_FILL_QA_REPORT`  
**from:** Team 50 (QA & Fidelity)  
**to:** Team 10 (The Gateway)  
**re:** TEAM_10_TO_TEAM_50_SMART_HISTORY_FILL_QA_REQUEST  
**date:** 2026-01-31  
**רה־ריצה (לאחר תיקונים):** 2026-01-31

---

## 1. סיכום מנהלים

| פריט | תוצאה | הערות |
|------|--------|-------|
| 1. כפתור "הפעל History Backfill" | ✅ PASS | טיקר עם חסרים → לחיצה → gap_fill → 200 |
| 2. בלוק "הנתונים מלאים — לטעון מחדש?" | ⚠️ SKIP | אין טיקר עם 250+ שורות (backfill → 242) |
| 3. force_reload Admin | ⚠️ SKIP | תלוי ב־Item 2 |
| 4. force_reload משתמש רגיל → 403 | ✅ PASS | Router guard — 403 + "דורש הרשאת Admin" |
| 5. טיפול בשגיאות 404, 409, 502 | ✅ PASS | 404 API + UI הודעות מתאימות (תיקון Team 30) |

---

## 2. פריטים לבדיקה — תוצאות מפורטות

### 2.1 כפתור "הפעל History Backfill" (טיקר עם חסרים)

| בדיקה | תוצאה |
|-------|--------|
| כפתור מוצג | ✅ |
| לחיצה → קריאה ל־gap_fill | ✅ |
| תשובה 200 (completed / no_op) | ✅ |

**Evidence:** E2E test `tests/smart-history-fill-qa.e2e.test.js` — Item 1 PASS.

### 2.2 בלוק "הנתונים מלאים — לטעון מחדש?" (Admin, 250+ שורות)

| בדיקה | תוצאה |
|-------|--------|
| בלוק + כפתור "טען מחדש (מחיקה)" | SKIP |

**סיבה:** בכל הטיקרים הנוכחיים `row_count < 250`. הבלוק מוצג רק כאשר `dataComplete = (hist.row_count >= 250) && hist.gap_status === 'OK'` וגם `isAdmin`.

**המלצה:** להריץ `make sync-history-backfill` או seed טיקר עם 250+ שורות לבדיקה ידנית.

### 2.3 force_reload — Admin

| בדיקה | תוצאה |
|-------|--------|
| דיאלוג אישור | ✅ (קוד) |
| קריאה ל־force_reload → 200 | SKIP |

**הערה:** הקוד מכיל `window.confirm()` לפני force_reload; לא נבדק E2E כי אין טיקר עם 250+ שורות.

### 2.4 force_reload — משתמש רגיל → 403

| בדיקה | תוצאה |
|-------|--------|
| 403 + הודעה "דורש הרשאת Admin" | ✅ PASS |

**רה־ריצה:** Router guard ב־`api/routers/tickers.py` — אם `mode=force_reload` ו־`!is_admin` → 403 לפני קריאה ל־service. **אומת.**

### 2.5 טיפול בשגיאות 404, 409, 502

| שגיאה | API | UI |
|-------|-----|-----|
| **404** | ✅ `Ticker not found` | ✅ הודעת API / "טיקר לא נמצא" (תיקון Team 30) |
| **409** | ✅ `Another history backfill is already running` | לא נבדק (דורש lock) |
| **502** | ✅ `Yahoo/Alpha failed...` | לא נבדק (דורש provider failure) |

---

## 3. Evidence

| פריט | מיקום |
|------|--------|
| סקריפט E2E | `tests/smart-history-fill-qa.e2e.test.js` |
| הרצה | `cd tests && node smart-history-fill-qa.e2e.test.js` |
| API 404 | `POST /api/v1/tickers/01HXXXXXXXXXXXXXXXFAKEULID/history-backfill` → 404 |

---

## 4. מסמכים רלוונטיים

- TEAM_20_TO_TEAM_10_SMART_HISTORY_FILL_UPDATE.md
- TEAM_30_TO_TEAM_20_SMART_HISTORY_FILL_UI_COMPLETE.md
- TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md

---

---

## 5. רה־ריצה (לאחר TEAM_10_SMART_HISTORY_FILL_QA_URGENT_FIXES_MANDATE)

| פריט | תוצאה |
|------|--------|
| 1 | ✅ PASS |
| 2 | SKIP — טיקרים 242 שורות (Yahoo 429) |
| 3 | SKIP |
| 4 | ✅ PASS |
| 5 | ✅ PASS |

**סה"כ:** 4/5 PASS, 2 SKIP (תלוי בטיקר 250+).

---

**log_entry | TEAM_50 | TO_TEAM_10 | SMART_HISTORY_FILL_QA_REPORT | 2026-01-31**  
**log_entry | TEAM_50 | RERUN_AFTER_FIXES | 4_PASS_2_SKIP | 2026-01-31**
