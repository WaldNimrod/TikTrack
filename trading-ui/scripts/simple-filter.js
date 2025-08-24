/**
 * Simple filter for trades table
 * Works directly on the table without complexity
 * 
 * Dependencies:
 * - header-system.js (for filter menu elements)
 * - main.js (global utilities)
 * - translation-utils.js (translation functions)
 * 
 * File: trading-ui/scripts/simple-filter.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

class SimpleFilter {
    constructor() {
        this.currentFilters = {
            status: [],
            type: [],
            account: [],
            search: ''
        };
    }

    init() {
        // Wait until elements are available
        this.waitForElements();
    }

    waitForElements() {
        // Check if elements exist - search within unified-header
        const headerElement = document.getElementById('unified-header');
        if (!headerElement) {
            setTimeout(() => this.waitForElements(), 100);
            return;
        }

        const statusMenu = headerElement.querySelector('#statusFilterMenu');
        const typeMenu = headerElement.querySelector('#typeFilterMenu');
        const accountMenu = headerElement.querySelector('#accountFilterMenu');

        if (statusMenu && typeMenu && accountMenu) {
            // Additional check - are there items in the menus
            const statusItems = statusMenu.querySelectorAll('.status-filter-item');
            const typeItems = typeMenu.querySelectorAll('.type-filter-item');
            const accountItems = accountMenu.querySelectorAll('.account-filter-item');

            if (statusItems.length > 0 || typeItems.length > 0 || accountItems.length > 0) {
                this.setupEventListeners();
            } else {
                setTimeout(() => this.waitForElements(), 100);
            }
        } else {
            setTimeout(() => this.waitForElements(), 100);
        }
    }

    setupEventListeners() {
        const headerElement = document.getElementById('unified-header');
        if (!headerElement) {
            console.error('❌ Header element not found');
            return;
        }

        // Status filter
        const statusItems = headerElement.querySelectorAll('#statusFilterMenu .status-filter-item');
        statusItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const status = item.getAttribute('data-status');
                item.classList.toggle('selected');
                
                if (item.classList.contains('selected')) {
                    if (!this.currentFilters.status.includes(status)) {
                        this.currentFilters.status.push(status);
                    }
                } else {
                    this.currentFilters.status = this.currentFilters.status.filter(s => s !== status);
                }
                
                this.updateStatusDisplay();
                this.applyFilters();
            });
        });

        // Type filter
        const typeItems = headerElement.querySelectorAll('#typeFilterMenu .type-filter-item');
        typeItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const type = item.getAttribute('data-type');
                item.classList.toggle('selected');
                
                if (item.classList.contains('selected')) {
                    if (!this.currentFilters.type.includes(type)) {
                        this.currentFilters.type.push(type);
                    }
                } else {
                    this.currentFilters.type = this.currentFilters.type.filter(t => t !== type);
                }
                
                this.updateTypeDisplay();
                this.applyFilters();
            });
        });

        // Search filter
        const searchInput = headerElement.querySelector('#searchFilterInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentFilters.search = e.target.value.trim();
                this.applyFilters();
            });
        }

        // Account filter
        const accountItems = headerElement.querySelectorAll('#accountFilterMenu .account-filter-item');
        accountItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const accountText = item.textContent.trim();
                const accountId = item.getAttribute('data-account-id');
                
                item.classList.toggle('selected');
                
                if (item.classList.contains('selected')) {
                    if (!this.currentFilters.account.includes(accountId)) {
                        this.currentFilters.account.push(accountId);
                    }
                } else {
                    this.currentFilters.account = this.currentFilters.account.filter(a => a !== accountId);
                }
                
                this.updateAccountDisplay();
                this.applyFilters();
            });
        });
    }

    updateStatusDisplay() {
        const statusDisplay = document.getElementById('statusFilterDisplay');
        if (statusDisplay) {
            if (this.currentFilters.status.length === 0) {
                statusDisplay.textContent = 'כל הסטטוסים';
            } else {
                const statusTexts = this.currentFilters.status.map(status => {
                    return this.translateStatus(status);
                });
                statusDisplay.textContent = statusTexts.join(', ');
            }
        }
    }

    updateTypeDisplay() {
        const typeDisplay = document.getElementById('typeFilterDisplay');
        if (typeDisplay) {
            if (this.currentFilters.type.length === 0) {
                typeDisplay.textContent = 'כל הסוגים';
            } else {
                const typeTexts = this.currentFilters.type.map(type => {
                    return this.translateType(type);
                });
                typeDisplay.textContent = typeTexts.join(', ');
            }
        }
    }

    updateAccountDisplay() {
        const accountDisplay = document.getElementById('accountFilterDisplay');
        if (accountDisplay) {
            if (this.currentFilters.account.length === 0) {
                accountDisplay.textContent = 'כל החשבונות';
            } else {
                const accountTexts = this.currentFilters.account.map(accountId => {
                    const item = document.querySelector(`[data-account-id="${accountId}"]`);
                    return item ? item.textContent.trim() : accountId;
                });
                accountDisplay.textContent = accountTexts.join(', ');
            }
        }
    }

    translateStatus(status) {
        const translations = {
            'active': 'פעיל',
            'closed': 'סגור',
            'canceled': 'בוטל',
            'pending': 'ממתין'
        };
        return translations[status] || status;
    }

    translateType(type) {
        const translations = {
            'buy': 'קנייה',
            'sell': 'מכירה',
            'long': 'לונג',
            'short': 'שורט'
        };
        return translations[type] || type;
    }

    applyFilters() {
        // Apply to all tables that have the data attribute
        const tables = document.querySelectorAll('[data-table-id]');
        
        tables.forEach(tableElement => {
            const tableId = tableElement.getAttribute('data-table-id');
            this.applyFiltersToTable(tableId);
        });
    }

    applyFiltersToTable(tableId) {
        const table = document.getElementById(tableId);
        if (!table) {
            console.warn(`⚠️ Table ${tableId} not found`);
            return;
        }

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        rows.forEach((row, index) => {
            const ticker = row.querySelector('[data-field="symbol"]')?.textContent?.trim() || '';
            const status = row.querySelector('[data-field="status"]')?.textContent?.trim() || '';
            const type = row.querySelector('[data-field="type"]')?.textContent?.trim() || '';
            const account = row.querySelector('[data-field="account_name"]')?.textContent?.trim() || '';

            let shouldShow = true;

            // Status filter
            if (this.currentFilters.status.length > 0) {
                const translatedStatus = this.translateStatus(status);
                if (!this.currentFilters.status.some(s => this.translateStatus(s) === translatedStatus)) {
                    shouldShow = false;
                }
            }

            // Type filter
            if (shouldShow && this.currentFilters.type.length > 0) {
                const translatedType = this.translateType(type);
                if (!this.currentFilters.type.some(t => this.translateType(t) === translatedType)) {
                    shouldShow = false;
                }
            }

            // Account filter
            if (shouldShow && this.currentFilters.account.length > 0) {
                const accountId = row.querySelector('[data-field="account_id"]')?.getAttribute('data-value');
                if (!this.currentFilters.account.includes(accountId)) {
                    shouldShow = false;
                }
            }

            // Search filter
            if (shouldShow && this.currentFilters.search) {
                const searchText = this.currentFilters.search.toLowerCase();
                const searchableText = `${ticker} ${status} ${type} ${account}`.toLowerCase();
                if (!searchableText.includes(searchText)) {
                    shouldShow = false;
                }
            }

            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });
    }

    resetFilters() {
        this.currentFilters = {
            status: [],
            type: [],
            account: [],
            search: ''
        };

        // Clear selected classes
        const headerElement = document.getElementById('unified-header');
        if (headerElement) {
            headerElement.querySelectorAll('.status-filter-item.selected, .type-filter-item.selected, .account-filter-item.selected')
                .forEach(item => item.classList.remove('selected'));
        }

        // Clear search input
        const searchInput = headerElement?.querySelector('#searchFilterInput');
        if (searchInput) {
            searchInput.value = '';
        }

        // Update displays
        this.updateStatusDisplay();
        this.updateTypeDisplay();
        this.updateAccountDisplay();

        // Apply filters (show all)
        this.applyFilters();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.simpleFilter = new SimpleFilter();
        window.simpleFilter.init();
    });
} else {
    window.simpleFilter = new SimpleFilter();
    window.simpleFilter.init();
}
