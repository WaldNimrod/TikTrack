# 🎨 Team 40 → Team 30: תיאום — יישום סטנדרט D16 Reference (D18/D21)

**מאת:** Team 40 (UI Assets & Design)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-12  
**הקשר:** SSOT `D16_MODULE_REFERENCE_SSOT.md` — יישום סטנדרט D16 על כל המודולים

---

## 📋 Executive Summary

Team 40 עדכן את קבצי ה-JavaScript של D18 ו-D21 כדי להתאים לסטנדרט D16 Reference. נדרש מ-Team 30 לבדוק את השינויים ולוודא שהכל עובד נכון.

**סטטוס:** ✅ **עדכונים הושלמו — נדרשת בדיקה מ-Team 30**

---

## 1. הקשר

**SSOT:** `documentation/09-GOVERNANCE/standards/D16_MODULE_REFERENCE_SSOT.md`

**משימה:** התאמת כל המודולים (D18, D21) לסטנדרט D16 Reference שהוגדר כרפרנס רשמי.

**מה בוצע:** Team 40 עדכן את קבצי ה-JavaScript של D18 ו-D21 כדי להתאים לסטנדרט.

---

## 2. שינויים שבוצעו

### 2.1 D18 (Brokers Fees) — עודכן ✅

**קובץ:** `ui/src/views/financial/brokersFees/brokersFeesForm.js`

**שינויים:**
1. ✅ הוספת מחלקה: `phoenix-form--two-col` (תואם D16)
2. ✅ החלפת `*` ב-`<span class="form-label-asterisk">*</span>` (כל השדות החובה)
3. ✅ הוספת פריסה דו-עמודתית: `.form-row` עם שני `.form-group`
   - שורה 1: סוג עמלה | ערך עמלה

**מבנה חדש:**
```html
<form id="brokerFeeForm" class="phoenix-form phoenix-form--two-col">
  <!-- שורה 1: חשבון מסחר (מלא רוחב) -->
  <div class="form-group">
    <label for="tradingAccountId">חשבון מסחר <span class="form-label-asterisk">*</span></label>
    <select id="tradingAccountId" name="tradingAccountId" required>...</select>
  </div>
  
  <!-- שורה 2: דו-עמודתי -->
  <div class="form-row">
    <div class="form-group">
      <label for="commissionType">סוג עמלה <span class="form-label-asterisk">*</span></label>
      <select id="commissionType" name="commissionType" required>...</select>
    </div>
    <div class="form-group">
      <label for="commissionValue">ערך עמלה <span class="form-label-asterisk">*</span></label>
      <input type="number" id="commissionValue" name="commissionValue" required />
    </div>
  </div>
  
  <!-- שורה 3: מינימום (מלא רוחב) -->
  <div class="form-group">
    <label for="minimum">מינימום לפעולה (USD) <span class="form-label-asterisk">*</span></label>
    <input type="number" id="minimum" name="minimum" required />
  </div>
</form>
```

---

### 2.2 D21 (Cash Flows) — עודכן ✅

**קובץ:** `ui/src/views/financial/cashFlows/cashFlowsForm.js`

**שינויים:**
1. ✅ הוספת מחלקה: `phoenix-form--two-col` (תואם D16)
2. ✅ החלפת `*` ב-`<span class="form-label-asterisk">*</span>` (כל השדות החובה)
3. ✅ הוספת פריסה דו-עמודתית: `.form-row` עם שני `.form-group`
   - שורה 1: תאריך תנועה | סוג תנועה
   - שורה 2: סכום | מטבע

**מבנה חדש:**
```html
<form id="cashFlowForm" class="phoenix-form phoenix-form--two-col">
  <!-- שורה 1: חשבון מסחר (מלא רוחב) -->
  <div class="form-group">...</div>
  
  <!-- שורה 2: דו-עמודתי -->
  <div class="form-row">
    <div class="form-group">תאריך תנועה *</div>
    <div class="form-group">סוג תנועה *</div>
  </div>
  
  <!-- שורה 3: דו-עמודתי -->
  <div class="form-row">
    <div class="form-group">סכום *</div>
    <div class="form-group">מטבע *</div>
  </div>
  
  <!-- שורה 4: תיאור (Rich-Text) -->
  <div class="form-group">תיאור</div>
  
  <!-- שורה 5: מזהה חיצוני -->
  <div class="form-group">מזהה חיצוני</div>
</form>
```

---

## 3. פעולות נדרשות מ-Team 30

### 3.1 בדיקה פונקציונלית ⏳

**לבדוק:**
1. ⏳ האם המודלים נפתחים נכון?
2. ⏳ האם השדות נטענים נכון (עם ערכים קיימים בעריכה)?
3. ⏳ האם הולידציה עובדת נכון?
4. ⏳ האם הכפתורים עובדים נכון (שמירה/ביטול)?

**קבצים לבדיקה:**
- `ui/src/views/financial/brokersFees/brokersFeesForm.js`
- `ui/src/views/financial/cashFlows/cashFlowsForm.js`

---

### 3.2 בדיקה ויזואלית ⏳

**לבדוק:**
1. ⏳ האם הפריסה הדו-עמודתית נראית נכון?
2. ⏳ האם הכוכבית מוצגת בצבע אדום (`var(--color-error-red)`)?
3. ⏳ האם הריווח בין עמודות נכון (`gap: 21px`)?
4. ⏳ האם השדות בגובה אחיד (input ו-select)?

**מה לבדוק:**
- פתיחת מודל D18 — "הוספת עמלה לחשבון"
- פתיחת מודל D21 — "הוספת תזרים חדש"
- השוואה ויזואלית ל-D16 — האם נראה זהה?

---

### 3.3 דיוק ויזואלי מול G-Lead ⏳

**דרישה:** סבב דיוק ויזואלי מול G-Lead על D18 ו-D21 (לאחר אישור D16).

**מה לבדוק:**
- פריסה דו-עמודתית תואמת ל-D16
- כוכבית בצבע נכון
- כפתורים תואמים (RTL order, צבעים)
- צבעי כותרת מודול לפי entity

---

## 4. CSS — תמיכה

### 4.1 CSS קיים — תומך ✅

**קובץ:** `ui/src/styles/phoenix-modal.css`

**מה קיים:**
- ✅ `.form-row` — פריסה דו-עמודתית עם `gap: 21px` (שורות 193-204)
- ✅ `.form-label-asterisk` — כוכבית בצבע error (שורות 219-221)
- ✅ `.phoenix-modal__save-btn` — כפתור שמירה לפי סטנדרט D16 (שורות 166-175)
- ✅ Input/Select padding אחיד: `padding: 8px 16px` (שורות 225-235)
- ✅ Focus color אחיד: `border-color: var(--color-brand)` (שורות 238-243)

**מסקנה:** ✅ **CSS תומך — אין צורך בעדכונים נוספים**

---

## 5. השוואה ל-D16 Reference

| נושא | D16 (Reference) | D18 | D21 | סטטוס |
|------|----------------|-----|-----|-------|
| **פריסה דו-עמודתית** | ✅ `.form-row` | ✅ **עודכן** | ✅ **עודכן** | ⏳ **לבדיקה** |
| **כוכבית** | ✅ `.form-label-asterisk` | ✅ **עודכן** | ✅ **עודכן** | ⏳ **לבדיקה** |
| **כפתור שמירה** | ✅ "שמירה" | ✅ "שמירה" | ✅ "שמירה" | ✅ **תואם** |
| **Entity colors** | ✅ `trading_account` | ✅ `brokers_fees` | ✅ `cash_flow` | ✅ **תואם** |
| **RTL Button Order** | ✅ Cancel מימין | ✅ Cancel מימין | ✅ Cancel מימין | ✅ **תואם** |
| **Input padding** | ✅ `8px 16px` | ✅ `8px 16px` | ✅ `8px 16px` | ✅ **תואם** |

---

## 6. שאלות ותיאום

### שאלות ל-Team 30:

1. **בדיקה פונקציונלית:** האם המודלים עובדים נכון לאחר השינויים?
2. **בדיקה ויזואלית:** האם הפריסה הדו-עמודתית נראית נכון?
3. **בעיות:** האם יש בעיות או שגיאות שצריך לתקן?

### תיאום נדרש:

- ⏳ **בדיקה:** בדיקה פונקציונלית וויזואלית של D18 ו-D21
- ⏳ **דיווח:** עדכון ל-Team 40 על תוצאות הבדיקה
- ⏳ **דיוק ויזואלי:** סבב דיוק ויזואלי מול G-Lead (לאחר אישור D16)

---

## 7. קבצים שעודכנו

- ✅ `ui/src/views/financial/brokersFees/brokersFeesForm.js` — עודכן (Team 40)
- ✅ `ui/src/views/financial/cashFlows/cashFlowsForm.js` — עודכן (Team 40)

**הערה:** Team 40 עדכן את הקבצים כדי להשלים את המשימה במהירות. Team 30 צריך לבדוק את השינויים ולוודא שהכל עובד נכון.

---

## 8. הבא

1. ⏳ **Team 30:** בדיקה פונקציונלית וויזואלית
2. ⏳ **דיווח:** עדכון ל-Team 40 על תוצאות הבדיקה
3. ⏳ **דיוק ויזואלי:** סבב דיוק ויזואלי מול G-Lead (לאחר אישור D16)

---

**Team 40 (UI Assets & Design)**  
**Date:** 2026-02-12  
**Status:** ✅ **COORDINATION — D18_D21_UPDATED**

**log_entry | TEAM_40 | D16_REFERENCE_ROLLOUT_COORDINATION | TEAM_30 | 2026-02-12**
