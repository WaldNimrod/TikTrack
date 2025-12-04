/**
 * Positions & Portfolio System - TikTrack
 * ========================================
 * 
 * מערכת הצגת פוזיציות ופורטפוליו
 * 
 * תכונות:
 * - טבלת פוזיציות לפי חשבון
 * - טבלת פורטפוליו מלא עם פילטרים
 * - וויזארד סיכום (מינימאלי ומלא)
 * - אינטגרציה מלאה עם UnifiedCacheManager
 * - שימוש במערכות כלליות (FieldRendererService, InfoSummarySystem, וכו')
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Date: January 2025
 * 
 * Documentation: documentation/04-FEATURES/CORE/POSITIONS_PORTFOLIO_SYSTEM.md
 */

/* ===== POSITIONS & PORTFOLIO SYSTEM ===== */
window.Logger.info('📁 positions-portfolio.js נטען', { page: "trading_accounts" });

// Global state
window.positionsPortfolioState = {
    selectedAccountId: null,
    positionsData: null,
    positionsPageData: [],
    portfolioData: null,
    portfolioPagePositions: [],
    summaryData: null,
    isLoading: false,
    summarySize: 'minimal', // 'minimal' or 'full'
    portfolioDiagnostics: null,
    positionsDiagnostics: null,
    summaryDiagnostics: null,
    missingExecutionsNotified: {
        portfolio: false,
        accounts: {}
    }
};

let positionsPaginationInstance = null;
let portfolioPaginationInstance = null;

function normalizePositionsPayload(payload) {
    if (!payload) {
        return { positions: [], diagnostics: null };
    }
    if (Array.isArray(payload)) {
        return { positions: payload, diagnostics: null };
    }
    if (Array.isArray(payload.positions)) {
        return {
            positions: payload.positions,
            diagnostics: payload.diagnostics || null
        };
    }
    return { positions: [], diagnostics: null };
}

function normalizePortfolioPayload(payload) {
    if (!payload) {
        return { positions: [], summary: {}, diagnostics: null };
    }
    return {
        positions: Array.isArray(payload.positions) ? payload.positions : [],
        summary: payload.summary || {},
        diagnostics: payload.diagnostics || null
    };
}

function notifyMissingExecutionsOnce(key, message) {
    const tracker = window.positionsPortfolioState.missingExecutionsNotified || { portfolio: false, accounts: {} };
    window.positionsPortfolioState.missingExecutionsNotified = tracker;
    if (key === 'portfolio') {
        if (tracker.portfolio) {
            return;
        }
        tracker.portfolio = true;
    } else {
        const serializedKey = String(key);
        if (tracker.accounts?.[serializedKey]) {
            return;
        }
        tracker.accounts = tracker.accounts || {};
        tracker.accounts[serializedKey] = true;
    }
    if (typeof window.showWarningNotification === 'function') {
        window.showWarningNotification('אין נתוני Executions', message);
    }
    window.Logger?.warn?.('⚠️ Missing executions detected', { context: key, message }, { page: 'positions-portfolio' });
}

function createDiagnosticsMessageFromPortfolio(diagnostics) {
    if (!diagnostics || !Array.isArray(diagnostics.accounts_without_executions) || diagnostics.accounts_without_executions.length === 0) {
        return null;
    }
    
    // Don't show message if there are executions in any account
    // Check if execution_pairs_count exists and is > 0
    if (diagnostics.execution_pairs_count !== undefined && diagnostics.execution_pairs_count > 0) {
        return null;
    }
    
    const missingCount = diagnostics.accounts_without_executions.length;
    
    // Try to get account names instead of just IDs
    let accountNames = [];
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        accountNames = diagnostics.accounts_without_executions.slice(0, 5).map(id => {
            const account = window.trading_accountsData.find(acc => acc.id === id);
            return account && account.name ? account.name : `#${id}`;
        });
    } else {
        accountNames = diagnostics.accounts_without_executions.slice(0, 5).map(id => `#${id}`);
    }
    
    const accountList = accountNames.join(', ');
    const idsSuffix = missingCount > 5 ? ` ועוד ${missingCount - 5} חשבונות` : '';
    
    // More gentle message for new systems
    return `עדיין לא נוספו נתוני ביצוע (Buy/Sell) ב-${missingCount} חשבונות${missingCount > 1 ? '' : ''} (${accountList}${idsSuffix}). לאחר הוספת נתוני ביצוע, הפוזיציות יופיעו כאן אוטומטית.`;
}

function createDiagnosticsMessageFromAccount(diagnostics) {
    // Don't show message if there are executions
    if (!diagnostics || diagnostics.execution_pairs_count > 0) {
        return null;
    }
    
    // Don't show message if account_id is missing or undefined
    if (!diagnostics.account_id) {
        return null;
    }
    
    // Try to get account name from trading_accountsData
    let accountName = null;
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        const account = window.trading_accountsData.find(acc => acc.id === diagnostics.account_id);
        if (account && account.name) {
            accountName = account.name;
        }
    }
    
    // Use account name if available, otherwise use ID
    const accountDisplay = accountName || `#${diagnostics.account_id}`;
    
    // More gentle message for new systems
    return `עדיין לא נוספו נתוני ביצוע (Buy/Sell) לחשבון ${accountDisplay}. לאחר הוספת נתוני ביצוע, הפוזיציות יופיעו כאן אוטומטית.`;
}

function setPortfolioDiagnostics(diagnostics) {
    window.positionsPortfolioState.portfolioDiagnostics = diagnostics || null;
    const message = createDiagnosticsMessageFromPortfolio(diagnostics);
    if (message) {
        notifyMissingExecutionsOnce('portfolio', message);
    }
}

function setPositionsDiagnostics(diagnostics) {
    window.positionsPortfolioState.positionsDiagnostics = diagnostics || null;
    const message = createDiagnosticsMessageFromAccount(diagnostics);
    if (message && diagnostics?.account_id) {
        notifyMissingExecutionsOnce(diagnostics.account_id, message);
    }
}

function getNoPositionsMessage(diagnostics, context = 'portfolio') {
    if (context === 'portfolio') {
        const message = createDiagnosticsMessageFromPortfolio(diagnostics);
        if (message) {
            return `${message} לאחר הוספת הנתונים הטבלה תתעדכן אוטומטית.`;
        }
    } else if (context === 'account') {
        const message = createDiagnosticsMessageFromAccount(diagnostics);
        if (message) {
            return message;
        }
    }
    return 'אין פוזיציות להצגה';
}

function renderDiagnosticsBanner(targetElement, diagnostics) {
    if (!targetElement || !diagnostics) {
        return;
    }
    
    // Don't show banner if there are executions (for account diagnostics)
    if (diagnostics.execution_pairs_count !== undefined && diagnostics.execution_pairs_count > 0) {
        // Remove existing banner if executions exist
        const existing = targetElement.querySelector('.portfolio-diagnostics-banner');
        if (existing) {
            existing.remove();
        }
        return;
    }
    
    const existing = targetElement.querySelector('.portfolio-diagnostics-banner');
    if (existing) {
        existing.remove();
    }
    
    const message =
        createDiagnosticsMessageFromPortfolio(diagnostics) ||
        createDiagnosticsMessageFromAccount(diagnostics);
    
    if (!message) {
        return;
    }
    
    const banner = document.createElement('div');
    banner.className = 'alert alert-info portfolio-diagnostics-banner mt-2 mb-0 small';
    banner.textContent = message;
    targetElement.appendChild(banner);
}

/**
 * Initialize positions & portfolio system
 * @param {boolean} autoSelectDefault - Auto-select default trading account from preferences
 */
window.initPositionsPortfolio = async function(autoSelectDefault = false) {
    window.Logger.info('🔧 אתחול מערכת פוזיציות ופורטפוליו', { page: "trading_accounts" });
    
    // Wait for UnifiedCacheManager to be available
    if (!window.UnifiedCacheManager) {
        window.Logger.warn('⚠️ UnifiedCacheManager not available, waiting...', { page: "trading_accounts" });
        // Wait up to 3 seconds
        for (let i = 0; i < 30; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.UnifiedCacheManager) {
                window.Logger.info('✅ UnifiedCacheManager became available', { page: "trading_accounts" });
                break;
            }
        }
    }
    
    if (!window.UnifiedCacheManager) {
        window.Logger.error('❌ UnifiedCacheManager not available after wait', { page: "trading_accounts" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'מערכת המטמון לא זמינה. אנא רענן את הדף.');
        }
        return;
    }
    
    // Populate trading account selector when trading accounts are loaded
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        await populatePositionsAccountSelector(autoSelectDefault);
    }
    
    // Setup event listeners
    const positionsSelector = document.getElementById('positionsAccountSelector');
    if (positionsSelector) {
        positionsSelector.addEventListener('change', handlePositionsAccountSelection);
    }
    
    // Populate portfolio trading account selector
    await populatePortfolioAccountSelector();
    
    // Setup portfolio filters
    setupPortfolioFilters();
    
    // Set default active state for side filter buttons (if they exist)
    const allSideBtn = document.querySelector('.portfolio-side-filter-btn[data-side=""]');
    if (allSideBtn && !document.querySelector('.portfolio-side-filter-btn.active')) {
        allSideBtn.classList.add('active');
    }
    
    // Setup summary toggle
    setupSummaryToggle();
    
    // Listen for trading account data updates
    if (window.addEventListener) {
        window.addEventListener('accountsLoaded', async () => {
            await populatePositionsAccountSelector(true);
            await populatePortfolioAccountSelector();
        });
    }
    
    // Setup section open listeners
    setupPositionsSectionOpenListener();
    
    // Load portfolio on init (if no trading account selector dependency)
    await loadPortfolio();
    await loadPortfolioSummary();

    if (typeof window.registerPortfolioTable === 'function') {
        const registered = window.registerPortfolioTable();
        if (!registered) {
            setTimeout(() => {
                if (typeof window.registerPortfolioTable === 'function') {
                    window.registerPortfolioTable();
                }
            }, 500);
        }
    }
};

/**
 * Setup event listener for positions-portfolio section opening
 * Ensures data is loaded when section opens
 */
function setupPositionsSectionOpenListener() {
    const positionsSection = document.querySelector('[data-section="positions-portfolio"]');
    if (!positionsSection) return;
    
    // Use MutationObserver to watch for section body display changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const sectionBody = positionsSection.querySelector('.section-body');
                if (sectionBody) {
                    const isVisible = sectionBody.style.display !== 'none' && 
                                     window.getComputedStyle(sectionBody).display !== 'none';
                    if (isVisible) {
                        window.Logger.info('📂 positions-portfolio section opened', { page: "trading_accounts" });
                        // Check if selector is populated and account is selected
                        const selector = document.getElementById('positionsAccountSelector');
                        if (selector && selector.value) {
                            const accountId = parseInt(selector.value);
                            if (accountId && !isNaN(accountId)) {
                                // Ensure positions data is loaded
                                if (!window.positionsPortfolioState.positionsData || 
                                    window.positionsPortfolioState.selectedAccountId !== accountId) {
                                    window.Logger.info(`🔄 Loading positions data on section open for account ${accountId}`, { page: "trading_accounts" });
                                    loadAccountPositions(accountId).catch(error => {
                                        window.Logger.error('❌ Error loading positions on section open:', error, { page: "trading_accounts" });
                                    });
                                }
                            }
                        } else {
                            // Selector not populated yet - wait a bit and try again
                            setTimeout(() => {
                                const selector2 = document.getElementById('positionsAccountSelector');
                                if (selector2 && selector2.options.length > 1 && !selector2.value) {
                                    // Auto-select first account if no account selected
                                    selector2.value = selector2.options[1].value;
                                    handlePositionsAccountSelection({ target: selector2 });
                                }
                            }, 500);
                        }
                    }
                }
            }
        });
    });

    // Observe section body for style changes
    const sectionBody = positionsSection.querySelector('.section-body');
    if (sectionBody) {
        observer.observe(sectionBody, { attributes: true, attributeFilter: ['style'] });
    }
}

/**
 * Populate positions trading account selector dropdown
 * @param {boolean} autoSelectDefault - Auto-select default trading account from preferences
 */
async function populatePositionsAccountSelector(autoSelectDefault = false) {
    const selector = document.getElementById('positionsAccountSelector');
    if (!selector) return;
    
    // Clear existing options (except first)
    while (selector.options.length > 1) {
        selector.remove(1);
    }
    
    // Add trading accounts - reuse logic from account-activity.js
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        window.trading_accountsData.forEach(tradingAccount => {
            const option = document.createElement('option');
            option.value = tradingAccount.id;
            option.textContent = tradingAccount.name || `חשבון מסחר ${tradingAccount.id}`;
            selector.appendChild(option);
        });
    }
    
    window.Logger.info(`✅ Positions trading account selector populated with ${selector.options.length - 1} trading accounts`, { page: "trading_accounts" });
    
    // Auto-select default trading account from preferences (same logic as account-activity)
    if (autoSelectDefault && selector.options.length > 1) {
        const currentValue = selector.value;
        if (!currentValue || currentValue === '') {
            try {
                let defaultAccountId = null;
                
                // Try PreferencesCore first (preferred method)
                if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
                    try {
                        const prefValue = await window.PreferencesCore.getPreference('default_trading_account');
                        if (prefValue) {
                            const parsed = parseInt(prefValue);
                            if (!isNaN(parsed)) {
                                defaultAccountId = parsed;
                                window.Logger.info(`✅ Got default account from PreferencesCore: ${defaultAccountId}`, { page: 'trading_accounts' });
                            }
                        }
                    } catch (e) {
                        window.Logger.warn('⚠️ Error getting default account from PreferencesCore:', e, { page: 'trading_accounts' });
                    }
                }
                
                // Fallback to window.getPreference if PreferencesCore didn't work
                if (!defaultAccountId && typeof window.getPreference === 'function') {
                    try {
                        const prefValue = await window.getPreference('default_trading_account');
                        if (prefValue) {
                            const parsed = parseInt(prefValue);
                            if (!isNaN(parsed)) {
                                defaultAccountId = parsed;
                                window.Logger.info(`✅ Got default account from window.getPreference: ${defaultAccountId}`, { page: 'trading_accounts' });
                            } else {
                                const tradingAccount = window.trading_accountsData.find(acc => acc.name === prefValue);
                                if (tradingAccount) {
                                    defaultAccountId = tradingAccount.id;
                                    window.Logger.info(`✅ Found default account by name: ${defaultAccountId}`, { page: 'trading_accounts' });
                                }
                            }
                        }
                    } catch (e) {
                        window.Logger.warn('⚠️ Error getting default account from window.getPreference:', e, { page: 'trading_accounts' });
                    }
                }
                
                // Verify that the default account exists in the selector options
                const defaultOption = selector.querySelector(`option[value="${defaultAccountId}"]`);
                if (!defaultAccountId || !defaultOption) {
                    // Fallback to first available account (skip the empty "בחר חשבון..." option)
                    if (selector.options.length > 1) {
                        defaultAccountId = selector.options[1].value;
                        window.Logger.info(`ℹ️ No valid default account in preferences, using first account (ID: ${defaultAccountId})`, { page: 'trading_accounts' });
                    } else {
                        window.Logger.warn('⚠️ No accounts available to select', { page: 'trading_accounts' });
                        return; // No accounts to select
                    }
                } else {
                    window.Logger.info(`🔄 Auto-selecting default account from preferences (ID: ${defaultAccountId})`, { page: 'trading_accounts' });
                }
                
                // Use DataCollectionService to set value if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(selector.id, defaultAccountId, 'int');
                } else {
                  selector.value = defaultAccountId;
                }
                handlePositionsAccountSelection({ target: selector });
            } catch (error) {
                window.Logger.error('❌ Error getting default trading account:', error, { page: "trading_accounts" });
                const firstAccountId = selector.options[1].value;
                // Use DataCollectionService to set value if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(selector.id, firstAccountId, 'int');
                } else {
                  selector.value = firstAccountId;
                }
                handlePositionsAccountSelection({ target: selector });
            }
        }
    }
}

/**
 * Handle positions trading account selection change
 */
async function handlePositionsAccountSelection(event) {
    const accountId = parseInt(event.target.value);
    
    if (!accountId || isNaN(accountId)) {
        clearPositionsTable();
        return;
    }
    
    window.positionsPortfolioState.selectedAccountId = accountId;
    
    // Show section body
    // Show section body to ensure table is visible
    const sectionBody = document.querySelector('[data-section="positions-portfolio"] .section-body');
    if (sectionBody) {
        sectionBody.style.display = 'block';
        // Remove d-none class if present
        sectionBody.classList.remove('d-none');
    }
    
    // Load positions for selected trading account
    await loadAccountPositions(accountId);
}

/**
 * Load trading account positions from API with cache
 * @param {number} accountId - Trading account ID
 */
async function loadAccountPositions(accountId) {
    if (!accountId) return;
    
    window.positionsPortfolioState.isLoading = true;
    const tableBody = document.querySelector('#positionsTable tbody');
    
    try {
        // Show loading state
        if (tableBody) {
            tableBody.textContent = '';
            const loadingRow = document.createElement('tr');
            const loadingCell = document.createElement('td');
            loadingCell.colSpan = 8;
            loadingCell.className = 'loading';
            loadingCell.textContent = 'טוען פוזיציות...';
            loadingRow.appendChild(loadingCell);
            tableBody.appendChild(loadingRow);
        }
        
        // Cache key
        const cacheKey = `positions-account-${accountId}`;
        
        // Load from cache or API
        const payload = await window.UnifiedCacheManager.get(cacheKey, {
            fallback: async () => {
                const response = await fetch(`/api/positions/account/${accountId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    return {
                        positions: result.data.positions || [],
                        diagnostics: result.data.diagnostics || null
                    };
                }
                return { positions: [], diagnostics: null };
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        const { positions, diagnostics } = normalizePositionsPayload(payload);
        window.positionsPortfolioState.positionsData = positions;
        window.positionsPortfolioState.positionsPageData = positions;
        setPositionsDiagnostics(diagnostics);
        
        // Calculate totals - sum of all market values
        const totalPositionsValue = positions.reduce((sum, p) => sum + (p.market_value || 0), 0);
        
        // Get trading account cash balance for total trading account value
        let accountTotalValue = totalPositionsValue;
        try {
            const balanceResponse = await fetch(`/api/account-activity/${accountId}/balances`);
            if (balanceResponse.ok) {
                const balanceResult = await balanceResponse.json();
                if (balanceResult.status === 'success' && balanceResult.data) {
                    const cashBalance = balanceResult.data.base_currency_total || 0;
                    accountTotalValue = cashBalance + totalPositionsValue;
                }
            }
        } catch (e) {
            window.Logger.warn('Error getting trading account balance:', e, { page: "trading_accounts" });
        }
        
        // Update count and totals
        const countTextElement = document.getElementById('positionsCountText');
        const separatorElement = document.getElementById('positionsSeparator');
        const totalValueElement = document.getElementById('positionsTotalValue');
        const totalValueAmountElement = document.getElementById('positionsTotalValueAmount');
        const separator2Element = document.getElementById('positionsSeparator2');
        const accountTotalElement = document.getElementById('positionsAccountTotalValue');
        const accountTotalAmountElement = document.getElementById('positionsAccountTotalValueAmount');
        
        // Update count using generic function (gets total filtered count, not just current page)
        if (window.updateTableCount) {
            window.updateTableCount('positionsCountText', 'positions', 'פוזיציות', positions.length);
        } else {
            // Fallback
            if (countTextElement) {
                countTextElement.textContent = `${positions.length} פוזיציות`;
            }
        }
        
        // Show/hide elements based on data availability
        if (positions.length > 0) {
            if (separatorElement) separatorElement.style.display = 'inline';
            if (totalValueElement) totalValueElement.style.display = 'inline';
            if (totalValueAmountElement) {
                totalValueAmountElement.textContent = formatCurrencyHebrew(totalPositionsValue, false, true);
            }
            if (separator2Element) separator2Element.style.display = 'inline';
            if (accountTotalElement) accountTotalElement.style.display = 'inline';
            if (accountTotalAmountElement) {
                accountTotalAmountElement.textContent = formatCurrencyHebrew(accountTotalValue, false, true);
            }
        } else {
            if (separatorElement) separatorElement.style.display = 'none';
            if (totalValueElement) totalValueElement.style.display = 'none';
            if (separator2Element) separator2Element.style.display = 'none';
            if (accountTotalElement) accountTotalElement.style.display = 'none';
        }
        
        // Render table
        await syncPositionsTablePagination(positions);
        
    } catch (error) {
        window.Logger.error('❌ Error loading trading account positions:', error, { page: "trading_accounts" });
        if (tableBody) {
            tableBody.textContent = '';
            const errorRow = document.createElement('tr');
            const errorCell = document.createElement('td');
            errorCell.colSpan = 8;
            errorCell.className = 'error';
            errorCell.textContent = 'שגיאה בטעינת פוזיציות';
            errorRow.appendChild(errorCell);
            tableBody.appendChild(errorRow);
        }
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה בטעינת פוזיציות. אנא נסה שוב.');
        }
    } finally {
        window.positionsPortfolioState.isLoading = false;
    }
}

/**
 * Format currency value for Hebrew display
 * - No decimal places for market value and P/L
 * - With commas for thousands
 * - Sign (+/-) at the end for Hebrew RTL
 * @param {number} value - The value to format
 * @param {boolean} showSign - Whether to show + sign for positive values
 * @param {boolean} noDecimals - Whether to round to whole numbers (default: false, use true for market value and P/L)
 * @returns {string} Formatted string like "$1,234+" or "$-567"
 */
function formatCurrencyHebrew(value, showSign = false, noDecimals = false) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'לא זמין';
    }
    
    const numValue = parseFloat(value);
    const rounded = noDecimals ? Math.round(numValue) : numValue;
    const absValue = Math.abs(rounded);
    
    // Format with commas, no decimals for market value/P&L, 2 decimals for other amounts
    const formatted = noDecimals 
        ? absValue.toLocaleString('he-IL') 
        : absValue.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Add sign at the end for RTL
    let sign = '';
    if (numValue > 0 && showSign) {
        sign = '+';
    } else if (numValue < 0) {
        sign = '-';
    }
    
    return `$${formatted}${sign}`;
}

/**
 * Sync positions table with pagination system
 * @param {Array} positions
 */
async function syncPositionsTablePagination(positions) {
    const safePositions = Array.isArray(positions) ? positions : [];

    if (typeof window.updateTableWithPagination === 'function') {
        try {
            positionsPaginationInstance = await window.updateTableWithPagination({
                tableId: 'positionsTable',
                tableType: 'positions',
                data: safePositions,
                render: (pageData) => renderPositionsTable(pageData),
            });
            return;
        } catch (error) {
            window.Logger?.warn('syncPositionsTablePagination: fallback to direct render', { error, page: 'positions-portfolio' });
        }
    }

    renderPositionsTable(safePositions);
}

window.syncPositionsTablePagination = syncPositionsTablePagination;

/**
 * Render positions table
 * @param {Array} positions - Array of position objects
 */
function renderPositionsTable(positions) {
    window.Logger.info('🔵 [renderPositionsTable] START', { 
        positionsCount: positions?.length || 0,
        hasTableMapping: !!(window.TABLE_COLUMN_MAPPINGS?.['positions']),
        page: 'trading_accounts' 
    });
    const tableBody = document.querySelector('#positionsTable tbody');
    if (!tableBody) {
        window.Logger.warn('⚠️ [renderPositionsTable] Table body not found', { page: 'trading_accounts' });
        return;
    }
    
    // Track last rendered page separately from canonical dataset
    if (positions && Array.isArray(positions)) {
        window.positionsPortfolioState.positionsPageData = positions;
    } else {
        // If no positions provided, try to get last rendered page
        positions = window.positionsPortfolioState.positionsPageData || [];
        if ((!positions || positions.length === 0) && Array.isArray(window.positionsPortfolioState.positionsData)) {
            // Fallback to full dataset only if no page snapshot exists
            positions = window.positionsPortfolioState.positionsData;
        }
    }
    
    if (!positions || positions.length === 0) {
        const message = getNoPositionsMessage(window.positionsPortfolioState.positionsDiagnostics, 'account');
        tableBody.textContent = '';
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        // Count columns: 8 data columns + 1 actions column = 9 total
        cell.colSpan = 9;
        cell.className = 'empty';
        cell.textContent = message;
        row.appendChild(cell);
        tableBody.appendChild(row);
        window.Logger.info('🔵 [renderPositionsTable] No positions, showing empty message', { 
            message, 
            page: 'trading_accounts' 
        });
        return;
    }
    
    // Use FieldRendererService for consistent rendering
    const FieldRenderer = window.FieldRendererService;
    
    // Get table column mapping from TABLE_COLUMN_MAPPINGS (ensures correct column order)
    const tableMapping = window.TABLE_COLUMN_MAPPINGS?.['positions'] || [
        'ticker_symbol',           // 0 - סימבול
        'ticker_name',             // 1 - נוכחי (שם הטיקר)
        'quantity',                // 2 - כמות
        'side',                     // 3 - צד
        'average_price_net',        // 4 - מחיר ממוצע
        'market_value',            // 5 - שווי שוק
        'unrealized_pl',           // 6 - רווח/הפסד לא מוכר
        'percent_of_account',      // 7 - אחוז מהחשבון
    ];
    window.Logger.info('🔵 [renderPositionsTable] Using table mapping', { 
        mappingLength: tableMapping.length,
        mapping: tableMapping,
        usingDefault: !window.TABLE_COLUMN_MAPPINGS?.['positions'],
        page: 'trading_accounts' 
    });
    
    const isIndexPage = window.location.pathname.includes('index') ||
        document.body.classList.contains('index-page') ||
        window.location.pathname === '/' ||
        window.location.pathname === '/index.html';
    
    let html = '';
    positions.forEach(position => {
        const side = position.side || 'closed';
        const quantity = position.quantity || 0;
        const marketValue = position.market_value || 0;
        const unrealizedPl = position.unrealized_pl || 0;
        const unrealizedPlPercent = position.unrealized_pl_percent || 0;
        const percentAccount = position.percent_of_account || 0;
        
        // Build row using TABLE_COLUMN_MAPPINGS order
        html += '<tr data-position-id="' + (position.ticker_id || '') + '" data-account-id="' + (position.trading_account_id || '') + '">';
        
        // Render each column according to TABLE_COLUMN_MAPPINGS order
        tableMapping.forEach((fieldName, columnIndex) => {
            let cellContent = '';
            let cellClass = '';
            
            switch (fieldName) {
            case 'ticker_symbol':
                cellClass = 'col-symbol';
                const tickerLink = position.ticker_id ? 
                    `<a href="#" onclick="if (typeof window.showEntityDetails === 'function') { window.showEntityDetails('ticker', ${position.ticker_id}, { mode: 'view' }); return false; }" class="entity-trade-link">${position.ticker_symbol || 'N/A'}</a>` :
                    position.ticker_symbol || 'N/A';
                cellContent = `<strong>${tickerLink}</strong>`;
                break;
                
            case 'ticker_name':
                cellClass = 'col-ticker';
                // Display only ticker name (not symbol, as symbol is already in ticker_symbol column)
                // If ticker_name is not available, show ticker_symbol as fallback
                if (position.ticker_name) {
                    cellContent = `<strong>${position.ticker_name}</strong>`;
                } else if (position.ticker_symbol) {
                    cellContent = `<strong>${position.ticker_symbol}</strong>`;
                } else {
                    cellContent = 'N/A';
                }
                break;
                
            case 'quantity':
                cellClass = 'col-quantity';
                const quantitySign = quantity > 0 ? '+' : quantity < 0 ? '-' : '';
                const quantityClass = quantity > 0 ? 'text-success' : quantity < 0 ? 'text-danger' : '';
                cellContent = `<span class="${quantityClass}">#${quantitySign}${Math.abs(quantity).toLocaleString()}</span>`;
                break;
                
            case 'side':
                cellClass = 'col-side';
                let sideHtml = `<span class="badge badge-${side}">${side === 'long' ? 'לונג' : side === 'short' ? 'שורט' : 'סגור'}</span>`;
                if (FieldRenderer && FieldRenderer.renderSide) {
                    try {
                        sideHtml = FieldRenderer.renderSide(side);
                    } catch (e) {
                        window.Logger.warn('Error rendering side:', e, { page: "trading_accounts" });
                    }
                }
                cellContent = sideHtml;
                break;
                
            case 'average_price_net':
                cellClass = 'col-avg-price';
                if (FieldRenderer && FieldRenderer.renderAmount) {
                    cellContent = FieldRenderer.renderAmount(position.average_price_net || 0, '$', 2, false);
                } else {
                    cellContent = position.average_price_net ? `$${position.average_price_net.toFixed(2)}` : 'N/A';
                }
                break;
                
            case 'market_value':
                cellClass = 'col-market-value';
                cellContent = formatCurrencyHebrew(marketValue, false, true);
                break;
                
            case 'unrealized_pl':
                cellClass = 'col-unrealized-pl';
                if (marketValue) {
                    cellContent = `
                        <div class="portfolio-pl-value ${unrealizedPl >= 0 ? 'text-success' : 'text-danger'}">
                            <div class="pl-amount">${formatCurrencyHebrew(unrealizedPl, true, true)}</div>
                            <div class="pl-percent">${unrealizedPlPercent.toFixed(2)}%${unrealizedPlPercent >= 0 ? '+' : '-'}</div>
                        </div>
                    `;
                } else {
                    cellContent = 'לא זמין';
                }
                break;
                
            case 'percent_of_account':
                cellClass = 'col-percent-account';
                cellContent = percentAccount.toFixed(2) + '%';
                break;
                
            default:
                // Fallback: use FieldRendererService if available
                const value = position[fieldName];
                if (FieldRenderer && FieldRenderer.renderField) {
                    try {
                        cellContent = FieldRenderer.renderField(value, fieldName, 'positions');
                    } catch (e) {
                        cellContent = value || '';
                    }
                } else {
                    cellContent = value || '';
                }
                break;
            }
            
            html += `<td class="${cellClass}">${cellContent}</td>`;
        });
        
        // Add actions column (not in mapping, always last)
        html += '<td class="col-actions actions-cell">';
        html += window.createActionsMenu ? window.createActionsMenu([
            { type: 'VIEW', onclick: `window.showPositionDetails && window.showPositionDetails(${position.trading_account_id}, ${position.ticker_id})`, title: 'פרטי פוזיציה' }
        ]) : '<!-- Actions menu not available -->';
        html += '</td>';
        
        html += '</tr>';
    });
    
    window.Logger.info('🔵 [renderPositionsTable] Generated HTML', { 
        htmlLength: html.length,
        rowsCount: positions.length,
        page: 'trading_accounts' 
    });
    
    // Update table HTML - wrap in table/tbody structure for proper parsing
    tableBody.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<table><tbody>${html}</tbody></table>`, 'text/html');
    const tempTbody = doc.body.querySelector('tbody');
    if (tempTbody) {
        Array.from(tempTbody.children).forEach(row => {
            tableBody.appendChild(row.cloneNode(true));
        });
    }
    window.Logger.info('🔵 [renderPositionsTable] Table updated', { 
        finalRowsCount: tableBody.querySelectorAll('tr').length,
        page: 'trading_accounts' 
    });
}

/**
 * Populate portfolio trading account selector dropdown
 */
async function populatePortfolioAccountSelector() {
    const selector = document.getElementById('portfolioAccountFilter');
    if (!selector) return;

    const previousValue = selector.value;

    if (window.SelectPopulatorService?.populateAccountsSelect) {
        try {
            await window.SelectPopulatorService.populateAccountsSelect(selector, {
                includeAll: true,
                includeEmpty: true,
                emptyText: 'כל חשבונות המסחר',
                defaultValue: previousValue ? parseInt(previousValue, 10) || previousValue : null
            });

            if (previousValue) {
                // Use DataCollectionService to set value if available
                if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.setValue) {
                  window.DataCollectionService.setValue(selector.id, previousValue, 'text');
                } else {
                  selector.value = previousValue;
                }
            }

            window.Logger?.info('✅ Portfolio account selector populated via SelectPopulatorService', { page: "positions-portfolio" });
            return;
        } catch (error) {
            window.Logger?.warn('⚠️ SelectPopulatorService.populateAccountsSelect failed, falling back to cached data', error, { page: "positions-portfolio" });
        }
    }

    // Fallback: use cached trading_accountsData if available
    while (selector.options.length > 1) {
        selector.remove(1);
    }
    
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        window.trading_accountsData.forEach(tradingAccount => {
            const option = document.createElement('option');
            option.value = tradingAccount.id;
            option.textContent = tradingAccount.name || `חשבון מסחר ${tradingAccount.id}`;
            selector.appendChild(option);
        });
    }

    if (previousValue) {
        selector.value = previousValue;
    }
    
    window.Logger?.info(`✅ Portfolio trading account selector populated with ${selector.options.length - 1} trading accounts (fallback)`, { page: "positions-portfolio" });
}

/**
 * Handle portfolio side filter button click
 * @param {string} side - Side value: '', 'long', or 'short'
 */
window.handlePortfolioSideFilter = function(side) {
    // Update button states - CSS handles colors automatically
    const buttons = document.querySelectorAll('.portfolio-side-filter-btn');
    buttons.forEach(btn => {
        const btnSide = btn.getAttribute('data-side') || '';
        if (btnSide === side) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
    });
    
    // Reload portfolio with new filter
    loadPortfolio();
};

/**
 * Setup portfolio filters
 */
function setupPortfolioFilters() {
    const accountFilter = document.getElementById('portfolioAccountFilter');
    const sideFilterButtons = document.querySelectorAll('.portfolio-side-filter-btn');
    const includeClosed = document.getElementById('portfolioIncludeClosed');
    const unifyAccounts = document.getElementById('portfolioUnifyAccounts');
    
    if (accountFilter) {
        accountFilter.addEventListener('change', () => loadPortfolio());
    }
    
    // Setup side filter buttons - CSS handles colors automatically
    if (sideFilterButtons && sideFilterButtons.length > 0) {
        // Set default active state to "הכל" (empty)
        const allBtn = document.querySelector('.portfolio-side-filter-btn[data-side=""]');
        if (allBtn) {
            allBtn.classList.add('active');
            allBtn.setAttribute('aria-pressed', 'true');
        }
        sideFilterButtons.forEach(btn => {
            if (!btn.classList.contains('active')) {
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    } else {
        // Fallback to old select element (if exists)
        const sideFilter = document.getElementById('portfolioSideFilter');
        if (sideFilter) {
            sideFilter.addEventListener('change', () => loadPortfolio());
        }
    }
    
    if (includeClosed) {
        includeClosed.addEventListener('change', () => loadPortfolio());
    }
    
    if (unifyAccounts) {
        unifyAccounts.addEventListener('change', () => loadPortfolio());
    }
}

/**
 * Load portfolio from API with cache
 */
async function loadPortfolio() {
    window.positionsPortfolioState.isLoading = true;
    const tableBody = document.querySelector('#portfolioTable tbody');
    
    try {
        // Show loading state
        if (tableBody) {
            tableBody.textContent = '';
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 10;
            cell.className = 'loading';
            cell.textContent = 'טוען פורטפוליו...';
            row.appendChild(cell);
            tableBody.appendChild(row);
        }
        
        // Get filter values
        // Use DataCollectionService to get value if available
        let accountFilter;
        if (typeof window.DataCollectionService !== 'undefined' && window.DataCollectionService.getValue) {
          accountFilter = window.DataCollectionService.getValue('portfolioAccountFilter', 'text', '') || '';
        } else {
          const accountFilterEl = document.getElementById('portfolioAccountFilter');
          accountFilter = accountFilterEl ? accountFilterEl.value : '';
        }
        
        // Get side filter from buttons (new design) or select (old design)
        let sideFilter = '';
        const activeSideButton = document.querySelector('.portfolio-side-filter-btn.active');
        if (activeSideButton) {
            sideFilter = activeSideButton.getAttribute('data-side') || '';
        } else {
            // Fallback to old select element
            const sideFilterSelect = document.getElementById('portfolioSideFilter');
            if (sideFilterSelect) {
                sideFilter = sideFilterSelect.value || '';
            }
        }
        
        const includeClosed = document.getElementById('portfolioIncludeClosed')?.checked || false;
        const unifyAccounts = document.getElementById('portfolioUnifyAccounts')?.checked || false;
        
        // Build query string
        const params = new URLSearchParams();
        if (accountFilter) params.append('account_id', accountFilter);
        if (sideFilter) params.append('side', sideFilter);
        if (includeClosed) params.append('include_closed', 'true');
        if (unifyAccounts) params.append('unify_accounts', 'true');
        
        // Cache key includes filters
        const cacheKey = `portfolio-${params.toString()}`;
        
        // Load from cache or API
        const payload = await window.UnifiedCacheManager.get(cacheKey, {
            fallback: async () => {
                const response = await fetch(`/api/positions/portfolio?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    return result.data;
                }
                return { positions: [], summary: {}, diagnostics: null };
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        const normalized = normalizePortfolioPayload(payload);
        window.positionsPortfolioState.portfolioData = normalized;
        setPortfolioDiagnostics(normalized.diagnostics);
        
        // Update count using generic function (gets total filtered count, not just current page)
        const countElement = document.getElementById('portfolioCount');
        if (countElement) {
            const totalPositions = normalized.summary?.total_positions ?? normalized.positions.length ?? 0;
            let countText = `${totalPositions} פוזיציות`;
            if (normalized.diagnostics?.accounts_without_executions?.length) {
                countText += ' • אין נתוני Executions בחלק מהחשבונות';
            }
            // Use generic function if available, otherwise direct update
            if (window.updateTableCount) {
                // For portfolio, we need to preserve the diagnostic text, so use direct update
                countElement.textContent = countText;
            } else {
                countElement.textContent = countText;
            }
        }
        
        // Render table (Pagination System)
        const portfolioPaginationRenderer =
            typeof window.syncPortfolioTablePagination === 'function'
                ? window.syncPortfolioTablePagination
                : syncPortfolioTablePagination;
        await portfolioPaginationRenderer(normalized.positions || []);
        
    } catch (error) {
        window.Logger.error('❌ Error loading portfolio:', error, { page: "trading_accounts" });
        if (tableBody) {
            tableBody.textContent = '';
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 10;
            cell.className = 'error';
            cell.textContent = 'שגיאה בטעינת פורטפוליו';
            row.appendChild(cell);
            tableBody.appendChild(row);
        }
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה בטעינת פורטפוליו. אנא נסה שוב.');
        }
    } finally {
        window.positionsPortfolioState.isLoading = false;
    }
}

/**
 * Sync portfolio table with pagination system
 * @param {Array} positions
 */
async function syncPortfolioTablePagination(positions) {
    const safePositions = Array.isArray(positions) ? positions : [];

    if (typeof window.updateTableWithPagination === 'function') {
        try {
            portfolioPaginationInstance = await window.updateTableWithPagination({
                tableId: 'portfolioTable',
                tableType: 'portfolio',
                data: safePositions,
                render: (pageData) => renderPortfolioTable(pageData),
            });
            return;
        } catch (error) {
            window.Logger?.warn('syncPortfolioTablePagination: fallback to direct render', { error, page: 'positions-portfolio' });
        }
    }

    renderPortfolioTable(safePositions);
}

window.syncPortfolioTablePagination = syncPortfolioTablePagination;

/**
 * Render portfolio table
 * @param {Array} positions - Array of position objects
 */
function renderPortfolioTable(positions) {
    const tableBody = document.querySelector('#portfolioTable tbody');
    if (!tableBody) {
        return;
    }
    
    // If positions provided, use them and update state
    if (positions && Array.isArray(positions)) {
        window.positionsPortfolioState.portfolioPagePositions = positions;
    } else {
        // If no positions provided, try to get from last rendered page
        positions = window.positionsPortfolioState.portfolioPagePositions || [];
        if ((!positions || positions.length === 0) && Array.isArray(window.positionsPortfolioState.portfolioData?.positions)) {
            positions = window.positionsPortfolioState.portfolioData.positions;
        }
    }
    
    if (!positions || positions.length === 0) {
        const message = getNoPositionsMessage(window.positionsPortfolioState.portfolioDiagnostics, 'portfolio');
        tableBody.textContent = '';
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 10;
        cell.className = 'empty';
        cell.textContent = message;
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }
    
    const FieldRenderer = window.FieldRendererService;
    const isIndexPage = window.location.pathname.includes('index') ||
        document.body.classList.contains('index-page') ||
        window.location.pathname === '/' ||
        window.location.pathname === '/index.html';
    
    let html = '';
    positions.forEach(position => {
        const side = position.side || 'closed';
        const quantity = position.quantity || 0;
        const marketValue = position.market_value || 0;
        const unrealizedPl = position.unrealized_pl || 0;
        const unrealizedPlPercent = position.unrealized_pl_percent || 0;
        const percentPortfolio = position.percent_of_portfolio || 0;
        
        // Render ticker info (don't use async renderTickerInfo in sync context)
        let tickerHtml = `<strong>${position.ticker_symbol || 'N/A'}</strong>`;
        if (position.ticker_name) {
            tickerHtml += `<br><small>${position.ticker_name}</small>`;
        }
        // Note: renderTickerInfo is async and returns Promise, not usable in sync HTML building
        
        // Render side using FieldRendererService
        let sideHtml = `<span class="badge badge-${side}">${side === 'long' ? 'לונג' : side === 'short' ? 'שורט' : 'סגור'}</span>`;
        if (FieldRenderer && FieldRenderer.renderSide) {
            try {
                sideHtml = FieldRenderer.renderSide(side);
            } catch (e) {
                window.Logger.warn('Error rendering side:', e, { page: "trading_accounts" });
            }
        }
        
        // Ticker symbol as link
        const tickerLink = position.ticker_id ? 
            `<a href="#" onclick="if (typeof window.showEntityDetails === 'function') { window.showEntityDetails('ticker', ${position.ticker_id}, { mode: 'view' }); return false; }" class="entity-trade-link">${position.ticker_symbol || 'N/A'}</a>` :
            position.ticker_symbol || 'N/A';
        
        // Render quantity with # and sign
        const quantitySign = quantity > 0 ? '+' : quantity < 0 ? '-' : '';
        const quantityClass = quantity > 0 ? 'text-success' : quantity < 0 ? 'text-danger' : '';
        const quantityDisplay = `<span class="${quantityClass}">#${quantitySign}${Math.abs(quantity).toLocaleString()}</span>`;
        
        const accountLink = position.trading_account_id ?
            `<a href="#" onclick="if (typeof window.showEntityDetails === 'function') { window.showEntityDetails('trading_account', ${position.trading_account_id}, { mode: 'view' }); return false; }" class="entity-trade-link">${position.account_name || 'N/A'}</a>` :
            position.account_name || 'N/A';
        
        html += `
            <tr data-position-id="${position.ticker_id}" data-account-id="${position.trading_account_id}">
                <td class="col-side">${sideHtml}</td>
                <td class="col-symbol"><strong>${tickerLink}</strong></td>
                <td class="col-ticker">${tickerHtml}</td>
                <td class="col-quantity">${quantityDisplay}</td>
                <td class="col-avg-price">
                    ${position.average_price_net ? `$${position.average_price_net.toFixed(2)}` : 'N/A'}
                </td>
                <td class="col-market-value">
                    ${formatCurrencyHebrew(marketValue, false, true)}
                </td>
                <td class="col-unrealized-pl">
                    ${marketValue ? `
                        <span class="${unrealizedPl >= 0 ? 'text-success' : 'text-danger'}">
                            ${formatCurrencyHebrew(unrealizedPl, true, true)} (${unrealizedPlPercent.toFixed(2)}%${unrealizedPlPercent >= 0 ? '+' : '-'})
                        </span>
                    ` : 'לא זמין'}
                </td>
                <td class="col-account">${accountLink}</td>
                <td class="col-percent-portfolio">
                    ${percentPortfolio.toFixed(2)}%
                </td>
                <td class="col-actions actions-cell">
                    ${window.createActionsMenu ? window.createActionsMenu([
                      { type: 'VIEW', onclick: `window.showPositionDetails && window.showPositionDetails(${position.trading_account_id}, ${position.ticker_id})`, title: 'פרטי פוזיציה' }
                    ]) : '<!-- Actions menu not available -->'}
                </td>
            </tr>
        `;
    });
    
    // Update table HTML
    tableBody.textContent = '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    doc.body.childNodes.forEach(node => {
        tableBody.appendChild(node.cloneNode(true));
    });
}

/**
 * Setup summary toggle
 */
/**
 * Setup summary toggle button
 * Note: Now uses data-onclick attribute instead of addEventListener
 */
function setupSummaryToggle() {
    // No longer needed - button uses data-onclick attribute
    // The togglePortfolioSummarySize function is called directly via data-onclick
}

/**
 * Update portfolio summary toggle button state (icon, tooltip, accessibility)
 */
async function updatePortfolioSummaryToggleButton() {
    const toggleBtn = document.getElementById('portfolioSummaryToggleSize');
    if (!toggleBtn) {
        return;
    }

    const currentSize = window.positionsPortfolioState.summarySize || 'minimal';
    const isMinimal = currentSize === 'minimal';
    const nextActionLabel = isMinimal ? 'הצג סיכום מלא' : 'הצג סיכום מצומצם';
    
    // Determine icon type and name
    const iconType = 'button';
    const iconName = isMinimal ? 'eye' : 'close';
    
    // Clear existing content
    toggleBtn.textContent = '';
    
    // Render icon using IconSystem - no fallback
    if (!window.IconSystem || !window.IconSystem.initialized) {
        if (window.Logger) {
            window.Logger.error('IconSystem not available for portfolio summary toggle button', { 
                iconType,
                iconName
            }, { page: 'positions-portfolio' });
        }
        return;
    }
    
    try {
        const iconHTML = await window.IconSystem.renderIcon(iconType, iconName, {
            size: '16',
            alt: nextActionLabel,
            class: 'icon'
        });
        
        // Parse and insert icon HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(iconHTML, 'text/html');
        const iconElement = doc.body.firstElementChild;
        
        if (iconElement) {
            toggleBtn.appendChild(iconElement);
        } else {
            if (window.Logger) {
                window.Logger.error('IconSystem.renderIcon returned empty HTML for portfolio summary toggle', { 
                    iconType,
                    iconName,
                    iconHTML
                }, { page: 'positions-portfolio' });
            }
        }
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('Failed to render icon for portfolio summary toggle', { 
                error: error?.message,
                iconType,
                iconName
            }, { page: 'positions-portfolio' });
        }
    }
    
    // Use centralized updateTooltip function instead of manual updates
    if (window.advancedButtonSystem && typeof window.advancedButtonSystem.updateTooltip === 'function') {
        window.advancedButtonSystem.updateTooltip(toggleBtn, nextActionLabel, {
            placement: 'top',
            trigger: 'hover'
        });
    } else {
        // Fallback to manual update if button system not available
        toggleBtn.setAttribute('title', nextActionLabel);
        toggleBtn.setAttribute('aria-label', nextActionLabel);
        toggleBtn.setAttribute('data-tooltip', nextActionLabel);
        
        if (window.bootstrap?.Tooltip) {
            const tooltipInstance = window.bootstrap.Tooltip.getInstance(toggleBtn);
            if (tooltipInstance) {
                tooltipInstance.setContent({ '.tooltip-inner': nextActionLabel });
            }
        }
    }
}

/**
 * Toggle portfolio summary size (minimal/full)
 * Called via data-onclick attribute
 */
window.togglePortfolioSummarySize = async function() {
    const currentSize = window.positionsPortfolioState.summarySize || 'minimal';
    const newSize = currentSize === 'minimal' ? 'full' : 'minimal';
    window.positionsPortfolioState.summarySize = newSize;
    await updatePortfolioSummaryToggleButton();
    loadPortfolioSummary();
};

/**
 * Load portfolio summary
 */
async function loadPortfolioSummary() {
    await updatePortfolioSummaryToggleButton();
    const summaryElement = document.getElementById('portfolioSummaryStats');
    if (!summaryElement) return;
    
    try {
        summaryElement.textContent = '';
        const loadingDiv = document.createElement('div');
        loadingDiv.textContent = 'טוען סיכום...';
        summaryElement.appendChild(loadingDiv);
        
        const size = window.positionsPortfolioState.summarySize || 'minimal';
        const cacheKey = `portfolio-summary-${size}`;
        
        // Load from cache or API
        const data = await window.UnifiedCacheManager.get(cacheKey, {
            fallback: async () => {
                const response = await fetch(`/api/portfolio/summary?size=${size}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    return result.data;
                }
                return { summary: {}, diagnostics: null };
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        window.positionsPortfolioState.summaryData = data;
        window.positionsPortfolioState.summaryDiagnostics = data.diagnostics || null;
        if (!window.positionsPortfolioState.portfolioDiagnostics && data.diagnostics) {
            setPortfolioDiagnostics(data.diagnostics);
        }
        
        // Render summary (summary is already calculated object, not array)
        renderPortfolioSummaryFallback(data.summary || {}, size);
        
    } catch (error) {
        window.Logger.error('❌ Error loading portfolio summary:', error, { page: "trading_accounts" });
        if (summaryElement) {
            summaryElement.textContent = '';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = 'שגיאה בטעינת סיכום';
            summaryElement.appendChild(errorDiv);
        }
    }
}

/**
 * Fallback rendering for portfolio summary
 * @param {Object} summary - Summary data
 * @param {string} size - 'minimal' or 'full'
 */
function renderPortfolioSummaryFallback(summary, size) {
    const summaryElement = document.getElementById('portfolioSummaryStats');
    if (!summaryElement) return;
    
    const totalPositions = summary.total_positions || 0;
    const totalMarketValue = summary.total_market_value || 0;
    const totalCost = summary.total_cost || 0;
    const totalPl = summary.total_pl || 0;
    const totalPlPercent = summary.total_pl_percent || 0;
    
    summaryElement.textContent = '';
    if (size === 'minimal') {
        const div1 = document.createElement('div');
        div1.textContent = 'סה"כ פוזיציות: ';
        const strong1 = document.createElement('strong');
        strong1.textContent = totalPositions;
        div1.appendChild(strong1);
        summaryElement.appendChild(div1);
        
        const div2 = document.createElement('div');
        div2.textContent = 'שווי שוק כולל: ';
        const strong2 = document.createElement('strong');
        strong2.textContent = formatCurrencyHebrew(totalMarketValue, false, true);
        div2.appendChild(strong2);
        summaryElement.appendChild(div2);
        
        const div3 = document.createElement('div');
        div3.textContent = 'רווח/הפסד כולל: ';
        const strong3 = document.createElement('strong');
        strong3.className = totalPl >= 0 ? 'text-success' : 'text-danger';
        strong3.textContent = `${formatCurrencyHebrew(totalPl, true, true)} (${totalPlPercent.toFixed(2)}%${totalPlPercent >= 0 ? '+' : '-'})`;
        div3.appendChild(strong3);
        summaryElement.appendChild(div3);
    } else {
        const container = document.createElement('div');
        container.className = 'info-summary-full';
        
        const createSummaryRow = (label, value, className = '') => {
            const div = document.createElement('div');
            div.textContent = `${label}: `;
            const strong = document.createElement('strong');
            if (className) strong.className = className;
            strong.textContent = value;
            div.appendChild(strong);
            return div;
        };
        
        container.appendChild(createSummaryRow('סה"כ פוזיציות', totalPositions));
        container.appendChild(createSummaryRow('שווי שוק כולל', formatCurrencyHebrew(totalMarketValue, false, true)));
        container.appendChild(createSummaryRow('עלות כוללת', formatCurrencyHebrew(totalCost, false, false)));
        container.appendChild(createSummaryRow('רווח/הפסד מוכר', formatCurrencyHebrew(summary.total_realized_pl || 0, true, true)));
        container.appendChild(createSummaryRow('רווח/הפסד לא מוכר', formatCurrencyHebrew(summary.total_unrealized_pl || 0, true, true)));
        container.appendChild(createSummaryRow('רווח/הפסד כולל', `${formatCurrencyHebrew(totalPl, true, true)} (${totalPlPercent.toFixed(2)}%${totalPlPercent >= 0 ? '+' : '-'})`, totalPl >= 0 ? 'text-success' : 'text-danger'));
        container.appendChild(createSummaryRow('סה"כ עמלות', formatCurrencyHebrew(summary.total_fees || 0, false, false)));
        
        summaryElement.appendChild(container);
    }
    
    const diagnosticsSource = window.positionsPortfolioState.portfolioDiagnostics || window.positionsPortfolioState.summaryDiagnostics;
    if (diagnosticsSource) {
        renderDiagnosticsBanner(summaryElement, diagnosticsSource);
    }
}

/**
 * Show position details modal
 * @param {number} accountId - Trading account ID
 * @param {number} tickerId - Ticker ID
 */
window.showPositionDetails = function(accountId, tickerId) {
    try {
        if (!accountId || !tickerId) {
            window.Logger?.error('showPositionDetails called without accountId/tickerId', { accountId, tickerId }, { page: "positions-portfolio" });
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', 'חסרים נתונים להצגת פרטי פוזיציה.');
            }
            return;
        }

        const compositeId = `${accountId}-${tickerId}`;
        const sourceInfo = {
            component: 'positions-portfolio',
            accountId,
            tickerId,
            timestamp: Date.now()
        };

        if (window.showEntityDetails) {
            window.showEntityDetails('position', compositeId, {
                includeLinkedItems: true,
                forceRefresh: false,
                positionContext: { accountId, tickerId },
                source: sourceInfo
            });
            return;
        }

        window.Logger?.warn('EntityDetails system not available, falling back to notification', { page: "positions-portfolio" });
        if (window.showInfoNotification) {
            window.showInfoNotification('מערכת פרטי הישויות אינה זמינה. אנא רענן את העמוד ונסה שוב.');
        }
    } catch (error) {
        window.Logger?.error('❌ Error delegating position details to entity modal:', error, { page: "positions-portfolio" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה בפתיחת פרטי פוזיציה.');
        }
    }
};

/**
 * Render position details content for modal
 * @param {Object} positionData - Position data from API
 * @param {number} tickerId - Ticker ID for link
 * @returns {string} HTML content
 */
function clearPositionsTable() {
    const tableBody = document.querySelector('#positionsTable tbody');
    if (tableBody) {
        tableBody.textContent = '';
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 9;
        cell.className = 'loading';
        cell.textContent = 'בחר חשבון מסחר להצגת פוזיציות...';
        row.appendChild(cell);
        tableBody.appendChild(row);
    }
    
    // Reset count and totals display
    const countTextElement = document.getElementById('positionsCountText');
    const separatorElement = document.getElementById('positionsSeparator');
    const totalValueElement = document.getElementById('positionsTotalValue');
    const separator2Element = document.getElementById('positionsSeparator2');
    const accountTotalElement = document.getElementById('positionsAccountTotalValue');
    
    if (countTextElement) {
        countTextElement.textContent = 'בחר חשבון מסחר...';
    }
    if (separatorElement) separatorElement.style.display = 'none';
    if (totalValueElement) totalValueElement.style.display = 'none';
    if (separator2Element) separator2Element.style.display = 'none';
    if (accountTotalElement) accountTotalElement.style.display = 'none';
}

// Export for external use
window.PositionsPortfolioSystem = {
    init: window.initPositionsPortfolio,
    loadAccountPositions,
    loadPortfolio,
    loadPortfolioSummary,
    showPositionDetails: window.showPositionDetails
};

// Export table rendering functions to window scope for sorting
window.updatePositionsTable = renderPositionsTable;
window.updatePortfolioTable = renderPortfolioTable;

/**
 * Debug function to check positions/portfolio system state
 * Call this from browser console: window.debugPositionsPortfolio()
 * Uses Logger.debug to keep console quiet in production
 */
window.debugPositionsPortfolio = function() {
    if (window.Logger) {
        window.Logger.debug('🔍 ===== POSITIONS/PORTFOLIO DEBUG =====', { page: "positions-portfolio" });
    }
    
    // Check state object
    if (window.Logger) {
        window.Logger.debug('1. State Object:', window.positionsPortfolioState, { page: "positions-portfolio" });
        window.Logger.debug('   - Exists:', !!window.positionsPortfolioState, { page: "positions-portfolio" });
        window.Logger.debug('   - Type:', typeof window.positionsPortfolioState, { page: "positions-portfolio" });
    }
    
    if (window.positionsPortfolioState) {
        if (window.Logger) {
            window.Logger.debug('   - selectedAccountId:', window.positionsPortfolioState.selectedAccountId, { page: "positions-portfolio" });
            window.Logger.debug('   - isLoading:', window.positionsPortfolioState.isLoading, { page: "positions-portfolio" });
        window.Logger.debug('   - positionsData (full):', window.positionsPortfolioState.positionsData, { page: "positions-portfolio" });
        window.Logger.debug('     * Exists:', !!window.positionsPortfolioState.positionsData, { page: "positions-portfolio" });
        window.Logger.debug('     * Is Array:', Array.isArray(window.positionsPortfolioState.positionsData), { page: "positions-portfolio" });
        window.Logger.debug('     * Length:', window.positionsPortfolioState.positionsData?.length || 0, { page: "positions-portfolio" });
        window.Logger.debug('   - positionsPageData (last slice):', window.positionsPortfolioState.positionsPageData, { page: "positions-portfolio" });
        window.Logger.debug('     * Length:', window.positionsPortfolioState.positionsPageData?.length || 0, { page: "positions-portfolio" });
            window.Logger.debug('   - portfolioData:', window.positionsPortfolioState.portfolioData, { page: "positions-portfolio" });
            window.Logger.debug('     * Exists:', !!window.positionsPortfolioState.portfolioData, { page: "positions-portfolio" });
        window.Logger.debug('     * Positions (full):', window.positionsPortfolioState.portfolioData?.positions, { page: "positions-portfolio" });
        window.Logger.debug('       - Length:', window.positionsPortfolioState.portfolioData?.positions?.length || 0, { page: "positions-portfolio" });
        window.Logger.debug('   - portfolioPagePositions (last slice):', window.positionsPortfolioState.portfolioPagePositions, { page: "positions-portfolio" });
        window.Logger.debug('       - Length:', window.positionsPortfolioState.portfolioPagePositions?.length || 0, { page: "positions-portfolio" });
        }
    }
    
    // Check functions
    if (window.Logger) {
        window.Logger.debug('2. Functions:', { page: "positions-portfolio" });
        window.Logger.debug('   - initPositionsPortfolio:', typeof window.initPositionsPortfolio, { page: "positions-portfolio" });
        window.Logger.debug('   - updatePositionsTable:', typeof window.updatePositionsTable, { page: "positions-portfolio" });
        window.Logger.debug('   - updatePortfolioTable:', typeof window.updatePortfolioTable, { page: "positions-portfolio" });
        window.Logger.debug('   - sortTable:', typeof window.sortTable, { page: "positions-portfolio" });
        window.Logger.debug('   - sortTableData:', typeof window.sortTableData, { page: "positions-portfolio" });
    }
    
    // Check DOM elements
    if (window.Logger) {
        window.Logger.debug('3. DOM Elements:', { page: "positions-portfolio" });
    }
    const positionsTable = document.querySelector('#positionsTable');
    const portfolioTable = document.querySelector('#portfolioTable');
    const positionsSelector = document.getElementById('positionsAccountSelector');
    if (window.Logger) {
        window.Logger.debug('   - #positionsTable:', !!positionsTable, { page: "positions-portfolio" });
        window.Logger.debug('   - #portfolioTable:', !!portfolioTable, { page: "positions-portfolio" });
        window.Logger.debug('   - #positionsAccountSelector:', !!positionsSelector, { page: "positions-portfolio" });
        if (positionsSelector) {
            window.Logger.debug('     * Selected value:', positionsSelector.value, { page: "positions-portfolio" });
        }
    }
    
    // Check table data attributes
    if (positionsTable && window.Logger) {
        window.Logger.debug('   - positionsTable data-table-type:', positionsTable.getAttribute('data-table-type'), { page: "positions-portfolio" });
    }
    if (portfolioTable && window.Logger) {
        window.Logger.debug('   - portfolioTable data-table-type:', portfolioTable.getAttribute('data-table-type'), { page: "positions-portfolio" });
    }
    
    // Check sortable headers
    const sortableHeaders = document.querySelectorAll('#positionsTable .sortable-header, #portfolioTable .sortable-header');
    if (window.Logger) {
        window.Logger.debug('   - Sortable headers count:', sortableHeaders.length, { page: "positions-portfolio" });
    }
    
    // Check if data was loaded
    if (window.Logger) {
        window.Logger.debug('4. Data Loading:', { page: "positions-portfolio" });
        window.Logger.debug('   - UnifiedCacheManager:', typeof window.UnifiedCacheManager, { page: "positions-portfolio" });
        if (window.UnifiedCacheManager) {
            window.Logger.debug('   - Cache available: ✅', { page: "positions-portfolio" });
        } else {
            window.Logger.debug('   - Cache available: ❌', { page: "positions-portfolio" });
        }
    }
    
    // Try to simulate sort
    if (window.Logger) {
        window.Logger.debug('5. Sort Test:', { page: "positions-portfolio" });
    }
    if (window.positionsPortfolioState?.positionsData && window.positionsPortfolioState.positionsData.length > 0) {
        if (window.Logger) {
            window.Logger.debug('   - Attempting to sort positions table...', { page: "positions-portfolio" });
        }
        try {
            if (typeof window.sortTable === 'function') {
                const result = window.sortTable('positions', 0);
                if (window.Logger) {
                    window.Logger.debug('   - Sort result:', result, { page: "positions-portfolio" });
                    window.Logger.debug('   - Sort successful: ✅', { page: "positions-portfolio" });
                }
            } else {
                if (window.Logger) {
                    window.Logger.debug('   - window.sortTable not available: ❌', { page: "positions-portfolio" });
                }
            }
        } catch (error) {
            console.error('   - Sort error:', error);
        }
    } else {
        if (window.Logger) {
            window.Logger.debug('   - No data to sort (positionsData is empty or missing)', { page: "positions-portfolio" });
        }
    }
    
    if (window.Logger) {
        window.Logger.debug('🔍 ===== END DEBUG =====', { page: "positions-portfolio" });
    }
    
    return {
        state: window.positionsPortfolioState,
        functions: {
            initPositionsPortfolio: typeof window.initPositionsPortfolio,
            updatePositionsTable: typeof window.updatePositionsTable,
            updatePortfolioTable: typeof window.updatePortfolioTable,
            sortTable: typeof window.sortTable,
            sortTableData: typeof window.sortTableData
        },
        data: {
            positionsCount: window.positionsPortfolioState?.positionsData?.length || 0,
            portfolioCount: window.positionsPortfolioState?.portfolioData?.positions?.length || 0
        }
    };
};

window.Logger.info('✅ Positions & Portfolio System loaded', { page: "trading_accounts" });
