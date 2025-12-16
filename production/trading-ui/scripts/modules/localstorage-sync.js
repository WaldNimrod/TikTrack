/**
 * LocalStorage Sync - TikTrack
 * ==============================
 * 
 * LocalStorage-based synchronization for multi-tab support.
 * Uses storage events to sync cache invalidation between tabs instantly.
 * 
 * Benefits:
 * - Instant updates between tabs (no 10s delay!)
 * - No server communication needed
 * - Works offline
 * - Simple and reliable
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @created January 2025
 */

class LocalStorageSync {
    constructor() {
        this.eventKey = 'tiktrack_cache_invalidation';
        this.eventCount = 0;
        this.setupListener();
    }

    /**
     * Setup storage event listener for multi-tab sync
     */
    setupListener() {
        // Storage events are fired when another tab/window changes localStorage
        // Note: NOT fired in the tab that made the change!
        window.addEventListener('storage', async (event) => {
            // Check if it's our cache invalidation event
            if (event.key === this.eventKey) {
                try {
                    const data = JSON.parse(event.newValue || '{}');
                    const { keys, timestamp, source } = data;
                    
                    // Invalidate cache in this tab
                    await this.handleCacheInvalidation(keys);
                    
                    this.eventCount++;
                    
                } catch (error) {
                    console.error('❌ Error processing localStorage sync event:', error);
                }
            }
        });
        
    }

    /**
     * Handle cache invalidation event from another tab
     * @param {Array<string>} keys - Cache keys to invalidate
     */
    async handleCacheInvalidation(keys) {
        try {
            // Remove from UnifiedCacheManager
            if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
                for (const key of keys) {
                    await window.UnifiedCacheManager.remove(key);
                }
            } else {
                console.warn('⚠️ UnifiedCacheManager not available');
                return;
            }
            
            // Refresh current page data
            if (window.PollingManager && window.PollingManager.refreshCurrentPageData) {
                await window.PollingManager.refreshCurrentPageData(keys);
            }
            
            // Show subtle notification
            if (window.notificationSystem) {
                window.notificationSystem.showNotification(
                    `עודכנו ${keys.length} רשומות (סנכרון בין-טאבים)`,
                    'info',
                    'cache'
                );
            }
            
        } catch (error) {
            console.error('❌ Error handling cache invalidation:', error);
        }
    }

    /**
     * Broadcast cache invalidation to other tabs
     * @param {Array<string>} keys - Cache keys to invalidate
     * @param {string} source - Source of invalidation (for logging)
     */
    static broadcast(keys, source = 'manual') {
        try {
            const eventData = {
                keys: keys,
                timestamp: new Date().toISOString(),
                source: source
            };
            
            // Set in localStorage (triggers 'storage' event in OTHER tabs)
            localStorage.setItem('tiktrack_cache_invalidation', JSON.stringify(eventData));
            
            // Clear immediately so next change will trigger event again
            setTimeout(() => {
                localStorage.removeItem('tiktrack_cache_invalidation');
            }, 100);
            
        } catch (error) {
            console.error('❌ Error broadcasting to other tabs:', error);
        }
    }

    /**
     * Get statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            eventCount: this.eventCount,
            eventKey: this.eventKey,
            listenerActive: true
        };
    }
}

// Global instance
window.LocalStorageSync = new LocalStorageSync();

