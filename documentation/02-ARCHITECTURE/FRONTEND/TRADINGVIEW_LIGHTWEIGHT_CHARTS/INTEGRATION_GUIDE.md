# TradingView Lightweight Charts - Integration Guide
# מדריך אינטגרציה

**תאריך יצירה:** 27 בינואר 2025  
**גרסה:** 1.0.0

---

## הוראות התקנה

### אופציה 1: הורדה מקומית (מומלץ)

1. הורד את הקובץ מ-GitHub releases או CDN:
   ```bash
   curl -o trading-ui/scripts/charts/vendor/lightweight-charts.standalone.production.js \
     https://cdn.jsdelivr.net/npm/lightweight-charts/dist/lightweight-charts.standalone.production.js
   ```

2. הוסף את הקובץ ל-HTML:
   ```html
   <script src="/trading-ui/scripts/charts/vendor/lightweight-charts.standalone.production.js"></script>
   ```

### אופציה 2: CDN

```html
<script src="https://cdn.jsdelivr.net/npm/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
```

---

## אינטגרציה במערכת הטעינה

### עדכון package-manifest.js

הוסף package חדש:

```javascript
// 20. TRADINGVIEW CHARTS PACKAGE
'tradingview-charts': {
  id: 'tradingview-charts',
  name: 'TradingView Charts Package',
  description: 'מערכת גרפים TradingView Lightweight Charts',
  version: '1.0.0',
  critical: false,
  loadOrder: 20,
  dependencies: ['base'],
  scripts: [
    {
      file: 'charts/vendor/lightweight-charts.standalone.production.js',
      globalCheck: 'window.lightweightCharts',
      description: 'TradingView Lightweight Charts',
      required: true,
      loadOrder: 0
    },
    {
      file: 'charts/tradingview-adapter.js',
      globalCheck: 'window.TradingViewChartAdapter',
      description: 'Adapter למערכת',
      required: true,
      loadOrder: 1
    },
    {
      file: 'charts/tradingview-theme.js',
      globalCheck: 'window.TradingViewTheme',
      description: 'ערכת נושא',
      required: true,
      loadOrder: 2
    }
  ],
  estimatedSize: '~35KB',
  initTime: '~20ms'
}
```

### עדכון page-initialization-configs.js

הוסף package לעמודי גרפים:

```javascript
'trade-history-page': {
  packages: ['base', 'tradingview-charts'],
  requiredGlobals: ['window.TradingViewChartAdapter', 'window.TradingViewTheme']
}
```

---

## אינטגרציה עם מערכת הצבעים

### שימוש ב-getCSSVariableValue

```javascript
import { getCSSVariableValue } from '../system-management/core/sm-ui-components.js';

const primaryColor = getCSSVariableValue('--primary-color', '#2962FF');
const successColor = getCSSVariableValue('--success-color', '#26baac');
const warningColor = getCSSVariableValue('--warning-color', '#ffc107');
```

### שימוש ב-TradingViewTheme

```javascript
const theme = TradingViewTheme.getThemeOptions();
const chart = TradingViewChartAdapter.createChart(container, theme);
```

---

## אינטגרציה עם מערכת ההעדפות

### טעינת העדפות גרפים

```javascript
import { PreferencesData } from '../services/preferences-data.js';

// טעינת העדפות
const chartQuality = await PreferencesData.loadPreference({
  preferenceName: 'chart-quality',
  userId: currentUserId,
  profileId: currentProfileId
});

const chartAnimations = await PreferencesData.loadPreference({
  preferenceName: 'chart-animations',
  userId: currentUserId,
  profileId: currentProfileId
});
```

### עדכון אוטומטי כשהעדפות משתנות

```javascript
// האזנה לשינויים בהעדפות
document.addEventListener('preferences:updated', async (event) => {
  if (event.detail.preferenceName === 'chart-quality' || 
      event.detail.preferenceName === 'chart-animations') {
    // עדכון הגרף
    chart.applyOptions({
      // ... אפשרויות חדשות
    });
  }
});
```

---

## אינטגרציה עם מערכת המטמון

### שמירת הגדרות גרפים

```javascript
import { UnifiedCacheManager } from '../unified-cache-manager.js';

// שמירת הגדרות
await UnifiedCacheManager.save('tradingview-chart-config', {
  width: 600,
  height: 400,
  // ... הגדרות נוספות
}, {
  layer: 'localStorage',
  ttl: 3600 // 1 שעה
});
```

### טעינת הגדרות

```javascript
// טעינת הגדרות
const config = await UnifiedCacheManager.get('tradingview-chart-config', {
  layer: 'localStorage'
});

if (config) {
  chart.applyOptions(config);
}
```

### הבחנה בין Development ל-Production

```javascript
// Development: CACHE_DISABLED=true
// Production: CACHE_ENABLED=true

const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

if (isDevelopment) {
  // לא לשמור במטמון בפיתוח
  // או TTL קצר מאוד
} else {
  // שמירה במטמון בפרודקשן
  // TTL ארוך יותר
}
```

---

## תמיכה ב-RTL

### וידוא שטקסט מוצג נכון

```javascript
// Custom Tooltip עם RTL
const tooltip = document.createElement('div');
tooltip.style.direction = 'rtl';
tooltip.style.textAlign = 'right';

// או שימוש ב-CSS
.tooltip {
    direction: rtl;
    text-align: right;
}
```

### הגרפים משמאל לימין - זה בסדר

הגרפים תמיד משמאל לימין, וזה בסדר גמור. רק צריך לוודא שטקסט (tooltips, labels) מוצג נכון.

---

## מסמכים קשורים

- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - מדריך למפתח
- [EXAMPLES.md](EXAMPLES.md) - דוגמאות קוד
- [OVERVIEW.md](OVERVIEW.md) - סקירה כללית

