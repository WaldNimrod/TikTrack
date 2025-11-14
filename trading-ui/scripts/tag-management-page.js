/**
 * Tag Management Page Controller
 * ==============================
 *
 * Responsibilities:
 * - Load and render tag categories, tags and analytics data
 * - Provide CRUD hooks for ModalManagerV2 (delegated to TagService)
 * - Integrate with UnifiedTableSystem, TagEvents and NotificationSystem
 */

(function tagManagementPageModule() {
    'use strict';

    const CATEGORY_TABLE_TYPE = 'tag_categories';
    const TAG_TABLE_TYPE = 'tags';
    const USAGE_TABLE_TYPE = 'tag_usage_leaderboard';

    const selectors = {
        categoriesTable: '#tagCategoriesTable tbody',
        tagsTable: '#tagsTable tbody',
        usageTable: '#tagUsageLeaderboardTable tbody',
        categoryFilter: '#tagsCategoryFilter',
        searchInput: '#tagsSearchInput',
        totalActiveTags: '#totalActiveTags',
        totalActiveCategories: '#totalActiveCategories',
        suggestionsAvailable: '#suggestionsAvailable',
        recentUsageCount: '#recentUsageCount'
    };

    const state = {
        categories: [],
        tags: [],
        allTags: [],
        filteredTags: [],
        usage: [],
        analytics: null,
        filters: {
            categoryId: '',
            search: ''
        }
    };
    let initialized = false;

    function log(message, payload = {}) {
        if (window.Logger) {
            window.Logger.info(message, { page: 'tag-management', ...payload });
        } else {
            console.log(`[TagManagement] ${message}`, payload);
        }
    }

    function normalizeTagName(name) {
        return (name || '').trim().toLowerCase();
    }

    function findExistingTagByName(name, excludeId = null) {
        if (!name) {
            return null;
        }
        const normalized = normalizeTagName(name);
        const sourceTags = state.allTags.length ? state.allTags : state.tags;
        return sourceTags.find((tag) => {
            const tagName = normalizeTagName(tag.name);
            if (!tagName || tagName !== normalized) {
                return false;
            }
            if (excludeId == null) {
                return true;
            }
            return Number(tag.id) !== Number(excludeId);
        }) || null;
    }

    function escapeAttribute(value) {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function showError(message, error) {
        const errorDetails = error?.message && typeof error.message === 'string'
            ? `${message} (${error.message})`
            : message;
        if (window.Logger) {
            window.Logger.error(errorDetails, { page: 'tag-management', error });
        } else {
            console.error(errorDetails, error);
        }
        if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה', errorDetails);
        }
    }

    function renderCategoriesTable(data) {
        const tbody = document.querySelector(selectors.categoriesTable);
        if (!tbody) return;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">לא נמצאו קטגוריות</td></tr>';
            return;
        }

        const rows = data.map((item) => {
            const description = item.description ? window.escapeHtml?.(item.description) || item.description : '<span class="text-muted">—</span>';
            const tagCount = Number(item.tags_count || 0);
            const updated = window.FieldRendererService?.renderUpdatedTimestamp?.(item.updated_at) || (item.updated_at || '-');

            return `
                <tr data-category-id="${item.id}">
                    <td>${window.escapeHtml?.(item.name) || item.name}</td>
                    <td>${description}</td>
                    <td><span class="badge bg-secondary">${tagCount.toLocaleString('en-US')}</span></td>
                    <td>${updated}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <button type="button"
                                data-button-type="EDIT"
                                data-variant="small"
                                data-icon="✏️"
                                data-text="עריכה"
                                data-tooltip="עריכת קטגוריה"
                                data-onclick="window.TagManagementPage?.openCategoryModal('edit', ${item.id})">
                            </button>
                            <button type="button"
                                data-button-type="DELETE"
                                data-variant="small"
                                data-icon="🗑️"
                                data-text="מחיקה"
                                data-tooltip="מחיקת קטגוריה"
                                data-onclick="window.TagManagementPage?.promptDeleteCategory(${item.id})">
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = rows.join('');
    }

    function renderTagsTable(data) {
        const tbody = document.querySelector(selectors.tagsTable);
        if (!tbody) return;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">לא נמצאו תגיות</td></tr>';
            return;
        }

        const rows = data.map((item) => {
            const description = item.description ? window.escapeHtml?.(item.description) || item.description : '<span class="text-muted">—</span>';
            const usage = Number(item.usage_count || 0).toLocaleString('en-US');
            const lastUsed = item.last_used_at
                ? window.FieldRendererService?.renderUpdatedTimestamp?.(item.last_used_at, { fallback: '—' })
                : '<span class="text-muted">—</span>';
            const tagName = item.name || `תגית #${item.id}`;
            const attributeTagName = escapeAttribute(tagName);

            return `
                <tr data-tag-id="${item.id}">
                    <td>
                        <button type="button"
                            data-button-type="LINK"
                            data-variant="link"
                            data-onclick="window.TagManagementPage?.showTagUsage(${item.id})"
                            data-text="${attributeTagName}">
                        </button>
                    </td>
                    <td>${window.escapeHtml?.(item.category_name) || item.category_name || '<span class="text-muted">ללא קטגוריה</span>'}</td>
                    <td>${description}</td>
                    <td><span class="badge bg-info text-dark">${usage}</span></td>
                    <td>${lastUsed}</td>
                    <td>
                        <div class="d-flex gap-1">
                            <button type="button"
                                data-button-type="EDIT"
                                data-variant="small"
                                data-icon="✏️"
                                data-text="עריכה"
                                data-tooltip="עריכת תגית"
                                data-onclick="window.TagManagementPage?.openTagModal('edit', ${item.id})">
                            </button>
                            <button type="button"
                                data-button-type="DELETE"
                                data-variant="small"
                                data-icon="🗑️"
                                data-text="מחיקה"
                                data-tooltip="מחיקת תגית"
                                data-onclick="window.TagManagementPage?.promptDeleteTag(${item.id})">
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = rows.join('');
        if (window.ButtonSystem && typeof window.ButtonSystem.initializeButtons === 'function') {
            setTimeout(() => {
                window.ButtonSystem.initializeButtons();
            }, 0);
        }
    }

    function renderUsageTable(data) {
        const tbody = document.querySelector(selectors.usageTable);
        if (!tbody) return;

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">אין נתוני שימוש זמינים</td></tr>';
            return;
        }

        const rows = data.map((item) => {
            const topEntities = (item.top_entities || []).map((entity) => {
                const entityLabel = window.LinkedItemsService?.getEntityLabel?.(entity.type) || entity.type;
                return `<span class="badge bg-light text-dark">${entityLabel} #${entity.id}</span>`;
            }).join(' ');

            return `
                <tr>
                    <td>${window.escapeHtml?.(item.tag_name) || item.tag_name}</td>
                    <td>${window.escapeHtml?.(item.category_name) || item.category_name || '<span class="text-muted">—</span>'}</td>
                    <td><span class="badge bg-primary">${Number(item.usage_count || 0).toLocaleString('en-US')}</span></td>
                    <td>${topEntities || '<span class="text-muted">—</span>'}</td>
                </tr>
            `;
        });

        tbody.innerHTML = rows.join('');
    }

    function populateCategoryFilter() {
        const select = document.querySelector(selectors.categoryFilter);
        if (!select) return;

        const defaultOption = '<option value="">הצג הכול</option>';
        const options = state.categories.map((category) => `<option value="${category.id}">${window.escapeHtml?.(category.name) || category.name}</option>`);
        select.innerHTML = [defaultOption, ...options].join('');
        if (state.filters.categoryId) {
            select.value = state.filters.categoryId;
        }
    }

    function applyFilters() {
        const search = state.filters.search.trim().toLowerCase();
        const categoryId = state.filters.categoryId;

        const filtered = state.tags.filter((tag) => {
            const matchesCategory = !categoryId || String(tag.category_id || '') === String(categoryId);
            const matchesSearch = !search
                || (tag.name && tag.name.toLowerCase().includes(search))
                || (tag.description && tag.description.toLowerCase().includes(search));
            return matchesCategory && matchesSearch;
        });

        state.filteredTags = filtered;
        renderTagsTable(filtered);
    }

    async function loadCategories(force = false) {
        try {
            const categories = await window.TagService.fetchCategories({ force });
            state.categories = Array.isArray(categories) ? categories : [];
            populateCategoryFilter();
            renderCategoriesTable(state.categories);
            return state.categories;
        } catch (error) {
            showError('טעינת קטגוריות נכשלה', error);
            throw error;
        }
    }

    async function loadTags({ force = false } = {}) {
        try {
            const tags = await window.TagService.fetchTags({ force, includeInactive: true });
            state.allTags = Array.isArray(tags) ? tags : [];
            state.tags = state.allTags.filter((tag) => tag.is_active !== false);
            applyFilters();
            return state.tags;
        } catch (error) {
            showError('טעינת תגיות נכשלה', error);
            throw error;
        }
    }

    async function loadAnalytics(force = true) {
        try {
            const analytics = await window.TagService.getAnalytics(force);
            state.analytics = analytics || {};
            const summary = analytics?.summary || {};
            const usage = analytics?.usage || [];

            const totalTagsElem = document.querySelector(selectors.totalActiveTags);
            const totalCategoriesElem = document.querySelector(selectors.totalActiveCategories);
            const suggestionsElem = document.querySelector(selectors.suggestionsAvailable);
            const recentUsageElem = document.querySelector(selectors.recentUsageCount);

            if (totalTagsElem) totalTagsElem.textContent = Number(summary.active_tags || 0).toLocaleString('en-US');
            if (totalCategoriesElem) totalCategoriesElem.textContent = Number(summary.active_categories || 0).toLocaleString('en-US');
            if (suggestionsElem) suggestionsElem.textContent = Number(summary.suggestions_cached || 0).toLocaleString('en-US');
            if (recentUsageElem) recentUsageElem.textContent = Number(summary.usage_last_30_days || 0).toLocaleString('en-US');

            state.usage = Array.isArray(usage) ? usage : [];
            renderUsageTable(state.usage);
            return analytics;
        } catch (error) {
            showError('טעינת אנליטיקה נכשלה', error);
            throw error;
        }
    }

    async function refreshAll() {
        log('Refreshing all tag data');
        await Promise.all([
            loadCategories(true),
            loadTags({ force: true }),
            loadAnalytics(true)
        ]);
    }

    function refreshAnalytics() {
        loadAnalytics(true);
    }

    function resetFilters() {
        state.filters = { categoryId: '', search: '' };
        const categorySelect = document.querySelector(selectors.categoryFilter);
        if (categorySelect) categorySelect.value = '';
        const searchInput = document.querySelector(selectors.searchInput);
        if (searchInput) searchInput.value = '';
        applyFilters();
    }

    function registerTables() {
        const registry = window.UnifiedTableSystem?.registry;
        if (!registry) {
            log('UnifiedTableSystem registry not available', { level: 'warn' });
            return;
        }

        if (!registry.isRegistered(CATEGORY_TABLE_TYPE)) {
            registry.register(CATEGORY_TABLE_TYPE, {
                dataGetter: () => state.categories,
                updateFunction: renderCategoriesTable,
                tableSelector: '#tagCategoriesTable',
                columns: window.TABLE_COLUMN_MAPPINGS?.[CATEGORY_TABLE_TYPE] || [],
                sortable: true,
                filterable: false
            });
        }

        if (!registry.isRegistered(TAG_TABLE_TYPE)) {
            registry.register(TAG_TABLE_TYPE, {
                dataGetter: () => state.filteredTags,
                updateFunction: renderTagsTable,
                tableSelector: '#tagsTable',
                columns: window.TABLE_COLUMN_MAPPINGS?.[TAG_TABLE_TYPE] || [],
                sortable: true,
                filterable: false
            });
        }

        if (!registry.isRegistered(USAGE_TABLE_TYPE)) {
            registry.register(USAGE_TABLE_TYPE, {
                dataGetter: () => state.usage,
                updateFunction: renderUsageTable,
                tableSelector: '#tagUsageLeaderboardTable',
                columns: window.TABLE_COLUMN_MAPPINGS?.[USAGE_TABLE_TYPE] || [],
                sortable: true,
                filterable: false
            });
        }
    }

    function attachEventListeners() {
        const categorySelect = document.querySelector(selectors.categoryFilter);
        if (categorySelect) {
            categorySelect.addEventListener('change', (event) => {
                state.filters.categoryId = event.target.value;
                applyFilters();
            });
        }

        const searchInput = document.querySelector(selectors.searchInput);
        if (searchInput) {
            searchInput.addEventListener('input', (event) => {
                state.filters.search = event.target.value || '';
                applyFilters();
            });
        }

        if (window.TagEvents) {
            window.TagEvents.onCategoryUpdated(() => {
                loadCategories(true);
            });
            window.TagEvents.onTagUpdated(() => {
                loadTags({ force: true });
                loadAnalytics(true);
            });
            window.TagEvents.onEntityTagsUpdated(() => {
                loadAnalytics(true);
            });
        }
    }

    function prepareCategoryForm(mode, entityData) {
        const form = document.getElementById('tagCategoryModalForm');
        if (!form) return;

        form.dataset.mode = mode;
        form.dataset.entityId = entityData?.id || '';

        const nameInput = document.getElementById('tagCategoryName');
        const descriptionInput = document.getElementById('tagCategoryDescription');
        const orderInput = document.getElementById('tagCategoryOrder');
        const activeCheckbox = document.getElementById('tagCategoryActive');

        if (nameInput) nameInput.value = entityData?.name || '';
        if (descriptionInput) descriptionInput.value = entityData?.description || '';
        if (orderInput) {
            orderInput.value = Number.isFinite(Number(entityData?.order_index))
                ? String(entityData.order_index)
                : '';
        }
        if (activeCheckbox) activeCheckbox.checked = entityData ? entityData.is_active !== false : true;
    }

    function prepareTagForm(mode, entityData) {
        const form = document.getElementById('tagModalForm');
        if (!form) return;

        form.dataset.mode = mode;
        form.dataset.entityId = entityData?.id || '';

        const nameInput = document.getElementById('tagName');
        const descriptionInput = document.getElementById('tagDescription');
        const categorySelect = document.getElementById('tagCategory');
        const activeCheckbox = document.getElementById('tagActive');

        if (nameInput) nameInput.value = entityData?.name || '';
        if (descriptionInput) descriptionInput.value = entityData?.description || '';

        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">בחר קטגוריה...</option>';
            const options = state.categories.map((category) => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                return option;
            });
            options.forEach((option) => categorySelect.appendChild(option));

            if (entityData?.category_id) {
                categorySelect.value = String(entityData.category_id);
            } else {
                categorySelect.value = '';
            }
        }

        if (activeCheckbox) activeCheckbox.checked = entityData ? entityData.is_active !== false : true;
    }

    async function openCategoryModal(mode = 'add', categoryId = null) {
        if (!window.ModalManagerV2) {
            showError('ModalManagerV2 לא זמין', null);
            return;
        }

        const entityData = categoryId
            ? state.categories.find((cat) => Number(cat.id) === Number(categoryId)) || null
            : null;

        await window.ModalManagerV2.showModal('tagCategoryModal', mode, entityData || null);
        prepareCategoryForm(mode, entityData);
    }

    async function openTagModal(mode = 'add', tagId = null) {
        if (!window.ModalManagerV2) {
            showError('ModalManagerV2 לא זמין', null);
            return;
        }

        const entityData = tagId
            ? state.tags.find((tag) => Number(tag.id) === Number(tagId)) || null
            : null;

        await window.ModalManagerV2.showModal('tagModal', mode, entityData || null);
        prepareTagForm(mode, entityData);
    }

    function promptDeleteCategory(categoryId) {
        const category = state.categories.find((cat) => Number(cat.id) === Number(categoryId));
        if (!category) {
            showError('קטגוריה לא נמצאה', null);
            return;
        }

        const message = `האם אתה בטוח שברצונך למחוק את הקטגוריה "${category.name}"? כל התגיות המשויכות ימחקו.`;
        if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog('מחיקת קטגוריה', message, async () => {
                try {
                    await window.TagService.deleteCategory(categoryId);
                    await refreshAll();
                    window.showSuccessNotification?.('קטגוריה נמחקה בהצלחה');
                } catch (error) {
                    showError('מחיקת הקטגוריה נכשלה', error);
                }
            });
        } else if (window.confirm(message)) {
            window.TagService.deleteCategory(categoryId)
                .then(refreshAll)
                .then(() => window.showSuccessNotification?.('קטגוריה נמחקה בהצלחה'))
                .catch((error) => showError('מחיקת הקטגוריה נכשלה', error));
        }
    }

    function promptDeleteTag(tagId) {
        const tag = state.tags.find((item) => Number(item.id) === Number(tagId));
        if (!tag) {
            showError('תגית לא נמצאה', null);
            return;
        }

        const message = `האם למחוק את התגית "${tag.name}"? הפעולה תסיר את התגית מכל הישויות.`;
        if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog('מחיקת תגית', message, async () => {
                try {
                    await window.TagService.deleteTag(tagId, { categoryId: tag.category_id || 'all' });
                    await refreshAll();
                    window.showSuccessNotification?.('תגית נמחקה בהצלחה');
                } catch (error) {
                    showError('מחיקת התגית נכשלה', error);
                }
            });
        } else if (window.confirm(message)) {
            window.TagService.deleteTag(tagId, { categoryId: tag.category_id || 'all' })
                .then(refreshAll)
                .then(() => window.showSuccessNotification?.('תגית נמחקה בהצלחה'))
                .catch((error) => showError('מחיקת התגית נכשלה', error));
        }
    }

    async function showTagUsage(tagId) {
        const normalizedId = Number(tagId);
        if (!Number.isFinite(normalizedId)) {
            return;
        }

        try {
            log('Loading tag usage', { tagId: normalizedId });
            const usageData = await window.TagService.getTagUsage(normalizedId);

            const rawEntities = Array.isArray(usageData?.child_entities)
                ? usageData.child_entities
                : [];

            const normalizedEntities = rawEntities.map((entity) => {
                const rawType = (entity.entity_type || entity.type || '').toLowerCase();
                const entityType = rawType || 'entity';
                const entityId = entity.entity_id ?? entity.id;
                return {
                    ...entity,
                    type: entityType,
                    entity_type: entityType,
                    id: entityId,
                    entity_id: entityId,
                    linked_at: entity.linked_at || entity.created_at || null,
                    created_at: entity.created_at || entity.linked_at || null,
                    updated_at: entity.updated_at || entity.linked_at || null,
                };
            });

            const fallbackTagName = state.tags.find((item) => Number(item.id) === normalizedId)?.name;
            const modalPayload = {
                tagId: normalizedId,
                tagName: usageData?.tag?.name || fallbackTagName || `תגית ${normalizedId}`,
                tag: usageData?.tag || null,
                child_entities: normalizedEntities,
                metadata: {
                    source: 'tag-management',
                    tagId: normalizedId,
                    totalEntities: usageData?.total_entities ?? normalizedEntities.length,
                },
            };

            if (normalizedEntities.length === 0) {
                window.showInfoNotification?.('מידע', 'לא נמצאו ישויות המשויכות לתגית הזו');
            }

            if (typeof window.showLinkedItemsModal === 'function') {
                window.showLinkedItemsModal(modalPayload, 'tag', normalizedId, 'view');
            } else {
                log('showLinkedItemsModal not available, falling back to console output', {
                    modalPayload,
                });
            }
        } catch (error) {
            showError('טעינת הישויות המשויכות לתגית נכשלה', error);
        }
    }

    // ----- Modal Save Handlers -----
    function closeTagModal(modalId) {
        if (!modalId) {
            return;
        }

        if (typeof window.closeModal === 'function') {
            try {
                window.closeModal(modalId);
                return;
            } catch (closeError) {
                window.Logger?.warn('⚠️ Global closeModal failed, falling back to Bootstrap instance', {
                    error: closeError,
                    modalId,
                    page: 'tag-management'
                });
            }
        }

        if (window.ModalManagerV2?.getModalInfo) {
            const modalInfo = window.ModalManagerV2.getModalInfo(modalId);
            if (modalInfo?.element) {
                const instance =
                    bootstrap.Modal.getInstance(modalInfo.element) ||
                    bootstrap.Modal.getOrCreateInstance(modalInfo.element);
                instance?.hide();
                return;
            }
        }

        const fallbackElement = document.getElementById(modalId);
        if (fallbackElement) {
            const instance =
                bootstrap.Modal.getInstance(fallbackElement) ||
                bootstrap.Modal.getOrCreateInstance(fallbackElement);
            instance?.hide();
        }
    }

    async function saveTagCategory() {
        const form = document.getElementById('tagCategoryModalForm');
        if (!form) {
            throw new Error('tagCategoryModalForm not found');
        }

        const categoryData = window.DataCollectionService.collectFormData({
            name: { id: 'tagCategoryName', type: 'text' },
            description: { id: 'tagCategoryDescription', type: 'text', default: null },
            order_index: { id: 'tagCategoryOrder', type: 'int', default: 0 },
            is_active: { id: 'tagCategoryActive', type: 'checkbox', default: true }
        });

        const validationConfig = [
            { id: 'tagCategoryName', name: 'שם קטגוריה', rules: { required: true, minLength: 2 } }
        ];

        const result = window.validateEntityForm?.('tagCategoryModalForm', validationConfig);
        if (result && !result.isValid) {
            return;
        }

        const mode = form.dataset.mode || 'add';
        const categoryId = Number(form.dataset.entityId);

        try {
            if (mode === 'edit' && categoryId) {
                await window.TagService.updateCategory(categoryId, categoryData);
                window.showSuccessNotification?.('קטגוריה עודכנה בהצלחה');
            } else {
                await window.TagService.createCategory(categoryData);
                window.showSuccessNotification?.('קטגוריה נוצרה בהצלחה');
            }
            await loadCategories(true);
            await loadTags({ force: true });
            await loadAnalytics(true);
            closeTagModal('tagCategoryModal');
        } catch (error) {
            showError('שמירת הקטגוריה נכשלה', error);
        }
    }

    const TAG_FORM_FIELD_CONFIG = {
        name: { id: 'tagName', type: 'text' },
        category_id: { id: 'tagCategory', type: 'int', default: null },
        description: { id: 'tagDescription', type: 'text', default: null },
        is_active: { id: 'tagActive', type: 'checkbox', default: true }
    };

    const debugState = {
        lastTagSnapshot: null,
        tagSnapshotHistory: []
    };

    function collectTagFormDataWithDebug() {
        const form = document.getElementById('tagModalForm');
        if (!form) {
            throw new Error('tagModalForm not found');
        }

        const collectedData = window.DataCollectionService.collectFormData(TAG_FORM_FIELD_CONFIG);
        const rawFields = Object.entries(TAG_FORM_FIELD_CONFIG).reduce((acc, [key, config]) => {
            const element = document.getElementById(config.id);
            if (!element) {
                acc[key] = {
                    sourceId: config.id,
                    exists: false
                };
                return acc;
            }

            const baseInfo = {
                sourceId: config.id,
                exists: true,
                tagName: element.tagName,
                inputType: element.type || 'text',
                dataset: { ...element.dataset }
            };

            if (element.type === 'checkbox') {
                acc[key] = {
                    ...baseInfo,
                    rawValue: element.checked
                };
            } else if (element.tagName === 'SELECT') {
                const selectedOption = element.options[element.selectedIndex];
                acc[key] = {
                    ...baseInfo,
                    rawValue: element.value,
                    selectedOption: selectedOption
                        ? {
                              value: selectedOption.value,
                              label: selectedOption.textContent?.trim() || ''
                          }
                        : null
                };
            } else {
                acc[key] = {
                    ...baseInfo,
                    rawValue: element.value
                };
            }

            return acc;
        }, {});

        const snapshot = {
            timestamp: new Date().toISOString(),
            mode: form.dataset.mode || 'add',
            entityId: form.dataset.entityId || null,
            collectedData,
            rawFields
        };

        debugState.lastTagSnapshot = snapshot;
        debugState.tagSnapshotHistory.push(snapshot);
        // Keep only last 10 entries
        if (debugState.tagSnapshotHistory.length > 10) {
            debugState.tagSnapshotHistory.shift();
        }

        window.Logger?.info?.(
            '🧪 Tag form snapshot',
            JSON.parse(JSON.stringify(snapshot)),
            { page: 'tag-management' }
        );

        return { collectedData, snapshot };
    }

    async function saveTag() {
        const form = document.getElementById('tagModalForm');
        if (!form) {
            throw new Error('tagModalForm not found');
        }

        const { collectedData: tagData, snapshot: tagSnapshot } = collectTagFormDataWithDebug();

        const validationConfig = [
            { id: 'tagName', name: 'שם תגית', rules: { required: true, minLength: 2 } }
        ];

        const result = window.validateEntityForm?.('tagModalForm', validationConfig);
        if (result && !result.isValid) {
            return;
        }

        const mode = form.dataset.mode || 'add';
        const tagId = Number(form.dataset.entityId);
        const normalizedName = normalizeTagName(tagData.name);

        const duplicateTag = findExistingTagByName(normalizedName, mode === 'edit' ? tagId : null);
        if (duplicateTag) {
            const duplicateMessage = `השם "${duplicateTag.name}" כבר נמצא בשימוש. ניתן לערוך את התגית הקיימת או לבחור שם אחר.`;
            document.getElementById('tagName')?.classList.add('is-invalid');
            window.showErrorNotification?.('שם תגית כבר קיים', duplicateMessage);
            return;
        }

        window.Logger?.info?.('📝 [TagManagement] saveTag request', {
            mode,
            tagId: Number.isFinite(tagId) ? tagId : null,
            tagData,
            snapshotId: tagSnapshot.timestamp
        });

        try {
            let savedTag = null;
            if (mode === 'edit' && tagId) {
                savedTag = await window.TagService.updateTag(tagId, tagData);
                window.showSuccessNotification?.('תגית עודכנה בהצלחה');
            } else {
                savedTag = await window.TagService.createTag(tagData);
                window.showSuccessNotification?.('תגית נוצרה בהצלחה');
            }
            await loadTags({ force: true });
            await loadAnalytics(true);
            window.Logger?.info?.('✅ [TagManagement] saveTag success', {
                mode,
                tagId: savedTag?.id || tagId || 'new',
                categoryId: savedTag?.category_id ?? tagData.category_id ?? null,
                snapshotId: tagSnapshot.timestamp
            });
            closeTagModal('tagModal');
        } catch (error) {
            const message = window.TagService?.formatTagErrorMessage
                ? window.TagService.formatTagErrorMessage('שמירת התגית נכשלה', error)
                : 'שמירת התגית נכשלה';
            window.Logger?.error?.('❌ [TagManagement] saveTag failure', {
                mode,
                tagId: Number.isFinite(tagId) ? tagId : null,
                error: error?.message || error,
                snapshot: tagSnapshot
            });
            showError(message, { error, tagSnapshot });
        }
    }

    async function initialize() {
        if (initialized) {
            return;
        }
        initialized = true;
        registerTables();
        attachEventListeners();
        await refreshAll();
    }

    // Expose public API
    window.TagManagementPage = {
        init: initialize,
        refreshAll,
        refreshAnalytics,
        resetFilters,
        openCategoryModal,
        openTagModal,
        promptDeleteCategory,
        promptDeleteTag,
        saveTagCategory,
        saveTag,
        showTagUsage,
        debugTagFormSnapshot: () => {
            if (debugState.lastTagSnapshot) {
                console.table(debugState.lastTagSnapshot.rawFields, ['sourceId', 'rawValue', 'inputType']);
            } else {
                window.Logger?.warn?.('No tag snapshot captured yet', { page: 'tag-management' });
            }
            return debugState.lastTagSnapshot;
        },
        getTagSnapshotHistory: () => [...debugState.tagSnapshotHistory]
    };

    document.addEventListener('DOMContentLoaded', () => {
        initialize().catch((error) => showError('שגיאה בטעינת עמוד ניהול תגיות', error));
    });
})();

