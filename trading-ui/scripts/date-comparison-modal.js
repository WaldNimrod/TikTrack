/**
 * Date Comparison Modal - Modal for comparing dates
 * 
 * This file handles the date comparison modal functionality for the mockup.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 * 
 * Related Documentation:
 * - documentation/frontend/DATE_COMPARISON_MODAL_DEVELOPER_GUIDE.md
 */

(function() {
    'use strict';

    // ===== GLOBAL STATE =====
    let selectedDate1 = null;
    let selectedDate2 = null;
    let comparisonData = null;
    let barChart = null;
    let lineChart = null;
    let barChartSeries = {};
    let lineChartSeries = {};

    // Cache keys
    const CACHE_KEY_SELECTED_DATES = 'date-comparison-selected-dates';
    const PREF_KEY_LAST_DATES = 'date-comparison-last-dates';

    // ===== HELPER FUNCTIONS =====

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
     * Format date for display
     * @param {string} dateStr - Date string (YYYY-MM-DD)
     * @returns {string} Formatted date
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    // ===== DATE SELECTION FUNCTIONS =====

    /**
     * Handle date 1 change
     */
    function handleDate1Change() {
        const date1Input = document.getElementById('date1');
        if (!date1Input) return;

        const date1 = date1Input.value;
        selectedDate1 = date1;

        // Update header if date2 is also set
        if (date1 && selectedDate2) {
            updateTableHeaders();
        }

        // Validate dates
        validateDates();
    }

    /**
     * Handle date 2 change
     */
    function handleDate2Change() {
        const date2Input = document.getElementById('date2');
        if (!date2Input) return;

        const date2 = date2Input.value;
        selectedDate2 = date2;

        // Update header if date1 is also set
        if (date2 && selectedDate1) {
            updateTableHeaders();
        }

        // Validate dates
        validateDates();
    }

    /**
     * Validate dates
     * @returns {boolean} True if valid
     */
    function validateDates() {
        const date1Input = document.getElementById('date1');
        const date2Input = document.getElementById('date2');
        const validationMessage = document.getElementById('date-validation-message');

        if (!date1Input || !date2Input) return false;

        const date1 = date1Input.value;
        const date2 = date2Input.value;

        if (!date1 || !date2) {
            if (validationMessage) {
                validationMessage.innerHTML = '';
            }
            return false;
        }

        const date1Obj = new Date(date1);
        const date2Obj = new Date(date2);

        if (date1Obj >= date2Obj) {
            if (validationMessage) {
                validationMessage.innerHTML = '<div class="alert alert-danger"><img src="../../images/icons/tabler/alert-triangle.svg" width="16" height="16" alt="alert" class="icon"> תאריך 1 חייב להיות לפני תאריך 2</div>';
            }
            if (window.showNotification) {
                window.showNotification('תאריך 1 חייב להיות לפני תאריך 2', 'error');
            }
            return false;
        }

        if (validationMessage) {
            validationMessage.innerHTML = '';
        }

        return true;
    }

    /**
     * Update table headers with selected dates
     */
    function updateTableHeaders() {
        const date1Header = document.getElementById('date1-header');
        const date2Header = document.getElementById('date2-header');

        if (date1Header && selectedDate1) {
            date1Header.textContent = `תאריך 1 (${formatDate(selectedDate1)})`;
        }
        if (date2Header && selectedDate2) {
            date2Header.textContent = `תאריך 2 (${formatDate(selectedDate2)})`;
        }
    }

    /**
     * Compare dates - main comparison function
     */
    async function compareDates() {
        if (!validateDates()) {
            return;
        }

        const date1Input = document.getElementById('date1');
        const date2Input = document.getElementById('date2');

        if (!date1Input || !date2Input) return;

        selectedDate1 = date1Input.value;
        selectedDate2 = date2Input.value;

        if (!selectedDate1 || !selectedDate2) {
            if (window.showNotification) {
                window.showNotification('אנא בחר שני תאריכים להשוואה', 'warning');
            }
            return;
        }

        try {
            // Show loading notification
            if (window.showNotification) {
                window.showNotification('משווה תאריכים...', 'info');
            }

            // Save selected dates
            await saveSelectedDates();

            // Check cache first
            const cacheKey = `date-comparison-results-${selectedDate1}-${selectedDate2}`;
            let cachedResults = null;

            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                cachedResults = await window.UnifiedCacheManager.get(cacheKey);
            }

            if (cachedResults) {
                comparisonData = cachedResults.comparisonData;
                if (window.Logger) {
                    window.Logger.info('Loaded comparison data from cache', { 
                        page: 'date-comparison-modal',
                        date1: selectedDate1,
                        date2: selectedDate2
                    });
                }
            } else {
                // Generate mock comparison data
                comparisonData = generateComparisonData(selectedDate1, selectedDate2);

                // Save to cache
                if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                    await window.UnifiedCacheManager.save(cacheKey, {
                        date1: selectedDate1,
                        date2: selectedDate2,
                        comparisonData: comparisonData
                    }, { 
                        layer: 'memory', 
                        ttl: 3600000 // 1 hour
                    });
                }
            }

            // Update UI
            updateComparisonTable(comparisonData);
            updateBarChart(comparisonData);
            updateLineChart(comparisonData);
            updateAlerts(comparisonData);
            updateSummary(comparisonData);

            // Update table headers
            updateTableHeaders();

            if (window.showNotification) {
                window.showNotification('השוואה הושלמה בהצלחה', 'success');
            }

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error comparing dates', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
            if (window.showNotification) {
                window.showNotification('שגיאה בביצוע השוואה', 'error');
            }
        }
    }

    /**
     * Save selected dates to preferences and cache
     */
    async function saveSelectedDates() {
        if (!selectedDate1 || !selectedDate2) return;

        try {
            // Save to PreferencesCore
            if (window.PreferencesCore && typeof window.PreferencesCore.savePreference === 'function') {
                await window.PreferencesCore.savePreference(PREF_KEY_LAST_DATES, {
                    date1: selectedDate1,
                    date2: selectedDate2
                });
            }

            // Save to UnifiedCacheManager
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                await window.UnifiedCacheManager.save(CACHE_KEY_SELECTED_DATES, {
                    date1: selectedDate1,
                    date2: selectedDate2
                }, { 
                    layer: 'localStorage', 
                    ttl: 86400000 // 24 hours
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save selected dates', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    /**
     * Load last selected dates from preferences or cache
     */
    async function loadLastSelectedDates() {
        try {
            let lastDates = null;

            // Try PreferencesCore first
            if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
                lastDates = await window.PreferencesCore.getPreference(PREF_KEY_LAST_DATES);
            }

            // Fallback to UnifiedCacheManager
            if (!lastDates && window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                lastDates = await window.UnifiedCacheManager.get(CACHE_KEY_SELECTED_DATES);
            }

            if (lastDates && lastDates.date1 && lastDates.date2) {
                const date1Input = document.getElementById('date1');
                const date2Input = document.getElementById('date2');

                if (date1Input) {
                    date1Input.value = lastDates.date1;
                    selectedDate1 = lastDates.date1;
                }
                if (date2Input) {
                    date2Input.value = lastDates.date2;
                    selectedDate2 = lastDates.date2;
                }

                // Update headers
                updateTableHeaders();

                if (window.Logger) {
                    window.Logger.info('Loaded last selected dates', { 
                        page: 'date-comparison-modal',
                        date1: lastDates.date1,
                        date2: lastDates.date2
                    });
                }
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to load last selected dates', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    // ===== DATA GENERATION =====

    /**
     * Generate mock comparison data for two dates
     * @param {string} date1 - First date (YYYY-MM-DD)
     * @param {string} date2 - Second date (YYYY-MM-DD)
     * @returns {Object} Comparison data
     */
    function generateComparisonData(date1, date2) {
        // Generate base data for date1
        const data1 = generateDateData(date1);
        
        // Generate base data for date2 (with some variation)
        const data2 = generateDateData(date2, data1);

        // Calculate changes
        const changes = {
            balance: data2.balance - data1.balance,
            balancePercent: data1.balance > 0 ? ((data2.balance - data1.balance) / data1.balance) * 100 : 0,
            portfolioValue: data2.portfolioValue - data1.portfolioValue,
            portfolioValuePercent: data1.portfolioValue > 0 ? ((data2.portfolioValue - data1.portfolioValue) / data1.portfolioValue) * 100 : 0,
            realizedPL: data2.realizedPL - data1.realizedPL,
            realizedPLPercent: data1.realizedPL !== 0 ? ((data2.realizedPL - data1.realizedPL) / Math.abs(data1.realizedPL)) * 100 : 0,
            unrealizedPL: data2.unrealizedPL - data1.unrealizedPL,
            unrealizedPLPercent: data1.unrealizedPL !== 0 ? ((data2.unrealizedPL - data1.unrealizedPL) / Math.abs(data1.unrealizedPL)) * 100 : 0,
            totalPL: data2.totalPL - data1.totalPL,
            totalPLPercent: data1.totalPL !== 0 ? ((data2.totalPL - data1.totalPL) / Math.abs(data1.totalPL)) * 100 : 0,
            positions: data2.positions - data1.positions,
            positionsPercent: data1.positions > 0 ? ((data2.positions - data1.positions) / data1.positions) * 100 : 0
        };

        return {
            date1: date1,
            date2: date2,
            data1: data1,
            data2: data2,
            changes: changes
        };
    }

    /**
     * Generate mock data for a specific date
     * @param {string} date - Date string (YYYY-MM-DD)
     * @param {Object} baseData - Base data to vary from (optional)
     * @returns {Object} Date data
     */
    function generateDateData(date, baseData = null) {
        // Use date as seed for consistent data
        const dateObj = new Date(date);
        const seed = dateObj.getTime();
        
        // Simple seeded random
        let seedValue = seed;
        function seededRandom() {
            seedValue = (seedValue * 9301 + 49297) % 233280;
            return seedValue / 233280;
        }

        // If baseData provided, vary from it
        if (baseData) {
            const variation = (seededRandom() - 0.5) * 0.2; // ±10%
            return {
                balance: Math.round(baseData.balance * (1 + variation)),
                portfolioValue: Math.round(baseData.portfolioValue * (1 + variation * 1.2)),
                realizedPL: Math.round(baseData.realizedPL * (1 + variation * 1.5)),
                unrealizedPL: Math.round(baseData.unrealizedPL * (1 + variation)),
                totalPL: Math.round(baseData.totalPL * (1 + variation * 1.3)),
                positions: Math.max(1, Math.round(baseData.positions * (1 + variation * 0.5)))
            };
        }

        // Generate new base data
        const realizedPL = Math.round(5000 + seededRandom() * 10000); // $5K-$15K
        const unrealizedPL = Math.round(10000 + seededRandom() * 10000); // $10K-$20K
        const totalPL = realizedPL + unrealizedPL;
        
        return {
            balance: Math.round(40000 + seededRandom() * 20000), // $40K-$60K
            portfolioValue: Math.round(60000 + seededRandom() * 30000), // $60K-$90K
            realizedPL: realizedPL,
            unrealizedPL: unrealizedPL,
            totalPL: totalPL,
            positions: Math.round(3 + seededRandom() * 5) // 3-8 positions
        };
    }

    // ===== TABLE FUNCTIONS =====

    /**
     * Update comparison table
     * @param {Object} data - Comparison data
     */
    function updateComparisonTable(data) {
        const tbody = document.getElementById('comparison-table-body');
        if (!tbody) return;

        const metrics = [
            { key: 'balance', label: 'יתרות', format: 'currency' },
            { key: 'portfolioValue', label: 'שווי תיק', format: 'currency' },
            { key: 'realizedPL', label: 'P/L ממומש', format: 'currency' },
            { key: 'unrealizedPL', label: 'P/L לא ממומש', format: 'currency' },
            { key: 'totalPL', label: 'P/L כולל', format: 'currency' },
            { key: 'positions', label: 'פוזיציות', format: 'number' }
        ];

        const rows = metrics.map(metric => {
            const value1 = data.data1[metric.key];
            const value2 = data.data2[metric.key];
            const change = data.changes[metric.key];
            const changePercent = data.changes[metric.key + 'Percent'];

            // Format values
            let formattedValue1, formattedValue2, formattedChange;

            if (metric.format === 'currency') {
                formattedValue1 = formatCurrency(value1);
                formattedValue2 = formatCurrency(value2);
                formattedChange = formatPLChange(change, changePercent);
            } else {
                formattedValue1 = value1.toString();
                formattedValue2 = value2.toString();
                formattedChange = formatNumberChange(change, changePercent);
            }

            return `
                <tr>
                    <td><strong>${metric.label}</strong></td>
                    <td>${formattedValue1}</td>
                    <td>${formattedValue2}</td>
                    <td>${formattedChange}</td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;
    }

    /**
     * Format currency value
     * @param {number} value - Currency value
     * @returns {string} Formatted currency
     */
    function formatCurrency(value) {
        if (window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function') {
            return window.FieldRendererService.renderAmount(value, '$', 0, false);
        }
        // Fallback
        return `$${value.toLocaleString('en-US')}`;
    }

    /**
     * Format P/L change with percentage
     * @param {number} change - Change value
     * @param {number} percent - Change percentage
     * @returns {string} Formatted change
     */
    function formatPLChange(change, percent) {
        if (window.FieldRendererService && typeof window.FieldRendererService.renderPLChange === 'function') {
            return window.FieldRendererService.renderPLChange(change, percent, 'date_comparison');
        }
        
        // Fallback
        const sign = change >= 0 ? '+' : '';
        const changeFormatted = `${sign}$${Math.abs(change).toLocaleString('en-US')}`;
        const percentFormatted = percent !== null && percent !== undefined 
            ? ` (${sign}${Math.abs(percent).toFixed(1)}%)` 
            : '';
        const className = change >= 0 ? 'text-success' : 'text-danger';
        return `<span class="${className}">${changeFormatted}${percentFormatted}</span>`;
    }

    /**
     * Format number change with percentage
     * @param {number} change - Change value
     * @param {number} percent - Change percentage
     * @returns {string} Formatted change
     */
    function formatNumberChange(change, percent) {
        const sign = change >= 0 ? '+' : '';
        const changeFormatted = `${sign}${Math.abs(change)}`;
        const percentFormatted = percent !== null && percent !== undefined 
            ? ` (${sign}${Math.abs(percent).toFixed(1)}%)` 
            : '';
        const className = change >= 0 ? 'text-success' : 'text-danger';
        return `<span class="${className}">${changeFormatted}${percentFormatted}</span>`;
    }

    // ===== CHART FUNCTIONS =====

    /**
     * Wait for TradingView adapter to be available
     */
    async function waitForTradingViewAdapter() {
        let retries = 0;
        const maxRetries = 100; // 5 seconds max
        
        while ((typeof window.TradingViewChartAdapter === 'undefined' || 
               (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined')) && 
               retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 50));
            retries++;
        }
        
        if (typeof window.TradingViewChartAdapter === 'undefined') {
            if (window.Logger) {
                window.Logger.error('TradingViewChartAdapter not available', { 
                    page: 'date-comparison-modal', 
                    timeout: maxRetries * 50 
                });
            }
            throw new Error('TradingViewChartAdapter not loaded');
        }
        
        if (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined') {
            if (window.Logger) {
                window.Logger.error('LightweightCharts not available', { 
                    page: 'date-comparison-modal', 
                    timeout: maxRetries * 50 
                });
            }
            throw new Error('LightweightCharts not loaded');
        }
        
        if (window.Logger) {
            window.Logger.info('TradingView libraries loaded', { page: 'date-comparison-modal' });
        }
    }

    /**
     * Initialize Bar Chart
     */
    async function initBarChart() {
        try {
            await waitForTradingViewAdapter();

            const container = document.getElementById('bar-chart-container');
            if (!container) {
                if (window.Logger) {
                    window.Logger.error('Bar chart container not found', { page: 'date-comparison-modal' });
                }
                return;
            }

            // Get wrapper for width calculation
            const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
            const containerWidth = wrapper ? wrapper.clientWidth : container.clientWidth;

            // Remove loading indicator
            const loading = container.querySelector('.chart-loading');
            if (loading) loading.remove();

            // Destroy existing chart if any
            if (barChart) {
                try {
                    if (window.TradingViewChartAdapter && typeof window.TradingViewChartAdapter.destroyChart === 'function') {
                        window.TradingViewChartAdapter.destroyChart(barChart);
                    } else {
                        barChart.remove();
                    }
                } catch (e) {
                    if (window.Logger) {
                        window.Logger.warn('Error removing existing bar chart', { 
                            page: 'date-comparison-modal', 
                            error: e 
                        });
                    }
                }
            }

            // Get colors
            const textColor = getCSSVariableValue('--text-color', '#212529');
            const cardBg = getCSSVariableValue('--card-background', '#ffffff');
            const infoColor = getCSSVariableValue('--info-color', '#17a2b8');
            const successColor = getCSSVariableValue('--success-color', '#28a745');

            // Create chart
            barChart = window.TradingViewChartAdapter.createChart(container, {
                layout: {
                    background: { type: 'solid', color: 'transparent' },
                    textColor: textColor
                },
                grid: {
                    vertLines: { visible: false },
                    horzLines: { visible: true, color: getCSSVariableValue('--border-color', '#e0e0e0') }
                },
                width: containerWidth,
                height: 300,
                timeScale: {
                    visible: true,
                    timeVisible: true,
                    secondsVisible: false
                },
                rightPriceScale: {
                    borderVisible: true,
                    borderColor: getCSSVariableValue('--border-color', '#e0e0e0'),
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.1
                    }
                }
            });

            // Clear existing series
            Object.values(barChartSeries).forEach(series => {
                if (series) {
                    try {
                        barChart.removeSeries(series);
                    } catch (e) {
                        // Ignore
                    }
                }
            });
            barChartSeries = {};

            // Handle resize
            window.addEventListener('resize', () => {
                if (barChart) {
                    const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
                    const containerWidth = wrapper ? wrapper.clientWidth : container.clientWidth;
                    barChart.applyOptions({ width: containerWidth });
                }
            });

            if (window.Logger) {
                window.Logger.info('Bar chart initialized', { page: 'date-comparison-modal' });
            }

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing bar chart', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    /**
     * Update Bar Chart with comparison data
     * @param {Object} data - Comparison data
     */
    function updateBarChart(data) {
        if (!barChart) {
            initBarChart().then(() => {
                if (barChart) {
                    updateBarChart(data);
                }
            });
            return;
        }

        try {
            const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
            if (!lightweightCharts || !lightweightCharts.BarSeries) {
                if (window.Logger) {
                    window.Logger.error('BarSeries not available', { page: 'date-comparison-modal' });
                }
                return;
            }

            // Clear existing series
            Object.values(barChartSeries).forEach(series => {
                if (series) {
                    try {
                        barChart.removeSeries(series);
                    } catch (e) {
                        // Ignore
                    }
                }
            });
            barChartSeries = {};

            // Get colors
            const infoColor = getCSSVariableValue('--info-color', '#17a2b8');
            const successColor = getCSSVariableValue('--success-color', '#28a745');

            // Generate bar chart data
            const barData = generateBarChartData(data);

            // Add series for date1
            const series1 = window.TradingViewChartAdapter.addBarSeries(barChart, {
                title: 'תאריך 1',
                upColor: infoColor,
                downColor: infoColor
            });
            series1.setData(barData.date1Data);
            barChartSeries.date1 = series1;

            // Add series for date2
            const series2 = window.TradingViewChartAdapter.addBarSeries(barChart, {
                title: 'תאריך 2',
                upColor: successColor,
                downColor: successColor
            });
            series2.setData(barData.date2Data);
            barChartSeries.date2 = series2;

            if (window.Logger) {
                window.Logger.info('Bar chart updated', { page: 'date-comparison-modal' });
            }

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error updating bar chart', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    /**
     * Generate bar chart data
     * @param {Object} data - Comparison data
     * @returns {Object} Bar chart data
     */
    function generateBarChartData(data) {
        // Base timestamp: 2024-01-01 00:00:00 UTC (in seconds)
        const baseTimestamp = Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000);
        const secondsPerDay = 86400;
        const secondsPerHour = 3600;

        const metrics = [
            { key: 'balance', label: 'יתרות' },
            { key: 'portfolioValue', label: 'שווי תיק' },
            { key: 'realizedPL', label: 'P/L ממומש' },
            { key: 'unrealizedPL', label: 'P/L לא ממומש' },
            { key: 'totalPL', label: 'P/L כולל' },
            { key: 'positions', label: 'פוזיציות' }
        ];

        const date1Data = [];
        const date2Data = [];

        metrics.forEach((metric, index) => {
            // Each metric gets 2 days: 1 day for data + 1 day for spacing
            const categoryBaseTime = baseTimestamp + (index * 2 * secondsPerDay);
            
            // Date1 data at hour 0
            const time1 = categoryBaseTime;
            date1Data.push({
                time: time1,
                open: data.data1[metric.key],
                high: data.data1[metric.key],
                low: data.data1[metric.key],
                close: data.data1[metric.key]
            });

            // Date2 data at hour 1
            const time2 = categoryBaseTime + secondsPerHour;
            date2Data.push({
                time: time2,
                open: data.data2[metric.key],
                high: data.data2[metric.key],
                low: data.data2[metric.key],
                close: data.data2[metric.key]
            });
        });

        return {
            date1Data: date1Data,
            date2Data: date2Data,
            categories: metrics.map(m => m.label)
        };
    }

    /**
     * Initialize Line Chart
     */
    async function initLineChart() {
        try {
            await waitForTradingViewAdapter();

            const container = document.getElementById('line-chart-container');
            if (!container) {
                if (window.Logger) {
                    window.Logger.error('Line chart container not found', { page: 'date-comparison-modal' });
                }
                return;
            }

            // Get wrapper for width calculation
            const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
            const containerWidth = wrapper ? wrapper.clientWidth : container.clientWidth;

            // Remove loading indicator
            const loading = container.querySelector('.chart-loading');
            if (loading) loading.remove();

            // Destroy existing chart if any
            if (lineChart) {
                try {
                    if (window.TradingViewChartAdapter && typeof window.TradingViewChartAdapter.destroyChart === 'function') {
                        window.TradingViewChartAdapter.destroyChart(lineChart);
                    } else {
                        lineChart.remove();
                    }
                } catch (e) {
                    if (window.Logger) {
                        window.Logger.warn('Error removing existing line chart', { 
                            page: 'date-comparison-modal', 
                            error: e 
                        });
                    }
                }
            }

            // Get colors
            const textColor = getCSSVariableValue('--text-color', '#212529');
            const cardBg = getCSSVariableValue('--card-background', '#ffffff');
            const infoColor = getCSSVariableValue('--info-color', '#17a2b8');
            const successColor = getCSSVariableValue('--success-color', '#28a745');
            const dangerColor = getCSSVariableValue('--danger-color', '#dc3545');

            // Create chart
            lineChart = window.TradingViewChartAdapter.createChart(container, {
                layout: {
                    background: { type: 'solid', color: 'transparent' },
                    textColor: textColor
                },
                grid: {
                    vertLines: { visible: false },
                    horzLines: { visible: true, color: getCSSVariableValue('--border-color', '#e0e0e0') }
                },
                width: containerWidth,
                height: 300,
                timeScale: {
                    visible: true,
                    timeVisible: true,
                    secondsVisible: false
                },
                rightPriceScale: {
                    borderVisible: true,
                    borderColor: getCSSVariableValue('--border-color', '#e0e0e0'),
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.1
                    }
                }
            });

            // Clear existing series
            Object.values(lineChartSeries).forEach(series => {
                if (series) {
                    try {
                        lineChart.removeSeries(series);
                    } catch (e) {
                        // Ignore
                    }
                }
            });
            lineChartSeries = {};

            // Handle resize
            window.addEventListener('resize', () => {
                if (lineChart) {
                    const wrapper = container.closest('.chart-container-wrapper') || container.parentElement;
                    const containerWidth = wrapper ? wrapper.clientWidth : container.clientWidth;
                    lineChart.applyOptions({ width: containerWidth });
                }
            });

            if (window.Logger) {
                window.Logger.info('Line chart initialized', { page: 'date-comparison-modal' });
            }

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing line chart', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    /**
     * Update Line Chart with comparison data
     * @param {Object} data - Comparison data
     */
    function updateLineChart(data) {
        if (!lineChart) {
            initLineChart().then(() => {
                if (lineChart) {
                    updateLineChart(data);
                }
            });
            return;
        }

        try {
            const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
            if (!lightweightCharts || !lightweightCharts.LineSeries) {
                if (window.Logger) {
                    window.Logger.error('LineSeries not available', { page: 'date-comparison-modal' });
                }
                return;
            }

            // Clear existing series
            Object.values(lineChartSeries).forEach(series => {
                if (series) {
                    try {
                        lineChart.removeSeries(series);
                    } catch (e) {
                        // Ignore
                    }
                }
            });
            lineChartSeries = {};

            // Get colors
            const infoColor = getCSSVariableValue('--info-color', '#17a2b8');
            const successColor = getCSSVariableValue('--success-color', '#28a745');
            const dangerColor = getCSSVariableValue('--danger-color', '#dc3545');

            // Generate line chart data
            const lineData = generateLineChartData(data);

            // Add series for balance
            const balanceSeries = window.TradingViewChartAdapter.addLineSeries(lineChart, {
                title: 'יתרות',
                color: infoColor,
                lineWidth: 2
            });
            balanceSeries.setData(lineData.balanceData);
            lineChartSeries.balance = balanceSeries;

            // Add series for portfolio value
            const portfolioSeries = window.TradingViewChartAdapter.addLineSeries(lineChart, {
                title: 'שווי תיק',
                color: successColor,
                lineWidth: 2
            });
            portfolioSeries.setData(lineData.portfolioData);
            lineChartSeries.portfolio = portfolioSeries;

            // Add series for total PL
            const plSeries = window.TradingViewChartAdapter.addLineSeries(lineChart, {
                title: 'P/L כולל',
                color: dangerColor,
                lineWidth: 2
            });
            plSeries.setData(lineData.plData);
            lineChartSeries.pl = plSeries;

            if (window.Logger) {
                window.Logger.info('Line chart updated', { page: 'date-comparison-modal' });
            }

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error updating line chart', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    /**
     * Generate line chart data
     * @param {Object} data - Comparison data
     * @returns {Object} Line chart data
     */
    function generateLineChartData(data) {
        // Base timestamp: 2024-01-01 00:00:00 UTC (in seconds)
        const baseTimestamp = Math.floor(new Date('2024-01-01T00:00:00Z').getTime() / 1000);
        const secondsPerDay = 86400;

        // Create data points between the two dates
        const date1Obj = new Date(data.date1);
        const date2Obj = new Date(data.date2);
        const daysDiff = Math.floor((date2Obj - date1Obj) / (1000 * 60 * 60 * 24));

        const balanceData = [];
        const portfolioData = [];
        const plData = [];

        // Generate intermediate points
        for (let i = 0; i <= daysDiff; i++) {
            const time = baseTimestamp + (i * secondsPerDay);
            const progress = daysDiff > 0 ? i / daysDiff : 0;

            // Interpolate values
            const balance = data.data1.balance + (data.data2.balance - data.data1.balance) * progress;
            const portfolio = data.data1.portfolioValue + (data.data2.portfolioValue - data.data1.portfolioValue) * progress;
            const pl = data.data1.totalPL + (data.data2.totalPL - data.data1.totalPL) * progress;

            balanceData.push({ time: time, value: balance });
            portfolioData.push({ time: time, value: portfolio });
            plData.push({ time: time, value: pl });
        }

        return {
            balanceData: balanceData,
            portfolioData: portfolioData,
            plData: plData
        };
    }

    // ===== ALERTS FUNCTIONS =====

    /**
     * Calculate alerts based on comparison data
     * @param {Object} data - Comparison data
     * @returns {Array} Array of alerts
     */
    function calculateAlerts(data) {
        const alerts = [];

        // Balance change > 5%
        const balanceChangePercent = Math.abs(data.changes.balancePercent);
        if (balanceChangePercent > 5) {
            alerts.push({
                type: 'warning',
                message: `שינוי משמעותי: שינוי ביתרות ${balanceChangePercent.toFixed(1)}%`
            });
        }

        // P/L change > 10%
        const plChangePercent = Math.abs(data.changes.totalPLPercent);
        if (plChangePercent > 10) {
            alerts.push({
                type: 'warning',
                message: `שינוי משמעותי: שינוי ב-P/L ${plChangePercent.toFixed(1)}%`
            });
        }

        return alerts;
    }

    /**
     * Update alerts display
     * @param {Object} data - Comparison data
     */
    function updateAlerts(data) {
        const alertsContainer = document.getElementById('alerts-container');
        if (!alertsContainer) return;

        const alerts = calculateAlerts(data);

        if (alerts.length === 0) {
            alertsContainer.innerHTML = '';
            return;
        }

        alertsContainer.innerHTML = alerts.map(alert => `
            <div class="alert alert-${alert.type}">
                <img src="../../images/icons/tabler/alert-triangle.svg" width="16" height="16" alt="alert-triangle" class="icon">
                <strong>שינוי משמעותי:</strong> ${alert.message}
            </div>
        `).join('');
    }

    // ===== SUMMARY FUNCTIONS =====

    /**
     * Update summary display
     * @param {Object} data - Comparison data
     */
    async function updateSummary(data) {
        if (!window.InfoSummarySystem || !window.INFO_SUMMARY_CONFIGS) return;

        const config = window.INFO_SUMMARY_CONFIGS['date-comparison-modal'];
        if (!config) return;

        // Create summary data array (InfoSummarySystem expects an array)
        const summaryDataArray = [{
            total_change: data.changes.totalPL,
            avg_change_percent: data.changes.totalPLPercent,
            significant_changes: calculateAlerts(data).length
        }];

        try {
            // Use calculateAndRender with custom data
            // We need to override the calculator for custom stats
            const customConfig = {
                ...config,
                stats: config.stats.map(stat => {
                    if (stat.calculator === 'custom' && stat.customCalculator) {
                        return {
                            ...stat,
                            calculator: 'custom',
                            customCalculator: stat.customCalculator
                        };
                    }
                    return stat;
                })
            };

            // For custom calculators, we'll render manually
            const summaryData = summaryDataArray[0];
            const summaryContainer = document.getElementById('comparison-summary');
            if (summaryContainer) {
                let html = '<div class="info-summary"><h3>סיכום השוואה</h3><div class="summary-stats">';
                
                config.stats.forEach(stat => {
                    let value = 0;
                    if (stat.id === 'total_change') {
                        value = summaryData.total_change || 0;
                        const formatted = window.FieldRendererService && typeof window.FieldRendererService.renderAmount === 'function'
                            ? window.FieldRendererService.renderAmount(value, '$', 0, true)
                            : `$${value.toLocaleString('en-US')}`;
                        html += `<div class="stat-item"><span class="stat-label">${stat.label}:</span> <span class="stat-value">${formatted}</span></div>`;
                    } else if (stat.id === 'avg_change_percent') {
                        value = summaryData.avg_change_percent || 0;
                        const formatted = window.FieldRendererService && typeof window.FieldRendererService.renderNumericValue === 'function'
                            ? window.FieldRendererService.renderNumericValue(value, '%', true)
                            : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
                        html += `<div class="stat-item"><span class="stat-label">${stat.label}:</span> <span class="stat-value">${formatted}</span></div>`;
                    } else if (stat.id === 'significant_changes') {
                        value = summaryData.significant_changes || 0;
                        html += `<div class="stat-item"><span class="stat-label">${stat.label}:</span> <span class="stat-value">${value}</span></div>`;
                    }
                });
                
                html += '</div></div>';
                summaryContainer.innerHTML = html;
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to render summary', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    // ===== INITIALIZATION =====

    /**
     * Initialize page
     */
    async function initializePage() {
        try {
            // Wait for UnifiedAppInitializer to complete
            // The system will auto-initialize, but we wait a bit for it to complete
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Load last selected dates
            await loadLastSelectedDates();

            // Initialize charts (but don't show data until dates are selected)
            await initBarChart();
            await initLineChart();

            if (window.Logger) {
                window.Logger.info('Date comparison modal initialized', { page: 'date-comparison-modal' });
            }

        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing date comparison modal', { 
                    page: 'date-comparison-modal', 
                    error 
                });
            }
        }
    }

    // ===== EXPORT FUNCTIONS =====

    /**
     * Export to Excel/PDF (placeholder)
     */
    function exportComparison() {
        if (window.showNotification) {
            window.showNotification('פונקציונליות ייצוא תשולב בעתיד', 'info');
        }
    }

    // ===== GLOBAL EXPORTS =====

    // Export functions to window for global access
    window.dateComparisonModal = {
        getCSSVariableValue,
        handleDate1Change,
        handleDate2Change,
        compareDates,
        exportComparison,
        initializePage
    };

    // Make functions available globally for onclick handlers
    window.handleDate1Change = handleDate1Change;
    window.handleDate2Change = handleDate2Change;
    window.compareDates = compareDates;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        // DOM already loaded
        initializePage();
    }

})();
