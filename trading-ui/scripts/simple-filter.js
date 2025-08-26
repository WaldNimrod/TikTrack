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
 * Version: 1.9.9
 * Last Updated: August 26, 2025
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

    async init() {
        // Wait until elements are available
        this.waitForElements();

        // אתחול פילטרים למצב ברירת מחדל
        await this.initializeDefaultFilters();
    }

    /**
     * אתחול פילטרים לברירות מחדל מהעדפות
     * Initialize filters with default preferences
     */
    async initializeDefaultFilters() {
        console.log('🔄 Initializing filters with default preferences...');

        try {
            // קריאת ברירות המחדל מהשרת
            const response = await fetch('/api/v1/preferences/');
            if (response.ok) {
                const preferences = await response.json();
                const userPrefs = preferences.user || preferences.defaults;

                console.log('📋 Loaded default preferences:', userPrefs);

                // המרת ברירות המחדל לערכים עבריים
                this.currentFilters = {
                    status: this.convertStatusPreference(userPrefs.defaultStatusFilter),
                    type: this.convertTypePreference(userPrefs.defaultTypeFilter),
                    account: this.convertAccountPreference(userPrefs.defaultAccountFilter),
                    date: this.convertDatePreference(userPrefs.defaultDateRangeFilter),
                    search: userPrefs.defaultSearchFilter || ''
                };

                console.log('🔄 Applied default filters:', this.currentFilters);

                // עדכון התצוגה
                this.updateStatusDisplay();
                this.updateTypeDisplay();
                this.updateAccountDisplay();
                this.updateDateDisplay();

            } else {
                console.warn('⚠️ Could not load preferences, using empty filters');
                this.initializeEmptyFilters();
            }
        } catch (error) {
            console.error('❌ Error loading default preferences:', error);
            // במקרה של שגיאה, השתמש בפילטרים ריקים
            this.initializeEmptyFilters();
        }
    }

    /**
     * אתחול פילטרים ריקים (ברירת מחדל)
     * Initialize empty filters (fallback)
     */
    initializeEmptyFilters() {
        console.log('🔄 Initializing empty filters (fallback)');

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
            status: [],
            type: [],
            account: [],
            date: [],
            search: ''
        };

        console.log('🔄 Empty filters initialized');
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
        console.log('🔄 applyFilters called');
        console.log('🔄 Current filters:', this.currentFilters);

        // Apply to specific tables based on current page
        this.applyFiltersToTradePlansTable();
        this.applyFiltersToAlertsTable();
        this.applyFiltersToDatabaseDisplayTables();

        console.log('📊 FILTER APPLICATION COMPLETE');
        console.log('🔄 All tables have been filtered according to current settings');
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
            if (this.currentFilters.status && Array.isArray(this.currentFilters.status) && this.currentFilters.status.length > 0) {
                const translatedStatus = this.translateStatus(status);
                if (!this.currentFilters.status.some(s => this.translateStatus(s) === translatedStatus)) {
                    shouldShow = false;
                }
            }

            // Type filter
            if (shouldShow && this.currentFilters.type && Array.isArray(this.currentFilters.type) && this.currentFilters.type.length > 0) {
                const translatedType = this.translateType(type);
                if (!this.currentFilters.type.some(t => this.translateType(t) === translatedType)) {
                    shouldShow = false;
                }
            }

            // Account filter
            if (shouldShow && this.currentFilters.account && Array.isArray(this.currentFilters.account) && this.currentFilters.account.length > 0) {
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
        console.log(`📊 TABLE SUMMARY - Trade Plans:`);
        console.log(`   - Total rows: ${rows.length}`);
        console.log(`   - Visible rows: ${visibleCount}`);
        console.log(`   - Hidden rows: ${rows.length - visibleCount}`);
        console.log(`   - Active filters:`, {
            status: this.currentFilters.status,
            type: this.currentFilters.type,
            account: this.currentFilters.account,
            search: this.currentFilters.search
        });
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
            'notesTable',
            'testTable',
            'notificationsTable'
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

        // Get table type once for the entire table
        const tableType = table.getAttribute('data-table-type');

        console.log(`🔄 Processing ${rows.length} rows in ${tableId}`);

        rows.forEach((row, index) => {
            // Skip loading rows
            if (row.querySelector('td[colspan]')) {
                return;
            }

            // Get data from table cells based on table type
            let ticker = '', status = '', type = '', account = '';

            console.log(`🔄 Processing row ${index} in ${tableId}, table type: ${tableType}`);

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
                case 'test_trades':
                    ticker = row.cells[0]?.textContent?.trim() || ''; // Ticker
                    status = row.cells[1]?.textContent?.trim() || ''; // Status
                    type = row.cells[2]?.textContent?.trim() || ''; // Type
                    account = row.cells[3]?.textContent?.trim() || ''; // Account
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
                case 'test_general':
                    // For test general table
                    ticker = row.cells[0]?.textContent?.trim() || ''; // Name
                    status = row.cells[1]?.textContent?.trim() || ''; // Status
                    type = row.cells[2]?.textContent?.trim() || ''; // Type
                    account = row.cells[3]?.textContent?.trim() || ''; // Account
                    break;
                case 'test_notifications':
                    // For notifications table - no status filter applies
                    ticker = row.cells[0]?.textContent?.trim() || ''; // Symbol
                    status = ''; // No status in notifications
                    type = row.cells[1]?.textContent?.trim() || ''; // Related to
                    account = ''; // No account in notifications
                    break;
                default:
                    // For tables without specific type, try to extract data from any available cells
                    ticker = row.cells[0]?.textContent?.trim() || '';
                    status = row.cells[1]?.textContent?.trim() || '';
                    type = row.cells[2]?.textContent?.trim() || '';
                    account = row.cells[3]?.textContent?.trim() || '';
                    break;
            }

            let shouldShow = true;

            console.log(`🔄 Row data: ticker="${ticker}", status="${status}", type="${type}", account="${account}"`);

            // Status filter - skip for tables without status field
            if (this.currentFilters.status && Array.isArray(this.currentFilters.status) && this.currentFilters.status.length > 0) {
                // Skip status filter for tables that don't have status field
                if (tableType === 'test_notifications' || tableType === 'notes') {
                    console.log(`🔄 Skipping status filter for ${tableType} table (no status field) - showing all rows`);
                } else {
                    console.log(`🔄 Checking status filter: current="${status}", filters=${JSON.stringify(this.currentFilters.status)}`);
                    // Filter out null/undefined values
                    const validFilters = this.currentFilters.status.filter(s => s && s !== null && s !== undefined);
                    console.log(`🔄 Valid filters: ${JSON.stringify(validFilters)}`);

                    if (validFilters.length === 0) {
                        console.log(`🔄 No valid status filters, showing all rows`);
                    } else if (!validFilters.includes(status)) {
                        console.log(`🔄 Status filter failed: "${status}" not in ${JSON.stringify(validFilters)}`);
                        shouldShow = false;
                    } else {
                        console.log(`🔄 Status filter passed: "${status}" found in filters`);
                    }
                }
            } else {
                console.log(`🔄 No status filter applied - showing all rows`);
            }

            // Type filter - skip for notifications table
            if (shouldShow && this.currentFilters.type && Array.isArray(this.currentFilters.type) && this.currentFilters.type.length > 0) {
                // Skip type filter for notifications table
                if (tableType === 'test_notifications') {
                    console.log(`🔄 Skipping type filter for ${tableType} table - showing all rows`);
                } else {
                    console.log(`🔄 Checking type filter: current="${type}", filters=${JSON.stringify(this.currentFilters.type)}`);
                    // Filter out null/undefined values
                    const validTypeFilters = this.currentFilters.type.filter(t => t && t !== null && t !== undefined);
                    console.log(`🔄 Valid type filters: ${JSON.stringify(validTypeFilters)}`);

                    if (validTypeFilters.length === 0) {
                        console.log(`🔄 No valid type filters, showing all rows`);
                    } else if (!validTypeFilters.includes(type)) {
                        console.log(`🔄 Type filter failed: "${type}" not in ${JSON.stringify(validTypeFilters)}`);
                        shouldShow = false;
                    } else {
                        console.log(`🔄 Type filter passed: "${type}" found in filters`);
                    }
                }
            } else {
                console.log(`🔄 No type filter applied - showing all rows`);
            }

            // Account filter - skip for tables without account field
            if (shouldShow && this.currentFilters.account && Array.isArray(this.currentFilters.account) && this.currentFilters.account.length > 0) {
                // Skip account filter for tables that don't have account field
                if (tableType === 'test_notifications' || tableType === 'notes') {
                    console.log(`🔄 Skipping account filter for ${tableType} table (no account field) - showing all rows`);
                } else {
                    console.log(`🔄 Checking account filter: current="${account}", filters=${JSON.stringify(this.currentFilters.account)}`);
                    // Filter out null/undefined values
                    const validAccountFilters = this.currentFilters.account.filter(a => a && a !== null && a !== undefined);
                    console.log(`🔄 Valid account filters: ${JSON.stringify(validAccountFilters)}`);

                    if (validAccountFilters.length === 0) {
                        console.log(`🔄 No valid account filters, showing all rows`);
                    } else if (!validAccountFilters.includes(account)) {
                        console.log(`🔄 Account filter failed: "${account}" not in ${JSON.stringify(validAccountFilters)}`);
                        shouldShow = false;
                    } else {
                        console.log(`🔄 Account filter passed: "${account}" found in filters`);
                    }
                }
            } else {
                console.log(`🔄 No account filter applied - showing all rows`);
            }

            // Date filter - skip for notifications table
            if (shouldShow && this.currentFilters.date && Array.isArray(this.currentFilters.date) && this.currentFilters.date.length > 0) {
                // Skip date filter for notifications table
                if (tableType === 'test_notifications') {
                    console.log(`🔄 Skipping date filter for ${tableType} table - showing all rows`);
                } else {
                    // Get date from row
                    let rowDate = '';
                    switch (tableType) {
                        case 'test_trades':
                            rowDate = row.cells[4]?.textContent?.trim() || ''; // Date field
                            break;
                        case 'test_general':
                            rowDate = row.cells[4]?.textContent?.trim() || ''; // Date field
                            break;
                        default:
                            rowDate = row.cells[4]?.textContent?.trim() || ''; // Try to get date from 5th column
                            break;
                    }

                    console.log(`🔄 Checking date filter: current="${rowDate}", filters=${JSON.stringify(this.currentFilters.date)}`);
                    // Filter out null/undefined values
                    const validDateFilters = this.currentFilters.date.filter(d => d && d !== null && d !== undefined);
                    console.log(`🔄 Valid date filters: ${JSON.stringify(validDateFilters)}`);

                    if (validDateFilters.length === 0) {
                        console.log(`🔄 No valid date filters, showing all rows`);
                    } else {
                        // For now, just log the date filter - TODO: implement actual date comparison
                        console.log(`🔄 Date filter check: row date="${rowDate}", filter="${validDateFilters[0]}"`);
                        // TODO: Implement date range comparison logic
                        console.log(`🔄 Date filter not yet fully implemented - showing all rows`);
                    }
                }
            } else {
                console.log(`🔄 No date filter applied - showing all rows`);
            }

            // Search filter - skip for notifications table
            if (shouldShow && this.currentFilters.search) {
                // Skip search filter for notifications table
                if (tableType === 'test_notifications') {
                    console.log(`🔄 Skipping search filter for ${tableType} table - showing all rows`);
                } else {
                    const searchText = this.currentFilters.search.toLowerCase();
                    const searchableText = `${ticker} ${status} ${type} ${account}`.toLowerCase();
                    if (!searchableText.includes(searchText)) {
                        shouldShow = false;
                    }
                }
            } else {
                console.log(`🔄 No search filter applied - showing all rows`);
            }

            row.style.display = shouldShow ? '' : 'none';
            if (shouldShow) visibleCount++;
        });

        console.log(`🔄 ${tableId} filtering complete: ${visibleCount}/${rows.length} rows visible`);
        console.log(`📊 TABLE SUMMARY - ${tableId}:`);
        console.log(`   - Total rows: ${rows.length}`);
        console.log(`   - Visible rows: ${visibleCount}`);
        console.log(`   - Hidden rows: ${rows.length - visibleCount}`);
        console.log(`   - Table type: ${tableType || 'unknown'}`);
        console.log(`   - Active filters:`, {
            status: this.currentFilters.status,
            type: this.currentFilters.type,
            account: this.currentFilters.account,
            search: this.currentFilters.search
        });
    }

    /**
     * איפוס פילטרים לברירות מחדל מהעדפות
     * Reset filters to default preferences
     */
    async resetFilters() {
        console.log('🔄 Resetting filters to default preferences...');

        try {
            // קריאת ברירות המחדל מהשרת
            const response = await fetch('/api/v1/preferences/');
            if (response.ok) {
                const preferences = await response.json();
                const userPrefs = preferences.user || preferences.defaults;

                console.log('📋 Loaded default preferences:', userPrefs);

                // המרת ברירות המחדל לערכים עבריים
                this.currentFilters = {
                    status: this.convertStatusPreference(userPrefs.defaultStatusFilter),
                    type: this.convertTypePreference(userPrefs.defaultTypeFilter),
                    account: this.convertAccountPreference(userPrefs.defaultAccountFilter),
                    date: this.convertDatePreference(userPrefs.defaultDateRangeFilter),
                    search: userPrefs.defaultSearchFilter || ''
                };

                console.log('🔄 Applied default filters:', this.currentFilters);
            } else {
                console.warn('⚠️ Could not load preferences, using empty filters');
                this.currentFilters = {
                    status: [],
                    type: [],
                    account: [],
                    date: [],
                    search: ''
                };
            }
        } catch (error) {
            console.error('❌ Error loading default preferences:', error);
            // במקרה של שגיאה, השתמש בפילטרים ריקים
            this.currentFilters = {
                status: [],
                type: [],
                account: [],
                date: [],
                search: ''
            };
        }

        // עדכון התצוגה
        this.updateStatusDisplay();
        this.updateTypeDisplay();
        this.updateAccountDisplay();
        this.updateDateDisplay();

        // עדכון בחירת הכפתורים בממשק
        this.updateFilterButtonSelections();

        // הפעלת הפילטרים
        this.applyFilters();

        console.log('✅ Filters reset to default preferences');
    }

    /**
     * ניקוי פילטרים - הצגת כל הרשומות
     * Clear filters - show all records
     */
    clearFilters() {
        console.log('🔄 Clearing all filters - showing all records...');

        // איפוס כל הפילטרים
        this.currentFilters = {
            status: [],
            type: [],
            account: [],
            date: [],
            search: ''
        };

        // עדכון התצוגה
        this.updateStatusDisplay();
        this.updateTypeDisplay();
        this.updateAccountDisplay();
        this.updateDateDisplay();

        // עדכון בחירת הכפתורים בממשק
        this.updateFilterButtonSelections();

        // הפעלת הפילטרים
        this.applyFilters();

        console.log('✅ All filters cleared - showing all records');
    }

    /**
     * עדכון בחירת הכפתורים בממשק הפילטרים
     * Update filter button selections in the UI
     */
    updateFilterButtonSelections() {
        console.log('🔄 Updating filter button selections...');

        // עדכון פילטר סטטוס
        this.updateStatusButtonSelections();

        // עדכון פילטר טיפוס
        this.updateTypeButtonSelections();

        // עדכון פילטר חשבון
        this.updateAccountButtonSelections();

        // עדכון פילטר תאריכים
        this.updateDateButtonSelections();

        // עדכון פילטר חיפוש
        this.updateSearchInput();
    }

    /**
     * עדכון בחירת כפתורי פילטר סטטוס
     * Update status filter button selections
     */
    updateStatusButtonSelections() {
        console.log('🔄 updateStatusButtonSelections called');
        console.log('🔄 Current status filters:', this.currentFilters.status);

        const statusItems = document.querySelectorAll('#statusFilterMenu .status-filter-item');
        console.log('🔄 Found status items:', statusItems.length);

        // הסרת סימון מכל הכפתורים
        statusItems.forEach(item => item.classList.remove('selected'));

        // סימון הכפתורים לפי הפילטרים הנוכחיים
        if (this.currentFilters.status && this.currentFilters.status.length > 0) {
            this.currentFilters.status.forEach(status => {
                console.log('🔄 Looking for status:', status);
                const item = Array.from(statusItems).find(item => {
                    const dataValue = item.getAttribute('data-value');
                    console.log('🔄 Checking item with data-value:', dataValue);
                    return dataValue === status;
                });
                if (item) {
                    console.log('✅ Found and selected status item:', status);
                    item.classList.add('selected');
                } else {
                    console.warn('⚠️ Status item not found:', status);
                }
            });
        } else {
            // אם אין פילטר סטטוס, סמן "הכול"
            console.log('🔄 No status filters, selecting "הכול"');
            const allItem = Array.from(statusItems).find(item => {
                const dataValue = item.getAttribute('data-value');
                console.log('🔄 Checking item with data-value:', dataValue);
                return dataValue === 'הכול';
            });
            if (allItem) {
                console.log('✅ Found and selected "הכול" item');
                allItem.classList.add('selected');
            } else {
                console.warn('⚠️ "הכול" item not found');
            }
        }
    }

    /**
     * עדכון בחירת כפתורי פילטר טיפוס
     * Update type filter button selections
     */
    updateTypeButtonSelections() {
        console.log('🔄 updateTypeButtonSelections called');
        console.log('🔄 Current type filters:', this.currentFilters.type);

        const typeItems = document.querySelectorAll('#typeFilterMenu .type-filter-item');
        console.log('🔄 Found type items:', typeItems.length);

        // הסרת סימון מכל הכפתורים
        typeItems.forEach(item => item.classList.remove('selected'));

        // סימון הכפתורים לפי הפילטרים הנוכחיים
        if (this.currentFilters.type && this.currentFilters.type.length > 0) {
            this.currentFilters.type.forEach(type => {
                console.log('🔄 Looking for type:', type);
                const item = Array.from(typeItems).find(item => {
                    const dataValue = item.getAttribute('data-value');
                    console.log('🔄 Checking item with data-value:', dataValue);
                    return dataValue === type;
                });
                if (item) {
                    console.log('✅ Found and selected type item:', type);
                    item.classList.add('selected');
                } else {
                    console.warn('⚠️ Type item not found:', type);
                }
            });
        } else {
            // אם אין פילטר טיפוס, סמן "הכול"
            console.log('🔄 No type filters, selecting "הכול"');
            const allItem = Array.from(typeItems).find(item => {
                const dataValue = item.getAttribute('data-value');
                console.log('🔄 Checking item with data-value:', dataValue);
                return dataValue === 'הכול';
            });
            if (allItem) {
                console.log('✅ Found and selected "הכול" item');
                allItem.classList.add('selected');
            } else {
                console.warn('⚠️ "הכול" item not found');
            }
        }
    }

    /**
     * עדכון בחירת כפתורי פילטר חשבון
     * Update account filter button selections
     */
    updateAccountButtonSelections() {
        console.log('🔄 updateAccountButtonSelections called');
        console.log('🔄 Current account filters:', this.currentFilters.account);

        const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
        console.log('🔄 Found account items:', accountItems.length);

        // הסרת סימון מכל הכפתורים
        accountItems.forEach(item => item.classList.remove('selected'));

        // סימון הכפתורים לפי הפילטרים הנוכחיים
        if (this.currentFilters.account && this.currentFilters.account.length > 0) {
            this.currentFilters.account.forEach(account => {
                console.log('🔄 Looking for account:', account);
                const item = Array.from(accountItems).find(item => {
                    const dataValue = item.getAttribute('data-value');
                    console.log('🔄 Checking item with data-value:', dataValue);
                    return dataValue === account;
                });
                if (item) {
                    console.log('✅ Found and selected account item:', account);
                    item.classList.add('selected');
                } else {
                    console.warn('⚠️ Account item not found:', account);
                }
            });
        } else {
            // אם אין פילטר חשבון, סמן "הכול"
            console.log('🔄 No account filters, selecting "הכול"');
            const allItem = Array.from(accountItems).find(item => {
                const dataValue = item.getAttribute('data-value');
                console.log('🔄 Checking item with data-value:', dataValue);
                return dataValue === 'הכול';
            });
            if (allItem) {
                console.log('✅ Found and selected "הכול" item');
                allItem.classList.add('selected');
            } else {
                console.warn('⚠️ "הכול" item not found');
            }
        }
    }

    /**
     * עדכון בחירת כפתורי פילטר תאריכים
     * Update date filter button selections
     */
    updateDateButtonSelections() {
        console.log('🔄 updateDateButtonSelections called');
        console.log('🔄 Current date filters:', this.currentFilters.date);

        const dateItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
        console.log('🔄 Found date items:', dateItems.length);

        // הסרת סימון מכל הכפתורים
        dateItems.forEach(item => item.classList.remove('selected'));

        // סימון הכפתורים לפי הפילטרים הנוכחיים
        if (this.currentFilters.date && this.currentFilters.date.length > 0) {
            this.currentFilters.date.forEach(date => {
                console.log('🔄 Looking for date:', date);
                const item = Array.from(dateItems).find(item => {
                    const dataValue = item.getAttribute('data-value');
                    console.log('🔄 Checking item with data-value:', dataValue);
                    return dataValue === date;
                });
                if (item) {
                    console.log('✅ Found and selected date item:', date);
                    item.classList.add('selected');
                } else {
                    console.warn('⚠️ Date item not found:', date);
                }
            });
        } else {
            // אם אין פילטר תאריך, סמן "כל זמן"
            console.log('🔄 No date filters, selecting "כל זמן"');
            const allItem = Array.from(dateItems).find(item => {
                const dataValue = item.getAttribute('data-value');
                console.log('🔄 Checking item with data-value:', dataValue);
                return dataValue === 'כל זמן';
            });
            if (allItem) {
                console.log('✅ Found and selected "כל זמן" item');
                allItem.classList.add('selected');
            } else {
                console.warn('⚠️ "כל זמן" item not found');
            }
        }
    }

    /**
     * עדכון שדה החיפוש
     * Update search input field
     */
    updateSearchInput() {
        const searchInput = document.getElementById('searchFilterInput');
        if (searchInput) {
            searchInput.value = this.currentFilters.search || '';
        }
    }

    // ===== פונקציות הפעלת פילטרים =====

    /**
 * הפעלת פילטר סטטוס
 */
    applyStatusFilter(statuses) {
        console.log('🔄 SimpleFilter.applyStatusFilter called with statuses:', statuses);

        // אם יש "הכול" או אין בחירות - מסירים את הפילטר
        if (statuses.includes('הכול') || statuses.length === 0) {
            this.currentFilters.status = []; // מערך ריק במקום null
        } else {
            // Filter out null/undefined values
            this.currentFilters.status = statuses.filter(s => s && s !== null && s !== undefined);
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
            this.currentFilters.type = []; // מערך ריק במקום null
        } else {
            // Filter out null/undefined values
            this.currentFilters.type = types.filter(t => t && t !== null && t !== undefined);
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
            this.currentFilters.account = []; // מערך ריק במקום null
        } else {
            // Filter out null/undefined values and use account names directly
            this.currentFilters.account = accounts.filter(a => a && a !== null && a !== undefined);
        }

        console.log('🔄 Current account filters:', this.currentFilters.account);
        this.applyFilters();
    }

    /**
 * הפעלת פילטר תאריכים
 */
    applyDateRangeFilter(dateRange) {
        console.log('🔄 SimpleFilter.applyDateRangeFilter called with dateRange:', dateRange);

        // אם יש "כל זמן" או אין בחירות - מסירים את הפילטר
        if (dateRange === 'כל זמן' || !dateRange || dateRange.length === 0) {
            this.currentFilters.date = []; // מערך ריק במקום null
        } else {
            // Filter out null/undefined values and use date range directly
            this.currentFilters.date = [dateRange].filter(d => d && d !== null && d !== undefined);
        }

        console.log('🔄 Current date filters:', this.currentFilters.date);
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

    /**
     * המרת העדפת סטטוס לערכים עבריים
     * Convert status preference to Hebrew values
     */
    convertStatusPreference(preference) {
        // Handle null/undefined preference
        if (!preference) {
            console.log('🔄 convertStatusPreference: preference is null/undefined, returning empty array');
            return [];
        }

        switch (preference) {
            case 'open':
                return ['פתוח'];
            case 'closed':
                return ['סגור'];
            case 'canceled':
                return ['בוטל'];
            case 'cancelled':
                return ['מבוטל'];
            case 'pending':
                return ['ממתין'];
            case 'all':
            default:
                return [];
        }
    }

    /**
     * המרת העדפת טיפוס לערכים עבריים
     * Convert type preference to Hebrew values
     */
    convertTypePreference(preference) {
        // Handle null/undefined preference
        if (!preference) {
            console.log('🔄 convertTypePreference: preference is null/undefined, returning empty array');
            return [];
        }

        switch (preference) {
            case 'swing':
                return ['סווינג'];
            case 'investment':
                return ['השקעה'];
            case 'passive':
                return ['פסיבי'];
            case 'buy':
                return ['קנייה'];
            case 'sell':
                return ['מכירה'];
            case 'long':
                return ['לונג'];
            case 'short':
                return ['שורט'];
            case 'all':
            default:
                return [];
        }
    }

    /**
     * המרת העדפת חשבון לערכים עבריים
     * Convert account preference to Hebrew values
     */
    convertAccountPreference(preference) {
        // Handle null/undefined preference
        if (!preference) {
            console.log('🔄 convertAccountPreference: preference is null/undefined, returning empty array');
            return [];
        }

        if (preference === 'all') {
            return [];
        }
        // אם זה לא 'all', נחזיר את הערך כמו שהוא (שם החשבון)
        return [preference];
    }

    /**
     * המרת העדפת תאריך לערכים עבריים
     * Convert date preference to Hebrew values
     */
    convertDatePreference(preference) {
        // Handle null/undefined preference
        if (!preference) {
            console.log('🔄 convertDatePreference: preference is null/undefined, returning empty array');
            return [];
        }

        switch (preference) {
            case 'this_week':
                return ['השבוע'];
            case 'week':
                return ['שבוע'];
            case 'mtd':
                return ['MTD'];
            case '30_days':
                return ['30 יום'];
            case '60_days':
                return ['60 יום'];
            case '90_days':
                return ['90 יום'];
            case 'year':
                return ['שנה'];
            case 'ytd':
                return ['YTD'];
            case 'previous_year':
                return ['שנה קודמת'];
            case 'all':
            default:
                return [];
        }
    }

    /**
     * עדכון תצוגת פילטר הסטטוס
     * Update status filter display
     */
    updateStatusDisplay() {
        console.log('🔄 updateStatusDisplay called');
        console.log('🔄 Current status filters:', this.currentFilters.status);

        const statusDisplay = document.getElementById('selectedStatus');
        if (!statusDisplay) {
            console.warn('⚠️ selectedStatus element not found');
            return;
        }

        if (!this.currentFilters.status || !Array.isArray(this.currentFilters.status) || this.currentFilters.status.length === 0) {
            console.log('🔄 Setting status display to "הכול"');
            statusDisplay.textContent = 'הכול';
        } else {
            const displayText = this.currentFilters.status.join(', ');
            console.log('🔄 Setting status display to:', displayText);
            statusDisplay.textContent = displayText;
        }
    }

    /**
     * עדכון תצוגת פילטר הטיפוס
     * Update type filter display
     */
    updateTypeDisplay() {
        console.log('🔄 updateTypeDisplay called');
        console.log('🔄 Current type filters:', this.currentFilters.type);

        const typeDisplay = document.getElementById('selectedType');
        if (!typeDisplay) {
            console.warn('⚠️ selectedType element not found');
            return;
        }

        if (!this.currentFilters.type || !Array.isArray(this.currentFilters.type) || this.currentFilters.type.length === 0) {
            console.log('🔄 Setting type display to "הכול"');
            typeDisplay.textContent = 'הכול';
        } else {
            const displayText = this.currentFilters.type.join(', ');
            console.log('🔄 Setting type display to:', displayText);
            typeDisplay.textContent = displayText;
        }
    }

    /**
     * עדכון תצוגת פילטר החשבון
     * Update account filter display
     */
    updateAccountDisplay() {
        console.log('🔄 updateAccountDisplay called');
        console.log('🔄 Current account filters:', this.currentFilters.account);

        const accountDisplay = document.getElementById('selectedAccount');
        if (!accountDisplay) {
            console.warn('⚠️ selectedAccount element not found');
            return;
        }

        if (!this.currentFilters.account || !Array.isArray(this.currentFilters.account) || this.currentFilters.account.length === 0) {
            console.log('🔄 Setting account display to "הכול"');
            accountDisplay.textContent = 'הכול';
        } else {
            const displayText = this.currentFilters.account.join(', ');
            console.log('🔄 Setting account display to:', displayText);
            accountDisplay.textContent = displayText;
        }
    }

    /**
     * עדכון תצוגת פילטר התאריכים
     * Update date filter display
     */
    updateDateDisplay() {
        console.log('🔄 updateDateDisplay called');
        console.log('🔄 Current date filters:', this.currentFilters.date);

        const dateDisplay = document.getElementById('selectedDateRange');
        if (!dateDisplay) {
            console.warn('⚠️ selectedDateRange element not found');
            return;
        }

        if (!this.currentFilters.date || !Array.isArray(this.currentFilters.date) || this.currentFilters.date.length === 0) {
            console.log('🔄 Setting date display to "כל זמן"');
            dateDisplay.textContent = 'כל זמן';
        } else {
            const displayText = this.currentFilters.date.join(', ');
            console.log('🔄 Setting date display to:', displayText);
            dateDisplay.textContent = displayText;
        }
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
    document.addEventListener('DOMContentLoaded', async () => {
        window.simpleFilter = new SimpleFilter();
        await window.simpleFilter.init();
    });
} else {
    // אם הדף כבר נטען, נחכה קצת כדי לוודא שה-header נטען
    setTimeout(async () => {
        window.simpleFilter = new SimpleFilter();
        await window.simpleFilter.init();
    }, 100);
}
