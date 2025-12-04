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
            this.basePath = '/trading-ui/images/icons/';
            this.tablerPath = this.basePath + 'tabler/';
            this.entityPath = this.basePath + 'entities/';
            this.defaultIcon = '/trading-ui/images/icons/entities/home.svg';
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
                // Load mappings - retry if not available
                let retries = 0;
                const maxRetries = 5;
                const retryDelay = 100;
                
                while (retries < maxRetries) {
                    if (typeof window.IconMappings !== 'undefined' && window.IconMappings) {
                        // Deep copy to avoid reference issues
                        this.mappings = JSON.parse(JSON.stringify(window.IconMappings));
                        
                        // Verify that buttons mapping exists
                        if (this.mappings.buttons && Object.keys(this.mappings.buttons).length > 0) {
                            if (window.Logger) {
                                window.Logger.debug('✅ IconMappings loaded successfully', { 
                                    buttonsCount: Object.keys(this.mappings.buttons).length,
                                    hasToggle: !!this.mappings.buttons.toggle,
                                    toggleValue: this.mappings.buttons.toggle,
                                    page: 'icon-system' 
                                });
                            }
                            break;
                        } else {
                            // Mappings object exists but buttons is empty or missing
                            if (window.Logger && retries < maxRetries - 1) {
                                window.Logger.warn('⚠️ IconMappings.buttons is empty, retrying...', { 
                                    retry: retries + 1,
                                    mappingsExists: !!this.mappings,
                                    buttonsExists: !!this.mappings.buttons,
                                    windowIconMappingsButtons: window.IconMappings.buttons ? Object.keys(window.IconMappings.buttons) : [],
                                    page: 'icon-system' 
                                });
                            }
                        }
                    }
                    
                    retries++;
                    if (retries < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    }
                }
                
                // Final check - if still no mappings, use empty object
                if (!this.mappings || !this.mappings.buttons || Object.keys(this.mappings.buttons).length === 0) {
                    if (window.Logger) {
                        window.Logger.warn('⚠️ IconMappings.buttons not loaded after retries, using fallback', { 
                            mappingsExists: !!this.mappings,
                            buttonsExists: !!this.mappings?.buttons,
                            windowIconMappingsExists: typeof window.IconMappings !== 'undefined',
                            windowIconMappingsButtons: window.IconMappings?.buttons ? Object.keys(window.IconMappings.buttons) : [],
                            page: 'icon-system' 
                        });
                    }
                    // Try to reload from window.IconMappings one more time
                    if (typeof window.IconMappings !== 'undefined' && window.IconMappings) {
                        this.mappings = window.IconMappings;
                    } else {
                        this.mappings = {};
                    }
                }

                // Check cache availability
                if (typeof window.UnifiedCacheManager !== 'undefined' && window.UnifiedCacheManager.initialized) {
                    this.cacheEnabled = true;
                }

                this.initialized = true;

                return true;
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('❌ Error initializing IconSystem', { error: error.message, stack: error.stack, page: 'icon-system' });
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
            if (type === 'entity' || type === 'entities') {
                // Check if entity mapping exists (should be a path)
                if (this.mappings?.entities && this.mappings.entities[name]) {
                    const mappedPath = this.mappings.entities[name];
                    // If it's already a full path, use it
                    if (mappedPath.startsWith('/')) {
                        iconPath = mappedPath;
                    } else {
                        // Otherwise assume it's in entities/
                        iconPath = `${this.entityPath}${mappedPath}`;
                    }
                } else {
                    // Fallback: try entities/ directory directly
                    iconPath = `${this.entityPath}${name}.svg`;
                }
            } else {
                // For other types (button, category, chart, page), use Tabler Icons
                // Debug: Check if mappings are loaded correctly
                if (window.Logger && name === 'toggle' && type === 'button') {
                    window.Logger.debug('🔍 IconSystem: Looking for toggle mapping', { 
                        type, 
                        name,
                        mappingsExists: !!this.mappings,
                        buttonMappingsExists: !!this.mappings?.buttons,
                        buttonMappingsKeys: this.mappings?.buttons ? Object.keys(this.mappings.buttons) : [],
                        toggleMapping: this.mappings?.buttons?.toggle,
                        windowIconMappingsButtons: window.IconMappings?.buttons ? Object.keys(window.IconMappings.buttons) : [],
                        windowToggleMapping: window.IconMappings?.buttons?.toggle,
                        page: 'icon-system' 
                    });
                }
                
                // Try to get mapping from this.mappings first
                let mapping = this.mappings?.[type]?.[name];
                
                // If mapping not found, try window.IconMappings directly (fallback)
                if (!mapping && typeof window.IconMappings !== 'undefined' && window.IconMappings && window.IconMappings[type] && window.IconMappings[type][name]) {
                    mapping = window.IconMappings[type][name];
                    // Reload this.mappings from window.IconMappings for future calls
                    if (!this.mappings) {
                        this.mappings = {};
                    }
                    if (!this.mappings[type]) {
                        this.mappings[type] = {};
                    }
                    this.mappings[type][name] = mapping;
                    if (window.Logger && name === 'toggle') {
                        window.Logger.debug('✅ Icon mapping found via window.IconMappings fallback', { 
                            type, 
                            name,
                            mapping,
                            page: 'icon-system' 
                        });
                    }
                }
                
                if (mapping) {
                    // Check if it's already a path
                    if (mapping.startsWith('/')) {
                        iconPath = mapping;
                    } else {
                        // Tabler icon name - use the mapped name (e.g., 'chevron-down' for 'toggle')
                        iconPath = `${this.tablerPath}${mapping}.svg`;
                    }
                } else {
                    // No mapping found - try direct Tabler name
                    // Only log warning for toggle to reduce noise
                    if (window.Logger && name === 'toggle') {
                        window.Logger.debug('ℹ️ Icon mapping not found for toggle, using direct name', { 
                            type, 
                            name, 
                            mappingsAvailable: !!this.mappings,
                            buttonMappings: this.mappings?.buttons ? Object.keys(this.mappings.buttons) : [],
                            iconMappingsGlobal: typeof window.IconMappings !== 'undefined',
                            iconMappingsButton: window.IconMappings?.buttons ? Object.keys(window.IconMappings.buttons) : [],
                            page: 'icon-system' 
                        });
                    }
                    iconPath = `${this.tablerPath}${name}.svg`;
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
         * For Tabler Icons: Returns inline SVG to support color customization via CSS
         * For Entity Icons: Returns img tag (entity icons have fixed colors)
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

            // For Entity Icons - use img tag (they have fixed colors)
            if (type === 'entity' || type === 'entities') {
                return `<img src="${path}" width="${size}" height="${size}" alt="${alt}"${className}${style}>`;
            }

            // For Tabler Icons - try to load as inline SVG to support color customization
            // Check if path is a Tabler icon
            if (path && path.includes('/tabler/')) {
                try {
                    const svgContent = await this._loadSVGContent(path);
                    if (svgContent) {
                        // Extract SVG content and modify attributes for inline use
                        const inlineSVG = this._prepareInlineSVG(svgContent, size, alt, className, style);
                        return inlineSVG;
                    }
                } catch (error) {
                    // If loading fails, fallback to img tag
                    if (typeof window.Logger !== 'undefined') {
                    }
                }
            }

            // Fallback to img tag
            return `<img src="${path}" width="${size}" height="${size}" alt="${alt}"${className}${style}>`;
        }

        /**
         * Load SVG file content
         * @private
         * @param {string} path - SVG file path
         * @returns {Promise<string|null>} SVG content or null
         */
        async _loadSVGContent(path) {
            // Try cache first
            const cacheKey = `icon-svg-content:${path}`;
            if (this.cacheEnabled) {
                try {
                    const cached = await window.UnifiedCacheManager.get(cacheKey, {
                        ttl: 60 * 60 * 1000 // 1 hour - SVG content doesn't change often
                    });
                    if (cached) {
                        return cached;
                    }
                } catch (error) {
                    // Cache error - continue without cache
                }
            }

            // Load SVG file via fetch
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    return null;
                }
                const svgContent = await response.text();

                // Cache the content
                if (this.cacheEnabled && svgContent) {
                    try {
                        await window.UnifiedCacheManager.save(cacheKey, svgContent, {
                            ttl: 60 * 60 * 1000 // 1 hour
                        });
                    } catch (error) {
                        // Cache save error - ignore
                    }
                }

                return svgContent;
            } catch (error) {
                return null;
            }
        }

        /**
         * Prepare inline SVG for embedding
         * @private
         * @param {string} svgContent - Raw SVG content
         * @param {string} size - Icon size
         * @param {string} alt - Alt text
         * @param {string} className - CSS classes
         * @param {string} style - Inline styles
         * @returns {string} Prepared inline SVG HTML
         */
        _prepareInlineSVG(svgContent, size, alt, className, style) {
            // Parse SVG using DOMParser
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgContent.trim(), 'image/svg+xml');
            const svgElement = doc.documentElement;

            if (!svgElement) {
                return svgContent; // Return original if parsing fails
            }

            // Set attributes
            svgElement.setAttribute('width', size);
            svgElement.setAttribute('height', size);
            svgElement.setAttribute('aria-label', alt);
            svgElement.setAttribute('role', 'img');
            
            // Add class (preserve existing classes, add icon class)
            const existingClasses = svgElement.getAttribute('class') || '';
            svgElement.setAttribute('class', `icon ${existingClasses} ${className}`.trim());

            // Add style
            if (style) {
                const existingStyle = svgElement.getAttribute('style') || '';
                svgElement.setAttribute('style', `${existingStyle} ${style}`.trim());
            }

            // Ensure currentColor support for Tabler icons
            // Tabler icons already use stroke="currentColor", but we ensure it
            svgElement.setAttribute('fill', 'none');
            svgElement.setAttribute('stroke', 'currentColor');
            
            // Ensure all paths use currentColor
            const paths = svgElement.querySelectorAll('path');
            paths.forEach(path => {
                if (path.getAttribute('stroke') && path.getAttribute('stroke') !== 'none') {
                    path.setAttribute('stroke', 'currentColor');
                }
            });

            return svgElement.outerHTML;
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
            // Normalize pageName (e.g., 'index.html' -> 'index.html' or just 'index')
            const normalizedPageName = pageName.split('/').pop();
            return await this.getIconPath('pages', normalizedPageName);
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

})();

