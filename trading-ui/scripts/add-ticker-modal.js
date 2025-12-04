/**
 * Add Ticker Modal - TikTrack
 * ===========================
 * 
 * מודל הוספת טיקר לרשימת צפייה
 * 
 * @file trading-ui/scripts/add-ticker-modal.js
 * @version 1.0.0
 * @created 26 בנובמבר 2025
 * @author TikTrack Development Team
 * 
 * ===== FUNCTION INDEX =====
 * 
 * MODAL MANAGEMENT (3)
 * - initializeAddTickerModal() - אתחול המודל
 * - openAddTickerModal(listId) - פתיחת מודל
 * - closeAddTickerModal() - סגירת מודל
 * 
 * TICKER SEARCH (3)
 * - searchTicker(query) - חיפוש טיקר
 * - selectTicker(tickerId) - בחירת טיקר
 * - renderSearchResults(results) - רינדור תוצאות חיפוש
 * 
 * FORM MANAGEMENT (2)
 * - validateForm() - בדיקת תקינות טופס
 * - resetForm() - איפוס טופס
 * 
 * DATA HANDLING (1)
 * - addTickerToList() - הוספת טיקר לרשימה
 * 
 * ==========================================
 */

(function() {
    'use strict';

    const PAGE_NAME = 'add-ticker-modal';
    const PAGE_LOG_CONTEXT = { page: PAGE_NAME };

    let currentListId = null;
    let selectedTickerId = null;
    let searchResults = [];

    // ===== MODAL MANAGEMENT =====

    /**
     * Initialize Add Ticker Modal
     */
    function initializeAddTickerModal() {
        // Setup ticker search
        const searchInput = document.getElementById('tickerSearch');
        const searchBtn = document.getElementById('searchTickerBtn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    searchTicker(query);
                } else {
                    clearSearchResults();
                }
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = e.target.value.trim();
                    if (query.length >= 2) {
                        searchTicker(query);
                    }
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput?.value.trim() || '';
                if (query.length >= 2) {
                    searchTicker(query);
                }
            });
        }

        // Setup external symbol uppercase
        const externalSymbolInput = document.getElementById('externalSymbol');
        if (externalSymbolInput) {
            externalSymbolInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }

        window.Logger?.debug?.('✅ Add Ticker Modal initialized', PAGE_LOG_CONTEXT);
    }

    /**
     * Open add ticker modal
     * @param {number} listId - Watch list ID
     */
    function openAddTickerModal(listId) {
        currentListId = listId;

        // Update modal title
        const titleEl = document.querySelector('#addTickerModal .modal-title');
        if (titleEl && listId) {
            // Get list name (would need to fetch or pass)
            titleEl.textContent = `הוסף טיקר לרשימה: ${listId}`;
        }

        resetForm();

        // Open via ModalManagerV2
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.showModal === 'function') {
            window.ModalManagerV2.showModal('addTickerModal', 'add', { listId: listId }).catch(error => {
                window.Logger?.error('Error showing add ticker modal via ModalManagerV2', { error, modalId: 'addTickerModal', page: 'add-ticker-modal' });
                // Fallback to bootstrap if ModalManagerV2 fails
                if (bootstrap?.Modal) {
                    const modal = document.getElementById('addTickerModal');
                    if (modal) {
                        const bsModal = new bootstrap.Modal(modal);
                        bsModal.show();
                    }
                }
            });
        } else if (bootstrap?.Modal) {
            const modal = document.getElementById('addTickerModal');
            if (modal) {
                const bsModal = new bootstrap.Modal(modal);
                bsModal.show();
            }
        }
    }

    /**
     * Close add ticker modal
     */
    function closeAddTickerModal() {
        if (window.ModalManagerV2 && typeof window.ModalManagerV2.hideModal === 'function') {
            window.ModalManagerV2.hideModal('addTickerModal');
        } else if (bootstrap?.Modal) {
            const modal = document.getElementById('addTickerModal');
            if (modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            }
        }
        resetForm();
    }

    // ===== TICKER SEARCH =====

    /**
     * Search ticker (mockup)
     * @param {string} query - Search query
     * @async
     */
    async function searchTicker(query) {
        try {
            // Mockup search results
            const mockResults = [
                { id: 5, symbol: 'AAPL', name: 'Apple Inc.', type: 'Stock', currency: 'USD' },
                { id: 12, symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Stock', currency: 'USD' },
                { id: 8, symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Stock', currency: 'USD' }
            ].filter(t => 
                t.symbol.toLowerCase().includes(query.toLowerCase()) ||
                t.name.toLowerCase().includes(query.toLowerCase())
            );

            searchResults = mockResults;
            renderSearchResults(mockResults);

            window.Logger?.debug?.('🔍 Ticker search completed (mockup)', { ...PAGE_LOG_CONTEXT, query, count: mockResults.length });
        } catch (error) {
            window.Logger?.error?.('❌ Error searching ticker', { ...PAGE_LOG_CONTEXT, query, error: error?.message || error });
        }
    }

    /**
     * Select ticker
     * @param {number} tickerId - Ticker ID
     */
    function selectTicker(tickerId) {
        selectedTickerId = tickerId;
        const ticker = searchResults.find(t => t.id === tickerId);
        
        if (ticker) {
            // Hide search results
            clearSearchResults();

            // Show selected ticker info
            if (typeof window.showNotification === 'function') {
                window.showNotification('מידע', 'info', `טיקר ${ticker.symbol} נבחר`, 3000);
            }

            window.Logger?.debug?.('✅ Ticker selected', { ...PAGE_LOG_CONTEXT, tickerId, symbol: ticker.symbol });
        }
    }

    /**
     * Render search results
     * @param {Array} results - Search results
     */
    function renderSearchResults(results) {
        const resultsContainer = document.getElementById('tickerSearchResults');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.textContent = '';
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'alert alert-info';
            noResultsDiv.textContent = 'לא נמצאו תוצאות';
            resultsContainer.appendChild(noResultsDiv);
            return;
        }

        // Build results HTML and insert using tempDiv
        const resultsHTML = results.map(ticker => `
            <div class="search-result-item" data-ticker-id="${ticker.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${ticker.symbol}</strong> - ${ticker.name}
                        <br>
                        <small class="text-muted">${ticker.type} • ${ticker.currency}</small>
                    </div>
                    <button type="button" 
                            class="btn btn-sm btn-primary" 
                            data-onclick="window.AddTickerModal?.selectTicker(${ticker.id})">
                        הוסף
                    </button>
                </div>
            </div>
        `).join('');
        resultsContainer.textContent = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(resultsHTML, 'text/html');
        doc.body.childNodes.forEach(node => {
          resultsContainer.appendChild(node.cloneNode(true));
        });

        // Add click handlers
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const tickerId = parseInt(item.getAttribute('data-ticker-id'));
                    selectTicker(tickerId);
                }
            });
        });
    }

    /**
     * Clear search results
     */
    function clearSearchResults() {
        const resultsContainer = document.getElementById('tickerSearchResults');
        if (resultsContainer) {
            resultsContainer.textContent = '';
        }
        searchResults = [];
    }

    // ===== FORM MANAGEMENT =====

    /**
     * Validate form
     * @returns {boolean} True if valid
     */
    function validateForm() {
        // Check if ticker selected OR external symbol provided
        const externalSymbol = document.getElementById('externalSymbol')?.value.trim();
        
        if (!selectedTickerId && !externalSymbol) {
            if (typeof window.showNotification === 'function') {
                window.showNotification('שגיאה', 'error', 'יש לבחור טיקר מהמערכת או להזין טיקר חיצוני', 5000);
            }
            return false;
        }

        return true;
    }

    /**
     * Reset form
     */
    function resetForm() {
        const form = document.getElementById('addTickerForm');
        if (form) {
            form.reset();
        }

        clearSearchResults();
        selectedTickerId = null;
        currentListId = null;
    }

    // ===== DATA HANDLING =====

    /**
     * Add ticker to list
     * @async
     */
    async function addTickerToList() {
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
                ticker_id: { id: 'selectedTickerId', type: 'int', default: selectedTickerId },
                external_symbol: { id: 'externalSymbol', type: 'text' },
                external_name: { id: 'externalName', type: 'text' },
                flag_color: { id: 'itemFlagColor', type: 'text' },
                notes: { id: 'itemNotes', type: 'text' }
            });

            // Add via data service
            if (window.WatchListsDataService?.addTickerToList && currentListId) {
                const result = await window.WatchListsDataService.addTickerToList(currentListId, formData);

                // Handle response via CRUDResponseHandler
                if (window.CRUDResponseHandler?.handleResponse) {
                    await window.CRUDResponseHandler.handleResponse(result, {
                        entityType: 'watch_list_item',
                        operation: 'create',
                        onSuccess: () => {
                            closeAddTickerModal();
                            // Refresh parent page
                            if (window.WatchListsPage?.loadWatchListItems) {
                                window.WatchListsPage.loadWatchListItems(currentListId);
                            }
                            if (window.WatchListsPage?.renderSummaryStats) {
                                window.WatchListsPage.renderSummaryStats();
                            }
                        },
                        showNotification: true
                    });
                }
            }
        } catch (error) {
            window.Logger?.error?.('❌ Error adding ticker to list', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
        }
    }

    // ===== INITIALIZATION =====

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAddTickerModal);
    } else {
        initializeAddTickerModal();
    }

    // ===== GLOBAL EXPORTS =====

    window.AddTickerModal = {
        init: initializeAddTickerModal,
        open: openAddTickerModal,
        close: closeAddTickerModal,
        searchTicker,
        selectTicker,
        renderSearchResults,
        validateForm,
        resetForm,
        addTickerToList
    };

    // Individual function exports
    window.openAddTickerModal = openAddTickerModal;
    window.closeAddTickerModal = closeAddTickerModal;
    window.selectTicker = selectTicker;
    window.addTickerToList = addTickerToList;

    window.Logger?.info?.('✅ AddTickerModal loaded successfully', PAGE_LOG_CONTEXT);

})();





