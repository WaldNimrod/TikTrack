/**
 * TradingView Chart Adapter - TikTrack
 * ====================================
 * 
 * Wrapper/Adapter for TradingView Lightweight Charts
 * Provides convenient API for creating and managing charts
 * 
 * @version 1.0.0
 * @created January 27, 2025
 * @author TikTrack Development Team
 * 
 * Documentation: See documentation/02-ARCHITECTURE/FRONTEND/TRADINGVIEW_LIGHTWEIGHT_CHARTS/
 */

(function() {
    'use strict';

    /**
     * TradingView Chart Adapter
     * @class TradingViewChartAdapter
     */
    class TradingViewChartAdapter {
        constructor() {
            this.charts = new Map();
            this.init();
        }

        /**
         * Initialize adapter
         * @function init
         * @returns {void}
         */
        init() {
            // Wait for LightweightCharts to be available
            // The standalone file exports as window.LightweightCharts
            if (typeof window.LightweightCharts === 'undefined' && typeof window.lightweightCharts === 'undefined') {
                console.warn('⚠️ TradingView Lightweight Charts not loaded yet');
                return;
            }
            
            console.log('✅ TradingView Chart Adapter initialized');
        }

        /**
         * Create a new chart
         * @function createChart
         * @param {HTMLElement|string} container - Container element or ID
         * @param {Object} options - Chart options
         * @returns {Object} Chart instance
         */
        createChart(container, options = {}) {
            // Check for both possible global names
            const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
            if (typeof lightweightCharts === 'undefined') {
                throw new Error('TradingView Lightweight Charts not loaded');
            }

            const containerElement = typeof container === 'string' 
                ? document.getElementById(container) 
                : container;

            if (!containerElement) {
                throw new Error('Container element not found');
            }

            // Get theme options
            const themeOptions = window.TradingViewTheme 
                ? window.TradingViewTheme.getThemeOptions() 
                : {};

            // Merge options - deep merge to avoid overwriting
            const chartOptions = {
                ...themeOptions,
                ...options,
            };
            
            // Deep merge layout
            if (themeOptions.layout || options.layout) {
                chartOptions.layout = {
                    ...(themeOptions.layout || {}),
                    ...(options.layout || {}),
                };
            }
            
            // Deep merge grid
            if (themeOptions.grid || options.grid) {
                chartOptions.grid = {
                    ...(themeOptions.grid || {}),
                    ...(options.grid || {}),
                };
            }
            
            // Remove undefined/null values to avoid errors
            Object.keys(chartOptions).forEach(key => {
                if (chartOptions[key] === undefined || chartOptions[key] === null) {
                    delete chartOptions[key];
                }
            });

            // Validate chart options before creating
            try {
                // Create chart using the correct API
                // TradingView Lightweight Charts uses createChart from the library
                const chart = lightweightCharts.createChart(containerElement, chartOptions);
                
                // Verify chart was created correctly
                if (!chart) {
                    throw new Error('Chart creation returned null/undefined');
                }
                
                // Verify chart has addSeries method (correct API)
                if (typeof chart.addSeries !== 'function') {
                    console.warn('Chart object:', chart);
                    console.warn('Chart methods:', Object.getOwnPropertyNames(chart));
                    throw new Error('Chart does not have addSeries method. Chart may not be created correctly.');
                }
                
                // Store chart
                const chartId = containerElement.id || `chart-${Date.now()}`;
                this.charts.set(chartId, chart);
                
                return chart;
            } catch (error) {
                console.error('Error creating TradingView chart:', error);
                console.error('Chart options:', chartOptions);
                console.error('Container:', containerElement);
                console.error('LightweightCharts object:', lightweightCharts);
                throw error;
            }
        }

        /**
         * Add line series to chart
         * @function addLineSeries
         * @param {Object} chart - Chart instance
         * @param {Object} options - Series options
         * @returns {Object} Series instance
         */
        addLineSeries(chart, options = {}) {
            if (!chart) {
                throw new Error('Chart instance required');
            }
            
            // Verify chart has addSeries method (correct API)
            if (typeof chart.addSeries !== 'function') {
                console.error('Chart object:', chart);
                console.error('Chart methods:', Object.getOwnPropertyNames(chart));
                throw new Error('Chart does not have addSeries method. Chart may not be created correctly.');
            }

            // Get LineSeries from LightweightCharts
            const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
            if (!lightweightCharts || !lightweightCharts.LineSeries) {
                throw new Error('TradingView Lightweight Charts LineSeries not available');
            }

            // Get colors from theme (Priority 1: user preferences, Priority 2: entity colors)
            const colors = window.TradingViewTheme 
                ? window.TradingViewTheme.getChartColors() 
                : { primary: '#26baac' };
            
            // If entityType is provided, use entity color (Priority 2)
            let seriesColor = options.color;
            if (!seriesColor && options.entityType && window.TradingViewTheme) {
                seriesColor = window.TradingViewTheme.getEntityColorForSeries(
                    options.entityType, 
                    options.variant || 'base'
                );
            }
            // Fallback to primary color (Priority 1: user preferences)
            if (!seriesColor) {
                seriesColor = colors.primary || colors.point || '#26baac';
            }

            const seriesOptions = {
                color: seriesColor,
                lineWidth: options.lineWidth || 2,
                lineType: options.lineType || 0, // 0: Normal, 1: Stepped, 2: With Gaps
                ...options,
            };

            try {
                // Use correct API: chart.addSeries(LineSeries, options)
                return chart.addSeries(lightweightCharts.LineSeries, seriesOptions);
            } catch (error) {
                console.error('Error adding line series:', error);
                console.error('Series options:', seriesOptions);
                console.error('Chart:', chart);
                throw error;
            }
        }

        /**
         * Add area series to chart
         * @function addAreaSeries
         * @param {Object} chart - Chart instance
         * @param {Object} options - Series options
         * @returns {Object} Series instance
         */
        addAreaSeries(chart, options = {}) {
            if (!chart) {
                throw new Error('Chart instance required');
            }
            
            if (typeof chart.addSeries !== 'function') {
                throw new Error('Chart does not have addSeries method');
            }

            const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
            if (!lightweightCharts || !lightweightCharts.AreaSeries) {
                throw new Error('TradingView Lightweight Charts AreaSeries not available');
            }

            const colors = window.TradingViewTheme 
                ? window.TradingViewTheme.getChartColors() 
                : { primary: '#26baac' };
            
            // If entityType is provided, use entity color (Priority 2)
            let seriesColor = options.lineColor || options.color;
            if (!seriesColor && options.entityType && window.TradingViewTheme) {
                seriesColor = window.TradingViewTheme.getEntityColorForSeries(
                    options.entityType, 
                    options.variant || 'base'
                );
            }
            // Fallback to primary color (Priority 1: user preferences)
            if (!seriesColor) {
                seriesColor = colors.primary || colors.point || '#26baac';
            }

            const seriesOptions = {
                lineColor: seriesColor,
                topColor: options.topColor || seriesColor,
                bottomColor: options.bottomColor || `${seriesColor}28`, // 28 = alpha
                ...options,
            };

            return chart.addSeries(lightweightCharts.AreaSeries, seriesOptions);
        }

        /**
         * Add candlestick series to chart
         * @function addCandlestickSeries
         * @param {Object} chart - Chart instance
         * @param {Object} options - Series options
         * @returns {Object} Series instance
         */
        addCandlestickSeries(chart, options = {}) {
            if (!chart) {
                throw new Error('Chart instance required');
            }
            
            if (typeof chart.addSeries !== 'function') {
                throw new Error('Chart does not have addSeries method');
            }

            const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
            if (!lightweightCharts || !lightweightCharts.CandlestickSeries) {
                throw new Error('TradingView Lightweight Charts CandlestickSeries not available');
            }

            const colors = window.TradingViewTheme 
                ? window.TradingViewTheme.getChartColors() 
                : { success: '#28a745', danger: '#dc3545' };

            const seriesOptions = {
                upColor: options.upColor || colors.success,
                downColor: options.downColor || colors.danger,
                borderVisible: options.borderVisible !== false,
                ...options,
            };

            return chart.addSeries(lightweightCharts.CandlestickSeries, seriesOptions);
        }

        /**
         * Add histogram series to chart (for Volume)
         * @function addHistogramSeries
         * @param {Object} chart - Chart instance
         * @param {Object} options - Series options
         * @returns {Object} Series instance
         */
        addHistogramSeries(chart, options = {}) {
            if (!chart) {
                throw new Error('Chart instance required');
            }
            
            if (typeof chart.addSeries !== 'function') {
                throw new Error('Chart does not have addSeries method');
            }

            const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
            if (!lightweightCharts || !lightweightCharts.HistogramSeries) {
                throw new Error('TradingView Lightweight Charts HistogramSeries not available');
            }

            const colors = window.TradingViewTheme 
                ? window.TradingViewTheme.getChartColors() 
                : { primary: '#26baac' };

            const seriesOptions = {
                color: options.color || colors.primary,
                priceFormat: options.priceFormat || {
                    type: 'volume',
                    precision: 0,
                    minMove: 1
                },
                priceScaleId: options.priceScaleId || 'right',
                ...options,
            };

            return chart.addSeries(lightweightCharts.HistogramSeries, seriesOptions);
        }

        /**
         * Add bar series to chart
         * @function addBarSeries
         * @param {Object} chart - Chart instance
         * @param {Object} options - Series options
         * @returns {Object} Series instance
         */
        addBarSeries(chart, options = {}) {
            if (!chart) {
                throw new Error('Chart instance required');
            }
            
            if (typeof chart.addSeries !== 'function') {
                throw new Error('Chart does not have addSeries method');
            }

            const lightweightCharts = window.LightweightCharts || window.lightweightCharts;
            if (!lightweightCharts || !lightweightCharts.BarSeries) {
                throw new Error('TradingView Lightweight Charts BarSeries not available');
            }

            const colors = window.TradingViewTheme 
                ? window.TradingViewTheme.getChartColors() 
                : { success: '#28a745', danger: '#dc3545' };

            const seriesOptions = {
                upColor: options.upColor || colors.success,
                downColor: options.downColor || colors.danger,
                ...options,
            };

            return chart.addSeries(lightweightCharts.BarSeries, seriesOptions);
        }

        /**
         * Update series data
         * @function updateData
         * @param {Object} series - Series instance
         * @param {Array} data - Data array
         * @returns {void}
         */
        updateData(series, data) {
            if (!series) {
                throw new Error('Series instance required');
            }

            if (Array.isArray(data)) {
                series.setData(data);
            } else {
                series.update(data);
            }
        }

        /**
         * Destroy chart
         * @function destroyChart
         * @param {Object|string} chartOrId - Chart instance or ID
         * @returns {void}
         */
        destroyChart(chartOrId) {
            let chart = chartOrId;
            
            if (typeof chartOrId === 'string') {
                chart = this.charts.get(chartOrId);
                this.charts.delete(chartOrId);
            } else if (chartOrId && chartOrId.id) {
                this.charts.delete(chartOrId.id);
            }

            if (chart && typeof chart.remove === 'function') {
                chart.remove();
            }
        }

        /**
         * Apply theme to chart
         * @function applyTheme
         * @param {Object} chart - Chart instance
         * @param {string} themeName - Theme name (optional)
         * @returns {void}
         */
        applyTheme(chart, themeName = null) {
            if (!chart) {
                throw new Error('Chart instance required');
            }

            const themeOptions = window.TradingViewTheme 
                ? window.TradingViewTheme.getThemeOptions(themeName) 
                : {};

            chart.applyOptions(themeOptions);
        }

        /**
         * Get chart by ID
         * @function getChart
         * @param {string} chartId - Chart ID
         * @returns {Object|null} Chart instance or null
         */
        getChart(chartId) {
            return this.charts.get(chartId) || null;
        }

        /**
         * Get all charts
         * @function getAllCharts
         * @returns {Array} Array of chart instances
         */
        getAllCharts() {
            return Array.from(this.charts.values());
        }

        /**
         * Take screenshot of chart
         * @function takeScreenshot
         * @param {Object} chart - Chart instance
         * @returns {Promise<string>} Base64 image data URL
         */
        async takeScreenshot(chart) {
            if (!chart) {
                throw new Error('Chart instance required');
            }

            if (typeof chart.takeScreenshot !== 'function') {
                throw new Error('Chart does not have takeScreenshot method');
            }

            try {
                return await chart.takeScreenshot();
            } catch (error) {
                console.error('Error taking screenshot:', error);
                throw error;
            }
        }

        /**
         * Set visible time range
         * @function setVisibleRange
         * @param {Object} chart - Chart instance
         * @param {Object} range - Time range {from, to} (Unix timestamps)
         * @returns {void}
         */
        setVisibleRange(chart, range) {
            if (!chart) {
                throw new Error('Chart instance required');
            }

            if (!chart.timeScale || typeof chart.timeScale().setVisibleRange !== 'function') {
                throw new Error('Chart does not have timeScale.setVisibleRange method');
            }

            try {
                chart.timeScale().setVisibleRange(range);
            } catch (error) {
                console.error('Error setting visible range:', error);
                throw error;
            }
        }

        /**
         * Reset time scale (zoom reset)
         * @function resetTimeScale
         * @param {Object} chart - Chart instance
         * @returns {void}
         */
        resetTimeScale(chart) {
            if (!chart) {
                throw new Error('Chart instance required');
            }

            if (!chart.timeScale || typeof chart.timeScale().resetTimeScale !== 'function') {
                throw new Error('Chart does not have timeScale.resetTimeScale method');
            }

            try {
                chart.timeScale().resetTimeScale();
            } catch (error) {
                console.error('Error resetting time scale:', error);
                throw error;
            }
        }

        /**
         * Scroll to position
         * @function scrollToPosition
         * @param {Object} chart - Chart instance
         * @param {number} position - Scroll position (0-1)
         * @param {boolean} animated - Animate scroll
         * @returns {void}
         */
        scrollToPosition(chart, position, animated = true) {
            if (!chart) {
                throw new Error('Chart instance required');
            }

            if (!chart.timeScale || typeof chart.timeScale().scrollToPosition !== 'function') {
                throw new Error('Chart does not have timeScale.scrollToPosition method');
            }

            try {
                chart.timeScale().scrollToPosition(position, animated);
            } catch (error) {
                console.error('Error scrolling to position:', error);
                throw error;
            }
        }

        /**
         * Get visible range
         * @function getVisibleRange
         * @param {Object} chart - Chart instance
         * @returns {Object|null} Visible range {from, to} or null
         */
        getVisibleRange(chart) {
            if (!chart) {
                throw new Error('Chart instance required');
            }

            if (!chart.timeScale || typeof chart.timeScale().getVisibleRange !== 'function') {
                throw new Error('Chart does not have timeScale.getVisibleRange method');
            }

            try {
                return chart.timeScale().getVisibleRange();
            } catch (error) {
                console.error('Error getting visible range:', error);
                return null;
            }
        }
    }

    // Create global instance
    window.TradingViewChartAdapter = new TradingViewChartAdapter();
    
    console.log('📊 TradingView Chart Adapter loaded');
})();

