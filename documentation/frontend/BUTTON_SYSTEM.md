# מערכת כפתורים מרכזית - Centralized Button System

## סקירה כללית
מערכת הכפתורים המרכזית מאפשרת ניהול אחיד של כל הכפתורים באתר, כולל איקונים, טקסטים ומחלקות CSS.

## קבצים
- `trading-ui/scripts/button-icons.js` - הקובץ הראשי של המערכת

## שימוש בסיסי

### יצירת כפתור פשוט
```javascript
// כפתור עריכה
${createEditButton(`editRecord('trades', ${trade.id})`)}

// כפתור מחיקה
${createDeleteButton(`deleteRecord('trades', ${trade.id})`)}

// כפתור קישור
${createLinkButton(`viewLinkedItems('trades', ${trade.id})`)}
```

### יצירת כפתור מותאם אישית
```javascript
// כפתור עם מחלקות נוספות
${createButton('SAVE', `saveRecord(${id})`, 'me-2')}

// כפתור עם תכונות נוספות
${createButton('EXPORT', `exportData()`, '', 'data-toggle="tooltip"')}
```

## סוגי כפתורים זמינים

### כפתורי פעולה בסיסיים
- `EDIT` - עריכה (✏️)
- `DELETE` - מחיקה (🗑️)
- `CANCEL` - ביטול (❌)
- `LINK` - קישור (🔗)

### כפתורי ניהול נתונים
- `ADD` - הוספה (➕)
- `SAVE` - שמירה (💾)
- `EXPORT` - ייצוא (📤)
- `IMPORT` - ייבוא (📥)

### כפתורי ניווט
- `SEARCH` - חיפוש (🔍)
- `FILTER` - פילטר (🔧)
- `VIEW` - צפייה (👁️)
- `REFRESH` - רענון (🔄)

### כפתורי ניהול מתקדם
- `DUPLICATE` - שכפול (📋)
- `ARCHIVE` - ארכוב (📦)
- `RESTORE` - שחזור (📤)
- `APPROVE` - אישור (✅)
- `REJECT` - דחייה (❌)

### כפתורי בקרה
- `PAUSE` - השהה (⏸️)
- `PLAY` - הפעל (▶️)
- `STOP` - עצור (⏹️)

## מחלקות CSS אוטומטיות

המערכת מקצה אוטומטית מחלקות CSS מתאימות:

- `EDIT` → `btn-secondary`
- `DELETE` → `btn-danger`
- `LINK` → `btn-info`
- `ADD` → `btn-success`
- `SAVE` → `btn-primary`
- `EXPORT` → `btn-outline-primary`
- `IMPORT` → `btn-outline-success`

## נגישות

כל הכפתורים כוללים:
- `title` attribute עם טקסט תיאורי
- איקון ויזואלי ברור
- מחלקות CSS סמנטיות

## דוגמאות שימוש

### בטבלת נתונים
```javascript
function updateTradesTable(trades) {
  const tbody = document.querySelector('#tradesTable tbody');
  tbody.innerHTML = trades.map(trade => `
    <tr>
      <td>${trade.id}</td>
      <td>${trade.symbol}</td>
      <td>
        ${createEditButton(`editTrade(${trade.id})`)}
        ${createDeleteButton(`deleteTrade(${trade.id})`)}
        ${createLinkButton(`viewLinkedItems('trades', ${trade.id})`)}
      </td>
    </tr>
  `).join('');
}
```

### במודל
```javascript
function showEditModal(data) {
  const modal = `
    <div class="modal-footer">
      ${createButton('SAVE', 'saveChanges()', 'me-2')}
      ${createButton('CANCEL', 'closeModal()')}
    </div>
  `;
}
```

## יתרונות המערכת

1. **עקביות**: כל הכפתורים נראים אחיד בכל האתר
2. **תחזוקה קלה**: שינוי אחד משנה את כל האתר
3. **נגישות**: תמיכה מלאה בנגישות
4. **גמישות**: תמיכה במחלקות נוספות ותכונות מותאמות
5. **ביצועים**: אין צורך לטעון תמונות נוספות

## מיגרציה מכפתורים ישנים

### לפני (ישן)
```javascript
<button class="btn btn-sm btn-secondary" onclick="editRecord(${id})" title="ערוך">✏️</button>
```

### אחרי (חדש)
```javascript
${createEditButton(`editRecord(${id})`)}
```

## סטטוס מיגרציה ✅ **בתהליך**

### עמודים שהועברו למערכת החדשה:
- ✅ `db_display.html` - עמוד בסיס נתונים
- ✅ `accounts.html` - עמוד חשבונות  
- ✅ `trades.html` - עמוד טריידים
- ✅ `tickers.html` - עמוד טיקרים
- ✅ `alerts.html` - עמוד התראות
- ✅ `cash_flows.html` - עמוד תזרימי מזומן
- ✅ `trade_plans.html` - עמוד תוכניות טרייד
- ✅ `executions.html` - עמוד ביצועים
- ✅ `notes.html` - עמוד הערות

### עמודים שנותרו להעברה:
- ✅ **כל העמודים הראשיים הועברו בהצלחה!**
- ⏳ עמודים נוספים (אם יש)...

## עדכון עמודים קיימים

כדי לעדכן עמוד קיים למערכת החדשה:

1. הוסף את הקובץ לעמוד:
```html
<script src="scripts/button-icons.js"></script>
```

2. החלף כפתורים קיימים בפונקציות החדשות
3. בדוק שהכל עובד כראוי

## תמיכה טכנית

המערכת תומכת ב:
- כל הדפדפנים המודרניים
- Bootstrap 5
- מערכות הפעלה שונות (emoji שונים)
- נגישות מלאה
