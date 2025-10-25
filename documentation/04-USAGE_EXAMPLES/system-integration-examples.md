# System Integration Examples

## Overview
דוגמאות שימוש למערכות TikTrack עם אינטגרציה מלאה.

## 1. Complete Page Example - Trades Page

### HTML Structure
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>עמוד עסקאות - TikTrack</title>
    <link rel="stylesheet" href="styles/main.css">
</head>
<body>
    <div id="trades-page" class="page-container">
        <!-- Header with filters -->
        <div class="page-header">
            <h1>עסקאות</h1>
            <div class="filters">
                <input type="text" id="trades-filter" placeholder="חפש עסקאות...">
                <select id="status-filter">
                    <option value="">כל הסטטוסים</option>
                    <option value="open">פתוח</option>
                    <option value="closed">סגור</option>
                </select>
            </div>
        </div>
        
        <!-- Table -->
        <div class="table-container">
            <table id="trades-table" class="data-table">
                <thead>
                    <tr>
                        <th data-sortable="true">תאריך</th>
                        <th data-sortable="true">סמל</th>
                        <th data-sortable="true">צד</th>
                        <th data-sortable="true">כמות</th>
                        <th data-sortable="true">מחיר</th>
                        <th data-sortable="true">סטטוס</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody id="trades-tbody">
                    <!-- Data will be loaded here -->
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div class="pagination">
            <button id="prev-page" class="btn btn-secondary">הקודם</button>
            <span id="page-info">עמוד 1 מתוך 5</span>
            <button id="next-page" class="btn btn-secondary">הבא</button>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="scripts/logger-service.js"></script>
    <script src="scripts/unified-cache-manager.js"></script>
    <script src="scripts/notification-system.js"></script>
    <script src="scripts/field-renderer-service.js"></script>
    <script src="scripts/tables.js"></script>
    <script src="scripts/trades.js"></script>
</body>
</html>
```

### JavaScript Implementation
```javascript
// trades.js - Complete implementation
class TradesPage {
    constructor() {
        this.tableId = 'trades-table';
        this.currentPage = 1;
        this.pageSize = 50;
        this.currentData = [];
        this.filteredData = [];
        
        this.init();
    }
    
    async init() {
        try {
            Logger.info('Initializing trades page');
            
            // 1. Setup page systems
            this.setupPageSystems();
            
            // 2. Load data
            await this.loadTradesData();
            
            // 3. Setup table
            this.setupTable();
            
            // 4. Setup event listeners
            this.setupEventListeners();
            
            // 5. Show success notification
            showSuccessNotification('עמוד עסקאות נטען בהצלחה');
            
            Logger.info('Trades page initialized successfully');
            
        } catch (error) {
            Logger.error('Failed to initialize trades page', { error: error.message });
            showErrorNotification('שגיאה בטעינת עמוד העסקאות');
        }
    }
    
    setupPageSystems() {
        // Setup notification mode for business operations
        setNotificationMode('work');
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
    }
    
    async loadTradesData() {
        try {
            // Check cache first
            const cacheKey = 'trades-data';
            const cachedData = window.UnifiedCacheManager?.get(cacheKey);
            
            if (cachedData) {
                this.currentData = cachedData;
                Logger.info('Trades data loaded from cache', { count: cachedData.length });
                return;
            }
            
            // Load from server
            showLoadingIndicator();
            
            const response = await fetch('/api/trades');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache the data
            await window.UnifiedCacheManager?.set(cacheKey, data, { ttl: 300 });
            
            this.currentData = data;
            this.filteredData = [...data];
            
            hideLoadingIndicator();
            
            Logger.info('Trades data loaded from server', { count: data.length });
            
        } catch (error) {
            hideLoadingIndicator();
            Logger.error('Failed to load trades data', { error: error.message });
            throw error;
        }
    }
    
    setupTable() {
        try {
            // Load table data
            loadTableData(this.tableId, this.filteredData, {
                sortable: true,
                filterable: true,
                pagination: true
            });
            
            // Add action buttons
            this.setupTableActions();
            
            // Apply saved state
            const savedState = loadTableState(this.tableId);
            if (savedState) {
                applyTableState(this.tableId, savedState);
            }
            
            Logger.info('Table setup completed', { rowCount: this.filteredData.length });
            
        } catch (error) {
            Logger.error('Table setup failed', { error: error.message });
            showErrorNotification('שגיאה בהגדרת הטבלה');
        }
    }
    
    setupTableActions() {
        const actions = [
            {
                type: 'edit',
                onClick: (id) => this.editTrade(id),
                visible: (row) => row.status === 'open'
            },
            {
                type: 'delete',
                onClick: (id) => this.deleteTrade(id),
                visible: (row) => row.status === 'open'
            },
            {
                type: 'view',
                onClick: (id) => this.viewTrade(id)
            }
        ];
        
        generateTableActions(this.tableId, actions);
    }
    
    setupEventListeners() {
        // Filter input
        const filterInput = document.getElementById('trades-filter');
        if (filterInput) {
            filterInput.addEventListener('input', (e) => {
                this.filterTrades(e.target.value);
            });
        }
        
        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterByStatus(e.target.value);
            });
        }
        
        // Pagination
        document.getElementById('prev-page')?.addEventListener('click', () => {
            this.previousPage();
        });
        
        document.getElementById('next-page')?.addEventListener('click', () => {
            this.nextPage();
        });
        
        // Table sorting
        document.querySelectorAll(`#${this.tableId} th[data-sortable]`).forEach(header => {
            header.addEventListener('click', (e) => {
                const columnIndex = Array.from(header.parentNode.children).indexOf(header);
                this.sortTable(columnIndex);
            });
        });
    }
    
    filterTrades(searchTerm) {
        try {
            if (!searchTerm.trim()) {
                this.filteredData = [...this.currentData];
            } else {
                this.filteredData = this.currentData.filter(trade => 
                    trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    trade.id.toString().includes(searchTerm)
                );
            }
            
            this.updateTable();
            Logger.debug('Trades filtered', { searchTerm, count: this.filteredData.length });
            
        } catch (error) {
            Logger.error('Filter failed', { error: error.message });
        }
    }
    
    filterByStatus(status) {
        try {
            if (!status) {
                this.filteredData = [...this.currentData];
            } else {
                this.filteredData = this.currentData.filter(trade => trade.status === status);
            }
            
            this.updateTable();
            Logger.debug('Trades filtered by status', { status, count: this.filteredData.length });
            
        } catch (error) {
            Logger.error('Status filter failed', { error: error.message });
        }
    }
    
    sortTable(columnIndex) {
        try {
            sortTable(columnIndex, this.tableId);
            Logger.debug('Table sorted', { columnIndex });
        } catch (error) {
            Logger.error('Sorting failed', { error: error.message });
        }
    }
    
    updateTable() {
        loadTableData(this.tableId, this.filteredData, {
            sortable: true,
            filterable: true,
            pagination: true
        });
        
        this.setupTableActions();
    }
    
    async editTrade(id) {
        try {
            Logger.info('Editing trade', { id });
            
            // Find trade data
            const trade = this.currentData.find(t => t.id === id);
            if (!trade) {
                showErrorNotification('עסקה לא נמצאה');
                return;
            }
            
            // Open edit modal
            this.openEditModal(trade);
            
        } catch (error) {
            Logger.error('Edit trade failed', { id, error: error.message });
            showErrorNotification('שגיאה בפתיחת עריכת העסקה');
        }
    }
    
    async deleteTrade(id) {
        try {
            // Show confirmation dialog
            const confirmed = await showConfirmDialog(
                'האם אתה בטוח שברצונך למחוק את העסקה?',
                'אישור מחיקה',
                {
                    confirmText: 'מחק',
                    cancelText: 'ביטול',
                    type: 'warning'
                }
            );
            
            if (!confirmed) return;
            
            Logger.info('Deleting trade', { id });
            
            // Delete from server
            const response = await fetch(`/api/trades/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            // Remove from local data
            this.currentData = this.currentData.filter(t => t.id !== id);
            this.filteredData = this.filteredData.filter(t => t.id !== id);
            
            // Update table
            this.updateTable();
            
            // Clear cache
            await window.UnifiedCacheManager?.delete('trades-data');
            
            showSuccessNotification('עסקה נמחקה בהצלחה');
            Logger.info('Trade deleted successfully', { id });
            
        } catch (error) {
            Logger.error('Delete trade failed', { id, error: error.message });
            showErrorNotification('שגיאה במחיקת העסקה');
        }
    }
    
    async viewTrade(id) {
        try {
            Logger.info('Viewing trade', { id });
            
            // Find trade data
            const trade = this.currentData.find(t => t.id === id);
            if (!trade) {
                showErrorNotification('עסקה לא נמצאה');
                return;
            }
            
            // Open view modal
            this.openViewModal(trade);
            
        } catch (error) {
            Logger.error('View trade failed', { id, error: error.message });
            showErrorNotification('שגיאה בפתיחת העסקה');
        }
    }
    
    openEditModal(trade) {
        // Implementation for edit modal
        // This would use the modal system
        Logger.debug('Opening edit modal', { tradeId: trade.id });
    }
    
    openViewModal(trade) {
        // Implementation for view modal
        // This would use the modal system
        Logger.debug('Opening view modal', { tradeId: trade.id });
    }
    
    setupPerformanceMonitoring() {
        // Monitor table performance
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (entry.duration > 100) {
                    Logger.warn('Slow table operation', {
                        name: entry.name,
                        duration: entry.duration
                    });
                }
            });
        });
        
        observer.observe({ entryTypes: ['measure'] });
    }
    
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateTable();
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.updateTable();
        }
    }
}

// Initialize page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TradesPage();
});
```

## 2. Form Example - Add Trade Form

### HTML Form
```html
<form id="add-trade-form" class="trade-form">
    <div class="form-group">
        <label for="symbol">סמל:</label>
        <input type="text" id="symbol" name="symbol" required>
    </div>
    
    <div class="form-group">
        <label for="side">צד:</label>
        <select id="side" name="side" required>
            <option value="">בחר צד</option>
            <option value="Long">Long</option>
            <option value="Short">Short</option>
        </select>
    </div>
    
    <div class="form-group">
        <label for="quantity">כמות:</label>
        <input type="number" id="quantity" name="quantity" required min="1">
    </div>
    
    <div class="form-group">
        <label for="price">מחיר:</label>
        <input type="number" id="price" name="price" required step="0.01" min="0">
    </div>
    
    <div class="form-actions">
        <button type="submit" class="btn btn-primary">הוסף עסקה</button>
        <button type="reset" class="btn btn-secondary">נקה</button>
    </div>
</form>
```

### JavaScript Form Handling
```javascript
class AddTradeForm {
    constructor() {
        this.formId = 'add-trade-form';
        this.init();
    }
    
    init() {
        this.setupForm();
        this.setupAutoSave();
        this.setupValidation();
    }
    
    setupForm() {
        const form = document.getElementById(this.formId);
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(e);
        });
        
        // Setup reset handler
        const resetBtn = form.querySelector('[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.clearAutoSave();
            });
        }
    }
    
    async handleSubmit(e) {
        try {
            // 1. Validate form
            if (!this.validateForm()) {
                showWarningNotification('אנא מלא את כל השדות הנדרשים');
                return;
            }
            
            // 2. Show loading
            showLoadingIndicator();
            
            // 3. Prepare data
            const formData = new FormData(e.target);
            const tradeData = {
                symbol: formData.get('symbol'),
                side: formData.get('side'),
                quantity: parseInt(formData.get('quantity')),
                price: parseFloat(formData.get('price')),
                status: 'open',
                created_at: new Date().toISOString()
            };
            
            // 4. Submit to server
            const response = await fetch('/api/trades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tradeData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // 5. Handle success
            hideLoadingIndicator();
            showSuccessNotification('עסקה נוספה בהצלחה');
            
            // 6. Clear form
            e.target.reset();
            this.clearAutoSave();
            
            // 7. Clear cache to force refresh
            await window.UnifiedCacheManager?.delete('trades-data');
            
            // 8. Log success
            Logger.info('Trade added successfully', { tradeId: result.id });
            
        } catch (error) {
            hideLoadingIndicator();
            Logger.error('Add trade failed', { error: error.message });
            showErrorNotification('שגיאה בהוספת העסקה');
        }
    }
    
    validateForm() {
        const form = document.getElementById(this.formId);
        const requiredFields = form.querySelectorAll('[required]');
        
        for (const field of requiredFields) {
            if (!field.value.trim()) {
                field.classList.add('error');
                return false;
            } else {
                field.classList.remove('error');
            }
        }
        
        // Additional validation
        const quantity = parseInt(document.getElementById('quantity').value);
        const price = parseFloat(document.getElementById('price').value);
        
        if (quantity <= 0) {
            showWarningNotification('כמות חייבת להיות גדולה מ-0');
            return false;
        }
        
        if (price <= 0) {
            showWarningNotification('מחיר חייב להיות גדול מ-0');
            return false;
        }
        
        return true;
    }
    
    setupAutoSave() {
        const form = document.getElementById(this.formId);
        if (!form) return;
        
        let autoSaveTimeout;
        
        form.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                this.autoSaveForm();
            }, 2000);
        });
    }
    
    async autoSaveForm() {
        try {
            const form = document.getElementById(this.formId);
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Save to cache
            await window.UnifiedCacheManager?.set(`form-${this.formId}`, data, { ttl: 3600 });
            
            Logger.debug('Form auto-saved', { formId: this.formId });
            
        } catch (error) {
            Logger.warn('Auto-save failed', { formId: this.formId, error: error.message });
        }
    }
    
    async clearAutoSave() {
        try {
            await window.UnifiedCacheManager?.delete(`form-${this.formId}`);
            Logger.debug('Auto-save cleared', { formId: this.formId });
        } catch (error) {
            Logger.warn('Clear auto-save failed', { formId: this.formId, error: error.message });
        }
    }
}

// Initialize form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AddTradeForm();
});
```

## 3. Dashboard Example - Charts Integration

### HTML Dashboard
```html
<div id="dashboard-page" class="page-container">
    <div class="dashboard-header">
        <h1>דשבורד</h1>
        <div class="dashboard-controls">
            <button id="refresh-data" class="btn btn-primary">רענן נתונים</button>
            <button id="export-data" class="btn btn-secondary">ייצא נתונים</button>
        </div>
    </div>
    
    <div class="dashboard-content">
        <div class="chart-container">
            <canvas id="trades-chart"></canvas>
        </div>
        
        <div class="stats-container">
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

### JavaScript Dashboard
```javascript
class DashboardPage {
    constructor() {
        this.chart = null;
        this.stats = {
            totalTrades: 0,
            openTrades: 0,
            pnl: 0
        };
        
        this.init();
    }
    
    async init() {
        try {
            Logger.info('Initializing dashboard');
            
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
            Logger.info('Dashboard initialized successfully');
            
        } catch (error) {
            Logger.error('Dashboard initialization failed', { error: error.message });
            showErrorNotification('שגיאה בטעינת הדשבורד');
        }
    }
    
    setupSystems() {
        // Setup notification mode
        setNotificationMode('work');
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
    }
    
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
            
            const [tradesResponse, statsResponse] = await Promise.all([
                fetch('/api/trades'),
                fetch('/api/stats')
            ]);
            
            if (!tradesResponse.ok || !statsResponse.ok) {
                throw new Error('Failed to load dashboard data');
            }
            
            const [tradesData, statsData] = await Promise.all([
                tradesResponse.json(),
                statsResponse.json()
            ]);
            
            // Process data
            this.stats = statsData;
            this.chartData = this.processChartData(tradesData);
            
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
    
    setupCharts() {
        try {
            const ctx = document.getElementById('trades-chart').getContext('2d');
            
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this.chartData.labels,
                    datasets: [{
                        label: 'עסקאות',
                        data: this.chartData.values,
                        borderColor: '#26baac',
                        backgroundColor: 'rgba(38, 186, 172, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            Logger.info('Chart setup completed');
            
        } catch (error) {
            Logger.error('Chart setup failed', { error: error.message });
            showErrorNotification('שגיאה בהגדרת הגרף');
        }
    }
    
    updateStats() {
        try {
            // Update total trades
            document.getElementById('total-trades').textContent = this.stats.totalTrades;
            
            // Update open trades
            document.getElementById('open-trades').textContent = this.stats.openTrades;
            
            // Update P&L with color coding
            const pnlElement = document.getElementById('pnl');
            pnlElement.textContent = this.stats.pnl.toFixed(2);
            
            if (this.stats.pnl > 0) {
                pnlElement.classList.add('positive');
            } else if (this.stats.pnl < 0) {
                pnlElement.classList.add('negative');
            }
            
            Logger.debug('Stats updated', { stats: this.stats });
            
        } catch (error) {
            Logger.error('Stats update failed', { error: error.message });
        }
    }
    
    setupEventListeners() {
        // Refresh button
        document.getElementById('refresh-data')?.addEventListener('click', async () => {
            await this.refreshData();
        });
        
        // Export button
        document.getElementById('export-data')?.addEventListener('click', () => {
            this.exportData();
        });
        
        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.refreshData();
        }, 300000);
    }
    
    async refreshData() {
        try {
            Logger.info('Refreshing dashboard data');
            
            // Clear cache
            await window.UnifiedCacheManager?.delete('dashboard-data');
            
            // Reload data
            await this.loadDashboardData();
            
            // Update chart
            if (this.chart) {
                this.chart.data.labels = this.chartData.labels;
                this.chart.data.datasets[0].data = this.chartData.values;
                this.chart.update();
            }
            
            // Update stats
            this.updateStats();
            
            showSuccessNotification('נתונים עודכנו');
            Logger.info('Dashboard data refreshed');
            
        } catch (error) {
            Logger.error('Data refresh failed', { error: error.message });
            showErrorNotification('שגיאה בעדכון הנתונים');
        }
    }
    
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
    
    processChartData(tradesData) {
        // Group trades by date
        const groupedData = {};
        
        tradesData.forEach(trade => {
            const date = new Date(trade.created_at).toISOString().split('T')[0];
            if (!groupedData[date]) {
                groupedData[date] = 0;
            }
            groupedData[date]++;
        });
        
        // Convert to chart format
        const labels = Object.keys(groupedData).sort();
        const values = labels.map(date => groupedData[date]);
        
        return { labels, values };
    }
    
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
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DashboardPage();
});
```

## 4. Best Practices Summary

### System Integration
- Always initialize systems in the correct order
- Use caching for performance
- Handle errors gracefully
- Monitor performance
- Use appropriate notification modes

### Data Management
- Check cache before server requests
- Implement auto-save for forms
- Use batch operations for multiple items
- Clear cache when data changes

### User Experience
- Show loading indicators for long operations
- Provide clear error messages
- Use confirmations for destructive actions
- Implement auto-refresh for real-time data

### Performance
- Use lazy loading for large datasets
- Implement virtual scrolling for tables
- Monitor long tasks
- Use appropriate cache TTL values
