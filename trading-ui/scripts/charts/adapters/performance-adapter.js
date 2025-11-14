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

        const query = new URLSearchParams(params).toString();
        const requestUrl = query ? `${this.dataSource}?${query}` : this.dataSource;

        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-store' }
        });

        if (!response.ok) {
            throw new Error(`Failed to load performance data (${response.status})`);
        }

        const payload = await response.json();
        const normalized = payload?.data ?? payload;

        if (!normalized || !Array.isArray(normalized.dates) || !Array.isArray(normalized.values)) {
            throw new Error('Invalid performance payload received from server');
        }

        const data = {
            dates: normalized.dates,
            values: normalized.values
        };

        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        console.log('📊 Performance data retrieved successfully');
        return data;
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
            primary: '#26baac',
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

