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
            // Table view is handled by UnifiedTableSystem
            // This function is a placeholder for future customizations
            window.Logger?.debug?.('📊 Table view rendered', { ...PAGE_LOG_CONTEXT, itemCount: data?.length || 0 });
        }

        /**
         * Render cards view
         * @param {Array} data - Data to render
         */
        renderCardsView(data) {
            // Cards view rendering logic
            // This is handled by the page script, this is a placeholder
            window.Logger?.debug?.('🃏 Cards view rendered', { ...PAGE_LOG_CONTEXT, itemCount: data?.length || 0 });
        }

        /**
         * Render compact view
         * @param {Array} data - Data to render
         */
        renderCompactView(data) {
            // Compact view rendering logic
            // This is handled by the page script, this is a placeholder
            window.Logger?.debug?.('📋 Compact view rendered', { ...PAGE_LOG_CONTEXT, itemCount: data?.length || 0 });
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
                // Update via data service
                if (typeof window.WatchListsDataService?.updateWatchListItem === 'function') {
                    // Get current list ID (would need to be passed or stored)
                    const listId = this.getCurrentListId();
                    if (listId) {
                        await window.WatchListsDataService.updateWatchListItem(listId, itemId, { flag_color: color });
                    }
                }

                // Update UI
                const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
                if (itemElement) {
                    const flagBtn = itemElement.querySelector('.btn-flag');
                    if (flagBtn) {
                        flagBtn.setAttribute('data-flag-color', color);
                        // Update icon via IconSystem
                        if (typeof window.IconSystem?.renderIcon === 'function') {
                            const iconHTML = await window.IconSystem.renderIcon('button', 'flag-filled', {
                                size: '16',
                                alt: 'flag',
                                class: 'icon',
                                style: `color: ${color}`
                            });
                            flagBtn.textContent = '';
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(iconHTML, 'text/html');
                            doc.body.childNodes.forEach(node => {
                                flagBtn.appendChild(node.cloneNode(true));
                            });
                        }
                    }
                }

                window.Logger?.info?.('✅ Flag set', { ...PAGE_LOG_CONTEXT, itemId, color });
            } catch (error) {
                window.Logger?.error?.('❌ Error setting flag', { ...PAGE_LOG_CONTEXT, itemId, color, error: error?.message || error });
            }
        }

        /**
         * Remove flag
         * @param {number} itemId - Item ID
         */
        async removeFlag(itemId) {
            try {
                // Update via data service
                if (typeof window.WatchListsDataService?.updateWatchListItem === 'function') {
                    const listId = this.getCurrentListId();
                    if (listId) {
                        await window.WatchListsDataService.updateWatchListItem(listId, itemId, { flag_color: null });
                    }
                }

                // Update UI
                const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
                if (itemElement) {
                    const flagBtn = itemElement.querySelector('.btn-flag');
                    if (flagBtn) {
                        flagBtn.removeAttribute('data-flag-color');
                        // Update icon via IconSystem
                        if (typeof window.IconSystem?.renderIcon === 'function') {
                            const iconHTML = await window.IconSystem.renderIcon('button', 'flag', {
                                size: '16',
                                alt: 'flag',
                                class: 'icon text-muted'
                            });
                            flagBtn.textContent = '';
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(iconHTML, 'text/html');
                            doc.body.childNodes.forEach(node => {
                                flagBtn.appendChild(node.cloneNode(true));
                            });
                        }
                    }
                }

                window.Logger?.info?.('✅ Flag removed', { ...PAGE_LOG_CONTEXT, itemId });
            } catch (error) {
                window.Logger?.error?.('❌ Error removing flag', { ...PAGE_LOG_CONTEXT, itemId, error: error?.message || error });
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
            // This would be stored in the page state
            if (typeof window.PageStateManager?.get === 'function') {
                return window.PageStateManager.get('watch-lists-active-list-id');
            }
            return null;
        }

        /**
         * Initialize drag and drop (mockup - visual only)
         */
        initializeDragAndDrop() {
            // Mockup implementation - visual only
            const draggableItems = document.querySelectorAll('[draggable="true"]');
            draggableItems.forEach(item => {
                item.addEventListener('dragstart', this.handleDragStart.bind(this));
                item.addEventListener('dragend', this.handleDragEnd.bind(this));
            });

            window.Logger?.debug?.('🎯 Drag and drop initialized (mockup)', { ...PAGE_LOG_CONTEXT });
        }

        /**
         * Handle drag start
         * @param {DragEvent} event - Drag event
         */
        handleDragStart(event) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/html', event.target.outerHTML);
            event.target.classList.add('dragging');
        }

        /**
         * Handle drag end
         * @param {DragEvent} event - Drag event
         */
        handleDragEnd(event) {
            event.target.classList.remove('dragging');
        }
    }

    // ===== GLOBAL EXPORTS =====

    const uiService = new WatchListsUIService();
    window.WatchListsUIService = uiService;

    window.Logger?.info?.('✅ WatchListsUIService loaded successfully', PAGE_LOG_CONTEXT);

})();







