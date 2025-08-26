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

        // אתחול פילטרים למצב ברירת מחדל
        this.initializeDefaultFilters();
    }

    initializeDefaultFilters() {
        console.log('🔄 Initializing default filters');

        // בחירת "הכול" בכל הפילטרים
        const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
        const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
        const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');

        // בחירת "הכול" בפילטר סטטוס
        const allStatusItem = Array.from(statusItems).find(item => item.getAttribute('data-value') === 'הכול');
        if (allStatusItem) {
            allStatusItem.classList.add('selected');
        }

        // בחירת "הכול" בפילטר טיפוס
        const allTypeItem = Array.from(typeItems).find(item => item.getAttribute('data-value') === 'הכול');
        if (allTypeItem) {
            allTypeItem.classList.add('selected');
        }

        // בחירת "הכול" בפילטר חשבון
        const allAccountItem = Array.from(accountItems).find(item => item.getAttribute('data-value') === 'הכול');
        if (allAccountItem) {
            allAccountItem.classList.add('selected');
        }

        // עדכון טקסטים
        if (window.updateStatusFilterText) window.updateStatusFilterText();
        if (window.updateTypeFilterText) window.updateTypeFilterText();
        if (window.updateAccountFilterText) window.updateAccountFilterText();

        // הפעלת הפילטרים למצב ברירת מחדל
        this.currentFilters = {
            status: null,
            type: null,
            account: null,
            search: ''
        };

        console.log('🔄 Default filters initialized');
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

    // שימוש בפונקציות הגלובליות לתרגום
    translateStatus(status) {
        if (typeof window.translateTradeStatus === 'function') {
            return window.translateTradeStatus(status);
        }
        // fallback
        const translations = {
            'active': 'פעיל',
            'closed': 'סגור',
            'canceled': 'בוטל',
            'cancelled': 'מבוטל',
            'pending': 'ממתין',
            'open': 'פתוח'
        };
        return translations[status] || status;
    }

    translateType(type) {
        if (typeof window.translateTradeType === 'function') {
            return window.translateTradeType(type);
        }
        // fallback
        const translations = {
            'swing': 'סווינג',
            'investment': 'השקעה',
            'passive': 'פסיבי',
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

        // Apply to specific tables based on current page
        this.applyFiltersToTradePlansTable();
        this.applyFiltersToAlertsTable();
        this.applyFiltersToDatabaseDisplayTables();
        
        // Apply to test page tables
        this.applyFiltersToTestPageTables();
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

    applyFiltersToTradePlansTable() {
        const table = document.getElementById('designsTable');
        if (!table) {
            console.log('🔄 Trade plans table not found, skipping filter application');
            return;
        }

        console.log('🔄 Applying filters to trade plans table');
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.log('🔄 Trade plans table tbody not found');
            return;
        }

        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        console.log(`🔄 Processing ${rows.length} rows in trade plans table`);

        rows.forEach((row, index) => {
            // Get data from trade plans table structure using existing data attributes
            const ticker = row.querySelector('.ticker-cell')?.textContent?.trim() || '';
            const status = row.getAttribute('data-status') || row.querySelector('.status-cell')?.textContent?.trim() || '';
            const type = row.getAttribute('data-type') || row.querySelector('.type-cell')?.textContent?.trim() || '';
            const account = row.querySelector('.account-cell')?.textContent?.trim() || '';

            console.log(`🔄 Row ${index + 1}: ticker="${ticker}", status="${status}", type="${type}", account="${account}"`);

            let shouldShow = true;

            // Status filter
            if (this.currentFilters.status && this.currentFilters.status.length > 0) {
                // Get the raw status value (English) from data attribute
                const rawStatus = row.getAttribute('data-status') || status;
                console.log(`🔄 Status filter: row status="${rawStatus}", filter statuses=${JSON.stringify(this.currentFilters.status)}`);

                if (!this.currentFilters.status.includes(rawStatus)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by status filter`);
                }
            }

            // Type filter
            if (shouldShow && this.currentFilters.type && this.currentFilters.type.length > 0) {
                // Get the raw type value (English) from data attribute
                const rawType = row.getAttribute('data-type') || type;
                console.log(`🔄 Type filter: row type="${rawType}", filter types=${JSON.stringify(this.currentFilters.type)}`);

                if (!this.currentFilters.type.includes(rawType)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by type filter`);
                }
            }

            // Account filter - skip for now since trade plans don't have account info
            if (shouldShow && this.currentFilters.account && this.currentFilters.account.length > 0) {
                console.log(`🔄 Account filter: skipping for trade plans table`);
                // Account filtering not implemented for trade plans yet
            }

            // Search filter
            if (shouldShow && this.currentFilters.search) {
                const searchText = this.currentFilters.search.toLowerCase();
                const searchableText = `${ticker} ${status} ${type} ${account}`.toLowerCase();
                console.log(`🔄 Search filter: search="${searchText}", searchable="${searchableText}"`);

                if (!searchableText.includes(searchText)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by search filter`);
                }
            }

            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        console.log(`🔄 Trade plans table filtering complete: ${visibleCount}/${rows.length} rows visible`);
    }

    applyFiltersToAlertsTable() {
        const table = document.getElementById('alertsTable');
        if (!table) {
            console.log('🔄 Alerts table not found, skipping filter application');
            return;
        }

        console.log('🔄 Applying filters to alerts table');
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.log('🔄 Alerts table tbody not found');
            return;
        }

        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        console.log(`🔄 Processing ${rows.length} rows in alerts table`);

        rows.forEach((row, index) => {
            // Get data from alerts table structure using existing data attributes
            const ticker = row.querySelector('.ticker-cell')?.textContent?.trim() || '';
            const status = row.getAttribute('data-status') || row.querySelector('.status-cell')?.textContent?.trim() || '';
            const type = row.getAttribute('data-type') || row.querySelector('.type-cell')?.textContent?.trim() || '';
            const account = row.querySelector('.account-cell')?.textContent?.trim() || '';

            console.log(`🔄 Row ${index + 1}: ticker="${ticker}", status="${status}", type="${type}", account="${account}"`);

            let shouldShow = true;

            // Status filter
            if (this.currentFilters.status && this.currentFilters.status.length > 0) {
                const rawStatus = row.getAttribute('data-status') || status;
                if (!this.currentFilters.status.includes(rawStatus)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by status filter`);
                }
            }

            // Type filter
            if (shouldShow && this.currentFilters.type && this.currentFilters.type.length > 0) {
                const rawType = row.getAttribute('data-type') || type;
                if (!this.currentFilters.type.includes(rawType)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by type filter`);
                }
            }

            // Account filter - skip for now since alerts don't have account info
            if (shouldShow && this.currentFilters.account && this.currentFilters.account.length > 0) {
                console.log(`🔄 Account filter: skipping for alerts table`);
                // Account filtering not implemented for alerts yet
            }

            // Search filter
            if (shouldShow && this.currentFilters.search) {
                const searchText = this.currentFilters.search.toLowerCase();
                const searchableText = `${ticker} ${status} ${type} ${account}`.toLowerCase();
                if (!searchableText.includes(searchText)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by search filter`);
                }
            }

            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        console.log(`🔄 Alerts table filtering complete: ${visibleCount}/${rows.length} rows visible`);
    }

    applyFiltersToDatabaseDisplayTables() {
        console.log('🔄 Applying filters to database display page tables');

        // Apply filters to all tables in database display page
        const tableIds = [
            'tradePlansTable',
            'tradesTable',
            'accountsTable',
            'tickersTable',
            'executionsTable',
            'cashFlowsTable',
            'alertsTable',
            'notesTable'
        ];

        tableIds.forEach(tableId => {
            const table = document.getElementById(tableId);
            if (table) {
                console.log(`🔄 Applying filters to ${tableId}`);
                this.applyFiltersToDatabaseTable(tableId);
            } else {
                console.log(`🔄 Table ${tableId} not found, skipping`);
            }
        });

        // Apply filters to test page tables
        this.applyFiltersToTestPageTables();
    }

    applyFiltersToTestPageTables() {
        console.log('🔄 Applying filters to test page tables');

        // Apply to trades table
        this.applyFiltersToTestTradesTable();
        
        // Apply to test table
        this.applyFiltersToTestGeneralTable();
        
        // Apply to notifications table
        this.applyFiltersToTestNotificationsTable();
    }

    applyFiltersToTestTradesTable() {
        const table = document.getElementById('tradesTable');
        if (!table) {
            console.log('🔄 Test trades table not found, skipping filter application');
            return;
        }

        console.log('🔄 Applying filters to test trades table');
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.log('🔄 Test trades table tbody not found');
            return;
        }

        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        console.log(`🔄 Processing ${rows.length} rows in test trades table`);

        rows.forEach((row, index) => {
            // Get data from test trades table structure
            const ticker = row.cells[0]?.textContent?.trim() || '';
            const status = row.cells[1]?.textContent?.trim() || '';
            const type = row.cells[2]?.textContent?.trim() || '';
            const account = row.cells[3]?.textContent?.trim() || '';
            const date = row.cells[4]?.textContent?.trim() || '';

            console.log(`🔄 Row ${index + 1}: ticker="${ticker}", status="${status}", type="${type}", account="${account}"`);

            let shouldShow = true;

            // Status filter
            if (this.currentFilters.status && this.currentFilters.status.length > 0) {
                if (!this.currentFilters.status.includes(status)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by status filter`);
                }
            }

            // Type filter
            if (shouldShow && this.currentFilters.type && this.currentFilters.type.length > 0) {
                if (!this.currentFilters.type.includes(type)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by type filter`);
                }
            }

            // Account filter
            if (shouldShow && this.currentFilters.account && this.currentFilters.account.length > 0) {
                if (!this.currentFilters.account.includes(account)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by account filter`);
                }
            }

            // Search filter
            if (shouldShow && this.currentFilters.search) {
                const searchText = this.currentFilters.search.toLowerCase();
                const searchableText = `${ticker} ${status} ${type} ${account} ${date}`.toLowerCase();
                console.log(`🔄 Search filter: search="${searchText}", searchable="${searchableText}"`);

                if (!searchableText.includes(searchText)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by search filter`);
                }
            }

            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        console.log(`🔄 Test trades table filtering complete: ${visibleCount}/${rows.length} rows visible`);
    }

    applyFiltersToTestGeneralTable() {
        const table = document.getElementById('testTable');
        if (!table) {
            console.log('🔄 Test general table not found, skipping filter application');
            return;
        }

        console.log('🔄 Applying filters to test general table');
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.log('🔄 Test general table tbody not found');
            return;
        }

        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        console.log(`🔄 Processing ${rows.length} rows in test general table`);

        rows.forEach((row, index) => {
            // Get data from test general table structure
            const name = row.cells[0]?.textContent?.trim() || '';
            const status = row.cells[1]?.textContent?.trim() || '';
            const type = row.cells[2]?.textContent?.trim() || '';
            const account = row.cells[3]?.textContent?.trim() || '';
            const date = row.cells[4]?.textContent?.trim() || '';

            console.log(`🔄 Row ${index + 1}: name="${name}", status="${status}", type="${type}", account="${account}"`);

            let shouldShow = true;

            // Status filter
            if (this.currentFilters.status && this.currentFilters.status.length > 0) {
                if (!this.currentFilters.status.includes(status)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by status filter`);
                }
            }

            // Type filter
            if (shouldShow && this.currentFilters.type && this.currentFilters.type.length > 0) {
                if (!this.currentFilters.type.includes(type)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by type filter`);
                }
            }

            // Account filter
            if (shouldShow && this.currentFilters.account && this.currentFilters.account.length > 0) {
                if (!this.currentFilters.account.includes(account)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by account filter`);
                }
            }

            // Search filter
            if (shouldShow && this.currentFilters.search) {
                const searchText = this.currentFilters.search.toLowerCase();
                const searchableText = `${name} ${status} ${type} ${account} ${date}`.toLowerCase();
                console.log(`🔄 Search filter: search="${searchText}", searchable="${searchableText}"`);

                if (!searchableText.includes(searchText)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by search filter`);
                }
            }

            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        console.log(`🔄 Test general table filtering complete: ${visibleCount}/${rows.length} rows visible`);
    }

    applyFiltersToTestNotificationsTable() {
        const table = document.getElementById('notificationsTable');
        if (!table) {
            console.log('🔄 Test notifications table not found, skipping filter application');
            return;
        }

        console.log('🔄 Applying filters to test notifications table');
        const tbody = table.querySelector('tbody');
        if (!tbody) {
            console.log('🔄 Test notifications table tbody not found');
            return;
        }

        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        console.log(`🔄 Processing ${rows.length} rows in test notifications table`);

        rows.forEach((row, index) => {
            // Get data from test notifications table structure
            const date = row.cells[0]?.textContent?.trim() || '';
            const type = row.cells[1]?.textContent?.trim() || '';
            const title = row.cells[2]?.textContent?.trim() || '';
            const description = row.cells[3]?.textContent?.trim() || '';
            const account = row.cells[4]?.textContent?.trim() || '';
            const status = row.cells[5]?.textContent?.trim() || '';

            console.log(`🔄 Row ${index + 1}: type="${type}", status="${status}", account="${account}"`);

            let shouldShow = true;

            // Status filter
            if (this.currentFilters.status && this.currentFilters.status.length > 0) {
                if (!this.currentFilters.status.includes(status)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by status filter`);
                }
            }

            // Type filter
            if (shouldShow && this.currentFilters.type && this.currentFilters.type.length > 0) {
                if (!this.currentFilters.type.includes(type)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by type filter`);
                }
            }

            // Account filter
            if (shouldShow && this.currentFilters.account && this.currentFilters.account.length > 0) {
                if (!this.currentFilters.account.includes(account)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by account filter`);
                }
            }

            // Search filter
            if (shouldShow && this.currentFilters.search) {
                const searchText = this.currentFilters.search.toLowerCase();
                const searchableText = `${date} ${type} ${title} ${description} ${account} ${status}`.toLowerCase();
                console.log(`🔄 Search filter: search="${searchText}", searchable="${searchableText}"`);

                if (!searchableText.includes(searchText)) {
                    shouldShow = false;
                    console.log(`🔄 Row ${index + 1} hidden by search filter`);
                }
            }

            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        console.log(`🔄 Test notifications table filtering complete: ${visibleCount}/${rows.length} rows visible`);
    }

    applyFiltersToDatabaseTable(tableId) {
        const table = document.getElementById(tableId);
        if (!table) {
            console.warn(`⚠️ Table ${tableId} not found`);
            return;
        }

        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;

        console.log(`🔄 Processing ${rows.length} rows in ${tableId}`);

        rows.forEach((row, index) => {
            // Skip loading rows
            if (row.querySelector('td[colspan]')) {
                return;
            }

            // Get data from table cells based on table type
            const tableType = table.getAttribute('data-table-type');
            let ticker = '', status = '', type = '', account = '';

            switch (tableType) {
                case 'trade_plans':
                    ticker = row.cells[2]?.textContent?.trim() || ''; // Ticker ID
                    status = row.cells[5]?.textContent?.trim() || ''; // Status
                    type = row.cells[3]?.textContent?.trim() || ''; // Investment Type
                    account = row.cells[1]?.textContent?.trim() || ''; // Account ID
                    break;
                case 'trades':
                    ticker = row.cells[2]?.textContent?.trim() || ''; // Ticker ID
                    status = row.cells[5]?.textContent?.trim() || ''; // Status
                    type = row.cells[3]?.textContent?.trim() || ''; // Investment Type
                    account = row.cells[1]?.textContent?.trim() || ''; // Account ID
                    break;
                case 'accounts':
                    status = row.cells[4]?.textContent?.trim() || ''; // Status
                    break;
                case 'tickers':
                    ticker = row.cells[1]?.textContent?.trim() || ''; // Symbol
                    type = row.cells[3]?.textContent?.trim() || ''; // Type
                    break;
                case 'executions':
                    ticker = row.cells[1]?.textContent?.trim() || ''; // Trade ID
                    type = row.cells[2]?.textContent?.trim() || ''; // Action
                    break;
                case 'cash_flows':
                    account = row.cells[1]?.textContent?.trim() || ''; // Account ID
                    type = row.cells[2]?.textContent?.trim() || ''; // Type
                    break;
                case 'alerts':
                    status = row.cells[2]?.textContent?.trim() || ''; // Status
                    type = row.cells[1]?.textContent?.trim() || ''; // Type
                    break;
                case 'notes':
                    type = row.cells[1]?.textContent?.trim() || ''; // Entity Type
                    break;
            }

            let shouldShow = true;

            // Status filter
            if (this.currentFilters.status && this.currentFilters.status.length > 0) {
                if (!this.currentFilters.status.some(s => this.translateStatus(s) === status)) {
                    shouldShow = false;
                }
            }

            // Type filter
            if (shouldShow && this.currentFilters.type && this.currentFilters.type.length > 0) {
                if (!this.currentFilters.type.some(t => this.translateType(t) === type)) {
                    shouldShow = false;
                }
            }

            // Account filter - skip for now since we only have account IDs
            if (shouldShow && this.currentFilters.account && this.currentFilters.account.length > 0) {
                console.log(`🔄 Account filter: skipping for ${tableId} (only have account IDs)`);
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

        console.log(`🔄 ${tableId} filtering complete: ${visibleCount}/${rows.length} rows visible`);
    }

    resetFilters() {
        this.currentFilters = {
            status: null,
            type: null,
            account: null,
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

    // ===== פונקציות הפעלת פילטרים =====

    /**
 * הפעלת פילטר סטטוס
 */
    applyStatusFilter(statuses) {
        console.log('🔄 SimpleFilter.applyStatusFilter called with statuses:', statuses);

        // אם יש "הכול" או אין בחירות - מסירים את הפילטר
        if (statuses.includes('הכול') || statuses.length === 0) {
            this.currentFilters.status = null; // null במקום מערך ריק
        } else {
            this.currentFilters.status = statuses;
        }

        console.log('🔄 Current status filters:', this.currentFilters.status);
        this.applyFilters();
    }

    /**
 * הפעלת פילטר טיפוס
 */
    applyTypeFilter(types) {
        console.log('🔄 SimpleFilter.applyTypeFilter called with types:', types);

        // אם יש "הכול" או אין בחירות - מסירים את הפילטר
        if (types.includes('הכול') || types.length === 0) {
            this.currentFilters.type = null; // null במקום מערך ריק
        } else {
            this.currentFilters.type = types;
        }

        console.log('🔄 Current type filters:', this.currentFilters.type);
        this.applyFilters();
    }

    /**
 * הפעלת פילטר חשבון
 */
    applyAccountFilter(accounts) {
        console.log('🔄 SimpleFilter.applyAccountFilter called with accounts:', accounts);

        // אם יש "הכול" או אין בחירות - מסירים את הפילטר
        if (accounts.includes('הכול') || accounts.length === 0) {
            this.currentFilters.account = null; // null במקום מערך ריק
        } else {
            // Find account IDs by names
            const headerElement = document.getElementById('unified-header');
            const accountIds = [];

            accounts.forEach(accountName => {
                const accountItem = headerElement?.querySelector(`#accountFilterMenu .account-filter-item[data-value="${accountName}"]`);
                if (accountItem) {
                    const accountId = accountItem.getAttribute('data-account-id');
                    if (accountId) accountIds.push(accountId);
                }
            });

            this.currentFilters.account = accountIds;
        }

        console.log('🔄 Current account filters:', this.currentFilters.account);
        this.applyFilters();
    }

    /**
 * הפעלת פילטר תאריכים
 */
    applyDateRangeFilter(dateRange) {
        console.log('🔄 SimpleFilter.applyDateRangeFilter called with dateRange:', dateRange);

        // For now, just log the date range filter
        // TODO: Implement date range filtering logic
        console.log('📅 Date range filter not yet implemented:', dateRange);

        // This will be implemented when we add date filtering to the table
        this.applyFilters();
    }

    /**
     * הפעלת פילטר חיפוש
     */
    applySearchFilter(searchTerm) {
        console.log('🔄 SimpleFilter.applySearchFilter called with searchTerm:', searchTerm);

        this.currentFilters.search = searchTerm;
        console.log('🔄 Current search filter:', this.currentFilters.search);

        this.applyFilters();
    }
}

// פונקציה גלובלית לעדכון טקסט פילטר חשבונות
window.updateAccountFilterDisplayTextGlobal = function () {
    console.log('🔄 updateAccountFilterDisplayTextGlobal called');

    // חיפוש הפונקציה הספציפית לדף הנוכחי
    if (typeof window.updateAccountFilterDisplayText === 'function') {
        window.updateAccountFilterDisplayText();
    } else {
        console.warn('⚠️ updateAccountFilterDisplayText not found in current page');
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.simpleFilter = new SimpleFilter();
        window.simpleFilter.init();
    });
} else {
    // אם הדף כבר נטען, נחכה קצת כדי לוודא שה-header נטען
    setTimeout(() => {
        window.simpleFilter = new SimpleFilter();
        window.simpleFilter.init();
    }, 100);
}
