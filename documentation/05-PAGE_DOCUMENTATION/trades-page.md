# Trades Page - Documentation

## Overview
עמוד ניהול עסקאות - הצגה, עריכה, מחיקה וניהול עסקאות מסחר.

## Page Information
- **File:** `trades.html`
- **URL:** `http://localhost:8080/trades.html`
- **Type:** User Page (Priority 1)
- **Last Updated:** January 2025

## Features
- **Table Management:** Sortable, filterable, paginated table
- **CRUD Operations:** Create, Read, Update, Delete trades
- **Search & Filter:** Real-time search and status filtering
- **Action Buttons:** Edit, Delete, View trade details
- **Data Export:** Export trades data
- **Responsive:** Mobile-friendly design

## Required Systems

### Core Systems (חבילת בסיס)
1. **Unified App Initializer** - Page initialization
2. **Notification System** - User notifications
3. **Logger Service** - Logging and monitoring
4. **Unified Cache Manager** - Data caching
5. **Header System** - Navigation and filters

### Table Systems
1. **Table System** - Table management and operations
2. **Field Renderer** - Data display and formatting
3. **Button System** - Action buttons and menus

### Data Systems
1. **Data Utils** - Data processing utilities
2. **Date Utils** - Date formatting and handling

## JavaScript Files

### Core Files
```html
<script src="scripts/logger-service.js"></script>
<script src="scripts/unified-cache-manager.js"></script>
<script src="scripts/notification-system.js"></script>
<script src="scripts/unified-app-initializer.js"></script>
```

### Table Files
```html
<script src="scripts/tables.js"></script>
<script src="scripts/field-renderer-service.js"></script>
<script src="scripts/button-system-init.js"></script>
```

### Page-Specific Files
```html
<script src="scripts/trades.js"></script>
```

## API Endpoints

### Trades Data
```javascript
// Get all trades
GET /api/trades
Response: [
    {
        id: number,
        symbol: string,
        side: string,
        quantity: number,
        price: number,
        status: string,
        created_at: string,
        updated_at: string
    }
]

// Get trade by ID
GET /api/trades/{id}
Response: { trade object }

// Create trade
POST /api/trades
Body: { trade data }
Response: { created trade }

// Update trade
PUT /api/trades/{id}
Body: { updated trade data }
Response: { updated trade }

// Delete trade
DELETE /api/trades/{id}
Response: { success: boolean }
```

### Cache Management
```javascript
// Cache key: 'trades-data'
// TTL: 300 seconds (5 minutes)
// Auto-refresh: On data changes
```

## Page Structure

### HTML Structure
```html
<div id="trades-page" class="page-container">
    <div class="page-header">
        <h1>עסקאות</h1>
        <div class="filters">
            <input type="text" id="trades-filter" placeholder="חפש עסקאות...">
            <select id="status-filter">
                <option value="">כל הסטטוסים</option>
                <option value="open">פתוח</option>
                <option value="closed">סגור</option>
                <option value="cancelled">מבוטל</option>
            </select>
        </div>
    </div>
    
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
    
    <div class="pagination">
        <button id="prev-page" class="btn btn-secondary">הקודם</button>
        <span id="page-info">עמוד 1 מתוך 5</span>
        <button id="next-page" class="btn btn-secondary">הבא</button>
    </div>
</div>
```

## JavaScript Implementation

### Page Initialization
```javascript
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
            
            showSuccessNotification('עמוד עסקאות נטען בהצלחה');
            Logger.info('Trades page initialized successfully');
            
        } catch (error) {
            Logger.error('Trades page initialization failed', { error: error.message });
            showErrorNotification('שגיאה בטעינת עמוד העסקאות');
        }
    }
}
```

### Data Loading
```javascript
async loadTradesData() {
    try {
        // Check cache first
        const cacheKey = 'trades-data';
        const cachedData = window.UnifiedCacheManager?.get(cacheKey);
        
        if (cachedData) {
            this.currentData = cachedData;
            this.filteredData = [...cachedData];
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
```

### Table Setup
```javascript
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
```

### Action Buttons
```javascript
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
```

## Event Handlers

### Search Filter
```javascript
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
```

### Status Filter
```javascript
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
```

### CRUD Operations

#### Edit Trade
```javascript
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
```

#### Delete Trade
```javascript
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
```

#### View Trade
```javascript
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
```

## Table Management

### Update Table
```javascript
updateTable() {
    loadTableData(this.tableId, this.filteredData, {
        sortable: true,
        filterable: true,
        pagination: true
    });
    
    this.setupTableActions();
}
```

### Sort Table
```javascript
sortTable(columnIndex) {
    try {
        sortTable(columnIndex, this.tableId);
        Logger.debug('Table sorted', { columnIndex });
    } catch (error) {
        Logger.error('Sorting failed', { error: error.message });
    }
}
```

### Pagination
```javascript
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
```

## Performance Considerations

### Data Caching
```javascript
// Cache trades data for 5 minutes
await window.UnifiedCacheManager?.set('trades-data', data, { ttl: 300 });

// Clear cache on data changes
await window.UnifiedCacheManager?.delete('trades-data');
```

### Performance Monitoring
```javascript
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
```

## Error Handling

### Network Errors
```javascript
catch (error) {
    if (error.name === 'NetworkError') {
        // Try to use cached data
        const cachedData = window.UnifiedCacheManager?.get('trades-data');
        if (cachedData) {
            showWarningNotification('מצב לא מקוון - מוצגים נתונים שמורים');
            return cachedData;
        }
    }
    
    Logger.error('Trades page error', { error: error.message });
    showErrorNotification('שגיאה בטעינת העסקאות');
}
```

## Dependencies

### Required Systems
- Unified App Initializer
- Notification System
- Logger Service
- Unified Cache Manager
- Table System
- Field Renderer
- Button System

### Optional Systems
- Color Scheme System
- Date Utils
- Data Utils

## Testing

### Unit Tests
- Data loading functions
- Table operations
- CRUD operations
- Filter and search functions

### Integration Tests
- System initialization
- Cache management
- Error handling
- Performance monitoring

### E2E Tests
- Page loading
- Table operations
- CRUD operations
- Error scenarios

## Troubleshooting

### Common Issues

1. **Table not loading**
   - Check if table system is loaded
   - Verify data format
   - Check console for errors

2. **Actions not working**
   - Check if button system is loaded
   - Verify action handlers
   - Check permissions

3. **Performance issues**
   - Monitor table rendering
   - Check data size
   - Optimize queries

## Best Practices

1. **Always check cache first**
2. **Handle network errors gracefully**
3. **Use performance monitoring**
4. **Implement proper error handling**
5. **Provide user feedback**
6. **Log all operations**
7. **Use appropriate error messages**
8. **Optimize for large datasets**
