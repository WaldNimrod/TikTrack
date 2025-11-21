/**
 * Tag UI Manager - TikTrack
 * =========================
 *
 * Helper utilities for rendering and managing multi-select tag fields inside
 * ModalManagerV2 forms.
 *
 * Function Index:
 * - initializeModal
 * - refreshSelectOptions
 * - getSelectedValues
 * - setSelectedValues
 */

(function tagUiManagerFactory() {
    const SELECT_CLASS = 'tag-multi-select';
    const BADGE_CONTAINER_SUFFIX = 'TagBadgeContainer';
    const SUGGESTION_CONTAINER_SUFFIX = 'TagSuggestionContainer';

    const state = {
        allTags: null,
        fetchPromise: null
    };

    async function ensureTags({ categoryId = null, includeInactive = false } = {}) {
        if (!window.TagService || typeof window.TagService.fetchTags !== 'function') {
            window.Logger?.warn('⚠️ TagService not available', { page: 'tag-ui-manager' });
            return [];
        }
        
        if (!state.fetchPromise) {
            state.fetchPromise = window.TagService.fetchTags({
                categoryId,
                includeInactive
            }).then(tags => {
                state.allTags = tags;
                return tags;
            }).catch(error => {
                state.fetchPromise = null;
                throw error;
            });
        }

        const tags = await state.fetchPromise;
        if (categoryId !== null && categoryId !== undefined) {
            return tags.filter(tag => tag.category_id === categoryId);
        }
        return tags;
    }

    function buildOption(tag) {
        const option = document.createElement('option');
        option.value = tag.id;
        option.textContent = tag.category?.name
            ? `${tag.category.name} • ${tag.name}`
            : tag.name;
        option.dataset.categoryName = tag.category?.name || '';
        option.dataset.color = tag.category?.color_hex || '#26baac';
        return option;
    }

    async function populateSelect(select) {
        const categoryIdAttr = select.dataset.tagCategory;
        const categoryId = categoryIdAttr ? Number.parseInt(categoryIdAttr, 10) : null;
        const includeInactive = select.dataset.includeInactive === 'true';

        window.Logger?.info('🏷️ populateSelect called', { 
            selectId: select.id,
            categoryId,
            includeInactive,
            hasTagService: !!window.TagService,
            hasFetchTags: !!(window.TagService && typeof window.TagService.fetchTags === 'function'),
            page: 'tag-ui-manager' 
        });

        try {
            const tags = await ensureTags({ categoryId, includeInactive });
            window.Logger?.info('🏷️ Tags fetched successfully', { 
                selectId: select.id,
                tagsCount: tags.length,
                page: 'tag-ui-manager' 
            });
            
            select.innerHTML = '';

            const fragment = document.createDocumentFragment();
            tags.forEach(tag => fragment.appendChild(buildOption(tag)));
            select.appendChild(fragment);

            const initial = parseValueList(select.dataset.initialValue);
            if (initial.length) {
                setSelectedValues(select, initial);
            }
            updateBadgeDisplay(select);
            
            window.Logger?.info('🏷️ Tag select populated successfully', { 
                selectId: select.id,
                optionsCount: select.options.length,
                page: 'tag-ui-manager' 
            });
        } catch (error) {
            window.Logger?.warn('⚠️ Failed to populate tag select', { 
                error: error.message || error, 
                errorStack: error.stack,
                elementId: select.id, 
                page: 'tag-ui-manager' 
            });
        }
    }

    function parseValueList(value) {
        if (!value) {
            return [];
        }
        if (Array.isArray(value)) {
            return value.map(Number).filter(Number.isFinite);
        }
        if (typeof value === 'string') {
            return value
                .split(',')
                .map(part => Number.parseInt(part.trim(), 10))
                .filter(Number.isFinite);
        }
        return [];
    }

    function updateBadgeDisplay(select) {
        let badgeContainer = document.getElementById(`${select.id}${BADGE_CONTAINER_SUFFIX}`);
        if (!badgeContainer) {
            badgeContainer = document.createElement('div');
            badgeContainer.id = `${select.id}${BADGE_CONTAINER_SUFFIX}`;
            badgeContainer.className = 'tag-badge-container mt-2 d-flex flex-wrap gap-1';
            select.insertAdjacentElement('afterend', badgeContainer);
        }

        badgeContainer.innerHTML = '';
        const selectedOptions = Array.from(select.selectedOptions);
        if (!selectedOptions.length) {
            badgeContainer.innerHTML = '<span class="text-muted small">לא נבחרו תגיות</span>';
            return;
        }

        selectedOptions.forEach(option => {
            const badge = document.createElement('span');
            badge.className = 'badge rounded-pill bg-light text-dark border me-1 mb-1';
            const color = option.dataset.color || '#26baac';
            badge.style.borderColor = color;
            badge.style.color = '#000';
            badge.textContent = option.textContent;
            badgeContainer.appendChild(badge);
        });
    }

    function setSelectedValues(select, values) {
        const valuesSet = new Set(values.map(value => String(value)));
        Array.from(select.options).forEach(option => {
            option.selected = valuesSet.has(option.value);
        });
        updateBadgeDisplay(select);
    }

    function getSelectedValues(select) {
        return Array.from(select.selectedOptions)
            .map(option => Number.parseInt(option.value, 10))
            .filter(Number.isFinite);
    }

    function initializeSelect(select) {
        if (!select.classList.contains(SELECT_CLASS)) {
            return;
        }

        if (!select.multiple) {
            select.multiple = true;
        }
        if (!select.dataset.initialized) {
            select.addEventListener('change', () => updateBadgeDisplay(select));
            select.dataset.initialized = 'true';
        }
        populateSelect(select);
    }

    function initializeModal(modalElement) {
        const selects = modalElement.querySelectorAll(`select.${SELECT_CLASS}`);
        window.Logger?.info('🏷️ TagUIManager.initializeModal called', { 
            modalId: modalElement.id, 
            selectsCount: selects.length,
            selectIds: Array.from(selects).map(s => s.id),
            page: 'tag-ui-manager' 
        });
        selects.forEach(select => {
            window.Logger?.info('🏷️ Initializing tag select', { 
                selectId: select.id,
                hasTagService: !!window.TagService,
                hasFetchTags: !!(window.TagService && typeof window.TagService.fetchTags === 'function'),
                page: 'tag-ui-manager' 
            });
            initializeSelect(select);
        });
    }

    async function refreshSelectOptions(select) {
        window.Logger?.info('🏷️ refreshSelectOptions called', { 
            selectId: select.id,
            hasTagService: !!window.TagService,
            hasFetchTags: !!(window.TagService && typeof window.TagService.fetchTags === 'function'),
            page: 'tag-ui-manager' 
        });
        state.fetchPromise = null;
        state.allTags = null;
        await populateSelect(select);
    }

    async function hydrateSelectForEntity(selectId, entityType, entityId, { force = false } = {}) {
        const select = document.getElementById(selectId);
        if (!select) {
            return;
        }
        try {
            const tags = await window.TagService.loadEntityTags(entityType, entityId, { force });
            const ids = Array.isArray(tags) ? tags.map(tag => tag.id).filter(Number.isFinite) : [];
            select.setAttribute('data-initial-value', ids.join(','));
            await refreshSelectOptions(select);
        } catch (error) {
            window.Logger?.warn('⚠️ Failed to hydrate tag select for entity', {
                error,
                selectId,
                entityType,
                entityId,
                page: 'tag-ui-manager'
            });
        }
    }

    function getSuggestionContainer(select) {
        const containerId = `${select.id}${SUGGESTION_CONTAINER_SUFFIX}`;
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'mt-3 d-flex flex-column gap-3';
            const badgeContainer = document.getElementById(`${select.id}${BADGE_CONTAINER_SUFFIX}`);
            if (badgeContainer) {
                badgeContainer.insertAdjacentElement('afterend', container);
            } else {
                select.insertAdjacentElement('afterend', container);
            }
        }
        return container;
    }

    function buildSuggestionChip(tag, select) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.dataset.buttonType = 'FILTER';
        chip.dataset.variant = 'full';
        chip.dataset.icon = '🏷️';
        chip.dataset.text = tag.name;
        chip.dataset.classes = 'me-2 mb-2';
        chip.dataset.tagId = tag.tag_id;
        chip.addEventListener('click', () => applySuggestion(select, [tag.tag_id]));
        return chip;
    }

    function applySuggestion(select, tagIds = []) {
        if (!Array.isArray(tagIds) || !tagIds.length) {
            return;
        }
        const currentValues = new Set(getSelectedValues(select));
        let changed = false;
        tagIds.forEach((tagId) => {
            const normalizedId = Number.parseInt(tagId, 10);
            if (!Number.isFinite(normalizedId)) {
                return;
            }
            if (!currentValues.has(normalizedId)) {
                currentValues.add(normalizedId);
                changed = true;
            }
        });
        if (!changed) {
            return;
        }
        setSelectedValues(select, Array.from(currentValues));
    }

    function renderSuggestionGroup(container, title, tags, select) {
        if (!Array.isArray(tags) || tags.length === 0) {
            return;
        }
        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'd-flex flex-column gap-2';

        const headerRow = document.createElement('div');
        headerRow.className = 'd-flex align-items-center justify-content-between gap-2';
        const titleEl = document.createElement('span');
        titleEl.className = 'text-muted small';
        titleEl.textContent = title;
        headerRow.appendChild(titleEl);

        groupWrapper.appendChild(headerRow);

        const chipsRow = document.createElement('div');
        chipsRow.className = 'd-flex flex-wrap gap-2';
        tags.forEach((tag) => chipsRow.appendChild(buildSuggestionChip(tag, select)));
        groupWrapper.appendChild(chipsRow);

        container.appendChild(groupWrapper);
    }

    function renderSuggestionPanel(select, payload) {
        if (!payload) {
            return;
        }
        const container = getSuggestionContainer(select);
        container.innerHTML = '';
        const groups = [
            { key: 'top_entity_tags', title: 'הצעות לישות' },
            { key: 'top_category_tags', title: 'פופולריות לפי קטגוריה' },
            { key: 'recent_tags', title: 'תגיות שהשתמשת לאחרונה' }
        ];

        let rendered = false;
        groups.forEach((group) => {
            const tags = payload[group.key];
            if (Array.isArray(tags) && tags.length) {
                renderSuggestionGroup(container, group.title, tags, select);
                rendered = true;
            }
        });

        if (!rendered) {
            container.innerHTML = '<span class="text-muted small">אין הצעות זמינות עדיין</span>';
        }

        processButtons(container);
    }

    function filterSuggestionsBySelection(select, payload) {
        if (!payload) {
            return payload;
        }
        const selectedIds = new Set(getSelectedValues(select));
        const normalizeId = (tag) => {
            const candidate = tag?.tag_id ?? tag?.id ?? tag?.tagId;
            const parsed = Number.parseInt(candidate, 10);
            return Number.isFinite(parsed) ? parsed : null;
        };
        const filterGroup = (group = []) =>
            group.filter((tag) => {
                const tagId = normalizeId(tag);
                return tagId === null || !selectedIds.has(tagId);
            });
        return {
            top_entity_tags: filterGroup(payload.top_entity_tags),
            top_category_tags: filterGroup(payload.top_category_tags),
            recent_tags: filterGroup(payload.recent_tags)
        };
    }

    function processButtons(container) {
        if (!container) {
            return;
        }
        if (window.ButtonSystem?.processButtons) {
            window.ButtonSystem.processButtons(container);
        } else if (window.ButtonSystem?.hydrateButtons) {
            window.ButtonSystem.hydrateButtons(container);
        }
    }

    async function loadSuggestionsForSelect(select, { entityType, entityId = null } = {}) {
        if (!window.TagService?.getSmartSuggestions || !entityType) {
            return;
        }
        try {
            const payload = await window.TagService.getSmartSuggestions({
                entityType,
                entityId,
                limit: 6
            });
            const filtered = filterSuggestionsBySelection(select, payload);
            renderSuggestionPanel(select, filtered);
        } catch (error) {
            window.Logger?.warn('⚠️ Failed to load tag suggestions', {
                error,
                selectId: select.id,
                entityType,
                entityId,
                page: 'tag-ui-manager'
            });
        }
    }

    window.TagUIManager = {
        initializeModal,
        refreshSelectOptions,
        getSelectedValues,
        setSelectedValues,
        updateBadgeDisplay,
        hydrateSelectForEntity,
        loadSuggestionsForSelect,
        renderSuggestionPanel
    };
})();

