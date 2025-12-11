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
 * - loadWatchListsData() - טעינת נתוני רשימות צפייה מ-API
 * - loadWatchLists() - טעינת רשימות צפייה
 * - loadWatchListItems(listId) - טעינת פריטי רשימה
 * 
 * RENDERING (4)
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
 * - (addTickerToList is now in add-ticker-modal.js)
 * - removeItem(itemId) - הסרת פריט מהרשימה
 * - refreshAll() - רענון כל הנתונים
 * 
 * UTILITIES (2)
 * - calculateSummaryStats() - חישוב סטטיסטיקות סיכום
 * - getCurrentListId() - קבלת מזהה רשימה פעילה
 * 
 * ==========================================
 */
// === Arrow Functions ===
// - addInfoItem() - Addinfoitem
// - getColumns() - Getcolumns
// - retry() - Retry

// === Functions ===
// - applyDataAttributes() - Applydataattributes
// - createActionsMenuContent() - Createactionsmenucontent
// - createFallbackButtons() - Createfallbackbuttons
// - createFlagButton() - Createflagbutton
// - deleteCurrentList() - Deletecurrentlist
// - enrichWatchListItemsWithTickerData() - Enrichwatchlistitemswithtickerdata
// - loadWatchLists() - Loadwatchlists
// - refreshFlagLists() - Refreshflaglists
// - renderCardsView() - Rendercardsview
// - renderCompactView() - Rendercompactview
// - restorePageState() - Restorepagestate
// - savePageState() - Savepagestate
// - switchList() - Switchlist
// - updateActionsMenu() - Updateactionsmenu
// - updateActiveListSelect() - Updateactivelistselect
// - updateWatchListItemsTable() - Updatewatchlistitemstable

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

            // Wait for Cache Manager to initialize
            if (window.UnifiedCacheManager && !window.UnifiedCacheManager.initialized) {
                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        if (window.UnifiedCacheManager?.initialized) {
                            clearInterval(checkInterval);
                            resolve();
                        }
                    }, 100);
                    setTimeout(() => {
                        clearInterval(checkInterval);
                        resolve(); // Continue even if not initialized
                    }, 3000);
                });
            }

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

            // Wait for ModalManagerV2 to be available
            let retries = 0;
            while (!window.ModalManagerV2 && retries < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            // Register modals with ModalManagerV2
            // Register tables
            registerWatchListsTables();

            // Load watch lists data from API
            await loadWatchListsData();

            // Sync flag lists (create/update automatic flag lists)
            await refreshFlagLists();

            // Restore page state (view mode, active list, sections)
            await restorePageState();

            // Ensure select maintains styling after any change (CSS variables handle color automatically)
            const selectEl = document.getElementById('activeListSelect');
            if (selectEl) {
                // CSS variables handle color automatically - just ensure fontWeight is maintained
                selectEl.style.fontWeight = '600';
                
                // Add event listener to maintain fontWeight after change
                selectEl.addEventListener('change', function() {
                    this.style.fontWeight = '600';
                });
            }
            
            // Update actions menu after page is fully initialized
            // Use setTimeout to ensure DOM is ready
            setTimeout(() => {
                updateActionsMenu();
            }, 200);

            // Initialize drag and drop
            if (window.WatchListsUIService?.initializeDragAndDrop) {
                window.WatchListsUIService.initializeDragAndDrop();
            }

            // Apply data attributes (data-bg-color, data-icon-color)
            applyDataAttributes();

            // Restore section states
            if (typeof window.restoreAllSectionStates === 'function') {
                window.restoreAllSectionStates();
            }

            // Trigger icon initialization after page is fully loaded
            if (typeof window.initializeIcons === 'function') {
                setTimeout(() => window.initializeIcons(), 100);
            }

            // Buttons are already in HTML, just initialize button system
            if (typeof window.initializeButtons === 'function') {
                setTimeout(() => window.initializeButtons(), 200);
            }

            window.Logger?.info?.('✅ Watch Lists Page initialized successfully', PAGE_LOG_CONTEXT);
        } catch (error) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה באתחול עמוד רשימות צפייה', 
                    `לא ניתן לאתחל את העמוד. ${errorMsg}`);
            } else if (window.Logger) {
                window.Logger.error('❌ Error initializing Watch Lists Page', { ...PAGE_LOG_CONTEXT, error: errorMsg });
            }
        }
    }

    /**
     * Register tables with UnifiedTableSystem
     */
    function registerWatchListsTables() {
        if (!window.UnifiedTableSystem) {
            window.Logger?.warn?.('⚠️ UnifiedTableSystem not available', PAGE_LOG_CONTEXT);
            return;
        }

        const getColumns = (tableType) => {
            return window.TABLE_COLUMN_MAPPINGS?.[tableType] || [];
        };

        // Register active list table
        window.UnifiedTableSystem.registry.register('watch_list_items', {
            dataGetter: () => activeListItems || [],
            updateFunction: async (data) => {
                activeListItems = Array.isArray(data) ? data : [];
                await renderActiveListView(activeListItems);
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
     * Load watch lists data from API
     * @async
     */
    async function loadWatchListsData() {
        // Show loading state
        const container = document.getElementById('watchListsGrid') || document.querySelector('.watch-lists-container');
        if (container && typeof window.showLoadingState === 'function') {
            window.showLoadingState(container.id || 'watchListsGrid');
        }
        
        try {
            // Load watch lists from API
            await loadWatchLists();

            // Load summary stats
            await calculateSummaryStats();
            
            // Hide loading state
            if (container && typeof window.hideLoadingState === 'function') {
                window.hideLoadingState(container.id || 'watchListsGrid');
            }

            window.Logger?.debug?.('✅ Watch lists data loaded', PAGE_LOG_CONTEXT);
        } catch (error) {
            // Hide loading state on error
            if (container && typeof window.hideLoadingState === 'function') {
                window.hideLoadingState(container.id || 'watchListsGrid');
            }
            
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה בטעינת נתונים', 
                    `לא ניתן לטעון את הנתונים. ${errorMsg}`);
            } else if (window.Logger) {
                window.Logger.error('❌ Error loading watch lists data', { 
                    ...PAGE_LOG_CONTEXT, 
                    error: errorMsg 
                });
            }
        }
    }

    /**
     * Load watch lists
     * @async
     */
    async function loadWatchLists() {
        try {
            if (!window.WatchListsDataService?.loadWatchListsData) {
                throw new Error('WatchListsDataService not available');
            }
            
            watchListsData = await window.WatchListsDataService.loadWatchListsData({ force: false });
            
            // Update actions menu after data is loaded
            updateActionsMenu();
            
            // Auto-select first list with items if no active list
            if (!activeListId && watchListsData && watchListsData.length > 0) {
                // Try to find first list with items (check both item_count and verify via API)
                let listToSelect = null;
                
                // First, try lists that show item_count > 0
                for (const list of watchListsData) {
                    if (list.item_count > 0) {
                        // Verify it actually has items by checking API
                        try {
                            const itemsResponse = await fetch(`/api/watch-lists/${list.id}/items?_ts=${Date.now()}`);
                            if (itemsResponse.ok) {
                                const itemsData = await itemsResponse.json();
                                const actualItemCount = itemsData.data?.length || 0;
                                if (actualItemCount > 0) {
                                    listToSelect = list;
                                    window.Logger?.info?.('✅ Found list with items (verified)', {
                                        ...PAGE_LOG_CONTEXT,
                                        listId: list.id,
                                        itemCount: actualItemCount
                                    });
                                    break;
                                }
                            }
                        } catch (e) {
                            window.Logger?.warn?.('⚠️ Error verifying list items', {
                                ...PAGE_LOG_CONTEXT,
                                listId: list.id,
                                error: e?.message
                            });
                        }
                    }
                }
                
                // If no verified list found, try first list anyway
                if (!listToSelect) {
                    listToSelect = watchListsData[0];
                }
                
                if (listToSelect) {
                    window.Logger?.info?.('🔄 Auto-selecting list', {
                        ...PAGE_LOG_CONTEXT,
                        listId: listToSelect.id,
                        listName: listToSelect.name,
                        itemCount: listToSelect.item_count
                    });
                    await selectList(listToSelect.id);
                }
            }
        } catch (error) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה בטעינת רשימות צפייה', 
                    `לא ניתן לטעון את הרשימות. ${errorMsg}`);
            } else if (window.Logger) {
                window.Logger.error('❌ Error loading watch lists', { ...PAGE_LOG_CONTEXT, error: errorMsg });
            }
        }
    }

    /**
     * Load watch list items
     * @param {number} listId - Watch list ID
     * @async
     */
    async function loadWatchListItems(listId) {
        try {
            if (!window.WatchListsDataService?.getWatchListItems) {
                throw new Error('WatchListsDataService not available');
            }
            
            window.Logger?.info?.('📥 [MONITOR] Loading watch list items', { ...PAGE_LOG_CONTEXT, listId });
            activeListItems = await window.WatchListsDataService.getWatchListItems(listId, { force: false });
            window.Logger?.info?.('✅ [MONITOR] Watch list items loaded from API', {
                ...PAGE_LOG_CONTEXT,
                listId,
                count: activeListItems?.length || 0,
                isArray: Array.isArray(activeListItems),
                firstItem: activeListItems?.[0],
                firstItemTickerId: activeListItems?.[0]?.ticker_id,
                firstItemHasTicker: !!activeListItems?.[0]?.ticker
            });
            
            if (!Array.isArray(activeListItems)) {
                window.Logger?.warn?.('⚠️ Watch list items is not an array', { ...PAGE_LOG_CONTEXT, listId, items: activeListItems });
                activeListItems = [];
            }
            
            // Enrich items with full ticker data (current price, position, etc.)
            // Wait for entityDetailsAPI if not yet available (package might still be loading)
            if (activeListItems.length > 0) {
                let maxWait = 5000; // Wait up to 5 seconds
                let waited = 0;
                while (!window.entityDetailsAPI && waited < maxWait) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    waited += 100;
                }
                
                if (window.entityDetailsAPI?.getEntityDetails) {
                    window.Logger?.info?.('🔄 [MONITOR] Enriching items with ticker market data', {
                        ...PAGE_LOG_CONTEXT,
                        count: activeListItems.length,
                        entityDetailsAPIAvailable: !!window.entityDetailsAPI,
                        getEntityDetailsAvailable: !!window.entityDetailsAPI?.getEntityDetails,
                        waitedMs: waited
                    });
                    activeListItems = await enrichWatchListItemsWithTickerData(activeListItems);
                window.Logger?.info?.('✅ [MONITOR] Enrichment completed', {
                    ...PAGE_LOG_CONTEXT,
                    enrichedCount: activeListItems?.length || 0,
                    firstItemHasTicker: !!activeListItems?.[0]?.ticker,
                    firstItemTickerPrice: activeListItems?.[0]?.ticker?.current_price,
                    firstItemTickerSymbol: activeListItems?.[0]?.ticker?.symbol,
                    firstItemTickerKeys: activeListItems?.[0]?.ticker ? Object.keys(activeListItems[0].ticker).slice(0, 20) : []
                });
            } else {
                // Skip enrichment silently if entityDetailsAPI not available - reduce console noise
                // This is normal during initialization or when API is not loaded yet
            }
            }
            
            // Ensure we have data before rendering
            if (activeListItems.length === 0) {
                window.Logger?.debug?.('No items in list, rendering empty state', { ...PAGE_LOG_CONTEXT, listId });
            } else {
                window.Logger?.info?.('🔄 [MONITOR] About to render active list view', {
                    ...PAGE_LOG_CONTEXT,
                    itemsCount: activeListItems.length,
                    viewMode: currentViewMode,
                    firstItemTickerPrice: activeListItems[0]?.ticker?.current_price
                });
            }
            
            await renderActiveListView(activeListItems);
            window.Logger?.info?.('✅ [MONITOR] Active list view rendered', { ...PAGE_LOG_CONTEXT });
        } catch (error) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            window.Logger?.error?.('❌ Error loading watch list items', { ...PAGE_LOG_CONTEXT, listId, error: errorMsg });
            
            // Clear items on error
            activeListItems = [];
            await renderActiveListView([]);
            
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה בטעינת פריטי רשימה', 
                    `לא ניתן לטעון את הפריטים. ${errorMsg}`);
            }
        }
    }

    /**
     * Enrich watch list items with full ticker market data
     * @param {Array} items - Watch list items to enrich
     * @returns {Promise<Array>} Enriched items
     */
    async function enrichWatchListItemsWithTickerData(items) {
        if (!Array.isArray(items) || items.length === 0) {
            window.Logger?.debug?.('⚠️ No items to enrich', { ...PAGE_LOG_CONTEXT });
            return items;
        }

        if (!window.entityDetailsAPI?.getEntityDetails) {
            window.Logger?.warn?.('⚠️ entityDetailsAPI not available, skipping enrichment', PAGE_LOG_CONTEXT);
            return items;
        }

        window.Logger?.info?.('🔄 [MONITOR] Enriching watch list items with ticker data', {
            ...PAGE_LOG_CONTEXT,
            itemsCount: items.length,
            itemIds: items.map(i => i.id),
            tickerIds: items.map(i => i.ticker_id || i.ticker?.id).filter(Boolean)
        });

        // Load position data once for all items (optimization)
        let positionsMap = {};
        try {
            window.Logger?.debug?.('🔄 [MONITOR] Fetching positions...', { ...PAGE_LOG_CONTEXT });
            const portfolioResponse = await fetch('/api/positions/portfolio?unify_accounts=true');
            if (portfolioResponse && portfolioResponse.ok) {
                const portfolioData = await portfolioResponse.json();
                // The API returns: { status: "success", data: { positions: [...], summary: {...} } }
                const positions = portfolioData?.data?.positions || 
                                 (Array.isArray(portfolioData?.data) ? portfolioData.data : []) || [];
                // Create a map: ticker_id -> position
                positions.forEach(pos => {
                    if (pos.ticker_id) {
                        positionsMap[pos.ticker_id] = pos;
                    }
                });
                window.Logger?.info?.('✅ [MONITOR] Loaded position data for enrichment', {
                    ...PAGE_LOG_CONTEXT,
                    positionsCount: positions.length,
                    itemsCount: items.length,
                    uniqueTickers: Object.keys(positionsMap).length
                });
            } else {
                // Positions API failed - continue without position data
                // Removed warning log to reduce console noise
            }
        } catch (positionError) {
            // Position data is optional - log but don't fail
            window.Logger?.warn?.('⚠️ [MONITOR] Could not load position data (optional)', {
                ...PAGE_LOG_CONTEXT,
                error: positionError?.message || positionError
            });
        }

        const enrichedItems = await Promise.all(
            items.map(async (item, index) => {
                try {
                    // Preserve flag data before enrichment
                    const flagColor = item.flag_color;
                    const flagEntityType = item.flag_entity_type;
                    
                    // Get ticker ID (either from item.ticker_id or item.ticker.id)
                    const tickerId = item.ticker_id || item.ticker?.id;
                    if (!tickerId) {
                        window.Logger?.warn?.('⚠️ [MONITOR] No ticker ID for item, skipping enrichment', {
                            ...PAGE_LOG_CONTEXT,
                            itemId: item.id,
                            index: `${index + 1}/${items.length}`
                        });
                        // Ensure flag data is preserved
                        item.flag_color = flagColor;
                        item.flag_entity_type = flagEntityType;
                        return item;
                    }

                    window.Logger?.debug?.('🔄 [MONITOR] Fetching entity details', {
                        ...PAGE_LOG_CONTEXT,
                        itemId: item.id,
                        tickerId,
                        index: `${index + 1}/${items.length}`
                    });

                    // Load full ticker data with market data
                    const tickerData = await window.entityDetailsAPI.getEntityDetails('ticker', tickerId, {
                        includeMarketData: true,
                        includeLinkedItems: false, // Don't load linked items for performance
                        forceRefresh: false
                    });

                    window.Logger?.info?.('📊 [MONITOR] Entity details received', {
                        ...PAGE_LOG_CONTEXT,
                        itemId: item.id,
                        tickerId,
                        hasData: !!tickerData,
                        dataKeys: tickerData ? Object.keys(tickerData).slice(0, 20) : [],
                        current_price: tickerData?.current_price,
                        change_percent: tickerData?.change_percent,
                        atr: tickerData?.atr
                    });

                    if (tickerData) {
                        // Add position data from the map we loaded earlier
                        const tickerPosition = positionsMap[tickerId];
                        if (tickerPosition) {
                            tickerData.position = {
                                quantity: tickerPosition.quantity || 0,
                                side: tickerPosition.side || 'closed',
                                market_value: tickerPosition.market_value,
                                unrealized_pl: tickerPosition.unrealized_pl,
                                unrealized_pl_percent: tickerPosition.unrealized_pl_percent
                            };
                            
                            // Add P/L fields for display
                            tickerData.profit_loss = tickerPosition.unrealized_pl;
                            tickerData.pl = tickerPosition.unrealized_pl;
                            tickerData.profit_loss_percent = tickerPosition.unrealized_pl_percent;
                            tickerData.pl_percent = tickerPosition.unrealized_pl_percent;
                            
                            window.Logger?.debug?.('✅ [MONITOR] Added position data', {
                                ...PAGE_LOG_CONTEXT,
                                tickerId,
                                quantity: tickerData.position.quantity,
                                side: tickerData.position.side
                            });
                        } else {
                            window.Logger?.debug?.('ℹ️ [MONITOR] No position found for ticker', {
                                ...PAGE_LOG_CONTEXT,
                                tickerId
                            });
                        }

                        // Merge ticker data into item.ticker
                        item.ticker = {
                            ...(item.ticker || {}),
                            ...tickerData
                        };
                        
                        // CRITICAL: Preserve flag data after enrichment
                        item.flag_color = flagColor;
                        item.flag_entity_type = flagEntityType;
                        
                        window.Logger?.info?.('✅ [MONITOR] Enriched item with ticker data', {
                            ...PAGE_LOG_CONTEXT,
                            itemId: item.id,
                            tickerId,
                            symbol: tickerData.symbol,
                            hasPrice: tickerData.current_price !== null && tickerData.current_price !== undefined,
                            price: tickerData.current_price,
                            hasChange: tickerData.change_percent !== null && tickerData.change_percent !== undefined,
                            changePercent: tickerData.change_percent,
                            hasATR: tickerData.atr !== null && tickerData.atr !== undefined,
                            atr: tickerData.atr,
                            hasPosition: !!tickerData.position,
                            positionQuantity: tickerData.position?.quantity,
                            hasPL: tickerData.profit_loss !== null && tickerData.profit_loss !== undefined,
                            pl: tickerData.profit_loss,
                            allKeys: Object.keys(tickerData).slice(0, 30),
                            flag_color: item.flag_color,
                            flag_entity_type: item.flag_entity_type
                        });
                    } else {
                        window.Logger?.warn?.('⚠️ [MONITOR] No ticker data returned from entityDetailsAPI', {
                            ...PAGE_LOG_CONTEXT,
                            itemId: item.id,
                            tickerId
                        });
                        // Ensure flag data is preserved even if no ticker data
                        item.flag_color = flagColor;
                        item.flag_entity_type = flagEntityType;
                    }

                    return item;
                } catch (error) {
                    // If enrichment fails, return original item but preserve flag data
                    // Note: flagColor and flagEntityType are captured at the start of the try block
                    window.Logger?.error?.('❌ [MONITOR] Failed to enrich item with ticker data', {
                        ...PAGE_LOG_CONTEXT,
                        itemId: item.id,
                        tickerId: item.ticker_id || item.ticker?.id,
                        error: error?.message || error,
                        stack: error?.stack
                    });
                    // Ensure flag data is preserved (already captured at start of try block)
                    item.flag_color = flagColor;
                    item.flag_entity_type = flagEntityType;
                    return item;
                }
            })
        );

        window.Logger?.info?.('✅ [MONITOR] Enrichment completed', {
            ...PAGE_LOG_CONTEXT,
            enrichedCount: enrichedItems.length,
            firstItemHasTicker: !!enrichedItems[0]?.ticker,
            firstItemTickerKeys: enrichedItems[0]?.ticker ? Object.keys(enrichedItems[0].ticker).slice(0, 20) : []
        });

        return enrichedItems;
    }

    // ===== RENDERING =====

    /**
     * Render active list view
     * @param {Array} items - Items to render
     * @async
     */
    async function renderActiveListView(items) {
        if (!items) items = [];

        window.Logger?.debug?.('🎨 Rendering active list view', { ...PAGE_LOG_CONTEXT, mode: currentViewMode, itemsCount: items.length });

        try {
        // Table view is handled by UnifiedTableSystem or manual rendering
        if (currentViewMode === 'table') {
            // Use UI Service if available, otherwise manual rendering
            if (window.WatchListsUIService?.renderTableView) {
                    window.Logger?.debug?.('Using WatchListsUIService.renderTableView', { ...PAGE_LOG_CONTEXT });
                window.WatchListsUIService.renderTableView(items);
            } else {
                // Manual table rendering will be handled by updateWatchListItemsTable
                    window.Logger?.debug?.('Using manual updateWatchListItemsTable', { ...PAGE_LOG_CONTEXT });
                    await updateWatchListItemsTable(items);
            }
        } else if (currentViewMode === 'cards') {
            if (window.WatchListsUIService?.renderCardsView) {
                window.WatchListsUIService.renderCardsView(items);
            } else {
                    await renderCardsView(items);
            }
        } else if (currentViewMode === 'compact') {
            if (window.WatchListsUIService?.renderCompactView) {
                window.WatchListsUIService.renderCompactView(items);
            } else {
                    await renderCompactView(items);
            }
        }

        window.Logger?.debug?.('📊 Active list view rendered', { ...PAGE_LOG_CONTEXT, mode: currentViewMode, count: items.length });
        } catch (error) {
            window.Logger?.error?.('❌ Error rendering active list view', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        }
    }

    /**
     * Update watch list items table
     * @param {Array} items - Items to render
     * @async
     */
    async function updateWatchListItemsTable(items) {
        window.Logger?.debug?.('🔄 updateWatchListItemsTable called', { ...PAGE_LOG_CONTEXT, itemsCount: items?.length || 0 });
        
        const tbody = document.getElementById('watchListItemsTableBody');
        if (!tbody) {
            window.Logger?.warn?.('⚠️ watchListItemsTableBody not found', PAGE_LOG_CONTEXT);
            // Try alternative selector
            const alternativeTbody = document.querySelector('#watchListItemsTable tbody');
            if (alternativeTbody) {
                window.Logger?.info?.('Found alternative tbody selector', PAGE_LOG_CONTEXT);
                return updateWatchListItemsTable(items); // Recursive call with found element
            }
            return;
        }

        // Clear existing rows
        tbody.innerHTML = '';

        // If no data, show empty message
        if (!items || items.length === 0) {
            window.Logger?.debug?.('No items to render, showing empty message', PAGE_LOG_CONTEXT);
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 11;
            td.className = 'text-center text-muted';
            td.textContent = 'אין פריטים ברשימה זו. לחץ על "הוסף טיקר לרשימה" כדי להתחיל.';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        window.Logger?.info?.('🔄 [MONITOR] Rendering items to table', {
            ...PAGE_LOG_CONTEXT,
            itemsCount: items.length,
            firstItemKeys: items[0] ? Object.keys(items[0]) : [],
            firstItemTicker: items[0]?.ticker ? Object.keys(items[0].ticker).slice(0, 20) : []
        });

        // Render each item with full data using FieldRendererService
        // Using for...of loop to avoid async issues with forEach
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            window.Logger?.debug?.('🔄 [MONITOR] Rendering item', {
                ...PAGE_LOG_CONTEXT,
                index: `${i + 1}/${items.length}`,
                itemId: item.id,
                tickerId: item.ticker_id,
                hasTicker: !!item.ticker,
                tickerKeys: item.ticker ? Object.keys(item.ticker).slice(0, 20) : [],
                flag_color: item.flag_color,
                flag_entity_type: item.flag_entity_type
            });

            const tr = document.createElement('tr');
            tr.setAttribute('data-item-id', item.id);
            tr.setAttribute('draggable', 'true');

            const ticker = item.ticker || {};
            const currencySymbol = ticker.currency_symbol || ticker.currency?.symbol || '$';
            
            window.Logger?.debug?.('📊 [MONITOR] Item ticker data', {
                ...PAGE_LOG_CONTEXT,
                itemId: item.id,
                symbol: ticker.symbol,
                current_price: ticker.current_price,
                price: ticker.price,
                change: ticker.change,
                change_percent: ticker.change_percent,
                currencySymbol
            });

            // Drag handle column
            const tdDrag = document.createElement('td');
            tdDrag.className = 'drag-handle-column';
            const dragHandle = document.createElement('span');
            dragHandle.className = 'drag-handle';
            dragHandle.textContent = '≡';
            tdDrag.appendChild(dragHandle);
            tr.appendChild(tdDrag);

            // Flag column
            const tdFlag = document.createElement('td');
            const flagBtn = document.createElement('button');
            flagBtn.type = 'button';
            flagBtn.className = 'btn btn-sm btn-flag';
            
            // CRITICAL: Flag color comes from API (determined by which flag list ticker is in)
            const flagColor = item.flag_color;
            if (flagColor) {
                flagBtn.setAttribute('data-flag-color', flagColor);
                // Set color on button and icon - use !important to override any CSS
                flagBtn.style.setProperty('color', flagColor, 'important');
                flagBtn.style.setProperty('border-color', flagColor, 'important');
                flagBtn.style.setProperty('border-width', '2px', 'important');
                flagBtn.style.setProperty('border-style', 'solid', 'important');
                flagBtn.style.setProperty('background-color', 'transparent', 'important');
                flagBtn.style.setProperty('opacity', '1', 'important'); // Full opacity for items with flag
            } else {
                // No flag - show thin gray border with 0.5 opacity
                flagBtn.style.setProperty('border-color', '#6c757d', 'important'); // Gray
                flagBtn.style.setProperty('border-width', '1px', 'important');
                flagBtn.style.setProperty('border-style', 'solid', 'important');
                flagBtn.style.setProperty('background-color', 'transparent', 'important');
                flagBtn.style.setProperty('color', '#6c757d', 'important'); // Gray icon
                flagBtn.style.setProperty('opacity', '0.5', 'important'); // 0.5 opacity for items without flag
            }
            flagBtn.setAttribute('data-onclick', `window.WatchListsPage?.showFlagPalette(${item.id})`);
            flagBtn.title = 'שינוי דגל';
            // Add direct event listener as backup
            flagBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent row click
                if (window.WatchListsPage?.showFlagPalette) {
                    window.WatchListsPage.showFlagPalette(item.id);
                } else if (window.showFlagPalette) {
                    window.showFlagPalette(item.id);
                } else {
                    window.Logger?.warn?.('⚠️ showFlagPalette not available', { ...PAGE_LOG_CONTEXT, itemId: item.id });
                }
            });
            const flagIcon = document.createElement('span');
            flagIcon.className = 'icon-placeholder icon';
            flagIcon.setAttribute('data-icon', flagColor ? 'flag-filled' : 'flag');
            flagIcon.setAttribute('data-size', '11'); // Reduced by 30% (from 16 to 11)
            flagIcon.setAttribute('data-alt', 'flag');
            flagIcon.setAttribute('aria-label', 'flag');
            if (flagColor) {
                // Set color on icon - use !important to override any CSS
                flagIcon.style.setProperty('color', flagColor, 'important');
                flagIcon.style.setProperty('fill', flagColor, 'important');
                flagIcon.style.setProperty('stroke', flagColor, 'important');
                // Also set as data attribute for icon system
                flagIcon.setAttribute('data-color', flagColor);
                // Set CSS variable for SVG icons
                flagIcon.style.setProperty('--icon-color', flagColor, 'important');
            } else {
                // No flag - gray icon
                flagIcon.style.setProperty('color', '#6c757d', 'important'); // Gray
                flagIcon.style.setProperty('fill', '#6c757d', 'important');
                flagIcon.style.setProperty('stroke', '#6c757d', 'important');
            }
            flagBtn.appendChild(flagIcon);
            
            // CRITICAL: Replace icon placeholder with actual SVG icon immediately
            const iconColor = flagColor || '#6c757d'; // Use flag color or gray for no flag
            const iconName = flagColor ? 'flag-filled' : 'flag';
            
            // Try to render icon immediately if IconSystem is available
            if (window.IconSystem && window.IconSystem.initialized && window.IconSystem.renderIcon) {
                window.IconSystem.renderIcon('button', iconName, {
                    size: '11', // Reduced by 30% (from 16 to 11)
                    alt: 'flag',
                    class: 'icon',
                    style: `color: ${iconColor} !important; fill: ${iconColor} !important; stroke: ${iconColor} !important;`
                }).then(iconHTML => {
                    if (iconHTML && flagIcon.parentNode) {
                        // Create temporary container to parse HTML
                        const temp = document.createElement('div');
                        temp.innerHTML = iconHTML;
                        const newIcon = temp.firstElementChild;
                        if (newIcon) {
                            // Apply color to SVG
                            if (newIcon.tagName === 'svg') {
                                // Set SVG attributes for currentColor support
                                newIcon.setAttribute('fill', 'none');
                                newIcon.setAttribute('stroke', 'currentColor');
                                newIcon.style.setProperty('color', iconColor, 'important');
                                newIcon.style.setProperty('fill', 'none', 'important');
                                newIcon.style.setProperty('stroke', iconColor, 'important');
                                // Also set on all paths and other elements inside SVG
                                const paths = newIcon.querySelectorAll('path, circle, rect, line, polyline, polygon');
                                paths.forEach(path => {
                                    // Remove any existing fill/stroke attributes that might override
                                    path.removeAttribute('fill');
                                    path.removeAttribute('stroke');
                                    // Set style properties
                                    path.style.setProperty('fill', 'none', 'important');
                                    path.style.setProperty('stroke', iconColor, 'important');
                                    path.style.setProperty('color', iconColor, 'important');
                                });
                            } else if (newIcon.tagName === 'IMG') {
                                // For img tags, use CSS filter to change color
                                newIcon.style.setProperty('filter', `brightness(0) saturate(100%) invert(${iconColor === '#6c757d' ? '50%' : '0%'}) sepia(100%) saturate(10000%) hue-rotate(${iconColor === '#26baac' ? '160deg' : '0deg'})`, 'important');
                            }
                            // Replace placeholder with rendered icon
                            flagIcon.replaceWith(newIcon);
                        }
                    }
                }).catch(error => {
                    window.Logger?.warn?.('⚠️ Failed to render flag icon', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
                });
            }
            
            // Also use MutationObserver as backup to catch when icon is replaced by IconSystem
            if (window.MutationObserver) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) { // Element node
                                // Check if it's an SVG or contains SVG
                                const svg = node.tagName === 'svg' ? node : node.querySelector('svg');
                                if (svg) {
                                    // Set SVG attributes for currentColor support
                                    svg.setAttribute('fill', 'none');
                                    svg.setAttribute('stroke', 'currentColor');
                                    svg.style.setProperty('color', iconColor, 'important');
                                    svg.style.setProperty('fill', 'none', 'important');
                                    svg.style.setProperty('stroke', iconColor, 'important');
                                    // Also set on all paths and other elements inside SVG
                                    const paths = svg.querySelectorAll('path, circle, rect, line, polyline, polygon');
                                    paths.forEach(path => {
                                        // Remove any existing fill/stroke attributes that might override
                                        path.removeAttribute('fill');
                                        path.removeAttribute('stroke');
                                        // Set style properties
                                        path.style.setProperty('fill', 'none', 'important');
                                        path.style.setProperty('stroke', iconColor, 'important');
                                        path.style.setProperty('color', iconColor, 'important');
                                    });
                                }
                            }
                        });
                    });
                });
                observer.observe(flagIcon.parentNode, { childList: true, subtree: true });
                // Stop observing after 3 seconds
                setTimeout(() => observer.disconnect(), 3000);
            }
            
            // Log for debugging
            if (flagColor) {
                window.Logger?.debug?.('✅ Flag color set', { ...PAGE_LOG_CONTEXT, itemId: item.id, flagColor });
            } else {
                window.Logger?.debug?.('⚠️ No flag color', { ...PAGE_LOG_CONTEXT, itemId: item.id, hasFlagColor: !!item.flag_color });
            }
            tdFlag.appendChild(flagBtn);
            tr.appendChild(tdFlag);

            // Symbol column
            const tdSymbol = document.createElement('td');
            const strong = document.createElement('strong');
            const symbol = ticker.symbol || item.external_symbol || `טיקר #${item.id}`;
            strong.textContent = symbol;
            tdSymbol.appendChild(strong);
            if (item.external_symbol) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary ms-2';
                badge.textContent = 'חיצוני';
                tdSymbol.appendChild(badge);
            }
            tr.appendChild(tdSymbol);
            
            window.Logger?.debug?.('✅ [MONITOR] Symbol rendered', {
                ...PAGE_LOG_CONTEXT,
                itemId: item.id,
                symbol: symbol
            });

            // Price column - using FieldRendererService
            const tdPrice = document.createElement('td');
            const price = ticker.current_price ?? ticker.price ?? null;
            window.Logger?.debug?.('💰 [MONITOR] Price rendering', {
                ...PAGE_LOG_CONTEXT,
                itemId: item.id,
                symbol: symbol,
                priceValue: price,
                priceType: typeof price,
                isFinite: price !== null && price !== undefined ? Number.isFinite(parseFloat(price)) : false,
                hasFieldRendererService: !!window.FieldRendererService,
                hasRenderAmount: !!window.FieldRendererService?.renderAmount
            });
            if (price !== null && price !== undefined && !isNaN(parseFloat(price)) && Number.isFinite(parseFloat(price)) && window.FieldRendererService?.renderAmount) {
                const renderedPrice = window.FieldRendererService.renderAmount(parseFloat(price), currencySymbol, 2, false);
                tdPrice.innerHTML = renderedPrice;
                window.Logger?.debug?.('✅ [MONITOR] Price rendered', {
                    ...PAGE_LOG_CONTEXT,
                    itemId: item.id,
                    rendered: renderedPrice
                });
            } else {
                tdPrice.textContent = 'לא זמין';
                tdPrice.className = 'text-muted';
                window.Logger?.warn?.('⚠️ [MONITOR] Price not rendered', {
                    ...PAGE_LOG_CONTEXT,
                    itemId: item.id,
                    price,
                    reason: !price ? 'no price' : isNaN(parseFloat(price)) ? 'not a number' : !Number.isFinite(parseFloat(price)) ? 'not finite' : !window.FieldRendererService ? 'no FieldRendererService' : !window.FieldRendererService.renderAmount ? 'no renderAmount' : 'unknown'
                });
            }
            tr.appendChild(tdPrice);

            // Get change percent first (needed for fallback calculation)
            const changePercent = ticker.change_percent ?? ticker.change_percentage ?? null;

            // Change column - using FieldRendererService
            // Try multiple field names: daily_change, change_amount, change_amount_day, change
            const tdChange = document.createElement('td');
            let change = ticker.daily_change ?? ticker.change_amount ?? ticker.change_amount_day ?? ticker.change ?? null;
            
            // If change is null but we have change_percent and price, calculate it
            if ((change === null || change === undefined || isNaN(parseFloat(change))) && 
                price !== null && price !== undefined && !isNaN(parseFloat(price)) &&
                changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent))) {
                // Calculate: change = price * (changePercent / 100)
                change = parseFloat(price) * (parseFloat(changePercent) / 100);
            }
            
            if (change !== null && change !== undefined && !isNaN(parseFloat(change)) && Number.isFinite(parseFloat(change)) && window.FieldRendererService?.renderAmount) {
                tdChange.innerHTML = window.FieldRendererService.renderAmount(parseFloat(change), currencySymbol, 2, true);
            } else {
                tdChange.textContent = '-';
                tdChange.className = 'text-muted';
            }
            tr.appendChild(tdChange);

            // Change % column - using FieldRendererService
            const tdChangePercent = document.createElement('td');
            if (changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent)) && window.FieldRendererService?.renderNumericValue) {
                tdChangePercent.innerHTML = window.FieldRendererService.renderNumericValue(parseFloat(changePercent), '%', true);
            } else {
                tdChangePercent.textContent = '-';
                tdChangePercent.className = 'text-muted';
            }
            tr.appendChild(tdChangePercent);

            // Daily Change % column - using FieldRendererService
            const tdDailyChange = document.createElement('td');
            const dailyChangePercent = ticker.daily_change_percent ?? ticker.daily_change_percentage ?? null;
            if (dailyChangePercent !== null && dailyChangePercent !== undefined && !isNaN(parseFloat(dailyChangePercent)) && window.FieldRendererService?.renderNumericValue) {
                tdDailyChange.innerHTML = window.FieldRendererService.renderNumericValue(parseFloat(dailyChangePercent), '%', true);
            } else {
                tdDailyChange.textContent = '-';
                tdDailyChange.className = 'text-muted';
            }
            tr.appendChild(tdDailyChange);

            // ATR column - using FieldRendererService (async)
            const tdATR = document.createElement('td');
            const atr = ticker.atr || null;
            const atrPercent = ticker.atr_percent || (atr !== null && price !== null && price > 0 ? (parseFloat(atr) / parseFloat(price) * 100) : null);
            if (atr !== null && atrPercent !== null && window.FieldRendererService?.renderATR) {
                // ATR is async - set placeholder first, then update
                tdATR.textContent = 'טוען...';
                tdATR.className = 'text-muted';
                // Render ATR async
                (async () => {
                    try {
                        const atrHtml = await window.FieldRendererService.renderATR(atr, atrPercent);
                        tdATR.innerHTML = atrHtml;
                    } catch (e) {
                        window.Logger?.warn?.('Error rendering ATR', { ...PAGE_LOG_CONTEXT, error: e });
                        tdATR.textContent = atrPercent ? `${atrPercent.toFixed(2)}%` : '-';
                        tdATR.className = 'text-muted';
                    }
                })();
            } else {
                tdATR.textContent = atrPercent ? `${atrPercent.toFixed(2)}%` : '-';
                tdATR.className = 'text-muted';
            }
            tr.appendChild(tdATR);

            // Position column - display position in two lines: badge on first line, quantity on second line
            const tdPosition = document.createElement('td');
            const position = ticker.position || item.position || null;
            if (position && position.quantity !== undefined && position.quantity !== null) {
                const quantity = parseFloat(position.quantity) || 0;
                const side = position.side || (quantity > 0 ? 'long' : quantity < 0 ? 'short' : 'closed');
                const quantityAbs = Math.abs(quantity);
                
                // Render position in two lines: badge on first line, quantity on second line
                let positionHtml = '';
                if (quantity !== 0) {
                    const sign = quantity > 0 ? '+' : '-';
                    const sideLabel = side === 'long' ? 'לונג' : side === 'short' ? 'שורט' : '';
                    
                    // First line: Side badge
                    let badgeHtml = '';
                    if (window.FieldRendererService?.renderSide) {
                        badgeHtml = window.FieldRendererService.renderSide(side);
                    } else {
                        badgeHtml = `<span class="badge badge-${side}">${sideLabel}</span>`;
                    }
                    
                    // Second line: Quantity (without + sign, only - if negative)
                    const quantityHtml = quantity < 0 ? `-${quantityAbs.toLocaleString()}` : quantityAbs.toLocaleString();
                    
                    // Combine in two lines with line break
                    positionHtml = `<div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">${badgeHtml}<span>${quantityHtml}</span></div>`;
                } else {
                    positionHtml = '-';
                }
                
                tdPosition.innerHTML = positionHtml;
            } else {
                tdPosition.textContent = '-';
                tdPosition.className = 'text-muted';
            }
            tr.appendChild(tdPosition);

            // Value Change column - calculate change in value (change * quantity or price * quantity * change_percent / 100)
            const tdValueChange = document.createElement('td');
            tdValueChange.className = 'col-value-change';
            let valueChange = null;
            const positionQty = position && position.quantity !== undefined && position.quantity !== null ? parseFloat(position.quantity) : null;
            if (positionQty !== null && positionQty !== 0) {
                const qtyAbs = Math.abs(positionQty);
                // Try to calculate from change amount first
                if (change !== null && change !== undefined && !isNaN(parseFloat(change))) {
                    valueChange = parseFloat(change) * qtyAbs;
                } else if (changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent)) && price !== null && price !== undefined && !isNaN(parseFloat(price))) {
                    // Calculate from change percent: valueChange = price * quantity * (changePercent / 100)
                    valueChange = parseFloat(price) * qtyAbs * (parseFloat(changePercent) / 100);
                }
            }
            if (valueChange !== null && valueChange !== undefined && !isNaN(valueChange) && window.FieldRendererService?.renderAmount) {
                tdValueChange.innerHTML = window.FieldRendererService.renderAmount(valueChange, currencySymbol, 2, true);
            } else {
                tdValueChange.textContent = '-';
                tdValueChange.className = 'text-muted';
            }
            tr.appendChild(tdValueChange);

            // P/L column - using FieldRendererService
            const tdPL = document.createElement('td');
            const pl = ticker.profit_loss ?? ticker.pl ?? null;
            if (pl !== null && pl !== undefined && !isNaN(parseFloat(pl)) && window.FieldRendererService?.renderAmount) {
                tdPL.innerHTML = window.FieldRendererService.renderAmount(parseFloat(pl), currencySymbol, 2, true);
            } else {
                tdPL.textContent = '-';
                tdPL.className = 'text-muted';
            }
            tr.appendChild(tdPL);

            // P/L % column - using FieldRendererService
            const tdPLPercent = document.createElement('td');
            const plPercent = ticker.profit_loss_percent ?? ticker.pl_percent ?? null;
            if (plPercent !== null && plPercent !== undefined && !isNaN(parseFloat(plPercent)) && window.FieldRendererService?.renderNumericValue) {
                tdPLPercent.innerHTML = window.FieldRendererService.renderNumericValue(parseFloat(plPercent), '%', true);
            } else {
                tdPLPercent.textContent = '-';
                tdPLPercent.className = 'text-muted';
            }
            tr.appendChild(tdPLPercent);

            // Actions column - only delete button (no edit button for items)
            const tdActions = document.createElement('td');
            tdActions.className = 'actions-cell';
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'action-buttons-container';

            // Delete button - using data-button-type for proper icon rendering
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.setAttribute('data-button-type', 'DELETE');
            deleteBtn.setAttribute('data-variant', 'small');
            deleteBtn.setAttribute('data-text', '');
            deleteBtn.setAttribute('data-onclick', `window.WatchListsPage?.removeItem(${item.id})`);
            deleteBtn.title = 'מחיקה';
            actionsContainer.appendChild(deleteBtn);

            tdActions.appendChild(actionsContainer);
            tr.appendChild(tdActions);

            tbody.appendChild(tr);
        }

        // Initialize button system for new buttons - use processButtons for better icon rendering
        if (window.ButtonSystemInit?.processButtons) {
            setTimeout(() => {
                window.ButtonSystemInit.processButtons(tbody);
                // Also process icons with flag colors after they're rendered
                setTimeout(async () => {
                    // First, replace all icon placeholders with actual icons
                    const placeholders = tbody.querySelectorAll('.btn-flag .icon-placeholder');
                    for (const placeholder of placeholders) {
                        const btn = placeholder.closest('.btn-flag');
                        const color = placeholder.getAttribute('data-color') || btn?.getAttribute('data-flag-color') || '#6c757d';
                        const iconName = btn?.getAttribute('data-flag-color') ? 'flag-filled' : 'flag';
                        
                        if (window.IconSystem && window.IconSystem.initialized && window.IconSystem.renderIcon) {
                            try {
                                const iconHTML = await window.IconSystem.renderIcon('button', iconName, {
                                    size: '11', // Reduced by 30% (from 16 to 11)
                                    alt: 'flag',
                                    class: 'icon',
                                    style: `color: ${color} !important; fill: none !important; stroke: ${color} !important;`
                                });
                                if (iconHTML && placeholder.parentNode) {
                                    const temp = document.createElement('div');
                                    temp.innerHTML = iconHTML;
                                    const newIcon = temp.firstElementChild;
                                    if (newIcon) {
                                        // Apply color to SVG
                                        if (newIcon.tagName === 'svg') {
                                            newIcon.setAttribute('fill', 'none');
                                            newIcon.setAttribute('stroke', 'currentColor');
                                            newIcon.style.setProperty('color', color, 'important');
                                            newIcon.style.setProperty('fill', 'none', 'important');
                                            newIcon.style.setProperty('stroke', color, 'important');
                                            const paths = newIcon.querySelectorAll('path, circle, rect, line, polyline, polygon');
                                            paths.forEach(path => {
                                                path.removeAttribute('fill');
                                                path.removeAttribute('stroke');
                                                path.style.setProperty('fill', 'none', 'important');
                                                path.style.setProperty('stroke', color, 'important');
                                                path.style.setProperty('color', color, 'important');
                                            });
                                        }
                                        placeholder.replaceWith(newIcon);
                                    }
                                }
                            } catch (error) {
                                window.Logger?.warn?.('⚠️ Failed to render flag icon', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
                            }
                        }
                    }
                    
                    // Then apply color to all existing SVG icons
                    const flagIcons = tbody.querySelectorAll('.btn-flag svg');
                    flagIcons.forEach(icon => {
                        const btn = icon.closest('.btn-flag');
                        const color = btn?.getAttribute('data-flag-color') || '#6c757d';
                        // Set SVG attributes for currentColor support
                        icon.setAttribute('fill', 'none');
                        icon.setAttribute('stroke', 'currentColor');
                        icon.style.setProperty('color', color, 'important');
                        icon.style.setProperty('fill', 'none', 'important');
                        icon.style.setProperty('stroke', color, 'important');
                        // Also set on all paths and other elements inside SVG
                        const paths = icon.querySelectorAll('path, circle, rect, line, polyline, polygon');
                        paths.forEach(path => {
                            // Remove any existing fill/stroke attributes that might override
                            path.removeAttribute('fill');
                            path.removeAttribute('stroke');
                            // Set style properties
                            path.style.setProperty('fill', 'none', 'important');
                            path.style.setProperty('stroke', color, 'important');
                            path.style.setProperty('color', color, 'important');
                        });
                    });
                }, 200);
            }, 100);
        } else if (window.ButtonSystemInit?.initializeButtons) {
            setTimeout(() => {
            window.ButtonSystemInit.initializeButtons(tbody);
                // Also process icons with flag colors after they're rendered
                setTimeout(async () => {
                    // First, replace all icon placeholders with actual icons
                    const placeholders = tbody.querySelectorAll('.btn-flag .icon-placeholder');
                    for (const placeholder of placeholders) {
                        const btn = placeholder.closest('.btn-flag');
                        const color = placeholder.getAttribute('data-color') || btn?.getAttribute('data-flag-color') || '#6c757d';
                        const iconName = btn?.getAttribute('data-flag-color') ? 'flag-filled' : 'flag';
                        
                        if (window.IconSystem && window.IconSystem.initialized && window.IconSystem.renderIcon) {
                            try {
                                const iconHTML = await window.IconSystem.renderIcon('button', iconName, {
                                    size: '11', // Reduced by 30% (from 16 to 11)
                                    alt: 'flag',
                                    class: 'icon',
                                    style: `color: ${color} !important; fill: none !important; stroke: ${color} !important;`
                                });
                                if (iconHTML && placeholder.parentNode) {
                                    const temp = document.createElement('div');
                                    temp.innerHTML = iconHTML;
                                    const newIcon = temp.firstElementChild;
                                    if (newIcon) {
                                        // Apply color to SVG
                                        if (newIcon.tagName === 'svg') {
                                            newIcon.setAttribute('fill', 'none');
                                            newIcon.setAttribute('stroke', 'currentColor');
                                            newIcon.style.setProperty('color', color, 'important');
                                            newIcon.style.setProperty('fill', 'none', 'important');
                                            newIcon.style.setProperty('stroke', color, 'important');
                                            const paths = newIcon.querySelectorAll('path, circle, rect, line, polyline, polygon');
                                            paths.forEach(path => {
                                                path.removeAttribute('fill');
                                                path.removeAttribute('stroke');
                                                path.style.setProperty('fill', 'none', 'important');
                                                path.style.setProperty('stroke', color, 'important');
                                                path.style.setProperty('color', color, 'important');
                                            });
                                        }
                                        placeholder.replaceWith(newIcon);
                                    }
                                }
                            } catch (error) {
                                window.Logger?.warn?.('⚠️ Failed to render flag icon', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
                            }
                        }
                    }
                    
                    // Then apply color to all existing SVG icons
                    const flagIcons = tbody.querySelectorAll('.btn-flag svg');
                    flagIcons.forEach(icon => {
                        const btn = icon.closest('.btn-flag');
                        const color = btn?.getAttribute('data-flag-color') || '#6c757d';
                        // Set SVG attributes for currentColor support
                        icon.setAttribute('fill', 'none');
                        icon.setAttribute('stroke', 'currentColor');
                        icon.style.setProperty('color', color, 'important');
                        icon.style.setProperty('fill', 'none', 'important');
                        icon.style.setProperty('stroke', color, 'important');
                        // Also set on all paths and other elements inside SVG
                        const paths = icon.querySelectorAll('path, circle, rect, line, polyline, polygon');
                        paths.forEach(path => {
                            // Remove any existing fill/stroke attributes that might override
                            path.removeAttribute('fill');
                            path.removeAttribute('stroke');
                            // Set style properties
                            path.style.setProperty('fill', 'none', 'important');
                            path.style.setProperty('stroke', color, 'important');
                            path.style.setProperty('color', color, 'important');
                        });
                    });
                }, 200);
            }, 100);
        }

        window.Logger?.debug?.('📊 Watch list items table updated', { ...PAGE_LOG_CONTEXT, count: items.length });
    }

    /**
     * Render summary statistics
     */
    function renderSummaryStats(stats = null) {
        // If stats not provided, calculate them (async)
        if (!stats) {
            calculateSummaryStats().then(calculatedStats => {
                renderSummaryStats(calculatedStats);
            }).catch(error => {
                window.Logger?.error?.('❌ Error calculating summary stats', { ...PAGE_LOG_CONTEXT, error: error?.message });
            });
            return;
        }
        
        const totalListsEl = document.getElementById('totalWatchLists');
        const totalTickersEl = document.getElementById('totalTickers');
        const activeFlagsEl = document.getElementById('activeFlags');
        const externalTickersEl = document.getElementById('externalTickers');

        if (totalListsEl) totalListsEl.textContent = stats.totalLists || 0;
        if (totalTickersEl) totalTickersEl.textContent = stats.totalTickers || 0;
        if (activeFlagsEl) activeFlagsEl.textContent = stats.activeFlags || 0;
        if (externalTickersEl) externalTickersEl.textContent = stats.externalTickers || 0;
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
     * Update active list select dropdown
     */
    function updateActiveListSelect() {
        const selectEl = document.getElementById('activeListSelect');
        if (!selectEl) {
            window.Logger?.warn?.('⚠️ activeListSelect not found', PAGE_LOG_CONTEXT);
            return;
        }

        // Clear existing options
        selectEl.innerHTML = '';

        // Add empty option if no lists
        if (!watchListsData || watchListsData.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'אין רשימות זמינות';
            option.disabled = true;
            selectEl.appendChild(option);
            return;
        }

        // Add options for each list with ticker count
        watchListsData.forEach(list => {
            const option = document.createElement('option');
            option.value = list.id;
            const tickerCount = list.item_count || list.ticker_count || 0;
            
            // For flag lists, add color indicator
            if (list.is_flag_list && list.flag_color) {
                // Create option text with color indicator
                const colorIndicator = '●'; // Solid circle
                option.textContent = `${colorIndicator} ${list.name || `רשימה #${list.id}`} (${tickerCount})`;
                // Set color style for the option
                option.style.color = list.flag_color;
            } else {
                option.textContent = `${list.name || `רשימה #${list.id}`} (${tickerCount})`;
            }
            
            if (list.id === activeListId) {
                option.selected = true;
            }
            selectEl.appendChild(option);
        });
        
        // Update actions menu after select is updated
        updateActionsMenu();

        // Ensure dark color is maintained (using CSS variables)
        selectEl.style.fontWeight = '600';
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
        // Also update select if exists
        const selectEl = document.getElementById('activeListSelect');
        if (selectEl) {
            // Find option by value (activeListId) and select it
            selectEl.value = activeListId || '';
            // Ensure dark color is maintained after value change (using CSS variables)
            // CSS already handles this via variables, but we ensure fontWeight is maintained
            selectEl.style.fontWeight = '600';
        }
    }

    /**
     * Switch to different watch list
     * @param {string|number} listId - List ID
     * @async
     */
    async function switchList(listId) {
        if (!listId) {
            window.Logger?.warn?.('No list ID provided', PAGE_LOG_CONTEXT);
            return;
        }

        const listIdNum = typeof listId === 'string' ? parseInt(listId, 10) : listId;
        
        window.Logger?.info?.('🔄 Switching to list', { ...PAGE_LOG_CONTEXT, listId: listIdNum });

        // Find list in data
        const list = watchListsData.find(l => l.id === listIdNum);
        if (!list) {
            window.Logger?.warn?.('List not found', { ...PAGE_LOG_CONTEXT, listId: listIdNum });
            return;
        }

        // Set as active
        activeListId = listIdNum;
        
        // Load list items - MUST await to ensure items are loaded before continuing
        await loadWatchListItems(listIdNum);
        
        // Update title
        updateActiveListTitle(list.name);
        
        // Update actions menu
        updateActionsMenu();
        
        // Save page state
        savePageState();
        
        window.Logger?.info?.('✅ Switched to list', { ...PAGE_LOG_CONTEXT, listId: listIdNum, name: list.name });
    }

    // ===== VIEW MODE =====

    /**
     * Set view mode
     * @param {string} mode - View mode ('table', 'cards', 'compact')
     */
    function setViewMode(mode) {
        if (!['table', 'cards', 'compact'].includes(mode)) {
            window.Logger?.warn?.('Invalid view mode', { ...PAGE_LOG_CONTEXT, mode });
            return;
        }

        window.Logger?.debug?.('🔄 Setting view mode', { ...PAGE_LOG_CONTEXT, mode, previousMode: currentViewMode });

        // Update current view mode
        currentViewMode = mode;

        // Use UI Service if available
        if (window.WatchListsUIService?.switchViewMode) {
            window.WatchListsUIService.switchViewMode(mode);
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
        }
        
        // Update active button state
        const viewModeButtons = document.querySelectorAll('.btn-view-mode');
        viewModeButtons.forEach(btn => {
            const btnMode = btn.getAttribute('data-view-mode');
            if (btnMode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // CRITICAL: Re-render the active list view with current data after mode change
        if (activeListItems && activeListItems.length > 0) {
            window.Logger?.debug?.('Re-rendering active list view after mode change', { ...PAGE_LOG_CONTEXT, mode, itemsCount: activeListItems.length });
            // Call async function properly
            Promise.resolve(renderActiveListView(activeListItems)).catch(error => {
                window.Logger?.error?.('Error re-rendering after view mode change', { ...PAGE_LOG_CONTEXT, error });
            });
        }
        
        // Save page state
        savePageState();

        window.Logger?.debug?.('✅ View mode set', { ...PAGE_LOG_CONTEXT, mode });
    }

    // ===== FLAG MANAGEMENT =====

    /**
     * Show flag palette
     * @param {number} itemId - Item ID
     */
    async function showFlagPalette(itemId) {
        // Wait a bit for FlagQuickAction to load if not immediately available
        // This handles the case where flag-quick-action.js is still loading (defer)
        if (typeof window.FlagQuickAction === 'undefined') {
            // Wait up to 1 second for FlagQuickAction to load
            for (let i = 0; i < 10; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
        if (window.FlagQuickAction?.show) {
                    break;
                }
            }
        }
        
        // Use flag-quick-action.js if available (preferred)
        if (window.FlagQuickAction?.show) {
            // Find flag button in any view mode (table, cards, compact)
            const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
            const flagBtn = itemElement?.querySelector('.btn-flag');
            if (flagBtn) {
                // Pass element for better positioning
                window.FlagQuickAction.show(itemId, { element: flagBtn });
            } else {
                // Fallback: show without element positioning
                window.FlagQuickAction.show(itemId);
            }
            return;
        }
        
        // Fallback to UI Service implementation
        if (window.WatchListsUIService?.showFlagPalette) {
            window.WatchListsUIService.showFlagPalette(itemId);
        } else {
            window.Logger?.warn?.('⚠️ Flag palette system not available', { ...PAGE_LOG_CONTEXT, itemId });
            // Last resort: show error notification
            if (window.NotificationSystem?.showError) {
                window.NotificationSystem.showError('שגיאה', 'מערכת בחירת דגלים לא זמינה. אנא רענן את הדף.');
            }
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
        try {
            if (!activeListId) {
                window.Logger?.warn?.('⚠️ No active list selected', PAGE_LOG_CONTEXT);
                return;
            }

            // Use UI Service if available (preferred - centralized logic)
            // UI Service will handle the update, cache invalidation, and reload
            if (window.WatchListsUIService?.setFlag) {
                await window.WatchListsUIService.setFlag(itemId, color);
                // UI Service already reloads items, but we ensure summary stats are updated
                renderSummaryStats();
                return;
            }
            
            // Fallback: Use Data Service directly
            if (window.WatchListsDataService?.updateWatchListItem) {
                await window.WatchListsDataService.updateWatchListItem(activeListId, itemId, { flag_color: color });
            } else {
                // Last resort: Direct API call
            const response = await fetch(`/api/watch-lists/${activeListId}/items/${itemId}`, {
                    method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flag_color: color })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Failed to update flag: ${response.status}`);
                }
            }

            // Invalidate cache
            if (window.CacheSyncManager?.invalidateByAction) {
                await window.CacheSyncManager.invalidateByAction('watch-list-updated');
            }

            // CRITICAL: Reload items to ensure UI shows saved data from backend
            await loadWatchListItems(activeListId);
            
            // Sync flag list if flag was set/removed
            if (window.WatchListsDataService?.syncSingleFlagList) {
                try {
                    if (color) {
                        await window.WatchListsDataService.syncSingleFlagList(color);
                    }
                    // Also sync if flag was removed (to remove from flag list)
                    // We need to check the old flag color - for now, sync all flag lists
                    await window.WatchListsDataService.syncFlagLists();
                } catch (error) {
                    window.Logger?.warn?.('⚠️ Error syncing flag list after flag change', {
                        ...PAGE_LOG_CONTEXT,
                        error: error?.message
                    });
                }
            }
            
            renderSummaryStats();

            window.Logger?.info?.('✅ Flag set', { ...PAGE_LOG_CONTEXT, itemId, color });
        } catch (error) {
            window.Logger?.error?.('❌ Error setting flag', { ...PAGE_LOG_CONTEXT, itemId, color, error: error?.message || error });
            if (window.NotificationSystem?.showError) {
                window.NotificationSystem.showError('שגיאה', `לא ניתן לעדכן את הדגל: ${error?.message || 'שגיאה לא ידועה'}`);
            }
        }
    }

    /**
     * Remove flag
     * @param {number} itemId - Item ID
     */
    async function removeFlag(itemId) {
        try {
            if (!activeListId) {
                window.Logger?.warn?.('⚠️ No active list selected', PAGE_LOG_CONTEXT);
                return;
            }

            // Use UI Service if available (preferred - centralized logic)
            // UI Service will handle the update, cache invalidation, and reload
        if (window.WatchListsUIService?.removeFlag) {
            await window.WatchListsUIService.removeFlag(itemId);
                // UI Service already reloads items, but we ensure summary stats are updated
                renderSummaryStats();
                return;
            }
            
            // Fallback: Use Data Service directly
            if (window.WatchListsDataService?.updateWatchListItem) {
                await window.WatchListsDataService.updateWatchListItem(activeListId, itemId, { flag_color: null });
        } else {
                // Last resort: Direct API call
                const response = await fetch(`/api/watch-lists/${activeListId}/items/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flag_color: null })
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || `Failed to remove flag: ${response.status}`);
                }
            }

            // Invalidate cache
            if (window.CacheSyncManager?.invalidateByAction) {
                await window.CacheSyncManager.invalidateByAction('watch-list-updated');
            }

            // CRITICAL: Reload items to ensure UI shows saved data from backend
            await loadWatchListItems(activeListId);
            
            // Sync flag lists
            if (window.WatchListsDataService?.syncFlagLists) {
                try {
                    await window.WatchListsDataService.syncFlagLists();
                } catch (error) {
                    window.Logger?.warn?.('⚠️ Error syncing flag lists after flag removal', {
                        ...PAGE_LOG_CONTEXT,
                        error: error?.message
                    });
                }
            }
            
            renderSummaryStats();

            window.Logger?.info?.('✅ Flag removed', { ...PAGE_LOG_CONTEXT, itemId });
        } catch (error) {
            window.Logger?.error?.('❌ Error removing flag', { ...PAGE_LOG_CONTEXT, itemId, error: error?.message || error });
            if (window.NotificationSystem?.showError) {
                window.NotificationSystem.showError('שגיאה', `לא ניתן להסיר את הדגל: ${error?.message || 'שגיאה לא ידועה'}`);
            }
        }
    }

    // ===== MODAL MANAGEMENT =====

    /**
     * Open add list modal
     */
    async function openAddListModal() {
        if (typeof window.showModalSafe === 'function') {
            await window.showModalSafe('watchListModal', 'add');
        } else if (window.ModalManagerV2) {
            await window.ModalManagerV2.showModal('watchListModal', 'add');
        } else {
            window.Logger?.warn?.('⚠️ showModalSafe and ModalManagerV2 not available', PAGE_LOG_CONTEXT);
        }
    }

    /**
     * Open edit list modal
     * @param {number} listId - List ID
     */
    async function openEditListModal(listId) {
        try {
            // Use ModalManagerV2.showEditModal - loads data from API automatically
            if (window.ModalManagerV2 && typeof window.ModalManagerV2.showEditModal === 'function') {
                await window.ModalManagerV2.showEditModal('watchListModal', 'watch_list', listId);
                
                // CRITICAL: After modal is shown, ensure it's the last modal in DOM for proper z-index stacking
                const watchListModalElement = document.getElementById('watchListModal');
                if (watchListModalElement && watchListModalElement.parentElement === document.body) {
                    // Move to end of body to ensure it's on top
                    document.body.appendChild(watchListModalElement);
                    window.Logger?.info?.('✅ [Z-INDEX] Moved watchListModal to end of body after show', {
                        ...PAGE_LOG_CONTEXT,
                        listId
                    });
                }
                
                // Force z-index update after modal is shown and moved
                if (window.ModalZIndexManager && typeof window.ModalZIndexManager.forceUpdate === 'function') {
                    requestAnimationFrame(() => {
                        if (watchListModalElement) {
                            window.ModalZIndexManager.forceUpdate(watchListModalElement);
                            window.Logger?.info?.('✅ [Z-INDEX] Forced z-index update for watchListModal', {
                                ...PAGE_LOG_CONTEXT,
                                listId
                            });
                        }
                    });
                }
            } else {
                window.Logger?.warn?.('⚠️ ModalManagerV2.showEditModal not available', PAGE_LOG_CONTEXT);
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error opening edit list modal', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
            
            // Show error notification to user
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', `לא ניתן לפתוח את מודל העריכה. ${error?.message || 'שגיאה לא ידועה'}`);
            }
        }
    }

    /**
     * Update actions menu for watch lists
     */
    function updateActionsMenu() {
        window.Logger?.info?.('🔍 [ACTIONS MENU] updateActionsMenu called', {
            ...PAGE_LOG_CONTEXT,
            readyState: document.readyState,
            createActionsMenuAvailable: typeof window.createActionsMenu === 'function',
            actionsMenuSystemAvailable: !!window.actionsMenuSystem
        });
        
        // Check if DOM is ready
        if (document.readyState === 'loading') {
            window.Logger?.debug?.('⏳ [ACTIONS MENU] DOM not ready, waiting...', PAGE_LOG_CONTEXT);
            // Wait for DOM to be ready
            document.addEventListener('DOMContentLoaded', () => {
                updateActionsMenu();
            });
            return;
        }
        
        // Wait for actions-menu-system to be loaded
        if (!window.createActionsMenu) {
            window.Logger?.warn?.('⏳ [ACTIONS MENU] createActionsMenu not available, waiting...', {
                ...PAGE_LOG_CONTEXT,
                actionsMenuSystemAvailable: !!window.actionsMenuSystem,
                ActionsMenuSystemClassAvailable: typeof ActionsMenuSystem !== 'undefined'
            });
            // Wait for actions-menu-system to load (max 5 seconds)
            let waitCount = 0;
            const maxWaits = 50; // 50 * 100ms = 5 seconds
            const waitForSystem = setInterval(() => {
                waitCount++;
                if (window.createActionsMenu) {
                    clearInterval(waitForSystem);
                    window.Logger?.info?.('✅ [ACTIONS MENU] createActionsMenu now available, retrying...', PAGE_LOG_CONTEXT);
                    updateActionsMenu(); // Retry after system is loaded
                } else if (waitCount >= maxWaits) {
                    clearInterval(waitForSystem);
                    window.Logger?.error?.('❌ [ACTIONS MENU] createActionsMenu not available after waiting 5 seconds', PAGE_LOG_CONTEXT);
                }
            }, 100);
            return;
        }
        
        // First, let's do a comprehensive search for the container
        const menuContainer = document.getElementById('watchListsActionsMenu');
        
        // Also check by querySelector in different locations
        const containerInTableTitle = document.querySelector('#active-list-section .table-title #watchListsActionsMenu');
        const containerInTableActions = document.querySelector('#active-list-section .table-actions #watchListsActionsMenu');
        const containerAnywhere = document.querySelector('#watchListsActionsMenu');
        const containerInActiveListSelectParent = document.querySelector('#activeListSelect')?.parentElement?.querySelector('#watchListsActionsMenu');
        
        // Get section info
        const activeListSection = document.getElementById('active-list-section');
        const tableTitle = activeListSection?.querySelector('.table-title');
        const tableActions = activeListSection?.querySelector('.table-actions');
        const activeListSelect = document.getElementById('activeListSelect');
        const activeListSelectParent = activeListSelect?.parentElement;
        
        // Expand the log object to see all details
        const logData = {
            ...PAGE_LOG_CONTEXT,
            // Direct getElementById
            getElementById: !!menuContainer,
            // QuerySelector searches
            querySelectorInTableTitle: !!containerInTableTitle,
            querySelectorInTableActions: !!containerInTableActions,
            querySelectorAnywhere: !!containerAnywhere,
            querySelectorInSelectParent: !!containerInActiveListSelectParent,
            // Section info
            activeListSectionExists: !!activeListSection,
            tableTitleExists: !!tableTitle,
            tableActionsExists: !!tableActions,
            activeListSelectExists: !!activeListSelect,
            activeListSelectParentExists: !!activeListSelectParent,
            // HTML previews - FULL HTML
            tableTitleHTML: tableTitle ? tableTitle.outerHTML : 'NOT FOUND',
            activeListSelectParentHTML: activeListSelectParent ? activeListSelectParent.outerHTML : 'NOT FOUND',
            activeListSectionHTML: activeListSection ? activeListSection.outerHTML.substring(0, 1000) : 'NOT FOUND',
            // All containers with id watchListsActionsMenu
            allContainersWithId: Array.from(document.querySelectorAll('#watchListsActionsMenu')).map(el => ({
                id: el.id,
                parentId: el.parentElement?.id || 'N/A',
                parentClass: el.parentElement?.className || 'N/A',
                location: el.closest('.table-title') ? 'table-title' : (el.closest('.table-actions') ? 'table-actions' : 'other'),
                fullHTML: el.outerHTML
            })),
            // Check if container exists in HTML source
            containerInHTMLSource: activeListSection ? activeListSection.innerHTML.includes('watchListsActionsMenu') : false,
            // All elements with class actions-menu-wrapper
            allActionsMenuWrappers: Array.from(document.querySelectorAll('.actions-menu-wrapper')).map(el => ({
                id: el.id || 'NO ID',
                parentId: el.parentElement?.id || 'N/A',
                parentClass: el.parentElement?.className || 'N/A',
                location: el.closest('.table-title') ? 'table-title' : (el.closest('.table-actions') ? 'table-actions' : 'other'),
                fullHTML: el.outerHTML
            }))
        };
        
        window.Logger?.info?.('🔍 [ACTIONS MENU] Comprehensive container search', logData);
        
        // Also log separately for better visibility - use console.log for full HTML
        if (tableTitle) {
            console.log('📋 [ACTIONS MENU] table-title HTML (FULL):', tableTitle.outerHTML);
            window.Logger?.info?.('📋 [ACTIONS MENU] table-title HTML:', {
                ...PAGE_LOG_CONTEXT,
                html: tableTitle.outerHTML,
                hasWatchListsActionsMenu: tableTitle.outerHTML.includes('watchListsActionsMenu'),
                hasActionsMenuWrapper: tableTitle.outerHTML.includes('actions-menu-wrapper')
            });
        }
        
        if (activeListSelectParent) {
            console.log('📋 [ACTIONS MENU] activeListSelect parent HTML (FULL):', activeListSelectParent.outerHTML);
            window.Logger?.info?.('📋 [ACTIONS MENU] activeListSelect parent HTML:', {
                ...PAGE_LOG_CONTEXT,
                html: activeListSelectParent.outerHTML,
                hasWatchListsActionsMenu: activeListSelectParent.outerHTML.includes('watchListsActionsMenu'),
                hasActionsMenuWrapper: activeListSelectParent.outerHTML.includes('actions-menu-wrapper')
            });
        }
        
        // Check if container exists in HTML string but not in DOM
        if (tableTitle && tableTitle.outerHTML.includes('watchListsActionsMenu')) {
            console.warn('⚠️ [ACTIONS MENU] Container exists in HTML but not found in DOM!', {
                htmlContainsId: tableTitle.outerHTML.includes('id="watchListsActionsMenu"'),
                htmlContainsClass: tableTitle.outerHTML.includes('class="actions-menu-wrapper"'),
                querySelectorResult: tableTitle.querySelector('#watchListsActionsMenu'),
                querySelectorByClass: tableTitle.querySelector('.actions-menu-wrapper')
            });
        }
        
        // Use the first found container
        const foundContainer = menuContainer || containerInTableTitle || containerInTableActions || containerAnywhere || containerInActiveListSelectParent;
        
        if (foundContainer) {
            // Container found - create menu immediately
            window.Logger?.info?.('✅ [ACTIONS MENU] Container found, creating menu...', {
                ...PAGE_LOG_CONTEXT,
                containerId: foundContainer.id,
                containerParent: foundContainer.parentElement?.id || 'N/A',
                containerParentClass: foundContainer.parentElement?.className || 'N/A',
                foundVia: menuContainer ? 'getElementById' : 
                         (containerInTableTitle ? 'querySelectorInTableTitle' :
                         (containerInTableActions ? 'querySelectorInTableActions' :
                         (containerAnywhere ? 'querySelectorAnywhere' : 'querySelectorInSelectParent')))
            });
            
            // Remove duplicate ADD and DELETE buttons before creating menu
            if (activeListSelectParent) {
                const existingButtons = activeListSelectParent.querySelectorAll('button[data-button-type="ADD"], button[data-button-type="DELETE"]');
                const addButtons = Array.from(existingButtons).filter(btn => btn.getAttribute('data-onclick')?.includes('openAddListModal'));
                const deleteButtons = Array.from(existingButtons).filter(btn => btn.getAttribute('data-onclick')?.includes('deleteCurrentList'));
                
                // Remove all ADD and DELETE buttons that are duplicates of the actions menu
                [...addButtons, ...deleteButtons].forEach(btn => {
                    window.Logger?.info?.('🗑️ [ACTIONS MENU] Removing duplicate button', {
                        ...PAGE_LOG_CONTEXT,
                        buttonType: btn.getAttribute('data-button-type'),
                        onclick: btn.getAttribute('data-onclick')
                    });
                    btn.remove();
                });
            }
            
            createActionsMenuContent(foundContainer);
            return;
        }
        
        // Container not found - check if section exists
        if (!activeListSection) {
            window.Logger?.warn?.('⚠️ active-list-section not found, cannot create actions menu', PAGE_LOG_CONTEXT);
            return;
        }
        
        // Container not found - CREATE IT!
        // The container exists in HTML but was removed from DOM - create it dynamically
        if (activeListSelectParent) {
            // REMOVE existing ADD and DELETE buttons that shouldn't be there
            const existingButtons = activeListSelectParent.querySelectorAll('button[data-button-type="ADD"], button[data-button-type="DELETE"]');
            const addButtons = Array.from(existingButtons).filter(btn => btn.getAttribute('data-onclick')?.includes('openAddListModal'));
            const deleteButtons = Array.from(existingButtons).filter(btn => btn.getAttribute('data-onclick')?.includes('deleteCurrentList'));
            
            // Remove all ADD and DELETE buttons that are duplicates of the actions menu
            [...addButtons, ...deleteButtons].forEach(btn => {
                window.Logger?.info?.('🗑️ [ACTIONS MENU] Removing duplicate button', {
                    ...PAGE_LOG_CONTEXT,
                    buttonType: btn.getAttribute('data-button-type'),
                    onclick: btn.getAttribute('data-onclick')
                });
                btn.remove();
            });
            
            window.Logger?.warn?.('⚠️ [ACTIONS MENU] Container not found, creating it dynamically', {
                ...PAGE_LOG_CONTEXT,
                activeListSelectParentExists: !!activeListSelectParent,
                existingButtonsCount: existingButtons.length,
                removedButtonsCount: addButtons.length + deleteButtons.length,
                willCreateContainer: true
            });
            
            // Create the container dynamically
            const newContainer = document.createElement('div');
            newContainer.id = 'watchListsActionsMenu';
            newContainer.className = 'actions-menu-wrapper';
            
            // Insert it after the select, before any existing buttons
            if (activeListSelect && activeListSelect.nextSibling) {
                activeListSelectParent.insertBefore(newContainer, activeListSelect.nextSibling);
            } else {
                activeListSelectParent.appendChild(newContainer);
            }
            
            window.Logger?.info?.('✅ [ACTIONS MENU] Container created dynamically', {
                ...PAGE_LOG_CONTEXT,
                containerId: newContainer.id,
                containerParent: newContainer.parentElement?.id || 'N/A',
                containerLocation: 'after activeListSelect'
            });
            
            // Now create the menu
            createActionsMenuContent(newContainer);
            return;
        }
        
        // Use MutationObserver to watch for container to be added to DOM
        const observer = new MutationObserver((mutations, obs) => {
            const container = document.getElementById('watchListsActionsMenu');
            if (container) {
                obs.disconnect();
                window.Logger?.debug?.('✅ watchListsActionsMenu found via MutationObserver', PAGE_LOG_CONTEXT);
                createActionsMenuContent(container);
            }
        });
        
        // Start observing the section for changes
        observer.observe(activeListSection, {
            childList: true,
            subtree: true
        });
        
        // Also try direct lookup with retries as fallback
        let retryCount = 0;
        const maxRetries = 10;
        const retryDelays = [200, 300, 500, 750, 1000, 1500, 2000, 2500, 3000, 4000];
        
        const retry = () => {
            if (retryCount >= maxRetries) {
                observer.disconnect();
                window.Logger?.warn?.('⚠️ watchListsActionsMenu not found after all retries', {
                    ...PAGE_LOG_CONTEXT,
                    retries: retryCount,
                    sectionExists: !!activeListSection,
                    sectionVisible: activeListSection ? activeListSection.offsetParent !== null : false,
                    sectionDisplay: activeListSection ? window.getComputedStyle(activeListSection).display : 'N/A',
                    sectionHTML: activeListSection ? activeListSection.innerHTML.substring(0, 200) : 'N/A'
                });
                return;
            }
            
            setTimeout(() => {
                const retryContainer = document.getElementById('watchListsActionsMenu');
                if (retryContainer) {
                    observer.disconnect();
                    window.Logger?.debug?.('✅ watchListsActionsMenu found after retry', {
                        ...PAGE_LOG_CONTEXT,
                        retries: retryCount
                    });
                    createActionsMenuContent(retryContainer);
                } else {
                    retryCount++;
                    retry();
                }
            }, retryDelays[retryCount] || 4000);
        };
        
        retry();
    }
    
    /**
     * Create actions menu content
     * @param {HTMLElement} menuContainer - Container element
     */
    function createActionsMenuContent(menuContainer) {
        window.Logger?.info?.('🎯 [ACTIONS MENU] createActionsMenuContent called', {
            ...PAGE_LOG_CONTEXT,
            containerId: menuContainer?.id,
            containerExists: !!menuContainer,
            createActionsMenuAvailable: typeof window.createActionsMenu === 'function',
            actionsMenuSystemAvailable: !!window.actionsMenuSystem
        });
        
        if (!menuContainer) {
            window.Logger?.error?.('❌ [ACTIONS MENU] menuContainer is null!', PAGE_LOG_CONTEXT);
            return;
        }
        
        // Create action buttons
        const buttons = [
            {
                type: 'ADD',
                variant: 'small',
                onclick: 'window.WatchListsPage?.openAddListModal()',
                text: '',
                title: 'הוסף רשימה'
            },
            {
                type: 'DELETE',
                variant: 'small',
                onclick: 'window.WatchListsPage?.deleteCurrentList()',
                text: '',
                title: 'מחק רשימה פעילה'
            }
        ];
        
        window.Logger?.info?.('📋 [ACTIONS MENU] Buttons configuration', {
            ...PAGE_LOG_CONTEXT,
            buttonCount: buttons.length,
            buttons: buttons.map(b => ({ type: b.type, title: b.title, onclick: b.onclick }))
        });
        
        // Create actions menu using ActionsMenuSystem
        if (window.createActionsMenu) {
            try {
                window.Logger?.debug?.('🔄 [ACTIONS MENU] Calling window.createActionsMenu...', {
                    ...PAGE_LOG_CONTEXT,
                    buttonCount: buttons.length
                });
                
                const menuHTML = window.createActionsMenu(buttons);
                
                window.Logger?.info?.('📝 [ACTIONS MENU] createActionsMenu returned', {
                    ...PAGE_LOG_CONTEXT,
                    hasHTML: !!menuHTML,
                    htmlLength: menuHTML?.length || 0,
                    htmlPreview: menuHTML ? menuHTML.substring(0, 300) : 'EMPTY'
                });
                
                if (menuHTML) {
                    const beforeHTML = menuContainer.innerHTML;
                    menuContainer.innerHTML = menuHTML;
                    const afterHTML = menuContainer.innerHTML;
                    
                    window.Logger?.info?.('✅ [ACTIONS MENU] HTML inserted into container', {
                        ...PAGE_LOG_CONTEXT,
                        beforeLength: beforeHTML.length,
                        afterLength: afterHTML.length,
                        containerChildren: menuContainer.children.length,
                        hasActionsWrapper: !!menuContainer.querySelector('.actions-menu-wrapper'),
                        hasActionsTrigger: !!menuContainer.querySelector('.actions-trigger'),
                        hasActionsPopup: !!menuContainer.querySelector('.actions-menu-popup'),
                        buttonCount: menuContainer.querySelectorAll('.actions-menu-item').length
                    });
                    
                    // Initialize button system for new buttons
                    if (window.ButtonSystemInit?.processButtons) {
                        setTimeout(() => {
                            window.Logger?.debug?.('🔘 [ACTIONS MENU] Initializing button system...', PAGE_LOG_CONTEXT);
                            window.ButtonSystemInit.processButtons(menuContainer);
                            window.Logger?.info?.('✅ [ACTIONS MENU] Button system initialized', {
                                ...PAGE_LOG_CONTEXT,
                                processedButtons: menuContainer.querySelectorAll('[data-button-type]').length
                            });
                        }, 100);
                    } else {
                        window.Logger?.warn?.('⚠️ [ACTIONS MENU] ButtonSystemInit.processButtons not available', PAGE_LOG_CONTEXT);
                    }
                    
                    // Initialize actions menu system if available
                    if (window.actionsMenuSystem && typeof window.actionsMenuSystem.attachHoverDelay === 'function') {
                        setTimeout(() => {
                            window.Logger?.debug?.('🎨 [ACTIONS MENU] Attaching hover delay...', PAGE_LOG_CONTEXT);
                            window.actionsMenuSystem.attachHoverDelay();
                            window.Logger?.info?.('✅ [ACTIONS MENU] Hover delay attached', PAGE_LOG_CONTEXT);
                        }, 200);
                    } else {
                        window.Logger?.warn?.('⚠️ [ACTIONS MENU] actionsMenuSystem.attachHoverDelay not available', {
                            ...PAGE_LOG_CONTEXT,
                            actionsMenuSystemExists: !!window.actionsMenuSystem,
                            hasAttachHoverDelay: window.actionsMenuSystem && typeof window.actionsMenuSystem.attachHoverDelay === 'function'
                        });
                    }
                    
                    window.Logger?.info?.('✅ [ACTIONS MENU] Actions menu created successfully', {
                        ...PAGE_LOG_CONTEXT,
                        buttonCount: buttons.length,
                        finalButtonCount: menuContainer.querySelectorAll('.actions-menu-item').length
                    });
                } else {
                    window.Logger?.error?.('❌ [ACTIONS MENU] createActionsMenu returned empty HTML', PAGE_LOG_CONTEXT);
                    createFallbackButtons(menuContainer, buttons);
                }
            } catch (error) {
                window.Logger?.error?.('❌ [ACTIONS MENU] Error creating actions menu', {
                    ...PAGE_LOG_CONTEXT,
                    error: error?.message || error,
                    stack: error?.stack
                });
                createFallbackButtons(menuContainer, buttons);
            }
        } else {
            window.Logger?.error?.('❌ [ACTIONS MENU] createActionsMenu not available, using fallback', {
                ...PAGE_LOG_CONTEXT,
                actionsMenuSystemAvailable: !!window.actionsMenuSystem,
                ActionsMenuSystemClassAvailable: typeof ActionsMenuSystem !== 'undefined'
            });
            createFallbackButtons(menuContainer, buttons);
        }
    }
    
    /**
     * Create fallback buttons if ActionsMenuSystem is not available
     * @param {HTMLElement} menuContainer - Container element
     * @param {Array} buttons - Array of button configurations
     */
    function createFallbackButtons(menuContainer, buttons) {
        // Fallback: create simple buttons
        menuContainer.innerHTML = buttons.map(btn => `
            <button type="button"
                    class="btn btn"
                    data-button-type="${btn.type}"
                    data-variant="${btn.variant}"
                    data-text="${btn.text}"
                    data-onclick="${btn.onclick}"
                    title="${btn.title}">
            </button>
        `).join('');
        
        // Initialize button system for fallback buttons
        if (window.ButtonSystemInit?.processButtons) {
            setTimeout(() => {
                window.ButtonSystemInit.processButtons(menuContainer);
            }, 100);
        }
    }

    /**
     * Add ticker (open modal)
     */
    async function addTicker() {
        if (!activeListId) {
            window.Logger?.warn?.('⚠️ No active list selected', PAGE_LOG_CONTEXT);
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'יש לבחור רשימה פעילה לפני הוספת טיקר', 5000);
            }
            return;
        }

        // Use ModalManagerV2 directly to pass listId through options
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
            await window.ModalManagerV2.showModal('addTickerModal', 'add', null, { listId: activeListId });
        } else if (window.AddTickerModal && typeof window.AddTickerModal.open === 'function') {
            window.AddTickerModal.open(activeListId);
        } else if (typeof window.showModalSafe === 'function') {
            await window.showModalSafe('addTickerModal', 'add');
            // Set listId manually if modal opened via showModalSafe
            if (window.AddTickerModal) {
                window.AddTickerModal.currentListId = activeListId;
            }
        } else {
            window.Logger?.warn?.('⚠️ Modal system not available', PAGE_LOG_CONTEXT);
        }
    }

    /**
     * Edit item (open modal)
     * @param {number} itemId - Item ID
     */
    async function editItem(itemId) {
        // Wait for ModalManagerV2 to be available
        if (!window.ModalManagerV2) {
            window.Logger?.warn?.('⚠️ ModalManagerV2 not available, waiting...', PAGE_LOG_CONTEXT);
            // Wait up to 2 seconds for ModalManagerV2
            for (let i = 0; i < 20; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (window.ModalManagerV2) {
                    window.Logger?.info?.('✅ ModalManagerV2 became available', PAGE_LOG_CONTEXT);
                    break;
                }
            }
        }
        
        const item = activeListItems.find(i => i.id === itemId);
        if (item && window.ModalManagerV2?.showModal) {
            try {
                await window.ModalManagerV2.showModal('editWatchListItemModal', 'edit', item, {
                    itemId: itemId
                });
            } catch (error) {
                window.Logger?.error?.('❌ Error opening edit item modal', { ...PAGE_LOG_CONTEXT, error });
            }
        } else {
            window.Logger?.warn?.('⚠️ Item not found or ModalManagerV2 not available', PAGE_LOG_CONTEXT);
        }
    }

    // ===== CRUD OPERATIONS =====

    /**
     * Save watch list
     * Uses UnifiedCRUDService for consistent CRUD operations
     * @async
     */
    async function saveWatchList() {
        try {
            // Determine mode and listId from ModalManagerV2
            let listId = null;
            let isEdit = false;
            if (window.ModalManagerV2 && window.ModalManagerV2.modals) {
                const modalInfo = window.ModalManagerV2.modals.get('watchListModal');
                if (modalInfo) {
                    const mode = modalInfo.currentMode || 'add';
                    isEdit = mode === 'edit';
                    if (isEdit && modalInfo.currentEntityData && modalInfo.currentEntityData.id) {
                        listId = modalInfo.currentEntityData.id;
                    }
                }
            }

            // Use UnifiedCRUDService for consistent CRUD operations
            if (window.UnifiedCRUDService && typeof window.UnifiedCRUDService.saveEntity === 'function') {
                const result = await window.UnifiedCRUDService.saveEntity('watch_list', null, {
                    modalId: 'watchListModal',
                    successMessage: isEdit ? 'רשימה עודכנה בהצלחה' : 'רשימה נוספה בהצלחה',
                    entityName: 'רשימה',
                    reloadFn: async () => {
                        await loadWatchLists();
                        renderSummaryStats();
                    },
                    requiresHardReload: false,
                    fieldMap: {
                name: { id: 'watchListName', type: 'text' },
                icon: { id: 'watchListIcon', type: 'text' },
                        icon_library: { id: 'watchListIconLibrary', type: 'text' },
                view_mode: { id: 'watchListViewMode', type: 'text' }
                    },
                    entityId: listId || null,
                    isEdit: isEdit
                });
                
                return result;
            } else {
                // Fallback to direct API call (should not happen in production)
                window.Logger?.warn?.('⚠️ UnifiedCRUDService not available', PAGE_LOG_CONTEXT);
                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification('שגיאה', 'מערכת שמירה לא זמינה');
                }
            }
        } catch (error) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            window.Logger?.error?.('❌ Error saving watch list', { ...PAGE_LOG_CONTEXT, error: errorMsg });
            
            // Show error notification to user
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', `לא ניתן לשמור את הרשימה. ${errorMsg}`);
            }
        }
    }

    /**
     * Delete list
     * @param {number} listId - List ID
     * @async
     */
    /**
     * Delete current active list with confirmation
     * @async
     */
    async function deleteCurrentList() {
        const currentListId = getCurrentListId();
        if (!currentListId) {
            if (window.NotificationSystem) {
                window.NotificationSystem.showWarning('לא נבחרה רשימה למחיקה', 'system');
            }
            return;
        }

        // Get list name for confirmation message
        const currentList = watchListsData.find(list => list.id === currentListId);
        const listName = currentList?.name || `רשימה #${currentListId}`;

        // Show confirmation dialog
        const confirmed = await new Promise((resolve) => {
            if (typeof window.showConfirmationDialog === 'function') {
                window.showConfirmationDialog(
                    'מחיקת רשימת צפייה',
                    `האם אתה בטוח שברצונך למחוק את הרשימה "${listName}"?\n\nפעולה זו תמחק את הרשימה וכל הפריטים שבה לצמיתות.`,
                    () => resolve(true),
                    () => resolve(false),
                    'danger'
                );
            } else {
                resolve(window.confirm(`האם אתה בטוח שברצונך למחוק את הרשימה "${listName}"?`));
            }
        });

        if (!confirmed) {
            window.Logger?.info?.('🗑️ Delete cancelled by user', { ...PAGE_LOG_CONTEXT, listId: currentListId });
            return;
        }

        // Delete the list
        await deleteList(currentListId);
    }

    async function deleteList(listId) {
        try {
            // Prevent deletion of flag lists
            const list = watchListsData?.find(l => l.id === listId);
            if (list && list.is_flag_list) {
                window.Logger?.warn?.('⚠️ Cannot delete flag list', { ...PAGE_LOG_CONTEXT, listId });
                if (window.NotificationSystem?.showError) {
                    window.NotificationSystem.showError('שגיאה', 'לא ניתן למחוק רשימת דגל. רשימות דגל נוצרות ומנוהלות אוטומטית על ידי המערכת.');
                }
                return false;
            }

            // Use UnifiedCRUDService for consistent CRUD operations
            // UnifiedCRUDService handles confirmation and linked items checking via entityDetailsAPI
            if (window.UnifiedCRUDService && typeof window.UnifiedCRUDService.deleteEntity === 'function') {
                const success = await window.UnifiedCRUDService.deleteEntity('watch_list', listId, {
                    successMessage: 'רשימה נמחקה בהצלחה',
                    entityName: 'רשימה',
                    reloadFn: async () => {
                            await loadWatchLists();
                            renderSummaryStats();
                        // Clear active list if it was deleted
                            if (activeListId === listId) {
                                activeListId = null;
                                activeListItems = [];
                            await renderActiveListView([]);
                        }
                    },
                    requiresHardReload: false,
                    checkLinkedItems: async (entityType, entityId) => {
                        if (typeof window.checkLinkedItemsBeforeAction === 'function') {
                            return await window.checkLinkedItemsBeforeAction(entityType, entityId, 'delete');
                        }
                        return false;
                    }
                });
                
                return success;
            } else {
                // Fallback to direct API call (should not happen in production)
                window.Logger?.warn?.('⚠️ UnifiedCRUDService.deleteEntity not available', PAGE_LOG_CONTEXT);
                if (typeof window.showErrorNotification === 'function') {
                    window.showErrorNotification('שגיאה', 'מערכת מחיקה לא זמינה');
                }
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error deleting list', { ...PAGE_LOG_CONTEXT, listId, error: error?.message || error });
            if (typeof window.showErrorNotification === 'function') {
                window.showErrorNotification('שגיאה', `לא ניתן למחוק את הרשימה: ${error?.message || 'שגיאה לא ידועה'}`);
            }
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

            // Update actions menu
            updateActionsMenu();

            // Load items
            await loadWatchListItems(listId);
            
            // Save page state
            await savePageState();

            window.Logger?.info?.('✅ List selected', { ...PAGE_LOG_CONTEXT, listId });
        } catch (error) {
            const errorMsg = error?.message || (typeof error === 'string' ? error : 'שגיאה לא ידועה');
            if (window.NotificationSystem && typeof window.NotificationSystem.showError === 'function') {
                window.NotificationSystem.showError('שגיאה בבחירת רשימה', 
                    `לא ניתן לבחור את הרשימה. ${errorMsg}`);
            } else if (window.Logger) {
                window.Logger.error('❌ Error selecting list', { ...PAGE_LOG_CONTEXT, listId, error: errorMsg });
            }
        }
    }

    /**
     * Add ticker to list
     * @async
     */
    // addTickerToList is now in add-ticker-modal.js - removed duplicate implementation

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

            // Use UnifiedCRUDService with custom endpoint for watch_list_item
            // watch_list_item is not a primary entity type, so we use CRUDResponseHandler directly
            if (window.WatchListsDataService?.removeTickerFromList) {
                // Show confirmation dialog first
                const confirmed = await window.showConfirmationDialog?.(
                    'הסרת טיקר מהרשימה',
                    'האם אתה בטוח שברצונך להסיר את הטיקר מהרשימה?',
                    'מחק',
                    'ביטול'
                );

                if (!confirmed) {
                    return;
                }

                // Get response from data service
                const response = await window.WatchListsDataService.removeTickerFromList(itemId);

                // Handle response - use CRUDResponseHandler if available
                if (response && window.CRUDResponseHandler?.handleDeleteResponse) {
                    await window.CRUDResponseHandler.handleDeleteResponse(response, {
                        entityType: 'watch_list_item',
                        entityName: 'פריט רשימה',
                        reloadFn: async () => {
                            // Close confirmation modal if open
                            const confirmationModal = document.getElementById('confirmationModal');
                            if (confirmationModal) {
                                const modalInstance = bootstrap.Modal.getInstance(confirmationModal);
                                if (modalInstance) {
                                    modalInstance.hide();
                                }
                            }

                            // Reload watch list items after deletion
                            await loadWatchListItems(activeListId);
                            renderSummaryStats();
                        },
                        onSuccess: async () => {
                            window.Logger?.info?.('✅ Item removed successfully', { ...PAGE_LOG_CONTEXT, itemId });
                        }
                    });
                } else {
                    // Fallback: manual handling
                    if (response && response.ok) {
                        // Close confirmation modal if open
                        const confirmationModal = document.getElementById('confirmationModal');
                        if (confirmationModal) {
                            const modalInstance = bootstrap.Modal.getInstance(confirmationModal);
                            if (modalInstance) {
                                modalInstance.hide();
                            }
                        }

                        // Show success notification
                        if (window.NotificationSystem?.showSuccess) {
                            window.NotificationSystem.showSuccess('הצלחה', 'הטיקר הוסר מהרשימה בהצלחה');
                        } else if (window.showNotification) {
                            window.showNotification('הצלחה', 'success', 'הטיקר הוסר מהרשימה בהצלחה', 3000);
                        }

                        // Reload items
                        await loadWatchListItems(activeListId);
                        renderSummaryStats();
                    } else {
                        throw new Error('תגובת השרת לא תקינה');
                    }
                }
            } else {
                throw new Error('WatchListsDataService.removeTickerFromList לא זמין');
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error removing item', { ...PAGE_LOG_CONTEXT, itemId, error: error?.message || error });
            
            // Show error notification
            if (window.NotificationSystem?.showError) {
                window.NotificationSystem.showError('שגיאה', `לא ניתן להסיר את הטיקר: ${error?.message || 'שגיאה לא ידועה'}`);
            } else if (window.showNotification) {
                window.showNotification('שגיאה', 'error', `לא ניתן להסיר את הטיקר: ${error?.message || 'שגיאה לא ידועה'}`, 5000);
            }
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
        // Apply background colors from data-bg-color using CSS variables
        document.querySelectorAll('[data-bg-color]').forEach(el => {
            const bgColor = el.getAttribute('data-bg-color');
            if (bgColor) {
                el.style.setProperty('--dynamic-bg-color', bgColor);
            }
        });

        // Apply icon colors from data-icon-color using CSS variables
        document.querySelectorAll('[data-icon-color]').forEach(el => {
            const iconColor = el.getAttribute('data-icon-color');
            if (iconColor && iconColor !== 'muted') {
                el.style.setProperty('--dynamic-icon-color', iconColor);
            }
        });

        window.Logger?.debug?.('✅ Data attributes applied', PAGE_LOG_CONTEXT);
    }

    /**
     * Calculate summary statistics
     * @returns {Promise<Object>} Statistics object
     */
    async function calculateSummaryStats() {
        const stats = {
            totalLists: watchListsData.length,
            totalTickers: 0,
            activeFlags: 0,
            externalTickers: 0
        };

        // Calculate from all lists
        for (const list of watchListsData) {
            try {
                if (window.WatchListsDataService?.getWatchListItems) {
                    const items = await window.WatchListsDataService.getWatchListItems(list.id, { force: false });
                    stats.totalTickers += items.length;
                    stats.activeFlags += items.filter(i => i.flag_color).length;
                    stats.externalTickers += items.filter(i => i.external_symbol).length;
                }
            } catch (error) {
                window.Logger?.warn?.('⚠️ Error loading items for stats', { ...PAGE_LOG_CONTEXT, listId: list.id, error: error?.message });
            }
        }

        renderSummaryStats(stats);

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
     * Refresh flag lists - sync all automatic flag lists
     * @async
     */
    async function refreshFlagLists() {
        try {
            if (!window.WatchListsDataService?.syncFlagLists) {
                window.Logger?.warn?.('⚠️ syncFlagLists not available', PAGE_LOG_CONTEXT);
                return;
            }

            window.Logger?.info?.('🔄 Syncing flag lists...', PAGE_LOG_CONTEXT);
            await window.WatchListsDataService.syncFlagLists();
            
            // Reload watch lists to include flag lists
            await loadWatchLists();
            
            window.Logger?.info?.('✅ Flag lists synced', PAGE_LOG_CONTEXT);
        } catch (error) {
            window.Logger?.debug?.('⚠️ Error syncing flag lists (soft-fail)', {
                ...PAGE_LOG_CONTEXT,
                error: error?.message || error
            });
            // Don't show error to user - flag lists are optional
        }
    }

    /**
     * Helper function to create and render flag button (used in all view modes)
     * @param {Object} item - Item object
     * @param {Function} onClickHandler - Click handler function
     * @returns {HTMLElement} Flag button element
     */
    function createFlagButton(item, onClickHandler) {
        const flagBtn = document.createElement('button');
        flagBtn.type = 'button';
        flagBtn.className = 'btn btn-sm btn-flag';
        
        // CRITICAL: Flag color comes from API (determined by which flag list ticker is in)
        const flagColor = item.flag_color;
        if (flagColor) {
            flagBtn.setAttribute('data-flag-color', flagColor);
            flagBtn.style.setProperty('color', flagColor, 'important');
            flagBtn.style.setProperty('border-color', flagColor, 'important');
            flagBtn.style.setProperty('border-width', '2px', 'important');
            flagBtn.style.setProperty('border-style', 'solid', 'important');
            flagBtn.style.setProperty('background-color', 'transparent', 'important');
            flagBtn.style.setProperty('opacity', '1', 'important');
        } else {
            flagBtn.style.setProperty('border-color', '#6c757d', 'important');
            flagBtn.style.setProperty('border-width', '1px', 'important');
            flagBtn.style.setProperty('border-style', 'solid', 'important');
            flagBtn.style.setProperty('background-color', 'transparent', 'important');
            flagBtn.style.setProperty('color', '#6c757d', 'important');
            flagBtn.style.setProperty('opacity', '0.5', 'important');
        }
        
        flagBtn.setAttribute('data-onclick', `window.WatchListsPage?.showFlagPalette(${item.id})`);
        flagBtn.title = 'שינוי דגל';
        flagBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (onClickHandler) {
                onClickHandler(item.id, e);
            } else if (window.WatchListsPage?.showFlagPalette) {
                window.WatchListsPage.showFlagPalette(item.id);
            }
        });
        
        const flagIcon = document.createElement('span');
        flagIcon.className = 'icon-placeholder icon';
        flagIcon.setAttribute('data-icon', flagColor ? 'flag-filled' : 'flag');
        flagIcon.setAttribute('data-size', '11'); // Reduced by 30% (from 16 to 11)
        flagIcon.setAttribute('data-alt', 'flag');
        flagIcon.setAttribute('aria-label', 'flag');
        
        const iconColor = flagColor || '#6c757d';
        if (flagColor) {
            flagIcon.style.setProperty('color', flagColor, 'important');
            flagIcon.style.setProperty('fill', flagColor, 'important');
            flagIcon.style.setProperty('stroke', flagColor, 'important');
            flagIcon.setAttribute('data-color', flagColor);
            flagIcon.style.setProperty('--icon-color', flagColor, 'important');
        } else {
            flagIcon.style.setProperty('color', '#6c757d', 'important');
            flagIcon.style.setProperty('fill', '#6c757d', 'important');
            flagIcon.style.setProperty('stroke', '#6c757d', 'important');
        }
        flagBtn.appendChild(flagIcon);
        
        // Render icon immediately if IconSystem is available
        if (window.IconSystem && window.IconSystem.initialized && window.IconSystem.renderIcon) {
            const iconName = flagColor ? 'flag-filled' : 'flag';
            window.IconSystem.renderIcon('button', iconName, {
                size: '11', // Reduced by 30% (from 16 to 11)
                alt: 'flag',
                class: 'icon',
                style: `color: ${iconColor} !important; fill: ${iconColor} !important; stroke: ${iconColor} !important;`
            }).then(iconHTML => {
                if (iconHTML && flagIcon.parentNode) {
                    const temp = document.createElement('div');
                    temp.innerHTML = iconHTML;
                    const newIcon = temp.firstElementChild;
                    if (newIcon && newIcon.tagName === 'svg') {
                        newIcon.setAttribute('fill', 'none');
                        newIcon.setAttribute('stroke', 'currentColor');
                        newIcon.style.setProperty('color', iconColor, 'important');
                        newIcon.style.setProperty('fill', 'none', 'important');
                        newIcon.style.setProperty('stroke', iconColor, 'important');
                        const paths = newIcon.querySelectorAll('path, circle, rect, line, polyline, polygon');
                        paths.forEach(path => {
                            path.removeAttribute('fill');
                            path.removeAttribute('stroke');
                            path.style.setProperty('fill', 'none', 'important');
                            path.style.setProperty('stroke', iconColor, 'important');
                            path.style.setProperty('color', iconColor, 'important');
                        });
                        flagIcon.replaceWith(newIcon);
                    }
                }
            }).catch(error => {
                window.Logger?.warn?.('⚠️ Failed to render flag icon', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
            });
        }
        
        return flagBtn;
    }

    async function renderCardsView(items) {
        if (!items) items = [];
        
        window.Logger?.debug?.('🃏 Rendering cards view', { ...PAGE_LOG_CONTEXT, count: items.length });
        
        const container = document.getElementById('watchListItemsCards');
        if (!container) {
            window.Logger?.warn?.('⚠️ watchListItemsCards container not found', PAGE_LOG_CONTEXT);
            return;
        }

        // Clear existing cards
        container.innerHTML = '';

        if (items.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'col-12 text-center text-muted py-5';
            emptyMsg.textContent = 'אין פריטים ברשימה זו. לחץ על "הוסף טיקר לרשימה" כדי להתחיל.';
            container.appendChild(emptyMsg);
            return;
        }

        // First, render all cards without charts
        const chartItems = [];
        for (const item of items) {
            const ticker = item.ticker || {};
            const currencySymbol = ticker.currency_symbol || ticker.currency?.symbol || '$';
            const price = ticker.current_price ?? ticker.price ?? null;
            const changePercent = ticker.change_percent ?? ticker.change_percentage ?? null;
            const dailyChangePercent = ticker.daily_change_percent ?? ticker.daily_change_percentage ?? null;
            const symbol = ticker.symbol || item.external_symbol || `טיקר #${item.id}`;
            
            // Calculate change amount (same logic as table view)
            let change = ticker.daily_change ?? ticker.change_amount ?? ticker.change_amount_day ?? ticker.change ?? null;
            if ((change === null || change === undefined || isNaN(parseFloat(change))) && 
                price !== null && price !== undefined && !isNaN(parseFloat(price)) &&
                changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent))) {
                change = parseFloat(price) * (parseFloat(changePercent) / 100);
            }
            
            // Position data
            const position = ticker.position || item.position || null;
            const positionQty = position && position.quantity !== undefined && position.quantity !== null ? parseFloat(position.quantity) : null;
            
            // Calculate value change
            let valueChange = null;
            if (positionQty !== null && positionQty !== 0) {
                const qtyAbs = Math.abs(positionQty);
                if (change !== null && change !== undefined && !isNaN(parseFloat(change))) {
                    valueChange = parseFloat(change) * qtyAbs;
                } else if (changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent)) && price !== null && price !== undefined && !isNaN(parseFloat(price))) {
                    valueChange = parseFloat(price) * qtyAbs * (parseFloat(changePercent) / 100);
                }
            }
            
            // P/L data
            const pl = ticker.profit_loss ?? ticker.pl ?? null;
            const plPercent = ticker.profit_loss_percent ?? ticker.pl_percent ?? null;
            
            // ATR data
            const atr = ticker.atr || null;
            const atrPercent = ticker.atr_percent || (atr !== null && price !== null && price > 0 ? (parseFloat(atr) / parseFloat(price) * 100) : null);

            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-1';

            const card = document.createElement('div');
            card.className = 'card h-100';
            card.setAttribute('data-item-id', item.id);

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body p-1'; // Reduced padding (from p-2 to p-1)

            // ===== HEADER ROW: Empty (chart shows symbol, price, change, flag) =====
            // No header row needed - chart shows everything

            // ===== MINI CHART PLACEHOLDER =====
            // TradingViewWidgetsFactory will create the container itself
            // We just need a placeholder div to mark where the chart should go
            const chartPlaceholder = document.createElement('div');
            chartPlaceholder.className = 'mb-1'; // Reduced margin (from mb-2 to mb-1)
            chartPlaceholder.id = `watch-list-chart-${item.id}`;
            // Empty - TradingViewWidgetsFactory will create content here
            cardBody.appendChild(chartPlaceholder);
            
            // Store chart data for lazy loading
            if (symbol) {
                chartItems.push({
                    item,
                    ticker,
                    symbol,
                    chartContainer: chartPlaceholder, // Will be used by TradingViewWidgetsFactory
                    currencySymbol,
                    price,
                    changePercent,
                    dailyChangePercent,
                    change,
                    position,
                    positionQty,
                    valueChange,
                    pl,
                    plPercent,
                    atr,
                    atrPercent
                });
            }

            // ===== BOTTOM ROW: Flag + All other info + Delete button =====
            const infoRow = document.createElement('div');
            infoRow.className = 'd-flex flex-wrap gap-1 align-items-center justify-content-between small text-muted'; // Reduced gap (from gap-2 to gap-1)
            
            // Left side: Flag + Info items
            const infoItemsContainer = document.createElement('div');
            infoItemsContainer.className = 'd-flex flex-wrap gap-1 align-items-center'; // Reduced gap (from gap-2 to gap-1)
            
            // Flag button (first in row, before ATR)
            const flagBtn = createFlagButton(item, (itemId, e) => {
                if (window.WatchListsPage?.showFlagPalette) {
                    window.WatchListsPage.showFlagPalette(itemId);
                }
            });
            infoItemsContainer.appendChild(flagBtn);
            
            // Helper function to add info item
            const addInfoItem = (label, value, renderFn) => {
                if (value !== null && value !== undefined && !isNaN(parseFloat(value))) {
                    const infoItem = document.createElement('span');
                    infoItem.className = 'd-inline-flex align-items-center gap-1';
                    const labelSpan = document.createElement('span');
                    labelSpan.textContent = `${label}:`;
                    infoItem.appendChild(labelSpan);
                    const valueSpan = document.createElement('span');
                    if (renderFn) {
                        valueSpan.innerHTML = renderFn(value);
                } else {
                        valueSpan.textContent = value;
                    }
                    infoItem.appendChild(valueSpan);
                    infoItemsContainer.appendChild(infoItem);
                }
            };
            
            // ATR (shown after flag, in same row as delete button)
            if (atrPercent !== null && atrPercent !== undefined && !isNaN(parseFloat(atrPercent))) {
                const atrItem = document.createElement('span');
                atrItem.className = 'd-inline-flex align-items-center gap-1';
                const atrLabel = document.createElement('span');
                atrLabel.textContent = 'ATR:';
                atrItem.appendChild(atrLabel);
                const atrValue = document.createElement('span');
                if (window.FieldRendererService?.renderATR && atr !== null) {
                    (async () => {
                        try {
                            const atrHtml = await window.FieldRendererService.renderATR(atr, atrPercent);
                            atrValue.innerHTML = atrHtml;
                        } catch (e) {
                            atrValue.textContent = `${atrPercent.toFixed(2)}%`;
                        }
                    })();
                } else {
                    atrValue.textContent = `${atrPercent.toFixed(2)}%`;
                }
                atrItem.appendChild(atrValue);
                infoItemsContainer.appendChild(atrItem);
            }
            
            // Position (only number and side, no label)
            if (position && positionQty !== null && positionQty !== 0) {
                const quantity = parseFloat(positionQty) || 0;
                const side = position.side || (quantity > 0 ? 'long' : quantity < 0 ? 'short' : 'closed');
                const quantityAbs = Math.abs(quantity);
                const sign = quantity > 0 ? '+' : '-';
                const positionItem = document.createElement('span');
                positionItem.className = 'd-inline-flex align-items-center gap-1';
                // Only number and side, no "פוזיציה:" label
                if (window.FieldRendererService?.renderSide) {
                    positionItem.innerHTML = `${window.FieldRendererService.renderSide(side)} #${sign}${quantityAbs.toLocaleString()}`;
                } else {
                    const sideLabel = side === 'long' ? 'לונג' : side === 'short' ? 'שורט' : '';
                    positionItem.innerHTML = `<span class="badge badge-${side} me-1">${sideLabel}</span>#${sign}${quantityAbs.toLocaleString()}`;
                }
                infoItemsContainer.appendChild(positionItem);
            }
            
            // Removed: Value Change, P/L, P/L % - not shown in cards view
            
            infoRow.appendChild(infoItemsContainer);
            
            // Right side: View details button + Delete button
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'd-flex gap-1 align-items-center';
            
            // View details button
            const tickerId = ticker.id || item.ticker_id;
            if (tickerId) {
                const viewBtn = document.createElement('button');
                viewBtn.type = 'button';
                viewBtn.setAttribute('data-button-type', 'VIEW');
                viewBtn.setAttribute('data-variant', 'small');
                viewBtn.setAttribute('data-text', '');
                viewBtn.setAttribute('data-onclick', `if (window.showEntityDetails) { window.showEntityDetails('ticker', ${tickerId}, { mode: 'view' }); }`);
                viewBtn.title = 'פרטי טיקר';
                buttonsContainer.appendChild(viewBtn);
            }
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.setAttribute('data-button-type', 'DELETE');
            deleteBtn.setAttribute('data-variant', 'small');
            deleteBtn.setAttribute('data-text', '');
            deleteBtn.setAttribute('data-onclick', `window.WatchListsPage?.removeItem(${item.id})`);
            deleteBtn.title = 'מחיקה';
            buttonsContainer.appendChild(deleteBtn);

            infoRow.appendChild(buttonsContainer);

            cardBody.appendChild(infoRow);
            card.appendChild(cardBody);
            col.appendChild(card);
            container.appendChild(col);
        }

        // Initialize button system for new buttons
        if (window.ButtonSystemInit?.processButtons) {
            setTimeout(() => {
                window.ButtonSystemInit.processButtons(container);
            }, 100);
        }

        // Load charts lazily, one after another
        if (chartItems.length > 0) {
            (async () => {
                // Load TradingView widgets if not available (only once)
                if (!window.TradingViewWidgetsFactory) {
                    window.Logger?.info?.('📦 Loading TradingView widgets dynamically', { 
                        ...PAGE_LOG_CONTEXT, 
                        chartCount: chartItems.length
                    });
                    
                    try {
                        // Load scripts in order using loadScriptOnce if available
                        if (window.loadScriptOnce) {
                            await window.loadScriptOnce('scripts/tradingview-widgets/tradingview-widgets-config.js');
                            await window.loadScriptOnce('scripts/tradingview-widgets/tradingview-widgets-colors.js');
                            await window.loadScriptOnce('scripts/tradingview-widgets/tradingview-widgets-factory.js');
                            await window.loadScriptOnce('scripts/tradingview-widgets/tradingview-widgets-core.js');
                            
                            // Wait a bit for scripts to initialize
                            let retries = 0;
                            const maxRetries = 20; // 20 * 100ms = 2 seconds
                            while (!window.TradingViewWidgetsFactory && retries < maxRetries) {
                                await new Promise(resolve => setTimeout(resolve, 100));
                                retries++;
                            }
                        } else {
                            // Fallback: wait for scripts to load (they should be in HTML)
                            let retries = 0;
                            const maxRetries = 30; // 30 * 100ms = 3 seconds
                            while (!window.TradingViewWidgetsFactory && retries < maxRetries) {
                                await new Promise(resolve => setTimeout(resolve, 100));
                                retries++;
                            }
                        }
                    } catch (error) {
                        window.Logger?.error?.('❌ Failed to load TradingView widgets', { 
                            ...PAGE_LOG_CONTEXT, 
                            error: error?.message || error
                        });
                    }
                }
                
                if (!window.TradingViewWidgetsFactory) {
                    window.Logger?.warn?.('⚠️ TradingViewWidgetsFactory not available after loading attempt', { 
                        ...PAGE_LOG_CONTEXT, 
                        chartCount: chartItems.length,
                        hasLoadScriptOnce: !!window.loadScriptOnce
                    });
                    // Show error message in all chart containers
                    chartItems.forEach(({ chartContainer }) => {
                        chartContainer.innerHTML = '<div class="text-center text-muted small py-3">גרף לא זמין</div>';
                    });
                    return;
                }
                
                // Load charts sequentially (one after another)
                for (let i = 0; i < chartItems.length; i++) {
                    const { item, ticker, symbol, chartContainer, currencySymbol } = chartItems[i];
                    
                    try {
                        // Get symbol for TradingView (format: EXCHANGE:SYMBOL or just SYMBOL)
                        const exchange = ticker.exchange || 'NASDAQ';
                        const tvSymbol = ticker.exchange ? `${exchange}:${symbol}` : symbol;
                        
                        // Get theme
                        let theme = 'light';
                        if (window.TradingViewWidgetsColors) {
                            theme = window.TradingViewWidgetsColors.getTheme() || 'light';
                        }
                        
                        // TradingViewWidgetsFactory will create the container and wrapper itself
                        // Just pass the container_id - factory will handle everything
                        const chartConfig = {
                            symbol: tvSymbol,
                            width: '100%',
                            height: 150,
                            dateRange: '1M',
                            colorTheme: theme,
                            isTransparent: false,
                            locale: 'he',
                            largeChartUrl: '',
                            container_id: chartContainer.id
                        };
                        
                        window.TradingViewWidgetsFactory.createWidget('mini-chart', chartConfig);
                        
                        // Wait for chart to load - check for wrapper or iframe
                        // TradingViewWidgetsFactory creates a wrapper div around the container
                        const observer = new MutationObserver((mutations, obs) => {
                            // Check if wrapper was created (TradingView widget structure)
                            const hasWrapper = chartContainer.parentElement?.classList?.contains('tradingview-widget-container');
                            const hasIframe = chartContainer.querySelector('iframe') || 
                                             chartContainer.parentElement?.querySelector('iframe');
                            const hasScript = chartContainer.parentElement?.querySelector('script[src*="tradingview"]');
                            
                            if (hasWrapper || hasIframe || hasScript) {
                                // Chart is loading/loaded
                                obs.disconnect();
                                
                                window.Logger?.debug?.('✅ Chart wrapper/iframe detected', { 
                                    ...PAGE_LOG_CONTEXT, 
                                    itemId: item.id, 
                                    symbol: tvSymbol,
                                    hasWrapper,
                                    hasIframe: !!hasIframe,
                                    hasScript: !!hasScript
                                });
                            }
                        });
                        
                        // Start observing - watch the container and its parent (for wrapper)
                        observer.observe(chartContainer, {
                            childList: true,
                            subtree: true,
                            attributes: false
                        });
                        
                        // Also observe parent in case wrapper is created
                        if (chartContainer.parentElement) {
                            observer.observe(chartContainer.parentElement, {
                                childList: true,
                                subtree: true,
                                attributes: false
                            });
                        }
                        
                        // Disconnect observer after 3 seconds (chart should be loading by then)
                        setTimeout(() => {
                            observer.disconnect();
                        }, 3000);
                        
                        window.Logger?.debug?.('✅ Mini chart created', { 
                            ...PAGE_LOG_CONTEXT, 
                            itemId: item.id, 
                            symbol: tvSymbol,
                            containerId: chartContainer.id,
                            progress: `${i + 1}/${chartItems.length}`
                        });
                        
                        // Wait a bit before loading next chart (to avoid overwhelming the browser)
                        if (i < chartItems.length - 1) {
                            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between charts
                        }
                    } catch (error) {
                        window.Logger?.warn?.('⚠️ Failed to create mini chart', { 
                            ...PAGE_LOG_CONTEXT, 
                            itemId: item.id, 
                            symbol, 
                            error: error?.message || error 
                        });
                        // Show placeholder if chart fails
                        chartContainer.innerHTML = '<div class="text-center text-muted small py-3">גרף לא זמין</div>';
                    }
                }
                
                window.Logger?.info?.('✅ All charts loaded', { 
                    ...PAGE_LOG_CONTEXT, 
                    totalCharts: chartItems.length
                });
            })();
        }

        window.Logger?.debug?.('🃏 Cards view rendered', { ...PAGE_LOG_CONTEXT, count: items.length });
    }

    /**
     * Render compact view (helper)
     * @param {Array} items - Items to render
     */
    async function renderCompactView(items) {
        if (!items) items = [];
        
        window.Logger?.debug?.('📋 Rendering compact view', { ...PAGE_LOG_CONTEXT, count: items.length });
        
        const container = document.getElementById('watchListItemsCompact');
        if (!container) {
            window.Logger?.warn?.('⚠️ watchListItemsCompact container not found', PAGE_LOG_CONTEXT);
            return;
        }

        // Clear existing items
        container.innerHTML = '';

        if (items.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'list-group-item text-center text-muted py-5';
            emptyMsg.textContent = 'אין פריטים ברשימה זו. לחץ על "הוסף טיקר לרשימה" כדי להתחיל.';
            container.appendChild(emptyMsg);
            return;
        }

        // Render each item as a compact list item
        for (const item of items) {
            const ticker = item.ticker || {};
            const currencySymbol = ticker.currency_symbol || ticker.currency?.symbol || '$';
            const price = ticker.current_price ?? ticker.price ?? null;
            const changePercent = ticker.change_percent ?? ticker.change_percentage ?? null;
            const dailyChangePercent = ticker.daily_change_percent ?? ticker.daily_change_percentage ?? null;
            const symbol = ticker.symbol || item.external_symbol || `טיקר #${item.id}`;
            
            // Calculate change amount (same logic as table view)
            let change = ticker.daily_change ?? ticker.change_amount ?? ticker.change_amount_day ?? ticker.change ?? null;
            if ((change === null || change === undefined || isNaN(parseFloat(change))) && 
                price !== null && price !== undefined && !isNaN(parseFloat(price)) &&
                changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent))) {
                change = parseFloat(price) * (parseFloat(changePercent) / 100);
            }
            
            // Position data
            const position = ticker.position || item.position || null;
            const positionQty = position && position.quantity !== undefined && position.quantity !== null ? parseFloat(position.quantity) : null;
            
            // Calculate value change
            let valueChange = null;
            if (positionQty !== null && positionQty !== 0) {
                const qtyAbs = Math.abs(positionQty);
                if (change !== null && change !== undefined && !isNaN(parseFloat(change))) {
                    valueChange = parseFloat(change) * qtyAbs;
                } else if (changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent)) && price !== null && price !== undefined && !isNaN(parseFloat(price))) {
                    valueChange = parseFloat(price) * qtyAbs * (parseFloat(changePercent) / 100);
                }
            }
            
            // P/L data
            const pl = ticker.profit_loss ?? ticker.pl ?? null;
            const plPercent = ticker.profit_loss_percent ?? ticker.pl_percent ?? null;
            
            // ATR data
            const atr = ticker.atr || null;
            const atrPercent = ticker.atr_percent || (atr !== null && price !== null && price > 0 ? (parseFloat(atr) / parseFloat(price) * 100) : null);

            const listItem = document.createElement('div');
            listItem.className = 'list-group-item watch-list-compact-item';
            listItem.setAttribute('data-item-id', item.id);
            listItem.setAttribute('data-widget-overlay', 'true');
            listItem.setAttribute('role', 'button');
            listItem.setAttribute('tabindex', '0');

            const itemContent = document.createElement('div');
            itemContent.className = 'd-flex justify-content-between align-items-center';

            const leftContent = document.createElement('div');
            leftContent.className = 'd-flex align-items-center gap-2';

            // Flag button using helper function
            const flagBtn = createFlagButton(item, (itemId, e) => {
                if (window.WatchListsPage?.showFlagPalette) {
                    window.WatchListsPage.showFlagPalette(itemId);
                }
            });
            leftContent.appendChild(flagBtn);

            // Symbol
            const symbolStrong = document.createElement('strong');
            symbolStrong.textContent = symbol;
            if (item.external_symbol) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary ms-2';
                badge.textContent = 'חיצוני';
                symbolStrong.appendChild(badge);
            }
            leftContent.appendChild(symbolStrong);

            // Price - only 4 fields visible: flag, symbol, price, change %
                const priceSpan = document.createElement('span');
            if (price !== null && price !== undefined && !isNaN(parseFloat(price)) && Number.isFinite(parseFloat(price)) && window.FieldRendererService?.renderAmount) {
                priceSpan.innerHTML = window.FieldRendererService.renderAmount(parseFloat(price), currencySymbol, 2, false);
                } else {
                priceSpan.textContent = 'לא זמין';
                priceSpan.className = 'text-muted';
                }
                leftContent.appendChild(priceSpan);

            // Change % - only 4 fields visible: flag, symbol, price, change %
            const changePercentSpan = document.createElement('span');
            if (changePercent !== null && changePercent !== undefined && !isNaN(parseFloat(changePercent)) && window.FieldRendererService?.renderNumericValue) {
                changePercentSpan.innerHTML = window.FieldRendererService.renderNumericValue(parseFloat(changePercent), '%', true);
                } else {
                changePercentSpan.textContent = '-';
                changePercentSpan.className = 'text-muted';
                }
            leftContent.appendChild(changePercentSpan);

            itemContent.appendChild(leftContent);

            // Actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'd-flex gap-1';

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.setAttribute('data-button-type', 'DELETE');
            deleteBtn.setAttribute('data-variant', 'small');
            deleteBtn.setAttribute('data-text', '');
            deleteBtn.setAttribute('data-onclick', `window.WatchListsPage?.removeItem(${item.id})`);
            deleteBtn.title = 'מחיקה';
            actionsDiv.appendChild(deleteBtn);

            itemContent.appendChild(actionsDiv);
            listItem.appendChild(itemContent);

            // Overlay with all additional details (hidden by default, shown on hover)
            const overlayDiv = document.createElement('div');
            overlayDiv.className = 'watch-list-compact-overlay';
            overlayDiv.setAttribute('data-overlay', 'true');
            overlayDiv.setAttribute('data-role', 'widget-detail');
            overlayDiv.style.display = 'none';
            
            const overlayContent = document.createElement('div');
            overlayContent.className = 'watch-list-compact-overlay-content';
            
            // Change amount
            if (change !== null && change !== undefined && !isNaN(parseFloat(change)) && Number.isFinite(parseFloat(change))) {
                const row = document.createElement('div');
                row.className = 'watch-list-compact-overlay-row';
                const label = document.createElement('span');
                label.className = 'watch-list-compact-overlay-label';
                label.textContent = 'שינוי בערך:';
                const value = document.createElement('span');
                value.className = 'watch-list-compact-overlay-value';
                if (window.FieldRendererService?.renderAmount) {
                    value.innerHTML = window.FieldRendererService.renderAmount(parseFloat(change), currencySymbol, 2, true);
                } else {
                    value.textContent = `${currencySymbol}${parseFloat(change).toFixed(2)}`;
                }
                row.appendChild(label);
                row.appendChild(value);
                overlayContent.appendChild(row);
            }
            
            // Daily Change %
            if (dailyChangePercent !== null && dailyChangePercent !== undefined && !isNaN(parseFloat(dailyChangePercent))) {
                const row = document.createElement('div');
                row.className = 'watch-list-compact-overlay-row';
                const label = document.createElement('span');
                label.className = 'watch-list-compact-overlay-label';
                label.textContent = 'שינוי היום %:';
                const value = document.createElement('span');
                value.className = 'watch-list-compact-overlay-value';
                if (window.FieldRendererService?.renderNumericValue) {
                    value.innerHTML = window.FieldRendererService.renderNumericValue(parseFloat(dailyChangePercent), '%', true);
                } else {
                    value.textContent = `${dailyChangePercent >= 0 ? '+' : ''}${parseFloat(dailyChangePercent).toFixed(2)}%`;
                }
                row.appendChild(label);
                row.appendChild(value);
                overlayContent.appendChild(row);
            }
            
            // ATR
            if (atr !== null && atrPercent !== null) {
                const row = document.createElement('div');
                row.className = 'watch-list-compact-overlay-row';
                const label = document.createElement('span');
                label.className = 'watch-list-compact-overlay-label';
                label.textContent = 'ATR:';
                const value = document.createElement('span');
                value.className = 'watch-list-compact-overlay-value';
                if (window.FieldRendererService?.renderATR) {
                    value.textContent = 'טוען...';
                    (async () => {
                        try {
                            const atrHtml = await window.FieldRendererService.renderATR(atr, atrPercent);
                            value.innerHTML = atrHtml;
                        } catch (e) {
                            window.Logger?.warn?.('Error rendering ATR', { ...PAGE_LOG_CONTEXT, error: e });
                            value.textContent = atrPercent ? `${atrPercent.toFixed(2)}%` : '-';
                        }
                    })();
                } else {
                    value.textContent = atrPercent ? `${atrPercent.toFixed(2)}%` : '-';
                }
                row.appendChild(label);
                row.appendChild(value);
                overlayContent.appendChild(row);
            }
            
            // Position
            if (position && positionQty !== null && positionQty !== 0) {
                const row = document.createElement('div');
                row.className = 'watch-list-compact-overlay-row';
                const label = document.createElement('span');
                label.className = 'watch-list-compact-overlay-label';
                label.textContent = 'פוזיציה:';
                const value = document.createElement('span');
                value.className = 'watch-list-compact-overlay-value';
                const quantity = parseFloat(positionQty) || 0;
                const side = position.side || (quantity > 0 ? 'long' : quantity < 0 ? 'short' : 'closed');
                const quantityAbs = Math.abs(quantity);
                const sign = quantity > 0 ? '+' : '-';
                if (window.FieldRendererService?.renderSide) {
                    value.innerHTML = `${window.FieldRendererService.renderSide(side)} #${sign}${quantityAbs.toLocaleString()}`;
                } else {
                    const sideLabel = side === 'long' ? 'לונג' : side === 'short' ? 'שורט' : '';
                    value.innerHTML = `<span class="badge badge-${side} me-1">${sideLabel}</span>#${sign}${quantityAbs.toLocaleString()}`;
                }
                row.appendChild(label);
                row.appendChild(value);
                overlayContent.appendChild(row);
            }
            
            // Value Change
            if (valueChange !== null && valueChange !== undefined && !isNaN(valueChange)) {
                const row = document.createElement('div');
                row.className = 'watch-list-compact-overlay-row';
                const label = document.createElement('span');
                label.className = 'watch-list-compact-overlay-label';
                label.textContent = 'שינוי בערך פוזיציה:';
                const value = document.createElement('span');
                value.className = 'watch-list-compact-overlay-value';
                if (window.FieldRendererService?.renderAmount) {
                    value.innerHTML = window.FieldRendererService.renderAmount(valueChange, currencySymbol, 2, true);
                } else {
                    value.textContent = `${currencySymbol}${valueChange.toFixed(2)}`;
                }
                row.appendChild(label);
                row.appendChild(value);
                overlayContent.appendChild(row);
            }
            
            // P/L
            if (pl !== null && pl !== undefined && !isNaN(parseFloat(pl))) {
                const row = document.createElement('div');
                row.className = 'watch-list-compact-overlay-row';
                const label = document.createElement('span');
                label.className = 'watch-list-compact-overlay-label';
                label.textContent = 'P/L:';
                const value = document.createElement('span');
                value.className = 'watch-list-compact-overlay-value';
                if (window.FieldRendererService?.renderAmount) {
                    value.innerHTML = window.FieldRendererService.renderAmount(parseFloat(pl), currencySymbol, 2, true);
                } else {
                    value.textContent = `${currencySymbol}${parseFloat(pl).toFixed(2)}`;
                }
                row.appendChild(label);
                row.appendChild(value);
                overlayContent.appendChild(row);
            }
            
            // P/L %
            if (plPercent !== null && plPercent !== undefined && !isNaN(parseFloat(plPercent))) {
                const row = document.createElement('div');
                row.className = 'watch-list-compact-overlay-row';
                const label = document.createElement('span');
                label.className = 'watch-list-compact-overlay-label';
                label.textContent = 'P/L %:';
                const value = document.createElement('span');
                value.className = 'watch-list-compact-overlay-value';
                if (window.FieldRendererService?.renderNumericValue) {
                    value.innerHTML = window.FieldRendererService.renderNumericValue(parseFloat(plPercent), '%', true);
                } else {
                    value.textContent = `${plPercent >= 0 ? '+' : ''}${parseFloat(plPercent).toFixed(2)}%`;
                }
                row.appendChild(label);
                row.appendChild(value);
                overlayContent.appendChild(row);
            }
            
            overlayDiv.appendChild(overlayContent);
            listItem.appendChild(overlayDiv);
            container.appendChild(listItem);
        }

        // Initialize button system for new buttons
        if (window.ButtonSystemInit?.processButtons) {
            setTimeout(() => {
                window.ButtonSystemInit.processButtons(container);
            }, 100);
        }

        // Setup overlay hover for compact view (like widgets)
        if (window.WidgetOverlayService && container) {
            window.WidgetOverlayService.destroy(container);
            window.WidgetOverlayService.setupOverlayHover(
                container,
                '.watch-list-compact-item',
                '[data-overlay="true"]',
                {
                    hoverClass: 'is-hovered',
                    gap: 8,
                    minWidth: 280,
                    maxWidth: 400,
                    zIndex: 1050,
                    useAnimations: true,
                    transitionDuration: 100
                }
            );
        }

        window.Logger?.debug?.('📋 Compact view rendered', { ...PAGE_LOG_CONTEXT, count: items.length });
    }

    // ===== PAGE STATE MANAGEMENT =====

    /**
     * Save page state (view mode, active list, sections)
     * @async
     */
    async function savePageState() {
        if (!window.PageStateManager) {
            return;
        }

        try {
            // Get section states
            const sections = {};
            const sectionIds = ['watch-lists-grid-section', 'active-list-section', 'summary-stats-section'];
            sectionIds.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionBody = section.querySelector('.section-body');
                    sections[sectionId] = sectionBody ? sectionBody.style.display === 'none' : false;
                }
            });

            const state = {
                viewMode: currentViewMode,
                activeListId: activeListId,
                sections: sections
            };

            await window.PageStateManager.savePageState(PAGE_NAME, state);
            if (window.Logger) {
                window.Logger.debug('✅ Saved page state', PAGE_LOG_CONTEXT);
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to save page state', { ...PAGE_LOG_CONTEXT, error });
            }
        }
    }

    /**
     * Restore page state (view mode, active list, sections)
     * @async
     */
    async function restorePageState() {
        if (!window.PageStateManager) {
            // Fallback to old method
            if (typeof window.PageStateManager?.get === 'function') {
                const savedViewMode = window.PageStateManager.get('watch-lists-view-mode');
                if (savedViewMode) {
                    setViewMode(savedViewMode);
                }
            }
            return;
        }

        try {
            const state = await window.PageStateManager.loadPageState(PAGE_NAME);
            if (!state) {
                return;
            }

            // Restore view mode
            if (state.viewMode) {
                setViewMode(state.viewMode);
            }

            // Restore active list
            if (state.activeListId) {
                selectList(state.activeListId);
            }

            // Restore section states
            if (state.sections) {
                Object.keys(state.sections).forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        const sectionBody = section.querySelector('.section-body');
                        if (sectionBody) {
                            sectionBody.style.display = state.sections[sectionId] ? 'none' : 'block';
                        }
                    }
                });
            }

            if (window.Logger) {
                window.Logger.debug('✅ Restored page state', PAGE_LOG_CONTEXT);
            }
        } catch (error) {
            if (window.Logger) {
                window.Logger.warn('Failed to restore page state', { ...PAGE_LOG_CONTEXT, error });
            }
        }
    }

    // ===== GLOBAL EXPORTS =====
    // Note: Initialization is handled by UnifiedAppInitializer via page-initialization-configs.js
    // The init function will be called automatically by the unified initialization system

    window.WatchListsPage = {
        // Initialization
        init: initializeWatchListsPage,
        registerTables: registerWatchListsTables,

        // Data loading
        loadWatchListsData,
        loadWatchLists,
        loadWatchListItems,

        // Rendering
        renderActiveListView,
        renderSummaryStats,
        renderFlaggedTickers,
        updateActiveListTitle,
        updateActiveListSelect,
        updateWatchListItemsTable,
        switchList,
        
        // Data getters (for external access)
        get watchListsData() { return watchListsData; },
        get activeListId() { return activeListId; },
        get watchListItemsData() { return activeListItems; },

        // View mode
        setViewMode,
        renderCardsView,
        renderCompactView,

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
        
        // Actions menu
        updateActionsMenu,

        // CRUD operations
        saveWatchList,
        deleteList,
        deleteCurrentList,
        selectList,
        // addTickerToList is now in add-ticker-modal.js
        removeItem,
        refreshAll,

        // Utilities
        getCurrentListId,
        refreshFlagLists
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
    
    // Export saveWatchList for modal save button (if watch-list-modal.js is not loaded)
    // This ensures the function is available even if watch-list-modal.js hasn't loaded yet
    if (!window.saveWatchList) {
        window.saveWatchList = saveWatchList;
    }

    window.Logger?.info?.('✅ WatchListsPage loaded successfully', PAGE_LOG_CONTEXT);

})();

