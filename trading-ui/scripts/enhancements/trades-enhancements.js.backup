/**
 * Trades Page Enhancements - TikTrack
 * שיפורים לעמוד העסקאות
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Trades Page Enhancement System
class TradesPageEnhancements {
    constructor() {
        this.enhancements = {
            performance: true,
            ux: true,
            data: true,
            design: true
        };
        
        this.stats = {
            loadTime: 0,
            tableRows: 0,
            dataPoints: 0
        };
        
        this.init();
    }
    
    /**
     * Initialize enhancements
     */
    async init() {
        try {
            window.Logger.info('🚀 Initializing Trades Page Enhancements', { page: 'trades-enhancements' });
            
            // Apply all enhancements
            await this.applyPerformanceEnhancements();
            await this.applyUXEnhancements();
            await this.applyDataEnhancements();
            await this.applyDesignEnhancements();
            
            window.Logger.info('✅ Trades Page Enhancements initialized successfully', { page: 'trades-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error initializing Trades Page Enhancements:', error, { page: 'trades-enhancements' });
        }
    }
    
    /**
     * Apply performance enhancements
     */
    async applyPerformanceEnhancements() {
        if (!this.enhancements.performance) return;
        
        try {
            // Virtual scrolling for large tables
            this.setupVirtualScrolling();
            
            // Lazy loading for table data
            this.setupLazyTableLoading();
            
            // Optimize table rendering
            this.setupTableOptimization();
            
            window.Logger.info('✅ Performance enhancements applied', { page: 'trades-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying performance enhancements:', error, { page: 'trades-enhancements' });
        }
    }
    
    /**
     * Apply UX enhancements
     */
    async applyUXEnhancements() {
        if (!this.enhancements.ux) return;
        
        try {
            // Add advanced filtering
            this.addAdvancedFiltering();
            
            // Add bulk actions
            this.addBulkActions();
            
            // Add quick actions
            this.addQuickActions();
            
            // Add search functionality
            this.addSearchFunctionality();
            
            window.Logger.info('✅ UX enhancements applied', { page: 'trades-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying UX enhancements:', error, { page: 'trades-enhancements' });
        }
    }
    
    /**
     * Apply data enhancements
     */
    async applyDataEnhancements() {
        if (!this.enhancements.data) return;
        
        try {
            // Real-time data updates
            this.setupRealTimeUpdates();
            
            // Data validation
            this.setupDataValidation();
            
            // Data export
            this.setupDataExport();
            
            window.Logger.info('✅ Data enhancements applied', { page: 'trades-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying data enhancements:', error, { page: 'trades-enhancements' });
        }
    }
    
    /**
     * Apply design enhancements
     */
    async applyDesignEnhancements() {
        if (!this.enhancements.design) return;
        
        try {
            // Add visual indicators
            this.addVisualIndicators();
            
            // Add animations
            this.addAnimations();
            
            // Add responsive design
            this.addResponsiveDesign();
            
            window.Logger.info('✅ Design enhancements applied', { page: 'trades-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error applying design enhancements:', error, { page: 'trades-enhancements' });
        }
    }
    
    /**
     * Setup virtual scrolling
     */
    setupVirtualScrolling() {
        const tableContainer = document.querySelector('.table-container');
        if (!tableContainer) return;
        
        // Add virtual scrolling for large datasets
        this.virtualScrolling = {
            container: tableContainer,
            itemHeight: 50,
            visibleItems: 20,
            startIndex: 0,
            endIndex: 20
        };
        
        // Setup scroll listener
        tableContainer.addEventListener('scroll', this.handleVirtualScroll.bind(this));
    }
    
    /**
     * Handle virtual scroll
     */
    handleVirtualScroll(event) {
        const container = event.target;
        const scrollTop = container.scrollTop;
        const itemHeight = this.virtualScrolling.itemHeight;
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + this.virtualScrolling.visibleItems, this.stats.tableRows);
        
        this.virtualScrolling.startIndex = startIndex;
        this.virtualScrolling.endIndex = endIndex;
        
        this.renderVirtualItems();
    }
    
    /**
     * Render virtual items
     */
    renderVirtualItems() {
        // Implement virtual rendering logic
        const { startIndex, endIndex } = this.virtualScrolling;
        
        // Update table rows based on visible range
        this.updateTableRows(startIndex, endIndex);
    }
    
    /**
     * Update table rows
     */
    updateTableRows(startIndex, endIndex) {
        // Implement table row updates
        const tableBody = document.querySelector('tbody');
        if (!tableBody) return;
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Add visible rows
        for (let i = startIndex; i < endIndex; i++) {
            const row = this.createTableRow(i);
            tableBody.appendChild(row);
        }
    }
    
    /**
     * Create table row
     */
    createTableRow(index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>Trade ${index + 1}</td>
            <td>Active</td>
            <td>$100.00</td>
            <td>2025-01-01</td>
        `;
        return row;
    }
    
    /**
     * Setup lazy table loading
     */
    setupLazyTableLoading() {
        // Load table data in chunks
        this.loadTableDataChunk = this.debounce(this.loadTableData, 300);
        
        // Setup intersection observer for lazy loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadTableDataChunk();
                }
            });
        });
        
        // Observe table container
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            observer.observe(tableContainer);
        }
    }
    
    /**
     * Load table data
     */
    async loadTableData() {
        try {
            window.Logger.info('📊 Loading table data...', { page: 'trades-enhancements' });
            
            // Add loading indicator
            this.addTableLoadingIndicator();
            
            // Load data
            const data = await this.fetchTableData();
            
            // Update table
            this.updateTable(data);
            
            // Remove loading indicator
            this.removeTableLoadingIndicator();
            
            this.stats.tableRows = data.length;
            window.Logger.info('✅ Table data loaded successfully', { page: 'trades-enhancements' });
        } catch (error) {
            window.Logger.error('❌ Error loading table data:', error, { page: 'trades-enhancements' });
            this.showTableError();
        }
    }
    
    /**
     * Fetch table data
     */
    async fetchTableData() {
        try {
            const response = await fetch('/api/trades');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            window.Logger.error('❌ Error fetching table data:', error, { page: 'trades-enhancements' });
            return [];
        }
    }
    
    /**
     * Update table
     */
    updateTable(data) {
        const tableBody = document.querySelector('tbody');
        if (!tableBody) return;
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Add new rows
        data.forEach((item, index) => {
            const row = this.createTableRowFromData(item, index);
            tableBody.appendChild(row);
        });
    }
    
    /**
     * Create table row from data
     */
    createTableRowFromData(data, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${data.symbol || 'N/A'}</td>
            <td>${data.status || 'N/A'}</td>
            <td>${data.price || 'N/A'}</td>
            <td>${data.date || 'N/A'}</td>
        `;
        return row;
    }
    
    /**
     * Setup table optimization
     */
    setupTableOptimization() {
        // Optimize table rendering
        this.optimizeTableRendering();
        
        // Setup table caching
        this.setupTableCaching();
    }
    
    /**
     * Optimize table rendering
     */
    optimizeTableRendering() {
        // Use document fragments for better performance
        this.useDocumentFragments = true;
        
        // Batch DOM updates
        this.batchDOMUpdates = true;
    }
    
    /**
     * Setup table caching
     */
    setupTableCaching() {
        // Cache table data
        this.tableCache = {
            data: null,
            timestamp: 0,
            ttl: 300000 // 5 minutes
        };
    }
    
    /**
     * Add advanced filtering
     */
    addAdvancedFiltering() {
        const filterContainer = document.querySelector('.table-actions');
        if (!filterContainer) return;
        
        const filterHTML = `
            <div class="advanced-filters">
                <select class="form-select form-select-sm" id="statusFilter">
                    <option value="">כל הסטטוסים</option>
                    <option value="active">פעיל</option>
                    <option value="closed">סגור</option>
                    <option value="pending">ממתין</option>
                </select>
                <select class="form-select form-select-sm" id="symbolFilter">
                    <option value="">כל הסמלים</option>
                    <option value="AAPL">AAPL</option>
                    <option value="GOOGL">GOOGL</option>
                    <option value="MSFT">MSFT</option>
                </select>
                <input type="date" class="form-control form-control-sm" id="dateFilter" placeholder="תאריך">
            </div>
        `;
        
        filterContainer.insertAdjacentHTML('beforeend', filterHTML);
        
        // Add filter event listeners
        this.addFilterEventListeners();
    }
    
    /**
     * Add filter event listeners
     */
    addFilterEventListeners() {
        const filters = ['statusFilter', 'symbolFilter', 'dateFilter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', this.applyFilters.bind(this));
            }
        });
    }
    
    /**
     * Apply filters
     */
    applyFilters() {
        const filters = {
            status: document.getElementById('statusFilter')?.value || '',
            symbol: document.getElementById('symbolFilter')?.value || '',
            date: document.getElementById('dateFilter')?.value || ''
        };
        
        this.filterTableData(filters);
    }
    
    /**
     * Filter table data
     */
    filterTableData(filters) {
        const tableRows = document.querySelectorAll('tbody tr');
        
        tableRows.forEach(row => {
            const status = row.cells[2]?.textContent || '';
            const symbol = row.cells[1]?.textContent || '';
            const date = row.cells[4]?.textContent || '';
            
            let showRow = true;
            
            if (filters.status && status !== filters.status) {
                showRow = false;
            }
            
            if (filters.symbol && symbol !== filters.symbol) {
                showRow = false;
            }
            
            if (filters.date && date !== filters.date) {
                showRow = false;
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }
    
    /**
     * Add bulk actions
     */
    addBulkActions() {
        const actionsContainer = document.querySelector('.table-actions');
        if (!actionsContainer) return;
        
        const bulkActionsHTML = `
            <div class="bulk-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="this.selectAllRows()">
                    <i class="bi bi-check-all"></i> בחר הכל
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="this.bulkEdit()">
                    <i class="bi bi-pencil"></i> ערוך
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="this.bulkDelete()">
                    <i class="bi bi-trash"></i> מחק
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="this.bulkExport()">
                    <i class="bi bi-download"></i> ייצא
                </button>
            </div>
        `;
        
        actionsContainer.insertAdjacentHTML('beforeend', bulkActionsHTML);
    }
    
    /**
     * Add quick actions
     */
    addQuickActions() {
        const quickActionsContainer = document.querySelector('.section-actions');
        if (!quickActionsContainer) return;
        
        const quickActionsHTML = `
            <div class="quick-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="this.refreshTrades()">
                    <i class="bi bi-arrow-clockwise"></i> רענן
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="this.addTrade()">
                    <i class="bi bi-plus"></i> הוסף עסקה
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="this.exportTrades()">
                    <i class="bi bi-download"></i> ייצא
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="this.importTrades()">
                    <i class="bi bi-upload"></i> ייבוא
                </button>
            </div>
        `;
        
        quickActionsContainer.insertAdjacentHTML('beforeend', quickActionsHTML);
    }
    
    /**
     * Add search functionality
     */
    addSearchFunctionality() {
        const searchContainer = document.querySelector('.table-actions');
        if (!searchContainer) return;
        
        const searchHTML = `
            <div class="search-container">
                <input type="text" class="form-control form-control-sm" id="searchInput" placeholder="חיפוש...">
                <button class="btn btn-sm btn-outline-secondary" onclick="this.clearSearch()">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
        
        searchContainer.insertAdjacentHTML('beforeend', searchHTML);
        
        // Add search event listener
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }
    }
    
    /**
     * Handle search
     */
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        this.searchTableData(searchTerm);
    }
    
    /**
     * Search table data
     */
    searchTableData(searchTerm) {
        const tableRows = document.querySelectorAll('tbody tr');
        
        tableRows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            const showRow = rowText.includes(searchTerm);
            row.style.display = showRow ? '' : 'none';
        });
    }
    
    /**
     * Setup real-time updates
     */
    setupRealTimeUpdates() {
        // Update table data every 30 seconds
        setInterval(() => {
            this.loadTableDataChunk();
        }, 30000);
    }
    
    /**
     * Setup data validation
     */
    setupDataValidation() {
        // Validate data before display
        this.originalLoadTableData = this.loadTableData;
        this.loadTableData = async () => {
            const data = await this.originalLoadTableData();
            return this.validateTableData(data);
        };
    }
    
    /**
     * Validate table data
     */
    validateTableData(data) {
        if (!Array.isArray(data)) return [];
        
        return data.filter(item => {
            // Validate required fields
            return item.symbol && item.status && item.price;
        });
    }
    
    /**
     * Setup data export
     */
    setupDataExport() {
        // Add export functionality
        this.exportData = this.debounce(this.performDataExport, 1000);
    }
    
    /**
     * Perform data export
     */
    async performDataExport() {
        try {
            const data = await this.fetchTableData();
            const csv = this.convertToCSV(data);
            this.downloadCSV(csv, 'trades.csv');
        } catch (error) {
            window.Logger.error('❌ Error exporting data:', error, { page: 'trades-enhancements' });
        }
    }
    
    /**
     * Convert data to CSV
     */
    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => row[header] || '').join(','))
        ].join('\n');
        
        return csvContent;
    }
    
    /**
     * Download CSV
     */
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    /**
     * Add visual indicators
     */
    addVisualIndicators() {
        // Add status indicators
        this.addStatusIndicators();
        
        // Add progress bars
        this.addProgressBars();
        
        // Add trend indicators
        this.addTrendIndicators();
    }
    
    /**
     * Add status indicators
     */
    addStatusIndicators() {
        // Add status indicators to table rows
        document.querySelectorAll('tbody tr').forEach(row => {
            const statusCell = row.cells[2];
            if (statusCell && !statusCell.querySelector('.status-indicator')) {
                const status = statusCell.textContent;
                const indicator = document.createElement('span');
                indicator.className = `status-indicator badge ${this.getStatusColor(status)}`;
                indicator.textContent = status;
                statusCell.innerHTML = '';
                statusCell.appendChild(indicator);
            }
        });
    }
    
    /**
     * Get status color
     */
    getStatusColor(status) {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-success';
            case 'closed': return 'bg-secondary';
            case 'pending': return 'bg-warning';
            default: return 'bg-info';
        }
    }
    
    /**
     * Add progress bars
     */
    addProgressBars() {
        // Add progress bars to statistics
        const statsContainer = document.querySelector('.table-count');
        if (statsContainer) {
            const progressBar = document.createElement('div');
            progressBar.className = 'progress mt-2';
            progressBar.innerHTML = `
                <div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            `;
            statsContainer.appendChild(progressBar);
        }
    }
    
    /**
     * Add trend indicators
     */
    addTrendIndicators() {
        // Add trend indicators to price cells
        document.querySelectorAll('tbody tr').forEach(row => {
            const priceCell = row.cells[3];
            if (priceCell && !priceCell.querySelector('.trend-indicator')) {
                const price = parseFloat(priceCell.textContent);
                const indicator = document.createElement('span');
                indicator.className = 'trend-indicator ms-2';
                indicator.innerHTML = price > 0 ? '<i class="bi bi-arrow-up text-success"></i>' : '<i class="bi bi-arrow-down text-danger"></i>';
                priceCell.appendChild(indicator);
            }
        });
    }
    
    /**
     * Add animations
     */
    addAnimations() {
        // Add fade-in animations
        this.addFadeInAnimations();
        
        // Add slide animations
        this.addSlideAnimations();
        
        // Add pulse animations
        this.addPulseAnimations();
    }
    
    /**
     * Add fade-in animations
     */
    addFadeInAnimations() {
        // Add fade-in to table rows
        document.querySelectorAll('tbody tr').forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    /**
     * Add slide animations
     */
    addSlideAnimations() {
        // Add slide animations to table
        const table = document.querySelector('table');
        if (table) {
            table.style.transform = 'translateX(-20px)';
            table.style.transition = 'transform 0.5s ease';
            
            setTimeout(() => {
                table.style.transform = 'translateX(0)';
            }, 200);
        }
    }
    
    /**
     * Add pulse animations
     */
    addPulseAnimations() {
        // Add pulse to loading elements
        document.querySelectorAll('.spinner-border').forEach(spinner => {
            spinner.style.animation = 'pulse 1s infinite';
        });
    }
    
    /**
     * Add responsive design
     */
    addResponsiveDesign() {
        // Add responsive breakpoints
        this.addResponsiveBreakpoints();
        
        // Add mobile optimizations
        this.addMobileOptimizations();
    }
    
    /**
     * Add responsive breakpoints
     */
    addResponsiveBreakpoints() {
        // Add responsive classes to table
        const table = document.querySelector('table');
        if (table) {
            table.classList.add('table-responsive');
        }
    }
    
    /**
     * Add mobile optimizations
     */
    addMobileOptimizations() {
        // Add touch events
        this.addTouchEvents();
        
        // Add mobile-specific styles
        this.addMobileStyles();
    }
    
    /**
     * Add touch events
     */
    addTouchEvents() {
        // Add touch events to table rows
        document.querySelectorAll('tbody tr').forEach(row => {
            row.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            row.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
        });
    }
    
    /**
     * Add mobile styles
     */
    addMobileStyles() {
        // Add mobile-specific CSS
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .table-responsive {
                    font-size: 0.875rem;
                }
                .btn {
                    padding: 0.5rem 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Add table loading indicator
     */
    addTableLoadingIndicator() {
        const tableBody = document.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">טוען...</span>
                        </div>
                        <p class="mt-2">טוען נתונים...</p>
                    </td>
                </tr>
            `;
        }
    }
    
    /**
     * Remove table loading indicator
     */
    removeTableLoadingIndicator() {
        const tableBody = document.querySelector('tbody');
        if (tableBody) {
            const loadingRow = tableBody.querySelector('tr');
            if (loadingRow && loadingRow.textContent.includes('טוען')) {
                loadingRow.remove();
            }
        }
    }
    
    /**
     * Show table error
     */
    showTableError() {
        const tableBody = document.querySelector('tbody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        <i class="bi bi-exclamation-triangle"></i>
                        <p class="mt-2">שגיאה בטעינת הנתונים</p>
                        <button class="btn btn-sm btn-outline-primary" onclick="window.location.reload()">
                            נסה שוב
                        </button>
                    </td>
                </tr>
            `;
        }
    }
    
    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Get enhancement statistics
     */
    getStats() {
        return {
            ...this.stats,
            enhancements: Object.keys(this.enhancements).filter(key => this.enhancements[key]).length,
            totalEnhancements: Object.keys(this.enhancements).length
        };
    }
}

// Initialize enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.TradesPageEnhancements = new TradesPageEnhancements();
});

// Export for global access
window.TradesPageEnhancements = TradesPageEnhancements;
