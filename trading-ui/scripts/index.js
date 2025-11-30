/*
 * ==========================================
 * FUNCTION INDEX
 * ==========================================
 * 
 * This index lists all functions in this file, organized by category.
 * 
 * Total Functions: 17
 * 
 * DATA MANIPULATION (0)
 * - Chart functions - REMOVED: All chart-related functions removed (no longer used on index page)
 * 
 * EVENT HANDLING (1)
 * - quickAction() - * Refresh overview data on the index page
 * 
 * ICON MANAGEMENT (1)
 * - replaceIconsWithIconSystem() - Replace all <img> tags with IconSystem.renderIcon()
 * 
 * OTHER (5)
 * - switchTableTab() - switchTableTab function
 * - refreshOverview() - * Switch between table tabs on the index page
 * - exportOverview() - * Switch between table tabs on the index page
 * - equalizeWidgetHeights() - Equalize widget heights in each row
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
 * Update unified recent items widget (trades and trade plans)
 * @param {Array} [trades=[]] - Array of trades
 * @param {Array} [tradePlans=[]] - Array of trade plans
 * @param {string} currencySymbol - Currency symbol
 * @returns {void}
 */
function updateRecentItemsWidget(trades = [], tradePlans = [], currencySymbol) {
    if (window.RecentItemsWidget?.render) {
        window.Logger?.info?.('📊 Updating RecentItemsWidget', { 
            tradesCount: Array.isArray(trades) ? trades.length : 0,
            tradePlansCount: Array.isArray(tradePlans) ? tradePlans.length : 0,
            currencySymbol,
            page: 'index'
        });
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
        
        window.Logger?.info?.('📊 Calling RecentItemsWidget.render', {
            renderDataKeys: Object.keys(renderData),
            tradesIncluded: renderData.hasOwnProperty('trades'),
            tradePlansIncluded: renderData.hasOwnProperty('tradePlans'),
            page: 'index'
        });
        
        window.RecentItemsWidget.render(renderData);
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
        container.innerHTML = '<div class="text-muted small">אין תוכניות זמינות</div>';
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
    // Check authentication before processing data
    const isAuth = window.TikTrackAuth?.isAuthenticated?.() || false;
    if (!isAuth) {
        // User is not authenticated - clear all displayed data
        data = { trades: [], alerts: [], accounts: [], cashFlows: [] };
    }
    
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

    updateSummaryStats({ trades, alerts, accounts, cashFlows }, currencySymbol);
    updateActiveAlerts(alerts);
    updateDashboardCount({ trades, alerts, accounts });
    updatePortfolioSummary({ accounts, trades, cashFlows }, currencySymbol);
    
    window.Logger?.info?.('🔍 [index.js] processDashboardData - About to update widget', {
        tradesCount: trades.length,
        alertsCount: alerts.length,
        accountsCount: accounts.length,
        currencySymbol,
        page: 'index'
    });
    
    // Update unified recent items widget with trades (trade plans will be loaded separately)
    // IMPORTANT: Only pass trades if we have data - don't pass empty array (it clears existing)
    // This matches the test page behavior
    if (trades && trades.length > 0) {
        window.Logger?.info?.('🔍 [index.js] processDashboardData - Updating widget with trades', {
            tradesCount: trades.length,
            page: 'index'
        });
        updateRecentItemsWidget(trades, [], currencySymbol);
    } else {
        window.Logger?.info?.('🔍 [index.js] processDashboardData - No trades, skipping widget update (will update when trades loaded)', {
            page: 'index'
        });
    }
    
    // Load and update recent trade plans (will update unified widget with both trades and plans)
    // Pass trades to loadRecentTradePlans so it can preserve them when updating
    loadRecentTradePlans(currencySymbol, trades).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to load recent trade plans', { error: error?.message }, { page: 'index' });
    });
    
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
    window.Logger?.info?.('🔍 [index.js] loadRecentTradePlans START', {
        currencySymbol,
        currentTradesCount: Array.isArray(currentTrades) ? currentTrades.length : 0,
        TradePlansDataServiceExists: !!window.TradePlansDataService,
        TradePlansDataServiceLoadExists: !!window.TradePlansDataService?.loadTradePlansData,
        RecentItemsWidgetExists: !!window.RecentItemsWidget,
        RecentItemsWidgetRenderExists: !!window.RecentItemsWidget?.render,
        page: 'index'
    });
    
    try {
        let tradePlans = [];
        
        // Try to use trade plans data service if available
        if (window.TradePlansDataService?.loadTradePlansData) {
            window.Logger?.info?.('🔍 [index.js] Using TradePlansDataService to load trade plans', { page: 'index' });
            tradePlans = await window.TradePlansDataService.loadTradePlansData({ force: false });
            window.Logger?.info?.('🔍 [index.js] TradePlansDataService returned', {
                isArray: Array.isArray(tradePlans),
                count: Array.isArray(tradePlans) ? tradePlans.length : 0,
                firstPlan: tradePlans?.[0],
                page: 'index'
            });
            if (!Array.isArray(tradePlans)) {
                tradePlans = [];
                window.Logger?.warn?.('⚠️ [index.js] TradePlansDataService returned non-array, setting to empty', { 
                    type: typeof tradePlans,
                    tradePlans,
                    page: 'index' 
                });
            }
        } else {
            window.Logger?.info?.('🔍 [index.js] TradePlansDataService not available, fetching directly from API', { page: 'index' });
            // Fallback: fetch directly from API
            const response = await fetch('/api/trade-plans/', { headers: { Accept: 'application/json' } });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const payload = await response.json();
            window.Logger?.info?.('🔍 [index.js] API response received', {
                hasData: !!payload?.data,
                isArrayData: Array.isArray(payload?.data),
                isArrayRoot: Array.isArray(payload),
                dataCount: Array.isArray(payload?.data) ? payload.data.length : (Array.isArray(payload) ? payload.length : 0),
                page: 'index'
            });
            tradePlans = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
        }
        
        window.Logger?.info?.('🔍 [index.js] About to update RecentItemsWidget', {
            tradePlansCount: tradePlans.length,
            currentTradesCount: Array.isArray(currentTrades) ? currentTrades.length : 0,
            willPassTrades: Array.isArray(currentTrades) && currentTrades.length > 0,
            currencySymbol,
            page: 'index'
        });
        
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
            
            window.Logger?.info?.('🔍 [index.js] Calling RecentItemsWidget.render', {
                willPassTrades: renderData.hasOwnProperty('trades'),
                tradesCount: renderData.trades?.length || 0,
                tradePlansCount: renderData.tradePlans?.length || 0,
                renderDataKeys: Object.keys(renderData),
                page: 'index'
            });
            
            window.RecentItemsWidget.render(renderData);
            window.Logger?.info?.('📊 [index.js] Updated RecentItemsWidget with trade plans', {
                tradesCount: Array.isArray(currentTrades) ? currentTrades.length : 0,
                tradePlansCount: tradePlans.length,
                firstTradePlan: tradePlans[0],
                page: 'index'
            });
        } else {
            window.Logger?.warn?.('⚠️ [index.js] RecentItemsWidget not available, falling back to separate widget', { page: 'index' });
            // Fallback to separate widget
            updateRecentTradePlans(tradePlans, currencySymbol);
        }
    } catch (error) {
        window.Logger?.error?.('❌ [index.js] Failed to load trade plans for recent widget', { 
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
                container.innerHTML = '<div class="text-muted small">אין תוכניות זמינות</div>';
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
    if (!isAuth) {
        // User is not authenticated - clear dashboard data and return empty
        if (window.dashboardDataState) {
            window.dashboardDataState.data = { trades: [], alerts: [], accounts: [], cashFlows: [] };
            window.dashboardDataState.lastLoadedAt = null;
        }
        // Clear displayed data
        processDashboardData({ trades: [], alerts: [], accounts: [], cashFlows: [] }, 'network');
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
    
    // Charts removed - no longer used on index page
 
    // Note: positions & portfolio system initialization is handled by page-initialization-configs.js
    // which calls initPositionsPortfolio() after initializeIndexPage()
    
    // Note: Old pending widgets (PendingExecutionTradeCreation, PendingExecutionsHighlights, PendingTradePlanWidget)
    // have been removed and replaced by UnifiedPendingActionsWidget which is initialized in page-initialization-configs.js
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
function equalizeWidgetHeights() {
    try {
        // Find all rows with widgets in the dashboard section
        const dashboardSection = document.querySelector('#main .section-body');
        if (!dashboardSection) {
            window.Logger?.warn?.('⚠️ Dashboard section not found', { page: 'index' });
            return;
        }

        // Find all rows with class "row" that contain widgets
        const rows = dashboardSection.querySelectorAll('.row.g-3');
        
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

        window.Logger?.info?.('✅ Widget heights equalized', { 
            rowsProcessed: rows.length,
            page: 'index' 
        });
    } catch (error) {
        window.Logger?.error?.('❌ Error equalizing widget heights:', error, { page: 'index' });
    }
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
window.addEventListener('widgetContentUpdated', () => {
    setTimeout(() => {
        equalizeWidgetHeights();
    }, 100);
});

window.Logger.info('✅ Index page ready', { page: "index" });