# תוכנית סטנדרטיזציה של טולטיפים - TikTrack

## סקירה כללית

תוכנית זו מפרטת את כל השלבים הנדרשים ליישום מלא של מערכת הטולטיפים המשופרת בכל העמודים במערכת.

## מצב נוכחי

### ✅ הושלם (עמוד notes)
- יציבות קשיחה לכפתורים קבועים
- מנגנון ברירת מחדל
- תמיכה בטולטיפים דינמיים
- יצירת ID ייחודיים
- תיעוד מלא

### ⏳ נדרש ליישום (13 עמודים עיקריים)

| עמוד | כפתורים | סוגי כפתורים | עדיפות | סטטוס |
|------|---------|--------------|--------|-------|
| **trades.html** | 17 | SORT:12, TOGGLE:2, ADD:1, CLOSE:1 | גבוהה | ⏳ ממתין |
| **trade_plans.html** | 14 | SORT:11, TOGGLE:2, ADD:1 | גבוהה | ⏳ ממתין |
| **executions.html** | 37 | SORT:19, TOGGLE:4, SECONDARY:3, PRIMARY:2 | גבוהה | ⏳ ממתין |
| **alerts.html** | 11 | UNKNOWN:6, TOGGLE:2, EVALUATE:1, REFRESH:1 | בינונית | ⏳ ממתין |
| **tickers.html** | 12 | SORT:9, TOGGLE:2, ADD:1 | בינונית | ⏳ ממתין |
| **trading_accounts.html** | 31 | SORT:21, TOGGLE:5, ADD:1, VIEW:1 | גבוהה | ⏳ ממתין |
| **cash_flows.html** | 10 | SORT:7, TOGGLE:2, ADD:1 | בינונית | ⏳ ממתין |
| **data_import.html** | ? | ? | נמוכה | ⏳ ממתין |
| **preferences.html** | 17 | TOGGLE:9, SAVE:7, UNKNOWN:1 | נמוכה | ⏳ ממתין |
| **db_display.html** | 9 | TOGGLE:9 | נמוכה | ⏳ ממתין |
| **db_extradata.html** | 9 | TOGGLE:9 | נמוכה | ⏳ ממתין |
| **research.html** | ? | ? | נמוכה | ⏳ ממתין |
| **index.html** | ? | ? | בינונית | ⏳ ממתין |

**סה"כ:** ~166 כפתורים שצריכים סטנדרטיזציה

## שלבי עבודה

### שלב 1: הכנה וכלים

#### 1.1 יצירת סקריפט סריקה
**קובץ:** `scripts/scan-button-tooltips.js`

**תפקיד:**
- סריקת כל קבצי HTML
- זיהוי כפתורים עם `data-button-type`
- בדיקת נוכחות `data-tooltip`
- בדיקת נוכחות `data-id`
- יצירת דוח JSON עם כל הכפתורים

**פלט:**
```json
{
  "page": "trades",
  "buttons": [
    {
      "type": "TOGGLE",
      "hasTooltip": false,
      "hasId": false,
      "onclick": "toggleSection('top')",
      "line": 100,
      "recommendedId": "toggle-top-section",
      "recommendedTooltip": "הצג או הסתר את אזור הסיכום"
    }
  ]
}
```

#### 1.2 יצירת סקריפט עדכון
**קובץ:** `scripts/update-button-tooltips-batch.js`

**תפקיד:**
- קריאת דוח הסריקה
- עדכון אוטומטי של `data-tooltip` ו-`data-id`
- שימוש ב-`BUTTON_TOOLTIPS_CONFIG` לברירות מחדל
- יצירת גיבוי לפני עדכון

### שלב 2: עדכון ברירות מחדל

#### 2.1 הוספת ברירות מחדל לכל העמודים
**קובץ:** `trading-ui/scripts/button-tooltips-config.js`

**נדרש:**
- הוספת קטע לכל עמוד ב-`BUTTON_TOOLTIPS_CONFIG`
- הגדרת טולטיפים ספציפיים לכל סוג כפתור
- הגדרת טולטיפים לפי context (entityType)

**דוגמה:**
```javascript
trades: {
  'TOGGLE.top-section': 'הצג או הסתר את אזור הסיכום',
  'TOGGLE.main-section': 'הצג או הסתר את טבלת הטריידים',
  'ADD.trade': 'הוסף טרייד חדש',
  'SORT.date': 'מיין לפי תאריך',
  'SORT.symbol': 'מיין לפי סמל',
  // ...
}
```

### שלב 3: עדכון עמודים (עדיפות גבוהה)

#### 3.1 עמודים עם עדיפות גבוהה (5 עמודים)
1. **trades.html** - 17 כפתורים
2. **trade_plans.html** - 14 כפתורים
3. **executions.html** - 37 כפתורים
4. **trading_accounts.html** - 31 כפתורים
5. **cash_flows.html** - 10 כפתורים

**פעולות לכל עמוד:**
1. הוספת `data-id` מפורש לכל כפתור קבוע
2. הוספת `data-tooltip` לכפתורים קבועים
3. בדיקה שכפתורי TOGGLE לא מסומנים כ-static (אם הם דינמיים)
4. בדיקת כפילות ID
5. בדיקה שהטולטיפים נכונים

#### 3.2 עמודים עם עדיפות בינונית (4 עמודים)
1. **alerts.html** - 11 כפתורים
2. **tickers.html** - 12 כפתורים
3. **index.html** - כפתורים (מספר לא ידוע)
4. **notes.html** - ✅ **הושלם**

#### 3.3 עמודים עם עדיפות נמוכה (4 עמודים)
1. **preferences.html** - 17 כפתורים
2. **db_display.html** - 9 כפתורים
3. **db_extradata.html** - 9 כפתורים
4. **research.html** - כפתורים (מספר לא ידוע)
5. **data_import.html** - כפתורים (מספר לא ידוע)

### שלב 4: עדכון כפתורים דינמיים

#### 4.1 כפתורי Toggle דינמיים
**נדרש:**
- זיהוי כפתורי TOGGLE שצריכים טולטיפ דינמי
- הסרת `data-tooltip` מהם (אם קיים)
- הוספת קוד JavaScript לעדכון טולטיפ לפי מצב

**דוגמה:**
```javascript
// ב-ui-basic.js או בקובץ העמוד
function updateToggleTooltip(buttonId, sectionId) {
  const button = document.getElementById(buttonId);
  if (!button || button.hasAttribute('data-tooltip-static')) {
    return; // כפתור קבוע - לא מעדכן
  }
  
  const section = document.getElementById(sectionId);
  const isCollapsed = section?.querySelector('.section-body')?.style.display === 'none';
  const tooltip = isCollapsed ? 'הצג' : 'הסתר';
  
  window.advancedButtonSystem.updateTooltip(button, tooltip);
}
```

#### 4.2 כפתורי Actions Menu
**נדרש:**
- בדיקה ש-`createActionsMenu` משתמש בברירת מחדל
- הוספת `data-tooltip` מפורש רק אם צריך טקסט ספציפי

### שלב 5: בדיקות ואימות

#### 5.1 בדיקות אוטומטיות
**קובץ:** `tests/unit/button-tooltips.test.js`

**בדיקות:**
- כל כפתור עם `data-button-type` מקבל טולטיפ
- כפתורים עם `data-tooltip` מסומנים כ-static
- אין כפילות ID
- טולטיפים דינמיים מתעדכנים נכון

#### 5.2 בדיקות ידניות
- בדיקת כל עמוד בדפדפן
- וידוא שהטולטיפים נכונים
- בדיקת כפתורי toggle דינמיים
- בדיקת כפתורי actions menu

## כללי עבודה

### 1. כפתורים קבועים (Static)
```html
<!-- ✅ נכון -->
<button 
    data-button-type="ADD" 
    data-entity-type="trade"
    data-id="add-trade-button"
    data-tooltip="הוסף טרייד חדש"
    data-tooltip-placement="top">
    הוסף טרייד
</button>
```

**חובה:**
- `data-id` מפורש
- `data-tooltip` מפורש
- מסומן אוטומטית כ-`data-tooltip-static="true"`

### 2. כפתורים דינמיים (Dynamic)
```html
<!-- ✅ נכון - ללא data-tooltip -->
<button 
    data-button-type="TOGGLE" 
    data-id="toggle-summary"
    data-onclick="toggleSection('summary')">
    ▼
</button>
```

**חובה:**
- `data-id` מפורש
- **ללא** `data-tooltip` (יקבל ברירת מחדל או יעודכן דינמית)
- קוד JavaScript לעדכון טולטיפ לפי מצב

### 3. כפתורים עם ברירת מחדל
```html
<!-- ✅ נכון - יקבל ברירת מחדל -->
<button 
    data-button-type="VIEW" 
    data-entity-type="trade"
    data-id="view-trade-button">
    צפה
</button>
```

**תוצאה:**
- יקבל טולטיפ: "צפה" (מ-BUTTON_TEXTS או BUTTON_TOOLTIPS_CONFIG)
- מסומן כ-`data-tooltip-fallback="true"`
- יכול להשתנות דרך `updateTooltip()`

## סדר עדיפויות

### עדיפות 1 (קריטי) - עמודים מרכזיים
1. ✅ **notes.html** - הושלם
2. **trades.html** - 17 כפתורים
3. **executions.html** - 37 כפתורים
4. **trading_accounts.html** - 31 כפתורים

### עדיפות 2 (גבוהה) - עמודים חשובים
5. **trade_plans.html** - 14 כפתורים
6. **cash_flows.html** - 10 כפתורים
7. **tickers.html** - 12 כפתורים

### עדיפות 3 (בינונית) - עמודים תומכים
8. **alerts.html** - 11 כפתורים
9. **index.html** - כפתורים

### עדיפות 4 (נמוכה) - עמודים טכניים
10. **preferences.html** - 17 כפתורים
11. **db_display.html** - 9 כפתורים
12. **db_extradata.html** - 9 כפתורים
13. **research.html** - כפתורים
14. **data_import.html** - כפתורים

## הערכת זמן

| שלב | זמן משוער | תיאור |
|-----|-----------|-------|
| **שלב 1: כלים** | 2-3 שעות | יצירת סקריפטים לסריקה ועדכון |
| **שלב 2: ברירות מחדל** | 1-2 שעות | עדכון button-tooltips-config.js |
| **שלב 3: עמודים (גבוהה)** | 4-6 שעות | 5 עמודים עם עדיפות גבוהה |
| **שלב 3: עמודים (בינונית)** | 2-3 שעות | 4 עמודים עם עדיפות בינונית |
| **שלב 3: עמודים (נמוכה)** | 2-3 שעות | 4 עמודים עם עדיפות נמוכה |
| **שלב 4: דינמיים** | 2-3 שעות | עדכון כפתורי toggle דינמיים |
| **שלב 5: בדיקות** | 3-4 שעות | בדיקות אוטומטיות וידניות |
| **סה"כ** | **16-24 שעות** | עבודה מלאה |

## כלי עזר מומלצים

### 1. סקריפט סריקה
```bash
node scripts/scan-button-tooltips.js
```

**פלט:**
- דוח JSON עם כל הכפתורים
- רשימת כפתורים ללא `data-tooltip`
- רשימת כפתורים ללא `data-id`
- המלצות לתיקון

### 2. סקריפט עדכון
```bash
node scripts/update-button-tooltips-batch.js --page trades --dry-run
```

**פלט:**
- תצוגה מקדימה של השינויים
- גיבוי אוטומטי
- עדכון קבצים

### 3. בדיקת כפילות ID
```bash
node scripts/check-button-id-conflicts.js
```

**פלט:**
- רשימת כפילות ID
- המלצות לתיקון

## דוגמאות עבודה

### דוגמה 1: עדכון עמוד trades.html

**לפני:**
```html
<button data-button-type="TOGGLE" data-onclick="toggleSection('top')">▼</button>
<button data-button-type="ADD" data-entity-type="trade">הוסף טרייד</button>
```

**אחרי:**
```html
<button 
    data-button-type="TOGGLE" 
    data-id="toggle-top-section"
    data-onclick="toggleSection('top')"
    data-tooltip="הצג או הסתר את אזור הסיכום"
    data-tooltip-placement="top">
    ▼
</button>
<button 
    data-button-type="ADD" 
    data-entity-type="trade"
    data-id="add-trade-button"
    data-tooltip="הוסף טרייד חדש"
    data-tooltip-placement="top">
    הוסף טרייד
</button>
```

### דוגמה 2: עדכון כפתור toggle דינמי

**לפני:**
```html
<button data-button-type="TOGGLE" data-onclick="toggleSection('summary')">▼</button>
```

**אחרי:**
```html
<!-- ללא data-tooltip - יקבל ברירת מחדל או יעודכן דינמית -->
<button 
    data-button-type="TOGGLE" 
    data-id="toggle-summary"
    data-onclick="toggleSection('summary')">
    ▼
</button>
```

```javascript
// בקובץ JavaScript של העמוד
window.toggleSection = async function(sectionId) {
  // ... לוגיקה קיימת ...
  
  // עדכון טולטיפ דינמי
  const toggleBtn = section.querySelector('button[data-onclick*="toggleSection"]');
  if (toggleBtn && !toggleBtn.hasAttribute('data-tooltip-static')) {
    const isCollapsed = sectionBody.style.display === 'none';
    const tooltip = isCollapsed ? 'הצג סיכום' : 'הסתר סיכום';
    window.advancedButtonSystem.updateTooltip(toggleBtn, tooltip);
  }
};
```

## בדיקות איכות

### Checklist לכל עמוד

- [ ] כל כפתור עם `data-button-type` יש לו `data-id` מפורש
- [ ] כל כפתור קבוע יש לו `data-tooltip` מפורש
- [ ] אין כפילות ID בעמוד
- [ ] כפתורי TOGGLE דינמיים **אין** להם `data-tooltip` (או יש קוד לעדכון)
- [ ] כפתורי TOGGLE קבועים **יש** להם `data-tooltip` ו-`data-tooltip-static="true"`
- [ ] כל הטולטיפים נכונים ותואמים לפעולת הכפתור
- [ ] בדיקה ידנית בדפדפן - כל הטולטיפים מוצגים נכון

## תמיכה

לשאלות או בעיות:
1. ראה `BUTTON_TOOLTIPS_DEVELOPER_GUIDE.md` למדריך מפורט
2. ראה `button-system.md` לתיעוד מלא
3. בדוק את `notes.html` כדוגמה מלאה

## הערות חשובות

1. **תמיד הוסף `data-id` מפורש** - זה מונע כפילות ID
2. **כפתורים קבועים = `data-tooltip`** - כפתורים דינמיים = ללא `data-tooltip`
3. **בדוק כפילות ID** לפני כל עדכון
4. **השתמש ב-`updateTooltip()`** רק לכפתורים דינמיים
5. **עדכן `button-tooltips-config.js`** לפני עדכון העמודים

