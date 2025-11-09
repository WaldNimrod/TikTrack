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
    portfolioData: null,
    summaryData: null,
    isLoading: false,
    summarySize: 'minimal' // 'minimal' or 'full'
};

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
                
                if (typeof window.getPreference === 'function') {
                    const prefValue = await window.getPreference('default_trading_account');
                    
                    if (prefValue) {
                        const parsed = parseInt(prefValue);
                        if (!isNaN(parsed)) {
                            defaultAccountId = parsed;
                        } else {
                            const tradingAccount = window.trading_accountsData.find(acc => acc.name === prefValue);
                            if (tradingAccount) {
                                defaultAccountId = tradingAccount.id;
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
                window.Logger.error('❌ Error getting default trading account:', error, { page: "trading_accounts" });
                const firstAccountId = selector.options[1].value;
                selector.value = firstAccountId;
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
    const sectionBody = document.querySelector('[data-section="positions-portfolio"] .section-body');
    if (sectionBody) {
        sectionBody.style.display = 'block';
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
        window.Logger.error('❌ Error loading trading account positions:', error, { page: "trading_accounts" });
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
    if (!tableBody) {
        return;
    }
    
    // If positions provided, use them and update state
    if (positions && Array.isArray(positions)) {
        window.positionsPortfolioState.positionsData = positions;
    } else {
        // If no positions provided, try to get from state
        positions = window.positionsPortfolioState.positionsData || [];
    }
    
    if (!positions || positions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="9" class="empty">אין פוזיציות להצגה</td></tr>';
        return;
    }
    
    // Use FieldRendererService for consistent rendering
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
        const percentAccount = position.percent_of_account || 0;
        
        // Render ticker info using FieldRendererService
        let tickerHtml = `<strong>${position.ticker_symbol || 'N/A'}</strong>`;
        if (position.ticker_name) {
            tickerHtml += `<br><small>${position.ticker_name}</small>`;
        }
        if (FieldRenderer && FieldRenderer.renderTickerInfo) {
            try {
                let renderedTicker = FieldRenderer.renderTickerInfo({
                    symbol: position.ticker_symbol,
                    name: position.ticker_name,
                    current_price: position.market_price,
                    daily_change: null, // Not available in position data
                    daily_change_percent: null
                }, 'ticker-info-compact');

                if (isIndexPage && typeof renderedTicker === 'string') {
                    renderedTicker = renderedTicker.replace(/<span class="text-muted small">[\s\S]*?<\/span>/, '');
                }

                tickerHtml = renderedTicker;
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
                        <div class="portfolio-pl-value ${unrealizedPl >= 0 ? 'text-success' : 'text-danger'}">
                            <div class="pl-amount">${formatCurrencyHebrew(unrealizedPl, true, true)}</div>
                            <div class="pl-percent">${unrealizedPlPercent.toFixed(2)}%${unrealizedPlPercent >= 0 ? '+' : '-'}</div>
                        </div>
                    ` : 'לא זמין'}
                </td>
                <td class="col-percent-account">
                    ${percentAccount.toFixed(2)}%
                </td>
                <td class="col-actions actions-cell">
                    <button class="btn actions-menu-item"
                            data-button-type="VIEW"
                            data-variant="small"
                            data-onclick="window.showPositionDetails && window.showPositionDetails(${position.trading_account_id}, ${position.ticker_id})"
                            title="פרטי פוזיציה"
                            aria-label="פרטי פוזיציה"></button>
                </td>
            </tr>
        `;
    });
    
    // Update table HTML
    tableBody.innerHTML = html;
}

/**
 * Populate portfolio trading account selector dropdown
 */
async function populatePortfolioAccountSelector() {
    const selector = document.getElementById('portfolioAccountFilter');
    if (!selector) return;
    
    // Clear existing options (except first)
    while (selector.options.length > 1) {
        selector.remove(1);
    }
    
    // Add trading accounts - reuse logic from positions selector
    if (window.trading_accountsData && Array.isArray(window.trading_accountsData)) {
        window.trading_accountsData.forEach(tradingAccount => {
            const option = document.createElement('option');
            option.value = tradingAccount.id;
            option.textContent = tradingAccount.name || `חשבון מסחר ${tradingAccount.id}`;
            selector.appendChild(option);
        });
    }
    
    window.Logger.info(`✅ Portfolio trading account selector populated with ${selector.options.length - 1} trading accounts`, { page: "trading_accounts" });
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
            tableBody.innerHTML = '<tr><td colspan="10" class="loading">טוען פורטפוליו...</td></tr>';
        }
        
        // Get filter values
        const accountFilter = document.getElementById('portfolioAccountFilter')?.value || '';
        
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
    if (!tableBody) {
        return;
    }
    
    // If positions provided, use them and update state
    if (positions && Array.isArray(positions)) {
        if (!window.positionsPortfolioState.portfolioData) {
            window.positionsPortfolioState.portfolioData = {};
        }
        window.positionsPortfolioState.portfolioData.positions = positions;
    } else {
        // If no positions provided, try to get from state
        positions = window.positionsPortfolioState.portfolioData?.positions || [];
    }
    
    if (!positions || positions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="10" class="empty">אין פוזיציות להצגה</td></tr>';
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
        
        // Render ticker info
        let tickerHtml = `<strong>${position.ticker_symbol || 'N/A'}</strong>`;
        if (position.ticker_name) {
            tickerHtml += `<br><small>${position.ticker_name}</small>`;
        }
        
        if (FieldRenderer && FieldRenderer.renderTickerInfo) {
            try {
                let renderedTicker = FieldRenderer.renderTickerInfo({
                    symbol: position.ticker_symbol,
                    name: position.ticker_name,
                    current_price: position.market_price,
                    daily_change: null,
                    daily_change_percent: null
                }, 'ticker-info-compact');

                if (isIndexPage && typeof renderedTicker === 'string') {
                    renderedTicker = renderedTicker.replace(/<span class="text-muted small">[\s\S]*?<\/span>/, '');
                }

                tickerHtml = renderedTicker;
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
                    <button class="btn actions-menu-item"
                            data-button-type="VIEW"
                            data-variant="small"
                            data-onclick="window.showPositionDetails && window.showPositionDetails(${position.trading_account_id}, ${position.ticker_id})"
                            title="פרטי פוזיציה"
                            aria-label="פרטי פוזיציה"></button>
                </td>
            </tr>
            `;
    });
    
    // Update table HTML
    tableBody.innerHTML = html;
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
 * Toggle portfolio summary size (minimal/full)
 * Called via data-onclick attribute
 */
window.togglePortfolioSummarySize = function() {
    const toggleBtn = document.getElementById('portfolioSummaryToggleSize');
    if (!toggleBtn) return;
    
    const currentSize = window.positionsPortfolioState.summarySize;
    const newSize = currentSize === 'minimal' ? 'full' : 'minimal';
    window.positionsPortfolioState.summarySize = newSize;
    toggleBtn.textContent = newSize === 'minimal' ? 'הצג מלא' : 'הצג מינימאלי';
    loadPortfolioSummary();
};

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
            window.Logger.debug('   - positionsData:', window.positionsPortfolioState.positionsData, { page: "positions-portfolio" });
            window.Logger.debug('     * Exists:', !!window.positionsPortfolioState.positionsData, { page: "positions-portfolio" });
            window.Logger.debug('     * Type:', typeof window.positionsPortfolioState.positionsData, { page: "positions-portfolio" });
            window.Logger.debug('     * Is Array:', Array.isArray(window.positionsPortfolioState.positionsData), { page: "positions-portfolio" });
            window.Logger.debug('     * Length:', window.positionsPortfolioState.positionsData?.length || 0, { page: "positions-portfolio" });
            window.Logger.debug('   - portfolioData:', window.positionsPortfolioState.portfolioData, { page: "positions-portfolio" });
            window.Logger.debug('     * Exists:', !!window.positionsPortfolioState.portfolioData, { page: "positions-portfolio" });
            window.Logger.debug('     * Positions:', window.positionsPortfolioState.portfolioData?.positions, { page: "positions-portfolio" });
            window.Logger.debug('       - Exists:', !!window.positionsPortfolioState.portfolioData?.positions, { page: "positions-portfolio" });
            window.Logger.debug('       - Is Array:', Array.isArray(window.positionsPortfolioState.portfolioData?.positions), { page: "positions-portfolio" });
            window.Logger.debug('       - Length:', window.positionsPortfolioState.portfolioData?.positions?.length || 0, { page: "positions-portfolio" });
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
