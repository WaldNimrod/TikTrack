# ⚠️ חשוב! מספר כפתורים משתנה בעמודי הפעולות

## סקירה

**המערכת חייבת לתמוך במספר כפתורים שונה בין 2 ל-5 כפתורים בעמודת הפעולות.**

---

## 📊 פילוח לפי עמודים

### 2 כפתורים (Edit + Delete)
- **notes.js** - רק עריכה ומחיקה
- **entity-details-renderer.js** - (שורה ~714)

### 3 כפתורים
- **executions.js** - Link + Edit + Delete
- **cash_flows.js** - Edit + Cancel/Reactivate + Delete
- **alerts.js** - Edit + Cancel/Reactivate + Delete
- **trading_accounts.js** - Edit + Cancel + Delete (משתנה לפי סטטוס)

### 4 כפתורים
- **trade_plans.js** - Link + Edit + View + Delete

### 5 כפתורים
- **trades.js** - Link + Edit + View + Cancel/Reactivate + Delete

---

## 🔄 כפתור דינמי - Cancel/Reactivate

כפתור שמשתנה לפי סטטוס הרשומה:

**רשומה פעילה (status: 'open'):**
```javascript
window.createCancelButton('trade', trade.id, 'open')
// תוצאה: כפתור אדום עם ❌ "בטל"
```

**רשומה מבוטלת (status: 'cancelled'):**
```javascript
window.createCancelButton('trade', trade.id, 'cancelled')
// תוצאה: כפתור ירוק עם ✓ "הפעל מחדש"
```

**עמודים עם כפתור דינמי:**
- trades.js
- trade_plans.js
- alerts.js
- cash_flows.js
- trading_accounts.js

---

## ✅ הפתרון הטכני

### הפונקציה `createActionsMenu()` גמישה!

```javascript
function createActionsMenu(buttons, entityId) {
  // סינון כפתורים ריקים
  const validButtons = buttons.filter(btn => btn && btn.trim() !== '');
  
  // הפופאפ יתאים אוטומטית לכמות הכפתורים
  return `...popup HTML...`;
}
```

### ה-CSS מתאים אוטומטית!

```css
.actions-menu-content {
  display: flex;
  gap: 0;
  min-width: max-content; /* ⚠️ זה הקסם - הפופאפ מתרחב לפי התוכן */
}

.actions-menu-content button {
  width: 28px;  /* כל כפתור */
  margin: 0 2px; /* רווח בין כפתורים */
}
```

**חישוב רוחב:**
- 2 כפתורים: 2×28px + 4×2px + 2×4px (padding) = ~72px
- 3 כפתורים: 3×28px + 6×2px + 2×4px = ~104px
- 4 כפתורים: 4×28px + 8×2px + 2×4px = ~136px
- 5 כפתורים: 5×28px + 10×2px + 2×4px = ~168px

---

## 🧪 בדיקות נדרשות

### בדיקה 1: notes.html (2 כפתורים)
```
הכנס לעמוד notes
וודא: popup צר עם רק Edit (✏️) + Delete (🗑️)
```

### בדיקה 2: executions.html (3 כפתורים)
```
הכנס לעמוד executions
וודא: popup רוחב בינוני עם Link + Edit + Delete
```

### בדיקה 3: trade_plans.html (4 כפתורים)
```
הכנס לעמוד תכנוני מסחר
וודא: popup רחב עם Link + Edit + View + Delete
```

### בדיקה 4: trades.html (5 כפתורים)
```
הכנס לעמוד trades
וודא: popup רחב מקסימלי עם כל 5 הכפתורים
```

### בדיקה 5: כפתור דינמי
```
הכנס לעמוד trades
מצא trade פעיל (Open)
וודא: כפתור Cancel (❌) אדום

מצא trade מבוטל (Cancelled)
וודא: כפתור Reactivate (✓) ירוק
```

---

## 📋 Checklist ליישום

כשמעדכנים כל קובץ JavaScript, וודא:

- [ ] המערך של כפתורים מכיל את כל הכפתורים הרלוונטיים
- [ ] כפתורים שאינם רלוונטיים מסוננים (empty strings)
- [ ] כפתור Cancel/Reactivate עם הסטטוס הנכון
- [ ] ה-entityId מועבר (trade.id, plan.id, וכו')
- [ ] הפונקציה `createActionsMenu()` משמשת במקום רשימה ישירה

---

## ✅ סיכום

המערכת **חייבת** לתמוך ב-2-5 כפתורים:
- ✅ הפונקציה `createActionsMenu()` גמישה
- ✅ ה-CSS עם `min-width: max-content` מתאים אוטומטית
- ✅ כל עמוד יכול להיות עם מספר כפתורים שונה
- ✅ כפתור Cancel/Reactivate משתנה דינמית

**לא צריך שינויים מיוחדים - הכל עובד אוטומטית!** 🎉

