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
            window.Logger?.warn('[ConditionsCRUDManager] Unsupported entity type, defaulting to plan', { entityType }, { page: 'conditions-crud-manager' });
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
        const entityLabel = this.translator.getMessage('condition_entity_label') || 'תנאי';
        try {
            this.logEvent('create-start', { entityId, conditionData });
            const entityField = this.entityType === 'plan' ? 'trade_plan_id' : 'trade_id';
            const conditionWithContext = {
                ...conditionData,
                [entityField]: entityId
            };

            const validation = this.validator.validateForCreation(conditionWithContext);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            const preparedData = this.prepareConditionData(conditionWithContext);
            const baseUrl = this.getBaseUrl();
            const entitySegment = this.entityType === 'plan' ? 'trade-plans' : 'trades';
            const endpoint = `${baseUrl}/${entitySegment}/${entityId}/conditions`;

            let payload;

            const json = await this.requestJson(endpoint, {
                method: 'POST',
                body: preparedData
            });
            payload = json.data ?? json;

            this.clearCache(this.getCacheKey(entityId));
            this.logEvent('create-success', { entityId, conditionId: payload?.id });
            return this.translator.translateCondition(payload, this.entityType);
        } catch (error) {
            window.Logger?.error('[ConditionsCRUDManager] Error creating condition', { error: error?.message, stack: error?.stack, entityId }, { page: 'conditions-crud-manager' });
            this.logEvent('create-error', { entityId, error: error?.message });
            throw error;
        }
    }

    /**
     * Read conditions
     */
    async readConditions(entityId, useCache = true) {
        try {
            this.logEvent('read-start', { entityId, useCache });
            const cacheKey = this.getCacheKey(entityId);

            if (useCache && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    this.logEvent('read-cache-hit', { entityId });
                    return cached.data;
                }
            }

            const baseUrl = this.getBaseUrl();
            const entitySegment = this.entityType === 'plan' ? 'trade-plans' : 'trades';

            const json = await this.requestJson(
                `${baseUrl}/${entitySegment}/${entityId}/conditions`,
                { method: 'GET' }
            );

            const translated = (json.data || []).map(condition =>
                this.translator.translateCondition(condition, this.entityType)
            );

            if (translated.length > 0) {
                this.cache.set(cacheKey, {
                    data: translated,
                    timestamp: Date.now()
                });
                this.logEvent('read-success', { entityId, count: translated.length, cached: true });
            } else if (this.cache.has(cacheKey)) {
                this.cache.delete(cacheKey);
                this.logEvent('read-success', { entityId, count: 0, cached: false });
            }

            return translated;
        } catch (error) {
            window.Logger?.error('[ConditionsCRUDManager] Error reading conditions', { error: error?.message, stack: error?.stack, entityId }, { page: 'conditions-crud-manager' });
            this.logEvent('read-error', { entityId, error: error?.message });
            throw error;
        }
    }

    /**
     * Update condition
     */
    async updateCondition(conditionId, conditionData, entityId = null) {
        try {
            this.logEvent('update-start', { conditionId, entityId });
            const entityField = this.entityType === 'plan' ? 'trade_plan_id' : 'trade_id';
            const conditionWithContext = {
                ...conditionData,
                id: conditionId
            };

            if (entityId !== null) {
                conditionWithContext[entityField] = entityId;
            }

            const validation = this.validator.validateForUpdate(conditionWithContext);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            const preparedData = this.prepareConditionData(conditionWithContext);
            const baseUrl = this.getBaseUrl();
            const endpoint = `${baseUrl}/${conditionId}`;
            const entityLabel = this.translator.getMessage('condition_entity_label') || 'תנאי';

            let payload;

            const json = await this.requestJson(endpoint, {
                method: 'PUT',
                body: preparedData
            });
            payload = json.data ?? json;

            if (entityId !== null) {
                this.clearCache(this.getCacheKey(entityId));
            } else {
                this.clearCache();
            }

            this.logEvent('update-success', { conditionId, entityId });
            return this.translator.translateCondition(payload, this.entityType);
        } catch (error) {
            window.Logger?.error('[ConditionsCRUDManager] Error updating condition', { error: error?.message, stack: error?.stack, conditionId, entityId }, { page: 'conditions-crud-manager' });
            this.logEvent('update-error', { conditionId, entityId, error: error?.message });
            throw error;
        }
    }

    /**
     * Delete condition
     */
    async deleteCondition(conditionId, entityId = null) {
        try {
            this.logEvent('delete-start', { conditionId, entityId });
            const confirmed = await this.confirmDeletion();
            if (!confirmed) {
                this.logEvent('delete-cancelled', { conditionId });
                return false;
            }

            const baseUrl = this.getBaseUrl();
            const endpoint = `${baseUrl}/${conditionId}`;
            const entityLabel = this.translator.getMessage('condition_entity_label') || 'תנאי';

            if (window.CRUDResponseHandler?.handleDeleteResponse) {
                const response = await fetch(endpoint, {
                    method: 'DELETE'
                });

                const serviceSuccess = await window.CRUDResponseHandler.handleDeleteResponse(response, {
                    entityName: entityLabel,
                    successMessage: this.translator.getMessage('condition_deleted'),
                    reloadFn: async () => {}
                });

                if (!serviceSuccess) {
                    if (entityId !== null) {
                        this.clearCache(this.getCacheKey(entityId));
                    } else {
                        this.clearCache();
                    }
                    const error = new Error(this.translator.getMessage('condition_delete_error'));
                    error.silent = true;
                    error.forceRefresh = true;
                    throw error;
                }
            } else {
                await this.requestJson(endpoint, { method: 'DELETE' });
            }

            if (entityId !== null) {
                this.clearCache(this.getCacheKey(entityId));
            } else {
                this.clearCache();
            }

            this.logEvent('delete-success', { conditionId, entityId });
            return true;
        } catch (error) {
            window.Logger?.error('[ConditionsCRUDManager] Error deleting condition', { error: error?.message, stack: error?.stack, conditionId, entityId }, { page: 'conditions-crud-manager' });
            this.logEvent('delete-error', { conditionId, entityId, error: error?.message });
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

            const json = await this.requestJson('/api/trading-methods/?include_parameters=true', { method: 'GET' });

            const translatedMethods = (json.data || []).map(method =>
                this.translator.translateMethod(method)
            );

            if (translatedMethods.length > 0) {
                this.cache.set(cacheKey, {
                    data: translatedMethods,
                    timestamp: Date.now()
                });
            } else if (this.cache.has(cacheKey)) {
                this.cache.delete(cacheKey);
            }

            return translatedMethods;
        } catch (error) {
            window.Logger?.error('[ConditionsCRUDManager] Error getting trading methods', { error: error?.message, stack: error?.stack }, { page: 'conditions-crud-manager' });
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

            if (window.CRUDResponseHandler?.handleSaveResponse) {
                const response = await fetch('/api/alerts/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(preparedAlertData)
                });

                const result = await window.CRUDResponseHandler.handleSaveResponse(response, {
                    entityName: this.translator.getMessage('condition_entity_label') || 'תנאי',
                    successMessage: 'התראה נוצרה בהצלחה',
                    reloadFn: async () => {}
                });

                if (!result) {
                    const error = new Error('שגיאה ביצירת התראה');
                    error.silent = true;
                    throw error;
                }

                return result.data ?? result;
            }

            const json = await this.requestJson('/api/alerts/', {
                method: 'POST',
                body: preparedAlertData
            });

            return json.data ?? json;
        } catch (error) {
            window.Logger?.error('[ConditionsCRUDManager] Error creating alert', { error: error?.message, stack: error?.stack, conditionId }, { page: 'conditions-crud-manager' });
            throw error;
        }
    }

    /**
     * Get condition by ID
     */
    async getConditionById(conditionId) {
        const baseUrl = this.getBaseUrl();
        const json = await this.requestJson(`${baseUrl}/${conditionId}`, { method: 'GET' });
        return this.translator.translateCondition(json.data ?? json, this.entityType);
    }

    prepareConditionData(conditionData) {
        const prepared = { ...conditionData };

        if (prepared.parameters_json && typeof prepared.parameters_json === 'object') {
            prepared.parameters_json = JSON.stringify(prepared.parameters_json);
        }

        if (prepared.method_id !== undefined && prepared.method_id !== null) {
            const methodId = parseInt(prepared.method_id, 10);
            prepared.method_id = Number.isNaN(methodId) ? null : methodId;
        }

        if (prepared.is_active !== undefined) {
            prepared.is_active = Boolean(prepared.is_active);
        }

        if (prepared.condition_group !== undefined) {
            prepared.condition_group = parseInt(prepared.condition_group, 10) || 0;
        }

        if (prepared.trade_plan_id !== undefined && prepared.trade_plan_id !== null) {
            const planId = parseInt(prepared.trade_plan_id, 10);
            prepared.trade_plan_id = Number.isNaN(planId) ? null : planId;
        }

        if (prepared.trade_id !== undefined && prepared.trade_id !== null) {
            const tradeId = parseInt(prepared.trade_id, 10);
            prepared.trade_id = Number.isNaN(tradeId) ? null : tradeId;
        }

        if (prepared.id !== undefined && prepared.id !== null) {
            const conditionId = parseInt(prepared.id, 10);
            prepared.id = Number.isNaN(conditionId) ? null : conditionId;
        }

        return prepared;
    }

    async requestJson(endpoint, { method = 'GET', body = null } = {}) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        let response;
        try {
            window.Logger?.info?.(
                '[ConditionsCRUDManager] requestJson -> fetch',
                { endpoint, method, hasBody: Boolean(body) },
                { page: 'conditions-crud-manager' }
            );
            this.logEvent('request-start', { endpoint, method });
            response = await fetch(endpoint, options);
        } catch (networkError) {
            window.Logger?.error('[ConditionsCRUDManager] Network error during request', { endpoint, method, error: networkError?.message }, { page: 'conditions-crud-manager' });
            this.logEvent('request-network-error', { endpoint, method, error: networkError?.message });
            throw new Error(networkError?.message || 'שגיאה ברשת בעת פנייה לשרת');
        }
        let json;

        try {
            json = await response.json();
        } catch (error) {
            window.Logger?.error('[ConditionsCRUDManager] Failed parsing JSON response', { endpoint, method, status: response.status, error: error?.message }, { page: 'conditions-crud-manager' });
            throw new Error(`Invalid response from server (status ${response.status})`);
        }

        const success = json?.status === 'success' || json?.success === true || response.ok;

        window.Logger?.info?.(
            '[ConditionsCRUDManager] requestJson <- response',
            { endpoint, method, status: response.status, success },
            { page: 'conditions-crud-manager' }
        );
        this.logEvent('request-response', { endpoint, method, status: response.status, success });

        if (!success) {
            const message = json?.message || json?.error || `Request failed with status ${response.status}`;
            const error = new Error(message);
            error.response = json;
            error.status = response.status;
            this.logEvent('request-error', { endpoint, method, status: response.status, message });
            throw error;
        }

        return json;
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

    logEvent(action, details = {}) {
        const payload = {
            action,
            entityType: this.entityType,
            timestamp: Date.now(),
            ...details
        };
        window.Logger?.info?.('[ConditionsCRUD] Event', payload, { page: 'conditions-crud-manager' });
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





