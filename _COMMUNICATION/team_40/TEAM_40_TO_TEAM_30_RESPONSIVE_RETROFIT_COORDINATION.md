# Team 40 → Team 30: תיאום — Retrofit רספונסיביות (Option D)

**מאת:** Team 40 (UI Assets & Design)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-12  
**מקור:** `TEAM_10_TO_TEAM_40_OPEN_TASKS_ASSIGNMENT.md`, `ADR_010_PHASE_2_UNIFIED_CLOSURE_MANDATE.md`, `ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`

---

## 📋 Executive Summary

Team 40 מתחיל ביישום **משימה 1.3.1 — Retrofit רספונסיביות (Option D)**. מסמך זה מפרט את הדרישות, המצב הנוכחי, והתיאום הנדרש עם Team 30.

**סטטוס:** ⏳ **תיאום נדרש — יישום מתחיל**

---

## 1. מטרת המשימה

**מקור:** ADR-010 סעיף 1, `ARCHITECT_TABLE_RESPONSIVITY_DECISIONS.md`

**דרישות:**
- ✅ **כל הממשק בכל העמודים** רספונסיבי ואחיד
- ✅ **טבלאות (D16, D18, D21):** Sticky Start/End + Fluid (clamp)
- ✅ **שאר הממשק:** רספונסיביות ואחידות ויזואלית (layout, טיפוגרפיה, ריווח)
- ✅ **איסור:** `display:none` (למעט חריגים מוגדרים)

---

## 2. Option D — מפרט טכני

### 2.1 Sticky Isolation Protocol

**Sticky Start (מימין ב-RTL):**
- עמודות מזהה נשארות דבוקות בעת גלילה אופקית
- D16: `col-name` (שם החשבון מסחר)
- D18: `col-broker` (חשבון מסחר)
- D21: `col-trade` (טרייד)

**Sticky End (משמאל ב-RTL):**
- עמודות פעולות נשארות דבוקות בעת גלילה אופקית
- כל הטבלאות: `col-actions` (פעולות)

**CSS:**
```css
/* Sticky Start */
.phoenix-table__header.col-name,
.phoenix-table__cell.col-name {
  position: sticky;
  inset-inline-start: 0;
  background: var(--apple-bg-elevated, #ffffff);
  z-index: var(--z-index-sticky, 200);
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

/* Sticky End */
.phoenix-table__header.col-actions,
.phoenix-table__cell.col-actions {
  position: sticky;
  inset-inline-end: 0;
  background: var(--apple-bg-elevated, #ffffff);
  z-index: var(--z-index-sticky, 200);
  box-shadow: -2px 0 4px rgba(0, 0, 0, 0.1);
}
```

---

### 2.2 Fluid Weights עם clamp()

**מודל היברידי (Option D):**
- **Atomic (Fixed):** אייקונים ו-Checkboxes — רוחב קשיח ב-px/ch
- **Fluid (Weighted):** עמודות נתונים פיננסיים — שימוש ב-`clamp()` ו-`min-width`
- **Expansion (Flexible):** עמודות טקסט — סופגות את שארית הרוחב

**דוגמה ל-`clamp()`:**
```css
/* עמודה פיננסית — Fluid Weight */
.phoenix-table__cell.col-balance,
.phoenix-table__cell.col-amount {
  min-width: clamp(80px, 12%, 150px);
  width: clamp(80px, 12%, 150px);
}

/* עמודת טקסט — Expansion */
.phoenix-table__cell.col-description {
  min-width: clamp(120px, 20%, 300px);
  /* width: auto — סופגת שארית */
}
```

---

### 2.3 איסור display:none

**חובה:** לא להסתיר עמודות עם `display: none` (למעט חריגים מוגדרים).

**חריגים מותרים:**
- אלמנטים UI זמניים (למשל: `.info-summary__row--second` עם toggle)
- אלמנטים נסתרים ל-screen readers (למשל: `.phoenix-table__header.col-actions .phoenix-table__header-text`)

---

## 3. מצב נוכחי — בדיקה ראשונית

### 3.1 Sticky Columns — ✅ קיים

**מה קיים ב-`phoenix-components.css`:**
- ✅ `.col-name` — Sticky Start (D16)
- ✅ `.col-symbol` — Sticky Start (פוזיציות)
- ✅ `.col-broker` — Sticky Start (D18)
- ✅ `.col-trade` — Sticky Start (D21)
- ✅ `.col-actions` — Sticky End (כל הטבלאות)

**סטטוס:** ✅ **Sticky columns מוגדרים נכון**

---

### 3.2 Fluid Design — ⚠️ חלקי

**מה קיים:**
- ✅ `clamp()` בשימוש ב-container padding (`clamp(12px, 1.5vw, 16px)`)
- ✅ `clamp()` בשימוש ב-gaps (`clamp(12px, 1.5vw, 16px)`)
- ✅ `clamp()` בשימוש ב-font sizes (`clamp(0.875rem, 1.5vw, 0.92rem)`)

**מה חסר:**
- ⚠️ **רוחב עמודות:** אין `clamp()` לרוחב עמודות בטבלאות
- ⚠️ **min-width:** אין `min-width` עם `clamp()` לעמודות פיננסיות

**סטטוס:** ⚠️ **נדרש להוסיף `clamp()` לרוחב עמודות**

---

### 3.3 display:none — ✅ מותר (חריג)

**מה נמצא:**
- ✅ `.info-summary__row--second { display: none; }` — **מותר** (toggle element)

**סטטוס:** ✅ **אין `display:none` שצריך להסיר**

---

## 4. טבלאות — מיפוי עמודות

### 4.1 D16 — Trading Accounts (חשבונות מסחר)

**עמודות:**
1. `col-name` — **Sticky Start** ✅
2. `col-currency` — Fluid (clamp נדרש)
3. `col-balance` — Fluid (clamp נדרש)
4. `col-positions` — Fluid (clamp נדרש)
5. `col-total-pl` — Fluid (clamp נדרש)
6. `col-account-value` — Fluid (clamp נדרש)
7. `col-holdings-value` — Fluid (clamp נדרש)
8. `col-status` — Fixed/Atomic
9. `col-updated` — Fluid (clamp נדרש)
10. `col-actions` — **Sticky End** ✅

**קובץ:** `ui/src/views/financial/tradingAccounts/trading_accounts.html`

---

### 4.2 D18 — Brokers Fees (ברוקרים ועמלות)

**עמודות:**
1. `col-broker` — **Sticky Start** ✅
2. `col-commission-type` — Fluid (clamp נדרש)
3. `col-commission-value` — Fluid (clamp נדרש)
4. `col-minimum` — Fluid (clamp נדרש)
5. `col-actions` — **Sticky End** ✅

**קובץ:** `ui/src/views/financial/brokersFees/brokers_fees.html`

---

### 4.3 D21 — Cash Flows (תזרים מזומנים)

**עמודות:**
1. `col-trade` — **Sticky Start** ✅
2. `col-account` — Fluid (clamp נדרש)
3. `col-type` — Fixed/Atomic
4. `col-amount` — Fluid (clamp נדרש)
5. `col-date` — Fluid (clamp נדרש)
6. `col-description` — Expansion (clamp נדרש)
7. `col-source` — Fluid (clamp נדרש)
8. `col-updated` — Fluid (clamp נדרש)
9. `col-actions` — **Sticky End** ✅

**קובץ:** `ui/src/views/financial/cashFlows/cash_flows.html`

---

## 5. תיאום נדרש עם Team 30

### 5.1 בדיקות פונקציונליות

**Team 30 נדרש לבדוק:**
1. ✅ Sticky columns עובדים נכון (גלילה אופקית)
2. ✅ רספונסיביות — הטבלאות נראות טוב בכל הגדלי מסך
3. ✅ אין overflow אופקי לא רצוי
4. ✅ עמודות פעולות נגישות תמיד (Sticky End)

---

### 5.2 מבנה HTML/DOM

**Team 30 נדרש לוודא:**
1. ✅ Classes נכונים — כל עמודה עם class מתאים (`col-name`, `col-actions`, וכו')
2. ✅ DOM order נכון — Sticky Start ראשון, Sticky End אחרון
3. ✅ אין שינוי מבנה HTML שישבור את Sticky columns

---

### 5.3 אינטגרציה

**Team 30 נדרש לוודא:**
1. ✅ אין CSS override שמבטל Sticky columns
2. ✅ אין JavaScript שמשנה `display` או `position` של עמודות
3. ✅ אין inline styles שמתנגשים עם CSS

---

## 6. תוכנית עבודה — Team 40

### שלב 1: יצירת מפרט CSS מפורט ⏳

**פעולות:**
1. ⏳ הגדרת `clamp()` לרוחב כל עמודה (D16, D18, D21)
2. ⏳ הגדרת `min-width` עם `clamp()` לעמודות פיננסיות
3. ⏳ הגדרת `min-width` עם `clamp()` לעמודות טקסט (Expansion)

**תוצר:** מפרט CSS מפורט לכל טבלה

---

### שלב 2: יישום CSS ⏳

**פעולות:**
1. ⏳ עדכון `phoenix-components.css` עם `clamp()` לרוחב עמודות
2. ⏳ הוספת `min-width` עם `clamp()` לעמודות פיננסיות
3. ⏳ בדיקות CSS

**תוצר:** CSS מעודכן

---

### שלב 3: בדיקות ואימות ⏳

**פעולות:**
1. ⏳ בדיקות רספונסיביות בכל העמודים
2. ⏳ בדיקות Sticky columns בטבלאות
3. ⏳ בדיקות Fluid Design (`clamp()`)
4. ⏳ בדיקות RTL

**תוצר:** דוח בדיקות + אישור מוכנות

---

## 7. שאלות ל-Team 30

1. **מבנה HTML:** האם מבנה ה-HTML של הטבלאות תואם את ה-classes (`col-name`, `col-actions`, וכו')?
2. **JavaScript:** האם יש JavaScript שמשנה `display` או `position` של עמודות?
3. **CSS Override:** האם יש CSS override שמתנגש עם Sticky columns?
4. **בדיקות:** מתי Team 30 יכול לבצע בדיקות פונקציונליות?

---

## 8. הבא

1. ⏳ Team 40: יצירת מפרט CSS מפורט
2. ⏳ Team 40: יישום CSS
3. ⏳ Team 30: בדיקות פונקציונליות
4. ⏳ Team 40: בדיקות ואימות

---

**Team 40 (UI Assets & Design)**  
**Date:** 2026-02-12  
**Status:** ⏳ **COORDINATION REQUESTED — IMPLEMENTATION STARTING**

**log_entry | TEAM_40 | RESPONSIVE_RETROFIT_COORDINATION | TEAM_30 | 2026-02-12**
