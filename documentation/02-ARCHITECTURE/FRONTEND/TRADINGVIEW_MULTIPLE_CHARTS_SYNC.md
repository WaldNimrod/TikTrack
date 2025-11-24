# TradingView Multiple Charts Sync - תיעוד מפורט

**תאריך יצירה:** 27 ינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ⚠️ **מורכב - דורש זהירות**

---

## ⚠️ אזהרה חשובה

**פיצ'ר זה מורכב מאוד ויש להשתמש בו בזהירות!**

ניסינו ליישם סנכרון של מספר גרפים והתגלו קשיים משמעותיים. קובץ זה מתעד את כל הקשיים, הפתרונות, והמלצות לשימוש.

---

## 📋 סקירה כללית

Multiple Charts Sync מאפשר סנכרון של מספר גרפי TradingView כך שפעולות על גרף אחד (זום, גלילה, crosshair) משתקפות בגרפים האחרים.

### שימושים נפוצים:
- השוואה בין מספר טיקרים
- גרף מחיר + גרף נפח
- גרף יומי + גרף שבועי
- גרף ראשי + גרף זום

---

## 🔴 קשיים ובעיות ידועות

### 1. Event Listener Conflicts
**בעיה:** כאשר מספר גרפים מקשיבים לאירועים (zoom, scroll, crosshair), נוצרים קונפליקטים.

**תסמינים:**
- גרפים "קופצים" או מתעדכנים בצורה לא רציפה
- Lag או חוסר תגובה
- אירועים מופעלים מספר פעמים

**פתרון חלקי:**
```javascript
const chartSyncManager = {
    isSyncing: false,
    
    syncTimeScale(sourceChart, sourceRange) {
        if (this.isSyncing) return; // Prevent recursive calls
        this.isSyncing = true;
        
        try {
            // Sync all charts
            this.charts.forEach(({ chart }) => {
                if (chart !== sourceChart) {
                    chart.timeScale().setVisibleRange(sourceRange);
                }
            });
        } finally {
            this.isSyncing = false;
        }
    }
};
```

---

### 2. Performance Degradation
**בעיה:** עם יותר מ-3-4 גרפים מסונכרנים, הביצועים יורדים משמעותית.

**תסמינים:**
- FPS נמוך (פחות מ-30)
- Lag בעת גלילה/זום
- צריכת זיכרון גבוהה

**פתרון:**
- הגבל ל-2-3 גרפים מסונכרנים מקסימום
- השתמש ב-debouncing לעדכונים
- השתמש ב-requestAnimationFrame

```javascript
let syncTimeout = null;

function debouncedSync(sourceChart, sourceRange) {
    if (syncTimeout) {
        cancelAnimationFrame(syncTimeout);
    }
    
    syncTimeout = requestAnimationFrame(() => {
        chartSyncManager.syncTimeScale(sourceChart, sourceRange);
    });
}
```

---

### 3. Race Conditions
**בעיה:** כאשר מספר גרפים מתעדכנים בו-זמנית, נוצרים race conditions.

**תסמינים:**
- גרפים "מתחרים" על עדכון
- מצב לא עקבי בין גרפים
- שגיאות ב-console

**פתרון:**
- השתמש ב-flag מרכזי (`isSyncing`)
- השתמש ב-queue לעדכונים
- עדכן גרפים בסדר קבוע

```javascript
const syncQueue = [];
let isProcessingQueue = false;

function queueSync(update) {
    syncQueue.push(update);
    if (!isProcessingQueue) {
        processSyncQueue();
    }
}

function processSyncQueue() {
    if (syncQueue.length === 0) {
        isProcessingQueue = false;
        return;
    }
    
    isProcessingQueue = true;
    const update = syncQueue.shift();
    chartSyncManager.syncTimeScale(update.chart, update.range);
    
    requestAnimationFrame(processSyncQueue);
}
```

---

### 4. Memory Leaks
**בעיה:** אם גרפים לא נוקים כראוי, נוצרים memory leaks.

**תסמינים:**
- צריכת זיכרון עולה עם הזמן
- דפדפן מאט
- שגיאות "out of memory"

**פתרון:**
- נקה event listeners בעת הסרת גרף
- הסר גרפים מה-sync manager
- השתמש ב-WeakMap במקום Map

```javascript
function unregisterChart(chartId) {
    // Remove from sync manager
    chartSyncManager.charts = chartSyncManager.charts.filter(
        ({ id }) => id !== chartId
    );
    
    // Clean up event listeners
    // ... cleanup code
}
```

---

## ✅ מימוש מומלץ

### שלב 1: יצירת Sync Manager

```javascript
const chartSyncManager = {
    charts: [],
    isSyncing: false,
    syncQueue: [],
    
    registerChart(chart, id) {
        this.charts.push({ chart, id, synced: false });
        this.setupSyncListeners(chart, id);
    },
    
    setupSyncListeners(chart, id) {
        // Sync time scale changes
        chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (!this.isSyncing && range) {
                this.syncTimeScale(chart, range);
            }
        });
    },
    
    syncTimeScale(sourceChart, sourceRange) {
        if (this.isSyncing) return;
        this.isSyncing = true;
        
        try {
            this.charts.forEach(({ chart }) => {
                if (chart !== sourceChart && chart.timeScale) {
                    chart.timeScale().setVisibleRange(sourceRange);
                }
            });
        } catch (e) {
            console.warn('Error syncing charts:', e);
        } finally {
            this.isSyncing = false;
        }
    },
    
    unregisterChart(chartId) {
        this.charts = this.charts.filter(({ id }) => id !== chartId);
    }
};
```

### שלב 2: שימוש ב-Sync Manager

```javascript
// Register charts
chartSyncManager.registerChart(priceChart, 'price-chart');
chartSyncManager.registerChart(volumeChart, 'volume-chart');

// Unregister when done
chartSyncManager.unregisterChart('price-chart');
```

---

## 📝 המלצות לשימוש

### ✅ DO:
1. **הגבל ל-2-3 גרפים** - יותר מזה יגרום לבעיות ביצועים
2. **השתמש ב-debouncing** - למניעת עדכונים מרובים
3. **נקה כראוי** - הסר גרפים מה-sync manager בעת הסרה
4. **בדוק ביצועים** - השתמש ב-DevTools Performance tab
5. **תעד בעיות** - אם נתקלת בבעיה, תעד אותה כאן

### ❌ DON'T:
1. **אל תסנכרן יותר מ-3 גרפים** - יגרום לבעיות ביצועים
2. **אל תסנכרן crosshair** - מורכב מדי ויגרום לבעיות
3. **אל תשתמש ב-sync עם lazy loading** - יגרום לבעיות
4. **אל תעדכן גרפים בו-זמנית** - השתמש ב-queue

---

## 🧪 בדיקות

### בדיקות בסיסיות:
1. ✅ סנכרון 2 גרפים - זום וגלילה
2. ✅ סנכרון 3 גרפים - זום וגלילה
3. ⚠️ סנכרון 4+ גרפים - בעיות ביצועים

### בדיקות ביצועים:
1. FPS צריך להיות > 30
2. Memory usage צריך להיות יציב
3. אין memory leaks

---

## 🔧 פתרון בעיות

### בעיה: גרפים "קופצים"
**פתרון:** הוסף `isSyncing` flag למניעת עדכונים רקורסיביים

### בעיה: Lag בעת גלילה
**פתרון:** השתמש ב-debouncing ו-requestAnimationFrame

### בעיה: Memory leaks
**פתרון:** נקה event listeners בעת הסרת גרפים

---

## 📚 משאבים נוספים

- [TradingView Lightweight Charts Documentation](https://tradingview.github.io/lightweight-charts/)
- [Multiple Charts Example](https://github.com/tradingview/lightweight-charts/tree/master/examples)
- [Performance Best Practices](https://tradingview.github.io/lightweight-charts/docs/performance)

---

## 📝 היסטוריית שינויים

| תאריך | גרסה | שינויים |
|--------|-------|---------|
| 27 ינואר 2025 | 1.0.0 | יצירה ראשונית |

---

**תאריך עדכון אחרון:** 27 ינואר 2025  
**גרסה:** 1.0.0  
**סטטוס:** ⚠️ **מורכב - דורש זהירות**

