/**
 * History Widget - Quick history widget for dashboard
 * 
 * This file handles the history widget functionality for the mockup.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 * 
 * @version 3.0.0
 * @lastUpdated 2025-01-27
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - initializeHeader() - Initializeheader
// - initWeeklyPLChart() - Initweeklyplchart
// - initTabs() - Inittabs
// - createQuickLinksActionsMenu() - Createquicklinksactionsmenu
// - setupQuickLinksPositioning() - Setupquicklinkspositioning
// - setupQuickLinks() - Setupquicklinks
// - initializeWidgets() - Initializewidgets
// - initializePage() - Initializepage

// === UI Functions ===
// - updateChartLabels() - Updatechartlabels
// - updateDailyStats() - Updatedailystats
// - updatePLStats() - Updateplstats
// - updateMarketValueStats() - Updatemarketvaluestats
// - refreshWidget() - Refreshwidget

// === Data Functions ===
// - getCSSVariableValue() - Getcssvariablevalue
// - getDateRangeData() - Getdaterangedata

// === Utility Functions ===
// - formatValue() - Formatvalue
// - check() - Check

// === Other ===
// - toggleChartDateRangeMenu() - Togglechartdaterangemenu
// - selectChartDateRange() - Selectchartdaterange
// - waitForSystem() - Waitforsystem

(function() {
    'use strict';

    // Global state
    let weeklyPLChart = null;
    let weeklyPLSeries = null;
    let currentChartDateRange = 'השבוע';

    /**
     * Initialize Header System
     */
    async function initializeHeader() {
        // Wait for HeaderSystem to be available
        if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
            try {
                await window.HeaderSystem.initialize();
                if (window.Logger) {
                    window.Logger.info('✅ Header System initialized', { page: 'history-widget' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error initializing Header System', { 
                        page: 'history-widget', 
                        error 
                    });
                }
            }
        } else {
            // Retry after a short delay if HeaderSystem not loaded yet
            setTimeout(() => {
                if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                    window.HeaderSystem.initialize().catch((error) => {
                        if (window.Logger) {
                            window.Logger.error('Error initializing Header System (retry)', { 
                                page: 'history-widget', 
                                error 
                            });
                        }
                    });
                } else {
                    if (window.Logger) {
                        window.Logger.warn('HeaderSystem not available after retry', { page: 'history-widget' });
                    }
                }
            }, 500);
        }
    }

    /**
     * Helper function to get CSS variable value
     * @param {string} variableName - CSS variable name
     * @param {string} fallback - Fallback value
     * @returns {string} CSS variable value or fallback
     */
    function getCSSVariableValue(variableName, fallback) {
        try {
            const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
            return value && value.trim() ? value.trim() : fallback;
        } catch (error) {
            return fallback;
        }
    }


    /**
     * Toggle Chart Date Range Menu
     */
    function toggleChartDateRangeMenu() {
        const menu = document.getElementById('chartDateRangeMenu');
        if (menu) {
            const isCurrentlyOpen = menu.classList.contains('show');
            if (isCurrentlyOpen) {
                menu.classList.remove('show');
            } else {
                // Close quick links menu if open
                const quickLinksMenu = document.getElementById('quickLinksMenu');
                if (quickLinksMenu) {
                    quickLinksMenu.classList.remove('show');
                }
                menu.classList.add('show');
            }
        }
    }

    /**
     * Select Chart Date Range
     */
    function selectChartDateRange(dateRange) {
        currentChartDateRange = dateRange;
        
        // Update selected text
        const selectedText = document.getElementById('selectedChartDateRange');
        if (selectedText) {
            selectedText.textContent = dateRange;
        }
        
        // Update selected item - remove selected from all, add to clicked
        const menuItems = document.querySelectorAll('#chartDateRangeMenu .date-range-filter-item');
        menuItems.forEach(item => item.classList.remove('selected'));
        const clickedItem = Array.from(menuItems).find(
            item => item.getAttribute('data-value') === dateRange
        );
        if (clickedItem) {
            clickedItem.classList.add('selected');
        }
        
        // Close menu
        const menu = document.getElementById('chartDateRangeMenu');
        if (menu) {
            menu.classList.remove('show');
        }
        
        // Refresh chart with new date range
        initWeeklyPLChart();
        
        if (window.Logger) {
            window.Logger.info('Chart date range selected', { page: 'history-widget', dateRange });
        }
    }

    /**
     * Update Chart Labels
     * Updates the chart labels with total value and percentage change
     */
    function updateChartLabels(chartData) {
        try {
            if (!chartData || chartData.length === 0) {
                return;
            }

            // Calculate total and change
            const firstValue = chartData[0].value;
            const lastValue = chartData[chartData.length - 1].value;
            const totalValue = lastValue;
            const change = lastValue - firstValue;
            const changePercent = firstValue !== 0 ? ((change / Math.abs(firstValue)) * 100) : 0;
            
            // Ensure sign consistency: if change is positive, percent is positive; if change is negative, percent is negative
            const sign = change >= 0 ? 1 : -1;
            const absChangePercent = Math.abs(changePercent);
            const finalChangePercent = sign * absChangePercent;

            // Update total value label
            const totalValueElement = document.getElementById('chartTotalValue');
            if (totalValueElement && typeof window.FieldRendererService !== 'undefined') {
                const htmlContent = window.FieldRendererService.renderNumericValue(
                    totalValue,
                    '$',
                    false
                );
                totalValueElement.textContent = '';
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                doc.body.childNodes.forEach(node => {
                    totalValueElement.appendChild(node.cloneNode(true));
                });
                // Update color based on value
                totalValueElement.className = 'chart-label-value ' + (totalValue >= 0 ? 'text-success' : 'text-danger');
            } else if (totalValueElement) {
                totalValueElement.textContent = `$${totalValue.toLocaleString()}`;
                totalValueElement.className = 'chart-label-value ' + (totalValue >= 0 ? 'text-success' : 'text-danger');
            }

            // Update change percent label - use finalChangePercent that has consistent sign
            const changePercentElement = document.getElementById('chartChangePercent');
            if (changePercentElement && typeof window.FieldRendererService !== 'undefined') {
                const htmlContent = window.FieldRendererService.renderNumericValue(
                    finalChangePercent,
                    '%',
                    true
                );
                changePercentElement.textContent = '';
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                doc.body.childNodes.forEach(node => {
                    changePercentElement.appendChild(node.cloneNode(true));
                });
                changePercentElement.className = 'chart-label-value ' + (finalChangePercent >= 0 ? 'text-success' : 'text-danger');
            } else if (changePercentElement) {
                changePercentElement.textContent = finalChangePercent > 0 ? `+${finalChangePercent.toFixed(2)}%` : `${finalChangePercent.toFixed(2)}%`;
                changePercentElement.className = 'chart-label-value ' + (finalChangePercent >= 0 ? 'text-success' : 'text-danger');
            }

            if (window.Logger) {
                window.Logger.info('✅ Chart labels updated', { page: 'history-widget', totalValue, changePercent });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error updating chart labels', { page: 'history-widget', error });
            }
        }
    }

    /**
     * Get Date Range Data
     * Returns mock data based on selected date range
     */
    function getDateRangeData(dateRange) {
        const today = new Date();
        const data = [];
        let days = 7; // Default: week
        
        // Calculate days based on date range
        switch(dateRange) {
            case 'היום':
                days = 1;
                break;
            case 'אתמול':
                days = 1;
                break;
            case 'השבוע':
            case 'שבוע':
                days = 7;
                break;
            case 'שבוע קודם':
                days = 7;
                break;
            case 'החודש':
            case 'חודש':
                days = 30;
                break;
            case 'חודש קודם':
                days = 30;
                break;
            case 'השנה':
            case 'שנה':
                days = 365;
                break;
            default:
                days = 7;
        }
        
        // Generate mock data
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const value = 100 + (i * 30) + Math.random() * 20;
            data.push({
                time: date.toISOString().split('T')[0],
                value: Math.round(value)
            });
        }
        
        return data;
    }

    /**
     * Initialize Weekly P/L Chart
     * Creates a small line chart showing P/L data for selected date range
     */
    async function initWeeklyPLChart() {
        const container = document.getElementById('weeklyPLChartContainer');
        if (!container) {
            if (window.Logger) {
                window.Logger.warn('Weekly P/L chart container not found', { page: 'history-widget' });
            }
            return;
        }

        // Check if TradingViewChartAdapter is available
        if (typeof window.TradingViewChartAdapter === 'undefined') {
            if (window.Logger) {
                window.Logger.warn('TradingViewChartAdapter not available, retrying...', { page: 'history-widget' });
            }
            // Retry after a delay
            setTimeout(initWeeklyPLChart, 500);
            return;
        }

        try {
            // Remove loading indicator
            const loading = container.querySelector('.chart-loading');
            if (loading) {
                loading.remove();
            }

            // Destroy existing chart if exists
            if (weeklyPLChart) {
                try {
                    weeklyPLChart.remove();
                } catch (e) {
                    // Ignore errors during cleanup
                }
                weeklyPLChart = null;
                weeklyPLSeries = null;
            }

            // Get container dimensions
            const containerWidth = container.clientWidth || 300;
            const containerHeight = 150; // Extra-small chart height

            // Get theme colors
            const primaryColor = getCSSVariableValue('--primary-color', '#26baac');
            const textColor = getCSSVariableValue('--text-color', '#212529');
            const backgroundColor = getCSSVariableValue('--card-background', '#ffffff');
            const gridColor = getCSSVariableValue('--border-color', '#e0e0e0');

            // Create chart
            weeklyPLChart = window.TradingViewChartAdapter.createChart(container, {
                width: containerWidth,
                height: containerHeight,
                layout: {
                    textColor: textColor,
                    background: { type: 'solid', color: backgroundColor }
                },
                grid: {
                    vertLines: { color: gridColor, visible: false },
                    horzLines: { color: gridColor, visible: true }
                },
                timeScale: {
                    timeVisible: false,
                    secondsVisible: false,
                    borderVisible: false
                },
                rightPriceScale: {
                    visible: false
                },
                leftPriceScale: {
                    visible: false
                },
                crosshair: {
                    mode: 0 // Hidden
                }
            });

            // Add line series
            weeklyPLSeries = window.TradingViewChartAdapter.addLineSeries(weeklyPLChart, {
                color: primaryColor,
                lineWidth: 2,
                lineType: 0 // Normal
            });

            // Get data based on selected date range
            const chartData = getDateRangeData(currentChartDateRange);

            // Set data
            weeklyPLSeries.setData(chartData);

            // Fit content
            weeklyPLChart.timeScale().fitContent();

            // Update chart labels
            updateChartLabels(chartData);

            if (window.Logger) {
                window.Logger.info('✅ P/L chart initialized', { page: 'history-widget', dateRange: currentChartDateRange });
            }
        } catch (error) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה בטעינת גרף P/L', 
                    `לא ניתן לטעון את גרף הרווח/הפסד. ${errorMsg}`);
            } else if (window.Logger) {
                window.Logger.error('Error initializing P/L chart', { 
                    page: 'history-widget', 
                    error 
                });
            }
            // Show error message in container
            const container = document.getElementById('weeklyPLChartContainer');
            if (container) {
                container.innerHTML.textContent = '';
        const div = document.createElement('div');
        div.className = 'text-muted text-center p-3';
        div.textContent = 'שגיאה בטעינת הגרף';
        container.innerHTML.appendChild(div);
            }
        }
    }

    /**
     * Update Daily Statistics
     * Updates the daily stats tab - shows: Instrument | Daily P&L / Change | Last Price
     */
    function updateDailyStats() {
        try {
            const tbody = document.getElementById('dailyStatsTableBody');
            if (!tbody) {
                return;
            }

            // Mock data based on screenshots - Daily P&L tab format
            const dailyData = [
                { ticker: 'ANX', fullName: 'AM NASDAQ-100 SP ET...', dailyPL: 1380, change: 6.85, lastPrice: 246.25, priceChangePercent: 2.86 },
                { ticker: 'TETH', fullName: '21SHARES ETHEREUM...', dailyPL: 1320, change: 1.17, lastPrice: 14.85, priceChangePercent: 8.55 },
                { ticker: 'IBIT', fullName: 'ISHARES BITCOIN TRU...', dailyPL: 1320, change: 2.61, lastPrice: 50.58, priceChangePercent: 5.44 },
                { ticker: 'JPM', fullName: 'JPMORGAN CHASE & CO', dailyPL: 0, change: 0.03, lastPrice: 298.05, priceChangePercent: 0.01 },
                { ticker: 'FLXI', fullName: 'FRK FTSE INDIA UCITS...', dailyPL: 0, change: -0.100, lastPrice: 39.005, priceChangePercent: -0.26 },
                { ticker: 'ALAB', fullName: 'ASTERA LABS INC', dailyPL: -46.0, change: 6.00, lastPrice: 147.80, priceChangePercent: 4.23 }
            ];

            tbody.textContent = '';
            
            dailyData.forEach(item => {
                const row = document.createElement('tr');
                
                // Instrument (Ticker + Full Name)
                const instrumentCell = document.createElement('td');
                instrumentCell.textContent = '';
        // Convert HTML string to DOM elements safely
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div><strong>${item.ticker}</strong></div><div class="text-muted small">${item.fullName}</div>`, 'text/html');
        const fragment = document.createDocumentFragment();
        Array.from(doc.body.childNodes).forEach(node => {
            fragment.appendChild(node.cloneNode(true));
        });
        instrumentCell.appendChild(fragment);
                row.appendChild(instrumentCell);
                
                // Daily P&L / Change
                const plChangeCell = document.createElement('td');
                let plHtml = '';
                let changeHtml = '';
                
                if (typeof window.FieldRendererService !== 'undefined') {
                    plHtml = window.FieldRendererService.renderNumericValue(item.dailyPL, '$', true);
                    changeHtml = window.FieldRendererService.renderNumericValue(item.change, '$', true);
                } else {
                    if (item.dailyPL > 0) {
                        plHtml = `<span class="text-success">${formatValue(item.dailyPL)}K</span>`;
                    } else if (item.dailyPL < 0) {
                        plHtml = `<span class="text-danger">${formatValue(item.dailyPL)}K</span>`;
                    } else {
                        plHtml = `<span class="text-muted">0</span>`;
                    }
                    changeHtml = item.change > 0 ? `+${item.change.toFixed(2)}` : `${item.change.toFixed(3)}`;
                }
                
                plChangeCell.textContent = '';
                const plDiv = document.createElement('div');
                const parser = new DOMParser();
                const plDoc = parser.parseFromString(plHtml, 'text/html');
                plDoc.body.childNodes.forEach(node => {
                    plDiv.appendChild(node.cloneNode(true));
                });
                plChangeCell.appendChild(plDiv);
                const changeDiv = document.createElement('div');
                changeDiv.className = 'small';
                changeDiv.textContent = changeHtml;
                plChangeCell.appendChild(changeDiv);
                row.appendChild(plChangeCell);
                
                // Last Price (with percentage change)
                const lastPriceCell = document.createElement('td');
                const priceColor = item.priceChangePercent >= 0 ? 'text-success' : 'text-danger';
                const priceSign = item.priceChangePercent >= 0 ? '+' : '';
                lastPriceCell.textContent = '';
                const priceDiv = document.createElement('div');
                priceDiv.className = priceColor;
                const strong = document.createElement('strong');
                strong.textContent = item.lastPrice.toFixed(2);
                priceDiv.appendChild(strong);
                lastPriceCell.appendChild(priceDiv);
                const percentDiv = document.createElement('div');
                percentDiv.className = `small ${priceColor}`;
                percentDiv.textContent = `${priceSign}${item.priceChangePercent.toFixed(2)}%`;
                lastPriceCell.appendChild(percentDiv);
                row.appendChild(lastPriceCell);
                
                tbody.appendChild(row);
            });

            if (window.Logger) {
                window.Logger.info('✅ Daily stats updated', { page: 'history-widget' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error updating daily stats', { 
                    page: 'history-widget', 
                    error 
                });
            }
        }
    }
    
    /**
     * Helper function to format values (e.g., 1380 -> "1.38")
     */
    function formatValue(value) {
        if (value >= 0) {
            return (value / 1000).toFixed(2);
        } else {
            return '-' + (Math.abs(value) / 1000).toFixed(2);
        }
    }

    /**
     * Update P/L Statistics
     * Updates the P/L stats tab - shows: Instrument | Urlz P&L / Mkt Val | Last Price
     */
    function updatePLStats() {
        try {
            const tbody = document.getElementById('plStatsTableBody');
            if (!tbody) {
                return;
            }

            // Mock data based on screenshots - Unrealized P&L tab format
            const plData = [
                { ticker: 'QQQ', fullName: 'INVESCO QQQ TRUST', unrealizedPL: 7480, mktVal: 30300, lastPrice: 605.34, priceChangePercent: 2.59 },
                { ticker: 'ANX', fullName: 'AM NASDAQ-100 SP ET...', unrealizedPL: 5710, mktVal: 46900, lastPrice: 246.25, priceChangePercent: 2.86 },
                { ticker: 'GRNY', fullName: 'FUNDSTR GRAN SH US...', unrealizedPL: 3980, mktVal: 19400, lastPrice: 24.22, priceChangePercent: 2.58 },
                { ticker: 'ORCL', fullName: 'ORACLE CORP', unrealizedPL: -484, mktVal: 4010, lastPrice: 200.35, priceChangePercent: 0.80 },
                { ticker: 'TETH', fullName: '21SHARES ETHEREUM...', unrealizedPL: -913, mktVal: 17800, lastPrice: 14.85, priceChangePercent: 8.55 },
                { ticker: 'QUBT', fullName: 'QUANTUM COMPUTIN...', unrealizedPL: -1380, mktVal: 5730, lastPrice: 11.49, priceChangePercent: 12.60 }
            ];

            tbody.textContent = '';
            
            plData.forEach(item => {
                const row = document.createElement('tr');
                
                // Instrument (Ticker + Full Name)
                const instrumentCell = document.createElement('td');
                instrumentCell.textContent = '';
                const tickerDiv = document.createElement('div');
                const strong = document.createElement('strong');
                strong.textContent = item.ticker;
                tickerDiv.appendChild(strong);
                instrumentCell.appendChild(tickerDiv);
                const nameDiv = document.createElement('div');
                nameDiv.className = 'text-muted small';
                nameDiv.textContent = item.fullName;
                instrumentCell.appendChild(nameDiv);
                row.appendChild(instrumentCell);
                
                // Unrealized P&L / Market Value
                const plMktValCell = document.createElement('td');
                const plColor = item.unrealizedPL >= 0 ? 'text-success' : 'text-danger';
                const plValue = formatValue(item.unrealizedPL);
                const mktValValue = formatValue(item.mktVal);
                
                plMktValCell.textContent = '';
                const plDiv = document.createElement('div');
                plDiv.className = plColor;
                const plStrong = document.createElement('strong');
                plStrong.textContent = `${plValue}K`;
                plDiv.appendChild(plStrong);
                plMktValCell.appendChild(plDiv);
                const mktValDiv = document.createElement('div');
                mktValDiv.className = 'small text-muted';
                mktValDiv.textContent = `${mktValValue}K`;
                plMktValCell.appendChild(mktValDiv);
                row.appendChild(plMktValCell);
                
                // Last Price (with percentage change)
                const lastPriceCell = document.createElement('td');
                const priceColor = item.priceChangePercent >= 0 ? 'text-success' : 'text-danger';
                const priceSign = item.priceChangePercent >= 0 ? '+' : '';
                lastPriceCell.textContent = '';
                const priceDiv = document.createElement('div');
                priceDiv.className = priceColor;
                const strong = document.createElement('strong');
                strong.textContent = item.lastPrice.toFixed(2);
                priceDiv.appendChild(strong);
                lastPriceCell.appendChild(priceDiv);
                const percentDiv = document.createElement('div');
                percentDiv.className = `small ${priceColor}`;
                percentDiv.textContent = `${priceSign}${item.priceChangePercent.toFixed(2)}%`;
                lastPriceCell.appendChild(percentDiv);
                row.appendChild(lastPriceCell);
                
                tbody.appendChild(row);
            });

            if (window.Logger) {
                window.Logger.info('✅ P/L stats updated', { page: 'history-widget' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error updating P/L stats', { 
                    page: 'history-widget', 
                    error 
                });
            }
        }
    }

    /**
     * Update Market Value Statistics
     * Updates the market value stats tab - shows: Instrument | Mkt Val / Position | Last Price
     */
    function updateMarketValueStats() {
        try {
            const tbody = document.getElementById('marketValueStatsTableBody');
            if (!tbody) {
                return;
            }

            // Mock data based on screenshots - MKT VALUE tab format
            const marketValueData = [
                { ticker: 'ANX', fullName: 'AM NASDAQ-100 SP ET...', mktVal: 46900, position: 190, lastPrice: 246.25, priceChangePercent: 2.86 },
                { ticker: 'SPPY', fullName: 'SPDR S&P 500 LDRS U...', mktVal: 33500, position: 800, lastPrice: 41.910, priceChangePercent: 1.66 },
                { ticker: 'SP5C', fullName: 'AM CORE S&P 500 SW...', mktVal: 31500, position: 75, lastPrice: 419.80, priceChangePercent: 0.24 },
                { ticker: 'QQQ', fullName: 'INVESCO QQQ TRUST...', mktVal: 30300, position: 50, lastPrice: 605.34, priceChangePercent: 2.59 },
                { ticker: 'SPYL', fullName: 'SPDR S&P 500 UCITS E...', mktVal: 28600, position: 2000, lastPrice: 14.3090, priceChangePercent: 1.83 },
                { ticker: 'IBIT', fullName: 'ISHARES BITCOIN TRU...', mktVal: 25300, position: 500, lastPrice: 50.62, priceChangePercent: 5.52 }
            ];

            tbody.textContent = '';
            
            marketValueData.forEach(item => {
                const row = document.createElement('tr');
                
                // Instrument (Ticker + Full Name)
                const instrumentCell = document.createElement('td');
                instrumentCell.textContent = '';
                const tickerDiv = document.createElement('div');
                const strong = document.createElement('strong');
                strong.textContent = item.ticker;
                tickerDiv.appendChild(strong);
                instrumentCell.appendChild(tickerDiv);
                const nameDiv = document.createElement('div');
                nameDiv.className = 'text-muted small';
                nameDiv.textContent = item.fullName;
                instrumentCell.appendChild(nameDiv);
                row.appendChild(instrumentCell);
                
                // Market Value / Position
                const mktValPositionCell = document.createElement('td');
                const mktValValue = formatValue(item.mktVal);
                const positionValue = item.position >= 1000 ? `${(item.position / 1000).toFixed(2)}K` : item.position.toString();
                
                mktValPositionCell.textContent = '';
                const mktValDiv = document.createElement('div');
                const mktValStrong = document.createElement('strong');
                mktValStrong.textContent = `${mktValValue}K`;
                mktValDiv.appendChild(mktValStrong);
                mktValPositionCell.appendChild(mktValDiv);
                const positionDiv = document.createElement('div');
                positionDiv.className = 'small text-muted';
                positionDiv.textContent = positionValue;
                mktValPositionCell.appendChild(positionDiv);
                row.appendChild(mktValPositionCell);
                
                // Last Price (with percentage change)
                const lastPriceCell = document.createElement('td');
                const priceColor = item.priceChangePercent >= 0 ? 'text-success' : 'text-danger';
                const priceSign = item.priceChangePercent >= 0 ? '+' : '';
                lastPriceCell.textContent = '';
                const priceDiv = document.createElement('div');
                priceDiv.className = priceColor;
                const strong = document.createElement('strong');
                strong.textContent = item.lastPrice.toFixed(2);
                priceDiv.appendChild(strong);
                lastPriceCell.appendChild(priceDiv);
                const percentDiv = document.createElement('div');
                percentDiv.className = `small ${priceColor}`;
                percentDiv.textContent = `${priceSign}${item.priceChangePercent.toFixed(2)}%`;
                lastPriceCell.appendChild(percentDiv);
                row.appendChild(lastPriceCell);
                
                tbody.appendChild(row);
            });

            if (window.Logger) {
                window.Logger.info('✅ Market value stats updated', { page: 'history-widget' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error updating market value stats', { 
                    page: 'history-widget', 
                    error 
                });
            }
        }
    }

    /**
     * Initialize Tabs
     * Sets up Bootstrap tabs functionality with fallback
     */
    function initTabs() {
        try {
            const tabButtons = document.querySelectorAll('#statsTabs button[data-bs-target]');
            const tabPanes = document.querySelectorAll('#statsTabContent .tab-pane');
            
            if (tabButtons.length === 0 || tabPanes.length === 0) {
                if (window.Logger) {
                    window.Logger.warn('Tabs elements not found', { page: 'history-widget' });
                }
                return;
            }
            
            // Simple tab switching (works with or without Bootstrap)
            tabButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Remove active class from all buttons and panes
                    tabButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.setAttribute('aria-selected', 'false');
                    });
                    tabPanes.forEach(pane => {
                        pane.classList.remove('show', 'active');
                    });
                    
                    // Add active class to clicked button and corresponding pane
                    button.classList.add('active');
                    button.setAttribute('aria-selected', 'true');
                    
                    const targetId = button.getAttribute('data-bs-target');
                    const targetPane = document.querySelector(targetId);
                    if (targetPane) {
                        targetPane.classList.add('show', 'active');
                    }
                    
                    // Load data for the selected tab if needed
                    if (targetId === '#daily-stats') {
                        updateDailyStats();
                    } else if (targetId === '#pl-stats') {
                        updatePLStats();
                    } else if (targetId === '#market-value-stats') {
                        updateMarketValueStats();
                    }
                });
            });

            if (window.Logger) {
                window.Logger.info('✅ Tabs initialized', { page: 'history-widget' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing tabs', { 
                    page: 'history-widget', 
                    error 
                });
            }
        }
    }

    /**
     * Create Quick Links Actions Menu with icons and text
     * Uses centralized Actions Menu Toolkit (window.createActionsMenu)
     * 
     * @param {Array} buttons - Array of button objects with icon, text, title, onclick
     * @returns {Promise<string>} HTML string for actions menu
     */
    async function createQuickLinksActionsMenu(buttons) {
        if (!buttons || buttons.length === 0) {
            return '';
        }
        
        // Use centralized Actions Menu Toolkit
        if (typeof window.createActionsMenu === 'function') {
            // Convert buttons to format expected by createActionsMenu
            const formattedButtons = await Promise.all(buttons.map(async (button) => {
                const iconPath = button.icon || '../../images/icons/tabler/eye.svg';
                const text = button.text || '';
                const title = button.title || 'קישור מהיר';
                const onclick = button.onclick || '';
                
                // Get icon HTML (async for IconSystem)
                let iconHtml = `<img src="${iconPath}" width="16" height="16" alt="${text}" class="icon me-1">`;
                if (typeof window.IconSystem !== 'undefined' && window.IconSystem.initialized) {
                    try {
                        const iconName = iconPath.split('/').pop().replace('.svg', '');
                        iconHtml = await window.IconSystem.renderIcon('button', iconName, { size: '16', alt: text, class: 'icon me-1' });
                    } catch (error) {
                        // Fallback already set
                    }
                }
                
                // Store icon and text for later use
                return {
                    type: 'LINK',
                    onclick: onclick,
                    title: title,
                    _iconHtml: iconHtml, // Store custom icon HTML
                    _text: text // Store text
                };
            }));
            
            // Use createActionsMenu to create the menu structure
            const menuHtml = window.createActionsMenu(formattedButtons);
            
            if (menuHtml) {
                // Parse and modify the HTML to add text to buttons
                const parser = new DOMParser();
                const doc = parser.parseFromString(menuHtml, 'text/html');
                const tempDiv = doc.body;
                
                const menuButtons = tempDiv.querySelectorAll('.actions-menu-item');
                formattedButtons.forEach((button, index) => {
                    if (menuButtons[index] && button._iconHtml && button._text) {
                        // Replace icon with icon + text
                        menuButtons[index].textContent = '';
                        const parser2 = new DOMParser();
                        const iconDoc = parser2.parseFromString(`${button._iconHtml} ${button._text}`, 'text/html');
                        iconDoc.body.childNodes.forEach(node => {
                            menuButtons[index].appendChild(node.cloneNode(true));
                        });
                    }
                });
                
                // Add ID to wrapper for positioning
                const wrapper = tempDiv.querySelector('.actions-menu-wrapper');
                if (wrapper) {
                    wrapper.id = 'quickLinksActionsMenuWrapper';
                    const popup = wrapper.querySelector('.actions-menu-popup');
                    if (popup) {
                        popup.id = 'quickLinksActionsMenuPopup';
                    }
                    // Update tooltip for trigger button
                    const trigger = wrapper.querySelector('.actions-trigger');
                    if (trigger) {
                        trigger.setAttribute('data-tooltip', 'קישורים מהירים');
                    }
                }
                
                return tempDiv.innerHTML;
            }
        }
        
        // Fallback if createActionsMenu is not available
        window.Logger?.warn('⚠️ [createQuickLinksActionsMenu] window.createActionsMenu not available, using fallback');
        return '';
    }
    
    /**
     * Setup Quick Links Positioning
     * Checks available space and positions menu accordingly
     */
    function setupQuickLinksPositioning() {
        const wrapper = document.getElementById('quickLinksActionsMenuWrapper');
        if (!wrapper) return;
        
        const popup = wrapper.querySelector('.actions-menu-popup');
        const trigger = wrapper.querySelector('.actions-trigger');
        if (!popup || !trigger) return;
        
        // Use hover event to position dynamically
        wrapper.addEventListener('mouseenter', () => {
            const triggerRect = trigger.getBoundingClientRect();
            const isRTL = document.documentElement.dir === 'rtl';
            const popupWidth = 200; // Estimated width
            const viewportWidth = window.innerWidth;
            
            // Check if there's enough space on the right (in RTL, right = start)
            const spaceOnRight = isRTL ? triggerRect.left : (viewportWidth - triggerRect.right);
            const spaceOnLeft = isRTL ? (viewportWidth - triggerRect.left) : triggerRect.left;
            
            // Position popup
            if (spaceOnRight >= popupWidth) {
                // Enough space on right - open to right
                if (isRTL) {
                    popup.style.left = `${triggerRect.left - popupWidth}px`;
                    popup.style.right = 'auto';
                } else {
                    popup.style.left = `${triggerRect.right + 2}px`;
                    popup.style.right = 'auto';
                }
            } else if (spaceOnLeft >= popupWidth) {
                // Not enough space on right, but enough on left - open to left
                if (isRTL) {
                    popup.style.right = `${viewportWidth - triggerRect.right}px`;
                    popup.style.left = 'auto';
                } else {
                    popup.style.right = `${viewportWidth - triggerRect.left}px`;
                    popup.style.left = 'auto';
                }
            } else {
                // Default to right
                if (isRTL) {
                    popup.style.left = `${triggerRect.left - popupWidth}px`;
                    popup.style.right = 'auto';
                } else {
                    popup.style.left = `${triggerRect.right + 2}px`;
                    popup.style.right = 'auto';
                }
            }
            
            popup.style.top = `${triggerRect.top - 5}px`;
        });
    }

    /**
     * Setup Quick Links
     * Creates actions menu for quick links (like table action menus)
     */
    async function setupQuickLinks() {
        try {
            const container = document.getElementById('quickLinksActionsMenuContainer');
            if (!container) {
                if (window.Logger) {
                    window.Logger.warn('Quick links container not found', { page: 'history-widget' });
                }
                return;
            }

            // Create action menu buttons with proper icons and texts
            const quickLinksButtons = [
                { 
                    type: 'VIEW', 
                    onclick: `window.location.href='portfolio-state-page.html'`, 
                    title: 'מצב תיק אתמול',
                    text: 'מצב תיק',
                    icon: '../../images/icons/tabler/chart-line.svg'
                },
                { 
                    type: 'VIEW', 
                    onclick: `window.location.href='trade-history-page.html'`, 
                    title: 'טריידים פעילים',
                    text: 'טריידים',
                    icon: '../../images/icons/tabler/trending-up.svg'
                },
                { 
                    type: 'VIEW', 
                    onclick: `window.location.href='price-history-page.html'`, 
                    title: 'שינויי מחיר היום',
                    text: 'שינויי מחיר',
                    icon: '../../images/icons/tabler/trending-up.svg'
                },
                { 
                    type: 'VIEW', 
                    onclick: `window.location.href='comparative-analysis-page.html'`, 
                    title: 'ניתוח השוואתי',
                    text: 'ניתוח',
                    icon: '../../images/icons/tabler/chart-bar.svg'
                }
            ];
            
            // Custom create actions menu with icons and text
            const actionsMenuHTML = await createQuickLinksActionsMenu(quickLinksButtons);
            container.textContent = '';
            const parser = new DOMParser();
            const doc = parser.parseFromString(actionsMenuHTML, 'text/html');
            doc.body.childNodes.forEach(node => {
                container.appendChild(node.cloneNode(true));
            });
            
            // Setup positioning that checks available space
            setupQuickLinksPositioning();

            // Close chart date range menu when clicking outside
            document.addEventListener('click', (e) => {
                const menu = document.getElementById('chartDateRangeMenu');
                const toggle = document.getElementById('chartDateRangeToggle');
                if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
                    menu.classList.remove('show');
                }
            });

            if (window.Logger) {
                window.Logger.info('✅ Quick links actions menu setup completed', { page: 'history-widget' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error setting up quick links', { 
                    page: 'history-widget', 
                    error 
                });
            }
        }
    }

    /**
     * Refresh Widget
     * Refreshes all widget data and displays
     */
    async function refreshWidget() {
        try {
            // Show loading state
            const widgetContainer = document.getElementById('history-widget-container') || document.querySelector('.history-widget-container');
            if (widgetContainer && typeof window.showLoadingState === 'function') {
                window.showLoadingState(widgetContainer.id || 'history-widget-container');
            }
            
            if (window.NotificationSystem) {
                window.NotificationSystem.showInfo('מרענן נתונים...', 'רענון ווידג\'ט היסטוריה');
            }

            // Refresh chart
            await initWeeklyPLChart();

            // Refresh all stats
            updateDailyStats();
            updatePLStats();
            updateMarketValueStats();
            
            // Hide loading state
            if (widgetContainer && typeof window.hideLoadingState === 'function') {
                window.hideLoadingState(widgetContainer.id || 'history-widget-container');
            }

            // Show success notification
            if (window.NotificationSystem) {
                window.NotificationSystem.showSuccess('נתונים עודכנו', 'ווידג\'ט היסטוריה');
            }

            if (window.Logger) {
                window.Logger.info('✅ Widget refreshed', { page: 'history-widget' });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error refreshing widget', { 
                    page: 'history-widget', 
                    error 
                });
            }
            if (window.NotificationSystem) {
                window.NotificationSystem.showError('שגיאה ברענון', 'לא ניתן לרענן את הנתונים');
            }
        }
    }

    /**
     * Initialize all widgets
     */
    async function initializeWidgets() {
        // Show loading state
        const widgetContainer = document.getElementById('history-widget-container') || document.querySelector('.history-widget-container');
        if (widgetContainer && typeof window.showLoadingState === 'function') {
            window.showLoadingState(widgetContainer.id || 'history-widget-container');
        }
        
        try {
            // Wait for required systems to be available
            let retries = 0;
            const maxRetries = 10;

            const waitForSystem = (checkFn, systemName) => {
                return new Promise((resolve) => {
                    const check = () => {
                        if (checkFn() || retries >= maxRetries) {
                            resolve();
                        } else {
                            retries++;
                            setTimeout(check, 200);
                        }
                    };
                    check();
                });
            };

            // Wait for TradingViewChartAdapter
            await waitForSystem(
                () => typeof window.TradingViewChartAdapter !== 'undefined',
                'TradingViewChartAdapter'
            );

            // Wait for FieldRendererService
            await waitForSystem(
                () => typeof window.FieldRendererService !== 'undefined',
                'FieldRendererService'
            );

            // Initialize chart
            await initWeeklyPLChart();

            // Initialize tabs
            initTabs();

            // Update all stats
            updateDailyStats();
            updatePLStats();
            updateMarketValueStats();

            // Setup links
            setupQuickLinks();
            
            // Hide loading state
            if (widgetContainer && typeof window.hideLoadingState === 'function') {
                window.hideLoadingState(widgetContainer.id || 'history-widget-container');
            }

            if (window.Logger) {
                window.Logger.info('✅ All widgets initialized', { page: 'history-widget' });
            }
        } catch (error) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה באתחול ווידג\'ט', 
                    `לא ניתן לאתחל את הווידג'ט. ${errorMsg}`);
            } else if (window.Logger) {
                window.Logger.error('Error initializing widgets', { 
                    page: 'history-widget', 
                    error 
                });
            }
        }
    }

    /**
     * Initialize page
     */
    async function initializePage() {
        // Initialize Header System first
        await initializeHeader();
        
        // Wait for Preferences to be loaded
        if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
            window.PreferencesCore.initializeWithLazyLoading().catch((error) => {
                if (window.Logger) {
                    window.Logger.warn('Preferences initialization failed (non-critical)', { 
                        page: 'history-widget', 
                        error 
                    });
                }
            });
        }

        // Initialize widgets after a short delay to ensure all systems are loaded
        setTimeout(() => {
            initializeWidgets();
        }, 500);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        // DOM already loaded
        initializePage();
    }

    // Export functions to window for debugging and external access
    window.historyWidget = {
        getCSSVariableValue,
        initializeHeader,
        initWeeklyPLChart,
        updateDailyStats,
        updatePLStats,
        updateMarketValueStats,
        setupQuickLinks,
        refreshWidget,
        initializeWidgets,
        toggleChartDateRangeMenu,
        selectChartDateRange,
        updateChartLabels
    };

})();
