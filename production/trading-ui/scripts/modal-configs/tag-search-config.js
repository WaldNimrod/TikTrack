/**
 * Tag Search Drawer Configuration
 * ===============================
 *
 * Lightweight drawer rendered via ModalManagerV2 for displaying quick tag search results.
 */

const tagSearchDrawerConfig = {
    id: 'tagSearchDrawer',
    entityType: 'tag_search',
    title: {
        add: 'תוצאות חיפוש תגיות',
        edit: 'תוצאות חיפוש תגיות'
    },
    size: 'xl',
    headerType: 'dynamic',
    fields: [
        {
            type: 'custom',
            html: `
                <div class="tag-search-modal d-flex flex-column gap-3" data-role="tag-search-modal">
                    <div class="d-flex flex-wrap gap-2 align-items-start">
                        <div class="flex-grow-1">
                            <div class="fw-semibold" id="tagSearchModalTitle">חיפוש תגיות</div>
                            <div class="text-muted small" id="tagSearchModalSubtitle">בחר תגית להצגת כל הרשומות המשויכות</div>
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                            <button data-button-type="REFRESH"
                                    data-variant="small"
                                    data-icon="⟳"
                                    data-text=""
                                    data-onclick="TagSearchController?.refreshLastSearch({ force: true })"
                                    title="רענון תוצאות"></button>
                            <button data-button-type="LINK"
                                    data-variant="full"
                                    data-icon="🏠"
                                    data-text="ניהול תגיות"
                                    data-onclick="TagSearchController?.navigateToTagManagement()"
                                    title="פתח עמוד ניהול תגיות"></button>
                        </div>
                    </div>
                    <div id="tagSearchModalBody" class="d-flex flex-column gap-3">
                        <div id="tagSearchModalLoading"
                             class="d-flex align-items-center justify-content-center text-muted small">
                            <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                            <span>טוען תוצאות...</span>
                        </div>
                        <div id="tagSearchModalError" class="alert alert-danger d-none" role="alert"></div>
                        <div id="tagSearchModalEmpty" class="alert alert-info d-none" role="status">
                            אין רשומות תואמות לחיפוש האחרון.
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>ישות</th>
                                        <th>שם</th>
                                        <th>תגית</th>
                                        <th>עודכן</th>
                                        <th class="text-end">פעולות</th>
                                    </tr>
                                </thead>
                                <tbody id="tagSearchResultsBody"></tbody>
                            </table>
                        </div>
                        <div class="d-flex align-items-center justify-content-between" id="tagSearchModalFooterControls">
                            <div class="text-muted small" id="tagSearchModalCount"></div>
                            <button type="button"
                                    data-button-type="SECONDARY"
                                    data-variant="full"
                                    data-icon="➕"
                                    data-text="טען עוד"
                                    data-onclick="TagSearchController?.loadMoreResults()"
                                    id="tagSearchLoadMoreBtn"></button>
                        </div>
                    </div>
                </div>
            `
        }
    ],
    validation: {},
    onSave: 'TagSearchController.closeDrawer'
};

function initializeTagSearchDrawer() {
    if (!window.ModalManagerV2 || typeof window.ModalManagerV2.createCRUDModal !== 'function') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeTagSearchDrawer, 150);
        }, { once: true });
        return;
    }

    try {
        window.ModalManagerV2.createCRUDModal(tagSearchDrawerConfig);
    } catch (error) {
        console.error('❌ Failed to initialize tag search drawer', error);
    }
}

initializeTagSearchDrawer();
window.tagSearchDrawerConfig = tagSearchDrawerConfig;

