/**
 * Chart System - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the main chart system for TikTrack including:
 * - Chart initialization and management
 * - Data adapter registration
 * - Chart lifecycle management
 * - Performance optimization
 * - Theme integration
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

console.log('📊 Chart System initialized');

/**
 * Main Chart System class
 * @class ChartSystem
 */
class ChartSystem {
    constructor() {
        this.charts = new Map();
        this.adapters = new Map();
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialize chart system
     * @function init
     * @async
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Wait for Chart.js to be loaded
            if (window.ChartLoader) {
                await window.ChartLoader.load();
            } else {
                console.warn('⚠️ ChartLoader not available');
            }

            // Wait for ChartTheme to be available
            if (!window.ChartTheme) {
                console.warn('⚠️ ChartTheme not available');
            }

            this.isInitialized = true;
            console.log('✅ Chart System initialized successfully');
        } catch (error) {
            console.error('❌ Chart System initialization failed:', error);
        }
    }

    /**
     * Register data adapter
     * @function registerAdapter
     * @param {string} name - Adapter name
     * @param {Object} adapter - Adapter object
     * @returns {void}
     */
    registerAdapter(name, adapter) {
        this.adapters.set(name, adapter);
        console.log(`📊 Adapter '${name}' registered`);
    }

    /**
     * Get data adapter
     * @function getAdapter
     * @param {string} name - Adapter name
     * @returns {Object|null} Adapter object
     */
    getAdapter(name) {
        return this.adapters.get(name);
    }

    /**
     * Create new chart
     * @function create
     * @async
     * @param {Object} config - Chart configuration
     * @returns {Promise<Object|null>} Chart instance
     */
    async create(config) {
        if (!this.isInitialized) {
            await this.init();
        }

        if (!window.Chart) {
            throw new Error('Chart.js not available');
        }

        // Validate required config
        if (!config.id || !config.type || !config.container) {
            throw new Error('Chart config must include id, type, and container');
        }

        // Check if chart already exists
        if (this.charts.has(config.id)) {
            console.warn(`⚠️ Chart '${config.id}' already exists. Destroying and recreating.`);
            this.destroy(config.id);
        }

        // Get container element
        const container = document.querySelector(config.container);
        if (!container) {
            throw new Error(`Chart container '${config.container}' not found`);
        }

        // Get chart data
        let chartData = config.data || { labels: [], datasets: [] };
        
        // Use adapter if specified
        if (config.adapter) {
            const adapter = this.getAdapter(config.adapter);
            if (adapter) {
                try {
                    const rawData = await adapter.getData(config.adapterConfig || {});
                    chartData = adapter.formatData(rawData);
                } catch (error) {
                    console.warn(`⚠️ Adapter '${config.adapter}' failed:`, error);
                    // Use fallback data
                }
            } else {
                console.warn(`⚠️ Adapter '${config.adapter}' not found`);
            }
        }

        // Merge options with theme
        const themeOptions = window.ChartTheme ? window.ChartTheme.getChartOptions() : {};
        const chartOptions = {
            ...themeOptions,
            ...config.options
        };

        // Create chart
        const chart = new Chart(container, {
            type: config.type,
            data: chartData,
            options: chartOptions
        });

        // Store chart
        this.charts.set(config.id, {
            instance: chart,
            config: config,
            createdAt: new Date()
        });

        // console.log(`✅ Chart '${config.id}' created successfully`);
        return chart;
    }

    /**
     * Update chart data
     * @function update
     * @async
     * @param {string} chartId - Chart ID
     * @param {Object} newData - New data
     * @returns {Promise<void>}
     */
    async update(chartId, newData) {
        const chartEntry = this.charts.get(chartId);
        if (!chartEntry) {
            console.warn(`⚠️ Chart '${chartId}' not found`);
            return;
        }

        const chart = chartEntry.instance;
        
        // Update data
        if (newData.labels) {
            chart.data.labels = newData.labels;
        }
        if (newData.datasets) {
            chart.data.datasets = newData.datasets;
        }

        // Update chart
        chart.update();
        console.log(`✅ Chart '${chartId}' updated`);
    }

    /**
     * Destroy chart
     * @function destroy
     * @param {string} chartId - Chart ID
     * @returns {void}
     */
    destroy(chartId) {
        const chartEntry = this.charts.get(chartId);
        if (chartEntry) {
            chartEntry.instance.destroy();
            this.charts.delete(chartId);
            console.log(`🗑️ Chart '${chartId}' destroyed`);
        } else {
            console.warn(`⚠️ Chart '${chartId}' not found`);
        }
    }

    /**
     * Destroy all charts
     * @function destroyAll
     * @returns {void}
     */
    destroyAll() {
        this.charts.forEach((_, chartId) => this.destroy(chartId));
        console.log('🗑️ All charts destroyed');
    }

    /**
     * Get chart instance
     * @function getChart
     * @param {string} chartId - Chart ID
     * @returns {Object|null} Chart instance
     */
    getChart(chartId) {
        const chartEntry = this.charts.get(chartId);
        return chartEntry ? chartEntry.instance : null;
    }

    /**
     * Get all charts
     * @function getAllCharts
     * @returns {Array} All chart instances
     */
    getAllCharts() {
        return Array.from(this.charts.values()).map(entry => entry.instance);
    }

    /**
     * Get chart info
     * @function getChartInfo
     * @param {string} chartId - Chart ID
     * @returns {Object|null} Chart info
     */
    getChartInfo(chartId) {
        const chartEntry = this.charts.get(chartId);
        if (!chartEntry) {
            return null;
        }

        return {
            id: chartId,
            type: chartEntry.config.type,
            container: chartEntry.config.container,
            adapter: chartEntry.config.adapter,
            createdAt: chartEntry.createdAt,
            isActive: true
        };
    }

    /**
     * Get all charts info
     * @function getAllChartsInfo
     * @returns {Array} All charts info
     */
    getAllChartsInfo() {
        return Array.from(this.charts.keys()).map(chartId => this.getChartInfo(chartId));
    }

    /**
     * Apply theme to all charts
     * @function applyThemeToAllCharts
     * @returns {void}
     */
    applyThemeToAllCharts() {
        if (!window.ChartTheme) {
            console.warn('⚠️ ChartTheme not available');
            return;
        }

        const themeOptions = window.ChartTheme.getChartOptions();
        
        this.charts.forEach((chartEntry, chartId) => {
            const chart = chartEntry.instance;
            
            // Update chart options
            chart.options = {
                ...chart.options,
                ...themeOptions
            };
            
            // Update chart
            chart.update();
        });

        console.log('🎨 Theme applied to all charts');
    }

    /**
     * Set theme
     * @function setTheme
     * @param {string} themeName - Theme name
     * @returns {void}
     */
    setTheme(themeName) {
        if (window.ChartTheme) {
            window.ChartTheme.setTheme(themeName);
            this.applyThemeToAllCharts();
        } else {
            console.warn('⚠️ ChartTheme not available');
        }
    }

    /**
     * Export chart
     * @function export
     * @param {string} chartId - Chart ID
     * @param {string} format - Export format
     * @returns {string|null} Export data
     */
    export(chartId, format = 'PNG') {
        console.log(`📤 Export chart '${chartId}' to ${format} - Future feature`);
        
        if (typeof showNotification === 'function') {
            showNotification('info', `ייצוא גרף '${chartId}' בפורמט ${format} יהיה זמין בעתיד`);
        }
    }

    /**
     * Get system status
     * @function getStatus
     * @returns {Object} System status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            chartsCount: this.charts.size,
            adaptersCount: this.adapters.size,
            chartJsAvailable: typeof Chart !== 'undefined',
            themeAvailable: typeof window.ChartTheme !== 'undefined'
        };
    }
}

// ===== GLOBAL EXPORTS =====
window.ChartSystem = ChartSystem;

// Create global instance
window.ChartSystem = new ChartSystem();

// Export convenience functions
window.createChart = (config) => window.ChartSystem.create(config);
window.updateChart = (chartId, data) => window.ChartSystem.update(chartId, data);
window.destroyChart = (chartId) => window.ChartSystem.destroy(chartId);
window.destroyAllCharts = () => window.ChartSystem.destroyAll();
window.getChart = (chartId) => window.ChartSystem.getChart(chartId);
window.getAllCharts = () => window.ChartSystem.getAllCharts();
window.exportChart = (chartId, format) => window.ChartSystem.export(chartId, format);

console.log('✅ Chart System ready');

