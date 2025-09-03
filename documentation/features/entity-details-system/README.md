# מערכת מודולים של רשומה ספציפית - Entity Details System

## 📋 תוכן עניינים
1. [מטרות המערכת](#מטרות-המערכת)
2. [ארכיטקטורה כללית](#ארכיטקטורה-כללית)
3. [מבנה הקבצים](#מבנה-הקבצים)
4. [פונקציונליות מפורטת](#פונקציונליות-מפורטת)
5. [ממשק משתמש](#ממשק-משתמש)
6. [שלבי יישום](#שלבי-יישום)
7. [בדיקות נדרשות](#בדיקות-נדרשות)
8. [קישורים רלוונטיים](#קישורים-רלוונטיים)

## 🎯 מטרות המערכת

### מטרות עיקריות:
- **צמצום עמודות בטבלאות** - הצגת נתונים מרכזיים בלבד בכל עמוד
- **יצירת חלונות פרטים חכמים** לכל רשומה במערכת
- **אפשרות מעבר בין ישויות** דרך קישורים מקושרים
- **מערכת ניווט "הבא/הקודם"** לפי סדר הרשומות בטבלה המקורית
- **ממשק אחיד לכל המערכת** - עיצוב והתנהגות עקביים

### ישויות נתמכות:
המערכת תתמוך בכל הישויות המרכזיות במערכת TikTrack:
- **עסקאות (Executions)** - פרטי עסקה ספציפית
- **טריידים (Trades)** - פרטי טרייד ספציפי  
- **תכנוני השקעה (Trade Plans)** - פרטי תכנון ספציפי
- **טיקרים (Tickers)** - פרטי טיקר ספציפי
- **חשבונות (Accounts)** - פרטי חשבון ספציפי
- **התראות (Alerts)** - פרטי התראה ספציפית
- **הערות (Notes)** - פרטי הערה ספציפית
- **תזרים מזומנים (Cash Flow)** - פרטי תזרים ספציפי
- **אילוצים (Constraints)** - פרטי אילוץ ספציפי
- **עיצובים (Designs)** - פרטי עיצוב ספציפי
- **מחקר (Research)** - פרטי מחקר ספציפי

## 🏛️ ארכיטקטורה כללית

### מבנה המערכת:
```
EntityDetailsSystem (מערכת מרכזית)
├── BaseEntityModule (מודול בסיס)
├── ExecutionDetailsModule (מודול עסקאות)
├── TradeDetailsModule (מודול טריידים)
├── TickerDetailsModule (מודול טיקרים)
├── AccountDetailsModule (מודול חשבונות)
├── AlertDetailsModule (מודול התראות)
├── NoteDetailsModule (מודול הערות)
├── TradePlanDetailsModule (מודול תכנוני השקעה)
├── CashFlowDetailsModule (מודול תזרים מזומנים)
├── ConstraintDetailsModule (מודול אילוצים)
├── DesignDetailsModule (מודול עיצובים)
└── ResearchDetailsModule (מודול מחקר)
```

### עקרונות הארכיטקטורה:
1. **הפרדת אחריות** - כל מודול אחראי על ישות אחת
2. **קוד משותף** - מודול בסיס מכיל פונקציונליות משותפת
3. **תקשורת מרכזית** - המערכת המרכזית מנהלת את כל התקשורת
4. **הרחבה קלה** - הוספת ישות חדשה דורשת רק מודול אחד
5. **ביצועים אופטימליים** - זיכרון מטמון חכם וטעינה דינמית

## 📁 מבנה הקבצים

### קבצי JavaScript:
```
trading-ui/scripts/
├── entity-details-system/
│   ├── entity-details-system.js          # המערכת המרכזית
│   ├── base-entity-module.js             # מודול הבסיס
│   ├── execution-details-module.js       # מודול עסקאות
│   ├── trade-details-module.js           # מודול טריידים
│   ├── ticker-details-module.js          # מודול טיקרים
│   ├── account-details-module.js         # מודול חשבונות
│   ├── alert-details-module.js           # מודול התראות
│   ├── note-details-module.js            # מודול הערות
│   ├── trade-plan-details-module.js      # מודול תכנוני השקעה
│   ├── cash-flow-details-module.js       # מודול תזרים מזומנים
│   ├── constraint-details-module.js      # מודול אילוצים
│   ├── design-details-module.js          # מודול עיצובים
│   └── research-details-module.js        # מודול מחקר
└── entity-details-system.js              # קובץ ייצוא ראשי
```

### קבצי CSS:
```
trading-ui/styles/
├── entity-details-system/
│   ├── entity-details-base.css           # סגנונות בסיס
│   ├── entity-details-modals.css         # סגנונות חלונות
│   ├── entity-details-navigation.css     # סגנונות ניווט
│   └── entity-details-themes.css         # צבעים ונושאים
└── entity-details-system.css             # קובץ ייצוא ראשי
```

### קבצי HTML:
```
trading-ui/
├── entity-details-templates/
│   ├── execution-details-template.html    # תבנית עסקאות
│   ├── trade-details-template.html        # תבנית טריידים
│   ├── ticker-details-template.html       # תבנית טיקרים
│   ├── account-details-template.html      # תבנית חשבונות
│   ├── alert-details-template.html        # תבנית התראות
│   ├── note-details-template.html         # תבנית הערות
│   ├── trade-plan-details-template.html   # תבנית תכנוני השקעה
│   ├── cash-flow-details-template.html    # תבנית תזרים מזומנים
│   ├── constraint-details-template.html   # תבנית אילוצים
│   ├── design-details-template.html       # תבנית עיצובים
│   └── research-details-template.html     # תבנית מחקר
└── entity-details-modal.html              # חלון ראשי
```

## ⚙️ פונקציונליות מפורטת

### 1. מערכת המודולים המרכזית (EntityDetailsSystem)

#### פונקציות עיקריות:
- **`init()`** - אתחול המערכת וכל המודולים
- **`registerModule(entityType, module)`** - רישום מודול חדש
- **`getModule(entityType)`** - קבלת מודול לפי סוג ישות
- **`openDetails(entityType, entityId, sourceTable)`** - פתיחת מודול פרטים
- **`navigateNext()`** - מעבר לרשומה הבאה
- **`navigatePrevious()`** - מעבר לרשומה הקודמת
- **`addToHistory(entityType, entityId, sourceTable)`** - הוספה להיסטוריה
- **`getHistory()`** - קבלת היסטוריית צפייה
- **`clearHistory()`** - ניקוי ההיסטוריה

#### ניהול מצב:
- **`saveState()`** - שמירת המצב הנוכחי
- **`restoreState()`** - שחזור המצב הקודם
- **`getCurrentEntity()`** - קבלת הישות הנוכחית
- **`setSourceTable(tableId, data)`** - הגדרת טבלה מקור לניווט

### 2. מודול הבסיס (BaseEntityModule)

#### פונקציות משותפות:
- **`show(data)`** - הצגת המודול עם נתונים
- **`hide()`** - הסתרת המודול
- **`loadData(entityId)`** - טעינת נתונים מהשרת
- **`renderContent(data)`** - עיבוד הנתונים לתצוגה
- **`handleNavigation()`** - טיפול בניווט "הבא/הקודם"
- **`showError(message)`** - הצגת שגיאות
- **`showLoading()`** - הצגת מצב טעינה
- **`hideLoading()`** - הסתרת מצב טעינה

#### ניהול אירועים:
- **`bindEvents()`** - קישור אירועים לאלמנטים
- **`unbindEvents()`** - הסרת קישורי אירועים
- **`handleModalClose()`** - טיפול בסגירת המודל
- **`handleNavigationClick()`** - טיפול בלחיצות ניווט

### 3. מודולים ספציפיים לכל ישות

#### ExecutionDetailsModule (מודול עסקאות):
- **`showExecutionDetails(executionId)`** - הצגת פרטי עסקה
- **`loadExecutionData(executionId)`** - טעינת נתוני עסקה
- **`renderExecutionContent(execution, trade, ticker)`** - עיבוד תוכן עסקה
- **`handleTradeLink(tradeId)`** - טיפול בקישור לטרייד
- **`handleTickerLink(tickerId)`** - טיפול בקישור לטיקר
- **`handleAccountLink(accountId)`** - טיפול בקישור לחשבון

#### TradeDetailsModule (מודול טריידים):
- **`showTradeDetails(tradeId)`** - הצגת פרטי טרייד
- **`loadTradeData(tradeId)`** - טעינת נתוני טרייד
- **`renderTradeContent(trade, ticker, account)`** - עיבוד תוכן טרייד
- **`handleTickerLink(tickerId)`** - טיפול בקישור לטיקר
- **`handleAccountLink(accountId)`** - טיפול בקישור לחשבון
- **`handleExecutionsLink(tradeId)`** - טיפול בקישור לעסקאות

#### TickerDetailsModule (מודול טיקרים):
- **`showTickerDetails(tickerId)`** - הצגת פרטי טיקר
- **`loadTickerData(tickerId)`** - טעינת נתוני טיקר
- **`renderTickerContent(ticker, trades, alerts)`** - עיבוד תוכן טיקר
- **`handleTradesLink(tickerId)`** - טיפול בקישור לטריידים
- **`handleAlertsLink(tickerId)`** - טיפול בקישור להתראות
- **`handlePlansLink(tickerId)`** - טיפול בקישור לתכנונים

### 4. מערכת הקישורים החכמה

#### זיהוי אוטומטי של קישורים:
- **`detectLinkedFields(entityType, data)`** - זיהוי שדות מקושרים
- **`createEntityLinks(entityType, data)`** - יצירת קישורים
- **`bindLinkEvents(links)`** - קישור אירועים לקישורים
- **`handleLinkClick(event, linkData)`** - טיפול בלחיצות על קישורים

#### מפת הקישורים:
```javascript
const ENTITY_LINKS = {
  'execution': {
    'trade_id': { type: 'trade', module: 'trade-details', label: 'טרייד' },
    'ticker_id': { type: 'ticker', module: 'ticker-details', label: 'טיקר' },
    'account_id': { type: 'account', module: 'account-details', label: 'חשבון' }
  },
  'trade': {
    'ticker_id': { type: 'ticker', module: 'ticker-details', label: 'טיקר' },
    'account_id': { type: 'account', module: 'account-details', label: 'חשבון' },
    'plan_id': { type: 'trade_plan', module: 'trade-plan-details', label: 'תכנון' }
  },
  'ticker': {
    'trades': { type: 'trade', module: 'trade-details', label: 'טריידים', multiple: true },
    'alerts': { type: 'alert', module: 'alert-details', label: 'התראות', multiple: true },
    'plans': { type: 'trade_plan', module: 'trade-plan-details', label: 'תכנונים', multiple: true }
  }
}
```

### 5. מערכת הניווט "הבא/הקודם"

#### ניהול סדר הרשומות:
- **`setSourceTableOrder(tableId, data, currentIndex)`** - הגדרת סדר טבלה
- **`getNextEntity()`** - קבלת הרשומה הבאה
- **`getPreviousEntity()`** - קבלת הרשומה הקודמת
- **`canNavigateNext()`** - בדיקה אם אפשר לעבור הבא
- **`canNavigatePrevious()`** - בדיקה אם אפשר לעבור הקודם
- **`updateNavigationButtons()`** - עדכון כפתורי ניווט

#### שמירת הקשר:
- **`saveTableContext(tableId, data, currentIndex)`** - שמירת הקשר טבלה
- **`restoreTableContext(tableId)`** - שחזור הקשר טבלה
- **`getCurrentTableContext()`** - קבלת הקשר טבלה נוכחי

## 🎨 ממשק משתמש

### 1. חלון פרטים ראשי

#### מבנה HTML:
```html
<div id="entityDetailsModal" class="modal fade entity-details-modal">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <!-- כותרת המודל -->
      <div class="modal-header entity-details-header">
        <h5 id="entityDetailsTitle" class="modal-title">
          <i id="entityIcon" class="entity-icon"></i>
          <span id="entityName">שם הישות</span>
          <span id="entityId" class="entity-id">#123</span>
        </h5>
        
        <!-- כפתורי ניווט -->
        <div class="entity-navigation">
          <button id="prevEntityBtn" class="btn btn-outline-secondary btn-sm" disabled>
            <i class="fas fa-chevron-right"></i> הקודם
          </button>
          <button id="nextEntityBtn" class="btn btn-outline-secondary btn-sm" disabled>
            הבא <i class="fas fa-chevron-left"></i>
          </button>
        </div>
        
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      
      <!-- תוכן המודל -->
      <div class="modal-body entity-details-content" id="entityDetailsContent">
        <!-- תוכן דינמי יוכנס כאן -->
      </div>
      
      <!-- כפתורי פעולה -->
      <div class="modal-footer entity-details-footer">
        <div class="entity-actions">
          <!-- כפתורי פעולה ייחודיים לכל ישות -->
        </div>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
      </div>
    </div>
  </div>
</div>
```

### 2. עיצוב מותאם לכל ישות

#### צבעים ואייקונים:
```css
/* עסקאות - כחול */
.entity-execution {
  --entity-color: #17a2b8;
  --entity-hover-color: #138496;
  --entity-light-color: #d1ecf1;
}

/* טריידים - כחול כהה */
.entity-trade {
  --entity-color: #007bff;
  --entity-hover-color: #0056b3;
  --entity-light-color: #cce7ff;
}

/* טיקרים - אדום */
.entity-ticker {
  --entity-color: #dc3545;
  --entity-hover-color: #c82333;
  --entity-light-color: #f8d7da;
}

/* חשבונות - ירוק */
.entity-account {
  --entity-color: #28a745;
  --entity-hover-color: #1e7e34;
  --entity-light-color: #d4edda;
}

/* התראות - כתום */
.entity-alert {
  --entity-color: #ff9c05;
  --entity-hover-color: #e68900;
  --entity-light-color: #fff3cd;
}
```

### 3. קישורים חכמים בטבלאות

#### עיצוב קישורים:
```css
.entity-link {
  cursor: pointer;
  color: var(--entity-color);
  text-decoration: none;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
}

.entity-link:hover {
  background-color: var(--entity-light-color);
  color: var(--entity-hover-color);
  transform: scale(1.02);
}

.entity-link::after {
  content: '🔗';
  font-size: 0.8em;
  margin-left: 4px;
  opacity: 0.7;
}

.entity-link:hover::after {
  opacity: 1;
}
```

## 🚀 שלבי יישום

### שלב 1: תשתית המערכת (שבוע 1)

#### משימות:
1. **יצירת מבנה תיקיות** - יצירת כל התיקיות והקבצים הנדרשים
2. **יצירת המערכת המרכזית** - `entity-details-system.js` עם פונקציות בסיס
3. **יצירת מודול הבסיס** - `base-entity-module.js` עם פונקציונליות משותפת
4. **יצירת חלון HTML ראשי** - `entity-details-modal.html` עם מבנה בסיסי
5. **יצירת סגנונות בסיס** - `entity-details-base.css` עם עיצוב ראשוני

#### בדיקות:
- המערכת נטענת ללא שגיאות
- חלון המודל נפתח ונסגר
- פונקציות הבסיס עובדות

### שלב 2: מודול ראשון - עסקאות (שבוע 2)

#### משימות:
1. **יצירת מודול עסקאות** - `execution-details-module.js`
2. **יצירת תבנית עסקאות** - `execution-details-template.html`
3. **יישום פונקציונליות** - טעינת נתונים, הצגת תוכן, קישורים
4. **עיצוב מותאם** - צבעים ואייקונים לעסקאות
5. **שילוב עם עמוד עסקעות** - הוספת קישורים לטבלה

#### בדיקות:
- לחיצה על עסקה פותחת חלון פרטים
- הנתונים נטענים נכון מהשרת
- הקישורים לטריידים וטיקרים עובדים
- העיצוב מתאים לעסקאות

### שלב 3: הרחבה הדרגתית (שבועות 3-4)

#### משימות:
1. **יצירת מודול טריידים** - `trade-details-module.js`
2. **יצירת מודול טיקרים** - `ticker-details-module.js`
3. **יצירת מודול חשבונות** - `account-details-module.js`
4. **יישום מערכת הקישורים** - זיהוי אוטומטי וקישורים
5. **שיפור העיצוב** - סגנונות מותאמים לכל ישות

#### בדיקות:
- כל המודולים נטענים נכון
- הקישורים בין ישויות עובדים
- העיצוב אחיד ומתאים לכל ישות
- הביצועים טובים

### שלב 4: מערכת ניווט "הבא/הקודם" (שבוע 5)

#### משימות:
1. **יישום מערכת הניווט** - כפתורי הבא/הקודם
2. **שמירת הקשר טבלה** - זיכרון של סדר הרשומות
3. **ניהול מצב** - שמירה ושחזור של מצב הניווט
4. **שיפור חוויית משתמש** - אנימציות ומעברים חלקים
5. **בדיקות מקיפות** - כל התרחישים האפשריים

#### בדיקות:
- כפתורי הבא/הקודם עובדים נכון
- המעבר בין רשומות חלק
- המצב נשמר בין פתיחות חלון
- הניווט עובד בכל סוגי הטבלאות

### שלב 5: יישום מלא במערכת (שבועות 6-7)

#### משימות:
1. **יצירת מודולים לשאר הישויות** - התראות, הערות, תכנונים
2. **שילוב עם כל העמודים** - הוספת קישורים לכל הטבלאות
3. **אופטימיזציה** - שיפור ביצועים וזיכרון מטמון
4. **בדיקות מקיפות** - כל המערכת עובדת נכון
5. **תיעוד סופי** - עדכון כל התיעוד הרלוונטי

#### בדיקות:
- כל המודולים עובדים נכון
- המערכת עובדת בכל העמודים
- הביצועים טובים גם עם הרבה נתונים
- חוויית המשתמש חלקה ומהנה

### שלב 6: בדיקות ואופטימיזציה (שבוע 8)

#### משימות:
1. **בדיקות משתמש** - בדיקה עם משתמשים אמיתיים
2. **בדיקות ביצועים** - מדידת מהירות וזיכרון
3. **אופטימיזציה** - שיפור הקוד והביצועים
4. **תיקון באגים** - פתרון בעיות שנתגלו
5. **תיעוד סופי** - עדכון התיעוד לפי התוצאות

#### בדיקות:
- המערכת יציבה ומהירה
- אין באגים או בעיות
- חוויית המשתמש מעולה
- התיעוד מדויק ומעודכן

## 🧪 בדיקות נדרשות

### 1. בדיקות פונקציונליות

#### בדיקות מודולים:
- [ ] כל מודול נטען נכון
- [ ] כל מודול מציג נתונים נכון
- [ ] כל מודול מטפל בשגיאות נכון
- [ ] כל מודול נסגר נכון

#### בדיקות קישורים:
- [ ] קישורים בין ישויות עובדים
- [ ] קישורים מציגים נתונים נכונים
- [ ] קישורים מטפלים בשגיאות
- [ ] קישורים שומרים היסטוריה

#### בדיקות ניווט:
- [ ] כפתורי הבא/הקודם עובדים
- [ ] הניווט שומר מצב
- [ ] הניווט עובד בכל הטבלאות
- [ ] הניווט מטפל בגבולות (ראשון/אחרון)

### 2. בדיקות ביצועים

#### בדיקות טעינה:
- [ ] מודולים נפתחים תוך פחות מ-500ms
- [ ] נתונים נטענים תוך פחות מ-1 שנייה
- [ ] המערכת לא מאטה את הדפדפן
- [ ] זיכרון מטמון עובד נכון

#### בדיקות זיכרון:
- [ ] אין דליפות זיכרון
- [ ] זיכרון מטמון מתנקה נכון
- [ ] המערכת עובדת גם עם הרבה נתונים
- [ ] אין בעיות עם חלונות מרובים

### 3. בדיקות חוויית משתמש

#### בדיקות עיצוב:
- [ ] העיצוב אחיד בכל המודולים
- [ ] הצבעים מתאימים לכל ישות
- [ ] האייקונים ברורים ומתאימים
- [ ] הממשק נוח לשימוש

#### בדיקות ניווט:
- [ ] המעבר בין ישויות חלק
- [ ] הכפתורים ברורים ונגישים
- [ ] ההיסטוריה עובדת נכון
- [ ] הניווט אינטואיטיבי

### 4. בדיקות תאימות

#### בדיקות דפדפנים:
- [ ] עובד ב-Chrome (גרסה אחרונה)
- [ ] עובד ב-Firefox (גרסה אחרונה)
- [ ] עובד ב-Safari (גרסה אחרונה)
- [ ] עובד ב-Edge (גרסה אחרונה)

#### בדיקות מכשירים:
- [ ] עובד במחשבים שולחניים
- [ ] עובד במחשבים ניידים
- [ ] עובד בטאבלטים
- [ ] עובד בסמארטפונים

## 🔗 קישורים רלוונטיים

### דוקומנטציה קיימת:
- [מערכת צבעים גלובלית](../color-scheme-system/README.md) - מידע על מערכת הצבעים
- [מערכת התראות](../notification-system/README.md) - מידע על מערכת ההתראות
- [מערכת טבלאות](../tables/README.md) - מידע על מערכת הטבלאות
- [מערכת פילטרים](../filter-system/README.md) - מידע על מערכת הפילטרים

### קבצי קוד קיימים:
- [executions.js](../../../trading-ui/scripts/executions.js) - קוד עמוד עסקעות
- [trades.js](../../../trading-ui/scripts/trades.js) - קוד עמוד טריידים
- [tickers.js](../../../trading-ui/scripts/ticker-service.js) - קוד שירות טיקרים
- [accounts.js](../../../trading-ui/scripts/account-service.js) - קוד שירות חשבונות

### API endpoints:
- `/api/v1/executions/` - API עסקאות
- `/api/v1/trades/` - API טריידים
- `/api/v1/tickers/` - API טיקרים
- `/api/v1/accounts/` - API חשבונות
- `/api/v1/alerts/` - API התראות
- `/api/v1/notes/` - API הערות

## 📝 הערות חשובות

### שיקולי ביצועים:
- **זיכרון מטמון חכם** - שמירת נתונים שכבר נטענו
- **טעינה הדרגתית** - טעינת נתונים רק כשצריך
- **ניקוי זיכרון** - הסרת נתונים ישנים מהזיכרון
- **אופטימיזציה של שאילתות** - שימוש ב-API יעיל

### שיקולי אבטחה:
- **אימות הרשאות** - בדיקה שהמשתמש יכול לגשת לנתונים
- **סינון קלט** - מניעת הזרקת קוד זדוני
- **הצפנת נתונים רגישים** - הגנה על מידע פיננסי
- **לוג פעילות** - תיעוד כל הפעולות

### שיקולי תחזוקה:
- **קוד מודולרי** - קל להוסיף ולשנות פונקציונליות
- **תיעוד מפורט** - כל פונקציה מתועדת היטב
- **בדיקות אוטומטיות** - בדיקות שמריצות אוטומטית
- **ניהול גרסאות** - מעקב אחר שינויים בקוד

## 🎯 סיכום

מערכת המודולים של רשומה ספציפית היא פרויקט מורכב ומשמעותי שישפר משמעותית את חוויית המשתמש במערכת TikTrack. המערכת תאפשר למשתמשים לגשת למידע מפורט על כל ישות במערכת דרך ממשק אחיד וחכם, תוך שמירה על ביצועים טובים וחוויית משתמש מעולה.

הפרויקט מחולק לשלבים לוגיים שמאפשרים פיתוח הדרגתי ובדיקה מתמשכת. כל שלב בונה על הקודם ומאפשר לזהות ולפתור בעיות מוקדם ככל האפשר.

המערכת תוכננה להיות מודולרית וניתנת להרחבה, כך שניתן יהיה להוסיף ישויות חדשות בקלות בעתיד. הקוד נכתב בצורה נקייה ומתועדת היטב, מה שיאפשר תחזוקה קלה ושיפורים עתידיים.
