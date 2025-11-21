/**
 * Cache Control Menu (Stage B-Lite)
 * Documentation: documentation/03-DEVELOPMENT/CACHE_STAGE_B_LITE.md
 * Function Index:
 * 1. Configuration & Helpers
 * 2. DOM Integration
 * 3. Public API (initialize, triggerAction, registerButton, logAction)
 */

(() => {
    'use strict';

    const MODULE_NAME = 'CacheControlMenu';
    const VERSION = '2.2.0';
    const DEFAULT_OPTIONS = {
        autoAttachHeader: true,
        logEndpoint: '/api/cache/log',
        logEnabled: true,
        defaultSource: 'header-menu',
        headerActionsOrder: ['memory', 'local-storage', 'indexeddb', 'full'],
        headerMenuSelector: '.tiktrack-nav-item .submenu'
    };

    const logger = (() => {
        const base = window.Logger || console;
        return {
            info: (msg, payload) => base?.info?.(msg, payload, { page: MODULE_NAME }) ?? console.info(msg, payload),
            warn: (msg, payload) => base?.warn?.(msg, payload, { page: MODULE_NAME }) ?? console.warn(msg, payload),
            error: (msg, payload) => base?.error?.(msg, payload, { page: MODULE_NAME }) ?? console.error(msg, payload),
            debug: (msg, payload) => base?.debug?.(msg, payload, { page: MODULE_NAME }) ?? console.debug(msg, payload)
        };
    })();

    function getCacheManager() {
        return window.UnifiedCacheManager || window.unifiedCacheManager || null;
    }

    function notify(type, title, message, duration = 4000, category = 'system') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type, title, duration, category);
            return;
        }

        if (type === 'success' && typeof window.showSuccessNotification === 'function') {
            window.showSuccessNotification(title || message, message, duration, category);
            return;
        }

        if (type === 'error' && typeof window.showErrorNotification === 'function') {
            window.showErrorNotification(title || message, message, duration, category);
            return;
        }

        const logFn = type === 'error' ? logger.error : logger.info;
        logFn(`${title ? `${title}: ` : ''}${message}`);
    }

    async function clearMemoryLayer(source) {
        const manager = getCacheManager();
        if (manager?.clear) {
            await manager.clear('memory', { source });
            return;
        }

        if (manager?.memoryCache) {
            manager.memoryCache = {};
        }
    }

    async function clearLocalStorageLayer(source) {
        const manager = getCacheManager();
        if (manager?.clear) {
            await manager.clear('localStorage', { source });
        } else {
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith('tiktrack_')) {
                    localStorage.removeItem(key);
                }
            });
        }

        sessionStorage.removeItem('tiktrack_cache_validation_results');
    }

    async function clearIndexedDbLayer(source) {
        const manager = getCacheManager();
        if (manager?.clear) {
            await manager.clear('indexedDB', { source });
            return;
        }

        if (window.indexedDB) {
            try {
                await new Promise((resolve, reject) => {
                    const request = indexedDB.deleteDatabase('UnifiedCacheDB');
                    request.onerror = () => reject(request.error);
                    request.onsuccess = () => resolve(true);
                    request.onblocked = () => resolve(true);
                });
            } catch (error) {
                logger.warn('⚠️ IndexedDB fallback delete failed', { error: error?.message });
            }
        }
    }

    async function runFullClear(context) {
        const manager = getCacheManager();
        const extendedOptions = {
            source: context.source,
            autoRefresh: context.autoRefresh !== false,
            hardReload: context.hardReload !== false
        };

        if (typeof window.clearCacheComplete === 'function') {
            await window.clearCacheComplete(context.event);
            return extendedOptions;
        }

        if (manager?.clearAllCacheDetailed) {
            await manager.clearAllCacheDetailed(extendedOptions);
            return extendedOptions;
        }

        // Fallback: clear layers manually and reload
        await clearMemoryLayer(context.source);
        await clearLocalStorageLayer(context.source);
        await clearIndexedDbLayer(context.source);

        if (extendedOptions.autoRefresh) {
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }

        return extendedOptions;
    }

    function buildActionDefinition(overrides) {
        return {
            id: overrides.id,
            label: overrides.label,
            description: overrides.description,
            layers: overrides.layers || [],
            menuLabel: overrides.menuLabel || overrides.label,
            handler: overrides.handler,
            success: overrides.success || {
                title: overrides.label,
                message: 'הפעולה הושלמה בהצלחה',
                type: 'success'
            },
            error: overrides.error || {
                title: overrides.label,
                message: 'הפעולה נכשלה',
                type: 'error'
            },
            logLayers: overrides.logLayers || overrides.layers || [],
            meta: overrides.meta || {}
        };
    }

    const ACTIONS = {
        'memory': buildActionDefinition({
            id: 'memory',
            label: '🟢 ניקוי Memory',
            description: 'ניקוי שכבת ה-Memory בלבד דרך UnifiedCacheManager',
            layers: ['memory'],
            handler: async (context) => {
                await clearMemoryLayer(context.source);
            },
            success: {
                title: 'ניקוי Memory',
                message: 'שכבת ה-Memory נוקתה בהצלחה',
                type: 'success',
                category: 'system'
            }
        }),
        'local-storage': buildActionDefinition({
            id: 'local-storage',
            label: '🔵 ניקוי Storage',
            description: 'ניקוי localStorage + sessionStorage המנוהלים על ידי המערכת',
            layers: ['localStorage'],
            handler: async (context) => {
                await clearLocalStorageLayer(context.source);
            },
            success: {
                title: 'ניקוי אחסון',
                message: 'אחסון הדפדפן (localStorage/sessionStorage) נוקה בהצלחה',
                type: 'success',
                category: 'system'
            }
        }),
        'indexeddb': buildActionDefinition({
            id: 'indexeddb',
            label: '🗃️ ניקוי IndexedDB',
            description: 'מחיקת מסד UnifiedCacheDB לצורך ניקוי שכבת IndexedDB',
            layers: ['indexedDB'],
            handler: async (context) => {
                await clearIndexedDbLayer(context.source);
            },
            success: {
                title: 'ניקוי IndexedDB',
                message: 'מאגר ה-IndexedDB נוקה בהצלחה',
                type: 'success',
                category: 'system'
            }
        }),
        'full': buildActionDefinition({
            id: 'full',
            label: '🧹 ניקוי מלא + רענון',
            description: 'ניקוי כל שכבות המטמון ורענון קשיח של העמוד (Stage B-Lite)',
            layers: ['memory', 'localStorage', 'indexedDB', 'backend'],
            handler: async (context) => runFullClear(context),
            success: {
                title: 'ניקוי מטמון מלא',
                message: 'כל שכבות המטמון נוקו בהצלחה. מתבצע רענון עמוד.',
                type: 'success',
                category: 'system'
            }
        }),
        'ui-state': buildActionDefinition({
            id: 'ui-state',
            label: '🎛️ ניקוי העדפות UI',
            description: 'ניקוי העדפות UI בלבד (פונקציה כללית מ-unified-cache-manager)',
            layers: ['localStorage'],
            handler: async (context) => {
                if (typeof window.clearUIState === 'function') {
                    await window.clearUIState(context.event);
                    return;
                }
                await clearLocalStorageLayer(context.source);
            },
            success: {
                title: 'העדפות UI',
                message: 'העדפות ה-UI נוקו בהצלחה',
                type: 'success',
                category: 'system'
            }
        }),
        'legacy-full': buildActionDefinition({
            id: 'legacy-full',
            label: '🟠 ניקוי מהיר (Legacy)',
            description: 'קריאה ל-clearAllCacheForDevelopment עבור תאימות לאחור',
            layers: ['memory', 'localStorage', 'indexedDB'],
            handler: async (context) => {
                if (typeof window.clearAllCacheForDevelopment === 'function') {
                    await window.clearAllCacheForDevelopment(context.event);
                    return;
                }
                await runFullClear({ ...context, autoRefresh: false, hardReload: false });
            },
            success: {
                title: 'ניקוי Legacy',
                message: 'הניקוי המהיר הושלם (מצב Legacy)',
                type: 'success',
                category: 'system'
            }
        }),
        'hard-reload': buildActionDefinition({
            id: 'hard-reload',
            label: '🔄 רענון קשיח',
            description: 'רענון קשיח של העמוד תוך ניסיון לעקוף מטמון הדפדפן',
            layers: [],
            handler: async (context) => {
                if (typeof window.hardReload === 'function') {
                    window.hardReload(context.event);
                    return;
                }

                if (context.event) {
                    context.event.preventDefault();
                }

                const url = new URL(window.location.href);
                url.searchParams.set('_cache_bust', Date.now().toString());
                window.location.href = url.toString();
            },
            success: {
                title: 'רענון',
                message: 'הדף מרוענן עם עקיפת מטמון',
                type: 'info',
                category: 'system'
            }
        })
    };

    function getTemplateStyle(submenu) {
        const templateLink = submenu?.querySelector('a');
        return templateLink?.getAttribute('style') || 'display: block; padding: 8px 12px; color: #333; text-decoration: none; font-size: 14px; border-bottom: 1px solid #eee;';
    }

    function createMenuItem({ action, definition, submenu, styleTemplate }) {
        if (!submenu || submenu.querySelector(`[data-cache-action="${action}"]`)) {
            return null;
        }

        const li = document.createElement('li');
        const anchor = document.createElement('a');
        anchor.href = '#';
        anchor.dataset.cacheAction = action;
        anchor.textContent = definition.menuLabel;
        anchor.title = definition.description;
        anchor.setAttribute('style', styleTemplate);
        li.appendChild(anchor);
        submenu.insertBefore(li, submenu.firstChild);
        return anchor;
    }

    function attachHeaderMenu(instance) {
        const headerMenu = document.querySelector(instance.options.headerMenuSelector);
        if (!headerMenu || headerMenu.dataset.cacheMenuInitialized === 'true') {
            return;
        }

        const styleTemplate = getTemplateStyle(headerMenu);

        instance.options.headerActionsOrder.forEach((action) => {
            const definition = CacheControlMenu.getAction(action);
            if (!definition) {
                return;
            }
            const anchor = createMenuItem({ action, definition, submenu: headerMenu, styleTemplate });
            if (anchor) {
                instance.registerButton(anchor, action, { source: 'header-menu' });
            }
        });

        const existingMappings = [
            { selector: 'a[onclick*="clearCacheComplete"]', action: 'full' },
            { selector: 'a[onclick*="clearUIState"]', action: 'ui-state' },
            { selector: 'a[onclick*="clearAllCacheForDevelopment"]', action: 'legacy-full' },
            { selector: 'a[onclick*="hardReload"]', action: 'hard-reload' }
        ];

        existingMappings.forEach(({ selector, action }) => {
            const element = headerMenu.querySelector(selector);
            if (!element) {
                return;
            }
            element.removeAttribute('onclick');
            element.dataset.cacheAction = action;
            instance.registerButton(element, action, { source: 'header-menu' });
        });

        headerMenu.dataset.cacheMenuInitialized = 'true';
    }

    const CacheControlMenu = {
        version: VERSION,
        initialized: false,
        options: { ...DEFAULT_OPTIONS },
        actions: { ...ACTIONS },

        initialize(options = {}) {
            this.options = { ...this.options, ...options };
            if (this.initialized) {
                return this;
            }

            this.initialized = true;
            logger.info('✅ CacheControlMenu initialized', { version: VERSION, options: this.options });

            if (this.options.autoAttachHeader) {
                attachHeaderMenu(this);
            }

            return this;
        },

        ensureInitialized() {
            if (!this.initialized) {
                this.initialize();
            }
        },

        getAction(action) {
            return this.actions[action] || null;
        },

        setAction(action, definition) {
            this.actions[action] = definition;
        },

        registerButton(element, action, overrides = {}) {
            if (!element || !action) {
                return;
            }

            if (element.dataset.cacheBound === 'true') {
                return;
            }

            element.addEventListener('click', (event) => {
                event.preventDefault();
                this.triggerAction(action, { ...overrides, event });
            });

            element.dataset.cacheBound = 'true';
        },

        async triggerAction(action, context = {}) {
            this.ensureInitialized();

            const definition = this.getAction(action);
            if (!definition || typeof definition.handler !== 'function') {
                logger.warn('⚠️ Unknown cache action', { action });
                return { success: false, error: 'Unknown action', action };
            }

            const metadata = {
                action,
                source: context.source || this.options.defaultSource,
                timestamp: new Date().toISOString()
            };

            const runContext = {
                ...context,
                source: metadata.source,
                event: context.event
            };

            const startTime = performance.now();

            try {
                const result = await definition.handler(runContext);
                const durationMs = performance.now() - startTime;

                const successMessage = definition.success || {};
                notify(
                    successMessage.type || 'success',
                    successMessage.title || definition.label,
                successMessage.message || 'הפעולה הושלמה בהצלחה',
                    successMessage.duration || 4000,
                    successMessage.category || 'system'
                );

                this.logAction(action, definition.logLayers, {
                    ...metadata,
                    durationMs,
                    context: {
                        ...definition.meta,
                        ...context.meta,
                        handlerResult: result
                    }
                });

                return { success: true, action, durationMs, result };
            } catch (error) {
                const durationMs = performance.now() - startTime;
                const errorMessage = definition.error || {};

                notify(
                    errorMessage.type || 'error',
                    errorMessage.title || definition.label,
                    `${errorMessage.message || 'הפעולה נכשלה'} (${error?.message || 'שגיאה כללית'})`,
                    errorMessage.duration || 6000,
                    errorMessage.category || 'system'
                );

                logger.error('❌ Cache action failed', { action, error: error?.message, durationMs });

                this.logAction(action, definition.logLayers, {
                    ...metadata,
                    durationMs,
                    error: error?.message || error
                });

                return { success: false, action, error, durationMs };
            }
        },

        async logAction(action, layers = [], metadata = {}) {
            if (!this.options.logEnabled) {
                return;
            }

            const payload = {
                action,
                layers,
                source: metadata.source || this.options.defaultSource,
                timestamp: metadata.timestamp || new Date().toISOString(),
                durationMs: metadata.durationMs,
                context: metadata.context,
                error: metadata.error
            };

            logger.info('🧾 Cache action', payload);

            if (!this.options.logEndpoint) {
                return;
            }

            try {
                await fetch(this.options.logEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    keepalive: true
                });
            } catch (error) {
                logger.warn('⚠️ Failed to send cache log', { action, error: error?.message });
            }
        }
    };

    window.CacheControlMenu = CacheControlMenu;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CacheControlMenu.initialize());
    } else {
        CacheControlMenu.initialize();
    }

    if (window.UnifiedInitializationSystem?.addUtility) {
        window.UnifiedInitializationSystem.addUtility(MODULE_NAME, () => CacheControlMenu.initialize());
    }
})();

