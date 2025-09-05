# רשימת שיפורי עיצוב עמוד התראות
## Alerts Page Design Improvements List

### סקירה כללית
רשימה מקיפה של השיפורים הנדרשים לעמוד התראות, עם פירוט טכני ליישום בעמודים נוספים.

---

## 1. כותרת עליונה - שקיפות מותאמת אישית
### Main Header - Custom Transparency

**תיאור:** הכותרת העליונה צריכה לקבל הגדרת שקיפות משלה בהתאם להעדפות המשתמש.

**יישום טכני:**
- שימוש במערכת הצבעים הדינמית (`color-scheme-system.js`)
- פונקציה: `getMainHeaderOpacityHex()` - קבלת שקיפות כותרת ראשית
- CSS Class: `.entity-alert-main-header` עם שקיפות מותאמת
- העדפות: `window.currentPreferences.headerOpacity.main`

**קוד לדוגמה:**
```css
.entity-alert-main-header {
  background-color: var(--entity-alert-color) + opacity;
  border-left: 4px solid var(--entity-alert-color);
}
```

---

## 2. עמודת סטטוס - סולם צבעים דינמי
### Status Column - Dynamic Color Scheme

**תיאור:** עמודת סטטוס צריכה לקבל סולם צבעים בהתאם להגדרות בהעדפות המשתמש.

**יישום טכני:**
- שימוש במערכת צבעי סטטוס (`getStatusColor()`, `getStatusBackgroundColor()`)
- CSS Classes: `.status-{status}-badge`, `.status-{status}-text`
- העדפות: `window.currentPreferences.statusColors`
- סטטוסים: `open`, `closed`, `cancelled`, `active`, `new`, `read`, `unread`

**קוד לדוגמה:**
```javascript
function getStatusBadgeClass(status) {
  return `status-${status.toLowerCase()}-badge`;
}
```

---

## 3. עמודת "קשור ל" - צבעים לפי סוג ישות
### "Related To" Column - Colors by Entity Type

**תיאור:** עמודת קשור ל צריכה לקבל סולם צבעים בהתאם להגדרות בהעדפות המשתמש וסוג הישות אליה יש קישור.

**יישום טכני:**
- שימוש במערכת צבעי ישויות (`getEntityColor()`, `getEntityBackgroundColor()`)
- CSS Classes: `.entity-{type}-badge`, `.entity-{type}-text`
- סוגי ישויות: `account`, `trade`, `trade_plan`, `ticker`
- העדפות: `window.currentPreferences.entityColors`

**קוד לדוגמה:**
```javascript
function getRelatedEntityBadgeClass(relatedTypeId) {
  const entityTypes = {1: 'account', 2: 'trade', 3: 'trade_plan', 4: 'ticker'};
  const entityType = entityTypes[relatedTypeId];
  return `entity-${entityType}-badge`;
}
```

---

## 4. עמודה ראשונה - קישור למודול פרטי הרשומה
### First Column - Link to Record Details Module

**תיאור:** העמודה הראשונה (טיקר) תמיד מקשרת למודול פרטי הרשומה. במקרה והעמודה הראשונה מכילה איקון קישור הוא מקשר למודול של הערך שמוצג בעמודה.

**יישום טכני:**
- שימוש במערכת Entity Details (`entity-details-modal.js`)
- פונקציה: `showEntityDetails(entityType, entityId)`
- איקון קישור: `🔗` או `📋`
- קישור ישיר למודול פרטי הרשומה

**קוד לדוגמה:**
```javascript
function createTickerLink(tickerSymbol, alertId) {
  return `<a href="#" onclick="showEntityDetails('alert', ${alertId})" 
             class="entity-link" title="פרטי התראה">
             <span class="link-icon">🔗</span> ${tickerSymbol}
           </a>`;
}
```

---

## 5. עמודת "הופעל" - עיצוב כפתורי ביטול ושיחזור
### "Triggered" Column - Cancel/Restore Button Styling

**תיאור:** עמודת הופעל כן/לא צריכה לקבל את העיצוב כמו כפתורי ביטול ושיחזור.

**יישום טכני:**
- CSS Classes: `.btn-cancel-style`, `.btn-restore-style`
- עיצוב: גבול, רקע, צבע טקסט
- ערכים: `כן` (הופעל) = כפתור שיחזור, `לא` (לא הופעל) = כפתור ביטול

**קוד לדוגמה:**
```css
.triggered-yes {
  background-color: #28a745;
  color: white;
  border: 1px solid #28a745;
  border-radius: 4px;
  padding: 2px 8px;
}

.triggered-no {
  background-color: #dc3545;
  color: white;
  border: 1px solid #dc3545;
  border-radius: 4px;
  padding: 2px 8px;
}
```

---

## 6. סידור טבלה - כל העמודות למעט פעולות
### Table Sorting - All Columns Except Actions

**תיאור:** כל העמודות למעט פעולות צריכות לאפשר סידור, כולל במקרה שלנו תנאי - יש לסדר לפי הא-ב של תרגום התנאי המוצג.

**יישום טכני:**
- שימוש במערכת המיון הגלובלית (`sortTableData()`)
- פונקציה: `getColumnValue()` עם מיפוי עמודות
- תרגום תנאים: שימוש ב-`translation-utils.js`
- מיון לפי תרגום: מיון לפי הטקסט המוצג ולא הערך הגולמי

**קוד לדוגמה:**
```javascript
function sortByTranslatedCondition(a, b, columnIndex) {
  const aTranslated = translateAlertCondition(a.condition);
  const bTranslated = translateAlertCondition(b.condition);
  return aTranslated.localeCompare(bTranslated, 'he');
}
```

---

## 7. כפתור הוסף רשומה - מיקום בכותרת הראשית בלבד
### Add Record Button - Main Header Only

**תיאור:** כפתור הוסף רשומה צריך להופיע רק בכותרת הראשית בראש הדף.

**יישום טכני:**
- הסרת כפתור מה-`content-section`
- שמירת כפתור ב-`top-section` בלבד
- עדכון CSS: הסרת כפילות במיקום הכפתור

**קוד לדוגמה:**
```html
<!-- רק בכותרת הראשית -->
<div class="top-section">
  <div class="section-header">
    <button class="refresh-btn" onclick="showAddAlertModal()">
      <span class="action-icon">➕</span> הוסף
    </button>
  </div>
</div>

<!-- הסרה מהכותרת המשנית -->
<div class="content-section">
  <!-- כפתור הוסף הוסר מכאן -->
</div>
```

---

## 8. הסרת כפתור מערכת העדפות V2
### Remove Preferences V2 Button

**תיאור:** הכפתור למערכת ההעדפות המתקדמת המקשר לעמוד `http://localhost:8080/preferences-v2.html` צריך להימחק מהעמוד.

**יישום טכני:**
- הסרת אלמנט HTML: `<button class="refresh-btn" onclick="openPreferencesV2()">`
- הסרת פונקציה: `openPreferencesV2()`
- ניקוי CSS קשור

**קוד להסרה:**
```html
<!-- להסיר -->
<button class="refresh-btn" onclick="openPreferencesV2()" 
        title="פתח מערכת העדפות V2 המתקדמת" 
        style="background: linear-gradient(45deg, #667eea, #764ba2); color: white; font-size: 0.8rem;">
  <span class="action-icon">🚀</span> V2
</button>
```

---

## 9. שיפורים נוספים ליישום בעמודים נוספים
### Additional Improvements for Other Pages

### 9.1 מערכת צבעים אחידה
- יישום מערכת הצבעים הדינמית בכל העמודים
- שימוש ב-`color-scheme-system.js` לכל סוגי הישויות
- עדכון אוטומטי של צבעים בהתאם להעדפות

### 9.2 מערכת מיון משופרת
- יישום מיון לפי תרגום בכל הטבלאות
- תמיכה במיון מורכב (מספרי, תאריכים, טקסט)
- שמירת מצב מיון בין עמודים

### 9.3 מערכת קישורים אחידה
- יישום קישורי Entity Details בכל העמודים
- איקונים אחידים לקישורים
- ניווט עקבי בין מודולים

### 9.4 עיצוב כפתורים אחיד
- סגנון אחיד לכפתורי סטטוס
- צבעים עקביים לכל סוגי הכפתורים
- אנימציות ומעברים אחידים

---

## 10. קבצים לשינוי
### Files to Modify

### 10.1 קבצי HTML
- `trading-ui/alerts.html` - יישום כל השיפורים
- `trading-ui/accounts.html` - יישום דומה
- `trading-ui/trades.html` - יישום דומה
- `trading-ui/tickers.html` - יישום דומה

### 10.2 קבצי JavaScript
- `trading-ui/scripts/alerts.js` - עדכון פונקציות הטבלה
- `trading-ui/scripts/color-scheme-system.js` - הוספת פונקציות חדשות
- `trading-ui/scripts/tables.js` - שיפור מערכת המיון
- `trading-ui/scripts/entity-details-modal.js` - תמיכה בהתראות

### 10.3 קבצי CSS
- `trading-ui/styles/table.css` - עיצוב טבלאות משופר
- `trading-ui/styles/color-scheme.css` - צבעים דינמיים
- `trading-ui/styles/buttons.css` - עיצוב כפתורים אחיד

---

## 11. סדר יישום מומלץ
### Recommended Implementation Order

1. **שלב 1:** הסרת כפתור V2 והעברת כפתור הוסף
2. **שלב 2:** יישום מערכת הצבעים הדינמית
3. **שלב 3:** שיפור עמודות סטטוס ו"קשור ל"
4. **שלב 4:** הוספת קישורים בעמודה הראשונה
5. **שלב 5:** עיצוב עמודת "הופעל"
6. **שלב 6:** שיפור מערכת המיון
7. **שלב 7:** יישום בעמודים נוספים
8. **שלב 8:** בדיקות ותיקונים

---

## 12. בדיקות נדרשות
### Required Tests

- [ ] בדיקת צבעים דינמיים בהתאם להעדפות
- [ ] בדיקת מיון בכל העמודות
- [ ] בדיקת קישורי Entity Details
- [ ] בדיקת עיצוב כפתורי סטטוס
- [ ] בדיקת שקיפות כותרות
- [ ] בדיקת תאימות לדפדפנים שונים
- [ ] בדיקת ביצועים עם נתונים רבים

---

**תאריך יצירה:** 2025-01-09  
**מחבר:** TikTrack Development Team  
**גרסה:** 1.0  
**סטטוס:** מוכן ליישום
