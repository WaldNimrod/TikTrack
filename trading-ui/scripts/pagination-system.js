/**
 * Pagination System - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the general purpose pagination system for all tables in TikTrack.
 * Includes user preferences support, unified UI, optimal performance, and large table support.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/PAGINATION_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: 2025-01-27
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
     * Resolve table type by table id
     * @param {string} tableId
     * @returns {string|null}
     */
    resolveTableType: function(tableId) {
        if (!tableId || typeof document === 'undefined') {
            return null;
        }

        const tableElement = document.getElementById(tableId);
        if (!tableElement) {
            return window.TableDataRegistry?.resolveTableType?.(tableId) || null;
        }

        const directType = tableElement.getAttribute('data-table-type');
        if (directType) {
            return directType;
        }

        const container = tableElement.closest('[data-table-type]');
        if (container) {
            return container.getAttribute('data-table-type');
        }

        return window.TableDataRegistry?.resolveTableType?.(tableId) || null;
    },

    /**
     * Register table in registry when available
     * @param {string} tableType
     * @param {string} tableId
     * @param {string} source
     */
    registerTableInRegistry: function(tableType, tableId, source = 'pagination-system') {
        if (!window.TableDataRegistry || tableType === null) {
            return;
        }

        window.TableDataRegistry.registerTable({
            tableType,
            tableId,
            source,
        });
    },
    
    /**
     * יצירת instance חדש של pagination
     * @param {string} tableId - מזהה הטבלה
     * @param {Object} options - אפשרויות
     * @returns {Object} - instance של pagination
     */
    create: function(tableId, options = {}) {
        // Check if table is in a modal - don't create pagination if so
        if (typeof document !== 'undefined') {
            const table = document.getElementById(tableId);
            if (table) {
                const isInModal = table.closest('.modal, [class*="modal"]');
                if (isInModal) {
                    console.warn(`⚠️ [PaginationSystem.create] Skipping pagination creation for table ${tableId} - table is inside a modal`);
                    return null;
                }
            }
        }
        
        const resolvedTableType = options.tableType || this.resolveTableType(tableId);
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
            onAfterRender: options.onAfterRender || null,
            onFilteredDataChange: options.onFilteredDataChange || null,
            useRegistry: options.useRegistry !== false,
            tableType: resolvedTableType,
            data: options.data || [],
            currentPage: 1
        };
        
        const instance = new PaginationInstance(config);
        this.instances.set(tableId, instance);
        
        if (config.useRegistry && window.TableDataRegistry) {
            this.registerTableInRegistry(config.tableType, tableId);
            window.TableDataRegistry.setFullData(config.tableType || tableId, config.data, { tableId });
            window.TableDataRegistry.setFilteredData(config.tableType || tableId, config.data, {
                tableId,
                skipPageReset: true,
            });
        }

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
        this.tableType = config.tableType || config.tableId || null;
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

        if (this.config.useRegistry && window.TableDataRegistry) {
            window.TableDataRegistry.setFullData(this.tableType || this.config.tableId, this.data, {
                tableId: this.config.tableId,
                resetFiltered: false,
            });
            window.TableDataRegistry.setFilteredData(this.tableType || this.config.tableId, this.filteredData, {
                tableId: this.config.tableId,
                skipPageReset: true,
            });
        }
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
     * קבלת הנתונים המסוננים (filtered)
     * @param {boolean} [asReference=false] - האם להחזיר רפרנס ישיר
     * @returns {Array}
     */
    getFilteredData(asReference = false) {
        if (asReference) {
            return this.filteredData;
        }
        return [...this.filteredData];
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

        if (this.config.useRegistry && window.TableDataRegistry) {
            window.TableDataRegistry.setFullData(this.tableType || this.config.tableId, this.data, {
                tableId: this.config.tableId,
                resetFiltered: false,
            });
            window.TableDataRegistry.setFilteredData(this.tableType || this.config.tableId, this.filteredData, {
                tableId: this.config.tableId,
                skipPageReset: true,
            });
        }

        this.notifyFilteredDataChange();
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

        if (this.config.useRegistry && window.TableDataRegistry) {
            window.TableDataRegistry.setFilteredData(this.tableType || this.config.tableId, this.filteredData, {
                tableId: this.config.tableId,
            });
        }

        this.notifyFilteredDataChange();
    }
    
    /**
     * מעבר לעמוד
     * @param {number} page - מספר עמוד
     */
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
            const previousPage = this.currentPage;
            this.currentPage = page;
            console.log(`📄 [PaginationInstance.goToPage] Changing page from ${previousPage} to ${page} for table ${this.config.tableId}`, {
                tableId: this.config.tableId,
                previousPage,
                newPage: page,
                hasOnAfterRender: typeof this.config.onAfterRender === 'function',
            });
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
            
            // Note: Pagination size changes are not automatically saved to preferences
            // Preferences should only be saved when user explicitly saves them
            
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
        
        // Check if table is in a modal - skip pagination if so
        const isInModal = table.closest('.modal, [class*="modal"]');
        if (isInModal) {
            console.warn(`⚠️ [PaginationSystem] Skipping pagination for table ${this.config.tableId} - table is inside a modal`);
            return;
        }
        
        // Remove existing pagination
        this.removePagination();
        
        // Create compact pagination container (above table)
        const compactContainer = this.createCompactPaginationContainer();
        
        // Create full pagination container (below table)
        const fullContainer = this.createPaginationContainer();
        
        // Insert compact container before table
        table.parentNode.insertBefore(compactContainer, table);
        
        // Insert full container after table
        table.parentNode.insertBefore(fullContainer, table.nextSibling);

        const pageData = this.getCurrentPageData();

        if (this.config.useRegistry && window.TableDataRegistry) {
            window.TableDataRegistry.setPageData(this.tableType || this.config.tableId, pageData, {
                tableId: this.config.tableId,
                pageInfo: {
                    currentPage: this.currentPage,
                    totalPages: this.totalPages,
                    pageSize: this.pageSize,
                    totalItems: this.totalItems,
                    filteredItems: this.filteredData.length,
                },
            });
        }

        // Call notifyAfterRender asynchronously - don't block render
        // This ensures the pagination UI updates immediately, even if the callback is async
        this.notifyAfterRender(pageData).catch(error => {
            console.warn('PaginationInstance.notifyAfterRender async error:', error);
        });
    }
    
    /**
     * יצירת container של pagination (תצוגה מלאה - מתחת לטבלה)
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
                <button class="pagination-btn pagination-btn-icon-only" onclick="PaginationSystem.get('${this.config.tableId}').previousPage()" 
                        ${this.currentPage <= 1 ? 'disabled' : ''}
                        aria-label="עמוד הקודם">
                    <i class="ti ti-chevron-right"></i>
                </button>
                
                <span class="page-info">
                    ע. ${this.currentPage} מ: ${this.totalPages}
                </span>
                
                <button class="pagination-btn pagination-btn-icon-only" onclick="PaginationSystem.get('${this.config.tableId}').nextPage()" 
                        ${this.currentPage >= this.totalPages ? 'disabled' : ''}
                        aria-label="עמוד הבא">
                    <i class="ti ti-chevron-left"></i>
                </button>
                
                <span class="items-info">
                    ${startItem}-${endItem} מתוך: ${this.totalItems}
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
        
        // Insert using DOMParser
        container.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        doc.body.childNodes.forEach(node => {
          container.appendChild(node.cloneNode(true));
        });
        return container;
    }
    
    /**
     * יצירת container של pagination מצומצם (תצוגה מצומצמת - מעל הטבלה)
     * @returns {HTMLElement} - container של pagination מצומצם
     */
    createCompactPaginationContainer() {
        const container = document.createElement('div');
        container.className = 'pagination-container-compact';
        container.id = `${this.config.tableId}-pagination-compact`;
        
        let html = `
            <div class="pagination-compact-wrapper">
                <button class="pagination-btn pagination-btn-icon-only" onclick="PaginationSystem.get('${this.config.tableId}').previousPage()" 
                        ${this.currentPage <= 1 ? 'disabled' : ''}
                        aria-label="עמוד הקודם">
                    <i class="ti ti-chevron-right"></i>
                </button>
                
                <span class="page-info-compact">
                    ע. ${this.currentPage} מ: ${this.totalPages}
                </span>
                
                <button class="pagination-btn pagination-btn-icon-only" onclick="PaginationSystem.get('${this.config.tableId}').nextPage()" 
                        ${this.currentPage >= this.totalPages ? 'disabled' : ''}
                        aria-label="עמוד הבא">
                    <i class="ti ti-chevron-left"></i>
                </button>
            </div>
        `;
        
        // Insert using DOMParser
        container.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        doc.body.childNodes.forEach(node => {
          container.appendChild(node.cloneNode(true));
        });
        return container;
    }
    
    /**
     * הסרת pagination קיים (גם מצומצם וגם מלא)
     */
    removePagination() {
        const existing = document.getElementById(`${this.config.tableId}-pagination`);
        if (existing) {
            existing.remove();
        }
        const existingCompact = document.getElementById(`${this.config.tableId}-pagination-compact`);
        if (existingCompact) {
            existingCompact.remove();
        }
    }
    
    /**
     * הרס ה-instance
     */
    destroy() {
        this.removePagination();
    }

    /**
     * Notify external listeners about filtered data changes
     * @private
     */
    notifyFilteredDataChange() {
        if (typeof this.config.onFilteredDataChange === 'function') {
            try {
                this.config.onFilteredDataChange({
                    tableId: this.config.tableId,
                    tableType: this.tableType,
                    filteredData: [...this.filteredData],
                    totalItems: this.totalItems,
                    filteredItems: this.filteredData.length,
                });
            } catch (error) {
                console.warn('PaginationInstance.onFilteredDataChange failed:', error);
            }
        }
    }

    /**
     * Notify after render hook
     * @param {Array} pageData
     * @private
     */
    async notifyAfterRender(pageData) {
        // Use Logger.debug instead of console.log to avoid cluttering console
        if (window.Logger && window.Logger.debug) {
            window.Logger.debug(`PaginationInstance.notifyAfterRender starting for table ${this.config.tableId}`, {
                tableId: this.config.tableId,
                hasCallback: typeof this.config.onAfterRender === 'function',
                currentPage: this.currentPage,
                pageDataLength: pageData?.length || 0,
                totalItems: this.totalItems,
                page: 'pagination-system'
            });
        }
        
        if (typeof this.config.onAfterRender === 'function') {
            try {
                const callbackPayload = {
                    tableId: this.config.tableId,
                    tableType: this.tableType,
                    pageData: [...pageData],
                    filteredData: this.getFilteredData(),
                    pagination: {
                        currentPage: this.currentPage,
                        totalPages: this.totalPages,
                        pageSize: this.pageSize,
                        totalItems: this.totalItems,
                        filteredItems: this.filteredData.length,
                    },
                };
                const callbackResult = this.config.onAfterRender(callbackPayload);
                // If the callback returns a Promise, wait for it
                if (callbackResult && typeof callbackResult.then === 'function') {
                    await callbackResult;
                }
            } catch (error) {
                if (window.Logger && window.Logger.error) {
                    window.Logger.error('PaginationInstance.notifyAfterRender callback failed:', error, {
                        tableId: this.config.tableId,
                        page: 'pagination-system'
                    });
                }
            }
        } else {
            // Only warn if Logger is available and in debug mode
            if (window.Logger && window.Logger.debug) {
                window.Logger.debug(`No onAfterRender callback defined for table ${this.config.tableId}`, {
                    tableId: this.config.tableId,
                    page: 'pagination-system'
                });
            }
        }
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





