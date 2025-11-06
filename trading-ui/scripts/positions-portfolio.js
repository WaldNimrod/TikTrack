/**
 * Positions & Portfolio System - TikTrack
 * ========================================
 * 
 * מערכת הצגת פוזיציות ופורטפוליו
 * 
 * תכונות:
 * - טבלת פוזיציות לפי חשבון מסחר
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
    portfolioData: null,
    summaryData: null,
    isLoading: false,
    summarySize: 'minimal' // 'minimal' or 'full'
};

/**
 * Initialize positions & portfolio system
 * @param {boolean} autoSelectDefault - Auto-select default account from preferences
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
    
    // Populate account selector when accounts are loaded
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        await populatePositionsAccountSelector(autoSelectDefault);
    }
    
    // Setup event listeners
    const positionsSelector = document.getElementById('positionsAccountSelector');
    if (positionsSelector) {
        positionsSelector.addEventListener('change', handlePositionsAccountSelection);
    }
    
    // Populate portfolio account selector
    await populatePortfolioAccountSelector();
    
    // Setup portfolio filters
    setupPortfolioFilters();
    
    // Setup summary toggle
    setupSummaryToggle();
    
    // Listen for account data updates
    if (window.addEventListener) {
        window.addEventListener('accountsLoaded', async () => {
            await populatePositionsAccountSelector(true);
            await populatePortfolioAccountSelector();
        });
    }
    
    // Load portfolio on init (if no account selector dependency)
    await loadPortfolio();
    await loadPortfolioSummary();
};

/**
 * Populate positions account selector dropdown
 * @param {boolean} autoSelectDefault - Auto-select default account from preferences
 */
async function populatePositionsAccountSelector(autoSelectDefault = false) {
    const selector = document.getElementById('positionsAccountSelector');
    if (!selector) return;
    
    // Clear existing options (except first)
    while (selector.options.length > 1) {
        selector.remove(1);
    }
    
    // Add accounts - reuse logic from account-activity.js
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        window.trading_accountsData.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name || `חשבון מסחר ${account.id}`;
            selector.appendChild(option);
        });
    }
    
    window.Logger.info(`✅ Positions account selector populated with ${selector.options.length - 1} accounts`, { page: "trading_accounts" });
    
    // Auto-select default account from preferences (same logic as account-activity)
    if (autoSelectDefault && selector.options.length > 1) {
        const currentValue = selector.value;
        if (!currentValue || currentValue === '') {
            try {
                let defaultAccountId = null;
                
                if (typeof window.getPreference === 'function') {
                    const prefValue = await window.getPreference('default_trading_account');
                    
                    if (prefValue) {
                        const parsed = parseInt(prefValue);
                        if (!isNaN(parsed)) {
                            defaultAccountId = parsed;
                        } else {
                            const account = window.trading_accountsData.find(acc => acc.name === prefValue);
                            if (account) {
                                defaultAccountId = account.id;
                            }
                        }
                    }
                }
                
                if (!defaultAccountId || !selector.querySelector(`option[value="${defaultAccountId}"]`)) {
                    defaultAccountId = selector.options[1].value;
                }
                
                selector.value = defaultAccountId;
                handlePositionsAccountSelection({ target: selector });
            } catch (error) {
                window.Logger.error('❌ Error getting default account:', error, { page: "trading_accounts" });
                const firstAccountId = selector.options[1].value;
                selector.value = firstAccountId;
                handlePositionsAccountSelection({ target: selector });
            }
        }
    }
}

/**
 * Handle positions account selection change
 */
async function handlePositionsAccountSelection(event) {
    const accountId = parseInt(event.target.value);
    
    if (!accountId || isNaN(accountId)) {
        clearPositionsTable();
        return;
    }
    
    window.positionsPortfolioState.selectedAccountId = accountId;
    
    // Show section body
    const sectionBody = document.querySelector('[data-section="positions-portfolio"] .section-body');
    if (sectionBody) {
        sectionBody.style.display = 'block';
    }
    
    // Load positions for selected account
    await loadAccountPositions(accountId);
}

/**
 * Load account positions from API with cache
 * @param {number} accountId - Trading account ID
 */
async function loadAccountPositions(accountId) {
    if (!accountId) return;
    
    window.positionsPortfolioState.isLoading = true;
    const tableBody = document.querySelector('#positionsTable tbody');
    
    try {
        // Show loading state
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" class="loading">טוען פוזיציות...</td></tr>';
        }
        
        // Cache key
        const cacheKey = `positions-account-${accountId}`;
        
        // Load from cache or API
        const data = await window.UnifiedCacheManager.get(cacheKey, {
            fallback: async () => {
                const response = await fetch(`/api/positions/account/${accountId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    return result.data.positions || [];
                }
                return [];
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        window.positionsPortfolioState.positionsData = data;
        
        // Calculate totals - sum of all market values
        const totalPositionsValue = data.reduce((sum, p) => sum + (p.market_value || 0), 0);
        
        // Get account cash balance for total account value
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
            window.Logger.warn('Error getting account balance:', e, { page: "trading_accounts" });
        }
        
        // Update count and totals
        const countTextElement = document.getElementById('positionsCountText');
        const separatorElement = document.getElementById('positionsSeparator');
        const totalValueElement = document.getElementById('positionsTotalValue');
        const totalValueAmountElement = document.getElementById('positionsTotalValueAmount');
        const separator2Element = document.getElementById('positionsSeparator2');
        const accountTotalElement = document.getElementById('positionsAccountTotalValue');
        const accountTotalAmountElement = document.getElementById('positionsAccountTotalValueAmount');
        
        if (countTextElement) {
            countTextElement.textContent = `${data.length} פוזיציות`;
        }
        
        // Show/hide elements based on data availability
        if (data.length > 0) {
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
        
        // Store data in state for sorting
        window.positionsPortfolioState.positionsData = data;
        
        // Render table
        renderPositionsTable(data);
        
    } catch (error) {
        window.Logger.error('❌ Error loading account positions:', error, { page: "trading_accounts" });
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" class="error">שגיאה בטעינת פוזיציות</td></tr>';
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
 * Render positions table
 * @param {Array} positions - Array of position objects
 */
function renderPositionsTable(positions) {
    const tableBody = document.querySelector('#positionsTable tbody');
    if (!tableBody) return;
    
    // Update state with sorted data
    if (positions && Array.isArray(positions)) {
        window.positionsPortfolioState.positionsData = positions;
    }
    
    // If no positions provided, try to get from state
    if (!positions || positions.length === 0) {
        positions = window.positionsPortfolioState.positionsData || [];
    }
    
    if (!positions || positions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="empty">אין פוזיציות להצגה</td></tr>';
        return;
    }
    
    // Use FieldRendererService for consistent rendering
    const FieldRenderer = window.FieldRendererService;
    
    let html = '';
    positions.forEach(position => {
        const side = position.side || 'closed';
        const quantity = position.quantity || 0;
        const marketValue = position.market_value || 0;
        const unrealizedPl = position.unrealized_pl || 0;
        const unrealizedPlPercent = position.unrealized_pl_percent || 0;
        const percentAccount = position.percent_of_account || 0;
        
        // Render ticker info using FieldRendererService
        let tickerHtml = `<strong>${position.ticker_symbol || 'N/A'}</strong>`;
        if (position.ticker_name) {
            tickerHtml += `<br><small>${position.ticker_name}</small>`;
        }
        if (FieldRenderer && FieldRenderer.renderTickerInfo) {
            try {
                tickerHtml = FieldRenderer.renderTickerInfo({
                    symbol: position.ticker_symbol,
                    name: position.ticker_name,
                    current_price: position.market_price,
                    daily_change: null, // Not available in position data
                    daily_change_percent: null
                }, 'ticker-info-compact');
            } catch (e) {
                window.Logger.warn('Error rendering ticker info:', e, { page: "trading_accounts" });
            }
        }
        
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
        
        html += `
            <tr data-position-id="${position.ticker_id}" data-account-id="${position.trading_account_id}">
                <td class="col-symbol"><strong>${tickerLink}</strong></td>
                <td class="col-ticker">${tickerHtml}</td>
                <td class="col-quantity">${quantityDisplay}</td>
                <td class="col-side">${sideHtml}</td>
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
                <td class="col-percent-account">
                    ${percentAccount.toFixed(2)}%
                </td>
                <td class="col-actions actions-cell">
                    <button class="btn btn-sm btn-outline-primary" onclick="showPositionDetails(${position.trading_account_id}, ${position.ticker_id})" title="פרטים">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * Populate portfolio account selector dropdown
 */
async function populatePortfolioAccountSelector() {
    const selector = document.getElementById('portfolioAccountFilter');
    if (!selector) return;
    
    // Clear existing options (except first)
    while (selector.options.length > 1) {
        selector.remove(1);
    }
    
    // Add accounts - reuse logic from positions selector
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        window.trading_accountsData.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = account.name || `חשבון מסחר ${account.id}`;
            selector.appendChild(option);
        });
    }
    
    window.Logger.info(`✅ Portfolio account selector populated with ${selector.options.length - 1} accounts`, { page: "trading_accounts" });
}

/**
 * Setup portfolio filters
 */
function setupPortfolioFilters() {
    const accountFilter = document.getElementById('portfolioAccountFilter');
    const sideFilter = document.getElementById('portfolioSideFilter');
    const includeClosed = document.getElementById('portfolioIncludeClosed');
    const unifyAccounts = document.getElementById('portfolioUnifyAccounts');
    
    if (accountFilter) {
        accountFilter.addEventListener('change', () => loadPortfolio());
    }
    
    if (sideFilter) {
        sideFilter.addEventListener('change', () => loadPortfolio());
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
            tableBody.innerHTML = '<tr><td colspan="10" class="loading">טוען פורטפוליו...</td></tr>';
        }
        
        // Get filter values
        const accountFilter = document.getElementById('portfolioAccountFilter')?.value || '';
        const sideFilter = document.getElementById('portfolioSideFilter')?.value || '';
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
        const data = await window.UnifiedCacheManager.get(cacheKey, {
            fallback: async () => {
                const response = await fetch(`/api/positions/portfolio?${params.toString()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    return result.data;
                }
                return { positions: [], summary: {} };
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        window.positionsPortfolioState.portfolioData = data;
        
        // Update count
        const countElement = document.getElementById('portfolioCount');
        if (countElement) {
            countElement.textContent = `${data.summary?.total_positions || 0} פוזיציות`;
        }
        
        // Render table
        renderPortfolioTable(data.positions || []);
        
    } catch (error) {
        window.Logger.error('❌ Error loading portfolio:', error, { page: "trading_accounts" });
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="10" class="error">שגיאה בטעינת פורטפוליו</td></tr>';
        }
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה בטעינת פורטפוליו. אנא נסה שוב.');
        }
    } finally {
        window.positionsPortfolioState.isLoading = false;
    }
}

/**
 * Render portfolio table
 * @param {Array} positions - Array of position objects
 */
function renderPortfolioTable(positions) {
    const tableBody = document.querySelector('#portfolioTable tbody');
    if (!tableBody) return;
    
    // Update state with sorted data
    if (positions && Array.isArray(positions)) {
        if (!window.positionsPortfolioState.portfolioData) {
            window.positionsPortfolioState.portfolioData = {};
        }
        window.positionsPortfolioState.portfolioData.positions = positions;
    }
    
    // If no positions provided, try to get from state
    if (!positions || positions.length === 0) {
        positions = window.positionsPortfolioState.portfolioData?.positions || [];
    }
    
    if (!positions || positions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="empty">אין פוזיציות להצגה</td></tr>';
        return;
    }
    
    const FieldRenderer = window.FieldRendererService;
    
    let html = '';
    positions.forEach(position => {
        const side = position.side || 'closed';
        const quantity = position.quantity || 0;
        const marketValue = position.market_value || 0;
        const unrealizedPl = position.unrealized_pl || 0;
        const unrealizedPlPercent = position.unrealized_pl_percent || 0;
        const percentPortfolio = position.percent_of_portfolio || 0;
        
        // Render ticker info using FieldRendererService
        let tickerHtml = `<strong>${position.ticker_symbol || 'N/A'}</strong>`;
        if (FieldRenderer && FieldRenderer.renderTickerInfo) {
            try {
                tickerHtml = FieldRenderer.renderTickerInfo({
                    symbol: position.ticker_symbol,
                    name: position.ticker_name,
                    current_price: position.market_price,
                    daily_change: null,
                    daily_change_percent: null
                }, 'ticker-info-compact');
            } catch (e) {
                window.Logger.warn('Error rendering ticker info:', e, { page: "trading_accounts" });
            }
        }
        
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
        
        html += `
            <tr data-position-id="${position.ticker_id}" data-account-id="${position.trading_account_id}">
                <td class="col-account">${position.account_name || 'N/A'}</td>
                <td class="col-symbol"><strong>${tickerLink}</strong></td>
                <td class="col-ticker">${tickerHtml}</td>
                <td class="col-quantity">${quantityDisplay}</td>
                <td class="col-side">${sideHtml}</td>
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
                <td class="col-percent-portfolio">
                    ${percentPortfolio.toFixed(2)}%
                </td>
                <td class="col-actions actions-cell">
                    <button class="btn btn-sm btn-outline-primary" onclick="showPositionDetails(${position.trading_account_id}, ${position.ticker_id})" title="פרטים">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * Setup summary toggle
 */
function setupSummaryToggle() {
    const toggleBtn = document.getElementById('portfolioSummaryToggleSize');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentSize = window.positionsPortfolioState.summarySize;
            const newSize = currentSize === 'minimal' ? 'full' : 'minimal';
            window.positionsPortfolioState.summarySize = newSize;
            toggleBtn.textContent = newSize === 'minimal' ? 'הצג מלא' : 'הצג מינימאלי';
            loadPortfolioSummary();
        });
    }
}

/**
 * Load portfolio summary
 */
async function loadPortfolioSummary() {
    const summaryElement = document.getElementById('portfolioSummaryStats');
    if (!summaryElement) return;
    
    try {
        summaryElement.innerHTML = '<div>טוען סיכום...</div>';
        
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
                return { summary: {} };
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        window.positionsPortfolioState.summaryData = data;
        
        // Render summary (summary is already calculated object, not array)
        renderPortfolioSummaryFallback(data.summary, size);
        
    } catch (error) {
        window.Logger.error('❌ Error loading portfolio summary:', error, { page: "trading_accounts" });
        if (summaryElement) {
            summaryElement.innerHTML = '<div class="error">שגיאה בטעינת סיכום</div>';
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
    
    if (size === 'minimal') {
        summaryElement.innerHTML = `
            <div>סה"כ פוזיציות: <strong>${totalPositions}</strong></div>
            <div>שווי שוק כולל: <strong>${formatCurrencyHebrew(totalMarketValue, false, true)}</strong></div>
            <div>רווח/הפסד כולל: <strong class="${totalPl >= 0 ? 'text-success' : 'text-danger'}">${formatCurrencyHebrew(totalPl, true, true)} (${totalPlPercent.toFixed(2)}%${totalPlPercent >= 0 ? '+' : '-'})</strong></div>
        `;
    } else {
        summaryElement.innerHTML = `
            <div class="info-summary-full">
                <div>סה"כ פוזיציות: <strong>${totalPositions}</strong></div>
                <div>שווי שוק כולל: <strong>${formatCurrencyHebrew(totalMarketValue, false, true)}</strong></div>
                <div>עלות כוללת: <strong>${formatCurrencyHebrew(totalCost, false, false)}</strong></div>
                <div>רווח/הפסד מוכר: <strong>${formatCurrencyHebrew(summary.total_realized_pl || 0, true, true)}</strong></div>
                <div>רווח/הפסד לא מוכר: <strong>${formatCurrencyHebrew(summary.total_unrealized_pl || 0, true, true)}</strong></div>
                <div>רווח/הפסד כולל: <strong class="${totalPl >= 0 ? 'text-success' : 'text-danger'}">${formatCurrencyHebrew(totalPl, true, true)} (${totalPlPercent.toFixed(2)}%${totalPlPercent >= 0 ? '+' : '-'})</strong></div>
                <div>סה"כ עמלות: <strong>${formatCurrencyHebrew(summary.total_fees || 0, false, false)}</strong></div>
            </div>
        `;
    }
}

/**
 * Show position details modal
 * @param {number} accountId - Trading account ID
 * @param {number} tickerId - Ticker ID
 */
window.showPositionDetails = async function(accountId, tickerId) {
    try {
        // Load position details from API
        const cacheKey = `position-details-${accountId}-${tickerId}`;
        
        const positionData = await window.UnifiedCacheManager.get(cacheKey, {
            fallback: async () => {
                const response = await fetch(`/api/positions/${accountId}/${tickerId}/details`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success' && result.data) {
                    return result.data;
                }
                return null;
            },
            ttl: 300000, // 5 minutes
            dependencies: ['executions', 'market_data_quotes']
        });
        
        if (!positionData) {
            if (window.showErrorNotification) {
                window.showErrorNotification('שגיאה', 'פוזיציה לא נמצאה.');
            }
            return;
        }
        
        // Use showDetailsModal for position details with custom title and close button
        const modalTitle = `פרטי פוזיציה - ${positionData.ticker_symbol || tickerId}`;
        const content = renderPositionDetailsContent(positionData, tickerId);
        
        // Get entity colors for trade
        const tradeColor = window.getEntityColor ? window.getEntityColor('trade') : '#007bff';
        const tradeBgColor = window.getEntityBackgroundColor ? window.getEntityBackgroundColor('trade') : 'rgba(0, 123, 255, 0.1)';
        
        // Create custom modal HTML with close button in header
        const modalId = 'positionDetailsModal';
        const modalHTML = `
            <div class="modal fade entity-trade-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true" data-bs-backdrop="true" data-bs-keyboard="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content" style="border: 2px solid ${tradeColor};">
                        <div class="modal-header" style="background-color: ${tradeBgColor}; border-bottom: 2px solid ${tradeColor};">
                            <h5 class="modal-title" id="${modalId}Label" style="color: ${tradeColor}; font-weight: bold;">${modalTitle}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="סגור" style="margin-inline-start: auto;"></button>
                        </div>
                        <div class="modal-body" style="background-color: ${tradeBgColor};">
                            ${content}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if exists
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true
            });
            modal.show();
            
            // Clean up on close
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
            }, { once: true });
        } else {
            // Last resort - notification
            const FieldRenderer = window.FieldRendererService;
            const sideHtml = FieldRenderer && FieldRenderer.renderSide ? 
                FieldRenderer.renderSide(positionData.side) : 
                positionData.side;
            
            window.showInfoNotification('פרטי פוזיציה', 
                `חשבון מסחר: ${positionData.account_name || accountId}\n` +
                `טיקר: ${positionData.ticker_symbol || tickerId}\n` +
                `כמות: ${Math.abs(positionData.quantity || 0)}\n` +
                `צד: ${sideHtml}\n` +
                `מחיר ממוצע: $${(positionData.average_price_net || 0).toFixed(2)}\n` +
                `שווי שוק: ${positionData.market_value ? `$${positionData.market_value.toFixed(2)}` : 'לא זמין'}\n` +
                `ביצועים: ${positionData.executions?.length || 0}`
            );
        }
    } catch (error) {
        window.Logger.error('❌ Error showing position details:', error, { page: "trading_accounts" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', 'שגיאה בטעינת פרטי פוזיציה.');
        }
    }
};

/**
 * Render position details content for modal
 * @param {Object} positionData - Position data from API
 * @param {number} tickerId - Ticker ID for link
 * @returns {string} HTML content
 */
function renderPositionDetailsContent(positionData, tickerId) {
    const FieldRenderer = window.FieldRendererService;
    
    // Render side
    const sideHtml = FieldRenderer && FieldRenderer.renderSide ? 
        FieldRenderer.renderSide(positionData.side) : 
        `<span class="badge badge-${positionData.side}">${positionData.side === 'long' ? 'לונג' : positionData.side === 'short' ? 'שורט' : 'סגור'}</span>`;
    
    // Render quantity with # and sign
    const quantity = positionData.quantity || 0;
    const quantitySign = quantity > 0 ? '+' : quantity < 0 ? '-' : '';
    const quantityClass = quantity > 0 ? 'text-success' : quantity < 0 ? 'text-danger' : '';
    const quantityHtml = `<span class="${quantityClass}">#${quantitySign}${Math.abs(quantity).toLocaleString()}</span>`;
    
    // Ticker symbol as link to ticker details
    const tickerSymbolLink = tickerId ? 
        `<a href="#" onclick="if (typeof window.showEntityDetails === 'function') { window.showEntityDetails('ticker', ${tickerId}, { mode: 'view' }); return false; }" class="entity-trade-link">${positionData.ticker_symbol || 'N/A'}</a>` :
        positionData.ticker_symbol || 'N/A';
    
    // Get entity colors for trade
    const tradeColor = window.getEntityColor ? window.getEntityColor('trade') : '#007bff';
    const tradeBgColor = window.getEntityBackgroundColor ? window.getEntityBackgroundColor('trade') : 'rgba(0, 123, 255, 0.1)';
    const tradeBorderColor = window.getEntityBorderColor ? window.getEntityBorderColor('trade') : 'rgba(0, 123, 255, 0.3)';
    
    // Format currency with RTL support
    const formatCurrency = (value, showSign = false) => {
        if (value === null || value === undefined || isNaN(value)) return 'לא זמין';
        const numValue = parseFloat(value);
        const absValue = Math.abs(numValue);
        const formatted = absValue.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const sign = showSign ? (numValue >= 0 ? '+' : '-') : (numValue < 0 ? '-' : '');
        return `$${formatted}${sign}`;
    };
    
    let html = `
        <div class="position-details-content entity-trade-modal" style="background-color: ${tradeBgColor}; border: 1px solid ${tradeBorderColor}; border-radius: 8px; padding: 1.5rem;">
            <!-- Header row: Symbol | Side | Account -->
            <div class="row mb-3 pb-3" style="border-bottom: 2px solid ${tradeBorderColor};">
                <div class="col-12 d-flex justify-content-between align-items-center">
                    <div style="color: ${tradeColor}; font-weight: bold; font-size: 1.2rem;">
                        ${tickerSymbolLink}
                    </div>
                    <div>
                        ${sideHtml}
                    </div>
                    <div style="color: ${tradeColor}; font-weight: 500;">
                        ${positionData.account_name || 'N/A'}
                    </div>
                </div>
            </div>
            
            <!-- Two columns layout -->
            <div class="row">
                <!-- Column 1 -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <strong>כמות:</strong> ${quantityHtml}
                    </div>
                    <div class="mb-3">
                        <strong>מחיר ממוצע:</strong> 
                        $${(positionData.average_price_gross || 0).toFixed(2)} 
                        <span style="color: #6c757d; font-size: 0.9em;">(${(positionData.average_price_net || 0).toFixed(2)} נטו)</span>
                    </div>
                    <div class="mb-3">
                        <strong>סה"כ עלות:</strong> 
                        ${formatCurrency(positionData.current_position_cost || 0)}
                    </div>
                    <div class="mb-3">
                        <strong>שווי שוק:</strong> 
                        ${positionData.market_value ? formatCurrency(positionData.market_value, false) : 'לא זמין'}
                    </div>
                    <div class="mb-3">
                        <strong>אחוז מחשבון המסחר:</strong> 
                        ${(positionData.percent_of_account || 0).toFixed(2)}%
                    </div>
                </div>
                
                <!-- Column 2 -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <strong>P/L:</strong> 
                        <span class="${(positionData.unrealized_pl || 0) >= 0 ? 'text-success' : 'text-danger'}">
                            ${formatCurrency(positionData.unrealized_pl || 0, true)}
                            ${positionData.unrealized_pl_percent ? `(${positionData.unrealized_pl_percent >= 0 ? '+' : ''}${positionData.unrealized_pl_percent.toFixed(2)}%)` : ''}
                        </span>
                    </div>
                    <div class="mb-3">
                        <strong>Rez. P/L:</strong> 
                        <span class="${(positionData.realized_pl || 0) >= 0 ? 'text-success' : 'text-danger'}">
                            ${formatCurrency(positionData.realized_pl || 0, true)}
                            ${positionData.realized_pl_percent ? `(${positionData.realized_pl_percent >= 0 ? '+' : ''}${positionData.realized_pl_percent.toFixed(2)}%)` : ''}
                        </span>
                    </div>
                    <div class="mb-3">
                        <strong>סה"כ P/L:</strong> 
                        <span class="${((positionData.unrealized_pl || 0) + (positionData.realized_pl || 0) >= 0 ? 'text-success' : 'text-danger')}">
                            ${formatCurrency((positionData.unrealized_pl || 0) + (positionData.realized_pl || 0), true)}
                        </span>
                    </div>
                    <div class="mb-3">
                        <strong>סה"כ קניות:</strong> 
                        ${(positionData.total_bought_quantity || 0).toLocaleString()} יחידות - ${formatCurrency(positionData.total_bought_amount || 0)}
                    </div>
                    <div class="mb-3">
                        <strong>סה"כ מכירות:</strong> 
                        ${(positionData.total_sold_quantity || 0).toLocaleString()} יחידות - ${formatCurrency(positionData.total_sold_amount || 0)}
                    </div>
                    <div class="mb-3">
                        <strong>עמלות:</strong> 
                        ${formatCurrency(positionData.total_fees || 0)}
                    </div>
                </div>
            </div>
    `;
    
    // Add executions table with sortable headers if available
    if (positionData.executions && positionData.executions.length > 0) {
        html += `
            <div class="row mt-4">
                <div class="col-12">
                    <h5 style="color: ${tradeColor}; margin-bottom: 1rem;">ביצועים (${positionData.executions.length})</h5>
                    <div class="table-responsive">
                        <table class="table table-sm" id="positionExecutionsTable" data-table-type="position_executions">
                            <thead>
                                <tr>
                                    <th>
                                        <button class="btn btn-link sortable-header" onclick="if (typeof window.sortTableData === 'function') { window.sortTableData(0, window.positionExecutionsData || [], 'position_executions', updatePositionExecutionsTable); }">תאריך <span class="sort-icon">↕</span></button>
                                    </th>
                                    <th>
                                        <button class="btn btn-link sortable-header" onclick="if (typeof window.sortTableData === 'function') { window.sortTableData(1, window.positionExecutionsData || [], 'position_executions', updatePositionExecutionsTable); }">פעולה <span class="sort-icon">↕</span></button>
                                    </th>
                                    <th>
                                        <button class="btn btn-link sortable-header" onclick="if (typeof window.sortTableData === 'function') { window.sortTableData(2, window.positionExecutionsData || [], 'position_executions', updatePositionExecutionsTable); }">כמות <span class="sort-icon">↕</span></button>
                                    </th>
                                    <th>
                                        <button class="btn btn-link sortable-header" onclick="if (typeof window.sortTableData === 'function') { window.sortTableData(3, window.positionExecutionsData || [], 'position_executions', updatePositionExecutionsTable); }">מחיר <span class="sort-icon">↕</span></button>
                                    </th>
                                    <th>
                                        <button class="btn btn-link sortable-header" onclick="if (typeof window.sortTableData === 'function') { window.sortTableData(4, window.positionExecutionsData || [], 'position_executions', updatePositionExecutionsTable); }">עמלה <span class="sort-icon">↕</span></button>
                                    </th>
                                    <th>
                                        <button class="btn btn-link sortable-header" onclick="if (typeof window.sortTableData === 'function') { window.sortTableData(5, window.positionExecutionsData || [], 'position_executions', updatePositionExecutionsTable); }">סה"כ <span class="sort-icon">↕</span></button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
        `;
        
        // Store executions data for sorting
        window.positionExecutionsData = positionData.executions.map(exec => ({
            ...exec,
            date: exec.date || exec.execution_date || exec.created_at,
            total: (exec.quantity * exec.price) + (exec.fee || 0)
        }));
        
        window.positionExecutionsData.forEach(execution => {
            const action = execution.action === 'buy' ? 'קניה' : 'מכירה';
            const actionClass = execution.action === 'buy' ? 'text-success' : 'text-danger';
            const total = execution.total || ((execution.quantity * execution.price) + (execution.fee || 0));
            
            html += `
                <tr>
                    <td>${execution.date ? new Date(execution.date).toLocaleDateString('he-IL') : 'N/A'}</td>
                    <td><span class="${actionClass}">${action}</span></td>
                    <td>#${execution.quantity > 0 ? '+' : ''}${execution.quantity.toLocaleString()}</td>
                    <td>$${execution.price.toFixed(2)}</td>
                    <td>$${(execution.fee || 0).toFixed(2)}</td>
                    <td>$${total.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    return html;
}

/**
 * Update position executions table (for sorting)
 * @param {Array} executions - Sorted executions array
 */
function updatePositionExecutionsTable(executions) {
    const tableBody = document.querySelector('#positionExecutionsTable tbody');
    if (!tableBody) return;
    
    if (!executions || executions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty">אין ביצועים להצגה</td></tr>';
        return;
    }
    
    let html = '';
    executions.forEach(execution => {
        const action = execution.action === 'buy' ? 'קניה' : 'מכירה';
        const actionClass = execution.action === 'buy' ? 'text-success' : 'text-danger';
        const total = execution.total || ((execution.quantity * execution.price) + (execution.fee || 0));
        
        html += `
            <tr>
                <td>${execution.date ? new Date(execution.date).toLocaleDateString('he-IL') : 'N/A'}</td>
                <td><span class="${actionClass}">${action}</span></td>
                <td>#${execution.quantity > 0 ? '+' : ''}${execution.quantity.toLocaleString()}</td>
                <td>$${execution.price.toFixed(2)}</td>
                <td>$${(execution.fee || 0).toFixed(2)}</td>
                <td>$${total.toFixed(2)}</td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * Clear positions table
 */
function clearPositionsTable() {
    const tableBody = document.querySelector('#positionsTable tbody');
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="9" class="loading">בחר חשבון מסחר להצגת פוזיציות...</td></tr>';
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

window.Logger.info('✅ Positions & Portfolio System loaded', { page: "trading_accounts" });
