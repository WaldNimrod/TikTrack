/**
 * Watch Lists UI Service - TikTrack
 * ==================================
 * 
 * שירות UI לניהול תצוגות, דגלים, Quick Actions ו-Drag & Drop במערכת Watch Lists.
 * 
 * Responsibilities:
 * - ניהול תצוגות (Table/Cards/Compact)
 * - ניהול דגלים (8 צבעים)
 * - Quick Actions (Flag Palette)
 * - Drag & Drop (mockup - visual only)
 * 
 * Related Documentation:
 * - documentation/04-FEATURES/WATCH_LIST/FRONTEND_SERVICES_SPEC.md
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * 
 * Function Index:
 * ==============
 * 
 * VIEW MODE MANAGEMENT:
 * - switchViewMode(mode) - Switch view mode (table/cards/compact)
 * - getCurrentViewMode() - Get current view mode
 * - renderTableView(data) - Render table view
 * - renderCardsView(data) - Render cards view
 * - renderCompactView(data) - Render compact view
 * 
 * FLAG MANAGEMENT:
 * - showFlagPalette(itemId, position) - Show flag palette popup
 * - setFlag(itemId, color) - Set flag color
 * - removeFlag(itemId) - Remove flag
 * - filterByFlag(color) - Filter by flag color
 * - getFlagColors() - Get available flag colors
 * 
 * DRAG & DROP (MOCKUP):
 * - initializeDragAndDrop() - Initialize drag and drop (visual only)
 * - handleDragStart(event) - Handle drag start
 * - handleDragEnd(event) - Handle drag end
 * 
 * @version 1.0.0
 * @created 26 בנובמבר 2025
 * @author TikTrack Development Team
 */

(function watchListsUIService() {
    'use strict';

    const PAGE_LOG_CONTEXT = { page: 'watch-lists-ui-service' };

    /**
     * Watch Lists UI Service Class
     */
    class WatchListsUIService {
        constructor() {
            this.currentViewMode = 'table'; // 'table', 'cards', 'compact'
            this.flagColors = this.getFlagColors(); // 8 colors from entity colors
            this.activeFlagFilter = null;
        }

        /**
         * Get available flag colors
         * Uses ColorSchemeSystem to get colors from user preferences (not hardcoded)
         * Falls back to default colors if ColorSchemeSystem not available
         * @returns {Array} Array of flag color objects with entityType and dynamic color values
         */
        getFlagColors() {
            // Define flag types (entity types) - these are constant
            const flagTypes = [
                { entityType: 'trade', label: 'Trade' },
                { entityType: 'trade_plan', label: 'Trade Plan' },
                { entityType: 'account', label: 'Account' },
                { entityType: 'cash_flow', label: 'Cash Flow' },
                { entityType: 'ticker', label: 'Ticker' },
                { entityType: 'alert', label: 'Alert' },
                { entityType: 'note', label: 'Note' },
                { entityType: 'execution', label: 'Execution' }
            ];
            
            // Default colors (fallback if ColorSchemeSystem not available)
            const defaultColors = {
                'trade': '#26baac',
                'trade_plan': '#0056b3',
                'account': '#28a745',
                'cash_flow': '#20c997',
                'ticker': '#dc3545',
                'alert': '#fc5a06',
                'note': '#6f42c1',
                'execution': '#17a2b8'
            };
            
            // Get colors from ColorSchemeSystem (respects user preferences) or use defaults
            return flagTypes.map(flag => {
                // Try to get color from ColorSchemeSystem first (respects user preferences)
                let color = null;
                if (window.getEntityColor && typeof window.getEntityColor === 'function') {
                    color = window.getEntityColor(flag.entityType);
                }
                
                // Fallback to default color if ColorSchemeSystem not available or returned empty
                if (!color || color === '') {
                    color = defaultColors[flag.entityType] || '#6c757d'; // Gray fallback
                }
                
                return {
                    entityType: flag.entityType,
                    label: flag.label,
                    value: color // Always return a color (dynamic from preferences or default)
                };
            });
        }

        /**
         * Switch view mode
         * @param {string} mode - View mode ('table', 'cards', 'compact')
         */
        switchViewMode(mode) {
            if (!['table', 'cards', 'compact'].includes(mode)) {
                window.Logger?.warn?.('Invalid view mode', { ...PAGE_LOG_CONTEXT, mode });
                return;
            }

            this.currentViewMode = mode;

            // Hide all views
            const tableView = document.getElementById('tableView');
            const cardsView = document.getElementById('cardsView');
            const compactView = document.getElementById('compactView');

            if (tableView) tableView.classList.add('d-none');
            if (cardsView) cardsView.classList.add('d-none');
            if (compactView) compactView.classList.add('d-none');

            // Show selected view
            const selectedView = document.getElementById(`${mode}View`);
            if (selectedView) {
                selectedView.classList.remove('d-none');
            }

            // Update button states
            const buttons = document.querySelectorAll('.btn-view-mode');
            buttons.forEach(btn => {
                if (btn.getAttribute('data-view-mode') === mode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            // Save state
            if (typeof window.PageStateManager?.save === 'function') {
                window.PageStateManager.save('watch-lists-view-mode', mode);
            }

            window.Logger?.debug?.('✅ View mode switched', { ...PAGE_LOG_CONTEXT, mode });
        }

        /**
         * Get current view mode
         * @returns {string} Current view mode
         */
        getCurrentViewMode() {
            return this.currentViewMode;
        }

        /**
         * Render table view
         * @param {Array} data - Data to render
         */
        renderTableView(data) {
            window.Logger?.debug?.('📊 WatchListsUIService.renderTableView called', { ...PAGE_LOG_CONTEXT, itemCount: data?.length || 0 });
            
            // Call the actual table update function from WatchListsPage
            if (window.WatchListsPage?.updateWatchListItemsTable) {
                window.Logger?.debug?.('Calling WatchListsPage.updateWatchListItemsTable', { ...PAGE_LOG_CONTEXT });
                // Call async function properly
                Promise.resolve(window.WatchListsPage.updateWatchListItemsTable(data || [])).catch(error => {
                    window.Logger?.error?.('Error in updateWatchListItemsTable', { ...PAGE_LOG_CONTEXT, error });
                });
            } else {
                window.Logger?.warn?.('⚠️ WatchListsPage.updateWatchListItemsTable not available', { ...PAGE_LOG_CONTEXT });
            }
        }

        /**
         * Render cards view
         * @param {Array} data - Data to render
         */
        renderCardsView(data) {
            window.Logger?.debug?.('🃏 WatchListsUIService.renderCardsView called', { ...PAGE_LOG_CONTEXT, itemCount: data?.length || 0 });
            
            // Call the actual rendering function from WatchListsPage
            if (window.WatchListsPage?.renderCardsView) {
                window.Logger?.debug?.('Calling WatchListsPage.renderCardsView', { ...PAGE_LOG_CONTEXT });
                window.WatchListsPage.renderCardsView(data || []);
            } else {
                window.Logger?.warn?.('⚠️ WatchListsPage.renderCardsView not available', { ...PAGE_LOG_CONTEXT });
            }
        }

        /**
         * Render compact view
         * @param {Array} data - Data to render
         */
        renderCompactView(data) {
            window.Logger?.debug?.('📋 WatchListsUIService.renderCompactView called', { ...PAGE_LOG_CONTEXT, itemCount: data?.length || 0 });
            
            // Call the actual rendering function from WatchListsPage
            if (window.WatchListsPage?.renderCompactView) {
                window.Logger?.debug?.('Calling WatchListsPage.renderCompactView', { ...PAGE_LOG_CONTEXT });
                window.WatchListsPage.renderCompactView(data || []);
            } else {
                window.Logger?.warn?.('⚠️ WatchListsPage.renderCompactView not available', { ...PAGE_LOG_CONTEXT });
            }
        }

        /**
         * Show flag palette popup
         * @param {number} itemId - Item ID
         * @param {Object} position - Position { x, y } or element
         */
        showFlagPalette(itemId, position) {
            // Try to use FlagQuickAction first
            if (window.FlagQuickAction?.show) {
                const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
                const flagBtn = itemElement?.querySelector('.btn-flag');
                if (flagBtn) {
                    window.FlagQuickAction.show(itemId, { element: flagBtn });
                    return;
                }
                window.FlagQuickAction.show(itemId);
                return;
            }
            
            // Fallback: Create simple modal/popup for flag selection
            window.Logger?.warn?.('⚠️ FlagQuickAction not available, using fallback', { ...PAGE_LOG_CONTEXT, itemId });
            
            // Find flag button
            const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
            const flagBtn = itemElement?.querySelector('.btn-flag');
            if (!flagBtn) {
                window.Logger?.warn?.('⚠️ Flag button not found', { ...PAGE_LOG_CONTEXT, itemId });
                return;
            }
            
            // Create simple popup with flag colors
            const popup = document.createElement('div');
            popup.className = 'flag-palette-popup';
            popup.style.position = 'absolute';
            popup.style.backgroundColor = 'white';
            popup.style.border = '1px solid #ccc';
            popup.style.borderRadius = '4px';
            popup.style.padding = '8px';
            popup.style.zIndex = '9999';
            popup.style.display = 'flex';
            popup.style.gap = '4px';
            popup.style.flexWrap = 'wrap';
            popup.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            
            // Get flag colors
            const flagColors = this.getFlagColors();
            
            // Add color buttons
            flagColors.forEach(colorObj => {
                const colorBtn = document.createElement('button');
                colorBtn.type = 'button';
                colorBtn.className = 'flag-color-btn';
                colorBtn.style.width = '32px';
                colorBtn.style.height = '32px';
                colorBtn.style.backgroundColor = colorObj.value; // Dynamic color from ColorSchemeSystem
                colorBtn.style.border = '2px solid transparent';
                colorBtn.style.borderRadius = '4px';
                colorBtn.style.cursor = 'pointer';
                colorBtn.style.transition = 'all 0.2s';
                colorBtn.title = colorObj.label;
                colorBtn.setAttribute('data-color', colorObj.value);
                colorBtn.setAttribute('data-entity-type', colorObj.entityType || '');
                colorBtn.addEventListener('click', () => {
                    this.setFlag(itemId, colorObj.value, colorObj.entityType);
                    document.body.removeChild(popup);
                });
                // Hover effect
                colorBtn.addEventListener('mouseenter', () => {
                    colorBtn.style.transform = 'scale(1.15)';
                    colorBtn.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
                });
                colorBtn.addEventListener('mouseleave', () => {
                    colorBtn.style.transform = 'scale(1)';
                    colorBtn.style.boxShadow = 'none';
                });
                popup.appendChild(colorBtn);
            });
            
            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '×';
            removeBtn.style.width = '24px';
            removeBtn.style.height = '24px';
            removeBtn.style.border = '1px solid #ccc';
            removeBtn.style.borderRadius = '3px';
            removeBtn.style.cursor = 'pointer';
            removeBtn.title = 'הסר דגל';
            removeBtn.addEventListener('click', () => {
                this.removeFlag(itemId);
                document.body.removeChild(popup);
            });
            popup.appendChild(removeBtn);
            
            // Position popup near flag button
            const rect = flagBtn.getBoundingClientRect();
            popup.style.left = `${rect.left}px`;
            popup.style.top = `${rect.bottom + 4}px`;
            
            // Add to body
            document.body.appendChild(popup);
            
            // Close on outside click
            const closeOnOutside = (e) => {
                if (!popup.contains(e.target) && e.target !== flagBtn) {
                    document.body.removeChild(popup);
                    document.removeEventListener('click', closeOnOutside);
                }
            };
            setTimeout(() => {
                document.addEventListener('click', closeOnOutside);
            }, 100);
        }

        /**
         * Set flag color
         * @param {number} itemId - Item ID
         * @param {string} color - Flag color (hex) - from ColorSchemeSystem (respects user preferences)
         * @param {string} entityType - Entity type (trade, trade_plan, etc.) - constant identifier
         */
        async setFlag(itemId, color, entityType = null) {
            try {
                // Get current list ID and item data
                const listId = this.getCurrentListId();
                if (!listId) {
                    window.Logger?.warn?.('⚠️ No active list ID available', { ...PAGE_LOG_CONTEXT, itemId });
                    return;
                }

                // If entityType not provided, find it from color
                if (!entityType && color) {
                    const flagColors = this.getFlagColors();
                    const flagColor = flagColors.find(fc => fc.value === color);
                    if (flagColor) {
                        entityType = flagColor.entityType;
                    }
                }

                if (!entityType) {
                    throw new Error('Entity type is required to set flag');
                }

                // Get item data to find ticker_id or external_symbol
                const items = await window.WatchListsDataService?.getWatchListItems?.(listId) || [];
                const item = items.find(i => i.id === itemId);
                if (!item) {
                    throw new Error(`Item ${itemId} not found`);
                }

                // Get all watch lists to find flag lists
                const allListsData = await window.WatchListsDataService?.loadWatchListsData?.() || {};
                const allLists = allListsData.data || [];
                const flagLists = allLists.filter(list => list.is_flag_list === 1);

                // STEP 1: Remove ticker from all other flag lists
                for (const flagList of flagLists) {
                    if (flagList.flag_entity_type === entityType) {
                        continue; // Skip the target flag list
                    }
                    
                    // Find if ticker exists in this flag list
                    const flagListItems = await window.WatchListsDataService?.getWatchListItems?.(flagList.id) || [];
                    const existingItem = flagListItems.find(i => 
                        (item.ticker_id && i.ticker_id === item.ticker_id) ||
                        (item.external_symbol && i.external_symbol === item.external_symbol)
                    );
                    
                    if (existingItem) {
                        // Remove from this flag list
                        await window.WatchListsDataService?.removeTickerFromList?.(existingItem.id);
                        window.Logger?.debug?.('🗑️ Removed ticker from flag list', { 
                            ...PAGE_LOG_CONTEXT, 
                            flagListId: flagList.id, 
                            itemId: existingItem.id 
                        });
                    }
                }

                // STEP 2: Get or create target flag list
                let targetFlagList = flagLists.find(list => list.flag_entity_type === entityType);
                if (!targetFlagList) {
                    // Create flag list if doesn't exist
                    if (window.WatchListsDataService?.syncSingleFlagList) {
                        const flagListData = await window.WatchListsDataService.syncSingleFlagList(color, entityType);
                        targetFlagList = flagListData;
                    } else {
                        throw new Error('Cannot create flag list - syncSingleFlagList not available');
                    }
                }

                // STEP 3: Check if ticker already in target flag list
                const targetFlagListItems = await window.WatchListsDataService?.getWatchListItems?.(targetFlagList.id) || [];
                const alreadyInList = targetFlagListItems.find(i => 
                    (item.ticker_id && i.ticker_id === item.ticker_id) ||
                    (item.external_symbol && i.external_symbol === item.external_symbol)
                );

                if (!alreadyInList) {
                    // Add ticker to target flag list using existing function
                    // NOTE: Do NOT pass flag_color or flag_entity_type - flag is determined by which flag list the ticker is in
                    const tickerData = {
                        ticker_id: item.ticker_id,
                        external_symbol: item.external_symbol,
                        external_name: item.external_name
                    };
                    await window.WatchListsDataService?.addTickerToList?.(targetFlagList.id, tickerData);
                    window.Logger?.info?.('✅ Added ticker to flag list', { 
                        ...PAGE_LOG_CONTEXT, 
                        flagListId: targetFlagList.id, 
                        itemId 
                    });
                }

                // STEP 4: Do NOT update original item - flag is determined by which flag list ticker is in
                // The flag will be automatically determined in to_dict() when loading items

                // STEP 5: Reload lists
                if (window.WatchListsPage?.loadWatchLists) {
                    await window.WatchListsPage.loadWatchLists();
                }
                if (window.WatchListsPage?.loadWatchListItems) {
                    await window.WatchListsPage.loadWatchListItems(listId);
                    if (targetFlagList?.id) {
                        await window.WatchListsPage.loadWatchListItems(targetFlagList.id);
                    }
                }

                window.Logger?.info?.('✅ Flag set and ticker moved to flag list', { ...PAGE_LOG_CONTEXT, itemId, color, entityType });
            } catch (error) {
                window.Logger?.error?.('❌ Error setting flag', { ...PAGE_LOG_CONTEXT, itemId, color, error: error?.message || error });
                throw error;
            }
        }

        /**
         * Remove flag
         * @param {number} itemId - Item ID
         */
        async removeFlag(itemId) {
            try {
                // Get current list ID and item data
                const listId = this.getCurrentListId();
                if (!listId) {
                    window.Logger?.warn?.('⚠️ No active list ID available', { ...PAGE_LOG_CONTEXT, itemId });
                    return;
                }

                // Get item data
                const items = await window.WatchListsDataService?.getWatchListItems?.(listId) || [];
                const item = items.find(i => i.id === itemId);
                if (!item) {
                    throw new Error(`Item ${itemId} not found`);
                }

                // Get all flag lists
                const allListsData = await window.WatchListsDataService?.loadWatchListsData?.() || {};
                const allLists = allListsData.data || [];
                const flagLists = allLists.filter(list => list.is_flag_list === 1);

                // Remove ticker from all flag lists
                for (const flagList of flagLists) {
                    const flagListItems = await window.WatchListsDataService?.getWatchListItems?.(flagList.id) || [];
                    const existingItem = flagListItems.find(i => 
                        (item.ticker_id && i.ticker_id === item.ticker_id) ||
                        (item.external_symbol && i.external_symbol === item.external_symbol)
                    );
                    
                    if (existingItem) {
                        await window.WatchListsDataService?.removeTickerFromList?.(existingItem.id);
                        window.Logger?.debug?.('🗑️ Removed ticker from flag list', { 
                            ...PAGE_LOG_CONTEXT, 
                            flagListId: flagList.id, 
                            itemId: existingItem.id 
                        });
                    }
                }

                // Do NOT update original item - flag is determined by which flag list ticker is in
                // The flag will be automatically determined in to_dict() when loading items

                // Reload lists
                if (window.WatchListsPage?.loadWatchLists) {
                    await window.WatchListsPage.loadWatchLists();
                }
                if (window.WatchListsPage?.loadWatchListItems) {
                    await window.WatchListsPage.loadWatchListItems(listId);
                }

                window.Logger?.info?.('✅ Flag removed and ticker removed from all flag lists', { ...PAGE_LOG_CONTEXT, itemId });
            } catch (error) {
                window.Logger?.error?.('❌ Error removing flag', { ...PAGE_LOG_CONTEXT, itemId, error: error?.message || error });
                throw error;
            }
        }

        /**
         * Filter by flag color
         * @param {string} color - Flag color (hex)
         */
        filterByFlag(color) {
            this.activeFlagFilter = color === this.activeFlagFilter ? null : color;

            // Apply filter via UnifiedTableSystem
            if (typeof window.UnifiedTableSystem?.filter?.apply === 'function') {
                // This would integrate with the filter system
                window.Logger?.debug?.('🔍 Filter by flag applied', { ...PAGE_LOG_CONTEXT, color: this.activeFlagFilter });
            }

            // Update button states
            const filterButtons = document.querySelectorAll('[data-flag-color]');
            filterButtons.forEach(btn => {
                if (btn.getAttribute('data-flag-color') === this.activeFlagFilter) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        /**
         * Get current list ID (helper)
         * @returns {number|null} Current list ID
         */
        getCurrentListId() {
            // Try to get from WatchListsPage first (most reliable)
            if (window.WatchListsPage?.activeListId) {
                return window.WatchListsPage.activeListId;
            }
            
            // Fallback to PageStateManager
            if (typeof window.PageStateManager?.get === 'function') {
                return window.PageStateManager.get('watch-lists-active-list-id');
            }
            
            return null;
        }

        /**
         * Initialize drag and drop for reordering items
         */
        initializeDragAndDrop() {
            const tbody = document.querySelector('#watchListItemsTable tbody');
            if (!tbody) {
                window.Logger?.warn?.('⚠️ Watch list items table not found for drag & drop', { ...PAGE_LOG_CONTEXT });
                return;
            }

            const rows = tbody.querySelectorAll('tr[data-item-id]');
            let draggedElement = null;

            rows.forEach(row => {
                // Make row draggable
                row.setAttribute('draggable', 'true');

                // Drag start
                row.addEventListener('dragstart', (e) => {
                    draggedElement = row;
                    row.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', row.innerHTML);
                });

                // Drag end
                row.addEventListener('dragend', () => {
                    row.classList.remove('dragging');
                    draggedElement = null;
                });

                // Drag over
                row.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    if (draggedElement && draggedElement !== row) {
                        const rect = row.getBoundingClientRect();
                        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                        tbody.insertBefore(draggedElement, next ? row.nextSibling : row);
                    }
                });

                // Drop
                row.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    
                    if (draggedElement && draggedElement !== row) {
                        const rect = row.getBoundingClientRect();
                        const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                        tbody.insertBefore(draggedElement, next ? row.nextSibling : row);

                        // Get new order
                        const newOrder = Array.from(tbody.querySelectorAll('tr[data-item-id]')).map((r, index) => ({
                            id: parseInt(r.getAttribute('data-item-id')),
                            order: index + 1
                        }));

                        // Get current list ID
                        const listId = window.WatchListsPage?.activeListId;
                        if (listId && window.WatchListsDataService?.updateItemOrder) {
                            try {
                                await window.WatchListsDataService.updateItemOrder(listId, newOrder);
                                window.Logger?.info?.('✅ Item order updated', { ...PAGE_LOG_CONTEXT, listId });
                            } catch (error) {
                                window.Logger?.error?.('❌ Error updating item order', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
                                // Reload to restore original order
                                if (window.WatchListsPage?.loadWatchListItems) {
                                    await window.WatchListsPage.loadWatchListItems(listId);
                                }
                            }
                        }
                    }
                });
            });

            window.Logger?.debug?.('✅ Drag and drop initialized', { ...PAGE_LOG_CONTEXT });
        }
    }

    // ===== GLOBAL EXPORTS =====

    const uiService = new WatchListsUIService();
    window.WatchListsUIService = uiService;

    window.Logger?.info?.('✅ WatchListsUIService loaded successfully', PAGE_LOG_CONTEXT);

})();







