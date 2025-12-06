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
    let allTickersCache = null; // Cache for all tickers to avoid repeated API calls

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
                if (query.length >= 1) {
                    searchTicker(query);
                } else {
                    clearSearchResults();
                }
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = e.target.value.trim();
                    if (query.length >= 1) {
                        searchTicker(query);
                    }
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput?.value.trim() || '';
                if (query.length >= 1) {
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

        // Setup flag color palette
        setupFlagColorPalette();

        window.Logger?.debug?.('✅ Add Ticker Modal initialized', PAGE_LOG_CONTEXT);
    }

    /**
     * Setup flag color palette
     */
    function setupFlagColorPalette() {
        // Wait for modal to be rendered
        setTimeout(() => {
            const flagButtons = document.querySelectorAll('.flag-color-btn-add-modal');
            const clearBtn = document.getElementById('clearFlagColorBtn');
            const flagInput = document.getElementById('itemFlagColor');

            flagButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const color = btn.getAttribute('data-color');
                    if (color && flagInput) {
                        flagInput.value = color;
                        
                        // Update active state
                        flagButtons.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        
                        // Add checkmark style
                        btn.style.borderColor = '#212529';
                        btn.style.boxShadow = '0 0 0 2px #212529';
                        
                        window.Logger?.debug?.('✅ Flag color selected', { ...PAGE_LOG_CONTEXT, color });
                    }
                });
            });

            if (clearBtn && flagInput) {
                clearBtn.addEventListener('click', () => {
                    flagInput.value = '';
                    flagButtons.forEach(b => {
                        b.classList.remove('active');
                        b.style.borderColor = 'transparent';
                        b.style.boxShadow = 'none';
                    });
                    window.Logger?.debug?.('✅ Flag color cleared', PAGE_LOG_CONTEXT);
                });
            }
        }, 100);
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
     * Load all tickers from the system
     * @async
     * @returns {Promise<Array>} Array of all tickers
     */
    async function loadAllTickers() {
        // Return cached tickers if available
        if (allTickersCache) {
            return allTickersCache;
        }

        try {
            const baseUrl = window.API_BASE_URL || (window.location?.protocol === 'file:' ? 'http://127.0.0.1:8080' : '');
            const separator = baseUrl.endsWith('/') ? '' : '/';
            const url = `${baseUrl}${separator}api/tickers/?_ts=${Date.now()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.Logger?.warn?.('⚠️ Authentication required for ticker search', PAGE_LOG_CONTEXT);
                    return [];
                }
                throw new Error(`Failed to load tickers: ${response.status}`);
            }

            const payload = await response.json();
            const tickers = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);

            // Cache the results
            allTickersCache = tickers;

            window.Logger?.debug?.('✅ All tickers loaded', { ...PAGE_LOG_CONTEXT, count: tickers.length });
            return tickers;
        } catch (error) {
            window.Logger?.error?.('❌ Error loading all tickers', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
            return [];
        }
    }

    /**
     * Search ticker - searches all tickers in the system from first character
     * @param {string} query - Search query
     * @async
     */
    async function searchTicker(query) {
        if (!query || query.trim().length === 0) {
            clearSearchResults();
            return;
        }

        const searchQuery = query.trim();
        const resultsContainer = document.getElementById('tickerSearchResults');
        
        // Show loading indicator
        if (resultsContainer) {
            resultsContainer.innerHTML = '<div class="text-center text-muted py-2"><i class="bi bi-hourglass-split me-2"></i>טוען...</div>';
        }

        try {
            // Load all tickers (cached after first load)
            const allTickers = await loadAllTickers();

            // Filter from first character (startsWith)
            const filtered = allTickers.filter(ticker => {
                const symbol = (ticker.symbol || '').toUpperCase();
                const name = (ticker.name || '').toUpperCase();
                const queryUpper = searchQuery.toUpperCase();

                return symbol.startsWith(queryUpper) || name.startsWith(queryUpper);
            });

            // Limit results to 20 for performance
            const limitedResults = filtered.slice(0, 20);

            searchResults = limitedResults;
            renderSearchResults(limitedResults);

            window.Logger?.debug?.('🔍 Ticker search completed', { ...PAGE_LOG_CONTEXT, query: searchQuery, count: limitedResults.length, total: filtered.length });
        } catch (error) {
            window.Logger?.error?.('❌ Error searching ticker', { ...PAGE_LOG_CONTEXT, query: searchQuery, error: error?.message || error });
            
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="alert alert-warning">
                        <small>שגיאה בחיפוש טיקרים. אנא נסה שוב.</small>
                    </div>
                `;
            }
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
        const resultsHTML = results.map(ticker => {
            const symbol = ticker.symbol || ticker.ticker_symbol || 'N/A';
            const name = ticker.name || '';
            const type = ticker.type || '';
            const currency = ticker.currency || ticker.currency_code || '';
            const typeDisplay = type ? (type.charAt(0).toUpperCase() + type.slice(1)) : '';
            const currencyDisplay = currency || '';
            
            return `
                <div class="search-result-item" data-ticker-id="${ticker.id}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${symbol}</strong>${name ? ` - ${name}` : ''}
                            ${(typeDisplay || currencyDisplay) ? `<br><small class="text-muted">${typeDisplay}${typeDisplay && currencyDisplay ? ' • ' : ''}${currencyDisplay}</small>` : ''}
                        </div>
                        <button type="button" 
                                class="btn btn-sm btn-primary" 
                                data-onclick="window.AddTickerModal?.selectTicker(${ticker.id})">
                            הוסף
                        </button>
                    </div>
                </div>
            `;
        }).join('');
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
        // Don't clear cache - keep it for faster subsequent searches
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
                flag_color: { id: 'itemFlagColor', type: 'text' }
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





