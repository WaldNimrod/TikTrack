/**
 * Portfolio State Page - Portfolio state and performance charts
 * 
 * This file handles the portfolio state page functionality.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initPortfolioPerformanceChart() - Initportfolioperformancechart
// - initPortfolioValueChart() - Initportfoliovaluechart
// - initPLTrendChart() - Initpltrendchart
// - setupChartSynchronization() - Setupchartsynchronization
// - setupChartControls() - Setupchartcontrols
// - initializeHeader() - Initializeheader
// - initializePage() - Initializepage

// === Event Handlers ===
// - convertDateToChartFormat() - Convertdatetochartformat
// - selectDateRangeOption() - Selectdaterangeoption
// - handleCustomDateFromChange() - Handlecustomdatefromchange
// - handleCustomDateToChange() - Handlecustomdatetochange
// - selectAccountOption() - Selectaccountoption
// - loadTradesForMonthYear() - Loadtradesformonthyear
// - removeComparisonDate() - Removecomparisondate

// === UI Functions ===
// - updateDateRangeFilterText() - Updatedaterangefiltertext
// - updateAccountFilterText() - Updateaccountfiltertext
// - renderNumericValue() - Rendernumericvalue
// - showLoadingState() - Showloadingstate
// - hideLoadingState() - Hideloadingstate
// - renderTradeRow() - Rendertraderow
// - updateTradesTable() - Updatetradestable
// - updateTradesSummary() - Updatetradessummary
// - updateSummaryCards() - Updatesummarycards
// - renderAmount() - Renderamount

// === Data Functions ===
// - getCSSVariableValue() - Getcssvariablevalue
// - loadTradingAccounts() - Loadtradingaccounts
// - loadInvestmentTypes() - Loadinvestmenttypes
// - getDateRange() - Getdaterange
// - getSelectedAccounts() - Getselectedaccounts
// - loadChartDefaultPeriod() - Loadchartdefaultperiod
// - checkPortfolioDataCompleteness() - Checkportfoliodatacompleteness
// - ensurePortfolioHistoricalData() - Ensureportfoliohistoricaldata (EOD integrated)
// - loadPortfolioState() - Loadportfoliostate
// - loadTrades() - Loadtrades
// - calculateSummaryFromTrades() - Calculatesummaryfromtrades (EOD integrated)
// - getLighterColor() - Getlightercolor
// - syncRangeToOtherCharts() - Syncrangetoothercharts
// - getTimeDiff() - Gettimediff
// - loadUserPreferences() - Loaduserpreferences
// - savePageState() - Savepagestate
// - getColumns() - Getcolumns

// === Utility Functions ===
// - formatCurrency() - Formatcurrency
// - formatDate() - Formatdate

// === Other ===
// - toggleCardDetails() - Togglecarddetails
// - populateAccountFilterMenu() - Populateaccountfiltermenu
// - toggleAccountFilterMenu() - Toggleaccountfiltermenu
// - toggleDateRangeFilterMenu() - Toggledaterangefiltermenu
// - applyCustomDateRange() - Applycustomdaterange
// - isDateInRange() - Isdateinrange
// - debounce() - Debounce
// - applyFilters() - Applyfilters
// - applyFiltersInternal() - Applyfiltersinternal
// - filterTrades() - Filtertrades
// - clearFilters() - Clearfilters
// - populateYearSelect() - Populateyearselect
// - calculateSummaryFromTrades() - Calculatesummaryfromtrades
// - setChartPeriod() - Setchartperiod
// - timeRangesEqual() - Timerangesequal
// - addTime() - Addtime
// - applyToAllCharts() - Applytoallcharts
// - compareDates() - Comparedates
// - waitForScripts() - Waitforscripts
// - registerPortfolioTradesTable() - Registerportfoliotradestable
// - restorePageState() - Restorepagestate
// - restoreSelectedAccounts() - Restoreselectedaccounts
// - INVESTMENT_TYPES() - Investment Types
// - later() - Later

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
let portfolioPerformanceChart = null;
let portfolioValueChart = null;
let plTrendChart = null;
let currentPeriod = {
    'both': 'month'
};

// Chart synchronization
let isSyncingCharts = false;
let chartsSynchronized = false;
let syncSetupAttempts = 0;
const MAX_SYNC_SETUP_ATTEMPTS = 50;

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
    if (!dateValue) return null;
    
    // DateEnvelope format - use UTC
    if (typeof dateValue === 'object' && dateValue.utc) {
        return dateValue.utc.split('T')[0];
    }
    
    // String format
    if (typeof dateValue === 'string') {
        // Check if it's in dd.mm.yyyy format
        if (/^\d{2}\.\d{2}\.\d{4}/.test(dateValue)) {
            const [day, month, year] = dateValue.split('.');
            return `${year}-${month}-${day}`;
        } else if (dateValue.includes('T')) {
            // ISO format - extract date part
            return dateValue.split('T')[0];
        } else {
            // Assume it's already in yyyy-mm-dd format
            return dateValue;
        }
    }
    
    return dateValue;
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
                const response = await fetch('/api/trading-accounts/');
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
            const formatDate = (dateStr) => {
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
                const formatDate = (dateStr) => {
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
                const formatDate = (dateStr) => {
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
function showLoadingState(componentId) {
    const component = document.getElementById(componentId);
    if (component) {
        component.classList.add('loading');
        // Add spinner if not exists
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

// Hide loading state for a component
function hideLoadingState(componentId) {
    const component = document.getElementById(componentId);
    if (component) {
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

    // === EOD INTEGRATION: Try EOD first ===
    const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
    const dateRange = selectedItem ? selectedItem.getAttribute('data-value') : 'היום';
    const dateRangeObj = getDateRange(dateRange);

    if (dateRangeObj && dateRangeObj.start && dateRangeObj.end) {
        try {
            // Load EOD positions data for the date range
            const eodResult = await window.EODIntegrationHelper.loadEODPositions(
                null, // global user
                {
                    date_from: dateRangeObj.start.toISOString().split('T')[0],
                    date_to: dateRangeObj.end.toISOString().split('T')[0]
                }
            );

            if (eodResult && eodResult.data && Array.isArray(eodResult.data) && eodResult.data.length > 0) {
                if (window.Logger) {
                    window.Logger.info('✅ Using EOD data for positions', {
                        page: 'portfolio-state-page',
                        recordCount: eodResult.data.length
                    });
                }

                // Transform EOD data to expected format for charts
                const enrichedPositions = positions.map(position => {
                    // Find matching EOD record
                    const eodRecord = eodResult.data.find(eod =>
                        eod.ticker_id === position.ticker_id &&
                        eod.date_utc === dateRangeObj.end.toISOString().split('T')[0]
                    );

                    if (eodRecord) {
                        return {
                            ...position,
                            // Use EOD data
                            market_value: eodRecord.market_value,
                            unrealized_pl_amount: eodRecord.unrealized_pl_amount,
                            unrealized_pl_percent: eodRecord.unrealized_pl_percent,
                            close_price: eodRecord.close_price,
                            price_source: eodRecord.price_source
                        };
                    }
                    return position;
                });

                return enrichedPositions;
            }
        } catch (eodError) {
            if (window.Logger) {
                window.Logger.warn('⚠️ EOD positions data not available, falling back to external data', {
                    page: 'portfolio-state-page',
                    error: eodError.message
                });
            }
            // Continue with external data service - no fallback mock data
        }
    }

    // === FALLBACK: Use ExternalDataService (only if EOD fails) ===
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
        const missingDataResponse = await fetch(`/api/external-data/status/tickers/missing-data`);
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

    if (showProgress && window.UnifiedProgressManager) {
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
        
        window.UnifiedProgressManager.createOverlay(overlayId, {
            title: 'טוען נתוני שוק עבור תיק',
            totalSteps: steps.length,
            stepLabels: steps,
            stepDescriptions: descriptions
        });
        window.UnifiedProgressManager.showProgress(overlayId, 1, 'בודק נתונים', `בודק ${totalSteps} טיקרים...`);
    }

    // Step 1: Load market data for tickers that need it (optimized - only missing data)
    if (window.Logger) {
        window.Logger.info('📊 Step 1: Refreshing only missing ticker data using ExternalDataService...', { 
            totalTickers: uniqueTickerIds.length,
            page: 'portfolio-state-page' 
        });
    }
    
    if (showProgress && window.UnifiedProgressManager) {
        window.UnifiedProgressManager.showProgress(
            overlayId,
            1,
            `טוען נתונים עבור ${uniqueTickerIds.length} טיקרים...`,
            'מתחבר לספק הנתונים החיצוני...'
        );
    }

    const positionsWithData = [...positions];

    for (let i = 0; i < uniqueTickerIds.length; i++) {
        const tickerId = uniqueTickerIds[i];
        progressStep++;

        // Find ticker info from missing data check
        const tickerInfo = missingDataInfo?.find(t => t.id === tickerId);
        const needsQuote = tickerInfo?.reason === 'missing_current_quote' || tickerInfo?.reason === 'insufficient_historical_data' || !tickerInfo;
        const needsHistorical = tickerInfo?.reason === 'insufficient_historical_data' || false;

        if (showProgress && window.UnifiedProgressManager) {
            const percentage = Math.round((progressStep / totalSteps) * 100);
            window.UnifiedProgressManager.updateProgress(overlayId, percentage, `טוען נתוני שוק עבור טיקר ${progressStep}/${totalSteps}`);
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

    if (showProgress && window.UnifiedProgressManager) {
        window.UnifiedProgressManager.hideProgress(overlayId);
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
        
        // Load trades and calculate summary in parallel (optimization)
        await loadTrades(dateRange, selectedAccounts, investmentType);
        
        // Filter trades based on current filters
        filterTrades(dateRange, selectedAccounts, investmentType);
        
        // Calculate summary from filtered trades (if not cached)
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
        
        // Reload charts with filtered data (all three together in parallel)
        await Promise.all([
            initPortfolioPerformanceChart(),
            initPortfolioValueChart(),
            initPLTrendChart()
        ]);
        
        // Setup chart controls after charts are ready
        setTimeout(() => {
            setupChartControls();
        }, 500);
    } finally {
        // Hide loading states
        hideLoadingState('trades-table-section');
        hideLoadingState('charts-section');
    }
}

// Load trades from API
async function loadTrades(dateRange, selectedAccounts, investmentType) {
    try {
        // Check cache first
        const accountsKey = Array.isArray(selectedAccounts) ? selectedAccounts.join(',') : (selectedAccounts || 'all');
        const cacheKey = `portfolio-state-trades-${dateRange}-${accountsKey}-${investmentType || 'all'}`;
        
        if (window.UnifiedCacheManager) {
            const cachedData = await window.UnifiedCacheManager.get(cacheKey, 'memory');
            if (cachedData) {
                if (window.Logger) {
                    window.Logger.info(`✅ Loaded ${cachedData.length} trades from cache`, { page: 'portfolio-state-page', cacheKey });
                }
                allTrades = cachedData;
                return;
            }
        }
        
        // Load portfolio state using PortfolioStateData service
        // Wait for PortfolioStateData to be available (it's loaded in entity-services package)
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
    } catch (error) {
        const errorMsg = `שגיאה בטעינת טריידים: ${error.message || 'שגיאה לא ידועה'}`;
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה בטעינת נתונים', errorMsg);
        }
        if (window.Logger) {
            window.Logger.error('Error loading trades', { page: 'portfolio-state-page', error });
        }
        allTrades = [];
    }
}

// Load trades for specific month and year
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
        
        // Load trades from API using date range
        const selectedAccounts = getSelectedAccounts();
        const accountId = Array.isArray(selectedAccounts) && selectedAccounts.length === 1 ? selectedAccounts[0] : null;
        
        // Use TradeHistoryData or direct API call
        if (window.TradeHistoryData && typeof window.TradeHistoryData.loadTradeHistory === 'function') {
            const filters = {
                account_id: accountId,
                start_date: startDateStr,
                end_date: endDateStr
            };
            
            const data = await window.TradeHistoryData.loadTradeHistory(filters);
            allTrades = data.trades || [];
        } else {
            // Fallback to direct API call
            const response = await fetch(`/api/trade-history/?account_id=${accountId || ''}&start_date=${startDateStr}&end_date=${endDateStr}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            allTrades = result.data?.trades || [];
        }
        
        // Filter and render
        filteredTrades = allTrades;
        updateTradesTable();
        updateTradesSummary(filteredTrades);
        
        if (window.NotificationSystem) {
            window.NotificationSystem.showSuccess('טעינה הושלמה', `נטענו ${filteredTrades.length} טריידים לחודש ${month}/${year}`);
        }
    } catch (error) {
        const errorMsg = `שגיאה בטעינת טריידים: ${error.message || 'שגיאה לא ידועה'}`;
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה בטעינת נתונים', errorMsg);
        }
        if (window.Logger) {
            window.Logger.error('Error loading trades for month/year', { month, year, error, page: 'portfolio-state-page' });
        }
        allTrades = [];
        filteredTrades = [];
        updateTradesTable();
    } finally {
        hideLoadingState('trades-table-section');
    }
}

// Populate year select with years (current year and previous 5 years)
function populateYearSelect() {
    const yearSelect = document.getElementById('tradesYearSelect');
    if (!yearSelect) return;
    
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    
    // Add current year and previous 5 years
    for (let i = 0; i < 6; i++) {
        const year = currentYear - i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (i === 1) { // Default to previous year
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }
}

// Calculate summary from trades (using InfoSummarySystem if available)
async function calculateSummaryFromTrades(trades) {
    // === EOD INTEGRATION: Try to load EOD data first ===
    const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
    const dateRange = selectedItem ? selectedItem.getAttribute('data-value') : 'היום';
    const selectedAccounts = getSelectedAccounts();

    // Validate EOD data availability and show errors if needed
    if (window.EODValidationService) {
        try {
            const validationResult = await window.EODValidationService.validatePortfolioMetrics({
                dateRange,
                selectedAccounts,
                page: 'portfolio-state-page'
            });

            // Handle validation errors
            if (window.EODIntegrationHelper) {
                await window.EODIntegrationHelper.handleEODValidationErrors(validationResult, 'portfolio-metrics', {
                    date_from: dateRange === 'היום' ? new Date().toISOString().split('T')[0] : undefined,
                    account_ids: selectedAccounts
                });
            }

            // If critical errors found, show notification but continue with fallback
            if (validationResult.errors && validationResult.errors.length > 0) {
                const criticalErrors = validationResult.errors.filter(e => e.severity === 'high');
                if (criticalErrors.length > 0 && window.Logger) {
                    window.Logger.warn('Critical EOD data errors found, will use fallback calculation', {
                        page: 'portfolio-state-page',
                        criticalErrors: criticalErrors.length
                    });
                }
            }
        } catch (validationError) {
            if (window.Logger) {
                window.Logger.warn('EOD validation failed, continuing with fallback', {
                    page: 'portfolio-state-page',
                    error: validationError.message
                });
            }
        }
    }

    // Convert date range to actual dates for EOD API
    const dateRangeObj = getDateRange(dateRange);
    if (dateRangeObj && dateRangeObj.start && dateRangeObj.end) {
        try {
            // Load EOD portfolio metrics for the date range
            const eodResult = await window.EODIntegrationHelper.loadEODPortfolioMetrics(
                null, // global user
                {
                    date_from: dateRangeObj.start.toISOString().split('T')[0],
                    date_to: dateRangeObj.end.toISOString().split('T')[0],
                    account_id: selectedAccounts && selectedAccounts.length === 1 ? selectedAccounts[0] : undefined
                }
            );

            if (eodResult && eodResult.data && Array.isArray(eodResult.data) && eodResult.data.length > 0) {
                // Use EOD data - get the most recent record
                const latestRecord = eodResult.data[eodResult.data.length - 1];

                if (window.Logger) {
                    window.Logger.info('✅ Using EOD data for portfolio summary', {
                        page: 'portfolio-state-page',
                        recordCount: eodResult.data.length,
                        latestDate: latestRecord.date_utc
                    });
                }

                // Return EOD data in expected format
                return {
                    total_cash_balance: latestRecord.cash_total || 0,
                    cash_balance_by_account: [], // TODO: Implement account-level EOD data
                    total_portfolio_value: latestRecord.nav_total || null,
                    total_realized_pl: latestRecord.realized_pl_amount || 0,
                    total_unrealized_pl: latestRecord.unrealized_pl_amount || 0,
                    total_pl: (latestRecord.realized_pl_amount || 0) + (latestRecord.unrealized_pl_amount || 0),
                    open_positions_count: latestRecord.positions_count_open || 0,
                    positions_count_by_account: [], // TODO: Implement account-level positions
                    // Additional EOD fields
                    twr_daily: latestRecord.twr_daily,
                    twr_mtd: latestRecord.twr_mtd,
                    twr_ytd: latestRecord.twr_ytd,
                    max_drawdown_to_date: latestRecord.max_drawdown_to_date,
                    data_quality_status: latestRecord.data_quality_status
                };
            }
        } catch (eodError) {
            if (window.Logger) {
                window.Logger.warn('⚠️ EOD data not available, falling back to calculated data', {
                    page: 'portfolio-state-page',
                    error: eodError.message
                });
            }
            // Continue with regular calculation - no fallback mock data
        }
    }

    // === FALLBACK: Calculate from trades (only if EOD fails) ===
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
                        const response = await fetch(`/api/account-activity/${accountId}/balances`);
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
    
    // Use InfoSummarySystem if available
    if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS?.['portfolio-state-page']) {
        try {
            const config = window.INFO_SUMMARY_CONFIGS['portfolio-state-page'];
            const stats = await window.InfoSummarySystem.calculateStatsFromData(trades, config.stats);
            
            // Override cash balance with snapshot data
            const finalCashBalance = totalCashBalance !== null ? totalCashBalance : (stats.total_cash_balance !== null && stats.total_cash_balance !== undefined ? stats.total_cash_balance : null);
            
            // Validate that we have real data - no fallback values
            // NOTE: "לא זמין" means we tried to load from external provider and failed
            // or the data doesn't exist in our system at all
            if (finalCashBalance === null || finalCashBalance === undefined) {
                // Don't show error here - it's already handled in loadTrades after trying external provider
                if (window.Logger) {
                    window.Logger.warn('Cash balance not available after trying external provider', { page: 'portfolio-state-page' });
                }
            }
            if (stats.total_portfolio_value === null || stats.total_portfolio_value === undefined) {
                // Don't show error here - it's already handled in loadTrades after trying external provider
                if (window.Logger) {
                    window.Logger.warn('Portfolio value not available after trying external provider', { page: 'portfolio-state-page' });
                }
            }
            
            // Override with snapshot data if available (more accurate)
            let finalRealizedPL = stats.total_realized_pl;
            let finalUnrealizedPL = stats.total_unrealized_pl;
            let finalTotalPL = stats.total_pl;
            let finalPortfolioValue = stats.total_portfolio_value;
            
            if (currentSnapshot) {
                // Use snapshot data for accurate P/L calculations
                if (currentSnapshot.total_realized_pl !== null && currentSnapshot.total_realized_pl !== undefined) {
                    finalRealizedPL = currentSnapshot.total_realized_pl;
                }
                if (currentSnapshot.total_unrealized_pl !== null && currentSnapshot.total_unrealized_pl !== undefined) {
                    finalUnrealizedPL = currentSnapshot.total_unrealized_pl;
                }
                if (currentSnapshot.total_value !== null && currentSnapshot.total_value !== undefined) {
                    finalPortfolioValue = currentSnapshot.total_value;
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
            
            return {
                ...stats,
                total_cash_balance: finalCashBalance,
                cash_balance_by_account: Object.values(cashBalanceByAccount),
                total_portfolio_value: finalPortfolioValue !== null && finalPortfolioValue !== undefined ? finalPortfolioValue : null,
                total_realized_pl: finalRealizedPL, // Can be 0, null, or a number - all are valid
                total_unrealized_pl: finalUnrealizedPL, // Can be 0, null, or a number - all are valid
                total_pl: finalTotalPL, // Can be 0, null, or a number - all are valid
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
            // Return null to indicate no data available
            return null;
        }
    }
    
    // Manual calculation - only if InfoSummarySystem not available
    let totalPortfolioValue = 0;
    let totalRealizedPL = 0;
    let totalUnrealizedPL = 0;
    
    trades.forEach(trade => {
        // Portfolio value (from position)
        if (trade.position_pl_value) {
            totalUnrealizedPL += trade.position_pl_value;
        }
    });
    
    // Calculate values only from actual data - no fallback values
    // Use snapshot data if available (snapshot has accurate realized/unrealized P/L)
    if (currentSnapshot) {
        // Use snapshot data for accurate P/L calculations
        totalRealizedPL = currentSnapshot.total_realized_pl !== null && currentSnapshot.total_realized_pl !== undefined 
            ? currentSnapshot.total_realized_pl 
            : null;
        totalUnrealizedPL = currentSnapshot.total_unrealized_pl !== null && currentSnapshot.total_unrealized_pl !== undefined 
            ? currentSnapshot.total_unrealized_pl 
            : null;
        // Portfolio value = cash + market value (which includes unrealized P/L in the calculation)
        // But snapshot already has total_value calculated correctly
        totalPortfolioValue = currentSnapshot.total_value !== null && currentSnapshot.total_value !== undefined 
            ? currentSnapshot.total_value 
            : ((totalCashBalance || 0) + (totalUnrealizedPL || 0));
    } else {
        // Fallback: calculate from trades (less accurate, but better than nothing)
        totalPortfolioValue = (totalCashBalance || 0) + (totalUnrealizedPL || 0);
        totalRealizedPL = null; // Cannot calculate from open positions alone
    }
    
    // Calculate total P/L
    let totalPL = null;
    if (totalRealizedPL !== null && totalUnrealizedPL !== null) {
        totalPL = totalRealizedPL + totalUnrealizedPL;
    } else if (totalRealizedPL !== null) {
        totalPL = totalRealizedPL;
    } else if (totalUnrealizedPL !== null) {
        totalPL = totalUnrealizedPL;
    }
    
    // Validate that we have real data
    // NOTE: "לא זמין" means we tried to load from external provider and failed
    // or the data doesn't exist in our system at all
    if (totalCashBalance === null && trades.length === 0) {
        // Don't show error here - it's already handled in loadTrades after trying external provider
        if (window.Logger) {
            window.Logger.warn('No portfolio data available after trying external provider', { page: 'portfolio-state-page' });
        }
    }
    
    return {
        total_cash_balance: totalCashBalance !== null ? totalCashBalance : null,
        cash_balance_by_account: Object.values(cashBalanceByAccount),
        total_portfolio_value: totalPortfolioValue !== null && totalPortfolioValue !== undefined && totalPortfolioValue > 0 ? totalPortfolioValue : null,
        total_realized_pl: totalRealizedPL, // Can be 0, null, or a number - all are valid
        total_unrealized_pl: totalUnrealizedPL, // Can be 0, null, or a number - all are valid
        total_pl: totalPL, // Can be 0, null, or a number - all are valid
        open_positions_count: trades.length > 0 ? trades.length : null,
        positions_count_by_account: Object.values(positionsCountByAccount)
    };
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

// Update trades table (using UnifiedTableSystem if available, fallback to manual rendering)
function updateTradesTable() {
    // Use UnifiedTableSystem if available and registered
    if (window.UnifiedTableSystem && window.UnifiedTableSystem.registry) {
        const tableConfig = window.UnifiedTableSystem.registry.getConfig('portfolio-trades');
        if (tableConfig && tableConfig.updateFunction) {
            // Call the registered updateFunction directly
            tableConfig.updateFunction(filteredTrades);
            return;
        }
    }
    
    // Use UnifiedTableSystem.renderer if available (preferred method)
    if (window.UnifiedTableSystem && window.UnifiedTableSystem.renderer) {
        window.UnifiedTableSystem.renderer.render('portfolio-trades', filteredTrades);
        // Update summary after rendering
        updateTradesSummary(filteredTrades);
        return;
    }
    
    // Fallback to manual rendering
    const tbody = document.getElementById('trades-table-body');
    if (!tbody) return;
    
    if (filteredTrades.length === 0) {
        tbody.textContent = '';
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 13;
        emptyCell.className = 'text-center text-muted';
        emptyCell.textContent = 'אין טריידים להצגה';
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
        const summaryElement = document.getElementById('trades-summary');
        if (summaryElement) {
            summaryElement.textContent = 'אין טריידים';
        }
        return;
    }
    
    tbody.textContent = '';
    const parser = new DOMParser();
    filteredTrades.forEach(trade => {
        const rowHTML = renderTradeRow(trade);
        const doc = parser.parseFromString(rowHTML, 'text/html');
        const row = doc.body.querySelector('tr');
        if (row) {
            tbody.appendChild(row);
        }
    });
    
                // Update summary using InfoSummarySystem (only if container exists)
                if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS && window.INFO_SUMMARY_CONFIGS['portfolio-state-page']) {
                    const config = window.INFO_SUMMARY_CONFIGS['portfolio-state-page'];
                    const container = document.getElementById(config.containerId);
                    if (container) {
                        window.InfoSummarySystem.calculateAndRender(filteredTrades, config).catch(err => {
                            window.Logger?.warn('Failed to update portfolio state summary via InfoSummarySystem', { error: err, page: 'portfolio-state-page' });
                        });
                    }
                }
                
                // Update trades summary using extracted function
                updateTradesSummary(filteredTrades);
    
    // Note: Action buttons are now created directly in renderTradeRow() using createActionsMenu()
    // No need for loadTableActionButtons() anymore
}

// Update trades summary (extracted for reuse)
function updateTradesSummary(trades) {
    if (!trades || trades.length === 0) {
                const summaryElement = document.getElementById('trades-summary');
                if (summaryElement) {
            summaryElement.textContent = 'אין טריידים';
        }
        return;
    }
    
    // Always update trades-summary element - no fallback values
    const totalPL = trades.reduce((sum, t) => {
        const plValue = t.position_pl_value !== null && t.position_pl_value !== undefined ? t.position_pl_value : 0;
        return sum + plValue;
    }, 0);
    const summaryElement = document.getElementById('trades-summary');
    if (summaryElement) {
        summaryElement.innerHTML = '';
        const strong1 = document.createElement('strong');
        strong1.textContent = `סה"כ טריידים: ${trades.length}`;
        summaryElement.appendChild(strong1);
        
        if (totalPL !== 0) {
            const separator = document.createTextNode(' | ');
            summaryElement.appendChild(separator);
            const strong2 = document.createElement('strong');
            strong2.textContent = 'סה"כ P/L: ';
            summaryElement.appendChild(strong2);
            const plSpan = document.createElement('span');
            if (window.FieldRendererService?.renderAmount) {
                plSpan.innerHTML = window.FieldRendererService.renderAmount(totalPL, '$', 0, true);
            } else {
                plSpan.className = totalPL >= 0 ? 'text-success' : totalPL < 0 ? 'text-danger' : 'text-muted';
                plSpan.textContent = `${totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}$`;
            }
            strong2.appendChild(plSpan);
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
                totalCashBalanceEl.textContent = formatCurrency(data.total_cash_balance);
            } else {
                totalCashBalanceEl.textContent = 'לא זמין';
            }
        }
        if (cashBalanceTotalEl2) {
            if (data.total_cash_balance !== null && data.total_cash_balance !== undefined) {
                cashBalanceTotalEl2.textContent = formatCurrency(data.total_cash_balance);
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
                    const response = await fetch(`/api/account-activity/${accountId}/balances`);
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
function formatCurrency(value) {
    // Use FieldRendererService if available (general system)
    if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
        return window.FieldRendererService.renderAmount(value, '$', 0, false);
    }
    // Fallback to local implementation
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

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
    
    // Reload charts
    if (chartType === 'both') {
        initPortfolioPerformanceChart();
        initPortfolioValueChart();
        initPLTrendChart();
    } else if (chartType === 'portfolio-performance') {
        initPortfolioPerformanceChart();
    } else if (chartType === 'portfolio-value') {
        initPortfolioValueChart();
    } else if (chartType === 'pl-trend') {
        initPLTrendChart();
    }
}

// Initialize Portfolio Performance Chart
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
                performanceData = Array.isArray(series?.snapshots) ? series.snapshots.map((snapshot, index) => {
                    const baseValue = index === 0 ? snapshot.total_value : series.snapshots[0].total_value;
                    const percent = baseValue > 0 ? ((snapshot.total_value - baseValue) / baseValue) * 100 : 0;
                    // Convert date to yyyy-mm-dd format for charts
                    const dateValue = snapshot.snapshot_date || snapshot.date;
                    const chartDate = convertDateToChartFormat(dateValue);
                    return {
                        time: chartDate,
                        value: percent
                    };
                }) : [];
            }
        } catch (error) {
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
        portfolioPerformanceSeries.setData(performanceData);
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
                            const dateValue = snapshot.snapshot_date || snapshot.date;
                            const chartDate = convertDateToChartFormat(dateValue);
                            return {
                                time: chartDate,
                                value: snapshot.total_value !== null && snapshot.total_value !== undefined ? snapshot.total_value : null
                            };
                        }).filter(item => item.value !== null); // Filter out null values
                        valueData.percentages = series.snapshots.map(snapshot => {
                            const snapshotValue = snapshot.total_value !== null && snapshot.total_value !== undefined ? snapshot.total_value : null;
                            if (snapshotValue === null) return null;
                            const percent = ((snapshotValue - baseValue) / baseValue) * 100;
                            const dateValue = snapshot.snapshot_date || snapshot.date;
                            const chartDate = convertDateToChartFormat(dateValue);
                            return {
                                time: chartDate,
                                value: percent
                            };
                        }).filter(item => item !== null); // Filter out null values
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
                portfolioValueSeries.setData(valueData.values);
                portfolioValuePercentSeries.setData(valueData.percentages);
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
        
        // Generate data based on filtered trades - TODO: Load from API
        // Load P/L data using PortfolioStateData service
        let plData = {
            realized: [],
            unrealized: [],
            total: [],
            realizedPercent: [],
            unrealizedPercent: [],
            totalPercent: []
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
                if (Array.isArray(series?.snapshots)) {
                    series.snapshots.forEach(snapshot => {
                        const dateValue = snapshot.snapshot_date || snapshot.date;
                        const time = convertDateToChartFormat(dateValue);
                        // No fallback values - use null if data not available
                        const realized = snapshot.total_realized_pl !== null && snapshot.total_realized_pl !== undefined ? snapshot.total_realized_pl : null;
                        const unrealized = snapshot.total_unrealized_pl !== null && snapshot.total_unrealized_pl !== undefined ? snapshot.total_unrealized_pl : null;
                        const total = (realized !== null && unrealized !== null) ? realized + unrealized : null;
                        const baseValue = series.snapshots[0]?.total_value;
                        const realizedPercent = (baseValue && baseValue > 0 && realized !== null) ? (realized / baseValue) * 100 : null;
                        const unrealizedPercent = (baseValue && baseValue > 0 && unrealized !== null) ? (unrealized / baseValue) * 100 : null;
                        const totalPercent = (baseValue && baseValue > 0 && total !== null) ? (total / baseValue) * 100 : null;
                        
                        // Only add data if values are not null
                        if (realized !== null) plData.realized.push({ time, value: realized });
                        if (unrealized !== null) plData.unrealized.push({ time, value: unrealized });
                        if (total !== null) plData.total.push({ time, value: total });
                        if (realizedPercent !== null) plData.realizedPercent.push({ time, value: realizedPercent });
                        if (unrealizedPercent !== null) plData.unrealizedPercent.push({ time, value: unrealizedPercent });
                        if (totalPercent !== null) plData.totalPercent.push({ time, value: totalPercent });
                    });
                }
            }
        } catch (error) {
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
        realizedPLSeries.setData(plData.realized);
        unrealizedPLSeries.setData(plData.unrealized);
        totalPLSeries.setData(plData.total);
        realizedPLPercentSeries.setData(plData.realizedPercent);
        unrealizedPLPercentSeries.setData(plData.unrealizedPercent);
        totalPLPercentSeries.setData(plData.totalPercent);
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
function setupChartControls() {
    if (!portfolioPerformanceChart || !portfolioValueChart || !plTrendChart) {
        setTimeout(setupChartControls, 100);
        return;
    }
    
    const performanceTimeScale = portfolioPerformanceChart.timeScale();
    const portfolioTimeScale = portfolioValueChart.timeScale();
    const plTimeScale = plTrendChart.timeScale();
    
    // Helper functions
    function getTimeDiff(from, to) {
        if (typeof from === 'string' && typeof to === 'string') {
            return new Date(to).getTime() - new Date(from).getTime();
        }
        return to - from;
    }
    
    function addTime(time, ms) {
        if (typeof time === 'string') {
            const date = new Date(time);
            date.setTime(date.getTime() + ms);
            return date.toISOString().split('T')[0];
        }
        return time + ms;
    }
    
    function applyToAllCharts(fn) {
        [performanceTimeScale, portfolioTimeScale, plTimeScale].forEach(timeScale => {
            try {
                fn(timeScale);
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Error applying to chart', { page: 'portfolio-state-page', error });
                }
            }
        });
    }
    
    // Zoom In
    const zoomInBtn = document.getElementById('chartZoomIn');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            const visibleRange = portfolioTimeScale.getVisibleRange();
            if (visibleRange && visibleRange.from && visibleRange.to) {
                const range = getTimeDiff(visibleRange.from, visibleRange.to);
                const newRange = range * 0.8;
                const newFrom = addTime(visibleRange.from, (range - newRange) / 2);
                const newTo = addTime(visibleRange.from, range - (range - newRange) / 2);
                applyToAllCharts(ts => ts.setVisibleRange({ from: newFrom, to: newTo }));
            }
        });
    }
    
    // Zoom Out
    const zoomOutBtn = document.getElementById('chartZoomOut');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            const visibleRange = portfolioTimeScale.getVisibleRange();
            if (visibleRange && visibleRange.from && visibleRange.to) {
                const range = getTimeDiff(visibleRange.from, visibleRange.to);
                const newRange = range * 1.25;
                const shift = (newRange - range) / 2;
                const newFrom = addTime(visibleRange.from, -shift);
                const newTo = addTime(visibleRange.to, shift);
                applyToAllCharts(ts => ts.setVisibleRange({ from: newFrom, to: newTo }));
            }
        });
    }
    
    // Reset (Fit Content)
    const resetBtn = document.getElementById('chartReset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            applyToAllCharts(ts => ts.fitContent());
        });
    }
    
    // Pan Left
    const panLeftBtn = document.getElementById('chartPanLeft');
    if (panLeftBtn) {
        panLeftBtn.addEventListener('click', () => {
            const visibleRange = portfolioTimeScale.getVisibleRange();
            if (visibleRange && visibleRange.from && visibleRange.to) {
                const range = getTimeDiff(visibleRange.from, visibleRange.to);
                const shift = range * 0.2;
                const newFrom = addTime(visibleRange.from, -shift);
                const newTo = addTime(visibleRange.to, -shift);
                applyToAllCharts(ts => ts.setVisibleRange({ from: newFrom, to: newTo }));
            }
        });
    }
    
    // Pan Right
    const panRightBtn = document.getElementById('chartPanRight');
    if (panRightBtn) {
        panRightBtn.addEventListener('click', () => {
            const visibleRange = portfolioTimeScale.getVisibleRange();
            if (visibleRange && visibleRange.from && visibleRange.to) {
                const range = getTimeDiff(visibleRange.from, visibleRange.to);
                const shift = range * 0.2;
                const newFrom = addTime(visibleRange.from, shift);
                const newTo = addTime(visibleRange.to, shift);
                applyToAllCharts(ts => ts.setVisibleRange({ from: newFrom, to: newTo }));
            }
        });
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

// Compare dates
async function compareDates() {
    // Get selected date range
    const selectedItem = document.querySelector('#dateRangeFilterMenu .date-range-filter-item.selected');
    const dateRange1 = selectedItem ? selectedItem.getAttribute('data-value') : 'היום';
    const { start: start1, end: end1 } = getDateRange();
    
    // For comparison, use the end date (or today if no end)
    const date1 = end1 ? end1.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    // Use DataCollectionService to get value if available
    let date2;
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
      date2 = window.DataCollectionService.getValue('datePicker2', 'dateOnly', '');
    } else {
      const date2El = document.getElementById('datePicker2');
      date2 = date2El ? date2El.value : '';
    }
    
    if (!date1 || !date2) {
        // Use NotificationSystem instead of alert
        if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
            window.NotificationSystem.showError('שגיאה', 'נא לבחור שני תאריכים להשוואה');
        } else if (window.Logger) {
            window.Logger.warn('Please select two dates for comparison', { page: 'portfolio-state-page' });
        }
        return;
    }
    
    // Format dates for display using FieldRendererService
    const formatDate = (dateStr) => {
        return window.FieldRendererService.renderDate(dateStr, false);
    };
    
    // Update headers
    const date1Header = document.getElementById('comparison-date1-header');
    const date2Header = document.getElementById('comparison-date2-header');
    if (date1Header) {
        date1Header.textContent = formatDate(date1);
    }
    if (date2Header) {
        date2Header.textContent = formatDate(date2);
    }
    
    // Show comparison table and hide placeholder (with null checks to prevent errors)
    const comparisonTableWrapper = document.getElementById('comparison-table-wrapper');
    const comparisonPlaceholder = document.getElementById('comparison-placeholder');
    const removeComparisonDateBtn = document.getElementById('removeComparisonDate');
    
    if (comparisonTableWrapper) {
        comparisonTableWrapper.style.display = 'block';
    }
    if (comparisonPlaceholder) {
        comparisonPlaceholder.style.display = 'none';
    }
    if (removeComparisonDateBtn) {
        removeComparisonDateBtn.style.display = 'inline-block';
        removeComparisonDateBtn.classList.remove('hidden');
    }
    
    // Load comparison data from EOD API
    let comparisonData = [];
    try {
        // === EOD INTEGRATION: Load comparison data from EOD ===
        const selectedAccounts = getSelectedAccounts();

        // Load EOD data for date1
        const eodResult1 = await window.EODIntegrationHelper.loadEODPortfolioMetrics(
            null, // global user
            {
                date_from: date1,
                date_to: date1,
                account_id: selectedAccounts && selectedAccounts.length === 1 ? selectedAccounts[0] : undefined
            }
        );

        // Load EOD data for date2
        const eodResult2 = await window.EODIntegrationHelper.loadEODPortfolioMetrics(
            null, // global user
            {
                date_from: date2,
                date_to: date2,
                account_id: selectedAccounts && selectedAccounts.length === 1 ? selectedAccounts[0] : undefined
            }
        );

        if (eodResult1 && eodResult1.data && eodResult2 && eodResult2.data) {
            // Get latest records for each date
            const record1 = eodResult1.data.find(r => r.date_utc === date1) || eodResult1.data[eodResult1.data.length - 1];
            const record2 = eodResult2.data.find(r => r.date_utc === date2) || eodResult2.data[eodResult2.data.length - 1];

            if (record1 && record2) {
                if (window.Logger) {
                    window.Logger.info('✅ Using EOD data for date comparison', {
                        page: 'portfolio-state-page',
                        date1,
                        date2
                    });
                }

                comparisonData = [
                    {
                        metric: 'יתרות',
                        value1: record1.cash_total !== null && record1.cash_total !== undefined ? record1.cash_total : null,
                        value2: record2.cash_total !== null && record2.cash_total !== undefined ? record2.cash_total : null
                    },
                    {
                        metric: 'שווי תיק',
                        value1: record1.nav_total !== null && record1.nav_total !== undefined ? record1.nav_total : null,
                        value2: record2.nav_total !== null && record2.nav_total !== undefined ? record2.nav_total : null
                    },
                    {
                        metric: 'P/L כולל',
                        value1: (record1.realized_pl_amount || 0) + (record1.unrealized_pl_amount || 0),
                        value2: (record2.realized_pl_amount || 0) + (record2.unrealized_pl_amount || 0)
                    },
                    {
                        metric: 'פוזיציות',
                        value1: record1.positions_count_open !== null && record1.positions_count_open !== undefined ? record1.positions_count_open : null,
                        value2: record2.positions_count_open !== null && record2.positions_count_open !== undefined ? record2.positions_count_open : null
                    },
                    {
                        metric: 'TWR יומי',
                        value1: record1.twr_daily !== null && record1.twr_daily !== undefined ? record1.twr_daily : null,
                        value2: record2.twr_daily !== null && record2.twr_daily !== undefined ? record2.twr_daily : null
                    }
                ];
            }
        }

        // === FALLBACK: Use PortfolioStateData (only if EOD fails) ===
        if (comparisonData.length === 0 && window.PortfolioStateData && typeof window.PortfolioStateData.loadComparison === 'function') {
            const comparison = await window.PortfolioStateData.loadComparison(
                getSelectedAccounts().length === 1 ? getSelectedAccounts()[0] : null,
                date1,
                date2
            );

            if (comparison && comparison.is_valid) {
                const comp = comparison.comparison || {};
                const state1 = comparison.date1_state || {};
                const state2 = comparison.date2_state || {};

                // Only use real data - no fallback values
                comparisonData = [
                    {
                        metric: 'יתרות',
                        value1: state1.cash_balance !== null && state1.cash_balance !== undefined ? state1.cash_balance : null,
                        value2: state2.cash_balance !== null && state2.cash_balance !== undefined ? state2.cash_balance : null
                    },
                    {
                        metric: 'שווי תיק',
                        value1: state1.portfolio_value !== null && state1.portfolio_value !== undefined ? state1.portfolio_value : null,
                        value2: state2.portfolio_value !== null && state2.portfolio_value !== undefined ? state2.portfolio_value : null
                    },
                    {
                        metric: 'P/L כולל',
                        value1: state1.total_pl !== null && state1.total_pl !== undefined ? state1.total_pl : null,
                        value2: state2.total_pl !== null && state2.total_pl !== undefined ? state2.total_pl : null
                    },
                    {
                        metric: 'פוזיציות',
                        value1: state1.positions_count !== null && state1.positions_count !== undefined ? state1.positions_count : null,
                        value2: state2.positions_count !== null && state2.positions_count !== undefined ? state2.positions_count : null
                    }
                ];
            }
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.warn('Error loading comparison data', { page: 'portfolio-state-page', error });
        }
        if (window.NotificationSystem) {
            window.NotificationSystem.showError('שגיאה', 'שגיאה בטעינת נתוני השוואה');
        }
    }
    
    // No fallback data - show error if no data available
    if (comparisonData.length === 0) {
        if (window.NotificationSystem) {
            window.NotificationSystem.showError(
                'נתונים לא זמינים',
                'לא נמצאו נתוני השוואה עבור התאריכים שנבחרו. נא לבדוק שהתאריכים תקינים ויש נתונים במערכת.'
            );
        }
        // Hide comparison table and show placeholder
        document.getElementById('comparison-table-wrapper').style.display = 'none';
        document.getElementById('comparison-placeholder').style.display = 'block';
        document.getElementById('removeComparisonDate').style.display = 'none';
        return;
    }
    
    const tbody = document.getElementById('comparison-table-body');
    tbody.textContent = '';
    const parser = new DOMParser();
    comparisonData.forEach(item => {
        // No fallback values - show error if data not available
        if (item.value1 === null || item.value1 === undefined || item.value2 === null || item.value2 === undefined) {
            // Show "לא זמין" in table for this metric
            const change = null;
            const changePercent = null;
            const value1Display = 'לא זמין';
            const value2Display = 'לא זמין';
            const changeDisplay = 'לא זמין';
            
            const row = document.createElement('tr');
            const metricCell = document.createElement('td');
            metricCell.textContent = item.metric;
            row.appendChild(metricCell);
            
            const value1Cell = document.createElement('td');
            value1Cell.textContent = value1Display;
            value1Cell.className = 'text-muted';
            row.appendChild(value1Cell);
            
            const value2Cell = document.createElement('td');
            value2Cell.textContent = value2Display;
            value2Cell.className = 'text-muted';
            row.appendChild(value2Cell);
            
            const changeCell = document.createElement('td');
            changeCell.textContent = changeDisplay;
            changeCell.className = 'text-muted';
            row.appendChild(changeCell);
            
            tbody.appendChild(row);
            return; // Skip to next item
        }
        
        const change = item.value1 - item.value2;
        const changePercent = item.value2 !== 0 ? ((change / item.value2) * 100).toFixed(1) : null;
        
        // Use FieldRendererService if available - no fallback values
        let changeDisplay, value1Display, value2Display;
        if (window.FieldRendererService) {
            value1Display = window.FieldRendererService.renderAmount(item.value1, '$', 0, false);
            value2Display = window.FieldRendererService.renderAmount(item.value2, '$', 0, false);
            if (changePercent !== null) {
            const changeAmount = window.FieldRendererService.renderAmount(change, '$', 0, true);
            const changePercentHtml = window.FieldRendererService.renderNumericValue(parseFloat(changePercent), '%', true);
            changeDisplay = `${changeAmount} (${changePercentHtml})`;
        } else {
                changeDisplay = 'לא זמין';
            }
        } else {
            // Fallback if FieldRendererService not available
            value1Display = formatCurrency(item.value1);
            value2Display = formatCurrency(item.value2);
            if (changePercent !== null) {
            const isPositive = change >= 0;
            const changeClass = isPositive ? 'text-success' : 'text-danger';
            const changeSign = isPositive ? '+' : '';
            const changeSpan = document.createElement('span');
            changeSpan.className = changeClass;
            changeSpan.textContent = `${changeSign}${formatCurrency(change)} (${changeSign}${changePercent}%)`;
            changeDisplay = changeSpan.outerHTML;
            } else {
                changeDisplay = 'לא זמין';
            }
        }
        
        const row = document.createElement('tr');
        const metricCell = document.createElement('td');
        metricCell.textContent = item.metric;
        row.appendChild(metricCell);
        
        const value1Cell = document.createElement('td');
        if (window.FieldRendererService) {
            value1Cell.textContent = value1Display;
        } else {
            value1Cell.textContent = value1Display;
        }
        row.appendChild(value1Cell);
        
        const value2Cell = document.createElement('td');
        if (window.FieldRendererService) {
            value2Cell.textContent = value2Display;
        } else {
            value2Cell.textContent = value2Display;
        }
        row.appendChild(value2Cell);
        
        const changeCell = document.createElement('td');
        if (window.FieldRendererService) {
            changeCell.textContent = changeDisplay;
        } else {
            const doc = parser.parseFromString(changeDisplay, 'text/html');
            const span = doc.body.querySelector('span');
            if (span) {
                changeCell.appendChild(span);
            } else {
                changeCell.textContent = changeDisplay;
            }
        }
        row.appendChild(changeCell);
        
        tbody.appendChild(row);
    });
}

// Remove comparison date
function removeComparisonDate() {
    // Use DataCollectionService to clear field if available
    if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
      window.DataCollectionService.setValue('datePicker2', '', 'dateOnly');
    } else {
      const datePicker2El = document.getElementById('datePicker2');
      if (datePicker2El) datePicker2El.value = '';
    }
    // Hide comparison table (with null checks to prevent errors)
    const comparisonTableWrapper = document.getElementById('comparison-table-wrapper');
    const comparisonPlaceholder = document.getElementById('comparison-placeholder');
    const removeComparisonDateBtn = document.getElementById('removeComparisonDate');
    const date1Header = document.getElementById('comparison-date1-header');
    const date2Header = document.getElementById('comparison-date2-header');
    
    if (comparisonTableWrapper) {
        comparisonTableWrapper.style.display = 'none';
    }
    if (comparisonPlaceholder) {
        comparisonPlaceholder.style.display = 'block';
    }
    if (removeComparisonDateBtn) {
        removeComparisonDateBtn.style.display = 'none';
        removeComparisonDateBtn.classList.add('hidden');
    }
    if (date1Header) {
        date1Header.textContent = '-';
    }
    if (date2Header) {
        date2Header.textContent = '-';
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
        if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
            if (window.Logger) {
                window.Logger.warn('⚠️ UnifiedTableSystem not available for table registration', { page: 'portfolio-state-page' });
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
                // Update filtered trades
                filteredTrades = Array.isArray(data) ? data : [];
                // Render table manually (UnifiedTableSystem will call this)
                const tbody = document.getElementById('trades-table-body');
                if (!tbody) return;
                
                if (filteredTrades.length === 0) {
                    tbody.textContent = '';
                    const emptyRow = document.createElement('tr');
                    const emptyCell = document.createElement('td');
                    emptyCell.colSpan = 13;
                    emptyCell.className = 'text-center text-muted';
                    emptyCell.textContent = 'אין טריידים להצגה';
                    emptyRow.appendChild(emptyCell);
                    tbody.appendChild(emptyRow);
                    const summaryElement = document.getElementById('trades-summary');
                    if (summaryElement) {
                        summaryElement.textContent = 'אין טריידים';
                    }
                    return;
                }
                
                tbody.textContent = '';
                const parser = new DOMParser();
                filteredTrades.forEach(trade => {
                    const rowHTML = renderTradeRow(trade);
                    const doc = parser.parseFromString(rowHTML, 'text/html');
                    const row = doc.body.querySelector('tr');
                    if (row) {
                        tbody.appendChild(row);
                    }
                });
                
                // Update summary using InfoSummarySystem (only if container exists)
                if (window.InfoSummarySystem && window.INFO_SUMMARY_CONFIGS && window.INFO_SUMMARY_CONFIGS['portfolio-state-page']) {
                    const config = window.INFO_SUMMARY_CONFIGS['portfolio-state-page'];
                    const container = document.getElementById(config.containerId);
                    if (container) {
                        window.InfoSummarySystem.calculateAndRender(filteredTrades, config).catch(err => {
                            window.Logger?.warn('Failed to update portfolio state summary via InfoSummarySystem', { error: err, page: 'portfolio-state-page' });
                        });
                    }
                }
                
                // Always update trades-summary element - no fallback values
                const totalPL = filteredTrades.reduce((sum, t) => {
                    const plValue = t.position_pl_value !== null && t.position_pl_value !== undefined ? t.position_pl_value : 0;
                    return sum + plValue;
                }, 0);
                const summaryElement = document.getElementById('trades-summary');
                if (summaryElement) {
                    summaryElement.textContent = '';
                    const strong1 = document.createElement('strong');
                    strong1.textContent = `סה"כ טריידים: ${filteredTrades.length}`;
                    summaryElement.appendChild(strong1);
                    
                    const separator = document.createTextNode(' | ');
                    summaryElement.appendChild(separator);
                    
                    const strong2 = document.createElement('strong');
                    strong2.textContent = 'סה"כ P/L: ';
                    summaryElement.appendChild(strong2);
                    
                    const plValue = window.FieldRendererService?.renderNumericValue 
                        ? window.FieldRendererService.renderNumericValue(totalPL, '$', true)
                        : `${totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}$`;
                    const plSpan = document.createElement('span');
                    if (window.FieldRendererService) {
                        plSpan.textContent = plValue;
                    } else {
                        plSpan.className = totalPL >= 0 ? 'text-success' : totalPL < 0 ? 'text-danger' : 'text-muted';
                        plSpan.textContent = plValue;
                    }
                    strong2.appendChild(plSpan);
                }
                
                // Note: Action buttons are now created directly in renderTradeRow() using createActionsMenu()
                // No need for loadTableActionButtons() anymore
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

        if (window.Logger) {
            window.Logger.info('✅ Registered portfolio trades table with UnifiedTableSystem', { page: 'portfolio-state-page' });
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
    async function initializePage() {
        // Initialize Header System first
        initializeHeader();
        
        // Wait for all scripts to load first
        await waitForScripts();
        
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
        
        await loadPortfolioState();
        
        // Load chart default period from preferences (only if not restored from state)
        if (!currentPeriod['both']) {
            await loadChartDefaultPeriod();
        }
        
        // Setup chart controls after charts are initialized
        setTimeout(() => {
            setupChartControls();
        }, 1000);

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

})();
