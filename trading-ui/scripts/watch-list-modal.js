/**
 * Watch List Modal - TikTrack
 * ============================
 * 
 * מודל Add/Edit Watch List
 * 
 * @file trading-ui/scripts/watch-list-modal.js
 * @version 1.0.0
 * @created 26 בנובמבר 2025
 * @author TikTrack Development Team
 * 
 * ===== FUNCTION INDEX =====
 * 
 * MODAL MANAGEMENT (3)
 * - initializeWatchListModal() - אתחול המודל
 * - openWatchListModal(mode, data) - פתיחת מודל
 * - closeWatchListModal() - סגירת מודל
 * 
 * FORM MANAGEMENT (3)
 * - populateForm(data) - מילוי טופס
 * - validateForm() - בדיקת תקינות טופס
 * - resetForm() - איפוס טופס
 * 
 * DATA HANDLING (2)
 * - saveWatchList() - שמירת רשימה
 * - handleColorChange() - טיפול בשינוי צבע
 * 
 * ==========================================
 */

(function() {
    'use strict';

    const PAGE_NAME = 'watch-list-modal';
    const PAGE_LOG_CONTEXT = { page: PAGE_NAME };

    let currentMode = 'create'; // 'create' or 'edit'
    let currentListId = null;

    // ===== MODAL MANAGEMENT =====

    /**
     * Initialize Watch List Modal
     */
    async function initializeWatchListModal() {
        window.Logger?.info?.('🔧 Initializing Watch List Modal...', PAGE_LOG_CONTEXT);
        
        // Wait for DOM elements to be ready
        let retries = 0;
        while (retries < 10) {
            const iconSelector = document.getElementById('watchListIconSelector');
            const viewModeRadios = document.querySelectorAll('input[name="watchListViewMode"]');
        
            if (iconSelector && viewModeRadios.length > 0) {
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            retries++;
        }
        
        // Populate icon selector
        try {
            await populateIconSelector();
            window.Logger?.info?.('✅ Icon selector populated', PAGE_LOG_CONTEXT);
        } catch (error) {
            window.Logger?.error?.('❌ Error populating icon selector', { ...PAGE_LOG_CONTEXT, error });
        }
        
        
        // Setup view mode radio buttons
        try {
            setupViewModeSelector();
            window.Logger?.info?.('✅ View mode selector setup', PAGE_LOG_CONTEXT);
        } catch (error) {
            window.Logger?.error?.('❌ Error setting up view mode selector', { ...PAGE_LOG_CONTEXT, error });
        }

        // Setup default values
        if (typeof window.DefaultValueSetter?.setDefaults === 'function') {
            window.DefaultValueSetter.setDefaults('watchListForm', {
                watchListIcon: { preference: 'watch-list-default-icon' },
                watchListViewMode: { preference: 'watch-list-default-view-mode', defaultValue: 'table' }
            });
        }

        window.Logger?.info?.('✅ Watch List Modal initialized successfully', PAGE_LOG_CONTEXT);
    }

    /**
     * Populate icon selector with available icons (Tabler Icons)
     * @async
     */
    async function populateTablerIcons() {
        const iconSelector = document.getElementById('watchListIconSelector');
        
        if (!iconSelector) {
            window.Logger?.warn?.('⚠️ watchListIconSelector not found, retrying...', PAGE_LOG_CONTEXT);
            setTimeout(populateTablerIcons, 200);
            return;
        }

        // Wait for IconSystem to be available
        let retries = 0;
        while (!window.IconSystem && retries < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }

        if (!window.IconSystem) {
            window.Logger?.warn?.('⚠️ IconSystem not available, using fallback', PAGE_LOG_CONTEXT);
            iconSelector.innerHTML = '<div class="text-muted p-3 text-center">טוען איקונים...</div>';
            return;
        }

        if (!window.IconSystem.initialized) {
            try {
                await window.IconSystem.initialize();
            } catch (error) {
                window.Logger?.error?.('❌ Error initializing IconSystem', { ...PAGE_LOG_CONTEXT, error });
            }
        }

        // Get available Tabler icons from IconMappings
        // Note: 'star', 'heart', 'list', 'tags', 'chart-pie', 'cash', 'clock-history', 
        // 'check-circle', 'x-circle', 'plus-circle' are not available in Tabler Icons - removed/replaced
        const tablerIcons = [
            '', 'chart-line', 'eye', 'flame', 'coins', 
            'table', 'cards', 'bookmark', 'tag', 'activity', 
            'wallet', 'calendar', 'pencil', 'trash', 
            'plus', 'check', 'x', 'search', 'filter', 'settings', 'download', 
            'upload', 'refresh', 'archive', 'copy', 'link', 'info-circle', 
            'alert-triangle'
        ];

        iconSelector.innerHTML = '';
        
        window.Logger?.info?.('🎨 Populating Tabler icons', { ...PAGE_LOG_CONTEXT, count: tablerIcons.length });

        let loadedCount = 0;
        for (const iconName of tablerIcons) {
            const iconItem = document.createElement('div');
            iconItem.className = 'icon-selector-item';
            iconItem.dataset.icon = iconName;
            iconItem.dataset.library = 'tabler';

            if (iconName === '') {
                // No icon option
                iconItem.innerHTML = `
                    <div class="icon-preview no-icon">
                        <span>ללא</span>
                    </div>
                `;
            } else {
                // Render icon preview
                try {
                    const iconHTML = await window.IconSystem.renderIcon('button', iconName, {
                        size: '24',
                        alt: iconName,
                        class: 'icon-preview-icon'
                    });
                    
                    // If we got an img tag instead of SVG, try to enhance it
                    if (iconHTML && iconHTML.includes('<img')) {
                        // Wait a bit for img to load, then try to convert to SVG
                        iconItem.innerHTML = `
                            <div class="icon-preview">
                                ${iconHTML}
                            </div>
                        `;
                        
                        // Try to enhance img to SVG after it loads
                        const img = iconItem.querySelector('img');
                        if (img) {
                            img.addEventListener('load', async () => {
                                try {
                                    const svgHTML = await window.IconSystem.renderIcon('button', iconName, {
                                        size: '24',
                                        alt: iconName,
                                        class: 'icon-preview-icon'
                                    });
                                    if (svgHTML && svgHTML.includes('<svg')) {
                                        iconItem.querySelector('.icon-preview').innerHTML = svgHTML;
                                    }
                                } catch (e) {
                                    // Keep img if SVG conversion fails
                                }
                            });
                            img.addEventListener('error', () => {
                                // If img fails to load, show icon name
                                iconItem.querySelector('.icon-preview').innerHTML = `<span>${iconName}</span>`;
                            });
                        }
                    } else {
                        iconItem.innerHTML = `
                            <div class="icon-preview">
                                ${iconHTML}
                            </div>
                        `;
                    }
                } catch (error) {
                    window.Logger?.warn?.('⚠️ Failed to render icon', { ...PAGE_LOG_CONTEXT, icon: iconName, error });
                    // Fallback if icon rendering fails
                    iconItem.innerHTML = `
                        <div class="icon-preview">
                            <span>${iconName}</span>
                        </div>
                    `;
                }
            }

            iconItem.addEventListener('click', () => {
                selectIcon(iconName, 'tabler');
            });

            iconSelector.appendChild(iconItem);
            loadedCount++;
        }
        
        window.Logger?.info?.('✅ Tabler icons populated', { ...PAGE_LOG_CONTEXT, loaded: loadedCount, total: tablerIcons.length });
    }

    /**
     * Populate Bootstrap Icons selector
     */
    function populateBootstrapIcons() {
        const iconSelector = document.getElementById('watchListBootstrapIconSelector');
        
        if (!iconSelector) {
            window.Logger?.warn?.('⚠️ watchListBootstrapIconSelector not found', PAGE_LOG_CONTEXT);
            return;
        }

        // Popular Bootstrap Icons for watch lists (colored versions)
        const bootstrapIcons = [
            '', 
            // Colored icons - using Bootstrap Icons with fill colors
            { class: 'bi-graph-up', color: '#26baac' },
            { class: 'bi-eye', color: '#0056b3' },
            { class: 'bi-star-fill', color: '#ffc107' },
            { class: 'bi-heart-fill', color: '#dc3545' },
            { class: 'bi-fire', color: '#fc5a06' },
            { class: 'bi-coin', color: '#ffc107' },
            { class: 'bi-list-ul', color: '#6c757d' },
            { class: 'bi-table', color: '#28a745' },
            { class: 'bi-grid-3x3', color: '#17a2b8' },
            { class: 'bi-bookmark-fill', color: '#6f42c1' },
            { class: 'bi-tag-fill', color: '#20c997' },
            { class: 'bi-tags-fill', color: '#20c997' },
            { class: 'bi-pie-chart-fill', color: '#fd7e14' },
            { class: 'bi-activity', color: '#28a745' },
            { class: 'bi-wallet2', color: '#0056b3' },
            { class: 'bi-cash-stack', color: '#28a745' },
            { class: 'bi-calendar-event', color: '#17a2b8' },
            { class: 'bi-clock-history', color: '#6c757d' },
            { class: 'bi-pencil-fill', color: '#0056b3' },
            { class: 'bi-trash-fill', color: '#dc3545' },
            { class: 'bi-plus-circle-fill', color: '#28a745' },
            { class: 'bi-check-circle-fill', color: '#28a745' },
            { class: 'bi-x-circle-fill', color: '#dc3545' },
            { class: 'bi-search', color: '#6c757d' },
            { class: 'bi-funnel-fill', color: '#6f42c1' },
            { class: 'bi-gear-fill', color: '#6c757d' },
            { class: 'bi-download', color: '#0056b3' },
            { class: 'bi-upload', color: '#28a745' },
            { class: 'bi-arrow-clockwise', color: '#17a2b8' },
            { class: 'bi-archive-fill', color: '#6c757d' },
            { class: 'bi-copy', color: '#0056b3' },
            { class: 'bi-link-45deg', color: '#26baac' },
            { class: 'bi-info-circle-fill', color: '#17a2b8' },
            { class: 'bi-exclamation-triangle-fill', color: '#ffc107' },
            { class: 'bi-bar-chart-fill', color: '#26baac' },
            { class: 'bi-graph-up-arrow', color: '#28a745' },
            { class: 'bi-trending-up', color: '#28a745' },
            { class: 'bi-bullseye', color: '#dc3545' },
            { class: 'bi-lightning-fill', color: '#ffc107' },
            { class: 'bi-gem', color: '#6f42c1' },
            { class: 'bi-trophy-fill', color: '#ffc107' },
            { class: 'bi-award-fill', color: '#ffc107' },
            { class: 'bi-briefcase-fill', color: '#0056b3' },
            { class: 'bi-building', color: '#6c757d' }
        ];

        iconSelector.innerHTML = '';
        
        window.Logger?.info?.('🎨 Populating Bootstrap icons', { ...PAGE_LOG_CONTEXT, count: bootstrapIcons.length });

        let loadedCount = 0;
        for (const iconData of bootstrapIcons) {
            const iconItem = document.createElement('div');
            iconItem.className = 'icon-selector-item';
            
            let iconClass = '';
            let iconColor = '';
            
            if (typeof iconData === 'string') {
                iconClass = iconData;
            } else {
                iconClass = iconData.class;
                iconColor = iconData.color;
            }
            
            iconItem.dataset.icon = iconClass;
            iconItem.dataset.library = 'bootstrap';

            if (iconClass === '') {
                // No icon option
                iconItem.innerHTML = `
                    <div class="icon-preview no-icon">
                        <span>ללא</span>
                    </div>
                `;
            } else {
                // Render Bootstrap icon with color
                const colorStyle = iconColor ? `style="font-size: 24px; color: ${iconColor};"` : 'style="font-size: 24px;"';
                iconItem.innerHTML = `
                    <div class="icon-preview">
                        <i class="${iconClass}" ${colorStyle}></i>
                    </div>
                `;
            }

            iconItem.addEventListener('click', () => {
                selectIcon(iconClass, 'bootstrap');
            });

            iconSelector.appendChild(iconItem);
            loadedCount++;
        }
        
        window.Logger?.info?.('✅ Bootstrap icons populated', { ...PAGE_LOG_CONTEXT, loaded: loadedCount, total: bootstrapIcons.length });
    }

    /**
     * Select icon and update UI
     * @param {string} iconName - Icon name/class
     * @param {string} library - Icon library ('tabler' or 'bootstrap')
     */
    async function selectIcon(iconName, library) {
        const iconInput = document.getElementById('watchListIcon');
        const libraryInput = document.getElementById('watchListIconLibrary');
        const preview = document.getElementById('watchListSelectedIconPreview');
        const trigger = document.getElementById('watchListIconSelectorTrigger');
        
        if (!iconInput || !libraryInput || !preview) {
            return;
        }

        // Update hidden inputs
        iconInput.value = iconName;
        libraryInput.value = library;

        // Remove active class from all items in both selectors
        document.querySelectorAll('.icon-selector-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected item
        const selectedItem = document.querySelector(`[data-icon="${iconName}"][data-library="${library}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        // Update preview in trigger button
        if (iconName === '') {
            preview.innerHTML = '<span class="icon-preview-placeholder">ללא איקון</span>';
        } else if (library === 'bootstrap') {
            preview.innerHTML = `<i class="${iconName}" style="font-size: 20px;"></i>`;
        } else {
            // Tabler icon
            try {
                if (window.IconSystem) {
                    const iconHTML = await window.IconSystem.renderIcon('button', iconName, {
                        size: '20',
                        alt: iconName,
                        class: 'icon-preview-icon'
                    });
                    preview.innerHTML = iconHTML;
                } else {
                    preview.innerHTML = `<span>${iconName}</span>`;
                }
            } catch (error) {
                preview.innerHTML = `<span>${iconName}</span>`;
            }
        }

        // Don't close dropdown on icon selection - let user continue browsing
        // Dropdown will close when clicking outside (data-bs-auto-close="outside")
    }

    /**
     * Populate icon selector with available icons (wrapper for backward compatibility)
     * @async
     */
    async function populateIconSelector() {
        await populateTablerIcons();
        populateBootstrapIcons();
    }

    /**
     * Setup view mode radio buttons
     */
    function setupViewModeSelector() {
        const viewModeInput = document.getElementById('watchListViewMode');
        const radioButtons = document.querySelectorAll('input[name="watchListViewMode"]');
        
        if (!viewModeInput || !radioButtons.length) {
            return;
        }

        // Update hidden input when radio changes
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    viewModeInput.value = e.target.value;
                }
            });
        });

        // Initialize tooltips using Button System (unified tooltip system)
        if (window.advancedButtonSystem && typeof window.advancedButtonSystem.initializeTooltips === 'function') {
            // Use Button System to initialize tooltips - this ensures consistent tooltip handling
            window.advancedButtonSystem.initializeTooltips(document.body);
        } else if (window.bootstrap && window.bootstrap.Tooltip) {
            // Fallback to direct Bootstrap initialization if Button System not available
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltipTriggerList.forEach(tooltipTriggerEl => {
                new window.bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

    /**
     * Populate color palette with 8 entity colors
     */

    /**
     * Open watch list modal
     * @param {string} mode - Mode ('create' or 'edit')
     * @param {Object} data - List data (for edit mode)
     */
    async function openWatchListModal(mode, data) {
        currentMode = mode || 'create';
        currentListId = data?.id || null;

        const modal = document.getElementById('watchListModal');
        const titleEl = document.getElementById('watchListModalTitle');

        if (titleEl) {
            titleEl.textContent = currentMode === 'edit' ? 'עריכת רשימה' : 'רשימה חדשה';
        }

        // Open via ModalManagerV2 first
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
            await window.ModalManagerV2.showModal('watchListModal', currentMode, data).catch(error => {
                window.Logger?.error('Error showing watch list modal via ModalManagerV2', { error, modalId: 'watchListModal', page: 'watch-list-modal' });
                // Fallback to bootstrap if ModalManagerV2 fails
                if (bootstrap?.Modal && modal) {
                    const bsModal = new bootstrap.Modal(modal);
                    bsModal.show();
                }
            });
        } else if (bootstrap?.Modal && modal) {
            // Fallback to Bootstrap modal
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }

        // Wait for modal to be fully shown, then populate form and initialize selectors
        setTimeout(async () => {
            // Ensure selectors are populated
            await populateIconSelector();
            populateColorPalette();
            setupViewModeSelector();
            
            // Populate form AFTER modal is shown and ModalManagerV2.populateForm has run
            if (currentMode === 'edit' && data) {
                await populateForm(data);
            } else {
                await resetForm();
            }
        }, 400);
    }

    /**
     * Close watch list modal
     */
    function closeWatchListModal() {
        const modal = document.getElementById('watchListModal');
        if (!modal) {
            return;
        }

        // Try ModalManagerV2 first
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
            window.ModalManagerV2.hideModal('watchListModal');
        } else if (bootstrap?.Modal) {
            // Fallback to Bootstrap modal
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            } else {
                // If no instance exists, create one and hide
                const newModal = bootstrap.Modal.getOrCreateInstance(modal, { backdrop: false });
                if (newModal) {
                    newModal.hide();
                }
            }
        }
        
        resetForm();
    }

    // ===== FORM MANAGEMENT =====

    /**
     * Populate form with data
     * @param {Object} data - List data
     */
    async function populateForm(data) {
        if (!window.DataCollectionService) {
            window.Logger?.warn?.('⚠️ DataCollectionService not available', PAGE_LOG_CONTEXT);
            return;
        }

        // Populate name
        const nameInput = document.getElementById('watchListName');
        if (nameInput) {
            nameInput.value = data.name || '';
        }

        // Populate icon selection
        const selectedIcon = data.icon || '';
        const selectedLibrary = data.icon_library || 'tabler';
        await selectIcon(selectedIcon, selectedLibrary);


        // Populate view mode
        const viewModeInput = document.getElementById('watchListViewMode');
        const viewMode = data.view_mode || 'table';
        if (viewModeInput) {
            viewModeInput.value = viewMode;
        }
        // Update radio button
        const radioButton = document.querySelector(`input[name="watchListViewMode"][value="${viewMode}"]`);
        if (radioButton) {
            radioButton.checked = true;
        }
    }

    /**
     * Validate form
     * @returns {boolean} True if valid
     */
    function validateForm() {
        const nameInput = document.getElementById('watchListName');
        if (!nameInput || !nameInput.value.trim()) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'שם הרשימה הוא שדה חובה', 5000);
            }
            return false;
        }

        return true;
    }

    /**
     * Reset form
     * @async
     */
    async function resetForm() {
        const form = document.getElementById('watchListForm');
        if (form) {
            form.reset();
        }

        // Reset icon selection
        await selectIcon('', 'tabler');

        // Reset color to default

        // Reset view mode
        const viewModeInputReset = document.getElementById('watchListViewMode');
        const defaultRadioReset = document.querySelector('input[name="viewMode"][value="table"]');
        if (viewModeInputReset) viewModeInputReset.value = 'table';
        if (defaultRadioReset) defaultRadioReset.checked = true;

        currentMode = 'create';
        currentListId = null;
    }

    // ===== DATA HANDLING =====

    /**
     * Save watch list
     * @async
     */
    async function saveWatchList() {
        if (!validateForm()) {
            return;
        }

        try {
            if (!window.DataCollectionService) {
                window.Logger?.warn?.('⚠️ DataCollectionService not available', PAGE_LOG_CONTEXT);
                return;
            }

            // Collect form data
            const formData = window.DataCollectionService.collectFormData({
                name: { id: 'watchListName', type: 'text' },
                icon: { id: 'watchListIcon', type: 'text' },
                icon_library: { id: 'watchListIconLibrary', type: 'text' },
                view_mode: { id: 'watchListViewMode', type: 'text' }
            });

            let result;
            if (currentMode === 'edit' && currentListId) {
                // Update existing list
                if (window.WatchListsDataService?.updateWatchList) {
                    result = await window.WatchListsDataService.updateWatchList(currentListId, formData);
                }
            } else {
                // Create new list
                if (window.WatchListsDataService?.createWatchList) {
                    result = await window.WatchListsDataService.createWatchList(formData);
                }
            }

            // Handle response via CRUDResponseHandler
            if (result && window.CRUDResponseHandler?.handleResponse) {
                await window.CRUDResponseHandler.handleResponse(result, {
                    entityType: 'watch_list',
                    operation: currentMode === 'edit' ? 'update' : 'create',
                    modalId: 'watchListModal',
                    onSuccess: async () => {
                        // Close modal first
                        closeWatchListModal();
                        
                        // Small delay to ensure modal is closed
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        // Refresh parent page
                        if (window.WatchListsPage?.loadWatchLists) {
                            await window.WatchListsPage.loadWatchLists();
                        }
                        if (window.WatchListsPage?.renderSummaryStats) {
                            window.WatchListsPage.renderSummaryStats();
                        }
                    },
                    showNotification: true
                });
            } else if (result && result.success) {
                // Fallback if CRUDResponseHandler is not available
                closeWatchListModal();
                if (window.WatchListsPage?.loadWatchLists) {
                    await window.WatchListsPage.loadWatchLists();
                }
                if (window.WatchListsPage?.renderSummaryStats) {
                    window.WatchListsPage.renderSummaryStats();
                }
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error saving watch list', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        }
    }


    // ===== INITIALIZATION =====

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWatchListModal);
    } else {
        initializeWatchListModal();
    }

    // ===== GLOBAL EXPORTS =====

    window.WatchListModal = {
        init: initializeWatchListModal,
        open: openWatchListModal,
        close: closeWatchListModal,
        populateForm,
        validateForm,
        resetForm,
        save: saveWatchList,
        populateIconSelector: populateIconSelector
    };

    // Individual function exports
    window.openWatchListModal = openWatchListModal;
    window.closeWatchListModal = closeWatchListModal;
    window.saveWatchList = saveWatchList;

    window.Logger?.info?.('✅ WatchListModal loaded successfully', PAGE_LOG_CONTEXT);

    // Initialize immediately when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                initializeWatchListModal();
            }, 500);
        });
    } else {
        // DOM already loaded
        setTimeout(() => {
            initializeWatchListModal();
        }, 500);
    }

})();





