# מפרט טכני - מערכת גראפים TikTrack

## 📋 סקירה טכנית

מסמך זה מפרט את המפרט הטכני המלא למערכת הגראפים החדשה, כולל מבנה קבצים, API, דוגמאות קוד ומפרטי יישום.

## 🏗️ ארכיטקטורה טכנית

### מבנה קבצים מפורט (שלב ראשון)

```
trading-ui/scripts/charts/
├── chart-system.js              # מערכת גראפים מרכזית (כל הפונקציות)
├── chart-loader.js              # טעינת Chart.js דינמית
├── chart-theme.js               # עיצוב וצבעים (אינטגרציה עם מערכת הצבעים)
└── adapters/
    ├── performance-adapter.js   # מתאם נתוני ביצועים
    └── linter-adapter.js        # מתאם נתוני Linter
```

> **📝 הערה**: מבנה מפושט לשלב ראשון. ראה [ארכיטקטורה מפושטת](CHART_SYSTEM_SIMPLIFIED_ARCHITECTURE.md) לפרטים מלאים על הרחבה עתידית למערכת מלאה עם 15 קבצים.

### מבנה נתונים

#### הגדרות גרף
```javascript
const ChartConfig = {
    // מזהים
    id: 'performanceChart',           // מזהה ייחודי
    container: '#performanceChart',   // קונטיינר HTML
    
    // הגדרות בסיסיות
    type: 'line',                     // סוג גרף
    title: 'ביצועי תיק',             // כותרת גרף
    description: 'גרף ביצועי התיק לאורך זמן', // תיאור
    
    // נתונים
    data: {
        labels: [],                   // תוויות ציר X
        datasets: []                  // סדרות נתונים
    },
    
    // אפשרויות
    options: {
        responsive: true,             // רספונסיבי
        maintainAspectRatio: false,   // שמירת יחס
        plugins: {
            legend: {
                display: true,        // הצגת מקרא
                position: 'top'       // מיקום מקרא
            }
        }
    },
    
    // מתאם נתונים
    adapter: {
        type: 'performance',          // סוג מתאם
        config: {                     // הגדרות מתאם
            dataSource: '/api/performance',
            refreshInterval: 30000
        }
    },
    
    // עיצוב
    theme: {
        name: 'default',              // שם נושא
        colors: {},                   // צבעים
        fonts: {},                    // פונטים
        animations: {}                // אנימציות
    },
    
    // תכונות עתידיות
    future: {
        export: {                     // ייצוא (עתידי)
            enabled: false,
            formats: ['PNG', 'PDF']
        },
        realtime: {                   // זמן אמת (עתידי)
            enabled: false,
            interval: 5000
        }
    }
};
```

#### מבנה נתונים
```javascript
const ChartData = {
    labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל'],
    datasets: [
        {
            label: 'ביצועי תיק',
            data: [12, 19, 3, 5],
            borderColor: 'var(--primary-color)',
            backgroundColor: 'var(--primary-color-alpha)',
            borderWidth: 2,
            fill: false
        }
    ]
};
```

## 🔌 API מפורט

### ChartSystem Class

#### Constructor
```javascript
const chartSystem = new ChartSystem({
    theme: 'default',
    debug: false,
    performance: {
        maxCharts: 10,
        memoryLimit: 50 * 1024 * 1024 // 50MB
    }
});
```

#### Methods

##### create(config)
```javascript
// יצירת גרף חדש
const chart = await chartSystem.create({
    id: 'performanceChart',
    type: 'line',
    container: '#performanceChart',
    adapter: 'performance'
});

// עם הגדרות מותאמות
const chart = await chartSystem.create({
    id: 'customChart',
    type: 'bar',
    container: '#customChart',
    data: customData,
    options: customOptions,
    theme: 'custom'
});
```

##### update(chartId, data)
```javascript
// עדכון נתוני גרף
await chartSystem.update('performanceChart', {
    labels: newLabels,
    datasets: newDatasets
});

// עדכון חלקי
await chartSystem.update('performanceChart', {
    datasets: [{
        data: newData
    }]
});
```

##### destroy(chartId)
```javascript
// הרס גרף
await chartSystem.destroy('performanceChart');

// הרס כל הגרפים
await chartSystem.destroyAll();
```

##### setTheme(themeConfig)
```javascript
// שינוי נושא גלובלי
chartSystem.setTheme({
    name: 'dark',
    colors: {
        primary: '#007bff',
        secondary: '#6c757d'
    }
});

// שינוי נושא לגרף ספציפי
chartSystem.setTheme('performanceChart', 'dark');
```

##### getChart(chartId)
```javascript
// קבלת גרף
const chart = chartSystem.getChart('performanceChart');

// קבלת כל הגרפים
const charts = chartSystem.getAllCharts();
```

##### registerAdapter(adapter)
```javascript
// רישום מתאם חדש
chartSystem.registerAdapter('custom', CustomAdapter);

// שימוש במתאם
const chart = await chartSystem.create({
    id: 'customChart',
    adapter: 'custom'
});
```

### Adapter Base Class

```javascript
class BaseAdapter {
    constructor(config = {}) {
        this.config = config;
        this.dataSource = config.dataSource;
        this.cache = new Map();
    }
    
    // פונקציות חובה
    async getData(params = {}) {
        throw new Error('getData must be implemented');
    }
    
    formatData(rawData) {
        throw new Error('formatData must be implemented');
    }
    
    // פונקציות אופציונליות
    async refresh() {
        const data = await this.getData();
        return this.formatData(data);
    }
    
    validateData(data) {
        return Array.isArray(data) && data.length > 0;
    }
    
    // פונקציות עזר
    getCacheKey(params) {
        return JSON.stringify(params);
    }
    
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    getCache(key, maxAge = 300000) { // 5 דקות
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < maxAge) {
            return cached.data;
        }
        return null;
    }
}
```

### Performance Adapter

```javascript
class PerformanceAdapter extends BaseAdapter {
    constructor(config = {}) {
        super({
            dataSource: '/api/performance',
            refreshInterval: 30000,
            ...config
        });
    }
    
    async getData(params = {}) {
        const cacheKey = this.getCacheKey(params);
        const cached = this.getCache(cacheKey);
        if (cached) {
            return cached;
        }
        
        try {
            const response = await fetch(`${this.dataSource}?${new URLSearchParams(params)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Performance adapter error:', error);
            throw error;
        }
    }
    
    formatData(rawData) {
        if (!this.validateData(rawData.data)) {
            throw new Error('Invalid performance data');
        }
        
        return {
            labels: rawData.data.map(item => item.date),
            datasets: [
                {
                    label: 'ביצועי תיק (%)',
                    data: rawData.data.map(item => item.performance),
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'var(--primary-color-alpha)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }
            ]
        };
    }
}
```

### Linter Adapter

```javascript
class LinterAdapter extends BaseAdapter {
    constructor(config = {}) {
        super({
            dataSource: '/api/linter/stats',
            refreshInterval: 10000,
            ...config
        });
    }
    
    async getData(params = {}) {
        const cacheKey = this.getCacheKey(params);
        const cached = this.getCache(cacheKey, 60000); // 1 דקה
        if (cached) {
            return cached;
        }
        
        try {
            const response = await fetch(`${this.dataSource}?${new URLSearchParams(params)}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Linter adapter error:', error);
            throw error;
        }
    }
    
    formatData(rawData) {
        if (!this.validateData(rawData.quality) || !this.validateData(rawData.counts)) {
            throw new Error('Invalid linter data');
        }
        
        return {
            labels: rawData.timestamps,
            datasets: [
                {
                    label: 'איכות קוד (%)',
                    data: rawData.quality,
                    borderColor: 'var(--success-color)',
                    backgroundColor: 'var(--success-color-alpha)',
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y'
                },
                {
                    label: 'ספירות',
                    data: rawData.counts,
                    borderColor: 'var(--info-color)',
                    backgroundColor: 'var(--info-color-alpha)',
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        };
    }
}
```

## 🎨 מערכת עיצוב

### Theme System

```javascript
class ThemeSystem {
    constructor() {
        this.currentTheme = 'default';
        this.themes = new Map();
        this.loadDefaultThemes();
    }
    
    loadDefaultThemes() {
        // נושא ברירת מחדל
        this.registerTheme('default', {
            colors: {
                primary: 'var(--primary-color)',
                secondary: 'var(--secondary-color)',
                success: 'var(--success-color)',
                warning: 'var(--warning-color)',
                danger: 'var(--danger-color)',
                info: 'var(--info-color)',
                light: 'var(--light-color)',
                dark: 'var(--dark-color)'
            },
            fonts: {
                family: 'Noto Sans Hebrew, Arial, sans-serif',
                size: 12,
                weight: 'normal'
            },
            animations: {
                duration: 300,
                easing: 'easeInOutQuart'
            },
            layout: {
                padding: 20,
                margin: 10,
                borderRadius: 4
            }
        });
        
        // נושא כהה (עתידי)
        this.registerTheme('dark', {
            colors: {
                primary: '#007bff',
                secondary: '#6c757d',
                success: '#28a745',
                warning: '#ffc107',
                danger: '#dc3545',
                info: '#17a2b8',
                light: '#f8f9fa',
                dark: '#343a40'
            },
            // ... שאר ההגדרות
        });
    }
    
    registerTheme(name, config) {
        this.themes.set(name, config);
    }
    
    getTheme(name = null) {
        const themeName = name || this.currentTheme;
        return this.themes.get(themeName);
    }
    
    setTheme(name) {
        if (!this.themes.has(name)) {
            throw new Error(`Theme '${name}' not found`);
        }
        this.currentTheme = name;
        this.applyTheme(name);
    }
    
    applyTheme(name) {
        const theme = this.getTheme(name);
        // יישום הנושא על כל הגרפים
        ChartSystem.getAllCharts().forEach(chart => {
            this.updateChartTheme(chart, theme);
        });
    }
    
    updateChartTheme(chart, theme) {
        // עדכון עיצוב גרף לפי נושא
        if (chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.fontFamily = theme.fonts.family;
            chart.options.plugins.legend.labels.fontSize = theme.fonts.size;
        }
        
        chart.update();
    }
}
```

### Color Integration

```javascript
class ColorIntegration {
    constructor() {
        this.colorScheme = null;
        this.init();
    }
    
    init() {
        // חיבור למערכת הצבעים הדינאמית
        if (window.getDynamicColors) {
            this.colorScheme = window.getDynamicColors();
            this.setupColorWatcher();
        }
    }
    
    setupColorWatcher() {
        // מעקב אחר שינויי צבעים
        const observer = new MutationObserver(() => {
            this.updateColors();
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style']
        });
    }
    
    updateColors() {
        if (window.getDynamicColors) {
            this.colorScheme = window.getDynamicColors();
            this.applyColorsToCharts();
        }
    }
    
    applyColorsToCharts() {
        ChartSystem.getAllCharts().forEach(chart => {
            this.updateChartColors(chart);
        });
    }
    
    updateChartColors(chart) {
        // עדכון צבעי גרף לפי מערכת הצבעים
        chart.data.datasets.forEach(dataset => {
            if (dataset.borderColor && dataset.borderColor.includes('var(--')) {
                dataset.borderColor = this.resolveColor(dataset.borderColor);
            }
            if (dataset.backgroundColor && dataset.backgroundColor.includes('var(--')) {
                dataset.backgroundColor = this.resolveColor(dataset.backgroundColor);
            }
        });
        
        chart.update();
    }
    
    resolveColor(colorVar) {
        // המרת משתנה CSS לצבע
        const computedStyle = getComputedStyle(document.documentElement);
        return computedStyle.getPropertyValue(colorVar.replace('var(', '').replace(')', '')).trim();
    }
}
```

## 📤 מערכת ייצוא (עתידי)

### Export System

```javascript
class ExportSystem {
    constructor() {
        this.formats = new Map();
        this.loadDefaultFormats();
    }
    
    loadDefaultFormats() {
        // פורמטי ייצוא עתידיים
        this.registerFormat('PNG', {
            name: 'PNG',
            description: 'תמונה איכות',
            mimeType: 'image/png',
            extension: 'png',
            implemented: false
        });
        
        this.registerFormat('PDF', {
            name: 'PDF',
            description: 'דוח PDF',
            mimeType: 'application/pdf',
            extension: 'pdf',
            implemented: false
        });
    }
    
    registerFormat(name, config) {
        this.formats.set(name, config);
    }
    
    async export(chartId, format) {
        const chart = ChartSystem.getChart(chartId);
        if (!chart) {
            throw new Error(`Chart '${chartId}' not found`);
        }
        
        const formatConfig = this.formats.get(format);
        if (!formatConfig) {
            throw new Error(`Format '${format}' not supported`);
        }
        
        if (!formatConfig.implemented) {
            // הודעת עתידי
            showNotification('info', `ייצוא בפורמט ${format} יהיה זמין בעתיד`);
            return;
        }
        
        // יישום ייצוא (עתידי)
        return this.performExport(chart, formatConfig);
    }
    
    async performExport(chart, formatConfig) {
        // יישום ייצוא בפועל (עתידי)
        throw new Error('Export not implemented yet');
    }
}
```

## 🖥️ עמוד ניהול

### HTML Structure

```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ניהול גרפים - TikTrack</title>
    <link rel="stylesheet" href="styles-new/main.css">
    <link rel="stylesheet" href="styles-new/header-styles.css">
</head>
<body>
    <div id="unified-header"></div>
    
    <div class="main-content">
        <div class="top-section">
            <div class="section-header">
                <h2>📊 ניהול גרפים</h2>
                <div class="header-actions">
                    <button class="action-btn" onclick="refreshChartsStatus()">
                        <i class="fas fa-sync"></i> רענן סטטוס
                    </button>
                </div>
            </div>
        </div>
        
        <!-- סקירה כללית -->
        <div class="content-section" id="overviewSection">
            <div class="section-header">
                <h2>📈 סקירה כללית</h2>
                <button class="filter-toggle-btn" onclick="toggleSection('overviewSection')">
                    <span class="section-toggle-icon">▼</span>
                </button>
            </div>
            <div class="section-body">
                <div class="charts-overview-grid">
                    <!-- כרטיסי סקירה -->
                </div>
            </div>
        </div>
        
        <!-- ניהול גרפים -->
        <div class="content-section" id="managementSection">
            <div class="section-header">
                <h2>🔧 ניהול גרפים</h2>
                <button class="filter-toggle-btn" onclick="toggleSection('managementSection')">
                    <span class="section-toggle-icon">▼</span>
                </button>
            </div>
            <div class="section-body">
                <div class="management-controls">
                    <!-- כפתורי ניהול -->
                </div>
            </div>
        </div>
        
        <!-- בדיקות ואימות -->
        <div class="content-section" id="testingSection">
            <div class="section-header">
                <h2>🧪 בדיקות ואימות</h2>
                <button class="filter-toggle-btn" onclick="toggleSection('testingSection')">
                    <span class="section-toggle-icon">▼</span>
                </button>
            </div>
            <div class="section-body">
                <div class="testing-controls">
                    <!-- כפתורי בדיקה -->
                </div>
            </div>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="scripts/header-system.js"></script>
    <script src="scripts/charts/chart-system.js"></script>
    <script src="scripts/charts/management/chart-management.js"></script>
    <script src="scripts/chart-management.js"></script>
</body>
</html>
```

### Management JavaScript

```javascript
class ChartManagement {
    constructor() {
        this.chartSystem = null;
        this.init();
    }
    
    async init() {
        // אתחול מערכת גראפים
        this.chartSystem = new ChartSystem();
        await this.loadChartsOverview();
        this.setupEventListeners();
    }
    
    async loadChartsOverview() {
        const charts = this.chartSystem.getAllCharts();
        this.renderChartsOverview(charts);
    }
    
    renderChartsOverview(charts) {
        const container = document.querySelector('.charts-overview-grid');
        container.innerHTML = '';
        
        charts.forEach(chart => {
            const card = this.createChartCard(chart);
            container.appendChild(card);
        });
    }
    
    createChartCard(chart) {
        const card = document.createElement('div');
        card.className = 'chart-overview-card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${chart.config.title}</h3>
                <span class="status-badge ${chart.status}">${chart.status}</span>
            </div>
            <div class="card-body">
                <p><strong>סוג:</strong> ${chart.config.type}</p>
                <p><strong>מתאם:</strong> ${chart.config.adapter?.type || 'ללא'}</p>
                <p><strong>עדכון אחרון:</strong> ${new Date(chart.lastUpdate).toLocaleString('he-IL')}</p>
            </div>
            <div class="card-actions">
                <button class="btn btn-sm btn-primary" onclick="editChart('${chart.id}')">ערוך</button>
                <button class="btn btn-sm btn-danger" onclick="deleteChart('${chart.id}')">מחק</button>
            </div>
        `;
        return card;
    }
    
    setupEventListeners() {
        // מאזינים לאירועים
        document.addEventListener('chartCreated', (event) => {
            this.loadChartsOverview();
        });
        
        document.addEventListener('chartDestroyed', (event) => {
            this.loadChartsOverview();
        });
    }
}

// פונקציות גלובליות
function refreshChartsStatus() {
    chartManagement.loadChartsOverview();
}

function editChart(chartId) {
    // עריכת גרף (עתידי)
    showNotification('info', 'עריכת גרף תהיה זמינה בעתיד');
}

function deleteChart(chartId) {
    if (confirm('האם אתה בטוח שברצונך למחוק את הגרף?')) {
        chartManagement.chartSystem.destroy(chartId);
    }
}

// אתחול
let chartManagement;
document.addEventListener('DOMContentLoaded', () => {
    chartManagement = new ChartManagement();
});
```

## 🧪 בדיקות ואימות

### Unit Tests

```javascript
// בדיקות יחידה
describe('ChartSystem', () => {
    let chartSystem;
    
    beforeEach(() => {
        chartSystem = new ChartSystem();
    });
    
    test('should create chart successfully', async () => {
        const chart = await chartSystem.create({
            id: 'testChart',
            type: 'line',
            container: '#testContainer'
        });
        
        expect(chart).toBeDefined();
        expect(chart.id).toBe('testChart');
    });
    
    test('should update chart data', async () => {
        const chart = await chartSystem.create({
            id: 'testChart',
            type: 'line',
            container: '#testContainer'
        });
        
        const newData = {
            labels: ['A', 'B', 'C'],
            datasets: [{ data: [1, 2, 3] }]
        };
        
        await chartSystem.update('testChart', newData);
        
        expect(chart.data.labels).toEqual(newData.labels);
    });
    
    test('should destroy chart', async () => {
        await chartSystem.create({
            id: 'testChart',
            type: 'line',
            container: '#testContainer'
        });
        
        await chartSystem.destroy('testChart');
        
        expect(chartSystem.getChart('testChart')).toBeUndefined();
    });
});
```

### Integration Tests

```javascript
// בדיקות אינטגרציה
describe('Chart Integration', () => {
    test('should integrate with color system', () => {
        const colorIntegration = new ColorIntegration();
        expect(colorIntegration.colorScheme).toBeDefined();
    });
    
    test('should load performance data', async () => {
        const adapter = new PerformanceAdapter();
        const data = await adapter.getData();
        expect(data).toBeDefined();
    });
    
    test('should apply theme to charts', () => {
        const themeSystem = new ThemeSystem();
        themeSystem.setTheme('default');
        expect(themeSystem.currentTheme).toBe('default');
    });
});
```

## 📊 מדדי ביצועים

### Performance Monitoring

```javascript
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startMonitoring();
    }
    
    startMonitoring() {
        // ניטור זיכרון
        setInterval(() => {
            this.recordMemoryUsage();
        }, 5000);
        
        // ניטור זמן טעינה
        this.recordLoadTime();
    }
    
    recordMemoryUsage() {
        if (performance.memory) {
            this.metrics.set('memory', {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            });
        }
    }
    
    recordLoadTime() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        this.metrics.set('loadTime', loadTime);
    }
    
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }
    
    isPerformanceGood() {
        const memory = this.metrics.get('memory');
        const loadTime = this.metrics.get('loadTime');
        
        return memory && memory.used < 50 * 1024 * 1024 && // 50MB
               loadTime && loadTime < 2000; // 2 seconds
    }
}
```

## 🔒 אבטחה

### Security Measures

```javascript
class SecurityManager {
    constructor() {
        this.allowedOrigins = ['localhost', '127.0.0.1'];
        this.sanitizeInputs = true;
    }
    
    validateDataSource(url) {
        try {
            const parsedUrl = new URL(url);
            return this.allowedOrigins.includes(parsedUrl.hostname);
        } catch (error) {
            return false;
        }
    }
    
    sanitizeData(data) {
        if (!this.sanitizeInputs) return data;
        
        // סינון נתונים מסוכנים
        return JSON.parse(JSON.stringify(data, (key, value) => {
            if (typeof value === 'string') {
                return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            }
            return value;
        }));
    }
    
    validateChartConfig(config) {
        // בדיקת תקינות הגדרות גרף
        const required = ['id', 'type', 'container'];
        return required.every(field => config.hasOwnProperty(field));
    }
}
```

---

**גרסה**: 1.0.0  
**תאריך עדכון**: 2025-01-20  
**מחבר**: TikTrack Development Team  
**סטטוס**: בתכנון
