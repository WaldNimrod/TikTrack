/**
 * Watch Lists Data Service - TikTrack
 * ===================================
 * 
 * שירות נתונים מאוחד ל-Watch Lists עם אינטגרציה מלאה ל-UnifiedCacheManager.
 * 
 * **MOCKUP MODE**: כל הנתונים הם mockup בלבד - אין API calls אמיתיים.
 * 
 * Responsibilities:
 * - Provide mockup data for watch lists
 * - Integrate with UnifiedCacheManager (mockup cache)
 * - CRUD operations (mockup - no API)
 * - Cache invalidation helpers
 * 
 * Related Documentation:
 * - documentation/04-FEATURES/WATCH_LIST/FRONTEND_SERVICES_SPEC.md
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * 
 * Function Index:
 * ==============
 * 
 * MOCKUP DATA:
 * - getMockupWatchLists() - Get mockup watch lists
 * - getMockupWatchListItems(listId) - Get mockup items for a list
 * - getMockupFlaggedTickers(color) - Get mockup flagged tickers
 * 
 * CACHE MANAGEMENT:
 * - saveWatchListsCache(data, options) - Save watch lists to cache
 * - invalidateWatchListsCache() - Invalidate watch lists cache
 * - clearWatchListsCache(patternOnly) - Clear watch lists cache
 * 
 * DATA LOADING:
 * - loadWatchListsData(options) - Load watch lists with cache support (mockup)
 * - loadWatchListItemsData(listId, options) - Load items for a list (mockup)
 * 
 * CRUD OPERATIONS (MOCKUP):
 * - createWatchList(payload, options) - Create new watch list (mockup)
 * - updateWatchList(listId, payload, options) - Update watch list (mockup)
 * - deleteWatchList(listId, options) - Delete watch list (mockup)
 * - addTickerToList(listId, payload, options) - Add ticker to list (mockup)
 * - updateWatchListItem(listId, itemId, payload, options) - Update item (mockup)
 * - removeTickerFromList(listId, itemId, options) - Remove ticker (mockup)
 * 
 * @version 1.0.0
 * @created 26 בנובמבר 2025
 * @author TikTrack Development Team
 */

(function watchListsDataService() {
    'use strict';

    const WATCH_LISTS_DATA_KEY = 'watch-lists-data';
    const WATCH_LIST_ITEMS_KEY = 'watch-list-items';
    const WATCH_LISTS_TTL = 60 * 1000; // 60 seconds
    const PAGE_LOG_CONTEXT = { page: 'watch-lists-data' };

    // ===== MOCKUP DATA =====

    /**
     * Get mockup watch lists
     * @returns {Array} Array of watch lists
     */
    function getMockupWatchLists() {
        return [
            {
                id: 1,
                name: 'מניות טכנולוגיה',
                icon: 'chart-line',
                color_hex: '#26baac',
                view_mode: 'table',
                display_order: 1,
                created_at: '2025-01-20T10:00:00Z',
                updated_at: '2025-01-20T10:00:00Z'
            },
            {
                id: 2,
                name: 'אנרגיה',
                icon: 'flame',
                color_hex: '#fc5a06',
                view_mode: 'cards',
                display_order: 2,
                created_at: '2025-01-21T10:00:00Z',
                updated_at: '2025-01-21T10:00:00Z'
            },
            {
                id: 3,
                name: 'קריפטו',
                icon: 'coins',
                color_hex: '#28a745',
                view_mode: 'compact',
                display_order: 3,
                created_at: '2025-01-22T10:00:00Z',
                updated_at: '2025-01-22T10:00:00Z'
            }
        ];
    }

    /**
     * Get mockup watch list items
     * @param {number} listId - Watch list ID
     * @returns {Array} Array of watch list items
     */
    function getMockupWatchListItems(listId) {
        const items = {
            1: [
                {
                    id: 1,
                    watch_list_id: 1,
                    ticker_id: 5,
                    ticker_symbol: 'AAPL',
                    ticker_name: 'Apple Inc.',
                    external_symbol: null,
                    external_name: null,
                    flag_color: '#26baac',
                    notes: 'מעקב אחר ביצועים',
                    display_order: 1,
                    price: 150.25,
                    change: 2.10,
                    change_percent: 1.42,
                    created_at: '2025-01-20T10:00:00Z'
                },
                {
                    id: 2,
                    watch_list_id: 1,
                    ticker_id: 12,
                    ticker_symbol: 'MSFT',
                    ticker_name: 'Microsoft Corporation',
                    external_symbol: null,
                    external_name: null,
                    flag_color: '#fc5a06',
                    notes: null,
                    display_order: 2,
                    price: 378.90,
                    change: -1.50,
                    change_percent: -0.39,
                    created_at: '2025-01-20T10:00:00Z'
                },
                {
                    id: 3,
                    watch_list_id: 1,
                    ticker_id: null,
                    ticker_symbol: null,
                    external_symbol: 'TSLA',
                    external_name: 'Tesla Inc.',
                    flag_color: null,
                    notes: null,
                    display_order: 3,
                    price: 245.80,
                    change: -2.10,
                    change_percent: -0.85,
                    created_at: '2025-01-20T10:00:00Z'
                },
                {
                    id: 4,
                    watch_list_id: 1,
                    ticker_id: 8,
                    ticker_symbol: 'GOOGL',
                    ticker_name: 'Alphabet Inc.',
                    external_symbol: null,
                    external_name: null,
                    flag_color: null,
                    notes: null,
                    display_order: 4,
                    price: 142.30,
                    change: 5.20,
                    change_percent: 3.79,
                    created_at: '2025-01-20T10:00:00Z'
                }
            ],
            2: [],
            3: []
        };
        return items[listId] || [];
    }

    /**
     * Get mockup flagged tickers
     * @param {string} color - Flag color (hex)
     * @returns {Array} Array of flagged tickers
     */
    function getMockupFlaggedTickers(color) {
        const allItems = [
            ...getMockupWatchListItems(1),
            ...getMockupWatchListItems(2),
            ...getMockupWatchListItems(3)
        ];
        return allItems.filter(item => item.flag_color === color);
    }

    // ===== CACHE MANAGEMENT =====

    /**
     * Save watch lists to cache
     * @param {Array} data - Watch lists data
     * @param {Object} options - Options
     */
    async function saveWatchListsCache(data, options = {}) {
        if (typeof window.UnifiedCacheManager?.save === 'function') {
            await window.UnifiedCacheManager.save(WATCH_LISTS_DATA_KEY, data, {
                ttl: WATCH_LISTS_TTL,
                ...options
            });
            window.Logger?.debug?.('💾 Watch lists saved to cache', PAGE_LOG_CONTEXT);
        }
    }

    /**
     * Invalidate watch lists cache
     */
    async function invalidateWatchListsCache() {
        if (typeof window.CacheSyncManager?.invalidateByAction === 'function') {
            await window.CacheSyncManager.invalidateByAction('watch-list-updated');
            window.Logger?.debug?.('🔄 Watch lists cache invalidated via CacheSyncManager', PAGE_LOG_CONTEXT);
        } else if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
            await window.UnifiedCacheManager.invalidate(WATCH_LISTS_DATA_KEY);
            window.Logger?.debug?.('🔄 Watch lists cache invalidated directly', PAGE_LOG_CONTEXT);
        }
    }

    /**
     * Clear watch lists cache
     * @param {boolean} patternOnly - If true, clear by pattern only
     */
    async function clearWatchListsCache(patternOnly = false) {
        if (patternOnly) {
            if (typeof window.UnifiedCacheManager?.clearByPattern === 'function') {
                await window.UnifiedCacheManager.clearByPattern('watch-lists-*');
            }
        } else {
            if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
                await window.UnifiedCacheManager.invalidate(WATCH_LISTS_DATA_KEY);
                await window.UnifiedCacheManager.invalidate(WATCH_LIST_ITEMS_KEY);
            }
        }
    }

    // ===== DATA LOADING =====

    /**
     * Load watch lists data (mockup mode)
     * @param {Object} options - Options
     * @param {boolean} options.force - Force reload
     * @returns {Promise<Array>} Watch lists data
     */
    async function loadWatchListsData(options = {}) {
        try {
            const { force = false } = options || {};

            // Check cache first (if not forcing)
            if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
                const cached = await window.UnifiedCacheManager.get(WATCH_LISTS_DATA_KEY, { ttl: WATCH_LISTS_TTL });
                if (cached) {
                    window.Logger?.debug?.('📦 Watch lists loaded from cache', PAGE_LOG_CONTEXT);
                    return Array.isArray(cached) ? cached : [];
                }
            }

            // Return mockup data
            const mockupData = getMockupWatchLists();
            
            // Save to cache
            await saveWatchListsCache(mockupData);

            window.Logger?.debug?.('✅ Watch lists loaded (mockup)', { ...PAGE_LOG_CONTEXT, count: mockupData.length });
            return mockupData;
        } catch (error) {
            window.Logger?.error?.('❌ Error loading watch lists data', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'שגיאה בטעינת נתוני רשימות צפייה', 5000);
            }
            throw error;
        }
    }

    /**
     * Load watch list items data (mockup mode)
     * @param {number} listId - Watch list ID
     * @param {Object} options - Options
     * @param {boolean} options.force - Force reload
     * @returns {Promise<Array>} Watch list items
     */
    async function loadWatchListItemsData(listId, options = {}) {
        try {
            const { force = false } = options || {};
            const cacheKey = `${WATCH_LIST_ITEMS_KEY}:list:${listId}`;

            // Check cache first (if not forcing)
            if (!force && typeof window.UnifiedCacheManager?.get === 'function') {
                const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: WATCH_LISTS_TTL });
                if (cached) {
                    window.Logger?.debug?.('📦 Watch list items loaded from cache', { ...PAGE_LOG_CONTEXT, listId });
                    return Array.isArray(cached) ? cached : [];
                }
            }

            // Return mockup data
            const mockupData = getMockupWatchListItems(listId);

            // Save to cache
            if (typeof window.UnifiedCacheManager?.save === 'function') {
                await window.UnifiedCacheManager.save(cacheKey, mockupData, { ttl: WATCH_LISTS_TTL });
            }

            window.Logger?.debug?.('✅ Watch list items loaded (mockup)', { ...PAGE_LOG_CONTEXT, listId, count: mockupData.length });
            return mockupData;
        } catch (error) {
            window.Logger?.error?.('❌ Error loading watch list items', { ...PAGE_LOG_CONTEXT, listId, error: error?.message || error });
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'שגיאה בטעינת פריטי הרשימה', 5000);
            }
            throw error;
        }
    }

    // ===== CRUD OPERATIONS (MOCKUP) =====

    /**
     * Create watch list (mockup)
     * @param {Object} payload - Watch list data
     * @param {Object} options - Options
     * @returns {Promise<Object>} Created watch list
     */
    async function createWatchList(payload, options = {}) {
        try {
            // Mockup implementation - add to local array
            const newList = {
                id: Date.now(), // Mock ID
                name: payload.name || 'רשימה חדשה',
                icon: payload.icon || null,
                color_hex: payload.color_hex || '#26baac',
                view_mode: payload.view_mode || 'table',
                display_order: payload.display_order || 999,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            // Invalidate cache
            await invalidateWatchListsCache();

            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('הצלחה', 'success', 'רשימה נוצרה בהצלחה', 3000);
            }

            window.Logger?.info?.('✅ Watch list created (mockup)', { ...PAGE_LOG_CONTEXT, listId: newList.id });
            return { status: 'success', data: newList };
        } catch (error) {
            window.Logger?.error?.('❌ Error creating watch list', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'שגיאה ביצירת רשימה', 5000);
            }
            throw error;
        }
    }

    /**
     * Update watch list (mockup)
     * @param {number} listId - Watch list ID
     * @param {Object} payload - Update data
     * @param {Object} options - Options
     * @returns {Promise<Object>} Updated watch list
     */
    async function updateWatchList(listId, payload, options = {}) {
        try {
            // Mockup implementation
            const updatedList = {
                id: listId,
                ...payload,
                updated_at: new Date().toISOString()
            };

            // Invalidate cache
            await invalidateWatchListsCache();

            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('הצלחה', 'success', 'רשימה עודכנה בהצלחה', 3000);
            }

            window.Logger?.info?.('✅ Watch list updated (mockup)', { ...PAGE_LOG_CONTEXT, listId });
            return { status: 'success', data: updatedList };
        } catch (error) {
            window.Logger?.error?.('❌ Error updating watch list', { ...PAGE_LOG_CONTEXT, listId, error: error?.message || error });
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'שגיאה בעדכון רשימה', 5000);
            }
            throw error;
        }
    }

    /**
     * Delete watch list (mockup)
     * @param {number} listId - Watch list ID
     * @param {Object} options - Options
     * @returns {Promise<Object>} Deletion result
     */
    async function deleteWatchList(listId, options = {}) {
        try {
            // Mockup implementation

            // Invalidate cache
            await invalidateWatchListsCache();

            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('הצלחה', 'success', 'רשימה נמחקה בהצלחה', 3000);
            }

            window.Logger?.info?.('✅ Watch list deleted (mockup)', { ...PAGE_LOG_CONTEXT, listId });
            return { status: 'success', message: 'רשימה נמחקה בהצלחה' };
        } catch (error) {
            window.Logger?.error?.('❌ Error deleting watch list', { ...PAGE_LOG_CONTEXT, listId, error: error?.message || error });
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'שגיאה במחיקת רשימה', 5000);
            }
            throw error;
        }
    }

    /**
     * Add ticker to list (mockup)
     * @param {number} listId - Watch list ID
     * @param {Object} payload - Ticker data
     * @param {Object} options - Options
     * @returns {Promise<Object>} Created item
     */
    async function addTickerToList(listId, payload, options = {}) {
        try {
            // Mockup implementation
            const newItem = {
                id: Date.now(), // Mock ID
                watch_list_id: listId,
                ticker_id: payload.ticker_id || null,
                ticker_symbol: payload.ticker_symbol || null,
                ticker_name: payload.ticker_name || null,
                external_symbol: payload.external_symbol || null,
                external_name: payload.external_name || null,
                flag_color: payload.flag_color || null,
                notes: payload.notes || null,
                display_order: payload.display_order || 999,
                created_at: new Date().toISOString()
            };

            // Invalidate cache
            await invalidateWatchListsCache();

            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('הצלחה', 'success', 'טיקר נוסף לרשימה בהצלחה', 3000);
            }

            window.Logger?.info?.('✅ Ticker added to list (mockup)', { ...PAGE_LOG_CONTEXT, listId, itemId: newItem.id });
            return { status: 'success', data: newItem };
        } catch (error) {
            window.Logger?.error?.('❌ Error adding ticker to list', { ...PAGE_LOG_CONTEXT, listId, error: error?.message || error });
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'שגיאה בהוספת טיקר לרשימה', 5000);
            }
            throw error;
        }
    }

    /**
     * Update watch list item (mockup)
     * @param {number} listId - Watch list ID
     * @param {number} itemId - Item ID
     * @param {Object} payload - Update data
     * @param {Object} options - Options
     * @returns {Promise<Object>} Updated item
     */
    async function updateWatchListItem(listId, itemId, payload, options = {}) {
        try {
            // Mockup implementation
            const updatedItem = {
                id: itemId,
                watch_list_id: listId,
                ...payload,
                updated_at: new Date().toISOString()
            };

            // Invalidate cache
            await invalidateWatchListsCache();

            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('הצלחה', 'success', 'פריט עודכן בהצלחה', 3000);
            }

            window.Logger?.info?.('✅ Watch list item updated (mockup)', { ...PAGE_LOG_CONTEXT, listId, itemId });
            return { status: 'success', data: updatedItem };
        } catch (error) {
            window.Logger?.error?.('❌ Error updating watch list item', { ...PAGE_LOG_CONTEXT, listId, itemId, error: error?.message || error });
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'שגיאה בעדכון פריט', 5000);
            }
            throw error;
        }
    }

    /**
     * Remove ticker from list (mockup)
     * @param {number} listId - Watch list ID
     * @param {number} itemId - Item ID
     * @param {Object} options - Options
     * @returns {Promise<Object>} Deletion result
     */
    async function removeTickerFromList(listId, itemId, options = {}) {
        try {
            // Mockup implementation

            // Invalidate cache
            await invalidateWatchListsCache();

            // Show notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('הצלחה', 'success', 'טיקר הוסר מהרשימה בהצלחה', 3000);
            }

            window.Logger?.info?.('✅ Ticker removed from list (mockup)', { ...PAGE_LOG_CONTEXT, listId, itemId });
            return { status: 'success', message: 'טיקר הוסר מהרשימה בהצלחה' };
        } catch (error) {
            window.Logger?.error?.('❌ Error removing ticker from list', { ...PAGE_LOG_CONTEXT, listId, itemId, error: error?.message || error });
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'שגיאה בהסרת טיקר מהרשימה', 5000);
            }
            throw error;
        }
    }

    // ===== GLOBAL EXPORTS =====

    window.WatchListsDataService = {
        // Mockup data
        getMockupWatchLists,
        getMockupWatchListItems,
        getMockupFlaggedTickers,

        // Cache management
        saveWatchListsCache,
        invalidateWatchListsCache,
        clearWatchListsCache,

        // Data loading
        loadWatchListsData,
        loadWatchListItemsData,

        // CRUD operations
        createWatchList,
        updateWatchList,
        deleteWatchList,
        addTickerToList,
        updateWatchListItem,
        removeTickerFromList
    };

    // Individual function exports
    window.getMockupWatchLists = getMockupWatchLists;
    window.getMockupWatchListItems = getMockupWatchListItems;
    window.getMockupFlaggedTickers = getMockupFlaggedTickers;
    window.loadWatchListsData = loadWatchListsData;
    window.loadWatchListItemsData = loadWatchListItemsData;
    window.createWatchList = createWatchList;
    window.updateWatchList = updateWatchList;
    window.deleteWatchList = deleteWatchList;
    window.addTickerToList = addTickerToList;
    window.updateWatchListItem = updateWatchListItem;
    window.removeTickerFromList = removeTickerFromList;

    window.Logger?.info?.('✅ WatchListsDataService loaded successfully (mockup mode)', PAGE_LOG_CONTEXT);

})();





