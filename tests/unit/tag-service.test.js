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
        expect(removedKeys).toEqual(
            expect.arrayContaining([
                'tags:entity:trade:42',
                'tags:list:all',
                'tags:suggestions:all',
                'tags:suggestions:trade'
            ])
        );

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
        expect(removedKeys).toEqual(
            expect.arrayContaining([
                'tags:entity:trade:13',
                'tags:list:all',
                'tags:suggestions:all',
                'tags:suggestions:trade'
            ])
        );

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
});

