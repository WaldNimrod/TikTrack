/**
 * Tag Search Controller
 * =====================
 *
 * Handles the home dashboard tag cloud widget, quick search form, and search drawer.
 */

(function tagSearchControllerFactory() {
    const DEFAULT_LIMIT = 25;
    const LIMIT_STEP = 25;
    const elements = {
        tagCloudCard: null,
        tagCloudContainer: null,
        tagCloudLoading: null,
        tagCloudError: null,
        tagCloudEmpty: null,
        quickSearchForm: null,
        quickSearchInput: null,
        quickSearchFilter: null,
        quickSearchStatus: null,
        drawer: null,
        drawerLoading: null,
        drawerError: null,
        drawerEmpty: null,
        drawerBody: null,
        drawerCount: null,
        drawerResultsBody: null,
        drawerLoadMoreBtn: null,
        drawerTitle: null,
        drawerSubtitle: null
    };

    const state = {
        initialized: false,
        tagCloudLoading: false,
        searchLoading: false,
        lastQuery: '',
        lastEntityFilter: '',
        lastResults: [],
        lastResultCount: 0,
        currentLimit: DEFAULT_LIMIT,
        metadataCache: new Map()
    };

    const entityPageMap = {
        trade: 'trades',
        trade_plan: 'trade_plans',
        execution: 'executions',
        trading_account: 'trading_accounts',
        account: 'trading_accounts',
        ticker: 'tickers',
        alert: 'alerts',
        cash_flow: 'cash_flows',
        note: 'notes'
    };

    const controller = {
        init() {
            if (state.initialized) {
                return;
            }
            this.cacheElements();
            this.bindEvents();
            this.ensureDrawerChrome();
            this.refreshTagCloud().catch(() => {});
            state.initialized = true;
            window.TagSearchController = this;
        },

        cacheElements() {
            elements.tagCloudCard = document.getElementById('tagCloudCard');
            elements.tagCloudContainer = document.getElementById('tagCloudContainer');
            elements.tagCloudLoading = document.getElementById('tagCloudLoading');
            elements.tagCloudError = document.getElementById('tagCloudError');
            elements.tagCloudEmpty = document.getElementById('tagCloudEmpty');
            elements.quickSearchForm = document.getElementById('tagQuickSearchForm');
            elements.quickSearchInput = document.getElementById('tagQuickSearchInput');
            elements.quickSearchFilter = document.getElementById('tagQuickSearchEntityFilter');
            elements.quickSearchStatus = document.getElementById('tagQuickSearchStatus');
        },

        bindEvents() {
            if (elements.quickSearchForm) {
                elements.quickSearchForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    this.handleQuickSearchSubmit();
                });
            }
        },

        ensureDrawerChrome() {
            elements.drawer = document.getElementById('tagSearchDrawer');
            if (!elements.drawer) {
                return;
            }
            elements.drawerLoading = elements.drawer.querySelector('#tagSearchModalLoading');
            elements.drawerError = elements.drawer.querySelector('#tagSearchModalError');
            elements.drawerEmpty = elements.drawer.querySelector('#tagSearchModalEmpty');
            elements.drawerBody = elements.drawer.querySelector('#tagSearchModalBody');
            elements.drawerCount = elements.drawer.querySelector('#tagSearchModalCount');
            elements.drawerResultsBody = elements.drawer.querySelector('#tagSearchResultsBody');
            elements.drawerLoadMoreBtn = elements.drawer.querySelector('#tagSearchLoadMoreBtn');
            elements.drawerTitle = elements.drawer.querySelector('#tagSearchModalTitle');
            elements.drawerSubtitle = elements.drawer.querySelector('#tagSearchModalSubtitle');

            const footer = elements.drawer.querySelector('.modal-footer');
            if (footer) {
                footer.classList.add('d-none');
            }
            if (elements.drawerLoadMoreBtn) {
                elements.drawerLoadMoreBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.loadMoreResults();
                });
            }
        },

        async refreshTagCloud({ force = false } = {}) {
            if (!elements.tagCloudContainer || state.tagCloudLoading) {
                return;
            }
            state.tagCloudLoading = true;
            this.toggleTagCloudState({ loading: true });
            try {
                const data = await window.TagService?.getTagCloudData({ force });
                this.renderTagCloud(Array.isArray(data) ? data : []);
            } catch (error) {
                this.showTagCloudError(error);
            } finally {
                state.tagCloudLoading = false;
                this.toggleTagCloudState({ loading: false });
            }
        },

        toggleTagCloudState({ loading = false } = {}) {
            if (elements.tagCloudLoading) {
                elements.tagCloudLoading.classList.toggle('d-none', !loading);
            }
            if (elements.tagCloudContainer) {
                elements.tagCloudContainer.classList.toggle('d-none', loading);
            }
            if (elements.tagCloudError) {
                elements.tagCloudError.classList.add('d-none');
            }
        },

        showTagCloudError(error) {
            const message = error?.message || 'נכשלה טעינת נתוני הענן';
            if (elements.tagCloudError) {
                elements.tagCloudError.textContent = message;
                elements.tagCloudError.classList.remove('d-none');
            }
        },

        renderTagCloud(tags) {
            if (!elements.tagCloudContainer) {
                return;
            }
            elements.tagCloudContainer.innerHTML = '';
            if (!Array.isArray(tags) || tags.length === 0) {
                if (elements.tagCloudEmpty) {
                    elements.tagCloudEmpty.classList.remove('d-none');
                }
                return;
            }
            if (elements.tagCloudEmpty) {
                elements.tagCloudEmpty.classList.add('d-none');
            }

            const usageValues = tags.map((tag) => tag.usage_count || 0);
            const maxUsage = Math.max(...usageValues, 1);

            tags.forEach((tag) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.dataset.buttonType = 'FILTER';
                button.dataset.variant = 'full';
                button.dataset.icon = '🏷️';
                button.dataset.text = tag.name;
                button.dataset.classes = `${this.getTierClass((tag.usage_count || 0) / maxUsage)} me-2 mb-2`;
                button.dataset.tooltip = `${tag.name} • ${(tag.usage_count || 0).toLocaleString('he-IL')} שיוכים`;
                button.dataset.tooltipPlacement = 'top';
                button.dataset.tooltipTrigger = 'hover';
                button.dataset.tagId = tag.tag_id;
                button.addEventListener('click', () => this.applyTagFromCloud(tag));
                elements.tagCloudContainer.appendChild(button);
            });

            this.processButtons(elements.tagCloudContainer);
        },

        getTierClass(ratio) {
            if (ratio >= 0.75) {
                return 'fs-2';
            }
            if (ratio >= 0.5) {
                return 'fs-3';
            }
            if (ratio >= 0.3) {
                return 'fs-4';
            }
            return 'fs-5';
        },

        applyTagFromCloud(tag) {
            if (elements.quickSearchInput) {
                elements.quickSearchInput.value = tag.name || '';
                elements.quickSearchInput.focus();
            }
            this.performSearch({
                query: tag.name || '',
                entityType: elements.quickSearchFilter?.value || '',
                limit: DEFAULT_LIMIT,
                origin: 'cloud'
            }).catch(() => {});
        },

        handleQuickSearchSubmit() {
            const query = (elements.quickSearchInput?.value || '').trim();
            if (query.length < 2) {
                this.updateStatus('יש להזין לפחות שני תווים לחיפוש', 'warning');
                return;
            }
            const entityType = elements.quickSearchFilter?.value || '';
            this.performSearch({
                query,
                entityType,
                limit: DEFAULT_LIMIT,
                origin: 'form'
            }).catch(() => {});
        },

        async performSearch({ query, entityType = '', limit = DEFAULT_LIMIT, origin = 'form', force = false }) {
            if (!window.TagService || state.searchLoading) {
                return;
            }
            state.searchLoading = true;
            state.lastQuery = query;
            state.lastEntityFilter = entityType;
            state.currentLimit = limit;

            if (origin === 'form' && elements.quickSearchStatus) {
                this.updateStatus('מבצע חיפוש...', 'info');
            }

            try {
                const payload = await window.TagService.searchTags({
                    query,
                    entityType: entityType || null,
                    limit,
                    includeInactive: false,
                    force
                });
                state.lastResults = Array.isArray(payload) ? payload : [];
                state.lastResultCount = this.countAssignments(state.lastResults);
                await this.openDrawer({
                    query,
                    entityType,
                    results: state.lastResults,
                    total: state.lastResultCount
                });

                if (elements.quickSearchStatus) {
                    const label = entityType ? ` (${LinkedItemsService?.getEntityLabel?.(entityType) || entityType})` : '';
                    this.updateStatus(`נמצאו ${state.lastResultCount} רשומות${label}`, 'success');
                }
            } catch (error) {
                const message = error?.message || 'החיפוש נכשל';
                this.updateStatus(message, 'error');
                this.showDrawerError(message);
                window.Logger?.error?.('❌ Tag search failed', { error, page: 'index' });
                window.NotificationSystem?.showError?.(message);
            } finally {
                state.searchLoading = false;
            }
        },

        countAssignments(results) {
            if (!Array.isArray(results)) {
                return 0;
            }
            return results.reduce((sum, entry) => {
                const assignments = Array.isArray(entry.assignments) ? entry.assignments.length : 0;
                return sum + assignments;
            }, 0);
        },

        updateStatus(message, variant = 'info') {
            if (!elements.quickSearchStatus) {
                return;
            }
            const classes = {
                info: 'text-muted',
                success: 'text-success',
                warning: 'text-warning',
                error: 'text-danger'
            };
            elements.quickSearchStatus.className = `small ${classes[variant] || 'text-muted'}`;
            elements.quickSearchStatus.textContent = message;
        },

        async openDrawer({ query, entityType, results, total }) {
            if (!window.ModalManagerV2) {
                window.Logger?.warn?.('ModalManagerV2 missing, cannot open tag search drawer', { page: 'index' });
                return;
            }
            await window.ModalManagerV2.showModal('tagSearchDrawer', 'view');
            // Re-cache drawer elements in case DOM was recreated
            this.ensureDrawerChrome();
            this.hydrateDrawer({ query, entityType, results, total });
        },

        hydrateDrawer({ query, entityType, results, total }) {
            if (!elements.drawer) {
                return;
            }

            if (elements.drawerTitle) {
                elements.drawerTitle.textContent = `חיפוש: ${query}`;
            }
            if (elements.drawerSubtitle) {
                elements.drawerSubtitle.textContent = entityType
                    ? `סינון לפי ${LinkedItemsService?.getEntityLabel?.(entityType) || entityType}`
                    : 'כל היישויות';
            }
            if (elements.drawerCount) {
                elements.drawerCount.textContent = `${total.toLocaleString('he-IL')} רשומות`;
            }
            this.hideDrawerMessages();
            this.renderDrawerRows(results);
            if (elements.drawerLoadMoreBtn) {
                elements.drawerLoadMoreBtn.classList.toggle('d-none', total < state.currentLimit);
            }
        },

        hideDrawerMessages() {
            [elements.drawerLoading, elements.drawerError, elements.drawerEmpty].forEach((el) => {
                if (el) {
                    el.classList.add('d-none');
                }
            });
        },

        showDrawerError(message) {
            if (elements.drawerError) {
                elements.drawerError.textContent = message;
                elements.drawerError.classList.remove('d-none');
            }
        },

        renderDrawerRows(results) {
            if (!elements.drawerResultsBody) {
                return;
            }
            elements.drawerResultsBody.innerHTML = '';
            if (!Array.isArray(results) || results.length === 0) {
                if (elements.drawerEmpty) {
                    elements.drawerEmpty.classList.remove('d-none');
                }
                return;
            }

            const flattened = [];
            results.forEach((entry) => {
                const tag = entry.tag;
                (entry.assignments || []).forEach((assignment) => {
                    flattened.push({
                        entity_type: assignment.entity_type,
                        entity_id: assignment.entity_id,
                        linked_at: assignment.linked_at,
                        tag
                    });
                });
            });

            if (flattened.length === 0 && elements.drawerEmpty) {
                elements.drawerEmpty.classList.remove('d-none');
                return;
            }

            flattened.forEach((item) => {
                const row = this.buildDrawerRow(item);
                elements.drawerResultsBody.appendChild(row);
                this.hydrateRowMetadata(row, item);
            });
        },

        buildDrawerRow({ entity_type, entity_id, linked_at, tag }) {
            const row = document.createElement('tr');
            const entityLabel = LinkedItemsService?.getEntityLabel?.(entity_type) || entity_type;

            const typeCell = document.createElement('td');
            typeCell.textContent = entityLabel;
            row.appendChild(typeCell);

            const nameCell = document.createElement('td');
            const namePrimary = document.createElement('div');
            namePrimary.className = 'fw-semibold';
            namePrimary.textContent = `#${entity_id}`;
            namePrimary.dataset.entityNameTarget = `${entity_type}:${entity_id}`;
            const nameSecondary = document.createElement('div');
            nameSecondary.className = 'text-muted small';
            nameSecondary.textContent = 'טוען פרטים...';
            nameSecondary.dataset.entityMetaTarget = `${entity_type}:${entity_id}`;
            nameCell.appendChild(namePrimary);
            nameCell.appendChild(nameSecondary);
            row.appendChild(nameCell);

            const tagCell = document.createElement('td');
            if (window.FieldRendererService?.renderTagBadges) {
                tagCell.innerHTML = window.FieldRendererService.renderTagBadges([tag], {
                    showTitle: false,
                    includeCategory: false
                });
            } else {
                tagCell.textContent = tag?.name || '-';
            }
            row.appendChild(tagCell);

            const dateCell = document.createElement('td');
            dateCell.innerHTML = this.formatDate(linked_at);
            row.appendChild(dateCell);

        const actionsCell = document.createElement('td');
        actionsCell.className = 'text-end';
        const actionsWrapper = document.createElement('div');
        actionsWrapper.className = 'd-inline-flex gap-2';
        const openBtn = document.createElement('button');
        openBtn.type = 'button';
        openBtn.dataset.buttonType = 'VIEW';
        openBtn.dataset.variant = 'small';
        openBtn.dataset.icon = '🔗';
        openBtn.dataset.text = 'פתח';
        openBtn.addEventListener('click', () => this.navigateToEntity(entity_type, entity_id));
        actionsWrapper.appendChild(openBtn);
        const modalBtn = document.createElement('button');
        modalBtn.type = 'button';
        modalBtn.dataset.buttonType = 'LINKED';
        modalBtn.dataset.variant = 'small';
        modalBtn.dataset.icon = '👁️';
        modalBtn.dataset.text = 'פרטים';
        modalBtn.addEventListener('click', () => this.openEntityDetails(entity_type, entity_id));
        actionsWrapper.appendChild(modalBtn);
        actionsCell.appendChild(actionsWrapper);
        row.appendChild(actionsCell);

        this.processButtons(actionsWrapper);

            return row;
        },

        formatDate(value) {
            if (window.FieldRendererService?.renderDateTime) {
                try {
                    return window.FieldRendererService.renderDateTime(value) || '-';
                } catch (error) {
                    window.Logger?.warn?.('renderDateTime failed', { error, page: 'index' });
                }
            }
            const date = value ? new Date(value) : null;
            if (!date || Number.isNaN(date.getTime())) {
                return '-';
            }
            return date.toLocaleString('he-IL');
        },

        hydrateRowMetadata(row, { entity_type, entity_id }) {
            const cacheKey = `${entity_type}:${entity_id}`;
            const nameTarget = row.querySelector(`[data-entity-name-target="${cacheKey}"]`);
            const metaTarget = row.querySelector(`[data-entity-meta-target="${cacheKey}"]`);

            this.resolveEntityMetadata(entity_type, entity_id)
                .then((details) => {
                    if (!details) {
                        return;
                    }
                    if (nameTarget) {
                        nameTarget.textContent = details.symbol || details.name || details.title || `#${entity_id}`;
                    }
                    if (metaTarget) {
                        metaTarget.textContent = this.buildEntitySubtitle(details, entity_type);
                    }
                })
                .catch((error) => {
                    window.Logger?.warn?.('Entity metadata fetch failed', { error, entity_type, entity_id });
                    if (metaTarget) {
                        metaTarget.textContent = 'לא ניתן לטעון נתונים';
                    }
                });
        },

        buildEntitySubtitle(details, entityType) {
            if (!details) {
                return '';
            }
            const parts = [];
            if (entityType === 'trade' || entityType === 'trade_plan' || entityType === 'execution') {
                if (details.ticker_symbol || details.symbol) {
                    parts.push(details.ticker_symbol || details.symbol);
                }
                if (details.side) {
                    parts.push(details.side);
                }
            } else if (entityType === 'trading_account') {
                if (details.currency_symbol) {
                    parts.push(details.currency_symbol);
                }
            } else if (entityType === 'ticker') {
                if (details.type) {
                    parts.push(details.type);
                }
            } else if (entityType === 'alert' && details.status) {
                parts.push(details.status);
            }
            if (details.status && !parts.includes(details.status)) {
                parts.push(details.status);
            }
            return parts.filter(Boolean).join(' • ') || '';
        },

        async resolveEntityMetadata(entityType, entityId) {
            const cacheKey = `${entityType}:${entityId}`;
            if (state.metadataCache.has(cacheKey)) {
                return state.metadataCache.get(cacheKey);
            }
            if (!window.entityDetailsAPI?.getEntityDetails) {
                return null;
            }
            try {
                const data = await window.entityDetailsAPI.getEntityDetails(entityType, entityId, {
                    includeLinkedItems: false
                });
                state.metadataCache.set(cacheKey, data);
                return data;
            } catch (error) {
                window.Logger?.warn?.('entityDetailsAPI failed', { error, entityType, entityId });
                return null;
            }
        },

        navigateToEntity(entityType, entityId) {
            const targetPage = entityPageMap[entityType];
            if (targetPage && typeof window.navigateToPage === 'function') {
                window.navigateToPage(targetPage, { entityId, preserveState: true });
            } else {
                window.location.href = `${targetPage || entityType}.html#${entityId}`;
            }
        },

        openEntityDetails(entityType, entityId) {
            if (typeof window.showLinkedItemsModal === 'function') {
                window.showLinkedItemsModal(entityId, entityType);
                return;
            }
            this.navigateToEntity(entityType, entityId);
        },

        loadMoreResults() {
            const nextLimit = state.currentLimit + LIMIT_STEP;
            this.performSearch({
                query: state.lastQuery,
                entityType: state.lastEntityFilter,
                limit: nextLimit,
                origin: 'drawer',
                force: true
            }).catch(() => {});
        },

        refreshLastSearch({ force = false } = {}) {
            if (!state.lastQuery) {
                return;
            }
            this.performSearch({
                query: state.lastQuery,
                entityType: state.lastEntityFilter,
                limit: state.currentLimit,
                origin: 'drawer',
                force
            }).catch(() => {});
        },

        navigateToTagManagement() {
            if (typeof window.navigateToPage === 'function') {
                window.navigateToPage('tag-management', { preserveState: true });
            } else {
                window.location.href = 'tag-management.html';
            }
        },

        closeDrawer() {
            window.ModalManagerV2?.closeActiveModal();
        },

        processButtons(container) {
            if (!container) {
                return;
            }
            if (window.ButtonSystem?.processButtons) {
                window.ButtonSystem.processButtons(container);
            } else if (window.ButtonSystem?.hydrateButtons) {
                window.ButtonSystem.hydrateButtons(container);
            }
        }
    };

    window.TagSearchController = controller;
    document.addEventListener('DOMContentLoaded', () => controller.init());
})();

