# Wireframe - חיבור Mockups לעמודים קיימים

**תאריך יצירה:** 28 בינואר 2025  
**מבוסס על:** תוכנית מימוש ממשקים מורחבים  
**סטטוס:** ✅ אושר למימוש

---

## אסטרטגיה כללית

**עקרון מרכזי:** יצירת קישורים מעמודים קיימים ל-Mockups, **ללא החלפת** הממשקים הקיימים.

---

## מיפוי קישורים

### 1. מעמוד Tickers → Ticker Dashboard

**מיקום:** עמוד `tickers.html`  
**מיקום כפתור:** בטבלת הטיקרים, בעמודת "פעולות"

```
┌─────────────────────────────────────────────────────────┐
│ טבלת טיקרים                                            │
│                                                         │
│ ┌──────┬────────┬──────┬────────┬──────────┬─────────┐ │
│ │שם   │מחיר   │שינוי│נפח   │פעולות   │         │ │
│ ├──────┼────────┼──────┼────────┼──────────┼─────────┤ │
│ │TSLA │243.22 │+1.74%│ 98M  │[צפה] [ערוך]│         │ │
│ │      │        │      │       │[דשבורד]  │         │ │
│ └──────┴────────┴──────┴────────┴──────────┴─────────┘ │
│                                                         │
│ כפתור "דשבורד" → ticker_dashboard.html?tickerId=123  │
└─────────────────────────────────────────────────────────┘
```

**מימוש:**

- הוספת כפתור "דשבורד מורחב" בעמודת הפעולות
- כפתור עם `data-onclick="navigateToTickerDashboard(tickerId)"`
- שימוש ב-Button System

---

### 2. מ-EntityDetailsModal → Ticker Dashboard

**מיקום:** מודל פרטי טיקר (`EntityDetailsModal`)  
**מיקום כפתור:** בחלק העליון של המודל, ליד כפתור "סגור"

```
┌─────────────────────────────────────────────────────────┐
│ [X] פרטי טיקר: TSLA                    [דשבורד מורחב] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ נתוני שוק: ...                                         │
│                                                         │
│ [תוכן המודל הקיים]                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**מימוש:**

- הוספת כפתור "דשבורד מורחב" ב-`EntityDetailsModal`
- כפתור עם `data-onclick="navigateToTickerDashboard(tickerId)"`
- פתיחה בחלון חדש או ניווט ישיר

---

### 3. מעמוד Trades → Trade History Page

**מיקום:** עמוד `trades.html`  
**מיקום כפתור:** בטבלת הטריידים, בעמודת "פעולות"

```
┌─────────────────────────────────────────────────────────┐
│ טבלת טריידים                                           │
│                                                         │
│ ┌──────┬────────┬──────┬──────────┬─────────┐          │
│ │טיקר │כמות   │מחיר │רווח/הפסד│פעולות  │          │
│ ├──────┼────────┼──────┼──────────┼─────────┤          │
│ │TSLA │ 100   │243.22│  +324$  │[צפה] [ערוך]│          │
│ │      │        │      │          │[היסטוריה]│          │
│ └──────┴────────┴──────┴──────────┴─────────┘          │
│                                                         │
│ כפתור "היסטוריה" → trade_history_page.html?tradeId=123│
└─────────────────────────────────────────────────────────┘
```

**מימוש:**

- הוספת כפתור "היסטוריה" בעמודת הפעולות
- כפתור עם `data-onclick="navigateToTradeHistory(tradeId)"`
- ניווט ל-`trade_history_page.html` עם פילטר

---

### 4. מעמוד Trade Plans → Strategy Analysis Page

**מיקום:** עמוד `trade_plans.html`  
**מיקום כפתור:** בטבלת התוכניות, בעמודת "פעולות"

```
┌─────────────────────────────────────────────────────────┐
│ טבלת תוכניות מסחר                                      │
│                                                         │
│ ┌──────┬────────┬──────┬──────────┬─────────┐          │
│ │שם   │טיקר   │R/R  │סטטוס    │פעולות  │          │
│ ├──────┼────────┼──────┼──────────┼─────────┤          │
│ │תוכנית│TSLA   │ 3.4 │פתוח    │[צפה] [ערוך]│          │
│ │ 1    │        │      │          │[ניתוח]  │          │
│ └──────┴────────┴──────┴──────────┴─────────┘          │
│                                                         │
│ כפתור "ניתוח" → strategy_analysis_page.html?planId=123 │
└─────────────────────────────────────────────────────────┘
```

**מימוש:**

- הוספת כפתור "ניתוח" בעמודת הפעולות
- כפתור עם `data-onclick="navigateToStrategyAnalysis(planId)"`
- ניווט ל-`strategy_analysis_page.html` עם פילטר

---

### 5. מעמוד Portfolio → Portfolio State Page

**מיקום:** עמוד `index.html` (דשבורד)  
**מיקום כפתור:** בסעיף סיכום תיק

```
┌─────────────────────────────────────────────────────────┐
│ סיכום תיק                                               │
│                                                         │
│ יתרה נוכחית: $10,000                                   │
│ רווח/הפסד: +$324                                       │
│                                                         │
│ [צפה במצב תיק היסטורי]                                 │
│                                                         │
│ כפתור → portfolio_state_page.html                      │
└─────────────────────────────────────────────────────────┘
```

**מימוש:**

- הוספת כפתור "צפה במצב תיק היסטורי" בסעיף סיכום
- כפתור עם `data-onclick="navigateToPortfolioState()"`
- ניווט ל-`portfolio_state_page.html`

---

## דפוסי מימוש

### דפוס 1: כפתור בעמודת פעולות

**מיקום:** בטבלאות, בעמודת "פעולות"  
**טכנולוגיה:** Button System עם `data-onclick`

```html
<button 
    data-button-type="VIEW" 
    data-variant="small" 
    data-onclick="navigateToTickerDashboard({{tickerId}})"
    data-text="דשבורד"
    title="צפה בדשבורד מורחב">
</button>
```

### דפוס 2: כפתור במודל

**מיקום:** ב-EntityDetailsModal  
**טכנולוגיה:** Button System עם `data-onclick`

```html
<button 
    data-button-type="VIEW" 
    data-variant="full" 
    data-onclick="navigateToTickerDashboard({{tickerId}})"
    data-text="דשבורד מורחב"
    title="צפה בדשבורד מורחב">
</button>
```

### דפוס 3: קישור בסעיף סיכום

**מיקום:** בסעיפי סיכום או InfoSummary  
**טכנולוגיה:** Button System או קישור טקסט

```html
<a href="portfolio_state_page.html" 
   data-onclick="navigateToPortfolioState()"
   class="btn btn-link">
    צפה במצב תיק היסטורי
</a>
```

---

## פונקציות ניווט

### navigateToTickerDashboard(tickerId)

```javascript
function navigateToTickerDashboard(tickerId) {
    if (!tickerId) {
        window.NotificationSystem?.showError('שגיאה', 'מזהה טיקר חסר');
        return;
    }
    
    const url = `/ticker_dashboard.html?tickerId=${tickerId}`;
    window.location.href = url;
}
```

### navigateToTradeHistory(tradeId)

```javascript
function navigateToTradeHistory(tradeId) {
    if (!tradeId) {
        window.NotificationSystem?.showError('שגיאה', 'מזהה טרייד חסר');
        return;
    }
    
    const url = `/mockups/daily-snapshots/trade_history_page.html?tradeId=${tradeId}`;
    window.location.href = url;
}
```

### navigateToStrategyAnalysis(planId)

```javascript
function navigateToStrategyAnalysis(planId) {
    if (!planId) {
        window.NotificationSystem?.showError('שגיאה', 'מזהה תוכנית חסר');
        return;
    }
    
    const url = `/mockups/daily-snapshots/strategy_analysis_page.html?planId=${planId}`;
    window.location.href = url;
}
```

### navigateToPortfolioState()

```javascript
function navigateToPortfolioState() {
    const url = `/mockups/daily-snapshots/portfolio_state_page.html`;
    window.location.href = url;
}
```

---

## Notes

- **שמירה על הממשקים הקיימים** - לא להחליף את `showEntityDetails` או `EntityDetailsModal`
- **שימוש ב-Button System** - כל הכפתורים עם `data-onclick`
- **ניווט עקבי** - כל הקישורים עובדים באותו אופן
- **תמיכה ב-URL Parameters** - Mockups יקראו את הפרמטרים מ-URL




