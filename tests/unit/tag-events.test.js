const path = require('path');

const MODULE_PATH = path.resolve(__dirname, '../../trading-ui/scripts/tag-events.js');

describe('TagEvents', () => {
    let listeners;
    let addListenerSpy;
    let removeListenerSpy;
    let dispatchSpy;

    beforeEach(() => {
        jest.resetModules();
        listeners = new Map();
        addListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation((type, handler) => {
            listeners.set(type, handler);
        });
        removeListenerSpy = jest.spyOn(window, 'removeEventListener').mockImplementation((type) => {
            listeners.delete(type);
        });
        dispatchSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation((event) => {
            const handler = listeners.get(event.type);
            if (handler) {
                handler(event);
            }
            return true;
        });

        delete require.cache[MODULE_PATH];
        // eslint-disable-next-line global-require, import/no-dynamic-require
        require(MODULE_PATH);
    });

    afterEach(() => {
        addListenerSpy.mockRestore();
        removeListenerSpy.mockRestore();
        dispatchSpy.mockRestore();
    });

    test('emitEntityTagsUpdated triggers CustomEvent with detail', () => {
        const handler = jest.fn();
        const unsubscribe = window.TagEvents.onEntityTagsUpdated(handler);

        window.TagEvents.emitEntityTagsUpdated({ entityType: 'trade', entityId: 7, tagIds: [1, 2], action: 'replace' });

        expect(dispatchSpy).toHaveBeenCalled();
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
            detail: expect.objectContaining({
                entityType: 'trade',
                entityId: 7,
                tagIds: [1, 2],
                action: 'replace'
            })
        }));

        unsubscribe();
        expect(window.removeEventListener).toHaveBeenCalled();
    });

    test('emitInitialized propagates analytics payload', () => {
        const analyticsHandler = jest.fn();
        window.TagEvents.onInitialized(analyticsHandler);

        const payload = { source: 'analytics', totals: { tags: 12 } };
        window.TagEvents.emitInitialized(payload);

        expect(dispatchSpy).toHaveBeenCalled();
        expect(analyticsHandler).toHaveBeenCalledWith(expect.objectContaining({
            detail: expect.objectContaining(payload)
        }));
    });

    test('category listeners can unsubscribe and receive payload', () => {
        const handler = jest.fn();
        const unsubscribe = window.TagEvents.onCategoryUpdated(handler);

        window.TagEvents.emitCategoryUpdated({ categoryId: 3, mode: 'bulk' });
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
            detail: expect.objectContaining({ categoryId: 3, mode: 'bulk' })
        }));

        unsubscribe();
        expect(window.removeEventListener).toHaveBeenCalledWith('tag-manager:category-updated', expect.any(Function));
    });

    test('emitTagUpdated injects triggeredAt timestamp when detail missing', () => {
        const handler = jest.fn();
        window.TagEvents.onTagUpdated(handler);

        window.TagEvents.emitTagUpdated();

        const event = handler.mock.calls[0][0];
        expect(event.type).toBe('tag-manager:tag-updated');
        expect(event.detail.triggeredAt).toBeDefined();
        expect(() => new Date(event.detail.triggeredAt).toISOString()).not.toThrow();
        expect(event.detail.id).toBeUndefined();
    });
});

