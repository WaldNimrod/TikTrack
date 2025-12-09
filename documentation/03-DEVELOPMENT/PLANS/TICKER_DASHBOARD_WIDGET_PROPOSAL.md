# הצעה לוויגיט דשבורד טיקר - Ticker Dashboard Widget

**תאריך יצירה:** דצמבר 2025  
**גרסה:** 1.0.0  
**מטרה:** הצעה לממשק משתמש וויגיט דשבורד טיקר לדף הבית

---

## 📋 סקירה כללית

וויגיט דשבורד טיקר יציג סיכום מהיר של טיקרים פעילים עם נתונים מרכזיים, גישה מהירה לדשבורד המלא, ומידע עדכני על ביצועים.

**מיקום:** דף הבית (`index.html`) - שורה שנייה, עמודה ימנית (מחליף "וויג'ט עתידי")

---

## 🎯 מטרות הוויגיט

1. **סיכום מהיר** - הצגת טיקרים פעילים עם נתונים מרכזיים
2. **גישה מהירה** - קישור ישיר לדשבורד המלא של כל טיקר
3. **מידע עדכני** - מחיר, שינוי, נפח, ונתונים טכניים בסיסיים
4. **אינטראקטיביות** - אפשרות לבחור טיקר ולהציג פרטים

---

## 🎨 הצעת ממשק משתמש

### מבנה כללי

```
┌─────────────────────────────────────────────────┐
│  📊 דשבורד טיקרים                    [🔄 רענן] │
├─────────────────────────────────────────────────┤
│  [טיקרים פעילים] [מועדפים] [כל הטיקרים]      │ ← Bootstrap Tabs
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ NFLX                    $102.49  -1.41% │   │ ← KPI Card מיניאטורי
│  │ ATR: 3.76% | Vol: 26.28M | MA20: -2.43%│   │
│  │ [📊 דשבורד מלא]                          │   │ ← כפתור לדשבורד
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ TSLA                    $245.12  +2.15% │   │
│  │ ATR: 4.12% | Vol: 45.12M | MA20: +1.23%│   │
│  │ [📊 דשבורד מלא]                          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ AAPL                    $178.45  +0.85%  │   │
│  │ ATR: 2.98% | Vol: 78.34M | MA20: +0.45% │   │
│  │ [📊 דשבורד מלא]                          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [הצג עוד...]                                   │ ← אם יש יותר מ-3 טיקרים
│                                                 │
└─────────────────────────────────────────────────┘
```

### גרסה מורחבת (עם גרף מיני)

```
┌─────────────────────────────────────────────────┐
│  📊 דשבורד טיקרים                    [🔄 רענן] │
├─────────────────────────────────────────────────┤
│  [טיקרים פעילים] [מועדפים] [כל הטיקרים]      │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ NFLX                    $102.49  -1.41% │   │
│  │ ┌───────────────────────────────────┐   │   │
│  │ │     [גרף מיני - TradingView]      │   │   │ ← Mini Chart
│  │ └───────────────────────────────────┘   │   │
│  │ ATR: 3.76% | Vol: 26.28M | MA20: -2.43%│   │
│  │ [📊 דשבורד מלא]                          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ... (עוד טיקרים)                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📊 תוכן הוויגיט

### טאב 1: טיקרים פעילים

**מקור נתונים:**

- טיקרים עם סטטוס `open` ברמת `UserTicker`
- מיון לפי: תאריך עדכון אחרון / נפח / שינוי יומי

**תצוגה:**

- עד 3-5 טיקרים פעילים (configurable)
- KPI Card מיניאטורי לכל טיקר:
  - **שורה 1:** סמל טיקר + מחיר נוכחי + שינוי יומי (%)
  - **שורה 2:** ATR | נפח | יחס ל-MA 20
  - **שורה 3:** כפתור "דשבורד מלא" (קישור ל-`/ticker-dashboard.html?tickerId={id}`)

**אופציונלי:**

- גרף מיני (TradingView Mini Chart) - אם יש מקום
- Badge עם מספר טיקרים פעילים

### טאב 2: מועדפים

**מקור נתונים:**

- טיקרים מסומנים כמועדפים (אם יש מערכת מועדפים)
- או טיקרים עם `name_custom` (טיקרים מותאמים אישית)

**תצוגה:**

- אותו מבנה כמו טאב "טיקרים פעילים"
- עד 3-5 טיקרים מועדפים

### טאב 3: כל הטיקרים

**מקור נתונים:**

- כל הטיקרים של המשתמש (מ-`/api/tickers/my`)
- מיון לפי: שם / סמל / נפח / שינוי

**תצוגה:**

- רשימה מקוצרת (עד 5-10 טיקרים)
- כפתור "הצג הכל" → קישור לעמוד `tickers.html`

---

## 🎨 עיצוב ו-CSS

### מבנה HTML

```html
<div class="card h-100" id="tickerDashboardWidgetContainer">
  <div class="card-header d-flex align-items-center justify-content-between gap-2">
    <h5 class="mb-0 d-flex align-items-center gap-2">
      <img src="images/icons/entities/ticker.svg" alt="דשבורד טיקרים" class="section-icon">
      <span>דשבורד טיקרים</span>
    </h5>
    <button data-button-type="REFRESH" 
            data-variant="small"
            data-onclick="window.TickerDashboardWidget.refresh()"
            title="רענן נתונים">
    </button>
  </div>
  <div class="card-header">
    <!-- Bootstrap Tabs -->
    <ul class="nav nav-tabs" id="tickerDashboardWidgetTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" 
                id="tickerDashboardWidgetActiveTab" 
                data-bs-toggle="tab" 
                data-bs-target="#tickerDashboardWidgetActivePane" 
                type="button" 
                role="tab">
          טיקרים פעילים
          <span class="badge bg-primary ms-2" id="activeTickersCount">0</span>
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" 
                id="tickerDashboardWidgetFavoritesTab" 
                data-bs-toggle="tab" 
                data-bs-target="#tickerDashboardWidgetFavoritesPane" 
                type="button" 
                role="tab">
          מועדפים
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" 
                id="tickerDashboardWidgetAllTab" 
                data-bs-toggle="tab" 
                data-bs-target="#tickerDashboardWidgetAllPane" 
                type="button" 
                role="tab">
          כל הטיקרים
        </button>
      </li>
    </ul>
  </div>
  <div class="card-body">
    <!-- Tab Content -->
    <div class="tab-content" id="tickerDashboardWidgetTabContent">
      <!-- Active Tickers Pane -->
      <div class="tab-pane fade show active" 
           id="tickerDashboardWidgetActivePane" 
           role="tabpanel">
        <div id="tickerDashboardWidgetActiveLoading" class="d-flex align-items-center justify-content-center text-muted small">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          <span>טוען טיקרים פעילים...</span>
        </div>
        <div id="tickerDashboardWidgetActiveError" class="alert alert-danger d-none" role="alert"></div>
        <div id="tickerDashboardWidgetActiveEmpty" class="alert alert-info d-none" role="status">
          אין טיקרים פעילים להצגה
        </div>
        <div id="tickerDashboardWidgetActiveList" class="ticker-dashboard-widget-list"></div>
      </div>
      
      <!-- Favorites Pane -->
      <div class="tab-pane fade" 
           id="tickerDashboardWidgetFavoritesPane" 
           role="tabpanel">
        <!-- Similar structure -->
      </div>
      
      <!-- All Tickers Pane -->
      <div class="tab-pane fade" 
           id="tickerDashboardWidgetAllPane" 
           role="tabpanel">
        <!-- Similar structure -->
      </div>
    </div>
  </div>
</div>
```

### KPI Card מיניאטורי

```html
<div class="ticker-dashboard-widget-item">
  <div class="ticker-dashboard-widget-item-header">
    <div class="ticker-dashboard-widget-item-symbol">
      <strong>NFLX</strong>
      <span class="ticker-dashboard-widget-item-name">Netflix Inc.</span>
    </div>
    <div class="ticker-dashboard-widget-item-price">
      <span class="ticker-dashboard-widget-item-price-value">$102.49</span>
      <span class="ticker-dashboard-widget-item-price-change text-danger">-1.41%</span>
    </div>
  </div>
  
  <!-- Optional: Mini Chart -->
  <div class="ticker-dashboard-widget-item-chart" id="tickerDashboardWidgetChart-NFLX">
    <!-- TradingView Mini Chart will be rendered here -->
  </div>
  
  <div class="ticker-dashboard-widget-item-metrics">
    <span class="ticker-dashboard-widget-item-metric">
      <span class="metric-label">ATR:</span>
      <span class="metric-value">3.76%</span>
    </span>
    <span class="ticker-dashboard-widget-item-metric">
      <span class="metric-label">נפח:</span>
      <span class="metric-value">26.28M</span>
    </span>
    <span class="ticker-dashboard-widget-item-metric">
      <span class="metric-label">MA20:</span>
      <span class="metric-value text-danger">-2.43%</span>
    </span>
  </div>
  
  <div class="ticker-dashboard-widget-item-actions">
    <button data-button-type="DASHBOARD"
            data-variant="small"
            data-onclick="window.location.href='/ticker-dashboard.html?tickerId=422'"
            title="דשבורד מלא">
      <img src="images/icons/tabler/gauge.svg" width="16" height="16" alt="דשבורד" class="icon me-1">
      דשבורד מלא
    </button>
  </div>
</div>
```

---

## 🔧 תכונות טכניות

### 1. טעינת נתונים

**מקורות:**

- `/api/tickers/my` - רשימת טיקרים של המשתמש
- `EntityDetailsService.get_entity_details('ticker', id)` - נתונים מפורטים לכל טיקר

**Cache:**

- שימוש ב-`UnifiedCacheManager` עם TTL של 5 דקות
- Invalidation אוטומטי לאחר עדכון טיקרים

### 2. רינדור KPI Cards

**שימוש במערכות כלליות:**

- `FieldRendererService.renderAmount()` - מחירים
- `FieldRendererService.renderNumericValue()` - אחוזים
- `FieldRendererService.renderATR()` - ATR עם traffic light
- `ButtonSystem` - כפתורים

### 3. גרף מיני (אופציונלי)

**אם נכלל:**

- TradingView Mini Chart
- גובה: 60-80px
- רוחב: 100% של הקונטיינר
- צבעים: לפי Theme (dark/light)

### 4. אינטראקטיביות

**אירועים:**

- לחיצה על KPI Card → פתיחת דשבורד מלא
- לחיצה על כפתור "דשבורד מלא" → ניווט לדשבורד
- רענון → טעינה מחדש של נתונים

---

## ⚙️ קונפיגורציה

### Config Object

```javascript
{
  defaultTab: 'active', // 'active' | 'favorites' | 'all'
  maxItems: {
    active: 5,      // מקסימום טיקרים פעילים
    favorites: 5,   // מקסימום מועדפים
    all: 10         // מקסימום בכל הטיקרים
  },
  showMiniChart: false, // האם להציג גרף מיני
  refreshInterval: 300000, // 5 דקות (אופציונלי)
  sortBy: 'volume' // 'volume' | 'change' | 'name' | 'updated'
}
```

---

## 📦 אינטגרציה במערכת

### 1. Package Manifest

```javascript
// trading-ui/scripts/init-system/package-manifest.js
'dashboard-widgets': {
  scripts: [
    {
      file: 'widgets/ticker-dashboard-widget.js',
      globalCheck: 'window.TickerDashboardWidget',
      description: 'Ticker dashboard widget for home page',
      required: true,
      loadOrder: 6
    }
  ]
}
```

### 2. Page Config

```javascript
// trading-ui/scripts/page-initialization-configs.js
index: {
  packages: [
    // ... existing packages ...
    'dashboard-widgets' // Already included
  ],
  requiredGlobals: [
    // ... existing globals ...
    'TickerDashboardWidget'
  ],
  customInitializers: [
    // ... existing initializers ...
    async () => {
      if (window.TickerDashboardWidget) {
        window.TickerDashboardWidget.init('tickerDashboardWidgetContainer', {
          defaultTab: 'active',
          maxItems: { active: 5, favorites: 5, all: 10 },
          showMiniChart: false
        });
      }
    }
  ]
}
```

### 3. HTML

```html
<!-- Replace "וויג'ט עתידי" section -->
<div class="col-md-6">
  <div class="card h-100" id="tickerDashboardWidgetContainer">
    <!-- Widget HTML structure -->
  </div>
</div>
```

---

## 🎯 דרישות פונקציונליות

### 1. טעינת נתונים

- ✅ טעינת טיקרים פעילים מ-`/api/tickers/my`
- ✅ סינון לפי סטטוס `open` ברמת `UserTicker`
- ✅ טעינת נתונים מפורטים לכל טיקר (מחיר, ATR, MA, וכו')
- ✅ טיפול בשגיאות עם `NotificationSystem`

### 2. תצוגה

- ✅ KPI Cards מיניאטוריים עם נתונים מרכזיים
- ✅ שימוש ב-`FieldRendererService` לעיצוב
- ✅ תמיכה ב-RTL
- ✅ Responsive design

### 3. אינטראקטיביות

- ✅ מעבר בין טאבים (Bootstrap Tabs)
- ✅ קישור לדשבורד מלא
- ✅ רענון נתונים
- ✅ Hover effects (אופציונלי)

### 4. ביצועים

- ✅ Cache עם TTL של 5 דקות
- ✅ Lazy loading של נתונים מפורטים
- ✅ Debounce על רענון

---

## 📊 דוגמאות נתונים

### מבנה נתונים נדרש

```javascript
{
  tickers: [
    {
      id: 422,
      symbol: 'NFLX',
      name: 'Netflix Inc.',
      name_custom: null, // אם יש
      current_price: 102.49,
      daily_change_percent: -1.41,
      daily_change: -1.45,
      volume: 26303526,
      atr: 3.76,
      atr_percent: 3.76,
      ma_20: 104.77,
      ma_20_diff_percent: -2.43,
      week52_high: 133.88,
      week52_low: 101.77,
      volatility: 1.48,
      status: 'open', // UserTicker status
      updated_at: '2025-12-04T17:17:58Z'
    },
    // ... more tickers
  ],
  currency_symbol: '$',
  total_active: 15,
  total_favorites: 3,
  total_all: 25
}
```

---

## 🎨 עיצוב CSS

### קובץ CSS נפרד

**מיקום:** `trading-ui/styles-new/06-components/_ticker-dashboard-widget.css`

**סגנונות:**

- `.ticker-dashboard-widget-item` - קונטיינר לכל טיקר
- `.ticker-dashboard-widget-item-header` - כותרת (סמל + מחיר)
- `.ticker-dashboard-widget-item-metrics` - מדדים טכניים
- `.ticker-dashboard-widget-item-actions` - כפתורים
- `.ticker-dashboard-widget-item-chart` - גרף מיני (אם יש)

**צבעים:**

- שימוש ב-CSS variables של המערכת
- `var(--brand-primary-color)` - צבע ראשי
- `var(--brand-secondary-color)` - צבע משני

---

## 🔄 Workflow מימוש

### שלב 1: תכנון ואישור

- [ ] סקירת הצעה זו
- [ ] אישור ממשק משתמש
- [ ] החלטה על גרף מיני (כן/לא)

### שלב 2: יצירת קבצים

- [ ] `trading-ui/scripts/widgets/ticker-dashboard-widget.js`
- [ ] `trading-ui/styles-new/06-components/_ticker-dashboard-widget.css`
- [ ] עדכון `trading-ui/index.html`

### שלב 3: אינטגרציה

- [ ] עדכון Package Manifest
- [ ] עדכון Page Config
- [ ] בדיקת טעינה

### שלב 4: תיעוד

- [ ] עדכון WIDGETS_LIST.md
- [ ] יצירת מדריך מפתח (אם נדרש)

---

## 📝 הערות

### גרף מיני

- **יתרון:** ויזואליזציה מהירה של תנועת מחיר
- **חסרון:** דורש יותר מקום, עלול להאט טעינה
- **המלצה:** להתחיל בלי, להוסיף אחר כך אם נדרש

### מספר טיקרים

- **טיקרים פעילים:** 3-5 (configurable)
- **מועדפים:** 3-5 (configurable)
- **כל הטיקרים:** 5-10 (configurable)

### ביצועים

- Cache עם TTL של 5 דקות
- Lazy loading של נתונים מפורטים
- Debounce על רענון

---

## 🔗 קישורים רלוונטיים

- [מדריך יצירת ווידג'טים](../GUIDES/WIDGET_DEVELOPER_GUIDE.md)
- [רשימת ווידג'טים](../../frontend/WIDGETS_LIST.md)
- [ארכיטקטורת ווידג'טים](../../02-ARCHITECTURE/FRONTEND/WIDGET_SYSTEM_ARCHITECTURE.md)
- [דשבורד טיקר - תיעוד](../../04-FEATURES/TICKER_DASHBOARD_TECHNICAL_INDICATORS.md)
- [דרישות נתונים דשבורד טיקר](../../04-FEATURES/TICKER_DASHBOARD_DATA_REQUIREMENTS.md)

---

**מקור:** `documentation/03-DEVELOPMENT/PLANS/TICKER_DASHBOARD_WIDGET_PROPOSAL.md`  
**תאריך:** דצמבר 2025

