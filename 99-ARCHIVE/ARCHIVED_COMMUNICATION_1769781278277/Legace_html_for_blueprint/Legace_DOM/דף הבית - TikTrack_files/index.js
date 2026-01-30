/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 28
 * 
 * DATA LOADING (5)
 * - updateRecentItemsWidget() - updateRecentItemsWidget function
 * - loadRecentTradePlans() - loadRecentTradePlans function
 * - legacyFetchDashboardDataFromApi() - legacyFetchDashboardDataFromApi function
 * - loadDashboardDataFromService() - loadDashboardDataFromService function
 * - equalizeWidgetHeights() - * Copy detailed log to clipboard
 * 
 * DATA MANIPULATION (6)
 * - updateSummaryStats() - updateSummaryStats function
 * - updateRecentTradePlans() - updateRecentTradePlans function
 * - updateRecentTrades() - updateRecentTrades function
 * - updateActiveAlerts() - updateActiveAlerts function
 * - updateDashboardCount() - updateDashboardCount function
 * - updatePortfolioSummary() - * Update dashboard count indicators
 * 
 * EVENT HANDLING (4)
 * - toNumber() - toNumber function
 * - handleDashboardError() - * Show dashboard error message
 * - quickAction() - * Refresh overview data on the index page
 * - replaceIconsWithIconSystem() - * Execute quick actions on the index page
 * 
 * UI UPDATES (1)
 * - showDashboardError() - showDashboardError function
 * 
 * UTILITIES (1)
 * - formatDateShort() - * Convert value to number
 * 
 * OTHER (11)
 * - resolveDateValue() - * Convert value to number
 * - normalizeArray() - normalizeArray function
 * - determineCurrencySymbol() - * Normalize payload to array
 * - computePortfolioPnL() - * Determine currency symbol from accounts or trades
 * - processDashboardData() - * Handle dashboard error
 * - switchTableTab() - switchTableTab function
 * - refreshOverview() - * Switch between table tabs on the index page
 * - exportOverview() - * Refresh overview data on the index page
 * - generateDetailedLog() - generateDetailedLog function
 * - debugZIndexStatus() - debugZIndexStatus function
 * - copyDetailedLogLocal() - copyDetailedLogLocal function
 * 
 * ==========================================
 */

/**
 * Index Page JavaScript - TikTrack
 * עמוד הבית - JavaScript
 * 
 * @version 2.0.0
 * @lastUpdated January 2025
 * @author TikTrack Development Team
 */

window.Logger.info('🏠 Index page JavaScript loaded', { page: "index" });

/**
 * Function Index:
 * ==============
 * 
 * TAB MANAGEMENT:
 * - switchTableTab()
 * 
 * CHART MANAGEMENT:
 * - initializeCharts()
 * - updateCharts()
 * - destroyCharts()
 * 
 * DATA LOADING:
 * - loadDashboardData()
 * - loadTradesData()
 * - loadExecutionsData()
 * - loadAccountsData()
 * 
 * UTILITY FUNCTIONS:
 * - formatCurrency()
 * - formatDate()
 * - formatNumber()
 * 
 * ==============
 */

// ===== GLOBAL VARIABLES =====
// Charts removed - no longer used on index page

const DASHBOARD_DATA_KEY = 'dashboard_data';
const DASHBOARD_DATA_TTL = 60000;
let dashboardDataPromise = null;
const dashboardDataState = {
    lastLoadedAt: null,
    source: null,
    data: null
};

const DASHBOARD_ENDPOINTS = Object.freeze({
    trades: '/api/trades/',
    alerts: '/api/alerts/',
    accounts: '/api/trading_accounts/',
    cashFlows: '/api/cash_flows/'
});

const SIDE_LABELS = Object.freeze({
    long: 'לונג',
    short: 'שורט',
    buy: 'קניה',
    sell: 'מכירה'
});

/**
 * Convert value to number
 * @param {*} value - Value to convert
 * @returns {number} Number value or 0 if invalid
 */
function toNumber(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Resolve date value from various formats
 * @param {*} value - Date value (string, object, or null)
 * @returns {string|null} Resolved date string or null
 */
function resolveDateValue(value) {
    if (!value && value !== 0) {
        return null;
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'object') {
        return value.utc || value.local || value.display || value.iso || null;
    }
    return null;
}

/**
 * Format date to short format
 * @param {*} value - Date value to format
 * @returns {string} Formatted date string or empty string
 */
function formatDateShort(value) {
    const resolved = resolveDateValue(value);
    if (!resolved) {
        return '';
    }
    try {
        const dateObj = new Date(resolved);
        if (Number.isNaN(dateObj.getTime())) {
            return '';
        }
        return window.formatDate ? window.formatDate(dateObj) : (window.dateUtils?.formatDate ? window.dateUtils.formatDate(dateObj) : dateObj.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' }));
    } catch (error) {
        window.Logger?.warn?.('⚠️ formatDateShort fallback failed', { error: error?.message }, { page: 'index' });
        return '';
    }
}

/**
 * Normalize payload to array
 * @param {*} payload - Payload to normalize
 * @returns {Array} Normalized array
 */
function normalizeArray(payload) {
    if (!payload) {
        return [];
    }
    if (Array.isArray(payload)) {
        return payload;
    }
    if (Array.isArray(payload.data)) {
        return payload.data;
    }
    if (payload.data && Array.isArray(payload.data.records)) {
        return payload.data.records;
    }
    if (payload.data && Array.isArray(payload.data.data)) {
        return payload.data.data;
    }
    if (Array.isArray(payload.records)) {
        return payload.records;
    }
    return [];
}

/**
 * Determine currency symbol from accounts or trades
 * @param {Array} [accounts=[]] - Array of accounts
 * @param {Array} [trades=[]] - Array of trades
 * @returns {string} Currency symbol or '$' as default
 */
function determineCurrencySymbol(accounts = [], trades = []) {
    for (const account of accounts) {
        if (account?.currency_symbol) {
            return account.currency_symbol;
        }
        if (account?.currency?.symbol) {
            return account.currency.symbol;
        }
    }
    for (const trade of trades) {
        if (trade?.currency_symbol) {
            return trade.currency_symbol;
        }
        if (trade?.ticker?.currency_symbol) {
            return trade.ticker.currency_symbol;
        }
        if (trade?.ticker?.currency?.symbol) {
            return trade.ticker.currency.symbol;
        }
    }
    return '$';
}


/**
 * Compute portfolio profit and loss
 * @param {Array} [trades=[]] - Array of trades
 * @param {Array} [accounts=[]] - Array of accounts
 * @param {Array} [cashFlows=[]] - Array of cash flows
 * @returns {number} Total P&L
 */
function computePortfolioPnL(trades = [], accounts = [], cashFlows = []) {
    let total = 0;
    trades.forEach((trade) => {
        if (trade?.position?.unrealized_pl) {
            total += toNumber(trade.position.unrealized_pl);
        }
        if (trade?.position?.realized_pl) {
            total += toNumber(trade.position.realized_pl);
        } else if (!trade?.position && trade?.total_pl) {
            total += toNumber(trade.total_pl);
        } else if (trade?.profit_loss) {
            total += toNumber(trade.profit_loss);
        }
    });
    if (total === 0 && accounts.length) {
        accounts.forEach((account) => {
            if (account?.total_pl) {
                total += toNumber(account.total_pl);
            }
        });
    }
    if (total === 0 && cashFlows.length) {
        const income = cashFlows
            .filter((flow) => (flow.type || '').toLowerCase() === 'income')
            .reduce((sum, flow) => sum + toNumber(flow.amount), 0);
        const expenses = cashFlows
            .filter((flow) => (flow.type || '').toLowerCase() === 'expense')
            .reduce((sum, flow) => sum + toNumber(flow.amount), 0);
        total += income + expenses;
    }
    return total;
}

/**
 * Update summary statistics on dashboard
 * @param {Object} data - Dashboard data
 * @param {string} currencySymbol - Currency symbol
 * @returns {void}
 */
function updateSummaryStats(data, currencySymbol) {
    const { trades = [], alerts = [], accounts = [], cashFlows = [] } = data;

    // Get container and loading div reference
    const container = document.getElementById('portfolioSummaryStats');
    const loadingDiv = container?.querySelector('div');

    const totalTradesEl = document.getElementById('totalTrades');
    if (totalTradesEl) {
        const tradesText = trades.length.toLocaleString('he-IL');
        totalTradesEl.textContent = tradesText;
    }

    const totalAlertsEl = document.getElementById('totalAlerts');
    if (totalAlertsEl) {
        const alertsText = alerts.length.toLocaleString('he-IL');
        totalAlertsEl.textContent = alertsText;
    }

    const balance = accounts.reduce((sum, account) => {
        const value = account?.total_value ?? account?.opening_balance ?? 0;
        return sum + toNumber(value);
    }, 0);
    const balanceEl = document.getElementById('currentBalance');
    if (balanceEl) {
        // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
        const numericBalance = toNumber(balance);
        if (Number.isFinite(numericBalance)) {
            const htmlContent = window.FieldRendererService?.renderAmount
                ? window.FieldRendererService.renderAmount(numericBalance, currencySymbol, 2, true)
                : '<span class="text-muted">לא זמין</span>';
            balanceEl.textContent = '';
            // Convert HTML string to DOM elements safely
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const fragment = document.createDocumentFragment();
            Array.from(doc.body.childNodes).forEach(node => {
                fragment.appendChild(node.cloneNode(true));
            });
            balanceEl.appendChild(fragment);
        } else {
            balanceEl.textContent = '';
            const span = document.createElement('span');
            span.className = 'text-muted';
            span.textContent = 'לא זמין';
            balanceEl.appendChild(span);
        }
    }

    const totalPnL = computePortfolioPnL(trades, accounts, cashFlows);
    const totalPnLEl = document.getElementById('totalPnL');
    if (totalPnLEl) {
        // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
        const numericPnL = toNumber(totalPnL);
        if (Number.isFinite(numericPnL)) {
            const htmlContent = window.FieldRendererService?.renderAmount
                ? window.FieldRendererService.renderAmount(numericPnL, currencySymbol, 2, true)
                : '<span class="text-muted">לא זמין</span>';
            totalPnLEl.textContent = '';
            // Convert HTML string to DOM elements safely
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            const fragment = document.createDocumentFragment();
            Array.from(doc.body.childNodes).forEach(node => {
                fragment.appendChild(node.cloneNode(true));
            });
            totalPnLEl.appendChild(fragment);
        } else {
            totalPnLEl.textContent = '';
            const span = document.createElement('span');
            span.className = 'text-muted';
            span.textContent = 'לא זמין';
            totalPnLEl.appendChild(span);
        }
    }
    if (loadingDiv && loadingDiv.textContent.includes('טוען סיכום')) {
        loadingDiv.remove();
    }
}

/**
 * Clear all widget loading indicators (aggressive fallback mechanism)
 */
function clearAllWidgetLoaders() {
    // #region agent log - clearAllWidgetLoaders called
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearAllWidgetLoaders:entry',message:'clearAllWidgetLoaders called',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_loading_fixes',hypothesisId:'loader_clearance_fallback'})}).catch(()=>{});
    // #endregion

    // List of all known loading element IDs
    const loadingElementIds = [
        'recentItemsWidgetTradesLoading',
        'recentItemsWidgetPlansLoading',
        'tickerListWidgetActiveLoading',
        'tickerListWidgetWatchlistLoading',
        'tickerListWidgetAllLoading',
        'tickerChartWidgetLoading',
        'tagWidgetCloudLoading',
        'watchListsWidgetLoading',
        'assignPlansLoading',
        'assignTradesLoading',
        'createPlansLoading',
        'createTradesLoading'
    ];

    let clearedCount = 0;
    loadingElementIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Force hide regardless of current state
            el.classList.add('d-none');
            el.style.display = 'none';
            el.hidden = true;
            // Also hide all SPAN elements inside
            const spans = el.querySelectorAll('span');
            spans.forEach(span => {
                span.classList.add('d-none');
                span.style.display = 'none';
                span.hidden = true;
            });
            clearedCount++;
        }
    });

    // Aggressive search for loading elements by text content
    const loadingTexts = [
        'טוען טריידים',
        'טוען תוכניות',
        'טוען טיקרים פעילים',
        'טוען רשימת צפיה',
        'טוען כל הטיקרים',
        'טוען טיקרים',
        'טוען נתוני תגיות',
        'טוען רשימת צפייה',
        'טוען הצעות שיוך תוכניות',
        'טוען המלצות שיוך ביצועים',
        'טוען הצעות יצירת תוכניות',
        'טוען אשכולות ליצירת טרייד'
    ];

    loadingTexts.forEach(text => {
        // Find all elements containing this loading text
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.includes(text)) {
                const parent = node.parentElement;
                if (parent) {
                    // Check if parent has spinner or is a loading container
                    const hasSpinner = parent.querySelector('.spinner-border, .spinner, [role="status"]');
                    if (hasSpinner || parent.classList.contains('loading') || parent.id.includes('Loading')) {
                        parent.classList.add('d-none');
                        parent.style.display = 'none';
                        parent.hidden = true;
                        clearedCount++;
                    }
                }
            }
        }
    });

    // Clear portfolio summary loading text specifically
    const portfolioSummaryStats = document.getElementById('portfolioSummaryStats');
    if (portfolioSummaryStats) {
        // Find and remove loading div
        const loadingDiv = portfolioSummaryStats.querySelector('div');
        if (loadingDiv && loadingDiv.textContent.includes('טוען סיכום')) {
            loadingDiv.remove();
            clearedCount++;
        }
        // Also check for loading text in direct text nodes
        Array.from(portfolioSummaryStats.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('טוען סיכום')) {
                node.textContent = '';
                clearedCount++;
            }
        });
    }

    // #region agent log - clearAllWidgetLoaders complete
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearAllWidgetLoaders:complete',message:'clearAllWidgetLoaders completed',data:{clearedCount:clearedCount,totalChecked:loadingElementIds.length,loadingTextsChecked:loadingTexts.length,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_loading_fixes',hypothesisId:'loader_clearance_fallback'})}).catch(()=>{});
    // #endregion
}

/**
 * Check for stuck loaders and report them
 * Runtime instrumentation for loader validation
 */
function checkStuckLoaders() {
    const stuckLoaders = [];
    
    // List of all known loading element IDs
    const loadingElementIds = [
        'recentItemsWidgetTradesLoading',
        'recentItemsWidgetPlansLoading',
        'tickerListWidgetActiveLoading',
        'tickerListWidgetWatchlistLoading',
        'tickerListWidgetAllLoading',
        'tickerChartWidgetLoading',
        'tagWidgetLoading',
        'watchListsWidgetLoading',
        'portfolioSummaryStats'
    ];
    
    // Check each loading element
    loadingElementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const isVisible = !element.classList.contains('d-none') && 
                            element.style.display !== 'none' && 
                            !element.hidden;
            const hasLoadingText = element.textContent?.includes('טוען') || 
                                  element.textContent?.includes('Loading');
            
            if (isVisible && hasLoadingText) {
                stuckLoaders.push({
                    id: id,
                    text: element.textContent?.substring(0, 50),
                    visible: isVisible
                });
            }
        }
    });
    
    // Check for loading texts in common containers
    const loadingTexts = ['טוען סיכום', 'טוען טריידים', 'טוען תוכניות', 'טוען טיקרים', 'טוען רשימת צפיה', 'טוען נתוני תגיות'];
    loadingTexts.forEach(text => {
        const elements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent?.includes(text) && 
            !el.classList.contains('d-none') && 
            el.style.display !== 'none'
        );
        if (elements.length > 0) {
            stuckLoaders.push({
                id: elements[0].id || 'unknown',
                text: text,
                visible: true,
                count: elements.length
            });
        }
    });
    
    // Report stuck loaders
    if (stuckLoaders.length > 0) {
        window.Logger?.warn?.('⚠️ Stuck loaders detected', { 
            count: stuckLoaders.length, 
            loaders: stuckLoaders,
            page: 'index' 
        });
        
        // #region agent log - stuck loaders detected
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:checkStuckLoaders:stuckLoaders',message:'Stuck loaders detected',data:{count:stuckLoaders.length,loaders:stuckLoaders,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_loading_fixes',hypothesisId:'loader_validation'})}).catch(()=>{});
        // #endregion
    } else {
        window.Logger?.info?.('✅ No stuck loaders detected', { page: 'index' });
        
        // #region agent log - no stuck loaders
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:checkStuckLoaders:noStuckLoaders',message:'No stuck loaders detected',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_loading_fixes',hypothesisId:'loader_validation'})}).catch(()=>{});
        // #endregion
    }
    
    return stuckLoaders;
}

/**
 * Clear portfolio summary loader and ensure content is visible
 */
function clearPortfolioSummaryLoader() {
    // #region agent log - clearPortfolioSummaryLoader called
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearPortfolioSummaryLoader:entry',message:'clearPortfolioSummaryLoader called',data:{portfolioSummaryStatsContent:document.getElementById('portfolioSummaryStats')?.textContent?.substring(0,100),hasLoadingText:document.getElementById('portfolioSummaryStats')?.textContent?.includes('טוען סיכום'),timestamp:Date.now()},sessionId:'debug-session',runId:'widget_loading_fixes',hypothesisId:'portfolio_summary_loading'})}).catch(()=>{});
    // #endregion

    const container = document.getElementById('portfolioSummaryStats');
    if (container) {
        // Ensure no loading text remains
        const content = container.textContent || '';
        if (content.includes('טוען סיכום')) {
            console.warn('Portfolio summary still contains loading text, forcing update');
            // Force update with current data if available
            if (window.lastPortfolioData) {
                updatePortfolioSummary(window.lastPortfolioData.accounts || [], window.lastPortfolioData.currencySymbol || '$');
            }
        }
    }

    // #region agent log - clearPortfolioSummaryLoader complete
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearPortfolioSummaryLoader:complete',message:'clearPortfolioSummaryLoader completed',data:{finalContent:document.getElementById('portfolioSummaryStats')?.textContent?.substring(0,100),timestamp:Date.now()},sessionId:'debug-session',runId:'widget_loading_fixes',hypothesisId:'portfolio_summary_loading'})}).catch(()=>{});
    // #endregion
}

/**
 * Update unified recent items widget (trades and trade plans)
 * @param {Array} [trades=[]] - Array of trades
 * @param {Array} [tradePlans=[]] - Array of trade plans
 * @param {string} currencySymbol - Currency symbol
 * @returns {void}
 */
function updateRecentItemsWidget(trades = [], tradePlans = [], currencySymbol) {
    window.Logger?.info?.('🔄 updateRecentItemsWidget called', {
        tradesCount: trades?.length || 0,
        tradePlansCount: tradePlans?.length || 0,
        currencySymbol: currencySymbol,
        hasWidget: !!window.RecentItemsWidget,
        hasRender: !!window.RecentItemsWidget?.render,
        isInitialized: window.RecentItemsWidget?.initialized || false,
        page: 'index'
    });

    // Check if widget is initialized, if not try to initialize
    if (window.RecentItemsWidget && !window.RecentItemsWidget.initialized) {
        window.Logger?.warn?.('⚠️ RecentItemsWidget not initialized, attempting auto-init', { page: 'index' });
        try {
            const containerId = 'recentItemsWidgetContainer';
            if (document.getElementById(containerId)) {
                window.RecentItemsWidget.init(containerId, {
                    defaultTab: 'trades',
                    maxItems: 5
                });
                window.Logger?.info?.('✅ RecentItemsWidget auto-initialized', { page: 'index' });
            } else {
                window.Logger?.warn?.('⚠️ RecentItemsWidget container not found for auto-init', { 
                    containerId,
                    page: 'index' 
                });
            }
        } catch (error) {
            window.Logger?.error?.('❌ Failed to auto-initialize RecentItemsWidget', { error: error?.message }, { page: 'index' });
        }
    }

    if (window.RecentItemsWidget?.render) {
        // Build render data - only include trades/tradePlans if they have data
        // This matches the test page behavior where we only pass what we have
        const renderData = {
            currencySymbol: currencySymbol || '$'
        };
        // Only add trades if we have valid data (don't pass empty array - it clears existing)
        if (Array.isArray(trades) && trades.length > 0) {
            renderData.trades = trades;
        }
        // Only add tradePlans if we have valid data
        if (Array.isArray(tradePlans) && tradePlans.length > 0) {
            renderData.tradePlans = tradePlans;
        }

        window.Logger?.info?.('📊 Rendering RecentItemsWidget with data', renderData, { page: 'index' });
        try {
            // #region agent log - widget render start
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:updateRecentItemsWidget:renderStart',message:'RecentItemsWidget.render() called',data:{renderDataKeys:Object.keys(renderData),tradesCount:renderData.trades?.length||0,tradePlansCount:renderData.tradePlans?.length||0,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_data_flow',hypothesisId:'widget_data_flow'})}).catch(()=>{});
            // #endregion

            window.RecentItemsWidget.render(renderData);

            // #region agent log - widget render success
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:updateRecentItemsWidget:renderSuccess',message:'RecentItemsWidget.render() completed',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'widget_data_flow',hypothesisId:'widget_data_flow'})}).catch(()=>{});
            // #endregion

            window.Logger?.info?.('✅ RecentItemsWidget.render() completed successfully', { page: 'index' });

            // Clear loading indicators immediately after render completes
            // Widget should handle its own loading state, but ensure cleanup
            setTimeout(() => {
                const widgetLoadingElements = document.querySelectorAll('#recentItemsWidgetTradesLoading, #recentItemsWidgetPlansLoading, [data-loading="true"]');

                // #region agent log - clearing loading indicators
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:updateRecentItemsWidget:clearLoading',message:'Clearing widget loading indicators',data:{loadingElementsFound:widgetLoadingElements.length,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_data_flow',hypothesisId:'widget_data_flow'})}).catch(()=>{});
                // #endregion

                widgetLoadingElements.forEach(el => {
                    if (el) {
                        el.style.display = 'none';
                        el.classList.add('d-none');
                        el.removeAttribute('data-loading');
                    }
                });

                // Check if data elements were created
                const dataElements = document.querySelectorAll('[data-item], [data-entity], .data-row, .entity-item, .trade-row, .ticker-row, .alert-row, .recent-items-widget-item');

                // #region agent log - data elements check
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:updateRecentItemsWidget:dataElementsCheck',message:'Checking for rendered data elements',data:{dataElementsCount:dataElements.length,loadingIndicatorsCleared:widgetLoadingElements.length,containerExists:!!document.getElementById('recentItemsWidgetContainer'),timestamp:Date.now()},sessionId:'debug-session',runId:'widget_data_flow',hypothesisId:'widget_data_flow'})}).catch(()=>{});
                // #endregion

                window.Logger?.info?.('📋 Data elements after render', {
                    count: dataElements.length,
                    loadingIndicatorsCleared: widgetLoadingElements.length
                }, { page: 'index' });
            }, 500); // Shorter delay - widget should clear its own loading state

        } catch (error) {
            // #region agent log - widget render error
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:updateRecentItemsWidget:renderError',message:'RecentItemsWidget.render() failed',data:{error:error?.message,timestamp:Date.now()},sessionId:'debug-session',runId:'widget_data_flow',hypothesisId:'widget_data_flow'})}).catch(()=>{});
            // #endregion

            window.Logger?.error?.('❌ RecentItemsWidget.render() failed', { error: error?.message }, { page: 'index' });
        }
        return;
    }
    
    window.Logger?.warn?.('⚠️ RecentItemsWidget not available, falling back to separate widgets', { page: 'index' });
    // Fallback to separate widgets if unified widget not available
    updateRecentTrades(trades, currencySymbol);
    if (tradePlans && tradePlans.length > 0) {
        updateRecentTradePlans(tradePlans, currencySymbol);
    }
}

/**
 * Update recent trade plans section
 * @param {Array} [tradePlans=[]] - Array of trade plans
 * @param {string} currencySymbol - Currency symbol
 * @returns {void}
 */
function updateRecentTradePlans(tradePlans = [], currencySymbol) {
    // Unified widget is updated via updateRecentItemsWidget or loadRecentTradePlans
    // This function is kept for backward compatibility
    if (window.RecentItemsWidget?.render) {
        return; // Will be handled by unified widget
    }
    
    if (window.RecentTradePlansWidget?.render) {
        window.RecentTradePlansWidget.render(tradePlans, currencySymbol);
        return;
    }

    const container = document.getElementById('recentTradePlans');
    if (!container) {
        return;
    }

    if (!Array.isArray(tradePlans) || tradePlans.length === 0) {
        container.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted small';
        div.textContent = 'אין תוכניות זמינות';
        container.appendChild(div);
        return;
    }

    // Use TableSortValueAdapter for consistent sorting
    const sorted = [...tradePlans].sort((a, b) => {
        const dateA = resolveDateValue(a?.created_at || a?.opened_at || a?.entry_date);
        const dateB = resolveDateValue(b?.created_at || b?.opened_at || b?.entry_date);
        
        if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
            const sortValueA = window.TableSortValueAdapter.getSortValue({ value: dateA, type: 'date' });
            const sortValueB = window.TableSortValueAdapter.getSortValue({ value: dateB, type: 'date' });
            return (sortValueB || 0) - (sortValueA || 0);
        }
        
        const epochA = dateA ? new Date(dateA).getTime() : 0;
        const epochB = dateB ? new Date(dateB).getTime() : 0;
        return epochB - epochA;
    });

    const topPlans = sorted.slice(0, 5);
    const list = document.createElement('ul');
    list.className = 'list-group list-group-flush';

    topPlans.forEach((plan) => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-start gap-2';

        const mainWrap = document.createElement('div');
        mainWrap.className = 'd-flex flex-column';

        const title = document.createElement('span');
        title.className = 'fw-semibold';
        title.textContent = plan?.name || plan?.title || (plan?.id ? `תוכנית #${plan.id}` : 'לא זמין');
        mainWrap.appendChild(title);

        const metaRow = document.createElement('div');
        metaRow.className = 'd-flex flex-wrap align-items-center gap-2 text-muted small';

        const symbol = plan?.ticker?.symbol || plan?.symbol;
        if (symbol) {
            const symbolSpan = document.createElement('span');
            symbolSpan.textContent = symbol;
            metaRow.appendChild(symbolSpan);
        }

        const dateLabel = formatDateShort(plan?.created_at || plan?.opened_at || plan?.entry_date);
        if (dateLabel) {
            const dateSpan = document.createElement('span');
            dateSpan.textContent = dateLabel;
            metaRow.appendChild(dateSpan);
        }

        mainWrap.appendChild(metaRow);
        item.appendChild(mainWrap);

        const amountWrapper = document.createElement('div');
        amountWrapper.className = 'text-muted small text-end';
        const value = plan?.amount || plan?.total_amount || plan?.investment_amount;
        if (value !== undefined && value !== null) {
            const numericValue = toNumber(value);
            if (Number.isFinite(numericValue) && window.FieldRendererService?.renderAmount) {
                const htmlContent = window.FieldRendererService.renderAmount(numericValue, currencySymbol, 2, true);
                amountWrapper.textContent = '';
                // Convert HTML string to DOM elements safely
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                const fragment = document.createDocumentFragment();
                Array.from(doc.body.childNodes).forEach(node => {
                    fragment.appendChild(node.cloneNode(true));
                });
                amountWrapper.appendChild(fragment);
            } else {
                amountWrapper.textContent = 'לא זמין';
            }
        } else {
            amountWrapper.textContent = 'לא זמין';
        }
        item.appendChild(amountWrapper);

        list.appendChild(item);
    });

    container.textContent = '';
    container.appendChild(list);
}

/**
 * Update recent trades section
 * @param {Array} [trades=[]] - Array of trades
 * @param {string} currencySymbol - Currency symbol
 * @returns {void}
 */
function updateRecentTrades(trades = [], currencySymbol) {
    // Try unified widget first - but we need trade plans too, so call updateRecentItemsWidget instead
    // This function is kept for backward compatibility
    if (window.RecentItemsWidget?.render) {
        // Will be updated via updateRecentItemsWidget
        return;
    }
    
    if (window.RecentTradesWidget?.render) {
        window.RecentTradesWidget.render(trades, currencySymbol);
        return;
    }

    const container = document.getElementById('recentTrades');
    if (!container) {
        return;
    }

    if (!Array.isArray(trades) || trades.length === 0) {
        container.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted small';
        div.textContent = 'אין טריידים זמינים';
        container.appendChild(div);
        return;
    }

    // Use TableSortValueAdapter for consistent sorting
    const sorted = [...trades].sort((a, b) => {
        const dateA = resolveDateValue(a?.created_at || a?.opened_at || a?.entry_date);
        const dateB = resolveDateValue(b?.created_at || b?.opened_at || b?.entry_date);
        
        // Use TableSortValueAdapter if available
        if (typeof window.TableSortValueAdapter?.getSortValue === 'function') {
            const sortValueA = window.TableSortValueAdapter.getSortValue({ value: dateA, type: 'date' });
            const sortValueB = window.TableSortValueAdapter.getSortValue({ value: dateB, type: 'date' });
            return (sortValueB || 0) - (sortValueA || 0);
        }
        
        // Fallback to manual date comparison
        const epochA = dateA ? new Date(dateA).getTime() : 0;
        const epochB = dateB ? new Date(dateB).getTime() : 0;
        return epochB - epochA;
    });

    const topTrades = sorted.slice(0, 5);
    const list = document.createElement('ul');
    list.className = 'list-group list-group-flush';

    topTrades.forEach((trade) => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-start gap-2';

        const mainWrap = document.createElement('div');
        mainWrap.className = 'd-flex flex-column';

        const title = document.createElement('span');
        title.className = 'fw-semibold';
        title.textContent = trade?.ticker?.symbol || trade?.symbol || (trade?.id ? `טרייד #${trade.id}` : 'לא זמין');
        mainWrap.appendChild(title);

        const metaRow = document.createElement('div');
        metaRow.className = 'd-flex flex-wrap align-items-center gap-2 text-muted small';

        // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
        const side = trade?.side || trade?.position?.side || '';
        if (side && window.FieldRendererService?.renderSide) {
            const sideHtml = window.FieldRendererService.renderSide(side);
            if (sideHtml) {
                const sideSpan = document.createElement('span');
                // Convert HTML string to DOM elements safely
                const parser = new DOMParser();
                const doc = parser.parseFromString(sideHtml, 'text/html');
                const fragment = document.createDocumentFragment();
                Array.from(doc.body.childNodes).forEach(node => {
                    fragment.appendChild(node.cloneNode(true));
                });
                sideSpan.appendChild(fragment);
                metaRow.appendChild(sideSpan);
            }
        }

        const quantity = trade?.position?.quantity ?? trade?.quantity;
        if (quantity !== undefined && quantity !== null) {
            const qtySpan = document.createElement('span');
            qtySpan.textContent = `כמות: ${toNumber(quantity).toLocaleString('he-IL')}`;
            metaRow.appendChild(qtySpan);
        }

        const dateLabel = formatDateShort(trade?.created_at || trade?.opened_at || trade?.entry_date);
        if (dateLabel) {
            const dateSpan = document.createElement('span');
            dateSpan.textContent = dateLabel;
            metaRow.appendChild(dateSpan);
        }

        mainWrap.appendChild(metaRow);
        item.appendChild(mainWrap);

        const amountWrapper = document.createElement('div');
        amountWrapper.className = 'text-muted small text-end';
        const value = trade?.position?.market_value ?? trade?.position?.current_value ?? trade?.entry_price;
        if (value !== undefined && value !== null) {
            // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
            const numericValue = toNumber(value);
            if (Number.isFinite(numericValue) && window.FieldRendererService?.renderAmount) {
                const htmlContent = window.FieldRendererService.renderAmount(numericValue, currencySymbol, 2, true);
                amountWrapper.textContent = '';
                // Convert HTML string to DOM elements safely
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                const fragment = document.createDocumentFragment();
                Array.from(doc.body.childNodes).forEach(node => {
                    fragment.appendChild(node.cloneNode(true));
                });
                amountWrapper.appendChild(fragment);
            } else {
                amountWrapper.textContent = 'לא זמין';
            }
        } else {
            amountWrapper.textContent = 'לא זמין';
        }
        item.appendChild(amountWrapper);

        list.appendChild(item);
    });

    container.textContent = '';
    container.appendChild(list);
}

/**
 * Update active alerts section
 * @param {Array} [alerts=[]] - Array of alerts
 * @returns {void}
 */
function updateActiveAlerts(alerts = []) {
    const container = document.getElementById('activeAlerts');
    if (!container) {
        return;
    }

    if (!Array.isArray(alerts) || alerts.length === 0) {
        container.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted small';
        div.textContent = 'אין התראות זמינות';
        container.appendChild(div);
        return;
    }

    // Filter for active alerts (is_triggered = 'new')
    const activeAlerts = alerts.filter((alert) => {
        const triggered = alert?.is_triggered || alert?.status;
        return triggered === 'new';
    });
    
    const alertSubset = (activeAlerts.length ? activeAlerts : alerts).slice(0, 5);

    const list = document.createElement('ul');
    list.className = 'list-group list-group-flush';

    alertSubset.forEach((alert) => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-start gap-2';

        const mainWrap = document.createElement('div');
        mainWrap.className = 'd-flex flex-column';

        const title = document.createElement('span');
        title.className = 'fw-semibold';
        title.textContent = alert?.title || alert?.name || (alert?.id ? `התראה #${alert.id}` : 'לא זמין');
        mainWrap.appendChild(title);

        const metaRow = document.createElement('div');
        metaRow.className = 'd-flex flex-wrap align-items-center gap-2 text-muted small';

        if (alert?.status) {
            const statusHtml = window.FieldRendererService?.renderStatus?.(alert.status, 'alert');
            const statusSpan = document.createElement('span');
            if (statusHtml && statusHtml.includes('<')) {
                // Convert HTML string to DOM elements safely
                const parser = new DOMParser();
                const doc = parser.parseFromString(statusHtml, 'text/html');
                const fragment = document.createDocumentFragment();
                Array.from(doc.body.childNodes).forEach(node => {
                    fragment.appendChild(node.cloneNode(true));
                });
                statusSpan.appendChild(fragment);
            } else {
                statusSpan.textContent = statusHtml || alert.status;
            }
            metaRow.appendChild(statusSpan);
        }

        if (alert?.priority) {
            const priorityHtml = window.FieldRendererService?.renderPriority?.(alert.priority);
            const prioritySpan = document.createElement('span');
            if (priorityHtml && priorityHtml.includes('<')) {
                // Convert HTML string to DOM elements safely
                const parser = new DOMParser();
                const doc = parser.parseFromString(priorityHtml, 'text/html');
                const fragment = document.createDocumentFragment();
                Array.from(doc.body.childNodes).forEach(node => {
                    fragment.appendChild(node.cloneNode(true));
                });
                prioritySpan.appendChild(fragment);
            } else {
                prioritySpan.textContent = alert.priority;
            }
            metaRow.appendChild(prioritySpan);
        }

        const relatedSymbol = alert?.related_symbol || alert?.ticker?.symbol;
        if (relatedSymbol) {
            const symbolSpan = document.createElement('span');
            symbolSpan.textContent = relatedSymbol;
            metaRow.appendChild(symbolSpan);
        }

        const dateLabel = formatDateShort(alert?.created_at || alert?.triggered_at || alert?.updated_at);
        if (dateLabel) {
            const dateSpan = document.createElement('span');
            dateSpan.textContent = dateLabel;
            metaRow.appendChild(dateSpan);
        }

        mainWrap.appendChild(metaRow);
        item.appendChild(mainWrap);

        list.appendChild(item);
    });

    container.textContent = '';
    container.appendChild(list);
}

/**
 * Update dashboard count indicators
 * @param {Object} data - Dashboard data
 * @param {Array} [data.trades=[]] - Array of trades
 * @param {Array} [data.alerts=[]] - Array of alerts
 * @param {Array} [data.accounts=[]] - Array of accounts
 * @returns {void}
 */
function updateDashboardCount({ trades = [], alerts = [], accounts = [] }) {
    const countEl = document.getElementById('dashboardCount');
    if (!countEl) {
        return;
    }

    const activeAlerts = alerts.filter((alert) => (alert?.status || '').toLowerCase() === 'active');
    countEl.textContent = `טריידים: ${trades.length.toLocaleString('he-IL')} • התראות פעילות: ${activeAlerts.length.toLocaleString('he-IL')} • חשבונות: ${accounts.length.toLocaleString('he-IL')}`;
}

/**
 * Update portfolio summary section
 * @param {Object} data - Portfolio data
 * @param {Array} [data.accounts=[]] - Array of accounts
 * @param {Array} [data.trades=[]] - Array of trades
 * @param {Array} [data.cashFlows=[]] - Array of cash flows
 * @param {string} currencySymbol - Currency symbol
 * @returns {void}
 */
function updatePortfolioSummary({ accounts = [], trades = [], cashFlows = [] }, currencySymbol) {
    // #region agent log - H1: updatePortfolioSummary entry
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:updatePortfolioSummary:entry',message:'H1: updatePortfolioSummary called',data:{timestamp:Date.now(),accountsCount:accounts.length,tradesCount:trades.length,cashFlowsCount:cashFlows.length,currencySymbol:currencySymbol,containerExists:!!document.getElementById('portfolioSummaryStats'),currentContent:document.getElementById('portfolioSummaryStats')?.textContent?.substring(0,50),hasLoadingText:document.getElementById('portfolioSummaryStats')?.textContent?.includes('טוען סיכום')},sessionId:'debug-session',runId:'race_condition_debug',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    // Store data for potential re-render
    window.lastPortfolioData = { accounts, trades, cashFlows, currencySymbol };

    const container = document.getElementById('portfolioSummaryStats');
    if (!container) {
        // #region agent log - portfolioSummaryStats container not found
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:updatePortfolioSummary:noContainer',message:'portfolioSummaryStats container not found',data:{allElementIds:Array.from(document.querySelectorAll('[id]')).map(el=>el.id).filter(id=>id.includes('portfolio')),timestamp:Date.now()},sessionId:'debug-session',runId:'widget_loading_fixes',hypothesisId:'portfolio_summary_loading'})}).catch(()=>{});
        // #endregion
        return;
    }

    // #region agent log - container found, checking content
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:updatePortfolioSummary:containerFound',message:'portfolioSummaryStats container found',data:{initialContent:container.textContent?.substring(0,100),hasLoadingText:container.textContent?.includes('טוען סיכום'),timestamp:Date.now()},sessionId:'debug-session',runId:'widget_loading_fixes',hypothesisId:'portfolio_summary_loading'})}).catch(()=>{});
    // #endregion

    // ✅ נקה loading divs לפני רינדור
    // #region agent log - H1: before clearing loading
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:updatePortfolioSummary:beforeClear',message:'H1: Before clearing loading divs',data:{timestamp:Date.now(),currentContent:container.textContent?.substring(0,100),hasLoadingText:container.textContent?.includes('טוען סיכום'),divsCount:container.querySelectorAll('div').length},sessionId:'debug-session',runId:'race_condition_debug',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    Array.from(container.querySelectorAll('div')).forEach(div => {
        if (div.textContent && div.textContent.includes('טוען סיכום')) {
            div.remove();
        }
    });
    
    // ✅ נקה text nodes עם loading text
    // #region agent log - H1: after clearing loading
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:updatePortfolioSummary:afterClear',message:'H1: After clearing loading divs',data:{timestamp:Date.now(),contentAfter:container.textContent?.substring(0,100),hasLoadingText:container.textContent?.includes('טוען סיכום'),divsCount:container.querySelectorAll('div').length},sessionId:'debug-session',runId:'race_condition_debug',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    Array.from(container.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.includes('טוען סיכום')) {
            node.textContent = '';
        }
    });

    if (!accounts.length) {
        container.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted small';
        div.textContent = 'אין נתוני פורטפוליו זמינים';
        container.appendChild(div);
        return;
    }

    // Note: portfolioSummaryStats is a separate container from summaryStats
    // summaryStats uses InfoSummarySystem via updateSummaryStats()
    // This function handles portfolioSummaryStats which is a different display
    // Keeping manual calculation for now as it's a different container with different layout
    const activeAccounts = accounts.filter((account) => (account?.status || '').toLowerCase() === 'open');
    const totalValue = accounts.reduce((sum, account) => {
        const value = account?.total_value ?? account?.opening_balance ?? 0;
        return sum + toNumber(value);
    }, 0);
    const avgValue = accounts.length ? totalValue / accounts.length : 0;
    const openTrades = trades.filter((trade) => (trade?.status || '').toLowerCase() === 'open');
    const pnl = computePortfolioPnL(trades, accounts, cashFlows);

    // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
    const renderAmountHelper = (val) => {
        const numericVal = toNumber(val);
        if (Number.isFinite(numericVal) && window.FieldRendererService?.renderAmount) {
            return window.FieldRendererService.renderAmount(numericVal, currencySymbol, 2, true);
        }
        return '<span class="text-muted">לא זמין</span>';
    };
    
    container.textContent = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'd-flex flex-wrap gap-3 text-muted small';
    
    const span1 = document.createElement('span');
    span1.textContent = `חשבונות פעילים: ${activeAccounts.length.toLocaleString('he-IL')} מתוך ${accounts.length.toLocaleString('he-IL')}`;
    wrapper.appendChild(span1);
    
    const span2 = document.createElement('span');
    const totalValueHtml = renderAmountHelper(totalValue);
    // Convert HTML string to DOM elements safely
    const parser2 = new DOMParser();
    const doc2 = parser2.parseFromString(`שווי כולל: ${totalValueHtml}`, 'text/html');
    const fragment2 = document.createDocumentFragment();
    Array.from(doc2.body.childNodes).forEach(node => {
        fragment2.appendChild(node.cloneNode(true));
    });
    span2.appendChild(fragment2);
    wrapper.appendChild(span2);
    
    const span3 = document.createElement('span');
    const avgValueHtml = renderAmountHelper(avgValue);
    // Convert HTML string to DOM elements safely
    const parser3 = new DOMParser();
    const doc3 = parser3.parseFromString(`שווי ממוצע לחשבון: ${avgValueHtml}`, 'text/html');
    const fragment3 = document.createDocumentFragment();
    Array.from(doc3.body.childNodes).forEach(node => {
        fragment3.appendChild(node.cloneNode(true));
    });
    span3.appendChild(fragment3);
    wrapper.appendChild(span3);
    
    const span4 = document.createElement('span');
    span4.textContent = `טריידים פתוחים: ${openTrades.length.toLocaleString('he-IL')}`;
    wrapper.appendChild(span4);
    
    const span5 = document.createElement('span');
    const pnlHtml = renderAmountHelper(pnl);
    // Convert HTML string to DOM elements safely
    const parser5 = new DOMParser();
    const doc5 = parser5.parseFromString(`P/L כולל: ${pnlHtml}`, 'text/html');
    const fragment5 = document.createDocumentFragment();
    Array.from(doc5.body.childNodes).forEach(node => {
        fragment5.appendChild(node.cloneNode(true));
    });
    span5.appendChild(fragment5);
    wrapper.appendChild(span5);
    
    container.appendChild(wrapper);
}

/**
 * Show dashboard error message
 * @param {string} message - Error message
 * @returns {void}
 */
function showDashboardError(message) {
    const fallback = message || 'שגיאה בטעינת נתוני הדשבורד';
    const recentContainer = document.getElementById('recentTrades');
    if (recentContainer) {
        recentContainer.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-danger small';
        div.textContent = fallback;
        recentContainer.appendChild(div);
    }
    const alertsContainer = document.getElementById('activeAlerts');
    if (alertsContainer) {
        alertsContainer.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-danger small';
        div.textContent = fallback;
        alertsContainer.appendChild(div);
    }
    const countEl = document.getElementById('dashboardCount');
    if (countEl) {
        countEl.textContent = 'שגיאה בטעינת נתונים';
    }
}

/**
 * Handle dashboard error
 * @param {Error} error - Error object
 * @returns {void}
 */
function handleDashboardError(error) {
    const message = error?.message || 'שגיאה בטעינת נתוני הדשבורד';
    window.Logger?.error?.('❌ Error loading dashboard data', { message, stack: error?.stack }, { page: 'index' });
    // Use CRUDResponseHandler for error notification if available
    if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler.handleError) {
        window.CRUDResponseHandler.handleError(error, 'טעינת נתוני דשבורד');
    } else if (typeof window.showErrorNotification === 'function') {
        window.showErrorNotification('שגיאה', message, 6000, 'system');
    }
    showDashboardError(message);
}

/**
 * Process dashboard data
 * @param {Object} data - Dashboard data
 * @param {string} [source='network'] - Data source
 * @returns {void}
 */
function processDashboardData(data, source = 'network') {
    // #region agent log - H4/H5: processDashboardData entry
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:processDashboardData:entry',message:'H4/H5: processDashboardData called',data:{timestamp:Date.now(),source:source,hasData:!!data,tradesCount:data?.trades?.length||0,alertsCount:data?.alerts?.length||0,accountsCount:data?.accounts?.length||0,cashFlowsCount:data?.cashFlows?.length||0,dashboardDataExists:!!window.DashboardData},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4_H5'})}).catch(()=>{});
    // #endregion
    
    console.log('🔄 processDashboardData called:', {
        source: source,
        hasData: !!data,
        tradesCount: data?.trades?.length || 0,
        alertsCount: data?.alerts?.length || 0,
        accountsCount: data?.accounts?.length || 0,
        cashFlowsCount: data?.cashFlows?.length || 0
    });

    // Check authentication before processing data
    const isAuth = window.TikTrackAuth?.isAuthenticated?.() || false;
    console.log('🔐 Authentication check:', { isAuth: isAuth });

    if (!isAuth) {
        // User is not authenticated - clear all displayed data
        data = { trades: [], alerts: [], accounts: [], cashFlows: [] };
        console.log('🚫 User not authenticated - clearing data');
    }

    if (!data) {
        console.log('⚠️ No data to process');
        return;
    }

    let trades = Array.isArray(data.trades) ? data.trades : [];
    let alerts = Array.isArray(data.alerts) ? data.alerts : [];
    let accounts = Array.isArray(data.accounts) ? data.accounts : [];
    let cashFlows = Array.isArray(data.cashFlows) ? data.cashFlows : [];

    console.log('📊 Processed data arrays:', {
        tradesCount: trades.length,
        alertsCount: alerts.length,
        accountsCount: accounts.length,
        cashFlowsCount: cashFlows.length
    });
    if (window.TableDataRegistry) {
        const tradesSummary = window.TableDataRegistry.getSummary('trades');
        if (tradesSummary) {
            const registryTrades = window.TableDataRegistry.getFilteredData('trades', { asReference: false });
            if (Array.isArray(registryTrades) && registryTrades.length > 0) {
                trades = registryTrades;
            }
        }
        const alertsSummary = window.TableDataRegistry.getSummary('alerts');
        if (alertsSummary) {
            const registryAlerts = window.TableDataRegistry.getFilteredData('alerts', { asReference: false });
            if (Array.isArray(registryAlerts)) {
                alerts = registryAlerts;
            }
        }
        const accountsSummary = window.TableDataRegistry.getSummary('trading_accounts');
        if (accountsSummary) {
            const registryAccounts = window.TableDataRegistry.getFilteredData('trading_accounts', { asReference: false });
            if (Array.isArray(registryAccounts)) {
                accounts = registryAccounts;
            }
        }
        const cashFlowsSummary = window.TableDataRegistry.getSummary('cash_flows');
        if (cashFlowsSummary) {
            const registryCashFlows = window.TableDataRegistry.getFilteredData('cash_flows', { asReference: false });
            if (Array.isArray(registryCashFlows)) {
                cashFlows = registryCashFlows;
            }
        }
    }
    const currencySymbol = determineCurrencySymbol(accounts, trades);

    // #region agent log - data processing start
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:processDashboardData:updateStart',message:'Starting UI updates with dashboard data',data:{tradesCount:trades.length,alertsCount:alerts.length,accountsCount:accounts.length,cashFlowsCount:cashFlows.length,currencySymbol:currencySymbol,totalTradesEl:!!document.getElementById('totalTrades'),totalAlertsEl:!!document.getElementById('totalAlerts'),timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_data_processing',hypothesisId:'data_processing'})}).catch(()=>{});
    // #endregion

    // #region agent log - H5: before updateSummaryStats
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:processDashboardData:beforeUpdateSummaryStats',message:'H5: Before updateSummaryStats',data:{timestamp:Date.now(),tradesCount:trades.length,alertsCount:alerts.length,accountsCount:accounts.length,cashFlowsCount:cashFlows.length},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    updateSummaryStats({ trades, alerts, accounts, cashFlows }, currencySymbol);
    
    // #region agent log - H5: after updateSummaryStats
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:processDashboardData:afterUpdateSummaryStats',message:'H5: After updateSummaryStats',data:{timestamp:Date.now(),totalTradesText:document.getElementById('totalTrades')?.textContent,totalAlertsText:document.getElementById('totalAlerts')?.textContent},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    updateActiveAlerts(alerts);
    updateDashboardCount({ trades, alerts, accounts });

    // Force clear all widget loaders after data loads (multiple timeouts for async widgets)
    // Widgets load asynchronously, so we need multiple clearance attempts
    setTimeout(() => {
        clearAllWidgetLoaders();
        checkStuckLoaders(); // ✅ Runtime instrumentation - check for stuck loaders
    }, 2000);  // After 2 seconds
    setTimeout(() => {
        clearAllWidgetLoaders();
        checkStuckLoaders(); // ✅ Runtime instrumentation - check for stuck loaders
    }, 5000);  // After 5 seconds
    setTimeout(() => {
        clearAllWidgetLoaders();
        const stuckLoaders = checkStuckLoaders(); // ✅ Runtime instrumentation - final check
        if (stuckLoaders.length > 0) {
            window.Logger?.error?.('❌ Stuck loaders still present after 10 seconds', { 
                count: stuckLoaders.length, 
                loaders: stuckLoaders,
                page: 'index' 
            });
        }
    }, 10000); // After 10 seconds (final fallback)
    // #region agent log - calling updatePortfolioSummary
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:processDashboardData:callUpdatePortfolioSummary',message:'Calling updatePortfolioSummary',data:{accountsCount:accounts.length,tradesCount:trades.length,cashFlowsCount:cashFlows.length,currencySymbol:currencySymbol,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_data_processing',hypothesisId:'portfolio_summary_loading'})}).catch(()=>{});
    // #endregion

    updatePortfolioSummary({ accounts, trades, cashFlows }, currencySymbol);

    // #region agent log - summary stats updated
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:processDashboardData:summaryUpdated',message:'Summary stats updated',data:{totalTradesText:document.getElementById('totalTrades')?.textContent,totalAlertsText:document.getElementById('totalAlerts')?.textContent,currentBalanceText:document.getElementById('currentBalance')?.textContent,totalPnLText:document.getElementById('totalPnL')?.textContent,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_data_processing',hypothesisId:'data_processing'})}).catch(()=>{});
    // #endregion

    // Update unified recent items widget with trades (trade plans will be loaded separately)
    // IMPORTANT: Only pass trades if we have data - don't pass empty array (it clears existing)
    // This matches the test page behavior
    // #region agent log - H4: before updateRecentItemsWidget
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:processDashboardData:beforeUpdateRecentItems',message:'H4: Before updateRecentItemsWidget',data:{timestamp:Date.now(),tradesCount:trades?.length||0,recentItemsWidgetExists:!!window.RecentItemsWidget,recentItemsWidgetInitialized:window.RecentItemsWidget?.initialized},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    if (trades && trades.length > 0) {
        // #region agent log - H4: calling updateRecentItemsWidget
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:processDashboardData:callUpdateRecentItems',message:'H4: Calling updateRecentItemsWidget',data:{timestamp:Date.now(),tradesCount:trades.length},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        updateRecentItemsWidget(trades, [], currencySymbol);
        
        // #region agent log - H4: after updateRecentItemsWidget
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:processDashboardData:afterUpdateRecentItems',message:'H4: After updateRecentItemsWidget',data:{timestamp:Date.now(),containerExists:!!document.getElementById('recentItemsWidgetContainer')},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
    } else {
        // #region agent log - H4: no trades
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:processDashboardData:noTrades',message:'H4: No trades available',data:{timestamp:Date.now(),tradesCount:trades?.length||0},sessionId:'debug-session',runId:'data_loading_debug',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
    }
    
    // Load and update recent trade plans (will update unified widget with both trades and plans)
    // Pass trades to loadRecentTradePlans so it can preserve them when updating
    loadRecentTradePlans(currencySymbol, trades).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to load recent trade plans', { error: error?.message }, { page: 'index' });
    });

    // Clear loading indicators after processing data
    // Use multiple timeouts to catch indicators that appear later
    // First pass: immediate cleanup for widgets that finished rendering
    setTimeout(() => {
        clearLoadingIndicators('first pass');
    }, 1000); // First pass after 1 second (widgets should clear their own loading state)
    
    // Second pass: catch any remaining indicators
    setTimeout(() => {
        clearLoadingIndicators('second pass');
    }, 3000); // Second pass after 3 seconds
    
    function clearLoadingIndicators(passName) {
        // Comprehensive selectors for all loading indicators
        // Include both generic selectors and specific IDs
        const loadingSelectors = [
            '[class*="loading"]',
            '[class*="spinner"]',
            '[data-loading="true"]',
            '.spinner-border',
            '.spinner-grow',
            // Specific loading element IDs from index.html
            '#assignPlansLoading',
            '#assignTradesLoading',
            '#createPlansLoading',
            '#createTradesLoading',
            '#tagWidgetCloudLoading',
            '#tickerListWidgetActiveLoading',
            '#tickerListWidgetWatchlistLoading',
            '#tickerListWidgetAllLoading',
            '#tickerChartWidgetLoading',
            '#watchListsWidgetLoading',
            '#recentItemsWidgetTradesLoading',
            '#recentItemsWidgetPlansLoading',
            // Generic class-based selectors
            '.unified-pending-loading',
            '.ticker-list-widget-loading',
            '.ticker-chart-widget-loading',
            '.recent-items-widget-loading',
            // Note: :contains() is not a valid CSS selector, will search manually below
        ];
        
        // Get all potential loading elements
        const loadingElements = [];
        
        // Use specific ID selectors first (most reliable)
        const specificIds = [
            'assignPlansLoading', 'assignTradesLoading', 'createPlansLoading', 'createTradesLoading',
            'tagWidgetCloudLoading', 
            'tickerListWidgetActiveLoading', 'tickerListWidgetWatchlistLoading', 'tickerListWidgetAllLoading',
            'tickerChartWidgetLoading',
            'watchListsWidgetLoading',
            'recentItemsWidgetTradesLoading', 'recentItemsWidgetPlansLoading'
        ];
        
        specificIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) loadingElements.push(el);
        });
        
        // Add generic selectors (but avoid duplicates)
        const genericSelectors = [
            '[class*="loading"]:not(.d-none)',
            '[class*="spinner"]:not(.d-none)',
            '[data-loading="true"]',
            '.spinner-border:not(.d-none)',
            '.spinner-grow:not(.d-none)',
            '.unified-pending-loading:not(.d-none)',
            '.ticker-list-widget-loading:not(.d-none)',
            '.ticker-chart-widget-loading:not(.d-none)',
            '.recent-items-widget-loading:not(.d-none)'
        ];
        
        genericSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    // Avoid duplicates
                    if (!loadingElements.includes(el)) {
                        loadingElements.push(el);
                    }
                });
            } catch (e) {
                // Invalid selector, skip
            }
        });
        
        // Also find elements with loading text (manual search since :contains is not CSS)
        // First, check elements that might be loading indicators (have loading-related classes/IDs)
        const allPotentialLoading = document.querySelectorAll('[id*="Loading"], [class*="loading"], [class*="spinner"]');
        allPotentialLoading.forEach(el => {
            // CRITICAL: Skip large containers that contain the entire page content
            // These are not loading indicators, they just contain loading indicators inside them
            const rect = el.getBoundingClientRect();
            const isLargeContainer = rect.width > 500 || rect.height > 500 || 
                                   el.classList.contains('background-wrapper') ||
                                   el.classList.contains('page-body') ||
                                   el.classList.contains('main-content') ||
                                   el.classList.contains('content-section') ||
                                   el.classList.contains('section-body') ||
                                   el.classList.contains('row') ||
                                   el.classList.contains('col-md-6') ||
                                   el.classList.contains('col-12') ||
                                   el.id === 'main';
            if (isLargeContainer) {
                return; // Skip large containers
            }
            
            const text = el.textContent || '';
            // Check if element contains loading text (comprehensive list)
            // But only if the text is mostly loading text (not a large container with loading text inside)
            const trimmedText = text.trim();
            const isMostlyLoadingText = trimmedText.length < 200 && (
                trimmedText.includes('טוען') || 
                trimmedText.includes('טוען סיכום') || 
                trimmedText.includes('טוען נתוני תגיות') ||
                trimmedText.includes('טוען טריידים') || 
                trimmedText.includes('טוען תוכניות') || 
                trimmedText.includes('טוען הצעות') ||
                trimmedText.includes('טוען טיקרים') ||
                trimmedText.includes('טוען טיקרים פעילים') ||
                trimmedText.includes('טוען רשימת צפיה') ||
                trimmedText.includes('טוען כל הטיקרים') ||
                trimmedText.includes('טוען רשימות') ||
                trimmedText.includes('טוען רשימת צפייה') ||
                trimmedText.includes('טוען פורטפוליו')
            );
            
            if (isMostlyLoadingText && !loadingElements.includes(el)) {
                loadingElements.push(el);
            }
        });
        
        // CRITICAL: Also search for SPAN elements inside loading containers
        // These SPANs contain the actual "טוען..." text but may not have loading classes/IDs
        specificIds.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                // Find all SPAN elements inside the container that contain loading text
                const spans = container.querySelectorAll('span, div, p, td, th, li');
                spans.forEach(span => {
                    const text = (span.textContent || '').trim();
                    if (text.includes('טוען') && !loadingElements.includes(span)) {
                        loadingElements.push(span);
                        // #region agent log - found SPAN in container
                        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearLoadingIndicators:foundSpan',message:'Found SPAN in loading container',data:{containerId:id,spanId:span.id||'no-id',spanText:text.substring(0,50),spanTagName:span.tagName,containerHasDNone:container.classList.contains('d-none'),spanHasDNone:span.classList.contains('d-none'),timestamp:Date.now()},sessionId:'debug-session',runId:'loader_clearance_fix',hypothesisId:'loading_indicators_clearance'})}).catch(()=>{});
                        // #endregion
                    }
                });
            } else {
                // #region agent log - container not found
                fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearLoadingIndicators:containerNotFound',message:'Loading container not found',data:{containerId:id,timestamp:Date.now()},sessionId:'debug-session',runId:'loader_clearance_fix',hypothesisId:'loading_indicators_clearance'})}).catch(()=>{});
                // #endregion
            }
        });
        
        let clearedCount = 0;
        let skippedCount = 0;
        
        loadingElements.forEach(el => {
            // CRITICAL: Never hide <body> or <html> elements - this would hide the entire page!
            if (el.tagName === 'BODY' || el.tagName === 'HTML') {
                skippedCount++;
                return; // Skip hiding these critical elements
            }
            
            // CRITICAL: Never hide large containers that contain the entire page content
            const rect = el.getBoundingClientRect();
            const isLargeContainer = rect.width > 500 || rect.height > 500 || 
                                   el.classList.contains('background-wrapper') ||
                                   el.classList.contains('page-body') ||
                                   el.classList.contains('main-content') ||
                                   el.classList.contains('content-section') ||
                                   el.classList.contains('section-body') ||
                                   el.classList.contains('row') ||
                                   el.classList.contains('col-md-6') ||
                                   el.classList.contains('col-12') ||
                                   el.id === 'main';
            if (isLargeContainer) {
                skippedCount++;
                return; // Skip hiding these critical containers
            }
            
            // Always hide loading indicators regardless of visibility
            // They should be hidden when data is loaded
            const computedStyle = window.getComputedStyle(el);
            const wasVisible = computedStyle.display !== 'none' && 
                              !el.classList.contains('d-none') &&
                              el.offsetWidth > 0 && 
                              el.offsetHeight > 0;
            
            // #region agent log - hiding element
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearLoadingIndicators:hidingElement',message:'Hiding loading element',data:{elId:el.id||'no-id',elTagName:el.tagName,elText:(el.textContent||'').substring(0,50),wasVisible,parentId:el.parentElement?.id||'no-parent-id',beforeDisplay:el.style.display,beforeDNone:el.classList.contains('d-none'),timestamp:Date.now()},sessionId:'debug-session',runId:'loader_clearance_fix',hypothesisId:'loading_indicators_clearance'})}).catch(()=>{});
            // #endregion
            
            // Hide using multiple methods to ensure it's hidden
            el.style.display = 'none';
            el.classList.add('d-none');
            el.removeAttribute('data-loading');
            el.setAttribute('aria-hidden', 'true');
            
            // #region agent log - element hidden
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearLoadingIndicators:elementHidden',message:'Element hidden',data:{elId:el.id||'no-id',afterDisplay:el.style.display,afterDNone:el.classList.contains('d-none'),computedDisplay:window.getComputedStyle(el).display,timestamp:Date.now()},sessionId:'debug-session',runId:'loader_clearance_fix',hypothesisId:'loading_indicators_clearance'})}).catch(()=>{});
            // #endregion
            
            // Also try to hide parent if it's a loading container
            // BUT: Never hide <body> or <html> even if they're parents
            // AND: Never hide large containers that contain the entire page content
            const parent = el.parentElement;
            if (parent && parent.tagName !== 'BODY' && parent.tagName !== 'HTML') {
                // CRITICAL: Check if parent is a large container - never hide these!
                const parentRect = parent.getBoundingClientRect();
                const isParentLargeContainer = parentRect.width > 500 || parentRect.height > 500 || 
                                             parent.classList.contains('background-wrapper') ||
                                             parent.classList.contains('page-body') ||
                                             parent.classList.contains('main-content') ||
                                             parent.classList.contains('content-section') ||
                                             parent.classList.contains('section-body') ||
                                             parent.classList.contains('row') ||
                                             parent.classList.contains('col-md-6') ||
                                             parent.classList.contains('col-12') ||
                                             parent.id === 'main';
                
                if (!isParentLargeContainer) {
                    const parentClasses = parent.classList;
                    if (parentClasses.contains('loading') || 
                        parentClasses.contains('spinner-container') ||
                        parentClasses.contains('unified-pending-loading') ||
                        parentClasses.contains('ticker-list-widget-loading') ||
                        parentClasses.contains('ticker-chart-widget-loading') ||
                        parentClasses.contains('recent-items-widget-loading') ||
                        parent.id && parent.id.includes('Loading')) {
                        parent.style.display = 'none';
                        parent.classList.add('d-none');
                    }
                }
            }
            
            if (wasVisible) {
                clearedCount++;
            } else {
                skippedCount++;
            }
        });
        
        // Also clear "no data" indicators if we have data
        const dataElements = document.querySelectorAll('[data-item], [data-entity], .data-row, .entity-item, .trade-row, .recent-items-widget-item, .alert-row');
        if (dataElements.length > 0) {
            // Hide "no data" messages when we have data
            // Use valid CSS selectors only (no :contains which is jQuery-only)
            const noDataSelectors = [
                '[class*="empty"]:not(.d-none)',
                '.alert-info:not(.d-none)',
                '.alert-success:not(.d-none)',
                '.text-muted:not(.d-none)'
            ];
            
            noDataSelectors.forEach(selector => {
                try {
                    const noDataElements = document.querySelectorAll(selector);
                    noDataElements.forEach(el => {
                        const text = el.textContent || '';
                        // Hide if it's a "no data" message
                        if (text.includes('אין') || text.includes('no data') || text.includes('empty') ||
                            text.includes('אין נתונים') || text.includes('אין התראות') || text.includes('אין טריידים') ||
                            text.includes('אין נתוני פורטפוליו')) {
                            el.style.display = 'none';
                            el.classList.add('d-none');
                        }
                    });
                } catch (e) {
                    // Invalid selector, skip
                }
            });
        }
        
        // Count remaining loading indicators after cleanup
        // Use more comprehensive selectors to catch all loading indicators
        const remainingLoadingSelectors = [
            '[id*="Loading"]:not(.d-none)',
            '[class*="loading"]:not(.d-none)',
            '[class*="spinner"]:not(.d-none)',
            '.spinner-border:not(.d-none)',
            '.spinner-grow:not(.d-none)'
        ];
        let remainingLoading = 0;
        const remainingLoadingElements = [];
        remainingLoadingSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const computedStyle = window.getComputedStyle(el);
                    if (computedStyle.display !== 'none' && !el.classList.contains('d-none')) {
                        remainingLoading++;
                        remainingLoadingElements.push({
                            id: el.id || 'no-id',
                            className: el.className || 'no-class',
                            text: (el.textContent || '').substring(0, 50),
                            visible: computedStyle.display !== 'none'
                        });
                    }
                });
            } catch (e) {
                // Invalid selector, skip
            }
        });
        // Also check for elements with loading text that weren't caught
        const allRemainingPotential = document.querySelectorAll('[id*="Loading"], [class*="loading"], [class*="spinner"]');
        allRemainingPotential.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.display !== 'none' && !el.classList.contains('d-none')) {
                const text = el.textContent || '';
                if (text.includes('טוען')) {
                    const alreadyCounted = remainingLoadingElements.some(e => e.id === (el.id || 'no-id'));
                    if (!alreadyCounted) {
                        remainingLoading++;
                        remainingLoadingElements.push({
                            id: el.id || 'no-id',
                            className: el.className || 'no-class',
                            text: text.substring(0, 50),
                            visible: computedStyle.display !== 'none'
                        });
                    }
                }
            }
        });
        
        // Log remaining loading elements for debugging
        if (remainingLoading > 0 && passName === 'second pass') {
            // #region agent log - remaining loading elements
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearLoadingIndicators:remainingElements',message:'Remaining loading elements detected',data:{count:remainingLoading,elements:remainingLoadingElements,timestamp:Date.now()},sessionId:'debug-session',runId:'loader_clearance_fix',hypothesisId:'loading_indicators_clearance'})}).catch(()=>{});
            // #endregion
        }
        
        const remainingNoData = document.querySelectorAll('[class*="empty"]:not(.d-none), .alert-info:not(.d-none), .alert-success:not(.d-none)').length;
        
        if (clearedCount > 0 || skippedCount > 0 || passName === 'second pass') {
            // #region agent log - loading indicators cleared
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearLoadingIndicators',message:'Cleared loading indicators',data:{pass:passName,cleared:clearedCount,skipped:skippedCount,total:loadingElements.length,remainingLoading,remainingNoData,dataElementsCount:dataElements.length,timestamp:Date.now()},sessionId:'debug-session',runId:'loader_clearance_fix',hypothesisId:'loading_indicators_clearance'})}).catch(()=>{});
            // #endregion
            window.Logger?.info?.('✅ Cleared loading indicators', { 
                pass: passName,
                cleared: clearedCount,
                skipped: skippedCount,
                total: loadingElements.length,
                remainingLoading,
                remainingNoData,
                dataElementsCount: dataElements.length
            }, { page: 'index' });
        }
        
        // Verify widget rendered data on second pass
        if (passName === 'second pass') {
            // Comprehensive check for ALL loading indicators in DOM (not just those matching selectors)
            const allLoadingElementsInDOM = [];
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                // CRITICAL: Never process <body> or <html> elements - they contain all page content
                if (el.tagName === 'BODY' || el.tagName === 'HTML') {
                    return; // Skip these critical elements
                }
                
                // CRITICAL: Never process large containers that contain the entire page content
                const rect = el.getBoundingClientRect();
                const isLargeContainer = rect.width > 500 || rect.height > 500 || 
                                       el.classList.contains('background-wrapper') ||
                                       el.classList.contains('page-body') ||
                                       el.classList.contains('main-content') ||
                                       el.classList.contains('content-section') ||
                                       el.classList.contains('section-body') ||
                                       el.classList.contains('row') ||
                                       el.classList.contains('col-md-6') ||
                                       el.classList.contains('col-12') ||
                                       el.id === 'main';
                if (isLargeContainer) {
                    return; // Skip these critical containers
                }
                
                const computedStyle = window.getComputedStyle(el);
                const isVisible = computedStyle.display !== 'none' && 
                                 computedStyle.visibility !== 'hidden' &&
                                 computedStyle.opacity !== '0' &&
                                 !el.classList.contains('d-none');
                
                if (isVisible) {
                    const id = el.id || '';
                    // className can be a string or DOMTokenList, convert to string
                    const className = typeof el.className === 'string' ? el.className : (el.className?.baseVal || el.className?.toString() || '');
                    const text = (el.textContent || '').trim();
                    const hasLoadingId = id.includes('Loading') || id.includes('loading');
                    const hasLoadingClass = className && typeof className === 'string' && (className.includes('loading') || className.includes('spinner'));
                    const hasLoadingText = text.includes('טוען') || text.includes('טוען סיכום') || text.includes('טוען נתוני תגיות') ||
                                         text.includes('טוען טריידים') || text.includes('טוען תוכניות') || text.includes('טוען הצעות') ||
                                         text.includes('טוען טיקרים') || text.includes('טוען רשימת צפיה') || text.includes('טוען כל הטיקרים') ||
                                         text.includes('טוען רשימות') || text.includes('טוען רשימת צפייה') || text.includes('טוען פורטפוליו');
                    
                    if (hasLoadingId || hasLoadingClass || hasLoadingText) {
                        allLoadingElementsInDOM.push({
                            id: id || 'no-id',
                            className: className || 'no-class',
                            text: text.substring(0, 80),
                            tagName: el.tagName,
                            parentId: el.parentElement?.id || 'no-parent-id'
                        });
                    }
                }
            });
            
            // #region agent log - comprehensive loading elements check
            fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/index.js:clearLoadingIndicators:comprehensiveCheck',message:'Comprehensive loading elements check',data:{remainingLoading,allLoadingElementsCount:allLoadingElementsInDOM.length,allLoadingElements:allLoadingElementsInDOM.slice(0,20),timestamp:Date.now()},sessionId:'debug-session',runId:'loader_clearance_fix',hypothesisId:'loading_indicators_clearance'})}).catch(()=>{});
            // #endregion
            
            window.Logger?.info?.('📋 Data elements after render', { 
                count: dataElements.length,
                loadingIndicatorsRemaining: remainingLoading,
                allLoadingElementsInDOM: allLoadingElementsInDOM.length,
                noDataIndicatorsRemaining: remainingNoData
            }, { page: 'index' });
            
            // If we found loading elements that weren't caught by selectors, try to hide them
            if (allLoadingElementsInDOM.length > 0) {
                allLoadingElementsInDOM.forEach(item => {
                    try {
                        const el = document.getElementById(item.id) || 
                                  Array.from(document.querySelectorAll(`.${item.className.split(' ')[0]}`)).find(e => e.textContent?.includes(item.text.substring(0, 20)));
                        if (el) {
                            el.style.display = 'none';
                            el.classList.add('d-none');
                            el.setAttribute('aria-hidden', 'true');
                        }
                    } catch (e) {
                        // Skip if element not found
                    }
                });
            }
        }
    }
    
    // If no trades were loaded, try to fetch them directly from API for the widget
    if (!trades || trades.length === 0) {
      window.Logger?.info?.('📊 No trades in dashboard data, attempting to load trades for widget...', { page: 'index' });
      // Try to load trades from API directly (fallback if DashboardData returns empty)
      fetch('/api/trades/', { headers: { Accept: 'application/json' } })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((payload) => {
          const tradesData = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
          if (Array.isArray(tradesData) && tradesData.length > 0) {
            window.Logger?.info?.('📊 Loaded trades for widget directly from API', { count: tradesData.length, page: 'index' });
            // IMPORTANT: Update widget with trades, but preserve existing trade plans
            // Don't pass empty array for tradePlans - let widget preserve existing
            updateRecentItemsWidget(tradesData, [], currencySymbol);
            // Also reload trade plans with the newly loaded trades to ensure both are displayed
            loadRecentTradePlans(currencySymbol, tradesData).catch(() => {});
          } else {
            window.Logger?.debug?.('📊 No trades found in API response', { page: 'index' });
          }
        })
        .catch((error) => {
          window.Logger?.warn?.('⚠️ Failed to load trades for widget from API', { error: error?.message }, { page: 'index' });
        });
    }

    dashboardDataState.lastLoadedAt = Date.now();
    dashboardDataState.source = source;
    dashboardDataState.data = { trades, alerts, accounts, cashFlows };
    window.dashboardData = dashboardDataState.data;
}

/**
 * Load and update recent trade plans
 * @param {string} currencySymbol - Currency symbol
 * @param {Array} [currentTrades=[]] - Current trades array for unified widget
 * @returns {Promise<void>}
 */
async function loadRecentTradePlans(currencySymbol, currentTrades = []) {
    try {
        let tradePlans = [];
        
        // Try to use trade plans data service if available
        if (window.TradePlansDataService?.loadTradePlansData) {
            tradePlans = await window.TradePlansDataService.loadTradePlansData({ force: false });
            if (!Array.isArray(tradePlans)) {
                tradePlans = [];
            }
        } else {
            // Fallback: fetch directly from API with timeout to prevent hanging
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

                const response = await fetch('/api/trade_plans/', {
                    headers: { Accept: 'application/json' },
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const payload = await response.json();
                tradePlans = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
            } catch (fetchError) {
                // If fetch fails, log warning and continue with empty array
                window.Logger?.warn?.('⚠️ [index.js] Trade plans API fetch failed, continuing with empty data', {
                    error: fetchError.message,
                    page: 'index'
                });
                tradePlans = [];
            }
        }
        
        // Update unified widget if available
        if (window.RecentItemsWidget?.render) {
            // Update with both trades and trade plans
            // IMPORTANT: Don't pass trades at all if currentTrades is empty - let widget preserve existing trades from state
            // This matches the test page behavior where both are passed together
            const renderData = {
                tradePlans: tradePlans,
                currencySymbol: currencySymbol
            };
            // Only add trades if we have valid data (don't pass empty array or undefined - it clears existing)
            if (Array.isArray(currentTrades) && currentTrades.length > 0) {
                renderData.trades = currentTrades;
            }
            // If currentTrades is empty, don't pass it at all - widget will preserve existing trades from state
            
            window.RecentItemsWidget.render(renderData);
        } else {
            window.Logger?.warn?.('⚠️ [index.js] RecentItemsWidget not available, falling back to separate widget', { page: 'index' });
            // Fallback to separate widget
            updateRecentTradePlans(tradePlans, currencySymbol);
        }
    } catch (error) {
        // Downgrade לסיווג אזהרה כדי לא להפיל את דף הבית בסלניום/לוגים
        window.Logger?.warn?.('⚠️ [index.js] Failed to load trade plans for recent widget', { 
            error: error?.message,
            stack: error?.stack,
            page: 'index' 
        });
        // Update unified widget with empty trade plans if available
        if (window.RecentItemsWidget?.render) {
            window.Logger?.info?.('🔍 [index.js] Updating widget with empty trade plans due to error', { page: 'index' });
            updateRecentItemsWidget(currentTrades, [], currencySymbol);
        } else {
            const container = document.getElementById('recentTradePlans');
            if (container) {
                container.textContent = '';
                const div = document.createElement('div');
                div.className = 'text-muted small';
                div.textContent = 'אין תוכניות זמינות';
                container.appendChild(div);
            }
        }
    }
}

/**
 * Legacy function to fetch dashboard data from API (DEPRECATED)
 * @deprecated Use loadDashboardDataFromService instead
 * @returns {Promise<Object>} Dashboard data
 */
async function legacyFetchDashboardDataFromApi() {
    const fetchJsonList = async (url, label) => {
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        // Use CRUDResponseHandler.handleLoadResponse for consistent error handling
        if (!response.ok) {
            if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler.handleLoadResponse) {
                // Use CRUDResponseHandler for consistent error handling with retry mechanism
                return window.CRUDResponseHandler.handleLoadResponse(response, {
                    tableId: `${label}Table`,
                    entityName: label,
                    columns: undefined, // Auto-detect
                    onRetry: () => fetchJsonList(url, label)
                });
            } else {
                // Fallback to original error handling
                throw new Error(`טעינת ${label} נכשלה (${response.status})`);
            }
        }
        
        const payload = await response.json();
        if (payload?.status && payload.status !== 'success') {
            const errorMessage = payload?.error?.message || payload?.message || `טעינת ${label} נכשלה`;
            // Use CRUDResponseHandler for error notification if available
            if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler.handleError) {
                window.CRUDResponseHandler.handleError(new Error(errorMessage), `טעינת ${label}`);
                return []; // Return empty array instead of throwing
            } else {
                throw new Error(errorMessage);
            }
        }
        return normalizeArray(payload);
    };

    const [trades, alerts, accounts, cashFlows] = await Promise.all([
        fetchJsonList(DASHBOARD_ENDPOINTS.trades, 'טריידים').catch((error) => {
            window.Logger?.error?.('❌ Failed to load trades for dashboard', { error: error?.message }, { page: 'index' });
            // CRUDResponseHandler.handleLoadResponse already handled the error and returned []
            // So we return [] instead of throwing to allow other data to load
            return [];
        }),
        fetchJsonList(DASHBOARD_ENDPOINTS.alerts, 'התראות').catch((error) => {
            window.Logger?.error?.('❌ Failed to load alerts for dashboard', { error: error?.message }, { page: 'index' });
            // CRUDResponseHandler.handleLoadResponse already handled the error and returned []
            return [];
        }),
        fetchJsonList(DASHBOARD_ENDPOINTS.accounts, 'חשבונות מסחר').catch((error) => {
            window.Logger?.error?.('❌ Failed to load trading accounts for dashboard', { error: error?.message }, { page: 'index' });
            // CRUDResponseHandler.handleLoadResponse already handled the error and returned []
            return [];
        }),
        fetchJsonList(DASHBOARD_ENDPOINTS.cashFlows, 'תזרימי מזומנים').catch((error) => {
            window.Logger?.warn?.('⚠️ Failed to load cash flows for dashboard', { error: error?.message }, { page: 'index' });
            // CRUDResponseHandler.handleLoadResponse already handled the error and returned []
            return [];
        })
    ]);

    const result = { trades, alerts, accounts, cashFlows };
    processDashboardData(result, 'network');
    return result;
}

/**
 * Load dashboard data from service
 * @param {Object} [options={}] - Loading options
 * @param {boolean} [options.force=false] - Force refresh from server
 * @returns {Promise<Object>} Dashboard data
 */
async function loadDashboardDataFromService(options = {}) {
    const { force = false } = options;

    if (window.DashboardData?.load) {
        if (force && typeof window.DashboardData.invalidate === 'function') {
            try {
                await window.DashboardData.invalidate();
            } catch (error) {
                window.Logger?.warn?.('⚠️ Failed to invalidate dashboard data cache', { error: error?.message }, { page: 'index' });
            }
        }
        return window.DashboardData.load({ force });
    }

    window.Logger?.warn?.('⚠️ DashboardData service not available, using legacy fetch', { page: 'index' });
    return legacyFetchDashboardDataFromApi();
}

window.loadDashboardData = async function(options = {}) {
    const { force = false, ttl = DASHBOARD_DATA_TTL } = options;

    // Check authentication before loading data
    const isAuth = window.TikTrackAuth?.isAuthenticated?.() || false;
    const hasAuthToken = !!sessionStorage.getItem('authToken') || !!window.authToken;
    
    if (!isAuth && hasAuthToken) {
        // Has token but isAuthenticated() failed - attempt server verification
        window.Logger?.warn?.('⚠️ isAuthenticated() returned false but token exists - attempting server verification', { page: 'index' });
        
        try {
            // Attempt server authentication check
            if (window.TikTrackAuth?.checkAuthentication) {
                const authCheck = await window.TikTrackAuth.checkAuthentication();
                if (authCheck?.authenticated) {
                    window.Logger?.info?.('✅ Server authentication check passed - proceeding with data load', { page: 'index' });
                    // Continue with data loading below
                } else {
                    window.Logger?.warn?.('⚠️ Server authentication check failed - clearing data', { page: 'index' });
                    // Clear dashboard data and loading indicators
                    if (window.dashboardDataState) {
                        window.dashboardDataState.data = { trades: [], alerts: [], accounts: [], cashFlows: [] };
                        window.dashboardDataState.lastLoadedAt = null;
                    }
                    // Clear displayed data
                    processDashboardData({ trades: [], alerts: [], accounts: [], cashFlows: [] }, 'network');
                    // Clear loading indicators
                    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [data-loading="true"]');
                    loadingElements.forEach(el => {
                        if (el.style.display !== 'none') {
                            el.style.display = 'none';
                        }
                        el.removeAttribute('data-loading');
                    });
                    // Show error message
                    if (typeof showDashboardError === 'function') {
                        showDashboardError('יש להתחבר כדי לצפות בנתונים');
                    }
                    return { trades: [], alerts: [], accounts: [], cashFlows: [] };
                }
            } else {
                throw new Error('checkAuthentication not available');
            }
        } catch (error) {
            window.Logger?.warn?.('⚠️ Authentication check failed - clearing data', { error: error?.message, page: 'index' });
            // Clear dashboard data and loading indicators
            if (window.dashboardDataState) {
                window.dashboardDataState.data = { trades: [], alerts: [], accounts: [], cashFlows: [] };
                window.dashboardDataState.lastLoadedAt = null;
            }
            // Clear displayed data
            processDashboardData({ trades: [], alerts: [], accounts: [], cashFlows: [] }, 'network');
            // Clear loading indicators
            const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [data-loading="true"]');
            loadingElements.forEach(el => {
                if (el.style.display !== 'none') {
                    el.style.display = 'none';
                }
                el.removeAttribute('data-loading');
            });
            // Show error message
            if (typeof showDashboardError === 'function') {
                showDashboardError('יש להתחבר כדי לצפות בנתונים');
            }
            return { trades: [], alerts: [], accounts: [], cashFlows: [] };
        }
    } else if (!isAuth) {
        // User is not authenticated and no token exists - clear dashboard data and return empty
        window.Logger?.info?.('ℹ️ User not authenticated - clearing dashboard data', { page: 'index' });
        if (window.dashboardDataState) {
            window.dashboardDataState.data = { trades: [], alerts: [], accounts: [], cashFlows: [] };
            window.dashboardDataState.lastLoadedAt = null;
        }
        // Clear displayed data
        processDashboardData({ trades: [], alerts: [], accounts: [], cashFlows: [] }, 'network');
        // Clear loading indicators
        const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [data-loading="true"]');
        loadingElements.forEach(el => {
            if (el.style.display !== 'none') {
                el.style.display = 'none';
            }
            el.removeAttribute('data-loading');
        });
        // Show error message
        if (typeof showDashboardError === 'function') {
            showDashboardError('יש להתחבר כדי לצפות בנתונים');
        }
        return { trades: [], alerts: [], accounts: [], cashFlows: [] };
    }

    if (!force && dashboardDataPromise) {
        return dashboardDataPromise;
    }

    const executeLoad = async () => {
        if (force) {
            // Try CacheSyncManager first (preferred method)
            if (window.CacheSyncManager?.invalidateByAction) {
                try {
                    await window.CacheSyncManager.invalidateByAction('dashboard-updated');
                } catch (error) {
                    window.Logger?.warn?.('⚠️ CacheSyncManager.invalidateByAction failed, falling back', {
                        page: 'index',
                        error: error?.message,
                    });
                    // Fallback to direct invalidation
                    if (window.UnifiedCacheManager?.clearByPattern) {
                        try {
                            await window.UnifiedCacheManager.clearByPattern(DASHBOARD_DATA_KEY);
                        } catch (clearError) {
                            window.Logger?.warn?.('⚠️ Failed to clear dashboard cache', { error: clearError?.message }, { page: 'index' });
                        }
                    }
                }
            } else if (window.UnifiedCacheManager?.clearByPattern) {
                // Fallback if CacheSyncManager not available
                try {
                    await window.UnifiedCacheManager.clearByPattern(DASHBOARD_DATA_KEY);
                } catch (clearError) {
                    window.Logger?.warn?.('⚠️ Failed to clear dashboard cache', { error: clearError?.message }, { page: 'index' });
                }
            }

            const fresh = await loadDashboardDataFromService({ force: true });
            processDashboardData(fresh, 'network');
            return fresh;
        }

        if (window.CacheTTLGuard?.ensure) {
            const cachedOrFresh = await window.CacheTTLGuard.ensure(
                DASHBOARD_DATA_KEY,
                () => loadDashboardDataFromService({ force: false }),
                {
                    ttl,
                    afterRead: (cached) => {
                        if (cached) {
                            processDashboardData(cached, 'cache');
                        }
                    },
                    afterLoad: (fresh) => {
                        if (fresh) {
                            processDashboardData(fresh, 'network');
                        }
                    }
                }
            );

            if (cachedOrFresh) {
                return cachedOrFresh;
            }
        }

        const fallback = await loadDashboardDataFromService({ force: false });
        processDashboardData(fallback, 'network');
        return fallback;
    };

    dashboardDataPromise = executeLoad()
        .catch((error) => {
            // Use CRUDResponseHandler for error handling if available
            if (typeof window.CRUDResponseHandler === 'object' && window.CRUDResponseHandler.handleError) {
                window.CRUDResponseHandler.handleError(error, 'טעינת נתוני דשבורד');
            } else {
                handleDashboardError(error);
            }
            // Don't throw - return empty data structure to allow page to continue
            return { trades: [], alerts: [], accounts: [], cashFlows: [] };
        })
        .finally(() => {
            dashboardDataPromise = null;
        });

    return dashboardDataPromise;
};

if (typeof window.refreshDashboard !== 'function') {
    window.refreshDashboard = async function(force = false) {
        return window.loadDashboardData({ force, ttl: DASHBOARD_DATA_TTL });
    };
}

window.dashboardDataState = dashboardDataState;

// ===== TAB MANAGEMENT =====
/**
 * Switch between table tabs on the index page
 * @param {string} tabName - The name of the tab to switch to
 * @returns {void}
 */
function switchTableTab(tabName) {
    // Hide all table contents
    document.querySelectorAll('.table-content').forEach(table => {
        table.classList.add('d-none');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.table-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected table
    const selectedTable = document.getElementById(tabName + 'Container');
    if (selectedTable) {
        selectedTable.classList.remove('d-none');
    }

    // Add active class to selected tab
    event.target.classList.add('active');
}

/**
 * Refresh overview data on the index page
 * Fetches and updates overview section data
 * @returns {void}
 */
async function refreshOverview() {
    window.Logger.info('Refreshing overview data...', { page: "index" });
    try {
        await window.loadDashboardData();
    } catch (error) {
        window.Logger?.error?.('❌ Error refreshing dashboard overview', { message: error?.message }, { page: 'index' });
    }
}

/**
 * Export overview data from the index page
 * @param {string} [format='csv'] - Export format (csv, json, etc.)
 * @returns {void}
 */
function exportOverview(format = 'csv') {
    if (typeof showNotification === 'function') {
        showNotification('info', 'ייצוא נתוני סקירה יהיה זמין בעתיד');
    } else {
        window.Logger.info('📤 Export overview data - Future feature', { page: "index" });
    }
}

/**
 * Execute quick actions on the index page
 * @param {string} actionType - Type of quick action to execute
 * @returns {void}
 */
function quickAction(actionType) {
    if (typeof showNotification === 'function') {
        showNotification('info', `פעולה מהירה '${actionType}' תהיה זמינה בעתיד`);
    } else {
        window.Logger.info(`⚡ Quick action: ${actionType} - Future feature`, { page: "index" });
    }
}

// toggleAllSections function removed - use global window.toggleAllSections directly
// toggleSection function removed - use global window.toggleSection directly

// Charts removed - no longer used on index page
// REMOVED: All chart-related functions (createTradesStatusChart, createPerformanceChart, createAccountChart, createMixedChart, refreshAllCharts, refreshChart, exportChart, exportAllCharts)

/**
 * Replace all <img> tags with IconSystem.renderIcon()
 * @returns {Promise<void>}
 */
async function replaceIconsWithIconSystem() {
    if (!window.IconSystem || !window.IconSystem.initialized) {
        // Wait for IconSystem to be ready
        if (window.IconSystem && typeof window.IconSystem.initialize === 'function') {
            await window.IconSystem.initialize();
        } else {
            // Retry after delay
            setTimeout(() => replaceIconsWithIconSystem(), 500);
            return;
        }
    }

    // Icon mapping: img src path -> IconSystem type and name
    const iconMappings = {
        // Entity icons
        'home.svg': { type: 'entity', name: 'home' },
        'executions.svg': { type: 'entity', name: 'execution' },
        'trades.svg': { type: 'entity', name: 'trade' },
        'trade_plans.svg': { type: 'entity', name: 'trade_plan' },
        'trading_accounts.svg': { type: 'entity', name: 'account' }
    };

    // Find all img tags with icon paths
    const imgTags = document.querySelectorAll('img[src*="/trading-ui/images/icons/"]');
    
    for (const img of imgTags) {
        const src = img.getAttribute('src') || '';
        const alt = img.getAttribute('alt') || '';
        const size = img.getAttribute('width') || img.getAttribute('height') || '16';
        const className = img.getAttribute('class') || 'icon';
        
        // Extract icon name from path
        const iconFileName = src.split('/').pop();
        const mapping = iconMappings[iconFileName];
        
        if (mapping) {
            try {
                const iconHTML = await window.IconSystem.renderIcon(mapping.type, mapping.name, {
                    size: size,
                    alt: alt,
                    class: className
                });
                
                // Replace img with rendered icon
                // Convert HTML string to DOM elements safely
                const parser = new DOMParser();
                const doc = parser.parseFromString(iconHTML, 'text/html');
                const newIcon = doc.body.firstElementChild;
                
                if (newIcon) {
                    img.parentNode.replaceChild(newIcon.cloneNode(true), img);
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to render icon', { 
                        icon: iconFileName, 
                        error, 
                        page: 'index' 
                    });
                }
            }
        }
    }
}

// Initialize index page - integrated with unified system
// Flag to prevent duplicate initialization
let indexPageInitialized = false;

window.initializeIndexPage = async function() {
    // Prevent duplicate initialization
    if (indexPageInitialized) {
        window.Logger.info('⚠️ Index page already initialized, skipping...', { page: "index" });
        return;
    }
    
    indexPageInitialized = true;
    window.Logger.info('🏠 Index page initialized via unified system', { page: "index" });
    
    // Replace icons with IconSystem
    if (typeof window.replaceIconsInContext === 'function') {
        window.replaceIconsInContext().catch(() => {
            // Ignore errors - icons will load when ready
        });
    } else {
        // Fallback to local function
        replaceIconsWithIconSystem().catch(() => {
            // Ignore errors - icons will load when ready
        });
    }
    
    // Initialize overview data
    await refreshOverview();
    
    // Setup action buttons
    const refreshButton = document.querySelector('.btn');
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshOverview);
    }
    
    const exportButton = document.querySelector('.btn');
    if (exportButton) {
        exportButton.addEventListener('click', exportOverview);
    }
    
    // Charts removed - no longer used on index page
 
    // Note: positions & portfolio system initialization is handled by page-initialization-configs.js
    // which calls initPositionsPortfolio() after initializeIndexPage()
    
    // Note: Old pending widgets (PendingExecutionTradeCreation, PendingExecutionsHighlights, PendingTradePlanWidget)
    // have been removed and replaced by UnifiedPendingActionsWidget which is initialized in page-initialization-configs.js
};

// Note: initializeIndexPage() is now called via pageInitializationConfigs.index.customInitializers
// in unified-app-initializer.js, so we don't need to call it directly here.
// This prevents duplicate chart initialization.

// Export functions to global scope
window.switchTableTab = switchTableTab;
window.refreshOverview = refreshOverview;
window.exportOverview = exportOverview;
window.quickAction = quickAction;
// toggleAllSections and toggleSection exports removed - use global functions directly

// Chart functions removed - no longer used on index page

// Detailed Log Functions for Index Page
/**
 * Generate detailed log for index page debugging
 * @returns {string} JSON string with detailed log data
 */
function generateDetailedLog() {
    try {
        const logData = {
            timestamp: new Date().toISOString(),
            page: 'index',
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            performance: {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            },
            memory: window.performance.memory ? {
                used: window.performance.memory.usedJSHeapSize,
                total: window.performance.memory.totalJSHeapSize,
                limit: window.performance.memory.jsHeapSizeLimit
            } : null,
            dashboardStats: {
                portfolioValue: document.querySelector('.hero-stat-number')?.textContent || 'לא נמצא',
                return: document.querySelectorAll('.hero-stat-number')[1]?.textContent || 'לא נמצא',
                tradesCount: document.querySelectorAll('.hero-stat-number')[2]?.textContent || 'לא נמצא',
                alertsCount: document.querySelectorAll('.hero-stat-number')[3]?.textContent || 'לא נמצא',
                todayChange: document.querySelectorAll('.hero-stat-number')[4]?.textContent || 'לא נמצא',
                successRate: document.querySelectorAll('.hero-stat-number')[5]?.textContent || 'לא נמצא'
            },
            sections: {
                topSection: {
                    title: 'דף הבית - סקירה כללית',
                    visible: !document.getElementById('topSection')?.classList.contains('d-none'),
                    heroTitle: document.querySelector('.hero-title')?.textContent || 'לא נמצא',
                    heroSubtitle: document.querySelector('.hero-subtitle')?.textContent || 'לא נמצא'
                },
                section1: {
                    title: 'סקירה כללית',
                    visible: !document.getElementById('section1')?.classList.contains('d-none'),
                    content: document.getElementById('section1')?.textContent?.substring(0, 200) || 'לא נמצא'
                },
                section2: {
                    title: 'סקירה כללית',
                    visible: !document.getElementById('section2')?.classList.contains('d-none'),
                    content: document.getElementById('section2')?.textContent?.substring(0, 200) || 'לא נמצא'
                },
                section3: {
                    title: 'גרפים וניתוח',
                    visible: !document.getElementById('section3')?.classList.contains('d-none'),
                    content: document.getElementById('section3')?.textContent?.substring(0, 200) || 'לא נמצא'
                },
                section4: {
                    title: 'טבלאות מפורטות',
                    visible: !document.getElementById('section4')?.classList.contains('d-none'),
                    content: document.getElementById('section4')?.textContent?.substring(0, 200) || 'לא נמצא'
                },
                section5: {
                    title: 'פעולות מהירות',
                    visible: !document.getElementById('section5')?.classList.contains('d-none'),
                    content: document.getElementById('section5')?.textContent?.substring(0, 200) || 'לא נמצא'
                },
                section6: {
                    title: 'סטטיסטיקות מתקדמות',
                    visible: !document.getElementById('section6')?.classList.contains('d-none'),
                    content: document.getElementById('section6')?.textContent?.substring(0, 200) || 'לא נמצא'
                }
            },
            charts: {
                // Charts removed - no longer used on index page
            },
            quickLinks: {
                preferences: document.querySelector('a[href="preferences"]') ? 'זמין' : 'לא זמין',
                settings: document.querySelector('a[title="הגדרות"]') ? 'זמין' : 'לא זמין',
                help: document.querySelector('a[title="עזרה"]') ? 'זמין' : 'לא זמין',
                messages: document.querySelector('a[title="הודעות"]') ? 'זמין' : 'לא זמין',
                cache: document.querySelector('a[title="ניקוי מטמון"]') ? 'זמין' : 'לא זמין',
                profile: document.querySelector('a[title="פרופיל"]') ? 'זמין' : 'לא זמין'
            },
            console: {
                errors: [],
                warnings: [],
                logs: []
            }
        };

        // Capture console messages
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalLog = console.log;

        console.error = function(...args) {
            logData.console.errors.push(args.join(' '));
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            logData.console.warnings.push(args.join(' '));
            originalWarn.apply(console, args);
        };

        console.log = function(...args) {
            logData.console.logs.push(args.join(' '));
            originalLog.apply(console, args);
        };

        return JSON.stringify(logData, null, 2);
    } catch (error) {
        return `Error generating log: ${error.message}`;
    }
}


/**
 * Debug Z-Index status for header system
 * @returns {void}
 */
function debugZIndexStatus() {
    window.Logger.info('🔍 בדיקת מצב Z-Index במערכת ראש הדף', { page: "index" });
    window.Logger.info('=====================================', { page: "index" });
    
    // בדיקת אלמנטים רלוונטיים
    const elements = [
        { selector: '#unified-header', name: 'Header Container' },
        { selector: '.header-top', name: 'Header Top' },
        { selector: '.tiktrack-dropdown-menu', name: 'Dropdown Menus' },
        { selector: '.filter-toggle-section', name: 'Filter Toggle Button' },
        { selector: '.header-filter-toggle-btn', name: 'Filter Button' },
        { selector: '.header-filters', name: 'Header Filters' },
        { selector: '.filter-menu', name: 'Filter Menu' }
    ];
    
    elements.forEach(element => {
        const el = document.querySelector(element.selector);
        if (el) {
            const computedStyle = window.getComputedStyle(el);
            const zIndex = computedStyle.zIndex;
            const position = computedStyle.position;
            const display = computedStyle.display;
            const visibility = computedStyle.visibility;
            
            window.Logger.info(`📍 ${element.name}:`, { page: "index" });
            window.Logger.info(`   Selector: ${element.selector}`, { page: "index" });
            window.Logger.info(`   Z-Index: ${zIndex}`, { page: "index" });
            window.Logger.info(`   Position: ${position}`, { page: "index" });
            window.Logger.info(`   Display: ${display}`, { page: "index" });
            window.Logger.info(`   Visibility: ${visibility}`, { page: "index" });
            window.Logger.info(`   Visible: ${el.offsetParent !== null}`, { page: "index" });
            window.Logger.info('---', { page: "index" });
        } else {
            window.Logger.info(`❌ ${element.name} (${element.selector}): לא נמצא`, { page: "index" });
        }
    });
    
    // בדיקת כל התפריטים הפתוחים
    window.Logger.info('🎯 בדיקת תפריטים פתוחים:', { page: "index" });
    const openMenus = document.querySelectorAll('.tiktrack-dropdown-menu:not([style*="display: none"])');
    window.Logger.info(`תפריטים פתוחים: ${openMenus.length}`, { page: "index" });
    
    openMenus.forEach((menu, index) => {
        const computedStyle = window.getComputedStyle(menu);
        window.Logger.info(`תפריט ${index + 1}: z-index = ${computedStyle.zIndex}`, { page: "index" });
    });
    
    // בדיקת כפתור הפילטר - שימוש ב-API של HeaderSystem במקום direct DOM manipulation
    window.Logger.info('🔘 בדיקת כפתור פילטר:', { page: "index" });
    if (window.headerSystem && window.headerSystem.filterManager) {
        const filterToggleBtn = document.getElementById('headerFilterToggleBtnMain') || document.getElementById('headerFilterToggleBtnSecondary');
        if (filterToggleBtn) {
            const computedStyle = window.getComputedStyle(filterToggleBtn);
            window.Logger.info(`כפתור פילטר: z-index = ${computedStyle.zIndex}`, { page: "index" });
            window.Logger.info(`כפתור פילטר: position = ${computedStyle.position}`, { page: "index" });
            window.Logger.info(`כפתור פילטר: visible = ${filterToggleBtn.offsetParent !== null}`, { page: "index" });
        }
    }
    
    window.Logger.info('=====================================', { page: "index" });
    window.Logger.info('✅ בדיקת Z-Index הושלמה', { page: "index" });
}

// Export log functions to global scope
// window. export removed - using global version from system-management.js
// window.generateDetailedLog = generateDetailedLog; // REMOVED: Local function only

// Local copyDetailedLog function for index page
/**
 * Copy detailed log to clipboard
 * @returns {Promise<void>}
 */
async function copyDetailedLogLocal() {
    try {
        const detailedLog = await generateDetailedLog();
        if (detailedLog) {
            await navigator.clipboard.writeText(detailedLog);
            window.showSuccessNotification('לוג מפורט הועתק ללוח');
        } else {
            window.showWarningNotification('אין לוג להעתקה');
        }
    } catch (err) {
        window.Logger.error('שגיאה בהעתקה:', err, { page: "index" });
        window.showErrorNotification('שגיאה בהעתקת הלוג');
    }
}
window.debugZIndexStatus = debugZIndexStatus;

/**
 * Equalize widget heights in each row
 * Sets all widgets in the same row to the height of the tallest widget in that row
 * @returns {void}
 */
// CRITICAL: Add debouncing to prevent infinite loops
let equalizeWidgetHeightsTimeout = null;
let equalizeWidgetHeightsInProgress = false;

function equalizeWidgetHeights() {
    // CRITICAL: Prevent infinite loops - if already in progress, skip silently
    if (equalizeWidgetHeightsInProgress) {
        return;
    }
    
    // Clear any pending timeout
    if (equalizeWidgetHeightsTimeout) {
        clearTimeout(equalizeWidgetHeightsTimeout);
    }
    
    // Debounce: wait 200ms before executing (increased from 100ms to reduce calls)
    equalizeWidgetHeightsTimeout = setTimeout(() => {
        equalizeWidgetHeightsInProgress = true;
        
        try {
            // Find all rows with widgets in the dashboard section
            const dashboardSection = document.querySelector('#main .section-body');
            if (!dashboardSection) {
                window.Logger?.warn?.('⚠️ Dashboard section not found', { page: 'index' });
                equalizeWidgetHeightsInProgress = false;
                return;
            }

            // Find all rows with class "row" that contain widgets
            const rows = dashboardSection.querySelectorAll('.row.g-3');
            
            if (rows.length === 0) {
                equalizeWidgetHeightsInProgress = false;
                return;
            }
        
        rows.forEach((row, rowIndex) => {
            // Find all card widgets in this row
            const widgets = row.querySelectorAll('.card.h-100');
            
            if (widgets.length === 0) {
                return; // Skip rows without widgets
            }

            // Store original max-height values
            const originalMaxHeights = new Map();
            widgets.forEach(widget => {
                const computedStyle = window.getComputedStyle(widget);
                const maxHeight = computedStyle.maxHeight;
                originalMaxHeights.set(widget, maxHeight);
                
                // Temporarily remove max-height to get natural height
                widget.style.maxHeight = 'none';
                widget.style.height = 'auto';
            });

            // Force a reflow to ensure heights are calculated
            void row.offsetHeight;

            // Find the maximum height
            let maxHeight = 0;
            widgets.forEach(widget => {
                const height = widget.offsetHeight;
                if (height > maxHeight) {
                    maxHeight = height;
                }
            });

            // Set all widgets to the maximum height
            if (maxHeight > 0) {
                widgets.forEach(widget => {
                    // Restore original max-height if it was set, but ensure it's at least maxHeight
                    const originalMaxHeight = originalMaxHeights.get(widget);
                    if (originalMaxHeight && originalMaxHeight !== 'none') {
                        const originalMaxHeightPx = parseFloat(originalMaxHeight);
                        // Use the larger of the two: calculated maxHeight or original maxHeight
                        widget.style.height = `${Math.max(maxHeight, originalMaxHeightPx)}px`;
                        widget.style.maxHeight = originalMaxHeight;
                    } else {
                        widget.style.height = `${maxHeight}px`;
                    }
                });

                window.Logger?.debug?.('Widget heights equalized', {
                    rowIndex,
                    widgetCount: widgets.length,
                    maxHeight,
                    page: 'index'
                });
            } else {
                // Restore original max-heights if no max height found
                widgets.forEach(widget => {
                    const originalMaxHeight = originalMaxHeights.get(widget);
                    if (originalMaxHeight && originalMaxHeight !== 'none') {
                        widget.style.maxHeight = originalMaxHeight;
                    }
                });
            }
        });

            // Only log if there were actual rows processed (reduce log spam)
            if (rows.length > 0) {
                window.Logger?.debug?.('✅ Widget heights equalized', { 
                    rowsProcessed: rows.length,
                    page: 'index' 
                });
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error equalizing widget heights:', error, { page: 'index' });
        } finally {
            equalizeWidgetHeightsInProgress = false;
        }
    }, 200);
}

// Export to global scope
window.equalizeWidgetHeights = equalizeWidgetHeights;

// Equalize heights on page load and after content updates
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for widgets to initialize
        setTimeout(() => {
            equalizeWidgetHeights();
        }, 1000);
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        equalizeWidgetHeights();
    }, 1000);
}

// Re-equalize heights when window is resized
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        equalizeWidgetHeights();
    }, 250);
});

// Re-equalize heights after widget content updates
// This will be called by widgets after they render content
// CRITICAL: Debounce to prevent infinite loops
let widgetContentUpdatedTimeout = null;
window.addEventListener('widgetContentUpdated', () => {
    // Clear any pending timeout
    if (widgetContentUpdatedTimeout) {
        clearTimeout(widgetContentUpdatedTimeout);
    }
    
    // Debounce: wait 300ms before executing (longer than equalizeWidgetHeights debounce to prevent loops)
    widgetContentUpdatedTimeout = setTimeout(() => {
        equalizeWidgetHeights();
    }, 300);
});

/**
 * Global graceful degradation system for unauthenticated users
 * Provides consistent login prompts across all widgets
 */
window.GracefulDegradation = {
    /**
     * Show login required message in a container
     * @param {string} containerId - Container element ID
     * @param {string} featureName - Name of the feature requiring login
     */
    showLoginRequired(containerId, featureName = 'תכונה זו') {
        const container = document.getElementById(containerId);
        if (!container) {
            window.Logger?.warn?.('GracefulDegradation: Cannot show login message - container not found', {
                containerId,
                page: 'index'
            });
            return;
        }

        // Create login required message
        const loginMessage = document.createElement('div');
        loginMessage.className = 'login-required-message alert alert-info text-center p-4';
        loginMessage.innerHTML = `
            <div class="mb-3">
                <i class="fas fa-lock fa-3x text-primary"></i>
            </div>
            <div class="mb-3">
                <h5 class="alert-heading">נדרש התחברות</h5>
            </div>
            <div class="mb-4">
                <strong>${featureName}</strong> זמינה רק למשתמשים מחוברים
            </div>
            <button class="btn btn-primary btn-lg" onclick="window.location.href='/login.html'">
                <i class="fas fa-sign-in-alt me-2"></i>
                התחבר לחשבון
            </button>
            <div class="mt-3">
                <small class="text-muted">אין לך חשבון?
                    <a href="/register" class="text-decoration-none">הירשם כאן</a>
                </small>
            </div>
        `;

        // Clear container and add message
        container.innerHTML = '';
        container.appendChild(loginMessage);

        window.Logger?.info?.('GracefulDegradation: Login required message displayed', {
            containerId,
            featureName,
            page: 'index'
        });
    },

    /**
     * Check if user is authenticated and show login message if not
     * @param {string} containerId - Container element ID
     * @param {string} featureName - Name of the feature requiring login
     * @returns {boolean} - True if authenticated, false if not
     */
    requireAuth(containerId, featureName = 'תכונה זו') {
        const isAuthenticated = window.TikTrackAuth?.isAuthenticated?.() || false;
        if (!isAuthenticated) {
            this.showLoginRequired(containerId, featureName);
            return false;
        }
        return true;
    }
};

// Legacy alias for backward compatibility
window.showLoginRequiredMessage = window.GracefulDegradation.showLoginRequired;

window.Logger.info('✅ Index page ready', { page: "index" });
