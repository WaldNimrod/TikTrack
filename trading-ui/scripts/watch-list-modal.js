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
    function initializeWatchListModal() {
        // Modal is handled by ModalManagerV2
        // This function is a placeholder for future customizations

        // Setup color picker sync
        const colorInput = document.getElementById('watchListColor');
        const colorHexInput = document.getElementById('watchListColorHex');
        
        if (colorInput && colorHexInput) {
            colorInput.addEventListener('input', handleColorChange);
            colorHexInput.addEventListener('input', (e) => {
                const hex = e.target.value;
                if (/^#[0-9A-F]{6}$/i.test(hex)) {
                    colorInput.value = hex;
                }
            });
        }

        // Setup default values
        if (typeof window.DefaultValueSetter?.setDefaults === 'function') {
            window.DefaultValueSetter.setDefaults('watchListForm', {
                watchListIcon: { preference: 'watch-list-default-icon' },
                watchListColorHex: { preference: 'watch-list-default-color', defaultValue: '#26baac' },
                watchListViewMode: { preference: 'watch-list-default-view-mode', defaultValue: 'table' }
            });
        }

        window.Logger?.debug?.('✅ Watch List Modal initialized', PAGE_LOG_CONTEXT);
    }

    /**
     * Open watch list modal
     * @param {string} mode - Mode ('create' or 'edit')
     * @param {Object} data - List data (for edit mode)
     */
    function openWatchListModal(mode, data) {
        currentMode = mode || 'create';
        currentListId = data?.id || null;

        const modal = document.getElementById('watchListModal');
        const titleEl = document.getElementById('watchListModalTitle');

        if (titleEl) {
            titleEl.textContent = currentMode === 'edit' ? 'עריכת רשימה' : 'רשימה חדשה';
        }

        if (currentMode === 'edit' && data) {
            populateForm(data);
        } else {
            resetForm();
        }

        // Open via ModalManagerV2
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
            window.ModalManagerV2.showModal('watchListModal', currentMode, data).catch(error => {
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
    }

    /**
     * Close watch list modal
     */
    function closeWatchListModal() {
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
            window.ModalManagerV2.hideModal('watchListModal');
        } else if (bootstrap?.Modal) {
            const modal = document.getElementById('watchListModal');
            if (modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
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
    function populateForm(data) {
        if (!window.DataCollectionService) {
            window.Logger?.warn?.('⚠️ DataCollectionService not available', PAGE_LOG_CONTEXT);
            return;
        }

        window.DataCollectionService.populateForm('watchListForm', {
            watchListName: data.name || '',
            watchListIcon: data.icon || '',
            watchListColor: data.color_hex || '#26baac',
            watchListColorHex: data.color_hex || '#26baac',
            watchListViewMode: data.view_mode || 'table'
        });
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
     */
    function resetForm() {
        const form = document.getElementById('watchListForm');
        if (form) {
            form.reset();
        }

        // Reset color to default
        const colorInput = document.getElementById('watchListColor');
        const colorHexInput = document.getElementById('watchListColorHex');
        if (colorInput) colorInput.value = '#26baac';
        if (colorHexInput) colorHexInput.value = '#26baac';

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
                color_hex: { id: 'watchListColorHex', type: 'text' },
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
                    onSuccess: () => {
                        closeWatchListModal();
                        // Refresh parent page
                        if (window.WatchListsPage?.loadWatchLists) {
                            window.WatchListsPage.loadWatchLists();
                        }
                        if (window.WatchListsPage?.renderSummaryStats) {
                            window.WatchListsPage.renderSummaryStats();
                        }
                    },
                    showNotification: true
                });
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error saving watch list', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        }
    }

    /**
     * Handle color change
     * @param {Event} event - Input event
     */
    function handleColorChange(event) {
        const colorInput = event.target;
        const colorHexInput = document.getElementById('watchListColorHex');
        if (colorHexInput) {
            colorHexInput.value = colorInput.value;
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
        save: saveWatchList
    };

    // Individual function exports
    window.openWatchListModal = openWatchListModal;
    window.closeWatchListModal = closeWatchListModal;
    window.saveWatchList = saveWatchList;

    window.Logger?.info?.('✅ WatchListModal loaded successfully', PAGE_LOG_CONTEXT);

})();





