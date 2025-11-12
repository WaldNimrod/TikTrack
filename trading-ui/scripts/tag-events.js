/**
 * Tag Events Utility - TikTrack
 * ============================
 *
 * Lightweight pub/sub helper for tag operations. Emits custom events so pages,
 * tables and analytics components can react to tag changes without tight
 * coupling.
 *
 * Events:
 * - tag-manager:initialized
 * - tag-manager:category-updated
 * - tag-manager:tag-updated
 * - tag-manager:entity-tags-updated
 */

(function tagEventsFactory() {
    const EVENT_PREFIX = 'tag-manager';

    function emit(name, detail = {}) {
        const eventName = `${EVENT_PREFIX}:${name}`;
        const eventDetail = {
            triggeredAt: new Date().toISOString(),
            ...detail
        };
        window.dispatchEvent(new CustomEvent(eventName, { detail: eventDetail }));
    }

    function on(name, listener) {
        const eventName = `${EVENT_PREFIX}:${name}`;
        window.addEventListener(eventName, listener);
        return () => window.removeEventListener(eventName, listener);
    }

    const TagEvents = {
        emitInitialized(detail = {}) {
            emit('initialized', detail);
        },
        emitCategoryUpdated(detail) {
            emit('category-updated', detail);
        },
        emitTagUpdated(detail) {
            emit('tag-updated', detail);
        },
        emitEntityTagsUpdated(detail) {
            emit('entity-tags-updated', detail);
        },
        onInitialized(listener) {
            return on('initialized', listener);
        },
        onCategoryUpdated(listener) {
            return on('category-updated', listener);
        },
        onTagUpdated(listener) {
            return on('tag-updated', listener);
        },
        onEntityTagsUpdated(listener) {
            return on('entity-tags-updated', listener);
        }
    };

    window.TagEvents = TagEvents;
})();


