/**
 * Pagination System - General Purpose
 * ===================================
 * 
 * מערכת pagination כללית לשימוש בכל הטבלאות במערכת
 * 
 * תכונות:
 * - תמיכה בהעדפות משתמש
 * - ממשק משתמש אחיד
 * - ביצועים מיטביים
 * - תמיכה בטבלאות גדולות
 * 
 * @version 1.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

// ===== GLOBAL PAGINATION SYSTEM =====

window.PaginationSystem = {
    // Default settings
    defaultPageSize: 20,
    maxPageSize: 100,
    minPageSize: 5,
    
    // Active pagination instances
    instances: new Map(),
    
    /**
     * יצירת instance חדש של pagination
     * @param {string} tableId - מזהה הטבלה
     * @param {Object} options - אפשרויות
     * @returns {Object} - instance של pagination
     */
    create: function(tableId, options = {}) {
        const config = {
            tableId: tableId,
            pageSize: options.pageSize || this.defaultPageSize,
            maxPageSize: options.maxPageSize || this.maxPageSize,
            minPageSize: options.minPageSize || this.minPageSize,
            showPageSizeSelector: options.showPageSizeSelector !== false,
            showPageInfo: options.showPageInfo !== false,
            showNavigation: options.showNavigation !== false,
            onPageChange: options.onPageChange || null,
            onPageSizeChange: options.onPageSizeChange || null,
            data: options.data || [],
            currentPage: 1
        };
        
        const instance = new PaginationInstance(config);
        this.instances.set(tableId, instance);
        
        return instance;
    },
    
    /**
     * קבלת instance קיים
     * @param {string} tableId - מזהה הטבלה
     * @returns {Object|null} - instance של pagination
     */
    get: function(tableId) {
        return this.instances.get(tableId) || null;
    },
    
    /**
     * מחיקת instance
     * @param {string} tableId - מזהה הטבלה
     */
    destroy: function(tableId) {
        const instance = this.instances.get(tableId);
        if (instance) {
            instance.destroy();
            this.instances.delete(tableId);
        }
    }
};

// ===== PAGINATION INSTANCE CLASS =====

class PaginationInstance {
    constructor(config) {
        this.config = config;
        this.data = config.data || [];
        this.filteredData = [...this.data];
        this.currentPage = config.currentPage || 1;
        this.pageSize = config.pageSize || 20;
        this.totalPages = 0;
        this.totalItems = 0;
        
        this.init();
    }
    
    /**
     * אתחול ה-pagination
     */
    async init() {
        // Load page size from preferences
        if (typeof window.getPaginationSize === 'function') {
            try {
                const savedPageSize = await window.getPaginationSize(this.config.tableId);
                if (savedPageSize && savedPageSize >= this.config.minPageSize && savedPageSize <= this.config.maxPageSize) {
                    this.pageSize = savedPageSize;
                }
            } catch (error) {
                console.warn('Failed to load pagination size preference:', error);
            }
        }
        
        this.calculatePages();
        this.render();
    }
    
    /**
     * חישוב מספר עמודים
     */
    calculatePages() {
        this.totalItems = this.filteredData.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        
        // Ensure current page is valid
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
        }
        if (this.currentPage < 1) {
            this.currentPage = 1;
        }
    }
    
    /**
     * קבלת נתונים לעמוד הנוכחי
     * @returns {Array} - נתונים לעמוד הנוכחי
     */
    getCurrentPageData() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.filteredData.slice(startIndex, endIndex);
    }
    
    /**
     * עדכון נתונים
     * @param {Array} newData - נתונים חדשים
     */
    setData(newData) {
        this.data = newData || [];
        this.filteredData = [...this.data];
        this.currentPage = 1;
        this.calculatePages();
        this.render();
    }
    
    /**
     * סינון נתונים
     * @param {Function} filterFunction - פונקציית סינון
     */
    filter(filterFunction) {
        if (typeof filterFunction === 'function') {
            this.filteredData = this.data.filter(filterFunction);
        } else {
            this.filteredData = [...this.data];
        }
        this.currentPage = 1;
        this.calculatePages();
        this.render();
    }
    
    /**
     * מעבר לעמוד
     * @param {number} page - מספר עמוד
     */
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.render();
            
            if (this.config.onPageChange) {
                this.config.onPageChange(this.getCurrentPageData(), this.currentPage);
            }
        }
    }
    
    /**
     * עמוד הבא
     */
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    }
    
    /**
     * עמוד הקודם
     */
    previousPage() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }
    
    /**
     * שינוי גודל עמוד
     * @param {number} newPageSize - גודל עמוד חדש
     */
    async setPageSize(newPageSize) {
        if (newPageSize >= this.config.minPageSize && newPageSize <= this.config.maxPageSize) {
            this.pageSize = newPageSize;
            this.currentPage = 1;
            this.calculatePages();
            this.render();
            
            // Save to preferences
            if (typeof window.setPaginationSize === 'function') {
                try {
                    await window.setPaginationSize(this.config.tableId, newPageSize);
                } catch (error) {
                    console.warn('Failed to save pagination size preference:', error);
                }
            }
            
            if (this.config.onPageSizeChange) {
                this.config.onPageSizeChange(newPageSize);
            }
        }
    }
    
    /**
     * רינדור ה-pagination
     */
    render() {
        const table = document.getElementById(this.config.tableId);
        if (!table) return;
        
        // Remove existing pagination
        this.removePagination();
        
        // Create pagination container
        const paginationContainer = this.createPaginationContainer();
        
        // Insert after table
        table.parentNode.insertBefore(paginationContainer, table.nextSibling);
    }
    
    /**
     * יצירת container של pagination
     * @returns {HTMLElement} - container של pagination
     */
    createPaginationContainer() {
        const container = document.createElement('div');
        container.className = 'pagination-container';
        container.id = `${this.config.tableId}-pagination`;
        
        const startItem = this.totalItems > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
        const endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);
        
        let html = `
            <div class="pagination-wrapper">
                <div class="pagination-info">
                    <span class="items-info">
                        מציג ${startItem}-${endItem} מתוך ${this.totalItems} פריטים
                    </span>
        `;
        
        // Page size selector
        if (this.config.showPageSizeSelector) {
            html += `
                    <select class="page-size-selector" onchange="PaginationSystem.get('${this.config.tableId}').setPageSize(parseInt(this.value))">
                        <option value="5" ${this.pageSize === 5 ? 'selected' : ''}>5 פריטים</option>
                        <option value="10" ${this.pageSize === 10 ? 'selected' : ''}>10 פריטים</option>
                        <option value="20" ${this.pageSize === 20 ? 'selected' : ''}>20 פריטים</option>
                        <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50 פריטים</option>
                        <option value="100" ${this.pageSize === 100 ? 'selected' : ''}>100 פריטים</option>
                    </select>
            `;
        }
        
        html += `
                </div>
        `;
        
        // Navigation buttons
        if (this.config.showNavigation && this.totalPages > 1) {
            html += `
                <div class="pagination-navigation">
                    <button class="pagination-btn" onclick="PaginationSystem.get('${this.config.tableId}').previousPage()" 
                            ${this.currentPage <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i> הקודם
                    </button>
                    
                    <span class="page-info">
                        עמוד ${this.currentPage} מתוך ${this.totalPages}
                    </span>
                    
                    <button class="pagination-btn" onclick="PaginationSystem.get('${this.config.tableId}').nextPage()" 
                            ${this.currentPage >= this.totalPages ? 'disabled' : ''}>
                        הבא <i class="fas fa-chevron-left"></i>
                    </button>
                </div>
            `;
        }
        
        html += `
            </div>
        `;
        
        container.innerHTML = html;
        return container;
    }
    
    /**
     * הסרת pagination קיים
     */
    removePagination() {
        const existing = document.getElementById(`${this.config.tableId}-pagination`);
        if (existing) {
            existing.remove();
        }
    }
    
    /**
     * הרס ה-instance
     */
    destroy() {
        this.removePagination();
    }
}

// ===== GLOBAL FUNCTIONS =====

/**
 * יצירת pagination לטבלה
 * @param {string} tableId - מזהה הטבלה
 * @param {Object} options - אפשרויות
 * @returns {Object} - instance של pagination
 */
window.createPagination = function(tableId, options = {}) {
    return window.PaginationSystem.create(tableId, options);
};

/**
 * קבלת pagination קיים
 * @param {string} tableId - מזהה הטבלה
 * @returns {Object|null} - instance של pagination
 */
window.getPagination = function(tableId) {
    return window.PaginationSystem.get(tableId);
};

/**
 * מחיקת pagination
 * @param {string} tableId - מזהה הטבלה
 */
window.destroyPagination = function(tableId) {
    window.PaginationSystem.destroy(tableId);
};

