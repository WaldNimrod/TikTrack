/**
 * Button System Init - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the advanced button system initialization with logging, caching,
 * and performance monitoring for TikTrack button management.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/button-system.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.1
 * Last Updated: 2025-01-27
 * 
 * Changes:
 * - Updated to use data-onclick instead of onclick for event delegation
 * - Buttons now created with data-onclick attribute for centralized event handling
 * - See documentation/frontend/button-system.md and documentation/02-ARCHITECTURE/FRONTEND/EVENT_HANDLER_SYSTEM.md
 */

const BUTTON_SYSTEM_CONFIG = {
    logging: {
        enabled: true,
        level: 'info',
        prefix: '🔘 Button System'
    },
    performance: {
        batchSize: 50,
        debounceDelay: 100,
        cacheEnabled: true
    },
    fallback: {
        enabled: true,
        showErrors: true,
        defaultButtonClass: 'btn'
    }
};

const BUTTON_TOOLTIP_DEBUG_ENABLED = window.ButtonTooltipDebugMode === true;
const buttonTooltipDebugLog = (...args) => {
    // Removed debug logs - button tooltip debug is tracked via Logger if needed
    if (BUTTON_TOOLTIP_DEBUG_ENABLED && window.Logger && Logger.DEBUG_MODE) {
        window.Logger.debug('Button tooltip debug', { args, page: 'button-system' });
    }
};

class ButtonSystemLogger {
    constructor(config) {
        this.config = config;
        this.logs = [];
    }

    log(level, message, data = null) {
        if (!this.config.logging.enabled) return;
        
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        const currentLevel = levels[this.config.logging.level] || 1;
        
        if (levels[level] >= currentLevel) {
            const timestamp = new Date().toISOString();
            const logEntry = { timestamp, level, message, data };
            this.logs.push(logEntry);
            
            const prefix = this.config.logging.prefix;
            const emoji = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌' }[level];
            console[level](`${emoji}${prefix}: ${message}`, data || '');
        }
    }

    debug(message, data) { this.log('debug', message, data); }
    info(message, data) { this.log('info', message, data); }
    warn(message, data) { this.log('warn', message, data); }
    error(message, data) { this.log('error', message, data); }
}

class ButtonSystemCache {
    constructor(config) {
        this.config = config;
        this.cache = new Map();
        this.stats = { hits: 0, misses: 0, size: 0 };
    }

    get(key) {
        if (!this.config.performance.cacheEnabled) return null;
        const value = this.cache.get(key);
        if (value) {
            this.stats.hits++;
            return value;
        }
        this.stats.misses++;
        return null;
    }

    set(key, value) {
        if (!this.config.performance.cacheEnabled) return;
        this.cache.set(key, value);
        this.stats.size = this.cache.size;
    }

    clear() {
        this.cache.clear();
        this.stats.size = 0;
    }

    getStats() {
        return { ...this.stats };
    }
}

class AdvancedButtonSystem {
    constructor(config = BUTTON_SYSTEM_CONFIG) {
        this.config = config;
        this.logger = new ButtonSystemLogger(config);
        this.cache = new ButtonSystemCache(config);
        this.initialized = false;
        this.buttons = new Map();
        this.observers = [];
        this.performance = {
            startTime: null,
            endTime: null,
            processedButtons: 0,
            errors: 0
        };
        
        this.logger.info('Advanced Button System initialized');
        this.init();
    }

    // Entity color mapping
    static ENTITY_COLOR_MAP = {
        'trade_plan': { 
            color: 'entity-trade-plan-color', 
            hover: 'entity-trade-plan-color' 
        },
        'trade': { 
            color: 'entity-trade-color', 
            hover: 'entity-trade-color' 
        },
        'alert': { 
            color: 'entity-alert-color', 
            hover: 'entity-alert-color' 
        },
        'note': { 
            color: 'entity-note-color', 
            hover: 'entity-note-color' 
        },
        'account': { 
            color: 'entity-trading-account-color', 
            hover: 'entity-trading-account-color' 
        },
        'ticker': { 
            color: 'entity-ticker-color', 
            hover: 'entity-ticker-color' 
        },
        'execution': { 
            color: 'entity-execution-color', 
            hover: 'entity-execution-color' 
        },
        'cash_flow': { 
            color: 'entity-cash-flow-color', 
            hover: 'entity-cash-flow-color' 
        },
        'chart': { 
            color: 'entity-trade-color', 
            hover: 'entity-trade-color' 
        },
        'reminder': { 
            color: 'entity-note-color', 
            hover: 'entity-note-color' 
        }
    };

    // Buttons that support entity variants
    static ENTITY_VARIANT_BUTTONS = ['CLOSE', 'ADD', 'LINK', 'SAVE', 'PRIMARY', 'WARNING'];

    init() {
        if (this.initialized) {
            this.logger.warn('System already initialized');
            return;
        }

        this.performance.startTime = performance.now();
        this.logger.info('Starting system initialization...');

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeButtons());
        } else {
            this.initializeButtons();
        }

        this.setupMutationObserver();
        this.setupEntityObserver();
        this.initialized = true;

        this.logger.info('System initialization completed');
    }

    setupMutationObserver() {
        if (!window.MutationObserver) {
            this.logger.warn('MutationObserver not supported');
            return;
        }

        const observer = new MutationObserver((mutations) => {
            let shouldProcess = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.hasAttribute && node.hasAttribute('data-button-type')) {
                                shouldProcess = true;
                            } else if (node.querySelector && node.querySelector('[data-button-type]')) {
                                shouldProcess = true;
                            }
                        }
                    });
                }
            });

            if (shouldProcess) {
                this.logger.debug('New buttons detected, processing...');
                this.debouncedProcessButtons();
            }
        });

        // Wait for document.body to be available
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            this.observers.push(observer);
            this.logger.debug('MutationObserver setup completed');
        } else {
            // Retry after DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    if (document.body) {
                        observer.observe(document.body, {
                            childList: true,
                            subtree: true
                        });
                        this.observers.push(observer);
                        this.logger.debug('MutationObserver setup completed (after DOMContentLoaded)');
                    }
                });
            } else {
                // DOM already loaded but body not available - retry after delay
                setTimeout(() => {
                    if (document.body) {
                        observer.observe(document.body, {
                            childList: true,
                            subtree: true
                        });
                        this.observers.push(observer);
                        this.logger.debug('MutationObserver setup completed (after delay)');
                    }
                }, 100);
            }
        }
    }

    setupEntityObserver() {
        if (!window.MutationObserver) {
            this.logger.warn('MutationObserver not supported for entity colors');
            return;
        }

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'data-entity-type') {
                    const element = mutation.target;
                    const entityType = element.getAttribute('data-entity-type');
                    const buttonType = element.getAttribute('data-button-type');

                    if (entityType && 
                        AdvancedButtonSystem.ENTITY_VARIANT_BUTTONS.includes(buttonType)) {
                        this.applyEntityColors(element, entityType);
                    }
                }
            });
        });

        // Wait for document.body to be available
        if (document.body) {
            observer.observe(document.body, {
                attributes: true,
                subtree: true,
                attributeFilter: ['data-entity-type']
            });
            this.observers.push(observer);
            this.logger.debug('Entity observer setup completed');
        } else {
            // Retry after DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    if (document.body) {
                        observer.observe(document.body, {
                            attributes: true,
                            subtree: true,
                            attributeFilter: ['data-entity-type']
                        });
                        this.observers.push(observer);
                        this.logger.debug('Entity observer setup completed (after DOMContentLoaded)');
                    }
                });
            } else {
                // DOM already loaded but body not available - retry after delay
                setTimeout(() => {
                    if (document.body) {
                        observer.observe(document.body, {
                            attributes: true,
                            subtree: true,
                            attributeFilter: ['data-entity-type']
                        });
                        this.observers.push(observer);
                        this.logger.debug('Entity observer setup completed (after delay)');
                    }
                }, 100);
            }
        }
    }

    debouncedProcessButtons() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(async () => {
            await this.initializeButtons();
        }, this.config.performance.debounceDelay);
    }

    async initializeButtons() {
        // this.logger.info('Starting button initialization...');
        const buttonElements = document.querySelectorAll('[data-button-type]:not([data-button-processed])');
        const totalButtons = buttonElements.length;
        // this.logger.info(`Found ${totalButtons} buttons to process`);

        if (totalButtons === 0) {
            // this.logger.info('No buttons found, initialization complete');
            return;
        }

        // Wait for button icons to be loaded
        await this.waitForButtonIcons();
        
        this.processButtonsInBatches(buttonElements);

        // NOTE: processButtonElement already initializes tooltips for buttons with data-button-type
        // Initialize tooltips ONLY for buttons without data-button-type (custom buttons)
        // This prevents duplication while still supporting custom buttons
        const customButtons = document.body.querySelectorAll('[data-tooltip]:not([data-button-type]):not([data-button-processed])');
        if (customButtons.length > 0) {
            this.logger.debug(`initializeButtons: Found ${customButtons.length} custom buttons (without data-button-type) - initializing tooltips`);
            this.initializeTooltips(document.body);
        }

        this.performance.endTime = performance.now();
        const duration = this.performance.endTime - this.performance.startTime;
        // this.logger.info(`Button initialization completed in ${duration.toFixed(2)}ms`);
        // this.logger.info(`Processed: ${this.performance.processedButtons}, Errors: ${this.performance.errors}`);
    }

    /**
     * Process buttons within a specific container element
     * @param {HTMLElement} container - Container element to search for buttons
     * @async
     */
    async processButtons(container) {
        if (!container) {
            this.logger.warn('processButtons: No container provided');
            return;
        }

        // Find buttons within the container that haven't been processed yet
        const buttonElements = container.querySelectorAll('[data-button-type]:not([data-button-processed])');
        const totalButtons = buttonElements.length;

        if (totalButtons === 0) {
            this.logger.debug(`processButtons: No unprocessed buttons found in container`);
            return;
        }

        this.logger.debug(`processButtons: Found ${totalButtons} buttons to process in container`);

        // Wait for button icons to be loaded
        await this.waitForButtonIcons();
        
        // Process buttons in batches
        // NOTE: processButtonElement already initializes tooltips for buttons with data-button-type
        // So we don't need to call initializeTooltips here - it would cause duplication
        this.processButtonsInBatches(buttonElements);
        
        // Enhance Tabler icons to inline SVG for all processed buttons (async, non-blocking)
        // This allows icons to support dynamic colors via CSS currentColor
        if (window.IconSystem && typeof window.IconSystem.renderIcon === 'function') {
            setTimeout(() => {
                const processedButtons = container.querySelectorAll('[data-button-processed="true"]');
                processedButtons.forEach(button => {
                    this._enhanceButtonIcons(button).catch(err => {
                        // Silently fail - icons will remain as img tags
                        if (this.logger) {
                            this.logger.debug('Icon enhancement failed (non-critical):', err);
                        }
                    });
                });
            }, 100); // Small delay to ensure buttons are in DOM
        }
        
        // Initialize tooltips ONLY for buttons without data-button-type (custom buttons)
        // Buttons with data-button-type are already handled by processButtonElement
        // This is needed for buttons that don't go through processButtonElement (e.g., custom filter buttons)
        const customButtons = container.querySelectorAll('[data-tooltip]:not([data-button-type]):not([data-button-processed])');
        if (customButtons.length > 0) {
            this.logger.debug(`processButtons: Found ${customButtons.length} custom buttons (without data-button-type) - initializing tooltips`);
            this.initializeTooltips(container);
        }
        
        this.logger.debug(`processButtons: Completed processing ${totalButtons} buttons in container`);
    }

    /**
     * Initialize tooltips for buttons in a container
     * Works with buttons that have data-tooltip attribute (with or without data-button-type)
     * @param {HTMLElement} container - Container element to search for buttons with tooltips
     */
    initializeTooltips(container) {
        if (!container) {
            this.logger.warn('initializeTooltips: No container provided');
            return;
        }

        // Wait a bit for DOM to be ready
        requestAnimationFrame(() => {
            setTimeout(() => {
                // Find all buttons with data-tooltip attribute (supports both button system buttons and custom buttons)
                const buttonsWithTooltips = container.querySelectorAll('[data-tooltip]');
                
                if (buttonsWithTooltips.length === 0) {
                    return;
                }

                this.logger.debug(`initializeTooltips: Found ${buttonsWithTooltips.length} buttons with tooltips`);

                buttonsWithTooltips.forEach((button, index) => {
                    // CRITICAL: Verify that the button is actually a descendant of the container
                    // This prevents processing buttons that are outside the intended scope
                    if (!container.contains(button)) {
                        return;
                    }
                    
                    // CRITICAL: Skip buttons that were already processed by processButtonElement
                    // These buttons already have their tooltips initialized and should not be processed again
                    if (button.hasAttribute('data-button-processed')) {
                        return;
                    }
                    
                    // Get tooltip config from data attributes
                    const tooltipText = button.getAttribute('data-tooltip');
                    
                    // NO FALLBACKS - If data-tooltip is empty or missing, skip this button
                    if (!tooltipText || tooltipText.trim() === '') {
                        return;
                    }

                    // Get configuration from data attributes (read-only, don't modify)
                    const config = this._getTooltipConfig(button);
                    
                    if (config) {
                        // CRITICAL: initializeTooltips is only called for buttons WITHOUT data-button-type
                        // So we don't need to check isProcessed here - those buttons are already filtered out
                        // But we still pass false to skipDataTooltipUpdate to allow normal initialization
                        this._initializeTooltip(button, config, false);
                    }
                });
            }, 50);
        });
    }

    async waitForButtonIcons() {
        const maxWaitTime = 1000; // 1 second max (reduced from 5 seconds)
        const checkInterval = 50; // Check every 50ms (faster)
        let elapsed = 0;
        
        while (elapsed < maxWaitTime) {
            if (window.BUTTON_ICONS && window.BUTTON_TEXTS && window.getButtonClass) {
                this.logger.debug('Button icons loaded successfully');
                return true;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }
        
        this.logger.warn('Button icons not loaded within timeout, using fallback');
        return false;
    }

    processButtonsInBatches(buttonElements) {
        const batchSize = this.config.performance.batchSize;
        const totalButtons = buttonElements.length;

        for (let i = 0; i < totalButtons; i += batchSize) {
            const batch = Array.from(buttonElements).slice(i, i + batchSize);
            this.processBatch(batch, i);
        }
    }

    processBatch(batch, startIndex) {
        batch.forEach((element, batchIndex) => {
            const globalIndex = startIndex + batchIndex;
            try {
                this.processButtonElement(element, globalIndex);
                this.performance.processedButtons++;
            } catch (error) {
                this.performance.errors++;
                this.logger.error(`Error processing button ${globalIndex}:`, error);
                if (this.config.fallback.enabled) {
                    this.applyFallbackButton(element);
                }
            }
        });
    }

    processButtonElement(element, index) {
        // Check if button was already processed
        if (element.hasAttribute('data-button-processed')) {
            return;
        }

        const buttonType = element.getAttribute('data-button-type');
        
        // Only process buttons with data-button-type
        // Buttons without data-button-type should only have tooltips initialized via initializeTooltips
        if (!buttonType) {
            this.logger.debug('Skipping button without data-button-type', { elementId: element.id });
            return;
        }

        if (!element.parentNode) {
            this.logger.warn('Skipping button without parent node', {
                elementId: element.id || `anonymous-${index}`,
                buttonType
            });
            return;
        }
        
        const entityType = element.getAttribute('data-entity-type');
        const size = element.getAttribute('data-size');
        const style = element.getAttribute('data-style');
        const onClick = element.getAttribute('data-onclick');
        // console.log(`🔘 Button System: Processing button with data-onclick: "${onClick}"`);
        let variant = element.getAttribute('data-variant');
        const classes = element.getAttribute('data-classes') || '';
        let attributes = element.getAttribute('data-attributes') || '';
        const text = element.getAttribute('data-text') || '';
        const icon = element.getAttribute('data-icon') || '';
        // CRITICAL: Generate unique ID to prevent conflicts
        // If data-id is provided, use it; otherwise create unique ID based on button type and index
        let id = element.getAttribute('data-id');
        if (!id) {
            // Create unique ID: btn-{buttonType}-{index}-{timestamp}
            // This ensures no conflicts even if multiple buttons are processed
            const timestamp = Date.now().toString(36);
            const uniqueIndex = `${index}-${timestamp.slice(-4)}`;
            id = buttonType ? `btn-${buttonType.toLowerCase()}-${uniqueIndex}` : `btn-${uniqueIndex}`;
        }
        
        // CRITICAL: If ID already exists, make it unique by appending timestamp
        if (document.getElementById(id)) {
            const timestamp = Date.now().toString(36);
            id = `${id}-${timestamp.slice(-6)}`;
            this.logger.warn('ID conflict detected, using unique ID', { originalId: element.getAttribute('data-id'), newId: id });
        }

        // CRITICAL: Read tooltip configuration from data attributes BEFORE processing
        // This ensures we get the correct tooltip text from the HTML, not from any cached/stale values
        const originalDataTooltip = element.getAttribute('data-tooltip'); // Store original value
        const isOriginalStatic = element.hasAttribute('data-tooltip-static'); // Check if original was static
        const tooltipConfig = this._getTooltipConfig(element);
        
        // If tooltip config exists and original was static, mark it as static
        if (tooltipConfig && isOriginalStatic) {
            tooltipConfig.static = true;
        }
        
        // CRITICAL: Verify that tooltipConfig.title matches the original data-tooltip from HTML
        // If they don't match, there's a problem - use the original HTML value
        if (tooltipConfig && originalDataTooltip && tooltipConfig.title !== originalDataTooltip) {
            // Use the original HTML value - it's the source of truth
            tooltipConfig.title = originalDataTooltip;
        }

        // Preserve important Bootstrap attributes
        if (element.hasAttribute('data-bs-dismiss')) {
            const dismissValue = element.getAttribute('data-bs-dismiss');
            attributes += ` data-bs-dismiss="${dismissValue}"`;
        }
        
        // Preserve type="button" attribute
        if (element.hasAttribute('type')) {
            const typeValue = element.getAttribute('type');
            attributes += ` type="${typeValue}"`;
        }

        // Set default variant to normal if not specified
        if (!variant || variant === 'default' || variant === '') {
            variant = 'normal';
        }

        this.logger.debug(`Processing button ${index}: ${buttonType}`, {
            onClick,
            classes,
            attributes,
            text,
            entityType,
            size,
            style,
            variant,
            hasTooltip: !!tooltipConfig
        });

        const newButton = this.createButtonFromData(
            buttonType, onClick, classes, attributes, text, id,
            entityType, size, style, variant, icon, tooltipConfig
        );

        if (newButton) {
            // CRITICAL: Double-check that element is still in DOM before modifying outerHTML
            // This prevents NoModificationAllowedError when element was removed by another script
            if (!element.parentNode) {
                this.logger.warn('Skipping outerHTML update - element no longer in DOM', {
                    elementId: element.id || `anonymous-${index}`,
                    buttonType
                });
                return;
            }
            
            element.outerHTML = newButton;
            
            // Apply entity colors after creation
            const createdButton = document.getElementById(id);
            if (createdButton && entityType && 
                AdvancedButtonSystem.ENTITY_VARIANT_BUTTONS.includes(buttonType)) {
                this.applyEntityColors(createdButton, entityType);
            }

            // CRITICAL: Always use the original tooltipConfig from the HTML element (before processing)
            // This ensures we use the correct tooltip text from the HTML, not from any cached/stale values
            if (createdButton && tooltipConfig) {
                // CRITICAL: Always set data-tooltip from the original tooltipConfig (source of truth)
                // Don't re-read from created button - use the original value from HTML
                createdButton.setAttribute('data-tooltip', tooltipConfig.title);
                
                // CRITICAL: If tooltip was defined in HTML (originalDataTooltip exists), mark it as static
                // Static tooltips cannot be changed - they are locked to their original HTML value
                if (originalDataTooltip && originalDataTooltip.trim() !== '') {
                    createdButton.setAttribute('data-tooltip-static', 'true');
                }
                
                // CRITICAL: Verify data-tooltip was set correctly
                const verifyTooltip = createdButton.getAttribute('data-tooltip');
                if (verifyTooltip !== tooltipConfig.title) {
                    // Force set it again
                    createdButton.setAttribute('data-tooltip', tooltipConfig.title);
                }
                
                // Remove data-bs-original-title if it exists - we only use data-tooltip
                if (createdButton.hasAttribute('data-bs-original-title')) {
                    createdButton.removeAttribute('data-bs-original-title');
                }
                
                // Initialize tooltip with correct config
                this._initializeTooltip(createdButton, tooltipConfig);
            }

            // Mark button as processed
            if (createdButton) {
                createdButton.setAttribute('data-button-processed', 'true');
                
                // Enhance Tabler icons to inline SVG for color support
                this._enhanceButtonIcons(createdButton);
            }

            this.buttons.set(id, {
                type: buttonType, onClick, classes, attributes, text,
                entityType, size, style, variant, processed: true, tooltip: tooltipConfig
            });
        }
    }

    /**
     * Enhance button icons - convert img tags to inline SVG for Tabler icons (color support)
     * @private
     * @param {HTMLElement} button - Button element
     */
    async _enhanceButtonIcons(button) {
        if (!button || !window.IconSystem) return;
        
        // Find all img tags with data-icon-enhance="true"
        const iconImages = button.querySelectorAll('img.icon[data-icon-enhance="true"]');
        
        for (const img of iconImages) {
            const iconName = img.getAttribute('data-tabler-icon');
            if (!iconName) continue;
            
            try {
                // Render as inline SVG using IconSystem
                const inlineSVG = await window.IconSystem.renderIcon('button', iconName, {
                    size: img.width || img.getAttribute('width') || '16',
                    alt: img.alt || iconName,
                    class: img.className
                });
                
                // Check if we got inline SVG (not img tag)
                if (inlineSVG && inlineSVG.includes('<svg')) {
                    // Replace img with inline SVG
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(inlineSVG, 'image/svg+xml');
                    const svgElement = doc.documentElement;
                    
                    if (svgElement && svgElement.tagName === 'svg') {
                        img.replaceWith(svgElement);
                    }
                }
            } catch (error) {
                // If enhancement fails, keep img tag (fallback)
                if (this.logger) {
                    this.logger.debug(`Failed to enhance icon ${iconName}:`, error);
                }
            }
        }
    }

    createButtonFromData(type, onClick, classes, attributes, text, id,
                         entityType, size, style, variant, iconOverride = '', tooltipConfig = null) {
        if (window.BUTTON_ICONS && window.BUTTON_TEXTS && window.getButtonClass) {
            // Handle null/undefined type (for custom buttons without data-button-type)
            const typeUpper = type ? type.toUpperCase() : '';
            // Get icon path - Use iconOverride if provided, otherwise try BUTTON_ICONS
            let iconPath = (iconOverride !== undefined && iconOverride !== null && iconOverride !== '') 
                ? iconOverride 
                : (typeUpper && window.BUTTON_ICONS[typeUpper] ? window.BUTTON_ICONS[typeUpper] : '');
            
            // Convert icon path to HTML - use img tag initially, enhance to inline SVG later for Tabler icons
            let icon = '';
            if (iconPath) {
                // Check if this is a Tabler icon (will be enhanced to inline SVG after button creation)
                if (iconPath.includes('/tabler/')) {
                    // Use img tag with data attributes for later enhancement to inline SVG
                    const iconName = iconPath.split('/').pop().replace('.svg', '');
                    icon = `<img src="${iconPath}" width="16" height="16" alt="${typeUpper || 'icon'}" class="icon" data-tabler-icon="${iconName}" data-icon-enhance="true">`;
                } else if (iconPath.startsWith('/') || iconPath.startsWith('http') || iconPath.endsWith('.svg') || iconPath.endsWith('.png') || iconPath.endsWith('.jpg')) {
                    // Entity icon or other - use img tag (entity icons have fixed colors, don't enhance)
                    icon = `<img src="${iconPath}" width="16" height="16" alt="${typeUpper || 'icon'}" class="icon">`;
                } else if (iconPath.startsWith('<img') || iconPath.startsWith('<svg')) {
                    // Already HTML tag (inline SVG or img)
                    icon = iconPath;
                } else {
                    // Assume it's emoji or text
                    icon = iconPath;
                }
            }
            // Use text if provided (even if empty string), otherwise try BUTTON_TEXTS, otherwise empty
            const buttonText = (text !== undefined && text !== null && text !== '') 
                ? text 
                : (typeUpper && window.BUTTON_TEXTS[typeUpper] ? window.BUTTON_TEXTS[typeUpper] : '');
            const buttonClass = type ? window.getButtonClass(type) : 'btn';

            // Set default variant to normal if not specified
            if (!variant || variant === 'default' || variant === '') {
                variant = 'normal';
            }

            let allAttributes = '';
            if (attributes) allAttributes += ' ' + attributes;
            if (entityType) allAttributes += ` data-entity-type='${entityType}'`;
            if (size) allAttributes += ` data-size='${size}'`;
            if (style) allAttributes += ` data-style='${style}'`;
            allAttributes += ` data-variant='${variant}'`;

            // Use data-onclick instead of onclick for event delegation
            let dataOnclickAttr = onClick ? ` data-onclick="${onClick}"` : '';
            
            // Tooltip support: add data-bs-toggle and preserve tooltip attributes
            // NO FALLBACKS - Only add tooltip attributes if tooltipConfig exists
            let tooltipAttrs = '';
            if (tooltipConfig) {
                tooltipAttrs += ` data-bs-toggle="tooltip"`;
                tooltipAttrs += ` data-bs-placement="${tooltipConfig.placement}"`;
                tooltipAttrs += ` data-bs-trigger="${tooltipConfig.trigger}"`;
                if (tooltipConfig.delay) {
                    tooltipAttrs += ` data-bs-delay="${tooltipConfig.delay}"`;
                }
                if (tooltipConfig.html) {
                    tooltipAttrs += ` data-bs-html="true"`;
                }
                if (tooltipConfig.customClass) {
                    tooltipAttrs += ` data-bs-custom-class="${tooltipConfig.customClass}"`;
                }
                if (tooltipConfig.offset) {
                    tooltipAttrs += ` data-bs-offset="${tooltipConfig.offset}"`;
                }
                // CRITICAL: data-tooltip is the single source of truth
                // Bootstrap Tooltip will use title from tooltipOptions, which comes from data-tooltip
                tooltipAttrs += ` data-tooltip="${tooltipConfig.title.replace(/"/g, '&quot;')}"`;
                // If tooltip is static (from HTML), preserve the static flag
                if (tooltipConfig.static) {
                    tooltipAttrs += ` data-tooltip-static="true"`;
                }
            }
            // NO ELSE - If no tooltipConfig, no tooltip attributes are added
            
            let idAttr = id ? ` id='${id}'` : '';

            // Set content based on variant
            let content = '';
            if (variant === 'small') {
                // For small variant, prefer icon, but fallback to text if icon is empty
                // CRITICAL: For TOGGLE buttons, always ensure there's content (icon or fallback emoji)
                if (typeUpper === 'TOGGLE') {
                    // For TOGGLE buttons, use icon if available, otherwise use chevron emoji as fallback
                    content = icon || '▼';
                } else {
                    content = icon || buttonText;
                }
            } else if (variant === 'normal') {
                content = buttonText;
            } else if (variant === 'full') {
                content = `${icon} ${buttonText}`.trim();
            } else {
                // Default to normal variant
                content = buttonText;
            }

            return `<button class='btn ${buttonClass}${classes}' data-button-type='${type}' data-button-processed='true'${idAttr}${dataOnclickAttr}${tooltipAttrs}${allAttributes}>${content}</button>`;
        } else {
            this.logger.warn('Button system dependencies not found, using fallback');
            // CRITICAL: For TOGGLE buttons, ensure fallback has content
            const fallbackButton = this.createFallbackButton(type, onClick, classes, attributes, text, id);
            // If it's a TOGGLE button with small variant and no content, add chevron emoji
            if (type && type.toUpperCase() === 'TOGGLE' && variant === 'small' && !fallbackButton.includes('>') || fallbackButton.match(/>\s*</)) {
                // Replace empty content with chevron emoji
                return fallbackButton.replace(/>\s*</, '>▼<');
            }
            return fallbackButton;
        }
    }

    /**
     * Get default tooltip text for a button type
     * @private
     * @param {string} buttonType - Button type (e.g., 'ADD', 'EDIT', 'VIEW')
     * @param {string} entityType - Entity type (e.g., 'note', 'trade', 'account')
     * @param {string} page - Page name (e.g., 'notes', 'trades')
     * @returns {string|null} Default tooltip text or null if not found
     */
    _getDefaultTooltip(buttonType, entityType = '', page = '') {
        if (!buttonType) {
            return null;
        }
        
        // Try to get page name from current page if not provided
        if (!page) {
            const currentPage = window.location.pathname.split('/').pop()?.replace('.html', '') || '';
            page = currentPage || 'notes'; // Default to 'notes' if can't determine
        }
        
            // First, try to get from BUTTON_TOOLTIPS_CONFIG (page-specific or global defaults)
            if (window.BUTTON_TOOLTIPS_CONFIG && window.getButtonTooltip) {
                const configTooltip = window.getButtonTooltip(page, buttonType, entityType);
                if (configTooltip) {
                    return configTooltip;
                }
            }
            
            // Second, try to get from BUTTON_TEXTS (fallback)
            if (window.BUTTON_TEXTS && window.BUTTON_TEXTS[buttonType.toUpperCase()]) {
                return window.BUTTON_TEXTS[buttonType.toUpperCase()];
            }
            
            return null;
    }

    /**
     * Get tooltip configuration from element data attributes
     * @private
     * @param {HTMLElement} element - Button element
     * @returns {Object|null} Tooltip configuration object or null
     */
    _getTooltipConfig(element) {
        const elementId = element.id || 'unknown';
        const buttonType = element.getAttribute('data-button-type');
        const onClick = element.getAttribute('data-onclick');
        const entityType = element.getAttribute('data-entity-type') || '';
        
        // CRITICAL: Read data-tooltip directly from the element - this is the single source of truth
        // Do NOT use any fallbacks or cached values
        let tooltipText = element.getAttribute('data-tooltip');
        const hasDataTooltip = element.hasAttribute('data-tooltip') && tooltipText && tooltipText.trim() !== '';
        
        // If no data-tooltip, try to get default tooltip (for dynamic buttons)
        if (!hasDataTooltip) {
            // Only try default if button has data-button-type (not for custom buttons)
            if (buttonType) {
                // Try to determine page name from current location
                const currentPage = window.location.pathname.split('/').pop()?.replace('.html', '') || '';
                const defaultTooltip = this._getDefaultTooltip(buttonType, entityType, currentPage);
                
                if (defaultTooltip) {
                    tooltipText = defaultTooltip;
                    // Mark as fallback tooltip
                    element.setAttribute('data-tooltip-fallback', 'true');
                } else {
                    this.logger.debug('Skipping tooltip initialization - no data-tooltip and no default found', { 
                        elementId,
                        buttonType,
                        entityType,
                        onClick
                    });
                    return null;
                }
            } else {
                // No button type and no data-tooltip - skip
                this.logger.debug('Skipping tooltip initialization - no data-tooltip attribute or empty value', { 
                    elementId,
                    buttonType,
                    onClick
                });
                return null;
            }
        }

        const placement = element.getAttribute('data-tooltip-placement') || 'top';
        const trigger = element.getAttribute('data-tooltip-trigger') || 'hover';
        const delay = element.getAttribute('data-tooltip-delay');
        const html = element.getAttribute('data-tooltip-html') === 'true';
        const customClass = element.getAttribute('data-tooltip-class');
        const offset = element.getAttribute('data-tooltip-offset');
        const isFallback = element.hasAttribute('data-tooltip-fallback');

        const config = {
            title: tooltipText,
            placement: placement,
            trigger: trigger,
            delay: delay ? parseInt(delay, 10) : 0,
            html: html,
            customClass: customClass || '',
            offset: offset || '0,0',
            isFallback: isFallback
        };
        
        return config;
    }

    /**
     * Initialize Bootstrap tooltip for a button
     * @private
     * @param {HTMLElement} button - Button element
     * @param {Object} config - Tooltip configuration
     * @param {boolean} skipDataTooltipUpdate - If true, don't update data-tooltip attribute (for already processed buttons)
     */
    _initializeTooltip(button, config, skipDataTooltipUpdate = false) {
        const buttonId = button.id || 'unknown';
        
        // Check if Bootstrap is available
        if (typeof bootstrap === 'undefined' || !bootstrap.Tooltip) {
            this.logger.debug('Bootstrap Tooltip not available, using native title attribute');
            this.logger.warn(`Bootstrap Tooltip not available for button ${buttonId}`);
            return;
        }

        // CRITICAL: Always dispose existing tooltip and create new one with correct text from data-tooltip
        // This ensures we use the correct tooltip text from the HTML, not any stale/cached values
        const existingTooltip = bootstrap.Tooltip.getInstance(button);
        if (existingTooltip) {
            // Always dispose and recreate - don't update in place to ensure correct text
            existingTooltip.dispose();
        }
        
        // CRITICAL: Check if button has static tooltip (from HTML) - these cannot be changed
        const isStaticTooltip = button.hasAttribute('data-tooltip-static');
        if (isStaticTooltip) {
            // For static tooltips, use the existing value from HTML, not the config
            // This ensures static tooltips never change from their original HTML definition
            config.title = button.getAttribute('data-tooltip') || config.title;
        }
        
        // CRITICAL: data-tooltip is the single source of truth
        // Only update it if button wasn't already processed (skipDataTooltipUpdate = false)
        // For already processed buttons, use the existing data-tooltip value
        const currentDataTooltip = button.getAttribute('data-tooltip');
        
        if (!skipDataTooltipUpdate && !isStaticTooltip) {
            // Button not yet processed and not static - update data-tooltip if it doesn't match config
            if (currentDataTooltip !== config.title) {
                button.setAttribute('data-tooltip', config.title);
            }
        } else if (skipDataTooltipUpdate) {
            // Button already processed - check if data-tooltip was changed by something else
            // If it was changed, don't update the tooltip (preserve the original value)
            if (currentDataTooltip !== config.title) {
                // Don't update the tooltip - the button's data-tooltip was changed by something else
                // and we should preserve the original value
                return;
            }
        }
        
        // CRITICAL: Remove data-bs-original-title if it exists - we only use data-tooltip
        if (button.hasAttribute('data-bs-original-title')) {
            button.removeAttribute('data-bs-original-title');
        }

        try {
            // Build Bootstrap tooltip options
            const tooltipOptions = {
                placement: config.placement,
                trigger: config.trigger,
                html: config.html,
                title: config.title
            };

            if (config.delay > 0) {
                tooltipOptions.delay = { show: config.delay, hide: 0 };
            }

            if (config.customClass) {
                tooltipOptions.customClass = config.customClass;
            }

            if (config.offset && config.offset !== '0,0') {
                const [x, y] = config.offset.split(',').map(v => parseInt(v.trim(), 10));
                tooltipOptions.offset = [x || 0, y || 0];
            }

            // Initialize Bootstrap tooltip
            const tooltipInstance = new bootstrap.Tooltip(button, tooltipOptions);
            
            // CRITICAL: After creating tooltip, ensure data-tooltip is still the source of truth
            // Bootstrap may set data-bs-original-title, but we keep data-tooltip as primary
            if (button.getAttribute('data-tooltip') !== config.title) {
                button.setAttribute('data-tooltip', config.title);
            }

            this.logger.debug('Tooltip initialized', {
                buttonId: button.id,
                config: config
            });
        } catch (error) {
            this.logger.warn('Error initializing tooltip', {
                error: error.message,
                buttonId: button.id
            });
            this.logger.error(`Error initializing tooltip for button ${buttonId}:`, error);
        }
    }

    /**
     * Update tooltip text for a button dynamically
     * This is used for buttons that need to change their tooltip based on state (e.g., toggle buttons)
     * @param {HTMLElement|string} button - Button element or button ID
     * @param {string} newText - New tooltip text
     * @param {Object} options - Optional configuration (placement, trigger, etc.)
     * @returns {boolean} True if update was successful, false otherwise
     */
    updateTooltip(button, newText, options = {}) {
        // Resolve button element
        let buttonElement = null;
        if (typeof button === 'string') {
            buttonElement = document.getElementById(button) || document.querySelector(button);
        } else if (button instanceof HTMLElement) {
            buttonElement = button;
        }
        
        if (!buttonElement) {
            this.logger.warn('updateTooltip: Button element not found', { button, newText });
            return false;
        }
        
        const buttonId = buttonElement.id || 'unknown';
        
        // CRITICAL: Check if button has static tooltip - these cannot be changed
        if (buttonElement.hasAttribute('data-tooltip-static')) {
            this.logger.warn('updateTooltip: Cannot update static tooltip', {
                buttonId,
                currentTooltip: buttonElement.getAttribute('data-tooltip'),
                requestedTooltip: newText
            });
            return false;
        }
        
        if (!newText || newText.trim() === '') {
            this.logger.warn('updateTooltip: Empty tooltip text provided', { buttonId });
            return false;
        }
        
        // Update data-tooltip attribute
        buttonElement.setAttribute('data-tooltip', newText);
        
        // Update placement and trigger if provided
        if (options.placement) {
            buttonElement.setAttribute('data-tooltip-placement', options.placement);
        }
        if (options.trigger) {
            buttonElement.setAttribute('data-tooltip-trigger', options.trigger);
        }
        
        // Update Bootstrap Tooltip instance if it exists
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipInstance = bootstrap.Tooltip.getInstance(buttonElement);
                if (tooltipInstance) {
                    // Update existing tooltip
                    tooltipInstance.setContent({ '.tooltip-inner': newText });
                } else {
                // Create new tooltip instance
                const placement = options.placement || buttonElement.getAttribute('data-tooltip-placement') || 'top';
                const trigger = options.trigger || buttonElement.getAttribute('data-tooltip-trigger') || 'hover';
                
                const tooltipOptions = {
                    title: newText,
                    placement: placement,
                    trigger: trigger
                };
                
                if (options.delay) {
                    tooltipOptions.delay = { show: options.delay, hide: 0 };
                }
                
                    try {
                        new bootstrap.Tooltip(buttonElement, tooltipOptions);
                    } catch (error) {
                    this.logger.warn('updateTooltip: Error creating Bootstrap tooltip', {
                        buttonId,
                        error: error.message
                    });
                    return false;
                }
            }
        }
        
        // Update aria-label for accessibility
        buttonElement.setAttribute('aria-label', newText);
        
        this.logger.debug('Tooltip updated successfully', { buttonId, newText });
        return true;
    }

    applyEntityColors(button, entityType) {
        const colors = AdvancedButtonSystem.ENTITY_COLOR_MAP[entityType];
        if (!colors) {
            this.logger.warn(`Unknown entity type: ${entityType}`);
            return;
        }

        // Set CSS variables directly on the button
        button.style.setProperty('--current-entity-color', `var(--${colors.color})`);
        button.style.setProperty('--current-entity-hover', `var(--${colors.hover})`);

        this.logger.debug(`Applied entity colors for ${entityType}`, colors);
    }

    createFallbackButton(type, onClick, classes, attributes, text, id, variant = 'normal') {
        const buttonText = text || type || 'כפתור';
        const buttonClass = this.config.fallback.defaultButtonClass;

        // Set default variant to normal if not specified
        if (!variant || variant === 'default' || variant === '') {
            variant = 'normal';
        }

        let allAttributes = '';
        if (attributes) allAttributes += ' ' + attributes;
        allAttributes += ` data-variant='${variant}'`;

        // Use data-onclick instead of onclick for event delegation
        let dataOnclickAttr = onClick ? ` data-onclick='${onClick}'` : '';
        let idAttr = id ? ` id='${id}'` : '';

        // For fallback, always show text (normal variant behavior)
        return `<button class='btn ${buttonClass}${classes}' data-button-type='${type}' data-button-processed='true'${idAttr}${dataOnclickAttr}${allAttributes}>${buttonText}</button>`;
    }

    applyFallbackButton(element) {
        const type = element.getAttribute('data-button-type') || 'BUTTON';
        const onClick = element.getAttribute('data-onclick') || '';
        const classes = element.getAttribute('data-classes') || '';
        const attributes = element.getAttribute('data-attributes') || '';
        const text = element.getAttribute('data-text') || type;
        const variant = element.getAttribute('data-variant') || 'normal';

        const fallbackButton = this.createFallbackButton(type, onClick, classes, attributes, text, '', variant);
        element.outerHTML = fallbackButton;
    }

    addButton(container, type, onClick, classes = '', attributes = '', text = '', id = '', variant = 'normal', icon = '') {
        const buttonHtml = this.createButtonFromData(type, onClick, classes, attributes, text, id, '', '', variant, icon);
        container.insertAdjacentHTML('beforeend', buttonHtml);
        this.logger.debug(`Added dynamic button: ${type}`);
    }

    updateButton(buttonId, type, onClick, classes = '', attributes = '', text = '', variant = 'normal', icon = '') {
        const element = document.getElementById(buttonId);
        if (element) {
            const newButton = this.createButtonFromData(type, onClick, classes, attributes, text, buttonId, '', '', variant, icon);
            element.outerHTML = newButton;
            this.logger.debug(`Updated button: ${buttonId}`);
        } else {
            this.logger.warn(`Button not found: ${buttonId}`);
        }
    }

    getStats() {
        return {
            performance: { ...this.performance },
            cache: this.cache.getStats(),
            buttons: this.buttons.size,
            observers: this.observers.length
        };
    }

    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.cache.clear();
        this.buttons.clear();
        this.initialized = false;
        this.logger.info('System cleanup completed');
    }
}

// Global instances and functions
window.advancedButtonSystem = new AdvancedButtonSystem();
window.AdvancedButtonSystem = window.advancedButtonSystem; // Main export for monitoring system
window.ButtonSystem = window.advancedButtonSystem; // Alias for compatibility

window.initializeButtons = () => {
    window.advancedButtonSystem.initializeButtons();
};

window.addDynamicButton = (container, type, onClick, classes = '', attributes = '', text = '', id = '', variant = 'normal', icon = '') => {
    window.advancedButtonSystem.addButton(container, type, onClick, classes, attributes, text, id, variant, icon);
};

window.updateButton = (buttonId, type, onClick, classes = '', attributes = '', text = '', variant = 'normal', icon = '') => {
    window.advancedButtonSystem.updateButton(buttonId, type, onClick, classes, attributes, text, variant, icon);
};

window.getButtonSystemStats = () => {
    return window.advancedButtonSystem.getStats();
};

window.processButtons = (container) => {
    return window.advancedButtonSystem.processButtons(container);
};

window.updateTooltip = (button, newText, options) => {
    return window.advancedButtonSystem.updateTooltip(button, newText, options);
};

// Initialize Button System function
window.initializeButtonSystem = async () => {
    try {
        if (window.Logger) {
            window.Logger.info('🔘 Button System: Initializing...', { page: 'button-system' });
        }
        // The system is already initialized in constructor, just ensure buttons are processed
        window.advancedButtonSystem.initializeButtons();
        if (window.Logger) {
            window.Logger.info('🔘 Button System: Initialized successfully', { page: 'button-system' });
        }
        return true;
    } catch (error) {
        if (window.Logger) {
            window.Logger.error('🔘 Button System: Initialization failed:', { page: 'button-system', error: error });
        }
        return false;
    }
};

// DOM ready handler
document.addEventListener('DOMContentLoaded', () => {
    if (window.Logger) {
        window.Logger.info('🔘 Button System Init: DOM loaded, system ready', { page: 'button-system' });
    }
});

// Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedButtonSystem;
}
