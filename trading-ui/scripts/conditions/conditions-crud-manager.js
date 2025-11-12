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
        this.baseUrls = {
            plan: '/api/plan-conditions',
            trade: '/api/trade-conditions'
        };
        this.entityType = 'plan';
        this.validator = window.conditionsValidator;
        this.translator = window.conditionsTranslations;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    setContext({ entityType = 'plan' } = {}) {
        if (!this.baseUrls[entityType]) {
            console.warn(`[ConditionsCRUDManager] Unsupported entity type "${entityType}", defaulting to "plan"`);
            this.entityType = 'plan';
            return;
        }
        this.entityType = entityType;
    }

    getBaseUrl() {
        return this.baseUrls[this.entityType] || this.baseUrls.plan;
    }

    getCacheKey(entityId) {
        return `conditions_${this.entityType}_${entityId}`;
    }

    /**
     * Create new condition
     */
    async createCondition(entityId, conditionData) {
        try {
            const validation = this.validator.validateForCreation(conditionData);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            const preparedData = this.prepareConditionData(conditionData);
            const baseUrl = this.getBaseUrl();
            const entitySegment = this.entityType === 'plan' ? 'trade-plans' : 'trades';

            const response = await this.makeApiCall(
                `${baseUrl}/${entitySegment}/${entityId}/conditions`,
                'POST',
                preparedData
            );

            if (!response.success) {
                throw new Error(response.message || 'Failed to create condition');
            }

            this.clearCache(this.getCacheKey(entityId));
            this.showNotification(this.translator.getMessage('condition_created'), 'success');

            return this.translator.translateCondition(response.data, this.entityType);
        } catch (error) {
            console.error('Error creating condition:', error);
            this.showNotification(`שגיאה ביצירת תנאי: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Read conditions
     */
    async readConditions(entityId, useCache = true) {
        try {
            const cacheKey = this.getCacheKey(entityId);

            if (useCache && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            const baseUrl = this.getBaseUrl();
            const entitySegment = this.entityType === 'plan' ? 'trade-plans' : 'trades';

            const response = await this.makeApiCall(
                `${baseUrl}/${entitySegment}/${entityId}/conditions`,
                'GET'
            );

            if (!response.success) {
                throw new Error(response.message || 'Failed to read conditions');
            }

            const translated = (response.data || []).map(condition =>
                this.translator.translateCondition(condition, this.entityType)
            );

            this.cache.set(cacheKey, {
                data: translated,
                timestamp: Date.now()
            });

            return translated;
        } catch (error) {
            console.error('Error reading conditions:', error);
            this.showNotification(`שגיאה בקריאת תנאים: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Update condition
     */
    async updateCondition(conditionId, conditionData, entityId = null) {
        try {
            const validation = this.validator.validateForUpdate(conditionData);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            const preparedData = this.prepareConditionData(conditionData);
            const baseUrl = this.getBaseUrl();

            const response = await this.makeApiCall(
                `${baseUrl}/${conditionId}`,
                'PUT',
                preparedData
            );

            if (!response.success) {
                throw new Error(response.message || 'Failed to update condition');
            }

            if (entityId !== null) {
                this.clearCache(this.getCacheKey(entityId));
            } else {
                this.clearCache();
            }

            this.showNotification(this.translator.getMessage('condition_updated'), 'success');
            return this.translator.translateCondition(response.data, this.entityType);
        } catch (error) {
            console.error('Error updating condition:', error);
            this.showNotification(`שגיאה בעדכון תנאי: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Delete condition
     */
    async deleteCondition(conditionId, entityId = null) {
        try {
            const confirmed = await this.confirmDeletion();
            if (!confirmed) {
                return false;
            }

            const baseUrl = this.getBaseUrl();
            const response = await this.makeApiCall(
                `${baseUrl}/${conditionId}`,
                'DELETE'
            );

            if (!response.success) {
                throw new Error(response.message || 'Failed to delete condition');
            }

            if (entityId !== null) {
                this.clearCache(this.getCacheKey(entityId));
            } else {
                this.clearCache();
            }

            this.showNotification(this.translator.getMessage('condition_deleted'), 'success');
            return true;
        } catch (error) {
            console.error('Error deleting condition:', error);
            this.showNotification(`שגיאה במחיקת תנאי: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Get trading methods
     */
    async getTradingMethods(useCache = true) {
        try {
            const cacheKey = 'trading_methods';

            if (useCache && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            const response = await fetch('/api/trading-methods/?include_parameters=true')
                .then(res => res.json())
                .catch(error => {
                    throw new Error(error?.message || 'Network error fetching trading methods');
                });

            if (response.status !== 'success') {
                throw new Error(response?.message || response?.error || 'Failed to get trading methods');
            }

            const translatedMethods = (response.data || []).map(method =>
                this.translator.translateMethod(method)
            );

            this.cache.set(cacheKey, {
                data: translatedMethods,
                timestamp: Date.now()
            });

            return translatedMethods;
        } catch (error) {
            console.error('Error getting trading methods:', error);
            this.showNotification(`שגיאה בקבלת שיטות מסחר: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Create alert from condition
     */
    async createAlertFromCondition(conditionId, alertData = {}) {
        try {
            const condition = await this.getConditionById(conditionId);
            if (!condition) {
                throw new Error('Condition not found');
            }

            const preparedAlertData = {
                title: alertData.title || `Alert for ${condition.method_name}`,
                message: alertData.message || `Condition triggered: ${condition.method_name}`,
                type: alertData.type || 'info',
                related_id: conditionId,
                related_type: 'condition',
                is_active: true,
                ...alertData
            };

            const response = await this.makeApiCall(
                '/api/alerts/',
                'POST',
                preparedAlertData
            );

            if (!response.success) {
                throw new Error(response.message || 'Failed to create alert');
            }

            this.showNotification('התראה נוצרה בהצלחה', 'success');
            return response.data;
        } catch (error) {
            console.error('Error creating alert:', error);
            this.showNotification(`שגיאה ביצירת התראה: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Get condition by ID
     */
    async getConditionById(conditionId) {
        const baseUrl = this.getBaseUrl();
        const response = await this.makeApiCall(
            `${baseUrl}/${conditionId}`,
            'GET'
        );

        if (!response.success) {
            throw new Error(response.message || 'Failed to get condition');
        }

        return this.translator.translateCondition(response.data, this.entityType);
    }

    prepareConditionData(conditionData) {
        const prepared = { ...conditionData };

        if (prepared.parameters_json && typeof prepared.parameters_json === 'object') {
            prepared.parameters_json = JSON.stringify(prepared.parameters_json);
        }

        if (prepared.is_active !== undefined) {
            prepared.is_active = Boolean(prepared.is_active);
        }

        if (prepared.condition_group !== undefined) {
            prepared.condition_group = parseInt(prepared.condition_group, 10) || 0;
        }

        return prepared;
    }

    async makeApiCall(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(endpoint, options);
            const json = await response.json();
            const success = json?.status === 'success' || json?.success === true || response.ok;
            const payload = json?.data !== undefined ? json.data : json;

            if (!success) {
                const message = json?.message || json?.error || `Request failed with status ${response.status}`;
                return {
                    success: false,
                    data: payload,
                    message,
                    status: response.status
                };
            }

            return {
                success: true,
                data: payload,
                message: json?.message,
                status: response.status
            };
        } catch (error) {
            console.error(`API call failed (${method} ${endpoint}):`, error);
            return {
                success: false,
                data: null,
                message: error.message,
                status: 0
            };
        }
    }

    async confirmDeletion() {
        if (window.showConfirmDialog) {
            return window.showConfirmDialog(this.translator.getMessage('confirm_delete'));
        }
        if (window.confirm && typeof window.confirm === 'function') {
            return window.confirm(this.translator.getMessage('confirm_delete'));
        }
        return true;
    }

    showNotification(message, type = 'info') {
        if (window.showNotification && typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else if (window.notificationSystem && window.notificationSystem.showNotification) {
            window.notificationSystem.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    getCachedTradingMethods() {
        const cached = this.cache.get('trading_methods');
        return cached?.data || [];
    }

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

    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            oldestEntry: this.getOldestCacheEntry(),
            newestEntry: this.getNewestCacheEntry()
        };
    }

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





