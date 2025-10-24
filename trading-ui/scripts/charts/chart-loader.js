/**
 * Chart Loader - TikTrack Chart Loader
 * טוען גרפים - טוען גרפים TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('📊 Chart Loader initialized');

/**
 * Chart Loader Class
 * מחלקת טוען גרפים
 */
class ChartLoader {
    constructor() {
        this.isLoaded = false;
        this.loadPromise = null;
        this.version = '3.9.1';
    }

    /**
     * Load Chart.js
     * טען Chart.js
     * @returns {Promise<boolean>} Load success
     */
    async load() {
        if (this.isLoaded) {
            return true;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._loadChartJs();
        return this.loadPromise;
    }

    /**
     * Internal load method
     * שיטת טעינה פנימית
     * @returns {Promise<boolean>} Load success
     */
    async _loadChartJs() {
        try {
            // Check if Chart.js is already loaded
            if (typeof Chart !== 'undefined') {
                console.log('✅ Chart.js already loaded');
                this.isLoaded = true;
                return true;
            }

            // Wait for Chart.js to be available from CDN
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max wait
            
            while (typeof Chart === 'undefined' && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js failed to load from CDN');
            }

            // Verify Chart.js version
            const chartVersion = Chart.version || 'unknown';
            console.log(`✅ Chart.js loaded successfully (version: ${chartVersion})`);

            // Configure Chart.js defaults
            this._configureDefaults();

            this.isLoaded = true;
            return true;

        } catch (error) {
            console.error('❌ Chart.js loading failed:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * Configure Chart.js defaults
     * הגדר ברירות מחדל של Chart.js
     */
    _configureDefaults() {
        // Configure responsive behavior
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;

        // Configure animation
        Chart.defaults.animation = {
            duration: 1000,
            easing: 'easeInOutQuart'
        };

        // Configure interaction
        Chart.defaults.interaction = {
            intersect: false,
            mode: 'index'
        };

        // Configure plugins
        Chart.defaults.plugins = {
            ...Chart.defaults.plugins,
            legend: {
                display: true,
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#fff',
                borderWidth: 1,
                cornerRadius: 6,
                displayColors: true
            }
        };

        console.log('✅ Chart.js defaults configured');
    }

    /**
     * Check if Chart.js is loaded
     * בדוק אם Chart.js נטען
     * @returns {boolean} Load status
     */
    isChartJsLoaded() {
        return typeof Chart !== 'undefined';
    }

    /**
     * Get Chart.js version
     * קבל גרסת Chart.js
     * @returns {string} Version
     */
    getVersion() {
        if (this.isChartJsLoaded()) {
            return Chart.version || 'unknown';
        }
        return 'not loaded';
    }

    /**
     * Get loader status
     * קבל סטטוס טוען
     * @returns {Object} Status
     */
    getStatus() {
        return {
            isLoaded: this.isLoaded,
            chartJsAvailable: this.isChartJsLoaded(),
            version: this.getVersion(),
            expectedVersion: this.version
        };
    }
}

// Create global instance
window.ChartLoader = new ChartLoader();

// Auto-load Chart.js when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ChartLoader.load();
    });
} else {
    window.ChartLoader.load();
}

console.log('✅ Chart Loader ready');
