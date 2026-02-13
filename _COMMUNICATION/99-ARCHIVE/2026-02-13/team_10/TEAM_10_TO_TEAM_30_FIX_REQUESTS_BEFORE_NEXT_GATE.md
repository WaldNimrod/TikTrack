# 🔴 Team 10 → Team 30: דרישות תיקון לפני מעבר לשער הבא (BLOCKING)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-01-30  
**סטטוס:** 🚫 **חוסם — אין מעבר לשער הבא לפני השלמת כל התיקונים**  
**מקור מדיניות:** `TEAM_10_BLOCKING_POLICY_NO_GATE_TRANSITION_UNTIL_FIXES.md`

---

## 1. מטרת ההודעה

חובה לתקן **את כל הבעיות שזוהו** לפני מימוש מעבר לשער הבא. להלן ריכוז דרישות התיקון הרלוונטיות ל־Team 30 והפניות למסמכים המפורטים.

---

## 2. רשימת תיקונים נדרשים

### 2.1 נתיבי אייקונים בדפי HTML (SEVERE ב־Gate B)

**מקור מלא:** `_COMMUNICATION/team_50/TEAM_50_GATE_B_DETAILED_ERROR_REPORT_AND_VERIFICATION_GUIDE.md` — סעיף 2.1.

**בעיה:** בדפי HTML (D16, D18, D21) יש שימוש בנתיבים כמו `../../../public/images/icons/...` — ב־Vite קבצים מ־`ui/public/` מוגשים מהשורש; הנתיב היחסי גורם ל־404 ו־SEVERE ב־Console.

**קבצים רלוונטיים:**
- `ui/src/views/financial/tradingAccounts/trading_accounts.html`
- `ui/src/views/financial/cashFlows/cash_flows.html`
- `ui/src/views/financial/brokersFees/brokers_fees.html`
- כל קובץ HTML שמכיל `../../../public/images` או דומה.

**תיקון נדרש:**
- **מ:** `../../../public/images/icons/...` או `../../../../ui/public/images/icons/...`
- **אל:** `/images/icons/...`

**דוגמה:**
```html
<!-- שגוי -->
<img src="../../../public/images/icons/entities/home.svg" ...>

<!-- תקין -->
<img src="/images/icons/entities/home.svg" ...>
```

**אימות:** טעינת D16, D18, D21 — 0 SEVERE ב־Console (למעט favicon).

---

### 2.2 Clean Slate Rule — D16_ACCTS_VIEW (10 הפרות)

**מקור מלא:**  
- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_D16_ACCTS_VIEW_QA_COMPLETE.md`  
- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_30_D16_ACCTS_VIEW_QA_ISSUES.md`

**בעיה:** 10 הפרות של Clean Slate Rule — inline event handlers (8), inline script (1), inline style (1).

**קובץ:** `ui/src/views/financial/D16_ACCTS_VIEW.html` (או הנתיב העדכני של דף D16 Trading Accounts).

**תיקונים נדרשים (תמצית):**
1. **הסרת כל inline event handlers** (8 מופעים) — מעבר ל־data attributes + event listeners בקובץ JS חיצוני (למשל ב־header-filters.js או קובץ ייעודי).
2. **העברת inline script לקובץ חיצוני** (סקריפט אתחול Table Managers).
3. **הסרת inline style** (למשל `style="display: none;"`) — שימוש ב־class ו־CSS.

**פירוט מלא, דוגמאות קוד ותבניות:** ראה `TEAM_50_TO_TEAM_30_D16_ACCTS_VIEW_QA_ISSUES.md`.

**אימות:** הרצת QA D16 מחדש — אין הפרות Clean Slate.

---

### 2.3 SEVERE נוספים (Gate B Re-Run) — אם רלוונטי

**מקור:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_GATE_B_RE_RUN_EVIDENCE.md`.

**ממצאים:**  
- `headerLoader.js`: "Failed to load unified-header.html" — NotFoundError (insertBefore).  
- `navigationHandler.js`: "Cannot use 'import.meta' outside a module".  
- favicon.ico — 404.

**פעולה:** אם הבעיות מופיעות בהרצת E2E על דפי HTML (נתיב בסיס שונה), לתקן את טעינת ה־Header ואת טעינת הסקריפטים (נתיבים/סוג מודול) כך שלא ייווצרו SEVERE. favicon — להוסיף קובץ או להחריג מבדיקת 0 SEVERE לפי הנהלים.

---

## 3. סדר ביצוע מומלץ

1. תיקון נתיבי אייקונים (סעיף 2.1) — משפיע ישירות על 0 SEVERE ב־D16/D18/D21.  
2. תיקון Clean Slate ב־D16 (סעיף 2.2).  
3. טיפול ב־headerLoader/navigationHandler/favicon (סעיף 2.3) אם עדיין מופיעים SEVERE בהרצה.

---

## 4. דיווח השלמה

לאחר ביצוע כל התיקונים — דיווח ל־Team 10 ב־`_COMMUNICATION/team_30/` (מסמך השלמה עם רשימת משימות שבוצעו וקבצים ששונו). Team 50 תריץ בדיקות מחדש לפי הנהלים.

---

**Team 10 (The Gateway)**  
**log_entry | FIX_REQUESTS_BEFORE_NEXT_GATE | TO_TEAM_30 | BLOCKING | 2026-01-30**
