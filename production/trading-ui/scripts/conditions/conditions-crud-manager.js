/**
 * Conditions CRUD Manager - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the conditions CRUD manager for TikTrack including:
 * - Condition creation, reading, updating, and deletion
 * - Data validation and preparation
 * - Cache management
 * - Error handling and notifications
 * - API integration
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

/**
 * Conditions CRUD Manager class
 * @class ConditionsCRUDManager
 */
class ConditionsCRUDManager {
    constructor() {
        this.baseUrl = '/api/plan-conditions';
        this.validator = window.conditionsValidator;
        this.translator = window.conditionsTranslations;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    /**
     * Create new condition
     * @function createCondition
     * @async
     * @param {number} tradePlanId - Trade plan ID
     * @param {Object} conditionData - Condition data
     * @returns {Promise<Object>} Created condition
     */
    async createCondition(tradePlanId, conditionData) {
        try {
            // Validate data
            const validation = this.validator.validateForCreation(conditionData);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Prepare data
            const preparedData = this.prepareConditionData(conditionData);
            
            // Make API call
            const response = await this.makeApiCall(
                `${this.baseUrl}/trade-plans/${tradePlanId}/conditions`,
                'POST',
                preparedData
            );
            
            if (response.success) {
                // Clear cache
                this.clearCache(`conditions_${tradePlanId}`);
                
                // Show success notification
                this.showNotification(
                    this.translator.getMessage('condition_created'),
                    'success'
                );
                
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to create condition');
            }
            
        } catch (error) {
            console.error('Error creating condition:', error);
            this.showNotification(
                `שגיאה ביצירת תנאי: ${error.message}`,
                'error'
            );
            throw error;
        }
    }
    
    /**
     * Read conditions
     * @function readConditions
     * @async
     * @param {number} tradePlanId - Trade plan ID
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Array>} Conditions array
     */
    async readConditions(tradePlanId, useCache = true) {
        try {
            const cacheKey = `conditions_${tradePlanId}`;
            
            // Check cache first
            if (useCache && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }
            
            // Make API call
            const response = await this.makeApiCall(
                `${this.baseUrl}/trade-plans/${tradePlanId}/conditions`,
                'GET'
            );
            
            if (response.success) {
                // Translate data
                const translatedData = response.data.map(condition => 
                    this.translator.translateCondition(condition)
                );
                
                // Cache result
                this.cache.set(cacheKey, {
                    data: translatedData,
                    timestamp: Date.now()
                });
                
                return translatedData;
            } else {
                throw new Error(response.message || 'Failed to read conditions');
            }
            
        } catch (error) {
            console.error('Error reading conditions:', error);
            this.showNotification(
                `שגיאה בקריאת תנאים: ${error.message}`,
                'error'
            );
            throw error;
        }
    }
    
    /**
     * Update condition
     * @function updateCondition
     * @async
     * @param {number} conditionId - Condition ID
     * @param {Object} conditionData - Condition data
     * @returns {Promise<Object>} Updated condition
     */
    async updateCondition(conditionId, conditionData) {
        try {
            // Validate data
            const validation = this.validator.validateForUpdate(conditionData);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Prepare data
            const preparedData = this.prepareConditionData(conditionData);
            
            // Make API call
            const response = await this.makeApiCall(
                `${this.baseUrl}/conditions/${conditionId}`,
                'PUT',
                preparedData
            );
            
            if (response.success) {
                // Clear cache
                this.clearCache();
                
                // Show success notification
                this.showNotification(
                    this.translator.getMessage('condition_updated'),
                    'success'
                );
                
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to update condition');
            }
            
        } catch (error) {
            console.error('Error updating condition:', error);
            this.showNotification(
                `שגיאה בעדכון תנאי: ${error.message}`,
                'error'
            );
            throw error;
        }
    }
    
    /**
     * Delete condition
     * @function deleteCondition
     * @async
     * @param {number} conditionId - Condition ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteCondition(conditionId) {
        try {
            // Confirm deletion
            const confirmed = await this.confirmDeletion();
            if (!confirmed) {
                return false;
            }
            
            // Make API call
            const response = await this.makeApiCall(
                `${this.baseUrl}/conditions/${conditionId}`,
                'DELETE'
            );
            
            if (response.success) {
                // Clear cache
                this.clearCache();
                
                // Show success notification
                this.showNotification(
                    this.translator.getMessage('condition_deleted'),
                    'success'
                );
                
                return true;
            } else {
                throw new Error(response.message || 'Failed to delete condition');
            }
            
        } catch (error) {
            console.error('Error deleting condition:', error);
            this.showNotification(
                `שגיאה במחיקת תנאי: ${error.message}`,
                'error'
            );
            throw error;
        }
    }
    
    /**
     * Get trading methods
     * @function getTradingMethods
     * @async
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Array>} Trading methods array
     */
    async getTradingMethods(useCache = true) {
        try {
            const cacheKey = 'trading_methods';
            
            // Check cache first
            if (useCache && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }
            
            // Make API call
            const response = await this.makeApiCall(
                '/api/trading-methods/',
                'GET'
            );
            
            if (response.success) {
                // Translate data
                const translatedData = response.data.map(method => 
                    this.translator.translateMethod(method)
                );
                
                // Cache result
                this.cache.set(cacheKey, {
                    data: translatedData,
                    timestamp: Date.now()
                });
                
                return translatedData;
            } else {
                throw new Error(response.message || 'Failed to get trading methods');
            }
            
        } catch (error) {
            console.error('Error getting trading methods:', error);
            this.showNotification(
                `שגיאה בקבלת שיטות מסחר: ${error.message}`,
                'error'
            );
            throw error;
        }
    }
    
    /**
     * Create alert from condition
     * @function createAlertFromCondition
     * @async
     * @param {number} conditionId - Condition ID
     * @param {Object} alertData - Alert data
     * @returns {Promise<Object>} Created alert
     */
    async createAlertFromCondition(conditionId, alertData = {}) {
        try {
            // Get condition data first
            const condition = await this.getConditionById(conditionId);
            if (!condition) {
                throw new Error('Condition not found');
            }
            
            // Prepare alert data
            const preparedAlertData = {
                title: alertData.title || `Alert for ${condition.method_name}`,
                message: alertData.message || `Condition triggered: ${condition.method_name}`,
                type: alertData.type || 'info',
                related_id: conditionId,
                related_type: 'condition',
                is_active: true,
                ...alertData
            };
            
            // Make API call
            const response = await this.makeApiCall(
                '/api/alerts/',
                'POST',
                preparedAlertData
            );
            
            if (response.success) {
                this.showNotification(
                    'התראה נוצרה בהצלחה',
                    'success'
                );
                
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to create alert');
            }
            
        } catch (error) {
            console.error('Error creating alert:', error);
            this.showNotification(
                `שגיאה ביצירת התראה: ${error.message}`,
                'error'
            );
            throw error;
        }
    }
    
    /**
     * Get condition by ID
     * @function getConditionById
     * @async
     * @param {number} conditionId - Condition ID
     * @returns {Promise<Object|null>} Condition object or null
     */
    async getConditionById(conditionId) {
        try {
            const response = await this.makeApiCall(
                `${this.baseUrl}/conditions/${conditionId}`,
                'GET'
            );
            
            if (response.success) {
                return this.translator.translateCondition(response.data);
            } else {
                throw new Error(response.message || 'Failed to get condition');
            }
            
        } catch (error) {
            console.error('Error getting condition:', error);
            throw error;
        }
    }
    
    /**
     * Prepare condition data
     * @function prepareConditionData
     * @param {Object} conditionData - Raw condition data
     * @returns {Object} Prepared condition data
     */
    prepareConditionData(conditionData) {
        const prepared = { ...conditionData };
        
        // Convert parameters to JSON string if needed
        if (prepared.parameters_json && typeof prepared.parameters_json === 'object') {
            prepared.parameters_json = JSON.stringify(prepared.parameters_json);
        }
        
        // Ensure boolean values
        if (prepared.is_active !== undefined) {
            prepared.is_active = Boolean(prepared.is_active);
        }
        
        // Ensure numeric values
        if (prepared.condition_group !== undefined) {
            prepared.condition_group = parseInt(prepared.condition_group) || 0;
        }
        
        return prepared;
    }
    
    /**
     * Make API call
     * @function makeApiCall
     * @async
     * @param {string} endpoint - API endpoint
     * @param {string} method - HTTP method
     * @param {Object|null} data - Request data
     * @returns {Promise<Object>} API response
     */
    async makeApiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            if (data && method !== 'GET') {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(endpoint, options);
            const result = await response.json();
            
            return {
                success: response.ok,
                data: result.data || result,
                message: result.message,
                status: response.status
            };
            
        } catch (error) {
            console.error('API call failed:', error);
            return {
                success: false,
                data: null,
                message: error.message,
                status: 0
            };
        }
    }
    
    /**
     * Confirm deletion
     * @function confirmDeletion
     * @async
     * @returns {Promise<boolean>} Confirmation result
     */
    async confirmDeletion() {
        return new Promise((resolve) => {
            if (window.confirm && typeof window.confirm === 'function') {
                resolve(window.confirm(this.translator.getMessage('confirm_delete')));
            } else {
                // Fallback for systems without confirm
                resolve(true);
            }
        });
    }
    
    /**
     * Show notification
     * @function showNotification
     * @param {string} message - Message key
     * @param {string} type - Notification type
     * @returns {void}
     */
    showNotification(message, type = 'info') {
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (window.notificationSystem && window.notificationSystem.showNotification) {
            window.notificationSystem.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    /**
     * Clear cache
     * @function clearCache
     * @param {string|null} pattern - Cache pattern
     * @returns {void}
     */
    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }
    
    /**
     * Get cache statistics
     * @function getCacheStats
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            oldestEntry: this.getOldestCacheEntry(),
            newestEntry: this.getNewestCacheEntry()
        };
    }
    
    /**
     * Get oldest cache entry
     * @function getOldestCacheEntry
     * @returns {Object|null} Oldest cache entry
     */
    getOldestCacheEntry() {
        let oldest = null;
        let oldestTime = Date.now();
        
        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp < oldestTime) {
                oldestTime = value.timestamp;
                oldest = key;
            }
        }
        
        return oldest;
    }
    
    /**
     * Get newest cache entry
     * @function getNewestCacheEntry
     * @returns {Object|null} Newest cache entry
     */
    getNewestCacheEntry() {
        let newest = null;
        let newestTime = 0;
        
        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp > newestTime) {
                newestTime = value.timestamp;
                newest = key;
            }
        }
        
        return newest;
    }
}

// ===== GLOBAL EXPORTS =====
window.ConditionsCRUDManager = ConditionsCRUDManager;

// Create global instance
window.conditionsCRUDManager = new ConditionsCRUDManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConditionsCRUDManager;
}





