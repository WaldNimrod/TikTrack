/**
 * Chart Utils - TikTrack Chart Utilities
 * כלי גרפים - כלי גרפים TikTrack
 * 
 * @version 1.0.0
 * @lastUpdated December 2024
 * @author TikTrack Development Team
 */

console.log('📊 Chart Utils loaded');

/**
 * Chart Utilities
 * כלי גרפים
 */
class ChartUtils {
    constructor() {
        this.defaultColors = [
            '#1e40af',  // כחול ראשי
            '#28a745',  // ירוק הצלחה
            '#ffc107',  // צהוב אזהרה
            '#dc3545',  // אדום סכנה
            '#17a2b8',  // כחול מידע
            '#6c757d',  // אפור משני
            '#007bff',  // כחול טריידים
            '#28a745'   // ירוק חשבונות
        ];
    }

    /**
     * Generate random color
     * צור צבע אקראי
     * @returns {string} Random color
     */
    getRandomColor() {
        const colors = this.defaultColors;
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Get color by index
     * קבל צבע לפי אינדקס
     * @param {number} index - Color index
     * @returns {string} Color value
     */
    getColorByIndex(index) {
        return this.defaultColors[index % this.defaultColors.length];
    }

    /**
     * Format data for charts
     * עבד נתונים לגרפים
     * @param {Array} data - Raw data
     * @param {string} type - Chart type
     * @returns {Object} Formatted chart data
     */
    formatDataForChart(data, type = 'line') {
        if (!Array.isArray(data)) {
            return { labels: [], datasets: [] };
        }

        const labels = data.map(item => item.label || item.name || item.date);
        const values = data.map(item => item.value || item.amount || item.price);

        const dataset = {
            label: 'Data',
            data: values,
            backgroundColor: this.getColorByIndex(0),
            borderColor: this.getColorByIndex(0),
            borderWidth: 2,
            fill: type === 'line' ? false : true
        };

        return {
            labels: labels,
            datasets: [dataset]
        };
    }

    /**
     * Create chart configuration
     * צור תצורת גרף
     * @param {string} type - Chart type
     * @param {Object} data - Chart data
     * @param {Object} options - Additional options
     * @returns {Object} Chart configuration
     */
    createChartConfig(type, data, options = {}) {
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    enabled: true
                }
            }
        };

        return {
            type: type,
            data: data,
            options: { ...defaultOptions, ...options }
        };
    }
}

// Create global instance
window.ChartUtils = new ChartUtils();

console.log('✅ Chart Utils ready');
