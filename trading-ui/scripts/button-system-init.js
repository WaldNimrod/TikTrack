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
        defaultButtonClass: 'btn-secondary'
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
            color: 'entityTradePlanColor', 
            hover: 'entityTradePlanColorDark' 
        },
        'trade': { 
            color: 'entityTradeColor', 
            hover: 'entityTradeColorDark' 
        },
        'alert': { 
            color: 'entityAlertColor', 
            hover: 'entityAlertColorDark' 
        },
        'note': { 
            color: 'entityNoteColor', 
            hover: 'entityNoteColorDark' 
        },
        'trading_account': { 
            color: 'entityTradingAccountColor', 
            hover: 'entityTradingAccountColorDark' 
        },
        'ticker': { 
            color: 'entityTickerColor', 
            hover: 'entityTickerColorDark' 
        },
        'execution': { 
            color: 'entityExecutionColor', 
            hover: 'entityExecutionColorDark' 
        },
        'cash_flow': { 
            color: 'entityCashFlowColor', 
            hover: 'entityCashFlowColorDark' 
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
        this.debounceTimer = setTimeout(() => {
            this.initializeButtons();
        }, this.config.performance.debounceDelay);
    }

    initializeButtons() {
        this.logger.info('Starting button initialization...');
        const buttonElements = document.querySelectorAll('[data-button-type]');
        const totalButtons = buttonElements.length;
        this.logger.info(`Found ${totalButtons} buttons to process`);

        if (totalButtons === 0) {
            this.logger.info('No buttons found, initialization complete');
            return;
        }

        this.processButtonsInBatches(buttonElements);

        this.performance.endTime = performance.now();
        const duration = this.performance.endTime - this.performance.startTime;
        this.logger.info(`Button initialization completed in ${duration.toFixed(2)}ms`);
        this.logger.info(`Processed: ${this.performance.processedButtons}, Errors: ${this.performance.errors}`);
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
        let variant = element.getAttribute('data-variant');
        const classes = element.getAttribute('data-classes') || '';
        const attributes = element.getAttribute('data-attributes') || '';
        const text = element.getAttribute('data-text') || '';
        const icon = element.getAttribute('data-icon') || '';
        const id = element.getAttribute('data-id') || `btn-${index}`;

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

            let onclickAttr = onClick ? ` onclick='${onClick}'` : '';
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

            return `<button class='btn ${buttonClass}${classes}' data-button-type='${type}' data-button-processed='true'${idAttr}${onclickAttr}${titleAttr}${allAttributes}>${content}</button>`;
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

        let onclickAttr = onClick ? ` onclick='${onClick}'` : '';
        let idAttr = id ? ` id='${id}'` : '';

        // For fallback, always show text (normal variant behavior)
        return `<button class='btn ${buttonClass}${classes}' data-button-type='${type}' data-button-processed='true'${idAttr}${onclickAttr}${allAttributes}>${buttonText}</button>`;
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

// DOM ready handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔘 Button System Init: DOM loaded, system ready');
});

// Module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedButtonSystem;
}
