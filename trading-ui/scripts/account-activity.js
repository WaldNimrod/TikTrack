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
    
    // Show section body
    const sectionBody = document.querySelector('[data-section="account-activity"] .section-body');
    if (sectionBody) {
        sectionBody.style.display = 'block';
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
        
        // Check cache first
        const cacheKey = `account-activity-${accountId}`;
        if (window.UnifiedCacheManager) {
            const cached = await window.UnifiedCacheManager.get(cacheKey);
            if (cached) {
                window.Logger.info('✅ נתונים מהמטמון', { page: "trading_accounts" });
                window.accountActivityState.activityData = cached;
                populateAccountActivityTable(cached);
                updateActivitySummary(cached);
                window.accountActivityState.isLoading = false;
                return;
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
    data.currencies.forEach(currency => {
        currency.movements.forEach(movement => {
            allMovements.push({
                ...movement,
                currency_id: currency.currency_id,
                currency_symbol: currency.currency_symbol
            });
        });
        runningBalances[currency.currency_id] = currency.balance || 0;
    });
    
    // Sort by date (oldest first for balance calculation)
    allMovements.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
    });
    
    // Calculate running balances (starting from balance and working backwards)
    // We need to reverse the calculation
    const balancesByMovement = {};
    for (let i = allMovements.length - 1; i >= 0; i--) {
        const movement = allMovements[i];
        balancesByMovement[movement.id] = runningBalances[movement.currency_id];
        runningBalances[movement.currency_id] -= movement.amount;
    }
    
    // Now sort newest first for display
    allMovements.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });
    
    // Render rows
    allMovements.forEach(movement => {
        const row = renderMovementRow(movement, balancesByMovement[movement.id]);
        tbody.appendChild(row);
    });
    
    // Update footer with currency balances
    updateCurrencyBalancesFooter(data);
    
    window.Logger.info(`✅ טבלה עודכנה עם ${allMovements.length} תנועות`, { page: "trading_accounts" });
}

/**
 * Render a single movement row using FieldRendererService
 */
function renderMovementRow(movement, runningBalance) {
    const row = document.createElement('tr');
    
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
    typeCell.textContent = movement.type === 'cash_flow' ? 'תזרים מזומנים' : 'ביצוע';
    row.appendChild(typeCell);
    
    // Sub-type - using FieldRendererService.renderType for cash flows or renderAction for executions
    const subtypeCell = document.createElement('td');
    subtypeCell.className = 'col-subtype';
    // שמירת תת-סוג באנגלית לפילטר (יכול להיות רלוונטי לפילטר סוג)
    const subTypeValue = movement.sub_type || movement.subtype || movement.action || '';
    subtypeCell.setAttribute('data-type', subTypeValue);
    if (movement.type === 'cash_flow') {
        // Use renderType for cash flow subtypes (deposit, withdrawal, fee, etc.)
        if (window.FieldRendererService && window.FieldRendererService.renderType) {
            subtypeCell.innerHTML = window.FieldRendererService.renderType(movement.sub_type || movement.subtype, movement.amount);
        } else {
            subtypeCell.textContent = getSubtypeDisplay(movement.sub_type || movement.subtype);
        }
    } else {
        // Use renderAction for execution actions (buy/sell)
        if (window.FieldRendererService && window.FieldRendererService.renderAction) {
            subtypeCell.innerHTML = window.FieldRendererService.renderAction(movement.sub_type || movement.subtype || movement.action);
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
    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        amountCell.innerHTML = window.FieldRendererService.renderAmount(movement.amount, currencySymbol, 2);
    } else {
        amountCell.textContent = formatAmount(movement.amount);
        if (movement.amount < 0) {
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
        balanceCell.innerHTML = window.FieldRendererService.renderAmount(runningBalance || 0, currencySymbol, 2);
    } else {
        balanceCell.textContent = formatAmount(runningBalance || 0);
        balanceCell.textContent += ' ' + currencySymbol;
    }
    row.appendChild(balanceCell);
    
    // Actions - simple details button (square button: width equals height)
    const actionsCell = document.createElement('td');
    actionsCell.className = 'col-actions actions-cell';
    actionsCell.innerHTML = `
        <button class="btn btn-sm" onclick="openMovementDetails(${movement.id}, '${movement.type}')" title="פרטים" style="width: 2.5em; height: 2.5em; padding: 0; display: inline-flex; align-items: center; justify-content: center;">
            👁️
        </button>
    `;
    row.appendChild(actionsCell);
    
    return row;
}

/**
 * Update activity summary
 */
function updateActivitySummary(data) {
    const tableCount = document.getElementById('accountActivityCount');
    
    if (tableCount) {
        const count = data.currencies.reduce((sum, curr) => sum + (curr.movements?.length || 0), 0);
        const currencies = data.currencies?.length || 0;
        tableCount.textContent = `${count} תנועות ב-${currencies} מטבעות`;
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
            summaryHTML += `<div><strong>${symbol}:</strong> ${window.FieldRendererService.renderAmount(balance, symbol, 2)}</div>`;
        } else {
            summaryHTML += `<div><strong>${symbol}:</strong> ${formatAmount(balance)}</div>`;
        }
    });
    summaryCell.innerHTML = summaryHTML;
    
    // Base currency total using FieldRendererService
    const baseSymbol = getCurrencySymbol(data.base_currency || 'USD');
    if (window.FieldRendererService && window.FieldRendererService.renderAmount) {
        baseTotalCell.innerHTML = `<strong>${window.FieldRendererService.renderAmount(data.base_currency_total || 0, baseSymbol, 2)}</strong>`;
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
        tbody.innerHTML = '<tr><td colspan="8" class="loading">בחר חשבון להצגת תנועות...</td></tr>';
    }
    
    const footer = document.getElementById('accountActivityFooter');
    if (footer) {
        footer.style.display = 'none';
    }
    
    const tableCount = document.getElementById('accountActivityCount');
    if (tableCount) {
        tableCount.textContent = 'בחר חשבון...';
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
        'deposit': 'הפקדה',
        'withdrawal': 'משיכה',
        'transfer': 'העברה',
        'fee': 'עמלה',
        'dividend': 'דיבידנד',
        'interest': 'ריבית',
        'buy': 'קנייה',
        'sell': 'מכירה',
        'sale': 'מכירה'
    };
    
    return translations[subtype] || subtype || '-';
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

window.Logger.info('✅ account-activity.js נטען בהצלחה', { page: "trading_accounts" });

