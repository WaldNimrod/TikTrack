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
    static ENTITY_VARIANT_BUTTONS = ['CLOSE', 'ADD', 'LINK', 'SAVE'];

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

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.push(observer);
        this.logger.debug('MutationObserver setup completed');
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

        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['data-entity-type']
        });

        this.observers.push(observer);
        this.logger.debug('Entity observer setup completed');
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
        this.processButtonsInBatches(buttonElements);
        
        this.logger.debug(`processButtons: Completed processing ${totalButtons} buttons in container`);
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
        const id = element.getAttribute('data-id') || `btn-${index}`;

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
            onClick, classes, attributes, text, entityType, size, style, variant
        });

        const newButton = this.createButtonFromData(
            buttonType, onClick, classes, attributes, text, id,
            entityType, size, style, variant, icon
        );

        if (newButton) {
            element.outerHTML = newButton;
            
            // Apply entity colors after creation
            const createdButton = document.getElementById(id);
            if (createdButton && entityType && 
                AdvancedButtonSystem.ENTITY_VARIANT_BUTTONS.includes(buttonType)) {
                this.applyEntityColors(createdButton, entityType);
            }

            // Mark button as processed
            if (createdButton) {
                createdButton.setAttribute('data-button-processed', 'true');
            }

            this.buttons.set(id, {
                type: buttonType, onClick, classes, attributes, text,
                entityType, size, style, variant, processed: true
            });
        }
    }

    createButtonFromData(type, onClick, classes, attributes, text, id,
                         entityType, size, style, variant, iconOverride = '') {
        if (window.BUTTON_ICONS && window.BUTTON_TEXTS && window.getButtonClass) {
            const icon = iconOverride || window.BUTTON_ICONS[type.toUpperCase()] || '';
            const buttonText = text || window.BUTTON_TEXTS[type.toUpperCase()] || '';
            const buttonClass = window.getButtonClass(type);

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
            let titleAttr = buttonText ? ` title='${buttonText}'` : '';
            let idAttr = id ? ` id='${id}'` : '';

            // Set content based on variant
            let content = '';
            if (variant === 'small') {
                content = icon;
            } else if (variant === 'normal') {
                content = buttonText;
            } else if (variant === 'full') {
                content = `${icon} ${buttonText}`.trim();
            } else {
                // Default to normal variant
                content = buttonText;
            }

            return `<button class='btn ${buttonClass}${classes}' data-button-type='${type}' data-button-processed='true'${idAttr}${dataOnclickAttr}${titleAttr}${allAttributes}>${content}</button>`;
        } else {
            this.logger.warn('Button system dependencies not found, using fallback');
            return this.createFallbackButton(type, onClick, classes, attributes, text, id);
        }
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

    addButton(container, type, onClick, classes = '', attributes = '', text = '', id = '', variant = 'normal') {
        const buttonHtml = this.createButtonFromData(type, onClick, classes, attributes, text, id, '', '', variant, '');
        container.insertAdjacentHTML('beforeend', buttonHtml);
        this.logger.debug(`Added dynamic button: ${type}`);
    }

    updateButton(buttonId, type, onClick, classes = '', attributes = '', text = '', variant = 'normal') {
        const element = document.getElementById(buttonId);
        if (element) {
            const newButton = this.createButtonFromData(type, onClick, classes, attributes, text, buttonId, '', '', variant, '');
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

window.addDynamicButton = (container, type, onClick, classes = '', attributes = '', text = '', id = '') => {
    window.advancedButtonSystem.addButton(container, type, onClick, classes, attributes, text, id);
};

window.updateButton = (buttonId, type, onClick, classes = '', attributes = '', text = '') => {
    window.advancedButtonSystem.updateButton(buttonId, type, onClick, classes, attributes, text);
};

window.getButtonSystemStats = () => {
    return window.advancedButtonSystem.getStats();
};

window.processButtons = (container) => {
    return window.advancedButtonSystem.processButtons(container);
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
