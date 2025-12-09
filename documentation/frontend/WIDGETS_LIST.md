# רשימת ווידג'טים במערכת - TikTrack

**תאריך עדכון:** 29 ינואר 2025  
**גרסה:** 1.0.0  
**מטרה:** רשימה מרכזית של כל הווידג'טים במערכת עם מיקומי קבצים, דוקומנטציה וסטטוס

---

## 📋 סקירה כללית

מסמך זה מרכז את כל הווידג'טים במערכת TikTrack, החל מווידג'טי דשבורד ועד ווידג'טים מיוחדים ומערכות ווידג'טים מתקדמות.

**סטטוס כללי:**

- **Dashboard Widgets:** 7 ווידג'טים
- **Special Widgets:** 2 ווידג'טים
- **TradingView Widgets System:** 11 ווידג'טים

---

## 🏠 Dashboard Widgets (עמוד הבית)

ווידג'טים המוצגים בעמוד הבית (`index.html`).

| שם ווידג'ט | קובץ(ים) עיקריים | דוקומנטציה | סטטוס | הערות |
|------------|-------------------|-------------|-------|-------|
| **Recent Items Widget (מאוחד)** | `trading-ui/scripts/widgets/recent-items-widget.js`<br>`trading-ui/styles-new/06-components/_recent-items-widget.css` | [RECENT_ITEMS_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/RECENT_ITEMS_WIDGET_DEVELOPER_GUIDE.md) | ✅ פעיל | ווידג'ט מאוחד: טריידים אחרונים + תוכניות אחרונות עם Bootstrap Tabs |
| **Recent Trades Widget** | `trading-ui/scripts/widgets/recent-trades-widget.js` | - | ⚠️ Deprecated | הוחלף ב-Recent Items Widget |
| **Recent Trade Plans Widget** | `trading-ui/scripts/widgets/recent-trade-plans-widget.js` | - | ⚠️ Deprecated | הוחלף ב-Recent Items Widget |
| **Unified Pending Actions Widget (מאוחד)** | `trading-ui/scripts/widgets/unified-pending-actions-widget.js`<br>`trading-ui/styles-new/06-components/_unified-pending-actions-widget.css` | [UNIFIED_PENDING_ACTIONS_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/UNIFIED_PENDING_ACTIONS_WIDGET_DEVELOPER_GUIDE.md) | ✅ פעיל | ווידג'ט מאוחד: שיוך ויצירת טריידים ותוכניות מרשומות ביצוע (nested tabs) |
| **Pending Executions Highlights Widget** | `trading-ui/scripts/pending-executions-widget.js` | - | ⚠️ Deprecated | הוחלף ב-Unified Pending Actions Widget |
| **Pending Execution Trade Creation Widget** | `trading-ui/scripts/pending-execution-trade-creation.js` | - | ⚠️ Deprecated | הוחלף ב-Unified Pending Actions Widget |
| **Pending Trade Plan Widget** | `trading-ui/scripts/pending-trade-plan-widget.js` | [PENDING_TRADE_PLAN_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/PENDING_TRADE_PLAN_WIDGET_DEVELOPER_GUIDE.md) | ⚠️ Deprecated | הוחלף ב-Unified Pending Actions Widget |
| **Active Alerts Component** | `trading-ui/scripts/active-alerts-component.js` | [ACTIVE_ALERTS_COMPONENT.md](ACTIVE_ALERTS_COMPONENT.md) | ✅ פעיל | קומפוננטת התראות פעילות (Web Component) |
| **Tag Widget (מאוחד)** | `trading-ui/scripts/widgets/tag-widget.js`<br>`trading-ui/styles-new/06-components/_tag-widget.css` | [TAG_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/TAG_WIDGET_DEVELOPER_GUIDE.md) | ✅ פעיל | ענן תגיות + חיפוש מהיר עם Bootstrap Tabs |
| **Ticker List Widget** | `trading-ui/scripts/widgets/ticker-list-widget.js`<br>`trading-ui/styles-new/06-components/_ticker-list-widget.css` | [TICKER_LIST_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/TICKER_LIST_WIDGET_DEVELOPER_GUIDE.md) | ✅ פעיל | רשימת טיקרים עם KPI Cards (3 טאבים: פעילים, רשימת צפיה, כל הטיקרים) |
| **Ticker Chart Widget** | `trading-ui/scripts/widgets/ticker-chart-widget.js`<br>`trading-ui/styles-new/06-components/_ticker-chart-widget.css` | [TICKER_CHART_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/TICKER_CHART_WIDGET_DEVELOPER_GUIDE.md) | ✅ פעיל | גרפים מהירים עם TradingView Mini Charts |

### תלויות Dashboard Widgets

כל הווידג'טים בעמוד הבית נטענים דרך החבילה `dashboard-widgets`:

**Package:** `trading-ui/scripts/init-system/package-manifest.js` → `dashboard-widgets`

**Dependencies:**

- `base` - מערכות בסיסיות
- `services` - שירותי נתונים
- `ui-advanced` - ממשק משתמש מתקדם
- `entity-services` - שירותי ישויות

---

## 🎯 Special Widgets

ווידג'טים מיוחדים לעמודים ספציפיים.

| שם ווידג'ט | קובץ(ים) עיקריים | דוקומנטציה | עמוד | סטטוס | הערות |
|------------|-------------------|-------------|------|-------|-------|
| **History Widget** | `trading-ui/scripts/history-widget.js` | [HISTORY_WIDGET_DEVELOPER_GUIDE.md](HISTORY_WIDGET_DEVELOPER_GUIDE.md) | `history-widget.html` | ✅ פעיל | ווידג'ט היסטוריה עם גרפים וסטטיסטיקות |
| **Emotional Tracking Widget** | `trading-ui/scripts/emotional-tracking-widget.js` | [EMOTIONAL_TRACKING_WIDGET_DEVELOPER_GUIDE.md](EMOTIONAL_TRACKING_WIDGET_DEVELOPER_GUIDE.md) | `emotional-tracking-widget.html` | ✅ פעיל (Mockup) | ווידג'ט תיעוד רגשי |

---

## 📦 TradingView Widgets System

מערכת מרכזית לניהול כל הווידג'טים הרשמיים של TradingView.

**מערכת מרכזית:**

- **Factory & Manager:** `trading-ui/scripts/tradingview-widgets/`
- **תיעוד:** [TRADINGVIEW_WIDGETS_SYSTEM.md](../02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_SYSTEM.md)
- **מדריך מפתח:** [TRADINGVIEW_WIDGETS_DEVELOPER_GUIDE.md](../02-ARCHITECTURE/FRONTEND/TRADINGVIEW_WIDGETS_DEVELOPER_GUIDE.md)

**11 ווידג'טים זמינים:**

| שם ווידג'ט | מזהה | תיאור |
|------------|------|-------|
| **Advanced Chart** | `advanced-chart` | גרף מתקדם עם כלים |
| **Market Overview** | `market-overview` | סקירת שווקים |
| **Symbol Overview** | `symbol-overview` | סקירת סימבול |
| **Ticker** | `ticker` | טיקר |
| **Market Data** | `market-data` | נתוני שוק |
| **Economic Calendar** | `economic-calendar` | לוח כלכלי |
| **Screener** | `screener` | מסנן מניות |
| **Company Profile** | `company-profile` | פרופיל חברה |
| **Technical Analysis** | `technical-analysis` | ניתוח טכני |
| **Fundamental Data** | `fundamental-data` | נתונים בסיסיים |
| **Mini Chart** | `mini-chart` | גרף מיני |

---

## 📚 דוקומנטציה נוספת

### מדריכים כלליים

- **מדריך יצירת ווידג'טים:** [WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/WIDGET_DEVELOPER_GUIDE.md) - סטנדרט ליצירת ווידג'טים חדשים
- **ארכיטקטורת ווידג'טים:** [WIDGET_SYSTEM_ARCHITECTURE.md](../02-ARCHITECTURE/FRONTEND/WIDGET_SYSTEM_ARCHITECTURE.md) - סקירה כללית של מערכת הווידג'טים
- **מדריך מערכת טאבים:** [TAB_SYSTEM_GUIDE.md](../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md) - שימוש ב-Bootstrap Tabs בווידג'טים
- **השוואת ארכיטקטורות:** [WIDGET_ARCHITECTURE_COMPARISON.md](../03-DEVELOPMENT/GUIDES/WIDGET_ARCHITECTURE_COMPARISON.md) - השוואה מפורטת בין גישות

### מדריכים ספציפיים

- **Tag Widget:** [TAG_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/TAG_WIDGET_DEVELOPER_GUIDE.md)
- **Recent Items Widget:** [RECENT_ITEMS_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/RECENT_ITEMS_WIDGET_DEVELOPER_GUIDE.md)
- **Unified Pending Actions Widget:** [UNIFIED_PENDING_ACTIONS_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/UNIFIED_PENDING_ACTIONS_WIDGET_DEVELOPER_GUIDE.md)
- **Ticker List Widget:** [TICKER_LIST_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/TICKER_LIST_WIDGET_DEVELOPER_GUIDE.md)
- **Ticker Chart Widget:** [TICKER_CHART_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/TICKER_CHART_WIDGET_DEVELOPER_GUIDE.md)
- **Pending Trade Plan Widget:** [PENDING_TRADE_PLAN_WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/PENDING_TRADE_PLAN_WIDGET_DEVELOPER_GUIDE.md)
- **History Widget:** [HISTORY_WIDGET_DEVELOPER_GUIDE.md](HISTORY_WIDGET_DEVELOPER_GUIDE.md)
- **Emotional Tracking Widget:** [EMOTIONAL_TRACKING_WIDGET_DEVELOPER_GUIDE.md](EMOTIONAL_TRACKING_WIDGET_DEVELOPER_GUIDE.md)

---

## 🔧 ארכיטקטורות מומלצות

### Module Pattern (IIFE) - מומלץ

**דוגמאות במערכת:**

- Recent Trades Widget
- Recent Trade Plans Widget
- Tag Widget

**תבנית:**

```javascript
;(function () {
  'use strict';
  
  const Widget = {
    init() { /* ... */ },
    render(data) { /* ... */ },
    version: '1.0.0'
  };
  
  window.WidgetName = Widget;
})();
```

### Bootstrap Tabs

**דוגמאות במערכת:**

- Tag Widget (ענן + חיפוש)
- History Widget (טאבים פנימיים)
- ModalManagerV2 (generateTabsHTML)

**תיעוד:** [TAB_SYSTEM_GUIDE.md](../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)

---

## 📊 סיכום

### סטטיסטיקות

- **סה"כ ווידג'טים:** 20
  - Dashboard Widgets: 7
  - Special Widgets: 2
  - TradingView Widgets: 11

- **סטטוס כללי:**
  - ✅ פעיל: 20/20 (100%)
  - ⏳ בפיתוח: 0
  - 📦 מושלם: 20

### תלויות נפוצות

כל הווידג'טים נסמכים על:

- **FieldRendererService** - רינדור שדות אחיד
- **ButtonSystem** - עיבוד כפתורים
- **NotificationSystem** - התראות
- **ModalManagerV2** - מודלים
- **TagService / DashboardData** - שירותי נתונים

---

## 🔄 עדכונים אחרונים

**29 ינואר 2025:**

- ✅ סטנדרטיזציה מלאה של 3 ווידג'טים לדף הבית
- ✅ יצירת תעוד מפתח ל-Recent Items Widget
- ✅ יצירת תעוד מפתח ל-Unified Pending Actions Widget
- ✅ עדכון תעוד Tag Widget
- ✅ יצירת דוח פערים ובעיות

**21 ינואר 2025:**

- ✅ נוסף Tag Widget מאוחד (ענן + חיפוש)
- ✅ הועבר מ-tag-search-controller לווידג'ט מאוחד
- ✅ יצירת רשימת ווידג'טים מרכזית

---

## 📝 הערות למפתחים

1. **לפני יצירת ווידג'ט חדש:**
   - בדוק אם יש ווידג'ט דומה קיים
   - השתמש ב-Module Pattern (IIFE)
   - עקוב אחר הסטנדרט ב-[WIDGET_DEVELOPER_GUIDE.md](../03-DEVELOPMENT/GUIDES/WIDGET_DEVELOPER_GUIDE.md)

2. **עדכון רשימה זו:**
   - הוסף ווידג'ט חדש לרשימה המתאימה
   - ציין את כל הקבצים הרלוונטיים
   - עדכן סטטוס ודוקומנטציה

3. **תמיכה ב-Bootstrap Tabs:**
   - השתמש ב-Bootstrap 5 Tabs לטאבים
   - ראה דוגמאות ב-Tag Widget
   - תיעוד מלא ב-[TAB_SYSTEM_GUIDE.md](../02-ARCHITECTURE/FRONTEND/TAB_SYSTEM_GUIDE.md)

---

**מקור:** `documentation/frontend/WIDGETS_LIST.md`  
**עודכן:** 29 ינואר 2025

