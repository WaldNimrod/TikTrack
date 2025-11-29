/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 17
 * 
 * DATA MANIPULATION (5)
 * - createTradesStatusChart() - * Export overview data from the index page
 * - createPerformanceChart() - createPerformanceChart function
 * - createAccountChart() - createAccountChart function
 * - createMixedChart() - createMixedChart function
 * - createMixedChartData() - REMOVED: not used
 * 
 * EVENT HANDLING (1)
 * - quickAction() - * Refresh overview data on the index page
 * 
 * ICON MANAGEMENT (1)
 * - replaceIconsWithIconSystem() - Replace all <img> tags with IconSystem.renderIcon()
 * 
 * OTHER (10)
 * - switchTableTab() - switchTableTab function
 * - refreshOverview() - * Switch between table tabs on the index page
 * - exportOverview() - * Switch between table tabs on the index page
 * - refreshAllCharts() - refreshAllCharts function
 * - refreshChart() - refreshChart function
 * - exportChart() - exportChart function
 * - exportAllCharts() - exportAllCharts function
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
// Export homeCharts to global scope for enhancements system
window.homeCharts = {
    tradesStatusChart: null,
    performanceChart: null,
    accountChart: null,
    mixedChart: null
};

const DASHBOARD_DATA_KEY = 'dashboard-data';
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
    accounts: '/api/trading-accounts/',
    cashFlows: '/api/cash-flows/'
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
    if (window.FieldRendererService?.renderDateShort) {
        try {
            return window.FieldRendererService.renderDateShort(resolved) || '';
        } catch (error) {
            window.Logger?.warn?.('⚠️ renderDateShort failed', { error: error?.message }, { page: 'index' });
        }
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

    const totalTradesEl = document.getElementById('totalTrades');
    if (totalTradesEl) {
        totalTradesEl.textContent = trades.length.toLocaleString('he-IL');
    }

    const totalAlertsEl = document.getElementById('totalAlerts');
    if (totalAlertsEl) {
        totalAlertsEl.textContent = alerts.length.toLocaleString('he-IL');
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
            balanceEl.innerHTML = window.FieldRendererService?.renderAmount
                ? window.FieldRendererService.renderAmount(numericBalance, currencySymbol, 2, true)
                : '<span class="text-muted">לא זמין</span>';
        } else {
            balanceEl.innerHTML = '<span class="text-muted">לא זמין</span>';
        }
    }

    const totalPnL = computePortfolioPnL(trades, accounts, cashFlows);
    const totalPnLEl = document.getElementById('totalPnL');
    if (totalPnLEl) {
        // שימוש ישיר ב-FieldRendererService - המערכת תמיד זמינה דרך BASE package
        const numericPnL = toNumber(totalPnL);
        if (Number.isFinite(numericPnL)) {
            totalPnLEl.innerHTML = window.FieldRendererService?.renderAmount
                ? window.FieldRendererService.renderAmount(numericPnL, currencySymbol, 2, true)
                : '<span class="text-muted">לא זמין</span>';
        } else {
            totalPnLEl.innerHTML = '<span class="text-muted">לא זמין</span>';
        }
    }
}

/**
 * Update recent trades section
 * @param {Array} [trades=[]] - Array of trades
 * @param {string} currencySymbol - Currency symbol
 * @returns {void}
 */
function updateRecentTrades(trades = [], currencySymbol) {
    if (window.RecentTradesWidget?.render) {
        window.RecentTradesWidget.render(trades, currencySymbol);
        return;
    }

    const container = document.getElementById('recentTrades');
    if (!container) {
        return;
    }

    if (!Array.isArray(trades) || trades.length === 0) {
        container.innerHTML = '<div class="text-muted small">אין טריידים זמינים</div>';
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
                sideSpan.innerHTML = sideHtml;
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
                amountWrapper.innerHTML = window.FieldRendererService.renderAmount(numericValue, currencySymbol, 2, true);
            } else {
                amountWrapper.textContent = 'לא זמין';
            }
        } else {
            amountWrapper.textContent = 'לא זמין';
        }
        item.appendChild(amountWrapper);

        list.appendChild(item);
    });

    container.innerHTML = '';
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
        container.innerHTML = '<div class="text-muted small">אין התראות זמינות</div>';
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
                statusSpan.innerHTML = statusHtml;
            } else {
                statusSpan.textContent = statusHtml || alert.status;
            }
            metaRow.appendChild(statusSpan);
        }

        if (alert?.priority) {
            const priorityHtml = window.FieldRendererService?.renderPriority?.(alert.priority);
            const prioritySpan = document.createElement('span');
            if (priorityHtml && priorityHtml.includes('<')) {
                prioritySpan.innerHTML = priorityHtml;
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

    container.innerHTML = '';
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
    const container = document.getElementById('portfolioSummaryStats');
    if (!container) {
        return;
    }

    if (!accounts.length) {
        container.innerHTML = '<div class="text-muted small">אין נתוני פורטפוליו זמינים</div>';
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
    
    container.innerHTML = `
        <div class="d-flex flex-wrap gap-3 text-muted small">
            <span>חשבונות פעילים: ${activeAccounts.length.toLocaleString('he-IL')} מתוך ${accounts.length.toLocaleString('he-IL')}</span>
            <span>שווי כולל: ${renderAmountHelper(totalValue)}</span>
            <span>שווי ממוצע לחשבון: ${renderAmountHelper(avgValue)}</span>
            <span>טריידים פתוחים: ${openTrades.length.toLocaleString('he-IL')}</span>
            <span>P/L כולל: ${renderAmountHelper(pnl)}</span>
        </div>
    `;
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
        recentContainer.innerHTML = `<div class="text-danger small">${fallback}</div>`;
    }
    const alertsContainer = document.getElementById('activeAlerts');
    if (alertsContainer) {
        alertsContainer.innerHTML = `<div class="text-danger small">${fallback}</div>`;
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
    if (!data) {
        return;
    }

    let trades = Array.isArray(data.trades) ? data.trades : [];
    let alerts = Array.isArray(data.alerts) ? data.alerts : [];
    let accounts = Array.isArray(data.accounts) ? data.accounts : [];
    let cashFlows = Array.isArray(data.cashFlows) ? data.cashFlows : [];
    if (window.TableDataRegistry) {
        const tradesSummary = window.TableDataRegistry.getSummary('trades');
        if (tradesSummary) {
            const registryTrades = window.TableDataRegistry.getFilteredData('trades', { asReference: false });
            if (Array.isArray(registryTrades)) {
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

    updateSummaryStats({ trades, alerts, accounts, cashFlows }, currencySymbol);
    updateRecentTrades(trades, currencySymbol);
    updateActiveAlerts(alerts);
    updateDashboardCount({ trades, alerts, accounts });
    updatePortfolioSummary({ accounts, trades, cashFlows }, currencySymbol);

    dashboardDataState.lastLoadedAt = Date.now();
    dashboardDataState.source = source;
    dashboardDataState.data = { trades, alerts, accounts, cashFlows };
    window.dashboardData = dashboardDataState.data;
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
function refreshOverview() {
    window.Logger.info('Refreshing overview data...', { page: "index" });
    window.loadDashboardData().catch((error) => {
        window.Logger?.error?.('❌ Error refreshing dashboard overview', { message: error?.message }, { page: 'index' });
    });
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

/**
 * Create trades status chart on the index page
 * @returns {Promise<void>}
 */
async function createTradesStatusChart() {
    try {
        // window.Logger.info('📊 Creating trades status chart...', { page: "index" });
        
        if (!window.ChartSystem || !window.TradesAdapter) {
            window.Logger.warn('⚠️ Chart system or trades adapter not available', { page: "index" });
            return;
        }
        
        const tradesAdapter = new window.TradesAdapter();
        await tradesAdapter.init();
        const rawData = await tradesAdapter.getData();
        const chartData = tradesAdapter.formatData(rawData).status;
        
        homeCharts.tradesStatusChart = await window.ChartSystem.create({
            id: 'tradesStatusChart',
            type: 'doughnut',
            container: '#tradesStatusChart',
            title: 'סטטוס טריידים',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true, 
                        position: 'bottom',
                        labels: { usePointStyle: true }
                    }
                }
            }
        });
        
        // window.Logger.info('✅ Trades status chart created successfully', { page: "index" });
    } catch (error) {
        window.Logger.error('❌ Error creating trades status chart:', error, { page: "index" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת תרשים סטטוס טריידים', error.message || 'לא התקבלה תשובה מהשרת');
        }
    }
}

/**
 * Create performance chart on the index page
 * @returns {Promise<void>}
 */
async function createPerformanceChart() {
    try {
        // window.Logger.info('📈 Creating performance chart...', { page: "index" });
        
        if (!window.ChartSystem || !window.TradesAdapter) {
            window.Logger.warn('⚠️ Chart system or trades adapter not available', { page: "index" });
            return;
        }
        
        const tradesAdapter = new window.TradesAdapter();
        await tradesAdapter.init();
        const rawData = await tradesAdapter.getData();
        const chartData = tradesAdapter.formatData(rawData).performance;
        
        homeCharts.performanceChart = await window.ChartSystem.create({
            id: 'performanceChart',
            type: 'line',
            container: '#performanceChart',
            title: 'ביצועים לאורך זמן',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'P/L' }
                    }
                }
            }
        });
        
        // window.Logger.info('✅ Performance chart created successfully', { page: "index" });
    } catch (error) {
        window.Logger.error('❌ Error creating performance chart:', error, { page: "index" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת תרשים ביצועים', error.message || 'לא התקבלה תשובה מהשרת');
        }
    }
}

/**
 * Create account chart
 * @returns {Promise<void>}
 */
async function createAccountChart() {
    try {
        // window.Logger.info('🏦 Creating account chart...', { page: "index" });
        
        if (!window.ChartSystem || !window.TradesAdapter) {
            window.Logger.warn('⚠️ Chart system or trades adapter not available', { page: "index" });
            return;
        }
        
        const tradesAdapter = new window.TradesAdapter();
        await tradesAdapter.init();
        const rawData = await tradesAdapter.getData();
        const chartData = tradesAdapter.formatData(rawData).account;
        
        homeCharts.accountChart = await window.ChartSystem.create({
            id: 'accountChart',
            type: 'bar',
            container: '#accountChart',
            title: 'התפלגות חשבונות',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'מספר טריידים' }
                    }
                }
            }
        });
        
        // window.Logger.info('✅ Account chart created successfully', { page: "index" });
    } catch (error) {
        window.Logger.error('❌ Error creating account chart:', error, { page: "index" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת תרשים חשבונות', error.message || 'לא התקבלה תשובה מהשרת');
        }
    }
}

/**
 * Create mixed chart on the index page
 * @returns {Promise<void>}
 */
async function createMixedChart() {
    try {
        // window.Logger.info('🔀 Creating mixed chart...', { page: "index" });
        
        if (!window.ChartSystem || !window.TradesAdapter) {
            window.Logger.warn('⚠️ Chart system or trades adapter not available', { page: "index" });
            return;
        }
        
        const tradesAdapter = new window.TradesAdapter();
        await tradesAdapter.init();
        const rawData = await tradesAdapter.getData();
        const chartData = tradesAdapter.formatData(rawData);
        
        const mixedData = chartData.mixed;
        
        homeCharts.mixedChart = await window.ChartSystem.create({
            id: 'mixedChart',
            type: 'line',
            container: '#mixedChart',
            title: 'אנליטיקה מעורבת',
            data: mixedData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'כמות / ערך' }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
        
        // window.Logger.info('✅ Mixed chart created successfully', { page: "index" });
    } catch (error) {
        window.Logger.error('❌ Error creating mixed chart:', error, { page: "index" });
        if (typeof window.showErrorNotification === 'function') {
            window.showErrorNotification('שגיאה בטעינת תרשים אנליטיקה', error.message || 'לא התקבלה תשובה מהשרת');
        }
    }
}

// REMOVED: createMixedChartData - not used, createMixedChart uses chartData.mixed from tradesAdapter.formatData()

// Chart Management Functions
// Flag to prevent duplicate chart refresh
let chartsRefreshing = false;

/**
 * Refresh all charts on the index page
 * @returns {Promise<void>}
 */
async function refreshAllCharts() {
    // Prevent duplicate refresh
    if (chartsRefreshing) {
        window.Logger.info('⏭️ Charts refresh already in progress, skipping...', { page: "index" });
        return;
    }
    
    chartsRefreshing = true;
    // window.Logger.info('🔄 Refreshing all charts...', { page: "index" });
    
    try {
        await Promise.all([
            createTradesStatusChart(),
            createPerformanceChart(),
            createAccountChart(),
            createMixedChart()
        ]);
        
        if (window.showNotification) {
            window.showNotification('כל הגרפים רוענו בהצלחה', 'success', 'business');
        }
        
        // window.Logger.info('✅ All charts refreshed successfully', { page: "index" });
    } catch (error) {
        window.Logger.error('❌ Error refreshing charts:', error, { page: "index" });
        if (window.showNotification) {
            window.showNotification('שגיאה ברענון הגרפים', 'error', 'business');
        }
    } finally {
        chartsRefreshing = false;
    }
}

/**
 * Refresh a specific chart by ID
 * @param {string} chartId - Chart ID ('tradesStatusChart', 'performanceChart', 'accountChart', 'mixedChart')
 * @returns {Promise<void>}
 */
async function refreshChart(chartId) {
    window.Logger.info(`🔄 Refreshing chart: ${chartId}`, { page: "index" });
    
    try {
        switch (chartId) {
            case 'tradesStatusChart':
                await createTradesStatusChart();
                break;
            case 'performanceChart':
                await createPerformanceChart();
                break;
            case 'accountChart':
                await createAccountChart();
                break;
            case 'mixedChart':
                await createMixedChart();
                break;
            default:
                window.Logger.warn(`⚠️ Unknown chart ID: ${chartId}`, { page: "index" });
                return;
        }
        
        if (window.showNotification) {
            window.showNotification(`גרף ${chartId} רוענן בהצלחה`, 'success', 'business');
        }
        
        window.Logger.info(`✅ Chart ${chartId} refreshed successfully`, { page: "index" });
    } catch (error) {
        window.Logger.error(`❌ Error refreshing chart ${chartId}:`, error, { page: "index" });
        if (window.showNotification) {
            window.showNotification(`שגיאה ברענון גרף ${chartId}`, 'error', 'business');
        }
    }
}

/**
 * Export a specific chart by ID
 * @param {string} chartId - Chart ID to export
 * @returns {Promise<void>}
 */
async function exportChart(chartId) {
    window.Logger.info(`📤 Exporting chart: ${chartId}`, { page: "index" });
    
    try {
        if (window.ChartExportSystem) {
            await window.ChartExportSystem.exportChart(chartId, {
                format: 'png',
                quality: 'high',
                filename: `home-${chartId}`
            });
        } else {
            window.Logger.warn('⚠️ Chart export system not available', { page: "index" });
            // if (window.showNotification) {
            //     window.showNotification('מערכת ייצוא הגרפים לא זמינה', 'info', 'system');
            // }
        }
    } catch (error) {
        window.Logger.error(`❌ Error exporting chart ${chartId}:`, error, { page: "index" });
        if (window.showNotification) {
            window.showNotification(`שגיאה בייצוא גרף ${chartId}`, 'error', 'business');
        }
    }
}

/**
 * Export all charts on the index page
 * @returns {Promise<void>}
 */
async function exportAllCharts() {
    window.Logger.info('📤 Exporting all charts...', { page: "index" });
    
    try {
        if (window.ChartExportSystem) {
            const chartIds = Object.keys(homeCharts).filter(id => homeCharts[id] !== null);
            await window.ChartExportSystem.exportMultipleCharts(chartIds, {
                format: 'png',
                quality: 'high',
                filename: 'home-dashboard'
            });
        } else {
            window.Logger.warn('⚠️ Chart export system not available', { page: "index" });
            // if (window.showNotification) {
            //     window.showNotification('מערכת ייצוא הגרפים לא זמינה', 'info', 'system');
            // }
        }
    } catch (error) {
        window.Logger.error('❌ Error exporting all charts:', error, { page: "index" });
        if (window.showNotification) {
            window.showNotification('שגיאה בייצוא כל הגרפים', 'error', 'business');
        }
    }
}

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
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = iconHTML;
                const newIcon = tempDiv.firstElementChild;
                
                if (newIcon) {
                    img.parentNode.replaceChild(newIcon, img);
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
    refreshOverview();
    
    // Setup action buttons
    const refreshButton = document.querySelector('.btn');
    if (refreshButton) {
        refreshButton.addEventListener('click', refreshOverview);
    }
    
    const exportButton = document.querySelector('.btn');
    if (exportButton) {
        exportButton.addEventListener('click', exportOverview);
    }
    
    // Initialize charts after a short delay to ensure all systems are loaded
    // Note: This is called automatically by PAGE_CONFIGS.index.customInitializers
    setTimeout(async () => {
        // window.Logger.info('📊 Initializing home page charts...', { page: "index" });
        await refreshAllCharts();
    }, 1000);
 
    // Register portfolio table with UnifiedTableSystem
    if (typeof window.registerPortfolioTable === 'function') {
        // Wait a bit for positions-portfolio.js to load
        setTimeout(() => {
            window.registerPortfolioTable();
        }, 500);
    }
    
    // Initialize pending execution trade creation widget
    if (window.PendingExecutionTradeCreation?.initializeDashboardWidget) {
        setTimeout(() => {
            window.PendingExecutionTradeCreation.initializeDashboardWidget({
                cardSelector: '#pendingExecutionsTradeCreationCard',
                listSelector: '#pendingTradeCreationWidgetList',
                countSelector: '#pendingExecutionsTradeCreationCount',
                loadingSelector: '#pendingExecutionsTradeCreationLoading',
                emptySelector: '#pendingExecutionsTradeCreationEmpty',
                errorSelector: '#pendingExecutionsTradeCreationError'
            });
        }, 1400);
    }

    // Initialize pending executions widget
    if (typeof window.initializePendingExecutionsWidget === 'function') {
        setTimeout(() => {
            window.initializePendingExecutionsWidget();
        }, 1500);
    }

    if (typeof window.initializePendingTradePlanWidget === 'function') {
        setTimeout(() => {
            window.initializePendingTradePlanWidget();
        }, 1600);
    }
};

// Note: initializeIndexPage() is now called via PAGE_CONFIGS.index.customInitializers
// in unified-app-initializer.js, so we don't need to call it directly here.
// This prevents duplicate chart initialization.

// Export functions to global scope
window.switchTableTab = switchTableTab;
window.refreshOverview = refreshOverview;
window.exportOverview = exportOverview;
window.quickAction = quickAction;
// toggleAllSections and toggleSection exports removed - use global functions directly

// Chart functions
window.refreshAllCharts = refreshAllCharts;
window.refreshChart = refreshChart;
window.exportChart = exportChart;
window.exportAllCharts = exportAllCharts;

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
                tradesStatusChart: window.homeCharts?.tradesStatusChart ? 'מוכן' : 'לא מוכן',
                performanceChart: window.homeCharts?.performanceChart ? 'מוכן' : 'לא מוכן',
                accountChart: window.homeCharts?.accountChart ? 'מוכן' : 'לא מוכן',
                mixedChart: window.homeCharts?.mixedChart ? 'מוכן' : 'לא מוכן'
            },
            quickLinks: {
                preferences: document.querySelector('a[href="preferences.html"]') ? 'זמין' : 'לא זמין',
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
            if (window.showSuccessNotification) {
                window.showSuccessNotification('לוג מפורט הועתק ללוח');
            } else {
                alert('לוג מפורט הועתק ללוח!');
            }
        } else {
            if (window.showWarningNotification) {
                window.showWarningNotification('אין לוג להעתקה');
            } else {
                alert('אין לוג להעתקה');
            }
        }
    } catch (err) {
        window.Logger.error('שגיאה בהעתקה:', err, { page: "index" });
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בהעתקת הלוג');
        } else {
            alert('שגיאה בהעתקת הלוג');
        }
    }
}
window.debugZIndexStatus = debugZIndexStatus;

window.Logger.info('✅ Index page ready', { page: "index" });