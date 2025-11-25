/**
 * Trading Journal Page - Trading journal with calendar view
 * 
 * This file handles the trading journal page functionality for the mockup.
 * 
 * Documentation: See documentation/frontend/JAVASCRIPT_ARCHITECTURE.md
 */

(function() {
    'use strict';

    // Current month and year for calendar navigation
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    /**
     * Initialize Header System
     */
    async function initializeHeader() {
        // Wait for HeaderSystem to be available
        if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
            try {
                await window.HeaderSystem.initialize();
                if (window.Logger) {
                    window.Logger.info('✅ Header System initialized', { page: 'trading-journal-page' });
                }
            } catch (error) {
                if (window.Logger) {
                    window.Logger.error('Error initializing Header System', { 
                        page: 'trading-journal-page', 
                        error 
                    });
                }
            }
        } else {
            // Retry after a short delay if HeaderSystem not loaded yet
            setTimeout(() => {
                if (typeof window.HeaderSystem !== 'undefined' && typeof window.HeaderSystem.initialize === 'function') {
                    window.HeaderSystem.initialize().catch((error) => {
                        if (window.Logger) {
                            window.Logger.error('Error initializing Header System (retry)', { 
                                page: 'trading-journal-page', 
                                error 
                            });
                        }
                    });
                } else {
                    if (window.Logger) {
                        window.Logger.warn('HeaderSystem not available after retry', { page: 'trading-journal-page' });
                    }
                }
            }, 500);
        }
    }

    /**
     * Helper function to get CSS variable value
     * @param {string} variableName - CSS variable name
     * @param {string} fallback - Fallback value
     * @returns {string} CSS variable value or fallback
     */
    function getCSSVariableValue(variableName, fallback) {
        try {
            const value = getComputedStyle(document.documentElement).getPropertyValue(variableName);
            return value && value.trim() ? value.trim() : fallback;
        } catch (error) {
            return fallback;
        }
    }

    /**
     * Replace all <img> tags with IconSystem.renderIcon()
     * @returns {Promise<void>}
     */
    async function replaceIconsWithIconSystem() {
        if (!window.IconSystem || !window.IconSystem.initialized) {
            // Wait for IconSystem to be ready
            if (window.IconSystem && typeof window.IconSystem.initialize === 'function') {
                await window.IconSystem.initialize();
            } else {
                // Retry after delay
                setTimeout(() => replaceIconsWithIconSystem(), 500);
                return;
            }
        }

        // Icon mapping: img src path -> IconSystem type and name
        const iconMappings = {
            // Navigation and page icons
            'link.svg': { type: 'button', name: 'link' },
            'book.svg': { type: 'page', name: 'notebook' },
            'calendar.svg': { type: 'button', name: 'calendar' },
            'list.svg': { type: 'button', name: 'list' },
            
            // Entity icons
            'activity.svg': { type: 'entity', name: 'execution' },
            'cash.svg': { type: 'entity', name: 'cash_flow' },
            'plus-circle.svg': { type: 'button', name: 'plus' },
            'check-circle.svg': { type: 'button', name: 'check' },
            'x-circle.svg': { type: 'button', name: 'x' },
            'note.svg': { type: 'entity', name: 'note' },
            'bell.svg': { type: 'entity', name: 'alert' },
            
            // Meta icons
            'wallet.svg': { type: 'button', name: 'wallet' },
            'database.svg': { type: 'button', name: 'database' },
            'info-circle.svg': { type: 'button', name: 'info-circle' },
            'tag.svg': { type: 'button', name: 'tag' },
            'arrow-left-right.svg': { type: 'button', name: 'arrows-left-right' },
            'currency-dollar.svg': { type: 'button', name: 'currency-dollar' },
            'paperclip.svg': { type: 'button', name: 'paperclip' },
            'check.svg': { type: 'button', name: 'check' }
        };

        // Find all img tags with icon class
        const imgTags = document.querySelectorAll('img.icon, img[src*="icons"]');
        
        for (const img of imgTags) {
            const src = img.getAttribute('src') || '';
            const alt = img.getAttribute('alt') || '';
            const size = img.getAttribute('width') || '16';
            const className = img.getAttribute('class') || 'icon';
            
            // Extract icon name from path
            const iconFileName = src.split('/').pop();
            const mapping = iconMappings[iconFileName];
            
            if (mapping) {
                try {
                    const iconHTML = await window.IconSystem.renderIcon(mapping.type, mapping.name, {
                        size: size,
                        alt: alt,
                        class: className
                    });
                    
                    // Replace img with rendered icon
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = iconHTML;
                    const newIcon = tempDiv.firstElementChild;
                    
                    if (newIcon) {
                        img.parentNode.replaceChild(newIcon, img);
                    }
                } catch (error) {
                    if (window.Logger) {
                        window.Logger.warn('Failed to render icon', { 
                            icon: iconFileName, 
                            error, 
                            page: 'trading-journal-page' 
                        });
                    }
                }
            }
        }
    }

    /**
     * Create dropdown menu for "Add Entry" button
     */
    function createAddEntryDropdown() {
        // Try multiple selectors to find the button
        const addButton = document.getElementById('add-entry-btn') || 
                         document.getElementById('add-entry-button') ||
                         document.querySelector('button[data-button-type="ADD"][id*="add-entry"]') ||
                         document.querySelector('button[data-button-type="ADD"][data-text="הוסף רשומה"]') ||
                         document.querySelector('button[data-button-type="ADD"]');
        
        if (!addButton) {
            if (window.Logger) {
                window.Logger.warn('Add entry button not found', { page: 'trading-journal-page' });
            }
            return;
        }

        // Entity types for journal entries (ordered as requested)
        const entityTypes = [
            { type: 'note', label: 'הערות', icon: 'note' },
            { type: 'alert', label: 'התראות', icon: 'bell' },
            { type: 'execution', label: 'ביצועים', icon: 'activity' },
            { type: 'cash_flow', label: 'תזרימי מזומן', icon: 'cash' },
            { type: 'trade_plan', label: 'תוכנית', icon: 'file-text' },
            { type: 'trade', label: 'טרייד', icon: 'trending-up' }
        ];

        // Create wrapper for dropdown
        const wrapper = document.createElement('div');
        wrapper.className = 'add-entry-dropdown-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';

        // Create dropdown menu
        const dropdown = document.createElement('div');
        dropdown.className = 'add-entry-dropdown-menu';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 4px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            min-width: 200px;
            padding: 8px;
            display: none;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s ease, visibility 0.2s ease;
        `;

        // Create menu items
        entityTypes.forEach(({ type, label, icon }) => {
            const menuItem = document.createElement('button');
            menuItem.className = 'add-entry-menu-item';
            menuItem.setAttribute('data-entity-type', type);
            menuItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 8px 12px;
                border: none;
                background: none;
                text-align: right;
                cursor: pointer;
                font-size: 14px;
                border-radius: 4px;
                transition: background-color 0.2s;
            `;
            
            // Add entity color dynamically
            menuItem.style.setProperty('--entity-type', type);
            
            // Create icon placeholder (will be replaced by IconSystem)
            const iconSpan = document.createElement('span');
            iconSpan.className = 'menu-item-icon';
            iconSpan.setAttribute('data-icon-type', 'entity');
            iconSpan.setAttribute('data-icon-name', type);
            iconSpan.style.width = '16px';
            iconSpan.style.height = '16px';
            iconSpan.style.display = 'inline-block';
            
            const labelSpan = document.createElement('span');
            labelSpan.textContent = label;
            
            menuItem.appendChild(iconSpan);
            menuItem.appendChild(labelSpan);
            
            // Add click handler
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                handleAddEntry(type);
                hideDropdown();
            });
            
            // Add hover effect
            menuItem.addEventListener('mouseenter', () => {
                const entityColor = getCSSVariableValue(`--entity-${type.replace('_', '-')}-color`, '#007bff');
                const entityBg = getCSSVariableValue(`--entity-${type.replace('_', '-')}-bg`, 'rgba(0, 123, 255, 0.1)');
                menuItem.style.backgroundColor = entityBg;
                menuItem.style.color = entityColor;
            });
            
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = '';
                menuItem.style.color = '';
            });
            
            dropdown.appendChild(menuItem);
        });

        // Insert wrapper before button
        addButton.parentNode.insertBefore(wrapper, addButton);
        wrapper.appendChild(addButton);
        wrapper.appendChild(dropdown);

        // Setup hover behavior
        let hoverTimeout = null;
        let hideTimeout = null;

        const showDropdown = () => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            hoverTimeout = setTimeout(() => {
                dropdown.style.display = 'block';
                setTimeout(() => {
                    dropdown.style.opacity = '1';
                    dropdown.style.visibility = 'visible';
                }, 10);
            }, 150);
        };

        const hideDropdown = () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }
            hideTimeout = setTimeout(() => {
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
                setTimeout(() => {
                    dropdown.style.display = 'none';
                }, 200);
            }, 200);
        };

        wrapper.addEventListener('mouseenter', showDropdown);
        wrapper.addEventListener('mouseleave', hideDropdown);
        dropdown.addEventListener('mouseenter', () => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
        });
        dropdown.addEventListener('mouseleave', hideDropdown);

        // Render icons in menu items
        setTimeout(() => renderMenuIcons(), 500);
    }

    /**
     * Render icons in dropdown menu items
     */
    async function renderMenuIcons() {
        if (!window.IconSystem || !window.IconSystem.initialized) {
            setTimeout(() => renderMenuIcons(), 500);
            return;
        }

        const iconSpans = document.querySelectorAll('.menu-item-icon[data-icon-type="entity"]');
        
        for (const span of iconSpans) {
            const entityType = span.getAttribute('data-icon-name');
            if (!entityType) continue;

            try {
                const iconHTML = await window.IconSystem.renderIcon('entity', entityType, {
                    size: '16',
                    alt: entityType,
                    class: 'icon'
                });
                
                span.innerHTML = iconHTML;
            } catch (error) {
                if (window.Logger) {
                    window.Logger.warn('Failed to render menu icon', { 
                        entityType, 
                        error, 
                        page: 'trading-journal-page' 
                    });
                }
            }
        }
    }

    /**
     * Handle add entry action
     * @param {string} entityType - Entity type to add
     */
    function handleAddEntry(entityType) {
        if (window.Logger) {
            window.Logger.info('Add entry clicked', { entityType, page: 'trading-journal-page' });
        }
        
        // TODO: Implement actual add entry functionality
        // For now, just show a notification
        if (typeof window.showNotification === 'function') {
            const entityLabels = {
                'note': 'הערות',
                'alert': 'התראות',
                'execution': 'ביצועים',
                'cash_flow': 'תזרימי מזומן',
                'trade_plan': 'תוכנית',
                'trade': 'טרייד'
            };
            
            window.showNotification(
                `פתיחת טופס הוספת ${entityLabels[entityType] || entityType}`,
                'info',
                'יומן מסחר',
                3000,
                'ui'
            );
        }
    }

    /**
     * Setup month navigation buttons
     */
    function setupMonthNavigation() {
        const prevButton = document.getElementById('prev-month-btn') || document.querySelector('button[data-action="prev-month"]');
        const nextButton = document.getElementById('next-month-btn') || document.querySelector('button[data-action="next-month"]');
        const monthDisplay = document.getElementById('current-month-display') || document.querySelector('.content-section h6.mb-0');

        if (!prevButton || !nextButton || !monthDisplay) {
            if (window.Logger) {
                window.Logger.warn('Month navigation elements not found', { 
                    prevButton: !!prevButton, 
                    nextButton: !!nextButton, 
                    monthDisplay: !!monthDisplay,
                    page: 'trading-journal-page' 
                });
            }
            return;
        }

        // Update month display
        const updateMonthDisplay = () => {
            const monthNames = [
                'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
            ];
            monthDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        };

        // Previous month handler
        prevButton.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateMonthDisplay();
            // TODO: Reload calendar data for new month
            if (window.Logger) {
                window.Logger.info('Previous month clicked', { 
                    month: currentMonth, 
                    year: currentYear, 
                    page: 'trading-journal-page' 
                });
            }
        });

        // Next month handler
        nextButton.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateMonthDisplay();
            // TODO: Reload calendar data for new month
            if (window.Logger) {
                window.Logger.info('Next month clicked', { 
                    month: currentMonth, 
                    year: currentYear, 
                    page: 'trading-journal-page' 
                });
            }
        });

        // Initialize display
        updateMonthDisplay();
    }

    /**
     * Apply dynamic colors to journal entries
     * Colors are now handled by CSS variables, but we ensure they're applied correctly
     */
    function applyDynamicColors() {
        const entries = document.querySelectorAll('.journal-entry-item[data-entry-type]');
        
        entries.forEach(entry => {
            const entityType = entry.getAttribute('data-entry-type');
            if (!entityType) return;

            // CSS variables are already set by color-scheme-system
            // We just ensure the border-left is set (CSS should handle it, but JS ensures it)
            const entityColor = getCSSVariableValue(
                `--entity-${entityType.replace('_', '-')}-color`, 
                '#007bff'
            );

            // Apply to entry border (CSS should handle this, but ensure it's set)
            if (!entry.style.borderLeftWidth) {
                entry.style.borderLeftWidth = '3px';
                entry.style.borderLeftStyle = 'solid';
                entry.style.borderLeftColor = entityColor;
            }
        });
    }

    /**
     * Initialize page
     */
    async function initializePage() {
        // Initialize Header System first
        initializeHeader();
        
        // Wait for Preferences to be loaded
        if (window.PreferencesCore && typeof window.PreferencesCore.initializeWithLazyLoading === 'function') {
            window.PreferencesCore.initializeWithLazyLoading().catch((error) => {
                if (window.Logger) {
                    window.Logger.warn('Preferences initialization failed (non-critical)', { 
                        page: 'trading-journal-page', 
                        error 
                    });
                }
            });
        }

        // Wait for IconSystem and DOM to be ready
        const initAfterLoad = async () => {
            // Wait for Button System to process buttons
            let retries = 0;
            const maxRetries = 10;
            
            const waitForElements = () => {
                const addButton = document.getElementById('add-entry-btn') || 
                                 document.getElementById('add-entry-button') ||
                                 document.querySelector('button[data-button-type="ADD"]');
                const prevButton = document.getElementById('prev-month-btn') || 
                                  document.querySelector('button[data-action="prev-month"]');
                const nextButton = document.getElementById('next-month-btn') || 
                                  document.querySelector('button[data-action="next-month"]');
                
                return !!(addButton && prevButton && nextButton);
            };
            
            // Wait for elements to be available
            while (!waitForElements() && retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 200));
                retries++;
            }
            
            // Replace icons
            await replaceIconsWithIconSystem();
            
            // Create dropdown menu
            createAddEntryDropdown();
            
            // Setup month navigation
            setupMonthNavigation();
            
            // Apply dynamic colors
            applyDynamicColors();
        };

        // Wait a bit for all systems to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initAfterLoad, 500);
            });
        } else {
            setTimeout(initAfterLoad, 500);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        // DOM already loaded
        initializePage();
    }

    // Export functions to window for debugging
    window.tradingJournalPage = {
        getCSSVariableValue,
        initializeHeader,
        replaceIconsWithIconSystem,
        createAddEntryDropdown,
        setupMonthNavigation,
        applyDynamicColors
    };

})();
