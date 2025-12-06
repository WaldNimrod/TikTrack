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
            renderWatchListsGrid();
            
            // Auto-select first list if no active list
            if (!activeListId && watchListsData && watchListsData.length > 0) {
                await selectList(watchListsData[0].id);
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
            
            window.Logger?.debug?.('📥 Loading watch list items', { ...PAGE_LOG_CONTEXT, listId });
            activeListItems = await window.WatchListsDataService.getWatchListItems(listId, { force: false });
            window.Logger?.debug?.('✅ Watch list items loaded', { ...PAGE_LOG_CONTEXT, listId, count: activeListItems?.length || 0 });
            
            if (!Array.isArray(activeListItems)) {
                window.Logger?.warn?.('⚠️ Watch list items is not an array', { ...PAGE_LOG_CONTEXT, listId, items: activeListItems });
                activeListItems = [];
            }
            
            // Ensure we have data before rendering
            if (activeListItems.length === 0) {
                window.Logger?.debug?.('No items in list, rendering empty state', { ...PAGE_LOG_CONTEXT, listId });
            }
            
            await renderActiveListView(activeListItems);
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

    // ===== RENDERING =====

    /**
     * Render watch lists grid
     */
    function renderWatchListsGrid() {
        const tbody = document.getElementById('watchListsTableBody');
        if (!tbody) {
            window.Logger?.warn?.('⚠️ watchListsTableBody not found', PAGE_LOG_CONTEXT);
            return;
        }

        // Clear existing rows
        tbody.innerHTML = '';

        // If no data, show empty message
        if (!watchListsData || watchListsData.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5;
            td.className = 'text-center text-muted';
            td.textContent = 'אין רשימות צפייה. לחץ על "יצירת רשימת צפייה חדשה" כדי להתחיל.';
            tr.appendChild(td);
            tbody.appendChild(tr);
            return;
        }

        // Render each watch list
        watchListsData.forEach(list => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-watch-list-id', list.id);
            // Add click handler to row - select list on click
            tr.style.cursor = 'pointer';
            tr.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons or actions
                if (e.target.closest('.actions-cell') || e.target.closest('button')) {
                    return;
                }
                window.WatchListsPage?.selectList(list.id);
            });

            // Icon column
            const tdIcon = document.createElement('td');
            tdIcon.className = 'col-icon';
            if (list.icon) {
                const iconSpan = document.createElement('span');
                iconSpan.className = 'icon-placeholder icon';
                iconSpan.setAttribute('data-icon', list.icon);
                iconSpan.setAttribute('data-size', '20');
                iconSpan.setAttribute('data-alt', list.icon);
                iconSpan.setAttribute('aria-label', list.icon);
                tdIcon.appendChild(iconSpan);
            }
            tr.appendChild(tdIcon);

            // Name column
            const tdName = document.createElement('td');
            tdName.className = 'col-name';
            const strong = document.createElement('strong');
            strong.textContent = list.name || `רשימה #${list.id}`;
            tdName.appendChild(strong);
            tr.appendChild(tdName);

            // View mode column
            const tdViewMode = document.createElement('td');
            tdViewMode.className = 'col-view-mode';
            const viewModeMap = { 'table': 'טבלה', 'cards': 'כרטיסים', 'compact': 'קומפקטי' };
            const viewModeIconMap = { 'table': 'table', 'cards': 'cards', 'compact': 'list' };
            const viewMode = list.view_mode || 'table';
            if (viewModeIconMap[viewMode]) {
                const iconSpan = document.createElement('span');
                iconSpan.className = 'icon-placeholder icon';
                iconSpan.setAttribute('data-icon', viewModeIconMap[viewMode]);
                iconSpan.setAttribute('data-size', '16');
                iconSpan.setAttribute('data-alt', viewMode);
                iconSpan.setAttribute('aria-label', viewMode);
                tdViewMode.appendChild(iconSpan);
            }
            const viewModeText = document.createElement('span');
            viewModeText.className = 'ms-2';
            viewModeText.textContent = viewModeMap[viewMode] || viewMode;
            tdViewMode.appendChild(viewModeText);
            tr.appendChild(tdViewMode);

            // Tickers count column
            const tdTickers = document.createElement('td');
            tdTickers.className = 'col-tickers';
            const itemsIcon = document.createElement('span');
            itemsIcon.className = 'icon-placeholder icon';
            itemsIcon.setAttribute('data-icon', 'items');
            itemsIcon.setAttribute('data-size', '14');
            itemsIcon.setAttribute('data-alt', 'items');
            itemsIcon.setAttribute('aria-label', 'items');
            tdTickers.appendChild(itemsIcon);
            const countText = document.createTextNode(` ${list.item_count || 0} טיקרים`);
            tdTickers.appendChild(countText);
            tr.appendChild(tdTickers);

            // Actions column
            const tdActions = document.createElement('td');
            tdActions.className = 'col-actions actions-cell';
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'd-flex gap-1 justify-content-center align-items-center';
            actionsDiv.style.flexWrap = 'nowrap';

            // View button
            const btnView = document.createElement('button');
            btnView.type = 'button';
            btnView.setAttribute('data-button-type', 'VIEW');
            btnView.setAttribute('data-variant', 'small');
            btnView.setAttribute('data-text', '');
            btnView.setAttribute('data-onclick', `window.WatchListsPage?.selectList(${list.id})`);
            btnView.title = 'פתח רשימה';
            actionsDiv.appendChild(btnView);

            // Edit button
            const btnEdit = document.createElement('button');
            btnEdit.type = 'button';
            btnEdit.setAttribute('data-button-type', 'EDIT');
            btnEdit.setAttribute('data-variant', 'small');
            btnEdit.setAttribute('data-text', '');
            btnEdit.setAttribute('data-onclick', `window.WatchListsPage?.editList(${list.id})`);
            btnEdit.title = 'ערוך רשימה';
            actionsDiv.appendChild(btnEdit);

            // Delete button
            const btnDelete = document.createElement('button');
            btnDelete.type = 'button';
            btnDelete.setAttribute('data-button-type', 'DELETE');
            btnDelete.setAttribute('data-variant', 'small');
            btnDelete.setAttribute('data-text', '');
            btnDelete.setAttribute('data-onclick', `window.WatchListsPage?.deleteList(${list.id})`);
            btnDelete.title = 'מחק רשימה';
            actionsDiv.appendChild(btnDelete);

            tdActions.appendChild(actionsDiv);
            tr.appendChild(tdActions);

            tbody.appendChild(tr);
        });

        // Update select dropdown
        updateActiveListSelect();

        // Initialize button system for new buttons
        if (window.ButtonSystemInit?.initializeButtons) {
            window.ButtonSystemInit.initializeButtons(tbody);
        }

        window.Logger?.debug?.('📊 Watch lists grid rendered', { ...PAGE_LOG_CONTEXT, count: watchListsData.length });
    }

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
        
        window.Logger?.debug?.('Rendering items to table', { ...PAGE_LOG_CONTEXT, itemsCount: items.length });

        // Render each item with full data using FieldRendererService
        // Using for...of loop to avoid async issues with forEach
        for (const item of items) {
            const tr = document.createElement('tr');
            tr.setAttribute('data-item-id', item.id);
            tr.setAttribute('draggable', 'true');

            const ticker = item.ticker || {};
            const currencySymbol = ticker.currency_symbol || ticker.currency?.symbol || '$';

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
            if (item.flag_color) {
                flagBtn.setAttribute('data-flag-color', item.flag_color);
            }
            flagBtn.setAttribute('data-onclick', `window.WatchListsPage?.showFlagPalette(${item.id})`);
            flagBtn.title = 'שינוי דגל';
            const flagIcon = document.createElement('span');
            flagIcon.className = 'icon-placeholder icon';
            flagIcon.setAttribute('data-icon', item.flag_color ? 'flag-filled' : 'flag');
            flagIcon.setAttribute('data-size', '16');
            flagIcon.setAttribute('data-alt', 'flag');
            flagIcon.setAttribute('aria-label', 'flag');
            flagBtn.appendChild(flagIcon);
            tdFlag.appendChild(flagBtn);
            tr.appendChild(tdFlag);

            // Symbol column
            const tdSymbol = document.createElement('td');
            const strong = document.createElement('strong');
            strong.textContent = ticker.symbol || item.external_symbol || `טיקר #${item.id}`;
            tdSymbol.appendChild(strong);
            if (item.external_symbol) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary ms-2';
                badge.textContent = 'חיצוני';
                tdSymbol.appendChild(badge);
            }
            tr.appendChild(tdSymbol);

            // Price column - using FieldRendererService
            const tdPrice = document.createElement('td');
            const price = ticker.current_price || ticker.price || null;
            if (price !== null && window.FieldRendererService?.renderAmount) {
                tdPrice.innerHTML = window.FieldRendererService.renderAmount(price, currencySymbol, 2, false);
            } else {
                tdPrice.textContent = 'לא זמין';
                tdPrice.className = 'text-muted';
            }
            tr.appendChild(tdPrice);

            // Change column - using FieldRendererService
            const tdChange = document.createElement('td');
            const change = ticker.change || ticker.change_amount || null;
            if (change !== null && window.FieldRendererService?.renderAmount) {
                tdChange.innerHTML = window.FieldRendererService.renderAmount(change, currencySymbol, 2, true);
            } else {
                tdChange.textContent = '-';
                tdChange.className = 'text-muted';
            }
            tr.appendChild(tdChange);

            // Change % column - using FieldRendererService
            const tdChangePercent = document.createElement('td');
            const changePercent = ticker.change_percent || ticker.change_percentage || null;
            if (changePercent !== null && window.FieldRendererService?.renderNumericValue) {
                tdChangePercent.innerHTML = window.FieldRendererService.renderNumericValue(changePercent, '%', true);
            } else {
                tdChangePercent.textContent = '-';
                tdChangePercent.className = 'text-muted';
            }
            tr.appendChild(tdChangePercent);

            // Daily Change % column - using FieldRendererService
            const tdDailyChange = document.createElement('td');
            const dailyChangePercent = ticker.daily_change_percent || ticker.daily_change_percentage || null;
            if (dailyChangePercent !== null && window.FieldRendererService?.renderNumericValue) {
                tdDailyChange.innerHTML = window.FieldRendererService.renderNumericValue(dailyChangePercent, '%', true);
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

            // Position column - need to fetch position data (placeholder for now)
            const tdPosition = document.createElement('td');
            // TODO: Fetch position data if available
            tdPosition.textContent = '-';
            tdPosition.className = 'text-muted';
            tr.appendChild(tdPosition);

            // P/L column - using FieldRendererService
            const tdPL = document.createElement('td');
            const pl = ticker.profit_loss || ticker.pl || null;
            if (pl !== null && window.FieldRendererService?.renderAmount) {
                tdPL.innerHTML = window.FieldRendererService.renderAmount(pl, currencySymbol, 2, true);
            } else {
                tdPL.textContent = '-';
                tdPL.className = 'text-muted';
            }
            tr.appendChild(tdPL);

            // P/L % column - using FieldRendererService
            const tdPLPercent = document.createElement('td');
            const plPercent = ticker.profit_loss_percent || ticker.pl_percent || null;
            if (plPercent !== null && window.FieldRendererService?.renderNumericValue) {
                tdPLPercent.innerHTML = window.FieldRendererService.renderNumericValue(plPercent, '%', true);
            } else {
                tdPLPercent.textContent = '-';
                tdPLPercent.className = 'text-muted';
            }
            tr.appendChild(tdPLPercent);

            // Actions column
            const tdActions = document.createElement('td');
            tdActions.className = 'actions-cell';
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'action-buttons-container';

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-sm btn-icon-only';
            editBtn.setAttribute('data-onclick', `window.WatchListsPage?.editItem(${item.id})`);
            editBtn.title = 'עריכה';
            const editIcon = document.createElement('span');
            editIcon.className = 'icon-placeholder icon';
            editIcon.setAttribute('data-icon', 'edit');
            editIcon.setAttribute('data-size', '16');
            editBtn.appendChild(editIcon);
            actionsContainer.appendChild(editBtn);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-sm btn-icon-only';
            deleteBtn.setAttribute('data-onclick', `window.WatchListsPage?.removeItem(${item.id})`);
            deleteBtn.title = 'מחיקה';
            const deleteIcon = document.createElement('span');
            deleteIcon.className = 'icon-placeholder icon';
            deleteIcon.setAttribute('data-icon', 'trash');
            deleteIcon.setAttribute('data-size', '16');
            deleteBtn.appendChild(deleteIcon);
            actionsContainer.appendChild(deleteBtn);

            tdActions.appendChild(actionsContainer);
            tr.appendChild(tdActions);

            tbody.appendChild(tr);
        }

        // Initialize button system for new buttons
        if (window.ButtonSystemInit?.initializeButtons) {
            window.ButtonSystemInit.initializeButtons(tbody);
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

        // Add options for each list
        watchListsData.forEach(list => {
            const option = document.createElement('option');
            option.value = list.id;
            option.textContent = list.name || `רשימה #${list.id}`;
            if (list.id === activeListId) {
                option.selected = true;
            }
            selectEl.appendChild(option);
        });

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
    function showFlagPalette(itemId) {
        // Use flag-quick-action.js if available
        if (window.FlagQuickAction?.show) {
            const flagBtn = document.querySelector(`[data-item-id="${itemId}"] .btn-flag`);
            if (flagBtn) {
                // Pass element for better positioning
                window.FlagQuickAction.show(itemId, { element: flagBtn });
            } else {
                window.FlagQuickAction.show(itemId);
            }
        } else if (window.WatchListsUIService?.showFlagPalette) {
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
            const list = watchListsData.find(l => l.id === listId);
            if (list) {
                if (typeof window.showModalSafe === 'function') {
                    await window.showModalSafe('watchListModal', 'edit');
                    // Populate form with data
                    if (window.ModalManagerV2 && window.ModalManagerV2.populateForm) {
                        window.ModalManagerV2.populateForm('watchListModal', list);
                    }
                } else if (window.ModalManagerV2) {
                    await window.ModalManagerV2.showModal('watchListModal', 'edit', list);
                } else {
                    window.Logger?.warn?.('⚠️ showModalSafe and ModalManagerV2 not available', PAGE_LOG_CONTEXT);
                }
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error opening edit list modal', { ...PAGE_LOG_CONTEXT, error });
        }
    }

    /**
     * Add ticker (open modal)
     */
    async function addTicker() {
        if (typeof window.showModalSafe === 'function') {
            await window.showModalSafe('addTickerModal', 'add');
        } else if (window.ModalManagerV2) {
            await window.ModalManagerV2.showModal('addTickerModal', 'add');
        } else {
            window.Logger?.warn?.('⚠️ showModalSafe and ModalManagerV2 not available', PAGE_LOG_CONTEXT);
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
                                Promise.resolve(renderActiveListView([])).catch(error => {
                                    window.Logger?.error?.('Error clearing active list view', { ...PAGE_LOG_CONTEXT, error });
                                });
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
     * Render cards view (helper)
     * @param {Array} items - Items to render
     */
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

        // Render each item as a card
        for (const item of items) {
            const ticker = item.ticker || {};
            const currencySymbol = ticker.currency_symbol || ticker.currency?.symbol || '$';
            const price = ticker.current_price || ticker.price || null;
            const change = ticker.change || ticker.change_amount || null;
            const changePercent = ticker.change_percent || ticker.change_percentage || null;
            const symbol = ticker.symbol || item.external_symbol || `טיקר #${item.id}`;

            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';

            const card = document.createElement('div');
            card.className = 'card h-100';
            card.setAttribute('data-item-id', item.id);

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            // Card header with symbol and flag
            const cardHeader = document.createElement('div');
            cardHeader.className = 'd-flex justify-content-between align-items-start mb-3';
            
            const symbolStrong = document.createElement('strong');
            symbolStrong.className = 'h5 mb-0';
            symbolStrong.textContent = symbol;
            cardHeader.appendChild(symbolStrong);

            if (item.flag_color) {
                const flagBtn = document.createElement('button');
                flagBtn.type = 'button';
                flagBtn.className = 'btn btn-sm btn-flag';
                flagBtn.setAttribute('data-flag-color', item.flag_color);
                flagBtn.setAttribute('data-onclick', `window.WatchListsPage?.showFlagPalette(${item.id})`);
                flagBtn.title = 'שינוי דגל';
                const flagIcon = document.createElement('span');
                flagIcon.className = 'icon-placeholder icon';
                flagIcon.setAttribute('data-icon', 'flag-filled');
                flagIcon.setAttribute('data-size', '16');
                flagBtn.appendChild(flagIcon);
                cardHeader.appendChild(flagBtn);
            }

            cardBody.appendChild(cardHeader);

            // Price
            if (price !== null) {
                const priceDiv = document.createElement('div');
                priceDiv.className = 'mb-2';
                if (window.FieldRendererService?.renderAmount) {
                    priceDiv.innerHTML = window.FieldRendererService.renderAmount(price, currencySymbol, 2, false);
                } else {
                    priceDiv.textContent = `${currencySymbol}${price.toFixed(2)}`;
                }
                cardBody.appendChild(priceDiv);
            }

            // Change
            if (changePercent !== null) {
                const changeDiv = document.createElement('div');
                changeDiv.className = 'mb-2';
                if (window.FieldRendererService?.renderNumericValue) {
                    changeDiv.innerHTML = window.FieldRendererService.renderNumericValue(changePercent, '%', true);
                } else {
                    changeDiv.textContent = changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`;
                }
                cardBody.appendChild(changeDiv);
            }

            // Actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'd-flex gap-2 mt-3';
            
            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-sm btn-outline-primary';
            editBtn.setAttribute('data-onclick', `window.WatchListsPage?.editItem(${item.id})`);
            editBtn.textContent = 'עריכה';
            actionsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.setAttribute('data-onclick', `window.WatchListsPage?.removeItem(${item.id})`);
            deleteBtn.textContent = 'מחיקה';
            actionsDiv.appendChild(deleteBtn);

            cardBody.appendChild(actionsDiv);
            card.appendChild(cardBody);
            col.appendChild(card);
            container.appendChild(col);
        }

        // Initialize button system for new buttons
        if (window.ButtonSystemInit?.initializeButtons) {
            window.ButtonSystemInit.initializeButtons(container);
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
            const price = ticker.current_price || ticker.price || null;
            const changePercent = ticker.change_percent || ticker.change_percentage || null;
            const symbol = ticker.symbol || item.external_symbol || `טיקר #${item.id}`;

            const listItem = document.createElement('div');
            listItem.className = 'list-group-item';
            listItem.setAttribute('data-item-id', item.id);

            const itemContent = document.createElement('div');
            itemContent.className = 'd-flex justify-content-between align-items-center';

            const leftContent = document.createElement('div');
            leftContent.className = 'd-flex align-items-center gap-3';

            // Symbol
            const symbolStrong = document.createElement('strong');
            symbolStrong.textContent = symbol;
            leftContent.appendChild(symbolStrong);

            // Price
            if (price !== null) {
                const priceSpan = document.createElement('span');
                if (window.FieldRendererService?.renderAmount) {
                    priceSpan.innerHTML = window.FieldRendererService.renderAmount(price, currencySymbol, 2, false);
                } else {
                    priceSpan.textContent = `${currencySymbol}${price.toFixed(2)}`;
                }
                leftContent.appendChild(priceSpan);
            }

            // Change %
            if (changePercent !== null) {
                const changeSpan = document.createElement('span');
                if (window.FieldRendererService?.renderNumericValue) {
                    changeSpan.innerHTML = window.FieldRendererService.renderNumericValue(changePercent, '%', true);
                } else {
                    changeSpan.textContent = changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`;
                }
                leftContent.appendChild(changeSpan);
            }

            itemContent.appendChild(leftContent);

            // Actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'd-flex gap-2';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-sm btn-outline-primary';
            editBtn.setAttribute('data-onclick', `window.WatchListsPage?.editItem(${item.id})`);
            editBtn.textContent = 'עריכה';
            actionsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.setAttribute('data-onclick', `window.WatchListsPage?.removeItem(${item.id})`);
            deleteBtn.textContent = 'מחיקה';
            actionsDiv.appendChild(deleteBtn);

            itemContent.appendChild(actionsDiv);
            listItem.appendChild(itemContent);
            container.appendChild(listItem);
        }

        // Initialize button system for new buttons
        if (window.ButtonSystemInit?.initializeButtons) {
            window.ButtonSystemInit.initializeButtons(container);
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
        renderWatchListsGrid,
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

        // CRUD operations
        saveWatchList,
        deleteList,
        deleteCurrentList,
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

