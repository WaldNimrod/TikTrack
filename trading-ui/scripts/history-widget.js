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
                totalValueElement.innerHTML = window.FieldRendererService.renderNumericValue(
                    totalValue,
                    '$',
                    false
                );
                // Update color based on value
                totalValueElement.className = 'chart-label-value ' + (totalValue >= 0 ? 'text-success' : 'text-danger');
            } else if (totalValueElement) {
                totalValueElement.textContent = `$${totalValue.toLocaleString()}`;
                totalValueElement.className = 'chart-label-value ' + (totalValue >= 0 ? 'text-success' : 'text-danger');
            }

            // Update change percent label - use finalChangePercent that has consistent sign
            const changePercentElement = document.getElementById('chartChangePercent');
            if (changePercentElement && typeof window.FieldRendererService !== 'undefined') {
                changePercentElement.innerHTML = window.FieldRendererService.renderNumericValue(
                    finalChangePercent,
                    '%',
                    true
                );
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
            if (window.Logger) {
                window.Logger.error('Error initializing P/L chart', { 
                    page: 'history-widget', 
                    error 
                });
            }
            // Show error message in container
            const container = document.getElementById('weeklyPLChartContainer');
            if (container) {
                container.innerHTML = '<div class="text-muted text-center p-3">שגיאה בטעינת הגרף</div>';
            }
        }
    }

    /**
     * Update Daily Statistics
     * Updates the daily stats tab with mock data (showing both amounts and percentages)
     */
    function updateDailyStats() {
        try {
            // Mock data
            const stats = {
                dailyPL: 500,
                dailyPLPercent: 2.1,
                portfolioChange: 2.5,
                portfolioChangeAmount: 1250,
                activeTrades: 5
            };

            // Update P/L Today - show both amount and percentage
            const dailyPLElement = document.getElementById('dailyPLValue');
            if (dailyPLElement && typeof window.FieldRendererService !== 'undefined') {
                const amountHtml = window.FieldRendererService.renderNumericValue(
                    stats.dailyPL, 
                    '$', 
                    true
                );
                const percentHtml = window.FieldRendererService.renderNumericValue(
                    stats.dailyPLPercent, 
                    '%', 
                    true
                );
                dailyPLElement.innerHTML = `${amountHtml} <small class="text-muted">(${percentHtml})</small>`;
            } else if (dailyPLElement) {
                // Fallback
                dailyPLElement.innerHTML = `+$${stats.dailyPL} <small class="text-muted">(+${stats.dailyPLPercent}%)</small>`;
                dailyPLElement.className = 'stat-value text-success';
            }

            // Update Portfolio Change - show both percentage and amount
            const portfolioChangeElement = document.getElementById('portfolioChangeValue');
            if (portfolioChangeElement && typeof window.FieldRendererService !== 'undefined') {
                const percentHtml = window.FieldRendererService.renderNumericValue(
                    stats.portfolioChange, 
                    '%', 
                    true
                );
                const amountHtml = window.FieldRendererService.renderNumericValue(
                    stats.portfolioChangeAmount, 
                    '$', 
                    true
                );
                portfolioChangeElement.innerHTML = `${percentHtml} <small class="text-muted">(${amountHtml})</small>`;
            } else if (portfolioChangeElement) {
                // Fallback
                portfolioChangeElement.innerHTML = `+${stats.portfolioChange}% <small class="text-muted">(+$${stats.portfolioChangeAmount})</small>`;
                portfolioChangeElement.className = 'stat-value text-success';
            }

            // Update Active Trades
            const activeTradesElement = document.getElementById('activeTradesValue');
            if (activeTradesElement) {
                activeTradesElement.textContent = stats.activeTrades;
                activeTradesElement.className = 'stat-value';
            }

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
     * Update P/L Statistics
     * Updates the P/L stats tab with top 5 positions (highest and lowest P/L)
     */
    function updatePLStats() {
        try {
            const tbody = document.getElementById('plStatsTableBody');
            if (!tbody) {
                return;
            }

            // Mock data - top 5 positions with highest and lowest P/L
            const plData = [
                { ticker: 'AAPL', pl: 2500, plPercent: 5.2, dailyChange: 120 },
                { ticker: 'TSLA', pl: 1800, plPercent: 3.8, dailyChange: -50 },
                { ticker: 'MSFT', pl: -800, plPercent: -1.5, dailyChange: -30 },
                { ticker: 'GOOGL', pl: 1200, plPercent: 2.4, dailyChange: 80 },
                { ticker: 'NVDA', pl: -600, plPercent: -1.2, dailyChange: -20 }
            ];

            // Sort by P/L (highest first, then lowest)
            plData.sort((a, b) => Math.abs(b.pl) - Math.abs(a.pl));

            tbody.innerHTML = '';
            
            plData.forEach(item => {
                const row = document.createElement('tr');
                
                // Ticker
                const tickerCell = document.createElement('td');
                tickerCell.textContent = item.ticker;
                row.appendChild(tickerCell);
                
                // P/L
                const plCell = document.createElement('td');
                if (typeof window.FieldRendererService !== 'undefined') {
                    plCell.innerHTML = window.FieldRendererService.renderNumericValue(
                        item.pl, 
                        '$', 
                        true
                    );
                } else {
                    plCell.textContent = item.pl > 0 ? `+$${item.pl}` : `-$${Math.abs(item.pl)}`;
                    plCell.className = item.pl > 0 ? 'text-success' : 'text-danger';
                }
                row.appendChild(plCell);
                
                // Percentage
                const percentCell = document.createElement('td');
                if (typeof window.FieldRendererService !== 'undefined') {
                    percentCell.innerHTML = window.FieldRendererService.renderNumericValue(
                        item.plPercent, 
                        '%', 
                        true
                    );
                } else {
                    percentCell.textContent = item.plPercent > 0 ? `+${item.plPercent}%` : `${item.plPercent}%`;
                    percentCell.className = item.plPercent > 0 ? 'text-success' : 'text-danger';
                }
                row.appendChild(percentCell);
                
                // Daily Change - show both amount and percentage
                const dailyChangeCell = document.createElement('td');
                const dailyChangePercent = item.pl !== 0 ? ((item.dailyChange / Math.abs(item.pl)) * 100) : 0;
                if (typeof window.FieldRendererService !== 'undefined') {
                    const amountHtml = window.FieldRendererService.renderNumericValue(
                        item.dailyChange, 
                        '$', 
                        true
                    );
                    const percentHtml = window.FieldRendererService.renderNumericValue(
                        dailyChangePercent, 
                        '%', 
                        true
                    );
                    dailyChangeCell.innerHTML = `${amountHtml} <small class="text-muted">(${percentHtml})</small>`;
                } else {
                    const amountText = item.dailyChange > 0 ? `+$${item.dailyChange}` : `-$${Math.abs(item.dailyChange)}`;
                    const percentText = dailyChangePercent > 0 ? `+${dailyChangePercent.toFixed(2)}%` : `${dailyChangePercent.toFixed(2)}%`;
                    dailyChangeCell.innerHTML = `${amountText} <small class="text-muted">(${percentText})</small>`;
                    dailyChangeCell.className = item.dailyChange > 0 ? 'text-success' : 'text-danger';
                }
                row.appendChild(dailyChangeCell);
                
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
     * Updates the market value stats tab with top 10 positions by market value
     */
    function updateMarketValueStats() {
        try {
            const tbody = document.getElementById('marketValueStatsTableBody');
            if (!tbody) {
                return;
            }

            // Mock data - top 10 positions by market value
            const marketValueData = [
                { ticker: 'AAPL', value: 50000, percentOfAssets: 25.5, dailyChange: 1250 },
                { ticker: 'MSFT', value: 45000, percentOfAssets: 23.0, dailyChange: 900 },
                { ticker: 'GOOGL', value: 35000, percentOfAssets: 17.9, dailyChange: 700 },
                { ticker: 'TSLA', value: 28000, percentOfAssets: 14.3, dailyChange: -500 },
                { ticker: 'NVDA', value: 20000, percentOfAssets: 10.2, dailyChange: 400 },
                { ticker: 'AMZN', value: 12000, percentOfAssets: 6.1, dailyChange: 300 },
                { ticker: 'META', value: 8000, percentOfAssets: 4.1, dailyChange: 200 },
                { ticker: 'NFLX', value: 5000, percentOfAssets: 2.6, dailyChange: 100 },
                { ticker: 'AMD', value: 3000, percentOfAssets: 1.5, dailyChange: 50 },
                { ticker: 'INTC', value: 2000, percentOfAssets: 1.0, dailyChange: -30 }
            ];

            tbody.innerHTML = '';
            
            marketValueData.forEach(item => {
                const row = document.createElement('tr');
                
                // Ticker
                const tickerCell = document.createElement('td');
                tickerCell.textContent = item.ticker;
                row.appendChild(tickerCell);
                
                // Market Value
                const valueCell = document.createElement('td');
                if (typeof window.FieldRendererService !== 'undefined') {
                    valueCell.innerHTML = window.FieldRendererService.renderNumericValue(
                        item.value, 
                        '$', 
                        false
                    );
                } else {
                    valueCell.textContent = `$${item.value.toLocaleString()}`;
                }
                row.appendChild(valueCell);
                
                // Percentage of Assets
                const percentCell = document.createElement('td');
                if (typeof window.FieldRendererService !== 'undefined') {
                    percentCell.innerHTML = window.FieldRendererService.renderNumericValue(
                        item.percentOfAssets, 
                        '%', 
                        false
                    );
                } else {
                    percentCell.textContent = `${item.percentOfAssets}%`;
                }
                row.appendChild(percentCell);
                
                // Daily Change - show both amount and percentage
                const dailyChangeCell = document.createElement('td');
                const dailyChangePercent = item.value !== 0 ? ((item.dailyChange / item.value) * 100) : 0;
                if (typeof window.FieldRendererService !== 'undefined') {
                    const amountHtml = window.FieldRendererService.renderNumericValue(
                        item.dailyChange, 
                        '$', 
                        true
                    );
                    const percentHtml = window.FieldRendererService.renderNumericValue(
                        dailyChangePercent, 
                        '%', 
                        true
                    );
                    dailyChangeCell.innerHTML = `${amountHtml} <small class="text-muted">(${percentHtml})</small>`;
                } else {
                    const amountText = item.dailyChange > 0 ? `+$${item.dailyChange}` : `-$${Math.abs(item.dailyChange)}`;
                    const percentText = dailyChangePercent > 0 ? `+${dailyChangePercent.toFixed(2)}%` : `${dailyChangePercent.toFixed(2)}%`;
                    dailyChangeCell.innerHTML = `${amountText} <small class="text-muted">(${percentText})</small>`;
                    dailyChangeCell.className = item.dailyChange > 0 ? 'text-success' : 'text-danger';
                }
                row.appendChild(dailyChangeCell);
                
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
                    if (targetId === '#pl-stats') {
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
     */
    function createQuickLinksActionsMenu(buttons) {
        if (!buttons || buttons.length === 0) {
            return '';
        }
        
        const menuButtons = buttons.map((button) => {
            const icon = button.icon || '/trading-ui/images/icons/tabler/eye.svg';
            const text = button.text || '';
            const title = button.title || '';
            const onclick = button.onclick || '';
            
            return `<button class="btn actions-menu-item" data-variant="small" data-button-type="LINK" data-onclick='${onclick}' title="${title}" style="margin-right: 4px;">
                <img src="${icon}" width="16" height="16" alt="${text}" class="icon me-1"> ${text}
            </button>`;
        }).join('');
        
        // Get menu trigger icon
        const menuIcon = '<img src="/trading-ui/images/icons/tabler/menu-2.svg" width="16" height="16" alt="קישורים מהירים" class="icon">';
        
        return `
            <div class="actions-menu-wrapper" id="quickLinksActionsMenuWrapper">
                <button class="btn actions-trigger" data-tooltip="קישורים מהירים" data-tooltip-placement="top" data-tooltip-trigger="hover">${menuIcon}</button>
                <div class="actions-menu-popup" id="quickLinksActionsMenuPopup">
                    ${menuButtons}
                </div>
            </div>
        `;
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
    function setupQuickLinks() {
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
                    icon: '/trading-ui/images/icons/tabler/chart-line.svg'
                },
                { 
                    type: 'VIEW', 
                    onclick: `window.location.href='trade-history-page.html'`, 
                    title: 'טריידים פעילים',
                    text: 'טריידים',
                    icon: '/trading-ui/images/icons/tabler/trending-up.svg'
                },
                { 
                    type: 'VIEW', 
                    onclick: `window.location.href='price-history-page.html'`, 
                    title: 'שינויי מחיר היום',
                    text: 'שינויי מחיר',
                    icon: '/trading-ui/images/icons/tabler/trending-up.svg'
                },
                { 
                    type: 'VIEW', 
                    onclick: `window.location.href='comparative-analysis-page.html'`, 
                    title: 'ניתוח השוואתי',
                    text: 'ניתוח',
                    icon: '/trading-ui/images/icons/tabler/chart-bar.svg'
                }
            ];
            
            // Custom create actions menu with icons and text
            const actionsMenuHTML = createQuickLinksActionsMenu(quickLinksButtons);
            container.innerHTML = actionsMenuHTML;
            
            // Setup positioning that checks available space
            setupQuickLinksPositioning();
            
            if (window.Logger) {
                window.Logger.info('✅ Quick links actions menu setup completed', { page: 'history-widget' });
            }


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
            if (window.NotificationSystem) {
                window.NotificationSystem.showInfo('מרענן נתונים...', 'רענון ווידג\'ט היסטוריה');
            }

            // Refresh chart
            await initWeeklyPLChart();

            // Refresh all stats
            updateDailyStats();
            updatePLStats();
            updateMarketValueStats();

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

            // Wait for createActionsMenu
            await waitForSystem(
                () => typeof window.createActionsMenu !== 'undefined',
                'createActionsMenu'
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

            if (window.Logger) {
                window.Logger.info('✅ All widgets initialized', { page: 'history-widget' });
            }
        } catch (error) {
            if (window.Logger) {
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
