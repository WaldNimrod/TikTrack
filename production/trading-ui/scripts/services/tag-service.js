/**
 * Tag Service - TikTrack
 * ======================
 *
 * Unified client for the Tag API. Handles CRUD for categories and tags,
 * assignment, suggestions, caching and invalidation routines.
 *
 * Related Documentation:
 * - documentation/03-DEVELOPMENT/TAGGING_SYSTEM_SPEC.md
 * - documentation/03-DEVELOPMENT/GUIDES/TAG_SERVICE_DEVELOPER_GUIDE.md
 *
 * Function Index:
 * - fetchCategories, createCategory, updateCategory, deleteCategory
     * - fetchTags, createTag, updateTag, deleteTag
     * - loadEntityTags, replaceEntityTags, removeTagFromEntity
     * - getSuggestions, getTagCloudData, searchTags, getSmartSuggestions
     * - invalidateEntity, clearCache
 */

(function tagServiceFactory() {
    const API_BASE = '/api/tags';
    const CACHE_KEYS = {
        categories: 'tags:categories',
        analytics: 'tags:analytics',
        tags: (categoryId = 'all') => `tags:list:${categoryId}`,
        entity: (entityType, entityId) => `tags:entity:${entityType}:${entityId}`,
        suggestions: (entityType = 'all') => `tags:suggestions:${entityType}`,
        cloud: 'tags:cloud',
        smartSuggestions: (entityType = 'all', entityId = 'all') => `tags:smart:${entityType}:${entityId}`
    };
    const SEARCH_CACHE = new Map();
    const SEARCH_CACHE_TTL = 60 * 1000;

    /**
     * Generic fetch helper with unified error handling.
     * @param {string} url - URL path
     * @param {RequestInit} options - fetch options
     * @returns {Promise<any>} - Parsed JSON payload
     */
    async function requestJSON(url, options = {}) {
        const response = await fetch(url, {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            ...options
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            const message = payload?.error?.message || `TagService request failed (${response.status})`;
            throw new Error(message);
        }
        return payload?.data ?? payload;
    }

    /**
     * Retrieve cached value if UnifiedCacheManager is available.
     * @param {string} key
     * @returns {Promise<any>|null}
     */
    function getCached(key) {
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.get === 'function') {
            return window.UnifiedCacheManager.get(key);
        }
        return null;
    }

    /**
     * Store value in cache if supported.
     * @param {string} key
     * @param {any} value
     */
    async function setCached(key, value) {
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.save === 'function') {
            try {
                await window.UnifiedCacheManager.save(key, value, { layer: 'memory', ttl: 5 * 60 * 1000 });
            } catch (error) {
                window.Logger?.warn('⚠️ Failed to cache tag data', { key, error, page: 'tag-service' });
            }
        }
    }

    /**
     * Remove cache entry if supported.
     * @param {string} key
     */
    async function removeCached(key) {
        if (window.UnifiedCacheManager && typeof window.UnifiedCacheManager.remove === 'function') {
            try {
                await window.UnifiedCacheManager.remove(key);
            } catch (error) {
                window.Logger?.warn('⚠️ Failed to remove tag cache entry', { key, error, page: 'tag-service' });
            }
        }
    }

    /**
     * Fetch categories with optional force refresh.
     * @param {{ force?: boolean }} [options]
     * @returns {Promise<Array>}
     */
    async function fetchCategories(options = {}) {
        const cacheKey = CACHE_KEYS.categories;
        if (!options.force) {
            const cached = await getCached(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const categories = await requestJSON(`${API_BASE}/categories`);
        await setCached(cacheKey, categories);
        return categories;
    }

    /**
     * Create category and invalidate cache.
     * @param {Object} payload
     * @returns {Promise<Object>}
     */
    async function createCategory(payload) {
        const category = await requestJSON(`${API_BASE}/categories`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        await removeCached(CACHE_KEYS.categories);
        await removeCached(CACHE_KEYS.analytics);
        window.TagEvents?.emitCategoryUpdated({ action: 'create', category });
        return category;
    }

    /**
     * Update category.
     * @param {number} categoryId
     * @param {Object} payload
     * @returns {Promise<Object>}
     */
    async function updateCategory(categoryId, payload) {
        const category = await requestJSON(`${API_BASE}/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        await removeCached(CACHE_KEYS.categories);
        await removeCached(CACHE_KEYS.analytics);
        window.TagEvents?.emitCategoryUpdated({ action: 'update', category });
        return category;
    }

    /**
     * Delete category and related cache entries.
     * @param {number} categoryId
     * @returns {Promise<boolean>}
     */
    async function deleteCategory(categoryId) {
        await requestJSON(`${API_BASE}/categories/${categoryId}`, { method: 'DELETE' });
        await removeCached(CACHE_KEYS.categories);
        await removeCached(CACHE_KEYS.tags(categoryId));
        await removeCached(CACHE_KEYS.analytics);
        window.TagEvents?.emitCategoryUpdated({ action: 'delete', categoryId });
        return true;
    }

    /**
     * Fetch tags for user.
     * @param {{ categoryId?: number|null, includeInactive?: boolean, force?: boolean }} [options]
     * @returns {Promise<Array>}
     */
    async function fetchTags(options = {}) {
        const { categoryId = null, includeInactive = false, force = false } = options;
        const cacheKey = CACHE_KEYS.tags(categoryId ?? 'all');

        if (!force) {
            const cached = await getCached(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const params = new URLSearchParams();
        if (categoryId !== null && categoryId !== undefined) {
            params.set('category_id', String(categoryId));
        }
        if (includeInactive) {
            params.set('include_inactive', 'true');
        }

        const tags = await requestJSON(`${API_BASE}/?${params.toString()}`);
        await setCached(cacheKey, tags);
        return tags;
    }

    async function createTag(payload) {
        const tag = await requestJSON(`${API_BASE}/`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        await removeCached(CACHE_KEYS.tags(payload.category_id ?? 'all'));
        await removeCached(CACHE_KEYS.analytics);
        window.TagEvents?.emitTagUpdated({ action: 'create', tag });
        return tag;
    }

    async function updateTag(tagId, payload) {
        const tag = await requestJSON(`${API_BASE}/${tagId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });
        await removeCached(CACHE_KEYS.tags(payload.category_id ?? 'all'));
        await removeCached(CACHE_KEYS.analytics);
        window.TagEvents?.emitTagUpdated({ action: 'update', tagId, tag });
        return tag;
    }

    async function deleteTag(tagId, { categoryId = 'all' } = {}) {
        await requestJSON(`${API_BASE}/${tagId}`, { method: 'DELETE' });
        await removeCached(CACHE_KEYS.tags(categoryId));
        await removeCached(CACHE_KEYS.analytics);
        window.TagEvents?.emitTagUpdated({ action: 'delete', tagId, categoryId });
        return true;
    }

    async function loadEntityTags(entityType, entityId, { force = false } = {}) {
        const cacheKey = CACHE_KEYS.entity(entityType, entityId);
        if (!force) {
            const cached = await getCached(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const tags = await requestJSON(`${API_BASE}/entity/${entityType}/${entityId}`);
        await setCached(cacheKey, tags);
        return tags;
    }

    function normalizeTagIds(tagIds) {
        if (!Array.isArray(tagIds)) {
            return [];
        }
        return tagIds
            .map((value) => {
                if (typeof value === 'number') {
                    return Number.isFinite(value) ? value : NaN;
                }
                if (typeof value === 'string' && value.trim() !== '') {
                    const parsed = Number.parseInt(value, 10);
                    return Number.isNaN(parsed) ? NaN : parsed;
                }
                return NaN;
            })
            .filter(Number.isFinite);
    }

    function formatTagErrorMessage(defaultMessage, error) {
        const message = error?.message;
        if (typeof message === 'string' && message.trim().length > 0) {
            return `${defaultMessage} (${message.trim()})`;
        }
        return defaultMessage;
    }

    async function replaceEntityTags(entityType, entityId, tagIds) {
        const normalizedTagIds = normalizeTagIds(tagIds);
        const result = await requestJSON(`${API_BASE}/assign`, {
            method: 'POST',
            body: JSON.stringify({
                entity_type: entityType,
                entity_id: entityId,
                tag_ids: normalizedTagIds
            })
        });
        await invalidateEntity(entityType, entityId);
        window.TagEvents?.emitEntityTagsUpdated({
            entityType,
            entityId,
            tagIds: normalizedTagIds,
            action: 'replace'
        });
        return result;
    }

    async function removeTagFromEntity(tagId, entityType, entityId) {
        const sanitizedTagId = Number.parseInt(tagId, 10);
        if (!Number.isFinite(sanitizedTagId)) {
            throw new Error('Tag ID must be an integer');
        }
        await requestJSON(`${API_BASE}/remove`, {
            method: 'POST',
            body: JSON.stringify({
                tag_id: sanitizedTagId,
                entity_type: entityType,
                entity_id: entityId
            })
        });
        await invalidateEntity(entityType, entityId);
        window.TagEvents?.emitEntityTagsUpdated({
            entityType,
            entityId,
            tagId: sanitizedTagId,
            action: 'remove'
        });
        return true;
    }

    async function getSuggestions({ entityType = null, force = false, limit = 10 } = {}) {
        const cacheKey = CACHE_KEYS.suggestions(entityType ?? 'all');
        if (!force) {
            const cached = await getCached(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const params = new URLSearchParams();
        if (entityType) {
            params.set('entity_type', entityType);
        }
        if (limit) {
            params.set('limit', String(limit));
        }

        const suggestions = await requestJSON(`${API_BASE}/suggestions?${params.toString()}`);
        await setCached(cacheKey, suggestions);
        return suggestions;
    }

    async function getTagUsage(tagId, { limit = null, signal } = {}) {
        const normalizedId = Number.parseInt(tagId, 10);
        if (!Number.isFinite(normalizedId)) {
            throw new Error('Tag ID must be an integer');
        }

        const params = new URLSearchParams();
        if (limit && Number.isFinite(Number(limit))) {
            params.set('limit', String(limit));
        }

        const queryString = params.toString();
        const endpoint = `${API_BASE}/${normalizedId}/usage${queryString ? `?${queryString}` : ''}`;

        return requestJSON(endpoint, { signal });
    }

    async function getAnalytics(force = false) {
        const cacheKey = CACHE_KEYS.analytics;
        if (!force) {
            const cached = await getCached(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const analytics = await requestJSON(`${API_BASE}/analytics`);
        await setCached(cacheKey, analytics);
        window.TagEvents?.emitInitialized({ source: 'analytics', analytics });
        return analytics;
    }

    async function getTagCloudData({ force = false, limit = 50 } = {}) {
        const cacheKey = CACHE_KEYS.cloud;
        if (!force) {
            const cached = await getCached(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const params = new URLSearchParams();
        if (limit) {
            params.set('limit', String(limit));
        }

        const data = await requestJSON(`${API_BASE}/cloud?${params.toString()}`);
        await setCached(cacheKey, data);
        return data;
    }

    async function searchTags({ query, entityType = null, limit = 25, includeInactive = false } = {}) {
        const sanitized = (query || '').trim();
        if (sanitized.length < 2) {
            throw new Error('יש להזין לפחות שני תווים לחיפוש תגיות');
        }

        const cacheKey = `search:${sanitized}:${entityType ?? 'all'}:${limit}:${includeInactive ? '1' : '0'}`;
        const now = Date.now();
        const cachedEntry = SEARCH_CACHE.get(cacheKey);
        if (cachedEntry && now - cachedEntry.timestamp < SEARCH_CACHE_TTL) {
            return cachedEntry.data;
        }

        const params = new URLSearchParams({ query: sanitized });
        if (entityType) {
            params.set('entity_type', entityType);
        }
        if (limit) {
            params.set('limit', String(limit));
        }
        if (includeInactive) {
            params.set('include_inactive', 'true');
        }

        const data = await requestJSON(`${API_BASE}/search?${params.toString()}`);
        SEARCH_CACHE.set(cacheKey, { data, timestamp: now });
        return data;
    }

    async function getSmartSuggestions({ entityType = null, entityId = null, limit = 6, force = false } = {}) {
        const cacheKey = CACHE_KEYS.smartSuggestions(entityType ?? 'all', entityId ?? 'all');
        if (!force) {
            const cached = await getCached(cacheKey);
            if (cached) {
                return cached;
            }
        }

        const params = new URLSearchParams();
        if (entityType) {
            params.set('entity_type', entityType);
        }
        if (entityId) {
            params.set('entity_id', String(entityId));
        }
        if (limit) {
            params.set('limit', String(limit));
        }

        const data = await requestJSON(`${API_BASE}/aggregations/suggestions?${params.toString()}`);
        await setCached(cacheKey, data);
        return data;
    }

    async function invalidateEntity(entityType, entityId) {
        await removeCached(CACHE_KEYS.entity(entityType, entityId));
        await removeCached(CACHE_KEYS.tags('all'));
        await removeCached(CACHE_KEYS.suggestions('all'));
        await removeCached(CACHE_KEYS.suggestions(entityType));
        await removeCached(CACHE_KEYS.cloud);
        await removeCached(CACHE_KEYS.smartSuggestions('all', 'all'));
        await removeCached(CACHE_KEYS.smartSuggestions(entityType || 'all', entityId || 'all'));
        SEARCH_CACHE.clear();
        await removeCached(CACHE_KEYS.analytics);
    }

    async function clearCache() {
        await removeCached(CACHE_KEYS.categories);
        await removeCached(CACHE_KEYS.tags('all'));
        await removeCached(CACHE_KEYS.analytics);
    }

    window.TagService = {
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        fetchTags,
        createTag,
        updateTag,
        deleteTag,
        loadEntityTags,
        replaceEntityTags,
        removeTagFromEntity,
        getSuggestions,
        getSmartSuggestions,
        getTagUsage,
        getAnalytics,
        getTagCloudData,
        searchTags,
        invalidateEntity,
        clearCache,
        normalizeTagIds,
        formatTagErrorMessage
    };
})();

