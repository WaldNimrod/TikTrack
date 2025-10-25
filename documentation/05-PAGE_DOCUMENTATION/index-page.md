# Index Page - Dashboard Documentation

## Overview
עמוד הדשבורד הראשי של TikTrack - מרכז מידע וסטטיסטיקות.

## Page Information
- **File:** `index.html`
- **URL:** `http://localhost:8080/`
- **Type:** User Page (Priority 1)
- **Last Updated:** January 2025

## Features
- **Charts:** Trades status, Performance, Account distribution, Mixed charts
- **Statistics:** Total trades, Open trades, P&L, Account summary
- **Real-time Data:** Auto-refresh every 5 minutes
- **Export:** Data export functionality
- **Responsive:** Mobile-friendly design

## Required Systems

### Core Systems (חבילת בסיס)
1. **Unified App Initializer** - Page initialization
2. **Notification System** - User notifications
3. **Logger Service** - Logging and monitoring
4. **Unified Cache Manager** - Data caching
5. **Header System** - Navigation and filters

### Chart Systems
1. **Chart Management** - Chart creation and rendering
2. **Chart Utils** - Chart utilities and data processing
3. **Trades Adapter** - Data adapter for charts
4. **Chart Theme** - Dynamic theming

### UI Systems
1. **Color Scheme System** - Dynamic colors
2. **Button System** - Action buttons
3. **Field Renderer** - Data display

## JavaScript Files

### Core Files
```html
<script src="scripts/logger-service.js"></script>
<script src="scripts/unified-cache-manager.js"></script>
<script src="scripts/notification-system.js"></script>
<script src="scripts/unified-app-initializer.js"></script>
```

### Chart Files
```html
<script src="scripts/chart-management.js"></script>
<script src="scripts/chart-utils.js"></script>
<script src="scripts/chart-renderer.js"></script>
<script src="scripts/trades-adapter.js"></script>
```

### Page-Specific Files
```html
<script src="scripts/index.js"></script>
```

## API Endpoints

### Dashboard Data
```javascript
// Get dashboard statistics
GET /api/dashboard/stats
Response: {
    totalTrades: number,
    openTrades: number,
    pnl: number,
    accountSummary: object
}

// Get chart data
GET /api/dashboard/charts
Response: {
    tradesStatus: array,
    performance: array,
    accounts: array,
    mixed: array
}
```

### Cache Management
```javascript
// Cache key: 'dashboard-data'
// TTL: 300 seconds (5 minutes)
// Auto-refresh: Every 5 minutes
```

## Page Structure

### HTML Structure
```html
<div id="index-page" class="page-container">
    <div class="dashboard-header">
        <h1>דשבורד</h1>
        <div class="dashboard-controls">
            <button id="refresh-data" class="btn btn-primary">רענן נתונים</button>
            <button id="export-data" class="btn btn-secondary">ייצא נתונים</button>
        </div>
    </div>
    
    <div class="dashboard-content">
        <!-- Charts Section -->
        <div class="charts-section">
            <div class="chart-container">
                <canvas id="trades-chart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="performance-chart"></canvas>
            </div>
        </div>
        
        <!-- Statistics Section -->
        <div class="stats-section">
            <div class="stat-card">
                <h3>סה"כ עסקאות</h3>
                <div id="total-trades" class="stat-value">-</div>
            </div>
            <div class="stat-card">
                <h3>עסקאות פתוחות</h3>
                <div id="open-trades" class="stat-value">-</div>
            </div>
            <div class="stat-card">
                <h3>רווח/הפסד</h3>
                <div id="pnl" class="stat-value">-</div>
            </div>
        </div>
    </div>
</div>
```

## JavaScript Implementation

### Page Initialization
```javascript
class IndexPage {
    constructor() {
        this.charts = {};
        this.stats = {
            totalTrades: 0,
            openTrades: 0,
            pnl: 0
        };
        
        this.init();
    }
    
    async init() {
        try {
            Logger.info('Initializing index page');
            
            // 1. Setup systems
            this.setupSystems();
            
            // 2. Load data
            await this.loadDashboardData();
            
            // 3. Setup charts
            this.setupCharts();
            
            // 4. Update stats
            this.updateStats();
            
            // 5. Setup event listeners
            this.setupEventListeners();
            
            showSuccessNotification('דשבורד נטען בהצלחה');
            Logger.info('Index page initialized successfully');
            
        } catch (error) {
            Logger.error('Index page initialization failed', { error: error.message });
            showErrorNotification('שגיאה בטעינת הדשבורד');
        }
    }
}
```

### Data Loading
```javascript
async loadDashboardData() {
    try {
        // Check cache first
        const cacheKey = 'dashboard-data';
        const cachedData = window.UnifiedCacheManager?.get(cacheKey);
        
        if (cachedData) {
            this.stats = cachedData.stats;
            this.chartData = cachedData.chartData;
            Logger.info('Dashboard data loaded from cache');
            return;
        }
        
        // Load from server
        showLoadingIndicator();
        
        const [statsResponse, chartsResponse] = await Promise.all([
            fetch('/api/dashboard/stats'),
            fetch('/api/dashboard/charts')
        ]);
        
        if (!statsResponse.ok || !chartsResponse.ok) {
            throw new Error('Failed to load dashboard data');
        }
        
        const [statsData, chartsData] = await Promise.all([
            statsResponse.json(),
            chartsResponse.json()
        ]);
        
        // Process data
        this.stats = statsData;
        this.chartData = chartsData;
        
        // Cache the data
        await window.UnifiedCacheManager?.set(cacheKey, {
            stats: this.stats,
            chartData: this.chartData
        }, { ttl: 300 });
        
        hideLoadingIndicator();
        Logger.info('Dashboard data loaded from server');
        
    } catch (error) {
        hideLoadingIndicator();
        Logger.error('Failed to load dashboard data', { error: error.message });
        throw error;
    }
}
```

### Chart Setup
```javascript
setupCharts() {
    try {
        // Trades Status Chart
        this.charts.trades = this.createTradesStatusChart();
        
        // Performance Chart
        this.charts.performance = this.createPerformanceChart();
        
        // Account Chart
        this.charts.accounts = this.createAccountChart();
        
        // Mixed Chart
        this.charts.mixed = this.createMixedChart();
        
        Logger.info('Charts setup completed');
        
    } catch (error) {
        Logger.error('Chart setup failed', { error: error.message });
        showErrorNotification('שגיאה בהגדרת הגרפים');
    }
}
```

## Event Handlers

### Refresh Data
```javascript
async refreshData() {
    try {
        Logger.info('Refreshing dashboard data');
        
        // Clear cache
        await window.UnifiedCacheManager?.delete('dashboard-data');
        
        // Reload data
        await this.loadDashboardData();
        
        // Update charts
        this.updateCharts();
        
        // Update stats
        this.updateStats();
        
        showSuccessNotification('נתונים עודכנו');
        Logger.info('Dashboard data refreshed');
        
    } catch (error) {
        Logger.error('Data refresh failed', { error: error.message });
        showErrorNotification('שגיאה בעדכון הנתונים');
    }
}
```

### Export Data
```javascript
exportData() {
    try {
        const data = {
            stats: this.stats,
            chartData: this.chartData,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        showSuccessNotification('נתונים יוצאו בהצלחה');
        Logger.info('Dashboard data exported');
        
    } catch (error) {
        Logger.error('Data export failed', { error: error.message });
        showErrorNotification('שגיאה בייצוא הנתונים');
    }
}
```

## Performance Considerations

### Auto-Refresh
```javascript
// Auto-refresh every 5 minutes
setInterval(() => {
    this.refreshData();
}, 300000);
```

### Performance Monitoring
```javascript
setupPerformanceMonitoring() {
    // Monitor chart performance
    const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
            if (entry.duration > 100) {
                Logger.warn('Slow chart operation', {
                    name: entry.name,
                    duration: entry.duration
                });
            }
        });
    });
    
    observer.observe({ entryTypes: ['measure'] });
}
```

## Error Handling

### Network Errors
```javascript
catch (error) {
    if (error.name === 'NetworkError') {
        // Try to use cached data
        const cachedData = window.UnifiedCacheManager?.get('dashboard-data');
        if (cachedData) {
            showWarningNotification('מצב לא מקוון - מוצגים נתונים שמורים');
            return cachedData;
        }
    }
    
    Logger.error('Dashboard error', { error: error.message });
    showErrorNotification('שגיאה בטעינת הדשבורד');
}
```

## Dependencies

### Required Systems
- Unified App Initializer
- Notification System
- Logger Service
- Unified Cache Manager
- Chart Management
- Trades Adapter

### Optional Systems
- Color Scheme System
- Button System
- Field Renderer

## Testing

### Unit Tests
- Data loading functions
- Chart creation functions
- Statistics calculations
- Export functionality

### Integration Tests
- System initialization
- Cache management
- Error handling
- Performance monitoring

### E2E Tests
- Page loading
- Data refresh
- Export functionality
- Error scenarios

## Troubleshooting

### Common Issues

1. **Charts not loading**
   - Check if Chart.js is loaded
   - Verify trades adapter is available
   - Check console for errors

2. **Data not refreshing**
   - Check network connection
   - Verify API endpoints
   - Check cache settings

3. **Performance issues**
   - Monitor long tasks
   - Check memory usage
   - Optimize chart rendering

## Best Practices

1. **Always check cache first**
2. **Handle network errors gracefully**
3. **Use performance monitoring**
4. **Implement auto-refresh**
5. **Provide user feedback**
6. **Log all operations**
7. **Use appropriate error messages**
8. **Optimize for mobile devices**
