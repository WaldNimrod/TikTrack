/**
 * Icon System - TikTrack
 * ======================
 * 
 * מערכת איקונים מרכזית עם תמיכה ב-Tabler Icons ו-Entity Icons מקוריים
 * 
 * Related Documentation:
 * - documentation/frontend/ICON_SYSTEM_GUIDE.md
 * - documentation/frontend/ICON_SYSTEM_ARCHITECTURE.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: 2025-11-23
 */

(function() {
    'use strict';

    /**
     * Icon System Class
     * 
     * מערכת מרכזית לניהול איקונים במערכת
     * - תמיכה ב-17 איקוני ישויות מקוריים (entities/)
     * - תמיכה ב-Tabler Icons (tabler/)
     * - אינטגרציה עם UnifiedCacheManager
     * - Fallback mechanism
     */
    class IconSystem {
        constructor() {
            this.initialized = false;
            this.mappings = null;
            this.cacheEnabled = false;
            this.defaultIcon = '/trading-ui/images/icons/home.svg';
        }

        /**
         * Initialize Icon System
         * @returns {Promise<boolean>}
         */
        async initialize() {
            if (this.initialized) {
                return true;
            }

            try {
                // Load mappings
                if (typeof window.IconMappings !== 'undefined') {
                    this.mappings = window.IconMappings;
                } else {
                    if (typeof window.Logger !== 'undefined') {
                        window.Logger.warn('⚠️ IconMappings not found, using fallback', { page: 'icon-system' });
                    } else {
                        console.warn('⚠️ IconMappings not found, using fallback');
                    }
                    this.mappings = {};
                }

                // Check cache availability
                if (typeof window.UnifiedCacheManager !== 'undefined' && window.UnifiedCacheManager.initialized) {
                    this.cacheEnabled = true;
                }

                this.initialized = true;

                if (typeof window.Logger !== 'undefined') {
                    window.Logger.info('✅ Icon System initialized successfully', { page: 'icon-system' });
                } else {
                    console.log('✅ Icon System initialized successfully');
                }

                return true;
            } catch (error) {
                if (typeof window.Logger !== 'undefined') {
                    window.Logger.error('❌ Failed to initialize Icon System:', error, { page: 'icon-system' });
                } else {
                    console.error('❌ Failed to initialize Icon System:', error);
                }
                return false;
            }
        }

        /**
         * Get icon path with caching
         * @param {string} type - Icon type (entity, button, category, chart, page)
         * @param {string} name - Icon name
         * @param {Object} options - Options
         * @returns {Promise<string>} Icon path
         */
        async getIconPath(type, name, options = {}) {
            if (!this.initialized) {
                await this.initialize();
            }

            const cacheKey = `icon-path:${type}:${name}`;

            // Try cache first
            if (this.cacheEnabled && !options.skipCache) {
                try {
                    const cached = await window.UnifiedCacheManager.get(cacheKey, {
                        ttl: 5 * 60 * 1000 // 5 minutes
                    });
                    if (cached) {
                        return cached;
                    }
                } catch (error) {
                    // Cache error - continue without cache
                }
            }

            // Resolve icon path
            let iconPath = null;

            // Special handling for entities - always check entities/ first
            if (type === 'entity') {
                if (this.mappings.entities && this.mappings.entities[name]) {
                    iconPath = this.mappings.entities[name];
                } else {
                    // Fallback to Tabler
                    const tablerName = this.mappings.entities?.[name] || name;
                    iconPath = `/trading-ui/images/icons/tabler/${tablerName}.svg`;
                }
            } else {
                // For other types, use Tabler Icons
                const mapping = this.mappings[type]?.[name];
                if (mapping) {
                    iconPath = `/trading-ui/images/icons/tabler/${mapping}.svg`;
                }
            }

            // Fallback to default
            if (!iconPath) {
                iconPath = this.defaultIcon;
            }

            // Save to cache
            if (this.cacheEnabled && iconPath !== this.defaultIcon) {
                try {
                    await window.UnifiedCacheManager.save(cacheKey, iconPath, {
                        ttl: 5 * 60 * 1000 // 5 minutes
                    });
                } catch (error) {
                    // Cache save error - ignore
                }
            }

            return iconPath;
        }

        /**
         * Render icon as HTML
         * @param {string} type - Icon type
         * @param {string} name - Icon name
         * @param {Object} options - Options (size, alt, class, etc.)
         * @returns {Promise<string>} HTML string
         */
        async renderIcon(type, name, options = {}) {
            const path = await this.getIconPath(type, name, options);
            const size = options.size || '16';
            const alt = options.alt || name;
            const className = options.class ? ` class="${options.class}"` : '';
            const style = options.style ? ` style="${options.style}"` : '';

            return `<img src="${path}" width="${size}" height="${size}" alt="${alt}"${className}${style}>`;
        }

        /**
         * Get entity icon path
         * Always checks entities/ first, then Tabler
         * @param {string} entityType - Entity type
         * @returns {Promise<string>} Icon path
         */
        async getEntityIcon(entityType) {
            return await this.getIconPath('entity', entityType);
        }

        /**
         * Get button icon path
         * Uses Tabler Icons
         * @param {string} buttonType - Button type
         * @returns {Promise<string>} Icon path
         */
        async getButtonIcon(buttonType) {
            return await this.getIconPath('button', buttonType.toLowerCase());
        }

        /**
         * Get category icon path
         * Uses Tabler Icons
         * @param {string} category - Category name
         * @returns {Promise<string>} Icon path
         */
        async getCategoryIcon(category) {
            return await this.getIconPath('category', category);
        }

        /**
         * Get page icon path
         * Uses Tabler Icons
         * @param {string} pageName - Page name
         * @returns {Promise<string>} Icon path
         */
        async getPageIcon(pageName) {
            return await this.getIconPath('page', pageName);
        }

        /**
         * Get chart icon path
         * Uses Tabler Icons
         * @param {string} chartIcon - Chart icon name
         * @returns {Promise<string>} Icon path
         */
        async getChartIcon(chartIcon) {
            return await this.getIconPath('chart', chartIcon);
        }

        /**
         * Invalidate cache for icon
         * @param {string} type - Icon type
         * @param {string} name - Icon name
         */
        async invalidateCache(type, name) {
            if (!this.cacheEnabled) return;

            const cacheKey = `icon-path:${type}:${name}`;
            try {
                await window.UnifiedCacheManager.remove(cacheKey);
            } catch (error) {
                // Ignore cache errors
            }
        }

        /**
         * Clear all icon cache
         */
        async clearCache() {
            if (!this.cacheEnabled) return;

            try {
                // Clear all icon-* keys from cache
                // This is a simplified version - in production might need more sophisticated clearing
                if (window.UnifiedCacheManager.clearByPattern) {
                    await window.UnifiedCacheManager.clearByPattern('icon-');
                }
            } catch (error) {
                // Ignore cache errors
            }
        }
    }

    // Create singleton instance
    const iconSystem = new IconSystem();

    // Export to global
    window.IconSystem = iconSystem;

    // Auto-initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            iconSystem.initialize().catch(console.error);
        });
    } else {
        iconSystem.initialize().catch(console.error);
    }

    // Log initialization
    if (typeof window.Logger !== 'undefined') {
        window.Logger.info('✅ Icon System loaded successfully', { page: 'icon-system' });
    } else {
        console.log('✅ Icon System loaded successfully');
    }
})();

