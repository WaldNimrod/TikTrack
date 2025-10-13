/**
 * Polling Manager - TikTrack
 * ===========================
 * 
 * Polling-based cache invalidation system.
 * Checks Backend every 10 seconds for cache changes (no Socket.IO needed!)
 * 
 * Simple, stable alternative to WebSocket for auto-invalidation.
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @created January 2025
 */

class PollingManager {
    constructor() {
        this.pollingInterval = null;
        this.pollingFrequency = 10000;  // 10 seconds
        this.lastCheckTime = null;
        this.isPolling = false;
        this.changeCount = 0;
        this.errorCount = 0;
        
        console.log('🔄 PollingManager initialized (not started yet)');
    }

    /**
     * Start polling for cache changes
     * @param {number} frequency - Polling frequency in milliseconds (default: 10000)
     */
    start(frequency = null) {
        if (this.isPolling) {
            console.log('ℹ️ Polling already running');
            return;
        }
        
        if (frequency) {
            this.pollingFrequency = frequency;
        }
        
        console.log(`🔄 Starting cache polling (every ${this.pollingFrequency / 1000} seconds)...`);
        
        // Initialize last check time to now
        this.lastCheckTime = new Date().toISOString();
        
        // Do first check immediately
        this.checkForChanges();
        
        // Start polling interval
        this.pollingInterval = setInterval(async () => {
            await this.checkForChanges();
        }, this.pollingFrequency);
        
        this.isPolling = true;
        console.log('✅ Polling started successfully');
    }

    /**
     * Stop polling
     */
    stop() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            this.isPolling = false;
            console.log('⏹️ Polling stopped');
        }
    }

    /**
     * Check for cache changes since last check
     */
    async checkForChanges() {
        try {
            // Build URL with timestamp
            const url = `/api/cache/changes?since=${encodeURIComponent(this.lastCheckTime)}`;
            
            // Fetch changes from Backend
            const response = await fetch(url);
            
            if (!response.ok) {
                this.errorCount++;
                console.warn(`⚠️ Failed to fetch cache changes (status: ${response.status})`);
                return;
            }
            
            const data = await response.json();
            const { changes, count, server_time } = data;
            
            // Update last check time to server time (ensures sync)
            this.lastCheckTime = server_time;
            
            // Process changes if any
            if (count > 0) {
                console.log(`📡 Polling: Received ${count} cache changes`);
                await this.handleCacheChanges(changes);
                this.errorCount = 0;  // Reset error count on success
            } else {
                // No changes - this is normal, don't log
            }
            
        } catch (error) {
            this.errorCount++;
            console.error('❌ Polling error:', error);
            
            // Show warning only after multiple failures
            if (this.errorCount >= 3 && window.notificationSystem) {
                window.notificationSystem.showNotification(
                    'בעיה בתקשורת עם השרת (פועל במצב אופליין)',
                    'warning',
                    'system'
                );
                this.errorCount = 0;  // Reset to avoid spam
            }
            
            // Don't stop polling on error - will retry next interval
        }
    }

    /**
     * Handle cache changes from Backend
     * @param {Array} changes - Array of change objects
     */
    async handleCacheChanges(changes) {
        try {
            // Collect all unique keys from all changes
            const allKeys = new Set();
            
            for (const change of changes) {
                const keys = change.keys || [];
                for (const key of keys) {
                    allKeys.add(key);
                }
            }
            
            if (allKeys.size === 0) {
                console.log('ℹ️ No keys to invalidate');
                return;
            }
            
            console.log(`🧹 Invalidating ${allKeys.size} unique cache keys:`, Array.from(allKeys));
            
            // Remove from UnifiedCacheManager
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
                for (const key of allKeys) {
                    await window.UnifiedCacheManager.remove(key);
                    console.log(`   ✅ Removed: ${key}`);
                }
            } else {
                console.warn('⚠️ UnifiedCacheManager not available');
            }
            
            // Refresh current page data (without reload!)
            await this.refreshCurrentPageData(Array.from(allKeys));
            
            // Update statistics
            this.changeCount += changes.length;
            
            // Show notification to user (subtle - only for info)
            if (window.notificationSystem) {
                window.notificationSystem.showNotification(
                    `עודכנו ${allKeys.size} רשומות (פולינג)`,
                    'info',
                    'cache'
                );
            }
            
        } catch (error) {
            console.error('❌ Error handling cache changes:', error);
        }
    }

    /**
     * Refresh current page data without full page reload
     * @param {Array<string>} invalidatedKeys - Keys that were invalidated
     */
    async refreshCurrentPageData(invalidatedKeys) {
        try {
            // Get current page name
            const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
            
            // Central mapping of pages to their load functions
            const loadFunctions = {
                // עמודי משתמש (13)
                'index': window.loadDashboardData,
                'trading_accounts': window.loadAccountsTable,
                'trades': window.loadTradesData,
                'trade_plans': window.loadTradePlansData,
                'executions': window.loadExecutionsData,
                'cash_flows': window.loadCashFlowsData,
                'alerts': window.loadAlertsData,
                'tickers': window.loadTickersData,
                'notes': window.loadNotesData,
                'research': window.loadResearchData,
                'preferences': null,  // no data loading needed
                'db_display': null,
                'db_extradata': null,
                
                // כלי פיתוח
                'cache-test': window.cacheTestPage?.loadCacheData,
                'system-management': null,
                'server-monitor': null,
                'background-tasks': null,
                'external-data-dashboard': null,
                'notifications-center': null
            };
            
            const loadFn = loadFunctions[currentPage];
            
            if (loadFn && typeof loadFn === 'function') {
                console.log(`🔄 Refreshing ${currentPage} data (polling update)...`);
                await loadFn();
                console.log('✅ Page data refreshed successfully');
            } else if (loadFn === null) {
                console.log(`ℹ️ Page ${currentPage} doesn't need data refresh`);
            } else {
                console.warn(`⚠️ No load function found for page: ${currentPage}`);
            }
            
        } catch (error) {
            console.error('❌ Error refreshing page data:', error);
        }
    }

    /**
     * Force immediate check (for testing or manual trigger)
     * @returns {Promise<boolean>} Success status
     */
    async checkNow() {
        console.log('🔄 Manual polling check triggered...');
        await this.checkForChanges();
        return true;
    }

    /**
     * Get polling statistics
     * @returns {Object} Statistics object
     */
    getStats() {
        return {
            isPolling: this.isPolling,
            frequency: this.pollingFrequency,
            frequencySeconds: this.pollingFrequency / 1000,
            lastCheck: this.lastCheckTime,
            changeCount: this.changeCount,
            errorCount: this.errorCount,
            nextCheckIn: this.isPolling ? `${this.pollingFrequency / 1000}s` : 'N/A'
        };
    }
}

// Global instance
window.PollingManager = new PollingManager();

console.log('✅ Polling Manager module loaded');

