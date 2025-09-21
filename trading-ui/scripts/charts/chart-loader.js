/**
 * Chart.js Dynamic Loader - TikTrack Chart System
 * טוען דינמי של Chart.js - מערכת גרפים TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('📊 Chart.js Dynamic Loader initialized');

/**
 * Dynamic Chart.js loader
 * טוען דינמי של Chart.js
 */
class ChartLoader {
    constructor() {
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
        this.chartJsVersion = '4.4.0';
        this.cdnUrl = `https://cdn.jsdelivr.net/npm/chart.js@${this.chartJsVersion}/dist/chart.umd.js`;
    }

    /**
     * Load Chart.js dynamically
     * טוען Chart.js באופן דינמי
     * @returns {Promise<void>}
     */
    async load() {
        // Return existing promise if already loading
        if (this.isLoading && this.loadPromise) {
            return this.loadPromise;
        }

        // Return immediately if already loaded
        if (this.isLoaded) {
            console.log('✅ Chart.js already loaded');
            return Promise.resolve();
        }

        // Check if Chart.js is already available globally
        if (typeof Chart !== 'undefined') {
            console.log('✅ Chart.js already available globally');
            this.isLoaded = true;
            return Promise.resolve();
        }

        console.log('📊 Loading Chart.js dynamically...');
        this.isLoading = true;

        this.loadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = this.cdnUrl;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                console.log('✅ Chart.js loaded successfully');
                this.isLoaded = true;
                this.isLoading = false;
                resolve();
            };

            script.onerror = () => {
                console.error('❌ Chart.js failed to load');
                this.isLoading = false;
                reject(new Error('Chart.js failed to load'));
            };

            document.head.appendChild(script);
        });

        return this.loadPromise;
    }

    /**
     * Check if Chart.js is loaded
     * בדוק אם Chart.js נטען
     * @returns {boolean}
     */
    isChartJsLoaded() {
        return this.isLoaded || typeof Chart !== 'undefined';
    }

    /**
     * Get Chart.js version
     * קבל גרסת Chart.js
     * @returns {string}
     */
    getVersion() {
        return this.chartJsVersion;
    }

    /**
     * Force reload Chart.js
     * טען מחדש את Chart.js
     * @returns {Promise<void>}
     */
    async reload() {
        this.isLoaded = false;
        this.isLoading = false;
        this.loadPromise = null;
        
        // Remove existing Chart.js script if exists
        const existingScript = document.querySelector(`script[src*="chart.js"]`);
        if (existingScript) {
            existingScript.remove();
        }
        
        return this.load();
    }
}

// Create global instance
window.ChartLoader = new ChartLoader();

// Export convenience function
window.loadChartJS = () => window.ChartLoader.load();

// Auto-load Chart.js when this script is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load Chart.js automatically
    window.ChartLoader.load().catch(error => {
        console.warn('⚠️ Chart.js auto-load failed:', error);
    });
});

console.log('✅ Chart.js Dynamic Loader ready');

