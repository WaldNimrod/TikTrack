/**
 * Portfolio State Page - Portfolio state and performance charts
 * 
 * This file handles the portfolio state page functionality.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 * 
 * FUNCTION INDEX:
 * 
 * Initialization:
 * - setupLazyChartLoading() - Setup lazy chart loading
 * - initUnifiedPortfolioChart() - Initialize unified portfolio chart
 * - initPortfolioPerformanceChart() - Initialize portfolio performance chart
 * - initPortfolioValueChart() - Initialize portfolio value chart
 * - initPLTrendChart() - Initialize P/L trend chart
 * - setupChartSynchronization() - Setup chart synchronization
 * - setupChartControls() - Setup chart controls
 * - initializeHeader() - Initialize header
 * - initializePage() - Initialize page
 * 
 * Event Handlers:
 * - convertDateToChartFormat() - Convert date to chart format
 * - selectDateRangeOption() - Select date range option
 * - handleCustomDateFromChange() - Handle custom date from change
 * - handleCustomDateToChange() - Handle custom date to change
 * - selectAccountOption() - Select account option
 * - loadTradesForMonthYear() - Load trades for month/year
 * - removeComparisonDate() - Remove comparison date
 * - chartFitContent() - Chart fit content
 * 
 * UI Functions:
 * - updateDateRangeFilterText() - Update date range filter text
 * - updateAccountFilterText() - Update account filter text
 * - renderNumericValue() - Render numeric value
 * - showLoadingState() - Show loading state
 * - hideLoadingState() - Hide loading state
 * - renderTradeRow() - Render trade row
 * - updateTradesTable() - Update trades table
 * - updateTradesSummary() - Update trades summary
 * - updateSummaryCards() - Update summary cards
 * - showChartDataTable() - Show chart data table
 * - renderAmount() - Render amount
 * 
 * Data Functions:
 * - getCSSVariableValue() - Get CSS variable value
 * - loadTradingAccounts() - Load trading accounts
 * - loadInvestmentTypes() - Load investment types
 * - getDateRange() - Get date range
 * - getSelectedAccounts() - Get selected accounts
 * - loadChartDefaultPeriod() - Load chart default period
 * - checkPortfolioDataCompleteness() - Check portfolio data completeness
 * - ensurePortfolioHistoricalData() - Ensure portfolio historical data
 * - loadPortfolioState() - Load portfolio state
 * - loadTradesData() - Load trades data
 * - loadTrades() - Load trades
 * - getLighterColor() - Get lighter color
 * - loadUnifiedChartData() - Load unified chart data
 * - syncRangeToOtherCharts() - Sync range to other charts
 * - loadUserPreferences() - Load user preferences
 * - savePageState() - Save page state
 * - filterValidData() - Filter valid data
 * - getDateValue() - Get date value
 * - getColumns() - Get columns
 * 
 * Utility Functions:
 * - formatDate() - Format date
 * - finalSafetyCheck() - Final safety check
 * 
 * Other:
 * - toggleCardDetails() - Toggle card details
 * - populateAccountFilterMenu() - Populate account filter menu
 * - toggleAccountFilterMenu() - Toggle account filter menu
 * - toggleDateRangeFilterMenu() - Toggle date range filter menu
 * - applyCustomDateRange() - Apply custom date range
 * - isDateInRange() - Is date in range
 * - debounce() - Debounce
 * - applyFilters() - Apply filters
 * - applyFiltersInternal() - Apply filters internal
 * - filterTrades() - Filter trades
 * - clearFilters() - Clear filters
 * - populateYearSelect() - Populate year select
 * - calculateSummaryFromTrades() - Calculate summary from trades
 * - setChartPeriod() - Set chart period
 * - timeRangesEqual() - Time ranges equal
 * - compareDates() - Compare dates
 * - waitForScripts() - Wait for scripts
 * - registerPortfolioTradesTable() - Register portfolio trades table
 * - restorePageState() - Restore page state
 * - restoreSelectedAccounts() - Restore selected accounts
 * - chartZoomIn() - Chart zoom in
 * - chartZoomOut() - Chart zoom out
 * - setChartTimeRange() - Set chart time range
 * - INVESTMENT_TYPES() - Investment Types
 * - later() - Later
 * - safeNumericValue() - Safe numeric value
 */

(function() {
    'use strict';

// Investment types - use system-wide constants if available, otherwise fallback
// Use window.VALID_INVESTMENT_TYPES for consistency across the system
const INVESTMENT_TYPES = (() => {
    if (window.VALID_INVESTMENT_TYPES && Array.isArray(window.VALID_INVESTMENT_TYPES)) {
        // Use system-wide investment types with labels
        const labels = window.INVESTMENT_TYPE_LABELS || {};
        return window.VALID_INVESTMENT_TYPES.map(type => ({
            value: type,
            label: labels[type] || type
        }));
    }
    // Fallback to standard values (same as database constraints)
    return [
        { value: 'swing', label: 'סווינג' },
        { value: 'investment', label: 'השקעה' },
        { value: 'passive', label: 'פאסיבי' }
    ];
})();

let allTradingAccounts = [];
let unifiedPortfolioChart = null;
let unifiedChartSeries = {
    positionsValue: null,      // שווי פוזיציות ($)
    performance: null,         // ביצועי תיק (%)
    portfolioValue: null,      // שווי תיק ($)
    realizedPL: null,          // P/L ממומש ($)
    unrealizedPL: null,        // P/L לא ממומש ($)
    totalPL: null              // P/L כולל ($)
};
let currentPeriod = {
    'both': 'month'
};

// Trades data
let allTrades = [];
let filteredTrades = [];
let currentSnapshot = null; // Store current snapshot for cash balance calculations

// Helper function to get CSS variable value
function getCSSVariableValue(variableName, fallback) {
    try {
        if (typeof window !== 'undefined' && window.getComputedStyle) {
            const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
            if (value) {
                const trimmed = value.trim();
                if (trimmed) {
                    return trimmed;
                }
            }
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('Failed to read CSS variable', { variableName, error });
        }
    }
    return fallback;
}

// Helper function to convert date to yyyy-mm-dd format for charts
function convertDateToChartFormat(dateValue) {
    // CRITICAL: Validate input
    if (!dateValue) return null;
    
    // Date object - convert to ISO string and extract date part
    if (dateValue instanceof Date) {
        if (isNaN(dateValue.getTime())) {
            // Invalid date
            return null;
        }
        const dateStr = dateValue.toISOString().split('T')[0];
        // Validate the result is a valid date string (yyyy-mm-dd format)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
        }
        return null;
    }
    
    // DateEnvelope format - use UTC
    if (typeof dateValue === 'object' && dateValue.utc) {
        const dateStr = dateValue.utc.split('T')[0];
        // Validate the result is a valid date string (yyyy-mm-dd format)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
        }
        return null;
    }
    
    // String format
    if (typeof dateValue === 'string') {
        // Check if it's in dd.mm.yyyy format (with or without time)
        if (/^\d{2}\.\d{2}\.\d{4}/.test(dateValue)) {
            // Extract date part (before space if time exists)
            const datePart = dateValue.split(' ')[0];
            const [day, month, year] = datePart.split('.');
            const dateStr = `${year}-${month}-${day}`;
            // Validate the result is a valid date string
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return dateStr;
            }
            return null;
        } else if (dateValue.includes('T')) {
            // ISO format - extract date part
            const dateStr = dateValue.split('T')[0];
            // Validate the result is a valid date string
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                return dateStr;
            }
            return null;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            // Already in yyyy-mm-dd format - validate it
            return dateValue;
        } else {
            // Try to parse as Date and convert
            try {
                const parsedDate = new Date(dateValue);
                if (!isNaN(parsedDate.getTime())) {
                    const dateStr = parsedDate.toISOString().split('T')[0];
                    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                        return dateStr;
                    }
                }
            } catch (e) {
                // Parsing failed
            }
            // Invalid format
            return null;
        }
    }
    
    // Invalid type
    return null;
}

// Toggle card details
async function toggleCardDetails(cardId) {
    const details = document.getElementById(cardId);
    const chevron = document.getElementById(cardId.replace('-details', '-chevron'));
    if (details) {
        const isVisible = details.style.display !== 'none';
        details.style.display = isVisible ? 'none' : 'block';
        if (chevron && typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
            // Use IconSystem to update icon
            const iconName = isVisible ? 'chevron-down' : 'chevron-up';
            try {
                const iconHTML = await window.IconSystem.renderIcon('button', iconName, {
                    size: chevron.getAttribute('width') || '16',
                    alt: chevron.getAttribute('alt') || 'toggle',
                    class: chevron.getAttribute('class') || 'icon'
                });
                const parser = new DOMParser();
                const doc = parser.parseFromString(iconHTML, 'text/html');
                const newIcon = doc.body.firstElementChild;
                if (newIcon) {
                    chevron.parentNode.replaceChild(newIcon, chevron);
                }
            } catch (error) {
                // Fallback to direct path update
                const iconPath = isVisible ? '/trading-ui/images/icons/tabler/chevron-down.svg' : '/trading-ui/images/icons/tabler/chevron-up.svg';
                chevron.src = iconPath;
            }
        } else if (chevron) {
            // Fallback: Update icon source directly
            const iconPath = isVisible ? '/trading-ui/images/icons/tabler/chevron-down.svg' : '/trading-ui/images/icons/tabler/chevron-up.svg';
            chevron.src = iconPath;
        }
    }
}

// Load trading accounts
async function loadTradingAccounts() {
    try {
        if (window.Logger) {
            window.Logger.info('🔧 Loading trading accounts...', { page: 'portfolio-state-page' });
        }
        
        // Check cache first
        const cacheKey = 'portfolio-state-accounts';
        if (window.UnifiedCacheManager) {
            const cachedData = await window.UnifiedCacheManager.get(cacheKey, 'memory');
            if (cachedData) {
                if (window.Logger) {
                    window.Logger.info(`✅ Loaded ${cachedData.length} accounts from cache`, { page: 'portfolio-state-page' });
                }
                // Process cached accounts
                const openAccounts = cachedData.filter(account => account.status === 'open');
                allTradingAccounts = openAccounts.map(acc => ({
                    id: acc.id,
                    name: acc.name || acc.account_name || `Account #${acc.id}`
                })).sort((a, b) => a.name.localeCompare(b.name));
                await populateAccountFilterMenu();
                return;
            }
        }
        
        // Try multiple methods like header system
        let accounts = [];
        
        // Priority 1: Use DataImportData service with caching (if available)
        if (window.DataImportData?.loadTradingAccountsForImport) {
            try {
                accounts = await window.DataImportData.loadTradingAccountsForImport();
                if (window.Logger) {
                    window.Logger.info(`📊 Loaded ${accounts.length} accounts via DataImportData`, { page: 'portfolio-state-page' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Failed to load accounts via DataImportData, trying fallback', { page: 'portfolio-state-page', error });
                }
            }
        }
        
        // Priority 2: Use legacy function (if available and accounts not loaded)
        if ((!accounts || accounts.length === 0) && typeof window.loadTradingAccountsFromServer === 'function') {
            try {
                await window.loadTradingAccountsFromServer();
                accounts = window.trading_accountsData || [];
                if (window.Logger) {
                    window.Logger.info(`📊 Loaded ${accounts.length} accounts via loadTradingAccountsFromServer`, { page: 'portfolio-state-page' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Failed to load accounts via loadTradingAccountsFromServer', { page: 'portfolio-state-page', error });
                }
            }
        }
        
        // Priority 3: Use TradingAccountsData service (same as header-system)
        if ((!accounts || accounts.length === 0) && window.TradingAccountsData && typeof window.TradingAccountsData.getAll === 'function') {
            try {
                accounts = await window.TradingAccountsData.getAll();
                if (window.Logger) {
                    window.Logger.info(`📊 Loaded ${accounts.length} accounts via TradingAccountsData`, { page: 'portfolio-state-page' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Failed to load accounts via TradingAccountsData, trying fallback', { page: 'portfolio-state-page', error });
                }
            }
        }
        
        // Priority 4: Direct API call (only if no other method worked)
        if (!accounts || accounts.length === 0) {
            try {
                const response = await fetch('/api/trading-accounts/', {
                    credentials: 'include', // Include cookies for session-based auth
                });
                if (response.ok) {
                    const data = await response.json();
                    accounts = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
                    if (window.Logger) {
                        window.Logger.info(`📊 Loaded ${accounts.length} accounts via direct API call`, { page: 'portfolio-state-page' });
                    }
                } else {
                    const errorMsg = `שגיאה בטעינת חשבונות מסחר: ${response.status} ${response.statusText}`;
                    if (window.NotificationSystem) {
                        window.NotificationSystem.showError('שגיאה בטעינת נתונים', errorMsg);
                    }
                    if (window.Logger) {
                        window.Logger.error('❌ Failed to load trading accounts', { page: 'portfolio-state-page', status: response.status, statusText: response.statusText });
                    }
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('❌ Error in direct API call for trading accounts', { page: 'portfolio-state-page', error });
                }
            }
        }
        
        // Save to cache
        if (accounts && accounts.length > 0 && window.UnifiedCacheManager) {
            await window.UnifiedCacheManager.save(cacheKey, accounts, 'memory', { ttl: 600 }); // 10 minutes
            if (window.Logger) {
                window.Logger.info(`💾 Saved ${accounts.length} accounts to cache`, { page: 'portfolio-state-page' });
            }
        }
        
        // Filter only open accounts (same as header system)
        // במערכת יש רק שלושה סטטוסים: open, closed, cancelled
        const openAccounts = accounts.filter(account => account.status === 'open');
        if (window.Logger) {
            window.Logger.info(`📊 Found ${openAccounts.length} open accounts out of ${accounts.length} total`, { page: 'portfolio-state-page' });
        }
        
        allTradingAccounts = openAccounts.map(acc => ({
            id: acc.id,
            name: acc.name || acc.account_name || `Account #${acc.id}`
        })).sort((a, b) => a.name.localeCompare(b.name));
        
        if (window.Logger) {
            window.Logger.info(`✅ Processed ${allTradingAccounts.length} trading accounts`, { page: 'portfolio-state-page', accounts: allTradingAccounts.map(a => a.name) });
        }
        
        // Populate account filter menu
        await populateAccountFilterMenu();
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('❌ Error loading trading accounts', { page: 'portfolio-state-page', error });
        }
    }
}

// Populate account filter menu (extracted for reuse)
async function populateAccountFilterMenu() {
    try {
        const accountMenu = document.getElementById('accountFilterMenu');
        if (accountMenu) {
            // Remove all items except "הכול"
            const existingItems = accountMenu.querySelectorAll('.account-filter-item:not([data-value="הכול"])');
            if (window.Logger) {
                window.Logger.info(`🧹 Removing ${existingItems.length} existing account items`, { page: 'portfolio-state-page' });
            }
            existingItems.forEach(item => item.remove());
            
            // Add all accounts (same as header system)
            allTradingAccounts.forEach(account => {
                const accountItem = document.createElement('div');
                accountItem.className = 'account-filter-item';
                // Use account ID as data-value (same as header system)
                accountItem.setAttribute('data-value', account.id.toString());
                accountItem.setAttribute('data-onclick', `window.portfolioStatePage.selectAccountOption('${account.id.toString()}')`);
                const optionText = document.createElement('span');
                optionText.className = 'option-text';
                optionText.textContent = account.name;
                accountItem.appendChild(optionText);
                accountMenu.appendChild(accountItem);
                if (window.Logger) {
                    window.Logger.info(`✅ Added account to menu: ${account.name} (ID: ${account.id})`, { page: 'portfolio-state-page' });
                }
            });
            
            // Verify items were added
            const allItems = accountMenu.querySelectorAll('.account-filter-item');
            if (window.Logger) {
                window.Logger.info(`📋 Total items in menu: ${allItems.length} (should be ${allTradingAccounts.length + 1} including "הכול")`, { page: 'portfolio-state-page' });
            }
            
            // Set default account from preferences (same as other pages)
            try {
                let defaultAccountId = null;
                
                // Get default account from PreferencesCore (single source of truth)
                if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
                    try {
                        const prefValue = await window.PreferencesCore.getPreference('default_trading_account');
                        if (prefValue) {
                            // Handle different value types
                            let accountId = null;
                            if (typeof prefValue === 'object' && prefValue !== null) {
                                accountId = prefValue.id || prefValue.value || null;
                            } else {
                                const parsed = parseInt(prefValue);
                                if (!isNaN(parsed)) {
                                    accountId = parsed;
                                }
                            }
                            
                            if (accountId) {
                                defaultAccountId = accountId;
                                if (window.Logger) {
                                    window.Logger.info(`✅ Got default account from preferences: ${defaultAccountId}`, { page: 'portfolio-state-page' });
                                }
                            }
                        }
                    } catch (e) {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Error getting default account from PreferencesCore', { page: 'portfolio-state-page', error: e });
                        }
                    }
                }
                
                // Select default account if found and exists in menu
                if (defaultAccountId) {
                    const defaultItem = accountMenu.querySelector(`.account-filter-item[data-value="${defaultAccountId}"]`);
                    if (defaultItem) {
                        // Remove selected from "הכול"
                        const allItem = accountMenu.querySelector('.account-filter-item[data-value="הכול"]');
                        if (allItem) {
                            allItem.classList.remove('selected');
                        }
                        // Select default account
                        defaultItem.classList.add('selected');
                        if (window.Logger) {
                            window.Logger.info(`✅ Selected default account from preferences (ID: ${defaultAccountId})`, { page: 'portfolio-state-page' });
                        }
                    } else {
                        // Default account not in list, select "הכול"
                        const allItem = accountMenu.querySelector('.account-filter-item[data-value="הכול"]');
                        if (allItem) {
                            allItem.classList.add('selected');
                        }
                        // Don't show warning - this is expected behavior when account doesn't exist in menu
                        if (window.Logger) {
                            window.Logger.debug(`Default account ${defaultAccountId} not found in menu, selecting "הכול"`, { page: 'portfolio-state-page' });
                        }
                    }
                } else {
                    // No default preference, select "הכול" by default
                    const allItem = accountMenu.querySelector('.account-filter-item[data-value="הכול"]');
                    if (allItem) {
                        allItem.classList.add('selected');
                    }
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Error setting default account', { page: 'portfolio-state-page', error });
                }
                // Fallback: select "הכול"
                const allItem = accountMenu.querySelector('.account-filter-item[data-value="הכול"]');
                if (allItem) {
                    allItem.classList.add('selected');
                }
            }
            
            // Update filter text
            updateAccountFilterText();
            
            if (window.Logger) {
                window.Logger.info(`✅ Loaded ${allTradingAccounts.length} trading accounts for filter`, { page: 'portfolio-state-page' });
            }
        } else {
            if (window.Logger) {
                window.Logger.warn('⚠️ accountFilterMenu not found!', { page: 'portfolio-state-page' });
            }
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('❌ Error loading trading accounts', { page: 'portfolio-state-page', error });
        }
    }
}

// Load investment types dropdown
function loadInvestmentTypes() {
    const investmentSelect = document.getElementById('filterInvestmentType');
    if (investmentSelect) {
        investmentSelect.textContent = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'הכל';
        investmentSelect.appendChild(defaultOption);
        INVESTMENT_TYPES.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value;
            option.textContent = type.label;
            investmentSelect.appendChild(option);
        });
    }
}

// Toggle account filter menu (same as header system)
// Use FilterManager from header-system instead of local implementation
function toggleAccountFilterMenu() {
    if (window.headerSystem && window.headerSystem.filterManager) {
        window.headerSystem.filterManager.toggleFilter('accountFilterMenu');
    } else {
        // Fallback if FilterManager not available
    const menu = document.getElementById('accountFilterMenu');
    if (menu) {
            menu.classList.toggle('show');
        }
    }
}

// Use FilterManager from header-system instead of local implementation
function toggleDateRangeFilterMenu() {
    if (window.headerSystem && window.headerSystem.filterManager) {
        window.headerSystem.filterManager.toggleFilter('dateRangeFilterMenu');
    } else {
        // Fallback if FilterManager not available
    const menu = document.getElementById('dateRangeFilterMenu');
    if (menu) {
            menu.classList.toggle('show');
        }
    }
}

// Use FilterManager from header-system instead of local implementation
function selectDateRangeOption(dateRange) {
    // Use global FilterManager function if available
    if (window.selectDateRangeOption && typeof window.selectDateRangeOption === 'function') {
        window.selectDateRangeOption(dateRange);
        
        // Handle custom date range inputs (page-specific)
    const customInputs = document.getElementById('customDateRangeInputs');
    if (dateRange === 'מותאם אישית') {
        if (customInputs) {
            customInputs.style.display = 'block';
            // Set default dates if not set
            const today = new Date();
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            
            const fromInput = document.getElementById('customDateFrom');
            const toInput = document.getElementById('customDateTo');
            if (fromInput && !fromInput.value) {
                const weekAgoStr = weekAgo.toISOString().split('T')[0];
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(fromInput.id, weekAgoStr, 'dateOnly');
                } else {
                  fromInput.value = weekAgoStr;
                }
            }
            if (toInput && !toInput.value) {
                if (window.DefaultValueSetter && typeof window.DefaultValueSetter.setCurrentDate === 'function') {
                    window.DefaultValueSetter.setCurrentDate(toInput.id);
                } else {
                    const todayStr = today.toISOString().split('T')[0];
                    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                        window.DataCollectionService.setValue(toInput.id, todayStr, 'dateOnly');
                    } else {
                        toInput.value = todayStr;
                    }
                }
            }
        }
    } else {
        if (customInputs) {
            customInputs.style.display = 'none';
        }
    }
    
        // Apply filters (only if not custom range - custom range applies on input change)
        if (dateRange !== 'מותאם אישית') {
            applyFilters();
        }
    } else {
        // Fallback to local implementation if FilterManager not available
        const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
        dateRangeItems.forEach(item => item.classList.remove('selected'));
        
        const clickedItem = Array.from(dateRangeItems).find(
            item => item.getAttribute('data-value') === dateRange
        );
        if (clickedItem) {
            clickedItem.classList.add('selected');
        }
        
        updateDateRangeFilterText();
    if (dateRange !== 'מותאם אישית') {
        applyFilters();
        }
    }
}

// Handle custom date from change
function handleCustomDateFromChange() {
    // Use DataCollectionService to get values if available
    let fromDate, toDate;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
      fromDate = window.DataCollectionService.getValue('customDateFrom', 'dateOnly', '');
      toDate = window.DataCollectionService.getValue('customDateTo', 'dateOnly', '');
    } else {
      const fromDateEl = document.getElementById('customDateFrom');
      const toDateEl = document.getElementById('customDateTo');
      fromDate = fromDateEl ? fromDateEl.value : '';
      toDate = toDateEl ? toDateEl.value : '';
    }
    
    // Only apply if both dates are set
    if (fromDate && toDate) {
        applyCustomDateRange();
    }
}

// Handle custom date to change
function handleCustomDateToChange() {
    // Use DataCollectionService to get values if available
    let fromDate, toDate;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
      fromDate = window.DataCollectionService.getValue('customDateFrom', 'dateOnly', '');
      toDate = window.DataCollectionService.getValue('customDateTo', 'dateOnly', '');
    } else {
      const fromDateEl = document.getElementById('customDateFrom');
      const toDateEl = document.getElementById('customDateTo');
      fromDate = fromDateEl ? fromDateEl.value : '';
      toDate = toDateEl ? toDateEl.value : '';
    }
    
    // Only apply if both dates are set
    if (fromDate && toDate) {
        applyCustomDateRange();
    }
}

// Apply custom date range
function applyCustomDateRange() {
    // Use DataCollectionService to get values if available
    let fromDate, toDate;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
      fromDate = window.DataCollectionService.getValue('customDateFrom', 'dateOnly', '');
      toDate = window.DataCollectionService.getValue('customDateTo', 'dateOnly', '');
    } else {
      const fromDateEl = document.getElementById('customDateFrom');
      const toDateEl = document.getElementById('customDateTo');
      fromDate = fromDateEl ? fromDateEl.value : '';
      toDate = toDateEl ? toDateEl.value : '';
    }
    
    if (fromDate && toDate) {
        // Update filter text
        const dateElement = document.getElementById('selectedDateRange');
        if (dateElement) {
            // Use FieldRendererService (general system) instead of local formatDate
            const formatDate = (dateStr) => {
                if (window.FieldRendererService?.renderDate) {
                    return window.FieldRendererService.renderDate(dateStr, false);
                }
                // Fallback
                const date = new Date(dateStr);
                return date.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
            };
            dateElement.textContent = `${formatDate(fromDate)} - ${formatDate(toDate)}`;
        }
        
        // Apply filters
        applyFilters();
    }
}

// Update date range filter text (same as header system)
// Use FilterManager from header-system instead of local implementation
function updateDateRangeFilterText() {
    // Use global FilterManager function if available
    if (window.updateDateRangeFilterText && typeof window.updateDateRangeFilterText === 'function') {
        window.updateDateRangeFilterText();
        
        // Handle custom date range display (page-specific)
    const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
    const dateElement = document.getElementById('selectedDateRange');
    
    if (dateElement && selectedItem) {
        const range = selectedItem.getAttribute('data-value');
        if (range === 'מותאם אישית') {
            const fromDate = document.getElementById('customDateFrom')?.value;
            const toDate = document.getElementById('customDateTo')?.value;
            
            if (fromDate && toDate) {
                // Use FieldRendererService (general system) instead of local formatDate
                const formatDate = (dateStr) => {
                    if (window.FieldRendererService?.renderDate) {
                        return window.FieldRendererService.renderDate(dateStr, false);
                    }
                    // Fallback
                    const date = new Date(dateStr);
                    return date.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
                };
                dateElement.textContent = `${formatDate(fromDate)} - ${formatDate(toDate)}`;
            } else {
                dateElement.textContent = 'מותאם אישית';
            }
            }
        }
    } else {
        // Fallback to local implementation if FilterManager not available
        const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
        const dateElement = document.getElementById('selectedDateRange');
        
        if (dateElement && selectedItem) {
            const range = selectedItem.getAttribute('data-value');
            if (range === 'מותאם אישית') {
                const fromDate = document.getElementById('customDateFrom')?.value;
                const toDate = document.getElementById('customDateTo')?.value;
            if (fromDate && toDate) {
                // Use FieldRendererService (general system) instead of local formatDate
                const formatDate = (dateStr) => {
                    if (window.FieldRendererService?.renderDate) {
                        return window.FieldRendererService.renderDate(dateStr, false);
                    }
                    // Fallback
                    const date = new Date(dateStr);
                    return date.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
                };
                dateElement.textContent = `${formatDate(fromDate)} - ${formatDate(toDate)}`;
            } else {
                dateElement.textContent = 'מותאם אישית';
            }
        } else {
            const optionText = selectedItem.querySelector('.option-text');
            const displayText = optionText ? optionText.textContent.trim() : selectedItem.getAttribute('data-value');
            dateElement.textContent = displayText;
        }
    } else if (dateElement) {
        dateElement.textContent = 'היום'; // Default
        }
    }
}

// Get date range (returns start and end dates based on selected range)
// Use translateDateRangeToDates or DateRangePickerService instead of local implementation
function getDateRange() {
    const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
    if (!selectedItem) {
        return { start: null, end: null, range: 'היום' }; // Default to today
    }
    
    const range = selectedItem.getAttribute('data-value');
    
    // Handle custom date range
    if (range === 'מותאם אישית') {
        const fromDate = document.getElementById('customDateFrom')?.value;
        const toDate = document.getElementById('customDateTo')?.value;
        
        if (fromDate && toDate) {
            const start = new Date(fromDate);
            const end = new Date(toDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return { start, end, range: 'מותאם אישית' };
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return { start: today, end: today, range: 'מותאם אישית' };
        }
    }
    
    // Use translateDateRangeToDates if available (general system)
    if (window.translateDateRangeToDates && typeof window.translateDateRangeToDates === 'function') {
        try {
            const dateRange = window.translateDateRangeToDates(range);
            if (dateRange && dateRange.startDate && dateRange.endDate) {
                let start = null;
                let end = null;
                
                // Handle DateEnvelope objects
                if (typeof dateRange.startDate === 'object' && (dateRange.startDate.epochMs || dateRange.startDate.utc)) {
                    start = dateRange.startDate.epochMs ? new Date(dateRange.startDate.epochMs) : new Date(dateRange.startDate.utc);
                } else {
                    start = new Date(dateRange.startDate);
                }
                start.setHours(0, 0, 0, 0);
                
                if (typeof dateRange.endDate === 'object' && (dateRange.endDate.epochMs || dateRange.endDate.utc)) {
                    end = dateRange.endDate.epochMs ? new Date(dateRange.endDate.epochMs) : new Date(dateRange.endDate.utc);
                } else {
                    end = new Date(dateRange.endDate);
                }
                end.setHours(23, 59, 59, 999);
                
                return { start, end, range };
            }
        } catch (error) {
            window.Logger?.warn('Error using translateDateRangeToDates, falling back to local implementation', { error, page: 'portfolio-state-page' });
        }
    }
    
    // Fallback to local implementation if general system not available
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let start = null;
    let end = today;
    
    switch (range) {
        case 'כל זמן':
            return { start: null, end: null, range };
        case 'היום':
            start = new Date(today);
            break;
        case 'אתמול':
            start = new Date(today);
            start.setDate(today.getDate() - 1);
            end = new Date(start);
            break;
        case 'השבוע': {
            const dayOfWeek = today.getDay();
            start = new Date(today);
            start.setDate(today.getDate() - dayOfWeek);
            break;
        }
        case 'שבוע':
            start = new Date(today);
            start.setDate(today.getDate() - 7);
            break;
        case 'שבוע קודם': {
            const dayOfWeek = today.getDay();
            const lastWeekEnd = new Date(today);
            lastWeekEnd.setDate(today.getDate() - dayOfWeek - 1);
            end = new Date(lastWeekEnd);
            end.setHours(23, 59, 59, 999);
            start = new Date(lastWeekEnd);
            start.setDate(lastWeekEnd.getDate() - 6);
            start.setHours(0, 0, 0, 0);
            break;
        }
        case 'החודש': {
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        }
        case 'חודש':
            start = new Date(today);
            start.setDate(today.getDate() - 30);
            break;
        case 'חודש קודם': {
            const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
            start = lastMonthStart;
            end = lastMonthEnd;
            end.setHours(23, 59, 59, 999);
            break;
        }
        case 'השנה': {
            start = new Date(today.getFullYear(), 0, 1);
            break;
        }
        case 'שנה':
            start = new Date(today);
            start.setDate(today.getDate() - 365);
            break;
        case 'שנה קודמת': {
            const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
            const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
            start = lastYearStart;
            end = lastYearEnd;
            end.setHours(23, 59, 59, 999);
            break;
        }
    }
    
    if (start) {
        start.setHours(0, 0, 0, 0);
    }
    if (end) {
        end.setHours(23, 59, 59, 999);
    }
    
    return { start, end, range };
}

// Use getDateRange() which now uses translateDateRangeToDates
function isDateInRange(dateString, dateRange) {
    if (!dateString || !dateRange || dateRange === 'כל זמן') {
        return true;
    }
    
    const date = new Date(dateString);
    const { start, end } = getDateRange();
    
    if (!start && !end) {
        return true; // כל זמן
    }
    
    date.setHours(0, 0, 0, 0);
    
    if (start && end) {
        return date >= start && date <= end;
    } else if (start) {
        return date >= start;
    } else if (end) {
        return date <= end;
    }
    
    return true;
}

// Use FilterManager from header-system instead of local implementation
function selectAccountOption(account) {
    // Use global FilterManager function if available
    if (window.selectAccountOption && typeof window.selectAccountOption === 'function') {
        window.selectAccountOption(account);
        // Apply page-specific filters
        applyFilters();
    } else {
        // Fallback to local implementation if FilterManager not available
    const accountStr = account.toString();
    const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
    const clickedItem = Array.from(accountItems).find(
        item => item.getAttribute('data-value') === accountStr
    );
    
    if (clickedItem) {
        if (accountStr === 'הכול') {
            accountItems.forEach(item => item.classList.remove('selected'));
            clickedItem.classList.add('selected');
        } else {
            const allItem = Array.from(accountItems).find(
                item => item.getAttribute('data-value') === 'הכול'
            );
            if (allItem) {
                allItem.classList.remove('selected');
            }
            clickedItem.classList.toggle('selected');
            
            const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
            if (selectedItems.length === 0 && allItem) {
                allItem.classList.add('selected');
            }
        }
    } else {
        if (window.Logger) {
            window.Logger.warn('⚠️ Account item not found', { page: 'portfolio-state-page', accountStr });
        }
    }
    
    updateAccountFilterText();
    const accountMenu = document.getElementById('accountFilterMenu');
    if (accountMenu) {
        accountMenu.classList.remove('show');
    }
    applyFilters();
    }
}

// Use FilterManager from header-system instead of local implementation
function updateAccountFilterText() {
    // Use global FilterManager function if available
    if (window.updateAccountFilterText && typeof window.updateAccountFilterText === 'function') {
        window.updateAccountFilterText();
    } else {
        // Fallback to local implementation if FilterManager not available
    const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
    const accountElement = document.getElementById('selectedAccount');
    
    if (accountElement) {
        if (selectedItems.length === 0 || 
            (selectedItems.length === 1 && selectedItems[0].getAttribute('data-value') === 'הכול')) {
            accountElement.textContent = 'כל חשבון מסחר';
        } else if (selectedItems.length === 1) {
            const optionText = selectedItems[0].querySelector('.option-text');
            const displayText = optionText ? optionText.textContent.trim() : selectedItems[0].getAttribute('data-value');
            accountElement.textContent = displayText;
        } else {
            accountElement.textContent = `${selectedItems.length} חשבונות`;
            }
        }
    }
}

// Get selected accounts from filter (same as header system)
function getSelectedAccounts() {
    const selectedItems = document.querySelectorAll('#accountFilterMenu .account-filter-item.selected');
    const selectedIds = Array.from(selectedItems)
        .map(item => item.getAttribute('data-value'))
        .filter(value => value !== 'הכול');
    
    // If no accounts selected or "הכול" is selected, return all account IDs
    if (selectedIds.length === 0 || 
        Array.from(selectedItems).some(item => item.getAttribute('data-value') === 'הכול')) {
        return allTradingAccounts.map(acc => acc.id.toString());
    }
    
    return selectedIds;
}

// Debounce helper for filter changes
function debounce(func, wait) {
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

// Debounced apply filters (300ms delay)
const debouncedApplyFilters = debounce(() => {
    applyFiltersInternal();
}, 300);

function applyFilters() {
    // Update account filter text immediately
    updateAccountFilterText();
    
    // Use debounced version for actual filter application
    debouncedApplyFilters();
}

function applyFiltersInternal() {
    // Invalidate cache for trades and summary when filters change
    if (window.CacheSyncManager?.invalidateByPattern) {
        const patterns = ['portfolio-state-trades-*', 'portfolio-state-summary-*'];
        patterns.forEach(pattern => {
            window.CacheSyncManager.invalidateByPattern(pattern).catch(err => {
                if (window.Logger) {
                    window.Logger.warn('Failed to invalidate cache pattern', { pattern, error: err, page: 'portfolio-state-page' });
                }
            });
        });
    } else if (window.UnifiedCacheManager?.invalidate) {
        // Fallback: invalidate all portfolio-state cache
        const patterns = ['portfolio-state-trades-*', 'portfolio-state-summary-*'];
        patterns.forEach(pattern => {
            window.UnifiedCacheManager.invalidate(pattern).catch(err => {
                if (window.Logger) {
                    window.Logger.warn('Failed to invalidate cache pattern', { pattern, error: err, page: 'portfolio-state-page' });
                }
            });
        });
    }
    
    // Reload portfolio state with filters (this will filter trades, update charts and summary)
    loadPortfolioState();
}

// Filter trades based on filters
function filterTrades(dateRange, selectedAccounts, investmentType) {
    const { start, end, range } = getDateRange();
    
    filteredTrades = allTrades.filter(trade => {
        // Date range filter - check if trade was active during the selected range
        if (range && range !== 'כל זמן') {
            const createdDate = trade.created_at ? new Date(trade.created_at) : null;
            const closedDate = trade.closed_at ? new Date(trade.closed_at) : null;
            
            // Trade must be created before or on the end date
            if (end && createdDate && createdDate > end) {
                return false;
            }
            
            // If trade is closed, it must be closed after or on the start date
            if (start && closedDate && closedDate < start) {
                return false;
            }
            
            // Trade must be active during the range
            // If trade is still open, it's active if created before/on end
            // If trade is closed, it must overlap with the range
            if (closedDate && start && closedDate < start) {
                return false;
            }
            if (createdDate && end && createdDate > end) {
                return false;
            }
        }
        
        // Account filter - if accounts selected, trade must be in one of them
        if (selectedAccounts && selectedAccounts.length > 0) {
            const accountId = trade.trading_account_id?.toString();
            if (!selectedAccounts.includes(accountId)) {
                return false;
            }
        }
        
        // Investment type filter
        if (investmentType && trade.investment_type !== investmentType) {
            return false;
        }
        
        return true;
    });
    
    // Update trades table
    updateTradesTable();
}

// Clear filters - use FilterManager if available
function clearFilters() {
    // Use FilterManager from header-system if available
    if (window.headerSystem && window.headerSystem.filterManager) {
        // Reset date range to "היום" (today)
        window.headerSystem.filterManager.currentFilters.dateRange = 'היום';
        window.headerSystem.filterManager.selectDateRangeOption('היום');
        
        // Select "הכול" (all accounts)
        window.headerSystem.filterManager.currentFilters.account = [];
        window.headerSystem.filterManager.selectAccountOption('הכול');
        
        // Reset investment type (page-specific filter)
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
            window.DataCollectionService.setValue('filterInvestmentType', '', 'text');
        } else {
            const filterEl = document.getElementById('filterInvestmentType');
            if (filterEl) filterEl.value = '';
        }
        
        // Apply filters to reload data
        applyFilters();
    } else {
        // Fallback to local implementation if FilterManager not available
    const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
    dateRangeItems.forEach(item => item.classList.remove('selected'));
    const todayItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item[data-value="היום"]');
    if (todayItem) {
        todayItem.classList.add('selected');
    }
    updateDateRangeFilterText();
    
    const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
    accountItems.forEach(item => item.classList.remove('selected'));
    const allItem = document.querySelector('#accountFilterMenu .account-filter-item[data-value="הכול"]');
    if (allItem) {
        allItem.classList.add('selected');
    }
    
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
      window.DataCollectionService.setValue('filterInvestmentType', '', 'text');
    } else {
      const filterEl = document.getElementById('filterInvestmentType');
      if (filterEl) filterEl.value = '';
    }
    
    updateAccountFilterText();
    applyFilters();
    }
}

/**
 * Helper function to render numeric value - משתמש ב-FieldRendererService המרכזי
 * @deprecated - השתמש ישירות ב-window.FieldRendererService.renderNumericValue()
 * @param {*} value - ערך מספרי
 * @param {string} suffix - סיומת (%, $, וכו')
 * @param {boolean} showSign - להציג + לחיובי
 * @returns {string} HTML מעוצב
 */
function renderNumericValue(value, suffix = '%', showSign = true) {
    // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
    if (window.FieldRendererService?.renderNumericValue) {
        return window.FieldRendererService.renderNumericValue(value, suffix, showSign);
    }
    // Fallback מינימלי למקרה נדיר ביותר שהמערכת לא זמינה
    return '<span class="numeric-value-zero">-</span>';
}

// Load chart default period from preferences
async function loadChartDefaultPeriod() {
    try {
        let chartPrefs = null;
        
        // Try multiple methods to load preferences
        if (typeof window.getGroupPreferences === 'function') {
            try {
                chartPrefs = await window.getGroupPreferences('ui').catch(() => null);
            } catch (e) {
                if (window.Logger) {
                    window.Logger.warn('Error loading preferences via getGroupPreferences', { page: 'portfolio-state-page', error: e });
                }
            }
        }
        
        // Fallback: Try PreferencesCore
        if (!chartPrefs && window.PreferencesCore) {
            try {
                chartPrefs = await window.PreferencesCore.loadGroupPreferences('ui').catch(() => null);
            } catch (e) {
                if (window.Logger) {
                    window.Logger.warn('Error loading preferences via PreferencesCore', { page: 'portfolio-state-page', error: e });
                }
            }
        }
        
        // Fallback: Try PreferencesData
        if (!chartPrefs && window.PreferencesData) {
            try {
                chartPrefs = await window.PreferencesData.loadPreferenceGroup({ groupName: 'ui' }).catch(() => null);
            } catch (e) {
                if (window.Logger) {
                    window.Logger.warn('Error loading preferences via PreferencesData', { page: 'portfolio-state-page', error: e });
                }
            }
        }
        
        // Get default period from preferences
        const uiPrefsData = chartPrefs?.data?.preferences || chartPrefs?.preferences || {};
        const chartPrefsData = uiPrefsData.charts || {};
        const defaultPeriod = chartPrefsData.defaultPeriod || '1M';
        
        // Map period to button
        const periodMap = {
            '1W': 'week',
            '1M': 'month',
            '3M': '3months',
            '1Y': 'year',
            'ALL': 'all'
        };
        
        const periodButton = periodMap[defaultPeriod] || 'month';
        
        // Set active button
        document.querySelectorAll('[data-onclick*="setChartPeriod"]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-onclick').includes(`'${periodButton}'`)) {
                btn.classList.add('active');
            }
        });
        
        // Load chart with default period
        if (periodButton) {
            await setChartPeriod(periodButton, 'both', null);
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('Could not load chart default period from preferences', { page: 'portfolio-state-page', error });
        }
        // Default to month if preferences fail
        document.querySelectorAll('[data-onclick*="setChartPeriod(\'month\'"]').forEach(btn => {
            btn.classList.add('active');
        });
    }
}

// Show loading state for a component
/**
 * Show loading state using UnifiedProgressManager (general system)
 * @param {string} componentId - Component ID (maps to overlay ID)
 */
function showLoadingState(componentId) {
    // Map component IDs to overlay IDs
    const overlayIdMap = {
        'trades-table-section': 'portfolio-state-trades',
        'charts-section': 'portfolio-state-charts',
        'summary-section': 'portfolio-state-summary'
    };
    
    const overlayId = overlayIdMap[componentId] || `portfolio-state-${componentId}`;
    const component = document.getElementById(componentId);
    
    // Use UnifiedProgressManager instance (general system)
    const progressManager = window.unifiedProgressManager || (window.UnifiedProgressManager ? new window.UnifiedProgressManager() : null);
    if (progressManager && typeof progressManager.showProgress === 'function' && component) {
        try {
            progressManager.showProgress(overlayId, 1, 'טוען...', '');
        } catch (e) {
            if (window.Logger) {
                window.Logger.warn('Failed to show progress via UnifiedProgressManager', { error: e, overlayId, page: 'portfolio-state-page' });
            }
        }
    } else if (component) {
        // Fallback: add loading class if UnifiedProgressManager not available
        component.classList.add('loading');
        if (!component.querySelector('.loading-spinner')) {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            const spinnerInner = document.createElement('div');
            spinnerInner.className = 'spinner-border spinner-border-sm';
            spinnerInner.setAttribute('role', 'status');
            const spinnerText = document.createElement('span');
            spinnerText.className = 'visually-hidden';
            spinnerText.textContent = 'טוען...';
            spinnerInner.appendChild(spinnerText);
            spinner.appendChild(spinnerInner);
            component.appendChild(spinner);
        }
    }
}

/**
 * Hide loading state using UnifiedProgressManager (general system)
 * @param {string} componentId - Component ID (maps to overlay ID)
 */
function hideLoadingState(componentId) {
    // Map component IDs to overlay IDs
    const overlayIdMap = {
        'trades-table-section': 'portfolio-state-trades',
        'charts-section': 'portfolio-state-charts',
        'summary-section': 'portfolio-state-summary'
    };
    
    const overlayId = overlayIdMap[componentId] || `portfolio-state-${componentId}`;
    const component = document.getElementById(componentId);
    
    // Use UnifiedProgressManager instance (general system)
    const progressManager = window.unifiedProgressManager || (window.UnifiedProgressManager ? new window.UnifiedProgressManager() : null);
    if (progressManager && typeof progressManager.hideProgress === 'function') {
        try {
            progressManager.hideProgress(overlayId);
        } catch (e) {
            if (window.Logger) {
                window.Logger.warn('Failed to hide progress via UnifiedProgressManager', { error: e, overlayId, page: 'portfolio-state-page' });
            }
        }
    } else if (component) {
        // Fallback: remove loading class if UnifiedProgressManager not available
        component.classList.remove('loading');
        const spinner = component.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }
}

// Load portfolio state
/**
 * Check if portfolio state data is complete (historical prices for all tickers)
 * Similar to checkTickerDataCompleteness in ticker-dashboard
 * @param {Array} positions - Array of positions from portfolio state
 * @returns {Promise<Object>} Completeness check result
 */
async function checkPortfolioDataCompleteness(positions) {
    if (!Array.isArray(positions) || positions.length === 0) {
        return {
            complete: true,
            totalPositions: 0,
            positionsWithData: 0,
            positionsNeedingData: [],
            missingTickers: []
        };
    }

    const result = {
        complete: true,
        totalPositions: positions.length,
        positionsWithData: 0,
        positionsNeedingData: [],
        missingTickers: []
    };

    // Check each position for market price availability
    for (const position of positions) {
        const tickerId = position.ticker_id;
        const tickerSymbol = position.ticker_symbol;
        
        // Check if market price is available
        const hasMarketPrice = position.market_price !== null && position.market_price !== undefined;
        
        if (!hasMarketPrice) {
            result.complete = false;
            result.positionsNeedingData.push({
                tickerId,
                tickerSymbol,
                accountId: position.trading_account_id,
                reason: 'missing_market_price'
            });
            result.missingTickers.push(tickerId);
        } else {
            result.positionsWithData++;
        }
    }

    return result;
}

/**
 * Ensure historical data is available for portfolio state calculations
 * Similar to ensureHistoricalDataForTickers in tickers.js and fetchDataFromProvider in ticker-dashboard
 * Follows the same pattern: check missing data → show UI → load only missing → save to DB/cache → re-check → render
 * @param {Array} positions - Array of positions from portfolio state
 * @param {Object} options - Options (silent, showProgress)
 * @returns {Promise<Array>} Array of positions with data
 */
async function ensurePortfolioHistoricalData(positions, options = {}) {
    const { silent = false, showProgress = true } = options;
    
    if (!Array.isArray(positions) || positions.length === 0) {
        return positions;
    }

    if (!window.ExternalDataService) {
        window.Logger?.warn?.('ExternalDataService not available, skipping historical data loading', { page: 'portfolio-state-page' });
        return positions;
    }

    // Step 0: Check what data is missing before loading (like ticker-dashboard)
    if (window.Logger) {
        window.Logger.info('🔍 Step 0: Checking what data is missing...', { page: 'portfolio-state-page' });
    }
    
    let missingDataInfo = null;
    try {
        // Check missing data via API endpoint (same as ticker-dashboard)
        const missingDataResponse = await fetch(`/api/external-data/status/tickers/missing-data`, {
            credentials: 'include', // Include cookies for session-based auth
        });
        if (missingDataResponse.ok) {
            const missingDataResult = await missingDataResponse.json();
            const allMissingTickers = [
                ...(missingDataResult?.data?.tickers_missing_current || []),
                ...(missingDataResult?.data?.tickers_missing_historical || []),
                ...(missingDataResult?.data?.tickers_missing_indicators || [])
            ];
            
            // Get unique ticker IDs from positions
            const positionTickerIds = [...new Set(positions.map(p => p.ticker_id).filter(id => id))];
            missingDataInfo = allMissingTickers.filter(t => positionTickerIds.includes(t.id));
            
            if (window.Logger) {
                window.Logger.info('📊 Missing data check completed', { 
                    totalPositions: positions.length,
                    needsRefresh: missingDataInfo.length > 0,
                    missingTickersCount: missingDataInfo.length,
                    page: 'portfolio-state-page' 
                });
            }
        }
    } catch (checkError) {
        if (window.Logger) {
            window.Logger.warn('⚠️ Could not check missing data, will refresh all data', { 
                error: checkError.message, 
                page: 'portfolio-state-page' 
            });
        }
        // Continue with full refresh if check fails
    }
    
    // Also check completeness locally
    const completeness = await checkPortfolioDataCompleteness(positions);
    
    // If all data is fresh, skip refresh
    if (completeness.complete && (!missingDataInfo || missingDataInfo.length === 0)) {
        if (!silent) {
            window.Logger?.info?.('✅ All portfolio positions have market data', { 
                count: positions.length, 
                page: 'portfolio-state-page' 
            });
        }
        return positions;
    }

    const overlayId = 'portfolio-state-ensure-historical';
    const uniqueTickerIds = [...new Set(completeness.missingTickers)];
    const totalSteps = uniqueTickerIds.length;
    let progressStep = 0;

    let progressManager = window.unifiedProgressManager || (window.UnifiedProgressManager ? new window.UnifiedProgressManager() : null);
    if (showProgress && progressManager) {
        // Create overlay with proper steps (like ticker-dashboard)
        const steps = [];
        const descriptions = [];
        
        // Determine what needs to be loaded based on missing data check
        const needsQuote = missingDataInfo?.some(t => t.reason === 'missing_current_quote' || t.reason === 'insufficient_historical_data') || completeness.positionsNeedingData.length > 0;
        const needsHistorical = missingDataInfo?.some(t => t.reason === 'insufficient_historical_data') || false;
        
        if (needsQuote) {
            steps.push('טוען מחיר נוכחי');
            descriptions.push('מתחבר לספק הנתונים החיצוני, טוען מחיר נוכחי...');
        }
        if (needsHistorical) {
            steps.push('טוען נתונים היסטוריים');
            descriptions.push('טוען 150 ימים של נתונים היסטוריים...');
        }
        steps.push('מסיים טעינה');
        descriptions.push('מסיים את התהליך...');
        
        if (progressManager && typeof progressManager.createOverlay === 'function') {
            try {
                progressManager.createOverlay(overlayId, {
                    title: 'טוען נתוני שוק עבור תיק',
                    totalSteps: steps.length,
                    stepLabels: steps,
                    stepDescriptions: descriptions
                });
                progressManager.showProgress(overlayId, 1, 'בודק נתונים', `בודק ${totalSteps} טיקרים...`);
            } catch (e) {
                if (window.Logger) {
                    window.Logger.warn('Failed to create/show progress via UnifiedProgressManager', { error: e, overlayId, page: 'portfolio-state-page' });
                }
            }
        }
    }

    // Step 1: Load market data for tickers that need it (optimized - only missing data)
    if (window.Logger) {
        window.Logger.info('📊 Step 1: Refreshing only missing ticker data using ExternalDataService...', { 
            totalTickers: uniqueTickerIds.length,
            page: 'portfolio-state-page' 
        });
    }
    
    // Reuse progress manager if נוצר קודם; אחרת נסה לייצר חדש פעם אחת
    const pm = progressManager || window.unifiedProgressManager || (window.UnifiedProgressManager ? new window.UnifiedProgressManager() : null);
    if (showProgress && pm && typeof pm.showProgress === 'function') {
        try {
            pm.showProgress(
                overlayId,
                1,
                `טוען נתונים עבור ${uniqueTickerIds.length} טיקרים...`,
                'מתחבר לספק הנתונים החיצוני...'
            );
        } catch (e) {
            if (window.Logger) {
                window.Logger.warn('⚠️ Failed to show progress overlay (portfolio-state)', { error: e?.message });
            }
        }
    }

    const positionsWithData = [...positions];

    for (let i = 0; i < uniqueTickerIds.length; i++) {
        const tickerId = uniqueTickerIds[i];
        progressStep++;

        // Find ticker info from missing data check
        const tickerInfo = missingDataInfo?.find(t => t.id === tickerId);
        const needsQuote = tickerInfo?.reason === 'missing_current_quote' || tickerInfo?.reason === 'insufficient_historical_data' || !tickerInfo;
        const needsHistorical = tickerInfo?.reason === 'insufficient_historical_data' || false;

        // Use existing progressManager from outer scope (defined at line 1462)
    if (showProgress && pm && typeof pm.updateProgress === 'function') {
            try {
                const percentage = Math.round((progressStep / totalSteps) * 100);
                pm.updateProgress(overlayId, percentage, `טוען נתוני שוק עבור טיקר ${progressStep}/${totalSteps}`);
            } catch (e) {
                if (window.Logger) {
                    window.Logger.warn('Failed to update progress via UnifiedProgressManager', { error: e, overlayId, page: 'portfolio-state-page' });
                }
            }
        }

        try {
            // Use ExternalDataService.refreshTickerData() - optimized to load only missing data
            // Backend will check what's missing and load only what's needed (like ticker-dashboard)
            const refreshedData = await window.ExternalDataService.refreshTickerData(tickerId, {
                forceRefresh: false, // Let backend decide what to load
                includeHistorical: needsHistorical ? true : undefined, // Only if needed
                daysBack: needsHistorical ? 150 : undefined // Only if needed
            });

            if (window.Logger) {
                window.Logger.info('✅ Ticker data refreshed successfully (optimized)', { 
                    tickerId, 
                    hasPrice: !!refreshedData?.price,
                    hasHistorical: !!refreshedData?.historical_quotes_count,
                    page: 'portfolio-state-page' 
                });
            }
        } catch (error) {
            window.Logger?.warn?.('Failed to load market data for ticker', {
                tickerId,
                error: error.message,
                page: 'portfolio-state-page'
            });
        }
    }

    // Use existing progressManager from outer scope (defined earlier in function)
    if (showProgress && pm && typeof pm.hideProgress === 'function') {
        try {
            pm.hideProgress(overlayId);
        } catch (e) {
            if (window.Logger) {
                window.Logger.warn('Failed to hide progress via UnifiedProgressManager', { error: e, overlayId, page: 'portfolio-state-page' });
            }
        }
    }

    // Step 2: Data is saved to DB and cache by ExternalDataService
    // Step 3: Re-check and render will be done by caller (loadTrades)
    return positionsWithData;
}

async function loadPortfolioState() {
    const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
    const dateRange = selectedItem ? selectedItem.getAttribute('data-value') : 'היום';
    const selectedAccounts = getSelectedAccounts();
    // Use DataCollectionService to get value if available
    let investmentType;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
      investmentType = window.DataCollectionService.getValue('filterInvestmentType', 'text', '');
    } else {
      const investmentTypeEl = document.getElementById('filterInvestmentType');
      investmentType = investmentTypeEl ? investmentTypeEl.value : '';
    }
    
    // Show loading states
    showLoadingState('trades-table-section');
    showLoadingState('charts-section');
    
    try {
        // Check cache for summary data
        const accountsKey = Array.isArray(selectedAccounts) ? selectedAccounts.join(',') : (selectedAccounts || 'all');
        const summaryCacheKey = `portfolio-state-summary-${dateRange}-${accountsKey}-${investmentType || 'all'}`;
        let summary = null;
        
        if (window.UnifiedCacheManager) {
            const cachedSummary = await window.UnifiedCacheManager.get(summaryCacheKey, 'memory');
            if (cachedSummary) {
                if (window.Logger) {
                    window.Logger.info(`✅ Loaded summary from cache`, { page: 'portfolio-state-page' });
                }
                summary = cachedSummary;
            }
        }
        
        // Load trades (which also loads snapshot and stores it in currentSnapshot)
        // CRITICAL: currentSnapshot must be loaded before calculateSummaryFromTrades
        // The loadTrades function already loads snapshot internally via loadTradesData
        const loadResult = await loadTrades(dateRange, selectedAccounts, investmentType);
        
        // Ensure currentSnapshot is set (from loadResult or already set by loadTradesData)
        if (loadResult && loadResult.snapshot) {
            currentSnapshot = loadResult.snapshot;
        }
        
        // Verify currentSnapshot is available before calculating summary
        if (!currentSnapshot && window.Logger) {
            window.Logger.warn('⚠️ currentSnapshot not available after loadTrades', { page: 'portfolio-state-page' });
        }
        
        // Filter trades based on current filters
        filterTrades(dateRange, selectedAccounts, investmentType);
        
        // Calculate summary from filtered trades (if not cached)
        // CRITICAL: currentSnapshot must be available here for calculateSummaryFromTrades
        // Order: snapshot loaded → trades loaded → filtered → summary calculated
        if (!summary) {
            summary = await calculateSummaryFromTrades(filteredTrades);
            // Save summary to cache
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save(summaryCacheKey, summary, 'memory', { ttl: 180 }); // 3 minutes
                if (window.Logger) {
                    window.Logger.info(`💾 Saved summary to cache`, { page: 'portfolio-state-page' });
                }
            }
        }
        await updateSummaryCards(summary);
        
        // Update trades table with filtered trades
        if (filteredTrades && filteredTrades.length > 0) {
            if (window.Logger) {
                window.Logger.info('Updating trades table with filtered trades', { 
                    tradesCount: filteredTrades.length,
                    page: 'portfolio-state-page' 
                });
            }
            updateTradesTable(filteredTrades);
        } else {
            if (window.Logger) {
                window.Logger.info('No filtered trades to display', { page: 'portfolio-state-page' });
            }
            updateTradesTable([]);
        }
        
        // Chart is loaded via lazy loading (setupLazyChartLoading) - don't load here
        // This ensures chart only loads when visible in viewport
        // But we ensure it loads eventually (see setupLazyChartLoading fallback)
    } finally {
        // Hide loading states
        hideLoadingState('trades-table-section');
        hideLoadingState('charts-section');
    }
}

/**
 * Unified function to load trades data
 * Supports both snapshot-based loading (for date ranges) and trade history loading (for specific month/year)
 * 
 * @param {Object} options - Loading options
 * @param {string} [options.dateRange] - Date range filter (e.g., 'היום', 'שבוע', 'חודש')
 * @param {number} [options.month] - Month (1-12) for month/year loading
 * @param {number} [options.year] - Year for month/year loading
 * @param {string|Array} [options.selectedAccounts] - Selected account IDs
 * @param {string} [options.investmentType] - Investment type filter
 * @param {string} [options.startDate] - Start date (ISO format) for month/year loading
 * @param {string} [options.endDate] - End date (ISO format) for month/year loading
 * @param {boolean} [options.loadSnapshot=true] - Whether to load snapshot (for snapshot-based loading)
 * @returns {Promise<Object>} Object with trades array and snapshot (if loaded)
 */
async function loadTradesData(options = {}) {
    const {
        dateRange,
        month,
        year,
        selectedAccounts,
        investmentType,
        startDate,
        endDate,
        loadSnapshot = true
    } = options;

    try {
        // Determine loading mode: month/year (trade history) or snapshot-based
        const isMonthYearMode = month && year;
        
        // Build cache key
        const accountsKey = Array.isArray(selectedAccounts) ? selectedAccounts.join(',') : (selectedAccounts || 'all');
        let cacheKey;
        if (isMonthYearMode) {
            cacheKey = `portfolio-state-trades-${month}-${year}-${accountsKey}`;
        } else {
            cacheKey = `portfolio-state-trades-${dateRange || 'all'}-${accountsKey}-${investmentType || 'all'}`;
        }
        
        // Check cache first
        if (window.UnifiedCacheManager) {
            const cachedData = await window.UnifiedCacheManager.get(cacheKey, 'memory');
            if (cachedData) {
                if (window.Logger) {
                    window.Logger.info(`✅ Loaded ${cachedData.length} trades from cache`, { page: 'portfolio-state-page', cacheKey });
                }
                allTrades = cachedData;
                return { trades: allTrades, snapshot: currentSnapshot };
            }
        }

        // Month/Year mode: Load from trade history
        if (isMonthYearMode) {
            const accountId = Array.isArray(selectedAccounts) && selectedAccounts.length === 1 ? selectedAccounts[0] : null;
            
            // Use TradeHistoryData or direct API call
            if (window.TradeHistoryData && typeof window.TradeHistoryData.loadTradeHistory === 'function') {
                const filters = {
                    account_id: accountId,
                    start_date: startDate,
                    end_date: endDate
                };
                
                const data = await window.TradeHistoryData.loadTradeHistory(filters);
                allTrades = data.trades || [];
            } else {
                // Fallback to direct API call
                const response = await fetch(`/api/trade_history/?account_id=${accountId || ''}&start_date=${startDate}&end_date=${endDate}`, {
                    credentials: 'include', // Include cookies for session-based auth
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                allTrades = result.data?.trades || [];
            }
            
            // Save to cache
            if (allTrades && allTrades.length >= 0 && window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save(cacheKey, allTrades, 'memory', { ttl: 300 }); // 5 minutes
                if (window.Logger) {
                    window.Logger.info(`💾 Saved ${allTrades.length} trades to cache`, { page: 'portfolio-state-page', cacheKey });
                }
            }
            
            return { trades: allTrades, snapshot: null };
        }

        // Snapshot-based mode: Load from portfolio snapshot
        if (loadSnapshot) {
            // Wait for PortfolioStateData to be available
            if (!window.PortfolioStateData) {
                if (window.Logger) {
                    window.Logger.info('⏳ Waiting for PortfolioStateData service to load...', { page: 'portfolio-state-page' });
                }
                await new Promise((resolve) => {
                    const checkInterval = setInterval(() => {
                        if (window.PortfolioStateData) {
                            clearInterval(checkInterval);
                            if (window.Logger) {
                                window.Logger.info('✅ PortfolioStateData service loaded', { page: 'portfolio-state-page' });
                            }
                            resolve();
                        }
                    }, 100);
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        if (window.Logger) {
                            window.Logger.warn('⚠️ PortfolioStateData service not available after 5 seconds timeout', { page: 'portfolio-state-page' });
                        }
                        resolve();
                    }, 5000); // Timeout after 5 seconds
                });
            }

            if (!window.PortfolioStateData || typeof window.PortfolioStateData.loadSnapshot !== 'function') {
                const errorMsg = 'PortfolioStateData service not available. Please ensure portfolio-state-data.js is loaded.';
                if (window.Logger) {
                    window.Logger.error(errorMsg, { 
                        page: 'portfolio-state-page',
                        PortfolioStateDataAvailable: !!window.PortfolioStateData,
                        hasLoadSnapshot: typeof window.PortfolioStateData?.loadSnapshot === 'function'
                    });
                }
                if (window.NotificationSystem) {
                    window.NotificationSystem.showError('שגיאת טעינה', 'שירות נתוני מצב תיק לא זמין. נא לרענן את הדף.');
                }
                throw new Error(errorMsg);
            }

            // Get current date for snapshot
            const today = new Date().toISOString().split('T')[0];
            const accountId = Array.isArray(selectedAccounts) && selectedAccounts.length === 1 ? selectedAccounts[0] : null;
            
            // Load portfolio snapshot
            const snapshot = await window.PortfolioStateData.loadSnapshot(accountId, today, {
                include_closed: false
            });

            // Check and ensure historical data is available for all positions
            // IMPORTANT: We try to load missing data from external provider BEFORE showing "לא זמין"
            if (Array.isArray(snapshot?.positions) && snapshot.positions.length > 0) {
                const completeness = await checkPortfolioDataCompleteness(snapshot.positions);
                
                if (!completeness.complete && completeness.positionsNeedingData.length > 0) {
                    if (window.Logger) {
                        window.Logger.info('📊 Some positions missing market data, attempting to load from external provider...', {
                            total: completeness.totalPositions,
                            needingData: completeness.positionsNeedingData.length,
                            missingTickers: completeness.missingTickers,
                            page: 'portfolio-state-page'
                        });
                    }
                    
                    // Show notification that we're trying to load data
                    if (window.NotificationSystem) {
                        window.NotificationSystem.showInfo(
                            'טוען נתונים',
                            `מנסה לטעון נתוני שוק עבור ${completeness.positionsNeedingData.length} פוזיציות מהספק החיצוני...`
                        );
                    }
                    
                    // Ensure historical data is loaded from external provider
                    await ensurePortfolioHistoricalData(snapshot.positions, {
                        silent: false,
                        showProgress: true
                    });
                    
                    // Reload snapshot after data refresh to get updated market prices
                    const refreshedSnapshot = await window.PortfolioStateData.loadSnapshot(accountId, today, {
                        include_closed: false,
                        force: true // Force refresh to get updated market prices
                    });
                    
                    if (refreshedSnapshot && Array.isArray(refreshedSnapshot.positions)) {
                        snapshot.positions = refreshedSnapshot.positions;
                        
                        // Check again after refresh
                        const finalCompleteness = await checkPortfolioDataCompleteness(refreshedSnapshot.positions);
                        if (!finalCompleteness.complete) {
                            if (window.NotificationSystem) {
                                window.NotificationSystem.showWarning(
                                    'נתונים חלקיים',
                                    `לא הצלחנו לטעון נתוני שוק עבור ${finalCompleteness.positionsNeedingData.length} פוזיציות. חלק מהנתונים יוצגו כ"לא זמין".`
                                );
                            }
                        } else {
                            if (window.NotificationSystem) {
                                window.NotificationSystem.showSuccess(
                                    'נתונים נטענו בהצלחה',
                                    'כל נתוני השוק נטענו מהספק החיצוני בהצלחה.'
                                );
                            }
                        }
                    }
                } else if (completeness.complete) {
                    if (window.Logger) {
                        window.Logger.info('✅ All portfolio positions have market data', {
                            total: completeness.totalPositions,
                            page: 'portfolio-state-page'
                        });
                    }
                }
            }

            // Store snapshot for cash balance calculations
            currentSnapshot = snapshot;

            // Extract trades from snapshot positions
            allTrades = Array.isArray(snapshot?.positions) ? snapshot.positions.map(position => ({
                id: position.trade_id || position.id,
                ticker_symbol: position.ticker_symbol || position.ticker?.symbol || '',
                ticker_id: position.ticker_id || position.ticker?.id,
                trading_account_id: position.account_id || position.trading_account_id,
                account_name: position.account_name || `Account #${position.account_id || position.trading_account_id}`,
                // No fallback values - use null if data not available
                current_price: position.current_price !== null && position.current_price !== undefined 
                    ? position.current_price 
                    : (position.price !== null && position.price !== undefined ? position.price : null),
                daily_change: position.daily_change !== null && position.daily_change !== undefined ? position.daily_change : null,
                position_quantity: position.quantity !== null && position.quantity !== undefined ? position.quantity : null,
                position_pl_percent: position.pl_percent !== null && position.pl_percent !== undefined ? position.pl_percent : null,
                position_pl_value: position.pl_value !== null && position.pl_value !== undefined ? position.pl_value : null,
                status: position.status || 'open',
                investment_type: position.investment_type || '',
                side: position.side || '',
                created_at: position.created_at || '',
                closed_at: position.closed_at || null
            })) : [];
            
            // Save to cache
            if (allTrades && allTrades.length >= 0 && window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save(cacheKey, allTrades, 'memory', { ttl: 300 }); // 5 minutes
                if (window.Logger) {
                    window.Logger.info(`💾 Saved ${allTrades.length} trades to cache`, { page: 'portfolio-state-page', cacheKey });
                }
            }
            
            return { trades: allTrades, snapshot: snapshot };
        }
        
        // If no loading mode specified, return empty
        allTrades = [];
        return { trades: [], snapshot: null };
    } catch (error) {
        // Don't show error notification for auth errors (already handled in service)
        if (error?.message?.includes('Authentication required') || error?.message?.includes('401')) {
            if (window.Logger) {
                window.Logger.warn('⚠️ Authentication required for trades', { page: 'portfolio-state-page' });
            }
            // Skip showing error notification - auth error already handled
            allTrades = [];
            return { trades: [], snapshot: null };
        }
        
        const errorMsg = `שגיאה בטעינת טריידים: ${error.message || 'שגיאה לא ידועה'}`;
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה בטעינת נתונים', errorMsg);
        }
        if (window.Logger) {
            window.Logger.error('Error loading trades', { page: 'portfolio-state-page', error });
        }
        allTrades = [];
        return { trades: [], snapshot: null };
    }
}

// Load trades from API (using unified function)
async function loadTrades(dateRange, selectedAccounts, investmentType) {
    const result = await loadTradesData({
        dateRange,
        selectedAccounts,
        investmentType,
        loadSnapshot: true
    });
    // result.snapshot is already stored in currentSnapshot by loadTradesData
    // Return result so caller can access snapshot if needed
    return result;
}

// Load trades for specific month and year (using unified function)
async function loadTradesForMonthYear() {
    const monthSelect = document.getElementById('tradesMonthSelect');
    const yearSelect = document.getElementById('tradesYearSelect');
    
    if (!monthSelect || !yearSelect) {
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה', 'לא ניתן לטעון טריידים - שדות חודש ושנה לא נמצאו');
        }
        return;
    }
    
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    if (!month || !year) {
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה', 'נא לבחור חודש ושנה');
        }
        return;
    }
    
    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    if (window.Logger) {
        window.Logger.info('Loading trades for month/year', { month, year, startDate: startDateStr, endDate: endDateStr, page: 'portfolio-state-page' });
    }
    
    try {
        // Show loading state
        showLoadingState('trades-table-section');
        
        // Load trades using unified function
        const selectedAccounts = getSelectedAccounts();
        const result = await loadTradesData({
            month,
            year,
            selectedAccounts,
            startDate: startDateStr,
            endDate: endDateStr,
            loadSnapshot: false // Don't load snapshot for month/year mode
        });
        
        // Filter and render
        filteredTrades = result.trades || [];
        if (window.Logger) {
            window.Logger.info('Trades loaded for month/year, updating table', { 
                tradesCount: filteredTrades.length,
                month,
                year,
                page: 'portfolio-state-page' 
            });
        }
        updateTradesTable(filteredTrades);
        await updateTradesSummary(filteredTrades);
        
        if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('טעינה הושלמה', `נטענו ${filteredTrades.length} טריידים לחודש ${month}/${year}`);
        }
    } catch (error) {
        const errorMsg = `שגיאה בטעינת טריידים: ${error.message || 'שגיאה לא ידועה'}`;
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה בטעינת נתונים', errorMsg);
        }
        if (window.Logger) {
            // Don't show error notification for auth errors (already handled in service)
            if (error?.message?.includes('Authentication required') || error?.message?.includes('401')) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Authentication required for trades (month/year)', { month, year, page: 'portfolio-state-page' });
                }
                // Skip showing error notification - auth error already handled
                return;
            }
            
            window.Logger.error('Error loading trades for month/year', { month, year, error, page: 'portfolio-state-page' });
        }
        allTrades = [];
        filteredTrades = [];
        updateTradesTable([]);
    } finally {
        hideLoadingState('trades-table-section');
    }
}

// Populate year select with years (current year and previous 5 years)
function populateYearSelect() {
    const yearSelect = document.getElementById('tradesYearSelect');
    if (!yearSelect) {
        if (window.Logger) {
            window.Logger.warn('⚠️ tradesYearSelect not found', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    
    // Add current year and previous 5 years
    for (let i = 0; i < 6; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        // Default to previous month's year (current year if we're in January, otherwise current year)
        const now = new Date();
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1; // If January, use December of previous year
        const prevYear = prevMonth === 11 ? currentYear - 1 : currentYear;
        if (year === prevYear) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
    
    if (window.Logger) {
        window.Logger.info('✅ Year select populated', { 
            selectedYear: yearSelect.value,
            page: 'portfolio-state-page' 
        });
    }
}

// Calculate summary from trades (using InfoSummarySystem if available)
async function calculateSummaryFromTrades(trades) {
    // Get cash balance from snapshot (same as trading_accounts page uses AccountActivityService)
    let totalCashBalance = null;
            const cashBalanceByAccount = {};
            const positionsCountByAccount = {};
    
    // Get unique account IDs from trades
    const uniqueAccountIds = [...new Set(trades.map(t => t.trading_account_id).filter(id => id))];
    
    // Load cash balances from AccountActivityService (same as trading_accounts page)
    if (currentSnapshot && currentSnapshot.cash_balance !== null && currentSnapshot.cash_balance !== undefined) {
        // Use snapshot cash_balance as total
        totalCashBalance = currentSnapshot.cash_balance;
        
        // Load balances by account from AccountActivityService API (same as trading_accounts page)
        if (uniqueAccountIds.length > 0) {
            try {
                const balancePromises = uniqueAccountIds.map(async (accountId) => {
                    try {
                        const response = await fetch(`/api/account-activity/${accountId}/balances`, {
                            credentials: 'include', // Include cookies for session-based auth
                        });
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const result = await response.json();
                        if (result.status === 'success') {
                            return {
                                account_id: accountId,
                                account_name: trades.find(t => t.trading_account_id === accountId)?.account_name || `Account #${accountId}`,
                                balance: result.data?.base_currency_total || 0
                            };
                        }
                        return null;
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.warn(`Failed to load balance for account ${accountId}`, { page: 'portfolio-state-page', error: error.message });
                        }
                        return null;
                    }
                });
                
                const accountBalances = await Promise.all(balancePromises);
                accountBalances.forEach(acc => {
                    if (acc) {
                        cashBalanceByAccount[acc.account_id] = acc;
                    }
                });
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to load account balances', { page: 'portfolio-state-page', error: error.message });
                }
            }
        }
    }
    
    // Calculate positions count by account
            trades.forEach(trade => {
                const accountId = trade.trading_account_id;
                const accountName = trade.account_name || `Account #${accountId}`;
                
        // Initialize cash balance entry if not already loaded
                if (!cashBalanceByAccount[accountId]) {
                    cashBalanceByAccount[accountId] = {
                        account_id: accountId,
                        account_name: accountName,
                balance: null // Will remain null if not available
                    };
                }
                
                // Positions count
                if (!positionsCountByAccount[accountId]) {
                    positionsCountByAccount[accountId] = {
                        account_id: accountId,
                        count: 0
                    };
                }
                positionsCountByAccount[accountId].count++;
            });
    
    // Use InfoSummarySystem (general system) - REQUIRED, no fallback
    if (!window.InfoSummarySystem || !window.INFO_SUMMARY_CONFIGS?.['portfolio-state-page']) {
        if (window.Logger) {
            window.Logger.error('InfoSummarySystem not available for calculateSummaryFromTrades', { page: 'portfolio-state-page' });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError(
                'שגיאה בחישוב סיכום',
                'מערכת חישוב סיכום לא זמינה. נא לרענן את הדף.'
            );
        }
        return null;
    }
    
    try {
        const config = window.INFO_SUMMARY_CONFIGS['portfolio-state-page'];
        const stats = await window.InfoSummarySystem.calculateStatsFromData(trades, config.stats);
        
        // Get portfolio data from snapshot (more accurate than calculating from trades)
        let finalCashBalance = totalCashBalance;
        let finalPortfolioValue = null;
        let finalRealizedPL = null;
        let finalUnrealizedPL = null;
        let finalTotalPL = null;
        
        // Use snapshot data if available (more accurate)
        if (currentSnapshot) {
            // Cash balance from snapshot
            if (currentSnapshot.cash_balance !== null && currentSnapshot.cash_balance !== undefined) {
                finalCashBalance = currentSnapshot.cash_balance;
            }
            
            // Portfolio value from snapshot
            if (currentSnapshot.total_value !== null && currentSnapshot.total_value !== undefined) {
                finalPortfolioValue = currentSnapshot.total_value;
            }
            
            // P/L from snapshot (more accurate than calculating from trades)
            if (currentSnapshot.total_realized_pl !== null && currentSnapshot.total_realized_pl !== undefined) {
                finalRealizedPL = currentSnapshot.total_realized_pl;
            }
            if (currentSnapshot.total_unrealized_pl !== null && currentSnapshot.total_unrealized_pl !== undefined) {
                finalUnrealizedPL = currentSnapshot.total_unrealized_pl;
            }
            
            // Calculate total P/L from snapshot data
            if (finalRealizedPL !== null && finalUnrealizedPL !== null) {
                finalTotalPL = finalRealizedPL + finalUnrealizedPL;
            } else if (finalRealizedPL !== null) {
                finalTotalPL = finalRealizedPL;
            } else if (finalUnrealizedPL !== null) {
                finalTotalPL = finalUnrealizedPL;
            }
        }
        
        // Return combined data: InfoSummarySystem stats + snapshot data
        return {
            ...stats,
            total_cash_balance: finalCashBalance,
            cash_balance_by_account: Object.values(cashBalanceByAccount),
            total_portfolio_value: finalPortfolioValue,
            total_realized_pl: finalRealizedPL,
            total_unrealized_pl: finalUnrealizedPL,
            total_pl: finalTotalPL,
            open_positions_count: stats.open_positions_count !== null && stats.open_positions_count !== undefined ? stats.open_positions_count : null,
            positions_count_by_account: Object.values(positionsCountByAccount)
        };
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('Failed to calculate summary using InfoSummarySystem', { error, page: 'portfolio-state-page' });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError(
                'שגיאה בחישוב סיכום',
                'שגיאה בחישוב סיכום נתוני תיק. נא לנסות שוב או ליצור קשר עם התמיכה.'
            );
        }
        return null;
    }
}

// Render trades table row (for UnifiedTableSystem)
function renderTradeRow(trade) {
        // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך SERVICES package
        const renderStatus = window.FieldRendererService.renderStatus(trade.status, 'trade');
        const renderType = window.FieldRendererService.renderType(trade.investment_type);
        const renderSide = window.FieldRendererService.renderSide(trade.side);
        
        const renderAmount = (value, currency = '$') => {
            return window.FieldRendererService.renderAmount(value, currency, 2, true);
        };
        
        const renderNumericValue = (value, suffix = '%', showSign = true) => {
            return window.FieldRendererService.renderNumericValue(value, suffix, showSign);
        };
        
        const formatDate = (dateStr) => {
            if (!dateStr) return '-';
            return window.FieldRendererService.renderDate(dateStr, false);
        };
        
    return `
        <tr>
            <td><strong>${trade.ticker_symbol || 'טיקר לא ידוע'}</strong></td>
            <!-- 
                "לא זמין" מוצג רק אחרי שניסינו לטעון מהספק החיצוני ונכשלנו.
                אם הנתונים עדיין לא נטענו, זה אומר שהטעינה מהספק החיצוני נכשלה
                או שהטיקר לא קיים במערכת החיצונית.
            -->
            <td>${trade.current_price !== null && trade.current_price !== undefined 
                ? renderAmount(trade.current_price) 
                : '<span class="text-muted" title="נתוני מחיר לא זמינים - ניסינו לטעון מהספק החיצוני ונכשלנו">לא זמין</span>'}</td>
            <td>${trade.daily_change !== null && trade.daily_change !== undefined 
                ? renderNumericValue(trade.daily_change, '%') 
                : '<span class="text-muted" title="נתוני שינוי יומי לא זמינים - ניסינו לטעון מהספק החיצוני ונכשלנו">לא זמין</span>'}</td>
            <td>${trade.position_quantity !== null && trade.position_quantity !== undefined 
                ? trade.position_quantity 
                : '<span class="text-muted" title="נתוני כמות לא זמינים">לא זמין</span>'}</td>
            <td>${trade.position_pl_percent !== null && trade.position_pl_percent !== undefined 
                ? renderNumericValue(trade.position_pl_percent, '%') 
                : '<span class="text-muted" title="נתוני P/L באחוזים לא זמינים - ניסינו לטעון מהספק החיצוני ונכשלנו">לא זמין</span>'}</td>
            <td>${trade.position_pl_value !== null && trade.position_pl_value !== undefined 
                ? renderNumericValue(trade.position_pl_value, '$') 
                : '<span class="text-muted" title="נתוני P/L בערך לא זמינים - ניסינו לטעון מהספק החיצוני ונכשלנו">לא זמין</span>'}</td>
            <td>${renderStatus}</td>
            <td>${renderType}</td>
            <td>${renderSide}</td>
            <td>${trade.account_name || `Account #${trade.trading_account_id}`}</td>
            <td>${formatDate(trade.created_at)}</td>
            <td>${formatDate(trade.closed_at)}</td>
            <td class="col-actions actions-cell" data-entity-id="${trade.id}" data-entity-type="trade" data-status="${trade.status || 'open'}">
                ${(() => {
                  if (!window.createActionsMenu) return '<!-- Actions menu not available -->';
                  const buttons = [];
                  buttons.push({ type: 'VIEW', onclick: `window.showEntityDetails('trade', ${trade.id}, { mode: 'view' })`, title: 'צפה בפרטים' });
                  buttons.push({ type: 'LINK', onclick: `viewLinkedItemsForTrade(${trade.id})`, title: 'אובייקטים מקושרים' });
                  buttons.push({ type: 'EDIT', onclick: `editTradeRecord('${trade.id}')`, title: 'ערוך' });
                  if (trade.status === 'closed' || trade.status === 'cancelled') {
                    buttons.push({ type: 'REACTIVATE', onclick: `restoreTrade('${trade.id}')`, title: 'שיחזר' });
                  } else {
                    buttons.push({ type: 'CANCEL', onclick: `cancelTradeRecord('${trade.id}')`, title: 'בטל' });
                  }
                  // Note: showDelete: false - so no delete button
                  return window.createActionsMenu(buttons) || '';
                })()}
            </td>
        </tr>
    `;
}

/**
 * Update trades table using UnifiedTableSystem (general system)
 * REQUIRED: UnifiedTableSystem must be available, no fallback
 */
function updateTradesTable() {
    if (window.Logger) {
        window.Logger.info('🔄 updateTradesTable called', { 
            filteredTradesCount: filteredTrades?.length || 0,
            hasUnifiedTableSystem: !!window.UnifiedTableSystem,
            hasRegistry: !!(window.UnifiedTableSystem && window.UnifiedTableSystem.registry),
            page: 'portfolio-state-page' 
        });
    }
    
    // Use UnifiedTableSystem (general system) - REQUIRED, no fallback
    if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
        if (window.Logger) {
            window.Logger.error('UnifiedTableSystem not available for updateTradesTable', { 
                hasUnifiedTableSystem: !!window.UnifiedTableSystem,
                hasRegistry: !!(window.UnifiedTableSystem && window.UnifiedTableSystem.registry),
                page: 'portfolio-state-page' 
            });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError(
                'שגיאה בעדכון טבלה',
                'מערכת טבלאות מאוחדת לא זמינה. נא לרענן את הדף.'
            );
        }
        return;
    }
    
    // Get table config from registry
    const tableConfig = window.UnifiedTableSystem.registry.getConfig('portfolio-trades');
    if (!tableConfig) {
        if (window.Logger) {
            window.Logger.error('Table config not found for portfolio-trades', { page: 'portfolio-state-page' });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError(
                'שגיאה בעדכון טבלה',
                'תצורת טבלה לא נמצאה. נא לרענן את הדף.'
            );
        }
        return;
    }
    
    // Use registered updateFunction if available
    if (tableConfig.updateFunction) {
        try {
            if (window.Logger) {
                window.Logger.info('✅ Calling registered updateFunction', { 
                    tradesCount: filteredTrades?.length || 0,
                    page: 'portfolio-state-page' 
                });
            }
            tableConfig.updateFunction(filteredTrades);
            // Update summary after rendering (async, but don't block)
            updateTradesSummary(filteredTrades).catch(err => {
                if (window.Logger) {
                    window.Logger.warn('Failed to update trades summary', { error: err, page: 'portfolio-state-page' });
                }
            });
            if (window.Logger) {
                window.Logger.info('✅ Trades table updated via registered updateFunction', { tradesCount: filteredTrades.length, page: 'portfolio-state-page' });
            }
            return;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error calling registered updateFunction', { error: error.message, stack: error.stack, page: 'portfolio-state-page' });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                    'שגיאה בעדכון טבלה',
                    'שגיאה בעדכון טבלת טריידים. נא לנסות שוב.'
                );
            }
            return;
        }
    }
    
    // Try renderer.render as alternative
    if (window.UnifiedTableSystem.renderer) {
        try {
            if (window.Logger) {
                window.Logger.info('✅ Using UnifiedTableSystem.renderer.render', { 
                    tradesCount: filteredTrades?.length || 0,
                    page: 'portfolio-state-page' 
                });
            }
            window.UnifiedTableSystem.renderer.render('portfolio-trades', filteredTrades);
            // Update summary after rendering (async, but don't block)
            updateTradesSummary(filteredTrades).catch(err => {
                if (window.Logger) {
                    window.Logger.warn('Failed to update trades summary', { error: err, page: 'portfolio-state-page' });
                }
            });
            return;
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('❌ Error rendering table via UnifiedTableSystem.renderer', { error: error.message, stack: error.stack, page: 'portfolio-state-page' });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                    'שגיאה בעדכון טבלה',
                    'שגיאה בעדכון טבלת טריידים. נא לנסות שוב.'
                );
            }
            return;
        }
    }
    
    // If we reach here, neither updateFunction nor renderer is available
    if (window.Logger) {
        window.Logger.error('❌ Neither updateFunction nor renderer available for portfolio-trades table', { page: 'portfolio-state-page' });
    }
    if (window.NotificationSystem) {
        window.NotificationSystem.showError(
            'שגיאה בעדכון טבלה',
            'לא ניתן לעדכן את טבלת טריידים. נא לרענן את הדף.'
        );
    }
}

/**
 * Update trades summary using InfoSummarySystem (general system)
 * REQUIRED: InfoSummarySystem must be available, no fallback
 * 
 * @param {Array} trades - Array of trades
 */
async function updateTradesSummary(trades) {
    // Use InfoSummarySystem (general system) - REQUIRED, no fallback
    if (!window.InfoSummarySystem || !window.INFO_SUMMARY_CONFIGS?.['portfolio-state-page']) {
        if (window.Logger) {
            window.Logger.error('InfoSummarySystem not available for updateTradesSummary', { page: 'portfolio-state-page' });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError(
                'שגיאה בעדכון סיכום',
                'מערכת חישוב סיכום לא זמינה. נא לרענן את הדף.'
            );
        }
        return;
    }
    
    try {
        const config = window.INFO_SUMMARY_CONFIGS['portfolio-state-page'];
        const container = document.getElementById(config.containerId);
        if (!container) {
            if (window.Logger) {
                window.Logger.warn('Summary container not found', { containerId: config.containerId, page: 'portfolio-state-page' });
            }
            return;
        }

        // #region agent log - PORTFOLIO_RENDERING
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'portfolio-state-investigation',
            hypothesisId: 'PORTFOLIO_RENDERING',
            location: 'portfolio-state.js:updateTradesSummary-calculateAndRender',
            message: 'Calling InfoSummarySystem.calculateAndRender for portfolio state',
            data: {
              tradesLength: trades ? trades.length : 0,
              configStatsCount: config.stats ? config.stats.length : 0,
              configStats: config.stats,
              containerId: config.containerId,
              containerExists: document.getElementById(config.containerId) ? true : false
            },
            timestamp: Date.now()
          })
        }).catch(() => {});
        // #endregion

        await window.InfoSummarySystem.calculateAndRender(trades, config);
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('Failed to update trades summary via InfoSummarySystem', { error, page: 'portfolio-state-page' });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError(
                'שגיאה בעדכון סיכום',
                'שגיאה בעדכון סיכום טריידים. נא לנסות שוב.'
            );
        }
    }
}

// Update summary cards
async function updateSummaryCards(data) {
    // Validate data exists - no fallback values
    if (!data) {
        if (window.NotificationSystem) {
            window.NotificationSystem.showError(
                'נתונים לא זמינים',
                'נתוני סיכום תיק לא זמינים. נא לבדוק שיש נתונים במערכת.'
            );
        }
        // Show "לא זמין" in all cards
        const allCards = ['total-cash-balance', 'cash-balance-total', 'total-portfolio-value', 'total-pl', 'total-pl-detail', 'total-positions-count', 'positions-total'];
        allCards.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'לא זמין';
        });
        return;
    }
    
    // Cash balance - using FieldRendererService
    if (window.FieldRendererService) {
        const totalCashEl = document.getElementById('total-cash-balance');
        const cashBalanceTotalEl = document.getElementById('cash-balance-total');
        if (totalCashEl) {
            if (data.total_cash_balance !== null && data.total_cash_balance !== undefined) {
            totalCashEl.innerHTML = window.FieldRendererService.renderAmount(data.total_cash_balance, '$', 0, false);
            } else {
                totalCashEl.textContent = 'לא זמין';
                if (window.NotificationSystem) {
                    window.NotificationSystem.showError(
                        'נתונים לא זמינים',
                        'נתוני יתרות מזומן לא זמינים. נא לבדוק שיש נתונים במערכת.'
                    );
                }
            }
        }
        if (cashBalanceTotalEl) {
            if (data.total_cash_balance !== null && data.total_cash_balance !== undefined) {
            cashBalanceTotalEl.innerHTML = window.FieldRendererService.renderAmount(data.total_cash_balance, '$', 0, false);
            } else {
                cashBalanceTotalEl.textContent = 'לא זמין';
            }
        }
    } else {
        // Fallback if FieldRendererService not available
        const totalCashBalanceEl = document.getElementById('total-cash-balance');
        const cashBalanceTotalEl2 = document.getElementById('cash-balance-total');
        if (totalCashBalanceEl) {
            if (data.total_cash_balance !== null && data.total_cash_balance !== undefined) {
                if (window.FieldRendererService?.renderAmount) {
                    totalCashBalanceEl.innerHTML = window.FieldRendererService.renderAmount(data.total_cash_balance, '$', 0, false);
                } else {
                    totalCashBalanceEl.textContent = 'לא זמין';
                }
            } else {
                totalCashBalanceEl.textContent = 'לא זמין';
            }
        }
        if (cashBalanceTotalEl2) {
            if (data.total_cash_balance !== null && data.total_cash_balance !== undefined) {
                if (window.FieldRendererService?.renderAmount) {
                    cashBalanceTotalEl2.innerHTML = window.FieldRendererService.renderAmount(data.total_cash_balance, '$', 0, false);
                } else {
                    cashBalanceTotalEl2.textContent = 'לא זמין';
                }
            } else {
                cashBalanceTotalEl2.textContent = 'לא זמין';
            }
        }
    }
    
    // Cash balance by account - group by account name to avoid duplicates
    const cashByAccount = document.getElementById('cash-balance-by-account');
    if (cashByAccount && data.cash_balance_by_account) {
        cashByAccount.textContent = '';
        // Group accounts by name (sum balances for accounts with same name)
        const accountsByName = {};
        data.cash_balance_by_account.forEach(acc => {
            const accountName = acc.account_name || `Account #${acc.account_id}`;
            if (!accountsByName[accountName]) {
                accountsByName[accountName] = {
                    account_name: accountName,
                    balance: 0,
                    account_ids: []
                };
            }
            accountsByName[accountName].balance += (acc.balance || 0);
            accountsByName[accountName].account_ids.push(acc.account_id);
        });
        
        // Display grouped accounts
        Object.values(accountsByName).forEach(acc => {
            const div = document.createElement('div');
            div.className = 'd-flex justify-content-between mb-1 text-small';
            const span1 = document.createElement('span');
            // Show account name with ID count if multiple accounts with same name
            const displayName = acc.account_ids.length > 1 
                ? `${acc.account_name} (${acc.account_ids.length})`
                : acc.account_name;
            span1.textContent = `${displayName}:`;
            const span2 = document.createElement('span');
            span2.innerHTML = window.FieldRendererService.renderAmount(acc.balance, '$', 0, false);
            div.appendChild(span1);
            div.appendChild(span2);
            cashByAccount.appendChild(div);
        });
    }
    
    // Portfolio value - using FieldRendererService
    const portfolioValueEl = document.getElementById('total-portfolio-value');
    if (portfolioValueEl) {
        if (data.total_portfolio_value !== null && data.total_portfolio_value !== undefined) {
        portfolioValueEl.innerHTML = window.FieldRendererService.renderAmount(data.total_portfolio_value, '$', 0, false);
        } else {
            portfolioValueEl.textContent = 'לא זמין';
            if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                    'נתונים לא זמינים',
                    'נתוני שווי תיק לא זמינים. נא לבדוק שיש נתונים במערכת.'
                );
            }
        }
    }
    
    // P/L - using FieldRendererService
    const totalPlEl = document.getElementById('total-pl');
    const totalPlDetailEl = document.getElementById('total-pl-detail');
    const realizedPlEl = document.getElementById('realized-pl');
    const unrealizedPlEl = document.getElementById('unrealized-pl');
    
    if (totalPlEl) {
        if (data.total_pl !== null && data.total_pl !== undefined) {
        totalPlEl.innerHTML = window.FieldRendererService.renderAmount(data.total_pl, '$', 0, true);
        } else {
            totalPlEl.textContent = 'לא זמין';
        }
    }
    if (totalPlDetailEl) {
        if (data.total_pl !== null && data.total_pl !== undefined) {
        totalPlDetailEl.innerHTML = window.FieldRendererService.renderAmount(data.total_pl, '$', 0, true);
        } else {
            totalPlDetailEl.textContent = 'לא זמין';
        }
    }
    if (realizedPlEl) {
        if (data.total_realized_pl !== null && data.total_realized_pl !== undefined) {
        realizedPlEl.innerHTML = window.FieldRendererService.renderAmount(data.total_realized_pl, '$', 0, true);
        } else {
            realizedPlEl.textContent = 'לא זמין';
        }
    }
    if (unrealizedPlEl) {
        if (data.total_unrealized_pl !== null && data.total_unrealized_pl !== undefined) {
        unrealizedPlEl.innerHTML = window.FieldRendererService.renderAmount(data.total_unrealized_pl, '$', 0, true);
        } else {
            unrealizedPlEl.textContent = 'לא זמין';
        }
    }
    
    // Calculate P/L percentage with zero-division check
    // No fallback values - show error if data not available
    let plPercent = null;
    if (data.total_portfolio_value !== null && data.total_portfolio_value !== undefined && 
        data.total_pl !== null && data.total_pl !== undefined) {
    const denominator = data.total_portfolio_value - data.total_pl;
    if (denominator === 0 || !denominator || isNaN(denominator)) {
            // If denominator is zero and total_pl is also zero, show null (not available)
            plPercent = null;
    } else {
        plPercent = ((data.total_pl / denominator) * 100).toFixed(1);
        }
    }
    
    // Display P/L percentage using FieldRendererService
    const plPercentEl = document.getElementById('pl-percentage');
    if (plPercentEl) {
        if (plPercent === null || plPercent === undefined) {
            // No data available - show "לא זמין"
            plPercentEl.innerHTML = '';
            const div = document.createElement('div');
            div.className = 'numeric-value-zero';
            div.textContent = 'לא זמין';
            plPercentEl.appendChild(div);
    } else {
        const plPercentNum = parseFloat(plPercent);
            if (window.FieldRendererService) {
                const renderedValue = window.FieldRendererService.renderNumericValue(plPercentNum, '%', true);
                plPercentEl.innerHTML = `(${renderedValue})`;
            } else {
                // Fallback if FieldRendererService not available
                plPercentEl.textContent = `(${plPercentNum >= 0 ? '+' : ''}${plPercent}%)`;
                // שימוש במערכת המרכזית לצבעים מספריים
                const getNumericColorFn = (typeof window.getNumericValueColor === 'function') ? window.getNumericValueColor : null;
                const numericColor = getNumericColorFn ? getNumericColorFn(plPercentNum, 'medium') : '';
                if (numericColor) {
                    plPercentEl.style.color = numericColor;
                }
            }
        }
    }
    
    // Positions count - no fallback values
    const positionsCountEl = document.getElementById('total-positions-count');
    const positionsTotalEl = document.getElementById('positions-total');
    if (positionsCountEl) {
        if (data.open_positions_count !== null && data.open_positions_count !== undefined) {
            positionsCountEl.textContent = data.open_positions_count;
        } else {
            positionsCountEl.textContent = 'לא זמין';
        }
    }
    if (positionsTotalEl) {
        if (data.open_positions_count !== null && data.open_positions_count !== undefined) {
            positionsTotalEl.textContent = data.open_positions_count;
        } else {
            positionsTotalEl.textContent = 'לא זמין';
        }
    }
    
    // Positions by account
    const positionsByAccount = document.getElementById('positions-by-account');
    if (positionsByAccount && data.positions_count_by_account) {
        positionsByAccount.textContent = '';
        // Group positions by account name to avoid duplicates
        const positionsByName = {};
        data.positions_count_by_account.forEach(acc => {
            const accountName = allTradingAccounts.find(a => a.id === acc.account_id)?.name || `Account #${acc.account_id}`;
            if (!positionsByName[accountName]) {
                positionsByName[accountName] = {
                    account_name: accountName,
                    count: 0,
                    account_ids: []
                };
            }
            positionsByName[accountName].count += acc.count;
            positionsByName[accountName].account_ids.push(acc.account_id);
        });
        
        // Display grouped positions
        Object.values(positionsByName).forEach(acc => {
            const div = document.createElement('div');
            div.className = 'd-flex justify-content-between mb-1 text-small';
            const span1 = document.createElement('span');
            // Show account name with ID count if multiple accounts with same name
            const displayName = acc.account_ids.length > 1 
                ? `${acc.account_name} (${acc.account_ids.length})`
                : acc.account_name;
            span1.textContent = `${displayName}:`;
            const span2 = document.createElement('span');
            span2.textContent = acc.count;
            div.appendChild(span1);
            div.appendChild(span2);
            positionsByAccount.appendChild(div);
        });
    }
    
    // Accounts Summary Table (in expanded view)
    const accountsTableBody = document.getElementById('accounts-summary-table-body');
    if (accountsTableBody && currentSnapshot && currentSnapshot.positions) {
        accountsTableBody.textContent = '';
        
        // Group positions by account and calculate totals
        // CRITICAL: Use trading_account_id as primary key to ensure unique accounts
        // account_id might be null/undefined, but trading_account_id should always exist
        const accountsData = {};
        
        currentSnapshot.positions.forEach(position => {
            // Use trading_account_id as primary key (always exists from Backend)
            const accountId = position.trading_account_id || position.account_id;
            
            // Skip if accountId is invalid
            if (!accountId || accountId === null || accountId === undefined) {
                if (window.Logger) {
                    window.Logger.warn('Position missing account_id and trading_account_id', { 
                        position, 
                        page: 'portfolio-state-page' 
                    });
                }
                return;
            }
            
            // Initialize account data if not exists
            if (!accountsData[accountId]) {
                // Get account name from position or lookup
                const accountName = position.account_name || 
                                  allTradingAccounts.find(a => a.id === accountId)?.name || 
                                  `Account #${accountId}`;
                
                accountsData[accountId] = {
                    account_id: accountId,
                    account_name: accountName,
                    cash_balance: null,
                    realized_pl: 0,
                    unrealized_pl: 0,
                    positions_count: 0
                };
            }
            
            // Sum P/L values for this position
            if (position.realized_pl !== null && position.realized_pl !== undefined) {
                accountsData[accountId].realized_pl += position.realized_pl;
            }
            if (position.unrealized_pl !== null && position.unrealized_pl !== undefined) {
                accountsData[accountId].unrealized_pl += position.unrealized_pl;
            }
            accountsData[accountId].positions_count++;
        });
        
        // Get cash balances for each account
        const accountIds = Object.keys(accountsData).map(id => parseInt(id));
        if (accountIds.length > 0) {
            const balancePromises = accountIds.map(async (accountId) => {
                try {
                    const response = await fetch(`/api/account-activity/${accountId}/balances`, {
                        credentials: 'include', // Include cookies for session-based auth
                    });
                    if (response.ok) {
                        const result = await response.json();
                        if (result.status === 'success' && result.data?.base_currency_total !== null && result.data?.base_currency_total !== undefined) {
                            accountsData[accountId].cash_balance = result.data.base_currency_total;
                        }
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn(`Failed to load balance for account ${accountId}`, { page: 'portfolio-state-page', error: error.message });
                    }
                }
            });
            await Promise.all(balancePromises);
        }
        
        // Calculate totals
        let totalCash = 0;
        let totalRealizedPL = 0;
        let totalUnrealizedPL = 0;
        let totalPositions = 0;
        
        // Render table rows
        Object.values(accountsData).forEach(acc => {
            const row = document.createElement('tr');
            
            // Account name
            const nameCell = document.createElement('td');
            nameCell.textContent = acc.account_name;
            row.appendChild(nameCell);
            
            // Cash balance
            const cashCell = document.createElement('td');
            cashCell.className = 'text-end';
            if (acc.cash_balance !== null && acc.cash_balance !== undefined) {
                cashCell.innerHTML = window.FieldRendererService?.renderAmount(acc.cash_balance, '$', 0, false) || `$${acc.cash_balance.toFixed(2)}`;
                totalCash += acc.cash_balance;
            } else {
                cashCell.textContent = 'לא זמין';
            }
            row.appendChild(cashCell);
            
            // Realized P/L
            const realizedCell = document.createElement('td');
            realizedCell.className = 'text-end';
            if (acc.realized_pl !== 0) {
                realizedCell.innerHTML = window.FieldRendererService?.renderAmount(acc.realized_pl, '$', 0, true) || `$${acc.realized_pl.toFixed(2)}`;
                totalRealizedPL += acc.realized_pl;
            } else {
                realizedCell.textContent = '-';
            }
            row.appendChild(realizedCell);
            
            // Unrealized P/L
            const unrealizedCell = document.createElement('td');
            unrealizedCell.className = 'text-end';
            if (acc.unrealized_pl !== 0) {
                unrealizedCell.innerHTML = window.FieldRendererService?.renderAmount(acc.unrealized_pl, '$', 0, true) || `$${acc.unrealized_pl.toFixed(2)}`;
                totalUnrealizedPL += acc.unrealized_pl;
            } else {
                unrealizedCell.textContent = '-';
            }
            row.appendChild(unrealizedCell);
            
            // Total P/L
            const totalPLCell = document.createElement('td');
            totalPLCell.className = 'text-end';
            const totalPL = acc.realized_pl + acc.unrealized_pl;
            if (totalPL !== 0) {
                totalPLCell.innerHTML = window.FieldRendererService?.renderAmount(totalPL, '$', 0, true) || `$${totalPL.toFixed(2)}`;
            } else {
                totalPLCell.textContent = '-';
            }
            row.appendChild(totalPLCell);
            
            // Positions count
            const positionsCell = document.createElement('td');
            positionsCell.className = 'text-end';
            positionsCell.textContent = acc.positions_count;
            totalPositions += acc.positions_count;
            row.appendChild(positionsCell);
            
            accountsTableBody.appendChild(row);
        });
        
        // Update totals row
        const totalCashEl = document.getElementById('accounts-total-cash');
        const totalRealizedPLEl = document.getElementById('accounts-total-realized-pl');
        const totalUnrealizedPLEl = document.getElementById('accounts-total-unrealized-pl');
        const totalPLEl = document.getElementById('accounts-total-pl');
        const totalPositionsEl = document.getElementById('accounts-total-positions');
        
        if (totalCashEl) {
            if (totalCash !== 0) {
                totalCashEl.innerHTML = window.FieldRendererService?.renderAmount(totalCash, '$', 0, false) || `$${totalCash.toFixed(2)}`;
            } else {
                totalCashEl.textContent = '-';
            }
        }
        if (totalRealizedPLEl) {
            if (totalRealizedPL !== 0) {
                totalRealizedPLEl.innerHTML = window.FieldRendererService?.renderAmount(totalRealizedPL, '$', 0, true) || `$${totalRealizedPL.toFixed(2)}`;
            } else {
                totalRealizedPLEl.textContent = '-';
            }
        }
        if (totalUnrealizedPLEl) {
            if (totalUnrealizedPL !== 0) {
                totalUnrealizedPLEl.innerHTML = window.FieldRendererService?.renderAmount(totalUnrealizedPL, '$', 0, true) || `$${totalUnrealizedPL.toFixed(2)}`;
            } else {
                totalUnrealizedPLEl.textContent = '-';
            }
        }
        if (totalPLEl) {
            const totalPL = totalRealizedPL + totalUnrealizedPL;
            if (totalPL !== 0) {
                totalPLEl.innerHTML = window.FieldRendererService?.renderAmount(totalPL, '$', 0, true) || `$${totalPL.toFixed(2)}`;
            } else {
                totalPLEl.textContent = '-';
            }
        }
        if (totalPositionsEl) {
            totalPositionsEl.textContent = totalPositions;
        }
    }
}

// Format currency - use FieldRendererService instead
// Removed formatCurrency - use FieldRendererService.renderAmount() directly (general system)

// Get lighter color for percentage series
function getLighterColor(color, amount = 0.3) {
    if (!color) return 'rgba(128, 128, 128, 0.5)';
    const hex = color.replace('#', '');
    if (hex.length !== 6) return color;
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${amount})`;
}

// Set chart period
function setChartPeriod(period, chartType, event = null) {
    currentPeriod[chartType] = period;
    
    // Update button states - find the button that was clicked
    let activeButton = null;
    
    // Try to get button from event if provided
    if (event && event.target) {
        activeButton = event.target.closest('button');
    }
    
    // If no button from event, find it by the period value in data-onclick
    if (!activeButton) {
        const buttons = document.querySelectorAll(`[data-onclick*="setChartPeriod('${period}'"]`);
        activeButton = buttons.length > 0 ? buttons[0] : null;
    }
    
    // Remove active class from all period buttons
    document.querySelectorAll(`[data-onclick*="setChartPeriod"]`).forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to the clicked button
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Reload unified chart
    initUnifiedPortfolioChart();
}

// Setup lazy loading for chart using Intersection Observer
// Also ensures chart loads even if not immediately visible (for automated tests)
function setupLazyChartLoading() {
    const container = document.getElementById('unified-portfolio-chart-container');
    if (!container) {
        if (window.Logger) {
            window.Logger.warn('Chart container not found for lazy loading setup', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    // Check if chart is already initialized
    if (unifiedPortfolioChart) {
        if (window.Logger) {
            window.Logger.debug('Chart already initialized, skipping lazy loading setup', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    // Check if container is already visible (for automated tests or immediate visibility)
    const rect = container.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
        // Container is already visible - initialize immediately
        if (window.Logger) {
            window.Logger.info('Chart container is visible, initializing immediately', { page: 'portfolio-state-page' });
        }
        initUnifiedPortfolioChart();
        return;
    }
    
    // Container not visible - use Intersection Observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Chart container is visible - initialize chart
                if (window.Logger) {
                    window.Logger.info('Chart container became visible, initializing chart', { page: 'portfolio-state-page' });
                }
                initUnifiedPortfolioChart();
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '50px' // Start loading 50px before container is visible
    });
    
    observer.observe(container);
    
    // Fallback: If chart hasn't loaded after 3 seconds, load it anyway (for automated tests)
    setTimeout(() => {
        if (!unifiedPortfolioChart) {
            if (window.Logger) {
                window.Logger.info('Chart not loaded after 3 seconds, initializing anyway (fallback for automated tests)', { page: 'portfolio-state-page' });
            }
            initUnifiedPortfolioChart();
        }
    }, 3000);
}

// Initialize Unified Portfolio Chart (combines all series into one chart)
async function initUnifiedPortfolioChart() {
    const container = document.getElementById('unified-portfolio-chart-container');
    if (!container) {
        if (window.Logger) {
            window.Logger.warn('Unified portfolio chart container not found', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    // Check if chart is already initialized
    if (unifiedPortfolioChart) {
        if (window.Logger) {
            window.Logger.debug('Chart already initialized, skipping', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    // Wait for TradingView to be available
    let retries = 0;
    const maxRetries = 100;
    while ((typeof window.TradingViewChartAdapter === 'undefined' || 
            (typeof window.LightweightCharts === 'undefined' && 
             typeof window.lightweightCharts === 'undefined')) && 
           retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
    }
    
    if (typeof window.TradingViewChartAdapter === 'undefined' || 
        (typeof window.LightweightCharts === 'undefined' && 
         typeof window.lightweightCharts === 'undefined')) {
        if (window.Logger) {
            window.Logger.error('TradingView Chart Adapter or LightweightCharts not available after timeout', { page: 'portfolio-state-page' });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה', 'ספריית הגרפים לא זמינה. נא לרענן את הדף.');
        }
        return;
    }
    
    // Remove loading indicator
    const loadingIndicator = container.querySelector('.chart-loading');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
    
    // Dispose existing chart if it exists
    if (unifiedPortfolioChart) {
        try {
            unifiedPortfolioChart.remove();
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Error disposing existing unified chart', { page: 'portfolio-state-page', error: error.message });
            }
        }
        unifiedPortfolioChart = null;
    }
    
    // Get container dimensions
    const containerWidth = container.clientWidth || container.offsetWidth || 800;
    const containerHeight = container.clientHeight || container.offsetHeight || 500;
    
    // Create chart
    try {
        unifiedPortfolioChart = window.TradingViewChartAdapter.createChart(container, {
            width: containerWidth,
            height: containerHeight,
            layout: {
                background: { type: 'solid', color: 'transparent' },
                textColor: window.currentPreferences?.chart_text_color || '#333',
            },
            grid: {
                vertLines: { visible: true, color: 'rgba(0, 0, 0, 0.1)' },
                horzLines: { visible: true, color: 'rgba(0, 0, 0, 0.1)' },
            },
            crosshair: {
                mode: 1, // Normal mode
            },
            rightPriceScale: {
                visible: true,
                borderColor: 'rgba(0, 0, 0, 0.2)',
            },
            leftPriceScale: {
                visible: true,
                borderColor: 'rgba(0, 0, 0, 0.2)',
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(0, 0, 0, 0.2)',
            },
            title: 'מצב תיק - סקירה כללית',
        });
        
        // Create 6 series (all metrics)
        const colors = window.TradingViewTheme 
            ? window.TradingViewTheme.getChartColors() 
            : { 
                primary: '#26baac', 
                secondary: '#6c757d', 
                success: '#28a745', 
                warning: '#ffc107', 
                info: '#17a2b8',
                danger: '#dc3545'
            };
        
        // 1. שווי פוזיציות (total_value) - primary color, right scale
        unifiedChartSeries.positionsValue = window.TradingViewChartAdapter.addLineSeries(unifiedPortfolioChart, {
            color: colors.primary || '#26baac',
            lineWidth: 2,
            title: 'שווי פוזיציות',
            priceScaleId: 'right', // Use right scale for dollar values
        });
        
        // 2. ביצועי תיק (%) - secondary color, left scale (percentage)
        unifiedChartSeries.performance = window.TradingViewChartAdapter.addLineSeries(unifiedPortfolioChart, {
            color: colors.secondary || '#6c757d',
            lineWidth: 2,
            title: 'ביצועי תיק',
            priceScaleId: 'left', // Use left scale for percentages
            priceFormat: {
                type: 'percent',
                precision: 2,
                minMove: 0.01
            }
        });
        
        // 3. שווי תיק ($) - info color, right scale
        unifiedChartSeries.portfolioValue = window.TradingViewChartAdapter.addLineSeries(unifiedPortfolioChart, {
            color: colors.info || '#17a2b8',
            lineWidth: 2,
            title: 'שווי תיק',
            priceScaleId: 'right', // Use right scale for dollar values
        });
        
        // 4. P/L ממומש (realized_pl) - success color, right scale
        unifiedChartSeries.realizedPL = window.TradingViewChartAdapter.addLineSeries(unifiedPortfolioChart, {
            color: colors.success || '#28a745',
            lineWidth: 2,
            title: 'P/L ממומש',
            priceScaleId: 'right', // Use right scale for dollar values
        });
        
        // 5. P/L לא ממומש (unrealized_pl) - warning color, right scale
        unifiedChartSeries.unrealizedPL = window.TradingViewChartAdapter.addLineSeries(unifiedPortfolioChart, {
            color: colors.warning || '#ffc107',
            lineWidth: 2,
            title: 'P/L לא ממומש',
            priceScaleId: 'right', // Use right scale for dollar values
        });
        
        // 6. P/L כולל (total_pl) - danger color, right scale
        unifiedChartSeries.totalPL = window.TradingViewChartAdapter.addLineSeries(unifiedPortfolioChart, {
            color: colors.danger || '#dc3545',
            lineWidth: 2,
            title: 'P/L כולל',
            priceScaleId: 'right', // Use right scale for dollar values
        });
        
        // Load data
        await loadUnifiedChartData();
        
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('Error creating unified portfolio chart', { page: 'portfolio-state-page', error });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה', 'שגיאה ביצירת גרף מצב תיק. נא לנסות שוב.');
        }
    }
}

// Load data for unified chart
async function loadUnifiedChartData() {
    if (!unifiedPortfolioChart || !unifiedChartSeries.positionsValue || !unifiedChartSeries.performance || !unifiedChartSeries.portfolioValue) {
        if (window.Logger) {
            window.Logger.warn('Unified chart or series not available, skipping data load', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    try {
        const period = currentPeriod['both'] || 'month';
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date();
        const days = period === 'week' ? 7 : period === 'month' ? 30 : period === '3months' ? 90 : period === 'year' ? 365 : 30;
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        const accountId = getSelectedAccounts().length === 1 ? getSelectedAccounts()[0] : null;
        const series = await window.PortfolioStateData.loadSeries(accountId, startDateStr, endDate, {
            interval: 'day'
        });
        
        // Prepare data arrays for all 6 series
        const positionsValueData = [];      // שווי פוזיציות ($)
        const performanceData = [];        // ביצועי תיק (%)
        const portfolioValueData = [];     // שווי תיק ($) - כולל הפקדות/משיכות
        const realizedPLData = [];         // P/L ממומש ($)
        const unrealizedPLData = [];       // P/L לא ממומש ($)
        const totalPLData = [];            // P/L כולל ($)
        
        if (Array.isArray(series?.snapshots) && series.snapshots.length > 0) {
            // Get base snapshot for performance calculation (first snapshot)
            const baseSnapshot = series.snapshots[0];
            const basePL = (baseSnapshot?.total_pl !== null && baseSnapshot?.total_pl !== undefined) ? baseSnapshot.total_pl : 0;
            // Use total_value as base value, but if it's 0 or very small, use cash_balance + positions value
            let baseValue = (baseSnapshot?.total_value !== null && baseSnapshot?.total_value !== undefined) ? baseSnapshot.total_value : 0;
            if (baseValue < 0.01) {
                // Fallback: try to calculate from cash_balance if available
                const cashBalance = (baseSnapshot?.cash_balance !== null && baseSnapshot?.cash_balance !== undefined) ? baseSnapshot.cash_balance : 0;
                if (cashBalance > 0.01) {
                    baseValue = cashBalance;
                } else {
                    // Last resort: use 1 to avoid division by zero
                    baseValue = 1;
                }
            }
            
            series.snapshots.forEach(snapshot => {
                if (!snapshot) return;
                
                const dateValue = snapshot.snapshot_date || snapshot.date;
                if (!dateValue) return;
                
                const time = convertDateToChartFormat(dateValue);
                // CRITICAL: Strict validation - reject if time is null, undefined, or invalid
                if (!time || typeof time !== 'string' || time.trim() === '' || time === 'null' || time === 'undefined') {
                    if (window.Logger) {
                        window.Logger.warn('Invalid date format in snapshot', { dateValue, page: 'portfolio-state-page' });
                    }
                    return; // Skip this snapshot
                }
                
                const timeStr = time.trim();
                // Additional validation: ensure time is in correct format (YYYY-MM-DD)
                if (!/^\d{4}-\d{2}-\d{2}$/.test(timeStr)) {
                    if (window.Logger) {
                        window.Logger.warn('Invalid time format after conversion', { timeStr, dateValue, page: 'portfolio-state-page' });
                    }
                    return; // Skip this snapshot
                }
                
                // Helper function to safely extract numeric value
                const safeNumericValue = (value) => {
                    if (value === null || value === undefined) return null;
                    const num = Number(value);
                    if (isNaN(num) || !isFinite(num)) return null;
                    return num;
                };
                
                // 1. שווי פוזיציות (total_value) - $
                const positionsValue = safeNumericValue(snapshot.total_value);
                if (positionsValue !== null) {
                    positionsValueData.push({ time: timeStr, value: positionsValue });
                }
                
                // 2. ביצועי תיק (%) - P/L change relative to base portfolio value
                const currentPL = safeNumericValue(snapshot.total_pl) || 0;
                const plChange = currentPL - basePL;
                // Calculate performance: if baseValue is 0 or very small, use basePL as denominator
                let performancePercent = 0;
                if (baseValue > 0.01) {
                    performancePercent = (plChange / baseValue) * 100;
                } else if (basePL !== 0 && Math.abs(basePL) > 0.01) {
                    // Fallback: use basePL as denominator if baseValue is too small
                    performancePercent = (plChange / Math.abs(basePL)) * 100;
                } else {
                    // If both are 0 or very small, performance is 0
                    performancePercent = 0;
                }
                // Always add performance data point (even if 0) to ensure series is visible
                if (!isNaN(performancePercent) && isFinite(performancePercent)) {
                    performanceData.push({ time: timeStr, value: performancePercent });
                } else {
                    // Add 0 if calculation failed to ensure series has data
                    performanceData.push({ time: timeStr, value: 0 });
                }
                
                // 3. שווי תיק ($) - כולל הפקדות/משיכות (same as total_value)
                const portfolioValue = safeNumericValue(snapshot.total_value);
                if (portfolioValue !== null) {
                    portfolioValueData.push({ time: timeStr, value: portfolioValue });
                }
                
                // 4. P/L ממומש ($)
                const realizedPL = safeNumericValue(snapshot.total_realized_pl);
                if (realizedPL !== null) {
                    realizedPLData.push({ time: timeStr, value: realizedPL });
                }
                
                // 5. P/L לא ממומש ($)
                const unrealizedPL = safeNumericValue(snapshot.total_unrealized_pl);
                if (unrealizedPL !== null) {
                    unrealizedPLData.push({ time: timeStr, value: unrealizedPL });
                }
                
                // 6. P/L כולל ($)
                const totalPL = safeNumericValue(snapshot.total_pl);
                if (totalPL !== null) {
                    totalPLData.push({ time: timeStr, value: totalPL });
                }
            });
        }
        
        // CRITICAL: Filter valid data - must be extremely strict to prevent "Value is null" errors
        const filterValidData = (data) => {
            if (!Array.isArray(data)) return [];
            return data.filter(item => {
                // Strict validation - reject anything that could cause null errors
                if (item === null || item === undefined) return false;
                if (typeof item !== 'object') return false;
                if (!item.time || typeof item.time !== 'string' || item.time.trim() === '') return false;
                if (item.value === null || item.value === undefined) return false;
                if (typeof item.value !== 'number') return false;
                if (isNaN(item.value) || !isFinite(item.value)) return false;
                // Additional check: ensure time is valid format (YYYY-MM-DD or timestamp)
                const timeStr = item.time.trim();
                if (timeStr.length < 8) return false; // Minimum valid date format
                return true;
            }).map(item => {
                // Normalize data structure - ensure clean object
                return {
                    time: item.time.trim(),
                    value: Number(item.value)
                };
            });
        };
        
        const validPositionsValue = filterValidData(positionsValueData);
        const validPerformance = filterValidData(performanceData);
        const validPortfolioValue = filterValidData(portfolioValueData);
        const validRealizedPL = filterValidData(realizedPLData);
        const validUnrealizedPL = filterValidData(unrealizedPLData);
        const validTotalPL = filterValidData(totalPLData);
        
        // Log filtering results for debugging
        if (window.Logger) {
            window.Logger.debug('Chart data filtering results', {
                positionsValue: { original: positionsValueData.length, valid: validPositionsValue.length },
                performance: { original: performanceData.length, valid: validPerformance.length },
                portfolioValue: { original: portfolioValueData.length, valid: validPortfolioValue.length },
                realizedPL: { original: realizedPLData.length, valid: validRealizedPL.length },
                unrealizedPL: { original: unrealizedPLData.length, valid: validUnrealizedPL.length },
                totalPL: { original: totalPLData.length, valid: validTotalPL.length },
                page: 'portfolio-state-page'
            });
        }
        
        // CRITICAL: Final safety check - verify no null values before setData
        const finalSafetyCheck = (data, seriesName) => {
            if (!Array.isArray(data) || data.length === 0) return data;
            const safe = data.filter(item => {
                if (!item || typeof item !== 'object') return false;
                if (!item.time || typeof item.time !== 'string') return false;
                if (item.value === null || item.value === undefined) return false;
                if (typeof item.value !== 'number' || isNaN(item.value) || !isFinite(item.value)) return false;
                return true;
            });
            if (safe.length !== data.length && window.Logger) {
                window.Logger.warn(`Final safety check filtered ${data.length - safe.length} invalid items from ${seriesName}`, {
                    original: data.length,
                    safe: safe.length,
                    page: 'portfolio-state-page'
                });
            }
            return safe;
        };
        
        // Set data to all 6 series - only if series exist and data is valid
        try {
            if (unifiedChartSeries.positionsValue) {
                const safeData = finalSafetyCheck(validPositionsValue, 'positionsValue');
                if (safeData.length > 0) {
                    unifiedChartSeries.positionsValue.setData(safeData);
                }
            }
            if (unifiedChartSeries.performance) {
                const safeData = finalSafetyCheck(validPerformance, 'performance');
                if (safeData.length > 0) {
                    unifiedChartSeries.performance.setData(safeData);
                    if (window.Logger) {
                        window.Logger.info('✅ Performance series data set successfully', { 
                            count: safeData.length, 
                            sampleValues: safeData.slice(0, 3).map(d => d.value),
                            page: 'portfolio-state-page' 
                        });
                    }
                } else {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ Performance series has no valid data after filtering', { 
                            validPerformanceCount: validPerformance.length,
                            originalPerformanceCount: performanceData.length,
                            page: 'portfolio-state-page' 
                        });
                    }
                    // Even if no valid data, try to set empty array to ensure series exists
                    unifiedChartSeries.performance.setData([]);
                }
            } else {
                if (window.Logger) {
                    window.Logger.error('❌ Performance series not available - series was not created', { page: 'portfolio-state-page' });
                }
            }
            if (unifiedChartSeries.portfolioValue) {
                const safeData = finalSafetyCheck(validPortfolioValue, 'portfolioValue');
                if (safeData.length > 0) {
                    unifiedChartSeries.portfolioValue.setData(safeData);
                }
            }
            if (unifiedChartSeries.realizedPL) {
                const safeData = finalSafetyCheck(validRealizedPL, 'realizedPL');
                if (safeData.length > 0) {
                    unifiedChartSeries.realizedPL.setData(safeData);
                }
            }
            if (unifiedChartSeries.unrealizedPL) {
                const safeData = finalSafetyCheck(validUnrealizedPL, 'unrealizedPL');
                if (safeData.length > 0) {
                    unifiedChartSeries.unrealizedPL.setData(safeData);
                }
            }
            if (unifiedChartSeries.totalPL) {
                const safeData = finalSafetyCheck(validTotalPL, 'totalPL');
                if (safeData.length > 0) {
                    unifiedChartSeries.totalPL.setData(safeData);
                }
            }
            
            // CRITICAL: Fit content to show all data by default (zoom to full width)
            // Use setTimeout to ensure chart is fully rendered before fitting
            setTimeout(() => {
                if (unifiedPortfolioChart && typeof unifiedPortfolioChart.timeScale === 'function') {
                    try {
                        const timeScale = unifiedPortfolioChart.timeScale();
                        if (timeScale && typeof timeScale.fitContent === 'function') {
                            timeScale.fitContent();
                            if (window.Logger) {
                                window.Logger.debug('Chart fitted to content', { page: 'portfolio-state-page' });
                            }
                        }
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.warn('Error fitting content to chart', { page: 'portfolio-state-page', error: error.message });
                        }
                    }
                }
            }, 100);
            
            if (window.Logger) {
                window.Logger.info('✅ Unified chart data loaded', {
                    positionsValue: validPositionsValue.length,
                    performance: validPerformance.length,
                    portfolioValue: validPortfolioValue.length,
                    realizedPL: validRealizedPL.length,
                    unrealizedPL: validUnrealizedPL.length,
                    totalPL: validTotalPL.length,
                    page: 'portfolio-state-page'
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Error setting data to unified chart (chart may be disposed)', { page: 'portfolio-state-page', error: error.message });
            }
        }
        
    } catch (error) {
        if (error?.message?.includes('Authentication required') || error?.message?.includes('401')) {
            if (window.Logger) {
                window.Logger.warn('⚠️ Authentication required for unified chart data', { page: 'portfolio-state-page' });
            }
            return;
        }
        
        if (window.Logger) {
            window.Logger.error('Error loading unified chart data', { page: 'portfolio-state-page', error });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה', 'שגיאה בטעינת נתוני גרף מצב תיק.');
        }
    }
}

// Initialize Portfolio Performance Chart (DEPRECATED - use initUnifiedPortfolioChart)
async function initPortfolioPerformanceChart() {
    const container = document.getElementById('portfolio-performance-chart-container');
    if (!container) {
        if (window.Logger) {
            window.Logger.warn('Portfolio performance chart container not found', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    // Wait for TradingView to be available with better error handling
    let retries = 0;
    const maxRetries = 100; // Increased timeout for defer scripts
    while ((typeof window.TradingViewChartAdapter === 'undefined' || 
            (typeof window.LightweightCharts === 'undefined' && 
             typeof window.lightweightCharts === 'undefined')) && 
           retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
    }
    
    if (typeof window.TradingViewChartAdapter === 'undefined') {
        if (window.Logger) {
            const errorMsg = 'ספריית TradingView לא זמינה. נא לרענן את העמוד.';
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה בטעינת גרפים', errorMsg);
            }
            if (window.Logger) {
                window.Logger.error('❌ TradingViewChartAdapter not available', { page: 'portfolio-state-page', timeout: maxRetries * 50 });
            }
        }
        return;
    }
    
    if (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined') {
        if (window.Logger) {
            const errorMsg = 'ספריית LightweightCharts לא זמינה. נא לרענן את העמוד.';
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה בטעינת גרפים', errorMsg);
            }
            if (window.Logger) {
                window.Logger.error('❌ LightweightCharts library not available', { page: 'portfolio-state-page' });
            }
        }
        return;
    }
    
    // Destroy existing chart
    if (portfolioPerformanceChart && typeof window.TradingViewChartAdapter.destroyChart === 'function') {
        try {
            window.TradingViewChartAdapter.destroyChart(portfolioPerformanceChart);
        } catch (e) {
            if (window.Logger) {
                window.Logger.warn('Error destroying portfolio performance chart', { page: 'portfolio-state-page', error: e });
            }
        }
        portfolioPerformanceChart = null;
    }
    
    try {
        // Use secondary color (orange-red) for performance chart
        // שימוש במערכת המרכזית לצבע משני
        const secondaryColor = getCSSVariableValue('--secondary-color', 
            (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
            (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : '')
        );
        
        // Get wrapper for width calculation (if exists)
        const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
        const containerWidth = wrapper ? wrapper.clientWidth : (container.clientWidth || container.offsetWidth || 800);
        const containerHeight = container.clientHeight || container.offsetHeight || 200;
        
        if (containerWidth === 0 || containerHeight === 0) {
            if (window.Logger) {
                window.Logger.warn('Portfolio performance chart container has zero dimensions, waiting...', { page: 'portfolio-state-page' });
            }
            setTimeout(() => initPortfolioPerformanceChart(), 100);
            return;
        }
        
        portfolioPerformanceChart = window.TradingViewChartAdapter.createChart(container, {
            width: containerWidth,
            height: containerHeight,
            layout: {
                textColor: getCSSVariableValue('--text-color', '#212529'),
                background: { type: 'solid', color: getCSSVariableValue('--card-background', '#ffffff') }
            },
            grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false
            },
            rightPriceScale: {
                visible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1
                }
            },
            leftPriceScale: {
                visible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1
                }
            },
            crosshair: {
                mode: 1, // Normal mode - shows crosshair with tooltip
                vertLine: {
                    // Use centralized Color Scheme System - no hardcoded colors
                    color: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                           (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : ''),
                    width: 1,
                    style: 0,
                    // Use centralized Color Scheme System - no hardcoded colors
                    labelBackgroundColor: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                                         (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : '')
                },
                horzLine: {
                    // Use centralized Color Scheme System - no hardcoded colors
                    color: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                           (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : ''),
                    width: 1,
                    style: 0,
                    // Use centralized Color Scheme System - no hardcoded colors
                    labelBackgroundColor: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                                         (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : '')
                }
            }
        });
        
        // Remove loading indicator
        const loading1 = container.querySelector('.chart-loading');
        if (loading1) loading1.remove();
        
        // Performance series (percentage return - only one axis)
        const portfolioPerformanceSeries = window.TradingViewChartAdapter.addLineSeries(portfolioPerformanceChart, {
            color: secondaryColor,
            lineWidth: 2,
            title: 'ביצועי תיק (%)',
            priceScaleId: 'right',
            priceFormat: {
                type: 'percent',
                precision: 2,
                minMove: 0.01
            }
        });
        
        // Load performance data using PortfolioStateData service
        let performanceData = [];
        try {
            if (window.PortfolioStateData && typeof window.PortfolioStateData.loadSeries === 'function') {
                const period = currentPeriod['both'] || 'month';
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date();
                const days = period === 'week' ? 7 : period === 'month' ? 30 : period === '3months' ? 90 : period === 'year' ? 365 : 30;
                startDate.setDate(startDate.getDate() - days);
                const startDateStr = startDate.toISOString().split('T')[0];
                
                const accountId = getSelectedAccounts().length === 1 ? getSelectedAccounts()[0] : null;
                const series = await window.PortfolioStateData.loadSeries(accountId, startDateStr, endDate, {
                    interval: 'day'
                });
                
                // Transform series data to chart format
                // CRITICAL: Performance = P/L only (not value change including deposits/withdrawals)
                // Performance shows trading returns only, not account value changes
                // Formula: Performance % = (Current P/L - Base P/L) / Base Portfolio Value * 100
                // This shows how much P/L changed relative to the initial portfolio value
                
                if (window.Logger && series?.snapshots) {
                    window.Logger.info('📊 Raw series data for performance chart', { 
                        snapshotsCount: series.snapshots.length,
                        firstSnapshot: series.snapshots[0],
                        page: 'portfolio-state-page' 
                    });
                }
                
                performanceData = Array.isArray(series?.snapshots) ? series.snapshots.map((snapshot, index) => {
                    // CRITICAL: Validate snapshot exists and has required fields
                    if (!snapshot) {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Null snapshot at index', { index, page: 'portfolio-state-page' });
                        }
                        return null;
                    }
                    
                    // Get base values (first snapshot)
                    const baseSnapshot = series.snapshots[0];
                    if (!baseSnapshot) {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ No base snapshot', { page: 'portfolio-state-page' });
                        }
                        return null;
                    }
                    
                    const basePL = (baseSnapshot.total_pl !== null && baseSnapshot.total_pl !== undefined) ? baseSnapshot.total_pl : 0;
                    const baseValue = (baseSnapshot.total_value !== null && baseSnapshot.total_value !== undefined) ? baseSnapshot.total_value : 0;
                    
                    // Get current P/L - validate it's not null/undefined
                    const currentPL = (snapshot.total_pl !== null && snapshot.total_pl !== undefined) ? snapshot.total_pl : 0;
                    
                    // Calculate P/L change
                    const plChange = currentPL - basePL;
                    
                    // Calculate percentage: P/L change as % of initial portfolio value
                    // This shows performance (trading returns) independent of deposits/withdrawals
                    const percent = baseValue > 0 ? (plChange / baseValue) * 100 : 0;
                    
                    // Validate percent is a valid number
                    if (isNaN(percent) || !isFinite(percent)) {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Invalid percent calculated', { 
                                index, 
                                percent, 
                                baseValue, 
                                plChange, 
                                currentPL, 
                                basePL,
                                page: 'portfolio-state-page' 
                            });
                        }
                        return null;
                    }
                    
                    // Convert date to yyyy-mm-dd format for charts
                    const dateValue = snapshot.snapshot_date || snapshot.date;
                    if (!dateValue) {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ No date value in snapshot', { 
                                index, 
                                snapshot, 
                                page: 'portfolio-state-page' 
                            });
                        }
                        return null; // No date value
                    }
                    
                    const chartDate = convertDateToChartFormat(dateValue);
                    
                    // CRITICAL: Validate chartDate is a non-empty string
                    if (!chartDate || typeof chartDate !== 'string' || chartDate.trim() === '') {
                        if (window.Logger) {
                            window.Logger.warn('⚠️ Invalid chart date after conversion', { 
                                index, 
                                dateValue, 
                                chartDate, 
                                page: 'portfolio-state-page' 
                            });
                        }
                        return null;
                    }
                    
                    // Return data point only if all validations pass
                    return {
                        time: chartDate.trim(),
                        value: percent
                    };
                }).filter(item => {
                    // Additional filter to ensure no null/undefined values
                    return item !== null && 
                           item !== undefined && 
                           item.time && 
                           typeof item.time === 'string' && 
                           item.time.trim() !== '' &&
                           item.value !== null && 
                           item.value !== undefined && 
                           !isNaN(item.value) && 
                           isFinite(item.value);
                }) : []; // Filter out null values
                
                if (window.Logger) {
                    window.Logger.info('📊 Filtered performance data', { 
                        originalCount: series?.snapshots?.length || 0,
                        filteredCount: performanceData.length,
                        sampleData: performanceData.slice(0, 3),
                        page: 'portfolio-state-page' 
                    });
                }
            }
        } catch (error) {
            // Don't show error notification for auth errors (already handled in service)
            if (error?.message?.includes('Authentication required') || error?.message?.includes('401')) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Authentication required for performance data', { page: 'portfolio-state-page' });
                }
                // Skip showing error notification - auth error already handled
                return;
            }
            
            if (window.Logger) {
                window.Logger.error('Error loading performance data', { page: 'portfolio-state-page', error });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                    'שגיאה בטעינת נתונים',
                    'שגיאה בטעינת נתוני ביצועי תיק. נא לנסות שוב או ליצור קשר עם התמיכה.'
                );
            }
        }
        
        // Check if chart still exists before updating data
        if (!portfolioPerformanceChart || !portfolioPerformanceSeries) {
            if (window.Logger) {
                window.Logger.warn('Portfolio performance chart or series not available, skipping data update', { page: 'portfolio-state-page' });
            }
            return;
        }
        
        // No fallback data - show error if no data available
        if (performanceData.length === 0) {
            if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                    'נתונים לא זמינים',
                    'לא נמצאו נתוני ביצועי תיק עבור התקופה שנבחרה. נא לבדוק שיש נתונים במערכת.'
                );
            }
            // Show empty chart with message
            try {
                portfolioPerformanceSeries.setData([]);
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Error setting empty data to performance chart (chart may be disposed)', { page: 'portfolio-state-page', error: error.message });
                }
            }
        } else {
            try {
                // CRITICAL: Final validation - filter out any null/undefined/invalid values before setData
                const validData = performanceData.filter(item => {
                    return item !== null && 
                           item !== undefined && 
                           item.time && 
                           typeof item.time === 'string' && 
                           item.time.length > 0 &&
                           item.value !== null && 
                           item.value !== undefined && 
                           !isNaN(item.value) && 
                           isFinite(item.value);
                });
                
                if (window.Logger && validData.length !== performanceData.length) {
                    window.Logger.warn('Filtered out invalid data points', { 
                        original: performanceData.length, 
                        filtered: validData.length,
                        page: 'portfolio-state-page' 
                    });
                }
                
                // CRITICAL: Additional safety check - ensure no null values in time or value fields
                const finalData = validData.map(item => {
                    // Double-check that time and value are not null
                    if (item && item.time && item.value !== null && item.value !== undefined) {
                        return {
                            time: String(item.time).trim(), // Ensure time is a non-empty string
                            value: Number(item.value) // Ensure value is a number
                        };
                    }
                    return null;
                }).filter(item => item !== null && item.time && !isNaN(item.value) && isFinite(item.value));
                
                if (window.Logger && finalData.length !== validData.length) {
                    window.Logger.warn('Additional filtering removed more invalid data points', { 
                        afterFirstFilter: validData.length, 
                        afterFinalFilter: finalData.length,
                        page: 'portfolio-state-page' 
                    });
                }
                
                // CRITICAL: Final safety check - ensure no null values before setData
                const safeData = finalData.filter(item => {
                    if (!item) return false;
                    if (!item.time || typeof item.time !== 'string' || item.time.trim() === '') return false;
                    if (item.value === null || item.value === undefined || isNaN(item.value) || !isFinite(item.value)) return false;
                    return true;
                });
                
                if (window.Logger && safeData.length !== finalData.length) {
                    window.Logger.warn('Final safety check removed invalid data points', { 
                        beforeFinalCheck: finalData.length, 
                        afterFinalCheck: safeData.length,
                        page: 'portfolio-state-page' 
                    });
                }
                
                if (safeData.length === 0) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ No valid data points after all filtering', { 
                            originalCount: performanceData.length,
                            page: 'portfolio-state-page' 
                        });
                    }
                    // Don't call setData with empty array - show error instead
                    if (window.NotificationSystem) {
                        window.NotificationSystem.showError(
                            'נתונים לא זמינים',
                            'לא נמצאו נתוני ביצועי תיק תקינים עבור התקופה שנבחרה. נא לבדוק שיש נתונים במערכת.'
                        );
                    }
                } else {
                    portfolioPerformanceSeries.setData(safeData);
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error setting data to performance chart (chart may be disposed)', { page: 'portfolio-state-page', error: error.message });
                }
                // Reset chart variable if it's disposed
                if (error.message && error.message.includes('disposed')) {
                    portfolioPerformanceChart = null;
                }
            }
        }
        
        // Add markers for min/max points if data available
        const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
        if (performanceData.length > 0 && lightweightCharts) {
            const markers = [];
            const values = performanceData.map(d => d.value);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const minIndex = values.indexOf(minValue);
            const maxIndex = values.indexOf(maxValue);
            
            // Add marker for min point
            if (minIndex >= 0 && minIndex < performanceData.length) {
                markers.push({
                    time: performanceData[minIndex].time,
                    position: 'belowBar',
                    color: (typeof window.getNumericValueColor === 'function' ? window.getNumericValueColor(-1, 'medium') : '') || '',
                    shape: 'arrowUp',
                    text: `${performanceData[minIndex].value.toFixed(2)}%`,
                    size: 1
                });
            }
            
            // Add marker for max point
            if (maxIndex >= 0 && maxIndex < performanceData.length && maxIndex !== minIndex) {
                markers.push({
                    time: performanceData[maxIndex].time,
                    position: 'aboveBar',
                    color: (typeof window.getNumericValueColor === 'function' ? window.getNumericValueColor(1, 'medium') : '') || '',
                    shape: 'arrowDown',
                    text: `${performanceData[maxIndex].value.toFixed(2)}%`,
                    size: 1
                });
            }
            
            // Try to use createSeriesMarkers if available
            if (typeof lightweightCharts.createSeriesMarkers === 'function') {
                try {
                    const markersPrimitive = lightweightCharts.createSeriesMarkers(portfolioPerformanceSeries);
                    if (markersPrimitive && typeof markersPrimitive.setMarkers === 'function') {
                        markersPrimitive.setMarkers(markers);
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ Failed to create markers primitive', { page: 'portfolio-state-page', error });
                    }
                }
            } else if (typeof portfolioPerformanceSeries.setMarkers === 'function') {
                // Fallback to direct setMarkers if available
                portfolioPerformanceSeries.setMarkers(markers);
            }
        }
        
        // Always fit content on load
        portfolioPerformanceChart.timeScale().fitContent();
        
        // Setup synchronization after all charts are ready
        setupChartSynchronization();
        
    } catch (error) {
        if (window.Logger) {
            const errorMsg = `שגיאה ביצירת גרף ביצועי תיק: ${error.message || 'שגיאה לא ידועה'}`;
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה ביצירת גרף', errorMsg);
            }
            if (window.Logger) {
                window.Logger.error('Error creating portfolio performance chart', { page: 'portfolio-state-page', error });
            }
        }
        portfolioPerformanceChart = null;
    }
}

// Initialize Portfolio Value Chart
async function initPortfolioValueChart() {
    const container = document.getElementById('portfolio-value-chart-container');
    if (!container) {
        if (window.Logger) {
            window.Logger.warn('Portfolio value chart container not found', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    // Wait for TradingView to be available with better error handling
    let retries = 0;
    const maxRetries = 100; // Increased timeout for defer scripts
    while ((typeof window.TradingViewChartAdapter === 'undefined' || 
            (typeof window.LightweightCharts === 'undefined' && 
             typeof window.lightweightCharts === 'undefined')) && 
           retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
    }
    
    if (typeof window.TradingViewChartAdapter === 'undefined') {
        if (window.Logger) {
            const availableObjects = Object.keys(window).filter(k => k.toLowerCase().includes('chart') || k.toLowerCase().includes('trading'));
            window.Logger.error('❌ TradingViewChartAdapter not available', { page: 'portfolio-state-page', timeout: maxRetries * 50, availableObjects });
        }
        return;
    }
    
    if (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined') {
        if (window.Logger) {
            const errorMsg = 'ספריית LightweightCharts לא זמינה. נא לרענן את העמוד.';
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה בטעינת גרפים', errorMsg);
            }
            if (window.Logger) {
                window.Logger.error('❌ LightweightCharts library not available', { page: 'portfolio-state-page' });
            }
        }
        return;
    }
    
    // Destroy existing chart
    if (portfolioValueChart && typeof window.TradingViewChartAdapter.destroyChart === 'function') {
        try {
            window.TradingViewChartAdapter.destroyChart(portfolioValueChart);
        } catch (e) {
            if (window.Logger) {
                window.Logger.warn('Error destroying portfolio value chart', { page: 'portfolio-state-page', error: e });
            }
        }
        portfolioValueChart = null;
    }
    
    try {
        // שימוש במערכת המרכזית לצבע ראשי
        const primaryColor = getCSSVariableValue('--primary-color', 
            (typeof window.getEntityColor === 'function' ? window.getEntityColor('trade') : '') || 
            (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_PRIMARY ? window.colorSchemeSystem.BRAND_PRIMARY : '')
        );
        
        // Get wrapper for width calculation (if exists)
        const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
        const containerWidth = wrapper ? wrapper.clientWidth : (container.clientWidth || container.offsetWidth || 800);
        const containerHeight = container.clientHeight || container.offsetHeight || 200;
        
        if (containerWidth === 0 || containerHeight === 0) {
            if (window.Logger) {
                window.Logger.warn('Portfolio value chart container has zero dimensions, waiting...', { page: 'portfolio-state-page' });
            }
            setTimeout(() => initPortfolioValueChart(), 100);
            return;
        }
        
        portfolioValueChart = window.TradingViewChartAdapter.createChart(container, {
            width: containerWidth,
            height: containerHeight,
            layout: {
                textColor: getCSSVariableValue('--text-color', '#212529'),
                background: { type: 'solid', color: getCSSVariableValue('--card-background', '#ffffff') }
            },
            grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false
            },
            rightPriceScale: {
                visible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1
                }
            },
            leftPriceScale: {
                visible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1
                }
            },
            crosshair: {
                mode: 1, // Normal mode - shows crosshair with tooltip
                vertLine: {
                    // Use centralized Color Scheme System - no hardcoded colors
                    color: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                           (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : ''),
                    width: 1,
                    style: 0,
                    // Use centralized Color Scheme System - no hardcoded colors
                    labelBackgroundColor: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                                         (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : '')
                },
                horzLine: {
                    // Use centralized Color Scheme System - no hardcoded colors
                    color: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                           (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : ''),
                    width: 1,
                    style: 0,
                    // Use centralized Color Scheme System - no hardcoded colors
                    labelBackgroundColor: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                                         (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : '')
                }
            }
        });
        
        // Remove loading indicator
        const loading2 = container.querySelector('.chart-loading');
        if (loading2) loading2.remove();
        
        // Get lighter shade for percentage series
        const primaryColorLighter = getLighterColor(primaryColor, 0.5);
        
        // Value series (left Y axis - amounts)
        const portfolioValueSeries = window.TradingViewChartAdapter.addLineSeries(portfolioValueChart, {
            color: primaryColor,
            lineWidth: 2,
            title: 'שווי תיק ($)',
            priceScaleId: 'left',
            priceFormat: {
                type: 'price',
                precision: 0,
                minMove: 1
            }
        });
        
        // Percentage series (right Y axis - percentages)
        const portfolioValuePercentSeries = window.TradingViewChartAdapter.addLineSeries(portfolioValueChart, {
            color: primaryColorLighter,
            lineWidth: 2,
            lineType: 0, // Normal line (using lighter color to differentiate)
            title: 'שווי תיק (%)',
            priceScaleId: 'right',
            priceFormat: {
                type: 'percent',
                precision: 2,
                minMove: 0.01
            }
        });
        
        // Load portfolio value data using PortfolioStateData service
        let valueData = {
            values: [],
            percentages: []
        };
        try {
            if (window.PortfolioStateData && typeof window.PortfolioStateData.loadSeries === 'function') {
                const period = currentPeriod['both'] || 'month';
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date();
                const days = period === 'week' ? 7 : period === 'month' ? 30 : period === '3months' ? 90 : period === 'year' ? 365 : 30;
                startDate.setDate(startDate.getDate() - days);
                const startDateStr = startDate.toISOString().split('T')[0];
                
                const accountId = getSelectedAccounts().length === 1 ? getSelectedAccounts()[0] : null;
                const series = await window.PortfolioStateData.loadSeries(accountId, startDateStr, endDate, {
                    interval: 'day'
                });
                
                // Transform series data to chart format
                if (Array.isArray(series?.snapshots) && series.snapshots.length > 0) {
                    const baseValue = series.snapshots[0]?.total_value;
                    if (baseValue !== null && baseValue !== undefined && baseValue > 0) {
                        valueData.values = series.snapshots.map(snapshot => {
                            // CRITICAL: Validate snapshot exists
                            if (!snapshot) return null;
                            
                            const dateValue = snapshot.snapshot_date || snapshot.date;
                            if (!dateValue) return null; // No date value
                            
                            const chartDate = convertDateToChartFormat(dateValue);
                            // CRITICAL: Validate chartDate is a non-empty string
                            if (!chartDate || typeof chartDate !== 'string' || chartDate.trim() === '') {
                                return null;
                            }
                            
                            const value = snapshot.total_value !== null && snapshot.total_value !== undefined ? snapshot.total_value : null;
                            // Return data point only if both time and value are valid
                            if (value !== null && !isNaN(value) && isFinite(value)) {
                            return {
                                    time: chartDate.trim(),
                                    value: value
                                };
                            }
                            return null; // Will be filtered out
                        }).filter(item => {
                            // Additional filter to ensure no null/undefined values
                            return item !== null && 
                                   item !== undefined && 
                                   item.time && 
                                   typeof item.time === 'string' && 
                                   item.time.trim() !== '' &&
                                   item.value !== null && 
                                   item.value !== undefined && 
                                   !isNaN(item.value) && 
                                   isFinite(item.value);
                        }); // Filter out null values
                        valueData.percentages = series.snapshots.map(snapshot => {
                            // CRITICAL: Validate snapshot exists
                            if (!snapshot) return null;
                            
                            const snapshotValue = snapshot.total_value !== null && snapshot.total_value !== undefined ? snapshot.total_value : null;
                            if (snapshotValue === null) return null;
                            
                            const percent = ((snapshotValue - baseValue) / baseValue) * 100;
                            // Validate percent is a valid number
                            if (isNaN(percent) || !isFinite(percent)) return null;
                            
                            const dateValue = snapshot.snapshot_date || snapshot.date;
                            if (!dateValue) return null; // No date value
                            
                            const chartDate = convertDateToChartFormat(dateValue);
                            // CRITICAL: Validate chartDate is a non-empty string
                            if (!chartDate || typeof chartDate !== 'string' || chartDate.trim() === '') {
                                return null;
                            }
                            
                            // Return data point only if both time and percent are valid
                            return {
                                time: chartDate.trim(),
                                value: percent
                            };
                        }).filter(item => {
                            // Additional filter to ensure no null/undefined values
                            return item !== null && 
                                   item !== undefined && 
                                   item.time && 
                                   typeof item.time === 'string' && 
                                   item.time.trim() !== '' &&
                                   item.value !== null && 
                                   item.value !== undefined && 
                                   !isNaN(item.value) && 
                                   isFinite(item.value);
                        }); // Filter out null values
                    } else {
                        // No valid base value - show error
                        if (window.NotificationSystem) {
                            window.NotificationSystem.showError(
                                'נתונים לא זמינים',
                                'לא נמצאו נתוני שווי תיק תקינים. נא לבדוק שיש נתונים במערכת.'
                            );
                        }
                    }
                }
            }
        } catch (error) {
            // Don't show error notification for auth errors (already handled in service)
            if (error?.message?.includes('Authentication required') || error?.message?.includes('401')) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Authentication required for portfolio value data', { page: 'portfolio-state-page' });
                }
                // Skip showing error notification - auth error already handled
                return;
            }
            
            if (window.Logger) {
                window.Logger.error('Error loading portfolio value data', { page: 'portfolio-state-page', error });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                    'שגיאה בטעינת נתונים',
                    'שגיאה בטעינת נתוני שווי תיק. נא לנסות שוב או ליצור קשר עם התמיכה.'
                );
            }
        }
        
        // Check if chart still exists before updating data
        if (!portfolioValueChart || !portfolioValueSeries || !portfolioValuePercentSeries) {
            if (window.Logger) {
                window.Logger.warn('Portfolio value chart or series not available, skipping data update', { page: 'portfolio-state-page' });
            }
            return;
        }
        
        // No fallback data - show error if no data available
        if (valueData.values.length === 0) {
            if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                    'נתונים לא זמינים',
                    'לא נמצאו נתוני שווי תיק עבור התקופה שנבחרה. נא לבדוק שיש נתונים במערכת.'
                );
            }
            // Show empty chart with message
            try {
                portfolioValueSeries.setData([]);
                portfolioValuePercentSeries.setData([]);
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Error setting empty data to value chart (chart may be disposed)', { page: 'portfolio-state-page', error: error.message });
                }
            }
        } else {
            try {
                // CRITICAL: Final validation - filter out any null/undefined/invalid values before setData
                const validValues = valueData.values.filter(item => {
                    return item !== null && 
                           item !== undefined && 
                           item.time && 
                           typeof item.time === 'string' && 
                           item.time.length > 0 &&
                           item.value !== null && 
                           item.value !== undefined && 
                           !isNaN(item.value) && 
                           isFinite(item.value);
                });
                
                const validPercentages = valueData.percentages.filter(item => {
                    return item !== null && 
                           item !== undefined && 
                           item.time && 
                           typeof item.time === 'string' && 
                           item.time.length > 0 &&
                           item.value !== null && 
                           item.value !== undefined && 
                           !isNaN(item.value) && 
                           isFinite(item.value);
                });
                
                if (window.Logger && (validValues.length !== valueData.values.length || validPercentages.length !== valueData.percentages.length)) {
                    window.Logger.warn('Filtered out invalid data points', { 
                        originalValues: valueData.values.length, 
                        filteredValues: validValues.length,
                        originalPercentages: valueData.percentages.length,
                        filteredPercentages: validPercentages.length,
                        page: 'portfolio-state-page' 
                    });
                }
                
                // CRITICAL: Additional safety check - ensure no null values in time or value fields
                const finalValues = validValues.map(item => {
                    if (item && item.time && item.value !== null && item.value !== undefined) {
                        return {
                            time: String(item.time).trim(),
                            value: Number(item.value)
                        };
                    }
                    return null;
                }).filter(item => item !== null && item.time && !isNaN(item.value) && isFinite(item.value));
                
                const finalPercentages = validPercentages.map(item => {
                    if (item && item.time && item.value !== null && item.value !== undefined) {
                        return {
                            time: String(item.time).trim(),
                            value: Number(item.value)
                        };
                    }
                    return null;
                }).filter(item => item !== null && item.time && !isNaN(item.value) && isFinite(item.value));
                
                if (window.Logger && (finalValues.length !== validValues.length || finalPercentages.length !== validPercentages.length)) {
                    window.Logger.warn('Additional filtering removed more invalid data points', { 
                        afterFirstFilterValues: validValues.length,
                        afterFinalFilterValues: finalValues.length,
                        afterFirstFilterPercentages: validPercentages.length,
                        afterFinalFilterPercentages: finalPercentages.length,
                        page: 'portfolio-state-page' 
                    });
                }
                
                // CRITICAL: Final safety check - ensure no null values before setData
                const safeValues = finalValues.filter(item => {
                    if (!item) return false;
                    if (!item.time || typeof item.time !== 'string' || item.time.trim() === '') return false;
                    if (item.value === null || item.value === undefined || isNaN(item.value) || !isFinite(item.value)) return false;
                    return true;
                });
                
                const safePercentages = finalPercentages.filter(item => {
                    if (!item) return false;
                    if (!item.time || typeof item.time !== 'string' || item.time.trim() === '') return false;
                    if (item.value === null || item.value === undefined || isNaN(item.value) || !isFinite(item.value)) return false;
                    return true;
                });
                
                if (window.Logger && (safeValues.length !== finalValues.length || safePercentages.length !== finalPercentages.length)) {
                    window.Logger.warn('Final safety check removed invalid data points', { 
                        beforeFinalCheckValues: finalValues.length,
                        afterFinalCheckValues: safeValues.length,
                        beforeFinalCheckPercentages: finalPercentages.length,
                        afterFinalCheckPercentages: safePercentages.length,
                        page: 'portfolio-state-page' 
                    });
                }
                
                if (safeValues.length === 0 || safePercentages.length === 0) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ No valid data points after all filtering for value chart', { 
                            valuesCount: safeValues.length,
                            percentagesCount: safePercentages.length,
                            page: 'portfolio-state-page' 
                        });
                    }
                    // Don't call setData with empty array - show error instead
                    if (window.NotificationSystem) {
                        window.NotificationSystem.showError(
                            'נתונים לא זמינים',
                            'לא נמצאו נתוני שווי תיק תקינים עבור התקופה שנבחרה. נא לבדוק שיש נתונים במערכת.'
                        );
                    }
                } else {
                    portfolioValueSeries.setData(safeValues);
                    portfolioValuePercentSeries.setData(safePercentages);
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error setting data to value chart (chart may be disposed)', { page: 'portfolio-state-page', error: error.message });
                }
                // Reset chart variable if it's disposed
                if (error.message && error.message.includes('disposed')) {
                    portfolioValueChart = null;
                }
            }
        }
        
        // Add markers for min/max points if data available
        const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
        if (valueData.values.length > 0 && lightweightCharts) {
            const markers = [];
            const values = valueData.values.map(d => d.value);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const minIndex = values.indexOf(minValue);
            const maxIndex = values.indexOf(maxValue);
            
            // Add marker for min point
            if (minIndex >= 0 && minIndex < valueData.values.length) {
                markers.push({
                    time: valueData.values[minIndex].time,
                    position: 'belowBar',
                    color: (typeof window.getNumericValueColor === 'function' ? window.getNumericValueColor(-1, 'medium') : '') || '',
                    shape: 'arrowUp',
                    text: `$${valueData.values[minIndex].value.toLocaleString()}`,
                    size: 1
                });
            }
            
            // Add marker for max point
            if (maxIndex >= 0 && maxIndex < valueData.values.length && maxIndex !== minIndex) {
                markers.push({
                    time: valueData.values[maxIndex].time,
                    position: 'aboveBar',
                    color: (typeof window.getNumericValueColor === 'function' ? window.getNumericValueColor(1, 'medium') : '') || '',
                    shape: 'arrowDown',
                    text: `$${valueData.values[maxIndex].value.toLocaleString()}`,
                    size: 1
                });
            }
            
            // Try to use createSeriesMarkers if available
            if (typeof lightweightCharts.createSeriesMarkers === 'function') {
                try {
                    const markersPrimitive = lightweightCharts.createSeriesMarkers(portfolioValueSeries);
                    if (markersPrimitive && typeof markersPrimitive.setMarkers === 'function') {
                        markersPrimitive.setMarkers(markers);
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ Failed to create markers primitive', { page: 'portfolio-state-page', error });
                    }
                }
            } else if (typeof portfolioValueSeries.setMarkers === 'function') {
                // Fallback to direct setMarkers if available
                portfolioValueSeries.setMarkers(markers);
            }
        }
        
        // Always fit content on load
        portfolioValueChart.timeScale().fitContent();
        
        // Setup synchronization after both charts are ready
        setupChartSynchronization();
        
    } catch (error) {
        const errorMsg = `שגיאה ביצירת גרף שווי תיק: ${error.message || 'שגיאה לא ידועה'}`;
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה ביצירת גרף', errorMsg);
        }
        if (window.Logger) {
            window.Logger.error('Error creating portfolio value chart', { page: 'portfolio-state-page', error });
        }
        portfolioValueChart = null;
    }
}

// Initialize P/L Trend Chart
async function initPLTrendChart() {
    const container = document.getElementById('pl-trend-chart-container');
    if (!container) {
        if (window.Logger) {
            window.Logger.warn('P/L trend chart container not found', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    // Wait for TradingView to be available with better error handling
    let retries = 0;
    const maxRetries = 100; // Increased timeout for defer scripts
    while ((typeof window.TradingViewChartAdapter === 'undefined' || 
            (typeof window.LightweightCharts === 'undefined' && 
             typeof window.lightweightCharts === 'undefined')) && 
           retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
    }
    
    if (typeof window.TradingViewChartAdapter === 'undefined') {
        if (window.Logger) {
            const errorMsg = 'ספריית TradingView לא זמינה. נא לרענן את העמוד.';
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה בטעינת גרפים', errorMsg);
            }
            if (window.Logger) {
                window.Logger.error('❌ TradingViewChartAdapter not available', { page: 'portfolio-state-page', timeout: maxRetries * 50 });
            }
        }
        return;
    }
    
    if (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined') {
        if (window.Logger) {
            const errorMsg = 'ספריית LightweightCharts לא זמינה. נא לרענן את העמוד.';
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה בטעינת גרפים', errorMsg);
            }
            if (window.Logger) {
                window.Logger.error('❌ LightweightCharts library not available', { page: 'portfolio-state-page' });
            }
        }
        return;
    }
    
    // Destroy existing chart
    if (plTrendChart && typeof window.TradingViewChartAdapter.destroyChart === 'function') {
        try {
            window.TradingViewChartAdapter.destroyChart(plTrendChart);
        } catch (e) {
            if (window.Logger) {
                window.Logger.warn('Error destroying P/L trend chart', { page: 'portfolio-state-page', error: e });
            }
        }
        plTrendChart = null;
    }
    
    try {
        // שימוש במערכת המרכזית לצבעים
        const successColor = getCSSVariableValue('--success-color', 
            (typeof window.getNumericValueColor === 'function' ? window.getNumericValueColor(1, 'medium') : '') || ''
        );
        const warningColor = getCSSVariableValue('--warning-color', 
            (typeof window.getStatusColor === 'function' ? window.getStatusColor('warning', 'medium') : '') || ''
        );
        const primaryColor = getCSSVariableValue('--primary-color', 
            (typeof window.getEntityColor === 'function' ? window.getEntityColor('trade') : '') || ''
        );
        
        // Get wrapper for width calculation (if exists)
        const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
        const containerWidth = wrapper ? wrapper.clientWidth : (container.clientWidth || container.offsetWidth || 800);
        const containerHeight = container.clientHeight || container.offsetHeight || 200;
        
        if (containerWidth === 0 || containerHeight === 0) {
            if (window.Logger) {
                window.Logger.warn('P/L trend chart container has zero dimensions, waiting...', { page: 'portfolio-state-page' });
            }
            setTimeout(() => initPLTrendChart(), 100);
            return;
        }
        
        plTrendChart = window.TradingViewChartAdapter.createChart(container, {
            width: containerWidth,
            height: containerHeight,
            layout: {
                textColor: getCSSVariableValue('--text-color', '#212529'),
                background: { type: 'solid', color: getCSSVariableValue('--card-background', '#ffffff') }
            },
            grid: {
                vertLines: { color: '#f0f0f0' },
                horzLines: { color: '#f0f0f0' }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false
            },
            rightPriceScale: {
                visible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1
                }
            },
            leftPriceScale: {
                visible: true,
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.1
                }
            },
            crosshair: {
                mode: 1, // Normal mode - shows crosshair with tooltip
                vertLine: {
                    // Use centralized Color Scheme System - no hardcoded colors
                    color: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                           (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : ''),
                    width: 1,
                    style: 0,
                    // Use centralized Color Scheme System - no hardcoded colors
                    labelBackgroundColor: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                                         (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : '')
                },
                horzLine: {
                    // Use centralized Color Scheme System - no hardcoded colors
                    color: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                           (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : ''),
                    width: 1,
                    style: 0,
                    // Use centralized Color Scheme System - no hardcoded colors
                    labelBackgroundColor: (typeof window.getEntityColor === 'function' ? window.getEntityColor('development') : '') || 
                                         (typeof window.colorSchemeSystem !== 'undefined' && window.colorSchemeSystem.BRAND_SECONDARY ? window.colorSchemeSystem.BRAND_SECONDARY : '')
                }
            }
        });
        
        // Remove loading indicator
        const loading3 = container.querySelector('.chart-loading');
        if (loading3) loading3.remove();
        
        // Get lighter shades for percentage series
        const successColorLighter = getLighterColor(successColor, 0.5);
        const warningColorLighter = getLighterColor(warningColor, 0.5);
        const primaryColorLighter = getLighterColor(primaryColor, 0.5);
        
        // Value series (left Y axis - amounts)
        const realizedPLSeries = window.TradingViewChartAdapter.addLineSeries(plTrendChart, {
            color: successColor,
            lineWidth: 2,
            title: 'P/L ממומש ($)',
            priceScaleId: 'left',
            priceFormat: {
                type: 'price',
                precision: 0,
                minMove: 1
            }
        });
        
        const unrealizedPLSeries = window.TradingViewChartAdapter.addLineSeries(plTrendChart, {
            color: warningColor,
            lineWidth: 2,
            title: 'P/L לא ממומש ($)',
            priceScaleId: 'left',
            priceFormat: {
                type: 'price',
                precision: 0,
                minMove: 1
            }
        });
        
        const totalPLSeries = window.TradingViewChartAdapter.addLineSeries(plTrendChart, {
            color: primaryColor,
            lineWidth: 3,
            title: 'P/L כולל ($)',
            priceScaleId: 'left',
            priceFormat: {
                type: 'price',
                precision: 0,
                minMove: 1
            }
        });
        
        // Percentage series (right Y axis - percentages)
        const realizedPLPercentSeries = window.TradingViewChartAdapter.addLineSeries(plTrendChart, {
            color: successColorLighter,
            lineWidth: 2,
            lineType: 0, // Normal line (using lighter color to differentiate)
            title: 'P/L ממומש (%)',
            priceScaleId: 'right',
            priceFormat: {
                type: 'percent',
                precision: 2,
                minMove: 0.01
            }
        });
        
        const unrealizedPLPercentSeries = window.TradingViewChartAdapter.addLineSeries(plTrendChart, {
            color: warningColorLighter,
            lineWidth: 2,
            lineType: 0, // Normal line (using lighter color to differentiate)
            title: 'P/L לא ממומש (%)',
            priceScaleId: 'right',
            priceFormat: {
                type: 'percent',
                precision: 2,
                minMove: 0.01
            }
        });
        
        const totalPLPercentSeries = window.TradingViewChartAdapter.addLineSeries(plTrendChart, {
            color: primaryColorLighter,
            lineWidth: 3,
            lineType: 0, // Normal line (using lighter color to differentiate)
            title: 'P/L כולל (%)',
            priceScaleId: 'right',
            priceFormat: {
                type: 'percent',
                precision: 2,
                minMove: 0.01
            }
        });
        
        // Load portfolio data from API
        let plData = {
            realized: [],
            unrealized: [],
            total: [],
            realizedPercent: [],
            unrealizedPercent: [],
            totalPercent: []
        };

        try {
            // Load portfolio summary from API
            const accountId = getSelectedAccounts().length === 1 ? getSelectedAccounts()[0] : null;
            const portfolioUrl = accountId
                ? `/api/portfolio/summary?account_id=${accountId}&size=full`
                : '/api/portfolio/summary?size=full';

            const portfolioResponse = await fetch(portfolioUrl);
            if (portfolioResponse.ok) {
                const portfolioData = await portfolioResponse.json();

                // Use portfolio data for charts if available
                // For now, fallback to existing logic if no chart data from API
                if (window.PortfolioStateData && typeof window.PortfolioStateData.loadSeries === 'function') {
                    const period = currentPeriod['both'] || 'month';
                    const endDate = new Date().toISOString().split('T')[0];
                    const startDate = new Date();
                    const days = period === 'week' ? 7 : period === 'month' ? 30 : period === '3months' ? 90 : period === 'year' ? 365 : 30;
                    startDate.setDate(startDate.getDate() - days);
                    const startDateStr = startDate.toISOString().split('T')[0];

                    try {
                        const series = await window.PortfolioStateData.loadSeries(accountId, startDateStr, endDate, {
                            interval: 'day'
                        });

                        // Transform series data to chart format
                        if (Array.isArray(series?.snapshots)) {
                            series.snapshots.forEach(snapshot => {
                                // CRITICAL: Validate snapshot exists
                                if (!snapshot) return;

                                const dateValue = snapshot.snapshot_date || snapshot.date;
                                if (!dateValue) return; // No date value

                                const time = convertDateToChartFormat(dateValue);
                                // CRITICAL: Validate time is a non-empty string
                                if (!time || typeof time !== 'string' || time.trim() === '') {
                                    return; // Skip this snapshot if time is invalid
                                }

                                const timeStr = time.trim(); // Use trimmed time string

                                // No fallback values - use null if data not available
                                const realized = snapshot.total_realized_pl !== null && snapshot.total_realized_pl !== undefined ? snapshot.total_realized_pl : null;
                                const unrealized = snapshot.total_unrealized_pl !== null && snapshot.total_unrealized_pl !== undefined ? snapshot.total_unrealized_pl : null;
                                const total = (realized !== null && unrealized !== null) ? realized + unrealized : null;
                                const baseValue = series.snapshots[0]?.total_value;
                                const realizedPercent = (baseValue && baseValue > 0 && realized !== null) ? (realized / baseValue) * 100 : null;
                                const unrealizedPercent = (baseValue && baseValue > 0 && unrealized !== null) ? (unrealized / baseValue) * 100 : null;
                                const totalPercent = (baseValue && baseValue > 0 && total !== null) ? (total / baseValue) * 100 : null;

                                // Only add data if values are not null AND time is valid
                                // CRITICAL: Filter out null time values to prevent "Value is null" errors
                                if (realized !== null && !isNaN(realized) && isFinite(realized)) {
                                    plData.realized.push({ time: timeStr, value: realized });
                                }
                                if (unrealized !== null && !isNaN(unrealized) && isFinite(unrealized)) {
                                    plData.unrealized.push({ time: timeStr, value: unrealized });
                                }
                                if (total !== null && !isNaN(total) && isFinite(total)) {
                                    plData.total.push({ time: timeStr, value: total });
                                }
                                if (realizedPercent !== null && !isNaN(realizedPercent) && isFinite(realizedPercent)) {
                                    plData.realizedPercent.push({ time: timeStr, value: realizedPercent });
                                }
                                if (unrealizedPercent !== null && !isNaN(unrealizedPercent) && isFinite(unrealizedPercent)) {
                                    plData.unrealizedPercent.push({ time: timeStr, value: unrealizedPercent });
                                }
                                if (totalPercent !== null && !isNaN(totalPercent) && isFinite(totalPercent)) {
                                    plData.totalPercent.push({ time: timeStr, value: totalPercent });
                                }
                            });
                        }
                    } catch (apiError) {
                        window.Logger?.warn?.('Failed to load portfolio series from API, using fallback', {
                            error: apiError?.message,
                            page: 'portfolio-state'
                        });
                    }
                }
            } else {
                window.Logger?.warn?.('Failed to load portfolio summary from API', {
                    status: portfolioResponse.status,
                    page: 'portfolio-state'
                });
            }
        } catch (error) {
            // Don't show error notification for auth errors (already handled in service)
            if (error?.message?.includes('Authentication required') || error?.message?.includes('401')) {
                if (window.Logger) {
                    window.Logger.warn('⚠️ Authentication required for P/L data', { page: 'portfolio-state-page' });
                }
                // Skip showing error notification - auth error already handled
                return;
            }
            
            if (window.Logger) {
                window.Logger.error('Error loading P/L data', { page: 'portfolio-state-page', error });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                    'שגיאה בטעינת נתונים',
                    'שגיאה בטעינת נתוני P/L. נא לנסות שוב או ליצור קשר עם התמיכה.'
                );
            }
        }
        
        // Check if chart still exists before updating data
        if (!plTrendChart || !realizedPLSeries || !unrealizedPLSeries || !totalPLSeries) {
            if (window.Logger) {
                window.Logger.warn('P/L trend chart or series not available, skipping data update', { page: 'portfolio-state-page' });
            }
            return;
        }
        
        // No fallback data - show error if no data available
        if (plData.total.length === 0) {
            if (window.NotificationSystem) {
                window.NotificationSystem.showError(
                    'נתונים לא זמינים',
                    'לא נמצאו נתוני P/L עבור התקופה שנבחרה. נא לבדוק שיש נתונים במערכת.'
                );
            }
            // Show empty charts with message
            try {
                realizedPLSeries.setData([]);
                unrealizedPLSeries.setData([]);
                totalPLSeries.setData([]);
                realizedPLPercentSeries.setData([]);
                unrealizedPLPercentSeries.setData([]);
                totalPLPercentSeries.setData([]);
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Error setting empty data to P/L chart (chart may be disposed)', { page: 'portfolio-state-page', error: error.message });
                }
            }
        } else {
            try {
                // CRITICAL: Final validation - filter out any null/undefined/invalid values before setData
                const filterValidData = (data) => {
                    return data.filter(item => {
                        return item !== null && 
                               item !== undefined && 
                               item.time && 
                               typeof item.time === 'string' && 
                               item.time.length > 0 &&
                               item.value !== null && 
                               item.value !== undefined && 
                               !isNaN(item.value) && 
                               isFinite(item.value);
                    });
                };
                
                const validRealized = filterValidData(plData.realized);
                const validUnrealized = filterValidData(plData.unrealized);
                const validTotal = filterValidData(plData.total);
                const validRealizedPercent = filterValidData(plData.realizedPercent);
                const validUnrealizedPercent = filterValidData(plData.unrealizedPercent);
                const validTotalPercent = filterValidData(plData.totalPercent);
                
                if (window.Logger) {
                    const originalTotal = plData.realized.length + plData.unrealized.length + plData.total.length;
                    const filteredTotal = validRealized.length + validUnrealized.length + validTotal.length;
                    if (originalTotal !== filteredTotal) {
                        window.Logger.warn('Filtered out invalid P/L data points', { 
                            original: originalTotal, 
                            filtered: filteredTotal,
                            page: 'portfolio-state-page' 
                        });
                    }
                }
                
                // CRITICAL: Additional safety check - ensure no null values in time or value fields
                const finalRealized = validRealized.map(item => {
                    if (item && item.time && item.value !== null && item.value !== undefined) {
                        return {
                            time: String(item.time).trim(),
                            value: Number(item.value)
                        };
                    }
                    return null;
                }).filter(item => item !== null && item.time && !isNaN(item.value) && isFinite(item.value));
                
                const finalUnrealized = validUnrealized.map(item => {
                    if (item && item.time && item.value !== null && item.value !== undefined) {
                        return {
                            time: String(item.time).trim(),
                            value: Number(item.value)
                        };
                    }
                    return null;
                }).filter(item => item !== null && item.time && !isNaN(item.value) && isFinite(item.value));
                
                const finalTotal = validTotal.map(item => {
                    if (item && item.time && item.value !== null && item.value !== undefined) {
                        return {
                            time: String(item.time).trim(),
                            value: Number(item.value)
                        };
                    }
                    return null;
                }).filter(item => item !== null && item.time && !isNaN(item.value) && isFinite(item.value));
                
                const finalRealizedPercent = validRealizedPercent.map(item => {
                    if (item && item.time && item.value !== null && item.value !== undefined) {
                        return {
                            time: String(item.time).trim(),
                            value: Number(item.value)
                        };
                    }
                    return null;
                }).filter(item => item !== null && item.time && !isNaN(item.value) && isFinite(item.value));
                
                const finalUnrealizedPercent = validUnrealizedPercent.map(item => {
                    if (item && item.time && item.value !== null && item.value !== undefined) {
                        return {
                            time: String(item.time).trim(),
                            value: Number(item.value)
                        };
                    }
                    return null;
                }).filter(item => item !== null && item.time && !isNaN(item.value) && isFinite(item.value));
                
                const finalTotalPercent = validTotalPercent.map(item => {
                    if (item && item.time && item.value !== null && item.value !== undefined) {
                        return {
                            time: String(item.time).trim(),
                            value: Number(item.value)
                        };
                    }
                    return null;
                }).filter(item => item !== null && item.time && !isNaN(item.value) && isFinite(item.value));
                
                if (window.Logger) {
                    const afterFirstFilter = validRealized.length + validUnrealized.length + validTotal.length;
                    const afterFinalFilter = finalRealized.length + finalUnrealized.length + finalTotal.length;
                    if (afterFirstFilter !== afterFinalFilter) {
                        window.Logger.warn('Additional filtering removed more invalid P/L data points', { 
                            afterFirstFilter, 
                            afterFinalFilter,
                            page: 'portfolio-state-page' 
                        });
                    }
                }
                
                realizedPLSeries.setData(finalRealized);
                unrealizedPLSeries.setData(finalUnrealized);
                totalPLSeries.setData(finalTotal);
                realizedPLPercentSeries.setData(finalRealizedPercent);
                unrealizedPLPercentSeries.setData(finalUnrealizedPercent);
                totalPLPercentSeries.setData(finalTotalPercent);
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error setting data to P/L chart (chart may be disposed)', { page: 'portfolio-state-page', error: error.message });
                }
                // Reset chart variable if it's disposed
                if (error.message && error.message.includes('disposed')) {
                    plTrendChart = null;
                }
            }
        }
        
        // Add markers for min/max points on total PL if data available
        const lightweightChartsPL = window.LightweightCharts || window.lightweightCharts;
        if (plData.total.length > 0 && lightweightChartsPL) {
            const markers = [];
            const values = plData.total.map(d => d.value);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const minIndex = values.indexOf(minValue);
            const maxIndex = values.indexOf(maxValue);
            
            // Add marker for min point
            if (minIndex >= 0 && minIndex < plData.total.length) {
                markers.push({
                    time: plData.total[minIndex].time,
                    position: 'belowBar',
                    color: (typeof window.getNumericValueColor === 'function' ? window.getNumericValueColor(-1, 'medium') : '') || '',
                    shape: 'arrowUp',
                    text: `$${plData.total[minIndex].value.toLocaleString()}`,
                    size: 1
                });
            }
            
            // Add marker for max point
            if (maxIndex >= 0 && maxIndex < plData.total.length && maxIndex !== minIndex) {
                markers.push({
                    time: plData.total[maxIndex].time,
                    position: 'aboveBar',
                    color: (typeof window.getNumericValueColor === 'function' ? window.getNumericValueColor(1, 'medium') : '') || '',
                    shape: 'arrowDown',
                    text: `$${plData.total[maxIndex].value.toLocaleString()}`,
                    size: 1
                });
            }
            
            // Try to use createSeriesMarkers if available
            if (typeof lightweightChartsPL.createSeriesMarkers === 'function') {
                try {
                    const markersPrimitive = lightweightChartsPL.createSeriesMarkers(totalPLSeries);
                    if (markersPrimitive && typeof markersPrimitive.setMarkers === 'function') {
                        markersPrimitive.setMarkers(markers);
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ Failed to create markers primitive for P/L chart', { page: 'portfolio-state-page', error });
                    }
                }
            } else if (typeof totalPLSeries.setMarkers === 'function') {
                // Fallback to direct setMarkers if available
                totalPLSeries.setMarkers(markers);
            }
        }
        
        // Always fit content on load
        plTrendChart.timeScale().fitContent();
        
        // Setup synchronization after both charts are ready
        setupChartSynchronization();
        
    } catch (error) {
        if (window.Logger) {
            const errorMsg = `שגיאה ביצירת גרף מגמת P/L: ${error.message || 'שגיאה לא ידועה'}`;
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה ביצירת גרף', errorMsg);
            }
            if (window.Logger) {
                window.Logger.error('Error creating P/L trend chart', { page: 'portfolio-state-page', error });
            }
        }
        plTrendChart = null;
    }
}

// Setup chart synchronization
function setupChartSynchronization() {
    if (chartsSynchronized) return;
    
    if (!portfolioPerformanceChart || !portfolioValueChart || !plTrendChart) {
        syncSetupAttempts++;
        if (syncSetupAttempts >= MAX_SYNC_SETUP_ATTEMPTS) {
            if (window.Logger) {
                window.Logger.error('Max sync setup attempts reached', { page: 'portfolio-state-page' });
            }
            return;
        }
        setTimeout(setupChartSynchronization, 100);
        return;
    }
    
    syncSetupAttempts = 0;
    chartsSynchronized = true;
    
    const performanceTimeScale = portfolioPerformanceChart.timeScale();
    const portfolioTimeScale = portfolioValueChart.timeScale();
    const plTimeScale = plTrendChart.timeScale();
    
    function timeRangesEqual(range1, range2) {
        if (!range1 || !range2) return false;
        if (!range1.from || !range1.to || !range2.from || !range2.to) return false;
        const from1 = typeof range1.from === 'string' ? range1.from : String(range1.from);
        const to1 = typeof range1.to === 'string' ? range1.to : String(range1.to);
        const from2 = typeof range2.from === 'string' ? range2.from : String(range2.from);
        const to2 = typeof range2.to === 'string' ? range2.to : String(range2.to);
        return from1 === from2 && to1 === to2;
    }
    
    function syncRangeToOtherCharts(sourceRange, sourceTimeScale, direction) {
        if (isSyncingCharts) return;
        if (!sourceRange || !sourceRange.from || !sourceRange.to) return;
        
        // Validate source range values
        if (sourceRange.from === null || sourceRange.to === null) {
            if (window.Logger) {
                window.Logger.debug('Skipping sync - source range has null values', { 
                    page: 'portfolio-state-page', 
                    direction,
                    from: sourceRange.from,
                    to: sourceRange.to
                });
            }
            return;
        }
        
        // Sync to all other charts
        [performanceTimeScale, portfolioTimeScale, plTimeScale].forEach((targetTimeScale, index) => {
            if (targetTimeScale === sourceTimeScale) return;
            
            // Check if target timeScale is valid
            if (!targetTimeScale || typeof targetTimeScale.getVisibleRange !== 'function') {
                if (window.Logger) {
                    window.Logger.debug('Skipping sync - target timeScale not available', { 
                        page: 'portfolio-state-page', 
                        direction,
                        index
                    });
                }
                return;
            }
            
            let currentTargetRange = null;
            try {
                currentTargetRange = targetTimeScale.getVisibleRange();
            } catch (error) {
                // Chart may not be ready yet
                if (window.Logger) {
                    window.Logger.debug('Cannot get visible range from target chart (may not be ready)', { 
                        page: 'portfolio-state-page', 
                        direction,
                        error: error.message
                    });
                }
                return;
            }
            
            // Check if current range is valid
            if (!currentTargetRange || currentTargetRange.from === null || currentTargetRange.to === null) {
                // Chart is not ready yet, skip sync
                if (window.Logger) {
                    window.Logger.debug('Skipping sync - target chart range not ready', { 
                        page: 'portfolio-state-page', 
                        direction
                    });
                }
                return;
            }
            
            if (timeRangesEqual(sourceRange, currentTargetRange)) return;
            
            isSyncingCharts = true;
            try {
                targetTimeScale.setVisibleRange({
                    from: sourceRange.from,
                    to: sourceRange.to
                });
            } catch (error) {
                // Only log if it's not a "disposed" or "null" error (these are expected during initialization)
                if (error.message && !error.message.includes('disposed') && !error.message.includes('null')) {
                if (window.Logger) {
                    window.Logger.error(`Sync error (${direction})`, { page: 'portfolio-state-page', error });
                    }
                }
            } finally {
                setTimeout(() => { isSyncingCharts = false; }, 50);
            }
        });
    }
    
    // Sync performance chart to other charts
    if (typeof performanceTimeScale.subscribeVisibleTimeRangeChange === 'function') {
        performanceTimeScale.subscribeVisibleTimeRangeChange((newRange) => {
            syncRangeToOtherCharts(newRange, performanceTimeScale, 'Performance → Others');
        });
    }
    
    // Sync portfolio chart to other charts
    if (typeof portfolioTimeScale.subscribeVisibleTimeRangeChange === 'function') {
        portfolioTimeScale.subscribeVisibleTimeRangeChange((newRange) => {
            syncRangeToOtherCharts(newRange, portfolioTimeScale, 'Portfolio → Others');
        });
    }
    
    // Sync P/L chart to other charts
    if (typeof plTimeScale.subscribeVisibleTimeRangeChange === 'function') {
        plTimeScale.subscribeVisibleTimeRangeChange((newRange) => {
            syncRangeToOtherCharts(newRange, plTimeScale, 'P/L → Others');
        });
    }
}

// Setup zoom/pan/reset buttons
// Chart controls are now handled by TradingView's built-in controls (zoom, pan, etc.)
// No custom controls needed - users can use mouse wheel to zoom, drag to pan, etc.
function setupChartControls() {
    // TradingView charts have built-in controls:
    // - Mouse wheel: zoom in/out
    // - Drag: pan left/right
    // - Double click: fit content
    // - Right click: context menu with options
    // No custom controls needed
                if (window.Logger) {
        window.Logger.debug('Charts using TradingView built-in controls', { page: 'portfolio-state-page' });
    }
}

// REMOVED: generateMockPortfolioValueData - No mock data allowed
// This function was removed - use PortfolioStateData.loadSeries() instead
// If data is not available, show clear error message to user via NotificationSystem

// REMOVED: generateMockPortfolioPerformanceData_DEPRECATED - No mock data allowed
// This function was removed - use PortfolioStateData.loadSeries() instead
// If data is not available, show clear error message to user via NotificationSystem

// REMOVED: generateMockPLData_DEPRECATED - No mock data allowed
// This function was removed - use PortfolioStateData.loadSeries() instead
// If data is not available, show clear error message to user via NotificationSystem

// Compare dates (supports up to 4 dates)
async function compareDates() {
    // Base date is always "today" (היום)
    const baseDate = new Date().toISOString().split('T')[0];
    
    // Get all selected comparison dates (datePicker2-5)
    const getDateValue = (pickerId) => {
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
            return window.DataCollectionService.getValue(pickerId, 'dateOnly', '');
    } else {
            const el = document.getElementById(pickerId);
            return el ? el.value : '';
        }
    };
    
    const dates = [
        baseDate,
        getDateValue('datePicker2'),
        getDateValue('datePicker3'),
        getDateValue('datePicker4'),
        getDateValue('datePicker5')
    ].filter(date => date && date.trim() !== ''); // Filter out empty dates
    
    if (dates.length < 2) {
        if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
            window.NotificationSystem.showError('שגיאה', 'נא לבחור לפחות תאריך אחד להשוואה (בנוסף לתאריך הבסיס)');
        } else if (window.Logger) {
            window.Logger.warn('Please select at least one date for comparison', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    // Format dates for display using FieldRendererService
    const formatDate = (dateStr) => {
        return window.FieldRendererService.renderDate(dateStr, false);
    };
    
    // Update table headers dynamically
    const headerRow = document.getElementById('comparison-table-header');
    if (headerRow) {
        headerRow.innerHTML = '<th>מדד</th>';
        dates.forEach((date, index) => {
            const th = document.createElement('th');
            th.id = `comparison-date${index + 1}-header`;
            th.textContent = index === 0 ? `היום (${formatDate(date)})` : `תאריך ${index} (${formatDate(date)})`;
            headerRow.appendChild(th);
        });
    }
    
    // Show/hide remove buttons for each date picker
    dates.forEach((date, index) => {
        if (index === 0) return; // Skip base date
        const pickerId = `datePicker${index + 1}`;
        const removeBtn = document.querySelector(`.btn-remove-date[data-date-index="${index + 1}"]`);
        if (removeBtn && date) {
            removeBtn.classList.remove('hidden');
        }
    });
    
    // Show comparison table and hide placeholder
    const comparisonTableWrapper = document.getElementById('comparison-table-wrapper');
    const comparisonPlaceholder = document.getElementById('comparison-placeholder');
    
    if (comparisonTableWrapper) {
        comparisonTableWrapper.style.display = 'block';
        comparisonTableWrapper.classList.remove('hidden');
    }
    if (comparisonPlaceholder) {
        comparisonPlaceholder.style.display = 'none';
    }
    
    // Load comparison data for all dates
    const states = [];
    try {
        const accountId = getSelectedAccounts().length === 1 ? getSelectedAccounts()[0] : null;
        
        // Load state for each date
        for (const date of dates) {
            if (window.PortfolioStateData && typeof window.PortfolioStateData.loadSnapshot === 'function') {
                try {
                    const snapshot = await window.PortfolioStateData.loadSnapshot(accountId, date);
                    // The snapshot response structure from API: { data: { cash_balance, portfolio_value, total_pl, ... } }
                    // PortfolioStateData.loadSnapshot returns the data object directly
                    if (snapshot) {
                        // Check if snapshot has the required fields
                        if (snapshot.cash_balance !== undefined || snapshot.portfolio_value !== undefined || snapshot.total_pl !== undefined || snapshot.total_value !== undefined) {
                            // Map API fields to expected fields
                            const stateData = {
                                cash_balance: snapshot.cash_balance !== undefined ? snapshot.cash_balance : (snapshot.cash_balance === null ? null : undefined),
                                portfolio_value: snapshot.portfolio_value !== undefined ? snapshot.portfolio_value : (snapshot.total_value !== undefined ? snapshot.total_value : undefined),
                                total_pl: snapshot.total_pl !== undefined ? snapshot.total_pl : undefined,
                                positions_count: snapshot.positions_count !== undefined ? snapshot.positions_count : (snapshot.positions ? snapshot.positions.length : undefined)
                            };
                            states.push({
                                date: date,
                                state: stateData
                            });
                        } else {
                            if (window.Logger) {
                                window.Logger.warn('Snapshot missing required fields', { date, snapshot, page: 'portfolio-state-page' });
                            }
                            states.push({
                                date: date,
                                state: null // No data available
                            });
                        }
                    } else {
                        states.push({
                            date: date,
                            state: null // No data available
                        });
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Error loading snapshot for date', { date, error: error.message, page: 'portfolio-state-page' });
                    }
                    states.push({
                        date: date,
                        state: null // No data available
                    });
                }
            }
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('Error loading comparison data', { page: 'portfolio-state-page', error });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה', 'שגיאה בטעינת נתוני השוואה');
        }
        return;
    }
    
    // Build comparison data
    const metrics = ['יתרות', 'שווי תיק', 'P/L כולל', 'פוזיציות'];
    const metricKeys = ['cash_balance', 'portfolio_value', 'total_pl', 'positions_count'];
    
    const comparisonData = metrics.map((metric, metricIndex) => {
        const values = states.map(stateObj => {
            if (!stateObj.state) return null;
            const state = stateObj.state;
            const key = metricKeys[metricIndex];
            return state[key] !== null && state[key] !== undefined ? state[key] : null;
        });
        return { metric, values };
    });
    
    // Render comparison table
    const tbody = document.getElementById('comparison-table-body');
    if (!tbody) return;
    
    tbody.textContent = '';
    comparisonData.forEach(item => {
            const row = document.createElement('tr');
        
        // Metric cell
            const metricCell = document.createElement('td');
            metricCell.textContent = item.metric;
            row.appendChild(metricCell);
            
        // Value cells for each date
        item.values.forEach((value, index) => {
            const valueCell = document.createElement('td');
            if (value === null || value === undefined) {
                valueCell.textContent = 'לא זמין';
                valueCell.className = 'text-muted';
            } else {
        if (window.FieldRendererService) {
                    if (item.metric === 'פוזיציות') {
                        valueCell.textContent = value.toString();
        } else {
                        valueCell.innerHTML = window.FieldRendererService.renderAmount(value, '$', 0, false);
            }
        } else {
                    valueCell.textContent = item.metric === 'פוזיציות' ? value.toString() : value.toFixed(2);
                }
            }
            row.appendChild(valueCell);
        });
        
        tbody.appendChild(row);
    });
    
    if (window.Logger) {
        window.Logger.info('Comparison completed', { dates: dates.length, page: 'portfolio-state-page' });
    }
}

// Remove comparison date (supports removing specific date by index)
function removeComparisonDate(dateIndex = null) {
    // If dateIndex is provided, remove that specific date
    if (dateIndex) {
        const pickerId = `datePicker${dateIndex}`;
        const removeBtn = document.querySelector(`.btn-remove-date[data-date-index="${dateIndex}"]`);
        
        // Clear the date picker
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
            window.DataCollectionService.setValue(pickerId, '', 'dateOnly');
        } else {
            const pickerEl = document.getElementById(pickerId);
            if (pickerEl) pickerEl.value = '';
        }
        
        // Hide remove button
        if (removeBtn) {
            removeBtn.classList.add('hidden');
        }
        
        // Re-run comparison if there are still dates selected
        const hasDates = ['datePicker2', 'datePicker3', 'datePicker4', 'datePicker5'].some(id => {
            const el = document.getElementById(id);
            return el && el.value && el.value.trim() !== '';
        });
        
        if (hasDates) {
            compareDates();
    } else {
            // No dates left - hide table
    const comparisonTableWrapper = document.getElementById('comparison-table-wrapper');
    const comparisonPlaceholder = document.getElementById('comparison-placeholder');
    if (comparisonTableWrapper) {
        comparisonTableWrapper.style.display = 'none';
                comparisonTableWrapper.classList.add('hidden');
    }
    if (comparisonPlaceholder) {
        comparisonPlaceholder.style.display = 'block';
    }
        }
        return;
    }
    
    // Legacy: Remove all dates (for backward compatibility)
    ['datePicker2', 'datePicker3', 'datePicker4', 'datePicker5'].forEach(pickerId => {
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
            window.DataCollectionService.setValue(pickerId, '', 'dateOnly');
        } else {
            const pickerEl = document.getElementById(pickerId);
            if (pickerEl) pickerEl.value = '';
        }
    });
    
    // Hide all remove buttons
    document.querySelectorAll('.btn-remove-date').forEach(btn => {
        btn.classList.add('hidden');
    });
    
    // Hide comparison table
    const comparisonTableWrapper = document.getElementById('comparison-table-wrapper');
    const comparisonPlaceholder = document.getElementById('comparison-placeholder');
    if (comparisonTableWrapper) {
        comparisonTableWrapper.style.display = 'none';
        comparisonTableWrapper.classList.add('hidden');
    }
    if (comparisonPlaceholder) {
        comparisonPlaceholder.style.display = 'block';
    }
}

// Toggle section
// Note: toggleSection is now provided by ui-utils.js
// No local function needed

// Load user preferences
async function loadUserPreferences() {
    try {
        // Initialize preferences if available
        if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
            await window.PreferencesCore.initializeWithLazyLoading();
            if (window.Logger) {
                window.Logger.info('✅ PreferencesCore initialized', { page: 'portfolio-state-page' });
            }
        }
        
        // Wait for preferences to be available in global scope
        let retries = 0;
        while ((!window.currentPreferences && !window.__latestPrefs) && retries < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (window.currentPreferences || window.__latestPrefs) {
            if (window.Logger) {
                window.Logger.info('✅ User preferences available in global scope', { page: 'portfolio-state-page' });
            }
        } else {
            if (window.Logger) {
                window.Logger.warn('⚠️ User preferences not found in global scope after timeout', { page: 'portfolio-state-page' });
            }
        }
        
        // Reload TradingView theme preferences if available
        if (window.TradingViewTheme && typeof window.TradingViewTheme.loadPreferences === 'function') {
            await window.TradingViewTheme.loadPreferences();
            if (window.Logger) {
                window.Logger.info('✅ TradingView theme preferences reloaded', { page: 'portfolio-state-page' });
            }
        }
        
        if (window.Logger) {
            window.Logger.info('✅ User preferences loaded successfully', { page: 'portfolio-state-page' });
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('⚠️ Could not load user preferences (non-critical)', { page: 'portfolio-state-page', error });
        }
    }
}

// Wait for all required scripts to load
async function waitForScripts() {
    // TradingViewChartAdapter is required
    let retries = 0;
    while (typeof window.TradingViewChartAdapter === 'undefined' && retries < 100) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
    }
    
    if (typeof window.TradingViewChartAdapter === 'undefined') {
        if (window.Logger) {
            window.Logger.warn('⚠️ Script TradingViewChartAdapter not loaded after timeout', { page: 'portfolio-state-page' });
        }
    } else {
        if (window.Logger) {
            window.Logger.info('✅ Script TradingViewChartAdapter loaded', { page: 'portfolio-state-page' });
        }
    }
    
    // LightweightCharts library - check both possible names
    retries = 0;
    while ((typeof window.LightweightCharts === 'undefined' && 
            typeof window.lightweightCharts === 'undefined') && 
           retries < 100) {
        await new Promise(resolve => setTimeout(resolve, 50));
        retries++;
    }
    
    if (typeof window.LightweightCharts !== 'undefined') {
        if (window.Logger) {
            window.Logger.info('✅ Script LightweightCharts loaded', { page: 'portfolio-state-page' });
        }
    } else if (typeof window.lightweightCharts !== 'undefined') {
        if (window.Logger) {
            window.Logger.info('✅ Script lightweightCharts loaded', { page: 'portfolio-state-page' });
        }
    } else {
        if (window.Logger) {
            window.Logger.warn('⚠️ Script LightweightCharts/lightweightCharts not loaded after timeout', { page: 'portfolio-state-page' });
        }
    }
}

    /**
     * Initialize Header System
     */
    async function initializeHeader() {
        // Check if HeaderSystem is already initialized to prevent duplicate initialization
        if (window.headerSystem && window.headerSystem.isInitialized) {
            if (window.Logger) {
                window.Logger.info('✅ Header System already initialized, skipping', { page: 'portfolio-state-page' });
            }
            return;
        }
        
        // Wait for HeaderSystem to be available
        if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
            try {
                await window.HeaderSystem.initialize();
                if (window.Logger) {
                    window.Logger.info('✅ Header System initialized', { page: 'portfolio-state-page' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error initializing Header System', { 
                        page: 'portfolio-state-page', 
                        error 
                    });
                }
            }
        } else {
            // Retry after a short delay if HeaderSystem not loaded yet
            setTimeout(() => {
                // Check again if already initialized
                if (window.headerSystem && window.headerSystem.isInitialized) {
                    if (window.Logger) {
                        window.Logger.info('✅ Header System already initialized (retry check), skipping', { page: 'portfolio-state-page' });
                    }
                    return;
                }
                
                if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                    window.HeaderSystem.initialize().catch((error) => {
                        if (window.Logger) {
                            window.Logger.error('Error initializing Header System (retry)', { 
                                page: 'portfolio-state-page', 
                                error 
                            });
                        }
                    });
                } else {
                    if (window.Logger) {
                        window.Logger.warn('HeaderSystem not available after retry', { page: 'portfolio-state-page' });
                    }
                }
            }, 500);
        }
    }

    /**
     * Register trades table with UnifiedTableSystem
     */
    function registerPortfolioTradesTable() {
        if (window.Logger) {
            window.Logger.info('🔄 registerPortfolioTradesTable called', { 
                hasUnifiedTableSystem: !!window.UnifiedTableSystem,
                hasRegistry: !!(window.UnifiedTableSystem && window.UnifiedTableSystem.registry),
                page: 'portfolio-state-page' 
            });
        }
        
        if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
            if (window.Logger) {
                window.Logger.error('❌ UnifiedTableSystem not available for table registration', { 
                    hasUnifiedTableSystem: !!window.UnifiedTableSystem,
                    hasRegistry: !!(window.UnifiedTableSystem && window.UnifiedTableSystem.registry),
                    page: 'portfolio-state-page' 
                });
            }
            return;
        }

        // Get column mappings (use trades mapping as fallback)
        const getColumns = () => {
            return window.TABLE_COLUMN_MAPPINGS?.['portfolio-trades'] || 
                   window.TABLE_COLUMN_MAPPINGS?.['trades'] || [];
        };

        // Register portfolio trades table
        window.UnifiedTableSystem.registry.register('portfolio-trades', {
            dataGetter: () => filteredTrades || [],
            updateFunction: (data) => {
                if (window.Logger) {
                    window.Logger.info('🔄 Registered updateFunction called', { 
                        dataLength: data?.length || 0,
                        isArray: Array.isArray(data),
                        page: 'portfolio-state-page' 
                    });
                }
                
                // Update filtered trades
                filteredTrades = Array.isArray(data) ? data : [];
                
                if (window.Logger) {
                    window.Logger.info('📊 Filtered trades updated, using UnifiedTableSystem.renderer.render', { 
                        filteredTradesCount: filteredTrades.length,
                        page: 'portfolio-state-page' 
                    });
                }
                
                // Use UnifiedTableSystem.renderer.render (general system) - REQUIRED, no manual rendering
                if (window.UnifiedTableSystem && window.UnifiedTableSystem.renderer && typeof window.UnifiedTableSystem.renderer.render === 'function') {
                    try {
                        window.UnifiedTableSystem.renderer.render('portfolio-trades', filteredTrades);
                        
                        // Update trades summary using InfoSummarySystem (general system) - async, but don't block
                        updateTradesSummary(filteredTrades).catch(err => {
                            if (window.Logger) {
                                window.Logger.warn('Failed to update trades summary', { error: err, page: 'portfolio-state-page' });
                            }
                        });
                        
                        if (window.Logger) {
                            window.Logger.info('✅ Table rendered via UnifiedTableSystem.renderer.render', { 
                                tradesCount: filteredTrades.length,
                                page: 'portfolio-state-page' 
                            });
                        }
                    } catch (error) {
                        if (window.Logger) {
                            window.Logger.error('❌ Error rendering table via UnifiedTableSystem.renderer.render', { 
                                error: error.message, 
                                stack: error.stack,
                                page: 'portfolio-state-page' 
                            });
                        }
                        if (window.NotificationSystem) {
                            window.NotificationSystem.showError(
                                'שגיאה בעדכון טבלה',
                                'שגיאה בעדכון טבלת טריידים. נא לנסות שוב.'
                            );
                        }
                    }
                } else {
                    if (window.Logger) {
                        window.Logger.error('❌ UnifiedTableSystem.renderer.render not available', { page: 'portfolio-state-page' });
                    }
                    if (window.NotificationSystem) {
                        window.NotificationSystem.showError(
                            'שגיאה בעדכון טבלה',
                            'מערכת רינדור טבלאות לא זמינה. נא לרענן את הדף.'
                        );
                    }
                }
            },
            tableSelector: '#tradesTable',
            columns: getColumns(),
            sortable: true,
            filterable: true,
            // Default sort: created_at desc (column index 10)
            defaultSort: { columnIndex: 10, direction: 'desc', key: 'created_at' }
        });

        // Register with TableDataRegistry
        if (window.TableDataRegistry) {
            window.TableDataRegistry.registerTable({
                tableType: 'portfolio-trades',
                tableId: 'tradesTable',
                source: 'portfolio-state-page'
            });
        }

        // Verify registration
        const verifyConfig = window.UnifiedTableSystem.registry.getConfig('portfolio-trades');
        if (window.Logger) {
            window.Logger.info('✅ Registered portfolio trades table with UnifiedTableSystem', { 
                tableType: 'portfolio-trades',
                tableId: 'tradesTable',
                isRegistered: !!verifyConfig,
                hasUpdateFunction: !!(verifyConfig && verifyConfig.updateFunction),
                page: 'portfolio-state-page' 
            });
        }
    }

    /**
     * Save page state (filters, sections, charts)
     */
    async function savePageState() {
        if (!window.PageStateManager) {
            return;
        }

        try {
            const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
            const dateRange = selectedItem ? selectedItem.getAttribute('data-value') : 'היום';
            const selectedAccounts = getSelectedAccounts();
            const investmentType = document.getElementById('filterInvestmentType')?.value || '';

            // Get section states
            const sections = {};
            const sectionIds = ['portfolio-state-top-section', 'charts-section', 'trades-table-section'];
            sectionIds.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionBody = section.querySelector('.section-body');
                    sections[sectionId] = sectionBody ? sectionBody.style.display === 'none' : false;
                }
            });

            const state = {
                filters: {
                    dateRange: dateRange,
                    selectedAccounts: selectedAccounts,
                    investmentType: investmentType
                },
                sections: sections,
                charts: {
                    period: currentPeriod['both'] || 'month'
                }
            };

            await window.PageStateManager.savePageState('portfolio-state', state);
            if (window.Logger) {
                window.Logger.debug('✅ Saved page state', { page: 'portfolio-state-page' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save page state', { error, page: 'portfolio-state-page' });
            }
        }
    }

    /**
     * Restore page state (filters, sections, charts)
     */
    async function restorePageState() {
        if (!window.PageStateManager) {
            return;
        }

        try {
            const state = await window.PageStateManager.loadPageState('portfolio-state');
            if (!state) {
                return;
            }

            // Restore filters
            if (state.filters) {
                // Restore date range
                if (state.filters.dateRange) {
                    const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
                    dateRangeItems.forEach(item => item.classList.remove('selected'));
                    const targetItem = document.querySelector(`#dateRangeFilterMenu .date-range-filter-item[data-value="${state.filters.dateRange}"]`);
                    if (targetItem) {
                        targetItem.classList.add('selected');
                        selectDateRangeOption(state.filters.dateRange);
                    }
                }

                // Restore investment type
                if (state.filters.investmentType) {
                    const investmentSelect = document.getElementById('filterInvestmentType');
                    if (investmentSelect) {
                        // Use DataCollectionService to set value if available
                        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                          window.DataCollectionService.setValue(investmentSelect.id, state.filters.investmentType, 'text');
                        } else {
                          investmentSelect.value = state.filters.investmentType;
                        }
                    }
                }

                // Restore selected accounts (will be restored after accounts are loaded)
                if (state.filters.selectedAccounts && Array.isArray(state.filters.selectedAccounts)) {
                    // Store for later restoration after accounts are loaded
                    window._pendingAccountRestore = state.filters.selectedAccounts;
                }
            }

            // Restore sections
            if (state.sections) {
                Object.keys(state.sections).forEach(sectionId => {
                    const isHidden = state.sections[sectionId];
                    if (isHidden) {
                        const section = document.getElementById(sectionId);
                        if (section) {
                            const sectionBody = section.querySelector('.section-body');
                            if (sectionBody) {
                                sectionBody.style.display = 'none';
                            }
                        }
                    }
                });
            }

            // Restore charts period
            if (state.charts && state.charts.period) {
                currentPeriod['both'] = state.charts.period;
                // Set active button
                document.querySelectorAll('[data-onclick*="setChartPeriod"]').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.getAttribute('data-onclick').includes(`'${state.charts.period}'`)) {
                        btn.classList.add('active');
                    }
                });
            }

            if (window.Logger) {
                window.Logger.debug('✅ Restored page state', { page: 'portfolio-state-page' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to restore page state', { error, page: 'portfolio-state-page' });
            }
        }
    }

    /**
     * Restore selected accounts after accounts are loaded
     */
    function restoreSelectedAccounts() {
        if (!window._pendingAccountRestore) {
            return;
        }

        const selectedAccounts = window._pendingAccountRestore;
        delete window._pendingAccountRestore;

        // Clear all selections
        const accountItems = document.querySelectorAll('#accountFilterMenu .account-filter-item');
        accountItems.forEach(item => item.classList.remove('selected'));

        // Restore selections
        if (selectedAccounts.includes('הכול') || selectedAccounts.length === 0) {
            const allItem = document.querySelector('#accountFilterMenu .account-filter-item[data-value="הכול"]');
            if (allItem) {
                allItem.classList.add('selected');
            }
        } else {
            selectedAccounts.forEach(accountId => {
                const accountItem = document.querySelector(`#accountFilterMenu .account-filter-item[data-value="${accountId}"]`);
                if (accountItem) {
                    accountItem.classList.add('selected');
                }
            });
        }

        updateAccountFilterText();
    }

    /**
     * Initialize page
     */
    /**
     * Apply dynamic colors for portfolio state page
     * Uses trading_account entity color
     */
    async function applyDynamicColors() {
        try {
            window.Logger?.info?.('Applying dynamic color system', { page: 'portfolio-state-page' });
            
            // Load entity colors from global system
            if (typeof window.loadEntityColors === 'function') {
                const entityColors = await window.loadEntityColors();
                if (entityColors) {
                    window.Logger?.debug?.('Entity colors loaded', { entityColors, page: 'portfolio-state-page' });
                    
                    // Apply trading_account colors (portfolio state displays trading accounts)
                    if (entityColors.trading_account) {
                        document.documentElement.style.setProperty('--trading-account-color', entityColors.trading_account);
                        document.documentElement.style.setProperty('--trading-account-bg-color', entityColors.trading_account + '20');
                    }
                }
            }
            
            // Also use getEntityColor for direct access
            if (typeof window.getEntityColor === 'function') {
                const tradingAccountColor = window.getEntityColor('trading_account');
                if (tradingAccountColor) {
                    document.documentElement.style.setProperty('--trading-account-color', tradingAccountColor);
                    document.documentElement.style.setProperty('--trading-account-bg-color', tradingAccountColor + '20');
                }
            }
        } catch (error) {
            window.Logger?.error?.('Error applying dynamic colors', { error: error.message, page: 'portfolio-state-page' });
        }
    }

    async function initializePage() {
        // Initialize Header System first
        initializeHeader();
        
        // Wait for all scripts to load first
        await waitForScripts();
        
        // Apply dynamic colors (trading_account entity)
        await applyDynamicColors();

        // Verify critical globals are available
        const requiredGlobals = [
            { key: 'window.UnifiedTableSystem', value: window.UnifiedTableSystem },
            { key: 'window.InfoSummarySystem', value: window.InfoSummarySystem },
            { key: 'window.UnifiedProgressManager', value: window.UnifiedProgressManager },
            { key: 'window.ButtonSystem', value: window.ButtonSystem },
            { key: 'window.FieldRendererService', value: window.FieldRendererService },
        ];
        const missingGlobals = requiredGlobals.filter(item => !item.value).map(item => item.key);
        if (missingGlobals.length) {
            window.Logger?.error?.('❌ Missing required globals for portfolio-state', {
                page: 'portfolio-state-page',
                missingGlobals
            });
        }

        // Ensure authenticated session before loading data
        if (window.AuthGuard?.init) {
            try {
                await window.AuthGuard.init();
            } catch (e) {
                window.Logger?.warn?.('⚠️ AuthGuard init failed in initializePage', { page: 'portfolio-state-page', error: e?.message });
            }
        } else if (window.checkAuthentication) {
            try {
                await window.checkAuthentication();
            } catch (e) {
                window.Logger?.warn?.('⚠️ checkAuthentication failed in initializePage', { page: 'portfolio-state-page', error: e?.message });
            }
        }
        // Ensure TikTrackAuth has in-memory user for isAuthenticated()
        if (window.TikTrackAuth?.checkAuthentication) {
            try {
                const authResult = await window.TikTrackAuth.checkAuthentication();
                if (authResult?.authenticated && authResult.user) {
                    window.currentUser = authResult.user;
                }
            } catch (e) {
                window.Logger?.warn?.('⚠️ TikTrackAuth.checkAuthentication failed in initializePage', { page: 'portfolio-state-page', error: e?.message });
            }
        }
        
        // Register table with UnifiedTableSystem
        registerPortfolioTradesTable();
        
        // Load user preferences first
        await loadUserPreferences();
        
        // Restore page state before setting defaults
        await restorePageState();
        
        // Set default date range to "היום" (today) only if not restored
        const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
        if (!selectedItem) {
            const dateRangeItems = document.querySelectorAll('#dateRangeFilterMenu .date-range-filter-item');
            dateRangeItems.forEach(item => item.classList.remove('selected'));
            const todayItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item[data-value="היום"]');
            if (todayItem) {
                todayItem.classList.add('selected');
            }
            updateDateRangeFilterText();
        }
        
        // Load trading accounts first - this populates the account filter menu
        await loadTradingAccounts();
        
        // Restore selected accounts after accounts are loaded
        restoreSelectedAccounts();
        
        // Load investment types (uses system-wide VALID_INVESTMENT_TYPES for consistency)
        loadInvestmentTypes();
        
        // Populate year select and set default to previous month
        populateYearSelect();
        const monthSelect = document.getElementById('tradesMonthSelect');
        if (monthSelect) {
            const previousMonth = new Date();
            previousMonth.setMonth(previousMonth.getMonth() - 1);
            monthSelect.value = previousMonth.getMonth() + 1; // Months are 1-12
        }
        
        // Load trades for default month/year automatically
        if (monthSelect && document.getElementById('tradesYearSelect')) {
            // Wait for DOM to be fully ready and selects to be populated
            // Use requestAnimationFrame to ensure DOM is ready, then small delay for select population
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (window.Logger) {
                        window.Logger.info('Loading trades for default month/year', { 
                            month: monthSelect.value,
                            year: document.getElementById('tradesYearSelect')?.value,
                            page: 'portfolio-state-page' 
                        });
                    }
                    loadTradesForMonthYear();
                }, 200); // Increased delay to ensure selects are populated
            });
        }
        
        // Set max date for date pickers (prevent future dates)
        const datePicker2 = document.getElementById('datePicker2');
        const datePicker3 = document.getElementById('datePicker3');
        const datePicker4 = document.getElementById('datePicker4');
        const datePicker5 = document.getElementById('datePicker5');
        const today = new Date().toISOString().split('T')[0];
        [datePicker2, datePicker3, datePicker4, datePicker5].forEach(picker => {
            if (picker) {
                picker.setAttribute('max', today);
            }
        });
        
        // Setup lazy loading for chart
        setupLazyChartLoading();
        
        await loadPortfolioState();
        
        // Load chart default period from preferences (only if not restored from state)
        if (!currentPeriod['both']) {
            await loadChartDefaultPeriod();
        }
        
        // Charts use TradingView default controls (zoom, pan, etc.) - no custom controls needed

        // Save state on filter changes
        const originalApplyFilters = applyFilters;
        window.portfolioStatePage.applyFilters = async function() {
            await originalApplyFilters();
            await savePageState();
        };

        // Save state on section toggle (hook into toggleSection)
        if (window.toggleSection) {
            const originalToggleSection = window.toggleSection;
            window.toggleSection = function(sectionId) {
                originalToggleSection(sectionId);
                savePageState();
            };
        }
    }

    // Initialize via UnifiedAppInitializer (preferred) or fallback to DOMContentLoaded
    // Check if UnifiedAppInitializer is available and will handle initialization
    const initializePageFallback = async () => {
        // Wait a bit for all scripts to load
    if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                // Wait for critical dependencies
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Check if already initialized by UnifiedAppInitializer
                if (window.globalInitializationState?.unifiedAppInitialized) {
                    if (window.Logger) {
                        window.Logger.debug('Portfolio State Page already initialized by UnifiedAppInitializer', { page: 'portfolio-state-page' });
                    }
                    return;
                }
                
                // Check if UnifiedAppInitializer exists and is initializing
                if (window.unifiedAppInit && window.unifiedAppInit.initializationInProgress) {
                    if (window.Logger) {
                        window.Logger.debug('Waiting for UnifiedAppInitializer to complete', { page: 'portfolio-state-page' });
                    }
                    // Wait up to 5 seconds for UnifiedAppInitializer
                    let waitCount = 0;
                    while (waitCount < 50 && window.unifiedAppInit.initializationInProgress) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        waitCount++;
                    }
                    
                    // If UnifiedAppInitializer completed, don't initialize again
                    if (window.globalInitializationState?.unifiedAppInitialized) {
                        if (window.Logger) {
                            window.Logger.debug('UnifiedAppInitializer completed, skipping fallback', { page: 'portfolio-state-page' });
                        }
                        return;
                    }
                }
                
                // Fallback: Initialize directly if UnifiedAppInitializer is not available or failed
                if (window.Logger) {
                    window.Logger.info('Initializing Portfolio State Page via fallback (UnifiedAppInitializer not available)', { page: 'portfolio-state-page' });
                }
                await initializePage();
            });
    } else {
        // DOM already loaded
            // Wait for critical dependencies
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check if already initialized by UnifiedAppInitializer
            if (window.globalInitializationState?.unifiedAppInitialized) {
                if (window.Logger) {
                    window.Logger.debug('Portfolio State Page already initialized by UnifiedAppInitializer', { page: 'portfolio-state-page' });
                }
                return;
            }
            
            // Check if UnifiedAppInitializer exists and is initializing
            if (window.unifiedAppInit && window.unifiedAppInit.initializationInProgress) {
                if (window.Logger) {
                    window.Logger.debug('Waiting for UnifiedAppInitializer to complete', { page: 'portfolio-state-page' });
                }
                // Wait up to 5 seconds for UnifiedAppInitializer
                let waitCount = 0;
                while (waitCount < 50 && window.unifiedAppInit.initializationInProgress) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    waitCount++;
                }
                
                // If UnifiedAppInitializer completed, don't initialize again
                if (window.globalInitializationState?.unifiedAppInitialized) {
                    if (window.Logger) {
                        window.Logger.debug('UnifiedAppInitializer completed, skipping fallback', { page: 'portfolio-state-page' });
                    }
                    return;
                }
            }
            
            // Fallback: Initialize directly if UnifiedAppInitializer is not available or failed
            if (window.Logger) {
                window.Logger.info('Initializing Portfolio State Page via fallback (UnifiedAppInitializer not available)', { page: 'portfolio-state-page' });
            }
            await initializePage();
        }
    };
    
    // Only set up fallback if UnifiedAppInitializer is not available
    // UnifiedAppInitializer will call initializePage() via customInitializers
    if (!window.UnifiedAppInitializer && !window.PAGE_CONFIGS) {
        // UnifiedAppInitializer not available, use fallback
        initializePageFallback();
    } else {
        // UnifiedAppInitializer is available, it will handle initialization
        if (window.Logger) {
            window.Logger.debug('Portfolio State Page will be initialized by UnifiedAppInitializer', { page: 'portfolio-state-page' });
        }
    }

    // Debug function: Show chart data table for last week
    async function showChartDataTable() {
        try {
            const container = document.getElementById('chart-data-table-container');
            const tableBody = document.getElementById('chart-data-table-body');
            
            if (!container || !tableBody) {
                if (window.NotificationSystem) {
                    window.NotificationSystem.showError('שגיאה', 'אלמנט הטבלה לא נמצא');
                }
                return;
            }
            
            // Toggle visibility
            const isVisible = container.style.display !== 'none';
            if (isVisible) {
                // Hide table
                container.style.display = 'none';
                return;
            }
            
            // Show loading state
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center">טוען נתונים...</td></tr>';
            container.style.display = 'block';
            
            // Calculate last week dates
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            const accountId = getSelectedAccounts().length === 1 ? getSelectedAccounts()[0] : null;
            
            if (window.Logger) {
                window.Logger.info('📊 Loading chart data for table', { 
                    startDate: startDateStr, 
                    endDate: endDateStr, 
                    accountId,
                    page: 'portfolio-state-page' 
                });
            }
            
            // Load series data
            const series = await window.PortfolioStateData.loadSeries(accountId, startDateStr, endDateStr, {
                interval: 'day',
                force: true // Force fresh data
            });
            
            if (!series || !Array.isArray(series.snapshots)) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">לא נמצאו נתונים עבור השבוע האחרון</td></tr>';
                if (window.NotificationSystem) {
                    window.NotificationSystem.showError('שגיאה', 'לא נמצאו נתונים עבור השבוע האחרון');
                }
                return;
            }
            
            // Clear table body
            tableBody.innerHTML = '';
            
            series.snapshots.forEach((snapshot, index) => {
                const dateValue = snapshot.snapshot_date || snapshot.date;
                
                const row = document.createElement('tr');
                
                // Date
                const dateCell = document.createElement('td');
                dateCell.textContent = dateValue ? new Date(dateValue).toLocaleDateString('he-IL') : '-';
                row.appendChild(dateCell);
                
                // שווי פוזיציות (Positions Value)
                const valueCell = document.createElement('td');
                valueCell.className = 'text-end';
                if (window.FieldRendererService?.renderAmount) {
                    valueCell.innerHTML = window.FieldRendererService.renderAmount(snapshot.total_value, '$', 0, false) || '-';
                } else {
                    valueCell.textContent = snapshot.total_value?.toFixed(2) || '-';
                }
                row.appendChild(valueCell);
                
                // P/L ממומש (Realized P/L)
                const realizedCell = document.createElement('td');
                realizedCell.className = 'text-end';
                if (window.FieldRendererService?.renderAmount) {
                    realizedCell.innerHTML = window.FieldRendererService.renderAmount(snapshot.total_realized_pl, '$', 0, true) || '-';
                } else {
                    realizedCell.textContent = snapshot.total_realized_pl?.toFixed(2) || '-';
                }
                row.appendChild(realizedCell);
                
                // P/L לא ממומש (Unrealized P/L)
                const unrealizedCell = document.createElement('td');
                unrealizedCell.className = 'text-end';
                if (window.FieldRendererService?.renderAmount) {
                    unrealizedCell.innerHTML = window.FieldRendererService.renderAmount(snapshot.total_unrealized_pl, '$', 0, true) || '-';
                } else {
                    unrealizedCell.textContent = snapshot.total_unrealized_pl?.toFixed(2) || '-';
                }
                row.appendChild(unrealizedCell);
                
                // P/L כולל (Total P/L)
                const plCell = document.createElement('td');
                plCell.className = 'text-end';
                if (window.FieldRendererService?.renderAmount) {
                    plCell.innerHTML = window.FieldRendererService.renderAmount(snapshot.total_pl, '$', 0, true) || '-';
                } else {
                    plCell.textContent = snapshot.total_pl?.toFixed(2) || '-';
                }
                row.appendChild(plCell);
                
                // Cash Balance
                const cashCell = document.createElement('td');
                cashCell.className = 'text-end';
                if (window.FieldRendererService?.renderAmount) {
                    cashCell.innerHTML = window.FieldRendererService.renderAmount(snapshot.cash_balance, '$', 0, false) || '-';
                } else {
                    cashCell.textContent = snapshot.cash_balance?.toFixed(2) || '-';
                }
                row.appendChild(cashCell);
                
                // Positions Count
                const positionsCell = document.createElement('td');
                positionsCell.className = 'text-end';
                positionsCell.textContent = snapshot.positions_count || 0;
                row.appendChild(positionsCell);
                
                tableBody.appendChild(row);
            });
            
            // Update summary info
            const summaryInfo = container.querySelector('.chart-data-summary');
            if (summaryInfo) {
                summaryInfo.innerHTML = `<p class="mb-0"><strong>סה"כ snapshots:</strong> ${series.snapshots.length} | <strong>תקופה:</strong> ${startDateStr} עד ${endDateStr}</p>`;
            }
            
        } catch (error) {
            const tableBody = document.getElementById('chart-data-table-body');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">שגיאה בטעינת נתונים</td></tr>';
            }
            if (window.Logger) {
                window.Logger.error('Error showing chart data table', { page: 'portfolio-state-page', error });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה', `שגיאה בטעינת נתוני גרף: ${error.message}`);
            }
        }
    }

    // Chart zoom and time range functions
    function chartZoomIn() {
        if (!unifiedPortfolioChart) return;
        try {
            const timeScale = unifiedPortfolioChart.timeScale();
            const visibleRange = timeScale.getVisibleRange();
            if (visibleRange && visibleRange.from && visibleRange.to) {
                const range = visibleRange.to - visibleRange.from;
                const newRange = range * 0.8;
                const center = (visibleRange.from + visibleRange.to) / 2;
                timeScale.setVisibleRange({
                    from: center - newRange / 2,
                    to: center + newRange / 2
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Error zooming in chart', { error: error.message, page: 'portfolio-state-page' });
            }
        }
    }
    
    function chartZoomOut() {
        if (!unifiedPortfolioChart) return;
        try {
            const timeScale = unifiedPortfolioChart.timeScale();
            const visibleRange = timeScale.getVisibleRange();
            if (visibleRange && visibleRange.from && visibleRange.to) {
                const range = visibleRange.to - visibleRange.from;
                const newRange = range * 1.25;
                const center = (visibleRange.from + visibleRange.to) / 2;
                timeScale.setVisibleRange({
                    from: center - newRange / 2,
                    to: center + newRange / 2
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Error zooming out chart', { error: error.message, page: 'portfolio-state-page' });
            }
        }
    }
    
    function chartFitContent() {
        if (!unifiedPortfolioChart) return;
        try {
            const timeScale = unifiedPortfolioChart.timeScale();
            if (timeScale && typeof timeScale.fitContent === 'function') {
                timeScale.fitContent();
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Error fitting content to chart', { error: error.message, page: 'portfolio-state-page' });
            }
        }
    }
    
    function setChartTimeRange(range) {
        if (!unifiedPortfolioChart) return;
        try {
            const timeScale = unifiedPortfolioChart.timeScale();
            const now = Date.now() / 1000; // Current time in seconds
            
            let fromTime;
            switch (range) {
                case '1D':
                    fromTime = now - 24 * 60 * 60; // 1 day
                    break;
                case '1W':
                    fromTime = now - 7 * 24 * 60 * 60; // 1 week
                    break;
                case '1M':
                    fromTime = now - 30 * 24 * 60 * 60; // 1 month
                    break;
                case '3M':
                    fromTime = now - 90 * 24 * 60 * 60; // 3 months
                    break;
                case '1Y':
                    fromTime = now - 365 * 24 * 60 * 60; // 1 year
                    break;
                case 'ALL':
                    // Fit all content
                    if (typeof timeScale.fitContent === 'function') {
                        timeScale.fitContent();
                        return;
                    }
                    // Fallback: set to a very old date
                    fromTime = now - 10 * 365 * 24 * 60 * 60; // 10 years
                    break;
                default:
                    return;
            }
            
            timeScale.setVisibleRange({
                from: fromTime,
                to: now
            });
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Error setting chart time range', { range, error: error.message, page: 'portfolio-state-page' });
            }
        }
    }

    // Export functions to window for debugging
    window.portfolioStatePage = {
        initializePage, // Export for UnifiedAppInitializer
        toggleCardDetails,
        compareDates,
        removeComparisonDate,
        getCSSVariableValue,
        loadTradingAccounts,
        loadPortfolioState,
        loadTradesForMonthYear, // Export for month/year selection
        populateYearSelect, // Export for year select population
        showChartDataTable, // Export for debugging - show chart data table
        setChartPeriod, // Export for chart period buttons
        chartZoomIn, // Export for chart zoom in
        chartZoomOut, // Export for chart zoom out
        chartFitContent, // Export for chart fit content
        setChartTimeRange, // Export for chart time range
        applyFilters,
        clearFilters,
        toggleDateRangeFilterMenu,
        selectDateRangeOption,
        handleCustomDateFromChange,
        handleCustomDateToChange,
        applyCustomDateRange,
        toggleAccountFilterMenu,
        selectAccountOption,
        populateAccountFilterMenu
    };
    
    // Also export setChartPeriod to window for direct access from HTML
    window.setChartPeriod = setChartPeriod;

})();


