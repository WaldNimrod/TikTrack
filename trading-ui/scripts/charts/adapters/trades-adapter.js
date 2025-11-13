/**
 * Trades Data Adapter - TikTrack Chart System
 * מתאם נתוני טריידים - מערכת גרפים TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('📊 Trades Data Adapter initialized');

class TradesAdapter {
    constructor(config = {}) {
        this.dataSource = config.dataSource || '/api/trades/';
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
    }

    async getData(params = {}) {
        const cacheKey = JSON.stringify(params);
        const now = Date.now();
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (now - cached.timestamp < this.cacheTimeout) {
                console.log('📊 Using cached trades data');
                return cached.data;
            }
        }

        try {
            console.log('📊 Fetching trades data from API...');
            const response = await fetch(`${this.dataSource}?${new URLSearchParams(params)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Cache the data
            this.cache.set(cacheKey, {
                data: data,
                timestamp: now
            });
            
            // console.log(`📊 Fetched ${data.data?.length || 0} trades from API`);
            return data;
        } catch (error) {
            console.error('❌ Error fetching trades data:', error);
            return { data: [] }; // Return empty data on error
        }
    }

    formatDataForStatusChart(rawData) {
        if (!rawData.data || !Array.isArray(rawData.data)) {
            return { labels: [], datasets: [] };
        }

        // Count trades by status
        const statusCounts = {};
        rawData.data.forEach(trade => {
            const status = trade.status || 'unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const labels = Object.keys(statusCounts);
        const data = Object.values(statusCounts);

        // Get color palette for charts
        const colorPalette = window.getChartColorPalette ? window.getChartColorPalette() : [
            '#26baac', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d'
        ];
        
        return {
            labels: labels,
            datasets: [{
                label: 'מספר טריידים לפי סטטוס',
                data: data,
                backgroundColor: [
                    colorPalette[1] || '#28a745', // success - open
                    colorPalette[2] || '#ffc107', // warning - closed
                    colorPalette[3] || '#dc3545', // danger - cancelled
                    colorPalette[4] || '#17a2b8'  // info - other
                ],
                borderColor: [
                    colorPalette[1] || '#28a745',
                    colorPalette[2] || '#ffc107',
                    colorPalette[3] || '#dc3545',
                    colorPalette[4] || '#17a2b8'
                ],
                borderWidth: 2
            }]
        };
    }

    formatDataForAccountChart(rawData) {
        if (!rawData.data || !Array.isArray(rawData.data)) {
            return { labels: [], datasets: [] };
        }

        // Count trades by account
        const accountCounts = {};
        rawData.data.forEach(trade => {
            const accountName = trade.account_name || `חשבון מסחר ${trade.account_id}`;
            accountCounts[accountName] = (accountCounts[accountName] || 0) + 1;
        });

        const labels = Object.keys(accountCounts);
        const data = Object.values(accountCounts);

        // Get color palette for charts
        const colorPalette = window.getChartColorPalette ? window.getChartColorPalette() : [
            '#26baac', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d'
        ];
        
        return {
            labels: labels,
            datasets: [{
                label: 'מספר טריידים לפי חשבון מסחר',
                data: data,
                backgroundColor: [
                    colorPalette[0] || '#26baac', // primary
                    colorPalette[1] || '#28a745', // success
                    colorPalette[2] || '#ffc107', // warning
                    colorPalette[4] || '#17a2b8'  // info
                ],
                borderColor: [
                    colorPalette[0] || '#26baac',
                    colorPalette[1] || '#28a745',
                    colorPalette[2] || '#ffc107',
                    colorPalette[4] || '#17a2b8'
                ],
                borderWidth: 2
            }]
        };
    }

    formatDataForPerformanceChart(rawData) {
        if (!rawData.data || !Array.isArray(rawData.data)) {
            return { labels: [], datasets: [] };
        }

        // Group trades by month and calculate performance
        const monthlyData = {};
        rawData.data.forEach(trade => {
            if (trade.created_at) {
                const date = new Date(trade.created_at);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = { total: 0, count: 0 };
                }
                
                monthlyData[monthKey].total += trade.total_pl || 0;
                monthlyData[monthKey].count += 1;
            }
        });

        const labels = Object.keys(monthlyData).sort();
        const performanceData = labels.map(month => monthlyData[month].total);
        const countData = labels.map(month => monthlyData[month].count);

        // Get color palette for charts
        const colorPalette = window.getChartColorPalette ? window.getChartColorPalette() : [
            '#26baac', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6c757d'
        ];
        
        // Get colors with opacity
        const primaryColor = colorPalette[0] || '#26baac';
        const successColor = colorPalette[1] || '#28a745';
        const primaryWithOpacity = window.getChartColorWithOpacity ? 
            window.getChartColorWithOpacity('primary', 0.2) : 'rgba(38, 186, 172, 0.2)';
        const successWithOpacity = window.getChartColorWithOpacity ? 
            window.getChartColorWithOpacity('success', 0.2) : 'rgba(40, 167, 69, 0.2)';
        
        return {
            labels: labels,
            datasets: [
                {
                    label: 'רווח/הפסד חודשי',
                    data: performanceData,
                    borderColor: primaryColor,
                    backgroundColor: primaryWithOpacity,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'מספר טריידים',
                    data: countData,
                    borderColor: successColor,
                    backgroundColor: successWithOpacity,
                    tension: 0.4,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        };
    }

    formatData(rawData, chartType = 'status') {
        switch (chartType) {
            case 'status':
                return this.formatDataForStatusChart(rawData);
            case 'account':
                return this.formatDataForAccountChart(rawData);
            case 'performance':
                return this.formatDataForPerformanceChart(rawData);
            default:
                return this.formatDataForStatusChart(rawData);
        }
    }

    // Get summary statistics
    getSummaryStats(rawData) {
        if (!rawData.data || !Array.isArray(rawData.data)) {
            return {
                totalTrades: 0,
                openTrades: 0,
                closedTrades: 0,
                cancelledTrades: 0,
                totalPL: 0,
                averagePL: 0
            };
        }

        const trades = rawData.data;
        const totalTrades = trades.length;
        const openTrades = trades.filter(t => t.status === 'open').length;
        const closedTrades = trades.filter(t => t.status === 'closed').length;
        const cancelledTrades = trades.filter(t => t.status === 'cancelled').length;
        const totalPL = trades.reduce((sum, t) => sum + (t.total_pl || 0), 0);
        const averagePL = totalTrades > 0 ? totalPL / totalTrades : 0;

        return {
            totalTrades,
            openTrades,
            closedTrades,
            cancelledTrades,
            totalPL: Math.round(totalPL * 100) / 100,
            averagePL: Math.round(averagePL * 100) / 100
        };
    }
}

window.TradesAdapter = TradesAdapter;
