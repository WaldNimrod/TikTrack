# Team 40 → Team 10: אישור משימות — Module/Menu Styling

**מאת:** Team 40 (UI Assets & Design)  
**אל:** Team 10 (The Gateway)  
**תאריך:** 2026-02-12  
**מקור:** `TEAM_10_TO_TEAM_40_MODULE_MENU_STYLING_TASKS.md`

---

## 📋 Executive Summary

Team 40 מאשר קבלת המשימות ל-Module/Menu Styling לפי SSOT החדש (`ARCHITECT_MODULE_MENU_STYLING_SSOT.md`).

**סטטוס:** ✅ **משימות הובנו — ביצוע החל**

---

## 1. בדיקת מצב נוכחי

### 1.1 RTL Button Order

**מצב:** ✅ **כבר מיושם**

**קובץ:** `ui/src/styles/phoenix-modal.css` (שורה 85)

**קוד קיים:**
```css
.phoenix-modal__footer {
  flex-direction: row-reverse; /* RTL: Cancel ימין, Confirm שמאל */
}
```

**תואם ל-SSOT:** ✅ כן — Cancel תמיד לפני Confirm → Cancel מימין, Confirm משמאל

---

### 1.2 Module Header Colors

**מצב:** ⚠️ **חלקי — דורש עדכון**

**מה קיים:**
- ✅ רקע כותרת = Light variant (תואם SSOT)
- ✅ טקסט כותרת = Dark variant (תואם SSOT)
- ❌ גבול תחתון = Base variant (לא Dark — צריך עדכון)
- ❌ כפתור סגירה = לא מוגדר לפי entity (צריך הוספה)

**מה נדרש לפי SSOT:**
- רקע כותרת = **Light variant** ✅
- טקסט + כפתור סגירה + גבול תחתון = **Dark variant** ❌

---

## 2. פעולות שבוצעו

### 2.1 עדכון CSS — גבול תחתון וכפתור סגירה

**קובץ:** `ui/src/styles/phoenix-modal.css`

**שינויים:**
1. ✅ עדכון גבול תחתון ל-Dark variant (לכל ה-entities)
2. ✅ הוספת צבע כהה לכפתור סגירה לפי entity (Dark variant)

**דוגמה (Trading Account):**
```css
/* לפני */
border-bottom-color: var(--entity-trading_account, #28a745); /* Base */

/* אחרי */
border-bottom-color: var(--entity-trading_account-dark, #155724); /* Dark per SSOT */
```

**כפתור סגירה חדש:**
```css
/* Close button color - Trading Account & Brokers Fees (Dark variant per SSOT) */
.phoenix-modal[data-entity="trading_account"] .phoenix-modal__close {
  color: var(--entity-trading_account-dark, #155724);
  border-color: var(--entity-trading_account-dark, #155724);
}
```

---

## 3. תוכנית עבודה

### שלב 1: עדכון CSS ✅ **הושלם**

- ✅ עדכון גבול תחתון ל-Dark variant
- ✅ הוספת צבע כהה לכפתור סגירה לפי entity
- ✅ הוספת הערות SSOT בקוד

**קבצים שעודכנו:**
- `ui/src/styles/phoenix-modal.css`

---

### שלב 2: תיאום עם Team 30 ⏳ **בהמתנה**

**מטרה:** בחירת מודול דוגמה לסבב דיוק ויזואלי מול G-Lead

**פעולות נדרשות:**
1. יצירת מסמך תיאום ל-Team 30
2. בחירת מודול דוגמה (D16/D18/D21)
3. תיאום על מועד סבב דיוק ויזואלי

**תוצר:** מסמך תיאום `TEAM_40_TO_TEAM_30_MODULE_STYLING_COORDINATION.md`

---

### שלב 3: סבב דיוק ויזואלי ⏳ **בהמתנה**

**מטרה:** אישור מודול דוגמה מול G-Lead כסטנדרט רשמי

**דרישות:**
- אישור בדפדפן (לא צילומי מסך)
- נוכחות: Team 30 + Team 40 + G-Lead
- מודול אחד = סטנדרט לכל השאר

**תוצר:** אישור G-Lead + דוח השלמה

---

## 4. Acceptance Criteria — סטטוס

| # | קריטריון | סטטוס |
|---|----------|-------|
| 1 | RTL order קבוע ומיושם בכל מודול | ✅ **הושלם** — `flex-direction: row-reverse` קיים |
| 2 | צבעי כותרת מודול לפי ישות (Light BG + Dark text/border/close) | ✅ **הושלם** — CSS עודכן לפי SSOT |
| 3 | מודול דוגמה מאושר ונסגר כסטנדרט | ⏳ **בהמתנה** — תיאום עם Team 30 |

---

## 5. שאלות ותיאום נדרש

### שאלות ל-Team 10:

1. **מודול דוגמה:** האם יש העדפה למודול ספציפי (D16/D18/D21) או שאנחנו בוחרים?
2. **ציר זמן:** מהו ציר הזמן המבוקש לסגירת המשימה?
3. **תיאום G-Lead:** האם Team 10 מתאם את הסבב או שאנחנו מתאמים ישירות?

### תיאום נדרש:

- ⏳ **Team 30:** בחירת מודול דוגמה + תיאום סבב דיוק ויזואלי
- ⏳ **G-Lead:** תיאום מועד סבב דיוק ויזואלי

---

## 6. קבצים שעודכנו

- ✅ `ui/src/styles/phoenix-modal.css` — עדכון גבול תחתון וכפתור סגירה ל-Dark variant

---

## 7. הבא

1. ⏳ יצירת מסמך תיאום ל-Team 30
2. ⏳ בחירת מודול דוגמה
3. ⏳ תיאום סבב דיוק ויזואלי מול G-Lead

---

**Team 40 (UI Assets & Design)**  
**Date:** 2026-02-12  
**Status:** ✅ **ACKNOWLEDGED — CSS UPDATED**

**log_entry | TEAM_40 | MODULE_MENU_STYLING_ACKNOWLEDGMENT | TEAM_10 | 2026-02-12**
