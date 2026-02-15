# 📋 ניתוח דרישות נוספות למודולים

**תאריך:** 2026-02-09  
**צוות:** Team 31  
**סטטוס:** ⚠️ **דרוש מידע נוסף**

---

## 🎯 דרישות נוספות

המשתמש ביקש להוסיף 2 בלופרינטים נוספים:

1. **מודול אלמנטים מקושרים (Linked Items Modal)**
   - מודול עם עיצוב ייחודי
   - נפתח מתוך מודול פרטים של ישות
   - כולל הפרדה בין ישויות אם (parent entities) וישויות בנות (child entities)
   - מידע מעוצב בצורה ספציפית לכל רשומה קשורה

2. **מודול פרטים מלא ומורכב (Full Entity Details Modal)**
   - מודול פרטים של טרייד או תוכנית טרייד
   - מודול פרטים מלא ומורכב
   - הצגת כל השדות של הישות

---

## 📊 מידע קיים

### 1. מודול Linked Items - מידע קיים

**מיקום קוד:** `_COMMUNICATION/Legace_html_for_blueprint/Legace_DOM/הרשמה - TikTrack_files/linked-items.js`

**תכונות עיקריות:**
- מציג `parent_entities` ו-`child_entities`
- משתמש ב-`EntityDetailsRenderer.renderLinkedItems()` לרינדור טבלה
- כותרת דינמית: "פריטים מקושרים ל-[Entity Type]"
- תמיכה ב-modes: `view`, `warningBlock`
- כפתור ייצוא נתונים

**מבנה נתונים:**
```javascript
{
  parent_entities: [...],  // ישויות אם
  child_entities: [...]     // ישויות בנות
}
```

**צבעים לפי סוג ישות:**
- Trade/Trade Plan: Blue (bg-primary)
- Account/Execution: Green (bg-success)
- Ticker: Light Blue (bg-info)
- Alert: Yellow (bg-warning)
- Cash Flow: Gray (bg-secondary)
- Note: Black (bg-dark)

**חסר:**
- ❌ מבנה HTML מלא של הטבלה
- ❌ CSS ספציפי (linked_items.css לא נמצא)
- ❌ מבנה מדויק של שורות הטבלה
- ❌ כפתורי פעולה (View, Edit, Open Page, Delete) - מבנה HTML

### 2. מודול פרטים מלא - מידע קיים

**מיקום קוד:** `_COMMUNICATION/Legace_html_for_blueprint/Legace_DOM/הרשמה - TikTrack_files/core-systems.js` - `showDetailsModal()`

**שדות Trade (מ-`api/models/trades.py`):**
- Foreign Keys: `ticker_id`, `trading_account_id`, `parent_trade_id`, `strategy_id`, `origin_plan_id`, `trigger_alert_id`
- Trade Details: `direction` (LONG/SHORT)
- Quantity & Price: `quantity`, `avg_entry_price`, `avg_exit_price`
- Stop Loss & Take Profit: `stop_loss`, `take_profit`
- P&L: `realized_pl`, `unrealized_pl`, `total_pl`
- Fees: `commission`, `fees`
- Status: `status`, `calculated_status`
- Dates: `entry_date`, `exit_date`
- Metadata: `trade_metadata`, `tags`
- Audit: `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at`, `version`

**חסר:**
- ❌ מבנה HTML מלא של מודול הפרטים
- ❌ ארגון השדות לפי סקשנים
- ❌ עיצוב ספציפי לכל סוג שדה
- ❌ קישורים ל-linked items
- ❌ כפתורי פעולה (Edit, Delete, View Linked Items)

---

## ⚠️ מידע חסר - דרוש להשלמה

### למודול Linked Items:

1. **מבנה HTML של הטבלה:**
   - מבנה מדויק של שורות הטבלה
   - עמודות הטבלה (סוג ישות, שם, סטטוס, תאריך, פעולות)
   - הפרדה ויזואלית בין parent entities ל-child entities
   - כפתורי פעולה (View, Edit, Open Page, Delete) - מבנה HTML מדויק

2. **CSS ספציפי:**
   - קובץ `linked_items.css` לא נמצא
   - סגנונות לטבלה
   - סגנונות ל-badges לפי סוג ישות
   - סגנונות להפרדה בין parent/child

3. **דוגמאות נתונים:**
   - דוגמה מלאה של `parent_entities` array
   - דוגמה מלאה של `child_entities` array
   - מבנה נתונים של כל ישות מקושרת

### למודול פרטים מלא:

1. **מבנה HTML מלא:**
   - מבנה מדויק של מודול הפרטים
   - ארגון השדות לפי סקשנים (מידע בסיסי, מחירים, P&L, תאריכים, וכו')
   - עיצוב לכל סוג שדה (מספרי, תאריך, סטטוס, וכו')

2. **קישורים ופעולות:**
   - כפתור "פריטים מקושרים" - איך הוא נראה ואיפה הוא ממוקם
   - כפתורי Edit/Delete
   - קישורים לישויות קשורות (טיקר, חשבון מסחר, וכו')

3. **דוגמאות נתונים:**
   - דוגמה מלאה של Trade object עם כל השדות
   - דוגמה מלאה של Trade Plan object עם כל השדות

---

## 🔍 שאלות לבדיקה

### למודול Linked Items:

1. **האם יש דוגמה HTML קיימת במערכת לגסי?**
   - האם יש קובץ HTML שמציג את המודול בפועל?
   - האם יש screenshots או דוגמאות ויזואליות?

2. **מבנה הטבלה:**
   - כמה עמודות יש בטבלה?
   - מה הסדר של העמודות?
   - איך מוצגת ההפרדה בין parent ל-child?

3. **כפתורי פעולה:**
   - איך נראים הכפתורים (View, Edit, Open Page, Delete)?
   - איפה הם ממוקמים (בשורה? בתפריט נפתח?)?

### למודול פרטים מלא:

1. **מבנה המודול:**
   - האם זה מודול גדול (modal-xl) או בינוני?
   - כמה סקשנים יש?
   - מה הסדר של הסקשנים?

2. **קישור ל-Linked Items:**
   - איפה מופיע הכפתור "פריטים מקושרים"?
   - איך הוא נראה?

3. **דוגמאות:**
   - האם יש דוגמה HTML קיימת של מודול פרטים מלא?
   - האם יש screenshots?

---

## 📝 המלצה

**לפני יצירת הבלופרינטים, נדרש:**

1. **לאתר דוגמאות HTML קיימות** במערכת לגסי של:
   - מודול linked items בפועל
   - מודול פרטים מלא של טרייד/תוכנית טרייד

2. **לבדוק את המבנה הויזואלי:**
   - איך נראית הטבלה של linked items
   - איך נראה מודול הפרטים המלא

3. **להשלים מידע חסר:**
   - מבנה HTML מדויק
   - CSS ספציפי
   - דוגמאות נתונים

---

**האם יש לך גישה לדוגמאות HTML קיימות או screenshots של המודולים האלה במערכת לגסי?**

**או האם תרצה שאמשיך ליצור בלופרינטים על בסיס המידע הקיים ואתה תספק תיקונים/השלמות אחר כך?**
