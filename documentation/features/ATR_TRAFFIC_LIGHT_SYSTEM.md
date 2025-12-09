# מערכת רמזור ATR - TikTrack

## סקירה כללית

מערכת רמזור ATR מספקת אינדיקציה ויזואלית מהירה של רמת התנודתיות (volatility) של נכס, באמצעות 3 רמות צבע:

- **ירוק**: ATR נמוך - תנודתיות נמוכה
- **צהוב**: ATR בינוני - תנודתיות בינונית
- **אדום**: ATR גבוה - תנודתיות גבוהה

## הגדרות והעדפות

### העדפות משתמש

המערכת משתמשת ב-2 העדפות משתמש:

1. **atr_high_threshold** (ברירת מחדל: 3.0%)
   - גבול ATR גבוה
   - כאשר ATR עולה על ערך זה, הרמזור משתנה מירוק לצהוב

2. **atr_danger_threshold** (ברירת מחדל: 5.0%)
   - גבול ATR מסוכן
   - כאשר ATR עולה על ערך זה, הרמזור משתנה מצהוב לאדום

### קבוצת העדפות

העדפות אלה משויכות לקבוצת `trading_settings` (הגדרות מסחר).

## לוגיקת חישוב

### חישוב ATR באחוזים

ATR באחוזים מחושב כך:

```
atrPercent = (ATR / מחיר_נוכחי) * 100
```

### לוגיקת רמזור

```javascript
if (atrPercent < highThreshold) {
    // ירוק - נמוך
    level = 'green';
    label = 'נמוך';
} else if (atrPercent < dangerThreshold) {
    // צהוב - בינוני
    level = 'yellow';
    label = 'בינוני';
} else {
    // אדום - גבוה
    level = 'red';
    label = 'גבוה';
}
```

### דוגמאות

| ATR מוחלט | מחיר נוכחי | ATR באחוזים | רמזור | הסבר |
|-----------|------------|-------------|-------|------|
| 2.5 | 100 | 2.5% | ירוק | מתחת ל-3% |
| 3.5 | 100 | 3.5% | צהוב | בין 3% ל-5% |
| 6.0 | 100 | 6.0% | אדום | מעל 5% |

## שימוש במערכת

### FieldRendererService.renderATR()

הפונקציה המרכזית להצגת ATR עם רמזור:

```javascript
// דוגמה בסיסית
const html = FieldRendererService.renderATR(2.5, 2.5);

// עם אפשרויות
const html = FieldRendererService.renderATR(2.5, 2.5, {
    highThreshold: 3.0,
    dangerThreshold: 5.0,
    showValue: true,
    showBadge: true
});
```

### פרמטרים

- **atrValue** (number): ערך ATR מוחלט
- **atrPercent** (number): ערך ATR באחוזים
- **options** (object, optional):
  - `highThreshold` (number): גבול גבוה (default: מהעדפות)
  - `dangerThreshold` (number): גבול מסוכן (default: מהעדפות)
  - `showValue` (boolean): להציג את הערך (default: true)
  - `showBadge` (boolean): להציג badge רמזור (default: true)

### פלט HTML

```html
<!-- ירוק -->
<span class="atr-value atr-green" dir="ltr">
  <span class="atr-number">2.5%</span>
  <span class="badge bg-success">נמוך</span>
</span>

<!-- צהוב -->
<span class="atr-value atr-yellow" dir="ltr">
  <span class="atr-number">3.5%</span>
  <span class="badge bg-warning">בינוני</span>
</span>

<!-- אדום -->
<span class="atr-value atr-red" dir="ltr">
  <span class="atr-number">6.0%</span>
  <span class="badge bg-danger">גבוה</span>
</span>
```

## אינטגרציה עם מערכת הרינדור

### שימוש במודול פרטי טיקר

```javascript
// entity-details-renderer.js
const atrValue = marketData.atr;
const currentPrice = marketData.price;
const atrPercent = (atrValue / currentPrice) * 100;

const atrHtml = FieldRendererService.renderATR(atrValue, atrPercent);
```

### שימוש בטופסי הוספה

```javascript
// executions.js, trade_plans.js
async function updateATRDisplay(tickerId) {
    const quote = await fetchQuote(tickerId);
    const atrValue = quote.atr;
    const currentPrice = quote.price;
    const atrPercent = (atrValue / currentPrice) * 100;
    
    const atrElement = document.getElementById('atr-display');
    if (atrElement) {
        atrElement.innerHTML = FieldRendererService.renderATR(atrValue, atrPercent);
    }
}
```

### שימוש ברשימות

```javascript
// trades.js, trade_plans.js
function renderATRInTable(quote) {
    const atrValue = quote.atr;
    const currentPrice = quote.price;
    const atrPercent = (atrValue / currentPrice) * 100;
    
    return FieldRendererService.renderATR(atrValue, atrPercent);
}
```

## CSS Classes

### Classes לרמזור

- `.atr-green`: רקע ירוק בהיר (רמה נמוכה)
- `.atr-yellow`: רקע צהוב/כתום (רמה בינונית)
- `.atr-red`: רקע אדום (רמה גבוהה)

### Classes לערך

- `.atr-value`: קונטיינר ראשי
- `.atr-number`: ערך ATR המספרי
- `.atr-badge`: Badge רמזור

## טעינת העדפות

הפונקציה `renderATR()` טוענת את העדפות המשתמש אוטומטית:

```javascript
// טעינה אוטומטית מהעדפות
const highThreshold = await getCurrentPreference('atr_high_threshold') || 3.0;
const dangerThreshold = await getCurrentPreference('atr_danger_threshold') || 5.0;
```

אם העדפות לא נטענו, משתמשים בברירות מחדל (3% ו-5%).

## תאימות אחור

- אם העדפות לא קיימות, משתמשים בברירות מחדל
- אם ATR לא זמין, מציגים "-" או ערך ריק
- אם `atrPercent` לא מסופק, מחשבים אותו מ-`atrValue` ו-`currentPrice`

## מקומות תצוגה

הרמזור מוצג בכל המקומות שמציגים ATR:

1. **מודול פרטי טיקר** - תצוגת ATR בפרטי נכס
2. **טופס הוספת ביצוע** - תצוגת ATR בעת בחירת טיקר
3. **טופס הוספת תכנון מסחר** - תצוגת ATR בעת בחירת טיקר
4. **רשימות עסקאות** - עמודת ATR בטבלאות
5. **רשימות תכנונים** - עמודת ATR בטבלאות
6. **כל מקום אחר** - כל מקום שמציג ATR במערכת

## עדכון עתידי

לעתיד ניתן להוסיף:

- הגדרת צבעים מותאמים אישית לכל רמה
- הגדרת גבולות נוספים (למשל 4 רמות)
- אינטגרציה עם התראות (התראה כאשר ATR גבוה)
- היסטוריית רמזור (גרף שינוי רמזור לאורך זמן)

## קשרים למערכות אחרות

- **FieldRendererService**: מערכת הרינדור המרכזית
- **PreferencesService**: טעינת העדפות משתמש
- **ATRCalculator**: חישוב ATR מהנתונים
- **EntityDetailsService**: נתוני נכסים כולל ATR

