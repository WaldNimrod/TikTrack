/**
 * Statistics Calculator - TikTrack
 * ================================
 * 
 * מערכת מרכזית לחישוב סטטיסטיקות מנתונים
 * מחליפה קוד חישובים ב-5 עמודים במערכת
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 * 
 * תכונות:
 * - חישוב sum (סכום)
 * - חישוב average (ממוצע)
 * - חישוב count (ספירה)
 * - חישוב count with filter (ספירה מותנית)
 * - חישוב min/max
 * - חישוב group by (קיבוץ)
 */


// ===== FUNCTION INDEX =====

// === Data Functions ===
// - calculateStatisticsViaAPI() - Calculatestatisticsviaapi
// - calculateSumViaAPI() - Calculatesumviaapi
// - calculateAverageViaAPI() - Calculateaverageviaapi
// - countRecordsViaAPI() - Countrecordsviaapi

// ===== STATISTICS CALCULATOR =====

class StatisticsCalculator {
    /**
     * חישוב סכום של שדה
     * 
     * @param {Array} data - מערך נתונים
     * @param {string|Function} field - שם השדה או פונקציה לחילוץ ערך
     * @returns {number} - סכום
     * 
     * @example
     * const totalBalance = StatisticsCalculator.calculateSum(accounts, 'cash_balance');
     * const totalPL = StatisticsCalculator.calculateSum(trades, (t) => t.total_pl);
     */
    static calculateSum(data, field) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return 0;
        }
        
        return data.reduce((sum, item) => {
            let value;
            
            if (typeof field === 'function') {
                value = field(item);
            } else {
                value = item[field];
            }
            
            const numValue = parseFloat(value) || 0;
            return sum + numValue;
        }, 0);
    }

    /**
     * חישוב ממוצע של שדה
     * 
     * @param {Array} data - מערך נתונים
     * @param {string|Function} field - שם השדה או פונקציה
     * @returns {number} - ממוצע
     * 
     * @example
     * const avgPrice = StatisticsCalculator.calculateAverage(executions, 'price');
     */
    static calculateAverage(data, field) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return 0;
        }
        
        const sum = this.calculateSum(data, field);
        return sum / data.length;
    }

    /**
     * ספירת רשומות
     * 
     * @param {Array} data - מערך נתונים
     * @param {Function} filterFn - פונקציית סינון (אופציונלי)
     * @returns {number} - מספר רשומות
     * 
     * @example
     * const totalTrades = StatisticsCalculator.countRecords(trades);
     * const openTrades = StatisticsCalculator.countRecords(trades, (t) => t.status === 'open');
     */
    static countRecords(data, filterFn = null) {
        if (!data || !Array.isArray(data)) {
            return 0;
        }
        
        if (filterFn && typeof filterFn === 'function') {
            return data.filter(filterFn).length;
        }
        
        return data.length;
    }

    /**
     * קבלת min ו-max של שדה
     * 
     * @param {Array} data - מערך נתונים
     * @param {string|Function} field - שם השדה או פונקציה
     * @returns {Object} - { min, max }
     * 
     * @example
     * const { min, max } = StatisticsCalculator.getMinMax(trades, 'price');
     */
    static getMinMax(data, field) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { min: null, max: null };
        }
        
        const values = data.map(item => {
            let value;
            
            if (typeof field === 'function') {
                value = field(item);
            } else {
                value = item[field];
            }
            
            return parseFloat(value);
        }).filter(v => !isNaN(v));
        
        if (values.length === 0) {
            return { min: null, max: null };
        }
        
        return {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }

    /**
     * קיבוץ נתונים לפי שדה
     * 
     * @param {Array} data - מערך נתונים
     * @param {string|Function} field - שדה לקיבוץ או פונקציה
     * @returns {Object} - אובייקט עם מפתחות לפי ערכי השדה
     * 
     * @example
     * const byStatus = StatisticsCalculator.groupBy(trades, 'status');
     * // { open: [...], closed: [...] }
     */
    static groupBy(data, field) {
        if (!data || !Array.isArray(data)) {
            return {};
        }
        
        return data.reduce((groups, item) => {
            let key;
            
            if (typeof field === 'function') {
                key = field(item);
            } else {
                key = item[field];
            }
            
            if (!groups[key]) {
                groups[key] = [];
            }
            
            groups[key].push(item);
            return groups;
        }, {});
    }

    /**
     * חישוב סטטיסטיקות מלאות
     * 
     * @param {Array} data - מערך נתונים
     * @param {Object} config - הגדרות: { sumFields: [], avgFields: [], countBy: {}, groupBy: '' }
     * @returns {Object} - אובייקט עם כל הסטטיסטיקות
     * 
     * @example
     * const stats = StatisticsCalculator.calculateFullStatistics(trades, {
     *   sumFields: ['total_pl', 'quantity'],
     *   avgFields: ['price'],
     *   countBy: {
     *     'open': (t) => t.status === 'open',
     *     'closed': (t) => t.status === 'closed'
     *   },
     *   groupBy: 'status'
     * });
     */
    static calculateFullStatistics(data, config = {}) {
        const stats = {
            total: data ? data.length : 0,
            sums: {},
            averages: {},
            counts: {},
            groups: {}
        };
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            return stats;
        }
        
        // חישוב סכומים
        if (config.sumFields && Array.isArray(config.sumFields)) {
            config.sumFields.forEach(field => {
                stats.sums[field] = this.calculateSum(data, field);
            });
        }
        
        // חישוב ממוצעים
        if (config.avgFields && Array.isArray(config.avgFields)) {
            config.avgFields.forEach(field => {
                stats.averages[field] = this.calculateAverage(data, field);
            });
        }
        
        // ספירות מותנות
        if (config.countBy && typeof config.countBy === 'object') {
            for (const [key, filterFn] of Object.entries(config.countBy)) {
                stats.counts[key] = this.countRecords(data, filterFn);
            }
        }
        
        // קיבוצים
        if (config.groupBy) {
            stats.groups = this.groupBy(data, config.groupBy);
        }
        
        return stats;
    }

    /**
     * עדכון אלמנטים ב-DOM עם סטטיסטיקות
     * 
     * @param {Object} stats - אובייקט סטטיסטיקות
     * @param {Object} elementMap - מיפוי: { statKey: 'elementId' }
     * 
     * @example
     * StatisticsCalculator.updateDOMElements({
     *   total: 150,
     *   'counts.open': 100,
     *   'sums.total_pl': 5000.50
     * }, {
     *   total: 'totalTrades',
     *   'counts.open': 'openTrades',
     *   'sums.total_pl': 'totalProfit'
     * });
     */
    static updateDOMElements(stats, elementMap) {
        for (const [statKey, elementId] of Object.entries(elementMap)) {
            const element = document.getElementById(elementId);
            if (!element) {
                console.warn(`⚠️ אלמנט ${elementId} לא נמצא`);
                continue;
            }
            
            // חילוץ ערך מהסטטיסטיקות (תמיכה ב-nested keys)
            let value = stats;
            const keys = statKey.split('.');
            for (const key of keys) {
                value = value?.[key];
                if (value === undefined) break;
            }
            
            // עדכון האלמנט
            if (value !== undefined && value !== null) {
                // פורמט מספר אם צריך
                if (typeof value === 'number') {
                    element.textContent = value.toLocaleString('he-IL');
                } else {
                    element.textContent = value;
                }
            } else {
                element.textContent = '-';
            }
        }
    }
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.StatisticsCalculator = StatisticsCalculator;

// Shortcuts למתודות נפוצות
window.calculateSum = (data, field) => StatisticsCalculator.calculateSum(data, field);
window.calculateAverage = (data, field) => StatisticsCalculator.calculateAverage(data, field);
window.countRecords = (data, filterFn) => StatisticsCalculator.countRecords(data, filterFn);
window.getMinMax = (data, field) => StatisticsCalculator.getMinMax(data, field);
window.groupByField = (data, field) => StatisticsCalculator.groupBy(data, field);
window.calculateFullStatistics = (data, config) => StatisticsCalculator.calculateFullStatistics(data, config);

// ========================================================================
// Business Logic API Wrappers
// ========================================================================

/**
 * Calculate statistics using backend business logic service.
 * @param {string} calculationType - Type of calculation (kpi, summary, average, position, portfolio)
 * @param {Array} records - Array of data records
 * @param {Object} params - Additional parameters
 * @returns {Promise<Object>} Calculated statistics
 */
async function calculateStatisticsViaAPI(calculationType, records, params = {}) {
    try {
        const response = await fetch('/api/business/statistics/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                calculation_type: calculationType,
                data: records,
                params: params
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success' && result.data) {
            return result.data;
        } else {
            throw new Error(result.error?.message || 'Invalid calculation result');
        }
    } catch (error) {
        console.error('❌ Error calculating statistics via API:', error);
        // Fallback to local calculation
        return StatisticsCalculator.calculateFullStatistics(records, params);
    }
}

/**
 * Calculate sum using backend business logic service.
 * @param {Array} records - Array of data records
 * @param {string} field - Field name to sum
 * @returns {Promise<number>} Sum value
 */
async function calculateSumViaAPI(records, field) {
    try {
        const response = await fetch('/api/business/statistics/calculate_sum', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: records,
                field: field
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success' && result.data) {
            return result.data.sum || 0;
        } else {
            throw new Error(result.error?.message || 'Invalid calculation result');
        }
    } catch (error) {
        console.error('❌ Error calculating sum via API:', error);
        // Fallback to local calculation
        return StatisticsCalculator.calculateSum(records, field);
    }
}

/**
 * Calculate average using backend business logic service.
 * @param {Array} records - Array of data records
 * @param {string} field - Field name to average
 * @returns {Promise<number>} Average value
 */
async function calculateAverageViaAPI(records, field) {
    try {
        const response = await fetch('/api/business/statistics/calculate_average', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: records,
                field: field
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success' && result.data) {
            return result.data.average || 0;
        } else {
            throw new Error(result.error?.message || 'Invalid calculation result');
        }
    } catch (error) {
        console.error('❌ Error calculating average via API:', error);
        // Fallback to local calculation
        return StatisticsCalculator.calculateAverage(records, field);
    }
}

/**
 * Count records using backend business logic service.
 * @param {Array} records - Array of data records
 * @returns {Promise<number>} Count value
 */
async function countRecordsViaAPI(records) {
    try {
        const response = await fetch('/api/business/statistics/count_records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                data: records
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === 'success' && result.data) {
            return result.data.count || 0;
        } else {
            throw new Error(result.error?.message || 'Invalid calculation result');
        }
    } catch (error) {
        console.error('❌ Error counting records via API:', error);
        // Fallback to local calculation
        return StatisticsCalculator.countRecords(records);
    }
}

// Export API wrappers to global scope
window.calculateStatisticsViaAPI = calculateStatisticsViaAPI;
window.calculateSumViaAPI = calculateSumViaAPI;
window.calculateAverageViaAPI = calculateAverageViaAPI;
window.countRecordsViaAPI = countRecordsViaAPI;


