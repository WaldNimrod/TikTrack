/**
 * Chart Renderer - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the chart rendering system for TikTrack including:
 * - Chart initialization and management
 * - Chart.js integration and configuration
 * - Data visualization and rendering
 * - Chart lifecycle management
 * - Performance optimization
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

console.log('📊 Chart Renderer loaded');

/**
 * Chart Renderer class
 * @class ChartRenderer
 */
class ChartRenderer {
    constructor() {
        this.charts = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize renderer
     * @function init
     * @async
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Wait for Chart.js to be available
            if (typeof Chart === 'undefined') {
                console.warn('⚠️ Chart.js not available, waiting...');
                await this.waitForChartJs();
            }

            this.isInitialized = true;
            console.log('✅ Chart Renderer initialized');
        } catch (error) {
            console.error('❌ Chart Renderer initialization failed:', error);
        }
    }

    /**
     * Wait for Chart.js to be available
     * @function waitForChartJs
     * @async
     * @returns {Promise<void>}
     */
    async waitForChartJs() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (typeof Chart === 'undefined' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js not available after waiting');
        }
    }

    /**
     * Render chart
     * @function render
     * @param {string} canvasId - Canvas ID
     * @param {Object} config - Chart configuration
     * @returns {Object|null} Chart instance
     */
    render(canvasId, config) {
        if (!this.isInitialized) {
            console.warn('⚠️ Chart Renderer not initialized');
            return null;
        }

        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js not available');
            return null;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`❌ Canvas element '${canvasId}' not found`);
            return null;
        }

        try {
            // Destroy existing chart if it exists
            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            // Create new chart
            const chart = new Chart(canvas, config);
            this.charts.set(canvasId, chart);

            console.log(`✅ Chart rendered: ${canvasId}`);
            return chart;
        } catch (error) {
            console.error(`❌ Failed to render chart ${canvasId}:`, error);
            return null;
        }
    }

    /**
     * Update chart
     * @function update
     * @param {string} canvasId - Canvas ID
     * @param {Object} newData - New data
     * @returns {void}
     */
    update(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (!chart) {
            console.warn(`⚠️ Chart '${canvasId}' not found`);
            return;
        }

        try {
            chart.data = newData;
            chart.update();
            console.log(`✅ Chart updated: ${canvasId}`);
        } catch (error) {
            console.error(`❌ Failed to update chart ${canvasId}:`, error);
        }
    }

    /**
     * Destroy chart
     * @function destroy
     * @param {string} canvasId - Canvas ID
     * @returns {void}
     */
    destroy(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
            console.log(`🗑️ Chart destroyed: ${canvasId}`);
        }
    }

    /**
     * Destroy all charts
     * @function destroyAll
     * @returns {void}
     */
    destroyAll() {
        this.charts.forEach((chart, canvasId) => {
            chart.destroy();
            console.log(`🗑️ Chart destroyed: ${canvasId}`);
        });
        this.charts.clear();
    }

    /**
     * Get chart instance
     * @function getChart
     * @param {string} canvasId - Canvas ID
     * @returns {Object|null} Chart instance
     */
    getChart(canvasId) {
        return this.charts.get(canvasId);
    }

    /**
     * Get all charts
     * @function getAllCharts
     * @returns {Map} All charts
     */
    getAllCharts() {
        return Array.from(this.charts.values());
    }

    /**
     * Get renderer status
     * @function getStatus
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            chartsCount: this.charts.size,
            chartJsAvailable: typeof Chart !== 'undefined'
        };
    }
}

// Create global instance
window.ChartRenderer = new ChartRenderer();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ChartRenderer.init();
    });
} else {
    window.ChartRenderer.init();
}

console.log('✅ Chart Renderer ready');
