/**
 * Linter Data Adapter - TikTrack Chart System
 * מתאם נתוני Linter - מערכת גרפים TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('🔍 Linter Data Adapter initialized');

/**
 * Linter Data Adapter
 * מתאם נתוני Linter
 */
class LinterAdapter {
    constructor(config = {}) {
        this.dataSource = config.dataSource || '/api/linter/stats';
        this.cache = new Map();
        this.cacheTimeout = config.cacheTimeout || 300000; // 5 minutes
    }

    /**
     * Get linter data
     * קבל נתוני Linter
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Linter data
     */
    async getData(params = {}) {
        const cacheKey = JSON.stringify(params);
        const cached = this.cache.get(cacheKey);
        
        // Return cached data if still valid
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log('🔍 Using cached linter data');
            return cached.data;
        }

        try {
            // Return empty data - no real linter data available yet
            const emptyData = { timestamps: [], quality: [], counts: [] };
            
            // Cache the empty data
            this.cache.set(cacheKey, {
                data: emptyData,
                timestamp: Date.now()
            });
            
            console.log('🔍 Linter data retrieved (empty - no real data available)');
            return emptyData;
        } catch (error) {
            console.error('❌ Error fetching linter data:', error);
            return { timestamps: [], quality: [], counts: [] };
        }
    }

    /**
     * Format data for charts
     * עיצוב נתונים עבור גרפים
     * @param {Object} rawData - Raw data
     * @returns {Object} Formatted chart data
     */
    formatData(rawData) {
        const colors = window.getChartColor ? {
            success: window.getChartColor('success'),
            info: window.getChartColor('info'),
            warning: window.getChartColor('warning'),
            danger: window.getChartColor('danger')
        } : {
            success: '#28a745',
            info: '#17a2b8',
            warning: '#ffc107',
            danger: '#dc3545'
        };

        return {
            labels: rawData.timestamps || [],
            datasets: [
                {
                    label: 'איכות קוד (%)',
                    data: rawData.quality || [],
                    borderColor: colors.success,
                    backgroundColor: colors.success + '20',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: colors.success,
                    pointBorderColor: colors.success,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'ספירות',
                    data: rawData.counts || [],
                    borderColor: colors.info,
                    backgroundColor: colors.info + '20',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: colors.info,
                    pointBorderColor: colors.info,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                }
            ]
        };
    }

    /**
     * Generate mock data for testing
     * צור נתוני דמה לבדיקה
     * @param {Object} params - Parameters
     * @returns {Object} Mock data
     */
    generateMockData(params = {}) {
        const hours = params.hours || 24;
        const timestamps = [];
        const quality = [];
        const counts = [];
        
        const now = new Date();
        for (let i = hours - 1; i >= 0; i--) {
            const time = new Date(now);
            time.setHours(time.getHours() - i);
            timestamps.push(time.toLocaleTimeString('he-IL', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }));
            
            // Generate realistic quality data (80-95%)
            const qualityValue = 80 + Math.random() * 15;
            quality.push(Math.round(qualityValue * 10) / 10);
            
            // Generate realistic counts data (50-200)
            const countValue = 50 + Math.random() * 150;
            counts.push(Math.round(countValue));
        }
        
        return { timestamps, quality, counts };
    }

    /**
     * Clear cache
     * נקה מטמון
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Linter adapter cache cleared');
    }

    /**
     * Get cache status
     * קבל סטטוס מטמון
     * @returns {Object} Cache status
     */
    getCacheStatus() {
        return {
            size: this.cache.size,
            timeout: this.cacheTimeout
        };
    }
}

// Create global instance
window.LinterAdapter = new LinterAdapter();

console.log('✅ Linter Data Adapter ready');

