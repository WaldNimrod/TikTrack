/**
 * ========================================
 * Index Page - Dashboard Controller
 * ========================================
 * 
 * דף הבית - דשבורד מרכזי למערכת TikTrack
 * 
 * Features:
 * - Real-time statistics from all entities
 * - 4 live charts with performance data
 * - Recent trades table (last 10)
 * - Active alerts display
 * - Auto-refresh every 5 minutes
 * 
 * Service Systems Integration:
 * ✅ StatisticsCalculator - All calculations
 * ✅ FieldRendererService - Badges and formatting
 * ✅ Global Element Cache - DOM access optimization
 * ✅ ChartSystem - All charts
 * ✅ Notification System - User feedback
 * 
 * File: trading-ui/scripts/index.js
 * Version: 3.0.0 - Complete Rebuild
 * Last Updated: October 11, 2025
 */

console.log('🏠 Index page script loading...');

// ===== GLOBAL STATE =====
const dashboardState = {
    charts: {},
    data: {},
    refreshInterval: null,
    lastUpdate: null
};

// ===== INITIALIZATION =====

/**
 * Initialize index page
 * Called by unified initialization system
 */
window.initializeIndexPage = async function() {
    console.log('🏠 Initializing Dashboard...');
    
    try {
        // Load all dashboard data
        await loadDashboardData();
        
        // Initialize charts
        await initializeCharts();
        
        // Setup auto-refresh (every 5 minutes)
        setupAutoRefresh();
        
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה באתחול דשבורד', error.message);
        }
    }
};

// ===== DATA LOADING =====

/**
 * Load all dashboard data from APIs
 */
async function loadDashboardData() {
    console.log('📊 Loading dashboard data...');
    
    try {
        // Fetch data in parallel from all endpoints
        const [accounts, trades, tradePlans, alerts, cashFlows, tickers, notes] = await Promise.all([
            fetch('/api/trading-accounts/').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/trades/').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/trade-plans/').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/alerts/').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/cash-flows/').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/tickers/').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/notes/').then(r => r.json()).catch(() => ({ data: [] }))
        ]);
        
        // Store in state
        dashboardState.data = {
            accounts: accounts.data || [],
            trades: trades.data || [],
            tradePlans: tradePlans.data || [],
            alerts: alerts.data || [],
            cashFlows: cashFlows.data || [],
            tickers: tickers.data || [],
            notes: notes.data || []
        };
        
        dashboardState.lastUpdate = new Date();
        
        console.log('📊 Dashboard data loaded:', {
            accounts: dashboardState.data.accounts.length,
            trades: dashboardState.data.trades.length,
            tradePlans: dashboardState.data.tradePlans.length,
            alerts: dashboardState.data.alerts.length
        });
        
        // Update all UI components
        updateStatistics();
        updateRecentTradesTable();
        updateActiveAlerts();
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בטעינת נתוני דשבורד', error.message);
        }
    }
}

// ===== STATISTICS UPDATE =====

/**
 * Update all statistics cards
 * Uses StatisticsCalculator for all calculations
 */
function updateStatistics() {
    console.log('📊 Updating statistics...');
    
    const { accounts, trades, tradePlans, alerts, cashFlows, tickers, notes } = dashboardState.data;
    
    if (!window.StatisticsCalculator) {
        console.warn('⚠️ StatisticsCalculator not available');
        return;
    }
    
    // Calculate statistics using StatisticsCalculator
    const stats = {
        // Main statistics (top section)
        totalAccounts: accounts.length,
        activeTrades: window.StatisticsCalculator.countRecords(trades, t => t.status === 'open'),
        totalProfit: window.StatisticsCalculator.calculateSum(
            trades.filter(t => t.status === 'closed'), 
            'pnl'
        ),
        winRate: calculateWinRate(trades),
        activeAlerts: window.StatisticsCalculator.countRecords(alerts, a => a.is_active === true || a.is_active === 1),
        activePlans: window.StatisticsCalculator.countRecords(tradePlans, p => p.status === 'active'),
        
        // General statistics (section 1)
        totalTrades: trades.length,
        closedTrades: window.StatisticsCalculator.countRecords(trades, t => t.status === 'closed'),
        avgProfit: window.StatisticsCalculator.calculateAverage(
            trades.filter(t => t.status === 'closed'), 
            'pnl'
        ),
        totalTickers: tickers.length,
        weekPerformance: calculatePeriodPerformance(trades, 7),
        monthPerformance: calculatePeriodPerformance(trades, 30),
        totalCashFlows: cashFlows.length,
        totalNotes: notes.length
    };
    
    // Update DOM elements using Global Element Cache
    const elementMap = {
        // Top section
        'totalAccountsStat': stats.totalAccounts,
        'activeTradesStat': stats.activeTrades,
        'totalProfitStat': formatCurrency(stats.totalProfit),
        'winRateStat': `${stats.winRate}%`,
        'activeAlertsStat': stats.activeAlerts,
        'activePlansStat': stats.activePlans,
        
        // Section 1
        'totalTradesStat': stats.totalTrades,
        'closedTradesStat': stats.closedTrades,
        'avgProfitStat': formatCurrency(stats.avgProfit),
        'totalTickersStat': stats.totalTickers,
        'weekPerformanceStat': formatCurrency(stats.weekPerformance),
        'monthPerformanceStat': formatCurrency(stats.monthPerformance),
        'totalCashFlowsStat': stats.totalCashFlows,
        'totalNotesStat': stats.totalNotes
    };
    
    // Update all elements
    Object.entries(elementMap).forEach(([id, value]) => {
        const el = window.getElement?.(id) || document.getElementById(id);
        if (el) {
            el.textContent = value;
        }
    });
    
    // Update profit icon color
    const profitIcon = window.getElement?.('totalProfitIcon') || document.getElementById('totalProfitIcon');
    if (profitIcon) {
        profitIcon.className = stats.totalProfit >= 0 ? 
            'fas fa-dollar-sign text-success mb-2' : 
            'fas fa-dollar-sign text-danger mb-2';
        profitIcon.style.fontSize = '2rem';
    }
    
    console.log('✅ Statistics updated');
}

/**
 * Calculate win rate percentage
 */
function calculateWinRate(trades) {
    const closedTrades = trades.filter(t => t.status === 'closed');
    if (closedTrades.length === 0) return 0;
    
    const winningTrades = closedTrades.filter(t => parseFloat(t.pnl || 0) > 0);
    return Math.round((winningTrades.length / closedTrades.length) * 100);
}

/**
 * Calculate performance for a specific period (days)
 */
function calculatePeriodPerformance(trades, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const periodTrades = trades.filter(t => {
        if (!t.close_date) return false;
        const closeDate = new Date(t.close_date);
        return closeDate >= cutoffDate;
    });
    
    if (!window.StatisticsCalculator) return 0;
    
    return window.StatisticsCalculator.calculateSum(periodTrades, 'pnl');
}

/**
 * Format currency value
 */
function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) return '$0.00';
    
    const num = parseFloat(value);
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
    
    return formatted;
}

// ===== CHARTS INITIALIZATION =====

/**
 * Initialize all dashboard charts
 */
async function initializeCharts() {
    console.log('📊 Initializing charts...');
    
    if (!window.Chart) {
        console.warn('⚠️ Chart.js not loaded');
        return;
    }
    
    try {
        // Create all charts in parallel
        await Promise.all([
            createPerformanceChart(),
            createTradesStatusChart(),
            createAccountDistributionChart(),
            createWinRateChart()
        ]);
        
        console.log('✅ All charts initialized');
    } catch (error) {
        console.error('❌ Error initializing charts:', error);
    }
}

/**
 * Create performance over time line chart
 */
async function createPerformanceChart() {
    try {
        const canvas = window.getElement?.('performanceChart') || document.getElementById('performanceChart');
        if (!canvas) {
            console.warn('⚠️ Performance chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const trades = dashboardState.data.trades || [];
        
        // Prepare data - cumulative P/L over time
        const closedTrades = trades
            .filter(t => t.status === 'closed' && t.close_date)
            .sort((a, b) => new Date(a.close_date) - new Date(b.close_date));
        
        let cumulativePnL = 0;
        const chartData = closedTrades.map(trade => {
            cumulativePnL += parseFloat(trade.pnl || 0);
            return {
                x: new Date(trade.close_date),
                y: cumulativePnL
            };
        });
        
        dashboardState.charts.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'רווח/הפסד מצטבר',
                    data: chartData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `P/L: ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'DD/MM/YY'
                            }
                        },
                        title: {
                            display: true,
                            text: 'תאריך'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'P/L מצטבר ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
        
        console.log('✅ Performance chart created');
    } catch (error) {
        console.error('❌ Error creating performance chart:', error);
    }
}

/**
 * Create trades status distribution doughnut chart
 */
async function createTradesStatusChart() {
    try {
        const canvas = window.getElement?.('tradesStatusChart') || document.getElementById('tradesStatusChart');
        if (!canvas) {
            console.warn('⚠️ Trades status chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const trades = dashboardState.data.trades || [];
        
        // Count by status
        const statusCounts = {
            open: window.StatisticsCalculator?.countRecords(trades, t => t.status === 'open') || 0,
            closed: window.StatisticsCalculator?.countRecords(trades, t => t.status === 'closed') || 0,
            cancelled: window.StatisticsCalculator?.countRecords(trades, t => t.status === 'cancelled') || 0
        };
        
        dashboardState.charts.tradesStatusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['פתוחים', 'סגורים', 'מבוטלים'],
                datasets: [{
                    data: [statusCounts.open, statusCounts.closed, statusCounts.cancelled],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 99, 132, 0.8)'
                    ],
                    borderColor: [
                        'rgb(54, 162, 235)',
                        'rgb(75, 192, 192)',
                        'rgb(255, 99, 132)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    }
                }
            }
        });
        
        console.log('✅ Trades status chart created');
    } catch (error) {
        console.error('❌ Error creating trades status chart:', error);
    }
}

/**
 * Create account distribution bar chart
 */
async function createAccountDistributionChart() {
    try {
        const canvas = window.getElement?.('accountDistributionChart') || document.getElementById('accountDistributionChart');
        if (!canvas) {
            console.warn('⚠️ Account distribution chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const trades = dashboardState.data.trades || [];
        const accounts = dashboardState.data.accounts || [];
        
        // Count trades per account
        const accountTradesCount = {};
        accounts.forEach(account => {
            const accountTrades = trades.filter(t => t.trading_account_id === account.id);
            accountTradesCount[account.account_name || `Account ${account.id}`] = accountTrades.length;
        });
        
        const labels = Object.keys(accountTradesCount);
        const data = Object.values(accountTradesCount);
        
        dashboardState.charts.accountDistributionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'מספר טריידים',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'מספר טריידים'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
        
        console.log('✅ Account distribution chart created');
    } catch (error) {
        console.error('❌ Error creating account distribution chart:', error);
    }
}

/**
 * Create win rate pie chart
 */
async function createWinRateChart() {
    try {
        const canvas = window.getElement?.('winRateChart') || document.getElementById('winRateChart');
        if (!canvas) {
            console.warn('⚠️ Win rate chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const trades = dashboardState.data.trades || [];
        
        // Calculate win/loss for closed trades
        const closedTrades = trades.filter(t => t.status === 'closed');
        const winningTrades = closedTrades.filter(t => parseFloat(t.pnl || 0) > 0);
        const losingTrades = closedTrades.filter(t => parseFloat(t.pnl || 0) < 0);
        const breakEven = closedTrades.filter(t => parseFloat(t.pnl || 0) === 0);
        
        dashboardState.charts.winRateChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['רווחיים', 'הפסדיים', 'איזון'],
                datasets: [{
                    data: [winningTrades.length, losingTrades.length, breakEven.length],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(201, 203, 207, 0.8)'
                    ],
                    borderColor: [
                        'rgb(75, 192, 192)',
                        'rgb(255, 99, 132)',
                        'rgb(201, 203, 207)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15
                        }
                    }
                }
            }
        });
        
        console.log('✅ Win rate chart created');
    } catch (error) {
        console.error('❌ Error creating win rate chart:', error);
    }
}

// ===== TABLE UPDATES =====

/**
 * Update recent trades table
 * Uses FieldRendererService for formatting
 */
function updateRecentTradesTable() {
    console.log('📋 Updating recent trades table...');
    
    const tbody = window.getElement?.('recentTradesBody') || document.getElementById('recentTradesBody');
    if (!tbody) {
        console.warn('⚠️ Recent trades table body not found');
        return;
    }
    
    const trades = dashboardState.data.trades || [];
    const accounts = dashboardState.data.accounts || [];
    
    // Get 10 most recent trades (by open_date)
    const recentTrades = trades
        .sort((a, b) => new Date(b.open_date || 0) - new Date(a.open_date || 0))
        .slice(0, 10);
    
    if (recentTrades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">אין טריידים להצגה</td></tr>';
        return;
    }
    
    // Update additional stats
    updateAdditionalTradeStats(trades);
    
    // Render table rows using FieldRendererService
    tbody.innerHTML = recentTrades.map(trade => {
        const tickerSymbol = trade.ticker_symbol || '-';
        const side = window.FieldRendererService?.renderSide(trade.side) || trade.side;
        const type = window.FieldRendererService?.renderType(trade.investment_type) || trade.investment_type || '-';
        const pnl = window.FieldRendererService?.renderPnL(trade.pnl || trade.total_pl) || '$0';
        const status = window.FieldRendererService?.renderStatus(trade.status, 'trade') || trade.status;
        const openDate = window.FieldRendererService?.renderDate(trade.open_date || trade.opened_at, false) || '-';
        const accountName = trade.account_name || accounts.find(a => a.id === trade.trading_account_id)?.account_name || '-';
        
        return `
            <tr onclick="window.location.href='trades.html?id=${trade.id}'" style="cursor: pointer;" title="לחץ לפרטים מלאים">
                <td><strong>${tickerSymbol}</strong></td>
                <td>${side}</td>
                <td>${type}</td>
                <td>${pnl}</td>
                <td>${status}</td>
                <td>${openDate}</td>
                <td><small>${accountName}</small></td>
            </tr>
        `;
    }).join('');
    
    console.log(`✅ Recent trades table updated with ${recentTrades.length} trades`);
}

/**
 * Update additional trade statistics
 */
function updateAdditionalTradeStats(trades) {
    const openTrades = trades.filter(t => t.status === 'open');
    
    // Today's closed trades
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTrades = trades.filter(t => {
        if (!t.closed_at && !t.close_date) return false;
        const closeDate = new Date(t.closed_at || t.close_date);
        return closeDate >= today;
    });
    
    const todayPnL = todayTrades.reduce((sum, t) => sum + parseFloat(t.pnl || t.total_pl || 0), 0);
    
    // Update DOM
    const openCountEl = window.getElement?.('openTradesCount') || document.getElementById('openTradesCount');
    if (openCountEl) openCountEl.textContent = openTrades.length;
    
    const todayClosedEl = window.getElement?.('todayClosedCount') || document.getElementById('todayClosedCount');
    if (todayClosedEl) todayClosedEl.textContent = todayTrades.length;
    
    const todayPnLEl = window.getElement?.('todayPnL') || document.getElementById('todayPnL');
    if (todayPnLEl) {
        todayPnLEl.textContent = formatCurrency(todayPnL);
        todayPnLEl.className = todayPnL >= 0 ? 'ms-2 text-success' : 'ms-2 text-danger';
    }
    
    // Update last update time
    const lastUpdateEl = window.getElement?.('lastUpdateTime') || document.getElementById('lastUpdateTime');
    if (lastUpdateEl && dashboardState.lastUpdate) {
        lastUpdateEl.textContent = dashboardState.lastUpdate.toLocaleTimeString('he-IL');
    }
}

// ===== ALERTS DISPLAY =====

/**
 * Update active alerts display
 */
function updateActiveAlerts() {
    console.log('🔔 Updating active alerts...');
    
    const container = window.getElement?.('activeAlertsContainer') || document.getElementById('activeAlertsContainer');
    if (!container) {
        console.warn('⚠️ Active alerts container not found');
        return;
    }
    
    const alerts = dashboardState.data.alerts || [];
    
    // Get 5 most recent active alerts
    const activeAlerts = alerts
        .filter(a => a.is_active === true || a.is_active === 1)
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5);
    
    if (activeAlerts.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">אין התראות פעילות</div>';
        return;
    }
    
    // Render alert cards
    container.innerHTML = activeAlerts.map(alert => {
        const priorityColor = alert.priority === 'high' ? 'danger' : 
                             alert.priority === 'medium' ? 'warning' : 'info';
        
        return `
            <div class="col-lg-4 col-md-6">
                <div class="card border-${priorityColor} h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="card-title mb-0">${alert.ticker_symbol || 'כללי'}</h6>
                            ${window.FieldRendererService?.renderPriority(alert.priority) || alert.priority}
                        </div>
                        <p class="card-text small">${alert.condition_description || alert.alert_type || ''}</p>
                        <small class="text-muted">
                            ${window.FieldRendererService?.renderDate(alert.created_at, false) || alert.created_at}
                        </small>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    console.log(`✅ Active alerts updated with ${activeAlerts.length} alerts`);
}

// ===== REFRESH FUNCTIONALITY =====

/**
 * Refresh entire dashboard
 */
async function refreshDashboard() {
    console.log('🔄 Refreshing dashboard...');
    
    try {
        // Show loading notification
        if (window.showInfoNotification) {
            window.showInfoNotification('מרענן דשבורד...');
        }
        
        // Reload data
        await loadDashboardData();
        
        // Destroy old charts
        Object.values(dashboardState.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        dashboardState.charts = {};
        
        // Recreate charts
        await initializeCharts();
        
        // Show success notification
        if (window.showSuccessNotification) {
            window.showSuccessNotification('דשבורד רוענן בהצלחה');
        }
        
        console.log('✅ Dashboard refreshed successfully');
    } catch (error) {
        console.error('❌ Error refreshing dashboard:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה ברענון דשבורד', error.message);
        }
    }
}

/**
 * Setup auto-refresh timer
 */
function setupAutoRefresh() {
    // Refresh every 5 minutes
    dashboardState.refreshInterval = setInterval(async () => {
        console.log('⏰ Auto-refresh triggered');
        await refreshDashboard();
    }, 5 * 60 * 1000);
    
    console.log('✅ Auto-refresh enabled (every 5 minutes)');
}

// ===== CLEANUP =====

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    console.log('🧹 Cleaning up dashboard...');
    
    // Clear refresh interval
    if (dashboardState.refreshInterval) {
        clearInterval(dashboardState.refreshInterval);
    }
    
    // Destroy charts
    Object.values(dashboardState.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
});

// ===== GLOBAL EXPORTS =====

window.refreshDashboard = refreshDashboard;
window.loadDashboardData = loadDashboardData;
window.dashboardState = dashboardState;

console.log('✅ Index page script loaded');
