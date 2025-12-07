/**
 * Watch Lists Modal Configuration
 * קונפיגורציה למודלי רשימות צפייה
 * 
 * @file watch-lists-config.js
 * @version 1.0.0
 * @lastUpdated December 6, 2025
 */

// קונפיגורציה למודל רשימת צפייה (Add/Edit)
const watchListModalConfig = {
    id: 'watchListModal',
    entityType: 'watch_list',
    title: {
        add: 'רשימה חדשה',
        edit: 'עריכת רשימה'
    },
    size: 'md',
    headerType: 'dynamic',
    fields: [
        {
            type: 'text',
            id: 'watchListName',
            label: 'שם הרשימה',
            required: true,
            maxLength: 100,
            placeholder: 'לדוגמה: מניות טכנולוגיה',
            rowClass: 'row',
            colClass: 'col-12'
        },
        {
            type: 'custom',
            id: 'watchListIconSelector',
            html: `
                <div class="mb-3">
                    <label class="form-label">איקון</label>
                    <div class="icon-selector-wrapper">
                        <button type="button" 
                                class="btn btn-outline-secondary icon-selector-trigger" 
                                id="watchListIconSelectorTrigger"
                                data-bs-toggle="dropdown"
                                data-bs-auto-close="outside"
                                aria-expanded="false">
                            <span id="watchListSelectedIconPreview" class="selected-icon-preview">
                                <span class="icon-preview-placeholder">ללא איקון</span>
                            </span>
                            <i class="bi bi-chevron-down ms-2"></i>
                        </button>
                        <div class="dropdown-menu icon-selector-dropdown" id="watchListIconSelectorDropdown">
                            <ul class="nav nav-tabs icon-library-tabs" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" 
                                            id="watchListTablerTab" 
                                            data-bs-toggle="tab" 
                                            data-bs-target="#watchListTablerIcons" 
                                            type="button" 
                                            role="tab"
                                            onclick="event.stopPropagation();">
                                        Tabler
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" 
                                            id="watchListBootstrapTab" 
                                            data-bs-toggle="tab" 
                                            data-bs-target="#watchListBootstrapIcons" 
                                            type="button" 
                                            role="tab"
                                            onclick="event.stopPropagation();">
                                        Bootstrap
                                    </button>
                                </li>
                            </ul>
                            <div class="tab-content icon-library-content">
                                <div class="tab-pane fade show active" 
                                     id="watchListTablerIcons" 
                                     role="tabpanel">
                                    <div id="watchListIconSelector" class="icon-selector-grid">
                                        <!-- Tabler Icons will be populated by JavaScript -->
                                    </div>
                                </div>
                                <div class="tab-pane fade" 
                                     id="watchListBootstrapIcons" 
                                     role="tabpanel">
                                    <div id="watchListBootstrapIconSelector" class="icon-selector-grid">
                                        <!-- Bootstrap Icons will be populated by JavaScript -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <input type="hidden" id="watchListIcon" value="">
                    <input type="hidden" id="watchListIconLibrary" value="tabler">
                    <small class="form-text text-muted">איקון שיוצג בכרטיס הרשימה</small>
                </div>
            `,
            rowClass: 'row',
            colClass: 'col-md-6'
        },
        {
            type: 'custom',
            id: 'watchListViewModeSelector',
            html: `
                <div class="mb-3">
                    <label class="form-label">תצוגה ברירת מחדל</label>
                    <div class="view-mode-selector">
                        <div class="btn-group view-mode-radio" role="group" aria-label="View mode selection">
                            <input type="radio" class="btn-check" name="watchListViewMode" id="watchListViewModeTable" value="table" checked>
                            <label class="btn btn-outline-primary" for="watchListViewModeTable" data-bs-toggle="tooltip" data-bs-placement="top" title="טבלה">
                                <i class="bi bi-table"></i>
                            </label>
                            <input type="radio" class="btn-check" name="watchListViewMode" id="watchListViewModeCards" value="cards">
                            <label class="btn btn-outline-primary" for="watchListViewModeCards" data-bs-toggle="tooltip" data-bs-placement="top" title="כרטיסים">
                                <i class="bi bi-grid-3x3"></i>
                            </label>
                            <input type="radio" class="btn-check" name="watchListViewMode" id="watchListViewModeCompact" value="compact">
                            <label class="btn btn-outline-primary" for="watchListViewModeCompact" data-bs-toggle="tooltip" data-bs-placement="top" title="קומפקטי">
                                <i class="bi bi-list-ul"></i>
                            </label>
                        </div>
                    </div>
                    <input type="hidden" id="watchListViewMode" value="table">
                    <small class="form-text text-muted">תצוגה שתוצג בעת פתיחת הרשימה</small>
                </div>
            `,
            rowClass: 'row',
            colClass: 'col-md-6'
        }
    ],
    validation: {
        watchListName: {
            required: true,
            minLength: 2,
            maxLength: 100
        }
    },
    onSave: 'saveWatchList'
};

// קונפיגורציה למודל הוספת טיקר
const addTickerModalConfig = {
    id: 'addTickerModal',
    entityType: 'watch_list_item',
    title: {
        add: 'הוסף טיקר לרשימה'
    },
    size: 'lg',
    headerType: 'dynamic',
    fields: [
        {
            type: 'custom',
            id: 'tickerSearchSection',
            html: `
                <div class="mb-3">
                    <div class="d-flex align-items-center gap-3 mb-2">
                        <label for="tickerSearch" class="form-label fw-bold mb-0">חיפוש טיקר מהמערכת</label>
                    </div>
                    <div class="d-flex align-items-end gap-2 mb-2">
                        <div style="max-width: 200px; flex: 1;">
                            <input type="text" 
                                   class="form-control" 
                                   id="tickerSearch" 
                                   placeholder="הקלד symbol או שם..."
                                   style="max-width: 200px;">
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <label class="form-label small mb-0 me-1">דגל:</label>
                        <div class="d-flex gap-1 align-items-center flex-wrap" id="flagColorPaletteContainer" style="flex: 1;">
                            <button type="button" class="flag-color-btn-add-modal" 
                                    data-color="#26baac" 
                                    style="background-color: #26baac; width: 20px; height: 20px; border: 2px solid transparent; border-radius: 3px; cursor: pointer; transition: all 0.2s;"
                                    title="Trade">
                            </button>
                            <button type="button" class="flag-color-btn-add-modal" 
                                    data-color="#0056b3" 
                                    style="background-color: #0056b3; width: 20px; height: 20px; border: 2px solid transparent; border-radius: 3px; cursor: pointer; transition: all 0.2s;"
                                    title="Trade Plan">
                            </button>
                            <button type="button" class="flag-color-btn-add-modal" 
                                    data-color="#28a745" 
                                    style="background-color: #28a745; width: 20px; height: 20px; border: 2px solid transparent; border-radius: 3px; cursor: pointer; transition: all 0.2s;"
                                    title="Account">
                            </button>
                            <button type="button" class="flag-color-btn-add-modal" 
                                    data-color="#20c997" 
                                    style="background-color: #20c997; width: 20px; height: 20px; border: 2px solid transparent; border-radius: 3px; cursor: pointer; transition: all 0.2s;"
                                    title="Cash Flow">
                            </button>
                            <button type="button" class="flag-color-btn-add-modal" 
                                    data-color="#dc3545" 
                                    style="background-color: #dc3545; width: 20px; height: 20px; border: 2px solid transparent; border-radius: 3px; cursor: pointer; transition: all 0.2s;"
                                    title="Ticker">
                            </button>
                            <button type="button" class="flag-color-btn-add-modal" 
                                    data-color="#fc5a06" 
                                    style="background-color: #fc5a06; width: 20px; height: 20px; border: 2px solid transparent; border-radius: 3px; cursor: pointer; transition: all 0.2s;"
                                    title="Alert">
                            </button>
                            <button type="button" class="flag-color-btn-add-modal" 
                                    data-color="#6f42c1" 
                                    style="background-color: #6f42c1; width: 20px; height: 20px; border: 2px solid transparent; border-radius: 3px; cursor: pointer; transition: all 0.2s;"
                                    title="Note">
                            </button>
                            <button type="button" class="flag-color-btn-add-modal" 
                                    data-color="#17a2b8" 
                                    style="background-color: #17a2b8; width: 20px; height: 20px; border: 2px solid transparent; border-radius: 3px; cursor: pointer; transition: all 0.2s;"
                                    title="Execution">
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary p-1" 
                                    id="clearFlagColorBtn"
                                    style="font-size: 0.7rem; padding: 0.1rem 0.3rem !important; min-width: 20px; height: 20px;"
                                    title="הסר דגל">
                                <i class="bi bi-x"></i>
                            </button>
                            <button type="button" 
                                    class="btn btn-sm btn-outline-primary ms-auto"
                                    data-onclick="if(window.ModalManagerV2){window.ModalManagerV2.showModal('tickersModal','add');}">
                                <i class="bi bi-plus-circle"></i> הוסף טיקר
                            </button>
                        </div>
                        <input type="hidden" id="itemFlagColor" value="">
                    </div>
                    <div class="mb-2">
                        <small class="text-muted">לא נמצא? הוסף למערכת</small>
                    </div>
                    <div id="tickerSearchResults" class="mt-2">
                        <!-- Search results will appear here -->
                    </div>
                </div>
            `,
            rowClass: 'row',
            colClass: 'col-12'
        },
    ],
    validation: {
        // Validation will be handled by custom logic
    },
    onSave: 'addTickerToList'
};

// יצירת המודלים אם ModalManagerV2 זמין - Deferred initialization
function initializeWatchListModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(watchListModalConfig);
            window.Logger?.info?.('✅ Watch List modal created successfully');
            return true;
        } catch (error) {
            window.Logger?.error?.('❌ Error creating Watch List modal:', error);
            return false;
        }
    }
    return false;
}

function initializeAddTickerModal() {
    if (window.ModalManagerV2 && typeof window.ModalManagerV2.createCRUDModal === 'function') {
        try {
            window.ModalManagerV2.createCRUDModal(addTickerModalConfig);
            window.Logger?.info?.('✅ Add Ticker modal created successfully');
            return true;
        } catch (error) {
            window.Logger?.error?.('❌ Error creating Add Ticker modal:', error);
            return false;
        }
    }
    return false;
}

// Helper function to wait for ModalManagerV2
function waitForModalManager() {
    let attempts = 0;
    const maxAttempts = 50; // 10 seconds total
    const interval = 200; // 200ms between attempts
    
    const checkInterval = setInterval(() => {
        attempts++;
        if (window.ModalManagerV2) {
            window.Logger?.info?.(`✅ ModalManagerV2 available after ${attempts} attempts, initializing Watch Lists modals...`);
            clearInterval(checkInterval);
            if (initializeWatchListModal()) {
                window.Logger?.info?.('✅ Watch List modal initialized successfully');
            } else {
                window.Logger?.warn?.('⚠️ Failed to initialize Watch List modal');
            }
            if (initializeAddTickerModal()) {
                window.Logger?.info?.('✅ Add Ticker modal initialized successfully');
            } else {
                window.Logger?.warn?.('⚠️ Failed to initialize Add Ticker modal');
            }
        } else if (attempts >= maxAttempts) {
            window.Logger?.warn?.(`⚠️ ModalManagerV2 not available after ${maxAttempts} attempts (${maxAttempts * interval / 1000}s)`);
            clearInterval(checkInterval);
        }
    }, interval);
}

// Wait for DOMContentLoaded to ensure all dependencies are loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Try immediately if ModalManagerV2 is available
        if (window.ModalManagerV2) {
            window.Logger?.info?.('✅ ModalManagerV2 available on DOMContentLoaded, initializing Watch Lists modals...');
            if (initializeWatchListModal()) {
                window.Logger?.info?.('✅ Watch List modal initialized successfully');
            } else {
                window.Logger?.warn?.('⚠️ Failed to initialize Watch List modal');
                waitForModalManager();
            }
            if (initializeAddTickerModal()) {
                window.Logger?.info?.('✅ Add Ticker modal initialized successfully');
            } else {
                window.Logger?.warn?.('⚠️ Failed to initialize Add Ticker modal');
                waitForModalManager();
            }
        } else {
            window.Logger?.info?.('⚠️ ModalManagerV2 not yet available on DOMContentLoaded, waiting...');
            waitForModalManager();
        }
    });
} else {
    // DOM already loaded - try immediately
    if (window.ModalManagerV2) {
        window.Logger?.info?.('✅ ModalManagerV2 available, initializing Watch Lists modals...');
        if (initializeWatchListModal()) {
            window.Logger?.info?.('✅ Watch List modal initialized successfully');
        } else {
            window.Logger?.warn?.('⚠️ Failed to initialize Watch List modal');
            waitForModalManager();
        }
        if (initializeAddTickerModal()) {
            window.Logger?.info?.('✅ Add Ticker modal initialized successfully');
        } else {
            window.Logger?.warn?.('⚠️ Failed to initialize Add Ticker modal');
            waitForModalManager();
        }
    } else {
        window.Logger?.info?.('⚠️ ModalManagerV2 not yet available, waiting...');
        waitForModalManager();
    }
}

// Export for module systems
window.watchListModalConfig = watchListModalConfig;
window.addTickerModalConfig = addTickerModalConfig;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { watchListModalConfig, addTickerModalConfig };
}

