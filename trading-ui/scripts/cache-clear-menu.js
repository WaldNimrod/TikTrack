/**
 * Cache Control Menu - Stage B-Lite
 * =================================
 * Provides unified cache clearing actions that align with the Stage B-Lite strategy:
 * - Memory-only clear
 * - localStorage clear
 * - IndexedDB clear
 * - Full clear with auto-refresh
 *
 * The module attaches handlers to header menu items via [data-cache-action] attributes
 * and reports each action to the backend cache log API.
 *
 * Related docs:
 * - documentation/03-DEVELOPMENT/CACHE_STAGE_B_LITE.md
 * - documentation/03-DEVELOPMENT/TESTING/CACHE_STAGE_B_LITE_VALIDATION_CHECKLIST.md
 */
(function() {
    'use strict';

    const ACTION_CONFIG = {
        memory: {
            label: 'Memory layer',
            layers: ['memory'],
            description: 'Clears the in-memory cache map only'
        },
        'local-storage': {
            label: 'localStorage layer',
            layers: ['localStorage'],
            description: 'Clears localStorage cache entries (preferences, UI state)'
        },
        indexeddb: {
            label: 'IndexedDB layer',
            layers: ['indexedDB'],
            description: 'Clears IndexedDB cache store'
        },
        full: {
            label: 'Full clear',
            layers: ['memory', 'localStorage', 'indexedDB'],
            description: 'Clears all layers and triggers hard refresh',
            full: true
        }
    };

    const CACHE_LOG_ENDPOINT = '/api/cache/log';

    function showNotification(type, title, message) {
        if (window.NotificationSystem?.showNotification) {
            window.NotificationSystem.showNotification(title, type, {
                description: message,
                autoClose: type === 'success' ? 4 : 6
            });
        } else {
            const logFn = type === 'error' ? 'error' : 'info';
            window.Logger?.[logFn]?.(`${title}: ${message}`, { page: 'cache-clear-menu' });
        }
    }

    function getActiveProfileId() {
        if (window.PreferencesCore?.currentProfileId !== null && window.PreferencesCore?.currentProfileId !== undefined) {
            return window.PreferencesCore.currentProfileId;
        }
        if (window.PreferencesUI?.currentProfileId !== null && window.PreferencesUI?.currentProfileId !== undefined) {
            return window.PreferencesUI.currentProfileId;
        }
        if (window.ProfileManager?.getCurrentProfileId) {
            try {
                return window.ProfileManager.getCurrentProfileId();
            } catch (error) {
                window.Logger?.warn?.('⚠️ Failed to get profile from ProfileManager', error, { page: 'cache-clear-menu' });
            }
        }
        return 'unknown';
    }

    function getActiveUserId() {
        if (window.PreferencesCore?.currentUserId) {
            return window.PreferencesCore.currentUserId;
        }
        if (window.PreferencesUI?.currentUserId) {
            return window.PreferencesUI.currentUserId;
        }
        return 'unknown';
    }

    async function logAction(actionKey, layers, metadata = {}) {
        try {
            const payload = {
                action: actionKey,
                layers,
                stage: 'B-Lite',
                metadata: {
                    ...metadata,
                    profileId: metadata.profileId ?? getActiveProfileId(),
                    userId: metadata.userId ?? getActiveUserId(),
                    page: metadata.page ?? window.location.pathname,
                    triggeredAt: new Date().toISOString()
                }
            };

            const response = await fetch(CACHE_LOG_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
            }
        } catch (error) {
            window.Logger?.warn?.('⚠️ Failed to log cache action', error, { page: 'cache-clear-menu', action: actionKey });
        }
    }

    async function performAction(actionKey) {
        const config = ACTION_CONFIG[actionKey];
        if (!config) {
            window.Logger?.warn?.(`⚠️ Unknown cache action: ${actionKey}`, { page: 'cache-clear-menu' });
            return;
        }

        if (!window.UnifiedCacheManager) {
            showNotification('error', 'ניקוי מטמון נכשל', 'UnifiedCacheManager לא מאותחל במערכת');
            return;
        }

        const profileId = getActiveProfileId();
        const metadata = { profileId };

        try {
            switch (actionKey) {
                case 'memory':
                    await window.UnifiedCacheManager.clear('memory', { source: 'cache-menu' });
                    break;
                case 'local-storage':
                    await window.UnifiedCacheManager.clearAllCache({ layers: ['localStorage'], source: 'cache-menu' });
                    break;
                case 'indexeddb':
                    await window.UnifiedCacheManager.clearAllCache({ layers: ['indexedDB'], source: 'cache-menu' });
                    break;
                case 'full':
                    metadata.autoRefresh = true;
                    await window.UnifiedCacheManager.clearAllCacheDetailed({
                        layers: ['all'],
                        autoRefresh: true,
                        hardReload: true,
                        source: 'cache-menu'
                    });
                    break;
                default:
                    window.Logger?.warn?.(`⚠️ No handler implemented for ${actionKey}`, { page: 'cache-clear-menu' });
                    return;
            }

            showNotification('success', 'ניקוי מטמון הושלם', `בוצע ${config.label}`);
            await logAction(actionKey, config.layers, metadata);
        } catch (error) {
            window.Logger?.error?.('❌ Cache clear action failed', error, { page: 'cache-clear-menu', action: actionKey });
            showNotification('error', 'ניקוי מטמון נכשל', error.message || 'אירעה שגיאה בעת ניקוי המטמון');
            await logAction(`${actionKey}-error`, config.layers, { ...metadata, error: error.message || String(error) });
        }
    }

    async function triggerAction(actionKey, event) {
        if (event) {
            event.preventDefault();
        }
        await performAction(actionKey);
        return false;
    }

    const CacheControlMenu = {
        triggerAction,
        logAction,
        getActiveProfileId
    };

    window.CacheControlMenu = CacheControlMenu;

    // Override legacy global helpers to use the new Stage B-Lite actions
    window.clearCacheForDevelopment = async function(event) {
        return CacheControlMenu.triggerAction('full', event);
    };

    window.clearCacheComplete = async function(event) {
        return CacheControlMenu.triggerAction('full', event);
    };

    window.clearAllCacheForDevelopment = async function(event) {
        return CacheControlMenu.triggerAction('local-storage', event);
    };
})();

