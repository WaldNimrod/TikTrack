/**
 * Watch Lists Widget Service - TikTrack
 * =====================================
 * 
 * Service for managing watch lists integration with widgets.
 * Currently uses mockup data, prepared for real API connection later.
 * 
 * Responsibilities:
 * - Get watch lists for widgets
 * - Get ticker IDs from watch lists
 * - Manage watch list selection for widgets
 * 
 * Related Documentation:
 * - documentation/04-FEATURES/WATCH_LIST/README.md
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * 
 * @version 1.0.0
 * @created December 2025
 * @author TikTrack Development Team
 */

(function watchListsWidgetService() {
    'use strict';

    const PAGE_LOG_CONTEXT = { page: 'watch-lists-widget-service' };

    // ===== State =====
    const state = {
        initialized: false,
        watchLists: null,
        selectedWatchListId: null
    };

    /**
     * Initialize service
     * @returns {Promise<void>}
     */
    async function initialize() {
        if (state.initialized) {
            return;
        }

        try {
            if (window.Logger) {
                window.Logger.info('Initializing Watch Lists Widget Service', PAGE_LOG_CONTEXT);
            }

            // Load watch lists (mockup for now)
            if (window.WatchListsDataService && window.WatchListsDataService.loadWatchListsData) {
                const lists = await window.WatchListsDataService.loadWatchListsData({ force: false });
                state.watchLists = lists || [];
            } else if (window.getMockupWatchLists) {
                // Fallback to direct mockup function
                state.watchLists = window.getMockupWatchLists();
            } else {
                state.watchLists = [];
            }

            state.initialized = true;

            if (window.Logger) {
                window.Logger.info('Watch Lists Widget Service initialized', { 
                    watchListsCount: state.watchLists.length,
                    ...PAGE_LOG_CONTEXT 
                });
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error initializing Watch Lists Widget Service', { 
                    error: error.message,
                    ...PAGE_LOG_CONTEXT 
                });
            }
            state.watchLists = [];
            state.initialized = true; // Mark as initialized even on error
        }
    }

    /**
     * Get all watch lists
     * @returns {Promise<Array>} Array of watch lists
     */
    async function getWatchLists() {
        if (!state.initialized) {
            await initialize();
        }
        return state.watchLists || [];
    }

    /**
     * Get ticker IDs from a watch list
     * @param {number} listId - Watch list ID
     * @returns {Promise<Array<number>>} Array of ticker IDs
     */
    async function getTickerIdsFromList(listId) {
        if (!listId) {
            return [];
        }

        try {
            if (window.WatchListsDataService && window.WatchListsDataService.getWatchListTickers) {
                return await window.WatchListsDataService.getWatchListTickers(listId);
            } else if (window.getWatchListTickers) {
                return await window.getWatchListTickers(listId);
            } else {
                // Fallback: get from mockup items
                if (window.getMockupWatchListItems) {
                    const items = window.getMockupWatchListItems(listId);
                    return items
                        .filter(item => item.ticker_id)
                        .map(item => item.ticker_id);
                }
            }
            return [];
        } catch (error) {
            if (window.Logger) {
                window.Logger.error('Error getting ticker IDs from watch list', { 
                    listId, 
                    error: error.message,
                    ...PAGE_LOG_CONTEXT 
                });
            }
            return [];
        }
    }

    /**
     * Set selected watch list for widgets
     * @param {number|null} listId - Watch list ID or null to clear selection
     */
    function setSelectedWatchList(listId) {
        state.selectedWatchListId = listId;
        if (window.Logger) {
            window.Logger.info('Selected watch list changed', { 
                listId,
                ...PAGE_LOG_CONTEXT 
            });
        }
    }

    /**
     * Get selected watch list ID
     * @returns {number|null} Selected watch list ID
     */
    function getSelectedWatchListId() {
        return state.selectedWatchListId;
    }

    /**
     * Get selected watch list ticker IDs
     * @returns {Promise<Array<number>>} Array of ticker IDs from selected list
     */
    async function getSelectedWatchListTickerIds() {
        if (!state.selectedWatchListId) {
            return [];
        }
        return await getTickerIdsFromList(state.selectedWatchListId);
    }

    // ===== Public API =====

    const WatchListsWidgetService = {
        /**
         * Initialize service
         * @returns {Promise<void>}
         */
        async init() {
            await initialize();
        },

        /**
         * Get all watch lists
         * @returns {Promise<Array>} Array of watch lists
         */
        async getWatchLists() {
            return await getWatchLists();
        },

        /**
         * Get ticker IDs from a watch list
         * @param {number} listId - Watch list ID
         * @returns {Promise<Array<number>>} Array of ticker IDs
         */
        async getTickerIdsFromList(listId) {
            return await getTickerIdsFromList(listId);
        },

        /**
         * Set selected watch list for widgets
         * @param {number|null} listId - Watch list ID or null to clear selection
         */
        setSelectedWatchList(listId) {
            setSelectedWatchList(listId);
        },

        /**
         * Get selected watch list ID
         * @returns {number|null} Selected watch list ID
         */
        getSelectedWatchListId() {
            return getSelectedWatchListId();
        },

        /**
         * Get selected watch list ticker IDs
         * @returns {Promise<Array<number>>} Array of ticker IDs from selected list
         */
        async getSelectedWatchListTickerIds() {
            return await getSelectedWatchListTickerIds();
        },

        /**
         * Check if service is initialized
         * @returns {boolean}
         */
        isInitialized() {
            return state.initialized;
        },

        version: '1.0.0'
    };

    // ===== Global Export =====

    window.WatchListsWidgetService = WatchListsWidgetService;

    if (window.Logger) {
        window.Logger.info('✅ Watch Lists Widget Service loaded successfully', PAGE_LOG_CONTEXT);
    }

})();

