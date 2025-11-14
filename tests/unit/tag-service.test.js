const path = require('path');

const TAG_SERVICE_PATH = path.resolve(__dirname, '../../trading-ui/scripts/services/tag-service.js');

function loadTagService() {
    delete require.cache[TAG_SERVICE_PATH];
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(TAG_SERVICE_PATH);
    return global.window.TagService;
}

describe('TagService', () => {
    beforeEach(() => {
        jest.resetModules();
        global.fetch = jest.fn();
        global.window = {
            UnifiedCacheManager: {
                get: jest.fn().mockResolvedValue(null),
                save: jest.fn().mockResolvedValue(undefined),
                remove: jest.fn().mockResolvedValue(undefined)
            },
            Logger: {
                warn: jest.fn(),
                error: jest.fn()
            },
            TagEvents: {
                emitCategoryUpdated: jest.fn(),
                emitTagUpdated: jest.fn(),
                emitEntityTagsUpdated: jest.fn(),
                emitInitialized: jest.fn()
            }
        };
    });

    test('getTagCloudData uses cache before network call', async () => {
        const cached = [{ tag_id: 1, name: 'Breakout' }];
        window.UnifiedCacheManager.get.mockResolvedValueOnce(cached);

        const TagService = loadTagService();
        const result = await TagService.getTagCloudData();

        expect(global.fetch).not.toHaveBeenCalled();
        expect(result).toEqual(cached);
    });

    test('getTagCloudData fetches and caches when forced', async () => {
        const cloud = [{ tag_id: 2, name: 'Momentum' }];
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: cloud })
        });

        const TagService = loadTagService();
        const result = await TagService.getTagCloudData({ force: true, limit: 10 });

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/cloud?limit=10',
            expect.objectContaining({ credentials: 'same-origin' })
        );
        expect(window.UnifiedCacheManager.save).toHaveBeenCalledWith(
            'tags:cloud',
            cloud,
            expect.any(Object)
        );
        expect(result).toEqual(cloud);
    });

    test('searchTags enforces minimum query length on client side', async () => {
        const TagService = loadTagService();
        await expect(TagService.searchTags({ query: 'א' })).rejects.toThrow('לפחות שני תווים');
    });

    test('getSmartSuggestions fetches data and caches per entity', async () => {
        const payload = { top_entity_tags: [{ tag_id: 1, name: 'Breakout' }] };
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: payload })
        });

        const TagService = loadTagService();
        const result = await TagService.getSmartSuggestions({ entityType: 'trade', entityId: 7, force: true });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/tags/aggregations/suggestions?entity_type=trade&entity_id=7&limit=6'),
            expect.objectContaining({ credentials: 'same-origin' })
        );
        expect(window.UnifiedCacheManager.save).toHaveBeenCalledWith(
            'tags:smart:trade:7',
            payload,
            expect.any(Object)
        );
        expect(result).toEqual(payload);
    });

    test('replaceEntityTags invalidates caches and emits update event', async () => {
        const payload = { assigned: [5, 6] };
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: payload })
        });

        const TagService = loadTagService();
        if (!window.TagEvents) {
            window.TagEvents = {
                emitCategoryUpdated: jest.fn(),
                emitTagUpdated: jest.fn(),
                emitEntityTagsUpdated: jest.fn(),
                emitInitialized: jest.fn()
            };
        }
        const result = await TagService.replaceEntityTags('trade', 42, [5, 6]);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/assign',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ entity_type: 'trade', entity_id: 42, tag_ids: [5, 6] })
            })
        );

        const removedKeys = window.UnifiedCacheManager.remove.mock.calls.map(([key]) => key);
        expect(removedKeys).toEqual(expect.arrayContaining([
            'tags:entity:trade:42',
            'tags:list:all',
            'tags:suggestions:all',
            'tags:suggestions:trade',
            'tags:cloud',
            'tags:smart:all:all',
            'tags:smart:trade:42',
            'tags:analytics'
        ]));

        expect(window.TagEvents.emitEntityTagsUpdated).toHaveBeenCalledWith({
            entityType: 'trade',
            entityId: 42,
            tagIds: [5, 6],
            action: 'replace'
        });
        expect(result).toEqual(payload);
    });

    test('loadEntityTags returns cached value when available', async () => {
        const cached = [{ id: 1, name: 'swing' }];
        window.UnifiedCacheManager.get.mockResolvedValueOnce(cached);

        const TagService = loadTagService();
        const result = await TagService.loadEntityTags('trade', 99);

        expect(global.fetch).not.toHaveBeenCalled();
        expect(result).toEqual(cached);
    });

    test('getSuggestions caches results when fetched', async () => {
        const suggestions = [{ id: 10, name: 'momentum' }];
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: suggestions })
        });

        const TagService = loadTagService();
        const result = await TagService.getSuggestions({ entityType: 'trade', force: true });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/tags/suggestions?entity_type=trade'),
            expect.objectContaining({ credentials: 'same-origin' })
        );
        expect(window.UnifiedCacheManager.save).toHaveBeenCalledWith(
            'tags:suggestions:trade',
            suggestions,
            expect.any(Object)
        );
        expect(result).toEqual(suggestions);
    });

    test('requestJSON throws descriptive error on failure', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ error: { message: 'Server exploded' } })
        });

        const TagService = loadTagService();

        await expect(TagService.fetchCategories()).rejects.toThrow('Server exploded');
    });

    test('loadEntityTags with force fetches fresh data and caches it', async () => {
        const payload = [{ id: 3, name: 'swing' }];
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: payload })
        });

        const TagService = loadTagService();
        const result = await TagService.loadEntityTags('trade', 5, { force: true });

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/entity/trade/5',
            expect.objectContaining({ credentials: 'same-origin' })
        );
        expect(window.UnifiedCacheManager.save).toHaveBeenCalledWith(
            'tags:entity:trade:5',
            payload,
            expect.any(Object)
        );
        expect(result).toEqual(payload);
    });

    test('setCached failure logs warning without throwing', async () => {
        window.UnifiedCacheManager.save.mockRejectedValueOnce(new Error('cache-failure'));
        const warnSpy = jest.spyOn(window.Logger, 'warn');

        const TagService = loadTagService();
        const suggestions = [{ id: 11, name: 'macro' }];
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: suggestions })
        });

        await expect(
            TagService.getSuggestions({ entityType: 'alert', force: true })
        ).resolves.toEqual(suggestions);

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('⚠️ Failed to cache tag data'),
            expect.objectContaining({ key: 'tags:suggestions:alert' })
        );
    });

    test('removeTagFromEntity invalidates caches and emits remove event', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: true })
        });

        const TagService = loadTagService();
        if (!window.TagEvents) {
            window.TagEvents = {
                emitCategoryUpdated: jest.fn(),
                emitTagUpdated: jest.fn(),
                emitEntityTagsUpdated: jest.fn(),
                emitInitialized: jest.fn()
            };
        }

        await TagService.removeTagFromEntity(9, 'trade', 13);

        const removedKeys = window.UnifiedCacheManager.remove.mock.calls.map(([key]) => key);
        expect(removedKeys).toEqual(expect.arrayContaining([
            'tags:entity:trade:13',
            'tags:list:all',
            'tags:suggestions:all',
            'tags:suggestions:trade',
            'tags:cloud',
            'tags:smart:all:all',
            'tags:smart:trade:13',
            'tags:analytics'
        ]));

        expect(window.TagEvents.emitEntityTagsUpdated).toHaveBeenCalledWith({
            entityType: 'trade',
            entityId: 13,
            tagId: 9,
            action: 'remove'
        });
    });

    test('clearCache removes global tag datasets', async () => {
        const TagService = loadTagService();

        await TagService.clearCache();

        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:categories');
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:list:all');
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:analytics');
    });

    test('getSuggestions returns cached value without fetch when available', async () => {
        const cached = [{ id: 21, name: 'intraday' }];
        window.UnifiedCacheManager.get.mockResolvedValueOnce(cached);

        const TagService = loadTagService();
        const result = await TagService.getSuggestions({ entityType: 'trade', force: false });

        expect(global.fetch).not.toHaveBeenCalled();
        expect(result).toEqual(cached);
    });

    test('getAnalytics returns cached dataset when present', async () => {
        const cachedAnalytics = { totals: { tags: 100 } };
        window.UnifiedCacheManager.get.mockResolvedValueOnce(cachedAnalytics);

        const TagService = loadTagService();
        const result = await TagService.getAnalytics();

        expect(global.fetch).not.toHaveBeenCalled();
        expect(result).toEqual(cachedAnalytics);
    });

    test('removeCached failure warns gracefully', async () => {
        window.UnifiedCacheManager.remove.mockRejectedValueOnce(new Error('remove-failure'));
        const warnSpy = jest.spyOn(window.Logger, 'warn');

        const TagService = loadTagService();
        await TagService.invalidateEntity('trade', 1);

        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('⚠️ Failed to remove tag cache entry'),
            expect.objectContaining({ key: 'tags:entity:trade:1' })
        );
    });

    test('fetchCategories uses cache before network and caches fetched data', async () => {
        const cachedCategories = [{ id: 1, name: 'Strategy' }];
        window.UnifiedCacheManager.get.mockResolvedValueOnce(cachedCategories);

        let TagService = loadTagService();
        const fromCache = await TagService.fetchCategories();
        expect(global.fetch).not.toHaveBeenCalled();
        expect(fromCache).toEqual(cachedCategories);

        window.UnifiedCacheManager.get.mockResolvedValueOnce(null);
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: cachedCategories })
        });

        TagService = loadTagService();
        const fresh = await TagService.fetchCategories({ force: true });
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/categories',
            expect.objectContaining({ credentials: 'same-origin' })
        );
        expect(window.UnifiedCacheManager.save).toHaveBeenCalledWith(
            'tags:categories',
            cachedCategories,
            expect.any(Object)
        );
        expect(fresh).toEqual(cachedCategories);
    });

    test('fetchTags builds query parameters and caches response', async () => {
        const tagsPayload = [{ id: 10, name: 'Momentum' }];
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: tagsPayload })
        });

        const TagService = loadTagService();
        const result = await TagService.fetchTags({ categoryId: 99, includeInactive: true, force: true });

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/?category_id=99&include_inactive=true',
            expect.objectContaining({ credentials: 'same-origin' })
        );
        expect(window.UnifiedCacheManager.save).toHaveBeenCalledWith(
            'tags:list:99',
            tagsPayload,
            expect.any(Object)
        );
        expect(result).toEqual(tagsPayload);
    });

    test('createCategory invalidates caches and emits update event', async () => {
        const category = { id: 5, name: 'Strategies' };
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: category })
        });

        const TagService = loadTagService();
        const created = await TagService.createCategory(category);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/categories',
            expect.objectContaining({ method: 'POST', body: JSON.stringify(category) })
        );
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:categories');
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:analytics');
        expect(window.TagEvents.emitCategoryUpdated).toHaveBeenCalledWith({ action: 'create', category });
        expect(created).toEqual(category);
    });

    test('updateCategory invalidates caches and emits update event', async () => {
        const category = { id: 7, name: 'Risk' };
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: category })
        });

        const TagService = loadTagService();
        const updated = await TagService.updateCategory(7, category);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/categories/7',
            expect.objectContaining({ method: 'PUT', body: JSON.stringify(category) })
        );
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:categories');
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:analytics');
        expect(window.TagEvents.emitCategoryUpdated).toHaveBeenCalledWith({ action: 'update', category });
        expect(updated).toEqual(category);
    });

    test('deleteCategory invalidates caches and emits delete event', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: true })
        });

        const TagService = loadTagService();
        await TagService.deleteCategory(4);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/categories/4',
            expect.objectContaining({ method: 'DELETE' })
        );
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:categories');
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:list:4');
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:analytics');
        expect(window.TagEvents.emitCategoryUpdated).toHaveBeenCalledWith({ action: 'delete', categoryId: 4 });
    });
    test('createTag invalidates tag cache and emits tag update event', async () => {
        const tag = { id: 12, name: 'Breakout', category_id: 3 };
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: tag })
        });

        const TagService = loadTagService();
        const created = await TagService.createTag(tag);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/',
            expect.objectContaining({ method: 'POST', body: JSON.stringify(tag) })
        );
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:list:3');
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:analytics');
        expect(window.TagEvents.emitTagUpdated).toHaveBeenCalledWith({ action: 'create', tag });
        expect(created).toEqual(tag);
    });

    test('updateTag invalidates relevant caches and emits update event', async () => {
        const tag = { id: 14, name: 'Mean Reversion', category_id: 8 };
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: tag })
        });

        const TagService = loadTagService();
        const updated = await TagService.updateTag(14, tag);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/14',
            expect.objectContaining({ method: 'PUT', body: JSON.stringify(tag) })
        );
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:list:8');
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:analytics');
        expect(window.TagEvents.emitTagUpdated).toHaveBeenCalledWith({ action: 'update', tagId: 14, tag });
        expect(updated).toEqual(tag);
    });

    test('deleteTag invalidates caches and emits delete event', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: true })
        });

        const TagService = loadTagService();
        await TagService.deleteTag(15, { categoryId: 11 });

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/15',
            expect.objectContaining({ method: 'DELETE' })
        );
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:list:11');
        expect(window.UnifiedCacheManager.remove).toHaveBeenCalledWith('tags:analytics');
        expect(window.TagEvents.emitTagUpdated).toHaveBeenCalledWith({ action: 'delete', tagId: 15, categoryId: 11 });
    });

    test('getAnalytics fetches data when cache empty and emits initialized event', async () => {
        window.UnifiedCacheManager.get.mockResolvedValueOnce(null);
        const analytics = { totals: { trades: 5 } };
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ data: analytics })
        });

        const TagService = loadTagService();
        const result = await TagService.getAnalytics(true);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/tags/analytics',
            expect.objectContaining({ credentials: 'same-origin' })
        );
        expect(window.UnifiedCacheManager.save).toHaveBeenCalledWith(
            'tags:analytics',
            analytics,
            expect.any(Object)
        );
        expect(window.TagEvents.emitInitialized).toHaveBeenCalledWith({ source: 'analytics', analytics });
        expect(result).toEqual(analytics);
    });
});

