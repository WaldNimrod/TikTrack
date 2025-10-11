/**
 * ========================================
 * Research Page - Analytics Controller
 * ========================================
 * 
 * עמוד מחקר וניתוח - מערכת ניתוח מתקדמת
 * 
 * Features:
 * - 4 KPI calculations (Total Return, Win Rate, Avg Trade, Sharpe Ratio)
 * - 5 analytical charts
 * - Performance comparison (Portfolio vs indices)
 * - Ticker-based performance analysis
 * - Investment type breakdown
 * 
 * Service Systems Integration:
 * ✅ StatisticsCalculator - All KPI calculations
 * ✅ FieldRendererService - P/L formatting
 * ✅ Global Element Cache - DOM access optimization
 * ✅ ChartSystem - All analytical charts
 * ✅ Notification System - User feedback
 * 
 * File: trading-ui/scripts/research.js
 * Version: 3.0.0 - Complete Rebuild
 * Last Updated: October 11, 2025
 */

console.log('🔍 Research page script loading...');

// ===== GLOBAL STATE =====
const researchState = {
    charts: {},
    data: {},
    activeTab: 'overview',
    performanceData: []
};

// ===== INITIALIZATION =====

/**
 * Initialize research page
 * Called by unified initialization system
 */
window.initializeResearchPage = async function() {
    console.log('🔍 Initializing Research Page...');
    
    try {
        // Load research data
        await loadResearchData();
        
        // Initialize charts
        await initializeResearchCharts();
        
        // Setup tab handlers
        setupTabHandlers();
        
        console.log('✅ Research page initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing research page:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה באתחול עמוד מחקר', error.message);
        }
    }
};

// ===== DATA LOADING =====

/**
 * Load all research data from APIs
 */
async function loadResearchData() {
    console.log('📊 Loading research data...');
    
    try {
        // Fetch data in parallel
        const [trades, accounts, tickers] = await Promise.all([
            fetch('/api/trades/').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/trading-accounts/').then(r => r.json()).catch(() => ({ data: [] })),
            fetch('/api/tickers/').then(r => r.json()).catch(() => ({ data: [] }))
        ]);
        
        // Store in state
        researchState.data = {
            trades: trades.data || [],
            accounts: accounts.data || [],
            tickers: tickers.data || []
        };
        
        console.log('📊 Research data loaded:', {
            trades: researchState.data.trades.length,
            accounts: researchState.data.accounts.length,
            tickers: researchState.data.tickers.length
        });
        
        // Calculate and update KPIs
        calculateKPIs();
        
        // Update performance table
        updatePerformanceTable();
        
    } catch (error) {
        console.error('❌ Error loading research data:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה בטעינת נתוני מחקר', error.message);
        }
    }
}

// ===== KPI CALCULATIONS =====

/**
 * Calculate all Key Performance Indicators
 * Uses StatisticsCalculator for all calculations
 */
function calculateKPIs() {
    console.log('📊 Calculating KPIs...');
    
    const trades = researchState.data.trades || [];
    
    if (!window.StatisticsCalculator) {
        console.warn('⚠️ StatisticsCalculator not available');
        return;
    }
    
    const closedTrades = trades.filter(t => t.status === 'closed');
    const winningTrades = closedTrades.filter(t => parseFloat(t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(t => parseFloat(t.pnl || 0) < 0);
    
    // Calculate KPIs
    const kpis = {
        totalReturn: window.StatisticsCalculator.calculateSum(closedTrades, 'pnl'),
        winRate: closedTrades.length > 0 ? 
            ((winningTrades.length / closedTrades.length) * 100).toFixed(1) : 0,
        avgTrade: window.StatisticsCalculator.calculateAverage(closedTrades, 'pnl'),
        sharpeRatio: calculateSharpeRatio(closedTrades)
    };
    
    console.log('📊 KPIs calculated:', kpis);
    
    // Update KPI cards
    updateKPICards(kpis);
}

/**
 * Update KPI cards in the DOM
 */
function updateKPICards(kpis) {
    const elementMap = {
        'totalReturnKPI': formatCurrency(kpis.totalReturn),
        'winRateKPI': `${kpis.winRate}%`,
        'avgTradeKPI': formatCurrency(kpis.avgTrade),
        'sharpeRatioKPI': kpis.sharpeRatio
    };
    
    Object.entries(elementMap).forEach(([id, value]) => {
        const el = window.getElement?.(id) || document.getElementById(id);
        if (el) {
            el.textContent = value;
            
            // Add color to total return
            if (id === 'totalReturnKPI') {
                const numValue = parseFloat(kpis.totalReturn);
                el.className = numValue >= 0 ? 
                    'card-title mb-1 text-success' : 
                    'card-title mb-1 text-danger';
            }
        }
    });
}

/**
 * Calculate Sharpe Ratio
 * (Average Return - Risk Free Rate) / Standard Deviation
 */
function calculateSharpeRatio(trades) {
    if (trades.length < 2) return 'N/A';
    
    const returns = trades.map(t => parseFloat(t.pnl || 0));
    
    // Calculate average return
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    
    // Calculate standard deviation
    const variance = returns.reduce((sum, r) => {
        const diff = r - avgReturn;
        return sum + (diff * diff);
    }, 0) / returns.length;
    
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 'N/A';
    
    // Assuming risk-free rate of 0 for simplicity
    const sharpe = avgReturn / stdDev;
    
    return sharpe.toFixed(2);
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
 * Initialize all research charts
 */
async function initializeResearchCharts() {
    console.log('📊 Initializing research charts...');
    
    if (!window.Chart) {
        console.warn('⚠️ Chart.js not loaded');
        return;
    }
    
    try {
        // Create all charts in parallel
        await Promise.all([
            createPortfolioComparisonChart(),
            createReturnsByTypeChart(),
            createTypeDistributionChart(),
            createSideDistributionChart(),
            createAccountDistributionChart()
        ]);
        
        console.log('✅ All research charts initialized');
    } catch (error) {
        console.error('❌ Error initializing research charts:', error);
    }
}

/**
 * Create portfolio vs S&P 500 comparison chart
 */
async function createPortfolioComparisonChart() {
    try {
        const canvas = window.getElement?.('portfolioComparisonChart') || 
                       document.getElementById('portfolioComparisonChart');
        if (!canvas) {
            console.warn('⚠️ Portfolio comparison chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const trades = researchState.data.trades || [];
        
        // Prepare portfolio performance data
        const closedTrades = trades
            .filter(t => t.status === 'closed' && t.close_date)
            .sort((a, b) => new Date(a.close_date) - new Date(b.close_date));
        
        let cumulativePnL = 0;
        const portfolioData = closedTrades.map(trade => {
            cumulativePnL += parseFloat(trade.pnl || 0);
            return {
                x: new Date(trade.close_date),
                y: cumulativePnL
            };
        });
        
        // Mock S&P 500 data (in real implementation, fetch from external API)
        const sp500Data = portfolioData.map(point => ({
            x: point.x,
            y: point.y * 0.7 // Mock: S&P growing at 70% of portfolio
        }));
        
        researchState.charts.portfolioComparisonChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'התיק שלי',
                        data: portfolioData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.1)',
                        tension: 0.1,
                        fill: true
                    },
                    {
                        label: 'S&P 500 (הערכה)',
                        data: sp500Data,
                        borderColor: 'rgb(255, 159, 64)',
                        backgroundColor: 'rgba(255, 159, 64, 0.1)',
                        tension: 0.1,
                        fill: true,
                        borderDash: [5, 5]
                    }
                ]
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
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
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
                            text: 'תשואה מצטברת ($)'
                        }
                    }
                }
            }
        });
        
        console.log('✅ Portfolio comparison chart created');
    } catch (error) {
        console.error('❌ Error creating portfolio comparison chart:', error);
    }
}

/**
 * Create returns by investment type bar chart
 */
async function createReturnsByTypeChart() {
    try {
        const canvas = window.getElement?.('returnsByTypeChart') || 
                       document.getElementById('returnsByTypeChart');
        if (!canvas) {
            console.warn('⚠️ Returns by type chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const trades = researchState.data.trades || [];
        
        // Group by investment type
        const typeReturns = {
            swing: 0,
            investment: 0,
            passive: 0
        };
        
        trades.filter(t => t.status === 'closed').forEach(trade => {
            const type = trade.investment_type || 'swing';
            typeReturns[type] = (typeReturns[type] || 0) + parseFloat(trade.pnl || 0);
        });
        
        researchState.charts.returnsByTypeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Swing', 'Investment', 'Passive'],
                datasets: [{
                    label: 'סה"כ תשואה',
                    data: [typeReturns.swing, typeReturns.investment, typeReturns.passive],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ],
                    borderColor: [
                        'rgb(54, 162, 235)',
                        'rgb(75, 192, 192)',
                        'rgb(153, 102, 255)'
                    ],
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
                            text: 'תשואה ($)'
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
        
        console.log('✅ Returns by type chart created');
    } catch (error) {
        console.error('❌ Error creating returns by type chart:', error);
    }
}

/**
 * Create type distribution pie chart
 */
async function createTypeDistributionChart() {
    try {
        const canvas = window.getElement?.('typeDistributionChart') || 
                       document.getElementById('typeDistributionChart');
        if (!canvas) {
            console.warn('⚠️ Type distribution chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const trades = researchState.data.trades || [];
        
        // Count by type
        const typeCounts = {
            swing: 0,
            investment: 0,
            passive: 0
        };
        
        trades.forEach(trade => {
            const type = trade.investment_type || 'swing';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        researchState.charts.typeDistributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Swing', 'Investment', 'Passive'],
                datasets: [{
                    data: [typeCounts.swing, typeCounts.investment, typeCounts.passive],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)'
                    ],
                    borderColor: [
                        'rgb(54, 162, 235)',
                        'rgb(75, 192, 192)',
                        'rgb(153, 102, 255)'
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
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        console.log('✅ Type distribution chart created');
    } catch (error) {
        console.error('❌ Error creating type distribution chart:', error);
    }
}

/**
 * Create side distribution doughnut chart
 */
async function createSideDistributionChart() {
    try {
        const canvas = window.getElement?.('sideDistributionChart') || 
                       document.getElementById('sideDistributionChart');
        if (!canvas) {
            console.warn('⚠️ Side distribution chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const trades = researchState.data.trades || [];
        
        // Count by side
        const sideCounts = {
            long: window.StatisticsCalculator?.countRecords(trades, t => t.side === 'long') || 0,
            short: window.StatisticsCalculator?.countRecords(trades, t => t.side === 'short') || 0
        };
        
        researchState.charts.sideDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Long', 'Short'],
                datasets: [{
                    data: [sideCounts.long, sideCounts.short],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 99, 132, 0.8)'
                    ],
                    borderColor: [
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
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        
        console.log('✅ Side distribution chart created');
    } catch (error) {
        console.error('❌ Error creating side distribution chart:', error);
    }
}

/**
 * Create account distribution bar chart
 */
async function createAccountDistributionChart() {
    try {
        const canvas = window.getElement?.('accountDistributionChart') || 
                       document.getElementById('accountDistributionChart');
        if (!canvas) {
            console.warn('⚠️ Account distribution chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const trades = researchState.data.trades || [];
        const accounts = researchState.data.accounts || [];
        
        // Count trades per account
        const accountData = accounts.map(account => {
            const accountTrades = trades.filter(t => t.trading_account_id === account.id);
            return {
                name: account.account_name || `Account ${account.id}`,
                count: accountTrades.length
            };
        }).filter(a => a.count > 0);
        
        researchState.charts.accountDistributionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: accountData.map(a => a.name),
                datasets: [{
                    label: 'מספר טריידים',
                    data: accountData.map(a => a.count),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgb(153, 102, 255)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
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

// ===== PERFORMANCE TABLE =====

/**
 * Update performance table grouped by ticker
 * Uses FieldRendererService for formatting
 */
function updatePerformanceTable() {
    console.log('📋 Updating performance table...');
    
    const tbody = window.getElement?.('performanceTableBody') || 
                  document.getElementById('performanceTableBody');
    if (!tbody) {
        console.warn('⚠️ Performance table body not found');
        return;
    }
    
    const trades = researchState.data.trades || [];
    
    // Group by ticker
    const byTicker = {};
    trades.forEach(trade => {
        const ticker = trade.ticker_symbol || 'Unknown';
        if (!byTicker[ticker]) {
            byTicker[ticker] = {
                trades: [],
                pnl: 0,
                wins: 0
            };
        }
        byTicker[ticker].trades.push(trade);
        
        if (trade.status === 'closed') {
            const pnl = parseFloat(trade.pnl || 0);
            byTicker[ticker].pnl += pnl;
            if (pnl > 0) byTicker[ticker].wins++;
        }
    });
    
    // Convert to array and calculate metrics
    const performanceData = Object.entries(byTicker)
        .map(([ticker, data]) => {
            const closedTrades = data.trades.filter(t => t.status === 'closed');
            const totalTrades = closedTrades.length;
            const winRate = totalTrades > 0 ? 
                ((data.wins / totalTrades) * 100).toFixed(1) : 0;
            const avgPnL = totalTrades > 0 ? 
                (data.pnl / totalTrades).toFixed(2) : 0;
            
            return {
                ticker,
                totalTrades: data.trades.length,
                winRate,
                totalPnL: data.pnl,
                avgPnL
            };
        })
        .filter(d => d.totalTrades > 0)
        .sort((a, b) => b.totalPnL - a.totalPnL);
    
    researchState.performanceData = performanceData;
    
    if (performanceData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">אין נתונים להצגה</td></tr>';
        return;
    }
    
    // Render table using FieldRendererService
    tbody.innerHTML = performanceData.map(row => {
        const totalPnL = window.FieldRendererService?.renderPnL(row.totalPnL) || formatCurrency(row.totalPnL);
        const avgPnL = window.FieldRendererService?.renderPnL(row.avgPnL) || formatCurrency(row.avgPnL);
        
        return `
            <tr>
                <td><strong>${row.ticker}</strong></td>
                <td>${row.totalTrades}</td>
                <td>${row.winRate}%</td>
                <td>${totalPnL}</td>
                <td>${avgPnL}</td>
            </tr>
        `;
    }).join('');
    
    console.log(`✅ Performance table updated with ${performanceData.length} tickers`);
}

// ===== TAB HANDLERS =====

/**
 * Setup tab change handlers
 */
function setupTabHandlers() {
    const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
    
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', (event) => {
            const targetId = event.target.getAttribute('data-bs-target');
            researchState.activeTab = targetId?.replace('#', '') || 'overview';
            
            console.log(`📑 Switched to tab: ${researchState.activeTab}`);
        });
    });
    
    console.log('✅ Tab handlers setup complete');
}

// ===== REFRESH FUNCTIONALITY =====

/**
 * Refresh research page data and charts
 */
async function refreshResearch() {
    console.log('🔄 Refreshing research page...');
    
    try {
        // Show loading notification
        if (window.showInfoNotification) {
            window.showInfoNotification('מרענן ניתוחים...');
        }
        
        // Reload data
        await loadResearchData();
        
        // Destroy old charts
        Object.values(researchState.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        researchState.charts = {};
        
        // Recreate charts
        await initializeResearchCharts();
        
        // Show success notification
        if (window.showSuccessNotification) {
            window.showSuccessNotification('ניתוחים רוענו בהצלחה');
        }
        
        console.log('✅ Research page refreshed successfully');
    } catch (error) {
        console.error('❌ Error refreshing research page:', error);
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה ברענון ניתוחים', error.message);
        }
    }
}

// ===== CLEANUP =====

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    console.log('🧹 Cleaning up research page...');
    
    // Destroy charts
    Object.values(researchState.charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
});

// ===== GLOBAL EXPORTS =====

window.refreshResearch = refreshResearch;
window.loadResearchData = loadResearchData;
window.researchState = researchState;

console.log('✅ Research page script loaded');
