/**
 * Central Refresh System - TikTrack
 * =================================
 * 
 * מערכת מרכזית לעדכון אחרי פעולות CRUD
 * מחליפה לוגיקה זהה ב-18 פונקציות save/update/delete
 * 
 * @version 1.0.0
 * @created October 2025
 * @author TikTrack Development Team
 */

class CentralRefreshSystem {
    constructor() {
        this.initialized = false;
        this.entityLoadFunctions = new Map();
        this.setupEntityMappings();
    }

    /**
     * Setup entity load function mappings
     * הגדרת מיפוי פונקציות טעינה לכל ישות
     */
    setupEntityMappings() {
        // עמודי משתמש (13)
        this.entityLoadFunctions.set('trades', () => {
            if (typeof window.loadTradesData === 'function') {
                return window.loadTradesData();
            }
            return Promise.resolve();
        });

        this.entityLoadFunctions.set('trading_accounts', () => {
            if (typeof window.loadAccountsTable === 'function') {
                return window.loadAccountsTable();
            }
            return Promise.resolve();
        });

        this.entityLoadFunctions.set('executions', () => {
            if (typeof window.loadExecutionsData === 'function') {
                return window.loadExecutionsData();
            }
            return Promise.resolve();
        });

        this.entityLoadFunctions.set('cash_flows', () => {
            if (typeof window.loadCashFlowsData === 'function') {
                return window.loadCashFlowsData();
            }
            return Promise.resolve();
        });

        this.entityLoadFunctions.set('alerts', () => {
            if (typeof window.loadAlertsData === 'function') {
                return window.loadAlertsData();
            }
            return Promise.resolve();
        });

        this.entityLoadFunctions.set('tickers', () => {
            if (typeof window.loadTickersData === 'function') {
                return window.loadTickersData();
            }
            return Promise.resolve();
        });

        this.entityLoadFunctions.set('notes', () => {
            if (typeof window.loadNotesData === 'function') {
                return window.loadNotesData();
            }
            return Promise.resolve();
        });

        this.entityLoadFunctions.set('trade_plans', () => {
            if (typeof window.loadTradePlansData === 'function') {
                return window.loadTradePlansData();
            }
            return Promise.resolve();
        });

        this.entityLoadFunctions.set('research', () => {
            if (typeof window.loadResearchData === 'function') {
                return window.loadResearchData();
            }
            return Promise.resolve();
        });

        // עמוד ראשי
        this.entityLoadFunctions.set('dashboard', () => {
            if (typeof window.loadDashboardData === 'function') {
                return window.loadDashboardData();
            }
            return Promise.resolve();
        });

        // העדפות - טעינה מחדש של העמוד
        this.entityLoadFunctions.set('preferences', () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    window.location.reload();
                    resolve();
                }, 1000);
            });
        });
    }

    /**
     * Initialize the central refresh system
     * אתחול מערכת הרענון המרכזית
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            window.Logger.info('🔄 Initializing Central Refresh System...', { page: "central-refresh" });
            
            this.initialized = true;
            
            window.Logger.info('✅ Central Refresh System initialized successfully', { page: "central-refresh" });
            
        } catch (error) {
            window.Logger.error('❌ Failed to initialize Central Refresh System:', error, { page: "central-refresh" });
            throw error;
        }
    }

    /**
     * Show success notification and refresh entity data
     * הצגת הודעת הצלחה ורענון נתוני הישות
     * 
     * @param {string} entityType - סוג הישות (trades, alerts, etc.)
     * @param {string} successMessage - הודעת הצלחה
     * @param {Object} options - אפשרויות נוספות
     */
    async showSuccessAndRefresh(entityType, successMessage, options = {}) {
        try {
            // 1. Show success notification
            if (typeof window.showSuccessNotification === 'function') {
                window.showSuccessNotification('הצלחה', successMessage, 4000, 'business');
            }

            // 2. Clear relevant cache
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                // Clear entity-specific cache
                await this.clearEntityCache(entityType);
                
                // Clear user preferences cache if needed
                if (entityType === 'preferences') {
                    await window.UnifiedCacheManager.refreshUserPreferences();
                }
            }

            // 3. Refresh entity data
            await this.refreshEntityData(entityType);

            // 4. Additional actions if specified
            if (options.onSuccess && typeof options.onSuccess === 'function') {
                await options.onSuccess();
            }

            window.Logger.info(`✅ Success and refresh completed for ${entityType}`, { page: "central-refresh" });

        } catch (error) {
            window.Logger.error(`❌ Error in showSuccessAndRefresh for ${entityType}:`, error, { page: "central-refresh" });
            
            // Show error notification
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', `שגיאה בעדכון ${entityType}: ${error.message}`);
            }
        }
    }

    /**
     * Clear entity-specific cache
     * ניקוי מטמון ספציפי לישות
     * 
     * @param {string} entityType - סוג הישות
     */
    async clearEntityCache(entityType) {
        try {
            if (!window.UnifiedCacheManager || !window.UnifiedCacheManager.initialized) {
                return;
            }

            // Clear entity-specific cache patterns
            const cachePatterns = this.getEntityCachePatterns(entityType);
            
            for (const pattern of cachePatterns) {
                await window.UnifiedCacheManager.clear(pattern);
            }

            window.Logger.info(`✅ Cleared cache for ${entityType}`, { page: "central-refresh" });

        } catch (error) {
            window.Logger.warn(`⚠️ Failed to clear cache for ${entityType}:`, error, { page: "central-refresh" });
        }
    }

    /**
     * Get cache patterns for entity
     * קבלת דפוסי מטמון עבור ישות
     * 
     * @param {string} entityType - סוג הישות
     * @returns {Array<string>} Cache patterns
     */
    getEntityCachePatterns(entityType) {
        const patterns = {
            'trades': ['trades_*', 'trade_*', 'all_trades_*'],
            'trading_accounts': ['accounts_*', 'trading_accounts_*', 'all_accounts_*'],
            'executions': ['executions_*', 'execution_*', 'all_executions_*'],
            'cash_flows': ['cash_flows_*', 'cash_flow_*', 'all_cash_flows_*'],
            'alerts': ['alerts_*', 'alert_*', 'all_alerts_*'],
            'tickers': ['tickers_*', 'ticker_*', 'all_tickers_*'],
            'notes': ['notes_*', 'note_*', 'all_notes_*'],
            'trade_plans': ['trade_plans_*', 'trade_plan_*', 'all_trade_plans_*'],
            'research': ['research_*', 'all_research_*'],
            'preferences': ['preference_*', 'all_preferences_*', 'user-preferences'],
            'dashboard': ['dashboard_*', 'overview_*', 'all_dashboard_*']
        };

        return patterns[entityType] || [`${entityType}_*`];
    }

    /**
     * Refresh entity data
     * רענון נתוני הישות
     * 
     * @param {string} entityType - סוג הישות
     */
    async refreshEntityData(entityType) {
        try {
            const loadFunction = this.entityLoadFunctions.get(entityType);
            
            if (loadFunction) {
                window.Logger.info(`🔄 Refreshing ${entityType} data...`, { page: "central-refresh" });
                await loadFunction();
                window.Logger.info(`✅ ${entityType} data refreshed successfully`, { page: "central-refresh" });
            } else {
                window.Logger.warn(`⚠️ No load function found for entity: ${entityType}`, { page: "central-refresh" });
            }

        } catch (error) {
            window.Logger.error(`❌ Failed to refresh ${entityType} data:`, error, { page: "central-refresh" });
            throw error;
        }
    }

    /**
     * Refresh all entities
     * רענון כל הישויות
     */
    async refreshAllEntities() {
        try {
            window.Logger.info('🔄 Refreshing all entities...', { page: "central-refresh" });
            
            const refreshPromises = Array.from(this.entityLoadFunctions.keys()).map(entityType => {
                return this.refreshEntityData(entityType).catch(error => {
                    window.Logger.warn(`⚠️ Failed to refresh ${entityType}:`, error, { page: "central-refresh" });
                });
            });

            await Promise.allSettled(refreshPromises);
            
            window.Logger.info('✅ All entities refresh completed', { page: "central-refresh" });

        } catch (error) {
            window.Logger.error('❌ Error refreshing all entities:', error, { page: "central-refresh" });
        }
    }
}

// ===== GLOBAL INSTANCE =====

// Create global instance
window.centralRefresh = new CentralRefreshSystem();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.centralRefresh.initialize();
    });
} else {
    window.centralRefresh.initialize();
}

// Export to global scope
window.CentralRefreshSystem = CentralRefreshSystem;

window.Logger.info('✅ Central Refresh System loaded successfully', { page: "central-refresh" });
