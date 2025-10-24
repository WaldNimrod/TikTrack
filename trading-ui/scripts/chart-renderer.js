/**
 * Chart Renderer - TikTrack Chart Renderer
 * מרנדר גרפים - מרנדר גרפים TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('📊 Chart Renderer loaded');

/**
 * Chart Renderer
 * מרנדר גרפים
 */
class ChartRenderer {
    constructor() {
        this.charts = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize renderer
     * אתחל מרנדר
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
     * המתן עד ש-Chart.js יהיה זמין
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
     * רנדר גרף
     * @param {string} canvasId - Canvas element ID
     * @param {Object} config - Chart configuration
     * @returns {Object} Chart instance
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
     * Update chart data
     * עדכן נתוני גרף
     * @param {string} canvasId - Canvas element ID
     * @param {Object} newData - New data
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
     * השמד גרף
     * @param {string} canvasId - Canvas element ID
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
     * השמד את כל הגרפים
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
     * קבל מופע גרף
     * @param {string} canvasId - Canvas element ID
     * @returns {Object} Chart instance
     */
    getChart(canvasId) {
        return this.charts.get(canvasId);
    }

    /**
     * Get all charts
     * קבל את כל הגרפים
     * @returns {Array} Array of chart instances
     */
    getAllCharts() {
        return Array.from(this.charts.values());
    }

    /**
     * Get renderer status
     * קבל סטטוס מרנדר
     * @returns {Object} Status
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
