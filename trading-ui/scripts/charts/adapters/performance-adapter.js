/**
 * Performance Data Adapter - TikTrack Chart System
 * מתאם נתוני ביצועים - מערכת גרפים TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('📊 Performance Data Adapter initialized');

/**
 * Performance Data Adapter
 * מתאם נתוני ביצועים
 */
class PerformanceAdapter {
    constructor(config = {}) {
        this.dataSource = config.dataSource || '/api/performance';
        this.cache = new Map();
        this.cacheTimeout = config.cacheTimeout || 300000; // 5 minutes
    }

    /**
     * Get performance data
     * קבל נתוני ביצועים
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Performance data
     */
    async getData(params = {}) {
        const cacheKey = JSON.stringify(params);
        const cached = this.cache.get(cacheKey);
        
        // Return cached data if still valid
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log('📊 Using cached performance data');
            return cached.data;
        }

        try {
            // Return empty data - no real performance data available yet
            const emptyData = { dates: [], values: [] };
            
            // Cache the empty data
            this.cache.set(cacheKey, {
                data: emptyData,
                timestamp: Date.now()
            });
            
            console.log('📊 Performance data retrieved (empty - no real data available)');
            return emptyData;
        } catch (error) {
            console.error('❌ Error fetching performance data:', error);
            return { dates: [], values: [] };
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
            primary: window.getChartColor('primary'),
            success: window.getChartColor('success'),
            warning: window.getChartColor('warning'),
            danger: window.getChartColor('danger')
        } : {
            primary: '#007bff',
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545'
        };

        return {
            labels: rawData.dates || [],
            datasets: [{
                label: 'ביצועי תיק (%)',
                data: rawData.values || [],
                borderColor: colors.primary,
                backgroundColor: colors.primary + '20',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: colors.primary,
                pointBorderColor: colors.primary,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };
    }

    /**
     * Generate mock data for testing
     * צור נתוני דמה לבדיקה
     * @param {Object} params - Parameters
     * @returns {Object} Mock data
     */
    generateMockData(params = {}) {
        const days = params.days || 30;
        const dates = [];
        const values = [];
        
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('he-IL'));
            
            // Generate realistic performance data
            const baseValue = 100;
            const variation = (Math.random() - 0.5) * 10;
            const trend = (days - i) * 0.1;
            values.push(Math.max(0, baseValue + variation + trend));
        }
        
        return { dates, values };
    }

    /**
     * Clear cache
     * נקה מטמון
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Performance adapter cache cleared');
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
window.PerformanceAdapter = new PerformanceAdapter();

console.log('✅ Performance Data Adapter ready');

