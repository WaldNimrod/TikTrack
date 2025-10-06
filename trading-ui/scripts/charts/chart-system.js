/**
 * Chart System - TikTrack Chart System
 * מערכת גרפים - מערכת גרפים TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('📊 Chart System initialized');

/**
 * Main Chart System
 * מערכת גרפים ראשית
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
     * אתחל מערכת גרפים
     */
    async init() {
        try {
            // Chart.js is loaded via CDN in HTML

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
     * רשום מתאם נתונים
     * @param {string} name - Adapter name
     * @param {Object} adapter - Adapter instance
     */
    registerAdapter(name, adapter) {
        this.adapters.set(name, adapter);
        console.log(`📊 Adapter '${name}' registered`);
    }

    /**
     * Get data adapter
     * קבל מתאם נתונים
     * @param {string} name - Adapter name
     * @returns {Object} Adapter instance
     */
    getAdapter(name) {
        return this.adapters.get(name);
    }

    /**
     * Create new chart
     * צור גרף חדש
     * @param {Object} config - Chart configuration
     * @returns {Promise<Object>} Chart instance
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

        console.log(`✅ Chart '${config.id}' created successfully`);
        return chart;
    }

    /**
     * Update chart data
     * עדכן נתוני גרף
     * @param {string} chartId - Chart ID
     * @param {Object} newData - New data
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
     * השמד גרף
     * @param {string} chartId - Chart ID
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
     * השמד את כל הגרפים
     */
    destroyAll() {
        this.charts.forEach((_, chartId) => this.destroy(chartId));
        console.log('🗑️ All charts destroyed');
    }

    /**
     * Get chart instance
     * קבל מופע גרף
     * @param {string} chartId - Chart ID
     * @returns {Object} Chart instance
     */
    getChart(chartId) {
        const chartEntry = this.charts.get(chartId);
        return chartEntry ? chartEntry.instance : null;
    }

    /**
     * Get all charts
     * קבל את כל הגרפים
     * @returns {Array} Array of chart instances
     */
    getAllCharts() {
        return Array.from(this.charts.values()).map(entry => entry.instance);
    }

    /**
     * Get chart info
     * קבל מידע על גרף
     * @param {string} chartId - Chart ID
     * @returns {Object} Chart information
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
     * קבל מידע על כל הגרפים
     * @returns {Array} Array of chart information
     */
    getAllChartsInfo() {
        return Array.from(this.charts.keys()).map(chartId => this.getChartInfo(chartId));
    }

    /**
     * Apply theme to all charts
     * החל נושא על כל הגרפים
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
     * הגדר נושא
     * @param {string} themeName - Theme name
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
     * Export chart (future feature)
     * ייצא גרף (תכונה עתידית)
     * @param {string} chartId - Chart ID
     * @param {string} format - Export format
     */
    export(chartId, format = 'PNG') {
        console.log(`📤 Export chart '${chartId}' to ${format} - Future feature`);
        
        if (typeof showNotification === 'function') {
            showNotification('info', `ייצוא גרף '${chartId}' בפורמט ${format} יהיה זמין בעתיד`);
        }
    }

    /**
     * Get system status
     * קבל סטטוס מערכת
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

