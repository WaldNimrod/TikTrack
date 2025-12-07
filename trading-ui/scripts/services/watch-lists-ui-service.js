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
         * @returns {Array} Array of flag color objects
         */
        getFlagColors() {
            return [
                { value: '#26baac', label: 'Trade', entityType: 'trade' },
                { value: '#0056b3', label: 'Trade Plan', entityType: 'trade_plan' },
                { value: '#28a745', label: 'Account', entityType: 'account' },
                { value: '#20c997', label: 'Cash Flow', entityType: 'cash_flow' },
                { value: '#dc3545', label: 'Ticker', entityType: 'ticker' },
                { value: '#fc5a06', label: 'Alert', entityType: 'alert' },
                { value: '#6f42c1', label: 'Note', entityType: 'note' },
                { value: '#17a2b8', label: 'Execution', entityType: 'execution' }
            ];
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
            // This will be handled by flag-quick-action.js
            // This is a placeholder
            window.Logger?.debug?.('🚩 Flag palette shown', { ...PAGE_LOG_CONTEXT, itemId });
        }

        /**
         * Set flag color
         * @param {number} itemId - Item ID
         * @param {string} color - Flag color (hex)
         */
        async setFlag(itemId, color) {
            try {
                // Get current list ID
                const listId = this.getCurrentListId();
                if (!listId) {
                    window.Logger?.warn?.('⚠️ No active list ID available', { ...PAGE_LOG_CONTEXT, itemId });
                    return;
                }

                // Update via data service
                if (window.WatchListsDataService?.updateWatchListItem) {
                    await window.WatchListsDataService.updateWatchListItem(listId, itemId, { flag_color: color });
                } else {
                    throw new Error('WatchListsDataService.updateWatchListItem not available');
                }

                // Invalidate cache
                if (window.CacheSyncManager?.invalidateByAction) {
                    await window.CacheSyncManager.invalidateByAction('watch-list-updated');
                }

                // Update UI immediately - support all view modes
                const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
                if (itemElement) {
                    const flagBtn = itemElement.querySelector('.btn-flag');
                    if (flagBtn) {
                        if (color) {
                            flagBtn.setAttribute('data-flag-color', color);
                            flagBtn.style.color = color;
                            const flagIcon = flagBtn.querySelector('.icon');
                            if (flagIcon) {
                                flagIcon.setAttribute('data-icon', 'flag-filled');
                                flagIcon.style.color = color;
                            }
                        } else {
                            flagBtn.removeAttribute('data-flag-color');
                            flagBtn.style.color = '';
                            const flagIcon = flagBtn.querySelector('.icon');
                            if (flagIcon) {
                                flagIcon.setAttribute('data-icon', 'flag');
                                flagIcon.style.color = '';
                            }
                        }
                    }
                }

                window.Logger?.info?.('✅ Flag set', { ...PAGE_LOG_CONTEXT, itemId, color });
            } catch (error) {
                window.Logger?.error?.('❌ Error setting flag', { ...PAGE_LOG_CONTEXT, itemId, color, error: error?.message || error });
                throw error; // Re-throw to allow caller to handle
            }
        }

        /**
         * Remove flag
         * @param {number} itemId - Item ID
         */
        async removeFlag(itemId) {
            try {
                // Get current list ID
                const listId = this.getCurrentListId();
                if (!listId) {
                    window.Logger?.warn?.('⚠️ No active list ID available', { ...PAGE_LOG_CONTEXT, itemId });
                    return;
                }

                // Update via data service
                if (window.WatchListsDataService?.updateWatchListItem) {
                    await window.WatchListsDataService.updateWatchListItem(listId, itemId, { flag_color: null });
                } else {
                    throw new Error('WatchListsDataService.updateWatchListItem not available');
                }

                // Invalidate cache
                if (window.CacheSyncManager?.invalidateByAction) {
                    await window.CacheSyncManager.invalidateByAction('watch-list-updated');
                }

                // Update UI immediately - support all view modes
                const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
                if (itemElement) {
                    const flagBtn = itemElement.querySelector('.btn-flag');
                    if (flagBtn) {
                        flagBtn.removeAttribute('data-flag-color');
                        flagBtn.style.color = '';
                        const flagIcon = flagBtn.querySelector('.icon');
                        if (flagIcon) {
                            flagIcon.setAttribute('data-icon', 'flag');
                            flagIcon.style.color = '';
                        }
                    }
                }

                window.Logger?.info?.('✅ Flag removed', { ...PAGE_LOG_CONTEXT, itemId });
            } catch (error) {
                window.Logger?.error?.('❌ Error removing flag', { ...PAGE_LOG_CONTEXT, itemId, error: error?.message || error });
                throw error; // Re-throw to allow caller to handle
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







