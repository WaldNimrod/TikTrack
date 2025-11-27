/**
 * Watch Lists Page - TikTrack
 * ===========================
 * 
 * עמוד ניהול רשימות צפייה
 * 
 * @file trading-ui/scripts/watch-lists-page.js
 * @version 1.0.0
 * @created 26 בנובמבר 2025
 * @author TikTrack Development Team
 * 
 * ===== FUNCTION INDEX =====
 * 
 * PAGE INITIALIZATION (2)
 * - initializeWatchListsPage() - אתחול העמוד
 * - registerWatchListsTables() - רישום טבלאות ב-UnifiedTableSystem
 * 
 * DATA LOADING (3)
 * - loadMockupData() - טעינת נתוני מוקאפ
 * - loadWatchLists() - טעינת רשימות צפייה
 * - loadWatchListItems(listId) - טעינת פריטי רשימה
 * 
 * RENDERING (5)
 * - renderWatchListsGrid() - רינדור רשת רשימות
 * - renderActiveListView() - רינדור תצוגת רשימה פעילה
 * - renderSummaryStats() - רינדור סטטיסטיקות סיכום
 * - renderFlaggedTickers() - רינדור טיקרים מסומנים
 * - updateActiveListTitle(listName) - עדכון כותרת רשימה פעילה
 * 
 * VIEW MODE (3)
 * - setViewMode(mode) - החלפת מצב תצוגה (Table/Cards/Compact)
 * - switchToTableView() - מעבר לתצוגת טבלה
 * - switchToCardsView() - מעבר לתצוגת כרטיסים
 * - switchToCompactView() - מעבר לתצוגה קומפקטית
 * 
 * FLAG MANAGEMENT (3)
 * - showFlagPalette(itemId) - הצגת פלטת דגלים
 * - filterByFlag(color) - סינון לפי דגל
 * - setFlag(itemId, color) - הגדרת דגל
 * - removeFlag(itemId) - הסרת דגל
 * 
 * MODAL MANAGEMENT (4)
 * - openAddListModal() - פתיחת מודל הוספת רשימה
 * - openEditListModal(listId) - פתיחת מודל עריכת רשימה
 * - addTicker() - פתיחת מודל הוספת טיקר
 * - editItem(itemId) - פתיחת מודל עריכת פריט
 * 
 * CRUD OPERATIONS (6)
 * - saveWatchList() - שמירת רשימה
 * - deleteList(listId) - מחיקת רשימה
 * - selectList(listId) - בחירת רשימה פעילה
 * - addTickerToList() - הוספת טיקר לרשימה
 * - removeItem(itemId) - הסרת פריט מהרשימה
 * - refreshAll() - רענון כל הנתונים
 * 
 * UTILITIES (2)
 * - calculateSummaryStats() - חישוב סטטיסטיקות סיכום
 * - getCurrentListId() - קבלת מזהה רשימה פעילה
 * 
 * ==========================================
 */

(function() {
    'use strict';

    const PAGE_NAME = 'watch-lists-page';
    const PAGE_LOG_CONTEXT = { page: PAGE_NAME };

    // ===== STATE VARIABLES =====
    let watchListsData = [];
    let activeListId = null;
    let activeListItems = [];
    let currentViewMode = 'table';

    // ===== PAGE INITIALIZATION =====

    /**
     * Initialize Watch Lists Page
     * @async
     */
    async function initializeWatchListsPage() {
        try {
            window.Logger?.info?.('🔧 Initializing Watch Lists Page...', PAGE_LOG_CONTEXT);

            // Wait for required systems
            if (!window.WatchListsDataService) {
                window.Logger?.warn?.('⚠️ WatchListsDataService not available, waiting...', PAGE_LOG_CONTEXT);
                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        if (window.WatchListsDataService) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        resolve();
                    }, 5000);
                });
            }

            // Register tables
            registerWatchListsTables();

            // Load mockup data
            await loadMockupData();

            // Restore view mode from state
            if (typeof window.PageStateManager?.get === 'function') {
                const savedViewMode = window.PageStateManager.get('watch-lists-view-mode');
                if (savedViewMode) {
                    setViewMode(savedViewMode);
                }
            }

            // Initialize drag and drop (mockup)
            if (window.WatchListsUIService?.initializeDragAndDrop) {
                window.WatchListsUIService.initializeDragAndDrop();
            }

            // Apply data attributes (data-bg-color, data-icon-color)
            applyDataAttributes();

            // Restore section states
            if (typeof window.restoreAllSectionStates === 'function') {
                window.restoreAllSectionStates();
            }

            window.Logger?.info?.('✅ Watch Lists Page initialized successfully', PAGE_LOG_CONTEXT);
        } catch (error) {
            window.Logger?.error?.('❌ Error initializing Watch Lists Page', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'שגיאה באתחול עמוד רשימות צפייה', 5000);
            }
        }
    }

    /**
     * Register tables with UnifiedTableSystem
     */
    function registerWatchListsTables() {
        if (!window.UnifiedTableSystem) {
            window.Logger?.warn?.('⚠️ UnifiedTableSystem not available for registration', PAGE_LOG_CONTEXT);
            return;
        }

        const getColumns = (tableType) => {
            return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
        };

        // Register active list table
        window.UnifiedTableSystem.registry.register('watch_list_items', {
            dataGetter: () => activeListItems || [],
            updateFunction: (data) => {
                activeListItems = Array.isArray(data) ? data : [];
                renderActiveListView(activeListItems);
            },
            tableSelector: '#watchListItemsTable',
            columns: getColumns('watch_list_items'),
            sortable: true,
            filterable: true,
            defaultSort: { columnIndex: 0, direction: 'asc', key: 'display_order' }
        });

        // Register flagged tickers table
        window.UnifiedTableSystem.registry.register('flagged_tickers', {
            dataGetter: () => {
                if (window.WatchListsDataService?.getMockupFlaggedTickers) {
                    return window.WatchListsDataService.getMockupFlaggedTickers('#26baac') || [];
                }
                return [];
            },
            updateFunction: (data) => renderFlaggedTickers(data),
            tableSelector: '#flaggedTickersTable',
            columns: getColumns('flagged_tickers'),
            sortable: true,
            filterable: true,
            defaultSort: { columnIndex: 0, direction: 'asc', key: 'ticker_symbol' }
        });

        window.Logger?.debug?.('✅ Watch Lists tables registered', PAGE_LOG_CONTEXT);
    }

    // ===== DATA LOADING =====

    /**
     * Load mockup data
     * @async
     */
    async function loadMockupData() {
        try {
            // Load watch lists
            await loadWatchLists();

            // Load summary stats
            calculateSummaryStats();

            window.Logger?.debug?.('✅ Mockup data loaded', PAGE_LOG_CONTEXT);
        } catch (error) {
            window.Logger?.error?.('❌ Error loading mockup data', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        }
    }

    /**
     * Load watch lists
     * @async
     */
    async function loadWatchLists() {
        try {
            if (window.WatchListsDataService?.loadWatchListsData) {
                watchListsData = await window.WatchListsDataService.loadWatchListsData({ force: false });
                renderWatchListsGrid();
            } else {
                // Fallback to mockup data
                if (window.WatchListsDataService?.getMockupWatchLists) {
                    watchListsData = window.WatchListsDataService.getMockupWatchLists();
                    renderWatchListsGrid();
                }
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error loading watch lists', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        }
    }

    /**
     * Load watch list items
     * @param {number} listId - Watch list ID
     * @async
     */
    async function loadWatchListItems(listId) {
        try {
            if (window.WatchListsDataService?.loadWatchListItemsData) {
                activeListItems = await window.WatchListsDataService.loadWatchListItemsData(listId, { force: false });
                renderActiveListView(activeListItems);
            } else {
                // Fallback to mockup data
                if (window.WatchListsDataService?.getMockupWatchListItems) {
                    activeListItems = window.WatchListsDataService.getMockupWatchListItems(listId);
                    renderActiveListView(activeListItems);
                }
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error loading watch list items', { ...PAGE_LOG_CONTEXT, listId, error: error?.message || error });
        }
    }

    // ===== RENDERING =====

    /**
     * Render watch lists grid
     */
    function renderWatchListsGrid() {
        const gridContainer = document.getElementById('watchListsGrid');
        if (!gridContainer) return;

        // Grid is already in HTML (mockup), just update data attributes if needed
        window.Logger?.debug?.('📊 Watch lists grid rendered', { ...PAGE_LOG_CONTEXT, count: watchListsData.length });
    }

    /**
     * Render active list view
     * @param {Array} items - Items to render
     */
    function renderActiveListView(items) {
        // Table view is handled by UnifiedTableSystem
        // Cards and compact views need manual rendering
        if (currentViewMode === 'cards') {
            renderCardsView(items);
        } else if (currentViewMode === 'compact') {
            renderCompactView(items);
        }

        window.Logger?.debug?.('📊 Active list view rendered', { ...PAGE_LOG_CONTEXT, mode: currentViewMode, count: items.length });
    }

    /**
     * Render summary statistics
     */
    function renderSummaryStats() {
        const stats = calculateSummaryStats();
        
        const totalListsEl = document.getElementById('totalWatchLists');
        const totalTickersEl = document.getElementById('totalTickers');
        const activeFlagsEl = document.getElementById('activeFlags');
        const externalTickersEl = document.getElementById('externalTickers');

        if (totalListsEl) totalListsEl.textContent = stats.totalLists;
        if (totalTickersEl) totalTickersEl.textContent = stats.totalTickers;
        if (activeFlagsEl) activeFlagsEl.textContent = stats.activeFlags;
        if (externalTickersEl) externalTickersEl.textContent = stats.externalTickers;
    }

    /**
     * Render flagged tickers
     * @param {Array} tickers - Flagged tickers
     */
    function renderFlaggedTickers(tickers) {
        // Table view is handled by UnifiedTableSystem
        window.Logger?.debug?.('🚩 Flagged tickers rendered', { ...PAGE_LOG_CONTEXT, count: tickers.length });
    }

    /**
     * Update active list title
     * @param {string} listName - List name
     */
    function updateActiveListTitle(listName) {
        const titleEl = document.getElementById('activeListTitle');
        if (titleEl) {
            titleEl.textContent = listName || 'רשימה פעילה';
        }
    }

    // ===== VIEW MODE =====

    /**
     * Set view mode
     * @param {string} mode - View mode ('table', 'cards', 'compact')
     */
    function setViewMode(mode) {
        if (window.WatchListsUIService?.switchViewMode) {
            window.WatchListsUIService.switchViewMode(mode);
            currentViewMode = mode;
        } else {
            // Fallback implementation
            const tableView = document.getElementById('tableView');
            const cardsView = document.getElementById('cardsView');
            const compactView = document.getElementById('compactView');

            if (tableView) tableView.classList.add('d-none');
            if (cardsView) cardsView.classList.add('d-none');
            if (compactView) compactView.classList.add('d-none');

            const selectedView = document.getElementById(`${mode}View`);
            if (selectedView) {
                selectedView.classList.remove('d-none');
            }

            currentViewMode = mode;
        }
    }

    // ===== FLAG MANAGEMENT =====

    /**
     * Show flag palette
     * @param {number} itemId - Item ID
     */
    function showFlagPalette(itemId) {
        if (window.WatchListsUIService?.showFlagPalette) {
            window.WatchListsUIService.showFlagPalette(itemId);
        } else {
            // Fallback - would open flag-quick-action modal
            window.Logger?.debug?.('🚩 Flag palette requested', { ...PAGE_LOG_CONTEXT, itemId });
        }
    }

    /**
     * Filter by flag color
     * @param {string} color - Flag color (hex)
     */
    function filterByFlag(color) {
        if (window.WatchListsUIService?.filterByFlag) {
            window.WatchListsUIService.filterByFlag(color);
        } else {
            // Fallback implementation
            window.Logger?.debug?.('🔍 Filter by flag', { ...PAGE_LOG_CONTEXT, color });
        }
    }

    /**
     * Set flag
     * @param {number} itemId - Item ID
     * @param {string} color - Flag color (hex)
     */
    async function setFlag(itemId, color) {
        if (window.WatchListsUIService?.setFlag) {
            await window.WatchListsUIService.setFlag(itemId, color);
        } else {
            window.Logger?.debug?.('🚩 Flag set', { ...PAGE_LOG_CONTEXT, itemId, color });
        }
    }

    /**
     * Remove flag
     * @param {number} itemId - Item ID
     */
    async function removeFlag(itemId) {
        if (window.WatchListsUIService?.removeFlag) {
            await window.WatchListsUIService.removeFlag(itemId);
        } else {
            window.Logger?.debug?.('🚩 Flag removed', { ...PAGE_LOG_CONTEXT, itemId });
        }
    }

    // ===== MODAL MANAGEMENT =====

    /**
     * Open add list modal
     */
    function openAddListModal() {
        if (window.ModalManagerV2?.showModal) {
            window.ModalManagerV2.showModal('watchListModal', {
                mode: 'create',
                title: 'רשימה חדשה'
            });
        } else {
            window.Logger?.warn?.('⚠️ ModalManagerV2 not available', PAGE_LOG_CONTEXT);
        }
    }

    /**
     * Open edit list modal
     * @param {number} listId - List ID
     */
    function openEditListModal(listId) {
        if (window.ModalManagerV2?.showModal) {
            const list = watchListsData.find(l => l.id === listId);
            window.ModalManagerV2.showModal('watchListModal', {
                mode: 'edit',
                title: 'עריכת רשימה',
                data: list
            });
        } else {
            window.Logger?.warn?.('⚠️ ModalManagerV2 not available', PAGE_LOG_CONTEXT);
        }
    }

    /**
     * Add ticker (open modal)
     */
    function addTicker() {
        if (window.ModalManagerV2?.showModal) {
            window.ModalManagerV2.showModal('addTickerModal', {
                listId: activeListId
            });
        } else {
            window.Logger?.warn?.('⚠️ ModalManagerV2 not available', PAGE_LOG_CONTEXT);
        }
    }

    /**
     * Edit item (open modal)
     * @param {number} itemId - Item ID
     */
    function editItem(itemId) {
        const item = activeListItems.find(i => i.id === itemId);
        if (item && window.ModalManagerV2?.showModal) {
            window.ModalManagerV2.showModal('editWatchListItemModal', {
                itemId: itemId,
                data: item
            });
        } else {
            window.Logger?.warn?.('⚠️ Item not found or ModalManagerV2 not available', PAGE_LOG_CONTEXT);
        }
    }

    // ===== CRUD OPERATIONS =====

    /**
     * Save watch list
     * @async
     */
    async function saveWatchList() {
        try {
            if (!window.DataCollectionService) {
                window.Logger?.warn?.('⚠️ DataCollectionService not available', PAGE_LOG_CONTEXT);
                return;
            }

            // Collect form data
            const formData = window.DataCollectionService.collectFormData({
                name: { id: 'watchListName', type: 'text' },
                icon: { id: 'watchListIcon', type: 'text' },
                color_hex: { id: 'watchListColorHex', type: 'text' },
                view_mode: { id: 'watchListViewMode', type: 'text' }
            });

            // Save via data service
            if (window.WatchListsDataService?.createWatchList) {
                const result = await window.WatchListsDataService.createWatchList(formData);
                
                // Handle response via CRUDResponseHandler
                if (window.CRUDResponseHandler?.handleResponse) {
                    await window.CRUDResponseHandler.handleResponse(result, {
                        entityType: 'watch_list',
                        operation: 'create',
                        onSuccess: async () => {
                            await loadWatchLists();
                            renderSummaryStats();
                        },
                        showNotification: true
                    });
                }

                // Close modal
                if (window.ModalManagerV2?.closeModal) {
                    window.ModalManagerV2.closeModal('watchListModal');
                }
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error saving watch list', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        }
    }

    /**
     * Delete list
     * @param {number} listId - List ID
     * @async
     */
    async function deleteList(listId) {
        try {
            // Check linked items before deletion
            if (typeof window.checkLinkedItemsBeforeAction === 'function') {
                const hasLinkedItems = await window.checkLinkedItemsBeforeAction('watch_list', listId, 'delete');
                if (hasLinkedItems) {
                    return; // User cancelled
                }
            }

            // Delete via data service
            if (window.WatchListsDataService?.deleteWatchList) {
                const result = await window.WatchListsDataService.deleteWatchList(listId);

                // Handle response via CRUDResponseHandler
                if (window.CRUDResponseHandler?.handleResponse) {
                    await window.CRUDResponseHandler.handleResponse(result, {
                        entityType: 'watch_list',
                        operation: 'delete',
                        onSuccess: async () => {
                            await loadWatchLists();
                            renderSummaryStats();
                            if (activeListId === listId) {
                                activeListId = null;
                                activeListItems = [];
                                renderActiveListView([]);
                            }
                        },
                        showNotification: true
                    });
                }
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error deleting list', { ...PAGE_LOG_CONTEXT, listId, error: error?.message || error });
        }
    }

    /**
     * Select list (set as active)
     * @param {number} listId - List ID
     * @async
     */
    async function selectList(listId) {
        try {
            activeListId = listId;
            
            // Save state
            if (typeof window.PageStateManager?.save === 'function') {
                window.PageStateManager.save('watch-lists-active-list-id', listId);
            }

            // Update title
            const list = watchListsData.find(l => l.id === listId);
            if (list) {
                updateActiveListTitle(list.name);
            }

            // Load items
            await loadWatchListItems(listId);

            window.Logger?.info?.('✅ List selected', { ...PAGE_LOG_CONTEXT, listId });
        } catch (error) {
            window.Logger?.error?.('❌ Error selecting list', { ...PAGE_LOG_CONTEXT, listId, error: error?.message || error });
        }
    }

    /**
     * Add ticker to list
     * @async
     */
    async function addTickerToList() {
        try {
            if (!window.DataCollectionService) {
                window.Logger?.warn?.('⚠️ DataCollectionService not available', PAGE_LOG_CONTEXT);
                return;
            }

            // Collect form data
            const formData = window.DataCollectionService.collectFormData({
                ticker_id: { id: 'selectedTickerId', type: 'int' },
                external_symbol: { id: 'externalSymbol', type: 'text' },
                external_name: { id: 'externalName', type: 'text' },
                flag_color: { id: 'itemFlagColor', type: 'text' },
                notes: { id: 'itemNotes', type: 'text' }
            });

            // Add via data service
            if (window.WatchListsDataService?.addTickerToList && activeListId) {
                const result = await window.WatchListsDataService.addTickerToList(activeListId, formData);

                // Handle response via CRUDResponseHandler
                if (window.CRUDResponseHandler?.handleResponse) {
                    await window.CRUDResponseHandler.handleResponse(result, {
                        entityType: 'watch_list_item',
                        operation: 'create',
                        onSuccess: async () => {
                            await loadWatchListItems(activeListId);
                            renderSummaryStats();
                        },
                        showNotification: true
                    });
                }

                // Close modal
                if (window.ModalManagerV2?.closeModal) {
                    window.ModalManagerV2.closeModal('addTickerModal');
                }
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error adding ticker to list', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        }
    }

    /**
     * Remove item from list
     * @param {number} itemId - Item ID
     * @async
     */
    async function removeItem(itemId) {
        try {
            if (!activeListId) {
                window.Logger?.warn?.('⚠️ No active list selected', PAGE_LOG_CONTEXT);
                return;
            }

            // Remove via data service
            if (window.WatchListsDataService?.removeTickerFromList) {
                const result = await window.WatchListsDataService.removeTickerFromList(activeListId, itemId);

                // Handle response via CRUDResponseHandler
                if (window.CRUDResponseHandler?.handleResponse) {
                    await window.CRUDResponseHandler.handleResponse(result, {
                        entityType: 'watch_list_item',
                        operation: 'delete',
                        onSuccess: async () => {
                            await loadWatchListItems(activeListId);
                            renderSummaryStats();
                        },
                        showNotification: true
                    });
                }
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error removing item', { ...PAGE_LOG_CONTEXT, itemId, error: error?.message || error });
        }
    }

    /**
     * Refresh all data
     * @async
     */
    async function refreshAll() {
        try {
            await loadWatchLists();
            if (activeListId) {
                await loadWatchListItems(activeListId);
            }
            renderSummaryStats();

            if (typeof window.showNotification === 'function') {
                window.showNotification('הצלחה', 'success', 'נתונים רועננו בהצלחה', 3000);
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error refreshing data', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        }
    }

    // ===== UTILITIES =====

    /**
     * Apply data attributes (data-bg-color, data-icon-color)
     */
    function applyDataAttributes() {
        // Apply background colors from data-bg-color
        document.querySelectorAll('[data-bg-color]').forEach(el => {
            const bgColor = el.getAttribute('data-bg-color');
            if (bgColor) {
                el.style.backgroundColor = bgColor;
            }
        });

        // Apply icon colors from data-icon-color
        document.querySelectorAll('[data-icon-color]').forEach(el => {
            const iconColor = el.getAttribute('data-icon-color');
            if (iconColor && iconColor !== 'muted') {
                el.style.color = iconColor;
            }
        });

        window.Logger?.debug?.('✅ Data attributes applied', PAGE_LOG_CONTEXT);
    }

    /**
     * Calculate summary statistics
     * @returns {Object} Statistics object
     */
    function calculateSummaryStats() {
        const stats = {
            totalLists: watchListsData.length,
            totalTickers: 0,
            activeFlags: 0,
            externalTickers: 0
        };

        // Calculate from all lists
        watchListsData.forEach(list => {
            if (window.WatchListsDataService?.getMockupWatchListItems) {
                const items = window.WatchListsDataService.getMockupWatchListItems(list.id);
                stats.totalTickers += items.length;
                stats.activeFlags += items.filter(i => i.flag_color).length;
                stats.externalTickers += items.filter(i => i.external_symbol).length;
            }
        });

        renderSummaryStats();

        return stats;
    }

    /**
     * Get current list ID
     * @returns {number|null} Current list ID
     */
    function getCurrentListId() {
        return activeListId;
    }

    /**
     * Render cards view (helper)
     * @param {Array} items - Items to render
     */
    function renderCardsView(items) {
        // Cards view rendering is handled by HTML (mockup)
        // This is a placeholder for future dynamic rendering
        window.Logger?.debug?.('🃏 Cards view rendered', { ...PAGE_LOG_CONTEXT, count: items.length });
    }

    /**
     * Render compact view (helper)
     * @param {Array} items - Items to render
     */
    function renderCompactView(items) {
        // Compact view rendering is handled by HTML (mockup)
        // This is a placeholder for future dynamic rendering
        window.Logger?.debug?.('📋 Compact view rendered', { ...PAGE_LOG_CONTEXT, count: items.length });
    }

    // ===== INITIALIZATION =====

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWatchListsPage);
    } else {
        // DOM already loaded
        initializeWatchListsPage();
    }

    // ===== GLOBAL EXPORTS =====

    window.WatchListsPage = {
        // Initialization
        init: initializeWatchListsPage,
        registerTables: registerWatchListsTables,

        // Data loading
        loadMockupData,
        loadWatchLists,
        loadWatchListItems,

        // Rendering
        renderWatchListsGrid,
        renderActiveListView,
        renderSummaryStats,
        renderFlaggedTickers,
        updateActiveListTitle,

        // View mode
        setViewMode,

        // Flag management
        showFlagPalette,
        filterByFlag,
        setFlag,
        removeFlag,

        // Modal management
        openAddListModal,
        openEditListModal: openEditListModal,
        editList: openEditListModal, // Alias
        addTicker,
        editItem,

        // CRUD operations
        saveWatchList,
        deleteList,
        selectList,
        addTickerToList,
        removeItem,
        refreshAll,

        // Utilities
        getCurrentListId
    };

    // Individual function exports for HTML onclick handlers
    window.openAddListModal = openAddListModal;
    window.editList = openEditListModal;
    window.deleteList = deleteList;
    window.selectList = selectList;
    window.addTicker = addTicker;
    window.editItem = editItem;
    window.removeItem = removeItem;
    window.refreshAll = refreshAll;
    window.showFlagPalette = showFlagPalette;
    window.filterByFlag = filterByFlag;
    window.setFlag = setFlag;
    window.removeFlag = removeFlag;
    window.setViewMode = setViewMode;

    window.Logger?.info?.('✅ WatchListsPage loaded successfully', PAGE_LOG_CONTEXT);

})();

