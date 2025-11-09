/**
 * Account Activity System - TikTrack
 * ===================================
 * 
 * מערכת הצגת תנועות חשבון (תזרימי מזומנים + ביצועים)
 * 
 * תכונות:
 * - הצגת תנועות חשבון לפי מטבע
 * - חישוב יתרות בזמן אמת
 * - תמיכה במטבעות מרובים
 * - אינטגרציה עם EntityDetailsModal
 * - אינטגרציה עם מערכת המטמון
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Date: November 2025
 */

/* ===== ACCOUNT ACTIVITY SYSTEM ===== */
window.Logger.info('📁 account-activity.js נטען', { page: "trading_accounts" });

// Global state
window.accountActivityState = {
    selectedAccountId: null,
    activityData: null,
    isLoading: false
};

/**
 * Initialize account activity system
 */
window.initAccountActivity = function(autoSelectDefault = false) {
    window.Logger.info('🔧 אתחול מערכת תנועות חשבון', { page: "trading_accounts" });
    
    // Populate account selector when accounts are loaded
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        populateAccountSelector(autoSelectDefault);
    }
    
    // Setup event listeners
    const selector = document.getElementById('accountActivitySelector');
    if (selector) {
        selector.addEventListener('change', handleAccountSelection);
    }
    
    // Listen for account data updates
    if (window.addEventListener) {
        window.addEventListener('accountsLoaded', async () => {
            // On accounts loaded event, auto-select default account from preferences
            await populateAccountSelector(true);
        });
    }
};

/**
 * Populate account selector dropdown
 * @param {boolean} autoSelectDefault - If true, automatically select default account from preferences after populating
 */
async function populateAccountSelector(autoSelectDefault = false) {
    const selector = document.getElementById('accountActivitySelector');
    if (!selector) return;
    
    // Clear existing options (except first)
    while (selector.options.length > 1) {
        selector.remove(1);
    }
    
    // Add accounts
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        window.trading_accountsData.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name || `חשבון ${account.id}`;
            selector.appendChild(option);
        });
    }
    
    window.Logger.info(`✅ Account selector populated with ${selector.options.length - 1} accounts`, { page: "trading_accounts" });
    
    // Auto-select default account from preferences if requested and no account is currently selected
    if (autoSelectDefault && selector.options.length > 1) {
        const currentValue = selector.value;
        if (!currentValue || currentValue === '') {
            try {
                // Get default account from preferences
                let defaultAccountId = null;
                
                if (typeof window.getPreference === 'function') {
                    const prefValue = await window.getPreference('default_trading_account');
                    
                    if (prefValue) {
                        // Try to parse as integer ID first
                        const parsed = parseInt(prefValue);
                        if (!isNaN(parsed)) {
                            defaultAccountId = parsed;
                        } else {
                            // Try to find account by name
                            const account = window.trading_accountsData.find(acc => acc.name === prefValue);
                            if (account) {
                                defaultAccountId = account.id;
                            }
                        }
                    }
                }
                
                // If no preference found or invalid, fallback to first account
                if (!defaultAccountId || !selector.querySelector(`option[value="${defaultAccountId}"]`)) {
                    defaultAccountId = selector.options[1].value;
                    window.Logger.info(`ℹ️ No valid default account in preferences, using first account (ID: ${defaultAccountId})`, { page: "trading_accounts" });
                } else {
                    window.Logger.info(`🔄 Auto-selecting default account from preferences (ID: ${defaultAccountId})`, { page: "trading_accounts" });
                }
                
                // Select the account
                selector.value = defaultAccountId;
                
                // Trigger selection change to load activity data
                handleAccountSelection({ target: selector });
            } catch (error) {
                window.Logger.error('❌ Error getting default account from preferences:', error, { page: "trading_accounts" });
                // Fallback to first account
                const firstAccountId = selector.options[1].value;
                selector.value = firstAccountId;
                handleAccountSelection({ target: selector });
            }
        } else {
            window.Logger.info(`ℹ️ Account already selected (ID: ${currentValue}), skipping auto-selection`, { page: "trading_accounts" });
        }
    }
}

/**
 * Handle account selection change
 */
async function handleAccountSelection(event) {
    const accountId = parseInt(event.target.value);
    
    if (!accountId || isNaN(accountId)) {
        clearActivityTable();
        return;
    }
    
    window.accountActivityState.selectedAccountId = accountId;
    
    // Show section bodies
    const summaryBody = document.querySelector('[data-section="account-activity-summary"] .section-body');
    if (summaryBody) {
        summaryBody.style.display = 'block';
        setTimeout(() => {
            setupStatisticsFilterHook();
        }, 500);
    }
    const tableBody = document.querySelector('[data-section="account-activity-table"] .section-body');
    if (tableBody) {
        tableBody.style.display = 'block';
    }
    
    // Load activity data
    await loadAccountActivity(accountId);
}

/**
 * Load account activity data from API
 */
async function loadAccountActivity(accountId) {
    if (window.accountActivityState.isLoading) {
        window.Logger.warn('⚠️ Account activity already loading', { page: "trading_accounts" });
        return;
    }
    
    window.accountActivityState.isLoading = true;
    
    try {
        window.Logger.info(`📡 טעינת תנועות חשבון ${accountId}`, { page: "trading_accounts" });
        
        // Check cache first - BUT bypass cache to ensure fresh data with executions
        const cacheKey = `account-activity-${accountId}`;
        // TEMPORARY: Bypass cache to ensure executions are loaded
        // TODO: Remove this after confirming executions are loaded correctly
        const BYPASS_CACHE = true;
        
        if (window.UnifiedCacheManager && !BYPASS_CACHE) {
            const cached = await window.UnifiedCacheManager.get(cacheKey);
            if (cached) {
                window.Logger.info('✅ נתונים מהמטמון', { page: "trading_accounts" });
                window.accountActivityState.activityData = cached;
                populateAccountActivityTable(cached);
                updateActivitySummary(cached);
                window.accountActivityState.isLoading = false;
                return;
            }
        } else if (BYPASS_CACHE) {
            window.Logger.info('🔄 Bypassing cache - loading fresh data from API', { page: "trading_accounts" });
            // Clear cache for this account to ensure fresh data
            if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
                await window.UnifiedCacheManager.remove(cacheKey);
            }
        }
        
        // Fetch from API
        const response = await fetch(`/api/account-activity/${accountId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
            window.accountActivityState.activityData = result.data;
            
            // Detailed debugging of received data
            window.Logger.info(`🔍 DEBUG: Raw API response structure:`, { page: "trading_accounts" });
            window.Logger.info(`  - Has data: ${!!result.data}`, { page: "trading_accounts" });
            window.Logger.info(`  - Has currencies: ${!!result.data?.currencies}`, { page: "trading_accounts" });
            window.Logger.info(`  - Currencies count: ${result.data?.currencies?.length || 0}`, { page: "trading_accounts" });
            
            if (result.data?.currencies) {
                result.data.currencies.forEach((currency, idx) => {
                    window.Logger.info(`  Currency ${idx}: ${currency.currency_symbol}, movements count: ${currency.movements?.length || 0}`, { page: "trading_accounts" });
                    if (currency.movements && currency.movements.length > 0) {
                        const types = currency.movements.map(m => m.type || 'unknown');
                        window.Logger.info(`    Movement types: ${types.join(', ')}`, { page: "trading_accounts" });
                        currency.movements.forEach((mov, movIdx) => {
                            if (mov.type === 'execution') {
                                window.Logger.info(`    ✅ Execution ${movIdx}: id=${mov.id}, action=${mov.action || mov.sub_type || mov.subtype}, ticker_id=${mov.ticker_id}, ticker_symbol=${mov.ticker_symbol}, amount=${mov.amount}`, { page: "trading_accounts" });
                            }
                        });
                    } else {
                        window.Logger.warn(`    ⚠️ No movements for currency ${currency.currency_symbol}`, { page: "trading_accounts" });
                    }
                });
            }
            
            // Debug: Log received data structure
            const totalMovements = result.data.currencies?.reduce((sum, curr) => sum + (curr.movements?.length || 0), 0) || 0;
            const cashFlowCount = result.data.currencies?.reduce((sum, curr) => {
                return sum + (curr.movements?.filter(m => m.type === 'cash_flow').length || 0);
            }, 0) || 0;
            const executionCount = result.data.currencies?.reduce((sum, curr) => {
                return sum + (curr.movements?.filter(m => m.type === 'execution').length || 0);
            }, 0) || 0;
            
            window.Logger.info(`📥 Received from API: ${totalMovements} total movements (${cashFlowCount} cash flows, ${executionCount} executions)`, { page: "trading_accounts" });
            
            // Log first few movements by type
            result.data.currencies?.forEach(currency => {
                const execs = currency.movements?.filter(m => m.type === 'execution') || [];
                const cfs = currency.movements?.filter(m => m.type === 'cash_flow') || [];
                window.Logger.info(`  Currency ${currency.currency_symbol}: ${currency.movements?.length || 0} total movements (${cfs.length} cash flows, ${execs.length} executions)`, { page: "trading_accounts" });
                if (execs.length > 0) {
                    execs.slice(0, 3).forEach(ex => {
                        window.Logger.info(`    ✅ Execution ${ex.id}: ${ex.ticker_symbol || 'No ticker'}, action=${ex.sub_type || ex.action || ex.subtype || 'unknown'}, amount=${ex.amount}`, { page: "trading_accounts" });
                    });
                } else {
                    window.Logger.warn(`    ⚠️ No executions found for currency ${currency.currency_symbol}`, { page: "trading_accounts" });
                }
            });
            
            if (executionCount === 0 && totalMovements > 0) {
                window.Logger.error(`❌ PROBLEM: Received ${totalMovements} movements but 0 executions! All movements are cash flows.`, { page: "trading_accounts" });
                window.Logger.error(`   This means executions are not being returned from the backend API.`, { page: "trading_accounts" });
            }
            
            // Cache the data
            if (window.UnifiedCacheManager) {
                await window.UnifiedCacheManager.save(cacheKey, result.data, {
                    ttl: 60000 // 1 minute
                });
            }
            
            populateAccountActivityTable(result.data);
            updateActivitySummary(result.data);
        } else {
            throw new Error(result.error?.message || 'Failed to load account activity');
        }
        
    } catch (error) {
        window.Logger.error('❌ שגיאה בטעינת תנועות חשבון:', error, { page: "trading_accounts" });
        
        if (window.showNotification) {
            window.showNotification('שגיאה בטעינת תנועות חשבון: ' + error.message, 'error');
        }
        
        showErrorInTable('שגיאה בטעינת נתונים');
    } finally {
        window.accountActivityState.isLoading = false;
    }
}

/**
 * Populate account activity table
 */
function populateAccountActivityTable(data) {
    const tbody = document.querySelector('#accountActivityTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!data.currencies || data.currencies.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">אין תנועות לחשבון זה</td></tr>';
        return;
    }
    
    // Calculate running balances per currency
    const runningBalances = {};
    
    // Sort all movements chronologically (newest first, then calculate balances oldest to newest)
    const allMovements = [];
    let cashFlowCount = 0;
    let executionCount = 0;
    
    data.currencies.forEach(currency => {
        currency.movements.forEach(movement => {
            allMovements.push({
                ...movement,
                currency_id: currency.currency_id,
                currency_symbol: currency.currency_symbol
            });
            
            // Count movements by type
            if (movement.type === 'cash_flow') {
                cashFlowCount++;
            } else if (movement.type === 'execution') {
                executionCount++;
            }
        });
        runningBalances[currency.currency_id] = currency.balance || 0;
    });
    
    window.Logger.info(`📊 Total movements: ${allMovements.length} (${cashFlowCount} cash flows, ${executionCount} executions)`, { page: "trading_accounts" });
    
    // Sort by date (oldest first for balance calculation)
    allMovements.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
    });
    
    // Calculate running balances (starting from balance and working backwards)
    // IMPORTANT: Use normalized amounts (each subtype has clear direction)
    const balancesByMovement = {};
    for (let i = allMovements.length - 1; i >= 0; i--) {
        const movement = allMovements[i];
        balancesByMovement[movement.id] = runningBalances[movement.currency_id];
        
        // Use normalized amount for balance calculation (each subtype has clear direction)
        const normalizedAmount = normalizeAmountBySubtype(
            movement.amount || '0',
            movement.type || '',
            movement.sub_type || movement.subtype || movement.action || ''
        );
        runningBalances[movement.currency_id] -= normalizedAmount;
    }
    
    // Now sort newest first for display
    allMovements.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });
    
    // Store processed movements for statistics calculation
    window.accountActivityState.processedMovements = allMovements;
    
    // Render rows
    allMovements.forEach(movement => {
        const row = renderMovementRow(movement, balancesByMovement[movement.id]);
        tbody.appendChild(row);
    });
    
    // Update footer with currency balances
    updateCurrencyBalancesFooter(data);
    
    // Update statistics card
    updateActivityStatistics();
    
    window.Logger.info(`✅ טבלה עודכנה עם ${allMovements.length} תנועות`, { page: "trading_accounts" });
}

/**
 * Render a single movement row using FieldRendererService
 */
function renderMovementRow(movement, runningBalance) {
    const row = document.createElement('tr');
    
    // Store movement data as data attributes on row for statistics calculation
    row.setAttribute('data-movement-type', movement.type || '');
    row.setAttribute('data-movement-subtype', movement.sub_type || movement.subtype || movement.action || '');
    
    // Normalize amount based on subtype rules (each subtype has clear direction)
    const amountForStats = normalizeAmountBySubtype(
        movement.amount || '0',
        movement.type || '',
        movement.sub_type || movement.subtype || movement.action || ''
    );
    row.setAttribute('data-movement-amount', amountForStats.toString());
    
    row.setAttribute('data-movement-date', movement.date || '');
    row.setAttribute('data-movement-id', movement.id || '');
    row.setAttribute('data-currency-symbol', movement.currency_symbol || 'USD');
    
    // Date - using FieldRendererService.renderDate
    const dateCell = document.createElement('td');
    dateCell.className = 'col-date';
    dateCell.setAttribute('data-date', movement.date || '');
    if (window.FieldRendererService && window.FieldRendererService.renderDate) {
        dateCell.innerHTML = window.FieldRendererService.renderDate(movement.date);
    } else {
        dateCell.textContent = movement.date ? formatDate(movement.date) : '-';
    }
    row.appendChild(dateCell);
    
    // Type
    const typeCell = document.createElement('td');
    typeCell.className = 'col-type';
    // שמירת סוג באנגלית לפילטר
    typeCell.setAttribute('data-type', movement.type || '');
    const rawSubtype = movement.sub_type || movement.subtype || movement.action || '';
    const subtypeKey = (rawSubtype || '').toLowerCase();
    const isOpeningBalance = (movement.type === 'cash_flow' && subtypeKey === 'opening_balance');
    if (isOpeningBalance) {
        typeCell.textContent = 'מערכת';
    } else if (movement.type === 'cash_flow') {
        typeCell.textContent = 'תזרים מזומנים';
    } else if (movement.type === 'execution') {
        typeCell.textContent = 'ביצוע';
    } else {
        typeCell.textContent = movement.type || '-';
    }
    row.appendChild(typeCell);
    
    // Sub-type - using FieldRendererService.renderType for cash flows or renderAction for executions
    const subtypeCell = document.createElement('td');
    subtypeCell.className = 'col-subtype';
    // שמירת תת-סוג באנגלית לפילטר (יכול להיות רלוונטי לפילטר סוג)
    const subTypeValue = rawSubtype;
    subtypeCell.setAttribute('data-type', subTypeValue);
    const normalizedAmountForColor = normalizeAmountBySubtype(
        movement.amount || '0',
        movement.type || '',
        subTypeValue
    );
    if (movement.type === 'cash_flow') {
        // Use renderType for cash flow subtypes (deposit, withdrawal, fee, etc.)
        if (window.FieldRendererService && window.FieldRendererService.renderType) {
            subtypeCell.innerHTML = window.FieldRendererService.renderType(subTypeValue, normalizedAmountForColor);
        } else {
            subtypeCell.textContent = getSubtypeDisplay(movement.sub_type || movement.subtype);
        }
    } else {
        // Use renderAction for execution actions (buy/sell) - with amount for color
        if (window.FieldRendererService && window.FieldRendererService.renderAction) {
            subtypeCell.innerHTML = window.FieldRendererService.renderAction(
                movement.sub_type || movement.subtype || movement.action,
                movement.amount // Pass amount for color determination
            );
        } else {
            subtypeCell.textContent = getSubtypeDisplay(movement.sub_type || movement.subtype || movement.action);
        }
    }
    row.appendChild(subtypeCell);
    
    // Ticker - show only symbol for executions, '-' for cash flows
    const tickerCell = document.createElement('td');
    tickerCell.className = 'col-ticker';
    
    if (movement.type === 'execution' && movement.ticker_symbol) {
        // Show only the ticker symbol (clickable link to details)
        const symbol = movement.ticker_symbol.trim();
        if (symbol && window.showEntityDetails && movement.ticker_id) {
            tickerCell.innerHTML = `<span style="cursor: pointer; color: var(--primary-color, #26baac); text-decoration: underline;" onclick="if (window.showEntityDetails) { window.showEntityDetails('ticker', ${movement.ticker_id}); return false; }" title="לחץ לצפייה בפרטי הטיקר">${symbol}</span>`;
        } else {
            tickerCell.textContent = symbol;
        }
    } else {
        // Cash flow - no ticker
        tickerCell.textContent = '-';
    }
    row.appendChild(tickerCell);
    
    // Amount - using FieldRendererService.renderAmount
    const amountCell = document.createElement('td');
    amountCell.className = 'col-amount';
    // Convert currency code to symbol (USD -> $, ILS -> ₪, etc.)
    let currencySymbol = movement.currency_symbol || 'USD';
    if (currencySymbol && currencySymbol.length > 1) {
      switch (currencySymbol.toUpperCase()) {
        case 'USD': currencySymbol = '$'; break;
        case 'ILS': currencySymbol = '₪'; break;
        case 'EUR': currencySymbol = '€'; break;
        case 'GBP': currencySymbol = '£'; break;
        case 'JPY': currencySymbol = '¥'; break;
        default: currencySymbol = currencySymbol; // If already a symbol, keep as is
      }
    }
    // Normalize amount for display based on subtype rules (each subtype has clear direction)
    const displayAmount = normalizedAmountForColor;
    
    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        amountCell.innerHTML = window.FieldRendererService.renderAmount(displayAmount, currencySymbol, 0);
    } else {
        amountCell.textContent = formatAmount(displayAmount);
        if (displayAmount < 0) {
            amountCell.classList.add('text-danger');
        } else {
            amountCell.classList.add('text-success');
        }
    }
    row.appendChild(amountCell);
    
    // Currency - always show symbol only
    const currencyCell = document.createElement('td');
    currencyCell.className = 'col-currency';
    currencyCell.textContent = currencySymbol;
    row.appendChild(currencyCell);
    
    // Running balance - using FieldRendererService.renderAmount
    const balanceCell = document.createElement('td');
    balanceCell.className = 'col-balance';
    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        balanceCell.innerHTML = window.FieldRendererService.renderAmount(runningBalance || 0, currencySymbol, 0);
    } else {
        balanceCell.textContent = formatAmount(runningBalance || 0);
        balanceCell.textContent += ' ' + currencySymbol;
    }
    row.appendChild(balanceCell);
    
    // Actions - simple details button (square button: width equals height)
    const actionsCell = document.createElement('td');
    actionsCell.className = 'col-actions actions-cell';
    if (isOpeningBalance) {
        actionsCell.innerHTML = `<span class="text-muted">-</span>`;
    } else {
        actionsCell.innerHTML = `
        <button class="btn btn-sm" onclick="openMovementDetails(${movement.id}, '${movement.type}')" title="פרטים" style="width: 2.5em; height: 2.5em; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
            👁️
        </button>
    `;
    }
    row.appendChild(actionsCell);
    
    return row;
}

/**
 * Update activity summary
 */
function updateActivitySummary(data) {
    // Always update date range in title first (works even if data is null)
    const tableTitleDateRange = document.getElementById('accountActivityDateRange');
    const summaryDateRange = document.getElementById('accountActivitySelectedRange');
    if (tableTitleDateRange || summaryDateRange) {
        const dateRange = window.selectedDateRangeForFilter || 'כל זמן';
        let startDate = null;
        let endDate = new Date(); // Today
        
        // Get account opening date for "כל זמן" case
        let accountOpeningDate = null;
        if (window.accountActivityState && window.accountActivityState.selectedAccountId && window.trading_accountsData) {
            const account = window.trading_accountsData.find(acc => acc.id === window.accountActivityState.selectedAccountId);
            if (account && account.created_at) {
                accountOpeningDate = new Date(account.created_at);
            }
        }
        
        if (dateRange !== 'כל זמן' && typeof window.translateDateRangeToDates === 'function') {
            const range = window.translateDateRangeToDates(dateRange);
            if (range) {
                startDate = range.startDate ? new Date(range.startDate) : null;
                endDate = range.endDate ? new Date(range.endDate) : new Date();
            }
        } else if (dateRange === 'כל זמן' && accountOpeningDate) {
            startDate = accountOpeningDate;
        }
        
        // Format date range for title
        let dateRangeDisplay = '';
        if (startDate && endDate) {
            const startDateFormatted = typeof window.formatDate === 'function' 
                ? window.formatDate(startDate) 
                : startDate.toLocaleDateString('he-IL', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                });
            const endDateFormatted = typeof window.formatDate === 'function' 
                ? window.formatDate(endDate) 
                : endDate.toLocaleDateString('he-IL', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                }) === new Date().toLocaleDateString('he-IL', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit' 
                })
                    ? 'היום'
                    : typeof window.formatDate === 'function' 
                        ? window.formatDate(endDate) 
                        : endDate.toLocaleDateString('he-IL', { 
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit' 
                        });
            
            dateRangeDisplay = `${startDateFormatted} - ${endDateFormatted}`;
        } else if (dateRange !== 'כל זמן') {
            dateRangeDisplay = dateRange;
        } else {
            dateRangeDisplay = 'כל הזמנים';
        }
        
        if (tableTitleDateRange) {
            tableTitleDateRange.textContent = dateRangeDisplay;
        }

        if (summaryDateRange) {
            summaryDateRange.textContent = dateRangeDisplay;
        }
    }
    
    // Update table count (always update, even if no data - show 0)
    const tableCount = document.getElementById('accountActivityCount');
    
    if (tableCount) {
        // Get count and currencies (default to 0 if no data)
        const count = (data && data.currencies) 
            ? data.currencies.reduce((sum, curr) => sum + (curr.movements?.length || 0), 0)
            : 0;
        const currencies = (data && data.currencies) ? data.currencies.length : 0;
        
        // Get date range information (always calculate, even if no data)
        let dateRangeText = '';
        const dateRange = window.selectedDateRangeForFilter || 'כל זמן';
        let startDate = null;
        let endDate = new Date(); // Today
        
        // Get account opening date for "כל זמן" case
        let accountOpeningDate = null;
        if (window.accountActivityState && window.accountActivityState.selectedAccountId && window.trading_accountsData) {
            const account = window.trading_accountsData.find(acc => acc.id === window.accountActivityState.selectedAccountId);
            if (account && account.created_at) {
                accountOpeningDate = new Date(account.created_at);
            }
        }
        
        if (dateRange !== 'כל זמן' && typeof window.translateDateRangeToDates === 'function') {
            const range = window.translateDateRangeToDates(dateRange);
            if (range) {
                startDate = range.startDate ? new Date(range.startDate) : null;
                endDate = range.endDate ? new Date(range.endDate) : new Date();
            }
        } else if (dateRange === 'כל זמן' && accountOpeningDate) {
            startDate = accountOpeningDate;
        }
        
        // Format dates and calculate days
        if (startDate && endDate) {
            const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const startDateFormatted = typeof window.formatDate === 'function' 
                ? window.formatDate(startDate) 
                : startDate.toLocaleDateString('he-IL');
            const endDateFormatted = typeof window.formatDate === 'function' 
                ? window.formatDate(endDate) 
                : endDate.toLocaleDateString('he-IL');
            
            dateRangeText = ` | ${startDateFormatted} - ${endDateFormatted} (${daysDiff} ימים)`;
        } else if (dateRange !== 'כל זמן') {
            // Fallback: show the date range text if dates couldn't be calculated
            dateRangeText = ` | ${dateRange}`;
        }
        
        tableCount.textContent = `${count} תנועות ב-${currencies} מטבעות${dateRangeText}`;
    }
}

/**
 * Update currency balances footer using FieldRendererService
 */
function updateCurrencyBalancesFooter(data) {
    const footer = document.getElementById('accountActivityFooter');
    const summaryCell = document.getElementById('currencyBalancesSummary');
    const baseTotalCell = document.getElementById('baseCurrencyTotal');
    
    if (!footer || !summaryCell || !baseTotalCell) return;
    
    // Helper function to convert currency code to symbol
    const getCurrencySymbol = (currencyCode) => {
        if (!currencyCode || currencyCode.length <= 1) return currencyCode || '$';
        switch (currencyCode.toUpperCase()) {
            case 'USD': return '$';
            case 'ILS': return '₪';
            case 'EUR': return '€';
            case 'GBP': return '£';
            case 'JPY': return '¥';
            default: return currencyCode; // If already a symbol, return as is
        }
    };
    
    // Build currency balances summary using FieldRendererService
    let summaryHTML = '';
    data.currencies.forEach(currency => {
        const symbol = getCurrencySymbol(currency.currency_symbol || 'USD');
        const balance = currency.balance || 0;
        if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
            summaryHTML += `<div><strong>${symbol}:</strong> ${window.FieldRendererService.renderAmount(balance, symbol, 0)}</div>`;
        } else {
            summaryHTML += `<div><strong>${symbol}:</strong> ${formatAmount(balance)}</div>`;
        }
    });
    summaryCell.innerHTML = summaryHTML;
    
    // Base currency total using FieldRendererService
    const baseSymbol = getCurrencySymbol(data.base_currency || 'USD');
    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        baseTotalCell.innerHTML = `<strong>${window.FieldRendererService.renderAmount(data.base_currency_total || 0, baseSymbol, 0)}</strong>`;
    } else {
        baseTotalCell.innerHTML = `<strong>${formatAmount(data.base_currency_total || 0)} ${baseSymbol}</strong>`;
    }
    
    // Show rates used if available
    if (data.exchange_rates_used && Object.keys(data.exchange_rates_used).length > 0) {
        let ratesText = ' (שערים: ';
        ratesText += Object.entries(data.exchange_rates_used)
            .map(([curr, rate]) => `${curr}=${rate}`)
            .join(', ');
        ratesText += ')';
        baseTotalCell.innerHTML += ratesText;
    }
    
    footer.style.display = 'table-row-group';
}

/**
 * Open movement details in EntityDetailsModal
 */
function openMovementDetails(movementId, movementType) {
    if (!movementId || (typeof movementId === 'string' && movementId.startsWith('opening-balance'))) {
        window.Logger.debug('Skipping details for opening balance movement', { movementId, movementType, page: "trading_accounts" });
        return;
    }
    if (!window.EntityDetailsModal) {
        window.Logger.warn('⚠️ EntityDetailsModal not available', { page: "trading_accounts" });
        if (window.showNotification) {
            window.showNotification('מערכת פרטי ישויות לא זמינה', 'warning');
        }
        return;
    }
    
    // Map movement type to entity type
    const entityType = movementType === 'cash_flow' ? 'cash_flow' : 'execution';
    
    window.Logger.info(`🔍 פתיחת פרטי ${entityType} ${movementId}`, { page: "trading_accounts" });
    
    window.EntityDetailsModal.show(entityType, movementId);
}

/**
 * Clear activity table
 */
function clearActivityTable() {
    const tbody = document.querySelector('#accountActivityTable tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">בחר חשבון מסחר להצגת תנועות...</td></tr>';
    }
    
    const footer = document.getElementById('accountActivityFooter');
    if (footer) {
        footer.style.display = 'none';
    }
    
    const tableCount = document.getElementById('accountActivityCount');
    if (tableCount) {
        tableCount.textContent = 'בחר חשבון מסחר...';
    }
}

/**
 * Show error in table
 */
function showErrorInTable(message) {
    const tbody = document.querySelector('#accountActivityTable tbody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">${message}</td></tr>`;
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Format amount for display
 */
function formatAmount(amount) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    return amount.toLocaleString('he-IL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Get subtype display text
 */
function getSubtypeDisplay(subtype) {
    const translations = {
        // Cash flow subtypes
        'deposit': 'הפקדה',
        'withdrawal': 'משיכה',
        'deposits_withdrawals': 'הפקדה ומשיכה',
        'fee': 'עמלה',
        'dividend': 'דיבידנד',
        'interest': 'ריבית',
        'transfer_in': 'העברה פנימה',
        'transfer_out': 'העברה החוצה',
        'other_positive': 'אחר חיובי',
        'other_negative': 'אחר שלילי',
        'opening_balance': 'יתרת פתיחה',
        // Execution subtypes
        'buy': 'קנייה',
        'sell': 'מכירה',
        'sale': 'מכירה'
    };
    
    return translations[subtype] || subtype || '-';
}

/**
 * Normalize amount based on subtype rules
 * Each subtype has a clear direction (always positive or always negative)
 * @param {number} amount - Original amount
 * @param {string} type - Movement type ('cash_flow' or 'execution')
 * @param {string} subtype - Subtype value
 * @returns {number} Normalized amount with correct sign
 */
function normalizeAmountBySubtype(amount, type, subtype) {
    const amountNum = parseFloat(amount || '0');
    const subTypeValue = (subtype || '').toLowerCase();
    
    // Cash flow subtypes - clear direction for each
    if (type === 'cash_flow') {
        // Always positive or neutral (if 0)
        // Deposit: always positive (money coming in), neutral if 0
        if (subTypeValue === 'deposit' || subTypeValue === 'הפקדה') {
            return amountNum === 0 ? 0 : Math.abs(amountNum);
        }
        
        if (subTypeValue === 'opening_balance' || subTypeValue === 'יתרת פתיחה') {
            return amountNum === 0 ? 0 : Math.abs(amountNum);
        }
        
        // Always negative or neutral (if 0)
        // Withdrawal: always negative (money going out), neutral if 0
        if (subTypeValue === 'withdrawal' || subTypeValue === 'משיכה') {
            return amountNum === 0 ? 0 : -Math.abs(amountNum);
        }
        
        // Always positive (money coming in)
        if (subTypeValue === 'dividend' || subTypeValue === 'דיבידנד' ||
            subTypeValue === 'transfer_in' || subTypeValue === 'העברה פנימה' ||
            subTypeValue === 'other_positive' || subTypeValue === 'אחר חיובי') {
            return Math.abs(amountNum);
        }
        
        // Always negative (money going out)
        if (subTypeValue === 'fee' || subTypeValue === 'עמלה' ||
            subTypeValue === 'transfer_out' || subTypeValue === 'העברה החוצה' ||
            subTypeValue === 'other_negative' || subTypeValue === 'אחר שלילי') {
            return -Math.abs(amountNum);
        }
        
        // Interest can be positive or negative - keep original sign
        if (subTypeValue === 'interest' || subTypeValue === 'ריבית') {
            return amountNum; // Keep original sign (can be positive or negative)
        }
        
        // 'other' - keep original sign
        if (subTypeValue === 'other' || subTypeValue === 'אחר') {
            return amountNum; // Keep original sign
        }
        
        // Default for other cash flow subtypes - keep original sign
        return amountNum;
    }
    
    // Execution subtypes - clear direction for each
    if (type === 'execution') {
        // Buy - always negative (money going out)
        if (subTypeValue === 'buy' || subTypeValue === 'קנייה') {
            return -Math.abs(amountNum);
        }
        
        // Sell/Sale - always positive (money coming in)
        if (subTypeValue === 'sell' || subTypeValue === 'sale' || 
            subTypeValue === 'מכירה') {
            return Math.abs(amountNum);
        }
        
        // Default - keep original sign
        return amountNum;
    }
    
    // Default - keep original sign
    return amountNum;
}

/**
 * Calculate activity statistics from visible rows
 * @returns {Object} Statistics object with cash flows and executions data
 */
function calculateActivityStatistics() {
    const tbody = document.querySelector('#accountActivityTable tbody');
    if (!tbody) {
        return { cashFlows: {}, executions: {} };
    }
    
    // Get all visible rows (not loading, not empty, not hidden by filter)
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => {
        // Exclude loading/empty rows
        if (row.classList.contains('loading') || 
            row.querySelector('td.loading') ||
            row.style.display === 'none' ||
            row.getAttribute('style')?.includes('display: none')) {
            return false;
        }
        // Must have movement data
        return row.getAttribute('data-movement-type');
    });
    
    if (rows.length === 0) {
        return { cashFlows: {}, executions: {} };
    }
    
    // Get filter date range
    const dateRange = window.selectedDateRangeForFilter || 'כל זמן';
    let startDate = null;
    let endDate = new Date(); // Today
    
    // Get account opening date for "כל זמן" case
    let accountOpeningDate = null;
    if (window.accountActivityState.selectedAccountId && window.trading_accountsData) {
        const account = window.trading_accountsData.find(acc => acc.id === window.accountActivityState.selectedAccountId);
        if (account && account.created_at) {
            accountOpeningDate = new Date(account.created_at);
        }
    }
    
    if (dateRange !== 'כל זמן' && typeof window.translateDateRangeToDates === 'function') {
        const range = window.translateDateRangeToDates(dateRange);
        if (range) {
            startDate = range.startDate ? new Date(range.startDate) : null;
            endDate = range.endDate ? new Date(range.endDate) : new Date();
        }
    }
    
    // If "כל זמן", use account opening date to today
    if (dateRange === 'כל זמן' && accountOpeningDate) {
        startDate = accountOpeningDate;
    }
    
    // Log date range for debugging
    window.Logger.info(`📅 טווח זמן לחישוב סטטיסטיקות:`, { page: "trading_accounts" });
    window.Logger.info(`  - פילטר נבחר: ${dateRange}`, { page: "trading_accounts" });
    window.Logger.info(`  - תאריך התחלה: ${startDate ? startDate.toISOString().split('T')[0] : 'null'}`, { page: "trading_accounts" });
    window.Logger.info(`  - תאריך סיום: ${endDate ? endDate.toISOString().split('T')[0] : 'null'}`, { page: "trading_accounts" });
    if (startDate && endDate) {
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        window.Logger.info(`  - מספר ימים בטווח: ${daysDiff}`, { page: "trading_accounts" });
    }
    window.Logger.info(`  - תאריך פתיחת חשבון: ${accountOpeningDate ? accountOpeningDate.toISOString().split('T')[0] : 'null'}`, { page: "trading_accounts" });
    
    // Separate rows by type
    const cashFlowRows = rows.filter(row => row.getAttribute('data-movement-type') === 'cash_flow');
    const executionRows = rows.filter(row => row.getAttribute('data-movement-type') === 'execution');
    
    // Filter by date range
    const filterByDateRange = (rowsList, start, end) => {
        return rowsList.filter(row => {
            const rowDateStr = row.getAttribute('data-movement-date');
            if (!rowDateStr) return false;
            const rowDate = new Date(rowDateStr);
            if (start && rowDate < start) return false;
            if (end && rowDate > end) return false;
            return true;
        });
    };
    
    const filteredCashFlowRows = startDate || endDate ? filterByDateRange(cashFlowRows, startDate, endDate) : cashFlowRows;
    const filteredExecutionRows = startDate || endDate ? filterByDateRange(executionRows, startDate, endDate) : executionRows;
    
    // Helper to calculate statistics for a type
    const calculateStatsForType = (filteredRows, typeName) => {
        if (filteredRows.length === 0) {
            return {
                totalCount: 0,
                totalAmount: 0,
                positiveAmount: 0,
                negativeAmount: 0,
                positiveCount: 0,
                negativeCount: 0,
                bySubtype: {},
                firstRecord: null,
                lastRecord: null,
                dateRange: { start: startDate, end: endDate }
            };
        }
        
        // Log dateRange for debugging
        window.Logger.info(`  - stats.dateRange: start=${startDate ? new Date(startDate).toISOString().split('T')[0] : 'null'}, end=${endDate ? new Date(endDate).toISOString().split('T')[0] : 'null'}`, { page: "trading_accounts" });
        
        // Get amounts and dates
        const movements = filteredRows.map(row => ({
            id: row.getAttribute('data-movement-id'),
            type: row.getAttribute('data-movement-type'),
            subtype: row.getAttribute('data-movement-subtype'),
            amount: parseFloat(row.getAttribute('data-movement-amount') || '0'),
            date: row.getAttribute('data-movement-date'),
            currency: row.getAttribute('data-currency-symbol') || 'USD'
        }));
        
        // Sort by date (oldest first)
        movements.sort((a, b) => {
            const dateA = a.date ? new Date(a.date) : new Date(0);
            const dateB = b.date ? new Date(b.date) : new Date(0);
            return dateA - dateB;
        });
        
        const firstRecord = movements[0];
        const lastRecord = movements[movements.length - 1];
        
        // Log first and last records for debugging
        window.Logger.info(`📊 ${typeName} - רשומות בתקופה:`, { page: "trading_accounts" });
        window.Logger.info(`  - מספר רשומות: ${movements.length}`, { page: "trading_accounts" });
        if (firstRecord) {
            window.Logger.info(`  - רשומה ראשונה: ${firstRecord.date}, סכום: ${firstRecord.amount}`, { page: "trading_accounts" });
        }
        if (lastRecord) {
            window.Logger.info(`  - רשומה אחרונה: ${lastRecord.date}, סכום: ${lastRecord.amount}`, { page: "trading_accounts" });
        }
        
        // Calculate totals
        const totalAmount = movements.reduce((sum, m) => sum + m.amount, 0);
        window.Logger.info(`  - סה"כ סכום: ${totalAmount}`, { page: "trading_accounts" });
        
        // Calculate positive and negative amounts separately
        const positiveAmounts = movements.filter(m => m.amount >= 0).reduce((sum, m) => sum + m.amount, 0);
        const negativeAmounts = movements.filter(m => m.amount < 0).reduce((sum, m) => sum + m.amount, 0);
        const positiveCount = movements.filter(m => m.amount >= 0).length;
        const negativeCount = movements.filter(m => m.amount < 0).length;
        
        // Group by subtype
        // IMPORTANT: Merge related subtypes into single groups:
        // - 'deposit' and 'withdrawal' into 'deposits_withdrawals'
        const bySubtype = {};
        movements.forEach(m => {
            let subtype = (m.subtype || (m.amount >= 0 ? 'other_positive' : 'other_negative')).toLowerCase();
            
            // Merge 'deposit' and 'withdrawal' into 'deposits_withdrawals'
            if (subtype === 'deposit' || subtype === 'withdrawal') {
                subtype = 'deposits_withdrawals';
            }
            
            if (!bySubtype[subtype]) {
                bySubtype[subtype] = {
                    count: 0,
                    totalAmount: 0,
                    movements: []
                };
            }
            bySubtype[subtype].count++;
            bySubtype[subtype].totalAmount += m.amount;
            bySubtype[subtype].movements.push(m);
            // Calculate positive/negative counts and amounts for each subtype
            if (!bySubtype[subtype].positiveAmount) bySubtype[subtype].positiveAmount = 0;
            if (!bySubtype[subtype].negativeAmount) bySubtype[subtype].negativeAmount = 0;
            if (!bySubtype[subtype].positiveCount) bySubtype[subtype].positiveCount = 0;
            if (!bySubtype[subtype].negativeCount) bySubtype[subtype].negativeCount = 0;
            
            if (m.amount >= 0) {
                bySubtype[subtype].positiveAmount += m.amount;
                bySubtype[subtype].positiveCount++;
            } else {
                bySubtype[subtype].negativeAmount += m.amount;
                bySubtype[subtype].negativeCount++;
            }
        });
        
        // Calculate changes for each subtype
        Object.keys(bySubtype).forEach(subtype => {
            const subtypeMovements = bySubtype[subtype].movements.sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : new Date(0);
                const dateB = b.date ? new Date(b.date) : new Date(0);
                return dateA - dateB;
            });
            
            if (subtypeMovements.length > 0) {
                const first = subtypeMovements[0];
                const last = subtypeMovements[subtypeMovements.length - 1];
                
                const firstAmount = first.amount;
                const lastAmount = last.amount;
                
                // Calculate percentage change
                let percentageChange = 0;
                if (firstAmount !== 0) {
                    percentageChange = ((lastAmount - firstAmount) / Math.abs(firstAmount)) * 100;
                } else if (lastAmount !== 0) {
                    percentageChange = lastAmount > 0 ? 100 : -100;
                }
                
                // Calculate amount change
                const amountChange = lastAmount - firstAmount;
                
                // Calculate days in range
                let daysInRange = 1;
                if (first.date && last.date) {
                    const startDate = new Date(first.date);
                    const endDate = new Date(last.date);
                    daysInRange = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
                } else if (startDate && endDate) {
                    daysInRange = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
                }
                
                // Calculate annualized change
                const annualizedChange = (percentageChange / daysInRange) * 365;
                
                bySubtype[subtype].firstAmount = firstAmount;
                bySubtype[subtype].lastAmount = lastAmount;
                bySubtype[subtype].percentageChange = percentageChange;
                bySubtype[subtype].amountChange = amountChange;
                bySubtype[subtype].annualizedChange = annualizedChange;
                bySubtype[subtype].daysInRange = daysInRange;
            }
        });
        
        // Calculate overall changes (first record vs last record of same type)
        let overallPercentageChange = 0;
        let overallAmountChange = 0;
        let overallAnnualizedChange = 0;
        
        if (firstRecord && lastRecord && firstRecord !== lastRecord) {
            const firstAmount = firstRecord.amount;
            const lastAmount = lastRecord.amount;
            
            // Calculate percentage change: (last - first) / |first| * 100
            if (firstAmount !== 0) {
                overallPercentageChange = ((lastAmount - firstAmount) / Math.abs(firstAmount)) * 100;
            } else if (lastAmount !== 0) {
                overallPercentageChange = lastAmount > 0 ? 100 : -100;
            }
            
            // Calculate amount change: last - first
            overallAmountChange = lastAmount - firstAmount;
            
            // Calculate days between first and last record
            let daysInRange = 1;
            if (firstRecord.date && lastRecord.date) {
                const startDateObj = new Date(firstRecord.date);
                const endDateObj = new Date(lastRecord.date);
                daysInRange = Math.max(1, Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)));
            } else if (startDate && endDate) {
                daysInRange = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
            }
            
            // Calculate annualized change: (percentage_change / days) * 365
            overallAnnualizedChange = (overallPercentageChange / daysInRange) * 365;
        }
        
        return {
            totalCount: filteredRows.length,
            totalAmount: totalAmount,
            positiveAmount: positiveAmounts,
            negativeAmount: negativeAmounts,
            positiveCount: positiveCount,
            negativeCount: negativeCount,
            bySubtype: bySubtype,
            firstRecord: firstRecord,
            lastRecord: lastRecord,
            dateRange: { start: startDate, end: endDate },
            overallPercentageChange,
            overallAmountChange,
            overallAnnualizedChange,
            currency: movements.length > 0 ? movements[0].currency : 'USD'
        };
    };
    
    const cashFlowsStats = calculateStatsForType(filteredCashFlowRows, 'cash_flow');
    const executionsStats = calculateStatsForType(filteredExecutionRows, 'execution');
    
    return {
        cashFlows: cashFlowsStats,
        executions: executionsStats
    };
}

/**
 * Update activity statistics display
 */
function updateActivityStatistics() {
    const statsCard = document.getElementById('accountActivityStatisticsCard');
    if (!statsCard) {
        window.Logger.warn('⚠️ Statistics card not found', { page: "trading_accounts" });
        return;
    }
    
    const stats = calculateActivityStatistics();
    
    // Show card if we have data
    if (stats.cashFlows.totalCount === 0 && stats.executions.totalCount === 0) {
        statsCard.style.display = 'none';
        return;
    }
    
    statsCard.style.display = 'block';
    
    // Calculate overall statistics (combining cash flows + executions)
    const overallStats = combineStatistics(stats.cashFlows, stats.executions);
    
    // Render overall summary: main summary in two columns
    // Column 1: מספר רשומות + סה"כ סכום (for all records)
    // Column 2: ממוצע לפעולה + שנתי משוער (for all records with breakdown)
    const overallContent = document.getElementById('overallStatisticsContent');
    if (overallContent) {
        overallContent.innerHTML = renderStatisticsSummaryColumn1(overallStats, 'סיכום כללי');
    }
    
    const overallContent2 = document.getElementById('overallStatisticsContent2');
    if (overallContent2) {
        overallContent2.innerHTML = renderStatisticsSummaryColumn2(overallStats, 'סיכום כללי');
    }
    
    // Render cash flows: main summary - TWO cards, split content
    // Column 1: מספר רשומות + סה"כ סכום
    // Column 2: ממוצע לפעולה + שנתי משוער
    const cashFlowsContent = document.getElementById('cashFlowsStatisticsContent');
    if (cashFlowsContent) {
        // Column 1: מספר רשומות + סה"כ סכום
        cashFlowsContent.innerHTML = renderStatisticsSummaryColumn1(stats.cashFlows, 'תזרימי מזומנים');
    }
    
    const cashFlowsContent2 = document.getElementById('cashFlowsStatisticsContent2');
    if (cashFlowsContent2) {
        // Column 2: ממוצע לפעולה + שנתי משוער
        cashFlowsContent2.innerHTML = renderStatisticsSummaryColumn2(stats.cashFlows, 'תזרימי מזומנים');
    }
    
    // Render cash flows breakdown by subtype in two columns
    const cashFlowsBreakdown1 = document.getElementById('cashFlowsBreakdownContent1');
    if (cashFlowsBreakdown1) {
        const cashFlowsColumn1 = splitCashFlowsByColumn(stats.cashFlows, 1);
        cashFlowsBreakdown1.innerHTML = renderBreakdownBySubtype(cashFlowsColumn1, 'תזרימי מזומנים', 1);
    }
    
    const cashFlowsBreakdown2 = document.getElementById('cashFlowsBreakdownContent2');
    if (cashFlowsBreakdown2) {
        const cashFlowsColumn2 = splitCashFlowsByColumn(stats.cashFlows, 2);
        cashFlowsBreakdown2.innerHTML = renderBreakdownBySubtype(cashFlowsColumn2, 'תזרימי מזומנים', 2);
    }
    
    // Render executions: main summary - TWO cards, split content (same structure as cash flows)
    // Column 1: מספר רשומות + סה"כ סכום (for all executions)
    // Column 2: ממוצע לפעולה + שנתי משוער (for all executions with breakdown by buy/sell)
    const executionsContentBuy = document.getElementById('executionsStatisticsContentBuy');
    if (executionsContentBuy) {
        // Column 1: מספר רשומות + סה"כ סכום (full stats)
        executionsContentBuy.innerHTML = renderStatisticsSummaryColumn1(stats.executions, 'ביצועים');
    }
    
    const executionsContentSell = document.getElementById('executionsStatisticsContentSell');
    if (executionsContentSell) {
        // Column 2: ממוצע לפעולה + שנתי משוער (full stats with breakdown)
        executionsContentSell.innerHTML = renderStatisticsSummaryColumn2(stats.executions, 'ביצועים');
    }
    
    // Render executions breakdown by subtype (buy/sell)
    const executionsBreakdown1 = document.getElementById('executionsBreakdownContent1');
    if (executionsBreakdown1) {
        const executionsBuy = splitExecutionsByAction(stats.executions, 'buy');
        executionsBreakdown1.innerHTML = renderBreakdownBySubtype(executionsBuy, 'ביצועים', 'buy');
    }
    
    const executionsBreakdown2 = document.getElementById('executionsBreakdownContent2');
    if (executionsBreakdown2) {
        const executionsSell = splitExecutionsByAction(stats.executions, 'sell');
        executionsBreakdown2.innerHTML = renderBreakdownBySubtype(executionsSell, 'ביצועים', 'sell');
    }
    
    // Update activity summary header (with date range)
    // Always update summary even if data hasn't changed, to refresh date range display
    if (window.accountActivityState && window.accountActivityState.activityData) {
        updateActivitySummary(window.accountActivityState.activityData);
    } else {
        // If no data, still update the date range in title (it will show placeholder)
        updateActivitySummary(null);
    }
}

/**
 * Combine statistics from cash flows and executions into overall summary
 * @param {Object} cashFlowsStats - Cash flows statistics
 * @param {Object} executionsStats - Executions statistics
 * @returns {Object} Combined statistics object
 */
function combineStatistics(cashFlowsStats, executionsStats) {
    if (!cashFlowsStats || !executionsStats) {
        return cashFlowsStats || executionsStats || {};
    }
    
    // Combine totals
    const totalCount = (cashFlowsStats.totalCount || 0) + (executionsStats.totalCount || 0);
    const totalAmount = (cashFlowsStats.totalAmount || 0) + (executionsStats.totalAmount || 0);
    const positiveAmount = (cashFlowsStats.positiveAmount || 0) + (executionsStats.positiveAmount || 0);
    const negativeAmount = (cashFlowsStats.negativeAmount || 0) + (executionsStats.negativeAmount || 0);
    const positiveCount = (cashFlowsStats.positiveCount || 0) + (executionsStats.positiveCount || 0);
    const negativeCount = (cashFlowsStats.negativeCount || 0) + (executionsStats.negativeCount || 0);
    
    // Use the earliest first record and latest last record
    let firstRecord = null;
    let lastRecord = null;
    
    if (cashFlowsStats.firstRecord && executionsStats.firstRecord) {
        const cashFlowDate = new Date(cashFlowsStats.firstRecord.date || 0);
        const executionDate = new Date(executionsStats.firstRecord.date || 0);
        firstRecord = cashFlowDate < executionDate ? cashFlowsStats.firstRecord : executionsStats.firstRecord;
    } else {
        firstRecord = cashFlowsStats.firstRecord || executionsStats.firstRecord;
    }
    
    if (cashFlowsStats.lastRecord && executionsStats.lastRecord) {
        const cashFlowDate = new Date(cashFlowsStats.lastRecord.date || 0);
        const executionDate = new Date(executionsStats.lastRecord.date || 0);
        lastRecord = cashFlowDate > executionDate ? cashFlowsStats.lastRecord : executionsStats.lastRecord;
    } else {
        lastRecord = cashFlowsStats.lastRecord || executionsStats.lastRecord;
    }
    
    // Use the earliest date range start and latest date range end
    let dateRangeStart = null;
    let dateRangeEnd = null;
    
    if (cashFlowsStats.dateRange && executionsStats.dateRange) {
        dateRangeStart = cashFlowsStats.dateRange.start && executionsStats.dateRange.start
            ? new Date(Math.min(cashFlowsStats.dateRange.start, executionsStats.dateRange.start))
            : (cashFlowsStats.dateRange.start || executionsStats.dateRange.start);
        dateRangeEnd = cashFlowsStats.dateRange.end && executionsStats.dateRange.end
            ? new Date(Math.max(cashFlowsStats.dateRange.end, executionsStats.dateRange.end))
            : (cashFlowsStats.dateRange.end || executionsStats.dateRange.end);
    } else {
        dateRangeStart = cashFlowsStats.dateRange?.start || executionsStats.dateRange?.start;
        dateRangeEnd = cashFlowsStats.dateRange?.end || executionsStats.dateRange?.end;
    }
    
    // Determine currency (prefer cash flows, fallback to executions)
    const currency = cashFlowsStats.currency || executionsStats.currency || 'USD';
    
    return {
        totalCount: totalCount,
        totalAmount: totalAmount,
        positiveAmount: positiveAmount,
        negativeAmount: negativeAmount,
        positiveCount: positiveCount,
        negativeCount: negativeCount,
        firstRecord: firstRecord,
        lastRecord: lastRecord,
        dateRange: { start: dateRangeStart, end: dateRangeEnd },
        currency: currency
    };
}

/**
 * Split cash flows statistics by column
 * Column 1: deposits_withdrawals, fee, dividend
 * Column 2: interest, transfer, other
 * @param {Object} stats - Full cash flows statistics
 * @param {number} column - Column number (1 or 2)
 * @returns {Object} Filtered statistics object for the column
 */
function splitCashFlowsByColumn(stats, column) {
    if (!stats || !stats.bySubtype) {
        return stats;
    }
    
    const column1Subtypes = ['deposits_withdrawals', 'fee', 'dividend'];
    const column2Subtypes = ['transfer', 'interest', 'other'];
    
    const targetSubtypes = column === 1 ? column1Subtypes : column2Subtypes;
    
    // Filter bySubtype to only include subtypes for this column
    const filteredBySubtype = {};
    let totalCount = 0;
    let totalAmount = 0;
    let positiveAmount = 0;
    let negativeAmount = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    
    targetSubtypes.forEach(subtype => {
        if (stats.bySubtype[subtype]) {
            filteredBySubtype[subtype] = stats.bySubtype[subtype];
            totalCount += stats.bySubtype[subtype].count || 0;
            totalAmount += stats.bySubtype[subtype].totalAmount || 0;
            positiveAmount += stats.bySubtype[subtype].positiveAmount || 0;
            negativeAmount += stats.bySubtype[subtype].negativeAmount || 0;
            positiveCount += stats.bySubtype[subtype].positiveCount || 0;
            negativeCount += stats.bySubtype[subtype].negativeCount || 0;
        }
    });
    
    return {
        ...stats,
        bySubtype: filteredBySubtype,
        totalCount: totalCount,
        totalAmount: totalAmount,
        positiveAmount: positiveAmount,
        negativeAmount: negativeAmount,
        positiveCount: positiveCount,
        negativeCount: negativeCount
    };
}

/**
 * Split executions statistics by action (buy/sell)
 * @param {Object} stats - Full executions statistics
 * @param {string} action - Action type ('buy' or 'sell')
 * @returns {Object} Filtered statistics object for the action
 */
function splitExecutionsByAction(stats, action) {
    if (!stats || !stats.bySubtype) {
        return stats;
    }
    
    // Filter bySubtype to only include the requested action
    const filteredBySubtype = {};
    if (stats.bySubtype[action]) {
        filteredBySubtype[action] = stats.bySubtype[action];
    }
    
    const subtypeStats = stats.bySubtype[action];
    if (!subtypeStats) {
        // Return empty stats structure
        return {
            ...stats,
            bySubtype: {},
            totalCount: 0,
            totalAmount: 0,
            positiveAmount: 0,
            negativeAmount: 0,
            positiveCount: 0,
            negativeCount: 0
        };
    }
    
    return {
        ...stats,
        bySubtype: filteredBySubtype,
        totalCount: subtypeStats.count || 0,
        totalAmount: subtypeStats.totalAmount || 0,
        positiveAmount: subtypeStats.positiveAmount || 0,
        negativeAmount: subtypeStats.negativeAmount || 0,
        positiveCount: subtypeStats.positiveCount || 0,
        negativeCount: subtypeStats.negativeCount || 0
    };
}

/**
 * Render statistics column HTML
 * @param {Object} stats - Statistics object for one type
 * @param {string} typeName - Name of the type (for display)
 * @returns {string} HTML string
 */
function renderStatisticsColumn(stats, typeName) {
    if (!stats || stats.totalCount === 0) {
        return '<div class="statistics-empty">אין נתונים להצגה</div>';
    }
    
    const currency = stats.currency || 'USD';
    let currencySymbol = currency;
    if (currency && currency.length > 1) {
        switch (currency.toUpperCase()) {
            case 'USD': currencySymbol = '$'; break;
            case 'ILS': currencySymbol = '₪'; break;
            case 'EUR': currencySymbol = '€'; break;
            case 'GBP': currencySymbol = '£'; break;
            case 'JPY': currencySymbol = '¥'; break;
            default: currencySymbol = currency;
        }
    }
    
    let html = '<div class="statistics-summary">';
    
    // Card 1: מספר רשומות + סה"כ סכום (unified) - two columns
    html += '<div class="statistics-card-item">';
    const totalAmountHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
        ? window.FieldRendererService.renderAmount(stats.totalAmount, currencySymbol, 0, true)
        : `<span>${stats.totalAmount < 0 ? '-' : ''}${Math.abs(stats.totalAmount).toFixed(0)}${currencySymbol}</span>`;
    
    // Format records count with breakdown (always show if we have any breakdown)
    let recordsCountHtml = `${stats.totalCount}`;
    if (stats.negativeCount > 0 || stats.positiveCount > 0) {
        const negativeCountClass = (stats.negativeCount || 0) === 0 ? '' : 'text-danger';
        const positiveCountClass = (stats.positiveCount || 0) === 0 ? '' : 'text-success';
        recordsCountHtml = `${stats.totalCount} (<span class="${negativeCountClass}">${stats.negativeCount || 0}</span>/<span class="${positiveCountClass}">${stats.positiveCount || 0}</span>)`;
    }
    
    // Format total amount with breakdown (always show if we have amounts)
    let totalAmountWithBreakdown = totalAmountHtml;
    if (stats.negativeAmount !== 0 || stats.positiveAmount !== 0) {
        const negativeAmount = stats.negativeAmount || 0;
        const positiveAmount = stats.positiveAmount || 0;
        const negativeAmountClass = negativeAmount === 0 ? '' : 'text-danger';
        const positiveAmountClass = positiveAmount === 0 ? '' : 'text-success';
        
        let negativeAmountHtml;
                if (negativeAmount === 0) {
                    // For zero: display without color class (neutral)
                    negativeAmountHtml = `<span>${negativeAmount.toFixed(0)}${currencySymbol}</span>`;
                } else if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                    negativeAmountHtml = window.FieldRendererService.renderAmount(negativeAmount, currencySymbol, 0, true);
                } else {
                    negativeAmountHtml = `<span class="text-danger">${negativeAmount.toFixed(0)}${currencySymbol}</span>`;
                }
                
                let positiveAmountHtml;
                if (positiveAmount === 0) {
                    // For zero: display without color class (neutral)
                    positiveAmountHtml = `<span>${positiveAmount.toFixed(0)}${currencySymbol}</span>`;
                } else if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                    positiveAmountHtml = window.FieldRendererService.renderAmount(positiveAmount, currencySymbol, 0, true);
                } else {
                    positiveAmountHtml = `<span class="text-success">${positiveAmount >= 0 ? '+' : ''}${positiveAmount.toFixed(0)}${currencySymbol}</span>`;
                }
        
        totalAmountWithBreakdown = `${totalAmountHtml}<br>(${negativeAmountHtml}/${positiveAmountHtml})`;
    }
    
    html += '<div class="statistics-card-content statistics-card-two-columns">';
    html += `<div class="statistics-card-col">מספר רשומות: <strong>${recordsCountHtml}</strong></div>`;
    html += `<div class="statistics-card-col statistics-card-col-end">סה"כ סכום: <strong>${totalAmountWithBreakdown}</strong></div>`;
    html += '</div>';
    html += '</div>';
    
    // Card 2: שינוי או ממוצע (unified - all three metrics in one card)
    // For executions: show average per action instead of change
    // For cash flows: show change as before
    const isExecution = typeName === 'ביצועים' || typeName === 'execution';
    
    if (isExecution && stats.totalCount > 0) {
        // Executions: Show average per action
        // Calculate average using absolute values (neutral - mixing positive and negative)
        html += '<div class="statistics-card-item">';
        
        // Calculate absolute average: sum of absolute values divided by count
        // This gives average of buy (negative) and sell (positive) together - neutral color
        let absoluteTotal = 0;
        if (stats.bySubtype && Object.keys(stats.bySubtype).length > 0) {
            // Sum absolute values from all subtypes
            Object.values(stats.bySubtype).forEach(subtype => {
                if (subtype.movements && Array.isArray(subtype.movements)) {
                    subtype.movements.forEach(m => {
                        absoluteTotal += Math.abs(m.amount || 0);
                    });
                }
            });
        }
        
        // If no movements found in bySubtype, calculate from positive and negative amounts
        if (absoluteTotal === 0) {
            absoluteTotal = Math.abs(stats.positiveAmount || 0) + Math.abs(stats.negativeAmount || 0);
        }
        
        const averagePerAction = stats.totalCount > 0 ? absoluteTotal / stats.totalCount : 0;
        
        // Display with neutral color (no positive/negative class, no sign)
        const formatted = Math.abs(averagePerAction).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        const averageHtml = `<span>${formatted}${currencySymbol}</span>`;
        
        // Calculate annual amount estimate
        // Use totalAmount for the period, not the change between first and last record
        // IMPORTANT: Use the full date range (filter range), NOT the period between first and last records
        // This gives a more accurate annualized estimate based on the actual time period selected
        let daysForAnnual = 1;
        if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
            // Use the full filter date range (more accurate for annualization)
            daysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
            window.Logger.info(`  - Using full date range for annualization: ${daysForAnnual} days (from ${stats.dateRange.start ? new Date(stats.dateRange.start).toISOString().split('T')[0] : 'null'} to ${stats.dateRange.end ? new Date(stats.dateRange.end).toISOString().split('T')[0] : 'null'})`, { page: "trading_accounts" });
        } else if (stats.lastRecord && stats.firstRecord && stats.firstRecord !== stats.lastRecord && stats.lastRecord.date && stats.firstRecord.date) {
            // Fallback: use period between records only if dateRange is not available
            daysForAnnual = Math.max(1, Math.ceil((new Date(stats.lastRecord.date) - new Date(stats.firstRecord.date)) / (1000 * 60 * 60 * 24)));
            window.Logger.info(`  - Fallback: Using period between records for annualization: ${daysForAnnual} days`, { page: "trading_accounts" });
        }
        // For executions: estimate annual based on total amount in period (not change)
        const annualAmountChange = (stats.totalAmount / daysForAnnual) * 365;
        const annualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
            ? window.FieldRendererService.renderAmount(annualAmountChange, currencySymbol, 0, true)
            : `<span>${annualAmountChange >= 0 ? '+' : ''}${annualAmountChange.toFixed(0)}${currencySymbol}</span>`;
        
        // TODO: Calculate percentage change as part of total account value
        // Currently account balance/value is not available - display 0% (future)
        // When account balance is available:
        //   percentageChange = (stats.totalAmount / accountBalance) * 100
        //   annualPercentageChange = (annualAmountChange / accountBalance) * 100
        // NOTE: Need to get account balance from account data or API
        // FIXME: Replace placeholder with actual calculation once account balance is available
        const accountBalance = 0; // TODO: Get from account data - window.accountActivityState.selectedAccountId balance
        let percentageChange = 0;
        let annualPercentageChange = 0;
        let percentageDisplay = '0%';
        let annualPercentageDisplay = '0%';
        
        if (accountBalance > 0) {
            // Calculate percentage change as part of account balance
            percentageChange = (stats.totalAmount / Math.abs(accountBalance)) * 100;
            annualPercentageChange = (annualAmountChange / Math.abs(accountBalance)) * 100;
            
            // Format percentages (RTL: number first, then %, then sign)
            const pctNumber = Math.abs(percentageChange).toFixed(2);
            const pctSign = percentageChange < 0 ? '-' : '';
            percentageDisplay = `${pctNumber}%${pctSign}`;
            
            const annualPctNumber = Math.abs(annualPercentageChange).toFixed(2);
            const annualPctSign = annualPercentageChange < 0 ? '-' : '';
            annualPercentageDisplay = `${annualPctNumber}%${annualPctSign}`;
        } else {
            // Show placeholder: 0% (future)
            percentageDisplay = '0% (עתידי)';
            annualPercentageDisplay = '0% (עתידי)';
        }
        
        // For "0% (עתידי)" - always use neutral light variant color
        const pctClass = (accountBalance > 0) 
            ? (percentageChange >= 0 ? 'text-success' : (percentageChange < 0 ? 'text-danger' : ''))
            : ''; // Neutral (light variant) - no color class
        const annualPctClass = (accountBalance > 0)
            ? (annualPercentageChange >= 0 ? 'text-success' : (annualPercentageChange < 0 ? 'text-danger' : ''))
            : ''; // Neutral (light variant) - no color class
        
        html += '<div class="statistics-card-content statistics-card-two-columns">';
        html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${averageHtml}</strong> | <strong class="${pctClass}">${percentageDisplay}</strong></div>`;
        html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${annualAmountChangeHtml}</strong> | <strong class="${annualPctClass}">${annualPercentageDisplay}</strong></div>`;
        html += '</div>';
        html += '</div>';
    } else if (!isExecution && stats.totalCount > 0) {
        // Cash flows: Show average per action (same as executions)
        html += '<div class="statistics-card-item">';
        
        // Calculate average per action using absolute values (neutral - mixing positive and negative)
        // This gives average of deposits (positive) and withdrawals (negative) together - neutral color
        const absoluteTotal = Math.abs(stats.positiveAmount || 0) + Math.abs(stats.negativeAmount || 0);
        const averagePerAction = stats.totalCount > 0 ? absoluteTotal / stats.totalCount : 0;
        
        // Log calculation details
        window.Logger.info(`📊 חישוב ממוצע לפעולה (${typeName}):`, { page: "trading_accounts" });
        window.Logger.info(`  - positiveAmount: ${stats.positiveAmount || 0}`, { page: "trading_accounts" });
        window.Logger.info(`  - negativeAmount: ${stats.negativeAmount || 0}`, { page: "trading_accounts" });
        window.Logger.info(`  - absoluteTotal: ${absoluteTotal}`, { page: "trading_accounts" });
        window.Logger.info(`  - totalCount: ${stats.totalCount}`, { page: "trading_accounts" });
        window.Logger.info(`  - averagePerAction = ${absoluteTotal} / ${stats.totalCount} = ${averagePerAction}`, { page: "trading_accounts" });
        
        // Display with neutral color (no positive/negative class, no sign)
        const formatted = Math.abs(averagePerAction).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        const averageHtml = `<span>${formatted}${currencySymbol}</span>`;
        
        // Calculate annual amount estimate (use totalAmount, not overallAmountChange)
        // IMPORTANT: Use the full date range (filter range), NOT the period between first and last records
        // This gives a more accurate annualized estimate based on the actual time period selected
        let daysForAnnual = 1;
        if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
            // Use the full filter date range (more accurate for annualization)
            daysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
            window.Logger.info(`  - Using full date range for annualization: ${daysForAnnual} days (from ${stats.dateRange.start ? new Date(stats.dateRange.start).toISOString().split('T')[0] : 'null'} to ${stats.dateRange.end ? new Date(stats.dateRange.end).toISOString().split('T')[0] : 'null'})`, { page: "trading_accounts" });
        } else if (stats.lastRecord && stats.firstRecord && stats.firstRecord !== stats.lastRecord && stats.lastRecord.date && stats.firstRecord.date) {
            // Fallback: use period between records only if dateRange is not available
            daysForAnnual = Math.max(1, Math.ceil((new Date(stats.lastRecord.date) - new Date(stats.firstRecord.date)) / (1000 * 60 * 60 * 24)));
            window.Logger.info(`  - Fallback: Using period between records for annualization: ${daysForAnnual} days`, { page: "trading_accounts" });
        }
        // Use totalAmount (already normalized) instead of overallAmountChange
        const annualAmountChange = (stats.totalAmount / daysForAnnual) * 365;
        
        // Log calculation details
        window.Logger.info(`📈 חישוב שנתי משוער (${typeName}):`, { page: "trading_accounts" });
        window.Logger.info(`  - totalAmount: ${stats.totalAmount}`, { page: "trading_accounts" });
        window.Logger.info(`  - daysForAnnual: ${daysForAnnual}`, { page: "trading_accounts" });
        window.Logger.info(`  - annualAmountChange = (${stats.totalAmount} / ${daysForAnnual}) * 365 = ${annualAmountChange}`, { page: "trading_accounts" });
        
        const annualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
            ? window.FieldRendererService.renderAmount(annualAmountChange, currencySymbol, 0, true)
            : `<span>${annualAmountChange >= 0 ? '+' : ''}${annualAmountChange.toFixed(0)}${currencySymbol}</span>`;
        
        // TODO: Calculate percentage change as part of total account value (same as executions)
        // Currently account balance/value is not available - display 0% (future)
        // When account balance is available:
        //   percentageChange = (stats.overallAmountChange / accountBalance) * 100
        //   annualPercentageChange = (annualAmountChange / accountBalance) * 100
        // NOTE: Need to get account balance from account data or API
        // FIXME: Replace placeholder with actual calculation once account balance is available
        const accountBalance = 0; // TODO: Get from account data - window.accountActivityState.selectedAccountId balance
        let percentageChange = 0;
        let annualPercentageChange = 0;
        let percentageDisplay = '0%';
        let annualPercentageDisplay = '0%';
        
        if (accountBalance > 0) {
            // Calculate percentage change as part of account balance (same as executions)
            // Use averagePerAction for percentage calculation
            percentageChange = (averagePerAction / Math.abs(accountBalance)) * 100;
            annualPercentageChange = (annualAmountChange / Math.abs(accountBalance)) * 100;
            
            // Format percentages (RTL: number first, then %, then sign)
            const pctNumber = Math.abs(percentageChange).toFixed(2);
            const pctSign = percentageChange < 0 ? '-' : '';
            percentageDisplay = `${pctNumber}%${pctSign}`;
            
            const annualPctNumber = Math.abs(annualPercentageChange).toFixed(2);
            const annualPctSign = annualPercentageChange < 0 ? '-' : '';
            annualPercentageDisplay = `${annualPctNumber}%${annualPctSign}`;
        } else {
            // Show placeholder: 0% (future)
            percentageDisplay = '0% (עתידי)';
            annualPercentageDisplay = '0% (עתידי)';
        }
        
        // For "0% (עתידי)" - always use neutral light variant color
        const pctClass = (accountBalance > 0) 
            ? (percentageChange >= 0 ? 'text-success' : (percentageChange < 0 ? 'text-danger' : ''))
            : ''; // Neutral (light variant) - no color class
        const annualPctClass = (accountBalance > 0)
            ? (annualPercentageChange >= 0 ? 'text-success' : (annualPercentageChange < 0 ? 'text-danger' : ''))
            : ''; // Neutral (light variant) - no color class
        
        html += '<div class="statistics-card-content statistics-card-two-columns">';
        html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${averageHtml}</strong> | <strong class="${pctClass}">${percentageDisplay}</strong></div>`;
        html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${annualAmountChangeHtml}</strong> | <strong class="${annualPctClass}">${annualPercentageDisplay}</strong></div>`;
        html += '</div>';
        html += '</div>';
    }
    
    html += '</div>'; // End statistics-summary
    
    // Note: Breakdown is now rendered separately by renderBreakdownBySubtype
    
    return html;
}

/**
 * Render statistics summary column 1: מספר רשומות + סה"כ סכום
 * @param {Object} stats - Statistics object for one type
 * @param {string} typeName - Name of the type (for display)
 * @returns {string} HTML string
 */
function renderStatisticsSummaryColumn1(stats, typeName) {
    if (!stats || stats.totalCount === 0) {
        return '<div class="statistics-empty">אין נתונים להצגה</div>';
    }
    
    const currency = stats.currency || 'USD';
    let currencySymbol = currency;
    if (currency && currency.length > 1) {
        switch (currency.toUpperCase()) {
            case 'USD': currencySymbol = '$'; break;
            case 'ILS': currencySymbol = '₪'; break;
            case 'EUR': currencySymbol = '€'; break;
            case 'GBP': currencySymbol = '£'; break;
            case 'JPY': currencySymbol = '¥'; break;
            default: currencySymbol = currency;
        }
    }
    
    let html = '<div class="statistics-summary">';
    
    // Card: מספר רשומות + סה"כ סכום
    html += '<div class="statistics-card-item">';
    const totalAmountHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
        ? window.FieldRendererService.renderAmount(stats.totalAmount, currencySymbol, 0, true)
        : `<span>${stats.totalAmount < 0 ? '-' : ''}${Math.abs(stats.totalAmount).toFixed(0)}${currencySymbol}</span>`;
    
    // Format records count with breakdown
    let recordsCountHtml = `${stats.totalCount}`;
    if (stats.negativeCount > 0 || stats.positiveCount > 0) {
        const negativeCountClass = (stats.negativeCount || 0) === 0 ? '' : 'text-danger';
        const positiveCountClass = (stats.positiveCount || 0) === 0 ? '' : 'text-success';
        recordsCountHtml = `${stats.totalCount} (<span class="${negativeCountClass}">${stats.negativeCount || 0}</span>/<span class="${positiveCountClass}">${stats.positiveCount || 0}</span>)`;
    }
    
    // Format total amount with breakdown
    let totalAmountWithBreakdown = totalAmountHtml;
    if (stats.negativeAmount !== 0 || stats.positiveAmount !== 0) {
        const negativeAmount = stats.negativeAmount || 0;
        const positiveAmount = stats.positiveAmount || 0;
        
        let negativeAmountHtml;
        if (negativeAmount === 0) {
            negativeAmountHtml = `<span>${negativeAmount.toFixed(0)}${currencySymbol}</span>`;
        } else if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
            negativeAmountHtml = window.FieldRendererService.renderAmount(negativeAmount, currencySymbol, 0, true);
        } else {
            negativeAmountHtml = `<span class="text-danger">${negativeAmount.toFixed(0)}${currencySymbol}</span>`;
        }
        
        let positiveAmountHtml;
        if (positiveAmount === 0) {
            positiveAmountHtml = `<span>${positiveAmount.toFixed(0)}${currencySymbol}</span>`;
        } else if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
            positiveAmountHtml = window.FieldRendererService.renderAmount(positiveAmount, currencySymbol, 0, true);
        } else {
            positiveAmountHtml = `<span class="text-success">${positiveAmount >= 0 ? '+' : ''}${positiveAmount.toFixed(0)}${currencySymbol}</span>`;
        }
        
        totalAmountWithBreakdown = `${totalAmountHtml}<br>(${negativeAmountHtml}/${positiveAmountHtml})`;
    }
    
    html += '<div class="statistics-card-content statistics-card-two-columns">';
    html += `<div class="statistics-card-col">מספר רשומות: <strong>${recordsCountHtml}</strong></div>`;
    html += `<div class="statistics-card-col statistics-card-col-end">סה"כ סכום: <strong>${totalAmountWithBreakdown}</strong></div>`;
    html += '</div>';
    html += '</div>';
    html += '</div>'; // End statistics-summary
    
    return html;
}

/**
 * Render statistics summary column 2: ממוצע לפעולה + שנתי משוער
 * @param {Object} stats - Statistics object for one type
 * @param {string} typeName - Name of the type (for display)
 * @returns {string} HTML string
 */
function renderStatisticsSummaryColumn2(stats, typeName) {
    if (!stats || stats.totalCount === 0) {
        return '<div class="statistics-empty">אין נתונים להצגה</div>';
    }
    
    const currency = stats.currency || 'USD';
    let currencySymbol = currency;
    if (currency && currency.length > 1) {
        switch (currency.toUpperCase()) {
            case 'USD': currencySymbol = '$'; break;
            case 'ILS': currencySymbol = '₪'; break;
            case 'EUR': currencySymbol = '€'; break;
            case 'GBP': currencySymbol = '£'; break;
            case 'JPY': currencySymbol = '¥'; break;
            default: currencySymbol = currency;
        }
    }
    
    let html = '<div class="statistics-summary">';
    
    const isExecution = typeName === 'ביצועים' || typeName === 'execution';
    
    // Card: ממוצע לפעולה + שנתי משוער
    html += '<div class="statistics-card-item">';
    
    if (isExecution && stats.totalCount > 0) {
        // Executions: Calculate average using absolute values
        let absoluteTotal = 0;
        if (stats.bySubtype && Object.keys(stats.bySubtype).length > 0) {
            Object.values(stats.bySubtype).forEach(subtype => {
                if (subtype.movements && Array.isArray(subtype.movements)) {
                    subtype.movements.forEach(m => {
                        absoluteTotal += Math.abs(m.amount || 0);
                    });
                }
            });
        }
        
        if (absoluteTotal === 0) {
            absoluteTotal = Math.abs(stats.positiveAmount || 0) + Math.abs(stats.negativeAmount || 0);
        }
        
        const averagePerAction = stats.totalCount > 0 ? absoluteTotal / stats.totalCount : 0;
        const formatted = Math.abs(averagePerAction).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        let averageHtml = `<span>${formatted}${currencySymbol}</span>`;
        
        // Check if we need to show breakdown by sides (both positive and negative exist)
        const negativeAmount = stats.negativeAmount || 0;
        const positiveAmount = stats.positiveAmount || 0;
        const hasBothSides = negativeAmount !== 0 && positiveAmount !== 0;
        
        // If both sides exist, calculate and show breakdown for average per action
        // Breakdown should be on a new line after the total
        if (hasBothSides) {
            const positiveCount = stats.positiveCount || 0;
            const negativeCount = stats.negativeCount || 0;
            
            const positiveAverage = positiveCount > 0 ? Math.abs(positiveAmount) / positiveCount : 0;
            const negativeAverage = negativeCount > 0 ? Math.abs(negativeAmount) / negativeCount : 0;
            
            let negativeAverageHtml;
            if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                negativeAverageHtml = window.FieldRendererService.renderAmount(-negativeAverage, currencySymbol, 0, true);
            } else {
                negativeAverageHtml = `<span class="text-danger">-${negativeAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${currencySymbol}</span>`;
            }
            
            let positiveAverageHtml;
            if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                positiveAverageHtml = window.FieldRendererService.renderAmount(positiveAverage, currencySymbol, 0, true);
            } else {
                positiveAverageHtml = `<span class="text-success">+${positiveAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${currencySymbol}</span>`;
            }
            
            averageHtml = `${averageHtml}<br>(${negativeAverageHtml}/${positiveAverageHtml})`;
        }
        
        let daysForAnnual = 1;
        if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
            daysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
        } else if (stats.lastRecord && stats.firstRecord && stats.firstRecord !== stats.lastRecord && stats.lastRecord.date && stats.firstRecord.date) {
            daysForAnnual = Math.max(1, Math.ceil((new Date(stats.lastRecord.date) - new Date(stats.firstRecord.date)) / (1000 * 60 * 60 * 24)));
        }
        
        const annualAmountChange = (stats.totalAmount / daysForAnnual) * 365;
        let annualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
            ? window.FieldRendererService.renderAmount(annualAmountChange, currencySymbol, 0, true)
            : `<span>${annualAmountChange >= 0 ? '+' : ''}${annualAmountChange.toFixed(0)}${currencySymbol}</span>`;
        
        // If both sides exist, show breakdown for annual estimate
        if (hasBothSides) {
            const positiveAnnual = (positiveAmount / daysForAnnual) * 365;
            const negativeAnnual = (negativeAmount / daysForAnnual) * 365;
            
            let negativeAnnualHtml;
            if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                negativeAnnualHtml = window.FieldRendererService.renderAmount(negativeAnnual, currencySymbol, 0, true);
            } else {
                negativeAnnualHtml = `<span class="text-danger">${negativeAnnual.toFixed(0)}${currencySymbol}</span>`;
            }
            
            let positiveAnnualHtml;
            if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                positiveAnnualHtml = window.FieldRendererService.renderAmount(positiveAnnual, currencySymbol, 0, true);
            } else {
                positiveAnnualHtml = `<span class="text-success">${positiveAnnual >= 0 ? '+' : ''}${positiveAnnual.toFixed(0)}${currencySymbol}</span>`;
            }
            
            annualAmountChangeHtml = `${annualAmountChangeHtml}<br>(${negativeAnnualHtml}/${positiveAnnualHtml})`;
        }
        
        const accountBalance = 0;
        let percentageDisplay = '0%';
        let annualPercentageDisplay = '0%';
        let pctClass = '';
        let annualPctClass = '';
        
        if (accountBalance > 0) {
            const percentageChange = (stats.totalAmount / Math.abs(accountBalance)) * 100;
            const annualPercentageChange = (annualAmountChange / Math.abs(accountBalance)) * 100;
            
            const pctNumber = Math.abs(percentageChange).toFixed(2);
            const pctSign = percentageChange < 0 ? '-' : '';
            percentageDisplay = `${pctNumber}%${pctSign}`;
            
            const annualPctNumber = Math.abs(annualPercentageChange).toFixed(2);
            const annualPctSign = annualPercentageChange < 0 ? '-' : '';
            annualPercentageDisplay = `${annualPctNumber}%${annualPctSign}`;
            
            pctClass = percentageChange >= 0 ? 'text-success' : (percentageChange < 0 ? 'text-danger' : '');
            annualPctClass = annualPercentageChange >= 0 ? 'text-success' : (annualPercentageChange < 0 ? 'text-danger' : '');
        } else {
            percentageDisplay = '0% (עתידי)';
            annualPercentageDisplay = '0% (עתידי)';
        }
        
        html += '<div class="statistics-card-content statistics-card-two-columns">';
        html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${averageHtml}</strong> | <strong class="${pctClass}">${percentageDisplay}</strong></div>`;
        html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${annualAmountChangeHtml}</strong> | <strong class="${annualPctClass}">${annualPercentageDisplay}</strong></div>`;
        html += '</div>';
        html += '</div>';
    } else if (!isExecution && stats.totalCount > 0) {
        // Cash flows: Calculate average using absolute values
        const absoluteTotal = Math.abs(stats.positiveAmount || 0) + Math.abs(stats.negativeAmount || 0);
        const averagePerAction = stats.totalCount > 0 ? absoluteTotal / stats.totalCount : 0;
        
        const formatted = Math.abs(averagePerAction).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        let averageHtml = `<span>${formatted}${currencySymbol}</span>`;
        
        // Check if we need to show breakdown by sides (both positive and negative exist)
        const negativeAmount = stats.negativeAmount || 0;
        const positiveAmount = stats.positiveAmount || 0;
        const hasBothSides = negativeAmount !== 0 && positiveAmount !== 0;
        
        // If both sides exist, calculate and show breakdown for average per action
        // Breakdown should be on a new line after the total
        if (hasBothSides) {
            const positiveCount = stats.positiveCount || 0;
            const negativeCount = stats.negativeCount || 0;
            
            const positiveAverage = positiveCount > 0 ? Math.abs(positiveAmount) / positiveCount : 0;
            const negativeAverage = negativeCount > 0 ? Math.abs(negativeAmount) / negativeCount : 0;
            
            let negativeAverageHtml;
            if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                negativeAverageHtml = window.FieldRendererService.renderAmount(-negativeAverage, currencySymbol, 0, true);
            } else {
                negativeAverageHtml = `<span class="text-danger">-${negativeAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${currencySymbol}</span>`;
            }
            
            let positiveAverageHtml;
            if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                positiveAverageHtml = window.FieldRendererService.renderAmount(positiveAverage, currencySymbol, 0, true);
            } else {
                positiveAverageHtml = `<span class="text-success">+${positiveAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${currencySymbol}</span>`;
            }
            
            averageHtml = `${averageHtml}<br>(${negativeAverageHtml}/${positiveAverageHtml})`;
        }
        
        let daysForAnnual = 1;
        if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
            daysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
        } else if (stats.lastRecord && stats.firstRecord && stats.firstRecord !== stats.lastRecord && stats.lastRecord.date && stats.firstRecord.date) {
            daysForAnnual = Math.max(1, Math.ceil((new Date(stats.lastRecord.date) - new Date(stats.firstRecord.date)) / (1000 * 60 * 60 * 24)));
        }
        
        const annualAmountChange = (stats.totalAmount / daysForAnnual) * 365;
        let annualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
            ? window.FieldRendererService.renderAmount(annualAmountChange, currencySymbol, 0, true)
            : `<span>${annualAmountChange >= 0 ? '+' : ''}${annualAmountChange.toFixed(0)}${currencySymbol}</span>`;
        
        // If both sides exist, show breakdown for annual estimate
        if (hasBothSides) {
            const positiveAnnual = (positiveAmount / daysForAnnual) * 365;
            const negativeAnnual = (negativeAmount / daysForAnnual) * 365;
            
            let negativeAnnualHtml;
            if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                negativeAnnualHtml = window.FieldRendererService.renderAmount(negativeAnnual, currencySymbol, 0, true);
            } else {
                negativeAnnualHtml = `<span class="text-danger">${negativeAnnual.toFixed(0)}${currencySymbol}</span>`;
            }
            
            let positiveAnnualHtml;
            if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                positiveAnnualHtml = window.FieldRendererService.renderAmount(positiveAnnual, currencySymbol, 0, true);
            } else {
                positiveAnnualHtml = `<span class="text-success">${positiveAnnual >= 0 ? '+' : ''}${positiveAnnual.toFixed(0)}${currencySymbol}</span>`;
            }
            
            annualAmountChangeHtml = `${annualAmountChangeHtml}<br>(${negativeAnnualHtml}/${positiveAnnualHtml})`;
        }
        
        const accountBalance = 0;
        let percentageDisplay = '0%';
        let annualPercentageDisplay = '0%';
        let pctClass = '';
        let annualPctClass = '';
        
        if (accountBalance > 0) {
            const percentageChange = (averagePerAction / Math.abs(accountBalance)) * 100;
            const annualPercentageChange = (annualAmountChange / Math.abs(accountBalance)) * 100;
            
            const pctNumber = Math.abs(percentageChange).toFixed(2);
            const pctSign = percentageChange < 0 ? '-' : '';
            percentageDisplay = `${pctNumber}%${pctSign}`;
            
            const annualPctNumber = Math.abs(annualPercentageChange).toFixed(2);
            const annualPctSign = annualPercentageChange < 0 ? '-' : '';
            annualPercentageDisplay = `${annualPctNumber}%${annualPctSign}`;
            
            pctClass = percentageChange >= 0 ? 'text-success' : (percentageChange < 0 ? 'text-danger' : '');
            annualPctClass = annualPercentageChange >= 0 ? 'text-success' : (annualPercentageChange < 0 ? 'text-danger' : '');
        } else {
            percentageDisplay = '0% (עתידי)';
            annualPercentageDisplay = '0% (עתידי)';
        }
        
        html += '<div class="statistics-card-content statistics-card-two-columns">';
        html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${averageHtml}</strong> | <strong class="${pctClass}">${percentageDisplay}</strong></div>`;
        html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${annualAmountChangeHtml}</strong> | <strong class="${annualPctClass}">${annualPercentageDisplay}</strong></div>`;
        html += '</div>';
        html += '</div>';
    }
    
    html += '</div>'; // End statistics-summary
    
    return html;
}

/**
 * Render breakdown by subtype HTML (only the breakdown cards, without summary)
 * @param {Object} stats - Statistics object for one type
 * @param {string} typeName - Name of the type (for display)
 * @param {number} column - Column number (1 or 2) for cash flows, or action ('buy'/'sell') for executions
 * @returns {string} HTML string
 */
function renderBreakdownBySubtype(stats, typeName, column) {
    if (!stats || !stats.bySubtype || Object.keys(stats.bySubtype).length === 0) {
        return '';
    }
    
    const currency = stats.currency || 'USD';
    let currencySymbol = currency;
    if (currency && currency.length > 1) {
        switch (currency.toUpperCase()) {
            case 'USD': currencySymbol = '$'; break;
            case 'ILS': currencySymbol = '₪'; break;
            case 'EUR': currencySymbol = '€'; break;
            case 'GBP': currencySymbol = '£'; break;
            case 'JPY': currencySymbol = '¥'; break;
            default: currencySymbol = currency;
        }
    }
    
    let html = '';
    const isExecution = typeName === 'ביצועים' || typeName === 'execution';
    
    // Breakdown by subtype (no title, no dividers - handled in HTML)
    if (stats.bySubtype && Object.keys(stats.bySubtype).length > 0) {
        html += '<div class="statistics-breakdown">';
        
        // Sort subtypes in specific order for cash flows:
        // 1. deposits_withdrawals (הפקדה ומשיכה)
        // 2. fee (עמלה)
        // 3. dividend (דיבידנד)
        // 4. transfer (העברה)
        // 5. interest (ריבית)
        // 6. other (אחר)
        // For executions: keep alphabetical order (buy/sell)
        const subtypeOrder = ['deposits_withdrawals', 'fee', 'dividend', 'transfer_in', 'transfer_out', 'interest', 'other_positive', 'other_negative'];
        const subtypes = Object.keys(stats.bySubtype).sort((a, b) => {
            if (isExecution) {
                // For executions: alphabetical order
                return a.localeCompare(b);
            }
            
            // For cash flows: use predefined order
            const indexA = subtypeOrder.indexOf(a);
            const indexB = subtypeOrder.indexOf(b);
            
            // If both found in order list, use their position
            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }
            
            // If only one found, prioritize the one in list
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            
            // If neither found, alphabetical order
            return a.localeCompare(b);
        });
        
        subtypes.forEach(subtype => {
            const subtypeStats = stats.bySubtype[subtype];
            const subtypeDisplay = getSubtypeDisplay(subtype);
            
            html += '<div class="statistics-subtype-group">';
            html += `<h6>${subtypeDisplay}</h6>`;
            
            // Card 1: מספר רשומות + סה"כ סכום (unified) - two columns
            html += '<div class="statistics-card-item">';
            // For executions: ensure correct rendering (buy always negative, sell always positive)
            // For cash flows: render as before
            const subtypeAmountHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
                ? window.FieldRendererService.renderAmount(subtypeStats.totalAmount, currencySymbol, 0, isExecution)
                : `<span>${subtypeStats.totalAmount.toFixed(0)}${currencySymbol}</span>`;
            
            // Format subtype records count with breakdown
            // For executions: don't show breakdown (only one side - buy is negative, sell is positive)
            // For cash flows: show breakdown as before
            let subtypeRecordsCountHtml = `${subtypeStats.count}`;
            if (!isExecution && (subtypeStats.negativeCount > 0 || subtypeStats.positiveCount > 0)) {
                // Only show breakdown for cash flows, and only if both sides exist
                if (subtypeStats.negativeCount > 0 && subtypeStats.positiveCount > 0) {
                    const subtypeNegativeCountClass = 'text-danger';
                    const subtypePositiveCountClass = 'text-success';
                    subtypeRecordsCountHtml = `${subtypeStats.count} (<span class="${subtypeNegativeCountClass}">${subtypeStats.negativeCount || 0}</span>/<span class="${subtypePositiveCountClass}">${subtypeStats.positiveCount || 0}</span>)`;
                }
            }
            
            // Format subtype total amount with breakdown
            // For executions: don't show breakdown (only one side - buy is negative, sell is positive)
            // For cash flows: show breakdown only if both sides exist
            let subtypeAmountWithBreakdown = subtypeAmountHtml;
            if (!isExecution) {
                const subtypeNegativeAmount = subtypeStats.negativeAmount || 0;
                const subtypePositiveAmount = subtypeStats.positiveAmount || 0;
                // Only show breakdown if both sides exist (not just zeros)
                if (subtypeNegativeAmount !== 0 && subtypePositiveAmount !== 0) {
                    let subtypeNegativeAmountHtml;
                    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                        subtypeNegativeAmountHtml = window.FieldRendererService.renderAmount(subtypeNegativeAmount, currencySymbol, 0, true);
                    } else {
                        subtypeNegativeAmountHtml = `<span class="text-danger">${subtypeNegativeAmount.toFixed(2)}${currencySymbol}</span>`;
                    }
                    
                    let subtypePositiveAmountHtml;
                    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                        subtypePositiveAmountHtml = window.FieldRendererService.renderAmount(subtypePositiveAmount, currencySymbol, 0, true);
                    } else {
                        subtypePositiveAmountHtml = `<span class="text-success">${subtypePositiveAmount >= 0 ? '+' : ''}${subtypePositiveAmount.toFixed(2)}${currencySymbol}</span>`;
                    }
                    
                    subtypeAmountWithBreakdown = `${subtypeAmountHtml}<br>(${subtypeNegativeAmountHtml}/${subtypePositiveAmountHtml})`;
                }
            }
            
            html += '<div class="statistics-card-content statistics-card-two-columns">';
            html += `<div class="statistics-card-col">מספר רשומות: <strong>${subtypeRecordsCountHtml}</strong></div>`;
            html += `<div class="statistics-card-col statistics-card-col-end">סה"כ סכום: <strong>${subtypeAmountWithBreakdown}</strong></div>`;
            html += '</div>';
            html += '</div>';
            
            // Card 2: שינוי או ממוצע (unified - all three metrics in one card)
            // For executions: show average per action instead of change
            // For cash flows: show change as before
            if (isExecution && subtypeStats.count > 0) {
                // Executions: Show average per action
                html += '<div class="statistics-card-item">';
                
                const subtypeAveragePerAction = subtypeStats.totalAmount / subtypeStats.count;
                const subtypeAverageHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
                    ? window.FieldRendererService.renderAmount(subtypeAveragePerAction, currencySymbol, 0, true)
                    : `<span>${subtypeAveragePerAction >= 0 ? '+' : ''}${subtypeAveragePerAction.toFixed(0)}${currencySymbol}</span>`;
                
                // Calculate annual amount change for subtype
                // Use totalAmount for subtype, not amountChange
                // IMPORTANT: Use the full date range (filter range) for consistency with overall stats
                let subtypeDaysForAnnual = 1;
                if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
                    // Use the full filter date range (same as overall stats)
                    subtypeDaysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
                } else if (subtypeStats.movements && subtypeStats.movements.length > 0) {
                    // Fallback: use period between records only if dateRange is not available
                    const firstMovement = subtypeStats.movements[0];
                    const lastMovement = subtypeStats.movements[subtypeStats.movements.length - 1];
                    if (firstMovement.date && lastMovement.date) {
                        subtypeDaysForAnnual = Math.max(1, Math.ceil((new Date(lastMovement.date) - new Date(firstMovement.date)) / (1000 * 60 * 60 * 24)));
                    }
                }
                const subtypeAnnualAmountChange = (subtypeStats.totalAmount / subtypeDaysForAnnual) * 365;
                const subtypeAnnualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
                    ? window.FieldRendererService.renderAmount(subtypeAnnualAmountChange, currencySymbol, 0, true)
                    : `<span>${subtypeAnnualAmountChange >= 0 ? '+' : ''}${subtypeAnnualAmountChange.toFixed(0)}${currencySymbol}</span>`;
                
                // TODO: Calculate percentage change as part of total account value (same as overall)
                // FIXME: Replace placeholder with actual calculation once account balance is available
                const subtypeAccountBalance = 0; // TODO: Get from account data
                let subtypePercentageChange = 0;
                let subtypeAnnualPercentageChange = 0;
                let subtypePercentageDisplay = '0%';
                let subtypeAnnualPercentageDisplay = '0%';
                
                if (subtypeAccountBalance > 0) {
                    subtypePercentageChange = (subtypeStats.totalAmount / Math.abs(subtypeAccountBalance)) * 100;
                    subtypeAnnualPercentageChange = (subtypeAnnualAmountChange / Math.abs(subtypeAccountBalance)) * 100;
                    
                    const subtypePctNumber = Math.abs(subtypePercentageChange).toFixed(2);
                    const subtypePctSign = subtypePercentageChange < 0 ? '-' : '';
                    subtypePercentageDisplay = `${subtypePctNumber}%${subtypePctSign}`;
                    
                    const subtypeAnnualPctNumber = Math.abs(subtypeAnnualPercentageChange).toFixed(2);
                    const subtypeAnnualPctSign = subtypeAnnualPercentageChange < 0 ? '-' : '';
                    subtypeAnnualPercentageDisplay = `${subtypeAnnualPctNumber}%${subtypeAnnualPctSign}`;
                } else {
                    subtypePercentageDisplay = '0% (עתידי)';
                    subtypeAnnualPercentageDisplay = '0% (עתידי)';
                }
                
                // For "0% (עתידי)" - always use neutral light variant color
                const subtypePctClass = (subtypeAccountBalance > 0)
                    ? (subtypePercentageChange >= 0 ? 'text-success' : (subtypePercentageChange < 0 ? 'text-danger' : ''))
                    : ''; // Neutral (light variant) - no color class
                const subtypeAnnualPctClass = (subtypeAccountBalance > 0)
                    ? (subtypeAnnualPercentageChange >= 0 ? 'text-success' : (subtypeAnnualPercentageChange < 0 ? 'text-danger' : ''))
                    : ''; // Neutral (light variant) - no color class
                
                html += '<div class="statistics-card-content statistics-card-two-columns">';
                html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${subtypeAverageHtml}</strong> | <strong class="${subtypePctClass}">${subtypePercentageDisplay}</strong></div>`;
                html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${subtypeAnnualAmountChangeHtml}</strong> | <strong class="${subtypeAnnualPctClass}">${subtypeAnnualPercentageDisplay}</strong></div>`;
                html += '</div>';
                html += '</div>';
            } else if (!isExecution && subtypeStats.count > 0) {
                // Cash flows: Show average per action (same as executions)
                html += '<div class="statistics-card-item">';
                
                // Calculate average per action using absolute values (neutral - mixing positive and negative)
                // This gives average for this subtype - neutral color
                const subtypeAbsoluteTotal = Math.abs(subtypeStats.positiveAmount || 0) + Math.abs(subtypeStats.negativeAmount || 0);
                const subtypeAveragePerAction = subtypeStats.count > 0 ? subtypeAbsoluteTotal / subtypeStats.count : 0;
                
                // Display with neutral color (no positive/negative class, no sign)
                const subtypeFormatted = Math.abs(subtypeAveragePerAction).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                let subtypeAverageHtml = `<span>${subtypeFormatted}${currencySymbol}</span>`;
                
                // Check if we need to show breakdown (both positive and negative exist)
                const subtypeNegativeAmount = subtypeStats.negativeAmount || 0;
                const subtypePositiveAmount = subtypeStats.positiveAmount || 0;
                const hasBothSides = subtypeNegativeAmount !== 0 && subtypePositiveAmount !== 0;
                
                // If both sides exist, show breakdown for average per action
                if (hasBothSides) {
                    const subtypePositiveCount = subtypeStats.positiveCount || 0;
                    const subtypeNegativeCount = subtypeStats.negativeCount || 0;
                    
                    // Calculate average per action for positive and negative separately
                    const subtypePositiveAverage = subtypePositiveCount > 0 ? Math.abs(subtypePositiveAmount) / subtypePositiveCount : 0;
                    const subtypeNegativeAverage = subtypeNegativeCount > 0 ? Math.abs(subtypeNegativeAmount) / subtypeNegativeCount : 0;
                    
                    const subtypePositiveAverageFormatted = subtypePositiveAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    const subtypeNegativeAverageFormatted = subtypeNegativeAverage.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    
                    let subtypeNegativeAverageHtml;
                    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                        subtypeNegativeAverageHtml = window.FieldRendererService.renderAmount(-subtypeNegativeAverage, currencySymbol, 0, true);
                    } else {
                        subtypeNegativeAverageHtml = `<span class="text-danger">-${subtypeNegativeAverageFormatted}${currencySymbol}</span>`;
                    }
                    
                    let subtypePositiveAverageHtml;
                    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                        subtypePositiveAverageHtml = window.FieldRendererService.renderAmount(subtypePositiveAverage, currencySymbol, 0, true);
                    } else {
                        subtypePositiveAverageHtml = `<span class="text-success">+${subtypePositiveAverageFormatted}${currencySymbol}</span>`;
                    }
                    
                    subtypeAverageHtml = `${subtypeAverageHtml}<br>(${subtypeNegativeAverageHtml}/${subtypePositiveAverageHtml})`;
                }
                
                // Calculate annual amount estimate for subtype (use totalAmount, not amountChange)
                // IMPORTANT: Use the full date range (filter range) for consistency with overall stats
                let subtypeDaysForAnnual = 1;
                if (stats.dateRange && stats.dateRange.start && stats.dateRange.end) {
                    // Use the full filter date range (same as overall stats)
                    subtypeDaysForAnnual = Math.max(1, Math.ceil((stats.dateRange.end - stats.dateRange.start) / (1000 * 60 * 60 * 24)));
                } else if (subtypeStats.movements && subtypeStats.movements.length > 0) {
                    // Fallback: use period between records only if dateRange is not available
                    const firstMovement = subtypeStats.movements[0];
                    const lastMovement = subtypeStats.movements[subtypeStats.movements.length - 1];
                    if (firstMovement.date && lastMovement.date) {
                        subtypeDaysForAnnual = Math.max(1, Math.ceil((new Date(lastMovement.date) - new Date(firstMovement.date)) / (1000 * 60 * 60 * 24)));
                    }
                }
                // Use totalAmount (already normalized) instead of amountChange
                const subtypeAnnualAmountChange = (subtypeStats.totalAmount / subtypeDaysForAnnual) * 365;
                let subtypeAnnualAmountChangeHtml = window.FieldRendererService && window.FieldRendererService.renderAmount
                    ? window.FieldRendererService.renderAmount(subtypeAnnualAmountChange, currencySymbol, 0, true)
                    : `<span>${subtypeAnnualAmountChange >= 0 ? '+' : ''}${subtypeAnnualAmountChange.toFixed(0)}${currencySymbol}</span>`;
                
                // If both sides exist, show breakdown for annual estimate
                if (hasBothSides) {
                    const subtypePositiveAnnual = (subtypePositiveAmount / subtypeDaysForAnnual) * 365;
                    const subtypeNegativeAnnual = (subtypeNegativeAmount / subtypeDaysForAnnual) * 365;
                    
                    let subtypeNegativeAnnualHtml;
                    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                        subtypeNegativeAnnualHtml = window.FieldRendererService.renderAmount(subtypeNegativeAnnual, currencySymbol, 0, true);
                    } else {
                        subtypeNegativeAnnualHtml = `<span class="text-danger">${subtypeNegativeAnnual.toFixed(0)}${currencySymbol}</span>`;
                    }
                    
                    let subtypePositiveAnnualHtml;
                    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
                        subtypePositiveAnnualHtml = window.FieldRendererService.renderAmount(subtypePositiveAnnual, currencySymbol, 0, true);
                    } else {
                        subtypePositiveAnnualHtml = `<span class="text-success">${subtypePositiveAnnual >= 0 ? '+' : ''}${subtypePositiveAnnual.toFixed(0)}${currencySymbol}</span>`;
                    }
                    
                    subtypeAnnualAmountChangeHtml = `${subtypeAnnualAmountChangeHtml}<br>(${subtypeNegativeAnnualHtml}/${subtypePositiveAnnualHtml})`;
                }
                
                // TODO: Calculate percentage change as part of total account value (same as executions)
                // FIXME: Replace placeholder with actual calculation once account balance is available
                const subtypeAccountBalance = 0; // TODO: Get from account data
                let subtypePercentageChange = 0;
                let subtypeAnnualPercentageChange = 0;
                let subtypePercentageDisplay = '0%';
                let subtypeAnnualPercentageDisplay = '0%';
                
                if (subtypeAccountBalance > 0) {
                    // Use averagePerAction for percentage calculation
                    subtypePercentageChange = (subtypeAveragePerAction / Math.abs(subtypeAccountBalance)) * 100;
                    subtypeAnnualPercentageChange = (subtypeAnnualAmountChange / Math.abs(subtypeAccountBalance)) * 100;
                    
                    const subtypePctNumber = Math.abs(subtypePercentageChange).toFixed(2);
                    const subtypePctSign = subtypePercentageChange < 0 ? '-' : '';
                    subtypePercentageDisplay = `${subtypePctNumber}%${subtypePctSign}`;
                    
                    const subtypeAnnualPctNumber = Math.abs(subtypeAnnualPercentageChange).toFixed(2);
                    const subtypeAnnualPctSign = subtypeAnnualPercentageChange < 0 ? '-' : '';
                    subtypeAnnualPercentageDisplay = `${subtypeAnnualPctNumber}%${subtypeAnnualPctSign}`;
                } else {
                    subtypePercentageDisplay = '0% (עתידי)';
                    subtypeAnnualPercentageDisplay = '0% (עתידי)';
                }
                
                // For "0% (עתידי)" - always use neutral light variant color
                const subtypePctClass = (subtypeAccountBalance > 0)
                    ? (subtypePercentageChange >= 0 ? 'text-success' : (subtypePercentageChange < 0 ? 'text-danger' : ''))
                    : ''; // Neutral (light variant) - no color class
                const subtypeAnnualPctClass = (subtypeAccountBalance > 0)
                    ? (subtypeAnnualPercentageChange >= 0 ? 'text-success' : (subtypeAnnualPercentageChange < 0 ? 'text-danger' : ''))
                    : ''; // Neutral (light variant) - no color class
                
                html += '<div class="statistics-card-content statistics-card-two-columns">';
                html += `<div class="statistics-card-col">ממוצע לפעולה: <strong>${subtypeAverageHtml}</strong> | <strong class="${subtypePctClass}">${subtypePercentageDisplay}</strong></div>`;
                html += `<div class="statistics-card-col statistics-card-col-end">שנתי משוער: <strong>${subtypeAnnualAmountChangeHtml}</strong> | <strong class="${subtypeAnnualPctClass}">${subtypeAnnualPercentageDisplay}</strong></div>`;
                html += '</div>';
                html += '</div>';
            }
            
            html += '</div>'; // End statistics-subtype-group
        });
        
        html += '</div>'; // End statistics-breakdown
    }
    
    return html;
}

// Export function globally
window.updateActivityStatistics = updateActivityStatistics;

/**
 * Hook into filter system to update statistics when filters change
 */
function setupStatisticsFilterHook() {
    // Listen for filter changes via MutationObserver on table
    const table = document.getElementById('accountActivityTable');
    if (!table) return;
    
    // Create observer to watch for row visibility changes
    const observer = new MutationObserver(() => {
        // Debounce to avoid excessive updates
        clearTimeout(window.accountActivityState.statsUpdateTimeout);
        window.accountActivityState.statsUpdateTimeout = setTimeout(() => {
            if (window.updateActivityStatistics) {
                window.updateActivityStatistics();
            }
            // Also update activity summary to refresh date range in title
            if (window.accountActivityState && window.accountActivityState.activityData) {
                updateActivitySummary(window.accountActivityState.activityData);
            } else {
                updateActivitySummary(null);
            }
        }, 300);
    });
    
    // Observe changes in tbody
    const tbody = table.querySelector('tbody');
    if (tbody) {
        observer.observe(tbody, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'data-movement-type']
        });
    }
    
    // Also listen for header system filter application
    if (window.HeaderSystem && window.HeaderSystem.filterSystem) {
        const originalApplyFilters = window.HeaderSystem.filterSystem.applyFiltersToTable;
        if (originalApplyFilters) {
            window.HeaderSystem.filterSystem.applyFiltersToTable = function(tableId) {
                const result = originalApplyFilters.call(this, tableId);
                // If this is the account activity table, update statistics
                if (tableId === 'accountActivityTable') {
                    setTimeout(() => {
                        if (window.updateActivityStatistics) {
                            window.updateActivityStatistics();
                        }
                        // Also update activity summary to refresh date range in title
                        if (window.accountActivityState && window.accountActivityState.activityData) {
                            updateActivitySummary(window.accountActivityState.activityData);
                        } else {
                            updateActivitySummary(null);
                        }
                    }, 100);
                }
                return result;
            };
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (typeof window.initAccountActivity === 'function') {
                window.initAccountActivity();
            }
        }, 1000);
    });
} else {
    setTimeout(() => {
        if (typeof window.initAccountActivity === 'function') {
            window.initAccountActivity();
        }
    }, 1000);
}

// Export functions globally
window.loadAccountActivity = loadAccountActivity;
window.populateAccountSelector = populateAccountSelector;
window.populateAccountActivityTable = populateAccountActivityTable; // Export for UnifiedTableSystem

window.Logger.info('✅ account-activity.js נטען בהצלחה', { page: "trading_accounts" });

